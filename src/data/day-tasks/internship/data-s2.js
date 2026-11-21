const SETUP = `CREATE TABLE stores (id INTEGER PRIMARY KEY, name TEXT, city TEXT, region TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL);
CREATE TABLE sales (id INTEGER PRIMARY KEY, store_id INTEGER, product_id INTEGER, qty INTEGER, sale_date TEXT);
INSERT INTO stores VALUES (1, 'BM-Kothrud', 'Pune', 'West'), (2, 'BM-Andheri', 'Mumbai', 'West'), (3, 'BM-Indiranagar', 'Bengaluru', 'South'), (4, 'BM-Wakad', 'Pune', 'West'), (5, 'BM-Mysuru Road', 'Mysuru', 'South');
INSERT INTO products VALUES (1, 'Basmati Rice 5kg', 'Grocery', 689), (2, 'Toor Dal 1kg', 'Grocery', 165), (3, 'LED Bulb 9W', 'Electronics', 99), (4, 'Mixer Grinder', 'Electronics', 2999), (5, 'Steel Bottle', 'Home', 349), (6, 'Bedsheet Double', 'Home', 899);
INSERT INTO sales VALUES
(1, 1, 1, 10, '2024-04-03'), (2, 1, 2, 25, '2024-04-05'), (3, 2, 4, 3, '2024-04-07'), (4, 3, 3, 40, '2024-04-10'),
(5, 2, 1, 12, '2024-04-18'), (6, 4, 5, 15, '2024-04-22'), (7, 3, 6, 6, '2024-05-02'), (8, 1, 4, 2, '2024-05-04'),
(9, 2, 2, 30, '2024-05-09'), (10, 4, 1, 8, '2024-05-15'), (11, 3, 4, 4, '2024-05-20'), (12, 2, 6, 5, '2024-05-28'),
(13, 1, 3, 20, '2024-06-01'), (14, 4, 2, 18, '2024-06-06'), (15, 3, 1, 9, '2024-06-11'), (16, 2, 5, 10, '2024-06-19');`;

