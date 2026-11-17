export default {
  id: 'day-092-model-validation-api',
  title: 'Model Validation, Data Annotations, Custom Validation',
  module: 'ASP.NET Core Web API',
  day: 92,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Never trust client input. Validate API request DTOs with Data Annotations ([Required], [StringLength], [Range], [EmailAddress], [RegularExpression], [Compare]), understand the automatic 400 ValidationProblemDetails response of [ApiController], write custom validation attributes and IValidatableObject rules, customize the error response, and see FluentValidation as an alternative.`,
  objectives: [
    'Apply built-in Data Annotation attributes to request DTOs',
    'Read and explain the automatic 400 Bad Request ValidationProblemDetails JSON',
    'Write a custom ValidationAttribute and a cross-field rule with IValidatableObject',
    'Customize the validation error response with InvalidModelStateResponseFactory',
    'Know the difference between input validation (DTO) and business validation (service)',
  ],
  theory: [
    {
      heading: 'Why validate API input?',
      content: `Any client - Postman, a React form, a script written by an attacker - can send any JSON. Without validation, empty names, negative salaries and 5 MB strings reach your database, or cause SQL exceptions that turn into 500 errors. Validate at the edge (the request DTO) so bad data is rejected with a clear 400 Bad Request before your business code runs. Client-side validation in React is for user experience only - the server must always validate again.`,
    },
    {
      heading: 'Built-in Data Annotations',
      content: `Attributes from System.ComponentModel.DataAnnotations are placed on DTO properties. Each has a default error message, which you can override with ErrorMessage. Placeholders: {0} = property (display) name, {1} and {2} = attribute parameters.`,
      points: [
        '[Required] - not null; for strings also not empty or whitespace (AllowEmptyStrings = false)',
        '[StringLength(50, MinimumLength = 2)], [MaxLength(50)], [MinLength(8)]',
        '[Range(18, 60)], [Range(typeof(decimal), "0.01", "999999")]',
        '[EmailAddress], [Phone], [Url], [CreditCard]',
        '[RegularExpression(@"^[A-Z]{3}-[0-9]{4}$", ErrorMessage = "Code must look like ABC-1234")]',
        '[Compare("Password")] - two properties must be equal',
        '.NET 8+: [AllowedValues(".NET", "React")], [DeniedValues("admin")], [Length(2, 10)], [Base64String], Range with MinimumIsExclusive',
        '[Display(Name = "Full name")] changes {0} in messages',
      ],
      syntax: `public class CreateStudentDto
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "{0} must be {2}-{1} characters")]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Range(0, 100)]
    public int Marks { get; set; }
}`,
    },
    {
      heading: 'Automatic validation with [ApiController]',
      content: `Model binding fills the DTO, then validation runs and fills ModelState. Because the controller has [ApiController], the ModelStateInvalidFilter checks ModelState.IsValid BEFORE your action executes; if it is invalid, the framework returns 400 Bad Request with a ValidationProblemDetails body (RFC 9457 problem details). You do not need "if (!ModelState.IsValid) return BadRequest(ModelState);" in API controllers.`,
      syntax: `{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name":  [ "Name is required" ],
    "Marks": [ "The field Marks must be between 0 and 100." ]
  },
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00"
}`,
      tip: 'Non-nullable reference types (string Name) are treated as implicitly [Required] when <Nullable>enable</Nullable> is on. Use string? for truly optional fields.',
    },
    {
      heading: 'Custom validation attribute',
      content: `When no built-in attribute fits, derive from ValidationAttribute and override IsValid(object? value, ValidationContext context). Return ValidationResult.Success when valid, or a new ValidationResult(message, new[] { context.MemberName! }) when invalid. You can inject services through context.GetService<T>(), but keep database checks in the service layer when possible.`,
      syntax: `public class NotFutureDateAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext ctx)
    {
        if (value is DateTime d && d.Date > DateTime.Today)
            return new ValidationResult(ErrorMessage ?? "Date cannot be in the future", new[] { ctx.MemberName! });
        return ValidationResult.Success;
    }
}`,
    },
    {
      heading: 'Cross-field rules with IValidatableObject',
      content: `Some rules involve more than one property: EndDate must be after StartDate; a React batch needs at least 50 marks. Implement IValidatableObject on the DTO and yield ValidationResult objects from Validate(). Important: Validate() runs ONLY when all property attributes passed - so users first see attribute errors, then cross-field errors.`,
      syntax: `public class LeaveRequestDto : IValidatableObject
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext ctx)
    {
        if (To < From)
            yield return new ValidationResult("To must be after From", new[] { nameof(To) });
    }
}`,
    },
    {
      heading: 'Input validation vs business validation, and FluentValidation',
      content: `Data Annotations answer "is this request well-formed?" (required, length, range, format). Business validation answers "is this allowed right now?" (email not already used, department exists, stock available) and needs the database - it belongs in the service layer and usually returns 409 or 400 with a message. FluentValidation is a popular NuGet library that writes rules in a separate class with a fluent syntax (RuleFor(x => x.Name).NotEmpty().Length(2, 50)); it is easier to unit test and supports async rules.`,
      points: [
        'Package: FluentValidation.DependencyInjectionExtensions; register with AddValidatorsFromAssemblyContaining<Program>()',
        'Call await validator.ValidateAsync(dto) in the action or use an endpoint filter',
        '.NET 10 Minimal APIs: builder.Services.AddValidation() validates Data Annotations automatically',
      ],
    },
  ],
  examples: [
    {
      title: 'Console: Data Annotations, custom attribute and IValidatableObject',
      scenario: 'Run the same validation engine that ASP.NET Core uses, directly from a console app.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ValidationDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System.ComponentModel.DataAnnotations;

var inputs = new List<CreateStudentDto>
{
    new() { Name = "Asha", Email = "asha@mail.com", Age = 20, Marks = 88, Course = ".NET",
            Password = "Secret@123", ConfirmPassword = "Secret@123" },
    new() { Name = "", Email = "not-an-email", Age = 15, Marks = 120, Course = "Java",
            Password = "abc", ConfirmPassword = "xyz" },
    new() { Name = "Ravi", Email = "ravi@mail.com", Age = 22, Marks = 40, Course = "React",
            Password = "Ravi@2026", ConfirmPassword = "Ravi@2026" },
};

int n = 1;
foreach (var dto in inputs)
{
    var context = new ValidationContext(dto);
    var errors = new List<ValidationResult>();
    bool ok = Validator.TryValidateObject(dto, context, errors, validateAllProperties: true);

    Console.WriteLine($"Input {n++}: {(ok ? "VALID" : "INVALID")}");
    foreach (var e in errors)
        Console.WriteLine($"  {string.Join(",", e.MemberNames)}: {e.ErrorMessage}");
}

// ---------- DTO ----------
public class CreateStudentDto : IValidatableObject
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 2)]
    public string Name { get; set; } = "";

    [Required]
    [EmailAddress(ErrorMessage = "Email format is invalid")]
    public string Email { get; set; } = "";

    [Range(18, 60, ErrorMessage = "Age must be between 18 and 60")]
    public int Age { get; set; }

    [Range(0, 100)]
    public int Marks { get; set; }

    [AllowedCourses(".NET", "React", "SQL")]
    public string Course { get; set; } = "";

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = "";

    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = "";

    // cross-field rule: runs only if all attributes above passed
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Course == "React" && Marks < 50)
            yield return new ValidationResult("React batch needs at least 50 marks", new[] { nameof(Marks) });
    }
}

// ---------- Custom attribute ----------
public class AllowedCoursesAttribute : ValidationAttribute
{
    private readonly string[] _courses;
    public AllowedCoursesAttribute(params string[] courses) => _courses = courses;

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is string s && _courses.Contains(s))
            return ValidationResult.Success;

        return new ValidationResult(
            $"Course '{value}' is not offered. Allowed: {string.Join(", ", _courses)}",
            new[] { validationContext.MemberName! });
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System.ComponentModel.DataAnnotations;

var inputs = new List<CreateStudentDto>
{
    new() { Name = "Asha", Email = "asha@mail.com", Age = 20, Marks = 88, Course = ".NET",
            Password = "Secret@123", ConfirmPassword = "Secret@123" },
    new() { Name = "", Email = "not-an-email", Age = 15, Marks = 120, Course = "Java",
            Password = "abc", ConfirmPassword = "xyz" },
    new() { Name = "Ravi", Email = "ravi@mail.com", Age = 22, Marks = 40, Course = "React",
            Password = "Ravi@2026", ConfirmPassword = "Ravi@2026" },
};

int n = 1;
foreach (var dto in inputs)
{
    var context = new ValidationContext(dto);
    var errors = new List<ValidationResult>();
    bool ok = Validator.TryValidateObject(dto, context, errors, validateAllProperties: true);

    Console.WriteLine($"Input {n++}: {(ok ? "VALID" : "INVALID")}");
    foreach (var e in errors)
        Console.WriteLine($"  {string.Join(",", e.MemberNames)}: {e.ErrorMessage}");
}

// ---------- DTO ----------
public class CreateStudentDto : IValidatableObject
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 2)]
    public string Name { get; set; } = "";

    [Required]
    [EmailAddress(ErrorMessage = "Email format is invalid")]
    public string Email { get; set; } = "";

    [Range(18, 60, ErrorMessage = "Age must be between 18 and 60")]
    public int Age { get; set; }

    [Range(0, 100)]
    public int Marks { get; set; }

    [AllowedCourses(".NET", "React", "SQL")]
    public string Course { get; set; } = "";

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = "";

    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = "";

    // cross-field rule: runs only if all attributes above passed
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Course == "React" && Marks < 50)
            yield return new ValidationResult("React batch needs at least 50 marks", new[] { nameof(Marks) });
    }
}

// ---------- Custom attribute ----------
public class AllowedCoursesAttribute : ValidationAttribute
{
    private readonly string[] _courses;
    public AllowedCoursesAttribute(params string[] courses) => _courses = courses;

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is string s && _courses.Contains(s))
            return ValidationResult.Success;

        return new ValidationResult(
            $"Course '{value}' is not offered. Allowed: {string.Join(", ", _courses)}",
            new[] { validationContext.MemberName! });
    }
}`,
        },
        stdin: '',
      },
      result: `Input 1: VALID
Input 2: INVALID
  Name: Name is required
  Email: Email format is invalid
  Age: Age must be between 18 and 60
  Marks: The field Marks must be between 0 and 100.
  Course: Course 'Java' is not offered. Allowed: .NET, React, SQL
  Password: Password must be at least 8 characters
  ConfirmPassword: Passwords do not match
Input 3: INVALID
  Marks: React batch needs at least 50 marks`,
      explanation: `For Name only "Name is required" appears: [Required] is checked first and, when it fails, the other attributes of that property are skipped. Marks uses the default Range message. In Input 2 the IValidatableObject rule is never reached because attribute errors exist; Input 3 passes all attributes, so Validate() runs and reports the cross-field error. ASP.NET Core performs exactly these checks (plus binding errors) and puts them into ModelState.`,
    },
    {
      title: 'Validated Student API with automatic 400 responses',
      scenario: 'Validate the input of POST /api/students and see the automatic ValidationProblemDetails response.',
      steps: [
        'Open StudentApi (Days 88-89)',
        'Add folder Validation with AllowedCoursesAttribute.cs (same code as the console example)',
        'Add Dtos/CreateStudentDto.cs and replace the Create action in StudentsController',
        'Press Ctrl+F5; in Swagger expand POST /api/students > Try it out',
        'Execute with the valid body, then with the invalid body',
        'Repeat in Postman: POST https://localhost:7001/api/students > Body > raw > JSON',
      ],
      code: `// Dtos/CreateStudentDto.cs
using System.ComponentModel.DataAnnotations;
using StudentApi.Validation;
namespace StudentApi.Dtos;

public class CreateStudentDto
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "{0} must be {2}-{1} characters")]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress(ErrorMessage = "Email format is invalid")]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [AllowedCourses(".NET", "React", "SQL")]
    public string Course { get; set; } = string.Empty;

    [Range(0, 100)]
    public int Marks { get; set; }

    [RegularExpression(@"^[6-9][0-9]{9}$", ErrorMessage = "Phone must be a 10-digit mobile number")]
    public string? Phone { get; set; }      // optional, validated only when sent
}

// Controllers/StudentsController.cs (Create action)
[HttpPost]
[ProducesResponseType(typeof(Student), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
public async Task<ActionResult<Student>> Create(CreateStudentDto dto)
{
    // No ModelState check needed: [ApiController] already returned 400 if invalid.

    // Business validation (needs the database) -> service layer in real projects
    if (await _db.Students.AnyAsync(s => s.Email == dto.Email))
    {
        ModelState.AddModelError(nameof(dto.Email), "Email already registered");
        return ValidationProblem(ModelState);       // same 400 format as automatic errors
    }

    var student = new Student
    {
        Name = dto.Name.Trim(), Email = dto.Email.ToLowerInvariant(),
        Course = dto.Course, Marks = dto.Marks
    };
    _db.Students.Add(student);
    await _db.SaveChangesAsync();
    return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
}`,
      result: `Valid body:
{ "name": "Meena", "email": "meena@mail.com", "course": "SQL", "marks": 92, "phone": "9876543210" }
-> 201 Created

Invalid body:
{ "name": "M", "email": "meena.mail.com", "course": "Java", "marks": 150, "phone": "12345" }
-> 400 Bad Request
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name":   [ "Name must be 2-50 characters" ],
    "Email":  [ "Email format is invalid" ],
    "Course": [ "Course 'Java' is not offered. Allowed: .NET, React, SQL" ],
    "Marks":  [ "The field Marks must be between 0 and 100." ],
    "Phone":  [ "Phone must be a 10-digit mobile number" ]
  },
  "traceId": "00-..."
}

Existing email (asha@mail.com) -> 400 { ..., "errors": { "Email": [ "Email already registered" ] } }`,
      explanation: `The action body never runs for the invalid request - the ModelStateInvalidFilter short-circuits it. "{0} must be {2}-{1} characters" becomes "Name must be 2-50 characters" because {1} is the maximum length and {2} the minimum. Phone is string? so it is optional; RegularExpression ignores null values. Note "M" fails StringLength, not Required, because it is not empty. The keys in errors are C# property names; the order of keys may differ slightly on your machine.`,
    },
    {
      title: 'Custom error response and camelCase error keys',
      scenario: 'The React team wants a simpler error format: { success, message, errors } with camelCase keys.',
      steps: [
        'Open Program.cs of StudentApi',
        'Replace builder.Services.AddControllers() with the code below',
        'Press Ctrl+F5 and POST the invalid body again in Postman',
      ],
      code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

builder.Services.AddControllers(options =>
{
    // use JSON (camelCase) names in error keys: "name" instead of "Name"
    options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
})
.ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kv => kv.Value!.Errors.Count > 0)
            .ToDictionary(
                kv => kv.Key,
                kv => kv.Value!.Errors.Select(e => e.ErrorMessage).ToArray());

        var body = new
        {
            success = false,
            message = "Validation failed",
            errors
        };
        return new BadRequestObjectResult(body);
    };
});`,
      result: `POST /api/students with { "name": "", "email": "x", "course": ".NET", "marks": 50 }
