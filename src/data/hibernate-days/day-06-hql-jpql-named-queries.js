export default {
  id: 'day-06-hql-jpql-named-queries',
  title: 'HQL and JPQL, Named Queries, Parameters, Pagination',
  module: 'Module 2: Queries',
  day: 6,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Query entities with HQL/JPQL instead of SQL: filtering, sorting, projections, aggregates, joins, bulk update/delete, named and positional parameters, reusable @NamedQuery and pagination with setFirstResult/setMaxResults.`,
  objectives: [
    `Write HQL/JPQL SELECT queries using entity and field names`,
    `Bind parameters safely with named (:name) and positional (?1) parameters`,
    `Use projections, aggregate functions, GROUP BY and bulk UPDATE/DELETE`,
    `Define and execute @NamedQuery`,
    `Implement pagination and read the generated LIMIT SQL`,
  ],
  theory: [
    {
      heading: `What are HQL and JPQL?`,
      content: `HQL (Hibernate Query Language) and JPQL (Jakarta Persistence Query Language) are object-oriented query languages. They look like SQL but you write ENTITY names and FIELD names, not table and column names. Hibernate translates them to the SQL dialect of your database.

JPQL is the standard defined by JPA; HQL is Hibernate's superset (every JPQL query is valid HQL, and HQL allows extras like "from Employee" without select).

Analogy: SQL talks to the warehouse shelves (tables). HQL talks to the shop catalogue (classes). Hibernate is the shop assistant who knows which shelf each catalogue item is on.

  SQL : SELECT * FROM employees WHERE dept_name = 'IT'
  HQL : from Employee e where e.department = 'IT'`,
      points: [
        `Entity and field names are case-sensitive (Employee, e.salary); keywords are not (SELECT = select)`,
        `Portable: same HQL works on MySQL, PostgreSQL, Oracle`,
        `Returns objects, not ResultSets`,
      ],
    },
    {
      heading: `Creating and Running Queries`,
      content: `In Hibernate 6 use the typed API: session.createQuery(hql, ResultType.class) returns Query<T>. Methods: list() / getResultList(), uniqueResult() / getSingleResult(), getSingleResultOrNull(), stream(), executeUpdate() for UPDATE/DELETE.`,
      syntax: `List<Employee> all = session.createQuery("from Employee", Employee.class).list();

Employee e = session.createQuery("from Employee where id = :id", Employee.class)
                    .setParameter("id", 3)
                    .uniqueResult();     // null if none, exception if more than one

Long count = session.createQuery("select count(e) from Employee e", Long.class)
                    .getSingleResult();`,
      tip: `getSingleResult() throws NoResultException when nothing is found; prefer uniqueResult() or getSingleResultOrNull() if "not found" is normal.`,
    },
    {
      heading: `Parameters – Never Concatenate Strings`,
      content: `Named parameters (:dept) or positional JPQL parameters (?1) are bound with setParameter. Hibernate sends them as JDBC ? placeholders, so they are safe from SQL injection and the query plan is cached.

  BAD : "from Employee where name = '" + input + "'"     (SQL/HQL injection!)
  GOOD: "from Employee where name = :n"  + setParameter("n", input)`,
      syntax: `.createQuery("from Employee e where e.department = :dept and e.salary > :min", Employee.class)
.setParameter("dept", "IT")
.setParameter("min", 50000.0)

.createQuery("from Employee e where e.city = ?1", Employee.class)
.setParameter(1, "Pune")

.createQuery("from Employee e where e.city in (:cities)", Employee.class)
.setParameterList("cities", List.of("Pune", "Delhi"))   // or setParameter with a Collection`,
    },
    {
      heading: `Projections, Aggregates, Joins and Bulk Operations`,
      content: `Projection: select only some fields. Result type is Object[] (or a DTO via "select new").
Aggregates: count, sum, avg, min, max with group by / having.
Joins: navigate associations with join / left join / join fetch (Day 8-10).
Bulk: update/delete directly in the DB with executeUpdate(); they bypass the persistence context (loaded objects become stale) and cascades.`,
      syntax: `select e.name, e.salary from Employee e                       -> List<Object[]>
select new com.demo.dto.EmpDto(e.name, e.salary) from Employee e -> List<EmpDto>
select e.department, count(e), avg(e.salary) from Employee e group by e.department having count(e) > 1
update Employee e set e.salary = e.salary * 1.10 where e.department = :d
delete from Employee e where e.city = :c`,
      points: [
        `count() returns Long, avg() returns Double, sum() of double returns Double`,
        `HQL functions: upper, lower, length, concat, substring, abs, current_date, coalesce, case when`,
        `Hibernate 6 also supports records as DTOs in select new`,
      ],
    },
    {
      heading: `Named Queries`,
      content: `@NamedQuery defines a query once, on the entity, with a unique name. Hibernate parses and validates it at startup – a typo fails fast at boot instead of at runtime. Naming convention: EntityName.purpose.`,
      syntax: `@Entity
@NamedQuery(name = "Employee.byCity",
            query = "from Employee e where e.city = :city order by e.name")
@NamedQuery(name = "Employee.countByDept",
            query = "select count(e) from Employee e where e.department = :dept")
public class Employee { ... }

session.createNamedQuery("Employee.byCity", Employee.class).setParameter("city", "Pune").list();`,
      tip: `@NamedQuery is repeatable in JPA 3 – you can put several directly on the class without wrapping them in @NamedQueries.`,
    },
    {
      heading: `Pagination`,
      content: `Loading 1 lakh rows at once kills memory. Pagination fetches a page at a time:
  setFirstResult(offset)  – rows to skip (0-based)
  setMaxResults(size)     – rows per page
  offset = (pageNumber - 1) * pageSize

Hibernate adds the DB-specific clause (MySQL: limit ?,? ; Oracle: offset ? rows fetch first ? rows only). Always combine with ORDER BY, otherwise page contents are unpredictable.`,
      syntax: `int page = 2, size = 2;
session.createQuery("from Employee e order by e.id", Employee.class)
       .setFirstResult((page - 1) * size)
       .setMaxResults(size)
       .list();`,
    },
  ],
  examples: [
    {
      title: `Setup – Employee Entity with Named Queries and Sample Data`,
      scenario: `All examples today use this entity and six rows.`,
      steps: [
        `Create com.demo.entity.Employee and register <mapping class="com.demo.entity.Employee"/>`,
        `Set hbm2ddl.auto=create and run SeedData once`,
        `IntelliJ users can verify in View > Tool Windows > Database; Eclipse users in Data Source Explorer or MySQL Workbench`,
      ],
      code: `package com.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "employees")
@NamedQuery(name = "Employee.byCity",
            query = "from Employee e where e.city = :city order by e.name")
@NamedQuery(name = "Employee.countByDept",
            query = "select count(e) from Employee e where e.department = :dept")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String department;
    private double salary;
    private String city;

    public Employee() {}
    public Employee(String name, String department, double salary, String city) {
        this.name = name; this.department = department; this.salary = salary; this.city = city;
    }
    public int getId() { return id; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public double getSalary() { return salary; }
    public String getCity() { return city; }
    public void setSalary(double salary) { this.salary = salary; }
    @Override public String toString() { return name + " " + salary; }
}

// ===== SeedData.java =====
sf.inTransaction(s -> {
    s.persist(new Employee("Asha",  "IT",    60000, "Pune"));
    s.persist(new Employee("Ravi",  "HR",    40000, "Mumbai"));
    s.persist(new Employee("John",  "IT",    75000, "Pune"));
    s.persist(new Employee("Meena", "SALES", 50000, "Delhi"));
    s.persist(new Employee("Kiran", "IT",    55000, "Mumbai"));
    s.persist(new Employee("Priya", "HR",    45000, "Pune"));
});`,
      result: `Hibernate: create table employees (id integer not null auto_increment, city varchar(255), department varchar(255), name varchar(255), salary float(53) not null, primary key (id)) engine=InnoDB
Hibernate: insert into employees (city,department,name,salary) values (?,?,?,?)
(printed 6 times)`,
      explanation: `Ids 1 to 6 are assigned in insert order: 1 Asha, 2 Ravi, 3 John, 4 Meena, 5 Kiran, 6 Priya. Named queries are validated when the SessionFactory starts.`,
    },
    {
      title: `Basic HQL – Sorting, Filtering, Named Parameters`,
      scenario: `List all employees by salary, then IT employees with salary above a limit.`,
      steps: [
        `Create class HqlBasics with main()`,
        `Run it and compare HQL with the printed SQL`,
      ],
      code: `try (Session s = sf.openSession()) {
    List<Employee> all = s.createQuery("from Employee e order by e.salary desc", Employee.class).list();
    System.out.println("All: " + all);

    List<Employee> it = s.createQuery(
            "from Employee e where e.department = :dept and e.salary > :min order by e.name",
            Employee.class)
        .setParameter("dept", "IT")
        .setParameter("min", 56000.0)
        .list();
    System.out.println("IT > 56000: " + it);

    Employee one = s.createQuery("from Employee e where e.name = ?1", Employee.class)
        .setParameter(1, "Meena")
        .uniqueResult();
    System.out.println("Found: " + one + " from " + one.getCity());
}`,
      result: `Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 order by e1_0.salary desc
All: [John 75000.0, Asha 60000.0, Kiran 55000.0, Meena 50000.0, Priya 45000.0, Ravi 40000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.department=? and e1_0.salary>? order by e1_0.name
IT > 56000: [Asha 60000.0, John 75000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.name=?
Found: Meena 50000.0 from Delhi`,
      explanation: `"from Employee" is valid HQL (select is optional). Field names are translated to column names and the alias e becomes e1_0. Parameters appear as ? in SQL – injection safe.`,
    },
    {
      title: `Projections, Aggregates and GROUP BY`,
      scenario: `HR report: names with salaries, and per-department head count and average salary.`,
      steps: [
        `Create class HqlReports`,
        `Run and observe that projections return Object[] rows`,
      ],
      code: `try (Session s = sf.openSession()) {
    List<Object[]> rows = s.createQuery(
            "select e.name, e.city from Employee e where e.department = 'HR' order by e.name",
            Object[].class).list();
    for (Object[] r : rows) System.out.println(r[0] + " - " + r[1]);

    Long total = s.createQuery("select count(e) from Employee e", Long.class).getSingleResult();
    System.out.println("Total employees: " + total);

    List<Object[]> stats = s.createQuery(
            "select e.department, count(e), avg(e.salary) from Employee e " +
            "group by e.department order by e.department", Object[].class).list();
    for (Object[] r : stats)
        System.out.println(r[0] + " count=" + r[1] + " avg=" + String.format("%.2f", r[2]));

    Double max = s.createQuery("select max(e.salary) from Employee e", Double.class).getSingleResult();
    System.out.println("Highest salary: " + max);
}`,
      result: `Hibernate: select e1_0.name,e1_0.city from employees e1_0 where e1_0.department='HR' order by e1_0.name
Priya - Pune
Ravi - Mumbai
Hibernate: select count(e1_0.id) from employees e1_0
Total employees: 6
Hibernate: select e1_0.department,count(e1_0.id),avg(e1_0.salary) from employees e1_0 group by e1_0.department order by e1_0.department
HR count=2 avg=42500.00
IT count=3 avg=63333.33
SALES count=1 avg=50000.00
Hibernate: select max(e1_0.salary) from employees e1_0
Highest salary: 75000.0`,
      explanation: `Projection queries return Object[] per row. count(e) is translated to count(e1_0.id). IT average = (60000+75000+55000)/3 = 63333.33. Literals like 'HR' are allowed but parameters are better for user input.`,
    },
    {
      title: `Named Query, Bulk Update and Delete`,
      scenario: `Use the predefined named queries, then give HR a 10% raise and delete Delhi employees in bulk.`,
      steps: [
        `Use createNamedQuery with the names defined on the entity`,
        `Bulk operations need a transaction`,
        `Run and check row counts`,
      ],
      code: `try (Session s = sf.openSession()) {
    List<Employee> pune = s.createNamedQuery("Employee.byCity", Employee.class)
                           .setParameter("city", "Pune").list();
    System.out.println("Pune: " + pune);

    Long itCount = s.createNamedQuery("Employee.countByDept", Long.class)
                    .setParameter("dept", "IT").getSingleResult();
    System.out.println("IT count: " + itCount);

    Transaction tx = s.beginTransaction();
    int updated = s.createMutationQuery(
            "update Employee e set e.salary = e.salary * 1.10 where e.department = :d")
        .setParameter("d", "HR").executeUpdate();
    int deleted = s.createMutationQuery("delete from Employee e where e.city = :c")
        .setParameter("c", "Delhi").executeUpdate();
    tx.commit();
    System.out.println("Updated: " + updated + ", Deleted: " + deleted);
}`,
      result: `Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.city=? order by e1_0.name
Pune: [Asha 60000.0, John 75000.0, Priya 45000.0]
Hibernate: select count(e1_0.id) from employees e1_0 where e1_0.department=?
IT count: 3
Hibernate: update employees set salary=(salary*1.1) where department=?
Hibernate: delete from employees where city=?
Updated: 2, Deleted: 1`,
      explanation: `In Hibernate 6, createMutationQuery() is the preferred API for update/delete/insert HQL (createQuery also works). executeUpdate() returns the affected row count. Bulk statements go straight to the DB, so any Employee objects already loaded in this session still show old salaries – call refresh() or clear() if needed.`,
    },
    {
      title: `Pagination with setFirstResult and setMaxResults`,
      scenario: `Show employees 2 per page, sorted by id (run on fresh seed data).`,
      steps: [
        `Re-run SeedData with hbm2ddl.auto=create to restore six rows`,
        `Write a loop that prints all pages`,
        `Observe the LIMIT clause Hibernate generates for MySQL`,
      ],
      code: `int size = 2;
try (Session s = sf.openSession()) {
    long total = s.createQuery("select count(e) from Employee e", Long.class).getSingleResult();
    int pages = (int) Math.ceil((double) total / size);

    for (int page = 1; page <= pages; page++) {
        List<Employee> list = s.createQuery("from Employee e order by e.id", Employee.class)
                               .setFirstResult((page - 1) * size)
                               .setMaxResults(size)
                               .list();
        System.out.println("Page " + page + ": " + list);
    }
}`,
      result: `Hibernate: select count(e1_0.id) from employees e1_0
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 order by e1_0.id limit ?
Page 1: [Asha 60000.0, Ravi 40000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 order by e1_0.id limit ?,?
Page 2: [John 75000.0, Meena 50000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 order by e1_0.id limit ?,?
Page 3: [Kiran 55000.0, Priya 45000.0]`,
      explanation: `For the first page (offset 0) Hibernate only needs "limit ?". For later pages MySQL syntax "limit offset,count" is used. The same Java code would produce "offset ? rows fetch first ? rows only" on Oracle.`,
    },
  ],
  interview: [
    { q: `What is HQL and how is it different from SQL?`, a: `HQL is Hibernate's object-oriented query language that uses entity and field names instead of tables/columns, supports polymorphism and associations, is database-independent and returns entities. Hibernate translates it to SQL.`, level: 'Easy' },
    { q: `Difference between HQL and JPQL?`, a: `JPQL is the JPA-standard query language; HQL is Hibernate's superset of JPQL. All JPQL is valid HQL, but HQL has extras (e.g. omitting select, more functions, insert-select).`, level: 'Medium' },
    { q: `Named vs positional parameters?`, a: `Named use :name and setParameter("name", v); positional use ?1, ?2 and setParameter(1, v). Named are more readable. Old style plain ? (JDBC style) is not supported in Hibernate 6 HQL.`, level: 'Easy' },
    { q: `How does Hibernate prevent SQL injection?`, a: `Parameters are bound via JDBC PreparedStatement placeholders, never concatenated into the SQL string. Injection is only possible if you concatenate user input into HQL yourself.`, level: 'Medium' },
    { q: `What is a named query and its advantage?`, a: `A query defined with @NamedQuery (or in XML) with a unique name. It is parsed and validated at startup (fail fast), reused, and keeps queries centralised.`, level: 'Easy' },
    { q: `How do you implement pagination in Hibernate?`, a: `query.setFirstResult((page-1)*size).setMaxResults(size). Hibernate generates dialect-specific LIMIT/OFFSET SQL. Always use ORDER BY for stable pages.`, level: 'Easy' },
    { q: `Difference between list(), uniqueResult() and getSingleResult()?`, a: `list() returns all rows. uniqueResult() returns one object or null; throws NonUniqueResultException if more than one. getSingleResult() (JPA) throws NoResultException if none and NonUniqueResultException if many.`, level: 'Medium' },
    { q: `What does a projection query return?`, a: `Object[] per row for multiple selected fields, the single value type for one field, or a DTO when using "select new pkg.Dto(...)".`, level: 'Medium' },
    { q: `What are the risks of bulk HQL update/delete?`, a: `They bypass the persistence context, so managed entities become stale; they skip cascades, lifecycle callbacks and optimistic version checks unless you handle them; second-level cache regions are invalidated.`, level: 'Hard' },
    { q: `Is HQL case sensitive?`, a: `Keywords are not (SELECT/select), but entity names and property names are (Employee, e.salary).`, level: 'Easy' },
    { q: `How to write a DTO projection in HQL?`, a: `select new com.demo.dto.EmpDto(e.name, e.salary) from Employee e – the DTO needs a matching constructor and the fully qualified class name (or a Java record).`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Write HQL to find employees whose name starts with a letter given by the user (e.g. "A"), case-insensitive, sorted by name.`,
      hint: `upper(e.name) like :p with parameter "A%".`,
      solution: `String letter = "a";
List<Employee> list = s.createQuery(
        "from Employee e where upper(e.name) like :p order by e.name", Employee.class)
    .setParameter("p", letter.toUpperCase() + "%")
    .list();
System.out.println(list);   // [Asha 60000.0]`,
    },
    {
      task: `Create a record EmpSummary(String name, String department) and fetch all Pune employees as EmpSummary objects using select new.`,
      hint: `Use the fully qualified record name in HQL.`,
      solution: `package com.demo.dto;
public record EmpSummary(String name, String department) {}

List<EmpSummary> list = s.createQuery(
        "select new com.demo.dto.EmpSummary(e.name, e.department) " +
        "from Employee e where e.city = :c order by e.name", EmpSummary.class)
    .setParameter("c", "Pune").list();
list.forEach(System.out::println);
// EmpSummary[name=Asha, department=IT]
// EmpSummary[name=John, department=IT]
// EmpSummary[name=Priya, department=HR]`,
    },
    {
      task: `Find departments whose average salary is more than 45000, showing department and average, highest first.`,
      hint: `group by + having + order by avg desc.`,
      solution: `List<Object[]> rows = s.createQuery(
        "select e.department, avg(e.salary) from Employee e " +
        "group by e.department having avg(e.salary) > 45000 " +
        "order by avg(e.salary) desc", Object[].class).list();
for (Object[] r : rows) System.out.println(r[0] + " " + String.format("%.2f", r[1]));
// IT 63333.33
// SALES 50000.00`,
    },
    {
      task: `Write a generic paging method List<Employee> getPage(int page, int size, String sortField) that only allows sorting by name, salary or id.`,
      hint: `You cannot bind a column name as a parameter; validate against a whitelist before concatenating.`,
      solution: `public List<Employee> getPage(int page, int size, String sortField) {
    if (!List.of("id", "name", "salary").contains(sortField))
        throw new IllegalArgumentException("Bad sort field");
    try (Session s = sf.openSession()) {
        return s.createQuery("from Employee e order by e." + sortField, Employee.class)
                .setFirstResult((page - 1) * size)
                .setMaxResults(size)
                .list();
    }
}`,
    },
    {
      task: `Add a named query Employee.highEarners that returns employees with salary >= :min sorted by salary desc, and use it with min = 55000.`,
      hint: `Add another @NamedQuery annotation on Employee.`,
      solution: `@NamedQuery(name = "Employee.highEarners",
            query = "from Employee e where e.salary >= :min order by e.salary desc")

List<Employee> list = s.createNamedQuery("Employee.highEarners", Employee.class)
                       .setParameter("min", 55000.0).list();
System.out.println(list);   // [John 75000.0, Asha 60000.0, Kiran 55000.0]`,
    },
  ],
  quiz: [
    { question: `In HQL "from Employee e where e.salary > :min", Employee and salary refer to ...`, options: [`Table and column`, `Entity class and field`, `Schema and table`, `Alias and index`], answer: 1, explanation: `HQL uses entity and attribute names.` },
    { question: `Which method skips rows for pagination?`, options: [`setMaxResults()`, `setFetchSize()`, `setFirstResult()`, `setOffsetRows()`], answer: 2, explanation: `setFirstResult sets the offset; setMaxResults sets the page size.` },
    { question: `What type does "select count(e) from Employee e" return?`, options: [`Integer`, `int`, `Double`, `Long`], answer: 3, explanation: `count() returns Long.` },
    { question: `Where is a @NamedQuery validated?`, options: [`When the SessionFactory is built`, `At compile time by javac`, `Only when executed`, `Never`], answer: 0, explanation: `Hibernate parses named queries at startup, failing fast on errors.` },
    { question: `Which method executes an HQL UPDATE or DELETE?`, options: [`list()`, `executeUpdate()`, `uniqueResult()`, `stream()`], answer: 1, explanation: `executeUpdate returns the number of affected rows.` },
  ],
};