export default {
  lesson: 'data-s2',
  minutes: 50,
  intro: 'Sprint 2 at BazaarMart: answer regional managers\' questions on the sales database with joins, grouping, HAVING and monthly trends (SQLite).',
  tasks: [
    {
      type: 'code',
      lang: 'sql',
      mins: 8,
      q: '**BM-201 · Task · Medium** Top 3 products by revenue\n\nThe category team wants the **3 products with the highest revenue** (revenue = `qty × price`).\n\nAcceptance criteria:\n- Columns: `product` (product name), `revenue`\n- Highest revenue first; return only 3 rows',
      example: { title: 'join + group + order', code: 'SELECT s.name AS store, SUM(x.qty) AS units\nFROM sales x\nJOIN stores s ON s.id = x.store_id\nGROUP BY s.id\nORDER BY units DESC\nLIMIT 2;' },
      setup: SETUP,
      starter: 'SELECT * FROM products;',
      solution: 'SELECT p.name AS product, SUM(s.qty * p.price) AS revenue FROM sales s JOIN products p ON p.id = s.product_id GROUP BY p.id ORDER BY revenue DESC LIMIT 3;',
      ordered: true,
      explain: 'Review: revenue must be computed **per sale row** (`qty * price`) and then summed; `SUM(qty) * price` only works by accident when there is one price per product. Group by the product **id** (not just the name) because two products can share a name. `ORDER BY ... DESC LIMIT 3` gives the top 3.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 9,
      q: '**BM-202 · Bug · High** Revenue by store is missing stores\n\nThe store report shows only 4 stores, but BazaarMart has 5. The new store **BM-Mysuru Road** has no sales yet and disappears.\n\nAcceptance criteria:\n- Columns: `store`, `city`, `revenue`\n- **Every** store appears; stores without sales show revenue `0` (not NULL)\n- Order by `revenue` descending',
      example: { title: 'keep rows without matches', code: 'SELECT c.name, COUNT(o.id) AS orders\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nGROUP BY c.id;' },
      setup: SETUP,
      starter: 'SELECT st.name AS store, st.city, SUM(s.qty * p.price) AS revenue\nFROM stores st\nJOIN sales s ON s.store_id = st.id\nJOIN products p ON p.id = s.product_id\nGROUP BY st.id\nORDER BY revenue DESC;',
      solution: 'SELECT st.name AS store, st.city, COALESCE(SUM(s.qty * p.price), 0) AS revenue FROM stores st LEFT JOIN sales s ON s.store_id = st.id LEFT JOIN products p ON p.id = s.product_id GROUP BY st.id ORDER BY revenue DESC;',
      ordered: true,
      explain: 'Review: an INNER JOIN drops stores with no matching sales. Use LEFT JOIN from `stores` and keep the **second** join a LEFT JOIN too, otherwise it filters the NULL rows out again. `SUM` over no rows is NULL, so wrap it in `COALESCE(..., 0)` for a clean report.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 8,
      q: '**BM-203 · Task · Medium** Monthly revenue trend\n\nFinance wants revenue per month for Q1 of the financial year (April-June 2024).\n\nAcceptance criteria:\n- Columns: `month` in `YYYY-MM` format, `revenue`\n- One row per month, oldest month first',
      example: { title: 'group by month in SQLite', code: "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders\nFROM orders\nGROUP BY month\nORDER BY month;" },
      setup: SETUP,
      starter: 'SELECT sale_date, qty FROM sales;',
      solution: "SELECT strftime('%Y-%m', s.sale_date) AS month, SUM(s.qty * p.price) AS revenue FROM sales s JOIN products p ON p.id = s.product_id GROUP BY month ORDER BY month;",
      ordered: true,
      explain: "Review: `strftime('%Y-%m', date)` (or `substr(sale_date, 1, 7)`) turns each date into its month so GROUP BY can collapse days into months. Store dates as ISO text (YYYY-MM-DD) so they sort correctly; a format like 03-04-2024 would sort and group wrongly.",
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 8,
      q: '**BM-204 · Task · Medium** High-performing West stores\n\nThe West regional head wants West stores whose revenue is **above ₹15,000**.\n\nAcceptance criteria:\n- Columns: `store`, `revenue`\n- Only `region = \'West\'`\n- Only stores with revenue > 15000\n- Order by `revenue` descending',
      example: { title: 'WHERE vs HAVING', code: "SELECT category, SUM(price) AS total\nFROM products\nWHERE price > 100        -- filters rows\nGROUP BY category\nHAVING SUM(price) > 1000 -- filters groups\nORDER BY total DESC;" },
      setup: SETUP,
      starter: "SELECT st.name AS store FROM stores st WHERE st.region = 'West';",
      solution: "SELECT st.name AS store, SUM(s.qty * p.price) AS revenue FROM stores st JOIN sales s ON s.store_id = st.id JOIN products p ON p.id = s.product_id WHERE st.region = 'West' GROUP BY st.id HAVING SUM(s.qty * p.price) > 15000 ORDER BY revenue DESC;",
      ordered: true,
      explain: 'Review: `WHERE` filters **rows before** grouping (region), `HAVING` filters **groups after** aggregation (total revenue). Putting `SUM(...) > 15000` in WHERE is an error because the sum does not exist yet. Filtering the region in WHERE also makes the query faster because fewer rows are grouped.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '**BM-205 · Task · Low** Review comment on SELECT *\n\nYour PR for the store report uses `SELECT *` in the final query. The reviewer asks you to list the columns. Why?',
      options: [
        'SELECT * is not valid SQL in SQLite',
        'Explicit columns make the report stable (a new column in the table will not break or change the output), document what is used and move less data',
        'SELECT * always returns rows in random order',
        'Reviewers just prefer longer queries',
      ],
      answer: 1,
      explain: 'Review: `SELECT *` couples your report to the current table shape. When the data team adds a column, dashboards and exports built on `*` change silently. Naming columns (with clear aliases like `revenue`) is self-documenting and reads less data.',
    },
    {
      type: 'fill',
      mins: 2,
      q: '**BM-206 · Task · Low** Ticket status\n\nYou finished the query for BM-204, saved it in the analytics repo and raised a PR. The team board columns are: To Do, In Progress, In Review, Done. Which column should the ticket move to now?',
      accept: ['In Review', 'Review', 'Code Review', 'In-Review'],
      explain: 'Review: the ticket is **In Review** until a senior analyst approves the PR and the numbers are delivered. Moving it to Done too early hides work that can still bounce back, and the board stops showing the real status of the sprint.',
    },
  ],
};
