export default {
  id: 'day-08-crud-rest-api-postman',
  title: 'Building a CRUD REST API and Testing with Postman',
  module: 'Module 2: REST APIs',
  day: 8,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Build a complete Student CRUD REST API with model, repository, service and controller layers (in-memory storage today, database on Day 12), and test every endpoint in Postman using collections, environments, variables and automated test scripts.',
  objectives: [
    'Build a full CRUD API: create, read all, read one, update, partial update, delete, search',
    'Split code into model, repository, service and controller layers',
    'Return correct status codes for success and not-found cases',
    'Organise Postman requests into a collection with an environment and variables',
    'Write Postman test scripts that check status codes and JSON values, and run the whole collection',
  ],
  theory: [
    {
      heading: 'What is CRUD and How It Maps to REST',
      content:
        'CRUD = Create, Read, Update, Delete - the four basic operations on data. Almost every business app (students, products, employees, orders) is a set of CRUD APIs plus business rules.\n\nCreate  -> POST   /api/students           -> 201 Created + Location\nRead    -> GET    /api/students           -> 200 list\nRead    -> GET    /api/students/{id}      -> 200 or 404\nUpdate  -> PUT    /api/students/{id}      -> 200 or 404 (full replace)\nUpdate  -> PATCH  /api/students/{id}      -> 200 or 404 (partial)\nDelete  -> DELETE /api/students/{id}      -> 204 or 404\nSearch  -> GET    /api/students/search?course=Java -> 200 list',
    },
    {
      heading: 'Layered Design (Preview of Day 11)',
      content:
        'We split the code by responsibility:\n\nPostman --HTTP--> Controller --> Service --> Repository --> Storage (Map today, MySQL on Day 12)\n\n- Controller: HTTP only - URLs, request/response, status codes. No business logic.\n- Service: business rules (e.g. email must be unique, name trimmed), throws exceptions like StudentNotFoundException.\n- Repository: saves and loads data. Today a ConcurrentHashMap, later Spring Data JPA.\n- Model: the Student data class.\n\nAnalogy: a restaurant. Waiter (controller) takes the order, chef (service) cooks following recipes, store-room keeper (repository) brings ingredients. The waiter never goes into the store-room.',
      points: [
        'Program to interfaces: StudentService interface + StudentServiceImpl',
        'ConcurrentHashMap + AtomicLong are thread-safe; Tomcat serves requests on many threads',
        'Because the repository is behind an interface-like class, replacing it with JPA on Day 12 does not change the controller',
      ],
    },
    {
      heading: 'Handling "Not Found" Cleanly',
      content:
        'Instead of checking null in every controller method, the service throws a custom exception annotated with @ResponseStatus(HttpStatus.NOT_FOUND). Spring converts it into a 404 response automatically. On Day 10 we will replace this with a global @RestControllerAdvice that returns a nice JSON error body.',
      syntax: '@ResponseStatus(HttpStatus.NOT_FOUND)\npublic class StudentNotFoundException extends RuntimeException {\n    public StudentNotFoundException(Long id) { super("Student not found with id " + id); }\n}',
      tip: 'Add server.error.include-message=always to application.properties so the exception message appears in the default error JSON.',
    },
    {
      heading: 'Postman Essentials',
      content:
        'Postman is a GUI tool for calling APIs.\n- Collection: a folder of saved requests (e.g. "Student API"). Right-click > Run collection to run all.\n- Environment: a set of variables (baseUrl = http://localhost:8080) you can switch between local/dev/prod.\n- Variables: {{baseUrl}}, {{studentId}}. Set from scripts: pm.collectionVariables.set("studentId", id).\n- Body: raw + JSON for REST APIs. Postman adds Content-Type: application/json.\n- Tests tab (named "Scripts > Post-response" in newer versions): JavaScript that runs after the response, e.g. pm.test("Status 201", () => pm.response.to.have.status(201)).\n- Export: Collection > ... > Export > v2.1 JSON to share with your team or commit to Git.',
      points: [
        'Alternatives: curl (command line), IntelliJ HTTP Client (.http files, Ultimate), Thunder Client in VS Code, Swagger UI (Day 21)',
        'Common mistake: forgetting to Save the request - Ctrl+S',
        'Common mistake: sending to https://localhost:8080 - use http unless you configured SSL',
      ],
    },
  ],
  examples: [
    {
      title: 'Complete Student CRUD API (all layers)',
      scenario: 'Build the student-api with model, repository, service (interface + implementation), custom exception and controller. Data is kept in memory.',
      steps: [
        'Generate project at start.spring.io: Maven, Spring Boot 3.3.x, Java 17, Group com.example, Artifact student-api, dependencies: Spring Web, DevTools',
        'Open in IntelliJ (File > Open > folder > Trust) or STS (File > Import > Existing Maven Projects)',
        'Create packages: model, repository, service, exception, controller under com.example.studentapi',
        'Create each class exactly as shown (IntelliJ: right-click package > New > Java Class; STS: New > Class)',
        'Add application.properties settings',
        'Run StudentApiApplication (IntelliJ ▶ / STS Run As > Spring Boot App) and wait for "Tomcat started on port 8080"',
      ],
      code: `// ===== src/main/resources/application.properties =====
spring.application.name=student-api
server.port=8080
server.error.include-message=always

// ===== model/Student.java =====
package com.example.studentapi.model;

public class Student {
    private Long id;
    private String name;
    private String email;
    private String course;
    private int age;

    public Student() { }

    public Student(Long id, String name, String email, String course, int age) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.course = course;
        this.age = age;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}

// ===== repository/StudentRepository.java =====
package com.example.studentapi.repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import com.example.studentapi.model.Student;
import org.springframework.stereotype.Repository;

@Repository
public class StudentRepository {

    private final Map<Long, Student> table = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong();

    public Student save(Student s) {
        if (s.getId() == null) {
            s.setId(sequence.incrementAndGet());
        }
        table.put(s.getId(), s);
        return s;
    }

    public List<Student> findAll() {
        List<Student> list = new ArrayList<>(table.values());
        list.sort(Comparator.comparing(Student::getId));
        return list;
    }

    public Optional<Student> findById(Long id) {
        return Optional.ofNullable(table.get(id));
    }

    public boolean existsByEmail(String email) {
        return table.values().stream().anyMatch(s -> s.getEmail().equalsIgnoreCase(email));
    }

    public void deleteById(Long id) {
        table.remove(id);
    }
}

// ===== exception/StudentNotFoundException.java =====
package com.example.studentapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(Long id) {
        super("Student not found with id " + id);
    }
}

// ===== exception/DuplicateEmailException.java =====
package com.example.studentapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("Email already registered: " + email);
    }
}

// ===== service/StudentService.java =====
package com.example.studentapi.service;

import java.util.List;
import java.util.Map;
import com.example.studentapi.model.Student;

public interface StudentService {
    Student create(Student student);
    List<Student> getAll();
    Student getById(Long id);
    Student update(Long id, Student student);
    Student patch(Long id, Map<String, Object> fields);
    void delete(Long id);
    List<Student> searchByCourse(String course);
}

// ===== service/StudentServiceImpl.java =====
package com.example.studentapi.service;

import java.util.List;
import java.util.Map;
import com.example.studentapi.exception.DuplicateEmailException;
import com.example.studentapi.exception.StudentNotFoundException;
import com.example.studentapi.model.Student;
import com.example.studentapi.repository.StudentRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository repository;

    public StudentServiceImpl(StudentRepository repository) {
        this.repository = repository;
    }

    @Override
    public Student create(Student student) {
        if (repository.existsByEmail(student.getEmail())) {
            throw new DuplicateEmailException(student.getEmail());
        }
        student.setId(null);
        student.setName(student.getName().trim());
        return repository.save(student);
    }

    @Override
    public List<Student> getAll() {
        return repository.findAll();
    }

    @Override
    public Student getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new StudentNotFoundException(id));
    }

    @Override
    public Student update(Long id, Student student) {
        Student existing = getById(id);
        existing.setName(student.getName().trim());
        existing.setEmail(student.getEmail());
        existing.setCourse(student.getCourse());
        existing.setAge(student.getAge());
        return repository.save(existing);
    }

    @Override
    public Student patch(Long id, Map<String, Object> fields) {
        Student existing = getById(id);
        if (fields.containsKey("name")) existing.setName(((String) fields.get("name")).trim());
        if (fields.containsKey("email")) existing.setEmail((String) fields.get("email"));
        if (fields.containsKey("course")) existing.setCourse((String) fields.get("course"));
        if (fields.containsKey("age")) existing.setAge(((Number) fields.get("age")).intValue());
        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        getById(id);                 // throws 404 if missing
        repository.deleteById(id);
    }

    @Override
    public List<Student> searchByCourse(String course) {
        return repository.findAll().stream()
                .filter(s -> s.getCourse() != null && s.getCourse().equalsIgnoreCase(course))
                .toList();
    }
}

// ===== controller/StudentController.java =====
package com.example.studentapi.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;
import com.example.studentapi.model.Student;
import com.example.studentapi.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Student> create(@RequestBody Student student) {
        Student saved = service.create(student);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @GetMapping
    public List<Student> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/search")
    public List<Student> search(@RequestParam String course) {
        return service.searchByCourse(course);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student student) {
        return service.update(id, student);
    }

    @PatchMapping("/{id}")
    public Student patch(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        return service.patch(id, fields);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
      result: `Console:
  Tomcat started on port 8080 (http) with context path '/'
  Started StudentApiApplication in 1.8 seconds

(The API is now ready; the next example tests every endpoint in Postman.)`,
      explanation: 'The controller only deals with HTTP. The service enforces rules (unique email, trimmed name) and throws exceptions; @ResponseStatus on the exceptions turns them into 404/409. Note "/search" is matched before "/{id}" because Spring prefers literal paths over path variables.',
    },
    {
      title: 'Testing Every Endpoint in Postman',
      scenario: 'Create a Postman collection "Student API" with an environment and run all CRUD requests in order.',
      steps: [
        'Postman: Environments (left sidebar) > + > name "local" > add variable baseUrl = http://localhost:8080 > Save; select "local" in the top-right dropdown',
        'Collections > + > name "Student API"',
        'Add request (… > Add request) "Create Student": POST {{baseUrl}}/api/students; Body > raw > JSON; Save',
        'Add the remaining requests below in the same way',
        'Send them in order and compare with the responses shown',
      ],
      code: `### 1. Create Student
POST {{baseUrl}}/api/students
Content-Type: application/json

{
  "name": "  Ravi Kumar ",
  "email": "ravi@college.edu",
  "course": "Java",
  "age": 22
}

### 2. Create second student
POST {{baseUrl}}/api/students
{
  "name": "Meena Shah",
  "email": "meena@college.edu",
  "course": "Python",
  "age": 21
}

### 3. Get all
GET {{baseUrl}}/api/students

### 4. Get one
GET {{baseUrl}}/api/students/1

### 5. Search by course
GET {{baseUrl}}/api/students/search?course=java

### 6. Full update (PUT)
PUT {{baseUrl}}/api/students/1
{
  "name": "Ravi K",
  "email": "ravi.k@college.edu",
  "course": "Java Full Stack",
  "age": 23
}

### 7. Partial update (PATCH)
PATCH {{baseUrl}}/api/students/2
{
  "course": "Data Science"
}

### 8. Duplicate email
POST {{baseUrl}}/api/students
{ "name": "Fake", "email": "meena@college.edu", "course": "Java", "age": 30 }

### 9. Delete
DELETE {{baseUrl}}/api/students/2

### 10. Get deleted
GET {{baseUrl}}/api/students/2`,
      result: `1) 201 Created   Location: http://localhost:8080/api/students/1
   { "id": 1, "name": "Ravi Kumar", "email": "ravi@college.edu", "course": "Java", "age": 22 }

2) 201 Created   { "id": 2, "name": "Meena Shah", "email": "meena@college.edu", "course": "Python", "age": 21 }

3) 200 OK
   [
     { "id": 1, "name": "Ravi Kumar", "email": "ravi@college.edu", "course": "Java", "age": 22 },
     { "id": 2, "name": "Meena Shah", "email": "meena@college.edu", "course": "Python", "age": 21 }
   ]

