const filterSimCode = `using System;

var pipeline = new FilterPipeline();
pipeline.Run("Index", isLoggedIn: true, actionThrows: false);
pipeline.Run("Delete", isLoggedIn: false, actionThrows: false);
pipeline.Run("Report", isLoggedIn: true, actionThrows: true);

class FilterPipeline
{
    public void Run(string action, bool isLoggedIn, bool actionThrows)
    {
        Console.WriteLine($"=== Request: /Student/{action} ===");

        // 1. AUTHORIZATION filter - runs first, can short-circuit
        Console.WriteLine("[Authorization] checking user...");
        if (!isLoggedIn)
        {
            Console.WriteLine("[Authorization] not logged in -> short-circuit: redirect to /Account/Login");
            Console.WriteLine();
            return;
        }

        // 2. RESOURCE filter - before
        Console.WriteLine("[Resource] before (e.g. look in cache)");
        Console.WriteLine("   (model binding + validation happen here)");

        // 3. ACTION filter around the action method
        Console.WriteLine("[Action] OnActionExecuting");
        string result = "";
        Exception? error = null;
        try
        {
            result = ExecuteAction(action, actionThrows);
        }
        catch (Exception ex)
        {
            error = ex;
        }
        Console.WriteLine(error is null
            ? "[Action] OnActionExecuted"
            : "[Action] OnActionExecuted (context.Exception is set)");

        if (error is not null)
        {
            // 4. EXCEPTION filter handles errors from the action / action filters
            Console.WriteLine($"[Exception] caught '{error.Message}' -> ViewResult(Error)");
            Console.WriteLine("   rendering Error view (result filters are skipped)");
        }
        else
        {
            // 5. RESULT filter around the execution of the result (view rendering)
            Console.WriteLine("[Result] OnResultExecuting");
            Console.WriteLine($"   rendering {result}");
            Console.WriteLine("[Result] OnResultExecuted");
        }

        // 2. RESOURCE filter - after
        Console.WriteLine("[Resource] after (e.g. save to cache)");
        Console.WriteLine();
    }

    private static string ExecuteAction(string action, bool throws)
    {
        Console.WriteLine($"   >> StudentController.{action}() runs");
        if (throws)
            throw new InvalidOperationException("Report service unavailable");
        return $"View({action})";
    }
}`;

const orderSimCode = `using System;
using System.Collections.Generic;
using System.Linq;

// Filters registered at 3 scopes. Default order: Global -> Controller -> Action (before),
// and the REVERSE on the way out. The Order property overrides the scope rule.
var filters = new List<Filter>
{
    new("ControllerLog", Scope.Controller, 0),
    new("GlobalLog", Scope.Global, 0),
    new("ActionLog", Scope.Action, 0),
};

RunAction(filters);

Console.WriteLine();
Console.WriteLine("Now ActionLog gets Order = -1:");
filters[2] = filters[2] with { Order = -1 };
RunAction(filters);

static void RunAction(List<Filter> filters)
{
    // sort by Order first, then by scope (Global=0, Controller=1, Action=2)
    var sorted = filters.OrderBy(f => f.Order).ThenBy(f => (int)f.Scope).ToList();

    foreach (var f in sorted)
        Console.WriteLine($"{f.Name}.OnActionExecuting");
    Console.WriteLine("   >> action method runs");
    for (int i = sorted.Count - 1; i >= 0; i--)
        Console.WriteLine($"{sorted[i].Name}.OnActionExecuted");
}

enum Scope { Global = 0, Controller = 1, Action = 2 }
record Filter(string Name, Scope Scope, int Order);`;

