const cliCode = `# ===== Create the CollegeHub Clean Architecture solution (PowerShell or bash) =====
mkdir CollegeHub
cd CollegeHub

dotnet new sln -n CollegeHub

# 4 projects: 3 class libraries + 1 Web API
dotnet new classlib -n CollegeHub.Domain         -o src/CollegeHub.Domain
dotnet new classlib -n CollegeHub.Application    -o src/CollegeHub.Application
dotnet new classlib -n CollegeHub.Infrastructure -o src/CollegeHub.Infrastructure
dotnet new webapi   -n CollegeHub.Api            -o src/CollegeHub.Api --use-controllers

# test projects
dotnet new xunit -n CollegeHub.Domain.Tests      -o tests/CollegeHub.Domain.Tests
dotnet new xunit -n CollegeHub.Application.Tests -o tests/CollegeHub.Application.Tests

# add everything to the solution
dotnet sln add src/CollegeHub.Domain/CollegeHub.Domain.csproj
dotnet sln add src/CollegeHub.Application/CollegeHub.Application.csproj
dotnet sln add src/CollegeHub.Infrastructure/CollegeHub.Infrastructure.csproj
dotnet sln add src/CollegeHub.Api/CollegeHub.Api.csproj
dotnet sln add tests/CollegeHub.Domain.Tests/CollegeHub.Domain.Tests.csproj
dotnet sln add tests/CollegeHub.Application.Tests/CollegeHub.Application.Tests.csproj

# project references = the DEPENDENCY RULE (arrows point inwards)
dotnet add src/CollegeHub.Application/CollegeHub.Application.csproj reference src/CollegeHub.Domain/CollegeHub.Domain.csproj
dotnet add src/CollegeHub.Infrastructure/CollegeHub.Infrastructure.csproj reference src/CollegeHub.Application/CollegeHub.Application.csproj
dotnet add src/CollegeHub.Api/CollegeHub.Api.csproj reference src/CollegeHub.Application/CollegeHub.Application.csproj
dotnet add src/CollegeHub.Api/CollegeHub.Api.csproj reference src/CollegeHub.Infrastructure/CollegeHub.Infrastructure.csproj
dotnet add tests/CollegeHub.Domain.Tests/CollegeHub.Domain.Tests.csproj reference src/CollegeHub.Domain/CollegeHub.Domain.csproj
dotnet add tests/CollegeHub.Application.Tests/CollegeHub.Application.Tests.csproj reference src/CollegeHub.Application/CollegeHub.Application.csproj

# packages go ONLY where they are needed
dotnet add src/CollegeHub.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
dotnet add src/CollegeHub.Application package Microsoft.Extensions.DependencyInjection.Abstractions

dotnet build
dotnet run --project src/CollegeHub.Api`;

const domainCode = `using System;
using System.Collections.Generic;

// ---- This is DOMAIN code: pure C#, no EF Core, no ASP.NET, no SQL ----
var course = Course.Create("cs101", "C# Fundamentals", capacity: 2);
Console.WriteLine($"Created {course.Code} '{course.Title}' (capacity {course.Capacity})");

TryEnroll(course, 1);
TryEnroll(course, 2);
TryEnroll(course, 2);      // same student again
TryEnroll(course, 3);      // no seats left
Console.WriteLine($"Seats left: {course.SeatsLeft}");

try
{
    Course.Create("", "No code", 10);
}
catch (DomainException ex)
{
    Console.WriteLine($"Rejected: {ex.Message}");
}

void TryEnroll(Course c, int studentId)
{
    try
    {
        c.Enroll(studentId);
        Console.WriteLine($"Student {studentId} enrolled");
    }
    catch (DomainException ex)
    {
        Console.WriteLine($"Student {studentId} rejected: {ex.Message}");
    }
}

public sealed class DomainException(string message) : Exception(message);

public sealed class Course
{
    private readonly List<int> _studentIds = new();

    public string Code { get; }
    public string Title { get; }
    public int Capacity { get; }
    public IReadOnlyList<int> StudentIds => _studentIds;      // read-only view: no outside Add()
    public int SeatsLeft => Capacity - _studentIds.Count;

    private Course(string code, string title, int capacity)
    {
        Code = code;
        Title = title;
        Capacity = capacity;
    }

    // factory method: an invalid Course can never be created
    public static Course Create(string code, string title, int capacity)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new DomainException("Course code is required");
        if (capacity <= 0) throw new DomainException("Capacity must be positive");
        return new Course(code.Trim().ToUpperInvariant(), title, capacity);
    }

    // business rules live INSIDE the entity
    public void Enroll(int studentId)
    {
        if (_studentIds.Contains(studentId)) throw new DomainException("already enrolled");
        if (SeatsLeft == 0) throw new DomainException("course is full");
        _studentIds.Add(studentId);
    }
}`;

