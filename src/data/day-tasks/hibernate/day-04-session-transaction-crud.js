export default {
  lesson: 'day-04-session-transaction-crud',
  minutes: 22,
  intro: 'Use SessionFactory, Session and Transaction correctly and practise the Hibernate CRUD methods, dirty checking and rollback.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'How many `SessionFactory` objects should a typical application create?',
      options: ['One per request', 'One per database table', 'One for the whole application (per database)', 'One per entity object'],
      answer: 2,
      explain: 'A SessionFactory is **expensive** to build (reads config, mappings, creates the connection pool) and **thread-safe**, so create it once (e.g. in `HibernateUtil`) and share it. Sessions are cheap, not thread-safe and short-lived: open one per unit of work.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the JPA-standard method that saves a **new** student in Hibernate 6:
\`\`\`
Transaction tx = session.beginTransaction();
session.____(student);
tx.commit();
\`\`\``,
      example: { title: 'reading by id', code: 'Student s = session.find(Student.class, 1); // or session.get(Student.class, 1)' },
      accept: ['persist', 'persist(student)', 'persist(student);'],
      caseSensitive: true,
      explain: '`persist()` is the JPA method and the recommended one in Hibernate 6. The old `save()`, `update()` and `saveOrUpdate()` are **deprecated** in Hibernate 6. After commit the generated id is available through `student.getId()`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Student 1 has `marks = 70` in the database. What does this program print?',
      example: { title: 'dirty checking', text: 'A **persistent** object (loaded inside an open session) is watched by Hibernate. Changing its fields is enough: at flush/commit Hibernate writes an UPDATE automatically.' },
      code: `try (Session s1 = sf.openSession()) {
    Transaction tx = s1.beginTransaction();
    Student st = s1.get(Student.class, 1);
    st.setMarks(85);          // no update() call!
    tx.commit();
}
try (Session s2 = sf.openSession()) {
    Transaction tx = s2.beginTransaction();
    Student st = s2.get(Student.class, 1);
    st.setMarks(99);
    tx.rollback();
}
try (Session s3 = sf.openSession()) {
    System.out.println(s3.get(Student.class, 1).getMarks());
}`,
      expected: '85',
      explain: 'In session 1 Hibernate notices the change (dirty checking) and runs UPDATE at commit, so 85 is saved. In session 2 the change to 99 is **rolled back** (nothing is written). Session 3 reads fresh data from the database: 85.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **flush vs commit** are TRUE? (choose all that apply)',
      options: [
        'flush() sends pending SQL to the database but the transaction can still be rolled back',
        'commit() flushes automatically and then makes the changes permanent',
        'After flush() other transactions can always see the changes',
        'Hibernate also flushes automatically before running a query that could be affected (FlushMode.AUTO)',
        'flush() closes the session',
      ],
      answers: [0, 1, 3],
      explain: 'flush = "run the SQL now"; commit = "flush + make permanent". Flushed but uncommitted changes are invisible to other transactions (under normal isolation) and disappear on rollback. Flush never closes the session.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the safe CRUD template: in the \`catch\` block, undo the work.
\`\`\`
Transaction tx = null;
try (Session session = sf.openSession()) {
    tx = session.beginTransaction();
    session.remove(session.get(Student.class, id));
    tx.commit();
} catch (Exception e) {
    if (tx != null) tx.____();
    throw e;
}
\`\`\``,
      example: { title: 'the happy path', code: 'tx = session.beginTransaction();\n// work\ntx.commit();' },
      accept: ['rollback', 'rollback()', 'rollback();'],
      caseSensitive: true,
      explain: 'If anything fails between begin and commit, call `tx.rollback()` so the database is left unchanged and the connection is released cleanly. Swallowing the exception silently is the other classic mistake: rethrow or log it.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which method deletes an entity in Hibernate 6 (JPA style)?',
      options: ['session.delete(student)', 'session.remove(student)', 'session.drop(student)', 'session.erase(student)'],
      answer: 1,
      explain: '`remove()` is the JPA method (Hibernate\'s old `delete()` is deprecated). The object must be **persistent** (loaded in the current session); to delete by id you first `get`/`getReference` it. The DELETE runs at flush/commit.',
    },
  ],
};
