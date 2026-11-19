const EMP = `CREATE TABLE Employees (EmpId INT PRIMARY KEY, Name NVARCHAR(50), Dept NVARCHAR(20), Phone VARCHAR(10), Salary INT, Pan VARCHAR(10));
INSERT INTO Employees VALUES
(1, 'Asha', 'IT', '9876543210', 90000, 'ABCDE1234F'),
(2, 'Ravi', 'Sales', '9123456780', 52000, 'PQRSX5678K'),
(3, 'Meera', 'HR', '9988776655', 61000, 'LMNOP4321Z');`;

export default {
  lesson: 'extra-39-database-security-logins-users-roles',
  minutes: 25,
  intro: 'Separate server logins from database users, grant least privilege through roles, and hide sensitive columns with views.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the difference between a **login** and a **user** in SQL Server?',
      options: ['They are the same thing', 'A login authenticates to the server instance; a user maps that login into one database and receives permissions there', 'A user is server-level, a login is database-level', 'Logins are only for Windows accounts'],
      answer: 1,
      explain: '`CREATE LOGIN` lets someone connect to the instance. `CREATE USER ... FOR LOGIN ...` inside a database maps that login to a database principal, which then gets roles and permissions in that database only.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inside \`SchoolDb\`, create a database user for the existing login \`school_app\`:
\`CREATE USER school_app ______ school_app;\``,
      example: { title: 'creating the login (server level)', code: "CREATE LOGIN school_app WITH PASSWORD = 'Str0ng!Pass#2024';" },
      accept: ['FOR LOGIN', 'FROM LOGIN'],
      explain: '`CREATE USER name FOR LOGIN loginName` (FROM LOGIN also works) maps the server login into the current database. Without a user, the login can connect but cannot open the database.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'An ASP.NET Core app only needs to read and write data. Which choices follow **least privilege**? Select all that apply.',
      options: ['Add the app user to `db_datareader` and `db_datawriter`', 'Connect as `sa` because it always works', 'Grant `EXECUTE` on the specific stored procedures the app calls', 'Add the app user to `db_owner`', '`DENY SELECT ON dbo.Salaries TO school_app;` for a table it must never read'],
      answers: [0, 2, 4],
      explain: 'Give only what is needed: reader/writer roles or EXECUTE on specific procedures, plus DENY for forbidden objects (DENY overrides GRANT). `sa` or `db_owner` would let a single SQL injection drop tables or read everything.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Remove a previously granted (or denied) permission so it goes back to "not set":
\`______ SELECT ON dbo.Employees FROM report_user;\``,
      example: { title: 'grant and deny', code: `GRANT SELECT ON dbo.Products TO report_user;
DENY DELETE ON dbo.Products TO report_user;` },
      accept: ['REVOKE'],
      explain: '`REVOKE` removes a GRANT or DENY entry; the user may still get the permission through a role. `DENY` actively blocks it and wins over any GRANT, including grants through roles.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: `HR wants a staff directory without salaries or PAN numbers. Create a view \`vw_EmployeeDirectory\` showing only \`EmpId\`, \`Name\` and \`Dept\`, then select everything from the view.
(In SSMS you would then \`GRANT SELECT ON vw_EmployeeDirectory\` and not on the table.)`,
      example: { title: 'view in its own batch', code: `CREATE VIEW vw_ProductList AS
SELECT ProductId, Name FROM Products;
GO
SELECT * FROM vw_ProductList;` },
      setup: EMP,
      starter: '-- CREATE VIEW vw_EmployeeDirectory AS ...\n-- GO\nSELECT * FROM vw_EmployeeDirectory;\n',
      solution: 'CREATE VIEW vw_EmployeeDirectory AS\nSELECT EmpId, Name, Dept FROM Employees;\nGO\nSELECT * FROM vw_EmployeeDirectory;',
      explain: 'A view exposes only selected columns. Users granted SELECT on the view (but not on the table) can never see Salary or Pan. `CREATE VIEW` must be the first statement in its batch, hence the `GO`.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 5,
      q: 'Support staff may see phone numbers only **masked**. Return `Name` and `Phone` where Phone shows `XXXXXX` followed by the **last 4 digits** (e.g. `XXXXXX3210`). All phone numbers have 10 digits; use `SUBSTRING` in this lab.',
      example: { title: 'string functions', code: "SELECT SUBSTRING(Pan, 1, 2) + '********' AS MaskedPan FROM Employees;  -- AB********" },
      setup: EMP,
      starter: 'SELECT Name, Phone FROM Employees;\n',
      solution: "SELECT Name, 'XXXXXX' + SUBSTRING(Phone, 7, 4) AS Phone FROM Employees;",
      explain: 'The phone numbers have 10 digits, so `SUBSTRING(Phone, 7, 4)` (or `RIGHT(Phone, 4)` in SSMS) keeps the last four characters, and `+` concatenates strings in T-SQL. SQL Server also has **Dynamic Data Masking** (`ALTER TABLE ... ALTER COLUMN Phone ADD MASKED WITH (FUNCTION = \'partial(0,"XXXXXX",4)\')`), which masks automatically for users without the UNMASK permission.',
    },
  ],
};
