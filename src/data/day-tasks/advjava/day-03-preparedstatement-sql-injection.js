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

export default {
  lesson: 'day-03-preparedstatement-sql-injection',
  minutes: 25,
  intro: 'See how SQL injection breaks Statement code, then use PreparedStatement placeholders, setXxx methods and generated keys.',
  tasks: [
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'This vulnerable code builds SQL by joining strings:\n```\nString sql = "SELECT * FROM students WHERE email = \'" + email + "\'";\n```\nAn attacker types this into the email box: `\' OR \'1\'=\'1`\n\nWrite the **exact query the database receives** and run it to see what the attacker gets.',
      example: { title: 'how the string is built', text: "If the user types `abc`, the SQL becomes `SELECT * FROM students WHERE email = 'abc'`. Put the attacker text in place of `abc` character by character." },
      setup: STUDENTS,
      starter: '-- paste the attacker input into the query\nSELECT * FROM students WHERE email = \'\';\n',
      solution: "SELECT * FROM students WHERE email = '' OR '1'='1';",
      explain: "The quote typed by the attacker **closes** the string early, and `OR '1'='1'` is always true, so the query returns **every** student. With PreparedStatement the whole input is sent as one value, so MySQL would search for an email literally equal to `' OR '1'='1` and return nothing.",
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the safe query. Which character marks a parameter in a PreparedStatement?\n`String sql = "SELECT * FROM students WHERE email = ____";`',
      example: { title: 'placeholders', code: 'String sql = "UPDATE students SET marks = ? WHERE id = ?";' },
      accept: ['?'],
      explain: 'A `?` is a placeholder. Do **not** put quotes around it (`\'?\'` would be a literal question mark string). The driver sends the SQL once and the values separately, so input can never change the structure of the query.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Fill the method name to set the second parameter (an int):
\`\`\`
PreparedStatement ps = con.prepareStatement(
    "INSERT INTO students (name, marks) VALUES (?, ?)");
ps.setString(1, "Kiran Joshi");
ps.____(2, 84);
\`\`\``,
      example: { title: 'setXxx methods', code: 'ps.setDouble(3, 4999.50);\nps.setDate(4, java.sql.Date.valueOf("2025-06-01"));' },
      accept: ['setInt', 'setInt(2, 84)', 'setInt(2,84);'],
      caseSensitive: true,
      explain: 'Use the setter that matches the column type: `setInt` for INT, `setString` for VARCHAR, `setDouble`/`setBigDecimal` for decimals. Parameter indexes start at **1**, not 0. `setObject` also works but the typed setters are clearer.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The `students` table has ids 1 to 5 (AUTO_INCREMENT). What does this code print?',
      example: { title: 'asking for generated keys', code: 'ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);\nps.executeUpdate();\nResultSet keys = ps.getGeneratedKeys();' },
      code: `String sql = "INSERT INTO students (name, email, course, marks) VALUES (?, ?, ?, ?)";
try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, "Kiran Joshi");
    ps.setString(2, "kiran@gmail.com");
    ps.setString(3, "Java");
    ps.setInt(4, 84);
    int rows = ps.executeUpdate();
    System.out.println("Inserted: " + rows);
    try (ResultSet keys = ps.getGeneratedKeys()) {
        if (keys.next()) {
            System.out.println("New student id: " + keys.getInt(1));
        }
    }
}`,
      expected: 'Inserted: 1\nNew student id: 6',
      explain: 'One row is inserted, so `executeUpdate` returns 1. MySQL gives it the next AUTO_INCREMENT value, 6, which `getGeneratedKeys()` returns. Without `Statement.RETURN_GENERATED_KEYS` the keys ResultSet would be empty (or throw).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Why is **PreparedStatement** preferred over Statement? (choose all that apply)',
      options: [
        'It prevents SQL injection because values are never parsed as SQL',
        'The query can be precompiled once and executed many times with different values',
        'No manual quoting or escaping of strings and dates is needed',
        'It lets you use a ? placeholder for the table name',
        'It automatically commits faster because it skips transactions',
      ],
      answers: [0, 1, 2],
      explain: 'Placeholders can only stand for **values**, not table or column names (`SELECT * FROM ?` is invalid). PreparedStatement is safer, can be reused, and handles quotes in names like "D\'Souza" automatically. It has nothing to do with skipping transactions.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'The login check `SELECT * FROM students WHERE email = ? AND name = ?` is run with the values **asha@gmail.com** and **Asha Patil**. Write the query MySQL effectively runs (with the values in place) to confirm exactly one row matches.',
      example: { title: 'values replace the placeholders', code: "-- WHERE id = ?  with setInt(1, 7)  is like\nSELECT * FROM students WHERE id = 7;" },
      setup: STUDENTS,
      starter: 'SELECT * FROM students WHERE email = ? AND name = ?;\n',
      solution: "SELECT * FROM students WHERE email = 'asha@gmail.com' AND name = 'Asha Patil';",
      explain: 'The driver sends the values separately and MySQL treats them as plain strings, which is equivalent to this query with properly quoted values. If any quote characters were in the input, they would be part of the value, not SQL syntax.',
    },
  ],
};
