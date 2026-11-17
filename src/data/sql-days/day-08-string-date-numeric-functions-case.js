export default {
  "id": "day-08-string-date-numeric-functions-case",
  "title": "String, Date and Numeric Functions, CASE",
  "module": "Module 2: Joins & Functions",
  "day": 8,
  "level": "Intermediate",
  "duration": "2.5 hours",
  "summary": "Clean and format text, calculate with dates, round and compute numbers with built-in functions, and add if-else logic to queries with CASE.",
  "objectives": [
    "Use MySQL string functions: CONCAT, UPPER, LOWER, LENGTH, SUBSTRING, TRIM, REPLACE, LEFT, RIGHT, INSTR",
    "Use date functions: NOW, CURDATE, YEAR, MONTH, DATEDIFF, DATE_ADD, DATE_FORMAT",
    "Use numeric functions: ROUND, CEIL, FLOOR, ABS, MOD, POWER",
    "Write simple and searched CASE expressions, including CASE inside aggregates",
    "Know the SQLite equivalents used in the SQL Lab"
  ],
  "theory": [
    {
      "heading": "Why Functions?",
      "content": "Data is rarely stored exactly how a report wants it. Names may have extra spaces, dates need to be shown as \"Mar 2024\", prices need rounding. Built-in functions transform values on the fly without changing the table. Think of them as Excel formulas (UPPER, LEFT, ROUND, TODAY) inside SQL.",
      "points": [
        "Single-row (scalar) functions: work on each row (UPPER, ROUND, YEAR)",
        "Aggregate functions: work on many rows (SUM, AVG) - Day 5",
        "Functions can be nested: UPPER(TRIM(name))",
        "Functions on a column in WHERE can stop MySQL from using an index (Day 10)"
      ]
    },
    {
      "heading": "String Functions (MySQL vs SQLite)",
      "content": "Text functions clean, cut and combine strings. Positions in SQL start at 1, not 0.",
      "points": [
        "CONCAT('a','b') -> 'ab'; CONCAT_WS('-', a, b) joins with a separator. SQLite: 'a' || 'b' (and concat() from 3.44)",
        "UPPER(s), LOWER(s) - same in both",
        "LENGTH(s) bytes; CHAR_LENGTH(s) characters (MySQL). SQLite LENGTH counts characters",
        "SUBSTRING(s, start, len) / SUBSTR - same in both",
        "LEFT(s, n), RIGHT(s, n) - MySQL only; SQLite: substr(s, 1, n), substr(s, -n)",
        "TRIM(s), LTRIM, RTRIM - same; REPLACE(s, from, to) - same",
        "INSTR(s, sub) position of sub (0 if not found) - same; LOCATE(sub, s) in MySQL",
        "LPAD('7', 3, '0') -> '007' and REVERSE(s) - MySQL only"
      ]
    },
    {
      "heading": "Date and Time Functions (MySQL vs SQLite)",
      "content": "Dates power most business reports: monthly sales, tenure, overdue invoices. MySQL has DATE/DATETIME types with many functions. SQLite stores dates as text 'YYYY-MM-DD' and uses date(), strftime() and julianday().",
      "points": [
        "Now: NOW(), CURDATE(), CURTIME() | SQLite: datetime('now'), date('now')",
        "Parts: YEAR(d), MONTH(d), DAY(d), DAYNAME(d), MONTHNAME(d) | SQLite: strftime('%Y', d), strftime('%m', d)",
        "Difference: DATEDIFF(d1, d2) in days, TIMESTAMPDIFF(YEAR, d1, d2) | SQLite: julianday(d1) - julianday(d2)",
        "Add: DATE_ADD(d, INTERVAL 30 DAY), DATE_SUB(...) | SQLite: date(d, '+30 days')",
        "Format: DATE_FORMAT(d, '%d-%b-%Y') -> 15-Mar-2018 | SQLite: strftime('%d-%m-%Y', d)",
        "LAST_DAY(d) end of month (MySQL); SQLite: date(d, 'start of month', '+1 month', '-1 day')"
      ]
    },
    {
      "heading": "Numeric Functions",
      "content": "Numeric functions round money, compute percentages and handle signs.",
      "points": [
        "ROUND(x, d): round to d decimals (ROUND(67222.222, 2) = 67222.22)",
        "CEIL(x) / CEILING(x): round up; FLOOR(x): round down",
        "ABS(x): absolute value; MOD(a, b) or a % b: remainder",
        "POWER(x, y), SQRT(x), TRUNCATE(x, d) (MySQL)",
        "Integer division: 7 DIV 2 = 3 in MySQL; in SQLite 7 / 2 = 3 when both are integers, so use 7 / 2.0 for 3.5",
        "CAST(x AS SIGNED / DECIMAL(10,2) / CHAR) converts types (SQLite: CAST(x AS INTEGER / REAL / TEXT))"
      ]
    },
    {
      "heading": "CASE: If-Else Inside SQL",
      "content": "CASE returns a value based on conditions, like IF in Excel. The searched form tests any condition; the simple form compares one expression with values. The first true WHEN wins; ELSE is used when nothing matches (NULL if ELSE is missing). CASE works in SELECT, WHERE, ORDER BY, GROUP BY and inside aggregates.",
      "syntax": "-- searched CASE\nCASE\n  WHEN salary >= 80000 THEN 'High'\n  WHEN salary >= 60000 THEN 'Medium'\n  ELSE 'Low'\nEND\n-- simple CASE\nCASE status WHEN 'Delivered' THEN 'Done' WHEN 'Pending' THEN 'Waiting' ELSE 'Other' END",
      "tip": "MySQL also has IF(cond, a, b) and IFNULL(x, y). CASE and COALESCE are standard SQL and work everywhere, including SQLite."
    }
  ],
  "examples": [
    {
      "title": "Formatting Names and Emails",
      "scenario": "Generate a staff directory: uppercase name, first name only, email user name and the name length.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSELECT UPPER(name)                              AS upper_name,\n       SUBSTRING_INDEX(name, ' ', 1)            AS first_name,\n       LEFT(email, INSTR(email, '@') - 1)       AS email_user,\n       CHAR_LENGTH(name)                        AS name_len,\n       CONCAT(name, ' (', city, ')')            AS label\nFROM employees\nWHERE email IS NOT NULL\nLIMIT 4;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT UPPER(name)                                  AS upper_name,\n       substr(name, 1, instr(name, ' ') - 1)        AS first_name,\n       substr(email, 1, instr(email, '@') - 1)      AS email_user,\n       length(name)                                 AS name_len,\n       name || ' (' || city || ')'                  AS label\nFROM employees\nWHERE email IS NOT NULL\nLIMIT 4;"
      },
      "result": "upper_name   | first_name | email_user | name_len | label\n-------------+------------+------------+----------+------------------------\nASHA RAO     | Asha       | asha       | 8        | Asha Rao (Bengaluru)\nRAHUL MEHTA  | Rahul      | rahul      | 11       | Rahul Mehta (Bengaluru)\nPRIYA SHAH   | Priya      | priya      | 10       | Priya Shah (Mumbai)\nVIKRAM SINGH | Vikram     | vikram     | 12       | Vikram Singh (Mumbai)\n(4 rows)",
      "explanation": "INSTR finds the position of the space or @, and SUBSTR cuts the text before it. MySQL offers handy shortcuts (SUBSTRING_INDEX, LEFT, CONCAT); SQLite uses substr/instr and the || operator. The logic is the same."
    },
    {
      "title": "Cleaning Dirty Text with TRIM and REPLACE",
      "scenario": "Imported product codes have extra spaces and mixed separators. Clean them.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT id,\n       CONCAT('[', code, ']')                   AS original,\n       UPPER(REPLACE(TRIM(code), '_', '-'))     AS clean_code\nFROM raw_codes;",
      "sql": {
        "setup": "CREATE TABLE raw_codes (id INTEGER, code TEXT);\nINSERT INTO raw_codes VALUES (1, '  lap-001 '), (2, 'MOU_002'), (3, ' key-003');",
        "query": "SELECT id,\n       '[' || code || ']'                          AS original,\n       UPPER(REPLACE(TRIM(code), '_', '-'))        AS clean_code\nFROM raw_codes;"
      },
      "result": "id | original     | clean_code\n---+--------------+-----------\n1  | [  lap-001 ] | LAP-001\n2  | [MOU_002]    | MOU-002\n3  | [ key-003]   | KEY-003\n(3 rows)",
      "explanation": "TRIM removes leading and trailing spaces, REPLACE swaps _ for -, and UPPER standardises case. Functions are applied inside-out. The square brackets in \"original\" make the hidden spaces visible."
    },
    {
      "title": "Date Calculations: Tenure and Probation End",
      "scenario": "For each employee show the hire year, the hire month name, days worked until 2024-12-31 and the date their 90-day probation ended.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSELECT name,\n       YEAR(hire_date)                          AS hire_year,\n       DATE_FORMAT(hire_date, '%b %Y')          AS hired,\n       DATEDIFF('2024-12-31', hire_date)        AS days_worked,\n       DATE_ADD(hire_date, INTERVAL 90 DAY)     AS probation_end,\n       TIMESTAMPDIFF(YEAR, hire_date, '2024-12-31') AS years\nFROM employees\nORDER BY hire_date\nLIMIT 4;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name,\n       CAST(strftime('%Y', hire_date) AS INTEGER)                     AS hire_year,\n       strftime('%m/%Y', hire_date)                                   AS hired,\n       CAST(julianday('2024-12-31') - julianday(hire_date) AS INTEGER) AS days_worked,\n       date(hire_date, '+90 days')                                    AS probation_end\nFROM employees\nORDER BY hire_date\nLIMIT 4;"
      },
      "result": "name       | hire_year | hired   | days_worked | probation_end\n-----------+-----------+---------+-------------+--------------\nNeha Gupta | 2017      | 05/2017 | 2777        | 2017-08-23\nAsha Rao   | 2018      | 03/2018 | 2483        | 2018-06-13\nPriya Shah | 2019      | 01/2019 | 2182        | 2019-04-10\nSneha Iyer | 2019      | 09/2019 | 1919        | 2019-12-29\n(4 rows)",
      "explanation": "We use a fixed date (2024-12-31) instead of CURDATE() so the output is repeatable. julianday() turns a date into a day number, so subtracting gives the day difference, exactly like DATEDIFF in MySQL. date(d, '+90 days') is SQLite's DATE_ADD."
    },
    {
      "title": "Numeric Functions: Rounding, Tax and Remainders",
      "scenario": "Show each product price with 18% GST, rounded, plus the number of full boxes of 12 and leftover units in stock.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSELECT name, price,\n       ROUND(price * 1.18, 2)  AS price_with_gst,\n       stock DIV 12            AS full_boxes,\n       MOD(stock, 12)          AS leftover,\n       ABS(stock - 100)        AS diff_from_100,\n       CEIL(price / 1000)      AS price_in_thousands_up\nFROM products\nORDER BY price DESC\nLIMIT 5;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, price,\n       ROUND(price * 1.18, 2)  AS price_with_gst,\n       stock / 12              AS full_boxes,\n       stock % 12              AS leftover,\n       ABS(stock - 100)        AS diff_from_100\nFROM products\nORDER BY price DESC\nLIMIT 5;"
      },
      "result": "name         | price | price_with_gst | full_boxes | leftover | diff_from_100\n-------------+-------+----------------+------------+----------+--------------\nLaptop       | 55000 | 64900.0        | 0          | 10       | 90\nDesk         | 12000 | 14160.0        | 0          | 8        | 92\nMonitor      | 9000  | 10620.0        | 0          | 0        | 100\nOffice Chair | 7000  | 8260.0         | 2          | 1        | 75\nKeyboard     | 1500  | 1770.0         | 12         | 6        | 50\n(5 rows)",
      "explanation": "In SQLite, integer / integer gives a whole number (10 / 12 = 0), which acts like MySQL's DIV. % gives the remainder like MOD. ROUND keeps 2 decimals for currency. CEIL/FLOOR are shown in the MySQL code."
    },
    {
      "title": "CASE: Salary Bands with a Custom Sort Order",
      "scenario": "Classify employees into salary bands and sort them so that High comes first.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, salary,\n       CASE\n         WHEN salary >= 80000 THEN 'High'\n         WHEN salary >= 60000 THEN 'Medium'\n         ELSE 'Low'\n       END AS band\nFROM employees\nORDER BY CASE WHEN salary >= 80000 THEN 1 WHEN salary >= 60000 THEN 2 ELSE 3 END, name;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, salary,\n       CASE\n         WHEN salary >= 80000 THEN 'High'\n         WHEN salary >= 60000 THEN 'Medium'\n         ELSE 'Low'\n       END AS band\nFROM employees\nORDER BY CASE WHEN salary >= 80000 THEN 1 WHEN salary >= 60000 THEN 2 ELSE 3 END, name;"
      },
      "result": "name         | salary | band\n-------------+--------+-------\nAsha Rao     | 95000  | High\nPriya Shah   | 85000  | High\nArjun Nair   | 68000  | Medium\nNeha Gupta   | 60000  | Medium\nRahul Mehta  | 72000  | Medium\nSneha Iyer   | 78000  | Medium\nKaran Patel  | 40000  | Low\nMeera Joshi  | 52000  | Low\nVikram Singh | 55000  | Low\n(9 rows)",
      "explanation": "The searched CASE checks conditions top to bottom; the first true WHEN decides. 68000 fails >= 80000 but passes >= 60000, so it is Medium. CASE in ORDER BY creates a custom sort order."
    },
    {
      "title": "CASE Inside Aggregates (Pivot Report)",
      "scenario": "Show, for each customer, the number of delivered orders, the number of other orders and the delivered revenue in one row.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT c.name,\n       SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END)        AS delivered,\n       SUM(CASE WHEN o.status <> 'Delivered' THEN 1 ELSE 0 END)       AS not_delivered,\n       SUM(CASE WHEN o.status = 'Delivered' THEN o.amount ELSE 0 END) AS delivered_revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.name\nORDER BY delivered_revenue DESC;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT c.name,\n       SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END)        AS delivered,\n       SUM(CASE WHEN o.status <> 'Delivered' THEN 1 ELSE 0 END)       AS not_delivered,\n       SUM(CASE WHEN o.status = 'Delivered' THEN o.amount ELSE 0 END) AS delivered_revenue\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.name\nORDER BY delivered_revenue DESC;"
      },
      "result": "name        | delivered | not_delivered | delivered_revenue\n------------+-----------+---------------+------------------\nDivya Menon | 1         | 1             | 110000\nAmit Kumar  | 3         | 0             | 56400\nSara Khan   | 1         | 1             | 1500\nJohn Dsouza | 1         | 1             | 500\nPooja Verma | 0         | 1             | 0\n(5 rows)",
      "explanation": "This \"conditional aggregation\" turns status values into columns, like a pivot table in Excel. Each CASE returns 1/0 or the amount, and SUM adds them per customer."
    }
  ],
  "interview": [
    {
      "q": "Difference between LENGTH and CHAR_LENGTH in MySQL?",
      "a": "LENGTH returns bytes, CHAR_LENGTH returns characters. For multi-byte UTF-8 text like 'नमस्ते' they differ.",
      "level": "Medium"
    },
    {
      "q": "How do you concatenate strings in MySQL? What if one value is NULL?",
      "a": "CONCAT(a, b). If any argument is NULL, CONCAT returns NULL. CONCAT_WS skips NULLs. Use COALESCE(col, '') to be safe.",
      "level": "Medium"
    },
    {
      "q": "How do you get the difference between two dates in days and in years?",
      "a": "DATEDIFF(d1, d2) gives days; TIMESTAMPDIFF(YEAR, d1, d2) gives full years (also MONTH, HOUR, etc.).",
      "level": "Easy"
    },
    {
      "q": "Difference between NOW(), CURDATE() and SYSDATE()?",
      "a": "NOW() returns the date and time when the statement started; CURDATE() only the date; SYSDATE() returns the time at the moment it executes (can differ within one statement).",
      "level": "Hard"
    },
    {
      "q": "Difference between ROUND, CEIL, FLOOR and TRUNCATE?",
      "a": "ROUND(2.567, 2) = 2.57 (nearest). CEIL(2.1) = 3 (up). FLOOR(2.9) = 2 (down). TRUNCATE(2.567, 2) = 2.56 (cuts digits).",
      "level": "Easy"
    },
    {
      "q": "What is the output of SELECT ROUND(-2.5), CEIL(-2.5), FLOOR(-2.5); in MySQL?",
      "a": "-3, -2, -3. MySQL rounds half away from zero for exact numbers; CEIL goes up towards +infinity (-2) and FLOOR down (-3).",
      "level": "Hard"
    },
    {
      "q": "What is a CASE expression? Types?",
      "a": "Conditional logic inside SQL returning a value. Simple CASE compares one expression to values; searched CASE evaluates boolean conditions. Returns NULL if no WHEN matches and there is no ELSE.",
      "level": "Easy"
    },
    {
      "q": "Difference between IFNULL, COALESCE and NULLIF?",
      "a": "IFNULL(a, b) returns b if a is NULL (2 args, MySQL). COALESCE(a, b, c...) returns the first non-NULL (standard). NULLIF(a, b) returns NULL if a = b, else a; often used to avoid division by zero: x / NULLIF(y, 0).",
      "level": "Medium"
    },
    {
      "q": "How do you write a pivot in MySQL without a PIVOT keyword?",
      "a": "Conditional aggregation: SUM(CASE WHEN col = 'X' THEN value ELSE 0 END) AS x_total for each column, grouped by the row key.",
      "level": "Hard"
    },
    {
      "q": "Why should you avoid functions on indexed columns in WHERE?",
      "a": "WHERE YEAR(hire_date) = 2023 must compute YEAR for every row, so the index on hire_date cannot be used. Rewrite as hire_date >= '2023-01-01' AND hire_date < '2024-01-01'.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Show customer names in uppercase with the first 3 letters of their city.",
      "hint": "UPPER and SUBSTR(city, 1, 3) (LEFT(city, 3) in MySQL).",
      "solution": "SELECT UPPER(name) AS name, substr(city, 1, 3) AS city_code FROM customers;"
    },
    {
      "task": "List employees hired in 2023.",
      "hint": "Compare with a date range (or strftime('%Y', hire_date) = '2023').",
      "solution": "SELECT name, hire_date FROM employees WHERE hire_date >= '2023-01-01' AND hire_date < '2024-01-01';"
    },
    {
      "task": "Label products as \"Out of stock\" (0), \"Low\" (< 20) or \"OK\".",
      "hint": "Searched CASE on stock.",
      "solution": "SELECT name, stock,\n       CASE WHEN stock = 0 THEN 'Out of stock' WHEN stock < 20 THEN 'Low' ELSE 'OK' END AS stock_status\nFROM products;"
    },
    {
      "task": "Count orders per weekday name in MySQL.",
      "hint": "DAYNAME(order_date) and GROUP BY.",
      "solution": "SELECT DAYNAME(order_date) AS weekday, COUNT(*) AS orders\nFROM orders GROUP BY DAYNAME(order_date);"
    },
    {
      "task": "Show each employee's email domain, or \"missing\" if email is NULL.",
      "hint": "COALESCE with substr/instr.",
      "solution": "SELECT name, COALESCE(substr(email, instr(email, '@') + 1), 'missing') AS domain\nFROM employees;"
    }
  ],
  "quiz": [
    {
      "question": "SELECT SUBSTRING('DATABASE', 3, 4) returns:",
      "options": [
        "DATA",
        "TABA",
        "ATAB",
        "BASE"
      ],
      "answer": 1,
      "explanation": "Start at position 3 (T) and take 4 characters: TABA."
    },
    {
      "question": "What does CONCAT('A', NULL, 'B') return in MySQL?",
      "options": [
        "AB",
        "A B",
        "NULL",
        "Error"
      ],
      "answer": 2,
      "explanation": "Any NULL argument makes CONCAT return NULL."
    },
    {
      "question": "Which MySQL function adds 30 days to a date?",
      "options": [
        "DATE_ADD(d, INTERVAL 30 DAY)",
        "ADD_DAYS(d, 30)",
        "d + 30 DAYS",
        "DATEADD(30, d)"
      ],
      "answer": 0,
      "explanation": "DATE_ADD with an INTERVAL."
    },
    {
      "question": "FLOOR(7.9) returns:",
      "options": [
        "8",
        "7.9",
        "7.0 rounded up",
        "7"
      ],
      "answer": 3,
      "explanation": "FLOOR rounds down."
    },
    {
      "question": "If no WHEN matches and there is no ELSE, CASE returns:",
      "options": [
        "0",
        "''",
        "NULL",
        "Error"
      ],
      "answer": 2,
      "explanation": "Missing ELSE means NULL."
    }
  ]
};
