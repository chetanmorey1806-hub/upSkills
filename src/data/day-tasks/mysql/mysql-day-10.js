const COLLEGE = `CREATE TABLE departments (dept_id INT PRIMARY KEY, dept_name VARCHAR(50), building VARCHAR(20));
CREATE TABLE students (
  student_id INT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  gender     CHAR(1),
  city       VARCHAR(30),
  marks      INT
);
INSERT INTO departments VALUES (1, 'Computer Science', 'Block A'), (2, 'Mechanical', 'Block B'), (3, 'Commerce', 'Block C');
INSERT INTO students VALUES
 (1, 'Aarav', 'M', 'Pune', 88), (2, 'Diya', 'F', 'Mumbai', 92),
 (3, 'Kabir', 'M', 'Nagpur', 64), (4, 'Meera', 'F', 'Pune', 75);`;

export default {
  lesson: 'mysql-day-10',
  minutes: 28,
  intro: 'Change table structure with ALTER TABLE, and choose correctly between DELETE, TRUNCATE and DROP. Also check the CSV import/export wizards.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'You want to **remove all rows** of a big log table, **keep the table structure** and **reset AUTO_INCREMENT** to 1, as fast as possible. Which statement?',
      options: ['DELETE FROM logs;', 'TRUNCATE TABLE logs;', 'DROP TABLE logs;', 'ALTER TABLE logs DROP ALL;'],
      answer: 1,
      explain: '**TRUNCATE** (DDL) drops and recreates the table internally: very fast, resets AUTO_INCREMENT, cannot be rolled back and cannot have a WHERE. **DELETE** (DML) removes rows one by one, can use WHERE and can be rolled back. **DROP** removes the table itself.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which ALTER TABLE statements are valid MySQL? (choose all that apply)',
      options: [
        'ALTER TABLE students ADD COLUMN phone VARCHAR(15) AFTER city;',
        'ALTER TABLE students MODIFY city VARCHAR(50) NOT NULL;',
        'ALTER TABLE students CHANGE city home_city VARCHAR(50);',
        'ALTER TABLE students RENAME COLUMN marks TO score;',
        'ALTER TABLE students DELETE COLUMN gender;',
      ],
      answers: [0, 1, 2, 3],
      explain: '`ADD COLUMN` (optionally `AFTER col` / `FIRST`), `MODIFY` (new definition, same name), `CHANGE old new definition` (rename + redefine) and `RENAME COLUMN old TO new` (MySQL 8) are all valid. Removing a column is `DROP COLUMN`, not DELETE.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Add two columns to `students`:\n- `blood_group` VARCHAR(3)\n- `scholarship` INT NOT NULL DEFAULT 0\n\n(existing students must automatically get scholarship 0)',
      example: { title: 'adding a column', code: "ALTER TABLE courses\nADD COLUMN level VARCHAR(10) DEFAULT 'Basic';" },
      setup: COLLEGE,
      starter: '-- ALTER TABLE students ADD COLUMN ...\n',
      solution: 'ALTER TABLE students ADD COLUMN blood_group VARCHAR(3);\nALTER TABLE students ADD COLUMN scholarship INT NOT NULL DEFAULT 0;',
      check: 'SELECT student_id, blood_group, scholarship FROM students ORDER BY student_id;',
      explain: 'Existing rows get the DEFAULT of a new column (NULL when there is none). A NOT NULL column without a DEFAULT would give existing rows 0/empty values in MySQL, so always give a sensible default. In real MySQL you can add both in one statement: `ADD COLUMN a ..., ADD COLUMN b ...`.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Restructure the departments table:\n1. Rename the column `building` to `block_name`\n2. Then rename the table `departments` to `dept`',
      example: { title: 'renaming', code: 'ALTER TABLE products RENAME COLUMN cost TO price;\nALTER TABLE products RENAME TO items;' },
      setup: COLLEGE,
      starter: '-- rename the column, then the table\n',
      solution: 'ALTER TABLE departments RENAME COLUMN building TO block_name;\nALTER TABLE departments RENAME TO dept;',
      check: 'SELECT dept_id, dept_name, block_name FROM dept ORDER BY dept_id;',
      explain: '`RENAME COLUMN old TO new` keeps the data and type. `ALTER TABLE old RENAME TO new` (or `RENAME TABLE old TO new`) renames the table. Remember to update queries, views and application code that use the old names.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'The column `gender` is no longer needed. **Remove it** from `students`, then show all rows.',
      example: { title: 'dropping a column', code: 'ALTER TABLE courses DROP COLUMN old_code;' },
      setup: COLLEGE,
      starter: '-- remove the gender column\n',
      solution: 'ALTER TABLE students DROP COLUMN gender;\nSELECT * FROM students;',
      check: 'SELECT * FROM students ORDER BY student_id;',
      explain: '`DROP COLUMN` deletes the column **and all its data** permanently (no undo with ROLLBACK, because ALTER is DDL with an implicit commit). Take a backup or a copy of the table before dropping columns in production.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Make a backup copy `students_backup` of students (with data), then **empty the copy** with TRUNCATE (the original must keep its rows).',
      example: { title: 'copy then empty', code: 'CREATE TABLE logs_old AS SELECT * FROM logs;\nTRUNCATE TABLE logs_old;' },
      setup: COLLEGE,
      starter: '-- create the copy, then truncate it\n',
      solution: 'CREATE TABLE students_backup AS SELECT * FROM students;\nTRUNCATE TABLE students_backup;',
      check: "SELECT 'original' AS t, COUNT(*) FROM students\nUNION ALL\nSELECT 'backup', COUNT(*) FROM students_backup;",
      explain: 'After TRUNCATE the backup table still exists (0 rows) while the original keeps its 4 rows. Be careful to truncate the right table: TRUNCATE cannot be undone. `DROP TABLE IF EXISTS students_backup;` would remove the copy completely.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In Workbench, where do you start the wizard that imports a CSV file into an existing table?',
      options: [
        'Right-click the table in the Navigator > Table Data Import Wizard',
        'File > Print',
        'Database > Reverse Engineer',
        'Edit > Preferences > Fonts',
      ],
      answer: 0,
      explain: 'Right-click a table (or the schema) > **Table Data Import Wizard**: choose the file, map CSV columns to table columns and run. **Table Data Export Wizard** does the opposite (table → CSV/JSON). For very large files `LOAD DATA INFILE` is much faster.',
    },
  ],
};
