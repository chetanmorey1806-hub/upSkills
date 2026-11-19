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
  lesson: 'day-09-spring-jdbc-jdbctemplate',
  minutes: 25,
  intro: 'Do CRUD with JdbcTemplate: update(), query(), queryForObject(), RowMapper/BeanPropertyRowMapper and named parameters.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Which JdbcTemplate method runs an **INSERT, UPDATE or DELETE** and returns the number of affected rows?\n`int n = jdbcTemplate.____("DELETE FROM students WHERE id = ?", 5);`',
      example: { title: 'reading one value', code: 'Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students", Integer.class);' },
      accept: ['update'],
      caseSensitive: true,
      explain: '`update(sql, args...)` is used for every write statement. JdbcTemplate opens and closes the connection, creates the PreparedStatement, sets the `?` values and converts SQLExceptions into Spring\'s `DataAccessException` for you.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The `students` table: Asha (Java, 88), Rohan (Python, 72), Sneha (Java, 65), Arjun (MySQL, 91), Priya (Java, 79). What does this print?',
      example: { title: 'arguments fill the ? in order', code: 'jdbcTemplate.update("UPDATE students SET course = ? WHERE id = ?", "Spring", 3);' },
      code: `int n = jdbcTemplate.update(
        "UPDATE students SET marks = marks + 5 WHERE course = ?", "Java");
System.out.println("Updated: " + n);

Integer toppers = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM students WHERE marks >= ?", Integer.class, 80);
System.out.println("Toppers: " + toppers);`,
      expected: 'Updated: 3\nToppers: 3',
      explain: 'Three Java students get +5: Asha 93, Sneha 70, Priya 84. Then marks ≥ 80: Asha (93), Arjun (91) and Priya (84) → 3. Note Priya only qualifies because of the update that ran first.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The `Student` class has fields `id, name, email, course, marks` with setters that match the column names. Complete the mapper that fills it automatically:\n`List<Student> list = jdbcTemplate.query("SELECT * FROM students", new ____<>(Student.class));`',
      example: { title: 'a hand-written RowMapper', code: 'RowMapper<Student> m = (rs, rowNum) -> new Student(\n    rs.getInt("id"), rs.getString("name"), rs.getInt("marks"));' },
      accept: ['BeanPropertyRowMapper'],
      caseSensitive: true,
      explain: '`BeanPropertyRowMapper` maps columns to bean properties by name (it also understands `full_name` → `fullName`). It needs a no-arg constructor and setters. For records or constructor-only classes use `DataClassRowMapper` or a lambda RowMapper.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: '`studentDao.findByCourse("Java")` will run `jdbcTemplate.query(sql, mapper, "Java")`. Write that SQL with the value filled in: all columns of Java students, highest marks first.',
      example: { title: 'from ? to a value', code: "-- query(\"SELECT * FROM books WHERE author = ?\", mapper, \"Premchand\")\nSELECT * FROM books WHERE author = 'Premchand';" },
      setup: STUDENTS,
      starter: '-- SELECT * FROM students ...\n',
      solution: "SELECT * FROM students WHERE course = 'Java' ORDER BY marks DESC;",
      ordered: true,
      explain: 'In the DAO the value stays a `?` placeholder (safe from SQL injection) and JdbcTemplate binds "Java". The mapper turns each of the 3 rows into a Student object, giving a `List<Student>`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`jdbcTemplate.queryForObject("SELECT * FROM students WHERE id = ?", mapper, 999)` is called and there is **no** student 999. What happens?',
      options: [
        'It returns null',
        'It throws EmptyResultDataAccessException',
        'It returns an empty Student',
        'It throws SQLException, which you must catch',
      ],
      answer: 1,
      explain: '`queryForObject` expects **exactly one** row: zero rows → `EmptyResultDataAccessException`, more than one → `IncorrectResultSizeDataAccessException`. Catch it and return `Optional.empty()`, or use `query(...)` and check if the list is empty. Spring exceptions are unchecked, so there is no forced SQLException handling.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'With `NamedParameterJdbcTemplate`, complete the placeholder for the parameter named `course`:\n```\nString sql = "SELECT * FROM students WHERE course = ____";\nnamedJdbc.query(sql, Map.of("course", "Java"), mapper);\n```',
      example: { title: 'MapSqlParameterSource', code: 'new MapSqlParameterSource()\n    .addValue("min", 60)\n    .addValue("max", 90);' },
      accept: [':course'],
      caseSensitive: true,
      explain: 'Named parameters use `:name` instead of `?`, so you do not have to count positions, and the same name can be used several times. Values come from a Map, `MapSqlParameterSource` or `BeanPropertySqlParameterSource` (from an object\'s getters).',
    },
  ],
};