const loggingFilterCode = `// File: Filters/LogActionFilter.cs   (synchronous action + result filter, used as an attribute)
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc.Filters;

namespace StudentPortal.Filters;

public class LogActionFilter : IActionFilter, IResultFilter
{
    private readonly ILogger<LogActionFilter> _logger;
    private Stopwatch? _watch;

    public LogActionFilter(ILogger<LogActionFilter> logger) => _logger = logger;

    // BEFORE the action: arguments are already model-bound
    public void OnActionExecuting(ActionExecutingContext context)
    {
        _watch = Stopwatch.StartNew();
        string controller = context.RouteData.Values["controller"]?.ToString() ?? "";
        string action = context.RouteData.Values["action"]?.ToString() ?? "";
        string args = string.Join(", ", context.ActionArguments.Select(a => $"{a.Key}={a.Value}"));

        _logger.LogInformation("Executing {Controller}.{Action}({Args})", controller, action, args);

        if (!context.ModelState.IsValid)
            _logger.LogWarning("ModelState invalid for {Action}", action);
    }

    // AFTER the action, BEFORE the result (view) executes
    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.Exception != null)
            _logger.LogError("Action threw {Type}", context.Exception.GetType().Name);
        else
            _logger.LogInformation("Action returned {Result}", context.Result?.GetType().Name);
    }

    public void OnResultExecuting(ResultExecutingContext context)
    {
        context.HttpContext.Response.Headers["X-Filter"] = "LogActionFilter";   // still allowed here
    }

    public void OnResultExecuted(ResultExecutedContext context)
    {
        _watch?.Stop();
        _logger.LogInformation("Finished in {Ms} ms with status {Status}",
            _watch?.ElapsedMilliseconds, context.HttpContext.Response.StatusCode);
    }
}

// File: Filters/TimingAsyncFilter.cs   (async version - ONE method wraps before + after)
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc.Filters;

namespace StudentPortal.Filters;

public class TimingAsyncFilter : IAsyncActionFilter
{
    private readonly ILogger<TimingAsyncFilter> _logger;
    public TimingAsyncFilter(ILogger<TimingAsyncFilter> logger) => _logger = logger;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var sw = Stopwatch.StartNew();
        ActionExecutedContext executed = await next();    // runs the action (and later filters)
        sw.Stop();
        if (sw.ElapsedMilliseconds > 500)
            _logger.LogWarning("SLOW action {Action}: {Ms} ms", context.ActionDescriptor.DisplayName, sw.ElapsedMilliseconds);
    }
}

// File: Filters/ValidateModelAttribute.cs   (attribute filter WITHOUT DI)
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace StudentPortal.Filters;

public class ValidateModelAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            // short-circuit: the action never runs, the same view is shown again with errors
            var controller = (Controller)context.Controller;
            context.Result = controller.View(context.ActionArguments.Values.FirstOrDefault());
        }
    }
}

// File: Program.cs  - three ways to apply filters
using StudentPortal.Filters;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add<TimingAsyncFilter>();          // 1) GLOBAL: every action of every controller
});
builder.Services.AddScoped<LogActionFilter>();        // needed for [ServiceFilter]

var app = builder.Build();
// ... usual middleware ...

// File: Controllers/StudentController.cs
using Microsoft.AspNetCore.Mvc;
using StudentPortal.Filters;
using StudentPortal.Models;
using StudentPortal.Services;

namespace StudentPortal.Controllers;

[ServiceFilter(typeof(LogActionFilter))]              // 2) CONTROLLER: all actions here (resolved from DI)
public class StudentController : Controller
{
    private readonly IStudentService _service;
    public StudentController(IStudentService service) => _service = service;

    public IActionResult Index() => View(_service.GetAll());

    public IActionResult Details(int id)
    {
        var s = _service.GetById(id);
        return s == null ? NotFound() : View(s);
    }

    [HttpPost, ValidateAntiForgeryToken]
    [ValidateModel]                                    // 3) ACTION: only this action
    public IActionResult Create(Student student)
    {
        _service.Add(student);                         // no "if (!ModelState.IsValid)" needed any more
        return RedirectToAction(nameof(Index));
    }
}`;

const authFilterCode = `// File: Filters/RequireLoginAttribute.cs   (custom AUTHORIZATION filter using session)
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace StudentPortal.Filters;

public class RequireLoginAttribute : Attribute, IAuthorizationFilter
{
    public string? Role { get; set; }      // optional: [RequireLogin(Role = "Admin")]

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // respect [AllowAnonymous] on an action
        if (context.ActionDescriptor.EndpointMetadata.OfType<Microsoft.AspNetCore.Authorization.IAllowAnonymous>().Any())
            return;

        var session = context.HttpContext.Session;
        string? user = session.GetString("UserName");
        string? role = session.GetString("Role");

        if (user == null)
        {
            string returnUrl = context.HttpContext.Request.Path;
            context.Result = new RedirectToActionResult("Login", "Account", new { returnUrl });   // short-circuit
            return;
        }

        if (Role != null && role != Role)
        {
            context.Result = new ViewResult { ViewName = "AccessDenied", StatusCode = 403 };
        }
    }
}

// File: Controllers/AccountController.cs  (very simple demo login - real apps use Identity, Day 110)
using Microsoft.AspNetCore.Mvc;

namespace StudentPortal.Controllers;

public class AccountController : Controller
{
    [HttpGet]
    public IActionResult Login(string? returnUrl) { ViewBag.ReturnUrl = returnUrl; return View(); }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Login(string userName, string password, string? returnUrl)
    {
        // DEMO ONLY: hard-coded users
        if ((userName == "admin" && password == "admin123") || (userName == "asha" && password == "asha123"))
        {
            HttpContext.Session.SetString("UserName", userName);
            HttpContext.Session.SetString("Role", userName == "admin" ? "Admin" : "Student");
            if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl)) return Redirect(returnUrl);
            return RedirectToAction("Index", "Student");
        }
        ViewBag.Error = "Invalid user name or password";
        return View();
    }

    public IActionResult Logout() { HttpContext.Session.Clear(); return RedirectToAction(nameof(Login)); }
}

// File: Controllers/StudentController.cs
[RequireLogin]                                  // every action needs a logged-in user
public class StudentController : Controller
{
    [AllowAnonymous]                            // ...except this one
    public IActionResult About() => Content("Public page");

    public IActionResult Index() => View(_service.GetAll());

    [RequireLogin(Role = "Admin")]              // only admins
    public IActionResult Delete(int id) => View(_service.GetById(id));
}

// File: Views/Account/Login.cshtml
<h2>Login</h2>
@if (ViewBag.Error != null) { <div class="alert alert-danger">@ViewBag.Error</div> }
<form asp-action="Login" method="post">
    <input type="hidden" name="returnUrl" value="@ViewBag.ReturnUrl" />
    <input name="userName" class="form-control mb-2" placeholder="User name" />
    <input name="password" type="password" class="form-control mb-2" placeholder="Password" />
    <button class="btn btn-primary">Login</button>
</form>

// File: Views/Shared/AccessDenied.cshtml
<h2 class="text-danger">Access denied</h2>
<p>You do not have permission to open this page.</p>

// Program.cs needs session: AddDistributedMemoryCache(), AddSession(), app.UseSession() (Day 75)`;