const diCode = `using System;
using System.Collections.Generic;
using System.Linq;

// ===== Composition root (in the real app this is Program.cs in CollegeHub.Api) =====
ICourseRepository repo = new InMemoryCourseRepository();   // Infrastructure
var service = new CourseService(repo);                      // Application

Console.WriteLine(service.AddCourse("cs101", "C# Fundamentals"));
Console.WriteLine(service.AddCourse("CS101", "Duplicate"));
Console.WriteLine(service.AddCourse("db201", "SQL Server"));
foreach (var line in service.ListCourses())
    Console.WriteLine(line);

// ===== Domain =====
public record Course(string Code, string Title);

// ===== Application: owns the INTERFACE it needs =====
public interface ICourseRepository
{
    bool Exists(string code);
    void Add(Course course);
    IReadOnlyList<Course> GetAll();
}

public class CourseService(ICourseRepository repo)
{
    public string AddCourse(string code, string title)
    {
        code = code.ToUpperInvariant();
        if (repo.Exists(code)) return $"Error: {code} already exists";
        repo.Add(new Course(code, title));
        return $"Added {code}";
    }

    public IEnumerable<string> ListCourses() =>
        repo.GetAll().OrderBy(c => c.Code).Select(c => $"{c.Code} - {c.Title}");
}

// ===== Infrastructure: IMPLEMENTS the interface (could be EF Core, Dapper, a file...) =====
public class InMemoryCourseRepository : ICourseRepository
{
    private readonly List<Course> _courses = new();
    public bool Exists(string code) => _courses.Any(c => c.Code == code);
    public void Add(Course course)
    {
        _courses.Add(course);
        Console.WriteLine($"  [Infrastructure] saved {course.Code}");
    }
    public IReadOnlyList<Course> GetAll() => _courses;
}`;

