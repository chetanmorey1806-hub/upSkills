export default {
  lesson: 'day-13-mvc-forms-validation-exceptions',
  minutes: 25,
  intro: 'Bind forms with @ModelAttribute, validate with Jakarta Bean Validation and BindingResult, and handle errors with @ControllerAdvice.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which are real **Jakarta Bean Validation** annotations? (choose all that apply)',
      options: ['@NotBlank', '@Email', '@Min', '@Size', '@Pattern', '@Required', '@ValidEmail'],
      answers: [0, 1, 2, 3, 4],
      explain: 'Common constraints: `@NotNull`, `@NotEmpty`, `@NotBlank` (not null and not only spaces), `@Size(min, max)`, `@Min`/`@Max`, `@Email`, `@Pattern(regexp)`, `@Past`/`@Future`. They come from `jakarta.validation.constraints` and need an implementation such as Hibernate Validator.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the check that redisplays the form when validation fails:
\`\`\`
@PostMapping("/students")
public String save(@Valid @ModelAttribute("student") Student student,
                   BindingResult result) {
    if (result.____()) {
        return "student-form";
    }
    service.save(student);
    return "redirect:/students";
}
\`\`\``,
      example: { title: 'checking one field', code: 'if (result.hasFieldErrors("email")) { ... }' },
      accept: ['hasErrors', 'hasErrors()'],
      caseSensitive: true,
      explain: '`hasErrors()` is true when any constraint failed or a value could not be converted (e.g. "abc" for an int). Returning the form view shows the messages with `<form:errors path="..."/>` while keeping what the user typed.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The form is submitted with: name = `"  "`, email = `"asha@gmail.com"`, marks = `120`, phone = `"98765"`. What does this print?',
      example: { title: 'counting errors', text: '`result.getErrorCount()` = number of failed constraints. Each field is checked against **all** its annotations.' },
      code: `public class Student {
    @NotBlank(message = "Name is required")
    private String name;
    @Email(message = "Invalid email")
    private String email;
    @Min(0) @Max(100)
    private int marks;
    @Size(min = 10, max = 10, message = "Phone must have 10 digits")
    private String phone;
}

// in the controller, after @Valid
System.out.println("Errors: " + result.getErrorCount());
System.out.println(result.hasFieldErrors("email"));`,
      expected: 'Errors: 3\nfalse',
      explain: '`"  "` fails @NotBlank (only spaces), 120 fails @Max(100), and "98765" has 5 characters so @Size fails: 3 errors. The email is valid, so `hasFieldErrors("email")` is false. (`@NotEmpty` would have accepted "  ".)',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**The same validation idea in JavaScript** (not Java). Write `validateStudent(s)` that returns an object of `field → message` (empty object `{}` when everything is valid), like BindingResult\'s field errors:\n- `name`: required, not just spaces → `"Name is required"`\n- `email`: must look like `x@y.z` → `"Invalid email"`\n- `marks`: must be a number from 0 to 100 → `"Marks must be between 0 and 100"`',
      example: { title: 'collecting errors', code: 'const errors = {};\nif (!s.city || !s.city.trim()) errors.city = "City is required";\nreturn errors;' },
      starter: 'function validateStudent(s) {\n  const errors = {};\n  // TODO: name, email, marks\n  return undefined;\n}\n',
      solution: 'function validateStudent(s) {\n  const errors = {};\n  if (!s.name || !s.name.trim()) errors.name = "Name is required";\n  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(s.email || "")) errors.email = "Invalid email";\n  if (typeof s.marks !== "number" || s.marks < 0 || s.marks > 100) errors.marks = "Marks must be between 0 and 100";\n  return errors;\n}\n',
      tests: [
        { call: 'validateStudent({ name: "Asha", email: "asha@gmail.com", marks: 88 })', expect: {}, msg: 'A valid student has no errors' },
        { call: 'validateStudent({ name: "   ", email: "asha@gmail.com", marks: 88 })', expect: { name: 'Name is required' } },
        { call: 'validateStudent({ name: "Rohan", email: "rohan.gmail.com", marks: 72 })', expect: { email: 'Invalid email' } },
        { call: 'validateStudent({ name: "Sneha", email: "sneha@gmail.com", marks: 120 })', expect: { marks: 'Marks must be between 0 and 100' } },
        { call: 'validateStudent({ name: "", email: "x", marks: -5 })', expect: { name: 'Name is required', email: 'Invalid email', marks: 'Marks must be between 0 and 100' }, msg: 'All failing fields are reported together' },
      ],
      explain: 'Like Bean Validation, every rule is checked and **all** errors are reported at once, keyed by field, so the form can show each message next to its input. In Spring you declare these rules as annotations instead of writing if-statements.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which class-level annotation makes a class hold `@ExceptionHandler` methods that apply to **all** controllers? (with @)',
      example: { title: 'a handler method', code: '@ExceptionHandler(StudentNotFoundException.class)\npublic String notFound(StudentNotFoundException ex, Model model) {\n    model.addAttribute("msg", ex.getMessage());\n    return "error/404";\n}' },
      accept: ['@ControllerAdvice', '@RestControllerAdvice'],
      caseSensitive: true,
      explain: '`@ControllerAdvice` (or `@RestControllerAdvice` for JSON APIs) is a global place for exception handling, so every controller does not need its own try/catch. An `@ExceptionHandler` inside one controller only applies to that controller.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A developer writes `save(@Valid Student student, Model model, BindingResult result)`. Invalid input now produces an error page (400) instead of redisplaying the form. Why?',
      options: [
        'BindingResult must come immediately after the @Valid parameter it belongs to',
        '@Valid only works with GET',
        'Model must be the first parameter',
        'BindingResult must be a field, not a parameter',
      ],
      answer: 0,
      explain: 'Spring links a `BindingResult` to the parameter **directly before it**. With Model in between, Spring finds no BindingResult for `student` and throws a `MethodArgumentNotValidException`/`BindException` instead of letting you handle the errors.',
    },
  ],
};
