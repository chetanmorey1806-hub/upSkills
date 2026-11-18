const steps = (db) => [
  'Open SSMS and connect to your SQL Server instance (or open the in-app SSMS Lab)',
  'Click New Query (Ctrl+N) on the toolbar',
  'Paste the complete script below',
  `Press F5 (Execute). The script creates the ${db} database; read the Results tab`,
];

const q1 = `CREATE DATABASE RankingDB;
GO
USE RankingDB;
GO
CREATE TABLE Results (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Student NVARCHAR(50) NOT NULL,
    ClassName NVARCHAR(10) NOT NULL,
    Marks INT NOT NULL
);
GO
INSERT INTO Results (Student, ClassName, Marks) VALUES
('Asha', '10A', 95), ('Ravi', '10A', 88), ('Meera', '10A', 88), ('Kiran', '10A', 72),
('John', '10B', 91), ('Sara', '10B', 91), ('Imran', '10B', 85), ('Neha', '10B', 60);
GO
-- ROW_NUMBER vs RANK vs DENSE_RANK over the whole table
SELECT Student, Marks,
       ROW_NUMBER() OVER (ORDER BY Marks DESC, Student) AS RowNum,
       RANK()       OVER (ORDER BY Marks DESC) AS RankNo,
       DENSE_RANK() OVER (ORDER BY Marks DESC) AS DenseRankNo
FROM Results
ORDER BY Marks DESC, Student;
-- PARTITION BY restarts the numbering for each class
SELECT ClassName, Student, Marks,
       DENSE_RANK() OVER (PARTITION BY ClassName ORDER BY Marks DESC) AS ClassRank
FROM Results
ORDER BY ClassName, ClassRank, Student;`;
const q2 = `CREATE DATABASE TopNDB;
GO
USE TopNDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Salary INT NOT NULL
);
GO
INSERT INTO Employees (Name, Department, Salary) VALUES
('Asha', 'IT', 85000), ('Ravi', 'IT', 62000), ('Vikram', 'IT', 91000),
('Meera', 'HR', 48000), ('Kiran', 'HR', 52000),
('John', 'Sales', 40000), ('Sara', 'Sales', 71000), ('Tina', 'Sales', 55000);
GO
-- Top 2 earners per department: number rows inside a CTE, then filter
WITH Ranked AS (
    SELECT Name, Department, Salary,
           ROW_NUMBER() OVER (PARTITION BY Department ORDER BY Salary DESC) AS rn
    FROM Employees
)
SELECT Department, Name, Salary, rn
FROM Ranked
WHERE rn <= 2
ORDER BY Department, rn;
-- Aggregate window functions: compare each salary with its department
SELECT Name, Department, Salary,
       SUM(Salary) OVER (PARTITION BY Department) AS DeptTotal,
       MAX(Salary) OVER (PARTITION BY Department) AS DeptMax,
       Salary * 100 / SUM(Salary) OVER (PARTITION BY Department) AS PctOfDept
FROM Employees
ORDER BY Department, Salary DESC;`;
const q3 = `CREATE DATABASE MonthlySalesDB;
GO
USE MonthlySalesDB;
GO
CREATE TABLE MonthlySales (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Region NVARCHAR(20) NOT NULL,
    SalesMonth DATE NOT NULL,
    Amount INT NOT NULL
);
GO
INSERT INTO MonthlySales (Region, SalesMonth, Amount) VALUES
('North', '2026-01-01', 1000), ('North', '2026-02-01', 1300), ('North', '2026-03-01', 1100), ('North', '2026-04-01', 1600),
('South', '2026-01-01', 800), ('South', '2026-02-01', 950), ('South', '2026-03-01', 1200);
GO
-- LAG = previous row, LEAD = next row, running total with ROWS frame
SELECT Region, SalesMonth, Amount,
       LAG(Amount) OVER (PARTITION BY Region ORDER BY SalesMonth) AS PrevMonth,
       Amount - LAG(Amount, 1, 0) OVER (PARTITION BY Region ORDER BY SalesMonth) AS Growth,
       LEAD(Amount) OVER (PARTITION BY Region ORDER BY SalesMonth) AS NextMonth,
       SUM(Amount) OVER (PARTITION BY Region ORDER BY SalesMonth
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal
FROM MonthlySales
ORDER BY Region, SalesMonth;
-- NTILE splits rows into equal buckets (here: 2 halves by amount)
SELECT Region, SalesMonth, Amount,
       NTILE(2) OVER (ORDER BY Amount DESC) AS Bucket
FROM MonthlySales
ORDER BY Amount DESC;`;

