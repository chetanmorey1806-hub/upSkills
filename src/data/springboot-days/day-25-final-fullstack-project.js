export default {
  id: 'day-25-final-fullstack-project',
  title: 'Final Java Full Stack Project, Practical Test, Interview Questions',
  module: 'Module 6: Full Stack',
  day: 25,
  level: 'Advanced',
  duration: '6 hours',
  summary: 'Build a complete Employee Management System (EMS): Spring Boot 3 + Spring Data JPA + MySQL + Flyway + Spring Security 6 JWT + springdoc Swagger + JUnit 5 tests on the backend, React (Vite + axios) on the frontend, and Docker Compose for deployment. Then take a practical test and revise 30 interview questions.',
  objectives: [
    'Design and build a layered, secured REST backend from scratch with professional structure',
    'Use DTOs, validation, global exception handling, pagination/search, auditing and Flyway together',
    'Secure the API with JWT and role-based access (ADMIN / USER)',
    'Write unit and slice tests and document the API with Swagger',
    'Connect a React frontend, containerize the stack and explain the whole project in an interview',
  ],
  theory: [
    {
      heading: '1. Project Overview: Employee Management System (EMS)',
      content: 'EMS lets a company manage departments and employees. Users log in; ADMIN can create, update and delete employees and departments; USER can only view and search. This one project touches every topic of the course, so it is perfect for a resume and for interview discussion ("Tell me about your project").',
      points: [
        'Features: JWT login/register, department CRUD, employee CRUD, search by name + filter by department, pagination and sorting, audit columns, Swagger docs',
        'Tech stack: Java 17, Spring Boot 3.4, Spring Web, Spring Data JPA, Validation, Security 6, jjwt 0.12, Flyway, MySQL 8, springdoc 2.x, JUnit 5 + Mockito, React 18 + Vite + axios, Docker Compose',
        'Roles: ROLE_ADMIN (full access), ROLE_USER (read only)',
      ],
    },
    {
      heading: '2. Architecture and Request Flow (diagram in words)',
      content: 'React UI → axios (adds Bearer token) → [Spring Security filter chain: CorsFilter → JwtAuthFilter → AuthorizationFilter] → Controller (validates DTO) → Service (business rules, @Transactional) → Repository (Spring Data JPA) → MySQL. Response: Entity → mapped to DTO in the service → JSON → React state → re-render. Errors at any layer are converted to consistent JSON by @RestControllerAdvice.',
      points: [
        'Controller: HTTP only (status codes, request/response DTOs) — no business logic',
        'Service: rules (unique email, department exists), transactions, mapping',
        'Repository: data access only',
        'Entities never leave the service layer — the API speaks DTOs',
      ],
    },
    {
      heading: '3. Package Structure (backend) and Folder Structure (frontend)',
      content: 'A clean structure makes the project easy to explain and extend.',
      syntax: `ems-backend/src/main/java/com/ems/
  EmsApplication.java
  config/        SecurityConfig, OpenApiConfig, AuditConfig, DataSeeder
  security/      JwtService, JwtAuthFilter, RestAuthEntryPoint, DbUserDetailsService
  entity/        Auditable, Department, Employee, AppUser, Role
  dto/           EmployeeRequest, EmployeeResponse, DepartmentDto, AuthDtos, PageResponse
  repository/    DepartmentRepository, EmployeeRepository, AppUserRepository
  service/       EmployeeService, DepartmentService, AuthService
  controller/    AuthController, EmployeeController, DepartmentController
  exception/     ResourceNotFoundException, DuplicateResourceException, GlobalExceptionHandler
ems-backend/src/main/resources/
  application.properties, application-prod.properties
  db/migration/V1__init.sql, V2__seed.sql

ems-frontend/src/
  api.js  AuthContext.jsx  ProtectedRoute.jsx  App.jsx  main.jsx
  pages/Login.jsx  pages/Employees.jsx  pages/EmployeeForm.jsx`,
    },
    {
      heading: '4. REST API Design',
      content: 'Use nouns, plural resources, HTTP verbs and correct status codes. Document everything in Swagger.',
      points: [
        'POST /api/auth/register (201), POST /api/auth/login (200 token)',
        'GET /api/departments (200), POST /api/departments (201, ADMIN), DELETE /api/departments/{id} (204, ADMIN)',
        'GET /api/employees?search=&departmentId=&page=0&size=10&sort=name,asc (200 paged)',
        'GET /api/employees/{id} (200 / 404)',
        'POST /api/employees (201 / 400 / 409, ADMIN), PUT /api/employees/{id} (200, ADMIN), DELETE /api/employees/{id} (204, ADMIN)',
      ],
    },
    {
      heading: '5. Step-by-step Build Plan (follow in order)',
      content: 'Do not write everything at once. Build vertically, run and test after each step — that is how real developers work.',
      points: [
        'Step 1: Generate project on start.spring.io / IntelliJ / STS with Web, JPA, Validation, Security, MySQL, Flyway, Lombok(optional), Actuator; add jjwt + springdoc manually',
        'Step 2: Flyway V1 schema + V2 seed; entities with auditing; run — tables created',
        'Step 3: Repositories + services + DTOs + controllers WITHOUT security (temporarily permitAll) and test in Swagger',
        'Step 4: Global exception handler + validation messages',
        'Step 5: Security: users table, BCrypt, JWT login, filter, roles, CORS',
        'Step 6: Tests: service unit tests and controller slice tests',
        'Step 7: React frontend: login, list with search/pagination, form for create/edit, delete',
        'Step 8: Dockerfile + docker-compose; push to GitHub with a README',
      ],
    },
    {
      heading: '6. Practical Test Rules and Evaluation',
      content: 'The practical test (see the Practice section) is done in 3 hours, individually, using IntelliJ or STS. You may reuse your own course code. Evaluation: working features 50%, code quality and layering 20%, security 15%, tests 10%, Git/README 5%.',
      tip: 'Commit after each step with meaningful messages (git commit -m "Add employee search with pagination"). Interviewers often open your GitHub history.',
    },
    {
      heading: '7. How to Present the Project in an Interview',
      content: 'Use a 60-second structure: Problem → Tech stack → Architecture → Your key contributions → Challenges and how you solved them → Result. Example challenge stories: "Infinite JSON recursion between Department and Employee — solved with DTOs", "CORS preflight failing with Spring Security — solved with http.cors()", "N+1 queries on employee list — solved with @EntityGraph", "Token expiry while user was active — axios 401 interceptor".',
    },
  ],
  examples: [
    {
      title: 'Example 1: Project Setup, Configuration and Flyway Schema',
      scenario: 'Create the ems-backend project with all dependencies, configuration and database migrations.',
      steps: [
        'IntelliJ: File > New > Project > Spring Boot > Name ems-backend, Group com.ems, Java 17, Maven, Boot 3.4.x > Next > select Spring Web, Spring Data JPA, Validation, Spring Security, MySQL Driver, Flyway Migration, Spring Boot Actuator > Create',
        'STS: File > New > Spring Starter Project > Name ems-backend, Package com.ems > Next > choose the same dependencies > Finish',
        'Add jjwt (3 artifacts), springdoc-openapi-starter-webmvc-ui, flyway-mysql, H2 (test scope) and spring-security-test to pom.xml; reload Maven',
        'Create MySQL database: in MySQL Workbench run CREATE DATABASE ems; (or let createDatabaseIfNotExist do it)',
        'Create application.properties and the migration files under src/main/resources/db/migration',
        'Run EmsApplication — console shows "Successfully applied 2 migrations"',
      ],
      code: `<!-- ===== pom.xml (dependencies) ===== -->
<dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>
    <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
    <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-mysql</artifactId></dependency>
    <dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>2.8.6</version></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>0.12.6</version></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-impl</artifactId><version>0.12.6</version><scope>runtime</scope></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-jackson</artifactId><version>0.12.6</version><scope>runtime</scope></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
    <dependency><groupId>org.springframework.security</groupId><artifactId>spring-security-test</artifactId><scope>test</scope></dependency>
    <dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>test</scope></dependency>
</dependencies>

# ===== src/main/resources/application.properties =====
spring.application.name=ems-backend
spring.datasource.url=\${DB_URL:jdbc:mysql://localhost:3306/ems?createDatabaseIfNotExist=true}
spring.datasource.username=\${DB_USER:root}
spring.datasource.password=\${DB_PASSWORD:root}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.show-sql=false
spring.flyway.enabled=true
app.jwt.secret=\${JWT_SECRET:ZGV2LW9ubHktc2VjcmV0LWtleS1mb3Itand0LWRlbW8tMTIzNDU2Nzg5MA==}
app.jwt.expiration-ms=3600000
app.cors.allowed-origins=\${CORS_ORIGINS:http://localhost:5173}
spring.data.web.pageable.max-page-size=50
management.endpoints.web.exposure.include=health,info

-- ===== db/migration/V1__init.sql =====
CREATE TABLE department (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(80) NOT NULL UNIQUE,
    location    VARCHAR(80),
    created_at  TIMESTAMP(6),
    updated_at  TIMESTAMP(6),
    created_by  VARCHAR(50),
    updated_by  VARCHAR(50)
);

CREATE TABLE employee (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(60)  NOT NULL,
    last_name     VARCHAR(60)  NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    salary        DECIMAL(12,2) NOT NULL,
    joining_date  DATE NOT NULL,
    department_id BIGINT NOT NULL,
    created_at    TIMESTAMP(6),
    updated_at    TIMESTAMP(6),
    created_by    VARCHAR(50),
    updated_by    VARCHAR(50),
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE app_user (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    username  VARCHAR(50)  NOT NULL UNIQUE,
    password  VARCHAR(100) NOT NULL,
    role      VARCHAR(20)  NOT NULL
);

-- ===== db/migration/V2__seed.sql =====
INSERT INTO department(name, location, created_by) VALUES ('Engineering', 'Pune', 'flyway');
INSERT INTO department(name, location, created_by) VALUES ('HR', 'Mumbai', 'flyway');
INSERT INTO employee(first_name, last_name, email, salary, joining_date, department_id, created_by)
VALUES ('Asha', 'Rao', 'asha@ems.com', 85000, '2022-04-01', 1, 'flyway'),
       ('Vikram', 'Shah', 'vikram@ems.com', 72000, '2023-01-15', 1, 'flyway'),
       ('Neha', 'Iyer', 'neha@ems.com', 60000, '2021-07-10', 2, 'flyway');`,
      result: `Console:
Flyway Community Edition ...
Successfully validated 2 migrations
Migrating schema \`ems\` to version "1 - init"
Migrating schema \`ems\` to version "2 - seed"
Successfully applied 2 migrations to schema \`ems\`, now at version v2
Tomcat started on port 8080 (http)
Started EmsApplication in 6.3 seconds`,
      explanation: 'All configuration values have environment-variable overrides with local defaults, so the same build runs locally and in Docker. ddl-auto=validate makes Hibernate verify the entities against the Flyway-created schema. open-in-view=false forces us to load data inside services.',
    },
    {
      title: 'Example 2: Entities, DTOs, Repositories, Service and Controllers',
      scenario: 'Implement the core business layer: employees belong to departments, emails are unique, list supports search + department filter + paging.',
      steps: [
        'Create entity classes (Auditable, Department, Employee, AppUser, Role) in com.ems.entity',
        'Create DTO records in com.ems.dto',
        'Create repositories with the search query',
        'Create exceptions and GlobalExceptionHandler',
        'Create EmployeeService and DepartmentService (@Transactional), then controllers with Swagger annotations',
        'Temporarily permit all requests (or finish Example 3 first) and test in Swagger UI: http://localhost:8080/swagger-ui.html',
      ],
      code: `// ===== entity/Auditable.java =====
package com.ems.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {
    @CreatedDate @Column(name = "created_at", updatable = false) private Instant createdAt;
    @LastModifiedDate @Column(name = "updated_at") private Instant updatedAt;
    @CreatedBy @Column(name = "created_by", updatable = false) private String createdBy;
    @LastModifiedBy @Column(name = "updated_by") private String updatedBy;
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

// ===== entity/Department.java =====
package com.ems.entity;

import jakarta.persistence.*;

@Entity
public class Department extends Auditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;
    private String location;

    protected Department() {}
    public Department(String name, String location) { this.name = name; this.location = location; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public void setName(String name) { this.name = name; }
    public void setLocation(String location) { this.location = location; }
}

// ===== entity/Employee.java =====
package com.ems.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Employee extends Auditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "first_name", nullable = false) private String firstName;
    @Column(name = "last_name", nullable = false)  private String lastName;
    @Column(nullable = false, unique = true)       private String email;
    @Column(nullable = false)                      private BigDecimal salary;
    @Column(name = "joining_date", nullable = false) private LocalDate joiningDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id")
    private Department department;

    // getters and setters for all fields (IntelliJ: Alt+Insert > Getter and Setter;
    // Eclipse/STS: Source > Generate Getters and Setters)
}

// ===== entity/Role.java and AppUser.java =====
public enum Role { ADMIN, USER }

@Entity
@Table(name = "app_user")
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String username;
    @Column(nullable = false) private String password;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    protected AppUser() {}
    public AppUser(String u, String p, Role r) { username = u; password = p; role = r; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
}

// ===== dto/EmployeeDtos.java =====
package com.ems.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class EmployeeDtos {
    public record EmployeeRequest(
        @NotBlank(message = "First name is required") @Size(max = 60) String firstName,
        @NotBlank(message = "Last name is required")  @Size(max = 60) String lastName,
        @NotBlank @Email(message = "Email is not valid") String email,
        @NotNull @DecimalMin(value = "10000", message = "Salary must be at least 10000") BigDecimal salary,
        @NotNull @PastOrPresent(message = "Joining date cannot be in the future") LocalDate joiningDate,
        @NotNull(message = "Department is required") Long departmentId) {}

    public record EmployeeResponse(Long id, String firstName, String lastName, String email,
                                   BigDecimal salary, LocalDate joiningDate,
                                   Long departmentId, String departmentName) {}
}

// ===== dto/PageResponse.java =====
public record PageResponse<T>(List<T> content, int page, int size,
                              long totalElements, int totalPages) {
    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(),
                                  p.getTotalElements(), p.getTotalPages());
    }
}

// ===== repository/EmployeeRepository.java =====
package com.ems.repository;

import com.ems.entity.Employee;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    long countByDepartmentId(Long departmentId);

    @EntityGraph(attributePaths = "department")
    @Query("""
           SELECT e FROM Employee e
           WHERE (:deptId IS NULL OR e.department.id = :deptId)
             AND (:search IS NULL
                  OR LOWER(CONCAT(e.firstName, ' ', e.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))
           """)
    Page<Employee> search(@Param("search") String search,
                          @Param("deptId") Long deptId, Pageable pageable);
}

// DepartmentRepository: JpaRepository<Department, Long> + boolean existsByNameIgnoreCase(String name)
// AppUserRepository:   Optional<AppUser> findByUsername(String u); boolean existsByUsername(String u)

// ===== exception classes =====
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String msg) { super(msg); }
}
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String msg) { super(msg); }
}

// ===== exception/GlobalExceptionHandler.java =====
package com.ems.exception;

import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<Map<String, Object>> body(HttpStatus s, String msg, Object errors) {
        Map<String, Object> b = new LinkedHashMap<>();
        b.put("timestamp", Instant.now().toString());
        b.put("status", s.value());
        b.put("message", msg);
        if (errors != null) b.put("errors", errors);
        return ResponseEntity.status(s).body(b);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(ResourceNotFoundException ex) {
        return body(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> duplicate(DuplicateResourceException ex) {
        return body(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new TreeMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(f -> errors.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return body(HttpStatus.BAD_REQUEST, "Validation failed", errors);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> denied(AccessDeniedException ex) {
        return body(HttpStatus.FORBIDDEN, "You do not have permission for this action", null);
    }
}

// ===== service/EmployeeService.java =====
package com.ems.service;

import com.ems.dto.EmployeeDtos.*;
import com.ems.dto.PageResponse;
import com.ems.entity.*;
import com.ems.exception.*;
import com.ems.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeService {
    private final EmployeeRepository employees;
    private final DepartmentRepository departments;

    public EmployeeService(EmployeeRepository e, DepartmentRepository d) {
        this.employees = e; this.departments = d;
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> search(String search, Long deptId, Pageable pageable) {
        String term = (search == null || search.isBlank()) ? null : search.trim();
        return PageResponse.of(employees.search(term, deptId, pageable).map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(Long id) {
        return toResponse(find(id));
    }

    public EmployeeResponse create(EmployeeRequest req) {
        if (employees.existsByEmailIgnoreCase(req.email())) {
            throw new DuplicateResourceException("Email already exists: " + req.email());
        }
        Employee e = new Employee();
        apply(e, req);
        return toResponse(employees.save(e));
    }

    public EmployeeResponse update(Long id, EmployeeRequest req) {
        Employee e = find(id);
        if (employees.existsByEmailIgnoreCaseAndIdNot(req.email(), id)) {
            throw new DuplicateResourceException("Email already exists: " + req.email());
        }
        apply(e, req);                     // dirty checking saves changes
        return toResponse(e);
    }

    public void delete(Long id) {
        employees.delete(find(id));
    }

    private Employee find(Long id) {
        return employees.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private void apply(Employee e, EmployeeRequest r) {
        Department d = departments.findById(r.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + r.departmentId()));
        e.setFirstName(r.firstName().trim());
        e.setLastName(r.lastName().trim());
        e.setEmail(r.email().trim().toLowerCase());
        e.setSalary(r.salary());
        e.setJoiningDate(r.joiningDate());
        e.setDepartment(d);
    }

    private EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.getId(), e.getFirstName(), e.getLastName(), e.getEmail(),
                e.getSalary(), e.getJoiningDate(),
                e.getDepartment().getId(), e.getDepartment().getName());
    }
}

// ===== controller/EmployeeController.java =====
package com.ems.controller;

import com.ems.dto.EmployeeDtos.*;
import com.ems.dto.PageResponse;
import com.ems.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@Tag(name = "Employees")
public class EmployeeController {
    private final EmployeeService service;
    public EmployeeController(EmployeeService service) { this.service = service; }

    @Operation(summary = "Search employees (paged)")
    @GetMapping
    public PageResponse<EmployeeResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @PageableDefault(size = 10, sort = "firstName") Pageable pageable) {
        return service.search(search, departmentId, pageable);
    }

    @Operation(summary = "Get employee by id")
    @GetMapping("/{id}")
    public EmployeeResponse get(@PathVariable Long id) { return service.get(id); }

    @Operation(summary = "Create employee (ADMIN)")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @Operation(summary = "Update employee (ADMIN)")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest req) {
        return service.update(id, req);
    }

    @Operation(summary = "Delete employee (ADMIN)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

// ===== controller/DepartmentController.java (short) =====
@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments")
public class DepartmentController {
    private final DepartmentRepository repo;
    private final EmployeeRepository employees;
    public DepartmentController(DepartmentRepository r, EmployeeRepository e) { repo = r; employees = e; }

    public record DepartmentDto(Long id, String name, String location) {}

    @GetMapping
    public List<DepartmentDto> all() {
        return repo.findAll(Sort.by("name")).stream()
                .map(d -> new DepartmentDto(d.getId(), d.getName(), d.getLocation())).toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto> create(@Valid @RequestBody DepartmentDto dto) {
        if (repo.existsByNameIgnoreCase(dto.name()))
            throw new DuplicateResourceException("Department exists: " + dto.name());
        Department d = repo.save(new Department(dto.name(), dto.location()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new DepartmentDto(d.getId(), d.getName(), d.getLocation()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (employees.countByDepartmentId(id) > 0)
            throw new DuplicateResourceException("Department has employees; move them first");
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}`,
      result: `GET /api/employees?search=a&departmentId=1&page=0&size=10&sort=firstName,asc
{
  "content": [
    {"id":1,"firstName":"Asha","lastName":"Rao","email":"asha@ems.com","salary":85000.00,
     "joiningDate":"2022-04-01","departmentId":1,"departmentName":"Engineering"},
    {"id":2,"firstName":"Vikram","lastName":"Shah","email":"vikram@ems.com","salary":72000.00,
     "joiningDate":"2023-01-15","departmentId":1,"departmentName":"Engineering"}
  ],
  "page":0,"size":10,"totalElements":2,"totalPages":1
}

POST /api/employees {"firstName":"","lastName":"K","email":"bad","salary":500,
                     "joiningDate":"2030-01-01","departmentId":1}
-> 400 {"timestamp":"...","status":400,"message":"Validation failed",
        "errors":{"email":"Email is not valid","firstName":"First name is required",
                  "joiningDate":"Joining date cannot be in the future",
                  "salary":"Salary must be at least 10000"}}

POST with email "asha@ems.com" -> 409 {"status":409,"message":"Email already exists: asha@ems.com"}
GET /api/employees/999        -> 404 {"status":404,"message":"Employee not found: 999"}`,
      explanation: 'The search query handles optional filters with ":param IS NULL OR ..." so one endpoint covers all combinations. "a" matches "Asha Rao" and "Vikram Shah" in department 1. @EntityGraph loads departments in the same query (no N+1). TreeMap sorts the error fields alphabetically for a stable response. Services own transactions and DTO mapping; controllers stay thin.',
    },
    {
      title: 'Example 3: Security — JWT Login, Roles, CORS and Auditor',
      scenario: 'Protect the API: anyone can register/login, USER can read, ADMIN can write. The JWT username fills created_by/updated_by automatically.',
      steps: [
        'Copy JwtService, JwtAuthFilter and RestAuthEntryPoint from Day 18 into com.ems.security (change the package)',
        'Create DbUserDetailsService, AuthController and SecurityConfig below',
        'Create AuditConfig that reads the user from SecurityContextHolder',
        'Create DataSeeder to insert admin/admin123 and user/user123 on first start',
        'Run, open Swagger UI, call /api/auth/login, click Authorize, paste the token and try each endpoint',
      ],
      code: `// ===== security/DbUserDetailsService.java =====
@Service
public class DbUserDetailsService implements UserDetailsService {
    private final AppUserRepository repo;
    public DbUserDetailsService(AppUserRepository repo) { this.repo = repo; }

    @Override
    public UserDetails loadUserByUsername(String username) {
        AppUser u = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return User.withUsername(u.getUsername()).password(u.getPassword())
                   .roles(u.getRole().name()).build();
    }
}

// ===== config/SecurityConfig.java =====
package com.ems.config;

import com.ems.security.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("\${app.cors.allowed-origins}") List<String> origins) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(origins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter,
                                    RestAuthEntryPoint entryPoint,
                                    CorsConfigurationSource cors) throws Exception {
        http
            .cors(c -> c.configurationSource(cors))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e.authenticationEntryPoint(entryPoint))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}

// ===== config/AuditConfig.java =====
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditor")
public class AuditConfig {
    @Bean
    AuditorAware<String> auditor() {
        return () -> {
            Authentication a = SecurityContextHolder.getContext().getAuthentication();
            if (a == null || !a.isAuthenticated() || a instanceof AnonymousAuthenticationToken) {
                return Optional.of("system");
            }
            return Optional.of(a.getName());
        };
    }
}

// ===== config/OpenApiConfig.java =====
@Configuration
@OpenAPIDefinition(info = @Info(title = "EMS API", version = "v1"),
                   security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP,
                scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfig { }

// ===== controller/AuthController.java =====
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth")
public class AuthController {
    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}
    public record RegisterRequest(@NotBlank @Size(min = 3, max = 50) String username,
                                  @NotBlank @Size(min = 6) String password) {}
    public record AuthResponse(String token, String username, List<String> roles) {}

    private final AuthenticationManager authManager;
    private final JwtService jwt;
    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    public AuthController(AuthenticationManager am, JwtService jwt,
                          AppUserRepository users, PasswordEncoder encoder) {
        this.authManager = am; this.jwt = jwt; this.users = users; this.encoder = encoder;
    }

    @Operation(summary = "Register a USER", security = {})
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest r) {
        if (users.existsByUsername(r.username()))
            throw new DuplicateResourceException("Username already taken");
        users.save(new AppUser(r.username(), encoder.encode(r.password()), Role.USER));
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registered"));
    }

    @Operation(summary = "Login and get JWT", security = {})
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(r.username(), r.password()));
        UserDetails u = (UserDetails) auth.getPrincipal();
        List<String> roles = u.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
        return new AuthResponse(jwt.generateToken(u), u.getUsername(), roles);
    }
}
// add to GlobalExceptionHandler:
// @ExceptionHandler(BadCredentialsException.class) -> body(HttpStatus.UNAUTHORIZED, "Invalid username or password", null)

// ===== config/DataSeeder.java =====
@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedUsers(AppUserRepository repo, PasswordEncoder enc) {
        return args -> {
            if (!repo.existsByUsername("admin"))
                repo.save(new AppUser("admin", enc.encode("admin123"), Role.ADMIN));
            if (!repo.existsByUsername("user"))
                repo.save(new AppUser("user", enc.encode("user123"), Role.USER));
        };
    }
}`,
      result: `POST /api/auth/login {"username":"admin","password":"admin123"}
-> {"token":"eyJhbGciOiJIUzI1NiJ9...","username":"admin","roles":["ROLE_ADMIN"]}

With USER token:  GET /api/employees -> 200 | POST /api/employees -> 403
With ADMIN token: POST /api/employees -> 201 ; DB row created_by = "admin"
No token:         GET /api/employees -> 401 {"error":"Unauthorized","message":"Missing or invalid token"}
Swagger UI: /swagger-ui.html opens without login; Authorize button accepts the JWT`,
      explanation: 'URL rules give a coarse policy (GET = USER or ADMIN, other methods = ADMIN) and @PreAuthorize repeats it on methods as defence-in-depth. The AuditorAware reads the authenticated user set by JwtAuthFilter, so created_by/updated_by show who made each change. CORS is configured inside Spring Security so the React preflight passes.',
    },
    {
      title: 'Example 4: Tests — Service Unit Test and Controller Slice Test',
      scenario: 'Prove the important business rules and the HTTP contract with automated tests before building the UI.',
      steps: [
        'IntelliJ: open EmployeeService > Ctrl+Shift+T > Create New Test (JUnit5); STS: right-click > New > JUnit Test Case (Jupiter)',
        'Write EmployeeServiceTest with Mockito',
        'Write EmployeeControllerTest with @WebMvcTest; mock EmployeeService, JwtService and UserDetailsService (needed by JwtAuthFilter), and @Import(SecurityConfig.class) so your real rules apply',
        'Run all tests: IntelliJ right-click src/test/java > Run All Tests; STS Run As > Maven test; terminal ./mvnw test',
      ],
      code: `// ===== src/test/java/com/ems/service/EmployeeServiceTest.java =====
package com.ems.service;

import com.ems.dto.EmployeeDtos.*;
import com.ems.entity.*;
import com.ems.exception.*;
import com.ems.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {
    @Mock EmployeeRepository employees;
    @Mock DepartmentRepository departments;
    @InjectMocks EmployeeService service;

    private EmployeeRequest request(String email) {
        return new EmployeeRequest("Ravi", "Kumar", email, new BigDecimal("50000"),
                LocalDate.of(2024, 1, 10), 1L);
    }

    @Test
    void createSavesAndMapsDepartmentName() {
        when(employees.existsByEmailIgnoreCase("Ravi@EMS.com")).thenReturn(false);
        when(departments.findById(1L)).thenReturn(Optional.of(new Department("Engineering", "Pune")));
        when(employees.save(any(Employee.class))).thenAnswer(inv -> inv.getArgument(0));

        EmployeeResponse res = service.create(request("Ravi@EMS.com"));

        assertEquals("ravi@ems.com", res.email());          // normalized
        assertEquals("Engineering", res.departmentName());
        verify(employees).save(any(Employee.class));
    }

    @Test
    void createRejectsDuplicateEmail() {
        when(employees.existsByEmailIgnoreCase("asha@ems.com")).thenReturn(true);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class,
                () -> service.create(request("asha@ems.com")));
        assertEquals("Email already exists: asha@ems.com", ex.getMessage());
        verify(employees, never()).save(any());
    }

    @Test
    void createFailsForUnknownDepartment() {
        when(employees.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(departments.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.create(request("x@ems.com")));
    }

    @Test
    void getMissingEmployeeThrows404Exception() {
        when(employees.findById(42L)).thenReturn(Optional.empty());
        ResourceNotFoundException ex =
                assertThrows(ResourceNotFoundException.class, () -> service.get(42L));
        assertEquals("Employee not found: 42", ex.getMessage());
    }
}

// ===== src/test/java/com/ems/controller/EmployeeControllerTest.java =====
package com.ems.controller;

import com.ems.config.SecurityConfig;
import com.ems.dto.EmployeeDtos.*;
import com.ems.dto.PageResponse;
import com.ems.security.*;
import com.ems.service.EmployeeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, RestAuthEntryPoint.class})
class EmployeeControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean EmployeeService service;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserDetailsService userDetailsService;

    private final EmployeeResponse asha = new EmployeeResponse(1L, "Asha", "Rao", "asha@ems.com",
            new BigDecimal("85000"), LocalDate.of(2022, 4, 1), 1L, "Engineering");

    @Test
    void anonymousGets401() throws Exception {
        mvc.perform(get("/api/employees")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void userCanList() throws Exception {
        when(service.search(any(), any(), any()))
            .thenReturn(new PageResponse<>(List.of(asha), 0, 10, 1, 1));
        mvc.perform(get("/api/employees").param("search", "asha"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.content[0].departmentName").value("Engineering"))
           .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "USER")
    void userCannotCreate() throws Exception {
        mvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON).content("{}"))
           .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminInvalidBodyGets400() throws Exception {
        mvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON)
                .content("{\\"firstName\\":\\"\\",\\"email\\":\\"bad\\"}"))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.errors.email").value("Email is not valid"));
    }
}`,
      result: `EmployeeServiceTest
 ✔ createSavesAndMapsDepartmentName()
 ✔ createRejectsDuplicateEmail()
 ✔ createFailsForUnknownDepartment()
 ✔ getMissingEmployeeThrows404Exception()
EmployeeControllerTest
 ✔ anonymousGets401()
 ✔ userCanList()
 ✔ userCannotCreate()
 ✔ adminInvalidBodyGets400()

[INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS`,
      explanation: 'Unit tests prove business rules quickly (normalized email, duplicate check, unknown department). The slice test imports the real SecurityConfig, so it verifies the actual rules: anonymous → 401 via RestAuthEntryPoint, USER POST → 403 from the URL rule, ADMIN with invalid body → 400 from the GlobalExceptionHandler. JwtService and UserDetailsService are mocked because JwtAuthFilter needs them to be created.',
    },
    {
      title: 'Example 5: React Frontend — Employee List with Search, Filter, Paging and Form',
      scenario: 'Build the EMS UI: login (reuse Day 24), an employee table with search + department filter + pagination, and an add/edit form for admins.',
      steps: [
        'npm create vite@latest ems-frontend -- --template react; cd ems-frontend; npm install axios react-router-dom',
        'Copy api.js, AuthContext.jsx, ProtectedRoute.jsx, pages/Login.jsx and main.jsx from Day 24 (change texts to EMS)',
        'Create .env.development with VITE_API_URL=http://localhost:8080/api',
        'Create pages/Employees.jsx and pages/EmployeeForm.jsx, and the routes in App.jsx',
        'Run backend (IntelliJ/STS) and frontend (npm run dev); open http://localhost:5173 and log in as admin/admin123',
      ],
      code: `// ===== src/App.jsx =====
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import EmployeeForm from "./pages/EmployeeForm";

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav style={{ display: "flex", gap: 12, padding: 12, background: "#eef" }}>
        <b>EMS</b>
        <Link to="/employees">Employees</Link>
        {user && <span>Logged in as {user.username}</span>}
        {user && <button onClick={logout}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/employees/new" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
        <Route path="/employees/:id/edit" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Routes>
    </>
  );
}

// ===== src/pages/Employees.jsx =====
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api";
import { useAuth } from "../AuthContext";

export default function Employees() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/departments").then(({ data }) => setDepartments(data));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = { page: page, size: 5, sort: "firstName,asc" };
      if (search) params.search = search;
      if (departmentId) params.departmentId = departmentId;
      api.get("/employees", { params: params })
        .then(({ data }) => { setRows(data.content); setTotalPages(data.totalPages); })
        .catch((err) => setMessage(errorMessage(err)));
    }, 300);
    return () => clearTimeout(t);
  }, [search, departmentId, page]);

  async function remove(id) {
    if (!window.confirm("Delete employee " + id + "?")) return;
    try {
      await api.delete("/employees/" + id);
      setRows(rows.filter((r) => r.id !== id));
      setMessage("Employee deleted");
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Employees</h2>
      {message && <p><b>{message}</b></p>}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="Search name or email" value={search}
               onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        <select value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(0); }}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {isAdmin && <Link to="/employees/new"><button>+ Add Employee</button></Link>}
      </div>
      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Department</th><th>Salary</th><th>Joined</th>
              {isAdmin && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.firstName + " " + r.lastName}</td>
              <td>{r.email}</td>
              <td>{r.departmentName}</td>
              <td>{Number(r.salary).toLocaleString("en-IN")}</td>
              <td>{r.joiningDate}</td>
              {isAdmin && (
                <td>
                  <Link to={"/employees/" + r.id + "/edit"}>Edit</Link>{" "}
                  <button onClick={() => remove(r.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan="6">No employees found</td></tr>}
        </tbody>
      </table>
      <div style={{ marginTop: 12 }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
        <span> Page {totalPages === 0 ? 0 : page + 1} of {totalPages} </span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

// ===== src/pages/EmployeeForm.jsx =====
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api";

const EMPTY = { firstName: "", lastName: "", email: "", salary: "",
                joiningDate: "", departmentId: "" };

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/departments").then(({ data }) => setDepartments(data));
    if (id) {
      api.get("/employees/" + id).then(({ data }) => setForm({
        firstName: data.firstName, lastName: data.lastName, email: data.email,
        salary: String(data.salary), joiningDate: data.joiningDate,
        departmentId: String(data.departmentId),
      }));
    }
  }, [id]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setMessage("");
    const body = { ...form, salary: Number(form.salary),
                   departmentId: form.departmentId ? Number(form.departmentId) : null };
    try {
      if (id) await api.put("/employees/" + id, body);
      else await api.post("/employees", body);
      navigate("/employees");
    } catch (err) {
      const data = err.response && err.response.data;
      if (data && data.errors) setErrors(data.errors);
      setMessage(errorMessage(err));
    }
  }

  const field = (name, label, type) => (
    <div style={{ marginBottom: 8 }}>
      <label>{label}<br />
        <input name={name} type={type || "text"} value={form[name]} onChange={change} />
      </label>
      {errors[name] && <div style={{ color: "crimson" }}>{errors[name]}</div>}
    </div>
  );

  return (
    <form onSubmit={submit} style={{ padding: 16, maxWidth: 420 }}>
      <h2>{id ? "Edit Employee" : "Add Employee"}</h2>
      {message && <p style={{ color: "crimson" }}>{message}</p>}
      {field("firstName", "First name")}
      {field("lastName", "Last name")}
      {field("email", "Email", "email")}
      {field("salary", "Salary", "number")}
      {field("joiningDate", "Joining date", "date")}
      <label>Department<br />
        <select name="departmentId" value={form.departmentId} onChange={change}>
          <option value="">-- select --</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </label>
      {errors.departmentId && <div style={{ color: "crimson" }}>{errors.departmentId}</div>}
      <div style={{ marginTop: 12 }}>
        <button type="submit">{id ? "Update" : "Save"}</button>{" "}
        <button type="button" onClick={() => navigate("/employees")}>Cancel</button>
      </div>
    </form>
  );
}`,
      result: `Logged in as admin, /employees shows (sorted by first name, 5 per page):
Name         | Email           | Department  | Salary | Joined
Asha Rao     | asha@ems.com    | Engineering | 85,000 | 2022-04-01
Neha Iyer    | neha@ems.com    | HR          | 60,000 | 2021-07-10
Vikram Shah  | vikram@ems.com  | Engineering | 72,000 | 2023-01-15
Page 1 of 1

Type "ne" in search → only Neha Iyer (matches name) ... after 300 ms debounce
Select department HR → only Neha Iyer
+ Add Employee with salary 500 → red text under Salary: "Salary must be at least 10000"
Add with email asha@ems.com → top message "Email already exists: asha@ems.com"
Logged in as user → no Add button, no Actions column`,
      explanation: 'The table re-queries the API whenever search, department or page changes (debounced to avoid a request per keystroke). Field errors come directly from the backend GlobalExceptionHandler and are shown next to the matching input. The same EmployeeForm handles create and edit by checking the :id route parameter. toLocaleString("en-IN") formats salaries with Indian digit grouping.',
    },
    {
      title: 'Example 6: Run the Whole Stack with Docker Compose',
      scenario: 'Start MySQL, the Spring Boot API and the React app (served by Nginx) with one command — the way you would demo or deploy the project.',
      steps: [
        'Backend: add the multi-stage Dockerfile from Day 23 to ems-backend',
        'Frontend: add the Dockerfile and nginx.conf below to ems-frontend; create .env.production with VITE_API_URL=/api',
        'Create docker-compose.yml and .env in the parent folder that contains both projects',
        'Run docker compose up -d --build and open http://localhost:3000',
        'Push both projects to GitHub with a README (features, tech stack, screenshots, how to run, API list)',
      ],
      code: `# ===== ems-frontend/.env.production =====
VITE_API_URL=/api

# ===== ems-frontend/nginx.conf =====
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://backend:8080;           # same origin for the browser => no CORS
    proxy_set_header Host $host;
  }

  location / {
    try_files $uri /index.html;               # React Router support
  }
}

# ===== ems-frontend/Dockerfile =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

# ===== .env (parent folder, do not commit) =====
MYSQL_ROOT_PASSWORD=rootpass
MYSQL_PASSWORD=EmsPass123
JWT_SECRET=ZGV2LW9ubHktc2VjcmV0LWtleS1mb3Itand0LWRlbW8tMTIzNDU2Nzg5MA==

# ===== docker-compose.yml =====
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ems
      MYSQL_USER: ems
      MYSQL_PASSWORD: \${MYSQL_PASSWORD}
    volumes:
      - ems-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 10

  backend:
    build: ./ems-backend
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      DB_URL: jdbc:mysql://mysql:3306/ems
      DB_USER: ems
      DB_PASSWORD: \${MYSQL_PASSWORD}
      JWT_SECRET: \${JWT_SECRET}
      CORS_ORIGINS: http://localhost:3000
    ports:
      - "8080:8080"

  frontend:
    build: ./ems-frontend
    depends_on:
      - backend
    ports:
      - "3000:80"

volumes:
  ems-data:

# ===== Commands =====
docker compose up -d --build
docker compose ps
docker compose logs -f backend
docker compose down`,
      result: `[+] Running 4/4
 ✔ Volume "ems_ems-data"       Created
 ✔ Container ems-mysql-1       Healthy
 ✔ Container ems-backend-1     Started
 ✔ Container ems-frontend-1    Started

http://localhost:3000            → EMS login page (React served by Nginx)
http://localhost:3000/api/...    → proxied to Spring Boot
http://localhost:8080/swagger-ui.html → API documentation`,
      explanation: 'Nginx serves the React build and forwards /api to the backend container, so the browser sees a single origin. The backend reads all secrets from environment variables, Flyway creates the schema on first start, and the named volume keeps data between restarts. One command starts a production-like environment — perfect for demos and interviews. ($host and $uri are Nginx variables.)',
    },
  ],
  interview: [
    { q: 'Explain your full stack project in 60 seconds.', a: 'EMS is an employee management system. Backend: Spring Boot 3 REST API with layered architecture (controller-service-repository), Spring Data JPA on MySQL with Flyway migrations, DTOs with Bean Validation, global exception handling, pagination and search, JPA auditing, Spring Security 6 with JWT and ADMIN/USER roles, Swagger docs and JUnit/Mockito tests. Frontend: React with axios interceptors, protected routes and forms showing server validation errors. Deployed with Docker Compose (MySQL, API, Nginx). Challenges solved: JSON recursion with DTOs, CORS preflight with Spring Security, N+1 with @EntityGraph.', level: 'Medium' },
    { q: 'What does @SpringBootApplication do?', a: 'It combines @SpringBootConfiguration (a @Configuration), @EnableAutoConfiguration (auto-configures beans based on the classpath) and @ComponentScan (scans the package of the main class and sub-packages).', level: 'Easy' },
    { q: 'How does Spring Boot auto-configuration work?', a: 'Boot loads auto-configuration classes listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports; each is guarded by conditions (@ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty) so beans are created only when relevant and not already defined by you.', level: 'Hard' },
    { q: 'Why did you use DTOs instead of returning entities?', a: 'To decouple the API from the DB schema, hide internal fields, avoid lazy-loading exceptions and infinite recursion, and validate input separately with Bean Validation.', level: 'Easy' },
    { q: 'Difference between @Controller and @RestController?', a: '@RestController = @Controller + @ResponseBody; return values are written to the HTTP body (JSON) instead of resolving a view name.', level: 'Easy' },
    { q: 'Difference between @RequestParam and @PathVariable?', a: '@PathVariable reads values from the URI path (/employees/{id}); @RequestParam reads query/form parameters (/employees?search=asha). Path variables identify a resource; request params filter or configure.', level: 'Easy' },
    { q: 'How did you handle exceptions globally?', a: 'A @RestControllerAdvice with @ExceptionHandler methods for custom exceptions (ResourceNotFound → 404, Duplicate → 409), MethodArgumentNotValidException (400 with field errors), AccessDeniedException (403), returning a consistent JSON body.', level: 'Easy' },
    { q: 'PUT vs PATCH?', a: 'PUT replaces the whole resource (idempotent); PATCH applies a partial update. In EMS, PUT /api/employees/{id} expects the full employee data.', level: 'Easy' },
    { q: 'What is the difference between CrudRepository, PagingAndSortingRepository and JpaRepository?', a: 'CrudRepository provides basic CRUD; PagingAndSortingRepository adds findAll(Pageable/Sort); JpaRepository adds JPA-specific methods (flush, saveAllAndFlush, deleteAllInBatch, getReferenceById) and List return types.', level: 'Medium' },
    { q: 'save() vs saveAndFlush()?', a: 'save() persists/merges and the SQL is executed at flush/commit; saveAndFlush() forces an immediate flush so the SQL runs right away (useful to catch constraint errors immediately).', level: 'Medium' },
    { q: 'How do you avoid the N+1 problem in your employee list?', a: 'The search query uses @EntityGraph(attributePaths = "department") so employees and their departments are fetched with a single join query instead of one extra query per employee.', level: 'Medium' },
    { q: 'Why Flyway instead of ddl-auto=update?', a: 'Flyway gives versioned, reviewable, repeatable migrations recorded in flyway_schema_history, identical across environments; ddl-auto=update is unpredictable and unsafe for production. We use ddl-auto=validate with Flyway.', level: 'Medium' },
    { q: 'Explain how JWT authentication works in your project.', a: 'POST /api/auth/login authenticates via AuthenticationManager (UserDetailsService + BCrypt) and returns a signed JWT (sub, roles, exp) created with jjwt. React stores it and an axios interceptor sends Authorization: Bearer. JwtAuthFilter (OncePerRequestFilter) validates it on each request and sets the Authentication in SecurityContextHolder; the session policy is STATELESS.', level: 'Medium' },
    { q: 'How are roles enforced?', a: 'URL rules in SecurityFilterChain (GET /api/** for USER and ADMIN, other methods ADMIN only) plus @PreAuthorize("hasRole(\'ADMIN\')") on write methods with @EnableMethodSecurity. The UI also hides admin buttons, but only for UX.', level: 'Medium' },
    { q: 'How do you store passwords?', a: 'Hashed with BCryptPasswordEncoder (salted, adaptive). Raw passwords are never stored or logged; login uses encoder.matches().', level: 'Easy' },
    { q: 'What is CORS and how did you configure it?', a: 'A browser mechanism controlling cross-origin requests. React (5173) and API (8080) are different origins, so we defined a CorsConfigurationSource with allowed origin/methods/headers and enabled http.cors() in the security chain so preflight OPTIONS requests succeed. In Docker, Nginx proxies /api so it is same-origin.', level: 'Medium' },
    { q: 'What is @Transactional and where did you use it?', a: 'It wraps a method in a database transaction (commit on success, rollback on runtime exception). Used on EmployeeService (class level) with readOnly = true on query methods.', level: 'Easy' },
    { q: 'How does dirty checking help in your update method?', a: 'Inside the transaction the loaded Employee is managed; after changing its fields, Hibernate detects the changes at commit and issues an UPDATE without calling save().', level: 'Medium' },
    { q: 'How did you implement auditing?', a: '@EnableJpaAuditing with an AuditorAware bean reading the username from SecurityContextHolder, and an @MappedSuperclass Auditable with @CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy fields extended by entities.', level: 'Medium' },
    { q: 'Which tests did you write?', a: 'Mockito unit tests for EmployeeService rules (duplicate email, unknown department, mapping), @WebMvcTest slice tests for EmployeeController covering 401/403/400/200 with the real SecurityConfig, and an optional @SpringBootTest integration test with H2.', level: 'Medium' },
    { q: '@Mock vs @MockitoBean?', a: '@Mock is pure Mockito for unit tests without Spring. @MockitoBean (Spring Boot 3.4+, replacing @MockBean) puts a Mockito mock into the Spring test context, replacing the real bean.', level: 'Medium' },
    { q: 'How is the API documented?', a: 'springdoc-openapi generates OpenAPI 3 from the controllers; @Tag/@Operation add descriptions; a bearerAuth @SecurityScheme adds the Authorize button. Available at /swagger-ui.html and /v3/api-docs.', level: 'Easy' },
    { q: 'How do you manage configuration for different environments?', a: 'Properties with environment-variable placeholders and defaults (\${DB_URL:...}), Spring profiles (application-prod.properties), and Docker Compose environment sections; secrets are never committed.', level: 'Medium' },
    { q: 'How would you scale this application?', a: 'The API is stateless (JWT), so run multiple instances behind a load balancer; add DB connection pooling tuning, caching (Spring Cache + Redis) for read-heavy endpoints, read replicas, and later split into microservices with a gateway and discovery if needed.', level: 'Hard' },
    { q: 'How would you add a refresh token?', a: 'Issue a long-lived refresh token (stored in DB or HttpOnly cookie) at login, expose /api/auth/refresh that validates it and returns a new short-lived access token, rotate and revoke refresh tokens on logout.', level: 'Hard' },
    { q: 'What is the difference between authentication and authorization in your project?', a: 'Authentication = proving identity at /api/auth/login and validating the JWT on each request (401 if missing/invalid). Authorization = checking roles for an action (403 when USER tries to create an employee).', level: 'Easy' },
    { q: 'How does React know the user is an admin?', a: 'The login response returns the roles (ROLE_ADMIN). AuthContext stores them and exposes isAdmin for UI decisions; the backend re-checks every request.', level: 'Easy' },
    { q: 'What happens when the token expires while using the React app?', a: 'The next API call returns 401 from RestAuthEntryPoint; the axios response interceptor removes the token and redirects to /login.', level: 'Medium' },
    { q: 'Why is spring.jpa.open-in-view set to false?', a: 'To avoid holding DB connections during view/JSON rendering and to surface lazy-loading problems early; all required data is loaded inside @Transactional services and mapped to DTOs.', level: 'Hard' },
    { q: 'How did you containerize the application?', a: 'Multi-stage Dockerfiles: Maven/JDK build → JRE runtime for the API; Node build → Nginx for React. Docker Compose runs MySQL (with healthcheck and volume), backend (env vars for DB/JWT) and frontend (Nginx proxy /api to backend).', level: 'Medium' },
    { q: 'What would you improve next?', a: 'Refresh tokens, Testcontainers integration tests with MySQL, caching, file upload for employee photos, CI/CD with GitHub Actions, monitoring with Actuator + Prometheus/Grafana, and role management UI.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'PRACTICAL TEST Part A (45 min): Add a "Project" module — entity Project(id, name, startDate, endDate, budget) with Flyway V3 migration, DTO with validation (name required, endDate after startDate, budget > 0), and CRUD endpoints /api/projects (GET for USER/ADMIN, others ADMIN).',
      hint: 'Copy the Employee pattern. For "endDate after startDate" use @AssertTrue on a method in the request record.',
      solution: `-- V3__projects.sql
CREATE TABLE project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(14,2) NOT NULL,
    created_at TIMESTAMP(6), updated_at TIMESTAMP(6),
    created_by VARCHAR(50), updated_by VARCHAR(50)
);

// entity
@Entity
public class Project extends Auditable {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    private BigDecimal budget;
    // getters/setters
}

// DTO
public record ProjectRequest(
        @NotBlank String name,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull @DecimalMin(value = "0.01", message = "Budget must be positive") BigDecimal budget) {
    @AssertTrue(message = "End date must be after start date")
    public boolean isValidRange() {
        return startDate == null || endDate == null || endDate.isAfter(startDate);
    }
}
public record ProjectResponse(Long id, String name, LocalDate startDate, LocalDate endDate, BigDecimal budget) {}

// service
@Service @Transactional
public class ProjectService {
    private final ProjectRepository repo;
    public ProjectService(ProjectRepository repo) { this.repo = repo; }

    @Transactional(readOnly = true)
    public List<ProjectResponse> all() { return repo.findAll(Sort.by("name")).stream().map(this::map).toList(); }

    public ProjectResponse create(ProjectRequest r) {
        Project p = new Project();
        copy(p, r);
        return map(repo.save(p));
    }

    public ProjectResponse update(Long id, ProjectRequest r) {
        Project p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        copy(p, r);
        return map(p);
    }

    public void delete(Long id) {
        repo.delete(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id)));
    }

    private void copy(Project p, ProjectRequest r) {
        p.setName(r.name()); p.setStartDate(r.startDate());
        p.setEndDate(r.endDate()); p.setBudget(r.budget());
    }
    private ProjectResponse map(Project p) {
        return new ProjectResponse(p.getId(), p.getName(), p.getStartDate(), p.getEndDate(), p.getBudget());
    }
}

// controller
@RestController @RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService s;
    public ProjectController(ProjectService s) { this.s = s; }
    @GetMapping public List<ProjectResponse> all() { return s.all(); }
    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(s.create(r));
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse update(@PathVariable Long id, @Valid @RequestBody ProjectRequest r) { return s.update(id, r); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { s.delete(id); return ResponseEntity.noContent().build(); }
}`,
    },
    {
      task: 'PRACTICAL TEST Part B (30 min): Assign employees to projects (Many-to-Many). Endpoints: POST /api/projects/{pid}/employees/{eid} and GET /api/projects/{pid}/employees returning EmployeeResponse list. Avoid JSON recursion.',
      hint: 'Owning side Project with @JoinTable(project_employee); use DTOs in the response; Flyway V4 for the join table.',
      solution: `-- V4__project_employee.sql
CREATE TABLE project_employee (
    project_id  BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, employee_id),
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

// Project.java
@ManyToMany
@JoinTable(name = "project_employee",
           joinColumns = @JoinColumn(name = "project_id"),
           inverseJoinColumns = @JoinColumn(name = "employee_id"))
private Set<Employee> members = new HashSet<>();
public Set<Employee> getMembers() { return members; }

// ProjectService.java
public List<EmployeeResponse> assign(Long pid, Long eid) {
    Project p = repo.findById(pid).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + pid));
    Employee e = employeeRepo.findById(eid).orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + eid));
    p.getMembers().add(e);
    return members(p);
}

@Transactional(readOnly = true)
public List<EmployeeResponse> members(Long pid) {
    return members(repo.findById(pid).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + pid)));
}

private List<EmployeeResponse> members(Project p) {
    return p.getMembers().stream()
        .sorted(Comparator.comparing(Employee::getFirstName))
        .map(e -> new EmployeeResponse(e.getId(), e.getFirstName(), e.getLastName(), e.getEmail(),
                e.getSalary(), e.getJoiningDate(), e.getDepartment().getId(), e.getDepartment().getName()))
        .toList();
}

// ProjectController.java
@PostMapping("/{pid}/employees/{eid}") @PreAuthorize("hasRole('ADMIN')")
public List<EmployeeResponse> assign(@PathVariable Long pid, @PathVariable Long eid) { return s.assign(pid, eid); }

@GetMapping("/{pid}/employees")
public List<EmployeeResponse> members(@PathVariable Long pid) { return s.members(pid); }`,
    },
    {
      task: 'PRACTICAL TEST Part C (30 min): Write tests — (1) a Mockito test that ProjectService.update throws ResourceNotFoundException for a missing id; (2) a @WebMvcTest that USER gets 403 on POST /api/projects and ADMIN gets 400 when endDate is before startDate.',
      hint: 'Reuse the EmployeeControllerTest setup with @Import(SecurityConfig...) and @MockitoBean for JwtService and UserDetailsService.',
      solution: `@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {
    @Mock ProjectRepository repo;
    @InjectMocks ProjectService service;

    @Test
    void updateMissingThrows() {
        when(repo.findById(7L)).thenReturn(Optional.empty());
        ProjectRequest r = new ProjectRequest("X", LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 6, 1), new BigDecimal("1000"));
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> service.update(7L, r));
        assertEquals("Project not found: 7", ex.getMessage());
    }
}

@WebMvcTest(ProjectController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, RestAuthEntryPoint.class})
class ProjectControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ProjectService service;
    @MockitoBean JwtService jwtService;
    @MockitoBean UserDetailsService uds;

    String body(String start, String end) {
        return "{\\"name\\":\\"Apollo\\",\\"startDate\\":\\"" + start + "\\",\\"endDate\\":\\"" + end
             + "\\",\\"budget\\":5000}";
    }

    @Test @WithMockUser(roles = "USER")
    void userForbidden() throws Exception {
        mvc.perform(post("/api/projects").contentType(MediaType.APPLICATION_JSON)
                .content(body("2025-01-01", "2025-02-01")))
           .andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "ADMIN")
    void invalidRange400() throws Exception {
        mvc.perform(post("/api/projects").contentType(MediaType.APPLICATION_JSON)
                .content(body("2025-05-01", "2025-01-01")))
           .andExpect(status().isBadRequest())
           .andExpect(jsonPath("$.errors.validRange").value("End date must be after start date"));
        verifyNoInteractions(service);
    }
}`,
    },
    {
      task: 'PRACTICAL TEST Part D (45 min): React — add a Projects page listing projects (name, dates, budget) with an admin-only "Add Project" form that displays server validation errors, and a route /projects protected by login.',
      hint: 'Copy Employees.jsx / EmployeeForm.jsx patterns; errors.validRange comes from the @AssertTrue method.',
      solution: `// src/pages/Projects.jsx
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import { useAuth } from "../AuthContext";

const EMPTY = { name: "", startDate: "", endDate: "", budget: "" };

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const load = () => api.get("/projects").then(({ data }) => setProjects(data));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErrors({}); setMessage("");
    try {
      await api.post("/projects", { ...form, budget: Number(form.budget) });
      setForm(EMPTY);
      setMessage("Project created");
      load();
    } catch (err) {
      const data = err.response && err.response.data;
      if (data && data.errors) setErrors(data.errors);
      setMessage(errorMessage(err));
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Projects</h2>
      {message && <p><b>{message}</b></p>}
      {isAdmin && (
        <form onSubmit={submit} style={{ marginBottom: 12 }}>
          <input name="name" placeholder="Name" value={form.name} onChange={change} />
          <input name="startDate" type="date" value={form.startDate} onChange={change} />
          <input name="endDate" type="date" value={form.endDate} onChange={change} />
          <input name="budget" type="number" placeholder="Budget" value={form.budget} onChange={change} />
          <button>Add Project</button>
          {Object.keys(errors).map((k) => (
            <div key={k} style={{ color: "crimson" }}>{errors[k]}</div>
          ))}
        </form>
      )}
      <table border="1" cellPadding="6">
        <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Budget</th></tr></thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.startDate}</td><td>{p.endDate}</td>
              <td>{Number(p.budget).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// App.jsx
// <Link to="/projects">Projects</Link>
// <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />`,
    },
    {
      task: 'PRACTICAL TEST Part E (30 min): Add a dashboard endpoint GET /api/dashboard returning total employees, total departments, average salary and employee count per department, and show it in React as summary cards.',
      hint: 'JPQL: SELECT d.name, COUNT(e) FROM Department d LEFT JOIN Employee e ON e.department = d GROUP BY d.name ORDER BY d.name; AVG(e.salary).',
      solution: `// EmployeeRepository
@Query("SELECT AVG(e.salary) FROM Employee e")
Double averageSalary();

// DepartmentRepository
@Query("SELECT d.name, COUNT(e) FROM Department d LEFT JOIN Employee e ON e.department = d " +
       "GROUP BY d.name ORDER BY d.name")
List<Object[]> employeeCountPerDepartment();

// DashboardController
@RestController
public class DashboardController {
    private final EmployeeRepository employees;
    private final DepartmentRepository departments;
    public DashboardController(EmployeeRepository e, DepartmentRepository d) { employees = e; departments = d; }

    @GetMapping("/api/dashboard")
    public Map<String, Object> dashboard() {
        Map<String, Long> perDept = new LinkedHashMap<>();
        for (Object[] row : departments.employeeCountPerDepartment()) {
            perDept.put((String) row[0], (Long) row[1]);
        }
        Double avg = employees.averageSalary();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalEmployees", employees.count());
        out.put("totalDepartments", departments.count());
        out.put("averageSalary", avg == null ? 0 : Math.round(avg));
        out.put("perDepartment", perDept);
        return out;
    }
}
// Seed data result: {"totalEmployees":3,"totalDepartments":2,"averageSalary":72333,
//                    "perDepartment":{"Engineering":2,"HR":1}}

// React: src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/dashboard").then(({ data }) => setD(data)); }, []);
  if (!d) return <p>Loading...</p>;
  const card = { border: "1px solid #ccc", borderRadius: 8, padding: 16, minWidth: 160 };
  return (
    <div style={{ display: "flex", gap: 12, padding: 16, flexWrap: "wrap" }}>
      <div style={card}><h3>{d.totalEmployees}</h3>Employees</div>
      <div style={card}><h3>{d.totalDepartments}</h3>Departments</div>
      <div style={card}><h3>{d.averageSalary.toLocaleString("en-IN")}</h3>Average salary</div>
      {Object.entries(d.perDepartment).map(([name, count]) => (
        <div key={name} style={card}><h3>{count}</h3>{name}</div>
      ))}
    </div>
  );
}`,
    },
    {
      task: 'PRACTICAL TEST Part F (Viva, 15 min): Answer orally — (1) trace what happens from clicking "Save" in EmployeeForm to the row in MySQL; (2) why does a USER get 403 not 401; (3) how would you deploy this on a cloud VM?',
      hint: 'Use the request-flow diagram from theory section 2 and the Docker Compose example.',
      solution: `(1) React submit() builds the JSON body -> axios request interceptor adds "Authorization: Bearer <jwt>"
    -> browser sends preflight OPTIONS (in dev) answered by CorsFilter -> POST /api/employees
    -> JwtAuthFilter validates token and sets Authentication(ROLE_ADMIN) in SecurityContextHolder
    -> AuthorizationFilter checks URL rule (non-GET /api/** needs ADMIN) -> DispatcherServlet
    -> EmployeeController.create: @Valid validates EmployeeRequest (400 if invalid)
    -> @PreAuthorize("hasRole('ADMIN')") passes -> EmployeeService.create in a @Transactional proxy
    -> duplicate email check, department lookup, map DTO -> entity -> repository.save
    -> AuditingEntityListener sets created_at/created_by -> commit -> INSERT INTO employee ...
    -> entity mapped to EmployeeResponse -> 201 JSON -> React navigates to /employees and reloads.
(2) The user IS authenticated (valid token), so authentication passes (no 401);
    the role check fails, so authorization denies with 403 Forbidden.
(3) Create an Ubuntu VM, install Docker + Compose, clone the repo, create the .env with real secrets,
    run "docker compose up -d --build", open port 80/443 in the firewall/security group,
    put Nginx/Load balancer with HTTPS (Let's Encrypt) in front, set CORS_ORIGINS to the real domain,
    monitor /actuator/health and logs; automate with a GitHub Actions pipeline.`,
    },
  ],
  quiz: [
    { question: 'In EMS, a USER sends POST /api/employees with a valid token. The response is:', options: ['201 Created', '401 Unauthorized', '403 Forbidden', '400 Bad Request'], answer: 2, explanation: 'Authenticated but lacking ROLE_ADMIN → 403.' },
    { question: 'Which component converts ResourceNotFoundException into a 404 JSON response?', options: ['@RestControllerAdvice GlobalExceptionHandler', 'JwtAuthFilter', 'Flyway', 'AuditorAware'], answer: 0, explanation: '@ExceptionHandler methods in the advice map exceptions to responses.' },
    { question: 'Why does the employee search use @EntityGraph(attributePaths = "department")?', options: ['To enable caching', 'To sort results', 'To validate input', 'To avoid N+1 queries when reading department names'], answer: 3, explanation: 'It fetches departments in the same query.' },
    { question: 'With Flyway managing the schema, spring.jpa.hibernate.ddl-auto should be:', options: ['create', 'validate', 'update', 'create-drop'], answer: 1, explanation: 'Hibernate only validates; Flyway owns schema changes.' },
    { question: 'In the Docker Compose setup, why is there no CORS issue for the React app on port 3000?', options: ['CORS is disabled in browsers for Docker', 'JWT bypasses CORS', 'Nginx serves the UI and proxies /api on the same origin', 'MySQL handles CORS'], answer: 2, explanation: 'The browser only talks to localhost:3000; Nginx forwards /api to the backend.' },
  ],
};
