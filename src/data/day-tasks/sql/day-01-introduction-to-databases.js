export default {
  lesson: 'day-01-introduction-to-databases',
  minutes: 20,
  intro: 'Check the database basics (DBMS vs RDBMS, tables, keys, SQL command groups) and run your first SELECT queries. Queries run in SQLite, which uses the same SELECT syntax as MySQL for these tasks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement best describes an **RDBMS** such as MySQL?',
      options: ['It stores data as loose files and folders', 'It stores data in related tables of rows and columns and enforces keys and constraints', 'It can only store one table', 'It is a spreadsheet program like Excel'],
      answer: 1,
      explain: 'A Relational DBMS stores data in **tables** that are linked by keys (primary key / foreign key) and enforces rules such as uniqueness and NOT NULL. A plain DBMS may store data without relationships between tables. Excel is not a DBMS: no constraints, no concurrent multi-user safety.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the SQL command group. Which pairs are correct? (choose all that apply)',
      options: ['DDL – CREATE, ALTER, DROP', 'DML – INSERT, UPDATE, DELETE', 'DQL – SELECT', 'DCL – GRANT, REVOKE', 'TCL – CREATE, DROP'],
      answers: [0, 1, 2, 3],
      explain: '**TCL** (Transaction Control Language) is COMMIT, ROLLBACK and SAVEPOINT. DDL defines structure, DML changes rows, DQL reads them and DCL manages permissions.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'The column that **uniquely identifies each row** of a table (e.g. `emp_id`) is called the ________ key. (one word)',
      accept: ['primary', 'primary key'],
      explain: 'A **primary key** is unique and NOT NULL for every row. A **foreign key** in another table refers to it (e.g. `orders.customer_id` → `customers.id`) to create the relationship.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 3,
      q: 'Show **all columns and all rows** of the `students` table.',
      example: { title: 'SELECT *', code: 'SELECT * FROM products;' },
      setup: `CREATE TABLE students (roll_no INTEGER PRIMARY KEY, name TEXT, city TEXT, marks INTEGER);
INSERT INTO students VALUES (1, 'Asha', 'Pune', 82), (2, 'Ravi', 'Delhi', 67), (3, 'Neha', 'Mumbai', 91), (4, 'Karan', 'Pune', 58);`,
      starter: '-- write your query here\n',
      solution: 'SELECT * FROM students;',
      explain: '`*` means "every column". In real projects prefer listing the columns you need – it is faster on wide tables and the result does not change when someone adds a column.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 4,
      q: 'Show only the `name` and `city` columns of every student, in that order.',
      example: { title: 'selecting columns', code: 'SELECT product_name, price FROM products;' },
      setup: `CREATE TABLE students (roll_no INTEGER PRIMARY KEY, name TEXT, city TEXT, marks INTEGER);
INSERT INTO students VALUES (1, 'Asha', 'Pune', 82), (2, 'Ravi', 'Delhi', 67), (3, 'Neha', 'Mumbai', 91), (4, 'Karan', 'Pune', 58);`,
      starter: '-- write your query here\n',
      solution: 'SELECT name, city FROM students;',
      explain: 'List the columns after SELECT, separated by commas, in the order you want them displayed. A missing comma (`SELECT name city`) does not fail – it silently treats `city` as an **alias** for name.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 5,
      q: 'Two tables are related: `orders.customer_id` refers to `customers.id`. Show each order\'s `order_id`, the **customer name** and `amount`. (Hint: `FROM orders, customers WHERE orders.customer_id = customers.id` or a `JOIN … ON …`.)',
      example: { title: 'reading two related tables', code: 'SELECT e.name, d.dept_name\nFROM employees e JOIN departments d ON e.dept_id = d.id;' },
      setup: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), amount INTEGER);
INSERT INTO customers VALUES (1, 'Asha', 'Pune'), (2, 'Ravi', 'Delhi'), (3, 'Neha', 'Mumbai');
INSERT INTO orders VALUES (101, 1, 1200), (102, 3, 850), (103, 1, 430), (104, 2, 2100);`,
      starter: '-- write your query here\n',
      solution: 'SELECT o.order_id, c.name, o.amount FROM orders o JOIN customers c ON o.customer_id = c.id;',
      explain: 'The foreign key `customer_id` stores only a number; the name lives once in `customers`. Matching the two columns brings the data together without repeating customer details in every order – the core idea of a relational database (joins are covered in depth on Day 6).',
    },
  ],
};
