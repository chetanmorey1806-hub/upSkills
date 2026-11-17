export default {
  id: 'day-09-validation-bean-validation',
  title: 'Validation with @Valid and Bean Validation',
  module: 'Module 2: REST APIs',
  day: 9,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Protect your API from bad input using Jakarta Bean Validation (Hibernate Validator): constraint annotations, @Valid on request bodies, @Validated for path/query parameters, nested and list validation, validation groups, custom constraints, and clean error responses.',
  objectives: [
    'Add spring-boot-starter-validation and use @NotNull, @NotBlank, @Size, @Email, @Min, @Max, @Pattern, @Past, @Positive',
    'Trigger validation with @Valid on @RequestBody and understand MethodArgumentNotValidException',
    'Validate @PathVariable and @RequestParam with @Validated',
    'Return a field-wise error map with a 400 status',
    'Write a custom constraint annotation and use validation groups',
  ],
  theory: [
    {
      heading: 'Why Validate?',
      content:
        'Never trust client input. Without validation, a request like {"name":"","email":"abc","age":-5} would be saved into your database. Validation checks input at the boundary (controller) and returns 400 Bad Request with clear messages before any business logic runs.\n\nAnalogy: the security guard at a building entrance checks ID cards before anyone reaches the offices. The offices (services) can then trust that visitors are valid.\n\nJakarta Bean Validation (JSR 380, jakarta.validation.*) is the standard; Hibernate Validator is the implementation. In Spring Boot 3 add spring-boot-starter-validation (it is NOT included in starter-web any more).',
    },
    {
      heading: 'Common Constraint Annotations',
      content: 'Put these on fields of your request class/record:',
      points: [
        '@NotNull - not null (empty string "" is allowed)',
        '@NotEmpty - not null and length/size > 0 (works on String, List, Map)',
        '@NotBlank - not null and has at least one non-whitespace character (Strings only) - best for names',
        '@Size(min=2, max=50) - length of String or size of collection',
        '@Min(18) / @Max(60) - numeric range; @Positive, @PositiveOrZero, @Negative',
        '@DecimalMin("0.01") - for BigDecimal/double with decimals',
        '@Email - valid email format',
        '@Pattern(regexp="^[6-9]\\\\d{9}$") - regex, e.g. Indian mobile number',
        '@Past / @PastOrPresent / @Future - dates (e.g. dateOfBirth must be in the past)',
        '@AssertTrue - boolean must be true (e.g. acceptedTerms)',
        'Every annotation has a message attribute: @NotBlank(message = "Name is required")',
        'null values pass most constraints (except @NotNull/@NotEmpty/@NotBlank) - combine them: @NotNull @Min(1)',
      ],
    },
    {
      heading: '@Valid vs @Validated',
      content:
        '@Valid (jakarta.validation) on a @RequestBody parameter tells Spring to validate the object. If it fails, Spring throws MethodArgumentNotValidException -> default 400 response.\n\n@Valid on a FIELD that is another object or List enables cascading (nested) validation, e.g. @Valid Address address; List<@Valid Item> items.\n\n@Validated (Spring) on the CONTROLLER CLASS enables method-level validation of simple parameters like @PathVariable @Min(1) Long id or @RequestParam @Size(max=20) String q. In Spring Boot 3.2+ failures throw HandlerMethodValidationException (older: ConstraintViolationException). @Validated also supports validation GROUPS.',
      syntax: 'public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest req) { ... }\n\n@Validated @RestController\npublic class StudentController {\n    @GetMapping("/{id}") public Student get(@PathVariable @Min(1) Long id) { ... }\n}',
    },
    {
      heading: 'Returning Clean Validation Errors',
      content:
        'The default 400 response does not list fields clearly. Catch MethodArgumentNotValidException and build a map of field -> message. We do it locally today with @ExceptionHandler in the controller; on Day 10 we move it to a global @RestControllerAdvice.\n\nError JSON we want:\n{\n  "status": 400,\n  "message": "Validation failed",\n  "errors": { "name": "Name is required", "email": "Invalid email" }\n}',
      syntax: '@ExceptionHandler(MethodArgumentNotValidException.class)\npublic ResponseEntity<Map<String, Object>> handle(MethodArgumentNotValidException ex) {\n    Map<String, String> errors = new LinkedHashMap<>();\n    ex.getBindingResult().getFieldErrors()\n      .forEach(fe -> errors.put(fe.getField(), fe.getDefaultMessage()));\n    return ResponseEntity.badRequest().body(Map.of("status", 400, "errors", errors));\n}',
    },
    {
      heading: 'Custom Constraints and Groups',
      content:
        'Custom constraint: when built-in annotations are not enough (e.g. "course must be one of Java, Python, React"), create an annotation with @Constraint(validatedBy = ...) and a class implementing ConstraintValidator<A, T>.\n\nGroups: sometimes rules differ for create and update (e.g. id must be null on create but not null on update). Define marker interfaces OnCreate, OnUpdate, set groups = OnCreate.class on constraints, and use @Validated(OnCreate.class) on the parameter.\n\nWhere to validate: request DTOs at the controller (format rules) + service for business rules (unique email) + database constraints (NOT NULL, UNIQUE) as the last safety net.',
      points: [
        'Common mistake: forgetting spring-boot-starter-validation -> annotations are silently ignored',
        'Common mistake: forgetting @Valid -> annotations are ignored for that request',
        'Common mistake: using javax.validation imports in Boot 3 -> use jakarta.validation',
        'Common mistake: @NotBlank on Integer -> UnexpectedTypeException; use @NotNull',
      ],
    },
  ],
  examples: [
    {
      title: 'Validating a Student Registration Request',
      scenario: 'Add validation to student creation using a request record with constraints, @Valid in the controller and a local exception handler that returns a field-wise error map.',
      steps: [
        'Add spring-boot-starter-validation to pom.xml; IntelliJ: click Load Maven Changes; STS: right-click project > Maven > Update Project',
        'Create dto/StudentRequest.java with constraints',
        'Update StudentController.create to accept @Valid @RequestBody StudentRequest and map it to Student',
        'Add the @ExceptionHandler method in the controller',
        'Restart and test with Postman: one valid and one invalid body',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

// ===== dto/StudentRequest.java =====
package com.example.studentapi.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.*;

public record StudentRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be 2 to 50 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Course is required")
        String course,

        @NotNull(message = "Age is required")
        @Min(value = 17, message = "Age must be at least 17")
        @Max(value = 60, message = "Age must be at most 60")
        Integer age,

        @Pattern(regexp = "^[6-9]\\\\d{9}$", message = "Mobile must be 10 digits starting with 6-9")
        String mobile,

        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth
) { }

// ===== controller/StudentController.java (changed parts) =====
package com.example.studentapi.controller;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import com.example.studentapi.dto.StudentRequest;
import com.example.studentapi.model.Student;
import com.example.studentapi.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Student> create(@Valid @RequestBody StudentRequest req) {
        Student s = new Student(null, req.name(), req.email(), req.course(), req.age());
        Student saved = service.create(s);
        return ResponseEntity.created(URI.create("/api/students/" + saved.getId())).body(saved);
    }

    // ... other CRUD methods from Day 8 ...

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("message", "Validation failed");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }
}`,
      result: `VALID REQUEST
POST http://localhost:8080/api/students
{
  "name": "Ravi Kumar",
  "email": "ravi@college.edu",
  "course": "Java",
  "age": 22,
  "mobile": "9876543210",
  "dateOfBirth": "2003-05-14"
}
201 Created
{ "id": 1, "name": "Ravi Kumar", "email": "ravi@college.edu", "course": "Java", "age": 22 }

INVALID REQUEST
POST http://localhost:8080/api/students
{
  "name": "",
  "email": "ravi-at-college",
  "course": "Java",
  "age": 12,
  "mobile": "12345",
  "dateOfBirth": "2030-01-01"
}
400 Bad Request
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "name": "Name is required",
    "email": "Invalid email format",
    "age": "Age must be at least 17",
    "mobile": "Mobile must be 10 digits starting with 6-9",
    "dateOfBirth": "Date of birth must be in the past"
  }
}
(The order of fields inside "errors" is not guaranteed by the validator. For an empty name both @NotBlank and @Size fail; putIfAbsent keeps the first message received, so you may see "Name must be 2 to 50 characters" instead.)`,
      explanation: '@Valid triggered Hibernate Validator before the method body ran, so the service never saw bad data. Every violated rule is reported in one response, so the frontend can show all errors at once. The double backslash in the Java regex string is needed because \\d inside a Java string literal must be written as "\\\\d".',
    },
    {
      title: 'Nested Objects, Lists and Parameter Validation with @Validated',
      scenario: 'An order request with a nested address and a list of items, plus validation of path variables and query parameters.',
      steps: [
        'Create dto/OrderRequest.java with nested records',
        'Create OrderController annotated with @Validated',
        'Postman: POST http://localhost:8080/api/orders with an invalid nested item',
        'Postman: GET http://localhost:8080/api/orders/0 and GET /api/orders?status=X',
      ],
      code: `// ===== dto/OrderRequest.java =====
