export default {
  "id": "day-06-joins",
  "title": "Joins: INNER, LEFT, RIGHT, FULL (via UNION), SELF, CROSS",
  "module": "Module 2: Joins & Functions",
  "day": 6,
  "level": "Intermediate",
  "duration": "3 hours",
  "summary": "Combine rows from two or more tables using INNER, LEFT, RIGHT, FULL OUTER (emulated with UNION in MySQL), SELF and CROSS joins, and find unmatched rows.",
  "objectives": [
    "Explain why joins are needed in a normalised database",
    "Write INNER, LEFT and RIGHT joins and predict the number of rows",
    "Emulate FULL OUTER JOIN in MySQL using LEFT JOIN UNION RIGHT JOIN",
    "Use a SELF JOIN for employee-manager hierarchies and CROSS JOIN for combinations",
    "Join three tables and find rows with no match (anti-join)"
  ],
  "theory": [
    {
      "heading": "Why Do We Need Joins?",
      "content": "In a good database each fact is stored once: employee details in employees, department names in departments. To answer \"Which department does Asha work in?\" we must combine the two tables. A JOIN matches rows from two tables using a condition, usually foreign key = primary key. Analogy: your contact list has names and phone numbers; your call log has phone numbers and call times. Matching them by phone number shows WHO called.",
      "syntax": "SELECT columns\nFROM table_a a\nJOIN table_b b ON a.key = b.key;",
      "points": [
        "Use table aliases (e, d) to keep queries short",
        "Prefix columns with the alias when both tables have the same column name (dept_id)",
        "The ON clause is the matching rule"
      ]
    },
    {
      "heading": "INNER JOIN",
      "content": "Returns only rows that have a match in BOTH tables. Rows without a partner disappear. In a Venn diagram it is the overlap. JOIN alone means INNER JOIN.",
      "points": [
        "Karan (no department) is NOT shown",
        "Marketing (no employees) is NOT shown",
        "Old comma syntax FROM a, b WHERE a.id = b.id is an inner join too, but explicit JOIN ... ON is clearer"
      ]
    },
    {
      "heading": "LEFT JOIN and RIGHT JOIN",
      "content": "LEFT JOIN returns ALL rows from the left table plus matching rows from the right; where there is no match, right-side columns are NULL. RIGHT JOIN is the mirror image. Most developers use LEFT JOIN only and just swap the table order. LEFT JOIN + WHERE right.key IS NULL finds rows with no match, for example customers who never ordered (called an anti-join).",
      "syntax": "SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;   -- customers with no orders",
      "tip": "Put conditions on the right-hand table in the ON clause, not in WHERE, if you want to keep unmatched left rows. A WHERE on the right table silently turns a LEFT JOIN into an INNER JOIN."
    },
    {
      "heading": "FULL OUTER JOIN via UNION",
      "content": "A FULL OUTER JOIN returns all rows from both tables, matched where possible and NULL elsewhere. MySQL does NOT support FULL OUTER JOIN, so we emulate it by combining a LEFT JOIN and a RIGHT JOIN with UNION (which also removes the duplicate matched rows). SQLite 3.39+ and PostgreSQL support FULL OUTER JOIN directly.",
      "syntax": "SELECT e.name, d.dept_name FROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id\nUNION\nSELECT e.name, d.dept_name FROM employees e RIGHT JOIN departments d ON e.dept_id = d.dept_id;"
    },
    {
      "heading": "SELF JOIN and CROSS JOIN",
      "content": "A SELF JOIN joins a table to itself using two different aliases. Classic example: employees.manager_id points to another row in the same employees table. A CROSS JOIN returns every combination of rows (the Cartesian product): 3 sizes x 4 colours = 12 T-shirt variants. Be careful: 10,000 x 10,000 rows = 100 million rows.",
      "syntax": "-- self join\nSELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id;\n-- cross join\nSELECT s.size, c.colour FROM sizes s CROSS JOIN colours c;"
    },
    {
      "heading": "Joining Three or More Tables",
      "content": "Just keep adding JOIN ... ON. Each join adds one table. For an order report: orders -> customers (who) and orders -> products (what).",
      "syntax": "SELECT o.order_id, c.name AS customer, p.name AS product, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products  p ON o.product_id  = p.product_id;",
      "points": [
        "Number of rows in INNER JOIN <= rows in the bigger side (for 1-to-many joins it equals the \"many\" side)",
        "Joining on columns with indexes makes joins fast (Day 10)",
        "USING (dept_id) is a short form when the column name is the same in both tables"
      ]
    }
  ],
  "examples": [
    {
      "title": "INNER JOIN: Employees with Department Names",
      "scenario": "HR wants each employee's name next to the department name instead of dept_id.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT e.name, d.dept_name, d.location\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.dept_id\nORDER BY d.dept_name, e.name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT e.name, d.dept_name, d.location\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.dept_id\nORDER BY d.dept_name, e.name;"
      },
      "result": "name         | dept_name | location\n-------------+-----------+----------\nSneha Iyer   | Finance   | Mumbai\nNeha Gupta   | HR        | Pune\nArjun Nair   | IT        | Bengaluru\nAsha Rao     | IT        | Bengaluru\nRahul Mehta  | IT        | Bengaluru\nMeera Joshi  | Sales     | Mumbai\nPriya Shah   | Sales     | Mumbai\nVikram Singh | Sales     | Mumbai\n(8 rows)",
      "explanation": "Only matching rows appear: 8 employees. Karan (dept_id NULL) is missing because NULL never matches, and Marketing is missing because nobody works there."
    },
    {
      "title": "LEFT JOIN: Keep All Departments",
      "scenario": "Show every department with its employee count, including departments with no staff.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT d.dept_name, COUNT(e.emp_id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.dept_id\nGROUP BY d.dept_name\nORDER BY headcount DESC, d.dept_name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT d.dept_name, COUNT(e.emp_id) AS headcount\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.dept_id\nGROUP BY d.dept_name\nORDER BY headcount DESC, d.dept_name;"
      },
      "result": "dept_name | headcount\n----------+----------\nIT        | 3\nSales     | 3\nFinance   | 1\nHR        | 1\nMarketing | 0\n(5 rows)",
      "explanation": "Marketing appears with 0. We count e.emp_id, not *, because for Marketing the LEFT JOIN produces one row with NULL employee columns; COUNT(*) would wrongly say 1."
    },
    {
      "title": "Anti-Join: Customers Who Never Ordered",
      "scenario": "The marketing team wants to email customers who signed up but never placed an order.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT c.customer_id, c.name, c.city\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT c.customer_id, c.name, c.city\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;"
      },
      "result": "customer_id | name      | city\n------------+-----------+----------\n5           | Ravi Teja | Hyderabad\n(1 row)",
      "explanation": "LEFT JOIN keeps every customer. Customers without orders get NULL in all order columns, and WHERE o.order_id IS NULL keeps only those. Ravi Teja is the only one."
    },
    {
      "title": "RIGHT JOIN and FULL OUTER JOIN via UNION",
      "scenario": "Audit report: list every employee and every department, matched where possible, so both \"no department\" employees and \"no employee\" departments are visible.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT e.name, d.dept_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id\nUNION\nSELECT e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d ON e.dept_id = d.dept_id\nORDER BY dept_name, name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT e.name, d.dept_name\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.dept_id\nUNION\nSELECT e.name, d.dept_name\nFROM employees e\nRIGHT JOIN departments d ON e.dept_id = d.dept_id\nORDER BY dept_name, name;"
      },
      "result": "name         | dept_name\n-------------+----------\nKaran Patel  | NULL\nSneha Iyer   | Finance\nNeha Gupta   | HR\nArjun Nair   | IT\nAsha Rao     | IT\nRahul Mehta  | IT\nNULL         | Marketing\nMeera Joshi  | Sales\nPriya Shah   | Sales\nVikram Singh | Sales\n(10 rows)",
      "explanation": "The LEFT part brings Karan with NULL department; the RIGHT part brings Marketing with NULL name; UNION removes the duplicated matched rows. This is exactly how MySQL users write a FULL OUTER JOIN. (The SQL Lab's SQLite 3.45 supports RIGHT JOIN, so the same query runs there.)"
    },
    {
      "title": "SELF JOIN: Employee and Manager",
      "scenario": "Print each employee with their manager's name; top managers should show \"No manager\".",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT e.name AS employee,\n       COALESCE(m.name, 'No manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id\nORDER BY e.emp_id;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT e.name AS employee,\n       COALESCE(m.name, 'No manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.emp_id\nORDER BY e.emp_id;"
      },
      "result": "employee     | manager\n-------------+-----------\nAsha Rao     | No manager\nRahul Mehta  | Asha Rao\nPriya Shah   | No manager\nVikram Singh | Priya Shah\nNeha Gupta   | No manager\nArjun Nair   | Asha Rao\nSneha Iyer   | No manager\nKaran Patel  | Priya Shah\nMeera Joshi  | Priya Shah\n(9 rows)",
      "explanation": "The same table is used twice: e for the employee, m for the manager. e.manager_id is matched to m.emp_id. A LEFT JOIN keeps the top managers whose manager_id is NULL, and COALESCE replaces NULL with a friendly text."
    },
    {
      "title": "Three-Table Join and CROSS JOIN",
      "scenario": "Build a detailed delivered-orders report, then generate every Furniture x city combination for a pricing sheet.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT o.order_id, c.name AS customer, p.name AS product, o.quantity, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products  p ON o.product_id  = p.product_id\nWHERE o.status = 'Delivered'\nORDER BY o.order_id;\nSELECT p.name AS product, d.location AS city\nFROM products p\nCROSS JOIN (SELECT DISTINCT location FROM departments) d\nWHERE p.category = 'Furniture'\nORDER BY p.name, d.location;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT o.order_id, c.name AS customer, p.name AS product, o.quantity, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products  p ON o.product_id  = p.product_id\nWHERE o.status = 'Delivered'\nORDER BY o.order_id;\nSELECT p.name AS product, d.location AS city\nFROM products p\nCROSS JOIN (SELECT DISTINCT location FROM departments) d\nWHERE p.category = 'Furniture'\nORDER BY p.name, d.location;"
      },
      "result": "order_id | customer    | product  | quantity | amount\n---------+-------------+----------+----------+-------\n1        | Amit Kumar  | Laptop   | 1        | 55000\n2        | Amit Kumar  | Mouse    | 2        | 1000\n4        | John Dsouza | Notebook | 10       | 500\n6        | Sara Khan   | Keyboard | 1        | 1500\n8        | Amit Kumar  | Pen      | 20       | 400\n10       | Divya Menon | Laptop   | 2        | 110000\n(6 rows)\n\nproduct      | city\n-------------+----------\nDesk         | Bengaluru\nDesk         | Delhi\nDesk         | Mumbai\nDesk         | Pune\nOffice Chair | Bengaluru\nOffice Chair | Delhi\nOffice Chair | Mumbai\nOffice Chair | Pune\n(8 rows)",
      "explanation": "The first query joins orders to two parent tables to replace ids with names. The second uses CROSS JOIN: 2 furniture products x 4 distinct office cities = 8 rows, with no ON condition."
    }
  ],
  "interview": [
    {
      "q": "What is a join? Name the types.",
      "a": "A join combines rows from two or more tables based on a related column. Types: INNER, LEFT (OUTER), RIGHT (OUTER), FULL (OUTER), SELF, CROSS (and NATURAL).",
      "level": "Easy"
    },
    {
      "q": "Difference between INNER JOIN and LEFT JOIN?",
      "a": "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right, with NULLs where there is no match.",
      "level": "Easy"
    },
    {
      "q": "Does MySQL support FULL OUTER JOIN? How do you get one?",
      "a": "No. Use SELECT ... LEFT JOIN ... UNION SELECT ... RIGHT JOIN .... UNION removes duplicates of the matched rows.",
      "level": "Medium"
    },
    {
      "q": "What is a self join? Give a use case.",
      "a": "Joining a table to itself with two aliases. Use cases: employee-manager hierarchy, finding pairs of customers in the same city, comparing rows of the same table.",
      "level": "Medium"
    },
    {
      "q": "What is a CROSS JOIN? How many rows does it return?",
      "a": "A Cartesian product of both tables: rows(A) x rows(B). Used to generate combinations like sizes x colours or dates x products.",
      "level": "Easy"
    },
    {
      "q": "How do you find records in table A that are not in table B?",
      "a": "LEFT JOIN B ON ... WHERE B.key IS NULL, or WHERE NOT EXISTS (SELECT 1 FROM B WHERE ...), or NOT IN (careful with NULLs).",
      "level": "Medium"
    },
    {
      "q": "Table A has 5 rows and B has 3 rows, every A row matches exactly 1 B row. How many rows for INNER, LEFT and CROSS join?",
      "a": "INNER = 5, LEFT = 5, CROSS = 15.",
      "level": "Medium"
    },
    {
      "q": "Table A has ids (1,1,2) and table B has ids (1,1,3). How many rows does A INNER JOIN B ON A.id = B.id return?",
      "a": "4. Each of the two 1s in A matches each of the two 1s in B (2 x 2); 2 and 3 have no match. Duplicates multiply in joins.",
      "level": "Hard"
    },
    {
      "q": "Why does a WHERE condition on the right table turn a LEFT JOIN into an INNER JOIN?",
      "a": "Unmatched rows have NULL in right-table columns, and WHERE right.col = 'x' is never true for NULL, so they are removed. Move the condition into the ON clause to keep them.",
      "level": "Hard"
    },
    {
      "q": "Difference between ON and USING?",
      "a": "ON allows any condition (a.x = b.y AND ...). USING(col) is shorthand when both tables have a column with the same name, and it returns that column only once.",
      "level": "Medium"
    },
    {
      "q": "What is a NATURAL JOIN and why is it risky?",
      "a": "It joins automatically on all columns with the same name. If someone later adds a column with a common name (like created_at), the join changes silently. Avoid it in production.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "List each order id with the customer name and city.",
      "hint": "JOIN orders with customers on customer_id.",
      "solution": "SELECT o.order_id, c.name, c.city\nFROM orders o JOIN customers c ON o.customer_id = c.customer_id;"
    },
    {
      "task": "Show products that have never been ordered.",
      "hint": "LEFT JOIN products to orders and check IS NULL.",
      "solution": "SELECT p.name\nFROM products p LEFT JOIN orders o ON p.product_id = o.product_id\nWHERE o.order_id IS NULL;"
    },
    {
      "task": "Show total revenue per product category (non-cancelled orders).",
      "hint": "JOIN orders with products, GROUP BY category.",
      "solution": "SELECT p.category, SUM(o.amount) AS revenue\nFROM orders o JOIN products p ON o.product_id = p.product_id\nWHERE o.status <> 'Cancelled'\nGROUP BY p.category ORDER BY revenue DESC;"
    },
    {
      "task": "Find employees who earn more than their manager.",
      "hint": "Self join e to m on e.manager_id = m.emp_id and compare salaries.",
      "solution": "SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary\nFROM employees e JOIN employees m ON e.manager_id = m.emp_id\nWHERE e.salary > m.salary;"
    },
    {
      "task": "For each manager, count how many people report to them.",
      "hint": "Self join and GROUP BY manager.",
      "solution": "SELECT m.name AS manager, COUNT(e.emp_id) AS reports\nFROM employees m JOIN employees e ON e.manager_id = m.emp_id\nGROUP BY m.name;"
    }
  ],
  "quiz": [
    {
      "question": "Which join returns only matching rows?",
      "options": [
        "LEFT JOIN",
        "INNER JOIN",
        "CROSS JOIN",
        "FULL JOIN"
      ],
      "answer": 1,
      "explanation": "INNER JOIN keeps only matches."
    },
    {
      "question": "How is FULL OUTER JOIN written in MySQL?",
      "options": [
        "FULL JOIN",
        "OUTER JOIN",
        "LEFT JOIN UNION RIGHT JOIN",
        "It is impossible"
      ],
      "answer": 2,
      "explanation": "MySQL lacks FULL JOIN; combine LEFT and RIGHT with UNION."
    },
    {
      "question": "A CROSS JOIN between 4 rows and 6 rows gives:",
      "options": [
        "10 rows",
        "6 rows",
        "4 rows",
        "24 rows"
      ],
      "answer": 3,
      "explanation": "Cartesian product = 4 x 6."
    },
    {
      "question": "To list employees with their managers from one table you use a:",
      "options": [
        "SELF JOIN",
        "CROSS JOIN",
        "NATURAL JOIN",
        "UNION"
      ],
      "answer": 0,
      "explanation": "The table is joined to itself with two aliases."
    },
    {
      "question": "Which query finds customers with no orders?",
      "options": [
        "INNER JOIN ... WHERE o.id IS NULL",
        "LEFT JOIN orders o ... WHERE o.order_id IS NULL",
        "CROSS JOIN orders",
        "RIGHT JOIN ... WHERE c.id IS NULL"
      ],
      "answer": 1,
      "explanation": "LEFT JOIN keeps all customers; NULL order id means no match."
    }
  ]
};