-> 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name":  [ "Name is required" ],
    "email": [ "Email format is invalid" ]
  }
}`,
      explanation: `InvalidModelStateResponseFactory replaces the default ValidationProblemDetails for every controller with [ApiController]. SystemTextJsonValidationMetadataProvider (.NET 7+) makes ModelState keys follow the JSON property names, which is what JavaScript clients expect. To switch the automatic check off completely (and check ModelState yourself) set options.SuppressModelStateInvalidFilter = true.`,
    },
    {
      title: 'FluentValidation alternative',
      scenario: 'Write the same rules in a validator class, including an async database rule.',
      steps: [
        'Package Manager Console: Install-Package FluentValidation.DependencyInjectionExtensions',
        'Add Validation/CreateStudentValidator.cs',
        'Register validators in Program.cs',
        'Inject IValidator<CreateStudentDto> into the controller and call ValidateAsync',
      ],
      code: `// Validation/CreateStudentValidator.cs
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using StudentApi.Data;
using StudentApi.Dtos;
namespace StudentApi.Validation;

public class CreateStudentValidator : AbstractValidator<CreateStudentDto>
{
    private static readonly string[] Courses = { ".NET", "React", "SQL" };

    public CreateStudentValidator(AppDbContext db)
    {
        RuleFor(x => x.Name).NotEmpty().Length(2, 50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress()
            .MustAsync(async (email, ct) => !await db.Students.AnyAsync(s => s.Email == email, ct))
            .WithMessage("Email already registered");
        RuleFor(x => x.Course).Must(c => Courses.Contains(c))
            .WithMessage(x => $"Course '{x.Course}' is not offered");
        RuleFor(x => x.Marks).InclusiveBetween(0, 100);
        RuleFor(x => x.Phone).Matches("^[6-9][0-9]{9}$").When(x => x.Phone is not null);
    }
}

// Program.cs
builder.Services.AddValidatorsFromAssemblyContaining<Program>();   // scoped by default

// StudentsController
[HttpPost("fluent")]
public async Task<IActionResult> CreateFluent(CreateStudentDto dto,
    [FromServices] IValidator<CreateStudentDto> validator)
{
    var result = await validator.ValidateAsync(dto);
    if (!result.IsValid)
        return ValidationProblem(new ValidationProblemDetails(result.ToDictionary()));
    // ... save as before
    return Ok();
}`,
      result: `POST /api/students/fluent { "name": "A", "email": "asha@mail.com", "course": "Go", "marks": 50 }
-> 400
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name":   [ "'Name' must be between 2 and 50 characters. You entered 1 characters." ],
    "Email":  [ "Email already registered" ],
    "Course": [ "Course 'Go' is not offered" ]
  }
}`,
      explanation: `FluentValidation keeps rules out of the DTO and supports async rules with dependencies (here AppDbContext). result.ToDictionary() converts failures into the same shape as ModelState errors. The automatic ASP.NET Core integration package (FluentValidation.AspNetCore) is no longer recommended by its authors - call ValidateAsync explicitly or from a filter.`,
    },
  ],
  interview: [
    { q: 'What does [ApiController] do for validation?', a: 'It adds the ModelStateInvalidFilter, which automatically returns 400 Bad Request with ValidationProblemDetails when ModelState is invalid, before the action executes.', level: 'Easy' },
    { q: 'What is ModelState?', a: 'A dictionary (ModelStateDictionary) of model binding and validation results for the current request: keys are field names and values hold attempted values and error messages. ModelState.IsValid is false if any error exists.', level: 'Easy' },
    { q: 'Difference between [StringLength], [MaxLength] and [MinLength]?', a: 'StringLength sets maximum (and optional MinimumLength) for strings and is also used by EF Core for column size. MaxLength/MinLength work for strings and arrays; MaxLength also sets EF column size.', level: 'Medium' },
    { q: 'When does IValidatableObject.Validate run?', a: 'Only after all property-level attributes have passed. If any attribute fails, Validate is not called.', level: 'Hard' },
    { q: 'How do you write a custom validation attribute?', a: 'Inherit from ValidationAttribute and override IsValid(object? value, ValidationContext context), returning ValidationResult.Success or a ValidationResult with the message and member name.', level: 'Medium' },
    { q: 'Where should "email must be unique" be validated?', a: 'In the service layer (business validation) because it requires the database, or in an async FluentValidation rule. Data Annotations are for request format. Also keep a unique index in the database as the final guarantee.', level: 'Medium' },
    { q: 'How do you customize the automatic 400 response?', a: 'ConfigureApiBehaviorOptions(o => o.InvalidModelStateResponseFactory = ctx => ...) and return your own IActionResult; or set SuppressModelStateInvalidFilter = true and handle ModelState manually.', level: 'Medium' },
    { q: 'Why is client-side validation not enough?', a: 'Anyone can bypass the browser (Postman, curl, scripts) and send any data. Client validation improves UX; server validation enforces correctness and security.', level: 'Easy' },
    { q: 'What happens with [Required] on a non-nullable int property when the JSON omits it?', a: 'The int gets its default 0, which is not null, so [Required] passes. Use int? with [Required] to force the client to send the value, or [Range] to reject 0.', level: 'Hard' },
    { q: 'What is ValidationProblemDetails?', a: 'A standard error body (RFC 9457 problem details) with type, title, status, traceId and an errors dictionary of field -> messages. Returned by ValidationProblem() and the automatic filter.', level: 'Medium' },
    { q: 'Output question: [StringLength(5, MinimumLength = 2, ErrorMessage = "{0}:{1}:{2}")] on Code, value "A". What message?', a: '"Code:5:2" - {0} is the field name, {1} is maximum length, {2} is minimum length.', level: 'Medium' },
    { q: 'Name three .NET 8 validation attributes that did not exist before.', a: '[AllowedValues], [DeniedValues], [Length(min, max)], [Base64String], and Range properties MinimumIsExclusive/MaximumIsExclusive.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create CreateEmployeeDto with: FirstName required 2-30 chars, Email required valid, Salary decimal range 10000-500000, JoiningDate not in the future (custom attribute NotFutureDate).',
      hint: 'Use Range(typeof(decimal), "10000", "500000").',
      solution: `public class CreateEmployeeDto
{
    [Required, StringLength(30, MinimumLength = 2)] public string FirstName { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Range(typeof(decimal), "10000", "500000")] public decimal Salary { get; set; }
    [NotFutureDate] public DateTime JoiningDate { get; set; }
}
public class NotFutureDateAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext ctx) =>
        value is DateTime d && d.Date > DateTime.Today
            ? new ValidationResult("Joining date cannot be in the future", new[] { ctx.MemberName! })
            : ValidationResult.Success;
}`,
    },
    {
      task: 'Add a BookingDto with CheckIn and CheckOut dates and implement IValidatableObject so CheckOut must be after CheckIn and the stay at most 30 nights.',
      hint: 'Use (CheckOut - CheckIn).TotalDays.',
      solution: `public class BookingDto : IValidatableObject
{
    [Required] public DateTime CheckIn { get; set; }
    [Required] public DateTime CheckOut { get; set; }
    public IEnumerable<ValidationResult> Validate(ValidationContext ctx)
    {
        if (CheckOut <= CheckIn)
            yield return new ValidationResult("CheckOut must be after CheckIn", new[] { nameof(CheckOut) });
        else if ((CheckOut - CheckIn).TotalDays > 30)
            yield return new ValidationResult("Maximum stay is 30 nights", new[] { nameof(CheckOut) });
    }
}`,
    },
    {
      task: 'Make Marks mandatory in JSON: the request { "name": "Asha", "email": "a@b.com", "course": ".NET" } (no marks) must return 400.',
      hint: 'A non-nullable int defaults to 0 and passes [Required].',
      solution: `[Required(ErrorMessage = "Marks is required")]
