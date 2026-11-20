const repoUowCode = `// ================= Application/Abstractions (interfaces) =================
using System.Linq.Expressions;
using CollegeHub.Domain.Entities;
namespace CollegeHub.Application.Abstractions;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>>? filter = null, CancellationToken ct = default);
    void Add(T entity);
    void Remove(T entity);
}

public interface ICourseRepository : IRepository<Course>
{
    Task<Course?> GetWithEnrollmentsAsync(int id, CancellationToken ct = default);   // specific query
}

public interface IUnitOfWork
{
    ICourseRepository Courses { get; }
    IRepository<Student> Students { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);   // ONE commit for all repositories
}

// ================= Infrastructure/Persistence (implementations) =================
using System.Linq.Expressions;
using CollegeHub.Application.Abstractions;
using CollegeHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace CollegeHub.Infrastructure.Persistence;

public class Repository<T>(CollegeDbContext db) : IRepository<T> where T : class
{
    protected readonly DbSet<T> Set = db.Set<T>();

    public async Task<T?> GetByIdAsync(int id, CancellationToken ct = default) =>
        await Set.FindAsync([id], ct);

    public async Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>>? filter = null, CancellationToken ct = default) =>
        await (filter is null ? Set : Set.Where(filter)).AsNoTracking().ToListAsync(ct);

    public void Add(T entity) => Set.Add(entity);          // only TRACKED - nothing is saved yet
    public void Remove(T entity) => Set.Remove(entity);
}

public class CourseRepository(CollegeDbContext db) : Repository<Course>(db), ICourseRepository
{
    public Task<Course?> GetWithEnrollmentsAsync(int id, CancellationToken ct = default) =>
        Set.Include(c => c.Enrollments).FirstOrDefaultAsync(c => c.Id == id, ct);
}

public class UnitOfWork(CollegeDbContext db, ICourseRepository courses, IRepository<Student> students) : IUnitOfWork
{
    public ICourseRepository Courses { get; } = courses;
    public IRepository<Student> Students { get; } = students;
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}

// Infrastructure/DependencyInjection.cs  (all scoped -> they share ONE DbContext per request)
services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
services.AddScoped<ICourseRepository, CourseRepository>();
services.AddScoped<IUnitOfWork, UnitOfWork>();

// ================= Application/Enrollments/EnrollmentService.cs =================
public class EnrollmentService(IUnitOfWork uow, ILogger<EnrollmentService> logger)
{
    public async Task EnrollAsync(int studentId, int courseId, CancellationToken ct)
    {
        var course = await uow.Courses.GetWithEnrollmentsAsync(courseId, ct)
                     ?? throw new KeyNotFoundException($"Course {courseId} not found");
        var student = await uow.Students.GetByIdAsync(studentId, ct)
                      ?? throw new KeyNotFoundException($"Student {studentId} not found");

        course.Enroll(student);                        // domain rule: seats, duplicates
        student.AddCredits(course.Credits);            // second entity changed

        int changes = await uow.SaveChangesAsync(ct);  // ONE transaction for both changes
        logger.LogInformation("Enrolled {Student} in {Course}, {Changes} rows saved",
            student.Name, course.Code, changes);
    }
}`;

