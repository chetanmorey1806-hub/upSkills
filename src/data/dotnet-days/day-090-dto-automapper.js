export default {
  id: 'day-090-dto-automapper',
  title: 'DTO, Request DTO, Response DTO, AutoMapper Basics',
  module: 'ASP.NET Core Web API',
  day: 90,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Stop exposing EF Core entities directly. Learn what a Data Transfer Object (DTO) is, design separate Request DTOs (Create/Update) and Response DTOs, map them by hand with extension methods and then with AutoMapper (profiles, ForMember, ReverseMap, ProjectTo). Build an Employee API that hides sensitive columns and returns a clean JSON contract.`,
  objectives: [
    'Explain why returning entities from an API is risky (over-posting, data leaks, cycles, tight coupling)',
    'Design Request DTOs (CreateEmployeeDto, UpdateEmployeeDto) and Response DTOs (EmployeeDto)',
    'Write manual mapping code with extension methods and records',
    'Install and configure AutoMapper with a Profile, ForMember, Ignore and ReverseMap',
    'Use ProjectTo to map directly inside the SQL query',
  ],
  theory: [
    {
      heading: 'What is a DTO?',
      content: `A Data Transfer Object is a simple class (or record) whose only job is to carry data across a boundary - here, between the API and its clients. It has properties but no business logic and no EF Core navigation magic. Analogy: a restaurant menu is a DTO of the kitchen. Customers see dish name and price, not the supplier list, the cost price or the recipe.`,
      points: [
        'Entity = shape of the database table (Employee with PasswordHash, Salary, DepartmentId, CreatedBy ...)',
        'DTO = shape of the JSON that the client sends or receives',
        'The API contract can stay stable even when the database changes',
      ],
    },
    {
      heading: 'Problems with returning entities directly',
      content: `On Day 88 the controller accepted and returned the Student entity. That is fine for a demo but creates real problems in production.`,
      points: [
        'Data leak: PasswordHash, internal flags or salaries are serialized into the response',
        'Over-posting (mass assignment): a client adds "isAdmin": true or "id": 99 to the JSON and the model binder sets it',
        'Object cycles: Employee.Department.Employees.Department ... causes JsonException or huge responses',
        'Tight coupling: renaming a column breaks every client (React, mobile)',
        'Different operations need different shapes: Create has no Id, Update may not allow changing Email, the response adds FullName',
      ],
    },
    {
      heading: 'Request DTO and Response DTO',
      content: `A Request DTO describes what the client is ALLOWED to send for one operation (CreateEmployeeDto, UpdateEmployeeDto). Validation attributes (Day 92) go here. A Response DTO describes what the client RECEIVES (EmployeeDto, EmployeeListItemDto). It can flatten related data (DepartmentName instead of a Department object) and add computed values (FullName).`,
      syntax: `public record CreateEmployeeDto(string FirstName, string LastName, string Email, decimal Salary, int DepartmentId);
public record UpdateEmployeeDto(string FirstName, string LastName, decimal Salary, int DepartmentId);
public record EmployeeDto(int Id, string FullName, string Email, decimal Salary, string DepartmentName);`,
      tip: 'Naming used in this course: XxxDto for responses, CreateXxxDto / UpdateXxxDto for requests. Keep them in a Dtos folder.',
    },
    {
      heading: 'Manual mapping',
      content: `Mapping means copying values from one object to another. Manual mapping is just code: an extension method ToDto() or a static FromEntity(). It is fast, easy to debug, and the compiler catches renamed properties. For small projects many teams prefer it.`,
      syntax: `public static class EmployeeMappings
{
    public static EmployeeDto ToDto(this Employee e) =>
        new(e.Id, e.FirstName + " " + e.LastName, e.Email, e.Salary, e.Department?.Name ?? "");

    public static Employee ToEntity(this CreateEmployeeDto d) => new()
    {
        FirstName = d.FirstName, LastName = d.LastName, Email = d.Email,
        Salary = d.Salary, DepartmentId = d.DepartmentId
    };
}`,
    },
    {
      heading: 'AutoMapper basics',
      content: `AutoMapper is a NuGet library that maps objects by convention: properties with the same name are copied automatically. You describe special cases once in a Profile class. Flattening is built in: Department.Name maps to DepartmentName automatically. Register it in Program.cs and inject IMapper into controllers or services.`,
      syntax: `// Install-Package AutoMapper
public class EmployeeProfile : Profile
{
    public EmployeeProfile()
    {
        CreateMap<Employee, EmployeeDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.FirstName + " " + s.LastName));
        CreateMap<CreateEmployeeDto, Employee>();
        CreateMap<UpdateEmployeeDto, Employee>()
            .ForMember(d => d.Email, o => o.Ignore());
    }
}

