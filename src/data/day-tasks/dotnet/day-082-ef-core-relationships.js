export default {
  lesson: 'day-082-ef-core-relationships',
  minutes: 35,
  intro: 'Model one-to-one, one-to-many and many-to-many relationships with foreign keys and navigation properties, and query them with JOINs.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A Department has many Employees; each Employee belongs to one Department. Where does the **foreign key** column go?',
      options: ['DepartmentId in the Employees table', 'EmployeeId in the Departments table', 'In a third join table', 'In both tables'],
      answer: 0,
      explain: 'In one-to-many the FK sits on the **many** side: each employee row stores its `DepartmentId`. The Department class gets `ICollection<Employee> Employees`, the Employee class gets `int DepartmentId` + `Department Department`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the collection navigation property in `Department` for its employees:\n`public ______ Employees { get; set; } = new List<Employee>();`',
      example: { title: 'a reference navigation', code: 'public Department Department { get; set; }' },
      accept: ['ICollection<Employee>', 'List<Employee>', 'IList<Employee>'],
      acceptRegex: ['^I?(Collection|List)<\\s*Employee\\s*>$'],
      caseSensitive: true,
      explain: 'A **collection** navigation (`ICollection<T>`) is the "many" end; a **reference** navigation (`Department Department`) is the "one" end. Initialising the list avoids null reference errors when you add items.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Students and Courses are **many-to-many** (a student takes many courses, a course has many students). Which statements are TRUE? (choose all that apply)',
      options: [
        'The database needs a join table (e.g. Enrollments with StudentId and CourseId)',
        'EF Core 5+ can create the join table automatically from ICollection<Course> and ICollection<Student>',
        'An explicit Enrollment entity is needed when the join has extra data such as EnrolledOn or Grade',
        'Many-to-many is stored with a comma-separated list of course ids in the Students table',
        'The join table usually has a composite primary key (StudentId, CourseId)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Relational databases represent many-to-many with a **join table** of two FKs. EF Core can hide it (skip navigations) or you model it as an entity when it carries data like a grade. Comma-separated ids break normalization and cannot be joined or constrained.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'In a **one-to-one** relationship `Student` ↔ `StudentProfile` (FK `StudentId` on StudentProfile, cascade delete). The database has 3 students, each with a profile. What does this print?',
      example: { title: 'cascade delete', code: 'Deleting a Department with Cascade also deletes its Employees' },
      code: `var s = db.Students.Include(x => x.Profile).First(x => x.Id == 2);
db.Students.Remove(s);
db.SaveChanges();

Console.WriteLine(db.Students.Count());
Console.WriteLine(db.StudentProfiles.Count());`,
      expected: `2
2`,
      explain: 'With **cascade delete** (the default for a required FK), removing the principal (Student 2) also removes the dependent (its profile). Each table goes from 3 to 2 rows. With `DeleteBehavior.Restrict` the delete would fail instead.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: '**One-to-many JOIN.** List each employee\'s `Name` with their department name as `Department`, for all employees, ordered by employee `Name`.',
      example: { title: 'an INNER JOIN', code: 'SELECT o.Id, c.Name AS Customer\nFROM Orders o\nJOIN Customers c ON c.Id = o.CustomerId;' },
      setup: `CREATE TABLE Departments (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL
);
CREATE TABLE Employees (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL,
  DepartmentId INT NOT NULL REFERENCES Departments(Id)
);
INSERT INTO Departments (Name) VALUES ('IT'), ('HR'), ('Sales');
INSERT INTO Employees (Name, DepartmentId) VALUES
('Asha', 1), ('Ravi', 3), ('Meera', 1), ('Kiran', 2);`,
      starter: '-- TODO\nSELECT Name FROM Employees;\n',
      solution: 'SELECT e.Name, d.Name AS Department\nFROM Employees e\nJOIN Departments d ON d.Id = e.DepartmentId\nORDER BY e.Name;\n',
      ordered: true,
      explain: 'This is what `db.Employees.Include(e => e.Department)` loads: the FK `DepartmentId` is matched with the department\'s primary key. Use table aliases because both tables have a `Name` column.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 8,
      q: '**Many-to-many through a join table.** For every course, show `Title` and the number of enrolled students as `Students`, **including courses with 0 students**, ordered by `Title`.',
      example: { title: 'counting with LEFT JOIN', code: 'SELECT c.Name, COUNT(o.Id) AS Orders\nFROM Customers c\nLEFT JOIN Orders o ON o.CustomerId = c.Id\nGROUP BY c.Name;' },
      setup: `CREATE TABLE Students (Id INT PRIMARY KEY, Name NVARCHAR(50));
CREATE TABLE Courses (Id INT PRIMARY KEY, Title NVARCHAR(50));
CREATE TABLE Enrollments (
  StudentId INT REFERENCES Students(Id),
  CourseId INT REFERENCES Courses(Id),
  PRIMARY KEY (StudentId, CourseId)
);
INSERT INTO Students VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Meera');
INSERT INTO Courses VALUES (10, 'C#'), (20, 'SQL Server'), (30, 'React');
INSERT INTO Enrollments VALUES (1, 10), (1, 20), (2, 10), (3, 10), (3, 20);`,
      starter: '-- TODO\nSELECT Title FROM Courses;\n',
      solution: 'SELECT c.Title, COUNT(e.StudentId) AS Students\nFROM Courses c\nLEFT JOIN Enrollments e ON e.CourseId = c.Id\nGROUP BY c.Title\nORDER BY c.Title;\n',
      ordered: true,
      explain: 'The join table links the two sides. `LEFT JOIN` keeps React (0 students), and `COUNT(e.StudentId)` counts only matched rows - `COUNT(*)` would wrongly give React 1. In LINQ: `db.Courses.Select(c => new { c.Title, Students = c.Students.Count })`.',
    },
  ],
};