const layersCode = `// ================= CollegeHub.Domain (no references, no packages) =================
// Entities/Student.cs
namespace CollegeHub.Domain.Entities;
public class Student
{
    public int Id { get; private set; }
    public string Name { get; private set; } = "";
    public string Email { get; private set; } = "";
    private Student() { }                                   // for EF Core
    public static Student Create(string name, string email) =>
        new() { Name = name.Trim(), Email = email.Trim().ToLowerInvariant() };
}

// ================= CollegeHub.Application (references Domain) =================
// Abstractions/IStudentRepository.cs
using CollegeHub.Domain.Entities;
namespace CollegeHub.Application.Abstractions;
public interface IStudentRepository
{
    Task<Student?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task AddAsync(Student student, CancellationToken ct = default);
}

// Students/StudentService.cs
using CollegeHub.Application.Abstractions;
using CollegeHub.Domain.Entities;
namespace CollegeHub.Application.Students;
public record StudentDto(int Id, string Name, string Email);
public record RegisterStudentRequest(string Name, string Email);

public class StudentService(IStudentRepository repo)
{
    public async Task<StudentDto?> GetAsync(int id, CancellationToken ct) =>
        await repo.GetByIdAsync(id, ct) is { } s ? new StudentDto(s.Id, s.Name, s.Email) : null;

    public async Task<StudentDto> RegisterAsync(RegisterStudentRequest req, CancellationToken ct)
    {
        if (await repo.EmailExistsAsync(req.Email, ct))
            throw new InvalidOperationException($"Email {req.Email} is already registered");
        var student = Student.Create(req.Name, req.Email);
        await repo.AddAsync(student, ct);
        return new StudentDto(student.Id, student.Name, student.Email);
    }
}

// DependencyInjection.cs
using CollegeHub.Application.Students;
using Microsoft.Extensions.DependencyInjection;
namespace CollegeHub.Application;
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<StudentService>();
        return services;
    }
}

// ================= CollegeHub.Infrastructure (references Application) =================
// Persistence/CollegeDbContext.cs
using CollegeHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace CollegeHub.Infrastructure.Persistence;
public class CollegeDbContext(DbContextOptions<CollegeDbContext> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Student>().Property(s => s.Name).HasMaxLength(100);
        b.Entity<Student>().HasIndex(s => s.Email).IsUnique();
    }
}

// Persistence/StudentRepository.cs
using CollegeHub.Application.Abstractions;
using CollegeHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace CollegeHub.Infrastructure.Persistence;
public class StudentRepository(CollegeDbContext db) : IStudentRepository
{
    public Task<Student?> GetByIdAsync(int id, CancellationToken ct) =>
        db.Students.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, ct);
    public Task<bool> EmailExistsAsync(string email, CancellationToken ct) =>
        db.Students.AnyAsync(s => s.Email == email.ToLower(), ct);
    public async Task AddAsync(Student student, CancellationToken ct)
    {
        db.Students.Add(student);
        await db.SaveChangesAsync(ct);                          // Id is filled after this
    }
}

// DependencyInjection.cs
using CollegeHub.Application.Abstractions;
using CollegeHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
namespace CollegeHub.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<CollegeDbContext>(o =>
            o.UseSqlServer(config.GetConnectionString("CollegeDb")));
        services.AddScoped<IStudentRepository, StudentRepository>();
        return services;
    }
}

// ================= CollegeHub.Api (references Application + Infrastructure) =================
// Controllers/StudentsController.cs
using CollegeHub.Application.Students;
using Microsoft.AspNetCore.Mvc;
namespace CollegeHub.Api.Controllers;
[ApiController]
[Route("api/students")]
public class StudentsController(StudentService service) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct) =>
        await service.GetAsync(id, ct) is { } dto ? Ok(dto) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Register(RegisterStudentRequest req, CancellationToken ct)
    {
        var dto = await service.RegisterAsync(req, ct);
        return CreatedAtAction(nameof(Get), new { id = dto.Id }, dto);
    }
}

// Program.cs - the COMPOSITION ROOT: the only place that knows every layer
using CollegeHub.Application;
using CollegeHub.Infrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();

// Migrations (run from the solution folder):
// dotnet tool install --global dotnet-ef
// dotnet add src/CollegeHub.Api package Microsoft.EntityFrameworkCore.Design
// dotnet ef migrations add Init -p src/CollegeHub.Infrastructure -s src/CollegeHub.Api
// dotnet ef database update -p src/CollegeHub.Infrastructure -s src/CollegeHub.Api`;

