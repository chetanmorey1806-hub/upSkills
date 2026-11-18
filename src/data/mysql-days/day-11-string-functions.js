export default {
  "id": "mysql-day-11",
  "title": "String Functions",
  "module": "Module 3: Functions & Grouping",
  "day": 11,
  "level": "Beginner",
  "duration": "2 hours",
  "summary": "Work with text in MySQL: join values with CONCAT and CONCAT_WS, change case, measure with LENGTH and CHAR_LENGTH, cut pieces with LEFT, RIGHT, SUBSTRING and SUBSTRING_INDEX, search with LOCATE and INSTR, clean with TRIM and REPLACE, pad and mask with LPAD, RPAD and REPEAT, and use string functions in WHERE, GROUP BY, ORDER BY and UPDATE.",
  "objectives": [
    "Combine columns into readable text with CONCAT and CONCAT_WS while handling NULLs",
    "Extract parts of strings such as email usernames and domains",
    "Search and replace text with LOCATE, INSTR and REPLACE",
    "Clean and format messy data with TRIM, case functions, LPAD/RPAD and REPEAT",
    "Use string functions in filtering, grouping, sorting and UPDATE statements"
  ],
  "theory": [
    {
      "heading": "1. Why string functions?",
      "content": "Text data is rarely perfect: names come in mixed case, emails need splitting into user and domain, phone numbers need masking, codes need padding. MySQL string functions transform text inside the query, either just for display (SELECT) or to permanently clean data (UPDATE). Positions in MySQL strings start at 1, not 0.",
      "syntax": "SELECT FUNCTION_NAME(column_or_text, other_arguments) AS alias\nFROM table;\n\nSELECT UPPER('mysql');                -- MYSQL (works without a table too)",
      "points": [
        "String functions do not change stored data unless used in UPDATE.",
        "Almost every string function returns NULL if an argument is NULL (except CONCAT_WS, which skips NULLs).",
        "Comparison of text is case-insensitive with the default collation (utf8mb4_0900_ai_ci): 'pune' = 'PUNE' is true.",
        "Functions can be nested: UPPER(LEFT(first_name, 1))."
      ]
    },
    {
      "heading": "2. Joining and changing case: CONCAT, CONCAT_WS, UPPER, LOWER",
      "content": "CONCAT glues values together. CONCAT_WS (With Separator) puts a separator between the values and ignores NULLs. UPPER/UCASE and LOWER/LCASE change case.",
      "syntax": "CONCAT('Aarav', ' ', 'Sharma')            -- Aarav Sharma\nCONCAT('Aarav', NULL)                     -- NULL  (one NULL makes all NULL)\nCONCAT_WS(', ', 'Pune', NULL, 'India')    -- Pune, India\nUPPER('Pune') / UCASE('Pune')             -- PUNE\nLOWER('PUNE') / LCASE('PUNE')             -- pune",
      "points": [
        "Use CONCAT_WS or IFNULL(col, '') when some parts may be NULL.",
        "MySQL has no INITCAP / PROPER function. Build it: CONCAT(UPPER(LEFT(s,1)), LOWER(SUBSTRING(s,2))).",
        "The || operator is logical OR in MySQL by default, not concatenation - always use CONCAT."
      ]
    },
    {
      "heading": "3. Length and extraction: LENGTH, CHAR_LENGTH, LEFT, RIGHT, SUBSTRING, SUBSTRING_INDEX",
      "content": "These functions measure text and cut pieces out of it.",
      "syntax": "LENGTH('Pune')                     -- 4  (bytes)\nCHAR_LENGTH('Pune')                -- 4  (characters)\nLEFT('Mumbai', 3)                  -- Mum\nRIGHT('9876543210', 4)             -- 3210\nSUBSTRING('Database', 5, 4)        -- base  (start 5, take 4)\nSUBSTRING('Database', 5)           -- base  (start 5 to the end)\nSUBSTRING('Database', -4)          -- base  (negative = count from the end)\nSUBSTR / MID                       -- synonyms of SUBSTRING\nSUBSTRING_INDEX('a.b@x.com', '@', 1)   -- a.b    (before the 1st '@')\nSUBSTRING_INDEX('a.b@x.com', '@', -1)  -- x.com  (after the last '@')\nSUBSTRING_INDEX('www.mysql.com', '.', 2) -- www.mysql",
      "points": [
        "LENGTH counts BYTES, CHAR_LENGTH counts CHARACTERS. They differ for multi-byte text: LENGTH('café') = 5 but CHAR_LENGTH('café') = 4 in utf8mb4. For 'how many letters', use CHAR_LENGTH.",
        "SUBSTRING_INDEX(str, delim, n): positive n keeps everything to the LEFT of the n-th delimiter; negative n keeps everything to the RIGHT of the n-th delimiter from the end.",
        "SUBSTRING_INDEX is the easiest way to split emails, file names (extension) and 'City, State' strings."
      ]
    },
    {
      "heading": "4. Searching and replacing: LOCATE, INSTR, POSITION, REPLACE, LIKE",
      "content": "Find where a substring occurs and replace text.",
      "syntax": "LOCATE('@', 'diya@college.edu')        -- 5   (0 if not found)\nLOCATE('a', 'banana', 3)               -- 4   (start searching at position 3)\nINSTR('diya@college.edu', '@')         -- 5   (note: arguments reversed vs LOCATE)\nPOSITION('@' IN 'diya@college.edu')    -- 5\nREPLACE('98220-12345', '-', '')        -- 9822012345 (replace ALL occurrences)\n'Aarav' LIKE 'A%'                      -- 1 (true)",
      "points": [
        "LOCATE(substr, str) and INSTR(str, substr) do the same job with the arguments in opposite order - a classic interview trap.",
        "REPLACE is case-sensitive and replaces every occurrence.",
        "For pattern matching use LIKE (%, _) or REGEXP / REGEXP_LIKE (MySQL 8) for real regular expressions: WHERE phone REGEXP '^[6-9][0-9]{9}$'."
      ]
    },
    {
      "heading": "5. Cleaning and formatting: TRIM, LTRIM, RTRIM, LPAD, RPAD, REPEAT, REVERSE, FORMAT",
      "content": "Remove unwanted spaces, pad codes to a fixed width, and build display strings.",
      "syntax": "TRIM('  Pune  ')                    -- 'Pune'\nLTRIM('  Pune')  / RTRIM('Pune  ')  -- remove left / right spaces only\nTRIM(BOTH '0' FROM '0012300')       -- '123'   (also LEADING / TRAILING)\nLPAD('7', 4, '0')                   -- '0007'\nRPAD('Pune', 8, '.')                -- 'Pune....'\nREPEAT('*', 5)                      -- '*****'\nREVERSE('MySQL')                    -- 'LQSyM'\nFORMAT(1234567.891, 2)              -- '1,234,567.89'  (thousands separator)\nFIELD('B', 'A', 'B', 'C')           -- 2   (position in a list; handy for custom ORDER BY)",
      "points": [
        "TRIM only removes spaces at the ends, not double spaces in the middle; use REPLACE(s, '  ', ' ') for those.",
        "LPAD/RPAD also cut the string if it is longer than the length: LPAD('12345', 3, '0') = '123'.",
        "FORMAT returns text, so do not use it inside further calculations - use ROUND for numbers.",
        "Other useful ones: SPACE(n), ASCII('A') = 65, CHAR(65) = 'A', STRCMP(a, b) (-1, 0, 1), INSERT(str, pos, len, newstr), ELT(n, a, b, c)."
      ],
      "tip": "Workbench Lab note: the browser Lab supports CONCAT, CONCAT_WS, UPPER/LOWER, LENGTH, CHAR_LENGTH, SUBSTRING, LEFT, RIGHT, TRIM, LTRIM, RTRIM, REPLACE, REVERSE, LPAD, RPAD, LOCATE, INSTR, REPEAT, SUBSTRING_INDEX and FIELD. Try FORMAT, REGEXP, TRIM(LEADING ...) and STRCMP in real MySQL Workbench."
    },
    {
      "heading": "6. Using string functions in WHERE, ORDER BY, GROUP BY and UPDATE",
      "content": "String functions work in every clause, not just SELECT.",
      "syntax": "-- filter by domain\nSELECT * FROM students WHERE SUBSTRING_INDEX(email, '@', -1) = 'college.edu';\n-- sort by surname length\nSELECT first_name, last_name FROM students ORDER BY CHAR_LENGTH(last_name) DESC;\n-- group by first letter\nSELECT LEFT(first_name, 1) AS letter, COUNT(*) FROM students GROUP BY LEFT(first_name, 1);\n-- permanently clean data\nUPDATE students SET city = TRIM(city) WHERE student_id > 0;",
      "points": [
        "A function on a column in WHERE (WHERE UPPER(city) = 'PUNE') usually prevents MySQL from using an index on that column - prefer storing clean data.",
        "Preview the cleaning with SELECT col, TRIM(col) ... before running the UPDATE."
      ]
    }
  ],
  "examples": [
    {
      "title": "Build full names, initials and formatted labels",
      "scenario": "The exam cell needs: full name, 'SURNAME, First' format, initials, and a label combining name, city and department id where some values are NULL.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Look at Arjun's label: CONCAT_WS skipped his NULL city, while plain CONCAT would return NULL"
      ],
      "code": "SELECT student_id,\n       CONCAT(first_name, ' ', last_name)             AS full_name,\n       CONCAT(UPPER(last_name), ', ', first_name)     AS exam_name,\n       CONCAT(LEFT(first_name, 1), LEFT(last_name, 1)) AS initials,\n       CONCAT_WS(' | ', first_name, city, dept_id)    AS label,\n       CONCAT(first_name, ' - ', city)                AS with_concat\nFROM students\nWHERE student_id IN (1, 4, 7, 9);",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT student_id,\n       CONCAT(first_name, ' ', last_name)             AS full_name,\n       CONCAT(UPPER(last_name), ', ', first_name)     AS exam_name,\n       CONCAT(LEFT(first_name, 1), LEFT(last_name, 1)) AS initials,\n       CONCAT_WS(' | ', first_name, city, dept_id)    AS label,\n       CONCAT(first_name, ' - ', city)                AS with_concat\nFROM students\nWHERE student_id IN (1, 4, 7, 9);",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT student_id,\n+------------+--------------+---------------+----------+----------------------+------------------+\n| student_id | full_name    | exam_name     | initials | label                | with_concat      |\n+------------+--------------+---------------+----------+----------------------+------------------+\n| 1          | Aarav Sharma | SHARMA, Aarav | AS       | Aarav | Pune | 1     | Aarav - Pune     |\n| 4          | Ananya Iyer  | IYER, Ananya  | AI       | Ananya | Chennai | 3 | Ananya - Chennai |\n| 7          | Vikram Rao   | RAO, Vikram   | VR       | Vikram | Pune        | Vikram - Pune    |\n| 9          | Arjun Mehta  | MEHTA, Arjun  | AM       | Arjun | 3            | NULL             |\n+------------+--------------+---------------+----------+----------------------+------------------+\n4 row(s) returned",
      "explanation": "CONCAT joins the pieces exactly as written. UPPER(last_name) produces SHARMA. LEFT(x, 1) takes the first letter for initials. CONCAT_WS puts ' | ' between non-NULL values only, so Vikram (dept NULL) shows 'Vikram | Pune' and Arjun (city NULL) shows 'Arjun | 3'. In the last column, CONCAT returns NULL for Arjun because one argument (city) is NULL."
    },
    {
      "title": "Split emails with SUBSTRING_INDEX, LOCATE and SUBSTRING",
      "scenario": "For each student, extract the username and the domain from the email, the position of '@', and the length of the email.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Compare the username column produced by two different methods - they are equal"
      ],
      "code": "SELECT email,\n       LOCATE('@', email)                          AS at_pos,\n       SUBSTRING_INDEX(email, '@', 1)              AS username,\n       SUBSTRING(email, 1, LOCATE('@', email) - 1) AS username_2,\n       SUBSTRING_INDEX(email, '@', -1)             AS domain,\n       CHAR_LENGTH(email)                          AS email_len\nFROM students\nORDER BY student_id\nLIMIT 4;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT email,\n       LOCATE('@', email)                          AS at_pos,\n       SUBSTRING_INDEX(email, '@', 1)              AS username,\n       SUBSTRING(email, 1, LOCATE('@', email) - 1) AS username_2,\n       SUBSTRING_INDEX(email, '@', -1)             AS domain,\n       CHAR_LENGTH(email)                          AS email_len\nFROM students\nORDER BY student_id\nLIMIT 4;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT email,\n+--------------------------+--------+--------------+--------------+-------------+-----------+\n| email                    | at_pos | username     | username_2   | domain      | email_len |\n+--------------------------+--------+--------------+--------------+-------------+-----------+\n| aarav.sharma@college.edu | 13     | aarav.sharma | aarav.sharma | college.edu | 24        |\n| diya.patel@college.edu   | 11     | diya.patel   | diya.patel   | college.edu | 22        |\n| rohan.verma@college.edu  | 12     | rohan.verma  | rohan.verma  | college.edu | 23        |\n| ananya.iyer@college.edu  | 12     | ananya.iyer  | ananya.iyer  | college.edu | 23        |\n+--------------------------+--------+--------------+--------------+-------------+-----------+\n4 row(s) returned",
      "explanation": "SUBSTRING_INDEX(email, '@', 1) keeps everything before the first '@'; with -1 it keeps everything after the last '@'. The second username column shows the classic alternative: SUBSTRING from position 1 for (position of @ - 1) characters. For aarav.sharma@college.edu, '@' is at position 13, so the username has 12 characters."
    },
    {
      "title": "Clean messy admission-form data",
      "scenario": "Online admission forms arrived with extra spaces, wrong case, phone numbers with symbols and lowercase course codes. Show a cleaned version next to the original.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script (it creates a small admission_forms table)",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "In the Result Grid, click a cell and look at the value in the field editor to see the hidden spaces in the original columns"
      ],
      "code": "SELECT form_id,\n       CONCAT('[', full_name, ']')                         AS original,\n       TRIM(full_name)                                     AS trimmed,\n       CONCAT(UPPER(LEFT(TRIM(city), 1)),\n              LOWER(SUBSTRING(TRIM(city), 2)))             AS city_clean,\n       RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone,\n             '-', ''), ' ', ''), '(', ''), ')', ''), '+', ''), 10) AS phone_clean,\n       UPPER(course_code)                                  AS course_clean\nFROM admission_forms;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS admission_forms;\nCREATE TABLE admission_forms (\n  form_id INT AUTO_INCREMENT PRIMARY KEY,\n  full_name VARCHAR(60),\n  city VARCHAR(30),\n  phone VARCHAR(20),\n  course_code VARCHAR(20)\n);\nINSERT INTO admission_forms (full_name, city, phone, course_code) VALUES\n('  aarav sharma ', 'PUNE', '98220-12345', 'cs-101'),\n('DIYA PATEL', 'mumbai ', '(91) 9876543210', 'CS-106'),\n('rohan  verma', ' Delhi', '99887 76655', 'ec-103'),\n('Meera Nair', 'kochi', '9123456789', 'ce-105');\nSELECT form_id,\n       CONCAT('[', full_name, ']')                         AS original,\n       TRIM(full_name)                                     AS trimmed,\n       CONCAT(UPPER(LEFT(TRIM(city), 1)),\n              LOWER(SUBSTRING(TRIM(city), 2)))             AS city_clean,\n       RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone,\n             '-', ''), ' ', ''), '(', ''), ')', ''), '+', ''), 10) AS phone_clean,\n       UPPER(course_code)                                  AS course_clean\nFROM admission_forms;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS admission_forms -> 0 row(s) affected\n>> CREATE TABLE admission_forms ( -> 0 row(s) affected\n>> INSERT INTO admission_forms (full_name, city, phone, course_code) VALU -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0\n>> SELECT form_id,\n+---------+-------------------+--------------+------------+-------------+--------------+\n| form_id | original          | trimmed      | city_clean | phone_clean | course_clean |\n+---------+-------------------+--------------+------------+-------------+--------------+\n| 1       | [  aarav sharma ] | aarav sharma | Pune       | 9822012345  | CS-101       |\n| 2       | [DIYA PATEL]      | DIYA PATEL   | Mumbai     | 9876543210  | CS-106       |\n| 3       | [rohan  verma]    | rohan  verma | Delhi      | 9988776655  | EC-103       |\n| 4       | [Meera Nair]      | Meera Nair   | Kochi      | 9123456789  | CE-105       |\n+---------+-------------------+--------------+------------+-------------+--------------+\n4 row(s) returned",
      "explanation": "TRIM removed the leading/trailing spaces from '  aarav sharma ' (the square brackets in original make them visible). city_clean builds Proper Case: first letter UPPER, rest LOWER. Nested REPLACE removes '-', spaces and brackets, then RIGHT(..., 10) keeps the 10-digit mobile number, so '(91) 9876543210' becomes 9876543210. Note TRIM does not fix the double space inside 'rohan  verma' - a REPLACE('  ', ' ') would."
    },
    {
      "title": "Padding roll numbers and masking phone numbers",
      "scenario": "Generate roll numbers like CS-0001 from student_id, mask the phone so only the last 4 digits are visible, and right-pad names for a fixed-width print report.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT form_id,\n       CONCAT(UPPER(LEFT(course_code, 2)), '-', LPAD(form_id, 4, '0')) AS roll_no,\n       CONCAT(REPEAT('*', 6), RIGHT(REPLACE(phone, '-', ''), 4))         AS masked_phone,\n       RPAD(TRIM(full_name), 15, '.')                                    AS print_name,\n       REVERSE(UPPER(TRIM(city)))                                        AS reversed_city\nFROM admission_forms;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS admission_forms;\nCREATE TABLE admission_forms (\n  form_id INT AUTO_INCREMENT PRIMARY KEY,\n  full_name VARCHAR(60),\n  city VARCHAR(30),\n  phone VARCHAR(20),\n  course_code VARCHAR(20)\n);\nINSERT INTO admission_forms (full_name, city, phone, course_code) VALUES\n('  aarav sharma ', 'PUNE', '98220-12345', 'cs-101'),\n('DIYA PATEL', 'mumbai ', '(91) 9876543210', 'CS-106'),\n('rohan  verma', ' Delhi', '99887 76655', 'ec-103'),\n('Meera Nair', 'kochi', '9123456789', 'ce-105');\nSELECT form_id,\n       CONCAT(UPPER(LEFT(course_code, 2)), '-', LPAD(form_id, 4, '0')) AS roll_no,\n       CONCAT(REPEAT('*', 6), RIGHT(REPLACE(phone, '-', ''), 4))         AS masked_phone,\n       RPAD(TRIM(full_name), 15, '.')                                    AS print_name,\n       REVERSE(UPPER(TRIM(city)))                                        AS reversed_city\nFROM admission_forms;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS admission_forms -> 0 row(s) affected\n>> CREATE TABLE admission_forms ( -> 0 row(s) affected\n>> INSERT INTO admission_forms (full_name, city, phone, course_code) VALU -> 4 row(s) affected Records: 4  Duplicates: 0  Warnings: 0\n>> SELECT form_id,\n+---------+---------+--------------+-----------------+---------------+\n| form_id | roll_no | masked_phone | print_name      | reversed_city |\n+---------+---------+--------------+-----------------+---------------+\n| 1       | CS-0001 | ******2345   | aarav sharma... | ENUP          |\n| 2       | CS-0002 | ******3210   | DIYA PATEL..... | IABMUM        |\n| 3       | EC-0003 | ******6655   | rohan  verma... | IHLED         |\n| 4       | CE-0004 | ******6789   | Meera Nair..... | IHCOK         |\n+---------+---------+--------------+-----------------+---------------+\n4 row(s) returned",
      "explanation": "LPAD(form_id, 4, '0') turns 1 into 0001; prefixing the course letters gives CS-0001. The mask uses REPEAT('*', 6) plus the last 4 characters. RPAD fills names up to 15 characters with dots for aligned printing. REVERSE simply reverses the characters - rarely used in business, but popular in interview puzzles (e.g. palindrome check: WHERE name = REVERSE(name))."
    },
    {
      "title": "String functions in WHERE, GROUP BY, ORDER BY and UPDATE",
      "scenario": "Count students by the first letter of their first name, find students whose surname has more than 5 letters, sort cities in a custom order, and permanently change the email domain.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type all statements",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Four results appear as Result 1 ... Result 4 tabs below the editor"
      ],
      "code": "SELECT LEFT(first_name, 1) AS letter, COUNT(*) AS students\nFROM students\nGROUP BY LEFT(first_name, 1)\nHAVING COUNT(*) > 1\nORDER BY letter;\n\nSELECT first_name, last_name, CHAR_LENGTH(last_name) AS len\nFROM students\nWHERE CHAR_LENGTH(last_name) > 5\nORDER BY len DESC, first_name;\n\nSELECT first_name, city\nFROM students\nWHERE city IN ('Delhi', 'Mumbai', 'Pune')\nORDER BY FIELD(city, 'Pune', 'Mumbai', 'Delhi'), first_name;\n\nUPDATE students\nSET email = REPLACE(email, '@college.edu', '@univ.ac.in')\nWHERE email LIKE '%@college.edu';\n\nSELECT first_name, email FROM students WHERE student_id <= 3;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT LEFT(first_name, 1) AS letter, COUNT(*) AS students\nFROM students\nGROUP BY LEFT(first_name, 1)\nHAVING COUNT(*) > 1\nORDER BY letter;\nSELECT first_name, last_name, CHAR_LENGTH(last_name) AS len\nFROM students\nWHERE CHAR_LENGTH(last_name) > 5\nORDER BY len DESC, first_name;\nSELECT first_name, city\nFROM students\nWHERE city IN ('Delhi', 'Mumbai', 'Pune')\nORDER BY FIELD(city, 'Pune', 'Mumbai', 'Delhi'), first_name;\nUPDATE students\nSET email = REPLACE(email, '@college.edu', '@univ.ac.in')\nWHERE email LIKE '%@college.edu';\nSELECT first_name, email FROM students WHERE student_id <= 3;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT LEFT(first_name, 1) AS letter, COUNT(*) AS students\n+--------+----------+\n| letter | students |\n+--------+----------+\n| A      | 3        |\n+--------+----------+\n1 row(s) returned\n>> SELECT first_name, last_name, CHAR_LENGTH(last_name) AS len\n+------------+-----------+-----+\n| first_name | last_name | len |\n+------------+-----------+-----+\n| Sneha      | Kulkarni  | 8   |\n| Aarav      | Sharma    | 6   |\n+------------+-----------+-----+\n2 row(s) returned\n>> SELECT first_name, city\n+------------+--------+\n| first_name | city   |\n+------------+--------+\n| Aarav      | Pune   |\n| Vikram     | Pune   |\n| Diya       | Mumbai |\n| Sneha      | Mumbai |\n| Kabir      | Delhi  |\n| Rohan      | Delhi  |\n+------------+--------+\n6 row(s) returned\n>> UPDATE students -> 10 row(s) affected Rows matched: 10  Changed: 10  Warnings: 0\n>> SELECT first_name, email FROM students WHERE student_id <= 3\n+------------+-------------------------+\n| first_name | email                   |\n+------------+-------------------------+\n| Aarav      | aarav.sharma@univ.ac.in |\n| Diya       | diya.patel@univ.ac.in   |\n| Rohan      | rohan.verma@univ.ac.in  |\n+------------+-------------------------+\n3 row(s) returned",
      "explanation": "GROUP BY LEFT(first_name, 1) groups by initial; HAVING keeps only letters shared by more than one student, so just A (Aarav, Ananya, Arjun) is returned. CHAR_LENGTH keeps only surnames longer than 5 letters: Kulkarni (8) and Sharma (6). FIELD returns the position of city in the custom list, so Pune rows come first, then Mumbai, then Delhi. The UPDATE rewrites all 10 emails because REPLACE swaps the domain text (in Workbench with Safe Updates on, add AND student_id > 0 to the WHERE)."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between CONCAT and CONCAT_WS?",
      "a": "CONCAT joins values and returns NULL if any argument is NULL. CONCAT_WS takes a separator as the first argument, puts it between values and skips NULL values.",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between LENGTH and CHAR_LENGTH?",
      "a": "LENGTH returns the size in bytes, CHAR_LENGTH the number of characters. For multi-byte characters (é, Hindi, emoji in utf8mb4) LENGTH is larger.",
      "level": "Intermediate"
    },
    {
      "q": "How do you extract the domain from an email address?",
      "a": "SUBSTRING_INDEX(email, '@', -1). Alternative: SUBSTRING(email, LOCATE('@', email) + 1).",
      "level": "Beginner"
    },
    {
      "q": "What is the difference between LOCATE and INSTR?",
      "a": "Both return the 1-based position of a substring (0 if absent). LOCATE(substr, str [, start]) puts the substring first and allows a start position; INSTR(str, substr) puts the string first.",
      "level": "Beginner"
    },
    {
      "q": "How do you convert a name to Proper Case in MySQL?",
      "a": "There is no INITCAP. Use CONCAT(UPPER(LEFT(name,1)), LOWER(SUBSTRING(name,2))) - for each word you need SUBSTRING_INDEX or a stored function.",
      "level": "Intermediate"
    },
    {
      "q": "Does TRIM remove spaces between words?",
      "a": "No, only leading and trailing characters. Use REPLACE to change inner spaces. TRIM(LEADING 'x' FROM s) / TRAILING / BOTH can remove other characters.",
      "level": "Beginner"
    },
    {
      "q": "How do you pad a number with leading zeros?",
      "a": "LPAD(number, width, '0'), e.g. LPAD(7, 4, '0') = '0007'. Or use the ZEROFILL attribute (deprecated) on the column.",
      "level": "Beginner"
    },
    {
      "q": "Why can WHERE UPPER(city) = 'PUNE' be slow?",
      "a": "Applying a function to a column prevents normal index use on that column (not sargable). With the default case-insensitive collation it is unnecessary anyway: WHERE city = 'pune' matches 'Pune'. MySQL 8 also supports functional indexes.",
      "level": "Advanced"
    },
    {
      "q": "How do you find duplicate emails ignoring case and spaces?",
      "a": "GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1.",
      "level": "Intermediate"
    },
    {
      "q": "What does SUBSTRING('MySQL', -3) return?",
      "a": "'SQL' - a negative start counts from the end of the string.",
      "level": "Beginner"
    },
    {
      "q": "How do you mask all but the last 4 digits of a card number?",
      "a": "CONCAT(REPEAT('*', CHAR_LENGTH(card) - 4), RIGHT(card, 4)).",
      "level": "Beginner"
    }
  ],
  "practice": [
    {
      "task": "Show each student's first name in uppercase and the number of characters in it, longest first.",
      "hint": "UPPER and CHAR_LENGTH; ORDER BY the alias.",
      "solution": "SELECT UPPER(first_name) AS name_upper, CHAR_LENGTH(first_name) AS letters\nFROM students\nORDER BY letters DESC, name_upper;"
    },
    {
      "task": "Generate a login id for each student: first 3 letters of first name + last 2 digits of the birth year, all lowercase (e.g. aar04).",
      "hint": "LEFT, RIGHT(YEAR(dob), 2) or SUBSTRING(dob, 3, 2), LOWER, CONCAT.",
      "solution": "SELECT first_name, LOWER(CONCAT(LEFT(first_name, 3), RIGHT(YEAR(dob), 2))) AS login_id\nFROM students;"
    },
    {
      "task": "List students whose email username (before @) contains the letter 'k'.",
      "hint": "SUBSTRING_INDEX(email, '@', 1) LIKE '%k%' or LOCATE.",
      "solution": "SELECT first_name, email\nFROM students\nWHERE LOCATE('k', SUBSTRING_INDEX(email, '@', 1)) > 0;"
    },
    {
      "task": "Permanently clean the admission_forms table: trim names, make city Proper Case and course_code upper case.",
      "hint": "UPDATE with the expressions from Example 3; preview first.",
      "solution": "UPDATE admission_forms\nSET full_name   = TRIM(full_name),\n    city        = CONCAT(UPPER(LEFT(TRIM(city), 1)), LOWER(SUBSTRING(TRIM(city), 2))),\n    course_code = UPPER(course_code)\nWHERE form_id > 0;"
    },
    {
      "task": "Show the department name and a 3-letter code (first 3 letters upper case) for each department, padded on the right with '-' to 6 characters.",
      "hint": "UPPER(LEFT(dept_name, 3)) and RPAD.",
      "solution": "SELECT dept_name, RPAD(UPPER(LEFT(dept_name, 3)), 6, '-') AS dept_code\nFROM departments;"
    }
  ],
  "quiz": [
    {
      "question": "What does CONCAT('Pune', NULL, 'India') return?",
      "options": [
        "Pune India",
        "NULL",
        "PuneIndia",
        "Error"
      ],
      "answer": 1,
      "explanation": "Any NULL argument makes CONCAT return NULL. CONCAT_WS would skip it."
    },
    {
      "question": "SUBSTRING_INDEX('report.final.pdf', '.', -1) returns:",
      "options": [
        "report",
        "final.pdf",
        "report.final",
        "pdf"
      ],
      "answer": 3,
      "explanation": "Negative count keeps the part after the last delimiter."
    },
    {
      "question": "Which function counts characters rather than bytes?",
      "options": [
        "LENGTH",
        "SIZE",
        "CHAR_LENGTH",
        "BYTES"
      ],
      "answer": 2,
      "explanation": "CHAR_LENGTH (or CHARACTER_LENGTH) counts characters; LENGTH counts bytes."
    },
    {
      "question": "LPAD('42', 5, '0') returns:",
      "options": [
        "00042",
        "42000",
        "0042",
        "4200"
      ],
      "answer": 0,
      "explanation": "LPAD fills on the left up to 5 characters."
    },
    {
      "question": "Which call returns 5 for the email 'diya@x.com'?",
      "options": [
        "INSTR('@', 'diya@x.com')",
        "LOCATE('diya@x.com', '@')",
        "POSITION('diya@x.com' IN '@')",
        "LOCATE('@', 'diya@x.com')"
      ],
      "answer": 3,
      "explanation": "LOCATE(substr, str). INSTR takes the string first: INSTR('diya@x.com', '@')."
    }
  ]
};
