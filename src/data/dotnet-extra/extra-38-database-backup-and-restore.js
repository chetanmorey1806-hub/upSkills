const q1 = `-- Run in real SQL Server (BACKUP/RESTORE are not supported in the in-app lab)
-- 1) A sample database to protect
CREATE DATABASE SchoolDB;
GO
USE SchoolDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Marks INT NOT NULL
);
INSERT INTO Students (Name, Marks) VALUES ('Asha', 91), ('Ravi', 67), ('Meera', 78);
GO
-- 2) FULL backup to a .bak file (the folder must exist and the SQL Server service account needs write access)
BACKUP DATABASE SchoolDB
TO DISK = N'C:\\SQLBackups\\SchoolDB_Full_20261117.bak'
WITH INIT,                 -- overwrite the file instead of appending
     COMPRESSION,          -- smaller file (Standard/Enterprise/Developer editions)
     CHECKSUM,             -- verify page checksums while writing
     STATS = 25,           -- progress messages every 25 percent
     NAME = N'SchoolDB full backup';
GO
-- 3) Verify that the backup file is readable (does not restore anything)
RESTORE VERIFYONLY
FROM DISK = N'C:\\SQLBackups\\SchoolDB_Full_20261117.bak'
WITH CHECKSUM;
GO
-- 4) Look inside the file
RESTORE HEADERONLY   FROM DISK = N'C:\\SQLBackups\\SchoolDB_Full_20261117.bak';  -- backup type, dates, LSNs
RESTORE FILELISTONLY FROM DISK = N'C:\\SQLBackups\\SchoolDB_Full_20261117.bak';  -- logical/physical file names`;

const q2 = `-- Run in real SQL Server. Continues from Example 1 (SchoolDB and its full backup).
-- 1) Check and set the recovery model
SELECT name, recovery_model_desc FROM sys.databases WHERE name = 'SchoolDB';
ALTER DATABASE SchoolDB SET RECOVERY FULL;    -- needed for log backups / point-in-time restore
GO
-- After changing to FULL, take a full backup to start the log chain
BACKUP DATABASE SchoolDB TO DISK = N'C:\\SQLBackups\\SchoolDB_Full.bak' WITH INIT, CHECKSUM;
GO
-- 2) Day 1 changes, then a DIFFERENTIAL backup (only pages changed since the last full)
USE SchoolDB;
INSERT INTO Students (Name, Marks) VALUES ('Kiran', 55);
GO
BACKUP DATABASE SchoolDB TO DISK = N'C:\\SQLBackups\\SchoolDB_Diff.bak'
WITH DIFFERENTIAL, INIT, CHECKSUM;
GO
-- 3) More changes, then a TRANSACTION LOG backup (every change since the last log backup)
INSERT INTO Students (Name, Marks) VALUES ('John', 85);
GO
BACKUP LOG SchoolDB TO DISK = N'C:\\SQLBackups\\SchoolDB_Log1.trn' WITH INIT, CHECKSUM;
GO
-- 4) Backup history recorded in msdb
SELECT TOP (10) database_name,
       CASE type WHEN 'D' THEN 'Full' WHEN 'I' THEN 'Differential' WHEN 'L' THEN 'Log' END AS BackupType,
       backup_start_date, CAST(backup_size / 1024.0 / 1024 AS DECIMAL(10,2)) AS SizeMB
FROM msdb.dbo.backupset
WHERE database_name = 'SchoolDB'
ORDER BY backup_start_date DESC;`;

const q3 = `-- Run in real SQL Server. Uses the backups taken in Example 2.
USE master;     -- you cannot restore a database while you are using it
GO
-- A) Restore the whole chain over the existing database: FULL -> DIFF -> LOG
ALTER DATABASE SchoolDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;   -- disconnect other users
GO
RESTORE DATABASE SchoolDB FROM DISK = N'C:\\SQLBackups\\SchoolDB_Full.bak'
WITH REPLACE, NORECOVERY;          -- NORECOVERY = more backups will follow
RESTORE DATABASE SchoolDB FROM DISK = N'C:\\SQLBackups\\SchoolDB_Diff.bak'
WITH NORECOVERY;
RESTORE LOG SchoolDB FROM DISK = N'C:\\SQLBackups\\SchoolDB_Log1.trn'
WITH RECOVERY;                     -- last step: bring the database ONLINE
-- (for point-in-time recovery use: WITH STOPAT = '2026-11-17 10:42:00', RECOVERY)
GO
ALTER DATABASE SchoolDB SET MULTI_USER;
GO
SELECT StudentId, Name, Marks FROM SchoolDB.dbo.Students ORDER BY StudentId;
GO
-- B) Restore a COPY under a new name (e.g. for testing) - move the files to new paths
RESTORE FILELISTONLY FROM DISK = N'C:\\SQLBackups\\SchoolDB_Full.bak';   -- read logical names first
RESTORE DATABASE SchoolDB_Test
FROM DISK = N'C:\\SQLBackups\\SchoolDB_Full.bak'
WITH MOVE N'SchoolDB'     TO N'C:\\SQLData\\SchoolDB_Test.mdf',
     MOVE N'SchoolDB_log' TO N'C:\\SQLData\\SchoolDB_Test_log.ldf',
     RECOVERY, STATS = 50;
GO
SELECT COUNT(*) AS StudentsInTestCopy FROM SchoolDB_Test.dbo.Students;`;

