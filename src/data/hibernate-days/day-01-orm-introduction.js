export default {
  id: 'day-01-orm-introduction',
  title: 'ORM Introduction, Problems with JDBC, Hibernate and JPA',
  module: 'Module 1: Hibernate Basics',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Understand why plain JDBC becomes painful in real projects, what Object Relational Mapping (ORM) means, and how Hibernate implements the JPA (Jakarta Persistence) specification.`,
  objectives: [
    `Explain the object-relational mismatch between Java objects and database tables`,
    `List the main problems of plain JDBC code (boilerplate, manual mapping, SQLException handling, DB dependency)`,
    `Define ORM, JPA and Hibernate and explain how they relate to each other`,
    `Describe the high-level Hibernate architecture (Configuration, SessionFactory, Session, Transaction, Query)`,
    `Know the Hibernate 6 + jakarta.persistence + MySQL + Maven stack used in this course`,
  ],
  theory: [
    {
      heading: `The Object-Relational Mismatch`,
      content: `Java thinks in objects: a Student object has fields, references to other objects (an Address, a List of Courses), inheritance and identity (==). A relational database thinks in tables: rows, columns, primary keys and foreign keys. These two worlds do not match naturally. This gap is called the object-relational (impedance) mismatch.

Analogy: Java speaks Hindi, MySQL speaks English. Every time you save or load data, somebody must translate. With JDBC, YOU are the translator, line by line. With ORM, a professional translator (Hibernate) does it for you.

Diagram in words:
  Java side:  Student{id=1, name="Asha", address=Address{city="Pune"}}
                 |  (translation needed)
  DB side:    students(id, name, address_id)  ---FK--->  addresses(id, city)`,
      points: [
        `Granularity: one Java object may map to several tables or one table to several objects`,
        `Inheritance: Java has extends, SQL tables do not`,
        `Identity: Java uses == and equals(), SQL uses the primary key`,
        `Associations: Java uses object references, SQL uses foreign keys`,
        `Navigation: Java walks student.getAddress().getCity(), SQL needs a JOIN`,
      ],
    },
    {
      heading: `Problems with Plain JDBC`,
      content: `JDBC is the low-level Java API to talk to databases. It works, but in large projects it creates a lot of repeated work.`,
      points: [
        `Boilerplate: open connection, create statement, set parameters, execute, loop ResultSet, close everything – for every query`,
        `Manual mapping: you copy every column into every field by hand (rs.getString("name") -> student.setName(...))`,
        `Checked SQLException everywhere, forcing try-catch blocks`,
        `SQL is database specific: LIMIT (MySQL) vs ROWNUM/FETCH FIRST (Oracle); changing DB means rewriting queries`,
        `No built-in caching, lazy loading or dirty checking`,
        `Relationships (one-to-many, many-to-many) must be joined and assembled manually`,
        `Schema changes ripple through many SQL strings that the compiler cannot check`,
      ],
      tip: `JDBC is not "bad". Hibernate itself uses JDBC internally. ORM simply automates the repetitive part.`,
    },
    {
      heading: `What is ORM?`,
      content: `ORM (Object Relational Mapping) is a technique where you describe once how a class maps to a table (using annotations or XML), and a framework automatically converts objects to rows and rows to objects.

Mapping rules:
  Class        -> Table
  Object       -> Row
  Field        -> Column
  Reference    -> Foreign key
  Collection   -> Child rows / join table

You write session.persist(student) and the ORM generates "insert into students ...". You write session.get(Student.class, 1) and the ORM runs a SELECT and builds a Student object.`,
      points: [
        `Less code and fewer bugs`,
        `Database independence through dialects`,
        `Automatic dirty checking: change a field, Hibernate updates the row at commit`,
        `Caching, lazy loading, batching out of the box`,
        `Work with objects; think in domain terms, not tables`,
      ],
    },
    {
      heading: `JPA vs Hibernate`,
      content: `JPA (Jakarta Persistence API, formerly Java Persistence API) is a SPECIFICATION: a set of interfaces and annotations (jakarta.persistence.Entity, EntityManager, @Id ...). It has no working code of its own.

Hibernate ORM is an IMPLEMENTATION (a provider) of JPA, and it also adds extra features of its own (Session API, @NaturalId, filters, extra cache options).

Analogy: JPA is the "driving licence rules" – every car must have a steering wheel, brake and accelerator. Hibernate is a specific car (like a Honda) that follows the rules and also adds its own extra features. EclipseLink and OpenJPA are other cars.

From Jakarta EE 9 onwards the package changed from javax.persistence to jakarta.persistence. Hibernate 6 uses jakarta.persistence – so all imports in this course start with jakarta.persistence.`,
      syntax: `JPA (spec)            Hibernate (implementation)
EntityManagerFactory  <->  SessionFactory
EntityManager         <->  Session
EntityTransaction     <->  Transaction
JPQL                  <->  HQL (superset of JPQL)`,
      tip: `Interview line: "JPA is the specification, Hibernate is one implementation of it. Code against JPA annotations, use Hibernate as the provider."`,
    },
    {
      heading: `Hibernate Architecture`,
      content: `Flow of a typical Hibernate program (diagram in words):

  hibernate.cfg.xml / annotations
          |
     Configuration  --builds-->  SessionFactory (one per database, heavy, thread-safe)
                                       |
                                  openSession()
                                       |
                                    Session (light, NOT thread-safe, one per unit of work)
                                       |
                           beginTransaction() -> Transaction
                                       |
                    persist / get / merge / remove / createQuery
                                       |
                                 JDBC + Dialect  -->  MySQL

Each part:
- Configuration: reads settings (URL, user, dialect) and entity classes.
- SessionFactory: built once at startup; holds metadata, connection pool, second-level cache.
- Session: your conversation with the DB; holds the first-level cache (persistence context).
- Transaction: begin / commit / rollback.
- Query: HQL/JPQL, Criteria or native SQL.
- Dialect: translates to the SQL flavour of your database (MySQLDialect).`,
    },
    {
      heading: `Course Stack and Tools`,
      content: `We use: Java 17 or 21, Hibernate ORM 6.4.x (hibernate-core), jakarta.persistence 3.1, MySQL 8 with mysql-connector-j, Maven for dependencies, and Eclipse IDE for Enterprise Java or IntelliJ IDEA as the IDE.

Before Day 2 install:
1. JDK 17 or 21 (java -version to check).
2. MySQL Server 8 and MySQL Workbench (or any client). Remember the root password.
3. Eclipse IDE for Enterprise Java and Web Developers, or IntelliJ IDEA (Community is enough).
4. Maven is bundled in both IDEs, no separate install needed.`,
      points: [
        `Create a database once: CREATE DATABASE hibernate_db;`,
        `Hibernate needs the JDBC driver (mysql-connector-j) on the classpath, exactly like JDBC`,
        `show_sql = true prints the SQL Hibernate generates – keep it on while learning`,
      ],
    },
  ],
  examples: [
    {
      title: `Saving a Student with Plain JDBC (the painful way)`,
      scenario: `Insert and read one student using raw JDBC so that you can see how much code is repeated.`,
      steps: [
        `In MySQL Workbench run: CREATE DATABASE hibernate_db; USE hibernate_db; CREATE TABLE students(id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50), email VARCHAR(80));`,
        `Eclipse: File > New > Maven Project > Create a simple project > GroupId com.demo, ArtifactId jdbc-demo > Finish. IntelliJ: File > New > Project > Maven > name jdbc-demo > Create`,
        `Add mysql-connector-j 8.3.0 to pom.xml dependencies and reload Maven (IntelliJ: Maven tool window > Reload; Eclipse: right-click project > Maven > Update Project)`,
        `Create class JdbcDemo in src/main/java, paste the code, change the password, Run`,
      ],
      code: `import java.sql.*;

