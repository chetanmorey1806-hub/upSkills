export default {
  "id": "day-07-subqueries-correlated-subqueries",
  "title": "Subqueries and Correlated Subqueries",
  "module": "Module 2: Joins & Functions",
  "day": 7,
  "level": "Intermediate",
  "duration": "2.5 hours",
  "summary": "Write queries inside queries: single-row, multi-row, derived-table and correlated subqueries, and use IN, EXISTS, ANY and ALL to answer multi-step questions.",
  "objectives": [
    "Write scalar (single-value) subqueries in WHERE and SELECT",
    "Use multi-row subqueries with IN, NOT IN, ANY and ALL",
    "Use a subquery in FROM (derived table) with an alias",
    "Understand correlated subqueries and EXISTS / NOT EXISTS",
    "Choose between a subquery and a JOIN"
  ],
  "theory": [
    {
      "heading": "What is a Subquery?",
      "content": "A subquery (inner query) is a SELECT written inside another statement (outer query), always inside brackets. The inner query runs first and hands its answer to the outer query. Real-life analogy: \"Show me students who scored more than the class average.\" Step 1: find the class average. Step 2: compare each student with it. A subquery lets you do both steps in one statement.",
      "syntax": "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);",
      "points": [
        "Can appear in WHERE, HAVING, SELECT, FROM, and in INSERT/UPDATE/DELETE",
        "Must be enclosed in parentheses",
        "A subquery in FROM must have an alias in MySQL"
      ]
    },
    {
      "heading": "Single-Row (Scalar) vs Multi-Row Subqueries",
      "content": "A scalar subquery returns exactly one value (one row, one column), so you can compare it with =, >, <. A multi-row subquery returns a list, so you must use IN, NOT IN, ANY or ALL. Using = with a subquery that returns several rows gives MySQL error 1242 \"Subquery returns more than 1 row\".",
      "points": [
        "= , > , < with a single value",
        "IN (list): equal to any value in the list",
        "> ANY (list): greater than at least one value (= greater than the MIN)",
        "> ALL (list): greater than every value (= greater than the MAX)",
        "ANY / ALL are supported in MySQL but NOT in SQLite; rewrite them with MIN/MAX for the SQL Lab"
      ]
    },
    {
      "heading": "Derived Tables (Subquery in FROM)",
      "content": "A subquery in FROM acts like a temporary table that exists only for that query. It is useful for \"aggregate of an aggregate\", for example the average of department totals.",
      "syntax": "SELECT AVG(total) AS avg_dept_payroll\nFROM (SELECT dept_id, SUM(salary) AS total\n      FROM employees GROUP BY dept_id) AS t;",
      "tip": "CTEs (WITH ... AS, Day 14) do the same job and are easier to read. MySQL 8 supports them."
    },
    {
      "heading": "Correlated Subqueries",
      "content": "A correlated subquery uses a column from the outer query, so it cannot run on its own. It runs once for EACH row of the outer query, like a loop. Example: \"employees who earn more than the average of THEIR OWN department\". For each employee, the inner query computes that employee's department average.",
      "syntax": "SELECT e.name, e.salary, e.dept_id\nFROM employees e\nWHERE e.salary > (SELECT AVG(x.salary)\n                  FROM employees x\n                  WHERE x.dept_id = e.dept_id);",
      "points": [
        "Non-correlated: inner query runs once",
        "Correlated: inner query runs per outer row (can be slow on big tables)",
        "Often can be rewritten as a JOIN with a grouped derived table or a window function"
      ]
    },
    {
      "heading": "EXISTS and NOT EXISTS",
      "content": "EXISTS returns TRUE if the subquery returns at least one row. It does not care about the values, so SELECT 1 is common inside it. It stops at the first match, which makes it efficient. NOT EXISTS is the safest way to find \"rows without a match\", because unlike NOT IN it is not broken by NULLs.",
      "syntax": "SELECT c.name FROM customers c\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);"
    },
    {
      "heading": "Subquery vs JOIN",
      "content": "Many questions can be answered either way. JOINs are usually better when you need columns from both tables. Subqueries are clearer for filtering (\"customers who have ordered\") and for comparing with an aggregate. Modern MySQL optimisers often convert IN subqueries into joins (semi-joins), so readability should decide first.",
      "points": [
        "Need columns from both tables -> JOIN",
        "Only filtering on existence -> EXISTS / IN",
        "Compare with an aggregate -> scalar subquery",
        "NOT IN + a NULL in the subquery = no rows; prefer NOT EXISTS"
      ]
    }
  ],
  "examples": [
    {
      "title": "Scalar Subquery: Above-Average Salary",
      "scenario": "HR wants employees earning above the company average.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC;"
      },
      "result": "name        | salary\n------------+-------\nAsha Rao    | 95000\nPriya Shah  | 85000\nSneha Iyer  | 78000\nRahul Mehta | 72000\nArjun Nair  | 68000\n(5 rows)",
      "explanation": "The inner query returns one number (67222.22). The outer query compares every salary with it and returns the 5 employees above it."
    },
    {
      "title": "Multi-Row Subquery with IN",
      "scenario": "List customers who bought any Electronics product.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, city\nFROM customers\nWHERE customer_id IN (\n  SELECT o.customer_id\n  FROM orders o\n  JOIN products p ON o.product_id = p.product_id\n  WHERE p.category = 'Electronics'\n)\nORDER BY name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, city\nFROM customers\nWHERE customer_id IN (\n  SELECT o.customer_id\n  FROM orders o\n  JOIN products p ON o.product_id = p.product_id\n  WHERE p.category = 'Electronics'\n)\nORDER BY name;"
      },
      "result": "name        | city\n------------+----------\nAmit Kumar  | Mumbai\nDivya Menon | Bengaluru\nJohn Dsouza | Goa\nPooja Verma | Pune\nSara Khan   | Delhi\n(5 rows)",
      "explanation": "The inner query returns a list of customer ids (with duplicates, which IN ignores). The outer query returns each matching customer once. A JOIN would repeat a customer once per matching order unless you add DISTINCT."
    },
    {
      "title": "Correlated Subquery: Above Their Own Department Average",
      "scenario": "Find employees who earn more than the average salary of their own department.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT e.name, e.dept_id, e.salary\nFROM employees e\nWHERE e.salary > (SELECT AVG(x.salary)\n                  FROM employees x\n                  WHERE x.dept_id = e.dept_id)\nORDER BY e.dept_id;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT e.name, e.dept_id, e.salary\nFROM employees e\nWHERE e.salary > (SELECT AVG(x.salary)\n                  FROM employees x\n                  WHERE x.dept_id = e.dept_id)\nORDER BY e.dept_id;"
      },
      "result": "name       | dept_id | salary\n-----------+---------+-------\nPriya Shah | 1       | 85000\nAsha Rao   | 2       | 95000\n(2 rows)",
      "explanation": "For Asha (IT) the inner query computes the IT average 78333; for Priya (Sales) the Sales average 64000. Each employee is compared with their own department, which is why it is \"correlated\". Karan (NULL department) never matches x.dept_id = NULL, so the inner AVG is NULL and he is excluded."
    },
    {
      "title": "Derived Table: Department Payroll vs Average Department Payroll",
      "scenario": "Which departments have a total payroll above the average department payroll?",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT t.dept_id, t.total\nFROM (SELECT dept_id, SUM(salary) AS total\n      FROM employees\n      WHERE dept_id IS NOT NULL\n      GROUP BY dept_id) AS t\nWHERE t.total > (SELECT AVG(total)\n                 FROM (SELECT SUM(salary) AS total\n                       FROM employees\n                       WHERE dept_id IS NOT NULL\n                       GROUP BY dept_id) AS t2);",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT t.dept_id, t.total\nFROM (SELECT dept_id, SUM(salary) AS total\n      FROM employees\n      WHERE dept_id IS NOT NULL\n      GROUP BY dept_id) AS t\nWHERE t.total > (SELECT AVG(total)\n                 FROM (SELECT SUM(salary) AS total\n                       FROM employees\n                       WHERE dept_id IS NOT NULL\n                       GROUP BY dept_id) AS t2);"
      },
      "result": "dept_id | total\n--------+-------\n1       | 192000\n2       | 235000\n(2 rows)",
      "explanation": "The derived table t holds one row per department with its total. The scalar subquery computes the average of those totals (565000 / 4 = 141250). IT (235000) and Sales (192000) are above it. On Day 14 a CTE will avoid writing the same subquery twice."
    },
    {
      "title": "EXISTS and NOT EXISTS",
      "scenario": "Which departments have at least one employee earning above 70,000, and which customers have never ordered?",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT d.dept_name\nFROM departments d\nWHERE EXISTS (SELECT 1 FROM employees e\n              WHERE e.dept_id = d.dept_id AND e.salary > 70000)\nORDER BY d.dept_name;\nSELECT c.name\nFROM customers c\nWHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT d.dept_name\nFROM departments d\nWHERE EXISTS (SELECT 1 FROM employees e\n              WHERE e.dept_id = d.dept_id AND e.salary > 70000)\nORDER BY d.dept_name;\nSELECT c.name\nFROM customers c\nWHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);"
      },
      "result": "dept_name\n---------\nFinance\nIT\nSales\n(3 rows)\n\nname\n---------\nRavi Teja\n(1 row)",
      "explanation": "EXISTS only checks whether at least one row comes back. Sales (Priya 85000), IT (Asha, Rahul) and Finance (Sneha 78000) qualify. NOT EXISTS returns Ravi Teja, the only customer without orders."
    },
    {
      "title": "ALL / ANY in MySQL and Their SQLite Rewrite",
      "scenario": "Find employees who earn more than EVERY employee in Sales (dept 1).",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSELECT name, salary\nFROM employees\nWHERE salary > ALL (SELECT salary FROM employees WHERE dept_id = 1);\n\n-- > ANY means \"greater than at least one\" (= greater than the minimum)\nSELECT name, salary\nFROM employees\nWHERE salary > ANY (SELECT salary FROM employees WHERE dept_id = 1);",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT MAX(salary) FROM employees WHERE dept_id = 1);"
      },
      "result": "name     | salary\n---------+-------\nAsha Rao | 95000\n(1 row)",
      "explanation": "> ALL is the same as > MAX, and > ANY is the same as > MIN. SQLite does not support ANY/ALL, so the SQL Lab version uses MAX. Sales salaries are 85000, 55000, 52000, so only Asha (95000) earns more than all of them."
    }
  ],
  "interview": [
    {
      "q": "What is a subquery?",
      "a": "A query nested inside another SQL statement, enclosed in parentheses. The inner query result is used by the outer query.",
      "level": "Easy"
    },
    {
      "q": "Types of subqueries?",
      "a": "Scalar (single value), single-row, multi-row, multi-column, correlated, and derived tables (in FROM). By position: in WHERE, HAVING, SELECT or FROM.",
      "level": "Medium"
    },
    {
      "q": "What is a correlated subquery?",
      "a": "A subquery that refers to a column of the outer query. It is evaluated once for every row of the outer query, like a nested loop.",
      "level": "Medium"
    },
    {
      "q": "Difference between IN and EXISTS?",
      "a": "IN compares a value with a list returned by the subquery. EXISTS checks whether the (usually correlated) subquery returns any row and stops at the first match. EXISTS is often faster for large inner tables and handles NULLs safely.",
      "level": "Medium"
    },
    {
      "q": "Why is NOT IN dangerous?",
      "a": "If the subquery returns even one NULL, NOT IN returns no rows because x <> NULL is UNKNOWN. Use NOT EXISTS or add WHERE col IS NOT NULL inside the subquery.",
      "level": "Hard"
    },
    {
      "q": "Write a query for the second highest salary using a subquery.",
      "a": "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);",
      "level": "Medium"
    },
    {
      "q": "What is error 1242 in MySQL?",
      "a": "\"Subquery returns more than 1 row\": you used =, < or > with a subquery that returned many rows. Use IN/ANY/ALL or make the subquery return one row (aggregate or LIMIT 1).",
      "level": "Medium"
    },
    {
      "q": "What is a derived table?",
      "a": "A subquery in the FROM clause that acts as a temporary table. MySQL requires an alias: FROM (SELECT ...) AS t.",
      "level": "Easy"
    },
    {
      "q": "Can a subquery be used in UPDATE or DELETE?",
      "a": "Yes, e.g. DELETE FROM orders WHERE customer_id IN (SELECT customer_id FROM customers WHERE city = 'Goa'). MySQL does not allow selecting from the same table you are updating in a subquery directly (error 1093); wrap it in a derived table.",
      "level": "Hard"
    },
    {
      "q": "Subquery or JOIN: which is faster?",
      "a": "It depends. The MySQL 8 optimiser rewrites many IN/EXISTS subqueries as semi-joins, so performance is often similar. Correlated subqueries that cannot be rewritten run per row and can be slow. Check with EXPLAIN.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Show products priced above the average product price.",
      "hint": "Scalar subquery with AVG(price).",
      "solution": "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);"
    },
    {
      "task": "Find the second highest salary.",
      "hint": "MAX of salaries less than the MAX.",
      "solution": "SELECT MAX(salary) AS second_highest FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);"
    },
    {
      "task": "List employees who work in departments located in Mumbai.",
      "hint": "dept_id IN (SELECT dept_id FROM departments WHERE location = ...)",
      "solution": "SELECT name FROM employees WHERE dept_id IN (SELECT dept_id FROM departments WHERE location = 'Mumbai');"
    },
    {
      "task": "For each product show its name, price and the number of times it was ordered, using a subquery in SELECT.",
      "hint": "Correlated scalar subquery in the SELECT list.",
      "solution": "SELECT p.name, p.price,\n       (SELECT COUNT(*) FROM orders o WHERE o.product_id = p.product_id) AS times_ordered\nFROM products p ORDER BY times_ordered DESC;"
    },
    {
      "task": "Find the most expensive product in each category using a correlated subquery.",
      "hint": "price = (SELECT MAX(price) FROM products x WHERE x.category = p.category)",
      "solution": "SELECT p.category, p.name, p.price\nFROM products p\nWHERE p.price = (SELECT MAX(x.price) FROM products x WHERE x.category = p.category);"
    }
  ],
  "quiz": [
    {
      "question": "A subquery that refers to the outer query's columns is called:",
      "options": [
        "Nested view",
        "Correlated subquery",
        "Derived table",
        "Scalar function"
      ],
      "answer": 1,
      "explanation": "It depends on each outer row."
    },
    {
      "question": "Which operator should you use with a subquery returning many rows?",
      "options": [
        "=",
        ">",
        "IN",
        "LIKE"
      ],
      "answer": 2,
      "explanation": "IN works with a list of values."
    },
    {
      "question": "salary > ALL (subquery) is equivalent to:",
      "options": [
        "salary > MAX(...)",
        "salary > MIN(...)",
        "salary > AVG(...)",
        "salary = ANY(...)"
      ],
      "answer": 0,
      "explanation": "Greater than every value means greater than the maximum."
    },
    {
      "question": "Which is safest for \"rows with no match\" when NULLs may exist?",
      "options": [
        "NOT IN",
        "<> ALL",
        "NOT LIKE",
        "NOT EXISTS"
      ],
      "answer": 3,
      "explanation": "NOT EXISTS is not affected by NULLs."
    },
    {
      "question": "In MySQL a subquery in the FROM clause must have:",
      "options": [
        "An ORDER BY",
        "An alias",
        "A LIMIT",
        "A GROUP BY"
      ],
      "answer": 1,
      "explanation": "Every derived table must have its own alias."
    }
  ]
};
