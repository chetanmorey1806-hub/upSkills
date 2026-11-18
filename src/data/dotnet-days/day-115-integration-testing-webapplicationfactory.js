const fakeHandlerCode = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;

// HttpClient talks to a FAKE server (no network) – the client code is real
var handler = new FakeApiHandler();
var http = new HttpClient(handler) { BaseAddress = new Uri("https://api.test/") };
var client = new StudentApiClient(http);

var all = await client.GetAllAsync();
Console.WriteLine($"GET all -> {all.Count} students: {string.Join(", ", all.Select(s => s.Name))}");
Check("GET all returns 2 students", all.Count == 2);

var one = await client.GetAsync(1);
Check("GET 1 returns Asha", one?.Name == "Asha");

var missing = await client.GetAsync(99);
Check("GET 99 returns null (404)", missing is null);

var (status, created, location) = await client.CreateAsync(new CreateStudentDto("Kiran", 91));
Console.WriteLine($"POST -> {(int)status} {status}, id={created?.Id}, Location={location}");
Check("POST returns 201 with id 3", status == HttpStatusCode.Created && created?.Id == 3);

var (badStatus, _, _) = await client.CreateAsync(new CreateStudentDto("", 50));
Check("POST invalid returns 400", badStatus == HttpStatusCode.BadRequest);

Check("GET all now returns 3", (await client.GetAllAsync()).Count == 3);

Console.WriteLine("Requests seen by the fake server:");
foreach (var line in handler.Log) Console.WriteLine($"  {line}");

void Check(string name, bool ok) => Console.WriteLine($"{(ok ? "PASS" : "FAIL")}  {name}");

// ===== client code we want to test =====
class StudentApiClient
{
    private readonly HttpClient _http;
    public StudentApiClient(HttpClient http) => _http = http;

    public async Task<List<StudentDto>> GetAllAsync() =>
        await _http.GetFromJsonAsync<List<StudentDto>>("api/students") ?? new List<StudentDto>();

    public async Task<StudentDto?> GetAsync(int id)
    {
        HttpResponseMessage resp = await _http.GetAsync($"api/students/{id}");
        if (resp.StatusCode == HttpStatusCode.NotFound) return null;
        resp.EnsureSuccessStatusCode();
        return await resp.Content.ReadFromJsonAsync<StudentDto>();
    }

    public async Task<(HttpStatusCode Status, StudentDto? Created, string? Location)> CreateAsync(CreateStudentDto dto)
    {
        HttpResponseMessage resp = await _http.PostAsJsonAsync("api/students", dto);
        StudentDto? body = resp.StatusCode == HttpStatusCode.Created
            ? await resp.Content.ReadFromJsonAsync<StudentDto>()
            : null;
        return (resp.StatusCode, body, resp.Headers.Location?.ToString());
    }
}

record StudentDto(int Id, string Name, int Marks);
record CreateStudentDto(string Name, int Marks);

// ===== a fake server: HttpMessageHandler is the last step before the network =====
class FakeApiHandler : HttpMessageHandler
{
    private readonly List<StudentDto> _students = new() { new(1, "Asha", 88), new(2, "Ravi", 72) };
    public List<string> Log { get; } = new();

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        string path = request.RequestUri!.AbsolutePath;
        Log.Add($"{request.Method} {path}");

        if (request.Method == HttpMethod.Get && path == "/api/students")
            return Json(HttpStatusCode.OK, _students);

        if (request.Method == HttpMethod.Get && path.StartsWith("/api/students/"))
        {
            int id = int.Parse(path.Substring("/api/students/".Length));
            StudentDto? s = _students.FirstOrDefault(x => x.Id == id);
            return s is null ? new HttpResponseMessage(HttpStatusCode.NotFound) : Json(HttpStatusCode.OK, s);
        }

        if (request.Method == HttpMethod.Post && path == "/api/students")
        {
            var dto = await request.Content!.ReadFromJsonAsync<CreateStudentDto>();
            if (dto is null || string.IsNullOrWhiteSpace(dto.Name) || dto.Marks is < 0 or > 100)
                return Json(HttpStatusCode.BadRequest, new { error = "Invalid student" });

            var created = new StudentDto(_students.Max(x => x.Id) + 1, dto.Name, dto.Marks);
            _students.Add(created);
            HttpResponseMessage resp = Json(HttpStatusCode.Created, created);
            resp.Headers.Location = new Uri($"/api/students/{created.Id}", UriKind.Relative);
            return resp;
        }
        return new HttpResponseMessage(HttpStatusCode.NotFound);
    }

    private static HttpResponseMessage Json(HttpStatusCode code, object body) =>
        new HttpResponseMessage(code) { Content = JsonContent.Create(body) };
}
`;

const apiUnderTestCode = `// ===== Solution layout =====
// SchoolApi/                 (ASP.NET Core Web API – the app under test)
// SchoolApi.IntegrationTests (xUnit test project)