public class JdbcDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/hibernate_db";
        try (Connection con = DriverManager.getConnection(url, "root", "root")) {

            // 1. INSERT - write SQL, set every parameter by hand
            String sql = "INSERT INTO students(name, email) VALUES (?, ?)";
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, "Asha");
                ps.setString(2, "asha@mail.com");
                ps.executeUpdate();
            }

            // 2. SELECT - map every column to every field by hand
            try (PreparedStatement ps = con.prepareStatement("SELECT id, name, email FROM students");
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int id = rs.getInt("id");
                    String name = rs.getString("name");
                    String email = rs.getString("email");
                    System.out.println(id + " " + name + " " + email);
                }
            }
        } catch (SQLException e) {          // checked exception everywhere
            e.printStackTrace();
        }
    }
}`,
      result: `1 Asha asha@mail.com`,
      explanation: `About 25 lines for one insert and one select. Add 10 tables with relationships and the code explodes. Every column name is a plain String the compiler cannot check, and the SQL is MySQL specific.`,
    },
    {
      title: `The Same Work with Hibernate (preview)`,
      scenario: `See how Hibernate replaces SQL and manual mapping with objects. Full setup comes on Day 2.`,
      steps: [
        `Just read this code today – you will run it on Day 2 after adding hibernate-core and hibernate.cfg.xml`,
        `Notice there is no SQL string and no ResultSet loop`,
        `Compare the console output: Hibernate prints the SQL it generated because show_sql=true`,
      ],
      code: `import jakarta.persistence.*;
