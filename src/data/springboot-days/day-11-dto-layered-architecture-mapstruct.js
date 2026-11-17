export default {
  id: 'day-11-dto-layered-architecture-mapstruct',
  title: 'DTOs, Layered Architecture (Controller-Service-Repository), MapStruct/ModelMapper',
  module: 'Module 2: REST APIs',
  day: 11,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Structure a professional Spring Boot API in layers with clear responsibilities, separate the API contract from the internal model using request/response DTOs, and convert between them with a manual mapper, MapStruct (compile-time) and ModelMapper (runtime).',
  objectives: [
    'Explain the Controller-Service-Repository architecture and the rules between layers',
    'Explain what a DTO is and why entities should not be exposed directly',
    'Create separate request and response DTOs for an Employee API',
    'Write a manual mapper, then replace it with MapStruct and compare with ModelMapper',
    'Organise packages by layer and by feature',
  ],
  theory: [
    {
      heading: 'Layered Architecture',
      content:
        'A Spring Boot backend is usually split into layers. Each layer talks only to the layer directly below it:\n\nClient (Postman/React)\n   |  JSON (DTOs)\n   v\nController layer  (@RestController)  - HTTP: URLs, status codes, @Valid, DTO in/out\n   |  DTOs or domain objects\n   v\nService layer     (@Service)         - business rules, transactions, mapping DTO <-> entity\n   |  Entities\n   v\nRepository layer  (@Repository)      - data access (Map today, JPA/MySQL from Day 12)\n   |\n   v\nDatabase\n\nAnalogy: a bank. The counter clerk (controller) talks to customers using forms (DTOs). The manager (service) applies bank rules. The vault keeper (repository) stores money (entities). Customers never walk into the vault.',
      points: [
        'Controller must not call the repository directly - always go through the service',
        'Service must not know about HttpServletRequest or ResponseEntity',
        'Repository must not contain business rules',
        'Benefits: separation of concerns, testability (mock the layer below), reuse, easier changes',
      ],
    },
    {
      heading: 'What is a DTO and Why Use It?',
      content:
        'DTO = Data Transfer Object: a simple class/record that carries data between client and server. It has no business logic.\n\nWhy not return the entity directly?\n1. Security: entity may contain password, salary, internal flags - you would leak them.\n2. Over-posting: a client could send {"role":"ADMIN"} and it gets bound to the entity.\n3. Decoupling: renaming a DB column should not break the mobile app.\n4. Different shapes: create request has no id; response has id and computed fields like fullName or age.\n5. JPA problems: lazy loading and infinite recursion in bidirectional relations (Day 15).\n\nCommon naming: EmployeeRequest / EmployeeCreateDto (input), EmployeeResponse / EmployeeDto (output), EmployeeUpdateRequest, EmployeeSummaryDto (list view).',
      tip: 'Java records are ideal DTOs: immutable, concise, and Jackson + Bean Validation work with them in Boot 3.',
    },
    {
      heading: 'Mapping Options',
      content:
        'You must convert Request DTO -> Entity and Entity -> Response DTO.\n\n1. Manual mapper class: plain Java code. Most explicit, no magic, best for learning and small projects.\n2. MapStruct: an annotation processor that GENERATES mapper implementation code at compile time. Fast (plain getter/setter calls), type-safe (compile errors for unmapped fields), Spring bean with componentModel = "spring". Industry favourite.\n3. ModelMapper: maps at RUNTIME using reflection and naming conventions. Very little code, but slower, errors appear only at runtime, and "smart" matching can surprise you.',
      points: [
        'MapStruct: @Mapper(componentModel = "spring") interface; @Mapping(target = "fullName", expression = "java(e.getFirstName() + \\" \\" + e.getLastName())")',
        'MapStruct needs the mapstruct dependency + mapstruct-processor in maven-compiler-plugin annotationProcessorPaths',
        'In IntelliJ generated code is under target/generated-sources/annotations (Build > Rebuild Project)',
        'In Eclipse/STS install m2e-apt or enable Project > Properties > Java Compiler > Annotation Processing',
        'ModelMapper: new ModelMapper().map(source, Target.class), registered as a @Bean',
      ],
    },
    {
      heading: 'Package Structure',
      content:
        'By layer (good for small/medium apps and for learning):\ncom.example.empapi\n  controller/  service/  service/impl/  repository/  entity/  dto/  mapper/  exception/  config/\n\nBy feature (good for big apps / microservice-ready):\ncom.example.empapi\n  employee/  (EmployeeController, EmployeeService, EmployeeRepository, Employee, dto/, EmployeeMapper)\n  department/\n  common/exception/\n\nBoth are fine; be consistent within a project.',
    },
  ],
  examples: [
    {
      title: 'Pure Java: Entity, DTOs and a Manual Mapper',
      scenario: 'Understand the idea of DTO mapping without Spring: hide the password and salary, compute fullName, and never accept an id from the client.',
      steps: [
        'IntelliJ: New Project > Java > Main.java (Eclipse: New Java Project > Class Main)',
        'Type the code and Run ▶',
      ],
      code: `import java.util.ArrayList;
import java.util.List;

class Employee {                       // "entity" - internal model
    Long id; String firstName; String lastName; String email; String password; double salary;
    Employee(Long id, String f, String l, String e, String p, double s) {
        this.id = id; firstName = f; lastName = l; email = e; password = p; salary = s;
    }
}

record EmployeeRequest(String firstName, String lastName, String email, String password, double salary) { }

record EmployeeResponse(Long id, String fullName, String email) { }

class EmployeeMapper {
    static Employee toEntity(EmployeeRequest r) {
        return new Employee(null, r.firstName(), r.lastName(), r.email(), r.password(), r.salary());
    }
    static EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.id, e.firstName + " " + e.lastName, e.email);
    }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> db = new ArrayList<>();
        EmployeeRequest req = new EmployeeRequest("Asha", "Rao", "asha@corp.com", "s3cret", 75000);

        Employee entity = EmployeeMapper.toEntity(req);
        entity.id = (long) (db.size() + 1);      // "database" assigns id
        db.add(entity);

        EmployeeResponse res = EmployeeMapper.toResponse(entity);
        System.out.println("Stored entity password: " + entity.password);
        System.out.println("Response sent to client: " + res);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.ArrayList;
import java.util.List;

class Employee {                       // "entity" - internal model
    Long id; String firstName; String lastName; String email; String password; double salary;
    Employee(Long id, String f, String l, String e, String p, double s) {
        this.id = id; firstName = f; lastName = l; email = e; password = p; salary = s;
    }
}

record EmployeeRequest(String firstName, String lastName, String email, String password, double salary) { }

record EmployeeResponse(Long id, String fullName, String email) { }

class EmployeeMapper {
    static Employee toEntity(EmployeeRequest r) {
        return new Employee(null, r.firstName(), r.lastName(), r.email(), r.password(), r.salary());
    }
    static EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.id, e.firstName + " " + e.lastName, e.email);
    }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> db = new ArrayList<>();
        EmployeeRequest req = new EmployeeRequest("Asha", "Rao", "asha@corp.com", "s3cret", 75000);

        Employee entity = EmployeeMapper.toEntity(req);
        entity.id = (long) (db.size() + 1);      // "database" assigns id
        db.add(entity);

        EmployeeResponse res = EmployeeMapper.toResponse(entity);
        System.out.println("Stored entity password: " + entity.password);
        System.out.println("Response sent to client: " + res);
    }
}`,
        },
      },
      result: `Stored entity password: s3cret
Response sent to client: EmployeeResponse[id=1, fullName=Asha Rao, email=asha@corp.com]`,
      explanation: 'The entity keeps everything (including password and salary) but the response DTO exposes only id, fullName and email. The record toString() prints in the form Name[field=value, ...]. This is exactly what the service layer does in Spring Boot.',
    },
    {
      title: 'Layered Employee API with Request/Response DTOs and a Manual Mapper',
      scenario: 'A complete Spring Boot Employee API: entity, request/response DTOs, mapper, repository, service interface + impl, controller and global exception handling. Storage is in-memory; on Day 12 only the repository changes to JPA.',
      steps: [
        'Generate project emp-api (Spring Web, Validation, DevTools) at start.spring.io; open in IntelliJ or STS',
        'Create packages: entity, dto, mapper, repository, service, controller, exception',
        'Create every class below (IntelliJ: right-click package > New > Java Class / Record; STS: New > Class or New > Record)',
        'Run EmpApiApplication and test in Postman as shown in the result',
      ],
      code: `// ===== application.properties =====
spring.application.name=emp-api
server.port=8080

// ===== entity/Employee.java =====
package com.example.empapi.entity;

import java.time.LocalDate;

public class Employee {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;      // never exposed
    private double salary;        // never exposed in list API
    private String department;
    private LocalDate joiningDate;

    public Employee() { }

    // getters and setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
}

// ===== dto/EmployeeRequest.java =====
package com.example.empapi.dto;

import jakarta.validation.constraints.*;

public record EmployeeRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        @Positive double salary,
        @NotBlank String department) { }

// ===== dto/EmployeeResponse.java =====
package com.example.empapi.dto;

import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String fullName,
        String email,
        String department,
        LocalDate joiningDate) { }

// ===== mapper/EmployeeMapper.java =====
package com.example.empapi.mapper;

import java.time.LocalDate;
import com.example.empapi.dto.EmployeeRequest;
import com.example.empapi.dto.EmployeeResponse;
import com.example.empapi.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public Employee toEntity(EmployeeRequest r) {
        Employee e = new Employee();
        e.setFirstName(r.firstName());
        e.setLastName(r.lastName());
        e.setEmail(r.email().toLowerCase());
        e.setPassword(r.password());          // Day 19: encode with BCrypt
        e.setSalary(r.salary());
        e.setDepartment(r.department());
        e.setJoiningDate(LocalDate.now());
        return e;
    }

    public EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.getId(),
                e.getFirstName() + " " + e.getLastName(),
                e.getEmail(), e.getDepartment(), e.getJoiningDate());
    }

    public void updateEntity(Employee e, EmployeeRequest r) {
        e.setFirstName(r.firstName());
        e.setLastName(r.lastName());
        e.setEmail(r.email().toLowerCase());
        e.setSalary(r.salary());
        e.setDepartment(r.department());
    }
}

// ===== repository/EmployeeRepository.java =====
package com.example.empapi.repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import com.example.empapi.entity.Employee;
import org.springframework.stereotype.Repository;

@Repository
public class EmployeeRepository {
    private final Map<Long, Employee> table = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong();

    public Employee save(Employee e) {
        if (e.getId() == null) e.setId(seq.incrementAndGet());
        table.put(e.getId(), e);
        return e;
    }
    public Optional<Employee> findById(Long id) { return Optional.ofNullable(table.get(id)); }
    public List<Employee> findAll() {
        return table.values().stream().sorted(Comparator.comparing(Employee::getId)).toList();
    }
    public boolean existsByEmail(String email) {
        return table.values().stream().anyMatch(e -> e.getEmail().equalsIgnoreCase(email));
    }
    public void delete(Employee e) { table.remove(e.getId()); }
}

// ===== exception/ResourceNotFoundException.java =====
package com.example.empapi.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String msg) { super(msg); }
}

// ===== exception/GlobalExceptionHandler.java =====
package com.example.empapi.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> notFound(ResourceNotFoundException ex) {
        return Map.of("status", 404, "message", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, Object> conflict(IllegalArgumentException ex) {
        return Map.of("status", 409, "message", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(f -> errors.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("status", 400, "errors", errors));
    }
}

// ===== service/EmployeeService.java =====
package com.example.empapi.service;

import java.util.List;
import com.example.empapi.dto.EmployeeRequest;
import com.example.empapi.dto.EmployeeResponse;

public interface EmployeeService {
    EmployeeResponse create(EmployeeRequest request);
    List<EmployeeResponse> findAll();
    EmployeeResponse findById(Long id);
    EmployeeResponse update(Long id, EmployeeRequest request);
    void delete(Long id);
}

// ===== service/impl/EmployeeServiceImpl.java =====
package com.example.empapi.service.impl;

import java.util.List;
import com.example.empapi.dto.EmployeeRequest;
import com.example.empapi.dto.EmployeeResponse;
import com.example.empapi.entity.Employee;
import com.example.empapi.exception.ResourceNotFoundException;
import com.example.empapi.mapper.EmployeeMapper;
import com.example.empapi.repository.EmployeeRepository;
import com.example.empapi.service.EmployeeService;
import org.springframework.stereotype.Service;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository repository;
    private final EmployeeMapper mapper;

    public EmployeeServiceImpl(EmployeeRepository repository, EmployeeMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public EmployeeResponse create(EmployeeRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists: " + request.email());
        }
        Employee saved = repository.save(mapper.toEntity(request));
        return mapper.toResponse(saved);
    }

    @Override
    public List<EmployeeResponse> findAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    public EmployeeResponse findById(Long id) {
        return mapper.toResponse(getEntity(id));
    }

    @Override
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee e = getEntity(id);
        mapper.updateEntity(e, request);
        return mapper.toResponse(repository.save(e));
    }

    @Override
    public void delete(Long id) {
        repository.delete(getEntity(id));
    }

    private Employee getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + id));
    }
}

// ===== controller/EmployeeController.java =====
package com.example.empapi.controller;

import java.net.URI;
import java.util.List;
import com.example.empapi.dto.EmployeeRequest;
import com.example.empapi.dto.EmployeeResponse;
import com.example.empapi.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse res = service.create(request);
        return ResponseEntity.created(URI.create("/api/employees/" + res.id())).body(res);
    }

    @GetMapping
    public List<EmployeeResponse> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public EmployeeResponse one(@PathVariable Long id) {
        return service.findById(id);
    }

    @PutMapping("/{id}")
    public EmployeeResponse update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
      result: `POST http://localhost:8080/api/employees
{
  "firstName": "Asha",
  "lastName": "Rao",
  "email": "Asha@Corp.com",
  "password": "Welcome@123",
  "salary": 75000,
  "department": "IT",
  "id": 500,
  "role": "ADMIN"
}
201 Created   Location: /api/employees/1
{
  "id": 1,
  "fullName": "Asha Rao",
  "email": "asha@corp.com",
  "department": "IT",
  "joiningDate": "2026-11-17"
}

GET http://localhost:8080/api/employees
200 OK
[ { "id": 1, "fullName": "Asha Rao", "email": "asha@corp.com", "department": "IT", "joiningDate": "2026-11-17" } ]

GET http://localhost:8080/api/employees/7
404 Not Found  { "status": 404, "message": "Employee not found with id 7" }   (key order may vary)`,
      explanation: 'The extra "id": 500 and "role": "ADMIN" fields were ignored because EmployeeRequest has no such components - over-posting is impossible. Password and salary never appear in responses. joiningDate shows the date of the day you run it. The controller has zero business logic; the service orchestrates mapper and repository.',
    },
    {
      title: 'Replacing the Manual Mapper with MapStruct (and ModelMapper comparison)',
      scenario: 'Generate the mapper code with MapStruct at compile time. Then see the ModelMapper alternative.',
      steps: [
        'Add the mapstruct dependency and configure the annotation processor in pom.xml as shown; reload Maven',
        'Delete (or rename) the manual EmployeeMapper class and create the MapStruct interface with the same name',
        'IntelliJ: Build > Rebuild Project; open target/generated-sources/annotations/.../EmployeeMapperImpl.java to see the generated code',
        'Eclipse/STS: right-click project > Maven > Update Project; ensure Project > Properties > Java Compiler > Annotation Processing is enabled (m2e-apt), then Project > Clean',
        'The service code does not change (same method names). Run and repeat the Postman tests - same results',
      ],
      code: `<!-- pom.xml -->
<properties>
    <java.version>17</java.version>
    <mapstruct.version>1.6.2</mapstruct.version>
</properties>

<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>\${mapstruct.version}</version>
</dependency>

<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <annotationProcessorPaths>
          <!-- if you use Lombok, put lombok FIRST, then lombok-mapstruct-binding, then mapstruct-processor -->
          <path>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>\${mapstruct.version}</version>
          </path>
        </annotationProcessorPaths>
      </configuration>
    </plugin>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>

// ===== mapper/EmployeeMapper.java (MapStruct) =====
package com.example.empapi.mapper;

import com.example.empapi.dto.EmployeeRequest;
import com.example.empapi.dto.EmployeeResponse;
import com.example.empapi.entity.Employee;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", expression = "java(r.email().toLowerCase())")
    @Mapping(target = "joiningDate", expression = "java(java.time.LocalDate.now())")
    Employee toEntity(EmployeeRequest r);

    @Mapping(target = "fullName", expression = "java(e.getFirstName() + \\" \\" + e.getLastName())")
    EmployeeResponse toResponse(Employee e);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "joiningDate", ignore = true)
    @Mapping(target = "email", expression = "java(r.email().toLowerCase())")
    void updateEntity(@MappingTarget Employee e, EmployeeRequest r);
}