// ===== SchoolApi/Models/Student.cs =====
using System.ComponentModel.DataAnnotations;

public class Student
{
    public int Id { get; set; }
    [Required, StringLength(50)] public string Name { get; set; } = "";
    [Range(0, 100)] public int Marks { get; set; }
}

public record CreateStudentDto([Required, StringLength(50)] string Name, [Range(0, 100)] int Marks);
public record StudentDto(int Id, string Name, int Marks);

// ===== SchoolApi/Data/AppDbContext.cs =====
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Student> Students => Set<Student>();
}

// ===== SchoolApi/Controllers/StudentsController.cs =====
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StudentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<StudentDto>>> GetAll() =>
        await _db.Students.OrderBy(s => s.Id).Select(s => new StudentDto(s.Id, s.Name, s.Marks)).ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentDto>> Get(int id)
    {
        var s = await _db.Students.FindAsync(id);
        return s is null ? NotFound() : new StudentDto(s.Id, s.Name, s.Marks);
    }

    [HttpPost]
    public async Task<ActionResult<StudentDto>> Create(CreateStudentDto dto)
    {
        var s = new Student { Name = dto.Name, Marks = dto.Marks };
        _db.Students.Add(s);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = s.Id }, new StudentDto(s.Id, s.Name, s.Marks));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await _db.Students.FindAsync(id);
        if (s is null) return NotFound();
        _db.Students.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ===== SchoolApi/Program.cs =====
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();
builder.Services.AddAuthentication().AddJwtBearer();     // real JWT config from Day 111
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok("Healthy"));
app.Run();

// Makes the auto-generated Program class visible to the test project
public partial class Program { }

// ===== SchoolApi/appsettings.json =====
/*
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=SchoolApiDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
*/`;

const factoryTestsCode = `// ===== Create the test project =====
// dotnet new xunit -n SchoolApi.IntegrationTests
// dotnet add SchoolApi.IntegrationTests reference SchoolApi
// dotnet add SchoolApi.IntegrationTests package Microsoft.AspNetCore.Mvc.Testing
// dotnet add SchoolApi.IntegrationTests package Microsoft.EntityFrameworkCore.Sqlite
// (Use the package versions that match your target framework, e.g. 8.0.x for net8.0)

// ===== SchoolApi.IntegrationTests/SchoolApiFactory.cs =====
using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

public class SchoolApiFactory : WebApplicationFactory<Program>
{
    private DbConnection? _connection;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // 1) remove the SQL Server registration made in Program.cs
            services.RemoveAll<DbContextOptions<AppDbContext>>();

            // 2) use an in-memory SQLite database (real SQL, very fast, no server)
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();                               // keep it open or the DB disappears
            services.AddDbContext<AppDbContext>(o => o.UseSqlite(_connection));

            // 3) create schema + seed data
            using var scope = services.BuildServiceProvider().CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
            db.Students.AddRange(
                new Student { Name = "Asha", Marks = 88 },
                new Student { Name = "Ravi", Marks = 72 });
            db.SaveChanges();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        _connection?.Dispose();
    }
}

// ===== SchoolApi.IntegrationTests/StudentsApiTests.cs =====
using System.Net;
using System.Net.Http.Json;
using Xunit;

public class StudentsApiTests : IClassFixture<SchoolApiFactory>
{
    private readonly HttpClient _client;
    public StudentsApiTests(SchoolApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_ReturnsSeededStudents()
    {
        var response = await _client.GetAsync("/api/students");

        response.EnsureSuccessStatusCode();                                    // 2xx
        Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType!.ToString());
        var students = await response.Content.ReadFromJsonAsync<List<StudentDto>>();
        Assert.Contains(students!, s => s.Name == "Asha");
    }

