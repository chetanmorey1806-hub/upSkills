export default {
  "id": "day-05-aggregate-functions-group-by-having",
  "title": "Aggregate Functions, GROUP BY, HAVING",
  "module": "Module 1: SQL Basics",
  "day": 5,
  "level": "Beginner",
  "duration": "2.5 hours",
  "summary": "Summarise many rows into totals, averages and counts with aggregate functions, split data into groups with GROUP BY, and filter groups with HAVING.",
  "objectives": [
    "Use COUNT, SUM, AVG, MIN and MAX and know how they treat NULL",
    "Know the difference between COUNT(*), COUNT(column) and COUNT(DISTINCT column)",
    "Group rows by one or more columns with GROUP BY",
    "Filter groups with HAVING and explain WHERE vs HAVING",
    "Remember the logical order of SQL clauses"
  ],
  "theory": [
    {
      "heading": "What are Aggregate Functions?",
      "content": "An aggregate function takes many rows and returns ONE value. When your manager asks \"What is our total sales?\" or \"How many customers do we have?\", you need aggregates. Think of a cashier closing the counter at night: they do not list every bill, they just say the total, the number of bills and the largest bill.",
      "points": [
        "COUNT(*): number of rows (including NULLs)",
        "COUNT(col): number of non-NULL values in col",
        "COUNT(DISTINCT col): number of unique non-NULL values",
        "SUM(col): total; AVG(col): average; MIN(col) / MAX(col): smallest / largest (work on numbers, text and dates)",
        "All aggregates except COUNT(*) ignore NULL values",
        "MySQL extra: GROUP_CONCAT(name) joins values into one string (SQLite: group_concat too)"
      ]
    },
    {
      "heading": "GROUP BY",
      "content": "GROUP BY splits the rows into buckets that share the same value, then runs the aggregate on each bucket separately. \"Total salary per department\" means: put employees in department buckets, then SUM each bucket.",
      "syntax": "SELECT dept_id, COUNT(*) AS headcount, SUM(salary) AS total_salary\nFROM employees\nGROUP BY dept_id;",
      "points": [
        "Every column in SELECT must be either in GROUP BY or inside an aggregate function",
        "MySQL 8 enforces this with ONLY_FULL_GROUP_BY mode (error 1055). SQLite is relaxed and picks an arbitrary row, so do not rely on that",
        "NULL values form their own group",
        "You can group by several columns: GROUP BY category, status"
      ]
    },
    {
      "heading": "HAVING",
      "content": "WHERE cannot use aggregates because it runs before grouping. HAVING runs after grouping and filters whole groups. Example: \"departments with more than 2 employees\" needs HAVING COUNT(*) > 2.",
      "syntax": "SELECT dept_id, AVG(salary) AS avg_salary\nFROM employees\nWHERE hire_date >= '2018-01-01'   -- filter rows first\nGROUP BY dept_id\nHAVING AVG(salary) > 60000        -- then filter groups\nORDER BY avg_salary DESC;"
    },
    {
      "heading": "Logical Order of Execution",
      "content": "SQL is written in one order but executed in another. Knowing the real order explains most errors beginners get.",
      "points": [
        "1. FROM (and JOINs) - pick the tables",
        "2. WHERE - filter rows",
        "3. GROUP BY - make groups",
        "4. HAVING - filter groups",
        "5. SELECT - compute columns and aliases",
        "6. DISTINCT",
        "7. ORDER BY - sort (aliases allowed here)",
        "8. LIMIT / OFFSET"
      ],
      "tip": "Memory trick: \"Friendly Workers Go Home Safely On Leave\" = FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT."
    },
    {
      "heading": "Rounding and NULL Handling in Aggregates",
      "content": "AVG often returns long decimals. Wrap it with ROUND(value, 2). If a column has NULLs, AVG divides only by the non-NULL count, which can surprise you. Use COALESCE(col, 0) inside the aggregate if NULL should count as zero.",
      "syntax": "SELECT ROUND(AVG(salary), 2) FROM employees;\nSELECT AVG(COALESCE(bonus, 0)) FROM employees;"
    }
  ],
  "examples": [
    {
      "title": "Company-Wide Summary",
      "scenario": "The CEO wants one line: number of employees, total payroll, average, lowest and highest salary.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT COUNT(*)              AS employees,\n       SUM(salary)           AS total_payroll,\n       ROUND(AVG(salary), 2) AS avg_salary,\n       MIN(salary)           AS min_salary,\n       MAX(salary)           AS max_salary\nFROM employees;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT COUNT(*)              AS employees,\n       SUM(salary)           AS total_payroll,\n       ROUND(AVG(salary), 2) AS avg_salary,\n       MIN(salary)           AS min_salary,\n       MAX(salary)           AS max_salary\nFROM employees;"
      },
      "result": "employees | total_payroll | avg_salary | min_salary | max_salary\n----------+---------------+------------+------------+-----------\n9         | 605000        | 67222.22   | 40000      | 95000\n(1 row)",
      "explanation": "Without GROUP BY, the whole table is one group, so we get exactly one row. AVG = 605000 / 9 = 67222.22 after rounding."
    },
    {
      "title": "COUNT(*) vs COUNT(column) vs COUNT(DISTINCT)",
      "scenario": "How many employees, how many have an email, how many have a department, and in how many distinct departments do they work?",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT COUNT(*)                AS all_rows,\n       COUNT(email)            AS with_email,\n       COUNT(dept_id)          AS with_dept,\n       COUNT(DISTINCT dept_id) AS distinct_depts\nFROM employees;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT COUNT(*)                AS all_rows,\n       COUNT(email)            AS with_email,\n       COUNT(dept_id)          AS with_dept,\n       COUNT(DISTINCT dept_id) AS distinct_depts\nFROM employees;"
      },
      "result": "all_rows | with_email | with_dept | distinct_depts\n---------+------------+-----------+---------------\n9        | 8          | 8         | 4\n(1 row)",
      "explanation": "COUNT(*) counts all 9 rows. COUNT(email) skips Meera's NULL email (8). COUNT(dept_id) skips Karan (8). COUNT(DISTINCT dept_id) counts unique non-NULL departments: 1, 2, 3, 4 = 4."
    },
    {
      "title": "GROUP BY: Headcount and Payroll per Department",
      "scenario": "HR needs headcount, total and average salary for each department.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT dept_id,\n       COUNT(*)              AS headcount,\n       SUM(salary)           AS total_salary,\n       ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nGROUP BY dept_id\nORDER BY total_salary DESC;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT dept_id,\n       COUNT(*)              AS headcount,\n       SUM(salary)           AS total_salary,\n       ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nGROUP BY dept_id\nORDER BY total_salary DESC;"
      },
      "result": "dept_id | headcount | total_salary | avg_salary\n--------+-----------+--------------+-----------\n2       | 3         | 235000       | 78333.33\n1       | 3         | 192000       | 64000.0\n4       | 1         | 78000        | 78000.0\n3       | 1         | 60000        | 60000.0\nNULL    | 1         | 40000        | 40000.0\n(5 rows)",
      "explanation": "Rows are bucketed by dept_id. Karan, who has no department, forms his own NULL group. SQLite prints whole-number averages as 64000.0 (a real number); MySQL would show 64000.0000. The department names come on Day 6 with joins."
    },
    {
      "title": "HAVING: Customers Who Spent More Than 10,000",
      "scenario": "Find valuable customers: total spend on non-cancelled orders above 10,000.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT customer_id,\n       COUNT(*)    AS orders_count,\n       SUM(amount) AS total_spent\nFROM orders\nWHERE status <> 'Cancelled'\nGROUP BY customer_id\nHAVING SUM(amount) > 10000\nORDER BY total_spent DESC;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT customer_id,\n       COUNT(*)    AS orders_count,\n       SUM(amount) AS total_spent\nFROM orders\nWHERE status <> 'Cancelled'\nGROUP BY customer_id\nHAVING SUM(amount) > 10000\nORDER BY total_spent DESC;"
      },
      "result": "customer_id | orders_count | total_spent\n------------+--------------+------------\n6           | 2            | 122000\n1           | 3            | 56400\n(2 rows)",
      "explanation": "WHERE first removes the cancelled order (customer 4's laptop). GROUP BY then totals each customer and HAVING keeps only groups above 10000. Customers 2 (8500) and 3 (1000) are filtered out by HAVING."
    },
    {
      "title": "GROUP BY with GROUP_CONCAT",
      "scenario": "For each product category show the number of products, the total stock and the product names in one cell.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL (lets you order the names and pick a separator)\nSELECT category, COUNT(*) AS products, SUM(stock) AS total_stock,\n       GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS product_names\nFROM products\nGROUP BY category\nORDER BY category;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT category,\n       COUNT(*)            AS products,\n       SUM(stock)          AS total_stock,\n       GROUP_CONCAT(name)  AS product_names\nFROM products\nGROUP BY category\nORDER BY category;"
      },
      "result": "category    | products | total_stock | product_names\n------------+----------+-------------+------------------------------\nElectronics | 4        | 360         | Laptop,Mouse,Keyboard,Monitor\nFurniture   | 2        | 33          | Office Chair,Desk\nStationery  | 2        | 6000        | Notebook,Pen\n(3 rows)",
      "explanation": "GROUP_CONCAT joins the names of each group into one string. MySQL supports ORDER BY and SEPARATOR inside it; SQLite's group_concat(name, ', ') takes the separator as a second argument and uses a comma by default."
    },
    {
      "title": "Monthly Order Report",
      "scenario": "Show the number of orders and revenue per month in 2024 (excluding cancelled orders).",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSELECT DATE_FORMAT(order_date, '%Y-%m') AS month,\n       COUNT(*) AS orders, SUM(amount) AS revenue\nFROM orders\nWHERE status <> 'Cancelled'\nGROUP BY month\nORDER BY month;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT strftime('%Y-%m', order_date) AS month,\n       COUNT(*)    AS orders,\n       SUM(amount) AS revenue\nFROM orders\nWHERE status <> 'Cancelled'\nGROUP BY month\nORDER BY month;"
      },
      "result": "month   | orders | revenue\n--------+--------+--------\n2024-01 | 3      | 63000\n2024-02 | 2      | 2000\n2024-03 | 4      | 122900\n(3 rows)",
      "explanation": "We group by a calculated value: the year-month part of the date. MySQL uses DATE_FORMAT(date, '%Y-%m'); SQLite uses strftime('%Y-%m', date). MySQL allows GROUP BY an alias like month."
    }
  ],
  "interview": [
    {
      "q": "What are aggregate functions? Name five.",
      "a": "Functions that return one value from many rows: COUNT, SUM, AVG, MIN, MAX (also GROUP_CONCAT, STDDEV in MySQL).",
      "level": "Easy"
    },
    {
      "q": "Difference between COUNT(*), COUNT(1) and COUNT(col)?",
      "a": "COUNT(*) and COUNT(1) both count all rows, including rows with NULLs; performance is the same in MySQL. COUNT(col) counts only rows where col is not NULL.",
      "level": "Medium"
    },
    {
      "q": "Difference between WHERE and HAVING?",
      "a": "WHERE filters rows before grouping and cannot use aggregates. HAVING filters groups after GROUP BY and can use aggregates. You can use both in one query.",
      "level": "Medium"
    },
    {
      "q": "Can we use HAVING without GROUP BY?",
      "a": "Yes. The whole table is treated as one group, e.g. SELECT COUNT(*) FROM orders HAVING COUNT(*) > 5; returns a row only if the condition holds.",
      "level": "Hard"
    },
    {
      "q": "Do aggregate functions consider NULL?",
      "a": "No, all except COUNT(*) ignore NULLs. AVG(col) = SUM(col)/COUNT(col), not divided by all rows.",
      "level": "Medium"
    },
    {
      "q": "What is ONLY_FULL_GROUP_BY?",
      "a": "A MySQL SQL mode (on by default in 5.7+/8) that rejects queries whose SELECT list contains non-aggregated columns that are not in GROUP BY, because their value would be ambiguous.",
      "level": "Hard"
    },
    {
      "q": "What is the order of execution of a SELECT query?",
      "a": "FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT.",
      "level": "Medium"
    },
    {
      "q": "How do you find duplicate emails in a table?",
      "a": "SELECT email, COUNT(*) FROM customers GROUP BY email HAVING COUNT(*) > 1;",
      "level": "Medium"
    },
    {
      "q": "Can you use an alias in HAVING?",
      "a": "MySQL allows it (HAVING total > 100) as an extension; standard SQL does not, so writing the full aggregate HAVING SUM(amount) > 100 is portable.",
      "level": "Hard"
    },
    {
      "q": "What does SELECT MAX(name) FROM employees return?",
      "a": "The alphabetically last name (Vikram Singh in our data). MIN/MAX work on text and dates too.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Count how many products are in each category.",
      "hint": "GROUP BY category",
      "solution": "SELECT category, COUNT(*) AS products FROM products GROUP BY category;"
    },
    {
      "task": "Show the total quantity and amount sold per product_id, highest amount first.",
      "hint": "SUM(quantity), SUM(amount), GROUP BY product_id, ORDER BY",
      "solution": "SELECT product_id, SUM(quantity) AS qty, SUM(amount) AS revenue\nFROM orders GROUP BY product_id ORDER BY revenue DESC;"
    },
    {
      "task": "List cities that have more than one employee.",
      "hint": "GROUP BY city HAVING COUNT(*) > 1",
      "solution": "SELECT city, COUNT(*) AS cnt FROM employees GROUP BY city HAVING COUNT(*) > 1;"
    },
    {
      "task": "Find the number of orders per status.",
      "hint": "GROUP BY status",
      "solution": "SELECT status, COUNT(*) AS orders FROM orders GROUP BY status ORDER BY orders DESC;"
    },
    {
      "task": "Show departments (dept_id) whose average salary is above 65,000, excluding employees hired after 2022.",
      "hint": "WHERE hire_date <= '2022-12-31' then HAVING AVG(salary) > 65000",
      "solution": "SELECT dept_id, ROUND(AVG(salary), 2) AS avg_sal\nFROM employees\nWHERE hire_date <= '2022-12-31'\nGROUP BY dept_id\nHAVING AVG(salary) > 65000;"
    }
  ],
  "quiz": [
    {
      "question": "Which function ignores NULLs?",
      "options": [
        "COUNT(*)",
        "All of them",
        "SUM(col)",
        "None of them"
      ],
      "answer": 2,
      "explanation": "SUM, AVG, MIN, MAX and COUNT(col) ignore NULLs; COUNT(*) does not."
    },
    {
      "question": "Which clause filters groups?",
      "options": [
        "WHERE",
        "HAVING",
        "ORDER BY",
        "LIMIT"
      ],
      "answer": 1,
      "explanation": "HAVING filters after GROUP BY."
    },
    {
      "question": "Which runs first logically?",
      "options": [
        "SELECT",
        "HAVING",
        "GROUP BY",
        "WHERE"
      ],
      "answer": 3,
      "explanation": "WHERE runs before GROUP BY, HAVING and SELECT."
    },
    {
      "question": "A table has 10 rows, 3 with NULL in bonus. COUNT(bonus) returns:",
      "options": [
        "7",
        "10",
        "3",
        "NULL"
      ],
      "answer": 0,
      "explanation": "COUNT(col) counts non-NULL values."
    },
    {
      "question": "Which query finds duplicate emails?",
      "options": [
        "SELECT DISTINCT email FROM t",
        "SELECT email FROM t WHERE COUNT(*) > 1",
        "SELECT email FROM t GROUP BY email HAVING COUNT(*) > 1",
        "SELECT email FROM t ORDER BY email"
      ],
      "answer": 2,
      "explanation": "Group by email and keep groups with more than one row."
    }
  ]
};
