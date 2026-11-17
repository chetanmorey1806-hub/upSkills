export default {
  id: 'day-13-mvc-forms-validation-exceptions',
  title: 'Spring MVC Forms, Validation and Exception Handling',
  module: 'Module 4: Spring MVC',
  day: 13,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Build HTML forms bound to Java objects with @ModelAttribute and Spring form tags, validate input with Jakarta Bean Validation (@NotBlank, @Email, @Min...) and BindingResult, and handle errors centrally with @ExceptionHandler, @ControllerAdvice and @ResponseStatus.`,
  objectives: [
    `Bind form fields to an object with @ModelAttribute and the Spring form tag library`,
    `Add Bean Validation (Hibernate Validator 8, jakarta.validation) and show field errors`,
    `Use @Valid and BindingResult correctly (order matters)`,
    `Handle exceptions with @ExceptionHandler, @ControllerAdvice and @ResponseStatus`,
    `Simulate the validate -> redisplay / save -> redirect flow in plain Java`,
  ],
  theory: [
    {
      heading: 'Form binding with @ModelAttribute',
      content: `Instead of reading every field with @RequestParam, Spring can create an object and fill it from request parameters whose names match property names (name -> setName). This is data binding. Analogy: a pre-printed form at the bank: each box (field) maps to a column in their register (object property). The GET handler puts an empty object in the model so the form can render; the POST handler receives the filled object.`,
      syntax: `@GetMapping("/register")
public String showForm(Model model) {
    model.addAttribute("student", new StudentForm());
    return "register";
}

@PostMapping("/register")
public String submit(@ModelAttribute("student") StudentForm form) { ... }`,
    },
    {
      heading: 'Spring form tag library',
      content: `The tags in http://www.springframework.org/tags/form bind HTML inputs to model attributes, keep entered values after a validation failure, and print errors.`,
      syntax: `<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<form:form modelAttribute="student" action="register" method="post">
    Name:  <form:input path="name"/>   <form:errors path="name" cssClass="err"/>
    Email: <form:input path="email"/>  <form:errors path="email" cssClass="err"/>
    Age:   <form:input path="age" type="number"/> <form:errors path="age" cssClass="err"/>
    Course: <form:select path="course" items="\${courses}"/>
    <form:checkbox path="agree"/> I agree
    <button type="submit">Register</button>
</form:form>`,
      points: [
        `form:input, form:password, form:textarea, form:select, form:radiobuttons, form:checkbox, form:hidden, form:errors`,
        `path = property name on the bound object`,
        `form:form automatically adds the CSRF token when Spring Security is used`,
      ],
    },
    {
      heading: 'Bean Validation (Jakarta Validation 3.0)',
      content: `Put constraint annotations on fields; Hibernate Validator (the reference implementation) checks them. In Spring 6 use jakarta.validation.constraints.*. Common constraints:`,
      points: [
        `@NotNull (not null), @NotEmpty (not null and not empty), @NotBlank (not null and has non-space text)`,
        `@Size(min, max) for String/collection length`,
        `@Min, @Max, @Positive, @PositiveOrZero for numbers`,
        `@Email, @Pattern(regexp = "...")`,
        `@Past, @Future for dates`,
        `message = "..." customises the error text`,
      ],
      syntax: `<dependency>
  <groupId>org.hibernate.validator</groupId>
  <artifactId>hibernate-validator</artifactId>
  <version>8.0.1.Final</version>
</dependency>
<!-- Tomcat 10.1 already provides Jakarta EL; for standalone tests add org.glassfish.expressly:expressly 5.0.0 -->`,
    },
    {
      heading: '@Valid and BindingResult',
      content: `Add @Valid before @ModelAttribute to trigger validation. Put BindingResult IMMEDIATELY after the validated parameter; it receives the errors. If hasErrors(), return the same form view (entered values and errors are shown). If you forget BindingResult, Spring throws MethodArgumentNotValidException / BindException and the user sees an error page. Type conversion errors (typing "abc" in an int field) also land in BindingResult.`,
      syntax: `@PostMapping("/register")
public String submit(@Valid @ModelAttribute("student") StudentForm form,
                     BindingResult result, RedirectAttributes ra) {
    if (result.hasErrors()) return "register";     // show form again with errors
    service.save(form);
    ra.addFlashAttribute("msg", "Registered " + form.getName());
    return "redirect:/students";
}`,
      tip: `Common mistakes: BindingResult not directly after the @Valid parameter; importing javax.validation (ignored by Spring 6); forgetting the hibernate-validator dependency, so annotations silently do nothing.`,
    },
    {
      heading: 'Exception handling: @ExceptionHandler and @ControllerAdvice',
      content: `Instead of try/catch in every controller method, declare handler methods. @ExceptionHandler(StudentNotFoundException.class) inside a controller handles that exception for that controller. A class annotated with @ControllerAdvice applies its @ExceptionHandler methods to ALL controllers (global handling). @ResponseStatus(HttpStatus.NOT_FOUND) on a custom exception sets the HTTP status automatically. Analogy: instead of every employee dealing with angry customers, a single complaints desk (ControllerAdvice) handles them consistently.`,
      syntax: `@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(StudentNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String notFound(StudentNotFoundException ex, Model model) {
        model.addAttribute("error", ex.getMessage());
        return "error/404";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String generic(Exception ex, Model model) {
        model.addAttribute("error", "Something went wrong");
        return "error/500";
    }
}`,
      points: [
        `The most specific exception handler wins`,
        `@RestControllerAdvice = @ControllerAdvice + @ResponseBody (returns JSON errors)`,
        `ProblemDetail (RFC 7807) support was added in Spring 6 for REST error bodies`,
      ],
    },
  ],
  examples: [
    {
      title: 'Validate, redisplay and handle exceptions (plain Java simulation)',
      scenario: `We mimic what Spring MVC does: validate a submitted form, return the form view with errors or save and redirect, and route exceptions to "advice" handlers that pick an error view. Runs in the browser IDE.`,
      steps: [
        'Create Main.java and paste the code',
        'Click Run ▶',
        'Match: validate() = Bean Validation, errors map = BindingResult, dispatch() = @ControllerAdvice',
      ],
      code: `import java.util.*;

record StudentForm(String name, String email, int age) { }

class StudentNotFoundException extends RuntimeException {
    StudentNotFoundException(String msg) { super(msg); }
}

interface Handler { String run(); }

public class Main {
    // like @NotBlank @Size(min=3,max=30) name, @Email email, @Min(18) @Max(60) age
    static Map<String, String> validate(StudentForm f) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (f.name() == null || f.name().isBlank()) errors.put("name", "Name is required");
        else if (f.name().length() < 3 || f.name().length() > 30) errors.put("name", "Name must be 3-30 characters");
        if (f.email() == null || !f.email().matches("^[\\\\w.]+@[\\\\w.]+\\\\.[a-z]{2,}$")) errors.put("email", "Enter a valid email");
        if (f.age() < 18 || f.age() > 60) errors.put("age", "Age must be between 18 and 60");
        return errors;
    }

    // like @PostMapping("/register") with @Valid + BindingResult
    static String submit(StudentForm f) {
        Map<String, String> errors = validate(f);
        if (!errors.isEmpty()) {
            System.out.println("Form errors: " + errors);
            return "register";
        }
        System.out.println("Saved " + f.name());
        return "redirect:/students";
    }

    static String findStudent(int id) {
        if (id == 1) { System.out.println("Found Asha"); return "studentDetails"; }
        throw new StudentNotFoundException("Student " + id + " not found");
    }

    // like @ControllerAdvice with two @ExceptionHandler methods
    static String dispatch(Handler h) {
        try {
            return h.run();
        } catch (StudentNotFoundException e) {
            System.out.println("@ExceptionHandler: " + e.getMessage());
            return "error/404";
        } catch (RuntimeException e) {
            System.out.println("@ExceptionHandler(generic): " + e.getMessage());
            return "error/500";
        }
    }

    public static void main(String[] args) {
        System.out.println("View: " + submit(new StudentForm("Asha", "asha@mail.com", 22)));
        System.out.println("View: " + submit(new StudentForm("Al", "al@mail", 15)));
        System.out.println("View: " + submit(new StudentForm(" ", "x@y.in", 30)));

        System.out.println("View: " + dispatch(() -> findStudent(1)));
        System.out.println("View: " + dispatch(() -> findStudent(99)));
        System.out.println("View: " + dispatch(() -> { throw new IllegalStateException("DB down"); }));
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

record StudentForm(String name, String email, int age) { }

class StudentNotFoundException extends RuntimeException {
    StudentNotFoundException(String msg) { super(msg); }
}

interface Handler { String run(); }

public class Main {
    static Map<String, String> validate(StudentForm f) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (f.name() == null || f.name().isBlank()) errors.put("name", "Name is required");
        else if (f.name().length() < 3 || f.name().length() > 30) errors.put("name", "Name must be 3-30 characters");
        if (f.email() == null || !f.email().matches("^[\\\\w.]+@[\\\\w.]+\\\\.[a-z]{2,}$")) errors.put("email", "Enter a valid email");
        if (f.age() < 18 || f.age() > 60) errors.put("age", "Age must be between 18 and 60");
        return errors;
    }

    static String submit(StudentForm f) {
        Map<String, String> errors = validate(f);
        if (!errors.isEmpty()) {
            System.out.println("Form errors: " + errors);
            return "register";
        }
        System.out.println("Saved " + f.name());
        return "redirect:/students";
    }

    static String findStudent(int id) {
        if (id == 1) { System.out.println("Found Asha"); return "studentDetails"; }
        throw new StudentNotFoundException("Student " + id + " not found");
    }

    static String dispatch(Handler h) {
        try {
            return h.run();
        } catch (StudentNotFoundException e) {
            System.out.println("@ExceptionHandler: " + e.getMessage());
            return "error/404";
        } catch (RuntimeException e) {
            System.out.println("@ExceptionHandler(generic): " + e.getMessage());
            return "error/500";
        }
    }

    public static void main(String[] args) {
        System.out.println("View: " + submit(new StudentForm("Asha", "asha@mail.com", 22)));
        System.out.println("View: " + submit(new StudentForm("Al", "al@mail", 15)));
        System.out.println("View: " + submit(new StudentForm(" ", "x@y.in", 30)));

        System.out.println("View: " + dispatch(() -> findStudent(1)));
        System.out.println("View: " + dispatch(() -> findStudent(99)));
        System.out.println("View: " + dispatch(() -> { throw new IllegalStateException("DB down"); }));
    }
}`,
        },
      },
      result: `Saved Asha
View: redirect:/students
Form errors: {name=Name must be 3-30 characters, email=Enter a valid email, age=Age must be between 18 and 60}
View: register
Form errors: {name=Name is required}
View: register
Found Asha
View: studentDetails
@ExceptionHandler: Student 99 not found
View: error/404
@ExceptionHandler(generic): DB down
View: error/500`,
      explanation: `Valid data -> save + redirect. Invalid data -> same form view with all errors collected (Bean Validation reports every failing field, not just the first). "x@y.in" is a valid email, so only the blank name fails. The most specific catch (StudentNotFoundException) wins, like the most specific @ExceptionHandler.`,
    },
    {
      title: 'Registration form with Bean Validation',
      scenario: `A complete Spring MVC registration form with field errors.`,
      steps: [
        'In the Day 11/12 project add hibernate-validator 8.0.1.Final to pom.xml and reload Maven (Eclipse: Alt+F5; IntelliJ: Maven reload)',
        'Create com.demo.model.StudentForm (a class with no-arg constructor, getters, setters) and RegisterController',
        'Create WEB-INF/views/register.jsp and success.jsp',
        'Run on Tomcat 10.1, open /spring-mvc/register and submit empty and valid data',
      ],
      code: `// StudentForm.java
package com.demo.model;
import jakarta.validation.constraints.*;

public class StudentForm {
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 30, message = "Name must be 3-30 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Age must be between 18 and 60")
    @Max(value = 60, message = "Age must be between 18 and 60")
    private Integer age;

    @NotBlank(message = "Choose a course")
    private String course;

    // getters and setters for all fields (generate: Eclipse Source > Generate Getters and Setters; IntelliJ Alt+Insert)
}

// RegisterController.java
package com.demo.controller;
import java.util.List;
import com.demo.model.StudentForm;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class RegisterController {
    @ModelAttribute("courses")                 // added to the model for every request of this controller
    public List<String> courses() { return List.of("Java", "Spring", "React"); }

    @GetMapping("/register")
    public String form(Model model) {
        model.addAttribute("student", new StudentForm());
        return "register";
    }

    @PostMapping("/register")
    public String submit(@Valid @ModelAttribute("student") StudentForm student,
                         BindingResult result, RedirectAttributes ra) {
        if (result.hasErrors()) {
            return "register";
        }
        ra.addFlashAttribute("msg", "Welcome " + student.getName() + "! Registered for " + student.getCourse());
        return "redirect:/success";
    }

    @GetMapping("/success")
    public String success() { return "success"; }
}

<%-- WEB-INF/views/register.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<html><head><style>.err{color:red}</style></head><body>
<h2>Register</h2>
<form:form modelAttribute="student" action="register" method="post">
  Name:   <form:input path="name"/>  <form:errors path="name" cssClass="err"/><br/>
  Email:  <form:input path="email"/> <form:errors path="email" cssClass="err"/><br/>
  Age:    <form:input path="age"/>   <form:errors path="age" cssClass="err"/><br/>
  Course: <form:select path="course">
            <form:option value="" label="--select--"/>
            <form:options items="\${courses}"/>
          </form:select> <form:errors path="course" cssClass="err"/><br/>
  <button type="submit">Register</button>
</form:form>
</body></html>

<%-- WEB-INF/views/success.jsp --%>
<html><body><h2>\${msg}</h2></body></html>`,
      result: `Submit empty form -> page shows in red: "Name is required" (and possibly also the size message), "Email is required", "Age is required", "Choose a course".
Submit name=Al, email=al@x, age=15, course=Java -> "Name must be 3-30 characters" and "Age must be between 18 and 60" (al@x is accepted by Hibernate's @Email, so no email error).
Submit Asha / asha@mail.com / 22 / Spring -> redirect to /success showing "Welcome Asha! Registered for Spring".`,
      explanation: `For an empty name both @NotBlank and @Size fail (empty string has length 0), so two messages can appear; the order of messages for one field is not guaranteed. Hibernate's @Email allows addresses without a dot in the domain (like al@x), which differs from our stricter regex in Example 1; add @Pattern if you need stricter rules. Entered values remain in the inputs because form:input binds to the same object.`,
    },
    {
      title: 'Global exception handling with @ControllerAdvice',
      scenario: `Show a friendly 404 page when a student id is not found, and a 500 page for anything else.`,
      steps: [
        'Create StudentNotFoundException in com.demo.exception',
        'Throw it from StudentController.one() when the id is not found',
        'Create GlobalExceptionHandler (must be inside the scanned package) and error JSPs',
        'Open /spring-mvc/students/99',
      ],
      code: `// StudentNotFoundException.java
package com.demo.exception;
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(int id) { super("Student " + id + " not found"); }
}

// in StudentController
@GetMapping("/{id}")
public String one(@PathVariable int id, Model model) {
    Student s = students.stream().filter(x -> x.id() == id).findFirst()
                        .orElseThrow(() -> new StudentNotFoundException(id));
    model.addAttribute("student", s);
    return "student";
}

// GlobalExceptionHandler.java
package com.demo.controller;
import com.demo.exception.StudentNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(StudentNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String notFound(StudentNotFoundException ex, Model model) {
        model.addAttribute("error", ex.getMessage());
        return "error/404";
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String generic(Exception ex, Model model) {
        model.addAttribute("error", "Something went wrong. Please try later.");
        return "error/500";
    }
}

<%-- WEB-INF/views/error/404.jsp --%>
<html><body><h2>Oops! \${error}</h2><a href="\${pageContext.request.contextPath}/students">Back</a></body></html>`,
      result: `GET /students/99 -> HTTP status 404 with page "Oops! Student 99 not found".
GET /students/abc -> type mismatch; handled by generic handler -> HTTP 500 page "Something went wrong..." (better: add a handler for MethodArgumentTypeMismatchException returning 400).`,
      explanation: `The controller code stays clean (orElseThrow). The advice applies to all controllers. Handler methods may receive the exception, Model, HttpServletRequest, etc. Be careful: a catch-all Exception handler also catches framework exceptions that would otherwise produce correct 4xx codes.`,
    },
    {
      title: '@ResponseStatus on the exception class',
      scenario: `Let Spring set the status without a handler method.`,
      steps: [
        'Annotate the exception class',
        'Remove its specific handler from the advice (keep no catch-all) and test',
      ],
      code: `@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Student not found")
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(int id) { super("Student " + id + " not found"); }
}`,
      result: `GET /students/99 -> Tomcat's default error page: HTTP Status 404 - Student not found`,
      explanation: `ResponseStatusExceptionResolver reads the annotation. Simple, but you cannot render a custom view with model data; @ControllerAdvice is more flexible.`,
    },
  ],
  interview: [
    { q: 'What is @ModelAttribute?', a: 'On a parameter it binds request parameters to an object (and adds it to the model); on a method it adds the return value to the model before every handler of that controller.', level: 'Medium' },
    { q: 'Why must BindingResult come right after the @Valid parameter?', a: 'Spring associates BindingResult with the immediately preceding model attribute; otherwise validation errors cause an exception instead of being captured.', level: 'Medium' },
    { q: '@NotNull vs @NotEmpty vs @NotBlank?', a: '@NotNull: not null. @NotEmpty: not null and size/length > 0. @NotBlank: not null and contains at least one non-whitespace character (Strings only).', level: 'Medium' },
    { q: 'Which validation implementation does Spring use?', a: 'Any Jakarta Bean Validation provider on the classpath, usually Hibernate Validator; Spring adapts it via LocalValidatorFactoryBean (auto-configured by @EnableWebMvc).', level: 'Medium' },
    { q: '@Valid vs @Validated?', a: '@Valid is the standard Jakarta annotation (supports nested validation). @Validated is Spring\'s variant that supports validation groups and method-level validation on beans.', level: 'Hard' },
    { q: 'How do you handle exceptions globally in Spring MVC?', a: 'Use a @ControllerAdvice class with @ExceptionHandler methods (or @RestControllerAdvice for REST).', level: 'Easy' },
    { q: 'What does @ResponseStatus do?', a: 'Sets the HTTP status for a handler method or for an exception class when it is thrown.', level: 'Easy' },
    { q: 'How do you create a custom validation annotation?', a: 'Define an annotation with @Constraint(validatedBy = MyValidator.class), message/groups/payload attributes, and implement ConstraintValidator<MyAnnotation, Type>.', level: 'Hard' },
    { q: 'How are type conversion errors reported?', a: 'They are added to BindingResult as field errors (typeMismatch code) and can be customised in messages.properties.', level: 'Hard' },
    { q: 'How do you keep entered values after validation fails?', a: 'Return the form view without redirecting; form tags bind to the same model attribute which still contains the submitted values.', level: 'Medium' },
    { q: 'What is ProblemDetail?', a: 'A Spring 6 class implementing RFC 7807 standard error responses for REST APIs (type, title, status, detail, instance).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Plain Java: add a "password" field to StudentForm validation: at least 8 chars and must contain a digit. Test with "abc" and "secret123".',
      hint: 'password.matches(".*\\\\d.*")',
      solution: `record StudentForm(String name, String email, int age, String password) { }
// in validate():
if (f.password() == null || f.password().length() < 8 || !f.password().matches(".*\\\\d.*"))
    errors.put("password", "Password needs 8+ chars and a digit");
// "abc"       -> error added
// "secret123" -> no password error`,
    },
    {
      task: 'Create a Product form (name @NotBlank, price @Positive, quantity @PositiveOrZero) with controller and JSP, redisplaying errors.',
      hint: 'Same pattern as RegisterController.',
      solution: `public class ProductForm {
    @NotBlank private String name;
    @NotNull @Positive private Double price;
    @NotNull @PositiveOrZero private Integer quantity;
    // getters/setters
}
@Controller
public class ProductController {
    @GetMapping("/products/new")
    public String form(Model m) { m.addAttribute("product", new ProductForm()); return "productForm"; }
    @PostMapping("/products")
    public String save(@Valid @ModelAttribute("product") ProductForm p, BindingResult r) {
        if (r.hasErrors()) return "productForm";
        return "redirect:/products";
    }
}`,
    },
    {
      task: 'Write a custom @IndianMobile constraint that accepts 10 digits starting with 6-9.',
      hint: 'ConstraintValidator<IndianMobile, String> with regex [6-9]\\\\d{9}.',
      solution: `@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = IndianMobileValidator.class)
public @interface IndianMobile {
    String message() default "Invalid mobile number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
public class IndianMobileValidator implements ConstraintValidator<IndianMobile, String> {
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return value != null && value.matches("[6-9]\\\\d{9}");
    }
}`,
    },
    {
      task: 'Add a @ControllerAdvice handler for MethodArgumentTypeMismatchException that returns 400 and a "Invalid value" page.',
      hint: '@ResponseStatus(HttpStatus.BAD_REQUEST)',
      solution: `@ExceptionHandler(MethodArgumentTypeMismatchException.class)
@ResponseStatus(HttpStatus.BAD_REQUEST)
public String badValue(MethodArgumentTypeMismatchException ex, Model model) {
    model.addAttribute("error", "Invalid value '" + ex.getValue() + "' for " + ex.getName());
    return "error/400";
}`,
    },
  ],
  quiz: [
    { question: 'Which package holds @NotBlank in Spring 6 projects?', options: ['javax.validation.constraints', 'org.springframework.validation', 'jakarta.validation.constraints', 'java.validation'], answer: 2, explanation: 'Jakarta Validation 3.0 uses jakarta.*.' },
    { question: 'Where must BindingResult be placed?', options: ['Immediately after the @Valid parameter', 'First parameter', 'Anywhere', 'Last parameter always'], answer: 0, explanation: 'It belongs to the preceding model attribute.' },
    { question: 'Which annotation makes exception handlers apply to all controllers?', options: ['@ExceptionHandler', '@ResponseStatus', '@GlobalHandler', '@ControllerAdvice'], answer: 3, explanation: '@ControllerAdvice is global.' },
    { question: '@NotBlank fails for which value?', options: ['"Asha"', '"   "', '" a "', '"0"'], answer: 1, explanation: 'Whitespace-only strings are blank.' },
    { question: 'What renders field errors in a JSP?', options: ['<form:errors path="name"/>', '<c:errors/>', '<spring:error/>', '<form:validate/>'], answer: 0, explanation: 'The form tag library provides form:errors.' },
  ],
};
