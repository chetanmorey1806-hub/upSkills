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
  lesson: 'day-07-criteria-api',
  minutes: 25,
  intro: 'Build type-safe and dynamic queries with CriteriaBuilder, CriteriaQuery, Root and Predicate.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the Criteria API, what does `Root<Student> root = cq.from(Student.class);` represent?',
      options: [
        'The database root user',
        'The entity in the FROM clause; you use it to reach fields like root.get("marks")',
        'The first row of the result',
        'The SessionFactory',
      ],
      answer: 1,
      explain: '`CriteriaBuilder` (from `session.getCriteriaBuilder()`) creates queries and predicates, `CriteriaQuery<Student>` is the query, and `Root<Student>` is the "from Student s" part. `root.get("marks")` is like `s.marks` in HQL.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the predicate "marks greater than 80":
\`\`\`
cq.select(root).where(cb.____(root.get("marks"), 80));
\`\`\``,
      example: { title: 'other predicates', code: 'cb.equal(root.get("course"), "Java")\ncb.like(root.get("name"), "A%")\ncb.between(root.get("marks"), 60, 80)' },
      accept: ['gt', 'greaterThan'],
      caseSensitive: true,
      explain: 'For numbers you can use `cb.gt` / `cb.ge` / `cb.lt` / `cb.le`; `greaterThan` / `greaterThanOrEqualTo` also work and are needed for non-numeric comparable types like dates. Using the Java operator `>` is impossible because these build query objects.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This search method adds a predicate only for filters that were actually filled in. What does `main` print?',
      example: { title: 'dynamic queries', text: 'Collect predicates in a `List<Predicate>`, then `cq.where(predicates.toArray(new Predicate[0]))`. With an empty list there is no WHERE clause at all.' },
      code: `static int countFilters(CriteriaBuilder cb, Root<Student> root,
                        String name, String course, Integer minMarks) {
    List<Predicate> p = new ArrayList<>();
    if (name != null && !name.isBlank()) p.add(cb.like(root.get("name"), "%" + name + "%"));
    if (course != null)                  p.add(cb.equal(root.get("course"), course));
    if (minMarks != null)                p.add(cb.ge(root.get("marks"), minMarks));
    return p.size();
}

// main
System.out.println("Predicates: " + countFilters(cb, root, null, "Java", 60));
System.out.println("Predicates: " + countFilters(cb, root, "   ", null, null));
System.out.println("Predicates: " + countFilters(cb, root, "Asha", "Java", null));`,
      expected: 'Predicates: 2\nPredicates: 0\nPredicates: 2',
      explain: 'Call 1: course and minMarks → 2. Call 2: the name is blank (`isBlank()` is true for spaces) and the others are null → 0, so the query returns all students. Call 3: name and course → 2. This is exactly why Criteria is preferred for search screens with optional filters.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Write the **SQL** that this Criteria query produces, and run it:\n```\ncq.select(root)\n  .where(cb.and(cb.equal(root.get("course"), "Java"),\n                cb.ge(root.get("marks"), 70)))\n  .orderBy(cb.asc(root.get("name")));\n```',
      example: { title: 'Criteria → SQL', code: "-- cb.lt(root.get(\"price\"), 500), cb.desc(root.get(\"price\"))\nSELECT * FROM products WHERE price < 500 ORDER BY price DESC;" },
      setup: STUDENTS,
      starter: '-- SELECT * FROM students ...\n',
      solution: "SELECT * FROM students WHERE course = 'Java' AND marks >= 70 ORDER BY name ASC;",
      ordered: true,
      explain: '`cb.and` → AND, `cb.equal` → `=`, `cb.ge` → `>=`, `cb.asc` → `ORDER BY ... ASC`. Result: Asha Patil (88) and Priya Sharma (79); Sneha (65) fails the marks check.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are real `CriteriaBuilder` methods? (choose all that apply)',
      options: ['equal', 'like', 'between', 'and', 'desc', 'whereEquals', 'greaterThanEquals'],
      answers: [0, 1, 2, 3, 4],
      explain: 'Real ones include `equal`, `notEqual`, `like`, `between`, `gt/ge/lt/le`, `greaterThan`, `greaterThanOrEqualTo`, `and`, `or`, `not`, `isNull`, `asc`, `desc`, `count`, `avg`. `whereEquals` and `greaterThanEquals` do not exist.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When is the **Criteria API** a better choice than HQL?',
      options: [
        'For short fixed queries like "from Student"',
        'When the query is built at runtime from optional filters (search forms)',
        'When you need the fastest possible query',
        'Never; it is deprecated',
      ],
      answer: 1,
      explain: 'Fixed queries read best as HQL/named queries. Criteria shines for **dynamic** queries: no fragile string concatenation of "and ..." pieces, and compile-time checking (especially with the JPA static metamodel `Student_.marks`). Performance is the same: both become SQL.',
    },
  ],
};
