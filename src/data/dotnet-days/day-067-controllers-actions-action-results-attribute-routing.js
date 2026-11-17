export default {
  id: 'day-067-controllers-actions-action-results-attribute-routing',
  title: 'Controllers, Actions, Action Results and Attribute Routing',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 67,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Go deep into controllers: what makes a class a controller, what an action method is, how actions read input and which Action Result to return (View, Json, Content, Redirect, RedirectToAction, NotFound, BadRequest, File, StatusCode ...). Then learn attribute routing with [Route], [HttpGet], [HttpPost], route tokens, constraints and route names, and build a complete StudentController that lists, shows, creates, deletes and exports students.`,
  objectives: [
    'Create controllers that inherit Controller and write public action methods with parameters',
    'Choose the correct action result: ViewResult, JsonResult, ContentResult, RedirectToActionResult, NotFoundResult, FileResult, StatusCodeResult and more',
    'Understand IActionResult vs ActionResult<T> vs returning a plain type',
    'Use attribute routing: [Route], [HttpGet("...")], [HttpPost], tokens [controller]/[action], constraints, optional parameters, ~/ and Name',
    'Use [NonAction], [ActionName] and HTTP verb attributes to control which method handles a request',
  ],
  theory: [
    {
      heading: 'Controllers: what makes a class a controller?',
      content: `A **controller** is a class that groups related actions, for example everything about students goes into \`StudentController\`. ASP.NET Core treats a class as a controller when it is **public, non-abstract**, and either:
- its name ends with **Controller**, or
- it inherits from a class whose name ends with Controller, or
- it has the **[Controller]** attribute.

You normally inherit from **\`Controller\`** (MVC with views) or **\`ControllerBase\`** (Web API, no view support). The base class gives you helper properties and methods:

| Member | Use |
|---|---|
| \`HttpContext\`, \`Request\`, \`Response\` | Raw HTTP information |
| \`RouteData\`, \`ModelState\` | Route values and validation state |
| \`User\` | The logged-in user (claims) |
| \`ViewData\`, \`ViewBag\`, \`TempData\` | Pass data to views (Day 69) |
| \`View()\`, \`PartialView()\`, \`Json()\`, \`Content()\`, \`Redirect...()\`, \`NotFound()\`, \`Ok()\`, \`File()\` | Create action results |

Analogy: a controller is a **department reception desk** (Students desk, Courses desk); each **action** is one service that the desk offers (list students, show one student, register a student).`,
      tip: 'Keep controllers thin. A controller with 2,000 lines is a sign that business logic should move into a service class injected through the constructor.',
    },
    {
      heading: 'Action methods',
      content: `An **action** is any **public, non-static** method of a controller. Rules and helpers:

- Parameters are filled by **model binding** from route values, query string, form fields, headers or the body: \`Details(int id)\`, \`Search(string name, int page = 1)\`.
- \`[NonAction]\` makes a public method **not** callable from a URL.
- \`[ActionName("Delete")]\` gives a method a different URL name – useful because C# cannot have two methods with the same signature (GET Delete(int id) and POST Delete(int id)).
- HTTP verb attributes \`[HttpGet]\`, \`[HttpPost]\`, \`[HttpPut]\`, \`[HttpDelete]\`, \`[HttpPatch]\` restrict which method can call the action. Without one, an action accepts **any** verb.
- Async actions return \`Task<IActionResult>\`: \`public async Task<IActionResult> Index() { var list = await _service.GetAllAsync(); return View(list); }\``,
      syntax: `public class StudentController : Controller
{
    [HttpGet]
    public IActionResult Create() => View();                 // show empty form

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(Student s) { ... }           // receive form

    [HttpPost, ActionName("Delete")]
    public IActionResult DeleteConfirmed(int id) { ... }     // URL still /Student/Delete/5

    [NonAction]
    public string FormatName(string n) => n.Trim().ToUpper();   // NOT reachable by URL
}`,
    },
    {
      heading: 'Action results: what an action can return',
      content: `An action returns an **action result** – an object that knows how to write the HTTP response. All implement \`IActionResult\`.

| Helper method | Result class | Status / What the browser gets |
|---|---|---|
| \`View(model)\` | ViewResult | 200, HTML rendered from a .cshtml view |
| \`PartialView("_Row", m)\` | PartialViewResult | 200, HTML fragment without layout |
| \`Content("text")\` | ContentResult | 200, text/plain (or given content type) |
| \`Json(obj)\` | JsonResult | 200, application/json (camelCase names) |
| \`Ok(obj)\` | OkObjectResult | 200, object formatted (JSON) |
| \`RedirectToAction("Index")\` | RedirectToActionResult | 302 + Location header built from routes |
| \`RedirectToRoute("name", values)\` | RedirectToRouteResult | 302 using a named route |
| \`Redirect(url)\` / \`RedirectPermanent(url)\` | RedirectResult | 302 / 301 to any URL |
| \`LocalRedirect(url)\` | LocalRedirectResult | 302, only allows URLs of this site (prevents open-redirect attacks) |
| \`NotFound()\` | NotFoundResult | 404 |
| \`BadRequest("msg")\` | BadRequestObjectResult | 400 |
| \`Unauthorized()\` / \`Forbid()\` | UnauthorizedResult / ForbidResult | 401 / 403 |
| \`StatusCode(503)\` | StatusCodeResult | any status code |
| \`NoContent()\` | NoContentResult | 204 |
| \`File(bytes, "text/csv", "a.csv")\` | FileContentResult | file download |
| \`PhysicalFile(path, type)\` | PhysicalFileResult | file from disk |
| \`Created(...)\` / \`CreatedAtAction(...)\` | CreatedAtActionResult | 201 + Location (Web API) |`,
      points: [
        'IActionResult – use when the action can return different result types (View OR NotFound)',
        'ActionResult<T> – Web API style: return a T (auto 200) or any result; Swagger knows the type',
        'Returning a plain type (string, Student) – string becomes text/plain 200; an object becomes JSON 200',
        'A result is just a description; the framework calls ExecuteResultAsync later to write the response',
      ],
    },
    {
      heading: 'Attribute routing basics',
      content: `With **attribute routing** the URL is written **directly on the controller and actions**, instead of a central pattern in Program.cs.

- \`[Route("students")]\` on the controller sets a **prefix** for all actions.
- \`[HttpGet("{id:int}")]\` on an action adds to the prefix → \`GET /students/5\`.
- \`[HttpGet("")]\` or \`[HttpGet]\` → the prefix itself → \`GET /students\`.
- A template starting with \`/\` or \`~/\` **ignores** the controller prefix: \`[HttpGet("~/top-students")]\` → \`/top-students\`.
- Multiple attributes give multiple URLs for one action: \`[Route("")] [Route("home")] [Route("home/index")]\`.
- Once a controller uses attribute routes, its actions are **not** reachable through the conventional route.

Program.cs: in an MVC app \`app.MapControllerRoute(...)\` also maps attribute-routed controllers. In a pure API app you write \`app.MapControllers();\`.`,
      syntax: `[Route("students")]
public class StudentController : Controller
{
    [HttpGet("")]                    // GET /students
    public IActionResult Index() { ... }

    [HttpGet("{id:int}")]            // GET /students/5
    public IActionResult Details(int id) { ... }

    [HttpGet("create")]              // GET /students/create
    public IActionResult Create() { ... }

    [HttpPost("create")]             // POST /students/create
    public IActionResult Create(Student s) { ... }

    [HttpGet("~/top-students")]      // GET /top-students (prefix ignored)
    public IActionResult Top() { ... }
}`,
    },
    {
      heading: 'Tokens, constraints, optional parameters and route names',
      content: `**Tokens** are replaced by the real names: \`[controller]\`, \`[action]\`, \`[area]\`. \`[Route("[controller]/[action]")]\` on \`StudentController.Details\` becomes \`Student/Details\`. If you rename the class, the URL changes automatically.

**Constraints** (same as conventional routing): \`{id:int}\`, \`{id:int:min(1)}\`, \`{name:alpha}\`, \`{name:minlength(3)}\`, \`{date:datetime}\`, \`{active:bool}\`, \`{code:regex(^[A-Z]{{3}}$)}\` (braces in regex are doubled).

**Optional and default values:** \`{page?}\`, \`{page=1}\`, catch-all \`{*path}\`.

**Route name:** \`[HttpGet("{id:int}", Name = "StudentById")]\` lets you build URLs with \`Url.RouteUrl("StudentById", new { id = 5 })\` or \`RedirectToRoute("StudentById", new { id = 5 })\` / \`CreatedAtRoute\`.

**Order:** if two templates can match the same URL, the more specific one wins automatically (literal segments beat parameters, constrained parameters beat unconstrained). You can force it with \`Order = n\` (lower runs first). If two actions are equally good, you get an **AmbiguousMatchException** at runtime.`,
      tip: 'Attribute routing is the standard for Web APIs (Module 8). For classic MVC sites both styles are common; many teams use conventional routing for pages and attribute routing for special URLs.',
    },
    {
      heading: 'Where does an action get its input from?',
      content: `Model binding looks in these sources (Day 70 goes deeper):

1. **Form fields** (POST forms)
2. **Route values** – \`{id}\` in the template
3. **Query string** – \`?name=riya&page=2\`

You can be explicit with attributes: \`[FromRoute]\`, \`[FromQuery]\`, \`[FromForm]\`, \`[FromBody]\` (JSON), \`[FromHeader]\`, \`[FromServices]\`.

Example: \`public IActionResult Search([FromQuery] string course, [FromQuery] int page = 1)\` handles \`/students/search?course=DotNet&page=2\`.`,
    },
  ],
  examples: [
    {
      title: 'StudentController with attribute routing and many action results',
      scenario: 'Build a StudentController (prefix /students) that lists students (View), shows one (View or 404), searches (View), returns JSON, creates a student (GET form + POST with redirect), deletes with ActionName, and exports CSV (File).',
      steps: [
        'Open the SchoolMvc project from Day 66 (or File > New > Project > ASP.NET Core Web App (Model-View-Controller) > SchoolMvc > .NET 10)',
        'Make sure Models/Student.cs and Data/StudentRepository.cs exist (code below adds Add and Delete)',
        'Program.cs: builder.Services.AddSingleton<StudentRepository>(); before builder.Build()',
        'Replace Controllers/StudentController.cs with the code',
        'Create the views Views/Student/Index.cshtml, Details.cshtml and Create.cshtml (right-click action > Add View > Razor View - Empty)',
        'Press Ctrl+F5 and test every URL in the result table; open F12 > Network to see status codes and Location headers',
      ],
      code: `// ===== Models/Student.cs =====
namespace SchoolMvc.Models;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Course { get; set; } = "";
    public int Marks { get; set; }
}

// ===== Data/StudentRepository.cs =====
using SchoolMvc.Models;

namespace SchoolMvc.Data;

public class StudentRepository
{
    private readonly List<Student> _students = new()
    {
        new Student { Id = 1, Name = "Riya Sharma", Course = "DotNet", Marks = 88 },
        new Student { Id = 2, Name = "Karan Mehta", Course = "Java",   Marks = 34 },
        new Student { Id = 3, Name = "Meera Iyer",  Course = "DotNet", Marks = 91 }
    };
    private int _nextId = 4;

    public List<Student> GetAll() => _students;
    public Student? GetById(int id) => _students.FirstOrDefault(s => s.Id == id);
    public void Add(Student s) { s.Id = _nextId++; _students.Add(s); }
    public bool Delete(int id) => _students.RemoveAll(s => s.Id == id) > 0;
}

// ===== Controllers/StudentController.cs =====
using System.Text;
using Microsoft.AspNetCore.Mvc;
using SchoolMvc.Data;
using SchoolMvc.Models;

namespace SchoolMvc.Controllers;

[Route("students")]
public class StudentController : Controller
{
    private readonly StudentRepository _repo;
    public StudentController(StudentRepository repo) => _repo = repo;

    // GET /students
    [HttpGet("")]
    public IActionResult Index() => View(_repo.GetAll());                 // ViewResult

    // GET /students/2
    [HttpGet("{id:int}", Name = "StudentById")]
    public IActionResult Details(int id)
    {
        var s = _repo.GetById(id);
        if (s == null) return NotFound();                                  // 404
        return View(s);                                                    // 200 HTML
    }

    // GET /students/search?course=DotNet
    [HttpGet("search")]
    public IActionResult Search([FromQuery] string? course)
    {
        if (string.IsNullOrWhiteSpace(course))
            return BadRequest("course is required");                       // 400
        var list = _repo.GetAll()
                        .Where(s => s.Course.Equals(course, StringComparison.OrdinalIgnoreCase))
                        .ToList();
        return View("Index", list);                                        // reuse Index view
    }

    // GET /students/2/json
    [HttpGet("{id:int}/json")]
    public IActionResult GetJson(int id)
    {
        var s = _repo.GetById(id);
        return s == null ? NotFound() : Json(s);                           // application/json
    }

    // GET /students/count
    [HttpGet("count")]
    public IActionResult Count() => Content($"Total students: {_repo.GetAll().Count}");   // text/plain

    // GET /students/create
    [HttpGet("create")]
    public IActionResult Create() => View();

    // POST /students/create
    [HttpPost("create")]
    [ValidateAntiForgeryToken]
    public IActionResult Create(Student student)
    {
        if (string.IsNullOrWhiteSpace(student.Name))
        {
            ModelState.AddModelError(nameof(Student.Name), "Name is required");
            return View(student);                                          // redisplay form
        }
        _repo.Add(student);
        return RedirectToRoute("StudentById", new { id = student.Id });    // 302 -> /students/4
    }

    // POST /students/delete/2
    [HttpPost("delete/{id:int}"), ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteConfirmed(int id)
    {
        if (!_repo.Delete(id)) return NotFound();
        return RedirectToAction(nameof(Index));                            // 302 -> /students
    }

    // GET /students/export
    [HttpGet("export")]
    public IActionResult Export()
    {
        var sb = new StringBuilder("Id,Name,Course,Marks\\n");
        foreach (var s in _repo.GetAll())
            sb.Append(s.Id).Append(',').Append(s.Name).Append(',').Append(s.Course).Append(',').Append(s.Marks).Append('\\n');
        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "students.csv");
    }

    // GET /old-students  -> permanent redirect
    [HttpGet("~/old-students")]
    public IActionResult OldUrl() => RedirectPermanent("/students");      // 301

    [NonAction]
    public bool IsTopper(Student s) => s.Marks >= 90;                      // not a URL
}

@* ===== Views/Student/Index.cshtml ===== *@
@model List<SchoolMvc.Models.Student>
@{ ViewData["Title"] = "Students"; }
<h2>Students</h2>
<a asp-action="Create" class="btn btn-primary mb-2">Add student</a>
<table class="table">
    <tr><th>Name</th><th>Course</th><th>Marks</th><th></th></tr>
    @foreach (var s in Model)
    {
        <tr>
            <td><a asp-action="Details" asp-route-id="@s.Id">@s.Name</a></td>
            <td>@s.Course</td>
            <td>@s.Marks</td>
            <td>
                <form asp-action="Delete" asp-route-id="@s.Id" method="post">
                    <button class="btn btn-sm btn-danger">Delete</button>
                </form>
            </td>
        </tr>
    }
</table>

@* ===== Views/Student/Details.cshtml ===== *@
@model SchoolMvc.Models.Student
<h2>@Model.Name</h2>
<p>Course: @Model.Course | Marks: @Model.Marks</p>
<a asp-action="Index">Back</a>

@* ===== Views/Student/Create.cshtml ===== *@
@model SchoolMvc.Models.Student
<h2>Add student</h2>
<form asp-action="Create" method="post">
    <div asp-validation-summary="All" class="text-danger"></div>
    <input asp-for="Name" class="form-control mb-2" placeholder="Name" />
    <input asp-for="Course" class="form-control mb-2" placeholder="Course" />
    <input asp-for="Marks" class="form-control mb-2" />
    <button class="btn btn-success">Save</button>
</form>`,
      result: `Request                              -> Result
GET  /students                       -> 200 HTML table with 3 students
GET  /students/2                     -> 200 HTML "Karan Mehta"
GET  /students/99                    -> 404 Not Found
GET  /students/abc                   -> 404 ({id:int} constraint fails, no other action matches)
GET  /students/search?course=dotnet  -> 200 HTML table with Riya Sharma and Meera Iyer
GET  /students/search                -> 400 "course is required"
GET  /students/1/json                -> 200 {"id":1,"name":"Riya Sharma","course":"DotNet","marks":88}
GET  /students/count                 -> 200 text/plain "Total students: 3"
POST /students/create (Name=Asha, Course=React, Marks=77)
                                     -> 302 Location: /students/4, then GET /students/4 shows "Asha"
POST /students/delete/2              -> 302 Location: /students (Karan removed)
GET  /students/export                -> students.csv downloaded:
                                        Id,Name,Course,Marks
                                        1,Riya Sharma,DotNet,88 ...
GET  /old-students                   -> 301 Location: /students
GET  /students/IsTopper              -> 404 ([NonAction])
GET  /Student/Index                  -> 404 (attribute-routed controller is not reachable by the conventional route)`,
      explanation: 'Every action returns IActionResult so it can choose between success and error results. Json() uses System.Text.Json with camelCase property names. RedirectToRoute uses the route Name "StudentById" to build /students/4, so the URL is never hard-coded. [ActionName("Delete")] lets the C# method be called DeleteConfirmed while the URL/action name stays Delete.',
    },
    {
      title: 'Action results playground controller',
      scenario: 'Create one controller where each action returns a different result type so you can see the status code, content type and headers of each in the browser DevTools.',
      steps: [
        'In SchoolMvc: right-click Controllers > Add > Controller > MVC Controller - Empty > ResultsDemoController',
        'Paste the code',
        'Press Ctrl+F5, press F12 > Network, then open each URL from the result and click the request to view status and headers',
        'Alternative: add a ResultsDemo.http file (Add > New Item > HTTP File) with lines like GET {{host}}/demo/json and click "Send request"',
      ],
      code: `using Microsoft.AspNetCore.Mvc;

namespace SchoolMvc.Controllers;

[Route("demo/[action]")]          // token: /demo/<method name>
public class ResultsDemoController : Controller
{
    public IActionResult Text() => Content("Hello from ContentResult");

    public IActionResult Html() => Content("<h1>Raw HTML</h1>", "text/html");

    public IActionResult JsonData() => Json(new { Name = "Riya", Marks = 88, Passed = true });

    public string PlainString() => "A plain string is wrapped in a ContentResult";

    public object PlainObject() => new { City = "Pune", Pin = 411001 };

    public IActionResult Go() => RedirectToAction("Index", "Home");

    public IActionResult Google() => Redirect("https://www.google.com");

    public IActionResult Safe(string returnUrl) => LocalRedirect(returnUrl);

    public IActionResult Missing() => NotFound();

    public IActionResult Bad() => BadRequest(new { error = "Invalid input" });

    public IActionResult Busy() => StatusCode(503, "Service temporarily unavailable");

    public IActionResult Nothing() => NoContent();

    public IActionResult Download()
    {
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes("Day 67 notes");
        return File(bytes, "text/plain", "notes.txt");
    }

    public IActionResult Secret() => Unauthorized();
}`,
      result: `URL                                   Status  Content-Type / header           Body
/demo/Text                            200     text/plain; charset=utf-8       Hello from ContentResult
/demo/Html                            200     text/html                       big heading "Raw HTML"
/demo/JsonData                        200     application/json; charset=utf-8 {"name":"Riya","marks":88,"passed":true}
/demo/PlainString                     200     text/plain; charset=utf-8       A plain string is wrapped in a ContentResult
/demo/PlainObject                     200     application/json; charset=utf-8 {"city":"Pune","pin":411001}
/demo/Go                              302     Location: /                     (browser then shows Home page)
/demo/Google                          302     Location: https://www.google.com
/demo/Safe?returnUrl=/students        302     Location: /students
/demo/Safe?returnUrl=https://evil.com 500 in Development: InvalidOperationException "The supplied URL is not local."
/demo/Missing                         404     (empty body)
/demo/Bad                             400     application/json                {"error":"Invalid input"}
/demo/Busy                            503     text/plain                      Service temporarily unavailable
/demo/Nothing                         204     (no body)
/demo/Download                        200     Content-Disposition: attachment; filename=notes.txt
/demo/Secret                          401     (empty body)`,
      explanation: 'Each helper only creates a result object; the framework executes it afterwards. Json() and object results use camelCase JSON by default. LocalRedirect protects against open-redirect attacks: a "returnUrl" pointing to another site throws instead of redirecting. The [action] token means the URL segment equals the method name; the route is case-insensitive, so /demo/json also works.',
    },
    {
      title: 'Attribute routing: tokens, constraints, optional values, multiple routes and order',
      scenario: 'Create a CourseController that shows the main attribute routing features and check which action each URL reaches.',
      steps: [
        'Add > Controller > MVC Controller - Empty > CourseController.cs',
        'Paste the code (the actions return Content so no views are needed)',
        'Press Ctrl+F5 and try the URLs',
        'Uncomment the "AmbiguousDemo" action and run again to see the AmbiguousMatchException, then comment it back',
      ],
      code: `using Microsoft.AspNetCore.Mvc;

namespace SchoolMvc.Controllers;

[Route("[controller]")]                     // prefix: /Course
public class CourseController : Controller
{
    [HttpGet]                               // GET /Course
    [HttpGet("all")]                        // GET /Course/all
    [HttpGet("~/courses")]                  // GET /courses (prefix ignored)
    public IActionResult List() => Content("All courses");

    [HttpGet("{id:int:min(1)}")]            // GET /Course/5
    public IActionResult ById(int id) => Content($"Course by id {id}");

    [HttpGet("{code:alpha:length(3)}")]     // GET /Course/NET
    public IActionResult ByCode(string code) => Content($"Course by code {code.ToUpper()}");

    [HttpGet("page/{page:int=1}")]          // GET /Course/page  or /Course/page/3
    public IActionResult Paged(int page) => Content($"Courses page {page}");

    [HttpGet("year/{year:int}/{month:int?}")]   // optional month
    public IActionResult ByDate(int year, int? month) =>
        Content(month == null ? $"Courses in {year}" : $"Courses in {month}/{year}");

    [HttpGet("files/{*path}")]              // catch-all
    public IActionResult Files(string path) => Content($"File path = {path}");

    [HttpGet("[action]")]                   // GET /Course/Popular
    public IActionResult Popular() => Content("Popular courses");

    [HttpGet("{name}")]                     // any other single segment (least specific)
    public IActionResult ByName(string name) => Content($"Course by name {name}");

    // [HttpGet("{title}")]
    // public IActionResult AmbiguousDemo(string title) => Content(title);
}`,
      result: `/Course                      -> All courses
/Course/all                  -> All courses
/courses                     -> All courses
/Course/5                    -> Course by id 5
/Course/0                    -> Course by name 0      (min(1) fails, so the generic {name} route matches)
/Course/net                  -> Course by code NET
/Course/dotnet               -> Course by name dotnet (length(3) fails)
/Course/page                 -> Courses page 1
/Course/page/3               -> Courses page 3
/Course/year/2026            -> Courses in 2026
/Course/year/2026/7          -> Courses in 7/2026
/Course/files/pdf/day67.pdf  -> File path = pdf/day67.pdf
/Course/Popular              -> Popular courses       (literal "Popular" beats {name})

With AmbiguousDemo uncommented, /Course/dotnet throws
AmbiguousMatchException: The request matched multiple endpoints. Matches: ...ByName ...AmbiguousDemo`,
      explanation: 'Routing scores templates: literal segments (all, Popular) beat parameters, and constrained parameters ({id:int}) beat unconstrained ones ({name}). That is why "Popular" reaches Popular() and "5" reaches ById. When two templates are equally specific, the framework cannot choose and throws AmbiguousMatchException. {page:int=1} supplies a default; {month:int?} is optional; {*path} captures the rest of the URL including slashes.',
    },
    {
      title: 'Console demo: how action results work internally',
      scenario: 'Re-create a mini version of IActionResult with ViewResult, JsonResult, NotFoundResult, BadRequestResult and RedirectResult. A StudentController returns them, and a tiny "framework" executes each result.',
      steps: [
        'File > New > Project > Console App > name ActionResultsDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Put a breakpoint (F9) on result.Execute() and step into it with F11 to see polymorphism choose the right Execute method',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

var controller = new StudentController();
Show("GET /students", controller.Index());
Show("GET /students/2", controller.Details(2));
Show("GET /students/7", controller.Details(7));
Show("GET /students/1/json", controller.GetJson(1));
Show("POST /students (Name='')", controller.Create(""));
Show("POST /students (Name='Asha')", controller.Create("Asha"));
Show("GET /students", controller.Index());
Show("GET /old-students", controller.OldList());

static void Show(string request, IActionResult result)
{
    Console.WriteLine(request);
    result.Execute();            // the "framework" executes whatever result was returned
    Console.WriteLine();
}

public interface IActionResult
{
    void Execute();
}

public class ViewResult : IActionResult
{
    private readonly string viewName;
    private readonly string modelInfo;
    public ViewResult(string viewName, string modelInfo) { this.viewName = viewName; this.modelInfo = modelInfo; }
    public void Execute() =>
        Console.WriteLine($"  200 OK text/html -> render Views/Student/{viewName}.cshtml, model: {modelInfo}");
}

public class JsonResult : IActionResult
{
    private readonly object value;
    public JsonResult(object value) { this.value = value; }
    public void Execute() =>
        Console.WriteLine($"  200 OK application/json -> {JsonSerializer.Serialize(value, value.GetType())}");
}

public class NotFoundResult : IActionResult
{
    public void Execute() => Console.WriteLine("  404 Not Found");
}

public class BadRequestResult : IActionResult
{
    private readonly string message;
    public BadRequestResult(string message) { this.message = message; }
    public void Execute() => Console.WriteLine($"  400 Bad Request -> {message}");
}

public class RedirectResult : IActionResult
{
    private readonly string url;
    private readonly bool permanent;
    public RedirectResult(string url, bool permanent) { this.url = url; this.permanent = permanent; }
    public void Execute() =>
        Console.WriteLine($"  {(permanent ? "301 Moved Permanently" : "302 Found")} Location: {url}");
}

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public override string ToString() => $"Student #{Id} {Name} ({Marks})";
}

public class StudentController
{
    private readonly List<Student> students = new()
    {
        new Student { Id = 1, Name = "Riya", Marks = 88 },
        new Student { Id = 2, Name = "Karan", Marks = 64 }
    };
    private int nextId = 3;

    public IActionResult Index() =>
        new ViewResult("Index", $"List<Student> with {students.Count} items");

    public IActionResult Details(int id)
    {
        var s = students.FirstOrDefault(x => x.Id == id);
        if (s == null) return new NotFoundResult();
        return new ViewResult("Details", s.ToString());
    }

    public IActionResult GetJson(int id)
    {
        var s = students.FirstOrDefault(x => x.Id == id);
        if (s == null) return new NotFoundResult();
        return new JsonResult(s);
    }

    public IActionResult Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return new BadRequestResult("Name is required");
        var s = new Student { Id = nextId++, Name = name };
        students.Add(s);
        return new RedirectResult($"/students/{s.Id}", false);
    }

    public IActionResult OldList() => new RedirectResult("/students", true);
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

var controller = new StudentController();
Show("GET /students", controller.Index());
Show("GET /students/2", controller.Details(2));
Show("GET /students/7", controller.Details(7));
Show("GET /students/1/json", controller.GetJson(1));
Show("POST /students (Name='')", controller.Create(""));
Show("POST /students (Name='Asha')", controller.Create("Asha"));
Show("GET /students", controller.Index());
Show("GET /old-students", controller.OldList());

static void Show(string request, IActionResult result)
{
    Console.WriteLine(request);
    result.Execute();            // the "framework" executes whatever result was returned
    Console.WriteLine();
}

public interface IActionResult
{
    void Execute();
}

public class ViewResult : IActionResult
{
    private readonly string viewName;
    private readonly string modelInfo;
    public ViewResult(string viewName, string modelInfo) { this.viewName = viewName; this.modelInfo = modelInfo; }
    public void Execute() =>
        Console.WriteLine($"  200 OK text/html -> render Views/Student/{viewName}.cshtml, model: {modelInfo}");
}

public class JsonResult : IActionResult
{
    private readonly object value;
    public JsonResult(object value) { this.value = value; }
    public void Execute() =>
        Console.WriteLine($"  200 OK application/json -> {JsonSerializer.Serialize(value, value.GetType())}");
}

public class NotFoundResult : IActionResult
{
    public void Execute() => Console.WriteLine("  404 Not Found");
}

public class BadRequestResult : IActionResult
{
    private readonly string message;
    public BadRequestResult(string message) { this.message = message; }
    public void Execute() => Console.WriteLine($"  400 Bad Request -> {message}");
}

public class RedirectResult : IActionResult
{
    private readonly string url;
    private readonly bool permanent;
    public RedirectResult(string url, bool permanent) { this.url = url; this.permanent = permanent; }
    public void Execute() =>
        Console.WriteLine($"  {(permanent ? "301 Moved Permanently" : "302 Found")} Location: {url}");
}

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public override string ToString() => $"Student #{Id} {Name} ({Marks})";
}

public class StudentController
{
    private readonly List<Student> students = new()
    {
        new Student { Id = 1, Name = "Riya", Marks = 88 },
        new Student { Id = 2, Name = "Karan", Marks = 64 }
    };
    private int nextId = 3;

    public IActionResult Index() =>
        new ViewResult("Index", $"List<Student> with {students.Count} items");

    public IActionResult Details(int id)
    {
        var s = students.FirstOrDefault(x => x.Id == id);
        if (s == null) return new NotFoundResult();
        return new ViewResult("Details", s.ToString());
    }

    public IActionResult GetJson(int id)
    {
        var s = students.FirstOrDefault(x => x.Id == id);
        if (s == null) return new NotFoundResult();
        return new JsonResult(s);
    }

    public IActionResult Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return new BadRequestResult("Name is required");
        var s = new Student { Id = nextId++, Name = name };
        students.Add(s);
        return new RedirectResult($"/students/{s.Id}", false);
    }

    public IActionResult OldList() => new RedirectResult("/students", true);
}
`,
        },
        stdin: '',
      },
      result: `GET /students
  200 OK text/html -> render Views/Student/Index.cshtml, model: List<Student> with 2 items

