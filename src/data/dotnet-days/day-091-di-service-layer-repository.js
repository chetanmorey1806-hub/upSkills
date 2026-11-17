export default {
  id: 'day-091-di-service-layer-repository',
  title: 'Dependency Injection, Service Layer, Repository Pattern',
  module: 'ASP.NET Core Web API',
  day: 91,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Move business logic and data access out of the controllers. Revisit Dependency Injection and service lifetimes for Web APIs, build a Repository layer (data access with EF Core), a Service layer (business rules, DTO mapping) and thin controllers. Register everything in Program.cs, understand layered architecture, and see how interfaces make the code testable.`,
  objectives: [
    'Explain Dependency Injection, IoC container and constructor injection with a real-world analogy',
    'Choose the right lifetime (Transient, Scoped, Singleton) and avoid captive dependencies',
    'Implement the Repository pattern (interface + EF Core implementation, generic repository)',
    'Implement a Service layer that contains business rules and returns DTOs',
    'Write thin controllers that only translate HTTP to service calls and results to status codes',
  ],
  theory: [
    {
      heading: 'Why separate business logic?',
      content: `On Days 88-90 the controller did everything: validation of rules, EF Core queries, mapping and HTTP responses. As the project grows that becomes a "fat controller" that is hard to read, reuse and test. A layered design gives each class one responsibility (Single Responsibility Principle). Analogy: in a restaurant the waiter (controller) takes the order, the chef (service) decides how to cook it, and the store keeper (repository) fetches ingredients from the store room (database).`,
      syntax: `Client (Postman / React)
   |  HTTP JSON
Controller   -> HTTP only: routes, status codes, DTO in/out
   |  calls
Service      -> business rules: "email must be unique", "salary > 0", mapping
   |  calls
Repository   -> data access: EF Core queries, SaveChanges
   |
DbContext -> SQL Server`,
    },
    {
      heading: 'Dependency Injection recap',
      content: `A dependency is an object a class needs (EmployeeService needs IEmployeeRepository). With Dependency Injection the class does NOT create it with new; it asks for it in the constructor, and the built-in IoC container creates and passes it. Classes depend on interfaces (abstractions), not concrete classes - the Dependency Inversion Principle. You can then swap EmployeeRepository for a fake in unit tests without changing EmployeeService.`,
      syntax: `// registration (Program.cs)
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

// consumption (constructor injection)
public class EmployeeService(IEmployeeRepository repo) : IEmployeeService { ... }   // C# 12 primary constructor`,
    },
    {
      heading: 'Service lifetimes in a Web API',
      content: `The lifetime tells the container how long an instance lives.`,
      points: [
        'Transient (AddTransient) - a new instance every time it is requested. Use for light, stateless helpers.',
        'Scoped (AddScoped) - one instance per HTTP request. DbContext, repositories and services that use DbContext MUST be scoped (or transient).',
        'Singleton (AddSingleton) - one instance for the whole application lifetime. Use for caches, configuration objects, HttpClient factories. Must be thread-safe.',
        'Captive dependency: a Singleton that takes a Scoped service keeps it alive forever. In Development ASP.NET Core throws "Cannot consume scoped service from singleton".',
        'Inside a singleton or background service create a scope: using var scope = scopeFactory.CreateScope();',
      ],
    },
    {
      heading: 'Repository pattern',
      content: `A repository hides HOW data is stored and offers collection-like methods: GetAllAsync, GetByIdAsync, AddAsync, Update, Delete, ExistsAsync. The rest of the app does not know about EF Core. A generic repository IRepository<T> provides common CRUD once; a specific repository (IEmployeeRepository : IRepository<Employee>) adds special queries like GetByEmailAsync.`,
      points: [
        'DbContext is already a Unit of Work and DbSet is already a repository - many teams use services directly on DbContext; know both styles',
        'Do not return IQueryable from a repository if you want to fully hide EF Core; return lists or DTOs',
        'Unit of Work pattern: one SaveChangesAsync for several repositories in one transaction (see Extra 49)',
      ],
    },
    {
      heading: 'Service layer',
      content: `The service layer contains the use cases of the application: create an employee, give a raise, deactivate. It validates business rules that need the database (email already exists, department exists), maps between DTOs and entities, and calls repositories. It does NOT know about HTTP (no IActionResult, no status codes). It reports outcomes through return values (null, bool, a Result object) or custom exceptions that a global handler converts to status codes (Day 96).`,
      syntax: `public sealed record ServiceResult<T>(bool Success, T? Data, string? Error, ErrorType Type = ErrorType.None)
{
    public static ServiceResult<T> Ok(T data) => new(true, data, null);
    public static ServiceResult<T> Fail(string error, ErrorType type) => new(false, default, error, type);
}
public enum ErrorType { None, NotFound, Conflict, Validation }`,
    },
    {
      heading: 'Recommended folder structure',
      content: `For a single project API, folders are enough. Larger solutions split into separate class library projects (EmployeeApi.Api, EmployeeApi.Application, EmployeeApi.Infrastructure, EmployeeApi.Domain) - the idea behind Clean Architecture.`,
      syntax: `EmployeeApi/
  Controllers/EmployeesController.cs
  Dtos/EmployeeDtos.cs
  Models/Employee.cs, Department.cs
  Data/AppDbContext.cs
  Repositories/IRepository.cs, Repository.cs, IEmployeeRepository.cs, EmployeeRepository.cs
  Services/IEmployeeService.cs, EmployeeService.cs, ServiceResult.cs
  Mapping/EmployeeProfile.cs
  Program.cs`,
      tip: 'Rule of thumb: if a line of code mentions HttpContext or status codes it belongs in the controller; if it mentions DbContext it belongs in a repository; everything else goes in the service.',
    },
  ],
  examples: [
    {
      title: 'Console: constructor injection, repository and service without a framework',
      scenario: 'Understand the pattern in plain C# before using the ASP.NET Core container.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it LayeredDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `// Composition root: we "inject" dependencies by hand
IStudentRepository repo = new InMemoryStudentRepository();
INotifier notifier = new ConsoleNotifier();
var service = new StudentService(repo, notifier);

service.Register("Asha", 88);
service.Register("Ravi", 34);
try
{
    service.Register("asha", 70);
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Error: " + ex.Message);
}

foreach (var s in service.GetAll())
    Console.WriteLine($"{s.Id} {s.Name} {s.Marks} {s.Result}");
Console.WriteLine($"Pass percentage: {service.PassPercentage()}%");

// Swap the notifier without touching StudentService
var service2 = new StudentService(new InMemoryStudentRepository(), new SilentNotifier());
service2.Register("Kiran", 91);
Console.WriteLine($"Second service count: {service2.GetAll().Count()}");

// ---------- Model ----------
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public string Result => Marks >= 35 ? "Pass" : "Fail";
}

// ---------- Repository ----------
public interface IStudentRepository
{
    IEnumerable<Student> GetAll();
    Student? GetByName(string name);
    void Add(Student student);
}

public class InMemoryStudentRepository : IStudentRepository
{
    private readonly List<Student> _items = new();
    private int _nextId = 1;

    public IEnumerable<Student> GetAll() => _items;
    public Student? GetByName(string name) =>
        _items.FirstOrDefault(s => string.Equals(s.Name, name, StringComparison.OrdinalIgnoreCase));
    public void Add(Student student)
    {
        student.Id = _nextId++;
        _items.Add(student);
    }
}

// ---------- Other dependency ----------
public interface INotifier { void Notify(string message); }
public class ConsoleNotifier : INotifier { public void Notify(string message) => Console.WriteLine("[Notify] " + message); }
public class SilentNotifier : INotifier { public void Notify(string message) { } }

// ---------- Service (business rules) ----------
public class StudentService
{
    private readonly IStudentRepository _repo;
    private readonly INotifier _notifier;

    public StudentService(IStudentRepository repo, INotifier notifier)
    {
        _repo = repo;
        _notifier = notifier;
    }

    public Student Register(string name, int marks)
    {
        if (_repo.GetByName(name) is not null)
            throw new InvalidOperationException($"Student '{name}' already exists");

        var student = new Student { Name = name, Marks = marks };
        _repo.Add(student);
        _notifier.Notify($"Welcome {name}!");
        return student;
    }

    public IEnumerable<Student> GetAll() => _repo.GetAll();

    public int PassPercentage()
    {
        var all = _repo.GetAll().ToList();
        if (all.Count == 0) return 0;
        return all.Count(s => s.Result == "Pass") * 100 / all.Count;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `// Composition root: we "inject" dependencies by hand
IStudentRepository repo = new InMemoryStudentRepository();
INotifier notifier = new ConsoleNotifier();
var service = new StudentService(repo, notifier);

service.Register("Asha", 88);
service.Register("Ravi", 34);
try
{
    service.Register("asha", 70);
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Error: " + ex.Message);
}

foreach (var s in service.GetAll())
    Console.WriteLine($"{s.Id} {s.Name} {s.Marks} {s.Result}");
Console.WriteLine($"Pass percentage: {service.PassPercentage()}%");

// Swap the notifier without touching StudentService
var service2 = new StudentService(new InMemoryStudentRepository(), new SilentNotifier());
service2.Register("Kiran", 91);
Console.WriteLine($"Second service count: {service2.GetAll().Count()}");

// ---------- Model ----------
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public string Result => Marks >= 35 ? "Pass" : "Fail";
}

// ---------- Repository ----------
public interface IStudentRepository
{
    IEnumerable<Student> GetAll();
    Student? GetByName(string name);
    void Add(Student student);
}

public class InMemoryStudentRepository : IStudentRepository
{
    private readonly List<Student> _items = new();
    private int _nextId = 1;

    public IEnumerable<Student> GetAll() => _items;
    public Student? GetByName(string name) =>
        _items.FirstOrDefault(s => string.Equals(s.Name, name, StringComparison.OrdinalIgnoreCase));
    public void Add(Student student)
    {
        student.Id = _nextId++;
        _items.Add(student);
    }
}

// ---------- Other dependency ----------
public interface INotifier { void Notify(string message); }
public class ConsoleNotifier : INotifier { public void Notify(string message) => Console.WriteLine("[Notify] " + message); }
public class SilentNotifier : INotifier { public void Notify(string message) { } }

// ---------- Service (business rules) ----------
public class StudentService
{
    private readonly IStudentRepository _repo;
    private readonly INotifier _notifier;

    public StudentService(IStudentRepository repo, INotifier notifier)
    {
        _repo = repo;
        _notifier = notifier;
    }

    public Student Register(string name, int marks)
    {
        if (_repo.GetByName(name) is not null)
            throw new InvalidOperationException($"Student '{name}' already exists");

        var student = new Student { Name = name, Marks = marks };
        _repo.Add(student);
        _notifier.Notify($"Welcome {name}!");
        return student;
    }

    public IEnumerable<Student> GetAll() => _repo.GetAll();

    public int PassPercentage()
    {
        var all = _repo.GetAll().ToList();
        if (all.Count == 0) return 0;
        return all.Count(s => s.Result == "Pass") * 100 / all.Count;
    }
}`,
        },
        stdin: '',
      },
      result: `[Notify] Welcome Asha!
[Notify] Welcome Ravi!
Error: Student 'asha' already exists
1 Asha 88 Pass
2 Ravi 34 Fail
Pass percentage: 50%
Second service count: 1`,
      explanation: `StudentService never uses new for its dependencies - they arrive through the constructor. The top of Program.cs is the "composition root" where the objects are wired together; in ASP.NET Core the IoC container does this job for you. The duplicate check is case-insensitive, so "asha" is rejected. service2 uses SilentNotifier, so "Welcome Kiran!" is NOT printed - we changed behaviour without editing StudentService (Open/Closed + Dependency Inversion).`,
    },
    {
      title: 'EmployeeApi: generic repository and employee repository',
      scenario: 'Move all EF Core code of the Day 90 EmployeeApi into repositories.',
      steps: [
        'Open EmployeeApi from Day 90',
        'Add a folder Repositories (right-click project > Add > New Folder)',
        'Add IRepository.cs, Repository.cs, IEmployeeRepository.cs, EmployeeRepository.cs with the code below',
        'Build with Ctrl+Shift+B',
      ],
      code: `// Repositories/IRepository.cs
using System.Linq.Expressions;
namespace EmployeeApi.Repositories;

public interface IRepository<T> where T : class
{
    Task<List<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Remove(T entity);
    Task<int> SaveChangesAsync();
}

// Repositories/Repository.cs
using System.Linq.Expressions;
using EmployeeApi.Data;
using Microsoft.EntityFrameworkCore;
namespace EmployeeApi.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext Db;
    protected readonly DbSet<T> Set;

    public Repository(AppDbContext db)
    {
        Db = db;
        Set = db.Set<T>();
    }

    public Task<List<T>> GetAllAsync() => Set.AsNoTracking().ToListAsync();
    public async Task<T?> GetByIdAsync(int id) => await Set.FindAsync(id);
    public Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate) => Set.AnyAsync(predicate);
    public async Task AddAsync(T entity) => await Set.AddAsync(entity);
    public void Remove(T entity) => Set.Remove(entity);
    public Task<int> SaveChangesAsync() => Db.SaveChangesAsync();
}

// Repositories/IEmployeeRepository.cs
using EmployeeApi.Models;
namespace EmployeeApi.Repositories;

public interface IEmployeeRepository : IRepository<Employee>
{
    Task<List<Employee>> GetAllWithDepartmentAsync();
    Task<Employee?> GetWithDepartmentAsync(int id);
    Task<bool> EmailExistsAsync(string email, int? exceptId = null);
}

// Repositories/EmployeeRepository.cs
using EmployeeApi.Data;
using EmployeeApi.Models;
using Microsoft.EntityFrameworkCore;
namespace EmployeeApi.Repositories;

public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(AppDbContext db) : base(db) { }

    public Task<List<Employee>> GetAllWithDepartmentAsync() =>
        Set.AsNoTracking().Include(e => e.Department).OrderBy(e => e.Id).ToListAsync();

    public Task<Employee?> GetWithDepartmentAsync(int id) =>
        Set.Include(e => e.Department).FirstOrDefaultAsync(e => e.Id == id);

    public Task<bool> EmailExistsAsync(string email, int? exceptId = null) =>
        Set.AnyAsync(e => e.Email == email && (exceptId == null || e.Id != exceptId));
}`,
      result: `Build: ========== Build: 1 succeeded, 0 failed ==========`,
      explanation: `The generic Repository<T> gives every entity basic CRUD; EmployeeRepository adds queries that only make sense for employees. Notice that SaveChangesAsync is exposed so the service decides WHEN to commit - several changes can be saved together in one transaction. Nothing outside the Repositories and Data folders references DbContext any more.`,
    },
    {
      title: 'EmployeeService, thin controller and DI registration',
      scenario: 'Put business rules in a service and keep the controller focused on HTTP.',
      steps: [
        'Add folder Services with ServiceResult.cs, IEmployeeService.cs, EmployeeService.cs',
        'Replace Controllers/EmployeesController.cs',
        'Register the repositories and service in Program.cs',
        'Press Ctrl+F5, open Swagger and test POST, PUT and DELETE',
      ],
      code: `// Services/ServiceResult.cs
namespace EmployeeApi.Services;
public enum ErrorType { None, NotFound, Conflict, Validation }

public sealed record ServiceResult<T>(bool Success, T? Data, string? Error, ErrorType Type)
{
    public static ServiceResult<T> Ok(T data) => new(true, data, null, ErrorType.None);
    public static ServiceResult<T> Fail(ErrorType type, string error) => new(false, default, error, type);
}

// Services/IEmployeeService.cs
using EmployeeApi.Dtos;
namespace EmployeeApi.Services;

public interface IEmployeeService
{
    Task<List<EmployeeDto>> GetAllAsync();
    Task<EmployeeDto?> GetByIdAsync(int id);
    Task<ServiceResult<EmployeeDto>> CreateAsync(CreateEmployeeDto dto);
    Task<ServiceResult<bool>> UpdateAsync(int id, UpdateEmployeeDto dto);
    Task<ServiceResult<bool>> DeleteAsync(int id);
}

// Services/EmployeeService.cs
using AutoMapper;
using EmployeeApi.Dtos;
using EmployeeApi.Models;
using EmployeeApi.Repositories;
namespace EmployeeApi.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employees;
    private readonly IRepository<Department> _departments;
    private readonly IMapper _mapper;
    private readonly ILogger<EmployeeService> _logger;

    public EmployeeService(IEmployeeRepository employees, IRepository<Department> departments,
                           IMapper mapper, ILogger<EmployeeService> logger)
    {
        _employees = employees;
        _departments = departments;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<List<EmployeeDto>> GetAllAsync() =>
        _mapper.Map<List<EmployeeDto>>(await _employees.GetAllWithDepartmentAsync());

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var e = await _employees.GetWithDepartmentAsync(id);
        return e is null ? null : _mapper.Map<EmployeeDto>(e);
    }

    public async Task<ServiceResult<EmployeeDto>> CreateAsync(CreateEmployeeDto dto)
    {
        // business rules
        if (dto.Salary < 10000)
            return ServiceResult<EmployeeDto>.Fail(ErrorType.Validation, "Minimum salary is 10000");
        if (await _employees.EmailExistsAsync(dto.Email))
            return ServiceResult<EmployeeDto>.Fail(ErrorType.Conflict, $"Email {dto.Email} is already used");
        if (!await _departments.ExistsAsync(d => d.Id == dto.DepartmentId))
            return ServiceResult<EmployeeDto>.Fail(ErrorType.Validation, "Department does not exist");

        var entity = _mapper.Map<Employee>(dto);
        await _employees.AddAsync(entity);
        await _employees.SaveChangesAsync();
        _logger.LogInformation("Employee {Id} created", entity.Id);

        var created = await _employees.GetWithDepartmentAsync(entity.Id);
        return ServiceResult<EmployeeDto>.Ok(_mapper.Map<EmployeeDto>(created!));
    }

    public async Task<ServiceResult<bool>> UpdateAsync(int id, UpdateEmployeeDto dto)
    {
        var entity = await _employees.GetByIdAsync(id);
        if (entity is null)
            return ServiceResult<bool>.Fail(ErrorType.NotFound, $"Employee {id} not found");
        if (dto.Salary < entity.Salary * 0.5m)
            return ServiceResult<bool>.Fail(ErrorType.Validation, "Salary cannot be cut by more than 50%");

        _mapper.Map(dto, entity);
        await _employees.SaveChangesAsync();
        return ServiceResult<bool>.Ok(true);
    }

    public async Task<ServiceResult<bool>> DeleteAsync(int id)
    {
        var entity = await _employees.GetByIdAsync(id);
        if (entity is null)
            return ServiceResult<bool>.Fail(ErrorType.NotFound, $"Employee {id} not found");
        _employees.Remove(entity);
        await _employees.SaveChangesAsync();
        return ServiceResult<bool>.Ok(true);
    }
}

// Controllers/EmployeesController.cs  - thin: HTTP only
using EmployeeApi.Dtos;
using EmployeeApi.Services;
using Microsoft.AspNetCore.Mvc;
namespace EmployeeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _service;
    public EmployeesController(IEmployeeService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<EmployeeDto>>> GetAll() => await _service.GetAllAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int id) =>
        await _service.GetByIdAsync(id) is { } dto ? dto : NotFound();

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeDto dto)
    {
        var result = await _service.CreateAsync(dto);
        if (!result.Success) return ToError(result.Type, result.Error!);
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateEmployeeDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result.Success ? NoContent() : ToError(result.Type, result.Error!);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result.Success ? NoContent() : ToError(result.Type, result.Error!);
    }

    private ObjectResult ToError(ErrorType type, string message) => type switch
    {
        ErrorType.NotFound => NotFound(new { message }),
        ErrorType.Conflict => Conflict(new { message }),
        _ => BadRequest(new { message })
    };
}

// Program.cs  - registrations
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddAutoMapper(cfg => { }, typeof(Program));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));   // open generic
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();`,
      result: `POST /api/employees
{ "firstName": "Kiran", "lastName": "Patel", "email": "kiran@corp.com", "salary": 52000, "departmentId": 1 }
-> 201 Created { "id": 3, "fullName": "Kiran Patel", "email": "kiran@corp.com", "salary": 52000, "isActive": true, "departmentName": "IT" }

Same body again        -> 409 Conflict    { "message": "Email kiran@corp.com is already used" }
"salary": 5000         -> 400 Bad Request { "message": "Minimum salary is 10000" }
"departmentId": 9      -> 400 Bad Request { "message": "Department does not exist" }

PUT /api/employees/1 { "firstName": "Asha", "lastName": "Rao", "salary": 20000, "departmentId": 1, "isActive": true }
-> 400 { "message": "Salary cannot be cut by more than 50%" }

DELETE /api/employees/3 -> 204 No Content
DELETE /api/employees/3 -> 404 { "message": "Employee 3 not found" }

Visual Studio Output window (Debug):
info: EmployeeApi.Services.EmployeeService[0] Employee 3 created`,
      explanation: `The controller has no if-statements about business rules and no DbContext - it only maps ServiceResult to status codes. AddScoped(typeof(IRepository<>), typeof(Repository<>)) registers an open generic, so IRepository<Department> resolves to Repository<Department> automatically. All services are Scoped because they depend on the scoped AppDbContext; the same DbContext instance is shared by both repositories during one request, so SaveChangesAsync commits everything together.`,
    },
    {
      title: 'Unit test the service with Moq (no database needed)',
      scenario: 'Prove that the email-uniqueness rule works by faking the repository.',
      steps: [
        'Add an xUnit Test Project EmployeeApi.Tests and reference EmployeeApi',
        'Right-click EmployeeApi.Tests > Manage NuGet Packages > Browse > install Moq',
        'Add the test class',
        'Test > Test Explorer > Run All (Ctrl+R, A)',
      ],
      code: `using AutoMapper;
using EmployeeApi.Dtos;
using EmployeeApi.Models;
using EmployeeApi.Repositories;
using EmployeeApi.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

public class EmployeeServiceTests
{
    [Fact]
    public async Task CreateAsync_returns_conflict_when_email_exists()
    {
        var employees = new Mock<IEmployeeRepository>();
        employees.Setup(r => r.EmailExistsAsync("asha@corp.com", null)).ReturnsAsync(true);
        var departments = new Mock<IRepository<Department>>();
        var mapper = new Mock<IMapper>();

        var service = new EmployeeService(employees.Object, departments.Object,
                                          mapper.Object, NullLogger<EmployeeService>.Instance);

        var dto = new CreateEmployeeDto { FirstName = "A", LastName = "R", Email = "asha@corp.com", Salary = 50000, DepartmentId = 1 };
        var result = await service.CreateAsync(dto);

        Assert.False(result.Success);
        Assert.Equal(ErrorType.Conflict, result.Type);
        employees.Verify(r => r.AddAsync(It.IsAny<Employee>()), Times.Never);
    }
}`,
      result: `Test Explorer:
  EmployeeServiceTests.CreateAsync_returns_conflict_when_email_exists   Passed
Total: 1, Passed: 1, Failed: 0`,
      explanation: `Because EmployeeService depends on interfaces, Moq can create fake implementations at runtime. No SQL Server, no HTTP - the test runs in milliseconds. This testability is the biggest practical benefit of DI + repository + service layer. Day 114 covers xUnit and Moq in depth.`,
    },
  ],
  interview: [
    { q: 'What is Dependency Injection?', a: 'A technique where a class receives the objects it depends on (usually through its constructor) instead of creating them. An IoC container builds the object graph. It reduces coupling and makes code testable.', level: 'Easy' },
    { q: 'What is the difference between DI and the Dependency Inversion Principle?', a: 'DIP is a design principle: high-level modules depend on abstractions, not on low-level details. DI is a technique (and the container is a tool) used to supply those abstractions at runtime.', level: 'Medium' },
    { q: 'Which lifetime should a DbContext and a repository have, and why?', a: 'Scoped. A DbContext is not thread-safe and tracks entities for one unit of work; one per HTTP request is the right size. A repository that uses it must be scoped (or transient) too.', level: 'Medium' },
    { q: 'What is a captive dependency?', a: 'A longer-lived service holding a shorter-lived one, e.g. a Singleton that takes a Scoped DbContext in its constructor. The scoped object then lives forever and is shared by all threads. ASP.NET Core scope validation throws in Development.', level: 'Hard' },
    { q: 'What is the Repository pattern?', a: 'An abstraction over data access that exposes collection-like methods (GetById, Add, Remove) and hides the persistence technology from the business layer.', level: 'Easy' },
    { q: 'Is a repository needed on top of EF Core?', a: 'Not strictly - DbSet is already a repository and DbContext a unit of work. Repositories still help to centralize complex queries, hide EF Core from the domain and simplify mocking. Many teams use services directly on DbContext; both are acceptable if consistent.', level: 'Hard' },
    { q: 'What belongs in the service layer?', a: 'Business rules and use cases: validations that need data, calculations, orchestration of several repositories, mapping between DTOs and entities, logging of business events. Not HTTP concerns.', level: 'Medium' },
    { q: 'How do you register an open generic repository?', a: 'builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>)); The container closes the generic type on demand.', level: 'Medium' },
    { q: 'How should a service report "not found" to the controller?', a: 'By returning null / a Result object with an error type, or by throwing a custom NotFoundException handled globally. It should not return IActionResult because the service must not know about HTTP.', level: 'Medium' },
    { q: 'How can a singleton use a scoped service safely?', a: 'Inject IServiceScopeFactory, create a scope (using var scope = factory.CreateScope()), resolve the scoped service from scope.ServiceProvider and dispose the scope when finished.', level: 'Hard' },
    { q: 'What happens if you forget to register IEmployeeService?', a: 'When the controller is activated, ASP.NET Core throws InvalidOperationException: Unable to resolve service for type IEmployeeService while attempting to activate EmployeesController. The client gets 500.', level: 'Easy' },
    { q: 'Output question: AddTransient<IClock, Clock>() and a controller injects IClock twice (two parameters). How many Clock instances are created for one request?', a: 'Two - transient creates a new instance for every injection. With AddScoped it would be one, with AddSingleton one for the whole app.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create IDepartmentService/DepartmentService and DepartmentsController with GET all and POST, using IRepository<Department>.',
      hint: 'Reuse the generic repository; reject duplicate department names.',
      solution: `public interface IDepartmentService
{
    Task<List<Department>> GetAllAsync();
    Task<ServiceResult<Department>> CreateAsync(string name);
}
public class DepartmentService(IRepository<Department> repo) : IDepartmentService
{
    public Task<List<Department>> GetAllAsync() => repo.GetAllAsync();
    public async Task<ServiceResult<Department>> CreateAsync(string name)
    {
        if (await repo.ExistsAsync(d => d.Name == name))
            return ServiceResult<Department>.Fail(ErrorType.Conflict, "Department exists");
        var d = new Department { Name = name };
        await repo.AddAsync(d); await repo.SaveChangesAsync();
        return ServiceResult<Department>.Ok(d);
    }
}
// Program.cs: builder.Services.AddScoped<IDepartmentService, DepartmentService>();`,
    },
    {
      task: 'Register a singleton IClock with a SystemClock implementation and use it in EmployeeService to set CreatedAt.',
      hint: 'Singleton is fine because the clock has no state. In .NET 8+ you can also use the built-in TimeProvider.System.',
      solution: `public interface IClock { DateTime UtcNow { get; } }
public class SystemClock : IClock { public DateTime UtcNow => DateTime.UtcNow; }
builder.Services.AddSingleton<IClock, SystemClock>();
// EmployeeService constructor: IClock clock ... entity.CreatedAt = _clock.UtcNow;
// Alternative: builder.Services.AddSingleton(TimeProvider.System); _time.GetUtcNow()`,
    },
    {
      task: 'Demonstrate the three lifetimes: create IOperation with a Guid Id, register OperationTransient, OperationScoped, OperationSingleton and return their ids from GET /api/lifetimes (inject each twice).',
      hint: 'Call the endpoint twice and compare which Guids change.',
      solution: `public interface IOperation { Guid Id { get; } }
public class Operation : IOperation { public Guid Id { get; } = Guid.NewGuid(); }
public class TransientOp : Operation {} public class ScopedOp : Operation {} public class SingletonOp : Operation {}
builder.Services.AddTransient<TransientOp>(); builder.Services.AddScoped<ScopedOp>(); builder.Services.AddSingleton<SingletonOp>();

[HttpGet("/api/lifetimes")]
public IActionResult Get([FromServices] TransientOp t1, [FromServices] TransientOp t2,
                         [FromServices] ScopedOp s1, [FromServices] ScopedOp s2,
                         [FromServices] SingletonOp g1, [FromServices] SingletonOp g2)
    => Ok(new { transientSame = t1.Id == t2.Id, scopedSame = s1.Id == s2.Id, singletonSame = g1.Id == g2.Id, singleton = g1.Id });
// Result: transientSame=false, scopedSame=true, singletonSame=true; singleton Guid stays the same across requests.`,
    },
    {
      task: 'Add a Unit of Work: IUnitOfWork { IEmployeeRepository Employees; IRepository<Department> Departments; Task<int> SaveAsync(); } and use it in EmployeeService.',
      hint: 'The UnitOfWork wraps the shared AppDbContext and exposes the repositories.',
      solution: `public interface IUnitOfWork
{
    IEmployeeRepository Employees { get; }
    IRepository<Department> Departments { get; }
    Task<int> SaveAsync();
}
public class UnitOfWork(AppDbContext db, IEmployeeRepository employees, IRepository<Department> departments) : IUnitOfWork
{
    public IEmployeeRepository Employees => employees;
    public IRepository<Department> Departments => departments;
    public Task<int> SaveAsync() => db.SaveChangesAsync();
}
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();`,
    },
  ],
  quiz: [
    { question: 'Which lifetime creates ONE instance per HTTP request?', options: ['Transient', 'Singleton', 'Scoped', 'Static'], answer: 2, explanation: 'Scoped services live for the duration of a request scope.' },
    { question: 'Where should the rule "email must be unique" be implemented in a layered API?', options: ['Service layer', 'Controller', 'appsettings.json', 'Swagger'], answer: 0, explanation: 'Business rules belong to the service layer; the repository only provides the query.' },
    { question: 'Which registration maps every IRepository<T> to Repository<T>?', options: ['AddScoped<IRepository, Repository>()', 'AddScoped(typeof(IRepository<>), typeof(Repository<>))', 'AddGeneric<Repository>()', 'AddRepository<T>()'], answer: 1, explanation: 'Open generic registration uses typeof with empty angle brackets.' },
    { question: 'A Singleton service that injects AppDbContext causes:', options: ['Faster queries', 'Nothing special', 'A compile error', 'A captive dependency error at startup in Development'], answer: 3, explanation: 'Scope validation detects a scoped service consumed by a singleton.' },
    { question: 'The main benefit of depending on IEmployeeRepository instead of EmployeeRepository is:', options: ['Less memory', 'No need for SQL Server ever', 'Implementations can be swapped (e.g. mocked in tests)', 'Automatic caching'], answer: 2, explanation: 'Programming to an interface enables substitution and testing.' },
  ],
};
