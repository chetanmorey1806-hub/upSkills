export default {
  "id": "day-13-stored-procedures-functions-triggers",
  "title": "Stored Procedures, Functions and Triggers",
  "module": "Module 3: Advanced SQL",
  "day": 13,
  "level": "Advanced",
  "duration": "3 hours",
  "summary": "Store reusable logic inside MySQL with stored procedures (IN, OUT, INOUT parameters, variables, IF, loops, error handlers), user-defined functions, and triggers that run automatically on INSERT, UPDATE and DELETE.",
  "objectives": [
    "Create and call stored procedures with IN, OUT and INOUT parameters using DELIMITER",
    "Use variables, IF/ELSEIF, CASE, WHILE loops and error handlers inside procedures",
    "Create deterministic stored functions and use them in SELECT",
    "Write BEFORE/AFTER triggers using NEW and OLD for validation and auditing",
    "Know the differences between procedures, functions and triggers, and their SQLite support"
  ],
  "theory": [
    {
      "heading": "What is a Stored Procedure?",
      "content": "A stored procedure is a named block of SQL statements saved inside the database server and executed with CALL. Think of it as a recipe card kept in the restaurant kitchen: the waiter just says \"make recipe 12\" instead of reading out every step. Procedures reduce network traffic, centralise business logic, and let you grant EXECUTE rights without giving direct table access.",
      "syntax": "DELIMITER $$\nCREATE PROCEDURE proc_name(IN p1 INT, OUT p2 DECIMAL(12,2))\nBEGIN\n  DECLARE v_total DECIMAL(12,2) DEFAULT 0;\n  SELECT SUM(salary) INTO v_total FROM employees WHERE dept_id = p1;\n  SET p2 = v_total;\nEND $$\nDELIMITER ;\n\nCALL proc_name(2, @result);\nSELECT @result;\nDROP PROCEDURE IF EXISTS proc_name;\nSHOW PROCEDURE STATUS WHERE Db = 'company_db';",
      "points": [
        "DELIMITER $$ changes the statement terminator so the ; inside BEGIN...END does not end the CREATE statement early",
        "IN: value passed in (default). OUT: value returned to the caller. INOUT: both",
        "DECLARE local variables at the start of BEGIN; @var are session (user) variables",
        "A procedure can return result sets (plain SELECTs) and can run INSERT/UPDATE/DELETE and transactions",
        "SQLite has NO stored procedures; application code (Python) plays that role"
      ]
    },
    {
      "heading": "Control Flow and Error Handling",
      "content": "Procedures support programming constructs.",
      "syntax": "IF v_total > 100000 THEN SET v_band = 'Large';\nELSEIF v_total > 50000 THEN SET v_band = 'Medium';\nELSE SET v_band = 'Small';\nEND IF;\n\nWHILE i <= 5 DO\n  SET i = i + 1;\nEND WHILE;\n\nDECLARE EXIT HANDLER FOR SQLEXCEPTION\nBEGIN\n  ROLLBACK;\n  SELECT 'Transfer failed' AS message;\nEND;\n\nSIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';",
      "points": [
        "Loops: WHILE ... END WHILE, REPEAT ... UNTIL ... END REPEAT, LOOP with LEAVE",
        "CURSORs iterate over a result set row by row (DECLARE cur CURSOR FOR SELECT ...; OPEN; FETCH; CLOSE)",
        "EXIT HANDLER stops the block; CONTINUE HANDLER keeps going",
        "SIGNAL raises a custom error"
      ]
    },
    {
      "heading": "Stored Functions",
      "content": "A stored function returns exactly ONE value and can be used inside SQL expressions, like a built-in function (UPPER, ROUND). Use it for reusable calculations such as tax, age or discount.",
      "syntax": "DELIMITER $$\nCREATE FUNCTION fn_annual_tax(p_salary DECIMAL(10,2))\nRETURNS DECIMAL(12,2)\nDETERMINISTIC\nBEGIN\n  DECLARE yearly DECIMAL(12,2);\n  SET yearly = p_salary * 12;\n  RETURN CASE\n           WHEN yearly <= 700000  THEN 0\n           WHEN yearly <= 1000000 THEN (yearly - 700000) * 0.10\n           ELSE 30000 + (yearly - 1000000) * 0.20\n         END;\nEND $$\nDELIMITER ;\nSELECT name, fn_annual_tax(salary) FROM employees;",
      "points": [
        "Must have RETURNS type and a RETURN statement",
        "DETERMINISTIC (same input -> same output), NO SQL or READS SQL DATA must be declared when binary logging is on",
        "Called inside SELECT/WHERE, not with CALL",
        "Cannot return a result set and should not modify tables"
      ]
    },
    {
      "heading": "Procedure vs Function (Interview Table)",
      "content": "This comparison is asked very often.",
      "points": [
        "Return: procedure returns 0..n values via OUT params and result sets; function returns exactly 1 value",
        "Call: CALL proc(); function used in SELECT fn(x)",
        "DML: procedures can INSERT/UPDATE/DELETE and manage transactions; functions should not (no COMMIT/ROLLBACK allowed)",
        "Usage in SQL: functions can appear in WHERE, SELECT, HAVING; procedures cannot",
        "Parameters: procedure has IN/OUT/INOUT; function parameters are IN only"
      ]
    },
    {
      "heading": "Triggers",
      "content": "A trigger is a block of SQL that the database runs AUTOMATICALLY when a row is inserted, updated or deleted. Like a doorbell: you do not call it; pressing the button (the event) rings it. Use triggers for audit logs, automatic stock updates and validations that must happen no matter which application changes the data.",
      "syntax": "DELIMITER $$\nCREATE TRIGGER trg_salary_audit\nAFTER UPDATE ON employees\nFOR EACH ROW\nBEGIN\n  IF OLD.salary <> NEW.salary THEN\n    INSERT INTO salary_audit(emp_id, old_salary, new_salary, changed_at)\n    VALUES (OLD.emp_id, OLD.salary, NEW.salary, NOW());\n  END IF;\nEND $$\nDELIMITER ;\nSHOW TRIGGERS;  DROP TRIGGER IF EXISTS trg_salary_audit;",
      "points": [
        "Timing: BEFORE or AFTER; Event: INSERT, UPDATE or DELETE -> 6 combinations",
        "NEW.col = the new value (INSERT, UPDATE); OLD.col = the old value (UPDATE, DELETE)",
        "BEFORE triggers can change NEW values (SET NEW.email = LOWER(NEW.email)) or reject the row with SIGNAL",
        "MySQL triggers are row-level only (FOR EACH ROW); no statement-level triggers",
        "Drawbacks: hidden logic, harder debugging, slower bulk writes. TRUNCATE does not fire DELETE triggers",
        "SQLite supports triggers with almost the same syntax (no DELIMITER, use RAISE(ABORT, msg) instead of SIGNAL)"
      ]
    }
  ],
  "examples": [
    {
      "title": "Stored Procedure with an IN Parameter",
      "scenario": "HR keeps asking for \"employees of department X\". Wrap it in a procedure so they just CALL it.",
      "steps": [
        "Open MySQL Workbench and connect to company_db (with the course tables created)",
        "Paste the whole script including the DELIMITER lines into a SQL tab",
        "Run it with Ctrl+Shift+Enter, then refresh Schemas -> company_db -> Stored Procedures / Functions",
        "Run the CALL / SELECT line and check the result grid",
        "In the SQL Lab you can run the equivalent SQLite query shown in the lab panel"
      ],
      "code": "DELIMITER $$\nCREATE PROCEDURE get_employees_by_dept(IN p_dept_id INT)\nBEGIN\n  SELECT e.emp_id, e.name, e.salary\n  FROM employees e\n  WHERE e.dept_id = p_dept_id\n  ORDER BY e.salary DESC;\nEND $$\nDELIMITER ;\n\nCALL get_employees_by_dept(2);",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "-- SQLite has no procedures: this is the body of the procedure with p_dept_id = 2\nSELECT e.emp_id, e.name, e.salary\nFROM employees e\nWHERE e.dept_id = 2\nORDER BY e.salary DESC;"
      },
      "result": "emp_id | name        | salary\n-------+-------------+-------\n1      | Asha Rao    | 95000\n2      | Rahul Mehta | 72000\n6      | Arjun Nair  | 68000\n(3 rows)",
      "explanation": "CALL get_employees_by_dept(2) runs the stored SELECT with p_dept_id = 2 and returns the result grid shown. The DELIMITER lines are a client (Workbench/mysql CLI) feature: they let the semicolons inside BEGIN ... END be part of the procedure. The SQL Lab runs the same SELECT directly."
    },
    {
      "title": "OUT Parameter and IF/ELSEIF",
      "scenario": "Finance wants a procedure that returns a department's total payroll and a size label through OUT parameters.",
      "steps": [
        "Open MySQL Workbench and connect to company_db (with the course tables created)",
        "Paste the whole script including the DELIMITER lines into a SQL tab",
        "Run it with Ctrl+Shift+Enter, then refresh Schemas -> company_db -> Stored Procedures / Functions",
        "Run the CALL / SELECT line and check the result grid",
        "In the SQL Lab you can run the equivalent SQLite query shown in the lab panel"
      ],
      "code": "DELIMITER $$\nCREATE PROCEDURE dept_payroll(IN p_dept INT, OUT p_total DECIMAL(12,2), OUT p_band VARCHAR(10))\nBEGIN\n  SELECT COALESCE(SUM(salary), 0) INTO p_total\n  FROM employees WHERE dept_id = p_dept;\n\n  IF p_total > 200000 THEN SET p_band = 'Large';\n  ELSEIF p_total > 70000 THEN SET p_band = 'Medium';\n  ELSE SET p_band = 'Small';\n  END IF;\nEND $$\nDELIMITER ;\n\nCALL dept_payroll(2, @total, @band);\nSELECT @total AS total, @band AS band;\nCALL dept_payroll(3, @total, @band);\nSELECT @total AS total, @band AS band;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "-- SQLite equivalent of the procedure logic for departments 2 and 3\nSELECT dept_id, SUM(salary) AS total,\n       CASE WHEN SUM(salary) > 200000 THEN 'Large'\n            WHEN SUM(salary) > 70000  THEN 'Medium'\n            ELSE 'Small' END AS band\nFROM employees\nWHERE dept_id IN (2, 3)\nGROUP BY dept_id;"
      },
      "result": "MySQL output:\ntotal     | band\n----------+------\n235000.00 | Large\n(1 row)\ntotal    | band\n---------+------\n60000.00 | Small\n(1 row)\n\nSQL Lab (SQLite equivalent):\ndept_id | total  | band\n--------+--------+------\n2       | 235000 | Large\n3       | 60000  | Small\n(2 rows)",
      "explanation": "SELECT ... INTO stores the query result in the OUT parameter. The caller passes session variables (@total, @band) to receive the values, then SELECTs them. IT's payroll is 235000 (Large) and HR's is 60000 (Small). The SQLite query reproduces the same logic with CASE."
    },
    {
      "title": "Stored Function Used Inside SELECT",
      "scenario": "Create a reusable function that computes yearly tax from a monthly salary using simple slabs, and use it in a report.",
      "steps": [
        "Open MySQL Workbench and connect to company_db (with the course tables created)",
        "Paste the whole script including the DELIMITER lines into a SQL tab",
        "Run it with Ctrl+Shift+Enter, then refresh Schemas -> company_db -> Stored Procedures / Functions",
        "Run the CALL / SELECT line and check the result grid",
        "In the SQL Lab you can run the equivalent SQLite query shown in the lab panel"
      ],
      "code": "DELIMITER $$\nCREATE FUNCTION fn_annual_tax(p_salary DECIMAL(10,2))\nRETURNS DECIMAL(12,2)\nDETERMINISTIC\nBEGIN\n  DECLARE yearly DECIMAL(12,2);\n  SET yearly = p_salary * 12;\n  RETURN CASE\n           WHEN yearly <= 700000  THEN 0\n           WHEN yearly <= 1000000 THEN (yearly - 700000) * 0.10\n           ELSE 30000 + (yearly - 1000000) * 0.20\n         END;\nEND $$\nDELIMITER ;\n\nSELECT name, salary, fn_annual_tax(salary) AS annual_tax\nFROM employees\nORDER BY salary DESC\nLIMIT 5;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "-- SQLite has no CREATE FUNCTION in SQL; the same logic as an expression:\nSELECT name, salary,\n       CASE\n         WHEN salary * 12 <= 700000  THEN 0\n         WHEN salary * 12 <= 1000000 THEN (salary * 12 - 700000) * 10 / 100\n         ELSE 30000 + (salary * 12 - 1000000) * 20 / 100\n       END AS annual_tax\nFROM employees\nORDER BY salary DESC\nLIMIT 5;"
      },
      "result": "name        | salary | annual_tax\n------------+--------+-----------\nAsha Rao    | 95000  | 58000\nPriya Shah  | 85000  | 34000\nSneha Iyer  | 78000  | 23600\nRahul Mehta | 72000  | 16400\nArjun Nair  | 68000  | 11600\n(5 rows)",
      "explanation": "The function hides the slab logic behind one name, so every report computes tax the same way. Asha: 95000 x 12 = 1140000 -> 30000 + 140000 x 20% = 58000. MySQL would print the values as DECIMAL (58000.00). In SQLite, custom functions are registered from the host language (for example Python's connection.create_function), so the lab uses a CASE expression."
    },
    {
      "title": "AFTER UPDATE Trigger for a Salary Audit Log",
      "scenario": "Every salary change must be recorded automatically, whoever makes it.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nCREATE TABLE salary_audit (\n  audit_id   INT AUTO_INCREMENT PRIMARY KEY,\n  emp_id     INT,\n  old_salary DECIMAL(10,2),\n  new_salary DECIMAL(10,2),\n  changed_at DATETIME\n);\nDELIMITER $$\nCREATE TRIGGER trg_salary_audit\nAFTER UPDATE ON employees\nFOR EACH ROW\nBEGIN\n  IF OLD.salary <> NEW.salary THEN\n    INSERT INTO salary_audit (emp_id, old_salary, new_salary, changed_at)\n    VALUES (OLD.emp_id, OLD.salary, NEW.salary, NOW());\n  END IF;\nEND $$\nDELIMITER ;\n\nUPDATE employees SET salary = salary + 5000 WHERE dept_id = 2;\nUPDATE employees SET city = 'Pune' WHERE emp_id = 4;   -- no salary change, no audit row\nSELECT * FROM salary_audit;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE TABLE salary_audit (\n  audit_id   INTEGER PRIMARY KEY,\n  emp_id     INTEGER,\n  old_salary DECIMAL(10,2),\n  new_salary DECIMAL(10,2),\n  changed_at TEXT\n);\nCREATE TRIGGER trg_salary_audit\nAFTER UPDATE OF salary ON employees\nFOR EACH ROW\nWHEN OLD.salary <> NEW.salary\nBEGIN\n  INSERT INTO salary_audit (emp_id, old_salary, new_salary, changed_at)\n  VALUES (OLD.emp_id, OLD.salary, NEW.salary, '2024-04-01');\nEND;",
        "query": "UPDATE employees SET salary = salary + 5000 WHERE dept_id = 2;\nUPDATE employees SET city = 'Pune' WHERE emp_id = 4;\nSELECT * FROM salary_audit;"
      },
      "result": "audit_id | emp_id | old_salary | new_salary | changed_at\n---------+--------+------------+------------+-----------\n1        | 1      | 95000      | 100000     | 2024-04-01\n2        | 2      | 72000      | 77000      | 2024-04-01\n3        | 6      | 68000      | 73000      | 2024-04-01\n(3 rows)",
      "explanation": "The trigger fired once per updated row (FOR EACH ROW): 3 IT employees, 3 audit rows. Changing only the city did not create an audit row because of the OLD.salary <> NEW.salary check. SQLite puts that check in a WHEN clause and has no NOW() here, so a fixed timestamp keeps the output repeatable."
    },
    {
      "title": "AFTER INSERT Trigger to Reduce Stock",
      "scenario": "When an order is inserted, reduce that product's stock automatically.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nDELIMITER $$\nCREATE TRIGGER trg_order_stock\nAFTER INSERT ON orders\nFOR EACH ROW\nBEGIN\n  UPDATE products SET stock = stock - NEW.quantity\n  WHERE product_id = NEW.product_id;\nEND $$\nDELIMITER ;\n\nINSERT INTO orders (customer_id, product_id, quantity, amount, order_date, status)\nVALUES (5, 2, 3, 1500, '2024-03-28', 'Pending');\nSELECT product_id, name, stock FROM products WHERE product_id = 2;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE TRIGGER trg_order_stock\nAFTER INSERT ON orders\nFOR EACH ROW\nBEGIN\n  UPDATE products SET stock = stock - NEW.quantity\n  WHERE product_id = NEW.product_id;\nEND;",
        "query": "INSERT INTO orders (customer_id, product_id, quantity, amount, order_date, status)\nVALUES (5, 2, 3, 1500, '2024-03-28', 'Pending');\nSELECT product_id, name, stock FROM products WHERE product_id = 2;"
      },
      "result": "product_id | name  | stock\n-----------+-------+------\n2          | Mouse | 197\n(1 row)",
      "explanation": "NEW refers to the row just inserted. The Mouse had 200 in stock; the trigger subtracted the ordered quantity 3, giving 197, without any extra code in the application."
    },
    {
      "title": "BEFORE INSERT Trigger for Validation",
      "scenario": "Reject orders with zero or negative quantity, no matter which app inserts them.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nDELIMITER $$\nCREATE TRIGGER trg_order_qty_check\nBEFORE INSERT ON orders\nFOR EACH ROW\nBEGIN\n  IF NEW.quantity <= 0 THEN\n    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantity must be positive';\n  END IF;\n  SET NEW.status = COALESCE(NEW.status, 'Pending');   -- BEFORE triggers can change NEW\nEND $$\nDELIMITER ;\n\nINSERT INTO orders (customer_id, product_id, quantity, amount, order_date)\nVALUES (5, 2, 0, 0, '2024-03-28');\n-- ERROR 1644 (45000): Quantity must be positive",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');\nCREATE TRIGGER trg_order_qty_check\nBEFORE INSERT ON orders\nFOR EACH ROW\nWHEN NEW.quantity <= 0\nBEGIN\n  SELECT RAISE(ABORT, 'Quantity must be positive');\nEND;",
        "query": "INSERT INTO orders (customer_id, product_id, quantity, amount, order_date)\nVALUES (5, 2, 0, 0, '2024-03-28');"
      },
      "result": "Error: Quantity must be positive",
      "explanation": "The BEFORE INSERT trigger checks NEW.quantity before the row is written and raises an error, so the row is never stored. MySQL uses SIGNAL SQLSTATE '45000'; SQLite uses RAISE(ABORT, message). A CHECK constraint could do the same simple check, but triggers can run more complex logic (look up other tables, modify NEW)."
    }
  ],
  "interview": [
    {
      "q": "What is a stored procedure?",
      "a": "A precompiled, named set of SQL statements stored in the database and executed with CALL. It can take IN/OUT/INOUT parameters, contain control flow, and perform DML and transactions.",
      "level": "Easy"
    },
    {
      "q": "Advantages and disadvantages of stored procedures?",
      "a": "Advantages: less network traffic, reusable central logic, security via EXECUTE privilege, can be faster. Disadvantages: harder to version-control, test and debug; logic tied to one database vendor; scaling the database is harder than scaling app servers.",
      "level": "Medium"
    },
    {
      "q": "Difference between a stored procedure and a function?",
      "a": "A function returns exactly one value and can be used in SELECT/WHERE; it cannot use transactions and should not modify data. A procedure is invoked with CALL, can return many values via OUT params or result sets, and can run DML and transactions.",
      "level": "Medium"
    },
    {
      "q": "Why do we use DELIMITER in MySQL?",
      "a": "The mysql client and Workbench split statements at ;. Changing the delimiter to $$ lets the semicolons inside BEGIN...END be sent to the server as part of one CREATE statement.",
      "level": "Medium"
    },
    {
      "q": "What are IN, OUT and INOUT parameters?",
      "a": "IN passes a value into the procedure (default). OUT returns a value to the caller through a variable. INOUT passes a value in and returns a modified value.",
      "level": "Easy"
    },
    {
      "q": "What is a trigger? What types exist in MySQL?",
      "a": "A stored block that runs automatically on INSERT, UPDATE or DELETE of a table. MySQL supports BEFORE and AFTER for each event (6 types), row-level only.",
      "level": "Easy"
    },
    {
      "q": "What are NEW and OLD in triggers?",
      "a": "NEW holds the new row values (available in INSERT and UPDATE); OLD holds the previous values (available in UPDATE and DELETE). NEW can be modified only in BEFORE triggers.",
      "level": "Medium"
    },
    {
      "q": "Does TRUNCATE fire DELETE triggers?",
      "a": "No. TRUNCATE is DDL and does not fire DELETE triggers. DELETE FROM table does.",
      "level": "Hard"
    },
    {
      "q": "Can a trigger call a stored procedure?",
      "a": "Yes, using CALL, as long as the procedure does not return a result set to the client or use explicit/implicit commits.",
      "level": "Hard"
    },
    {
      "q": "What is a cursor?",
      "a": "A database object for iterating over a result set row by row inside a procedure (DECLARE, OPEN, FETCH in a loop, CLOSE), with a CONTINUE HANDLER FOR NOT FOUND to detect the end. Set-based SQL is usually faster than cursors.",
      "level": "Hard"
    },
    {
      "q": "What is DETERMINISTIC in a MySQL function?",
      "a": "A declaration that the function always returns the same result for the same inputs. It is required (or NO SQL / READS SQL DATA) when binary logging is enabled, and helps replication and optimisation.",
      "level": "Hard"
    },
    {
      "q": "How do you raise a custom error in MySQL?",
      "a": "SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'message'; inside a procedure or trigger.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "Write a MySQL procedure get_orders_by_status(IN p_status VARCHAR(20)) that returns orders with that status, and call it for Delivered.",
      "hint": "SELECT ... WHERE status = p_status; CALL proc('Delivered').",
      "solution": "DELIMITER $$\nCREATE PROCEDURE get_orders_by_status(IN p_status VARCHAR(20))\nBEGIN\n  SELECT order_id, customer_id, amount FROM orders WHERE status = p_status;\nEND $$\nDELIMITER ;\nCALL get_orders_by_status('Delivered');"
    },
    {
      "task": "Write a MySQL function fn_full_price(price, qty) that returns price * qty plus 18% GST, and use it on orders joined to products.",
      "hint": "RETURNS DECIMAL(12,2) DETERMINISTIC.",
      "solution": "DELIMITER $$\nCREATE FUNCTION fn_full_price(p_price DECIMAL(10,2), p_qty INT)\nRETURNS DECIMAL(12,2)\nDETERMINISTIC\nBEGIN\n  RETURN ROUND(p_price * p_qty * 1.18, 2);\nEND $$\nDELIMITER ;\nSELECT o.order_id, fn_full_price(p.price, o.quantity) AS total_with_gst\nFROM orders o JOIN products p ON p.product_id = o.product_id;"
    },
    {
      "task": "Create a trigger (SQLite syntax) that stores every deleted customer in a customers_deleted table, then delete customer 5 and show the archive.",
      "hint": "AFTER DELETE ... INSERT ... VALUES (OLD.customer_id, OLD.name).",
      "solution": "CREATE TABLE customers_deleted (customer_id INTEGER, name TEXT);\nCREATE TRIGGER trg_customer_delete\nAFTER DELETE ON customers\nFOR EACH ROW\nBEGIN\n  INSERT INTO customers_deleted VALUES (OLD.customer_id, OLD.name);\nEND;\nDELETE FROM customers WHERE customer_id = 5;\nSELECT * FROM customers_deleted;"
    },
    {
      "task": "Create a BEFORE INSERT trigger (SQLite syntax) that rejects products with a negative price.",
      "hint": "WHEN NEW.price < 0 ... RAISE(ABORT, ...).",
      "solution": "CREATE TRIGGER trg_product_price\nBEFORE INSERT ON products\nFOR EACH ROW\nWHEN NEW.price < 0\nBEGIN\n  SELECT RAISE(ABORT, 'Price cannot be negative');\nEND;\nINSERT INTO products (name, category, price, stock) VALUES ('Cable', 'Electronics', 200, 50);\nSELECT name, price FROM products WHERE name = 'Cable';"
    }
  ],
  "quiz": [
    {
      "question": "How do you execute a stored procedure in MySQL?",
      "options": [
        "EXEC proc()",
        "RUN proc()",
        "CALL proc()",
        "SELECT proc()"
      ],
      "answer": 2,
      "explanation": "MySQL uses CALL."
    },
    {
      "question": "Which can be used inside a SELECT statement?",
      "options": [
        "Stored function",
        "Stored procedure",
        "Trigger",
        "Cursor"
      ],
      "answer": 0,
      "explanation": "Functions return one value and can be used in expressions."
    },
    {
      "question": "In an AFTER DELETE trigger you can read:",
      "options": [
        "NEW only",
        "Both NEW and OLD",
        "Neither",
        "OLD only"
      ],
      "answer": 3,
      "explanation": "A deleted row has only OLD values."
    },
    {
      "question": "Why is DELIMITER $$ used before CREATE PROCEDURE?",
      "options": [
        "To speed up the procedure",
        "So inner semicolons do not end the CREATE statement early",
        "To create a comment",
        "It is required by the server"
      ],
      "answer": 1,
      "explanation": "It is a client-side setting for statement splitting."
    },
    {
      "question": "How many trigger timing/event combinations does MySQL support per table?",
      "options": [
        "2",
        "3",
        "6",
        "9"
      ],
      "answer": 2,
      "explanation": "BEFORE/AFTER x INSERT/UPDATE/DELETE = 6."
    }
  ]
};