GET /students/2
  200 OK text/html -> render Views/Student/Details.cshtml, model: Student #2 Karan (64)

GET /students/7
  404 Not Found

GET /students/1/json
  200 OK application/json -> {"Id":1,"Name":"Riya","Marks":88}

POST /students (Name='')
  400 Bad Request -> Name is required

POST /students (Name='Asha')
  302 Found Location: /students/3

GET /students
  200 OK text/html -> render Views/Student/Index.cshtml, model: List<Student> with 3 items

GET /old-students
  301 Moved Permanently Location: /students
`,
      explanation: 'The controller never writes to the console itself – it only returns an object that implements IActionResult. The Show method (playing the role of the framework) calls Execute(), and runtime polymorphism picks the correct class. This is exactly why an MVC action can return View or NotFound from the same method. Note: plain JsonSerializer keeps PascalCase names (Id, Name); ASP.NET Core\'s Json() helper uses camelCase web defaults (id, name). The empty name fails IsNullOrWhiteSpace, so 400 is returned; Asha gets Id 3, so the list later has 3 items.',
    },
  ],
  interview: [
    { q: 'What is a controller in ASP.NET Core MVC?', a: 'A public class (usually named XxxController and deriving from Controller) that groups related action methods. It handles incoming requests, uses services/models and returns action results.', level: 'Easy' },
    { q: 'Difference between Controller and ControllerBase?', a: 'ControllerBase has everything for handling HTTP (Ok, NotFound, BadRequest, ModelState, etc.). Controller derives from ControllerBase and adds view support: View(), PartialView(), ViewData, ViewBag, TempData, Json(). Use Controller for MVC and ControllerBase for Web APIs.', level: 'Easy' },
    { q: 'What is an action method? Which methods are NOT actions?', a: 'Any public non-static method of a controller. Methods that are private/protected/static, or marked [NonAction], are not actions and cannot be called via URL.', level: 'Easy' },
    { q: 'What is IActionResult and why use it as a return type?', a: 'An interface for results that write the HTTP response. Returning IActionResult lets one action return different results, e.g. View(model) on success and NotFound() when data is missing.', level: 'Easy' },
    { q: 'Difference between IActionResult and ActionResult<T>?', a: 'ActionResult<T> (mainly for Web API) lets the action return either a T (implicitly converted to 200 OK with the object) or any action result. It also documents the response type for Swagger. IActionResult has no type information.', level: 'Medium' },
    { q: 'Difference between Redirect, RedirectToAction, RedirectToRoute and LocalRedirect?', a: 'Redirect(url) goes to any URL. RedirectToAction builds the URL from controller/action names via routing. RedirectToRoute builds it from a named route. LocalRedirect accepts only local URLs and throws for external ones, protecting against open-redirect attacks.', level: 'Medium' },
    { q: 'Difference between RedirectToAction and View() after a POST?', a: 'View() renders HTML directly in the POST response, so refreshing re-submits the form. RedirectToAction returns 302 and the browser makes a new GET (Post-Redirect-Get), avoiding duplicate submissions.', level: 'Medium' },
    { q: 'What is attribute routing?', a: 'Defining routes with attributes such as [Route("students")] and [HttpGet("{id:int}")] directly on controllers and actions, instead of central route patterns. It allows precise, readable URLs per action and is standard for Web APIs.', level: 'Easy' },
    { q: 'What do the tokens [controller] and [action] do?', a: 'They are replaced with the controller name (without the Controller suffix) and the action name. [Route("[controller]/[action]")] on StudentController.Details gives "Student/Details".', level: 'Easy' },
    { q: 'How do you override the controller-level route prefix for one action?', a: 'Start the action template with "/" or "~/", e.g. [HttpGet("~/top-students")]. The prefix is ignored.', level: 'Medium' },
    { q: 'Why use [ActionName]?', a: 'To give a method a different action name. Common for delete: GET Delete(int id) and POST DeleteConfirmed(int id) marked [HttpPost, ActionName("Delete")] because C# cannot have two methods with identical signatures.', level: 'Medium' },
    { q: 'When do you get AmbiguousMatchException?', a: 'When a request matches two or more endpoints with the same priority, e.g. two actions with [HttpGet("{name}")] and [HttpGet("{title}")]. Fix by adding constraints, literals, HTTP verbs or Order.', level: 'Hard' },
    { q: 'An action has no [HttpGet]/[HttpPost] attribute. Which verbs can call it?', a: 'All HTTP verbs. Adding verb attributes restricts it; that is why form POST actions are marked [HttpPost].', level: 'Medium' },
    { q: 'What does returning a string or an object directly from an action produce?', a: 'A string is written as text/plain with 200 OK. An object is serialized (JSON by default) with 200 OK. A null return gives 204 No Content.', level: 'Medium' },
    { q: 'Output? bool permanent = true; Console.WriteLine(permanent ? "301" : "302");', a: '301 — a permanent redirect (RedirectPermanent) returns 301, a normal Redirect returns 302.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create EmployeeController with prefix "employees" and actions: list (GET employees), details (GET employees/{id:int}), and by department (GET employees/dept/{name:alpha}). Return Content results.',
      hint: '[Route("employees")] on the class and [HttpGet(...)] on each action.',
      solution: `[Route("employees")]
