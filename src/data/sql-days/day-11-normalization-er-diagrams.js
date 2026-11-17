export default {
  "id": "day-11-normalization-er-diagrams",
  "title": "Normalization (1NF, 2NF, 3NF, BCNF), ER Diagrams",
  "module": "Module 3: Advanced SQL",
  "day": 11,
  "level": "Advanced",
  "duration": "2.5 hours",
  "summary": "Design clean databases: spot insert, update and delete anomalies, normalise tables step by step through 1NF, 2NF, 3NF and BCNF, and model entities and relationships with ER diagrams.",
  "objectives": [
    "Explain data redundancy and the three anomalies (insert, update, delete)",
    "Understand functional dependency and candidate, super and composite keys",
    "Apply 1NF, 2NF, 3NF and BCNF to a messy table",
    "Draw ER diagrams with entities, attributes, relationships and cardinality (1:1, 1:N, M:N)",
    "Convert an ER diagram into tables, including junction tables for M:N, and know when to denormalise"
  ],
  "theory": [
    {
      "heading": "Why Normalise? Redundancy and Anomalies",
      "content": "Imagine a single Excel sheet where every order row repeats the customer name, city and phone. If Amit changes his city, you must update 50 rows; miss one and the data contradicts itself. Normalization is the process of organising tables to reduce duplicate data and avoid such problems, by splitting big tables into smaller related tables connected by keys.",
      "points": [
        "Update anomaly: same fact stored in many rows; updating one and not the others creates inconsistency",
        "Insert anomaly: you cannot store a fact without an unrelated fact (cannot add a new product until someone orders it)",
        "Delete anomaly: deleting one fact accidentally deletes another (deleting the only order of a customer removes the customer's details)",
        "Goal: each fact stored once, in the right place"
      ]
    },
    {
      "heading": "Keys and Functional Dependency",
      "content": "A functional dependency A -> B means \"if you know A you know exactly one B\". emp_id -> name: an employee id determines the name. Normal forms are rules about which dependencies are allowed.",
      "points": [
        "Super key: any set of columns that uniquely identifies a row (emp_id, or emp_id + name)",
        "Candidate key: a minimal super key (emp_id; email could also be one)",
        "Primary key: the candidate key chosen to identify rows",
        "Composite key: a key with more than one column (order_id, product_id)",
        "Prime attribute: a column that is part of some candidate key",
        "Partial dependency: a non-key column depends on only PART of a composite key",
        "Transitive dependency: A -> B -> C, where B is not a key (emp_id -> dept_id -> dept_name)"
      ]
    },
    {
      "heading": "1NF and 2NF",
      "content": "First Normal Form (1NF): every column holds atomic (single, indivisible) values, there are no repeating groups like product1, product2, product3, and each row is unique. \"Laptop, Mouse\" in one cell breaks 1NF. Second Normal Form (2NF): the table is in 1NF and every non-key column depends on the WHOLE primary key, not part of it. This matters only for composite keys.",
      "points": [
        "1NF fix: one value per cell, one row per order item",
        "2NF example: in order_items(order_id, product_id, quantity, product_name), product_name depends only on product_id (part of the key) -> move it to products",
        "A table with a single-column primary key in 1NF is automatically in 2NF"
      ]
    },
    {
      "heading": "3NF and BCNF",
      "content": "Third Normal Form (3NF): in 2NF and no transitive dependency; non-key columns depend ONLY on the key. In employees(emp_id, name, dept_id, dept_name), dept_name depends on dept_id, not on emp_id, so move it to departments. Boyce-Codd Normal Form (BCNF) is a stricter 3NF: for every dependency X -> Y, X must be a super key.",
      "points": [
        "Easy memory line: \"Every non-key column must depend on the key (1NF), the whole key (2NF), and nothing but the key (3NF), so help me Codd\"",
        "BCNF example: a table (student, subject, teacher) where each teacher teaches one subject: teacher -> subject but teacher is not a key, so split into (teacher, subject) and (student, teacher)",
        "4NF and 5NF deal with multi-valued and join dependencies; rarely asked for freshers",
        "Most production schemas aim for 3NF"
      ]
    },
    {
      "heading": "ER Diagrams",
      "content": "An Entity-Relationship (ER) diagram is the blueprint of a database, drawn before writing CREATE TABLE. Entities are things (Customer, Order, Product), attributes are their properties, and relationships connect them with a cardinality. In MySQL Workbench: File -> New Model -> Add Diagram, drag tables, draw relationships, then Database -> Forward Engineer to generate SQL. Database -> Reverse Engineer creates a diagram from an existing database.",
      "syntax": "CUSTOMER ||--o{ ORDER       : places\nORDER    ||--|{ ORDER_ITEM  : contains\nPRODUCT  ||--o{ ORDER_ITEM  : \"appears in\"\nDEPARTMENT ||--o{ EMPLOYEE  : employs\nEMPLOYEE |o--o{ EMPLOYEE    : manages",
      "points": [
        "Entity = rectangle (Chen notation); attribute = ellipse; relationship = diamond",
        "Primary key attributes are underlined; multi-valued attributes use double ellipses; derived attributes (age from DOB) use dashed ellipses",
        "Crow's foot notation (used by Workbench): | = one, crow's foot = many, O = optional",
        "1:1 - person and passport; 1:N - department and employees; M:N - students and courses",
        "Weak entity: cannot exist without a parent (order_item without order), drawn with double rectangles"
      ]
    },
    {
      "heading": "Converting ER to Tables, and Denormalisation",
      "content": "Rules: each entity becomes a table; 1:N puts a foreign key on the \"many\" side (employees.dept_id); 1:1 puts a unique foreign key on either side; M:N needs a junction (bridge) table with two foreign keys (order_items, enrollments). Denormalisation is the deliberate opposite: adding redundant data (like a stored order_total) to make reads faster in reporting systems and data warehouses, accepting extra update work.",
      "tip": "Interview tip: say \"OLTP systems (banking, e-commerce) are normalised to 3NF for consistent writes; OLAP / data warehouses (Power BI star schema) are denormalised for fast reads\"."
    }
  ],
  "examples": [
    {
      "title": "Spotting a Non-Normalised Table",
      "scenario": "An intern stored orders in a single flat table. Find the problems.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT * FROM order_flat;",
      "sql": {
        "setup": "CREATE TABLE order_flat (\n  order_id      INTEGER,\n  order_date    DATE,\n  customer_name VARCHAR(50),\n  customer_city VARCHAR(50),\n  products      VARCHAR(200)\n);\nINSERT INTO order_flat VALUES\n (1, '2024-01-05', 'Amit Kumar', 'Mumbai', 'Laptop, Mouse'),\n (2, '2024-01-18', 'Sara Khan',  'Delhi',  'Office Chair'),\n (3, '2024-02-20', 'Amit Kumar', 'Mumbai', 'Pen, Notebook, Mouse');",
        "query": "SELECT * FROM order_flat;"
      },
      "result": "order_id | order_date | customer_name | customer_city | products\n---------+------------+---------------+---------------+---------------------\n1        | 2024-01-05 | Amit Kumar    | Mumbai        | Laptop, Mouse\n2        | 2024-01-18 | Sara Khan     | Delhi         | Office Chair\n3        | 2024-02-20 | Amit Kumar    | Mumbai        | Pen, Notebook, Mouse\n(3 rows)",
      "explanation": "The products column holds lists (\"Laptop, Mouse\"), breaking 1NF; you cannot easily count how many orders contain Mouse. Amit's name and city repeat in two rows (update anomaly). A product that has never been ordered cannot be stored at all (insert anomaly), and deleting order 2 would erase Sara Khan completely (delete anomaly)."
    },
    {
      "title": "Why Lists in a Cell Hurt: Counting Mice",
      "scenario": "Finance asks \"How many orders contain a Mouse?\" Compare the flat table with the normalised design.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT COUNT(*) AS flat_guess FROM order_flat WHERE products LIKE '%Mouse%';\nSELECT COUNT(DISTINCT oi.order_id) AS normalised_answer\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nWHERE p.name = 'Mouse';",
      "sql": {
        "setup": "CREATE TABLE order_flat (\n  order_id      INTEGER,\n  order_date    DATE,\n  customer_name VARCHAR(50),\n  customer_city VARCHAR(50),\n  products      VARCHAR(200)\n);\nINSERT INTO order_flat VALUES\n (1, '2024-01-05', 'Amit Kumar', 'Mumbai', 'Laptop, Mouse'),\n (2, '2024-01-18', 'Sara Khan',  'Delhi',  'Office Chair'),\n (3, '2024-02-20', 'Amit Kumar', 'Mumbai', 'Pen, Notebook, Mouse');\nCREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name VARCHAR(50), city VARCHAR(50));\nCREATE TABLE products  (product_id INTEGER PRIMARY KEY, name VARCHAR(50), price DECIMAL(10,2));\nCREATE TABLE orders    (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), order_date DATE);\nCREATE TABLE order_items (\n  order_id   INTEGER REFERENCES orders(order_id),\n  product_id INTEGER REFERENCES products(product_id),\n  quantity   INTEGER,\n  PRIMARY KEY (order_id, product_id)\n);\nINSERT INTO customers VALUES (1, 'Amit Kumar', 'Mumbai'), (2, 'Sara Khan', 'Delhi');\nINSERT INTO products VALUES (1, 'Laptop', 55000), (2, 'Mouse', 500), (3, 'Office Chair', 7000), (4, 'Pen', 20), (5, 'Notebook', 50);\nINSERT INTO orders VALUES (1, 1, '2024-01-05'), (2, 2, '2024-01-18'), (3, 1, '2024-02-20');\nINSERT INTO order_items VALUES (1, 1, 1), (1, 2, 2), (2, 3, 1), (3, 4, 20), (3, 5, 10), (3, 2, 1);",
        "query": "SELECT COUNT(*) AS flat_guess FROM order_flat WHERE products LIKE '%Mouse%';\nSELECT COUNT(DISTINCT oi.order_id) AS normalised_answer\nFROM order_items oi JOIN products p ON p.product_id = oi.product_id\nWHERE p.name = 'Mouse';"
      },
      "result": "flat_guess\n----------\n2\n(1 row)\n\nnormalised_answer\n-----------------\n2\n(1 row)",
      "explanation": "Both give 2 here, but the flat version depends on a fragile LIKE text search (it would also match \"Mouse Pad\" and cannot hold a quantity per product). The normalised version uses exact keys, can be indexed and stores quantity per item."
    },
    {
      "title": "Normalised Schema (3NF) and Rebuilding the Report with Joins",
      "scenario": "Split the flat table into customers, products, orders and order_items, then rebuild the original view with joins.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "CREATE TABLE customers (customer_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50), city VARCHAR(50));\nCREATE TABLE products  (product_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50), price DECIMAL(10,2));\nCREATE TABLE orders    (order_id INT AUTO_INCREMENT PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), order_date DATE);\nCREATE TABLE order_items (\n  order_id   INTEGER REFERENCES orders(order_id),\n  product_id INTEGER REFERENCES products(product_id),\n  quantity   INTEGER,\n  PRIMARY KEY (order_id, product_id)\n);\nINSERT INTO customers VALUES (1, 'Amit Kumar', 'Mumbai'), (2, 'Sara Khan', 'Delhi');\nINSERT INTO products VALUES (1, 'Laptop', 55000), (2, 'Mouse', 500), (3, 'Office Chair', 7000), (4, 'Pen', 20), (5, 'Notebook', 50);\nINSERT INTO orders VALUES (1, 1, '2024-01-05'), (2, 2, '2024-01-18'), (3, 1, '2024-02-20');\nINSERT INTO order_items VALUES (1, 1, 1), (1, 2, 2), (2, 3, 1), (3, 4, 20), (3, 5, 10), (3, 2, 1);\n\nSELECT o.order_id, o.order_date, c.name AS customer, c.city,\n       GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS products\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nGROUP BY o.order_id, o.order_date, c.name, c.city\nORDER BY o.order_id;",
      "sql": {
        "setup": "CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name VARCHAR(50), city VARCHAR(50));\nCREATE TABLE products  (product_id INTEGER PRIMARY KEY, name VARCHAR(50), price DECIMAL(10,2));\nCREATE TABLE orders    (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), order_date DATE);\nCREATE TABLE order_items (\n  order_id   INTEGER REFERENCES orders(order_id),\n  product_id INTEGER REFERENCES products(product_id),\n  quantity   INTEGER,\n  PRIMARY KEY (order_id, product_id)\n);\nINSERT INTO customers VALUES (1, 'Amit Kumar', 'Mumbai'), (2, 'Sara Khan', 'Delhi');\nINSERT INTO products VALUES (1, 'Laptop', 55000), (2, 'Mouse', 500), (3, 'Office Chair', 7000), (4, 'Pen', 20), (5, 'Notebook', 50);\nINSERT INTO orders VALUES (1, 1, '2024-01-05'), (2, 2, '2024-01-18'), (3, 1, '2024-02-20');\nINSERT INTO order_items VALUES (1, 1, 1), (1, 2, 2), (2, 3, 1), (3, 4, 20), (3, 5, 10), (3, 2, 1);",
        "query": "SELECT o.order_id, o.order_date, c.name AS customer, c.city,\n       COUNT(*) AS items,\n       SUM(oi.quantity * p.price) AS order_total\nFROM orders o\nJOIN customers c    ON c.customer_id = o.customer_id\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p     ON p.product_id = oi.product_id\nGROUP BY o.order_id, o.order_date, c.name, c.city\nORDER BY o.order_id;"
      },
      "result": "order_id | order_date | customer   | city   | items | order_total\n---------+------------+------------+--------+-------+------------\n1        | 2024-01-05 | Amit Kumar | Mumbai | 2     | 56000\n2        | 2024-01-18 | Sara Khan  | Delhi  | 1     | 7000\n3        | 2024-02-20 | Amit Kumar | Mumbai | 3     | 1400\n(3 rows)",
      "explanation": "Each fact now lives in one place: customer details in customers, prices in products, and the M:N link between orders and products in the junction table order_items with a composite key. Joins rebuild any report on demand, and totals are computed, not stored."
    },
    {
      "title": "Fixing a 3NF Violation (Transitive Dependency)",
      "scenario": "A table stores emp_id, name, dept_id and dept_name together. Show the redundancy and the fix.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "-- Problem: emp_id -> dept_id -> dept_name (transitive dependency)\nSELECT dept_id, COUNT(DISTINCT dept_name) AS different_spellings,\n       GROUP_CONCAT(DISTINCT dept_name) AS names\nFROM emp_bad GROUP BY dept_id;\n\n-- Fix (3NF): move dept_name into its own table\nCREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50) NOT NULL UNIQUE);\nCREATE TABLE employees (\n  emp_id INT PRIMARY KEY, name VARCHAR(50),\n  dept_id INT, FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);",
      "sql": {
        "setup": "CREATE TABLE emp_bad (emp_id INTEGER PRIMARY KEY, name VARCHAR(50), dept_id INTEGER, dept_name VARCHAR(50));\nINSERT INTO emp_bad VALUES (1,'Asha',2,'IT'),(2,'Rahul',2,'IT'),(3,'Priya',1,'Sales'),(4,'Arjun',2,'Information Tech');",
        "query": "SELECT dept_id, COUNT(DISTINCT dept_name) AS different_spellings,\n       GROUP_CONCAT(DISTINCT dept_name) AS names\nFROM emp_bad\nGROUP BY dept_id;"
      },
      "result": "dept_id | different_spellings | names\n--------+---------------------+--------------------\n1       | 1                   | Sales\n2       | 2                   | IT,Information Tech\n(2 rows)",
      "explanation": "Department 2 is spelled two different ways because the name is repeated in every employee row: a classic update anomaly. After moving dept_name into departments, the name is stored once and every employee just references dept_id."
    },
    {
      "title": "Many-to-Many with a Junction Table",
      "scenario": "Students enrol in many courses and each course has many students. Model it and list enrolments.",
      "steps": [
        "Open the SQL Lab in the browser (or MySQL Workbench connected to the course database)",
        "Run the setup script once to create the sample tables and rows",
        "Type the query in the editor and press Run (Ctrl+Enter in Workbench)",
        "Compare the result grid with the expected output below"
      ],
      "code": "SELECT c.title, COUNT(*) AS students, GROUP_CONCAT(s.name) AS names\nFROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nJOIN courses  c ON c.course_id  = e.course_id\nGROUP BY c.title\nORDER BY students DESC;",
      "sql": {
        "setup": "CREATE TABLE students (student_id INTEGER PRIMARY KEY, name VARCHAR(50));\nCREATE TABLE courses  (course_id INTEGER PRIMARY KEY, title VARCHAR(50));\nCREATE TABLE enrollments (\n  student_id  INTEGER REFERENCES students(student_id),\n  course_id   INTEGER REFERENCES courses(course_id),\n  enrolled_on DATE,\n  PRIMARY KEY (student_id, course_id)\n);\nINSERT INTO students VALUES (1,'Asha'),(2,'Rahul'),(3,'Neha');\nINSERT INTO courses VALUES (10,'SQL'),(20,'Python'),(30,'Power BI');\nINSERT INTO enrollments VALUES (1,10,'2024-01-01'),(1,20,'2024-01-03'),(2,10,'2024-01-05'),(3,30,'2024-02-01'),(3,10,'2024-02-02');",
        "query": "SELECT c.title, COUNT(*) AS students, GROUP_CONCAT(s.name) AS names\nFROM enrollments e\nJOIN students s ON s.student_id = e.student_id\nJOIN courses  c ON c.course_id  = e.course_id\nGROUP BY c.title\nORDER BY students DESC;"
      },
      "result": "title    | students | names\n---------+----------+----------------\nSQL      | 3        | Asha,Rahul,Neha\nPython   | 1        | Asha\nPower BI | 1        | Neha\n(3 rows)",
      "explanation": "An M:N relationship cannot be stored with a single foreign key. The junction table enrollments holds one row per student-course pair, with a composite primary key that prevents duplicate enrolment, and it can carry relationship attributes such as enrolled_on."
    }
  ],
  "interview": [
    {
      "q": "What is normalization?",
      "a": "The process of organising data into related tables to minimise redundancy and avoid insert, update and delete anomalies, using rules called normal forms.",
      "level": "Easy"
    },
    {
      "q": "Explain 1NF, 2NF and 3NF with examples.",
      "a": "1NF: atomic values, no repeating groups (one product per row, not \"Laptop, Mouse\"). 2NF: 1NF + no partial dependency on part of a composite key (product_name moves out of order_items). 3NF: 2NF + no transitive dependency (dept_name moves out of employees into departments).",
      "level": "Medium"
    },
    {
      "q": "What is BCNF? How is it different from 3NF?",
      "a": "BCNF requires that for every functional dependency X -> Y, X is a super key. 3NF allows X -> Y where Y is a prime attribute; BCNF does not. Every BCNF table is in 3NF, not vice versa.",
      "level": "Hard"
    },
    {
      "q": "What are insert, update and delete anomalies?",
      "a": "Insert: cannot add data without other unrelated data. Update: the same fact in many rows must be updated everywhere. Delete: deleting a row loses other facts stored only in that row.",
      "level": "Medium"
    },
    {
      "q": "What is a functional dependency?",
      "a": "A relationship A -> B where each value of A determines exactly one value of B, e.g. emp_id -> name.",
      "level": "Medium"
    },
    {
      "q": "Difference between candidate key, super key and primary key?",
      "a": "Super key: any column set that uniquely identifies rows. Candidate key: a minimal super key. Primary key: the chosen candidate key. Alternate keys are the remaining candidate keys.",
      "level": "Medium"
    },
    {
      "q": "What is denormalization and when is it used?",
      "a": "Intentionally adding redundancy (pre-joined or pre-aggregated data) to speed up reads, common in reporting, caching and data warehouses (star schema). Cost: more storage and harder updates.",
      "level": "Medium"
    },
    {
      "q": "What is an ER diagram?",
      "a": "A visual model of entities, their attributes and the relationships (with cardinality) between them, used to design a database before creating tables.",
      "level": "Easy"
    },
    {
      "q": "How do you implement a many-to-many relationship?",
      "a": "With a junction table that contains foreign keys to both tables, usually with a composite primary key, e.g. enrollments(student_id, course_id).",
      "level": "Easy"
    },
    {
      "q": "What is a weak entity?",
      "a": "An entity that cannot be uniquely identified by its own attributes and depends on a parent (owner) entity, e.g. order_item depends on order; its key includes the parent key.",
      "level": "Hard"
    },
    {
      "q": "What is cardinality vs participation?",
      "a": "Cardinality is the maximum number of related instances (1:1, 1:N, M:N). Participation is the minimum: total (every employee must belong to a department) or partial (optional).",
      "level": "Hard"
    }
  ],
  "practice": [
    {
      "task": "A table library(member_id, member_name, book_id, book_title, author, borrow_date) is used. Identify the dependencies and normalise it to 3NF.",
      "hint": "member_id -> member_name; book_id -> book_title, author; (member_id, book_id, borrow_date) -> the loan.",
      "solution": "CREATE TABLE members (member_id INTEGER PRIMARY KEY, member_name VARCHAR(50));\nCREATE TABLE books   (book_id INTEGER PRIMARY KEY, book_title VARCHAR(100), author VARCHAR(50));\nCREATE TABLE loans (\n  member_id   INTEGER REFERENCES members(member_id),\n  book_id     INTEGER REFERENCES books(book_id),\n  borrow_date DATE,\n  PRIMARY KEY (member_id, book_id, borrow_date)\n);"
    },
    {
      "task": "In the sample schema, which normal form does the orders table violate if we add a customer_city column to it? Show the query that would produce the same information without storing it.",
      "hint": "customer_city depends on customer_id, not on order_id: transitive dependency (3NF).",
      "solution": "SELECT o.order_id, c.city AS customer_city\nFROM orders o JOIN customers c ON c.customer_id = o.customer_id;"
    },
    {
      "task": "Design tables for: a doctor treats many patients, a patient sees many doctors, each visit has a date and fee.",
      "hint": "M:N with a junction table that also stores visit attributes.",
      "solution": "CREATE TABLE doctors  (doctor_id INTEGER PRIMARY KEY, name VARCHAR(50), speciality VARCHAR(50));\nCREATE TABLE patients (patient_id INTEGER PRIMARY KEY, name VARCHAR(50), phone VARCHAR(15));\nCREATE TABLE visits (\n  visit_id   INTEGER PRIMARY KEY,\n  doctor_id  INTEGER NOT NULL REFERENCES doctors(doctor_id),\n  patient_id INTEGER NOT NULL REFERENCES patients(patient_id),\n  visit_date DATE NOT NULL,\n  fee        DECIMAL(8,2)\n);"
    },
    {
      "task": "Write the relationships of the course sample schema (departments, employees, customers, orders, products) in crow's foot text form.",
      "hint": "Look at the foreign keys.",
      "solution": "-- DEPARTMENTS ||--o{ EMPLOYEES : has\n-- EMPLOYEES   |o--o{ EMPLOYEES : manages (self relationship via manager_id)\n-- CUSTOMERS   ||--o{ ORDERS    : places\n-- PRODUCTS    ||--o{ ORDERS    : \"is ordered in\"\nSELECT 'see comments' AS answer;"
    }
  ],
  "quiz": [
    {
      "question": "A cell containing \"Laptop, Mouse\" violates:",
      "options": [
        "1NF",
        "2NF",
        "3NF",
        "BCNF"
      ],
      "answer": 0,
      "explanation": "1NF requires atomic values."
    },
    {
      "question": "A partial dependency is removed in:",
      "options": [
        "1NF",
        "3NF",
        "2NF",
        "BCNF only"
      ],
      "answer": 2,
      "explanation": "2NF removes dependency on part of a composite key."
    },
    {
      "question": "emp_id -> dept_id -> dept_name is a:",
      "options": [
        "Partial dependency",
        "Multi-valued dependency",
        "Trivial dependency",
        "Transitive dependency"
      ],
      "answer": 3,
      "explanation": "dept_name depends on the key through dept_id."
    },
    {
      "question": "A many-to-many relationship is implemented using:",
      "options": [
        "A foreign key on one side",
        "A junction table",
        "A view",
        "A unique index"
      ],
      "answer": 1,
      "explanation": "The junction table holds both foreign keys."
    },
    {
      "question": "Which is true?",
      "options": [
        "Every 3NF table is in BCNF",
        "Every BCNF table is in 3NF",
        "2NF is stricter than 3NF",
        "1NF allows repeating groups"
      ],
      "answer": 1,
      "explanation": "BCNF is a stricter form of 3NF."
    }
  ]
};
