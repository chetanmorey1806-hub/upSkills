export default {
  id: 'day-11-caching-inheritance-mapping',
  title: 'Caching (First-level, Second-level, Query Cache) and Inheritance Mapping Strategies',
  module: 'Module 3: Mappings & Performance',
  day: 11,
  level: 'Advanced',
  duration: '3 hours',
  summary: `Reduce database hits with Hibernate's first-level, second-level (Ehcache via JCache) and query caches, and map Java class hierarchies to tables using @MappedSuperclass, SINGLE_TABLE, JOINED and TABLE_PER_CLASS strategies.`,
  objectives: [
    `Explain the scope and behaviour of the first-level cache`,
    `Configure the second-level cache with JCache + Ehcache and mark entities @Cacheable`,
    `Enable and use the query cache, and know its limitations`,
    `Map inheritance with SINGLE_TABLE, JOINED, TABLE_PER_CLASS and @MappedSuperclass`,
    `Compare strategies by table structure, generated SQL and performance`,
  ],
  theory: [
    {
      heading: `First-Level Cache (Session Cache)`,
      content: `Every Session has its own first-level cache (the persistence context). It is ALWAYS on and cannot be disabled. When you call get() for an entity already in the session, Hibernate returns it from memory – no SQL.

Scope: one session. When the session closes, the cache is gone. Another session has a separate cache.

Analogy: your own notebook during an exam – fast to look up, but you can't share it and it is thrown away after the exam.`,
      points: [
        `session.evict(obj) / detach(obj) removes one object; session.clear() removes all`,
        `HQL queries always go to the DB (the first-level cache is checked only for lookups by id), but returned rows are matched to already-managed instances`,
        `In batch jobs inserting thousands of rows, call flush() and clear() every N rows to avoid OutOfMemoryError`,
      ],
    },
    {
      heading: `Second-Level Cache (SessionFactory Cache)`,
      content: `The second-level (L2) cache lives at the SessionFactory level and is SHARED by all sessions. It is OFF by default and needs a cache provider. Hibernate 6 uses the JCache (JSR-107) standard with providers like Ehcache 3, Infinispan, Hazelcast.

Lookup order for session.get(Product.class, 1):
  1. First-level cache (this session)  -> found? return
  2. Second-level cache (shared)       -> found? copy into session, return
  3. Database SELECT                   -> put result into L2 and L1

Analogy: L1 = your notebook, L2 = the class library shelf everyone shares, DB = the city library far away.

Good candidates: data read often and changed rarely (countries, categories, products, configuration). Bad: rapidly changing data (account balances, stock levels).`,
      syntax: `@Entity
@Cacheable                                                   // jakarta.persistence
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Product { ... }`,
      points: [
        `READ_ONLY – data never changes (fastest)`,
        `NONSTRICT_READ_WRITE – rare updates, small chance of stale data`,
        `READ_WRITE – updates allowed, uses soft locks for consistency (common choice)`,
        `TRANSACTIONAL – full JTA transactional caches`,
      ],
    },
    {
      heading: `Query Cache`,
      content: `The query cache stores the RESULT IDS of an HQL/Criteria query for a given set of parameters. Executing the same query with the same parameters again returns ids from the cache, and the entities are then fetched from the L2 cache.

Requirements: hibernate.cache.use_query_cache=true and query.setCacheable(true) on each query. Entities should also be L2 cached, otherwise each id is loaded with a separate SELECT (an N+1 created by the cache!).

Invalidation: whenever ANY row of a table used by the query is inserted/updated/deleted through Hibernate, all cached query results involving that table are invalidated. So it only helps for tables that rarely change.`,
    },
    {
      heading: `Inheritance Mapping – Why?`,
      content: `Java supports inheritance (CardPayment extends Payment), relational tables do not. JPA offers strategies to store a class hierarchy:

1. @MappedSuperclass – the parent is NOT an entity; it only shares fields (id, createdAt) with child entities. Each child has its own full table. No polymorphic queries on the parent.
2. SINGLE_TABLE (default) – ONE table for the whole hierarchy with a discriminator column (payment_type). Child-specific columns are nullable.
3. JOINED – one table for the parent with common columns and one table per child with only its own columns, linked by the same primary key (child.id is FK to parent.id).
4. TABLE_PER_CLASS – one complete table per concrete class (common columns repeated). Polymorphic queries use UNION ALL.`,
      syntax: `@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)      // or JOINED, TABLE_PER_CLASS
@DiscriminatorColumn(name = "payment_type")
public abstract class Payment { ... }

@Entity
@DiscriminatorValue("CARD")
public class CardPayment extends Payment { private String cardNumber; }`,
    },
    {
      heading: `Choosing an Inheritance Strategy`,
      content: `Comparison:

  Strategy         Tables   Polymorphic query      NOT NULL on child cols   Speed
  SINGLE_TABLE     1        simple select          not possible             fastest
  JOINED           1+N      joins                  possible                 slower with deep trees
  TABLE_PER_CLASS  N        UNION ALL              possible                 slow for polymorphic queries
  MappedSuperclass N        not supported          possible                 fast (no polymorphism)`,
      points: [
        `Default to SINGLE_TABLE for small hierarchies with few extra columns`,
        `Use JOINED when subclasses have many columns or you need NOT NULL constraints`,
        `TABLE_PER_CLASS cannot use IDENTITY ids (ids must be unique across tables); use SEQUENCE/TABLE`,
        `Use @MappedSuperclass for common audit fields (id, createdAt, updatedAt) – a BaseEntity`,
      ],
    },
  ],
  examples: [
    {
      title: `First-Level Cache in Action`,
      scenario: `Load the same product twice in one session and once in another session.`,
      steps: [
        `Use the Product entity from Day 3 with at least one row (id 1)`,
        `Create class FirstLevelCacheApp and run`,
        `Count SELECT statements in the console`,
      ],
      code: `try (Session s1 = sf.openSession()) {
    Product a = s1.get(Product.class, 1L);
    Product b = s1.get(Product.class, 1L);          // from L1 cache
    System.out.println("Same session, same object? " + (a == b));

    s1.evict(a);
    Product c = s1.get(Product.class, 1L);          // evicted -> SELECT again
    System.out.println("After evict, same object? " + (a == c));
}
try (Session s2 = sf.openSession()) {
    Product d = s2.get(Product.class, 1L);          // new session -> SELECT
    System.out.println("Loaded in session 2: " + d.getName());
}`,
      result: `Hibernate: select p1_0.id,p1_0.category,p1_0.created_on,p1_0.product_name,p1_0.price from products p1_0 where p1_0.id=?
Same session, same object? true
Hibernate: select p1_0.id,p1_0.category,p1_0.created_on,p1_0.product_name,p1_0.price from products p1_0 where p1_0.id=?
After evict, same object? false
Hibernate: select p1_0.id,p1_0.category,p1_0.created_on,p1_0.product_name,p1_0.price from products p1_0 where p1_0.id=?
Loaded in session 2: Laptop`,
      explanation: `The second get() in the same session produced no SQL and returned the identical object. After evict() and in a new session the L1 cache did not have it, so SELECTs ran. L1 never helps across sessions – that is the job of the L2 cache.`,
    },
    {
      title: `Second-Level Cache with Ehcache (JCache)`,
      scenario: `Share cached products between sessions so the second session needs no SQL.`,
      steps: [
        `Add the dependencies below to pom.xml and reload Maven (IntelliJ: Load Maven Changes; Eclipse: Maven > Update Project)`,
        `Add the cache properties to hibernate.cfg.xml`,
        `Annotate Product with @Cacheable and @Cache(usage = READ_WRITE)`,
        `Run L2CacheApp and read the statistics`,
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-jcache</artifactId>
    <version>6.4.4.Final</version>
</dependency>
<dependency>
    <groupId>org.ehcache</groupId>
    <artifactId>ehcache</artifactId>
    <version>3.10.8</version>
    <classifier>jakarta</classifier>
</dependency>

<!-- hibernate.cfg.xml -->
<property name="hibernate.cache.use_second_level_cache">true</property>
<property name="hibernate.cache.region.factory_class">jcache</property>
<property name="hibernate.javax.cache.provider">org.ehcache.jsr107.EhcacheCachingProvider</property>
<property name="hibernate.javax.cache.missing_cache_strategy">create</property>
<property name="hibernate.generate_statistics">true</property>

// Product.java
@Entity
@Table(name = "products")
@Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Product { ... }

// L2CacheApp.java
try (Session s1 = sf.openSession()) {
    System.out.println("S1: " + s1.get(Product.class, 1L).getName());
}
try (Session s2 = sf.openSession()) {
    System.out.println("S2: " + s2.get(Product.class, 1L).getName());
}
Statistics st = sf.getStatistics();
System.out.println("L2 puts=" + st.getSecondLevelCachePutCount()
        + " hits=" + st.getSecondLevelCacheHitCount()
        + " misses=" + st.getSecondLevelCacheMissCount());`,
      result: `Hibernate: select p1_0.id,p1_0.category,p1_0.created_on,p1_0.product_name,p1_0.price from products p1_0 where p1_0.id=?
S1: Laptop
S2: Laptop
L2 puts=1 hits=1 misses=1`,
      explanation: `Session 1 missed the L2 cache, ran the SELECT and put the product into L2. Session 2 found it in L2 (hit) – no SQL. If you update the product through Hibernate, READ_WRITE updates/invalidates the cached entry automatically. Updates done directly in MySQL bypass Hibernate and leave the cache stale.`,
    },
    {
      title: `Query Cache`,
      scenario: `Cache the result of "products in category ELECTRONICS" for repeated calls.`,
      steps: [
        `Add <property name="hibernate.cache.use_query_cache">true</property>`,
        `Call setCacheable(true) on the query`,
        `Run the same query in two sessions`,
      ],
      code: `for (int i = 1; i <= 2; i++) {
    try (Session s = sf.openSession()) {
        List<Product> list = s.createQuery("from Product p where p.category = :c", Product.class)
                              .setParameter("c", Category.ELECTRONICS)
                              .setCacheable(true)
                              .list();
        System.out.println("Run " + i + ": " + list.size() + " product(s)");
    }
}
System.out.println("Query cache hits: " + sf.getStatistics().getQueryCacheHitCount());`,
      result: `Hibernate: select p1_0.id,p1_0.category,p1_0.created_on,p1_0.product_name,p1_0.price from products p1_0 where p1_0.category=?
Run 1: 1 product(s)
Run 2: 1 product(s)
Query cache hits: 1`,
      explanation: `The first run executed SQL and cached the list of ids for parameter ELECTRONICS; the second run took ids from the query cache and entities from the L2 cache – zero SQL. Any insert/update/delete on products through Hibernate invalidates this cached result.`,
    },
    {
      title: `Inheritance: SINGLE_TABLE vs JOINED vs TABLE_PER_CLASS`,
      scenario: `Payment hierarchy: CardPayment (cardNumber) and UpiPayment (upiId). Save one of each and query all payments polymorphically.`,
      steps: [
        `Create abstract Payment and the two subclasses in package com.demo.inherit; register all three`,
        `Run with SINGLE_TABLE, then change the strategy to JOINED, then TABLE_PER_CLASS (hbm2ddl.auto=create each time)`,
        `For TABLE_PER_CLASS change the id generation to GenerationType.TABLE (IDENTITY is not allowed)`,
      ],
      code: `@Entity
@Table(name = "payments")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "payment_type")
public abstract class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double amount;
    protected Payment() {}
    protected Payment(double amount) { this.amount = amount; }
    public double getAmount() { return amount; }
}

@Entity
@DiscriminatorValue("CARD")
public class CardPayment extends Payment {
    private String cardNumber;
    public CardPayment() {}
    public CardPayment(double amt, String card) { super(amt); this.cardNumber = card; }
}

@Entity
@DiscriminatorValue("UPI")
public class UpiPayment extends Payment {
    private String upiId;
    public UpiPayment() {}
    public UpiPayment(double amt, String upi) { super(amt); this.upiId = upi; }
}

// InheritanceApp.java
sf.inTransaction(s -> {
    s.persist(new CardPayment(1500, "4111-XXXX-1111"));
    s.persist(new UpiPayment(250, "asha@okbank"));
});
try (Session s = sf.openSession()) {
    for (Payment p : s.createQuery("from Payment p order by p.id", Payment.class).list())
        System.out.println(p.getClass().getSimpleName() + " " + p.getAmount());
}`,
      result: `-- SINGLE_TABLE
Hibernate: create table payments (amount float(53) not null, id bigint not null auto_increment, payment_type varchar(31) not null, cardNumber varchar(255), upiId varchar(255), primary key (id)) engine=InnoDB
Hibernate: insert into payments (amount,cardNumber,payment_type) values (?,?,'CARD')
Hibernate: insert into payments (amount,upiId,payment_type) values (?,?,'UPI')
Hibernate: select p1_0.id,p1_0.payment_type,p1_0.amount,p1_0.cardNumber,p1_0.upiId from payments p1_0 order by p1_0.id
CardPayment 1500.0
UpiPayment 250.0

-- JOINED (tables: payments, CardPayment, UpiPayment - add @Table to rename)
Hibernate: insert into payments (amount) values (?)
Hibernate: insert into CardPayment (cardNumber,id) values (?,?)
Hibernate: insert into payments (amount) values (?)
Hibernate: insert into UpiPayment (upiId,id) values (?,?)
Hibernate: select p1_0.id,case when p1_1.id is not null then 1 when p1_2.id is not null then 2 end,p1_0.amount,p1_1.cardNumber,p1_2.upiId from payments p1_0 left join CardPayment p1_1 on p1_0.id=p1_1.id left join UpiPayment p1_2 on p1_0.id=p1_2.id order by p1_0.id
CardPayment 1500.0
UpiPayment 250.0

-- TABLE_PER_CLASS (no table for abstract Payment)
Hibernate: select ... from (select id, amount, cardNumber, null as upiId, 1 as clazz_ from CardPayment union all select id, amount, null as cardNumber, upiId, 2 as clazz_ from UpiPayment) p1_0 order by p1_0.id
CardPayment 1500.0
UpiPayment 250.0`,
      explanation: `SINGLE_TABLE: one table, discriminator inlined in the INSERT, simplest SELECT. JOINED: parent row + child row sharing the id; the polymorphic query left-joins every subtype and uses CASE to pick the class. TABLE_PER_CLASS: each concrete class has a full table and polymorphic queries need UNION ALL (SQL shortened). The Java output is the same in all three – only the storage differs. (With JOINED/TABLE_PER_CLASS @DiscriminatorColumn is optional.)`,
    },
    {
      title: `@MappedSuperclass – Shared Audit Fields`,
      scenario: `Every entity needs id, createdAt and updatedAt without repeating code.`,
      steps: [
        `Create abstract class BaseEntity with @MappedSuperclass`,
        `Make the Brand entity extend it`,
        `Run and check the DDL – there is no base_entity table`,
      ],
      code: `@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @CreationTimestamp
    @Column(updatable = false)
    protected LocalDateTime createdAt;

    @UpdateTimestamp
    protected LocalDateTime updatedAt;

    public Long getId() { return id; }
}

@Entity
@Table(name = "brands")
public class Brand extends BaseEntity {
    private String name;
    public Brand() {}
    public Brand(String name) { this.name = name; }
}`,
      result: `Hibernate: create table brands (createdAt datetime(6), id bigint not null auto_increment, updatedAt datetime(6), name varchar(255), primary key (id)) engine=InnoDB`,
      explanation: `The inherited fields become columns of each child table. You cannot query "from BaseEntity" because it is not an entity. This is the standard way to share id and audit columns.`,
    },
  ],
  interview: [
    { q: `What is the first-level cache?`, a: `The Session-scoped cache (persistence context), enabled by default and not configurable off. It guarantees one instance per id per session and avoids repeated SELECTs for the same entity in that session.`, level: 'Easy' },
    { q: `What is the second-level cache?`, a: `A SessionFactory-scoped, shared, optional cache provided by a pluggable provider (Ehcache, Infinispan via JCache). It stores entity data across sessions to avoid repeated DB reads.`, level: 'Easy' },
    { q: `How do you enable the second-level cache in Hibernate 6?`, a: `Add hibernate-jcache and a JCache provider (e.g. Ehcache), set hibernate.cache.use_second_level_cache=true and region.factory_class=jcache, then annotate entities with @Cacheable and @Cache(usage=...).`, level: 'Medium' },
    { q: `What are the cache concurrency strategies?`, a: `READ_ONLY, NONSTRICT_READ_WRITE, READ_WRITE and TRANSACTIONAL.`, level: 'Medium' },
    { q: `What is the query cache and when is it useful?`, a: `It caches the ids returned by a query for given parameters. Useful for frequently executed queries on rarely changing tables; it must be enabled globally and per query with setCacheable(true), and works best with L2-cached entities.`, level: 'Medium' },
    { q: `Does HQL use the first-level cache?`, a: `HQL queries always hit the database; returned rows are resolved against the persistence context, so already-managed instances are reused. Only id lookups (get/find) are served directly from the cache.`, level: 'Hard' },
    { q: `What are the inheritance strategies in JPA?`, a: `SINGLE_TABLE (default), JOINED, TABLE_PER_CLASS; plus @MappedSuperclass for sharing mappings without an entity parent.`, level: 'Easy' },
    { q: `What is a discriminator column?`, a: `A column (e.g. DTYPE/payment_type) in SINGLE_TABLE (optionally JOINED) storing which subclass a row belongs to, set via @DiscriminatorValue.`, level: 'Easy' },
    { q: `Pros and cons of SINGLE_TABLE?`, a: `Pros: fastest, no joins, simple polymorphic queries. Cons: subclass columns must be nullable, table can become wide with many nulls.`, level: 'Medium' },
    { q: `Why can't TABLE_PER_CLASS use IDENTITY?`, a: `Polymorphic queries union several tables, so ids must be unique across all of them. Separate auto_increment counters per table would produce duplicate ids.`, level: 'Hard' },
    { q: `Difference between @MappedSuperclass and @Inheritance?`, a: `@MappedSuperclass only shares field mappings; the parent is not an entity and cannot be queried or referenced. @Inheritance makes the parent an entity supporting polymorphic queries and associations.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Insert 10,000 products in a batch job without running out of memory, using flush() and clear() every 50 records and JDBC batching.`,
      hint: `hibernate.jdbc.batch_size=50; IDENTITY disables insert batching, so use SEQUENCE/TABLE ids for real batching.`,
      solution: `<property name="hibernate.jdbc.batch_size">50</property>
<property name="hibernate.order_inserts">true</property>

try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    for (int i = 1; i <= 10000; i++) {
        s.persist(new Product("Item-" + i, new BigDecimal("10.00"), Category.BOOKS));
        if (i % 50 == 0) {
            s.flush();   // send pending inserts
            s.clear();   // empty first-level cache to free memory
        }
    }
    tx.commit();
}`,
    },
    {
      task: `Make Category data (READ_ONLY reference table) second-level cached and prove with statistics that 5 sessions loading id 1 run only one SELECT.`,
      hint: `@Cache(usage = CacheConcurrencyStrategy.READ_ONLY); getPrepareStatementCount().`,
      solution: `@Entity @Table(name = "categories")
@Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_ONLY)
public class CategoryEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
}

sf.getStatistics().clear();
for (int i = 0; i < 5; i++) {
    try (Session s = sf.openSession()) { s.get(CategoryEntity.class, 1L); }
}
System.out.println("SQL count: " + sf.getStatistics().getPrepareStatementCount()); // 1
System.out.println("L2 hits: " + sf.getStatistics().getSecondLevelCacheHitCount()); // 4`,
    },
    {
      task: `Map Vehicle -> Car (seats) and Bike (hasGear) with JOINED strategy and custom table names vehicles, cars, bikes. Query all vehicles.`,
      hint: `@Inheritance(strategy = InheritanceType.JOINED) and @Table on each class; optionally @PrimaryKeyJoinColumn(name="vehicle_id").`,
      solution: `@Entity @Table(name = "vehicles")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Vehicle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String brand;
    protected Vehicle() {}
    protected Vehicle(String b) { brand = b; }
    public String getBrand() { return brand; }
}

@Entity @Table(name = "cars") @PrimaryKeyJoinColumn(name = "vehicle_id")
public class Car extends Vehicle {
    private int seats;
    public Car() {}
    public Car(String b, int seats) { super(b); this.seats = seats; }
}

@Entity @Table(name = "bikes") @PrimaryKeyJoinColumn(name = "vehicle_id")
public class Bike extends Vehicle {
    private boolean hasGear;
    public Bike() {}
    public Bike(String b, boolean g) { super(b); hasGear = g; }
}

sf.inTransaction(s -> { s.persist(new Car("Honda", 5)); s.persist(new Bike("Hero", true)); });
try (Session s = sf.openSession()) {
    s.createQuery("from Vehicle v order by v.id", Vehicle.class).list()
     .forEach(v -> System.out.println(v.getClass().getSimpleName() + " " + v.getBrand()));
}
// Car Honda
// Bike Hero`,
    },
    {
      task: `Write HQL that returns only CardPayment rows from the Payment hierarchy in two ways.`,
      hint: `Query the subclass directly, or use type(p) = CardPayment.`,
      solution: `List<CardPayment> a = s.createQuery("from CardPayment", CardPayment.class).list();

List<Payment> b = s.createQuery("from Payment p where type(p) = CardPayment", Payment.class).list();
// SINGLE_TABLE SQL for b: ... from payments p1_0 where p1_0.payment_type='CARD'`,
    },
  ],
  quiz: [
    { question: `The first-level cache is associated with ...`, options: [`SessionFactory`, `Session`, `Transaction`, `JVM`], answer: 1, explanation: `Each Session has its own persistence context.` },
    { question: `Which is required to use the second-level cache?`, options: [`A cache provider such as Ehcache`, `Nothing, it is on by default`, `A JTA server`, `Spring Boot`], answer: 0, explanation: `L2 cache is off by default and needs a provider.` },
    { question: `Which inheritance strategy uses a single table with a discriminator column?`, options: [`JOINED`, `TABLE_PER_CLASS`, `@MappedSuperclass`, `SINGLE_TABLE`], answer: 3, explanation: `SINGLE_TABLE stores all subclasses in one table.` },
    { question: `Polymorphic queries in TABLE_PER_CLASS use ...`, options: [`LEFT JOIN`, `Subqueries only`, `UNION ALL`, `Discriminator`], answer: 2, explanation: `Each concrete table is unioned.` },
    { question: `What must be called on a query to use the query cache?`, options: [`setCacheable(true)`, `setFetchSize(0)`, `setLockMode()`, `setReadOnly(true)`], answer: 0, explanation: `Queries are cacheable only when explicitly marked.` },
  ],
};
