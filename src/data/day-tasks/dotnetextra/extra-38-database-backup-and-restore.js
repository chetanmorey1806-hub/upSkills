const PRODUCTS = `CREATE TABLE Products (ProductId INT PRIMARY KEY, Name NVARCHAR(50), Price INT);
INSERT INTO Products VALUES (1, 'Pen', 20), (2, 'Notebook', 60), (3, 'Bag', 650), (4, 'Bottle', 250);`;

const BROKEN = `CREATE TABLE Products (ProductId INT PRIMARY KEY, Name NVARCHAR(50), Price INT);
INSERT INTO Products VALUES (1, 'Pen', 20), (2, 'Notebook', 60), (3, 'Bag', 650), (4, 'Bottle', 250), (5, 'Ruler', 15);
CREATE TABLE Products_Backup (ProductId INT PRIMARY KEY, Name NVARCHAR(50), Price INT);
INSERT INTO Products_Backup SELECT ProductId, Name, Price FROM Products WHERE ProductId <= 4;
-- oops: someone ran an UPDATE without WHERE
UPDATE Products SET Price = 0;`;

export default {
  lesson: 'extra-38-database-backup-and-restore',
  minutes: 25,
  intro: 'Plan full, differential and log backups, restore them in the right order, and make quick table-level safety copies.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What does a **differential** backup contain?',
      options: ['Only changes since the last log backup', 'All changes since the last **full** backup', 'Only the transaction log', 'A copy of one table'],
      answer: 1,
      explain: 'A differential backup stores every extent changed since the last full backup, so it grows during the week. To restore you need the full backup plus only the **latest** differential (then any later log backups).',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the command that writes a full backup of \`SchoolDb\` to a file:
\`______ SchoolDb TO DISK = 'D:\\Backups\\SchoolDb_Full.bak' WITH CHECKSUM;\``,
      example: { title: 'log backup', code: "BACKUP LOG SchoolDb TO DISK = 'D:\\Backups\\SchoolDb_Log1.trn';" },
      accept: ['BACKUP DATABASE'],
      explain: '`BACKUP DATABASE name TO DISK = \'path\'` creates a full backup. `WITH CHECKSUM` verifies pages while writing; run `RESTORE VERIFYONLY` afterwards to check the file is readable. (BACKUP/RESTORE run only in real SQL Server, not in the browser lab.)',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You want **point-in-time** recovery (e.g. restore to 10:42 just before a bad DELETE). Which recovery model is required?',
      options: ['SIMPLE', 'FULL (or BULK_LOGGED with care)', 'Any model works', 'READ_ONLY'],
      answer: 1,
      explain: 'Point-in-time restore needs **log backups**, which are only possible in the FULL (or BULK_LOGGED) recovery model. In SIMPLE the log is truncated automatically, so you can only restore to the time of a full/differential backup.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Restore sequence: Sunday full, Wednesday differential, then log backups L1, L2, L3. Which statements are CORRECT? Select all that apply.',
      options: ['Restore the full backup `WITH NORECOVERY`', 'Then restore Wednesday\'s differential `WITH NORECOVERY`', 'Then restore L1, L2 and L3 in order; the last one `WITH RECOVERY`', 'Logs can be restored in any order', 'Using `WITH RECOVERY` on the first step lets you apply more backups later'],
      answers: [0, 1, 2],
      explain: '`NORECOVERY` keeps the database in the restoring state so more backups can be applied; the final step uses `RECOVERY` to bring it online. Logs must be applied in sequence. After `WITH RECOVERY` no further backups can be restored.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 4,
      q: 'Before a risky price update, make a **table-level safety copy**: create `Products_Backup` containing all rows and columns of `Products` in one statement.',
      example: { title: 'copying a table', code: 'SELECT * INTO Students_Copy FROM Students;' },
      setup: PRODUCTS,
      starter: '-- create Products_Backup from Products in one statement\n',
      solution: 'SELECT * INTO Products_Backup FROM Products;',
      check: 'SELECT ProductId, Name, Price FROM Products_Backup ORDER BY ProductId',
      explain: '`SELECT * INTO NewTable FROM Table` creates the table and copies the data. It is a quick undo option for one change, but **not** a replacement for real backups: it copies no indexes, constraints or permissions and lives in the same database.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: `Someone ran \`UPDATE Products SET Price = 0;\` without a WHERE. Restore the **Price** of every product from \`Products_Backup\` (matched by \`ProductId\`). Product 5 (Ruler) is not in the backup: keep its current value.
Use a correlated subquery (the lab does not support \`UPDATE ... FROM ... JOIN\`).`,
      example: { title: 'correlated UPDATE', code: `UPDATE Stock
SET Qty = (SELECT n.Qty FROM NewStock n WHERE n.ItemId = Stock.ItemId)
WHERE ItemId IN (SELECT ItemId FROM NewStock);` },
      setup: BROKEN,
      starter: '-- UPDATE Products SET Price = (SELECT ...) WHERE ...\n',
      solution: 'UPDATE Products\nSET Price = (SELECT b.Price FROM Products_Backup b WHERE b.ProductId = Products.ProductId)\nWHERE ProductId IN (SELECT ProductId FROM Products_Backup);',
      check: 'SELECT ProductId, Name, Price FROM Products ORDER BY ProductId',
      explain: 'The subquery reads the old price for the same ProductId. The `WHERE ... IN (backup ids)` matters: without it the Ruler (no backup row) would get NULL. In SSMS you could also write `UPDATE p SET p.Price = b.Price FROM Products p JOIN Products_Backup b ON b.ProductId = p.ProductId;`.',
    },
  ],
};
