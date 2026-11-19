export default {
  lesson: 'day-080-ef-core-migrations',
  minutes: 28,
  intro: 'Evolve the database schema safely with migrations: Add-Migration, Update-Database, Remove-Migration and the __EFMigrationsHistory table.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You added a `public string Email { get; set; }` property to `Student`. What are the next two steps to get the column in SQL Server?',
      options: ['Edit the table in SSMS, then restart the app', 'Add-Migration AddStudentEmail, then Update-Database', 'Update-Database, then Add-Migration', 'Drop the database and run the app'],
      answer: 1,
      explain: '`Add-Migration` compares the model with the last snapshot and writes a migration class (Up/Down). `Update-Database` executes pending migrations against the database. Editing the database by hand makes the model snapshot and database drift apart.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the **.NET CLI** command that creates a migration named `AddStudentEmail`:\n`dotnet ef ______`',
      example: { title: 'applying migrations with the CLI', code: 'dotnet ef database update' },
      accept: ['migrations add AddStudentEmail'],
      acceptRegex: ['^migrations\\s+add\\s+AddStudentEmail$'],
      caseSensitive: true,
      explain: 'CLI: `dotnet ef migrations add <Name>` and `dotnet ef database update`. Package Manager Console: `Add-Migration <Name>` and `Update-Database`. Both need the Microsoft.EntityFrameworkCore.Design package (and the dotnet-ef tool for the CLI).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about migrations are TRUE? (choose all that apply)',
      options: [
        'Each migration has an Up method (apply) and a Down method (revert)',
        'The __EFMigrationsHistory table records which migrations were applied to that database',
        'Remove-Migration deletes the last migration if it has NOT been applied yet',
        'Update-Database AddStudents (with an older name) can roll the database back to that migration',
        'Migration files should be deleted after Update-Database',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Migrations are source code: commit them so every developer and server gets the same schema. To undo an applied migration, first `Update-Database <PreviousMigration>` (runs Down), then `Remove-Migration`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A fresh database. These commands run in order. Which migration names are in `__EFMigrationsHistory` at the end? Type one per line in order.',
      example: { title: 'what Remove-Migration does', code: 'Add-Migration Draft   → file created, not applied\nRemove-Migration      → file deleted, database untouched' },
      code: `Add-Migration InitialCreate
Update-Database
Add-Migration AddStudentEmail
Update-Database
Add-Migration AddCourseFee
Remove-Migration
Add-Migration AddPhone
Update-Database`,
      expected: `InitialCreate
AddStudentEmail
AddPhone`,
      explain: '`AddCourseFee` was created and then removed **before** being applied, so it never reaches the database. Only migrations applied by `Update-Database` appear in the history table (real names also carry a timestamp prefix).',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: '**What the migration\'s Up() runs.** The `Students` table exists. Write the SQL that `AddStudentEmail` generates: add a nullable column `Email NVARCHAR(100)` to `Students`, then set `asha@mail.com` as the email of the student with `Id = 1`.',
      example: { title: 'adding a column', code: 'ALTER TABLE Courses ADD Fee DECIMAL(10,2) NULL;' },
      setup: `CREATE TABLE Students (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL
);
INSERT INTO Students (Name) VALUES ('Asha'), ('Ravi');`,
      starter: '-- TODO: ALTER TABLE ... then UPDATE\n',
      solution: "ALTER TABLE Students ADD Email NVARCHAR(100) NULL;\nUPDATE Students SET Email = 'asha@mail.com' WHERE Id = 1;\n",
      check: 'SELECT Id, Name, Email FROM Students ORDER BY Id',
      ordered: true,
      explain: 'A new column on a table that already has rows must be **nullable** or have a default - otherwise existing rows break the NOT NULL rule. EF Core generates `migrationBuilder.AddColumn<string>(..., nullable: true)` for a `string?` property.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In production, which is the safest way to apply migrations?',
      options: [
        'Run Update-Database from your laptop against production',
        'Generate an idempotent SQL script (dotnet ef migrations script --idempotent), review it, and run it as part of the deployment',
        'Call EnsureDeleted() and EnsureCreated() at startup',
        'Never change the production schema',
      ],
      answer: 1,
      explain: 'A reviewed **SQL script** (or migration bundle) can be checked by a DBA and run in the pipeline. `--idempotent` checks the history table, so it only applies what is missing. EnsureDeleted would wipe all production data.',
    },
  ],
};