// Program.cs
builder.Services.AddAutoMapper(cfg => { }, typeof(Program));

// usage
EmployeeDto dto = _mapper.Map<EmployeeDto>(employee);
_mapper.Map(updateDto, existingEmployee);   // copy into an existing tracked entity`,
      points: [
        'Since AutoMapper 13 the separate package AutoMapper.Extensions.Microsoft.DependencyInjection is not needed',
        'AutoMapper 15+ requires a license key for commercial use (cfg.LicenseKey = "..."); version 14 is the last fully free version. Mapster and manual mapping are free alternatives',
        'Call config.AssertConfigurationIsValid() in a unit test to catch unmapped properties',
      ],
    },
    {
      heading: 'ProjectTo - mapping inside the SQL query',
      content: `_mapper.Map after ToListAsync loads FULL entities and then maps them in memory. ProjectTo<EmployeeDto>(_mapper.ConfigurationProvider) turns the mapping into a LINQ Select, so EF Core selects ONLY the columns the DTO needs and performs the join to Department automatically. It is the fastest way to return lists.`,
      syntax: `var list = await _db.Employees
    .AsNoTracking()
    .ProjectTo<EmployeeDto>(_mapper.ConfigurationProvider)
    .ToListAsync();
// SQL: SELECT e.Id, e.FirstName + N' ' + e.LastName, e.Email, e.Salary, d.Name FROM Employees e LEFT JOIN Departments d ...`,
    },
  ],
  examples: [
    {
      title: 'Console: entity vs DTO with manual mapping',
      scenario: 'See, without a web server, how a DTO hides PasswordHash and adds computed fields.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DtoMappingDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System.Text.Json;

var employees = new List<Employee>
{
    new Employee { Id = 1, FirstName = "Asha", LastName = "Rao",  Email = "asha@corp.com", Salary = 65000, PasswordHash = "HASH#1", DepartmentName = "IT" },
    new Employee { Id = 2, FirstName = "Ravi", LastName = "Shah", Email = "ravi@corp.com", Salary = 48000, PasswordHash = "HASH#2", DepartmentName = "HR" },
};

// Entity -> Response DTO
List<EmployeeResponse> dtos = employees.Select(e => e.ToResponse()).ToList();
foreach (var d in dtos)
    Console.WriteLine($"{d.Id} | {d.FullName} | {d.Email} | {d.Department} | Grade {d.Grade}");

// Request DTO -> Entity (Id is assigned by the "database", not by the client)
var request = new CreateEmployeeRequest("Kiran", "Patel", "kiran@corp.com", 52000, "IT");
Employee created = request.ToEntity(newId: 3);
Console.WriteLine($"Entity created: Id={created.Id}, Name={created.FirstName} {created.LastName}, Salary={created.Salary}");

EmployeeResponse response = created.ToResponse();
Console.WriteLine($"Response: {response.FullName}, Grade {response.Grade}");

bool leaks = typeof(EmployeeResponse).GetProperty("PasswordHash") != null;
Console.WriteLine($"Response has PasswordHash property: {leaks}");

var web = new JsonSerializerOptions(JsonSerializerDefaults.Web);
Console.WriteLine(JsonSerializer.Serialize(dtos[0], web));

// ---------- Entity ----------
public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public decimal Salary { get; set; }
    public string PasswordHash { get; set; } = "";
    public string DepartmentName { get; set; } = "";
}

// ---------- DTOs ----------
public record CreateEmployeeRequest(string FirstName, string LastName, string Email, decimal Salary, string Department);
public record EmployeeResponse(int Id, string FullName, string Email, string Department, string Grade);

// ---------- Mapping ----------
public static class EmployeeMappings
{
    public static EmployeeResponse ToResponse(this Employee e) =>
        new(e.Id, e.FirstName + " " + e.LastName, e.Email, e.DepartmentName,
            e.Salary >= 60000 ? "A" : e.Salary >= 50000 ? "B" : "C");

    public static Employee ToEntity(this CreateEmployeeRequest r, int newId) => new()
    {
        Id = newId,
        FirstName = r.FirstName,
        LastName = r.LastName,
        Email = r.Email,
        Salary = r.Salary,
        DepartmentName = r.Department,
        PasswordHash = "TEMP"
    };
}`,
      csharp: {
        files: {
          'Program.cs': `using System.Text.Json;

var employees = new List<Employee>
{
    new Employee { Id = 1, FirstName = "Asha", LastName = "Rao",  Email = "asha@corp.com", Salary = 65000, PasswordHash = "HASH#1", DepartmentName = "IT" },
    new Employee { Id = 2, FirstName = "Ravi", LastName = "Shah", Email = "ravi@corp.com", Salary = 48000, PasswordHash = "HASH#2", DepartmentName = "HR" },
};

// Entity -> Response DTO
List<EmployeeResponse> dtos = employees.Select(e => e.ToResponse()).ToList();
foreach (var d in dtos)
    Console.WriteLine($"{d.Id} | {d.FullName} | {d.Email} | {d.Department} | Grade {d.Grade}");

// Request DTO -> Entity (Id is assigned by the "database", not by the client)
var request = new CreateEmployeeRequest("Kiran", "Patel", "kiran@corp.com", 52000, "IT");
Employee created = request.ToEntity(newId: 3);
Console.WriteLine($"Entity created: Id={created.Id}, Name={created.FirstName} {created.LastName}, Salary={created.Salary}");

EmployeeResponse response = created.ToResponse();
Console.WriteLine($"Response: {response.FullName}, Grade {response.Grade}");

bool leaks = typeof(EmployeeResponse).GetProperty("PasswordHash") != null;
Console.WriteLine($"Response has PasswordHash property: {leaks}");

var web = new JsonSerializerOptions(JsonSerializerDefaults.Web);
Console.WriteLine(JsonSerializer.Serialize(dtos[0], web));

// ---------- Entity ----------
public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public decimal Salary { get; set; }
    public string PasswordHash { get; set; } = "";
    public string DepartmentName { get; set; } = "";
}

