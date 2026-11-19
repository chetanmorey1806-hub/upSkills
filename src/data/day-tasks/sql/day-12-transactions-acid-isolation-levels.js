export default {
  lesson: 'day-12-transactions-acid-isolation-levels',
  minutes: 30,
  intro: 'Group statements into all-or-nothing transactions with BEGIN, COMMIT, ROLLBACK and SAVEPOINT, and know the ACID properties, concurrency problems and isolation levels.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Match each ACID property with its meaning. Which pairs are correct? (choose all that apply)',
      options: ['Atomicity – all statements of a transaction succeed, or none do', 'Consistency – a transaction moves the database from one valid state to another (constraints hold)', 'Isolation – concurrent transactions do not see each other\'s unfinished changes', 'Durability – once committed, changes survive a crash', 'Durability – a transaction can be undone at any time after COMMIT'],
      answers: [0, 1, 2, 3],
      explain: 'After COMMIT the change is permanent (written to the log/disk) – it can only be reversed by a **new** transaction. Before COMMIT, ROLLBACK undoes everything.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**Money transfer.** Inside a transaction move **₹2000** from account **1** (Asha) to account **2** (Ravi): `BEGIN;` → two UPDATEs → `COMMIT;`.',
      example: { title: 'a committed transaction', code: 'BEGIN;   -- MySQL: START TRANSACTION;\nUPDATE stock SET qty = qty - 1 WHERE item = \'Pen\';\nINSERT INTO sales (item, qty) VALUES (\'Pen\', 1);\nCOMMIT;' },
      setup: `CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT, balance INTEGER CHECK (balance >= 0));
INSERT INTO accounts VALUES (1, 'Asha', 10000), (2, 'Ravi', 3000), (3, 'Neha', 500);`,
      starter: '-- BEGIN;\n-- ...\n-- COMMIT;\n',
      solution: `BEGIN;
UPDATE accounts SET balance = balance - 2000 WHERE id = 1;
UPDATE accounts SET balance = balance + 2000 WHERE id = 2;
COMMIT;`,
      check: 'SELECT id, balance FROM accounts ORDER BY id;',
      explain: 'Both updates belong together: if the server crashed between them, money would vanish. Inside a transaction either both are committed or neither is. In MySQL write `START TRANSACTION;` (or `BEGIN;`).',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 6,
      q: '**ROLLBACK.** A clerk wanted to add ₹300 to Neha (id 3) but, inside a transaction, by mistake set **every** balance to 0. Write:\n1. `BEGIN;` and the wrong `UPDATE accounts SET balance = 0;`\n2. `ROLLBACK;` to undo it\n3. the **correct** update: add 300 to Neha only\n\nAt the end only Neha\'s balance may have changed.',
      example: { title: 'undoing a transaction', code: 'BEGIN;\nDELETE FROM orders;      -- oops\nROLLBACK;                -- nothing was deleted' },
      setup: `CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT, balance INTEGER CHECK (balance >= 0));
INSERT INTO accounts VALUES (1, 'Asha', 10000), (2, 'Ravi', 3000), (3, 'Neha', 500);`,
      starter: '-- BEGIN;\n',
      solution: `BEGIN;
UPDATE accounts SET balance = 0;
ROLLBACK;
UPDATE accounts SET balance = balance + 300 WHERE id = 3;`,
      check: 'SELECT id, balance FROM accounts ORDER BY id;',
      explain: 'ROLLBACK discards every change since BEGIN. Note that in MySQL DDL statements (CREATE, ALTER, DROP, TRUNCATE) cause an **implicit commit** and cannot be rolled back.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**SAVEPOINT.** In one transaction:\n1. add ₹500 to Neha (id 3)\n2. create a savepoint `sp1`\n3. subtract ₹5000 from Ravi (id 2) – this is a mistake\n4. `ROLLBACK TO sp1` to undo only step 3\n5. `COMMIT`\n\nOnly Neha\'s change must remain.',
      example: { title: 'partial rollback', code: 'BEGIN;\nINSERT INTO log VALUES (1);\nSAVEPOINT before_bulk;\nDELETE FROM log;\nROLLBACK TO before_bulk;\nCOMMIT;' },
      setup: `CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT, balance INTEGER);
INSERT INTO accounts VALUES (1, 'Asha', 10000), (2, 'Ravi', 3000), (3, 'Neha', 500);`,
      starter: '-- BEGIN;\n',
      solution: `BEGIN;
UPDATE accounts SET balance = balance + 500 WHERE id = 3;
SAVEPOINT sp1;
UPDATE accounts SET balance = balance - 5000 WHERE id = 2;
ROLLBACK TO sp1;
COMMIT;`,
      check: 'SELECT id, balance FROM accounts ORDER BY id;',
      explain: '`ROLLBACK TO savepoint` undoes only the work done after the savepoint and keeps the transaction open; the final COMMIT saves Neha\'s +500. A plain ROLLBACK would have undone both changes.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Transaction A reads a row that transaction B has updated but **not yet committed**; B then rolls back. What is this problem called, and which is the lowest isolation level that prevents it?',
      options: ['Phantom read – SERIALIZABLE', 'Dirty read – READ COMMITTED', 'Non-repeatable read – READ UNCOMMITTED', 'Deadlock – REPEATABLE READ'],
      answer: 1,
      explain: 'Reading uncommitted data is a **dirty read**; READ COMMITTED and above prevent it. Non-repeatable reads are prevented from REPEATABLE READ (MySQL InnoDB\'s default) and phantoms fully by SERIALIZABLE (InnoDB also blocks most phantoms with next-key locks).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Two transactions each hold a lock the other one needs, so both wait forever until MySQL kills one of them. This situation is called a ________. (one word)',
      accept: ['deadlock', 'dead lock', 'dead-lock'],
      explain: 'InnoDB detects **deadlocks** and rolls back the cheaper transaction (error 1213), which the application should retry. Reduce them by keeping transactions short and updating rows in the same order everywhere (e.g. always lower account id first).',
    },
  ],
};
