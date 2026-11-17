export default {
  id: 'day-14-spring-hibernate-integration',
  title: 'Spring + Hibernate Integration (Spring ORM)',
  module: 'Module 4: Spring MVC',
  day: 14,
  level: 'Advanced',
  duration: '3 hours',
  summary: `Let Spring manage Hibernate 6: configure DataSource, LocalSessionFactoryBean (or JPA EntityManagerFactory) and a transaction manager, write DAOs with getCurrentSession() or @PersistenceContext, and wire everything into a layered Spring MVC application.`,
  objectives: [
    `Explain what Spring ORM adds to plain Hibernate`,
    `Configure LocalSessionFactoryBean + HibernateTransactionManager in Java config`,
    `Write a DAO using sessionFactory.getCurrentSession() inside @Transactional services`,
    `Use the JPA style (LocalContainerEntityManagerFactoryBean, @PersistenceContext EntityManager)`,
    `Build the Controller -> Service -> DAO layers and understand DI between them`,
  ],
  theory: [
    {
      heading: 'Why integrate Spring with Hibernate?',
      content: `In plain Hibernate (Hibernate course) you build the SessionFactory yourself, open sessions, begin/commit transactions and close everything manually in every DAO method. With Spring ORM: Spring creates the SessionFactory as a bean, injects it into DAOs, binds one Session to the current transaction, and @Transactional handles begin/commit/rollback. Hibernate exceptions are translated into DataAccessException (thanks to @Repository). Analogy: Hibernate is a powerful car engine; Spring is the car body with automatic gearbox, so you just drive.`,
      points: [
        `No hibernate.cfg.xml needed: settings go into Java config`,
        `No manual session.beginTransaction()/commit()/close()`,
        `Connection pooling via a DataSource bean (HikariCP)`,
        `DAOs become simple, testable beans`,
      ],
    },
    {
      heading: 'Dependencies (Spring 6.1 + Hibernate 6)',
      content: `spring-orm brings Spring's Hibernate/JPA integration; hibernate-core 6.x brings Hibernate and jakarta.persistence API.`,
      syntax: `<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-orm</artifactId>
  <version>6.1.14</version>
</dependency>
<dependency>
  <groupId>org.hibernate.orm</groupId>
  <artifactId>hibernate-core</artifactId>
  <version>6.5.3.Final</version>
</dependency>
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <version>8.4.0</version>
</dependency>
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP</artifactId>
  <version>5.1.0</version>
</dependency>`,
      tip: `Confusing but correct: in Spring 6 the native Hibernate support classes are still in the package org.springframework.orm.hibernate5 (LocalSessionFactoryBean, HibernateTransactionManager), and they work with Hibernate 6.`,
    },
    {
      heading: 'Option 1: native Hibernate (SessionFactory)',
      content: `LocalSessionFactoryBean is a FactoryBean that builds a SessionFactory from a DataSource, packages to scan for @Entity classes and Hibernate properties. HibernateTransactionManager ties transactions to Sessions. In DAOs call sessionFactory.getCurrentSession(); it returns the Session bound to the current Spring transaction, so the calling service method MUST be @Transactional, otherwise you get "Could not obtain transaction-synchronized Session for current thread".`,
      syntax: `@Bean
public LocalSessionFactoryBean sessionFactory(DataSource ds) {
    LocalSessionFactoryBean f = new LocalSessionFactoryBean();
    f.setDataSource(ds);
    f.setPackagesToScan("com.demo.entity");
    Properties p = new Properties();
    p.put("hibernate.hbm2ddl.auto", "update");
    p.put("hibernate.show_sql", "true");
    p.put("hibernate.format_sql", "true");
    f.setHibernateProperties(p);
    return f;
}
@Bean
public HibernateTransactionManager transactionManager(SessionFactory sf) {
    return new HibernateTransactionManager(sf);
}`,
    },
    {
      heading: 'Option 2: JPA style (EntityManager) - recommended',
      content: `JPA is the standard API; Hibernate is the implementation. Spring's LocalContainerEntityManagerFactoryBean with HibernateJpaVendorAdapter builds the EntityManagerFactory, and JpaTransactionManager manages transactions. In DAOs inject a thread-safe shared EntityManager proxy with @PersistenceContext. Spring Boot and Spring Data JPA use exactly this setup, so learning it now makes Spring Boot easy.`,
      syntax: `@PersistenceContext
private EntityManager em;      // jakarta.persistence.EntityManager

public void save(Book b) { em.persist(b); }
public Book find(int id) { return em.find(Book.class, id); }
public List<Book> findAll() { return em.createQuery("from Book", Book.class).getResultList(); }`,
    },
    {
      heading: 'Layered architecture',
      content: `Diagram in words: Browser -> BookController (@Controller, web) -> BookService (@Service, business rules, @Transactional) -> BookDao (@Repository, Hibernate) -> MySQL. Each layer depends only on the layer below, through constructor injection. In a web app, put DataSource/SessionFactory/services/DAOs in the ROOT context (getRootConfigClasses) and controllers/view resolvers in the servlet context (getServletConfigClasses).`,
      points: [
        `@Transactional belongs on the service layer (one business operation = one transaction)`,
        `Controllers never touch Session/EntityManager directly`,
        `Lazy-loaded associations must be accessed inside the transaction or fetched with JOIN FETCH (avoid LazyInitializationException in JSP)`,
      ],
    },
  ],
  examples: [
    {
      title: 'Layered design with DI (plain Java, swappable DAO)',
      scenario: `Before adding Hibernate, see the layer structure: BookService depends on the BookDao interface. Here we inject an in-memory DAO; in Spring we will inject a Hibernate DAO without changing BookService. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Notice BookService never knows which DAO implementation it uses',
      ],
      code: `import java.util.*;

record Book(int id, String title, double price) { }

interface BookDao {
    void save(Book b);
    Optional<Book> findById(int id);
    List<Book> findAll();
}

class InMemoryBookDao implements BookDao {            // later: HibernateBookDao
    private final Map<Integer, Book> store = new TreeMap<>();
    public void save(Book b) { store.put(b.id(), b); System.out.println("[InMemoryDao] saved " + b.title()); }
    public Optional<Book> findById(int id) { return Optional.ofNullable(store.get(id)); }
    public List<Book> findAll() { return new ArrayList<>(store.values()); }
}

class BookService {                                    // @Service + @Transactional in Spring
    private final BookDao dao;
    BookService(BookDao dao) { this.dao = dao; }       // constructor injection

    void add(Book b) {
        if (b.price() <= 0) throw new IllegalArgumentException("Price must be positive");
        dao.save(b);
    }
    double totalValue() { return dao.findAll().stream().mapToDouble(Book::price).sum(); }
    Book get(int id) {
        return dao.findById(id).orElseThrow(() -> new NoSuchElementException("Book " + id + " not found"));
    }
}

public class Main {
    public static void main(String[] args) {
        BookDao dao = new InMemoryBookDao();           // Spring would inject this
        BookService service = new BookService(dao);

        service.add(new Book(2, "Spring in Action", 650.0));
        service.add(new Book(1, "Java Basics", 350.5));
        try {
            service.add(new Book(3, "Bad Book", 0));
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
        for (Book b : dao.findAll()) System.out.println(b);
        System.out.println("Total: " + service.totalValue());
        System.out.println(service.get(1).title());
        try {
            service.get(9);
        } catch (NoSuchElementException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

record Book(int id, String title, double price) { }

interface BookDao {
    void save(Book b);
    Optional<Book> findById(int id);
    List<Book> findAll();
}

class InMemoryBookDao implements BookDao {
    private final Map<Integer, Book> store = new TreeMap<>();
    public void save(Book b) { store.put(b.id(), b); System.out.println("[InMemoryDao] saved " + b.title()); }
    public Optional<Book> findById(int id) { return Optional.ofNullable(store.get(id)); }
    public List<Book> findAll() { return new ArrayList<>(store.values()); }
}

class BookService {
    private final BookDao dao;
    BookService(BookDao dao) { this.dao = dao; }

    void add(Book b) {
        if (b.price() <= 0) throw new IllegalArgumentException("Price must be positive");
        dao.save(b);
    }
    double totalValue() { return dao.findAll().stream().mapToDouble(Book::price).sum(); }
    Book get(int id) {
        return dao.findById(id).orElseThrow(() -> new NoSuchElementException("Book " + id + " not found"));
    }
}

public class Main {
    public static void main(String[] args) {
        BookDao dao = new InMemoryBookDao();
        BookService service = new BookService(dao);

        service.add(new Book(2, "Spring in Action", 650.0));
        service.add(new Book(1, "Java Basics", 350.5));
        try {
            service.add(new Book(3, "Bad Book", 0));
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
        for (Book b : dao.findAll()) System.out.println(b);
        System.out.println("Total: " + service.totalValue());
        System.out.println(service.get(1).title());
        try {
            service.get(9);
        } catch (NoSuchElementException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`,
        },
      },
      result: `[InMemoryDao] saved Spring in Action
[InMemoryDao] saved Java Basics
Error: Price must be positive
Book[id=1, title=Java Basics, price=350.5]
Book[id=2, title=Spring in Action, price=650.0]
Total: 1000.5
Java Basics
Error: Book 9 not found`,
      explanation: `TreeMap keeps books sorted by id, so id 1 prints first even though it was added second. The service holds business rules (price check) and depends only on the BookDao interface: this is exactly the shape of a Spring + Hibernate app, where Spring injects HibernateBookDao instead.`,
    },
    {
      title: 'Spring + native Hibernate: SessionFactory configuration and DAO',
      scenario: `Persist and read Book entities with LocalSessionFactoryBean and getCurrentSession().`,
      steps: [
        'Create database: CREATE DATABASE springdb; (MySQL Workbench or CLI)',
        'Eclipse/STS: File > New > Maven Project; IntelliJ: File > New > Project > Maven (JDK 17). Add spring-context, spring-orm, hibernate-core, mysql-connector-j, HikariCP; reload Maven',
        'Create packages com.demo.config, com.demo.entity, com.demo.dao, com.demo.service',
        'Add the classes below and run OrmApp; the table is created by hbm2ddl.auto=update',
      ],
      code: `// entity/Book.java
package com.demo.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "book")
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false, length = 100)
    private String title;
    private double price;

    public Book() { }
    public Book(String title, double price) { this.title = title; this.price = price; }
    public Integer getId() { return id; }
    public String getTitle() { return title; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    @Override public String toString() { return "Book[" + id + ", " + title + ", " + price + "]"; }
}

// config/HibernateConfig.java
package com.demo.config;
import java.util.Properties;
import javax.sql.DataSource;
import com.zaxxer.hikari.HikariDataSource;
import org.hibernate.SessionFactory;
import org.springframework.context.annotation.*;
import org.springframework.orm.hibernate5.HibernateTransactionManager;
import org.springframework.orm.hibernate5.LocalSessionFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@ComponentScan("com.demo")
@EnableTransactionManagement
public class HibernateConfig {
    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("jdbc:mysql://localhost:3306/springdb");
        ds.setUsername("root");
        ds.setPassword("root");
        return ds;
    }

    @Bean
    public LocalSessionFactoryBean sessionFactory(DataSource ds) {
        LocalSessionFactoryBean f = new LocalSessionFactoryBean();
        f.setDataSource(ds);
        f.setPackagesToScan("com.demo.entity");
        Properties p = new Properties();
        p.put("hibernate.hbm2ddl.auto", "update");
        p.put("hibernate.show_sql", "true");
        f.setHibernateProperties(p);
        return f;
    }

    @Bean
    public HibernateTransactionManager transactionManager(SessionFactory sf) {
        return new HibernateTransactionManager(sf);
    }
}

// dao/BookDao.java
package com.demo.dao;
import java.util.List;
import com.demo.entity.Book;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

@Repository
public class BookDao {
    private final SessionFactory sessionFactory;
    public BookDao(SessionFactory sessionFactory) { this.sessionFactory = sessionFactory; }

    public void save(Book b) { sessionFactory.getCurrentSession().persist(b); }
    public Book findById(int id) { return sessionFactory.getCurrentSession().get(Book.class, id); }
    public List<Book> findAll() {
        return sessionFactory.getCurrentSession().createQuery("from Book order by id", Book.class).getResultList();
    }
}

// service/BookService.java
package com.demo.service;
import java.util.List;
import com.demo.dao.BookDao;
import com.demo.entity.Book;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookService {
    private final BookDao dao;
    public BookService(BookDao dao) { this.dao = dao; }

    public Book add(String title, double price) {
        if (price <= 0) throw new IllegalArgumentException("Price must be positive");
        Book b = new Book(title, price);
        dao.save(b);
        return b;
    }
    public void changePrice(int id, double price) {
        Book b = dao.findById(id);
        b.setPrice(price);                // no save() needed: dirty checking at commit
    }
    @Transactional(readOnly = true)
    public List<Book> all() { return dao.findAll(); }
}

// OrmApp.java
package com.demo;
import com.demo.config.HibernateConfig;
import com.demo.entity.Book;
import com.demo.service.BookService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class OrmApp {
    public static void main(String[] args) {
        try (var ctx = new AnnotationConfigApplicationContext(HibernateConfig.class)) {
            BookService service = ctx.getBean(BookService.class);
            Book b = service.add("Spring in Action", 650);
            service.add("Java Basics", 350.5);
            service.changePrice(b.getId(), 599);
            service.all().forEach(System.out::println);
        }
    }
}`,
      result: `(Hibernate SQL lines such as "Hibernate: insert into book ..." , "Hibernate: select ... from book ..." and "Hibernate: update book ..." appear because show_sql=true, followed by:)
Book[1, Spring in Action, 599.0]
Book[2, Java Basics, 350.5]`,
      explanation: `Assumes an empty book table. No beginTransaction/commit/close anywhere: @Transactional on BookService opens a Session + transaction per method, and changePrice is saved automatically by Hibernate dirty checking when Spring commits. Calling dao.findAll() from a non-transactional context would fail because getCurrentSession() needs a Spring transaction.`,
    },
    {
      title: 'JPA style: EntityManagerFactory + @PersistenceContext',
      scenario: `The same app using standard JPA APIs (the Spring Boot way).`,
      steps: [
        'Replace HibernateConfig with JpaConfig below (keep the same dependencies)',
        'Rewrite BookDao to use EntityManager',
        'Run OrmApp with JpaConfig.class',
      ],
      code: `// config/JpaConfig.java
@Configuration
@ComponentScan("com.demo")
@EnableTransactionManagement
public class JpaConfig {
    @Bean
    public DataSource dataSource() { /* same HikariDataSource as before */ }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource ds) {
        var emf = new LocalContainerEntityManagerFactoryBean();
        emf.setDataSource(ds);
        emf.setPackagesToScan("com.demo.entity");
        emf.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        Properties p = new Properties();
        p.put("hibernate.hbm2ddl.auto", "update");
        p.put("hibernate.show_sql", "true");
        emf.setJpaProperties(p);
        return emf;
    }

    @Bean
    public JpaTransactionManager transactionManager(EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}

// dao/BookDao.java
@Repository
public class BookDao {
    @PersistenceContext
    private EntityManager em;                 // jakarta.persistence.EntityManager (shared, thread-safe proxy)

    public void save(Book b) { em.persist(b); }
    public Book findById(int id) { return em.find(Book.class, id); }
    public List<Book> findAll() {
        return em.createQuery("select b from Book b order by b.id", Book.class).getResultList();
    }
}`,
      result: `Same output as Example 2 (on a fresh table): Book[1, Spring in Action, 599.0] and Book[2, Java Basics, 350.5].`,
      explanation: `BookService did not change at all, because it depends only on BookDao methods. @PersistenceContext injects a proxy that routes to the EntityManager bound to the current transaction.`,
    },
    {
      title: 'Wiring it into Spring MVC',
      scenario: `Show the book list in a JSP page from the Day 11 web project.`,
      steps: [
        'Add spring-webmvc, jakarta.servlet-api (provided) and JSTL to the ORM project pom and set <packaging>war</packaging>',
        'In AppInitializer return JpaConfig in getRootConfigClasses() and WebConfig in getServletConfigClasses(); make JpaConfig scan only service/dao packages and WebConfig only controllers',
        'Create BookController and books.jsp; run on Tomcat 10.1 and open /spring-mvc/books',
      ],
      code: `// AppInitializer
protected Class<?>[] getRootConfigClasses() { return new Class<?>[] { JpaConfig.class }; }
protected Class<?>[] getServletConfigClasses() { return new Class<?>[] { WebConfig.class }; }
protected String[] getServletMappings() { return new String[] { "/" }; }

// BookController.java
@Controller
@RequestMapping("/books")
public class BookController {
    private final BookService service;
    public BookController(BookService service) { this.service = service; }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("books", service.all());
        return "books";
    }

    @PostMapping
    public String add(@RequestParam String title, @RequestParam double price) {
        service.add(title, price);
        return "redirect:/books";
    }
}

<%-- books.jsp --%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
<h2>Books</h2>
<table border="1">
  <tr><th>Id</th><th>Title</th><th>Price</th></tr>
  <c:forEach var="b" items="\${books}">
    <tr><td>\${b.id}</td><td>\${b.title}</td><td>\${b.price}</td></tr>
  </c:forEach>
</table>
<form method="post" action="\${pageContext.request.contextPath}/books">
  <input name="title" placeholder="Title"/> <input name="price" placeholder="Price"/> <button>Add</button>
</form>
</body></html>`,
      result: `/spring-mvc/books shows a table: 1 | Spring in Action | 599.0 and 2 | Java Basics | 350.5, plus a form; adding a book redirects back and shows the new row.`,
      explanation: `The controller (servlet context) gets BookService from the parent root context. Transactions start in the service, so the JSP only receives fully loaded entities.`,
    },
  ],
  interview: [
    { q: 'What does Spring ORM provide?', a: 'Integration for Hibernate/JPA: SessionFactory/EntityManagerFactory as beans, transaction-bound sessions, declarative transactions, and exception translation to DataAccessException.', level: 'Easy' },
    { q: 'What is LocalSessionFactoryBean?', a: 'A Spring FactoryBean that builds a Hibernate SessionFactory from a DataSource, entity packages and Hibernate properties.', level: 'Medium' },
    { q: 'getCurrentSession() vs openSession()?', a: 'getCurrentSession returns the Session bound to the current Spring transaction and is closed automatically. openSession creates a new Session that you must manage and close yourself.', level: 'Medium' },
    { q: 'Why do you get "Could not obtain transaction-synchronized Session"?', a: 'getCurrentSession() was called outside a Spring-managed transaction; add @Transactional to the calling service method and enable transaction management.', level: 'Hard' },
    { q: 'HibernateTransactionManager vs JpaTransactionManager?', a: 'HibernateTransactionManager works with a native SessionFactory; JpaTransactionManager with an EntityManagerFactory (JPA). Both can also expose the transaction to JDBC code on the same DataSource.', level: 'Medium' },
    { q: 'What is @PersistenceContext?', a: 'Injects a container-managed, transaction-scoped EntityManager (a thread-safe shared proxy) into a bean.', level: 'Medium' },
    { q: 'Why is @Transactional placed on the service layer and not the DAO?', a: 'A business operation often involves multiple DAO calls that must commit or roll back together.', level: 'Medium' },
    { q: 'Why do you not need to call update() after changing a managed entity?', a: 'Hibernate dirty checking compares the entity with its snapshot at flush/commit and issues UPDATE automatically.', level: 'Medium' },
    { q: 'What does @Repository add with Hibernate?', a: 'PersistenceExceptionTranslationPostProcessor translates Hibernate/JPA exceptions into Spring DataAccessException subclasses.', level: 'Medium' },
    { q: 'What is LazyInitializationException and how is it avoided in MVC apps?', a: 'Accessing a lazy association after the Session closed. Fetch needed data inside the transaction (JOIN FETCH, DTOs), or use Open Session In View (not recommended).', level: 'Hard' },
    { q: 'What are root and servlet contexts in a Spring MVC + Hibernate app?', a: 'Root context holds DataSource, SessionFactory, services, DAOs; servlet context holds controllers and view resolvers and can see root beans.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Plain Java: write a second BookDao implementation, LoggingBookDao, that wraps another BookDao and prints "save called" before delegating. Inject it into BookService without changing BookService.',
      hint: 'Decorator: constructor takes a BookDao.',
      solution: `class LoggingBookDao implements BookDao {
    private final BookDao inner;
    LoggingBookDao(BookDao inner) { this.inner = inner; }
    public void save(Book b) { System.out.println("save called"); inner.save(b); }
    public Optional<Book> findById(int id) { return inner.findById(id); }
    public List<Book> findAll() { return inner.findAll(); }
}
// main
BookService s = new BookService(new LoggingBookDao(new InMemoryBookDao()));
s.add(new Book(1, "Clean Code", 500));
// save called
// [InMemoryDao] saved Clean Code`,
    },
    {
      task: 'Add delete(int id) and findByTitle(String text) to the Hibernate BookDao and expose them in BookService.',
      hint: 'session.remove(entity); HQL with like :t.',
      solution: `public void delete(int id) {
    Session s = sessionFactory.getCurrentSession();
    Book b = s.get(Book.class, id);
    if (b != null) s.remove(b);
}
public List<Book> findByTitle(String text) {
    return sessionFactory.getCurrentSession()
        .createQuery("from Book where lower(title) like :t", Book.class)
        .setParameter("t", "%" + text.toLowerCase() + "%")
        .getResultList();
}`,
    },
    {
      task: 'Create an Author entity with @OneToMany books and fetch an author with books using JOIN FETCH in the DAO.',
      hint: 'select distinct a from Author a join fetch a.books where a.id = :id',
      solution: `@Entity
public class Author {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Integer id;
    private String name;
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    private List<Book> books = new ArrayList<>();
}
// in Book: @ManyToOne @JoinColumn(name = "author_id") private Author author;

public Author findWithBooks(int id) {
    return em.createQuery("select distinct a from Author a join fetch a.books where a.id = :id", Author.class)
             .setParameter("id", id).getSingleResult();
}`,
    },
    {
      task: 'Make BookService.add roll back when the title already exists (throw DuplicateBookException, a checked exception).',
      hint: '@Transactional(rollbackFor = DuplicateBookException.class)',
      solution: `public class DuplicateBookException extends Exception {
    public DuplicateBookException(String t) { super("Duplicate: " + t); }
}
@Transactional(rollbackFor = DuplicateBookException.class)
public Book add(String title, double price) throws DuplicateBookException {
    if (!dao.findByTitle(title).isEmpty()) throw new DuplicateBookException(title);
    Book b = new Book(title, price);
    dao.save(b);
    return b;
}`,
    },
  ],
  quiz: [
    { question: 'Which Spring module integrates Hibernate?', options: ['spring-jdbc', 'spring-orm', 'spring-web', 'spring-expression'], answer: 1, explanation: 'spring-orm contains Hibernate and JPA support.' },
    { question: 'In Spring 6, LocalSessionFactoryBean is in package...', options: ['org.springframework.orm.hibernate6', 'org.hibernate.spring', 'org.springframework.orm.hibernate5', 'org.springframework.hibernate'], answer: 2, explanation: 'The hibernate5 package supports Hibernate 5.6 and 6.x.' },
    { question: 'Which annotation injects a JPA EntityManager?', options: ['@PersistenceContext', '@Autowired only', '@EntityManager', '@Inject("em")'], answer: 0, explanation: '@PersistenceContext injects a transaction-scoped shared EntityManager.' },
    { question: 'getCurrentSession() requires...', options: ['hibernate.cfg.xml', 'A static SessionFactory', 'A Servlet', 'An active Spring-managed transaction'], answer: 3, explanation: 'The Session is bound to the transaction.' },
    { question: 'Transaction manager for EntityManagerFactory?', options: ['DataSourceTransactionManager', 'JpaTransactionManager', 'HibernateTemplate', 'JtaTransactionManager only'], answer: 1, explanation: 'JpaTransactionManager works with JPA.' },
  ],
};