// ---------- DTOs ----------
public record CreateEmployeeRequest(string FirstName, string LastName, string Email, decimal Salary, string Department);
public record EmployeeResponse(int Id, string FullName, string Email, string Department, string Grade);

// ---------- Mapping ----------
public static class EmployeeMappings
{
    public static EmployeeResponse ToResponse(this Employee e) =>
        new(e.Id, e.FirstName + " " + e.LastName, e.Email, e.DepartmentName,
            e.Salary >= 60000 ? "A" : e.Salary >= 50000 ? "B" : "C");

    public static Employee ToEntity(this CreateEmployeeRequest r, int newId) => new()
    {
        Id = newId,
        FirstName = r.FirstName,
        LastName = r.LastName,
        Email = r.Email,
        Salary = r.Salary,
        DepartmentName = r.Department,
        PasswordHash = "TEMP"
    };
}`,
        },
        stdin: '',
      },
      result: `1 | Asha Rao | asha@corp.com | IT | Grade A
2 | Ravi Shah | ravi@corp.com | HR | Grade C
Entity created: Id=3, Name=Kiran Patel, Salary=52000
Response: Kiran Patel, Grade B
Response has PasswordHash property: False
{"id":1,"fullName":"Asha Rao","email":"asha@corp.com","department":"IT","grade":"A"}`,
      explanation: `The entity has 7 properties including PasswordHash; the response DTO has 5 and none of them is secret. FullName and Grade do not exist in the database - they are computed during mapping. JsonSerializerDefaults.Web gives camelCase names, exactly like ASP.NET Core does for API responses. The request DTO has no Id at all, so a client cannot choose the primary key (no over-posting).`,
    },
    {
      title: 'EmployeeApi: entities, DTOs and DbContext',
      scenario: 'Create the data layer and DTO classes for an Employee API with departments.',
      steps: [
        'File > New > Project > ASP.NET Core Web API > name EmployeeApi > .NET 10 > Use controllers > Create',
        'Package Manager Console: Install-Package Microsoft.EntityFrameworkCore.SqlServer',
        'Install-Package Microsoft.EntityFrameworkCore.Tools',
        'Install-Package AutoMapper -Version 14.0.0   (free version; 15+ needs a license key)',
        'Install-Package Swashbuckle.AspNetCore',
        'Create folders Models, Dtos, Data, Mapping and add the files below',
        'Add the connection string to appsettings.json',
        'PM> Add-Migration InitialCreate  then  PM> Update-Database',
      ],
      code: `// Models/Department.cs
