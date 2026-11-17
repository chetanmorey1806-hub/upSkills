export default {
  id: 'day-09-many-to-many-cascade-orphan',
  title: 'Many-to-Many, Cascade Types, Orphan Removal',
  module: 'Module 3: Mappings & Performance',
  day: 9,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Map many-to-many relationships with a join table, decide when to replace it with a join entity, and control how operations flow from parent to child with cascade types and orphanRemoval.`,
  objectives: [
    `Map @ManyToMany with @JoinTable, owning side and mappedBy`,
    `Know why Set is preferred over List for many-to-many`,
    `Model a many-to-many with extra columns as a separate entity`,
    `Use CascadeType PERSIST, MERGE, REMOVE, REFRESH, DETACH and ALL correctly`,
    `Explain orphanRemoval and how it differs from CascadeType.REMOVE`,
  ],
  theory: [
    {
      heading: `Many-to-Many and the Join Table`,
      content: `A student joins many courses and a course has many students. Neither table can hold a single FK, so a third table (join / link / bridge table) stores pairs (student_id, course_id).

Diagram in words:
  students(id, name)  <---  student_courses(student_id, course_id)  --->  courses(id, title)

In JPA you choose one side as owner and describe the join table with @JoinTable; the other side uses mappedBy.`,
      syntax: `@Entity class Student {
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "student_courses",
               joinColumns = @JoinColumn(name = "student_id"),
               inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<Course> courses = new HashSet<>();
}

@Entity class Course {
    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new HashSet<>();
}`,
      points: [
        `joinColumns = FK to the owning entity; inverseJoinColumns = FK to the other entity`,
        `Use Set: with a List (bag), removing one element makes Hibernate delete ALL rows of that student in the join table and re-insert the rest`,
        `Never use CascadeType.REMOVE on @ManyToMany – deleting a student would delete the shared courses too`,
      ],
    },
    {
      heading: `Many-to-Many with Extra Columns`,
      content: `If the link itself has data (enrolled_on, grade, fees_paid), a plain join table cannot hold it. Create an entity for the link (Enrollment) with two @ManyToOne relationships. The many-to-many becomes two one-to-many relationships.

  Student 1 ---< Enrollment(grade, enrolledOn) >--- 1 Course

This is the most common real-world design (orders-products via order_items, users-roles with assigned_on).`,
    },
    {
      heading: `Cascade Types`,
      content: `Cascade means "when I do X to the parent, also do X to the children". Without cascade you must persist/remove every object yourself.

Analogy: cascade is like moving house – when the house (parent) moves, the furniture (children) moves with it automatically.`,
      syntax: `CascadeType.PERSIST  -> persist(parent) also persists new children
CascadeType.MERGE    -> merge(parent) also merges children
CascadeType.REMOVE   -> remove(parent) also removes children
CascadeType.REFRESH  -> refresh(parent) also refreshes children
CascadeType.DETACH   -> detach(parent) also detaches children
CascadeType.ALL      -> all of the above

@OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
private List<Employee> employees;`,
      points: [
        `Put cascade on the PARENT side (@OneToMany, @OneToOne), not on @ManyToOne (deleting an employee must not delete the department)`,
        `CascadeType.ALL + orphanRemoval = true is typical for "composition" (Order owns OrderItems)`,
        `For @ManyToMany use only PERSIST and MERGE`,
      ],
    },
    {
      heading: `Orphan Removal`,
      content: `An orphan is a child that has been removed from its parent's collection (or whose to-one reference was set to null). With orphanRemoval = true Hibernate DELETEs that child row at flush. Without it, the child stays and only its FK is set to NULL (if you updated the owning side).

CascadeType.REMOVE vs orphanRemoval:
  CascadeType.REMOVE  -> child deleted when the PARENT is deleted
  orphanRemoval=true  -> child deleted when it is REMOVED FROM THE PARENT (and also when parent is deleted)

Analogy: an order item has no meaning without its order. Take it out of the cart, it should disappear – that is orphan removal.`,
      syntax: `@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItem> items = new ArrayList<>();

order.getItems().remove(item);   // -> delete from order_items where id=?`,
    },
    {
      heading: `Common Mistakes`,
      content: `Avoid these:`,
      points: [
        `CascadeType.ALL on @ManyToOne or @ManyToMany – deletes shared parents/data`,
        `Replacing a collection with setItems(new ArrayList<>()) when orphanRemoval=true -> "A collection with cascade=all-delete-orphan was no longer referenced"; modify the existing collection with clear()/addAll() instead`,
        `Forgetting helper methods for both sides of many-to-many (add to both sets)`,
        `Missing equals()/hashCode() on entities stored in Sets across sessions – base them on a business key or id carefully`,
        `"object references an unsaved transient instance" – you forgot cascade PERSIST or forgot to persist the child`,
      ],
    },
  ],
  examples: [
    {
      title: `Student-Course Many-to-Many`,
      scenario: `Asha takes Java and SQL; Ravi takes SQL and Spring. Then Ravi drops SQL.`,
      steps: [
        `Create package com.demo.m2m with Student and Course entities; register them; hbm2ddl.auto=create`,
        `Create ManyToManyApp and run`,
        `In MySQL run SELECT * FROM student_courses; after each step`,
      ],
      code: `// ===== Course.java =====
@Entity @Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String title;
    @ManyToMany(mappedBy = "courses")
    private Set<Student> students = new LinkedHashSet<>();
    public Course() {}
    public Course(String t) { title = t; }
    public String getTitle() { return title; }
    public Set<Student> getStudents() { return students; }
    @Override public String toString() { return title; }
}

// ===== Student.java =====
@Entity @Table(name = "students_m2m")
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "student_courses",
               joinColumns = @JoinColumn(name = "student_id"),
               inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<Course> courses = new LinkedHashSet<>();

    public Student() {}
    public Student(String n) { name = n; }
    public void addCourse(Course c)    { courses.add(c); c.getStudents().add(this); }
    public void removeCourse(Course c) { courses.remove(c); c.getStudents().remove(this); }
    public Set<Course> getCourses() { return courses; }
    @Override public String toString() { return name; }
}

// ===== ManyToManyApp.java =====
try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Course java = new Course("Java"), sql = new Course("SQL"), spring = new Course("Spring");
    Student asha = new Student("Asha"), ravi = new Student("Ravi");
    asha.addCourse(java); asha.addCourse(sql);
    ravi.addCourse(sql);  ravi.addCourse(spring);
    s.persist(asha);           // cascades PERSIST to java, sql
    s.persist(ravi);           // cascades PERSIST to spring (sql already managed)
    tx.commit();
    System.out.println("SQL students: " + sql.getStudents());

    tx = s.beginTransaction();
    ravi.removeCourse(sql);
    tx.commit();
    System.out.println("Ravi now: " + ravi.getCourses());
}`,
      result: `Hibernate: insert into students_m2m (name) values (?)
Hibernate: insert into courses (title) values (?)
Hibernate: insert into courses (title) values (?)
Hibernate: insert into students_m2m (name) values (?)
Hibernate: insert into courses (title) values (?)
Hibernate: insert into student_courses (student_id,course_id) values (?,?)
Hibernate: insert into student_courses (student_id,course_id) values (?,?)
Hibernate: insert into student_courses (student_id,course_id) values (?,?)
Hibernate: insert into student_courses (student_id,course_id) values (?,?)
SQL students: [Asha, Ravi]
Hibernate: delete from student_courses where student_id=? and course_id=?
Ravi now: [Spring]`,
      explanation: `Cascade PERSIST saved the courses together with each student. Join-table rows are written at flush, only from the owning side (Student.courses). Because the collection is a Set, removing one course deleted exactly one join row.`,
    },
    {
      title: `CascadeType.ALL – Saving and Deleting a Whole Graph`,
      scenario: `Department owns its employees: persisting or removing the department handles the employees automatically.`,
      steps: [
        `Reuse Department/Employee from Day 8 and change the collection to @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)`,
        `Persist only the department; then remove only the department`,
        `Run and watch the SQL order`,
      ],
      code: `// Department.java (changed line)
@OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
private List<Employee> employees = new ArrayList<>();

// CascadeApp.java
Long id;
try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Department hr = new Department("HR");
    hr.addEmployee(new Employee("Priya"));
    hr.addEmployee(new Employee("Ravi"));
    s.persist(hr);                     // only the parent!
    tx.commit();
    id = hr.getId();
}
try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Department hr = s.get(Department.class, id);
    s.remove(hr);                      // only the parent!
    tx.commit();
}`,
      result: `Hibernate: insert into departments (name) values (?)
Hibernate: insert into dept_employees (department_id,name) values (?,?)
Hibernate: insert into dept_employees (department_id,name) values (?,?)
Hibernate: select d1_0.id,d1_0.name from departments d1_0 where d1_0.id=?
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id=?
Hibernate: delete from dept_employees where id=?
Hibernate: delete from dept_employees where id=?
Hibernate: delete from departments where id=?`,
      explanation: `PERSIST cascaded to both employees. On remove, Hibernate loaded the children (to cascade), deleted them first, then deleted the parent – the correct order to avoid FK violations. Without cascade, remove(hr) would fail with a foreign key constraint error.`,
    },
    {
      title: `orphanRemoval = true vs false`,
      scenario: `Remove one employee from a department's list and compare the SQL.`,
      steps: [
        `Add removeEmployee(Employee e) { employees.remove(e); e.setDepartment(null); } to Department`,
        `Run once with orphanRemoval = false (default) and once with orphanRemoval = true`,
        `Check the dept_employees table after each run`,
      ],
      code: `// Department.java
@OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Employee> employees = new ArrayList<>();

public void removeEmployee(Employee e) {
    employees.remove(e);
    e.setDepartment(null);
}

// OrphanApp.java (department id 1 has employees Asha, John)
try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Department d = s.get(Department.class, 1L);
    Employee first = d.getEmployees().get(0);
    d.removeEmployee(first);
    tx.commit();
    System.out.println("Left: " + d.getEmployees());
}`,
      result: `-- orphanRemoval = true
Hibernate: select d1_0.id,d1_0.name from departments d1_0 where d1_0.id=?
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id=?
Hibernate: delete from dept_employees where id=?
Left: [John]

-- orphanRemoval = false
Hibernate: select d1_0.id,d1_0.name from departments d1_0 where d1_0.id=?
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id=?
Hibernate: update dept_employees set department_id=?,name=? where id=?
Left: [John]`,
      explanation: `With orphanRemoval the removed child row is deleted. Without it, the row survives and dirty checking only sets department_id to NULL (because we cleared the owning side). Choose orphanRemoval when a child cannot exist without its parent.`,
    },
    {
      title: `Many-to-Many with Extra Columns – Enrollment Entity`,
      scenario: `Store the grade and enrollment date for each student-course pair.`,
      steps: [
        `Create Enrollment entity with @ManyToOne Student and @ManyToOne Course plus grade and enrolledOn`,
        `Register it and run`,
        `Query: average grade per course with HQL`,
      ],
      code: `@Entity
@Table(name = "enrollments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class Enrollment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    private int grade;
    private LocalDate enrolledOn;

    public Enrollment() {}
    public Enrollment(Student s, Course c, int grade) {
        this.student = s; this.course = c; this.grade = grade;
        this.enrolledOn = LocalDate.of(2025, 6, 1);
    }
}

// main: students and courses already saved with ids 1,2 and 1,2,3
sf.inTransaction(s -> {
    Student asha = s.getReference(Student.class, 1L);
    Student ravi = s.getReference(Student.class, 2L);
    Course java  = s.getReference(Course.class, 1L);
    s.persist(new Enrollment(asha, java, 85));
    s.persist(new Enrollment(ravi, java, 75));
});
try (Session s = sf.openSession()) {
    List<Object[]> rows = s.createQuery(
        "select c.title, avg(e.grade) from Enrollment e join e.course c group by c.title",
        Object[].class).list();
    for (Object[] r : rows) System.out.println(r[0] + " avg grade " + r[1]);
}`,
      result: `Hibernate: insert into enrollments (course_id,enrolledOn,grade,student_id) values (?,?,?,?)
Hibernate: insert into enrollments (course_id,enrolledOn,grade,student_id) values (?,?,?,?)
Hibernate: select c1_0.title,avg(e1_0.grade) from enrollments e1_0 join courses c1_0 on c1_0.id=e1_0.course_id group by c1_0.title
Java avg grade 80.0`,
      explanation: `The link is now a real entity, so it can carry grade and date and be queried directly. getReference() avoided SELECTs on students and courses because only the FKs were needed. avg() returns Double: (85+75)/2 = 80.0.`,
    },
  ],
  interview: [
    { q: `How is many-to-many mapped in Hibernate?`, a: `With @ManyToMany on both sides; one side (owner) declares @JoinTable with joinColumns and inverseJoinColumns; the other uses mappedBy. Hibernate stores pairs of FKs in the join table.`, level: 'Easy' },
    { q: `Why prefer Set over List for @ManyToMany?`, a: `A List without @OrderColumn is a bag; removing one element causes Hibernate to delete all join rows for the owner and re-insert the remaining ones. A Set allows deleting just one row.`, level: 'Hard' },
    { q: `How do you add extra columns to a many-to-many link?`, a: `Replace the @ManyToMany with a join entity (e.g. Enrollment) having two @ManyToOne associations plus the extra fields.`, level: 'Medium' },
    { q: `What are the JPA cascade types?`, a: `PERSIST, MERGE, REMOVE, REFRESH, DETACH and ALL. Hibernate also has its own (e.g. LOCK, REPLICATE in org.hibernate.annotations.CascadeType).`, level: 'Easy' },
    { q: `Difference between CascadeType.REMOVE and orphanRemoval?`, a: `REMOVE deletes children when the parent is deleted. orphanRemoval also deletes a child when it is disassociated from the parent (removed from the collection or reference set to null).`, level: 'Medium' },
    { q: `Why should you avoid CascadeType.REMOVE on @ManyToMany?`, a: `The other side is shared. Removing one student would delete courses still used by other students (or fail with FK errors).`, level: 'Medium' },
    { q: `What does "object references an unsaved transient instance" mean?`, a: `You are saving an entity that references a new (transient) entity which is not persisted. Persist the child first or add CascadeType.PERSIST on the association.`, level: 'Medium' },
    { q: `On which side do you usually put cascade?`, a: `On the parent side (@OneToMany / @OneToOne owner of lifecycle), never on @ManyToOne pointing to a shared parent.`, level: 'Easy' },
    { q: `What is the error "A collection with cascade=all-delete-orphan was no longer referenced"?`, a: `With orphanRemoval, you replaced the collection instance (setItems(new list)). Hibernate tracks the original collection; modify it with clear() and addAll() instead of replacing it.`, level: 'Hard' },
    { q: `In which order does Hibernate delete parent and children with cascade REMOVE?`, a: `It deletes the children first and then the parent, so foreign key constraints are not violated.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Map User and Role as many-to-many (join table user_roles). Create users asha (ADMIN, USER) and ravi (USER). Print the roles of each user.`,
      hint: `Owner = User with @JoinTable; Role with mappedBy = "roles". Cascade PERSIST, MERGE only.`,
      solution: `@Entity @Table(name = "app_users")
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String username;
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new LinkedHashSet<>();
    public AppUser() {}
    public AppUser(String u) { username = u; }
    public void addRole(Role r) { roles.add(r); r.getUsers().add(this); }
    public Set<Role> getRoles() { return roles; }
}

@Entity @Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    @ManyToMany(mappedBy = "roles") private Set<AppUser> users = new LinkedHashSet<>();
    public Role() {}
    public Role(String n) { name = n; }
    public Set<AppUser> getUsers() { return users; }
    public String toString() { return name; }
}

sf.inTransaction(s -> {
    Role admin = new Role("ADMIN"), user = new Role("USER");
    AppUser asha = new AppUser("asha"), ravi = new AppUser("ravi");
    asha.addRole(admin); asha.addRole(user); ravi.addRole(user);
    s.persist(asha); s.persist(ravi);
});
try (Session s = sf.openSession()) {
    System.out.println(s.get(AppUser.class, 1L).getRoles());   // [ADMIN, USER]
    System.out.println(s.get(AppUser.class, 2L).getRoles());   // [USER]
}`,
    },
    {
      task: `Create Order and OrderItem (composition) with cascade ALL + orphanRemoval. Save an order with 3 items, then remove one item and verify it is deleted.`,
      hint: `order.getItems().remove(item) should produce a DELETE.`,
      solution: `@Entity @Table(name = "orders_tbl")
public class PurchaseOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
    public void addItem(OrderItem i) { items.add(i); i.setOrder(this); }
    public void removeItem(OrderItem i) { items.remove(i); i.setOrder(null); }
    public List<OrderItem> getItems() { return items; }
}

@Entity @Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String product; private int qty;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id")
    private PurchaseOrder order;
    public OrderItem() {}
    public OrderItem(String p, int q) { product = p; qty = q; }
    void setOrder(PurchaseOrder o) { order = o; }
}

sf.inTransaction(s -> {
    PurchaseOrder o = new PurchaseOrder();
    o.addItem(new OrderItem("Pen", 2));
    o.addItem(new OrderItem("Book", 1));
    o.addItem(new OrderItem("Bag", 1));
    s.persist(o);                      // 1 order + 3 item inserts
});
sf.inTransaction(s -> {
    PurchaseOrder o = s.get(PurchaseOrder.class, 1L);
    o.removeItem(o.getItems().get(0)); // delete from order_items where id=?
});`,
    },
    {
      task: `Explain what goes wrong with this mapping and fix it: @ManyToOne(cascade = CascadeType.ALL) private Department department; in Employee.`,
      hint: `What happens when you delete one employee?`,
      solution: `Deleting one employee cascades REMOVE to its department, which tries to delete the department that other employees still reference -> FK violation or data loss.
Fix: remove cascade from @ManyToOne:
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "department_id")
private Department department;
Put cascade (if needed) on Department.employees instead.`,
    },
    {
      task: `Write HQL to list every course with the number of students enrolled (including courses with zero students).`,
      hint: `left join c.students s ... group by c.title`,
      solution: `List<Object[]> rows = s.createQuery(
    "select c.title, count(st) from Course c left join c.students st " +
    "group by c.title order by c.title", Object[].class).list();
for (Object[] r : rows) System.out.println(r[0] + " " + r[1]);
// After Ravi dropped SQL:
// Java 1
// SQL 1
// Spring 1`,
    },
  ],
  quiz: [
    { question: `In @JoinTable, inverseJoinColumns refers to the FK of ...`, options: [`The owning entity`, `The other (target) entity`, `The join table's own id`, `The parent table`], answer: 1, explanation: `joinColumns -> owner, inverseJoinColumns -> target.` },
    { question: `Which cascade type is dangerous on @ManyToMany?`, options: [`PERSIST`, `MERGE`, `REFRESH`, `REMOVE`], answer: 3, explanation: `REMOVE would delete shared entities.` },
    { question: `orphanRemoval = true deletes a child when ...`, options: [`It is removed from the parent's collection`, `The child is loaded`, `The parent is updated`, `The session is closed`], answer: 0, explanation: `Disassociated children are treated as orphans and deleted.` },
    { question: `Best way to store a grade for each student-course pair?`, options: [`Add grade to Student`, `Add grade to Course`, `Create an Enrollment entity`, `Use @Transient`], answer: 2, explanation: `A join entity can hold extra columns.` },
    { question: `CascadeType.ALL includes ...`, options: [`Only PERSIST and REMOVE`, `PERSIST, MERGE, REMOVE, REFRESH, DETACH`, `orphanRemoval`, `LAZY fetching`], answer: 1, explanation: `ALL covers all JPA cascade types; orphanRemoval is a separate attribute.` },
  ],
};