    [Fact]
    public async Task Get_UnknownId_Returns404()
    {
        var response = await _client.GetAsync("/api/students/999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Post_ValidStudent_Returns201AndCanBeReadBack()
    {
        var response = await _client.PostAsJsonAsync("/api/students", new { name = "Kiran", marks = 91 });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);                             // /api/students/3
        var created = await response.Content.ReadFromJsonAsync<StudentDto>();

        var again = await _client.GetFromJsonAsync<StudentDto>(response.Headers.Location);
        Assert.Equal("Kiran", again!.Name);
        Assert.Equal(created!.Id, again.Id);
    }

    [Theory]
    [InlineData("", 50)]          // name required
    [InlineData("Bad", 150)]      // marks out of range
    public async Task Post_InvalidStudent_Returns400ProblemDetails(string name, int marks)
    {
        var response = await _client.PostAsJsonAsync("/api/students", new { name, marks });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("errors", body);                                       // [ApiController] ProblemDetails
    }

    [Fact]
    public async Task Delete_WithoutToken_Returns401()
    {
        var response = await _client.DeleteAsync("/api/students/1");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}`;

const authTestsCode = `// ===== SchoolApi.IntegrationTests/TestAuthHandler.cs =====
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

// Logs every request in as the user described by the "X-Test-Role" header
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string Scheme = "Test";

    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
                           ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-Test-Role", out var role))
            return Task.FromResult(AuthenticateResult.NoResult());       // anonymous -> 401 on [Authorize]

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "test-user-1"),
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.Role, role.ToString())
        };
        var identity = new ClaimsIdentity(claims, Scheme);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

