export default {
  id: 'day-086-rest-api-introduction',
  title: 'Introduction to REST API, REST Architecture, Web API vs MVC',
  module: 'ASP.NET Core Web API',
  day: 86,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Understand what a Web API is, how REST architecture works (resources, URIs, HTTP verbs, JSON, status codes, statelessness), how ASP.NET Core Web API differs from MVC, and create your first Web API project in Visual Studio with Swagger.`,
  objectives: [
    'Explain what an API and a REST API are using real-world analogies',
    'List the six REST constraints and map CRUD actions to HTTP verbs and URIs',
    'Compare ASP.NET Core Web API with ASP.NET Core MVC (JSON vs HTML views)',
    'Create, run and test a first ASP.NET Core Web API project with Swagger UI',
    'Understand what the [ApiController] attribute and ControllerBase give you',
  ],
  theory: [
    {
      heading: 'What is an API and a Web API?',
      content: `API means Application Programming Interface. It is a contract that lets one program talk to another program. Think of a restaurant: you (the client) do not walk into the kitchen (the database). You give your order to the waiter (the API), the waiter talks to the kitchen and brings the food (the data) back to you.

A Web API is an API that is called over HTTP. A React app, an Android app, an Angular app, Postman, or even another server can send an HTTP request such as GET https://localhost:7001/api/students and receive data (usually JSON) back. The same API can serve many different front ends at the same time.`,
      points: [
        'Client: browser, React/Angular SPA, mobile app, Postman, another service',
        'Server: ASP.NET Core Web API running on Kestrel (or IIS in front of Kestrel)',
        'Data format: JSON (default in ASP.NET Core), sometimes XML',
        'Transport: HTTP/HTTPS with verbs GET, POST, PUT, PATCH, DELETE',
      ],
    },
    {
      heading: 'REST Architecture and its Constraints',
      content: `REST (REpresentational State Transfer) is an architectural style described by Roy Fielding in 2000. An API that follows REST rules is called RESTful. REST is not a library or protocol; it is a set of guidelines (constraints).`,
      points: [
        'Client-Server: the UI (client) and the data/storage (server) are separate and evolve independently',
        'Stateless: every request carries all information needed (for example the JWT token). The server does not remember previous requests in session',
        'Cacheable: responses say whether they can be cached (Cache-Control header), which improves performance',
        'Uniform Interface: resources are identified by URIs, manipulated with standard HTTP verbs, and returned as representations (JSON)',
        'Layered System: the client does not know if it talks to the real server, a load balancer, a gateway or a cache',
        'Code on Demand (optional): server can send executable code (for example JavaScript) to the client',
      ],
      tip: 'In interviews, "Stateless" and "Uniform Interface" are the two constraints asked most often.',
    },
    {
      heading: 'Resources, URIs, HTTP Verbs and Status Codes',
      content: `In REST everything is a resource: a student, a product, an order. A resource is identified by a URI, and nouns (plural) are used, not verbs. The HTTP verb says what to do with the resource.`,
      syntax: `GET    /api/students        -> get all students        -> 200 OK
GET    /api/students/5      -> get student with id 5   -> 200 OK or 404 Not Found
POST   /api/students        -> create a new student    -> 201 Created (+ Location header)
PUT    /api/students/5      -> replace student 5       -> 204 No Content or 200 OK
PATCH  /api/students/5      -> update some fields      -> 204 No Content or 200 OK
DELETE /api/students/5      -> delete student 5        -> 204 No Content

Bad (not RESTful):  /api/getAllStudents   /api/deleteStudent?id=5`,
      points: [
        '2xx success: 200 OK, 201 Created, 204 No Content',
        '4xx client error: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict',
        '5xx server error: 500 Internal Server Error, 503 Service Unavailable',
        'GET, PUT, DELETE are idempotent (repeating gives the same result); POST is not',
        'GET is safe (it never changes data)',
      ],
    },
    {
      heading: 'ASP.NET Core Web API vs ASP.NET Core MVC',
      content: `Both use the same ASP.NET Core pipeline, routing, controllers, model binding, filters and dependency injection. The difference is WHAT they return and WHO consumes them.`,
      points: [
        'MVC controller inherits Controller and returns View() -> HTML rendered by Razor for a browser',
        'API controller inherits ControllerBase (no view support) and returns data -> JSON for any client',
        'MVC uses builder.Services.AddControllersWithViews(); Web API uses builder.Services.AddControllers()',
        'MVC usually uses conventional routing {controller}/{action}/{id?}; Web API uses attribute routing [Route("api/[controller]")]',
        'Web API controllers use [ApiController] for automatic 400 validation responses and smart binding',
        'MVC keeps login in cookies; Web APIs are usually stateless and use JWT bearer tokens',
      ],
    },
    {
      heading: 'The [ApiController] attribute and ControllerBase',
      content: `When you put [ApiController] on a controller class, ASP.NET Core switches on several API-friendly behaviours automatically.`,
      points: [
        'Attribute routing is required ([Route] on controller or action)',
        'Automatic HTTP 400: if ModelState is invalid, a ValidationProblemDetails JSON is returned before your action runs',
        'Binding source inference: complex types come from [FromBody], simple types from route/query',
        'Problem details for error status codes (RFC 7807 / RFC 9457 JSON format)',
        'ControllerBase gives helpers: Ok(), Created(), CreatedAtAction(), NoContent(), BadRequest(), NotFound(), Unauthorized(), Forbid(), Problem()',
      ],
    },
    {
      heading: 'Creating the first Web API project',
      content: `Visual Studio: File > New > Project > search "ASP.NET Core Web API" > Next > Project name FirstApi > Next > Framework .NET 10 (LTS) or .NET 8 (LTS) > Authentication type None > tick "Configure for HTTPS", tick "Enable OpenAPI support", tick "Use controllers" > Create.

dotnet CLI: dotnet new webapi -n FirstApi --use-controllers then cd FirstApi and dotnet run.

Note on Swagger: .NET 9 and .NET 10 templates use the built-in Microsoft.AspNetCore.OpenApi package (AddOpenApi / MapOpenApi) which produces the OpenAPI JSON document but no UI. In this course we add Swashbuckle.AspNetCore to get the familiar Swagger UI page, which also works on .NET 8.`,
      syntax: `dotnet new webapi -n FirstApi --use-controllers
cd FirstApi
dotnet add package Swashbuckle.AspNetCore
dotnet run   # or press F5 / Ctrl+F5 in Visual Studio`,
      tip: 'Press Ctrl+F5 to run without debugging; the browser opens https://localhost:<port>/swagger if launchUrl is set to "swagger" in Properties/launchSettings.json.',
    },
  ],
  examples: [
    {
      title: 'Create your first Web API (HelloController)',
      scenario: 'Create a FirstApi project and add a controller that returns a JSON greeting and the server time in UTC.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API > Next',
        'Name it FirstApi, choose .NET 10 (or .NET 8), tick "Use controllers" and "Enable OpenAPI support", click Create',
        'Tools > NuGet Package Manager > Package Manager Console: Install-Package Swashbuckle.AspNetCore',
        'Replace Program.cs with the code below',
        'Right-click Controllers folder > Add > Controller > API Controller - Empty > name HelloController.cs and paste the code',
        'In Properties/launchSettings.json set "launchUrl": "swagger" for the https profile',
        'Press Ctrl+F5, expand GET /api/hello in Swagger UI, click "Try it out" then "Execute"',
      ],
      code: `// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();            // Web API controllers (no views)
builder.Services.AddEndpointsApiExplorer();   // discovers endpoints for Swagger
builder.Services.AddSwaggerGen();             // Swashbuckle generator

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();      // /swagger/v1/swagger.json
    app.UseSwaggerUI();    // /swagger
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();      // maps attribute-routed controllers
app.Run();

// Controllers/HelloController.cs
using Microsoft.AspNetCore.Mvc;

namespace FirstApi.Controllers;

[ApiController]
[Route("api/[controller]")]          // -> api/hello
public class HelloController : ControllerBase
{
    // GET api/hello
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            message = "Hello from my first ASP.NET Core Web API",
            serverTimeUtc = DateTime.UtcNow
        });
    }

    // GET api/hello/Asha
    [HttpGet("{name}")]
    public IActionResult Greet(string name)
    {
        return Ok(new { message = $"Welcome {name}!" });
    }
}`,
      result: `Swagger UI -> GET /api/hello -> Execute
Status: 200 OK
Response body:
{
  "message": "Hello from my first ASP.NET Core Web API",
  "serverTimeUtc": "2026-11-17T09:15:42.1234567Z"   (time will differ)
}

GET /api/hello/Asha -> 200 OK
{
  "message": "Welcome Asha!"
}`,
      explanation: `AddControllers registers controller services, MapControllers maps routes defined by attributes. [Route("api/[controller]")] uses the class name without the "Controller" suffix. Ok(object) serialises the anonymous object to JSON with camelCase property names (message, serverTimeUtc) using System.Text.Json.`,
    },
    {
      title: 'A RESTful StudentsController with in-memory data',
      scenario: 'Expose a list of students as a REST resource: GET all and GET by id with proper 200/404 status codes.',
      steps: [
        'In the FirstApi project right-click the project > Add > New Folder > Models',
        'Add Models/Student.cs with the Student class',
        'Add Controllers/StudentsController.cs (API Controller - Empty) and paste the code',
        'Press Ctrl+F5 and open Swagger',
        'Execute GET /api/students, then GET /api/students/2, then GET /api/students/99',
        'Postman: New > HTTP Request > GET https://localhost:7001/api/students > Send (use your own port from launchSettings.json)',
      ],
      code: `// Models/Student.cs
namespace FirstApi.Models;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public int Marks { get; set; }
}

// Controllers/StudentsController.cs
using FirstApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace FirstApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private static readonly List<Student> Students = new()
    {
        new Student { Id = 1, Name = "Asha",  Course = ".NET",  Marks = 88 },
        new Student { Id = 2, Name = "Ravi",  Course = "React", Marks = 76 },
        new Student { Id = 3, Name = "Meena", Course = "SQL",   Marks = 92 }
    };

    // GET api/students
    [HttpGet]
    public ActionResult<IEnumerable<Student>> GetAll() => Ok(Students);

    // GET api/students/2
    [HttpGet("{id:int}")]
    public ActionResult<Student> GetById(int id)
    {
        var student = Students.FirstOrDefault(s => s.Id == id);
        if (student is null)
            return NotFound(new { message = $"Student with id {id} not found" });

        return Ok(student);
    }
}`,
      result: `GET /api/students -> 200 OK
[
  { "id": 1, "name": "Asha",  "course": ".NET",  "marks": 88 },
  { "id": 2, "name": "Ravi",  "course": "React", "marks": 76 },
  { "id": 3, "name": "Meena", "course": "SQL",   "marks": 92 }
]

GET /api/students/2 -> 200 OK
{ "id": 2, "name": "Ravi", "course": "React", "marks": 76 }

GET /api/students/99 -> 404 Not Found
{ "message": "Student with id 99 not found" }`,
      explanation: `The URI identifies the resource (/api/students/2), the verb (GET) says what to do, and the status code tells the client what happened. ActionResult<T> lets an action return either data (T, 200) or another result like NotFound. The route constraint {id:int} means /api/students/abc will not match this action (404).`,
    },
    {
      title: 'Same data from MVC and from Web API (side by side)',
      scenario: 'See the difference: an MVC controller returns an HTML view, an API controller returns JSON for the same products.',
      steps: [
        'Create an ASP.NET Core Web App (Model-View-Controller) project named ShopMvc (File > New > Project)',
        'Add the ProductsController (MVC) and Views/Products/Index.cshtml shown in the first part',
        'In the same project add Controllers/Api/ProductsApiController.cs shown in the second part',
        'In Program.cs keep AddControllersWithViews() - it also supports API controllers',
        'Press Ctrl+F5 and browse /Products (HTML page) and /api/products (JSON)',
      ],
      code: `// ---------- MVC: returns HTML ----------
public class ProductsController : Controller          // Controller = view support
{
    public IActionResult Index()
    {
        var products = new List<string> { "Laptop", "Mouse", "Keyboard" };
        return View(products);                          // Views/Products/Index.cshtml
    }
}

@* Views/Products/Index.cshtml *@
@model List<string>
<h2>Products</h2>
<ul>
@foreach (var p in Model) { <li>@p</li> }
</ul>

// ---------- Web API: returns JSON ----------
[ApiController]
[Route("api/products")]
public class ProductsApiController : ControllerBase     // ControllerBase = no views
{
    [HttpGet]
    public IActionResult Get()
    {
        var products = new List<string> { "Laptop", "Mouse", "Keyboard" };
        return Ok(products);
    }
}`,
      result: `/Products  -> 200 OK, Content-Type: text/html
  Products
  - Laptop
  - Mouse
  - Keyboard

/api/products -> 200 OK, Content-Type: application/json; charset=utf-8
["Laptop","Mouse","Keyboard"]`,
      explanation: `The data is identical; only the representation differs. MVC renders HTML on the server for humans in a browser. Web API returns raw JSON so that React, mobile apps or other services can render it however they want.`,
    },
    {
      title: 'Console: what a JSON representation looks like (System.Text.Json)',
      scenario: 'A REST API sends a representation of a resource. Serialize a Student object to JSON exactly like ASP.NET Core does (camelCase web defaults) and read it back.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it JsonRepresentationDemo, framework .NET 10 or .NET 8',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System.Text.Json;

var options = new JsonSerializerOptions(JsonSerializerDefaults.Web); // camelCase like ASP.NET Core

var student = new Student { Id = 1, Name = "Asha", Marks = 88 };

string json = JsonSerializer.Serialize(student, options);
Console.WriteLine("Response body sent by API:");
Console.WriteLine(json);

string requestBody = "{\\"id\\":2,\\"name\\":\\"Ravi\\",\\"marks\\":76}";
Student? fromClient = JsonSerializer.Deserialize<Student>(requestBody, options);
Console.WriteLine("Request body received by API:");
Console.WriteLine($"Id={fromClient!.Id}, Name={fromClient.Name}, Marks={fromClient.Marks}");

class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}`,
      csharp: {
        files: {
          'Program.cs': `using System.Text.Json;

