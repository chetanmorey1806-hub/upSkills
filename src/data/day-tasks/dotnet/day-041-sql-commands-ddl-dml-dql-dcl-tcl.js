const STAFF = `CREATE TABLE Staff (
    Id INT PRIMARY KEY,
    Name NVARCHAR(50),
    City NVARCHAR(30),
    Salary INT
);
INSERT INTO Staff VALUES
(1, 'Asha', 'Pune', 40000),
(2, 'Ravi', 'Delhi', 35000),
(3, 'Meena', 'Pune', 52000),
(4, 'Om', 'Agra', 28000);`;

export default {
  lesson: 'day-041-sql-commands-ddl-dml-dql-dcl-tcl',
  minutes: 20,
  intro: 'Practise the five families of SQL commands: DDL (CREATE/ALTER/DROP), DML (INSERT/UPDATE/DELETE), DQL (SELECT), DCL (GRANT/REVOKE) and TCL (COMMIT/ROLLBACK).',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **DDL** (Data Definition Language) commands? (choose all that apply)',
      options: ['CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'UPDATE', 'GRANT'],
      answers: [0, 1, 2, 3],
      explain: 'DDL changes the **structure**: CREATE, ALTER, DROP, TRUNCATE (it deallocates the table\'s pages). UPDATE is DML (changes data) and GRANT is DCL (permissions).',
    },
    {
      type: 'fill',
      mins: 1,
      q: '`GRANT SELECT ON Staff TO ReportUser;` belongs to which category of SQL commands? (abbreviation)',
      example: { title: 'categories', text: 'DDL = structure, DML = data changes, DQL = SELECT, ??? = permissions, TCL = transactions' },
      accept: ['DCL', 'Data Control Language'],
      explain: '**DCL** (Data Control Language) = `GRANT`, `REVOKE` (and `DENY` in SQL Server): it controls who can do what. TCL covers `BEGIN TRAN`, `COMMIT`, `ROLLBACK`, `SAVE TRAN`.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'DDL + DML on the `Staff` table:\n1. **Add** a new column `Email NVARCHAR(100)` to the table (ALTER TABLE)\n2. Set the email of staff Id 1 to `asha@upskillr.in`',
      example: { title: 'ALTER and UPDATE', code: "ALTER TABLE Students ADD Phone NVARCHAR(15);\nUPDATE Students SET Phone = '9876543210' WHERE StudentId = 2;" },
      setup: STAFF,
      starter: '-- 1. ALTER TABLE ...\n-- 2. UPDATE ...\n',
      solution: "ALTER TABLE Staff ADD Email NVARCHAR(100);\nUPDATE Staff SET Email = 'asha@upskillr.in' WHERE Id = 1;",
      check: 'SELECT Id, Name, Email FROM Staff ORDER BY Id;',
      explain: 'In SQL Server the syntax is `ALTER TABLE t ADD col type` (no COLUMN keyword needed). New columns start as NULL for existing rows. Always add a `WHERE` to UPDATE, otherwise **every** row gets the same email.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'DML: give everyone in **Pune** a raise of **5000** and **delete** the staff member whose salary is below 30000.',
      example: { title: 'UPDATE with an expression, DELETE with a condition', code: "UPDATE Products SET Price = Price * 1.1 WHERE Category = 'Books';\nDELETE FROM Products WHERE Stock = 0;" },
      setup: STAFF,
      starter: '-- UPDATE ...\n-- DELETE ...\n',
      solution: "UPDATE Staff SET Salary = Salary + 5000 WHERE City = 'Pune';\nDELETE FROM Staff WHERE Salary < 30000;",
      check: 'SELECT Id, Name, City, Salary FROM Staff ORDER BY Id;',
      explain: '`SET Salary = Salary + 5000` uses the current value of each row. Only Om (28000) is below 30000 and is deleted. Running UPDATE/DELETE without WHERE is the most common (and dangerous) mistake.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'TCL: inside a transaction, insert a new staff member (5, \'Kiran\', \'Mumbai\', 45000) and reduce Ravi\'s (Id 2) salary by 5000, then **COMMIT** the transaction.',
      example: { title: 'a transaction', code: "BEGIN TRANSACTION;\nUPDATE Accounts SET Balance = Balance - 500 WHERE Id = 1;\nUPDATE Accounts SET Balance = Balance + 500 WHERE Id = 2;\nCOMMIT;" },
      setup: STAFF,
      starter: '-- BEGIN TRANSACTION;\n-- ...\n',
      solution: "BEGIN TRANSACTION;\nINSERT INTO Staff VALUES (5, 'Kiran', 'Mumbai', 45000);\nUPDATE Staff SET Salary = Salary - 5000 WHERE Id = 2;\nCOMMIT;",
      check: 'SELECT Id, Name, City, Salary FROM Staff ORDER BY Id;',
      explain: '`BEGIN TRANSACTION` groups statements so they succeed or fail **together**. `COMMIT` makes the changes permanent; `ROLLBACK` would undo both. Banking transfers are the classic example.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the difference between `DELETE FROM Staff;` and `TRUNCATE TABLE Staff;`?',
      options: [
        'There is no difference',
        'TRUNCATE removes all rows quickly, cannot have a WHERE and resets IDENTITY; DELETE removes rows one by one, can use WHERE and logs each row',
        'DELETE drops the table structure',
        'TRUNCATE can delete only one row',
      ],
      answer: 1,
      explain: 'Both empty the table but keep its structure (`DROP TABLE` removes the structure). TRUNCATE is faster, minimally logged, resets the identity counter and fails if a foreign key references the table. DELETE supports WHERE and fires triggers.',
    },
  ],
};
