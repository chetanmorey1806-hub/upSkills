export default {
  "id": "day-01-introduction-to-databases",
  "title": "Introduction to Databases, DBMS vs RDBMS, MySQL Installation, MySQL Workbench",
  "module": "Module 1: SQL Basics",
  "day": 1,
  "level": "Beginner",
  "duration": "2 hours",
  "summary": "Learn what a database is, how DBMS and RDBMS differ, how tables, rows and keys organise data, and how to install MySQL 8 and run your first queries in MySQL Workbench.",
  "objectives": [
    "Explain what data, a database and a DBMS are with real-world examples",
    "Compare DBMS and RDBMS and name popular RDBMS products",
    "Describe tables, rows, columns, primary keys and foreign keys",
    "Install MySQL 8 Server and MySQL Workbench and connect to a local server",
    "Run your first SQL statements: CREATE DATABASE, USE, SHOW TABLES and SELECT"
  ],
  "theory": [
    {
      "heading": "What is Data and What is a Database?",
      "content": "Data is raw facts: a name, a phone number, a price, a date. A database is an organised collection of related data stored so that it can be searched, updated and protected easily. Think of a college office: earlier they kept student records in paper registers. Finding one student meant turning many pages. A database is like a super-fast digital register that can find one student among a million in milliseconds, and many staff members can use it at the same time without tearing pages.",
      "points": [
        "Data = raw facts (Asha, 95000, 2018-03-15)",
        "Information = processed data that gives meaning (Asha earns the highest salary in IT)",
        "Database = organised, related data stored electronically",
        "Examples: bank accounts, railway reservations, Amazon orders, Instagram users"
      ]
    },
    {
      "heading": "DBMS: Database Management System",
      "content": "A DBMS is the software that sits between you and the stored data. You never open the data files directly; you ask the DBMS using a language (SQL) and it reads or writes the files for you. It also takes care of security (who can see what), backup, concurrency (many users at once) and recovery after a crash. Analogy: the DBMS is the librarian. You ask for a book; the librarian knows the shelf, checks your library card, and records who borrowed it.",
      "points": [
        "Stores, retrieves, updates and deletes data",
        "Controls access with users and permissions",
        "Handles many users at the same time (concurrency)",
        "Provides backup and recovery",
        "Examples of simple DBMS: file systems, Microsoft Access, early dBASE"
      ]
    },
    {
      "heading": "RDBMS: Relational DBMS",
      "content": "An RDBMS stores data in tables (relations) made of rows and columns, and links tables using keys. It was based on E. F. Codd's relational model (1970). Every row in a table is uniquely identified by a primary key, and a foreign key in one table points to the primary key of another table. This avoids repeating data. For example, instead of writing the department name \"IT\" in every employee row, we store dept_id = 2 and keep the name once in the departments table.",
      "points": [
        "Table (relation): a grid of rows and columns, e.g. employees",
        "Row (record / tuple): one employee",
        "Column (field / attribute): name, salary, hire_date",
        "Primary key: uniquely identifies a row (emp_id)",
        "Foreign key: refers to a primary key in another table (employees.dept_id -> departments.dept_id)",
        "Popular RDBMS: MySQL, PostgreSQL, Oracle, SQL Server, SQLite, MariaDB"
      ]
    },
    {
      "heading": "DBMS vs RDBMS (Interview Favourite)",
      "content": "Every RDBMS is a DBMS, but not every DBMS is relational. The key differences are how data is stored and whether relationships and constraints are enforced.",
      "points": [
        "Storage: DBMS may store data as files or hierarchies; RDBMS stores data in related tables",
        "Relationships: DBMS has no enforced relationships; RDBMS uses primary and foreign keys",
        "Normalization: not supported in DBMS; supported in RDBMS to reduce duplicate data",
        "Users: DBMS usually single user, small data; RDBMS supports many users and huge data",
        "ACID transactions and integrity constraints are standard in RDBMS",
        "Examples: DBMS - file system, XML store; RDBMS - MySQL, Oracle, PostgreSQL"
      ],
      "tip": "NoSQL databases (MongoDB, Redis, Cassandra) are non-relational. They store documents or key-value pairs and are used for very flexible or very large-scale data. In interviews, mention them as the other big family."
    },
    {
      "heading": "What is SQL? Categories of SQL Commands",
      "content": "SQL (Structured Query Language, pronounced \"sequel\" or \"S-Q-L\") is the standard language to talk to relational databases. It is declarative: you say WHAT you want, not HOW to fetch it. The same SQL mostly works on MySQL, PostgreSQL, SQL Server and SQLite with small differences (called dialects). SQL keywords are case-insensitive, but writing them in CAPITALS is a good habit.",
      "syntax": "SELECT column1, column2\nFROM table_name\nWHERE condition;",
      "points": [
        "DDL (Data Definition Language): CREATE, ALTER, DROP, TRUNCATE, RENAME",
        "DML (Data Manipulation Language): INSERT, UPDATE, DELETE",
        "DQL (Data Query Language): SELECT",
        "DCL (Data Control Language): GRANT, REVOKE",
        "TCL (Transaction Control Language): COMMIT, ROLLBACK, SAVEPOINT"
      ]
    },
    {
      "heading": "Installing MySQL 8 and MySQL Workbench",
      "content": "MySQL is a free, open-source RDBMS owned by Oracle, used by Facebook, YouTube, Uber and most PHP/Python web apps. MySQL Server is the engine that stores data; MySQL Workbench is a GUI tool to write queries and design tables. On Windows use the MySQL Installer (choose \"Developer Default\" or \"Server only\" + Workbench). On macOS use the DMG installer or Homebrew. On Ubuntu use apt. During setup you set a password for the root user; remember it.",
      "syntax": "mysql -u root -p\nCREATE DATABASE company_db;\nUSE company_db;\nSHOW DATABASES;\nSHOW TABLES;",
      "points": [
        "Windows: download MySQL Installer from dev.mysql.com -> choose Server + Workbench -> set root password -> keep port 3306",
        "macOS: brew install mysql && brew services start mysql, then install Workbench DMG",
        "Ubuntu: sudo apt install mysql-server, then sudo mysql_secure_installation",
        "Check version: mysql --version, or SELECT VERSION(); inside MySQL",
        "Workbench: + next to \"MySQL Connections\" -> hostname 127.0.0.1, port 3306, user root -> Test Connection",
        "In Workbench, run the current statement with Ctrl+Enter, all statements with Ctrl+Shift+Enter"
      ],
      "tip": "In this course the in-browser SQL Lab uses SQLite, a tiny RDBMS that runs inside your browser. Almost all SELECT queries are the same in MySQL and SQLite. Where MySQL is different, the lesson shows both."
    }
  ],
  "examples": [
    {
      "title": "Your First SELECT: Look at a Table",
      "scenario": "You joined a company as a data analyst. Your manager says: \"Show me the departments we have.\"",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT * FROM departments;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT * FROM departments;"
      },
      "result": "dept_id | dept_name | location\n--------+-----------+----------\n1       | Sales     | Mumbai\n2       | IT        | Bengaluru\n3       | HR        | Pune\n4       | Finance   | Mumbai\n5       | Marketing | Delhi\n(5 rows)",
      "explanation": "SELECT * means \"all columns\". FROM departments tells the database which table to read. The result is a grid of 5 rows and 3 columns: each row is one department. dept_id is the primary key, so no two rows share the same dept_id."
    },
    {
      "title": "Creating a Database and a Table in MySQL",
      "scenario": "Before storing data you need a database (a container) and a table (the structure). This is how you do it in MySQL Workbench.",
      "steps": [
        "Open MySQL Workbench and click your Local instance connection",
        "Type the script in a new SQL tab",
        "Press Ctrl+Shift+Enter to run all statements",
        "Refresh the Schemas panel to see company_db -> Tables -> students",
        "In the SQL Lab, CREATE DATABASE/USE are not needed: just run setup then the SELECT"
      ],
      "code": "-- MySQL 8 (run in Workbench)\nCREATE DATABASE company_db;\nUSE company_db;\n\nCREATE TABLE students (\n  student_id INT PRIMARY KEY,\n  name       VARCHAR(50) NOT NULL,\n  course     VARCHAR(30)\n);\n\nINSERT INTO students VALUES (1, 'Asha', 'SQL'), (2, 'Rahul', 'Python');\nSELECT * FROM students;",
      "sql": {
        "setup": "CREATE TABLE students (\n  student_id INT PRIMARY KEY,\n  name       VARCHAR(50) NOT NULL,\n  course     VARCHAR(30)\n);\nINSERT INTO students VALUES (1, 'Asha', 'SQL'), (2, 'Rahul', 'Python');",
        "query": "SELECT * FROM students;"
      },
      "result": "student_id | name  | course\n-----------+-------+-------\n1          | Asha  | SQL\n2          | Rahul | Python\n(2 rows)",
      "explanation": "CREATE DATABASE makes an empty container, USE selects it, CREATE TABLE defines columns and their types, INSERT adds rows, and SELECT reads them back. SQLite has no CREATE DATABASE or USE (one file = one database), so the SQL Lab version starts from CREATE TABLE."
    },
    {
      "title": "Selecting Specific Columns",
      "scenario": "HR wants only the name and salary of every employee, not the email or city.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT name, salary FROM employees;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT name, salary FROM employees;"
      },
      "result": "name         | salary\n-------------+-------\nAsha Rao     | 95000\nRahul Mehta  | 72000\nPriya Shah   | 85000\nVikram Singh | 55000\nNeha Gupta   | 60000\nArjun Nair   | 68000\nSneha Iyer   | 78000\nKaran Patel  | 40000\nMeera Joshi  | 52000\n(9 rows)",
      "explanation": "List the columns you need, separated by commas. Selecting only needed columns is faster and is a best practice in real projects (avoid SELECT * in production code)."
    },
    {
      "title": "Seeing a Relationship Between Two Tables",
      "scenario": "Employees store dept_id, not the department name. Let us peek at how the foreign key links two tables (joins are covered fully on Day 6).",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT e.name, e.dept_id, d.dept_name\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nWHERE e.dept_id = 2;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT e.name, e.dept_id, d.dept_name\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nWHERE e.dept_id = 2;"
      },
      "result": "name        | dept_id | dept_name\n------------+---------+----------\nAsha Rao    | 2       | IT\nRahul Mehta | 2       | IT\nArjun Nair  | 2       | IT\n(3 rows)",
      "explanation": "employees.dept_id is a foreign key that points to departments.dept_id. Matching them tells us that dept_id 2 means IT. This is the heart of an RDBMS: data is stored once and connected through keys."
    },
    {
      "title": "Checking the Server Version and Listing Tables",
      "scenario": "After installation you want to confirm which MySQL version is running and what tables exist.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- MySQL\nSELECT VERSION();\nSHOW DATABASES;\nUSE company_db;\nSHOW TABLES;\nDESCRIBE employees;",
      "sql": {
        "setup": "CREATE TABLE departments (\n  dept_id INTEGER PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  location VARCHAR(50)\n);\nCREATE TABLE employees (\n  emp_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  dept_id INTEGER,\n  manager_id INTEGER,\n  salary DECIMAL(10,2),\n  hire_date DATE,\n  email VARCHAR(100),\n  city VARCHAR(50),\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nCREATE TABLE customers (\n  customer_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  city VARCHAR(50),\n  email VARCHAR(100),\n  joined_on DATE\n);\nCREATE TABLE products (\n  product_id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  category VARCHAR(30),\n  price DECIMAL(10,2),\n  stock INTEGER\n);\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  product_id INTEGER,\n  quantity INTEGER,\n  amount DECIMAL(10,2),\n  order_date DATE,\n  status VARCHAR(20),\n  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n  FOREIGN KEY (product_id) REFERENCES products(product_id)\n);\nINSERT INTO departments VALUES\n (1,'Sales','Mumbai'),(2,'IT','Bengaluru'),(3,'HR','Pune'),(4,'Finance','Mumbai'),(5,'Marketing','Delhi');\nINSERT INTO employees VALUES\n (1,'Asha Rao',2,NULL,95000,'2018-03-15','asha@corp.com','Bengaluru'),\n (2,'Rahul Mehta',2,1,72000,'2020-07-01','rahul@corp.com','Bengaluru'),\n (3,'Priya Shah',1,NULL,85000,'2019-01-10','priya@corp.com','Mumbai'),\n (4,'Vikram Singh',1,3,55000,'2021-11-20','vikram@corp.com','Mumbai'),\n (5,'Neha Gupta',3,NULL,60000,'2017-05-25','neha@corp.com','Pune'),\n (6,'Arjun Nair',2,1,68000,'2022-02-14','arjun@corp.com','Chennai'),\n (7,'Sneha Iyer',4,NULL,78000,'2019-09-30','sneha@corp.com','Mumbai'),\n (8,'Karan Patel',NULL,3,40000,'2023-06-05','karan@corp.com','Delhi'),\n (9,'Meera Joshi',1,3,52000,'2023-01-16',NULL,'Pune');\nINSERT INTO customers VALUES\n (1,'Amit Kumar','Mumbai','amit@mail.com','2023-01-10'),\n (2,'Sara Khan','Delhi','sara@mail.com','2023-03-22'),\n (3,'John Dsouza','Goa',NULL,'2023-06-15'),\n (4,'Pooja Verma','Pune','pooja@mail.com','2023-08-01'),\n (5,'Ravi Teja','Hyderabad','ravi@mail.com','2023-11-11'),\n (6,'Divya Menon','Bengaluru','divya@mail.com','2024-01-02');\nINSERT INTO products VALUES\n (1,'Laptop','Electronics',55000,10),(2,'Mouse','Electronics',500,200),\n (3,'Keyboard','Electronics',1500,150),(4,'Office Chair','Furniture',7000,25),\n (5,'Desk','Furniture',12000,8),(6,'Notebook','Stationery',50,1000),\n (7,'Pen','Stationery',20,5000),(8,'Monitor','Electronics',9000,0);\nINSERT INTO orders VALUES\n (1,1,1,1,55000,'2024-01-05','Delivered'),\n (2,1,2,2,1000,'2024-01-05','Delivered'),\n (3,2,4,1,7000,'2024-01-18','Shipped'),\n (4,3,6,10,500,'2024-02-02','Delivered'),\n (5,4,1,1,55000,'2024-02-14','Cancelled'),\n (6,2,3,1,1500,'2024-02-20','Delivered'),\n (7,6,5,1,12000,'2024-03-01','Pending'),\n (8,1,7,20,400,'2024-03-10','Delivered'),\n (9,3,2,1,500,'2024-03-15','Shipped'),\n (10,6,1,2,110000,'2024-03-22','Delivered');",
        "query": "SELECT sqlite_version() AS version;\nSELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;"
      },
      "result": "version\n-------\n3.45.1\n(1 row)\n\nname\n-----------\ncustomers\ndepartments\nemployees\norders\nproducts\n(5 rows)",
      "explanation": "In MySQL, VERSION() returns the server version (for example 8.0.36), SHOW TABLES lists tables and DESCRIBE shows column definitions. SQLite has no SHOW command; its table list lives in the special sqlite_master table, and its version comes from sqlite_version(). The SQL Lab result above is from SQLite."
    }
  ],
  "interview": [
    {
      "q": "What is a database?",
      "a": "A database is an organised collection of related data stored electronically so that it can be easily accessed, managed and updated. Example: a bank database storing customers, accounts and transactions.",
      "level": "Easy"
    },
    {
      "q": "What is a DBMS?",
      "a": "A Database Management System is software that lets users create, read, update and delete data in a database while handling security, concurrency, backup and recovery. Examples: MySQL, Oracle, MS Access.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between DBMS and RDBMS?",
      "a": "A DBMS stores data in any form (files, hierarchies) with no enforced relationships, usually for small single-user data. An RDBMS stores data in tables linked by primary and foreign keys, supports normalization, constraints, ACID transactions and many concurrent users. Every RDBMS is a DBMS, not vice versa.",
      "level": "Medium"
    },
    {
      "q": "What is SQL? Is it case-sensitive?",
      "a": "SQL is the Structured Query Language used to define, manipulate and query relational data. Keywords are not case-sensitive (select = SELECT). Table names may be case-sensitive in MySQL on Linux because tables map to files, and string comparisons depend on the collation.",
      "level": "Medium"
    },
    {
      "q": "Name the categories of SQL commands.",
      "a": "DDL (CREATE, ALTER, DROP, TRUNCATE), DML (INSERT, UPDATE, DELETE), DQL (SELECT), DCL (GRANT, REVOKE) and TCL (COMMIT, ROLLBACK, SAVEPOINT).",
      "level": "Easy"
    },
    {
      "q": "What is a primary key?",
      "a": "A column (or set of columns) that uniquely identifies each row. It cannot be NULL and cannot repeat. A table can have only one primary key.",
      "level": "Easy"
    },
    {
      "q": "What is a foreign key?",
      "a": "A column in one table that refers to the primary key of another table. It enforces referential integrity: you cannot insert an employee with dept_id 99 if department 99 does not exist.",
      "level": "Easy"
    },
    {
      "q": "What is the difference between MySQL and SQL?",
      "a": "SQL is a language. MySQL is an RDBMS software product that understands SQL. Similarly PostgreSQL, Oracle and SQL Server are other products that use SQL.",
      "level": "Easy"
    },
    {
      "q": "What is MySQL Workbench?",
      "a": "A free GUI tool from Oracle for MySQL. It lets you write and run SQL, design tables visually (EER diagrams), manage users, import/export data and monitor the server.",
      "level": "Easy"
    },
    {
      "q": "What is the default port of MySQL?",
      "a": "3306. (PostgreSQL uses 5432, SQL Server uses 1433.)",
      "level": "Easy"
    },
    {
      "q": "What is the difference between SQL and NoSQL databases?",
      "a": "SQL databases are relational, use fixed schemas and tables, and support joins and ACID transactions (MySQL, PostgreSQL). NoSQL databases are non-relational, use flexible formats like documents or key-value pairs, and scale horizontally easily (MongoDB, Redis, Cassandra).",
      "level": "Medium"
    },
    {
      "q": "What is a tuple and an attribute in RDBMS terms?",
      "a": "A tuple is a row (one record). An attribute is a column (one property). A relation is the table itself. The number of columns is called the degree and the number of rows is called the cardinality.",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "Show all rows and columns of the products table.",
      "hint": "Use SELECT * FROM ...",
      "solution": "SELECT * FROM products;"
    },
    {
      "task": "Show only the name and city of every customer.",
      "hint": "List the two columns after SELECT.",
      "solution": "SELECT name, city FROM customers;"
    },
    {
      "task": "Show the order_id, order_date and status of all orders.",
      "hint": "Three columns from the orders table.",
      "solution": "SELECT order_id, order_date, status FROM orders;"
    },
    {
      "task": "In MySQL, write the commands to create a database named shop_db, select it, and list its tables.",
      "hint": "CREATE DATABASE, USE, SHOW TABLES.",
      "solution": "CREATE DATABASE shop_db;\nUSE shop_db;\nSHOW TABLES;"
    },
    {
      "task": "Identify the primary key of each of the 5 sample tables and the foreign keys in the orders table.",
      "hint": "Look at the CREATE TABLE statements in the setup script.",
      "solution": "-- Primary keys: departments.dept_id, employees.emp_id, customers.customer_id,\n--               products.product_id, orders.order_id\n-- Foreign keys in orders: customer_id -> customers(customer_id),\n--                         product_id  -> products(product_id)\nSELECT order_id, customer_id, product_id FROM orders;"
    }
  ],
  "quiz": [
    {
      "question": "Which of these is an RDBMS?",
      "options": [
        "MongoDB",
        "MySQL",
        "Redis",
        "Microsoft Excel"
      ],
      "answer": 1,
      "explanation": "MySQL stores data in related tables. MongoDB and Redis are NoSQL; Excel is a spreadsheet."
    },
    {
      "question": "SELECT belongs to which SQL category?",
      "options": [
        "DDL",
        "DML",
        "DQL",
        "DCL"
      ],
      "answer": 2,
      "explanation": "SELECT is the Data Query Language command."
    },
    {
      "question": "What is the default port for MySQL Server?",
      "options": [
        "1433",
        "5432",
        "8080",
        "3306"
      ],
      "answer": 3,
      "explanation": "MySQL listens on 3306 by default."
    },
    {
      "question": "A column that refers to the primary key of another table is called a:",
      "options": [
        "Foreign key",
        "Candidate key",
        "Super key",
        "Index"
      ],
      "answer": 0,
      "explanation": "A foreign key links a row to a row in another table."
    },
    {
      "question": "Which statement selects a database to work with in MySQL?",
      "options": [
        "OPEN db;",
        "USE db;",
        "SELECT db;",
        "CONNECT db;"
      ],
      "answer": 1,
      "explanation": "USE database_name; makes it the current database."
    }
  ]
};
