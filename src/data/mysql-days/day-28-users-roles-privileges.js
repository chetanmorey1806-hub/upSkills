export default {
  "id": "mysql-day-28",
  "title": "Users, Roles and Privileges: CREATE USER, GRANT, REVOKE",
  "module": "Module 6: Design, Administration & Project",
  "day": 28,
  "level": "Advanced",
  "duration": "2 hours",
  "summary": "Secure a MySQL server: accounts as user@host, CREATE/ALTER/DROP USER, password and lock options, GRANT at global, database, table, column and routine level, REVOKE, SHOW GRANTS, MySQL 8 roles, the Workbench Users and Privileges screen tab by tab, and using views to hide sensitive columns and rows.",
  "objectives": [
    "Create, modify, lock and drop MySQL accounts",
    "Grant and revoke privileges at the correct level following least privilege",
    "Use roles to manage privileges for groups of users",
    "Manage accounts with the Workbench Users and Privileges screen",
    "Restrict access to sensitive data with column grants and views"
  ],
  "theory": [
    {
      "heading": "1. Why users and privileges?",
      "content": "Nobody should use root for daily work. MySQL security is based on ACCOUNTS (who can connect, and from where) and PRIVILEGES (what each account can do on which objects). The principle of least privilege: give every user or application only the rights it really needs.",
      "points": [
        "An account is 'user'@'host': 'app'@'localhost' and 'app'@'%' are two DIFFERENT accounts.",
        "Host part: 'localhost' (same machine), '192.168.1.%' (a subnet), '%' (any host - use carefully).",
        "Authentication: MySQL 8 uses the caching_sha2_password plugin by default; very old clients may need mysql_native_password.",
        "Account information is stored in the mysql system schema (mysql.user, mysql.db, mysql.tables_priv ...). Never edit those tables directly - use CREATE USER / GRANT.",
        "Typical accounts: root (DBA only), app_user (the application: SELECT/INSERT/UPDATE/DELETE on one schema), report_user (read-only), backup_user (SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER)."
      ]
    },
    {
      "heading": "2. CREATE USER, ALTER USER, DROP USER",
      "content": "Account management statements.",
      "syntax": "CREATE USER 'report_user'@'localhost' IDENTIFIED BY 'Rep0rt#2025';\nCREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'App#Strong9'\n       PASSWORD EXPIRE INTERVAL 90 DAY\n       FAILED_LOGIN_ATTEMPTS 5 PASSWORD_LOCK_TIME 1;\n\nALTER USER 'report_user'@'localhost' IDENTIFIED BY 'N3w#Pass2025';   -- change password\nALTER USER 'report_user'@'localhost' ACCOUNT LOCK;                   -- disable login\nALTER USER 'report_user'@'localhost' ACCOUNT UNLOCK;\nALTER USER 'report_user'@'localhost' PASSWORD EXPIRE;                -- must change at next login\nRENAME USER 'report_user'@'localhost' TO 'reports'@'localhost';\nDROP USER IF EXISTS 'reports'@'localhost';\n\nSELECT user, host, account_locked FROM mysql.user;                   -- list accounts\nSELECT CURRENT_USER(), USER();",
      "points": [
        "A new user has NO privileges except USAGE (= can log in, nothing else).",
        "The validate_password component may reject weak passwords (Error 1819: Your password does not satisfy the current policy requirements).",
        "DROP USER also removes all privileges of the account. Objects created by the user (tables) are not dropped.",
        "CREATE USER, GRANT and REVOKE are not supported in the browser Workbench Lab - practise them in real MySQL Workbench."
      ]
    },
    {
      "heading": "3. GRANT: privilege levels",
      "content": "GRANT gives privileges at different levels: global (*.*), database (college.*), table (college.students), column (SELECT (col1, col2) ON table), and routine (EXECUTE ON PROCEDURE).",
      "syntax": "GRANT SELECT ON college.* TO 'report_user'@'localhost';                       -- database level\nGRANT SELECT, INSERT, UPDATE, DELETE ON college.* TO 'app_user'@'%';\nGRANT SELECT (student_id, first_name, city) ON college.students TO 'intern'@'localhost';  -- column level\nGRANT EXECUTE ON PROCEDURE college.enroll_student TO 'app_user'@'%';           -- routine\nGRANT ALL PRIVILEGES ON college.* TO 'dba_college'@'localhost' WITH GRANT OPTION;\nSHOW GRANTS FOR 'report_user'@'localhost';\nSHOW GRANTS;                                    -- for the current user",
      "points": [
        "Common privileges: SELECT, INSERT, UPDATE, DELETE (data); CREATE, ALTER, DROP, INDEX, CREATE VIEW, SHOW VIEW, TRIGGER, REFERENCES (structure); EXECUTE, CREATE ROUTINE, ALTER ROUTINE (routines); PROCESS, RELOAD, SHUTDOWN, SUPER/dynamic privileges (admin).",
        "WITH GRANT OPTION lets the user pass their privileges to others - give it rarely.",
        "GRANT ... TO a non-existing user fails in MySQL 8 (Error 1410) - CREATE USER first.",
        "Privilege changes made with GRANT/REVOKE take effect immediately; FLUSH PRIVILEGES is only needed after editing the grant tables directly.",
        "Already connected sessions keep their current database-level privileges until they reconnect / change database."
      ]
    },
    {
      "heading": "4. REVOKE",
      "content": "REVOKE removes privileges. Its syntax mirrors GRANT with FROM instead of TO.",
      "syntax": "REVOKE DELETE ON college.* FROM 'app_user'@'%';\nREVOKE ALL PRIVILEGES, GRANT OPTION FROM 'intern'@'localhost';\nSHOW GRANTS FOR 'app_user'@'%';",
      "points": [
        "You can only revoke at the level where the privilege was granted: if SELECT was granted on college.*, REVOKE SELECT ON college.students fails (Error 1147 There is no such grant defined).",
        "Revoking every privilege still leaves the account able to log in (USAGE). Use ACCOUNT LOCK or DROP USER to stop logins."
      ]
    },
    {
      "heading": "5. Roles (MySQL 8)",
      "content": "A role is a named collection of privileges. Grant privileges to the role once, then grant the role to many users - easier to manage than per-user grants.",
      "syntax": "CREATE ROLE 'college_read', 'college_write';\nGRANT SELECT ON college.* TO 'college_read';\nGRANT INSERT, UPDATE, DELETE ON college.* TO 'college_write';\n\nGRANT 'college_read' TO 'report_user'@'localhost';\nGRANT 'college_read', 'college_write' TO 'app_user'@'%';\n\nSET DEFAULT ROLE ALL TO 'report_user'@'localhost', 'app_user'@'%';   -- activate at login\n-- inside a session:  SET ROLE 'college_read';   SELECT CURRENT_ROLE();\nSHOW GRANTS FOR 'app_user'@'%' USING 'college_read', 'college_write';\nREVOKE 'college_write' FROM 'app_user'@'%';\nDROP ROLE 'college_write';",
      "points": [
        "Roles are not active automatically: use SET DEFAULT ROLE (or set the activate_all_roles_on_login variable).",
        "A role is stored like an account without login (locked, no password).",
        "mandatory_roles can be configured so every user gets a role automatically."
      ]
    },
    {
      "heading": "6. Workbench: Administration > Users and Privileges",
      "content": "Workbench offers a GUI for all of the above.",
      "points": [
        "Navigator > Administration tab (or Server > Users and Privileges). Log in as root; the screen lists all User/From Host accounts.",
        "Add Account: Login tab - Login Name, Authentication Type (caching_sha2_password), Limit to Hosts Matching (localhost or %), Password and Confirm Password, Expire Password button.",
        "Account Limits tab - Max. Queries, Max. Updates, Max. Connections per hour, Concurrent Connections (0 = unlimited).",
        "Administrative Roles tab - tick predefined server-level roles such as DBA, MaintenanceAdmin, ProcessAdmin, UserAdmin, SecurityAdmin, MonitorAdmin, DBManager, DBDesigner, ReplicationAdmin, BackupAdmin; the Global Privileges list on the right shows exactly which privileges are ticked.",
        "Schema Privileges tab - Add Entry... > Selected schema: college > OK; then tick Object Rights (SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW), DDL Rights (CREATE, ALTER, REFERENCES, INDEX, CREATE VIEW, CREATE ROUTINE, ALTER ROUTINE, EVENT, DROP, TRIGGER) and Other Rights (GRANT OPTION, CREATE TEMPORARY TABLES, LOCK TABLES). Buttons 'Select ALL' / 'Unselect ALL'.",
        "Click Apply - Workbench runs CREATE USER and GRANT statements (visible in the Output panel / Server Logs). Revert discards changes; Delete removes the account; Expire Password forces a reset.",
        "Test: Home screen > (+) new connection with the new user name > Test Connection, then try a forbidden statement to see the access-denied error."
      ],
      "tip": "Typical access errors: 1045 Access denied for user (wrong password/host), 1142 SELECT/INSERT command denied to user ... for table ..., 1044 Access denied for user ... to database ..., 1227 Access denied; you need (at least one of) the ... privilege(s)."
    }
  ],
  "examples": [
    {
      "title": "Create a read-only reporting user",
      "scenario": "The accounts team needs a user that can only read the college database from the local machine.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection as root",
        "File > New Query Tab",
        "Type the statements and run them one by one with Ctrl+Enter",
        "Check the Output panel: each statement shows 0 row(s) affected",
        "SHOW GRANTS displays the privileges in the Result Grid"
      ],
      "code": "CREATE USER 'report_user'@'localhost' IDENTIFIED BY 'Rep0rt#2025';\nGRANT SELECT ON college.* TO 'report_user'@'localhost';\nSHOW GRANTS FOR 'report_user'@'localhost';\n\nSELECT user, host, plugin, account_locked\nFROM mysql.user\nWHERE user = 'report_user';",
      "result": "CREATE USER ... 0 row(s) affected\nGRANT SELECT ... 0 row(s) affected\n\n+-------------------------------------------------------------+\n| Grants for report_user@localhost                            |\n+-------------------------------------------------------------+\n| GRANT USAGE ON *.* TO `report_user`@`localhost`             |\n| GRANT SELECT ON `college`.* TO `report_user`@`localhost`    |\n+-------------------------------------------------------------+\n\n+-------------+-----------+-----------------------+----------------+\n| user        | host      | plugin                | account_locked |\n+-------------+-----------+-----------------------+----------------+\n| report_user | localhost | caching_sha2_password | N              |\n+-------------+-----------+-----------------------+----------------+",
      "explanation": "CREATE USER creates the account with only USAGE (log-in) rights. GRANT SELECT ON college.* adds read access to every current and future table/view of college. SHOW GRANTS always lists the USAGE line first. The account uses MySQL 8's default caching_sha2_password plugin."
    },
    {
      "title": "Test the privileges: allowed and denied statements",
      "scenario": "Log in as report_user and check what works and what is blocked.",
      "steps": [
        "Home screen > click (+) next to MySQL Connections",
        "Connection Name: college_report, Username: report_user, Hostname 127.0.0.1, Port 3306 > Test Connection > enter Rep0rt#2025 > OK",
        "Open the new connection; in the Navigator only the college schema is visible",
        "Run the statements one at a time (Ctrl+Enter) and read the Output panel"
      ],
      "code": "USE college;\nSELECT COUNT(*) AS students FROM students;     -- works\nUPDATE students SET fees = 0 WHERE student_id = 1;   -- denied\nCREATE TABLE test (id INT);                    -- denied\nUSE mysql;                                     -- denied\nSELECT CURRENT_USER();",
      "result": "SELECT COUNT(*) ...           -> 10 (1 row returned)\nUPDATE students ...          -> Error Code: 1142. UPDATE command denied to user 'report_user'@'localhost' for table 'students'\nCREATE TABLE test ...        -> Error Code: 1142. CREATE command denied to user 'report_user'@'localhost' for table 'test'\nUSE mysql                    -> Error Code: 1044. Access denied for user 'report_user'@'localhost' to database 'mysql'\nSELECT CURRENT_USER()        -> report_user@localhost",
      "explanation": "SELECT succeeds because of GRANT SELECT. UPDATE is refused with Error 1142 (command denied for table), CREATE with 1142 as well, and switching to another database with 1044. CURRENT_USER() shows the account MySQL matched (user@host from the grant tables), which can differ from USER() (what the client sent)."
    },
    {
      "title": "Application user with REVOKE, password and lock management",
      "scenario": "Create the application account, give it CRUD rights, then remove DELETE (soft-deletes only), change its password, and temporarily lock it during maintenance.",
      "steps": [
        "Connect as root, File > New Query Tab",
        "Type the script",
        "Run statement by statement with Ctrl+Enter",
        "Use SHOW GRANTS after each change"
      ],
      "code": "CREATE USER 'app_user'@'%' IDENTIFIED BY 'App#Strong9';\nGRANT SELECT, INSERT, UPDATE, DELETE ON college.* TO 'app_user'@'%';\nREVOKE DELETE ON college.* FROM 'app_user'@'%';\nSHOW GRANTS FOR 'app_user'@'%';\n\nALTER USER 'app_user'@'%' IDENTIFIED BY 'App#Rotated10';   -- password rotation\nALTER USER 'app_user'@'%' ACCOUNT LOCK;                    -- maintenance window\nALTER USER 'app_user'@'%' ACCOUNT UNLOCK;\n\n-- Column-level grant for an intern: no access to fees or email\nCREATE USER 'intern'@'localhost' IDENTIFIED BY 'Intern#2025';\nGRANT SELECT (student_id, first_name, city, marks) ON college.students TO 'intern'@'localhost';\nSHOW GRANTS FOR 'intern'@'localhost';",
      "result": "+---------------------------------------------------------------------+\n| Grants for app_user@%                                               |\n+---------------------------------------------------------------------+\n| GRANT USAGE ON *.* TO `app_user`@`%`                                |\n| GRANT SELECT, INSERT, UPDATE ON `college`.* TO `app_user`@`%`       |\n+---------------------------------------------------------------------+\n\n+--------------------------------------------------------------------------------------------------------------+\n| Grants for intern@localhost                                                                                  |\n+--------------------------------------------------------------------------------------------------------------+\n| GRANT USAGE ON *.* TO `intern`@`localhost`                                                                   |\n| GRANT SELECT (`city`, `first_name`, `marks`, `student_id`) ON `college`.`students` TO `intern`@`localhost`   |\n+--------------------------------------------------------------------------------------------------------------+",
      "explanation": "REVOKE removes exactly the DELETE privilege at the level it was granted. While the account is locked, login attempts fail with Error 3118 (Access denied ... Account is locked). The intern can run SELECT student_id, first_name FROM students but SELECT * or SELECT fees fails with Error 1143 (SELECT command denied ... for column 'email')."
    },
    {
      "title": "Roles: manage privileges for groups of users",
      "scenario": "Create two roles, college_read and college_write, give them to users, and activate them by default.",
      "steps": [
        "Connect as root, File > New Query Tab",
        "Type and run the script (Ctrl+Shift+Enter)",
        "Log in as app_user and run SELECT CURRENT_ROLE();"
      ],
      "code": "CREATE ROLE IF NOT EXISTS 'college_read', 'college_write';\nGRANT SELECT ON college.* TO 'college_read';\nGRANT INSERT, UPDATE, DELETE ON college.* TO 'college_write';\n\nGRANT 'college_read' TO 'report_user'@'localhost';\nGRANT 'college_read', 'college_write' TO 'app_user'@'%';\nSET DEFAULT ROLE ALL TO 'report_user'@'localhost', 'app_user'@'%';\n\nSHOW GRANTS FOR 'app_user'@'%' USING 'college_read', 'college_write';\n-- as app_user:\nSELECT CURRENT_ROLE();",
      "result": "+---------------------------------------------------------------------------+\n| Grants for app_user@%                                                     |\n+---------------------------------------------------------------------------+\n| GRANT USAGE ON *.* TO `app_user`@`%`                                      |\n| GRANT SELECT, INSERT, UPDATE, DELETE ON `college`.* TO `app_user`@`%`     |\n| GRANT `college_read`@`%`,`college_write`@`%` TO `app_user`@`%`            |\n+---------------------------------------------------------------------------+\n\nCURRENT_ROLE(): `college_read`@`%`,`college_write`@`%`",
      "explanation": "Privileges are granted once to each role; users receive roles. SET DEFAULT ROLE ALL makes the roles active automatically at login, otherwise the user would have to run SET ROLE first. SHOW GRANTS ... USING expands the privileges the roles provide. Adding a new developer is now one GRANT role statement."
    },
    {
      "title": "Create a user with the Users and Privileges screen",
      "scenario": "Do the same as Example 1 without SQL: create 'clerk'@'localhost' who can read and insert into the college schema.",
      "steps": [
        "Connect as root; in the Navigator click the Administration tab > Users and Privileges (or Server > Users and Privileges)",
        "Click Add Account (bottom left)",
        "Login tab: Login Name = clerk, Authentication Type = caching_sha2_password, Limit to Hosts Matching = localhost, Password = Cl3rk#2025, Confirm Password",
        "Account Limits tab: Max. Connections = 10 (optional)",
        "Administrative Roles tab: leave everything unticked (no server-wide rights)",
        "Schema Privileges tab: Add Entry... > Selected schema = college > OK; tick SELECT and INSERT",
        "Click Apply; the account appears in the User Accounts list",
        "Verify in a query tab: SHOW GRANTS FOR 'clerk'@'localhost';"
      ],
      "code": "-- SQL that Workbench executes when you click Apply:\nCREATE USER 'clerk'@'localhost' IDENTIFIED WITH caching_sha2_password BY '********';\nALTER USER 'clerk'@'localhost' WITH MAX_USER_CONNECTIONS 10;\nGRANT SELECT, INSERT ON college.* TO 'clerk'@'localhost';\n\nSHOW GRANTS FOR 'clerk'@'localhost';",
      "result": "+--------------------------------------------------------------+\n| Grants for clerk@localhost                                   |\n+--------------------------------------------------------------+\n| GRANT USAGE ON *.* TO `clerk`@`localhost`                    |\n| GRANT SELECT, INSERT ON `college`.* TO `clerk`@`localhost`   |\n+--------------------------------------------------------------+",
      "explanation": "The GUI is a front-end to CREATE USER / GRANT. Global privileges come from the Administrative Roles tab (for example ticking DBA gives ALL PRIVILEGES ON *.* WITH GRANT OPTION - never for normal users), while the Schema Privileges tab produces database-level grants."
    },
    {
      "title": "Row/column security with a view (runs in the Lab)",
      "scenario": "The placement cell may see student names, cities and marks of students with 60+ marks, but never fees, emails or dates of birth. Create a view that exposes only that data; in real MySQL you then GRANT SELECT on the view only.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "In real MySQL also run: GRANT SELECT ON college.placement_view TO 'placement'@'localhost';"
      ],
      "code": "CREATE VIEW placement_view AS\nSELECT student_id, CONCAT(first_name, ' ', last_name) AS name, city, marks\nFROM students\nWHERE marks >= 60;\n\n-- real MySQL only:\n-- CREATE USER 'placement'@'localhost' IDENTIFIED BY 'Pl@cement2025';\n-- GRANT SELECT ON college.placement_view TO 'placement'@'localhost';\n\nSELECT * FROM placement_view ORDER BY marks DESC;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nDROP VIEW IF EXISTS placement_view;\nCREATE VIEW placement_view AS\nSELECT student_id, CONCAT(first_name, ' ', last_name) AS name, city, marks\nFROM students\nWHERE marks >= 60;\nSELECT * FROM placement_view ORDER BY marks DESC;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> DROP VIEW IF EXISTS placement_view -> 0 row(s) affected\n>> CREATE VIEW placement_view AS -> 0 row(s) affected\n>> SELECT * FROM placement_view ORDER BY marks DESC\n+------------+--------------+---------+-------+\n| student_id | name         | city    | marks |\n+------------+--------------+---------+-------+\n| 6          | Meera Nair   | Kochi   | 95    |\n| 2          | Diya Patel   | Mumbai  | 92    |\n| 1          | Aarav Sharma | Pune    | 88    |\n| 10         | Priya Das    | Kolkata | 85    |\n| 4          | Ananya Iyer  | Chennai | 81    |\n| 3          | Rohan Verma  | Delhi   | 75    |\n| 9          | Arjun Mehta  | NULL    | 70    |\n| 5          | Kabir Singh  | Delhi   | 64    |\n+------------+--------------+---------+-------+\n8 row(s) returned",
      "explanation": "A view combined with a grant on the view (and NO grant on the base table) is the classic MySQL way to hide columns (fees, email) and rows (marks below 60): the view returns 8 of the 10 students - Sneha (58) and Vikram (NULL marks) are filtered out. Users with SELECT on placement_view can query it, but SELECT * FROM students fails for them with Error 1142."
    }
  ],
  "interview": [
    {
      "q": "How is a MySQL account identified?",
      "a": "By user name AND host: 'user'@'host'. 'app'@'localhost' and 'app'@'%' are different accounts with separate passwords and privileges.",
      "level": "Beginner"
    },
    {
      "q": "What privileges does a newly created user have?",
      "a": "Only USAGE - they can connect but cannot read or change anything until privileges are granted.",
      "level": "Beginner"
    },
    {
      "q": "What are the privilege levels in MySQL?",
      "a": "Global (*.*), database (db.*), table (db.table), column (privilege (col) ON db.table), routine (EXECUTE ON PROCEDURE db.proc) and proxy.",
      "level": "Intermediate"
    },
    {
      "q": "What does WITH GRANT OPTION do?",
      "a": "Allows the grantee to grant the same privileges to other users. It should be given rarely.",
      "level": "Beginner"
    },
    {
      "q": "Do you need FLUSH PRIVILEGES after GRANT?",
      "a": "No. GRANT, REVOKE, CREATE USER etc. reload privileges automatically. FLUSH PRIVILEGES is needed only after modifying the grant tables directly with INSERT/UPDATE.",
      "level": "Intermediate"
    },
    {
      "q": "What are roles in MySQL 8?",
      "a": "Named collections of privileges. Grant privileges to roles and roles to users; activate them with SET ROLE or SET DEFAULT ROLE.",
      "level": "Beginner"
    },
    {
      "q": "How do you see a user's privileges?",
      "a": "SHOW GRANTS FOR 'user'@'host'; (add USING role to expand role privileges).",
      "level": "Beginner"
    },
    {
      "q": "How do you stop a user from logging in without deleting them?",
      "a": "ALTER USER 'u'@'h' ACCOUNT LOCK; - unlock later with ACCOUNT UNLOCK.",
      "level": "Beginner"
    },
    {
      "q": "How would you hide sensitive columns from some users?",
      "a": "Column-level GRANT SELECT (col1, col2) or create a view exposing only allowed columns/rows and grant SELECT on the view only.",
      "level": "Intermediate"
    },
    {
      "q": "What is the principle of least privilege?",
      "a": "Give each account only the minimal privileges required for its job; e.g. application users get CRUD on one schema, not ALL or global privileges.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between USER() and CURRENT_USER()?",
      "a": "USER() returns the user and host the client connected with; CURRENT_USER() returns the account MySQL actually authenticated (which may be a wildcard host or a proxy).",
      "level": "Advanced"
    },
    {
      "q": "Why might a user get 'Access denied' (1045) even with the right password?",
      "a": "They are connecting from a host that does not match the account's host part (e.g. account is 'u'@'localhost' but client connects via 127.0.0.1 or a remote IP), or an anonymous account matches first.",
      "level": "Advanced"
    }
  ],
  "practice": [
    {
      "task": "Create a user 'teacher'@'localhost' who can read all college tables and update only the marks column of students.",
      "hint": "Database-level SELECT plus column-level UPDATE (marks).",
      "solution": "CREATE USER 'teacher'@'localhost' IDENTIFIED BY 'T3acher#2025';\nGRANT SELECT ON college.* TO 'teacher'@'localhost';\nGRANT UPDATE (marks) ON college.students TO 'teacher'@'localhost';\nSHOW GRANTS FOR 'teacher'@'localhost';"
    },
    {
      "task": "Create a role 'ecom_analyst' with SELECT on the ecommerce schema and give it to two users.",
      "hint": "CREATE ROLE, GRANT, SET DEFAULT ROLE.",
      "solution": "CREATE ROLE 'ecom_analyst';\nGRANT SELECT ON ecommerce.* TO 'ecom_analyst';\nCREATE USER 'asha'@'localhost' IDENTIFIED BY 'Asha#2025', 'ravi'@'localhost' IDENTIFIED BY 'Ravi#2025';\nGRANT 'ecom_analyst' TO 'asha'@'localhost', 'ravi'@'localhost';\nSET DEFAULT ROLE 'ecom_analyst' TO 'asha'@'localhost', 'ravi'@'localhost';"
    },
    {
      "task": "Remove INSERT from 'clerk'@'localhost' and force a password change at next login.",
      "hint": "REVOKE ... FROM; ALTER USER ... PASSWORD EXPIRE.",
      "solution": "REVOKE INSERT ON college.* FROM 'clerk'@'localhost';\nALTER USER 'clerk'@'localhost' PASSWORD EXPIRE;"
    },
    {
      "task": "Create a backup user that can run mysqldump of all databases.",
      "hint": "mysqldump needs SELECT, SHOW VIEW, TRIGGER, LOCK TABLES, EVENT, PROCESS (and RELOAD for --flush-logs).",
      "solution": "CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'B@ckup#2025';\nGRANT SELECT, SHOW VIEW, TRIGGER, LOCK TABLES, EVENT, PROCESS, RELOAD ON *.* TO 'backup_user'@'localhost';"
    },
    {
      "task": "List all accounts, their host and whether they are locked; then drop the intern account.",
      "hint": "mysql.user table; DROP USER IF EXISTS.",
      "solution": "SELECT user, host, account_locked FROM mysql.user ORDER BY user;\nDROP USER IF EXISTS 'intern'@'localhost';"
    }
  ],
  "quiz": [
    {
      "question": "Which statement gives read-only access to every table in the college database?",
      "options": [
        "GRANT SELECT ON college.* TO 'u'@'localhost'",
        "GRANT READ ON college TO u",
        "GRANT SELECT ON *.* TO 'u'",
        "ALTER USER u READONLY"
      ],
      "answer": 0,
      "explanation": "db.* is the database level; *.* would be every database on the server."
    },
    {
      "question": "'app'@'localhost' and 'app'@'%' are:",
      "options": [
        "The same account",
        "Invalid syntax",
        "Two different accounts",
        "A user and a role"
      ],
      "answer": 2,
      "explanation": "An account is user + host."
    },
    {
      "question": "Which statement removes a privilege?",
      "options": [
        "DELETE GRANT",
        "REVOKE",
        "DROP PRIVILEGE",
        "DENY"
      ],
      "answer": 1,
      "explanation": "REVOKE priv ON level FROM account. DENY exists in SQL Server, not MySQL."
    },
    {
      "question": "After GRANT 'college_read' TO 'u'@'h', the role is active at login only if:",
      "options": [
        "Always",
        "FLUSH PRIVILEGES is run",
        "The server restarts",
        "SET DEFAULT ROLE was run (or activate_all_roles_on_login is ON)"
      ],
      "answer": 3,
      "explanation": "Roles must be activated with SET ROLE or SET DEFAULT ROLE."
    },
    {
      "question": "In Workbench, where do you create users with a GUI?",
      "options": [
        "Database > Users",
        "File > New User",
        "Administration > Users and Privileges",
        "Model > Users"
      ],
      "answer": 2,
      "explanation": "Navigator Administration tab (or Server menu) > Users and Privileges."
    }
  ]
};
