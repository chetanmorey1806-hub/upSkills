const couplingCode = `using System;
using System.Collections.Generic;

// ---------- 1) Tight coupling: the class creates its own dependency ----------
var oldService = new StudentServiceOld();
oldService.Register("Asha");

// ---------- 2) Dependency Injection: the dependency is GIVEN from outside ----------
IMessageSender email = new EmailSender();
IMessageSender sms = new SmsSender();

var s1 = new StudentService(email);   // inject Email
s1.Register("Ravi");

var s2 = new StudentService(sms);     // inject SMS - StudentService code did not change!
s2.Register("Meena");

// ---------- 3) Testing becomes easy: inject a fake ----------
var fake = new FakeSender();
var s3 = new StudentService(fake);
s3.Register("Test");
Console.WriteLine($"Fake sender captured {fake.Sent.Count} message(s): {fake.Sent[0]}");

// ================= types =================
interface IMessageSender
{
    void Send(string to, string message);
}

class EmailSender : IMessageSender
{
    public void Send(string to, string message) => Console.WriteLine($"[EMAIL] To {to}: {message}");
}

class SmsSender : IMessageSender
{
    public void Send(string to, string message) => Console.WriteLine($"[SMS] To {to}: {message}");
}

class FakeSender : IMessageSender
{
    public List<string> Sent { get; } = new();
    public void Send(string to, string message) => Sent.Add(to + " -> " + message);
}

// BAD: hard-coded "new EmailSender()" - cannot switch to SMS, cannot test
class StudentServiceOld
{
    private readonly EmailSender _sender = new EmailSender();

    public void Register(string name)
    {
        Console.WriteLine($"Saved {name}");
        _sender.Send(name, "Welcome!");
    }
}

// GOOD: depends on an INTERFACE that is injected through the constructor
class StudentService
{
    private readonly IMessageSender _sender;

    public StudentService(IMessageSender sender)
    {
        _sender = sender;
    }

    public void Register(string name)
    {
        Console.WriteLine($"Saved {name}");
        _sender.Send(name, "Welcome!");
    }
}`;

const lifetimeSimCode = `using System;
using System.Collections.Generic;

// A tiny DI container that behaves like ASP.NET Core's built-in one
var container = new MiniContainer();
container.Add<TransientService>(Lifetime.Transient, () => new TransientService());
container.Add<ScopedService>(Lifetime.Scoped, () => new ScopedService());
container.Add<SingletonService>(Lifetime.Singleton, () => new SingletonService());

// ASP.NET Core creates ONE scope per HTTP request
for (int request = 1; request <= 2; request++)
{
    Console.WriteLine($"--- Request {request} ---");
    var scope = container.CreateScope();

    // e.g. the controller asks once and a helper service asks again
    var t1 = scope.Get<TransientService>();
    var t2 = scope.Get<TransientService>();
    var s1 = scope.Get<ScopedService>();
    var s2 = scope.Get<ScopedService>();
    var g1 = scope.Get<SingletonService>();
    var g2 = scope.Get<SingletonService>();

    Console.WriteLine($"Transient : #{t1.Id} and #{t2.Id} same object? {ReferenceEquals(t1, t2)}");
    Console.WriteLine($"Scoped    : #{s1.Id} and #{s2.Id} same object? {ReferenceEquals(s1, s2)}");
    Console.WriteLine($"Singleton : #{g1.Id} and #{g2.Id} same object? {ReferenceEquals(g1, g2)}");
}

// ================= types =================
enum Lifetime { Transient, Scoped, Singleton }

// Every created object gets the next number: #1, #2, #3 ...
abstract class Service
{
    private static int _next = 1;
    public int Id { get; } = _next++;
}
class TransientService : Service { }
class ScopedService : Service { }
class SingletonService : Service { }

class MiniContainer
{
    private readonly Dictionary<Type, (Lifetime Life, Func<object> Factory)> _registrations = new();
    private readonly Dictionary<Type, object> _singletons = new();

    public void Add<T>(Lifetime life, Func<object> factory) => _registrations[typeof(T)] = (life, factory);

    public Scope CreateScope() => new Scope(this);

    public class Scope
    {
        private readonly MiniContainer _root;
        private readonly Dictionary<Type, object> _scoped = new();

        public Scope(MiniContainer root) => _root = root;

        public T Get<T>()
        {
            var (life, factory) = _root._registrations[typeof(T)];

            if (life == Lifetime.Transient)
                return (T)factory();                       // always new

            if (life == Lifetime.Scoped)
            {
                if (!_scoped.ContainsKey(typeof(T)))       // one per scope (request)
                    _scoped[typeof(T)] = factory();
                return (T)_scoped[typeof(T)];
            }

            if (!_root._singletons.ContainsKey(typeof(T))) // one for the whole app
                _root._singletons[typeof(T)] = factory();
            return (T)_root._singletons[typeof(T)];
        }
    }
}`;

