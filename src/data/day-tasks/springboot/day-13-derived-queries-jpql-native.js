const STUDENTS = `CREATE TABLE students (
  id BIGINT PRIMARY KEY,
  name VARCHAR(50),
  city VARCHAR(50),
  marks INT
);
INSERT INTO students VALUES
(1, 'Asha', 'Pune', 82),
(2, 'Ravi', 'Mumbai', 67),
(3, 'Meera', 'Pune', 91),
(4, 'Kiran', 'Nagpur', 58),
(5, 'Arjun', 'Pune', 74),
(6, 'Sneha', 'Mumbai', 88);`;

export default {
  lesson: 'day-13-derived-queries-jpql-native',
  minutes: 26,
  intro: 'Read and write derived query method names, translate them to SQL, and use @Query with JPQL, native SQL and @Modifying.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What WHERE clause does Spring Data generate for `List<Student> findByCityAndMarksGreaterThan(String city, int marks)`?',
      options: ['WHERE city = ? OR marks > ?', 'WHERE city = ? AND marks > ?', 'WHERE city LIKE ? AND marks >= ?', 'It does not compile: you need @Query'],
      answer: 1,
      explain: 'The name is parsed: `findBy` + `City` (equals) + `And` + `Marks` + `GreaterThan` (>). Parameters are used in order. `GreaterThanEqual` would be `>=`, and `Or` would combine with OR.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the **method name** (only the name) of a derived query that finds students whose `name` **starts with** a given prefix, e.g. "As" → Asha.',
      example: { title: 'similar keywords', code: 'findByEmailEndingWith(String domain)\nfindByNameContainingIgnoreCase(String part)' },
      accept: ['findByNameStartingWith', 'findByNameStartsWith', 'findByNameStartingWithIgnoreCase', 'findByNameStartsWithIgnoreCase'],
      caseSensitive: true,
      explain: '`StartingWith` (alias `StartsWith`) becomes `name LIKE ?%` - Spring adds the `%` for you. Field names must match the entity property exactly (`Name` → field `name`), otherwise the app fails at startup with "No property found".',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Write the SQL that `findByCityOrderByMarksDesc("Pune")` runs: all columns of the students from **Pune**, highest marks first.',
      example: { title: 'derived name → SQL', code: '-- findByMarksLessThanOrderByNameAsc(60)\nSELECT * FROM students WHERE marks < 60 ORDER BY name ASC;' },
      setup: STUDENTS,
      starter: '-- SELECT ... FROM students WHERE ... ORDER BY ...;\n',
      solution: "SELECT * FROM students WHERE city = 'Pune' ORDER BY marks DESC;",
      ordered: true,
      explain: '`findBy` + `City` = `WHERE city = ?` and `OrderByMarksDesc` = `ORDER BY marks DESC`. Pune students are Meera 91, Asha 82, Arjun 74.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'This JPQL is too complex for a method name:\n```\n@Query("SELECT s.city, COUNT(s), AVG(s.marks) FROM Student s GROUP BY s.city HAVING COUNT(s) >= 2")\n```\nWrite the equivalent **native MySQL** query on the `students` table (columns: city, count, average marks).',
      example: { title: 'GROUP BY with a filter on groups', code: 'SELECT dept, SUM(salary)\nFROM employees\nGROUP BY dept\nHAVING SUM(salary) > 100000;' },
      setup: STUDENTS,
      starter: '-- SELECT city, COUNT(*), AVG(marks) ...\n',
      solution: 'SELECT city, COUNT(*) AS total, AVG(marks) AS avg_marks FROM students GROUP BY city HAVING COUNT(*) >= 2;',
      explain: 'JPQL uses the **entity** name (`Student s`) and **field** names; native SQL uses the table/column names. Groups with at least 2 students are Pune (3) and Mumbai (2). Nagpur has 1 and is removed by HAVING.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'This repository method updates rows. Which annotation is missing (besides @Transactional)?\n```\n???\n@Query("UPDATE Student s SET s.marks = s.marks + :bonus WHERE s.city = :city")\nint addBonus(@Param("bonus") int bonus, @Param("city") String city);\n```',
      example: { title: 'returned value', text: 'An @Modifying query returns the number of rows changed (int).' },
      accept: ['@Modifying', '@Modifying(clearAutomatically = true)', '@Modifying(clearAutomatically=true, flushAutomatically=true)'],
      explain: '`@Query` alone expects a SELECT. UPDATE/DELETE queries need **@Modifying** and must run inside a transaction (`@Transactional`), otherwise you get "Executing an update/delete query" or InvalidDataAccessApiUsageException.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What does `nativeQuery = true` change in `@Query(value = "...", nativeQuery = true)`?',
      options: [
        'Nothing, it only makes the query faster',
        'The string is plain SQL for your database (table/column names), not JPQL (entity/field names)',
        'It allows only SELECT * queries',
        'It makes the query run in a new thread',
      ],
      answer: 1,
      explain: 'Native queries are sent to MySQL as written, so you use **table and column** names and can use MySQL-only features. The price: they are not portable to other databases and are not checked against your entities at startup.',
    },
  ],
};
