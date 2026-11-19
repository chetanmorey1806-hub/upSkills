const BANK = `CREATE TABLE accounts (acc_no INT PRIMARY KEY, holder VARCHAR(30), balance DECIMAL(12,2) CHECK (balance >= 0));
CREATE TABLE transfers (transfer_id INT AUTO_INCREMENT PRIMARY KEY, from_acc INT, to_acc INT, amount DECIMAL(12,2));
INSERT INTO accounts VALUES (101, 'Asha', 15000), (102, 'Ravi', 8000), (103, 'Neel', 2500);`;

const COLLEGE = `CREATE TABLE students (student_id INT PRIMARY KEY, first_name VARCHAR(30), city VARCHAR(30));
INSERT INTO students VALUES (1, 'Aarav', 'Pune'), (2, 'Diya', 'Mumbai');`;

export default {
  lesson: 'mysql-day-24',
  minutes: 30,
  intro: 'Group statements into all-or-nothing units with START TRANSACTION, COMMIT, ROLLBACK and SAVEPOINT, and understand ACID, autocommit, isolation levels and locks.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A money transfer debits account A and then the server crashes before crediting account B. Which ACID property guarantees that the debit is undone?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      answer: 0,
      explain: '**Atomicity** = all statements of a transaction succeed or none do. Consistency = rules/constraints hold before and after, Isolation = concurrent transactions do not see each other\'s unfinished work, Durability = committed data survives crashes.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'MySQL Workbench is in its default **autocommit** mode. You run `DELETE FROM logs WHERE id = 5;` and then `ROLLBACK;`. What happens?',
      options: ['The row comes back', 'Nothing: with autocommit = 1 the DELETE was already committed', 'MySQL raises an error', 'The whole table is restored'],
      answer: 1,
      explain: 'With **autocommit = 1** every statement is its own transaction and is committed immediately. To be able to roll back, start with `START TRANSACTION` (or `SET autocommit = 0`). Also remember: DDL such as DROP/ALTER/TRUNCATE commits implicitly.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about isolation levels and locks are TRUE? (choose all that apply)',
      options: [
        'The default isolation level of InnoDB is REPEATABLE READ',
        'READ UNCOMMITTED allows dirty reads',
        'SELECT ... FOR UPDATE locks the selected rows until the transaction ends',
        'SERIALIZABLE is the fastest level',
        'A deadlock happens when two transactions wait for locks held by each other; MySQL rolls one back',
      ],
      answers: [0, 1, 2, 4],
      explain: 'From weakest to strongest: READ UNCOMMITTED (dirty reads), READ COMMITTED, **REPEATABLE READ (default)**, SERIALIZABLE (safest but slowest). `FOR UPDATE` takes exclusive row locks, used e.g. to reduce stock safely. InnoDB detects deadlocks and rolls back the cheaper transaction (Error 1213).',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Transfer **₹2,000 from account 102 to account 103** as ONE transaction:\n1. start a transaction\n2. debit 102, credit 103\n3. record it in `transfers` (from_acc, to_acc, amount)\n4. commit',
      example: { title: 'a transaction', code: "START TRANSACTION;\nUPDATE stock SET qty = qty - 1 WHERE item_id = 7;\nINSERT INTO sales (item_id, qty) VALUES (7, 1);\nCOMMIT;" },
      setup: BANK,
      starter: '-- START TRANSACTION; ... COMMIT;\n',
      solution: 'START TRANSACTION;\nUPDATE accounts SET balance = balance - 2000 WHERE acc_no = 102;\nUPDATE accounts SET balance = balance + 2000 WHERE acc_no = 103;\nINSERT INTO transfers (from_acc, to_acc, amount) VALUES (102, 103, 2000);\nCOMMIT;',
      check: 'SELECT acc_no, balance FROM accounts ORDER BY acc_no;\n',
      explain: 'Between START TRANSACTION and COMMIT nothing is permanent; if any step fails you ROLLBACK and both balances stay as they were. Total money in the bank is unchanged (25500) — that is **consistency**.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'In one transaction insert student **(3, \'Kabir\', \'Nagpur\')**, set a savepoint named `after_kabir`, insert **(4, \'Meera\', \'Pune\')**, then **roll back only to the savepoint** and commit. Result: Kabir is saved, Meera is not.',
      example: { title: 'SAVEPOINT and partial rollback', code: "START TRANSACTION;\nINSERT INTO logs VALUES (1, 'step 1');\nSAVEPOINT sp1;\nINSERT INTO logs VALUES (2, 'step 2');\nROLLBACK TO SAVEPOINT sp1;   -- undoes only step 2\nCOMMIT;" },
      setup: COLLEGE,
      starter: '-- START TRANSACTION; ... SAVEPOINT ...; ... ROLLBACK TO ...; COMMIT;\n',
      solution: "START TRANSACTION;\nINSERT INTO students VALUES (3, 'Kabir', 'Nagpur');\nSAVEPOINT after_kabir;\nINSERT INTO students VALUES (4, 'Meera', 'Pune');\nROLLBACK TO SAVEPOINT after_kabir;\nCOMMIT;",
      check: 'SELECT student_id, first_name, city FROM students ORDER BY student_id;',
      explain: '`ROLLBACK TO SAVEPOINT name` undoes only the work done after the savepoint; the transaction stays open, so you still need COMMIT. A plain `ROLLBACK` would have undone Kabir too.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'A clerk deletes **all** accounts by mistake inside a transaction. Write the statements: start a transaction, run `DELETE FROM accounts;`, then **undo** it so that all 3 accounts are back.',
      example: { title: 'undo with ROLLBACK', code: 'START TRANSACTION;\nUPDATE products SET price = 0;   -- oops\nROLLBACK;                        -- prices restored' },
      setup: BANK,
      starter: '-- START TRANSACTION; DELETE ...; ...\n',
      solution: 'START TRANSACTION;\nDELETE FROM accounts;\nROLLBACK;\nSELECT * FROM accounts;',
      explain: 'ROLLBACK discards every change since START TRANSACTION. This is why experienced developers wrap risky UPDATE/DELETE statements in a transaction, check the result with SELECT and only then COMMIT.',
    },
  ],
};