// ===== What MapStruct generates (simplified) target/generated-sources/.../EmployeeMapperImpl.java =====
@Component
public class EmployeeMapperImpl implements EmployeeMapper {
    @Override
    public Employee toEntity(EmployeeRequest r) {
        if (r == null) return null;
        Employee employee = new Employee();
        employee.setFirstName(r.firstName());
        employee.setLastName(r.lastName());
        employee.setPassword(r.password());
        employee.setSalary(r.salary());
        employee.setDepartment(r.department());
        employee.setEmail(r.email().toLowerCase());
        employee.setJoiningDate(java.time.LocalDate.now());
        return employee;
    }
    // ... toResponse and updateEntity similar
}

// ===== ModelMapper alternative =====
<!-- pom.xml -->
<dependency>
    <groupId>org.modelmapper</groupId>
    <artifactId>modelmapper</artifactId>
    <version>3.2.1</version>
</dependency>

// config/MapperConfig.java
@Configuration
public class MapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mm = new ModelMapper();
        mm.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        return mm;
    }
}

// usage in a service (works best with classes that have setters, e.g. a DTO class with getters/setters)
EmployeeDto dto = modelMapper.map(employee, EmployeeDto.class);`,
      result: `IntelliJ Build output:
  Build completed successfully
  target/generated-sources/annotations/com/example/empapi/mapper/EmployeeMapperImpl.java created

