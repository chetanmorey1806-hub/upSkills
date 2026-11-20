const mediatrCode = `// dotnet add src/CollegeHub.Application package MediatR
// (MediatR 12.x is Apache-licensed; 13+ needs a license key - free community tier available)

// ===================== Application/Courses/Commands/CreateCourse.cs =====================
using MediatR;
namespace CollegeHub.Application.Courses.Commands;

// a COMMAND changes state and returns at most an id / Result
public record CreateCourseCommand(string Code, string Title, decimal Fee, int Capacity) : IRequest<int>;

public class CreateCourseCommandHandler(ICourseRepository courses, IUnitOfWork uow)
    : IRequestHandler<CreateCourseCommand, int>
{
    public async Task<int> Handle(CreateCourseCommand request, CancellationToken ct)
    {
        var course = Course.Create(request.Code, request.Title, request.Fee, request.Capacity);
        courses.Add(course);
        await uow.SaveChangesAsync(ct);
        return course.Id;
    }
}

// ===================== Application/Courses/Commands/DeleteCourse.cs =====================
public record DeleteCourseCommand(int Id) : IRequest<bool>;

public class DeleteCourseCommandHandler(ICourseRepository courses, IUnitOfWork uow)
    : IRequestHandler<DeleteCourseCommand, bool>
{
    public async Task<bool> Handle(DeleteCourseCommand request, CancellationToken ct)
    {
        var course = await courses.GetByIdAsync(request.Id, ct);
        if (course is null) return false;
        courses.Remove(course);
        await uow.SaveChangesAsync(ct);
        return true;
    }
}

// ===================== Application/Courses/Queries/GetCourses.cs =====================
// a QUERY only reads; it can bypass repositories and use Dapper for speed
using Dapper;
namespace CollegeHub.Application.Courses.Queries;

public record CourseDto(int Id, string Code, string Title, decimal Fee, int Capacity);
public record GetCoursesQuery(decimal? MaxFee) : IRequest<IReadOnlyList<CourseDto>>;
public record GetCourseByIdQuery(int Id) : IRequest<CourseDto?>;

public class GetCoursesQueryHandler(ISqlConnectionFactory factory)
    : IRequestHandler<GetCoursesQuery, IReadOnlyList<CourseDto>>
{
    public async Task<IReadOnlyList<CourseDto>> Handle(GetCoursesQuery q, CancellationToken ct)
    {
        using var conn = factory.Create();
        var rows = await conn.QueryAsync<CourseDto>(new CommandDefinition(
            "SELECT Id, Code, Title, Fee, Capacity FROM Courses WHERE (@MaxFee IS NULL OR Fee <= @MaxFee) ORDER BY Code",
            new { q.MaxFee }, cancellationToken: ct));
        return rows.AsList();
    }
}

public class GetCourseByIdQueryHandler(ISqlConnectionFactory factory)
    : IRequestHandler<GetCourseByIdQuery, CourseDto?>
{
    public async Task<CourseDto?> Handle(GetCourseByIdQuery q, CancellationToken ct)
    {
        using var conn = factory.Create();
        return await conn.QuerySingleOrDefaultAsync<CourseDto>(new CommandDefinition(
            "SELECT Id, Code, Title, Fee, Capacity FROM Courses WHERE Id = @Id", new { q.Id }, cancellationToken: ct));
    }
}

// ===================== Application/DependencyInjection.cs =====================
public static IServiceCollection AddApplication(this IServiceCollection services)
{
    services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);   // finds every handler
        // cfg.LicenseKey = "...";   // MediatR 13+
    });
    return services;
}

// ===================== Api/Controllers/CoursesController.cs (THIN) =====================
using MediatR;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/courses")]
public class CoursesController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] decimal? maxFee, CancellationToken ct) =>
        Ok(await sender.Send(new GetCoursesQuery(maxFee), ct));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct) =>
        await sender.Send(new GetCourseByIdQuery(id), ct) is { } dto ? Ok(dto) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create(CreateCourseCommand command, CancellationToken ct)
    {
        int id = await sender.Send(command, ct);
        return CreatedAtAction(nameof(Get), new { id }, new { id });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await sender.Send(new DeleteCourseCommand(id), ct) ? NoContent() : NotFound();
}`;

