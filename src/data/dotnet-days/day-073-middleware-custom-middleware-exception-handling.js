const miniAppCode = `using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// Our own "RequestDelegate": a function that handles a request
public delegate Task RequestDelegate(HttpContextLite context);

// A very small HttpContext
public class HttpContextLite
{
    public string Path { get; set; } = "/";
    public bool IsLoggedIn { get; set; }
    public int StatusCode { get; set; } = 404;
    public string Body { get; set; } = "";
}

// Works like WebApplication: Use(), Run(), Build()
public class MiniApp
{
    private readonly List<Func<RequestDelegate, RequestDelegate>> _components = new();

    // middleware that receives the context and a "next" function
    public void Use(Func<HttpContextLite, Func<Task>, Task> middleware)
    {
        _components.Add(next => ctx => middleware(ctx, () => next(ctx)));
    }

    // terminal middleware: it never calls next
    public void Run(RequestDelegate handler)
    {
        _components.Add(_ => handler);
    }

    // Build the chain from the LAST component back to the FIRST
    public RequestDelegate Build()
    {
        RequestDelegate app = ctx => { ctx.StatusCode = 404; return Task.CompletedTask; };
        for (int i = _components.Count - 1; i >= 0; i--)
            app = _components[i](app);
        return app;
    }
}`;

const pipelineProgram = `using System;
using System.Threading.Tasks;

var app = new MiniApp();

// Middleware 1: logging (runs code BEFORE and AFTER the rest of the pipeline)
app.Use(async (ctx, next) =>
{
    Console.WriteLine("1. Logging : start " + ctx.Path);
    await next();
    Console.WriteLine("1. Logging : end   " + ctx.Path + " -> " + ctx.StatusCode);
});

// Middleware 2: authorization (may SHORT-CIRCUIT)
app.Use(async (ctx, next) =>
{
    if (ctx.Path.StartsWith("/admin") && !ctx.IsLoggedIn)
    {
        Console.WriteLine("2. Auth    : blocked (short-circuit, next() not called)");
        ctx.StatusCode = 401;
        return;
    }
    Console.WriteLine("2. Auth    : ok");
    await next();
});

// Terminal middleware: the endpoint
app.Run(ctx =>
{
    Console.WriteLine("3. Endpoint: handling " + ctx.Path);
    ctx.StatusCode = 200;
    return Task.CompletedTask;
});

RequestDelegate pipeline = app.Build();

await pipeline(new HttpContextLite { Path = "/students" });
Console.WriteLine();
await pipeline(new HttpContextLite { Path = "/admin" });
Console.WriteLine();
await pipeline(new HttpContextLite { Path = "/admin", IsLoggedIn = true });`;

const exceptionProgram = `using System;
using System.Threading.Tasks;

var app = new MiniApp();

// Global exception handler: registered FIRST so it wraps everything after it
app.Use(async (ctx, next) =>
{
    try
    {
        await next();
    }
    catch (DivideByZeroException ex)
    {
        ctx.StatusCode = 400;
        ctx.Body = "Bad request: " + ex.Message;
    }
    catch (Exception ex)
    {
        Console.WriteLine("   [log] " + ex.GetType().Name + ": " + ex.Message);  // details only in the log
        ctx.StatusCode = 500;
        ctx.Body = "Something went wrong. Please try again.";      // safe message for the user
    }
});

app.Run(ctx =>
{
    ctx.StatusCode = 200;
    if (ctx.Path == "/divide")
    {
        int total = 100, count = 0;
        ctx.Body = "Average = " + (total / count);
    }
    else if (ctx.Path == "/crash")
    {
        throw new InvalidOperationException("Database server not reachable");
    }
    else
    {
        ctx.Body = "Hello from " + ctx.Path;
    }
    return Task.CompletedTask;
});

var pipeline = app.Build();

foreach (var path in new[] { "/home", "/divide", "/crash" })
{
    var ctx = new HttpContextLite { Path = path };
    await pipeline(ctx);
    Console.WriteLine($"{path} -> {ctx.StatusCode} {ctx.Body}");
}`;

