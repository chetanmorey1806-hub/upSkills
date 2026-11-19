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
  lesson: 'day-04-resultset-metadata-scrollable',
  minutes: 25,
  intro: 'Practise ResultSet types and concurrency, moving a scrollable cursor, and reading column details with ResultSetMetaData.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the **default** type of a ResultSet returned by `con.createStatement().executeQuery(...)`?',
      options: ['TYPE_SCROLL_SENSITIVE', 'TYPE_SCROLL_INSENSITIVE', 'TYPE_FORWARD_ONLY', 'CONCUR_UPDATABLE'],
      answer: 2,
      explain: 'By default a ResultSet is **TYPE_FORWARD_ONLY** and **CONCUR_READ_ONLY**: you can only call `next()`. To move backwards or jump to a row you must ask for a scrollable type when creating the Statement. CONCUR_UPDATABLE is a concurrency mode, not a type.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the statement so the ResultSet is scrollable but **read-only**:
\`\`\`
Statement st = con.createStatement(
    ResultSet.TYPE_SCROLL_INSENSITIVE,
    ResultSet.____);
\`\`\``,
      example: { title: 'an updatable result set', code: 'con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE);' },
      accept: ['CONCUR_READ_ONLY', 'ResultSet.CONCUR_READ_ONLY'],
      caseSensitive: true,
      explain: 'The first argument is the **type** (scrolling), the second the **concurrency** (`CONCUR_READ_ONLY` or `CONCUR_UPDATABLE`). Read-only is cheaper and is what you want for reports. Swapping the two arguments is a common mistake.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The table has 5 students with ids 1-5: Asha Patil, Rohan Mehta, Sneha Kulkarni, Arjun Nair, Priya Sharma (in that id order). What does this print?',
      example: { title: 'cursor methods', text: '`first()` row 1 · `last()` last row · `absolute(n)` row n · `previous()` one back · `relative(k)` k rows forward (negative = back) · `getRow()` current row number' },
      code: `Statement st = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
ResultSet rs = st.executeQuery("SELECT id, name FROM students ORDER BY id");

rs.last();
System.out.println(rs.getRow() + " " + rs.getString("name"));
rs.absolute(2);
System.out.println(rs.getRow() + " " + rs.getString("name"));
rs.previous();
System.out.println(rs.getRow() + " " + rs.getString("name"));
rs.relative(3);
System.out.println(rs.getRow() + " " + rs.getString("name"));`,
      expected: '5 Priya Sharma\n2 Rohan Mehta\n1 Asha Patil\n4 Arjun Nair',
      explain: '`last()` → row 5; `absolute(2)` → row 2; `previous()` → row 1; `relative(3)` moves 3 forward from row 1 → row 4. `last()` is also the classic trick to count rows: call it and read `getRow()`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this ResultSetMetaData code print?',
      example: { title: 'metadata methods', code: 'ResultSetMetaData md = rs.getMetaData();\nmd.getColumnCount();      // number of columns\nmd.getColumnName(1);      // name of column 1\nmd.getColumnTypeName(1);  // e.g. INT, VARCHAR' },
      code: `ResultSet rs = st.executeQuery("SELECT id, name, marks FROM students");
ResultSetMetaData md = rs.getMetaData();
int n = md.getColumnCount();
System.out.println("Columns: " + n);
for (int i = 1; i <= n; i++) {
    System.out.println(i + ": " + md.getColumnName(i));
}`,
      expected: 'Columns: 3\n1: id\n2: name\n3: marks',
      explain: 'The metadata describes the **result**, not the whole table: the query selected 3 columns, so the count is 3 (email and course are not included). Column positions start at **1**, so the loop is `i = 1; i <= n`. Starting at 0 throws an SQLException.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'On a **TYPE_FORWARD_ONLY** ResultSet, which calls throw an SQLException? (choose all that apply)',
      options: ['rs.next()', 'rs.previous()', 'rs.absolute(3)', 'rs.first()', 'rs.getString("name") after a successful next()'],
      answers: [1, 2, 3],
      explain: 'A forward-only cursor can only go forward one row at a time with `next()`. `previous()`, `absolute()`, `first()`, `last()` and `relative()` need a scrollable type (TYPE_SCROLL_INSENSITIVE or TYPE_SCROLL_SENSITIVE). Reading columns of the current row is always allowed.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'The scrollable "Java toppers" screen loads its rows with one query. Write it: the `id`, `name` and `marks` of **Java** students, highest marks first.',
      example: { title: 'filter and sort', code: "SELECT id, title, price FROM books WHERE category = 'Fiction' ORDER BY price DESC;" },
      setup: STUDENTS,
      starter: '-- SELECT id, name, marks FROM students ...\n',
      solution: "SELECT id, name, marks FROM students WHERE course = 'Java' ORDER BY marks DESC;",
      ordered: true,
      explain: 'Let the database filter and sort (WHERE + ORDER BY) instead of doing it in Java. The ResultSet will then contain 3 rows in the right order, and `first()`/`last()` give the topper and the lowest scorer directly.',
    },
  ],
};
