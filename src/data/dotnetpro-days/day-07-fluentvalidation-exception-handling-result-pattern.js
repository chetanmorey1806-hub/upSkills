const fvCode = `// dotnet add src/CollegeHub.Application package FluentValidation.DependencyInjectionExtensions

// ===== Application/Students/RegisterStudentRequest.cs =====
public record RegisterStudentRequest(
    string Name, string Email, int Age, string Phone,
    string Password, string ConfirmPassword,
    bool IsScholarship, string? ScholarshipCode, List<string> CourseCodes);

// ===== Application/Students/RegisterStudentValidator.cs =====
using FluentValidation;
public class RegisterStudentValidator : AbstractValidator<RegisterStudentRequest>
{
    public RegisterStudentValidator(IStudentRepository students)     // validators support DI
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MustAsync(async (email, ct) => !await students.EmailExistsAsync(email, ct))
                .WithMessage("Email is already registered");

        RuleFor(x => x.Age).InclusiveBetween(17, 60);

        RuleFor(x => x.Phone)
            .Matches(@"^[6-9]\\d{9}$").WithMessage("Enter a valid 10-digit Indian mobile number");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password needs at least one capital letter")
            .Matches("[0-9]").WithMessage("Password needs at least one digit");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords do not match");

        // conditional rule
        When(x => x.IsScholarship, () =>
        {
            RuleFor(x => x.ScholarshipCode).NotEmpty().Length(6);
        });

        // rule for every item of a collection
        RuleFor(x => x.CourseCodes).NotEmpty().WithMessage("Choose at least one course");
        RuleForEach(x => x.CourseCodes).Length(5).WithMessage("Course code must have 5 characters, e.g. CS101");
    }
}

// ===== Program.cs (or AddApplication) =====
builder.Services.AddValidatorsFromAssemblyContaining<RegisterStudentValidator>();   // scans + registers all validators

// ===== Api/Controllers/StudentsController.cs =====
[HttpPost]
public async Task<IActionResult> Register(
    RegisterStudentRequest request,
    [FromServices] IValidator<RegisterStudentRequest> validator,
    CancellationToken ct)
{
    var result = await validator.ValidateAsync(request, ct);
    if (!result.IsValid)
        return ValidationProblem(new ValidationProblemDetails(result.ToDictionary()));

    var dto = await service.RegisterAsync(request, ct);
    return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
}

// Minimal API version:
// if (!result.IsValid) return Results.ValidationProblem(result.ToDictionary());`;

const miniValidatorCode = `using System;
using System.Collections.Generic;
using System.Linq;

var validator = new RegisterStudentValidator();
var requests = new[]
{
    new RegisterStudentRequest("Asha Patil", "asha@college.in", 20, "9876543210"),
    new RegisterStudentRequest("", "not-an-email", 15, "12345"),
    new RegisterStudentRequest("Ravi Kumar", "ravi@college.in", 61, "98765abcde"),
};

foreach (var r in requests)
{
    var errors = validator.Validate(r);
    Console.WriteLine(errors.Count == 0
        ? $"{r.Name}: valid"
        : $"{(r.Name == "" ? "(no name)" : r.Name)}: {errors.Count} error(s)");
    foreach (var (property, message) in errors)
        Console.WriteLine($"  {property}: {message}");
}

// ---- a tiny version of FluentValidation's AbstractValidator<T> ----
abstract class Validator<T>
{
    private readonly List<(string Property, Func<T, bool> IsValid, string Message)> _rules = new();

    protected void Rule(string property, Func<T, bool> isValid, string message) =>
        _rules.Add((property, isValid, message));

    // runs EVERY rule and collects all failures (does not stop at the first one)
    public List<(string Property, string Message)> Validate(T item) =>
        _rules.Where(r => !r.IsValid(item)).Select(r => (r.Property, r.Message)).ToList();
}

class RegisterStudentValidator : Validator<RegisterStudentRequest>
{
    public RegisterStudentValidator()
    {
        Rule("Name", r => !string.IsNullOrWhiteSpace(r.Name), "'Name' must not be empty.");
        Rule("Email", r => r.Email.Contains('@'), "'Email' is not a valid email address.");
        Rule("Age", r => r.Age >= 17 && r.Age <= 60, "'Age' must be between 17 and 60.");
        Rule("Phone", r => r.Phone.Length == 10 && r.Phone.All(char.IsDigit), "'Phone' must be a 10-digit number.");
    }
}

record RegisterStudentRequest(string Name, string Email, int Age, string Phone);`;