var options = new JsonSerializerOptions(JsonSerializerDefaults.Web); // camelCase like ASP.NET Core

var student = new Student { Id = 1, Name = "Asha", Marks = 88 };

string json = JsonSerializer.Serialize(student, options);
Console.WriteLine("Response body sent by API:");
Console.WriteLine(json);

string requestBody = "{\\"id\\":2,\\"name\\":\\"Ravi\\",\\"marks\\":76}";
Student? fromClient = JsonSerializer.Deserialize<Student>(requestBody, options);
Console.WriteLine("Request body received by API:");
Console.WriteLine($"Id={fromClient!.Id}, Name={fromClient.Name}, Marks={fromClient.Marks}");

class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}`,
        },
        stdin: '',
      },
      result: `Response body sent by API:
{"id":1,"name":"Asha","marks":88}
Request body received by API:
Id=2, Name=Ravi, Marks=76`,
      explanation: `JsonSerializerDefaults.Web turns on camelCase naming and case-insensitive reading - the same defaults ASP.NET Core uses. Serialization happens when your action returns Ok(student); deserialization happens when a POST body is bound to a [FromBody] parameter.`,
    },
  ],
  interview: [
    { q: 'What is REST?', a: 'REST (Representational State Transfer) is an architectural style for distributed systems. Resources are identified by URIs, manipulated through standard HTTP verbs, and exchanged as representations such as JSON. It follows constraints: client-server, stateless, cacheable, uniform interface, layered system and optional code on demand.', level: 'Easy' },
    { q: 'What does "stateless" mean in REST?', a: 'Each request must contain all information the server needs (authentication token, parameters). The server does not store client session state between requests, which makes scaling across many servers easy.', level: 'Easy' },
    { q: 'Difference between Web API and MVC in ASP.NET Core?', a: 'Both share the same framework. MVC controllers inherit Controller and return Views (HTML). API controllers inherit ControllerBase, use [ApiController] and return data (JSON). MVC is for server-rendered web pages; Web API is for SPAs, mobile apps and service-to-service calls.', level: 'Easy' },
    { q: 'What does [ApiController] do?', a: 'It enables attribute routing requirement, automatic 400 responses on invalid ModelState, binding source inference ([FromBody] for complex types), multipart/form-data inference for IFormFile and ProblemDetails for error status codes.', level: 'Medium' },
    { q: 'Which HTTP methods are idempotent?', a: 'GET, HEAD, PUT, DELETE and OPTIONS are idempotent - calling them many times leaves the server in the same state. POST is not idempotent; PATCH is not guaranteed to be idempotent.', level: 'Medium' },
    { q: 'Why should URIs use nouns and not verbs?', a: 'Because the HTTP method already expresses the action. /api/students with GET/POST is clean and predictable; /api/getStudents duplicates the verb and breaks the uniform interface.', level: 'Easy' },
    { q: 'What is the difference between 401 and 403?', a: '401 Unauthorized means the client is not authenticated (no or invalid token). 403 Forbidden means the client is authenticated but does not have permission for that resource.', level: 'Medium' },
    { q: 'Controller vs ControllerBase?', a: 'ControllerBase contains everything for handling HTTP requests (Ok, NotFound, ModelState, User). Controller inherits ControllerBase and adds view support (View, PartialView, ViewBag, TempData). API controllers should derive from ControllerBase.', level: 'Easy' },
    { q: 'What is the output of GET /api/students/abc if the route is [HttpGet("{id:int}")] and there is no other matching action?', a: '404 Not Found, because the route constraint :int fails and no endpoint matches. The action is never executed.', level: 'Medium' },
    { q: 'REST vs SOAP?', a: 'SOAP is a protocol using XML envelopes, WSDL contracts and strict standards (WS-Security). REST is an architectural style, lightweight, usually JSON over HTTP, cacheable and easier for web and mobile clients.', level: 'Medium' },
    { q: 'What is the role of Kestrel in a Web API?', a: 'Kestrel is the cross-platform web server inside every ASP.NET Core app. It receives HTTP requests and passes them to the middleware pipeline. In production it can run alone or behind IIS, Nginx or a load balancer.', level: 'Medium' },
    { q: 'What is HATEOAS?', a: 'Hypermedia As The Engine Of Application State: responses include links to related actions (for example "self", "update", "delete" URLs) so clients can navigate the API. It is the highest level of the Richardson Maturity Model; most real APIs stop at level 2 (resources + verbs).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Web API project named CollegeApi and add a CoursesController that returns a list of 3 courses (Id, Title, Fees) at GET /api/courses.',
      hint: 'Use [ApiController], [Route("api/[controller]")] and return Ok(list).',
      solution: `[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private static readonly List<Course> Courses = new()
    {
        new Course { Id = 1, Title = ".NET Full Stack", Fees = 45000 },
        new Course { Id = 2, Title = "React",           Fees = 15000 },
        new Course { Id = 3, Title = "SQL Server",      Fees = 10000 }
    };

    [HttpGet]
    public ActionResult<IEnumerable<Course>> Get() => Ok(Courses);
}

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public int Fees { get; set; }
}`,
    },
    {
      task: 'Add GET /api/courses/{id} that returns 404 with a message when the course does not exist.',
      hint: 'Use FirstOrDefault and NotFound(new { message = ... }).',
      solution: `[HttpGet("{id:int}")]