package com.example.studentapi.dto;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record OrderRequest(
        @NotBlank String customerName,
        @NotNull @Valid Address address,
        @NotEmpty(message = "At least one item is required") List<@Valid Item> items
) {
    public record Address(@NotBlank String city,
                          @Pattern(regexp = "\\\\d{6}", message = "Pincode must be 6 digits") String pincode) { }

    public record Item(@NotBlank String product,
                       @Positive(message = "Quantity must be positive") int quantity) { }
}

// ===== controller/OrderController.java =====
package com.example.studentapi.controller;

import java.util.Map;
import com.example.studentapi.dto.OrderRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> place(@Valid @RequestBody OrderRequest req) {
        return Map.of("message", "Order placed for " + req.customerName(),
                      "items", req.items().size());
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable @Min(value = 1, message = "id must be >= 1") Long id) {
        return Map.of("id", id, "status", "NEW");
    }

    @GetMapping
    public Map<String, String> byStatus(
            @RequestParam @Pattern(regexp = "NEW|SHIPPED|DELIVERED", message = "Invalid status") String status) {
        return Map.of("filter", status);
    }
}`,
      result: `POST http://localhost:8080/api/orders
{
  "customerName": "Meena",
  "address": { "city": "Pune", "pincode": "4110" },
  "items": [ { "product": "Pen", "quantity": 2 }, { "product": "", "quantity": 0 } ]
}
400 Bad Request  (field paths of the nested errors)
  address.pincode   -> Pincode must be 6 digits
  items[1].product  -> must not be blank
  items[1].quantity -> Quantity must be positive

