export default {
  lesson: 'day-13-stored-procedures-functions-triggers',
  minutes: 35,
  intro: 'Know how MySQL stored procedures and functions are written and called, and build real triggers (audit log, stock update, validation) that run in SQLite.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'In the MySQL client, which statement changes the statement terminator so that a procedure body containing `;` can be created? Complete: `________ //` (one word)',
      accept: ['DELIMITER', 'delimiter'],
      explain: 'Inside `BEGIN … END` each statement ends with `;`, which would end the CREATE PROCEDURE early. `DELIMITER //` makes `//` the terminator while defining it, and `DELIMITER ;` switches back afterwards. (Workbench\'s script editor needs this too.)',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'MySQL: `CREATE PROCEDURE dept_count(IN p_dept VARCHAR(20), OUT p_total INT) ...`. How do you call it and read the result?',
      options: ["SELECT dept_count('IT');", "CALL dept_count('IT', @n); SELECT @n;", "EXEC dept_count 'IT';", "dept_count('IT') INTO @n;"],
      answer: 1,
      explain: 'Procedures are run with **CALL**; an OUT parameter is passed as a session variable (`@n`) that you read afterwards. Stored **functions** return one value and are used inside SELECT (`SELECT name, gst(price) FROM products`). `EXEC` is SQL Server syntax.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about procedures vs functions vs triggers are TRUE (MySQL)? (choose all that apply)',
      options: ['A function must return a value and can be used inside SELECT', 'A procedure can have IN, OUT and INOUT parameters and is run with CALL', 'A trigger runs automatically BEFORE or AFTER INSERT, UPDATE or DELETE on a table', 'In a row trigger, NEW holds the new values and OLD the previous values', 'A trigger must be called manually with CALL'],
      answers: [0, 1, 2, 3],
      explain: 'Triggers are never called directly – the database fires them for each affected row. INSERT triggers only have NEW, DELETE triggers only OLD, UPDATE triggers have both.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 8,
      q: '**Audit trigger.** Create an `AFTER UPDATE OF salary ON employees` trigger named `trg_salary_audit` that inserts a row into `salary_log(emp_id, old_salary, new_salary)` using OLD and NEW. Then give employee 2 a salary of 70000 to test it.\n\n(SQLite syntax: `CREATE TRIGGER name AFTER UPDATE OF salary ON employees BEGIN … ; END;` – MySQL adds `FOR EACH ROW` and uses `DELIMITER`.)',
      example: { title: 'a trigger in SQLite', code: 'CREATE TRIGGER trg_order_log AFTER INSERT ON orders\nBEGIN\n  INSERT INTO order_log (order_id, note) VALUES (NEW.order_id, \'created\');\nEND;' },
      setup: `CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT, salary INTEGER);
CREATE TABLE salary_log (log_id INTEGER PRIMARY KEY AUTOINCREMENT, emp_id INTEGER, old_salary INTEGER, new_salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 60000), (2, 'Ravi', 52000), (3, 'Neha', 48000);`,
      starter: '-- CREATE TRIGGER trg_salary_audit ...\n',
      solution: `CREATE TRIGGER trg_salary_audit AFTER UPDATE OF salary ON employees
BEGIN
  INSERT INTO salary_log (emp_id, old_salary, new_salary) VALUES (OLD.emp_id, OLD.salary, NEW.salary);
END;
UPDATE employees SET salary = 70000 WHERE emp_id = 2;`,
      check: `UPDATE employees SET salary = 50000 WHERE emp_id = 3;
SELECT emp_id, old_salary, new_salary FROM salary_log ORDER BY log_id;`,
      explain: 'The trigger fires once per updated row and records the before/after values – an audit trail that no application can forget to write. The checker also updates Neha afterwards to make sure your trigger keeps working for every update.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Stock trigger.** Create a trigger `trg_reduce_stock` that runs **AFTER INSERT ON order_items** and reduces `products.stock` by the ordered `qty` for that product. Then insert an order item (1, product 2, qty 3).',
      example: { title: 'updating another table from a trigger', code: 'CREATE TRIGGER trg_add_points AFTER INSERT ON purchases\nBEGIN\n  UPDATE members SET points = points + NEW.amount / 100 WHERE id = NEW.member_id;\nEND;' },
      setup: `CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, stock INTEGER);
CREATE TABLE order_items (id INTEGER PRIMARY KEY, product_id INTEGER, qty INTEGER);
INSERT INTO products VALUES (1, 'Pen', 100), (2, 'Notebook', 40), (3, 'Bag', 10);`,
      starter: '-- CREATE TRIGGER trg_reduce_stock ...\n',
      solution: `CREATE TRIGGER trg_reduce_stock AFTER INSERT ON order_items
BEGIN
  UPDATE products SET stock = stock - NEW.qty WHERE id = NEW.product_id;
END;
INSERT INTO order_items VALUES (1, 2, 3);`,
      check: `INSERT INTO order_items VALUES (2, 3, 4);
SELECT id, stock FROM products ORDER BY id;`,
      explain: '`NEW.qty` and `NEW.product_id` are the values of the row just inserted. The checker inserts a second item (4 bags) to confirm the trigger works for any row. In production you would also prevent negative stock, e.g. with a CHECK constraint or a BEFORE trigger.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**Validation trigger.** Create `trg_check_marks` **BEFORE INSERT ON results** that rejects marks outside 0-100 with `SELECT RAISE(ABORT, \'marks must be 0-100\') WHERE NEW.marks < 0 OR NEW.marks > 100;` (SQLite – MySQL uses `SIGNAL SQLSTATE \'45000\'`). Then insert a valid row (\'Asha\', 88).',
      example: { title: 'RAISE in a BEFORE trigger', code: "CREATE TRIGGER trg_no_negative BEFORE INSERT ON payments\nBEGIN\n  SELECT RAISE(ABORT, 'amount must be positive') WHERE NEW.amount <= 0;\nEND;" },
      setup: `CREATE TABLE results (id INTEGER PRIMARY KEY AUTOINCREMENT, student TEXT, marks INTEGER);`,
      starter: '-- CREATE TRIGGER trg_check_marks ...\n',
      solution: `CREATE TRIGGER trg_check_marks BEFORE INSERT ON results
BEGIN
  SELECT RAISE(ABORT, 'marks must be 0-100') WHERE NEW.marks < 0 OR NEW.marks > 100;
END;
INSERT INTO results (student, marks) VALUES ('Asha', 88);`,
      check: `SELECT student, marks, (SELECT COUNT(*) FROM sqlite_master WHERE type = 'trigger' AND name = 'trg_check_marks' AND upper(sql) LIKE '%BEFORE INSERT%') AS trg FROM results;`,
      explain: 'A BEFORE trigger can stop a bad row before it is stored. A simple `CHECK (marks BETWEEN 0 AND 100)` constraint does the same job more simply – use triggers for rules a CHECK cannot express (e.g. rules that look at other tables).',
    },
  ],
};
