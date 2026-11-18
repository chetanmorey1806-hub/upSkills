const COLLEGE = `CREATE TABLE departments (
  dept_id   INT PRIMARY KEY,
  dept_name VARCHAR(50) NOT NULL,
  building  VARCHAR(20)
);
CREATE TABLE students (
  student_id INT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  city       VARCHAR(30),
  dept_id    INT
);
INSERT INTO departments VALUES (1, 'Computer Science', 'Block A'), (2, 'Mechanical', 'Block B'), (3, 'Commerce', 'Block C');
INSERT INTO students VALUES
 (1, 'Aarav', 'Pune', 1), (2, 'Diya', 'Mumbai', 1), (3, 'Kabir', 'Nagpur', 2),
 (4, 'Meera', 'Pune', 3), (5, 'Rohan', 'Nashik', 2);`;

export default {
  lesson: 'day-03-workbench-interface-tour',
  minutes: 18,
  intro: 'Find your way around MySQL Workbench: panels, execute buttons, shortcuts and the Result Grid, then write the SQL that the Navigator shortcuts generate.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Your script has 5 statements. You want to run **only the statement under the cursor**. Which shortcut do you press?',
      options: ['Ctrl+Shift+Enter', 'Ctrl+Enter', 'Ctrl+B', 'Ctrl+T'],
      answer: 1,
      explain: '**Ctrl+Enter** (lightning bolt with the I-beam cursor) runs the current statement. **Ctrl+Shift+Enter** runs the whole script (or the selection), **Ctrl+B** beautifies and **Ctrl+T** opens a new query tab. Running everything by mistake can re-run INSERTs or DROPs, so learn the difference.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the panels of the SQL Editor window. Which statements are TRUE? (choose all that apply)',
      options: [
        'The Navigator (left) has the Schemas and Administration tabs',
        'The Action Output panel shows each statement with its time, message and duration',
        'SQL Additions (right) contains Context Help and Snippets',
        'The Result Grid is used to write new stored procedures',
        'A bold schema name in the Navigator is the default (current) schema',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Remember the cross: **Navigator** left, **query editor** centre, **SQL Additions** right, **results + output** bottom. The Result Grid shows rows returned by a query (and lets you edit rows), it is not an editor for procedures.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which keyboard shortcut **beautifies** (formats) the SQL in the editor? (write it like Ctrl+X)',
      accept: ['Ctrl+B', 'ctrl + b', 'Cmd+B', 'ctrl b'],
      explain: '**Ctrl+B** (Edit > Format > Beautify Query, broom icon) re-indents a long one-line query into readable lines with upper-case keywords. It never changes the meaning of the query.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In the Action Output panel a row shows a **red circle with an X**. What does it mean?',
      options: ['The statement succeeded with warnings', 'The statement failed with an error: read the Message column', 'The query is still running', 'The result was exported to CSV'],
      answer: 1,
      explain: 'Green tick = success, **red X = error**. The Message column holds the error text (e.g. "Error Code: 1146. Table ... doesn\'t exist"); right-click > Copy Message to search it. Always read the message instead of guessing.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'In the Navigator you right-clicked `students` > **Select Rows - Limit 1000**. Now write the equivalent query yourself, but show only the columns `first_name` and `city`.',
      example: { title: 'what Workbench generates', code: 'SELECT * FROM college.departments LIMIT 1000;' },
      setup: COLLEGE,
      starter: '-- first_name and city of every student\n',
      solution: 'SELECT first_name, city FROM students;',
      explain: 'Select Rows - Limit 1000 generates `SELECT * FROM schema.table LIMIT 1000`. Listing only the columns you need is clearer and faster than `*`. Separate the column names with commas, but put no comma before `FROM`.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'This query was typed on one line: `select dept_name,building from departments order by dept_name;`\nRewrite it in a clean, beautified style (keywords in capitals, one clause per line) and run it. The result must be the same.',
      example: { title: 'beautified style', code: 'SELECT\n    first_name,\n    city\nFROM\n    students\nORDER BY first_name;' },
      setup: COLLEGE,
      starter: '-- beautified version here\n',
      solution: 'SELECT\n    dept_name,\n    building\nFROM\n    departments\nORDER BY dept_name;',
      ordered: true,
      explain: 'Beautify (Ctrl+B) only changes **layout**: capital keywords, line breaks and indentation. SQL ignores extra spaces and new lines, so the result is identical, but the query is much easier to read and debug.',
    },
  ],
};
