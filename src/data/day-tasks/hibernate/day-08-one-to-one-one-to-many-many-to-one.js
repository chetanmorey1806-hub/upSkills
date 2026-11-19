const COMPANY = `CREATE TABLE departments (
  id   INT PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);
CREATE TABLE employees (
  id      INT PRIMARY KEY,
  name    VARCHAR(50) NOT NULL,
  salary  INT,
  dept_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);
INSERT INTO departments VALUES (1, 'IT'), (2, 'HR'), (3, 'Sales');
INSERT INTO employees VALUES
(101, 'Asha Patil', 65000, 1),
(102, 'Rohan Mehta', 42000, 2),
(103, 'Sneha Kulkarni', 58000, 1),
(104, 'Arjun Nair', 47000, 3);`;

export default {
  lesson: 'day-08-one-to-one-one-to-many-many-to-one',
  minutes: 25,
  intro: 'Map @OneToOne, @ManyToOne and @OneToMany, understand the owning side, mappedBy and @JoinColumn, and read the join SQL.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In a bidirectional Department ↔ Employee mapping, which side is the **owning side**?',
      options: [
        'Department, because it has the List<Employee>',
        'Employee (@ManyToOne), because its table holds the foreign key dept_id',
        'Both sides own it equally',
        'Neither; Hibernate decides at runtime',
      ],
      answer: 1,
      explain: 'The **owning side** is the one whose table contains the foreign key: `employees.dept_id`, i.e. the `@ManyToOne` field in Employee. Only changes on the owning side are written to that column. The `@OneToMany` side is the inverse side and uses `mappedBy`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Employee has the field \`@ManyToOne @JoinColumn(name = "dept_id") private Department department;\`. Complete the inverse side in Department:
\`\`\`
@OneToMany(mappedBy = "____")
private List<Employee> employees = new ArrayList<>();
\`\`\``,
      example: { title: 'one-to-one inverse side', code: '// Passport has: @OneToOne @JoinColumn(name = "person_id") private Person owner;\n@OneToOne(mappedBy = "owner")\nprivate Passport passport;' },
      accept: ['department', '"department"'],
      caseSensitive: true,
      explain: '`mappedBy` names the **Java field** on the other side (`department`), not the column (`dept_id`) and not the class. Forgetting mappedBy makes Hibernate treat it as a separate unidirectional relationship and create an extra join table.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'What are the **default fetch types** in JPA? (choose all CORRECT pairs)',
      options: ['@ManyToOne → EAGER', '@OneToOne → EAGER', '@OneToMany → LAZY', '@ManyToMany → LAZY', '@ManyToOne → LAZY', '@OneToMany → EAGER'],
      answers: [0, 1, 2, 3],
      explain: 'Rule of thumb: "**ToOne** = EAGER, **ToMany** = LAZY" by default. Most teams set `fetch = FetchType.LAZY` on `@ManyToOne`/`@OneToOne` too, and load what they need with JOIN FETCH (Day 10).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Department has this helper method. What does the program print (no database involved)?',
      example: { title: 'keeping both sides in sync', code: 'public void addEmployee(Employee e) {\n    employees.add(e);\n    e.setDepartment(this);\n}' },
      code: `Department it = new Department("IT");
Employee e1 = new Employee("Asha");
Employee e2 = new Employee("Rohan");
it.addEmployee(e1);
it.addEmployee(e2);

Employee e3 = new Employee("Meera");
it.getEmployees().add(e3);      // only one side!

System.out.println(it.getEmployees().size());
System.out.println(e1.getDepartment().getName());
System.out.println(e3.getDepartment());`,
      expected: '3\nIT\nnull',
      explain: 'All three are in the list, but only e1 and e2 had `setDepartment` called. e3\'s department is **null**, and because Employee is the owning side, saving it would store `dept_id = NULL`. Always use helper methods that set both sides.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'When you load employees with their department, Hibernate runs a join. Write it: each employee\'s `name` (as `employee`) and department `name` (as `department`), sorted by employee name.',
      example: { title: 'join on a foreign key', code: 'SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;' },
      setup: COMPANY,
      starter: '-- SELECT ... FROM employees e JOIN departments d ON ...\n',
      solution: 'SELECT e.name AS employee, d.name AS department\nFROM employees e\nJOIN departments d ON e.dept_id = d.id\nORDER BY e.name;',
      ordered: true,
      explain: 'The `@JoinColumn(name = "dept_id")` becomes the join condition `e.dept_id = d.id`. In HQL you would simply write `select e.name, e.department.name from Employee e order by e.name` and Hibernate generates this join.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Both Department and Employee have Lombok/IDE-generated `toString()` that prints all fields, including the other side. What happens when you print a department?',
      options: [
        'It prints normally',
        'Infinite recursion → StackOverflowError (Department prints employees, each employee prints its department...)',
        'Hibernate throws LazyInitializationException every time',
        'Compilation error',
      ],
      answer: 1,
      explain: 'Bidirectional relationships make `toString()`, `equals()`/`hashCode()` and JSON serialization loop forever. Exclude the back-reference (e.g. print only `department.getName()` or `@ToString.Exclude`).',
    },
  ],
};
