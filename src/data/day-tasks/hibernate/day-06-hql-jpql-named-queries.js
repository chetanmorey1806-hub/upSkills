const STUDENTS = `CREATE TABLE students (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(50)  NOT NULL,
  course VARCHAR(50)  NOT NULL,
  marks  INT DEFAULT 0
);
INSERT INTO students (name, course, marks) VALUES
('Asha Patil', 'Java', 88),
('Rohan Mehta', 'Python', 72),
('Sneha Kulkarni', 'Java', 65),
('Arjun Nair', 'MySQL', 91),
('Priya Sharma', 'Java', 79);`;

export default {
  lesson: 'day-06-hql-jpql-named-queries',
  minutes: 25,
  intro: 'Write HQL/JPQL queries with parameters, projections and aggregates, use named queries and paginate results.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'The entity `Student` is mapped to table `students` and field `marks` to column `total_marks`. Which HQL is correct?',
      options: [
        'SELECT * FROM students WHERE total_marks > 75',
        'from Student s where s.marks > 75',
        'from students s where s.total_marks > 75',
        'from Student s where s.total_marks > 75',
      ],
      answer: 1,
      explain: 'HQL/JPQL uses **entity and field names**, not table and column names. `from Student s where s.marks > 75` is valid HQL (the `select s` can be omitted in HQL; JPQL needs it). Hibernate translates it into SQL with the real table and column names.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the named parameter:
\`\`\`
List<Student> list = session.createQuery(
        "from Student s where s.course = ____", Student.class)
    .setParameter("course", "Java")
    .getResultList();
\`\`\``,
      example: { title: 'positional parameter', code: 'session.createQuery("from Student s where s.marks > ?1", Student.class)\n       .setParameter(1, 75);' },
      accept: [':course'],
      caseSensitive: true,
      explain: 'Named parameters start with a colon, `:course`, and the name must match `setParameter("course", ...)`. Never build HQL by string concatenation (`"... = \'" + course + "\'"`): that brings back SQL (HQL) injection.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Hibernate translates this HQL into SQL:\n```\nselect s.name from Student s where s.marks > 75 order by s.marks desc\n```\nWrite the equivalent **SQL** for the `students` table and run it.',
      example: { title: 'HQL → SQL', code: "-- HQL: select c.title from Course c where c.fees < 5000\nSELECT title FROM courses WHERE fees < 5000;" },
      setup: STUDENTS,
      starter: '-- SELECT ...\n',
      solution: 'SELECT name FROM students WHERE marks > 75 ORDER BY marks DESC;',
      ordered: true,
      explain: 'The entity `Student` becomes table `students`, the alias stays, and fields become columns. The result is Arjun Nair, Asha Patil, Priya Sharma. With `show_sql=true` you can compare your SQL with the one Hibernate prints.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Data: Asha (Java), Rohan (Python), Sneha (Java), Arjun (MySQL), Priya (Java). What does this print?',
      example: { title: 'projection rows', text: 'When you select several values, each row comes back as an `Object[]`: `row[0]` is the first selected value, `row[1]` the second.' },
      code: `List<Object[]> rows = session.createQuery(
        "select s.course, count(s) from Student s group by s.course order by s.course",
        Object[].class)
    .getResultList();
for (Object[] row : rows) {
    System.out.println(row[0] + " = " + row[1]);
}`,
      expected: 'Java = 3\nMySQL = 1\nPython = 1',
      explain: 'HQL supports `group by`, aggregate functions and `order by` just like SQL. Courses are sorted alphabetically (Java, MySQL, Python). `count(s)` returns a `Long`. For type safety you could use a DTO: `select new com.upskillr.dto.CourseCount(s.course, count(s)) ...`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The student list shows **5 rows per page**. Complete the call for **page 3**:
\`\`\`
query.setFirstResult(____);
query.setMaxResults(5);
\`\`\``,
      example: { title: 'the formula', code: 'int first = (page - 1) * pageSize;' },
      accept: ['10', '(3-1)*5', '(3 - 1) * 5', '2*5', '2 * 5'],
      explain: '`setFirstResult` is the zero-based **offset**: (3 − 1) × 5 = 10, so page 3 shows rows 11-15. `setMaxResults` is the page size. Hibernate turns this into `LIMIT 5 OFFSET 10` for MySQL.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **@NamedQuery** are TRUE? (choose all that apply)',
      options: [
        'It is declared on the entity class, e.g. @NamedQuery(name = "Student.byCourse", query = "from Student s where s.course = :course")',
        'Named queries are checked when the SessionFactory starts, so a typo fails early',
        'You run it with session.createNamedQuery("Student.byCourse", Student.class)',
        'A named query cannot have parameters',
        'Named queries are written in native SQL only',
      ],
      answers: [0, 1, 2],
      explain: 'Named queries are HQL/JPQL (use `@NamedNativeQuery` for SQL), can have parameters and are validated at startup, which catches mistakes before any user hits them. The `Entity.purpose` naming convention keeps them organised.',
    },
  ],
};
