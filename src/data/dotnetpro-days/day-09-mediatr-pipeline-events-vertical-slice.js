const behaviorsCode = `// ===================== Application/Behaviors/LoggingBehavior.cs =====================
using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

public sealed class LoggingBehavior<TRequest, TResponse>(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        string name = typeof(TRequest).Name;
        logger.LogInformation("Handling {Request}", name);
        var sw = Stopwatch.StartNew();

        TResponse response = await next();          // call the next behavior / the handler

        sw.Stop();
        if (sw.ElapsedMilliseconds > 500)
            logger.LogWarning("Slow request {Request} took {Ms} ms", name, sw.ElapsedMilliseconds);
        else
            logger.LogInformation("Handled {Request} in {Ms} ms", name, sw.ElapsedMilliseconds);
        return response;
    }
}

// ===================== Application/Behaviors/ValidationBehavior.cs =====================
using FluentValidation;
using MediatR;

public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validators.Any())
            return await next();                    // no validator for this request

        var context = new ValidationContext<TRequest>(request);
        var results = await Task.WhenAll(validators.Select(v => v.ValidateAsync(context, ct)));
        var failures = results.SelectMany(r => r.Errors).Where(f => f is not null).ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures); // Day 7 GlobalExceptionHandler -> 400 ProblemDetails

        return await next();
    }
}

// ===================== Application/Behaviors/TransactionBehavior.cs =====================
public interface ICommand { }                       // marker: only commands need a transaction

public sealed class TransactionBehavior<TRequest, TResponse>(CollegeDbContext db)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (request is not ICommand) return await next();      // queries skip it

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        TResponse response = await next();
        await tx.CommitAsync(ct);                   // exception -> tx disposed -> rollback
        return response;
    }
}
// (in strict Clean Architecture put TransactionBehavior in Infrastructure, or use IUnitOfWork)

// ===================== Application/DependencyInjection.cs =====================
public static IServiceCollection AddApplication(this IServiceCollection services)
{
    var assembly = typeof(DependencyInjection).Assembly;
    services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(assembly);
        // ORDER MATTERS: first registered = outermost
        cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
        cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
    });
    services.AddValidatorsFromAssembly(assembly);
    return services;
}

// ===================== The command now needs NO validation or logging code =====================
public record CreateCourseCommand(string Code, string Title, decimal Fee, int Capacity) : IRequest<int>, ICommand;

public class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
{
    public CreateCourseCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().Length(5);
        RuleFor(x => x.Fee).GreaterThan(0);
        RuleFor(x => x.Capacity).InclusiveBetween(1, 300);
    }
}`;

const pipelineSimCode = `using System;
using System.Collections.Generic;

// behaviors in registration order: the FIRST one is the OUTERMOST layer
var behaviors = new List<(string Name, Func<EnrollCommand, Func<string>, string> Run)>
{
    ("Logging", (cmd, next) =>
    {
        Console.WriteLine($"[Logging] -> {cmd}");
        string response = next();
        Console.WriteLine($"[Logging] <- {response}");
        return response;
    }),
    ("Validation", (cmd, next) =>
    {
        if (cmd.StudentId <= 0 || cmd.CourseCode.Length != 5)
        {
            Console.WriteLine("[Validation] failed, handler NOT called");
            return "400 Bad Request";                 // short-circuit: next() is never called
        }
        Console.WriteLine("[Validation] ok");
        return next();
    }),
    ("Transaction", (cmd, next) =>
    {
        Console.WriteLine("[Transaction] BEGIN");
        string response = next();
        Console.WriteLine("[Transaction] COMMIT");
        return response;
    }),
};

Send(new EnrollCommand(7, "CS101"));
Console.WriteLine();
Send(new EnrollCommand(0, "CS1"));

string Handler(EnrollCommand cmd)
{
    Console.WriteLine($"[Handler] enrolling {cmd.StudentId} in {cmd.CourseCode}");
    return "200 OK";
}

// build the "Russian doll": wrap the handler from the innermost behavior outwards
string Send(EnrollCommand cmd)
{
    Func<string> next = () => Handler(cmd);
    for (int i = behaviors.Count - 1; i >= 0; i--)
    {
        var behavior = behaviors[i].Run;
        var inner = next;
        next = () => behavior(cmd, inner);
    }
    return next();
}

record EnrollCommand(int StudentId, string CourseCode);`;

