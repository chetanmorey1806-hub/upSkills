const SHOPKART = `CREATE TABLE customers (customer_id INT PRIMARY KEY, name VARCHAR(40), city VARCHAR(30));
CREATE TABLE products (product_id INT PRIMARY KEY, product_name VARCHAR(40), category VARCHAR(20), price INT, stock INT);
CREATE TABLE orders (order_id INT PRIMARY KEY, customer_id INT, order_date DATE, status VARCHAR(12));
CREATE TABLE order_items (order_id INT, product_id INT, qty INT, unit_price INT, PRIMARY KEY (order_id, product_id));
INSERT INTO customers VALUES (1, 'Asha Patil', 'Pune'), (2, 'Ravi Kumar', 'Mumbai'), (3, 'Neel Shah', 'Ahmedabad'), (4, 'Tara Iyer', 'Chennai');
INSERT INTO products VALUES
 (1, 'Earphones', 'Electronics', 999, 40), (2, 'Power Bank', 'Electronics', 1499, 25), (3, 'Notebook', 'Stationery', 60, 500),
 (4, 'Pen Pack', 'Stationery', 120, 300), (5, 'T-Shirt', 'Clothing', 499, 80), (6, 'Jeans', 'Clothing', 1299, 35);
INSERT INTO orders VALUES
 (101, 1, '2024-01-10', 'DELIVERED'), (102, 2, '2024-01-15', 'DELIVERED'), (103, 1, '2024-02-03', 'DELIVERED'),
 (104, 3, '2024-02-18', 'CANCELLED'), (105, 2, '2024-03-05', 'DELIVERED'), (106, 3, '2024-03-22', 'SHIPPED');
INSERT INTO order_items VALUES
 (101, 1, 1, 999), (101, 3, 10, 60), (102, 2, 1, 1499), (102, 5, 2, 499), (103, 6, 1, 1299), (103, 4, 3, 120),
 (104, 1, 2, 999), (105, 1, 2, 999), (105, 3, 5, 60), (106, 5, 3, 499), (106, 2, 1, 1499);`;