import org.hibernate.*;
import org.hibernate.cfg.Configuration;

@Entity
@Table(name = "students")
class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String email;

    public Student() {}
    public Student(String name, String email) { this.name = name; this.email = email; }
    public String toString() { return id + " " + name + " " + email; }
}

public class HibernatePreview {
    public static void main(String[] args) {
        SessionFactory factory = new Configuration().configure().buildSessionFactory();
        try (Session session = factory.openSession()) {
            Transaction tx = session.beginTransaction();
            session.persist(new Student("Asha", "asha@mail.com"));   // INSERT generated
            tx.commit();

            Student s = session.get(Student.class, 1);                 // SELECT generated
            System.out.println(s);
        }
        factory.close();
    }
}`,
      result: `Hibernate: insert into students (email,name) values (?,?)
1 Asha asha@mail.com`,
      explanation: `persist() produced the INSERT. get() did not hit the database again because the object was already in the Session (first-level cache), so no SELECT is printed. You work only with Student objects – Hibernate does the translation.`,
    },
    {
      title: `ORM Idea in Pure Java – Building SQL from an Object`,
      scenario: `A tiny hand-made "ORM" that converts a Student object to an INSERT statement, to understand what Hibernate does internally.`,
      steps: [
        `IntelliJ: right-click src > New > Java Class > Main. Eclipse: File > New > Class > Main`,
        `Paste the code and click Run ▶ (no database needed)`,
        `Observe how the class name becomes the table and fields become columns`,
      ],
      code: `public class Main {
    static class Student {
        int id;
        String name;
        String email;
        Student(int id, String name, String email) {
            this.id = id; this.name = name; this.email = email;
        }
    }

    // our "mini ORM": maps object -> SQL
    static String toInsertSql(Student s) {
        String table = "students";
        return "INSERT INTO " + table + " (id, name, email) VALUES ("
                + s.id + ", '" + s.name + "', '" + s.email + "')";
    }

    // maps a "row" (array of values) -> object
    static Student fromRow(Object[] row) {
        return new Student((Integer) row[0], (String) row[1], (String) row[2]);
    }

    public static void main(String[] args) {
        Student s = new Student(1, "Asha", "asha@mail.com");
        System.out.println(toInsertSql(s));

        Object[] row = {2, "Ravi", "ravi@mail.com"};
        Student r = fromRow(row);
        System.out.println("Loaded object: " + r.id + " " + r.name + " " + r.email);
    }
}`,
      java: {
        files: {
          'Main.java': `public class Main {
    static class Student {
        int id;
        String name;
        String email;
        Student(int id, String name, String email) {
            this.id = id; this.name = name; this.email = email;
        }
    }

    // our "mini ORM": maps object -> SQL
    static String toInsertSql(Student s) {
        String table = "students";
        return "INSERT INTO " + table + " (id, name, email) VALUES ("
                + s.id + ", '" + s.name + "', '" + s.email + "')";
    }

    // maps a "row" (array of values) -> object
    static Student fromRow(Object[] row) {
        return new Student((Integer) row[0], (String) row[1], (String) row[2]);
    }

    public static void main(String[] args) {
        Student s = new Student(1, "Asha", "asha@mail.com");
        System.out.println(toInsertSql(s));

        Object[] row = {2, "Ravi", "ravi@mail.com"};
        Student r = fromRow(row);
        System.out.println("Loaded object: " + r.id + " " + r.name + " " + r.email);
    }
}`,
        },
      },
      result: `INSERT INTO students (id, name, email) VALUES (1, 'Asha', 'asha@mail.com')