const uowSimCode = `using System;
using System.Collections.Generic;

var db = new FakeDatabase();

// ---- Request 1: everything valid ----
var uow = new UnitOfWork(db);
uow.Students.Add(new Student(1, "Asha"));
uow.Enrollments.Add(new Enrollment(1, "CS101"));
Console.WriteLine($"Before commit: {db.Students.Count} students, {db.Enrollments.Count} enrollments");
Console.WriteLine($"Commit -> {uow.SaveChanges()} changes");
Console.WriteLine($"After commit: {db.Students.Count} students, {db.Enrollments.Count} enrollments");

// ---- Request 2: one invalid change -> nothing is saved ----
var uow2 = new UnitOfWork(db);
uow2.Students.Add(new Student(2, "Ravi"));
uow2.Enrollments.Add(new Enrollment(2, ""));          // no course code
try
{
    uow2.SaveChanges();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Commit failed: {ex.Message}");
}
Console.WriteLine($"After failed commit: {db.Students.Count} students, {db.Enrollments.Count} enrollments");

record Student(int Id, string Name);
record Enrollment(int StudentId, string CourseCode);

class FakeDatabase
{
    public List<Student> Students { get; } = new();
    public List<Enrollment> Enrollments { get; } = new();
}

// A repository only COLLECTS changes (like DbSet.Add does in EF Core)
class Repository<T>
{
    public List<T> Pending { get; } = new();
    public void Add(T item) => Pending.Add(item);
}

// The unit of work saves the changes of ALL repositories together (like SaveChanges)
class UnitOfWork(FakeDatabase db)
{
    public Repository<Student> Students { get; } = new();
    public Repository<Enrollment> Enrollments { get; } = new();

    public int SaveChanges()
    {
        foreach (var e in Enrollments.Pending)            // validate first: all or nothing
            if (string.IsNullOrWhiteSpace(e.CourseCode))
                throw new InvalidOperationException($"enrollment for student {e.StudentId} has no course");

        db.Students.AddRange(Students.Pending);
        db.Enrollments.AddRange(Enrollments.Pending);
        int count = Students.Pending.Count + Enrollments.Pending.Count;
        Students.Pending.Clear();
        Enrollments.Pending.Clear();
        return count;
    }
}`;

const manualMapCode = `using System;
using System.Collections.Generic;
using System.Linq;

var cse = new Department { Id = 1, Name = "Computer Science" };
var students = new List<Student>
{
    new() { Id = 1, FirstName = "Asha", LastName = "Patil", Email = "asha@college.in",
            PasswordHash = "x9f$2a", Department = cse, Marks = new() { 78, 91, 85 } },
    new() { Id = 2, FirstName = "Ravi", LastName = "Kumar", Email = "ravi@college.in",
            PasswordHash = "k2#p1q", Department = cse, Marks = new() { 55, 62 } },
};

// Entity -> response DTO (what the API returns)
foreach (var dto in students.Select(s => s.ToDto()))
    Console.WriteLine(dto);

// Request DTO -> entity (what the API receives)
var request = new CreateStudentRequest("  Neha ", "Sharma", "NEHA@College.in", 1);
Student entity = request.ToEntity();
Console.WriteLine($"Entity: {entity.FirstName}|{entity.LastName}|{entity.Email}|dept {entity.DepartmentId}");

// ---------- Entities (Domain) ----------
class Department { public int Id { get; set; } public string Name { get; set; } = ""; }
class Student
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";       // must NEVER leave the server
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
    public List<int> Marks { get; set; } = new();
}

// ---------- DTOs (Application) ----------
record StudentDto(int Id, string FullName, string Email, string DepartmentName, int TotalMarks);
record CreateStudentRequest(string FirstName, string LastName, string Email, int DepartmentId);

// ---------- Mapping code (what AutoMapper / Mapster generate for you) ----------
static class StudentMappings
{
    public static StudentDto ToDto(this Student s) =>
        new(s.Id, $"{s.FirstName} {s.LastName}", s.Email, s.Department?.Name ?? "", s.Marks.Sum());

    public static Student ToEntity(this CreateStudentRequest r) => new()
    {
        FirstName = r.FirstName.Trim(),
        LastName = r.LastName.Trim(),
        Email = r.Email.Trim().ToLowerInvariant(),
        DepartmentId = r.DepartmentId,
    };
}`;

