export default {
  id: 'day-10-fetch-types-n-plus-one-lazy',
  title: 'Fetch Types (LAZY vs EAGER), N+1 Problem, LazyInitializationException',
  module: 'Module 3: Mappings & Performance',
  day: 10,
  level: 'Advanced',
  duration: '3 hours',
  summary: `Learn how and when Hibernate loads related data, detect the N+1 select problem from the SQL log, fix it with JOIN FETCH, entity graphs and batch fetching, and understand and solve LazyInitializationException.`,
  objectives: [
    `Explain FetchType.LAZY and FetchType.EAGER and their defaults`,
    `Identify the N+1 select problem by reading generated SQL`,
    `Fix N+1 with JOIN FETCH, @EntityGraph / entity graphs and @BatchSize`,
    `Explain why LazyInitializationException occurs and list correct fixes`,
    `Choose a sensible fetching strategy for real applications`,
  ],
  theory: [
    {
      heading: `LAZY vs EAGER`,
      content: `Fetch type decides WHEN related data is loaded.

EAGER – load the association immediately together with the owner (JOIN or extra SELECT), whether you use it or not.
LAZY – load it only when you first access it. Until then Hibernate puts a proxy (for to-one) or an uninitialised PersistentBag/PersistentSet (for collections).

Analogy: ordering a thali (EAGER) – everything arrives at once even if you don't eat the sweet. Ordering à la carte (LAZY) – each dish comes only when you ask for it.

Defaults (JPA):
  @ManyToOne, @OneToOne   -> EAGER
  @OneToMany, @ManyToMany -> LAZY`,
      syntax: `@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "department_id")
private Department department;

@OneToMany(mappedBy = "department", fetch = FetchType.LAZY)   // already default
private List<Employee> employees;`,
      tip: `Industry rule: make EVERY association LAZY, then fetch exactly what each use case needs in the query (JOIN FETCH / entity graph). EAGER cannot be turned off per query, LAZY can be turned "on" per query.`,
    },
    {
      heading: `The N+1 Select Problem`,
      content: `You run 1 query to load N parents, then for each parent Hibernate runs 1 more query to load its children: total N+1 queries. With 1000 departments that is 1001 round trips – the page becomes very slow, though the code looks innocent.

  List<Department> list = session.createQuery("from Department", Department.class).list(); // 1 query
  for (Department d : list)
      System.out.println(d.getEmployees().size());                                      // N queries

It also happens with EAGER @ManyToOne: "from Employee" loads employees (1 query), then Hibernate fires one SELECT per distinct department to satisfy EAGER.

How to detect: turn on show_sql and look for the same SELECT repeated with different ids, or enable hibernate.generate_statistics=true and check the "queries executed" count.`,
    },
    {
      heading: `Fixing N+1`,
      content: `1. JOIN FETCH in HQL/JPQL – load parents and children in ONE SQL with a join:
     select d from Department d left join fetch d.employees
   Hibernate 6 removes duplicate parents automatically (no need for DISTINCT).

2. Entity Graph – declare which associations to fetch, pass it as a hint:
     EntityGraph<Department> g = session.createEntityGraph(Department.class);
     g.addAttributeNodes("employees");
     query.setHint("jakarta.persistence.fetchgraph", g);

3. @BatchSize(size = 10) on the collection/entity – still lazy, but when one collection is initialised Hibernate loads up to 10 collections with "where department_id in (?,?,...)". N+1 becomes 1 + N/10. Or globally: hibernate.default_batch_fetch_size.

4. DTO projection – select only needed columns with a join ("select new ...").`,
      points: [
        `Do not JOIN FETCH two List (bag) collections in one query -> MultipleBagFetchException; use Set or separate queries`,
        `Pagination + JOIN FETCH of a collection makes Hibernate paginate in memory (warning HHH90003004) – paginate parent ids first`,
      ],
    },
    {
      heading: `LazyInitializationException`,
      content: `A lazy proxy/collection needs an OPEN session to run its SELECT. If you close the session and then touch the lazy data, Hibernate cannot load it:

  org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: com.demo.relations.Department.employees: could not initialize proxy - no Session

Analogy: you got a library token (proxy) but the library (session) has closed – you cannot collect the book anymore.

Typical places: DAO closes session, then the service/JSP/JSON serializer calls getEmployees().`,
      points: [
        `Fix 1 (best): fetch what you need inside the session – JOIN FETCH / entity graph`,
        `Fix 2: initialise inside the session – Hibernate.initialize(d.getEmployees()) or call size()`,
        `Fix 3: return DTOs instead of entities from the DAO/service layer`,
        `Fix 4: keep the transaction open around the whole use case (service layer @Transactional in Spring)`,
        `Anti-patterns: switching to EAGER everywhere, hibernate.enable_lazy_load_no_trans=true, Open Session In View for heavy apps`,
      ],
    },
    {
      heading: `Fetch Modes (Hibernate specific)`,
      content: `@Fetch(FetchMode.JOIN) – load with an outer join (implies eager).
@Fetch(FetchMode.SELECT) – separate select (default for lazy).
@Fetch(FetchMode.SUBSELECT) – for collections: when the first collection is accessed, load the collections of ALL parents from the original query with one "where department_id in (select id from departments ...)" query.

FetchType says WHEN; FetchMode says HOW.`,
    },
  ],
  examples: [
    {
      title: `EAGER vs LAZY on @ManyToOne`,
      scenario: `Load an employee and see when its department is fetched.`,
      steps: [
        `Use Department/Employee from Day 8. Seed: IT (Asha, John), HR (Priya, Ravi), SALES (Meena)`,
        `Run once with @ManyToOne (default EAGER) and once with @ManyToOne(fetch = FetchType.LAZY)`,
        `Compare the SQL`,
      ],
      code: `try (Session s = sf.openSession()) {
    Employee e = s.get(Employee.class, 1L);
    System.out.println("Loaded " + e.getName());
    System.out.println("Dept initialized? " + Hibernate.isInitialized(e.getDepartment()));
    System.out.println("Dept: " + e.getDepartment().getName());
}`,
      result: `-- EAGER (default)
Hibernate: select e1_0.id,d1_0.id,d1_0.name,e1_0.name from dept_employees e1_0 left join departments d1_0 on d1_0.id=e1_0.department_id where e1_0.id=?
Loaded Asha
Dept initialized? true
Dept: IT

-- LAZY
Hibernate: select e1_0.id,e1_0.department_id,e1_0.name from dept_employees e1_0 where e1_0.id=?
Loaded Asha
Dept initialized? false
Hibernate: select d1_0.id,d1_0.name from departments d1_0 where d1_0.id=?
Dept: IT`,
      explanation: `EAGER joined departments into the first SELECT. LAZY loaded only department_id and created a proxy; the department SELECT ran on getName(). If you never call getName(), LAZY saves the join.`,
    },
    {
      title: `Spotting the N+1 Problem`,
      scenario: `Print every department with its employees.`,
      steps: [
        `Create NPlusOneApp`,
        `Turn on hibernate.generate_statistics=true in hibernate.cfg.xml (optional)`,
        `Run and count the SELECT statements`,
      ],
      code: `try (Session s = sf.openSession()) {
    List<Department> depts = s.createQuery("from Department d order by d.id", Department.class).list();
    for (Department d : depts) {
        System.out.println(d.getName() + ": " + d.getEmployees());
    }
}`,
      result: `Hibernate: select d1_0.id,d1_0.name from departments d1_0 order by d1_0.id
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id=?
IT: [Asha, John]
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id=?
HR: [Priya, Ravi]
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id=?
SALES: [Meena]`,
      explanation: `1 query for departments + 3 queries (one per department) = 4 = N+1 with N=3. With 500 departments this would be 501 queries. The same repeated SELECT with a different parameter is the signature of N+1.`,
    },
    {
      title: `Fix 1: JOIN FETCH; Fix 2: Entity Graph; Fix 3: @BatchSize`,
      scenario: `Load the same data with fewer queries using three techniques.`,
      steps: [
        `Run the JOIN FETCH query`,
        `Run the entity graph version`,
        `Add @BatchSize(size = 10) (org.hibernate.annotations.BatchSize) on Department.employees and rerun the N+1 code from the previous example`,
      ],
      code: `// ---- Fix 1: JOIN FETCH ----
try (Session s = sf.openSession()) {
    List<Department> depts = s.createQuery(
        "select d from Department d left join fetch d.employees order by d.id", Department.class).list();
    depts.forEach(d -> System.out.println(d.getName() + ": " + d.getEmployees()));
}

// ---- Fix 2: Entity graph ----
try (Session s = sf.openSession()) {
    RootGraph<Department> graph = s.createEntityGraph(Department.class);
    graph.addAttributeNodes("employees");
    List<Department> depts = s.createQuery("from Department d order by d.id", Department.class)
                              .setHint("jakarta.persistence.fetchgraph", graph)
                              .list();
    System.out.println("Graph loaded " + depts.size() + " departments");
}

// ---- Fix 3: @BatchSize on the collection ----
// @OneToMany(mappedBy = "department")
// @BatchSize(size = 10)
// private List<Employee> employees = new ArrayList<>();`,
      result: `-- Fix 1
Hibernate: select d1_0.id,e1_0.department_id,e1_0.id,e1_0.name,d1_0.name from departments d1_0 left join dept_employees e1_0 on d1_0.id=e1_0.department_id order by d1_0.id
IT: [Asha, John]
HR: [Priya, Ravi]
SALES: [Meena]

-- Fix 2
Hibernate: select d1_0.id,e1_0.department_id,e1_0.id,e1_0.name,d1_0.name from departments d1_0 left join dept_employees e1_0 on d1_0.id=e1_0.department_id order by d1_0.id
Graph loaded 3 departments

-- Fix 3 (N+1 code with @BatchSize)
Hibernate: select d1_0.id,d1_0.name from departments d1_0 order by d1_0.id
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id in (?,?,?)
IT: [Asha, John]
HR: [Priya, Ravi]
SALES: [Meena]`,
      explanation: `JOIN FETCH and the entity graph both produce one SQL with a LEFT JOIN; Hibernate 6 de-duplicates the parent rows automatically. @BatchSize keeps laziness but loads the collections of up to 10 departments in one IN query – 2 queries instead of 4. (RootGraph is org.hibernate.graph.RootGraph; the exact IN list may be padded.)`,
    },
    {
      title: `LazyInitializationException and Its Fixes`,
      scenario: `A DAO returns a Department after closing the session; the caller prints employees.`,
      steps: [
        `Write findDepartment(id) that opens/closes a session and returns the entity`,
        `Call getEmployees() outside – exception`,
        `Apply the JOIN FETCH fix in findDepartmentWithEmployees(id)`,
      ],
      code: `static Department findDepartment(long id) {
    try (Session s = sf.openSession()) {
        return s.get(Department.class, id);
    }   // session closed here
}

static Department findDepartmentWithEmployees(long id) {
    try (Session s = sf.openSession()) {
        return s.createQuery(
            "select d from Department d left join fetch d.employees where d.id = :id", Department.class)
            .setParameter("id", id)
            .uniqueResult();
    }
}

public static void main(String[] args) {
    Department d = findDepartment(1L);
    try {
        System.out.println(d.getEmployees().size());
    } catch (LazyInitializationException ex) {
        System.out.println("ERROR: " + ex.getMessage());
    }

    Department ok = findDepartmentWithEmployees(1L);
    System.out.println("Fixed: " + ok.getEmployees());
}`,
      result: `Hibernate: select d1_0.id,d1_0.name from departments d1_0 where d1_0.id=?
ERROR: failed to lazily initialize a collection of role: com.demo.relations.Department.employees: could not initialize proxy - no Session
Hibernate: select d1_0.id,e1_0.department_id,e1_0.id,e1_0.name,d1_0.name from departments d1_0 left join dept_employees e1_0 on d1_0.id=e1_0.department_id where d1_0.id=?
Fixed: [Asha, John]`,
      explanation: `The first method returned a detached Department whose employees collection was never loaded. Touching it after the session closed threw LazyInitializationException. The second method fetched the collection while the session was open, so the detached object already contains the data.`,
    },
  ],
  interview: [
    { q: `What is the difference between LAZY and EAGER fetching?`, a: `EAGER loads the association immediately with the owning entity; LAZY loads it on first access using proxies/persistent collections. LAZY saves resources but needs an open session when accessed.`, level: 'Easy' },
    { q: `What are the default fetch types in JPA?`, a: `@ManyToOne and @OneToOne are EAGER; @OneToMany and @ManyToMany are LAZY.`, level: 'Easy' },
    { q: `What is the N+1 select problem?`, a: `Loading N entities with one query and then triggering one additional query per entity to load an association, resulting in N+1 queries and poor performance.`, level: 'Medium' },
    { q: `How do you solve N+1?`, a: `JOIN FETCH in HQL/JPQL, entity graphs (fetchgraph/loadgraph hints), @BatchSize or hibernate.default_batch_fetch_size, FetchMode.SUBSELECT, or DTO projections with joins.`, level: 'Medium' },
    { q: `Does EAGER fetching solve N+1?`, a: `No. EAGER associations loaded by an HQL query are still fetched with separate SELECTs per entity, causing N+1, and EAGER cannot be turned off for other use cases.`, level: 'Hard' },
    { q: `What is LazyInitializationException?`, a: `Thrown when a lazy proxy or collection is accessed after the session that loaded the entity was closed, so Hibernate cannot query the database.`, level: 'Easy' },
    { q: `How do you fix LazyInitializationException?`, a: `Fetch required data inside the session (JOIN FETCH, entity graph, Hibernate.initialize), return DTOs, or keep the transaction open over the use case. Avoid enable_lazy_load_no_trans and blanket EAGER.`, level: 'Medium' },
    { q: `Difference between fetchgraph and loadgraph hints?`, a: `fetchgraph: attributes in the graph are eager, everything else treated as lazy. loadgraph: attributes in the graph are eager, others keep their mapped fetch type.`, level: 'Hard' },
    { q: `What is MultipleBagFetchException?`, a: `Thrown when you JOIN FETCH two or more List (bag) collections in one query, because the cartesian product cannot be mapped correctly to bags. Use Set or fetch collections in separate queries.`, level: 'Hard' },
    { q: `What does @BatchSize do?`, a: `When initialising a lazy collection/proxy, Hibernate loads several of them at once with an IN clause (up to the batch size), reducing N+1 to roughly N/size + 1 queries.`, level: 'Medium' },
    { q: `What is the difference between FetchType and FetchMode?`, a: `FetchType (JPA) defines when to load (LAZY/EAGER). FetchMode (Hibernate) defines how to load (JOIN, SELECT, SUBSELECT).`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Turn on hibernate.generate_statistics and print the number of executed queries for the N+1 code and for the JOIN FETCH code.`,
      hint: `sf.getStatistics().getPrepareStatementCount(); call clear() between runs.`,
      solution: `<property name="hibernate.generate_statistics">true</property>

Statistics st = sf.getStatistics();
st.clear();
try (Session s = sf.openSession()) {
    s.createQuery("from Department", Department.class).list()
     .forEach(d -> d.getEmployees().size());
}
System.out.println("N+1 statements: " + st.getPrepareStatementCount());     // 4

st.clear();
try (Session s = sf.openSession()) {
    s.createQuery("select d from Department d left join fetch d.employees", Department.class).list()
     .forEach(d -> d.getEmployees().size());
}
System.out.println("JOIN FETCH statements: " + st.getPrepareStatementCount()); // 1`,
    },
    {
      task: `Load all employees with their department names in one query (no N+1), even though Employee.department is LAZY.`,
      hint: `join fetch e.department`,
      solution: `List<Employee> list = s.createQuery(
    "select e from Employee e join fetch e.department order by e.id", Employee.class).list();
for (Employee e : list) System.out.println(e.getName() + " - " + e.getDepartment().getName());
// One SQL: select e1_0.id,d1_0.id,d1_0.name,e1_0.name from dept_employees e1_0 join departments d1_0 on d1_0.id=e1_0.department_id order by e1_0.id`,
    },
    {
      task: `Fix the LazyInitializationException in a DAO method without changing the mapping, using Hibernate.initialize().`,
      hint: `Call it before the session closes.`,
      solution: `static Department findWithEmployees(long id) {
    try (Session s = sf.openSession()) {
        Department d = s.get(Department.class, id);
        Hibernate.initialize(d.getEmployees());   // forces the SELECT now
        return d;
    }
}
// Caller: d.getEmployees() works after the session is closed.
// Note: this still costs 2 queries; JOIN FETCH does it in 1.`,
    },
    {
      task: `Return a DTO list "department name + employee count" so that no entity (and no lazy collection) leaves the DAO.`,
      hint: `select new with left join and group by.`,
      solution: `public record DeptCount(String name, Long count) {}

List<DeptCount> list = s.createQuery(
    "select new com.demo.dto.DeptCount(d.name, count(e)) " +
    "from Department d left join d.employees e group by d.name order by d.name", DeptCount.class).list();
list.forEach(System.out::println);
// DeptCount[name=HR, count=2]
// DeptCount[name=IT, count=2]
// DeptCount[name=SALES, count=1]`,
    },
  ],
  quiz: [
    { question: `Default fetch type of @OneToMany is ...`, options: [`EAGER`, `LAZY`, `JOIN`, `SUBSELECT`], answer: 1, explanation: `Collections are LAZY by default.` },
    { question: `Loading 50 orders and then each order's items one by one causes how many queries?`, options: [`1`, `2`, `50`, `51`], answer: 3, explanation: `1 for orders + 50 for items = N+1.` },
    { question: `Which HQL keyword loads a lazy association in the same SQL?`, options: [`join fetch`, `eager`, `with`, `include`], answer: 0, explanation: `JOIN FETCH initialises the association in the same query.` },
    { question: `LazyInitializationException occurs when ...`, options: [`The table is empty`, `EAGER is used`, `A lazy association is accessed after the session is closed`, `Two sessions are open`], answer: 2, explanation: `Lazy loading requires an open session.` },
    { question: `Which is NOT a recommended fix for N+1?`, options: [`JOIN FETCH`, `@BatchSize`, `Entity graph`, `Making every association EAGER`], answer: 3, explanation: `EAGER does not prevent N+1 for queries and loads too much data everywhere.` },
  ],
};
