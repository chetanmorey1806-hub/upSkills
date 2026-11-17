# MySQL with Workbench – 30-day course: topic file spec

Folder: `src/data/mysql-days/day-NN-<slug>.js` (Day 1–30). Plain ES module with a default export; NO imports; valid JS.
Put SQL in template literals (escape backticks as \` and `${` as \${ — prefer plain identifiers without backticks).

Same structure as the other courses:
```js
export default {
  id, title, module, day, level, duration, summary, objectives: [3-5],
  theory: [ { heading, content, syntax?, points?, tip? } ],          // 4-7 sections, simple English, explain EVERY sub-topic
  examples: [                                                        // 3-6 SOLVED examples
    {
      title, scenario,
      steps: ['In MySQL Workbench: open the Local instance connection', 'File > New Query Tab', 'Type the query', 'Click ⚡ (Execute) or press Ctrl+Shift+Enter'],   // REQUIRED, exact Workbench clicks
      code: `-- full MySQL 8 SQL shown to the student`,
      mysql: `CREATE DATABASE IF NOT EXISTS college; USE college; ... ; SELECT ...;`,   // REQUIRED when the script can run in the in-app Workbench Lab (see below): a COMPLETE self-contained script
      result: 'EXACT output from tools/wb_check.py (result grid as a text table, or action messages)',
      explanation: '...',
    },
  ],
  interview: [ { q, a, level } ],     // 8-12 real interview questions (25+ on Day 30)
  practice: [ { task, hint, solution } ],   // 4-6 tasks with full SQL solutions
  quiz: [ { question, options: [4], answer: 0-3, explanation } ],   // EXACTLY 5, vary correct position
};
```

## The in-app "MySQL Workbench Lab"
Students click "🐬 Open in Workbench Lab" on an example: the `mysql` script runs in a browser engine that emulates MySQL on top of SQLite.
Supported: CREATE/DROP DATABASE, USE, SHOW DATABASES/TABLES/FULL TABLES/CREATE TABLE/INDEX, DESCRIBE/DESC/SHOW COLUMNS, CREATE TABLE with
INT AUTO_INCREMENT PRIMARY KEY, ENUM, UNSIGNED, ENGINE=…, DEFAULT CHARSET, KEY idx(col), FOREIGN KEY … REFERENCES (enforced), UNIQUE, NOT NULL, DEFAULT,
CHECK; INSERT (multi-row), INSERT IGNORE, REPLACE, UPDATE, DELETE, TRUNCATE; SELECT with WHERE, ORDER BY, LIMIT n / LIMIT off,n, DISTINCT, LIKE,
IN, BETWEEN, IS NULL, GROUP BY, HAVING, all JOINs incl. LEFT/RIGHT (RIGHT/FULL depend on SQLite ≥3.39), CROSS, SELF, USING; subqueries, EXISTS,
UNION/UNION ALL, views (CREATE VIEW / DROP VIEW), CREATE INDEX, CTEs (WITH, WITH RECURSIVE), window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG,
LEAD, SUM() OVER …); functions: CONCAT, CONCAT_WS, UPPER/LOWER/UCASE/LCASE, LENGTH, CHAR_LENGTH, SUBSTRING/SUBSTR, LEFT, RIGHT, TRIM, LTRIM,
RTRIM, REPLACE, REVERSE, LPAD, RPAD, LOCATE, INSTR, REPEAT, SUBSTRING_INDEX, FIELD, ROUND, TRUNCATE(x,d), CEIL, FLOOR, ABS, MOD, POW, SQRT,
GREATEST, LEAST, RAND, NOW, CURDATE, CURTIME, YEAR, MONTH, DAY, HOUR, MINUTE, DAYNAME, MONTHNAME, DAYOFWEEK, QUARTER, WEEK, LAST_DAY, DATE(),
DATEDIFF, DATE_ADD/DATE_SUB/ADDDATE(x, INTERVAL n UNIT), x + INTERVAL n DAY, TIMESTAMPDIFF(UNIT,a,b), DATE_FORMAT, STR_TO_DATE, IF, IFNULL,
COALESCE, NULLIF, CASE, GROUP_CONCAT(… SEPARATOR …), COUNT/SUM/AVG/MIN/MAX, DATABASE(), VERSION(); START TRANSACTION / COMMIT / ROLLBACK /
SAVEPOINT; CREATE TRIGGER … FOR EACH ROW BEGIN … END (SQLite-compatible bodies only); DELIMITER $$ … $$.
NOT supported in the lab (give `code` + Workbench steps only, no `mysql` field, or put only the supported parts in `mysql`): stored PROCEDURES/
FUNCTIONS/CALL, CREATE USER/GRANT/REVOKE, ALTER TABLE … MODIFY/CHANGE, SET NEW.col inside triggers, ON DUPLICATE KEY UPDATE, EXPLAIN output,
SHOW VARIABLES/STATUS, mysqldump, events, partitioning.

VERIFY every `mysql` script by running: `python3 /home/stn/Pictures/DayWise/EXcel_And_PoweBI/tools/wb_check.py file.sql` and paste the real
output (result grid table / messages) into `result`. Do not depend on NOW()/CURDATE() values or RAND() in results.
Use one consistent sample database across days: `college` (departments, students, courses, enrollments, faculty) and later an `ecommerce`
database (customers, products, orders, order_items, payments) — each `mysql` script must create what it needs (CREATE DATABASE IF NOT EXISTS …;
USE …; DROP TABLE IF EXISTS …; CREATE TABLE …; INSERT …) so it runs standalone.

Validation (run after writing; fix failures):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.day&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=8&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```

## Syllabus – 30 days
Module 1: Getting Started with MySQL & Workbench (Day 1–5)
1 Introduction to Databases, DBMS vs RDBMS, SQL vs MySQL, Where MySQL is used
2 Installing MySQL Server 8 and MySQL Workbench (Windows / macOS / Linux), Root Password, Creating a Connection, MySQL Command Line Client
3 MySQL Workbench Interface Tour: Home screen, Navigator (Schemas, Administration), SQL Editor, Result Grid, Output panel, Execute buttons, Shortcuts, Beautify, Snippets
4 Creating Databases and Tables (with SQL and with Workbench GUI: Create Schema, Create Table wizard), MySQL Data Types
5 Constraints and Keys: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT, CHECK, AUTO_INCREMENT
Module 2: CRUD Operations (Day 6–10)
6 INSERT: single row, multiple rows, INSERT … SELECT, INSERT IGNORE; editing rows in the Result Grid (Apply)
7 SELECT Basics, WHERE, Comparison and Logical Operators, IN, BETWEEN, LIKE wildcards, IS NULL
8 ORDER BY, LIMIT, DISTINCT, Aliases, Calculated Columns
9 UPDATE and DELETE, Safe Updates Mode in Workbench (Error 1175) and how to handle it
10 ALTER, DROP, TRUNCATE, RENAME; Table Data Import/Export Wizard (CSV) in Workbench
Module 3: Functions & Grouping (Day 11–14)
11 String Functions
12 Date/Time and Numeric Functions
13 Aggregate Functions, GROUP BY, HAVING, GROUP_CONCAT, WITH ROLLUP (concept)
14 Control Flow: CASE, IF, IFNULL, COALESCE, NULLIF
Module 4: Joins & Subqueries (Day 15–19)
15 INNER JOIN
16 LEFT, RIGHT and FULL OUTER JOIN (UNION emulation)
17 SELF JOIN, CROSS JOIN, Joining Multiple Tables
18 Subqueries: single-row, multi-row, correlated, in FROM (derived tables)
19 UNION / UNION ALL, EXISTS / NOT EXISTS, ANY / ALL
Module 5: Advanced MySQL (Day 20–25)
20 Views: create, use, update, drop; Views in Workbench Navigator
21 Indexes, EXPLAIN and Visual Explain in Workbench, Query Optimization
22 Stored Procedures: DELIMITER, IN/OUT/INOUT parameters, variables, IF/LOOP, CALL (Workbench: Create Stored Procedure)
23 Stored Functions and Triggers (BEFORE/AFTER, NEW/OLD), Audit Log example
24 Transactions: START TRANSACTION, COMMIT, ROLLBACK, SAVEPOINT, ACID, Autocommit in Workbench, Isolation Levels, Locks
25 Window Functions (ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, running totals) and CTEs incl. Recursive CTE
Module 6: Design, Administration & Project (Day 26–30)
26 Database Design and Normalization (1NF, 2NF, 3NF, BCNF), Anomalies
27 ER / EER Diagrams in Workbench: Modeling, Forward Engineering, Reverse Engineering, Synchronize Model
28 Users, Roles and Privileges: CREATE USER, GRANT, REVOKE; Workbench Users and Privileges screen
29 Backup and Restore: Workbench Data Export / Data Import, mysqldump, Server Status and Performance Dashboard
30 Final Project: E-commerce Database (design → create → data → 20 business queries → views/procedures), Practical Test, 30+ Interview Questions
