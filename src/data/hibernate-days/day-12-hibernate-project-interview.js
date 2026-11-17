export default {
  id: 'day-12-hibernate-project-interview',
  title: 'Hibernate Project and Interview Questions',
  module: 'Module 4: Project',
  day: 12,
  level: 'Advanced',
  duration: '4 hours',
  summary: `Build a complete console Library Management System with Hibernate 6, MySQL and Maven that uses entities, relationships, cascades, DAOs, transactions, HQL, Criteria, JOIN FETCH and pagination, then revise with 25 interview questions.`,
  objectives: [
    `Design entities and relationships for a real mini project`,
    `Organise code in layers: entity, dao, service, util, app`,
    `Implement business transactions (issue/return book) with rollback`,
    `Write report queries with HQL, Criteria, JOIN FETCH and pagination while avoiding N+1`,
    `Answer the most frequently asked Hibernate interview questions confidently`,
  ],
  theory: [
    {
      heading: `Project Overview – Library Management System`,
      content: `Features:
1. Add authors with their books (cascade).
2. Register members.
3. Issue a book to a member (only if copies are available).
4. Return a book.
5. Reports: books of an author, active loans, most borrowed books, search books, paged book list.

Entity design (diagram in words):
  Author 1 ---< Book            (author_id FK in books, cascade ALL + orphanRemoval)
  Member 1 ---< Loan >--- 1 Book (loans table with member_id, book_id, issue_date, return_date)

Loan is a join ENTITY between Member and Book because the link has extra data (dates) – exactly the Day 9 pattern.

Common fields id, createdAt come from a @MappedSuperclass BaseEntity (Day 11).`,
    },
    {
      heading: `Project Structure`,
      content: `library-hibernate/
  pom.xml                                  (hibernate-core 6.4.4.Final, mysql-connector-j 8.3.0)
  src/main/resources/hibernate.cfg.xml
  src/main/java/com/library/
      entity/   BaseEntity, Author, Book, Member, Loan
      util/     HibernateUtil
      dao/      BookDao, MemberDao, LoanDao
      service/  LibraryService   (business rules + transactions)
      LibraryApp.java            (main / menu)

Layer flow: LibraryApp -> LibraryService -> DAOs -> Session -> MySQL

Why a service layer? A business action like "issue book" touches several tables (books.available_copies and loans). The service runs them in ONE transaction so both succeed or both roll back.`,
    },
    {
      heading: `Setup Steps in Eclipse and IntelliJ`,
      content: `MySQL: CREATE DATABASE library_db;

Eclipse (Enterprise Java / STS):
1. File > New > Maven Project > Create a simple project > GroupId com.library, ArtifactId library-hibernate > Finish.
2. Paste pom.xml dependencies, add maven.compiler.release 17, right-click project > Maven > Update Project.
3. Create src/main/resources/hibernate.cfg.xml.
4. Create packages (right-click src/main/java > New > Package) and classes.
5. Right-click LibraryApp > Run As > Java Application.

IntelliJ IDEA:
1. File > New > Project > Maven, JDK 17, GroupId com.library, name library-hibernate > Create.
2. Paste dependencies into pom.xml > click "Load Maven Changes".
3. Right-click resources > New > File > hibernate.cfg.xml.
4. Right-click java > New > Package com.library.entity etc.
5. Click the green ▶ next to main in LibraryApp.

Tip: keep hibernate.show_sql=true while developing; set it false to see clean application output in the demo.`,
    },
    {
      heading: `Design Decisions (say these in interviews)`,
      content: `Explain WHY, not just WHAT:`,
      points: [
        `IDENTITY ids because MySQL has AUTO_INCREMENT`,
        `All @ManyToOne set to LAZY; reports use JOIN FETCH to avoid N+1 and LazyInitializationException`,
        `Author -> Book uses cascade ALL + orphanRemoval because books are managed through their author in this app`,
        `No cascade from Loan to Book/Member – deleting a loan must not delete a book`,
        `Loan is a separate entity (not @ManyToMany) because it has issue_date and return_date`,
        `Business rule checks and updates (available copies) happen inside one transaction`,
        `Optimistic locking with @Version on Book prevents two librarians issuing the last copy at the same time`,
      ],
    },
    {
      heading: `Optimistic Locking with @Version`,
      content: `Two users load the same Book (availableCopies = 1) at the same time and both issue it. Without protection both commits succeed and copies become -1 (lost update).

@Version adds a version column. Every UPDATE becomes:
  update books set available_copies=?, version=2 where id=? and version=1
If another transaction already changed the row, 0 rows match and Hibernate throws OptimisticLockException (StaleObjectStateException). The second user simply retries.

Analogy: editing a shared Google Doc paragraph – if someone saved before you, you are told to refresh first.`,
    },
  ],
  examples: [
    {
      title: `pom.xml and hibernate.cfg.xml`,
      scenario: `Project configuration for the Library system.`,
      steps: [
        `Create the Maven project as described in the setup section`,
        `Paste this pom.xml and reload Maven`,
        `Create hibernate.cfg.xml in src/main/resources and set your MySQL password`,
      ],
      code: `<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.library</groupId>
    <artifactId>library-hibernate</artifactId>
    <version>1.0</version>
    <properties>
        <maven.compiler.release>17</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-core</artifactId>
            <version>6.4.4.Final</version>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.3.0</version>
        </dependency>
    </dependencies>
</project>

<!-- src/main/resources/hibernate.cfg.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
        <property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/library_db</property>
        <property name="hibernate.connection.username">root</property>
        <property name="hibernate.connection.password">root</property>
        <property name="hibernate.hbm2ddl.auto">create</property>
        <property name="hibernate.show_sql">false</property>
        <mapping class="com.library.entity.Author"/>
        <mapping class="com.library.entity.Book"/>
        <mapping class="com.library.entity.Member"/>
        <mapping class="com.library.entity.Loan"/>
    </session-factory>
</hibernate-configuration>`,
      result: `[INFO] BUILD SUCCESS   (mvn compile)`,
      explanation: `hbm2ddl.auto=create gives a fresh schema for every demo run; switch to update to keep data, or validate in production. show_sql is false here for clean output; turn it on to study the SQL.`,
    },
    {
      title: `Entities: BaseEntity, Author, Book, Member, Loan`,
      scenario: `Domain model with MappedSuperclass, one-to-many with cascade/orphanRemoval, join entity and @Version.`,
      steps: [
        `Create package com.library.entity`,
        `Create the five classes below (each public class in its own file)`,
        `Run once and check SHOW TABLES; in MySQL: authors, books, members, loans`,
      ],
      code: `// ===== BaseEntity.java =====
package com.library.entity;
import jakarta.persistence.*;

@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;
    public Long getId() { return id; }
}

// ===== Author.java =====
@Entity @Table(name = "authors")
public class Author extends BaseEntity {
    @Column(nullable = false, length = 80)
    private String name;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Book> books = new ArrayList<>();

    public Author() {}
    public Author(String name) { this.name = name; }
    public void addBook(Book b) { books.add(b); b.setAuthor(this); }
    public String getName() { return name; }
    public List<Book> getBooks() { return books; }
}

// ===== Book.java =====
@Entity @Table(name = "books")
public class Book extends BaseEntity {
    @Column(nullable = false)
    private String title;

    @Column(name = "available_copies")
    private int availableCopies;

    @Version
    private int version;                      // optimistic locking

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;

    public Book() {}
    public Book(String title, int copies) { this.title = title; this.availableCopies = copies; }
    public String getTitle() { return title; }
    public int getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(int c) { availableCopies = c; }
    public Author getAuthor() { return author; }
    void setAuthor(Author a) { author = a; }
}

// ===== Member.java =====
@Entity @Table(name = "members")
public class Member extends BaseEntity {
    private String name;
    @Column(unique = true)
    private String email;
    public Member() {}
    public Member(String name, String email) { this.name = name; this.email = email; }
    public String getName() { return name; }
}

// ===== Loan.java =====
@Entity @Table(name = "loans")
public class Loan extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id")
    private Book book;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;          // null = still borrowed

    public Loan() {}
    public Loan(Member m, Book b, LocalDate issued) { member = m; book = b; issueDate = issued; }
    public Member getMember() { return member; }
    public Book getBook() { return book; }
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate d) { returnDate = d; }
}`,
      result: `Hibernate: create table authors (id bigint not null auto_increment, name varchar(80) not null, primary key (id)) engine=InnoDB
Hibernate: create table books (available_copies integer, version integer not null, author_id bigint, id bigint not null auto_increment, title varchar(255) not null, primary key (id)) engine=InnoDB
Hibernate: create table loans (issue_date date not null, return_date date, book_id bigint not null, id bigint not null auto_increment, member_id bigint not null, primary key (id)) engine=InnoDB
Hibernate: create table members (id bigint not null auto_increment, email varchar(255), name varchar(255), primary key (id)) engine=InnoDB
(plus unique and foreign key constraints; shown only when show_sql=true)`,
      explanation: `Every entity inherits id from BaseEntity. Books belong to an author (cascade + orphanRemoval). Loan connects Member and Book with extra columns. The version column is managed entirely by Hibernate. Imports (jakarta.persistence.*, java.util.*, java.time.LocalDate) are omitted after the first file for brevity.`,
    },
    {
      title: `HibernateUtil and LibraryService (business transactions)`,
      scenario: `Service methods that wrap each business action in one transaction with rollback on any error.`,
      steps: [
        `Create com.library.util.HibernateUtil (same as Day 2)`,
        `Create com.library.service.LibraryService`,
        `Notice inTransaction() rolls back automatically when an exception is thrown`,
      ],
      code: `package com.library.service;

import com.library.entity.*;
import com.library.util.HibernateUtil;
import org.hibernate.SessionFactory;
import jakarta.persistence.criteria.*;
import java.time.LocalDate;
import java.util.*;

public class LibraryService {
    private final SessionFactory sf = HibernateUtil.getSessionFactory();

    public void addAuthor(Author a) {
        sf.inTransaction(s -> s.persist(a));               // cascades to books
    }

    public void addMember(Member m) {
        sf.inTransaction(s -> s.persist(m));
    }

    public void issueBook(long memberId, long bookId) {
        sf.inTransaction(s -> {
            Book book = s.get(Book.class, bookId);
            Member member = s.getReference(Member.class, memberId);  // no SELECT needed
            if (book.getAvailableCopies() <= 0)
                throw new IllegalStateException("No copies left for '" + book.getTitle() + "'");
            book.setAvailableCopies(book.getAvailableCopies() - 1); // dirty checking -> UPDATE
            s.persist(new Loan(member, book, LocalDate.now()));
            System.out.println("Issued '" + book.getTitle() + "' to " + member.getName());
        });
    }

    public void returnBook(long loanId) {
        sf.inTransaction(s -> {
            Loan loan = s.createQuery(
                    "select l from Loan l join fetch l.book join fetch l.member where l.id = :id", Loan.class)
                .setParameter("id", loanId).uniqueResult();
            if (loan == null || loan.getReturnDate() != null)
                throw new IllegalStateException("Invalid or already returned loan " + loanId);
            loan.setReturnDate(LocalDate.now());
            Book b = loan.getBook();
            b.setAvailableCopies(b.getAvailableCopies() + 1);
            System.out.println("Returned '" + b.getTitle() + "' by " + loan.getMember().getName());
        });
    }

    public List<Book> booksByAuthor(String authorName) {
        return sf.fromSession(s -> s.createQuery(
                "select b from Book b join b.author a where a.name = :n order by b.title", Book.class)
            .setParameter("n", authorName).list());
    }

    public List<Loan> activeLoans() {
        return sf.fromSession(s -> s.createQuery(
                "select l from Loan l join fetch l.member join fetch l.book " +
                "where l.returnDate is null order by l.id", Loan.class).list());
    }

    public List<Object[]> topBorrowed() {
        return sf.fromSession(s -> s.createQuery(
                "select l.book.title, count(l) from Loan l group by l.book.title " +
                "order by count(l) desc, l.book.title", Object[].class).list());
    }

    public List<Book> searchBooks(String titlePart, Integer minCopies) {      // Criteria
        return sf.fromSession(s -> {
            CriteriaBuilder cb = s.getCriteriaBuilder();
            CriteriaQuery<Book> cq = cb.createQuery(Book.class);
            Root<Book> b = cq.from(Book.class);
            List<Predicate> ps = new ArrayList<>();
            if (titlePart != null) ps.add(cb.like(cb.lower(b.get("title")), "%" + titlePart.toLowerCase() + "%"));
            if (minCopies != null) ps.add(cb.ge(b.get("availableCopies"), minCopies));
            cq.select(b).where(ps.toArray(new Predicate[0])).orderBy(cb.asc(b.get("title")));
            return s.createQuery(cq).getResultList();
        });
    }

    public List<Book> page(int page, int size) {
        return sf.fromSession(s -> s.createQuery("from Book b order by b.id", Book.class)
            .setFirstResult((page - 1) * size).setMaxResults(size).list());
    }
}`,
      result: `(No output by itself – used by LibraryApp in the next example.)`,
      explanation: `issueBook() checks the rule and updates two tables in one transaction; the IllegalStateException makes inTransaction() roll back, so no loan is saved and no copy is deducted. Report methods use JOIN FETCH so the returned detached entities can be printed after the session is closed (no LazyInitializationException, no N+1). getReference() avoids a SELECT for Member; calling member.getName() initialises the proxy inside the open session.`,
    },
    {
      title: `LibraryApp – Running the Whole Flow`,
      scenario: `Seed data, issue and return books, try an invalid issue, and print reports.`,
      steps: [
        `Create com.library.LibraryApp with main()`,
        `Keep show_sql=false for clean output`,
        `Run (Eclipse: Run As > Java Application, IntelliJ: ▶) and compare with the expected output`,
      ],
      code: `package com.library;

import com.library.entity.*;
import com.library.service.LibraryService;
import com.library.util.HibernateUtil;

public class LibraryApp {
    public static void main(String[] args) {
        LibraryService lib = new LibraryService();

        Author bloch = new Author("Joshua Bloch");
        bloch.addBook(new Book("Effective Java", 2));      // book id 1
        bloch.addBook(new Book("Java Puzzlers", 1));       // book id 2
        Author walls = new Author("Craig Walls");
        walls.addBook(new Book("Spring in Action", 1));    // book id 3
        lib.addAuthor(bloch);
        lib.addAuthor(walls);
        lib.addMember(new Member("Asha", "asha@mail.com")); // member id 1
        lib.addMember(new Member("Ravi", "ravi@mail.com")); // member id 2

        lib.issueBook(1, 1);      // loan 1
        lib.issueBook(2, 3);      // loan 2
        lib.issueBook(2, 1);      // loan 3
        try {
            lib.issueBook(1, 3);  // no copies left -> rollback
        } catch (IllegalStateException e) {
            System.out.println("Error: " + e.getMessage());
        }
        lib.returnBook(2);

        System.out.println("--- Books by Joshua Bloch ---");
        for (Book b : lib.booksByAuthor("Joshua Bloch"))
            System.out.println(b.getTitle() + " (available " + b.getAvailableCopies() + ")");

        System.out.println("--- Top borrowed ---");
        for (Object[] r : lib.topBorrowed())
            System.out.println(r[0] + " : " + r[1]);

        System.out.println("--- Active loans ---");
        for (Loan l : lib.activeLoans())
            System.out.println(l.getMember().getName() + " -> " + l.getBook().getTitle());

        System.out.println("--- Search 'java' with at least 1 copy ---");
        lib.searchBooks("java", 1).forEach(b -> System.out.println(b.getTitle()));

        System.out.println("--- Page 2 (size 2) ---");
        lib.page(2, 2).forEach(b -> System.out.println(b.getTitle()));

        HibernateUtil.shutdown();
    }
}`,
      result: `Issued 'Effective Java' to Asha
Issued 'Spring in Action' to Ravi
Issued 'Effective Java' to Ravi
Error: No copies left for 'Spring in Action'
Returned 'Spring in Action' by Ravi
--- Books by Joshua Bloch ---
Effective Java (available 0)
Java Puzzlers (available 1)
--- Top borrowed ---
Effective Java : 2
Spring in Action : 1
--- Active loans ---
Asha -> Effective Java
Ravi -> Effective Java
--- Search 'java' with at least 1 copy ---
Java Puzzlers
--- Page 2 (size 2) ---
Spring in Action`,
      explanation: `Effective Java had 2 copies and was issued twice, so 0 remain. Spring in Action's single copy was with Ravi when Asha asked, so that transaction rolled back. After Ravi returned it, loan 2 has a return date and is no longer active. The search excludes Effective Java (0 copies) and includes "Java Puzzlers"; "Spring in Action" does not contain "java". Page 2 of size 2 by id skips books 1 and 2.`,
    },
    {
      title: `Optimistic Locking Demo with @Version`,
      scenario: `Two sessions load the same book and both try to issue the last copy.`,
      steps: [
        `Set hibernate.show_sql=true`,
        `Run the code below on fresh data where "Java Puzzlers" (id 2) has 1 copy`,
        `Observe the version check in the UPDATE and the exception for the second commit`,
      ],
      code: `Session s1 = sf.openSession();
Session s2 = sf.openSession();
Transaction t1 = s1.beginTransaction();
Transaction t2 = s2.beginTransaction();

Book b1 = s1.get(Book.class, 2L);       // version 0, copies 1
Book b2 = s2.get(Book.class, 2L);       // version 0, copies 1

b1.setAvailableCopies(b1.getAvailableCopies() - 1);
t1.commit();                             // OK -> version becomes 1
System.out.println("User 1 issued the book");

b2.setAvailableCopies(b2.getAvailableCopies() - 1);
try {
    t2.commit();                         // where version=0 -> 0 rows
} catch (jakarta.persistence.OptimisticLockException | org.hibernate.StaleObjectStateException e) {
    System.out.println("User 2 failed: book was modified by someone else, please retry");
}
s1.close();
s2.close();`,
      result: `Hibernate: select b1_0.id,b1_0.author_id,b1_0.available_copies,b1_0.title,b1_0.version from books b1_0 where b1_0.id=?
Hibernate: select b1_0.id,b1_0.author_id,b1_0.available_copies,b1_0.title,b1_0.version from books b1_0 where b1_0.id=?
Hibernate: update books set author_id=?,available_copies=?,title=?,version=? where id=? and version=?
User 1 issued the book
Hibernate: update books set author_id=?,available_copies=?,title=?,version=? where id=? and version=?
User 2 failed: book was modified by someone else, please retry`,
      explanation: `Both sessions read version 0. The first UPDATE matched and set version 1. The second UPDATE still had "and version=0", matched 0 rows, and Hibernate threw a StaleObjectStateException (OptimisticLockException in JPA style) instead of silently making copies -1. (Multi-catch is valid because neither exception type extends the other.)`,
    },
  ],
  interview: [
    { q: `What is Hibernate and why use it over JDBC?`, a: `Hibernate is an ORM framework implementing JPA. It removes JDBC boilerplate, maps objects to tables, generates DB-specific SQL via dialects, offers caching, lazy loading, dirty checking, HQL/Criteria, and converts checked SQLExceptions into unchecked exceptions.`, level: 'Easy' },
    { q: `What is the difference between JPA and Hibernate?`, a: `JPA is a specification (jakarta.persistence API); Hibernate is an implementation with extra features. Code to JPA annotations/EntityManager for portability, use Hibernate as provider.`, level: 'Easy' },
    { q: `Explain SessionFactory vs Session.`, a: `SessionFactory: one per DB, heavy, immutable, thread-safe, holds metadata and L2 cache. Session: short-lived, not thread-safe, unit of work, holds L1 cache and connection.`, level: 'Easy' },
    { q: `What are the entity states?`, a: `Transient, Persistent (managed), Detached and Removed.`, level: 'Easy' },
    { q: `get() vs load()/getReference()?`, a: `get() hits DB immediately and returns null if missing. load()/getReference() return a lazy proxy and throw ObjectNotFoundException/EntityNotFoundException on first access if missing.`, level: 'Easy' },
    { q: `persist() vs merge()?`, a: `persist() makes a transient instance managed (void, fails for detached). merge() copies a detached/transient instance's state onto a managed instance and returns it.`, level: 'Medium' },
    { q: `What were save(), update() and saveOrUpdate() and what replaces them?`, a: `Legacy Hibernate methods deprecated in Hibernate 6. Use persist() for new entities and merge() for detached ones (or rely on dirty checking for managed ones).`, level: 'Medium' },
    { q: `What is dirty checking?`, a: `Hibernate compares managed entities with their loaded snapshot at flush time and issues UPDATEs automatically for changed ones.`, level: 'Easy' },
    { q: `What is the difference between flush() and commit()?`, a: `flush() sends pending SQL to the DB inside the current transaction; commit() flushes and commits the transaction permanently.`, level: 'Medium' },
    { q: `Explain the hbm2ddl.auto values.`, a: `create (drop+create), create-drop (also drop on close), update (alter/create missing), validate (check only), none. Use validate/none in production with Flyway/Liquibase.`, level: 'Easy' },
    { q: `Which @GeneratedValue strategy for MySQL and why?`, a: `IDENTITY, since MySQL supports AUTO_INCREMENT and lacks sequences. Drawback: disables JDBC insert batching.`, level: 'Medium' },
    { q: `HQL vs SQL vs Criteria?`, a: `SQL uses tables/columns and is DB-specific. HQL/JPQL uses entities/fields and is portable. Criteria builds queries programmatically and type-safely, ideal for dynamic filters.`, level: 'Medium' },
    { q: `How do you prevent SQL injection in Hibernate?`, a: `Always use parameter binding (:name, ?1, Criteria) instead of concatenating user input into HQL/SQL.`, level: 'Easy' },
    { q: `What is the owning side and mappedBy?`, a: `The owning side holds the FK mapping (@JoinColumn / @JoinTable) and is used for writes. The inverse side uses mappedBy naming the owning field and is ignored for FK writes.`, level: 'Medium' },
    { q: `Default fetch types?`, a: `@ManyToOne/@OneToOne EAGER; @OneToMany/@ManyToMany LAZY. Best practice: make all LAZY and fetch per use case.`, level: 'Easy' },
    { q: `What is the N+1 problem and how do you fix it?`, a: `1 query for parents + N queries for each parent's association. Fix with JOIN FETCH, entity graphs, @BatchSize/default_batch_fetch_size, SUBSELECT fetching or DTO projections.`, level: 'Medium' },
    { q: `What causes LazyInitializationException?`, a: `Accessing an uninitialised lazy association after the session is closed. Fix by fetching inside the session (JOIN FETCH, entity graph, Hibernate.initialize) or using DTOs.`, level: 'Medium' },
    { q: `Difference between CascadeType.REMOVE and orphanRemoval?`, a: `REMOVE deletes children when the parent is deleted; orphanRemoval also deletes a child when it is removed from the parent's collection.`, level: 'Medium' },
    { q: `Explain first-level and second-level cache.`, a: `L1: session-scoped, always on. L2: SessionFactory-scoped, shared, optional, configured with a provider (Ehcache via JCache) and @Cacheable/@Cache.`, level: 'Medium' },
    { q: `What is the query cache?`, a: `Caches query result ids per parameter set; enabled with hibernate.cache.use_query_cache and setCacheable(true); invalidated when involved tables change.`, level: 'Medium' },
    { q: `Explain inheritance mapping strategies.`, a: `SINGLE_TABLE (one table + discriminator, fastest), JOINED (parent table + child tables joined by PK, normalized), TABLE_PER_CLASS (one full table per concrete class, UNION queries), plus @MappedSuperclass for sharing fields only.`, level: 'Medium' },
    { q: `What is optimistic locking? How is it implemented?`, a: `Detecting concurrent modification at commit time using a @Version column. UPDATE includes "where version=?"; if 0 rows match, Hibernate throws OptimisticLockException. No DB locks are held while users think.`, level: 'Hard' },
    { q: `What is pessimistic locking?`, a: `Locking rows in the DB while reading them (SELECT ... FOR UPDATE) using LockModeType.PESSIMISTIC_WRITE, so other transactions wait. Safer for high contention but reduces concurrency.`, level: 'Hard' },
    { q: `Why must entities have a no-arg constructor and not be final?`, a: `Hibernate instantiates entities by reflection using the no-arg constructor and creates proxy subclasses for lazy loading, which is impossible for final classes/methods.`, level: 'Medium' },
    { q: `How should equals() and hashCode() be implemented for entities?`, a: `Use a stable business key (e.g. ISBN, email) or the id with care: if using generated ids, equals compares non-null ids and hashCode returns a constant (getClass().hashCode()) so the hash doesn't change after persist. Never include lazy associations.`, level: 'Hard' },
    { q: `How do you do batch inserts efficiently?`, a: `Set hibernate.jdbc.batch_size, order_inserts, use SEQUENCE/TABLE ids (not IDENTITY), and flush()+clear() the session every batch to free memory; or use StatelessSession.`, level: 'Hard' },
    { q: `How does Hibernate integrate with Spring Boot?`, a: `spring-boot-starter-data-jpa auto-configures Hibernate as the JPA provider, a DataSource (HikariCP), EntityManagerFactory and transaction manager; you configure spring.datasource.* and spring.jpa.* properties and use @Transactional and JpaRepository.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Add a "renewLoan(loanId)" feature: a loan can be renewed only once and only if it is still active. Add a renewed boolean column to Loan.`,
      hint: `Check returnDate == null and !renewed inside one transaction; throw IllegalStateException otherwise.`,
      solution: `// Loan.java
private boolean renewed;
public boolean isRenewed() { return renewed; }
public void setRenewed(boolean r) { renewed = r; }

// LibraryService.java
public void renewLoan(long loanId) {
    sf.inTransaction(s -> {
        Loan l = s.get(Loan.class, loanId);
        if (l == null || l.getReturnDate() != null)
            throw new IllegalStateException("Loan not active");
        if (l.isRenewed())
            throw new IllegalStateException("Already renewed once");
        l.setRenewed(true);       // UPDATE loans set ... renewed=? where id=?
    });
}`,
    },
    {
      task: `Write a report method overdueLoans(int days) that returns active loans issued more than "days" days ago with member and book loaded (no N+1).`,
      hint: `Compute LocalDate.now().minusDays(days) in Java and pass as a parameter; use join fetch.`,
      solution: `public List<Loan> overdueLoans(int days) {
    LocalDate limit = LocalDate.now().minusDays(days);
    return sf.fromSession(s -> s.createQuery(
            "select l from Loan l join fetch l.member join fetch l.book " +
            "where l.returnDate is null and l.issueDate < :limit order by l.issueDate", Loan.class)
        .setParameter("limit", limit)
        .list());
}`,
    },
    {
      task: `Return a DTO list of members with the number of books they currently hold, including members with zero.`,
      hint: `left join with a condition on returnDate; count(l).`,
      solution: `public record MemberLoanCount(String name, Long active) {}

List<MemberLoanCount> list = s.createQuery(
    "select new com.library.dto.MemberLoanCount(m.name, count(l)) " +
    "from Member m left join Loan l on l.member = m and l.returnDate is null " +
    "group by m.name order by m.name", MemberLoanCount.class).list();
// After the demo: MemberLoanCount[name=Asha, active=1], MemberLoanCount[name=Ravi, active=1]`,
    },
    {
      task: `Convert LibraryApp into a menu-driven program (1 Add Member, 2 Issue, 3 Return, 4 Active Loans, 5 Top Borrowed, 6 Exit) using Scanner.`,
      hint: `Wrap each call in try-catch to print business errors without stopping the program.`,
      solution: `Scanner sc = new Scanner(System.in);
LibraryService lib = new LibraryService();
while (true) {
    System.out.println("1 Add Member 2 Issue 3 Return 4 Active Loans 5 Top Borrowed 6 Exit");
    int ch = sc.nextInt(); sc.nextLine();
    try {
        switch (ch) {
            case 1 -> { System.out.print("Name: "); String n = sc.nextLine();
                        System.out.print("Email: "); lib.addMember(new Member(n, sc.nextLine())); }
            case 2 -> { System.out.print("Member id: "); long m = sc.nextLong();
                        System.out.print("Book id: ");   lib.issueBook(m, sc.nextLong()); }
            case 3 -> { System.out.print("Loan id: "); lib.returnBook(sc.nextLong()); }
            case 4 -> lib.activeLoans().forEach(l ->
                        System.out.println(l.getMember().getName() + " -> " + l.getBook().getTitle()));
            case 5 -> lib.topBorrowed().forEach(r -> System.out.println(r[0] + " : " + r[1]));
            case 6 -> { HibernateUtil.shutdown(); return; }
            default -> System.out.println("Invalid choice");
        }
    } catch (RuntimeException e) {
        System.out.println("Error: " + e.getMessage());
    }
}`,
    },
    {
      task: `Enable the second-level cache for Author and Book (READ_WRITE) and the query cache for booksByAuthor(); verify with statistics that the second call runs no SQL.`,
      hint: `Add hibernate-jcache + ehcache (jakarta classifier), cache properties, @Cacheable + @Cache, and setCacheable(true).`,
      solution: `// pom.xml: org.hibernate.orm:hibernate-jcache:6.4.4.Final, org.ehcache:ehcache:3.10.8 (classifier jakarta)
// hibernate.cfg.xml:
// hibernate.cache.use_second_level_cache=true, hibernate.cache.use_query_cache=true,
// hibernate.cache.region.factory_class=jcache,
// hibernate.javax.cache.provider=org.ehcache.jsr107.EhcacheCachingProvider,
// hibernate.javax.cache.missing_cache_strategy=create, hibernate.generate_statistics=true

@Entity @Table(name = "books") @Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Book extends BaseEntity { ... }

public List<Book> booksByAuthor(String n) {
    return sf.fromSession(s -> s.createQuery(
        "select b from Book b join b.author a where a.name = :n order by b.title", Book.class)
        .setParameter("n", n).setCacheable(true).list());
}

sf.getStatistics().clear();
lib.booksByAuthor("Joshua Bloch");
lib.booksByAuthor("Joshua Bloch");
System.out.println(sf.getStatistics().getPrepareStatementCount());  // 1
System.out.println(sf.getStatistics().getQueryCacheHitCount());     // 1`,
    },
  ],
  quiz: [
    { question: `In the project, why is Loan an entity instead of a @ManyToMany between Member and Book?`, options: [`@ManyToMany is not supported by MySQL`, `The link needs extra columns like issue and return dates`, `To use EAGER fetching`, `Entities cannot have two @ManyToOne`], answer: 1, explanation: `Extra data on the relationship requires a join entity.` },
    { question: `What happens when issueBook() throws IllegalStateException inside sf.inTransaction()?`, options: [`The loan is saved anyway`, `Only the copy count is updated`, `The transaction is rolled back`, `The SessionFactory closes`], answer: 2, explanation: `inTransaction rolls back on any exception.` },
    { question: `Which annotation provides optimistic locking?`, options: [`@Version`, `@Lock`, `@Transactional`, `@Cacheable`], answer: 0, explanation: `@Version adds a version column checked on every UPDATE.` },
    { question: `Why do report methods use JOIN FETCH?`, options: [`To sort results`, `To enable caching`, `To create tables`, `To avoid N+1 and LazyInitializationException after the session closes`], answer: 3, explanation: `Associations are loaded in the same query while the session is open.` },
    { question: `Which hbm2ddl.auto value is suitable for production?`, options: [`create`, `validate`, `create-drop`, `update`], answer: 1, explanation: `validate (or none) never modifies the schema; manage changes with migration tools.` },
  ],
};
