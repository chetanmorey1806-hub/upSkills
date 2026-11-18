const q1 = `-- Run in real SQL Server as a sysadmin (security statements are not supported in the in-app lab)
-- Prerequisite: Example 3 has created HrSecureDB (or create any test database)
USE master;
GO
-- 1) SQL Server authentication login (server level) with password policy
CREATE LOGIN hr_reader
WITH PASSWORD = N'Str0ng#Pass2026',
     CHECK_POLICY = ON,            -- use Windows password rules (length, complexity, lockout)
     CHECK_EXPIRATION = OFF,
     DEFAULT_DATABASE = HrSecureDB;
GO
-- 2) Windows login (domain user or group) - no password stored in SQL Server
-- CREATE LOGIN [CONTOSO\\HR-Team] FROM WINDOWS WITH DEFAULT_DATABASE = HrSecureDB;
GO
-- 3) Database user mapped to the login (database level)
USE HrSecureDB;
GO
CREATE USER hr_reader FOR LOGIN hr_reader WITH DEFAULT_SCHEMA = dbo;
GO
-- 4) See what exists
SELECT name, type_desc, is_disabled, default_database_name
FROM sys.server_principals WHERE name = 'hr_reader';

SELECT dp.name AS UserName, dp.type_desc, sp.name AS LoginName
FROM sys.database_principals dp
LEFT JOIN sys.server_principals sp ON sp.sid = dp.sid
WHERE dp.name = 'hr_reader';
GO
-- 5) Manage the login
ALTER LOGIN hr_reader DISABLE;      -- block sign-in temporarily
ALTER LOGIN hr_reader ENABLE;
ALTER LOGIN hr_reader WITH PASSWORD = N'N3w#Pass2026';`;

const q2 = `-- Run in real SQL Server after Example 1
USE HrSecureDB;
GO
-- 1) Fixed database role: read every table
ALTER ROLE db_datareader ADD MEMBER hr_reader;
GO
-- 2) Custom role with exactly the permissions a job needs
CREATE ROLE PayrollClerk;
GRANT SELECT ON dbo.vw_EmployeeDirectory TO PayrollClerk;
GRANT SELECT, UPDATE ON dbo.Employees (Salary) TO PayrollClerk;   -- column-level permission
DENY SELECT ON dbo.Employees (PanNumber) TO PayrollClerk;          -- DENY always wins
GO
CREATE USER payroll_user WITHOUT LOGIN;    -- test user (no login needed for EXECUTE AS)
ALTER ROLE PayrollClerk ADD MEMBER payroll_user;
GO
-- 3) Test the permissions by impersonating the user
EXECUTE AS USER = 'payroll_user';
    SELECT USER_NAME() AS CurrentUser;
    SELECT Name, Email FROM dbo.vw_EmployeeDirectory;      -- works
    SELECT PanNumber FROM dbo.Employees;                    -- fails: SELECT denied on PanNumber
REVERT;                                                     -- back to your own identity
GO
-- 4) Remove a permission and list what a role has
REVOKE UPDATE ON dbo.Employees (Salary) FROM PayrollClerk;

SELECT pr.name AS Principal, pe.permission_name, pe.state_desc,
       OBJECT_NAME(pe.major_id) AS ObjectName, COL_NAME(pe.major_id, pe.minor_id) AS ColumnName
FROM sys.database_permissions pe
JOIN sys.database_principals pr ON pr.principal_id = pe.grantee_principal_id
WHERE pr.name = 'PayrollClerk';`;

const q3 = `CREATE DATABASE HrSecureDB;
GO
USE HrSecureDB;
GO
CREATE TABLE Employees (
    EmpId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Department NVARCHAR(30) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Salary INT NOT NULL,
    PanNumber VARCHAR(10) NOT NULL
);
GO
INSERT INTO Employees (Name, Department, Email, Salary, PanNumber) VALUES
('Asha', 'IT', 'asha@corp.com', 85000, 'ABCDE1234F'),
('Ravi', 'HR', 'ravi@corp.com', 52000, 'PQRSX5678K'),
('Meera', 'IT', 'meera@corp.com', 61000, 'LMNOP4321Z');
GO
-- A view exposes only safe columns; users get SELECT on the view, not the table
CREATE VIEW vw_EmployeeDirectory AS
SELECT EmpId, Name, Department, Email
FROM Employees;
GO
-- Masked view for the payroll helpdesk: only last 4 characters of PAN
CREATE VIEW vw_EmployeePanMasked AS
SELECT EmpId, Name, 'XXXXXX' + RIGHT(PanNumber, 4) AS PanMasked
FROM Employees;
GO
SELECT * FROM vw_EmployeeDirectory ORDER BY EmpId;
SELECT * FROM vw_EmployeePanMasked ORDER BY EmpId;`;