const inlineCode = `// File: Program.cs  (ASP.NET Core Empty template)
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 1) Use: do something, call next, do something after
app.Use(async (context, next) =>
{
    Console.WriteLine($"[A] before  {context.Request.Path}");
    await next(context);
    Console.WriteLine($"[A] after   {context.Response.StatusCode}");
});

// 2) Use with a condition that short-circuits
app.Use(async (context, next) =>
{
    if (context.Request.Query.ContainsKey("blocked"))
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Blocked by middleware B");
        return;                       // next is NOT called
    }
    await next(context);
});

// 3) Map: branch the pipeline for a path prefix
app.Map("/health", healthApp =>
{
    healthApp.Run(async context => await context.Response.WriteAsync("Healthy"));
});

// 4) MapWhen: branch on any condition
app.MapWhen(ctx => ctx.Request.Query.ContainsKey("admin"), adminApp =>
{
    adminApp.Run(async ctx => await ctx.Response.WriteAsync("Admin branch"));
});

// 5) UseWhen: run extra middleware for /api only, then REJOIN the main pipeline
app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/api"), apiApp =>
{
    apiApp.Use(async (ctx, next) =>
    {
        ctx.Response.Headers["X-Api-Version"] = "1.0";
        await next(ctx);
    });
});

// 6) Run: terminal middleware - the end of the main pipeline
app.Run(async context =>
{
    await context.Response.WriteAsync($"Hello from Run! Path = {context.Request.Path}");
});

app.Run();   // note: this app.Run() (no args) STARTS the web server`;

const loggingMwCode = `// File: Middleware/RequestLoggingMiddleware.cs
using System.Diagnostics;

namespace StudentPortal.Middleware;

// Convention-based middleware: constructor takes RequestDelegate,
// public InvokeAsync(HttpContext) method returns Task
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var watch = Stopwatch.StartNew();
        string method = context.Request.Method;
        string path = context.Request.Path + context.Request.QueryString;

        _logger.LogInformation("--> {Method} {Path}", method, path);

        await _next(context);           // let the rest of the pipeline run

        watch.Stop();
        _logger.LogInformation("<-- {Method} {Path} responded {StatusCode} in {Elapsed} ms",
            method, path, context.Response.StatusCode, watch.ElapsedMilliseconds);
    }
}

// File: Middleware/RequestLoggingMiddlewareExtensions.cs
namespace StudentPortal.Middleware;

public static class RequestLoggingMiddlewareExtensions
{
    // lets Program.cs write app.UseRequestLogging();
    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder app)
        => app.UseMiddleware<RequestLoggingMiddleware>();
}

// File: Middleware/RequestIdMiddleware.cs   (factory-based: implements IMiddleware)
namespace StudentPortal.Middleware;

public class RequestIdMiddleware : IMiddleware
{
    private static int _counter;

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        int id = Interlocked.Increment(ref _counter);
        context.Items["RequestId"] = id;                         // share data with later code
        context.Response.Headers["X-Request-Id"] = id.ToString(); // add header before response starts
        await next(context);
    }
}

// File: Program.cs
using StudentPortal.Middleware;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
builder.Services.AddTransient<RequestIdMiddleware>();   // IMiddleware must be registered in DI

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseRequestLogging();                       // our logging middleware - early, to time everything
app.UseMiddleware<RequestIdMiddleware>();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();`;