const miniMediatorCode = `using System;
using System.Collections.Generic;
using System.Linq;

var db = new List<Course>();               // pretend database
var mediator = new Mediator();
mediator.Register(new CreateCourseHandler(db));
mediator.Register(new GetCourseByCodeHandler(db));
mediator.Register(new ListCoursesHandler(db));

// the caller only knows REQUESTS, never handlers
int id1 = mediator.Send(new CreateCourseCommand("CS101", "C# Fundamentals", 4500));
int id2 = mediator.Send(new CreateCourseCommand("DB201", "SQL Server", 3800));
Console.WriteLine($"Created ids: {id1}, {id2}");

CourseDto? found = mediator.Send(new GetCourseByCodeQuery("DB201"));
Console.WriteLine(found);
Console.WriteLine(mediator.Send(new GetCourseByCodeQuery("ML301")) is null ? "ML301 not found" : "found");

foreach (var c in mediator.Send(new ListCoursesQuery(MaxFee: 4000)))
    Console.WriteLine($"Affordable: {c.Code} {c.Fee}");

// ---------- the mediator contracts (simplified MediatR, synchronous) ----------
interface IRequest<TResponse> { }

interface IRequestHandler<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    TResponse Handle(TRequest request);
}

class Mediator
{
    private readonly Dictionary<Type, Func<object, object?>> _handlers = new();

    public void Register<TRequest, TResponse>(IRequestHandler<TRequest, TResponse> handler)
        where TRequest : IRequest<TResponse>
        => _handlers[typeof(TRequest)] = request => handler.Handle((TRequest)request);

    public TResponse Send<TResponse>(IRequest<TResponse> request)
    {
        Console.WriteLine($"[mediator] {request.GetType().Name} -> handler");
        return (TResponse)_handlers[request.GetType()](request)!;
    }
}

// ---------- model, commands, queries ----------
record Course(int Id, string Code, string Title, decimal Fee);
record CourseDto(string Code, string Title, decimal Fee);

record CreateCourseCommand(string Code, string Title, decimal Fee) : IRequest<int>;
record GetCourseByCodeQuery(string Code) : IRequest<CourseDto?>;
record ListCoursesQuery(decimal MaxFee) : IRequest<List<CourseDto>>;

// ---------- one handler per request ----------
class CreateCourseHandler(List<Course> db) : IRequestHandler<CreateCourseCommand, int>
{
    public int Handle(CreateCourseCommand cmd)
    {
        var course = new Course(db.Count + 1, cmd.Code, cmd.Title, cmd.Fee);
        db.Add(course);
        return course.Id;
    }
}

class GetCourseByCodeHandler(List<Course> db) : IRequestHandler<GetCourseByCodeQuery, CourseDto?>
{
    public CourseDto? Handle(GetCourseByCodeQuery q) =>
        db.Where(c => c.Code == q.Code).Select(c => new CourseDto(c.Code, c.Title, c.Fee)).FirstOrDefault();
}

class ListCoursesHandler(List<Course> db) : IRequestHandler<ListCoursesQuery, List<CourseDto>>
{
    public List<CourseDto> Handle(ListCoursesQuery q) =>
        db.Where(c => c.Fee <= q.MaxFee).OrderBy(c => c.Fee)
          .Select(c => new CourseDto(c.Code, c.Title, c.Fee)).ToList();
}`;

