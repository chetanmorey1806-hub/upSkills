export default {
  "id": "day-09-set-operations-views",
  "title": "Set Operations (UNION, UNION ALL), Views",
  "module": "Module 2: Joins & Functions",
  "day": 9,
  "level": "Intermediate",
  "duration": "2 hours",
  "summary": "Stack the results of several queries with UNION, UNION ALL, INTERSECT and EXCEPT, and save useful queries as reusable virtual tables called views.",
  "objectives": [
    "Combine query results with UNION and UNION ALL and explain the difference",
    "Use INTERSECT and EXCEPT (MySQL 8.0.31+) and their older alternatives",
    "Follow the rules for set operations: same number of columns, compatible types",
    "Create, use, replace and drop views",
    "Explain the benefits and limits of views, including updatable views"
  ],
  "theory": [
    {
      "heading": "Set Operations: Stacking Results Vertically",
      "content": "Joins put tables side by side (more columns). Set operations put query results one below the other (more rows). Imagine two guest lists for a wedding, one from the bride's family and one from the groom's. UNION gives one combined list without duplicates; UNION ALL just staples the two lists together.",
      "points": [
        "UNION: combine and remove duplicate rows (sorts/hashes internally, slower)",
        "UNION ALL: combine and keep all rows, including duplicates (faster)",
        "INTERSECT: rows present in both results (MySQL 8.0.31+)",
        "EXCEPT: rows in the first result but not in the second (MySQL 8.0.31+; Oracle calls it MINUS)"
      ]
    },
    {
      "heading": "Rules for Set Operations",
      "content": "The queries must be \"union-compatible\".",
      "syntax": "SELECT name, city, 'Employee' AS type FROM employees\nUNION ALL\nSELECT name, city, 'Customer' FROM customers\nORDER BY city;",
      "points": [
        "Same number of columns in every SELECT",
        "Corresponding columns should have compatible data types",
        "Column names of the result come from the FIRST SELECT",
        "Only one ORDER BY, at the very end, applying to the whole result",
        "Add a literal column ('Employee' AS type) to know which query a row came from"
      ]
    },
    {
      "heading": "INTERSECT and EXCEPT in Older MySQL",
      "content": "Before MySQL 8.0.31 there was no INTERSECT or EXCEPT. You will still see these patterns in interviews and older code.",
      "syntax": "-- INTERSECT alternative\nSELECT DISTINCT a.city FROM employees a\nWHERE a.city IN (SELECT city FROM customers);\n-- EXCEPT alternative\nSELECT DISTINCT e.city FROM employees e\nWHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.city = e.city);"
    },
    {
      "heading": "What is a View?",
      "content": "A view is a saved SELECT query with a name. It looks and behaves like a table when you query it, but it stores no data of its own (it is a virtual table); every time you select from it, the underlying query runs. Analogy: a view is a window into a room. The room (tables) holds the furniture; the window just decides what part you can see.",
      "syntax": "CREATE VIEW view_name AS\nSELECT ...;\n\nSELECT * FROM view_name WHERE ...;\n\nCREATE OR REPLACE VIEW view_name AS SELECT ...;   -- MySQL\nDROP VIEW IF EXISTS view_name;",
      "points": [
        "Simplicity: hide complex joins behind a simple name",
        "Security: give users access to a view that hides salary or other private columns",
        "Consistency: everyone uses the same business logic (\"active customer\")",
        "Views do not make queries faster by themselves (MySQL has no materialized views)"
      ]
    },
    {
      "heading": "Updatable Views and WITH CHECK OPTION",
      "content": "In MySQL a simple view on one table (no GROUP BY, DISTINCT, aggregates, UNION or subquery in SELECT) is updatable: INSERT/UPDATE/DELETE on the view changes the base table. WITH CHECK OPTION prevents changes that would make a row disappear from the view.",
      "syntax": "CREATE VIEW mumbai_staff AS\nSELECT emp_id, name, city FROM employees WHERE city = 'Mumbai'\nWITH CHECK OPTION;\nUPDATE mumbai_staff SET city = 'Pune' WHERE emp_id = 3;  -- rejected by CHECK OPTION",
      "tip": "SQLite views are read-only (unless you write INSTEAD OF triggers). So in the SQL Lab, query views but update the base tables."
    }
  ],
  "examples": [
    {
      "title": "UNION vs UNION ALL",
      "scenario": "Build a contact list of all cities where we have employees or customers. Compare UNION and UNION ALL counts.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT city FROM employees\nUNION\nSELECT city FROM customers\nORDER BY city;\nSELECT COUNT(*) AS union_all_rows\nFROM (SELECT city FROM employees UNION ALL SELECT city FROM customers) t;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT city FROM employees\nUNION\nSELECT city FROM customers\nORDER BY city;\nSELECT COUNT(*) AS union_all_rows\nFROM (SELECT city FROM employees UNION ALL SELECT city FROM customers) t;"
      },
      "result": "city\n---------\nBengaluru\nChennai\nDelhi\nGoa\nHyderabad\nMumbai\nPune\n(7 rows)\n\nunion_all_rows\n--------------\n15\n(1 row)",
      "explanation": "UNION returns 7 distinct cities (duplicates such as Mumbai and Pune appear once). UNION ALL keeps every row: 9 employees + 6 customers = 15. Use UNION ALL when duplicates are impossible or wanted; it skips the de-duplication work."
    },
    {
      "title": "Combining Different Tables with a Type Label",
      "scenario": "Create one mailing list of employees and customers in Mumbai and Pune, marking who is who.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, city, 'Employee' AS person_type FROM employees\nWHERE city IN ('Mumbai', 'Pune')\nUNION ALL\nSELECT name, city, 'Customer' FROM customers\nWHERE city IN ('Mumbai', 'Pune')\nORDER BY city, person_type, name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, city, 'Employee' AS person_type FROM employees\nWHERE city IN ('Mumbai', 'Pune')\nUNION ALL\nSELECT name, city, 'Customer' FROM customers\nWHERE city IN ('Mumbai', 'Pune')\nORDER BY city, person_type, name;"
      },
      "result": "name         | city   | person_type\n-------------+--------+------------\nAmit Kumar   | Mumbai | Customer\nPriya Shah   | Mumbai | Employee\nSneha Iyer   | Mumbai | Employee\nVikram Singh | Mumbai | Employee\nPooja Verma  | Pune   | Customer\nMeera Joshi  | Pune   | Employee\nNeha Gupta   | Pune   | Employee\n(7 rows)",
      "explanation": "Both SELECTs return 3 columns. The column names come from the first SELECT. The literal column tells you where each row came from, and the single ORDER BY at the end sorts the combined result."
    },
    {
      "title": "INTERSECT and EXCEPT",
      "scenario": "Which cities have both employees and customers? Which have employees but no customers?",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT city FROM employees\nINTERSECT\nSELECT city FROM customers;\nSELECT city FROM employees\nEXCEPT\nSELECT city FROM customers;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT city FROM employees\nINTERSECT\nSELECT city FROM customers;\nSELECT city FROM employees\nEXCEPT\nSELECT city FROM customers;"
      },
      "result": "city\n---------\nBengaluru\nDelhi\nMumbai\nPune\n(4 rows)\n\ncity\n-------\nChennai\n(1 row)",
      "explanation": "INTERSECT keeps cities in both lists; EXCEPT keeps employee cities that are not customer cities (Chennai). Both remove duplicates. MySQL supports them from 8.0.31; for older versions use IN / NOT EXISTS as shown in the theory."
    },
    {
      "title": "Create and Use a View",
      "scenario": "Analysts keep writing the same three-table join for order reports. Save it as a view.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "CREATE OR REPLACE VIEW v_order_details AS\nSELECT o.order_id, o.order_date, c.name AS customer, c.city,\n       p.name AS product, p.category, o.quantity, o.amount, o.status\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products  p ON o.product_id  = p.product_id;\n\nSELECT category, SUM(amount) AS revenue\nFROM v_order_details\nWHERE status <> 'Cancelled'\nGROUP BY category\nORDER BY revenue DESC;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE VIEW v_order_details AS\nSELECT o.order_id, o.order_date, c.name AS customer, c.city,\n       p.name AS product, p.category, o.quantity, o.amount, o.status\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products  p ON o.product_id  = p.product_id;",
        "query": "SELECT category, SUM(amount) AS revenue\nFROM v_order_details\nWHERE status <> 'Cancelled'\nGROUP BY category\nORDER BY revenue DESC;"
      },
      "result": "category    | revenue\n------------+--------\nElectronics | 168000\nFurniture   | 19000\nStationery  | 900\n(3 rows)",
      "explanation": "Once created, the view is queried like a table. Its join runs each time. SQLite has no CREATE OR REPLACE VIEW, so the SQL Lab setup uses CREATE VIEW (use DROP VIEW IF EXISTS first to replace it)."
    },
    {
      "title": "A Security View that Hides Salary",
      "scenario": "Give the reception team a directory of employees without salary or personal email.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "CREATE VIEW v_directory AS\nSELECT e.emp_id, e.name, d.dept_name, e.city\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id;\n\n-- MySQL: allow the reception user to read only the view\nGRANT SELECT ON company_db.v_directory TO 'reception'@'%';\n\nSELECT * FROM v_directory WHERE city = 'Mumbai';",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE VIEW v_directory AS\nSELECT e.emp_id, e.name, d.dept_name, e.city\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id;",
        "query": "SELECT * FROM v_directory WHERE city = 'Mumbai';"
      },
      "result": "emp_id | name         | dept_name | city\n-------+--------------+-----------+-------\n3      | Priya Shah   | Sales     | Mumbai\n4      | Vikram Singh | Sales     | Mumbai\n7      | Sneha Iyer   | Finance   | Mumbai\n(3 rows)",
      "explanation": "The reception user can only SELECT from the view, so salaries stay hidden even though they live in the same table. The view also always reflects the latest data because it stores no copy."
    },
    {
      "title": "Views Reflect Changes in Base Tables",
      "scenario": "After a view is created, a new order arrives. Does the view need to be refreshed?",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT * FROM v_pending;\nINSERT INTO orders VALUES (11, 5, 3, 2, 3000, '2024-03-25', 'Pending');\nSELECT * FROM v_pending;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE VIEW v_pending AS\nSELECT order_id, customer_id, amount FROM orders WHERE status = 'Pending';",
        "query": "SELECT * FROM v_pending;\nINSERT INTO orders VALUES (11, 5, 3, 2, 3000, '2024-03-25', 'Pending');\nSELECT * FROM v_pending;"
      },
      "result": "order_id | customer_id | amount\n---------+-------------+-------\n7        | 6           | 12000\n(1 row)\n\norder_id | customer_id | amount\n---------+-------------+-------\n7        | 6           | 12000\n11       | 5           | 3000\n(2 rows)",
      "explanation": "No refresh needed: the view runs its query each time, so the new pending order 11 appears immediately. That is the main difference between a view and a copied table."
    }
  ],
  "interview": [
    {
      "q": "Difference between UNION and UNION ALL?",
      "a": "UNION removes duplicate rows (extra sort/hash work); UNION ALL keeps all rows and is faster.",
      "level": "Easy"
    },
    {
      "q": "Difference between UNION and JOIN?",
      "a": "UNION stacks rows of similar result sets vertically; JOIN combines columns of related tables horizontally based on a condition.",
      "level": "Easy"
    },
    {
      "q": "What are the rules for UNION?",
      "a": "Same number of columns, compatible data types in the same order, column names from the first query, one ORDER BY at the end.",
      "level": "Easy"
    },
    {
      "q": "Does MySQL support INTERSECT and EXCEPT?",
      "a": "Yes, from MySQL 8.0.31. Earlier versions require IN / EXISTS (for INTERSECT) and NOT IN / NOT EXISTS / LEFT JOIN IS NULL (for EXCEPT).",
      "level": "Medium"
    },
    {
      "q": "What is a view?",
      "a": "A virtual table defined by a stored SELECT query. It stores no data; the query runs whenever the view is used.",
      "level": "Easy"
    },
    {
      "q": "Advantages of views?",
      "a": "Simplify complex queries, restrict access to columns/rows (security), provide a consistent interface if base tables change, reuse business logic.",
      "level": "Easy"
    },
    {
      "q": "Can we update data through a view?",
      "a": "Yes in MySQL, if the view is simple: one base table, no aggregates, GROUP BY, DISTINCT, UNION, or subqueries in the select list. WITH CHECK OPTION ensures modified rows still satisfy the view's WHERE.",
      "level": "Medium"
    },
    {
      "q": "What is a materialized view? Does MySQL have it?",
      "a": "A view whose result is physically stored and refreshed periodically (Oracle, PostgreSQL). MySQL does not have it; you emulate it with a summary table refreshed by an event or trigger.",
      "level": "Hard"
    },
    {
      "q": "Does a view improve performance?",
      "a": "Not by itself; it runs the underlying query. MySQL may merge the view into the outer query (MERGE algorithm) or create a temporary table (TEMPTABLE). Indexes on base tables help.",
      "level": "Hard"
    },
    {
      "q": "What happens to a view if you drop its base table?",
      "a": "The view remains but becomes invalid; selecting from it gives an error until the table is recreated. CHECK TABLE view_name reports the problem.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "List all distinct names of people (employees and customers) sorted alphabetically.",
      "hint": "UNION two SELECT name queries.",
      "solution": "SELECT name FROM employees\nUNION\nSELECT name FROM customers\nORDER BY name;"
    },
    {
      "task": "Show product categories that have been ordered and also have stock above 100 for some product.",
      "hint": "INTERSECT two category lists.",
      "solution": "SELECT p.category FROM orders o JOIN products p ON o.product_id = p.product_id\nINTERSECT\nSELECT category FROM products WHERE stock > 100;"
    },
    {
      "task": "Create a view v_high_earners for employees with salary above 70000 and query it.",
      "hint": "CREATE VIEW ... AS SELECT ... WHERE salary > 70000",
      "solution": "CREATE VIEW v_high_earners AS\nSELECT emp_id, name, salary FROM employees WHERE salary > 70000;\nSELECT * FROM v_high_earners ORDER BY salary DESC;"
    },
    {
      "task": "Create a view v_customer_spend with total spend per customer (non-cancelled), then show customers who spent above 5000.",
      "hint": "Aggregate inside the view, filter outside it.",
      "solution": "CREATE VIEW v_customer_spend AS\nSELECT c.customer_id, c.name, SUM(o.amount) AS total\nFROM customers c JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.status <> 'Cancelled'\nGROUP BY c.customer_id, c.name;\nSELECT * FROM v_customer_spend WHERE total > 5000;"
    }
  ],
  "quiz": [
    {
      "question": "Which keeps duplicate rows?",
      "options": [
        "UNION",
        "UNION ALL",
        "INTERSECT",
        "EXCEPT"
      ],
      "answer": 1,
      "explanation": "UNION ALL does not remove duplicates."
    },
    {
      "question": "In a UNION, the result column names come from:",
      "options": [
        "The last SELECT",
        "The longest SELECT",
        "The first SELECT",
        "They must be identical"
      ],
      "answer": 2,
      "explanation": "Names come from the first SELECT."
    },
    {
      "question": "A view stores:",
      "options": [
        "A copy of all rows",
        "Only the query definition",
        "An index",
        "A backup of the table"
      ],
      "answer": 1,
      "explanation": "A view is a stored query, not stored data."
    },
    {
      "question": "Which MySQL statement changes an existing view definition?",
      "options": [
        "CREATE OR REPLACE VIEW",
        "UPDATE VIEW",
        "MODIFY VIEW",
        "RENAME VIEW"
      ],
      "answer": 0,
      "explanation": "CREATE OR REPLACE VIEW (or ALTER VIEW)."
    },
    {
      "question": "Which is NOT a requirement for UNION?",
      "options": [
        "Same number of columns",
        "Compatible data types",
        "Same column names in each SELECT",
        "Columns in a matching order"
      ],
      "answer": 2,
      "explanation": "Names may differ; the first SELECT names the result."
    }
  ]
};