If a target field is not mapped (e.g. you add "phone" to Employee), the build shows a WARNING:
  Unmapped target property: "phone".

Postman results are identical to the manual mapper:
POST /api/employees -> 201 { "id": 1, "fullName": "Asha Rao", "email": "asha@corp.com", "department": "IT", "joiningDate": "2026-11-17" }`,
      explanation: 'MapStruct writes the boring getter/setter code for you at compile time, so it is as fast as hand-written code and mistakes show up during the build. Because componentModel = "spring", EmployeeMapperImpl is a Spring bean and is injected into the service exactly like before. ModelMapper needs no interface but resolves fields by reflection at runtime, so typos are found only when the code runs.',
    },
  ],
  interview: [
    { q: 'What is a DTO?', a: 'A Data Transfer Object is a simple object used to carry data between layers or over the network, without business logic. In REST APIs it defines the request/response contract separate from the entity.', level: 'Easy' },
    { q: 'Why should we not expose JPA entities in REST APIs?', a: 'Security (sensitive fields), over-posting/mass assignment, tight coupling between DB schema and API, lazy-loading exceptions and infinite recursion in bidirectional relations, and inability to shape different views for different endpoints.', level: 'Medium' },
    { q: 'Explain Controller-Service-Repository architecture.', a: 'Controller handles HTTP and validation, Service contains business logic and transactions, Repository handles persistence. Each layer depends only on the layer below, which improves separation, testability and maintainability.', level: 'Easy' },
    { q: 'Where should DTO-entity mapping happen?', a: 'Usually in the service layer (or a mapper used by the service), so controllers deal only with DTOs and repositories only with entities.', level: 'Medium' },
    { q: 'MapStruct vs ModelMapper?', a: 'MapStruct generates mapping code at compile time: fast, type-safe, compile-time errors, debuggable. ModelMapper uses reflection at runtime: less code but slower, errors at runtime, implicit matching can map wrongly.', level: 'Medium' },
    { q: 'What does componentModel = "spring" do in MapStruct?', a: 'The generated implementation is annotated with @Component so it can be injected as a Spring bean.', level: 'Medium' },
    { q: 'How do you ignore or customise a field in MapStruct?', a: '@Mapping(target = "id", ignore = true), @Mapping(source = "dept.name", target = "departmentName"), @Mapping(target = "x", expression = "java(...)") or constant/defaultValue.', level: 'Hard' },
    { q: 'What is mass assignment / over-posting?', a: 'When a client sends extra fields (like role or id) that get bound to an internal object. Using input DTOs with only allowed fields prevents it.', level: 'Medium' },
    { q: 'Why use an interface for the service layer?', a: 'Allows multiple implementations, easy mocking, proxy-based features (transactions/AOP) and a clear contract. Many teams skip it when there is only one implementation; both are acceptable.', level: 'Easy' },
    { q: 'Package by layer vs package by feature?', a: 'By layer groups classes by technical role (controller, service). By feature groups everything for one business capability together, improving cohesion and making modules or microservice extraction easier.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an EmployeeSummaryDto(id, fullName) and add GET /api/employees/summary returning only these two fields.',
      hint: 'Add a mapper method and a service method.',
      solution: `public record EmployeeSummaryDto(Long id, String fullName) { }

