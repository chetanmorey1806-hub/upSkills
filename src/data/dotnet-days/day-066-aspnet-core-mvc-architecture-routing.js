export default {
  id: 'day-066-aspnet-core-mvc-architecture-routing',
  title: 'ASP.NET Core MVC Architecture: Model, View, Controller and Routing',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 66,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Understand the Model-View-Controller (MVC) pattern and how ASP.NET Core implements it. You will follow one request from the browser through Kestrel, middleware and routing to a controller action, see how the controller fetches data (Model) and hands it to a Razor View, and learn conventional routing with the default {controller=Home}/{action=Index}/{id?} pattern. Finally you will build a small Student MVC application from scratch in Visual Studio.`,
  objectives: [
    'Explain the MVC pattern and the job of the Model, the View and the Controller with a real-world analogy',
    'Trace the full request flow: Browser > Kestrel > Middleware > Routing > Controller > Action > View > Response',
    'Create an ASP.NET Core MVC project in Visual Studio and understand Controllers, Models, Views and wwwroot folders',
    'Configure conventional routing with MapControllerRoute, default values, optional parameters and constraints',
    'Build a Student MVC application with a model, an in-memory repository, a controller and two views',
  ],
  theory: [
    {
      heading: 'What is MVC and why do we use it?',
      content: `**MVC (Model-View-Controller)** is a design pattern that splits a web application into three parts so that each part has **one responsibility** (Separation of Concerns):

- **Model** – the data and business rules. Example: a \`Student\` class with Id, Name, Marks, and a service/repository that loads students from a database.
- **View** – the user interface. In ASP.NET Core this is a **Razor view** (\`.cshtml\` file) that mixes HTML with C# to display the model.
- **Controller** – the coordinator. It receives the request, talks to the model, chooses a view and passes data to it.

**Real-world analogy – a restaurant:**
- The **customer** (browser) places an order.
- The **waiter** (Controller) takes the order, sends it to the kitchen and brings back the plate.
- The **kitchen and ingredients** (Model) prepare the actual food (data).
- The **plate presentation** (View) is how the food looks on the table.

The waiter never cooks and the chef never talks to the customer. In the same way, a controller should not contain HTML and a view should not contain database code.`,
      points: [
        'Separation of concerns: UI designers work on Views, back-end developers on Models and Controllers',
        'Testability: controllers and models are plain C# classes that can be unit tested without a browser',
        'Maintainability: changing the look (View) does not break business rules (Model)',
        'Multiple views can show the same model (HTML page, PDF, JSON)',
        'ASP.NET Core MVC = MVC pattern + routing + model binding + validation + Razor + filters + dependency injection',
      ],
    },
    {
      heading: 'Request life cycle in ASP.NET Core MVC',
      content: `When the user opens \`https://localhost:7001/Student/Details/2\` this happens:

1. **Browser** sends \`GET /Student/Details/2\`.
2. **Kestrel** (the built-in web server) receives it and creates an \`HttpContext\`.
3. The **middleware pipeline** runs: HTTPS redirection, static files, routing, authorization ...
4. **Routing** (\`UseRouting\` + \`MapControllerRoute\`) matches the URL to the route template and produces **route values**: controller = Student, action = Details, id = 2.
5. The framework creates an instance of **StudentController** (through dependency injection).
6. **Model binding** converts the route value "2" into the \`int id\` parameter.
7. The **action method** \`Details(int id)\` runs, asks the repository/service (Model) for student 2.
8. The action returns \`View(student)\` – a **ViewResult**.
9. The **Razor view engine** finds \`Views/Student/Details.cshtml\`, executes it with the model and produces HTML (wrapped in \`_Layout.cshtml\`).
10. The HTML response (200 OK, text/html) travels back through the middleware to the browser.`,
      syntax: `Browser --GET /Student/Details/2--> Kestrel --> Middleware pipeline
   --> Routing: {controller=Student, action=Details, id=2}
   --> StudentController.Details(2) --> StudentRepository.GetById(2)  (Model)
   --> return View(student) --> Views/Student/Details.cshtml  (View)
   --> HTML 200 OK --> Browser`,
      tip: 'Put a breakpoint (F9) on the first line of an action and press F5. When the browser hits the URL, Visual Studio stops there – the fastest way to SEE the request flow.',
    },
    {
      heading: 'MVC project structure and naming conventions',
      content: `The **ASP.NET Core Web App (Model-View-Controller)** template creates:

| Folder / File | Purpose |
|---|---|
| \`Controllers/\` | Controller classes, e.g. \`HomeController.cs\` |
| \`Models/\` | Model classes, e.g. \`ErrorViewModel.cs\`, \`Student.cs\` |
| \`Views/Home/\` | Views for HomeController (\`Index.cshtml\`, \`Privacy.cshtml\`) |
| \`Views/Shared/\` | Views shared by all controllers (\`_Layout.cshtml\`, \`Error.cshtml\`) |
| \`Views/_ViewStart.cshtml\` | Sets the default layout for all views |
| \`Views/_ViewImports.cshtml\` | Common @using and @addTagHelper lines |
| \`wwwroot/\` | Static files: css, js, lib (Bootstrap, jQuery), images |
| \`Program.cs\` | Registers services and configures the pipeline and routes |
| \`appsettings.json\` | Configuration |

**Conventions (convention over configuration):**
- A controller class name ends with **Controller** and (usually) inherits \`Controller\`. The URL uses the name **without** the suffix: \`StudentController\` → \`/Student\`.
- Public methods of a controller are **actions**.
- \`return View()\` inside \`StudentController.Index\` looks for \`Views/Student/Index.cshtml\`, then \`Views/Shared/Index.cshtml\`.`,
    },
    {
      heading: 'Enabling MVC in Program.cs',
      content: `Two lines turn an empty web app into an MVC app:

1. \`builder.Services.AddControllersWithViews();\` – registers MVC services (controllers, Razor view engine, model binding, validation, tag helpers).
2. \`app.MapControllerRoute(...)\` – adds the **conventional route** so URLs are mapped to controllers.

Related registrations:
- \`AddControllers()\` – controllers **without** views (Web API only).
- \`AddRazorPages()\` – Razor Pages.
- \`AddMvc()\` – everything (controllers + views + Razor Pages); older style.

In .NET 9/10 the template uses \`app.MapStaticAssets()\` and \`.WithStaticAssets()\` (optimised, fingerprinted static files). On .NET 8 the template uses \`app.UseStaticFiles()\`. Both work.`,
      syntax: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();

var app = builder.Build();
app.UseStaticFiles();      // .NET 9/10 template: app.MapStaticAssets();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();`,
    },
    {
      heading: 'Conventional routing: the default route explained',
      content: `The pattern \`{controller=Home}/{action=Index}/{id?}\` has three **route parameters**:

- \`{controller=Home}\` – first URL segment; **default value** Home if missing.
- \`{action=Index}\` – second segment; default Index.
- \`{id?}\` – third segment; the \`?\` makes it **optional**.

| URL | controller | action | id |
|---|---|---|---|
| \`/\` | Home | Index | – |
| \`/Student\` | Student | Index | – |
| \`/Student/Details/5\` | Student | Details | 5 |
| \`/student/details/5\` | Student | Details | 5 (URLs are case-insensitive) |
| \`/Student/Details/5/extra\` | no match → **404** | | |

You can add **more routes**. Routes are checked in the order they are added, so put **specific routes first** and the default route last. **Route constraints** restrict what a parameter can be: \`{id:int}\`, \`{name:alpha}\`, \`{year:int:min(2000)}\`, \`{code:length(3)}\`. If the constraint fails the route does not match (usually giving 404).`,
      syntax: `// specific route first: /students/2  -> StudentController.Details(2)
app.MapControllerRoute(
    name: "studentDetails",
    pattern: "students/{id:int}",
    defaults: new { controller = "Student", action = "Details" });

// default route last
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");`,
      points: [
        'Conventional routing = routes defined centrally in Program.cs (good for classic MVC sites)',
        'Attribute routing = [Route] / [HttpGet] on controllers and actions (Day 67; standard for Web API)',
        'Generate URLs with tag helpers (asp-controller, asp-action, asp-route-id) instead of hard-coding – they follow the route table automatically',
      ],
    },
    {
      heading: 'MVC vs Razor Pages vs Web API vs Minimal API',
      content: `ASP.NET Core offers several programming models on the same platform:

| Model | Best for | Returns |
|---|---|---|
| **MVC** (Controllers + Views) | Large websites with many pages and shared logic | HTML views |
| **Razor Pages** (Day 69) | Page-focused sites, simple forms, CRUD screens | HTML; logic in a PageModel next to the page |
| **Web API** (Module 8) | Back-end for React/Angular/mobile apps | JSON |
| **Minimal API** | Small micro-services, quick endpoints | JSON / text |

One project can mix them: MVC controllers, Razor Pages and API controllers can live side by side. MVC is the foundation of everything in this module – filters, model binding, validation and DI all work the same way in Web API.`,
      tip: 'Interview tip: "MVC is a pattern; ASP.NET Core MVC is Microsoft\'s framework that implements the pattern."',
    },
  ],
  examples: [
    {
      title: 'Create your first ASP.NET Core MVC application in Visual Studio',
      scenario: 'Create the MVC template project, run it, and identify which controller, action and view produced the home page.',
      steps: [
        'Open Visual Studio 2022/2026 > Create a new project',
        'Search "mvc" and choose "ASP.NET Core Web App (Model-View-Controller)" (C#) > Next',
        'Project name: SchoolMvc, Location: any folder > Next',
        'Framework: .NET 10.0 (Long Term Support) (or .NET 8.0), Authentication type: None, tick "Configure for HTTPS" > Create',
        'Open Solution Explorer (Ctrl+Alt+L) and expand Controllers, Models, Views/Home, Views/Shared',
        'Open Controllers/HomeController.cs and press F9 on the "return View();" line inside Index()',
        'Press F5 – the browser opens, Visual Studio stops on the breakpoint; press F5 again to continue',
        'Click "Privacy" in the menu and notice the URL /Home/Privacy',
        'CLI alternative: dotnet new mvc -n SchoolMvc && cd SchoolMvc && dotnet run',
      ],
      code: `// ===== Program.cs (template, .NET 10) =====
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();          // .NET 8: app.UseStaticFiles(); before UseRouting

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();

// ===== Controllers/HomeController.cs =====
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SchoolMvc.Models;

namespace SchoolMvc.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();              // -> Views/Home/Index.cshtml
        }

        public IActionResult Privacy()
        {
            return View();              // -> Views/Home/Privacy.cshtml
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

@* ===== Views/Home/Index.cshtml ===== *@
@{
    ViewData["Title"] = "Home Page";
}

<div class="text-center">
    <h1 class="display-4">Welcome</h1>
    <p>Learn about <a href="https://learn.microsoft.com/aspnet/core">building Web apps with ASP.NET Core</a>.</p>
</div>`,
      result: `Browser opens https://localhost:7xxx/ (port is random, see Properties/launchSettings.json).
Visual Studio stops on the breakpoint in HomeController.Index (route values: controller=Home, action=Index).
After pressing F5 again the page shows the Bootstrap navbar "SchoolMvc | Home | Privacy" and a big "Welcome" heading.
Clicking Privacy opens /Home/Privacy -> HomeController.Privacy() -> Views/Home/Privacy.cshtml.
Opening /Home/Unknown shows a 404 (no action named Unknown).`,
      explanation: 'The URL "/" has no segments, so the default values controller=Home and action=Index are used. HomeController.Index returns View() with no name, so Razor looks for Views/{controller}/{action}.cshtml = Views/Home/Index.cshtml. That view is wrapped by Views/Shared/_Layout.cshtml because Views/_ViewStart.cshtml sets Layout = "_Layout". The logger is given to the controller through constructor dependency injection.',
    },
    {
      title: 'Build a Student MVC app: Model + Repository + Controller + Views',
      scenario: 'Add a Student model, an in-memory repository, a StudentController with Index (list) and Details actions, and the two Razor views. Add a "Students" link to the navbar.',
      steps: [
        'In the SchoolMvc project: right-click Models > Add > Class > Student.cs, paste the model',
        'Right-click project > Add > New Folder "Data" > Add > Class > StudentRepository.cs',
        'Register the repository in Program.cs: builder.Services.AddSingleton<StudentRepository>(); (before builder.Build())',
        'Right-click Controllers > Add > Controller > "MVC Controller - Empty" > name StudentController.cs',
        'Right-click inside the Index() method > Add View > "Razor View - Empty" > name Index.cshtml (Visual Studio creates Views/Student/Index.cshtml)',
        'Do the same for Details() > Details.cshtml',
        'In Views/Shared/_Layout.cshtml add the nav link: <a class="nav-link text-dark" asp-controller="Student" asp-action="Index">Students</a>',
        'Press Ctrl+F5 and open /Student, then click a name; also try /Student/Details/99',
      ],
      code: `// ===== Models/Student.cs =====
namespace SchoolMvc.Models
{
    public class Student
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Course { get; set; } = "";
        public int Marks { get; set; }
        public string Result => Marks >= 40 ? "Pass" : "Fail";
    }
}

// ===== Data/StudentRepository.cs =====
using SchoolMvc.Models;

namespace SchoolMvc.Data
{
    public class StudentRepository
    {
        private readonly List<Student> _students = new()
        {
            new Student { Id = 1, Name = "Riya Sharma", Course = "DotNet", Marks = 88 },
            new Student { Id = 2, Name = "Karan Mehta", Course = "Java",   Marks = 34 },
            new Student { Id = 3, Name = "Meera Iyer",  Course = "React",  Marks = 91 }
        };

        public List<Student> GetAll() => _students;
        public Student? GetById(int id) => _students.FirstOrDefault(s => s.Id == id);
    }
}

// ===== Program.cs (only the added line shown in context) =====
using SchoolMvc.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<StudentRepository>();   // Model layer available through DI
var app = builder.Build();
// ... rest of the template unchanged ...

// ===== Controllers/StudentController.cs =====
using Microsoft.AspNetCore.Mvc;
using SchoolMvc.Data;

namespace SchoolMvc.Controllers
{
    public class StudentController : Controller
    {
        private readonly StudentRepository _repo;

        public StudentController(StudentRepository repo)   // constructor injection
        {
            _repo = repo;
        }

        // GET /Student  or  /Student/Index
        public IActionResult Index()
        {
            var students = _repo.GetAll();     // 1. ask the Model
            return View(students);             // 2. pass it to Views/Student/Index.cshtml
        }

        // GET /Student/Details/2
        public IActionResult Details(int id)
        {
            var student = _repo.GetById(id);
            if (student == null)
                return NotFound();             // 404
            return View(student);
        }
    }
}

@* ===== Views/Student/Index.cshtml ===== *@
@model List<SchoolMvc.Models.Student>
@{
    ViewData["Title"] = "Students";
}

<h2>Students (@Model.Count)</h2>
<table class="table table-striped">
    <thead>
        <tr><th>Id</th><th>Name</th><th>Course</th><th>Marks</th><th>Result</th></tr>
    </thead>
    <tbody>
    @foreach (var s in Model)
    {
        <tr>
            <td>@s.Id</td>
            <td><a asp-action="Details" asp-route-id="@s.Id">@s.Name</a></td>
            <td>@s.Course</td>
            <td>@s.Marks</td>
            <td>@s.Result</td>
        </tr>
    }
    </tbody>
</table>

@* ===== Views/Student/Details.cshtml ===== *@
@model SchoolMvc.Models.Student
@{
    ViewData["Title"] = Model.Name;
}

<h2>@Model.Name</h2>
<dl class="row">
    <dt class="col-sm-2">Course</dt><dd class="col-sm-10">@Model.Course</dd>
    <dt class="col-sm-2">Marks</dt><dd class="col-sm-10">@Model.Marks</dd>
    <dt class="col-sm-2">Result</dt><dd class="col-sm-10">@Model.Result</dd>
</dl>
<a asp-action="Index" class="btn btn-secondary">Back to list</a>`,
      result: `/Student shows "Students (3)" and a table:
Id | Name        | Course | Marks | Result
1  | Riya Sharma | DotNet | 88    | Pass
2  | Karan Mehta | Java   | 34    | Fail
3  | Meera Iyer  | React  | 91    | Pass

Each name is a link: <a href="/Student/Details/1">Riya Sharma</a> ...
/Student/Details/2 shows "Karan Mehta", Course Java, Marks 34, Result Fail, and a "Back to list" button.
/Student/Details/99 -> HTTP 404 (empty page / browser 404 message).`,
      explanation: 'The controller is thin: it gets data from the repository (Model) and returns View(model). The views declare @model so Model is strongly typed and IntelliSense works. asp-action="Details" asp-route-id="@s.Id" generates /Student/Details/1 from the route table, so links stay correct if routes change. AddSingleton keeps one repository instance for the whole app (Day 72 explains lifetimes).',
    },
    {
      title: 'Custom conventional routes with defaults and constraints',
      scenario: 'Add friendly URLs: /students/2 for details, /results/2026 for a yearly result page, and keep the default route. See which URL goes where.',
      steps: [
        'Open Program.cs of SchoolMvc',
        'Add the two MapControllerRoute calls BEFORE the default route as shown',
        'Add the Results action to StudentController',
        'Press Ctrl+F5 and try each URL in the table',
        'Hover any generated link to see that asp-action links now use the friendly pattern where it matches',
      ],
      code: `// ===== Program.cs (routing part) =====
app.MapControllerRoute(
    name: "studentDetails",
    pattern: "students/{id:int}",
    defaults: new { controller = "Student", action = "Details" });

app.MapControllerRoute(
    name: "yearlyResults",
    pattern: "results/{year:int:min(2000)}",
    defaults: new { controller = "Student", action = "Results" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// ===== Controllers/StudentController.cs (new action) =====
public IActionResult Results(int year)
{
    return Content($"Results for academic year {year}");
}`,
      result: `URL                     -> handled by
/students/2             -> StudentController.Details(id: 2)          (studentDetails route)
/students/abc           -> 404 (id:int constraint fails, default route has no StudentsController)
/results/2026           -> "Results for academic year 2026"           (yearlyResults route)
/results/1999           -> 404 (min(2000) constraint fails)
/Student/Details/3      -> StudentController.Details(id: 3)          (default route)
/                       -> HomeController.Index                     (default route)

Link generation: <a asp-controller="Student" asp-action="Details" asp-route-id="1"> now renders href="/students/1"
because the first route that can produce the URL is used.`,
      explanation: 'Routes are tried in order. "students/{id:int}" is a literal segment plus a constrained parameter; the controller and action come from defaults because they are not in the URL. Constraints like int and min(2000) stop wrong values from reaching the action. Because URL generation also walks the route table, tag helpers automatically produce the friendly URL.',
    },
    {
      title: 'Add MVC to an Empty project by hand (understand what the template does)',
      scenario: 'Start from "ASP.NET Core Empty" and add exactly what is needed for one controller and one view – no Bootstrap, no layout.',
      steps: [
        'File > New > Project > "ASP.NET Core Empty" > name MiniMvc > .NET 10 > Create',
        'Replace Program.cs with the code below',
        'Add folder Controllers > class HelloController.cs',
        'Add folders Views/Hello and file Index.cshtml (Add > New Item > Razor View - Empty)',
        'Press Ctrl+F5 and open /Hello and /Hello/Index/Asha',
      ],
      code: `// ===== Program.cs =====
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();     // 1. MVC services

var app = builder.Build();

app.MapControllerRoute(                          // 2. route to controllers
    name: "default",
    pattern: "{controller=Hello}/{action=Index}/{id?}");

app.Run();

// ===== Controllers/HelloController.cs =====
using Microsoft.AspNetCore.Mvc;

namespace MiniMvc.Controllers;

public class HelloController : Controller
{
    public IActionResult Index(string? id)
    {
        string name = id ?? "Guest";
        return View(model: name);       // model is a string
    }
}

@* ===== Views/Hello/Index.cshtml ===== *@
@model string
<!DOCTYPE html>
<html>
<head><title>Mini MVC</title></head>
<body>
    <h1>Hello, @Model!</h1>
    <p>Served by HelloController.Index at @DateTime.Now.ToString("HH:mm")</p>
</body>
</html>`,
      result: `/                -> "Hello, Guest!"  (default controller Hello, default action Index)
/Hello           -> "Hello, Guest!"
/Hello/Index/Asha -> "Hello, Asha!"
The second line shows the current server time, e.g. "Served by HelloController.Index at 10:42" (changes every minute).`,
      explanation: 'Only two things are needed: AddControllersWithViews() and a controller route. The view has no layout because there is no _ViewStart.cshtml. View(model: name) is used because View(string) would treat the string as a VIEW NAME, not as the model – a classic beginner bug.',
    },
    {
      title: 'Console demo: simulate MVC and the default route in plain C#',
      scenario: 'To really understand the pattern, build a tiny "framework" in a console app: a router that splits the URL into controller/action/id, controllers that call a repository (Model) and views that return HTML strings.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name MvcSimulator > .NET 10',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Set a breakpoint (F9) in Router.Dispatch and press F5, then use F10/F11 to step into the controller and view',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

string[] urls = { "/", "/Student", "/Student/Details/2", "/student/details/9", "/Course/List" };

foreach (string url in urls)
{
    Console.WriteLine($"GET {url}");
    string html = Router.Dispatch(url);
    Console.WriteLine(html);
    Console.WriteLine("----");
}

// ===== MODEL =====
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

public static class StudentRepository
{
    private static readonly List<Student> students = new()
    {
        new Student { Id = 1, Name = "Riya", Marks = 88 },
        new Student { Id = 2, Name = "Karan", Marks = 64 },
        new Student { Id = 3, Name = "Meera", Marks = 91 }
    };

    public static List<Student> GetAll() => students;
    public static Student? GetById(int id) => students.FirstOrDefault(s => s.Id == id);
}

// ===== VIEWS =====
public static class Views
{
    public static string HomeIndex() => "<h1>Welcome to Student Portal</h1>";

    public static string StudentList(List<Student> model)
    {
        var lines = new List<string> { "<h2>Students</h2>" };
        foreach (var s in model)
            lines.Add($"<li>{s.Id}. {s.Name} - {s.Marks}</li>");
        return string.Join(Environment.NewLine, lines);
    }

    public static string StudentDetails(Student model) =>
        $"<h2>{model.Name}</h2><p>Marks: {model.Marks}</p>";
}

// ===== CONTROLLERS =====
public class HomeController
{
    public string Index() => Views.HomeIndex();
}

public class StudentController
{
    public string Index() => Views.StudentList(StudentRepository.GetAll());

    public string Details(int id)
    {
        var student = StudentRepository.GetById(id);
        if (student == null) return "404 Not Found: student " + id;
        return Views.StudentDetails(student);
    }
}

// ===== ROUTING: simplified {controller=Home}/{action=Index}/{id?} =====
public static class Router
{
    public static string Dispatch(string url)
    {
        string[] parts = url.Split('/', StringSplitOptions.RemoveEmptyEntries);
        string controller = parts.Length > 0 ? parts[0] : "Home";
        string action = parts.Length > 1 ? parts[1] : "Index";
        string id = parts.Length > 2 ? parts[2] : "";
        Console.WriteLine($"  controller={controller} action={action} id={(id == "" ? "(none)" : id)}");

        string key = (controller + "/" + action).ToLowerInvariant();
        switch (key)
        {
            case "home/index":
                return new HomeController().Index();
            case "student/index":
                return new StudentController().Index();
            case "student/details":
                if (int.TryParse(id, out int studentId))
                    return new StudentController().Details(studentId);
                return "400 Bad Request: id must be a number";
            default:
                return "404 Not Found: no action " + controller + "/" + action;
        }
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

string[] urls = { "/", "/Student", "/Student/Details/2", "/student/details/9", "/Course/List" };

foreach (string url in urls)
{
    Console.WriteLine($"GET {url}");
    string html = Router.Dispatch(url);
    Console.WriteLine(html);
    Console.WriteLine("----");
}

// ===== MODEL =====
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

public static class StudentRepository
{
    private static readonly List<Student> students = new()
    {
        new Student { Id = 1, Name = "Riya", Marks = 88 },
        new Student { Id = 2, Name = "Karan", Marks = 64 },
        new Student { Id = 3, Name = "Meera", Marks = 91 }
    };

    public static List<Student> GetAll() => students;
    public static Student? GetById(int id) => students.FirstOrDefault(s => s.Id == id);
}

// ===== VIEWS =====
public static class Views
{
    public static string HomeIndex() => "<h1>Welcome to Student Portal</h1>";

    public static string StudentList(List<Student> model)
    {
        var lines = new List<string> { "<h2>Students</h2>" };
        foreach (var s in model)
            lines.Add($"<li>{s.Id}. {s.Name} - {s.Marks}</li>");
        return string.Join(Environment.NewLine, lines);
    }

    public static string StudentDetails(Student model) =>
        $"<h2>{model.Name}</h2><p>Marks: {model.Marks}</p>";
}

// ===== CONTROLLERS =====
public class HomeController
{
    public string Index() => Views.HomeIndex();
}

public class StudentController
{
    public string Index() => Views.StudentList(StudentRepository.GetAll());

    public string Details(int id)
    {
        var student = StudentRepository.GetById(id);
        if (student == null) return "404 Not Found: student " + id;
        return Views.StudentDetails(student);
    }
}

// ===== ROUTING: simplified {controller=Home}/{action=Index}/{id?} =====
public static class Router
{
    public static string Dispatch(string url)
    {
        string[] parts = url.Split('/', StringSplitOptions.RemoveEmptyEntries);
        string controller = parts.Length > 0 ? parts[0] : "Home";
        string action = parts.Length > 1 ? parts[1] : "Index";
        string id = parts.Length > 2 ? parts[2] : "";
        Console.WriteLine($"  controller={controller} action={action} id={(id == "" ? "(none)" : id)}");

        string key = (controller + "/" + action).ToLowerInvariant();
        switch (key)
        {
            case "home/index":
                return new HomeController().Index();
            case "student/index":
                return new StudentController().Index();
            case "student/details":
                if (int.TryParse(id, out int studentId))
                    return new StudentController().Details(studentId);
                return "400 Bad Request: id must be a number";
            default:
                return "404 Not Found: no action " + controller + "/" + action;
        }
    }
}
`,
        },
        stdin: '',
      },
      result: `GET /
  controller=Home action=Index id=(none)
<h1>Welcome to Student Portal</h1>
----
GET /Student
  controller=Student action=Index id=(none)
<h2>Students</h2>
<li>1. Riya - 88</li>
<li>2. Karan - 64</li>
<li>3. Meera - 91</li>
----
GET /Student/Details/2
  controller=Student action=Details id=2
<h2>Karan</h2><p>Marks: 64</p>
----
GET /student/details/9
  controller=student action=details id=9
404 Not Found: student 9
----
GET /Course/List
  controller=Course action=List id=(none)
404 Not Found: no action Course/List
----`,
      explanation: '"/" splits into zero segments, so the defaults Home/Index are used. ToLowerInvariant makes matching case-insensitive, just like real ASP.NET Core routing ("/student/details/9" still reaches StudentController). Student 9 does not exist, so the controller (not the view) decides to return 404. "/Course/List" has no matching controller/action, so the router returns 404. The real framework does the same job using reflection, endpoint metadata and the Razor view engine.',
    },
  ],
  interview: [
    { q: 'What is MVC?', a: 'Model-View-Controller is a design pattern that separates an application into Model (data and business logic), View (user interface) and Controller (handles requests, works with the model and selects the view). It gives separation of concerns, testability and maintainability.', level: 'Easy' },
    { q: 'Explain the request life cycle of an ASP.NET Core MVC request.', a: 'Kestrel receives the request and creates HttpContext > middleware pipeline runs > routing matches the URL to an endpoint (controller + action) > the controller is created through DI > model binding fills action parameters > filters run > action executes and returns an IActionResult > for ViewResult the Razor engine renders the view inside the layout > response goes back through middleware to the client.', level: 'Medium' },
    { q: 'What does AddControllersWithViews() register? How is it different from AddControllers() and AddMvc()?', a: 'AddControllersWithViews registers controllers plus view support (Razor view engine, tag helpers, view features). AddControllers registers controllers only (for Web APIs). AddMvc registers controllers, views AND Razor Pages.', level: 'Medium' },
    { q: 'Explain the default route {controller=Home}/{action=Index}/{id?}.', a: 'The first URL segment is the controller name (default Home), the second is the action (default Index), and the third is an optional id. So "/" maps to HomeController.Index and "/Student/Details/5" to StudentController.Details with id = 5.', level: 'Easy' },
    { q: 'Where does return View() look for the view file?', a: 'For StudentController.Index it searches Views/Student/Index.cshtml first, then Views/Shared/Index.cshtml (and Pages/Shared for Razor Pages). If none is found an InvalidOperationException lists the searched locations.', level: 'Medium' },
    { q: 'What is a route constraint? Give examples.', a: 'A rule that limits which values a route parameter accepts, e.g. {id:int}, {name:alpha}, {year:int:min(2000)}, {code:length(3)}, {date:datetime}, {slug:regex(...)}. If the value does not satisfy the constraint the route does not match.', level: 'Medium' },
    { q: 'Why should specific routes be registered before the default route?', a: 'Conventional routes are evaluated in order of registration for link generation, and a very general pattern can capture URLs meant for a specific route. Placing specific routes first keeps the intended mapping and URL generation predictable.', level: 'Medium' },
    { q: 'What is the difference between conventional routing and attribute routing?', a: 'Conventional routing defines URL patterns centrally in Program.cs using MapControllerRoute. Attribute routing puts [Route], [HttpGet("...")] attributes directly on controllers and actions, giving full control per action; it is the standard for Web APIs.', level: 'Easy' },
    { q: 'Should a controller contain business logic or database code?', a: 'No. Controllers should be thin: validate input, call services/repositories (the Model layer), and choose the result. Business rules and data access belong in services and repositories, which are injected via DI.', level: 'Medium' },
    { q: 'What are the naming conventions for controllers in ASP.NET Core MVC?', a: 'The class is public, ends with the suffix "Controller" (or has [Controller] attribute) and usually derives from Controller. The URL uses the name without the suffix. Public non-static methods are actions unless marked [NonAction].', level: 'Easy' },
    { q: 'What happens when you call View("Hello") expecting "Hello" to be the model?', a: 'View(string) treats the string as the view name, so the framework looks for a view called Hello.cshtml and throws if not found. Use View(model: "Hello") or View((object)"Hello") to pass a string model.', level: 'Hard' },
    { q: 'Compare MVC and Razor Pages.', a: 'MVC separates controllers and views in different folders and suits large apps with many shared actions. Razor Pages keep the page (.cshtml) and its PageModel (.cshtml.cs) together, and are simpler for page-focused scenarios. Both use the same Razor, model binding, validation and DI.', level: 'Medium' },
    { q: 'Output? string url = "/"; var parts = url.Split(\'/\', StringSplitOptions.RemoveEmptyEntries); Console.WriteLine(parts.Length > 0 ? parts[0] : "Home");', a: 'Home — splitting "/" with RemoveEmptyEntries gives an empty array, so the default value is used (exactly how the default route treats "/").', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create an MVC project named CollegeMvc and add an AboutController with an Index action that shows the college name, city and founding year in a view.',
      hint: 'Add > Controller > MVC Controller - Empty; right-click Index > Add View.',
      solution: `// Controllers/AboutController.cs
public class AboutController : Controller
{
    public IActionResult Index() => View();
}

@* Views/About/Index.cshtml *@
@{ ViewData["Title"] = "About"; }
<h2>ABC Engineering College</h2>
<p>City: Pune</p>
<p>Founded: 1998</p>

// URL: /About`,
    },
    {
      task: 'Add a CourseController with Index (list of 3 courses) and Details(int id) actions using a Course model and a CourseRepository registered with DI.',
      hint: 'Same pattern as StudentController. Return NotFound() when the id does not exist.',
      solution: `public class Course { public int Id { get; set; } public string Title { get; set; } = ""; public int Days { get; set; } }

public class CourseRepository
{
    private readonly List<Course> _courses = new()
    {
        new Course { Id = 1, Title = ".NET Full Stack", Days = 120 },
        new Course { Id = 2, Title = "Java Full Stack", Days = 110 },
        new Course { Id = 3, Title = "Data Analytics", Days = 90 }
    };
    public List<Course> GetAll() => _courses;
    public Course? GetById(int id) => _courses.FirstOrDefault(c => c.Id == id);
}

// Program.cs
builder.Services.AddSingleton<CourseRepository>();

public class CourseController : Controller
{
    private readonly CourseRepository _repo;
    public CourseController(CourseRepository repo) => _repo = repo;
    public IActionResult Index() => View(_repo.GetAll());
    public IActionResult Details(int id)
    {
        var c = _repo.GetById(id);
        return c == null ? NotFound() : View(c);
    }
}`,
    },
    {
      task: 'Add a route so that /course/dotnet shows CourseController.ByName("dotnet"). The name must contain only letters.',
      hint: 'Use the alpha constraint and register it before the default route.',
      solution: `app.MapControllerRoute(
    name: "courseByName",
    pattern: "course/{name:alpha}",
    defaults: new { controller = "Course", action = "ByName" });

public IActionResult ByName(string name) => Content($"Course: {name}");
// /course/dotnet -> Course: dotnet ; /course/dot123 -> does not match this route`,
    },
    {
      task: 'Change the default route so that the app opens StudentController.Index when the user visits "/".',
      hint: 'Change only the default values in the pattern.',
      solution: `app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Student}/{action=Index}/{id?}");`,
    },
    {
      task: 'Extend the console MvcSimulator: add a "student/top" action that shows the student with the highest marks.',
      hint: 'Add a Top() method using OrderByDescending(...).First() and a new case in the switch.',
      solution: `// StudentController
public string Top()
{
    var best = StudentRepository.GetAll().OrderByDescending(s => s.Marks).First();
    return Views.StudentDetails(best);
}
// Router switch
case "student/top":
    return new StudentController().Top();
// GET /Student/Top -> <h2>Meera</h2><p>Marks: 91</p>`,
    },
  ],
  quiz: [
    { question: 'In MVC, which component receives the request and decides which view to return?', options: ['Model', 'View', 'Controller', 'Layout'], answer: 2, explanation: 'The controller handles the request, works with the model and returns a result such as a view.' },
    { question: 'With the default route, which action handles the URL "/Student"?', options: ['StudentController.Index', 'HomeController.Student', 'HomeController.Index', 'StudentController.Details'], answer: 0, explanation: 'The controller is Student and the action falls back to the default value Index.' },
    { question: 'Which line registers MVC controllers WITH view support?', options: ['builder.Services.AddControllers();', 'builder.Services.AddRazorPages();', 'app.MapControllers();', 'builder.Services.AddControllersWithViews();'], answer: 3, explanation: 'AddControllersWithViews registers controllers plus the Razor view engine.' },
    { question: 'What does "?" mean in {id?}?', options: ['id must be numeric', 'id is optional', 'id is a query string', 'id is required'], answer: 1, explanation: 'A question mark marks a route parameter as optional.' },
    { question: 'return View() inside ProductController.Edit looks first for which file?', options: ['Views/Shared/Edit.cshtml', 'Pages/Product/Edit.cshtml', 'Views/Product/Edit.cshtml', 'Views/Edit/Product.cshtml'], answer: 2, explanation: 'Razor searches Views/{Controller}/{Action}.cshtml first, then Views/Shared.' },
  ],
};