const q4 = `CREATE DATABASE SafetyCopyDB;
GO
USE SafetyCopyDB;
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Price INT NOT NULL
);
GO
INSERT INTO Products (Name, Price) VALUES
('Pen', 20), ('Notebook', 60), ('Mouse', 500), ('Keyboard', 1500);
GO
-- 1) Take a quick table-level safety copy before a risky change
SELECT ProductId, Name, Price
INTO Products_Backup_20261117
FROM Products;
GO
-- 2) The "mistake": an UPDATE without WHERE changes every price
UPDATE Products SET Price = 0;
GO
SELECT ProductId, Name, Price FROM Products ORDER BY ProductId;
GO
-- 3) Repair the rows from the safety copy with a correlated subquery
--    (in SSMS you can also write UPDATE p SET p.Price = b.Price FROM Products p JOIN ...)
UPDATE Products
SET Price = (SELECT b.Price FROM Products_Backup_20261117 b
             WHERE b.ProductId = Products.ProductId);
GO
SELECT p.ProductId, p.Name, p.Price, b.Price AS BackupPrice
FROM Products p
JOIN Products_Backup_20261117 b ON b.ProductId = p.ProductId
ORDER BY p.ProductId;
GO
-- 4) Remove the copy when you are sure everything is fine
DROP TABLE Products_Backup_20261117;`;

