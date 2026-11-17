export default {
  "id": "day-15-python-mysql-interview-practice",
  "title": "Python + MySQL (mysql-connector), SQL Interview Questions and Practice Queries",
  "module": "Module 3: Advanced SQL",
  "day": 15,
  "level": "Advanced",
  "duration": "3.5 hours",
  "summary": "Connect Python to MySQL with mysql-connector-python to run safe parameterised CRUD with transactions, understand SQL injection, and revise the whole course with the most-asked SQL interview questions and practice queries.",
  "objectives": [
    "Install mysql-connector-python and connect to MySQL from Python",
    "Run SELECT, INSERT, UPDATE and DELETE with parameterised queries, commit and rollback",
    "Explain SQL injection and prevent it with placeholders",
    "Solve classic interview queries: Nth highest salary, duplicates, top-N per group, running totals, missing records",
    "Answer 25+ frequently asked SQL and MySQL interview questions confidently"
  ],
  "theory": [
    {
      "heading": "How Python Talks to MySQL",
      "content": "Python cannot read MySQL's files directly. It uses a driver (connector) that speaks MySQL's network protocol. The official driver is mysql-connector-python (pip install mysql-connector-python). Others: PyMySQL (pure Python), mysqlclient (fast, used by Django). All follow the Python DB-API 2.0 pattern, so the steps are the same: connect -> cursor -> execute -> fetch -> commit -> close.",
      "syntax": "import mysql.connector\n\nconn = mysql.connector.connect(\n    host=\"localhost\", port=3306,\n    user=\"root\", password=\"your_password\",\n    database=\"company_db\",\n)\ncursor = conn.cursor()            # or conn.cursor(dictionary=True)\ncursor.execute(\"SELECT * FROM employees WHERE dept_id = %s\", (2,))\nrows = cursor.fetchall()          # fetchone(), fetchmany(n)\nconn.commit()                     # only needed after INSERT/UPDATE/DELETE\ncursor.close()\nconn.close()",
      "points": [
        "connection: the session with the server; cursor: runs statements and holds results",
        "fetchone() -> one tuple or None; fetchall() -> list of tuples; dictionary=True returns dicts",
        "autocommit is OFF in mysql-connector: you must call conn.commit() or changes are lost",
        "cursor.rowcount: rows affected; cursor.lastrowid: AUTO_INCREMENT id of the last insert",
        "DECIMAL columns come back as Python Decimal, DATE as datetime.date"
      ]
    },
    {
      "heading": "Parameterised Queries and SQL Injection",
      "content": "SQL injection is an attack where user input changes the meaning of your SQL. If you build SQL with string formatting, a user can type ' OR '1'='1 as a password and log in as anyone, or even ; DROP TABLE users. The fix is simple: never put user input into the SQL string; pass it separately as parameters. The driver sends the values safely so they are always treated as data.",
      "syntax": "# DANGEROUS - never do this\nsql = f\"SELECT * FROM users WHERE username = '{u}' AND password = '{p}'\"\n\n# SAFE - placeholders + a tuple of values\nsql = \"SELECT * FROM users WHERE username = %s AND password = %s\"\ncursor.execute(sql, (u, p))",
      "points": [
        "mysql-connector and PyMySQL use %s placeholders (for every type, not only strings); sqlite3 uses ?",
        "Placeholders cannot be used for table or column names; whitelist those in code",
        "Also: least-privilege DB users, hashed passwords (bcrypt), and ORMs (Django ORM, SQLAlchemy) which parameterise automatically"
      ]
    },
    {
      "heading": "Transactions, Bulk Inserts and Clean-Up in Python",
      "content": "Wrap related changes in try/except: commit when everything succeeds, rollback on any error. executemany() inserts many rows efficiently. Close cursors and connections in finally (or use with-blocks), and use connection pooling (mysql.connector.pooling) in web apps.",
      "syntax": "try:\n    cursor.execute(\"UPDATE accounts SET balance = balance - %s WHERE acc_id = %s\", (amt, src))\n    cursor.execute(\"UPDATE accounts SET balance = balance + %s WHERE acc_id = %s\", (amt, dst))\n    conn.commit()\nexcept mysql.connector.Error as err:\n    conn.rollback()\n    print(\"Transfer failed:\", err)\nfinally:\n    cursor.close()\n    conn.close()",
      "tip": "Keep credentials out of code: read them from environment variables (os.environ[\"DB_PASSWORD\"]) or a .env file that is not committed to Git."
    },
    {
      "heading": "How to Approach SQL Interview Questions",
      "content": "Interviewers check that you can turn an English question into the right clauses. Use a fixed method.",
      "points": [
        "1. Identify the tables and the join keys (\"customers who ordered\" -> customers + orders on customer_id)",
        "2. Decide the grain of the answer: one row per what? (per customer, per department, per month)",
        "3. Filter rows (WHERE), group (GROUP BY), filter groups (HAVING)",
        "4. Need ranking/top-N per group or comparison with previous row? Use window functions in a CTE",
        "5. Think about NULLs, ties and duplicates (DENSE_RANK, DISTINCT, LEFT JOIN)",
        "6. Say the query out loud in execution order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT"
      ]
    },
    {
      "heading": "Must-Know Query Patterns (Cheat Sheet)",
      "content": "These patterns cover most fresher and 1-3 year SQL interview rounds.",
      "points": [
        "Nth highest: DENSE_RANK() OVER (ORDER BY salary DESC) = N, or LIMIT 1 OFFSET N-1 on DISTINCT values",
        "Duplicates: GROUP BY col HAVING COUNT(*) > 1; delete duplicates keeping the lowest id with ROW_NUMBER() or a self join",
        "Missing records: LEFT JOIN ... WHERE right.id IS NULL, or NOT EXISTS",
        "Top-N per group: ROW_NUMBER() OVER (PARTITION BY grp ORDER BY val DESC) <= N",
        "Running total: SUM() OVER (ORDER BY date ROWS UNBOUNDED PRECEDING)",
        "Month-over-month: LAG(total) OVER (ORDER BY month)",
        "Pivot: SUM(CASE WHEN ... THEN ... END) per column",
        "Employees earning more than their manager: self join e.manager_id = m.emp_id"
      ]
    }
  ],
  "examples": [
    {
      "title": "Connect and Run a SELECT from Python",
      "scenario": "Build a small script that prints IT employees and their salaries from MySQL.",
      "steps": [
        "Open VS Code or PyCharm and create a project folder with a virtual environment (python -m venv venv, then activate it)",
        "Install the driver: pip install mysql-connector-python",
        "Make sure MySQL Server is running and company_db has the course tables (run the setup script in Workbench)",
        "Create app.py with the code below and set your own password",
        "Run it with python app.py (or the green Run button in PyCharm)"
      ],
      "code": "# app.py\nimport mysql.connector\nfrom mysql.connector import Error\n\nconfig = {\n    \"host\": \"localhost\",\n    \"port\": 3306,\n    \"user\": \"root\",\n    \"password\": \"your_password\",\n    \"database\": \"company_db\",\n}\n\nconn = None\ntry:\n    conn = mysql.connector.connect(**config)\n    print(\"Connected to MySQL\", conn.get_server_info())\n\n    cursor = conn.cursor(dictionary=True)\n    cursor.execute(\n        \"SELECT name, salary FROM employees WHERE dept_id = %s ORDER BY salary DESC\",\n        (2,),\n    )\n    rows = cursor.fetchall()\n    for row in rows:\n        print(f\"{row['name']:<12} {row['salary']}\")\n    print(\"Rows:\", len(rows))\n    cursor.close()\nexcept Error as e:\n    print(\"Error:\", e)\nfinally:\n    if conn is not None and conn.is_connected():\n        conn.close()\n        print(\"Connection closed\")",
      "result": "Connected to MySQL 8.0.36\nAsha Rao     95000.00\nRahul Mehta  72000.00\nArjun Nair   68000.00\nRows: 3\nConnection closed\n(The version number depends on your installation.)",
      "explanation": "The script connects, creates a dictionary cursor (rows become dicts so we can use row['name']), runs a parameterised SELECT and loops over the rows. DECIMAL salaries arrive as Python Decimal values and print with two decimals. If the password or database name is wrong, the except block prints errors such as 1045 (Access denied) or 1049 (Unknown database)."
    },
    {
      "title": "INSERT, executemany, commit and rollback",
      "scenario": "A registration form adds one customer; an import job adds two more. Save them safely and get the new id.",
      "steps": [
        "Open VS Code or PyCharm and create a project folder with a virtual environment (python -m venv venv, then activate it)",
        "Install the driver: pip install mysql-connector-python",
        "Make sure MySQL Server is running and company_db has the course tables (run the setup script in Workbench)",
        "Create app.py with the code below and set your own password",
        "Run it with python app.py (or the green Run button in PyCharm)"
      ],
      "code": "# add_customers.py\nimport mysql.connector\n\nconn = mysql.connector.connect(host=\"localhost\", user=\"root\",\n                               password=\"your_password\", database=\"company_db\")\ncursor = conn.cursor()\nsql = \"INSERT INTO customers (name, city, email, joined_on) VALUES (%s, %s, %s, %s)\"\ntry:\n    cursor.execute(sql, (\"Kiran Rao\", \"Pune\", \"kiran@mail.com\", \"2024-04-01\"))\n    new_id = cursor.lastrowid\n\n    rows = [\n        (\"Tanvi Das\", \"Kolkata\", None, \"2024-04-02\"),        # None -> NULL\n        (\"Imran Ali\", \"Lucknow\", \"imran@mail.com\", \"2024-04-03\"),\n    ]\n    cursor.executemany(sql, rows)\n    bulk = cursor.rowcount\n\n    cursor.execute(\"UPDATE customers SET city = %s WHERE customer_id = %s\", (\"Mumbai\", new_id))\n    conn.commit()                       # save everything together\n    print(\"Inserted id:\", new_id)\n    print(\"Bulk inserted:\", bulk)\n    print(\"Updated rows:\", cursor.rowcount)\nexcept mysql.connector.Error as err:\n    conn.rollback()                     # undo everything on any error\n    print(\"Rolled back:\", err)\nfinally:\n    cursor.close()\n    conn.close()",
      "result": "Inserted id: 7\nBulk inserted: 2\nUpdated rows: 1",
      "explanation": "lastrowid returns the AUTO_INCREMENT id (7, since customers 1-6 exist). executemany sends many rows with one call and rowcount reports 2. Python None becomes SQL NULL. Nothing is visible to other sessions until conn.commit(); if any statement fails, rollback() undoes all of them (atomicity, Day 12)."
    },
    {
      "title": "SQL Injection: What Goes Wrong and How Placeholders Fix It",
      "scenario": "A login form builds SQL by joining strings. An attacker types ' OR '1'='1 as the password. See the query that actually runs.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "# VULNERABLE\nu = \"asha\"\np = \"' OR '1'='1\"\nsql = f\"SELECT id, username, role FROM users WHERE username = '{u}' AND password = '{p}'\"\n# sql becomes:\n# SELECT id, username, role FROM users WHERE username = 'asha' AND password = '' OR '1'='1'\ncursor.execute(sql)\n\n# SAFE\ncursor.execute(\n    \"SELECT id, username, role FROM users WHERE username = %s AND password = %s\",\n    (u, p),\n)   # p is treated as plain text -> no rows",
      "sql": {
        "setup": "CREATE TABLE users (id INTEGER PRIMARY KEY, username VARCHAR(30), password VARCHAR(30), role VARCHAR(10));\nINSERT INTO users VALUES (1, 'asha', 'secret1', 'admin'), (2, 'rahul', 'pass123', 'user'), (3, 'neha', 'hello99', 'user');",
        "query": "-- The string the vulnerable code builds:\nSELECT id, username, role FROM users\nWHERE username = 'asha' AND password = '' OR '1'='1';"
      },
      "result": "id | username | role\n---+----------+------\n1  | asha     | admin\n2  | rahul    | user\n3  | neha     | user\n(3 rows)",
      "explanation": "Because AND binds tighter than OR, the condition becomes (username = 'asha' AND password = '') OR '1'='1', which is true for every row, so the attacker gets all users including the admin. With placeholders the driver sends the password as a value, the WHERE looks for a password literally equal to \"' OR '1'='1\", and no row matches."
    },
    {
      "title": "Interview Pack 1: Second Highest Salary per Department",
      "scenario": "A very common question: \"Find the employee(s) with the second highest salary in each department.\"",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "WITH r AS (\n  SELECT e.name, d.dept_name, e.salary,\n         DENSE_RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS dr\n  FROM employees e\n  JOIN departments d ON d.dept_id = e.dept_id\n)\nSELECT dept_name, name, salary\nFROM r\nWHERE dr = 2\nORDER BY dept_name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "WITH r AS (\n  SELECT e.name, d.dept_name, e.salary,\n         DENSE_RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS dr\n  FROM employees e\n  JOIN departments d ON d.dept_id = e.dept_id\n)\nSELECT dept_name, name, salary\nFROM r\nWHERE dr = 2\nORDER BY dept_name;"
      },
      "result": "dept_name | name         | salary\n----------+--------------+-------\nIT        | Rahul Mehta  | 72000\nSales     | Vikram Singh | 55000\n(2 rows)",
      "explanation": "DENSE_RANK restarts per department because of PARTITION BY. Departments with one employee (HR, Finance) have no rank 2, so they do not appear. Mention in the interview that DENSE_RANK handles ties (two people sharing the 2nd highest salary would both be returned)."
    },
    {
      "title": "Interview Pack 2: Find and Delete Duplicates",
      "scenario": "A bad import created duplicate customer emails. Find them, then delete the extra copies keeping the lowest id.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- Find duplicates\nSELECT email, COUNT(*) AS copies\nFROM customers\nWHERE email IS NOT NULL\nGROUP BY email\nHAVING COUNT(*) > 1;\n\n-- Delete duplicates, keep the lowest customer_id (MySQL 8)\nDELETE FROM customers\nWHERE customer_id IN (\n  SELECT customer_id FROM (\n    SELECT customer_id,\n           ROW_NUMBER() OVER (PARTITION BY email ORDER BY customer_id) AS rn\n    FROM customers\n    WHERE email IS NOT NULL\n  ) t\n  WHERE rn > 1\n);\n-- Classic MySQL alternative (self join):\n-- DELETE c1 FROM customers c1 JOIN customers c2\n--   ON c1.email = c2.email AND c1.customer_id > c2.customer_id;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nINSERT INTO customers VALUES (7, 'Amit K', 'Mumbai', 'amit@mail.com', '2024-02-01'),\n                             (8, 'Sara Khan', 'Delhi', 'sara@mail.com', '2024-02-05'),\n                             (9, 'Amit Kumar', 'Mumbai', 'amit@mail.com', '2024-03-01');",
        "query": "SELECT email, COUNT(*) AS copies\nFROM customers\nWHERE email IS NOT NULL\nGROUP BY email\nHAVING COUNT(*) > 1;\nDELETE FROM customers\nWHERE customer_id IN (\n  SELECT customer_id FROM (\n    SELECT customer_id,\n           ROW_NUMBER() OVER (PARTITION BY email ORDER BY customer_id) AS rn\n    FROM customers\n    WHERE email IS NOT NULL\n  ) t\n  WHERE rn > 1\n);\nSELECT customer_id, name, email FROM customers ORDER BY customer_id;"
      },
      "result": "email         | copies\n--------------+-------\namit@mail.com | 3\nsara@mail.com | 2\n(2 rows)\n\ncustomer_id | name        | email\n------------+-------------+---------------\n1           | Amit Kumar  | amit@mail.com\n2           | Sara Khan   | sara@mail.com\n3           | John Dsouza | NULL\n4           | Pooja Verma | pooja@mail.com\n5           | Ravi Teja   | ravi@mail.com\n6           | Divya Menon | divya@mail.com\n(6 rows)",
      "explanation": "GROUP BY + HAVING finds the duplicated emails. ROW_NUMBER numbers each copy per email; copies with rn > 1 are deleted, so ids 7, 8 and 9 go and the originals stay. The extra derived table (t) is needed in MySQL, which does not allow selecting directly from the table being deleted from (error 1093)."
    },
    {
      "title": "Interview Pack 3: Monthly Revenue, Growth and Top Customer",
      "scenario": "Management asks: revenue per month, change vs previous month, and the best customer of each month.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL 8 (DATE_FORMAT instead of strftime)\nWITH monthly AS (\n  SELECT DATE_FORMAT(order_date, '%Y-%m') AS month, SUM(amount) AS revenue\n  FROM orders\n  WHERE status <> 'Cancelled'\n  GROUP BY month\n),\ncust_month AS (\n  SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, c.name, SUM(o.amount) AS spent,\n         ROW_NUMBER() OVER (PARTITION BY DATE_FORMAT(o.order_date, '%Y-%m')\n                            ORDER BY SUM(o.amount) DESC) AS rn\n  FROM orders o\n  JOIN customers c ON c.customer_id = o.customer_id\n  WHERE o.status <> 'Cancelled'\n  GROUP BY month, c.name\n)\nSELECT m.month, m.revenue,\n       m.revenue - LAG(m.revenue) OVER (ORDER BY m.month) AS change_vs_prev,\n       cm.name AS top_customer, cm.spent\nFROM monthly m\nJOIN cust_month cm ON cm.month = m.month AND cm.rn = 1\nORDER BY m.month;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "WITH monthly AS (\n  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue\n  FROM orders\n  WHERE status <> 'Cancelled'\n  GROUP BY month\n),\ncust_month AS (\n  SELECT strftime('%Y-%m', o.order_date) AS month, c.name, SUM(o.amount) AS spent,\n         ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', o.order_date)\n                            ORDER BY SUM(o.amount) DESC) AS rn\n  FROM orders o\n  JOIN customers c ON c.customer_id = o.customer_id\n  WHERE o.status <> 'Cancelled'\n  GROUP BY month, c.name\n)\nSELECT m.month, m.revenue,\n       m.revenue - LAG(m.revenue) OVER (ORDER BY m.month) AS change_vs_prev,\n       cm.name AS top_customer, cm.spent\nFROM monthly m\nJOIN cust_month cm ON cm.month = m.month AND cm.rn = 1\nORDER BY m.month;"
      },
      "result": "month   | revenue | change_vs_prev | top_customer | spent\n--------+---------+----------------+--------------+-------\n2024-01 | 63000   | NULL           | Amit Kumar   | 56000\n2024-02 | 2000    | -61000         | Sara Khan    | 1500\n2024-03 | 122900  | 120900         | Divya Menon  | 122000\n(3 rows)",
      "explanation": "This single query combines most of the course: date functions, GROUP BY, two CTEs, a window function over an aggregate (ROW_NUMBER ordered by SUM), LAG for growth, and a join between CTEs. Window functions run after GROUP BY, which is why ORDER BY SUM(o.amount) is allowed inside OVER."
    }
  ],
  "interview": [
    {
      "q": "What is SQL and what are its sub-languages?",
      "a": "Structured Query Language for relational databases. DDL (CREATE, ALTER, DROP, TRUNCATE), DML (INSERT, UPDATE, DELETE), DQL (SELECT), DCL (GRANT, REVOKE), TCL (COMMIT, ROLLBACK, SAVEPOINT).",
      "level": "Easy"
    },
    {
      "q": "Difference between DELETE, TRUNCATE and DROP?",
      "a": "DELETE: DML, row-by-row with optional WHERE, rollback-able, fires triggers. TRUNCATE: DDL, removes all rows fast, resets AUTO_INCREMENT, no WHERE, no rollback in MySQL. DROP: removes the table definition and data.",
      "level": "Medium"
    },
    {
      "q": "Difference between WHERE and HAVING?",
      "a": "WHERE filters rows before grouping and cannot use aggregates; HAVING filters groups after GROUP BY and can use aggregates.",
      "level": "Easy"
    },
    {
      "q": "What is the logical order of execution of a SELECT?",
      "a": "FROM/JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT (window functions) -> DISTINCT -> ORDER BY -> LIMIT.",
      "level": "Medium"
    },
    {
      "q": "Difference between primary key, unique key and foreign key?",
      "a": "Primary key: unique + not null, one per table, clustered in InnoDB. Unique key: no duplicates, allows NULL, many per table. Foreign key: references another table's key to enforce referential integrity.",
      "level": "Easy"
    },
    {
      "q": "Explain the types of joins.",
      "a": "INNER (matches only), LEFT (all left + matches), RIGHT (all right + matches), FULL (all from both; UNION of LEFT and RIGHT in MySQL), SELF (table with itself), CROSS (Cartesian product).",
      "level": "Easy"
    },
    {
      "q": "Difference between UNION and UNION ALL?",
      "a": "UNION removes duplicates (extra cost); UNION ALL keeps all rows and is faster.",
      "level": "Easy"
    },
    {
      "q": "Write a query for the second highest salary.",
      "a": "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees); or DENSE_RANK() = 2; or SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET 1.",
      "level": "Medium"
    },
    {
      "q": "How do you find duplicate rows?",
      "a": "SELECT col, COUNT(*) FROM t GROUP BY col HAVING COUNT(*) > 1; for whole-row duplicates group by all columns.",
      "level": "Medium"
    },
    {
      "q": "Difference between RANK, DENSE_RANK and ROW_NUMBER?",
      "a": "On ties: ROW_NUMBER gives unique numbers; RANK gives the same rank then skips; DENSE_RANK gives the same rank without gaps.",
      "level": "Medium"
    },
    {
      "q": "What is a correlated subquery?",
      "a": "A subquery that references the outer query's columns and is evaluated once per outer row.",
      "level": "Medium"
    },
    {
      "q": "Difference between IN and EXISTS?",
      "a": "IN compares against a list of values; EXISTS checks whether a subquery returns any row and stops at the first. NOT EXISTS is NULL-safe, NOT IN is not.",
      "level": "Medium"
    },
    {
      "q": "What is a view? Can it be updated?",
      "a": "A stored SELECT acting as a virtual table. Simple single-table views without aggregates, DISTINCT, GROUP BY or UNION are updatable in MySQL.",
      "level": "Medium"
    },
    {
      "q": "What is an index? When should you not add one?",
      "a": "A sorted structure (B+Tree) to find rows fast. Avoid on tiny tables, low-selectivity columns, or heavily written columns that are rarely searched; every index slows writes.",
      "level": "Medium"
    },
    {
      "q": "Clustered vs non-clustered index?",
      "a": "Clustered: rows physically stored in key order (InnoDB primary key), one per table. Non-clustered: separate structure pointing to rows (stores the PK), many per table.",
      "level": "Hard"
    },
    {
      "q": "What is normalization? Explain 1NF, 2NF, 3NF.",
      "a": "Organising data to reduce redundancy. 1NF: atomic values. 2NF: no partial dependency on a composite key. 3NF: no transitive dependency on non-key columns.",
      "level": "Medium"
    },
    {
      "q": "What is denormalization?",
      "a": "Adding controlled redundancy to speed up reads (reporting, data warehouses), accepting more complex writes.",
      "level": "Medium"
    },
    {
      "q": "What are ACID properties?",
      "a": "Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes).",
      "level": "Easy"
    },
    {
      "q": "What are the isolation levels and the MySQL default?",
      "a": "READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ (InnoDB default), SERIALIZABLE.",
      "level": "Medium"
    },
    {
      "q": "Difference between stored procedure and function?",
      "a": "Function returns one value and is used inside SQL; procedure is called with CALL, can return multiple values/result sets and run DML and transactions.",
      "level": "Medium"
    },
    {
      "q": "What is a trigger? Give a real use case.",
      "a": "Code that runs automatically on INSERT/UPDATE/DELETE. Use cases: audit logs, stock decrement on order insert, validation before insert.",
      "level": "Easy"
    },
    {
      "q": "What is a CTE? What is a recursive CTE?",
      "a": "A named temporary result defined with WITH for one statement. A recursive CTE references itself (anchor UNION ALL recursive part) for hierarchies and series.",
      "level": "Medium"
    },
    {
      "q": "What is SQL injection and how do you prevent it?",
      "a": "An attack where malicious input changes the SQL query. Prevent with parameterised queries (cursor.execute(sql, params)), ORMs, input validation, least-privilege accounts.",
      "level": "Medium"
    },
    {
      "q": "Why do we call conn.commit() in mysql-connector?",
      "a": "Because the connector starts with autocommit off; INSERT/UPDATE/DELETE changes are only saved when you commit (or set conn.autocommit = True).",
      "level": "Medium"
    },
    {
      "q": "What is the difference between CHAR and VARCHAR?",
      "a": "CHAR is fixed-length (padded), VARCHAR stores the actual length; use CHAR for fixed codes and VARCHAR for variable text.",
      "level": "Easy"
    },
    {
      "q": "What does COALESCE do?",
      "a": "Returns the first non-NULL argument: COALESCE(email, phone, 'no contact').",
      "level": "Easy"
    },
    {
      "q": "How do you get the top 3 products by revenue in each category?",
      "a": "Aggregate revenue per product in a CTE, then ROW_NUMBER() (or DENSE_RANK) OVER (PARTITION BY category ORDER BY revenue DESC) and filter <= 3.",
      "level": "Hard"
    },
    {
      "q": "What is the output of SELECT NULL = NULL, NULL IS NULL, COUNT(NULL);?",
      "a": "NULL, 1 (true), 0. Comparing NULL with = gives NULL (unknown); IS NULL is true; COUNT(expr) ignores NULLs.",
      "level": "Hard"
    },
    {
      "q": "How do you find employees who earn more than their managers?",
      "a": "Self join: SELECT e.name FROM employees e JOIN employees m ON e.manager_id = m.emp_id WHERE e.salary > m.salary;",
      "level": "Medium"
    },
    {
      "q": "How would you speed up a slow query?",
      "a": "Run EXPLAIN, add or fix indexes on WHERE/JOIN/ORDER BY columns, avoid functions on indexed columns and SELECT *, rewrite correlated subqueries as joins/window functions, paginate with keyset, update statistics (ANALYZE TABLE).",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "List customers who have placed more than 2 non-cancelled orders.",
      "hint": "GROUP BY customer, HAVING COUNT(*) > 2, JOIN for the name.",
      "solution": "SELECT c.name, COUNT(*) AS orders\nFROM orders o JOIN customers c ON c.customer_id = o.customer_id\nWHERE o.status <> 'Cancelled'\nGROUP BY c.name\nHAVING COUNT(*) > 2;"
    },
    {
      "task": "Find the department with the highest total salary.",
      "hint": "GROUP BY dept, ORDER BY total DESC LIMIT 1.",
      "solution": "SELECT d.dept_name, SUM(e.salary) AS total\nFROM employees e JOIN departments d ON d.dept_id = e.dept_id\nGROUP BY d.dept_name\nORDER BY total DESC\nLIMIT 1;"
    },
    {
      "task": "Show products that were never ordered, and products that were ordered but are out of stock.",
      "hint": "NOT EXISTS for the first; EXISTS + stock = 0 for the second; combine with UNION ALL and a label.",
      "solution": "SELECT name, 'never ordered' AS issue FROM products p\nWHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.product_id = p.product_id)\nUNION ALL\nSELECT name, 'ordered but out of stock' FROM products p\nWHERE p.stock = 0 AND EXISTS (SELECT 1 FROM orders o WHERE o.product_id = p.product_id);"
    },
    {
      "task": "For each customer show their first order date and total lifetime spend (non-cancelled).",
      "hint": "MIN(order_date), SUM(amount), GROUP BY customer.",
      "solution": "SELECT c.name, MIN(o.order_date) AS first_order, SUM(o.amount) AS lifetime_spend\nFROM customers c JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.status <> 'Cancelled'\nGROUP BY c.name\nORDER BY lifetime_spend DESC;"
    },
    {
      "task": "Write a Python function get_orders(customer_id) that returns that customer's orders using mysql-connector and a parameterised query.",
      "hint": "Use %s and a one-element tuple (customer_id,).",
      "solution": "import mysql.connector\n\ndef get_orders(customer_id):\n    conn = mysql.connector.connect(host=\"localhost\", user=\"root\",\n                                   password=\"your_password\", database=\"company_db\")\n    try:\n        cur = conn.cursor(dictionary=True)\n        cur.execute(\"SELECT order_id, order_date, amount, status \"\n                    \"FROM orders WHERE customer_id = %s ORDER BY order_date\", (customer_id,))\n        return cur.fetchall()\n    finally:\n        conn.close()\n\nfor row in get_orders(1):\n    print(row)"
    },
    {
      "task": "Show each employee with their salary as a percentage of their department's total.",
      "hint": "SUM(salary) OVER (PARTITION BY dept_id).",
      "solution": "SELECT name, dept_id, salary,\n       ROUND(100.0 * salary / SUM(salary) OVER (PARTITION BY dept_id), 1) AS pct_of_dept\nFROM employees\nWHERE dept_id IS NOT NULL\nORDER BY dept_id, pct_of_dept DESC;"
    }
  ],
  "quiz": [
    {
      "question": "Which placeholder does mysql-connector-python use in parameterised queries?",
      "options": [
        "?",
        ":name",
        "%s",
        "$1"
      ],
      "answer": 2,
      "explanation": "mysql-connector and PyMySQL use %s for every value type."
    },
    {
      "question": "After cursor.execute(\"INSERT ...\") in mysql-connector, what is needed to save the row?",
      "options": [
        "conn.commit()",
        "cursor.save()",
        "Nothing, autocommit is on",
        "conn.flush()"
      ],
      "answer": 0,
      "explanation": "Autocommit is off by default, so call commit()."
    },
    {
      "question": "Which query is safe from SQL injection?",
      "options": [
        "cursor.execute(f\"... WHERE id = {uid}\")",
        "cursor.execute(\"... WHERE id = \" + uid)",
        "cursor.execute(\"... WHERE id = %s\" % uid)",
        "cursor.execute(\"... WHERE id = %s\", (uid,))"
      ],
      "answer": 3,
      "explanation": "Only passing parameters separately is safe; the % operator still builds the string yourself."
    },
    {
      "question": "What does cursor.lastrowid return after an INSERT?",
      "options": [
        "The number of inserted rows",
        "The AUTO_INCREMENT id of the inserted row",
        "The last row of the table",
        "The cursor position"
      ],
      "answer": 1,
      "explanation": "lastrowid is the generated id."
    },
    {
      "question": "Which is the best way to get the 2nd highest salary when salaries can tie?",
      "options": [
        "ROW_NUMBER() = 2",
        "ORDER BY salary DESC LIMIT 2",
        "DENSE_RANK() = 2",
        "MAX(salary) - 1"
      ],
      "answer": 2,
      "explanation": "DENSE_RANK gives tied salaries the same rank without gaps."
    }
  ]
};