public class EmployeeController : Controller
{
    [HttpGet("")]
    public IActionResult List() => Content("All employees");

    [HttpGet("{id:int}")]
    public IActionResult Details(int id) => Content($"Employee {id}");

    [HttpGet("dept/{name:alpha}")]
    public IActionResult ByDept(string name) => Content($"Employees in {name}");
}`,
    },
    {
      task: 'Add an action that returns the student list as a CSV file named students-YYYYMMDD.csv.',
      hint: 'File(bytes, "text/csv", fileName) and DateTime.Today.ToString("yyyyMMdd").',
      solution: `[HttpGet("export")]
public IActionResult Export()
{
    var lines = _repo.GetAll().Select(s => $"{s.Id},{s.Name},{s.Marks}");
    string csv = "Id,Name,Marks" + Environment.NewLine + string.Join(Environment.NewLine, lines);
    string fileName = $"students-{DateTime.Today:yyyyMMdd}.csv";
    return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", fileName);
}`,
    },
    {
      task: 'Write a Delete flow: GET students/delete/{id} shows a confirmation view; POST to the same URL deletes and redirects to Index. Use [ActionName].',
      hint: 'Two methods: Delete(int id) for GET and DeleteConfirmed(int id) with [HttpPost("delete/{id:int}"), ActionName("Delete")].',
      solution: `[HttpGet("delete/{id:int}")]