const eventsCode = `// ===================== Domain/Common (Domain references only the tiny MediatR.Contracts package) =====================
using MediatR;
public interface IDomainEvent : INotification { }

public abstract class Entity
{
    private readonly List<IDomainEvent> _domainEvents = new();
    public int Id { get; protected set; }
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents;
    protected void Raise(IDomainEvent e) => _domainEvents.Add(e);
    public void ClearDomainEvents() => _domainEvents.Clear();
}

// ===================== Domain/Courses =====================
public sealed record StudentEnrolledEvent(int CourseId, string CourseTitle, int StudentId, string StudentEmail) : IDomainEvent;

public sealed class Course : Entity
{
    private readonly List<Enrollment> _enrollments = new();
    public string Title { get; private set; } = "";
    public int Capacity { get; private set; }
    public IReadOnlyList<Enrollment> Enrollments => _enrollments;

    public Result<Enrollment> Enroll(Student student)
    {
        if (_enrollments.Any(e => e.StudentId == student.Id)) return CourseErrors.AlreadyEnrolled;
        if (_enrollments.Count >= Capacity) return CourseErrors.Full;
        var enrollment = new Enrollment(Id, student.Id);
        _enrollments.Add(enrollment);
        Raise(new StudentEnrolledEvent(Id, Title, student.Id, student.Email));   // "something happened"
        return enrollment;
    }
}

// ===================== Infrastructure: publish events AFTER a successful save =====================
public class CollegeDbContext(DbContextOptions<CollegeDbContext> options, IPublisher publisher) : DbContext(options)
{
    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var entities = ChangeTracker.Entries<Entity>().Select(e => e.Entity)
                                    .Where(e => e.DomainEvents.Count > 0).ToList();
        var events = entities.SelectMany(e => e.DomainEvents).ToList();
        entities.ForEach(e => e.ClearDomainEvents());

        int result = await base.SaveChangesAsync(ct);          // 1. save data
        foreach (var domainEvent in events)
            await publisher.Publish(domainEvent, ct);          // 2. then notify
        return result;
    }
}

// ===================== Application: any number of handlers for ONE event =====================
public class SendEnrollmentEmailHandler(IEmailSender email, ILogger<SendEnrollmentEmailHandler> log)
    : INotificationHandler<StudentEnrolledEvent>
{
    public async Task Handle(StudentEnrolledEvent e, CancellationToken ct)
    {
        await email.SendAsync(e.StudentEmail, "Enrollment confirmed", $"You are enrolled in {e.CourseTitle}", ct);
        log.LogInformation("Email sent to {Email}", e.StudentEmail);
    }
}

public class NotifyAccountsHandler(IFeeService fees, ILogger<NotifyAccountsHandler> log)
    : INotificationHandler<StudentEnrolledEvent>
{
    public async Task Handle(StudentEnrolledEvent e, CancellationToken ct)
    {
        await fees.CreateInvoiceAsync(e.StudentId, e.CourseId, ct);
        log.LogInformation("Fee invoice created for student {Student}", e.StudentId);
    }
}

// Optional: run handlers in parallel instead of one after another
// services.AddMediatR(cfg => { ...; cfg.NotificationPublisher = new TaskWhenAllPublisher(); });`;

const sliceCode = `// ===================== Vertical slice layout =====================
// CollegeHub.Api/
//   Features/
//     Courses/
//       CreateCourse.cs        <- command + validator + handler + endpoint in ONE file
//       GetCourses.cs
//     Enrollments/
//       EnrollStudent.cs
//       CancelEnrollment.cs
//   Common/ (Result, behaviors, exception handler)
//   Data/   (CollegeDbContext)
//   Program.cs

// ===================== Features/Enrollments/EnrollStudent.cs =====================
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CollegeHub.Api.Features.Enrollments;

public static class EnrollStudent
{
    public record Command(int StudentId, int CourseId) : IRequest<Result<int>>;

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.CourseId).GreaterThan(0);
        }
    }

    internal sealed class Handler(CollegeDbContext db) : IRequestHandler<Command, Result<int>>
    {
        public async Task<Result<int>> Handle(Command cmd, CancellationToken ct)
        {
            var course = await db.Courses.Include(c => c.Enrollments)
                                         .FirstOrDefaultAsync(c => c.Id == cmd.CourseId, ct);
            if (course is null) return CourseErrors.NotFound(cmd.CourseId);
            var student = await db.Students.FindAsync([cmd.StudentId], ct);
            if (student is null) return StudentErrors.NotFound(cmd.StudentId);

            var result = course.Enroll(student);
            if (!result.IsSuccess) return result.Error!;
            await db.SaveChangesAsync(ct);                   // also publishes StudentEnrolledEvent
            return result.Value!.Id;
        }
    }

    public static void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("/api/courses/{courseId:int}/enrollments",
            async (int courseId, EnrollRequest body, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new Command(body.StudentId, courseId), ct);
                return result.Match(
                    id => Results.Created($"/api/enrollments/{id}", new { id }),
                    error => error.ToProblem());
            })
           .WithTags("Enrollments");

    public record EnrollRequest(int StudentId);
}

// Program.cs
// EnrollStudent.MapEndpoint(app);
// CreateCourse.MapEndpoint(app);  ... (or discover all IEndpoint classes by reflection)`;