POST with a correct body (pincode "411001", second item fixed)
201 Created  { "message": "Order placed for Meena", "items": 2 }

GET http://localhost:8080/api/orders/0
400 Bad Request  (HandlerMethodValidationException: id must be >= 1)

GET http://localhost:8080/api/orders?status=X
400 Bad Request  (Invalid status)

GET http://localhost:8080/api/orders?status=SHIPPED
200 OK  { "filter": "SHIPPED" }`,
      explanation: '@Valid on the address field and on List<@Valid Item> cascades validation into nested objects; error field names include the path (items[1].quantity). @Validated on the class enables constraints on simple parameters. In Spring Boot 3.2+ these produce HandlerMethodValidationException, which maps to 400.',
    },
    {
      title: 'Custom Constraint @AllowedCourse and Validation Groups',
      scenario: 'Create an annotation that only allows certain course names, and use groups so that id is required on update but forbidden on create.',
      steps: [
        'Create package validation with AllowedCourse annotation and AllowedCourseValidator',
        'Create marker interfaces OnCreate and OnUpdate',
        'Create CourseRequest using the custom annotation and groups',
        'Create CourseController using @Validated(OnCreate.class) and @Validated(OnUpdate.class)',
        'Test POST and PUT in Postman',
      ],
      code: `// ===== validation/AllowedCourse.java =====
package com.example.studentapi.validation;

import java.lang.annotation.*;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = AllowedCourseValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface AllowedCourse {
    String message() default "Course must be one of {value}";
    String[] value();
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// ===== validation/AllowedCourseValidator.java =====
package com.example.studentapi.validation;

import java.util.Arrays;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class AllowedCourseValidator implements ConstraintValidator<AllowedCourse, String> {
    private String[] allowed;

    @Override
    public void initialize(AllowedCourse annotation) {
        this.allowed = annotation.value();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) return true;          // let @NotBlank handle null
        return Arrays.stream(allowed).anyMatch(a -> a.equalsIgnoreCase(value));
    }
}

// ===== validation/OnCreate.java  and  validation/OnUpdate.java =====
package com.example.studentapi.validation;
public interface OnCreate { }

package com.example.studentapi.validation;
public interface OnUpdate { }

// ===== dto/CourseRequest.java =====
package com.example.studentapi.dto;

