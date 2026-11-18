export default {
  "id": "mysql-day-30",
  "title": "Final Project: E-commerce Database, Practical Test and Interview Preparation",
  "module": "Module 6: Design, Administration & Project",
  "day": 30,
  "level": "Advanced",
  "duration": "3 hours",
  "summary": "Put the whole course together: design the ShopKart e-commerce database (customers, products, orders, order_items, payments), create it and load data in Workbench, answer 20 business queries from basic aggregates to window functions, build reporting views, a stock trigger and an order-placing stored procedure with transactions, then prepare with a practical test and 35 interview questions.",
  "objectives": [
    "Design and implement a normalized e-commerce schema with keys and constraints",
    "Write 20 business queries using joins, grouping, subqueries, CTEs and window functions",
    "Encapsulate logic in views, a trigger and a transactional stored procedure",
    "Complete a timed practical test in MySQL Workbench",
    "Answer the most common MySQL interview questions confidently"
  ],
  "theory": [
    {
      "heading": "1. Project brief: ShopKart e-commerce database",
      "content": "Your final project is a complete MySQL database for a small online store, built end to end in MySQL Workbench: requirements -> ER design -> normalized tables -> sample data -> 20 business queries -> views, a trigger and a stored procedure -> backup. This mirrors what you would do in a real job or a technical interview task.",
      "points": [
        "Business rules: a customer can place many orders; an order belongs to one customer; an order contains many products (order lines) and a product appears in many orders (M:N via order_items); an order can have payments; an order status is PLACED, SHIPPED, DELIVERED or CANCELLED.",
        "Revenue rule used in every query: sum of qty * unit_price of order_items, excluding CANCELLED orders.",
        "unit_price is stored in order_items (the price at the time of sale) - this is history, not redundancy, because product prices change.",
        "Deliverables: .mwb model + EER diagram PNG, schema script, data script, queries script with comments, views/trigger/procedure script, a mysqldump backup, and a one-page README."
      ]
    },
    {
      "heading": "2. Design: entities, keys and relationships",
      "content": "Apply Days 4, 5, 26 and 27. Five tables in 3NF.",
      "syntax": "customers   (customer_id PK, name, city, email UNIQUE, signup_date)\nproducts    (product_id PK, name, category, price CHECK > 0, stock DEFAULT 0)\norders      (order_id PK, customer_id FK -> customers, order_date, status ENUM)\norder_items (item_id PK, order_id FK -> orders, product_id FK -> products,\n             qty CHECK > 0, unit_price)\npayments    (payment_id PK, order_id FK -> orders, amount, method ENUM, paid_on)\n\ncustomers 1 ---< orders 1 ---< order_items >--- 1 products\n                 orders 1 ---< payments",
      "points": [
        "Draw it in Workbench: File > New Model > Add Diagram, place the 5 tables, use 1:n Non-Identifying relationships (child first, then parent), then Database > Forward Engineer.",
        "Index foreign keys (InnoDB does it automatically) and columns used in filters (orders.order_date, orders.status).",
        "Use DECIMAL(10,2) for money, ENUM or a lookup table for statuses, DATE for dates.",
        "Add CHECK constraints for quantities and prices, NOT NULL where a value is mandatory, UNIQUE for email."
      ]
    },
    {
      "heading": "3. Building it in Workbench step by step",
      "content": "Suggested order of work (about 3-4 hours).",
      "points": [
        "Step 1: Create schema ecommerce (Navigator > right-click > Create Schema... or CREATE DATABASE).",
        "Step 2: Create tables parents first (customers, products), then children (orders, order_items, payments). Run DESCRIBE / check the Navigator.",
        "Step 3: Insert sample data with multi-row INSERTs (or the Table Data Import Wizard from CSV). Verify counts.",
        "Step 4: Write the 20 business queries in a script file (File > Save Script As... queries.sql), each with a comment explaining the business question.",
        "Step 5: Create views for reporting, a trigger for stock, and a stored procedure for placing an order inside a transaction.",
        "Step 6: Reverse engineer the finished schema to produce the final EER diagram, export it as PNG.",
        "Step 7: Server > Data Export the ecommerce schema (self-contained file, routines and triggers ticked) and test-restore it into ecommerce_test."
      ]
    },
    {
      "heading": "4. The 20 business queries (checklist)",
      "content": "Each query practises a topic from the course - use this as your revision list.",
      "points": [
        "Q1 total revenue (JOIN, SUM, WHERE) | Q2 revenue by month (DATE_FORMAT, GROUP BY) | Q3 top 3 products (ORDER BY, LIMIT) | Q4 customers with no orders (LEFT JOIN ... IS NULL)",
        "Q5 payment status (LEFT JOIN, CASE, IFNULL) | Q6 category share % (scalar subquery) | Q7 average order value (derived table) | Q8 repeat customers (HAVING)",
        "Q9 city-wise revenue (conditional aggregation) | Q10 never-sold products (NOT EXISTS) | Q11 low-stock alert (CASE) | Q12 orders by status (GROUP BY)",
        "Q13 payment method share | Q14 biggest order per customer (CTE + ROW_NUMBER) | Q15 customer ranking (DENSE_RANK) | Q16 running revenue (SUM() OVER)",
        "Q17 month-over-month growth (LAG) | Q18 first/last order (MIN/MAX, DATEDIFF) | Q19 receivables (NOT EXISTS) | Q20 products bought together (self join)"
      ]
    },
    {
      "heading": "5. Practical test format and grading",
      "content": "The practical test (90 minutes) is done in MySQL Workbench with the ecommerce database. You get a fresh copy of the script, then must answer tasks in a .sql file.",
      "points": [
        "Part A (20%): DDL - create a table with keys and constraints, ALTER it, explain a design choice.",
        "Part B (40%): 8 queries - filtering, joins, grouping, subqueries, window functions.",
        "Part C (20%): one view, one trigger or procedure, one transaction with ROLLBACK.",
        "Part D (20%): Workbench skills - Safe Updates fix, export a result to CSV, EXPLAIN a query, create a user with SELECT only, back up the schema.",
        "Grading: correct result (60%), readable SQL with aliases and comments (20%), efficiency and safety - WHERE on UPDATE/DELETE, transactions, indexes (20%)."
      ],
      "tip": "Exam habits: run every query, read the row count in the Output panel, check NULLs and cancelled orders, and never run UPDATE/DELETE without previewing the WHERE with a SELECT first."
    },
    {
      "heading": "6. Interview preparation strategy",
      "content": "SQL interviews combine concept questions (what is a join, normalization, ACID) with live query writing on a small schema like this one.",
      "points": [
        "Talk while you write: state the grain of the result (one row per customer? per month?) before writing GROUP BY.",
        "Always ask: what about NULLs, duplicates, ties and cancelled/deleted rows?",
        "Know at least two ways to solve classic problems: second highest salary (subquery, LIMIT OFFSET, DENSE_RANK), duplicates (GROUP BY HAVING, ROW_NUMBER), top N per group (window function), running totals.",
        "Be ready to explain performance: indexes, EXPLAIN, sargable predicates, avoiding SELECT *.",
        "Know the Workbench basics interviewers ask about: Error 1175, Forward/Reverse Engineering, Data Export, Users and Privileges, Visual Explain."
      ]
    }
  ],
  "examples": [
    {
      "title": "Project step 1-3: create the schema, load data and verify",
      "scenario": "Create the ShopKart ecommerce database with all five tables and sample data, then verify the row counts and relationships.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab; paste the full schema + data script (shown in the Lab script)",
        "Click ⚡ Execute (Ctrl+Shift+Enter); every statement in the Output panel must show a green tick",
        "Navigator > SCHEMAS > refresh > expand ecommerce > Tables: 5 tables",
        "Run the verification query",
        "Optional: Database > Reverse Engineer the schema to see the EER diagram"
      ],
      "code": "SELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers\nUNION ALL SELECT 'products',    COUNT(*) FROM products\nUNION ALL SELECT 'orders',      COUNT(*) FROM orders\nUNION ALL SELECT 'order_items', COUNT(*) FROM order_items\nUNION ALL SELECT 'payments',    COUNT(*) FROM payments;\n\n-- relationship check: every order line points to an existing order and product\nSELECT COUNT(*) AS orphan_lines\nFROM order_items oi\nLEFT JOIN orders o   ON o.order_id = oi.order_id\nLEFT JOIN products p ON p.product_id = oi.product_id\nWHERE o.order_id IS NULL OR p.product_id IS NULL;",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\nSELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers\nUNION ALL SELECT 'products',    COUNT(*) FROM products\nUNION ALL SELECT 'orders',      COUNT(*) FROM orders\nUNION ALL SELECT 'order_items', COUNT(*) FROM order_items\nUNION ALL SELECT 'payments',    COUNT(*) FROM payments;\nSELECT COUNT(*) AS orphan_lines\nFROM order_items oi\nLEFT JOIN orders o   ON o.order_id = oi.order_id\nLEFT JOIN products p ON p.product_id = oi.product_id\nWHERE o.order_id IS NULL OR p.product_id IS NULL;",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers\n+-------------+-----------+\n| table_name  | row_count |\n+-------------+-----------+\n| customers   | 6         |\n| products    | 7         |\n| orders      | 8         |\n| order_items | 13        |\n| payments    | 6         |\n+-------------+-----------+\n5 row(s) returned\n>> SELECT COUNT(*) AS orphan_lines\n+--------------+\n| orphan_lines |\n+--------------+\n| 0            |\n+--------------+\n1 row(s) returned",
      "explanation": "The script drops tables child-first and creates them parent-first so foreign keys can be built. The counts confirm 6 customers, 7 products, 8 orders, 13 order lines and 6 payments. The orphan check returns 0 - guaranteed anyway by the FOREIGN KEY constraints, but it is a good habit when data comes from imports."
    },
    {
      "title": "Business queries Q1-Q7: revenue, products, customers, payments",
      "scenario": "Answer the first seven management questions: total revenue, monthly revenue, top products, inactive customers, payment status, category share and average order value.",
      "steps": [
        "Make ecommerce the default schema (double-click it)",
        "File > Open SQL Script... or paste the queries into a new tab",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Each query produces its own Result tab (Result 1 ... Result 7); compare with the output below"
      ],
      "code": "-- Q1 Total revenue and orders (cancelled orders excluded)\nSELECT COUNT(DISTINCT o.order_id) AS orders, SUM(oi.qty * oi.unit_price) AS revenue\nFROM orders o JOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED';\n\n-- Q2 Revenue by month\nSELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, SUM(oi.qty * oi.unit_price) AS revenue\nFROM orders o JOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY DATE_FORMAT(o.order_date, '%Y-%m')\nORDER BY month;\n\n-- Q3 Top 3 products by revenue\nSELECT p.name, SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS revenue\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o   ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY p.product_id, p.name\nORDER BY revenue DESC\nLIMIT 3;\n\n-- Q4 Customers who never placed an order\nSELECT c.customer_id, c.name, c.city\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;\n\n-- Q5 Payment status of every order\nSELECT o.order_id, o.status,\n       SUM(oi.qty * oi.unit_price) AS order_value,\n       IFNULL(MAX(p.amount), 0)    AS paid,\n       CASE WHEN MAX(p.amount) IS NULL THEN 'UNPAID' ELSE 'PAID' END AS payment_status\nFROM orders o\nJOIN order_items oi  ON oi.order_id = o.order_id\nLEFT JOIN payments p ON p.order_id = o.order_id\nGROUP BY o.order_id, o.status\nORDER BY o.order_id;\n\n-- Q6 Revenue share by category (%)\nSELECT p.category,\n       SUM(oi.qty * oi.unit_price) AS revenue,\n       ROUND(SUM(oi.qty * oi.unit_price) * 100.0 /\n             (SELECT SUM(oi2.qty * oi2.unit_price)\n              FROM order_items oi2 JOIN orders o2 ON o2.order_id = oi2.order_id\n              WHERE o2.status <> 'CANCELLED'), 1) AS share_pct\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o   ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY p.category\nORDER BY revenue DESC;\n\n-- Q7 Average order value\nSELECT ROUND(AVG(order_value), 2) AS avg_order_value\nFROM (SELECT o.order_id, SUM(oi.qty * oi.unit_price) AS order_value\n      FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n      WHERE o.status <> 'CANCELLED'\n      GROUP BY o.order_id) t;",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\n-- Q1 Total revenue and orders (cancelled orders excluded)\nSELECT COUNT(DISTINCT o.order_id) AS orders, SUM(oi.qty * oi.unit_price) AS revenue\nFROM orders o JOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED';\n\n-- Q2 Revenue by month\nSELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, SUM(oi.qty * oi.unit_price) AS revenue\nFROM orders o JOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY DATE_FORMAT(o.order_date, '%Y-%m')\nORDER BY month;\n\n-- Q3 Top 3 products by revenue\nSELECT p.name, SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS revenue\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o   ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY p.product_id, p.name\nORDER BY revenue DESC\nLIMIT 3;\n\n-- Q4 Customers who never placed an order\nSELECT c.customer_id, c.name, c.city\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;\n\n-- Q5 Payment status of every order\nSELECT o.order_id, o.status,\n       SUM(oi.qty * oi.unit_price) AS order_value,\n       IFNULL(MAX(p.amount), 0)    AS paid,\n       CASE WHEN MAX(p.amount) IS NULL THEN 'UNPAID' ELSE 'PAID' END AS payment_status\nFROM orders o\nJOIN order_items oi  ON oi.order_id = o.order_id\nLEFT JOIN payments p ON p.order_id = o.order_id\nGROUP BY o.order_id, o.status\nORDER BY o.order_id;\n\n-- Q6 Revenue share by category (%)\nSELECT p.category,\n       SUM(oi.qty * oi.unit_price) AS revenue,\n       ROUND(SUM(oi.qty * oi.unit_price) * 100.0 /\n             (SELECT SUM(oi2.qty * oi2.unit_price)\n              FROM order_items oi2 JOIN orders o2 ON o2.order_id = oi2.order_id\n              WHERE o2.status <> 'CANCELLED'), 1) AS share_pct\nFROM order_items oi\nJOIN products p ON p.product_id = oi.product_id\nJOIN orders o   ON o.order_id = oi.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY p.category\nORDER BY revenue DESC;\n\n-- Q7 Average order value\nSELECT ROUND(AVG(order_value), 2) AS avg_order_value\nFROM (SELECT o.order_id, SUM(oi.qty * oi.unit_price) AS order_value\n      FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n      WHERE o.status <> 'CANCELLED'\n      GROUP BY o.order_id) t;",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> -- Q1 Total revenue and orders (cancelled orders excluded)\n+--------+---------+\n| orders | revenue |\n+--------+---------+\n| 7      | 196800  |\n+--------+---------+\n1 row(s) returned\n>> -- Q2 Revenue by month\n+---------+---------+\n| month   | revenue |\n+---------+---------+\n| 2024-06 | 110400  |\n| 2024-07 | 86400   |\n+---------+---------+\n2 row(s) returned\n>> -- Q3 Top 3 products by revenue\n+---------------+-------+---------+\n| name          | units | revenue |\n+---------------+-------+---------+\n| Laptop Pro 14 | 2     | 150000  |\n| Office Chair  | 3     | 19500   |\n| Running Shoes | 3     | 10500   |\n+---------------+-------+---------+\n3 row(s) returned\n>> -- Q4 Customers who never placed an order\n+-------------+-------------+--------+\n| customer_id | name        | city   |\n+-------------+-------------+--------+\n| 6           | Isha Kapoor | Mumbai |\n+-------------+-------------+--------+\n1 row(s) returned\n>> -- Q5 Payment status of every order\n+----------+-----------+-------------+-------+----------------+\n| order_id | status    | order_value | paid  | payment_status |\n+----------+-----------+-------------+-------+----------------+\n| 1        | DELIVERED | 76600       | 76600 | PAID           |\n| 2        | DELIVERED | 8300        | 8300  | PAID           |\n| 3        | SHIPPED   | 3500        | 3500  | PAID           |\n| 4        | DELIVERED | 22000       | 22000 | PAID           |\n| 5        | CANCELLED | 2500        | 0     | UNPAID         |\n| 6        | DELIVERED | 82000       | 82000 | PAID           |\n| 7        | PLACED    | 2400        | 0     | UNPAID         |\n| 8        | DELIVERED | 2000        | 2000  | PAID           |\n+----------+-----------+-------------+-------+----------------+\n8 row(s) returned\n>> -- Q6 Revenue share by category (%)\n+-------------+---------+-----------+\n| category    | revenue | share_pct |\n+-------------+---------+-----------+\n| Electronics | 152400  | 77.4      |\n| Furniture   | 28500   | 14.5      |\n| Fashion     | 15900   | 8.1       |\n+-------------+---------+-----------+\n3 row(s) returned\n>> -- Q7 Average order value\n+-----------------+\n| avg_order_value |\n+-----------------+\n| 28114.29        |\n+-----------------+\n1 row(s) returned",
      "explanation": "Q1: 7 valid orders worth 196,800 (order 5 is cancelled). Q2 splits it into June and July. Q3: the laptop dominates revenue. Q4: Isha signed up but never ordered (LEFT JOIN ... IS NULL). Q5: orders 5 and 7 have no payment (5 is cancelled; 7 is still PLACED). Q6 uses a scalar subquery for the grand total to compute each category's share. Q7 first builds one row per order in a derived table, then averages - averaging order_items directly would give the average LINE value, not order value."
    },
    {
      "title": "Business queries Q8-Q14: segments, stock, status and per-customer maximum",
      "scenario": "Continue with repeat customers, city performance, unsold products, stock alerts, status distribution, payment methods and each customer's biggest order.",
      "steps": [
        "Same query tab, ecommerce as default schema",
        "Type or paste Q8-Q14",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "-- Q8 Repeat customers (more than one order)\nSELECT c.name, COUNT(*) AS orders\nFROM customers c JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) > 1\nORDER BY orders DESC, c.name;\n\n-- Q9 City-wise customers and revenue\nSELECT c.city,\n       COUNT(DISTINCT c.customer_id) AS customers,\n       IFNULL(SUM(CASE WHEN o.status <> 'CANCELLED' THEN oi.qty * oi.unit_price END), 0) AS revenue\nFROM customers c\nLEFT JOIN orders o       ON o.customer_id = c.customer_id\nLEFT JOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY c.city\nORDER BY revenue DESC;\n\n-- Q10 Products never sold in a valid order\nSELECT p.product_id, p.name\nFROM products p\nWHERE NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.order_id = oi.order_id\n                  WHERE oi.product_id = p.product_id AND o.status <> 'CANCELLED');\n\n-- Q11 Low-stock alert (stock below 20)\nSELECT name, stock,\n       CASE WHEN stock = 0 THEN 'OUT OF STOCK' ELSE 'LOW' END AS alert\nFROM products\nWHERE stock < 20\nORDER BY stock;\n\n-- Q12 Orders by status\nSELECT status, COUNT(*) AS orders\nFROM orders\nGROUP BY status\nORDER BY orders DESC, status;\n\n-- Q13 Payment method share\nSELECT method, COUNT(*) AS payments, SUM(amount) AS amount,\n       ROUND(SUM(amount) * 100.0 / (SELECT SUM(amount) FROM payments), 1) AS pct\nFROM payments\nGROUP BY method\nORDER BY amount DESC;\n\n-- Q14 Biggest order of each customer\nWITH order_values AS (\n  SELECT o.customer_id, o.order_id, SUM(oi.qty * oi.unit_price) AS order_value,\n         ROW_NUMBER() OVER (PARTITION BY o.customer_id\n                            ORDER BY SUM(oi.qty * oi.unit_price) DESC) AS rn\n  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY o.customer_id, o.order_id\n)\nSELECT c.name, ov.order_id, ov.order_value\nFROM order_values ov JOIN customers c ON c.customer_id = ov.customer_id\nWHERE ov.rn = 1\nORDER BY ov.order_value DESC;",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\n-- Q8 Repeat customers (more than one order)\nSELECT c.name, COUNT(*) AS orders\nFROM customers c JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nHAVING COUNT(*) > 1\nORDER BY orders DESC, c.name;\n\n-- Q9 City-wise customers and revenue\nSELECT c.city,\n       COUNT(DISTINCT c.customer_id) AS customers,\n       IFNULL(SUM(CASE WHEN o.status <> 'CANCELLED' THEN oi.qty * oi.unit_price END), 0) AS revenue\nFROM customers c\nLEFT JOIN orders o       ON o.customer_id = c.customer_id\nLEFT JOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY c.city\nORDER BY revenue DESC;\n\n-- Q10 Products never sold in a valid order\nSELECT p.product_id, p.name\nFROM products p\nWHERE NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.order_id = oi.order_id\n                  WHERE oi.product_id = p.product_id AND o.status <> 'CANCELLED');\n\n-- Q11 Low-stock alert (stock below 20)\nSELECT name, stock,\n       CASE WHEN stock = 0 THEN 'OUT OF STOCK' ELSE 'LOW' END AS alert\nFROM products\nWHERE stock < 20\nORDER BY stock;\n\n-- Q12 Orders by status\nSELECT status, COUNT(*) AS orders\nFROM orders\nGROUP BY status\nORDER BY orders DESC, status;\n\n-- Q13 Payment method share\nSELECT method, COUNT(*) AS payments, SUM(amount) AS amount,\n       ROUND(SUM(amount) * 100.0 / (SELECT SUM(amount) FROM payments), 1) AS pct\nFROM payments\nGROUP BY method\nORDER BY amount DESC;\n\n-- Q14 Biggest order of each customer\nWITH order_values AS (\n  SELECT o.customer_id, o.order_id, SUM(oi.qty * oi.unit_price) AS order_value,\n         ROW_NUMBER() OVER (PARTITION BY o.customer_id\n                            ORDER BY SUM(oi.qty * oi.unit_price) DESC) AS rn\n  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY o.customer_id, o.order_id\n)\nSELECT c.name, ov.order_id, ov.order_value\nFROM order_values ov JOIN customers c ON c.customer_id = ov.customer_id\nWHERE ov.rn = 1\nORDER BY ov.order_value DESC;",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> -- Q8 Repeat customers (more than one order)\n+--------------+--------+\n| name         | orders |\n+--------------+--------+\n| Amit Shah    | 2      |\n| Neha Gupta   | 2      |\n| Rahul Khanna | 2      |\n+--------------+--------+\n3 row(s) returned\n>> -- Q9 City-wise customers and revenue\n+-----------+-----------+---------+\n| city      | customers | revenue |\n+-----------+-----------+---------+\n| Delhi     | 2         | 92700   |\n| Mumbai    | 2         | 80100   |\n| Pune      | 1         | 24000   |\n| Hyderabad | 1         | 0       |\n+-----------+-----------+---------+\n4 row(s) returned\n>> -- Q10 Products never sold in a valid order\n+------------+-------------------+\n| product_id | name              |\n+------------+-------------------+\n| 7          | Bluetooth Speaker |\n+------------+-------------------+\n1 row(s) returned\n>> -- Q11 Low-stock alert (stock below 20)\n+-------------------+-------+--------------+\n| name              | stock | alert        |\n+-------------------+-------+--------------+\n| Bluetooth Speaker | 0     | OUT OF STOCK |\n| Laptop Pro 14     | 15    | LOW          |\n+-------------------+-------+--------------+\n2 row(s) returned\n>> -- Q12 Orders by status\n+-----------+--------+\n| status    | orders |\n+-----------+--------+\n| DELIVERED | 5      |\n| CANCELLED | 1      |\n| PLACED    | 1      |\n| SHIPPED   | 1      |\n+-----------+--------+\n4 row(s) returned\n>> -- Q13 Payment method share\n+------------+----------+--------+------+\n| method     | payments | amount | pct  |\n+------------+----------+--------+------+\n| CARD       | 2        | 158600 | 81.6 |\n| NETBANKING | 1        | 22000  | 11.3 |\n| UPI        | 2        | 11800  | 6.1  |\n| COD        | 1        | 2000   | 1.0  |\n+------------+----------+--------+------+\n4 row(s) returned\n>> -- Q14 Biggest order of each customer\n+----------------+----------+-------------+\n| name           | order_id | order_value |\n+----------------+----------+-------------+\n| Neha Gupta     | 6        | 82000       |\n| Rahul Khanna   | 1        | 76600       |\n| Amit Shah      | 4        | 22000       |\n| Karan Malhotra | 7        | 2400        |\n+----------------+----------+-------------+\n4 row(s) returned",
      "explanation": "Q8 uses HAVING on the number of orders. Q9 LEFT JOINs so cities with no revenue still appear, and the CASE inside SUM ignores cancelled orders (Pooja's Hyderabad shows 0). Q10's NOT EXISTS finds the Bluetooth Speaker - its only order was cancelled. Q11 combines a filter with a CASE label. Q13 computes each method's share of all payments. Q14 ranks each customer's orders by value with ROW_NUMBER() OVER (PARTITION BY customer) and keeps rn = 1 - the standard 'top 1 per group' pattern."
    },
    {
      "title": "Business queries Q15-Q20: rankings, running totals, growth, receivables, basket analysis",
      "scenario": "Finish with advanced analytics using window functions, CTEs, NOT EXISTS and a self join.",
      "steps": [
        "Same query tab",
        "Type or paste Q15-Q20",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "-- Q15 Rank customers by total spend\nSELECT c.name,\n       SUM(oi.qty * oi.unit_price) AS spent,\n       DENSE_RANK() OVER (ORDER BY SUM(oi.qty * oi.unit_price) DESC) AS spend_rank\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY c.customer_id, c.name;\n\n-- Q16 Running revenue by order date\nWITH daily AS (\n  SELECT o.order_date, SUM(oi.qty * oi.unit_price) AS revenue\n  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY o.order_date\n)\nSELECT order_date, revenue,\n       SUM(revenue) OVER (ORDER BY order_date) AS running_revenue\nFROM daily;\n\n-- Q17 Month-over-month growth\nWITH monthly AS (\n  SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, SUM(oi.qty * oi.unit_price) AS revenue\n  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev_month,\n       ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0\n             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct\nFROM monthly;\n\n-- Q18 First and last order per customer\nSELECT c.name, MIN(o.order_date) AS first_order, MAX(o.order_date) AS last_order,\n       DATEDIFF(MAX(o.order_date), MIN(o.order_date)) AS days_between\nFROM customers c JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY first_order;\n\n-- Q19 Receivables: non-cancelled orders with no payment yet\nSELECT o.order_id, c.name, o.status, SUM(oi.qty * oi.unit_price) AS amount_due\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\n  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.order_id)\nGROUP BY o.order_id, c.name, o.status;\n\n-- Q20 Products bought together with 'Laptop Pro 14'\nSELECT p2.name AS bought_with, COUNT(*) AS times\nFROM order_items a\nJOIN order_items b ON b.order_id = a.order_id AND b.product_id <> a.product_id\nJOIN products p1   ON p1.product_id = a.product_id\nJOIN products p2   ON p2.product_id = b.product_id\nWHERE p1.name = 'Laptop Pro 14'\nGROUP BY p2.name\nORDER BY times DESC, bought_with;",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\n-- Q15 Rank customers by total spend\nSELECT c.name,\n       SUM(oi.qty * oi.unit_price) AS spent,\n       DENSE_RANK() OVER (ORDER BY SUM(oi.qty * oi.unit_price) DESC) AS spend_rank\nFROM customers c\nJOIN orders o       ON o.customer_id = c.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\nGROUP BY c.customer_id, c.name;\n\n-- Q16 Running revenue by order date\nWITH daily AS (\n  SELECT o.order_date, SUM(oi.qty * oi.unit_price) AS revenue\n  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY o.order_date\n)\nSELECT order_date, revenue,\n       SUM(revenue) OVER (ORDER BY order_date) AS running_revenue\nFROM daily;\n\n-- Q17 Month-over-month growth\nWITH monthly AS (\n  SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, SUM(oi.qty * oi.unit_price) AS revenue\n  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev_month,\n       ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0\n             / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct\nFROM monthly;\n\n-- Q18 First and last order per customer\nSELECT c.name, MIN(o.order_date) AS first_order, MAX(o.order_date) AS last_order,\n       DATEDIFF(MAX(o.order_date), MIN(o.order_date)) AS days_between\nFROM customers c JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY first_order;\n\n-- Q19 Receivables: non-cancelled orders with no payment yet\nSELECT o.order_id, c.name, o.status, SUM(oi.qty * oi.unit_price) AS amount_due\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status <> 'CANCELLED'\n  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.order_id)\nGROUP BY o.order_id, c.name, o.status;\n\n-- Q20 Products bought together with 'Laptop Pro 14'\nSELECT p2.name AS bought_with, COUNT(*) AS times\nFROM order_items a\nJOIN order_items b ON b.order_id = a.order_id AND b.product_id <> a.product_id\nJOIN products p1   ON p1.product_id = a.product_id\nJOIN products p2   ON p2.product_id = b.product_id\nWHERE p1.name = 'Laptop Pro 14'\nGROUP BY p2.name\nORDER BY times DESC, bought_with;",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> -- Q15 Rank customers by total spend\n+----------------+-------+------------+\n| name           | spent | spend_rank |\n+----------------+-------+------------+\n| Neha Gupta     | 90300 | 1          |\n| Rahul Khanna   | 80100 | 2          |\n| Amit Shah      | 24000 | 3          |\n| Karan Malhotra | 2400  | 4          |\n+----------------+-------+------------+\n4 row(s) returned\n>> -- Q16 Running revenue by order date\n+------------+---------+-----------------+\n| order_date | revenue | running_revenue |\n+------------+---------+-----------------+\n| 2024-06-01 | 76600   | 76600           |\n| 2024-06-03 | 8300    | 84900           |\n| 2024-06-10 | 3500    | 88400           |\n| 2024-06-15 | 22000   | 110400          |\n| 2024-07-02 | 82000   | 192400          |\n| 2024-07-05 | 2400    | 194800          |\n| 2024-07-18 | 2000    | 196800          |\n+------------+---------+-----------------+\n7 row(s) returned\n>> -- Q17 Month-over-month growth\n+---------+---------+------------+------------+\n| month   | revenue | prev_month | growth_pct |\n+---------+---------+------------+------------+\n| 2024-06 | 110400  | NULL       | NULL       |\n| 2024-07 | 86400   | 110400     | -21.7      |\n+---------+---------+------------+------------+\n2 row(s) returned\n>> -- Q18 First and last order per customer\n+----------------+-------------+------------+--------------+\n| name           | first_order | last_order | days_between |\n+----------------+-------------+------------+--------------+\n| Rahul Khanna   | 2024-06-01  | 2024-06-10 | 9            |\n| Neha Gupta     | 2024-06-03  | 2024-07-02 | 29           |\n| Amit Shah      | 2024-06-15  | 2024-07-18 | 33           |\n| Pooja Reddy    | 2024-06-20  | 2024-06-20 | 0            |\n| Karan Malhotra | 2024-07-05  | 2024-07-05 | 0            |\n+----------------+-------------+------------+--------------+\n5 row(s) returned\n>> -- Q19 Receivables: non-cancelled orders with no payment yet\n+----------+----------------+--------+------------+\n| order_id | name           | status | amount_due |\n+----------+----------------+--------+------------+\n| 7        | Karan Malhotra | PLACED | 2400       |\n+----------+----------------+--------+------------+\n1 row(s) returned\n>> -- Q20 Products bought together with 'Laptop Pro 14'\n+----------------+-------+\n| bought_with    | times |\n+----------------+-------+\n| Running Shoes  | 1     |\n| Wireless Mouse | 1     |\n+----------------+-------+\n2 row(s) returned",
      "explanation": "Q15: only the 4 customers with valid orders appear, ranked 1-4 by spend (DENSE_RANK would give equal ranks to equal totals). Q16: SUM() OVER (ORDER BY order_date) accumulates daily revenue into a running total that ends at 196,800 - matching Q1. Q17: LAG reads the previous month, so July shows its change versus June (-21.7%). Q18: Neha's two orders are 29 days apart. Q19: order 7 (PLACED, 2,400) is unpaid - money still to collect. Q20 self-joins order_items on the same order_id to find products that appeared in the same basket as the laptop."
    },
    {
      "title": "Views and a stock trigger",
      "scenario": "Create two reporting views (order summary and customer 360) and a trigger that reduces product stock whenever an order line is inserted. Then place a new order for Isha and watch both the stock and her lifetime value change.",
      "steps": [
        "Same tab, ecommerce default schema",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Navigator > ecommerce > Views (2) and Tables > order_items > Triggers show the new objects (refresh first)",
        "Wireless Mouse stock goes 200 -> 197 and T-Shirt 150 -> 148"
      ],
      "code": "CREATE VIEW v_order_summary AS\nSELECT o.order_id, o.customer_id, o.order_date, o.status, c.name AS customer, c.city,\n       SUM(oi.qty)                 AS items,\n       SUM(oi.qty * oi.unit_price) AS order_value\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY o.order_id, o.customer_id, o.order_date, o.status, c.name, c.city;\n\nCREATE VIEW v_customer_360 AS\nSELECT c.customer_id, c.name, c.city,\n       COUNT(s.order_id)              AS valid_orders,\n       IFNULL(SUM(s.order_value), 0)  AS lifetime_value\nFROM customers c\nLEFT JOIN v_order_summary s ON s.customer_id = c.customer_id AND s.status <> 'CANCELLED'\nGROUP BY c.customer_id, c.name, c.city;\n\nSELECT order_id, customer, status, items, order_value FROM v_order_summary WHERE status = 'DELIVERED';\nSELECT name, city, valid_orders, lifetime_value FROM v_customer_360 ORDER BY lifetime_value DESC;\n\n-- Trigger: reduce stock automatically when an item is sold\nDELIMITER $$\nCREATE TRIGGER trg_order_items_stock AFTER INSERT ON order_items\nFOR EACH ROW\nBEGIN\n  UPDATE products SET stock = stock - NEW.qty WHERE product_id = NEW.product_id;\nEND$$\nDELIMITER ;\n\nINSERT INTO orders (customer_id, order_date, status) VALUES (6, '2024-07-25', 'PLACED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (9, 2, 3, 800.00), (9, 6, 2, 600.00);\nSELECT product_id, name, stock FROM products WHERE product_id IN (2, 6);\nSELECT name, valid_orders, lifetime_value FROM v_customer_360 WHERE name = 'Isha Kapoor';",
      "mysql": "CREATE DATABASE IF NOT EXISTS ecommerce;\nUSE ecommerce;\nDROP TABLE IF EXISTS payments;\nDROP TABLE IF EXISTS order_items;\nDROP TABLE IF EXISTS orders;\nDROP TABLE IF EXISTS products;\nDROP TABLE IF EXISTS customers;\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(60) NOT NULL,\n  city VARCHAR(40),\n  email VARCHAR(80) UNIQUE,\n  signup_date DATE\n);\nCREATE TABLE products (\n  product_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL,\n  category VARCHAR(40),\n  price DECIMAL(10,2) NOT NULL CHECK (price > 0),\n  stock INT DEFAULT 0\n);\nCREATE TABLE orders (\n  order_id INT AUTO_INCREMENT PRIMARY KEY,\n  customer_id INT NOT NULL,\n  order_date DATE NOT NULL,\n  status ENUM('PLACED','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);\nCREATE TABLE order_items (\n  item_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  product_id INT NOT NULL,\n  qty INT NOT NULL CHECK (qty > 0),\n  unit_price DECIMAL(10,2) NOT NULL,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nCREATE TABLE payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  order_id INT NOT NULL,\n  amount DECIMAL(10,2) NOT NULL,\n  method ENUM('UPI','CARD','COD','NETBANKING'),\n  paid_on DATE,\n  FOREIGN KEY (order_id) REFERENCES orders(order_id)\n);\nINSERT INTO customers (name, city, email, signup_date) VALUES\n ('Rahul Khanna','Mumbai','rahul@mail.com','2024-01-10'),\n ('Neha Gupta','Delhi','neha@mail.com','2024-02-15'),\n ('Amit Shah','Pune','amit@mail.com','2024-03-05'),\n ('Pooja Reddy','Hyderabad','pooja@mail.com','2024-03-20'),\n ('Karan Malhotra','Delhi','karan@mail.com','2024-04-01'),\n ('Isha Kapoor','Mumbai','isha@mail.com','2024-05-12');\nINSERT INTO products (name, category, price, stock) VALUES\n ('Laptop Pro 14','Electronics',75000.00,15),('Wireless Mouse','Electronics',800.00,200),\n ('Office Chair','Furniture',6500.00,40),('Study Table','Furniture',9000.00,25),\n ('Running Shoes','Fashion',3500.00,60),('Cotton T-Shirt','Fashion',600.00,150),\n ('Bluetooth Speaker','Electronics',2500.00,0);\nINSERT INTO orders (customer_id, order_date, status) VALUES\n (1,'2024-06-01','DELIVERED'),(2,'2024-06-03','DELIVERED'),(1,'2024-06-10','SHIPPED'),\n (3,'2024-06-15','DELIVERED'),(4,'2024-06-20','CANCELLED'),(2,'2024-07-02','DELIVERED'),\n (5,'2024-07-05','PLACED'),(3,'2024-07-18','DELIVERED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES\n (1,1,1,75000.00),(1,2,2,800.00),(2,3,1,6500.00),(2,6,3,600.00),\n (3,5,1,3500.00),(4,4,1,9000.00),(4,3,2,6500.00),(5,7,1,2500.00),\n (6,1,1,75000.00),(6,5,2,3500.00),(7,6,4,600.00),(8,2,1,800.00),(8,6,2,600.00);\nINSERT INTO payments (order_id, amount, method, paid_on) VALUES\n (1,76600.00,'CARD','2024-06-01'),(2,8300.00,'UPI','2024-06-03'),\n (3,3500.00,'UPI','2024-06-10'),(4,22000.00,'NETBANKING','2024-06-15'),\n (6,82000.00,'CARD','2024-07-02'),(8,2000.00,'COD','2024-07-20');\nDROP VIEW IF EXISTS v_customer_360;\nDROP VIEW IF EXISTS v_order_summary;\nCREATE VIEW v_order_summary AS\nSELECT o.order_id, o.customer_id, o.order_date, o.status, c.name AS customer, c.city,\n       SUM(oi.qty)                 AS items,\n       SUM(oi.qty * oi.unit_price) AS order_value\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nGROUP BY o.order_id, o.customer_id, o.order_date, o.status, c.name, c.city;\n\nCREATE VIEW v_customer_360 AS\nSELECT c.customer_id, c.name, c.city,\n       COUNT(s.order_id)              AS valid_orders,\n       IFNULL(SUM(s.order_value), 0)  AS lifetime_value\nFROM customers c\nLEFT JOIN v_order_summary s ON s.customer_id = c.customer_id AND s.status <> 'CANCELLED'\nGROUP BY c.customer_id, c.name, c.city;\n\nSELECT order_id, customer, status, items, order_value FROM v_order_summary WHERE status = 'DELIVERED';\nSELECT name, city, valid_orders, lifetime_value FROM v_customer_360 ORDER BY lifetime_value DESC;\n\n-- Trigger: reduce stock automatically when an item is sold\nDELIMITER $$\nCREATE TRIGGER trg_order_items_stock AFTER INSERT ON order_items\nFOR EACH ROW\nBEGIN\n  UPDATE products SET stock = stock - NEW.qty WHERE product_id = NEW.product_id;\nEND$$\nDELIMITER ;\n\nINSERT INTO orders (customer_id, order_date, status) VALUES (6, '2024-07-25', 'PLACED');\nINSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (9, 2, 3, 800.00), (9, 6, 2, 600.00);\nSELECT product_id, name, stock FROM products WHERE product_id IN (2, 6);\nSELECT name, valid_orders, lifetime_value FROM v_customer_360 WHERE name = 'Isha Kapoor';",
      "result": ">> CREATE DATABASE IF NOT EXISTS ecommerce -> 1 row(s) affected\n>> USE ecommerce -> 0 row(s) affected\n>> DROP TABLE IF EXISTS payments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS order_items -> 0 row(s) affected\n>> DROP TABLE IF EXISTS orders -> 0 row(s) affected\n>> DROP TABLE IF EXISTS products -> 0 row(s) affected\n>> DROP TABLE IF EXISTS customers -> 0 row(s) affected\n>> CREATE TABLE customers ( -> 0 row(s) affected\n>> CREATE TABLE products ( -> 0 row(s) affected\n>> CREATE TABLE orders ( -> 0 row(s) affected\n>> CREATE TABLE order_items ( -> 0 row(s) affected\n>> CREATE TABLE payments ( -> 0 row(s) affected\n>> INSERT INTO customers (name, city, email, signup_date) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> INSERT INTO products (name, category, price, stock) VALUES -> 7 row(s) affected Records: 7  Duplicates: 0  Warnings: 0\n>> INSERT INTO orders (customer_id, order_date, status) VALUES -> 8 row(s) affected Records: 8  Duplicates: 0  Warnings: 0\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 13 row(s) affected Records: 13  Duplicates: 0  Warnings: 0\n>> INSERT INTO payments (order_id, amount, method, paid_on) VALUES -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> DROP VIEW IF EXISTS v_customer_360 -> 0 row(s) affected\n>> DROP VIEW IF EXISTS v_order_summary -> 0 row(s) affected\n>> CREATE VIEW v_order_summary AS -> 0 row(s) affected\n>> CREATE VIEW v_customer_360 AS -> 0 row(s) affected\n>> SELECT order_id, customer, status, items, order_value FROM v_order_sum\n+----------+--------------+-----------+-------+-------------+\n| order_id | customer     | status    | items | order_value |\n+----------+--------------+-----------+-------+-------------+\n| 1        | Rahul Khanna | DELIVERED | 3     | 76600       |\n| 2        | Neha Gupta   | DELIVERED | 4     | 8300        |\n| 4        | Amit Shah    | DELIVERED | 3     | 22000       |\n| 6        | Neha Gupta   | DELIVERED | 3     | 82000       |\n| 8        | Amit Shah    | DELIVERED | 3     | 2000        |\n+----------+--------------+-----------+-------+-------------+\n5 row(s) returned\n>> SELECT name, city, valid_orders, lifetime_value FROM v_customer_360 OR\n+----------------+-----------+--------------+----------------+\n| name           | city      | valid_orders | lifetime_value |\n+----------------+-----------+--------------+----------------+\n| Neha Gupta     | Delhi     | 2            | 90300          |\n| Rahul Khanna   | Mumbai    | 2            | 80100          |\n| Amit Shah      | Pune      | 2            | 24000          |\n| Karan Malhotra | Delhi     | 1            | 2400           |\n| Pooja Reddy    | Hyderabad | 0            | 0              |\n| Isha Kapoor    | Mumbai    | 0            | 0              |\n+----------------+-----------+--------------+----------------+\n6 row(s) returned\n>> CREATE TRIGGER trg_order_items_stock AFTER INSERT ON order_items -> 0 row(s) affected\n>> INSERT INTO orders (customer_id, order_date, status) VALUES (6, '2024- -> 1 row(s) affected\n>> INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES -> 2 row(s) affected Records: 2  Duplicates: 0  Warnings: 0\n>> SELECT product_id, name, stock FROM products WHERE product_id IN (2, 6\n+------------+----------------+-------+\n| product_id | name           | stock |\n+------------+----------------+-------+\n| 2          | Wireless Mouse | 197   |\n| 6          | Cotton T-Shirt | 148   |\n+------------+----------------+-------+\n2 row(s) returned\n>> SELECT name, valid_orders, lifetime_value FROM v_customer_360 WHERE na\n+-------------+--------------+----------------+\n| name        | valid_orders | lifetime_value |\n+-------------+--------------+----------------+\n| Isha Kapoor | 1            | 3600           |\n+-------------+--------------+----------------+\n1 row(s) returned",
      "explanation": "v_order_summary hides the 3-table join and aggregation; v_customer_360 builds on it (views can use views) with a LEFT JOIN so customers without orders appear with 0. The AFTER INSERT trigger runs once per inserted row (FOR EACH ROW) and uses NEW.qty / NEW.product_id. After the new order, the mouse and T-shirt stock drop by the quantities sold, and Isha's lifetime value becomes 3,600 (3 x 800 + 2 x 600) automatically - the views always show current data."
    },
    {
      "title": "Stored procedure: place an order in a transaction (real MySQL Workbench)",
      "scenario": "Write sp_place_order that creates an order with one product, checks stock, records the line at the current price, and commits - or rolls back with an error if stock is insufficient.",
      "steps": [
        "In the Navigator, right-click ecommerce > Stored Procedures > Create Stored Procedure... (or paste the script into a query tab)",
        "Paste the procedure body; click Apply > review the script > Apply > Finish",
        "Refresh Stored Procedures in the Navigator: sp_place_order appears",
        "Run the CALL statements; read the Output panel and the result grids"
      ],
      "code": "DELIMITER $$\nCREATE PROCEDURE sp_place_order(\n  IN  p_customer_id INT,\n  IN  p_product_id  INT,\n  IN  p_qty         INT,\n  OUT p_order_id    INT)\nBEGIN\n  DECLARE v_stock INT;\n  DECLARE v_price DECIMAL(10,2);\n  DECLARE EXIT HANDLER FOR SQLEXCEPTION\n  BEGIN\n    ROLLBACK;\n    RESIGNAL;\n  END;\n\n  START TRANSACTION;\n  SELECT stock, price INTO v_stock, v_price\n  FROM products WHERE product_id = p_product_id FOR UPDATE;   -- lock the product row\n\n  IF v_stock IS NULL THEN\n    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product not found';\n  ELSEIF v_stock < p_qty THEN\n    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';\n  END IF;\n\n  INSERT INTO orders (customer_id, order_date, status) VALUES (p_customer_id, CURDATE(), 'PLACED');\n  SET p_order_id = LAST_INSERT_ID();\n  INSERT INTO order_items (order_id, product_id, qty, unit_price)\n  VALUES (p_order_id, p_product_id, p_qty, v_price);   -- trigger reduces stock\n  COMMIT;\nEND$$\nDELIMITER ;\n\nCALL sp_place_order(4, 3, 2, @new_order);\nSELECT @new_order AS new_order_id;\nSELECT stock FROM products WHERE product_id = 3;\n\nCALL sp_place_order(4, 7, 1, @x);       -- Bluetooth Speaker has stock 0",
      "result": "CALL sp_place_order(4, 3, 2, @new_order)  -> 0 row(s) affected\n+--------------+\n| new_order_id |\n+--------------+\n| 10           |\n+--------------+\n+-------+\n| stock |\n+-------+\n| 38    |\n+-------+\nCALL sp_place_order(4, 7, 1, @x)  -> Error Code: 1644. Insufficient stock",
      "explanation": "The procedure wraps the order in a transaction: SELECT ... FOR UPDATE locks the product row so two customers cannot buy the last item at the same time; SIGNAL raises a custom error; the EXIT HANDLER rolls back and re-raises the error so the caller sees it. The successful call returns the new order id and the Office Chair stock drops from 40 to 38 (via the trigger). The second call fails cleanly and nothing is inserted. Stored procedures are not supported in the browser Lab - run this in MySQL Workbench."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between SQL and MySQL?",
      "a": "SQL is the standard language for relational databases; MySQL is a relational database management system (RDBMS) that implements SQL (with its own extensions).",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between DELETE, TRUNCATE and DROP?",
      "a": "DELETE removes selected rows (DML, rollback possible, triggers fire); TRUNCATE removes all rows fast and resets AUTO_INCREMENT (DDL, no rollback); DROP removes the table itself.",
      "level": "Beginner"
    },
    {
      "q": "What is a primary key vs a unique key?",
      "a": "Both enforce uniqueness. A table has one primary key, which cannot be NULL and is the clustered index in InnoDB; it can have many unique keys, which allow NULLs.",
      "level": "Beginner"
    },
    {
      "q": "What is a foreign key and what do ON DELETE CASCADE / SET NULL do?",
      "a": "A foreign key links a child column to a parent key and prevents orphans. CASCADE deletes/updates child rows with the parent; SET NULL sets the child FK to NULL; RESTRICT/NO ACTION block the parent change.",
      "level": "Beginner"
    },
    {
      "q": "Explain the types of joins.",
      "a": "INNER (matching rows only), LEFT (all left + matches), RIGHT (all right + matches), FULL OUTER (all from both; emulate with LEFT UNION RIGHT in MySQL), CROSS (Cartesian product), SELF (table joined to itself).",
      "level": "Beginner"
    },
    {
      "q": "WHERE vs HAVING?",
      "a": "WHERE filters rows before grouping and cannot use aggregates; HAVING filters groups after GROUP BY and can.",
      "level": "Beginner"
    },
    {
      "q": "How do you find the second highest salary?",
      "a": "SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp); or SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1; or DENSE_RANK() = 2.",
      "level": "Intermediate"
    },
    {
      "q": "How do you find duplicate rows and delete them keeping one?",
      "a": "Find: GROUP BY cols HAVING COUNT(*) > 1. Delete: DELETE t1 FROM t t1 JOIN t t2 ON t1.email = t2.email AND t1.id > t2.id; or use ROW_NUMBER() in a CTE and delete rn > 1.",
      "level": "Intermediate"
    },
    {
      "q": "What is the difference between UNION and UNION ALL?",
      "a": "UNION removes duplicates (extra sort/dedupe cost); UNION ALL keeps all rows and is faster.",
      "level": "Beginner"
    },
    {
      "q": "What is a subquery vs a correlated subquery?",
      "a": "A subquery runs independently once; a correlated subquery references the outer query and is logically evaluated per outer row.",
      "level": "Intermediate"
    },
    {
      "q": "EXISTS vs IN?",
      "a": "IN compares with a list/subquery result; EXISTS checks whether the subquery returns any row and stops at the first match. NOT IN fails silently when the subquery returns a NULL; NOT EXISTS is NULL-safe.",
      "level": "Intermediate"
    },
    {
      "q": "What is a view and can you update it?",
      "a": "A stored SELECT that acts like a virtual table. Simple views (one table, no aggregates/DISTINCT/GROUP BY/UNION) are updatable; WITH CHECK OPTION prevents updates that would make rows disappear from the view.",
      "level": "Beginner"
    },
    {
      "q": "What is an index and how does it speed up queries?",
      "a": "A B-tree structure on one or more columns that lets MySQL find rows without scanning the whole table; it speeds reads but slows writes and uses space.",
      "level": "Beginner"
    },
    {
      "q": "What is a clustered index in InnoDB?",
      "a": "The primary key; table rows are physically stored in primary-key order. Secondary indexes store the primary key value to find the row.",
      "level": "Advanced"
    },
    {
      "q": "What is a composite index and the leftmost prefix rule?",
      "a": "An index on several columns (a, b, c). It can be used for conditions on a, a+b, or a+b+c, but not on b or c alone.",
      "level": "Advanced"
    },
    {
      "q": "How do you analyse a slow query?",
      "a": "Run EXPLAIN (or Workbench Visual Explain / EXPLAIN ANALYZE): check type (ALL = full scan), key used, rows examined, Using filesort/temporary; then add or adjust indexes and rewrite non-sargable conditions.",
      "level": "Advanced"
    },
    {
      "q": "What is a stored procedure vs a function?",
      "a": "A procedure is called with CALL, can have IN/OUT/INOUT parameters, return result sets and manage transactions. A function returns a single value and can be used inside SQL expressions.",
      "level": "Intermediate"
    },
    {
      "q": "What is a trigger? Give a use case.",
      "a": "Code that runs automatically BEFORE/AFTER INSERT, UPDATE or DELETE on a table, per row. Use cases: audit logs, stock updates, enforcing complex rules.",
      "level": "Intermediate"
    },
    {
      "q": "What are the ACID properties?",
      "a": "Atomicity (all or nothing), Consistency (rules preserved), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes).",
      "level": "Beginner"
    },
    {
      "q": "What are the transaction isolation levels and MySQL's default?",
      "a": "READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ (InnoDB default), SERIALIZABLE; they trade consistency (dirty, non-repeatable, phantom reads) for concurrency.",
      "level": "Advanced"
    },
    {
      "q": "What is a deadlock and how does MySQL handle it?",
      "a": "Two transactions each wait for a lock the other holds. InnoDB detects it, rolls back one transaction (Error 1213) and the application should retry.",
      "level": "Advanced"
    },
    {
      "q": "What are window functions? Difference between ROW_NUMBER, RANK and DENSE_RANK?",
      "a": "Functions computed over a window of rows without collapsing them (OVER clause). For ties: ROW_NUMBER gives 1,2,3; RANK gives 1,1,3; DENSE_RANK gives 1,1,2.",
      "level": "Intermediate"
    },
    {
      "q": "What is a CTE and a recursive CTE?",
      "a": "A named temporary result defined with WITH before the main query; a recursive CTE references itself to walk hierarchies (org charts, categories) or generate series.",
      "level": "Intermediate"
    },
    {
      "q": "What is normalization? Explain 1NF, 2NF, 3NF.",
      "a": "Organizing tables to reduce redundancy. 1NF: atomic values; 2NF: no partial dependency on a composite key; 3NF: no transitive dependency between non-key columns.",
      "level": "Beginner"
    },
    {
      "q": "CHAR vs VARCHAR?",
      "a": "CHAR(n) is fixed length (padded), good for fixed codes; VARCHAR(n) is variable length with a length prefix, good for names and text.",
      "level": "Beginner"
    },
    {
      "q": "What is AUTO_INCREMENT and does DELETE reset it?",
      "a": "A column that automatically gets the next number on insert. DELETE does not reset it; TRUNCATE or ALTER TABLE ... AUTO_INCREMENT = n does.",
      "level": "Beginner"
    },
    {
      "q": "How do NULLs behave in comparisons and aggregates?",
      "a": "Any comparison with NULL is unknown (use IS NULL / IS NOT NULL or <=>). Aggregates ignore NULLs except COUNT(*). NULL + 1 = NULL.",
      "level": "Beginner"
    },
    {
      "q": "What is Error 1175 in Workbench?",
      "a": "Safe update mode blocks UPDATE/DELETE without a key-based WHERE or LIMIT. Fix with a key in WHERE, LIMIT, SET SQL_SAFE_UPDATES = 0 for the session, or unticking Preferences > SQL Editor > Safe Updates and reconnecting.",
      "level": "Beginner"
    },
    {
      "q": "What is forward and reverse engineering in Workbench?",
      "a": "Forward: generate and run DDL from an EER model (Database > Forward Engineer). Reverse: create an EER model from an existing database (Database > Reverse Engineer).",
      "level": "Beginner"
    },
    {
      "q": "How do you back up and restore a MySQL database?",
      "a": "mysqldump --single-transaction --routines db > db.sql and mysql db < db.sql, or Workbench Server > Data Export / Data Import. Use binary logs for point-in-time recovery.",
      "level": "Beginner"
    },
    {
      "q": "How do you give a user read-only access to one database?",
      "a": "CREATE USER 'u'@'host' IDENTIFIED BY '...'; GRANT SELECT ON db.* TO 'u'@'host'; - or the Workbench Users and Privileges screen.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between MyISAM and InnoDB?",
      "a": "InnoDB (default) supports transactions, row-level locking, foreign keys and crash recovery; MyISAM has table-level locks, no transactions or FKs.",
      "level": "Intermediate"
    },
    {
      "q": "What is the logical order of execution of a SELECT?",
      "a": "FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT (window functions) -> DISTINCT -> ORDER BY -> LIMIT.",
      "level": "Beginner"
    },
    {
      "q": "How would you get the top 2 products per category?",
      "a": "Use ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) in a CTE and filter rn <= 2.",
      "level": "Intermediate"
    },
    {
      "q": "What is the difference between DATETIME and TIMESTAMP?",
      "a": "TIMESTAMP is stored in UTC and converted to the session time zone (range 1970-2038); DATETIME stores the literal value (1000-9999) without conversion.",
      "level": "Intermediate"
    }
  ],
  "practice": [
    {
      "task": "Practical test A1: Create a table reviews (review_id PK auto, product_id FK -> products, customer_id FK -> customers, rating 1-5, review_text, review_date default current date); one review per customer per product.",
      "hint": "CHECK on rating, UNIQUE (product_id, customer_id).",
      "solution": "CREATE TABLE reviews (\n  review_id INT AUTO_INCREMENT PRIMARY KEY,\n  product_id INT NOT NULL,\n  customer_id INT NOT NULL,\n  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),\n  review_text VARCHAR(500),\n  review_date DATE DEFAULT (CURRENT_DATE),\n  UNIQUE KEY uq_review (product_id, customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)\n);"
    },
    {
      "task": "Practical test B1: For each category show the best-selling product by units sold (non-cancelled orders).",
      "hint": "CTE with SUM(qty) per product and ROW_NUMBER() PARTITION BY category.",
      "solution": "WITH sales AS (\n  SELECT p.category, p.name, SUM(oi.qty) AS units,\n         ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.qty) DESC) AS rn\n  FROM order_items oi\n  JOIN products p ON p.product_id = oi.product_id\n  JOIN orders o   ON o.order_id = oi.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY p.category, p.product_id, p.name\n)\nSELECT category, name, units FROM sales WHERE rn = 1;"
    },
    {
      "task": "Practical test B2: List customers whose total spend is above the average customer spend.",
      "hint": "Aggregate per customer in a CTE, compare with AVG over that CTE.",
      "solution": "WITH spend AS (\n  SELECT o.customer_id, SUM(oi.qty * oi.unit_price) AS total\n  FROM orders o JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status <> 'CANCELLED'\n  GROUP BY o.customer_id\n)\nSELECT c.name, s.total\nFROM spend s JOIN customers c ON c.customer_id = s.customer_id\nWHERE s.total > (SELECT AVG(total) FROM spend)\nORDER BY s.total DESC;"
    },
    {
      "task": "Practical test C1: In one transaction, cancel order 7 and restore its stock; roll back if anything fails.",
      "hint": "START TRANSACTION, UPDATE orders, UPDATE products with a subquery, COMMIT.",
      "solution": "START TRANSACTION;\nUPDATE orders SET status = 'CANCELLED' WHERE order_id = 7;\nUPDATE products p\nSET stock = stock + (SELECT SUM(qty) FROM order_items oi WHERE oi.order_id = 7 AND oi.product_id = p.product_id)\nWHERE product_id IN (SELECT product_id FROM order_items WHERE order_id = 7);\nCOMMIT;      -- or ROLLBACK; if the checks fail"
    },
    {
      "task": "Practical test D1: Create a read-only user analyst for ecommerce, back up the schema with mysqldump, and explain Q3 with EXPLAIN.",
      "hint": "CREATE USER + GRANT SELECT; mysqldump --single-transaction; EXPLAIN SELECT ...",
      "solution": "CREATE USER 'analyst'@'localhost' IDENTIFIED BY 'An@lyst2025';\nGRANT SELECT ON ecommerce.* TO 'analyst'@'localhost';\n-- terminal: mysqldump -u root -p --single-transaction --routines --triggers ecommerce > ecommerce.sql\nEXPLAIN SELECT p.name, SUM(oi.qty * oi.unit_price) AS revenue\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.name ORDER BY revenue DESC LIMIT 3;"
    },
    {
      "task": "Practical test D2: Monthly report - for each month show orders, revenue, unique customers and the top category (by revenue).",
      "hint": "Two CTEs: monthly totals and monthly category ranking, then join.",
      "solution": "WITH lines AS (\n  SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, o.order_id, o.customer_id,\n         p.category, oi.qty * oi.unit_price AS amount\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p     ON p.product_id = oi.product_id\n  WHERE o.status <> 'CANCELLED'\n),\ncat AS (\n  SELECT month, category,\n         ROW_NUMBER() OVER (PARTITION BY month ORDER BY SUM(amount) DESC) AS rn\n  FROM lines GROUP BY month, category\n)\nSELECT l.month, COUNT(DISTINCT l.order_id) AS orders, SUM(l.amount) AS revenue,\n       COUNT(DISTINCT l.customer_id) AS customers, c.category AS top_category\nFROM lines l JOIN cat c ON c.month = l.month AND c.rn = 1\nGROUP BY l.month, c.category\nORDER BY l.month;"
    }
  ],
  "quiz": [
    {
      "question": "In the project, why is unit_price stored in order_items as well as price in products?",
      "options": [
        "It is a normalization mistake",
        "MySQL requires it for foreign keys",
        "To make joins faster",
        "To keep the price at the time of sale even if the product price changes later"
      ],
      "answer": 3,
      "explanation": "Historical price is a different fact from the current price."
    },
    {
      "question": "Which pattern returns the single biggest order for each customer?",
      "options": [
        "GROUP BY customer_id with MAX(order_id)",
        "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_value DESC) = 1",
        "ORDER BY order_value DESC LIMIT 1",
        "DISTINCT customer_id"
      ],
      "answer": 1,
      "explanation": "Top-1-per-group is a window-function job."
    },
    {
      "question": "Which query finds customers who never ordered?",
      "options": [
        "SELECT c.* FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL",
        "SELECT * FROM customers INNER JOIN orders USING (customer_id)",
        "SELECT * FROM orders WHERE customer_id IS NULL",
        "SELECT * FROM customers WHERE orders = 0"
      ],
      "answer": 0,
      "explanation": "Anti-join: LEFT JOIN + IS NULL on the right key (or NOT EXISTS)."
    },
    {
      "question": "A trigger that reduces stock after each sale should be:",
      "options": [
        "BEFORE DELETE ON products",
        "AFTER UPDATE ON customers",
        "AFTER INSERT ON order_items FOR EACH ROW",
        "A view"
      ],
      "answer": 2,
      "explanation": "Each inserted order line reduces its product's stock."
    },
    {
      "question": "Why does the procedure use SELECT ... FOR UPDATE inside a transaction?",
      "options": [
        "To make the SELECT faster",
        "To lock the product row so concurrent orders cannot oversell the stock",
        "To update the price",
        "It is required for every SELECT"
      ],
      "answer": 1,
      "explanation": "FOR UPDATE takes an exclusive row lock until COMMIT/ROLLBACK."
    }
  ]
};