const exceptionCode = `// ===== Api/Infrastructure/GlobalExceptionHandler.cs (.NET 8+) =====
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger,
    IProblemDetailsService problemDetails,
    IHostEnvironment env) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            DomainException => (StatusCodes.Status409Conflict, "Business rule violated"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        if (status >= 500)
            logger.LogError(ex, "Unhandled exception for {Method} {Path}", http.Request.Method, http.Request.Path);
        else
            logger.LogWarning("Handled {Exception}: {Message}", ex.GetType().Name, ex.Message);

        var pd = new ProblemDetails
        {
            Status = status,
            Title = title,
            // never leak internal error text in production
            Detail = status >= 500 && !env.IsDevelopment() ? null : ex.Message,
            Instance = $"{http.Request.Method} {http.Request.Path}"
        };
        if (ex is ValidationException vex)
            pd.Extensions["errors"] = vex.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        http.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = http,
            ProblemDetails = pd,
            Exception = ex
        });
    }
}

// ===== Program.cs =====
builder.Services.AddProblemDetails(options =>
    options.CustomizeProblemDetails = ctx =>
        ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();   // can add several; first to return true wins

var app = builder.Build();
app.UseExceptionHandler();        // must be EARLY in the pipeline
app.UseStatusCodePages();         // empty 404/405 responses also become ProblemDetails
app.MapControllers();
app.Run();

// ===== Before .NET 8: the same idea as custom middleware =====
// public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> log)
// {
//     public async Task InvokeAsync(HttpContext ctx)
//     {
//         try { await next(ctx); }
//         catch (Exception ex)
//         {
//             log.LogError(ex, "Unhandled");
//             ctx.Response.StatusCode = 500;
//             await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = 500, Title = "Server error" });
//         }
//     }
// }
// app.UseMiddleware<ExceptionMiddleware>();`;

const resultCode = `using System;
using System.Collections.Generic;

var service = new EnrollmentService();
Print(service.Enroll("asha@college.in", "CS101"));
Print(service.Enroll("asha@college.in", "CS101"));     // again
Print(service.Enroll("ravi@college.in", "XX999"));     // unknown course
Print(service.Enroll("neha@college.in", "DB201"));     // last seat
Print(service.Enroll("om@college.in", "DB201"));       // full

// what a controller does: turn the Result into an HTTP response
static void Print(Result<string> result) => Console.WriteLine(result.Match(
    value => $"200 OK -> {value}",
    error => $"{StatusFor(error.Type)} -> {error.Code}: {error.Message}"));

static string StatusFor(ErrorType type) => type switch
{
    ErrorType.Validation => "400 Bad Request",
    ErrorType.NotFound => "404 Not Found",
    ErrorType.Conflict => "409 Conflict",
    _ => "500 Internal Server Error"
};

// ---------- the Result pattern ----------
enum ErrorType { Validation, NotFound, Conflict }
record Error(string Code, string Message, ErrorType Type);

sealed class Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;

    private Result(T value) => Value = value;
    private Result(Error error) => Error = error;

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);

    // lets a method simply "return value;" or "return error;"
    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<Error, TOut> onFailure) =>
        IsSuccess ? onSuccess(Value!) : onFailure(Error!);
}

// ---------- a use case that returns Result instead of throwing ----------
class EnrollmentService
{
    private readonly Dictionary<string, int> _seats = new() { ["CS101"] = 30, ["DB201"] = 1 };
    private readonly HashSet<string> _enrolled = new();

    public Result<string> Enroll(string email, string courseCode)
    {
        if (!_seats.TryGetValue(courseCode, out int seats))
            return new Error("Course.NotFound", $"Course {courseCode} does not exist", ErrorType.NotFound);
        if (_enrolled.Contains($"{email}|{courseCode}"))
            return new Error("Enrollment.Duplicate", $"{email} is already in {courseCode}", ErrorType.Conflict);
        if (seats == 0)
            return new Error("Course.Full", $"Course {courseCode} has no seats left", ErrorType.Conflict);

        _seats[courseCode] = seats - 1;
        _enrolled.Add($"{email}|{courseCode}");
        return $"{email} enrolled in {courseCode}";
    }
}`;

