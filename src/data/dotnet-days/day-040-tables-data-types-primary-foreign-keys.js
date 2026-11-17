export default {
  id: 'day-040-tables-data-types-primary-foreign-keys',
  title: 'Database, Table, Rows, Columns, Data Types, Primary Key & Foreign Key',
  module: 'SQL Server & Database Management',
  day: 40,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Understand how SQL Server organises data into databases and tables, choose the right data types (INT, DECIMAL, NVARCHAR, VARCHAR, BIT, DATE, DATETIME), and link tables using primary keys and foreign keys by building Student and Course tables.',
  objectives: [
    'Describe database, table, row (record) and column (field)',
    'Choose correct SQL Server data types for real data',
    'Create tables with a PRIMARY KEY and IDENTITY column',
    'Link Students to Courses with a FOREIGN KEY and see referential integrity in action',
  ],
  theory: [
    {
      heading: 'Database, Table, Row and Column',
      content: 'A database is a container (StudentDB). Inside it, a table stores one kind of thing (Students, Courses). A table is like an Excel sheet with a fixed structure: every column has a name and a data type, and every row is one record. Each table lives in a schema - the default schema is dbo, so the full name is StudentDB.dbo.Students.',
      points: [
        'Column (field / attribute): FullName, Email - defines WHAT is stored',
        'Row (record / tuple): one student - the actual data',
        'Cell: one value at a row/column crossing',
        'Schema: a namespace for objects (dbo.Students, hr.Employees)',
        'Object Explorer: StudentDB > Tables > dbo.Students > Columns shows the structure; right-click > Design opens the table designer',
      ],
    },
    {
      heading: 'SQL Server Data Types',
      content: 'Every column must have a data type. Picking the correct type saves space, prevents bad data and makes queries faster.',
      points: [
        'INT (-2.1 billion to 2.1 billion), BIGINT (very large), SMALLINT, TINYINT (0-255)',
        'DECIMAL(p,s) / NUMERIC: exact numbers - use for money and marks. DECIMAL(10,2) = up to 8 digits before and 2 after the point',
        'FLOAT / REAL: approximate numbers (scientific values) - never use for money',
        'CHAR(n): fixed length; VARCHAR(n): variable length (non-Unicode, 1 byte per char)',
        'NCHAR(n) / NVARCHAR(n): Unicode (Hindi, Marathi, emoji) - 2 bytes per char; prefix literals with N: N\'नमस्ते\'',
        'VARCHAR(MAX) / NVARCHAR(MAX): up to 2 GB of text',
        'BIT: 0, 1 or NULL - maps to C# bool',
        'DATE (only date), TIME, DATETIME (date + time, 3 ms accuracy), DATETIME2 (more precise, recommended for new work)',
        'UNIQUEIDENTIFIER: GUID values (NEWID())',
      ],
      tip: 'C# mapping to remember: int -> INT, decimal -> DECIMAL, string -> NVARCHAR, bool -> BIT, DateTime -> DATETIME2/DATETIME, Guid -> UNIQUEIDENTIFIER.',
    },
    {
      heading: 'Primary Key and IDENTITY',
      content: 'A PRIMARY KEY uniquely identifies each row. It cannot be NULL and cannot repeat. A table can have only ONE primary key (it can be made of several columns - a composite key). SQL Server automatically creates a clustered index on it. IDENTITY(seed, increment) auto-generates numbers so you never type the id yourself.',
      syntax: `CREATE TABLE Courses (
    CourseId   INT IDENTITY(1,1) PRIMARY KEY,   -- 1, 2, 3 ...
    CourseName NVARCHAR(50) NOT NULL
);`,
      points: [
        'Natural key: real-world value (Email, Aadhaar no.) - can change',
        'Surrogate key: generated number (StudentId) - preferred, never changes',
        'Composite key: PRIMARY KEY (StudentId, CourseId)',
        'Duplicate key error: Msg 2627 "Violation of PRIMARY KEY constraint"',
        'Gaps in IDENTITY are normal (failed inserts and deleted rows still consume numbers)',
      ],
    },
    {
      heading: 'Foreign Key and Relationships',
      content: 'A FOREIGN KEY is a column in the child table that refers to the primary key of the parent table. It guarantees referential integrity: you cannot insert a student with a CourseId that does not exist, and you cannot delete a course that still has students (unless ON DELETE CASCADE / SET NULL is specified).',
      syntax: `CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName  NVARCHAR(100) NOT NULL,
    CourseId  INT FOREIGN KEY REFERENCES Courses(CourseId)
);
-- or named, at table level:
-- CONSTRAINT FK_Students_Courses FOREIGN KEY (CourseId) REFERENCES Courses(CourseId)`,
      points: [
        'Parent (referenced) table: Courses; Child (referencing) table: Students',
        'One-to-many: one course has many students (FK in the "many" side)',
        'Many-to-many: Students <-> Courses via a junction table Enrollments(StudentId, CourseId)',
        'One-to-one: FK that is also UNIQUE',
        'Create the parent table FIRST, then the child; drop the child FIRST',
        'Violation error: Msg 547 "The INSERT statement conflicted with the FOREIGN KEY constraint"',
      ],
    },
    {
      heading: 'Creating Tables with the SSMS Table Designer',
      content: 'Besides T-SQL, SSMS has a visual designer. Expand StudentDB > right-click Tables > New > Table... Enter Column Name, Data Type and Allow Nulls. Right-click the id column > Set Primary Key; in Column Properties set Identity Specification > (Is Identity) = Yes. Press Ctrl+S and type the table name. For a foreign key: right-click in the designer > Relationships... > Add > Tables And Columns Specification > pick primary/foreign key tables.',
      points: [
        'Database Diagrams (right-click > New Database Diagram) shows tables and FK lines visually',
        'If saving changes fails with "Saving changes is not permitted": Tools > Options > Designers > untick "Prevent saving changes that require table re-creation"',
        'Right-click a table > Script Table as > CREATE To > New Query Editor Window shows the T-SQL SSMS would run',
      ],
    },
  ],
  examples: [
    {
      title: 'Common data types in one table',
      scenario: 'See how SQL Server stores text, numbers, money, true/false and dates.',
      steps: [
        'Open SSMS, connect, click New Query (Ctrl+N)',
        'Type the script below and press F5',
        'Expand StudentDB > Tables > dbo.DataTypeDemo > Columns in Object Explorer (Refresh first) to see each type',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE DataTypeDemo (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    RollCode VARCHAR(10),
    Age INT,
    Fees DECIMAL(10,2),
    IsActive BIT,
    BirthDate DATE,
    JoinedOn DATETIME
);
GO
INSERT INTO DataTypeDemo (FullName, RollCode, Age, Fees, IsActive, BirthDate, JoinedOn) VALUES
(N'Asha Patil', 'R001', 21, 15000.50, 1, '2004-05-12', '2026-06-01 09:30:00'),
(N'Ravi Kumar', 'R002', 22, 12000.00, 0, '2003-11-02', '2026-06-02 10:15:00');
GO
SELECT * FROM DataTypeDemo;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE DataTypeDemo (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    RollCode VARCHAR(10),
    Age INT,
    Fees DECIMAL(10,2),
    IsActive BIT,
    BirthDate DATE,
    JoinedOn DATETIME
);
GO
INSERT INTO DataTypeDemo (FullName, RollCode, Age, Fees, IsActive, BirthDate, JoinedOn) VALUES
(N'Asha Patil', 'R001', 21, 15000.50, 1, '2004-05-12', '2026-06-01 09:30:00'),
(N'Ravi Kumar', 'R002', 22, 12000.00, 0, '2003-11-02', '2026-06-02 10:15:00');
GO
SELECT * FROM DataTypeDemo;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE DataTypeDemo ( -> Commands completed successfully.
>> INSERT INTO DataTypeDemo (FullName, RollCode, Age, Fees, IsActive, Bir -> (2 rows affected)
>> SELECT * FROM DataTypeDemo
+----+------------+----------+-----+---------+----------+------------+---------------------+
| Id | FullName   | RollCode | Age | Fees    | IsActive | BirthDate  | JoinedOn            |
+----+------------+----------+-----+---------+----------+------------+---------------------+
| 1  | Asha Patil | R001     | 21  | 15000.5 | 1        | 2004-05-12 | 2026-06-01 09:30:00 |
| 2  | Ravi Kumar | R002     | 22  | 12000   | 0        | 2003-11-02 | 2026-06-02 10:15:00 |
+----+------------+----------+-----+---------+----------+------------+---------------------+
2 row(s) returned`,
      explanation: 'BIT shows 1/0, DATE has no time part, DATETIME keeps both. N\'...\' marks a Unicode literal for NVARCHAR. Note: real SSMS shows DECIMAL(10,2) as 15000.50 and 12000.00 and DATETIME as 2026-06-01 09:30:00.000; the lab prints decimals without trailing zeros and datetimes without milliseconds.',
    },
    {
      title: 'Create Student and Course tables linked by a foreign key',
      scenario: 'Day 40 practical: each student joins one course; Courses is the parent table.',
      steps: [
        'New Query (Ctrl+N)',
        'Type the script - Courses is created before Students because Students refers to it',
        'Press F5; check Messages for row counts',
        'Object Explorer: StudentDB > Tables > dbo.Students > Keys shows PK__Students... and FK__Students__Cours...',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    DurationMonths INT NOT NULL,
    Fees DECIMAL(10,2) NOT NULL
);
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, DurationMonths, Fees) VALUES
('.NET Full Stack', 6, 45000),
('SQL Server', 2, 12000),
('React', 3, 18000);
GO
INSERT INTO Students (FullName, Email, CourseId) VALUES
('Asha Patil', 'asha@mail.com', 1),
('Ravi Kumar', 'ravi@mail.com', 1),
('Kiran Shah', 'kiran@mail.com', 3);
GO
SELECT * FROM Courses;
SELECT * FROM Students;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL,
    DurationMonths INT NOT NULL,
    Fees DECIMAL(10,2) NOT NULL
);
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName, DurationMonths, Fees) VALUES
('.NET Full Stack', 6, 45000),
('SQL Server', 2, 12000),
('React', 3, 18000);
GO
INSERT INTO Students (FullName, Email, CourseId) VALUES
('Asha Patil', 'asha@mail.com', 1),
('Ravi Kumar', 'ravi@mail.com', 1),
('Kiran Shah', 'kiran@mail.com', 3);
GO
SELECT * FROM Courses;
SELECT * FROM Students;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName, DurationMonths, Fees) VALUES -> (3 rows affected)
>> INSERT INTO Students (FullName, Email, CourseId) VALUES -> (3 rows affected)
>> SELECT * FROM Courses
+----------+-----------------+----------------+-------+
| CourseId | CourseName      | DurationMonths | Fees  |
+----------+-----------------+----------------+-------+
| 1        | .NET Full Stack | 6              | 45000 |
| 2        | SQL Server      | 2              | 12000 |
| 3        | React           | 3              | 18000 |
+----------+-----------------+----------------+-------+
3 row(s) returned
>> SELECT * FROM Students
+-----------+------------+----------------+----------+
| StudentId | FullName   | Email          | CourseId |
+-----------+------------+----------------+----------+
| 1         | Asha Patil | asha@mail.com  | 1        |
| 2         | Ravi Kumar | ravi@mail.com  | 1        |
| 3         | Kiran Shah | kiran@mail.com | 3        |
+-----------+------------+----------------+----------+
3 row(s) returned`,
      explanation: 'CourseId in Students holds the id of a row in Courses. Asha and Ravi both point to course 1 (.NET Full Stack) - a one-to-many relationship. Course 2 has no students yet, which is allowed.',
    },
    {
      title: 'Referential integrity: inserting an invalid CourseId',
      scenario: 'Try to enroll a student into course 99, which does not exist.',
      steps: [
        'New Query, type the script, press F5',
        'The Messages tab shows the red error for the bad insert; the other batches still run because each GO batch is separate',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName) VALUES ('.NET Full Stack'), ('SQL Server');
INSERT INTO Students (FullName, CourseId) VALUES ('Asha Patil', 1);
GO
INSERT INTO Students (FullName, CourseId) VALUES ('Ghost Student', 99);
GO
INSERT INTO Students (FullName, CourseId) VALUES ('Ravi Kumar', 2);
GO
SELECT * FROM Students;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName) VALUES ('.NET Full Stack'), ('SQL Server');
INSERT INTO Students (FullName, CourseId) VALUES ('Asha Patil', 1);
GO
INSERT INTO Students (FullName, CourseId) VALUES ('Ghost Student', 99);
GO
INSERT INTO Students (FullName, CourseId) VALUES ('Ravi Kumar', 2);
GO
SELECT * FROM Students;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName) VALUES ('.NET Full Stack'), ('SQL Ser -> (2 rows affected)
>> INSERT INTO Students (FullName, CourseId) VALUES ('Asha Patil', 1) -> (1 row affected)
>> INSERT INTO Students (FullName, CourseId) VALUES ('Ghost Student', 99) -> ERROR: Msg 547, Level 16, State 0, Line 1
The INSERT/UPDATE statement conflicted with the FOREIGN KEY constraint.
>> INSERT INTO Students (FullName, CourseId) VALUES ('Ravi Kumar', 2) -> (1 row affected)
>> SELECT * FROM Students
+-----------+------------+----------+
| StudentId | FullName   | CourseId |
+-----------+------------+----------+
| 1         | Asha Patil | 1        |
| 2         | Ravi Kumar | 2        |
+-----------+------------+----------+
2 row(s) returned`,
      explanation: 'The FOREIGN KEY rejected CourseId 99 with error 547. Real SSMS prints a longer message: "The INSERT statement conflicted with the FOREIGN KEY constraint \\"FK__Students__Cours__...\\". The conflict occurred in database \\"StudentDB\\", table \\"dbo.Courses\\", column \'CourseId\'." Also, in real SQL Server the failed insert still consumes an identity value, so Ravi would get StudentId 3 there (a gap) - identity gaps are normal.',
    },
    {
      title: 'Reading related data from both tables',
      scenario: 'Show each student with the course name instead of a number.',
      steps: [
        'New Query, type the script, press F5',
        'Look at the Results grid - CourseName comes from the Courses table',
      ],
      code: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName) VALUES ('.NET Full Stack'), ('SQL Server'), ('React');
INSERT INTO Students (FullName, CourseId) VALUES ('Asha Patil', 1), ('Ravi Kumar', 2), ('Kiran Shah', 1);
GO
SELECT s.StudentId, s.FullName, c.CourseName
FROM Students s
INNER JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY s.StudentId;`,
      tsql: `CREATE DATABASE StudentDB;
GO
USE StudentDB;
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    CourseName NVARCHAR(50) NOT NULL
);
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    CourseId INT FOREIGN KEY REFERENCES Courses(CourseId)
);
GO
INSERT INTO Courses (CourseName) VALUES ('.NET Full Stack'), ('SQL Server'), ('React');
INSERT INTO Students (FullName, CourseId) VALUES ('Asha Patil', 1), ('Ravi Kumar', 2), ('Kiran Shah', 1);
GO
SELECT s.StudentId, s.FullName, c.CourseName
FROM Students s
INNER JOIN Courses c ON s.CourseId = c.CourseId
ORDER BY s.StudentId;`,
      result: `>> CREATE DATABASE StudentDB -> Commands completed successfully.
>> USE StudentDB -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> INSERT INTO Courses (CourseName) VALUES ('.NET Full Stack'), ('SQL Ser -> (3 rows affected)
>> INSERT INTO Students (FullName, CourseId) VALUES ('Asha Patil', 1), (' -> (3 rows affected)
>> SELECT s.StudentId, s.FullName, c.CourseName
+-----------+------------+-----------------+
| StudentId | FullName   | CourseName      |
+-----------+------------+-----------------+
| 1         | Asha Patil | .NET Full Stack |
| 2         | Ravi Kumar | SQL Server      |
| 3         | Kiran Shah | .NET Full Stack |
+-----------+------------+-----------------+
3 row(s) returned`,
      explanation: 'The JOIN matches Students.CourseId with Courses.CourseId (the FK-PK pair). s and c are table aliases. Joins are covered fully on Day 46 - here it just shows WHY keys matter.',
    },
  ],
  interview: [
    { q: 'What is a primary key?', a: 'A column (or set of columns) whose values uniquely identify each row. It cannot contain NULL or duplicates, a table has only one, and SQL Server creates a clustered index on it by default.', level: 'Easy' },
    { q: 'What is a foreign key?', a: 'A column in a child table that references the primary (or unique) key of a parent table, enforcing that every value exists in the parent table (referential integrity).', level: 'Easy' },
    { q: 'Difference between VARCHAR and NVARCHAR?', a: 'VARCHAR stores non-Unicode text (1 byte per character for most characters). NVARCHAR stores Unicode (2 bytes per character) so it supports all languages. Use N\'...\' literals for NVARCHAR.', level: 'Easy' },
    { q: 'CHAR(10) vs VARCHAR(10)?', a: 'CHAR always uses 10 characters (pads with spaces); VARCHAR uses only the length of the actual value plus 2 bytes overhead. Use CHAR for fixed codes like country codes.', level: 'Medium' },
    { q: 'Why use DECIMAL instead of FLOAT for money?', a: 'DECIMAL is exact; FLOAT is approximate binary floating point, so 0.1 + 0.2 may not be exactly 0.3. Money calculations must be exact.', level: 'Medium' },
    { q: 'What does IDENTITY(1,1) mean?', a: 'The column auto-generates values starting at 1 (seed) and increasing by 1 (increment). You do not insert it; SQL Server assigns it.', level: 'Easy' },
    { q: 'Can a table have more than one foreign key? More than one primary key?', a: 'Many foreign keys - yes. Only one primary key, although it may be composite (several columns).', level: 'Easy' },
    { q: 'What is a composite key? Give an example.', a: 'A primary key made of two or more columns, e.g. Enrollments(StudentId, CourseId) where the pair is unique but each column alone repeats.', level: 'Medium' },
    { q: 'Can a foreign key column be NULL?', a: 'Yes, unless declared NOT NULL. A NULL FK means "no related row" (e.g. student not yet assigned to a course).', level: 'Medium' },
    { q: 'Why do IDENTITY values sometimes have gaps?', a: 'Failed or rolled back inserts, deleted rows, and server restarts (identity cache) consume values. IDENTITY guarantees uniqueness, not continuity.', level: 'Hard' },
    { q: 'What happens if you try to DROP the parent table Courses while Students references it?', a: 'SQL Server refuses: "Could not drop object \'Courses\' because it is referenced by a FOREIGN KEY constraint." Drop the child table or the constraint first.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a Departments table (DeptId identity PK, DeptName NVARCHAR(50) NOT NULL) and Employees table (EmpId identity PK, Name, Salary DECIMAL(10,2), JoinDate DATE, DeptId FK). Insert 3 departments and 4 employees.', hint: 'Create Departments first.', solution: `CREATE TABLE Departments (
    DeptId INT IDENTITY(1,1) PRIMARY KEY,
    DeptName NVARCHAR(50) NOT NULL
);
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Salary DECIMAL(10,2),
    JoinDate DATE,
    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)
);
INSERT INTO Departments (DeptName) VALUES ('HR'), ('IT'), ('Sales');
INSERT INTO Employees (Name, Salary, JoinDate, DeptId) VALUES
('Meera', 45000, '2024-01-10', 1), ('Arjun', 70000, '2023-07-01', 2),
('Sana', 65000, '2025-03-15', 2), ('Rahul', 40000, '2022-11-20', 3);` },
    { task: 'Pick data types for: mobile number, PIN code, product price, is-in-stock flag, product description (long text), order date-time.', hint: 'Phone numbers are not used for maths.', solution: 'Mobile VARCHAR(15) (leading +/0), PIN CHAR(6), Price DECIMAL(10,2), InStock BIT, Description NVARCHAR(MAX), OrderDate DATETIME2.' },
    { task: 'Create a many-to-many Enrollments table between Students and Courses with a composite primary key.', hint: 'PRIMARY KEY (StudentId, CourseId) at table level.', solution: `CREATE TABLE Enrollments (
    StudentId INT NOT NULL FOREIGN KEY REFERENCES Students(StudentId),
    CourseId  INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    EnrolledOn DATE,
    PRIMARY KEY (StudentId, CourseId)
);` },
    { task: 'Create the Courses table using the SSMS Table Designer only (no T-SQL), then use Script Table as > CREATE To to view the generated script.', hint: 'Set (Is Identity) = Yes in Column Properties.', solution: 'Tables > New > Table..., add CourseId int (uncheck Allow Nulls), right-click > Set Primary Key, Identity Specification Yes, add CourseName nvarchar(50), Ctrl+S > name Courses. Right-click dbo.Courses > Script Table as > CREATE To > New Query Editor Window.' },
  ],
  quiz: [
    { question: 'Which data type is best for storing a product price?', options: ['FLOAT', 'DECIMAL(10,2)', 'VARCHAR(10)', 'INT'], answer: 1, explanation: 'DECIMAL is exact and keeps paise/cents precisely.' },
    { question: 'Which statement about a PRIMARY KEY is FALSE?', options: ['It must be unique', 'It cannot be NULL', 'A table can have many primary keys', 'It can be composite'], answer: 2, explanation: 'Only ONE primary key per table (but it can contain several columns).' },
    { question: 'Students.CourseId references Courses.CourseId. Which table must be created first?', options: ['Students', 'Either', 'Neither - create together', 'Courses'], answer: 3, explanation: 'The parent (referenced) table must exist before a foreign key can point to it.' },
    { question: 'To store names in Hindi and English, use:', options: ['NVARCHAR', 'VARCHAR', 'CHAR', 'TEXT'], answer: 0, explanation: 'NVARCHAR stores Unicode characters for every language.' },
    { question: 'Inserting a student with CourseId 99 (not in Courses) gives:', options: ['A warning but the row is inserted', 'A FOREIGN KEY conflict error (547)', 'NULL is stored instead', 'Course 99 is auto-created'], answer: 1, explanation: 'Referential integrity rejects values that do not exist in the parent table.' },
  ],
};
