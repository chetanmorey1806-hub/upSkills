export default {
  lesson: 'day-14-window-functions-ctes',
  minutes: 40,
  intro: 'Rank rows with ROW_NUMBER, RANK and DENSE_RANK, find top-N per group, compute running totals and LAG/LEAD differences, and write readable CTEs (including a recursive one).',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Salaries in descending order are 90000, 75000, 75000, 60000. What do `ROW_NUMBER()`, `RANK()` and `DENSE_RANK()` (all `OVER (ORDER BY salary DESC)`) give for the **fourth** row (60000)? Type the three numbers separated by spaces in that order.',
      code: `SELECT salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,
  RANK()       OVER (ORDER BY salary DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk
FROM employees;
-- salaries: 90000, 75000, 75000, 60000`,
      expected: '4 4 3',
      explain: 'ROW_NUMBER always counts 1, 2, 3, 4. RANK gives ties the same rank and then **skips** (1, 2, 2, 4). DENSE_RANK gives ties the same rank **without gaps** (1, 2, 2, 3) – the one to use for "Nth highest salary".',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Top 2 per department.** Show `dept`, `name`, `salary` of the 2 highest-paid employees in each department (use `ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)` inside a CTE or subquery).',
      example: { title: 'top-N per group', code: 'WITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY class ORDER BY marks DESC) AS rn\n  FROM students\n)\nSELECT * FROM ranked WHERE rn <= 3;' },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 'IT', 90000), (2, 'Ravi', 'IT', 75000), (3, 'Kiran', 'IT', 61000), (4, 'Neha', 'HR', 52000),
(5, 'Karan', 'HR', 47000), (6, 'Meera', 'HR', 39000), (7, 'Arjun', 'Sales', 58000);`,
      starter: '-- WITH ranked AS (...)\n',
      solution: `WITH ranked AS (
  SELECT dept, name, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn
  FROM employees
)
SELECT dept, name, salary FROM ranked WHERE rn <= 2;`,
      explain: 'PARTITION BY restarts the numbering for each department. Window functions are computed **after** WHERE, so you cannot filter `WHERE ROW_NUMBER() ... <= 2` directly – wrap the query in a CTE/subquery and filter outside.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**Second highest salary** (interview classic): show the distinct second-highest salary as `second_highest` using `DENSE_RANK`.',
      example: { title: 'Nth highest', code: "SELECT DISTINCT marks FROM (\n  SELECT marks, DENSE_RANK() OVER (ORDER BY marks DESC) AS dr FROM students\n) WHERE dr = 3;   -- 3rd highest" },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 90000), (2, 'Ravi', 90000), (3, 'Neha', 75000), (4, 'Karan', 75000), (5, 'Meera', 60000);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT DISTINCT salary AS second_highest FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr FROM employees) t WHERE dr = 2;',
      explain: 'With ties at the top, ROW_NUMBER would wrongly return 90000 again, and RANK would give 75000 rank 3. DENSE_RANK = 2 is exactly "the second-highest distinct value". `SELECT MAX(salary) WHERE salary < (SELECT MAX(salary) ...)` also works for N = 2.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Running total and change.** For daily sales show `sale_date`, `amount`, `running_total` (cumulative SUM ordered by date) and `change` = amount − previous day\'s amount (`LAG`; NULL for the first day). Order by date.',
      example: { title: 'SUM OVER and LAG', code: 'SELECT month, revenue,\n  SUM(revenue) OVER (ORDER BY month) AS ytd,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS mom_change\nFROM monthly;' },
      setup: `CREATE TABLE daily_sales (sale_date TEXT PRIMARY KEY, amount INTEGER);
INSERT INTO daily_sales VALUES ('2024-03-01', 1200), ('2024-03-02', 900), ('2024-03-03', 1500), ('2024-03-04', 1500), ('2024-03-05', 2100);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT sale_date, amount, SUM(amount) OVER (ORDER BY sale_date) AS running_total, amount - LAG(amount) OVER (ORDER BY sale_date) AS change FROM daily_sales ORDER BY sale_date;',
      ordered: true,
      explain: 'Unlike GROUP BY, window functions keep every row and add a computed column. `SUM() OVER (ORDER BY …)` accumulates up to the current row; `LAG(col)` reads the previous row (LEAD the next). The first day has no previous row, so its change is NULL.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Recursive CTE – org chart.** Starting from the CEO (manager_id IS NULL, level 1), list every employee with their `level` in the hierarchy. Show `name`, `level`, ordered by level then name.',
      example: { title: 'recursive CTE', code: 'WITH RECURSIVE nums(n) AS (\n  SELECT 1\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 5\n)\nSELECT n FROM nums;' },
      setup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees VALUES (1, 'Asha', NULL), (2, 'Ravi', 1), (3, 'Neha', 1), (4, 'Karan', 2), (5, 'Meera', 2), (6, 'Arjun', 5);`,
      starter: '-- WITH RECURSIVE org AS (...)\n',
      solution: `WITH RECURSIVE org AS (
  SELECT id, name, 1 AS level FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, o.level + 1 FROM employees e JOIN org o ON e.manager_id = o.id
)
SELECT name, level FROM org ORDER BY level, name;`,
      ordered: true,
      explain: 'A recursive CTE has an **anchor** (the CEO) and a **recursive** part that joins the table to the rows found so far, adding one level per step until no new rows appear. The same pattern builds category trees, bill-of-materials and date series.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why use a CTE (`WITH name AS (...)`) instead of a nested subquery?',
      options: ['CTEs always run faster', 'It gives a step a readable name, can be referenced several times and enables recursion', 'CTEs store their results permanently like a table', 'Subqueries are not allowed in MySQL 8'],
      answer: 1,
      explain: 'A CTE exists only for that one statement – it is not stored like a table or view. Its main benefits are **readability** (top-to-bottom steps), reuse within the query and recursion. Performance is usually similar to the equivalent subquery.',
    },
  ],
};