export default {
  id: 'day-07-fluentvalidation-exception-handling-result-pattern',
  title: 'FluentValidation, Global Exception Handling with ProblemDetails (IExceptionHandler) and the Result Pattern',
  module: 'Module 2: Clean Architecture, CQRS & MediatR',
  day: 7,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Professional APIs reject bad input with clear messages, never leak stack traces, and return errors in one standard format. Learn FluentValidation rules and DI registration, the .NET 8 IExceptionHandler with RFC 7807/9457 ProblemDetails, and the Result pattern for expected business failures without exceptions.',
  objectives: [
    'Write FluentValidation validators with built-in, custom, conditional, async and collection rules',
    'Return validation errors as ValidationProblemDetails (400)',
    'Implement global exception handling with IExceptionHandler, AddProblemDetails and UseExceptionHandler',
    'Explain when to throw exceptions and when to return a Result',
    'Implement a Result<T> type and map it to HTTP status codes',
  ],
  theory: [
    {
      heading: 'Why FluentValidation instead of Data Annotations?',
      content:
        'Data annotations ([Required], [Range], [EmailAddress]) work for simple models, but rules get scattered as attributes, conditional rules ("scholarship code is required only if IsScholarship is true") are awkward, async rules that need the database (unique email) are not possible, and the DTO class becomes cluttered. FluentValidation keeps rules in a separate validator class with a readable fluent API, supports dependency injection, async rules, conditions, collections and custom messages, and validators are easy to unit test. It is the most common validation library in Clean Architecture projects.',
      syntax: `public class CreateCourseValidator : AbstractValidator<CreateCourseRequest>
{
    public CreateCourseValidator()
    {
        RuleFor(x => x.Code).NotEmpty().Length(5);
        RuleFor(x => x.Fee).GreaterThan(0).LessThanOrEqualTo(200000);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
    }
}`,
      points: [
        'Package: FluentValidation (core) + FluentValidation.DependencyInjectionExtensions (AddValidatorsFromAssemblyContaining<T>())',
        'Built-in rules: NotEmpty, NotNull, Length, MaximumLength, EmailAddress, Matches(regex), InclusiveBetween, GreaterThan, Equal, Must, MustAsync, IsInEnum',
        'Customise: WithMessage, WithName, WithErrorCode, When/Unless, Cascade(CascadeMode.Stop)',
        'RuleForEach for list items, SetValidator for nested objects',
        'The old FluentValidation.AspNetCore automatic MVC integration is no longer recommended - validate manually, with an endpoint filter, or in a MediatR pipeline behavior (Day 9)',
      ],
    },
    {
      heading: 'ProblemDetails: one error format for every API',
      content:
        'ProblemDetails is the standard JSON error format (RFC 7807, updated by RFC 9457) with the content type application/problem+json. Fields: type (a URI identifying the error type), title (short summary), status (HTTP code), detail (explanation for this occurrence), instance (the request), plus extensions such as traceId or errors. ValidationProblemDetails adds an errors dictionary: property name -> array of messages. Clients (React, Angular, mobile apps) can then handle every error the same way. [ApiController] already returns ValidationProblemDetails for model-binding errors; AddProblemDetails() makes ASP.NET Core use the format for exceptions and empty status codes too.',
      syntax: `{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Resource not found",
  "status": 404,
  "detail": "Course 99 not found",
  "instance": "GET /api/courses/99",
  "traceId": "0HN5..."
}`,
    },
    {
      heading: 'Global exception handling with IExceptionHandler (.NET 8)',
      content:
        'Without global handling, an unhandled exception returns a 500 with an HTML or empty body (or a full stack trace in Development). Writing try/catch in every action is repetitive. In .NET 8+ implement IExceptionHandler: its TryHandleAsync method receives the HttpContext and the exception, writes a response, and returns true if it handled the exception (false lets the next handler try). Register it with AddExceptionHandler<T>() together with AddProblemDetails(), and add app.UseExceptionHandler() early in the pipeline. Map known exception types to status codes, log 5xx errors with full details, and never put internal messages or stack traces in production responses - return a traceId so support can find the log entry.',
      points: [
        'Before .NET 8: custom middleware with try { await next(context); } catch (Exception ex) { ... }',
        'Several handlers can be registered; they run in registration order',
        'UseStatusCodePages() turns empty 404/405 responses into ProblemDetails as well',
        'Exception filters (IExceptionFilter) only catch exceptions from MVC actions; the handler catches everything in the pipeline',
      ],
    },
    {
      heading: 'Exceptions vs the Result pattern',
      content:
        'Exceptions are for exceptional situations: the database is down, a bug, a null that should never be null. But "email already registered", "course is full" or "student not found" are EXPECTED outcomes of a use case. Using exceptions for them is like using the fire alarm to call people for lunch: it works, but it hides the normal flow, is slow-ish, and the method signature does not tell the caller what can go wrong. The Result pattern makes the outcome explicit: a method returns Result<T> that is either Success(value) or Failure(error). The caller must handle both branches, usually with Match. Libraries: ErrorOr, FluentResults, Ardalis.Result, or your own small class.',
      syntax: `public async Task<Result<StudentDto>> RegisterAsync(RegisterStudentRequest req, CancellationToken ct)
{
    if (await repo.EmailExistsAsync(req.Email, ct))
        return StudentErrors.EmailTaken(req.Email);        // Error -> Result (implicit)
    var student = Student.Create(req.Name, req.Email);
    await repo.AddAsync(student, ct);
    return student.ToDto();                                // value -> Result (implicit)
}

// controller
var result = await service.RegisterAsync(req, ct);
return result.Match<IActionResult>(
    dto => CreatedAtAction(nameof(Get), new { id = dto.Id }, dto),
    err => Problem(statusCode: err.Type == ErrorType.Conflict ? 409 : 400, title: err.Code, detail: err.Message));`,
      tip: 'Common team rule: validation errors -> 400 ValidationProblemDetails, expected business failures -> Result mapped to 404/409/422, unexpected failures -> exceptions caught by the global handler -> 500 with a traceId.',
    },
    {
      heading: 'Putting it together in Clean Architecture',
      content:
        'Validators and Result/Error types live in the Application layer next to the use cases (Students/RegisterStudentValidator.cs, Students/StudentErrors.cs). DomainException stays in Domain. The IExceptionHandler and the Result-to-HTTP mapping live in the API layer, because status codes are an HTTP concern. On Day 9 a MediatR ValidationBehavior will run every validator automatically before each handler, so controllers do not have to call ValidateAsync themselves.',
      points: [
        'Domain: DomainException for broken invariants',
        'Application: validators, Result<T>, Error catalogue (StudentErrors.NotFound(id))',
        'API: GlobalExceptionHandler, ProblemDetails configuration, Result -> IActionResult extension method',
      ],
    },
  ],
  examples: [
    {
      title: 'FluentValidation for student registration',
      scenario: 'The CollegeHub registration form needs: name, valid and unique email, age 17 to 60, an Indian mobile number, a strong password with confirmation, a scholarship code only for scholarship students, and at least one valid course code.',
      steps: [
        'dotnet add src/CollegeHub.Application package FluentValidation.DependencyInjectionExtensions',
        'Add the request record and RegisterStudentValidator to Application/Students and register validators in Program.cs (or AddApplication)',
        'Update the controller action to call ValidateAsync',
        'Press F5 and POST an invalid body in Swagger: {"name":"","email":"asha@","age":15,"phone":"12345","password":"abc","confirmPassword":"abd","isScholarship":true,"scholarshipCode":null,"courseCodes":["CS1"]}',
      ],
      code: fvCode,
      result: `400 Bad Request   Content-Type: application/problem+json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": [ "'Name' must not be empty." ],
    "Email": [ "'Email' is not a valid email address." ],
    "Age": [ "'Age' must be between 17 and 60. You entered 15." ],
    "Phone": [ "Enter a valid 10-digit Indian mobile number" ],
    "Password": [ "The length of 'Password' must be at least 8 characters. You entered 3 characters.",
                  "Password needs at least one capital letter",
                  "Password needs at least one digit" ],
    "ConfirmPassword": [ "Passwords do not match" ],
    "ScholarshipCode": [ "'Scholarship Code' must not be empty." ],
    "CourseCodes[0]": [ "Course code must have 5 characters, e.g. CS101" ]
  },
  "traceId": "00-6f1c...-01"
}`,
      explanation:
        'All rules run and ALL failures are returned at once, grouped by property - much friendlier for a form than one error at a time. Within a rule chain, every rule runs by default (Password got three messages); add .Cascade(CascadeMode.Stop) to stop at the first failure. With the default cascade mode the MustAsync rule still ran (one database query) even though the email format had already failed - put .Cascade(CascadeMode.Stop) on Email so the expensive query runs only for well-formed emails. FluentValidation splits PascalCase names for messages ("Scholarship Code"). The When block made ScholarshipCode required only because IsScholarship was true. traceId will differ.',
    },
    {
      title: 'How a validator works inside (mini FluentValidation)',
      scenario: 'Understand the idea behind AbstractValidator: a validator is just a list of rules (property, check, message) that are ALL evaluated, and the failures are collected.',
      steps: [
        'File > New > Project > Console App, name it MiniValidator',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Add a rule that the Name must be at most 20 characters and test it with a long name',
      ],
      code: miniValidatorCode,
      csharp: { files: { 'Program.cs': miniValidatorCode }, stdin: '' },
      result: `Asha Patil: valid
(no name): 4 error(s)
  Name: 'Name' must not be empty.
  Email: 'Email' is not a valid email address.
  Age: 'Age' must be between 17 and 60.
  Phone: 'Phone' must be a 10-digit number.
Ravi Kumar: 2 error(s)
  Age: 'Age' must be between 17 and 60.
  Phone: 'Phone' must be a 10-digit number.`,
      explanation:
        'Each Rule stores a predicate; Validate keeps the rules whose predicate returns false, in the order they were added. The second request breaks all four rules. Ravi is 61 (above 60) and his phone has 10 characters but contains letters, so char.IsDigit fails. FluentValidation works the same way but adds a typed fluent API (RuleFor(x => x.Age)), property names from expressions, message templates and async rules.',
    },
    {
      title: 'Global exception handling with IExceptionHandler and ProblemDetails',
      scenario: 'Every error from CollegeHub must be ProblemDetails JSON: 404 for missing data, 409 for broken business rules, 400 for validation exceptions, and a safe 500 with a traceId for bugs - with full details only in the logs.',
      steps: [
        'Add GlobalExceptionHandler.cs to the API project',
        'Register AddProblemDetails and AddExceptionHandler in Program.cs and call app.UseExceptionHandler() before MapControllers',
        'Add a test action that throws: throw new InvalidOperationException("Connection string missing")',
        'Run with ASPNETCORE_ENVIRONMENT=Production (launchSettings.json) and call GET /api/courses/99 and the test action',
      ],
      code: exceptionCode,
      result: `GET /api/courses/99   (service throws KeyNotFoundException("Course 99 not found"))
404 Not Found   Content-Type: application/problem+json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Resource not found",
  "status": 404,
  "detail": "Course 99 not found",
  "instance": "GET /api/courses/99",
  "traceId": "0HN5K2QJ3V1AB:00000003"
}

GET /api/test/crash   (InvalidOperationException, Production)
500 Internal Server Error
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1",
  "title": "An unexpected error occurred",
  "status": 500,
  "instance": "GET /api/test/crash",
  "traceId": "0HN5K2QJ3V1AB:00000004"
}

Console log:
fail: GlobalExceptionHandler[0]
      Unhandled exception for GET /api/test/crash
      System.InvalidOperationException: Connection string missing
         at CollegeHub.Api.Controllers.TestController.Crash() ...`,
      explanation:
        'The switch expression maps exception types to status codes in one place, so controllers contain no try/catch. IProblemDetailsService writes the standard JSON and runs CustomizeProblemDetails, which adds traceId to every response. In Production the 500 response has no detail - the real message and stack trace exist only in the log, linked by the same traceId. The "type" links are filled in automatically from the status code. traceId values will differ.',
    },
    {
      title: 'The Result pattern: expected failures without exceptions',
      scenario: 'Enrollment can fail in expected ways: unknown course, already enrolled, course full. Return Result<string> from the use case and let the "controller" turn it into status codes.',
      steps: [
        'File > New > Project > Console App, name it ResultPatternDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Add an ErrorType.Validation error for an empty email and map it to 400',
      ],
      code: resultCode,
      csharp: { files: { 'Program.cs': resultCode }, stdin: '' },
      result: `200 OK -> asha@college.in enrolled in CS101
409 Conflict -> Enrollment.Duplicate: asha@college.in is already in CS101
404 Not Found -> Course.NotFound: Course XX999 does not exist
200 OK -> neha@college.in enrolled in DB201
409 Conflict -> Course.Full: Course DB201 has no seats left`,
      explanation:
        'Enroll\'s signature (Result<string>) tells every caller that it can fail. The implicit operators let the method simply return a string or an Error. Match forces the caller to handle both success and failure - you cannot forget the error case. DB201 had 1 seat, so Neha takes it and Om gets Course.Full. No exceptions were thrown, so the flow is easy to follow and cheap. In an API, Match returns Ok(...) or Problem(statusCode: ...).',
    },
  ],
  interview: [
    { q: 'Why use FluentValidation over Data Annotations?', a: 'Separation of concerns (rules outside the DTO), readable fluent rules, conditional rules (When/Unless), async rules with DI (unique email), collection and nested validation, custom messages, and easy unit testing of validators.', level: 'Easy' },
    { q: 'How do you register FluentValidation validators in ASP.NET Core?', a: 'Install FluentValidation.DependencyInjectionExtensions and call services.AddValidatorsFromAssemblyContaining<SomeValidator>() (or AddValidatorsFromAssembly). Then inject IValidator<T> where needed.', level: 'Easy' },
    { q: 'What is the difference between Validate and ValidateAsync?', a: 'ValidateAsync runs async rules (MustAsync, CustomAsync). Calling Validate on a validator that contains async rules throws AsyncValidatorInvokedSynchronouslyException. In ASP.NET Core always use ValidateAsync.', level: 'Medium' },
    { q: 'What does CascadeMode.Stop do?', a: 'It stops evaluating the remaining rules in a rule chain once one fails, e.g. skip the database uniqueness check if the email is empty or badly formatted. It can be set per rule (.Cascade(CascadeMode.Stop)) or class-wide (RuleLevelCascadeMode).', level: 'Medium' },
    { q: 'What is ProblemDetails?', a: 'A standard (RFC 7807 / RFC 9457) JSON format for HTTP API errors with type, title, status, detail, instance and extension members, served as application/problem+json. ValidationProblemDetails adds an errors dictionary.', level: 'Easy' },
    { q: 'How do you implement global exception handling in .NET 8?', a: 'Implement IExceptionHandler.TryHandleAsync, map exceptions to status codes, log, write ProblemDetails (via IProblemDetailsService) and return true. Register AddExceptionHandler<T>() and AddProblemDetails(), then call app.UseExceptionHandler() early in the pipeline.', level: 'Medium' },
    { q: 'IExceptionHandler vs custom exception middleware vs exception filters?', a: 'Custom middleware with try/catch was the pre-.NET 8 approach and still works. IExceptionHandler is the built-in, DI-friendly hook used by UseExceptionHandler and supports multiple handlers. Exception filters only catch exceptions thrown inside MVC actions/filters, not in other middleware or minimal APIs.', level: 'Hard' },
    { q: 'Why should a production API not return exception messages and stack traces?', a: 'They reveal internals (SQL, file paths, library versions, connection details) that help attackers. Log the details server-side and return a generic message with a traceId the user can quote to support.', level: 'Medium' },
    { q: 'What is the Result pattern and why use it?', a: 'A method returns an object that is either a success with a value or a failure with an error, instead of throwing. It makes expected failures explicit in the signature, forces callers to handle them, keeps control flow visible and avoids the cost of exceptions for normal business outcomes.', level: 'Medium' },
    { q: 'When would you still throw an exception rather than return a Result?', a: 'For truly unexpected or unrecoverable situations: bugs, violated invariants in the domain, infrastructure failures (database down, timeout), programmer errors like null arguments. Those are handled by the global handler as 500.', level: 'Medium' },
    { q: 'Which status codes would you return for: invalid input, missing resource, duplicate email, business rule failure, unexpected crash?', a: '400 Bad Request (ValidationProblemDetails), 404 Not Found, 409 Conflict, 409 or 422 Unprocessable Entity (team convention), 500 Internal Server Error with a traceId.', level: 'Easy' },
    { q: 'How would you unit test a FluentValidation validator?', a: 'Use FluentValidation.TestHelper: var result = validator.TestValidate(model); result.ShouldHaveValidationErrorFor(x => x.Email); result.ShouldNotHaveValidationErrorFor(x => x.Name). For async rules use TestValidateAsync and fake dependencies.', level: 'Medium' },
    { q: 'Where do validators, Result types and the exception handler live in Clean Architecture?', a: 'Validators and Result/Error types in the Application layer with their use cases; DomainException in Domain; the IExceptionHandler and Result-to-HTTP mapping in the API layer because status codes are an HTTP concern.', level: 'Medium' },
    { q: 'What does UseStatusCodePages add when AddProblemDetails is configured?', a: 'Responses that have an error status code but no body (for example 404 for an unknown route or 405 Method Not Allowed) get a ProblemDetails body too, so clients always receive the same error format.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write CreateCourseValidator: Code exactly 5 characters and upper-case letters+digits, Title required (max 150), Fee between 500 and 200000, Capacity 1 to 300, StartDate must be in the future.',
      hint: 'Matches("^[A-Z]{2,3}[0-9]{2,3}$"), InclusiveBetween, GreaterThan with a DateOnly.',
      solution: `public class CreateCourseValidator : AbstractValidator<CreateCourseRequest>
{
    public CreateCourseValidator(TimeProvider clock)
    {
        RuleFor(x => x.Code).NotEmpty().Length(5).Matches("^[A-Z]{2,3}[0-9]{2,3}$");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Fee).InclusiveBetween(500, 200000);
        RuleFor(x => x.Capacity).InclusiveBetween(1, 300);
        RuleFor(x => x.StartDate)
            .GreaterThan(_ => DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime))
            .WithMessage("Start date must be in the future");
    }
}`,
    },
    {
      task: 'Add an Address child object to RegisterStudentRequest and validate it with its own AddressValidator (City required, Pincode 6 digits).',
      hint: 'RuleFor(x => x.Address).SetValidator(new AddressValidator());',
      solution: `public class AddressValidator : AbstractValidator<AddressDto>
{
    public AddressValidator()
    {
        RuleFor(a => a.City).NotEmpty();
        RuleFor(a => a.Pincode).Matches("^[1-9][0-9]{5}$").WithMessage("Pincode must be 6 digits");
    }
}
// in RegisterStudentValidator:
RuleFor(x => x.Address).NotNull().SetValidator(new AddressValidator());`,
    },
    {
      task: 'Write a generic endpoint filter for minimal APIs that validates the first argument of type T with IValidator<T> and returns ValidationProblem on failure.',
      hint: 'Implement IEndpointFilter; ctx.Arguments.OfType<T>().FirstOrDefault().',
      solution: `public class ValidationFilter<T>(IValidator<T> validator) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        var arg = ctx.Arguments.OfType<T>().FirstOrDefault();
        if (arg is null) return Results.BadRequest();
        var result = await validator.ValidateAsync(arg);
        return result.IsValid ? await next(ctx) : Results.ValidationProblem(result.ToDictionary());
    }
}
// app.MapPost("/api/courses", Create).AddEndpointFilter<ValidationFilter<CreateCourseRequest>>();`,
    },
    {
      task: 'Write an extension method ToActionResult for Result<T> in the API layer that returns Ok(value) on success and Problem(...) with 400/404/409 based on ErrorType on failure.',
      hint: 'ControllerBase has Ok and Problem; pass the controller as this.',
      solution: `public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result, ControllerBase c) =>
        result.Match<IActionResult>(
            value => c.Ok(value),
            error => c.Problem(
                statusCode: error.Type switch
                {
                    ErrorType.Validation => 400,
                    ErrorType.NotFound => 404,
                    ErrorType.Conflict => 409,
                    _ => 500
                },
                title: error.Code,
                detail: error.Message));
}
// usage: return (await service.EnrollAsync(cmd, ct)).ToActionResult(this);`,
    },
    {
      task: 'Write unit tests for RegisterStudentValidator using FluentValidation.TestHelper: one for an invalid phone and one proving a valid request has no errors.',
      hint: 'await validator.TestValidateAsync(model); ShouldHaveValidationErrorFor; ShouldNotHaveAnyValidationErrors.',
      solution: `public class RegisterStudentValidatorTests
{
    private readonly RegisterStudentValidator _v = new(new FakeStudentRepository());

    [Fact]
    public async Task Invalid_phone_fails()
    {
        var model = ValidRequest() with { Phone = "12345" };
        var result = await _v.TestValidateAsync(model);
        result.ShouldHaveValidationErrorFor(x => x.Phone);
    }

    [Fact]
    public async Task Valid_request_passes()
    {
        var result = await _v.TestValidateAsync(ValidRequest());
        result.ShouldNotHaveAnyValidationErrors();
    }

    private static RegisterStudentRequest ValidRequest() => new(
        "Asha Patil", "asha@college.in", 20, "9876543210", "Secret123", "Secret123",
        false, null, new List<string> { "CS101" });
}`,
    },
  ],
  quiz: [
    {
      question: 'Which FluentValidation method makes ScholarshipCode required only when IsScholarship is true?',
      options: ['RuleForEach', 'When(x => x.IsScholarship, () => RuleFor(x => x.ScholarshipCode).NotEmpty())', 'SetValidator', 'WithMessage'],
      answer: 1,
      explanation: 'When/Unless apply rules conditionally.',
    },
    {
      question: 'What content type does a ProblemDetails response use?',
      options: ['text/html', 'application/xml', 'application/problem+json', 'text/plain'],
      answer: 2,
      explanation: 'RFC 7807/9457 defines application/problem+json.',
    },
    {
      question: 'Which three calls enable IExceptionHandler-based global error handling in .NET 8?',
      options: [
        'AddExceptionHandler<T>(), AddProblemDetails(), app.UseExceptionHandler()',
        'AddControllers(), UseRouting(), UseCors()',
        'AddMvc(), UseDeveloperExceptionPage(), UseHsts()',
        'AddValidators(), UseValidation(), MapValidators()',
      ],
      answer: 0,
      explanation: 'Register the handler and ProblemDetails services, then add the exception handler middleware.',
    },
    {
      question: '"Course is full" when enrolling is an expected business outcome. Which approach do many teams prefer?',
      options: ['Throw Exception and return 500', 'Return null', 'Ignore it', 'Return a Result failure and map it to 409 Conflict'],
      answer: 3,
      explanation: 'Expected failures are explicit with the Result pattern; exceptions are for unexpected situations.',
    },
    {
      question: 'In Production, what should a 500 ProblemDetails response contain?',
      options: ['The full stack trace', 'A generic title and a traceId, with details only in the logs', 'The SQL that failed', 'The connection string for debugging'],
      answer: 1,
      explanation: 'Never leak internals; correlate the response and the logs with a traceId.',
    },
  ],
};