// EmployeeMapper (manual)
public EmployeeSummaryDto toSummary(Employee e) {
    return new EmployeeSummaryDto(e.getId(), e.getFirstName() + " " + e.getLastName());
}

// EmployeeService / Impl
public List<EmployeeSummaryDto> summaries() {
    return repository.findAll().stream().map(mapper::toSummary).toList();
}

// EmployeeController
@GetMapping("/summary")
public List<EmployeeSummaryDto> summary() { return service.summaries(); }`,
    },
    {
      task: 'Create a Product API with ProductRequest(name, price, categoryName) and ProductResponse(id, name, priceWithGst, category) where priceWithGst = price * 1.18. Use MapStruct.',
      hint: 'Use expression for priceWithGst and source/target for category.',
      solution: `public class Product {
    private Long id; private String name; private double price; private String categoryName;
    // getters & setters
}
public record ProductRequest(@NotBlank String name, @Positive double price, @NotBlank String categoryName) { }
public record ProductResponse(Long id, String name, double priceWithGst, String category) { }

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "id", ignore = true)
    Product toEntity(ProductRequest r);

    @Mapping(target = "priceWithGst", expression = "java(p.getPrice() * 1.18)")
    @Mapping(source = "categoryName", target = "category")
    ProductResponse toResponse(Product p);
}
// price 1000 -> priceWithGst 1180.0`,
    },
    {
      task: 'Add a PATCH endpoint that accepts EmployeePatchRequest(String department, Double salary) where null means "do not change".',
      hint: 'In MapStruct use nullValuePropertyMappingStrategy = IGNORE; manually check for null.',
      solution: `public record EmployeePatchRequest(String department, @Positive Double salary) { }

// Service
public EmployeeResponse patch(Long id, EmployeePatchRequest r) {
    Employee e = getEntity(id);
    if (r.department() != null) e.setDepartment(r.department());
    if (r.salary() != null) e.setSalary(r.salary());
    return mapper.toResponse(repository.save(e));
}

// Controller
@PatchMapping("/{id}")
public EmployeeResponse patch(@PathVariable Long id, @Valid @RequestBody EmployeePatchRequest r) {
    return service.patch(id, r);
}

// MapStruct version:
@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
void patch(@MappingTarget Employee e, EmployeePatchRequest r);`,
    },
    {
      task: 'Restructure the Employee API into package-by-feature and write the folder tree.',
      hint: 'Put everything employee-related into one package.',
      solution: `com.example.empapi
  EmpApiApplication.java
  employee/
    Employee.java
    EmployeeController.java
    EmployeeService.java
    EmployeeServiceImpl.java
    EmployeeRepository.java
    EmployeeMapper.java
    dto/EmployeeRequest.java
    dto/EmployeeResponse.java
  common/
    exception/GlobalExceptionHandler.java
    exception/ResourceNotFoundException.java`,
    },
  ],
  quiz: [
    {
      question: 'Which layer should contain the rule "email must be unique"?',
      options: ['Controller', 'Repository', 'Service', 'DTO'],
      answer: 2,
      explanation: 'Business rules belong to the service layer.',
    },
    {
      question: 'Main advantage of MapStruct over ModelMapper:',
      options: ['Uses reflection', 'Compile-time generated, fast and type-safe', 'Needs no dependency', 'Works only with records'],
      answer: 1,
      explanation: 'MapStruct generates plain Java code during compilation.',
    },
    {
      question: 'A client sends "role":"ADMIN" but the request DTO has no role field. What happens?',
      options: ['The field is ignored', 'Role is set to ADMIN', 'Server crashes', '415 error'],
      answer: 0,
      explanation: 'Unknown properties are ignored by default in Spring Boot; the DTO prevents over-posting.',
    },
    {
      question: 'Which should a controller NOT do?',
      options: ['Validate input with @Valid', 'Return ResponseEntity', 'Call the service', 'Call the repository directly to save data'],
      answer: 3,
      explanation: 'Controllers must go through the service layer.',
    },
    {
      question: 'Where does IntelliJ show MapStruct generated classes?',
      options: ['src/main/resources', 'target/generated-sources/annotations', '.idea/mapstruct', 'They are not visible'],
      answer: 1,
      explanation: 'Annotation processors write generated sources there.',
    },
  ],
};