public IActionResult Delete(int id)
{
    var s = _repo.GetById(id);
    return s == null ? NotFound() : View(s);
}

[HttpPost("delete/{id:int}"), ActionName("Delete")]
[ValidateAntiForgeryToken]
public IActionResult DeleteConfirmed(int id)
{
    _repo.Delete(id);
    return RedirectToAction(nameof(Index));
}

@* Views/Student/Delete.cshtml *@
@model SchoolMvc.Models.Student
<h3>Delete @Model.Name?</h3>
<form asp-action="Delete" asp-route-id="@Model.Id" method="post">
    <button class="btn btn-danger">Yes, delete</button>
    <a asp-action="Index">Cancel</a>
</form>`,
    },
    {
      task: 'Add a Login action that accepts returnUrl and redirects to it safely after "login".',
      hint: 'Use Url.IsLocalUrl(returnUrl) or LocalRedirect.',
      solution: `[HttpPost("login")]
public IActionResult Login(string userName, string? returnUrl)
{
    // ... check password ...
    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
        return LocalRedirect(returnUrl);
    return RedirectToAction("Index", "Home");
}`,
    },
    {
      task: 'In the console ActionResultsDemo add a ContentResult class and a Count() action that returns "Total: N" as text/plain.',
      hint: 'Implement IActionResult with Execute printing "200 OK text/plain -> ...".',
      solution: `public class ContentResult : IActionResult
{
    private readonly string text;
    public ContentResult(string text) { this.text = text; }
    public void Execute() => Console.WriteLine($"  200 OK text/plain -> {text}");
}

