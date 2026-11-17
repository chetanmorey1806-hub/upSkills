export default {
  "id": "day-04-operators-order-by-limit-distinct-like",
  "title": "Operators, ORDER BY, LIMIT, DISTINCT, LIKE, IN, BETWEEN, IS NULL",
  "module": "Module 1: SQL Basics",
  "day": 4,
  "level": "Beginner",
  "duration": "2 hours",
  "summary": "Filter rows precisely with logical and special operators, remove duplicates with DISTINCT, sort with ORDER BY and fetch top-N rows with LIMIT.",
  "objectives": [
    "Combine conditions with AND, OR, NOT and understand operator precedence",
    "Use IN, BETWEEN, LIKE with % and _ wildcards, and IS NULL",
    "Sort by one or more columns ascending and descending",
    "Use LIMIT and OFFSET for top-N queries and pagination",
    "Remove duplicate rows with DISTINCT"
  ],
  "theory": [
    {
      "heading": "Arithmetic, Comparison and Logical Operators",
      "content": "Operators are the symbols and words SQL uses to calculate and compare. Logical operators combine several conditions, just like saying \"show me phones under 20,000 AND with 8 GB RAM\" on a shopping site.",
      "points": [
        "Arithmetic: + - * / % (MySQL also has DIV for integer division)",
        "Comparison: = , != or <> , > , < , >= , <=",
        "AND: both conditions must be true",
        "OR: at least one condition must be true",
        "NOT: reverses a condition",
        "Precedence: NOT, then AND, then OR. Use brackets to be clear: WHERE (city = 'Mumbai' OR city = 'Pune') AND salary > 50000"
      ]
    },
    {
      "heading": "IN and BETWEEN",
      "content": "IN checks a value against a list. It is a short form of many ORs. BETWEEN checks a range and INCLUDES both ends.",
      "syntax": "WHERE city IN ('Mumbai', 'Pune', 'Delhi')\nWHERE city NOT IN ('Mumbai', 'Pune')\nWHERE salary BETWEEN 50000 AND 70000      -- same as salary >= 50000 AND salary <= 70000\nWHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'",
      "tip": "NOT IN with a list that contains NULL returns no rows at all, because x <> NULL is unknown. This is a famous interview trap."
    },
    {
      "heading": "LIKE and Wildcards",
      "content": "LIKE matches text patterns. % means \"any number of characters (even zero)\" and _ means \"exactly one character\". In MySQL LIKE is case-insensitive with the default collation; in SQLite it is case-insensitive for English letters too.",
      "points": [
        "'A%' starts with A",
        "'%a' ends with a",
        "'%an%' contains an",
        "'_a%' second letter is a",
        "'____' exactly four characters",
        "NOT LIKE excludes a pattern",
        "MySQL also has REGEXP for regular expressions: WHERE name REGEXP '^[AP]'"
      ]
    },
    {
      "heading": "IS NULL and IS NOT NULL",
      "content": "NULL means \"value unknown or missing\". It is not zero and not an empty string. Because NULL is unknown, NULL = NULL is not true. Always use IS NULL / IS NOT NULL. Functions like IFNULL(col, 'N/A') or COALESCE(col, 'N/A') replace NULL in output.",
      "syntax": "SELECT name FROM employees WHERE email IS NULL;\nSELECT name, COALESCE(email, 'no email') FROM employees;"
    },
    {
      "heading": "DISTINCT, ORDER BY, LIMIT and OFFSET",
      "content": "DISTINCT removes duplicate rows from the result. ORDER BY sorts: ASC (default, A-Z, small to big) or DESC. You can sort by several columns: the second column breaks ties in the first. LIMIT n returns only the first n rows and OFFSET skips rows, which is how pagination works (\"page 2 of search results\").",
      "syntax": "SELECT DISTINCT city FROM employees;\nSELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;\nSELECT name FROM employees ORDER BY name LIMIT 3 OFFSET 3;   -- rows 4-6\n-- MySQL also allows LIMIT offset, count  ->  LIMIT 3, 3",
      "points": [
        "Execution order: FROM -> WHERE -> SELECT -> DISTINCT -> ORDER BY -> LIMIT",
        "ORDER BY can use an alias or column position: ORDER BY 2 DESC",
        "NULLs sort first in ASC order in MySQL and SQLite",
        "SQL Server uses TOP n, Oracle uses FETCH FIRST n ROWS ONLY instead of LIMIT"
      ]
    }
  ],
  "examples": [
    {
      "title": "AND, OR and Brackets",
      "scenario": "Find employees in Mumbai or Pune who earn more than 55,000.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, city, salary\nFROM employees\nWHERE (city = 'Mumbai' OR city = 'Pune') AND salary > 55000;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, city, salary\nFROM employees\nWHERE (city = 'Mumbai' OR city = 'Pune') AND salary > 55000;"
      },
      "result": "name       | city   | salary\n-----------+--------+-------\nPriya Shah | Mumbai | 85000\nNeha Gupta | Pune   | 60000\nSneha Iyer | Mumbai | 78000\n(3 rows)",
      "explanation": "The brackets make the OR run first. Without them, AND binds tighter, and the query would mean \"Mumbai employees (any salary) OR Pune employees earning more than 55000\", which would wrongly include Vikram (55000) from Mumbai."
    },
    {
      "title": "IN and BETWEEN",
      "scenario": "List Electronics and Furniture products priced between 1,000 and 15,000.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, category, price\nFROM products\nWHERE category IN ('Electronics', 'Furniture')\n  AND price BETWEEN 1000 AND 15000\nORDER BY price;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, category, price\nFROM products\nWHERE category IN ('Electronics', 'Furniture')\n  AND price BETWEEN 1000 AND 15000\nORDER BY price;"
      },
      "result": "name         | category    | price\n-------------+-------------+------\nKeyboard     | Electronics | 1500\nOffice Chair | Furniture   | 7000\nMonitor      | Electronics | 9000\nDesk         | Furniture   | 12000\n(4 rows)",
      "explanation": "IN replaces category = 'Electronics' OR category = 'Furniture'. BETWEEN includes both 1000 and 15000. The Mouse (500) and Laptop (55000) are outside the range."
    },
    {
      "title": "LIKE Patterns",
      "scenario": "Marketing wants employees whose first name starts with A or whose name contains \"sh\".",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name\nFROM employees\nWHERE name LIKE 'A%' OR name LIKE '%sh%';",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name\nFROM employees\nWHERE name LIKE 'A%' OR name LIKE '%sh%';"
      },
      "result": "name\n-----------\nAsha Rao\nPriya Shah\nArjun Nair\nMeera Joshi\n(4 rows)",
      "explanation": "'A%' matches names starting with A: Asha Rao and Arjun Nair. '%sh%' matches \"sh\" anywhere: Priya Shah and Meera Joshi (Asha also contains \"sh\" but is already in the result). LIKE is case-insensitive here, so \"Sh\" in Shah matches \"sh\". A row appears only once even if it matches both conditions."
    },
    {
      "title": "Finding Missing Data with IS NULL",
      "scenario": "Which employees have no email, and which have no department?",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, email, dept_id\nFROM employees\nWHERE email IS NULL OR dept_id IS NULL;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, email, dept_id\nFROM employees\nWHERE email IS NULL OR dept_id IS NULL;"
      },
      "result": "name        | email          | dept_id\n------------+----------------+--------\nKaran Patel | karan@corp.com | NULL\nMeera Joshi | NULL           | 1\n(2 rows)",
      "explanation": "Meera has no email and Karan has no department. Writing email = NULL would return zero rows because comparing with NULL is never true."
    },
    {
      "title": "DISTINCT and Top-N with ORDER BY + LIMIT",
      "scenario": "Show the unique cities where employees live, then the top 3 highest-paid employees.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT DISTINCT city FROM employees ORDER BY city;\nSELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT DISTINCT city FROM employees ORDER BY city;\nSELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;"
      },
      "result": "city\n---------\nBengaluru\nChennai\nDelhi\nMumbai\nPune\n(5 rows)\n\nname       | salary\n-----------+-------\nAsha Rao   | 95000\nPriya Shah | 85000\nSneha Iyer | 78000\n(3 rows)",
      "explanation": "DISTINCT collapses 9 rows into 5 unique cities. ORDER BY salary DESC sorts from highest to lowest and LIMIT 3 keeps the first three."
    },
    {
      "title": "Pagination with LIMIT and OFFSET, Multi-Column Sort",
      "scenario": "An admin page shows customers 3 at a time, sorted by city then name. Show page 2.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT customer_id, name, city\nFROM customers\nORDER BY city, name\nLIMIT 3 OFFSET 3;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT customer_id, name, city\nFROM customers\nORDER BY city, name\nLIMIT 3 OFFSET 3;"
      },
      "result": "customer_id | name        | city\n------------+-------------+----------\n5           | Ravi Teja   | Hyderabad\n1           | Amit Kumar  | Mumbai\n4           | Pooja Verma | Pune\n(3 rows)",
      "explanation": "Page size is 3, so page 2 skips the first 3 rows (OFFSET 3). Formula: OFFSET = (page - 1) * page_size. In MySQL you can also write LIMIT 3, 3."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between WHERE and HAVING?",
      "a": "WHERE filters individual rows before grouping; HAVING filters groups after GROUP BY and can use aggregate functions. (Covered fully on Day 5.)",
      "level": "Medium"
    },
    {
      "q": "Is BETWEEN inclusive?",
      "a": "Yes. BETWEEN 10 AND 20 includes 10 and 20. For dates with time (DATETIME), BETWEEN '2024-01-01' AND '2024-01-31' misses times after midnight on the 31st, so prefer >= start AND < next_day.",
      "level": "Medium"
    },
    {
      "q": "What do % and _ mean in LIKE?",
      "a": "% matches zero or more characters, _ matches exactly one character. To search for a literal % use an escape: LIKE '%50\\%%' or LIKE '%50!%%' ESCAPE '!'.",
      "level": "Easy"
    },
    {
      "q": "Why does WHERE col = NULL return nothing?",
      "a": "Any comparison with NULL gives UNKNOWN, and WHERE only keeps rows where the condition is TRUE. Use IS NULL.",
      "level": "Easy"
    },
    {
      "q": "What is the output of: SELECT * FROM employees WHERE dept_id NOT IN (1, NULL);",
      "a": "No rows. NOT IN expands to dept_id <> 1 AND dept_id <> NULL; the second part is always UNKNOWN, so the whole condition is never TRUE.",
      "level": "Hard"
    },
    {
      "q": "How do you fetch the 2nd page of 10 rows?",
      "a": "ORDER BY some_column LIMIT 10 OFFSET 10 (or LIMIT 10, 10 in MySQL). Always ORDER BY when paginating, otherwise the order is not guaranteed.",
      "level": "Medium"
    },
    {
      "q": "Difference between DISTINCT and GROUP BY?",
      "a": "Both can remove duplicates. DISTINCT just removes duplicate result rows. GROUP BY creates groups so you can apply aggregates like COUNT or SUM per group.",
      "level": "Medium"
    },
    {
      "q": "What is the default sort order of ORDER BY?",
      "a": "ASC (ascending). NULL values come first in ascending order in MySQL.",
      "level": "Easy"
    },
    {
      "q": "Can you ORDER BY a column that is not in the SELECT list?",
      "a": "Yes, unless you use DISTINCT (then MySQL and standard SQL require it in the select list).",
      "level": "Medium"
    },
    {
      "q": "How do you find the 3rd highest salary?",
      "a": "SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2; DISTINCT handles ties. Window functions (DENSE_RANK) are another way (Day 14).",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "List products with stock less than 20 or price above 10,000.",
      "hint": "Use OR.",
      "solution": "SELECT name, price, stock FROM products WHERE stock < 20 OR price > 10000;"
    },
    {
      "task": "Show orders placed in February 2024 sorted by amount (highest first).",
      "hint": "BETWEEN '2024-02-01' AND '2024-02-29' and ORDER BY amount DESC.",
      "solution": "SELECT order_id, order_date, amount FROM orders\nWHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'\nORDER BY amount DESC;"
    },
    {
      "task": "Find customers whose name ends with \"a\" or who do not have an email.",
      "hint": "LIKE '%a' and IS NULL.",
      "solution": "SELECT name, email FROM customers WHERE name LIKE '%a' OR email IS NULL;"
    },
    {
      "task": "Show the distinct product categories in alphabetical order.",
      "hint": "SELECT DISTINCT ... ORDER BY",
      "solution": "SELECT DISTINCT category FROM products ORDER BY category;"
    },
    {
      "task": "Find the 2 cheapest products that are in stock.",
      "hint": "WHERE stock > 0 ORDER BY price LIMIT 2",
      "solution": "SELECT name, price FROM products WHERE stock > 0 ORDER BY price LIMIT 2;"
    }
  ],
  "quiz": [
    {
      "question": "Which pattern matches names with 'a' as the SECOND letter?",
      "options": [
        "'a%'",
        "'%a'",
        "'_a%'",
        "'%a%'"
      ],
      "answer": 2,
      "explanation": "_ matches exactly one character, then a."
    },
    {
      "question": "salary BETWEEN 50000 AND 60000 includes which value?",
      "options": [
        "49999",
        "60000",
        "60001",
        "None of them"
      ],
      "answer": 1,
      "explanation": "BETWEEN includes both boundary values."
    },
    {
      "question": "Which keyword removes duplicate rows from the result?",
      "options": [
        "UNIQUE",
        "DISTINCT",
        "DIFFERENT",
        "SINGLE"
      ],
      "answer": 1,
      "explanation": "SELECT DISTINCT removes duplicates."
    },
    {
      "question": "In WHERE a OR b AND c, which is evaluated first?",
      "options": [
        "b AND c",
        "a OR b",
        "Left to right",
        "Random"
      ],
      "answer": 0,
      "explanation": "AND has higher precedence than OR."
    },
    {
      "question": "LIMIT 5 OFFSET 10 returns which rows?",
      "options": [
        "Rows 1-5",
        "Rows 10-15",
        "Rows 5-10",
        "Rows 11-15"
      ],
      "answer": 3,
      "explanation": "Skip 10 rows, then return 5: rows 11 to 15."
    }
  ]
};