const projectCode = `// =====================================================================
//  MINI PROJECT: CollegeHub "Course Enrollment" API (Clean Architecture + CQRS)
// =====================================================================
// Solution (Day 5):  Domain | Application | Infrastructure | Api | tests
//
// Domain
//   Common/Entity.cs, IDomainEvent.cs, Result.cs, Error.cs
//   Students/Student.cs                 Create(name, email)
//   Courses/Course.cs                   Create(code, title, fee, capacity), Enroll(student), CancelEnrollment(id)
//   Courses/Enrollment.cs, CourseErrors.cs, StudentEnrolledEvent.cs, EnrollmentCancelledEvent.cs
//
// Application
//   Abstractions/ IUnitOfWork, ICourseRepository, IStudentRepository, IEmailSender, ISqlConnectionFactory
//   Behaviors/    LoggingBehavior, ValidationBehavior, TransactionBehavior
//   Students/     RegisterStudent (command+validator+handler), GetStudentById (query)
//   Courses/      CreateCourse, GetCourses (paged query, Dapper), GetCourseById
//   Enrollments/  EnrollStudent, CancelEnrollment, GetStudentEnrollments (query)
//   Enrollments/EventHandlers/ SendEnrollmentEmailHandler, NotifyAccountsHandler
//
// Infrastructure
//   Persistence/  CollegeDbContext (dispatches domain events), Configurations/*.cs, Repositories, UnitOfWork, Migrations
//   Email/        FakeEmailSender (logs instead of sending)
//
// Api
//   Controllers/  StudentsController, CoursesController, EnrollmentsController (all use ISender)
//   GlobalExceptionHandler.cs, ResultExtensions.cs (Result -> ProblemDetails)
//
// ---------------- Endpoints ----------------
// POST   /api/students                         RegisterStudentCommand      201 / 400 / 409
// GET    /api/students/{id}                    GetStudentByIdQuery         200 / 404
// GET    /api/students/{id}/enrollments        GetStudentEnrollmentsQuery  200
// POST   /api/courses                          CreateCourseCommand         201 / 400
// GET    /api/courses?search=&page=&pageSize=  GetCoursesQuery             200 (paged)
// POST   /api/courses/{id}/enrollments         EnrollStudentCommand        201 / 404 / 409
// DELETE /api/enrollments/{id}                 CancelEnrollmentCommand     204 / 404

// ---------------- Api/Controllers/EnrollmentsController.cs ----------------
[ApiController]
[Route("api")]
public class EnrollmentsController(ISender sender) : ControllerBase
{
    [HttpPost("courses/{courseId:int}/enrollments")]
    public async Task<IActionResult> Enroll(int courseId, EnrollRequest body, CancellationToken ct)
    {
        var result = await sender.Send(new EnrollStudentCommand(body.StudentId, courseId), ct);
        return result.Match<IActionResult>(
            id => Created($"/api/enrollments/{id}", new { id }),
            error => error.ToProblemResult(this));
    }

    [HttpDelete("enrollments/{id:int}")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        var result = await sender.Send(new CancelEnrollmentCommand(id), ct);
        return result.Match<IActionResult>(_ => NoContent(), error => error.ToProblemResult(this));
    }

    [HttpGet("students/{studentId:int}/enrollments")]
    public async Task<IActionResult> ForStudent(int studentId, CancellationToken ct) =>
        Ok(await sender.Send(new GetStudentEnrollmentsQuery(studentId), ct));
}

// ---------------- Api/Program.cs ----------------
using CollegeHub.Application;
using CollegeHub.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddApplication();                        // MediatR + behaviors + validators
builder.Services.AddInfrastructure(builder.Configuration); // EF Core, Dapper factory, repositories, email
builder.Services.AddProblemDetails(o => o.CustomizeProblemDetails = c =>
    c.ProblemDetails.Extensions["traceId"] = c.HttpContext.TraceIdentifier);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapControllers();
app.Run();

// ---------------- Build steps ----------------
// 1. dotnet ef migrations add Init -p src/CollegeHub.Infrastructure -s src/CollegeHub.Api
// 2. dotnet ef database update      -p src/CollegeHub.Infrastructure -s src/CollegeHub.Api
// 3. dotnet run --project src/CollegeHub.Api   -> open /swagger
// 4. dotnet test                               -> domain, validator and handler tests`;

