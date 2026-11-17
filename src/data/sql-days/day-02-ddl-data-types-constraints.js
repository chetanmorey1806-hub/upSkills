export default {
  "id": "day-02-ddl-data-types-constraints",
  "title": "DDL: CREATE, ALTER, DROP, TRUNCATE, Data Types, Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT, CHECK)",
  "module": "Module 1: SQL Basics",
  "day": 2,
  "level": "Beginner",
  "duration": "2.5 hours",
  "summary": "Use Data Definition Language to build and change table structures, pick the right MySQL data types, and protect data quality with constraints.",
  "objectives": [
    "Create, alter, rename and drop tables using DDL commands",
    "Choose correct MySQL data types: INT, DECIMAL, VARCHAR, CHAR, TEXT, DATE, DATETIME, BOOLEAN, ENUM",
    "Apply PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT and CHECK constraints",
    "Explain the difference between DROP, TRUNCATE and DELETE",
    "Use AUTO_INCREMENT in MySQL and understand its SQLite equivalent"
  ],
  "theory": [
    {
      "heading": "What is DDL?",
      "content": "DDL (Data Definition Language) commands define the STRUCTURE of the database: tables, columns, indexes and views. They do not work on individual rows. Think of building a house: DDL is the architect who decides how many rooms there are and how big each one is; DML (next day) is the family moving furniture in and out. In MySQL, DDL statements are auto-committed, which means they cannot be rolled back.",
      "points": [
        "CREATE: make a new database, table, view or index",
        "ALTER: change an existing table (add/modify/drop/rename columns)",
        "DROP: delete the whole object (structure + data)",
        "TRUNCATE: delete all rows quickly but keep the structure",
        "RENAME: rename a table (RENAME TABLE old TO new in MySQL)"
      ]
    },
    {
      "heading": "MySQL Data Types",
      "content": "Every column has a data type that decides what values it can hold and how much space it uses. Choosing the right type saves storage and stops bad data (you cannot store \"abc\" in an INT column in strict mode).",
      "points": [
        "Integers: TINYINT (1 byte), SMALLINT, MEDIUMINT, INT (4 bytes), BIGINT (8 bytes)",
        "Exact decimals: DECIMAL(10,2) = 10 digits total, 2 after the point. Use for money",
        "Approximate: FLOAT, DOUBLE (scientific values; never for money because of rounding)",
        "Text: CHAR(n) fixed length (country codes), VARCHAR(n) variable length up to 65,535 bytes, TEXT for long text",
        "Date/time: DATE (YYYY-MM-DD), TIME, DATETIME (YYYY-MM-DD HH:MM:SS), TIMESTAMP (stored in UTC, range 1970-2038), YEAR",
        "BOOLEAN is an alias for TINYINT(1): 0 = false, 1 = true",
        "ENUM('S','M','L') allows only listed values; JSON stores JSON documents (MySQL 5.7+)"
      ],
      "tip": "SQLite (used by the SQL Lab) is flexible: it accepts type names like VARCHAR(50) and DECIMAL(10,2) but stores values using only 5 storage classes: NULL, INTEGER, REAL, TEXT, BLOB. So the same CREATE TABLE works in both, but SQLite will not complain if you put text in a number column."
    },
    {
      "heading": "CREATE TABLE and Constraints",
      "content": "Constraints are rules that the database enforces on every INSERT and UPDATE. They are the security guards of your data.",
      "syntax": "CREATE TABLE employees (\n  emp_id    INT AUTO_INCREMENT PRIMARY KEY,\n  name      VARCHAR(50)  NOT NULL,\n  email     VARCHAR(100) UNIQUE,\n  salary    DECIMAL(10,2) CHECK (salary > 0),\n  status    VARCHAR(10)  DEFAULT 'Active',\n  dept_id   INT,\n  CONSTRAINT fk_emp_dept FOREIGN KEY (dept_id)\n      REFERENCES departments(dept_id)\n      ON DELETE SET NULL ON UPDATE CASCADE\n);",
      "points": [
        "PRIMARY KEY: unique + not null; only one per table (can be composite: PRIMARY KEY (order_id, product_id))",
        "FOREIGN KEY: value must exist in the parent table (or be NULL)",
        "UNIQUE: no duplicates, but NULL is allowed (multiple NULLs allowed in MySQL)",
        "NOT NULL: value is mandatory",
        "DEFAULT: value used when INSERT does not give one",
        "CHECK: a condition each row must satisfy (enforced from MySQL 8.0.16; older versions ignored it)"
      ]
    },
    {
      "heading": "AUTO_INCREMENT (MySQL) and Foreign Key Actions",
      "content": "AUTO_INCREMENT makes MySQL generate the next number for the primary key automatically: 1, 2, 3 ... so you do not have to track the last id. In SQLite the same effect comes from INTEGER PRIMARY KEY (optionally with AUTOINCREMENT). Foreign keys can also say what happens when the parent row is deleted or updated.",
      "syntax": "-- MySQL\nCREATE TABLE customers (\n  customer_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(50) NOT NULL\n);\nINSERT INTO customers (name) VALUES ('Amit');   -- gets id 1\n-- SQLite equivalent\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL\n);",
      "points": [
        "ON DELETE CASCADE: delete child rows too (delete an order -> delete its order items)",
        "ON DELETE SET NULL: set the child column to NULL (department closed -> employee dept_id becomes NULL)",
        "ON DELETE RESTRICT / NO ACTION (default): refuse to delete the parent while children exist",
        "ON UPDATE CASCADE: if the parent key changes, update the child keys",
        "SQLite enforces foreign keys only after PRAGMA foreign_keys = ON;"
      ]
    },
    {
      "heading": "ALTER TABLE",
      "content": "Requirements change: HR now wants a phone number column. Instead of recreating the table, ALTER TABLE changes it in place without losing data.",
      "syntax": "ALTER TABLE employees ADD phone VARCHAR(15);\nALTER TABLE employees ADD COLUMN joined DATE AFTER name;   -- MySQL: position\nALTER TABLE employees MODIFY phone VARCHAR(20) NOT NULL;   -- MySQL: change type\nALTER TABLE employees CHANGE phone mobile VARCHAR(20);     -- MySQL: rename + type\nALTER TABLE employees RENAME COLUMN mobile TO phone_no;    -- MySQL 8 and SQLite\nALTER TABLE employees DROP COLUMN phone_no;\nALTER TABLE employees ADD CONSTRAINT uq_email UNIQUE (email);\nALTER TABLE employees RENAME TO staff;                     -- also RENAME TABLE employees TO staff;",
      "tip": "SQLite supports ADD COLUMN, RENAME COLUMN, RENAME TO and DROP COLUMN, but not MODIFY/CHANGE or adding constraints later. To change a column type in SQLite you create a new table and copy the data."
    },
    {
      "heading": "DROP vs TRUNCATE vs DELETE",
      "content": "All three remove data, but in very different ways. This is one of the most asked SQL interview questions.",
      "syntax": "DELETE FROM employees WHERE emp_id = 5;\nTRUNCATE TABLE employees;\nDROP TABLE employees;\nDROP TABLE IF EXISTS employees;   -- no error if it does not exist",
      "points": [
        "DELETE (DML): removes selected rows using WHERE; can be rolled back; fires triggers; slower for big tables; AUTO_INCREMENT counter continues",
        "TRUNCATE (DDL): removes ALL rows, keeps the structure; cannot use WHERE; resets AUTO_INCREMENT; very fast; cannot be rolled back in MySQL",
        "DROP (DDL): removes the table itself (structure, data, indexes, triggers); cannot be rolled back",
        "Analogy: DELETE = erasing some lines in a notebook, TRUNCATE = tearing out all pages but keeping the cover, DROP = throwing the notebook away",
        "SQLite has no TRUNCATE; DELETE FROM table; without WHERE does the same job"
      ]
    }
  ],
  "examples": [
    {
      "title": "Create a Table with Every Constraint and Insert Valid Data",
      "scenario": "Build an employees table for a startup where the email must be unique, salary must be positive and status defaults to Active.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL 8\nCREATE TABLE departments (\n  dept_id   INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location  VARCHAR(50) DEFAULT 'Mumbai'\n);\nCREATE TABLE employees (\n  emp_id  INT AUTO_INCREMENT PRIMARY KEY,\n  name    VARCHAR(50) NOT NULL,\n  email   VARCHAR(100) UNIQUE,\n  salary  DECIMAL(10,2) CHECK (salary > 0),\n  status  VARCHAR(10) DEFAULT 'Active',\n  dept_id INT,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments (dept_name) VALUES ('Sales');\nINSERT INTO departments VALUES (2, 'IT', 'Bengaluru');\nINSERT INTO employees (name, email, salary, dept_id)\nVALUES ('Asha', 'asha@corp.com', 50000, 2);\nSELECT * FROM employees;\nSELECT * FROM departments;",
      "sql": {
        "setup": "PRAGMA foreign_keys = ON;\nCREATE TABLE departments (\n  dept_id   INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location  VARCHAR(50) DEFAULT 'Mumbai'\n);\nCREATE TABLE employees (\n  emp_id   INTEGER PRIMARY KEY,\n  name     VARCHAR(50) NOT NULL,\n  email    VARCHAR(100) UNIQUE,\n  salary   DECIMAL(10,2) CHECK (salary > 0),\n  status   VARCHAR(10) DEFAULT 'Active',\n  dept_id  INTEGER,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments (dept_id, dept_name) VALUES (1, 'Sales');\nINSERT INTO departments VALUES (2, 'IT', 'Bengaluru');",
        "query": "INSERT INTO employees (name, email, salary, dept_id)\nVALUES ('Asha', 'asha@corp.com', 50000, 2);\nSELECT * FROM employees;\nSELECT * FROM departments;"
      },
      "result": "emp_id | name | email         | salary | status | dept_id\n-------+------+---------------+--------+--------+--------\n1      | Asha | asha@corp.com | 50000  | Active | 2\n(1 row)\n\ndept_id | dept_name | location\n--------+-----------+----------\n1       | Sales     | Mumbai\n2       | IT        | Bengaluru\n(2 rows)",
      "explanation": "We did not give emp_id or status. emp_id was generated automatically (AUTO_INCREMENT in MySQL, INTEGER PRIMARY KEY in SQLite) and status took its DEFAULT value Active. Department 1 got the default location Mumbai because we inserted only dept_id and dept_name."
    },
    {
      "title": "Constraints Rejecting Bad Data",
      "scenario": "A careless data-entry operator tries to insert a duplicate email, a negative salary, a missing name and a non-existent department. Watch the database refuse each one.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- Each statement below FAILS because of a constraint (run them one by one)\nINSERT INTO employees (name, email, salary) VALUES ('Ravi', 'asha@corp.com', 40000); -- UNIQUE\nINSERT INTO employees (name, email, salary) VALUES ('Ravi', 'ravi@corp.com', -100);  -- CHECK\nINSERT INTO employees (email, salary) VALUES ('x@corp.com', 30000);                  -- NOT NULL\nINSERT INTO employees (name, salary, dept_id) VALUES ('Tina', 30000, 99);            -- FOREIGN KEY\nSELECT COUNT(*) AS total_employees FROM employees;                                   -- still 1",
      "sql": {
        "setup": "PRAGMA foreign_keys = ON;\nCREATE TABLE departments (\n  dept_id   INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location  VARCHAR(50) DEFAULT 'Mumbai'\n);\nCREATE TABLE employees (\n  emp_id   INTEGER PRIMARY KEY,\n  name     VARCHAR(50) NOT NULL,\n  email    VARCHAR(100) UNIQUE,\n  salary   DECIMAL(10,2) CHECK (salary > 0),\n  status   VARCHAR(10) DEFAULT 'Active',\n  dept_id  INTEGER,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments (dept_id, dept_name) VALUES (1, 'Sales');\nINSERT INTO departments VALUES (2, 'IT', 'Bengaluru');\nINSERT INTO employees (name, email, salary, dept_id) VALUES ('Asha', 'asha@corp.com', 50000, 2);",
        "query": "INSERT INTO employees (name, email, salary) VALUES ('Ravi', 'asha@corp.com', 40000);"
      },
      "result": "Running the first statement in the SQL Lab gives:\nError: UNIQUE constraint failed: employees.email",
      "explanation": "The duplicate email is rejected by the UNIQUE constraint. Try the other three lines one at a time: SQLite reports \"CHECK constraint failed: salary > 0\", \"NOT NULL constraint failed: employees.name\" and \"FOREIGN KEY constraint failed\". Each bad INSERT saves nothing, so COUNT(*) stays 1. In MySQL the messages look like \"Duplicate entry 'asha@corp.com' for key 'email'\", \"Check constraint 'employees_chk_1' is violated\", \"Column 'name' cannot be null\" and \"Cannot add or update a child row: a foreign key constraint fails\". The errors above are SQLite's wording of the same rules."
    },
    {
      "title": "ALTER TABLE: Add, Rename and Drop Columns",
      "scenario": "HR asks for a phone column, then decides to call it mobile, and later removes the status column.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL 8\nALTER TABLE employees ADD COLUMN phone VARCHAR(15);\nALTER TABLE employees RENAME COLUMN phone TO mobile;\nALTER TABLE employees MODIFY mobile VARCHAR(20);   -- MySQL only\nALTER TABLE employees DROP COLUMN status;\nUPDATE employees SET mobile = '9876543210' WHERE emp_id = 1;\nSELECT * FROM employees;",
      "sql": {
        "setup": "PRAGMA foreign_keys = ON;\nCREATE TABLE departments (\n  dept_id   INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location  VARCHAR(50) DEFAULT 'Mumbai'\n);\nCREATE TABLE employees (\n  emp_id   INTEGER PRIMARY KEY,\n  name     VARCHAR(50) NOT NULL,\n  email    VARCHAR(100) UNIQUE,\n  salary   DECIMAL(10,2) CHECK (salary > 0),\n  status   VARCHAR(10) DEFAULT 'Active',\n  dept_id  INTEGER,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO departments (dept_id, dept_name) VALUES (1, 'Sales');\nINSERT INTO departments VALUES (2, 'IT', 'Bengaluru');\nINSERT INTO employees (name, email, salary, dept_id) VALUES ('Asha', 'asha@corp.com', 50000, 2);",
        "query": "ALTER TABLE employees ADD COLUMN phone VARCHAR(15);\nALTER TABLE employees RENAME COLUMN phone TO mobile;\nALTER TABLE employees DROP COLUMN status;\nUPDATE employees SET mobile = '9876543210' WHERE emp_id = 1;\nSELECT * FROM employees;"
      },
      "result": "emp_id | name | email         | salary | dept_id | mobile\n-------+------+---------------+--------+---------+-----------\n1      | Asha | asha@corp.com | 50000  | 2       | 9876543210\n(1 row)",
      "explanation": "ADD COLUMN appends a new column (existing rows get NULL or the DEFAULT). RENAME COLUMN changes the name, DROP COLUMN removes the column and its data. MODIFY (change type) is MySQL-only, so it is left out of the SQLite version."
    },
    {
      "title": "TRUNCATE vs DELETE vs DROP",
      "scenario": "At the end of a test, you want to clear a staging table. Compare the three options.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nDELETE FROM staging WHERE id = 1;  -- removes one row\nTRUNCATE TABLE staging;            -- removes all rows, resets AUTO_INCREMENT\nDROP TABLE staging;                -- removes the table itself\n-- SQLite (SQL Lab) has no TRUNCATE: use DELETE without WHERE",
      "sql": {
        "setup": "CREATE TABLE staging (id INTEGER PRIMARY KEY, val TEXT);\nINSERT INTO staging (val) VALUES ('a'), ('b'), ('c');",
        "query": "DELETE FROM staging WHERE id = 1;\nSELECT COUNT(*) AS after_delete_one FROM staging;\nDELETE FROM staging;\nSELECT COUNT(*) AS after_delete_all FROM staging;\nDROP TABLE staging;\nSELECT name FROM sqlite_master WHERE name = 'staging';"
      },
      "result": "after_delete_one\n----------------\n2\n(1 row)\n\nafter_delete_all\n----------------\n0\n(1 row)\n\nname\n----\n(0 rows)",
      "explanation": "After deleting one row, 2 remain. Deleting without WHERE (the SQLite version of TRUNCATE) leaves 0 rows but the table still exists. After DROP, the table is gone, so searching for it in sqlite_master returns no rows."
    },
    {
      "title": "Composite Primary Key and ON DELETE CASCADE",
      "scenario": "An order can contain many products. order_items uses (order_id, product_id) together as its primary key, and its rows should disappear when the order is deleted.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "DELETE FROM orders WHERE order_id = 101;\nSELECT * FROM order_items;",
      "sql": {
        "setup": "PRAGMA foreign_keys = ON;\nCREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer VARCHAR(50));\nCREATE TABLE order_items (\n  order_id   INTEGER,\n  product_id INTEGER,\n  qty        INTEGER NOT NULL DEFAULT 1,\n  PRIMARY KEY (order_id, product_id),\n  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE\n);\nINSERT INTO orders VALUES (101, 'Amit'), (102, 'Sara');\nINSERT INTO order_items VALUES (101, 1, 1), (101, 2, 2), (102, 4, 1);",
        "query": "DELETE FROM orders WHERE order_id = 101;\nSELECT * FROM order_items;"
      },
      "result": "order_id | product_id | qty\n---------+------------+----\n102      | 4          | 1\n(1 row)",
      "explanation": "The composite key allows product 1 to appear in many orders but only once per order. Because of ON DELETE CASCADE, deleting order 101 automatically deleted its two item rows; only order 102's item remains. Without CASCADE, the DELETE would fail with a foreign key error."
    }
  ],
  "interview": [
    {
      "q": "What is DDL? Give examples.",
      "a": "Data Definition Language defines database structure: CREATE, ALTER, DROP, TRUNCATE, RENAME. In MySQL DDL statements cause an implicit commit.",
      "level": "Easy"
    },
    {
      "q": "Difference between DELETE, TRUNCATE and DROP?",
      "a": "DELETE is DML, removes chosen rows with WHERE, can be rolled back, fires triggers. TRUNCATE is DDL, removes all rows, resets AUTO_INCREMENT, faster, no WHERE, not rollback-able in MySQL. DROP removes the table structure and data entirely.",
      "level": "Medium"
    },
    {
      "q": "Difference between CHAR and VARCHAR?",
      "a": "CHAR(n) is fixed length: it always uses n characters, padding with spaces; good for fixed codes like country code \"IN\". VARCHAR(n) stores only the actual length plus 1-2 bytes for length; good for names and emails.",
      "level": "Easy"
    },
    {
      "q": "Why use DECIMAL instead of FLOAT for money?",
      "a": "FLOAT/DOUBLE are approximate binary numbers, so 0.1 + 0.2 may not equal 0.3 exactly. DECIMAL stores exact values, which is required for currency.",
      "level": "Medium"
    },
    {
      "q": "Difference between PRIMARY KEY and UNIQUE?",
      "a": "Both prevent duplicates. A primary key cannot be NULL and a table has only one. A UNIQUE constraint allows NULL values and a table can have many UNIQUE constraints. The primary key is also the clustered index in InnoDB.",
      "level": "Medium"
    },
    {
      "q": "What is a composite key?",
      "a": "A primary key made of two or more columns, such as (order_id, product_id) in an order_items table. The combination must be unique.",
      "level": "Easy"
    },
    {
      "q": "What happens with ON DELETE CASCADE?",
      "a": "When a parent row is deleted, all child rows referencing it are automatically deleted too.",
      "level": "Easy"
    },
    {
      "q": "What is AUTO_INCREMENT?",
      "a": "A MySQL column attribute that generates a unique sequential number for each new row, usually for the primary key. Only one AUTO_INCREMENT column per table is allowed and it must be indexed. SQLite uses INTEGER PRIMARY KEY instead.",
      "level": "Easy"
    },
    {
      "q": "Is the CHECK constraint enforced in MySQL?",
      "a": "Only from MySQL 8.0.16. Earlier versions parsed CHECK but silently ignored it.",
      "level": "Hard"
    },
    {
      "q": "Difference between DATETIME and TIMESTAMP in MySQL?",
      "a": "DATETIME stores the date and time as given (range 1000-9999) with no time zone conversion. TIMESTAMP is stored in UTC and converted to the session time zone, range 1970 to 2038, and is commonly used for created_at/updated_at with DEFAULT CURRENT_TIMESTAMP.",
      "level": "Hard"
    },
    {
      "q": "Can a foreign key column be NULL?",
      "a": "Yes, unless it is also declared NOT NULL. A NULL foreign key means \"not linked yet\", e.g. an employee not assigned to any department.",
      "level": "Medium"
    },
    {
      "q": "How do you add a constraint to an existing table?",
      "a": "ALTER TABLE employees ADD CONSTRAINT uq_email UNIQUE (email); or ADD CONSTRAINT fk_dept FOREIGN KEY (dept_id) REFERENCES departments(dept_id); Remove with ALTER TABLE ... DROP INDEX uq_email / DROP FOREIGN KEY fk_dept in MySQL.",
      "level": "Medium"
    }
  ],
  "practice": [
    {
      "task": "Create a table books with book_id (auto primary key), title (required), author, price (must be >= 0) and in_stock (default 1). Insert two books and select them.",
      "hint": "Use INTEGER PRIMARY KEY in SQLite (INT AUTO_INCREMENT PRIMARY KEY in MySQL), NOT NULL, CHECK and DEFAULT.",
      "solution": "CREATE TABLE books (\n  book_id  INTEGER PRIMARY KEY,\n  title    VARCHAR(100) NOT NULL,\n  author   VARCHAR(50),\n  price    DECIMAL(8,2) CHECK (price >= 0),\n  in_stock INTEGER DEFAULT 1\n);\nINSERT INTO books (title, author, price) VALUES ('SQL Basics', 'Rao', 450), ('Learn MySQL', 'Shah', 599);\nSELECT * FROM books;"
    },
    {
      "task": "Add a column phone VARCHAR(15) to the customers table and set it for customer 1.",
      "hint": "ALTER TABLE ... ADD COLUMN, then UPDATE.",
      "solution": "ALTER TABLE customers ADD COLUMN phone VARCHAR(15);\nUPDATE customers SET phone = '9000000001' WHERE customer_id = 1;\nSELECT customer_id, name, phone FROM customers;"
    },
    {
      "task": "Create a table reviews whose product_id is a foreign key to products and whose rating must be between 1 and 5.",
      "hint": "CHECK (rating BETWEEN 1 AND 5) and FOREIGN KEY ... REFERENCES products(product_id).",
      "solution": "CREATE TABLE reviews (\n  review_id  INTEGER PRIMARY KEY,\n  product_id INTEGER NOT NULL,\n  rating     INTEGER CHECK (rating BETWEEN 1 AND 5),\n  comment    TEXT,\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO reviews (product_id, rating, comment) VALUES (1, 5, 'Fast laptop');\nSELECT * FROM reviews;"
    },
    {
      "task": "Write MySQL statements to change the email column of employees to VARCHAR(150) and then empty a table named temp_logs.",
      "hint": "MODIFY for type change; TRUNCATE for emptying.",
      "solution": "ALTER TABLE employees MODIFY email VARCHAR(150);\nTRUNCATE TABLE temp_logs;"
    },
    {
      "task": "Rename the products table to items and show its rows.",
      "hint": "ALTER TABLE ... RENAME TO ...",
      "solution": "ALTER TABLE products RENAME TO items;\nSELECT * FROM items LIMIT 3;"
    }
  ],
  "quiz": [
    {
      "question": "Which command removes all rows but keeps the table structure and resets AUTO_INCREMENT?",
      "options": [
        "DELETE",
        "DROP",
        "TRUNCATE",
        "REMOVE"
      ],
      "answer": 2,
      "explanation": "TRUNCATE empties the table and resets the counter."
    },
    {
      "question": "Which data type is best for storing prices?",
      "options": [
        "FLOAT",
        "DECIMAL(10,2)",
        "VARCHAR(10)",
        "DOUBLE"
      ],
      "answer": 1,
      "explanation": "DECIMAL is exact; floats can produce rounding errors."
    },
    {
      "question": "How many PRIMARY KEYs can a table have?",
      "options": [
        "Exactly one",
        "Unlimited",
        "Two",
        "One per column"
      ],
      "answer": 0,
      "explanation": "Only one primary key, though it may span multiple columns."
    },
    {
      "question": "Which constraint allows NULL but forbids duplicate non-NULL values?",
      "options": [
        "PRIMARY KEY",
        "NOT NULL",
        "CHECK",
        "UNIQUE"
      ],
      "answer": 3,
      "explanation": "UNIQUE prevents duplicates but accepts NULLs."
    },
    {
      "question": "ALTER TABLE employees ADD COLUMN phone VARCHAR(15); What value do existing rows get in phone?",
      "options": [
        "Empty string",
        "NULL",
        "0",
        "Error"
      ],
      "answer": 1,
      "explanation": "Without a DEFAULT, new columns are NULL for existing rows."
    }
  ]
};
