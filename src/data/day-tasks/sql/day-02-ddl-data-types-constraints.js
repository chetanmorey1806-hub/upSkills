export default {
  lesson: 'day-02-ddl-data-types-constraints',
  minutes: 30,
  intro: 'Create and change tables with DDL, choose data types and protect data with PRIMARY KEY, NOT NULL, UNIQUE, DEFAULT, CHECK and FOREIGN KEY constraints. Tasks run in SQLite (types are written MySQL-style; SQLite accepts them).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which MySQL data type should store a product **price** like 1299.50 exactly (no floating-point rounding errors)?',
      options: ['FLOAT', 'DECIMAL(10,2)', 'VARCHAR(10)', 'INT'],
      answer: 1,
      explain: '`DECIMAL(10,2)` stores exact values with 2 decimal places – always use it for money. FLOAT/DOUBLE are approximate (0.1 + 0.2 is not exactly 0.3). Storing numbers as VARCHAR breaks sorting and maths.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about DROP, TRUNCATE and DELETE are TRUE (MySQL)? (choose all that apply)',
      options: ['DROP TABLE removes the table structure and all its data', 'TRUNCATE removes all rows but keeps the table structure', 'DELETE can remove selected rows with a WHERE clause', 'TRUNCATE can remove only the rows matching a WHERE clause', 'TRUNCATE resets the AUTO_INCREMENT counter'],
      answers: [0, 1, 2, 4],
      explain: 'TRUNCATE has **no WHERE** – it empties the whole table quickly (DDL, resets AUTO_INCREMENT). DELETE is DML, row by row, can be filtered and rolled back in a transaction. DROP removes the table itself.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 8,
      q: 'Create a table `employees` with these columns and constraints:\n- `emp_id` INTEGER **primary key**\n- `name` VARCHAR(50) **not null**\n- `email` VARCHAR(100) **unique**\n- `salary` DECIMAL(10,2) with a **check** that it is greater than 0\n- `city` VARCHAR(30) with **default** `\'Pune\'`\n\nThen insert one employee: 1, \'Asha\', \'asha@corp.in\', 55000 (do not give a city – let the default fill it).',
      example: { title: 'CREATE TABLE with constraints', code: 'CREATE TABLE products (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(50) NOT NULL,\n  sku VARCHAR(20) UNIQUE,\n  qty INTEGER DEFAULT 0 CHECK (qty >= 0)\n);' },
      setup: '-- empty database',
      starter: '-- CREATE TABLE employees (...);\n-- INSERT INTO employees ...;\n',
      solution: `CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  salary DECIMAL(10,2) CHECK (salary > 0),
  city VARCHAR(30) DEFAULT 'Pune'
);
INSERT INTO employees (emp_id, name, email, salary) VALUES (1, 'Asha', 'asha@corp.in', 55000);`,
      check: `SELECT e.emp_id, e.name, e.email, e.salary, e.city,
  (SELECT COUNT(*) FROM pragma_table_info('employees') WHERE name = 'name' AND "notnull" = 1) AS name_not_null,
  (SELECT COUNT(*) FROM pragma_table_info('employees') WHERE name = 'emp_id' AND pk = 1) AS id_is_pk,
  (SELECT COUNT(*) FROM pragma_index_list('employees') WHERE "unique" = 1 AND origin = 'u') AS unique_indexes,
  (SELECT COUNT(*) FROM sqlite_master WHERE name = 'employees' AND upper(sql) LIKE '%CHECK%SALARY%>%0%') AS has_check
FROM employees e;`,
      explain: 'Constraints make the database reject bad data instead of trusting every application: PRIMARY KEY (unique + not null id), NOT NULL (value required), UNIQUE (no duplicate emails), CHECK (business rule) and DEFAULT (value used when the column is omitted in INSERT).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: 'The `products` table exists. Use **ALTER TABLE** to:\n1. add a column `gst_rate` INTEGER with default 18\n2. rename the column `pname` to `product_name`\n\nThen show all columns of all products.',
      example: { title: 'ALTER TABLE', code: 'ALTER TABLE students ADD COLUMN phone VARCHAR(15);\nALTER TABLE students RENAME COLUMN fname TO first_name;' },
      setup: `CREATE TABLE products (id INTEGER PRIMARY KEY, pname TEXT, price DECIMAL(10,2));
INSERT INTO products VALUES (1, 'Notebook', 45), (2, 'Pen', 10), (3, 'Bag', 799);`,
      starter: '-- ALTER TABLE products ...\n',
      solution: `ALTER TABLE products ADD COLUMN gst_rate INTEGER DEFAULT 18;
ALTER TABLE products RENAME COLUMN pname TO product_name;
SELECT * FROM products;`,
      check: 'SELECT id, product_name, price, gst_rate FROM products ORDER BY id;',
      explain: 'ALTER TABLE changes structure without losing data. Existing rows get the DEFAULT value for the new column. In MySQL the same commands work (`ADD COLUMN`, `RENAME COLUMN` in MySQL 8; older versions used `CHANGE old new type`).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**Foreign key.** `departments` exists. Create `staff` with `id` INTEGER primary key, `name` TEXT, and `dept_id` INTEGER that **references** `departments(dept_id)`. Insert two staff: (1, \'Ravi\', 10) and (2, \'Neha\', 20). Finally select all staff.',
      example: { title: 'REFERENCES', code: 'CREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_id INTEGER,\n  FOREIGN KEY (customer_id) REFERENCES customers(id)\n);' },
      setup: `CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT);
INSERT INTO departments VALUES (10, 'IT'), (20, 'HR');`,
      starter: '-- CREATE TABLE staff (...);\n',
      solution: `CREATE TABLE staff (id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER REFERENCES departments(dept_id));
INSERT INTO staff VALUES (1, 'Ravi', 10), (2, 'Neha', 20);
SELECT * FROM staff;`,
      check: `SELECT s.id, s.name, s.dept_id,
  (SELECT COUNT(*) FROM pragma_foreign_key_list('staff') WHERE "table" = 'departments' AND "from" = 'dept_id') AS has_fk
FROM staff s ORDER BY s.id;`,
      explain: 'A foreign key guarantees every `dept_id` in `staff` exists in `departments` (referential integrity). Options like `ON DELETE CASCADE` or `ON DELETE SET NULL` decide what happens to staff rows when a department is deleted.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In MySQL, which column attribute makes `id INT PRIMARY KEY ____` generate 1, 2, 3 … automatically? (one word)',
      accept: ['AUTO_INCREMENT', 'auto_increment'],
      explain: '`AUTO_INCREMENT` (MySQL) gives each new row the next number. SQLite does this automatically for `INTEGER PRIMARY KEY`, SQL Server uses `IDENTITY(1,1)` and PostgreSQL `SERIAL` / `GENERATED AS IDENTITY`.',
    },
  ],
};