export default {
  id: 'day-09-mediatr-pipeline-events-vertical-slice',
  title: 'MediatR Pipeline Behaviors, Notifications and Domain Events, Vertical Slice Architecture + Mini Project',
  module: 'Module 2: Clean Architecture, CQRS & MediatR',
  day: 9,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'Put validation, logging and transactions around every MediatR request with pipeline behaviors, react to business events with notifications and domain events, compare layered Clean Architecture with vertical slice architecture, and finish Module 2 by assembling a complete Clean Architecture "Course Enrollment" API.',
  objectives: [
    'Write IPipelineBehavior<TRequest, TResponse> classes and register them in the correct order',
    'Implement a ValidationBehavior that runs every FluentValidation validator automatically',
    'Publish INotification events with several handlers and raise domain events from entities',
    'Explain vertical slice architecture and when to prefer it over horizontal layers',
    'Assemble a full Clean Architecture + CQRS Course Enrollment API',
  ],
  theory: [
    {
      heading: 'Pipeline behaviors: middleware for MediatR',
      content:
        'An IPipelineBehavior<TRequest, TResponse> wraps the handler like ASP.NET Core middleware wraps an endpoint. Its Handle method receives the request and a next delegate: code before await next() runs before the handler, code after it runs after the handler, and a behavior can short-circuit by not calling next (or by throwing). Behaviors are open generics, so one class applies to EVERY request. Typical behaviors: logging and timing, validation, transactions/unit of work, caching for queries, authorization checks, retry, performance alerts.',
      syntax: `public sealed class LoggingBehavior<TRequest, TResponse>(ILogger<LoggingBehavior<TRequest, TResponse>> log)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        log.LogInformation("Handling {Name}", typeof(TRequest).Name);
        var response = await next();
        log.LogInformation("Handled {Name}", typeof(TRequest).Name);
        return response;
    }
}`,
      points: [
        'Register with cfg.AddOpenBehavior(typeof(LoggingBehavior<,>)) inside AddMediatR',
        'Order = registration order; the first registered behavior is the outermost (runs first, finishes last)',
        'Typical order: Logging -> Validation -> Transaction -> Handler (log everything, validate before opening a transaction)',
        'Use marker interfaces (ICommand, ICacheableQuery) and check them inside the behavior to apply it only to some requests',
      ],
    },
    {
      heading: 'ValidationBehavior: FluentValidation for every request',
      content:
        'On Day 7 each controller called validator.ValidateAsync itself. With a ValidationBehavior that receives IEnumerable<IValidator<TRequest>> from DI, every command is validated automatically before its handler runs - just add a validator class next to the command and it is picked up. If there are failures, the behavior throws ValidationException (handled by the global exception handler as 400 ValidationProblemDetails) or, in Result-based code, returns a validation failure. Requests without a validator pass straight through.',
      tip: 'Interview answer for "how do you validate commands in Clean Architecture?": FluentValidation validators in the Application layer + a MediatR ValidationBehavior + IExceptionHandler mapping ValidationException to 400 ProblemDetails.',
    },
    {
      heading: 'Notifications and domain events',
      content:
        'A request has exactly one handler, but often several things must happen after an event: when a student enrols, send a confirmation email, create a fee invoice and update dashboard statistics. Publishing an INotification with IPublisher.Publish runs ALL INotificationHandler<T> classes for it (zero or more). The enrollment handler does not know about email or invoices, so new reactions are added without touching existing code (Open/Closed principle). Domain events take this further: the entity itself records "StudentEnrolled" in a DomainEvents list when its method succeeds, and the DbContext publishes the collected events after SaveChanges succeeds.',
      points: [
        'By default MediatR runs notification handlers one after another (ForeachAwaitPublisher); an exception stops the remaining ones. TaskWhenAllPublisher runs them in parallel',
        'Handlers run in the same process and request - if the app crashes after saving but before the email, the email is lost',
        'For guaranteed delivery use the Outbox pattern: save the event in an OutboxMessages table in the same transaction, and a background job publishes it (MassTransit, a Quartz/hosted service)',
        'Name events in the past tense: StudentEnrolled, FeePaid, CourseCancelled',
      ],
    },
    {
      heading: 'Vertical slice architecture',
      content:
        'Clean Architecture organises code in horizontal LAYERS; a single feature like "enroll student" is spread over Domain, Application, Infrastructure and Api folders. Vertical slice architecture (popularised by Jimmy Bogard) organises code by FEATURE: everything for "EnrollStudent" - request, validator, handler, endpoint and sometimes its own query - lives in one folder or even one file. Each slice can choose its own approach (EF Core for one, Dapper for a report). Coupling between slices is minimised; coupling inside a slice is accepted. MediatR and minimal APIs fit naturally. Many teams combine both: a Domain project for rich entities plus vertical slices for the application and API code.',
      points: [
        'Pros: adding a feature touches one folder, less abstraction, easy navigation, fewer merge conflicts',
        'Cons: risk of duplicated logic between slices, needs discipline to push shared rules into the domain',
        'Folder per feature: Features/Enrollments/EnrollStudent.cs, Features/Courses/GetCourses.cs',
      ],
    },
    {
      heading: 'Mini project overview: Course Enrollment API',
      content:
        'The module ends with a complete API that uses everything from Days 5 to 9. Domain: Student, Course, Enrollment with rules (capacity, no duplicate enrollment) and domain events. Application: commands and queries with MediatR, FluentValidation validators, logging/validation/transaction behaviors, Result and Error types, notification handlers for email and invoices. Infrastructure: EF Core DbContext with configurations and migrations, repositories and unit of work, Dapper connection factory for fast queries, a fake email sender. Api: thin controllers using ISender, IExceptionHandler with ProblemDetails, Swagger. Tests: domain unit tests, validator tests and handler tests with fakes.',
    },
  ],
  examples: [
    {
      title: 'Logging, validation and transaction behaviors',
      scenario: 'Remove validation and logging code from every controller and handler in CollegeHub: add three pipeline behaviors once, and make CreateCourseCommand validated, logged and transactional automatically.',
      steps: [
        'Add the three behavior classes to Application/Behaviors (TransactionBehavior can live in Infrastructure if you prefer)',
        'Register them with AddOpenBehavior in AddApplication, in the order shown, plus AddValidatorsFromAssembly',
        'Delete the manual ValidateAsync call from the controller - the behavior now does it',
        'Press F5 and POST /api/courses once with valid data and once with { "code": "C1", "title": "", "fee": 0, "capacity": 500 }',
      ],
      code: behaviorsCode,
      result: `POST /api/courses (valid)
info: LoggingBehavior[0]  Handling CreateCourseCommand
info: Microsoft.EntityFrameworkCore.Database.Command[20101]  Executed DbCommand (5ms) INSERT INTO [Courses] ...
info: LoggingBehavior[0]  Handled CreateCourseCommand in 41 ms
-> 201 Created { "id": 3 }

POST /api/courses (invalid)
info: LoggingBehavior[0]  Handling CreateCourseCommand
warn: GlobalExceptionHandler[0]  Handled ValidationException: Validation failed: ...
-> 400 Bad Request
{
  "title": "Validation failed",
  "status": 400,
  "errors": {
    "Code": [ "'Code' must be 5 characters in length. You entered 2 characters." ],
    "Fee": [ "'Fee' must be greater than '0'." ],
    "Capacity": [ "'Capacity' must be between 1 and 300. You entered 500." ]
  },
  "traceId": "0HN5..."
}`,
      explanation:
        'Logging is registered first, so it is the outer layer: it logs "Handling" for both requests. For the invalid request, ValidationBehavior throws before TransactionBehavior and the handler run, so no transaction is opened and nothing touches the database; the exception passes back through LoggingBehavior (which never logs "Handled") to the global handler from Day 7, which builds the 400 response. The command class itself contains no validation, logging or transaction code. Timings and ids will differ. (Title is not validated in this validator, so it has no error.)',
    },
    {
      title: 'See the pipeline order in plain C# (Russian doll)',
      scenario: 'Simulate how MediatR builds the pipeline: three behaviors wrap a handler. Follow the order of the log lines for a valid request and for one that fails validation.',
      steps: [
        'File > New > Project > Console App, name it PipelineDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Move the Validation entry above Logging and run again - an invalid request is no longer logged',
      ],
      code: pipelineSimCode,
      csharp: { files: { 'Program.cs': pipelineSimCode }, stdin: '' },
      result: `[Logging] -> EnrollCommand { StudentId = 7, CourseCode = CS101 }
[Validation] ok
[Transaction] BEGIN
[Handler] enrolling 7 in CS101
[Transaction] COMMIT
[Logging] <- 200 OK

[Logging] -> EnrollCommand { StudentId = 0, CourseCode = CS1 }
[Validation] failed, handler NOT called
[Logging] <- 400 Bad Request`,
      explanation:
        'Send wraps the handler starting from the LAST behavior, so the first behavior in the list ends up outermost: Logging -> Validation -> Transaction -> Handler on the way in, and the "after" code runs in reverse on the way out (COMMIT before Logging\'s "<-" line). In the second request Validation returns without calling next(), so Transaction and the Handler never run - the short-circuit that protects the database. MediatR builds exactly this chain from the behaviors registered with AddOpenBehavior.',
    },
    {
      title: 'Domain events and notification handlers',
      scenario: 'When a student enrols, the Course entity raises StudentEnrolledEvent. After the database save succeeds, two independent handlers react: one sends a confirmation email, one creates a fee invoice.',
      steps: [
        'Add Entity, IDomainEvent and StudentEnrolledEvent to the Domain project (dotnet add src/CollegeHub.Domain package MediatR.Contracts)',
        'Raise the event in Course.Enroll',
        'Override SaveChangesAsync in CollegeDbContext to publish collected events after saving',
        'Add the two INotificationHandler classes in Application/Enrollments/EventHandlers, press F5 and POST /api/courses/1/enrollments',
      ],
      code: eventsCode,
      result: `info: LoggingBehavior[0]  Handling EnrollStudentCommand
info: Microsoft.EntityFrameworkCore.Database.Command[20101]  Executed DbCommand INSERT INTO [Enrollments] ...
info: FakeEmailSender[0]  To: asha@college.in | Enrollment confirmed | You are enrolled in C# Fundamentals
info: SendEnrollmentEmailHandler[0]  Email sent to asha@college.in
info: NotifyAccountsHandler[0]  Fee invoice created for student 7
info: LoggingBehavior[0]  Handled EnrollStudentCommand in 63 ms
-> 201 Created { "id": 15 }`,
      explanation:
        'The entity only records that something happened; it knows nothing about email or accounts. Events are collected and cleared BEFORE saving and published only AFTER base.SaveChangesAsync succeeds, so no email is sent for an enrollment that was rolled back. Both handlers ran, one after another, inside the same request. To add SMS later, just add a third INotificationHandler<StudentEnrolledEvent> - no existing class changes. For guaranteed delivery in production, store events in an outbox table. Ids and timings are examples.',
    },
    {
      title: 'A vertical slice: EnrollStudent in one file',
      scenario: 'Reorganise the enrollment feature as a vertical slice: request, validator, handler and minimal API endpoint together in Features/Enrollments/EnrollStudent.cs.',
      steps: [
        'Create the Features folder in the API project and add EnrollStudent.cs',
        'Make sure AddMediatR and AddValidatorsFromAssembly scan the API assembly (where the slices now live)',
        'Call EnrollStudent.MapEndpoint(app) in Program.cs, press F5 and test in Swagger',
      ],
      code: sliceCode,
      result: `POST /api/courses/1/enrollments { "studentId": 7 }  -> 201 Created  Location: /api/enrollments/16
POST /api/courses/1/enrollments { "studentId": 7 }  -> 409 Conflict (Course.AlreadyEnrolled)
POST /api/courses/1/enrollments { "studentId": 0 }  -> 400 Bad Request (ValidationBehavior)

Files touched to add this feature: 1`,
      explanation:
        'Everything about "enroll a student" is in one static class, so a new developer reads one file to understand the feature. The handler uses the DbContext directly - no generic repository - because the slice owns its data access; the business rules still live in the Course entity. Behaviors and the global exception handler apply to slices exactly as before. Compare: in the layered version the same feature touches files in four projects.',
    },
    {
      title: 'Mini project: Clean Architecture "Course Enrollment" API',
      scenario: 'Assemble the complete CollegeHub API from Days 5 to 9: register students, create courses, enrol (with capacity and duplicate rules), cancel, and list a student\'s enrollments - with validation, logging, transactions, domain events and ProblemDetails.',
      steps: [
        'Start from the Day 5 solution and add the folders and classes listed in the code comments',
        'Create the database with the dotnet ef commands (step 1-2) and run the API (step 3)',
        'In Swagger: POST a student, POST a course with capacity 1, enrol the student, enrol a second student (409 Course.Full), cancel the first enrollment (204), enrol the second student again (201)',
        'Run dotnet test and make sure the domain rules, validators and handlers are covered',
      ],
      code: projectCode,
      result: `POST /api/students {"name":"Asha Patil","email":"asha@college.in"}              -> 201 { "id": 1 }
POST /api/students {"name":"Ravi Kumar","email":"ravi@college.in"}              -> 201 { "id": 2 }
POST /api/courses  {"code":"CS101","title":"C# Fundamentals","fee":4500,"capacity":1} -> 201 { "id": 1 }
POST /api/courses/1/enrollments {"studentId":1}  -> 201 { "id": 1 }   (email + invoice events)
POST /api/courses/1/enrollments {"studentId":2}  -> 409 { "title": "Course.Full", "detail": "Course CS101 has no seats left" }
DELETE /api/enrollments/1                        -> 204 No Content    (EnrollmentCancelledEvent)
POST /api/courses/1/enrollments {"studentId":2}  -> 201 { "id": 2 }
GET  /api/students/2/enrollments                 -> 200 [ { "enrollmentId": 2, "courseCode": "CS101", "courseTitle": "C# Fundamentals" } ]
POST /api/students {"name":"","email":"x"}       -> 400 { "errors": { "Name": [...], "Email": [...] } }`,
      explanation:
        'Every request goes controller -> ISender -> Logging -> Validation -> Transaction -> handler. Commands use the domain model, repositories and the unit of work; queries use Dapper projections. Expected failures (Course.Full) come back as Result errors mapped to 409 ProblemDetails, invalid input is a 400 from the ValidationBehavior, and anything unexpected becomes a safe 500 with a traceId. Domain events trigger email and invoice handlers after the save. This structure is what interviewers mean by "Clean Architecture with CQRS and MediatR" - be ready to draw it and explain each arrow.',
    },
  ],
  interview: [
    { q: 'What is a MediatR pipeline behavior?', a: 'A class implementing IPipelineBehavior<TRequest, TResponse> that wraps request handling like middleware. It can run code before and after the handler (by awaiting next()) or short-circuit. Used for cross-cutting concerns: logging, validation, transactions, caching, authorization.', level: 'Easy' },
    { q: 'How do you register pipeline behaviors and does order matter?', a: 'In AddMediatR: cfg.AddOpenBehavior(typeof(LoggingBehavior<,>)). Yes, order matters - behaviors execute in registration order, the first being the outermost. Usually Logging, then Validation, then Transaction.', level: 'Medium' },
    { q: 'How do you implement validation with MediatR and FluentValidation?', a: 'Write AbstractValidator<TCommand> classes, register them with AddValidatorsFromAssembly, and add a ValidationBehavior<TRequest, TResponse> that injects IEnumerable<IValidator<TRequest>>, runs them all, and throws ValidationException (or returns a failure Result) when there are errors. A global exception handler converts it into a 400 ValidationProblemDetails.', level: 'Medium' },
    { q: 'How would you apply a transaction behavior only to commands?', a: 'Use a marker interface (ICommand / ICommand<T>) on commands and check request is ICommand inside the behavior (or constrain the generic type where your DI container supports constrained open generics). Queries skip the transaction.', level: 'Hard' },
    { q: 'IRequest vs INotification in MediatR?', a: 'IRequest is sent with Send and has exactly one handler that returns a response. INotification is published with Publish and can have zero or more handlers, none of which returns a value.', level: 'Easy' },
    { q: 'What are domain events?', a: 'Objects that describe something important that happened in the domain (StudentEnrolled, OrderPaid), raised by entities when a business operation succeeds. They let other parts of the system react without the entity depending on them. They are typically dispatched after SaveChanges.', level: 'Medium' },
    { q: 'Why dispatch domain events after SaveChanges and not before?', a: 'So side effects (emails, invoices) only happen if the data was actually saved. Dispatching before saving could send an email for an enrollment that later fails to commit. Some teams dispatch before save to include handler changes in the same transaction - a trade-off to discuss.', level: 'Hard' },
    { q: 'What happens if one notification handler throws an exception?', a: 'With the default ForeachAwaitPublisher handlers run sequentially and the exception stops the remaining handlers and bubbles to the caller. With TaskWhenAllPublisher all run and exceptions are aggregated. For reliability, use an outbox and retry.', level: 'Hard' },
    { q: 'What is the Outbox pattern?', a: 'Saving integration events/messages into an Outbox table in the SAME database transaction as the business data, then publishing them asynchronously by a background worker with retries. It guarantees that a message is sent if and only if the data was committed.', level: 'Hard' },
    { q: 'What is vertical slice architecture?', a: 'Organising code by feature instead of technical layer: each use case (slice) contains its request, validation, handler, data access and endpoint. It minimises coupling between features and keeps related code together.', level: 'Medium' },
    { q: 'Clean Architecture vs vertical slice: when would you choose which?', a: 'Clean Architecture suits complex domains with rich shared business rules and teams that want strict boundaries. Vertical slices suit feature-heavy apps where features are mostly independent and you want less ceremony. Many projects mix them: a rich Domain project plus vertical slices for application and API code.', level: 'Hard' },
    { q: 'Name some cross-cutting concerns you would implement as pipeline behaviors.', a: 'Logging/timing, validation, transactions/unit of work, caching of queries, authorization checks, performance warnings, retry on transient errors, auditing, idempotency checks for commands.', level: 'Easy' },
    { q: 'Should domain entities reference MediatR?', a: 'Purists say no - define IDomainEvent in Domain and translate to MediatR notifications in Infrastructure. A pragmatic common approach is to let Domain reference only the small MediatR.Contracts package (INotification) which has no behaviour.', level: 'Hard' },
    { q: 'Explain the request flow in your Clean Architecture enrollment API.', a: 'HTTP request -> thin controller creates EnrollStudentCommand -> ISender.Send -> LoggingBehavior -> ValidationBehavior (FluentValidation) -> TransactionBehavior -> handler loads Course and Student via repositories -> Course.Enroll enforces rules and raises StudentEnrolledEvent -> UnitOfWork.SaveChanges -> events published to email/invoice handlers -> Result mapped to 201/404/409 ProblemDetails; unexpected exceptions go to IExceptionHandler -> 500.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a PerformanceBehavior that logs a warning with the request data when any request takes longer than 300 ms.',
      hint: 'Stopwatch around await next(); log the request object with {@Request}.',
      solution: `public sealed class PerformanceBehavior<TRequest, TResponse>(ILogger<PerformanceBehavior<TRequest, TResponse>> log)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var response = await next();
        sw.Stop();
        if (sw.ElapsedMilliseconds > 300)
            log.LogWarning("Long running request {Name} ({Ms} ms) {@Request}", typeof(TRequest).Name, sw.ElapsedMilliseconds, request);
        return response;
    }
}
// cfg.AddOpenBehavior(typeof(PerformanceBehavior<,>));`,
    },
    {
      task: 'Write a CachingBehavior that caches the response of any query implementing ICacheableQuery { string CacheKey { get; } TimeSpan Duration { get; } } using IMemoryCache.',
      hint: 'If request is ICacheableQuery, use cache.GetOrCreateAsync(key, ...).',
      solution: `public interface ICacheableQuery { string CacheKey { get; } TimeSpan Duration { get; } }

public sealed class CachingBehavior<TRequest, TResponse>(IMemoryCache cache)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (request is not ICacheableQuery q) return await next();
        return (await cache.GetOrCreateAsync(q.CacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = q.Duration;
            return next();
        }))!;
    }
}

public record GetCoursesQuery(int Page) : IRequest<List<CourseDto>>, ICacheableQuery
{
    public string CacheKey => $"courses-page-{Page}";
    public TimeSpan Duration => TimeSpan.FromMinutes(5);
}`,
    },
    {
      task: 'Add an EnrollmentCancelledEvent raised by Course.CancelEnrollment(enrollmentId), and a handler that writes "Seat freed in <course>" to the log and notifies the next student on a waiting list (just log it).',
      hint: 'Raise the event in the domain method; one INotificationHandler<EnrollmentCancelledEvent>.',
      solution: `public sealed record EnrollmentCancelledEvent(int CourseId, string CourseTitle, int StudentId) : IDomainEvent;

// in Course
public Result<bool> CancelEnrollment(int enrollmentId)
{
    var e = _enrollments.FirstOrDefault(x => x.Id == enrollmentId);
    if (e is null) return CourseErrors.EnrollmentNotFound(enrollmentId);
    _enrollments.Remove(e);
    Raise(new EnrollmentCancelledEvent(Id, Title, e.StudentId));
    return true;
}

public class SeatFreedHandler(ILogger<SeatFreedHandler> log, IWaitingListService waiting)
    : INotificationHandler<EnrollmentCancelledEvent>
{
    public async Task Handle(EnrollmentCancelledEvent e, CancellationToken ct)
    {
        log.LogInformation("Seat freed in {Course}", e.CourseTitle);
        var next = await waiting.GetNextAsync(e.CourseId, ct);
        if (next is not null) log.LogInformation("Notify student {Student} that a seat is free", next.StudentId);
    }
}`,
    },
    {
      task: 'Convert the GetStudentEnrollments query into a vertical slice file with Query, Handler (Dapper) and a minimal API endpoint GET /api/students/{id}/enrollments.',
      hint: 'public static class GetStudentEnrollments { record Query; record Row; class Handler; MapEndpoint }',
      solution: `public static class GetStudentEnrollments
{
    public record Query(int StudentId) : IRequest<IReadOnlyList<Row>>;
    public record Row(int EnrollmentId, string CourseCode, string CourseTitle);

    internal sealed class Handler(ISqlConnectionFactory f) : IRequestHandler<Query, IReadOnlyList<Row>>
    {
        public async Task<IReadOnlyList<Row>> Handle(Query q, CancellationToken ct)
        {
            using var conn = f.Create();
            var rows = await conn.QueryAsync<Row>(new CommandDefinition("""
                SELECT e.Id AS EnrollmentId, c.Code AS CourseCode, c.Title AS CourseTitle
                FROM Enrollments e INNER JOIN Courses c ON c.Id = e.CourseId
                WHERE e.StudentId = @StudentId ORDER BY c.Code
                """, new { q.StudentId }, cancellationToken: ct));
            return rows.AsList();
        }
    }

    public static void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("/api/students/{id:int}/enrollments",
            async (int id, ISender sender, CancellationToken ct) => Results.Ok(await sender.Send(new Query(id), ct)));
}`,
    },
    {
      task: 'Write a unit test for ValidationBehavior: when the validator fails, the handler (next) must NOT be called and a ValidationException must be thrown.',
      hint: 'Pass a delegate that sets a flag; use InlineValidator<T> or a real validator.',
      solution: `[Fact]
public async Task Invalid_request_does_not_reach_handler()
{
    var validator = new InlineValidator<CreateCourseCommand>();
    validator.RuleFor(x => x.Code).Length(5);
    var behavior = new ValidationBehavior<CreateCourseCommand, int>(new[] { validator });
    bool handlerCalled = false;

    await Assert.ThrowsAsync<ValidationException>(() =>
        behavior.Handle(new CreateCourseCommand("C1", "C#", 100, 10),
                        () => { handlerCalled = true; return Task.FromResult(1); },
                        CancellationToken.None));

    Assert.False(handlerCalled);
}`,
    },
  ],
  quiz: [
    {
      question: 'Behaviors are registered as Logging, then Validation, then Transaction. Which runs FIRST when a request is sent?',
      options: ['Transaction', 'Validation', 'The handler', 'Logging'],
      answer: 3,
      explanation: 'The first registered behavior is the outermost layer of the pipeline.',
    },
    {
      question: 'How does a pipeline behavior stop a request from reaching its handler?',
      options: ['By not calling (or awaiting) next() - returning or throwing instead', 'By calling next() twice', 'By registering it as Singleton', 'It cannot'],
      answer: 0,
      explanation: 'Like middleware, a behavior short-circuits by not invoking next.',
    },
    {
      question: 'StudentEnrolledEvent must trigger an email AND a fee invoice. What should it be?',
      options: ['An IRequest with two handlers', 'An INotification with two INotificationHandler classes', 'A pipeline behavior', 'A controller action'],
      answer: 1,
      explanation: 'Notifications can have many handlers; requests have exactly one.',
    },
    {
      question: 'Why publish domain events AFTER SaveChanges succeeds?',
      options: ['It is faster', 'MediatR requires it', 'So side effects such as emails happen only for data that was really saved', 'To avoid using DI'],
      answer: 2,
      explanation: 'Otherwise a rolled-back change could still trigger an email or invoice.',
    },
    {
      question: 'What best describes vertical slice architecture?',
      options: [
        'Each feature keeps its request, validation, handler and endpoint together',
        'One project per database table',
        'All code in controllers',
        'Splitting the app into microservices',
      ],
      answer: 0,
      explanation: 'Slices organise code by feature rather than by technical layer.',
    },
  ],
};
