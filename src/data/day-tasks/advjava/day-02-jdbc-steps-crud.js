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
('Sneha Kulkarni', 'sneha@gmail.com', 'Java', 65),
('Arjun Nair', 'arjun@gmail.com', 'MySQL', 91),
('Priya Sharma', 'priya@gmail.com', 'Java', 79);`;

const TABLE_TEXT = `students table:
id | name           | course | marks
1  | Asha Patil     | Java   | 88
2  | Rohan Mehta    | Python | 72
3  | Sneha Kulkarni | Java   | 65
4  | Arjun Nair     | MySQL  | 91
5  | Priya Sharma   | Java   | 79`;

export default {
  lesson: 'day-02-jdbc-steps-crud',
  minutes: 25,
  intro: 'Practise the JDBC steps, the three execute methods of Statement, the ResultSet cursor and the SQL behind each CRUD operation.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which `Statement` method should you call to run a **SELECT** query and get its rows back?',
      options: ['executeUpdate()', 'executeQuery()', 'execute() is the only option', 'executeBatch()'],
      answer: 1,
      explain: '`executeQuery()` returns a **ResultSet** (for SELECT). `executeUpdate()` returns an **int** = number of affected rows (for INSERT, UPDATE, DELETE, DDL). `execute()` returns a boolean and is used when you do not know the type of SQL in advance. Calling executeUpdate with a SELECT throws an SQLException.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the loop that reads every row of the result: `while (rs.____()) { ... }` (method name only)',
      example: { title: 'the cursor', text: 'A new ResultSet points **before** the first row. Each call to the method moves one row forward and returns false when no rows are left.' },
      accept: ['next', 'next()'],
      caseSensitive: true,
      explain: '`rs.next()` moves the cursor to the next row and returns `true` if a row exists. Because the cursor starts before the first row, you must call `next()` before reading any column. Reading a column without calling next() throws "Before start of result set".',
    },
    {
      type: 'output',
      mins: 3,
      q: `What does this program print?\n\n\`\`\`\n${TABLE_TEXT}\n\`\`\``,
      example: { title: 'executeUpdate returns a count', code: 'int n = st.executeUpdate("DELETE FROM students WHERE id = 99");\nSystem.out.println(n); // 0 (no such row)' },
      code: `try (Connection con = DriverManager.getConnection(URL, USER, PASS);
     Statement st = con.createStatement()) {
    int n = st.executeUpdate(
        "UPDATE students SET marks = marks + 5 WHERE course = 'Java'");
    System.out.println(n + " row(s) updated");
}`,
      expected: '3 row(s) updated',
      explain: '`executeUpdate` returns the number of rows affected. Three students study Java (Asha, Sneha, Priya), so 3 rows are updated. It does not return the new marks, only the count. Checking this count (e.g. `if (n == 0)`) is how you detect "student not found" in update and delete code.',
    },
    {
      type: 'output',
      mins: 3,
      q: `Same table (before any update). What does this program print?\n\n\`\`\`\n${TABLE_TEXT}\n\`\`\``,
      example: { title: 'reading columns', code: 'String n = rs.getString("name"); // by column label\nint m = rs.getInt(3);            // by position (starts at 1)' },
      code: `String sql = "SELECT name, marks FROM students WHERE marks > 75 ORDER BY marks DESC";
try (Connection con = DriverManager.getConnection(URL, USER, PASS);
     Statement st = con.createStatement();
     ResultSet rs = st.executeQuery(sql)) {
    int count = 0;
    while (rs.next()) {
        System.out.println(rs.getString("name") + " - " + rs.getInt("marks"));
        count++;
    }
    System.out.println("Total: " + count);
}`,
      expected: 'Arjun Nair - 91\nAsha Patil - 88\nPriya Sharma - 79\nTotal: 3',
      explain: 'Only marks above 75 qualify (91, 88, 79), and `ORDER BY marks DESC` puts the highest first. Rohan (72) and Sneha (65) are filtered out by the database, so the loop runs 3 times.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Your JDBC "Delete" option will send one SQL statement with `executeUpdate`. Write that statement: **delete every student with marks below 75 who is NOT in the Java course**.',
      example: { title: 'delete with two conditions', code: "DELETE FROM products WHERE stock = 0 AND category <> 'Books';" },
      setup: STUDENTS,
      starter: '-- DELETE FROM students WHERE ...\n',
      solution: "DELETE FROM students WHERE marks < 75 AND course <> 'Java';",
      check: 'SELECT id, name, course, marks FROM students ORDER BY id;',
      explain: 'Only Rohan (Python, 72) matches both conditions, so `executeUpdate` would return 1. Sneha has 65 but studies Java, so she stays. Never run DELETE without a WHERE clause: it removes every row.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about closing JDBC resources are TRUE? (choose all that apply)',
      options: [
        'try-with-resources closes Connection, Statement and ResultSet automatically, even when an exception occurs',
        'Resources declared in try-with-resources are closed in reverse order of creation',
        'You never need to close a Connection because the garbage collector does it immediately',
        'Connection, Statement and ResultSet all implement AutoCloseable',
        'Closing the ResultSet also closes the database server',
      ],
      answers: [0, 1, 3],
      explain: 'All three implement `AutoCloseable`, so try-with-resources closes them (ResultSet first, then Statement, then Connection) even if an exception is thrown. Relying on garbage collection leaks connections and soon MySQL refuses new ones ("Too many connections").',
    },
  ],
};
