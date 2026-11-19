export default {
  lesson: 'day-081-ef-core-crud-operations',
  minutes: 32,
  intro: 'Create, read, update and delete records with EF Core (Add, Find, FirstOrDefault, Update, Remove, SaveChanges) and know the SQL each one sends.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `_db.Students.Find(5)` return when there is no student with key 5?',
      options: ['An empty Student object', 'null', 'It throws InvalidOperationException', 'The first student'],
      answer: 1,
      explain: '`Find` (and `FirstOrDefault`) return **null** when nothing matches, so check it and return `NotFound()`. `First()` and `Single()` throw instead. `Find` also checks already-tracked entities before hitting the database.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that writes all pending changes (adds, edits, deletes) to the database **asynchronously**:\n`await _db.______;`',
      example: { title: 'the sync version', code: '_db.SaveChanges();' },
      accept: ['SaveChangesAsync()', 'SaveChangesAsync();'],
      caseSensitive: true,
      explain: '`SaveChangesAsync` frees the request thread while SQL Server works. It sends all tracked changes in one transaction and returns the number of affected rows.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The table starts with Asha (Id 1, Marks 70) and Ravi (Id 2, Marks 50). What does this code print?',
      example: { title: 'tracked entities', code: 'var p = db.Products.Find(3);\np.Price = 99;        // tracked: marked Modified\ndb.SaveChanges();    // UPDATE ... SET Price = 99' },
      code: `var asha = db.Students.Find(1);
asha.Marks += 10;

var ravi = db.Students.Find(2);
db.Students.Remove(ravi);

db.Students.Add(new Student { Name = "Meera", Marks = 95 });

int affected = db.SaveChanges();
Console.WriteLine(affected);
Console.WriteLine(db.Students.Count());
Console.WriteLine(db.Students.Find(1).Marks);`,
      expected: `3
2
80`,
      explain: 'One UPDATE (Asha), one DELETE (Ravi) and one INSERT (Meera) = **3** affected rows, all in one transaction. 2 students remain, and Asha\'s marks are 80. You never call `Update()` for an entity that is already tracked - changing the property is enough.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Remove() on a tracked entity followed by SaveChanges sends a DELETE',
        'Add() alone inserts the row immediately',
        'After SaveChanges, the IDENTITY Id is filled into the added object',
        '_db.Students.Update(student) marks ALL properties as modified (used for detached objects from a form)',
        'ToList() on a DbSet with a million rows is always fine',
      ],
      answers: [0, 2, 3],
      explain: 'Nothing is sent until `SaveChanges`. EF reads the generated key back, so `newStudent.Id` is available for `CreatedAtAction`. `Update()` attaches a detached entity as fully modified. Loading whole huge tables wastes memory - filter and page instead.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: '**The SQL behind an Edit + Delete.** Write the statements EF Core sends for:\n1. increase `Marks` by **5** for every student in `Pune`\n2. delete the student whose `Id = 4`',
      example: { title: 'UPDATE and DELETE', code: "UPDATE Products SET Price = Price * 1.1 WHERE Category = 'Books';\nDELETE FROM Products WHERE Id = 9;" },
      setup: `CREATE TABLE Students (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL,
  City NVARCHAR(30),
  Marks INT
);
INSERT INTO Students (Name, City, Marks) VALUES
('Asha', 'Pune', 70), ('Ravi', 'Nagpur', 50), ('Kiran', 'Pune', 62), ('Sana', 'Delhi', 45);`,
      starter: '-- TODO: UPDATE ... ; DELETE ...;\n',
      solution: "UPDATE Students SET Marks = Marks + 5 WHERE City = 'Pune';\nDELETE FROM Students WHERE Id = 4;\n",
      check: 'SELECT Id, Name, City, Marks FROM Students ORDER BY Id',
      ordered: true,
      explain: 'Without the WHERE clause UPDATE/DELETE change **every** row - the most dangerous SQL mistake. EF Core 7+ can run such bulk changes directly with `ExecuteUpdate`/`ExecuteDelete` instead of loading entities first.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: '**The SQL behind Details.** `_db.Students.FirstOrDefault(s => s.Name == "Kiran")` - write the query EF Core sends: return the first (`TOP 1`, lowest `Id`) row with all columns where `Name` is `Kiran`.',
      example: { title: 'TOP in SQL Server', code: "SELECT TOP 1 * FROM Courses WHERE Title = 'React';" },
      setup: `CREATE TABLE Students (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL,
  City NVARCHAR(30),
  Marks INT
);
INSERT INTO Students (Name, City, Marks) VALUES
('Asha', 'Pune', 70), ('Kiran', 'Nagpur', 50), ('Kiran', 'Pune', 62);`,
      starter: '-- TODO\nSELECT * FROM Students;\n',
      solution: "SELECT TOP 1 Id, Name, City, Marks\nFROM Students\nWHERE Name = 'Kiran'\nORDER BY Id;\n",
      ordered: true,
      explain: '`FirstOrDefault` becomes `SELECT TOP(1) ...`. Without an `ORDER BY` SQL Server may return any matching row, so add one (here by Id) when "first" must be predictable - in LINQ, put `OrderBy` before `FirstOrDefault`.',
    },
  ],
};