import com.example.studentapi.validation.AllowedCourse;
import com.example.studentapi.validation.OnCreate;
import com.example.studentapi.validation.OnUpdate;
import jakarta.validation.constraints.*;

public record CourseRequest(
        @Null(groups = OnCreate.class, message = "id must not be sent on create")
        @NotNull(groups = OnUpdate.class, message = "id is required on update")
        Long id,

        @NotBlank(groups = {OnCreate.class, OnUpdate.class})
        @AllowedCourse(value = {"Java", "Python", "React"}, groups = {OnCreate.class, OnUpdate.class})
        String name,

        @Min(value = 1, groups = {OnCreate.class, OnUpdate.class})
        int durationDays
) { }

// ===== controller/CourseController.java =====
package com.example.studentapi.controller;

import com.example.studentapi.dto.CourseRequest;
import com.example.studentapi.validation.OnCreate;
import com.example.studentapi.validation.OnUpdate;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseRequest create(@Validated(OnCreate.class) @RequestBody CourseRequest req) {
        return new CourseRequest(101L, req.name(), req.durationDays());
    }

    @PutMapping
    public CourseRequest update(@Validated(OnUpdate.class) @RequestBody CourseRequest req) {
        return req;
    }
}`,
      result: `POST http://localhost:8080/api/courses
{ "name": "Java", "durationDays": 45 }
201 Created  { "id": 101, "name": "Java", "durationDays": 45 }

POST http://localhost:8080/api/courses
{ "id": 5, "name": "Cobol", "durationDays": 10 }
400 Bad Request
  id   -> id must not be sent on create
  name -> Course must be one of [Java, Python, React]

PUT http://localhost:8080/api/courses
{ "name": "Python", "durationDays": 30 }
400 Bad Request
  id -> id is required on update

PUT http://localhost:8080/api/courses
{ "id": 7, "name": "python", "durationDays": 30 }
200 OK  { "id": 7, "name": "python", "durationDays": 30 }`,
      explanation: 'The custom validator is called by Hibernate Validator like any built-in constraint; {value} in the message is replaced with the annotation attribute. With groups, only constraints that belong to the requested group are checked, so the same DTO works for create and update with different rules.',
    },
  ],
  interview: [
    { q: 'Which dependency is needed for validation in Spring Boot 3?', a: 'spring-boot-starter-validation (Hibernate Validator). It is not part of spring-boot-starter-web since Boot 2.3.', level: 'Easy' },
    { q: 'Difference between @NotNull, @NotEmpty and @NotBlank?', a: '@NotNull: not null. @NotEmpty: not null and not empty (size/length > 0). @NotBlank: not null and contains at least one non-whitespace char (Strings only). For "  ": NotNull passes, NotEmpty passes, NotBlank fails.', level: 'Easy' },
    { q: 'Difference between @Valid and @Validated?', a: '@Valid is the Jakarta standard, triggers validation and cascades into nested objects. @Validated is Spring-specific, supports validation groups and, on a class, enables method-parameter validation for @PathVariable/@RequestParam.', level: 'Medium' },
    { q: 'Which exception is thrown when @Valid @RequestBody fails?', a: 'MethodArgumentNotValidException, resulting in 400 Bad Request. Its BindingResult contains FieldErrors with field names and messages.', level: 'Medium' },
    { q: 'How do you validate nested objects and list elements?', a: 'Put @Valid on the nested field (e.g. @Valid Address address) and use type-argument constraints for lists: List<@Valid Item> items.', level: 'Medium' },
    { q: 'How do you create a custom validation annotation?', a: 'Create an annotation with @Constraint(validatedBy = X.class), message/groups/payload attributes and RUNTIME retention, then implement ConstraintValidator<Annotation, Type> with isValid().', level: 'Hard' },
    { q: 'What are validation groups?', a: 'Marker interfaces used to apply different subsets of constraints in different situations (e.g. OnCreate vs OnUpdate), selected with @Validated(Group.class).', level: 'Hard' },
    { q: 'Does @Min(18) fail for null?', a: 'No. Most constraints treat null as valid. Combine with @NotNull to make the value required.', level: 'Medium' },
    { q: 'Should you validate only in the controller?', a: 'No. Validate format in DTOs at the controller, business rules (uniqueness, stock available) in the service, and keep database constraints as a final safety net.', level: 'Medium' },
    { q: 'Why validate a DTO instead of the JPA entity?', a: 'Request rules differ from persistence rules and from endpoint to endpoint; DTOs decouple the API contract from the database model and avoid exposing internal fields.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a RegisterRequest with username (4-15 chars, letters/digits only), password (min 8, at least one digit), confirmPassword, email and acceptedTerms (must be true). Return field errors.',
      hint: '@Pattern for username/password, @AssertTrue for terms.',
      solution: `public record RegisterRequest(
        @NotBlank @Size(min = 4, max = 15)
        @Pattern(regexp = "^[A-Za-z0-9]+$", message = "Only letters and digits")
        String username,

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(regexp = ".*\\\\d.*", message = "Password must contain a digit")
        String password,

        @NotBlank String confirmPassword,

        @NotBlank @Email String email,

        @AssertTrue(message = "You must accept the terms")
        boolean acceptedTerms
) { }

