const BANK = `CREATE TABLE Accounts (
    AccNo INT PRIMARY KEY,
    Holder NVARCHAR(30),
    Balance INT CHECK (Balance >= 0)
);
INSERT INTO Accounts VALUES (101, 'Asha', 5000), (102, 'Ravi', 1200), (103, 'Meena', 800);`;

export default {
  lesson: 'day-050-triggers-transactions-indexes-normalization',
  minutes: 24,
  intro: 'Practise transactions (COMMIT / ROLLBACK), understand triggers and indexes, and recognise normal forms (1NF, 2NF, 3NF).',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Transfer **2000** from Asha (101) to Ravi (102) **as one transaction**: begin a transaction, subtract from 101, add to 102, commit.',
      example: { title: 'money transfer', code: 'BEGIN TRANSACTION;\nUPDATE Wallets SET Amount = Amount - 100 WHERE Id = 1;\nUPDATE Wallets SET Amount = Amount + 100 WHERE Id = 2;\nCOMMIT TRANSACTION;' },
      setup: BANK,
      starter: '-- BEGIN TRANSACTION;\n',
      solution: 'BEGIN TRANSACTION;\nUPDATE Accounts SET Balance = Balance - 2000 WHERE AccNo = 101;\nUPDATE Accounts SET Balance = Balance + 2000 WHERE AccNo = 102;\nCOMMIT TRANSACTION;',
      check: 'SELECT AccNo, Balance FROM Accounts ORDER BY AccNo;',
      explain: 'Both updates must succeed together (**atomicity**). If the second update failed and there were no transaction, 2000 would vanish from Asha\'s account without reaching Ravi.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Practise **ROLLBACK**: begin a transaction, set **every** balance to 0 (a "mistake"), then roll the transaction back. Finally, add 500 to Meena\'s account (103) outside the transaction.',
      example: { title: 'undoing a mistake', code: 'BEGIN TRANSACTION;\nDELETE FROM Orders;          -- oops, no WHERE!\nROLLBACK TRANSACTION;        -- all orders are back' },
      setup: BANK,
      starter: '-- BEGIN TRANSACTION; ... ROLLBACK; ...\n',
      solution: 'BEGIN TRANSACTION;\nUPDATE Accounts SET Balance = 0;\nROLLBACK TRANSACTION;\nUPDATE Accounts SET Balance = Balance + 500 WHERE AccNo = 103;',
      check: 'SELECT AccNo, Balance FROM Accounts ORDER BY AccNo;',
      explain: '`ROLLBACK` undoes every change since `BEGIN TRANSACTION`, so the balances return to 5000, 1200, 800; then Meena gets +500 → 1300. Running risky UPDATE/DELETE inside a transaction is a good safety habit in SSMS.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'An **AFTER INSERT trigger** writes an audit row. After the script runs, what does the final SELECT return? (type only the value of the single column)',
      example: { title: 'trigger with the inserted table', code: 'CREATE TRIGGER trg_LogOrder ON Orders AFTER INSERT AS\nBEGIN\n    INSERT INTO OrderLog (OrderId) SELECT OrderId FROM inserted;\nEND;' },
      code: `CREATE TABLE AuditLog (Msg NVARCHAR(100));
GO
CREATE TRIGGER trg_Accounts_Insert ON Accounts
AFTER INSERT
AS
BEGIN
    INSERT INTO AuditLog (Msg)
    SELECT 'New account ' + CAST(AccNo AS VARCHAR(10)) FROM inserted;
END;
GO
INSERT INTO Accounts VALUES (104, 'Kiran', 3000), (105, 'Neha', 900);
UPDATE Accounts SET Balance = Balance + 100 WHERE AccNo = 101;
SELECT COUNT(*) AS LogRows FROM AuditLog;`,
      expected: '2',
      explain: 'The trigger fires **once per statement**, and the special `inserted` table contains both new rows, so 2 audit rows are written. The UPDATE does not fire an AFTER INSERT trigger. Always write triggers to handle multi-row statements.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A query `SELECT * FROM Orders WHERE CustomerEmail = \'x@mail.com\'` is slow on 5 million rows. What is the usual fix?',
      options: [
        'Add more columns to the table',
        'Create a nonclustered index on CustomerEmail',
        'Use SELECT DISTINCT',
        'Delete old orders every day',
      ],
      answer: 1,
      explain: '`CREATE NONCLUSTERED INDEX IX_Orders_Email ON Orders(CustomerEmail);` lets SQL Server **seek** directly to matching rows instead of scanning all 5 million. Indexes speed up reads but slow writes a little and use disk space, so add them where queries need them.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Normalization: which statements are TRUE? (choose all that apply)',
      options: [
        '1NF: every column holds atomic (single) values, e.g. no "C#, SQL, React" in one Skills column',
        '2NF: in a table with a composite key, non-key columns must depend on the whole key, not just part of it',
        '3NF: non-key columns must not depend on other non-key columns (no transitive dependency, e.g. storing DeptName next to DeptId)',
        'Normalization increases duplicate data',
        'Normalization reduces update, insert and delete anomalies',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Normalization **reduces** redundancy by splitting data into related tables, which prevents anomalies (e.g. changing a department name in hundreds of rows). Reporting databases are sometimes deliberately denormalised for speed.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'ACID describes reliable transactions: **A**tomicity, **C**onsistency, **I**solation and **D**______. Complete the last word.',
      example: { title: 'ACID', text: 'Atomicity = all or nothing\nConsistency = rules/constraints always hold\nIsolation = concurrent transactions do not interfere\nD… = once committed, data survives a crash' },
      accept: ['Durability'],
      explain: '**Durability**: after COMMIT, the change is written to the transaction log and survives power failures or restarts. SQL Server guarantees all four ACID properties.',
    },
  ],
};