export default {
  id: 'extra-35-window-functions',
  title: 'Window Functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, PARTITION BY',
  module: 'Extra: SQL Server',
  extraNo: 35,
  level: 'Intermediate to Advanced',
  duration: '2.5 hours',
  summary: `Window functions calculate a value for every row using a "window" of related rows - without collapsing rows like GROUP BY does. Learn the OVER clause with PARTITION BY and ORDER BY, ranking functions (ROW_NUMBER, RANK, DENSE_RANK, NTILE), offset functions (LAG, LEAD, FIRST_VALUE, LAST_VALUE), aggregate windows (SUM/AVG/MAX OVER) and frames for running totals, then solve classic interview problems: top N per group, Nth highest salary, month-over-month growth and duplicates.`,
  objectives: [
    'Explain the OVER clause, PARTITION BY and ORDER BY inside a window',
    'Compare ROW_NUMBER, RANK, DENSE_RANK and NTILE on tied values',
    'Use LAG and LEAD to compare a row with previous/next rows',
    'Calculate running totals and group totals with SUM() OVER and window frames',
    'Solve top-N-per-group, Nth highest and de-duplication problems',
  ],
  theory: [
    {
      heading: 'GROUP BY vs window functions',
      content: `**GROUP BY** collapses many rows into one row per group: you can see the department total but lose the individual employees.

A **window function** keeps every row and adds a calculated column computed over a set of rows (the **window**). You can show each employee AND the department total, the rank, the previous month's value, the running total ...

Syntax: function() **OVER** ( [PARTITION BY columns] [ORDER BY columns] [frame] )
- **PARTITION BY** splits rows into groups; the calculation restarts for each group (like GROUP BY but without collapsing).
- **ORDER BY** (inside OVER) defines the order used for ranking, LAG/LEAD and running totals.
- No PARTITION BY = the whole result is one window.

Analogy: in a class photo every student is still visible (rows are kept), but each one holds a card showing their rank in their section (PARTITION BY section ORDER BY marks).`,
      syntax: `SELECT Name, Department, Salary,
       SUM(Salary) OVER (PARTITION BY Department) AS DeptTotal,
       RANK() OVER (PARTITION BY Department ORDER BY Salary DESC) AS DeptRank
FROM Employees;`,
      points: [
        'Window functions are allowed only in SELECT and ORDER BY - not in WHERE, GROUP BY or HAVING',
        'To filter on a window result (e.g. rank = 1), wrap the query in a CTE or derived table',
        'The ORDER BY inside OVER does not sort the output - add a normal ORDER BY at the end',
      ],
    },
    {
      heading: 'Ranking functions: ROW_NUMBER, RANK, DENSE_RANK, NTILE',
      content: `For marks 95, 91, 91, 88:
| Function | Result | Rule |
|---|---|---|
| ROW_NUMBER() | 1, 2, 3, 4 | always unique; ties get arbitrary order unless you add a tie-breaker |
| RANK() | 1, 2, 2, 4 | ties share a rank, then numbers are **skipped** (like sports) |
| DENSE_RANK() | 1, 2, 2, 3 | ties share a rank, **no gaps** |
| NTILE(n) | buckets 1..n | splits rows into n nearly equal groups (quartiles, top 25 percent) |

ORDER BY inside OVER is **required** for ranking functions.

Typical uses: ROW_NUMBER for pagination and removing duplicates; RANK for competitions; DENSE_RANK for "Nth highest salary"; NTILE for percentiles/segments.`,
      syntax: `ROW_NUMBER() OVER (ORDER BY Marks DESC, Student)  -- tie-breaker makes it deterministic
RANK()       OVER (PARTITION BY ClassName ORDER BY Marks DESC)
DENSE_RANK() OVER (ORDER BY Salary DESC)
NTILE(4)     OVER (ORDER BY Amount DESC)`,
    },
    {
      heading: 'Offset functions: LAG, LEAD, FIRST_VALUE, LAST_VALUE',
      content: `- **LAG(col, offset, default)** - value from a previous row (offset 1 by default). NULL (or the default) for the first row.
- **LEAD(col, offset, default)** - value from a following row.
- **FIRST_VALUE(col)** / **LAST_VALUE(col)** - first/last value in the window frame.

They remove the need for self-joins when comparing a row with its neighbours: month-over-month growth, time between two logins, previous order date, next appointment.

Watch out: LAST_VALUE uses the default frame (up to the current row) and therefore often returns the current row. Use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.`,
      syntax: `SELECT SalesMonth, Amount,
       LAG(Amount) OVER (ORDER BY SalesMonth) AS PrevMonth,
       Amount - LAG(Amount, 1, 0) OVER (ORDER BY SalesMonth) AS Growth,
       LEAD(Amount) OVER (ORDER BY SalesMonth) AS NextMonth
FROM MonthlySales;`,
    },
    {
      heading: 'Aggregate window functions and frames (running totals)',
      content: `SUM, AVG, COUNT, MIN and MAX can be used with OVER:
- **SUM(x) OVER (PARTITION BY g)** - group total on every row (percent of total, compare with average).
- **SUM(x) OVER (PARTITION BY g ORDER BY d)** - adding ORDER BY turns it into a **running total**.

A **frame** limits which rows of the partition are used:
- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW - from the first row to this row (running total)
- ROWS BETWEEN 2 PRECEDING AND CURRENT ROW - last 3 rows (3-month moving average)
- ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING - the whole partition

When ORDER BY is present without a frame, SQL Server uses RANGE UNBOUNDED PRECEDING, which treats ties together and is slower; writing ROWS explicitly is recommended.`,
      syntax: `SUM(Amount) OVER (PARTITION BY Region ORDER BY SalesMonth
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal,
AVG(Amount) OVER (ORDER BY SalesMonth
                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS MovingAvg3`,
    },
    {
      heading: 'Classic problems solved with window functions',
      content: `1. **Top N per group**: ROW_NUMBER() OVER (PARTITION BY Dept ORDER BY Salary DESC) in a CTE, then WHERE rn <= N.
2. **Nth highest salary**: DENSE_RANK() OVER (ORDER BY Salary DESC) = N.
3. **Remove duplicates**: ROW_NUMBER() OVER (PARTITION BY Email ORDER BY Id) and delete rn > 1.
4. **Pagination**: ROW_NUMBER() BETWEEN x AND y (OFFSET/FETCH is simpler for plain paging).
5. **Growth / difference**: Amount - LAG(Amount).
6. **Percent of total**: Amount * 100.0 / SUM(Amount) OVER ().
7. **Gaps and islands** (consecutive login days): date minus ROW_NUMBER groups consecutive dates.

These questions appear in almost every SQL interview.`,
    },
  ],
  examples: [
    {
      title: 'ROW_NUMBER vs RANK vs DENSE_RANK, with and without PARTITION BY',
      scenario: 'Rank students of two sections by marks for a school-wide merit list and a section-wise merit list, including tied marks.',
      steps: steps('RankingDB'),
      code: q1,
      tsql: q1,
      result: `+---------+-------+--------+--------+-------------+
| Student | Marks | RowNum | RankNo | DenseRankNo |
+---------+-------+--------+--------+-------------+
| Asha    | 95    | 1      | 1      | 1           |
| John    | 91    | 2      | 2      | 2           |
| Sara    | 91    | 3      | 2      | 2           |
| Meera   | 88    | 4      | 4      | 3           |
| Ravi    | 88    | 5      | 4      | 3           |
| Imran   | 85    | 6      | 6      | 4           |
| Kiran   | 72    | 7      | 7      | 5           |
| Neha    | 60    | 8      | 8      | 6           |
+---------+-------+--------+--------+-------------+
8 row(s) returned

+-----------+---------+-------+-----------+
| ClassName | Student | Marks | ClassRank |
+-----------+---------+-------+-----------+
| 10A       | Asha    | 95    | 1         |
| 10A       | Meera   | 88    | 2         |
| 10A       | Ravi    | 88    | 2         |
| 10A       | Kiran   | 72    | 3         |
| 10B       | John    | 91    | 1         |
| 10B       | Sara    | 91    | 1         |
| 10B       | Imran   | 85    | 2         |
| 10B       | Neha    | 60    | 3         |
+-----------+---------+-------+-----------+
8 row(s) returned`,
      explanation: `John and Sara both have 91: ROW_NUMBER gives 2 and 3 (Student is the tie-breaker), RANK gives both 2 and skips 3 (Meera gets 4), DENSE_RANK gives both 2 and continues with 3. With PARTITION BY ClassName the ranking restarts at 1 for 10A and 10B. In 10B, John and Sara share rank 1 and Imran is 2 because DENSE_RANK has no gaps.`,
    },
    {
      title: 'Top 2 earners per department and department-level comparisons',
      scenario: 'Management wants the two highest-paid employees in every department, and each employee\'s salary compared with the department total and maximum.',
      steps: steps('TopNDB'),
      code: q2,
      tsql: q2,
      result: `+------------+--------+--------+----+
| Department | Name   | Salary | rn |
+------------+--------+--------+----+
| HR         | Kiran  | 52000  | 1  |
| HR         | Meera  | 48000  | 2  |
| IT         | Vikram | 91000  | 1  |
| IT         | Asha   | 85000  | 2  |
| Sales      | Sara   | 71000  | 1  |
| Sales      | Tina   | 55000  | 2  |
+------------+--------+--------+----+
6 row(s) returned

+--------+------------+--------+-----------+---------+-----------+
| Name   | Department | Salary | DeptTotal | DeptMax | PctOfDept |
+--------+------------+--------+-----------+---------+-----------+
| Kiran  | HR         | 52000  | 100000    | 52000   | 52        |
| Meera  | HR         | 48000  | 100000    | 52000   | 48        |
| Vikram | IT         | 91000  | 238000    | 91000   | 38        |
| Asha   | IT         | 85000  | 238000    | 91000   | 35        |
| Ravi   | IT         | 62000  | 238000    | 91000   | 26        |
| Sara   | Sales      | 71000  | 166000    | 71000   | 42        |
| Tina   | Sales      | 55000  | 166000    | 71000   | 33        |
| John   | Sales      | 40000  | 166000    | 71000   | 24        |
+--------+------------+--------+-----------+---------+-----------+
8 row(s) returned`,
      explanation: `ROW_NUMBER numbers employees inside each department by salary; the outer query keeps rn <= 2 (window functions cannot be used directly in WHERE, so a CTE is used). In the second query SUM/MAX OVER (PARTITION BY Department) repeat the department total and maximum on every row without collapsing them. PctOfDept uses integer division, so 91000 x 100 / 238000 = 38 (use 100.0 for decimals).`,
    },
    {
      title: 'LAG, LEAD, running totals and NTILE on monthly sales',
      scenario: 'A sales dashboard needs previous and next month values, month-over-month growth, a running total per region and a split of months into top and bottom halves.',
      steps: steps('MonthlySalesDB'),
      code: q3,
      tsql: q3,
      result: `+--------+------------+--------+-----------+--------+-----------+--------------+
| Region | SalesMonth | Amount | PrevMonth | Growth | NextMonth | RunningTotal |
+--------+------------+--------+-----------+--------+-----------+--------------+
| North  | 2026-01-01 | 1000   | NULL      | 1000   | 1300      | 1000         |
| North  | 2026-02-01 | 1300   | 1000      | 300    | 1100      | 2300         |
| North  | 2026-03-01 | 1100   | 1300      | -200   | 1600      | 3400         |
| North  | 2026-04-01 | 1600   | 1100      | 500    | NULL      | 5000         |
| South  | 2026-01-01 | 800    | NULL      | 800    | 950       | 800          |
| South  | 2026-02-01 | 950    | 800       | 150    | 1200      | 1750         |
| South  | 2026-03-01 | 1200   | 950       | 250    | NULL      | 2950         |
+--------+------------+--------+-----------+--------+-----------+--------------+
7 row(s) returned

+--------+------------+--------+--------+
| Region | SalesMonth | Amount | Bucket |
+--------+------------+--------+--------+
| North  | 2026-04-01 | 1600   | 1      |
| North  | 2026-02-01 | 1300   | 1      |
| South  | 2026-03-01 | 1200   | 1      |
| North  | 2026-03-01 | 1100   | 1      |
| North  | 2026-01-01 | 1000   | 2      |
| South  | 2026-02-01 | 950    | 2      |
| South  | 2026-01-01 | 800    | 2      |
+--------+------------+--------+--------+
7 row(s) returned`,
      explanation: `LAG returns NULL for the first month of each region because there is no previous row inside that partition; LAG(Amount, 1, 0) supplies 0 instead, so Growth for January equals the amount. North March shows -200 (a drop). The ROWS frame adds all rows from the start of the partition to the current one, giving 1000, 2300, 3400, 5000. NTILE(2) splits 7 rows into buckets of 4 and 3 - the first bucket gets the extra row.`,
    },
  ],
  interview: [
    { q: 'What is a window function?', a: 'A function that computes a value for each row over a set of related rows defined by OVER (PARTITION BY ... ORDER BY ...) without grouping rows together.', level: 'Easy' },
    { q: 'Difference between ROW_NUMBER, RANK and DENSE_RANK?', a: 'For ties: ROW_NUMBER gives unique sequential numbers (1,2,3,4); RANK gives equal ranks and skips (1,2,2,4); DENSE_RANK gives equal ranks without gaps (1,2,2,3).', level: 'Easy' },
    { q: 'Difference between PARTITION BY and GROUP BY?', a: 'GROUP BY returns one row per group; PARTITION BY divides rows into groups for a window calculation but keeps all original rows.', level: 'Easy' },
    { q: 'Find the 3rd highest salary.', a: 'WITH s AS (SELECT Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) dr FROM Employees) SELECT DISTINCT Salary FROM s WHERE dr = 3; DENSE_RANK handles duplicate salaries correctly.', level: 'Medium' },
    { q: 'Find the top 2 products by sales in each category.', a: 'Use ROW_NUMBER() OVER (PARTITION BY CategoryId ORDER BY Sales DESC) AS rn in a CTE and filter WHERE rn <= 2 (use RANK/DENSE_RANK to include ties).', level: 'Medium' },
    { q: 'Why can\'t you write WHERE ROW_NUMBER() OVER (...) = 1?', a: 'Window functions are evaluated after WHERE, GROUP BY and HAVING (in the SELECT phase). Wrap the query in a CTE/derived table and filter in the outer query.', level: 'Medium' },
    { q: 'What do LAG and LEAD do?', a: 'LAG returns a value from a previous row and LEAD from a following row in the window order, with optional offset and default value. They replace self-joins for row-to-row comparisons.', level: 'Easy' },
    { q: 'How do you calculate a running total?', a: 'SUM(Amount) OVER (ORDER BY Date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), with PARTITION BY to restart it per group.', level: 'Medium' },
    { q: 'Difference between ROWS and RANGE frames?', a: 'ROWS counts physical rows; RANGE groups rows with the same ORDER BY value (peers) together. RANGE is the default when ORDER BY is given and can produce surprising totals for ties and is slower.', level: 'Hard' },
    { q: 'How do you delete duplicate rows but keep one?', a: 'WITH d AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY Email ORDER BY Id) rn FROM Customers) DELETE FROM d WHERE rn > 1;', level: 'Medium' },
    { q: 'Why does LAST_VALUE often return the current row value?', a: 'With ORDER BY the default frame ends at the current row, so the "last" row of the frame is the current one. Specify ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.', level: 'Hard' },
    { q: 'What does NTILE(4) do with 10 rows?', a: 'It creates 4 groups of sizes 3, 3, 2, 2 - the earlier groups get the extra rows.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Using Results from Example 1, show the topper(s) of each class including ties.',
      hint: 'RANK() OVER (PARTITION BY ClassName ORDER BY Marks DESC) in a CTE, then WHERE rk = 1.',
      solution: `WITH r AS (
    SELECT ClassName, Student, Marks,
           RANK() OVER (PARTITION BY ClassName ORDER BY Marks DESC) AS rk
    FROM Results
)
SELECT ClassName, Student, Marks FROM r WHERE rk = 1 ORDER BY ClassName, Student;
-- 10A Asha 95; 10B John 91; 10B Sara 91`,
    },
    {
      task: 'Using Employees from Example 2, find the second highest salary in each department.',
      hint: 'DENSE_RANK partitioned by Department, filter = 2.',
      solution: `WITH s AS (
    SELECT Department, Name, Salary,
           DENSE_RANK() OVER (PARTITION BY Department ORDER BY Salary DESC) AS dr
    FROM Employees
)
SELECT Department, Name, Salary FROM s WHERE dr = 2 ORDER BY Department;
-- HR Meera 48000; IT Asha 85000; Sales Tina 55000`,
    },
    {
      task: 'Using MonthlySales from Example 3, calculate a 2-month moving average per region.',
      hint: 'AVG(Amount) OVER (PARTITION BY Region ORDER BY SalesMonth ROWS BETWEEN 1 PRECEDING AND CURRENT ROW).',
      solution: `SELECT Region, SalesMonth, Amount,
       AVG(Amount) OVER (PARTITION BY Region ORDER BY SalesMonth
                         ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS MovingAvg2
FROM MonthlySales
ORDER BY Region, SalesMonth;`,
    },
    {
      task: 'Show each region\'s best month and the percentage each month contributes to the region total.',
      hint: 'FIRST_VALUE(SalesMonth) OVER (PARTITION BY Region ORDER BY Amount DESC) and Amount * 100 / SUM(Amount) OVER (PARTITION BY Region).',
      solution: `SELECT Region, SalesMonth, Amount,
       FIRST_VALUE(SalesMonth) OVER (PARTITION BY Region ORDER BY Amount DESC) AS BestMonth,
       Amount * 100 / SUM(Amount) OVER (PARTITION BY Region) AS PctOfRegion
FROM MonthlySales
ORDER BY Region, SalesMonth;`,
    },
    {
      task: 'Paginate students by marks using ROW_NUMBER: return rows 4 to 6.',
      hint: 'Number rows in a CTE, then WHERE rn BETWEEN 4 AND 6.',
      solution: `WITH p AS (
    SELECT Student, Marks, ROW_NUMBER() OVER (ORDER BY Marks DESC, Student) AS rn
    FROM Results
)
SELECT rn, Student, Marks FROM p WHERE rn BETWEEN 4 AND 6;
-- 4 Meera 88; 5 Ravi 88; 6 Imran 85`,
    },
  ],
  quiz: [
    {
      question: 'Marks 90, 85, 85, 80 ordered DESC. What does RANK() give the 80?',
      options: ['3', '4', '2', '5'],
      answer: 1,
      explanation: 'RANK skips after ties: 1, 2, 2, 4.',
    },
    {
      question: 'Same data - what does DENSE_RANK() give the 80?',
      options: ['3', '4', '2', '1'],
      answer: 0,
      explanation: 'DENSE_RANK has no gaps: 1, 2, 2, 3.',
    },
    {
      question: 'What does PARTITION BY do inside OVER?',
      options: ['Sorts the final output', 'Collapses rows into groups', 'Restarts the window calculation for each group while keeping all rows', 'Filters rows'],
      answer: 2,
      explanation: 'It divides rows into independent windows without removing rows.',
    },
    {
      question: 'Which function returns the value from the previous row?',
      options: ['LEAD', 'FIRST_VALUE', 'NTILE', 'LAG'],
      answer: 3,
      explanation: 'LAG looks backwards; LEAD looks forwards.',
    },
    {
      question: 'Where can you NOT use a window function directly?',
      options: ['SELECT list', 'WHERE clause', 'ORDER BY clause', 'Inside a CTE SELECT'],
      answer: 1,
      explanation: 'Window functions are computed after WHERE; filter them in an outer query.',
    },
  ],
};