Loaded object: 2 Ravi ravi@mail.com`,
      explanation: `Hibernate does exactly this – object to SQL and row to object – but generically for any entity, using annotations and reflection, with safe parameter binding (? placeholders) instead of string concatenation, plus caching and relationship handling.`,
    },
    {
      title: `JPA-Standard Code vs Hibernate-Native Code`,
      scenario: `Show that the same save can be done with the JPA EntityManager API or the Hibernate Session API.`,
      steps: [
        `Read both versions side by side`,
        `JPA style needs META-INF/persistence.xml; Hibernate native style uses hibernate.cfg.xml`,
        `In this course we mostly use the Hibernate Session API, which also implements EntityManager`,
      ],
      code: `// ---- JPA standard (portable to any provider) ----
EntityManagerFactory emf = Persistence.createEntityManagerFactory("myPU");
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
em.persist(new Student("Asha", "asha@mail.com"));
em.getTransaction().commit();
em.close();

// ---- Hibernate native ----
SessionFactory sf = new Configuration().configure().buildSessionFactory();
Session session = sf.openSession();
Transaction tx = session.beginTransaction();
session.persist(new Student("Asha", "asha@mail.com"));
tx.commit();
session.close();

// In Hibernate 6: Session extends EntityManager, SessionFactory extends EntityManagerFactory
EntityManager em2 = session;  // valid!`,
      result: `Hibernate: insert into students (email,name) values (?,?)
Hibernate: insert into students (email,name) values (?,?)`,
      explanation: `Both produce the same INSERT. Hibernate 6's Session is-an EntityManager, so you can freely mix JPA standard methods (persist, find, merge, remove) with Hibernate extras.`,
    },
  ],
  interview: [
    { q: `What is ORM?`, a: `Object Relational Mapping is a technique that maps Java classes to database tables and objects to rows so that you can save and load data using objects instead of hand-written SQL and ResultSet mapping.`, level: 'Easy' },
    { q: `What is Hibernate?`, a: `Hibernate is an open-source ORM framework for Java and the most popular implementation of the JPA specification. It generates SQL, maps results to objects, manages transactions, caching and relationships.`, level: 'Easy' },
    { q: `Difference between JPA and Hibernate?`, a: `JPA is a specification (interfaces + annotations in jakarta.persistence). Hibernate is an implementation/provider of JPA with extra features. Code written with JPA annotations can switch to another provider like EclipseLink.`, level: 'Easy' },
    { q: `What are the disadvantages of JDBC?`, a: `Lots of boilerplate, manual mapping of ResultSet to objects, checked SQLException, DB-specific SQL, no caching, no lazy loading, manual handling of relationships and transactions.`, level: 'Easy' },
    { q: `What is the object-relational impedance mismatch?`, a: `The differences between the object model and the relational model: granularity, inheritance, identity, associations and navigation. ORM tools exist to bridge these differences.`, level: 'Medium' },
    { q: `What are the advantages of Hibernate?`, a: `Less code, DB independence via dialects, HQL, automatic dirty checking, first and second level cache, lazy loading, automatic table creation (hbm2ddl), and exception translation into unchecked exceptions.`, level: 'Easy' },
    { q: `Name the core interfaces of Hibernate.`, a: `Configuration (class), SessionFactory, Session, Transaction, Query and CriteriaBuilder.`, level: 'Easy' },
    { q: `Is SessionFactory thread-safe? Is Session thread-safe?`, a: `SessionFactory is immutable and thread-safe; create one per database per application. Session is NOT thread-safe; use one per request/unit of work and close it.`, level: 'Medium' },
    { q: `What is a Dialect in Hibernate?`, a: `A class that tells Hibernate how to generate SQL for a specific database (data types, pagination, identity columns). Example: org.hibernate.dialect.MySQLDialect. Hibernate 6 usually detects it automatically from the JDBC metadata.`, level: 'Medium' },
    { q: `Why did the package change from javax.persistence to jakarta.persistence?`, a: `Java EE moved to the Eclipse Foundation as Jakarta EE; from Jakarta EE 9 the namespace became jakarta.*. Hibernate 6, Spring 6 and Spring Boot 3 all use jakarta.persistence.`, level: 'Medium' },
    { q: `Does Hibernate replace JDBC?`, a: `No. Hibernate is built on top of JDBC. It uses JDBC drivers and connections internally; it only automates the repetitive work.`, level: 'Easy' },
  ],
  practice: [
    {
      task: `List 5 problems you faced (or would face) writing JDBC code for a 10-table application, and for each write how Hibernate solves it.`,
      hint: `Think about mapping, SQL portability, exceptions, relationships, caching.`,
      solution: `1. Manual ResultSet mapping -> Hibernate maps rows to entities automatically.
2. MySQL-specific SQL (LIMIT) -> Dialect generates DB-specific SQL; HQL is portable.
3. Checked SQLException -> Hibernate throws unchecked exceptions (HibernateException / PersistenceException).
4. Manual joins for relationships -> @OneToMany, @ManyToOne etc. load related objects.
5. Same row queried many times -> First-level and second-level cache avoid repeated SELECTs.`,
    },
    {
      task: `Extend the pure-Java mini ORM: write toUpdateSql(Student s) that returns an UPDATE statement and toDeleteSql(int id).`,
      hint: `UPDATE students SET name=..., email=... WHERE id=...`,
      solution: `public class Main {
    static class Student {
        int id; String name; String email;
        Student(int id, String name, String email) { this.id = id; this.name = name; this.email = email; }
    }
    static String toUpdateSql(Student s) {
        return "UPDATE students SET name='" + s.name + "', email='" + s.email + "' WHERE id=" + s.id;
    }
    static String toDeleteSql(int id) {
        return "DELETE FROM students WHERE id=" + id;
    }
    public static void main(String[] args) {
        Student s = new Student(1, "Asha K", "asha.k@mail.com");
        System.out.println(toUpdateSql(s));
        System.out.println(toDeleteSql(1));
    }
}
// Output:
// UPDATE students SET name='Asha K', email='asha.k@mail.com' WHERE id=1
// DELETE FROM students WHERE id=1`,
    },
    {
      task: `Draw (in words) the Hibernate architecture and label which objects are heavy/thread-safe and which are light/not thread-safe.`,
      hint: `Configuration -> SessionFactory -> Session -> Transaction -> JDBC -> DB.`,
      solution: `Configuration (reads cfg, one-time)
   -> SessionFactory  [heavy, thread-safe, one per DB, created at startup]
       -> Session     [light, NOT thread-safe, one per request/unit of work]
           -> Transaction [begin/commit/rollback]
           -> Query / Criteria
       -> JDBC Connection (from pool) -> Dialect -> MySQL`,
    },
    {
      task: `Prepare your machine: install JDK 17, MySQL 8 and Eclipse or IntelliJ; create database hibernate_db and a user.`,
      hint: `Use MySQL Workbench or mysql CLI.`,
      solution: `-- Run in MySQL
CREATE DATABASE hibernate_db;
CREATE USER 'hbuser'@'localhost' IDENTIFIED BY 'hbpass';
GRANT ALL PRIVILEGES ON hibernate_db.* TO 'hbuser'@'localhost';
FLUSH PRIVILEGES;

-- Verify in terminal
java -version     (should show 17 or 21)
mysql -u hbuser -p hibernate_db`,
    },
  ],
  quiz: [
    { question: `Which of these is a specification, not an implementation?`, options: [`Hibernate`, `EclipseLink`, `JPA`, `OpenJPA`], answer: 2, explanation: `JPA is the specification; the others are implementations (providers).` },
    { question: `Which package do Hibernate 6 entity annotations come from?`, options: [`jakarta.persistence`, `javax.persistence`, `org.hibernate.jpa`, `java.sql`], answer: 0, explanation: `Hibernate 6 implements Jakarta Persistence 3.x, so annotations come from jakarta.persistence.` },
    { question: `Which Hibernate object is thread-safe and usually created once per application?`, options: [`Session`, `Transaction`, `Query`, `SessionFactory`], answer: 3, explanation: `SessionFactory is heavy, immutable and thread-safe. Sessions are short-lived and not thread-safe.` },
    { question: `In ORM, a Java class usually maps to a ...`, options: [`Column`, `Table`, `Database`, `Index`], answer: 1, explanation: `Class -> table, object -> row, field -> column.` },
    { question: `Which is NOT a typical problem of plain JDBC?`, options: [`Manual ResultSet mapping`, `Checked SQLException handling`, `It cannot connect to MySQL`, `Database-specific SQL`], answer: 2, explanation: `JDBC connects to MySQL perfectly well; its problems are boilerplate and manual work.` },
  ],
};