namespace EmployeeApi.Models;
public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<Employee> Employees { get; set; } = new();
}

// Models/Employee.cs
namespace EmployeeApi.Models;
public class Employee
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public string PasswordHash { get; set; } = string.Empty;   // must never leave the server
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
}

// Dtos/EmployeeDtos.cs
namespace EmployeeApi.Dtos;

public class CreateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public int DepartmentId { get; set; }
}

public class UpdateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public int DepartmentId { get; set; }
    public bool IsActive { get; set; }
}

public class EmployeeDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal Salary { get; set; }
    public bool IsActive { get; set; }
    public string DepartmentName { get; set; } = string.Empty;   // flattened from Department.Name
}

// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using EmployeeApi.Models;
namespace EmployeeApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Department> Departments => Set<Department>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Employee>().Property(e => e.Salary).HasPrecision(18, 2);
        mb.Entity<Employee>().HasIndex(e => e.Email).IsUnique();
        mb.Entity<Department>().HasData(
            new Department { Id = 1, Name = "IT" },
            new Department { Id = 2, Name = "HR" });
        mb.Entity<Employee>().HasData(
            new Employee { Id = 1, FirstName = "Asha", LastName = "Rao", Email = "asha@corp.com", Salary = 65000, PasswordHash = "x1", DepartmentId = 1, CreatedAt = new DateTime(2026, 11, 1) },
            new Employee { Id = 2, FirstName = "Ravi", LastName = "Shah", Email = "ravi@corp.com", Salary = 48000, PasswordHash = "x2", DepartmentId = 2, CreatedAt = new DateTime(2026, 11, 1) });
    }
}

// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EmployeeApiDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*"
}`,
      result: `PM> Add-Migration InitialCreate
Build succeeded.
To undo this action, use Remove-Migration.
PM> Update-Database
Applying migration '20261117090000_InitialCreate'.
Done.