const autoMapperCode = `// dotnet add src/CollegeHub.Application package AutoMapper
// (AutoMapper 13+ includes AddAutoMapper; for v12 also add AutoMapper.Extensions.Microsoft.DependencyInjection)

// ===== Domain entities =====
public class Department { public int Id { get; set; } public string Name { get; set; } = ""; }
public class Course
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Title { get; set; } = "";
    public decimal Fee { get; set; }
    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public List<Enrollment> Enrollments { get; set; } = new();
}

// ===== Application DTOs =====
public record CourseDto(int Id, string Code, string Title, decimal Fee,
                        string DepartmentName, int EnrolledCount);
public record CreateCourseRequest(string Code, string Title, decimal Fee, int DepartmentId);

// ===== Application/Mapping/CourseProfile.cs =====
using AutoMapper;
public class CourseProfile : Profile
{
    public CourseProfile()
    {
        CreateMap<Course, CourseDto>()
            // DepartmentName is FLATTENED automatically from Department.Name (naming convention)
            .ForMember(d => d.EnrolledCount, o => o.MapFrom(s => s.Enrollments.Count));

        CreateMap<CreateCourseRequest, Course>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.Department, o => o.Ignore())
            .ForMember(d => d.Enrollments, o => o.Ignore())
            .ForMember(d => d.Code, o => o.MapFrom(s => s.Code.Trim().ToUpper()));
    }
}

// ===== Program.cs (or AddApplication) =====
builder.Services.AddAutoMapper(cfg => { /* cfg.LicenseKey = "..." for v15+ */ }, typeof(CourseProfile).Assembly);

// ===== Using it =====
public class CourseQueries(CollegeDbContext db, IMapper mapper)
{
    // A) Map AFTER loading: loads full entities (+ Include) then maps in memory
    public async Task<CourseDto?> GetAsync(int id, CancellationToken ct)
    {
        var course = await db.Courses.Include(c => c.Department).Include(c => c.Enrollments)
                                     .FirstOrDefaultAsync(c => c.Id == id, ct);
        return course is null ? null : mapper.Map<CourseDto>(course);
    }

    // B) ProjectTo: AutoMapper builds a Select() -> SQL fetches ONLY the DTO columns
    public Task<List<CourseDto>> ListAsync(CancellationToken ct) =>
        db.Courses.OrderBy(c => c.Code)
                  .ProjectTo<CourseDto>(mapper.ConfigurationProvider)
                  .ToListAsync(ct);

    public async Task<int> CreateAsync(CreateCourseRequest req, CancellationToken ct)
    {
        var course = mapper.Map<Course>(req);
        db.Courses.Add(course);
        await db.SaveChangesAsync(ct);
        return course.Id;
    }
}

// ===== Unit test: catches unmapped properties at build time =====
[Fact]
public void AutoMapper_configuration_is_valid()
{
    var config = new MapperConfiguration(cfg => cfg.AddProfile<CourseProfile>());
    config.AssertConfigurationIsValid();
}

// ===== The same with Mapster (dotnet add package Mapster) =====
// TypeAdapterConfig<Course, CourseDto>.NewConfig()
//     .Map(d => d.EnrolledCount, s => s.Enrollments.Count);
// CourseDto dto = course.Adapt<CourseDto>();
// List<CourseDto> list = await db.Courses.ProjectToType<CourseDto>().ToListAsync();`;

