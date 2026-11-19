const CLASSES = `CREATE TABLE Courses (
    CourseId INT PRIMARY KEY,
    Title NVARCHAR(40) NOT NULL
);
INSERT INTO Courses VALUES (1, 'C# Basics'), (2, 'SQL Server'), (3, 'ASP.NET Core');`;

export default {
  lesson: 'day-048-constraints-primary-foreign-unique-check-default-not-null',
  minutes: 22,
  intro: 'Practise data-integrity constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, DEFAULT and NOT NULL.',
  tasks: [
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: 'Create a table `Students` with these rules:\n- `StudentId INT` primary key\n- `Name NVARCHAR(50)` that can **not** be NULL\n- `Email NVARCHAR(80)` that must be **UNIQUE**\n- `Age INT` that must be **between 16 and 60** (CHECK)\n- `Status NVARCHAR(10)` with **DEFAULT \'Active\'**\n\nThen insert (1, \'Asha\', \'asha@mail.com\', 21) and (2, \'Ravi\', \'ravi@mail.com\', 25) **without giving Status** (use a column list) so the default fills it.',
      example: { title: 'constraints in CREATE TABLE', code: "CREATE TABLE Accounts (\n    AccNo INT PRIMARY KEY,\n    Holder NVARCHAR(50) NOT NULL,\n    Pan NVARCHAR(10) UNIQUE,\n    Balance INT CHECK (Balance >= 0),\n    Type NVARCHAR(10) DEFAULT 'Savings'\n);\nINSERT INTO Accounts (AccNo, Holder, Pan, Balance) VALUES (1, 'Om', 'ABCDE1234F', 500);" },
      starter: '-- CREATE TABLE Students ( ... );\n-- INSERT INTO Students (StudentId, Name, Email, Age) VALUES ...\n',
      solution: "CREATE TABLE Students (\n    StudentId INT PRIMARY KEY,\n    Name NVARCHAR(50) NOT NULL,\n    Email NVARCHAR(80) UNIQUE,\n    Age INT CHECK (Age BETWEEN 16 AND 60),\n    Status NVARCHAR(10) DEFAULT 'Active'\n);\nINSERT INTO Students (StudentId, Name, Email, Age) VALUES (1, 'Asha', 'asha@mail.com', 21), (2, 'Ravi', 'ravi@mail.com', 25);",
      check: 'SELECT StudentId, Name, Email, Age, Status FROM Students ORDER BY StudentId;',
      explain: 'Constraints protect data at the database level, whatever app inserts it. A **DEFAULT** is used only when the column is left out of the INSERT column list; inserting NULL explicitly would store NULL.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'The `Courses` table exists. Create `Enrollments` with:\n- `EnrollId INT` primary key\n- `CourseId INT NOT NULL` with a **FOREIGN KEY** to `Courses(CourseId)`\n- `Fees INT` that must be **greater than 0** (CHECK)\n\nInsert (1, 2, 3999) and (2, 3, 5999).',
      example: { title: 'named constraints', code: 'CREATE TABLE OrderItems (\n    ItemId INT PRIMARY KEY,\n    OrderId INT NOT NULL,\n    Qty INT,\n    CONSTRAINT FK_Items_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),\n    CONSTRAINT CK_Items_Qty CHECK (Qty > 0)\n);' },
      setup: CLASSES,
      starter: '-- CREATE TABLE Enrollments ( ... );\n',
      solution: 'CREATE TABLE Enrollments (\n    EnrollId INT PRIMARY KEY,\n    CourseId INT NOT NULL,\n    Fees INT,\n    CONSTRAINT FK_Enroll_Course FOREIGN KEY (CourseId) REFERENCES Courses(CourseId),\n    CONSTRAINT CK_Enroll_Fees CHECK (Fees > 0)\n);\nINSERT INTO Enrollments VALUES (1, 2, 3999), (2, 3, 5999);',
      check: 'SELECT EnrollId, CourseId, Fees FROM Enrollments ORDER BY EnrollId;',
      explain: 'Naming constraints (`CONSTRAINT FK_…`) makes error messages readable and lets you drop them later by name. Inserting CourseId 9 or Fees 0 would now be rejected.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the difference between **PRIMARY KEY** and **UNIQUE**?',
      options: [
        'There is no difference',
        'A table has one primary key (never NULL); it can have many UNIQUE constraints, and a UNIQUE column in SQL Server allows one NULL',
        'UNIQUE columns can have duplicates',
        'PRIMARY KEY allows NULL, UNIQUE does not',
      ],
      answer: 1,
      explain: 'Both forbid duplicates. Only one primary key per table and it is always NOT NULL. UNIQUE (e.g. Email, PAN, Aadhaar) can appear many times, and SQL Server treats NULL as a value, so a UNIQUE column allows exactly one NULL.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the constraint (just the part that goes after the column type) so that `Gender CHAR(1)` accepts only \'M\', \'F\' or \'O\':\n`Gender CHAR(1) ____________________`',
      example: { title: 'CHECK with a list', code: "Status NVARCHAR(10) CHECK (Status IN ('Open', 'Closed'))" },
      accept: ["CHECK (Gender IN ('M', 'F', 'O'))", "CHECK (Gender IN ('M','F','O'))"],
      acceptRegex: ["^CHECK\\s*\\(\\s*Gender\\s+IN\\s*\\(\\s*'M'\\s*,\\s*'F'\\s*,\\s*'O'\\s*\\)\\s*\\)$", "^CHECK\\s*\\(\\s*Gender\\s*=\\s*'M'\\s+OR\\s+Gender\\s*=\\s*'F'\\s+OR\\s+Gender\\s*=\\s*'O'\\s*\\)$"],
      explain: 'A CHECK constraint holds a condition every row must satisfy. `IN (…)` is the cleanest way to allow a fixed set of values. Inserting \'X\' would fail with Msg 547 "conflicted with the CHECK constraint".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which INSERTs into the `Students` table from task 1 would **fail**? (Asha and Ravi already exist)',
      options: [
        "INSERT INTO Students (StudentId, Name, Email, Age) VALUES (3, 'Meena', 'asha@mail.com', 22)",
        "INSERT INTO Students (StudentId, Name, Email, Age) VALUES (4, NULL, 'x@mail.com', 22)",
        "INSERT INTO Students (StudentId, Name, Email, Age) VALUES (5, 'Om', 'om@mail.com', 12)",
        "INSERT INTO Students (StudentId, Name, Email, Age) VALUES (1, 'Kiran', 'k@mail.com', 30)",
        "INSERT INTO Students (StudentId, Name, Email, Age) VALUES (6, 'Neha', 'neha@mail.com', 30)",
      ],
      answers: [0, 1, 2, 3],
      explain: 'Option 1 breaks UNIQUE (duplicate email), option 2 breaks NOT NULL, option 3 breaks CHECK (age 12), option 4 breaks the PRIMARY KEY (Id 1 exists). Only Neha\'s row is valid.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why put rules like "age between 16 and 60" in a CHECK constraint even though the C# app already validates it?',
      options: [
        'It makes queries faster',
        'The database is the last line of defence: other apps, scripts or manual SSMS edits cannot insert invalid data',
        'C# validation does not work',
        'CHECK constraints are required for every column',
      ],
      answer: 1,
      explain: 'Validate in the UI/API for friendly messages **and** in the database for guaranteed integrity. Data often enters through more than one path (imports, admin scripts, other services).',
    },
  ],
};