export default {
  id: 'day-05-clean-architecture',
  title: 'Clean Architecture: Domain, Application, Infrastructure and API Layers',
  module: 'Module 2: Clean Architecture, CQRS & MediatR',
  day: 5,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Large .NET codebases in product companies follow Clean Architecture: business rules in the centre (Domain), use cases around them (Application), databases and external services at the edge (Infrastructure), and the Web API as the entry point. Learn what each layer contains, the dependency rule, how interfaces invert dependencies, and create the full CollegeHub solution with the dotnet CLI.',
  objectives: [
    'Explain the problems of a single-project "everything in the controller" design',
    'Describe the four layers and what code belongs in each one',
    'Explain the dependency rule and dependency inversion with interfaces',
    'Create a Clean Architecture solution with dotnet new, dotnet sln and project references',
    'Wire layers together with AddApplication/AddInfrastructure extension methods in Program.cs',
  ],
  theory: [
    {
      heading: 'Why architecture? The "fat controller" problem',
      content:
        'In a typical fresher project everything sits in one Web API project: the controller validates input, writes SQL or EF Core queries, applies business rules (fees, discounts, seat limits) and sends emails. It works for 5 endpoints, but at 150 endpoints the same rule is copied into many controllers, nothing can be unit-tested without a database, and changing the database or adding a mobile API means touching everything. Clean Architecture (Robert C. Martin, 2012; similar ideas: Onion and Hexagonal / Ports and Adapters) separates the code by responsibility so business rules do not depend on frameworks, the UI or the database.',
      points: [
        'Goals: testable business logic, independent of UI, database and frameworks',
        'Business rules change for business reasons; database code changes for technical reasons - keep them apart',
        'It adds projects and indirection, so it pays off for medium/large, long-lived apps - not for a 2-day prototype',
      ],
    },
    {
      heading: 'The four layers',
      content:
        'Picture concentric circles. Domain is in the middle, Application around it, and Infrastructure and Presentation (API) on the outside.',
      points: [
        'Domain: entities (Student, Course, Enrollment), value objects (Email, Money), enums, domain exceptions, domain events, business rules inside entities. No NuGet packages, no EF Core, no ASP.NET.',
        'Application: use cases (RegisterStudent, EnrollInCourse), DTOs, interfaces it needs (IStudentRepository, IEmailSender, IUnitOfWork), validation, mapping, CQRS handlers (Day 8). Depends only on Domain.',
        'Infrastructure: implementations of Application interfaces - EF Core DbContext, repositories, Dapper queries, email/SMS senders, file storage, external APIs, migrations.',
        'Presentation / API: controllers or minimal API endpoints, middleware, filters, Program.cs (the composition root). Translates HTTP into Application calls and results into HTTP responses.',
      ],
    },
    {
      heading: 'The dependency rule and dependency inversion',
      content:
        'Source code dependencies point only inwards. Domain knows nothing about the other layers. Application knows Domain. Infrastructure knows Application (to implement its interfaces). But the Application layer still needs to save data - how can it, without referencing Infrastructure? Dependency Inversion (the D in SOLID): the Application layer DEFINES an interface such as IStudentRepository, and Infrastructure IMPLEMENTS it. At runtime, the DI container in Program.cs injects StudentRepository wherever IStudentRepository is requested. The control flow goes outwards (service -> repository -> database) while the compile-time dependency points inwards (Infrastructure -> Application).',
      syntax: `Api ───────────────► Application ───► Domain
 │                        ▲
 └──► Infrastructure ─────┘    (Infrastructure implements Application's interfaces)`,
      tip: 'Interview line: "High-level policy should not depend on low-level details; both should depend on abstractions, and the abstraction is owned by the high-level layer."',
    },
    {
      heading: 'Solution structure and project references',
      content:
        'Each layer is a separate project, so the compiler enforces the dependency rule: if Domain has no reference to Infrastructure, a developer simply cannot use DbContext inside an entity. Create class libraries for Domain, Application and Infrastructure, a Web API project for the API, add them to one solution and add project references only in the allowed direction. Visual Studio: right-click the solution > Add > New Project, and right-click a project > Add > Project Reference. With the CLI use dotnet new, dotnet sln add and dotnet add reference. In .NET 9/10 the SDK can create the newer .slnx solution format; both work with Visual Studio 2022 17.13+.',
      syntax: `dotnet new sln -n CollegeHub
dotnet new classlib -n CollegeHub.Domain -o src/CollegeHub.Domain
dotnet sln add src/CollegeHub.Domain/CollegeHub.Domain.csproj
dotnet add src/CollegeHub.Application/CollegeHub.Application.csproj reference src/CollegeHub.Domain/CollegeHub.Domain.csproj`,
      points: [
        'The API references Infrastructure only to register services in Program.cs (composition root); controllers never use Infrastructure types',
        'Each layer exposes one DI extension method: services.AddApplication(), services.AddInfrastructure(config)',
        'Architecture tests (NetArchTest / ArchUnitNET) can fail the build if someone adds a wrong reference',
        'Templates: dotnet new install Clean.Architecture.Solution.Template (Jason Taylor) for a ready-made starting point',
      ],
    },
    {
      heading: 'Rich domain model vs anemic model',
      content:
        'In an anemic model, entities are just bags of public get/set properties and all rules live in services, so any code can put an entity into an invalid state (Seats = -5). In a rich domain model the entity protects itself: private setters, a factory method (Course.Create) that validates input, and methods named after business actions (Enroll, Drop, ChangeFee) that enforce rules and throw a DomainException when a rule is broken. EF Core can still map such entities (private parameterless constructor, backing fields).',
      points: [
        'Put invariants (rules that must always be true) inside the entity',
        'Expose collections as IReadOnlyList / IReadOnlyCollection with a private List behind them',
        'Value objects (record Email, Money) are compared by value and validate themselves',
      ],
    },
  ],
  examples: [
    {
      title: 'Create the CollegeHub solution with the dotnet CLI',
      scenario: 'Set up the solution we will grow for the rest of this module: four source projects, two test projects and references that follow the dependency rule.',
      steps: [
        'Open a terminal (Windows Terminal / PowerShell, or View > Terminal in Visual Studio) in an empty folder',
        'Run the commands one by one (or save them as setup.ps1)',
        'Open CollegeHub.sln in Visual Studio; right-click CollegeHub.Api > Set as Startup Project and press F5',
        'In Solution Explorer expand Dependencies > Projects of each project to see the references',
      ],
      code: cliCode,
      result: `The template "Solution File" was created successfully.
The template "Class Library" was created successfully.
...
Project \`src\\CollegeHub.Domain\\CollegeHub.Domain.csproj\` added to the solution.
Reference \`..\\CollegeHub.Domain\\CollegeHub.Domain.csproj\` added to the project.
...
Build succeeded.
    0 Warning(s)
    0 Error(s)

CollegeHub/
├── CollegeHub.sln
├── src/
│   ├── CollegeHub.Domain/           (no references)
│   ├── CollegeHub.Application/      -> Domain
│   ├── CollegeHub.Infrastructure/   -> Application (+ EF Core SqlServer)
│   └── CollegeHub.Api/              -> Application, Infrastructure
└── tests/
    ├── CollegeHub.Domain.Tests/      -> Domain
    └── CollegeHub.Application.Tests/ -> Application`,
      explanation:
        'Every arrow points inwards. Because Domain has no references, nobody can accidentally use EF Core or HttpContext inside an entity - the compiler stops them. EF Core is installed only in Infrastructure. Infrastructure gets Domain transitively through Application. Exact CLI messages vary slightly between SDK versions; on .NET 10 the solution file may be CollegeHub.slnx.',
    },
    {
      title: 'A rich Domain entity that protects its own rules',
      scenario: 'A course has limited seats. A student must not be enrolled twice, and a full course must reject new students - no matter which controller, job or test calls it.',
      steps: [
        'File > New > Project > Console App, name it DomainDemo (we use a console to show that Domain code needs no framework)',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Try making _studentIds public and calling course.StudentIds.Add(5) - it does not compile because the property is IReadOnlyList',
      ],
      code: domainCode,
      csharp: { files: { 'Program.cs': domainCode }, stdin: '' },
      result: `Created CS101 'C# Fundamentals' (capacity 2)
Student 1 enrolled
Student 2 enrolled
Student 2 rejected: already enrolled
Student 3 rejected: course is full
Seats left: 0
Rejected: Course code is required`,
      explanation:
        'The private constructor forces everyone to use Course.Create, which validates and normalises the code ("cs101" becomes "CS101"). Enroll checks the duplicate rule first, so the second call for student 2 fails with "already enrolled" even though a seat question would come later; student 3 fails because both seats are taken. The class uses only System types, so it can be unit-tested in milliseconds and reused by the API, a background job or a Blazor app.',
    },
    {
      title: 'Dependency inversion: Application owns the interface, Infrastructure implements it',
      scenario: 'CourseService (Application) must save courses but must not know whether storage is SQL Server, a file or memory. Wire it in a composition root, exactly like Program.cs does.',
      steps: [
        'File > New > Project > Console App, name it DipDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Write a second class FileCourseRepository : ICourseRepository and swap it in the first line - CourseService does not change',
      ],
      code: diCode,
      csharp: { files: { 'Program.cs': diCode }, stdin: '' },
      result: `  [Infrastructure] saved CS101
Added CS101
Error: CS101 already exists
  [Infrastructure] saved DB201
Added DB201
CS101 - C# Fundamentals
DB201 - SQL Server`,
      explanation:
        'CourseService only knows ICourseRepository. The "[Infrastructure] saved" line prints inside repo.Add, before AddCourse returns its message, which is why it appears first. The duplicate check works because the code is upper-cased before Exists is called. In a unit test you would pass a fake repository - no database needed. In the real solution, ICourseRepository lives in CollegeHub.Application and InMemoryCourseRepository/EF repository in CollegeHub.Infrastructure.',
    },
    {
      title: 'All four layers wired together in ASP.NET Core',
      scenario: 'Implement "register a student" end to end: Domain entity, Application service and interface, Infrastructure EF Core repository, API controller, and the DI extension methods.',
      steps: [
        'Add each file to the matching project created in Example 1',
        'Add the package Microsoft.Extensions.DependencyInjection.Abstractions to Application and Microsoft.EntityFrameworkCore.SqlServer to Infrastructure',
        'Add "ConnectionStrings": { "CollegeDb": "Server=localhost;Database=CollegeHubDb;Trusted_Connection=True;TrustServerCertificate=True" } to the API appsettings.json',
        'Create the database with the dotnet ef commands at the bottom, press F5 and POST /api/students in Swagger',
      ],
      code: layersCode,
      result: `POST /api/students
{ "name": "Asha Patil", "email": "Asha@College.in" }
-> 201 Created   Location: /api/students/1
{ "id": 1, "name": "Asha Patil", "email": "asha@college.in" }

POST /api/students  (same email again)
-> 500 Internal Server Error  (InvalidOperationException: Email asha@college.in is already registered)

GET /api/students/1 -> 200 OK
{ "id": 1, "name": "Asha Patil", "email": "asha@college.in" }`,
      explanation:
        'The controller only calls StudentService. StudentService only knows IStudentRepository and the Domain entity. StudentRepository (EF Core) is registered in AddInfrastructure, and Program.cs is the single place that connects everything. The duplicate email currently becomes a 500 error because nobody translates the exception - on Day 7 we add FluentValidation, ProblemDetails and the Result pattern to return a proper 400/409. The -p (project with DbContext) and -s (startup project) flags are needed because migrations live in Infrastructure.',
    },
  ],
  interview: [
    { q: 'What is Clean Architecture?', a: 'An architecture style that organises code in concentric layers - Domain, Application, Infrastructure, Presentation - with the rule that dependencies point inwards. Business logic does not depend on UI, database or frameworks, which makes it testable and easy to change.', level: 'Easy' },
    { q: 'What goes into the Domain layer?', a: 'Entities, value objects, enums, domain exceptions, domain events and business rules (invariants) implemented as entity methods. No dependencies on EF Core, ASP.NET Core or any infrastructure package.', level: 'Easy' },
    { q: 'What goes into the Application layer?', a: 'Use cases / services or CQRS handlers, DTOs, interfaces for things it needs from outside (repositories, unit of work, email, clock), validation rules and mapping. It depends only on Domain.', level: 'Easy' },
    { q: 'Explain the dependency rule.', a: 'Source code dependencies may only point inwards: Presentation and Infrastructure -> Application -> Domain. Inner layers never mention outer-layer types. This is enforced by project references.', level: 'Medium' },
    { q: 'If Application cannot reference Infrastructure, how does it save to the database?', a: 'Through dependency inversion. Application defines IStudentRepository; Infrastructure implements it; the DI container in the API injects the implementation at runtime. Compile-time dependency points inwards while runtime calls go outwards.', level: 'Medium' },
    { q: 'Why does the API project reference Infrastructure? Does that break the rule?', a: 'Program.cs is the composition root and must register Infrastructure services in DI. That reference is allowed for wiring only; controllers should depend on Application abstractions, never on DbContext or repositories directly. Some teams move the wiring into a separate bootstrap project.', level: 'Hard' },
    { q: 'Clean Architecture vs Onion vs Hexagonal architecture?', a: 'They share the same core idea - the domain in the centre, infrastructure at the edges, dependencies inward. Hexagonal (Ports and Adapters) talks about ports (interfaces) and adapters (implementations); Onion names layers Domain Model, Domain Services, Application Services; Clean Architecture is Uncle Bob\'s generalisation with entities, use cases, interface adapters and frameworks.', level: 'Medium' },
    { q: 'Where should the EF Core DbContext live and why?', a: 'In Infrastructure (Persistence folder), because it is a database detail. Entities stay in Domain; their EF configuration (IEntityTypeConfiguration classes) also stays in Infrastructure so Domain has no EF attributes.', level: 'Medium' },
    { q: 'What is an anemic domain model and why is it considered an anti-pattern?', a: 'Entities with only public getters and setters and no behaviour; all rules live in services. Any code can put an entity into an invalid state and rules get duplicated. A rich model encapsulates state and enforces invariants in methods.', level: 'Medium' },
    { q: 'What are the disadvantages of Clean Architecture?', a: 'More projects, interfaces and mapping code; slower start; can be over-engineering for small CRUD apps; teams sometimes create pointless pass-through layers. Choose it for long-lived, complex domains.', level: 'Medium' },
    { q: 'How can you make sure nobody breaks the dependency rule later?', a: 'Separate projects with only the allowed references, code reviews, and automated architecture tests with NetArchTest.Rules or ArchUnitNET that fail CI if, for example, Domain depends on Microsoft.EntityFrameworkCore.', level: 'Hard' },
    { q: 'Where do you put an interface for sending emails, and where is the implementation?', a: 'IEmailSender in Application (it is a need of a use case); SmtpEmailSender or SendGridEmailSender in Infrastructure; registered in AddInfrastructure.', level: 'Easy' },
    { q: 'How would you structure the Application layer: by technical type or by feature?', a: 'Modern projects group by feature (Students/, Courses/, Enrollments/, each with commands, queries, DTOs and validators) rather than by type (Services/, Dtos/, Validators/). It keeps related code together and leads naturally to vertical slices (Day 9).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a Teacher entity to the Domain with a factory method that rejects an empty name and an experience below 0 years, and a method AssignCourse(string code) that allows at most 3 courses.',
      hint: 'Private setters, a private List<string>, throw DomainException.',
      solution: `public sealed class Teacher
{
    private readonly List<string> _courses = new();
    public string Name { get; private set; } = "";
    public int ExperienceYears { get; private set; }
    public IReadOnlyList<string> Courses => _courses;
    private Teacher() { }

    public static Teacher Create(string name, int experienceYears)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Name is required");
        if (experienceYears < 0) throw new DomainException("Experience cannot be negative");
        return new Teacher { Name = name.Trim(), ExperienceYears = experienceYears };
    }

    public void AssignCourse(string code)
    {
        if (_courses.Count == 3) throw new DomainException("A teacher can teach at most 3 courses");
        if (!_courses.Contains(code)) _courses.Add(code);
    }
}`,
    },
    {
      task: 'Write the dotnet CLI commands to add a new class library CollegeHub.Contracts (shared DTOs) that both Application and Api reference.',
      hint: 'dotnet new classlib, dotnet sln add, two dotnet add reference commands.',
      solution: `dotnet new classlib -n CollegeHub.Contracts -o src/CollegeHub.Contracts
dotnet sln add src/CollegeHub.Contracts/CollegeHub.Contracts.csproj
dotnet add src/CollegeHub.Application/CollegeHub.Application.csproj reference src/CollegeHub.Contracts/CollegeHub.Contracts.csproj
dotnet add src/CollegeHub.Api/CollegeHub.Api.csproj reference src/CollegeHub.Contracts/CollegeHub.Contracts.csproj`,
    },
    {
      task: 'The Application layer needs the current date for "late fee" rules. Design it so tests can control the date.',
      hint: '.NET 8 has TimeProvider; or define your own IDateTimeProvider in Application.',
      solution: `// Application
public class FeeService(TimeProvider clock)
{
    public decimal LateFee(DateOnly dueDate)
    {
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        int daysLate = today.DayNumber - dueDate.DayNumber;
        return daysLate > 0 ? daysLate * 50m : 0m;
    }
}
// Program.cs: builder.Services.AddSingleton(TimeProvider.System);
// Test: new FeeService(new FakeTimeProvider(new DateTimeOffset(2025, 7, 10, 0, 0, 0, TimeSpan.Zero)))
// (FakeTimeProvider comes from Microsoft.Extensions.TimeProvider.Testing)`,
    },
    {
      task: 'Write an architecture test with NetArchTest.Rules that fails if the Domain assembly depends on Microsoft.EntityFrameworkCore or on the Infrastructure project.',
      hint: 'Types.InAssembly(...).ShouldNot().HaveDependencyOnAny(...).GetResult().IsSuccessful',
      solution: `using NetArchTest.Rules;
public class ArchitectureTests
{
    [Fact]
    public void Domain_should_not_depend_on_outer_layers()
    {
        var result = Types.InAssembly(typeof(CollegeHub.Domain.Entities.Student).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny("Microsoft.EntityFrameworkCore", "CollegeHub.Infrastructure", "CollegeHub.Api")
            .GetResult();
        Assert.True(result.IsSuccessful);
    }
}`,
    },
    {
      task: 'Sort these into layers: CollegeDbContext, Course entity, IEmailSender, SmtpEmailSender, StudentsController, RegisterStudentRequest DTO, DomainException, ExceptionHandlingMiddleware, StudentRepository, IStudentRepository.',
      hint: 'Ask: is it a business rule, a use case contract, a technical detail or HTTP?',
      solution: `Domain: Course entity, DomainException
Application: IEmailSender, RegisterStudentRequest DTO, IStudentRepository
Infrastructure: CollegeDbContext, SmtpEmailSender, StudentRepository
API: StudentsController, ExceptionHandlingMiddleware`,
    },
  ],
  quiz: [
    {
      question: 'Which project may reference NO other project in Clean Architecture?',
      options: ['Api', 'Infrastructure', 'Domain', 'Application'],
      answer: 2,
      explanation: 'Domain is the centre and has no dependencies on other layers.',
    },
    {
      question: 'Where should the interface IStudentRepository be declared?',
      options: ['Application', 'Infrastructure', 'Api', 'In the database'],
      answer: 0,
      explanation: 'The layer that NEEDS the abstraction owns it; Infrastructure implements it (dependency inversion).',
    },
    {
      question: 'Which reference breaks the dependency rule?',
      options: ['Application -> Domain', 'Infrastructure -> Application', 'Api -> Application', 'Domain -> Infrastructure'],
      answer: 3,
      explanation: 'Dependencies must point inwards; Domain must never depend on an outer layer.',
    },
    {
      question: 'Which command adds a project reference from Application to Domain?',
      options: [
        'dotnet sln add src/CollegeHub.Domain',
        'dotnet add src/CollegeHub.Application/CollegeHub.Application.csproj reference src/CollegeHub.Domain/CollegeHub.Domain.csproj',
        'dotnet new reference Domain',
        'dotnet add package CollegeHub.Domain',
      ],
      answer: 1,
      explanation: 'dotnet add <project> reference <other project> creates a ProjectReference in the .csproj.',
    },
    {
      question: 'What is the main benefit of a rich domain model with a private constructor and Course.Create(...)?',
      options: ['Faster SQL queries', 'Less code', 'An invalid Course object can never be created', 'It removes the need for a database'],
      answer: 2,
      explanation: 'The factory validates input, so every Course instance satisfies its invariants.',
    },
  ],
};
