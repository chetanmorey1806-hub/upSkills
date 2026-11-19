export default {
  lesson: 'day-09-validation-bean-validation',
  minutes: 22,
  intro: 'Pick the right Bean Validation constraints, trigger them with @Valid/@Validated and predict which fields fail.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A client sends `"name": "   "` (only spaces). Which constraint rejects it?',
      options: ['@NotNull', '@NotEmpty', '@NotBlank', '@Size(min = 1)'],
      answer: 2,
      explain: '`@NotNull` only rejects null. `@NotEmpty` rejects null and "" but accepts "   " (length 3). **@NotBlank** rejects null, empty and whitespace-only strings - the right choice for names. `@Size(min = 1)` also accepts the 3 spaces.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The DTO has constraints, but invalid data is still saved. Complete the parameter annotation that triggers validation:\n```\n@PostMapping\npublic ResponseEntity<StudentDto> create(??? @RequestBody StudentDto dto) { ... }\n```',
      example: { title: 'needed dependency', code: '<artifactId>spring-boot-starter-validation</artifactId>' },
      accept: ['@Valid', '@Validated'],
      explain: 'Constraints are only checked when the parameter is marked **@Valid** (jakarta.validation) or `@Validated`. Forgetting it (or forgetting `spring-boot-starter-validation`) is the #1 reason "validation does not work".',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This JSON is POSTed to the `create` endpoint above (with `@Valid`). Type the **names of the fields that fail validation**, one per line, in the order they are declared in the class.',
      example: { title: 'reading a constraint', code: '@Min(18) int age;   // 17 fails, 18 passes' },
      code: `public class StudentDto {
    @NotBlank             private String name;
    @Email                private String email;
    @Min(0) @Max(100)     private int marks;
    @Size(min = 10, max = 10) private String mobile;
    @NotNull              private String city;
}

{ "name": "Asha", "email": "asha-at-gmail.com",
  "marks": 105, "mobile": "9876543210" }`,
      expected: 'email\nmarks\ncity',
      explain: '`name` is fine. `email` has no @ → fails @Email. `marks` 105 > 100 → fails @Max. `mobile` has exactly 10 characters → passes. `city` is missing → null → fails @NotNull. All errors are collected together, not just the first one.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'When `@Valid` fails on a `@RequestBody`, which exception does Spring MVC throw (you handle it to return a clean 400 response)?',
      example: { title: 'handling it', code: '@ExceptionHandler(???.class)\npublic ResponseEntity<Map<String,String>> onInvalid(??? ex) { ... }' },
      accept: ['MethodArgumentNotValidException', 'org.springframework.web.bind.MethodArgumentNotValidException'],
      explain: '**MethodArgumentNotValidException** carries `getBindingResult().getFieldErrors()`, which you turn into `{ "email": "must be a well-formed email address", ... }`. Validation of `@PathVariable`/`@RequestParam` with `@Validated` throws `ConstraintViolationException` (or HandlerMethodValidationException in Boot 3.2+) instead.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The handler below runs for the failed request from task 3 (`email`, `marks`, `city` failed). What is the **HTTP status code** and how many entries are in the returned map? Type two lines: the status, then the count.',
      example: { title: 'a field error', text: 'FieldError.getField() → "email", getDefaultMessage() → "must be a well-formed email address"' },
      code: `@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, String>> onInvalid(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors()
      .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
    return ResponseEntity.badRequest().body(errors);
}`,
      expected: '400\n3',
      explain: '`ResponseEntity.badRequest()` = **400**. One entry per failing field: email, marks, city → **3**. Returning field → message pairs lets the React form show the error next to each input.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'To validate @PathVariable / @RequestParam constraints like @Min(1), the controller class needs @Validated',
        'A nested object field must be marked @Valid for its own constraints to be checked',
        'You can write a custom constraint with @Constraint and a ConstraintValidator class',
        '@Email also checks that the mailbox really exists',
      ],
      answers: [0, 1, 2],
      explain: 'Method-parameter validation needs **@Validated** on the class. Validation cascades into nested objects/lists only with **@Valid** on the field. Custom constraints = annotation + `ConstraintValidator`. `@Email` only checks the format, never the real mailbox.',
    },
  ],
};
