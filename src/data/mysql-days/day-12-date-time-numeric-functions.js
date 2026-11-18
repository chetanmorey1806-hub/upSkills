export default {
  "id": "mysql-day-12",
  "title": "Date/Time and Numeric Functions",
  "module": "Module 3: Functions & Grouping",
  "day": 12,
  "level": "Beginner",
  "duration": "2.5 hours",
  "summary": "Handle dates and numbers like a pro: date/time data types, NOW and CURDATE, extracting parts (YEAR, MONTH, DAYNAME, QUARTER), date arithmetic with DATE_ADD, DATE_SUB, INTERVAL, DATEDIFF, TIMESTAMPDIFF and LAST_DAY, formatting and parsing with DATE_FORMAT and STR_TO_DATE, numeric functions (ROUND, TRUNCATE, CEIL, FLOOR, MOD, ABS, POW, SQRT, GREATEST, LEAST) and monthly reports.",
  "objectives": [
    "Choose the right date/time data type and get the current date and time",
    "Extract parts of dates and calculate ages, durations and due dates",
    "Format dates for reports and convert text to dates with STR_TO_DATE",
    "Apply numeric functions for rounding, remainders and calculations",
    "Group and filter data by date periods efficiently"
  ],
  "theory": [
    {
      "heading": "1. Date and time data types",
      "content": "MySQL stores dates and times in special types so it can calculate with them. Literal values are written as strings in the ISO format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'.",
      "syntax": "DATE        '2024-07-01'                 -- date only\nTIME        '14:30:00'                   -- time of day or duration\nDATETIME    '2024-07-01 14:30:00'        -- date + time, no time zone conversion\nTIMESTAMP   '2024-07-01 14:30:00'        -- stored in UTC, converted to the session time zone\nYEAR        2024",
      "points": [
        "Always use 'YYYY-MM-DD'. '01-07-2024' is NOT understood as a date (use STR_TO_DATE to convert it).",
        "DATETIME range: 1000-01-01 to 9999-12-31. TIMESTAMP range: 1970 to 2038.",
        "Columns can default to the current time: created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP."
      ]
    },
    {
      "heading": "2. Current date/time and extracting parts",
      "content": "NOW(), CURDATE() and CURTIME() return the server's current values (they change every time you run the query). Extraction functions pull one part out of a date.",
      "syntax": "NOW()  / CURRENT_TIMESTAMP     -- 2025-03-14 10:25:43\nCURDATE() / CURRENT_DATE        -- 2025-03-14\nCURTIME()                       -- 10:25:43\nDATE('2024-07-10 10:15:00')     -- 2024-07-10   (date part)\nYEAR(d)  MONTH(d)  DAY(d)       -- 2024  7  10\nHOUR(t)  MINUTE(t)  SECOND(t)\nMONTHNAME(d)  -- July           DAYNAME(d)   -- Wednesday\nDAYOFWEEK(d)  -- 1=Sunday..7=Saturday   WEEKDAY(d) -- 0=Monday..6=Sunday\nQUARTER(d)    -- 1..4           WEEK(d)      -- week number\nDAYOFYEAR(d)  -- 1..366         EXTRACT(YEAR_MONTH FROM d) -- 202407",
      "points": [
        "SYSDATE() returns the time the function executes; NOW() returns the time the statement started - the same for every row of one query.",
        "In the lessons we use fixed dates such as '2025-01-01' instead of CURDATE() so that results do not change from day to day."
      ]
    },
    {
      "heading": "3. Date arithmetic: DATE_ADD, DATE_SUB, INTERVAL, DATEDIFF, TIMESTAMPDIFF, LAST_DAY",
      "content": "Add or subtract time, and measure the distance between two dates.",
      "syntax": "DATE_ADD('2024-07-01', INTERVAL 30 DAY)     -- 2024-07-31\nDATE_SUB('2024-07-01', INTERVAL 1 MONTH)    -- 2024-06-01\n'2024-07-01' + INTERVAL 2 WEEK              -- 2024-07-15\nADDDATE / SUBDATE                           -- synonyms\n-- units: SECOND MINUTE HOUR DAY WEEK MONTH QUARTER YEAR\n\nDATEDIFF('2024-08-05', '2024-07-01')        -- 35  (days, end - start)\nTIMESTAMPDIFF(YEAR, '2004-03-15', '2025-01-01')   -- 20 (completed years)\nTIMESTAMPDIFF(MONTH, start, end)  TIMESTAMPDIFF(HOUR, start, end)\nLAST_DAY('2024-02-10')                      -- 2024-02-29 (last day of month)",
      "points": [
        "DATEDIFF ignores the time part and always returns days. Order: DATEDIFF(later, earlier) gives a positive number.",
        "TIMESTAMPDIFF(unit, start, end): note the order is start then end, the opposite of DATEDIFF.",
        "Age = TIMESTAMPDIFF(YEAR, dob, CURDATE()) - it correctly handles birthdays not yet reached this year.",
        "Adding 1 MONTH to Jan 31 gives the last valid day: 2024-02-29 (leap year)."
      ]
    },
    {
      "heading": "4. Formatting and parsing: DATE_FORMAT and STR_TO_DATE",
      "content": "DATE_FORMAT turns a date into display text using format specifiers. STR_TO_DATE does the reverse: it reads text in a given format and returns a real DATE.",
      "syntax": "DATE_FORMAT('2024-07-10 16:40:00', '%d-%m-%Y')       -- 10-07-2024\nDATE_FORMAT(d, '%d %b %Y')       -- 10 Jul 2024\nDATE_FORMAT(d, '%W, %M %e')      -- Wednesday, July 10\nDATE_FORMAT(d, '%h:%i %p')       -- 04:40 PM\nDATE_FORMAT(d, '%Y-%m')          -- 2024-07 (great for monthly grouping)\nSTR_TO_DATE('10/07/2024', '%d/%m/%Y')   -- 2024-07-10",
      "points": [
        "%Y 4-digit year, %y 2-digit, %m month 01-12, %c month 1-12, %M month name, %b short month, %d day 01-31, %e day 1-31, %D 1st/2nd, %W weekday name, %a short weekday.",
        "%H hour 00-23, %h hour 01-12, %i minutes, %s seconds, %p AM/PM.",
        "DATE_FORMAT returns TEXT: sort by the original date column, not by the formatted string ('Aug' sorts before 'Jul').",
        "STR_TO_DATE returns NULL if the text does not match the format - very useful when importing CSV files with dd/mm/yyyy dates."
      ]
    },
    {
      "heading": "5. Numeric functions",
      "content": "Mathematical functions for rounding, remainders, powers and signs.",
      "syntax": "ROUND(87.456, 2)    -- 87.46      ROUND(87.5) -- 88     ROUND(1234, -2) -- 1200\nTRUNCATE(87.456, 1) -- 87.4       (cuts, never rounds)\nCEIL(4.1) / CEILING -- 5          FLOOR(4.9) -- 4        FLOOR(-4.1) -- -5\nABS(-15)            -- 15         SIGN(-15) -- -1\nMOD(17, 5) / 17 % 5 -- 2          17 DIV 5  -- 3  (integer division)\nPOW(2, 10) / POWER  -- 1024       SQRT(81)  -- 9\nGREATEST(4, 9, 2)   -- 9          LEAST(4, 9, 2) -- 2\nRAND()              -- random 0..1   PI() -- 3.141593\nFORMAT(1234567.8, 2) -- '1,234,567.80' (text)",
      "points": [
        "In MySQL 17 / 5 = 3.4000 (decimal division); use DIV for an integer result.",
        "CEIL is handy for 'how many pages/boxes do I need': CEIL(total_items / per_box).",
        "MOD(id, 2) = 0 selects even ids; MOD is also used to split rows into groups.",
        "Use DECIMAL columns for money - FLOAT/DOUBLE are approximate and can show values like 117.98819999.",
        "ORDER BY RAND() LIMIT 1 picks a random row (slow on big tables)."
      ],
      "tip": "Lab note: in the browser Workbench Lab integer / integer may be truncated (10/4 shows 2) - always multiply by 1.0 or use ROUND(x * 1.0 / y, 2) when you test division there. Real MySQL returns 2.5000."
    },
    {
      "heading": "6. Dates and numbers in WHERE and GROUP BY",
      "content": "Typical reporting questions are \"how many per month\", \"invoices overdue by more than 30 days\", \"students born in the 2000s\".",
      "syntax": "-- rows in July 2024 (index-friendly range)\nWHERE paid_on >= '2024-07-01' AND paid_on < '2024-08-01'\n-- same but cannot use an index on paid_on\nWHERE YEAR(paid_on) = 2024 AND MONTH(paid_on) = 7\n-- per month\nSELECT DATE_FORMAT(paid_on, '%Y-%m') AS month, SUM(amount)\nFROM fee_payments GROUP BY DATE_FORMAT(paid_on, '%Y-%m');",
      "points": [
        "Prefer range conditions on the raw column for performance (Day 21).",
        "BETWEEN '2024-07-01' AND '2024-07-31' misses times after 00:00:00 on 31 July for DATETIME columns - use < next day instead."
      ]
    }
  ],
  "examples": [
    {
      "title": "Extract parts of a date",
      "scenario": "For each student show the admission year, month number, month name, weekday name, quarter and day of week of their admission date.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Notice that DAYOFWEEK uses 1 = Sunday, so Monday = 2"
      ],
      "code": "SELECT first_name,\n       admission_date,\n       YEAR(admission_date)      AS adm_year,\n       MONTH(admission_date)     AS adm_month,\n       MONTHNAME(admission_date) AS month_name,\n       DAYNAME(admission_date)   AS weekday,\n       DAYOFWEEK(admission_date) AS day_of_week,\n       QUARTER(admission_date)   AS qtr\nFROM students\nWHERE student_id IN (1, 2, 4);",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT first_name,\n       admission_date,\n       YEAR(admission_date)      AS adm_year,\n       MONTH(admission_date)     AS adm_month,\n       MONTHNAME(admission_date) AS month_name,\n       DAYNAME(admission_date)   AS weekday,\n       DAYOFWEEK(admission_date) AS day_of_week,\n       QUARTER(admission_date)   AS qtr\nFROM students\nWHERE student_id IN (1, 2, 4);",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT first_name,\n+------------+----------------+----------+-----------+------------+----------+-------------+-----+\n| first_name | admission_date | adm_year | adm_month | month_name | weekday  | day_of_week | qtr |\n+------------+----------------+----------+-----------+------------+----------+-------------+-----+\n| Aarav      | 2022-07-01     | 2022     | 7         | July       | Friday   | 6           | 3   |\n| Diya       | 2021-07-01     | 2021     | 7         | July       | Thursday | 5           | 3   |\n| Ananya     | 2023-07-03     | 2023     | 7         | July       | Monday   | 2           | 3   |\n+------------+----------------+----------+-----------+------------+----------+-------------+-----+\n3 row(s) returned",
      "explanation": "2022-07-01 was a Friday (DAYOFWEEK 6), 2021-07-01 a Thursday (5) and 2023-07-03 a Monday (2). July is in quarter 3. MONTHNAME and DAYNAME return English names (they follow the lc_time_names setting)."
    },
    {
      "title": "Age and duration with TIMESTAMPDIFF and DATEDIFF",
      "scenario": "Calculate each student's age in completed years and the number of days and months since admission, as of 1 January 2025 (in real work use CURDATE()).",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Replace '2025-01-01' with CURDATE() to get today's values"
      ],
      "code": "SELECT first_name,\n       dob,\n       TIMESTAMPDIFF(YEAR, dob, '2025-01-01')             AS age_years,\n       admission_date,\n       DATEDIFF('2025-01-01', admission_date)            AS days_since_admission,\n       TIMESTAMPDIFF(MONTH, admission_date, '2025-01-01') AS months_since_admission\nFROM students\nORDER BY dob\nLIMIT 5;\n-- live version:  TIMESTAMPDIFF(YEAR, dob, CURDATE())",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT first_name,\n       dob,\n       TIMESTAMPDIFF(YEAR, dob, '2025-01-01')             AS age_years,\n       admission_date,\n       DATEDIFF('2025-01-01', admission_date)            AS days_since_admission,\n       TIMESTAMPDIFF(MONTH, admission_date, '2025-01-01') AS months_since_admission\nFROM students\nORDER BY dob\nLIMIT 5;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT first_name,\n+------------+------------+-----------+----------------+----------------------+------------------------+\n| first_name | dob        | age_years | admission_date | days_since_admission | months_since_admission |\n+------------+------------+-----------+----------------+----------------------+------------------------+\n| Arjun      | 2003-06-14 | 21        | 2021-07-01     | 1280                 | 42                     |\n| Kabir      | 2003-09-30 | 21        | 2021-07-01     | 1280                 | 42                     |\n| Diya       | 2003-11-02 | 21        | 2021-07-01     | 1280                 | 42                     |\n| Aarav      | 2004-03-15 | 20        | 2022-07-01     | 915                  | 30                     |\n| Rohan      | 2004-07-21 | 20        | 2022-07-01     | 915                  | 30                     |\n+------------+------------+-----------+----------------+----------------------+------------------------+\n5 row(s) returned",
      "explanation": "TIMESTAMPDIFF(YEAR, ...) counts only completed years: Arjun (born 2003-06-14) is 21 on 2025-01-01. DATEDIFF returns days (later date first). TIMESTAMPDIFF(MONTH, ...) counts completed months. Note the argument order difference: DATEDIFF(end, start) vs TIMESTAMPDIFF(unit, start, end)."
    },
    {
      "title": "Due dates, late payments and fines",
      "scenario": "Each fee invoice is due 30 days after the invoice date. Show the due date, the last day of the invoice month, the days taken to pay, days late, and a fine of 100 per late day.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the script (it creates fee_payments)",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Meera has not paid yet: her paid_on is NULL so the day calculations are NULL"
      ],
      "code": "SELECT student_name,\n       invoice_date,\n       DATE_ADD(invoice_date, INTERVAL 30 DAY)              AS due_date,\n       LAST_DAY(invoice_date)                               AS month_end,\n       DATE(paid_on)                                        AS paid_date,\n       DATEDIFF(paid_on, invoice_date)                      AS days_taken,\n       GREATEST(DATEDIFF(paid_on, invoice_date) - 30, 0)    AS days_late,\n       GREATEST(DATEDIFF(paid_on, invoice_date) - 30, 0) * 100 AS fine\nFROM fee_payments\nORDER BY payment_id;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS fee_payments;\nCREATE TABLE fee_payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_name VARCHAR(30) NOT NULL,\n  invoice_date DATE NOT NULL,\n  paid_on DATETIME,\n  amount DECIMAL(10,2) NOT NULL\n);\nINSERT INTO fee_payments (student_name, invoice_date, paid_on, amount) VALUES\n('Aarav',  '2024-07-01', '2024-07-10 10:15:00', 42500.00),\n('Diya',   '2024-07-01', '2024-08-05 16:40:00', 42500.00),\n('Rohan',  '2024-07-15', '2024-07-20 09:05:00', 30000.00),\n('Meera',  '2024-08-01', NULL,                  30000.00),\n('Kabir',  '2024-08-20', '2024-09-25 11:30:00', 27500.00),\n('Ananya', '2024-01-31', '2024-02-28 14:00:00', 32500.00);\nSELECT student_name,\n       invoice_date,\n       DATE_ADD(invoice_date, INTERVAL 30 DAY)              AS due_date,\n       LAST_DAY(invoice_date)                               AS month_end,\n       DATE(paid_on)                                        AS paid_date,\n       DATEDIFF(paid_on, invoice_date)                      AS days_taken,\n       GREATEST(DATEDIFF(paid_on, invoice_date) - 30, 0)    AS days_late,\n       GREATEST(DATEDIFF(paid_on, invoice_date) - 30, 0) * 100 AS fine\nFROM fee_payments\nORDER BY payment_id;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS fee_payments -> 0 row(s) affected\n>> CREATE TABLE fee_payments ( -> 0 row(s) affected\n>> INSERT INTO fee_payments (student_name, invoice_date, paid_on, amount) -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT student_name,\n+--------------+--------------+------------+------------+------------+------------+-----------+------+\n| student_name | invoice_date | due_date   | month_end  | paid_date  | days_taken | days_late | fine |\n+--------------+--------------+------------+------------+------------+------------+-----------+------+\n| Aarav        | 2024-07-01   | 2024-07-31 | 2024-07-31 | 2024-07-10 | 9          | 0         | 0    |\n| Diya         | 2024-07-01   | 2024-07-31 | 2024-07-31 | 2024-08-05 | 35         | 5         | 500  |\n| Rohan        | 2024-07-15   | 2024-08-14 | 2024-07-31 | 2024-07-20 | 5          | 0         | 0    |\n| Meera        | 2024-08-01   | 2024-08-31 | 2024-08-31 | NULL       | NULL       | NULL      | NULL |\n| Kabir        | 2024-08-20   | 2024-09-19 | 2024-08-31 | 2024-09-25 | 36         | 6         | 600  |\n| Ananya       | 2024-01-31   | 2024-03-01 | 2024-01-31 | 2024-02-28 | 28         | 0         | 0    |\n+--------------+--------------+------------+------------+------------+------------+-----------+------+\n6 row(s) returned",
      "explanation": "DATE_ADD adds 30 days. LAST_DAY gives the month end whatever the month length, and Ananya's due date crosses a leap-year February: 2024-01-31 + 30 days = 2024-03-01. DATE(paid_on) drops the time. DATEDIFF ignores times, so Diya took 35 days, which is 5 days late -> fine 500. GREATEST(..., 0) prevents negative 'late' values for early payers. Any calculation with Meera's NULL paid_on gives NULL (Day 14 shows how to replace it with IFNULL/COALESCE)."
    },
    {
      "title": "Format dates for reports and parse text into dates",
      "scenario": "Print payment dates in Indian style (dd-mm-yyyy), as '10 Jul 2024', with a 12-hour time, and convert text dates from a CSV ('05/08/2024') into proper DATE values.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type both queries",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT student_name,\n       paid_on,\n       DATE_FORMAT(paid_on, '%d-%m-%Y')       AS indian_style,\n       DATE_FORMAT(paid_on, '%d %b %Y')       AS short_style,\n       DATE_FORMAT(paid_on, '%W, %D %M')      AS long_style,\n       DATE_FORMAT(paid_on, '%h:%i %p')       AS time_12h\nFROM fee_payments\nWHERE paid_on IS NOT NULL\nORDER BY paid_on\nLIMIT 3;\n\nSELECT STR_TO_DATE('05/08/2024', '%d/%m/%Y')          AS from_csv,\n       STR_TO_DATE('July 20, 2024', '%M %d, %Y')      AS from_text,\n       DATEDIFF(STR_TO_DATE('05/08/2024', '%d/%m/%Y'),\n                STR_TO_DATE('20/07/2024', '%d/%m/%Y')) AS days_between;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS fee_payments;\nCREATE TABLE fee_payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_name VARCHAR(30) NOT NULL,\n  invoice_date DATE NOT NULL,\n  paid_on DATETIME,\n  amount DECIMAL(10,2) NOT NULL\n);\nINSERT INTO fee_payments (student_name, invoice_date, paid_on, amount) VALUES\n('Aarav',  '2024-07-01', '2024-07-10 10:15:00', 42500.00),\n('Diya',   '2024-07-01', '2024-08-05 16:40:00', 42500.00),\n('Rohan',  '2024-07-15', '2024-07-20 09:05:00', 30000.00),\n('Meera',  '2024-08-01', NULL,                  30000.00),\n('Kabir',  '2024-08-20', '2024-09-25 11:30:00', 27500.00),\n('Ananya', '2024-01-31', '2024-02-28 14:00:00', 32500.00);\nSELECT student_name,\n       paid_on,\n       DATE_FORMAT(paid_on, '%d-%m-%Y')       AS indian_style,\n       DATE_FORMAT(paid_on, '%d %b %Y')       AS short_style,\n       DATE_FORMAT(paid_on, '%W, %D %M')      AS long_style,\n       DATE_FORMAT(paid_on, '%h:%i %p')       AS time_12h\nFROM fee_payments\nWHERE paid_on IS NOT NULL\nORDER BY paid_on\nLIMIT 3;\nSELECT STR_TO_DATE('05/08/2024', '%d/%m/%Y')          AS from_csv,\n       STR_TO_DATE('July 20, 2024', '%M %d, %Y')      AS from_text,\n       DATEDIFF(STR_TO_DATE('05/08/2024', '%d/%m/%Y'),\n                STR_TO_DATE('20/07/2024', '%d/%m/%Y')) AS days_between;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS fee_payments -> 0 row(s) affected\n>> CREATE TABLE fee_payments ( -> 0 row(s) affected\n>> INSERT INTO fee_payments (student_name, invoice_date, paid_on, amount) -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT student_name,\n+--------------+---------------------+--------------+-------------+--------------------------+----------+\n| student_name | paid_on             | indian_style | short_style | long_style               | time_12h |\n+--------------+---------------------+--------------+-------------+--------------------------+----------+\n| Ananya       | 2024-02-28 14:00:00 | 28-02-2024   | 28 Feb 2024 | Wednesday, 28th February | 02:00 PM |\n| Aarav        | 2024-07-10 10:15:00 | 10-07-2024   | 10 Jul 2024 | Wednesday, 10th July     | 10:15 AM |\n| Rohan        | 2024-07-20 09:05:00 | 20-07-2024   | 20 Jul 2024 | Saturday, 20th July      | 09:05 AM |\n+--------------+---------------------+--------------+-------------+--------------------------+----------+\n3 row(s) returned\n>> SELECT STR_TO_DATE('05/08/2024', '%d/%m/%Y')          AS from_csv,\n+------------+------------+--------------+\n| from_csv   | from_text  | days_between |\n+------------+------------+--------------+\n| 2024-08-05 | 2024-07-20 | 16           |\n+------------+------------+--------------+\n1 row(s) returned",
      "explanation": "DATE_FORMAT returns text in any layout: %d day, %m month number, %b short month, %W weekday, %D day with suffix (10th), %h:%i %p 12-hour time. STR_TO_DATE reads text in the format you describe and returns a real date, so date arithmetic works on it afterwards (16 days between 20 July and 5 August)."
    },
    {
      "title": "Numeric functions on marks and fees",
      "scenario": "Convert marks (out of 100) to a 10-point GPA, round it in different ways, compute monthly fee instalments, check even/odd ids and the difference from a target of 80.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type the query",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script",
        "Compare ROUND, TRUNCATE, CEIL and FLOOR on the same value"
      ],
      "code": "SELECT student_id,\n       first_name,\n       marks,\n       ROUND(marks / 9.5, 4)        AS gpa_raw,\n       ROUND(marks / 9.5, 2)        AS gpa_round,\n       TRUNCATE(marks / 9.5, 1)     AS gpa_trunc,\n       CEIL(marks / 9.5)            AS gpa_ceil,\n       FLOOR(marks / 9.5)           AS gpa_floor,\n       ROUND(fees / 12.0, 0)        AS monthly_fee,\n       MOD(student_id, 2)           AS odd_id,\n       ABS(marks - 80)              AS gap_from_80\nFROM students\nWHERE marks IS NOT NULL\nORDER BY student_id\nLIMIT 5;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nSELECT student_id,\n       first_name,\n       marks,\n       ROUND(marks / 9.5, 4)        AS gpa_raw,\n       ROUND(marks / 9.5, 2)        AS gpa_round,\n       TRUNCATE(marks / 9.5, 1)     AS gpa_trunc,\n       CEIL(marks / 9.5)            AS gpa_ceil,\n       FLOOR(marks / 9.5)           AS gpa_floor,\n       ROUND(fees / 12.0, 0)        AS monthly_fee,\n       MOD(student_id, 2)           AS odd_id,\n       ABS(marks - 80)              AS gap_from_80\nFROM students\nWHERE marks IS NOT NULL\nORDER BY student_id\nLIMIT 5;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> SELECT student_id,\n+------------+------------+-------+---------+-----------+-----------+----------+-----------+-------------+--------+-------------+\n| student_id | first_name | marks | gpa_raw | gpa_round | gpa_trunc | gpa_ceil | gpa_floor | monthly_fee | odd_id | gap_from_80 |\n+------------+------------+-------+---------+-----------+-----------+----------+-----------+-------------+--------+-------------+\n| 1          | Aarav      | 88    | 9.2632  | 9.26      | 9.2       | 10       | 9         | 7083        | 1      | 8           |\n| 2          | Diya       | 92    | 9.6842  | 9.68      | 9.6       | 10       | 9         | 7083        | 0      | 12          |\n| 3          | Rohan      | 75    | 7.8947  | 7.89      | 7.8       | 8        | 7         | 5000        | 1      | 5           |\n| 4          | Ananya     | 81    | 8.5263  | 8.53      | 8.5       | 9        | 8         | 5417        | 0      | 1           |\n| 5          | Kabir      | 64    | 6.7368  | 6.74      | 6.7       | 7        | 6         | 4583        | 1      | 16          |\n+------------+------------+-------+---------+-----------+-----------+----------+-----------+-------------+--------+-------------+\n5 row(s) returned",
      "explanation": "ROUND rounds to the nearest value (88 / 9.5 = 9.263 -> 9.26), TRUNCATE just cuts digits (9.2), CEIL always goes up (10) and FLOOR always goes down (9). fees / 12.0 is a decimal division, then rounded to whole rupees. MOD(student_id, 2) is 1 for odd ids. ABS gives the distance from 80 regardless of direction."
    },
    {
      "title": "Monthly and yearly summaries with dates",
      "scenario": "Count admissions per year, and total fee collections per month (YYYY-MM) for payments made in 2024 - using an index-friendly range filter.",
      "steps": [
        "In MySQL Workbench: open the Local instance connection",
        "File > New Query Tab",
        "Type both queries",
        "Click the ⚡ (Execute) button or press Ctrl+Shift+Enter to run the whole script"
      ],
      "code": "SELECT YEAR(admission_date) AS adm_year, COUNT(*) AS admissions\nFROM students\nGROUP BY YEAR(admission_date)\nORDER BY adm_year;\n\nSELECT DATE_FORMAT(paid_on, '%Y-%m') AS pay_month,\n       COUNT(*)                      AS payments,\n       SUM(amount)                   AS collected\nFROM fee_payments\nWHERE paid_on >= '2024-01-01' AND paid_on < '2025-01-01'\nGROUP BY DATE_FORMAT(paid_on, '%Y-%m')\nORDER BY pay_month;",
      "mysql": "CREATE DATABASE IF NOT EXISTS college;\nUSE college;\nDROP TABLE IF EXISTS enrollments;\nDROP TABLE IF EXISTS faculty;\nDROP TABLE IF EXISTS courses;\nDROP TABLE IF EXISTS students;\nDROP TABLE IF EXISTS departments;\nCREATE TABLE departments (\n  dept_id INT AUTO_INCREMENT PRIMARY KEY,\n  dept_name VARCHAR(50) NOT NULL UNIQUE,\n  building VARCHAR(20)\n);\nINSERT INTO departments (dept_name, building) VALUES\n('Computer Science','Block A'),('Mathematics','Block B'),('Physics','Block C'),\n('Commerce','Block D'),('History','Block E');\nCREATE TABLE students (\n  student_id INT AUTO_INCREMENT PRIMARY KEY,\n  first_name VARCHAR(30) NOT NULL,\n  last_name VARCHAR(30),\n  email VARCHAR(80) UNIQUE,\n  gender CHAR(1),\n  dob DATE,\n  city VARCHAR(30),\n  dept_id INT,\n  marks INT,\n  fees INT,\n  admission_date DATE,\n  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)\n);\nINSERT INTO students (first_name, last_name, email, gender, dob, city, dept_id, marks, fees, admission_date) VALUES\n('Aarav','Sharma','aarav.sharma@college.edu','M','2004-03-15','Pune',1,88,85000,'2022-07-01'),\n('Diya','Patel','diya.patel@college.edu','F','2003-11-02','Mumbai',1,92,85000,'2021-07-01'),\n('Rohan','Verma','rohan.verma@college.edu','M','2004-07-21','Delhi',2,75,60000,'2022-07-01'),\n('Ananya','Iyer','ananya.iyer@college.edu','F','2005-01-10','Chennai',3,81,65000,'2023-07-03'),\n('Kabir','Singh','kabir.singh@college.edu','M','2003-09-30','Delhi',4,64,55000,'2021-07-01'),\n('Meera','Nair','meera.nair@college.edu','F','2004-12-05','Kochi',2,95,60000,'2022-07-01'),\n('Vikram','Rao','vikram.rao@college.edu','M','2005-04-18','Pune',NULL,NULL,50000,'2023-07-03'),\n('Sneha','Kulkarni','sneha.kulkarni@college.edu','F','2004-08-25','Mumbai',1,58,85000,'2022-07-01'),\n('Arjun','Mehta','arjun.mehta@college.edu','M','2003-06-14',NULL,3,70,65000,'2021-07-01'),\n('Priya','Das','priya.das@college.edu','F','2005-02-28','Kolkata',4,85,55000,'2023-07-03');\nDROP TABLE IF EXISTS fee_payments;\nCREATE TABLE fee_payments (\n  payment_id INT AUTO_INCREMENT PRIMARY KEY,\n  student_name VARCHAR(30) NOT NULL,\n  invoice_date DATE NOT NULL,\n  paid_on DATETIME,\n  amount DECIMAL(10,2) NOT NULL\n);\nINSERT INTO fee_payments (student_name, invoice_date, paid_on, amount) VALUES\n('Aarav',  '2024-07-01', '2024-07-10 10:15:00', 42500.00),\n('Diya',   '2024-07-01', '2024-08-05 16:40:00', 42500.00),\n('Rohan',  '2024-07-15', '2024-07-20 09:05:00', 30000.00),\n('Meera',  '2024-08-01', NULL,                  30000.00),\n('Kabir',  '2024-08-20', '2024-09-25 11:30:00', 27500.00),\n('Ananya', '2024-01-31', '2024-02-28 14:00:00', 32500.00);\nSELECT YEAR(admission_date) AS adm_year, COUNT(*) AS admissions\nFROM students\nGROUP BY YEAR(admission_date)\nORDER BY adm_year;\nSELECT DATE_FORMAT(paid_on, '%Y-%m') AS pay_month,\n       COUNT(*)                      AS payments,\n       SUM(amount)                   AS collected\nFROM fee_payments\nWHERE paid_on >= '2024-01-01' AND paid_on < '2025-01-01'\nGROUP BY DATE_FORMAT(paid_on, '%Y-%m')\nORDER BY pay_month;",
      "result": ">> CREATE DATABASE IF NOT EXISTS college -> 1 row(s) affected\n>> USE college -> 0 row(s) affected\n>> DROP TABLE IF EXISTS enrollments -> 0 row(s) affected\n>> DROP TABLE IF EXISTS faculty -> 0 row(s) affected\n>> DROP TABLE IF EXISTS courses -> 0 row(s) affected\n>> DROP TABLE IF EXISTS students -> 0 row(s) affected\n>> DROP TABLE IF EXISTS departments -> 0 row(s) affected\n>> CREATE TABLE departments ( -> 0 row(s) affected\n>> INSERT INTO departments (dept_name, building) VALUES -> 5 row(s) affected Records: 5  Duplicates: 0  Warnings: 0\n>> CREATE TABLE students ( -> 0 row(s) affected\n>> INSERT INTO students (first_name, last_name, email, gender, dob, city, -> 10 row(s) affected Records: 10  Duplicates: 0  Warnings: 0\n>> DROP TABLE IF EXISTS fee_payments -> 0 row(s) affected\n>> CREATE TABLE fee_payments ( -> 0 row(s) affected\n>> INSERT INTO fee_payments (student_name, invoice_date, paid_on, amount) -> 6 row(s) affected Records: 6  Duplicates: 0  Warnings: 0\n>> SELECT YEAR(admission_date) AS adm_year, COUNT(*) AS admissions\n+----------+------------+\n| adm_year | admissions |\n+----------+------------+\n| 2021     | 3          |\n| 2022     | 4          |\n| 2023     | 3          |\n+----------+------------+\n3 row(s) returned\n>> SELECT DATE_FORMAT(paid_on, '%Y-%m') AS pay_month,\n+-----------+----------+-----------+\n| pay_month | payments | collected |\n+-----------+----------+-----------+\n| 2024-02   | 1        | 32500     |\n| 2024-07   | 2        | 72500     |\n| 2024-08   | 1        | 42500     |\n| 2024-09   | 1        | 27500     |\n+-----------+----------+-----------+\n4 row(s) returned",
      "explanation": "Grouping by YEAR() or by DATE_FORMAT(..., '%Y-%m') turns dates into reporting periods; the '%Y-%m' text sorts correctly because the year comes first. The WHERE uses a half-open range (>= start AND < next year) that can use an index on paid_on. Meera's unpaid NULL row is excluded by the range."
    }
  ],
  "interview": [
    {
      "q": "What is the difference between DATETIME and TIMESTAMP?",
      "a": "TIMESTAMP is stored in UTC and converted to the session time zone, range 1970-2038, 4 bytes (+fraction). DATETIME stores the value as given, no time zone conversion, range 1000-9999, 5 bytes.",
      "level": "Intermediate"
    },
    {
      "q": "What is the difference between NOW() and CURDATE()?",
      "a": "NOW() returns the current date and time (DATETIME); CURDATE() returns only the current date.",
      "level": "Beginner"
    },
    {
      "q": "How do you calculate age in years in MySQL?",
      "a": "TIMESTAMPDIFF(YEAR, dob, CURDATE()). It counts completed years. DATEDIFF/365 is inaccurate because of leap years and birthdays.",
      "level": "Beginner"
    },
    {
      "q": "DATEDIFF vs TIMESTAMPDIFF?",
      "a": "DATEDIFF(end, start) returns whole days and ignores the time part. TIMESTAMPDIFF(unit, start, end) returns the difference in any unit (SECOND ... YEAR); note the reversed argument order.",
      "level": "Beginner"
    },
    {
      "q": "How do you convert '25/12/2024' into a DATE?",
      "a": "STR_TO_DATE('25/12/2024', '%d/%m/%Y').",
      "level": "Beginner"
    },
    {
      "q": "How do you get the first and last day of a month?",
      "a": "Last day: LAST_DAY(d). First day: DATE_SUB(d, INTERVAL DAY(d) - 1 DAY) or DATE_FORMAT(d, '%Y-%m-01').",
      "level": "Intermediate"
    },
    {
      "q": "Why is WHERE YEAR(order_date) = 2024 slower than a range?",
      "a": "Wrapping the column in a function makes the condition non-sargable, so an index on order_date cannot be used for a range scan. Use order_date >= '2024-01-01' AND order_date < '2025-01-01'.",
      "level": "Advanced"
    },
    {
      "q": "What is the difference between ROUND, TRUNCATE, CEIL and FLOOR?",
      "a": "ROUND goes to the nearest value at the given precision, TRUNCATE cuts extra digits without rounding, CEIL returns the smallest integer >= x, FLOOR the largest integer <= x.",
      "level": "Beginner"
    },
    {
      "q": "What does 7 / 2 and 7 DIV 2 return in MySQL?",
      "a": "7 / 2 = 3.5000 (decimal division), 7 DIV 2 = 3 (integer division). 7 % 2 or MOD(7,2) = 1.",
      "level": "Beginner"
    },
    {
      "q": "Why should you use DECIMAL instead of FLOAT for money?",
      "a": "FLOAT/DOUBLE are binary approximations and produce rounding errors (0.1 + 0.2 != 0.3). DECIMAL(p,s) stores exact values.",
      "level": "Intermediate"
    },
    {
      "q": "How do you add 3 months to a date?",
      "a": "DATE_ADD(d, INTERVAL 3 MONTH) or d + INTERVAL 3 MONTH. If the day does not exist (31st), MySQL uses the last day of the target month.",
      "level": "Beginner"
    }
  ],
  "practice": [
    {
      "task": "List students born in the month of their admission month (both in July), with dob shown as 'dd Mon yyyy'.",
      "hint": "MONTH(dob) = MONTH(admission_date); DATE_FORMAT(dob, '%d %b %Y').",
      "solution": "SELECT first_name, DATE_FORMAT(dob, '%d %b %Y') AS born, admission_date\nFROM students\nWHERE MONTH(dob) = MONTH(admission_date);"
    },
    {
      "task": "Show each student's 18th birthday and the weekday it fell on.",
      "hint": "DATE_ADD(dob, INTERVAL 18 YEAR), DAYNAME.",
      "solution": "SELECT first_name,\n       DATE_ADD(dob, INTERVAL 18 YEAR)          AS birthday_18,\n       DAYNAME(DATE_ADD(dob, INTERVAL 18 YEAR)) AS weekday\nFROM students;"
    },
    {
      "task": "Find fee payments made on a weekend (Saturday or Sunday).",
      "hint": "DAYOFWEEK returns 1 for Sunday and 7 for Saturday.",
      "solution": "SELECT student_name, paid_on, DAYNAME(paid_on) AS day_name\nFROM fee_payments\nWHERE DAYOFWEEK(paid_on) IN (1, 7);"
    },
    {
      "task": "Compute each student's fees with 18% GST, rounded to 2 decimals, and the number of 10,000-rupee instalments needed (rounded up).",
      "hint": "ROUND(fees * 1.18, 2) and CEIL(fees / 10000.0).",
      "solution": "SELECT first_name, fees,\n       ROUND(fees * 1.18, 2)  AS fees_with_gst,\n       CEIL(fees / 10000.0)   AS instalments\nFROM students;"
    },
    {
      "task": "Show all invoices still unpaid more than 60 days after the invoice date, as of '2024-12-31'.",
      "hint": "paid_on IS NULL and DATEDIFF('2024-12-31', invoice_date) > 60.",
      "solution": "SELECT student_name, invoice_date, DATEDIFF('2024-12-31', invoice_date) AS days_open\nFROM fee_payments\nWHERE paid_on IS NULL\n  AND DATEDIFF('2024-12-31', invoice_date) > 60;"
    }
  ],
  "quiz": [
    {
      "question": "What does DATEDIFF('2024-03-01', '2024-02-01') return?",
      "options": [
        "29",
        "1",
        "-29",
        "30"
      ],
      "answer": 0,
      "explanation": "February 2024 has 29 days (leap year); DATEDIFF(later, earlier) is positive."
    },
    {
      "question": "Which expression gives the age in completed years?",
      "options": [
        "YEAR(CURDATE()) - YEAR(dob)",
        "DATEDIFF(CURDATE(), dob) / 365",
        "TIMESTAMPDIFF(YEAR, dob, CURDATE())",
        "DATE_SUB(CURDATE(), dob)"
      ],
      "answer": 2,
      "explanation": "TIMESTAMPDIFF(YEAR, ...) counts completed years; the other methods are wrong around birthdays or leap years."
    },
    {
      "question": "DATE_FORMAT('2024-07-05', '%d/%m/%Y') returns:",
      "options": [
        "2024/07/05",
        "05/07/2024",
        "07/05/2024",
        "5/7/24"
      ],
      "answer": 1,
      "explanation": "%d day, %m month, %Y four-digit year."
    },
    {
      "question": "TRUNCATE(9.87, 1) returns:",
      "options": [
        "9.9",
        "10",
        "9",
        "9.8"
      ],
      "answer": 3,
      "explanation": "TRUNCATE cuts digits without rounding."
    },
    {
      "question": "Which function returns 2024-02-29 for the input '2024-02-10'?",
      "options": [
        "END_OF_MONTH",
        "MONTH_END",
        "LAST_DAY",
        "EOMONTH"
      ],
      "answer": 2,
      "explanation": "LAST_DAY returns the last date of the month (EOMONTH is the Excel/SQL Server name)."
    }
  ]
};
