const SHOP = `CREATE TABLE products (product_id INT PRIMARY KEY, product_name VARCHAR(40), price INT, stock INT);
CREATE TABLE order_items (item_id INT AUTO_INCREMENT PRIMARY KEY, order_id INT, product_id INT, qty INT);
INSERT INTO products VALUES (1, 'Earphones', 999, 50), (2, 'Power Bank', 1499, 20), (3, 'Notebook', 60, 300);`;

const COLLEGE = `CREATE TABLE students (student_id INT PRIMARY KEY, first_name VARCHAR(30), marks INT);
CREATE TABLE marks_audit (
  audit_id   INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  old_marks  INT,
  new_marks  INT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE enrollments (student_id INT, course_id INT);
CREATE TABLE enrollment_log (log_id INT AUTO_INCREMENT PRIMARY KEY, student_id INT, course_id INT, action VARCHAR(10));
INSERT INTO students VALUES (1, 'Aarav', 88), (2, 'Diya', 92), (3, 'Kabir', 64);`;

export default {
  lesson: 'mysql-day-23',
  minutes: 34,
  intro: 'Write stored functions and triggers: BEFORE/AFTER, NEW/OLD, stock maintenance and an audit log filled automatically.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main difference between a **stored function** and a **stored procedure**?',
      options: [
        'A function returns exactly one value with RETURN and can be used inside SELECT/WHERE; a procedure is run with CALL',
        'A procedure is faster than a function',
        'Functions cannot have parameters',
        'Procedures can only be written in Workbench',
      ],
      answer: 0,
      explain: 'Functions (`CREATE FUNCTION ... RETURNS type ... RETURN value`) behave like built-in functions: `SELECT fn_grade(marks) FROM students`. Procedures are executed with CALL, can return result sets and OUT parameters, and may manage transactions.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'MySQL refuses to create a function with **Error 1418** (binary logging is enabled). The function always returns the same result for the same input and does not modify data. Which characteristic do you add after `RETURNS VARCHAR(10)`?',
      accept: ['DETERMINISTIC', 'DETERMINISTIC NO SQL', 'NO SQL DETERMINISTIC'],
      explain: 'Declare **DETERMINISTIC** (same input → same output) or `READS SQL DATA` / `NO SQL`. With binary logging MySQL must know the function is safe to replicate. Do not lie: marking a function using NOW() or RAND() as DETERMINISTIC can break replicas.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does the last SELECT return?',
      code: "DELIMITER $$\nCREATE FUNCTION fn_grade(p_marks INT)\nRETURNS CHAR(1)\nDETERMINISTIC\nBEGIN\n  RETURN CASE\n    WHEN p_marks >= 80 THEN 'A'\n    WHEN p_marks >= 60 THEN 'B'\n    ELSE 'C'\n  END;\nEND$$\nDELIMITER ;\n\nSELECT fn_grade(78);",
      expected: 'B',
      explain: '78 is not >= 80 but is >= 60, so the CASE returns **B**. A stored function is called like a built-in function, e.g. `SELECT first_name, fn_grade(marks) FROM students;` or in WHERE / ORDER BY.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Inside an **AFTER UPDATE** trigger on `students`, which row references are available?',
      options: ['Only NEW', 'Only OLD', 'Both OLD (values before) and NEW (values after)', 'Neither'],
      answer: 2,
      explain: 'INSERT triggers have only **NEW**, DELETE triggers only **OLD**, and UPDATE triggers both. In a **BEFORE** trigger you may change `NEW.col` with SET (e.g. to clean data); in an AFTER trigger NEW is read-only.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Create an **AFTER INSERT** trigger `trg_enroll_log` on `enrollments` that writes a row into `enrollment_log` with the new `student_id`, `course_id` and the action **\'ADDED\'**.\n\nWrite it with `DELIMITER $$` and a `BEGIN ... END$$` body.',
      example: { title: 'an AFTER INSERT trigger', code: "DELIMITER $$\nCREATE TRIGGER trg_new_customer\nAFTER INSERT ON customers\nFOR EACH ROW\nBEGIN\n  INSERT INTO welcome_mails (customer_id, status) VALUES (NEW.customer_id, 'PENDING');\nEND$$\nDELIMITER ;" },
      setup: COLLEGE,
      starter: '-- DELIMITER $$\n-- CREATE TRIGGER trg_enroll_log ...\n',
      solution: "DELIMITER $$\nCREATE TRIGGER trg_enroll_log\nAFTER INSERT ON enrollments\nFOR EACH ROW\nBEGIN\n  INSERT INTO enrollment_log (student_id, course_id, action)\n  VALUES (NEW.student_id, NEW.course_id, 'ADDED');\nEND$$\nDELIMITER ;",
      check: 'INSERT INTO enrollments VALUES (1, 101), (2, 102);\nSELECT student_id, course_id, action FROM enrollment_log ORDER BY log_id;',
      explain: '`FOR EACH ROW` runs the body once per inserted row, and `NEW.col` holds the values of that row. The checker inserts two enrollments; your trigger must log both. Always switch the delimiter back with `DELIMITER ;`.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Stock maintenance: create an **AFTER INSERT** trigger `trg_reduce_stock` on `order_items` that **reduces** `products.stock` by the ordered `qty` of that product.',
      example: { title: 'a trigger that updates another table', code: 'DELIMITER $$\nCREATE TRIGGER trg_add_points\nAFTER INSERT ON orders\nFOR EACH ROW\nBEGIN\n  UPDATE customers SET points = points + NEW.amount / 100\n  WHERE customer_id = NEW.customer_id;\nEND$$\nDELIMITER ;' },
      setup: SHOP,
      starter: '-- DELIMITER $$\n-- CREATE TRIGGER trg_reduce_stock ...\n',
      solution: 'DELIMITER $$\nCREATE TRIGGER trg_reduce_stock\nAFTER INSERT ON order_items\nFOR EACH ROW\nBEGIN\n  UPDATE products\n  SET stock = stock - NEW.qty\n  WHERE product_id = NEW.product_id;\nEND$$\nDELIMITER ;',
      check: 'INSERT INTO order_items (order_id, product_id, qty) VALUES (1, 1, 2), (1, 3, 10), (2, 1, 1);\nSELECT product_id, stock FROM products ORDER BY product_id;',
      explain: 'The WHERE must use `NEW.product_id`, otherwise every product\'s stock drops. After the checker\'s 3 order lines: Earphones 50 − 3 = 47, Notebook 300 − 10 = 290, Power Bank unchanged.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 6,
      q: 'Audit log: create an **AFTER UPDATE** trigger `trg_marks_audit` on `students` that inserts `student_id`, `old_marks` and `new_marks` into `marks_audit` for **every updated row** (OLD.marks before, NEW.marks after).',
      example: { title: 'OLD and NEW in an update trigger', code: 'DELIMITER $$\nCREATE TRIGGER trg_price_history\nAFTER UPDATE ON products\nFOR EACH ROW\nBEGIN\n  INSERT INTO price_history (product_id, old_price, new_price)\n  VALUES (OLD.product_id, OLD.price, NEW.price);\nEND$$\nDELIMITER ;' },
      setup: COLLEGE,
      starter: '-- DELIMITER $$\n-- CREATE TRIGGER trg_marks_audit ...\n',
      solution: 'DELIMITER $$\nCREATE TRIGGER trg_marks_audit\nAFTER UPDATE ON students\nFOR EACH ROW\nBEGIN\n  INSERT INTO marks_audit (student_id, old_marks, new_marks)\n  VALUES (OLD.student_id, OLD.marks, NEW.marks);\nEND$$\nDELIMITER ;',
      check: "UPDATE students SET marks = 90 WHERE student_id = 1;\nUPDATE students SET marks = marks + 5 WHERE student_id = 3;\nSELECT student_id, old_marks, new_marks FROM marks_audit ORDER BY audit_id;",
      explain: 'OLD holds the values before the UPDATE and NEW the values after, so one INSERT records both. The checker updates Aarav (88 → 90) and Kabir (64 → 69): 2 audit rows must appear, and `changed_at` fills itself from its DEFAULT. In real MySQL you can log only real changes by wrapping the INSERT in `IF OLD.marks <> NEW.marks THEN ... END IF;`.',
    },
  ],
};