export default {
  id: 'extra-38-database-backup-and-restore',
  title: 'Database Backup and Restore',
  module: 'Extra: SQL Server',
  extraNo: 38,
  level: 'Intermediate to Advanced',
  duration: '2 hours',
  summary: `Hardware fails, people run UPDATE without WHERE, and ransomware happens - backups are the last line of defence. Learn SQL Server recovery models (Simple, Full, Bulk-logged), full, differential and transaction-log backups, the backup chain, restoring with NORECOVERY/RECOVERY, point-in-time restore with STOPAT, restoring a copy with MOVE, verifying backups, the SSMS backup/restore wizards, SQL Agent scheduling and a quick table-level safety copy before risky changes.`,
  objectives: [
    'Explain recovery models and choose one for a database',
    'Take full, differential and transaction log backups with T-SQL and SSMS',
    'Restore a backup chain with NORECOVERY and RECOVERY, including point-in-time',
    'Restore a database copy with a new name using MOVE, and verify backups',
    'Design a simple backup strategy (RPO/RTO) and schedule it with SQL Server Agent',
  ],
  theory: [
    {
      heading: 'Why backups and the key terms',
      content: `A **backup** is a copy of the database (data pages plus enough log) saved to a file (.bak for data, .trn for log by convention). A **restore** rebuilds the database from those files.

Two business questions decide your strategy:
- **RPO** (Recovery Point Objective) - how much data can we afford to lose? (e.g. 15 minutes)
- **RTO** (Recovery Time Objective) - how long can we be down? (e.g. 1 hour)

Analogy: a full backup is a photo of your whole room, a differential backup is a photo of only what changed since that big photo, and log backups are a CCTV recording of every movement - with the recording you can rewind to any second.

Golden rules: backups are worthless until a **restore is tested**; keep copies **off the server** (another disk, network share, Azure Blob - BACKUP TO URL); and back up the system databases **master** and **msdb** too.`,
    },
    {
      heading: 'Recovery models',
      content: `| Model | Log backups? | Point-in-time restore? | Log file behaviour | Typical use |
|---|---|---|---|---|
| SIMPLE | no | no - only to the last full/diff backup | truncated automatically at checkpoints | dev/test, data that can be reloaded |
| FULL | yes | yes | grows until a log backup is taken | production OLTP databases |
| BULK_LOGGED | yes | limited (not inside bulk operations) | minimal logging for bulk loads | temporarily during large imports |

Check: SELECT name, recovery_model_desc FROM sys.databases;
Change: ALTER DATABASE SchoolDB SET RECOVERY FULL;

Common production problem: a FULL recovery database with **no log backups** - the .ldf file keeps growing until the disk is full. Either schedule log backups or use SIMPLE.`,
    },
    {
      heading: 'Backup types',
      content: `- **Full**: the entire database. Every chain starts here. BACKUP DATABASE db TO DISK = '...'
- **Differential**: pages changed since the **last full** backup (they grow over the week). WITH DIFFERENTIAL
- **Transaction log**: all log records since the **last log backup** - small and frequent (every 5-15 minutes). BACKUP LOG db TO DISK = '...'. Only in FULL/BULK_LOGGED.
- **Copy-only**: WITH COPY_ONLY - an ad-hoc full backup that does not disturb the differential base (use it when a developer needs a copy).
- **Tail-log backup**: BACKUP LOG ... WITH NORECOVERY taken just before a restore to capture the last changes.

Useful options: INIT (overwrite file), COMPRESSION, CHECKSUM, STATS = n, ENCRYPTION (with a certificate), NAME/DESCRIPTION.

Example weekly strategy: Full every Sunday 1 AM, Differential every night, Log every 15 minutes. Worst case loss = 15 minutes (RPO).`,
      syntax: `BACKUP DATABASE SchoolDB TO DISK = N'D:\\Bak\\SchoolDB_Full.bak' WITH INIT, COMPRESSION, CHECKSUM;
BACKUP DATABASE SchoolDB TO DISK = N'D:\\Bak\\SchoolDB_Diff.bak' WITH DIFFERENTIAL, INIT;
BACKUP LOG SchoolDB TO DISK = N'D:\\Bak\\SchoolDB_Log.trn' WITH INIT;`,
    },
    {
      heading: 'Restoring: NORECOVERY, RECOVERY, STOPAT and MOVE',
      content: `Restore order: **last full -> last differential (if any) -> every log backup after it, in order**.

- **WITH NORECOVERY** - leaves the database in "Restoring..." state so more backups can be applied.
- **WITH RECOVERY** - rolls back uncommitted transactions and brings the database online. Use it on the **last** file only (RESTORE DATABASE db WITH RECOVERY also works on its own).
- **WITH REPLACE** - overwrite an existing database.
- **WITH STOPAT = 'datetime'** - stop log replay at a moment, e.g. one minute before someone ran DELETE without WHERE.
- **WITH MOVE 'logical' TO 'path'** - put data/log files in new locations (restoring a copy under a new name or on another server). Get logical names with RESTORE FILELISTONLY.
- **RESTORE VERIFYONLY** - checks the backup is complete and readable (WITH CHECKSUM verifies pages too) without restoring.

You must not be connected to the database you restore (USE master) - set it to SINGLE_USER WITH ROLLBACK IMMEDIATE to disconnect others.`,
    },
    {
      heading: 'SSMS wizards, SQL Agent and cloud',
      content: `**Backup in SSMS**: Object Explorer > right-click the database > **Tasks > Back Up...** > Backup type (Full/Differential/Transaction Log) > Destination: Add... a .bak path > Media Options (Overwrite, Verify backup, Perform checksum) > Backup Options (Compression) > OK.

**Restore in SSMS**: right-click **Databases > Restore Database...** > Source: Device > ... > Add the .bak file(s) > SSMS shows the backup sets and builds the chain > Files page: "Relocate all files" to change paths > Options page: Overwrite (WITH REPLACE), Recovery state > OK. The **Timeline...** button lets you pick a point in time.

**Scheduling**: SQL Server Agent > Maintenance Plans > Maintenance Plan Wizard (Back Up Database tasks + cleanup of old files), or Agent Jobs with T-SQL steps. Many DBAs use the free Ola Hallengren maintenance solution. (SQL Server Express has no Agent - use Windows Task Scheduler with sqlcmd.)

**Azure SQL Database** takes automatic backups with point-in-time restore (7-35 days); you restore from the Azure portal.`,
    },
  ],
  examples: [
    {
      title: 'Full backup with verification (SSMS)',
      scenario: 'Create SchoolDB, take a compressed, checksummed full backup to C:\\SQLBackups, verify it and look at its header and file list.',
      steps: [
        'Create the folder C:\\SQLBackups on the SQL Server machine',
        'In SSMS click New Query (Ctrl+N) - BACKUP/RESTORE are not supported in the in-app lab',
        'Paste the script and press F5; watch the progress messages in the Messages tab',
        'GUI alternative: right-click SchoolDB > Tasks > Back Up... > Backup type Full > Add the destination file > Media Options: Overwrite all existing backup sets, Verify backup when finished, Perform checksum > OK',
      ],
      code: q1,
      result: `Messages tab (page numbers and speeds vary):
25 percent processed.
50 percent processed.
75 percent processed.
100 percent processed.
Processed 360 pages for database 'SchoolDB', file 'SchoolDB' on file 1.
Processed 2 pages for database 'SchoolDB', file 'SchoolDB_log' on file 1.
BACKUP DATABASE successfully processed 362 pages in 0.051 seconds (55.4 MB/sec).
The backup set on file 1 is valid.

Results: HEADERONLY shows BackupType = 1 (full), BackupName = SchoolDB full backup, DatabaseName = SchoolDB, BackupStartDate ...
FILELISTONLY shows LogicalName SchoolDB (D = data, .mdf) and SchoolDB_log (L = log, .ldf)`,
      explanation: `WITH INIT overwrites the file each time, COMPRESSION makes it several times smaller, CHECKSUM validates every page while writing and STATS prints progress. RESTORE VERIFYONLY reads the whole file and confirms it is usable without touching the live database. FILELISTONLY gives the logical file names you need later for RESTORE ... WITH MOVE. The path is on the SQL Server machine, not on your own PC if you connect to a remote server.`,
    },
    {
      title: 'Recovery model, differential and log backups (SSMS)',
      scenario: 'Switch SchoolDB to FULL recovery, start a backup chain, take a differential backup after day-1 changes and a log backup after more changes, then read the backup history from msdb.',
      steps: [
        'Run Example 1 first',
        'In SSMS open a New Query window (Ctrl+N), paste the script and press F5',
        'Check the final result grid - msdb.dbo.backupset records every backup',
        'GUI alternative: right-click SchoolDB > Properties > Options > Recovery model = Full; then Tasks > Back Up... with Backup type Differential or Transaction Log',
      ],
      code: q2,
      result: `Result 1:
name      recovery_model_desc
SchoolDB  FULL        (SIMPLE if it was created from a SIMPLE model database)

Final result (dates are your run times; sizes vary):
database_name  BackupType    backup_start_date        SizeMB
SchoolDB       Log           2026-11-17 10:45:12.000  0.08
SchoolDB       Differential  2026-11-17 10:45:11.000  1.08
SchoolDB       Full          2026-11-17 10:45:10.000  3.08
SchoolDB       Full          2026-11-17 10:30:02.000  3.08`,
      explanation: `The recovery model is inherited from the model database (FULL on most editions, SIMPLE on Express/Developer installs configured that way), so we set it explicitly. After switching to FULL a full backup must be taken - log backups are only possible once a full backup exists. The differential contains the pages changed by inserting Kiran; the log backup contains every change since the last log backup (including John). msdb keeps the history used by the SSMS restore wizard to build the chain automatically.`,
    },
    {
      title: 'Restore the chain and restore a copy with MOVE (SSMS)',
      scenario: 'Restore SchoolDB from full + differential + log backups, then restore the full backup again as SchoolDB_Test with new file paths for testing.',
      steps: [
        'Run Examples 1 and 2 first, and create the folder C:\\SQLData',
        'In SSMS open a New Query window (Ctrl+N), paste the script and press F5',
        'Refresh Object Explorer (F5 on the Databases node) to see SchoolDB_Test',
        'GUI alternative: right-click Databases > Restore Database... > Device > add the .bak/.trn files > check all backup sets > Files: Relocate all files > Options: Overwrite the existing database > OK',
      ],
      code: q3,
      result: `Messages: RESTORE DATABASE successfully processed ... pages (three times: full, diff, log)

StudentId  Name   Marks
1          Asha   91
2          Ravi   67
3          Meera  78
4          Kiran  55
5          John   85

StudentsInTestCopy
3`,
      explanation: `The full and differential backups are restored WITH NORECOVERY so the database waits in the Restoring state, and the log backup is restored WITH RECOVERY to bring it online - all 5 students are back. SINGLE_USER WITH ROLLBACK IMMEDIATE disconnects other sessions; MULTI_USER allows them again. The test copy is restored from the full backup only (taken before Kiran and John were added), so it contains 3 students; MOVE places its files at new paths so they do not clash with the original database files.`,
    },
    {
      title: 'Table-level safety copy before a risky change (runs in the lab)',
      scenario: 'Before a bulk price update, copy the table with SELECT ... INTO. When the update goes wrong (no WHERE clause!), repair the data from the copy without a full database restore.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab) and click New Query (Ctrl+N)',
        'Paste the script - it creates SafetyCopyDB',
        'Press F5 and compare the "after mistake" and "after repair" result grids',
        'In production, combine this with a real BACKUP and a BEGIN TRAN ... ROLLBACK safety net',
      ],
      code: q4,
      tsql: q4,
      result: `+-----------+----------+-------+
| ProductId | Name     | Price |
+-----------+----------+-------+
| 1         | Pen      | 0     |
| 2         | Notebook | 0     |
| 3         | Mouse    | 0     |
| 4         | Keyboard | 0     |
+-----------+----------+-------+
4 row(s) returned

+-----------+----------+-------+-------------+
| ProductId | Name     | Price | BackupPrice |
+-----------+----------+-------+-------------+
| 1         | Pen      | 20    | 20          |
| 2         | Notebook | 60    | 60          |
| 3         | Mouse    | 500   | 500         |
| 4         | Keyboard | 1500  | 1500        |
+-----------+----------+-------+-------------+
4 row(s) returned`,
      explanation: `SELECT ... INTO creates Products_Backup_20261117 with the same columns and data. The UPDATE without WHERE sets every price to 0. The repair UPDATE uses a correlated subquery to copy each product's price back from the safety copy by ProductId (in SSMS you may also write UPDATE ... FROM ... JOIN). The final SELECT proves Price equals BackupPrice for every row. This is not a replacement for real backups - it only protects one table for a short time.`,
    },
  ],
  interview: [
    { q: 'What are the recovery models in SQL Server?', a: 'SIMPLE (no log backups, log auto-truncates, restore only to the last full/diff), FULL (log backups, point-in-time restore) and BULK_LOGGED (minimal logging for bulk operations, limited point-in-time).', level: 'Easy' },
    { q: 'Difference between full, differential and log backups?', a: 'Full copies the whole database. Differential copies pages changed since the last full backup. Log backup copies the transaction log records since the last log backup and enables point-in-time recovery.', level: 'Easy' },
    { q: 'What is the restore sequence?', a: 'Latest full backup WITH NORECOVERY, then the latest differential WITH NORECOVERY, then every subsequent log backup in order, with the last one WITH RECOVERY (optionally STOPAT).', level: 'Medium' },
    { q: 'Difference between WITH RECOVERY and WITH NORECOVERY?', a: 'RECOVERY completes the restore, rolls back uncommitted transactions and brings the database online. NORECOVERY leaves it in Restoring state so more backups can be applied.', level: 'Medium' },
    { q: 'Why is my transaction log file huge?', a: 'Usually the database is in FULL recovery with no log backups (or a long-running/open transaction or replication is holding the log). Schedule log backups or switch to SIMPLE if point-in-time restore is not needed.', level: 'Medium' },
    { q: 'What is a COPY_ONLY backup?', a: 'A full (or log) backup that does not affect the normal backup chain - it does not reset the differential base. Use it for ad-hoc copies.', level: 'Medium' },
    { q: 'What is a tail-log backup?', a: 'A log backup taken just before restoring (BACKUP LOG ... WITH NORECOVERY) to capture changes made since the last log backup, so no data is lost.', level: 'Hard' },
    { q: 'How do you restore a database under a different name?', a: 'RESTORE DATABASE NewName FROM DISK = ... WITH MOVE \'LogicalData\' TO \'new.mdf\', MOVE \'LogicalLog\' TO \'new_log.ldf\'. Read logical names with RESTORE FILELISTONLY.', level: 'Medium' },
    { q: 'How do you verify a backup?', a: 'Take it WITH CHECKSUM, run RESTORE VERIFYONLY ... WITH CHECKSUM, and most importantly perform regular test restores (and DBCC CHECKDB on the restored copy).', level: 'Medium' },
    { q: 'What are RPO and RTO?', a: 'RPO is the maximum acceptable data loss (drives backup frequency); RTO is the maximum acceptable downtime (drives restore speed and process).', level: 'Easy' },
    { q: 'Can you back up a database to Azure?', a: 'Yes: BACKUP DATABASE ... TO URL = \'https://account.blob.core.windows.net/container/db.bak\' with a credential. Azure SQL Database also takes automatic backups.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write T-SQL to take a COPY_ONLY compressed full backup of SchoolDB for a developer, without breaking the production differential chain.',
      hint: 'WITH COPY_ONLY, COMPRESSION, INIT.',
      solution: `BACKUP DATABASE SchoolDB
TO DISK = N'C:\\SQLBackups\\SchoolDB_ForDev.bak'
WITH COPY_ONLY, COMPRESSION, INIT, CHECKSUM;`,
    },
    {
      task: 'Someone deleted all students at 10:42:30 today. You have a full backup from last night and log backups every 15 minutes (latest at 10:45). Write the restore script to recover to 10:42:00.',
      hint: 'Take a tail-log backup first, then restore full NORECOVERY and each log NORECOVERY, the last one with STOPAT and RECOVERY.',
      solution: `USE master;
BACKUP LOG SchoolDB TO DISK = N'C:\\SQLBackups\\SchoolDB_Tail.trn' WITH NORECOVERY;   -- tail-log
RESTORE DATABASE SchoolDB FROM DISK = N'C:\\SQLBackups\\SchoolDB_Full.bak' WITH NORECOVERY, REPLACE;
RESTORE LOG SchoolDB FROM DISK = N'C:\\SQLBackups\\SchoolDB_Log_1030.trn' WITH NORECOVERY;
RESTORE LOG SchoolDB FROM DISK = N'C:\\SQLBackups\\SchoolDB_Log_1045.trn'
WITH STOPAT = '2026-11-17 10:42:00', RECOVERY;`,
    },
    {
      task: 'Write a query that lists, for each database, the date of its last full backup (or "Never").',
      hint: 'LEFT JOIN sys.databases with msdb.dbo.backupset WHERE type = \'D\' and group by name.',
      solution: `SELECT d.name,
       ISNULL(CONVERT(VARCHAR(20), MAX(b.backup_finish_date), 120), 'Never') AS LastFullBackup
FROM sys.databases d
LEFT JOIN msdb.dbo.backupset b ON b.database_name = d.name AND b.type = 'D'
WHERE d.name <> 'tempdb'
GROUP BY d.name
ORDER BY d.name;`,
    },
    {
      task: 'Design a backup plan for a shop database where the business accepts at most 10 minutes of data loss and 1 hour of downtime. Write the schedule.',
      hint: 'RPO 10 min -> log backups at least every 10 minutes; FULL recovery model; test restores.',
      solution: `Recovery model: FULL
Full backup: every Sunday 01:00 (COMPRESSION, CHECKSUM)
Differential: every night 01:00 (Mon-Sat)
Log backup: every 10 minutes, 24x7
Copy backups to a second location / Azure Blob after each job
Retention: 14 days on disk, 3 months off-site
Weekly test restore to a test server + DBCC CHECKDB
Restore time estimate: full + 1 diff + up to 144 logs < 1 hour (meets RTO)`,
    },
  ],
  quiz: [
    {
      question: 'Which recovery model allows point-in-time restore?',
      options: ['SIMPLE', 'FULL', 'None - only differential backups do', 'READ_ONLY'],
      answer: 1,
      explanation: 'FULL recovery keeps the log so it can be backed up and replayed to a specific time.',
    },
    {
      question: 'A differential backup contains changes since...',
      options: ['The last full backup', 'The last differential backup', 'The last log backup', 'The database was created'],
      answer: 0,
      explanation: 'Differentials are cumulative from the last full (non-copy-only) backup.',
    },
    {
      question: 'Which option is used on all restore steps except the last?',
      options: ['WITH RECOVERY', 'WITH REPLACE', 'WITH NORECOVERY', 'WITH MOVE'],
      answer: 2,
      explanation: 'NORECOVERY keeps the database in Restoring state so more backups can be applied.',
    },
    {
      question: 'Which command checks a backup file without restoring it?',
      options: ['RESTORE HEADERONLY', 'DBCC CHECKDB', 'BACKUP VERIFY', 'RESTORE VERIFYONLY'],
      answer: 3,
      explanation: 'RESTORE VERIFYONLY reads the backup and confirms it is complete and readable.',
    },
    {
      question: 'You restore a production backup on the same server as SchoolDB_Copy. What must you add?',
      options: ['WITH MOVE for each file so the .mdf/.ldf names do not clash', 'WITH COPY_ONLY', 'WITH DIFFERENTIAL', 'Nothing'],
      answer: 0,
      explanation: 'The original files are in use, so the copy needs new physical file paths via MOVE.',
    },
  ],
};