const studentServiceCode = `// File: Models/Student.cs
namespace StudentPortal.Models;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Course { get; set; } = "";
    public int Marks { get; set; }
}

// File: Services/IStudentService.cs
using StudentPortal.Models;

namespace StudentPortal.Services;

public interface IStudentService
{
    List<Student> GetAll();
    Student? GetById(int id);
    void Add(Student student);
    int Count { get; }
}

// File: Services/InMemoryStudentService.cs
using StudentPortal.Models;

namespace StudentPortal.Services;

public class InMemoryStudentService : IStudentService
{
    // Registered as Singleton, so this list lives as long as the app runs
    private readonly List<Student> _students = new()
    {
        new Student { Id = 1, Name = "Asha Patil", Course = "BCA", Marks = 88 },
        new Student { Id = 2, Name = "Ravi Kumar", Course = "BSc", Marks = 72 },
        new Student { Id = 3, Name = "Meena Shah", Course = "BCA", Marks = 91 },
    };
    private readonly object _lock = new();   // singleton = shared by all users -> make it thread safe

    public int Count => _students.Count;

    public List<Student> GetAll()
    {
        lock (_lock) return _students.OrderBy(s => s.Id).ToList();
    }

    public Student? GetById(int id)
    {
        lock (_lock) return _students.FirstOrDefault(s => s.Id == id);
    }

    public void Add(Student student)
    {
        lock (_lock)
        {
            student.Id = _students.Count == 0 ? 1 : _students.Max(s => s.Id) + 1;
            _students.Add(student);
        }
    }
}

// File: Program.cs
using StudentPortal.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// REGISTER the service: "when someone asks for IStudentService, give InMemoryStudentService"
builder.Services.AddSingleton<IStudentService, InMemoryStudentService>();
// Later (Day 81) with EF Core you will switch to:
// builder.Services.AddScoped<IStudentService, EfStudentService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

// File: Controllers/StudentController.cs
using Microsoft.AspNetCore.Mvc;
using StudentPortal.Models;
using StudentPortal.Services;

namespace StudentPortal.Controllers;

public class StudentController : Controller
{
    private readonly IStudentService _service;

    // CONSTRUCTOR INJECTION: ASP.NET Core passes the registered implementation
    public StudentController(IStudentService service)
    {
        _service = service;
    }

    public IActionResult Index() => View(_service.GetAll());

    public IActionResult Details(int id)
    {
        var student = _service.GetById(id);
        if (student == null) return NotFound();
        return View(student);
    }

    [HttpGet]
    public IActionResult Create() => View(new Student());

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(Student student)
    {
        if (!ModelState.IsValid) return View(student);
        _service.Add(student);
        return RedirectToAction(nameof(Index));
    }

    // ACTION INJECTION: only this action needs the logger factory
    public IActionResult Stats([FromServices] ILogger<StudentController> logger)
    {
        logger.LogInformation("Stats requested, {Count} students", _service.Count);
        return Content($"Total students: {_service.Count}");
    }
}

// File: Views/Student/Index.cshtml
@model List<StudentPortal.Models.Student>
@inject StudentPortal.Services.IStudentService StudentService
@{
    ViewData["Title"] = "Students";
}
<h2>Students (@StudentService.Count)</h2>
<a asp-action="Create" class="btn btn-primary mb-2">Add Student</a>
<table class="table table-striped">
    <thead><tr><th>Id</th><th>Name</th><th>Course</th><th>Marks</th><th></th></tr></thead>
    <tbody>
    @foreach (var s in Model)
    {
        <tr>
            <td>@s.Id</td><td>@s.Name</td><td>@s.Course</td><td>@s.Marks</td>
            <td><a asp-action="Details" asp-route-id="@s.Id">Details</a></td>
        </tr>
    }
    </tbody>
</table>

// File: Views/Student/Create.cshtml
@model StudentPortal.Models.Student
<h2>Add Student</h2>
<form asp-action="Create" method="post">
    <div class="mb-2"><label asp-for="Name"></label><input asp-for="Name" class="form-control" /></div>
    <div class="mb-2"><label asp-for="Course"></label><input asp-for="Course" class="form-control" /></div>
    <div class="mb-2"><label asp-for="Marks"></label><input asp-for="Marks" class="form-control" /></div>
    <button type="submit" class="btn btn-success">Save</button>
</form>

// File: Views/Student/Details.cshtml
@model StudentPortal.Models.Student
<h2>@Model.Name</h2>
<p>Course: @Model.Course</p>
<p>Marks: @Model.Marks</p>
<a asp-action="Index">Back</a>`;

