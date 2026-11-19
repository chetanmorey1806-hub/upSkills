const DB = `CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
INSERT INTO departments VALUES (1, 'IT'), (2, 'HR'), (3, 'Sales');
INSERT INTO employees VALUES
(1, 'Asha', 1), (2, 'Ravi', 1), (3, 'Meera', 2), (4, 'Kiran', 1), (5, 'Arjun', 2);`;

export default {
  lesson: 'day-15-jpa-relationships-infinite-recursion',
  minutes: 26,
  intro: 'Map JPA relationships (owning vs inverse side), avoid infinite JSON recursion and spot the N+1 query problem.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Many employees belong to one department. The `employees` table has the `department_id` foreign key. Which side is the **owning side** of the relationship?',
      options: [
        'Department, with @OneToMany(mappedBy = "department")',
        'Employee, with @ManyToOne and @JoinColumn(name = "department_id")',
        'Both sides own it equally',
        'Neither: JPA needs a join table',
      ],
      answer: 1,
      explain: 'The owning side is the entity whose table holds the **foreign key** - here `Employee` with `@ManyToOne` + `@JoinColumn`. The `@OneToMany` side only mirrors it with `mappedBy`. Changing only the inverse list does not update the FK column.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In `Employee` the field is `private Department department;`. Complete the annotation on the inverse side in `Department`:\n```\n???\nprivate List<Employee> employees = new ArrayList<>();\n```',
      example: { title: 'one-to-one inverse side', code: '@OneToOne(mappedBy = "student")\nprivate Profile profile;' },
      accept: ['@OneToMany(mappedBy = "department")', '@OneToMany(mappedBy = "department", cascade = CascadeType.ALL)', '@OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)'],
      explain: '`mappedBy` names the **field in the other entity** (`department`), not the column. Without `mappedBy`, Hibernate thinks there are two separate relationships and creates an extra join table `department_employees`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The controller returns a `Department` entity whose `employees` each have a `department` field. Calling the endpoint gives a huge response and then `StackOverflowError`. Why?',
      options: [
        'MySQL ran out of memory',
        'Jackson serialises department → employees → department → employees ... forever because the bidirectional references point at each other',
        'The @Id is missing',
        'Lazy loading is disabled',
      ],
      answer: 1,
      explain: 'Bidirectional relations form a **cycle**. Jackson follows every getter, so it never stops. Fix it by breaking the cycle on one side or, best, by returning DTOs that contain only what the client needs.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these fix the infinite recursion? (choose all that apply)',
      options: [
        '@JsonIgnore on Employee.department',
        '@JsonManagedReference on Department.employees and @JsonBackReference on Employee.department',
        'Returning DepartmentDto / EmployeeDto instead of entities',
        'Adding @Transactional to the controller',
        '@JsonIgnoreProperties("department") on the employees list',
      ],
      answers: [0, 1, 2, 4],
      explain: '`@JsonIgnore`, the managed/back reference pair and `@JsonIgnoreProperties` all stop Jackson at one side of the cycle. **DTOs** are the professional fix because they also hide internal fields and lazy-loading issues. `@Transactional` has nothing to do with JSON.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`employees` is LAZY. There are 5 departments. How many SQL SELECT statements does this code run (with no fetch join)?',
      example: { title: 'lazy collections', text: 'A LAZY collection is loaded with its own SELECT the first time you touch it (e.g. size()).' },
      code: `List<Department> list = departmentRepo.findAll();
for (Department d : list) {
    System.out.println(d.getName() + ": " + d.getEmployees().size());
}`,
      expected: '6',
      explain: 'This is the **N+1 problem**: 1 query for the departments + 1 query per department for its employees = 1 + 5 = **6**. With `@Query("SELECT d FROM Department d LEFT JOIN FETCH d.employees")` or `@EntityGraph` it becomes 1 query.',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 5,
      q: 'A JOIN FETCH loads departments and their employees in **one** query. Write that query in SQL: show `department` (department name) and `employee` (employee name) for **every** department, including departments with no employees. Order by department name, then employee name.',
      example: { title: 'LEFT JOIN keeps unmatched rows', code: 'SELECT c.title, s.name\nFROM courses c\nLEFT JOIN students s ON s.course_id = c.id;' },
      setup: DB,
      starter: '-- SELECT d.name AS department, e.name AS employee FROM ...\n',
      solution: 'SELECT d.name AS department, e.name AS employee\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.id\nORDER BY d.name, e.name;',
      ordered: true,
      explain: '`LEFT JOIN FETCH d.employees` in JPQL becomes a SQL `LEFT JOIN` on the foreign key, so one query brings everything. LEFT keeps Sales (no employees) with a NULL employee. An INNER JOIN would silently drop Sales.',
    },
  ],
};
