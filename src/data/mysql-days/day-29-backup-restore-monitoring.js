export default {
  "id": "mysql-day-29",
  "title": "Backup and Restore: Data Export/Import, mysqldump, Server Status and Performance Dashboard",
  "module": "Module 6: Design, Administration & Project",
  "day": 29,
  "level": "Advanced",
  "duration": "2 hours",
  "summary": "Protect your data: logical vs physical, full vs incremental backups, Workbench Server > Data Export and Data Import screen by screen, mysqldump and mysql restore commands, scheduled and compressed backups, binary logs and point-in-time recovery, quick safety copies inside the database, and monitoring the server with Server Status, Client Connections and the Performance Dashboard.",
  "objectives": [
    "Explain backup types and choose a backup strategy",
    "Back up and restore databases with Workbench Data Export and Data Import",
    "Use mysqldump and the mysql client for scripted backups and restores",
    "Describe point-in-time recovery with binary logs",
    "Monitor server health with Server Status and the Performance Dashboard"
  ],
  "theory": [
    {
      "heading": "1. Why backups, and types of backup",
      "content": "Hardware fails, people run DELETE without WHERE, ransomware encrypts disks. A backup is a copy of the data from which you can RESTORE. A backup you have never restored is only a hope - test restores regularly.",
      "points": [
        "Logical backup: SQL statements (CREATE TABLE + INSERT) or CSV produced by mysqldump, mysqlpump, MySQL Shell dump utilities or Workbench Data Export. Portable across versions/platforms, human-readable, slower for big databases.",
        "Physical backup: copy of the data files (MySQL Enterprise Backup, Percona XtraBackup, file-system snapshots with the server stopped/locked). Fast for large databases, same MySQL version/platform.",
        "Full backup: everything. Incremental/differential: only changes since the last backup - in MySQL usually achieved with binary logs.",
        "Point-in-time recovery (PITR): restore the last full backup, then replay the binary log (mysqlbinlog) up to just before the mistake.",
        "Hot (online) vs cold (offline): mysqldump --single-transaction gives a consistent hot backup of InnoDB tables without blocking writes.",
        "3-2-1 rule: 3 copies, on 2 different media, 1 off-site."
      ]
    },
    {
      "heading": "2. Workbench Data Export (Server > Data Export)",
      "content": "Workbench's Data Export screen is a graphical front-end to mysqldump.",
      "points": [
        "Server > Data Export (or Navigator > Administration > Data Export).",
        "Tables to Export: tick schemas on the left (college) and tables on the right; the drop-down below offers Dump Structure and Data / Dump Data Only / Dump Structure Only.",
        "Objects to Export: tick Dump Stored Procedures and Functions, Dump Events, Dump Triggers.",
        "Export Options: 'Export to Dump Project Folder' (one .sql file per table - can restore selected tables) or 'Export to Self-Contained File' (one .sql file). Options: Create Dump in a Single Transaction (self-contained file only), Include Create Schema.",
        "Advanced Options... exposes mysqldump flags (single-transaction, routines, add-drop-table, complete-insert, extended-insert...).",
        "Click Start Export. The Export Progress tab shows the mysqldump command and a log; the status line says 'Export of ... has finished'.",
        "Common issue: 'mysqldump Version Mismatch' - set Edit > Preferences > Administration > Path to mysqldump Tool to the server version's mysqldump."
      ]
    },
    {
      "heading": "3. Workbench Data Import/Restore (Server > Data Import)",
      "content": "The import screen runs a dump file (or a dump folder) against the server.",
      "points": [
        "Server > Data Import.",
        "Import Options: 'Import from Dump Project Folder' (choose the folder, click Load Folder Contents, then pick schemas/tables) or 'Import from Self-Contained File' (choose the .sql file).",
        "Default Target Schema: choose an existing schema or click New... to create one (e.g. college_restore) - used when the dump does not contain CREATE DATABASE/USE.",
        "Choose Dump Structure and Data / Data Only / Structure Only.",
        "Click Start Import; the Import Progress tab shows the log ('Import of ... has finished'). Refresh SCHEMAS in the Navigator.",
        "Restoring into a different schema name is a safe way to test a backup or to recover a single table without touching production."
      ]
    },
    {
      "heading": "4. mysqldump and restore from the command line",
      "content": "mysqldump is the standard logical backup tool, used in scripts and cron jobs.",
      "syntax": "# one database (structure + data + routines + triggers + events), consistent snapshot\nmysqldump -u root -p --single-transaction --routines --triggers --events college > college_2025_03_14.sql\n\n# several databases / all databases (includes CREATE DATABASE + USE)\nmysqldump -u root -p --databases college ecommerce > two_dbs.sql\nmysqldump -u root -p --all-databases --single-transaction > full_server.sql\n\n# selected tables, structure only, data only, with WHERE\nmysqldump -u root -p college students departments > two_tables.sql\nmysqldump -u root -p --no-data college > college_schema.sql\nmysqldump -u root -p --no-create-info college > college_data.sql\nmysqldump -u root -p college students --where=\"admission_date >= '2023-01-01'\" > new_students.sql\n\n# compressed\nmysqldump -u root -p college | gzip > college.sql.gz\n\n# RESTORE\nmysql -u root -p -e \"CREATE DATABASE IF NOT EXISTS college_restore\"\nmysql -u root -p college_restore < college_2025_03_14.sql\ngunzip < college.sql.gz | mysql -u root -p college_restore\n# or inside the mysql client:  mysql> SOURCE /backups/college_2025_03_14.sql;",
      "points": [
        "Run these in a terminal / Command Prompt, not in the Workbench SQL editor. On Windows, mysqldump.exe is in C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin.",
        "--single-transaction: consistent snapshot of InnoDB without locking. --routines/--triggers/--events include stored programs (triggers are included by default).",
        "Never put the password on the command line in scripts (-pSecret is visible in process lists); use a ~/.my.cnf [client] section or mysql_config_editor.",
        "mysqldump is not supported in the browser Workbench Lab.",
        "MySQL Shell alternative for big databases: util.dumpSchemas(['college'], '/backups/college') and util.loadDump('/backups/college') - parallel and much faster."
      ]
    },
    {
      "heading": "5. Binary logs and point-in-time recovery (concept)",
      "content": "The binary log records every change (INSERT/UPDATE/DELETE/DDL) after it is committed. Together with a full backup it lets you recover to any moment.",
      "syntax": "SHOW BINARY LOGS;                     -- list binlog files\nSHOW MASTER STATUS;                    -- current file and position (SHOW BINARY LOG STATUS in 8.4)\nFLUSH BINARY LOGS;                     -- start a new binlog file\n\n# replay changes from the binlog up to just before the accident\nmysqlbinlog --stop-datetime=\"2025-03-14 11:59:00\" binlog.000042 | mysql -u root -p",
      "points": [
        "Steps for PITR: 1) restore the last full dump; 2) find the bad statement in the binlog (mysqlbinlog --base64-output=DECODE-ROWS -v); 3) replay the binlogs from the dump position up to just before it.",
        "mysqldump --source-data=2 (older: --master-data=2) writes the binlog position into the dump, so you know where to start the replay.",
        "Binary logging is ON by default in MySQL 8; binlog_expire_logs_seconds controls retention."
      ]
    },
    {
      "heading": "6. Server Status and Performance Dashboard in Workbench",
      "content": "Workbench's Administration section also helps you monitor the server - check it before and after backups and when something is slow.",
      "points": [
        "Navigator > Administration > Server Status: Running/Stopped, Uptime, Version, Connections, and graphs for CPU, connections, traffic, key efficiency, selects per second, InnoDB buffer usage and reads/writes; also lists enabled features (Performance Schema, binary log, SSL) and file locations (data directory, error log).",
        "Administration > Client Connections: list of sessions (like SHOW PROCESSLIST); right-click > Kill Query / Kill Connection.",
        "Administration > Startup / Shutdown (start/stop the server), Server Logs (error log, slow log), Options File (edit my.ini / my.cnf with a GUI).",
        "Performance > Dashboard: live graphs for Network Status (incoming/outgoing traffic, client connections), MySQL Status (table open cache efficiency, SQL statements executed: SELECT/INSERT/UPDATE/DELETE/CREATE/ALTER/DROP per second) and InnoDB Status (buffer pool usage, read requests, disk reads, redo log writes, doublewrite).",
        "Performance > Performance Reports: sys-schema reports such as Top I/O by File, High Cost SQL Statements, Statements Using Temp Tables, Unused Indexes - requires Performance Schema.",
        "SQL equivalents: SHOW GLOBAL STATUS LIKE 'Threads_connected'; SHOW GLOBAL STATUS LIKE 'Questions'; SHOW VARIABLES LIKE 'datadir'; SHOW PROCESSLIST;"
      ],
      "tip": "Lab note: SHOW STATUS / SHOW VARIABLES, mysqldump and the Administration screens need a real MySQL server and Workbench. The Lab example below practises the in-database 'safety copy' and restore pattern instead."
    }
  ],
  "examples": [
    {
      "title": "Back up the college database with Data Export",
      "scenario": "Before a big data change, create a full backup of the college schema (structure, data, routines, triggers) in a single file.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection as root",
        "Server > Data Export",
        "Object Selection tab > Tables to Export: tick college (all its tables are ticked on the right); below choose 'Dump Structure and Data'",
        "Objects to Export: tick Dump Stored Procedures and Functions, Dump Events, Dump Triggers",
        "Export Options: select 'Export to Self-Contained File' and set the path, e.g. C:\\backups\\college_2025_03_14.sql (Linux/macOS: ~/backups/college_2025_03_14.sql)",
        "Tick 'Create Dump in a Single Transaction (self-contained file only)' and 'Include Create Schema'",
        "Click Start Export and watch the Export Progress tab until it reports the export has finished"
      ],
      "code": "-- Equivalent command that Workbench runs (shown in the Export Progress log):\nmysqldump --host=127.0.0.1 --port=3306 --user=root --password\n          --single-transaction=TRUE --routines --events --triggers\n          --databases college > C:\\backups\\college_2025_03_14.sql",
      "result": "Export Progress:\nRunning: mysqldump.exe --defaults-file=\"...tmp...\" --host=127.0.0.1 --port=3306 --default-character-set=utf8 --user=root --protocol=tcp --single-transaction=TRUE --routines --events --triggers --databases \"college\"\nExport of C:\\backups\\college_2025_03_14.sql has finished\n\nStart of the file:\n-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)\n-- Host: 127.0.0.1    Database: college\nCREATE DATABASE /*!32312 IF NOT EXISTS*/ `college` /*!40100 DEFAULT CHARACTER SET utf8mb4 ... */;\nUSE `college`;\nDROP TABLE IF EXISTS `departments`;\nCREATE TABLE `departments` ( ... ) ENGINE=InnoDB ...;\nLOCK TABLES `departments` WRITE;\nINSERT INTO `departments` VALUES (1,'Computer Science','Block A'),(2,'Mathematics','Block B'),...;\nUNLOCK TABLES;",
      "explanation": "The self-contained file starts with CREATE DATABASE / USE (because Include Create Schema was ticked), then for every table DROP TABLE IF EXISTS, CREATE TABLE and multi-row INSERT statements, followed by routines and triggers. --single-transaction makes the copy consistent without locking InnoDB tables, so users can keep working during the export."
    },
    {
      "title": "Restore the backup into a new schema with Data Import",
      "scenario": "Test the backup (and recover data safely) by restoring it into a separate schema college_restore instead of overwriting college.",
      "steps": [
        "Open the backup .sql in a text editor and remove/rename the CREATE DATABASE and USE `college` lines (or export again WITHOUT 'Include Create Schema') so the target schema can be chosen",
        "Server > Data Import",
        "Import Options: select 'Import from Self-Contained File' and browse to college_2025_03_14.sql",
        "Default Target Schema: click New..., type college_restore, OK",
        "Choose 'Dump Structure and Data'",
        "Click Start Import; the Import Progress tab shows the log",
        "Navigator > SCHEMAS > refresh: college_restore appears; run the verification queries"
      ],
      "code": "-- Verify the restore by comparing row counts with the original\nSELECT 'college' AS db, COUNT(*) AS students FROM college.students\nUNION ALL\nSELECT 'college_restore', COUNT(*) FROM college_restore.students;\n\n-- Command-line equivalent of the import:\n-- mysql -u root -p -e \"CREATE DATABASE college_restore\"\n-- mysql -u root -p college_restore < college_2025_03_14.sql",
      "result": "Import Progress:\nRunning: mysql.exe --defaults-file=\"...tmp...\" --protocol=tcp --host=127.0.0.1 --user=root --port=3306 --default-character-set=utf8 --comments --database=college_restore < \"C:\\backups\\college_2025_03_14.sql\"\nImport of C:\\backups\\college_2025_03_14.sql has finished\n\n+-----------------+----------+\n| db              | students |\n+-----------------+----------+\n| college         | 10       |\n| college_restore | 10       |\n+-----------------+----------+",
      "explanation": "If the dump still contains USE `college`, the import would write into the ORIGINAL schema regardless of the Default Target Schema - check before restoring. Matching row counts (and a few spot checks) prove the backup is usable."
    },
    {
      "title": "Scheduled backups with mysqldump",
      "scenario": "Write the command-line backup used by a nightly job: consistent dump of college and ecommerce, compressed, with the date in the file name, then restore one database.",
      "steps": [
        "Open a terminal (Windows: Command Prompt in C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin)",
        "Store credentials once: mysql_config_editor set --login-path=backup --host=localhost --user=backup_user --password",
        "Run the backup command; check the file size",
        "To restore, create the target schema and pipe the file into mysql",
        "Schedule it with Windows Task Scheduler or cron (Linux: crontab -e)"
      ],
      "code": "# Linux/macOS backup (cron: 0 2 * * * /usr/local/bin/backup.sh)\nmysqldump --login-path=backup --single-transaction --routines --triggers --events \\\n          --databases college ecommerce | gzip > /backups/dbs_$(date +%F).sql.gz\n\n# Windows (one line)\nmysqldump -u backup_user -p --single-transaction --routines --triggers --databases college ecommerce > C:\\backups\\dbs.sql\n\n# Restore just one database from a single-database dump\nmysql -u root -p -e \"CREATE DATABASE IF NOT EXISTS ecommerce_restore\"\nmysqldump -u root -p --single-transaction ecommerce > ecommerce.sql\nmysql -u root -p ecommerce_restore < ecommerce.sql",
      "result": "$ ls -lh /backups\n-rw-r--r-- 1 root root  24K Mar 14 02:00 dbs_2025-03-14.sql.gz\n\n$ mysql -u root -p ecommerce_restore < ecommerce.sql\nEnter password: ********\n$                       (no output = success)",
      "explanation": "With --databases the dump contains CREATE DATABASE and USE statements, so it restores into the same names. A dump of a single database without --databases has no USE, so you can choose the target (ecommerce_restore). gzip typically shrinks SQL dumps by 80-90%. Keep several days of backups and copy them off the server."
    },
    {
      "title": "Safety copy before a risky change, then restore (runs in the Lab)",
      "scenario": "Before running a bulk UPDATE on students, take an in-database copy. The UPDATE goes wrong (all fees set to 0), so restore the fees from the copy.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Result 1 shows the damage (all fees 0), Result 2 shows the restored fees",
        "This is not a replacement for real backups - the copy is on the same server - but it is a quick undo for planned changes"
      ],
      "code": "CREATE TABLE students_bak_20250314 AS SELECT * FROM students;     -- safety copy\n\nUPDATE students SET fees = 0 WHERE student_id > 0;                  -- the mistake\nSELECT student_id, first_name, fees FROM students WHERE student_id <= 3;\n\n-- restore only the damaged column from the copy\nUPDATE students\nSET fees = (SELECT b.fees FROM students_bak_20250314 b WHERE b.student_id = students.student_id)\nWHERE student_id > 0;\n\nSELECT student_id, first_name, fees FROM students WHERE student_id <= 3;\nSELECT (SELECT COUNT(*) FROM students) AS live_rows,\n       (SELECT COUNT(*) FROM students_bak_20250314) AS backup_rows;\n-- full restore alternative: DELETE FROM students; INSERT INTO students SELECT * FROM students_bak_20250314;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nDROP TABLE IF EXISTS students_bak_20250314;\nCREATE TABLE students_bak_20250314 AS SELECT * FROM students;\nUPDATE students SET fees = 0 WHERE student_id > 0;\nSELECT student_id, first_name, fees FROM students WHERE student_id <= 3;\nUPDATE students\nSET fees = (SELECT b.fees FROM students_bak_20250314 b WHERE b.student_id = students.student_id)\nWHERE student_id > 0;\nSELECT student_id, first_name, fees FROM students WHERE student_id <= 3;\nSELECT (SELECT COUNT(*) FROM students) AS live_rows,\n       (SELECT COUNT(*) FROM students_bak_20250314) AS backup_rows;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> DROP TABLE IF EXISTS students_bak_20250314 -> 0 row(s) affected\n>> CREATE TABLE students_bak_20250314 AS SELECT * FROM students -> 0 row(s) affected\n>> UPDATE students SET fees = 0 WHERE student_id > 0 -> 10 row(s) affected Rows matched: 10  Changed: 10  Warnings: 0\n>> SELECT student_id, first_name, fees FROM students WHERE student_id <= \n+------------+------------+------+\n| student_id | first_name | fees |\n+------------+------------+------+\n| 1          | Aarav      | 0    |\n| 2          | Diya       | 0    |\n| 3          | Rohan      | 0    |\n+------------+------------+------+\n3 row(s) returned\n>> UPDATE students -> 10 row(s) affected Rows matched: 10  Changed: 10  Warnings: 0\n>> SELECT student_id, first_name, fees FROM students WHERE student_id <= \n+------------+------------+-------+\n| student_id | first_name | fees  |\n+------------+------------+-------+\n| 1          | Aarav      | 85000 |\n| 2          | Diya       | 85000 |\n| 3          | Rohan      | 60000 |\n+------------+------------+-------+\n3 row(s) returned\n>> SELECT (SELECT COUNT(*) FROM students) AS live_rows,\n+-----------+-------------+\n| live_rows | backup_rows |\n+-----------+-------------+\n| 10        | 10          |\n+-----------+-------------+\n1 row(s) returned",
      "explanation": "CREATE TABLE ... AS SELECT copies the data (but not indexes, foreign keys or AUTO_INCREMENT - use CREATE TABLE ... LIKE + INSERT ... SELECT in real MySQL for an exact structure copy). The correlated UPDATE takes each student's original fees from the copy by matching student_id. Row counts confirm nothing is missing. Drop the copy when you no longer need it."
    },
    {
      "title": "Check server health: Server Status and Performance Dashboard",
      "scenario": "Before and after the nightly backup, check that the server is healthy: uptime, connections, traffic and InnoDB buffer pool.",
      "steps": [
        "Navigator > Administration tab > Server Status: read Running, Uptime, Version, Connections, and the CPU / Connections / Traffic / InnoDB Buffer Usage graphs",
        "Administration > Client Connections: see who is connected; sort by Time to find long-running queries (right-click > Kill Query if needed)",
        "Performance > Dashboard: watch Network Status, MySQL Status (statements per second) and InnoDB Status (buffer pool, disk reads) while the backup runs",
        "Performance > Performance Reports > High Cost SQL Statements to find heavy queries",
        "Run the SQL equivalents below in a query tab"
      ],
      "code": "SHOW GLOBAL STATUS LIKE 'Uptime';\nSHOW GLOBAL STATUS LIKE 'Threads_connected';\nSHOW GLOBAL STATUS LIKE 'Questions';\nSHOW VARIABLES LIKE 'datadir';\nSHOW VARIABLES LIKE 'log_bin';\nSHOW PROCESSLIST;\nSELECT table_schema AS db,\n       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb\nFROM information_schema.TABLES\nGROUP BY table_schema;",
      "result": "+-------------------+--------+\n| Variable_name     | Value  |\n+-------------------+--------+\n| Uptime            | 86423  |\n| Threads_connected | 3      |\n| Questions         | 15873  |\n| datadir           | C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Data\\ |\n| log_bin           | ON     |\n+-------------------+--------+\n(one row per SHOW statement, combined here)\n\n+-----------+---------+\n| db        | size_mb |\n+-----------+---------+\n| college   | 0.19    |\n| ecommerce | 0.17    |\n| mysql     | 2.66    |\n| sys       | 0.02    |\n+-----------+---------+\n(values differ on every server)",
      "explanation": "Server Status and the Dashboard are graphical views over SHOW GLOBAL STATUS / SHOW VARIABLES and the Performance Schema. log_bin = ON confirms binary logging, needed for point-in-time recovery. The size query tells you how big each schema (and so its backup) is."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between a logical and a physical backup?",
      "a": "Logical backups store SQL/CSV (mysqldump, Workbench Data Export) - portable, slower, larger restore time. Physical backups copy data files (MySQL Enterprise Backup, XtraBackup) - fast for large data, same version/platform.",
      "level": "Beginner"
    },
    {
      "q": "How do you take a consistent backup of InnoDB tables without locking?",
      "a": "mysqldump --single-transaction (starts a REPEATABLE READ transaction and dumps a snapshot).",
      "level": "Intermediate"
    },
    {
      "q": "How do you restore a mysqldump file?",
      "a": "mysql -u user -p target_db < dump.sql, or SOURCE dump.sql inside the mysql client, or Workbench Server > Data Import.",
      "level": "Beginner"
    },
    {
      "q": "What does --routines do in mysqldump?",
      "a": "Includes stored procedures and functions (not included by default). Triggers are included by default; events need --events.",
      "level": "Beginner"
    },
    {
      "q": "What is point-in-time recovery?",
      "a": "Restoring the last full backup and then replaying binary logs (mysqlbinlog) up to a specific time/position, e.g. just before an accidental DROP.",
      "level": "Advanced"
    },
    {
      "q": "What is the binary log used for?",
      "a": "Replication and point-in-time recovery; it records all committed data changes.",
      "level": "Intermediate"
    },
    {
      "q": "Where are Data Export and Data Import in Workbench?",
      "a": "Server menu (or Navigator > Administration) > Data Export / Data Import.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between 'Dump Project Folder' and 'Self-Contained File'?",
      "a": "Project folder writes one file per table (restore selected tables); self-contained writes one .sql file and supports single-transaction consistency.",
      "level": "Beginner"
    },
    {
      "q": "Why should you test backups?",
      "a": "Backups can be incomplete, corrupt, missing routines or encoded wrongly; only a successful test restore proves they work.",
      "level": "Beginner"
    },
    {
      "q": "How do you back up only the structure (no data)?",
      "a": "mysqldump --no-data db > schema.sql or Workbench 'Dump Structure Only'.",
      "level": "Beginner"
    },
    {
      "q": "What does the Performance Dashboard in Workbench show?",
      "a": "Live graphs of network traffic, connections, SQL statements per second and InnoDB metrics (buffer pool, reads/writes, redo log).",
      "level": "Intermediate"
    },
    {
      "q": "How do you find the size of each database?",
      "a": "SUM(data_length + index_length) from information_schema.TABLES grouped by table_schema.",
      "level": "Intermediate"
    }
  ],
  "practice": [
    {
      "task": "Write a mysqldump command that backs up only the students and departments tables of college, structure and data.",
      "hint": "List table names after the database name.",
      "solution": "mysqldump -u root -p --single-transaction college students departments > college_two_tables.sql"
    },
    {
      "task": "Write commands to back up the ecommerce schema structure only, and separately its data only.",
      "hint": "--no-data and --no-create-info.",
      "solution": "mysqldump -u root -p --no-data ecommerce > ecommerce_schema.sql\nmysqldump -u root -p --no-create-info --single-transaction ecommerce > ecommerce_data.sql"
    },
    {
      "task": "Restore college_2025_03_14.sql into a new database college_test from the command line and verify the number of tables.",
      "hint": "Create the database first; SHOW TABLES after.",
      "solution": "mysql -u root -p -e \"CREATE DATABASE college_test\"\nmysql -u root -p college_test < college_2025_03_14.sql\nmysql -u root -p -e \"SHOW TABLES FROM college_test\" "
    },
    {
      "task": "In SQL, make a safety copy of the departments table, delete department 5, then restore it from the copy.",
      "hint": "CREATE TABLE ... AS SELECT; INSERT ... SELECT ... WHERE.",
      "solution": "CREATE TABLE departments_bak AS SELECT * FROM departments;\nDELETE FROM departments WHERE dept_id = 5;\nINSERT INTO departments SELECT * FROM departments_bak WHERE dept_id = 5;\nDROP TABLE departments_bak;"
    },
    {
      "task": "List the steps to recover from an accidental DROP TABLE at 11:59 using last night's dump and the binary logs.",
      "hint": "Full restore + mysqlbinlog --stop-datetime.",
      "solution": "-- 1. Restore the 02:00 full dump into the server (or a copy).\n-- 2. Find the binlog position written in the dump (--source-data=2 comment).\n-- 3. mysqlbinlog --start-position=<pos> --stop-datetime=\"2025-03-14 11:58:59\" binlog.0000NN | mysql -u root -p\n-- 4. Verify the table and data, then resume normal operation."
    }
  ],
  "quiz": [
    {
      "question": "Which mysqldump option gives a consistent snapshot of InnoDB tables without locking?",
      "options": [
        "--lock-all-tables",
        "--quick",
        "--single-transaction",
        "--no-data"
      ],
      "answer": 2,
      "explanation": "--single-transaction dumps inside one consistent read transaction."
    },
    {
      "question": "Where is the GUI backup tool in MySQL Workbench?",
      "options": [
        "Server > Data Export",
        "Database > Backup",
        "File > Export > Backup",
        "Query > Dump"
      ],
      "answer": 0,
      "explanation": "Server > Data Export (Administration > Data Export)."
    },
    {
      "question": "Which file/tool is needed for point-in-time recovery?",
      "options": [
        "Error log",
        "Slow query log",
        "General log",
        "Binary log with mysqlbinlog"
      ],
      "answer": 3,
      "explanation": "Binary logs record changes after the full backup."
    },
    {
      "question": "mysqldump by default does NOT include:",
      "options": [
        "Table data",
        "Stored procedures and functions",
        "CREATE TABLE statements",
        "Triggers"
      ],
      "answer": 1,
      "explanation": "Use --routines to include procedures/functions."
    },
    {
      "question": "Which Workbench screen shows live graphs of SQL statements per second and InnoDB buffer pool usage?",
      "options": [
        "Performance Dashboard",
        "Users and Privileges",
        "Data Import",
        "Options File"
      ],
      "answer": 0,
      "explanation": "Performance > Dashboard."
    }
  ]
};
