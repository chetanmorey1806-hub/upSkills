export default {
  id: 'day-07-criteria-api',
  title: 'Criteria API',
  module: 'Module 2: Queries',
  day: 7,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Build type-safe, dynamic queries in Java code with the JPA Criteria API (CriteriaBuilder, CriteriaQuery, Root, Predicate), including dynamic search filters, sorting, aggregates, pagination and bulk CriteriaUpdate/CriteriaDelete.`,
  objectives: [
    `Explain why the Criteria API exists and when to prefer it over HQL`,
    `Use CriteriaBuilder, CriteriaQuery, Root and Predicate to build SELECT queries`,
    `Build dynamic WHERE clauses from optional search fields`,
    `Write projections, aggregates and GROUP BY with Tuple/multiselect`,
    `Use CriteriaUpdate and CriteriaDelete for bulk operations`,
  ],
  theory: [
    {
      heading: `Why Criteria API?`,
      content: `HQL is a String. When a search screen has 6 optional filters (name, department, city, min salary, max salary, joined after), building the HQL string with many if-blocks and "and" joins becomes ugly and error-prone.

The Criteria API builds the query using Java objects and method calls. You add conditions only when the user filled a field. The compiler checks method calls, and IDE auto-complete helps.

Analogy: HQL is writing a sentence by hand; Criteria is assembling it from LEGO blocks – easy to add or remove a block.

Note: the old Hibernate-specific session.createCriteria() (org.hibernate.Criteria, Restrictions) was deprecated in 5.2 and REMOVED in Hibernate 6. Use the JPA Criteria API (jakarta.persistence.criteria).`,
      points: [
        `Best for dynamic queries built at runtime`,
        `Type-safe with the JPA static metamodel (Employee_.salary) – optional`,
        `More verbose than HQL for simple fixed queries – use HQL there`,
      ],
    },
    {
      heading: `Building Blocks`,
      content: `CriteriaBuilder (cb) – factory for queries, predicates (equal, gt, like, between, and, or) and expressions (count, avg, sum).
CriteriaQuery<T> (cq) – the query itself: select, where, orderBy, groupBy, having.
Root<T> (root) – the FROM entity; you navigate fields with root.get("salary").
Predicate – one condition; combine with cb.and / cb.or / cb.not.
Query execution – session.createQuery(cq).getResultList().

Diagram in words:
  cb = session.getCriteriaBuilder()
  cq = cb.createQuery(Employee.class)       ->  SELECT ...
  root = cq.from(Employee.class)            ->  FROM employees e
  cq.select(root).where(predicates)         ->  WHERE ...
  cq.orderBy(cb.desc(root.get("salary")))   ->  ORDER BY ...
  session.createQuery(cq).getResultList()   ->  run`,
      syntax: `CriteriaBuilder cb = session.getCriteriaBuilder();
CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
Root<Employee> root = cq.from(Employee.class);
cq.select(root)
  .where(cb.equal(root.get("department"), "IT"))
  .orderBy(cb.asc(root.get("name")));
List<Employee> list = session.createQuery(cq).getResultList();`,
    },
    {
      heading: `Common Predicates`,
      content: `Most used CriteriaBuilder methods:`,
      syntax: `cb.equal(root.get("city"), "Pune")             // city = 'Pune'
cb.notEqual(root.get("city"), "Pune")
cb.gt(root.get("salary"), 50000)                // >   (numbers: gt, ge, lt, le)
cb.greaterThan(root.get("joined"), date)        // >   (comparables like dates/strings)
cb.between(root.get("salary"), 40000.0, 60000.0)
cb.like(root.get("name"), "A%")
cb.like(cb.lower(root.get("name")), "%sha%")
root.get("city").in("Pune", "Delhi")
cb.isNull(root.get("email"))
cb.and(p1, p2), cb.or(p1, p2), cb.not(p)`,
      tip: `Hibernate 6 sends criteria literal values as bind parameters (?), so they are injection safe too.`,
    },
    {
      heading: `Dynamic Queries with a List of Predicates`,
      content: `The main reason to use Criteria: build conditions only for the filters that are present.

  List<Predicate> ps = new ArrayList<>();
  if (name != null) ps.add(cb.like(root.get("name"), name + "%"));
  if (dept != null) ps.add(cb.equal(root.get("department"), dept));
  if (min  != null) ps.add(cb.ge(root.get("salary"), min));
  cq.where(ps.toArray(new Predicate[0]));   // AND of all; empty -> no WHERE

This is exactly how search screens and REST filter APIs are implemented. Spring Data JPA "Specifications" are built on this same API.`,
    },
    {
      heading: `Projections, Aggregates and Tuples`,
      content: `To select specific fields or aggregates, create the query with Object[].class or Tuple.class and use multiselect. With Tuple you can read values by alias, which is cleaner than array indexes.`,
      syntax: `CriteriaQuery<Tuple> cq = cb.createTupleQuery();
Root<Employee> r = cq.from(Employee.class);
cq.multiselect(r.get("department").alias("dept"),
               cb.count(r).alias("cnt"))
  .groupBy(r.get("department"))
  .having(cb.gt(cb.count(r), 1));
for (Tuple t : session.createQuery(cq).getResultList())
    System.out.println(t.get("dept") + " " + t.get("cnt"));

// single value
CriteriaQuery<Double> q = cb.createQuery(Double.class);
Root<Employee> e = q.from(Employee.class);
q.select(cb.max(e.get("salary")));`,
    },
    {
      heading: `Criteria vs HQL – When to Use Which`,
      content: `Comparison:`,
      points: [
        `Fixed, readable query -> HQL / named query`,
        `Query shape depends on user input -> Criteria`,
        `Need compile-time safety on field names -> Criteria + metamodel (Employee_)`,
        `Both are translated to the same SQL; performance is the same`,
        `Pagination works identically: createQuery(cq).setFirstResult().setMaxResults()`,
        `Common mistake: misspelling root.get("salry") compiles but fails at runtime with IllegalArgumentException – the metamodel avoids this`,
      ],
    },
  ],
  examples: [
    {
      title: `Basic Criteria Queries – Equal, Between, Like, Or`,
      scenario: `Using the six-employee data from Day 6 (Asha IT 60000 Pune, Ravi HR 40000 Mumbai, John IT 75000 Pune, Meena SALES 50000 Delhi, Kiran IT 55000 Mumbai, Priya HR 45000 Pune).`,
      steps: [
        `Reuse the Employee entity and SeedData from Day 6 (hbm2ddl.auto=create, run seed once)`,
        `Create class CriteriaBasics; import jakarta.persistence.criteria.*`,
        `Run (IntelliJ ▶ / Eclipse Run As > Java Application) and compare each query with its SQL`,
      ],
      code: `import jakarta.persistence.criteria.*;

try (Session s = sf.openSession()) {
    CriteriaBuilder cb = s.getCriteriaBuilder();

    // 1. All IT employees by name
    CriteriaQuery<Employee> q1 = cb.createQuery(Employee.class);
    Root<Employee> r1 = q1.from(Employee.class);
    q1.select(r1).where(cb.equal(r1.get("department"), "IT")).orderBy(cb.asc(r1.get("name")));
    System.out.println("IT: " + s.createQuery(q1).getResultList());

    // 2. Salary between 45000 and 60000
    CriteriaQuery<Employee> q2 = cb.createQuery(Employee.class);
    Root<Employee> r2 = q2.from(Employee.class);
    q2.select(r2).where(cb.between(r2.get("salary"), 45000.0, 60000.0)).orderBy(cb.asc(r2.get("name")));
    System.out.println("Between: " + s.createQuery(q2).getResultList());

    // 3. Name ends with 'a' AND (city Pune OR Delhi)
    CriteriaQuery<Employee> q3 = cb.createQuery(Employee.class);
    Root<Employee> r3 = q3.from(Employee.class);
    Predicate endsA = cb.like(r3.get("name"), "%a");
    Predicate city = cb.or(cb.equal(r3.get("city"), "Pune"), cb.equal(r3.get("city"), "Delhi"));
    q3.select(r3).where(cb.and(endsA, city)).orderBy(cb.desc(r3.get("salary")));
    System.out.println("Ends with a in Pune/Delhi: " + s.createQuery(q3).getResultList());
}`,
      result: `Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.department=? order by e1_0.name
IT: [Asha 60000.0, John 75000.0, Kiran 55000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.salary between ? and ? order by e1_0.name
Between: [Asha 60000.0, Kiran 55000.0, Meena 50000.0, Priya 45000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.name like ? escape '' and (e1_0.city=? or e1_0.city=?) order by e1_0.salary desc
Ends with a in Pune/Delhi: [Asha 60000.0, Meena 50000.0, Priya 45000.0]`,
      explanation: `Each query has the same three steps: create query, define root, set select/where/orderBy. Asha, Meena and Priya end with "a" and live in Pune or Delhi. Hibernate may add an escape clause to LIKE depending on version.`,
    },
    {
      title: `Dynamic Search Filter`,
      scenario: `An employee search screen with optional name, department and minimum salary – any of them can be empty.`,
      steps: [
        `Create class EmployeeSearch with method search(String name, String dept, Double minSalary)`,
        `Call it with different combinations from main()`,
        `Notice the WHERE clause changes with the inputs`,
      ],
      code: `import jakarta.persistence.criteria.*;
import java.util.*;

public class EmployeeSearch {
    static List<Employee> search(Session s, String name, String dept, Double minSalary) {
        CriteriaBuilder cb = s.getCriteriaBuilder();
        CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
        Root<Employee> e = cq.from(Employee.class);

        List<Predicate> ps = new ArrayList<>();
        if (name != null && !name.isBlank())
            ps.add(cb.like(cb.lower(e.get("name")), name.toLowerCase() + "%"));
        if (dept != null)
            ps.add(cb.equal(e.get("department"), dept));
        if (minSalary != null)
            ps.add(cb.ge(e.get("salary"), minSalary));

        cq.select(e).where(ps.toArray(new Predicate[0])).orderBy(cb.desc(e.get("salary")));
        return s.createQuery(cq).getResultList();
    }

    public static void main(String[] args) {
        try (Session s = HibernateUtil.getSessionFactory().openSession()) {
            System.out.println("1: " + search(s, null, "IT", 55000.0));
            System.out.println("2: " + search(s, "p", null, null));
            System.out.println("3: " + search(s, null, null, null).size() + " rows");
        }
    }
}`,
      result: `Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.department=? and e1_0.salary>=? order by e1_0.salary desc
1: [John 75000.0, Asha 60000.0, Kiran 55000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where lower(e1_0.name) like ? escape '' order by e1_0.salary desc
2: [Priya 45000.0]
Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 order by e1_0.salary desc
3: 6 rows`,
      explanation: `Only filled filters become predicates. With no predicates, where() with an empty array produces no WHERE clause at all. Doing the same with HQL strings would need careful "where/and" concatenation.`,
    },
    {
      title: `Aggregates and GROUP BY with Tuple`,
      scenario: `Department-wise employee count and total salary, only departments with more than one employee, plus the overall average.`,
      steps: [
        `Create class CriteriaAggregates`,
        `Use cb.createTupleQuery() and aliases`,
        `Run and read values by alias`,
      ],
      code: `try (Session s = sf.openSession()) {
    CriteriaBuilder cb = s.getCriteriaBuilder();

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<Employee> e = cq.from(Employee.class);
    cq.multiselect(e.get("department").alias("dept"),
                   cb.count(e).alias("cnt"),
                   cb.sum(e.<Double>get("salary")).alias("total"))
      .groupBy(e.get("department"))
      .having(cb.gt(cb.count(e), 1L))
      .orderBy(cb.asc(e.get("department")));

    for (Tuple t : s.createQuery(cq).getResultList())
        System.out.println(t.get("dept") + " count=" + t.get("cnt") + " total=" + t.get("total"));

    CriteriaQuery<Double> avgQ = cb.createQuery(Double.class);
    Root<Employee> a = avgQ.from(Employee.class);
    avgQ.select(cb.avg(a.get("salary")));
    System.out.println("Average: " + s.createQuery(avgQ).getSingleResult());
}`,
      result: `Hibernate: select e1_0.department,count(e1_0.id),sum(e1_0.salary) from employees e1_0 group by e1_0.department having count(e1_0.id)>? order by e1_0.department
HR count=2 total=85000.0
IT count=3 total=190000.0
Hibernate: select avg(e1_0.salary) from employees e1_0
Average: 54166.666666666664`,
      explanation: `SALES has only one employee, so HAVING removes it. Total salary = 325000, 325000 / 6 = 54166.666666666664 as a double. e.<Double>get("salary") gives the generic type needed by cb.sum.`,
    },
    {
      title: `Pagination, CriteriaUpdate and CriteriaDelete`,
      scenario: `Page through Pune employees, then raise IT salaries by 5000 and delete employees earning below 42000.`,
      steps: [
        `Create class CriteriaBulk`,
        `Bulk operations need a transaction`,
        `Run on freshly seeded data`,
      ],
      code: `try (Session s = sf.openSession()) {
    CriteriaBuilder cb = s.getCriteriaBuilder();

    CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
    Root<Employee> r = cq.from(Employee.class);
    cq.select(r).where(cb.equal(r.get("city"), "Pune")).orderBy(cb.asc(r.get("id")));
    List<Employee> page2 = s.createQuery(cq).setFirstResult(2).setMaxResults(2).getResultList();
    System.out.println("Pune page 2: " + page2);

    Transaction tx = s.beginTransaction();

    CriteriaUpdate<Employee> up = cb.createCriteriaUpdate(Employee.class);
    Root<Employee> u = up.from(Employee.class);
    up.set(u.<Double>get("salary"), cb.sum(u.<Double>get("salary"), 5000.0))
      .where(cb.equal(u.get("department"), "IT"));
    int updated = s.createMutationQuery(up).executeUpdate();

    CriteriaDelete<Employee> del = cb.createCriteriaDelete(Employee.class);
    Root<Employee> d = del.from(Employee.class);
    del.where(cb.lt(d.get("salary"), 42000.0));
    int deleted = s.createMutationQuery(del).executeUpdate();

    tx.commit();
    System.out.println("Updated " + updated + ", deleted " + deleted);
}`,
      result: `Hibernate: select e1_0.id,e1_0.city,e1_0.department,e1_0.name,e1_0.salary from employees e1_0 where e1_0.city=? order by e1_0.id limit ?,?
Pune page 2: [Priya 45000.0]
Hibernate: update employees set salary=(salary+?) where department=?
Hibernate: delete from employees where salary<?
Updated 3, deleted 1`,
      explanation: `Pune employees by id are Asha(1), John(3), Priya(6). Skipping 2 leaves only Priya. Three IT rows got +5000 and Ravi (40000) was deleted. Like HQL bulk statements, these bypass the persistence context.`,
    },
  ],
  interview: [
    { q: `What is the Criteria API?`, a: `A JPA API to build queries programmatically using Java objects (CriteriaBuilder, CriteriaQuery, Root, Predicate) instead of query strings. It is type-safe (with metamodel) and ideal for dynamic queries.`, level: 'Easy' },
    { q: `What happened to session.createCriteria() in Hibernate 6?`, a: `The legacy Hibernate Criteria API (org.hibernate.Criteria, Restrictions, Projections) was deprecated in 5.2 and removed in 6. Use the JPA Criteria API via session.getCriteriaBuilder().`, level: 'Medium' },
    { q: `When would you choose Criteria over HQL?`, a: `When the query structure depends on runtime conditions, such as optional search filters or dynamic sorting. For static queries HQL is shorter and more readable.`, level: 'Medium' },
    { q: `What are Root and Predicate?`, a: `Root<T> represents the entity in the FROM clause and is used to access attributes (root.get("name")). Predicate represents a boolean condition used in where/having, combined with cb.and/cb.or.`, level: 'Easy' },
    { q: `How do you build a dynamic WHERE clause?`, a: `Collect Predicates in a List only for non-null inputs and call cq.where(list.toArray(new Predicate[0])). Multiple predicates are ANDed; an empty array means no WHERE.`, level: 'Medium' },
    { q: `What is the JPA static metamodel?`, a: `Generated classes like Employee_ with static attributes (Employee_.salary) produced by the hibernate-jpamodelgen annotation processor. Using them instead of strings gives compile-time checking.`, level: 'Hard' },
    { q: `How to select multiple columns with Criteria?`, a: `Use cb.createTupleQuery() or createQuery(Object[].class) and cq.multiselect(...). Tuple lets you access values by alias.`, level: 'Medium' },
    { q: `How do you paginate a Criteria query?`, a: `session.createQuery(cq).setFirstResult(offset).setMaxResults(size).getResultList(), same as HQL.`, level: 'Easy' },
    { q: `What are CriteriaUpdate and CriteriaDelete?`, a: `Criteria equivalents of bulk HQL update/delete statements; executed with executeUpdate() inside a transaction; they bypass the persistence context.`, level: 'Medium' },
    { q: `Is Criteria slower than HQL?`, a: `No significant difference: both become the same SQL Abstract Syntax Tree in Hibernate 6 (SQM) and the same SQL. Building the query object has tiny overhead.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Using Criteria, list employees from Pune or Mumbai with salary less than 60000, sorted by city then name.`,
      hint: `root.get("city").in(...), cb.lt, two orderBy entries.`,
      solution: `CriteriaBuilder cb = s.getCriteriaBuilder();
CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
Root<Employee> e = cq.from(Employee.class);
cq.select(e)
  .where(e.get("city").in("Pune", "Mumbai"), cb.lt(e.get("salary"), 60000.0))
  .orderBy(cb.asc(e.get("city")), cb.asc(e.get("name")));
System.out.println(s.createQuery(cq).getResultList());
// [Kiran 55000.0, Ravi 40000.0, Priya 45000.0]   (Mumbai: Kiran, Ravi; Pune: Priya)`,
    },
    {
      task: `Write a Criteria query that returns only employee names (List<String>) in the HR department.`,
      hint: `cb.createQuery(String.class) and select(root.get("name")).`,
      solution: `CriteriaQuery<String> cq = cb.createQuery(String.class);
Root<Employee> e = cq.from(Employee.class);
cq.select(e.get("name")).where(cb.equal(e.get("department"), "HR")).orderBy(cb.asc(e.get("name")));
List<String> names = s.createQuery(cq).getResultList();
System.out.println(names);   // [Priya, Ravi]`,
    },
    {
      task: `Extend the dynamic search with maxSalary, city, and a sort field + direction (asc/desc) chosen by the user.`,
      hint: `Whitelist sort fields; use cb.asc or cb.desc based on direction.`,
      solution: `static List<Employee> search(Session s, String dept, String city, Double min, Double max,
                             String sortBy, boolean asc) {
    if (!List.of("name", "salary", "id").contains(sortBy)) sortBy = "id";
    CriteriaBuilder cb = s.getCriteriaBuilder();
    CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
    Root<Employee> e = cq.from(Employee.class);
    List<Predicate> ps = new ArrayList<>();
    if (dept != null) ps.add(cb.equal(e.get("department"), dept));
    if (city != null) ps.add(cb.equal(e.get("city"), city));
    if (min  != null) ps.add(cb.ge(e.get("salary"), min));
    if (max  != null) ps.add(cb.le(e.get("salary"), max));
    cq.select(e).where(ps.toArray(new Predicate[0]))
      .orderBy(asc ? cb.asc(e.get(sortBy)) : cb.desc(e.get(sortBy)));
    return s.createQuery(cq).getResultList();
}`,
    },
    {
      task: `Using Criteria, find the employee(s) with the highest salary using a subquery.`,
      hint: `cq.subquery(Double.class), select cb.max, then cb.equal(salary, subquery).`,
      solution: `CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
Root<Employee> e = cq.from(Employee.class);

Subquery<Double> sub = cq.subquery(Double.class);
Root<Employee> e2 = sub.from(Employee.class);
sub.select(cb.max(e2.get("salary")));

cq.select(e).where(cb.equal(e.get("salary"), sub));
System.out.println(s.createQuery(cq).getResultList());   // [John 75000.0]
// SQL: ... where e1_0.salary=(select max(e2_0.salary) from employees e2_0)`,
    },
  ],
  quiz: [
    { question: `Which object is used to create predicates like equal and like?`, options: [`Root`, `CriteriaQuery`, `CriteriaBuilder`, `Session`], answer: 2, explanation: `CriteriaBuilder is the factory for predicates and expressions.` },
    { question: `In Hibernate 6, session.createCriteria(Employee.class) ...`, options: [`Is the recommended API`, `Has been removed`, `Returns a CriteriaBuilder`, `Works only with MySQL`], answer: 1, explanation: `Legacy Hibernate Criteria was removed in Hibernate 6.` },
    { question: `How are multiple predicates passed to where() combined?`, options: [`OR`, `XOR`, `Only the first is used`, `AND`], answer: 3, explanation: `where(p1, p2, ...) ANDs all predicates.` },
    { question: `Which method starts a query returning Tuple rows?`, options: [`cb.createTupleQuery()`, `cb.createQuery()`, `cq.multiselect()`, `session.createTuple()`], answer: 0, explanation: `createTupleQuery returns CriteriaQuery<Tuple>.` },
    { question: `Main advantage of Criteria over HQL is ...`, options: [`Always faster SQL`, `Shorter code`, `Easy dynamic query building`, `No need for entities`], answer: 2, explanation: `Criteria shines when conditions depend on runtime input.` },
  ],
};
