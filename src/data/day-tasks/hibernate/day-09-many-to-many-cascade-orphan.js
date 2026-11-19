const COLLEGE = `CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50) NOT NULL);
CREATE TABLE courses  (id INT PRIMARY KEY, title VARCHAR(50) NOT NULL);
CREATE TABLE student_course (
  student_id INT NOT NULL,
  course_id  INT NOT NULL,
  PRIMARY KEY (student_id, course_id)
);
INSERT INTO students VALUES (1, 'Asha Patil'), (2, 'Rohan Mehta'), (3, 'Sneha Kulkarni'), (4, 'Arjun Nair');
INSERT INTO courses VALUES (10, 'Java'), (20, 'Spring'), (30, 'Hibernate');
INSERT INTO student_course VALUES (1, 10), (1, 20), (2, 20), (3, 10), (3, 30), (4, 20);`;

export default {
  lesson: 'day-09-many-to-many-cascade-orphan',
  minutes: 25,
  intro: 'Map many-to-many with a join table, choose cascade types carefully and use orphanRemoval.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Complete the join table mapping on the owning side (Student):
\`\`\`
@ManyToMany
@JoinTable(name = "student_course",
           joinColumns = @JoinColumn(name = "student_id"),
           ____ = @JoinColumn(name = "course_id"))
private Set<Course> courses = new HashSet<>();
\`\`\``,
      example: { title: 'the inverse side (Course)', code: '@ManyToMany(mappedBy = "courses")\nprivate Set<Student> students = new HashSet<>();' },
      accept: ['inverseJoinColumns'],
      caseSensitive: true,
      explain: '`joinColumns` is the FK pointing to **this** entity (student_id), `inverseJoinColumns` is the FK pointing to the **other** entity (course_id). Use a `Set` for many-to-many: with a `List` Hibernate deletes and re-inserts all rows on every change.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'Calling `springCourse.getStudents()` makes Hibernate query through the join table. Write that query: the `name` of every student enrolled in **Spring**, sorted by name.',
      example: { title: 'two joins through a link table', code: 'SELECT a.name\nFROM authors a\nJOIN book_author ba ON ba.author_id = a.id\nJOIN books b ON b.id = ba.book_id\nWHERE b.title = \'Java Basics\';' },
      setup: COLLEGE,
      starter: '-- SELECT s.name FROM students s JOIN student_course sc ... JOIN courses c ...\n',
      solution: "SELECT s.name\nFROM students s\nJOIN student_course sc ON sc.student_id = s.id\nJOIN courses c ON c.id = sc.course_id\nWHERE c.title = 'Spring'\nORDER BY s.name;",
      ordered: true,
      explain: 'A many-to-many needs a third table with two foreign keys. To go from course to students you join courses → student_course → students. Result: Arjun Nair, Asha Patil, Rohan Mehta.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **cascade types** are TRUE? (choose all that apply)',
      options: [
        'CascadeType.PERSIST: persisting the parent also persists new children',
        'CascadeType.REMOVE: removing the parent also removes its children',
        'CascadeType.ALL includes PERSIST, MERGE, REMOVE, REFRESH and DETACH',
        'CascadeType.REMOVE on @ManyToMany (Student → Course) is a good idea',
        'Cascade is normally put on the parent side (e.g. Order → OrderItem)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'On many-to-many, REMOVE would delete a **shared** Course (and break other students\' enrolments) when one student is deleted. Use cascade from a real parent to children it owns, like Order → OrderItems or Post → Comments.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Order has `@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true) List<OrderItem> items`. Order 1 has **3 items** in the database. What does this print?',
      example: { title: 'orphan', text: 'An **orphan** is a child that was removed from its parent\'s collection. With `orphanRemoval = true` Hibernate deletes its row at flush.' },
      code: `try (Session session = sf.openSession()) {
    Transaction tx = session.beginTransaction();
    Order order = session.get(Order.class, 1);
    order.getItems().remove(0);
    tx.commit();

    Long n = session.createQuery(
            "select count(i) from OrderItem i where i.order.id = 1", Long.class)
        .getSingleResult();
    System.out.println("Items in DB: " + n);
}`,
      expected: 'Items in DB: 2',
      explain: 'Removing the item from the collection makes it an orphan, and `orphanRemoval = true` issues a DELETE at commit, leaving 2 rows. Without orphanRemoval nothing would change in the database (the item still has order_id = 1), and the count would stay 3.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'The college now needs to store **enrolled_on** date and **grade** for every student-course pair. What should you do?',
      options: [
        'Add the fields to Student',
        'Add the fields to Course',
        'Replace @ManyToMany with a join entity Enrollment (two @ManyToOne) that has enrolledOn and grade',
        'It is impossible in Hibernate',
      ],
      answer: 2,
      explain: 'A plain `@ManyToMany` join table can only hold the two foreign keys. As soon as the link has its own data, model it as an entity: Student 1-N **Enrollment** N-1 Course. This is the most common real-world refactoring of many-to-many.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between **CascadeType.REMOVE** and **orphanRemoval = true**?',
      options: [
        'They are identical',
        'REMOVE deletes children when the parent is deleted; orphanRemoval also deletes a child when it is just taken out of the parent\'s collection',
        'orphanRemoval only works with @ManyToMany',
        'REMOVE deletes the parent when a child is deleted',
      ],
      answer: 1,
      explain: 'Both delete children when the parent is removed, but only **orphanRemoval** reacts to `parent.getChildren().remove(child)` or setting a one-to-one reference to null. It is meant for children that cannot exist without their parent.',
    },
  ],
};
