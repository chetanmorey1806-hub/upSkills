const COLLEGE = `CREATE TABLE departments (
  dept_id   INT AUTO_INCREMENT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  email      VARCHAR(80),
  city       VARCHAR(30),
  dept_id    INT,
  fees       DECIMAL(10,2) DEFAULT 50000
);
INSERT INTO departments (dept_name) VALUES ('Computer Science'), ('Mechanical'), ('Physics');
INSERT INTO students (first_name, email, city, dept_id, fees) VALUES
 ('Aarav', 'aarav@college.edu', 'Pune', 1, 65000),
 ('Diya', 'diya@college.edu', 'Mumbai', 1, 65000),
 ('Kabir', 'kabir@college.edu', 'Pune', 2, 55000),
 ('Meera', 'meera@college.edu', 'Nagpur', 3, 45000),
 ('Rohan', 'rohan@college.edu', 'Pune', 2, 55000);`;

export default {
  lesson: 'day-06-insert-data',
  minutes: 25,
  intro: 'Add rows in every common way: single row, many rows, INSERT ... SELECT and INSERT IGNORE, and see how AUTO_INCREMENT and DEFAULT behave.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Table `students` has `student_id INT AUTO_INCREMENT PRIMARY KEY` and `fees DECIMAL(10,2) DEFAULT 50000`. You run:\n`INSERT INTO students (first_name, city) VALUES (\'Isha\', \'Goa\');`\nWhat do student_id and fees get?',
      options: ['Both NULL', 'student_id = next number, fees = 50000', 'Error: all columns must be listed', 'student_id = 0, fees = 0'],
      answer: 1,
      explain: 'Columns left out of the column list get their **DEFAULT** (50000) and the AUTO_INCREMENT column gets the **next number** automatically. Only columns without a default that are NOT NULL cause an error when skipped.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about INSERT are TRUE? (choose all that apply)',
      options: [
        'One INSERT with many VALUES rows is faster than many single-row INSERTs',
        'Writing the column list makes the INSERT safe even if columns are added to the table later',
        'INSERT IGNORE silently skips rows that would break a UNIQUE/PRIMARY KEY, turning errors into warnings',
        'INSERT ... SELECT can copy rows from another table',
        'Text values can be written without quotes',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Multi-row INSERT needs one round-trip and one statement parse. The column list protects you from column order changes. INSERT IGNORE turns errors into **warnings** (so check `SHOW WARNINGS`; it can hide real problems). Text and dates always need single quotes.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Add a new student **Isha** (email `isha@college.edu`, city `Goa`, department 3, fees **48000**) using an INSERT **with a column list**. Let MySQL generate the student_id.',
      example: { title: 'INSERT with a column list', code: "INSERT INTO departments (dept_name)\nVALUES ('Civil');" },
      setup: COLLEGE,
      starter: '-- INSERT INTO students (...) VALUES (...);\n',
      solution: "INSERT INTO students (first_name, email, city, dept_id, fees)\nVALUES ('Isha', 'isha@college.edu', 'Goa', 3, 48000);",
      check: 'SELECT student_id, first_name, email, city, dept_id, fees FROM students ORDER BY student_id;',
      explain: 'List the columns, then give values **in the same order**. Skipping `student_id` lets AUTO_INCREMENT assign 6. A typical error is "Column count doesn\'t match value count" (1136) when the two lists have different lengths.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Insert **three** students in **one** INSERT statement (fees should get the default value, so do not give fees):\n- Tanvi, tanvi@college.edu, Pune, dept 1\n- Arjun, arjun@college.edu, Nashik, dept 2\n- Zoya, zoya@college.edu, Mumbai, dept 3',
      example: { title: 'multi-row INSERT', code: "INSERT INTO departments (dept_name) VALUES\n ('Civil'),\n ('Commerce');" },
      setup: COLLEGE,
      starter: '-- one INSERT with three rows\n',
      solution: "INSERT INTO students (first_name, email, city, dept_id) VALUES\n ('Tanvi', 'tanvi@college.edu', 'Pune', 1),\n ('Arjun', 'arjun@college.edu', 'Nashik', 2),\n ('Zoya', 'zoya@college.edu', 'Mumbai', 3);",
      check: 'SELECT first_name, email, city, dept_id, fees FROM students ORDER BY student_id;',
      explain: 'Separate the row tuples with commas and end the statement with one `;`. Because fees is not in the column list, each row gets the DEFAULT 50000. Workbench reports "3 row(s) affected Records: 3 Duplicates: 0 Warnings: 0".',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'The table `pune_students (student_id, first_name, email)` is empty. Fill it with **all students from Pune** using **INSERT ... SELECT** (one statement, no typing of names).',
      example: { title: 'INSERT ... SELECT', code: "INSERT INTO archive (id, name)\nSELECT id, name FROM orders WHERE status = 'CLOSED';" },
      setup: COLLEGE + '\nCREATE TABLE pune_students (student_id INT PRIMARY KEY, first_name VARCHAR(30), email VARCHAR(80));',
      starter: '-- INSERT INTO pune_students ... SELECT ...\n',
      solution: "INSERT INTO pune_students (student_id, first_name, email)\nSELECT student_id, first_name, email\nFROM students\nWHERE city = 'Pune';",
      check: 'SELECT student_id, first_name, email FROM pune_students ORDER BY student_id;',
      explain: 'INSERT ... SELECT has **no VALUES** keyword: the SELECT result becomes the new rows. The selected columns must match the target column list in number and order. Test the SELECT alone first to see which rows will be copied.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: '`dept_name` is UNIQUE and **Physics** already exists. Insert **Physics** and **Chemistry** in ONE statement so that the duplicate Physics is skipped without an error but Chemistry is added.',
      example: { title: 'skip duplicates', code: "INSERT IGNORE INTO tags (tag_name) VALUES ('sql'), ('mysql');" },
      setup: COLLEGE,
      starter: '-- add Physics and Chemistry, skipping duplicates\n',
      solution: "INSERT IGNORE INTO departments (dept_name) VALUES ('Physics'), ('Chemistry');",
      check: 'SELECT dept_name FROM departments ORDER BY dept_name;',
      explain: 'A normal INSERT stops with **Error 1062** at the duplicate Physics and adds nothing more. `INSERT IGNORE` skips the bad row (1 warning) and inserts Chemistry. Use it on purpose only: it also hides other errors such as wrong data.',
    },
  ],
};
