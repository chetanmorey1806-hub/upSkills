export default {
  id: 'day-08-one-to-one-one-to-many-many-to-one',
  title: 'Mappings: One-to-One, One-to-Many, Many-to-One',
  module: 'Module 3: Mappings & Performance',
  day: 8,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Map relationships between entities: @OneToOne (Person-Passport), @ManyToOne and @OneToMany (Department-Employee), understand owning vs inverse side, mappedBy, @JoinColumn, unidirectional vs bidirectional, and read the foreign-key DDL and join SQL Hibernate generates.`,
  objectives: [
    `Map @OneToOne with @JoinColumn and make it bidirectional with mappedBy`,
    `Map @ManyToOne / @OneToMany bidirectionally with a foreign key`,
    `Explain the owning side, the inverse side and why mappedBy matters`,
    `Write helper methods that keep both sides of a bidirectional relationship in sync`,
    `Recognise the extra join table created by a unidirectional @OneToMany`,
  ],
  theory: [
    {
      heading: `Relationships in Objects vs Tables`,
      content: `In Java, objects point to each other with references (employee.getDepartment()). In SQL, rows point to each other with FOREIGN KEYS (employees.department_id -> departments.id). Hibernate mapping annotations connect the two.

Four cardinalities:
  One-to-One   : Person  — Passport   (one person has one passport)
  One-to-Many  : Department —< Employees (one department, many employees)
  Many-to-One  : Employee >— Department (many employees, one department) – the same link seen from the other side
  Many-to-Many : Student >—< Course     (Day 9)

Direction:
  Unidirectional – only one class has a reference (Employee knows Department).
  Bidirectional  – both have references (Department also has List<Employee>).`,
    },
    {
      heading: `@OneToOne`,
      content: `One Person has exactly one Passport. Put the foreign key in one table (persons.passport_id) using @JoinColumn. The class with @JoinColumn is the OWNING side.

To navigate back from Passport to Person, add @OneToOne(mappedBy = "passport") in Passport. mappedBy names the FIELD in the owning class; it means "the FK is managed over there, do not create another column here".`,
      syntax: `@Entity class Person {
    @OneToOne
    @JoinColumn(name = "passport_id", unique = true)   // FK column in persons
    private Passport passport;
}

@Entity class Passport {
    @OneToOne(mappedBy = "passport")                   // inverse side, no column
    private Person person;
}`,
      points: [
        `@OneToOne default fetch is EAGER – loaded with a LEFT JOIN`,
        `Alternative: @MapsId to share the same primary key (passport.id = person.id)`,
      ],
    },
    {
      heading: `@ManyToOne and @OneToMany`,
      content: `Many employees belong to one department. The foreign key always lives on the MANY side (employees.department_id). So @ManyToOne is ALWAYS the owning side and carries @JoinColumn. The @OneToMany in Department is the inverse side with mappedBy.

Analogy: in a class register, each student's row writes their class teacher's name (FK on many side). The teacher doesn't keep a column for each student.`,
      syntax: `@Entity class Employee {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;          // OWNING side (has the FK)
}

@Entity class Department {
    @OneToMany(mappedBy = "department")
    private List<Employee> employees = new ArrayList<>();   // INVERSE side

    public void addEmployee(Employee e) {   // helper keeps both sides in sync
        employees.add(e);
        e.setDepartment(this);
    }
}`,
      tip: `Only the owning side is used to write the FK. If you only do department.getEmployees().add(emp) without emp.setDepartment(dept), department_id is saved as NULL. Always use a helper method that sets both sides.`,
    },
    {
      heading: `Owning Side vs Inverse Side`,
      content: `Hibernate needs to know which side controls the foreign key column:
- OWNING side: has @JoinColumn (or no mappedBy). Changes here are written to the DB.
- INVERSE side: has mappedBy. It is a read-only mirror for navigation; changes here alone are ignored when writing.

Rules of thumb:
- In @ManyToOne/@OneToMany the @ManyToOne side owns.
- In @OneToOne the side with the FK column owns.
- mappedBy value = field name on the owning side ("department"), NOT a column name.`,
    },
    {
      heading: `Unidirectional @OneToMany Pitfall`,
      content: `If Department has @OneToMany List<Employee> but Employee has no @ManyToOne and you do not specify mappedBy or @JoinColumn, Hibernate creates a JOIN TABLE (departments_employees) to store the link. That means extra inserts and a table you did not expect.

Fixes:
1. Make it bidirectional with @ManyToOne + mappedBy (recommended), or
2. Add @JoinColumn(name = "department_id") on the @OneToMany to use an FK in the child table.`,
    },
    {
      heading: `Default Fetch Types and toString Trap`,
      content: `Defaults: @OneToOne and @ManyToOne are EAGER; @OneToMany and @ManyToMany are LAZY. Best practice: set fetch = FetchType.LAZY on @ManyToOne/@OneToOne too, and fetch what you need with JOIN FETCH (Day 10).

Trap: if Department.toString() prints employees and Employee.toString() prints department, calling toString() causes infinite recursion -> StackOverflowError. Print only ids/names of related objects. The same issue appears with JSON serialization in Spring Boot.`,
    },
  ],
  examples: [
    {
      title: `One-to-One: Person and Passport (bidirectional)`,
      scenario: `Each person has one passport; FK passport_id lives in persons.`,
      steps: [
        `Create package com.demo.relations with classes Passport and Person (Eclipse: File > New > Class; IntelliJ: New > Java Class)`,
        `Register both with <mapping class> in hibernate.cfg.xml, hbm2ddl.auto=create`,
        `Create OneToOneApp and run`,
      ],
      code: `// ===== Passport.java =====
@Entity
@Table(name = "passports")
public class Passport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String number;

    @OneToOne(mappedBy = "passport")
    private Person person;

    public Passport() {}
    public Passport(String number) { this.number = number; }
    public String getNumber() { return number; }
    public Person getPerson() { return person; }
    void setPerson(Person p) { this.person = p; }
}

// ===== Person.java =====
@Entity
@Table(name = "persons")
public class Person {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @OneToOne
    @JoinColumn(name = "passport_id", unique = true)
    private Passport passport;

    public Person() {}
    public Person(String name) { this.name = name; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public Passport getPassport() { return passport; }
    public void setPassport(Passport p) { this.passport = p; p.setPerson(this); }
}

// ===== OneToOneApp.java =====
Long personId;
try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Passport pp = new Passport("P1234567");
    Person p = new Person("Asha");
    p.setPassport(pp);
    s.persist(pp);            // parent of FK first (no cascade yet - Day 9)
    s.persist(p);
    tx.commit();
    personId = p.getId();
}
try (Session s = sf.openSession()) {
    Person p = s.get(Person.class, personId);
    System.out.println(p.getName() + " has passport " + p.getPassport().getNumber());
}`,
      result: `Hibernate: create table passports (id bigint not null auto_increment, number varchar(255), primary key (id)) engine=InnoDB
Hibernate: create table persons (id bigint not null auto_increment, name varchar(255), passport_id bigint, primary key (id)) engine=InnoDB
Hibernate: alter table persons add constraint UK_... unique (passport_id)
Hibernate: alter table persons add constraint FK_... foreign key (passport_id) references passports (id)
Hibernate: insert into passports (number) values (?)
Hibernate: insert into persons (name,passport_id) values (?,?)
Hibernate: select p1_0.id,p1_0.name,p2_0.id,p2_0.number from persons p1_0 left join passports p2_0 on p2_0.id=p1_0.passport_id where p1_0.id=?
Asha has passport P1234567`,
      explanation: `The FK and a UNIQUE constraint were created on persons.passport_id (unique enforces one-to-one). Because @OneToOne is EAGER, get() loaded the passport in the same SELECT with a LEFT JOIN. Constraint names are generated (shown as ...).`,
    },
    {
      title: `Many-to-One / One-to-Many: Department and Employees`,
      scenario: `Bidirectional mapping with helper method; load a department and then its employees.`,
      steps: [
        `In com.demo.relations create Department and Employee (table dept_employees to avoid clashing with Day 6)`,
        `Register both classes; keep hbm2ddl.auto=create`,
        `Create DeptApp and run; watch when the employee SELECT happens`,
      ],
      code: `// ===== Department.java =====
@Entity
@Table(name = "departments")
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @OneToMany(mappedBy = "department")
    private List<Employee> employees = new ArrayList<>();

    public Department() {}
    public Department(String name) { this.name = name; }
    public void addEmployee(Employee e) { employees.add(e); e.setDepartment(this); }
    public Long getId() { return id; }
    public String getName() { return name; }
    public List<Employee> getEmployees() { return employees; }
}

// ===== Employee.java =====
@Entity
@Table(name = "dept_employees")
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    public Employee() {}
    public Employee(String name) { this.name = name; }
    public String getName() { return name; }
    public Department getDepartment() { return department; }
    void setDepartment(Department d) { this.department = d; }
    @Override public String toString() { return name; }   // no department here!
}

// ===== DeptApp.java =====
Long deptId;
try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Department it = new Department("IT");
    Employee a = new Employee("Asha");
    Employee j = new Employee("John");
    it.addEmployee(a);
    it.addEmployee(j);
    s.persist(it);
    s.persist(a);
    s.persist(j);
    tx.commit();
    deptId = it.getId();
}
try (Session s = sf.openSession()) {
    Department d = s.get(Department.class, deptId);
    System.out.println("Department: " + d.getName());
    System.out.println("Employees: " + d.getEmployees());
}`,
      result: `Hibernate: create table departments (id bigint not null auto_increment, name varchar(255), primary key (id)) engine=InnoDB
Hibernate: create table dept_employees (department_id bigint, id bigint not null auto_increment, name varchar(255), primary key (id)) engine=InnoDB
Hibernate: alter table dept_employees add constraint FK_... foreign key (department_id) references departments (id)
Hibernate: insert into departments (name) values (?)
Hibernate: insert into dept_employees (department_id,name) values (?,?)
Hibernate: insert into dept_employees (department_id,name) values (?,?)
Hibernate: select d1_0.id,d1_0.name from departments d1_0 where d1_0.id=?
Department: IT
Hibernate: select e1_0.department_id,e1_0.id,e1_0.name from dept_employees e1_0 where e1_0.department_id=?
Employees: [Asha, John]`,
      explanation: `The FK department_id is in the many-side table. The employee list is LAZY, so its SELECT ran only when the list was used in println. Because addEmployee() also set e.setDepartment(this), the owning side had the value and department_id was filled.`,
    },
    {
      title: `Proving the Owning Side Matters`,
      scenario: `Add an employee only to the department's list (inverse side) without setting employee.department.`,
      steps: [
        `Add a new Employee "Ravi" with dept.getEmployees().add(ravi) only`,
        `Persist and commit`,
        `Run SELECT * FROM dept_employees in MySQL`,
      ],
      code: `try (Session s = sf.openSession()) {
    Transaction tx = s.beginTransaction();
    Department d = s.get(Department.class, 1L);
    Employee ravi = new Employee("Ravi");
    d.getEmployees().add(ravi);        // ONLY inverse side - WRONG
    s.persist(ravi);
    tx.commit();
}
// MySQL: SELECT id, name, department_id FROM dept_employees;`,
      result: `Hibernate: select d1_0.id,d1_0.name from departments d1_0 where d1_0.id=?
Hibernate: insert into dept_employees (department_id,name) values (?,?)

+----+------+---------------+
| id | name | department_id |
+----+------+---------------+
|  1 | Asha |             1 |
|  2 | John |             1 |
|  3 | Ravi |          NULL |
+----+------+---------------+`,
      explanation: `Hibernate ignores the inverse side (mappedBy) when writing, so nothing in the list affects the FK. (For an inverse List/bag, Hibernate may even queue the add() without loading the collection.) Ravi was saved with department_id NULL. Fix: use d.addEmployee(ravi), which sets ravi.department too.`,
    },
    {
      title: `Unidirectional @OneToMany – Join Table vs @JoinColumn`,
      scenario: `A Teacher with a list of Subjects, where Subject has no back reference.`,
      steps: [
        `Create Teacher with @OneToMany List<Subject> subjects and Subject with only id and title`,
        `Run with hbm2ddl.auto=create and look at the DDL (version A)`,
        `Add @JoinColumn(name = "teacher_id") to the list and run again (version B)`,
      ],
      code: `@Entity @Table(name = "teachers")
public class Teacher {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;

    @OneToMany                                   // version A: no mappedBy, no @JoinColumn
    // @JoinColumn(name = "teacher_id")          // version B: uncomment
    private List<Subject> subjects = new ArrayList<>();
}

@Entity @Table(name = "subjects")
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String title;
}`,
      result: `-- Version A
Hibernate: create table subjects (id bigint not null auto_increment, title varchar(255), primary key (id)) engine=InnoDB
Hibernate: create table teachers (id bigint not null auto_increment, name varchar(255), primary key (id)) engine=InnoDB
Hibernate: create table teachers_subjects (Teacher_id bigint not null, subjects_id bigint not null) engine=InnoDB
Hibernate: alter table teachers_subjects add constraint UK_... unique (subjects_id)

-- Version B
Hibernate: create table subjects (id bigint not null auto_increment, teacher_id bigint, title varchar(255), primary key (id)) engine=InnoDB
Hibernate: create table teachers (id bigint not null auto_increment, name varchar(255), primary key (id)) engine=InnoDB
Hibernate: alter table subjects add constraint FK_... foreign key (teacher_id) references teachers (id)`,
      explanation: `Without mappedBy or @JoinColumn, Hibernate stores the one-to-many link in a join table (the unique constraint on subjects_id keeps it "one"-to-many). With @JoinColumn the FK goes into subjects. Bidirectional with mappedBy is usually the most efficient choice.`,
    },
  ],
  interview: [
    { q: `What is the owning side of a relationship?`, a: `The side that has the foreign key mapping (@JoinColumn / no mappedBy). Hibernate uses only the owning side to write the FK column. In ManyToOne/OneToMany, the @ManyToOne side is the owner.`, level: 'Medium' },
    { q: `What does mappedBy do?`, a: `It marks the inverse side of a bidirectional relationship and names the field on the owning side that maps it. No extra column or join table is created for the inverse side.`, level: 'Medium' },
    { q: `Where is the foreign key stored in a One-to-Many relationship?`, a: `In the table of the "many" side (child), e.g. employees.department_id.`, level: 'Easy' },
    { q: `What are the default fetch types?`, a: `@OneToOne and @ManyToOne: EAGER. @OneToMany and @ManyToMany: LAZY.`, level: 'Easy' },
    { q: `What happens if you use @OneToMany unidirectionally without @JoinColumn?`, a: `Hibernate creates a join table (parent_children) to hold the relation, causing extra tables and inserts.`, level: 'Medium' },
    { q: `Why use helper methods like addEmployee()?`, a: `To keep both sides of a bidirectional association consistent in memory and ensure the owning side is set so the FK is saved correctly.`, level: 'Medium' },
    { q: `What is @JoinColumn?`, a: `It specifies the foreign key column name (and nullable/unique etc.) used for an association on the owning side.`, level: 'Easy' },
    { q: `Why can toString() cause StackOverflowError in bidirectional mappings?`, a: `If both entities print each other, toString() calls recurse infinitely. Exclude the back reference from toString (and from JSON with @JsonIgnore/DTOs).`, level: 'Medium' },
    { q: `How do you map a one-to-one with a shared primary key?`, a: `Use @OneToOne with @MapsId on the child: the child's @Id is also the FK to the parent, so both rows have the same id.`, level: 'Hard' },
    { q: `Unidirectional vs bidirectional – which to choose?`, a: `Use unidirectional @ManyToOne by default (simplest, efficient). Add the @OneToMany(mappedBy) side only when you need to navigate from parent to children.`, level: 'Medium' },
  ],
  practice: [
    {
      task: `Map User and Profile as a one-to-one where Profile shares User's primary key (@MapsId). Save one user with profile.`,
      hint: `Profile: @Id Long id; @OneToOne @MapsId @JoinColumn(name="user_id") User user;`,
      solution: `@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String username;
    public User() {}
    public User(String u) { username = u; }
}

@Entity @Table(name = "profiles")
public class Profile {
    @Id private Long id;                 // same value as user id
    private String bio;
    @OneToOne @MapsId @JoinColumn(name = "user_id")
    private User user;
    public Profile() {}
    public Profile(User u, String bio) { this.user = u; this.bio = bio; }
}

sf.inTransaction(s -> {
    User u = new User("asha");
    s.persist(u);
    s.persist(new Profile(u, "Java developer"));
});
// insert into users (username) values (?)
// insert into profiles (bio,user_id) values (?,?)    -- user_id is also the PK`,
    },
    {
      task: `Map Customer (1) -> Orders (many) bidirectionally with helper methods addOrder/removeOrder. Save a customer with 3 orders and print order count.`,
      hint: `Order table name customer_orders; FK customer_id.`,
      solution: `@Entity @Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    @OneToMany(mappedBy = "customer")
    private List<CustomerOrder> orders = new ArrayList<>();
    public Customer() {}
    public Customer(String n) { name = n; }
    public void addOrder(CustomerOrder o) { orders.add(o); o.setCustomer(this); }
    public void removeOrder(CustomerOrder o) { orders.remove(o); o.setCustomer(null); }
    public List<CustomerOrder> getOrders() { return orders; }
}

@Entity @Table(name = "customer_orders")
public class CustomerOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private double amount;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id")
    private Customer customer;
    public CustomerOrder() {}
    public CustomerOrder(double a) { amount = a; }
    void setCustomer(Customer c) { customer = c; }
}

// main
sf.inTransaction(s -> {
    Customer c = new Customer("Ravi");
    CustomerOrder o1 = new CustomerOrder(500), o2 = new CustomerOrder(250), o3 = new CustomerOrder(900);
    c.addOrder(o1); c.addOrder(o2); c.addOrder(o3);
    s.persist(c); s.persist(o1); s.persist(o2); s.persist(o3);
});
try (Session s = sf.openSession()) {
    System.out.println(s.get(Customer.class, 1L).getOrders().size());   // 3
}`,
    },
    {
      task: `Write HQL to list "employee name - department name" for all employees using a join.`,
      hint: `select e.name, d.name from Employee e join e.department d`,
      solution: `List<Object[]> rows = s.createQuery(
    "select e.name, d.name from Employee e join e.department d order by e.name", Object[].class).list();
for (Object[] r : rows) System.out.println(r[0] + " - " + r[1]);
// SQL: select e1_0.name,d1_0.name from dept_employees e1_0 join departments d1_0 on d1_0.id=e1_0.department_id order by e1_0.name
// Asha - IT
// John - IT`,
    },
    {
      task: `Find and fix the bug: @OneToMany(mappedBy = "department_id") private List<Employee> employees;`,
      hint: `mappedBy refers to a field name, not a column.`,
      solution: `mappedBy must be the name of the field in Employee, i.e. "department":
@OneToMany(mappedBy = "department")
private List<Employee> employees = new ArrayList<>();
With "department_id" Hibernate fails at startup: AnnotationException: Collection 'Department.employees' is 'mappedBy' a property named 'department_id' which does not exist in the target entity.`,
    },
  ],
  quiz: [
    { question: `In a Department-Employee relationship, where is the FK column?`, options: [`departments table`, `employees table`, `a join table always`, `Both tables`], answer: 1, explanation: `The many side holds the FK.` },
    { question: `Which side should have mappedBy?`, options: [`The inverse (non-owning) side`, `The owning side`, `Both sides`, `Neither`], answer: 0, explanation: `mappedBy marks the inverse side.` },
    { question: `Default fetch type of @ManyToOne is ...`, options: [`LAZY`, `NONE`, `SUBSELECT`, `EAGER`], answer: 3, explanation: `To-one associations default to EAGER; set LAZY explicitly.` },
    { question: `A unidirectional @OneToMany without @JoinColumn creates ...`, options: [`No table`, `An FK in the parent`, `A join table`, `An error`], answer: 2, explanation: `Hibernate uses a join table by default.` },
    { question: `Adding a child only to parent.getChildren() (inverse side) results in ...`, options: [`FK saved correctly`, `FK saved as NULL`, `Exception at compile time`, `Parent deleted`], answer: 1, explanation: `Only the owning side writes the FK.` },
  ],
};
