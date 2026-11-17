export default {
  id: 'day-03-entity-annotations',
  title: 'Annotations: @Entity, @Table, @Id, @GeneratedValue, @Column',
  module: 'Module 1: Hibernate Basics',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Learn the core JPA mapping annotations that turn a class into a table, choose the right primary key generation strategy for MySQL, and control column names, lengths, nullability and types.`,
  objectives: [
    `Use @Entity and @Table to map a class to a specific table`,
    `Define primary keys with @Id and pick a strategy in @GeneratedValue (IDENTITY, SEQUENCE, TABLE, AUTO, UUID)`,
    `Customise columns with @Column (name, length, nullable, unique, precision, scale)`,
    `Use helper annotations @Transient, @Enumerated, @Lob and java.time types`,
    `Read the DDL that Hibernate generates from the annotations`,
  ],
  theory: [
    {
      heading: `@Entity and @Table`,
      content: `@Entity tells Hibernate "this class is persistent; store its objects in a table". By default the table name is the entity name, which is the simple class name (Student -> table Student; MySQL on Linux is case sensitive for table names!).

@Table lets you choose the table name and more.

Analogy: @Entity is registering a shop; @Table is the signboard name you hang outside.`,
      syntax: `@Entity                        // entity name = "Student" (used in HQL)
@Table(name = "students",       // real table name
       uniqueConstraints = @UniqueConstraint(columnNames = {"email"}),
       indexes = @Index(name = "idx_name", columnList = "name"))
public class Student { ... }

@Entity(name = "Stud")          // changes the HQL entity name, rarely needed`,
      points: [
        `@Entity name is used in HQL/JPQL ("from Student"), @Table name is used in SQL`,
        `Prefer plural snake_case table names: students, order_items`,
        `Import from jakarta.persistence, never org.hibernate.annotations.Entity (removed)`,
      ],
    },
    {
      heading: `@Id and @GeneratedValue Strategies`,
      content: `@Id marks the primary key field. @GeneratedValue asks Hibernate/DB to create the value automatically.

  IDENTITY -> uses the DB auto_increment column. Best and simplest for MySQL.
              Downside: INSERT runs immediately on persist() and JDBC batch inserts are disabled.
  SEQUENCE -> uses a DB sequence (Oracle, PostgreSQL). MySQL has no sequences, so Hibernate emulates it with a table.
  TABLE    -> uses a separate table to hold next ids. Portable but slow (row locking).
  AUTO     -> Hibernate chooses. In Hibernate 6 for numeric ids this means SEQUENCE; on MySQL it creates a helper table like students_seq.
  UUID     -> generates a java.util.UUID (Hibernate 6 / JPA 3.1).

Analogy: IDENTITY is a token machine at the counter (DB gives the number). SEQUENCE/TABLE is a ticket roll that Hibernate tears 50 tickets from at a time (allocationSize).`,
      syntax: `@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Id
@GeneratedValue(strategy = GenerationType.UUID)
private java.util.UUID id;

@Id                               // no @GeneratedValue -> you must set id yourself
private String isbn;`,
      tip: `For MySQL always write strategy = GenerationType.IDENTITY explicitly; otherwise AUTO creates an extra *_seq table which surprises beginners.`,
    },
    {
      heading: `@Column – Controlling Columns`,
      content: `Every non-static, non-transient field becomes a column even without @Column. Use @Column to customise it.`,
      syntax: `@Column(name = "full_name",   // column name
        length = 100,            // VARCHAR(100), default 255
        nullable = false,        // NOT NULL
        unique = true,           // UNIQUE constraint
        updatable = false,       // excluded from UPDATE
        insertable = true,       // included in INSERT
        columnDefinition = "TEXT")
private String name;

@Column(precision = 10, scale = 2)   // DECIMAL(10,2) for BigDecimal
private BigDecimal price;`,
      points: [
        `nullable, length, unique, precision, scale only affect DDL generation (hbm2ddl); they do not validate in Java`,
        `For Java-side validation use Bean Validation (@NotNull, @Size) – covered in Spring Boot`,
        `Wrapper types (Integer, Double) can be NULL; primitives (int, double) become NOT NULL columns`,
      ],
    },
    {
      heading: `Other Useful Field Annotations`,
      content: `@Transient – field is NOT saved (e.g. a calculated age or a temporary confirmPassword).
@Enumerated(EnumType.STRING) – save enum as its name ("ELECTRONICS"). Default ORDINAL saves 0,1,2 and breaks when you reorder enum constants – always use STRING.
@Lob – large text/binary (LONGTEXT / LONGBLOB in MySQL).
java.time types (LocalDate, LocalDateTime, Instant) are supported directly – no @Temporal needed (that was for old java.util.Date).
@CreationTimestamp / @UpdateTimestamp (org.hibernate.annotations) – Hibernate fills timestamps automatically.`,
      points: [
        `Java keyword transient also skips the field, but @Transient is clearer`,
        `In Hibernate 6.2+ on MySQL, @Enumerated(STRING) creates a native enum('A','B') column`,
      ],
    },
    {
      heading: `Field Access vs Property Access`,
      content: `Where you put @Id decides how Hibernate reads values:
- @Id on a FIELD -> field access: Hibernate reads/writes fields directly via reflection (getters not needed for persistence).
- @Id on a GETTER -> property access: Hibernate calls getters/setters.

Do not mix both styles in one class. Field access is the most common and recommended.`,
    },
    {
      heading: `Naming and Common Mistakes`,
      content: `Hibernate 6 converts camelCase attribute names to column names as-is by default (createdOn stays createdOn) unless you use @Column(name="created_on") or a physical naming strategy. Spring Boot adds a snake_case strategy automatically, plain Hibernate does not.`,
      points: [
        `Reserved words as table/column names (order, user, desc) cause SQL syntax errors – rename to orders, app_user`,
        `Using EnumType.ORDINAL and later inserting a new constant in the middle corrupts data`,
        `Using float/double for money – use BigDecimal with precision and scale`,
        `Forgetting that @Column(length) changes nothing if the table already exists and hbm2ddl is update`,
      ],
    },
  ],
  examples: [
    {
      title: `Product Entity with Rich Column Mapping`,
      scenario: `An e-commerce Product with custom table name, NOT NULL and UNIQUE name, money as DECIMAL, enum category, date and a transient field.`,
      steps: [
        `Create enum com.demo.entity.Category and class com.demo.entity.Product (IntelliJ: New > Java Class > Enum / Class; Eclipse: File > New > Enum / Class)`,
        `Add <mapping class="com.demo.entity.Product"/> to hibernate.cfg.xml`,
        `Set hbm2ddl.auto to create for this demo and run ProductApp`,
        `In MySQL Workbench run DESCRIBE products; to compare with the DDL`,
      ],
      code: `// ===== Category.java =====
package com.demo.entity;
public enum Category { ELECTRONICS, BOOKS, FASHION }

// ===== Product.java =====
package com.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", length = 100, nullable = false, unique = true)
    private String name;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "created_on")
    private LocalDate createdOn;

    @Transient
    private BigDecimal priceWithGst;      // not stored

    public Product() {}
    public Product(String name, BigDecimal price, Category category) {
        this.name = name; this.price = price; this.category = category;
        this.createdOn = LocalDate.of(2025, 1, 15);
    }
    public BigDecimal getPriceWithGst() {
        return price.multiply(new BigDecimal("1.18"));
    }
    public Long getId() { return id; }
    public String getName() { return name; }
}

// ===== ProductApp.java =====
package com.demo;

import com.demo.entity.*;
import com.demo.util.HibernateUtil;
import org.hibernate.*;
import java.math.BigDecimal;

public class ProductApp {
    public static void main(String[] args) {
        try (Session s = HibernateUtil.getSessionFactory().openSession()) {
            Transaction tx = s.beginTransaction();
            Product p = new Product("Laptop", new BigDecimal("55000.00"), Category.ELECTRONICS);
            s.persist(p);
            tx.commit();
            System.out.println(p.getId() + " " + p.getName() + " with GST " + p.getPriceWithGst());
        }
        HibernateUtil.shutdown();
    }
}`,
      result: `Hibernate: create table products (id bigint not null auto_increment, category enum ('BOOKS','ELECTRONICS','FASHION'), created_on date, product_name varchar(100) not null, price decimal(10,2) not null, primary key (id)) engine=InnoDB
Hibernate: alter table products add constraint UK_... unique (product_name)
Hibernate: insert into products (category,created_on,product_name,price) values (?,?,?,?)
1 Laptop with GST 64900.0000`,
      explanation: `Long -> bigint, BigDecimal(10,2) -> decimal(10,2), LocalDate -> date, enum STRING -> MySQL enum (Hibernate 6.2+). priceWithGst is @Transient so it has no column. The unique constraint name (UK_...) is generated randomly. 55000.00 x 1.18 = 64900.0000 (scale 2 + scale 2 = 4).`,
    },
    {
      title: `GenerationType.AUTO on MySQL – the Hidden _seq Table`,
      scenario: `See why AUTO creates an extra table on MySQL in Hibernate 6.`,
      steps: [
        `Create entity Book with @GeneratedValue (no strategy = AUTO)`,
        `Register it and run with hbm2ddl.auto=create`,
        `Look at the SQL and then run SHOW TABLES; in MySQL`,
      ],
      code: `@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue          // AUTO by default
    private Long id;
    private String title;
    public Book() {}
    public Book(String title) { this.title = title; }
}

// main:
Transaction tx = session.beginTransaction();
session.persist(new Book("Java Basics"));
session.persist(new Book("Hibernate in Action"));
tx.commit();`,
      result: `Hibernate: create table books (id bigint not null, title varchar(255), primary key (id)) engine=InnoDB
Hibernate: create table books_seq (next_val bigint) engine=InnoDB
Hibernate: insert into books_seq values ( 1 )
Hibernate: select next_val as id_val from books_seq for update
Hibernate: update books_seq set next_val= ? where next_val=?
Hibernate: insert into books (title,id) values (?,?)
Hibernate: insert into books (title,id) values (?,?)`,
      explanation: `MySQL has no sequences, so Hibernate emulates one with books_seq. It reserves a block of 50 ids (allocationSize=50) with one SELECT ... FOR UPDATE, so both inserts reuse the block. Notice the INSERTs run only at commit (unlike IDENTITY) and the id column has no auto_increment.`,
    },
    {
      title: `UUID Primary Key and Timestamps`,
      scenario: `An Order table where ids must be globally unique and creation/update times are filled automatically.`,
      steps: [
        `Create class PurchaseOrder (avoid the reserved word "order")`,
        `Register it in hibernate.cfg.xml and run`,
        `Update the amount in a second transaction and observe updated_at change`,
      ],
      code: `package com.demo.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private double amount;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PurchaseOrder() {}
    public PurchaseOrder(double amount) { this.amount = amount; }
    public UUID getId() { return id; }
    public void setAmount(double amount) { this.amount = amount; }
}`,
      result: `Hibernate: create table purchase_orders (id binary(16) not null, amount float(53) not null, created_at datetime(6), updated_at datetime(6), primary key (id)) engine=InnoDB
Hibernate: insert into purchase_orders (amount,created_at,updated_at,id) values (?,?,?,?)`,
      explanation: `UUID is generated in Java before insert and stored as binary(16) on MySQL. @CreationTimestamp and @UpdateTimestamp set the time automatically; updatable=false keeps created_at fixed forever.`,
    },
    {
      title: `Composite-friendly Natural Id without Generation`,
      scenario: `Library books identified by ISBN supplied by the user – no generated value.`,
      steps: [
        `Create entity LibraryBook with @Id on String isbn and no @GeneratedValue`,
        `Persist two books with explicit ISBNs`,
        `Try persisting the same ISBN twice in a new session to see the error`,
      ],
      code: `@Entity
@Table(name = "library_books")
public class LibraryBook {
    @Id
    @Column(length = 13)
    private String isbn;

    @Column(nullable = false)
    private String title;

    public LibraryBook() {}
    public LibraryBook(String isbn, String title) { this.isbn = isbn; this.title = title; }
}

// main
Transaction tx = session.beginTransaction();
session.persist(new LibraryBook("9780134685991", "Effective Java"));
session.persist(new LibraryBook("9781617294945", "Spring in Action"));
tx.commit();`,
      result: `Hibernate: create table library_books (isbn varchar(13) not null, title varchar(255) not null, primary key (isbn)) engine=InnoDB
Hibernate: insert into library_books (title,isbn) values (?,?)
Hibernate: insert into library_books (title,isbn) values (?,?)

(second run with same ISBN)
ConstraintViolationException: Duplicate entry '9780134685991' for key 'library_books.PRIMARY'`,
      explanation: `When you assign the id yourself, Hibernate does not generate anything. Duplicates are caught by the database primary key constraint and reported as ConstraintViolationException.`,
    },
  ],
  interview: [
    { q: `What is the difference between @Entity name and @Table name?`, a: `@Entity(name) is the logical name used in HQL/JPQL queries. @Table(name) is the physical table name used in SQL. By default both are the class's simple name.`, level: 'Medium' },
    { q: `Explain the GenerationType strategies.`, a: `IDENTITY uses an auto-increment column; SEQUENCE uses a DB sequence with allocation; TABLE uses a separate key table; AUTO lets Hibernate choose (SEQUENCE in Hibernate 6); UUID generates a UUID.`, level: 'Medium' },
    { q: `Which generation strategy is best for MySQL and why?`, a: `IDENTITY, because MySQL supports AUTO_INCREMENT natively and has no sequences. AUTO would create an emulated *_seq table.`, level: 'Medium' },
    { q: `Why does IDENTITY disable JDBC batch inserts?`, a: `Hibernate must know the id right after persist() to put the entity in the persistence context, and with IDENTITY only the DB knows it after the INSERT. So it executes each INSERT immediately and cannot batch them.`, level: 'Hard' },
    { q: `What does @Transient do?`, a: `Excludes a field from persistence; no column is created and the value is never saved or loaded.`, level: 'Easy' },
    { q: `Why prefer EnumType.STRING over ORDINAL?`, a: `ORDINAL stores the position (0,1,2). Reordering or inserting constants changes positions and corrupts existing data. STRING stores the name, which is stable and readable.`, level: 'Medium' },
    { q: `Do @Column(nullable=false) and length validate data in Java?`, a: `No, they only influence DDL generation. The DB enforces them if the table was generated that way. Use Bean Validation (@NotNull, @Size) for Java-side checks.`, level: 'Medium' },
    { q: `What is the default length of a String column?`, a: `255, mapped to varchar(255).`, level: 'Easy' },
    { q: `What is allocationSize in @SequenceGenerator?`, a: `How many ids Hibernate reserves per round trip to the sequence (default 50). Larger values reduce DB calls; ids may have gaps after restart.`, level: 'Hard' },
    { q: `Difference between field access and property access?`, a: `Decided by the placement of @Id. Field access reads/writes fields directly; property access uses getters/setters. Don't mix them in one entity.`, level: 'Medium' },
    { q: `Is @Temporal needed with LocalDate?`, a: `No. @Temporal was for java.util.Date/Calendar. java.time types are supported natively since JPA 2.2.`, level: 'Easy' },
  ],
  practice: [
    {
      task: `Create an Employee entity mapped to table emp_master with columns emp_id (PK auto increment), emp_name (varchar 60, not null), email (unique), salary DECIMAL(12,2), joining_date DATE, department enum stored as text.`,
      hint: `Use @Column(name=...) for each, BigDecimal for salary, @Enumerated(STRING).`,
      solution: `package com.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "emp_master")
public class Employee {
    public enum Department { HR, IT, SALES }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emp_id")
    private Long id;

    @Column(name = "emp_name", length = 60, nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    @Column(precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    private Department department;

    public Employee() {}
}`,
    },
    {
      task: `Add a @Transient field fullName to a Customer entity that is calculated from firstName + lastName, and prove it is not stored.`,
      hint: `Check DESCRIBE customers in MySQL.`,
      solution: `@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;

    @Transient
    private String fullName;

    public Customer() {}
    public Customer(String f, String l) { firstName = f; lastName = l; }
    public String getFullName() { return firstName + " " + lastName; }
}
// DDL: create table customers (id bigint not null auto_increment, firstName varchar(255), lastName varchar(255), primary key (id)) engine=InnoDB
// No fullName column.`,
    },
    {
      task: `Use a custom table-backed sequence for Invoice ids that starts at 1000 and allocates 1 id at a time.`,
      hint: `@SequenceGenerator(name, sequenceName, initialValue, allocationSize) with strategy SEQUENCE.`,
      solution: `@Entity
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "inv_gen")
    @SequenceGenerator(name = "inv_gen", sequenceName = "invoice_seq",
                       initialValue = 1000, allocationSize = 1)
    private Long id;
    private double total;
    public Invoice() {}
    public Invoice(double total) { this.total = total; }
}
// On MySQL Hibernate creates table invoice_seq(next_val) starting at 1000.
// The first invoice gets id 1000, the next 1001.`,
    },
    {
      task: `Find and fix 4 mistakes in this entity: final class Order { @Id int id; @Enumerated Status status; float price; Order(int id){this.id=id;} }`,
      hint: `Reserved word, final, constructor, enum type, money type, missing @Entity.`,
      solution: `@Entity
@Table(name = "orders")                    // 'order' is reserved in SQL
public class CustomerOrder {               // not final, proxies need subclassing
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)           // not ORDINAL
    private Status status;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;              // not float for money

    public CustomerOrder() {}              // no-arg constructor
}`,
    },
  ],
  quiz: [
    { question: `Which strategy uses MySQL AUTO_INCREMENT?`, options: [`SEQUENCE`, `TABLE`, `IDENTITY`, `UUID`], answer: 2, explanation: `IDENTITY relies on the database identity/auto_increment column.` },
    { question: `What does @Enumerated(EnumType.ORDINAL) store?`, options: [`The enum position number`, `The enum name`, `The enum toString()`, `Nothing`], answer: 0, explanation: `ORDINAL stores 0, 1, 2 ...; this is the default and is fragile.` },
    { question: `Which annotation prevents a field from being saved?`, options: [`@Column(insertable=false)`, `@Lob`, `@Basic`, `@Transient`], answer: 3, explanation: `@Transient fields are not persistent at all.` },
    { question: `@Column(precision = 10, scale = 2) on a BigDecimal produces ...`, options: [`varchar(10)`, `decimal(10,2)`, `double`, `int(10)`], answer: 1, explanation: `precision is total digits, scale is digits after the decimal point.` },
    { question: `In Hibernate 6 on MySQL, plain @GeneratedValue (AUTO) on a Long id ...`, options: [`uses auto_increment`, `throws an error`, `creates a <entity>_seq table`, `generates UUIDs`], answer: 2, explanation: `AUTO maps to SEQUENCE, emulated with a table on MySQL.` },
  ],
};
