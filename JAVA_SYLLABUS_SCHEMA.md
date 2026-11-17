# Java Full Stack courses: topic file spec

Folders (ONE file per lesson, `day-NN-<slug>.js`):
- `src/data/corejava-days/`     Core Java (Day 1–45)
- `src/data/collections-days/`  Collection Framework (Day 1–15)
- `src/data/advjava-days/`      Advanced Java: JDBC, Servlet, JSP (Day 1–20)
- `src/data/hibernate-days/`    Hibernate (Day 1–12)
- `src/data/spring-days/`       Spring Framework (Day 1–15)
- `src/data/springboot-days/`   Spring Boot (Day 1–25)

Each file is a plain ES module with a default export object. NO imports. Valid JS. Put Java/XML/SQL code in template literals
(escape any backtick as \` and any `${` as \${).

```js
export default {
  id: 'day-17-constructors-this',     // = filename without .js
  title: 'Constructors, this Keyword and Constructor Chaining',
  module: 'Module 3: Object-Oriented Programming',   // exact module name from the syllabus below
  day: 17,
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  duration: '2 hours',
  summary: '1-2 sentences.',
  objectives: ['...'],                 // 3-5
  theory: [ { heading, content, syntax?, points?, tip? } ],   // 4-7 sections; explain EVERY sub-topic simply, with real-world analogies and diagrams in words
  examples: [                          // 3-6 SOLVED examples
    {
      title, scenario,
      steps: ['In IntelliJ: File > New > Java Class > Student', 'Type the code', 'Click Run ▶'],   // REQUIRED; mention Eclipse/IntelliJ clicks where useful
      code: `public class Main { ... }`,        // the full code shown to the student (Java / XML / properties / SQL / JSP)
      java: {                                    // REQUIRED for every example that is plain Java SE (Core Java, Collections, and pure-Java demos elsewhere)
        files: { 'Main.java': `public class Main { public static void main(String[] args) { ... } }` },  // one or more files, default package, NO package line
        stdin: '5\n10\n',                        // optional input for Scanner
      },
      result: 'EXACT console output',           // must match what the program prints
      explanation: '...',
    },
  ],
  interview: [ { q, a, level: 'Easy' | 'Medium' | 'Hard' } ],   // 8-12; include "what is the output" questions for Core Java/Collections
  practice: [ { task, hint, solution } ],       // 4-6 programs/assignments; solution = full code
  quiz: [ { question, options: [4], answer: 0-3, explanation } ],   // EXACTLY 5; vary the correct position
};
```

Rules:
- Target Java 17/21 LTS, Jakarta EE (jakarta.servlet.*) for Servlet/JSP with Tomcat 10+, Hibernate 6, Spring 6, Spring Boot 3.
- `java.files` must compile with `javac *.java` and run with `java Main` (class containing main must be `Main` unless you have one file with another public class name — then name the file after it). No external libraries, no packages, no network/database in runnable code.
- The JDK is NOT installed on the writing machine, so trace every program by hand very carefully: `result` must be the exact output. Avoid output that depends on HashMap/HashSet iteration order, thread timing, or current date unless you explain it.
- For JDBC/Servlet/JSP/Hibernate/Spring: give complete, correct code (pom.xml dependencies, config, classes) and step-by-step setup in Eclipse (Enterprise Edition / STS) and IntelliJ IDEA. Use `java` only for pure-Java parts that run without libraries.
- Simple English for freshers; interview-ready definitions; common mistakes.

Validation (run after writing; fix every failure):
```
cd /home/stn/Pictures/DayWise/EXcel_And_PoweBI && for f in <your files>; do node --input-type=module -e "import('./$f').then(m=>{const d=m.default; const ok=d.id&&d.title&&d.module&&d.day&&d.theory?.length>=4&&d.examples?.length>=3&&d.examples.every(e=>Array.isArray(e.steps)&&e.steps.length)&&d.interview?.length>=8&&d.practice?.length>=4&&d.quiz?.length===5&&d.quiz.every(q=>q.options.length===4&&q.answer>=0&&q.answer<4)&&d.examples.every(e=>!e.java||(e.java.files&&Object.keys(e.java.files).every(n=>n.endsWith('.java')))); if(!ok) throw new Error('schema'); console.log('ok', d.id)})" || echo FAIL $f; done
```

## Core Java – 45 days
Module 1: Java Basics (Day 1–8)
1 Introduction to Java, History, Features, JDK vs JRE vs JVM, Platform Independence
2 Installing JDK, Setting up Eclipse and IntelliJ IDEA, First Java Program, Compilation and Execution (javac/java)
3 Structure of a Java Program, main() Method, Comments, Naming Conventions, Keywords
4 Variables and Primitive Data Types, Literals, Default Values
5 Type Casting: Widening and Narrowing, Type Promotion
6 Operators: Arithmetic, Relational, Logical, Assignment, Unary, Ternary, Bitwise
7 Taking Input with Scanner, Output with print/println/printf
8 Conditional Statements: if, if-else, else-if ladder, switch, enhanced switch
Module 2: Loops, Arrays & Strings (Day 9–14)
9 Loops: for, while, do-while, for-each
10 break, continue, Nested Loops and Pattern Programs
11 Arrays: Declaration, Initialization, Traversal, Common Array Programs
12 2D Arrays, Jagged Arrays, Matrix Programs
13 String Class, String Methods, Immutability, String Pool, == vs equals()
14 StringBuilder and StringBuffer, Common String Programs (reverse, palindrome, vowels, anagram)
Module 3: Object-Oriented Programming (Day 15–25)
15 OOP Concepts, Classes and Objects
16 Methods, Parameters, Return Types, Method Overloading, Pass-by-Value
17 Constructors, this Keyword and Constructor Chaining
18 static Keyword: Variables, Methods, Blocks; Instance Initializer Blocks
19 Encapsulation, Access Modifiers, Getters and Setters
20 Inheritance, Types of Inheritance, super Keyword
21 Method Overriding, Runtime Polymorphism, Dynamic Method Dispatch, Upcasting/Downcasting
22 Abstraction with Abstract Classes
23 Interfaces, Default and Static Methods, Multiple Inheritance through Interfaces, Functional Interfaces
24 final Keyword, Object Class Methods: toString(), equals(), hashCode()
25 Packages, Imports, Inner Classes (member, static nested, local, anonymous)
Module 4: Exception Handling (Day 26–28)
26 Exceptions, Exception Hierarchy, Checked vs Unchecked, try-catch-finally, multi-catch
27 throw vs throws, Custom Exceptions
28 try-with-resources, Exception Handling Best Practices
Module 5: Core APIs & Generics (Day 29–33)
29 Wrapper Classes, Autoboxing and Unboxing, Integer Cache
30 Math Class, Random, BigInteger and BigDecimal
31 Date and Time API (java.time: LocalDate, LocalDateTime, Period, Duration, DateTimeFormatter)
32 Enums
33 Generics: Generic Classes, Generic Methods, Bounded Types, Wildcards
Module 6: Multithreading (Day 34–37)
34 Multithreading Basics, Thread vs Runnable, Thread Lifecycle, sleep/join
35 Synchronization, Race Conditions, synchronized, volatile
36 Inter-thread Communication (wait/notify), Deadlock
37 Executor Framework, Callable, Future, CompletableFuture Basics
Module 7: Java 8+ Features (Day 38–41)
38 Lambda Expressions and Functional Interfaces
39 Method References and Built-in Functional Interfaces (Predicate, Function, Consumer, Supplier)
40 Stream API: filter, map, reduce, collect, sorted, groupingBy
41 Optional, var, Records, Text Blocks, Switch Expressions, Sealed Classes (Modern Java 17/21)
Module 8: I/O, JVM & Interview Prep (Day 42–45)
42 File Handling: java.io and java.nio.file.Files, Serialization
43 JVM Architecture, Class Loader, Heap vs Stack, Garbage Collection
44 Must-Know Coding Interview Programs (prime, fibonacci, factorial, armstrong, sorting, searching, duplicates)
45 Core Java Final Project, Practical Test, Interview Questions (bigger: console project + test + 25+ Q&A)

## Collection Framework – 15 days (module names: 'Module 1: Collections Basics & Lists' days 1-5, 'Module 2: Sets, Queues & Maps' days 6-11, 'Module 3: Sorting, Utilities & Advanced' days 12-15)
1 Introduction to Collection Framework, Hierarchy, Collection vs Collections, Arrays vs Collections
2 List Interface and ArrayList
3 LinkedList, ArrayList vs LinkedList
4 Vector and Stack (legacy classes)
5 Iterator, ListIterator, for-each, Fail-fast vs Fail-safe
6 Set Interface: HashSet and LinkedHashSet
7 TreeSet, SortedSet and NavigableSet
8 Queue and Deque: PriorityQueue, ArrayDeque
9 Map Interface and HashMap
10 HashMap Internal Working: hashing, buckets, load factor, rehashing, treeification; equals() and hashCode() contract
11 LinkedHashMap, TreeMap, Hashtable, HashMap vs Hashtable vs ConcurrentHashMap
12 Comparable vs Comparator, Sorting Custom Objects
13 Collections Utility Class and Arrays Class
14 Concurrent Collections (ConcurrentHashMap, CopyOnWriteArrayList) and Immutable Collections (List.of, Map.of)
15 Collections with Streams, Mini Project, Interview Questions (bigger: 20+ Q&A)

## Advanced Java (JDBC, Servlet, JSP) – 20 days
Module 1: JDBC (Day 1–6)
1 Introduction to JDBC, Architecture, Driver Types, MySQL Setup
2 JDBC Steps: Load Driver, Connection, Statement, CRUD Operations
3 PreparedStatement and SQL Injection
4 ResultSet, ResultSetMetaData, Scrollable ResultSet
5 CallableStatement, Stored Procedures, Batch Processing
6 Transaction Management, Connection Pooling (HikariCP), DAO Pattern
Module 2: Servlets (Day 7–13)
7 Web Application Basics, HTTP, Apache Tomcat Setup in Eclipse and IntelliJ, Project Structure (WEB-INF, web.xml)
8 Servlet Introduction, Servlet Lifecycle, GenericServlet vs HttpServlet
9 doGet() and doPost(), Reading Form Data (HTML form to Servlet)
10 web.xml vs @WebServlet, ServletConfig and ServletContext
11 RequestDispatcher (forward, include) vs sendRedirect
12 Session Management: Cookies, HttpSession, URL Rewriting, Hidden Form Fields
13 Filters and Listeners
Module 3: JSP (Day 14–19)
14 JSP Introduction, JSP Lifecycle, JSP vs Servlet
15 JSP Scripting Elements and Directives
16 JSP Implicit Objects and Action Tags
17 Expression Language (EL) and JSTL
18 MVC Architecture with Servlet + JSP + JDBC
19 File Upload, Pagination, Error Pages and Security Basics
Module 4: Project (Day 20)
20 Advanced Java Project: Student Management System (CRUD with MVC), Interview Questions (bigger: 20+ Q&A)

## Hibernate – 12 days (modules: 'Module 1: Hibernate Basics' 1-5, 'Module 2: Queries' 6-7, 'Module 3: Mappings & Performance' 8-11, 'Module 4: Project' 12)
1 ORM Introduction, Problems with JDBC, Hibernate and JPA
2 Hibernate Setup with Maven, hibernate.cfg.xml, First Entity
3 Annotations: @Entity, @Table, @Id, @GeneratedValue, @Column
4 SessionFactory, Session, Transaction, CRUD Operations
5 Entity States (transient, persistent, detached, removed), get vs load, persist/merge
6 HQL and JPQL, Named Queries, Parameters, Pagination
7 Criteria API
8 Mappings: One-to-One, One-to-Many, Many-to-One
9 Many-to-Many, Cascade Types, Orphan Removal
10 Fetch Types (LAZY vs EAGER), N+1 Problem, LazyInitializationException
11 Caching (First-level, Second-level, Query Cache) and Inheritance Mapping Strategies
12 Hibernate Project and Interview Questions (bigger: 20+ Q&A)

## Spring Framework – 15 days (modules: 'Module 1: Spring Core' 1-6, 'Module 2: Spring AOP' 7-8, 'Module 3: Data Access' 9-10, 'Module 4: Spring MVC' 11-14, 'Module 5: Project' 15)
1 Introduction to Spring, Spring Modules, Why Spring
2 IoC and Dependency Injection, BeanFactory vs ApplicationContext
3 XML Configuration, Constructor vs Setter Injection
4 Annotation-based Configuration: @Component, @Autowired, @Qualifier, @Primary
5 Java-based Configuration: @Configuration, @Bean, @ComponentScan
6 Bean Scopes and Bean Lifecycle (@PostConstruct, @PreDestroy)
7 AOP Concepts: Aspect, Advice, Pointcut, JoinPoint
8 AOP with AspectJ Annotations (@Before, @After, @AfterReturning, @Around)
9 Spring JDBC with JdbcTemplate
10 Transaction Management: @Transactional, Propagation, Isolation
11 Spring MVC Architecture and DispatcherServlet
12 Controllers: @Controller, @RequestMapping, @RequestParam, @PathVariable, Model, Views
13 Spring MVC Forms, Validation and Exception Handling
14 Spring + Hibernate Integration (Spring ORM)
15 Spring Project and Interview Questions (bigger: 20+ Q&A)

## Spring Boot – 25 days
Module 1: Spring Boot Basics (Day 1–5)
1 Introduction to Spring Boot, Spring vs Spring Boot, Auto-configuration, Starters
2 Spring Initializr, Project Structure, Maven, Running in IntelliJ and Eclipse (STS)
3 @SpringBootApplication, application.properties vs application.yml, Profiles
4 DevTools, Actuator, Logging
5 Dependency Injection in Spring Boot, @Value, @ConfigurationProperties
Module 2: REST APIs (Day 6–11)
6 REST Principles, HTTP Methods and Status Codes
7 @RestController, @GetMapping/@PostMapping/@PutMapping/@DeleteMapping, @RequestBody, ResponseEntity
8 Building a CRUD REST API and Testing with Postman
9 Validation with @Valid and Bean Validation
10 Global Exception Handling with @ControllerAdvice
11 DTOs, Layered Architecture (Controller–Service–Repository), MapStruct/ModelMapper
Module 3: Data Access (Day 12–16)
12 Spring Data JPA, Entities, JpaRepository, MySQL Configuration
13 Derived Query Methods, @Query, JPQL and Native Queries
14 Pagination and Sorting
15 JPA Relationships in Spring Boot, Avoiding Infinite Recursion (DTO / @JsonIgnore)
16 Transactions, Auditing (@CreatedDate), Database Migrations with Flyway
Module 4: Security (Day 17–19)
17 Spring Security Basics, Security Filter Chain, In-memory and Database Users
18 JWT Authentication
19 Role-based Authorization, Password Encoding, CORS
Module 5: Advanced (Day 20–23)
20 Testing: JUnit 5, Mockito, @SpringBootTest, @WebMvcTest
21 Swagger / OpenAPI Documentation, Calling External APIs (RestClient / WebClient)
22 Microservices Introduction: Service Discovery (Eureka), API Gateway, OpenFeign
23 Docker and Deployment of a Spring Boot Application
Module 6: Full Stack (Day 24–25)
24 Full Stack Integration: React Frontend + Spring Boot Backend (CORS, fetch/axios, JWT login)
25 Final Java Full Stack Project, Practical Test, Interview Questions (bigger: project + test + 25+ Q&A)
