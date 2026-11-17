export default {
  "id": "day-03-dml-dql-insert-update-delete-select",
  "title": "DML: INSERT, UPDATE, DELETE; DQL: SELECT, WHERE",
  "module": "Module 1: SQL Basics",
  "day": 3,
  "level": "Beginner",
  "duration": "2 hours",
  "summary": "Add, change and remove rows with INSERT, UPDATE and DELETE, and read exactly the rows you need with SELECT and WHERE.",
  "objectives": [
    "Insert single rows, multiple rows and rows with selected columns",
    "Update one or many rows safely using WHERE",
    "Delete rows safely and understand the danger of a missing WHERE",
    "Write SELECT queries with column aliases, expressions and WHERE filters",
    "Use INSERT ... SELECT to copy data between tables"
  ],
  "theory": [
    {
      "heading": "DML and DQL in One Picture",
      "content": "If DDL builds the cupboard, DML puts things into it, rearranges them and throws them out. DQL is simply looking inside the cupboard. DML = INSERT (add), UPDATE (change), DELETE (remove). DQL = SELECT (read). Together they are often called CRUD: Create, Read, Update, Delete, the four things every app (Instagram, Swiggy, a bank app) does with data.",
      "points": [
        "Create -> INSERT",
        "Read -> SELECT",
        "Update -> UPDATE",
        "Delete -> DELETE",
        "DML changes can be rolled back inside a transaction (Day 12)"
      ]
    },
    {
      "heading": "INSERT",
      "content": "INSERT adds new rows. Always list the column names: it makes the statement readable and keeps working even if someone adds a column later.",
      "syntax": "-- one row, all columns in table order\nINSERT INTO departments VALUES (6, 'Legal', 'Delhi');\n-- one row, chosen columns (others get DEFAULT or NULL)\nINSERT INTO customers (name, city) VALUES ('Kiran', 'Pune');\n-- many rows in one statement (faster)\nINSERT INTO products (name, category, price, stock)\nVALUES ('Webcam', 'Electronics', 2500, 40),\n       ('Stapler', 'Stationery', 120, 300);\n-- copy rows from a query\nINSERT INTO archive_orders SELECT * FROM orders WHERE status = 'Cancelled';",
      "points": [
        "Text and dates go in single quotes: 'Pune', '2024-03-01'",
        "Numbers have no quotes: 2500",
        "NULL means \"unknown\"; write it without quotes",
        "MySQL extras: INSERT IGNORE (skip duplicate errors) and INSERT ... ON DUPLICATE KEY UPDATE (upsert). SQLite uses INSERT OR IGNORE and INSERT ... ON CONFLICT DO UPDATE"
      ]
    },
    {
      "heading": "UPDATE",
      "content": "UPDATE changes values in existing rows. The WHERE clause picks which rows. Without WHERE every row is changed, which is the classic \"I gave everyone a raise by mistake\" disaster.",
      "syntax": "UPDATE employees\nSET salary = salary * 1.10, city = 'Pune'\nWHERE emp_id = 4;",
      "tip": "MySQL Workbench runs in \"safe update mode\" by default: it blocks UPDATE/DELETE without a WHERE on a key column. Good habit: first run SELECT with the same WHERE to see which rows will change, then turn it into UPDATE."
    },
    {
      "heading": "DELETE",
      "content": "DELETE removes whole rows. Like UPDATE, it needs a WHERE clause unless you really want to empty the table. Deleting a parent row that has child rows (for example a customer with orders) fails if a foreign key protects it.",
      "syntax": "DELETE FROM orders WHERE status = 'Cancelled';\nDELETE FROM orders;   -- removes ALL rows (careful!)",
      "points": [
        "Soft delete: many real apps never DELETE; they set is_active = 0 so data can be recovered",
        "DELETE fires triggers and can be rolled back; TRUNCATE cannot (in MySQL)"
      ]
    },
    {
      "heading": "SELECT and WHERE",
      "content": "SELECT reads data. WHERE filters rows before they are returned, just like a filter in Excel. You can compute new columns with expressions and rename them with AS (an alias).",
      "syntax": "SELECT column_list | *\nFROM table\nWHERE condition;",
      "points": [
        "Comparison operators: =, != or <>, >, <, >=, <=",
        "Combine conditions with AND, OR, NOT (Day 4 goes deeper)",
        "Expressions: salary * 12 AS annual_salary",
        "Aliases with spaces need quotes: AS \"Annual Salary\" (backticks `Annual Salary` in MySQL)",
        "Logical order of execution: FROM -> WHERE -> SELECT (that is why you cannot use a SELECT alias inside WHERE)"
      ]
    }
  ],
  "examples": [
    {
      "title": "INSERT Multiple Rows and Read Them Back",
      "scenario": "Two new customers registered today. Add both with one statement and check the table.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "INSERT INTO customers (name, city, email, joined_on)\nVALUES ('Kiran Rao', 'Pune', 'kiran@mail.com', '2024-04-01'),\n       ('Tanvi Das', 'Kolkata', NULL, '2024-04-02');\nSELECT * FROM customers WHERE customer_id > 5;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "INSERT INTO customers (name, city, email, joined_on)\nVALUES ('Kiran Rao', 'Pune', 'kiran@mail.com', '2024-04-01'),\n       ('Tanvi Das', 'Kolkata', NULL, '2024-04-02');\nSELECT * FROM customers WHERE customer_id > 5;"
      },
      "result": "customer_id | name        | city      | email          | joined_on\n------------+-------------+-----------+----------------+-----------\n6           | Divya Menon | Bengaluru | divya@mail.com | 2024-01-02\n7           | Kiran Rao   | Pune      | kiran@mail.com | 2024-04-01\n8           | Tanvi Das   | Kolkata   | NULL           | 2024-04-02\n(3 rows)",
      "explanation": "customer_id was not given, so it was generated as 7 and 8 (AUTO_INCREMENT in MySQL). Tanvi has no email yet, so we stored NULL. The WHERE customer_id > 5 shows only the newest rows."
    },
    {
      "title": "UPDATE: Give the Sales Team a 10% Raise",
      "scenario": "Management approved a 10% raise for everyone in Sales (dept_id = 1). Preview first, then update.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "UPDATE employees\nSET salary = salary + salary * 10 / 100\nWHERE dept_id = 1;\nSELECT emp_id, name, salary FROM employees WHERE dept_id = 1;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "UPDATE employees\nSET salary = salary + salary * 10 / 100\nWHERE dept_id = 1;\nSELECT emp_id, name, salary FROM employees WHERE dept_id = 1;"
      },
      "result": "emp_id | name         | salary\n-------+--------------+-------\n3      | Priya Shah   | 93500\n4      | Vikram Singh | 60500\n9      | Meera Joshi  | 57200\n(3 rows)",
      "explanation": "Only the 3 Sales employees changed: 85000 -> 93500, 55000 -> 60500, 52000 -> 57200. The right side of SET is calculated from the OLD value of each row. You could also write salary * 1.10, but in SQLite that produces a floating-point number such as 93500.00000000001; MySQL with DECIMAL(10,2) would store 93500.00. Without WHERE all 9 employees would have been updated."
    },
    {
      "title": "DELETE Cancelled Orders",
      "scenario": "The finance team wants cancelled orders removed from the active orders table.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "DELETE FROM orders WHERE status = 'Cancelled';\nSELECT COUNT(*) AS remaining_orders FROM orders;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "DELETE FROM orders WHERE status = 'Cancelled';\nSELECT COUNT(*) AS remaining_orders FROM orders;"
      },
      "result": "remaining_orders\n----------------\n9\n(1 row)",
      "explanation": "Only order 5 had status Cancelled, so 9 orders remain. Text values must match exactly, including case in most collations; 'cancelled' would match in MySQL (case-insensitive collation) but not in SQLite."
    },
    {
      "title": "SELECT with WHERE, Expressions and Aliases",
      "scenario": "Payroll needs the annual salary of employees earning more than 70,000 per month.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, salary, salary * 12 AS annual_salary\nFROM employees\nWHERE salary > 70000;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, salary, salary * 12 AS annual_salary\nFROM employees\nWHERE salary > 70000;"
      },
      "result": "name        | salary | annual_salary\n------------+--------+--------------\nAsha Rao    | 95000  | 1140000\nRahul Mehta | 72000  | 864000\nPriya Shah  | 85000  | 1020000\nSneha Iyer  | 78000  | 936000\n(4 rows)",
      "explanation": "WHERE salary > 70000 keeps 4 employees. salary * 12 is computed for each row and shown under the alias annual_salary. The underlying table is not changed by SELECT."
    },
    {
      "title": "INSERT ... SELECT: Archive Old Orders",
      "scenario": "Copy all January 2024 orders into an archive table for audit.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "INSERT INTO orders_archive (order_id, customer_id, amount, order_date)\nSELECT order_id, customer_id, amount, order_date\nFROM orders\nWHERE order_date < '2024-02-01';\nSELECT * FROM orders_archive;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE TABLE orders_archive (order_id INTEGER, customer_id INTEGER, amount DECIMAL(10,2), order_date DATE);",
        "query": "INSERT INTO orders_archive (order_id, customer_id, amount, order_date)\nSELECT order_id, customer_id, amount, order_date\nFROM orders\nWHERE order_date < '2024-02-01';\nSELECT * FROM orders_archive;"
      },
      "result": "order_id | customer_id | amount | order_date\n---------+-------------+--------+-----------\n1        | 1           | 55000  | 2024-01-05\n2        | 1           | 1000   | 2024-01-05\n3        | 2           | 7000   | 2024-01-18\n(3 rows)",
      "explanation": "INSERT ... SELECT copies the result of a query into another table in one step, with no VALUES clause. Dates stored as YYYY-MM-DD text compare correctly as strings, so < '2024-02-01' selects January."
    },
    {
      "title": "Upsert: Insert or Update if It Exists",
      "scenario": "A stock feed sends product 2 (Mouse) with a new stock of 250. If the product exists, update it; otherwise insert it.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nINSERT INTO products (product_id, name, category, price, stock)\nVALUES (2, 'Mouse', 'Electronics', 500, 250)\nON DUPLICATE KEY UPDATE stock = VALUES(stock);\n\n-- SQLite / PostgreSQL\nINSERT INTO products (product_id, name, category, price, stock)\nVALUES (2, 'Mouse', 'Electronics', 500, 250)\nON CONFLICT(product_id) DO UPDATE SET stock = excluded.stock;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "INSERT INTO products (product_id, name, category, price, stock)\nVALUES (2, 'Mouse', 'Electronics', 500, 250)\nON CONFLICT(product_id) DO UPDATE SET stock = excluded.stock;\nSELECT product_id, name, stock FROM products WHERE product_id = 2;"
      },
      "result": "product_id | name  | stock\n-----------+-------+------\n2          | Mouse | 250\n(1 row)",
      "explanation": "Because product_id 2 already exists, the INSERT turns into an UPDATE of stock. MySQL writes this as ON DUPLICATE KEY UPDATE; SQLite and PostgreSQL use ON CONFLICT ... DO UPDATE, where excluded means \"the row we tried to insert\"."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between DDL and DML?",
      "a": "DDL defines structure (CREATE, ALTER, DROP) and auto-commits in MySQL. DML manipulates rows (INSERT, UPDATE, DELETE) and can be rolled back inside a transaction.",
      "level": "Easy"
    },
    {
      "q": "What happens if you run UPDATE without WHERE?",
      "a": "Every row in the table is updated. In Workbench, safe update mode blocks it unless you use a key column in WHERE or turn the mode off with SET SQL_SAFE_UPDATES = 0.",
      "level": "Easy"
    },
    {
      "q": "How do you insert multiple rows in a single statement?",
      "a": "INSERT INTO t (a, b) VALUES (1, 'x'), (2, 'y'), (3, 'z'); It is faster than separate INSERTs because of fewer round trips and one commit.",
      "level": "Easy"
    },
    {
      "q": "What is INSERT ... SELECT?",
      "a": "It inserts the rows returned by a SELECT into a table, e.g. for archiving or copying data: INSERT INTO archive SELECT * FROM orders WHERE ...",
      "level": "Easy"
    },
    {
      "q": "What is an upsert and how is it done in MySQL?",
      "a": "Insert a row, or update it if the key already exists. MySQL: INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col). Also REPLACE INTO, which deletes then inserts.",
      "level": "Medium"
    },
    {
      "q": "Difference between INSERT IGNORE and REPLACE in MySQL?",
      "a": "INSERT IGNORE skips rows that would cause duplicate-key errors and keeps the old row. REPLACE deletes the old conflicting row and inserts the new one (new AUTO_INCREMENT id, triggers fire for delete and insert).",
      "level": "Hard"
    },
    {
      "q": "Why can you not use a column alias in WHERE?",
      "a": "Because WHERE is evaluated before SELECT in the logical processing order (FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT), so the alias does not exist yet. You can use it in ORDER BY.",
      "level": "Medium"
    },
    {
      "q": "What is the difference between = NULL and IS NULL?",
      "a": "NULL is unknown, so any comparison with = returns unknown (not true). You must use IS NULL or IS NOT NULL to test for NULL.",
      "level": "Medium"
    },
    {
      "q": "What is a soft delete?",
      "a": "Marking a row as deleted with a flag column (is_deleted = 1 or deleted_at timestamp) instead of removing it, so data can be restored and audited.",
      "level": "Easy"
    },
    {
      "q": "Can DELETE be rolled back?",
      "a": "Yes, when it runs inside a transaction (START TRANSACTION ... ROLLBACK) on a transactional engine like InnoDB. With autocommit on, each statement commits immediately.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "Insert a new department Legal located in Delhi and display all departments.",
      "hint": "INSERT INTO departments (dept_name, location) VALUES (...)",
      "solution": "INSERT INTO departments (dept_name, location) VALUES ('Legal', 'Delhi');\nSELECT * FROM departments;"
    },
    {
      "task": "Change the status of order 7 to Shipped.",
      "hint": "UPDATE ... SET ... WHERE order_id = 7",
      "solution": "UPDATE orders SET status = 'Shipped' WHERE order_id = 7;\nSELECT * FROM orders WHERE order_id = 7;"
    },
    {
      "task": "Reduce the price of all Furniture products by 500.",
      "hint": "SET price = price - 500 with a WHERE on category.",
      "solution": "UPDATE products SET price = price - 500 WHERE category = 'Furniture';\nSELECT name, price FROM products WHERE category = 'Furniture';"
    },
    {
      "task": "Delete products that are out of stock (stock = 0).",
      "hint": "DELETE FROM products WHERE stock = 0",
      "solution": "DELETE FROM products WHERE stock = 0;\nSELECT name, stock FROM products;"
    },
    {
      "task": "Show name and monthly salary of employees who live in Mumbai.",
      "hint": "WHERE city = 'Mumbai'",
      "solution": "SELECT name, salary FROM employees WHERE city = 'Mumbai';"
    }
  ],
  "quiz": [
    {
      "question": "Which statement adds new rows to a table?",
      "options": [
        "ADD",
        "INSERT",
        "UPDATE",
        "CREATE"
      ],
      "answer": 1,
      "explanation": "INSERT INTO ... VALUES adds rows."
    },
    {
      "question": "UPDATE employees SET salary = 0; What happens?",
      "options": [
        "Error: WHERE is required",
        "Nothing",
        "All rows get salary 0",
        "Only the first row changes"
      ],
      "answer": 2,
      "explanation": "Without WHERE every row is updated (unless safe update mode blocks it)."
    },
    {
      "question": "Which clause filters rows in SELECT, UPDATE and DELETE?",
      "options": [
        "WHERE",
        "FILTER",
        "HAVING",
        "ORDER BY"
      ],
      "answer": 0,
      "explanation": "WHERE filters rows."
    },
    {
      "question": "Which is correct for testing missing emails?",
      "options": [
        "email = NULL",
        "email == NULL",
        "email = 'NULL'",
        "email IS NULL"
      ],
      "answer": 3,
      "explanation": "Only IS NULL works for NULL checks."
    },
    {
      "question": "Which MySQL clause performs an upsert?",
      "options": [
        "ON CONFLICT IGNORE",
        "MERGE INTO",
        "ON DUPLICATE KEY UPDATE",
        "UPSERT INTO"
      ],
      "answer": 2,
      "explanation": "INSERT ... ON DUPLICATE KEY UPDATE is MySQL syntax."
    }
  ]
};