const beforeAfterCode = `// ===================== BEFORE: fat controller =====================
[HttpPost("{courseId:int}/enroll")]
public async Task<IActionResult> Enroll(int courseId, EnrollRequest req)
{
    if (req.StudentId <= 0) return BadRequest("Invalid student");                 // validation
    var course = await _db.Courses.Include(c => c.Enrollments)                     // data access
                                  .FirstOrDefaultAsync(c => c.Id == courseId);
    if (course is null) return NotFound();
    if (course.Enrollments.Count >= course.Capacity) return Conflict("Course full"); // business rule
    if (course.Enrollments.Any(e => e.StudentId == req.StudentId)) return Conflict("Already enrolled");
    course.Enrollments.Add(new Enrollment { StudentId = req.StudentId, EnrolledOn = DateTime.UtcNow });
    await _db.SaveChangesAsync();
    await _email.SendAsync(req.StudentId, $"Enrolled in {course.Title}");          // side effect
    _logger.LogInformation("Enrolled {Student} in {Course}", req.StudentId, courseId); // logging
    return Ok();
}

// ===================== AFTER: thin controller + MediatR =====================
// Api
[HttpPost("{courseId:int}/enroll")]
public async Task<IActionResult> Enroll(int courseId, EnrollRequest req, CancellationToken ct)
{
    Result<int> result = await sender.Send(new EnrollStudentCommand(req.StudentId, courseId), ct);
    return result.ToActionResult(this);           // 200 / 404 / 409 mapping from Day 7
}

// Application/Enrollments/EnrollStudent.cs
public record EnrollStudentCommand(int StudentId, int CourseId) : IRequest<Result<int>>;

public class EnrollStudentCommandHandler(ICourseRepository courses, IRepository<Student> students, IUnitOfWork uow)
    : IRequestHandler<EnrollStudentCommand, Result<int>>
{
    public async Task<Result<int>> Handle(EnrollStudentCommand cmd, CancellationToken ct)
    {
        var course = await courses.GetWithEnrollmentsAsync(cmd.CourseId, ct);
        if (course is null) return CourseErrors.NotFound(cmd.CourseId);
        var student = await students.GetByIdAsync(cmd.StudentId, ct);
        if (student is null) return StudentErrors.NotFound(cmd.StudentId);

        var enrolled = course.Enroll(student);        // Result from the domain: full / duplicate
        if (!enrolled.IsSuccess) return enrolled.Error!;

        await uow.SaveChangesAsync(ct);
        return enrolled.Value;                        // new enrollment id
    }
}
// Validation, logging and the email move to pipeline behaviors and
// notification handlers on Day 9 - the handler stays focused on ONE use case.`;

const minimalApiCode = `// ===================== Api/Endpoints/CourseEndpoints.cs (Minimal API + MediatR) =====================
using MediatR;

public static class CourseEndpoints
{
    public static IEndpointRouteBuilder MapCourseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v2/courses").WithTags("Courses");

        group.MapGet("/", async (decimal? maxFee, ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new GetCoursesQuery(maxFee), ct)));

        group.MapGet("/{id:int}", async (int id, ISender sender, CancellationToken ct) =>
            await sender.Send(new GetCourseByIdQuery(id), ct) is { } dto
                ? Results.Ok(dto)
                : Results.NotFound())
             .WithName("GetCourseById");

        group.MapPost("/", async (CreateCourseCommand cmd, ISender sender, CancellationToken ct) =>
        {
            int id = await sender.Send(cmd, ct);
            return Results.CreatedAtRoute("GetCourseById", new { id }, new { id });
        });

        return app;
    }
}

// Program.cs
builder.Services.AddApplication();          // AddMediatR inside
builder.Services.AddInfrastructure(builder.Configuration);
var app = builder.Build();
app.MapControllers();
app.MapCourseEndpoints();
app.Run();`;

