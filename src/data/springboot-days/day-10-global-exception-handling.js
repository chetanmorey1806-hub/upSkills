export default {
  id: 'day-10-global-exception-handling',
  title: 'Global Exception Handling with @ControllerAdvice',
  module: 'Module 2: REST APIs',
  day: 10,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Handle all errors of a REST API in one place with @RestControllerAdvice and @ExceptionHandler, return a consistent JSON error format (custom ErrorResponse and RFC 7807 ProblemDetail), and map validation, not-found, conflict, bad JSON, type mismatch and unexpected errors to the right status codes.',
  objectives: [
    'Explain why scattered try-catch blocks in controllers are bad',
    'Create custom exceptions (ResourceNotFoundException, DuplicateResourceException)',
    'Write a @RestControllerAdvice with @ExceptionHandler methods for each error type',
    'Return a consistent error body with timestamp, status, error, message, path and field errors',
    'Use Spring 6 ProblemDetail (RFC 7807) and ResponseStatusException',
  ],
  theory: [
    {
      heading: 'The Problem: Error Handling Everywhere',
      content:
        'Without central handling, every controller method has try-catch blocks, each returns errors in a different shape ({"msg":...} here, {"error":...} there), and unexpected exceptions leak stack traces. The frontend team cannot write one generic error handler.\n\nSolution: let services THROW meaningful exceptions, and handle them in ONE class annotated with @RestControllerAdvice.\n\nAnalogy: instead of every shop in a mall having its own complaint desk with different forms, the mall has one customer-care centre with one standard form.',
    },
    {
      heading: '@ControllerAdvice, @RestControllerAdvice and @ExceptionHandler',
      content:
        '@ExceptionHandler(SomeException.class) marks a method that handles that exception. Inside a controller it only applies to that controller. Inside a class annotated with @ControllerAdvice it applies to ALL controllers (global).\n\n@RestControllerAdvice = @ControllerAdvice + @ResponseBody, so the handler return value is written as JSON.\n\nFlow in words: Controller -> Service throws ResourceNotFoundException -> exception travels up -> DispatcherServlet asks ExceptionHandlerExceptionResolver -> finds the matching @ExceptionHandler in the advice -> builds ResponseEntity<ErrorResponse> -> JSON 404 to the client.',
      syntax: '@RestControllerAdvice\npublic class GlobalExceptionHandler {\n    @ExceptionHandler(ResourceNotFoundException.class)\n    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException ex, HttpServletRequest req) { ... }\n}',
      points: [
        'Most specific handler wins: a handler for ResourceNotFoundException is used before one for RuntimeException or Exception',
        'Limit scope: @RestControllerAdvice(basePackages = "com.example.api") or (assignableTypes = StudentController.class)',
        'A local @ExceptionHandler in a controller takes priority over the global advice',
        'Exceptions thrown in filters (before DispatcherServlet, e.g. Spring Security) are NOT handled by @ControllerAdvice',
      ],
    },
    {
      heading: 'Which Exception -> Which Status',
      content: 'A good global handler covers at least these cases:',
      points: [
        'ResourceNotFoundException (custom) -> 404 Not Found',
        'DuplicateResourceException (custom) -> 409 Conflict',
        'MethodArgumentNotValidException (@Valid body failed) -> 400 with field errors',
        'HandlerMethodValidationException / ConstraintViolationException (@Validated params) -> 400',
        'HttpMessageNotReadableException (malformed JSON, wrong enum) -> 400',
        'MethodArgumentTypeMismatchException (/students/abc for Long id) -> 400',
        'MissingServletRequestParameterException (required ?param missing) -> 400',
        'HttpRequestMethodNotSupportedException -> 405; HttpMediaTypeNotSupportedException -> 415',
        'DataIntegrityViolationException (DB unique/foreign key) -> 409',
        'Exception (fallback) -> 500 with a generic message; LOG the real error, never send the stack trace',
      ],
    },
    {
      heading: 'Error Response Formats: Custom vs ProblemDetail',
      content:
        'Option 1 - your own record:\n{ "timestamp": "...", "status": 404, "error": "Not Found", "message": "Student not found with id 9", "path": "/api/students/9", "fieldErrors": null }\n\nOption 2 - RFC 7807 Problem Details (built into Spring 6 / Boot 3): class ProblemDetail with type, title, status, detail, instance and custom properties. Content-Type is application/problem+json. Enable it for built-in Spring MVC exceptions with spring.mvc.problemdetails.enabled=true, or extend ResponseEntityExceptionHandler.\n\nAlso: ResponseStatusException lets you throw a status directly without a custom class: throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student 9 not found").',
      tip: 'Pick ONE format for the whole project and document it, so the React/Angular team can write one interceptor for errors.',
    },
  ],
  examples: [
    {
      title: 'Complete Global Exception Handler for the Student API',
      scenario: 'Replace the @ResponseStatus exceptions and the local handler from Days 8-9 with custom exceptions and a single @RestControllerAdvice that returns a consistent ErrorResponse.',
      steps: [
        'Delete the @ExceptionHandler method from StudentController (we move it to the global class)',
        'Create package exception with ErrorResponse, ResourceNotFoundException, DuplicateResourceException, GlobalExceptionHandler',
        'Update StudentServiceImpl to throw the new exceptions',
        'Restart the app (IntelliJ: Rerun Ctrl+F5; STS: Boot Dashboard > Restart)',
        'Test every error case in Postman (see result)',
      ],
      code: `// ===== exception/ErrorResponse.java =====
package com.example.studentapi.exception;

import java.time.LocalDateTime;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {

    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(LocalDateTime.now(), status, error, message, path, null);
    }
}

// ===== exception/ResourceNotFoundException.java =====
package com.example.studentapi.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(resource + " not found with " + field + " : " + value);
    }
}

// ===== exception/DuplicateResourceException.java =====
package com.example.studentapi.exception;

public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

// ===== exception/GlobalExceptionHandler.java =====
package com.example.studentapi.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(status.value(), status.getReasonPhrase(), message, req.getRequestURI()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(fe -> errors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
        ErrorResponse body = new ErrorResponse(LocalDateTime.now(), 400, "Bad Request",
                "Validation failed", req.getRequestURI(), errors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleBadJson(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Malformed JSON request body", req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String msg = "Parameter '" + ex.getName() + "' has invalid value '" + ex.getValue() + "'";
        return build(HttpStatus.BAD_REQUEST, msg, req);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Required parameter '" + ex.getParameterName() + "' is missing", req);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethod(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "Method " + ex.getMethod() + " is not supported for this URL", req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex, HttpServletRequest req) {
        log.error("Unexpected error on {}", req.getRequestURI(), ex);   // full stack trace in logs only
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again later.", req);
    }
}

// ===== service/StudentServiceImpl.java (changed lines) =====
@Override
public Student create(Student student) {
    if (repository.existsByEmail(student.getEmail())) {
        throw new DuplicateResourceException("Email already registered: " + student.getEmail());
    }
    student.setId(null);
    return repository.save(student);
}

@Override
public Student getById(Long id) {
    return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
}

// ===== controller/StudentController.java - add a demo endpoint for the 500 case =====
@GetMapping("/crash")
public String crash() {
    throw new IllegalStateException("Database password is admin123");  // must NOT reach the client
}`,
      result: `1) GET http://localhost:8080/api/students/99
404 Not Found
{
  "timestamp": "2026-11-17T11:05:12.481",
  "status": 404,
  "error": "Not Found",
  "message": "Student not found with id : 99",
  "path": "/api/students/99"
}

2) POST http://localhost:8080/api/students  (email already used)
{ "name": "Meena", "email": "ravi@college.edu", "course": "Java", "age": 21 }
409 Conflict
{ "timestamp": "...", "status": 409, "error": "Conflict",
  "message": "Email already registered: ravi@college.edu", "path": "/api/students" }

3) POST http://localhost:8080/api/students
{ "name": "", "email": "bad", "course": "Java", "age": 10 }
400 Bad Request
{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "Validation failed",
  "path": "/api/students",
  "fieldErrors": { "name": "Name is required", "email": "Invalid email format", "age": "Age must be at least 17" } }

4) POST http://localhost:8080/api/students   body: { "name": "Ravi", }   (broken JSON)
400  { ..., "message": "Malformed JSON request body", "path": "/api/students" }

5) GET http://localhost:8080/api/students/abc
400  { ..., "message": "Parameter 'id' has invalid value 'abc'", "path": "/api/students/abc" }

6) PATCH http://localhost:8080/api/students   (no PATCH on the collection URL)
405  { ..., "message": "Method PATCH is not supported for this URL", "path": "/api/students" }

7) GET http://localhost:8080/api/students/crash
500  { ..., "message": "Something went wrong. Please try again later.", "path": "/api/students/crash" }
Console: ERROR ... Unexpected error on /api/students/crash
         java.lang.IllegalStateException: Database password is admin123 ...`,
      explanation: 'Every error now has the same JSON shape, so the frontend can always read "message" and "fieldErrors". Services just throw exceptions; they do not know about HTTP. The fallback handler protects secrets: the real message is only in the server logs. The /crash URL does not clash with /{id} because Spring prefers literal path segments over path variables.',
    },
    {
      title: 'RFC 7807 ProblemDetail with ResponseEntityExceptionHandler',
      scenario: 'Use Spring 6 ProblemDetail as the error format. Extend ResponseEntityExceptionHandler so all built-in Spring MVC exceptions also return problem+json.',
      steps: [
        'Comment out @RestControllerAdvice on GlobalExceptionHandler (only one global style at a time)',
        'Create ProblemDetailsHandler in package exception',
        'Restart and call GET /api/students/99 and an invalid POST in Postman',
        'Check the response Content-Type header: application/problem+json',
      ],
      code: `package com.example.studentapi.exception;

import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class ProblemDetailsHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Resource Not Found");
        pd.setType(URI.create("https://api.college.edu/errors/not-found"));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ProblemDetail handleDuplicate(DuplicateResourceException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        pd.setTitle("Duplicate Resource");
        return pd;
    }

    // Override the built-in handling of @Valid failures to add field errors
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode status,
                                                                  WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(fe -> errors.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        pd.setTitle("Invalid Request");
        pd.setProperty("fieldErrors", errors);
        return ResponseEntity.badRequest().body(pd);
    }
}`,
      result: `GET http://localhost:8080/api/students/99
404 Not Found
Content-Type: application/problem+json
{
  "type": "https://api.college.edu/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Student not found with id : 99",
  "instance": "/api/students/99",
  "timestamp": "2026-11-17T05:35:12.481Z"
}

POST http://localhost:8080/api/students   { "name": "", "email": "x", "course": "Java", "age": 22 }
400 Bad Request
{
  "type": "about:blank",
  "title": "Invalid Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/api/students",
  "fieldErrors": { "name": "Name is required", "email": "Invalid email format" }
}

GET http://localhost:8080/api/students/abc  (handled by the base class)
400  { "type": "about:blank", "title": "Bad Request", "status": 400,
       "detail": "Failed to convert 'id' with value: 'abc'", "instance": "/api/students/abc" }`,
      explanation: 'ProblemDetail is a standard error format understood by many tools. Spring fills "instance" with the request path automatically. ResponseEntityExceptionHandler already handles ~15 standard Spring MVC exceptions (405, 415, missing params, type mismatch) in ProblemDetail form; we only override what we want to customise.',
    },
    {
      title: 'ResponseStatusException and Advice Scoping',
      scenario: 'Throw HTTP errors quickly without custom classes, and restrict an advice to one package.',
      steps: [
        'Create LibraryController in package com.example.studentapi.library',
        'Create LibraryExceptionHandler limited to that package',
        'Postman: GET /api/library/books/0 and GET /api/library/books/5',
      ],
      code: `// ===== library/LibraryController.java =====
package com.example.studentapi.library;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    @GetMapping("/books/{id}")
    public Map<String, Object> book(@PathVariable int id) {
        if (id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book id must be positive");
        }
        if (id > 3) {
            throw new IllegalArgumentException("Book " + id + " is not in the library");
        }
        return Map.of("id", id, "title", "Book " + id);
    }
}

// ===== library/LibraryExceptionHandler.java =====
package com.example.studentapi.library;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.example.studentapi.library")
public class LibraryExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handle(IllegalArgumentException ex) {
        return Map.of("libraryError", ex.getMessage());
    }
}`,
      result: `GET http://localhost:8080/api/library/books/2
200 OK  { "id": 2, "title": "Book 2" }

GET http://localhost:8080/api/library/books/0
400 Bad Request  (default error body / ProblemDetail with detail "Book id must be positive")

GET http://localhost:8080/api/library/books/5
404 Not Found  { "libraryError": "Book 5 is not in the library" }`,
      explanation: 'ResponseStatusException carries its own status, useful for quick prototypes. The scoped advice only handles exceptions from controllers in the library package; an IllegalArgumentException from StudentController would still go to the global handler. When multiple advices could match, use @Order to set priority.',
    },
  ],
  interview: [
    { q: 'What is @ControllerAdvice?', a: 'A specialization of @Component that lets you define @ExceptionHandler, @InitBinder and @ModelAttribute methods applied globally across controllers. It is the standard way to centralise exception handling.', level: 'Easy' },
    { q: 'Difference between @ControllerAdvice and @RestControllerAdvice?', a: '@RestControllerAdvice = @ControllerAdvice + @ResponseBody, so handler return values are serialized to the response body (JSON) instead of being treated as view names.', level: 'Easy' },
    { q: 'If both a local @ExceptionHandler in a controller and a global one match, which runs?', a: 'The local handler in the controller has priority over the global advice.', level: 'Medium' },
    { q: 'If handlers exist for Exception and RuntimeException, which handles IllegalStateException?', a: 'The most specific match by exception hierarchy: RuntimeException handler (closest superclass).', level: 'Medium' },
    { q: 'What is ProblemDetail?', a: 'Spring 6 support for RFC 7807 "Problem Details for HTTP APIs": a standard JSON error with type, title, status, detail, instance and extension properties, served as application/problem+json.', level: 'Medium' },
    { q: 'What is ResponseEntityExceptionHandler?', a: 'A convenient base class for @ControllerAdvice that already handles standard Spring MVC exceptions and returns ProblemDetail bodies; you override methods like handleMethodArgumentNotValid to customise.', level: 'Hard' },
    { q: 'Why should a 500 response not include the exception message?', a: 'It can leak internal details (SQL, class names, passwords, file paths) which is a security risk. Log the full error server-side and return a generic message, possibly with a correlation id.', level: 'Medium' },
    { q: 'Can @ControllerAdvice handle exceptions thrown in a servlet filter?', a: 'No, filters run before DispatcherServlet. Handle them in the filter itself or with Spring Security AuthenticationEntryPoint/AccessDeniedHandler.', level: 'Hard' },
    { q: 'How do you map a custom exception to a status without an advice?', a: 'Annotate the exception class with @ResponseStatus(HttpStatus.X) or throw ResponseStatusException.', level: 'Easy' },
    { q: 'Which exception is thrown for malformed JSON?', a: 'HttpMessageNotReadableException (400).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a handler for DataIntegrityViolationException that returns 409 with message "Database constraint violated".',
      hint: 'It comes from org.springframework.dao.',
      solution: `@ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
public ResponseEntity<ErrorResponse> handleDb(DataIntegrityViolationException ex, HttpServletRequest req) {
    log.warn("DB constraint: {}", ex.getMostSpecificCause().getMessage());
    return build(HttpStatus.CONFLICT, "Database constraint violated", req);
}`,
    },
    {
      task: 'Create an InsufficientBalanceException(double required, double available) for a bank API and map it to 422 Unprocessable Entity with both values in the response.',
      hint: 'Add getters to the exception and use a Map body or extra fields.',
      solution: `public class InsufficientBalanceException extends RuntimeException {
    private final double required;
    private final double available;
    public InsufficientBalanceException(double required, double available) {
        super("Insufficient balance");
        this.required = required;
        this.available = available;
    }
    public double getRequired() { return required; }
    public double getAvailable() { return available; }
}

@ExceptionHandler(InsufficientBalanceException.class)
public ResponseEntity<Map<String, Object>> handleBalance(InsufficientBalanceException ex) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("status", 422);
    body.put("message", ex.getMessage());
    body.put("required", ex.getRequired());
    body.put("available", ex.getAvailable());
    return ResponseEntity.unprocessableEntity().body(body);
}
// -> 422 {"status":422,"message":"Insufficient balance","required":5000.0,"available":1200.0}`,
    },
    {
      task: 'Add a unique errorId (UUID) to every 500 response and log it, so support can match a user complaint with the log line.',
      hint: 'UUID.randomUUID().toString().',
      solution: `@ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, Object>> handleAll(Exception ex, HttpServletRequest req) {
    String errorId = UUID.randomUUID().toString();
    log.error("errorId={} path={}", errorId, req.getRequestURI(), ex);
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("status", 500);
    body.put("message", "Internal error. Quote this id to support.");
    body.put("errorId", errorId);
    return ResponseEntity.internalServerError().body(body);
}`,
    },
    {
      task: 'Handle HandlerMethodValidationException (from @Validated @PathVariable @Min(1)) returning 400 with the list of messages.',
      hint: 'ex.getAllErrors() returns MessageSourceResolvable items (Spring 6.1+).',
      solution: `@ExceptionHandler(HandlerMethodValidationException.class)
public ResponseEntity<Map<String, Object>> handleParamValidation(HandlerMethodValidationException ex) {
    List<String> messages = ex.getAllErrors().stream()
            .map(MessageSourceResolvable::getDefaultMessage)
            .toList();
    return ResponseEntity.badRequest().body(Map.of("status", 400, "errors", messages));
}
// GET /api/orders/0 -> 400 {"status":400,"errors":["id must be >= 1"]}`,
    },
  ],
  quiz: [
    {
      question: 'Which annotation makes exception handlers apply to all controllers and return JSON?',
      options: ['@RestControllerAdvice', '@ExceptionHandler alone', '@ControllerScan', '@ResponseStatus'],
      answer: 0,
      explanation: '@RestControllerAdvice = global + @ResponseBody.',
    },
    {
      question: 'Malformed JSON body results in which exception?',
      options: ['MethodArgumentNotValidException', 'NullPointerException', 'HttpMessageNotReadableException', 'TypeMismatchException'],
      answer: 2,
      explanation: 'Jackson cannot parse the body, so HttpMessageNotReadableException is thrown.',
    },
    {
      question: 'Content-Type of a ProblemDetail response is:',
      options: ['text/plain', 'application/xml', 'application/error+json', 'application/problem+json'],
      answer: 3,
      explanation: 'RFC 7807 defines application/problem+json.',
    },
    {
      question: 'Best response for an unexpected NullPointerException in production:',
      options: ['500 with the full stack trace', '500 with a generic message; log details on the server', '200 with null', '404'],
      answer: 1,
      explanation: 'Never expose internals to clients.',
    },
    {
      question: 'Exceptions thrown inside a servlet Filter are handled by @ControllerAdvice.',
      options: ['True always', 'True only for RuntimeException', 'False, filters run before DispatcherServlet', 'True if @Order is set'],
      answer: 2,
      explanation: '@ControllerAdvice works only for exceptions raised during handler execution in DispatcherServlet.',
    },
  ],
};
