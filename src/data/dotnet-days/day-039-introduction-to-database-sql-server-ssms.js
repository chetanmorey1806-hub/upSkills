export default {
  id: 'day-039-introduction-to-database-sql-server-ssms',
  title: 'Introduction to Database, DBMS, RDBMS, SQL Server & SSMS Installation',
  module: 'SQL Server & Database Management',
  day: 39,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn what a database, DBMS and RDBMS are, install SQL Server (Developer or Express edition) and SQL Server Management Studio (SSMS), connect to your server, explore Object Explorer, open a New Query window, run it with Execute (F5) and read the Results and Messages tabs. Finish by creating StudentDB.',
  objectives: [
    'Explain database, DBMS and RDBMS with real-world examples',
    'Install SQL Server 2022 (Developer or Express) and SSMS and connect to the server',
    'Use Object Explorer, New Query, Execute (F5) and the Results / Messages tabs',
    'Create the StudentDB database with a first table and read data back',
  ],
  theory: [
    {
      heading: 'What is a Database?',
      content: 'A database is an organised collection of data stored electronically so it can be searched, updated and protected easily. Think of a college office: instead of paper registers for students, fees and results, everything is kept in one place that many people can use at the same time. A C# program keeps data in memory only while it runs; a database keeps it permanently on disk.',
      points: [
        'Data = raw facts (Asha, 88, Pune)',
        'Information = data with meaning (Asha from Pune scored 88)',
        'Examples: bank accounts, railway reservations, college records, e-commerce orders',
        'Without a database: duplicate files, inconsistent data, no security, no concurrent access',
      ],
    },
    {
      heading: 'DBMS and RDBMS',
      content: 'A DBMS (Database Management System) is the software that creates, stores, reads, updates and secures the database. An RDBMS (Relational DBMS) stores data in tables (rows and columns) and links tables using keys. SQL Server, MySQL, PostgreSQL and Oracle are RDBMS products. All of them are queried with SQL (Structured Query Language); SQL Server uses its own dialect called T-SQL (Transact-SQL).',
      points: [
        'Table = Students; Row (record) = one student; Column (field) = Name, City, Marks',
        'Primary key uniquely identifies each row (StudentId)',
        'Foreign key links one table to another (Enrollments.StudentId -> Students.StudentId)',
        'RDBMS rules: integrity constraints, transactions (ACID), multi-user security',
        'NoSQL databases (MongoDB, Redis) store documents / key-values instead of tables',
      ],
      tip: 'DBMS is the general category; RDBMS is a DBMS that follows the relational (table + key) model.',
    },
    {
      heading: 'SQL Server Editions and Installing SQL Server 2022',
      content: 'Microsoft SQL Server is the RDBMS used with .NET in most companies. For learning, use a FREE edition: Developer (all Enterprise features, free for development/testing only, not for production) or Express (free for small production apps, limited to 10 GB per database and limited memory/CPU). Installation steps on Windows:',
      points: [
        '1. Go to microsoft.com > search "SQL Server 2022 downloads" > choose "Developer" (or "Express") > Download now',
        '2. Run the installer (SQL2022-SSEI-Dev.exe) and choose "Basic" installation type (easiest) > Accept license > Install',
        '3. Wait until "Installation has completed successfully" appears; note the INSTANCE NAME and CONNECTION STRING shown',
        'Developer Basic install creates the default instance MSSQLSERVER (server name: localhost or .)',
        'Express creates the named instance SQLEXPRESS (server name: localhost\\SQLEXPRESS or .\\SQLEXPRESS)',
        'Custom install lets you choose features, instance name and Mixed Mode authentication (Windows + sa password)',
        'Check the service: Win+R > services.msc > "SQL Server (MSSQLSERVER)" should be Running',
      ],
      tip: 'The installer only installs the database ENGINE. SSMS (the GUI tool) is a separate download - click "Install SSMS" on the final screen.',
    },
    {
      heading: 'Installing SSMS and Connecting to the Server',
      content: 'SQL Server Management Studio (SSMS) is the free graphical tool to manage SQL Server and write T-SQL. Download "SSMS" from Microsoft Learn (Download SQL Server Management Studio), run the installer, click Install and restart if asked. Then open SSMS from the Start menu. The "Connect to Server" dialog appears:',
      points: [
        'Server type: Database Engine',
        'Server name: localhost (Developer default instance) or localhost\\SQLEXPRESS (Express) - "." also means the local machine',
        'Authentication: Windows Authentication (uses your Windows login; no password needed)',
        'SSMS 20+: tick "Trust server certificate" (Encryption: Mandatory/Optional) for local learning, otherwise you may see a certificate error',
        'Click Connect - the server appears in Object Explorer with a green arrow icon',
        'Error "A network-related or instance-specific error": check the server name and that the SQL Server service is Running',
      ],
    },
    {
      heading: 'SSMS Tour: Object Explorer, New Query, Execute (F5), Results and Messages',
      content: 'Object Explorer (left panel, F8 to show) is a tree of everything on the server: Databases (System Databases: master, model, msdb, tempdb, plus your own databases), Security (logins), Server Objects and SQL Server Agent. Expand a database > Tables > a table > Columns to see its structure. Right-click a table > "Select Top 1000 Rows" to see data quickly.',
      points: [
        'New Query (toolbar button or Ctrl+N) opens a query editor connected to the selected server',
        'Available Databases drop-down (toolbar) or USE DatabaseName; chooses which database the query runs in',
        'Execute (F5 or Ctrl+E) runs the whole script, or ONLY the selected (highlighted) text',
        'Parse (Ctrl+F5) checks syntax without running',
        'Results tab: the grid of rows returned by SELECT (Ctrl+T switches to text, Ctrl+D back to grid)',
        'Messages tab: "(3 rows affected)", "Commands completed successfully.", PRINT output and red error messages with line numbers',
        'Refresh Object Explorer (F5 while it has focus, or right-click > Refresh) to see newly created objects',
        'Save the script with Ctrl+S as a .sql file',
      ],
      tip: 'In this course the in-app SSMS Lab works like a New Query window: type a script, press Execute (F5), and see the grid output plus messages. It runs on an emulator, so a few behaviours differ slightly (noted where they matter).',
    },
    {
      heading: 'Creating StudentDB - Your First Database',
      content: 'CREATE DATABASE makes a new database (SQL Server creates a data file .mdf and a log file .ldf). USE switches the query window to it. GO is not T-SQL - it is an SSMS batch separator that sends everything above it to the server as one batch.',
      syntax: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName  NVARCHAR(100) NOT NULL
);`,
      points: [
        'GUI way: Object Explorer > right-click Databases > New Database... > Database name: StudentDB > OK',
        'Database names should be PascalCase without spaces (StudentDB, not "student db")',
        'Running CREATE DATABASE twice gives "Database \'StudentDB\' already exists"',
        'DROP DATABASE StudentDB; deletes it (switch to master first: USE master;)',
      ],
    },
  ],
  examples: [
    {
      title: 'Your first query in a New Query window',
      scenario: 'After installing SQL Server and SSMS, verify that the connection works by running a simple SELECT and a PRINT.',
      steps: [
        'Open SSMS from the Start menu',
        'Connect to Server: Server type = Database Engine, Server name = localhost (or localhost\\SQLEXPRESS), Authentication = Windows Authentication, tick Trust server certificate, click Connect',
        'Click New Query on the toolbar (Ctrl+N)',
        'Type the script below',
        'Press Execute (F5)',
        'Look at the Results tab for the grid and the Messages tab for the PRINT text',
      ],
      code: `SELECT 'Hello SQL Server' AS Greeting, 10 + 20 AS Total;
PRINT 'My first query ran successfully';`,
      tsql: `SELECT 'Hello SQL Server' AS Greeting, 10 + 20 AS Total;
PRINT 'My first query ran successfully';`,
      result: `>> SELECT 'Hello SQL Server' AS Greeting, 10 + 20 AS Total
+------------------+-------+
| Greeting         | Total |
+------------------+-------+
| Hello SQL Server | 30    |
+------------------+-------+
1 row(s) returned
>> PRINT 'My first query ran successfully' -> My first query ran successfully`,
      explanation: 'SELECT can compute values even without a table. The Results tab shows one row with two columns (AS gives the column name). PRINT text never appears in the grid; in SSMS it goes to the Messages tab. If this runs, your installation and connection are working.',
    },
    {
      title: 'Create the StudentDB database',
      scenario: 'The college needs a separate database for student data.',
      steps: [
        'In SSMS click New Query (Ctrl+N)',
        'Type the script below',
        'Press F5',
        'Messages tab shows "Commands completed successfully."',
        'In Object Explorer right-click Databases > Refresh - StudentDB now appears in the list',
        'Alternative GUI way: right-click Databases > New Database... > Database name: StudentDB > OK',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
PRINT 'StudentDB created and selected';`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
PRINT 'StudentDB created and selected';`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> PRINT 'StudentDB created and selected' -> StudentDB created and selected`,
      explanation: 'CREATE DATABASE creates the database files; USE StudentDB makes it the current database (the toolbar drop-down changes from master to StudentDB). GO separates batches - SSMS sends each part to the server one after another.',
    },
    {
      title: 'Create a Students table, insert rows and view them',
      scenario: 'Store three students in StudentDB and read them back - the complete Day 39 practical.',
      steps: [
        'New Query (Ctrl+N)',
        'Type the script below',
        'Press F5',
        'Messages tab: "(3 rows affected)"; Results tab: the 3 student rows',
        'Object Explorer: StudentDB > Tables > Refresh > dbo.Students appears',
        'Right-click dbo.Students > Select Top 1000 Rows to see the same data with a generated query',
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
INSERT INTO Students (FullName, City, Marks) VALUES
('Asha Patil', 'Pune', 88),
('Ravi Kumar', 'Mumbai', 72),
('Kiran Shah', 'Nagpur', 91);
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
INSERT INTO Students (FullName, City, Marks) VALUES
('Asha Patil', 'Pune', 88),
('Ravi Kumar', 'Mumbai', 72),
('Kiran Shah', 'Nagpur', 91);
GO
SELECT * FROM Students;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, City, Marks) VALUES -> (3 rows affected)
>> SELECT * FROM Students
+-----------+------------+--------+-------+
| StudentId | FullName   | City   | Marks |
+-----------+------------+--------+-------+
| 1         | Asha Patil | Pune   | 88    |
| 2         | Ravi Kumar | Mumbai | 72    |
| 3         | Kiran Shah | Nagpur | 91    |
+-----------+------------+--------+-------+
3 row(s) returned`,
      explanation: 'IDENTITY(1,1) generates StudentId automatically starting at 1 and increasing by 1, so we never insert it ourselves. NOT NULL forces a name; City and Marks can be left empty (NULL). SELECT * returns all columns in table order.',
    },
    {
      title: 'Execute selected text only and read Messages',
      scenario: 'Update one student\'s marks and check what the Messages tab reports.',
      steps: [
        'New Query (Ctrl+N) and type the script below',
        'Press F5 to run everything once',
        'Now highlight ONLY the last SELECT line with the mouse and press F5 - only that statement runs',
        'Switch between Results and Messages tabs to compare outputs',
        'Press Ctrl+T then F5 to see results as text, Ctrl+D to return to the grid',
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
INSERT INTO Students (FullName, Marks) VALUES ('Asha Patil', 88), ('Ravi Kumar', 72);
GO
UPDATE Students SET Marks = 75 WHERE FullName = 'Ravi Kumar';
GO
PRINT 'Marks updated';
SELECT FullName, Marks FROM Students ORDER BY Marks DESC;`,
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
INSERT INTO Students (FullName, Marks) VALUES ('Asha Patil', 88), ('Ravi Kumar', 72);
GO
UPDATE Students SET Marks = 75 WHERE FullName = 'Ravi Kumar';
GO
PRINT 'Marks updated';
SELECT FullName, Marks FROM Students ORDER BY Marks DESC;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Students (FullName, Marks) VALUES ('Asha Patil', 88), ('Ra -> (2 rows affected)
>> UPDATE Students SET Marks = 75 WHERE FullName = 'Ravi Kumar' -> (1 row affected)
>> PRINT 'Marks updated' -> Marks updated
>> SELECT FullName, Marks FROM Students ORDER BY Marks DESC
+------------+-------+
| FullName   | Marks |
+------------+-------+
| Asha Patil | 88    |
| Ravi Kumar | 75    |
+------------+-------+
2 row(s) returned`,
      explanation: 'UPDATE reports "(1 row affected)" in the Messages tab. ORDER BY Marks DESC shows highest marks first. Executing only highlighted text is a daily SSMS habit: you can keep many statements in one window and run them one at a time.',
    },
  ],
  interview: [
    { q: 'What is the difference between DBMS and RDBMS?', a: 'A DBMS is any software that manages a database. An RDBMS stores data in related tables (rows/columns) linked by primary and foreign keys, enforces constraints and supports SQL and ACID transactions. SQL Server is an RDBMS.', level: 'Easy' },
    { q: 'What is SQL Server and what is SSMS?', a: 'SQL Server is Microsoft\'s RDBMS - the database engine that stores and processes data (runs as a Windows service). SSMS is a separate client GUI tool used to connect to SQL Server, browse objects and run T-SQL.', level: 'Easy' },
    { q: 'Developer vs Express edition?', a: 'Both are free. Developer has all Enterprise features but may be used only for development and testing. Express may be used in production but is limited (10 GB per database, limited RAM/CPU, no SQL Agent).', level: 'Easy' },
    { q: 'What server name do you use to connect to a local Express instance?', a: 'localhost\\SQLEXPRESS (or .\\SQLEXPRESS). A default instance (Developer basic install) uses localhost or just a dot.', level: 'Easy' },
    { q: 'What is the difference between Windows Authentication and SQL Server Authentication?', a: 'Windows Authentication uses the logged-in Windows account (no password typed, recommended). SQL Server Authentication uses a login and password stored in SQL Server (like sa) and requires Mixed Mode to be enabled.', level: 'Medium' },
    { q: 'What is GO in SSMS?', a: 'GO is a batch separator understood by SSMS/sqlcmd, not a T-SQL statement. Everything before GO is sent to the server as one batch. Some statements (CREATE VIEW/PROCEDURE) must be the first statement in a batch.', level: 'Medium' },
    { q: 'Where do you see "(3 rows affected)" and PRINT output in SSMS?', a: 'In the Messages tab. The Results tab shows only result sets returned by SELECT.', level: 'Easy' },
    { q: 'What happens if you highlight part of a script and press F5?', a: 'Only the highlighted text is executed. This is how you run one statement out of a long script.', level: 'Easy' },
    { q: 'Name the system databases in SQL Server.', a: 'master (server-wide settings and list of databases), model (template for new databases), msdb (SQL Agent jobs, backups history) and tempdb (temporary tables and work space, recreated at every restart).', level: 'Medium' },
    { q: 'You get "A network-related or instance-specific error occurred" when connecting. What do you check?', a: 'The server/instance name (localhost vs localhost\\SQLEXPRESS), that the SQL Server service is running in services.msc / SQL Server Configuration Manager, and for remote connections that TCP/IP is enabled and the firewall allows port 1433.', level: 'Medium' },
    { q: 'What files does CREATE DATABASE create?', a: 'A primary data file (.mdf) that stores tables and data, and a transaction log file (.ldf) that records every change for recovery.', level: 'Medium' },
  ],
  practice: [
    { task: 'Install SQL Server 2022 Developer (or Express) and SSMS. Connect and write down your exact server name.', hint: 'Basic install; then click Install SSMS. Server name is shown on the final installer screen.', solution: 'Developer: Server name = localhost (default instance MSSQLSERVER). Express: localhost\\SQLEXPRESS. Windows Authentication, Trust server certificate ticked, Connect.' },
    { task: 'Using Object Explorer, list the four system databases and open the Tables folder of master.', hint: 'Databases > System Databases.', solution: 'master, model, msdb, tempdb. Expand Databases > System Databases > master > Tables (System Tables folder holds internal tables).' },
    { task: 'Create StudentDB with the GUI (New Database...) instead of T-SQL, then drop it and recreate it with T-SQL.', hint: 'You cannot drop a database that your query window is using.', solution: `USE master;
GO
DROP DATABASE StudentDB;
GO
CREATE DATABASE StudentDB;
GO` },
    { task: 'In StudentDB create a Courses table (CourseId identity PK, CourseName NVARCHAR(50) NOT NULL, Fees INT) and insert 3 courses. Display them.', hint: 'Follow the Students example.', solution: `USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    Fees INT
);
INSERT INTO Courses (CourseName, Fees) VALUES ('C#', 15000), ('SQL Server', 10000), ('React', 12000);
SELECT * FROM Courses;` },
    { task: 'Write a script with three SELECT statements and run each one separately using highlight + F5. Then save the script as day39.sql.', hint: 'Ctrl+S saves the query.', solution: 'Select one line with the mouse, press F5 - only that line runs. Ctrl+S > choose folder > File name day39.sql > Save.' },
  ],
  quiz: [
    { question: 'Which tool is used to write and run T-SQL queries graphically against SQL Server?', options: ['Visual Studio Code only', 'SQL Server Management Studio (SSMS)', 'SQL Server Configuration Manager', 'Notepad'], answer: 1, explanation: 'SSMS is the main GUI for SQL Server: Object Explorer, query editor and results.' },
    { question: 'Which keyboard shortcut executes a query in SSMS?', options: ['Ctrl+S', 'F9', 'Ctrl+Shift+B', 'F5'], answer: 3, explanation: 'F5 (or Ctrl+E) executes the script or the selected text.' },
    { question: 'Where does the text "(3 rows affected)" appear?', options: ['Messages tab', 'Results tab', 'Object Explorer', 'Properties window'], answer: 0, explanation: 'Row counts, PRINT output and errors go to the Messages tab.' },
    { question: 'Which free edition has ALL Enterprise features but is only for development/testing?', options: ['Express', 'Standard', 'Developer', 'Web'], answer: 2, explanation: 'Developer edition is feature-complete and free, licensed for non-production use.' },
    { question: 'What is the server name for a local SQL Server Express named instance?', options: ['localhost\\SQLEXPRESS', 'sqlserver://local', 'master', 'StudentDB'], answer: 0, explanation: 'Express installs a named instance SQLEXPRESS, so you connect to localhost\\SQLEXPRESS (or .\\SQLEXPRESS).' },
  ],
};
