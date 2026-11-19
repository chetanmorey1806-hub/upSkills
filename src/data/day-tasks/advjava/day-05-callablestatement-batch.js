const STUDENTS = `CREATE TABLE students (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(50)  NOT NULL,
  email  VARCHAR(100) NOT NULL UNIQUE,
  course VARCHAR(50)  NOT NULL,
  marks  INT DEFAULT 0
);
INSERT INTO students (name, email, course, marks) VALUES
('Asha Patil', 'asha@gmail.com', 'Java', 88),
('Rohan Mehta', 'rohan@gmail.com', 'Python', 72),
('Sneha Kulkarni', 'sneha@gmail.com', 'Java', 65);`;

export default {
  lesson: 'day-05-callablestatement-batch',
  minutes: 25,
  intro: 'Call stored procedures with CallableStatement (IN/OUT parameters) and speed up bulk work with JDBC batch processing.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'A MySQL procedure `get_student(IN p_id INT)` exists. Complete the JDBC escape syntax used to call it:\n`CallableStatement cs = con.prepareCall("____");`',
      example: { title: 'a procedure with two parameters', code: 'con.prepareCall("{call add_student(?, ?)}");' },
      accept: ['{call get_student(?)}', '{ call get_student(?) }', '{call get_student (?)}', 'call get_student(?)', '{CALL get_student(?)}'],
      explain: 'The portable JDBC syntax is `{call procedure_name(?, ?)}`, one `?` per parameter. The braces tell the driver to translate it into the database\'s own CALL syntax. Writing `EXEC get_student` (SQL Server style) does not work on MySQL.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The procedure \`count_by_course(IN p_course VARCHAR(50), OUT p_total INT)\` returns a count. Complete the line that registers the OUT parameter:
\`\`\`
CallableStatement cs = con.prepareCall("{call count_by_course(?, ?)}");
cs.setString(1, "Java");
cs.registerOutParameter(2, Types.____);
cs.execute();
int total = cs.getInt(2);
\`\`\``,
      example: { title: 'OUT of type VARCHAR', code: 'cs.registerOutParameter(3, Types.VARCHAR);\nString grade = cs.getString(3);' },
      accept: ['INTEGER', 'Types.INTEGER', 'java.sql.Types.INTEGER'],
      caseSensitive: true,
      explain: 'OUT parameters must be registered with a `java.sql.Types` constant **before** `execute()`. For an INT column the constant is `Types.INTEGER` (there is no `Types.INT`). After execute you read it with `cs.getInt(2)`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A procedure parameter receives a value from Java, the procedure changes it, and Java reads the new value back. Which mode is it?',
      options: ['IN', 'OUT', 'INOUT', 'RETURN'],
      answer: 2,
      explain: '**IN** = value goes in only (default), **OUT** = value comes back only, **INOUT** = both. For an INOUT parameter you call `setXxx` **and** `registerOutParameter` on the same index.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The table starts with 3 students: Asha (Java), Rohan (Python), Sneha (Java). What does this batch program print?',
      example: { title: 'executeBatch result', code: 'int[] counts = st.executeBatch();\n// counts[i] = rows affected by the i-th statement in the batch' },
      code: `con.setAutoCommit(false);
Statement st = con.createStatement();
st.addBatch("INSERT INTO students (name, email, course, marks) VALUES ('Kiran', 'kiran@gmail.com', 'Java', 70)");
st.addBatch("INSERT INTO students (name, email, course, marks) VALUES ('Neha', 'neha@gmail.com', 'Python', 82)");
st.addBatch("INSERT INTO students (name, email, course, marks) VALUES ('Vikram', 'vikram@gmail.com', 'MySQL', 77)");
st.addBatch("UPDATE students SET marks = marks + 2 WHERE course = 'Python'");
int[] counts = st.executeBatch();
con.commit();

int total = 0;
for (int c : counts) total += c;
System.out.println(Arrays.toString(counts));
System.out.println("Rows affected: " + total);`,
      expected: '[1, 1, 1, 2]\nRows affected: 5',
      explain: 'The statements run in order. Each INSERT affects 1 row. When the UPDATE runs, Neha has already been inserted, so two Python students (Rohan and Neha) are updated → 2. `executeBatch` returns one count per statement, in the same order they were added.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **JDBC batch processing** are TRUE? (choose all that apply)',
      options: [
        'addBatch() queues a statement and executeBatch() sends the whole queue in one round trip',
        'With PreparedStatement you set the parameters, then call addBatch() for each row',
        'Batches are usually combined with setAutoCommit(false) and one commit() at the end',
        'For MySQL, rewriteBatchedStatements=true in the URL makes batch inserts much faster',
        'A SELECT statement can be added to a batch to read rows faster',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Batches are for INSERT/UPDATE/DELETE: a SELECT in a batch throws `BatchUpdateException`. Sending 1000 rows in one batch instead of 1000 round trips, inside one transaction, is often 10-50x faster. `clearBatch()` empties the queue.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Run the same work as the batch above directly in SQL (to check your expectations):\n1. Insert **Kiran** (kiran@gmail.com, Java, 70), **Neha** (neha@gmail.com, Python, 82), **Vikram** (vikram@gmail.com, MySQL, 77)\n2. Add **2 marks** to every Python student',
      example: { title: 'several rows in one INSERT', code: "INSERT INTO items (name, qty) VALUES\n('Pen', 10),\n('Pencil', 25);" },
      setup: STUDENTS,
      starter: '-- 1. INSERT ...\n-- 2. UPDATE ...\n',
      solution: "INSERT INTO students (name, email, course, marks) VALUES\n('Kiran', 'kiran@gmail.com', 'Java', 70),\n('Neha', 'neha@gmail.com', 'Python', 82),\n('Vikram', 'vikram@gmail.com', 'MySQL', 77);\nUPDATE students SET marks = marks + 2 WHERE course = 'Python';",
      check: 'SELECT id, name, course, marks FROM students ORDER BY id;',
      explain: 'Order matters: the UPDATE must come **after** the inserts so that Neha also gets +2 (84) along with Rohan (74). A multi-row INSERT is what MySQL Connector/J builds internally when `rewriteBatchedStatements=true` is set.',
    },
  ],
};
