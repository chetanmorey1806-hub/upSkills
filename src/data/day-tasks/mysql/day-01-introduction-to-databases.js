const BOOKS = `CREATE TABLE books (
  book_id INT PRIMARY KEY,
  title   VARCHAR(100),
  author  VARCHAR(50),
  price   DECIMAL(7,2)
);
INSERT INTO books VALUES
 (1, 'Wings of Fire', 'A. P. J. Abdul Kalam', 299.00),
 (2, 'The Guide', 'R. K. Narayan', 199.00),
 (3, 'Godan', 'Munshi Premchand', 150.00);`;

export default {
  lesson: 'day-01-introduction-to-databases',
  minutes: 20,
  intro: 'Check the core ideas (database, DBMS, RDBMS, SQL vs MySQL, SQL command families) and run your very first SQL statements.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between **SQL** and **MySQL**?',
      options: [
        'They are two names for the same software',
        'SQL is the language; MySQL is a database server (RDBMS) that understands SQL',
        'MySQL is the language; SQL is the server',
        'SQL is only for Microsoft, MySQL is only for Linux',
      ],
      answer: 1,
      explain: '**SQL** (Structured Query Language) is the standard language used to talk to relational databases. **MySQL** is one RDBMS product (software) that stores the data and executes SQL. Oracle, SQL Server and PostgreSQL also understand SQL. A common mistake is to say "I know SQL" and "I know MySQL" as if they were the same thing.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Why does a college prefer an **RDBMS** like MySQL over keeping student data in many Excel files? (choose all that apply)',
      options: [
        'Less duplicate (redundant) data because data is split into related tables',
        'Constraints such as PRIMARY KEY and FOREIGN KEY keep data correct',
        'Many users can work on the same data at the same time safely',
        'An RDBMS never needs backups',
        'Data can be queried quickly with SQL',
      ],
      answers: [0, 1, 2, 4],
      explain: 'An RDBMS reduces **redundancy**, enforces **integrity** with keys and constraints, supports **concurrent** users with transactions and lets you query data with SQL. It still needs **backups**: hardware fails and people delete data by mistake.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which SQL family does each statement belong to?\n- `GRANT SELECT ON college.* TO \'ravi\'@\'localhost\'`\n- `TRUNCATE TABLE logs`\n- `ROLLBACK`',
      options: ['DML, DDL, DCL', 'DCL, DDL, TCL', 'DCL, DML, TCL', 'DDL, DDL, DQL'],
      answer: 1,
      explain: '`GRANT`/`REVOKE` control permissions → **DCL**. `TRUNCATE` (like CREATE, ALTER, DROP) changes/resets the table object → **DDL**. `COMMIT`/`ROLLBACK`/`SAVEPOINT` control transactions → **TCL**. Students often call TRUNCATE "DML" because it removes rows, but it is DDL in MySQL.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In a table, one horizontal entry (for example one student) is called a **row** or a ____ (one word, the formal database term).',
      accept: ['record', 'tuple', 'a record', 'a tuple'],
      explain: 'A row is also called a **record** (or tuple in theory). A column is also called a **field** (or attribute). The column whose value uniquely identifies each row is the **primary key**.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'SQL can work like a calculator. Write ONE `SELECT` (no table needed) that returns two columns:\n- `total` = 150 + 75\n- `note` = the text `SQL is fun`',
      example: { title: 'SELECT without a table', code: "SELECT 25 * 4 AS answer, 'Hello MySQL' AS greeting;" },
      starter: '-- Write your SELECT here\n',
      solution: "SELECT 150 + 75 AS total, 'SQL is fun' AS note;",
      explain: '`SELECT` can evaluate expressions without `FROM`. `AS` gives a column heading (alias). Text values go inside **single quotes**; numbers do not. Forgetting the quotes around text makes MySQL look for a column called SQL.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'The table `books` is already created (see setup). Show **all columns and all rows** of the table.',
      example: { title: 'reading a whole table', code: 'SELECT * FROM students;' },
      setup: BOOKS,
      starter: '-- Show every book\n',
      solution: 'SELECT * FROM books;',
      explain: '`SELECT *` means "all columns" and `FROM books` names the table. The answer appears in the Workbench **Result Grid**. A common error is a typo in the table name, which gives Error 1146 "Table doesn\'t exist".',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'Build a mini library table yourself:\n1. Create a table `members` with columns `member_id INT PRIMARY KEY`, `name VARCHAR(50)`, `city VARCHAR(30)`\n2. Insert two members: (1, \'Asha\', \'Pune\') and (2, \'Rahul\', \'Nagpur\')\n3. Show all rows',
      example: { title: 'create, insert, read', code: "CREATE TABLE notes (id INT PRIMARY KEY, txt VARCHAR(50));\nINSERT INTO notes VALUES (1, 'first'), (2, 'second');\nSELECT * FROM notes;" },
      starter: '-- 1. CREATE TABLE members ...\n-- 2. INSERT INTO members ...\n-- 3. SELECT ...\n',
      solution: "CREATE TABLE members (member_id INT PRIMARY KEY, name VARCHAR(50), city VARCHAR(30));\nINSERT INTO members VALUES (1, 'Asha', 'Pune'), (2, 'Rahul', 'Nagpur');\nSELECT * FROM members;",
      check: 'SELECT member_id, name, city FROM members ORDER BY member_id;',
      explain: 'This is the basic life-cycle of data: **DDL** (`CREATE TABLE`) defines the structure, **DML** (`INSERT`) adds rows and **DQL** (`SELECT`) reads them. Separate statements with `;`. Text values need single quotes.',
    },
  ],
};
