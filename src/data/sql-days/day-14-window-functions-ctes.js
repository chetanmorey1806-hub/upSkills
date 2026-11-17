export default {
  "id": "day-14-window-functions-ctes",
  "title": "Window Functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, running totals; CTEs",
  "module": "Module 3: Advanced SQL",
  "day": 14,
  "level": "Advanced",
  "duration": "3 hours",
  "summary": "Calculate rankings, running totals, moving averages and row-to-row differences without collapsing rows using window functions (MySQL 8+), and write readable multi-step and recursive queries with CTEs.",
  "objectives": [
    "Explain how window functions differ from GROUP BY",
    "Use OVER with PARTITION BY and ORDER BY",
    "Rank rows with ROW_NUMBER, RANK, DENSE_RANK and NTILE and solve top-N per group",
    "Compare rows with LAG and LEAD and compute running totals and moving averages with frames",
    "Write simple, multiple and recursive CTEs with WITH"
  ],
  "theory": [
    {
      "heading": "What is a Window Function?",
      "content": "GROUP BY squeezes many rows into one row per group, so you lose the details. A window function calculates across a set of related rows (the \"window\") but keeps every row. Analogy: in a class result sheet, each student's row stays visible, but you add a column \"rank in class\" and another \"class average\". Window functions are available in MySQL 8.0+ and SQLite 3.25+.",
      "syntax": "function_name(...) OVER (\n  [PARTITION BY col]      -- split into groups (like GROUP BY, but rows are kept)\n  [ORDER BY col]          -- order inside each partition\n  [frame]                 -- e.g. ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n)",
      "points": [
        "Aggregate windows: SUM, AVG, COUNT, MIN, MAX with OVER",
        "Ranking: ROW_NUMBER, RANK, DENSE_RANK, NTILE, PERCENT_RANK",
        "Value/offset: LAG, LEAD, FIRST_VALUE, LAST_VALUE, NTH_VALUE",
        "Window functions run after WHERE, GROUP BY and HAVING, so you cannot use them in WHERE directly; wrap them in a CTE or subquery"
      ]
    },
    {
      "heading": "ROW_NUMBER vs RANK vs DENSE_RANK",
      "content": "All three number rows in ORDER BY order; they differ only on ties. Suppose salaries are 100, 90, 90, 80.",
      "points": [
        "ROW_NUMBER: 1, 2, 3, 4 - always unique, ties broken arbitrarily",
        "RANK: 1, 2, 2, 4 - ties share a rank, then a gap",
        "DENSE_RANK: 1, 2, 2, 3 - ties share a rank, no gap",
        "NTILE(4): splits rows into 4 roughly equal buckets (quartiles)",
        "Nth highest salary: DENSE_RANK() = N (handles ties correctly)"
      ]
    },
    {
      "heading": "LAG and LEAD",
      "content": "LAG looks at a previous row and LEAD at a following row in the window order, without a self join. Perfect for \"change versus last month\" or \"days since previous order\".",
      "syntax": "LAG(amount, 1, 0) OVER (ORDER BY order_date)   -- previous amount, default 0\nLEAD(order_date)  OVER (PARTITION BY customer_id ORDER BY order_date)"
    },
    {
      "heading": "Running Totals, Moving Averages and Frames",
      "content": "With ORDER BY inside OVER, SUM becomes a running (cumulative) total. A frame clause controls exactly which rows are included. The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which treats rows with the same ORDER BY value as peers (ties are added together).",
      "syntax": "SUM(amount) OVER (ORDER BY order_date, order_id\n                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)   -- running total\nAVG(amount) OVER (ORDER BY order_date\n                  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)           -- 3-row moving average",
      "tip": "Use a named window to avoid repeating yourself: ... OVER w FROM t WINDOW w AS (PARTITION BY dept_id ORDER BY salary DESC). Works in MySQL 8 and SQLite."
    },
    {
      "heading": "CTEs: Common Table Expressions",
      "content": "A CTE is a named temporary result defined with WITH at the start of a query. It exists only for that statement. CTEs make long queries readable, like breaking a big math problem into labelled steps. You can define several CTEs separated by commas, and later CTEs can use earlier ones. Supported in MySQL 8.0+ and SQLite.",
      "syntax": "WITH dept_totals AS (\n  SELECT dept_id, SUM(salary) AS total FROM employees GROUP BY dept_id\n),\navg_total AS (\n  SELECT AVG(total) AS avg_t FROM dept_totals\n)\nSELECT d.* FROM dept_totals d, avg_total a WHERE d.total > a.avg_t;",
      "points": [
        "CTE vs subquery: same power, but a CTE has a name and can be referenced multiple times",
        "CTE vs view: a view is saved in the database; a CTE lives only for one query",
        "CTE vs temporary table: a temp table is physically created and lasts for the session"
      ]
    },
    {
      "heading": "Recursive CTEs",
      "content": "A recursive CTE refers to itself. It has an anchor member (starting rows) UNION ALL a recursive member (rows built from the previous step), and stops when the recursive part returns no rows. Use it for hierarchies (org charts, category trees) and to generate series (dates 1 to 31).",
      "syntax": "WITH RECURSIVE nums AS (\n  SELECT 1 AS n                 -- anchor\n  UNION ALL\n  SELECT n + 1 FROM nums        -- recursive member\n  WHERE n < 5                   -- stop condition\n)\nSELECT n FROM nums;",
      "tip": "MySQL stops runaway recursion at cte_max_recursion_depth (default 1000). Always include a stop condition."
    }
  ],
  "examples": [
    {
      "title": "ROW_NUMBER, RANK and DENSE_RANK Side by Side",
      "scenario": "Rank products by price. Two products share the same price after a price change, so watch how ties are handled.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, price,\n       ROW_NUMBER() OVER (ORDER BY price DESC, name) AS row_num,\n       RANK()       OVER (ORDER BY price DESC) AS rnk,\n       DENSE_RANK() OVER (ORDER BY price DESC) AS dense_rnk\nFROM products\nORDER BY price DESC, name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nUPDATE products SET price = 7000 WHERE product_id = 8;",
        "query": "SELECT name, price,\n       ROW_NUMBER() OVER (ORDER BY price DESC, name) AS row_num,\n       RANK()       OVER (ORDER BY price DESC) AS rnk,\n       DENSE_RANK() OVER (ORDER BY price DESC) AS dense_rnk\nFROM products\nORDER BY price DESC, name;"
      },
      "result": "name         | price | row_num | rnk | dense_rnk\n-------------+-------+---------+-----+----------\nLaptop       | 55000 | 1       | 1   | 1\nDesk         | 12000 | 2       | 2   | 2\nMonitor      | 7000  | 3       | 3   | 3\nOffice Chair | 7000  | 4       | 3   | 3\nKeyboard     | 1500  | 5       | 5   | 4\nMouse        | 500   | 6       | 6   | 5\nNotebook     | 50    | 7       | 7   | 6\nPen          | 20    | 8       | 8   | 7\n(8 rows)",
      "explanation": "The setup makes Monitor cost 7000, the same as Office Chair. ROW_NUMBER still gives them different numbers, 3 and 4 (we added name as a tie-breaker so the numbering is predictable). RANK gives both 3 and then skips to 5. DENSE_RANK gives both 3 and continues with 4. Every product row is kept, unlike GROUP BY."
    },
    {
      "title": "Top-N per Group with PARTITION BY",
      "scenario": "Find the highest-paid employee in each department.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "WITH ranked AS (\n  SELECT e.name, d.dept_name, e.salary,\n         ROW_NUMBER() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rn\n  FROM employees e\n  JOIN departments d ON d.dept_id = e.dept_id\n)\nSELECT dept_name, name, salary\nFROM ranked\nWHERE rn = 1\nORDER BY salary DESC;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "WITH ranked AS (\n  SELECT e.name, d.dept_name, e.salary,\n         ROW_NUMBER() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rn\n  FROM employees e\n  JOIN departments d ON d.dept_id = e.dept_id\n)\nSELECT dept_name, name, salary\nFROM ranked\nWHERE rn = 1\nORDER BY salary DESC;"
      },
      "result": "dept_name | name       | salary\n----------+------------+-------\nIT        | Asha Rao   | 95000\nSales     | Priya Shah | 85000\nFinance   | Sneha Iyer | 78000\nHR        | Neha Gupta | 60000\n(4 rows)",
      "explanation": "PARTITION BY restarts the numbering for every department. Because a window function cannot be used in WHERE, we compute it in a CTE and filter rn = 1 outside. Change to rn <= 2 for top 2 per department; use DENSE_RANK if ties should all be included."
    },
    {
      "title": "Nth Highest Salary with DENSE_RANK",
      "scenario": "Classic interview question: find the 3rd highest salary, handling duplicates.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "WITH r AS (\n  SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr\n  FROM employees\n)\nSELECT name, salary, dr FROM r WHERE dr IN (2, 3) ORDER BY dr, name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nINSERT INTO employees (emp_id, name, dept_id, salary, hire_date, city) VALUES (10, 'Rohit Das', 2, 85000, '2024-01-10', 'Kolkata');",
        "query": "WITH r AS (\n  SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr\n  FROM employees\n)\nSELECT name, salary, dr FROM r WHERE dr IN (2, 3) ORDER BY dr, name;"
      },
      "result": "name       | salary | dr\n-----------+--------+---\nPriya Shah | 85000  | 2\nRohit Das  | 85000  | 2\nSneha Iyer | 78000  | 3\n(3 rows)",
      "explanation": "The setup adds Rohit with 85000, the same as Priya. DENSE_RANK gives both of them rank 2, so the 3rd highest salary is 78000 (Sneha). With ROW_NUMBER the 3rd row would be one of the 85000s, which is the wrong answer."
    },
    {
      "title": "Running Total and Moving Average",
      "scenario": "Finance wants a cumulative revenue line and a 3-order moving average for non-cancelled orders.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT order_id, order_date, amount,\n       SUM(amount) OVER (ORDER BY order_date, order_id\n                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,\n       ROUND(AVG(amount) OVER (ORDER BY order_date, order_id\n                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3\nFROM orders\nWHERE status <> 'Cancelled'\nORDER BY order_date, order_id;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT order_id, order_date, amount,\n       SUM(amount) OVER (ORDER BY order_date, order_id\n                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,\n       ROUND(AVG(amount) OVER (ORDER BY order_date, order_id\n                               ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3\nFROM orders\nWHERE status <> 'Cancelled'\nORDER BY order_date, order_id;"
      },
      "result": "order_id | order_date | amount | running_total | moving_avg_3\n---------+------------+--------+---------------+-------------\n1        | 2024-01-05 | 55000  | 55000         | 55000.0\n2        | 2024-01-05 | 1000   | 56000         | 28000.0\n3        | 2024-01-18 | 7000   | 63000         | 21000.0\n4        | 2024-02-02 | 500    | 63500         | 2833.33\n6        | 2024-02-20 | 1500   | 65000         | 3000.0\n7        | 2024-03-01 | 12000  | 77000         | 4666.67\n8        | 2024-03-10 | 400    | 77400         | 4633.33\n9        | 2024-03-15 | 500    | 77900         | 4300.0\n10       | 2024-03-22 | 110000 | 187900        | 36966.67\n(9 rows)",
      "explanation": "The running total adds every previous amount to the current one. The moving average uses only the current row and the 2 before it. Ordering by order_date and then order_id makes the order deterministic when two orders share a date (orders 1 and 2)."
    },
    {
      "title": "LAG and LEAD: Compare with Previous Order",
      "scenario": "For each customer, show the previous order amount and the days since their previous order.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSELECT customer_id, order_id, order_date, amount,\n       LAG(amount) OVER w AS prev_amount,\n       DATEDIFF(order_date, LAG(order_date) OVER w) AS days_since_prev,\n       LEAD(order_id) OVER w AS next_order\nFROM orders\nWINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)\nORDER BY customer_id, order_date;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT customer_id, order_id, order_date, amount,\n       LAG(amount) OVER w AS prev_amount,\n       CAST(julianday(order_date) - julianday(LAG(order_date) OVER w) AS INTEGER) AS days_since_prev,\n       LEAD(order_id) OVER w AS next_order\nFROM orders\nWHERE customer_id IN (1, 2, 3)\nWINDOW w AS (PARTITION BY customer_id ORDER BY order_date, order_id)\nORDER BY customer_id, order_date, order_id;"
      },
      "result": "customer_id | order_id | order_date | amount | prev_amount | days_since_prev | next_order\n------------+----------+------------+--------+-------------+-----------------+-----------\n1           | 1        | 2024-01-05 | 55000  | NULL        | NULL            | 2\n1           | 2        | 2024-01-05 | 1000   | 55000       | 0               | 8\n1           | 8        | 2024-03-10 | 400    | 1000        | 65              | NULL\n2           | 3        | 2024-01-18 | 7000   | NULL        | NULL            | 6\n2           | 6        | 2024-02-20 | 1500   | 7000        | 33              | NULL\n3           | 4        | 2024-02-02 | 500    | NULL        | NULL            | 9\n3           | 9        | 2024-03-15 | 500    | 500         | 42              | NULL\n(7 rows)",
      "explanation": "LAG returns NULL for the first order of each customer because there is no previous row in that partition; LEAD returns NULL for the last. MySQL uses DATEDIFF; SQLite uses julianday subtraction. The named window w avoids repeating the OVER clause."
    },
    {
      "title": "Recursive CTE: Org Chart and a Date Series",
      "scenario": "Show the reporting hierarchy under Priya Shah (emp 3) with levels, then generate the first 5 days of March 2024 for a calendar report.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "WITH RECURSIVE team AS (\n  SELECT emp_id, name, manager_id, 0 AS level\n  FROM employees WHERE emp_id = 3\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, t.level + 1\n  FROM employees e\n  JOIN team t ON e.manager_id = t.emp_id\n)\nSELECT emp_id, name, level FROM team ORDER BY level, emp_id;\n\n-- MySQL date series\nWITH RECURSIVE days AS (\n  SELECT DATE('2024-03-01') AS d\n  UNION ALL\n  SELECT d + INTERVAL 1 DAY FROM days WHERE d < '2024-03-05'\n)\nSELECT d AS day FROM days;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "WITH RECURSIVE team AS (\n  SELECT emp_id, name, manager_id, 0 AS level\n  FROM employees WHERE emp_id = 3\n  UNION ALL\n  SELECT e.emp_id, e.name, e.manager_id, t.level + 1\n  FROM employees e\n  JOIN team t ON e.manager_id = t.emp_id\n)\nSELECT emp_id, name, level FROM team ORDER BY level, emp_id;\nWITH RECURSIVE days AS (\n  SELECT DATE('2024-03-01') AS d\n  UNION ALL\n  SELECT DATE(d, '+1 day') FROM days WHERE d < '2024-03-05'\n)\nSELECT d AS day FROM days;"
      },
      "result": "emp_id | name         | level\n-------+--------------+------\n3      | Priya Shah   | 0\n4      | Vikram Singh | 1\n8      | Karan Patel  | 1\n9      | Meera Joshi  | 1\n(4 rows)\n\nday\n----------\n2024-03-01\n2024-03-02\n2024-03-03\n2024-03-04\n2024-03-05\n(5 rows)",
      "explanation": "The anchor selects Priya (level 0). Each recursive step finds employees whose manager is already in the result and adds 1 to the level. It stops when no new reports are found. The date series uses the same idea to produce consecutive dates; MySQL adds days with + INTERVAL 1 DAY, SQLite with DATE(d, '+1 day')."
    }
  ],
  "interview": [
    {
      "q": "What is a window function? How is it different from GROUP BY?",
      "a": "A function that computes a value over a set of rows related to the current row using OVER(). GROUP BY collapses rows into one per group; window functions keep every row and add the computed value.",
      "level": "Medium"
    },
    {
      "q": "Difference between ROW_NUMBER, RANK and DENSE_RANK?",
      "a": "For values 100, 90, 90, 80: ROW_NUMBER = 1,2,3,4; RANK = 1,2,2,4 (gaps after ties); DENSE_RANK = 1,2,2,3 (no gaps).",
      "level": "Medium"
    },
    {
      "q": "How do you find the Nth highest salary?",
      "a": "WITH r AS (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) dr FROM employees) SELECT DISTINCT salary FROM r WHERE dr = N; Alternatives: LIMIT 1 OFFSET N-1 on DISTINCT salaries, or a correlated subquery counting higher salaries.",
      "level": "Medium"
    },
    {
      "q": "What is PARTITION BY?",
      "a": "It divides rows into groups for the window function; the calculation restarts for each partition. Unlike GROUP BY it does not reduce the number of rows.",
      "level": "Easy"
    },
    {
      "q": "What do LAG and LEAD do?",
      "a": "LAG(col, n, default) returns the value from n rows before the current row; LEAD from n rows after, within the window order. Used for period-over-period comparisons.",
      "level": "Easy"
    },
    {
      "q": "How do you calculate a running total?",
      "a": "SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). Add PARTITION BY to restart per customer or per month.",
      "level": "Medium"
    },
    {
      "q": "Difference between ROWS and RANGE frames?",
      "a": "ROWS counts physical rows. RANGE groups rows with the same ORDER BY value as peers, so ties are included together. The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING, which can surprise you with duplicate dates.",
      "level": "Hard"
    },
    {
      "q": "Can you use a window function in WHERE?",
      "a": "No. Window functions are evaluated after WHERE/GROUP BY/HAVING. Compute them in a CTE or derived table and filter in the outer query (MySQL 8 has no QUALIFY clause).",
      "level": "Medium"
    },
    {
      "q": "What is a CTE and why use it?",
      "a": "A Common Table Expression defined with WITH; a named temporary result for one statement. It improves readability, allows reuse within the query and supports recursion.",
      "level": "Easy"
    },
    {
      "q": "What is a recursive CTE? Give a use case.",
      "a": "A CTE that references itself: an anchor query UNION ALL a recursive query, ending when no rows are added. Use cases: org charts, category trees, bill of materials, generating number/date series.",
      "level": "Hard"
    },
    {
      "q": "CTE vs temporary table vs view?",
      "a": "CTE: exists only during one statement. Temporary table: physically created, lasts for the session, can be indexed. View: stored definition in the database, reusable by everyone.",
      "level": "Medium"
    },
    {
      "q": "Which MySQL version introduced window functions and CTEs?",
      "a": "MySQL 8.0. On MySQL 5.7 you had to use user variables or self joins.",
      "level": "Easy"
    }
  ],
  "practice": [
    {
      "task": "Rank customers by total non-cancelled spend using DENSE_RANK.",
      "hint": "Aggregate in a CTE, then DENSE_RANK over the total.",
      "solution": "WITH spend AS (\n  SELECT customer_id, SUM(amount) AS total\n  FROM orders WHERE status <> 'Cancelled' GROUP BY customer_id\n)\nSELECT customer_id, total, DENSE_RANK() OVER (ORDER BY total DESC) AS rnk FROM spend;"
    },
    {
      "task": "Show each employee's salary and the average salary of their department on the same row.",
      "hint": "AVG(salary) OVER (PARTITION BY dept_id).",
      "solution": "SELECT name, dept_id, salary,\n       ROUND(AVG(salary) OVER (PARTITION BY dept_id), 2) AS dept_avg\nFROM employees;"
    },
    {
      "task": "Find the most expensive product in each category using ROW_NUMBER.",
      "hint": "PARTITION BY category ORDER BY price DESC, filter rn = 1.",
      "solution": "WITH r AS (\n  SELECT name, category, price,\n         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn\n  FROM products\n)\nSELECT category, name, price FROM r WHERE rn = 1;"
    },
    {
      "task": "Show the monthly revenue and the change from the previous month.",
      "hint": "GROUP BY month in a CTE, then LAG.",
      "solution": "WITH m AS (\n  SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue\n  FROM orders WHERE status <> 'Cancelled' GROUP BY month\n)\nSELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM m;"
    },
    {
      "task": "Generate numbers 1 to 10 with a recursive CTE and return only the even ones.",
      "hint": "WITH RECURSIVE ... WHERE n < 10, then WHERE n % 2 = 0.",
      "solution": "WITH RECURSIVE nums AS (\n  SELECT 1 AS n UNION ALL SELECT n + 1 FROM nums WHERE n < 10\n)\nSELECT n FROM nums WHERE n % 2 = 0;"
    }
  ],
  "quiz": [
    {
      "question": "For salaries 100, 90, 90, 80, what does RANK() give for 80?",
      "options": [
        "3",
        "4",
        "2",
        "5"
      ],
      "answer": 1,
      "explanation": "RANK leaves a gap after the tie: 1, 2, 2, 4."
    },
    {
      "question": "Which function returns the value from the previous row?",
      "options": [
        "LEAD",
        "FIRST_VALUE",
        "LAG",
        "PREV"
      ],
      "answer": 2,
      "explanation": "LAG looks backward; LEAD looks forward."
    },
    {
      "question": "Which keyword starts a CTE?",
      "options": [
        "WITH",
        "CTE",
        "DEFINE",
        "TEMP"
      ],
      "answer": 0,
      "explanation": "WITH name AS (...)."
    },
    {
      "question": "Window functions are evaluated:",
      "options": [
        "Before WHERE",
        "Before FROM",
        "Instead of GROUP BY",
        "After WHERE, GROUP BY and HAVING"
      ],
      "answer": 3,
      "explanation": "That is why they cannot appear in WHERE."
    },
    {
      "question": "Which clause restarts the calculation for each department?",
      "options": [
        "ORDER BY dept_id",
        "PARTITION BY dept_id",
        "GROUP BY dept_id",
        "ROWS dept_id"
      ],
      "answer": 1,
      "explanation": "PARTITION BY splits the window."
    }
  ]
};