export default {
  id: 'day-08-cqrs-mediatr',
  title: 'CQRS with MediatR: Commands, Queries, Handlers and Thin Controllers',
  module: 'Module 2: Clean Architecture, CQRS & MediatR',
  day: 8,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Split every use case into a command (changes data) or a query (reads data), send it through MediatR, and handle it in one small, testable handler class. Learn IRequest<T>, IRequestHandler, ISender, DI registration with RegisterServicesFromAssembly, how to keep controllers and minimal APIs thin, and how CQRS lets reads use Dapper while writes use EF Core.',
  objectives: [
    'Explain CQRS and the difference between commands and queries',
    'Explain the mediator pattern and what MediatR adds',
    'Create requests with IRequest<T> and handlers with IRequestHandler<TRequest, TResponse>',
    'Register MediatR in DI and call it from thin controllers and minimal APIs with ISender',
    'Organise the Application layer by feature (Commands/Queries folders)',
  ],
  theory: [
    {
      heading: 'What is CQRS?',
      content:
        'CQRS (Command Query Responsibility Segregation) means using different models for writing and reading data. A command (CreateCourse, EnrollStudent, CancelOrder) changes state, enforces business rules and returns nothing or just an id/result. A query (GetCourseById, GetCourses, GetStudentReport) only reads and never changes state. Reads and writes have different needs: writes need rich domain entities, validation and transactions; reads need fast, flattened DTOs, paging and filtering. Separating them lets each side be optimised - e.g. EF Core with change tracking for commands and Dapper or AsNoTracking projections for queries.',
      points: [
        'It grew from CQS (Bertrand Meyer): a method should either change state or return data, not both',
        'Level 1 (most common): same database, separate command and query classes/handlers',
        'Level 2: separate read models or read replicas, updated from the write side',
        'Level 3: event sourcing - NOT required for CQRS',
        'Commands are named as verbs in the imperative (EnrollStudentCommand); queries as Get... (GetCoursesQuery)',
      ],
    },
    {
      heading: 'The mediator pattern and MediatR',
      content:
        'In a fat controller, the controller knows every service it calls. The mediator pattern puts an object in the middle: the controller sends a request object to the mediator, and the mediator finds the one handler for that request type and runs it. The controller does not know which class handles it. MediatR (by Jimmy Bogard) is the standard in-process mediator for .NET. It is NOT a message queue - everything runs in the same process and the same request, in memory. Its real power is pipeline behaviors (Day 9): code that runs around every handler, such as validation, logging, transactions and caching.',
      points: [
        'IRequest<TResponse>: marker for a request that returns TResponse (IRequest without a type for "no result")',
        'IRequestHandler<TRequest, TResponse>: exactly ONE handler per request type, with Task<TResponse> Handle(TRequest request, CancellationToken ct)',
        'ISender.Send(request): send a request; IPublisher.Publish(notification): notifications (Day 9); IMediator = both',
        'Licensing: MediatR 12.x is free (Apache 2.0); from version 13 (2025) a commercial license key is required, with a free community tier',
      ],
    },
    {
      heading: 'Writing commands, queries and handlers',
      content:
        'Requests are usually C# records (immutable, value equality, short). Put each request and its handler in the same file or folder under the feature: Application/Courses/Commands/CreateCourse.cs, Application/Courses/Queries/GetCourses.cs. The handler gets its dependencies through constructor injection - repositories and unit of work for commands, a connection factory or a read DbContext for queries. Always accept and pass the CancellationToken so a cancelled HTTP request also cancels the database call.',
      syntax: `public record GetCourseByIdQuery(int Id) : IRequest<CourseDto?>;

public class GetCourseByIdQueryHandler(ICourseReadRepository repo)
    : IRequestHandler<GetCourseByIdQuery, CourseDto?>
{
    public Task<CourseDto?> Handle(GetCourseByIdQuery request, CancellationToken ct) =>
        repo.GetDtoAsync(request.Id, ct);
}

public record ArchiveCourseCommand(int Id) : IRequest;        // no return value
public class ArchiveCourseCommandHandler(...) : IRequestHandler<ArchiveCourseCommand>
{
    public async Task Handle(ArchiveCourseCommand request, CancellationToken ct) { ... }
}`,
    },
    {
      heading: 'Wiring MediatR in DI',
      content:
        'Install the MediatR package in the Application project and register it in AddApplication. RegisterServicesFromAssembly scans the assembly and registers every IRequestHandler, INotificationHandler and pre/post processor as transient. Inject ISender (preferred for controllers, because they only send) or IMediator. If a request has no registered handler you get InvalidOperationException "No service for type IRequestHandler<...> has been registered" - usually because the handler is in a different assembly that was not scanned.',
      syntax: `services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));
// or: cfg.RegisterServicesFromAssemblyContaining<CreateCourseCommand>();`,
    },
    {
      heading: 'Thin controllers and minimal APIs',
      content:
        'With MediatR a controller action does only three things: map the HTTP input to a command or query, send it, and map the result to an HTTP response. No business rules, no data access, no try/catch. Controllers now depend only on ISender, so adding a new endpoint never requires changing constructor parameters, and the same handler can be reused from a gRPC service, a background job, a Blazor page or a unit test. Minimal APIs work the same way: inject ISender into the endpoint delegate.',
      points: [
        'Bind the command directly from the body when the shapes match; otherwise map a request DTO to a command',
        'Never put HttpContext, IActionResult or status codes inside handlers - that is presentation logic',
        'Unit test handlers directly: new CreateCourseCommandHandler(fakeRepo, fakeUow).Handle(cmd, ct)',
      ],
    },
    {
      heading: 'Pros, cons and common criticisms',
      content:
        'Benefits: single-responsibility handlers, consistent structure across a big team, easy unit testing, cross-cutting concerns in one place (pipeline behaviors), and a natural fit with Clean Architecture and vertical slices. Costs: one more indirection (Ctrl+Click on Send does not jump to the handler - use "Go to Implementation" on the request type), more files, a tiny runtime overhead, and for very small CRUD apps it can feel like ceremony. Interviewers like candidates who can say both sides.',
      tip: 'Navigation tip: in Visual Studio put the cursor on the request type (e.g. CreateCourseCommand) and press Shift+F12 (Find All References) to jump straight to its handler.',
    },
  ],
  examples: [
    {
      title: 'Commands, queries and a thin controller with MediatR',
      scenario: 'Refactor the CollegeHub courses API to CQRS: CreateCourse and DeleteCourse commands use EF Core repositories and the unit of work; GetCourses and GetCourseById queries use Dapper; the controller only sends requests.',
      steps: [
        'dotnet add src/CollegeHub.Application package MediatR (and Dapper for the queries)',
        'Create the folders Application/Courses/Commands and Application/Courses/Queries and add the files',
        'Call services.AddMediatR(...) inside AddApplication',
        'Replace CoursesController with the thin version, press F5 and test in Swagger',
      ],
      code: mediatrCode,
      result: `POST /api/courses  { "code": "CS101", "title": "C# Fundamentals", "fee": 4500, "capacity": 60 }
-> 201 Created   Location: /api/courses/1   { "id": 1 }

POST /api/courses  { "code": "DB201", "title": "SQL Server", "fee": 3800, "capacity": 40 }
-> 201 Created   Location: /api/courses/2   { "id": 2 }

GET /api/courses?maxFee=4000 -> 200 OK
[ { "id": 2, "code": "DB201", "title": "SQL Server", "fee": 3800.00, "capacity": 40 } ]

GET /api/courses/7  -> 404 Not Found
DELETE /api/courses/2 -> 204 No Content`,
      explanation:
        'Each endpoint is one line: create a request, Send it, map the result. MediatR resolves exactly one handler per request type from DI. The write side goes through the domain entity, repository and unit of work (rules and transactions); the read side runs a single Dapper SELECT straight into DTOs - that split is CQRS. The (@MaxFee IS NULL OR Fee <= @MaxFee) trick makes the filter optional. CancellationToken flows from the HTTP request into Dapper via CommandDefinition. Ids assume an empty Courses table.',
    },
    {
      title: 'Build a mini mediator to see how MediatR works',
      scenario: 'Write a tiny synchronous mediator: requests implement IRequest<T>, each request type has one handler, and Send finds the handler by the request\'s type.',
      steps: [
        'File > New > Project > Console App, name it MiniMediator',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Add a DeleteCourseCommand : IRequest<bool> with its handler and register it',
      ],
      code: miniMediatorCode,
      csharp: { files: { 'Program.cs': miniMediatorCode }, stdin: '' },
      result: `[mediator] CreateCourseCommand -> handler
[mediator] CreateCourseCommand -> handler
Created ids: 1, 2
[mediator] GetCourseByCodeQuery -> handler
CourseDto { Code = DB201, Title = SQL Server, Fee = 3800 }
[mediator] GetCourseByCodeQuery -> handler
ML301 not found
[mediator] ListCoursesQuery -> handler
Affordable: DB201 3800`,
      explanation:
        'The calling code never mentions a handler class - only request objects. The C# compiler infers TResponse from the request: CreateCourseCommand is IRequest<int>, so Send returns int; ListCoursesQuery returns List<CourseDto>. Inside, the mediator keeps a dictionary from request type to handler. Real MediatR does the same with the DI container (it resolves IRequestHandler<TRequest, TResponse>), works asynchronously and wraps every call in pipeline behaviors. CS101 costs 4500, so only DB201 passes MaxFee 4000.',
    },
    {
      title: 'From fat controller to thin controller + command handler',
      scenario: 'The enroll endpoint mixes validation, data access, business rules, email and logging. Move the use case into EnrollStudentCommandHandler and leave the controller with HTTP work only.',
      steps: [
        'Create Application/Enrollments/EnrollStudent.cs with the command and handler',
        'Move the rules (full, duplicate) into Course.Enroll in the Domain, returning a Result',
        'Replace the controller action with the thin version and keep the Day 7 ToActionResult extension',
        'Write a unit test for the handler using fake repositories',
      ],
      code: beforeAfterCode,
      result: `POST /api/courses/1/enroll { "studentId": 7 }  -> 200 OK  15
POST /api/courses/1/enroll { "studentId": 7 }  -> 409 Conflict  { "title": "Enrollment.Duplicate", ... }
POST /api/courses/99/enroll { "studentId": 7 } -> 404 Not Found { "title": "Course.NotFound", ... }

Controller: 3 lines, 1 dependency (ISender)
Handler   : 1 use case, testable without HTTP or a database`,
      explanation:
        'The "before" action has six responsibilities and needs four injected services, and none of it can be reused or unit-tested without a web server. After the refactor, the controller translates HTTP to a command and a Result back to HTTP; the handler orchestrates one use case; the domain entity owns the rules. Validation, logging and the email are not lost - Day 9 moves them into pipeline behaviors and notification handlers. The enrollment id (15) is an example value.',
    },
    {
      title: 'MediatR with Minimal API endpoints',
      scenario: 'Expose the same queries and commands as a versioned minimal API group, reusing the handlers without any change.',
      steps: [
        'Add Api/Endpoints/CourseEndpoints.cs',
        'Call app.MapCourseEndpoints() in Program.cs',
        'Press F5: Swagger shows the v2 endpoints under the "Courses" tag next to the controller endpoints',
      ],
      code: minimalApiCode,
      result: `GET /api/v2/courses?maxFee=4000 -> 200 OK  [ { "id": 2, "code": "DB201", ... } ]
GET /api/v2/courses/1          -> 200 OK  { "id": 1, "code": "CS101", ... }
POST /api/v2/courses           -> 201 Created  Location: /api/v2/courses/3`,
      explanation:
        'Minimal API delegates get ISender and CancellationToken injected as parameters. Because the business logic is in handlers, the controller API and the minimal API share 100% of the code - this is what "the presentation layer is a detail" means in practice. WithName lets CreatedAtRoute build the Location header.',
    },
  ],
  interview: [
    { q: 'What is CQRS?', a: 'Command Query Responsibility Segregation: separating the models/paths that change state (commands) from those that read state (queries), so each can be designed and optimised independently.', level: 'Easy' },
    { q: 'What is the difference between a command and a query?', a: 'A command expresses an intent to change state (CreateOrder), enforces rules and returns nothing or minimal data (id, Result). A query returns data and has no side effects. A query should be safe to run any number of times.', level: 'Easy' },
    { q: 'Does CQRS require two databases or event sourcing?', a: 'No. Most implementations use one database with separate command and query handlers. Separate read stores, read replicas or event sourcing are optional, advanced steps used when read and write loads differ a lot.', level: 'Medium' },
    { q: 'What is MediatR and what problem does it solve?', a: 'An in-process implementation of the mediator pattern for .NET. Callers send request objects; MediatR finds the single handler via DI. It decouples controllers from business logic, encourages one class per use case and enables pipeline behaviors for cross-cutting concerns.', level: 'Easy' },
    { q: 'Is MediatR a message broker like RabbitMQ?', a: 'No. It runs in memory inside one process during the same request. There is no queue, retry, persistence or distribution. For cross-service messaging use RabbitMQ, Azure Service Bus or Kafka (often with MassTransit).', level: 'Medium' },
    { q: 'Write the signature of a MediatR request and handler that returns a CourseDto.', a: 'public record GetCourseQuery(int Id) : IRequest<CourseDto>; public class GetCourseQueryHandler : IRequestHandler<GetCourseQuery, CourseDto> { public Task<CourseDto> Handle(GetCourseQuery request, CancellationToken cancellationToken) { ... } }', level: 'Easy' },
    { q: 'How do you register MediatR handlers?', a: 'services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(SomeTypeInApplication).Assembly)); It scans the assembly and registers all handlers. Missing scanning of the right assembly leads to "No service for type IRequestHandler<...>".', level: 'Medium' },
    { q: 'ISender vs IPublisher vs IMediator?', a: 'ISender has Send (request/response, one handler). IPublisher has Publish (notifications, zero or more handlers). IMediator implements both. Inject the narrowest one you need, usually ISender in controllers.', level: 'Medium' },
    { q: 'Can two handlers handle the same IRequest?', a: 'No - a request has exactly one handler (the last registered wins or resolution fails). If several components must react to something, publish an INotification, which can have many handlers.', level: 'Medium' },
    { q: 'Why are controllers "thin" with MediatR and why is that good?', a: 'They only translate HTTP to requests and results to HTTP. Business logic lives in handlers that can be reused from other entry points and unit-tested without a web server; controllers no longer need many injected services.', level: 'Easy' },
    { q: 'How would you implement the query side for performance?', a: 'Bypass the domain model: use Dapper or EF Core with AsNoTracking and projections (Select / ProjectTo) straight into DTOs, add paging, and possibly read from a replica or cache. Commands still go through entities, repositories and the unit of work.', level: 'Hard' },
    { q: 'What are the downsides of MediatR?', a: 'Indirection makes navigation harder, more files and ceremony for simple CRUD, risk of "handler calls handler" chains, small runtime overhead, and newer versions require a commercial license for larger companies. Some teams use plain services or vertical slice handlers without MediatR.', level: 'Hard' },
    { q: 'Should a handler call another handler via mediator.Send?', a: 'Generally no. It hides dependencies and creates nested pipelines and transactions. Extract shared logic into a domain service or a reusable component, or publish a notification for side effects.', level: 'Hard' },
    { q: 'Where do commands, queries and handlers live in Clean Architecture?', a: 'In the Application layer, grouped by feature: Application/Courses/Commands/CreateCourse, Application/Courses/Queries/GetCourses. The API layer only references the request types and ISender.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create UpdateCourseFeeCommand(int Id, decimal NewFee) : IRequest<bool> and its handler. Return false when the course does not exist. Add PUT /api/courses/{id}/fee.',
      hint: 'Load with the repository, call a domain method ChangeFee, save with the unit of work.',
      solution: `public record UpdateCourseFeeCommand(int Id, decimal NewFee) : IRequest<bool>;

public class UpdateCourseFeeCommandHandler(ICourseRepository courses, IUnitOfWork uow)
    : IRequestHandler<UpdateCourseFeeCommand, bool>
{
    public async Task<bool> Handle(UpdateCourseFeeCommand cmd, CancellationToken ct)
    {
        var course = await courses.GetByIdAsync(cmd.Id, ct);
        if (course is null) return false;
        course.ChangeFee(cmd.NewFee);           // domain rule: fee must be positive
        await uow.SaveChangesAsync(ct);
        return true;
    }
}

[HttpPut("{id:int}/fee")]
public async Task<IActionResult> UpdateFee(int id, [FromBody] decimal fee, CancellationToken ct) =>
    await sender.Send(new UpdateCourseFeeCommand(id, fee), ct) ? NoContent() : NotFound();`,
    },
    {
      task: 'Create a paged query GetStudentsQuery(int Page, int PageSize, string? Search) returning PagedResult<StudentDto>(Items, TotalCount, Page, PageSize) using Dapper and QueryMultiple.',
      hint: 'Two SELECTs: COUNT(*) and the page with OFFSET/FETCH.',
      solution: `public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
public record GetStudentsQuery(int Page = 1, int PageSize = 20, string? Search = null) : IRequest<PagedResult<StudentDto>>;

public class GetStudentsQueryHandler(ISqlConnectionFactory f) : IRequestHandler<GetStudentsQuery, PagedResult<StudentDto>>
{
    public async Task<PagedResult<StudentDto>> Handle(GetStudentsQuery q, CancellationToken ct)
    {
        const string sql = """
            SELECT COUNT(*) FROM Students WHERE (@Search IS NULL OR Name LIKE '%' + @Search + '%');
            SELECT Id, Name, Email FROM Students
            WHERE (@Search IS NULL OR Name LIKE '%' + @Search + '%')
            ORDER BY Name OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY;
            """;
        using var conn = f.Create();
        using var multi = await conn.QueryMultipleAsync(new CommandDefinition(sql,
            new { q.Search, Skip = (q.Page - 1) * q.PageSize, Take = q.PageSize }, cancellationToken: ct));
        int total = await multi.ReadSingleAsync<int>();
        var items = (await multi.ReadAsync<StudentDto>()).AsList();
        return new PagedResult<StudentDto>(items, total, q.Page, q.PageSize);
    }
}`,
    },
    {
      task: 'Unit test CreateCourseCommandHandler with Moq: verify Add is called once and SaveChangesAsync once, and that the returned id is the course id.',
      hint: 'Use Callback on Add to set an Id like the database would.',
      solution: `[Fact]
public async Task Create_adds_and_saves()
{
    var courses = new Mock<ICourseRepository>();
    var uow = new Mock<IUnitOfWork>();
    courses.Setup(c => c.Add(It.IsAny<Course>()))
           .Callback<Course>(c => typeof(Course).GetProperty("Id")!.SetValue(c, 42));

    var handler = new CreateCourseCommandHandler(courses.Object, uow.Object);
    int id = await handler.Handle(new CreateCourseCommand("CS101", "C#", 4500, 60), CancellationToken.None);

    Assert.Equal(42, id);
    courses.Verify(c => c.Add(It.IsAny<Course>()), Times.Once);
    uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
}`,
    },
    {
      task: 'Classify as command or query and name each request: (a) show a student\'s fee receipt, (b) mark attendance, (c) cancel an enrollment, (d) download the monthly report, (e) reset a password.',
      hint: 'Does it change state?',
      solution: `(a) Query   - GetFeeReceiptQuery(StudentId, ReceiptNo)
(b) Command - MarkAttendanceCommand(CourseId, Date, List<int> PresentStudentIds)
(c) Command - CancelEnrollmentCommand(EnrollmentId, Reason)
(d) Query   - GetMonthlyReportQuery(Year, Month)
(e) Command - ResetPasswordCommand(Email, Token, NewPassword)`,
    },
  ],
  quiz: [
    {
      question: 'Which request is a QUERY?',
      options: ['EnrollStudentCommand', 'GetCourseByIdQuery returning CourseDto', 'DeleteCourseCommand', 'ResetPasswordCommand'],
      answer: 1,
      explanation: 'Queries read data and have no side effects.',
    },
    {
      question: 'How many handlers can a single MediatR IRequest<T> type have?',
      options: ['Exactly one', 'Zero or more', 'At least two', 'One per controller'],
      answer: 0,
      explanation: 'Requests have one handler; notifications can have many.',
    },
    {
      question: 'Which call registers all MediatR handlers from the Application assembly?',
      options: [
        'services.AddScoped<IMediator, Mediator>()',
        'services.AddControllers().AddMediatR()',
        'services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly))',
        'app.UseMediatR()',
      ],
      answer: 2,
      explanation: 'AddMediatR with RegisterServicesFromAssembly scans and registers handlers.',
    },
    {
      question: 'Which statement about MediatR is FALSE?',
      options: [
        'It runs handlers in the same process',
        'ISender.Send returns the handler\'s response',
        'Pipeline behaviors can wrap every request',
        'It stores messages in a durable queue and retries them later',
      ],
      answer: 3,
      explanation: 'MediatR is an in-memory mediator, not a message broker.',
    },
    {
      question: 'What should a thin controller action using MediatR contain?',
      options: [
        'SQL queries and business rules',
        'Mapping HTTP input to a request, sending it, and mapping the result to an HTTP response',
        'A try/catch around every line',
        'new CreateCourseCommandHandler(...) calls',
      ],
      answer: 1,
      explanation: 'Controllers keep only HTTP concerns; handlers contain the use case.',
    },
  ],
};
