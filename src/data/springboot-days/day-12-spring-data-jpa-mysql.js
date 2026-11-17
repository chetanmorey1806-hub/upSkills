export default {
  id: 'day-12-spring-data-jpa-mysql',
  title: 'Spring Data JPA, Entities, JpaRepository, MySQL Configuration',
  module: 'Module 3: Data Access',
  day: 12,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Connect a Spring Boot 3 application to MySQL using Spring Data JPA and Hibernate 6: configure the datasource, map entities with JPA annotations, get full CRUD from JpaRepository without writing SQL, and build a database-backed Student REST API tested with Postman.',
  objectives: [
    'Explain JPA, Hibernate and Spring Data JPA and how they relate',
    'Configure MySQL in application.properties (URL, credentials, ddl-auto, SQL logging)',
    'Map a class to a table with @Entity, @Table, @Id, @GeneratedValue, @Column, @Enumerated',
    'Use JpaRepository methods: save, findById, findAll, existsById, deleteById, count',
    'Build and test a complete Controller-Service-Repository API backed by MySQL',
  ],
  theory: [
    {
      heading: 'JPA, Hibernate and Spring Data JPA',
      content:
        'Three layers that are often confused:\n- JPA (Jakarta Persistence API, jakarta.persistence.*): a SPECIFICATION - a set of interfaces and annotations (@Entity, EntityManager) for ORM (Object Relational Mapping).\n- Hibernate: the most popular IMPLEMENTATION of JPA. It generates SQL, manages caching and dirty checking. Boot 3 uses Hibernate 6.\n- Spring Data JPA: a Spring layer on top of JPA that removes boilerplate. You write an INTERFACE that extends JpaRepository and Spring generates the implementation at runtime.\n\nDiagram in words:\nYour Service -> StudentRepository (interface) -> Spring Data proxy -> EntityManager (JPA) -> Hibernate -> JDBC -> HikariCP pool -> MySQL\n\nAnalogy: JPA is the driving-licence rules, Hibernate is the actual car, Spring Data JPA is the automatic gearbox that makes driving the car easy.',
    },
    {
      heading: 'MySQL Setup and Configuration',
      content:
        'Install MySQL 8 (or run it with Docker: docker run --name mysql8 -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8). Create the database once: CREATE DATABASE school_db;\n\nDependencies: spring-boot-starter-data-jpa (Hibernate + HikariCP) and com.mysql:mysql-connector-j (runtime).\n\nWhen these are on the classpath, Boot auto-configures DataSource, EntityManagerFactory and JpaTransactionManager from your properties.',
      syntax: 'spring.datasource.url=jdbc:mysql://localhost:3306/school_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true\nspring.datasource.username=root\nspring.datasource.password=root\nspring.jpa.hibernate.ddl-auto=update\nspring.jpa.show-sql=true\nspring.jpa.properties.hibernate.format_sql=true',
      points: [
        'Driver class is detected from the URL; no need for spring.datasource.driver-class-name',
        'Hibernate 6 detects the MySQL dialect automatically; do not set MySQL8Dialect (deprecated)',
        'Add ?createDatabaseIfNotExist=true to the URL to let MySQL create the DB (dev only)',
        'Error "Access denied for user root@localhost" -> wrong username/password',
        'Error "Communications link failure" -> MySQL not running or wrong port',
        'Error "Failed to determine a suitable driver class" -> starter-data-jpa present but no datasource URL',
      ],
    },
    {
      heading: 'spring.jpa.hibernate.ddl-auto',
      content: 'Controls what Hibernate does with tables at startup:',
      points: [
        'none - do nothing (production; use Flyway/Liquibase migrations, Day 16)',
        'validate - check that tables match entities; fail if not (production-safe)',
        'update - create missing tables/columns, never drops (development)',
        'create - drop and create tables at every startup (data lost!)',
        'create-drop - create at startup, drop at shutdown (tests, demos)',
        'Default: create-drop for embedded DBs like H2, none for MySQL',
      ],
      tip: 'Never use create or update on a production database. A wrong entity change can drop or corrupt data.',
    },
    {
      heading: 'Entity Mapping Annotations',
      content:
        'An entity is a Java class mapped to a table; each object = one row.\n- @Entity: marks the class (must have a no-arg constructor and an @Id).\n- @Table(name = "students", uniqueConstraints = ...): table name (default = class name).\n- @Id: primary key. @GeneratedValue(strategy = GenerationType.IDENTITY): MySQL AUTO_INCREMENT.\n- @Column(name, nullable, unique, length, precision, scale): column details.\n- @Enumerated(EnumType.STRING): store enum as text (never ORDINAL - reordering the enum breaks data).\n- @Transient: field not stored.\n- @CreationTimestamp / @UpdateTimestamp (Hibernate): automatic timestamps.\n- @Lob: large text/binary.\n\nNaming: Boot converts camelCase to snake_case: firstName -> first_name column.',
      points: [
        'GenerationType.IDENTITY - DB auto-increment (MySQL); SEQUENCE - DB sequence (PostgreSQL/Oracle); AUTO - provider chooses',
        'Use wrapper types (Long id) so a new entity has id = null',
        'Do not use Lombok @Data on entities (equals/hashCode/toString problems with relations); use @Getter @Setter',
      ],
    },
    {
      heading: 'JpaRepository',
      content:
        'public interface StudentRepository extends JpaRepository<Student, Long> { }\n\nThat single line gives you, without any implementation:\nsave(entity) - insert if id is null, otherwise update (merge)\nsaveAll(list), findById(id) -> Optional, findAll(), findAll(Sort), findAll(Pageable)\nexistsById(id), count(), deleteById(id), delete(entity), deleteAll()\nflush(), saveAndFlush(), getReferenceById(id)\n\nHierarchy: Repository -> CrudRepository -> ListCrudRepository -> PagingAndSortingRepository -> JpaRepository.\nYou can also declare methods like Optional<Student> findByEmail(String email) and Spring generates the query from the name (Day 13).\n\nRepository methods run in a transaction by default (read-only for find methods). @Repository on the interface is optional.',
    },
  ],
  examples: [
    {
      title: 'Project Setup: Dependencies, MySQL and application.properties',
      scenario: 'Create a student-jpa project connected to MySQL.',
      steps: [
        'start.spring.io: Maven, Spring Boot 3.3.x, Java 17, Group com.example, Artifact student-jpa; Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Validation, DevTools > GENERATE',
        'Open MySQL Workbench (or mysql CLI) and run the SQL below',
        'IntelliJ: File > Open > student-jpa > Trust. Optional: View > Tool Windows > Database > + > Data Source > MySQL > enter root/root > Test Connection',
        'STS: File > Import > Existing Maven Projects. Optional: Window > Perspective > Database Development to browse tables',
        'Paste application.properties and run the app; check the console for HikariPool-1 - Start completed',
      ],
      code: `-- MySQL Workbench / mysql CLI
CREATE DATABASE school_db;
-- (optional) dedicated user instead of root
CREATE USER 'school'@'localhost' IDENTIFIED BY 'School@123';
GRANT ALL PRIVILEGES ON school_db.* TO 'school'@'localhost';

<!-- pom.xml dependencies -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

# ===== src/main/resources/application.properties =====
spring.application.name=student-jpa
server.port=8080

# DataSource
spring.datasource.url=jdbc:mysql://localhost:3306/school_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=\${DB_PASSWORD:root}

# HikariCP pool (optional tuning)
spring.datasource.hikari.maximum-pool-size=10

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

server.error.include-message=always`,
      result: `Console:
  HikariPool-1 - Starting...
  HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@5d3b3c8e
  HikariPool-1 - Start completed.
  Initialized JPA EntityManagerFactory for persistence unit 'default'
  Tomcat started on port 8080 (http)
  Started StudentJpaApplication in 3.4 seconds`,
      explanation: 'Boot read the spring.datasource.* properties, created a HikariCP connection pool and an EntityManagerFactory. spring.jpa.open-in-view=false is recommended for REST APIs (it removes a startup warning and avoids hidden lazy-loading queries in the web layer). The password uses an environment variable with "root" as fallback.',
    },
    {
      title: 'Entity, Repository, DTOs, Service and Controller with MySQL',
      scenario: 'Build the full Student API on top of MySQL. Hibernate creates the students table automatically from the entity.',
      steps: [
        'Create packages entity, repository, dto, service, controller, exception under com.example.studentjpa',
        'Create the classes below (IntelliJ: New > Java Class / Interface / Enum; STS: New > Class / Interface / Enum)',
        'Run the app; the console shows the generated "create table students" SQL',
        'In MySQL Workbench run DESCRIBE school_db.students; to see the columns',
        'Test with the Postman requests in the next example',
      ],
      code: `// ===== entity/Gender.java =====
package com.example.studentjpa.entity;

public enum Gender { MALE, FEMALE, OTHER }

// ===== entity/Student.java =====
package com.example.studentjpa.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 60)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 40)
    private String course;

    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    protected Student() { }        // required by JPA

    public Student(String name, String email, String course, Integer age, Gender gender) {
        this.name = name;
        this.email = email;
        this.course = course;
        this.age = age;
        this.gender = gender;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

// ===== repository/StudentRepository.java =====
package com.example.studentjpa.repository;

import java.util.Optional;
import com.example.studentjpa.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmail(String email);          // derived query (Day 13)
    Optional<Student> findByEmail(String email);
}

// ===== dto/StudentRequest.java =====
package com.example.studentjpa.dto;

import com.example.studentjpa.entity.Gender;
import jakarta.validation.constraints.*;

public record StudentRequest(
        @NotBlank @Size(max = 60) String name,
        @NotBlank @Email String email,
        @NotBlank String course,
        @NotNull @Min(17) @Max(60) Integer age,
        @NotNull Gender gender) { }

// ===== dto/StudentResponse.java =====
package com.example.studentjpa.dto;

import java.time.LocalDateTime;
import com.example.studentjpa.entity.Gender;
import com.example.studentjpa.entity.Student;

public record StudentResponse(Long id, String name, String email, String course,
                              Integer age, Gender gender, LocalDateTime createdAt) {
    public static StudentResponse from(Student s) {
        return new StudentResponse(s.getId(), s.getName(), s.getEmail(), s.getCourse(),
                s.getAge(), s.getGender(), s.getCreatedAt());
    }
}

// ===== exception/ResourceNotFoundException.java =====
package com.example.studentjpa.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}

// ===== exception/DuplicateResourceException.java =====
package com.example.studentjpa.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) { super(message); }
}

// ===== exception/GlobalExceptionHandler.java =====
package com.example.studentjpa.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> duplicate(DuplicateResourceException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(f -> fields.putIfAbsent(f.getField(), f.getDefaultMessage()));
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("message", "Validation failed");
        body.put("errors", fields);
        return ResponseEntity.badRequest().body(body);
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}

// ===== service/StudentService.java =====
package com.example.studentjpa.service;

import java.util.List;
import com.example.studentjpa.dto.StudentRequest;
import com.example.studentjpa.dto.StudentResponse;

public interface StudentService {
    StudentResponse create(StudentRequest request);
    List<StudentResponse> getAll();
    StudentResponse getById(Long id);
    StudentResponse update(Long id, StudentRequest request);
    void delete(Long id);
    long count();
}

// ===== service/StudentServiceImpl.java =====
package com.example.studentjpa.service;

import java.util.List;
import com.example.studentjpa.dto.StudentRequest;
import com.example.studentjpa.dto.StudentResponse;
import com.example.studentjpa.entity.Student;
import com.example.studentjpa.exception.DuplicateResourceException;
import com.example.studentjpa.exception.ResourceNotFoundException;
import com.example.studentjpa.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository repository;

    public StudentServiceImpl(StudentRepository repository) {
        this.repository = repository;
    }

    @Override
    public StudentResponse create(StudentRequest r) {
        if (repository.existsByEmail(r.email())) {
            throw new DuplicateResourceException("Email already exists: " + r.email());
        }
        Student s = new Student(r.name(), r.email(), r.course(), r.age(), r.gender());
        return StudentResponse.from(repository.save(s));
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getAll() {
        return repository.findAll().stream().map(StudentResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getById(Long id) {
        return StudentResponse.from(find(id));
    }

    @Override
    public StudentResponse update(Long id, StudentRequest r) {
        Student s = find(id);
        s.setName(r.name());
        s.setEmail(r.email());
        s.setCourse(r.course());
        s.setAge(r.age());
        s.setGender(r.gender());
        // no save() needed: s is managed, Hibernate dirty checking issues UPDATE at commit
        return StudentResponse.from(s);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id " + id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return repository.count();
    }

    private Student find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id " + id));
    }
}

// ===== controller/StudentController.java =====
package com.example.studentjpa.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;
import com.example.studentjpa.dto.StudentRequest;
import com.example.studentjpa.dto.StudentResponse;
import com.example.studentjpa.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        StudentResponse saved = service.create(request);
        return ResponseEntity.created(URI.create("/api/students/" + saved.id())).body(saved);
    }

    @GetMapping
    public List<StudentResponse> all() {
        return service.getAll();
    }

    @GetMapping("/count")
    public Map<String, Long> count() {
        return Map.of("count", service.count());
    }

    @GetMapping("/{id}")
    public StudentResponse one(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
      result: `Console at startup (ddl-auto=update, first run):
Hibernate:
    create table students (
        age integer,
        created_at datetime(6),
        id bigint not null auto_increment,
        updated_at datetime(6),
        course varchar(40),
        email varchar(100) not null,
        full_name varchar(60) not null,
        gender enum ('FEMALE','MALE','OTHER'),
        primary key (id)
    ) engine=InnoDB
Hibernate:
    alter table students
       add constraint UK_e2rndfrsx22acpq2ty1caeuyw unique (email)

mysql> DESCRIBE students;
+------------+-------------------------------+------+-----+---------+----------------+
| Field      | Type                          | Null | Key | Default | Extra          |
+------------+-------------------------------+------+-----+---------+----------------+
| age        | int                           | YES  |     | NULL    |                |
| created_at | datetime(6)                   | YES  |     | NULL    |                |
| id         | bigint                        | NO   | PRI | NULL    | auto_increment |
| updated_at | datetime(6)                   | YES  |     | NULL    |                |
| course     | varchar(40)                   | YES  |     | NULL    |                |
| email      | varchar(100)                  | NO   | UNI | NULL    |                |
| full_name  | varchar(60)                   | NO   |     | NULL    |                |
| gender     | enum('FEMALE','MALE','OTHER') | YES  |     | NULL    |                |
+------------+-------------------------------+------+-----+---------+----------------+
(Exact column order and the unique-constraint name are chosen by Hibernate and can differ between versions.)`,
      explanation: 'We wrote no SQL and no repository implementation. Hibernate generated the table from the annotations (name -> full_name because of @Column(name)). In update(), the entity loaded inside the transaction is "managed", so simply changing its fields is enough; Hibernate detects the change (dirty checking) and runs an UPDATE when the transaction commits.',
    },
    {
      title: 'Testing the JPA API with Postman and Checking MySQL',
      scenario: 'Call every endpoint and watch the SQL Hibernate executes, then verify the rows in MySQL.',
      steps: [
        'Postman: create collection "Student JPA", environment baseUrl = http://localhost:8080',
        'Send the requests below in order (Body > raw > JSON)',
        'Watch the IDE console for the Hibernate SQL after each request',
        'In MySQL Workbench run SELECT * FROM school_db.students;',
        'Restart the app and call GET /api/students again: the data is still there (unlike the in-memory version)',
      ],
      code: `### Create
POST {{baseUrl}}/api/students
{
  "name": "Ravi Kumar",
  "email": "ravi@college.edu",
  "course": "Java Full Stack",
  "age": 22,
  "gender": "MALE"
}

### Create second
POST {{baseUrl}}/api/students
{
  "name": "Meena Shah",
  "email": "meena@college.edu",
  "course": "Data Science",
  "age": 21,
  "gender": "FEMALE"
}

### Get all
GET {{baseUrl}}/api/students

### Get one
GET {{baseUrl}}/api/students/1

### Update
PUT {{baseUrl}}/api/students/1
{
  "name": "Ravi K",
  "email": "ravi@college.edu",
  "course": "Spring Boot",
  "age": 23,
  "gender": "MALE"
}

### Count
GET {{baseUrl}}/api/students/count

### Duplicate
POST {{baseUrl}}/api/students   (same body as "Create second")

### Invalid enum
POST {{baseUrl}}/api/students
{ "name": "X", "email": "x@college.edu", "course": "Java", "age": 20, "gender": "UNKNOWN" }

### Delete
DELETE {{baseUrl}}/api/students/2`,
      result: `POST /api/students -> 201 Created   Location: /api/students/1
{ "id": 1, "name": "Ravi Kumar", "email": "ravi@college.edu", "course": "Java Full Stack",
  "age": 22, "gender": "MALE", "createdAt": "2026-11-17T12:10:05.123456" }
Console:
Hibernate: select count(*) from students s1_0 where s1_0.email=?   (existsByEmail; exact SQL shape may differ)
Hibernate: insert into students (age,course,created_at,email,gender,full_name,updated_at) values (?,?,?,?,?,?,?)

GET /api/students -> 200 [ {...id 1...}, {...id 2...} ]
Hibernate: select s1_0.id,s1_0.age,s1_0.course,... from students s1_0

PUT /api/students/1 -> 200
{ "id": 1, "name": "Ravi K", "email": "ravi@college.edu", "course": "Spring Boot", "age": 23,
  "gender": "MALE", "createdAt": "2026-11-17T12:10:05.123456" }
Hibernate: select ... from students s1_0 where s1_0.id=?
Hibernate: update students set age=?,course=?,email=?,gender=?,full_name=?,updated_at=? where id=?

GET /api/students/count -> 200 { "count": 2 }

Duplicate POST -> 409 { "status": 409, "message": "Email already exists: meena@college.edu" }

Invalid enum -> 400 (HttpMessageNotReadableException: "UNKNOWN" is not one of MALE, FEMALE, OTHER)

DELETE /api/students/2 -> 204 No Content
Hibernate: delete from students where id=?

mysql> SELECT id, full_name, email, course FROM students;
+----+-----------+------------------+-------------+
| id | full_name | email            | course      |
+----+-----------+------------------+-------------+
|  1 | Ravi K    | ravi@college.edu | Spring Boot |
+----+-----------+------------------+-------------+`,
      explanation: 'show-sql lets you see exactly what Hibernate sends to MySQL (the ? are bound parameters, which also protect against SQL injection). Data now survives restarts. The controller and DTO code are almost the same as the in-memory version - only the repository became a JpaRepository, which shows the value of layered design.',
    },
    {
      title: 'Quick Alternative: H2 In-Memory Database (no MySQL install)',
      scenario: 'For practice on a machine without MySQL, switch to the embedded H2 database and its web console. The Java code stays the same.',
      steps: [
        'Add the H2 dependency (keep or remove MySQL)',
        'Create application-h2.properties as shown',
        'Run with profile h2: IntelliJ Run > Edit Configurations > Program arguments --spring.profiles.active=h2; STS Run Configurations > Profile: h2',
        'Open http://localhost:8080/h2-console, JDBC URL jdbc:h2:mem:schooldb, user sa, empty password > Connect',
        'Run the same Postman requests',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>

# ===== application-h2.properties =====
spring.datasource.url=jdbc:h2:mem:schooldb
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

-- Optional seed data: src/main/resources/data.sql
-- (also add spring.jpa.defer-datasource-initialization=true so it runs after Hibernate creates tables)
INSERT INTO students (full_name, email, course, age, gender, created_at)
VALUES ('Demo Student', 'demo@college.edu', 'Java', 20, 'MALE', CURRENT_TIMESTAMP);`,
      result: `Console:
  H2 console available at '/h2-console'. Database available at 'jdbc:h2:mem:schooldb'
  Started StudentJpaApplication in 2.6 seconds

GET http://localhost:8080/api/students
200 OK
[ { "id": 1, "name": "Demo Student", "email": "demo@college.edu", "course": "Java", "age": 20, "gender": "MALE", "createdAt": "..." } ]`,
      explanation: 'Because the service and repository depend only on JPA, switching the database is just configuration. H2 is great for learning and tests, but data disappears when the app stops. Always test against the real database (MySQL) before deployment.',
    },
  ],
  interview: [
    { q: 'What is the difference between JPA, Hibernate and Spring Data JPA?', a: 'JPA is a specification (interfaces/annotations). Hibernate is an implementation of JPA. Spring Data JPA is an abstraction over JPA that generates repository implementations, derived queries, paging and auditing.', level: 'Easy' },
    { q: 'What does JpaRepository provide?', a: 'CRUD (save, findById, findAll, deleteById, count, existsById), batch operations (saveAll, deleteAllInBatch), paging and sorting (findAll(Pageable/Sort)), flush/saveAndFlush, getReferenceById, and query derivation from method names.', level: 'Easy' },
    { q: 'Explain the values of spring.jpa.hibernate.ddl-auto.', a: 'none (do nothing), validate (verify schema), update (add missing tables/columns), create (drop and create on startup), create-drop (create on startup, drop on shutdown). Use validate/none with migrations in production.', level: 'Medium' },
    { q: 'How does save() decide between insert and update?', a: 'SimpleJpaRepository.save checks if the entity is new (id null for wrapper types, or version null / Persistable.isNew). New -> em.persist (INSERT); otherwise em.merge (SELECT + UPDATE).', level: 'Hard' },
    { q: 'What is dirty checking?', a: 'Hibernate keeps a snapshot of managed entities; at flush/commit it compares current values with the snapshot and issues UPDATE statements for changed entities automatically, without calling save().', level: 'Medium' },
    { q: 'GenerationType.IDENTITY vs SEQUENCE?', a: 'IDENTITY uses database auto-increment columns (MySQL); the insert happens immediately and JDBC batching of inserts is disabled. SEQUENCE uses a database sequence (PostgreSQL/Oracle), allows pre-allocation and batching.', level: 'Hard' },
    { q: 'Why use @Enumerated(EnumType.STRING)?', a: 'The default ORDINAL stores position numbers; adding or reordering enum constants would silently corrupt existing data. STRING stores the name.', level: 'Medium' },
    { q: 'Why does an entity need a no-arg constructor?', a: 'Hibernate creates instances via reflection when loading rows and for proxies; it can be protected.', level: 'Easy' },
    { q: 'What is HikariCP?', a: 'The default JDBC connection pool in Spring Boot. It keeps a pool of open connections to reuse, which is much faster than opening a connection per request. Tune with spring.datasource.hikari.*.', level: 'Medium' },
    { q: 'What is spring.jpa.open-in-view and why disable it?', a: 'It keeps the Hibernate session open during the web request (view rendering) so lazy loading works in controllers. It hides N+1 query problems and holds DB connections longer; for REST APIs set it to false and fetch needed data in the service.', level: 'Hard' },
    { q: 'findById vs getReferenceById?', a: 'findById hits the database immediately and returns Optional. getReferenceById returns a lazy proxy without a query; accessing fields later triggers the query and throws EntityNotFoundException if the row does not exist.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Book entity (id, title, author, isbn unique, price, publishedYear) and a full CRUD API with JpaRepository and MySQL.',
      hint: 'Copy the Student structure; use @Column(unique = true) for isbn and BigDecimal for price.',
      solution: `@Entity
@Table(name = "books")
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String title;
    @Column(nullable = false, length = 80)
    private String author;
    @Column(nullable = false, unique = true, length = 13)
    private String isbn;
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    private Integer publishedYear;
    protected Book() { }
    // constructor, getters, setters
}

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);
}

public record BookRequest(@NotBlank String title, @NotBlank String author,
                          @Pattern(regexp = "\\\\d{13}") String isbn,
                          @NotNull @DecimalMin("0.01") BigDecimal price,
                          @Min(1450) Integer publishedYear) { }

@Service @Transactional
public class BookService {
    private final BookRepository repo;
    public BookService(BookRepository repo) { this.repo = repo; }
    public Book create(BookRequest r) {
        if (repo.existsByIsbn(r.isbn())) throw new DuplicateResourceException("ISBN exists");
        Book b = new Book();
        b.setTitle(r.title()); b.setAuthor(r.author()); b.setIsbn(r.isbn());
        b.setPrice(r.price()); b.setPublishedYear(r.publishedYear());
        return repo.save(b);
    }
    @Transactional(readOnly = true) public List<Book> all() { return repo.findAll(); }
    @Transactional(readOnly = true) public Book one(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Book " + id + " not found"));
    }
    public void delete(Long id) { repo.delete(one(id)); }
}

@RestController @RequestMapping("/api/books")
public class BookController {
    private final BookService service;
    public BookController(BookService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Book create(@Valid @RequestBody BookRequest r) { return service.create(r); }
    @GetMapping public List<Book> all() { return service.all(); }
    @GetMapping("/{id}") public Book one(@PathVariable Long id) { return service.one(id); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.delete(id); }
}
// (Returning the entity directly is acceptable for this simple exercise; prefer DTOs in real projects.)`,
    },
    {
      task: 'Insert 3 sample students at startup only if the table is empty, using CommandLineRunner and saveAll.',
      hint: 'repository.count() == 0.',
      solution: `@Component
public class DataSeeder implements CommandLineRunner {
    private final StudentRepository repo;
    public DataSeeder(StudentRepository repo) { this.repo = repo; }

    @Override
    public void run(String... args) {
        if (repo.count() == 0) {
            repo.saveAll(List.of(
                new Student("Anil", "anil@college.edu", "Java", 21, Gender.MALE),
                new Student("Priya", "priya@college.edu", "React", 22, Gender.FEMALE),
                new Student("Sam", "sam@college.edu", "Python", 23, Gender.OTHER)));
            System.out.println("Seeded 3 students");
        }
    }
}`,
    },
    {
      task: 'Change ddl-auto to validate, then add a new field "phone" to the Student entity without changing the table. What happens? Fix it with SQL.',
      hint: 'validate compares entity and table.',
      solution: `# application.properties
spring.jpa.hibernate.ddl-auto=validate

// Student.java
@Column(length = 15)
private String phone;

// Startup fails:
// Schema-validation: missing column [phone] in table [students]

-- Fix in MySQL:
ALTER TABLE students ADD COLUMN phone VARCHAR(15);
-- Restart: application starts successfully.
-- (Day 16: Flyway automates such migrations.)`,
    },
    {
      task: 'Add GET /api/students/email/{email} that returns the student or 404, using the derived method findByEmail.',
      hint: 'The repository already declares Optional<Student> findByEmail(String email).',
      solution: `// StudentService
StudentResponse getByEmail(String email);

// StudentServiceImpl
@Override
@Transactional(readOnly = true)
public StudentResponse getByEmail(String email) {
    return repository.findByEmail(email)
            .map(StudentResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("No student with email " + email));
}

// StudentController
@GetMapping("/email/{email}")
public StudentResponse byEmail(@PathVariable String email) {
    return service.getByEmail(email);
}
// GET /api/students/email/ravi@college.edu -> 200
// Hibernate: select ... from students s1_0 where s1_0.email=?`,
    },
  ],
  quiz: [
    {
      question: 'Which dependency brings Hibernate and HikariCP into a Boot project?',
      options: ['spring-boot-starter-jdbc only', 'mysql-connector-j', 'spring-boot-starter-data-jpa', 'spring-boot-starter-web'],
      answer: 2,
      explanation: 'starter-data-jpa includes Hibernate, Spring Data JPA and HikariCP (via starter-jdbc).',
    },
    {
      question: 'Safest ddl-auto value for production among these:',
      options: ['validate', 'create', 'update', 'create-drop'],
      answer: 0,
      explanation: 'validate never changes the schema; combine with Flyway/Liquibase.',
    },
    {
      question: 'StudentRepository extends JpaRepository<Student, Long>. What is Long?',
      options: ['Number of rows', 'Type of the primary key (@Id)', 'Version column', 'Page size'],
      answer: 1,
      explanation: 'The second type parameter is the ID type.',
    },
    {
      question: 'Which strategy maps to MySQL AUTO_INCREMENT?',
      options: ['GenerationType.SEQUENCE', 'GenerationType.TABLE', 'GenerationType.UUID', 'GenerationType.IDENTITY'],
      answer: 3,
      explanation: 'IDENTITY relies on the database identity/auto-increment column.',
    },
    {
      question: 'Inside a @Transactional method you load an entity with findById and change its name, without calling save(). What happens at commit?',
      options: ['Nothing is saved', 'An exception is thrown', 'Hibernate issues an UPDATE (dirty checking)', 'A new row is inserted'],
      answer: 2,
      explanation: 'Managed entities are automatically synchronised with the database at flush/commit.',
    },
  ],
};