const lifetimeWebCode = `// File: Services/OperationServices.cs
namespace StudentPortal.Services;

public interface ITransientOperation { string OperationId { get; } }
public interface IScopedOperation    { string OperationId { get; } }
public interface ISingletonOperation { string OperationId { get; } }

// One class implements all three; the LIFETIME comes from the registration
public class Operation : ITransientOperation, IScopedOperation, ISingletonOperation
{
    public string OperationId { get; } = Guid.NewGuid().ToString()[..4];  // first 4 chars only
}

// File: Services/OperationLogger.cs  (a second consumer inside the same request)
namespace StudentPortal.Services;

public class OperationLogger
{
    public ITransientOperation Transient { get; }
    public IScopedOperation Scoped { get; }
    public ISingletonOperation Singleton { get; }

    public OperationLogger(ITransientOperation t, IScopedOperation s, ISingletonOperation g)
    {
        Transient = t; Scoped = s; Singleton = g;
    }
}

// File: Program.cs (registrations)
builder.Services.AddTransient<ITransientOperation, Operation>();
builder.Services.AddScoped<IScopedOperation, Operation>();
builder.Services.AddSingleton<ISingletonOperation, Operation>();
builder.Services.AddTransient<OperationLogger>();

// File: Controllers/LifetimeController.cs
using Microsoft.AspNetCore.Mvc;
using StudentPortal.Services;

namespace StudentPortal.Controllers;

public class LifetimeController : Controller
{
    private readonly ITransientOperation _transient;
    private readonly IScopedOperation _scoped;
    private readonly ISingletonOperation _singleton;
    private readonly OperationLogger _logger;

    public LifetimeController(ITransientOperation transient, IScopedOperation scoped,
                              ISingletonOperation singleton, OperationLogger logger)
    {
        _transient = transient; _scoped = scoped; _singleton = singleton; _logger = logger;
    }

    public IActionResult Index()
    {
        string text =
            $"Transient : controller={_transient.OperationId}  logger={_logger.Transient.OperationId}" + Environment.NewLine +
            $"Scoped    : controller={_scoped.OperationId}  logger={_logger.Scoped.OperationId}" + Environment.NewLine +
            $"Singleton : controller={_singleton.OperationId}  logger={_logger.Singleton.OperationId}";
        return Content(text);
    }
}`;

