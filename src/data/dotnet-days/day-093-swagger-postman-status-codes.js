export default {
  id: 'day-093-swagger-postman-status-codes',
  title: 'Swagger / OpenAPI, Postman, API Testing, HTTP Status Codes',
  module: 'ASP.NET Core Web API',
  day: 93,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Document and test the API professionally. Learn what the OpenAPI specification is, configure Swagger UI with Swashbuckle (API info, XML comments, response types, grouping) and the built-in .NET 9/10 OpenAPI generator, test every endpoint with Postman (collections, environments, variables, test scripts, Collection Runner, Newman) and with Visual Studio .http files, and master the HTTP status codes an API should return.`,
  objectives: [
    'Explain OpenAPI, Swagger UI and the generated swagger.json / openapi.json document',
    'Configure Swashbuckle with API info, XML comments and ProducesResponseType metadata',
    'Organize Postman requests in a collection with environment variables and automated tests',
    'Run a complete CRUD test flow in the Collection Runner and with Newman',
    'Choose correct 2xx, 4xx and 5xx status codes for every API scenario',
  ],
  theory: [
    {
      heading: 'OpenAPI and Swagger',
      content: `OpenAPI (formerly Swagger Specification) is a standard JSON/YAML format that describes a REST API: its paths, HTTP methods, parameters, request bodies, response schemas, status codes and security. Swagger is the family of tools around it: Swagger UI renders an interactive web page from the document, and code generators create client SDKs (TypeScript, C#) from it. In ASP.NET Core the document is generated automatically from your controllers, routes, DTOs and attributes.`,
      points: [
        'Swashbuckle.AspNetCore - AddSwaggerGen() + UseSwagger() + UseSwaggerUI() -> /swagger and /swagger/v1/swagger.json',
        '.NET 9/10 templates - Microsoft.AspNetCore.OpenApi: AddOpenApi() + MapOpenApi() -> /openapi/v1.json (no UI by default; add Swashbuckle UI or Scalar)',
        'NSwag - alternative that can also generate TypeScript clients',
        'Expose Swagger only in Development, or protect it, in production',
      ],
    },
    {
      heading: 'Improving the generated documentation',
      content: `By default Swagger knows routes and types but not your intentions. Add metadata so that front-end developers understand the API without asking you.`,
      points: [
        'XML comments (/// <summary>) + <GenerateDocumentationFile>true</GenerateDocumentationFile> in the .csproj + IncludeXmlComments',
        '[ProducesResponseType(typeof(StudentDto), 200)], [ProducesResponseType(404)] - lists every possible response',
        '[Consumes("application/json")], [Produces("application/json")]',
        'SwaggerDoc("v1", new OpenApiInfo { Title, Version, Description, Contact })',
        '[Tags("Students")] or [ApiExplorerSettings(GroupName = "v1")] to group endpoints; [ApiExplorerSettings(IgnoreApi = true)] to hide one',
      ],
    },
    {
      heading: 'Postman essentials',
      content: `Postman is a desktop/web API client. A Request has a method, URL, headers, query params and body. Requests are saved in Collections (folders of requests that can be shared or exported as JSON). Environments hold variables like {{baseUrl}} and {{studentId}} so the same collection works on localhost, test and production servers. The Tests (Post-response) tab runs JavaScript after the response arrives to assert status codes and save values into variables.`,
      syntax: `// Post-response script (Tests tab)
pm.test("Status is 201", () => pm.response.to.have.status(201));
pm.test("Has id", () => pm.expect(pm.response.json().id).to.be.a("number"));
pm.environment.set("studentId", pm.response.json().id);   // used by next requests as {{studentId}}`,
      points: [
        'Import > Link: https://localhost:7001/swagger/v1/swagger.json creates a full collection automatically',
        'Settings > General > SSL certificate verification: turn OFF for the localhost development certificate',
        'Collection Runner runs all requests in order; Newman runs a collection from the command line (CI/CD)',
      ],
    },
    {
      heading: 'HTTP status codes for APIs',
      content: `The status code is the first thing a client checks. Use the most specific code; put details in a problem details body.`,
      syntax: `2xx Success
200 OK               GET success, PUT/PATCH returning data
201 Created          POST created a resource (+ Location header)
202 Accepted         request queued for background processing
204 No Content       PUT/DELETE success with no body

3xx Redirection
301/308 Moved Permanently, 302/307 Temporary redirect, 304 Not Modified (caching with ETag)

4xx Client errors
400 Bad Request          invalid input / validation failed
401 Unauthorized         not authenticated (missing/invalid token)
403 Forbidden            authenticated but not allowed (wrong role)
404 Not Found            resource or route does not exist
405 Method Not Allowed   e.g. DELETE on a route that only supports GET
409 Conflict             duplicate email, concurrency conflict, FK in use
415 Unsupported Media Type   wrong Content-Type
422 Unprocessable Entity well-formed but semantically invalid (some teams use it for business rules)
429 Too Many Requests    rate limit exceeded

5xx Server errors
500 Internal Server Error  unhandled exception (a bug)
502 Bad Gateway / 503 Service Unavailable / 504 Gateway Timeout`,
      tip: 'A simple rule: 4xx = the client must change the request; 5xx = the server must fix something. Your API should almost never return 500 on purpose.',
    },
    {
      heading: 'Ways to test an API',
      content: `Manual testing: Swagger UI "Try it out", Postman, Visual Studio .http files (Endpoints Explorer: View > Other Windows > Endpoints Explorer), curl. Automated testing: Postman test scripts + Newman in CI, unit tests for services (Day 114), integration tests with WebApplicationFactory (Day 115). A good API test checks status code, response body, headers (Location, Content-Type) and response time, and covers the unhappy paths (400, 404, 409) as well as the happy path.`,
    },
  ],
  examples: [
    {
      title: 'Swagger with API info, XML comments and response types',
      scenario: 'Produce rich documentation for the Student API so the React team can use it without asking questions.',
      steps: [
        'Open StudentApi; right-click the project > Edit Project File',
        'Add <GenerateDocumentationFile>true</GenerateDocumentationFile> and <NoWarn>$(NoWarn);1591</NoWarn> inside <PropertyGroup>',
        'Package Manager Console: Install-Package Swashbuckle.AspNetCore',
        'Replace Program.cs and add XML comments to StudentsController',
        'Press Ctrl+F5 and open https://localhost:7001/swagger',
        'Click the /swagger/v1/swagger.json link at the top to see the raw OpenAPI document',
      ],
      code: `<!-- StudentApi.csproj -->
<PropertyGroup>
  <TargetFramework>net10.0</TargetFramework>
  <Nullable>enable</Nullable>
  <ImplicitUsings>enable</ImplicitUsings>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>

// Program.cs
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;      // Swashbuckle 6.x-9.x (Swashbuckle 10 uses namespace Microsoft.OpenApi)
using StudentApi.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Student API",
        Version = "v1",
        Description = "CRUD API for the Student Management System (.NET Full Stack course)",
        Contact = new OpenApiContact { Name = "Course Team", Email = "team@example.com" }
    });
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFile));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();                                  // /swagger/v1/swagger.json
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Student API v1");
        c.DocumentTitle = "Student API Docs";
        c.DisplayRequestDuration();
    });
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();

// Controllers/StudentsController.cs (documented actions)
/// <summary>Manage students.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class StudentsController : ControllerBase
{
    // ... constructor as before

    /// <summary>Gets one student by id.</summary>
    /// <param name="id">Student id (1 or more).</param>
    /// <response code="200">The student was found.</response>
    /// <response code="404">No student with this id.</response>
    [HttpGet("{id:int:min(1)}")]
    [ProducesResponseType(typeof(Student), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Student>> GetById(int id) { /* ... */ }

    /// <summary>Creates a new student.</summary>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/students
    ///     { "name": "Meena", "email": "meena@mail.com", "course": "SQL", "marks": 92 }
    /// </remarks>
    /// <response code="201">Student created; Location header points to it.</response>
    /// <response code="400">Validation failed.</response>
    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType(typeof(Student), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Student>> Create(CreateStudentDto dto) { /* ... */ }
}`,
      result: `Swagger UI shows:
  Student API v1  - "CRUD API for the Student Management System (.NET Full Stack course)"
  Students
    GET    /api/students
    POST   /api/students        Creates a new student.   (Sample request shown in the description)
    GET    /api/students/{id}   Gets one student by id.
    PUT, PATCH, DELETE /api/students/{id}
  Each operation lists its responses: 200 / 201 / 400 / 404 with schemas
  Schemas section: Student, CreateStudentDto, ProblemDetails, ValidationProblemDetails

/swagger/v1/swagger.json (excerpt):
{
  "openapi": "3.0.1",
  "info": { "title": "Student API", "description": "CRUD API for the Student Management System (.NET Full Stack course)", "version": "v1" },
  "paths": {
    "/api/Students/{id}": {
      "get": {
        "tags": [ "Students" ],
        "summary": "Gets one student by id.",
        "parameters": [ { "name": "id", "in": "path", "required": true, "schema": { "type": "integer", "format": "int32" } } ],
        "responses": { "200": { "description": "The student was found." }, "404": { "description": "No student with this id." } }
      }
    }
  }
}`,
      explanation: `GenerateDocumentationFile writes StudentApi.xml next to the DLL; IncludeXmlComments feeds it to Swashbuckle. Warning 1591 ("missing XML comment") is suppressed so you are not forced to document every public member. The four-space indentation inside <remarks> renders as a code block in Swagger UI. Newer Swashbuckle versions may print "openapi": "3.0.4" or 3.1 - the structure is the same.`,
    },
    {
      title: 'Built-in OpenAPI in .NET 9/10 with Swagger UI',
      scenario: 'A new .NET 10 Web API template has no Swagger UI. Add a UI on top of the built-in document generator.',
      steps: [
        'File > New > Project > ASP.NET Core Web API > .NET 10 (the template already references Microsoft.AspNetCore.OpenApi)',
        'Install-Package Swashbuckle.AspNetCore.SwaggerUI   (UI only)',
        'Replace the OpenAPI lines in Program.cs with the code',
        'Ctrl+F5 > browse to https://localhost:7001/openapi/v1.json and https://localhost:7001/swagger',
      ],
      code: `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();            // Microsoft.AspNetCore.OpenApi

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                      // serves /openapi/v1.json
    app.UseSwaggerUI(o => o.SwaggerEndpoint("/openapi/v1.json", "Student API v1"));
}

app.UseHttpsRedirection();
app.MapControllers();
app.Run();

// Optional modern UI instead of Swagger UI:
// Install-Package Scalar.AspNetCore
// app.MapScalarApiReference();          // https://localhost:7001/scalar/v1`,
      result: `GET /openapi/v1.json -> 200 OK, application/json
{ "openapi": "3.1.1", "info": { "title": "StudentApi | v1", "version": "1.0.0" }, "paths": { "/api/Students": { ... } } }

https://localhost:7001/swagger -> Swagger UI rendering the same document`,
      explanation: `Since .NET 9 Microsoft generates the OpenAPI document itself; Swagger UI is just a viewer, so you can point it at /openapi/v1.json. .NET 10 produces OpenAPI 3.1 by default. Both approaches use the same metadata (ProducesResponseType, XML comments in .NET 10, route constraints).`,
    },
    {
      title: 'Status codes demo controller',
      scenario: 'See every common status code and its body in Swagger and Postman.',
      steps: [
        'Right-click Controllers > Add > Controller > API Controller - Empty > StatusDemoController.cs',
        'Paste the code and press Ctrl+F5',
        'In Swagger, execute each endpoint and look at the "Code" column and "Response headers"',
      ],
      code: `using Microsoft.AspNetCore.Mvc;

namespace StudentApi.Controllers;

[ApiController]
[Route("api/status")]
public class StatusDemoController : ControllerBase
{
    [HttpGet("200")] public IActionResult Get200() => Ok(new { message = "OK" });
    [HttpPost("201")] public IActionResult Post201() => Created("/api/students/99", new { id = 99 });
    [HttpPost("202")] public IActionResult Post202() => Accepted(new { jobId = "job-1" });
    [HttpDelete("204")] public IActionResult Delete204() => NoContent();

    [HttpGet("400")]
    public IActionResult Get400()
    {
        ModelState.AddModelError("marks", "Marks must be 0-100");
        return ValidationProblem(ModelState);
    }
    [HttpGet("401")] public IActionResult Get401() => Unauthorized();
    [HttpGet("403")] public IActionResult Get403() => StatusCode(StatusCodes.Status403Forbidden);
    [HttpGet("404")] public IActionResult Get404() => NotFound();
    [HttpGet("409")] public IActionResult Get409() => Conflict(new { message = "Email already registered" });
    [HttpGet("422")] public IActionResult Get422() => UnprocessableEntity(new { message = "Cannot enroll: batch is full" });
    [HttpGet("429")] public IActionResult Get429() => StatusCode(429, new { message = "Too many requests, retry later" });
    [HttpGet("500")] public IActionResult Get500() => Problem("Something went wrong", statusCode: 500);
    [HttpGet("crash")] public IActionResult Crash() => throw new InvalidOperationException("Unhandled bug");
}`,
      result: `GET  /api/status/200   -> 200 { "message": "OK" }
POST /api/status/201   -> 201, Location: /api/students/99, { "id": 99 }
POST /api/status/202   -> 202 { "jobId": "job-1" }
DELETE /api/status/204 -> 204 (no body)
GET  /api/status/400   -> 400 { "title": "One or more validation errors occurred.", "status": 400, "errors": { "marks": [ "Marks must be 0-100" ] } }
GET  /api/status/401   -> 401 { "type": "https://tools.ietf.org/html/rfc9110#section-15.5.2", "title": "Unauthorized", "status": 401 }
GET  /api/status/403   -> 403 { "type": "https://tools.ietf.org/html/rfc9110#section-15.5.4", "title": "Forbidden", "status": 403 }
GET  /api/status/404   -> 404 { "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5", "title": "Not Found", "status": 404 }
GET  /api/status/409   -> 409 { "message": "Email already registered" }
GET  /api/status/422   -> 422 { "message": "Cannot enroll: batch is full" }
GET  /api/status/429   -> 429 { "message": "Too many requests, retry later" }
GET  /api/status/500   -> 500 { "title": "An error occurred while processing your request.", "status": 500, "detail": "Something went wrong" }
GET  /api/status/crash -> 500 (Development: developer exception page with stack trace; Production: empty body unless global handling is configured - Day 96)
DELETE /api/status/200 -> 405 Method Not Allowed`,
      explanation: `With [ApiController], helpers that return a status code without a body (Unauthorized(), NotFound(), StatusCode(403)) are converted to ProblemDetails automatically ("client error mapping"). Helpers that receive an object (Conflict(new {...})) return your object as-is. 405 is produced by routing: the URL exists but not for that HTTP method.`,
    },
    {
      title: 'Postman collection with environment, variables and tests',
      scenario: 'Test the full CRUD flow automatically: create a student, read it, update it, patch it, delete it and confirm it is gone.',
      steps: [
        'Open Postman > Settings (gear) > General > turn OFF "SSL certificate verification" (localhost dev certificate)',
        'Environments > + > name "StudentApi Local" > add variable baseUrl = https://localhost:7001 > Save; select it in the top-right dropdown',
        'Collections > + > name "Student API"; add the 6 requests below (or Import > Raw text > paste the collection JSON)',
        'For each request open the Scripts > Post-response tab (older Postman: Tests tab) and paste its test script',
        'Click the collection > Run > Run Student API (Collection Runner)',
        'Optional CLI: File > Export collection and environment, then run Newman',
      ],
      code: `{
  "info": { "name": "Student API", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "item": [
    {
      "name": "1 Create student",
      "request": {
        "method": "POST",
        "header": [ { "key": "Content-Type", "value": "application/json" } ],
        "url": "{{baseUrl}}/api/students",
        "body": { "mode": "raw", "raw": "{ \\"name\\": \\"Test User\\", \\"email\\": \\"test{{$timestamp}}@mail.com\\", \\"course\\": \\".NET\\", \\"marks\\": 70 }" }
      },
      "event": [ { "listen": "test", "script": { "exec": [
        "pm.test('201 Created', () => pm.response.to.have.status(201));",
        "pm.test('Location header', () => pm.response.to.have.header('Location'));",
        "pm.environment.set('studentId', pm.response.json().id);"
      ] } } ]
    },
    {
      "name": "2 Get student",
      "request": { "method": "GET", "url": "{{baseUrl}}/api/students/{{studentId}}" },
      "event": [ { "listen": "test", "script": { "exec": [
        "pm.test('200 OK', () => pm.response.to.have.status(200));",
        "pm.test('Correct name', () => pm.expect(pm.response.json().name).to.eql('Test User'));",
        "pm.test('Fast', () => pm.expect(pm.response.responseTime).to.be.below(1000));"
      ] } } ]
    },
    {
      "name": "3 Update student (PUT)",
      "request": {
        "method": "PUT",
        "header": [ { "key": "Content-Type", "value": "application/json" } ],
        "url": "{{baseUrl}}/api/students/{{studentId}}",
        "body": { "mode": "raw", "raw": "{ \\"name\\": \\"Test User 2\\", \\"email\\": \\"updated{{$timestamp}}@mail.com\\", \\"course\\": \\"React\\", \\"marks\\": 80 }" }
      },
      "event": [ { "listen": "test", "script": { "exec": [ "pm.test('204', () => pm.response.to.have.status(204));" ] } } ]
    },
    {
      "name": "4 Patch marks",
      "request": {
        "method": "PATCH",
        "header": [ { "key": "Content-Type", "value": "application/json" } ],
        "url": "{{baseUrl}}/api/students/{{studentId}}/partial",
        "body": { "mode": "raw", "raw": "{ \\"marks\\": 95 }" }
      },
      "event": [ { "listen": "test", "script": { "exec": [
        "pm.test('200', () => pm.response.to.have.status(200));",
        "pm.test('marks 95', () => pm.expect(pm.response.json().marks).to.eql(95));"
      ] } } ]
    },
    {
      "name": "5 Delete student",
      "request": { "method": "DELETE", "url": "{{baseUrl}}/api/students/{{studentId}}" },
      "event": [ { "listen": "test", "script": { "exec": [ "pm.test('204', () => pm.response.to.have.status(204));" ] } } ]
    },
    {
      "name": "6 Get deleted student",
      "request": { "method": "GET", "url": "{{baseUrl}}/api/students/{{studentId}}" },
      "event": [ { "listen": "test", "script": { "exec": [ "pm.test('404', () => pm.response.to.have.status(404));" ] } } ]
    }
  ]
}

# Newman (command line)
npm install -g newman
newman run StudentApi.postman_collection.json -e StudentApiLocal.postman_environment.json --insecure`,
      result: `Collection Runner - Student API (6 requests, 10 tests)
1 Create student         POST   201  PASS 201 Created | PASS Location header
2 Get student            GET    200  PASS 200 OK | PASS Correct name | PASS Fast
3 Update student (PUT)   PUT    204  PASS 204
4 Patch marks            PATCH  200  PASS 200 | PASS marks 95
5 Delete student         DELETE 204  PASS 204
6 Get deleted student    GET    404  PASS 404
Passed: 10   Failed: 0

Newman summary:
+-------------------------+-----------+----------+
|                         |  executed |   failed |
+-------------------------+-----------+----------+
|              iterations |         1 |        0 |
|                requests |         6 |        0 |
|            test-scripts |         6 |        0 |
|              assertions |        10 |        0 |
+-------------------------+-----------+----------+`,
      explanation: `The first request saves the new id into the environment variable studentId, and every following request uses {{studentId}} - this chaining makes the collection repeatable. {{$timestamp}} is a Postman dynamic variable that makes the email unique on every run, so the 409 duplicate rule does not break the test. --insecure tells Newman to accept the development HTTPS certificate. Response times vary by machine.`,
    },
    {
      title: 'Visual Studio .http file',
      scenario: 'Test the API without leaving Visual Studio.',
      steps: [
        'Open StudentApi.http in Solution Explorer (created by the template) or Add > New Item > HTTP File',
        'Paste the requests below',
        'Run the API (Ctrl+F5), then click "Send request" above each request',
        'View > Other Windows > Endpoints Explorer lists all endpoints; right-click one > Generate Request',
      ],
      code: `@baseUrl = https://localhost:7001

### Get all students
GET {{baseUrl}}/api/students
Accept: application/json

### Create a student
# @name create
POST {{baseUrl}}/api/students
Content-Type: application/json

{
  "name": "Http File User",
  "email": "httpfile@mail.com",
  "course": "SQL",
  "marks": 77
}

### Read the created student (uses the response of the named request)
GET {{baseUrl}}/api/students/{{create.response.body.$.id}}

### Invalid input -> 400
POST {{baseUrl}}/api/students
Content-Type: application/json

{ "name": "", "email": "bad", "course": "Go", "marks": 300 }`,
      result: `Response pane for "Create a student":
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: https://localhost:7001/api/students/5

{ "id": 5, "name": "Http File User", "email": "httpfile@mail.com", "course": "SQL", "marks": 77, "createdAt": "..." }

"Read the created student" -> 200 with the same object
"Invalid input" -> 400 ValidationProblemDetails with errors for Name, Email, Course, Marks`,
      explanation: `.http files are plain text, live in the repository and are reviewed with the code. "# @name create" names a request so later requests can read its response with {{create.response.body.$.id}} (a JSONPath expression). The actual id depends on how many rows your table already has.`,
    },
  ],
  interview: [
    { q: 'What is the difference between OpenAPI and Swagger?', a: 'OpenAPI is the specification (the document format). Swagger refers to the tools around it - Swagger UI, Swagger Editor, Codegen. Swashbuckle is a .NET library that generates the OpenAPI document and hosts Swagger UI.', level: 'Easy' },
    { q: 'How do you add XML comments to Swagger?', a: 'Enable <GenerateDocumentationFile>true</GenerateDocumentationFile> in the csproj, write /// summary/param/response comments, and call c.IncludeXmlComments(path) in AddSwaggerGen.', level: 'Medium' },
    { q: 'What is the purpose of [ProducesResponseType]?', a: 'It documents which status codes and response types an action can return so Swagger shows them and client generators produce correct types. It does not change runtime behaviour.', level: 'Medium' },
    { q: 'Difference between 401 and 403?', a: '401 Unauthorized means the request is not authenticated (no or invalid credentials/token). 403 Forbidden means the user is authenticated but lacks permission for the resource.', level: 'Easy' },
    { q: 'When do you use 409 Conflict?', a: 'When the request conflicts with the current state of the resource: duplicate unique value, optimistic concurrency failure, deleting an entity that is still referenced.', level: 'Medium' },
    { q: 'What is a Postman environment?', a: 'A named set of variables (baseUrl, token, ids) that requests reference with {{name}}. Switching environment runs the same collection against a different server.', level: 'Easy' },
    { q: 'How do you chain Postman requests?', a: 'In the post-response script of one request save a value with pm.environment.set("studentId", pm.response.json().id); later requests use {{studentId}} in URL or body.', level: 'Medium' },
    { q: 'Should Swagger be enabled in production?', a: 'Usually not publicly - it reveals the API surface. Enable it only in Development, or protect it with authentication / internal network if needed.', level: 'Medium' },
    { q: 'What does .NET 9 change about Swagger in templates?', a: 'Templates no longer include Swashbuckle. They use Microsoft.AspNetCore.OpenApi (AddOpenApi/MapOpenApi) to produce /openapi/v1.json; a UI such as Swagger UI or Scalar must be added separately.', level: 'Hard' },
    { q: 'What is the difference between 400 and 422?', a: '400 means the request is malformed or fails input validation. 422 means the syntax is fine but the server cannot process the instructions (semantic/business error). ASP.NET Core uses 400 for validation by default.', level: 'Hard' },
    { q: 'Output question: an action has [HttpGet("{id:int}")] only. A client sends DELETE /api/students/5. What status code?', a: '405 Method Not Allowed - the route matches the URL, but no endpoint for DELETE exists there.', level: 'Medium' },
    { q: 'What does client error mapping in [ApiController] do?', a: 'When an action returns a status code >= 400 without a body (e.g. NotFound()), ASP.NET Core wraps it in a ProblemDetails JSON body with type, title, status and traceId.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Import your running API into Postman directly from Swagger and run the generated collection.',
      hint: 'Postman > Import > Link > paste the swagger.json URL.',
      solution: `1. Ctrl+F5 to run the API.
2. Postman > Import > Link: https://localhost:7001/swagger/v1/swagger.json > Continue > Import.
3. A collection "Student API" is created with folders per tag and example bodies.
4. Set the collection variable baseUrl to https://localhost:7001 and send the requests.`,
    },
    {
      task: 'Add Postman tests to "Create student" that check: status 201, Content-Type contains application/json, response has name equal to the sent name.',
      hint: 'pm.request.body.raw contains the sent JSON string.',
      solution: `pm.test("201", () => pm.response.to.have.status(201));
pm.test("JSON", () => pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json"));
const sent = JSON.parse(pm.request.body.raw);
pm.test("Same name", () => pm.expect(pm.response.json().name).to.eql(sent.name));`,
    },
    {
      task: 'Write a negative-test folder in Postman: invalid body (400), unknown id (404), duplicate email (409), wrong Content-Type (415).',
      hint: 'One request per case; assert only the status code and one field of the body.',
      solution: `400: POST {{baseUrl}}/api/students  { "name": "", "email": "x", "course": ".NET", "marks": 500 }
    pm.test("400", () => pm.response.to.have.status(400)); pm.expect(pm.response.json().errors).to.have.property("Name");
404: GET {{baseUrl}}/api/students/999999 -> pm.response.to.have.status(404)
409: POST the same valid body twice; second -> 409 (or 400 with Email error if using ValidationProblem)
415: POST with Body > raw > Text -> pm.response.to.have.status(415)`,
    },
    {
      task: 'Hide the StatusDemoController from Swagger and group the Students endpoints under the tag "Student Management".',
      hint: '[ApiExplorerSettings(IgnoreApi = true)] and [Tags(...)].',
      solution: `[ApiExplorerSettings(IgnoreApi = true)]
public class StatusDemoController : ControllerBase { ... }

[Tags("Student Management")]
public class StudentsController : ControllerBase { ... }`,
    },
  ],
  quiz: [
    { question: 'Which status code means "authenticated but not allowed"?', options: ['401', '403', '404', '400'], answer: 1, explanation: '403 Forbidden is for authenticated users without permission.' },
    { question: 'Which method serves the OpenAPI document with the built-in .NET 9/10 generator?', options: ['app.UseSwaggerUI()', 'app.MapControllers()', 'app.MapOpenApi()', 'app.UseOpenApi()'], answer: 2, explanation: 'AddOpenApi + MapOpenApi produce /openapi/v1.json.' },
    { question: 'In Postman, {{baseUrl}} is:', options: ['A variable from the environment or collection', 'A JavaScript template literal', 'An HTTP header', 'A route constraint'], answer: 0, explanation: 'Double braces reference Postman variables.' },
    { question: 'A POST that creates a resource should return:', options: ['200 with no body', '204', '202 always', '201 with a Location header'], answer: 3, explanation: '201 Created plus Location is the REST convention.' },
    { question: 'Which csproj setting is required for XML comments in Swagger?', options: ['<EnableSwagger>', '<GenerateDocumentationFile>true</GenerateDocumentationFile>', '<XmlDocs>on</XmlDocs>', '<OpenApi>true</OpenApi>'], answer: 1, explanation: 'It makes the compiler produce the XML documentation file.' },
  ],
};
