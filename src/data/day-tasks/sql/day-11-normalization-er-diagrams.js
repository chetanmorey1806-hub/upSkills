export default {
  lesson: 'day-11-normalization-er-diagrams',
  minutes: 30,
  intro: 'Spot anomalies, normalise tables to 1NF, 2NF and 3NF, model many-to-many relationships with a junction table and rebuild reports with joins.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A table `orders(order_id, customer_name, customer_phone, product, qty)` repeats the phone number on every order. When a customer changes their phone, some rows get updated and some do not. What is this called?',
      options: ['Insert anomaly', 'Update anomaly', 'Delete anomaly', 'Referential integrity'],
      answer: 1,
      explain: 'An **update anomaly**: the same fact is stored many times, so updating it in only some places leaves the data inconsistent. Moving customer details to a `customers` table (stored once, referenced by id) fixes it.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about normal forms are TRUE? (choose all that apply)',
      options: ['1NF: every cell holds one atomic value (no lists like "Maths, Physics")', '2NF: no non-key column depends on only **part** of a composite key', '3NF: no non-key column depends on another non-key column (no transitive dependency)', 'BCNF: every determinant is a candidate key', 'Normalisation always makes read queries faster'],
      answers: [0, 1, 2, 3],
      explain: 'Normalisation removes redundancy and anomalies, but more tables means more joins, so reporting systems sometimes **denormalise** on purpose (e.g. star schemas in Power BI). It is a trade-off, not a speed guarantee.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`employees(emp_id, name, dept_id, dept_name)` – `dept_name` depends on `dept_id`, which depends on `emp_id`. Which normal form does this violate, and what is the fix?',
      options: ['1NF – split the name into two columns', '2NF – add a composite key', '3NF – move dept_name to a departments(dept_id, dept_name) table', 'It is already in BCNF'],
      answer: 2,
      explain: 'emp_id → dept_id → dept_name is a **transitive dependency**, which breaks 3NF. Keep `dept_id` in employees as a foreign key and store each department name once in `departments`.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 7,
      q: '**1NF fix.** `student_courses` stores a comma-separated list. The normalised table `enrolments(student, course)` has already been filled from it. Show how many students take each course: `course`, `students`, sorted by course name.',
      example: { title: 'counting in a normalised table', code: 'SELECT tag, COUNT(*) AS posts FROM post_tags GROUP BY tag ORDER BY tag;' },
      setup: `CREATE TABLE student_courses (student TEXT, courses TEXT);
INSERT INTO student_courses VALUES ('Asha', 'SQL, Python'), ('Ravi', 'Python'), ('Neha', 'SQL, Excel, Python');
CREATE TABLE enrolments (student TEXT, course TEXT);
INSERT INTO enrolments VALUES ('Asha', 'SQL'), ('Asha', 'Python'), ('Ravi', 'Python'), ('Neha', 'SQL'), ('Neha', 'Excel'), ('Neha', 'Python');`,
      starter: '-- SELECT ... FROM enrolments ...\n',
      solution: 'SELECT course, COUNT(*) AS students FROM enrolments GROUP BY course ORDER BY course;',
      ordered: true,
      explain: 'With one value per cell the question becomes a simple GROUP BY. Against the comma list you would need fragile `LIKE \'%SQL%\'` tricks (which would also match "MySQL") – exactly why 1NF forbids lists in a cell.',
    },
    {
      type: 'code',
      lang: 'sql',
      mins: 8,
      q: '**Many-to-many.** Students and courses are linked by the junction table `enrolments(student_id, course_id)`. Show `student` name and `course` title for every enrolment, sorted by student name then course title.',
      example: { title: 'joining through a junction table', code: 'SELECT a.name, b.title\nFROM authors a\nJOIN book_authors ba ON ba.author_id = a.id\nJOIN books b ON b.id = ba.book_id;' },
      setup: `CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT, fee INTEGER);
CREATE TABLE enrolments (student_id INTEGER REFERENCES students(id), course_id INTEGER REFERENCES courses(id), PRIMARY KEY (student_id, course_id));
INSERT INTO students VALUES (1, 'Asha'), (2, 'Ravi'), (3, 'Neha');
INSERT INTO courses VALUES (1, 'SQL', 4000), (2, 'Python', 6000), (3, 'Power BI', 5000);
INSERT INTO enrolments VALUES (1, 1), (1, 2), (2, 2), (3, 1), (3, 3);`,
      starter: '-- SELECT ...\n',
      solution: 'SELECT s.name AS student, c.title AS course FROM enrolments e JOIN students s ON s.id = e.student_id JOIN courses c ON c.id = e.course_id ORDER BY s.name, c.title;',
      ordered: true,
      explain: 'A many-to-many relationship (a student takes many courses, a course has many students) needs a **junction table** whose composite primary key `(student_id, course_id)` prevents duplicate enrolments. In an ER diagram this is the M:N relationship turned into its own table.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In an ER diagram, a customer can place many orders but each order belongs to one customer. What is the **cardinality** of customer → orders? (write it like 1:1, 1:N or M:N)',
      accept: ['1:N', '1:n', '1:M', '1:m', '1 : N', 'one-to-many', 'one to many', '1-N', '1-to-many'],
      explain: '**One-to-many (1:N)**: implement it by putting the foreign key `customer_id` on the "many" side (orders). 1:1 can share or reference a key on either side; M:N needs a junction table.',
    },
  ],
};
