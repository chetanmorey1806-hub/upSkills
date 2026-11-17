export default {
  id: 'day-087-api-project-structure-endpoints',
  title: 'API Project Structure, Controllers, Endpoints, HTTP Methods',
  module: 'ASP.NET Core Web API',
  day: 87,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Walk through every file of an ASP.NET Core Web API project (csproj, Program.cs, appsettings.json, launchSettings.json, Controllers, .http file), learn attribute routing, route tokens and constraints, HTTP method attributes, action return types and binding sources, and build an Employee API that uses all HTTP methods.`,
  objectives: [
    'Describe the purpose of each file and folder in a Web API project',
    'Configure attribute routing with tokens, templates and constraints',
    'Use [HttpGet], [HttpPost], [HttpPut], [HttpPatch], [HttpDelete] correctly',
    'Choose between IActionResult, ActionResult<T> and concrete return types',
    'Bind data with [FromRoute], [FromQuery], [FromBody], [FromHeader] and [FromServices]',
  ],
  theory: [
    {
      heading: 'Web API Project Structure',
      content: `When you create File > New > Project > ASP.NET Core Web API named EmployeeApi, Visual Studio generates this structure (Solution Explorer):`,
      syntax: `EmployeeApi/
 ├─ Connected Services/
 ├─ Dependencies/            (NuGet packages, frameworks, analyzers)
 ├─ Properties/
 │   └─ launchSettings.json  (local run profiles: ports, launchUrl, ASPNETCORE_ENVIRONMENT)
 ├─ Controllers/
 │   └─ WeatherForecastController.cs   (sample - delete it later)
 ├─ appsettings.json         (configuration: logging, connection strings, JWT settings)
 ├─ appsettings.Development.json
 ├─ EmployeeApi.http         (send requests from inside Visual Studio)
 ├─ Program.cs               (host builder, DI registrations, middleware pipeline)
 ├─ WeatherForecast.cs       (sample model)
 └─ EmployeeApi.csproj       (target framework, package references)`,
      points: [
        'Real projects add folders: Models (Entities), DTOs, Data (DbContext), Repositories, Services, Middleware, Mappings, Validators',
        'EmployeeApi.csproj uses Sdk="Microsoft.NET.Sdk.Web" which brings in ASP.NET Core automatically',
        'The .http file is a lightweight Postman alternative built into Visual Studio 2022 17.6+',
      ],
    },
    {
      heading: 'Program.cs for an API: services and pipeline',
      content: `Program.cs has two halves. Before builder.Build() you register services in the DI container (builder.Services). After Build() you configure the middleware pipeline (app.Use...) and map endpoints. Order of middleware matters: HTTPS redirection, CORS, Authentication, Authorization, then MapControllers.`,
      syntax: `var builder = WebApplication.CreateBuilder(args);
// 1) services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();
// 2) pipeline
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();`,
    },
    {
      heading: 'Controllers, Endpoints and Attribute Routing',
      content: `An endpoint = HTTP method + route template + action method. Web APIs use attribute routing. The controller-level [Route] is a prefix; action-level templates are appended.`,
      syntax: `[Route("api/[controller]")]      // [controller] token -> "employees"
[HttpGet]                          // GET  api/employees
[HttpGet("{id:int}")]              // GET  api/employees/5
[HttpGet("by-dept/{dept}")]        // GET  api/employees/by-dept/IT
[HttpGet("~/api/staff")]           // ~ ignores the controller prefix -> GET api/staff
[HttpGet("{id:int:min(1)}")]       // multiple constraints`,
      points: [
        'Route tokens: [controller], [action], [area]',
        'Constraints: int, long, guid, bool, datetime, decimal, alpha, min(n), max(n), range(a,b), length(n), regex(...)',
        'Optional parameter: {id?}; default value: {page=1}',
        'Name a route to generate links: [HttpGet("{id}", Name = "GetEmployee")]',
        'Two actions with the same verb + template cause AmbiguousMatchException at runtime',
      ],
    },
    {
      heading: 'HTTP Method Attributes',
      content: `Each verb attribute tells routing which HTTP method an action handles.`,
      points: [
        '[HttpGet] - read data; never change state; 200 OK / 404 Not Found',
        '[HttpPost] - create a resource; 201 Created with Location header; 400 on invalid input',
        '[HttpPut] - replace the whole resource; 204 No Content (or 200 with body); 404 if missing',
        '[HttpPatch] - partial update (some fields); 204 or 200',
        '[HttpDelete] - remove; 204 No Content; 404 if missing',
        '[HttpHead] and [HttpOptions] exist too; [AcceptVerbs("GET","HEAD")] handles several',
      ],
    },
    {
      heading: 'Action Return Types',
      content: `Three common choices. Concrete type (Employee) - always 200, simplest but cannot return 404. IActionResult - any result (Ok, NotFound...) but Swagger cannot infer the response type. ActionResult<T> - best of both: return T directly (implicit 200) or any ActionResult; Swagger knows the type T. Use [ProducesResponseType] to document other status codes.`,
      syntax: `public Employee Get1(int id) => repo.Find(id);                 // always 200
public IActionResult Get2(int id) => Ok(repo.Find(id));         // any result, type unknown to Swagger
public ActionResult<Employee> Get3(int id)                      // recommended
{
    var e = repo.Find(id);
    if (e is null) return NotFound();
    return e;                                                   // implicit Ok(e)
}
public async Task<ActionResult<Employee>> Get4(int id) { ... }  // async version`,
    },
    {
      heading: 'Binding Sources',
      content: `Model binding converts HTTP request data into action parameters. With [ApiController], complex types are read from the body (JSON) and simple types from the route or query string. You can be explicit with attributes.`,
      points: [
        '[FromRoute] int id - from the URL path segment {id}',
        '[FromQuery] string? dept - from ?dept=IT',
        '[FromBody] Employee emp - from the JSON body (only ONE [FromBody] parameter per action)',
        '[FromHeader(Name = "X-Client-Id")] string clientId - from a request header',
        '[FromForm] IFormFile file - from multipart/form-data',
        '[FromServices] IEmailService email - from the DI container (also inferred automatically for registered services in .NET 7+)',
      ],
    },
  ],
  examples: [
    {
      title: 'Explore the generated configuration files',
      scenario: 'Understand the project file, launch settings and appsettings of a new EmployeeApi project.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API > name EmployeeApi > .NET 10 > tick Use controllers > Create',
        'Double-click the project name in Solution Explorer to open EmployeeApi.csproj',
        'Expand Properties and open launchSettings.json; change launchUrl to "swagger"',
        'Open appsettings.json and add the "CompanyName" key',
        'Install Swashbuckle: Install-Package Swashbuckle.AspNetCore (Package Manager Console)',
        'Delete WeatherForecast.cs and Controllers/WeatherForecastController.cs',
        'Press Ctrl+F5 and note the https port in the browser address bar',
      ],
      code: `<!-- EmployeeApi.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>   <!-- or net8.0 -->
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="9.0.6" />
  </ItemGroup>
</Project>

// Properties/launchSettings.json
{
  "profiles": {
    "https": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "https://localhost:7001;http://localhost:5001",
      "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Development" }
    }
  }
}

// appsettings.json
{
  "Logging": {
    "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" }
  },
  "AllowedHosts": "*",
  "CompanyName": "Tech Solutions Pvt Ltd"
}`,
      result: `Ctrl+F5 opens https://localhost:7001/swagger
Swagger UI shows "EmployeeApi v1" with no endpoints yet (the sample controller was deleted).
The console window shows:
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development`,
      explanation: `launchSettings.json is used ONLY on your development machine (Visual Studio / dotnet run). It sets the ports and the ASPNETCORE_ENVIRONMENT variable, which decides whether appsettings.Development.json is loaded and whether Swagger is shown.`,
    },
    {
      title: 'Employee API with all HTTP methods (in-memory)',
      scenario: 'Build EmployeesController with GET all, GET by id, GET by department, POST, PUT, PATCH (salary only) and DELETE using a static list.',
      steps: [
        'Add folder Models and class Models/Employee.cs',
        'Right-click Controllers > Add > Controller > API > API Controller - Empty > EmployeesController.cs',
        'Paste the code and replace Program.cs',
        'Press Ctrl+F5 and test every endpoint in Swagger (Try it out > Execute)',
      ],
      code: `// Models/Employee.cs
namespace EmployeeApi.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public decimal Salary { get; set; }
}

// Controllers/EmployeesController.cs
using EmployeeApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EmployeesController : ControllerBase
{
    private static readonly List<Employee> Employees = new()
    {
        new Employee { Id = 1, Name = "Asha",  Department = "IT", Salary = 55000 },
        new Employee { Id = 2, Name = "Ravi",  Department = "HR", Salary = 42000 },
        new Employee { Id = 3, Name = "Meena", Department = "IT", Salary = 61000 }
    };

    // GET api/employees
    [HttpGet]
    public ActionResult<IEnumerable<Employee>> GetAll() => Employees;

    // GET api/employees/1
    [HttpGet("{id:int}", Name = "GetEmployee")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<Employee> GetById(int id)
    {
        var emp = Employees.FirstOrDefault(e => e.Id == id);
        if (emp is null) return NotFound();
        return emp;
    }

    // GET api/employees/by-dept/IT
    [HttpGet("by-dept/{dept:alpha}")]
    public ActionResult<IEnumerable<Employee>> GetByDepartment(string dept) =>
        Employees.Where(e => e.Department.Equals(dept, StringComparison.OrdinalIgnoreCase)).ToList();

    // POST api/employees
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public ActionResult<Employee> Create([FromBody] Employee employee)
    {
        employee.Id = Employees.Count == 0 ? 1 : Employees.Max(e => e.Id) + 1;
        Employees.Add(employee);
        return CreatedAtRoute("GetEmployee", new { id = employee.Id }, employee);
    }

    // PUT api/employees/2
    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] Employee employee)
    {
        if (id != employee.Id) return BadRequest(new { message = "Id mismatch" });
        var existing = Employees.FirstOrDefault(e => e.Id == id);
        if (existing is null) return NotFound();

        existing.Name = employee.Name;
        existing.Department = employee.Department;
        existing.Salary = employee.Salary;
        return NoContent();
    }

    // PATCH api/employees/2/salary?amount=45000
    [HttpPatch("{id:int}/salary")]
    public IActionResult UpdateSalary(int id, [FromQuery] decimal amount)
    {
        var existing = Employees.FirstOrDefault(e => e.Id == id);
        if (existing is null) return NotFound();
        existing.Salary = amount;
        return Ok(existing);
    }

    // DELETE api/employees/3
    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var existing = Employees.FirstOrDefault(e => e.Id == id);
        if (existing is null) return NotFound();
        Employees.Remove(existing);
        return NoContent();
    }
}`,
      result: `POST /api/employees
Request body: { "name": "Kiran", "department": "Finance", "salary": 48000 }
-> 201 Created
   Location: https://localhost:7001/api/employees/4
   { "id": 4, "name": "Kiran", "department": "Finance", "salary": 48000 }

GET /api/employees/by-dept/IT -> 200 OK
[ { "id": 1, "name": "Asha", "department": "IT", "salary": 55000 },
  { "id": 3, "name": "Meena", "department": "IT", "salary": 61000 } ]

PUT /api/employees/2  body: { "id": 2, "name": "Ravi Kumar", "department": "HR", "salary": 43000 } -> 204 No Content
PUT /api/employees/2  body with "id": 5 -> 400 Bad Request { "message": "Id mismatch" }
PATCH /api/employees/2/salary?amount=45000 -> 200 OK { "id": 2, "name": "Ravi Kumar", "department": "HR", "salary": 45000 }
DELETE /api/employees/3 -> 204 No Content
GET /api/employees/3 -> 404 Not Found (ProblemDetails JSON with "status": 404)`,
      explanation: `Each action is one endpoint: verb + template. CreatedAtRoute builds the Location header from the named route "GetEmployee". The static list lives as long as the app runs, so data resets when you restart - tomorrow we replace it with EF Core and SQL Server.`,
    },
    {
      title: 'Test endpoints with the Visual Studio .http file',
      scenario: 'Use EmployeeApi.http to send requests without leaving Visual Studio.',
      steps: [
        'Open EmployeeApi.http in Solution Explorer (or Add > New Item > HTTP File)',
        'Replace its content with the code below and set @host to your https port',
        'Start the API with Ctrl+F5',
        'Click the green "Send request" link above each request',
        'The response (status, headers, body) appears in the right-hand pane',
      ],
      code: `@host = https://localhost:7001

### Get all employees
GET {{host}}/api/employees
Accept: application/json

### Get one employee
GET {{host}}/api/employees/1

### Create employee
POST {{host}}/api/employees
Content-Type: application/json

{
  "name": "Kiran",
  "department": "Finance",
  "salary": 48000
}

### Replace employee 2
PUT {{host}}/api/employees/2
Content-Type: application/json

{
  "id": 2,
  "name": "Ravi Kumar",
  "department": "HR",
  "salary": 43000
}

### Patch salary
PATCH {{host}}/api/employees/2/salary?amount=45000

### Delete employee 3
DELETE {{host}}/api/employees/3`,
      result: `Send request on "Get one employee":
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
{
  "id": 1,
  "name": "Asha",
  "department": "IT",
  "salary": 55000
}`,
      explanation: `Requests are separated by ###. Variables are declared with @name = value and used as {{name}}. The .http file can be committed to Git so the whole team shares the same test requests.`,
    },
    {
      title: 'Binding sources: route, query, header, body and services',
      scenario: 'One action that reads data from every place in the request to clearly see where each value comes from.',
      steps: [
        'Add Controllers/BindingDemoController.cs to EmployeeApi',
        'Paste the code and press Ctrl+F5',
        'In Postman: POST https://localhost:7001/api/bindingdemo/10?includeDetails=true',
        'Headers tab: add X-Client-Id = mobile-app',
        'Body tab > raw > JSON: { "name": "Asha", "department": "IT", "salary": 55000 } > Send',
      ],
      code: `using EmployeeApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BindingDemoController : ControllerBase
{
    [HttpPost("{id:int}")]
    public IActionResult Post(
        [FromRoute] int id,
        [FromQuery] bool includeDetails,
        [FromHeader(Name = "X-Client-Id")] string? clientId,
        [FromBody] Employee employee,
        [FromServices] IConfiguration config)
    {
        return Ok(new
        {
            routeId = id,
            includeDetails,
            clientId,
            employeeName = employee.Name,
            company = config["CompanyName"]
        });
    }
}`,
      result: `Status: 200 OK
{
  "routeId": 10,
  "includeDetails": true,
  "clientId": "mobile-app",
  "employeeName": "Asha",
  "company": "Tech Solutions Pvt Ltd"
}

If the JSON body is missing -> 400 Bad Request (ProblemDetails: "A non-empty request body is required.")`,
      explanation: `With [ApiController] most attributes can be omitted (they are inferred), but writing them explicitly makes the code self-documenting. Only one parameter may come from the body because the body stream can be read only once.`,
    },
  ],
  interview: [
    { q: 'What is the purpose of launchSettings.json?', a: 'It holds local development run profiles: application URLs/ports, whether to launch the browser, launchUrl and environment variables like ASPNETCORE_ENVIRONMENT. It is not used when the app is deployed.', level: 'Easy' },
    { q: 'What is an endpoint in ASP.NET Core?', a: 'An endpoint is a unit that can handle a request: a route pattern + HTTP method metadata + a request delegate (for controllers, the action method). Endpoint routing selects it with UseRouting and executes it at the end of the pipeline.', level: 'Medium' },
    { q: 'IActionResult vs ActionResult<T>?', a: 'IActionResult can return any result but carries no type information. ActionResult<T> allows returning T directly (implicit 200) or other results, and Swagger/OpenAPI can infer the response schema from T.', level: 'Medium' },
    { q: 'Why can an action have only one [FromBody] parameter?', a: 'The request body is a forward-only stream read once by an input formatter. To receive multiple objects, wrap them in one DTO.', level: 'Medium' },
    { q: 'What does [Route("api/[controller]")] produce for OrderItemsController?', a: 'api/OrderItems - the [controller] token is replaced with the class name minus the "Controller" suffix. Routing is case-insensitive.', level: 'Easy' },
    { q: 'What happens if two actions have [HttpGet("{id}")] in the same controller?', a: 'The request matches both endpoints and ASP.NET Core throws AmbiguousMatchException (500). Use different templates or constraints.', level: 'Medium' },
    { q: 'What is CreatedAtAction/CreatedAtRoute used for?', a: 'They return 201 Created with the created object in the body and a Location header pointing to the GET endpoint of the new resource, following REST conventions.', level: 'Easy' },
    { q: 'What is the use of route constraints? Give examples.', a: 'They restrict which URL values match a parameter: {id:int}, {id:min(1)}, {code:length(5)}, {name:alpha}, {id:guid}. They are for route disambiguation, not input validation.', level: 'Medium' },
    { q: 'Where should app.UseAuthentication() be placed relative to MapControllers?', a: 'Before UseAuthorization and before MapControllers, so the user identity is set before authorization runs and before the endpoint executes.', level: 'Medium' },
    { q: 'What does [Produces("application/json")] do?', a: 'It forces the response content type to JSON and informs Swagger that the endpoint produces JSON, even if the client asks for something else in Accept.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a DepartmentsController with GET all, GET by id (int constraint) and POST returning 201 using CreatedAtAction.',
      hint: 'CreatedAtAction(nameof(GetById), new { id = d.Id }, d).',
      solution: `[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private static readonly List<Department> Items = new() { new() { Id = 1, Name = "IT" } };

    [HttpGet] public ActionResult<IEnumerable<Department>> GetAll() => Items;

    [HttpGet("{id:int}")]
    public ActionResult<Department> GetById(int id) =>
        Items.FirstOrDefault(x => x.Id == id) is { } d ? d : NotFound();

    [HttpPost]
    public ActionResult<Department> Create(Department d)
    {
        d.Id = Items.Max(x => x.Id) + 1;
        Items.Add(d);
        return CreatedAtAction(nameof(GetById), new { id = d.Id }, d);
    }
}
public class Department { public int Id { get; set; } public string Name { get; set; } = ""; }`,
    },
    {
      task: 'Add GET api/employees/salary-range?min=40000&max=60000 that filters employees by salary.',
      hint: 'Two [FromQuery] decimal parameters with default values.',
      solution: `[HttpGet("salary-range")]
public ActionResult<IEnumerable<Employee>> ByRange([FromQuery] decimal min = 0, [FromQuery] decimal max = decimal.MaxValue) =>
    Employees.Where(e => e.Salary >= min && e.Salary <= max).ToList();
// With the seed data: returns Asha (55000) and Ravi (42000)`,
    },
    {
      task: 'Write an .http file that tests POST and DELETE for the DepartmentsController.',
      hint: 'Separate requests with ### and use a @host variable.',
      solution: `@host = https://localhost:7001
### create
POST {{host}}/api/departments
Content-Type: application/json

{ "name": "Finance" }

### delete
DELETE {{host}}/api/departments/2`,
    },
    {
      task: 'Add an action GET api/employees/count that returns { "total": n } and make sure it does not conflict with GET api/employees/{id}.',
      hint: 'Because {id:int} has an int constraint, the literal "count" does not match it.',
      solution: `[HttpGet("count")]
public IActionResult Count() => Ok(new { total = Employees.Count });
// GET /api/employees/count -> 200 { "total": 3 }`,
    },
  ],
  quiz: [
    { question: 'Which file sets ASPNETCORE_ENVIRONMENT=Development for local runs?', options: ['appsettings.json', 'Program.cs', 'launchSettings.json', 'EmployeeApi.csproj'], answer: 2, explanation: 'launchSettings.json profiles define environment variables for local development.' },
    { question: 'Which return type lets you return either Employee or NotFound() and still documents Employee in Swagger?', options: ['ActionResult<Employee>', 'IActionResult', 'Employee', 'object'], answer: 0, explanation: 'ActionResult<T> combines both abilities.' },
    { question: 'GET /api/employees/abc with only [HttpGet("{id:int}")] defined returns:', options: ['400 Bad Request', '500 Internal Server Error', '200 OK with null', '404 Not Found'], answer: 3, explanation: 'The int constraint fails so no endpoint matches.' },
    { question: 'Which attribute reads a value from a request header?', options: ['[FromQuery]', '[FromHeader]', '[FromRoute]', '[FromForm]'], answer: 1, explanation: '[FromHeader(Name = "X-Client-Id")] binds a header value.' },
    { question: 'What does [HttpGet("~/api/staff")] inside EmployeesController map to?', options: ['api/employees/~/api/staff', 'api/employees/staff', 'api/staff', 'It causes a compile error'], answer: 2, explanation: 'A template starting with ~/ ignores the controller route prefix.' },
  ],
};
