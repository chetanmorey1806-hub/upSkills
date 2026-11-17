export default {
  id: 'day-15-jpa-relationships-infinite-recursion',
  title: 'JPA Relationships in Spring Boot, Avoiding Infinite Recursion (DTO / @JsonIgnore)',
  module: 'Module 3: Data Access',
  day: 15,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Map One-to-One, One-to-Many/Many-to-One and Many-to-Many relationships with JPA in Spring Boot, and solve the classic infinite JSON recursion (StackOverflowError) using @JsonIgnore, @JsonManagedReference/@JsonBackReference and DTOs.',
  objectives: [
    'Map @OneToOne, @OneToMany, @ManyToOne and @ManyToMany with the correct owning side',
    'Understand mappedBy, @JoinColumn, @JoinTable, cascade and orphanRemoval',
    'Explain why bidirectional relationships cause infinite recursion in JSON',
    'Fix recursion with @JsonIgnore, @JsonManagedReference/@JsonBackReference and DTOs',
    'Avoid LazyInitializationException and N+1 with fetch joins / @EntityGraph',
  ],
  theory: [
    {
      heading: '1. Relationship Types with Real-World Examples',
      content: 'Tables are linked by foreign keys. JPA lets you link objects instead. Real-world mapping: one Person has one Passport (One-to-One); one Department has many Employees (One-to-Many) and each Employee belongs to one Department (Many-to-One); a Student joins many Courses and a Course has many Students (Many-to-Many).',
      points: [
        '@OneToOne → user ↔ profile (foreign key in one table)',
        '@ManyToOne → employee.department_id (the "many" side holds the foreign key)',
        '@OneToMany(mappedBy) → department.employees (inverse side, no column)',
        '@ManyToMany → join table student_course(student_id, course_id)',
      ],
    },
    {
      heading: '2. Owning Side vs Inverse Side (mappedBy)',
      content: 'In a bidirectional relationship only ONE side controls the foreign key — the owning side. The other side says mappedBy = "fieldNameOnOwner". Analogy: in a class register only the teacher writes attendance (owner); students can look at it (inverse) but their changes are not saved to the register.',
      syntax: `@Entity
class Department {
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Employee> employees = new ArrayList<>();
}

@Entity
class Employee {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")   // FK column lives here = owning side
    private Department department;
}`,
      tip: 'Always set BOTH sides in Java with a helper method: dept.addEmployee(e) { employees.add(e); e.setDepartment(this); }. If you only add to the list, the FK stays null.',
    },
    {
      heading: '3. Cascade, orphanRemoval and Fetch Type',
      content: 'Cascade means "when I save/delete the parent, do the same to its children". orphanRemoval deletes a child row when it is removed from the parent collection. Fetch type decides WHEN related data is loaded.',
      points: [
        'CascadeType.PERSIST, MERGE, REMOVE, REFRESH, DETACH, ALL',
        'Default fetch: @ManyToOne and @OneToOne = EAGER; @OneToMany and @ManyToMany = LAZY',
        'Best practice: make @ManyToOne LAZY too and load data explicitly with JOIN FETCH or @EntityGraph',
        'Never use CascadeType.REMOVE on @ManyToMany — deleting one student would delete shared courses',
      ],
    },
    {
      heading: '4. The Infinite Recursion Problem',
      content: 'Jackson converts objects to JSON by calling every getter. Department → getEmployees() → each Employee → getDepartment() → Department → getEmployees() → ... forever. Result: StackOverflowError or "Could not write JSON: Infinite recursion". Diagram in words: Department ⇄ Employee is a circle, and Jackson keeps walking around it.',
      points: [
        'Fix 1: @JsonIgnore on one side — that field is simply not written',
        'Fix 2: @JsonManagedReference (parent, written) + @JsonBackReference (child, skipped)',
        'Fix 3: @JsonIgnoreProperties("employees") on the child field — skip only the back link',
        'Fix 4 (BEST): return DTOs, never entities. You decide exactly what goes into JSON',
      ],
    },
    {
      heading: '5. Why DTOs Are the Professional Fix',
      content: 'Entities model the database; DTOs model the API. Returning entities leaks internal fields (passwords, audit columns), triggers lazy loading outside transactions (LazyInitializationException) and causes recursion. A DTO is a flat, purpose-built object (a Java record is perfect).',
      syntax: `public record EmployeeDto(Long id, String name, String departmentName) {}
public record DepartmentDto(Long id, String name, List<EmployeeDto> employees) {}`,
    },
    {
      heading: '6. N+1 Problem and Fetch Join',
      content: 'Loading 10 departments and then calling getEmployees() on each runs 1 + 10 queries — the N+1 problem. Solve it with JOIN FETCH in JPQL or @EntityGraph so everything is loaded in one query.',
      syntax: `@Query("SELECT DISTINCT d FROM Department d LEFT JOIN FETCH d.employees")
List<Department> findAllWithEmployees();

@EntityGraph(attributePaths = "employees")
List<Department> findByNameContaining(String name);`,
      tip: 'spring.jpa.open-in-view is true by default in Spring Boot and hides lazy-loading problems (with a startup warning). Many teams set it to false and fetch what they need in the service layer.',
    },
  ],
  examples: [
    {
      title: 'Example 1: Department – Employee (One-to-Many / Many-to-One) and the Recursion Bug',
      scenario: 'An HR API returns departments with their employees. The first version crashes with infinite recursion; we fix it with @JsonManagedReference/@JsonBackReference.',
      steps: [
        'IntelliJ: New Project > Spring Boot > add Spring Web, Spring Data JPA, H2 Database (or MySQL Driver) > Create',
        'STS: File > New > Spring Starter Project > hr-api > add the same starters > Finish',
        'Create entity package with Department.java and Employee.java',
        'Create DepartmentRepository and DepartmentController',
        'Run the app and call POST /api/departments then GET /api/departments',
        'First try WITHOUT the Json annotations to see the error in the console, then add them',
      ],
      code: `// ===== application.properties =====
spring.datasource.url=jdbc:h2:mem:hrdb
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

// ===== entity/Department.java =====
package com.company.hr.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference          // this side IS serialized
    private List<Employee> employees = new ArrayList<>();

    public void addEmployee(Employee e) {   // keeps both sides in sync
        employees.add(e);
        e.setDepartment(this);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<Employee> getEmployees() { return employees; }
}

// ===== entity/Employee.java =====
package com.company.hr.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double salary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @JsonBackReference             // this side is NOT serialized
    private Department department;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
}

// ===== repository/DepartmentRepository.java =====
package com.company.hr.repository;

import com.company.hr.entity.Department;
import org.springframework.data.jpa.repository.*;
import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    @Query("SELECT DISTINCT d FROM Department d LEFT JOIN FETCH d.employees")
    List<Department> findAllWithEmployees();
}

// ===== controller/DepartmentController.java =====
package com.company.hr.controller;

import com.company.hr.entity.*;
import com.company.hr.repository.DepartmentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    private final DepartmentRepository repo;
    public DepartmentController(DepartmentRepository repo) { this.repo = repo; }

    @PostMapping
    public Department create(@RequestBody Department body) {
        Department d = new Department();
        d.setName(body.getName());
        for (Employee e : body.getEmployees()) {
            d.addEmployee(e);          // sets employee.department
        }
        return repo.save(d);          // cascade ALL saves employees too
    }

    @GetMapping
    public List<Department> all() { return repo.findAllWithEmployees(); }
}`,
      result: `POST /api/departments
Body: {"name":"IT","employees":[{"name":"Asha","salary":60000},{"name":"Ravi","salary":55000}]}

Without @JsonManagedReference/@JsonBackReference:
  HttpMessageNotWritableException: Could not write JSON: Infinite recursion (StackOverflowError)

With the annotations:
{"id":1,"name":"IT","employees":[{"id":1,"name":"Asha","salary":60000.0},{"id":2,"name":"Ravi","salary":55000.0}]}`,
      explanation: 'cascade = ALL saved both employees when we saved the department. addEmployee() set the owning side (employee.department) so department_id is filled. @JsonBackReference stops Jackson from walking back to the department, breaking the loop. JOIN FETCH loads departments and employees in one query, avoiding N+1.',
    },
    {
      title: 'Example 2: The DTO Approach (Recommended)',
      scenario: 'The API must show each employee with its department name, and each department with employee count — without exposing entities.',
      steps: [
        'Remove the Jackson annotations from the entities (entities stay clean)',
        'Create records EmployeeDto and DepartmentDto in package dto',
        'Create DepartmentService with @Transactional(readOnly = true) that maps entities to DTOs',
        'Return DTOs from the controller',
        'Set spring.jpa.open-in-view=false to make sure all lazy loading happens inside the service',
      ],
      code: `// ===== dto/EmployeeDto.java =====
package com.company.hr.dto;
public record EmployeeDto(Long id, String name, double salary, String departmentName) {}

// ===== dto/DepartmentDto.java =====
package com.company.hr.dto;
import java.util.List;
public record DepartmentDto(Long id, String name, int employeeCount, List<EmployeeDto> employees) {}

// ===== repository/EmployeeRepository.java =====
package com.company.hr.repository;

import com.company.hr.entity.Employee;
import org.springframework.data.jpa.repository.*;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    @EntityGraph(attributePaths = "department")    // one query with join
    List<Employee> findAllByOrderByNameAsc();
}

// ===== service/DepartmentService.java =====
package com.company.hr.service;

import com.company.hr.dto.*;
import com.company.hr.entity.*;
import com.company.hr.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DepartmentService {
    private final DepartmentRepository deptRepo;
    private final EmployeeRepository empRepo;

    public DepartmentService(DepartmentRepository d, EmployeeRepository e) {
        this.deptRepo = d; this.empRepo = e;
    }

    public List<DepartmentDto> departments() {
        return deptRepo.findAllWithEmployees().stream()
                .map(this::toDto)
                .toList();
    }

    public List<EmployeeDto> employees() {
        return empRepo.findAllByOrderByNameAsc().stream()
                .map(e -> new EmployeeDto(e.getId(), e.getName(), e.getSalary(),
                        e.getDepartment() == null ? null : e.getDepartment().getName()))
                .toList();
    }

    private DepartmentDto toDto(Department d) {
        List<EmployeeDto> emps = d.getEmployees().stream()
                .map(e -> new EmployeeDto(e.getId(), e.getName(), e.getSalary(), d.getName()))
                .toList();
        return new DepartmentDto(d.getId(), d.getName(), emps.size(), emps);
    }
}

// ===== controller/HrController.java =====
@RestController
@RequestMapping("/api/hr")
public class HrController {
    private final DepartmentService service;
    public HrController(DepartmentService service) { this.service = service; }

    @GetMapping("/departments") public List<DepartmentDto> depts() { return service.departments(); }
    @GetMapping("/employees")   public List<EmployeeDto> emps()   { return service.employees(); }
}

// ===== application.properties (add) =====
spring.jpa.open-in-view=false`,
      result: `GET /api/hr/employees
[{"id":1,"name":"Asha","salary":60000.0,"departmentName":"IT"},
 {"id":2,"name":"Ravi","salary":55000.0,"departmentName":"IT"}]

GET /api/hr/departments
[{"id":1,"name":"IT","employeeCount":2,"employees":[...same two employees...]}]

Console: a single select with "left join department" for employees (no N+1).`,
      explanation: 'DTOs are plain data with no back-references, so recursion is impossible. The service is @Transactional so lazy collections are loaded safely. @EntityGraph joins the department in the same query. The JSON shape is now controlled by the API, not by the database model.',
    },
    {
      title: 'Example 3: Many-to-Many (Student – Course) and One-to-One (User – Profile)',
      scenario: 'A training institute enrolls students into courses, and each user has exactly one profile.',
      steps: [
        'Create Student and Course entities with @ManyToMany and @JoinTable',
        'Create User and Profile entities with @OneToOne',
        'Use Set (not List) for many-to-many to avoid duplicate rows and Hibernate bag issues',
        'Write POST /api/students/{sid}/courses/{cid} to enroll',
        'Open H2 console (http://localhost:8080/h2-console, JDBC URL jdbc:h2:mem:hrdb) and run SELECT * FROM STUDENT_COURSE',
      ],
      code: `// ===== entity/Student.java =====
@Entity
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @ManyToMany
    @JoinTable(name = "student_course",
               joinColumns = @JoinColumn(name = "student_id"),
               inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<Course> courses = new HashSet<>();

    public void enroll(Course c) { courses.add(c); c.getStudents().add(this); }
    // getters/setters
}

// ===== entity/Course.java =====
@Entity
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @ManyToMany(mappedBy = "courses")
    @JsonIgnore                       // never serialize the back link
    private Set<Student> students = new HashSet<>();
    // getters/setters
}

// ===== entity/User.java + Profile.java (One-to-One) =====
@Entity
@Table(name = "app_user")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "profile_id")   // FK in app_user table
    private Profile profile;
}

@Entity
public class Profile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String phone;
    private String city;
}

// ===== controller/EnrollmentController.java =====
@RestController
@RequestMapping("/api/students")
public class EnrollmentController {
    private final StudentRepository students;
    private final CourseRepository courses;

    public EnrollmentController(StudentRepository s, CourseRepository c) {
        this.students = s; this.courses = c;
    }

    @PostMapping("/{sid}/courses/{cid}")
    @Transactional
    public Map<String, Object> enroll(@PathVariable Long sid, @PathVariable Long cid) {
        Student s = students.findById(sid).orElseThrow();
        Course c = courses.findById(cid).orElseThrow();
        s.enroll(c);
        return Map.of("student", s.getName(), "courses",
                s.getCourses().stream().map(Course::getTitle).sorted().toList());
    }
}`,
      result: `POST /api/students/1/courses/1   -> {"student":"Meena","courses":["Core Java"]}
POST /api/students/1/courses/2   -> {"student":"Meena","courses":["Core Java","Spring Boot"]}

H2 console: SELECT * FROM STUDENT_COURSE
STUDENT_ID | COURSE_ID
1          | 1
1          | 2`,
      explanation: 'Student is the owning side (it has @JoinTable), so adding a course to student.courses inserts a row into student_course. Course.students uses mappedBy and @JsonIgnore so no recursion happens. @Transactional on the method means the changes are flushed automatically when it returns (dirty checking). Sorting the titles gives a stable output because Set order is not guaranteed.',
    },
  ],
  interview: [
    { q: 'What is the owning side of a relationship?', a: 'The side that contains the foreign key column (@JoinColumn / @JoinTable). Only changes on the owning side are written to the database. The inverse side uses mappedBy.', level: 'Medium' },
    { q: 'Why does a bidirectional relationship cause infinite recursion in JSON?', a: 'Jackson serializes parent → children → each child\'s parent → children again in a loop until StackOverflowError. Break the cycle with @JsonIgnore, @JsonManagedReference/@JsonBackReference, @JsonIgnoreProperties or (best) DTOs.', level: 'Easy' },
    { q: 'Difference between @JsonIgnore and @JsonBackReference?', a: '@JsonIgnore skips a property for both serialization and deserialization. @JsonBackReference works as a pair with @JsonManagedReference: the back side is skipped on output, and Jackson can restore the link when deserializing.', level: 'Medium' },
    { q: 'What are the default fetch types?', a: '@OneToOne and @ManyToOne default to EAGER; @OneToMany and @ManyToMany default to LAZY.', level: 'Easy' },
    { q: 'What is LazyInitializationException?', a: 'It occurs when you access a lazy association after the Hibernate session/persistence context is closed. Fix by loading data inside a @Transactional service with JOIN FETCH/@EntityGraph and mapping to DTOs.', level: 'Medium' },
    { q: 'What is the N+1 select problem?', a: 'One query loads N parents, then N extra queries load each parent\'s children. Fix with JOIN FETCH, @EntityGraph, or batch fetching (hibernate.default_batch_fetch_size).', level: 'Hard' },
    { q: 'What does orphanRemoval = true do?', a: 'When a child is removed from the parent\'s collection (or the reference is set to null in one-to-one), Hibernate deletes the child row automatically.', level: 'Medium' },
    { q: 'Why use Set instead of List for @ManyToMany?', a: 'Hibernate treats a List without an order column as a bag; removing one element deletes and re-inserts all join rows, and multiple bag fetches throw MultipleBagFetchException. Set avoids these problems.', level: 'Hard' },
    { q: 'Why should REST APIs return DTOs instead of entities?', a: 'DTOs avoid recursion and lazy loading issues, hide internal/sensitive fields, decouple API from DB schema and allow different views for different endpoints.', level: 'Easy' },
    { q: 'What is spring.jpa.open-in-view?', a: 'A Spring Boot setting (default true) that keeps the EntityManager open until the view/JSON is rendered, allowing lazy loading in controllers. It can hide N+1 issues and hold DB connections longer; many teams disable it.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create Author (1) – Book (many) entities with a bidirectional mapping and an addBook helper method.',
      hint: 'Book has @ManyToOne @JoinColumn(name = "author_id"); Author has @OneToMany(mappedBy = "author").',
      solution: `@Entity
public class Author {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Book> books = new ArrayList<>();
    public void addBook(Book b) { books.add(b); b.setAuthor(this); }
    public void removeBook(Book b) { books.remove(b); b.setAuthor(null); }
    // getters/setters
}

@Entity
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String title;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;
    // getters/setters
}`,
    },
    {
      task: 'Return authors with their book titles as DTOs: AuthorDto(Long id, String name, List<String> books).',
      hint: 'Use a JOIN FETCH query and map in a @Transactional(readOnly = true) service.',
      solution: `public record AuthorDto(Long id, String name, List<String> books) {}

@Query("SELECT DISTINCT a FROM Author a LEFT JOIN FETCH a.books")
List<Author> findAllWithBooks();

@Transactional(readOnly = true)
public List<AuthorDto> authors() {
    return repo.findAllWithBooks().stream()
        .map(a -> new AuthorDto(a.getId(), a.getName(),
                a.getBooks().stream().map(Book::getTitle).toList()))
        .toList();
}`,
    },
    {
      task: 'Fix the recursion in Author/Book using @JsonIgnoreProperties instead of DTOs.',
      hint: 'Put @JsonIgnoreProperties("books") on Book.author.',
      solution: `@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "author_id")
@JsonIgnoreProperties({"books", "hibernateLazyInitializer", "handler"})
private Author author;`,
    },
    {
      task: 'Model Order – Product as Many-to-Many with a join table order_items and an endpoint to add a product to an order.',
      hint: '@JoinTable on Order side; use Set<Product>.',
      solution: `@Entity @Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToMany
    @JoinTable(name = "order_items",
        joinColumns = @JoinColumn(name = "order_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id"))
    private Set<Product> products = new HashSet<>();
    public Set<Product> getProducts() { return products; }
}

@PostMapping("/api/orders/{oid}/products/{pid}")
@Transactional
public Map<String, Integer> add(@PathVariable Long oid, @PathVariable Long pid) {
    Order o = orderRepo.findById(oid).orElseThrow();
    o.getProducts().add(productRepo.findById(pid).orElseThrow());
    return Map.of("items", o.getProducts().size());
}`,
    },
  ],
  quiz: [
    { question: 'Which side holds the foreign key in Department–Employee?', options: ['Department', 'Both', 'Employee (@ManyToOne)', 'A join table'], answer: 2, explanation: 'The "many" side has the FK column department_id.' },
    { question: 'mappedBy is used on the:', options: ['Inverse side', 'Owning side', 'Join table', 'Repository'], answer: 0, explanation: 'mappedBy points to the field on the owning side.' },
    { question: 'Best way to avoid JSON recursion in a REST API?', options: ['Increase stack size', 'Use EAGER fetch', 'Disable Jackson', 'Return DTOs'], answer: 3, explanation: 'DTOs give full control and no cycles.' },
    { question: 'Default fetch type of @OneToMany?', options: ['EAGER', 'LAZY', 'JOIN', 'SUBSELECT'], answer: 1, explanation: 'Collections are LAZY by default.' },
    { question: 'Which fixes N+1 queries?', options: ['@Transactional only', 'CascadeType.ALL', 'JOIN FETCH / @EntityGraph', 'orphanRemoval'], answer: 2, explanation: 'Fetch joins load associations in one query.' },
  ],
};