public ActionResult<Course> GetById(int id)
{
    var course = Courses.FirstOrDefault(c => c.Id == id);
    return course is null
        ? NotFound(new { message = $"Course {id} not found" })
        : Ok(course);
}`,
    },
    {
      task: 'Write the RESTful URI and HTTP verb for: list orders, get order 10, create order, cancel (delete) order 10, update only the status of order 10.',
      hint: 'Use plural nouns: /api/orders.',
      solution: `GET    /api/orders
GET    /api/orders/10
POST   /api/orders
DELETE /api/orders/10
PATCH  /api/orders/10   (body: [{ "op": "replace", "path": "/status", "value": "Shipped" }])`,
    },
    {
      task: 'Add GET /api/courses/search?title=re that returns courses whose title contains the text (case-insensitive).',
      hint: 'Simple types are bound from the query string by default; use [FromQuery] to be explicit.',
      solution: `[HttpGet("search")]
public ActionResult<IEnumerable<Course>> Search([FromQuery] string title)
{
    var result = Courses
        .Where(c => c.Title.Contains(title, StringComparison.OrdinalIgnoreCase))
        .ToList();
    return Ok(result);
}
// GET /api/courses/search?title=re -> [{ "id": 2, "title": "React", "fees": 15000 }]`,
    },
  ],
  quiz: [
    { question: 'Which base class should an ASP.NET Core Web API controller inherit?', options: ['Controller', 'ControllerBase', 'PageModel', 'ApiBase'], answer: 1, explanation: 'ControllerBase provides HTTP helpers without view support, which APIs do not need.' },
    { question: 'Which REST constraint says the server must not keep client session state between requests?', options: ['Cacheable', 'Layered system', 'Stateless', 'Code on demand'], answer: 2, explanation: 'Stateless: every request carries all information needed to process it.' },
    { question: 'Which status code is the best response to a successful POST that creates a resource?', options: ['201 Created', '200 OK', '204 No Content', '202 Accepted'], answer: 0, explanation: '201 Created with a Location header pointing to the new resource is the REST convention.' },
    { question: 'Which service registration is used for a pure Web API (no views)?', options: ['AddRazorPages()', 'AddControllersWithViews()', 'AddMvc()', 'AddControllers()'], answer: 3, explanation: 'AddControllers() registers controllers without Razor view services.' },
    { question: 'Which URI is RESTful for deleting product 7?', options: ['GET /api/deleteProduct?id=7', 'POST /api/products/delete/7', 'DELETE /api/products/7', 'DELETE /api/product/remove'], answer: 2, explanation: 'Use the plural noun resource URI and the DELETE verb.' },
  ],
};