export default {
  id: 'day-072-dependency-injection-service-lifetimes',
  title: 'Dependency Injection and Service Lifetimes: Transient, Scoped, Singleton',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 72,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Dependency Injection (DI) is the backbone of every ASP.NET Core application. Today you learn why "new-ing" dependencies inside a class is a problem, how the built-in DI container registers and creates services, and how the three lifetimes (Transient, Scoped, Singleton) behave. You will simulate the container in a console app, then build a real StudentService that is injected into a StudentController and a Razor view.`,
  objectives: [
    'Explain Dependency Injection, Inversion of Control and loose coupling with a real-world analogy',
    'Register services in Program.cs with AddTransient, AddScoped and AddSingleton and consume them by constructor, action ([FromServices]) and view (@inject) injection',
    'Predict how many objects are created for each lifetime inside one request and across requests',
    'Avoid common DI mistakes: captive dependencies, resolving scoped services from the root, non-thread-safe singletons',
    'Build an IStudentService / InMemoryStudentService pair and inject it into StudentController',
  ],
  theory: [
    {
      heading: 'What is Dependency Injection (DI)?',
      content: `A **dependency** is any object that another class needs to do its job. A \`StudentController\` needs a \`StudentService\`; a \`StudentService\` needs an \`EmailSender\`.

**Without DI** the class creates its dependency itself with \`new\`:
\`private readonly EmailSender _sender = new EmailSender();\`
This is **tight coupling**: you cannot switch to SMS, you cannot test without really sending e-mails, and every change ripples through the code.

**With DI** the class only says *what it needs* (usually an **interface**) in its constructor, and someone outside **gives (injects)** the real object. That "someone" in ASP.NET Core is the **DI container** (also called the *service provider* or *IoC container*).

Real-world analogy: a **mobile phone and its charger**. The phone does not have a charger welded inside it; it has a USB-C port (the *interface*). You can plug in any compatible charger (the *implementation*) — a fast charger at home, a power bank on the road, a test charger in the factory. The phone is *loosely coupled* to the charger.

**Inversion of Control (IoC)**: the class no longer controls the creation of its dependencies; control is inverted to the container. DI is the most common way to achieve IoC and it is the **D in SOLID** (Dependency Inversion Principle: depend on abstractions, not concrete classes).`,
      points: [
        'Loose coupling: change implementation in ONE line of Program.cs',
        'Testability: inject fakes/mocks in unit tests (Day 114)',
        'Lifetime management: the container creates AND disposes objects for you',
        'Single place of configuration: all registrations are in Program.cs',
      ],
    },
    {
      heading: 'The built-in container: register in Program.cs, consume anywhere',
      content: `ASP.NET Core has a DI container built in (namespace \`Microsoft.Extensions.DependencyInjection\`). You use it in two steps:

**1. Register** services on \`builder.Services\` (an \`IServiceCollection\`) BEFORE \`builder.Build()\`.
**2. Consume** them — the framework resolves them automatically:

- **Constructor injection** (most common) in controllers, services, middleware, filters.
- **Action injection** with \`[FromServices]\` on an action parameter — when only one action needs it.
- **View injection** with \`@inject IStudentService StudentService\` in a .cshtml file.
- **Manual resolution** with \`app.Services\` or \`HttpContext.RequestServices.GetService<T>()\` — avoid in normal code (Service Locator anti-pattern).

Framework services such as \`ILogger<T>\`, \`IConfiguration\`, \`IWebHostEnvironment\` and \`IHttpContextAccessor\` (after \`AddHttpContextAccessor()\`) are already registered — you can inject them straight away.`,
      syntax: `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddScoped<IStudentService, StudentService>();     // interface -> class
builder.Services.AddSingleton<AppClock>();                          // concrete class only
builder.Services.AddTransient<IMessageSender>(sp =>                 // factory method
    new SmsSender(sp.GetRequiredService<IConfiguration>()["Sms:ApiKey"]!));

var app = builder.Build();   // after this line registrations are LOCKED`,
    },
    {
      heading: 'Service lifetimes: Transient, Scoped, Singleton',
      content: `When you register a service you also choose **how long an instance lives**:

| Lifetime | Method | New object is created... | Typical use |
|---|---|---|---|
| **Transient** | \`AddTransient\` | **every time** it is requested (even twice in the same request) | light, stateless helpers: formatters, validators, mappers |
| **Scoped** | \`AddScoped\` | **once per scope** – in a web app, once per **HTTP request** | \`DbContext\`, repositories, unit of work, per-request user info |
| **Singleton** | \`AddSingleton\` | **once for the whole application** (first time it is requested) | configuration objects, in-memory cache, \`HttpClient\` factories, counters |

Real-world analogy — a **restaurant**:
- **Transient** = paper napkins: every time you ask, you get a new one.
- **Scoped** = your table's water jug: the same jug for your whole meal (request), a new jug for the next customer.
- **Singleton** = the restaurant's kitchen: one kitchen serves every customer all day.

Disposal: the container calls \`Dispose()\` on Transient and Scoped objects at the **end of the request** and on Singletons when the **app shuts down**.`,
      points: [
        'Transient → many objects, Scoped → one per request, Singleton → one forever',
        'Singletons are shared by ALL users at the same time → must be thread-safe (use lock or ConcurrentDictionary)',
        'EF Core AddDbContext registers the DbContext as Scoped by default',
      ],
    },
    {
      heading: 'Lifetime rules and the captive dependency problem',
      content: `A service may only depend on services that live **as long or longer** than itself:

| Consumer (row) needs (column) | Transient | Scoped | Singleton |
|---|---|---|---|
| Transient | OK | OK | OK |
| Scoped | OK | OK | OK |
| Singleton | careful | **ERROR** | OK |

If a **Singleton** takes a **Scoped** service (for example a DbContext) in its constructor, that scoped object gets "captured" and lives forever — it is shared between users and threads and its data becomes stale. This is called a **captive dependency**. In the Development environment ASP.NET Core turns on **scope validation** and throws at startup:

\`InvalidOperationException: Cannot consume scoped service 'IStudentRepository' from singleton 'ReportCache'.\`

**Fixes:** make the consumer Scoped, or inject \`IServiceScopeFactory\` into the singleton and create a scope when needed:
\`using var scope = _scopeFactory.CreateScope(); var repo = scope.ServiceProvider.GetRequiredService<IStudentRepository>();\``,
      tip: 'Rule of thumb for beginners: use Scoped for anything touching the database, Singleton only for stateless or thread-safe shared things, Transient for small helpers.',
    },
    {
      heading: 'More registration options',
      content: `- **Multiple implementations**: register \`IMessageSender\` → \`EmailSender\` and \`IMessageSender\` → \`SmsSender\`. Injecting \`IMessageSender\` gives the **last** one registered; injecting \`IEnumerable<IMessageSender>\` gives **all** of them (send on every channel).
- **TryAdd**: \`builder.Services.TryAddScoped<IStudentService, StudentService>()\` registers only if nothing is registered yet (namespace \`Microsoft.Extensions.DependencyInjection.Extensions\`).
- **Keyed services (.NET 8+)**: \`AddKeyedSingleton<IMessageSender, SmsSender>("sms")\` and consume with \`[FromKeyedServices("sms")] IMessageSender sender\`.
- **Extension methods to group registrations**: \`public static IServiceCollection AddStudentModule(this IServiceCollection services) { ...; return services; }\` then \`builder.Services.AddStudentModule();\` keeps Program.cs clean.
- **Instance registration**: \`builder.Services.AddSingleton(new AppInfo("Student Portal"))\` – you created it, the container will NOT dispose it.`,
    },
    {
      heading: 'Visual Studio workflow and common errors',
      content: `**Adding a service in Visual Studio**
1. Right-click the project > **Add > New Folder** > name it \`Services\`.
2. Right-click Services > **Add > New Item > Interface** > \`IStudentService.cs\`.
3. Right-click Services > **Add > Class** > \`InMemoryStudentService.cs\`, type \`: IStudentService\`, press **Ctrl+.** > *Implement interface*.
4. Register it in Program.cs, inject it into the controller constructor (type the parameter, then **Ctrl+.** > *Create and assign field '_service'*).

**Common runtime errors**
- \`Unable to resolve service for type 'IStudentService' while attempting to activate 'StudentController'\` → you forgot to register it (or registered the class but injected the interface).
- \`Cannot consume scoped service ... from singleton ...\` → captive dependency, see above.
- \`A circular dependency was detected\` → A needs B and B needs A; extract a third service.
- \`Cannot resolve scoped service ... from root provider\` → you resolved a scoped service from \`app.Services\`; create a scope with \`app.Services.CreateScope()\`.`,
    },
  ],
  examples: [
    {
      title: 'Tight coupling vs constructor injection (console)',
      scenario: 'A StudentService must send a welcome message. First we hard-code EmailSender, then we inject an IMessageSender so we can switch to SMS or a fake without touching StudentService.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#) > Next',
        'Name it DiBasicsDemo, Framework .NET 8 or .NET 10 > Create',
        'Replace all code in Program.cs with the code below',
        'Press Ctrl+F5 to run without debugging',
        'Put a breakpoint (F9) on "var s2 = new StudentService(sms);" and press F5, then F11 to step into Register and see which Send runs',
      ],
      code: couplingCode,
      csharp: { files: { 'Program.cs': couplingCode }, stdin: '' },
      result: `Saved Asha
[EMAIL] To Asha: Welcome!
Saved Ravi
[EMAIL] To Ravi: Welcome!
Saved Meena
[SMS] To Meena: Welcome!
Saved Test
Fake sender captured 1 message(s): Test -> Welcome!`,
      explanation: `StudentServiceOld can only ever send e-mails because it calls new EmailSender() itself. StudentService asks for an IMessageSender in its constructor, so the CALLER decides which implementation to pass: Email for Ravi, SMS for Meena and a FakeSender for testing (nothing is really sent; the fake just records the message). In ASP.NET Core the caller is the DI container, and the choice is made once in Program.cs.`,
    },
    {
      title: 'Simulating Transient, Scoped and Singleton with a mini container (console)',
      scenario: 'Before using the real container, we build a 40-line container that follows the same rules, and "send" two requests through it to see exactly which objects are created.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it LifetimeSimulator',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Change the loop to 3 requests and predict the numbers before running again',
      ],
      code: lifetimeSimCode,
      csharp: { files: { 'Program.cs': lifetimeSimCode }, stdin: '' },
      result: `--- Request 1 ---
Transient : #1 and #2 same object? False
Scoped    : #3 and #3 same object? True
Singleton : #4 and #4 same object? True
--- Request 2 ---
Transient : #5 and #6 same object? False
Scoped    : #7 and #7 same object? True
Singleton : #4 and #4 same object? True`,
      explanation: `Every object gets the next number when it is constructed. Request 1: the two transient requests create #1 and #2 (always new); the scoped service is created once (#3) and reused inside the scope; the singleton is created once (#4). Request 2 gets a NEW scope, so transients are #5, #6 and the scoped one is #7, but the singleton is still #4 because it is stored in the root container, not in the scope. This is exactly what ASP.NET Core does, with one scope per HTTP request.`,
    },
    {
      title: 'Create a StudentService and inject it into StudentController (ASP.NET Core MVC)',
      scenario: 'The college portal needs a student list, details page and add form. Data access is placed in a service behind an interface and injected into the controller and the view.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > name it StudentPortal > .NET 8/10, Authentication: None > Create',
        'Right-click Models > Add > Class > Student.cs and paste the model',
        'Right-click project > Add > New Folder "Services"; add IStudentService.cs (Add > New Item > Interface) and InMemoryStudentService.cs (Add > Class)',
        'Open Program.cs and add builder.Services.AddSingleton<IStudentService, InMemoryStudentService>(); before builder.Build()',
        'Right-click Controllers > Add > Controller > MVC Controller - Empty > StudentController.cs; paste the code',
        'Right-click inside Index action > Add View > Razor View - Empty > Index.cshtml; repeat for Create and Details; paste the markup',
        'Press Ctrl+F5 and open https://localhost:<port>/Student',
        'Experiment: comment out the AddSingleton line and run again to see the "Unable to resolve service" error',
      ],
      code: studentServiceCode,
      result: `/Student shows "Students (3)" and a table:
Id | Name       | Course | Marks
1  | Asha Patil | BCA    | 88
2  | Ravi Kumar | BSc    | 72
3  | Meena Shah | BCA    | 91

After adding "Kiran Rao, BCOM, 65" via /Student/Create you are redirected to /Student and see "Students (4)" with Kiran as Id 4.
Refreshing or opening another browser still shows 4 students (Singleton list is shared until the app restarts).

/Student/Stats shows: Total students: 4
and the Visual Studio Output / console window logs:
info: StudentPortal.Controllers.StudentController[0]
      Stats requested, 4 students

Without the registration line:
InvalidOperationException: Unable to resolve service for type 'StudentPortal.Services.IStudentService' while attempting to activate 'StudentPortal.Controllers.StudentController'.`,
      explanation: `The controller never writes "new InMemoryStudentService()". It asks for IStudentService, and the container supplies the registered implementation. The same instance is injected into the view with @inject. Because the in-memory list must survive between requests, the service is a Singleton and uses lock for thread safety. When we move to EF Core (Day 81) we only write EfStudentService and change one registration line to AddScoped — the controller and views stay the same. That is the power of DI.`,
    },
    {
      title: 'See lifetimes live in a web request',
      scenario: 'Register the same Operation class three times with different lifetimes, inject it into a controller AND into a helper service, and compare the IDs across two browser refreshes.',
      steps: [
        'In the StudentPortal project add Services/OperationServices.cs and Services/OperationLogger.cs',
        'Add the four registration lines to Program.cs (before builder.Build())',
        'Add Controllers/LifetimeController.cs',
        'Press Ctrl+F5, open /Lifetime, then press F5 in the browser to refresh',
        'Experiment: change OperationLogger to AddSingleton and IScopedOperation to stay Scoped – run in Development and read the startup error',
      ],
      code: lifetimeWebCode,
      result: `First request (IDs are random GUID prefixes, yours will differ):
Transient : controller=3f1a  logger=9c27
Scoped    : controller=b604  logger=b604
Singleton : controller=e81d  logger=e81d

After refresh (second request):
Transient : controller=51ce  logger=0a9b
Scoped    : controller=7d22  logger=7d22
Singleton : controller=e81d  logger=e81d

If OperationLogger is registered as Singleton (Development environment):
System.AggregateException: Some services are not able to be constructed
 (Error while validating the service descriptor 'ServiceType: OperationLogger Lifetime: Singleton':
  Cannot consume scoped service 'IScopedOperation' from singleton 'OperationLogger'.)`,
      explanation: `Transient: controller and logger get different IDs, and both change every request. Scoped: controller and logger share the same ID inside one request, but a new ID appears on refresh. Singleton: the same ID forever (until the app restarts). Making OperationLogger a singleton would capture a scoped object, so scope validation (on by default in Development) stops the app at startup — a safety net that tells you about the captive dependency before it becomes a bug in production.`,
    },
  ],
  interview: [
    { q: 'What is Dependency Injection?', a: 'A design pattern where a class receives the objects it depends on from outside (usually through its constructor) instead of creating them with new. It gives loose coupling, easier testing and central configuration.', level: 'Easy' },
    { q: 'What is the difference between DI and IoC?', a: 'Inversion of Control is the general principle that a framework/container controls object creation and flow instead of your code. Dependency Injection is a specific technique to implement IoC by injecting dependencies.', level: 'Medium' },
    { q: 'Name the three service lifetimes in ASP.NET Core.', a: 'Transient (new instance every request for the service), Scoped (one instance per scope / HTTP request), Singleton (one instance for the application lifetime).', level: 'Easy' },
    { q: 'Which lifetime does AddDbContext use and why?', a: 'Scoped. A DbContext tracks changes and is not thread-safe, so each HTTP request gets its own instance which is disposed at the end of the request.', level: 'Medium' },
    { q: 'What is a captive dependency?', a: 'When a longer-living service (e.g. Singleton) holds a shorter-living one (e.g. Scoped) in its constructor. The scoped object is captured and lives forever, shared between requests and threads. ASP.NET Core throws "Cannot consume scoped service from singleton" when scope validation is on.', level: 'Hard' },
    { q: 'Output question: A Transient service is injected into a controller and into a service used by the same controller. How many instances exist in one request? What if it were Scoped?', a: 'Transient: 2 instances (one per injection). Scoped: 1 instance shared by both in that request.', level: 'Medium' },
    { q: 'If you register IMessageSender twice (EmailSender then SmsSender), what do you get when you inject IMessageSender? And IEnumerable<IMessageSender>?', a: 'IMessageSender resolves to the LAST registration (SmsSender). IEnumerable<IMessageSender> gives both, in registration order.', level: 'Medium' },
    { q: 'What are the three ways to consume a service in MVC?', a: 'Constructor injection, action injection with [FromServices], and view injection with @inject in Razor. (Plus manual resolution through IServiceProvider, which should be avoided.)', level: 'Easy' },
    { q: 'Why must singleton services be thread-safe?', a: 'One instance serves all concurrent requests, so multiple threads may call it at the same time. Shared mutable state must be protected with lock, Interlocked or concurrent collections.', level: 'Medium' },
    { q: 'How do you use a scoped service inside a singleton or background service?', a: 'Inject IServiceScopeFactory, create a scope with CreateScope() inside a using block, and resolve the scoped service from scope.ServiceProvider.', level: 'Hard' },
    { q: 'What error do you get when a service is not registered?', a: 'InvalidOperationException: Unable to resolve service for type X while attempting to activate Y.', level: 'Easy' },
    { q: 'What are keyed services?', a: 'A .NET 8 feature to register several implementations of the same interface under different keys (AddKeyedScoped<IMessageSender, SmsSender>("sms")) and pick one with [FromKeyedServices("sms")].', level: 'Hard' },
    { q: 'Does the container dispose services you register with AddSingleton(new MyService())?', a: 'No. Instances you create yourself and pass in are not disposed by the container; instances the container creates (type or factory registrations) are disposed when their scope or the app ends.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create an ICourseService with GetAll() and Add(Course c), implement it as InMemoryCourseService, register it and build a CourseController with Index and Create.',
      hint: 'Copy the StudentService pattern: interface in Services, Singleton registration, constructor injection, RedirectToAction after POST.',
      solution: `public interface ICourseService { List<Course> GetAll(); void Add(Course c); }
public class InMemoryCourseService : ICourseService
{
    private readonly List<Course> _courses = new() { new Course { Id = 1, Title = "BCA" } };
    public List<Course> GetAll() => _courses.ToList();
    public void Add(Course c) { c.Id = _courses.Max(x => x.Id) + 1; _courses.Add(c); }
}
// Program.cs
builder.Services.AddSingleton<ICourseService, InMemoryCourseService>();
// CourseController
public class CourseController(ICourseService service) : Controller   // C# 12 primary constructor
{
    public IActionResult Index() => View(service.GetAll());
    [HttpGet] public IActionResult Create() => View(new Course());
    [HttpPost] public IActionResult Create(Course c) { service.Add(c); return RedirectToAction(nameof(Index)); }
}`,
    },
    {
      task: 'Write a VisitCounter service that counts page visits. Try it as Transient, Scoped and Singleton and record what /Home/Index shows after 3 refreshes.',
      hint: 'public int Increment() => ++_count; Inject it into HomeController and return Content(counter.Increment().ToString()).',
      solution: `public class VisitCounter { private int _count; public int Increment() => Interlocked.Increment(ref _count); }
// Transient -> always 1, Scoped -> always 1 (new per request), Singleton -> 1, 2, 3 ...
builder.Services.AddSingleton<VisitCounter>();
public IActionResult Index([FromServices] VisitCounter c) => Content($"Visits: {c.Increment()}");`,
    },
    {
      task: 'Register EmailSender and SmsSender for IMessageSender and inject IEnumerable<IMessageSender> into a NotificationService that sends a message on every channel.',
      hint: 'Two AddTransient<IMessageSender, ...> lines; loop through the enumerable.',
      solution: `builder.Services.AddTransient<IMessageSender, EmailSender>();
builder.Services.AddTransient<IMessageSender, SmsSender>();
builder.Services.AddScoped<NotificationService>();

public class NotificationService(IEnumerable<IMessageSender> senders)
{
    public void NotifyAll(string to, string msg)
    {
        foreach (var s in senders) s.Send(to, msg);   // Email first, then SMS
    }
}`,
    },
    {
      task: 'Extend the console mini container: add a new class ReportService registered as Singleton whose factory asks the scope for ScopedService. Print the IDs for two requests and explain why this is a captive dependency.',
      hint: 'The factory runs only once, so the ScopedService from request 1 is kept forever.',
      solution: `The ReportService is created during request 1 and stores ScopedService #n from that request. In request 2 the scope creates a new ScopedService, but ReportService still holds the OLD one from request 1 - the scoped object has become "captive" and effectively a singleton. ASP.NET Core's scope validation prevents this by throwing at startup.`,
    },
    {
      task: 'Move all registrations of the StudentPortal into an extension method AddStudentPortalServices() in a new file ServiceCollectionExtensions.cs.',
      hint: 'public static class with a static method that takes "this IServiceCollection services" and returns services.',
      solution: `public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddStudentPortalServices(this IServiceCollection services)
    {
        services.AddSingleton<IStudentService, InMemoryStudentService>();
        services.AddTransient<IMessageSender, EmailSender>();
        return services;
    }
}
// Program.cs
builder.Services.AddStudentPortalServices();`,
    },
  ],
  quiz: [
    {
      question: 'Which lifetime creates exactly one instance per HTTP request?',
      options: ['Transient', 'Scoped', 'Singleton', 'Static'],
      answer: 1,
      explanation: 'Scoped services are created once per scope, and ASP.NET Core creates one scope per request.',
    },
    {
      question: 'Where are services registered in a .NET 8/10 ASP.NET Core app?',
      options: ['In the controller constructor', 'In appsettings.json', 'On builder.Services in Program.cs before builder.Build()', 'In _ViewImports.cshtml'],
      answer: 2,
      explanation: 'Registrations are added to the IServiceCollection (builder.Services) before the app is built.',
    },
    {
      question: 'A Singleton service takes a Scoped DbContext in its constructor. What happens in Development?',
      options: ['It works and is the recommended pattern', 'The app throws at startup: cannot consume scoped service from singleton', 'The DbContext becomes Transient automatically', 'A compile-time error occurs'],
      answer: 1,
      explanation: 'Scope validation detects the captive dependency and throws an InvalidOperationException when the app starts.',
    },
    {
      question: 'Which attribute injects a service directly into an action method parameter?',
      options: ['[FromServices]', '[FromBody]', '[Inject]', '[FromQuery]'],
      answer: 0,
      explanation: '[FromServices] tells model binding to resolve the parameter from the DI container.',
    },
    {
      question: 'A Transient service is requested 3 times in request 1 and 2 times in request 2. How many instances are created in total?',
      options: ['1', '2', '3', '5'],
      answer: 3,
      explanation: 'Transient means a new instance on every resolution: 3 + 2 = 5.',
    },
  ],
};
