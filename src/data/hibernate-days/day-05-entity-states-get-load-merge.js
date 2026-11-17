export default {
  id: 'day-05-entity-states-get-load-merge',
  title: 'Entity States (transient, persistent, detached, removed), get vs load, persist/merge',
  module: 'Module 1: Hibernate Basics',
  day: 5,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Learn the four lifecycle states of an entity, the methods that move objects between them, the difference between get() and load()/getReference() proxies, and when to use persist() versus merge().`,
  objectives: [
    `Identify transient, persistent (managed), detached and removed states`,
    `Use persist, merge, detach, evict, clear, remove and refresh correctly`,
    `Explain get() vs load()/getReference() and Hibernate proxies`,
    `Explain persist() vs merge() and the "detached entity passed to persist" error`,
    `Use session.contains() and Hibernate.isInitialized() to verify behaviour`,
  ],
  theory: [
    {
      heading: `The Four Entity States`,
      content: `Every entity object is always in one of four states relative to a Session:

1. TRANSIENT – just created with new; Hibernate does not know it; no row in DB, usually no id.
2. PERSISTENT (MANAGED) – associated with an open Session; it is in the persistence context; any change is auto-saved at flush (dirty checking).
3. DETACHED – was persistent, but the Session was closed/cleared or the object was evicted. It has an id and a DB row, but changes are NOT tracked.
4. REMOVED – scheduled for deletion with remove(); the DELETE runs at flush.

Analogy: a hotel guest.
  Transient = person on the street (hotel doesn't know them)
  Persistent = checked-in guest (hotel tracks everything they order)
  Detached = guest who checked out (still has a record, but new orders aren't billed)
  Removed = guest whose booking is being cancelled`,
      syntax: `             new Student()
                  |
             [TRANSIENT]
                  | persist() / merge()
                  v
   get()/find()/query --> [PERSISTENT] <--- merge() --- [DETACHED]
                  |   |                                    ^
          remove()|   +--- close()/clear()/detach() -------+
                  v
              [REMOVED] --flush/commit--> row deleted (object becomes transient)`,
    },
    {
      heading: `Methods that Change State`,
      content: `Moving objects between states:`,
      points: [
        `persist(obj): transient -> persistent. INSERT at flush (IDENTITY: immediately)`,
        `get()/find()/HQL: DB row -> persistent object`,
        `detach(obj) / evict(obj): persistent -> detached (only that object)`,
        `clear(): detaches ALL objects in the session`,
        `close(): session ends, all its objects become detached`,
        `merge(obj): copies state of a detached (or transient) object onto a managed instance and RETURNS that managed instance; the argument stays detached`,
        `remove(obj): persistent -> removed`,
        `refresh(obj): re-reads the row from DB, overwriting unsaved changes`,
        `contains(obj): true if the object is managed by this session`,
      ],
    },
    {
      heading: `get() vs load() / getReference()`,
      content: `get(Class, id) (and JPA find) hits the database immediately (unless the object is already in the session) and returns the real object, or null if the row does not exist.

load(Class, id) (deprecated in Hibernate 6) and getReference(Class, id) return a PROXY – a fake subclass object holding only the id. No SQL runs until you call a non-id getter. If the row doesn't exist you get ObjectNotFoundException / EntityNotFoundException at that moment.

Analogy: get() is buying the actual book; getReference() is getting a library token with the book number – you only fetch the book when you actually want to read it.

When to use getReference(): when you only need the object to set a relationship, e.g. order.setCustomer(session.getReference(Customer.class, 5)) – no SELECT needed.`,
      syntax: `                get() / find()          load() / getReference()
SQL timing      immediately             when a non-id property is accessed
Returns         real object             proxy (subclass)
Missing row     returns null            throws ObjectNotFoundException later
Use for         reading data            setting associations (FK) cheaply`,
    },
    {
      heading: `persist() vs merge()`,
      content: `persist(obj):
- Makes THE SAME object managed. Returns void.
- Meant for NEW (transient) objects.
- If the object is detached (has an id from DB), throws PersistentObjectException: "detached entity passed to persist".

merge(obj):
- Looks for a managed instance with the same id in the session; if not found, SELECTs it from DB (or creates a new one if no row).
- Copies the state of obj onto that managed instance.
- RETURNS the managed instance; obj itself stays detached.
- Used for re-attaching detached objects, e.g. data coming from a web form.

Common bug: calling merge(s) and then modifying s instead of the returned copy – changes are lost.`,
      syntax: `Student managed = session.merge(detached);   // use 'managed' afterwards
managed.setName("New");                         // tracked
detached.setName("Lost");                       // NOT tracked`,
      tip: `Old Hibernate methods update(), saveOrUpdate() and save() are deprecated in Hibernate 6. Use persist() for new objects and merge() for detached ones.`,
    },
    {
      heading: `Persistence Context = First-Level Cache`,
      content: `The persistence context is a map inside the Session: (EntityClass, id) -> object. It guarantees that within one session, the same row is represented by exactly one Java object (session.get(Student.class,1) == session.get(Student.class,1) is true) and avoids repeated SELECTs. It also stores the snapshot used for dirty checking. More on caching on Day 11.`,
    },
    {
      heading: `Common Mistakes`,
      content: `Mistakes around states cause most beginner Hibernate bugs.`,
      points: [
        `Changing a detached object and expecting an UPDATE – you must merge() it`,
        `persist() on an object that has an id -> "detached entity passed to persist"`,
        `Accessing a lazy proxy after the session is closed -> LazyInitializationException`,
        `Ignoring merge()'s return value`,
        `Calling remove() on a detached object -> IllegalArgumentException "Removing a detached instance"; merge or load first`,
      ],
    },
  ],
  examples: [
    {
      title: `Watching an Object Move Through All States`,
      scenario: `Create a student and print its state using contains() at each stage.`,
      steps: [
        `Reuse the Student entity and HibernateUtil (hbm2ddl.auto=create)`,
        `Create class com.demo.StatesApp`,
        `Run and read the comments next to each output line`,
      ],
      code: `SessionFactory sf = HibernateUtil.getSessionFactory();
Student st = new Student("Asha", "asha@mail.com");
System.out.println("1 Transient, id=" + st.getId());

Session s1 = sf.openSession();
Transaction tx = s1.beginTransaction();
s1.persist(st);
System.out.println("2 Persistent? " + s1.contains(st) + ", id=" + st.getId());
st.setEmail("a1@mail.com");                    // tracked
tx.commit();
s1.close();
System.out.println("3 Detached (session closed)");

st.setEmail("a2@mail.com");                    // NOT tracked, nobody listening

Session s2 = sf.openSession();
Transaction tx2 = s2.beginTransaction();
System.out.println("4 In s2? " + s2.contains(st));
Student managed = s2.merge(st);                // re-attach
System.out.println("5 merge returned same object? " + (managed == st));
s2.remove(managed);
System.out.println("6 Removed, still in context? " + s2.contains(managed));
tx2.commit();
s2.close();`,
      result: `1 Transient, id=0
Hibernate: insert into students (email,name) values (?,?)
2 Persistent? true, id=1
Hibernate: update students set email=?,name=? where id=?
3 Detached (session closed)
4 In s2? false
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
5 merge returned same object? false
6 Removed, still in context? false
Hibernate: delete from students where id=?`,
      explanation: `IDENTITY makes the INSERT run at persist(). The email change while persistent produced an UPDATE at commit. The change while detached was not saved until merge(): merge SELECTed the row, copied a2@mail.com onto a new managed copy. Because the copy was then removed, Hibernate skips the pointless UPDATE and only issues the DELETE at commit. contains() is false for removed objects.`,
    },
    {
      title: `get() vs getReference() – Proxies and Lazy SQL`,
      scenario: `Compare when SQL fires and what happens for a missing id.`,
      steps: [
        `Insert one student (id 1) first`,
        `Run the code in a new session`,
        `Note that getReference prints no SQL until getName() is called`,
      ],
      code: `import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;

try (Session s = sf.openSession()) {
    System.out.println("--- get ---");
    Student a = s.get(Student.class, 1);
    System.out.println("Is proxy? " + (a instanceof HibernateProxy));
    System.out.println("Missing with get: " + s.get(Student.class, 99));
}

try (Session s = sf.openSession()) {
    System.out.println("--- getReference ---");
    Student r = s.getReference(Student.class, 1);
    System.out.println("Is proxy? " + (r instanceof HibernateProxy));
    System.out.println("Initialized? " + Hibernate.isInitialized(r));
    System.out.println("Id: " + r.getId());          // no SQL, id is known
    System.out.println("Name: " + r.getName());      // SQL fires now
    System.out.println("Initialized? " + Hibernate.isInitialized(r));

    Student missing = s.getReference(Student.class, 99);   // no error yet
    try {
        missing.getName();
    } catch (jakarta.persistence.PersistenceException e) {   // ObjectNotFoundException / EntityNotFoundException
        System.out.println("Missing with getReference: row not found");
    }
}`,
      result: `--- get ---
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Is proxy? false
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Missing with get: null
--- getReference ---
Is proxy? true
Initialized? false
Id: 1
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Name: Asha
Initialized? true
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Missing with getReference: row not found`,
      explanation: `get() queries immediately and returns null for a missing row. getReference() returns an uninitialised proxy; the id is available without SQL, any other getter triggers the SELECT. For a missing row an exception is thrown only when the proxy is initialised: org.hibernate.ObjectNotFoundException with the native Session (EntityNotFoundException when bootstrapped through JPA). Both are PersistenceException subclasses, so the catch works.`,
    },
    {
      title: `persist() on a Detached Object – the Classic Error`,
      scenario: `A web form sends back an existing student with id 1. Calling persist() fails; merge() works.`,
      steps: [
        `Create a Student with an existing id by setting it via a constructor or setter (add setId for this demo)`,
        `Call persist() and observe the exception`,
        `Replace with merge() and observe the SELECT + UPDATE`,
      ],
      code: `// Simulate a detached object coming from a form
Student fromForm = new Student("Asha Updated", "asha@mail.com");
fromForm.setId(1);

try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    try {
        s.persist(fromForm);
    } catch (jakarta.persistence.PersistenceException e) {
        // message contains: detached entity passed to persist: com.demo.entity.Student
        System.out.println("persist failed -> use merge()");
        tx.rollback();
    }
}

try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Student managed = s.merge(fromForm);
    tx.commit();
    System.out.println("merge ok: " + managed);
}`,
      result: `persist failed -> use merge()
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Hibernate: update students set email=?,name=? where id=?
merge ok: Student[1, Asha Updated, asha@mail.com]`,
      explanation: `The object has a generated id already, so Hibernate treats it as detached and refuses persist() with PersistentObjectException, message "detached entity passed to persist" (a PersistenceException subclass; via JPA it may be wrapped or reported as EntityExistsException). merge() loads the current row, copies the new values and updates it.`,
    },
    {
      title: `detach(), clear() and refresh()`,
      scenario: `Control the persistence context manually.`,
      steps: [
        `Load student 1 in a session`,
        `Change name, detach it, commit – no UPDATE`,
        `Load again, change name, refresh – change is discarded`,
      ],
      code: `try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Student a = s.get(Student.class, 1);
    a.setName("Changed-1");
    s.detach(a);                                  // stop tracking
    tx.commit();                                  // no UPDATE
    System.out.println("After detach commit: " + a.getName());

    Student b = s.get(Student.class, 1);          // SELECT again (not in context)
    System.out.println("Same object? " + (a == b) + ", DB name=" + b.getName());

    b.setName("Changed-2");
    s.refresh(b);                                 // reload from DB, discard change
    System.out.println("After refresh: " + b.getName());

    s.clear();                                    // detach everything
    System.out.println("Contains b? " + s.contains(b));
}`,
      result: `Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
After detach commit: Changed-1
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Same object? false, DB name=Asha Updated
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
After refresh: Asha Updated
Contains b? false`,
      explanation: `detach() removed a from the context so dirty checking ignored it; the DB still has "Asha Updated" from the previous example. refresh() re-ran the SELECT and overwrote the unsaved change. clear() detached every object (useful in batch jobs to free memory).`,
    },
  ],
  interview: [
    { q: `What are the entity states in Hibernate?`, a: `Transient (new, not associated with a session), Persistent/Managed (associated with an open session, tracked), Detached (was persistent, session closed or evicted) and Removed (scheduled for deletion).`, level: 'Easy' },
    { q: `Difference between get() and load()?`, a: `get() hits the DB immediately and returns the real object or null. load()/getReference() returns a proxy without SQL; it loads on first non-id access and throws ObjectNotFoundException if the row is missing.`, level: 'Easy' },
    { q: `When would you use getReference()?`, a: `When you need an entity only as a reference to set a foreign key (e.g. order.setCustomer(ref)), avoiding an unnecessary SELECT.`, level: 'Medium' },
    { q: `Difference between persist() and merge()?`, a: `persist() makes the given transient object managed and returns void; it fails for detached objects. merge() copies the state of a detached/transient object to a managed instance (loading or creating it) and returns that managed instance; the argument stays detached.`, level: 'Medium' },
    { q: `What causes "detached entity passed to persist"?`, a: `Calling persist() on an object whose id is already set (generated id) – Hibernate considers it detached. Use merge() instead, or don't set the id manually.`, level: 'Medium' },
    { q: `Difference between evict()/detach() and clear()?`, a: `evict()/detach() detach one object; clear() detaches all objects in the persistence context.`, level: 'Easy' },
    { q: `What does refresh() do?`, a: `Re-reads the entity state from the database, overwriting any unflushed changes in memory.`, level: 'Easy' },
    { q: `Does Hibernate save changes made to a detached object?`, a: `No. Detached objects are not tracked. You must merge() them into a session.`, level: 'Easy' },
    { q: `What is a Hibernate proxy?`, a: `A runtime-generated subclass of the entity (via ByteBuddy) that holds the id and a reference to the session, and loads the real data on first access. Used for lazy loading and getReference().`, level: 'Hard' },
    { q: `Within one session, is session.get(Student.class,1) == session.get(Student.class,1)?`, a: `Yes. The persistence context guarantees one Java instance per database identity per session (repeatable read), and the second call doesn't run SQL.`, level: 'Medium' },
    { q: `What happens to a removed entity after commit?`, a: `The row is deleted and the Java object becomes effectively transient; it can be garbage collected or re-persisted as a new row.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Write a program that prints the state (TRANSIENT / PERSISTENT / DETACHED) of a Student at five points using a helper method state(Session s, Student st).`,
      hint: `If st.getId()==0 -> transient; else if s != null && s.isOpen() && s.contains(st) -> persistent; else detached.`,
      solution: `static String state(Session s, Student st) {
    if (st.getId() == 0) return "TRANSIENT";
    if (s != null && s.isOpen() && s.contains(st)) return "PERSISTENT";
    return "DETACHED";
}

Student st = new Student("Kiran", "k@mail.com");
Session s = sf.openSession();
System.out.println(state(s, st));            // TRANSIENT
Transaction tx = s.beginTransaction();
s.persist(st);
System.out.println(state(s, st));            // PERSISTENT
s.detach(st);
System.out.println(state(s, st));            // DETACHED
Student m = s.merge(st);
System.out.println(state(s, m));             // PERSISTENT
tx.commit(); s.close();
System.out.println(state(s, m));             // DETACHED`,
    },
    {
      task: `Simulate a web "edit profile" flow: load a Student in session 1, close it, change the email in "UI", then save it in session 2 with merge(). Print the SQL you expect.`,
      hint: `merge does SELECT then UPDATE.`,
      solution: `Student s;
try (Session s1 = sf.openSession()) { s = s1.get(Student.class, 1); }   // SELECT
s.setEmail("new@mail.com");                                            // UI edit (detached)
try (Session s2 = sf.openSession()) {
    Transaction tx = s2.beginTransaction();
    Student managed = s2.merge(s);    // SELECT ... where id=?
    tx.commit();                      // update students set email=?,name=? where id=?
}`,
    },
    {
      task: `Create a Note entity with a @ManyToOne Student student and save a note for student 1 using getReference(), so that no SELECT runs on the students table.`,
      hint: `session.getReference(Student.class, 1) then note.setStudent(ref); persist note.`,
      solution: `@Entity @Table(name = "notes")
public class Note {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String text;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "student_id")
    private Student student;
    public Note() {}
    public Note(String text, Student st) { this.text = text; this.student = st; }
}

sf.inTransaction(s -> {
    Student ref = s.getReference(Student.class, 1);   // no SELECT
    s.persist(new Note("Bring ID card", ref));
});
// SQL: insert into notes (student_id,text) values (?,?)   -- only one statement`,
    },
    {
      task: `Explain (and prove with code) why this code loses the update: Student m = s.merge(d); d.setName("X"); tx.commit();`,
      hint: `Which object is managed?`,
      solution: `merge() returns a managed copy 'm'; 'd' stays detached. Changing d is not tracked.
Fix:
Student m = s.merge(d);
m.setName("X");      // change the managed instance
tx.commit();         // UPDATE fires`,
    },
  ],
  quiz: [
    { question: `An object created with new and never passed to a session is ...`, options: [`Persistent`, `Transient`, `Detached`, `Removed`], answer: 1, explanation: `Hibernate does not know about it yet.` },
    { question: `What does getReference() return for an existing row before any getter is called?`, options: [`null`, `The fully loaded entity`, `An uninitialised proxy`, `A List`], answer: 2, explanation: `It returns a lazy proxy; SQL runs on first non-id access.` },
    { question: `Which method returns a managed copy and leaves the argument detached?`, options: [`persist()`, `refresh()`, `detach()`, `merge()`], answer: 3, explanation: `merge copies state onto a managed instance and returns it.` },
    { question: `After session.close(), loaded entities become ...`, options: [`Detached`, `Transient`, `Removed`, `Deleted from DB`], answer: 0, explanation: `They keep their id and data but are no longer tracked.` },
    { question: `Which call throws "detached entity passed to persist"?`, options: [`merge(newObj)`, `persist(objWithExistingId)`, `get(cls, id)`, `remove(managedObj)`], answer: 1, explanation: `persist expects a transient object.` },
  ],
};
