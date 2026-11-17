export default {
  id: 'extra-44-exception-handling-logging-health-checks',
  title: 'Global Exception Handling, Structured Logging and Health Checks',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 44,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Make an ASP.NET Core API production-ready: one central place for errors (IExceptionHandler + ProblemDetails), structured logging with ILogger and Serilog (message templates, scopes, request logging), and health check endpoints for load balancers, Docker and Kubernetes.',
  objectives: [
    'Replace scattered try/catch blocks with UseExceptionHandler, IExceptionHandler and RFC 7807 ProblemDetails responses',
    'Write structured log messages with ILogger<T>, message templates, log levels, scopes and configuration filters',
    'Plug in Serilog with console and rolling file sinks and enable request logging',
    'Expose liveness and readiness health checks (database, custom checks) with a JSON response writer',
  ],
  theory: [
    {
      heading: 'Why global exception handling?',
      content: 'If every controller action wraps its code in try/catch, the code is repeated, different developers return different error shapes, and some exceptions are still missed. ASP.NET Core lets you handle ALL unhandled exceptions in one place in the middleware pipeline. The client always receives the same, safe JSON error format and the full exception (stack trace) goes only to the logs, never to the user. Analogy: a hospital has ONE emergency department; every ward does not build its own.',
      points: [
        'Development: app.UseDeveloperExceptionPage() is automatic and shows the stack trace in the browser - NEVER in Production.',
        'Production: app.UseExceptionHandler() catches the exception, logs it and writes a friendly response.',
        '.NET 8+ adds IExceptionHandler: small classes registered with AddExceptionHandler<T>() that run in registration order until one returns true.',
        'Throw meaningful exceptions in services (NotFoundException, ValidationException) and map them to status codes centrally.',
      ],
    },
    {
      heading: 'ProblemDetails (RFC 7807 / RFC 9457)',
      content: 'ProblemDetails is the standard JSON body for HTTP API errors. It has type, title, status, detail and instance, plus any extra properties (traceId, errors). builder.Services.AddProblemDetails() makes ASP.NET Core produce this format for exceptions and for empty error status codes (with app.UseStatusCodePages()). [ApiController] already returns ValidationProblemDetails for invalid models.',
      syntax: `{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Resource not found",
  "status": 404,
  "detail": "Product 99 was not found.",
  "instance": "GET /api/products/99",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00"
}`,
      tip: 'Return content type application/problem+json. Clients (React/Angular) can then show error.title and error.detail in one generic way.',
    },
    {
      heading: 'Logging with ILogger<T>',
      content: 'ASP.NET Core has built-in logging (Microsoft.Extensions.Logging). Inject ILogger<T> into any class; T becomes the log category (for example ProductMinimalApi.Services.OrderService). Log levels from lowest to highest: Trace, Debug, Information, Warning, Error, Critical (and None). The configuration "Logging:LogLevel" decides the minimum level per category, so Debug logs can be visible in Development and hidden in Production without changing code.',
      syntax: `public class OrderService(ILogger<OrderService> logger)
{
    public void Place(int orderId, string customer)
    {
        logger.LogInformation("Order {OrderId} placed by {Customer}", orderId, customer);
        using (logger.BeginScope("CorrelationId {CorrelationId}", Guid.NewGuid()))
        {
            logger.LogWarning("Stock low for {Product}", "Pen");
        }
    }
}`,
      points: [
        'Use message TEMPLATES with named holes, not string interpolation: the values are stored as separate properties (OrderId=42) and can be searched in Seq, Elastic or Application Insights.',
        'BeginScope adds properties (CorrelationId, UserId) to every log written inside the using block.',
        'Pass the exception as the FIRST argument: logger.LogError(ex, "Payment failed for {OrderId}", id).',
        'For hot paths use [LoggerMessage] source-generated methods: zero allocations when the level is disabled.',
      ],
    },
    {
      heading: 'Structured logging with Serilog',
      content: 'Serilog is the most popular logging library for .NET. Install Serilog.AspNetCore (it includes Console and File sinks). Configure it from appsettings.json with ReadFrom.Configuration, enrich logs (machine name, request id) and send them to many sinks: console, rolling files, Seq, Elasticsearch, SQL Server. app.UseSerilogRequestLogging() writes ONE neat line per HTTP request with method, path, status code and elapsed time.',
      syntax: `builder.Services.AddSerilog((services, lc) => lc
    .ReadFrom.Configuration(builder.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());
...
app.UseSerilogRequestLogging();`,
      tip: 'Never log passwords, tokens, card numbers or full personal data. Logs are often read by many people and kept for a long time.',
    },
    {
      heading: 'Health checks',
      content: 'A health check endpoint answers "is this app OK?". Load balancers, Azure App Service, Docker HEALTHCHECK and Kubernetes probes call it every few seconds. AddHealthChecks() registers checks; MapHealthChecks("/health") exposes them. Each check returns Healthy, Degraded or Unhealthy; the overall status is the WORST one. Healthy and Degraded return HTTP 200, Unhealthy returns 503.',
      syntax: `builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database", tags: ["ready"])
    .AddCheck<DiskSpaceHealthCheck>("disk", tags: ["ready"]);

app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = r => r.Tags.Contains("ready") });`,
      points: [
        'Liveness (/health/live): is the process running? Run no dependency checks - a failing DB should not restart the app.',
        'Readiness (/health/ready): can it serve traffic? Check DB, cache, external APIs.',
        'AddDbContextCheck needs the NuGet package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore.',
        'Community package AspNetCore.HealthChecks.* has checks for SQL Server, Redis, RabbitMQ, URLs and a UI dashboard.',
      ],
    },
  ],
  examples: [
    {
      title: 'Global exception handler with IExceptionHandler and ProblemDetails',
      scenario: 'A Product API throws NotFoundException and ValidationException from its service. We want every error converted to ProblemDetails JSON in one place and logged with ILogger.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API > Next; name it ShopApi; keep "Use controllers" ticked; Framework .NET 8 or .NET 10 > Create',
        'Add a folder Exceptions with AppExceptions.cs and GlobalExceptionHandler.cs (right-click project > Add > New Folder, then Add > Class)',
        'Add Controllers/ProductsController.cs and replace Program.cs with the code below',
        'Press F5, open Swagger and call GET /api/products/99 and POST /api/products with price -5',
        'Watch the Output window (Debug) / console to see the logged exception',
      ],
      code: `// Exceptions/AppExceptions.cs
namespace ShopApi.Exceptions;
public class NotFoundException(string message) : Exception(message);
public class ValidationException(string message) : Exception(message);

// Exceptions/GlobalExceptionHandler.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
namespace ShopApi.Exceptions;

public class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception on {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);
        else
            logger.LogWarning("Handled {ExceptionType}: {Message}",
                exception.GetType().Name, exception.Message);

        httpContext.Response.StatusCode = status;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Title = title,
                // never leak internal messages for 500 errors
                Detail = status == 500 ? "Please contact support." : exception.Message,
                Instance = httpContext.Request.Method + " " + httpContext.Request.Path
            }
        });
    }
}

// Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using ShopApi.Exceptions;
namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private static readonly List<Product> Products = [new(1, "Pen", 10), new(2, "Book", 250)];

    [HttpGet("{id:int}")]
    public Product Get(int id) =>
        Products.FirstOrDefault(p => p.Id == id)
        ?? throw new NotFoundException($"Product {id} was not found.");

    [HttpPost]
    public IActionResult Create(Product p)
    {
        if (p.Price <= 0) throw new ValidationException("Price must be greater than zero.");
        Products.Add(p);
        return CreatedAtAction(nameof(Get), new { id = p.Id }, p);
    }

    [HttpGet("crash")]
    public IActionResult Crash() => throw new InvalidOperationException("Connection string is wrong");
}
public record Product(int Id, string Name, decimal Price);

// Program.cs
using ShopApi.Exceptions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddProblemDetails(options =>
    options.CustomizeProblemDetails = ctx =>
        ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

app.UseExceptionHandler();   // uses the registered IExceptionHandler(s)
app.UseStatusCodePages();     // empty 404/405 responses also become ProblemDetails

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.MapControllers();
app.Run();`,
      result: `GET /api/products/99
HTTP/1.1 404 Not Found
Content-Type: application/problem+json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Resource not found",
  "status": 404,
  "detail": "Product 99 was not found.",
  "instance": "GET /api/products/99",
  "traceId": "0HN7Q2K1B3F4D:00000001"
}

POST /api/products   { "id": 3, "name": "Bag", "price": -5 }
HTTP/1.1 400 Bad Request
{ "title": "Validation failed", "status": 400, "detail": "Price must be greater than zero.", ... }

GET /api/products/crash
HTTP/1.1 500 Internal Server Error
{ "title": "An unexpected error occurred", "status": 500, "detail": "Please contact support.", ... }

Console log:
warn: ShopApi.Exceptions.GlobalExceptionHandler[0]
      Handled NotFoundException: Product 99 was not found.
fail: ShopApi.Exceptions.GlobalExceptionHandler[0]
      Unhandled exception on GET /api/products/crash
      System.InvalidOperationException: Connection string is wrong ...`,
      explanation: 'The controller code has no try/catch at all. UseExceptionHandler catches every exception, calls GlobalExceptionHandler, which maps the exception type to a status code, logs it at the right level and writes ProblemDetails via IProblemDetailsService. The traceId comes from CustomizeProblemDetails and the exact value differs per request. For 500 errors the internal message is hidden from the client but kept in the log.',
    },
    {
      title: 'Console simulation: exception handler chain',
      scenario: 'Understand how several IExceptionHandler classes are tried in order until one handles the exception, without creating a web project.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > Next',
        'Name it ExceptionChainDemo, Framework .NET 8 or .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

// Handlers are tried in registration order, like AddExceptionHandler<T>() calls
var handlers = new List<IExceptionHandlerSim>
{
    new NotFoundHandler(),
    new ValidationHandler(),
    new GlobalHandler()
};

string Invoke(string path)
{
    try
    {
        return Endpoint(path);
    }
    catch (Exception ex)
    {
        foreach (var h in handlers)
        {
            string? response = h.TryHandle(ex);
            if (response is not null) return response;
        }
        return "500 (nobody handled it)";
    }
}

string Endpoint(string path) => path switch
{
    "/api/products/1" => "200 OK {id:1, name:Pen}",
    "/api/products/99" => throw new KeyNotFoundException("Product 99 not found"),
    "/api/products/bad" => throw new ArgumentException("Price must be positive"),
    _ => throw new InvalidOperationException("Database is down")
};

foreach (var p in new[] { "/api/products/1", "/api/products/99", "/api/products/bad", "/api/orders" })
    Console.WriteLine("GET " + p + " -> " + Invoke(p));

interface IExceptionHandlerSim
{
    string? TryHandle(Exception ex);
}

class NotFoundHandler : IExceptionHandlerSim
{
    public string? TryHandle(Exception ex) =>
        ex is KeyNotFoundException ? "404 | Resource not found | " + ex.Message : null;
}

class ValidationHandler : IExceptionHandlerSim
{
    public string? TryHandle(Exception ex) =>
        ex is ArgumentException ? "400 | Validation failed | " + ex.Message : null;
}

class GlobalHandler : IExceptionHandlerSim
{
    public string? TryHandle(Exception ex) =>
        "500 | Server error | Please contact support (logged: " + ex.GetType().Name + ")";
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

// Handlers are tried in registration order, like AddExceptionHandler<T>() calls
var handlers = new List<IExceptionHandlerSim>
{
    new NotFoundHandler(),
    new ValidationHandler(),
    new GlobalHandler()
};

string Invoke(string path)
{
    try
    {
        return Endpoint(path);
    }
    catch (Exception ex)
    {
        foreach (var h in handlers)
        {
            string? response = h.TryHandle(ex);
            if (response is not null) return response;
        }
        return "500 (nobody handled it)";
    }
}

string Endpoint(string path) => path switch
{
    "/api/products/1" => "200 OK {id:1, name:Pen}",
    "/api/products/99" => throw new KeyNotFoundException("Product 99 not found"),
    "/api/products/bad" => throw new ArgumentException("Price must be positive"),
    _ => throw new InvalidOperationException("Database is down")
};

foreach (var p in new[] { "/api/products/1", "/api/products/99", "/api/products/bad", "/api/orders" })
    Console.WriteLine("GET " + p + " -> " + Invoke(p));

interface IExceptionHandlerSim
{
    string? TryHandle(Exception ex);
}

class NotFoundHandler : IExceptionHandlerSim
{
    public string? TryHandle(Exception ex) =>
        ex is KeyNotFoundException ? "404 | Resource not found | " + ex.Message : null;
}

class ValidationHandler : IExceptionHandlerSim
{
    public string? TryHandle(Exception ex) =>
        ex is ArgumentException ? "400 | Validation failed | " + ex.Message : null;
}

class GlobalHandler : IExceptionHandlerSim
{
    public string? TryHandle(Exception ex) =>
        "500 | Server error | Please contact support (logged: " + ex.GetType().Name + ")";
}
`,
        },
        stdin: '',
      },
      result: `GET /api/products/1 -> 200 OK {id:1, name:Pen}
GET /api/products/99 -> 404 | Resource not found | Product 99 not found
GET /api/products/bad -> 400 | Validation failed | Price must be positive
GET /api/orders -> 500 | Server error | Please contact support (logged: InvalidOperationException)`,
      explanation: 'The endpoint never catches anything. Invoke plays the role of UseExceptionHandler: it catches the exception and asks each handler in order. NotFoundHandler only accepts KeyNotFoundException, ValidationHandler only ArgumentException; GlobalHandler accepts everything, so it must be registered LAST - exactly like the real AddExceptionHandler<T>() order rule.',
    },
    {
      title: 'Console simulation: structured logging with message templates and levels',
      scenario: 'See why logger.LogInformation("Order {OrderId}", 42) is better than string interpolation: the value becomes a named property, and messages under the minimum level are skipped.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StructuredLogDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Text;

var logger = new MiniLogger("OrderService", LogLevel.Information);

logger.Log(LogLevel.Debug, "Cache lookup for {Key}", "order:42");
logger.Log(LogLevel.Information, "Order {OrderId} placed by {Customer} for {Amount}", 42, "Asha", 1500);
logger.Log(LogLevel.Warning, "Stock low for {Product}: {Left} left", "Pen", 3);
logger.Log(LogLevel.Error, "Payment failed for order {OrderId}", 43);

enum LogLevel { Trace, Debug, Information, Warning, Error, Critical }

class MiniLogger(string category, LogLevel minLevel)
{
    public void Log(LogLevel level, string template, params object[] args)
    {
        if (level < minLevel) return;          // filtered by configuration

        var message = new StringBuilder();
        var props = new List<string>();
        int argIndex = 0, i = 0;
        while (i < template.Length)
        {
            if (template[i] == '{')
            {
                int end = template.IndexOf('}', i);
                string name = template.Substring(i + 1, end - i - 1);
                object value = args[argIndex++];
                message.Append(value);
                props.Add(name + "=" + value);
                i = end + 1;
            }
            else
            {
                message.Append(template[i]);
                i++;
            }
        }
        Console.WriteLine("[" + level + "] " + category + ": " + message);
        Console.WriteLine("    props: " + string.Join(", ", props));
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Text;

var logger = new MiniLogger("OrderService", LogLevel.Information);

logger.Log(LogLevel.Debug, "Cache lookup for {Key}", "order:42");
logger.Log(LogLevel.Information, "Order {OrderId} placed by {Customer} for {Amount}", 42, "Asha", 1500);
logger.Log(LogLevel.Warning, "Stock low for {Product}: {Left} left", "Pen", 3);
logger.Log(LogLevel.Error, "Payment failed for order {OrderId}", 43);

enum LogLevel { Trace, Debug, Information, Warning, Error, Critical }

class MiniLogger(string category, LogLevel minLevel)
{
    public void Log(LogLevel level, string template, params object[] args)
    {
        if (level < minLevel) return;          // filtered by configuration

        var message = new StringBuilder();
        var props = new List<string>();
        int argIndex = 0, i = 0;
        while (i < template.Length)
        {
            if (template[i] == '{')
            {
                int end = template.IndexOf('}', i);
                string name = template.Substring(i + 1, end - i - 1);
                object value = args[argIndex++];
                message.Append(value);
                props.Add(name + "=" + value);
                i = end + 1;
            }
            else
            {
                message.Append(template[i]);
                i++;
            }
        }
        Console.WriteLine("[" + level + "] " + category + ": " + message);
        Console.WriteLine("    props: " + string.Join(", ", props));
    }
}
`,
        },
        stdin: '',
      },
      result: `[Information] OrderService: Order 42 placed by Asha for 1500
    props: OrderId=42, Customer=Asha, Amount=1500
[Warning] OrderService: Stock low for Pen: 3 left
    props: Product=Pen, Left=3
[Error] OrderService: Payment failed for order 43
    props: OrderId=43`,
      explanation: 'The Debug message is dropped because Debug (1) < Information (2), just like "Logging:LogLevel:Default": "Information" in appsettings.json. Each {Name} hole is replaced by the next argument AND stored as a property. A log server like Seq can then answer "show all logs where OrderId = 42" - impossible with plain interpolated strings.',
    },
    {
      title: 'Serilog + health checks (database, custom disk check, JSON writer)',
      scenario: 'Add Serilog logging to console and daily rolling files, plus /health/live and /health/ready endpoints that check SQL Server through EF Core and free disk space.',
      steps: [
        'Open the ShopApi project; in Package Manager Console run: Install-Package Serilog.AspNetCore',
        'Install-Package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore and Install-Package Microsoft.EntityFrameworkCore.SqlServer',
        'Add the Serilog section and connection string to appsettings.json',
        'Add HealthChecks/DiskSpaceHealthCheck.cs and update Program.cs as shown',
        'Press F5; browse to https://localhost:7001/health/ready; stop SQL Server (services.msc) and refresh to see 503',
      ],
      code: `// appsettings.json
{
  "ConnectionStrings": {
    "Default": "Server=(localdb)\\\\MSSQLLocalDB;Database=ShopDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": { "Microsoft.AspNetCore": "Warning", "Microsoft.EntityFrameworkCore": "Warning" }
    },
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "File", "Args": { "path": "Logs/shop-.log", "rollingInterval": "Day", "retainedFileCountLimit": 14 } }
    ],
    "Enrich": [ "FromLogContext" ]
  },
  "AllowedHosts": "*"
}

// HealthChecks/DiskSpaceHealthCheck.cs
using Microsoft.Extensions.Diagnostics.HealthChecks;
namespace ShopApi.HealthChecks;
public class DiskSpaceHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        var drive = new DriveInfo(Path.GetPathRoot(AppContext.BaseDirectory)!);
        long freeGb = drive.AvailableFreeSpace / 1024 / 1024 / 1024;
        var data = new Dictionary<string, object> { ["freeGb"] = freeGb };
        if (freeGb < 1)  return Task.FromResult(HealthCheckResult.Unhealthy("Disk almost full", data: data));
        if (freeGb < 10) return Task.FromResult(HealthCheckResult.Degraded("Disk space low", data: data));
        return Task.FromResult(HealthCheckResult.Healthy("Disk OK", data));
    }
}

// Program.cs
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Serilog;
using ShopApi.Data;
using ShopApi.Exceptions;
using ShopApi.HealthChecks;

Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateBootstrapLogger();
try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Services.AddSerilog((services, lc) => lc
        .ReadFrom.Configuration(builder.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    builder.Services.AddControllers();
    builder.Services.AddDbContext<AppDbContext>(o =>
        o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
    builder.Services.AddProblemDetails();
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<AppDbContext>("database", tags: ["ready"])
        .AddCheck<DiskSpaceHealthCheck>("disk", tags: ["ready"]);

    var app = builder.Build();
    app.UseExceptionHandler();
    app.UseSerilogRequestLogging();   // one summary line per request

    app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
    app.MapHealthChecks("/health/ready", new HealthCheckOptions
    {
        Predicate = r => r.Tags.Contains("ready"),
        ResponseWriter = WriteJson
    });
    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start");
}
finally
{
    Log.CloseAndFlush();
}

static Task WriteJson(HttpContext ctx, HealthReport report)
{
    ctx.Response.ContentType = "application/json";
    var body = new
    {
        status = report.Status.ToString(),
        totalMs = report.TotalDuration.TotalMilliseconds,
        checks = report.Entries.Select(e => new
        {
            name = e.Key,
            status = e.Value.Status.ToString(),
            description = e.Value.Description,
            data = e.Value.Data
        })
    };
    return ctx.Response.WriteAsync(JsonSerializer.Serialize(body));
}`,
      result: `GET /health/live   -> 200 OK   text/plain   Healthy

GET /health/ready  -> 200 OK   application/json
{"status":"Healthy","totalMs":38.2,"checks":[
  {"name":"database","status":"Healthy","description":null,"data":{}},
  {"name":"disk","status":"Healthy","description":"Disk OK","data":{"freeGb":120}}]}

(SQL Server stopped)
GET /health/ready  -> 503 Service Unavailable
{"status":"Unhealthy","totalMs":15012.4,"checks":[
  {"name":"database","status":"Unhealthy",...},{"name":"disk","status":"Healthy",...}]}

Console / Logs/shop-20261117.log:
[10:15:02 INF] HTTP GET /health/ready responded 200 in 38.6012 ms
[10:16:40 INF] HTTP GET /health/ready responded 503 in 15020.1 ms`,
      explanation: 'The bootstrap logger catches start-up errors; AddSerilog then replaces it using appsettings.json (Microsoft.AspNetCore noise is raised to Warning). /health/live runs no checks (Predicate = false) so it is always Healthy while the process is alive. /health/ready runs the checks tagged "ready"; the overall status is the worst entry, and Unhealthy maps to 503 so the load balancer stops sending traffic. Timings, dates and free space will differ on your machine. In appsettings.json the LocalDB backslash is written as a double backslash.',
    },
    {
      title: 'Console simulation: health report aggregation',
      scenario: 'Reproduce how HealthCheckService combines several checks into one status and HTTP code.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it HealthReportDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Linq;

// Same numeric order as Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus
Report("Normal day", new[] { ("database", HealthStatus.Healthy), ("redis", HealthStatus.Healthy), ("disk", HealthStatus.Healthy) });
Report("Cache slow", new[] { ("database", HealthStatus.Healthy), ("redis", HealthStatus.Degraded), ("disk", HealthStatus.Healthy) });
Report("DB down",    new[] { ("database", HealthStatus.Unhealthy), ("redis", HealthStatus.Degraded), ("disk", HealthStatus.Healthy) });

static void Report(string title, (string Name, HealthStatus Status)[] entries)
{
    HealthStatus overall = entries.Min(e => e.Status);   // worst wins
    int httpCode = overall == HealthStatus.Unhealthy ? 503 : 200;
    Console.WriteLine("== " + title + " ==");
    foreach (var e in entries)
        Console.WriteLine("  " + e.Name.PadRight(9) + e.Status);
    Console.WriteLine("  overall: " + overall + " -> HTTP " + httpCode);
}

enum HealthStatus { Unhealthy = 0, Degraded = 1, Healthy = 2 }`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Linq;

// Same numeric order as Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus
Report("Normal day", new[] { ("database", HealthStatus.Healthy), ("redis", HealthStatus.Healthy), ("disk", HealthStatus.Healthy) });
Report("Cache slow", new[] { ("database", HealthStatus.Healthy), ("redis", HealthStatus.Degraded), ("disk", HealthStatus.Healthy) });
Report("DB down",    new[] { ("database", HealthStatus.Unhealthy), ("redis", HealthStatus.Degraded), ("disk", HealthStatus.Healthy) });

static void Report(string title, (string Name, HealthStatus Status)[] entries)
{
    HealthStatus overall = entries.Min(e => e.Status);   // worst wins
    int httpCode = overall == HealthStatus.Unhealthy ? 503 : 200;
    Console.WriteLine("== " + title + " ==");
    foreach (var e in entries)
        Console.WriteLine("  " + e.Name.PadRight(9) + e.Status);
    Console.WriteLine("  overall: " + overall + " -> HTTP " + httpCode);
}

enum HealthStatus { Unhealthy = 0, Degraded = 1, Healthy = 2 }
`,
        },
        stdin: '',
      },
      result: `== Normal day ==
  database Healthy
  redis    Healthy
  disk     Healthy
  overall: Healthy -> HTTP 200
== Cache slow ==
  database Healthy
  redis    Degraded
  disk     Healthy
  overall: Degraded -> HTTP 200
== DB down ==
  database Unhealthy
  redis    Degraded
  disk     Healthy
  overall: Unhealthy -> HTTP 503`,
      explanation: 'HealthStatus values are ordered Unhealthy < Degraded < Healthy, so Min() picks the worst status. Degraded still returns 200 (the app works, but slower); only Unhealthy returns 503. PadRight(9) aligns the names ("database" is 8 characters plus one space).',
    },
  ],
  interview: [
    { q: 'What is the difference between UseDeveloperExceptionPage and UseExceptionHandler?', a: 'UseDeveloperExceptionPage shows full exception details and stack trace (Development only, enabled automatically). UseExceptionHandler catches exceptions in production, logs them and returns a safe generic response (ProblemDetails or an error page).', level: 'Easy' },
    { q: 'What is IExceptionHandler and when was it introduced?', a: 'An interface added in .NET 8 with ValueTask<bool> TryHandleAsync(HttpContext, Exception, CancellationToken). Implementations are registered with AddExceptionHandler<T>() and called in order by UseExceptionHandler until one returns true.', level: 'Medium' },
    { q: 'What is ProblemDetails?', a: 'The standard (RFC 7807, updated by RFC 9457) JSON format for API errors with type, title, status, detail, instance and extensions. AddProblemDetails() makes ASP.NET Core produce it automatically.', level: 'Easy' },
    { q: 'Why should you not return exception.Message for 500 errors?', a: 'It may leak internal details (SQL, file paths, connection strings) to attackers. Log the full exception and return a generic message with a traceId the user can quote to support.', level: 'Medium' },
    { q: 'Exception middleware vs exception filter: which catches more?', a: 'Middleware (UseExceptionHandler) catches exceptions from the whole pipeline including other middleware, routing and Minimal APIs. MVC exception filters only see exceptions thrown inside MVC actions/filters.', level: 'Medium' },
    { q: 'What are the log levels in order?', a: 'Trace (0), Debug (1), Information (2), Warning (3), Error (4), Critical (5), None (6).', level: 'Easy' },
    { q: 'Why use message templates instead of string interpolation in logs?', a: 'Templates keep the values as named properties (structured logging) for querying, and avoid formatting the string when the level is disabled. Interpolation produces only flat text and always allocates.', level: 'Medium' },
    { q: 'What does logger.BeginScope do?', a: 'It attaches properties (e.g. CorrelationId, OrderId) to all log entries written inside the using block, which helps trace one request across many log lines.', level: 'Medium' },
    { q: 'What does UseSerilogRequestLogging add?', a: 'One concise Information log per HTTP request containing method, path, status code and elapsed milliseconds, replacing many noisy framework logs.', level: 'Easy' },
    { q: 'Liveness vs readiness probe?', a: 'Liveness says the process is alive (restart it if not) and should not depend on external systems. Readiness says the app can serve traffic now (DB, cache reachable); failing readiness removes the instance from the load balancer without restarting it.', level: 'Hard' },
    { q: 'Which HTTP code does a Degraded health check return by default?', a: '200 OK. Only Unhealthy maps to 503; you can change the mapping with HealthCheckOptions.ResultStatusCodes.', level: 'Medium' },
    { q: 'Output question: minimum level is Warning. Which of LogDebug, LogInformation, LogError are written?', a: 'Only LogError, because Error (4) >= Warning (3); Debug and Information are below the minimum.', level: 'Easy' },
  ],
  practice: [
    { task: 'Add a ConflictException that maps to HTTP 409 in GlobalExceptionHandler and throw it when a product name already exists.', hint: 'Add a case to the switch expression.', solution: 'public class ConflictException(string m) : Exception(m); in the switch: ConflictException => (StatusCodes.Status409Conflict, "Conflict"); in Create: if (Products.Any(x => x.Name == p.Name)) throw new ConflictException($"Product {p.Name} already exists.");' },
    { task: 'Write two IExceptionHandler classes (NotFoundExceptionHandler and DefaultExceptionHandler) and register them in the correct order.', hint: 'The first returns false when the exception is not NotFoundException.', solution: 'builder.Services.AddExceptionHandler<NotFoundExceptionHandler>(); builder.Services.AddExceptionHandler<DefaultExceptionHandler>(); In NotFoundExceptionHandler: if (exception is not NotFoundException) return false; ... write 404 problem; return true.' },
    { task: 'Log every order placement with OrderId and Total as structured properties and wrap it in a scope with the current user name.', hint: 'logger.BeginScope(new Dictionary<string, object> { ["User"] = name }).', solution: 'using (logger.BeginScope(new Dictionary<string, object> { ["User"] = User.Identity!.Name! })) { logger.LogInformation("Order {OrderId} placed with total {Total}", order.Id, order.Total); }' },
    { task: 'Create a custom health check that calls https://api.payment.com/ping with HttpClient and returns Degraded if it takes more than 2 seconds.', hint: 'Use Stopwatch and IHttpClientFactory.', solution: 'public class PaymentHealthCheck(IHttpClientFactory f) : IHealthCheck { public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext c, CancellationToken ct = default) { var sw = Stopwatch.StartNew(); try { var r = await f.CreateClient().GetAsync("https://api.payment.com/ping", ct); if (!r.IsSuccessStatusCode) return HealthCheckResult.Unhealthy(); return sw.ElapsedMilliseconds > 2000 ? HealthCheckResult.Degraded("Slow") : HealthCheckResult.Healthy(); } catch (Exception ex) { return HealthCheckResult.Unhealthy("Down", ex); } } }' },
    { task: 'Configure Serilog so that logs from the Microsoft namespace are Warning+, your app is Debug+ in Development, and logs go to a daily file kept for 7 days.', hint: 'Use appsettings.Development.json for the Debug override.', solution: '"Serilog": { "MinimumLevel": { "Default": "Debug", "Override": { "Microsoft": "Warning" } }, "WriteTo": [ { "Name": "File", "Args": { "path": "Logs/app-.log", "rollingInterval": "Day", "retainedFileCountLimit": 7 } } ] } in appsettings.Development.json; Default "Information" in appsettings.json.' },
  ],
  quiz: [
    { question: 'Which call registers a .NET 8 IExceptionHandler implementation?', options: ['app.UseExceptionHandler<T>()', 'builder.Services.AddExceptionHandler<T>()', 'builder.Services.AddProblemDetails<T>()', 'app.MapExceptionHandler<T>()'], answer: 1, explanation: 'Handlers are registered in DI with AddExceptionHandler<T>() and invoked by app.UseExceptionHandler().' },
    { question: 'What content type does a ProblemDetails response use?', options: ['text/html', 'application/xml', 'application/problem+json', 'text/plain'], answer: 2, explanation: 'RFC 7807/9457 defines application/problem+json.' },
    { question: 'Which log line is structured logging done correctly?', options: ['logger.LogInformation("Order {OrderId} created", id)', 'logger.LogInformation($"Order {id} created")', 'logger.LogInformation("Order " + id + " created")', 'Console.WriteLine("Order created")'], answer: 0, explanation: 'A message template with a named placeholder keeps OrderId as a property.' },
    { question: 'Health checks report database = Unhealthy and disk = Healthy. What is returned?', options: ['200 Healthy', '200 Degraded', '500 Internal Server Error', '503 Unhealthy'], answer: 3, explanation: 'The overall status is the worst one (Unhealthy), which maps to 503 Service Unavailable.' },
    { question: 'Which endpoint should NOT check the database?', options: ['/health/ready', '/health/live', 'Both should', 'Neither; health checks never touch the DB'], answer: 1, explanation: 'Liveness must only prove the process is alive; checking dependencies there would restart healthy apps during a DB outage.' },
  ],
};