const q4 = `-- Run in real SQL Server as sysadmin: a least-privilege login for an ASP.NET Core Web API
USE master;
GO
CREATE LOGIN shop_api WITH PASSWORD = N'Api#Str0ng!2026', CHECK_POLICY = ON;
GO
USE ShopDB;
GO
CREATE USER shop_api FOR LOGIN shop_api;
CREATE ROLE ApiRole;
-- Only data access - no CREATE/ALTER/DROP, not db_owner, not sysadmin
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO ApiRole;
GRANT EXECUTE ON SCHEMA::dbo TO ApiRole;            -- stored procedures
DENY DELETE ON dbo.AuditLog TO ApiRole;               -- nobody deletes the audit trail
ALTER ROLE ApiRole ADD MEMBER shop_api;
GO
-- Migrations (dotnet ef database update) run separately with a deployment login
-- that has db_ddladmin, so the running API cannot change the schema.

/* appsettings.Production.json (keep the password out of source control:
   use User Secrets in development and environment variables / Azure Key Vault in production)
{
  "ConnectionStrings": {
    "ShopDb": "Server=sql01;Database=ShopDB;User Id=shop_api;Password=<from-secret-store>;Encrypt=True;TrustServerCertificate=False"
  }
}
   With Windows/Integrated authentication (no password at all):
   "Server=sql01;Database=ShopDB;Trusted_Connection=True;Encrypt=True"
*/`;