4) 200 OK   { "id": 1, "name": "Ravi Kumar", "email": "ravi@college.edu", "course": "Java", "age": 22 }

5) 200 OK   [ { "id": 1, "name": "Ravi Kumar", "email": "ravi@college.edu", "course": "Java", "age": 22 } ]

6) 200 OK   { "id": 1, "name": "Ravi K", "email": "ravi.k@college.edu", "course": "Java Full Stack", "age": 23 }

7) 200 OK   { "id": 2, "name": "Meena Shah", "email": "meena@college.edu", "course": "Data Science", "age": 21 }

8) 409 Conflict
   { "timestamp": "2026-11-17T10:20:31.123+00:00", "status": 409, "error": "Conflict",
     "message": "Email already registered: meena@college.edu", "path": "/api/students" }

9) 204 No Content

10) 404 Not Found
   { "timestamp": "...", "status": 404, "error": "Not Found",
     "message": "Student not found with id 2", "path": "/api/students/2" }`,
      explanation: 'Each response matches REST conventions. The extra spaces in "  Ravi Kumar " were trimmed by the service. The error JSON in 8 and 10 is Spring Boot\'s default error format; the message appears because of server.error.include-message=always.',
    },
    {
      title: 'Automated Postman Tests and Collection Runner',
      scenario: 'Add test scripts so Postman automatically verifies the API and passes the created id to the next requests.',
      steps: [
        'Open "Create Student" request > Scripts tab > Post-response (older Postman: Tests tab) and paste script 1',
        'Change "Get one" URL to {{baseUrl}}/api/students/{{studentId}} and add script 2',
        'Change "Delete" to {{baseUrl}}/api/students/{{studentId}} and add script 3',
        'Restart the Spring Boot app (to clear memory, so the email is not a duplicate)',
        'Collection > … > Run collection > Run Student API; see the green PASS results',
      ],
      code: `// Script 1 - Create Student (Post-response)
