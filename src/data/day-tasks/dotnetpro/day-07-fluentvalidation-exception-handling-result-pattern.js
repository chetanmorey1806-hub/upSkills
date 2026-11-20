export default {
  lesson: 'day-07-fluentvalidation-exception-handling-result-pattern',
  minutes: 25,
  intro: 'Practise FluentValidation rules, ProblemDetails, the .NET 8 IExceptionHandler and the Result pattern for expected failures.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Complete the base class every FluentValidation validator inherits from:
\`public class CreateCourseValidator : ______<CreateCourseRequest>\``,
      example: { title: 'inside the constructor', code: 'RuleFor(x => x.Fee).GreaterThan(0);' },
      accept: ['AbstractValidator'],
      caseSensitive: true,
      explain: '`AbstractValidator<T>` provides `RuleFor`, `RuleForEach`, `When` and the `Validate`/`ValidateAsync` methods. Rules are declared in the constructor, so the validator can also receive services (like a repository) through constructor injection.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A validator contains `RuleFor(x => x.Email).MustAsync(...)` that checks the database. A developer calls `validator.Validate(request)` (not async). What happens?',
      options: [
        'The async rule is silently skipped',
        'FluentValidation throws an AsyncValidatorInvokedSynchronouslyException',
        'It works the same as ValidateAsync',
        'It returns IsValid = true always',
      ],
      answer: 1,
      explain: 'Validators with async rules must be run with `ValidateAsync`. FluentValidation refuses to block on async code and throws. In ASP.NET Core always use `await validator.ValidateAsync(model, ct)`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Using the `EnrollmentService` from the lesson (CS101 has 30 seats, DB201 has **1** seat; the checks run in this order: course exists, already enrolled, seats left), what does this print?',
      example: { title: 'the Match call', code: 'result.Match(onSuccess, onFailure)  // exactly one branch runs' },
      code: `var service = new EnrollmentService();
var calls = new[]
{
    ("om@college.in", "DB201"),
    ("om@college.in", "DB201"),
    ("asha@college.in", "DB201"),
    ("asha@college.in", "ML301"),
};
foreach (var (email, course) in calls)
{
    Result<string> r = service.Enroll(email, course);
    Console.WriteLine(r.Match(value => "200", error => error.Code));
}`,
      expected: `200
Enrollment.Duplicate
Course.Full
Course.NotFound`,
      explain: 'Om takes the only DB201 seat (200). His second attempt hits the duplicate check BEFORE the seat check, so the code is Enrollment.Duplicate, not Course.Full. Asha finds DB201 full. ML301 does not exist, which is checked first. No exceptions are thrown at all - every outcome is a value.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about **ProblemDetails** in ASP.NET Core are true? Select all that apply.',
      options: [
        'It is a standard error format (RFC 7807 / RFC 9457) served as application/problem+json',
        'ValidationProblemDetails adds an `errors` dictionary of property -> messages',
        '`builder.Services.AddProblemDetails()` makes unhandled exceptions and empty error responses use the format',
        'It should always include the full stack trace so clients can debug',
        'It can only be used with status code 500',
      ],
      answers: [0, 1, 2],
      explain: 'ProblemDetails gives every error (400, 404, 409, 500 ...) the same shape: type, title, status, detail, instance plus extensions such as traceId. Stack traces must never be sent to clients in production - log them and return the traceId.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Register your \`GlobalExceptionHandler : IExceptionHandler\` in Program.cs:
\`builder.Services.______<GlobalExceptionHandler>();\``,
      example: { title: 'the matching middleware', code: 'builder.Services.AddProblemDetails();\n...\napp.UseExceptionHandler();' },
      accept: ['AddExceptionHandler'],
      caseSensitive: true,
      explain: '`AddExceptionHandler<T>()` registers the handler (as a singleton). It is only called when `app.UseExceptionHandler()` is in the pipeline - forgetting that middleware is the most common reason the handler never runs.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Inside `TryHandleAsync`, what does returning **false** mean?',
      options: [
        'The request is cancelled',
        'The exception is swallowed and 200 OK is returned',
        'This handler did not handle the exception, so the next registered handler (or the default behaviour) runs',
        'The application shuts down',
      ],
      answer: 2,
      explain: 'Multiple IExceptionHandler implementations run in registration order until one returns true. A handler for, say, only database timeouts can return false for other exceptions and let the general handler deal with them.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A team follows this rule: validation -> 400, expected business failure -> Result, unexpected -> exception. Which case should **throw an exception**?',
      options: [
        'The student typed an invalid phone number',
        'The requested course does not exist',
        'The SQL Server is down and the query times out',
        'The student is already enrolled in the course',
      ],
      answer: 2,
      explain: 'A database outage is unexpected and not something the use case can handle - throw (or let the exception bubble), the global handler logs it and returns 500 with a traceId. Invalid input is a validation error (400), and a missing course or duplicate enrollment are expected outcomes returned as Result failures (404/409).',
    },
  ],
};