export default {
  id: 'day-06-repository-unit-of-work-dtos-automapper',
  title: 'Repository and Unit of Work, DTOs, AutoMapper (Profiles, ProjectTo) and Mapster',
  module: 'Module 2: Clean Architecture, CQRS & MediatR',
  day: 6,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Hide data access behind repositories, commit several changes in one transaction with a Unit of Work, never expose entities from an API - use request and response DTOs - and stop writing mapping code by hand with AutoMapper profiles and ProjectTo. Finish with Mapster and the trade-offs interviewers expect you to know.',
  objectives: [
    'Implement a generic repository, a specific repository and a Unit of Work over EF Core',
    'Explain why DbContext already is a Unit of Work and when an extra abstraction is worth it',
    'Design request and response DTOs and explain why entities must not be returned directly',
    'Configure AutoMapper profiles, ForMember, flattening, ReverseMap and use ProjectTo with EF Core',
    'Compare AutoMapper, Mapster and manual mapping',
  ],
  theory: [
    {
      heading: 'Repository pattern',
      content:
        'A repository acts like an in-memory collection of domain objects: GetById, List, Add, Remove. It hides HOW data is stored (EF Core, Dapper, a web service), so the Application layer depends on IStudentRepository instead of on DbContext. A generic IRepository<T> gives common CRUD methods for every entity; specific repositories (ICourseRepository : IRepository<Course>) add meaningful queries such as GetWithEnrollmentsAsync or GetTopStudentsAsync. Avoid exposing IQueryable from a repository - that leaks EF Core query details back into the Application layer.',
      points: [
        'Interface in Application, implementation in Infrastructure (Day 5 dependency rule)',
        'Add/Remove only mark changes; saving happens in the Unit of Work',
        'Name methods by intent (GetActiveCoursesAsync), not by SQL',
        'Specification pattern (Ardalis.Specification) is a popular way to pass reusable query criteria to a generic repository',
      ],
    },
    {
      heading: 'Unit of Work',
      content:
        'A business operation often changes several entities: enrolling a student adds an Enrollment row and updates the student\'s credits. These changes must be saved together or not at all. The Unit of Work collects changes from all repositories and commits them in one transaction with one SaveChanges call. In EF Core, DbContext already IS a Unit of Work (it tracks changes) and each DbSet IS a repository. A custom IUnitOfWork simply wraps DbContext.SaveChangesAsync so the Application layer does not need EF Core. Register repositories, the UnitOfWork and the DbContext as SCOPED so they all share one DbContext instance per HTTP request.',
      syntax: `public interface IUnitOfWork
{
    ICourseRepository Courses { get; }
    IRepository<Student> Students { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}`,
      tip: 'Interview trap: "Is a repository over EF Core an anti-pattern?" Good answer: it can be redundant for simple CRUD, because DbContext is already a UoW + repositories. It is worth it when you want the Application layer free of EF Core, want to swap data access (e.g. Dapper for reads), or want to unit-test use cases with fakes.',
    },
    {
      heading: 'DTOs: never return entities from an API',
      content:
        'A DTO (Data Transfer Object) is a simple class or record shaped for one API request or response. Returning EF entities directly causes real problems: sensitive fields leak (PasswordHash, internal flags), navigation properties cause JSON cycles (Student -> Department -> Students -> ...) or lazy-loading queries, the API contract breaks whenever the database schema changes, and over-posting lets a client set fields like IsAdmin or Fee in a POST. Use separate request DTOs (CreateStudentRequest, UpdateStudentRequest) and response DTOs (StudentDto, StudentDetailsDto). C# records are ideal: short, immutable, value equality.',
      points: [
        'Request DTO = only the fields the client is allowed to send',
        'Response DTO = only the fields the client needs, often flattened (DepartmentName instead of a nested Department)',
        'DTOs live in the Application layer (or a Contracts project shared with clients)',
      ],
    },
    {
      heading: 'AutoMapper: profiles, conventions and ForMember',
      content:
        'Mapping by hand is simple but repetitive for 50 DTOs. AutoMapper maps objects by convention: properties with the same name are copied, and flattening joins names - Department.Name maps to DepartmentName automatically. Configuration lives in Profile classes (one per feature), registered with AddAutoMapper scanning the assembly. ForMember customises one destination property (MapFrom, Ignore, Condition), ReverseMap creates the opposite map, and AssertConfigurationIsValid in a unit test fails when a destination property is not mapped. Inject IMapper and call mapper.Map<CourseDto>(course).',
      syntax: `CreateMap<Course, CourseDto>()
    .ForMember(d => d.EnrolledCount, o => o.MapFrom(s => s.Enrollments.Count));
CreateMap<CreateCourseRequest, Course>()
    .ForMember(d => d.Id, o => o.Ignore());
CreateMap<Department, DepartmentDto>().ReverseMap();`,
      points: [
        'Licensing: from 2025 (AutoMapper 15, MediatR 13) the libraries use a commercial license with a free community tier and a license key; older versions remain free. Check your company policy - this is why many teams now choose Mapster or manual mapping',
        'Hidden logic in profiles is harder to debug and "find all references" does not find mapped properties - keep profiles simple',
      ],
    },
    {
      heading: 'ProjectTo: map inside the SQL query',
      content:
        'mapper.Map after loading entities fetches every column of every included table and then throws most of it away. ProjectTo<CourseDto>(mapper.ConfigurationProvider) on an IQueryable turns the mapping into a LINQ Select, so EF Core generates SQL that selects only the DTO columns and computes things like Enrollments.Count as a sub-query in the database. No Include and no change tracking are needed. Use ProjectTo for read-only list and detail queries; use Map for in-memory objects and for request DTO -> entity.',
      syntax: `var list = await db.Courses
    .Where(c => c.Fee < 10000)
    .ProjectTo<CourseDto>(mapper.ConfigurationProvider)
    .ToListAsync(ct);
// SQL: SELECT c.Id, c.Code, c.Title, c.Fee, d.Name, (SELECT COUNT(*) FROM Enrollments e WHERE e.CourseId = c.Id) ...`,
    },
    {
      heading: 'Mapster and manual mapping',
      content:
        'Mapster is a fast, free mapping library: obj.Adapt<CourseDto>() works with zero configuration, TypeAdapterConfig customises maps, ProjectToType<T>() does the same job as ProjectTo, and Mapster.Tool can generate mapping code at compile time. Manual mapping (extension methods like student.ToDto()) is the most explicit and debuggable option, is checked by the compiler, and is what many senior developers prefer for small and medium projects.',
      points: [
        'AutoMapper: rich configuration, widely used in existing enterprise code',
        'Mapster: faster, simpler API, free, code generation option',
        'Manual: no magic, compile-time safety, more typing',
      ],
    },
  ],
  examples: [
    {
      title: 'Generic repository, specific repository and Unit of Work over EF Core',
      scenario: 'In CollegeHub, enrolling a student changes two entities (Course gets an Enrollment, Student gets credits). Both changes must be saved in one transaction through IUnitOfWork.',
      steps: [
        'Add the interfaces to CollegeHub.Application/Abstractions',
        'Add Repository<T>, CourseRepository and UnitOfWork to CollegeHub.Infrastructure/Persistence and register them in AddInfrastructure',
        'Add EnrollmentService to Application and call it from a controller action POST /api/enrollments',
        'Press F5, post { "studentId": 1, "courseId": 2 } and watch the console logs (EF Core logs show one transaction)',
      ],
      code: repoUowCode,
      result: `info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (3ms) SELECT ... FROM [Courses] ... LEFT JOIN [Enrollments] ...
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (1ms) SELECT ... FROM [Students] WHERE [Id] = @p0
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (4ms) SET NOCOUNT ON; INSERT INTO [Enrollments] ...; UPDATE [Students] SET [Credits] = @p1 ...
info: CollegeHub.Application.Enrollments.EnrollmentService[0]
      Enrolled Asha Patil in CS101, 2 rows saved`,
      explanation:
        'Repositories only call Set.Add or change tracked entities; nothing hits the database until uow.SaveChangesAsync, which wraps EF Core\'s SaveChanges and therefore runs the INSERT and UPDATE inside ONE transaction. Because the DbContext, repositories and UnitOfWork are all scoped, they share the same DbContext in the request - if each repository had its own DbContext, the two changes would be saved separately. The typeof(IRepository<>) registration handles every entity with one line. Timing numbers will differ.',
    },
    {
      title: 'Unit of Work in plain C#: all or nothing',
      scenario: 'See the core idea without EF Core: repositories only collect pending changes, and the unit of work saves all of them together - or none if anything is invalid.',
      steps: [
        'File > New > Project > Console App, name it UowDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Change the empty course code to "DB201" and run again: the second commit now saves 2 changes',
      ],
      code: uowSimCode,
      csharp: { files: { 'Program.cs': uowSimCode }, stdin: '' },
      result: `Before commit: 0 students, 0 enrollments
Commit -> 2 changes
After commit: 1 students, 1 enrollments
Commit failed: enrollment for student 2 has no course
After failed commit: 1 students, 1 enrollments`,
      explanation:
        'Adding to a repository does not touch the "database" - the counts stay 0 until SaveChanges. In request 2, the student Ravi was valid but the enrollment was not, and the unit of work validates before writing anything, so Ravi is NOT saved either. EF Core gets the same guarantee from a database transaction around SaveChanges.',
    },
    {
      title: 'DTOs and manual mapping (what a mapper generates)',
      scenario: 'The student list API must show the full name, department name and total marks, but must never return PasswordHash. A registration request must be cleaned before it becomes an entity.',
      steps: [
        'File > New > Project > Console App, name it DtoDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Try returning the Student entity with System.Text.Json: JsonSerializer.Serialize(students[0]) - PasswordHash appears in the JSON',
      ],
      code: manualMapCode,
      csharp: { files: { 'Program.cs': manualMapCode }, stdin: '' },
      result: `StudentDto { Id = 1, FullName = Asha Patil, Email = asha@college.in, DepartmentName = Computer Science, TotalMarks = 254 }
StudentDto { Id = 2, FullName = Ravi Kumar, Email = ravi@college.in, DepartmentName = Computer Science, TotalMarks = 117 }
Entity: Neha|Sharma|neha@college.in|dept 1`,
      explanation:
        'Records print all their properties with ToString, which makes the DTO shape easy to see. The response DTO flattens Department.Name into DepartmentName, combines two fields into FullName, aggregates marks (78 + 91 + 85 = 254, 55 + 62 = 117) and leaves out PasswordHash completely. The request DTO has no Id or PasswordHash, so a client cannot over-post them, and ToEntity trims and lower-cases the input. AutoMapper and Mapster generate this kind of code from conventions.',
    },
    {
      title: 'AutoMapper profiles, flattening, ProjectTo and Mapster',
      scenario: 'Replace hand-written mapping in CollegeHub with AutoMapper: a CourseProfile with flattening and a computed count, ProjectTo for the course list, Map for create requests, and a configuration test.',
      steps: [
        'dotnet add src/CollegeHub.Application package AutoMapper',
        'Add CourseProfile to Application/Mapping and call AddAutoMapper in AddApplication (or Program.cs)',
        'Use IMapper in your query class / controller; press F5 and call GET /api/courses in Swagger',
        'Run dotnet test to execute AutoMapper_configuration_is_valid; remove the Ignore() for Id and see it fail',
      ],
      code: autoMapperCode,
      result: `GET /api/courses -> 200 OK
[
  { "id": 1, "code": "CS101", "title": "C# Fundamentals", "fee": 4500.00, "departmentName": "Computer Science", "enrolledCount": 2 },
  { "id": 2, "code": "DB201", "title": "SQL Server", "fee": 3800.00, "departmentName": "Computer Science", "enrolledCount": 1 }
]

SQL generated by ProjectTo:
SELECT [c].[Id], [c].[Code], [c].[Title], [c].[Fee], [d].[Name],
       (SELECT COUNT(*) FROM [Enrollments] AS [e] WHERE [c].[Id] = [e].[CourseId])
FROM [Courses] AS [c]
INNER JOIN [Departments] AS [d] ON [c].[DepartmentId] = [d].[Id]
ORDER BY [c].[Code]`,
      explanation:
        'DepartmentName needed no configuration: AutoMapper split the name into Department + Name. EnrolledCount used MapFrom. ProjectTo turned the profile into a Select, so EF Core fetched just six values per course and counted enrollments in SQL - no Include, no tracking, no extra columns. For the create request, Ignore() stops AutoMapper from touching Id and navigation properties, and AssertConfigurationIsValid would fail if a new DTO property were added without a mapping. The data shown assumes two seeded courses. The Mapster lines at the bottom do the same with Adapt and ProjectToType.',
    },
  ],
  interview: [
    { q: 'What is the Repository pattern?', a: 'An abstraction that gives collection-like access to domain objects (GetById, List, Add, Remove) and hides the data access technology. The interface lives in the Application/Domain side and the implementation in Infrastructure.', level: 'Easy' },
    { q: 'What is the Unit of Work pattern?', a: 'It tracks all changes made during a business operation and commits them together in one transaction, e.g. with one SaveChanges call, so the operation is all-or-nothing.', level: 'Easy' },
    { q: 'Is DbContext a repository and a unit of work?', a: 'Yes. DbSet<T> behaves like a repository and DbContext tracks changes and commits them atomically in SaveChanges, i.e. a unit of work. A custom wrapper is useful to keep EF Core out of the Application layer and for testability, but it can be redundant in simple apps.', level: 'Medium' },
    { q: 'Should a repository return IQueryable<T>?', a: 'Usually no. Returning IQueryable leaks query composition and EF Core behaviour (deferred execution, translation errors, Include) into upper layers, so the abstraction is lost. Return materialised lists or use the Specification pattern for reusable criteria.', level: 'Hard' },
    { q: 'Why must repositories and DbContext be registered as Scoped?', a: 'So all repositories and the unit of work in one request share the same DbContext instance; otherwise changes made through different repositories would be tracked by different contexts and not saved in one transaction. DbContext is not thread-safe, so Singleton is wrong.', level: 'Medium' },
    { q: 'Why should a Web API not return EF Core entities directly?', a: 'Over-exposure of sensitive fields, JSON reference cycles, accidental lazy-loading queries, a tight coupling of API contract to database schema, and over-posting attacks on input. DTOs define a stable, minimal contract.', level: 'Easy' },
    { q: 'What is over-posting (mass assignment)?', a: 'When an API binds a request directly to an entity, a client can send extra fields (IsAdmin, Fee, Balance) that get saved. Request DTOs with only allowed fields prevent it.', level: 'Medium' },
    { q: 'What is flattening in AutoMapper?', a: 'Mapping nested properties to flat destination properties by naming convention: Department.Name -> DepartmentName, Customer.Address.City -> CustomerAddressCity. GetTotal() methods also map to Total.', level: 'Medium' },
    { q: 'What is the difference between mapper.Map and ProjectTo?', a: 'Map works on objects already in memory - you must load the entities (and Includes) first. ProjectTo works on IQueryable and turns the mapping into a Select expression that EF Core translates to SQL, fetching only DTO columns. ProjectTo is better for read queries; Map is used for in-memory objects and request-to-entity mapping.', level: 'Medium' },
    { q: 'How do you catch AutoMapper configuration mistakes early?', a: 'Call configuration.AssertConfigurationIsValid() in a unit test. It throws if any destination property has no mapping source and is not ignored.', level: 'Medium' },
    { q: 'What are the drawbacks of AutoMapper?', a: 'Mapping logic is hidden and errors appear at runtime; renaming a property silently breaks a convention map; complex MapFrom logic is hard to debug; business logic sometimes creeps into profiles; and since 2025 newer versions need a commercial license for larger companies.', level: 'Hard' },
    { q: 'AutoMapper vs Mapster vs manual mapping - which would you choose?', a: 'For a new project many teams prefer manual mapping (explicit, compiler-checked) or Mapster (free, fast, code generation). AutoMapper is fine when the company already uses it and licensing is sorted. The key is consistency and tests.', level: 'Medium' },
    { q: 'Where do DTOs and mapping profiles live in Clean Architecture?', a: 'In the Application layer (grouped by feature), because they describe use-case inputs and outputs. Sometimes request/response contracts are in a separate Contracts project shared with client SDKs.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Add IStudentRepository : IRepository<Student> with GetByEmailAsync(string email) and GetTopAsync(int count) (highest total marks). Implement it with EF Core.',
      hint: 'Inherit from Repository<Student> and use Set.',
      solution: `public interface IStudentRepository : IRepository<Student>
{
    Task<Student?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<IReadOnlyList<Student>> GetTopAsync(int count, CancellationToken ct = default);
}

public class StudentRepository(CollegeDbContext db) : Repository<Student>(db), IStudentRepository
{
    public Task<Student?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        Set.FirstOrDefaultAsync(s => s.Email == email.ToLower(), ct);

    public async Task<IReadOnlyList<Student>> GetTopAsync(int count, CancellationToken ct = default) =>
        await Set.AsNoTracking().OrderByDescending(s => s.TotalMarks).Take(count).ToListAsync(ct);
}`,
    },
    {
      task: 'Write an AutoMapper profile for Employee -> EmployeeDto(int Id, string FullName, string DepartmentName, decimal AnnualSalary) where AnnualSalary = MonthlySalary * 12.',
      hint: 'FullName and AnnualSalary need ForMember; DepartmentName flattens automatically.',
      solution: `public class EmployeeProfile : Profile
{
    public EmployeeProfile()
    {
        CreateMap<Employee, EmployeeDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.FirstName + " " + s.LastName))
            .ForMember(d => d.AnnualSalary, o => o.MapFrom(s => s.MonthlySalary * 12));
    }
}`,
    },
    {
      task: 'Write the same Employee mapping as a manual extension method and as a Mapster config.',
      hint: 'static class EmployeeMappings; TypeAdapterConfig<Employee, EmployeeDto>.NewConfig().Map(...)',
      solution: `public static class EmployeeMappings
{
    public static EmployeeDto ToDto(this Employee e) =>
        new(e.Id, $"{e.FirstName} {e.LastName}", e.Department.Name, e.MonthlySalary * 12);
}

// Mapster (call once at startup)
TypeAdapterConfig<Employee, EmployeeDto>.NewConfig()
    .Map(d => d.FullName, s => s.FirstName + " " + s.LastName)
    .Map(d => d.AnnualSalary, s => s.MonthlySalary * 12);
var dto = employee.Adapt<EmployeeDto>();`,
    },
    {
      task: 'Create request DTOs for a Product API so that clients can create a product (name, price, categoryId) and update only price and stock - but can never set Id, CreatedAt or IsDeleted.',
      hint: 'Two separate records.',
      solution: `public record CreateProductRequest(string Name, decimal Price, int CategoryId);
public record UpdateProductStockRequest(decimal Price, int Stock);
// Entity Product has Id, CreatedAt, IsDeleted - they are set only by server code.`,
    },
    {
      task: 'Write a unit test for EnrollmentService using fake repositories (no database) that checks SaveChangesAsync is called exactly once.',
      hint: 'Use Moq: new Mock<IUnitOfWork>(); setup Courses and Students; Verify(u => u.SaveChangesAsync(...), Times.Once).',
      solution: `[Fact]
public async Task Enroll_saves_once()
{
    var course = Course.Create("CS101", "C#", capacity: 30, credits: 4);
    var student = Student.Create("Asha", "asha@college.in");
    var uow = new Mock<IUnitOfWork>();
    uow.Setup(u => u.Courses.GetWithEnrollmentsAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(course);
    uow.Setup(u => u.Students.GetByIdAsync(7, It.IsAny<CancellationToken>())).ReturnsAsync(student);

    var service = new EnrollmentService(uow.Object, NullLogger<EnrollmentService>.Instance);
    await service.EnrollAsync(7, 1, CancellationToken.None);

    uow.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
}`,
    },
  ],
  quiz: [
    {
      question: 'In EF Core, which object already behaves as a Unit of Work?',
      options: ['DbSet<T>', 'DbContext', 'IQueryable<T>', 'SqlConnection'],
      answer: 1,
      explanation: 'DbContext tracks changes and commits them together in SaveChanges.',
    },
    {
      question: 'Why should a Student entity with PasswordHash NOT be returned directly from GET /api/students?',
      options: ['JSON cannot serialise classes', 'It is slower to compile', 'Sensitive fields leak and the API contract is tied to the database', 'ASP.NET Core does not allow it'],
      answer: 2,
      explanation: 'A response DTO exposes only the needed fields and keeps the API contract stable.',
    },
    {
      question: 'With AutoMapper conventions, which source property maps to the destination property DepartmentName automatically?',
      options: ['Department.Name', 'DeptName', 'Name', 'DepartmentId'],
      answer: 0,
      explanation: 'Flattening matches DepartmentName to the nested Department.Name.',
    },
    {
      question: 'What is the main advantage of ProjectTo<CourseDto>() over loading entities and calling mapper.Map?',
      options: ['It needs no profile', 'It works without a database', 'It always uses tracking', 'The SQL selects only the columns needed for the DTO'],
      answer: 3,
      explanation: 'ProjectTo becomes a Select expression that EF Core translates to SQL.',
    },
    {
      question: 'Which lifetime should IUnitOfWork, repositories and DbContext have in ASP.NET Core?',
      options: ['Singleton', 'Transient for DbContext, Singleton for repositories', 'Scoped', 'Static fields'],
      answer: 2,
      explanation: 'Scoped gives one shared DbContext per request so all changes are saved together.',
    },
  ],
};
