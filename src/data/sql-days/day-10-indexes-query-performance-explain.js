export default {
  "id": "day-10-indexes-query-performance-explain",
  "title": "Indexes and Query Performance, EXPLAIN",
  "module": "Module 2: Joins & Functions",
  "day": 10,
  "level": "Intermediate",
  "duration": "2.5 hours",
  "summary": "Understand how indexes make searches fast, create single, composite and unique indexes, read EXPLAIN plans, and follow practical rules for writing fast queries.",
  "objectives": [
    "Explain what an index is and how a B-Tree index speeds up lookups",
    "Create and drop single-column, composite and unique indexes",
    "Know clustered (primary key) vs secondary indexes in InnoDB",
    "Read EXPLAIN output in MySQL (type, key, rows) and EXPLAIN QUERY PLAN in SQLite",
    "Apply query-optimisation tips and avoid patterns that disable indexes"
  ],
  "theory": [
    {
      "heading": "What is an Index?",
      "content": "An index is a separate, sorted data structure that helps the database find rows without reading the whole table. Analogy: the index at the back of a textbook. To find \"Normalization\" you do not read all 500 pages; you look it up in the alphabetical index and jump to page 312. Without an index, MySQL does a full table scan: it checks every row.",
      "points": [
        "Speeds up WHERE, JOIN, ORDER BY and GROUP BY on the indexed columns",
        "Costs disk space and slows down INSERT/UPDATE/DELETE a little (the index must be updated too)",
        "MySQL InnoDB uses B+Tree indexes: sorted, balanced, finds a row in a few steps even among millions",
        "PRIMARY KEY and UNIQUE constraints automatically create indexes; MySQL also indexes foreign keys automatically"
      ]
    },
    {
      "heading": "Types of Indexes",
      "content": "Different index types serve different needs.",
      "syntax": "CREATE INDEX idx_emp_city ON employees(city);                 -- single column\nCREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date); -- composite\nCREATE UNIQUE INDEX uq_cust_email ON customers(email);         -- unique\nDROP INDEX idx_emp_city ON employees;      -- MySQL\nDROP INDEX idx_emp_city;                   -- SQLite\nSHOW INDEX FROM employees;                 -- MySQL",
      "points": [
        "Clustered index (InnoDB): the PRIMARY KEY; the table rows themselves are stored in PK order. Only one per table",
        "Secondary (non-clustered) index: separate structure storing the column value + the primary key",
        "Composite index: several columns; follows the LEFTMOST PREFIX rule",
        "Unique index: also enforces no duplicates",
        "FULLTEXT index: word search in long text (MATCH ... AGAINST)",
        "Covering index: contains all columns the query needs, so the table is not touched (\"Using index\" in EXPLAIN)"
      ]
    },
    {
      "heading": "The Leftmost Prefix Rule for Composite Indexes",
      "content": "A composite index on (customer_id, order_date) is sorted first by customer_id, then by order_date inside each customer, like a phone book sorted by surname then first name. It helps queries that filter on customer_id, or on customer_id AND order_date. It does NOT help a query that filters only on order_date, just as a phone book cannot quickly find everyone whose first name is \"Rahul\".",
      "points": [
        "INDEX(a, b, c) helps: WHERE a=?, WHERE a=? AND b=?, WHERE a=? AND b=? AND c=?",
        "Does not help (much): WHERE b=?, WHERE c=?",
        "Put the most frequently filtered, equality-compared column first"
      ]
    },
    {
      "heading": "Reading EXPLAIN",
      "content": "EXPLAIN shows how MySQL plans to run a query, without running it. EXPLAIN ANALYZE (MySQL 8.0.18+) actually runs it and shows real timings. In SQLite use EXPLAIN QUERY PLAN.",
      "syntax": "EXPLAIN SELECT * FROM orders WHERE customer_id = 1;\nEXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 1;  -- MySQL 8.0.18+\nEXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1; -- SQLite",
      "points": [
        "type: access method, from best to worst: const, eq_ref, ref, range, index, ALL (ALL = full table scan)",
        "possible_keys: indexes MySQL could use; key: the index it actually chose",
        "rows: estimated rows to examine (smaller is better)",
        "Extra: \"Using index\" (covering, good), \"Using where\", \"Using filesort\" or \"Using temporary\" (extra work)",
        "SQLite: \"SCAN table\" = full scan, \"SEARCH table USING INDEX ...\" = index lookup"
      ]
    },
    {
      "heading": "Writing Fast Queries: Practical Rules",
      "content": "Most slow queries come from a few common mistakes.",
      "points": [
        "Select only needed columns, not SELECT *",
        "Do not wrap indexed columns in functions: WHERE YEAR(order_date) = 2024 cannot use the index; use a range instead",
        "Leading wildcard LIKE '%abc' cannot use an index; 'abc%' can",
        "Avoid implicit type conversion: WHERE phone = 98765 on a VARCHAR column ignores the index",
        "Index columns used in JOIN ON, WHERE and ORDER BY; do not index everything (low-selectivity columns like gender rarely help)",
        "Use LIMIT for pagination, and keyset pagination (WHERE id > last_id) for deep pages",
        "Check slow queries with the slow query log and EXPLAIN"
      ],
      "tip": "Selectivity = distinct values / total rows. High selectivity columns (email, order_id) make great indexes; a status column with 3 values usually does not."
    }
  ],
  "examples": [
    {
      "title": "Full Table Scan vs Index Search",
      "scenario": "Customer support searches orders by customer_id all day. See how the plan changes after adding an index.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nEXPLAIN SELECT * FROM orders WHERE customer_id = 1;   -- type: ALL (no index yet)*\nCREATE INDEX idx_orders_customer ON orders(customer_id);\nEXPLAIN SELECT * FROM orders WHERE customer_id = 1;   -- type: ref, key: idx_orders_customer\n-- *In MySQL the foreign key already creates an index automatically; this demo\n--  assumes a table without the FK.",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1;\nCREATE INDEX idx_orders_customer ON orders(customer_id);\nEXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 1;"
      },
      "result": "id | parent | notused | detail\n---+--------+---------+------------\n2  | 0      | 0       | SCAN orders\n(1 row)\n\nid | parent | notused | detail\n---+--------+---------+--------------------------------------------------------------\n3  | 0      | 0       | SEARCH orders USING INDEX idx_orders_customer (customer_id=?)\n(1 row)",
      "explanation": "Before the index, SQLite must SCAN every order row. After CREATE INDEX, it SEARCHes the index for customer_id = 1 and jumps straight to the 3 matching rows. On 10 rows you will not feel the difference; on 10 million rows it is seconds versus milliseconds."
    },
    {
      "title": "Composite Index and the Leftmost Prefix Rule",
      "scenario": "Create an index on (customer_id, order_date) and check which queries can use it.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "CREATE INDEX idx_cust_date ON orders(customer_id, order_date);\nEXPLAIN QUERY PLAN SELECT order_id FROM orders WHERE customer_id = 1 AND order_date >= '2024-02-01';\nEXPLAIN QUERY PLAN SELECT order_id FROM orders WHERE order_date >= '2024-02-01';",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "CREATE INDEX idx_cust_date ON orders(customer_id, order_date);\nEXPLAIN QUERY PLAN SELECT order_id FROM orders WHERE customer_id = 1 AND order_date >= '2024-02-01';\nEXPLAIN QUERY PLAN SELECT order_id FROM orders WHERE order_date >= '2024-02-01';"
      },
      "result": "id | parent | notused | detail\n---+--------+---------+----------------------------------------------------------------------------------\n2  | 0      | 0       | SEARCH orders USING COVERING INDEX idx_cust_date (customer_id=? AND order_date>?)\n(1 row)\n\nid | parent | notused | detail\n---+--------+---------+-----------------------------------------------\n2  | 0      | 0       | SCAN orders USING COVERING INDEX idx_cust_date\n(1 row)",
      "explanation": "The first query filters on the leftmost column plus a range on the second, so it SEARCHes the index. The second query filters only on order_date (not the leftmost column), so the index cannot seek and SQLite falls back to a full scan (here it scans the small covering index instead of the table, but it still reads every entry)."
    },
    {
      "title": "Functions on Indexed Columns Kill Index Use",
      "scenario": "A developer filters employees hired in 2023 with a function. Compare it with a sargable range.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- Bad: function on the column\nEXPLAIN SELECT name FROM employees WHERE YEAR(hire_date) = 2023;\n-- Good: range on the raw column\nEXPLAIN SELECT name FROM employees\nWHERE hire_date >= '2023-01-01' AND hire_date < '2024-01-01';",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE INDEX idx_emp_hire ON employees(hire_date);",
        "query": "EXPLAIN QUERY PLAN SELECT name FROM employees WHERE strftime('%Y', hire_date) = '2023';\nEXPLAIN QUERY PLAN SELECT name FROM employees\nWHERE hire_date >= '2023-01-01' AND hire_date < '2024-01-01';"
      },
      "result": "id | parent | notused | detail\n---+--------+---------+---------------\n2  | 0      | 0       | SCAN employees\n(1 row)\n\nid | parent | notused | detail\n---+--------+---------+------------------------------------------------------------------------\n3  | 0      | 0       | SEARCH employees USING INDEX idx_emp_hire (hire_date>? AND hire_date<?)\n(1 row)",
      "explanation": "Wrapping hire_date in a function forces a SCAN because the index stores raw dates, not years. The range version uses the index (SEARCH ... USING INDEX idx_emp_hire). Queries that can use an index are called SARGable (Search ARGument able)."
    },
    {
      "title": "Unique Index Enforces Business Rules",
      "scenario": "Two customers must never share an email. Add a unique index and try to insert a duplicate.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "INSERT INTO customers (name, city, email) VALUES ('Fake Amit', 'Delhi', 'amit@mail.com');",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE UNIQUE INDEX uq_customer_email ON customers(email);",
        "query": "INSERT INTO customers (name, city, email) VALUES ('Fake Amit', 'Delhi', 'amit@mail.com');"
      },
      "result": "Error: UNIQUE constraint failed: customers.email",
      "explanation": "A unique index speeds up email lookups AND blocks duplicates. In MySQL the error is \"Duplicate entry 'amit@mail.com' for key 'customers.uq_customer_email'\". NULL emails are still allowed (John has NULL) because NULL is not equal to NULL."
    },
    {
      "title": "Listing Indexes on a Table",
      "scenario": "Before adding an index, check which indexes already exist.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSHOW INDEX FROM employees;\n-- or\nSELECT index_name, column_name, seq_in_index, non_unique\nFROM information_schema.statistics\nWHERE table_schema = 'company_db' AND table_name = 'employees';",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE INDEX idx_emp_city ON employees(city);\nCREATE INDEX idx_emp_dept_sal ON employees(dept_id, salary);",
        "query": "SELECT name AS index_name, tbl_name AS table_name\nFROM sqlite_master\nWHERE type = 'index' AND tbl_name = 'employees'\nORDER BY name;"
      },
      "result": "index_name       | table_name\n-----------------+-----------\nidx_emp_city     | employees\nidx_emp_dept_sal | employees\n(2 rows)",
      "explanation": "MySQL lists indexes with SHOW INDEX (including PRIMARY). SQLite keeps index definitions in sqlite_master; the rowid primary key is built into the table, so it is not listed. Duplicate or unused indexes waste space and slow down writes, so review them regularly."
    }
  ],
  "interview": [
    {
      "q": "What is an index?",
      "a": "A data structure (usually a B+Tree) that stores column values in sorted order with pointers to rows, so the database can find rows without scanning the entire table.",
      "level": "Easy"
    },
    {
      "q": "Advantages and disadvantages of indexes?",
      "a": "Faster SELECT, JOIN, ORDER BY, GROUP BY. Costs: extra storage, slower INSERT/UPDATE/DELETE, and maintenance. Too many indexes can hurt write-heavy tables.",
      "level": "Medium"
    },
    {
      "q": "Difference between clustered and non-clustered index?",
      "a": "A clustered index defines the physical order of rows (InnoDB primary key); only one per table. A non-clustered (secondary) index is a separate structure with column values and the primary key pointing to rows; many are allowed.",
      "level": "Medium"
    },
    {
      "q": "What is a composite index and the leftmost prefix rule?",
      "a": "An index on multiple columns. MySQL can use it only for queries that filter on a leftmost prefix of its columns: INDEX(a,b,c) helps (a), (a,b), (a,b,c), not (b) or (c) alone.",
      "level": "Medium"
    },
    {
      "q": "What is a covering index?",
      "a": "An index that contains every column a query needs, so MySQL answers from the index alone without reading the table. EXPLAIN shows \"Using index\".",
      "level": "Hard"
    },
    {
      "q": "What does EXPLAIN show? Which values of type are bad?",
      "a": "The execution plan: table access type, possible and chosen keys, estimated rows, extra info. type = ALL (full scan) and index (full index scan) on big tables are warning signs; Using filesort / Using temporary mean extra work.",
      "level": "Medium"
    },
    {
      "q": "Why might MySQL not use an index you created?",
      "a": "Function on the column, leading % in LIKE, type mismatch, low selectivity (optimizer prefers a scan), OR across different columns, not using the leftmost prefix, or outdated statistics (run ANALYZE TABLE).",
      "level": "Hard"
    },
    {
      "q": "Primary key vs unique index?",
      "a": "Both are unique indexes. Primary key: one per table, NOT NULL, clustered in InnoDB. Unique index: many per table, allows NULLs, secondary.",
      "level": "Medium"
    },
    {
      "q": "Should you index every column?",
      "a": "No. Index columns used often in WHERE, JOIN and ORDER BY with good selectivity. Every index slows writes and uses space.",
      "level": "Easy"
    },
    {
      "q": "How do you find slow queries in MySQL?",
      "a": "Enable the slow query log (slow_query_log = ON, long_query_time = 1), check performance_schema / sys schema views, then analyse the queries with EXPLAIN / EXPLAIN ANALYZE.",
      "level": "Hard"
    },
    {
      "q": "What is the difference between EXPLAIN and EXPLAIN ANALYZE?",
      "a": "EXPLAIN shows the estimated plan without running the query. EXPLAIN ANALYZE (MySQL 8.0.18+) runs the query and reports actual rows and time for each step.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Create an index on products(category) and check the plan of a category filter.",
      "hint": "CREATE INDEX then EXPLAIN QUERY PLAN (EXPLAIN in MySQL).",
      "solution": "CREATE INDEX idx_prod_category ON products(category);\nEXPLAIN QUERY PLAN SELECT name FROM products WHERE category = 'Furniture';"
    },
    {
      "task": "Rewrite this to use an index on order_date: SELECT * FROM orders WHERE strftime('%m', order_date) = '03' AND strftime('%Y', order_date) = '2024';",
      "hint": "Use a date range.",
      "solution": "SELECT * FROM orders WHERE order_date >= '2024-03-01' AND order_date < '2024-04-01';"
    },
    {
      "task": "Create a composite index useful for: WHERE dept_id = ? ORDER BY salary DESC.",
      "hint": "Equality column first, then the sort column.",
      "solution": "CREATE INDEX idx_dept_salary ON employees(dept_id, salary);\nEXPLAIN QUERY PLAN SELECT name, salary FROM employees WHERE dept_id = 2 ORDER BY salary DESC;"
    },
    {
      "task": "Drop the index idx_dept_salary in MySQL and in SQLite.",
      "hint": "MySQL needs the table name.",
      "solution": "-- MySQL\nDROP INDEX idx_dept_salary ON employees;\n-- SQLite\nDROP INDEX idx_dept_salary;"
    }
  ],
  "quiz": [
    {
      "question": "Which EXPLAIN type means a full table scan in MySQL?",
      "options": [
        "const",
        "ref",
        "ALL",
        "range"
      ],
      "answer": 2,
      "explanation": "type = ALL reads every row."
    },
    {
      "question": "An index on (a, b) can be used efficiently by:",
      "options": [
        "WHERE b = 1",
        "WHERE a = 1",
        "WHERE c = 1",
        "None of these"
      ],
      "answer": 1,
      "explanation": "Leftmost prefix rule: a must be used."
    },
    {
      "question": "Indexes generally make which operation slower?",
      "options": [
        "SELECT with WHERE",
        "ORDER BY",
        "JOIN",
        "INSERT"
      ],
      "answer": 3,
      "explanation": "Every write must also update the indexes."
    },
    {
      "question": "How many clustered indexes can an InnoDB table have?",
      "options": [
        "One",
        "Two",
        "Unlimited",
        "Zero"
      ],
      "answer": 0,
      "explanation": "Rows are stored in primary key order, so only one."
    },
    {
      "question": "Which WHERE clause can use an index on name?",
      "options": [
        "name LIKE '%esh'",
        "UPPER(name) = 'ASHA'",
        "name LIKE 'Ash%'",
        "name LIKE '%sh%'"
      ],
      "answer": 2,
      "explanation": "A prefix pattern without a leading wildcard can use the index."
    }
  ]
};
