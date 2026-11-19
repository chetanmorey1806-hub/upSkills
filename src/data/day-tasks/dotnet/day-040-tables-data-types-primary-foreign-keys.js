const DEPTS = `CREATE TABLE Departments (
    DeptId INT PRIMARY KEY,
    DeptName NVARCHAR(30)
);
INSERT INTO Departments VALUES (10, 'IT'), (20, 'HR'), (30, 'Sales');`;

export default {
  lesson: 'day-040-tables-data-types-primary-foreign-keys',
  minutes: 20,
  intro: 'Practise creating tables with the right SQL Server data types, a primary key and a foreign key that links two tables.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which SQL Server data type is best for a product **price** like 1499.50?',
      options: ['INT', 'FLOAT', 'DECIMAL(10, 2)', 'NVARCHAR(10)'],
      answer: 2,
      explain: '`DECIMAL(10, 2)` stores exact values with 2 digits after the point (up to 10 digits total). FLOAT is approximate (rounding errors in money), INT has no paise, and storing numbers as text breaks sorting and maths.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'A column must store student names in **Hindi and Marathi** as well as English. Which text data type (without the length) should you use?',
      example: { title: 'text types', text: 'VARCHAR(50)  → non-Unicode text\n?????(50) → Unicode text (1 character = 2 bytes)' },
      accept: ['NVARCHAR', 'NVARCHAR(50)', 'NCHAR', 'NVARCHAR(MAX)'],
      explain: 'The **N** prefix types (`NVARCHAR`, `NCHAR`) store Unicode, so any language works. Insert Unicode literals with an N prefix: `N\'आशा\'`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about a **PRIMARY KEY** are TRUE? (choose all that apply)',
      options: [
        'It uniquely identifies each row',
        'It cannot contain NULL',
        'A table can have only one primary key (which may consist of several columns)',
        'Its values may repeat if you add an index',
        'By default SQL Server creates a clustered index on it',
      ],
      answers: [0, 1, 2, 4],
      explain: 'A primary key is **unique and NOT NULL**, one per table (composite keys use several columns). SQL Server backs it with a clustered index by default. Duplicate values are never allowed.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Create a table `Products` with:\n- `ProductId INT` as the **primary key**\n- `Name NVARCHAR(50)`\n- `Price DECIMAL(10, 2)`\n- `InStock BIT`\n\nInsert (1, \'Laptop\', 55000.00, 1) and (2, \'Mouse\', 499.50, 0), then show all rows.',
      example: { title: 'table with types', code: "CREATE TABLE Books (\n    BookId INT PRIMARY KEY,\n    Title NVARCHAR(80),\n    Price DECIMAL(8, 2),\n    Available BIT\n);" },
      starter: '-- CREATE TABLE Products ( ... );\n',
      solution: "CREATE TABLE Products (\n    ProductId INT PRIMARY KEY,\n    Name NVARCHAR(50),\n    Price DECIMAL(10, 2),\n    InStock BIT\n);\nINSERT INTO Products VALUES (1, 'Laptop', 55000.00, 1), (2, 'Mouse', 499.50, 0);\nSELECT * FROM Products;",
      check: 'SELECT ProductId, Name, Price, InStock FROM Products ORDER BY ProductId;',
      explain: 'Choosing types carefully matters: `DECIMAL(10, 2)` for money, `BIT` for yes/no (1/0), `NVARCHAR` for names. The primary key makes every ProductId unique.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: 'The `Departments` table exists (see setup). Create a table `Employees` with:\n- `EmpId INT PRIMARY KEY`\n- `Name NVARCHAR(50)`\n- `DeptId INT` as a **FOREIGN KEY** referencing `Departments(DeptId)`\n\nInsert (1, \'Kiran\', 10) and (2, \'Sneha\', 30), then show all employees.',
      example: { title: 'foreign key syntax', code: 'CREATE TABLE Orders (\n    OrderId INT PRIMARY KEY,\n    CustomerId INT FOREIGN KEY REFERENCES Customers(CustomerId)\n);' },
      setup: DEPTS,
      starter: '-- CREATE TABLE Employees ( ... );\n',
      solution: "CREATE TABLE Employees (\n    EmpId INT PRIMARY KEY,\n    Name NVARCHAR(50),\n    DeptId INT FOREIGN KEY REFERENCES Departments(DeptId)\n);\nINSERT INTO Employees VALUES (1, 'Kiran', 10), (2, 'Sneha', 30);\nSELECT * FROM Employees;",
      check: 'SELECT EmpId, Name, DeptId FROM Employees ORDER BY EmpId;',
      explain: 'A **foreign key** makes sure every `Employees.DeptId` exists in `Departments`. Inserting an employee with DeptId 99 would fail with "The INSERT statement conflicted with the FOREIGN KEY constraint". You can also write `CONSTRAINT FK_Emp_Dept FOREIGN KEY (DeptId) REFERENCES Departments(DeptId)`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'With `Employees.DeptId` referencing `Departments.DeptId`, what happens if you try `DELETE FROM Departments WHERE DeptId = 10;` while Kiran still belongs to department 10?',
      options: [
        'The department is deleted and Kiran\'s DeptId becomes NULL automatically',
        'The DELETE fails with a foreign key conflict (unless ON DELETE CASCADE / SET NULL was defined)',
        'Kiran is deleted too, always',
        'Nothing happens and no error is shown',
      ],
      answer: 1,
      explain: 'By default (NO ACTION) SQL Server protects **referential integrity**: a parent row that still has children cannot be deleted. `ON DELETE CASCADE` or `ON DELETE SET NULL` must be specified explicitly if you want other behaviour.',
    },
  ],
};