// in StudentController
public IActionResult Count() => new ContentResult($"Total: {students.Count}");

// Show("GET /students/count", controller.Count());
// GET /students/count
//   200 OK text/plain -> Total: 2   (before Asha is added)`,
    },
  ],
  quiz: [
    { question: 'Which helper returns 404 from an MVC action?', options: ['BadRequest()', 'NoContent()', 'NotFound()', 'Forbid()'], answer: 2, explanation: 'NotFound() creates a NotFoundResult with status 404.' },
    { question: 'Which attribute stops a public controller method from being called through a URL?', options: ['[NonAction]', '[HttpGet]', '[ActionName]', '[Route]'], answer: 0, explanation: '[NonAction] tells MVC the method is not an action.' },
    { question: 'Controller has [Route("students")] and action has [HttpGet("~/top")]. What is the URL?', options: ['/students/top', '/top', '/students/~/top', '/students'], answer: 1, explanation: 'A template starting with ~/ ignores the controller prefix.' },
    { question: 'Which result type prevents open-redirect attacks?', options: ['Redirect', 'RedirectPermanent', 'RedirectToRoute', 'LocalRedirect'], answer: 3, explanation: 'LocalRedirect only allows URLs within the same application.' },
    { question: '[Route("[controller]/[action]")] on StudentController.Search gives which URL?', options: ['/Search/Student', '/StudentController/Search', '/Student/Search', '/[controller]/Search'], answer: 2, explanation: 'Tokens are replaced by the controller name without the suffix and the action name.' },
  ],
};