SSMS: EmployeeApiDB has tables dbo.Departments (2 rows) and dbo.Employees (2 rows).`,
      explanation: `The DTOs live in their own namespace and do not reference EF Core at all. UpdateEmployeeDto deliberately has no Email and no Id: the id comes from the route and email cannot be changed after registration. EmployeeDto.DepartmentName follows AutoMapper's flattening convention (Department + Name), so no extra configuration is needed for it.`,
    },
    {
      title: 'AutoMapper profile, Program.cs and EmployeesController',
      scenario: 'Map entities to DTOs with AutoMapper and expose a clean Employee API.',
      steps: [
        'Add Mapping/EmployeeProfile.cs',
        'Replace Program.cs',
        'Right-click Controllers > Add > Controller > API Controller - Empty > EmployeesController.cs',
        'Press Ctrl+F5 and open Swagger',
        'Execute GET /api/employees and POST /api/employees with the sample JSON',
      ],
      code: `// Mapping/EmployeeProfile.cs
using AutoMapper;
using EmployeeApi.Dtos;
using EmployeeApi.Models;
namespace EmployeeApi.Mapping;

public class EmployeeProfile : Profile
{
    public EmployeeProfile()
    {
        // Entity -> Response DTO
        CreateMap<Employee, EmployeeDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.FirstName + " " + s.LastName));
        // DepartmentName is flattened automatically from Department.Name

        // Request DTOs -> Entity
        CreateMap<CreateEmployeeDto, Employee>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.PasswordHash, o => o.Ignore())
            .ForMember(d => d.Department, o => o.Ignore());

        CreateMap<UpdateEmployeeDto, Employee>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.Email, o => o.Ignore())
            .ForMember(d => d.PasswordHash, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore())
            .ForMember(d => d.Department, o => o.Ignore());
    }
}

// Program.cs
using EmployeeApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// scans the assembly that contains Program for Profile classes
builder.Services.AddAutoMapper(cfg => { }, typeof(Program));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.MapControllers();
app.Run();

// Controllers/EmployeesController.cs
using AutoMapper;
using AutoMapper.QueryableExtensions;
using EmployeeApi.Data;
using EmployeeApi.Dtos;
using EmployeeApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace EmployeeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;

    public EmployeesController(AppDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll() =>
        await _db.Employees.AsNoTracking()
            .OrderBy(e => e.Id)
            .ProjectTo<EmployeeDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> GetById(int id)
    {
        var dto = await _db.Employees.AsNoTracking()
            .Where(e => e.Id == id)
            .ProjectTo<EmployeeDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();
        return dto is null ? NotFound() : dto;
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeDto input)
    {
        if (!await _db.Departments.AnyAsync(d => d.Id == input.DepartmentId))
            return BadRequest(new { message = "Department does not exist" });

        Employee entity = _mapper.Map<Employee>(input);
        entity.PasswordHash = "set-by-identity-later";
        _db.Employees.Add(entity);
        await _db.SaveChangesAsync();

        await _db.Entry(entity).Reference(e => e.Department).LoadAsync();
        EmployeeDto result = _mapper.Map<EmployeeDto>(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateEmployeeDto input)
    {
        var entity = await _db.Employees.FindAsync(id);
        if (entity is null) return NotFound();

        _mapper.Map(input, entity);       // copies DTO values INTO the tracked entity
        await _db.SaveChangesAsync();
        return NoContent();
    }
}`,
      result: `GET /api/employees -> 200 OK
[
  { "id": 1, "fullName": "Asha Rao",  "email": "asha@corp.com", "salary": 65000.00, "isActive": true, "departmentName": "IT" },
  { "id": 2, "fullName": "Ravi Shah", "email": "ravi@corp.com", "salary": 48000.00, "isActive": true, "departmentName": "HR" }
]

POST /api/employees
{ "firstName": "Kiran", "lastName": "Patel", "email": "kiran@corp.com", "salary": 52000, "departmentId": 1 }
-> 201 Created, Location: https://localhost:7001/api/employees/3
{ "id": 3, "fullName": "Kiran Patel", "email": "kiran@corp.com", "salary": 52000, "isActive": true, "departmentName": "IT" }

POST with an extra "passwordHash": "hacked" or "id": 99 -> those properties are simply ignored (not in the DTO).

PUT /api/employees/2
{ "firstName": "Ravi", "lastName": "Shah", "salary": 51000, "departmentId": 1, "isActive": true }
-> 204 No Content`,
      explanation: `ProjectTo makes EF Core generate SELECT with only the DTO columns and a JOIN to Departments - PasswordHash is never even read from SQL Server. Values read from a decimal(18,2) column come back with scale 2, so the GET list shows 65000.00, while the freshly created object shows 52000 because it still holds the value parsed from the request. _mapper.Map(source, destination) updates the existing tracked entity so EF Core sees the changes. Every destination property that should not come from the request is Ignore()d, which also keeps AssertConfigurationIsValid happy.`,
    },
    {
      title: 'Unit test: validate the AutoMapper configuration',
      scenario: 'Catch a forgotten mapping (for example a new DTO property) before it reaches production.',
      steps: [
        'Right-click the solution > Add > New Project > xUnit Test Project > EmployeeApi.Tests',
        'Right-click EmployeeApi.Tests > Add > Project Reference > EmployeeApi',
        'Add the test class below',
        'Test > Run All Tests (Ctrl+R, A)',
      ],
      code: `using AutoMapper;
using EmployeeApi.Mapping;
using EmployeeApi.Models;
using EmployeeApi.Dtos;
using Xunit;

public class MappingTests
{
    private readonly MapperConfiguration _config =
        new(cfg => cfg.AddProfile<EmployeeProfile>());

    [Fact]
    public void Configuration_is_valid() => _config.AssertConfigurationIsValid();

    [Fact]
    public void Employee_maps_to_dto_with_full_name_and_department()
    {
        IMapper mapper = _config.CreateMapper();
        var e = new Employee { Id = 7, FirstName = "Meena", LastName = "Iyer",
                               Department = new Department { Name = "Finance" } };

        EmployeeDto dto = mapper.Map<EmployeeDto>(e);

        Assert.Equal("Meena Iyer", dto.FullName);
        Assert.Equal("Finance", dto.DepartmentName);
    }
}`,
      result: `Test Explorer:
  MappingTests.Configuration_is_valid                                  Passed
  MappingTests.Employee_maps_to_dto_with_full_name_and_department      Passed
Total: 2, Passed: 2, Failed: 0

If you add "public string Phone { get; set; }" to EmployeeDto but not to Employee, Configuration_is_valid fails with:
AutoMapper.AutoMapperConfigurationException: Unmapped members were found ... Unmapped properties: Phone`,
      explanation: `This is the AutoMapper 14 syntax. In AutoMapper 15+ the constructor also takes a logger factory: new MapperConfiguration(cfg => cfg.AddProfile<EmployeeProfile>(), NullLoggerFactory.Instance) (namespace Microsoft.Extensions.Logging.Abstractions). AssertConfigurationIsValid checks that every DESTINATION property has a source or is explicitly ignored.`,
    },
  ],
  interview: [
    { q: 'What is a DTO and why do we use it in Web APIs?', a: 'A Data Transfer Object is a plain class that defines the shape of data exchanged with clients. It decouples the API contract from the database schema, hides sensitive fields, prevents over-posting and avoids serialization cycles.', level: 'Easy' },
    { q: 'What is over-posting (mass assignment)?', a: 'When the client sends extra JSON properties (e.g. "isAdmin": true or "salary") that the model binder copies onto an entity, changing fields the user should not control. Binding to a request DTO that contains only allowed fields prevents it.', level: 'Medium' },
    { q: 'Difference between a Request DTO and a Response DTO?', a: 'A request DTO describes input for one operation (Create/Update), usually without Id and with validation attributes. A response DTO describes output, can flatten relationships and add computed fields such as FullName.', level: 'Easy' },
    { q: 'What is flattening in AutoMapper?', a: 'Mapping nested properties to flat ones by naming convention: source Department.Name maps automatically to destination DepartmentName.', level: 'Medium' },
    { q: 'What does ReverseMap() do?', a: 'It creates the opposite mapping as well (DTO -> Entity) from a CreateMap<Entity, Dto>() definition. Use it carefully: reverse mapping of request data may set fields you did not intend.', level: 'Medium' },
    { q: 'Why is ProjectTo better than Map for lists from EF Core?', a: 'ProjectTo translates the mapping into a LINQ Select that runs in SQL, so only needed columns are selected and joins are generated automatically. Map works on already-loaded entities, so all columns are loaded first.', level: 'Hard' },
    { q: 'How do you update an existing entity from a DTO with AutoMapper?', a: 'Load the tracked entity, then call _mapper.Map(dto, entity). AutoMapper copies values into the existing instance and EF Core detects the changes on SaveChanges.', level: 'Medium' },
    { q: 'How do you ignore a property in AutoMapper?', a: 'CreateMap<Src, Dest>().ForMember(d => d.Prop, o => o.Ignore());', level: 'Easy' },
    { q: 'What are the downsides of AutoMapper?', a: 'Mappings are hidden (harder to debug, "magic"), renames break silently unless AssertConfigurationIsValid is tested, slight runtime cost, and newer versions require a commercial license. Manual mapping or source-generated mappers (Mapperly) are alternatives.', level: 'Hard' },
    { q: 'Should DTOs be classes or records?', a: 'Both work. Records give concise syntax, value equality and immutability (great for responses). Classes with settable properties are easier with some tools (AutoMapper, older serializers). System.Text.Json supports both.', level: 'Medium' },
    { q: 'Where should mapping code live?', a: 'In a Mapping folder (AutoMapper profiles) or extension methods next to the DTOs. Commonly it is called from the service layer (Day 91), so controllers stay thin.', level: 'Medium' },
    { q: 'Output question: CreateMap<Employee, EmployeeDto>() with no ForMember. Employee has FirstName="A", LastName="B"; EmployeeDto has FullName. What is dto.FullName after Map?', a: 'An empty string (its initializer value) - or null if it has no initializer - because there is no source property called FullName or GetFullName(). AssertConfigurationIsValid would report FullName as unmapped.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create DepartmentDto { Id, Name, EmployeeCount } and an endpoint GET /api/departments that returns it using ProjectTo.',
      hint: 'ForMember(d => d.EmployeeCount, o => o.MapFrom(s => s.Employees.Count)) - translated to a COUNT subquery.',
      solution: `public class DepartmentDto { public int Id { get; set; } public string Name { get; set; } = ""; public int EmployeeCount { get; set; } }

CreateMap<Department, DepartmentDto>()
    .ForMember(d => d.EmployeeCount, o => o.MapFrom(s => s.Employees.Count));

[HttpGet("/api/departments")]
public async Task<ActionResult<IEnumerable<DepartmentDto>>> Departments() =>
    await _db.Departments.ProjectTo<DepartmentDto>(_mapper.ConfigurationProvider).ToListAsync();`,
    },
    {
      task: 'Replace AutoMapper in EmployeesController with manual extension methods ToDto() and ToEntity().',
      hint: 'For lists use Select(e => new EmployeeDto { ... }) directly on the IQueryable so it is still translated to SQL.',
      solution: `public static class EmployeeMappings
{
    public static IQueryable<EmployeeDto> SelectDto(this IQueryable<Employee> q) =>
        q.Select(e => new EmployeeDto
        {
            Id = e.Id, FullName = e.FirstName + " " + e.LastName, Email = e.Email,
            Salary = e.Salary, IsActive = e.IsActive, DepartmentName = e.Department!.Name
        });

    public static Employee ToEntity(this CreateEmployeeDto d) => new()
    { FirstName = d.FirstName, LastName = d.LastName, Email = d.Email, Salary = d.Salary, DepartmentId = d.DepartmentId };
}
// GetAll: await _db.Employees.AsNoTracking().SelectDto().ToListAsync();`,
    },
    {
      task: 'Add EmployeeListItemDto { Id, FullName } for a dropdown and return it from GET /api/employees/lookup.',
      hint: 'Different screens can use different response DTOs.',
      solution: `public record EmployeeListItemDto(int Id, string FullName);

[HttpGet("lookup")]
public async Task<IEnumerable<EmployeeListItemDto>> Lookup() =>
    await _db.Employees.AsNoTracking()
        .Select(e => new EmployeeListItemDto(e.Id, e.FirstName + " " + e.LastName))
        .ToListAsync();`,
    },
    {
      task: 'Map Salary to a formatted string SalaryText ("65000.00") in a new EmployeeDetailsDto without depending on the server culture.',
      hint: 'Use ToString("0.00", CultureInfo.InvariantCulture) inside MapFrom (in-memory Map, not ProjectTo).',
      solution: `CreateMap<Employee, EmployeeDetailsDto>()
    .ForMember(d => d.SalaryText,
               o => o.MapFrom(s => s.Salary.ToString("0.00", CultureInfo.InvariantCulture)));
// Use _mapper.Map<EmployeeDetailsDto>(entity) after loading the entity.`,
    },
  ],
  quiz: [
    { question: 'Which is the MAIN security reason for using request DTOs?', options: ['Faster JSON parsing', 'Preventing over-posting of fields like Id or IsAdmin', 'Smaller DLL size', 'Enabling Swagger'], answer: 1, explanation: 'Only the properties present in the DTO can be bound from the request.' },
    { question: 'Which AutoMapper method maps inside the database query?', options: ['Map<T>()', 'ReverseMap()', 'ForMember()', 'ProjectTo<T>()'], answer: 3, explanation: 'ProjectTo builds an expression that EF Core translates into SQL.' },
    { question: 'Source Department.Name maps to destination DepartmentName automatically because of:', options: ['Flattening convention', 'ReverseMap', 'Ignore()', 'Value converters'], answer: 0, explanation: 'AutoMapper splits PascalCase names and walks the source object graph.' },
    { question: 'How do you update a tracked entity from a DTO using AutoMapper?', options: ['_mapper.Map<Employee>(dto)', '_db.Update(dto)', '_mapper.Map(dto, entity)', '_mapper.ProjectTo(dto)'], answer: 2, explanation: 'The two-argument overload copies into an existing destination object.' },
    { question: 'Which property should NOT appear in CreateEmployeeDto?', options: ['FirstName', 'Email', 'DepartmentId', 'Id'], answer: 3, explanation: 'The database generates the Id; the client must not send it.' },
  ],
};
