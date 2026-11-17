export default {
  id: 'day-041-sql-commands-ddl-dml-dql-dcl-tcl',
  title: 'SQL Commands: DDL, DML, DQL, DCL and TCL',
  module: 'SQL Server & Database Management',
  day: 41,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn the five families of SQL commands - DDL (CREATE, ALTER, DROP, TRUNCATE), DML (INSERT, UPDATE, DELETE), DQL (SELECT), DCL (GRANT, REVOKE, DENY) and TCL (BEGIN TRAN, COMMIT, ROLLBACK, SAVE TRAN) - and practise CREATE, INSERT, UPDATE and DELETE on StudentDB.',
  objectives: [
    'Classify any SQL statement as DDL, DML, DQL, DCL or TCL',
    'Change table structure with CREATE, ALTER, DROP and TRUNCATE',
    'Insert, update and delete rows safely using WHERE',
    'Use BEGIN TRAN, COMMIT and ROLLBACK to undo mistakes',
  ],
  theory: [
    {
      heading: 'Five Categories of SQL Commands',
      content: 'SQL statements are grouped by what they work on. Remember: DDL changes the STRUCTURE, DML changes the DATA, DQL READS data, DCL controls PERMISSIONS and TCL controls TRANSACTIONS.',
      points: [
        'DDL - Data Definition Language: CREATE, ALTER, DROP, TRUNCATE, RENAME (sp_rename)',
        'DML - Data Manipulation Language: INSERT, UPDATE, DELETE (MERGE also)',
        'DQL - Data Query Language: SELECT',
        'DCL - Data Control Language: GRANT, REVOKE, DENY',
        'TCL - Transaction Control Language: BEGIN TRAN, COMMIT, ROLLBACK, SAVE TRAN',
      ],
      tip: 'Some books put SELECT inside DML. Interviewers accept both - just explain the reason.',
    },
    {
      heading: 'DDL: CREATE, ALTER, DROP, TRUNCATE',
      content: 'DDL commands define database objects (databases, tables, views, indexes, procedures).',
      syntax: `CREATE TABLE Students (StudentId INT IDENTITY(1,1) PRIMARY KEY, FullName NVARCHAR(100) NOT NULL);
ALTER TABLE Students ADD Marks INT;                 -- add column
ALTER TABLE Students ALTER COLUMN FullName NVARCHAR(150) NOT NULL;  -- change type
ALTER TABLE Students DROP COLUMN Marks;             -- remove column
EXEC sp_rename 'Students.FullName', 'StudentName', 'COLUMN';      -- rename
TRUNCATE TABLE Students;                            -- remove ALL rows, reset IDENTITY
DROP TABLE Students;                                -- remove table + data`,
      points: [
        'DROP removes the object itself; TRUNCATE keeps the table but empties it',
        'TRUNCATE is faster than DELETE (minimal logging), cannot have WHERE, resets IDENTITY, fails if a foreign key references the table',
        'DROP TABLE IF EXISTS Students; avoids an error when the table is missing (SQL Server 2016+)',
      ],
    },
    {
      heading: 'DML: INSERT, UPDATE, DELETE',
      content: 'DML changes rows. ALWAYS write the WHERE clause first for UPDATE and DELETE - without WHERE every row is changed.',
      syntax: `INSERT INTO Students (FullName, City) VALUES ('Asha', 'Pune');            -- one row
INSERT INTO Students (FullName, City) VALUES ('Ravi', 'Mumbai'), ('Kiran', 'Nagpur'); -- many rows
UPDATE Students SET City = 'Thane', Marks = 78 WHERE StudentId = 2;
DELETE FROM Students WHERE Marks < 40;`,
      points: [
        'List the column names in INSERT - safer when the table changes later',
        'Do not insert into an IDENTITY column (SET IDENTITY_INSERT ON is needed for that)',
        'UPDATE can use the current value: SET Marks = Marks + 5',
        'Messages tab tells how many rows were affected - check it every time',
        'Safe habit: run SELECT with the same WHERE first, then change SELECT to UPDATE/DELETE',
      ],
    },
    {
      heading: 'DQL: SELECT',
      content: 'SELECT reads data and returns a result set to the Results tab. It never changes data. SELECT * returns all columns; listing columns is better in real applications. Detailed SELECT features come on Day 42-47.',
      syntax: `SELECT StudentId, FullName, Marks FROM Students WHERE Marks >= 60 ORDER BY Marks DESC;`,
    },
    {
      heading: 'DCL: GRANT, REVOKE, DENY',
      content: 'DCL controls who can do what. A LOGIN lets someone connect to the server; a USER maps that login into a database; permissions are granted to users or roles. (DCL is not supported in the in-app lab - run it in real SSMS.)',
      syntax: `CREATE LOGIN trainee WITH PASSWORD = 'Str0ng@Pass1';
USE StudentDB;
CREATE USER trainee FOR LOGIN trainee;
GRANT SELECT, INSERT ON dbo.Students TO trainee;
DENY DELETE ON dbo.Students TO trainee;
REVOKE INSERT ON dbo.Students FROM trainee;`,
      points: [
        'GRANT gives a permission; DENY explicitly blocks it (DENY wins over GRANT); REVOKE removes a previous GRANT or DENY',
        'Fixed database roles: db_owner, db_datareader, db_datawriter',
        'SSMS GUI: Security > Logins > New Login...; StudentDB > Security > Users',
      ],
    },
    {
      heading: 'TCL: BEGIN TRAN, COMMIT, ROLLBACK',
      content: 'A transaction is a group of statements that succeed or fail together. By default each statement in SQL Server is its own auto-committed transaction. BEGIN TRAN starts an explicit transaction; COMMIT saves the changes permanently; ROLLBACK undoes everything since BEGIN TRAN. SAVE TRAN name creates a savepoint you can roll back to.',
      syntax: `BEGIN TRAN;
DELETE FROM Students;      -- oops!
ROLLBACK;                  -- all rows are back`,
      tip: 'When doing risky updates on real data, wrap them in BEGIN TRAN, check the row count, then COMMIT or ROLLBACK. Never leave a transaction open - it locks the rows for other users.',
    },
  ],
  examples: [
    {
      title: 'DDL: CREATE, ALTER and DROP',
      scenario: 'The Students table needs two new columns after it was created, and a temporary table must be removed.',
      steps: [
        'Open SSMS > New Query (Ctrl+N)',
        'Type the script and press F5',
        'Refresh StudentDB > Tables > dbo.Students > Columns in Object Explorer to see Marks and Email added',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    City NVARCHAR(50)
);
GO
ALTER TABLE Students ADD Marks INT;
GO
ALTER TABLE Students ADD Email VARCHAR(100);
GO
INSERT INTO Students (FullName, City, Marks, Email) VALUES ('Asha Patil', 'Pune', 88, 'asha@mail.com');
GO
SELECT * FROM Students;
GO
CREATE TABLE TempNotes (NoteId INT, Note NVARCHAR(50));
GO
DROP TABLE TempNotes;
GO
PRINT 'TempNotes dropped';`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    City NVARCHAR(50)
);
GO
ALTER TABLE Students ADD Marks INT;
GO
ALTER TABLE Students ADD Email VARCHAR(100);
GO
INSERT INTO Students (FullName, City, Marks, Email) VALUES ('Asha Patil', 'Pune', 88, 'asha@mail.com');
GO
SELECT * FROM Students;
GO
CREATE TABLE TempNotes (NoteId INT, Note NVARCHAR(50));
GO
DROP TABLE TempNotes;
GO
PRINT 'TempNotes dropped';`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> ALTER TABLE Students ADD Marks INT -> Commands completed successfully.
>> ALTER TABLE Students ADD Email VARCHAR(100) -> Commands completed successfully.
>> INSERT INTO Students (FullName, City, Marks, Email) VALUES ('Asha Pati -> (1 row affected)
>> SELECT * FROM Students
+-----------+------------+------+-------+---------------+
| StudentId | FullName   | City | Marks | Email         |
+-----------+------------+------+-------+---------------+
| 1         | Asha Patil | Pune | 88    | asha@mail.com |
+-----------+------------+------+-------+---------------+
1 row(s) returned
>> CREATE TABLE TempNotes (NoteId INT, Note NVARCHAR(50)) -> Commands completed successfully.
>> DROP TABLE TempNotes -> Commands completed successfully.
>> PRINT 'TempNotes dropped' -> TempNotes dropped`,
      explanation: 'ALTER TABLE ... ADD appends new columns at the end; existing rows get NULL in them. DROP TABLE removes TempNotes completely - structure and data.',
    },
    {
      title: 'DML: INSERT, UPDATE and DELETE',
      scenario: 'Day 41 practical: add students, give Pune students 5 bonus marks, change one student\'s city and remove failed students.',
      steps: [
        'New Query, type the script, press F5',
        'Read each "(n rows affected)" message in the Messages tab',
        'Check the final grid in the Results tab',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    City NVARCHAR(50),
    Marks INT
);
GO
INSERT INTO Students (FullName, City, Marks) VALUES ('Asha Patil', 'Pune', 88);
INSERT INTO Students (FullName, City, Marks) VALUES
('Ravi Kumar', 'Mumbai', 72),
('Kiran Shah', 'Nagpur', 91),
('Neha Joshi', 'Pune', 30);
GO
UPDATE Students SET Marks = Marks + 5 WHERE City = 'Pune';
GO
UPDATE Students SET City = 'Thane', Marks = 78 WHERE StudentId = 2;
GO
DELETE FROM Students WHERE Marks < 40;
GO
SELECT * FROM Students;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    City NVARCHAR(50),
    Marks INT
);
GO
INSERT INTO Students (FullName, City, Marks) VALUES ('Asha Patil', 'Pune', 88);
INSERT INTO Students (FullName, City, Marks) VALUES
('Ravi Kumar', 'Mumbai', 72),
('Kiran Shah', 'Nagpur', 91),
('Neha Joshi', 'Pune', 30);
GO
UPDATE Students SET Marks = Marks + 5 WHERE City = 'Pune';
GO
UPDATE Students SET City = 'Thane', Marks = 78 WHERE StudentId = 2;
GO
DELETE FROM Students WHERE Marks < 40;
GO
SELECT * FROM Students;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, City, Marks) VALUES ('Asha Patil', 'Pu -> (1 row affected)
>> INSERT INTO Students (FullName, City, Marks) VALUES -> (3 rows affected)
>> UPDATE Students SET Marks = Marks + 5 WHERE City = 'Pune' -> (2 rows affected)
>> UPDATE Students SET City = 'Thane', Marks = 78 WHERE StudentId = 2 -> (1 row affected)
>> DELETE FROM Students WHERE Marks < 40 -> (1 row affected)
>> SELECT * FROM Students
+-----------+------------+--------+-------+
| StudentId | FullName   | City   | Marks |
+-----------+------------+--------+-------+
| 1         | Asha Patil | Pune   | 93    |
| 2         | Ravi Kumar | Thane  | 78    |
| 3         | Kiran Shah | Nagpur | 91    |
+-----------+------------+--------+-------+
3 row(s) returned`,
      explanation: 'The first UPDATE touched 2 Pune rows (Asha 88->93, Neha 30->35). The second UPDATE changed two columns of StudentId 2. DELETE removed Neha because 35 < 40. Without WHERE, the UPDATE would have changed all 4 rows.',
    },
    {
      title: 'TCL: undo an accidental DELETE with ROLLBACK',
      scenario: 'Someone runs DELETE without WHERE inside a transaction - ROLLBACK saves the day.',
      steps: [
        'New Query, type the script, press F5',
        'Inside the transaction the count is 0; after ROLLBACK it is 3 again',
        'The second transaction is committed, so the change to Kiran is permanent',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Marks INT
);
GO
INSERT INTO Students (FullName, Marks) VALUES ('Asha Patil', 88), ('Ravi Kumar', 72), ('Kiran Shah', 91);
GO
BEGIN TRAN;
DELETE FROM Students;
SELECT COUNT(*) AS RowsInsideTran FROM Students;
ROLLBACK;
GO
SELECT COUNT(*) AS RowsAfterRollback FROM Students;
GO
BEGIN TRAN;
UPDATE Students SET Marks = 95 WHERE StudentId = 3;
COMMIT;
GO
SELECT * FROM Students;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Marks INT
);
GO
INSERT INTO Students (FullName, Marks) VALUES ('Asha Patil', 88), ('Ravi Kumar', 72), ('Kiran Shah', 91);
GO
BEGIN TRAN;
DELETE FROM Students;
SELECT COUNT(*) AS RowsInsideTran FROM Students;
ROLLBACK;
GO
SELECT COUNT(*) AS RowsAfterRollback FROM Students;
GO
BEGIN TRAN;
UPDATE Students SET Marks = 95 WHERE StudentId = 3;
COMMIT;
GO
SELECT * FROM Students;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Marks) VALUES ('Asha Patil', 88), ('Ra -> (3 rows affected)
>> BEGIN TRAN -> Commands completed successfully.
>> DELETE FROM Students -> (3 rows affected)
>> SELECT COUNT(*) AS RowsInsideTran FROM Students
+----------------+
| RowsInsideTran |
+----------------+
| 0              |
+----------------+
1 row(s) returned
>> ROLLBACK -> Commands completed successfully.
>> SELECT COUNT(*) AS RowsAfterRollback FROM Students
+-------------------+
| RowsAfterRollback |
+-------------------+
| 3                 |
+-------------------+
1 row(s) returned
>> BEGIN TRAN -> Commands completed successfully.
>> UPDATE Students SET Marks = 95 WHERE StudentId = 3 -> (1 row affected)
>> COMMIT -> Commands completed successfully.
>> SELECT * FROM Students
+-----------+------------+-------+
| StudentId | FullName   | Marks |
+-----------+------------+-------+
| 1         | Asha Patil | 88    |
| 2         | Ravi Kumar | 72    |
| 3         | Kiran Shah | 95    |
+-----------+------------+-------+
3 row(s) returned`,
      explanation: 'Changes inside BEGIN TRAN are visible to your own session but are not permanent until COMMIT. ROLLBACK restores the data exactly as it was. (In real SSMS, BEGIN TRAN/COMMIT do not print "Commands completed" per statement; the lab shows one message per statement.)',
    },
    {
      title: 'TRUNCATE vs DELETE',
      scenario: 'Clear an activity log table and start numbering from 1 again.',
      steps: [
        'New Query, type the script, press F5',
        'Notice that the new row gets LogId 1, not 4',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Logs (LogId INT IDENTITY(1,1) PRIMARY KEY, Msg NVARCHAR(50));
GO
INSERT INTO Logs (Msg) VALUES ('Login'), ('View'), ('Logout');
GO
TRUNCATE TABLE Logs;
GO
INSERT INTO Logs (Msg) VALUES ('Fresh start');
GO
SELECT * FROM Logs;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Logs (LogId INT IDENTITY(1,1) PRIMARY KEY, Msg NVARCHAR(50));
GO
INSERT INTO Logs (Msg) VALUES ('Login'), ('View'), ('Logout');
GO
TRUNCATE TABLE Logs;
GO
INSERT INTO Logs (Msg) VALUES ('Fresh start');
GO
SELECT * FROM Logs;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Logs (LogId INT IDENTITY(1,1) PRIMARY KEY, Msg NVARCHAR(5 -> Commands completed successfully.
>> INSERT INTO Logs (Msg) VALUES ('Login'), ('View'), ('Logout') -> (3 rows affected)
>> TRUNCATE TABLE Logs -> Commands completed successfully.
>> INSERT INTO Logs (Msg) VALUES ('Fresh start') -> (1 row affected)
>> SELECT * FROM Logs
+-------+-------------+
| LogId | Msg         |
+-------+-------------+
| 1     | Fresh start |
+-------+-------------+
1 row(s) returned`,
      explanation: 'TRUNCATE removes all rows and resets the IDENTITY seed, so numbering restarts at 1. DELETE FROM Logs would also remove all rows, but the next id would be 4 because DELETE does not reset IDENTITY.',
    },
    {
      title: 'DCL: create a login and grant permissions (real SSMS only)',
      scenario: 'A trainee should read and add students but never delete them.',
      steps: [
        'In SSMS connect as an administrator (Windows Authentication on your own PC)',
        'Make sure Mixed Mode is enabled: right-click server > Properties > Security > SQL Server and Windows Authentication mode > OK, then restart the service',
        'New Query, type the script below, press F5',
        'Connect a second window with File > Connect Object Explorer > SQL Server Authentication > Login trainee / password',
        'Try SELECT (works) and DELETE (fails)',
      ],
      code: `USE master;
GO
CREATE LOGIN trainee WITH PASSWORD = 'Str0ng@Pass1';
GO
USE StudentDB;
GO
CREATE USER trainee FOR LOGIN trainee;
GRANT SELECT, INSERT ON dbo.Students TO trainee;
DENY DELETE ON dbo.Students TO trainee;
GO
-- Logged in as trainee:
SELECT * FROM dbo.Students;      -- works
DELETE FROM dbo.Students;        -- fails`,
      result: `Commands completed successfully.

(as trainee)
SELECT -> rows returned in Results tab
DELETE ->
Msg 229, Level 14, State 5, Line 2
The DELETE permission was denied on the object 'Students', database 'StudentDB', schema 'dbo'.`,
      explanation: 'GRANT allows SELECT and INSERT; DENY blocks DELETE even if the user later joins a role that has DELETE. Security is covered fully in the Extra SQL Server lessons. This example is not runnable in the in-app lab because logins and permissions are server features.',
    },
  ],
  interview: [
    { q: 'What are DDL, DML, DQL, DCL and TCL? Give one command each.', a: 'DDL defines structure (CREATE), DML changes data (INSERT), DQL reads data (SELECT), DCL controls permissions (GRANT), TCL controls transactions (COMMIT).', level: 'Easy' },
    { q: 'Difference between DELETE, TRUNCATE and DROP?', a: 'DELETE removes selected rows (WHERE allowed), is fully logged, keeps IDENTITY and fires triggers. TRUNCATE removes all rows, no WHERE, minimal logging, resets IDENTITY, no DELETE triggers, not allowed when referenced by a FK. DROP removes the table itself including structure, indexes and permissions.', level: 'Medium' },
    { q: 'Can TRUNCATE be rolled back in SQL Server?', a: 'Yes, if it runs inside an explicit transaction (BEGIN TRAN ... ROLLBACK). Many people think it cannot - in SQL Server it can.', level: 'Hard' },
    { q: 'Is TRUNCATE DDL or DML?', a: 'DDL - it deallocates data pages and resets the table rather than deleting rows one by one, and it requires ALTER permission.', level: 'Medium' },
    { q: 'What happens if you run UPDATE Students SET Marks = 0; ?', a: 'Every row\'s Marks becomes 0, because there is no WHERE clause. Use a transaction or check with SELECT first.', level: 'Easy' },
    { q: 'How do you add a column to an existing table? Rename a column?', a: 'ALTER TABLE Students ADD Email VARCHAR(100); Renaming uses EXEC sp_rename \'Students.FullName\', \'StudentName\', \'COLUMN\';', level: 'Easy' },
    { q: 'Difference between GRANT, DENY and REVOKE?', a: 'GRANT gives permission, DENY explicitly blocks it (overrides grants from roles), REVOKE removes an earlier GRANT or DENY so the permission returns to inherited state.', level: 'Medium' },
    { q: 'What is auto-commit mode?', a: 'SQL Server\'s default: each individual statement is a transaction that commits automatically if it succeeds. BEGIN TRAN switches to an explicit transaction until COMMIT/ROLLBACK.', level: 'Medium' },
    { q: 'What is a savepoint?', a: 'SAVE TRAN name marks a point inside a transaction; ROLLBACK TRAN name undoes work after that point only, keeping the transaction open.', level: 'Hard' },
    { q: 'Why list column names in INSERT?', a: 'It does not depend on column order, works when new columns are added, skips IDENTITY/DEFAULT columns, and is easier to read.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create a Books table (BookId identity PK, Title, Author, Price INT). Then ALTER it to add PublishedYear INT and drop it again.', hint: 'ALTER TABLE ... ADD / DROP COLUMN.', solution: `CREATE TABLE Books (BookId INT IDENTITY(1,1) PRIMARY KEY, Title NVARCHAR(100) NOT NULL, Author NVARCHAR(60), Price INT);
ALTER TABLE Books ADD PublishedYear INT;
ALTER TABLE Books DROP COLUMN PublishedYear;` },
    { task: 'Insert 5 books with one multi-row INSERT, increase the price of books by "Chetan" by 10%, and delete books priced above 900.', hint: 'Price * 1.1 gives a decimal - cast or use INT maths.', solution: `INSERT INTO Books (Title, Author, Price) VALUES
('Book A', 'Chetan', 300), ('Book B', 'Ruskin', 250), ('Book C', 'Chetan', 450),
('Book D', 'Sudha', 950), ('Book E', 'Amish', 500);
UPDATE Books SET Price = Price + Price / 10 WHERE Author = 'Chetan';
DELETE FROM Books WHERE Price > 900;
SELECT * FROM Books;` },
    { task: 'Inside a transaction, delete all books, check the count, then roll back and confirm the count again.', hint: 'BEGIN TRAN; ... ROLLBACK;', solution: `BEGIN TRAN;
DELETE FROM Books;
SELECT COUNT(*) FROM Books;   -- 0
ROLLBACK;
SELECT COUNT(*) FROM Books;   -- original count` },
    { task: 'Label each statement: SELECT, TRUNCATE, GRANT, ROLLBACK, UPDATE, CREATE INDEX, REVOKE, INSERT.', hint: 'Structure, data, read, permission, transaction.', solution: 'SELECT-DQL, TRUNCATE-DDL, GRANT-DCL, ROLLBACK-TCL, UPDATE-DML, CREATE INDEX-DDL, REVOKE-DCL, INSERT-DML.' },
  ],
  quiz: [
    { question: 'ALTER TABLE belongs to which category?', options: ['DML', 'DCL', 'DDL', 'TCL'], answer: 2, explanation: 'ALTER changes the structure of an object, so it is DDL.' },
    { question: 'Which command removes all rows AND resets the IDENTITY counter?', options: ['TRUNCATE TABLE', 'DELETE FROM', 'DROP TABLE', 'UPDATE'], answer: 0, explanation: 'TRUNCATE empties the table and reseeds IDENTITY; DROP removes the table itself.' },
    { question: 'You ran BEGIN TRAN; DELETE FROM Students; What undoes the delete?', options: ['COMMIT', 'UNDO', 'REVOKE', 'ROLLBACK'], answer: 3, explanation: 'ROLLBACK undoes all changes since BEGIN TRAN.' },
    { question: 'Which statement gives a user permission to read a table?', options: ['ALLOW SELECT', 'GRANT SELECT ON dbo.Students TO user1', 'COMMIT SELECT', 'SET SELECT ON'], answer: 1, explanation: 'GRANT is the DCL command for giving permissions.' },
    { question: 'UPDATE Students SET City = \'Pune\'; without WHERE will:', options: ['Update every row', 'Update the first row', 'Give an error', 'Update no rows'], answer: 0, explanation: 'Without WHERE, UPDATE affects all rows in the table.' },
  ],
};
