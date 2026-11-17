export default {
  id: 'day-04-session-transaction-crud',
  title: 'SessionFactory, Session, Transaction, CRUD Operations',
  module: 'Module 1: Hibernate Basics',
  day: 4,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Understand the roles of SessionFactory, Session and Transaction, then build complete Create, Read, Update and Delete operations with a DAO class, proper rollback handling and the SQL Hibernate generates for each.`,
  objectives: [
    `Explain the lifecycle and thread-safety of SessionFactory, Session and Transaction`,
    `Perform CRUD with persist(), get()/find(), dirty checking / merge(), and remove()`,
    `Write the standard try-commit-catch-rollback pattern`,
    `Build a reusable StudentDao class`,
    `Read and list rows with a simple HQL query`,
  ],
  theory: [
    {
      heading: `SessionFactory – the Factory`,
      content: `SessionFactory is built once from Configuration. It holds compiled mappings, the connection pool, the second-level cache and statistics. It is heavy to create and thread-safe, so the whole application shares one instance per database.

Analogy: SessionFactory is a car factory. Building the factory takes months; once built it produces cars (Sessions) quickly.`,
      syntax: `SessionFactory sf = new Configuration().configure().buildSessionFactory();
// ... whole application lifetime ...
sf.close();   // at shutdown`,
      points: [
        `One per database; two databases -> two SessionFactories`,
        `Close it on application shutdown to release connections`,
      ],
    },
    {
      heading: `Session – the Unit of Work`,
      content: `A Session is a single-threaded, short-lived conversation with the database. It wraps a JDBC connection and owns the persistence context (first-level cache), which tracks every entity it loaded or saved.

Analogy: a Session is a shopping cart. You add, change and remove items; at checkout (commit/flush) everything is sent to the cashier (database) together.`,
      syntax: `Session session = sf.openSession();     // new session, you must close it
Session cur = sf.getCurrentSession();    // bound to context (needs current_session_context_class), auto-closed on commit
try (Session s = sf.openSession()) { ... } // Session is AutoCloseable`,
      points: [
        `NOT thread-safe – never share between threads or store in a static field`,
        `Keep it short: open, do the work, commit, close`,
        `In Hibernate 6, Session also implements jakarta.persistence.EntityManager`,
      ],
    },
    {
      heading: `Transaction – All or Nothing`,
      content: `A Transaction groups several DB operations so that either all succeed (commit) or none do (rollback). Hibernate requires a transaction for any write (persist/merge/remove); changes are only flushed to the DB on commit.

Standard pattern:
  Transaction tx = null;
  try {
      tx = session.beginTransaction();
      ... work ...
      tx.commit();
  } catch (Exception e) {
      if (tx != null) tx.rollback();
      throw e;
  }

Analogy: an ATM transfer – debit from A and credit to B must both happen, or neither.`,
      tip: `Hibernate 6 offers sf.inTransaction(session -> { ... }) and sf.fromTransaction(session -> value), which open, commit, rollback and close for you.`,
    },
    {
      heading: `CRUD Methods Cheat Sheet`,
      content: `Hibernate 6 recommends the JPA-style method names. The old save(), update(), saveOrUpdate() and delete() are deprecated.`,
      syntax: `CREATE : session.persist(obj)                      // INSERT (at flush, or immediately for IDENTITY)
READ   : session.get(Student.class, id)            // SELECT by id, returns null if not found
         session.find(Student.class, id)           // same, JPA name
         session.createQuery("from Student", Student.class).list()
UPDATE : load the object, call setters (dirty checking -> UPDATE at commit)
         session.merge(detachedObj)                // copy a detached object's state into the session
DELETE : session.remove(obj)                       // DELETE (object must be managed)`,
      points: [
        `Dirty checking: Hibernate keeps a snapshot of each loaded entity; at flush it compares and issues UPDATE only if something changed`,
        `No need to call any "update" method for an object loaded in the same session`,
        `remove() needs a managed object – load it first with get(), or use a HQL delete`,
      ],
    },
    {
      heading: `Flush vs Commit`,
      content: `flush() sends pending SQL (INSERT/UPDATE/DELETE) to the database but keeps the transaction open, so it can still be rolled back. commit() flushes and then commits the DB transaction permanently.

Hibernate flushes automatically (FlushMode.AUTO): before commit, and before a query whose result could be affected by pending changes.`,
    },
    {
      heading: `DAO Pattern with Hibernate`,
      content: `DAO (Data Access Object) keeps all database code in one class so the rest of the program just calls dao.save(s), dao.findById(1). This makes code testable and replaceable (e.g. move to Spring Data later).

Layer diagram in words:
  Main / Service  ->  StudentDao  ->  Session  ->  MySQL`,
    },
  ],
  examples: [
    {
      title: `Full CRUD in One Program`,
      scenario: `Insert a student, read it back in a new session, change the email, then delete it, printing the SQL for each step.`,
      steps: [
        `Reuse Student, HibernateUtil and hibernate.cfg.xml from Day 2 (set hbm2ddl.auto=create for a clean table)`,
        `Create class com.demo.CrudApp with main()`,
        `Run it (Eclipse: Run As > Java Application; IntelliJ: ▶)`,
        `Watch which SQL appears after each step`,
      ],
      code: `package com.demo;

import com.demo.entity.Student;
import com.demo.util.HibernateUtil;
import org.hibernate.*;

public class CrudApp {
    public static void main(String[] args) {
        SessionFactory sf = HibernateUtil.getSessionFactory();
        int id;

        // CREATE
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            Student st = new Student("Asha", "asha@mail.com");
            s.persist(st);
            tx.commit();
            id = st.getId();
            System.out.println("Created id " + id);
        }

        // READ (new session -> real SELECT)
        try (Session s = sf.openSession()) {
            Student st = s.get(Student.class, id);
            System.out.println("Read: " + st);
        }

        // UPDATE via dirty checking
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            Student st = s.get(Student.class, id);
            st.setEmail("asha.new@mail.com");      // no update() call needed
            tx.commit();
            System.out.println("Updated: " + st);
        }

        // DELETE
        try (Session s = sf.openSession()) {
            Transaction tx = s.beginTransaction();
            Student st = s.get(Student.class, id);
            s.remove(st);
            tx.commit();
            System.out.println("Deleted, now: " + s.get(Student.class, id));
        }
        HibernateUtil.shutdown();
    }
}`,
      result: `Hibernate: insert into students (email,name) values (?,?)
Created id 1
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Read: Student[1, Asha, asha@mail.com]
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Hibernate: update students set email=?,name=? where id=?
Updated: Student[1, Asha, asha.new@mail.com]
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Hibernate: delete from students where id=?
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Deleted, now: null`,
      explanation: `Each new session starts with an empty first-level cache, so get() runs a SELECT. The UPDATE appears at commit because dirty checking found the changed email (by default Hibernate updates all columns). After remove, get() queries again and returns null because the row is gone.`,
    },
    {
      title: `StudentDao with Rollback Handling`,
      scenario: `A reusable DAO that wraps each operation in a transaction and rolls back on error.`,
      steps: [
        `Create package com.demo.dao and class StudentDao`,
        `Create DaoApp that uses the DAO`,
        `Run; then try saving a Student whose name is null after adding nullable=false to see rollback`,
      ],
      code: `package com.demo.dao;

import com.demo.entity.Student;
import com.demo.util.HibernateUtil;
import org.hibernate.*;
import java.util.List;

public class StudentDao {
    private final SessionFactory sf = HibernateUtil.getSessionFactory();

    public void save(Student s) {
        Transaction tx = null;
        try (Session session = sf.openSession()) {
            tx = session.beginTransaction();
            session.persist(s);
            tx.commit();
        } catch (RuntimeException e) {
            if (tx != null && tx.isActive()) tx.rollback();
            throw e;
        }
    }

    public Student findById(int id) {
        try (Session session = sf.openSession()) {
            return session.get(Student.class, id);
        }
    }

    public List<Student> findAll() {
        try (Session session = sf.openSession()) {
            return session.createQuery("from Student order by id", Student.class).list();
        }
    }

    public void updateEmail(int id, String email) {
        sf.inTransaction(session -> {                 // Hibernate 6 helper
            Student s = session.get(Student.class, id);
            if (s != null) s.setEmail(email);
        });
    }

    public void delete(int id) {
        sf.inTransaction(session -> {
            Student s = session.get(Student.class, id);
            if (s != null) session.remove(s);
        });
    }
}

// ===== DaoApp.java =====
package com.demo;
import com.demo.dao.StudentDao;
import com.demo.entity.Student;

public class DaoApp {
    public static void main(String[] args) {
        StudentDao dao = new StudentDao();
        dao.save(new Student("Asha", "asha@mail.com"));
        dao.save(new Student("Ravi", "ravi@mail.com"));
        dao.save(new Student("John", "john@mail.com"));
        dao.updateEmail(2, "ravi.k@mail.com");
        dao.delete(3);
        dao.findAll().forEach(System.out::println);
    }
}`,
      result: `Hibernate: insert into students (email,name) values (?,?)
Hibernate: insert into students (email,name) values (?,?)
Hibernate: insert into students (email,name) values (?,?)
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Hibernate: update students set email=?,name=? where id=?
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Hibernate: delete from students where id=?
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 order by s1_0.id
Student[1, Asha, asha@mail.com]
Student[2, Ravi, ravi.k@mail.com]`,
      explanation: `Only students 1 and 2 are printed because id 3 was deleted. inTransaction() opens a session, begins, commits (or rolls back on exception) and closes automatically. The DAO hides all Hibernate code from DaoApp.`,
    },
    {
      title: `Rollback in Action – Money Transfer`,
      scenario: `Transfer 500 from one Account to another; an error midway must undo the debit.`,
      steps: [
        `Create entity Account(id, holder, balance) and register it`,
        `Insert two accounts with balance 1000 each`,
        `Run the transfer that throws an exception after the debit`,
        `Check balances in MySQL – both are still 1000`,
      ],
      code: `@Entity
@Table(name = "accounts")
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String holder;
    private double balance;
    public Account() {}
    public Account(String holder, double balance) { this.holder = holder; this.balance = balance; }
    public double getBalance() { return balance; }
    public void setBalance(double b) { balance = b; }
}

// TransferApp main
Transaction tx = null;
try (Session s = sf.openSession()) {
    tx = s.beginTransaction();
    Account a = s.get(Account.class, 1);
    Account b = s.get(Account.class, 2);
    a.setBalance(a.getBalance() - 500);
    s.flush();                                    // UPDATE sent, not committed
    if (true) throw new RuntimeException("Network error!");
    b.setBalance(b.getBalance() + 500);
    tx.commit();
} catch (RuntimeException e) {
    if (tx != null) tx.rollback();
    System.out.println("Rolled back: " + e.getMessage());
}`,
      result: `Hibernate: select a1_0.id,a1_0.balance,a1_0.holder from accounts a1_0 where a1_0.id=?
Hibernate: select a1_0.id,a1_0.balance,a1_0.holder from accounts a1_0 where a1_0.id=?
Hibernate: update accounts set balance=?,holder=? where id=?
Rolled back: Network error!`,
      explanation: `flush() sent the UPDATE inside the open DB transaction, but rollback() undid it. Account 1 still has 1000 in the database. This is the atomicity (A in ACID) that transactions guarantee.`,
    },
    {
      title: `openSession() vs getCurrentSession()`,
      scenario: `Use a context-bound session that closes itself on commit.`,
      steps: [
        `Add <property name="hibernate.current_session_context_class">thread</property> to hibernate.cfg.xml`,
        `Use getCurrentSession() instead of openSession()`,
        `Notice you do not close the session yourself`,
      ],
      code: `Session s1 = sf.getCurrentSession();
Session s2 = sf.getCurrentSession();
System.out.println("Same session? " + (s1 == s2));

s1.beginTransaction();
Student st = s1.get(Student.class, 1);
System.out.println(st.getName());
s1.getTransaction().commit();     // session closed automatically here

System.out.println("Open after commit? " + s1.isOpen());`,
      result: `Same session? true
Hibernate: select s1_0.id,s1_0.email,s1_0.name from students s1_0 where s1_0.id=?
Asha
Open after commit? false`,
      explanation: `getCurrentSession() returns the session bound to the current thread (same object both times) and closes it at commit/rollback. openSession() always creates a new session that you must close. Spring manages the current session for you in real apps.`,
    },
  ],
  interview: [
    { q: `Difference between SessionFactory and Session?`, a: `SessionFactory: heavyweight, thread-safe, one per DB, created at startup, holds metadata and second-level cache. Session: lightweight, not thread-safe, one per unit of work, holds first-level cache and a JDBC connection.`, level: 'Easy' },
    { q: `Difference between openSession() and getCurrentSession()?`, a: `openSession() always creates a new session that you must close. getCurrentSession() returns a session bound to the context (thread/JTA), creates it if absent and closes it automatically on commit/rollback; it requires current_session_context_class.`, level: 'Medium' },
    { q: `What is dirty checking?`, a: `Hibernate stores a snapshot of each managed entity. At flush time it compares current values with the snapshot and generates UPDATE statements only for changed entities, so no explicit update call is needed.`, level: 'Medium' },
    { q: `Difference between flush() and commit()?`, a: `flush() synchronises the persistence context with the DB (sends SQL) but the transaction remains open and can roll back. commit() flushes and permanently commits the transaction.`, level: 'Medium' },
    { q: `What happens if you call persist() without a transaction?`, a: `The object becomes managed, but nothing is written because no flush/commit occurs (with IDENTITY the insert may run immediately but is not committed and is lost when the connection is returned). Always use a transaction for writes.`, level: 'Hard' },
    { q: `Which old Session methods are deprecated in Hibernate 6?`, a: `save(), update(), saveOrUpdate(), delete(), load() and createCriteria(). Use persist(), merge(), remove(), getReference() and the JPA Criteria API.`, level: 'Medium' },
    { q: `What does get() return if the row does not exist?`, a: `null. (getReference()/load() returns a proxy and throws ObjectNotFoundException/EntityNotFoundException when accessed.)`, level: 'Easy' },
    { q: `Why use try-with-resources with Session?`, a: `Session implements AutoCloseable; try-with-resources guarantees the session (and its JDBC connection) is closed even if an exception occurs.`, level: 'Easy' },
    { q: `What is the DAO pattern?`, a: `A design pattern that isolates persistence code in Data Access Object classes exposing methods like save, findById, findAll, delete, so business code is independent of the persistence technology.`, level: 'Easy' },
    { q: `What are ACID properties?`, a: `Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes).`, level: 'Easy' },
  ],
  practice: [
    {
      task: `Create a ProductDao with save, findById, findAll, updatePrice and delete for the Product entity from Day 3, and test all methods.`,
      hint: `Copy the StudentDao pattern; use BigDecimal for price.`,
      solution: `public class ProductDao {
    private final SessionFactory sf = HibernateUtil.getSessionFactory();

    public void save(Product p) { sf.inTransaction(s -> s.persist(p)); }

    public Product findById(long id) {
        return sf.fromSession(s -> s.get(Product.class, id));
    }

    public List<Product> findAll() {
        return sf.fromSession(s -> s.createQuery("from Product", Product.class).list());
    }

    public void updatePrice(long id, BigDecimal price) {
        sf.inTransaction(s -> {
            Product p = s.get(Product.class, id);
            if (p != null) p.setPrice(price);
        });
    }

    public void delete(long id) {
        sf.inTransaction(s -> {
            Product p = s.get(Product.class, id);
            if (p != null) s.remove(p);
        });
    }
}
// Add setPrice(BigDecimal) to Product.`,
    },
    {
      task: `Write a menu-driven console app (Scanner) for Student CRUD: 1 Add, 2 View All, 3 Update Email, 4 Delete, 5 Exit, using StudentDao.`,
      hint: `Use a while loop and switch.`,
      solution: `import java.util.Scanner;
import com.demo.dao.StudentDao;
import com.demo.entity.Student;
import com.demo.util.HibernateUtil;

public class StudentMenu {
    public static void main(String[] args) {
        StudentDao dao = new StudentDao();
        Scanner sc = new Scanner(System.in);
        while (true) {
            System.out.println("1 Add 2 View 3 Update 4 Delete 5 Exit");
            int ch = sc.nextInt(); sc.nextLine();
            switch (ch) {
                case 1 -> { System.out.print("Name: "); String n = sc.nextLine();
                            System.out.print("Email: "); String e = sc.nextLine();
                            dao.save(new Student(n, e)); }
                case 2 -> dao.findAll().forEach(System.out::println);
                case 3 -> { System.out.print("Id: "); int id = sc.nextInt(); sc.nextLine();
                            System.out.print("New email: "); dao.updateEmail(id, sc.nextLine()); }
                case 4 -> { System.out.print("Id: "); dao.delete(sc.nextInt()); }
                case 5 -> { HibernateUtil.shutdown(); return; }
                default -> System.out.println("Invalid");
            }
        }
    }
}`,
    },
    {
      task: `Prove dirty checking: load a student, set the SAME name again, commit. Does Hibernate fire an UPDATE? Then set a different name and check again.`,
      hint: `Compare console SQL.`,
      solution: `try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Student st = s.get(Student.class, 1);
    st.setName(st.getName());   // same value
    tx.commit();                // NO update printed - snapshot equals current state
}
try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Student st = s.get(Student.class, 1);
    st.setName("Asha Kumari");  // changed
    tx.commit();                // update students set email=?,name=? where id=?
}`,
    },
    {
      task: `Implement a bank transfer method transfer(int from, int to, double amt) that throws IllegalArgumentException when balance is insufficient and rolls back properly.`,
      hint: `Check balance before debiting; use inTransaction which rolls back on exception.`,
      solution: `public void transfer(int from, int to, double amt) {
    sf.inTransaction(s -> {
        Account a = s.get(Account.class, from);
        Account b = s.get(Account.class, to);
        if (a.getBalance() < amt)
            throw new IllegalArgumentException("Insufficient balance");
        a.setBalance(a.getBalance() - amt);
        b.setBalance(b.getBalance() + amt);
    }); // commit -> two UPDATEs; exception -> rollback, no UPDATE
}`,
    },
  ],
  quiz: [
    { question: `Which method should replace the deprecated save() in Hibernate 6?`, options: [`persist()`, `insert()`, `store()`, `add()`], answer: 0, explanation: `persist() is the JPA method for making a new object persistent.` },
    { question: `How do you update an entity loaded in the current session?`, options: [`Call session.update()`, `Call setters; dirty checking updates at commit`, `Delete and re-insert`, `Call session.refresh()`], answer: 1, explanation: `Managed entities are tracked; changed fields cause an UPDATE at flush.` },
    { question: `Which is thread-safe?`, options: [`Session`, `Transaction`, `Query`, `SessionFactory`], answer: 3, explanation: `Only SessionFactory is designed for sharing across threads.` },
    { question: `What does session.get(Student.class, 99) return if id 99 does not exist?`, options: [`An empty Student`, `A proxy`, `null`, `Throws exception immediately`], answer: 2, explanation: `get()/find() return null when no row is found.` },
    { question: `After flush() but before rollback(), the changes are ...`, options: [`Sent to DB but not committed`, `Permanently saved`, `Only in Java memory`, `Lost immediately`], answer: 0, explanation: `flush sends SQL within the open transaction; rollback can still undo it.` },
  ],
};
