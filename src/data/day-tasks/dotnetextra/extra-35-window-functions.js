const EMP = `CREATE TABLE Employees (EmpId INT PRIMARY KEY, Name NVARCHAR(50), Dept NVARCHAR(20), Salary INT);
INSERT INTO Employees VALUES
(1, 'Asha', 'IT', 90000), (2, 'Ravi', 'IT', 75000), (3, 'Meera', 'IT', 75000), (4, 'Kiran', 'IT', 60000),
(5, 'Zoya', 'Sales', 65000), (6, 'Imran', 'Sales', 52000), (7, 'Pooja', 'Sales', 52000), (8, 'Sunil', 'HR', 48000);`;

const SALES = `CREATE TABLE MonthlySales (MonthNo INT PRIMARY KEY, Amount INT);
INSERT INTO MonthlySales VALUES (1, 120000), (2, 95000), (3, 140000), (4, 140000), (5, 110000), (6, 160000);`;

export default {
  lesson: 'extra-35-window-functions',
  minutes: 30,
  intro: 'Rank, number and compare rows without collapsing them using ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD and running totals.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the key difference between `GROUP BY` and a window function like `SUM(Salary) OVER (PARTITION BY Dept)`?',
      options: ['There is none', 'GROUP BY collapses rows into one per group; a window function keeps every row and adds the group value to it', 'Window functions only work on dates', 'PARTITION BY sorts the final result'],
      answer: 1,
      explain: 'A window function calculates over a "window" of related rows but returns a value for **each** row, so you can show an employee\'s salary next to the department total. GROUP BY returns one row per group.',
    },
    {
      type: 'multi',
      mins: 3,
      q: `Salaries in descending order: 90000, 75000, 75000, 65000, … Which values are CORRECT for the employee with **65000**? Select all that apply.`,
      options: ['ROW_NUMBER = 4', 'RANK = 4', 'RANK = 3', 'DENSE_RANK = 3', 'DENSE_RANK = 4'],
      answers: [0, 1, 3],
      explain: 'ROW_NUMBER always counts 1, 2, 3, 4. RANK gives ties the same number and then **skips** (1, 2, 2, 4). DENSE_RANK gives ties the same number **without gaps** (1, 2, 2, 3).',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Show every employee\'s `Name`, `Salary`, `Rnk` (RANK by salary, highest first) and `DenseRnk` (DENSE_RANK by salary, highest first) across the whole company.',
      example: { title: 'ranking syntax', code: `SELECT Name, Marks,
       ROW_NUMBER() OVER (ORDER BY Marks DESC) AS RowNo
FROM Students;` },
      setup: EMP,
      starter: 'SELECT Name, Salary\n-- , RANK() OVER (...) AS Rnk, DENSE_RANK() OVER (...) AS DenseRnk\nFROM Employees;\n',
      solution: 'SELECT Name, Salary,\n       RANK()       OVER (ORDER BY Salary DESC) AS Rnk,\n       DENSE_RANK() OVER (ORDER BY Salary DESC) AS DenseRnk\nFROM Employees;',
      explain: 'Ravi and Meera tie at 75000 (rank 2), so the next salary gets RANK 4 but DENSE_RANK 3. Imran and Pooja tie at 52000: RANK 6 / DENSE_RANK 5, and Sunil gets RANK 8 / DENSE_RANK 6.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: 'Return the **top 2 earners in each department**: columns `Dept`, `Name`, `Salary`. Use `ROW_NUMBER()` with `PARTITION BY Dept`, ordering by `Salary DESC, Name` (so ties are broken alphabetically).',
      example: { title: 'filter on a window function via a CTE', code: `WITH Ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY City ORDER BY Amount DESC) AS rn
    FROM Orders
)
SELECT * FROM Ranked WHERE rn = 1;` },
      setup: EMP,
      starter: 'SELECT Dept, Name, Salary\nFROM Employees;\n-- number rows per department, keep rn <= 2\n',
      solution: 'WITH Ranked AS (\n    SELECT Dept, Name, Salary,\n           ROW_NUMBER() OVER (PARTITION BY Dept ORDER BY Salary DESC, Name) AS rn\n    FROM Employees\n)\nSELECT Dept, Name, Salary FROM Ranked WHERE rn <= 2;',
      explain: 'Window functions cannot be used directly in WHERE, so wrap them in a CTE (or subquery) and filter on `rn`. PARTITION BY restarts numbering for each department. Meera beats Ravi in the tie because of the `Name` tie-breaker; HR has only Sunil.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: 'For each month show `MonthNo`, `Amount`, `Change` (this month minus the previous month, using `LAG`) and `RunningTotal` (cumulative SUM). Order by `MonthNo`.',
      example: { title: 'LAG and running sum', code: `SELECT Day, Visitors,
       LAG(Visitors) OVER (ORDER BY Day) AS PrevDay,
       SUM(Visitors) OVER (ORDER BY Day) AS Cumulative
FROM WebTraffic;` },
      setup: SALES,
      starter: 'SELECT MonthNo, Amount\nFROM MonthlySales\nORDER BY MonthNo;\n',
      solution: 'SELECT MonthNo, Amount,\n       Amount - LAG(Amount) OVER (ORDER BY MonthNo) AS Change,\n       SUM(Amount) OVER (ORDER BY MonthNo) AS RunningTotal\nFROM MonthlySales\nORDER BY MonthNo;',
      ordered: true,
      explain: '`LAG(Amount)` reads the previous row\'s amount (NULL for month 1, so Change is NULL). `SUM(...) OVER (ORDER BY MonthNo)` adds up all rows so far: 120000, 215000, 355000, … 765000. `LEAD` would look at the next row instead.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Split students into **4** equal groups (quartiles) by marks. Complete the function:
\`SELECT Name, ______ OVER (ORDER BY Marks DESC) AS Quartile FROM Students;\``,
      example: { title: 'buckets', code: 'NTILE(10) OVER (ORDER BY Score DESC) AS Decile' },
      accept: ['NTILE(4)'],
      acceptRegex: ['^NTILE\\s*\\(\\s*4\\s*\\)$'],
      explain: '`NTILE(n)` divides the ordered rows into n buckets numbered 1..n as evenly as possible. With 10 rows and NTILE(4) the groups have 3, 3, 2, 2 rows.',
    },
  ],
};