export default {
  id: 'extra-39-database-security-logins-users-roles',
  title: 'Database Security: Logins, Users and Roles',
  module: 'Extra: SQL Server',
  extraNo: 39,
  level: 'Intermediate to Advanced',
  duration: '2 hours',
  summary: `Learn the SQL Server security model: authentication (Windows vs SQL Server logins) at the server level, users at the database level, fixed server and database roles, custom roles, and permissions with GRANT, DENY and REVOKE at server, database, schema, object and column level. Test permissions with EXECUTE AS, hide sensitive columns with views, and set up a least-privilege login and secure connection string for an ASP.NET Core application.`,
  objectives: [
    'Distinguish authentication from authorization and Windows from SQL Server authentication',
    'Create logins and map them to database users',
    'Use fixed server roles, fixed database roles and custom roles',
    'Apply GRANT, DENY and REVOKE at schema, object and column level, and test with EXECUTE AS',
    'Apply least privilege for applications and protect sensitive data with views and encryption features',
  ],
  theory: [
    {
      heading: 'Authentication vs authorization; logins vs users',
      content: `- **Authentication** = who are you? (proving identity)
- **Authorization** = what are you allowed to do? (permissions)

SQL Server has two levels:
- **Login** (server level, stored in master) - lets someone **connect** to the SQL Server instance.
- **User** (database level, stored in each database) - lets that login **enter a specific database**. A user is mapped to a login by its SID.

Analogy: the **login** is your ID card for the office building gate; the **user** is the access card that opens a particular department's door; **roles/permissions** decide which cupboards you can open inside.

Authentication modes (Server Properties > Security):
- **Windows Authentication** - uses Windows/Active Directory accounts; no passwords in SQL Server; recommended.
- **Mixed Mode** - Windows plus **SQL Server logins** (name + password stored in SQL Server, e.g. sa). Needed for some apps, Linux/containers and cross-domain access. Disable or rename **sa** and use strong passwords.

**Contained database users** (CREATE USER x WITH PASSWORD = ...) and Microsoft Entra ID (Azure AD) users are common in Azure SQL Database.`,
    },
    {
      heading: 'Creating logins and users',
      content: `**T-SQL**:
- CREATE LOGIN name WITH PASSWORD = '...' [, CHECK_POLICY = ON, DEFAULT_DATABASE = db]
- CREATE LOGIN [DOMAIN\\User] FROM WINDOWS
- CREATE USER name FOR LOGIN name (run inside the target database)
- ALTER LOGIN ... DISABLE / ENABLE / WITH PASSWORD = ...; DROP USER / DROP LOGIN

**SSMS**:
1. Object Explorer > **Security > Logins** > right-click > **New Login...**
2. General page: Login name, choose Windows or SQL Server authentication, password, Enforce password policy, Default database.
3. **User Mapping** page: tick the database (this creates the user) and tick database roles (db_datareader ...).
4. Server Roles page: leave only **public** unless the person is an administrator.
5. OK. Check under Databases > YourDB > Security > Users.

Orphaned users: after restoring a database on another server, users may not match logins (different SID). Fix with ALTER USER name WITH LOGIN = name.`,
      syntax: `CREATE LOGIN hr_reader WITH PASSWORD = N'Str0ng#Pass2026', CHECK_POLICY = ON;
USE HrSecureDB;
CREATE USER hr_reader FOR LOGIN hr_reader;`,
    },
    {
      heading: 'Roles: fixed server, fixed database and custom',
      content: `A **role** is a group of permissions. Add people to roles instead of granting permissions one by one.

**Fixed server roles** (instance-wide): **sysadmin** (everything - give to very few), securityadmin, serveradmin, dbcreator, processadmin, bulkadmin, setupadmin, diskadmin, and public.

**Fixed database roles**:
| Role | Allows |
|---|---|
| db_owner | everything in the database |
| db_datareader | SELECT on all tables/views |
| db_datawriter | INSERT/UPDATE/DELETE on all tables |
| db_ddladmin | CREATE/ALTER/DROP objects (migrations) |
| db_securityadmin | manage roles and permissions |
| db_backupoperator | back up the database |
| db_denydatareader / db_denydatawriter | explicitly deny reading / writing |

**Custom roles**: CREATE ROLE PayrollClerk; GRANT ... TO PayrollClerk; ALTER ROLE PayrollClerk ADD MEMBER someone; - model your real job functions (Accountant, Support, ReportViewer).`,
    },
    {
      heading: 'Permissions: GRANT, DENY, REVOKE',
      content: `- **GRANT** gives a permission.
- **DENY** explicitly forbids it - **DENY wins** over any GRANT from other roles (except for sysadmin/db_owner who bypass checks).
- **REVOKE** removes a previous GRANT or DENY (returns to "not set").

Scope levels (most general to most specific): server > database > **schema** > object (table, view, procedure) > **column**.

Common permissions: SELECT, INSERT, UPDATE, DELETE, EXECUTE (procedures/functions), ALTER, CONTROL, VIEW DEFINITION, REFERENCES, CREATE TABLE.

Testing: **EXECUTE AS USER = 'name'** temporarily switches identity; **REVERT** switches back. SELECT * FROM fn_my_permissions(NULL, 'DATABASE') lists your permissions.`,
      syntax: `GRANT SELECT ON dbo.Products TO ReportViewer;
GRANT EXECUTE ON SCHEMA::dbo TO ApiRole;
GRANT SELECT, UPDATE ON dbo.Employees (Salary) TO PayrollClerk;
DENY  SELECT ON dbo.Employees (PanNumber) TO PayrollClerk;
REVOKE UPDATE ON dbo.Employees (Salary) FROM PayrollClerk;`,
    },
    {
      heading: 'Protecting data: views, procedures, encryption and the application',
      content: `- **Views** expose only safe columns/rows; grant SELECT on the view, not the table (ownership chaining lets the view read the table).
- **Stored procedures**: grant EXECUTE only - users can change data only through validated procedures.
- **Row-Level Security** (security policies with predicate functions) filters rows per user, e.g. each branch manager sees only their branch.
- **Dynamic Data Masking**: ALTER TABLE ... ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()') - non-privileged users see aXX@XXXX.com.
- **Encryption**: TDE (Transparent Data Encryption) encrypts data files and backups at rest; **Always Encrypted** keeps columns like PAN/Aadhaar encrypted even from DBAs; **Encrypt=True** in connection strings encrypts data in transit (TLS).
- **Auditing**: SQL Server Audit records logins and data access.

For **applications** (ASP.NET Core / EF Core):
- One dedicated login per application with only the permissions it needs - **never sa or db_owner**.
- Store connection strings in User Secrets (development), environment variables or Azure Key Vault (production) - never in source control.
- Prefer Windows/Integrated authentication or Managed Identity in Azure (no password at all).
- Use parameterized queries (EF Core does this) to prevent SQL injection.`,
    },
  ],
  examples: [
    {
      title: 'Create a SQL login and a database user (SSMS)',
      scenario: 'The HR reporting team needs to connect to HrSecureDB. Create a SQL Server login with password policy, map it to a database user and inspect the security catalog views.',
      steps: [
        'Run Example 3 first (it creates HrSecureDB) - or use any test database',
        'In SSMS, connect as a sysadmin and click New Query (Ctrl+N). Security statements do not run in the in-app lab',
        'Paste the script and press F5',
        'GUI alternative: Security > Logins > right-click > New Login... > SQL Server authentication > User Mapping: tick HrSecureDB > OK. Then test with File > Connect Object Explorer using hr_reader',
      ],
      code: q1,
      result: `Result 1 (sys.server_principals):
name       type_desc  is_disabled  default_database_name
hr_reader  SQL_LOGIN  0            HrSecureDB

Result 2 (sys.database_principals):
UserName   type_desc  LoginName
hr_reader  SQL_USER   hr_reader

Messages: Commands completed successfully.`,
      explanation: `CREATE LOGIN creates the server-level identity (stored in master) and CHECK_POLICY applies Windows password rules. CREATE USER ... FOR LOGIN creates the database-level user linked by the login's SID - the join on sid in the second query proves the mapping. At this point hr_reader can connect and enter HrSecureDB but cannot read any table yet: users start with only the public role.`,
    },
    {
      title: 'Roles and GRANT / DENY / REVOKE with EXECUTE AS (SSMS)',
      scenario: 'Give the HR reader read access through a fixed role, and create a PayrollClerk role that can read the directory view and salaries but never the PAN number.',
      steps: [
        'Run Examples 3 and 1 first',
        'In SSMS open a New Query window (Ctrl+N), paste the script and press F5',
        'Read both the Results and the Messages tab (the denied SELECT shows an error)',
        'GUI alternative: Databases > HrSecureDB > Security > Roles > Database Roles > right-click > New Database Role...; use the Securables page to grant/deny',
      ],
      code: q2,
      result: `CurrentUser
payroll_user

Name   Email
Asha   asha@corp.com
Ravi   ravi@corp.com
Meera  meera@corp.com

Msg 230, Level 14, State 1
The SELECT permission was denied on the column 'PanNumber' of the object 'Employees', database 'HrSecureDB', schema 'dbo'.

Permissions of PayrollClerk (after REVOKE):
Principal     permission_name  state_desc  ObjectName            ColumnName
PayrollClerk  SELECT           GRANT       vw_EmployeeDirectory  NULL
PayrollClerk  SELECT           GRANT       Employees             Salary
PayrollClerk  SELECT           DENY        Employees             PanNumber`,
      explanation: `db_datareader gives hr_reader SELECT on every table. PayrollClerk gets only what the job needs: the directory view, the Salary column, and an explicit DENY on PanNumber. EXECUTE AS USER lets you test as payroll_user (a user WITHOUT LOGIN, handy for testing); the view works, the PAN query fails with error 230, and REVERT returns to your identity. REVOKE removes the UPDATE grant, so the permission list no longer shows it.`,
    },
    {
      title: 'Column-level protection with views and masking (runs in the lab)',
      scenario: 'Employees must see each other\'s name, department and email but not salary or PAN. The helpdesk may see only the last four characters of the PAN.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab) and click New Query (Ctrl+N)',
        'Paste the script - it creates HrSecureDB',
        'Press F5 and read the two result grids',
        'In real SQL Server you would then GRANT SELECT on these views (Example 2) instead of on the Employees table',
      ],
      code: q3,
      tsql: q3,
      result: `+-------+-------+------------+----------------+
| EmpId | Name  | Department | Email          |
+-------+-------+------------+----------------+
| 1     | Asha  | IT         | asha@corp.com  |
| 2     | Ravi  | HR         | ravi@corp.com  |
| 3     | Meera | IT         | meera@corp.com |
+-------+-------+------------+----------------+
3 row(s) returned

+-------+-------+------------+
| EmpId | Name  | PanMasked  |
+-------+-------+------------+
| 1     | Asha  | XXXXXX234F |
| 2     | Ravi  | XXXXXX678K |
| 3     | Meera | XXXXXX321Z |
+-------+-------+------------+
3 row(s) returned`,
      explanation: `vw_EmployeeDirectory simply leaves out Salary and PanNumber. vw_EmployeePanMasked builds a masked value with 'XXXXXX' + RIGHT(PanNumber, 4). Users granted SELECT on a view can read it even without permission on the base table (ownership chaining, because both belong to dbo) - this is the classic way to implement column-level security. SQL Server 2016+ also offers Dynamic Data Masking and Row-Level Security for the same goals.`,
    },
    {
      title: 'Least-privilege login for an ASP.NET Core application (SSMS)',
      scenario: 'A Web API uses EF Core against ShopDB. Create a dedicated login that can read/write data and run procedures but cannot change the schema or delete the audit log, and store the connection string safely.',
      steps: [
        'Make sure a ShopDB database with an AuditLog table exists on your server',
        'In SSMS, as sysadmin, open a New Query window (Ctrl+N), paste the T-SQL part and press F5',
        'In Visual Studio right-click the API project > Manage User Secrets and add the connection string there for development',
        'In production set the environment variable ConnectionStrings__ShopDb (or an Azure Key Vault secret) instead of committing it to appsettings.json',
      ],
      code: q4,
      result: `Commands completed successfully.

When the API (connected as shop_api) runs:
- SELECT / INSERT / UPDATE through EF Core: succeed
- DELETE FROM dbo.AuditLog: The DELETE permission was denied on the object 'AuditLog' (Msg 229)
- DROP TABLE dbo.Products (e.g. via SQL injection): Cannot drop the table ... because it does not exist or you do not have permission (Msg 3701)`,
      explanation: `Schema-level GRANT ON SCHEMA::dbo automatically covers tables created later, so the role does not need updating for each migration. The DENY on AuditLog overrides the schema-level DELETE grant. Because the login is not db_owner, even a successful SQL injection could not drop tables. Schema changes are applied by a separate deployment identity with db_ddladmin. Passwords stay out of source control (User Secrets / environment variables / Key Vault), and Encrypt=True protects data on the network.`,
    },
  ],
  interview: [
    { q: 'Difference between a login and a user?', a: 'A login is a server-level principal used to connect to the SQL Server instance. A user is a database-level principal mapped to a login (by SID) that gives access to a specific database.', level: 'Easy' },
    { q: 'Windows authentication vs SQL Server authentication?', a: 'Windows authentication uses Windows/AD accounts verified by Windows (no passwords in SQL Server, central policy, Kerberos). SQL authentication stores a login name and password hash in SQL Server; it requires Mixed Mode.', level: 'Easy' },
    { q: 'What is the difference between GRANT, DENY and REVOKE?', a: 'GRANT allows a permission, DENY explicitly prohibits it and overrides grants from other roles, REVOKE removes an existing GRANT or DENY.', level: 'Easy' },
    { q: 'If a user is in a role that has GRANT SELECT and another role that has DENY SELECT, can they read?', a: 'No. DENY takes precedence over GRANT (unless the user is sysadmin/db_owner-level owner who bypasses permission checks).', level: 'Medium' },
    { q: 'Name some fixed database roles.', a: 'db_owner, db_datareader, db_datawriter, db_ddladmin, db_securityadmin, db_accessadmin, db_backupoperator, db_denydatareader, db_denydatawriter, plus public.', level: 'Easy' },
    { q: 'What is the principle of least privilege?', a: 'Give every account only the permissions required for its task. For example an application login gets data access and EXECUTE but not db_owner or sysadmin, limiting damage from bugs or attacks.', level: 'Easy' },
    { q: 'What is an orphaned user and how do you fix it?', a: 'A database user whose SID does not match any login on the server, usually after restoring a database elsewhere. Fix with ALTER USER name WITH LOGIN = loginName (or create the login with the same SID).', level: 'Hard' },
    { q: 'How does EXECUTE AS help with security testing?', a: 'EXECUTE AS USER/LOGIN temporarily runs statements under another principal\'s permissions so you can verify grants and denies; REVERT returns to the original context.', level: 'Medium' },
    { q: 'How can you hide a column from some users?', a: 'Column-level DENY/GRANT, a view without the column, Dynamic Data Masking, or Always Encrypted for strong protection.', level: 'Medium' },
    { q: 'What is ownership chaining?', a: 'When a view or procedure and the objects it references have the same owner, SQL Server checks permission only on the view/procedure, not on the underlying tables. This allows granting access through views and procedures only.', level: 'Hard' },
    { q: 'How should an ASP.NET Core app store its connection string?', a: 'Not in source control. Use User Secrets in development and environment variables, Azure Key Vault or Managed Identity in production; use a least-privilege login and Encrypt=True.', level: 'Medium' },
    { q: 'What is the difference between TDE and Always Encrypted?', a: 'TDE encrypts data and log files and backups at rest transparently (the server can still read data). Always Encrypted encrypts selected columns on the client side so even DBAs and the server never see plaintext.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a login report_user and a user in ShopDB that can only SELECT from the views vw_SalesSummary and vw_ProductList.',
      hint: 'CREATE LOGIN, CREATE USER FOR LOGIN, CREATE ROLE ReportViewer, GRANT SELECT ON each view.',
      solution: `USE master;
CREATE LOGIN report_user WITH PASSWORD = N'Rep#Str0ng2026', CHECK_POLICY = ON;
GO
USE ShopDB;
CREATE USER report_user FOR LOGIN report_user;
CREATE ROLE ReportViewer;
GRANT SELECT ON dbo.vw_SalesSummary TO ReportViewer;
GRANT SELECT ON dbo.vw_ProductList TO ReportViewer;
ALTER ROLE ReportViewer ADD MEMBER report_user;`,
    },
    {
      task: 'Allow the role OrderEntry to insert orders only through the stored procedure dbo.usp_PlaceOrder, not by writing to the Orders table directly.',
      hint: 'GRANT EXECUTE on the procedure only; ownership chaining lets the procedure insert.',
      solution: `CREATE ROLE OrderEntry;
GRANT EXECUTE ON dbo.usp_PlaceOrder TO OrderEntry;
-- no INSERT permission on dbo.Orders:
-- EXEC dbo.usp_PlaceOrder ...   works
-- INSERT INTO dbo.Orders ...    fails with Msg 229`,
    },
    {
      task: 'List every member of every database role in the current database.',
      hint: 'Join sys.database_role_members with sys.database_principals twice.',
      solution: `SELECT r.name AS RoleName, m.name AS MemberName
FROM sys.database_role_members rm
JOIN sys.database_principals r ON r.principal_id = rm.role_principal_id
JOIN sys.database_principals m ON m.principal_id = rm.member_principal_id
ORDER BY r.name, m.name;`,
    },
    {
      task: 'Add Dynamic Data Masking to the Email column of Employees so that only users with UNMASK see the full email.',
      hint: 'ALTER TABLE ... ALTER COLUMN Email ADD MASKED WITH (FUNCTION = \'email()\').',
      solution: `ALTER TABLE dbo.Employees
ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');

GRANT UNMASK TO PayrollClerk;      -- these users see real values
-- others see e.g. aXXX@XXXX.com`,
    },
  ],
  quiz: [
    {
      question: 'Which object lets a person connect to the SQL Server instance?',
      options: ['Database user', 'Schema', 'Login', 'Database role'],
      answer: 2,
      explanation: 'Logins are server-level principals used for authentication.',
    },
    {
      question: 'A user has GRANT SELECT from role A and DENY SELECT from role B. Result?',
      options: ['SELECT is denied', 'SELECT is allowed', 'The first role added wins', 'An error when creating the roles'],
      answer: 0,
      explanation: 'DENY overrides GRANT.',
    },
    {
      question: 'Which fixed database role allows reading all tables?',
      options: ['db_owner only', 'db_ddladmin', 'db_datawriter', 'db_datareader'],
      answer: 3,
      explanation: 'db_datareader grants SELECT on all user tables and views.',
    },
    {
      question: 'Which statement removes a previously granted permission?',
      options: ['DENY', 'REVOKE', 'DROP PERMISSION', 'REVERT'],
      answer: 1,
      explanation: 'REVOKE removes a GRANT or DENY. REVERT ends an EXECUTE AS context.',
    },
    {
      question: 'Which login should a production Web API use?',
      options: ['sa', 'A member of sysadmin', 'A dedicated login with only the data permissions it needs', 'The developer\'s Windows account'],
      answer: 2,
      explanation: 'Least privilege limits the damage from bugs and attacks such as SQL injection.',
    },
  ],
};
