export default {
  lesson: 'day-05-entity-states-get-load-merge',
  minutes: 22,
  intro: 'Practise the four entity states, get vs load/getReference, persist vs merge and the first-level cache.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which state descriptions are CORRECT? (choose all that apply)',
      options: [
        'Transient: created with new, not yet known to any session, no row in the table',
        'Persistent: associated with an open session; changes are tracked and saved at flush',
        'Detached: it was persistent, but its session was closed (or it was evicted)',
        'Removed: scheduled for deletion; the DELETE runs at flush/commit',
        'Detached objects are still tracked by dirty checking',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Only **persistent** objects are tracked. Changing a detached object does nothing until you `merge()` it into a session. `new Student()` is transient, `persist()` makes it persistent, closing the session detaches it, `remove()` marks it removed.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'There is **no student with id 999**. What happens?\n`Student a = session.get(Student.class, 999);`\n`Student b = session.getReference(Student.class, 999);` followed by `b.getName()`',
      options: [
        'Both return null',
        'get returns null; getReference returns a proxy and b.getName() throws an exception (ObjectNotFound / EntityNotFound)',
        'Both throw an exception immediately',
        'get throws; getReference returns null',
      ],
      answer: 1,
      explain: '`get()`/`find()` hits the database at once and returns **null** if not found. `getReference()` (old `load()`) returns a lazy **proxy** without a query; the SELECT happens on first access and fails if the row does not exist. Use getReference only when you are sure the row exists, e.g. to set a foreign key.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Statistics are enabled. Student 1 exists. What does this print?',
      example: { title: 'first-level cache', text: 'Each Session keeps a map of the entities it has loaded (the persistence context). Asking for the same id again returns the **same object** without a new SELECT. `session.clear()` empties that map.' },
      code: `try (Session session = sf.openSession()) {
    Student a = session.get(Student.class, 1);
    Student b = session.get(Student.class, 1);
    System.out.println(a == b);
    session.clear();
    Student c = session.get(Student.class, 1);
    System.out.println(a == c);
    System.out.println(sf.getStatistics().getPrepareStatementCount());
}`,
      expected: 'true\nfalse\n2',
      explain: 'The second `get` is served from the first-level cache: same object, no SQL. After `clear()` the cache is empty, so the third `get` runs a new SELECT and creates a **new** object. Total: 2 SQL statements.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`detached` is a Student loaded in an earlier, now closed session. What does this print?',
      example: { title: 'merge returns a copy', code: 'Student managed = session.merge(detached);\n// use "managed" from now on, not "detached"' },
      code: `try (Session session = sf.openSession()) {
    Transaction tx = session.beginTransaction();
    detached.setMarks(90);
    Student managed = session.merge(detached);
    System.out.println(managed == detached);
    System.out.println(session.contains(detached));
    System.out.println(session.contains(managed));
    tx.commit();
}`,
      expected: 'false\nfalse\ntrue',
      explain: '`merge()` copies the state of the detached object onto a **persistent instance** (loaded or created in this session) and returns that instance. The object you passed in stays detached. The marks 90 are saved at commit because they were copied into `managed`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which Session method makes **one** persistent object detached, so that later changes to it are not saved? (method name)',
      example: { title: 'detaching everything', code: 'session.clear(); // detaches ALL objects of this session' },
      accept: ['detach', 'evict', 'detach()', 'evict()', 'session.detach', 'session.evict'],
      caseSensitive: true,
      explain: '`session.detach(obj)` (JPA name) or `session.evict(obj)` (Hibernate name) removes one object from the persistence context. `clear()` detaches all objects and `close()` ends the session.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A REST API receives a Student with an **existing id** (detached) and must update it. Which call is correct?',
      options: ['session.persist(student)', 'session.merge(student)', 'session.get(student)', 'session.remove(student)'],
      answer: 1,
      explain: '`persist()` is for **new** (transient) objects; passing a detached object with an id throws `PersistentObjectException` / `EntityExistsException`. `merge()` handles detached objects and inserts if the id does not exist.',
    },
  ],
};