@PostMapping("/api/register")
public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED).body("Registered " + req.username());
}`,
    },
    {
      task: 'Add a class-level check that password and confirmPassword match, using @AssertTrue on a method in the record.',
      hint: 'A method named isXxx() annotated with @AssertTrue is validated as property xxx.',
      solution: `public record RegisterRequest(String username, String password, String confirmPassword /* ...other fields... */) {

    @AssertTrue(message = "Passwords do not match")
    public boolean isPasswordMatching() {
        return password != null && password.equals(confirmPassword);
    }
}
// Error appears under field "passwordMatching": "Passwords do not match"`,
    },
    {
      task: 'Validate GET /api/products?page=0&size=500 so that page >= 0 and size between 1 and 100.',
      hint: '@Validated on the controller class, @Min/@Max on @RequestParam.',
      solution: `@Validated
@RestController
@RequestMapping("/api/products")
public class ProductQueryController {
    @GetMapping
    public Map<String, Integer> list(@RequestParam(defaultValue = "0") @Min(0) int page,
                                     @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return Map.of("page", page, "size", size);
    }
}
// size=500 -> 400 Bad Request`,
    },
    {
      task: 'Write a custom @IndianPincode annotation (6 digits, first digit 1-9) and use it on an address field.',
      hint: 'ConstraintValidator<IndianPincode, String> with value.matches("[1-9]\\\\d{5}").',
      solution: `@Documented
@Constraint(validatedBy = IndianPincodeValidator.class)
@Target({ElementType.FIELD, ElementType.RECORD_COMPONENT, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface IndianPincode {
    String message() default "Invalid Indian pincode";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class IndianPincodeValidator implements ConstraintValidator<IndianPincode, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return value == null || value.matches("[1-9]\\\\d{5}");
    }
}

public record AddressRequest(@NotBlank String city, @NotBlank @IndianPincode String pincode) { }`,
    },
  ],
  quiz: [
    {
      question: 'For the value "   " (three spaces), which constraint FAILS?',
      options: ['@NotNull', '@NotEmpty', '@Size(max=5)', '@NotBlank'],
      answer: 3,
      explanation: '@NotBlank requires at least one non-whitespace character.',
    },
    {
      question: 'What must be present for constraints on a @RequestBody to run?',
      options: ['@Valid (or @Validated) on the parameter', '@Transactional', '@ResponseBody', 'Nothing, they run automatically'],
      answer: 0,
      explanation: 'Without @Valid the annotations are ignored.',
    },
    {
      question: 'Which exception does a failed @Valid @RequestBody throw?',
      options: ['NullPointerException', 'HttpMessageNotReadableException', 'MethodArgumentNotValidException', 'DataIntegrityViolationException'],
      answer: 2,
      explanation: 'MethodArgumentNotValidException, mapped to 400.',
    },
    {
      question: 'Which import is correct in Spring Boot 3?',
      options: ['javax.validation.constraints.NotBlank', 'jakarta.validation.constraints.NotBlank', 'org.hibernate.NotBlank', 'spring.validation.NotBlank'],
      answer: 1,
      explanation: 'Boot 3 uses Jakarta EE namespaces.',
    },
    {
      question: 'To enable @Min on a @PathVariable, you need:',
      options: ['@Valid on the method', '@EnableValidation', '@Validated on the controller class', 'Nothing'],
      answer: 2,
      explanation: '@Validated on the class enables method-parameter validation.',
    },
  ],
};