// ===== SchoolApi.IntegrationTests/AuthorizedStudentsTests.cs =====
using System.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class AuthorizedStudentsTests : IClassFixture<SchoolApiFactory>
{
    private readonly SchoolApiFactory _factory;
    public AuthorizedStudentsTests(SchoolApiFactory factory) => _factory = factory;

    private HttpClient CreateClientWithTestAuth() =>
        _factory.WithWebHostBuilder(b => b.ConfigureTestServices(services =>
        {
            services.AddAuthentication(o =>
            {
                o.DefaultAuthenticateScheme = TestAuthHandler.Scheme;
                o.DefaultChallengeScheme = TestAuthHandler.Scheme;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.Scheme, _ => { });
        }))
        .CreateClient();

    [Fact]
    public async Task Delete_AsUser_Returns403()
    {
        var client = CreateClientWithTestAuth();
        client.DefaultRequestHeaders.Add("X-Test-Role", "User");

        var response = await client.DeleteAsync("/api/students/2");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Delete_AsAdmin_Returns204ThenGetReturns404()
    {
        var client = CreateClientWithTestAuth();
        client.DefaultRequestHeaders.Add("X-Test-Role", "Admin");

        var delete = await client.DeleteAsync("/api/students/2");
        var get = await client.GetAsync("/api/students/2");

        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
    }
}

// Alternative: call the real /api/auth/login endpoint in the test, read the JWT
// and set client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);`;

const httpFileCode = `### ===== SchoolApi.http (Visual Studio 2022 17.6+ / VS Code REST Client) =====
@host = https://localhost:7001

GET {{host}}/api/students
Accept: application/json

###
GET {{host}}/api/students/999

###
POST {{host}}/api/students
Content-Type: application/json

{
  "name": "Kiran",
  "marks": 91
}

###
POST {{host}}/api/students
Content-Type: application/json

{
  "name": "",
  "marks": 150
}

### ===== Postman: Tests tab of "POST Create student" =====
// pm.test("Status is 201", () => pm.response.to.have.status(201));
// pm.test("Has Location header", () => pm.response.to.have.header("Location"));
// pm.test("Name is Kiran", () => {
//     const body = pm.response.json();
//     pm.expect(body.name).to.eql("Kiran");
//     pm.collectionVariables.set("studentId", body.id);   // use {{studentId}} in next requests
// });
// pm.test("Response time < 500 ms", () => pm.expect(pm.response.responseTime).to.be.below(500));

### ===== Run the Postman collection from the command line / CI =====
// npm install -g newman
// newman run SchoolApi.postman_collection.json -e Local.postman_environment.json`;

export default {
  id: 'day-115-integration-testing-webapplicationfactory',
  title: 'Integration Testing, WebApplicationFactory and API Testing',
  module: 'Module 10: Authentication, Security, Testing & Integration',
  day: 115,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Unit tests check classes in isolation; integration tests check that the real pieces – routing, model binding, validation, filters, DI, EF Core, authentication and JSON – work together. Learn to test HTTP client code with a fake HttpMessageHandler, host the whole ASP.NET Core API in memory with WebApplicationFactory<Program>, swap SQL Server for SQLite in-memory, test authenticated endpoints with a test authentication handler, and do manual/automated API testing with .http files, Postman tests and Newman.',
  objectives: [
    'Explain the difference between unit, integration and end-to-end tests',
    'Test HttpClient-based code with a custom HttpMessageHandler',
    'Use WebApplicationFactory<Program> and HttpClient to call the API in memory',
    'Replace the database with SQLite in-memory and seed test data in a custom factory',
    'Test [Authorize] endpoints with a TestAuthHandler and automate API checks with Postman/Newman',
  ],
  theory: [
    {
      heading: 'What is integration testing?',
      content:
        'An integration test checks that several components work correctly TOGETHER. For an ASP.NET Core API that means sending a real HTTP request through the whole pipeline: middleware, routing, model binding, [ApiController] validation, controllers, services, EF Core and the JSON serializer – and checking the HTTP status code, headers and body. Analogy: unit tests check each Lego brick; integration tests check that the bricks actually click together into the model on the box.',
      points: [
        'Finds wiring bugs unit tests miss: wrong route, missing DI registration, wrong JSON names, missing [FromBody], migration problems',
        'Slower than unit tests (milliseconds to seconds), so fewer of them',
        'End-to-end (E2E) tests go further: real browser + React + API + database (Playwright, Selenium)',
      ],
    },
    {
      heading: 'WebApplicationFactory<TEntryPoint>',
      content:
        'The package Microsoft.AspNetCore.Mvc.Testing contains WebApplicationFactory<Program>. It starts your real application (Program.cs) inside the test process using TestServer – no ports, no IIS, no Kestrel. factory.CreateClient() returns an HttpClient whose requests go straight into the in-memory pipeline. With top-level statements the Program class is internal, so add "public partial class Program { }" at the end of Program.cs (or InternalsVisibleTo). Use IClassFixture<TFactory> so the app starts once per test class.',
      syntax: `public class StudentsApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public StudentsApiTests(WebApplicationFactory<Program> f) => _client = f.CreateClient();

    [Fact]
    public async Task GetAll_Returns200()
    {
        var res = await _client.GetAsync("/api/students");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }
}`,
    },
    {
      heading: 'Customizing the test host (database, settings, services)',
      content:
        'Inherit from WebApplicationFactory<Program> and override ConfigureWebHost. builder.UseEnvironment("Testing") picks appsettings.Testing.json. builder.ConfigureServices / ConfigureTestServices let you remove real registrations (services.RemoveAll<DbContextOptions<AppDbContext>>()) and add test ones: SQLite in-memory, a fake e-mail sender, a fixed TimeProvider. SQLite in-memory runs real SQL and enforces constraints; keep the connection open for the life of the factory. EF Core InMemory provider is simpler but is not a relational database (no constraints, no transactions), so Microsoft recommends SQLite or a real SQL Server (e.g. Testcontainers in Docker) for integration tests.',
      points: [
        'Seed data in the factory, or per test through factory.Services.CreateScope()',
        'Tests in the same class share the database – make them independent (unique names, do not rely on counts)',
        'Respawn / Testcontainers are popular tools for resetting real SQL Server databases between tests',
      ],
    },
    {
      heading: 'Testing secured endpoints',
      content:
        'For [Authorize] endpoints you need an authenticated request. Options: (1) call the real login endpoint and send the JWT as Bearer token – most realistic; (2) register a TestAuthHandler – an AuthenticationHandler that creates a ClaimsPrincipal from a test header (e.g. X-Test-Role: Admin) – fast and lets you test 401/403/200 for every role; (3) generate a JWT in the test with the same key as the test configuration. Always test the negative cases: no token = 401, wrong role = 403.',
    },
    {
      heading: 'Testing HTTP clients with HttpMessageHandler',
      content:
        'When your code CALLS another API (payment gateway, weather service, your own API from a console/Blazor/MAUI app), you can test it without the network. HttpClient sends every request through an HttpMessageHandler. Write a fake handler that inspects the HttpRequestMessage and returns a prepared HttpResponseMessage, and pass it to new HttpClient(handler). Libraries such as RichardSzalay.MockHttp or WireMock.Net make this even easier.',
    },
    {
      heading: 'Manual and automated API testing tools',
      content:
        'Swagger UI is good for exploring. Visual Studio .http files (Add > New Item > HTTP File) keep requests next to your code and run with a click. Postman collections group requests, use environments ({{baseUrl}}, {{token}}) and Tests scripts written in JavaScript (pm.test, pm.expect). Newman runs Postman collections from the command line, so they can run in CI. Check status codes, response bodies, headers, response time, validation errors (400 + ProblemDetails), 401/403/404 cases.',
      points: [
        'dotnet test runs xUnit integration tests the same way as unit tests',
        'Name tests by endpoint and scenario: Post_InvalidStudent_Returns400',
        'Run integration tests in GitHub Actions on every push (Day 118)',
      ],
    },
  ],
  examples: [
    {
      title: 'Testing an API client with a fake HttpMessageHandler',
      scenario:
        'StudentApiClient uses HttpClient to call /api/students. Instead of a real server, plug in FakeApiHandler that keeps students in a list and answers GET, GET by id and POST. Then run checks and print every request the fake server received.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it HttpClientTestingDemo',
        'Replace Program.cs with the code below (System.Net.Http.Json is part of .NET, no NuGet needed)',
        'Press Ctrl+F5',
        'Set a breakpoint (F9) inside FakeApiHandler.SendAsync and press F5 to see each HttpRequestMessage',
      ],
      code: fakeHandlerCode,
      csharp: { files: { 'Program.cs': fakeHandlerCode }, stdin: '' },
      result: `GET all -> 2 students: Asha, Ravi
PASS  GET all returns 2 students
PASS  GET 1 returns Asha
PASS  GET 99 returns null (404)
POST -> 201 Created, id=3, Location=/api/students/3
PASS  POST returns 201 with id 3
PASS  POST invalid returns 400
PASS  GET all now returns 3
Requests seen by the fake server:
  GET /api/students
  GET /api/students/1
  GET /api/students/99
  POST /api/students
  POST /api/students
  GET /api/students`,
      explanation:
        'BaseAddress "https://api.test/" + "api/students" gives the path /api/students. GetFromJsonAsync and PostAsJsonAsync use web JSON defaults (camelCase names, case-insensitive reading), so the records round-trip correctly. The 404 is turned into null by the client, the invalid POST (empty name) gets 400, and the valid POST gets 201 with a Location header. The log proves the client sent exactly the expected requests – the same idea as Moq\'s Verify.',
    },
    {
      title: 'The API under test (SchoolApi)',
      scenario:
        'A small but real Web API: Student entity with validation, AppDbContext on SQL Server, a StudentsController with GET, GET by id, POST (201 + Location) and an Admin-only DELETE, plus a /health endpoint. The last line "public partial class Program { }" makes it testable.',
      steps: [
        'File > New > Project > ASP.NET Core Web API, name it SchoolApi (Use controllers ticked)',
        'Install-Package Microsoft.EntityFrameworkCore.SqlServer, Microsoft.EntityFrameworkCore.Tools, Microsoft.AspNetCore.Authentication.JwtBearer',
        'Add the Models, Data and Controllers files and replace Program.cs',
        'Package Manager Console: Add-Migration Init; Update-Database',
        'Press F5 and try the endpoints in Swagger once by hand',
      ],
      code: apiUnderTestCode,
      result: `GET  /api/students        -> 200 [ { "id": 1, "name": "Asha", "marks": 88 }, ... ]
GET  /api/students/999    -> 404 Not Found
POST /api/students { "name": "Kiran", "marks": 91 }
                          -> 201 Created, Location: https://localhost:7001/api/students/3
POST /api/students { "name": "", "marks": 150 }
                          -> 400 { "title": "One or more validation errors occurred.", "errors": { "Name": [...], "Marks": [...] } }
DELETE /api/students/1 (no token) -> 401 Unauthorized
GET  /health              -> 200 "Healthy"`,
      explanation:
        '[ApiController] automatically returns 400 with ValidationProblemDetails when data annotations fail, so the controller does not need ModelState checks. CreatedAtAction builds the Location header from the Get action. The partial Program class is public so that WebApplicationFactory<Program> in another assembly can reference it.',
    },
    {
      title: 'Integration tests with a custom WebApplicationFactory and SQLite in-memory',
      scenario:
        'Start SchoolApi in memory, replace SQL Server with SQLite in-memory, seed two students and test the real HTTP behaviour: health check, GET list, 404, POST 201 + read back, validation 400 and 401 for DELETE without a token.',
      steps: [
        'Right-click the solution > Add > New Project > xUnit Test Project, name it SchoolApi.IntegrationTests',
        'Add a project reference to SchoolApi',
        'Install Microsoft.AspNetCore.Mvc.Testing and Microsoft.EntityFrameworkCore.Sqlite in the test project',
        'Add SchoolApiFactory.cs and StudentsApiTests.cs',
        'Test > Test Explorer > Run All (Ctrl+R, A), or run "dotnet test" in the solution folder',
      ],
      code: factoryTestsCode,
      result: `dotnet test
Passed StudentsApiTests.Health_ReturnsOk
Passed StudentsApiTests.GetAll_ReturnsSeededStudents
Passed StudentsApiTests.Get_UnknownId_Returns404
Passed StudentsApiTests.Post_ValidStudent_Returns201AndCanBeReadBack
Passed StudentsApiTests.Post_InvalidStudent_Returns400ProblemDetails(name: "", marks: 50)
Passed StudentsApiTests.Post_InvalidStudent_Returns400ProblemDetails(name: "Bad", marks: 150)
Passed StudentsApiTests.Delete_WithoutToken_Returns401

Passed!  - Failed: 0, Passed: 7, Skipped: 0, Total: 7`,
      explanation:
        'WebApplicationFactory runs Program.cs, then our ConfigureWebHost overrides: the SQL Server DbContextOptions are removed and SQLite in-memory is registered. EnsureCreated builds the tables from the model (no migrations needed for tests). Every request goes through routing, validation, controller, EF Core and JSON – no mocks. IClassFixture shares one factory (and one database) for the class, so tests avoid depending on exact row counts.',
    },
    {
      title: 'Testing [Authorize] endpoints with a TestAuthHandler',
      scenario:
        'DELETE /api/students/{id} requires the Admin role. Create a fake authentication scheme that turns an X-Test-Role header into a logged-in user, then verify 403 for a User and 204 for an Admin.',
      steps: [
        'Add TestAuthHandler.cs and AuthorizedStudentsTests.cs to SchoolApi.IntegrationTests',
        'WithWebHostBuilder + ConfigureTestServices registers the Test scheme as the default only for these tests',
        'Run the tests in Test Explorer',
      ],
      code: authTestsCode,
      result: `Passed AuthorizedStudentsTests.Delete_AsUser_Returns403
Passed AuthorizedStudentsTests.Delete_AsAdmin_Returns204ThenGetReturns404
Total tests: 2. Passed: 2. Failed: 0.`,
      explanation:
        'HandleAuthenticateAsync builds a ClaimsPrincipal with the role from the header, exactly like JwtBearer would from a token. Without the header it returns NoResult, so [Authorize] still produces 401. With role User the authorization middleware returns 403, with Admin the delete succeeds (204) and a following GET returns 404. ConfigureTestServices runs AFTER Program.cs registrations, so it can override the default schemes.',
    },
    {
      title: 'API testing with .http files, Postman tests and Newman',
      scenario:
        'Keep manual API checks next to the code in a .http file, write automated assertions in Postman\'s Tests tab, and run the whole Postman collection from the command line with Newman (useful in CI).',
      steps: [
        'In Visual Studio: right-click SchoolApi > Add > New Item > HTTP File, name it SchoolApi.http',
        'Paste the requests, start the API (F5) and click "Send request" above each request',
        'In Postman: create a collection SchoolApi, add the POST request and paste the script into the Tests tab (newer Postman versions call it Scripts > Post-response)',
        'Export the collection and environment (File > Export) and run newman run ... in a terminal',
      ],
      code: httpFileCode,
      result: `newman

SchoolApi
→ Get all students
  GET https://localhost:7001/api/students [200 OK, 312B, 45ms]
  ✓  Status is 200
→ Create student
  POST https://localhost:7001/api/students [201 Created, 268B, 38ms]
  ✓  Status is 201
  ✓  Has Location header
  ✓  Name is Kiran
  ✓  Response time < 500 ms

┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              assertions │        5 │        0 │
└─────────────────────────┴──────────┴──────────┘`,
      explanation:
        'The .http file uses a variable (@host) and ### separators; Visual Studio shows the response beside the file. Postman test scripts run after each response; pm.collectionVariables.set passes the new id to later requests. Newman runs the same collection headlessly and returns a non-zero exit code when an assertion fails, which makes a CI pipeline fail. Sizes and times will vary.',
    },
  ],
  interview: [
    { q: 'What is the difference between a unit test and an integration test?', a: 'A unit test checks one class in isolation with dependencies replaced by doubles. An integration test runs several real components together (HTTP pipeline, DI, EF Core, database) to check they work as a whole.', level: 'Easy' },
    { q: 'What is WebApplicationFactory?', a: 'A class from Microsoft.AspNetCore.Mvc.Testing that boots the real application (its Program/Startup) in memory using TestServer and provides an HttpClient (CreateClient) to send requests without network ports.', level: 'Easy' },
    { q: 'Why do we add "public partial class Program { }" to Program.cs?', a: 'With top-level statements the compiler generates an internal Program class. The test project needs a public type to use as WebApplicationFactory<Program>; the partial declaration makes it public. (.NET 10 templates may already expose it.)', level: 'Medium' },
    { q: 'How do you replace the real database in integration tests?', a: 'Subclass WebApplicationFactory, override ConfigureWebHost, remove the DbContextOptions registration and add a test database such as SQLite in-memory (with an open connection) or a SQL Server container, then create and seed the schema.', level: 'Medium' },
    { q: 'Why is SQLite in-memory often preferred over the EF Core InMemory provider?', a: 'SQLite is a real relational database: it enforces keys, constraints and SQL translation. The InMemory provider is not relational, so tests can pass even though the real database would fail.', level: 'Hard' },
    { q: 'What is the difference between ConfigureServices and ConfigureTestServices on the web host builder?', a: 'ConfigureTestServices callbacks run after the application\'s own service registrations, so they reliably override them; ConfigureServices in the factory may run before or after depending on hosting model.', level: 'Hard' },
    { q: 'How can you test an endpoint protected with [Authorize(Roles = "Admin")]?', a: 'Log in through the API and send the real JWT, generate a test JWT with the test signing key, or register a TestAuthHandler that creates a ClaimsPrincipal with the desired roles.', level: 'Medium' },
    { q: 'What does IClassFixture<T> do in xUnit?', a: 'Creates one instance of T (e.g. the factory) shared by all tests in the class and disposes it afterwards, so the app starts only once per class.', level: 'Medium' },
    { q: 'How do you test code that uses HttpClient without calling a real server?', a: 'Pass a custom HttpMessageHandler (fake) to the HttpClient constructor or use a library like MockHttp/WireMock.Net; the handler returns prepared responses.', level: 'Medium' },
    { q: 'What does EnsureSuccessStatusCode do?', a: 'Throws HttpRequestException if the status code is not in the 200–299 range; otherwise does nothing.', level: 'Easy' },
    { q: 'What is Newman?', a: 'The command-line runner for Postman collections, used to run API test suites in CI pipelines.', level: 'Easy' },
    { q: 'Name three things integration tests catch that unit tests usually do not.', a: 'Wrong routes or HTTP verbs, missing DI registrations, JSON naming/serialization issues, validation attributes not applied, middleware order problems, EF mapping/constraint errors.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a PUT /api/students/{id} endpoint to SchoolApi and write integration tests for 204 (updated), 404 (unknown id) and 400 (marks 150).',
      hint: 'Use _client.PutAsJsonAsync and then GET the student to confirm the change.',
      solution: `[Fact]
public async Task Put_Existing_Returns204AndUpdates()
{
    var res = await _client.PutAsJsonAsync("/api/students/1", new { name = "Asha K", marks = 90 });
    Assert.Equal(HttpStatusCode.NoContent, res.StatusCode);
    var s = await _client.GetFromJsonAsync<StudentDto>("/api/students/1");
    Assert.Equal("Asha K", s!.Name);
}

[Fact]
public async Task Put_Unknown_Returns404() =>
    Assert.Equal(HttpStatusCode.NotFound,
        (await _client.PutAsJsonAsync("/api/students/999", new { name = "X", marks = 50 })).StatusCode);

[Fact]
public async Task Put_InvalidMarks_Returns400() =>
    Assert.Equal(HttpStatusCode.BadRequest,
        (await _client.PutAsJsonAsync("/api/students/1", new { name = "X", marks = 150 })).StatusCode);`,
    },
    {
      task: 'Extend FakeApiHandler from Example 1 to support DELETE /api/students/{id} returning 204 or 404, and add a DeleteAsync method + checks to the client.',
      hint: 'request.Method == HttpMethod.Delete; RemoveAll returns how many were removed.',
      solution: `// in FakeApiHandler.SendAsync
if (request.Method == HttpMethod.Delete && path.StartsWith("/api/students/"))
{
    int id = int.Parse(path.Substring("/api/students/".Length));
    int removed = _students.RemoveAll(x => x.Id == id);
    return new HttpResponseMessage(removed > 0 ? HttpStatusCode.NoContent : HttpStatusCode.NotFound);
}

// in StudentApiClient
public async Task<bool> DeleteAsync(int id) =>
    (await _http.DeleteAsync($"api/students/{id}")).StatusCode == HttpStatusCode.NoContent;

// checks
Check("DELETE 2 works", await client.DeleteAsync(2));
Check("DELETE 2 again fails", !await client.DeleteAsync(2));`,
    },
    {
      task: 'Write an integration test that logs in through the real /api/auth/login endpoint (from Day 111) and calls /api/auth/me with the returned token.',
      hint: 'Seed a user in the factory with UserManager, read accessToken from the login JSON, set the Authorization header.',
      solution: `[Fact]
public async Task Me_WithRealToken_ReturnsUser()
{
    var login = await _client.PostAsJsonAsync("/api/auth/login",
        new { email = "test@demo.com", password = "Test@12345" });
    login.EnsureSuccessStatusCode();
    var auth = await login.Content.ReadFromJsonAsync<AuthResponse>();

    _client.DefaultRequestHeaders.Authorization =
        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", auth!.AccessToken);

    var me = await _client.GetAsync("/api/auth/me");
    Assert.Equal(HttpStatusCode.OK, me.StatusCode);
}`,
    },
    {
      task: 'Create a Postman collection for the Student API with requests for GET all, GET by id, POST, PUT, DELETE. Add at least one test script per request and run it with Newman.',
      hint: 'Use an environment variable {{baseUrl}} and save the created id with pm.collectionVariables.set.',
      solution: `// GET all - Tests
pm.test("200", () => pm.response.to.have.status(200));
pm.test("is array", () => pm.expect(pm.response.json()).to.be.an("array"));

// POST - Tests
pm.test("201", () => pm.response.to.have.status(201));
pm.collectionVariables.set("id", pm.response.json().id);

// DELETE {{baseUrl}}/api/students/{{id}} - Tests
pm.test("204", () => pm.response.to.have.status(204));

// terminal
// newman run StudentApi.postman_collection.json -e Local.postman_environment.json`,
    },
  ],
  quiz: [
    {
      question: 'Which NuGet package provides WebApplicationFactory?',
      options: ['Moq', 'Microsoft.AspNetCore.Mvc.Testing', 'xunit.runner.visualstudio', 'Swashbuckle.AspNetCore'],
      answer: 1,
      explanation: 'Microsoft.AspNetCore.Mvc.Testing contains WebApplicationFactory and TestServer support.',
    },
    {
      question: 'Why must the SQLite in-memory connection stay open during the tests?',
      options: ['To improve speed only', 'Because EF Core requires it for migrations', 'The in-memory database is deleted when its last connection closes', 'SQLite cannot run queries otherwise'],
      answer: 2,
      explanation: 'A ":memory:" database exists only as long as a connection to it is open.',
    },
    {
      question: 'A test calls DELETE on an [Authorize(Roles="Admin")] endpoint with no credentials. What should it expect?',
      options: ['401 Unauthorized', '403 Forbidden', '204 No Content', '500 Internal Server Error'],
      answer: 0,
      explanation: 'Without authentication the challenge result is 401; 403 is for authenticated users without the role.',
    },
    {
      question: 'What is the job of an HttpMessageHandler in HttpClient testing?',
      options: ['It formats JSON', 'It stores cookies', 'It retries failed tests', 'It can return fake responses instead of sending requests over the network'],
      answer: 3,
      explanation: 'HttpClient delegates sending to its handler, so a fake handler can answer requests in memory.',
    },
    {
      question: 'Which statement about integration tests is TRUE?',
      options: ['They replace all unit tests', 'They exercise several real components together, e.g. routing + controller + EF Core', 'They must run against the production database', 'They cannot run in CI'],
      answer: 1,
      explanation: 'Integration tests check that real components cooperate; use isolated test databases and run them in CI.',
    },
  ],
};
