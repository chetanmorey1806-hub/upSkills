export default {
  "id": "day-12-transactions-acid-isolation-levels",
  "title": "Transactions, ACID, COMMIT, ROLLBACK, Isolation Levels",
  "module": "Module 3: Advanced SQL",
  "day": 12,
  "level": "Advanced",
  "duration": "2.5 hours",
  "summary": "Group several statements into an all-or-nothing transaction, understand the ACID properties, use COMMIT, ROLLBACK and SAVEPOINT, and learn how isolation levels prevent dirty, non-repeatable and phantom reads.",
  "objectives": [
    "Explain what a transaction is with the classic bank transfer example",
    "Describe Atomicity, Consistency, Isolation and Durability",
    "Use START TRANSACTION, COMMIT, ROLLBACK, SAVEPOINT and autocommit in MySQL",
    "Explain dirty reads, non-repeatable reads and phantom reads",
    "Compare the four isolation levels and know MySQL InnoDB's default (REPEATABLE READ)"
  ],
  "theory": [
    {
      "heading": "What is a Transaction?",
      "content": "A transaction is a group of SQL statements that must succeed or fail as ONE unit. Bank transfer: take 5,000 from Amit and add 5,000 to Sara. If the power fails after the first step, money disappears. A transaction guarantees that either both steps happen or neither happens.",
      "syntax": "START TRANSACTION;          -- or BEGIN\nUPDATE accounts SET balance = balance - 5000 WHERE acc_id = 101;\nUPDATE accounts SET balance = balance + 5000 WHERE acc_id = 102;\nCOMMIT;                     -- make it permanent\n-- or ROLLBACK;             -- undo everything since START TRANSACTION",
      "points": [
        "MySQL runs in autocommit mode by default: every single statement is its own transaction",
        "START TRANSACTION turns autocommit off until COMMIT or ROLLBACK",
        "SET autocommit = 0; turns it off for the session",
        "Only transactional engines (InnoDB, the default) support this; MyISAM does not",
        "DDL statements (CREATE, ALTER, DROP, TRUNCATE) cause an implicit COMMIT in MySQL"
      ]
    },
    {
      "heading": "ACID Properties",
      "content": "ACID is the promise a reliable database makes about transactions.",
      "points": [
        "Atomicity: all or nothing. If any step fails, everything is rolled back (undo log in InnoDB)",
        "Consistency: a transaction moves the database from one valid state to another; constraints (CHECK balance >= 0, foreign keys) are never violated",
        "Isolation: concurrent transactions do not see each other's unfinished work (controlled by isolation levels)",
        "Durability: once COMMIT returns, the change survives crashes and power failures (redo log written to disk)",
        "Analogy: ordering food online - payment and order creation happen together (A); you cannot order more than stock (C); another customer's half-finished cart does not affect yours (I); a confirmed order stays confirmed even if the app crashes (D)"
      ]
    },
    {
      "heading": "COMMIT, ROLLBACK and SAVEPOINT",
      "content": "SAVEPOINT marks a point inside a transaction you can go back to without undoing everything. Like checkpoints in a video game.",
      "syntax": "START TRANSACTION;\nINSERT INTO orders ...;          -- step 1\nSAVEPOINT after_order;\nUPDATE products SET stock = ...; -- step 2\nROLLBACK TO SAVEPOINT after_order;  -- undo step 2 only\nCOMMIT;                          -- step 1 is saved\nRELEASE SAVEPOINT name;          -- forget a savepoint",
      "tip": "SQLite (the SQL Lab) uses BEGIN, COMMIT, ROLLBACK, SAVEPOINT name and ROLLBACK TO name, so the same ideas run in the browser."
    },
    {
      "heading": "Concurrency Problems",
      "content": "When many users work at the same time, transactions can interfere. Three classic read problems:",
      "points": [
        "Dirty read: T1 reads data that T2 changed but has NOT committed; T2 rolls back, so T1 used data that never existed",
        "Non-repeatable read: T1 reads a row twice and gets different values because T2 updated and committed in between",
        "Phantom read: T1 runs the same range query twice and sees new rows that T2 inserted and committed in between",
        "Lost update: two transactions read the same value and both write, so one update overwrites the other (fix with SELECT ... FOR UPDATE)"
      ]
    },
    {
      "heading": "Isolation Levels",
      "content": "Isolation levels trade safety for speed. Higher isolation = fewer anomalies but more locking/waiting.",
      "syntax": "SELECT @@transaction_isolation;                       -- MySQL 8\nSET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;\nSET GLOBAL  TRANSACTION ISOLATION LEVEL REPEATABLE READ;",
      "points": [
        "READ UNCOMMITTED: allows dirty, non-repeatable and phantom reads (fastest, rarely used)",
        "READ COMMITTED: no dirty reads; non-repeatable and phantom reads possible (default in Oracle, SQL Server, PostgreSQL)",
        "REPEATABLE READ: no dirty or non-repeatable reads; phantoms possible in the SQL standard, but InnoDB prevents most using MVCC snapshots and next-key locks. MySQL InnoDB DEFAULT",
        "SERIALIZABLE: transactions behave as if run one after another; no anomalies; slowest",
        "MySQL uses MVCC (multi-version concurrency control): readers see a snapshot and do not block writers"
      ]
    },
    {
      "heading": "Locks and Deadlocks",
      "content": "InnoDB uses row-level locks. SELECT ... FOR UPDATE locks the selected rows so others cannot change them until you commit; SELECT ... FOR SHARE allows others to read but not write. A deadlock happens when T1 waits for a row locked by T2 while T2 waits for a row locked by T1. InnoDB detects it and rolls back one transaction (error 1213), which the application should retry.",
      "points": [
        "Keep transactions short",
        "Access tables and rows in the same order everywhere",
        "Index the columns used in WHERE so fewer rows are locked",
        "Handle error 1213 (deadlock) and 1205 (lock wait timeout) by retrying"
      ]
    }
  ],
  "examples": [
    {
      "title": "Successful Money Transfer with COMMIT",
      "scenario": "Amit (101) sends 5,000 to Sara (102). Both updates must happen together.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "START TRANSACTION;\nUPDATE accounts SET balance = balance - 5000 WHERE acc_id = 101;\nUPDATE accounts SET balance = balance + 5000 WHERE acc_id = 102;\nCOMMIT;\nSELECT * FROM accounts;",
      "sql": {
        "setup": "CREATE TABLE accounts (\n  acc_id  INTEGER PRIMARY KEY,\n  holder  VARCHAR(50) NOT NULL,\n  balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0)\n);\nINSERT INTO accounts VALUES (101, 'Amit Kumar', 50000), (102, 'Sara Khan', 20000), (103, 'John Dsouza', 5000);",
        "query": "BEGIN;\nUPDATE accounts SET balance = balance - 5000 WHERE acc_id = 101;\nUPDATE accounts SET balance = balance + 5000 WHERE acc_id = 102;\nCOMMIT;\nSELECT * FROM accounts;"
      },
      "result": "acc_id | holder      | balance\n-------+-------------+--------\n101    | Amit Kumar  | 45000\n102    | Sara Khan   | 25000\n103    | John Dsouza | 5000\n(3 rows)",
      "explanation": "Both updates are inside one transaction. After COMMIT the changes are permanent. The total money in the bank (75,000) is unchanged, which shows consistency. SQLite uses BEGIN; MySQL accepts both BEGIN and START TRANSACTION."
    },
    {
      "title": "ROLLBACK Undoes Everything",
      "scenario": "A teller starts a transfer of 10,000 from John (103), then realises the amount is wrong and cancels.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "START TRANSACTION;\nUPDATE accounts SET balance = balance + 10000 WHERE acc_id = 102;\nSELECT * FROM accounts WHERE acc_id = 102;   -- shows 30000 inside the transaction\nROLLBACK;\nSELECT * FROM accounts;",
      "sql": {
        "setup": "CREATE TABLE accounts (\n  acc_id  INTEGER PRIMARY KEY,\n  holder  VARCHAR(50) NOT NULL,\n  balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0)\n);\nINSERT INTO accounts VALUES (101, 'Amit Kumar', 50000), (102, 'Sara Khan', 20000), (103, 'John Dsouza', 5000);",
        "query": "BEGIN;\nUPDATE accounts SET balance = balance + 10000 WHERE acc_id = 102;\nSELECT acc_id, balance AS inside_transaction FROM accounts WHERE acc_id = 102;\nROLLBACK;\nSELECT * FROM accounts;"
      },
      "result": "acc_id | inside_transaction\n-------+-------------------\n102    | 30000\n(1 row)\n\nacc_id | holder      | balance\n-------+-------------+--------\n101    | Amit Kumar  | 50000\n102    | Sara Khan   | 20000\n103    | John Dsouza | 5000\n(3 rows)",
      "explanation": "Inside the transaction, our own session sees Sara's balance as 30,000. Other sessions still see 20,000 (isolation). After ROLLBACK the change is discarded and every balance is back to the original."
    },
    {
      "title": "Atomicity with a Failing Step",
      "scenario": "Amit tries to send 8,000 to John, but John's account is debited by mistake instead and would go negative. The CHECK constraint fails, so the application rolls back the whole transfer.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "START TRANSACTION;\nUPDATE accounts SET balance = balance + 8000 WHERE acc_id = 101;  -- ok\nUPDATE accounts SET balance = balance - 8000 WHERE acc_id = 103;  -- fails: 5000 - 8000 < 0\n-- application sees the error and runs:\nROLLBACK;\nSELECT * FROM accounts;",
      "sql": {
        "setup": "CREATE TABLE accounts (\n  acc_id  INTEGER PRIMARY KEY,\n  holder  VARCHAR(50) NOT NULL,\n  balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0)\n);\nINSERT INTO accounts VALUES (101, 'Amit Kumar', 50000), (102, 'Sara Khan', 20000), (103, 'John Dsouza', 5000);",
        "query": "UPDATE accounts\nSET balance = balance + CASE acc_id WHEN 101 THEN 8000 WHEN 103 THEN -8000 END\nWHERE acc_id IN (101, 103);"
      },
      "result": "In the SQL Lab both changes are written as ONE statement (a single statement is always atomic):\nError: CHECK constraint failed: balance >= 0",
      "explanation": "The debit would make John's balance -3000, violating CHECK (balance >= 0). In the SQL Lab version both changes are in one UPDATE, and the database undoes the whole statement, including Amit's +8000. Run SELECT * FROM accounts; afterwards and you will see the original balances 50000, 20000 and 5000. In MySQL, with two separate statements, a failed statement does NOT automatically roll back the whole transaction, so your code (or a stored procedure handler) must call ROLLBACK, which then also undoes the first UPDATE."
    },
    {
      "title": "SAVEPOINT: Partial Rollback",
      "scenario": "Place an order and reduce stock, but undo only the stock change because the warehouse count needs rechecking.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "START TRANSACTION;\nINSERT INTO orders VALUES (11, 5, 3, 2, 3000, '2024-03-25', 'Pending');\nSAVEPOINT order_saved;\nUPDATE products SET stock = stock - 2 WHERE product_id = 3;\nROLLBACK TO SAVEPOINT order_saved;\nCOMMIT;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "BEGIN;\nINSERT INTO orders VALUES (11, 5, 3, 2, 3000, '2024-03-25', 'Pending');\nSAVEPOINT order_saved;\nUPDATE products SET stock = stock - 2 WHERE product_id = 3;\nROLLBACK TO order_saved;\nCOMMIT;\nSELECT order_id, customer_id, status FROM orders WHERE order_id = 11;\nSELECT product_id, name, stock FROM products WHERE product_id = 3;"
      },
      "result": "order_id | customer_id | status\n---------+-------------+--------\n11       | 5           | Pending\n(1 row)\n\nproduct_id | name     | stock\n-----------+----------+------\n3          | Keyboard | 150\n(1 row)",
      "explanation": "ROLLBACK TO the savepoint undid only the stock update (Keyboard stock is still 150), while the order insert before the savepoint was kept and committed. MySQL writes ROLLBACK TO SAVEPOINT name; SQLite accepts ROLLBACK TO name."
    },
    {
      "title": "Isolation Levels and Locking in MySQL (Two Sessions)",
      "scenario": "Two Workbench tabs act as two users. See READ COMMITTED vs REPEATABLE READ and a row lock with FOR UPDATE.",
      "steps": [
        "Open MySQL Workbench and open two SQL tabs (Session A and Session B) on the same database",
        "Run the statements in the time order shown, switching tabs",
        "Observe which value each SELECT returns",
        "Repeat with SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED in Session A"
      ],
      "code": "-- Session A                                   -- Session B\nSET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nSTART TRANSACTION;\nSELECT balance FROM accounts WHERE acc_id = 101; -- 50000\n                                                UPDATE accounts SET balance = 60000 WHERE acc_id = 101;\n                                                COMMIT;\nSELECT balance FROM accounts WHERE acc_id = 101; -- still 50000 (repeatable read)\nCOMMIT;\nSELECT balance FROM accounts WHERE acc_id = 101; -- now 60000\n\n-- Locking a row to avoid lost updates\nSTART TRANSACTION;\nSELECT balance FROM accounts WHERE acc_id = 102 FOR UPDATE;   -- row locked\n                                                UPDATE accounts SET balance = 0 WHERE acc_id = 102;\n                                                -- waits until A commits\nUPDATE accounts SET balance = balance - 1000 WHERE acc_id = 102;\nCOMMIT;                                         -- B continues now",
      "result": "Session A, REPEATABLE READ:\nfirst SELECT  -> 50000\nsecond SELECT -> 50000   (B's committed change is not visible inside A's snapshot)\nafter COMMIT  -> 60000\nWith READ COMMITTED the second SELECT returns 60000 (non-repeatable read).\nFOR UPDATE: Session B's UPDATE blocks until Session A commits.",
      "explanation": "This needs two concurrent connections, so it is shown for MySQL Workbench rather than the single-session SQL Lab. Under REPEATABLE READ, InnoDB gives a transaction a consistent snapshot from its first read. FOR UPDATE places an exclusive row lock so another session cannot change the row until COMMIT, preventing lost updates."
    }
  ],
  "interview": [
    {
      "q": "What is a transaction?",
      "a": "A logical unit of work containing one or more SQL statements that is executed completely or not at all.",
      "level": "Easy"
    },
    {
      "q": "Explain ACID properties.",
      "a": "Atomicity: all or nothing. Consistency: data moves between valid states respecting constraints. Isolation: concurrent transactions do not interfere. Durability: committed changes survive failures.",
      "level": "Medium"
    },
    {
      "q": "Difference between COMMIT and ROLLBACK?",
      "a": "COMMIT makes all changes of the current transaction permanent and visible to others. ROLLBACK discards all changes since the transaction started (or since a savepoint with ROLLBACK TO).",
      "level": "Easy"
    },
    {
      "q": "What is a SAVEPOINT?",
      "a": "A named point inside a transaction to which you can roll back partially without undoing the entire transaction.",
      "level": "Easy"
    },
    {
      "q": "What is autocommit in MySQL?",
      "a": "A mode (on by default) where each statement is committed immediately. START TRANSACTION or SET autocommit = 0 groups statements until COMMIT/ROLLBACK.",
      "level": "Easy"
    },
    {
      "q": "Can you roll back a TRUNCATE or DROP in MySQL?",
      "a": "No. DDL statements cause an implicit commit, so they cannot be rolled back.",
      "level": "Medium"
    },
    {
      "q": "Explain dirty read, non-repeatable read and phantom read.",
      "a": "Dirty: reading uncommitted changes of another transaction. Non-repeatable: the same row read twice returns different values due to another committed update. Phantom: the same range query returns new rows due to another committed insert.",
      "level": "Medium"
    },
    {
      "q": "What are the isolation levels and MySQL's default?",
      "a": "READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE. InnoDB's default is REPEATABLE READ.",
      "level": "Medium"
    },
    {
      "q": "Which anomalies does each isolation level prevent?",
      "a": "READ UNCOMMITTED: none. READ COMMITTED: dirty reads. REPEATABLE READ: dirty + non-repeatable (InnoDB also prevents most phantoms with next-key locking). SERIALIZABLE: all.",
      "level": "Hard"
    },
    {
      "q": "What is MVCC?",
      "a": "Multi-Version Concurrency Control: the database keeps older versions of rows (InnoDB undo logs) so readers see a consistent snapshot without blocking writers.",
      "level": "Hard"
    },
    {
      "q": "What is a deadlock and how do you handle it?",
      "a": "Two transactions each wait for a lock held by the other. InnoDB detects it and rolls back one with error 1213. Prevent by short transactions, consistent lock order, proper indexes; handle by retrying the transaction.",
      "level": "Hard"
    },
    {
      "q": "What does SELECT ... FOR UPDATE do?",
      "a": "Reads rows and places exclusive locks on them until the transaction ends, preventing other transactions from updating them (used to avoid lost updates, e.g. seat booking, stock decrement).",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Write a transaction that moves 2,000 from Sara (102) to John (103) and commits, then shows all balances.",
      "hint": "BEGIN / two UPDATEs / COMMIT. Use the accounts table from the examples (create it first).",
      "solution": "CREATE TABLE accounts (\n  acc_id  INTEGER PRIMARY KEY,\n  holder  VARCHAR(50) NOT NULL,\n  balance DECIMAL(12,2) NOT NULL CHECK (balance >= 0)\n);\nINSERT INTO accounts VALUES (101, 'Amit Kumar', 50000), (102, 'Sara Khan', 20000), (103, 'John Dsouza', 5000);\nBEGIN;\nUPDATE accounts SET balance = balance - 2000 WHERE acc_id = 102;\nUPDATE accounts SET balance = balance + 2000 WHERE acc_id = 103;\nCOMMIT;\nSELECT * FROM accounts;"
    },
    {
      "task": "Start a transaction, delete all orders, check the count, then roll back and check again.",
      "hint": "COUNT(*) before and after ROLLBACK.",
      "solution": "BEGIN;\nDELETE FROM orders;\nSELECT COUNT(*) AS during FROM orders;\nROLLBACK;\nSELECT COUNT(*) AS after_rollback FROM orders;"
    },
    {
      "task": "Use a savepoint: insert a new customer, set a savepoint, insert a second customer, roll back to the savepoint, commit.",
      "hint": "Only the first customer should remain.",
      "solution": "BEGIN;\nINSERT INTO customers (name, city) VALUES ('First New', 'Pune');\nSAVEPOINT sp1;\nINSERT INTO customers (name, city) VALUES ('Second New', 'Goa');\nROLLBACK TO sp1;\nCOMMIT;\nSELECT customer_id, name FROM customers WHERE customer_id > 6;"
    },
    {
      "task": "Write the MySQL commands to check the current isolation level and switch the session to READ COMMITTED.",
      "hint": "@@transaction_isolation and SET SESSION TRANSACTION ISOLATION LEVEL.",
      "solution": "SELECT @@transaction_isolation;\nSET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;"
    }
  ],
  "quiz": [
    {
      "question": "Which ACID property guarantees that committed data survives a crash?",
      "options": [
        "Atomicity",
        "Consistency",
        "Isolation",
        "Durability"
      ],
      "answer": 3,
      "explanation": "Durability = committed changes are permanent."
    },
    {
      "question": "What is the default isolation level of MySQL InnoDB?",
      "options": [
        "READ COMMITTED",
        "REPEATABLE READ",
        "SERIALIZABLE",
        "READ UNCOMMITTED"
      ],
      "answer": 1,
      "explanation": "InnoDB defaults to REPEATABLE READ."
    },
    {
      "question": "Reading another transaction's uncommitted change is called a:",
      "options": [
        "Dirty read",
        "Phantom read",
        "Lost update",
        "Deadlock"
      ],
      "answer": 0,
      "explanation": "Dirty read = reading uncommitted data."
    },
    {
      "question": "Which statement undoes changes back to a named point?",
      "options": [
        "UNDO name",
        "COMMIT TO name",
        "ROLLBACK TO SAVEPOINT name",
        "RESET name"
      ],
      "answer": 2,
      "explanation": "ROLLBACK TO SAVEPOINT keeps earlier work."
    },
    {
      "question": "Which statement causes an implicit commit in MySQL?",
      "options": [
        "UPDATE",
        "SELECT",
        "INSERT",
        "ALTER TABLE"
      ],
      "answer": 3,
      "explanation": "DDL statements commit implicitly."
    }
  ]
};
