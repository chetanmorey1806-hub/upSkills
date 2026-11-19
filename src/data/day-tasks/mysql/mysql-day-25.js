const DATA = `CREATE TABLE faculty (faculty_id INT PRIMARY KEY, name VARCHAR(40), dept VARCHAR(20), salary INT);
CREATE TABLE orders (order_id INT PRIMARY KEY, customer VARCHAR(20), order_date DATE, amount INT);
CREATE TABLE employees (emp_id INT PRIMARY KEY, name VARCHAR(30), manager_id INT);
INSERT INTO faculty VALUES
 (1, 'Dr. Mehta', 'CS', 95000), (2, 'Dr. Rao', 'CS', 82000), (3, 'Ms. Iyer', 'CS', 82000), (4, 'Mr. Das', 'CS', 70000),
 (5, 'Prof. Joshi', 'MECH', 76000), (6, 'Ms. Kapoor', 'MECH', 76000), (7, 'Dr. Nair', 'COMM', 88000), (8, 'Mr. Shah', 'COMM', 60000);
INSERT INTO orders VALUES
 (1, 'Asha', '2024-01-05', 1200), (2, 'Ravi', '2024-01-09', 800), (3, 'Asha', '2024-01-20', 450),
 (4, 'Asha', '2024-02-02', 2300), (5, 'Ravi', '2024-02-15', 1500), (6, 'Neel', '2024-02-20', 999);
INSERT INTO employees VALUES (1, 'Anita', NULL), (2, 'Bharat', 1), (3, 'Chitra', 1), (4, 'Deepak', 2), (5, 'Esha', 4);`;

export default {
  lesson: 'mysql-day-25',
  minutes: 36,
  intro: 'Rank, compare and accumulate rows with window functions, and write readable queries with CTEs, including recursive CTEs.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Salaries 95000, 82000, 82000, 70000 are ranked highest first. What do **RANK()** and **DENSE_RANK()** give to 70000?',
      options: ['RANK 3, DENSE_RANK 3', 'RANK 4, DENSE_RANK 3', 'RANK 3, DENSE_RANK 4', 'RANK 4, DENSE_RANK 4'],
      answer: 1,
      explain: 'Ties share a rank in both. **RANK** then skips numbers (1, 2, 2, **4**), **DENSE_RANK** does not (1, 2, 2, **3**). **ROW_NUMBER** always gives unique numbers 1, 2, 3, 4.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Rank faculty by salary **within each department** (highest = 1) using **DENSE_RANK**. Show `name`, `dept`, `salary`, `dept_rank`. Sort by dept, then dept_rank, then name.',
      example: { title: 'PARTITION BY', code: 'SELECT name, city, sales,\n       RANK() OVER (PARTITION BY city ORDER BY sales DESC) AS city_rank\nFROM agents;' },
      setup: DATA,
      starter: '-- DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)\n',
      solution: 'SELECT name, dept, salary,\n       DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank\nFROM faculty\nORDER BY dept, dept_rank, name;',
      ordered: true,
      explain: '`PARTITION BY dept` restarts the numbering for each department; `ORDER BY salary DESC` inside OVER decides the ranking order. Unlike GROUP BY, every row is kept.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'For each order show `customer`, `order_date`, `amount` and `prev_date` = the date of the **same customer\'s previous order** (NULL for the first). Sort by customer, then order_date.',
      example: { title: 'LAG', code: 'SELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS last_month\nFROM monthly_sales;' },
      setup: DATA,
      starter: '-- LAG(order_date) OVER (PARTITION BY ... ORDER BY ...)\n',
      solution: 'SELECT customer, order_date, amount,\n       LAG(order_date) OVER (PARTITION BY customer ORDER BY order_date) AS prev_date\nFROM orders\nORDER BY customer, order_date;',
      ordered: true,
      explain: '`LAG(col)` reads the previous row of the window, `LEAD(col)` the next one. Partitioning by customer makes "previous" mean the same customer\'s previous order. Add `DATEDIFF(order_date, LAG(order_date) OVER (...))` to get the gap in days.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Show a **running total** of sales over time: `order_date`, `amount`, `running_total` (sum of all amounts up to and including this order). Sort by order_date.',
      example: { title: 'running total', code: 'SELECT txn_date, amount,\n       SUM(amount) OVER (ORDER BY txn_date) AS balance\nFROM wallet;' },
      setup: DATA,
      starter: '-- SUM(amount) OVER (ORDER BY ...)\n',
      solution: 'SELECT order_date, amount,\n       SUM(amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total\nFROM orders\nORDER BY order_date;',
      ordered: true,
      explain: 'An aggregate with `OVER (ORDER BY ...)` becomes cumulative. The default frame is RANGE ... CURRENT ROW, which treats equal dates together; `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` is the exact row-by-row version (both give the same result here because dates are unique).',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Using a **CTE** named `cust_totals`, find customers whose total spending is **above the average customer total**. Show `customer`, `total`.',
      example: { title: 'WITH (CTE)', code: 'WITH city_sales AS (\n  SELECT city, SUM(amount) AS total FROM orders GROUP BY city\n)\nSELECT * FROM city_sales\nWHERE total > 10000;' },
      setup: DATA,
      starter: '-- WITH cust_totals AS (...) SELECT ...\n',
      solution: 'WITH cust_totals AS (\n  SELECT customer, SUM(amount) AS total\n  FROM orders\n  GROUP BY customer\n)\nSELECT customer, total\nFROM cust_totals\nWHERE total > (SELECT AVG(total) FROM cust_totals);',
      explain: 'A CTE is a named temporary result defined with WITH; it can be referenced **more than once** in the main query (here twice), which a derived table cannot do so neatly. Totals: Asha 3950, Ravi 2300, Neel 999 → average 2416.33 → only Asha.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Use a **recursive CTE** to generate all dates from **2024-06-01 to 2024-06-07** in a column `d`.',
      example: { title: 'recursive number series', code: 'WITH RECURSIVE nums AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 10\n)\nSELECT n FROM nums;' },
      setup: DATA,
      starter: '-- WITH RECURSIVE dates AS (...)\n',
      solution: "WITH RECURSIVE dates AS (\n  SELECT DATE('2024-06-01') AS d\n  UNION ALL\n  SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM dates WHERE d < '2024-06-07'\n)\nSELECT d FROM dates;",
      ordered: true,
      explain: 'A recursive CTE has an **anchor** member (the first date) and a **recursive** member that adds one day, joined with UNION ALL. The WHERE stops the recursion; without it MySQL stops at `cte_max_recursion_depth` (1000) with an error.',
    },
  ],
};