const exceptionResourceCode = `// File: Filters/HandleExceptionFilter.cs   (EXCEPTION filter)
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace StudentPortal.Filters;

public class HandleExceptionFilter : IExceptionFilter
{
    private readonly ILogger<HandleExceptionFilter> _logger;
    private readonly IModelMetadataProvider _metadata;

    public HandleExceptionFilter(ILogger<HandleExceptionFilter> logger, IModelMetadataProvider metadata)
    {
        _logger = logger; _metadata = metadata;
    }

    public void OnException(ExceptionContext context)
    {
        _logger.LogError(context.Exception, "Unhandled error in {Action}", context.ActionDescriptor.DisplayName);

        var viewData = new ViewDataDictionary(_metadata, context.ModelState)
        {
            ["Message"] = context.Exception is KeyNotFoundException
                ? "The record you are looking for does not exist."
                : "Something went wrong. Our team has been informed."
        };
        context.Result = new ViewResult { ViewName = "FriendlyError", ViewData = viewData, StatusCode = 500 };
        context.ExceptionHandled = true;      // stop the exception from bubbling to middleware
    }
}

// File: Filters/AddHeaderResultFilter.cs   (RESULT filter as attribute with a parameter)
using Microsoft.AspNetCore.Mvc.Filters;

namespace StudentPortal.Filters;

public class AddHeaderAttribute : ResultFilterAttribute
{
    private readonly string _name;
    private readonly string _value;
    public AddHeaderAttribute(string name, string value) { _name = name; _value = value; }

    public override void OnResultExecuting(ResultExecutingContext context)
    {
        context.HttpContext.Response.Headers[_name] = _value;
        base.OnResultExecuting(context);
    }
}

// File: Filters/SimpleCacheResourceFilter.cs   (RESOURCE filter - runs before model binding)
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace StudentPortal.Filters;

public class SimpleCacheResourceFilter : IResourceFilter
{
    private static readonly Dictionary<string, IActionResult> Cache = new();

    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        string key = context.HttpContext.Request.Path;
        if (Cache.TryGetValue(key, out var cached))
            context.Result = cached;          // short-circuit: no model binding, no action
    }

    public void OnResourceExecuted(ResourceExecutedContext context)
    {
        string key = context.HttpContext.Request.Path;
        if (context.Result is ContentResult content && !Cache.ContainsKey(key))
            Cache[key] = content;
    }
}

// File: Program.cs
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add<HandleExceptionFilter>();     // global exception filter (DI works for global type filters)
});

// File: Controllers/ReportController.cs
using Microsoft.AspNetCore.Mvc;
using StudentPortal.Filters;

namespace StudentPortal.Controllers;

[AddHeader("X-Module", "Reports")]
public class ReportController : Controller
{
    [TypeFilter(typeof(SimpleCacheResourceFilter))]   // TypeFilter: creates the filter, DI for ctor args
    public IActionResult Toppers()
    {
        return Content($"Toppers report generated at {DateTime.Now:HH:mm:ss}");
    }

    public IActionResult Missing(int id) => throw new KeyNotFoundException($"Report {id}");

    public IActionResult Crash() => throw new InvalidOperationException("Report engine failed");
}

// File: Views/Shared/FriendlyError.cshtml
<h2 class="text-danger">Sorry!</h2>
<p>@ViewData["Message"]</p>
<a asp-controller="Home" asp-action="Index">Back to home</a>`;