const exceptionWebCode = `// File: Middleware/GlobalExceptionMiddleware.cs
using System.Text.Json;

namespace StudentPortal.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next; _logger = logger; _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (KeyNotFoundException ex)
        {
            await WriteError(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Path}", context.Request.Path);
            string message = _env.IsDevelopment() ? ex.Message : "An unexpected error occurred.";
            await WriteError(context, StatusCodes.Status500InternalServerError, message);
        }
    }

    private static async Task WriteError(HttpContext context, int status, string message)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        var body = new { status, error = message, traceId = context.TraceIdentifier };
        await context.Response.WriteAsync(JsonSerializer.Serialize(body));
    }
}

// File: Controllers/StudentController.cs (actions that fail on purpose)
using Microsoft.AspNetCore.Mvc;

namespace StudentPortal.Controllers;

public class StudentController : Controller
{
    public IActionResult Find(int id)
    {
        if (id != 1) throw new KeyNotFoundException($"Student {id} not found");
        return Content("Student 1: Asha Patil");
    }

    public IActionResult Crash()
    {
        throw new InvalidOperationException("Database server not reachable");
    }
}

// File: Program.cs  (option A: our own middleware, registered FIRST)
app.UseMiddleware<GlobalExceptionMiddleware>();

// File: Program.cs  (option B: the built-in way for MVC sites)
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();          // detailed yellow page (on by default in Development)
}
else
{
    app.UseExceptionHandler("/Home/Error");   // re-executes the request at /Home/Error
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/Home/StatusCode", "?code={0}");   // nice 404 page

// File: Controllers/HomeController.cs (error actions)
using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using StudentPortal.Models;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    public HomeController(ILogger<HomeController> logger) => _logger = logger;

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        var feature = HttpContext.Features.Get<IExceptionHandlerPathFeature>();
        if (feature != null)
            _logger.LogError(feature.Error, "Error on {Path}", feature.Path);

        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    public IActionResult StatusCode(int code)
    {
        ViewBag.Code = code;
        return View();   // Views/Home/StatusCode.cshtml
    }
}

// File: Views/Home/StatusCode.cshtml
@{
    ViewData["Title"] = "Oops";
    int code = (int)ViewBag.Code;
}
<h2>@(code == 404 ? "Page not found" : "Error " + code)</h2>
<p>The page you requested is not available.</p>
<a asp-controller="Home" asp-action="Index">Go to home page</a>`;