pm.test("Status is 201", function () {
    pm.response.to.have.status(201);
});
pm.test("Name is trimmed", function () {
    const body = pm.response.json();
    pm.expect(body.name).to.eql("Ravi Kumar");
    pm.collectionVariables.set("studentId", body.id);
});
pm.test("Location header present", function () {
    pm.response.to.have.header("Location");
});

// Script 2 - Get one
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Correct id", () => {
    pm.expect(pm.response.json().id).to.eql(Number(pm.collectionVariables.get("studentId")));
});
pm.test("Response time < 500ms", () => pm.expect(pm.response.responseTime).to.be.below(500));

// Script 3 - Delete
pm.test("Status is 204", () => pm.response.to.have.status(204));

// Same tests with curl (terminal) for comparison:
// curl -i -X POST http://localhost:8080/api/students -H "Content-Type: application/json" \\
//      -d '{"name":"Ravi Kumar","email":"ravi@college.edu","course":"Java","age":22}'
// curl -i http://localhost:8080/api/students/1
// curl -i -X DELETE http://localhost:8080/api/students/1`,
      result: `Collection Runner - Student API
  Create Student     POST 201   PASS Status is 201 | PASS Name is trimmed | PASS Location header present
  Get one            GET  200   PASS Status is 200 | PASS Correct id | PASS Response time < 500ms
  Delete             DEL  204   PASS Status is 204
  Passed: 7   Failed: 0`,
      explanation: 'pm.collectionVariables.set stores the new id so later requests do not hard-code it. Running the collection after every change gives you a quick regression test without writing Java tests (JUnit tests come on Day 20).',
    },
  ],
  interview: [
    { q: 'How do you design a CRUD REST API in Spring Boot?', a: 'Create a model, a repository for persistence, a service with business logic, and a @RestController mapping POST/GET/PUT/PATCH/DELETE to service methods, returning proper status codes (201, 200, 204, 404, 409).', level: 'Easy' },
    { q: 'Why should business logic not be in the controller?', a: 'Separation of concerns: controllers handle HTTP; services hold reusable, testable logic used by many controllers, schedulers or message listeners; transactions are applied at service level.', level: 'Medium' },
    { q: 'How do you return 404 when an entity is not found?', a: 'Return ResponseEntity.notFound().build(), throw ResponseStatusException(HttpStatus.NOT_FOUND), throw a custom exception annotated with @ResponseStatus(NOT_FOUND), or handle the exception globally with @RestControllerAdvice.', level: 'Medium' },
    { q: 'Why use ConcurrentHashMap and AtomicLong in an in-memory repository?', a: 'Controllers/services are singletons accessed by many request threads concurrently; HashMap and long++ are not thread-safe.', level: 'Medium' },
    { q: 'How does Spring decide between /students/search and /students/{id}?', a: 'Spring ranks matches by specificity; a literal path segment is more specific than a URI variable, so /search wins.', level: 'Hard' },
    { q: 'What should POST return?', a: '201 Created with the created resource in the body and a Location header with its URI.', level: 'Easy' },
    { q: 'How do you implement PATCH?', a: 'Read the existing entity, apply only the fields present in the request (Map, DTO with nullable fields, or JSON Patch / JSON Merge Patch), then save.', level: 'Medium' },
    { q: 'What is a Postman collection and environment?', a: 'A collection is a saved, shareable group of requests with scripts; an environment is a set of variables (like baseUrl, token) that can be switched to run the same requests against different servers.', level: 'Easy' },
    { q: 'How can you test APIs automatically in Postman?', a: 'Write JavaScript tests in the Post-response/Tests tab with pm.test and pm.expect, chain values with variables, and run the collection with Collection Runner or Newman in CI.', level: 'Medium' },
    { q: 'What is the default error response format in Spring Boot?', a: 'A JSON with timestamp, status, error, path (and message if server.error.include-message=always), produced by BasicErrorController for /error.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add GET /api/students/count returning {"count": n}.',
      hint: 'Use service.getAll().size().',
      solution: `@GetMapping("/count")
public Map<String, Integer> count() {
    return Map.of("count", service.getAll().size());
}`,
    },
    {
      task: 'Add GET /api/students/age-range?min=20&max=25 returning students whose age is between min and max (inclusive).',
      hint: 'Add a service method using stream filter.',
      solution: `// StudentService
List<Student> findByAgeRange(int min, int max);

// StudentServiceImpl
@Override
public List<Student> findByAgeRange(int min, int max) {
    return repository.findAll().stream()
            .filter(s -> s.getAge() >= min && s.getAge() <= max)
            .toList();
}

// StudentController
@GetMapping("/age-range")
public List<Student> byAge(@RequestParam int min, @RequestParam int max) {
    return service.findByAgeRange(min, max);
}`,
    },
    {
      task: 'Build a complete Employee CRUD API (id, name, department, salary) with all layers and a Postman collection. Add GET /api/employees/department/{dept}.',
      hint: 'Copy the Student structure and rename.',
      solution: `public record Employee(Long id, String name, String department, double salary) { }

@Repository
public class EmployeeRepository {
    private final Map<Long, Employee> table = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong();
    public Employee save(Employee e) {
        Long id = e.id() == null ? seq.incrementAndGet() : e.id();
        Employee saved = new Employee(id, e.name(), e.department(), e.salary());
        table.put(id, saved);
        return saved;
    }
    public List<Employee> findAll() { return table.values().stream().sorted(Comparator.comparing(Employee::id)).toList(); }
    public Optional<Employee> findById(Long id) { return Optional.ofNullable(table.get(id)); }
    public void deleteById(Long id) { table.remove(id); }
}

@Service
public class EmployeeService {
    private final EmployeeRepository repo;
    public EmployeeService(EmployeeRepository repo) { this.repo = repo; }
    public Employee create(Employee e) { return repo.save(new Employee(null, e.name(), e.department(), e.salary())); }
    public List<Employee> all() { return repo.findAll(); }
    public Employee get(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee " + id + " not found"));
    }
    public Employee update(Long id, Employee e) { get(id); return repo.save(new Employee(id, e.name(), e.department(), e.salary())); }
    public void delete(Long id) { get(id); repo.deleteById(id); }
    public List<Employee> byDept(String d) { return repo.findAll().stream().filter(e -> e.department().equalsIgnoreCase(d)).toList(); }
}

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService service;
    public EmployeeController(EmployeeService service) { this.service = service; }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Employee create(@RequestBody Employee e) { return service.create(e); }
    @GetMapping public List<Employee> all() { return service.all(); }
    @GetMapping("/{id}") public Employee one(@PathVariable Long id) { return service.get(id); }
    @PutMapping("/{id}") public Employee update(@PathVariable Long id, @RequestBody Employee e) { return service.update(id, e); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
    @GetMapping("/department/{dept}") public List<Employee> byDept(@PathVariable String dept) { return service.byDept(dept); }
}

// POST /api/employees {"name":"Anil","department":"IT","salary":60000}
// -> 201 {"id":1,"name":"Anil","department":"IT","salary":60000.0}`,
    },
    {
      task: 'Write a Postman test for GET /api/students that checks status 200, the response is an array, and every item has an email containing "@".',
      hint: 'Use pm.expect(...).to.be.an("array") and forEach.',
      solution: `pm.test("Status 200", () => pm.response.to.have.status(200));
pm.test("Is array", () => pm.expect(pm.response.json()).to.be.an("array"));
pm.test("All emails valid", () => {
    pm.response.json().forEach(s => pm.expect(s.email).to.include("@"));
});`,
    },
  ],
  quiz: [
    {
      question: 'Which status should DELETE return when successful and no body is sent?',
      options: ['200', '201', '204', '202'],
      answer: 2,
      explanation: '204 No Content.',
    },
    {
      question: 'Where should the "email must be unique" rule be implemented?',
      options: ['Service layer', 'Controller', 'Postman', 'application.properties'],
      answer: 0,
      explanation: 'Business rules belong in the service.',
    },
    {
      question: 'In Postman, how do you store the created id for later requests?',
      options: ['Copy manually only', 'Headers tab', 'Params tab', 'pm.collectionVariables.set("studentId", id) in a test script'],
      answer: 3,
      explanation: 'Scripts can set variables used as {{studentId}}.',
    },
    {
      question: 'An exception class is annotated @ResponseStatus(HttpStatus.NOT_FOUND). When thrown from a service called by a controller, the client gets:',
      options: ['500', '404', '200 with null', '400'],
      answer: 1,
      explanation: 'ResponseStatusExceptionResolver uses the annotation status.',
    },
    {
      question: 'Which is the correct REST call to partially update student 5?',
      options: ['POST /api/updateStudent?id=5', 'GET /api/students/5/update', 'PATCH /api/students/5', 'DELETE /api/students/5'],
      answer: 2,
      explanation: 'PATCH on the resource URI for partial updates.',
    },
  ],
};