[Range(0, 100)]
public int? Marks { get; set; }
// Now missing marks -> errors: { "Marks": ["Marks is required"] }`,
    },
    {
      task: 'Write an xUnit test that checks CreateStudentDto with Name = "" produces exactly one error for Name.',
      hint: 'Use Validator.TryValidateObject in the test, just like the console example.',
      solution: `[Fact]
public void Empty_name_is_invalid()
{
    var dto = new CreateStudentDto { Name = "", Email = "a@b.com", Course = ".NET", Marks = 50 };
    var errors = new List<ValidationResult>();
    bool ok = Validator.TryValidateObject(dto, new ValidationContext(dto), errors, true);
    Assert.False(ok);
    Assert.Single(errors, e => e.MemberNames.Contains("Name"));
}`,
    },
    {
      task: 'Add a product code rule: Code must look like "PRD-0001" (3 capital letters, dash, 4 digits).',
      hint: 'RegularExpression with ^ and $ anchors.',
      solution: `[Required]
[RegularExpression(@"^[A-Z]{3}-[0-9]{4}$", ErrorMessage = "Code must look like PRD-0001")]
public string Code { get; set; } = "";`,
    },
  ],
  quiz: [
    { question: 'Which status code does [ApiController] return for an invalid model?', options: ['422 Unprocessable Entity', '500 Internal Server Error', '409 Conflict', '400 Bad Request'], answer: 3, explanation: 'The automatic filter returns 400 with ValidationProblemDetails.' },
    { question: 'Which attribute compares two properties?', options: ['[Compare]', '[Equal]', '[Match]', '[Confirm]'], answer: 0, explanation: '[Compare("Password")] checks that both values are equal.' },
    { question: 'To create a custom attribute you inherit from:', options: ['Attribute', 'ValidationAttribute', 'IValidatableObject', 'ModelState'], answer: 1, explanation: 'ValidationAttribute provides IsValid and error message formatting.' },
    { question: 'IValidatableObject.Validate is called when:', options: ['Always, before attributes', 'Only in MVC, never in API', 'All property attributes are valid', 'Only when ModelState is invalid'], answer: 2, explanation: 'Validator runs it after attribute validation succeeds.' },
    { question: 'Which option disables the automatic 400 response?', options: ['SuppressModelStateInvalidFilter = true', 'AddValidation(false)', '[ApiController(false)]', 'ModelState.Clear()'], answer: 0, explanation: 'ApiBehaviorOptions.SuppressModelStateInvalidFilter turns off the filter.' },
  ],
};