export default {
  id: 'day-073-middleware-custom-middleware-exception-handling',
  title: 'Middleware, Custom Middleware and Exception Handling',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 73,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Every request in ASP.NET Core travels through a pipeline of small components called middleware. Today you learn how the pipeline is built (Use, Run, Map, MapWhen, UseWhen), why ORDER matters, how to write your own middleware (inline, convention-based class and IMiddleware), and how to handle errors globally with UseDeveloperExceptionPage, UseExceptionHandler, status code pages and a custom exception middleware. You will first simulate the pipeline in a console app, then build a real request logging middleware.`,
  objectives: [
    'Explain the request pipeline and how each middleware can run code before and after the next one',
    'Use app.Use, app.Run, app.Map, app.MapWhen and app.UseWhen and predict their output',
    'Place built-in middleware in the correct order (exception handler, HTTPS, static files, routing, authentication, authorization, endpoints)',
    'Write a convention-based RequestLoggingMiddleware with an extension method, and a factory-based IMiddleware',
    'Implement global exception handling for MVC (error page) and for APIs (JSON error response)',
  ],
  theory: [
    {
      heading: 'What is middleware? The request pipeline',
      content: `**Middleware** is a piece of code that sits in the path of every HTTP request. The middleware components are chained together into a **pipeline**. Each one can:

1. Do some work **before** the next component (read the request, log, check login).
2. Call **\`next()\`** to pass the request to the next component — or **not call it** (short-circuit) and send the response itself.
3. Do some work **after** the next component returns (log the status code, add timing).

Real-world analogy: **airport security**. Every passenger (request) passes check-in → security scan → passport control → boarding gate (endpoint). Any counter can stop you (short-circuit: "no ticket, go back"). On the way back (arrival) you pass the counters in **reverse** order.

\`\`\`
Request  --> [Exception] --> [HTTPS] --> [Static files] --> [Routing] --> [Auth] --> [Endpoint/Controller]
Response <-- [Exception] <-- [HTTPS] <-- [Static files] <-- [Routing] <-- [Auth] <--------+
\`\`\`

Technically a middleware is a \`RequestDelegate\` — a function \`Task (HttpContext context)\` — and \`next\` is the delegate of the following middleware. Kestrel receives the request, builds an \`HttpContext\`, and passes it to the first middleware.`,
      points: [
        'Middleware runs for EVERY request (unless a branch or short-circuit skips it)',
        'Order of registration in Program.cs = order of execution',
        'Response flows back through the same components in reverse order',
        'Do not modify headers after the response has started (check context.Response.HasStarted)',
      ],
    },
    {
      heading: 'Use, Run, Map, MapWhen and UseWhen',
      content: `| Method | What it does | Calls next? |
|---|---|---|
| \`app.Use(async (context, next) => { ...; await next(context); ... })\` | adds a middleware that can continue the chain | yes (optional) |
| \`app.Run(async context => { ... })\` | adds a **terminal** middleware – the end of the chain | never |
| \`app.Map("/health", branch => ...)\` | creates a separate **branch** for requests whose path starts with /health | branch never rejoins |
| \`app.MapWhen(ctx => condition, branch => ...)\` | branch on any condition (query string, header ...) | branch never rejoins |
| \`app.UseWhen(ctx => condition, branch => ...)\` | runs extra middleware for matching requests, then **rejoins** the main pipeline | rejoins |
| \`app.UseMiddleware<T>()\` | adds a middleware class | depends on class |

Note: \`app.Run(handler)\` (with an argument) adds terminal middleware, while \`app.Run()\` (no argument) at the end of Program.cs **starts the web server**. Anything registered after a terminal middleware never executes.

Also do not confuse middleware \`Map\` with endpoint routing \`MapGet\` / \`MapControllerRoute\`; the latter register **endpoints** that are executed by the endpoint middleware at the end.`,
    },
    {
      heading: 'Built-in middleware and the correct order',
      content: `The MVC template already registers the most important middleware. The recommended order is:

\`\`\`
app.UseExceptionHandler("/Home/Error");   // 1. catch errors from everything below (or UseDeveloperExceptionPage)
app.UseHsts();                            // 2. Strict-Transport-Security header (production)
app.UseHttpsRedirection();                // 3. http -> https
app.UseStaticFiles();                     // 4. serve wwwroot files and short-circuit (no auth for css/js)
app.UseRouting();                         // 5. pick the endpoint
app.UseCors();                            // 6. (APIs) CORS after routing, before auth
app.UseAuthentication();                  // 7. who are you?
app.UseAuthorization();                   // 8. are you allowed?
app.UseSession();                         // 9. session (Day 75)
app.MapControllerRoute(...);              // 10. endpoints (controllers / Razor Pages)
\`\`\`

Why order matters:
- The exception handler must be **first** – it can only catch exceptions thrown by middleware registered **after** it.
- Static files come **before** authentication, so CSS/JS are served fast without checking the user.
- \`UseAuthentication\` must come **before** \`UseAuthorization\` – you must know the user before checking permissions.
- Routing must come before authorization, so authorization knows which endpoint (and its [Authorize] attribute) was selected.`,
      tip: 'If a middleware "does nothing", first check its position in Program.cs. 90% of middleware bugs are ordering bugs.',
    },
    {
      heading: 'Writing custom middleware',
      content: `There are three ways:

**1. Inline** – a lambda in \`app.Use(...)\`. Good for small, quick things.

**2. Convention-based class** (most common):
- constructor takes \`RequestDelegate next\` (and any **singleton** services),
- a public method \`Invoke\` or \`InvokeAsync(HttpContext context, ...)\` returning \`Task\`,
- **scoped** services (like a DbContext) must be added as extra parameters of \`InvokeAsync\`, NOT the constructor, because the middleware object itself is created **once** (it behaves like a singleton).
- register with \`app.UseMiddleware<RequestLoggingMiddleware>()\` or a neat extension method \`app.UseRequestLogging()\`.

**3. Factory-based** – implement the \`IMiddleware\` interface (\`InvokeAsync(HttpContext context, RequestDelegate next)\`), register the class in DI (\`builder.Services.AddTransient<MyMiddleware>()\`) and add it with \`app.UseMiddleware<MyMiddleware>()\`. It is created **per request** with the lifetime you choose, so constructor injection of scoped services is fine.

Use \`context.Items["key"]\` to pass data from a middleware to later middleware or controllers within the same request.`,
      syntax: `public class MyMiddleware
{
    private readonly RequestDelegate _next;
    public MyMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context /*, IScopedService svc */)
    {
        // before
        await _next(context);
        // after
    }
}`,
    },
    {
      heading: 'Exception handling in ASP.NET Core',
      content: `| Tool | Environment | What the user sees |
|---|---|---|
| \`UseDeveloperExceptionPage()\` | Development (enabled automatically in .NET 6+) | detailed page: stack trace, query, headers, routing |
| \`UseExceptionHandler("/Home/Error")\` | Production | your friendly Error view; the request is **re-executed** at /Home/Error |
| \`UseExceptionHandler()\` + \`AddProblemDetails()\` / \`IExceptionHandler\` (.NET 8+) | APIs | RFC 7807 ProblemDetails JSON |
| \`UseStatusCodePages()\` / \`UseStatusCodePagesWithReExecute("/Home/StatusCode", "?code={0}")\` | All | nice pages for 404/401/403 that have no body |
| Custom try/catch middleware | All | anything you want (e.g. JSON \`{ status, error, traceId }\`) |
| try/catch in a controller action | All | handle an **expected** error locally (e.g. duplicate e-mail → ModelState error) |

Inside the error action, \`HttpContext.Features.Get<IExceptionHandlerPathFeature>()\` gives the original exception and path so you can log them.

**Golden rules**
- Never show stack traces or SQL messages to users in production (security risk) – log them instead.
- Log with \`ILogger.LogError(ex, ...)\` so the full exception is stored.
- Return correct status codes: 400 bad input, 404 not found, 500 server error.
- Use exceptions for **exceptional** situations; for normal validation use ModelState.`,
    },
  ],
  examples: [
    {
      title: 'Simulate the middleware pipeline in a console app',
      scenario: 'To really understand next(), short-circuiting and the "before/after" behaviour, we build a mini pipeline with delegates that works exactly like ASP.NET Core and send three requests through it.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it PipelineSimulator > .NET 8/10 > Create',
        'Right-click the project > Add > Class > MiniApp.cs and replace its content with the MiniApp.cs code',
        'Replace Program.cs with the Program.cs code',
        'Press Ctrl+F5',
        'Swap the order of the two app.Use blocks and run again to see how the output changes',
      ],
      code: `// ===== MiniApp.cs =====
${miniAppCode}

// ===== Program.cs =====
${pipelineProgram}`,
      csharp: { files: { 'Program.cs': pipelineProgram, 'MiniApp.cs': miniAppCode }, stdin: '' },
      result: `1. Logging : start /students
2. Auth    : ok
3. Endpoint: handling /students
1. Logging : end   /students -> 200

1. Logging : start /admin
2. Auth    : blocked (short-circuit, next() not called)
1. Logging : end   /admin -> 401

1. Logging : start /admin
2. Auth    : ok
3. Endpoint: handling /admin
1. Logging : end   /admin -> 200`,
      explanation: `Build() wraps the components from last to first, so calling the pipeline runs Logging, which calls next() = Auth, which calls next() = Endpoint. When the endpoint returns, control goes back to Auth and then to Logging, which prints the "end" line with the final status code – this is the "after" part. For /admin without login, Auth returns without calling next(), so the endpoint never runs, yet Logging still prints its end line with 401. ASP.NET Core's WebApplication builds its pipeline the same way.`,
    },
    {
      title: 'Inline middleware with Use, Run, Map, MapWhen and UseWhen',
      scenario: 'Create an empty ASP.NET Core project and try every way of adding middleware, then call different URLs to see which components run.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Empty > name it MiddlewareDemo > Create',
        'Replace Program.cs with the code below',
        'Press F5 (the console window shows the [A] log lines; the browser shows the response)',
        'Browse to /, /students?blocked=1, /health, /students?admin=1 and /api/test',
        'For /api/test press F12 in the browser > Network tab > click the request > Response Headers to see X-Api-Version',
      ],
      code: inlineCode,
      result: `GET /                    -> "Hello from Run! Path = /"
   console: [A] before  /      [A] after   200
GET /students?blocked=1  -> 403 "Blocked by middleware B"
   console: [A] before  /students   [A] after   403
GET /health              -> "Healthy"   (Run at the end never executes)
GET /students?admin=1    -> "Admin branch"
GET /api/test            -> "Hello from Run! Path = /api/test"  + response header X-Api-Version: 1.0
(The browser may also request /favicon.ico, which produces an extra pair of [A] lines.)`,
      explanation: `Middleware A runs for every request because it is registered first. B short-circuits when ?blocked is present. Map and MapWhen create separate branches that end in their own Run, so the main Run is never reached. UseWhen adds a header only for /api requests and then rejoins the main pipeline, so the main Run still writes the response.`,
    },
    {
      title: 'Request logging middleware (convention-based) + IMiddleware',
      scenario: 'The Student Portal must log every request with method, path, status code and time taken, and add an X-Request-Id header for support tickets.',
      steps: [
        'Open the StudentPortal MVC project (File > Open > Project/Solution)',
        'Right-click the project > Add > New Folder > Middleware',
        'Right-click Middleware > Add > Class > RequestLoggingMiddleware.cs; paste the class. Add RequestLoggingMiddlewareExtensions.cs and RequestIdMiddleware.cs the same way',
        'Edit Program.cs: register RequestIdMiddleware in DI and add app.UseRequestLogging(); and app.UseMiddleware<RequestIdMiddleware>(); right after the exception handler block',
        'Press F5, open /Student and /Student/Details/99, then look at View > Output (Show output from: StudentPortal - ASP.NET Core Web Server) or the console window',
        'Put a breakpoint (F9) on "await _next(context);" and step over (F10) to watch the controller run in between',
      ],
      code: loggingMwCode,
      result: `Console / Output window:
info: StudentPortal.Middleware.RequestLoggingMiddleware[0]
      --> GET /Student
info: StudentPortal.Middleware.RequestLoggingMiddleware[0]
      <-- GET /Student responded 200 in 38 ms
info: StudentPortal.Middleware.RequestLoggingMiddleware[0]
      --> GET /css/site.css
info: StudentPortal.Middleware.RequestLoggingMiddleware[0]
      <-- GET /css/site.css responded 200 in 2 ms
info: StudentPortal.Middleware.RequestLoggingMiddleware[0]
      --> GET /Student/Details/99
info: StudentPortal.Middleware.RequestLoggingMiddleware[0]
      <-- GET /Student/Details/99 responded 404 in 5 ms

Browser F12 > Network > Response Headers: X-Request-Id: 1, 2, 3 ... (times in ms vary)`,
      explanation: `RequestLoggingMiddleware is created once; ILogger is a singleton-safe service so it can be injected in the constructor. Because it is registered before UseStaticFiles, it also logs CSS/JS requests – move it after UseStaticFiles if you only want page requests. RequestIdMiddleware implements IMiddleware, so it must be registered in DI and is created per request. Message templates like {Method} create structured logs (Day 74).`,
    },
    {
      title: 'Global exception handling: friendly page for MVC and JSON for APIs',
      scenario: 'When the database is down or a student is not found, users must never see a stack trace. MVC pages show a friendly error page; AJAX/API calls get a JSON error with a traceId.',
      steps: [
        'Add Middleware/GlobalExceptionMiddleware.cs to the StudentPortal project',
        'Add the Find and Crash actions to StudentController',
        'Option A: put app.UseMiddleware<GlobalExceptionMiddleware>(); as the FIRST line after builder.Build()',
        'Run with Ctrl+F5 and open /Student/Find/5 and /Student/Crash',
        'Option B: remove option A, keep UseExceptionHandler + UseStatusCodePagesWithReExecute, add the StatusCode action and view',
        'Switch to Production: Project > Properties > Debug > Open debug launch profiles UI > set ASPNETCORE_ENVIRONMENT = Production, run again and open /Student/Crash and /nothing-here',
      ],
      code: exceptionWebCode,
      result: `Option A (custom middleware), Development:
GET /Student/Find/1  -> Student 1: Asha Patil
GET /Student/Find/5  -> 404 {"status":404,"error":"Student 5 not found","traceId":"0HN7...:00000003"}
GET /Student/Crash   -> 500 {"status":500,"error":"Database server not reachable","traceId":"0HN7...:00000004"}
Option A in Production: the 500 response says "An unexpected error occurred." (details only in the log)

Option B, Development: /Student/Crash shows the Developer Exception Page with the stack trace.
Option B, Production:  /Student/Crash shows Views/Shared/Error.cshtml with "Request ID: 00-..."
                       /nothing-here shows "Page not found" from Views/Home/StatusCode.cshtml`,
      explanation: `The custom middleware wraps the rest of the pipeline in try/catch, maps known exceptions to status codes and hides internal details outside Development. The built-in UseExceptionHandler re-executes the request at /Home/Error so you can render a normal Razor view; IExceptionHandlerPathFeature gives you the original exception for logging. UseStatusCodePagesWithReExecute turns empty 404 responses into a friendly page while keeping the 404 status code (good for SEO).`,
    },
    {
      title: 'Simulate a global exception handler (console)',
      scenario: 'Reuse the MiniApp pipeline and add a try/catch middleware first, then send a normal request, a divide-by-zero request and a crashing request.',
      steps: [
        'Use the PipelineSimulator project from example 1 (keep MiniApp.cs)',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Move the exception middleware AFTER app.Run(...) and run again: the program now crashes with an unhandled exception – proof that order matters',
      ],
      code: exceptionProgram,
      csharp: { files: { 'Program.cs': exceptionProgram, 'MiniApp.cs': miniAppCode }, stdin: '' },
      result: `/home -> 200 Hello from /home
/divide -> 400 Bad request: Attempted to divide by zero.
   [log] InvalidOperationException: Database server not reachable
/crash -> 500 Something went wrong. Please try again.`,
      explanation: `The endpoint sets 200 first, but when it throws, the exception travels back up the chain to the first middleware, whose catch blocks change the status code and body. A specific catch (DivideByZeroException) is checked before the general one. For /crash the technical details are written only to the log line, while the user gets a safe message – exactly the pattern of a real global exception middleware.`,
    },
  ],
  interview: [
    { q: 'What is middleware in ASP.NET Core?', a: 'A component in the request pipeline that receives HttpContext, can process the request, call the next middleware, and process the response on the way back. The chain of middleware is the request pipeline.', level: 'Easy' },
    { q: 'What is the difference between app.Use and app.Run?', a: 'Use adds middleware that receives next and can continue the pipeline. Run adds terminal middleware that never calls next; anything after it is not executed.', level: 'Easy' },
    { q: 'What is short-circuiting?', a: 'When a middleware writes the response and does not call next(), so the remaining pipeline does not run. Example: static files middleware returning a CSS file, or an auth check returning 401.', level: 'Easy' },
    { q: 'Difference between Map, MapWhen and UseWhen?', a: 'Map branches by path prefix, MapWhen branches by any predicate; both branches do not return to the main pipeline. UseWhen conditionally runs extra middleware and then rejoins the main pipeline.', level: 'Medium' },
    { q: 'Why must UseExceptionHandler be registered first?', a: 'A middleware can only catch exceptions thrown by middleware/endpoints registered after it, because it wraps the call to next() in try/catch.', level: 'Medium' },
    { q: 'Why must UseAuthentication come before UseAuthorization?', a: 'Authorization needs to know who the user is (HttpContext.User), which is set by the authentication middleware.', level: 'Easy' },
    { q: 'How do you inject a scoped service (e.g. DbContext) into convention-based middleware?', a: 'Add it as a parameter of InvokeAsync, not the constructor. The middleware instance is created once (singleton-like); InvokeAsync parameters are resolved per request.', level: 'Hard' },
    { q: 'What is IMiddleware and when would you use it?', a: 'An interface for factory-based middleware. The class is registered in DI and activated per request with its configured lifetime, allowing constructor injection of scoped services and strong typing.', level: 'Hard' },
    { q: 'Output question: middleware A logs "A1", calls next, logs "A2"; middleware B logs "B1", calls next, logs "B2"; Run logs "R". What is printed?', a: 'A1 B1 R B2 A2 – the "after" parts run in reverse order.', level: 'Medium' },
    { q: 'What is the difference between UseDeveloperExceptionPage and UseExceptionHandler?', a: 'The developer page shows full exception details and is only for Development. UseExceptionHandler re-executes the request to a friendly error path (or uses ProblemDetails/IExceptionHandler) and is for Production.', level: 'Easy' },
    { q: 'What does UseStatusCodePagesWithReExecute do?', a: 'For responses with an error status code and no body (e.g. 404), it re-executes the pipeline at a given path such as /Home/StatusCode?code=404 while keeping the original status code.', level: 'Medium' },
    { q: 'Why can you get "Headers are read-only, response has already started"?', a: 'A middleware tried to change headers or status after the body started being written (often in the "after" part). Set headers before calling next or use Response.OnStarting.', level: 'Hard' },
    { q: 'Middleware vs Filters?', a: 'Middleware runs for every request and knows only HttpContext. Filters (Day 76) run inside MVC around actions and know about controllers, actions, model binding and action results.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write an inline middleware that adds a response header X-Developer with your name to every response.',
      hint: 'Set the header BEFORE calling next.',
      solution: `app.Use(async (context, next) =>
{
    context.Response.Headers["X-Developer"] = "Asha";
    await next(context);
});`,
    },
    {
      task: 'Create a MaintenanceMiddleware class that returns status 503 with text "Site under maintenance" when appsettings.json has "MaintenanceMode": true, otherwise calls next.',
      hint: 'Inject IConfiguration in the constructor (it is a singleton) and read GetValue<bool>("MaintenanceMode") inside InvokeAsync so changes are picked up.',
      solution: `public class MaintenanceMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IConfiguration _config;
    public MaintenanceMiddleware(RequestDelegate next, IConfiguration config) { _next = next; _config = config; }

    public async Task InvokeAsync(HttpContext context)
    {
        if (_config.GetValue<bool>("MaintenanceMode"))
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsync("Site under maintenance");
            return;
        }
        await _next(context);
    }
}
// Program.cs (after UseStaticFiles so CSS still loads)
app.UseMiddleware<MaintenanceMiddleware>();`,
    },
    {
      task: 'Write a middleware that blocks requests whose User-Agent header contains "BadBot" with status 403.',
      hint: 'context.Request.Headers.UserAgent.ToString()',
      solution: `app.Use(async (context, next) =>
{
    string agent = context.Request.Headers.UserAgent.ToString();
    if (agent.Contains("BadBot", StringComparison.OrdinalIgnoreCase))
    {
        context.Response.StatusCode = 403;
        return;
    }
    await next(context);
});`,
    },
    {
      task: 'Predict the output: three Use middleware print "1-in/1-out", "2-in/2-out", "3-in/3-out" around next(), and middleware 2 short-circuits when the path is /stop. What prints for / and for /stop (endpoint prints "E")?',
      hint: 'Short-circuiting stops the in-direction; the out-direction still runs for the middleware that already ran.',
      solution: `/      -> 1-in 2-in 3-in E 3-out 2-out 1-out
/stop  -> 1-in 2-in 1-out
Middleware 2 prints 2-in, then returns WITHOUT calling next, so 3 and E never run and
its own 2-out line (written after next) is skipped. Control returns to middleware 1, which prints 1-out.`,
    },
    {
      task: 'Add a /Home/StatusCode page that shows a different message for 404, 403 and others, and wire it with UseStatusCodePagesWithReExecute.',
      hint: 'Use a switch expression in the view on the code.',
      solution: `// Program.cs
app.UseStatusCodePagesWithReExecute("/Home/StatusCode", "?code={0}");
// HomeController
public IActionResult StatusCode(int code) { ViewBag.Code = code; return View(); }
// StatusCode.cshtml
@{
    string msg = (int)ViewBag.Code switch
    {
        404 => "Page not found",
        403 => "You are not allowed to see this page",
        _ => "Something went wrong"
    };
}
<h2>@msg</h2>`,
    },
  ],
  quiz: [
    {
      question: 'Which method adds terminal middleware that never calls the next component?',
      options: ['app.Use', 'app.UseWhen', 'app.Run(handler)', 'app.UseMiddleware'],
      answer: 2,
      explanation: 'app.Run(RequestDelegate) is terminal. (app.Run() without arguments starts the server.)',
    },
    {
      question: 'Middleware is registered as: Logging, Auth, Endpoint. Auth short-circuits. Which runs?',
      options: ['Only Auth', 'Logging (before and after) and Auth', 'Logging, Auth and Endpoint', 'Endpoint only'],
      answer: 1,
      explanation: 'Logging runs its before-part, Auth stops the chain, then control returns to Logging for its after-part.',
    },
    {
      question: 'Where should a scoped service be injected in convention-based middleware?',
      options: ['In the constructor', 'As a parameter of InvokeAsync', 'As a static field', 'It is impossible'],
      answer: 1,
      explanation: 'The middleware instance is created once, so per-request (scoped) services go into InvokeAsync parameters.',
    },
    {
      question: 'Which middleware should be registered FIRST in the pipeline?',
      options: ['UseAuthorization', 'UseStaticFiles', 'UseRouting', 'UseExceptionHandler'],
      answer: 3,
      explanation: 'The exception handler can only catch exceptions from components registered after it.',
    },
    {
      question: 'Which branching method runs extra middleware and then returns to the main pipeline?',
      options: ['UseWhen', 'Map', 'MapWhen', 'Run'],
      answer: 0,
      explanation: 'UseWhen rejoins the main pipeline; Map and MapWhen create separate branches.',
    },
  ],
};