export default {
  id: 'day-076-filters-authorization-action-result-exception',
  title: 'Filters: Authorization, Resource, Action, Exception and Result Filters',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 76,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Filters let you run code before or after specific stages of an MVC request – authorization, model binding, the action method, and the result – without repeating that code in every action. Today you learn the five filter types and their execution order, synchronous vs async filters, how to apply them globally, per controller and per action, how to use DI with ServiceFilter and TypeFilter, and how to short-circuit. You will build a custom logging filter, a session-based login filter, a validation filter, an exception filter and a simple resource cache.`,
  objectives: [
    'Name the five filter types and explain the filter pipeline order including short-circuiting',
    'Write synchronous (IActionFilter) and asynchronous (IAsyncActionFilter) filters and attribute filters (ActionFilterAttribute)',
    'Apply filters globally, at controller level and at action level, and control order with the Order property',
    'Use ServiceFilter and TypeFilter to create filters that need dependency injection',
    'Build a custom logging filter, an authorization filter, a model-validation filter and an exception filter for the Student Portal',
  ],
  theory: [
    {
      heading: 'What are filters and how are they different from middleware?',
      content: `A **filter** is code that runs at a particular stage of the **MVC action invocation pipeline** – after routing has selected a controller action. Typical cross-cutting concerns: logging, timing, authorization, validation, error handling, caching, adding headers.

| | Middleware (Day 73) | Filters |
|---|---|---|
| Runs for | every request (static files, APIs, MVC, everything) | only MVC / Razor Pages / API **actions** |
| Knows about | HttpContext only | HttpContext **plus** controller, action, arguments, ModelState, IActionResult |
| Scope | global only | global, controller or a single action |
| Typical use | HTTPS, static files, CORS, auth, global errors | action logging, validation, per-action authorization, view errors |

Real-world analogy: middleware is the **security gate of a building** – everyone passes it. Filters are the **checks at a specific office** inside: the receptionist checks your appointment (authorization), checks your documents are complete (action filter/validation), and stamps the receipt on the way out (result filter).`,
    },
    {
      heading: 'The five filter types and the pipeline order',
      content: `\`\`\`
Request (after routing)
  -> Authorization filters      can short-circuit (401/403/redirect)
  -> Resource filters (before)  run BEFORE model binding - caching, short-circuit
       -> model binding + validation
       -> Action filters (before)  OnActionExecuting - arguments available
            -> ACTION METHOD
       -> Action filters (after)   OnActionExecuted - result or exception available
       -> Exception filters        only if an unhandled exception occurred above
       -> Result filters (before)  OnResultExecuting - only if a result was produced
            -> RESULT EXECUTES (view renders / JSON is written)
       -> Result filters (after)   OnResultExecuted - response may be started
  -> Resource filters (after)
\`\`\`

| Filter | Interface (sync / async) | Base attribute | Use for |
|---|---|---|---|
| Authorization | \`IAuthorizationFilter\` / \`IAsyncAuthorizationFilter\` | – (use [Authorize] policies normally) | "is the user allowed?" |
| Resource | \`IResourceFilter\` / \`IAsyncResourceFilter\` | – | caching, short-circuiting before model binding |
| Action | \`IActionFilter\` / \`IAsyncActionFilter\` | \`ActionFilterAttribute\` | logging, validation, changing arguments/result |
| Exception | \`IExceptionFilter\` / \`IAsyncExceptionFilter\` | \`ExceptionFilterAttribute\` | turning exceptions into friendly results |
| Result | \`IResultFilter\` / \`IAsyncResultFilter\` | \`ResultFilterAttribute\` | headers, wrapping results, timing the view |

There is also \`IAlwaysRunResultFilter\` (runs even after short-circuits) and **endpoint filters** for Minimal APIs (\`IEndpointFilter\`).

**Short-circuiting**: set \`context.Result = ...\` in an authorization, resource or action filter "before" method and the rest of the pipeline (action, later filters) is skipped. Result filters are NOT executed when an authorization/resource filter short-circuits or when an exception filter handles an exception.`,
    },
    {
      heading: 'Synchronous vs asynchronous filters',
      content: `**Sync** filters have two methods – *Executing* (before) and *Executed* (after):
\`OnActionExecuting(ActionExecutingContext)\` and \`OnActionExecuted(ActionExecutedContext)\`.

**Async** filters have one method that receives a \`next\` delegate – similar to middleware:
\`async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)\` – code before \`await next()\` is the "before" part; code after is the "after" part. To short-circuit, set \`context.Result\` and **do not** call next.

Implement **either** the sync **or** the async interface – if a class implements both, only the async one is called. Use async when the filter awaits I/O (database, HTTP).

**Important context properties**
- \`context.ActionArguments\` – model-bound parameters (can be changed)
- \`context.ModelState\` – validation state
- \`context.Controller\`, \`context.ActionDescriptor\`, \`context.RouteData\`, \`context.HttpContext\`
- \`context.Result\` – set it to short-circuit or replace the result
- \`ActionExecutedContext.Exception\` / \`ExceptionHandled\`, \`ExceptionContext.ExceptionHandled = true\``,
    },
    {
      heading: 'Applying filters: global, controller, action, and order',
      content: `**1. Global** – every action in the app:
\`builder.Services.AddControllersWithViews(o => o.Filters.Add<LogActionFilter>());\` (type – created via DI) or \`o.Filters.Add(new MyFilter())\` (instance – shared singleton).

**2. Controller** – put an attribute on the class: \`[ValidateModel] public class StudentController ...\`

**3. Action** – put an attribute on the method.

**Default order**: Global → Controller → Action for the "before" methods, then the **reverse** for "after" methods (like Russian dolls / middleware). A controller class itself also acts as an action filter: if you override \`OnActionExecuting\` / \`OnActionExecuted\` in the controller, it runs with Order = int.MinValue, so its before-method runs **before all other** action filters and its after-method runs **last**.

**Order property**: every filter can implement \`IOrderedFilter\` (attribute filters have \`Order\`); lower values run first (before) and last (after). Example: \`[ValidateModel(Order = -1)]\`.

**Built-in filter attributes you already use**: \`[Authorize]\`, \`[AllowAnonymous]\`, \`[ValidateAntiForgeryToken]\`, \`[AutoValidateAntiforgeryToken]\`, \`[ResponseCache]\`, \`[RequireHttps]\`, \`[Produces]\`, \`[Consumes]\`, \`[RequestSizeLimit]\`, \`[ServiceFilter]\`, \`[TypeFilter]\`.`,
      tip: 'In an API project, [ApiController] already adds an automatic model-validation filter that returns 400 with ValidationProblemDetails – you do not need ValidateModel there.',
    },
    {
      heading: 'Dependency injection in filters: ServiceFilter and TypeFilter',
      content: `Attributes are created by the C# compiler/runtime, so **constructor parameters of an attribute must be constants** – you cannot inject \`ILogger\` into a normal attribute. Options:

| Way | How | Needs registration? | Notes |
|---|---|---|---|
| Global type filter | \`options.Filters.Add<LogActionFilter>()\` | no | DI resolves constructor |
| \`[ServiceFilter(typeof(LogActionFilter))]\` | resolved from the container | **yes**: \`builder.Services.AddScoped<LogActionFilter>()\` | you control lifetime |
| \`[TypeFilter(typeof(LogActionFilter), Arguments = new object[] { "x" })]\` | created with ActivatorUtilities | no | can pass extra constant arguments |
| Service locator inside attribute | \`context.HttpContext.RequestServices.GetRequiredService<T>()\` | yes | works but hides dependencies |
| \`IFilterFactory\` | attribute creates the real filter | – | advanced |

A filter registered as Singleton must not store per-request state in fields. Our LogActionFilter keeps a Stopwatch in a field, so it is registered as **Scoped** (one instance per request).`,
    },
  ],
  examples: [
    {
      title: 'Simulate the filter pipeline order (console)',
      scenario: 'Trace three requests through authorization, resource, action, exception and result filters: a normal request, an anonymous user, and an action that throws.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it FilterPipelineDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Set a breakpoint (F9) on the "if (error is not null)" line and press F5 to inspect the exception for the Report request',
      ],
      code: filterSimCode,
      csharp: { files: { 'Program.cs': filterSimCode }, stdin: '' },
      result: `=== Request: /Student/Index ===
[Authorization] checking user...
[Resource] before (e.g. look in cache)
   (model binding + validation happen here)
[Action] OnActionExecuting
   >> StudentController.Index() runs
[Action] OnActionExecuted
[Result] OnResultExecuting
   rendering View(Index)
[Result] OnResultExecuted
[Resource] after (e.g. save to cache)

=== Request: /Student/Delete ===
[Authorization] checking user...
[Authorization] not logged in -> short-circuit: redirect to /Account/Login

=== Request: /Student/Report ===
[Authorization] checking user...
[Resource] before (e.g. look in cache)
   (model binding + validation happen here)
[Action] OnActionExecuting
   >> StudentController.Report() runs
[Action] OnActionExecuted (context.Exception is set)
[Exception] caught 'Report service unavailable' -> ViewResult(Error)
   rendering Error view (result filters are skipped)
[Resource] after (e.g. save to cache)
`,
      explanation: `The normal request passes every stage in order and the "after" parts run in reverse. The anonymous request stops at the authorization filter – no resource, action or result filters run. When the action throws, the action filter's OnActionExecuted still runs (with context.Exception set), then the exception filter turns the exception into an Error view. As in ASP.NET Core, result filters are skipped when an exception filter handles the exception, but resource filters still complete.`,
    },
    {
      title: 'Global, controller and action filter order (console)',
      scenario: 'Three logging filters are registered globally, on the controller and on the action. Predict the order, then change the Order property of one of them.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it FilterOrderDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Change GlobalLog to Order = 5 and predict the new output',
      ],
      code: orderSimCode,
      csharp: { files: { 'Program.cs': orderSimCode }, stdin: '' },
      result: `GlobalLog.OnActionExecuting
ControllerLog.OnActionExecuting
ActionLog.OnActionExecuting
   >> action method runs
ActionLog.OnActionExecuted
ControllerLog.OnActionExecuted
GlobalLog.OnActionExecuted

Now ActionLog gets Order = -1:
ActionLog.OnActionExecuting
GlobalLog.OnActionExecuting
ControllerLog.OnActionExecuting
   >> action method runs
ControllerLog.OnActionExecuted
GlobalLog.OnActionExecuted
ActionLog.OnActionExecuted`,
      explanation: `ASP.NET Core sorts filters by Order first and by scope second (Global, Controller, Action). With all Orders equal to 0, the global filter is the outermost doll. Giving ActionLog Order = -1 moves it outside, so it runs first before the action and last after it. The record "with" expression creates a copy with the new Order.`,
    },
    {
      title: 'Custom logging filter, validation filter and ServiceFilter',
      scenario: 'Log every StudentController action with its arguments, result type and time, warn about slow actions globally, and remove the repeated "if (!ModelState.IsValid)" code with a ValidateModel attribute.',
      steps: [
        'Open the StudentPortal MVC project and add a folder Filters (right-click project > Add > New Folder)',
        'Add LogActionFilter.cs, TimingAsyncFilter.cs and ValidateModelAttribute.cs (Add > Class)',
        'In Program.cs pass options to AddControllersWithViews to add TimingAsyncFilter globally and register LogActionFilter with AddScoped',
        'Decorate StudentController with [ServiceFilter(typeof(LogActionFilter))] and the Create POST action with [ValidateModel]',
        'Press F5, open /Student, /Student/Details/2 and submit the Create form empty',
        'Check the console / Output window and F12 > Network > Response Headers (X-Filter)',
      ],
      code: loggingFilterCode,
      result: `GET /Student/Details/2 - console:
info: StudentPortal.Filters.LogActionFilter[0] Executing Student.Details(id=2)
info: StudentPortal.Filters.LogActionFilter[0] Action returned ViewResult
info: StudentPortal.Filters.LogActionFilter[0] Finished in 14 ms with status 200
Response header: X-Filter: LogActionFilter

POST /Student/Create with empty Name:
info: ... Executing Student.Create(student=StudentPortal.Models.Student)
warn: ... ModelState invalid for Create
info: ... Action returned ViewResult
-> the Create form is shown again with the validation messages; _service.Add is never called

Any action that takes more than 500 ms (all controllers):
warn: StudentPortal.Filters.TimingAsyncFilter[0] SLOW action StudentPortal.Controllers.StudentController.Index (StudentPortal): 812 ms`,
      explanation: `LogActionFilter needs ILogger, so it is applied with [ServiceFilter] and registered in DI as Scoped (it keeps a Stopwatch per request). It implements both IActionFilter and IResultFilter, so it can measure until the view has rendered. ValidateModelAttribute short-circuits by setting context.Result, so the action body only contains the "happy path". TimingAsyncFilter is added globally and uses the async pattern: everything after "await next()" runs after the action. Times in ms will vary.`,
    },
    {
      title: 'Custom authorization filter: login and Admin-only pages',
      scenario: 'All StudentController pages require login (stored in session), the About page is public, and Delete is only for the Admin role.',
      steps: [
        'Make sure session is enabled in Program.cs (AddDistributedMemoryCache, AddSession, app.UseSession) as on Day 75',
        'Add Filters/RequireLoginAttribute.cs',
        'Add Controllers/AccountController.cs and Views/Account/Login.cshtml, plus Views/Shared/AccessDenied.cshtml',
        'Decorate StudentController with [RequireLogin], About with [AllowAnonymous] and Delete with [RequireLogin(Role = "Admin")]',
        'Press Ctrl+F5 and try /Student, /Student/About, log in as asha/asha123 and open /Student/Delete/1, then log in as admin/admin123',
      ],
      code: authFilterCode,
      result: `Not logged in:
  /Student/About   -> "Public page"
  /Student         -> 302 redirect to /Account/Login?returnUrl=%2FStudent
Login as asha / asha123 -> redirected back to /Student (list shown)
  /Student/Delete/1 -> 403 "Access denied" page
Login as admin / admin123:
  /Student/Delete/1 -> Delete confirmation page
Wrong password -> "Invalid user name or password"`,
      explanation: `Authorization filters run first, before model binding, so an anonymous user never reaches the action. Setting context.Result short-circuits the pipeline. Because the filter is an attribute with only constant properties (Role), no DI is needed; it reads the session through context.HttpContext. Url.IsLocalUrl prevents open-redirect attacks via returnUrl. This demo shows how filters work; in real applications use ASP.NET Core Identity / cookie or JWT authentication with [Authorize(Roles = "Admin")] (Days 94-95, 110-112).`,
    },
    {
      title: 'Exception filter, result filter attribute and resource filter cache',
      scenario: 'Show a friendly error view when a report fails, add an X-Module header to every report response, and cache the expensive Toppers report so the action runs only once.',
      steps: [
        'Add HandleExceptionFilter.cs, AddHeaderResultFilter.cs and SimpleCacheResourceFilter.cs to the Filters folder',
        'Register HandleExceptionFilter globally in AddControllersWithViews(options => ...)',
        'Add Controllers/ReportController.cs and Views/Shared/FriendlyError.cshtml',
        'Press Ctrl+F5 and open /Report/Toppers (twice), /Report/Missing/7 and /Report/Crash',
        'Check the X-Module header in F12 > Network for each request',
      ],
      code: exceptionResourceCode,
      result: `/Report/Toppers (1st time)  -> Toppers report generated at 10:41:05   (header X-Module: Reports)
/Report/Toppers (2nd time)  -> Toppers report generated at 10:41:05   (same time - served by the resource filter)
/Report/Missing/7           -> 500 page "Sorry! The record you are looking for does not exist."
/Report/Crash               -> 500 page "Sorry! Something went wrong. Our team has been informed."
console: fail: StudentPortal.Filters.HandleExceptionFilter[0] Unhandled error in StudentPortal.Controllers.ReportController.Crash (StudentPortal)
         System.InvalidOperationException: Report engine failed ...`,
      explanation: `The exception filter catches exceptions thrown by actions (and action filters), logs them, chooses a message based on the exception type and sets ExceptionHandled = true so the middleware exception handler is not triggered. Exception filters do NOT catch errors in middleware or in view rendering – keep UseExceptionHandler as the last safety net. The resource filter stores the first ContentResult and short-circuits later requests before model binding, which is why the time does not change. [TypeFilter] creates the filter without registering it in DI. The real framework offers [ResponseCache]/output caching for this purpose.`,
    },
  ],
  interview: [
    { q: 'What are filters in ASP.NET Core MVC?', a: 'Components that run code before or after specific stages of the action invocation pipeline (authorization, resource, action, exception, result) to handle cross-cutting concerns without repeating code in actions.', level: 'Easy' },
    { q: 'List the filter types in execution order.', a: 'Authorization, Resource, (model binding), Action, (action executes), Exception (on error), Result; then Resource after.', level: 'Easy' },
    { q: 'Difference between middleware and filters?', a: 'Middleware runs for every request and only knows HttpContext. Filters run only for MVC/Razor Pages/API actions, know the action context (arguments, ModelState, results) and can be applied per controller or action.', level: 'Medium' },
    { q: 'How do you short-circuit a filter pipeline?', a: 'Set context.Result in an authorization, resource or action filter "before" method (and in async filters do not call next()).', level: 'Medium' },
    { q: 'What is the difference between ServiceFilter and TypeFilter?', a: 'ServiceFilter resolves the filter from the DI container, so the filter type must be registered. TypeFilter creates the filter with ActivatorUtilities (constructor dependencies from DI) without registration and allows extra constant arguments.', level: 'Hard' },
    { q: 'Why can you not inject services into a normal filter attribute constructor?', a: 'Attribute constructor arguments must be compile-time constants; the attribute is instantiated by the runtime, not by the DI container.', level: 'Medium' },
    { q: 'Output question: Global filter G, controller filter C and action filter A all have Order 0. In what order do OnActionExecuting and OnActionExecuted run?', a: 'Executing: G, C, A. Executed: A, C, G.', level: 'Medium' },
    { q: 'What happens if a filter class implements both IActionFilter and IAsyncActionFilter?', a: 'Only the async method (OnActionExecutionAsync) is called.', level: 'Hard' },
    { q: 'Does an exception filter catch exceptions thrown in middleware or in view rendering?', a: 'No. Exception filters handle exceptions from controller creation, model binding, action filters and action methods. Middleware and result execution errors need UseExceptionHandler.', level: 'Hard' },
    { q: 'When do result filters not run?', a: 'When an authorization or resource filter short-circuits, or when an exception filter handles an exception by producing a result (unless it is an IAlwaysRunResultFilter).', level: 'Hard' },
    { q: 'Give examples of built-in filter attributes.', a: '[Authorize], [AllowAnonymous], [ValidateAntiForgeryToken], [ResponseCache], [RequireHttps], [Produces], [ServiceFilter], [TypeFilter].', level: 'Easy' },
    { q: 'How do you register a filter for every action in the application?', a: 'builder.Services.AddControllersWithViews(options => options.Filters.Add<MyFilter>()); (or AddControllers for APIs).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create an action filter attribute [LogExecutionTime] that writes "Action X took N ms" to the console for the decorated action.',
      hint: 'Derive from ActionFilterAttribute, start a Stopwatch in OnActionExecuting and store it in context.HttpContext.Items.',
      solution: `public class LogExecutionTimeAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
        => context.HttpContext.Items["sw"] = Stopwatch.StartNew();

    public override void OnActionExecuted(ActionExecutedContext context)
    {
        var sw = (Stopwatch)context.HttpContext.Items["sw"]!;
        sw.Stop();
        Console.WriteLine($"Action {context.ActionDescriptor.DisplayName} took {sw.ElapsedMilliseconds} ms");
    }
}`,
    },
    {
      task: 'Write an [OfficeHours] authorization filter that returns a ContentResult "Closed - open 9 to 18" with status 403 outside 09:00-18:00.',
      hint: 'Implement IAuthorizationFilter on an Attribute; check DateTime.Now.Hour.',
      solution: `public class OfficeHoursAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        int hour = DateTime.Now.Hour;
        if (hour < 9 || hour >= 18)
            context.Result = new ContentResult { Content = "Closed - open 9 to 18", StatusCode = 403 };
    }
}`,
    },
    {
      task: 'Create an exception filter attribute [HandleDbErrors] that converts any exception into a JSON response { error: "Database error" } with status 503 for one API action.',
      hint: 'Derive from ExceptionFilterAttribute and set context.Result = new ObjectResult(...) { StatusCode = 503 }.',
      solution: `public class HandleDbErrorsAttribute : ExceptionFilterAttribute
{
    public override void OnException(ExceptionContext context)
    {
        context.Result = new ObjectResult(new { error = "Database error" }) { StatusCode = 503 };
        context.ExceptionHandled = true;
    }
}`,
    },
    {
      task: 'Write a result filter that adds the header X-Generated-At with the current UTC time to every response of HomeController.',
      hint: 'ResultFilterAttribute with OnResultExecuting.',
      solution: `public class GeneratedAtAttribute : ResultFilterAttribute
{
    public override void OnResultExecuting(ResultExecutingContext context)
        => context.HttpContext.Response.Headers["X-Generated-At"] = DateTime.UtcNow.ToString("O");
}
[GeneratedAt] public class HomeController : Controller { ... }`,
    },
    {
      task: 'Convert LogActionFilter into an async filter (IAsyncActionFilter) that logs the action name before and the status code after.',
      hint: 'Code after await next() is the "after" part; executed.Result holds the result.',
      solution: `public class LogActionAsyncFilter(ILogger<LogActionAsyncFilter> logger) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        logger.LogInformation("Before {Action}", context.ActionDescriptor.DisplayName);
        var executed = await next();
        logger.LogInformation("After {Action}: {Result}", context.ActionDescriptor.DisplayName,
            executed.Result?.GetType().Name ?? executed.Exception?.GetType().Name);
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'Which filter type runs FIRST in the MVC filter pipeline?',
      options: ['Action filter', 'Result filter', 'Authorization filter', 'Exception filter'],
      answer: 2,
      explanation: 'Authorization filters run first and can short-circuit before anything else.',
    },
    {
      question: 'Which filter type runs before model binding and is useful for caching?',
      options: ['Resource filter', 'Action filter', 'Result filter', 'Exception filter'],
      answer: 0,
      explanation: 'Resource filters wrap model binding and the rest of the pipeline.',
    },
    {
      question: 'How does an action filter stop the action from executing?',
      options: ['Throw an exception', 'Set context.Result in OnActionExecuting', 'Return false', 'Call context.Abort()'],
      answer: 1,
      explanation: 'Assigning context.Result short-circuits the pipeline and that result is executed instead.',
    },
    {
      question: 'Your filter needs ILogger<T> via its constructor and you want to apply it to one controller. Which attribute do you use (with registration in DI)?',
      options: ['[Filter(typeof(...))]', '[Inject]', '[FromServices]', '[ServiceFilter(typeof(LogActionFilter))]'],
      answer: 3,
      explanation: 'ServiceFilter resolves the filter from DI; the filter type must be registered (e.g. AddScoped).',
    },
    {
      question: 'Global filter G and action filter A (both Order 0). Which runs LAST in the "after" stage (OnActionExecuted)?',
      options: ['A', 'G', 'Both at the same time', 'Neither runs'],
      answer: 1,
      explanation: 'After-methods run in reverse order: A first, then G last.',
    },
  ],
};