export default {
  lesson: 'mysql-day-30',
  minutes: 40,
  intro: 'Final practical test on the ShopKart e-commerce database: design, business queries with joins, grouping, subqueries, CTEs and window functions, plus interview checks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Interview question: what is the difference between **DELETE**, **TRUNCATE** and **DROP**?',
      options: [
        'All three remove the table',
        'DELETE removes chosen rows (DML, can roll back); TRUNCATE removes all rows fast and resets AUTO_INCREMENT (DDL); DROP removes the table itself',
        'TRUNCATE can use WHERE',
        'DROP keeps the structure',
      ],
      answer: 1,
      explain: 'A classic interview favourite. DELETE = DML, row by row, WHERE allowed, triggers fire, can be rolled back. TRUNCATE = DDL, all rows, very fast, resets AUTO_INCREMENT. DROP = removes the structure, data, indexes and triggers.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Practical A1: create the table `reviews`:\n- `review_id` INT AUTO_INCREMENT PRIMARY KEY\n- `product_id` INT, FK → products\n- `customer_id` INT, FK → customers\n- `rating` INT that must be **1 to 5**\n- `review_text` VARCHAR(500)\n- a customer may review a product **only once** (unique pair)',
      example: { title: 'constraints together', code: 'CREATE TABLE ratings (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  movie_id INT,\n  user_id INT,\n  stars INT CHECK (stars BETWEEN 1 AND 10),\n  UNIQUE (movie_id, user_id),\n  FOREIGN KEY (movie_id) REFERENCES movies(movie_id)\n);' },
      setup: SHOPKART,
      starter: '-- CREATE TABLE reviews ( ... );\n',
      solution: 'CREATE TABLE reviews (\n  review_id   INT AUTO_INCREMENT PRIMARY KEY,\n  product_id  INT,\n  customer_id INT,\n  rating      INT CHECK (rating BETWEEN 1 AND 5),\n  review_text VARCHAR(500),\n  UNIQUE (product_id, customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);',
      check: "INSERT INTO reviews (product_id, customer_id, rating, review_text) VALUES (1, 1, 5, 'Great sound');\nINSERT IGNORE INTO reviews (product_id, customer_id, rating, review_text) VALUES (1, 1, 4, 'second review');\nINSERT IGNORE INTO reviews (product_id, customer_id, rating, review_text) VALUES (2, 1, 7, 'bad rating');\nINSERT INTO reviews (product_id, customer_id, rating, review_text) VALUES (2, 2, 3, 'OK');\nSELECT product_id, customer_id, rating FROM reviews ORDER BY product_id, customer_id;",
      explain: 'CHECK enforces the 1-5 range, the UNIQUE pair stops a second review of the same product by the same customer, and the FOREIGN KEYs stop reviews for products or customers that do not exist. The checker tries a duplicate and a rating of 7: both must be rejected.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Business query: **revenue per category** from **DELIVERED** orders only (`category`, `revenue` = SUM(qty × unit_price)), highest first.',
      example: { title: 'join + filter + group', code: "SELECT c.city, SUM(oi.qty * oi.unit_price) AS sales\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'DELIVERED'\nGROUP BY c.city;" },
      setup: SHOPKART,
      starter: '-- products, order_items, orders\n',
      solution: "SELECT p.category, SUM(oi.qty * oi.unit_price) AS revenue\nFROM order_items oi\nJOIN orders o ON o.order_id = oi.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'DELIVERED'\nGROUP BY p.category\nORDER BY revenue DESC;",
      ordered: true,
      explain: 'Use the **unit_price stored in order_items** (the price at the time of the sale), not the current product price. Filtering on status before grouping removes cancelled and not-yet-delivered orders.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Practical B2: list customers whose **total spend** (all orders except CANCELLED) is **above the average customer spend**. Show `name`, `total_spend`. (Customers who never ordered are not part of the average.)',
      example: { title: 'CTE + comparison with the average', code: 'WITH t AS (\n  SELECT agent_id, SUM(amount) AS total FROM sales GROUP BY agent_id\n)\nSELECT * FROM t WHERE total > (SELECT AVG(total) FROM t);' },
      setup: SHOPKART,
      starter: '-- WITH spend AS (...) SELECT ...\n',
      solution: "WITH spend AS (\n  SELECT o.customer_id, SUM(oi.qty * oi.unit_price) AS total_spend\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY o.customer_id\n)\nSELECT c.name, s.total_spend\nFROM spend s\nJOIN customers c ON c.customer_id = s.customer_id\nWHERE s.total_spend > (SELECT AVG(total_spend) FROM spend);",
      explain: 'The CTE computes one total per customer and is used twice: for the list and for the average. Totals: Asha 3258, Ravi 4795, Neel 2996 → average 3683 → only Ravi. A derived table works too.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Practical B1: for each category show the **best-selling product by units sold** (non-cancelled orders): `category`, `product_name`, `units`. Use a window function (e.g. RANK) so ties would all be shown.',
      example: { title: 'top-1 per group with a window function', code: 'WITH r AS (\n  SELECT dept, name, salary,\n         RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk\n  FROM faculty\n)\nSELECT dept, name, salary FROM r WHERE rk = 1;' },
      setup: SHOPKART,
      starter: '-- WITH units AS (...), ranked AS (... RANK() OVER (PARTITION BY category ...))\n',
      solution: "WITH units AS (\n  SELECT p.category, p.product_name, SUM(oi.qty) AS units\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY p.category, p.product_id, p.product_name\n),\nranked AS (\n  SELECT category, product_name, units,\n         RANK() OVER (PARTITION BY category ORDER BY units DESC) AS rk\n  FROM units\n)\nSELECT category, product_name, units\nFROM ranked\nWHERE rk = 1;",
      explain: 'Step 1 aggregates units per product; step 2 ranks products **within each category**; step 3 keeps rank 1. You cannot filter on a window function in WHERE of the same SELECT, so a CTE (or derived table) is needed. Notebook (15) wins Stationery, T-Shirt (5) Clothing, Earphones (3) Electronics.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Practical C1: order **104** is cancelled but its stock was never returned. In ONE transaction: add each item\'s qty of order 104 back to `products.stock`, then set the order status to **\'RETURNED\'**, and commit.',
      example: { title: 'stock restore with a correlated subquery', code: "START TRANSACTION;\nUPDATE products p\nSET stock = stock + (SELECT qty FROM order_items oi WHERE oi.order_id = 7 AND oi.product_id = p.product_id)\nWHERE product_id IN (SELECT product_id FROM order_items WHERE order_id = 7);\nUPDATE orders SET status = 'RETURNED' WHERE order_id = 7;\nCOMMIT;" },
      setup: SHOPKART,
      starter: '-- START TRANSACTION; UPDATE products ...; UPDATE orders ...; COMMIT;\n',
      solution: "START TRANSACTION;\nUPDATE products\nSET stock = stock + (SELECT oi.qty FROM order_items oi WHERE oi.order_id = 104 AND oi.product_id = products.product_id)\nWHERE product_id IN (SELECT product_id FROM order_items WHERE order_id = 104);\nUPDATE orders SET status = 'RETURNED' WHERE order_id = 104;\nCOMMIT;",
      check: 'SELECT product_id, stock FROM products ORDER BY product_id;\n',
      explain: 'Both changes belong together: if the status update failed, ROLLBACK would also undo the stock change. The WHERE ... IN limits the update to products of that order; without it the subquery returns NULL for other products and `stock + NULL` would wipe their stock. (In real MySQL `UPDATE products p JOIN order_items oi ...` is another common way.)',
    },
  ],
};
