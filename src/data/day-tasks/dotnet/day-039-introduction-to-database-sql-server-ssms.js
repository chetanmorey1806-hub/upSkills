const STUDENTS = `CREATE TABLE Students (
    StudentId INT PRIMARY KEY,
    Name NVARCHAR(50),
    City NVARCHAR(30),
    Course NVARCHAR(30)
);
INSERT INTO Students VALUES
(1, 'Asha Patil', 'Pune', 'C#'),
(2, 'Ravi Kumar', 'Delhi', 'SQL Server'),
(3, 'Meena Iyer', 'Chennai', 'C#'),
(4, 'Arjun Singh', 'Pune', 'React');`;

export default {
  lesson: 'day-039-introduction-to-database-sql-server-ssms',
  minutes: 18,
  intro: 'Check what a database, DBMS and RDBMS are, get to know SQL Server and SSMS, and run your first T-SQL queries.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What makes a DBMS a **Relational** DBMS (RDBMS) like SQL Server?',
      options: [
        'It stores data only in text files',
        'It stores data in tables (rows and columns) that can be related to each other through keys, and is queried with SQL',
        'It can only store images',
        'It does not support SQL',
      ],
      answer: 1,
      explain: 'An **RDBMS** organises data into **tables** and links them with primary/foreign keys. SQL Server, MySQL, PostgreSQL and Oracle are RDBMSs. MongoDB is a NoSQL (document) database, not relational.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'What is the full form of **SSMS**, the tool used to connect to SQL Server and run queries?',
      example: { title: 'tools you will use', text: 'SQL Server = the database engine (service)\nSSMS = S___ S___ M___ S___ (the client tool with Object Explorer and query windows)' },
      accept: ['SQL Server Management Studio', 'Microsoft SQL Server Management Studio'],
      explain: '**SQL Server Management Studio** is the free GUI client: Object Explorer shows databases/tables, and a New Query window runs T-SQL (F5 / Execute). The engine itself runs as a Windows service.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'SQL Server Developer and Express editions are free',
        'T-SQL (Transact-SQL) is Microsoft\'s SQL dialect used by SQL Server',
        'A database server can host many databases',
        'SSMS and SQL Server are the same program',
        'In SQL Server the default instance name for Express is often SQLEXPRESS',
      ],
      answers: [0, 1, 2, 4],
      explain: 'The engine and the client are separate: you install SQL Server (engine) and SSMS (client) separately. Developer edition (full features, not for production) and Express (limited size) are free. Express installs a named instance `.\\SQLEXPRESS` by default.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 3,
      q: 'SQL Server can work like a calculator. Write ONE `SELECT` (no table needed) that returns two columns:\n- `Course` = the text `ASP.NET Core`\n- `TotalDays` = 30 * 4',
      example: { title: 'SELECT without FROM', code: "SELECT 'Hello SQL' AS Greeting, 10 + 5 AS Answer;" },
      starter: '-- Write your SELECT here\n',
      solution: "SELECT 'ASP.NET Core' AS Course, 30 * 4 AS TotalDays;",
      explain: 'A `SELECT` can return expressions without a table. `AS` names the result column. Text goes inside **single quotes**; double quotes in T-SQL mean an identifier (a column name), not text.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 2,
      q: 'The table `Students` already exists (see setup). Show **all columns and all rows**.',
      example: { title: 'reading a whole table', code: 'SELECT * FROM Courses;' },
      setup: STUDENTS,
      starter: '-- Show every student\n',
      solution: 'SELECT * FROM Students;',
      explain: '`SELECT *` returns every column and `FROM Students` names the table. In SSMS the result appears in the Results grid. A typo in the table name gives "Msg 208: Invalid object name".',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Create your first table and data:\n1. Create a table `Courses` with columns `CourseId INT PRIMARY KEY`, `Title NVARCHAR(50)`, `Fees INT`\n2. Insert two rows: (1, \'C# Basics\', 4999) and (2, \'SQL Server\', 3999)\n3. Show all rows',
      example: { title: 'create, insert, read', code: "CREATE TABLE Batches (BatchId INT PRIMARY KEY, Name NVARCHAR(30));\nINSERT INTO Batches VALUES (1, 'Morning'), (2, 'Evening');\nSELECT * FROM Batches;" },
      starter: '-- 1. CREATE TABLE Courses ...\n-- 2. INSERT INTO Courses ...\n-- 3. SELECT ...\n',
      solution: "CREATE TABLE Courses (CourseId INT PRIMARY KEY, Title NVARCHAR(50), Fees INT);\nINSERT INTO Courses VALUES (1, 'C# Basics', 4999), (2, 'SQL Server', 3999);\nSELECT * FROM Courses;",
      check: 'SELECT CourseId, Title, Fees FROM Courses ORDER BY CourseId;',
      explain: '`CREATE TABLE` defines the structure (columns + data types), `INSERT` adds rows and `SELECT` reads them. `NVARCHAR` stores Unicode text, so names in Hindi or Marathi also work.',
    },
  ],
};
