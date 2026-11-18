export default {
  id: 'day-096-cors-exceptions-logging-security',
  title: 'CORS, Global Exception Handling, Logging, API Security',
  module: 'ASP.NET Core Web API',
  day: 96,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: `Make the API production-ready. Allow the React front end to call it with a correct CORS policy, convert every exception into a consistent ProblemDetails response with IExceptionHandler, write structured logs with ILogger and Serilog (console + rolling files), and harden the API with HTTPS/HSTS, security headers, rate limiting, request size limits, secrets management and safe error messages.`,
  objectives: [
    'Explain the same-origin policy, CORS headers and preflight requests, and configure a named CORS policy',
    'Implement global exception handling with IExceptionHandler, custom exceptions and ProblemDetails',
    'Use ILogger<T> with log levels, structured message templates and Serilog sinks',
    'Apply API security measures: HTTPS, HSTS, security headers, rate limiting, secrets, least information in errors',
    'Order the middleware pipeline correctly in Program.cs',
  ],
  theory: [
    {
      heading: 'CORS - Cross-Origin Resource Sharing',
      content: `An origin is scheme + host + port. https://localhost:7001 (API) and http://localhost:5173 (React/Vite) are DIFFERENT origins. Browsers apply the same-origin policy: JavaScript may send a request to another origin, but it may not read the response unless the server allows it with CORS headers. For "non-simple" requests (PUT, DELETE, JSON bodies, Authorization header) the browser first sends a preflight OPTIONS request asking for permission. CORS is enforced by browsers only - Postman and server-to-server calls ignore it, so CORS is NOT a security feature for your API; it is a relaxation of a browser protection.`,
      syntax: `Preflight request (browser)                     Preflight response (API)
OPTIONS /api/products                          204 No Content
Origin: http://localhost:5173                  Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Request-Method: PUT              Access-Control-Allow-Methods: GET,POST,PUT,DELETE
Access-Control-Request-Headers: authorization,  Access-Control-Allow-Headers: authorization,content-type
                                content-type    Access-Control-Max-Age: 600`,
      points: [
        'Register: builder.Services.AddCors(o => o.AddPolicy("ReactApp", p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().WithMethods("GET","POST","PUT","PATCH","DELETE")))',
        'Use: app.UseCors("ReactApp") after UseRouting (if called) and BEFORE UseAuthentication/UseAuthorization',
        'AllowAnyOrigin() cannot be combined with AllowCredentials() - list exact origins instead',
        'Read allowed origins from appsettings so each environment has its own list',
      ],
    },
    {
      heading: 'Global exception handling',
      content: `Unhandled exceptions should never show a stack trace to clients (information leak) and should always produce the same JSON shape. .NET 8 introduced IExceptionHandler: implement TryHandleAsync, map exception types to status codes, write a ProblemDetails body, log the error, and return true. Register with AddExceptionHandler<T>() + AddProblemDetails() and enable with app.UseExceptionHandler() at the TOP of the pipeline so it catches errors from all later middleware and controllers.`,
      syntax: `public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            NotFoundException => (404, "Not Found"),
            BadRequestException => (400, "Bad Request"),
            _ => (500, "Internal Server Error")
        };
        logger.LogError(ex, "Unhandled exception for {Path}", ctx.Request.Path);
        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = status, Title = title }, ct);
        return true;
    }
}`,
      tip: 'Exceptions are for exceptional cases. Expected outcomes (not found, validation) can also be returned as results (Day 91). Custom exceptions + a global handler are a popular, simpler alternative - pick one style per project.',
    },
    {
      heading: 'Logging with ILogger and Serilog',
      content: `ASP.NET Core has built-in logging: inject ILogger<T> and call LogTrace, LogDebug, LogInformation, LogWarning, LogError, LogCritical. Use message templates with named placeholders - logger.LogInformation("Product {ProductId} created by {User}", id, user) - NOT string interpolation, so log systems can store ProductId as a searchable field (structured logging). Minimum levels per category are set in appsettings.json. Serilog is a popular library that adds sinks (Console, File, Seq, Elasticsearch, Application Insights) and request logging.`,
      points: [
        'Levels: Trace < Debug < Information < Warning < Error < Critical',
        'Development: Information/Debug; Production: Warning for Microsoft.*, Information for your code',
        'Never log passwords, tokens, full card numbers or personal data',
        'Correlate logs with the TraceIdentifier / traceId returned in ProblemDetails',
      ],
    },
    {
      heading: 'API security checklist',
      content: `Security is many small layers ("defense in depth"). Together with authentication and authorization (Days 94-95) apply these measures.`,
      points: [
        'HTTPS everywhere: UseHttpsRedirection() and UseHsts() in production',
        'Validate all input (Day 92); use EF Core / parameterized queries - never build SQL with string concatenation (SQL injection)',
        'Secrets (JWT key, connection strings) in User Secrets, environment variables or Azure Key Vault - never in Git',
        'Rate limiting (built-in since .NET 7): AddRateLimiter + [EnableRateLimiting("fixed")] -> 429 Too Many Requests',
        'Security headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy, Content-Security-Policy',
        'Limit request body size (Kestrel MaxRequestBodySize, [RequestSizeLimit]) and pagination size (Day 97)',
        'Return generic error messages; details only in logs; remove the Server header',
        'Keep packages updated (dotnet list package --vulnerable)',
      ],
    },
    {
      heading: 'Middleware order for a secure API',
      content: `Middleware runs in the order it is added. A wrong order is a very common bug (for example CORS headers missing on 401 responses, or exceptions not caught).`,
      syntax: `app.UseExceptionHandler();        // 1. catches everything below
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();        // 2.
app.UseSerilogRequestLogging();   // 3. one log line per request
app.UseSecurityHeaders();         // 4. custom middleware
app.UseCors("ReactApp");          // 5. before auth so 401/403 responses carry CORS headers
app.UseRateLimiter();             // 6.
app.UseAuthentication();          // 7.
app.UseAuthorization();           // 8.
app.MapControllers();             // 9. endpoints`,
    },
  ],
  examples: [
    {
      title: 'Console: mapping exceptions to ProblemDetails-style responses',
      scenario: 'Understand the idea of a global exception handler before wiring it into ASP.NET Core.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ExceptionMappingDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System.Text.Json;

var requests = new (string Path, Action Handler)[]
{
    ("/api/products/1",  () => { }),
    ("/api/products/99", () => throw new NotFoundException("Product 99 not found")),
    ("/api/products",    () => throw new BadRequestException("Price must be greater than 0")),
    ("/api/orders",      () => throw new ConflictException("SKU already exists")),
    ("/api/reports",     () => throw new InvalidOperationException("Connection string is wrong")),
};

foreach (var (path, handler) in requests)
{
    try
    {
        handler();
        Console.WriteLine($"{path} -> 200 OK");
    }
    catch (Exception ex)                        // the "global handler"
    {
        var (status, title) = ex switch
        {
            NotFoundException   => (404, "Not Found"),
            BadRequestException => (400, "Bad Request"),
            ConflictException   => (409, "Conflict"),
            _                   => (500, "Internal Server Error")
        };
        // never leak internal details of unexpected errors to the client
        string detail = status == 500 ? "An unexpected error occurred." : ex.Message;
        var problem = new { status, title, detail, instance = path };

        Console.WriteLine($"{path} -> {JsonSerializer.Serialize(problem)}");
        if (status == 500)
            Console.WriteLine($"  [ERR] Unhandled {ex.GetType().Name}: {ex.Message}");
    }
}

public class NotFoundException : Exception { public NotFoundException(string m) : base(m) { } }
public class BadRequestException : Exception { public BadRequestException(string m) : base(m) { } }
public class ConflictException : Exception { public ConflictException(string m) : base(m) { } }`,
      csharp: {
        files: {
          'Program.cs': `using System.Text.Json;

var requests = new (string Path, Action Handler)[]
{
    ("/api/products/1",  () => { }),
    ("/api/products/99", () => throw new NotFoundException("Product 99 not found")),
    ("/api/products",    () => throw new BadRequestException("Price must be greater than 0")),
    ("/api/orders",      () => throw new ConflictException("SKU already exists")),
    ("/api/reports",     () => throw new InvalidOperationException("Connection string is wrong")),
};

foreach (var (path, handler) in requests)
{
    try
    {
        handler();
        Console.WriteLine($"{path} -> 200 OK");
    }
    catch (Exception ex)                        // the "global handler"
    {
        var (status, title) = ex switch
        {
            NotFoundException   => (404, "Not Found"),
            BadRequestException => (400, "Bad Request"),
            ConflictException   => (409, "Conflict"),
            _                   => (500, "Internal Server Error")
        };
        // never leak internal details of unexpected errors to the client
        string detail = status == 500 ? "An unexpected error occurred." : ex.Message;
        var problem = new { status, title, detail, instance = path };

        Console.WriteLine($"{path} -> {JsonSerializer.Serialize(problem)}");
        if (status == 500)
            Console.WriteLine($"  [ERR] Unhandled {ex.GetType().Name}: {ex.Message}");
    }
}

public class NotFoundException : Exception { public NotFoundException(string m) : base(m) { } }
public class BadRequestException : Exception { public BadRequestException(string m) : base(m) { } }
public class ConflictException : Exception { public ConflictException(string m) : base(m) { } }`,
        },
        stdin: '',
      },
      result: `/api/products/1 -> 200 OK
/api/products/99 -> {"status":404,"title":"Not Found","detail":"Product 99 not found","instance":"/api/products/99"}
/api/products -> {"status":400,"title":"Bad Request","detail":"Price must be greater than 0","instance":"/api/products"}
/api/orders -> {"status":409,"title":"Conflict","detail":"SKU already exists","instance":"/api/orders"}
/api/reports -> {"status":500,"title":"Internal Server Error","detail":"An unexpected error occurred.","instance":"/api/reports"}
  [ERR] Unhandled InvalidOperationException: Connection string is wrong`,
      explanation: `One catch block decides the status code for every kind of error - business code just throws. Known exceptions show their message; unknown ones (bugs, infrastructure failures) show a generic message to the client while the real cause goes only to the log. The switch expression returns a tuple that is deconstructed into status and title.`,
    },
    {
      title: 'Secure Program.cs: CORS, exception handler, Serilog, rate limiting, headers',
      scenario: 'Turn the Product API into a secure application that the React app (http://localhost:5173) can call.',
      steps: [
        'Package Manager Console: Install-Package Serilog.AspNetCore',
        'Install-Package Serilog.Sinks.File',
        'Add folders Exceptions and Middleware with the files from this and the next example',
        'Update appsettings.json and replace Program.cs',
        'Press Ctrl+F5; check the Logs folder in the project directory for log-YYYYMMDD.txt',
      ],
      code: `// appsettings.json
{
  "ConnectionStrings": { "DefaultConnection": "Server=localhost;Database=ProductApiDB;Trusted_Connection=True;TrustServerCertificate=True" },
  "Cors": { "AllowedOrigins": [ "http://localhost:5173", "http://localhost:3000" ] },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": { "Microsoft.AspNetCore": "Warning", "Microsoft.EntityFrameworkCore": "Warning" }
    }
  },
  "AllowedHosts": "*"
}

// Program.cs
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using ProductApi.Exceptions;
using ProductApi.Middleware;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();                      // logs startup errors

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ---- Logging (Serilog replaces the default providers) ----
    builder.Host.UseSerilog((ctx, services, cfg) => cfg
        .ReadFrom.Configuration(ctx.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}")
        .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 14));

    // ---- Kestrel hardening ----
    builder.WebHost.ConfigureKestrel(k =>
    {
        k.AddServerHeader = false;                           // hide "Server: Kestrel"
        k.Limits.MaxRequestBodySize = 10 * 1024 * 1024;      // 10 MB
    });

    // ---- CORS ----
    string[] origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
    builder.Services.AddCors(o => o.AddPolicy("ReactApp", p => p
        .WithOrigins(origins)
        .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
        .WithHeaders("Content-Type", "Authorization")
        .WithExposedHeaders("X-Pagination", "Location")
        .SetPreflightMaxAge(TimeSpan.FromMinutes(10))));

    // ---- Global exception handling ----
    builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
    builder.Services.AddProblemDetails();

    // ---- Rate limiting: 100 requests per minute per client IP ----
    builder.Services.AddRateLimiter(o =>
    {
        o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            RateLimitPartition.GetFixedWindowLimiter(
                ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 100, Window = TimeSpan.FromMinutes(1) }));
        o.AddFixedWindowLimiter("login", l => { l.PermitLimit = 5; l.Window = TimeSpan.FromMinutes(1); });
    });

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    // + AddDbContext, AddAuthentication().AddJwtBearer(...), AddAuthorization() from Days 94-95

    var app = builder.Build();

    app.UseExceptionHandler();                  // must be first
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        app.UseHsts();                          // Strict-Transport-Security header
    }
    app.UseHttpsRedirection();
    app.UseSerilogRequestLogging();
    app.UseMiddleware<SecurityHeadersMiddleware>();
    app.UseCors("ReactApp");
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();
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

// Middleware/SecurityHeadersMiddleware.cs
namespace ProductApi.Middleware;
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var h = context.Response.Headers;
        h["X-Content-Type-Options"] = "nosniff";
        h["X-Frame-Options"] = "DENY";
        h["Referrer-Policy"] = "no-referrer";
        h["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
        await _next(context);
    }
}

// Login action - stricter limit:
// [EnableRateLimiting("login")]
// [HttpPost("login")] public async Task<IActionResult> Login(...)`,
      result: `Console on startup:
[10:00:01 INF] Microsoft.Hosting.Lifetime: Now listening on: https://localhost:7001
[10:00:01 INF] Microsoft.Hosting.Lifetime: Application started. Press Ctrl+C to shut down.

After GET /api/products:
[10:00:05 INF] Serilog.AspNetCore.RequestLoggingMiddleware: HTTP GET /api/products responded 200 in 42.1234 ms

Response headers of any request:
content-type: application/json; charset=utf-8
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: no-referrer
content-security-policy: default-src 'none'; frame-ancestors 'none'
(no "server: Kestrel" header)

6th login attempt within one minute -> 429 Too Many Requests

Logs/log-20261117.txt contains the same lines (one file per day, last 14 kept).`,
      explanation: `The bootstrap logger catches errors that happen before the host is built (for example a bad appsettings.json). Serilog's ReadFrom.Configuration reads minimum levels from the "Serilog" section. The global limiter protects every endpoint; the named "login" limiter is applied only where [EnableRateLimiting("login")] is placed - a simple brute-force protection. UseHsts is skipped in Development because HSTS is cached by the browser and would cause trouble with localhost. Times and durations differ on your machine.`,
    },
    {
      title: 'GlobalExceptionHandler with custom exceptions',
      scenario: 'Throw meaningful exceptions from services and let one handler create consistent error responses.',
      steps: [
        'Add Exceptions/AppExceptions.cs and Exceptions/GlobalExceptionHandler.cs',
        'Throw NotFoundException / ConflictException from ProductService (service layer, Day 91)',
        'Ctrl+F5; in Postman call GET /api/products/999 and GET /api/products/crash',
        'Look at the console/log output for the 500 case',
      ],
      code: `// Exceptions/AppExceptions.cs
namespace ProductApi.Exceptions;
public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
public class NotFoundException(string message) : AppException(message, StatusCodes.Status404NotFound);
public class ConflictException(string message) : AppException(message, StatusCodes.Status409Conflict);
public class BadRequestException(string message) : AppException(message, StatusCodes.Status400BadRequest);

// Exceptions/GlobalExceptionHandler.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
namespace ProductApi.Exceptions;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IProblemDetailsService _problemDetails;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger,
                                  IProblemDetailsService problemDetails, IHostEnvironment env)
    {
        _logger = logger;
        _problemDetails = problemDetails;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        int status = exception is AppException app ? app.StatusCode : StatusCodes.Status500InternalServerError;

        if (status >= 500)
            _logger.LogError(exception, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        else
            _logger.LogWarning("Handled {ExceptionType} on {Path}: {Message}", exception.GetType().Name, context.Request.Path, exception.Message);

        context.Response.StatusCode = status;
        var problem = new ProblemDetails
        {
            Status = status,
            Title = status switch { 400 => "Bad Request", 404 => "Not Found", 409 => "Conflict", _ => "Internal Server Error" },
            Detail = status >= 500 && !_env.IsDevelopment() ? "An unexpected error occurred. Please contact support." : exception.Message,
            Instance = $"{context.Request.Method} {context.Request.Path}"
        };
        problem.Extensions["traceId"] = context.TraceIdentifier;

        return await _problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = problem,
            Exception = exception
        });
    }
}

// Services/ProductService.cs (excerpt)
public async Task<ProductDto> GetAsync(int id) =>
    await _db.Products.AsNoTracking().Where(p => p.Id == id).Select(p => p.ToDto()).FirstOrDefaultAsync()
    ?? throw new NotFoundException($"Product {id} not found");

// Controllers/ProductsController.cs (excerpt) - no try/catch needed
[HttpGet("{id:int}")]
public async Task<ProductDto> Get(int id) => await _service.GetAsync(id);

[HttpGet("crash")]
public IActionResult Crash() => throw new DivideByZeroException("Attempted to divide by zero.");`,
      result: `GET /api/products/999 -> 404 Not Found
Content-Type: application/problem+json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "Product 999 not found",
  "instance": "GET /api/products/999",
  "traceId": "0HN8...:00000001"
}
Log: [WRN] ProductApi.Exceptions.GlobalExceptionHandler: Handled NotFoundException on /api/products/999: Product 999 not found

GET /api/products/crash (Production) -> 500
{ "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1", "title": "Internal Server Error", "status": 500,
  "detail": "An unexpected error occurred. Please contact support.", "instance": "GET /api/products/crash", "traceId": "0HN8...:00000002" }
Log: [ERR] ProductApi.Exceptions.GlobalExceptionHandler: Unhandled exception on GET /api/products/crash
System.DivideByZeroException: Attempted to divide by zero.
   at ProductApi.Controllers.ProductsController.Crash() ...`,
      explanation: `The client only sees the traceId; support staff search the logs for the same id to find the full stack trace. IProblemDetailsService (registered by AddProblemDetails) writes application/problem+json and fills "type" automatically from the status code. In Development the real message is shown to help debugging. You can register several IExceptionHandler classes; they run in registration order until one returns true.`,
    },
    {
      title: 'Test CORS from the React dev server (and why Postman does not care)',
      scenario: 'Prove that the CORS policy allows http://localhost:5173 and blocks other origins.',
      steps: [
        'Run the API (Ctrl+F5) at https://localhost:7001',
        'Run the React app from Day 98 (npm run dev) at http://localhost:5173',
        'Open the browser DevTools (F12) > Console and run the fetch code below',
        'DevTools > Network: click the OPTIONS request and the PUT request and inspect the headers',
        'Change "Cors:AllowedOrigins" to only http://localhost:3000, restart the API and run the fetch again',
        'Send the same PUT from Postman',
      ],
      code: `// In the browser console of http://localhost:5173
const res = await fetch("https://localhost:7001/api/products/1", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  },
  body: JSON.stringify({ name: "Laptop Pro", sku: "LAP-001", price: 75000, stock: 8, category: "Electronics" })
});
console.log(res.status);`,
      result: `Allowed origin:
OPTIONS /api/products/1  -> 204
  access-control-allow-origin: http://localhost:5173
  access-control-allow-methods: GET,POST,PUT,PATCH,DELETE
  access-control-allow-headers: Content-Type,Authorization
  access-control-max-age: 600
PUT /api/products/1      -> 204, console prints 204

Origin not in the list:
Browser console: Access to fetch at 'https://localhost:7001/api/products/1' from origin 'http://localhost:5173'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
TypeError: Failed to fetch

Postman (any configuration): PUT -> 204 - Postman is not a browser and does not enforce CORS.`,
      explanation: `The preflight asks "may origin 5173 send PUT with Authorization and Content-Type?" and the policy answers yes. When the origin is not allowed, the server still processes simple requests - the browser simply hides the response from JavaScript. That is why CORS protects users' browsers, not your API: authentication and authorization still have to secure every endpoint. In production, a React app served from the same origin as the API (or via a reverse proxy) needs no CORS at all.`,
    },
  ],
  interview: [
    { q: 'What is CORS and why is it needed?', a: 'Cross-Origin Resource Sharing is a mechanism where the server tells the browser, through Access-Control-* headers, which other origins may read its responses. It relaxes the browser same-origin policy so a React app on another port/domain can call the API.', level: 'Easy' },
    { q: 'What is a preflight request?', a: 'An automatic OPTIONS request the browser sends before a non-simple cross-origin request (e.g. PUT/DELETE, JSON content type, Authorization header) to ask whether the method and headers are allowed. The real request is sent only if the preflight succeeds.', level: 'Medium' },
    { q: 'Why can AllowAnyOrigin not be used with AllowCredentials?', a: 'The CORS specification forbids Access-Control-Allow-Origin: * when credentials (cookies, auth) are allowed, because any website could then make authenticated requests on behalf of the user. You must list specific origins.', level: 'Hard' },
    { q: 'Does CORS protect your API from Postman or curl?', a: 'No. CORS is enforced only by browsers. Non-browser clients ignore it, so APIs must rely on authentication, authorization and other measures.', level: 'Medium' },
    { q: 'What is IExceptionHandler?', a: 'A .NET 8 interface for global exception handling. TryHandleAsync receives the HttpContext and exception, writes a response and returns true if handled. Registered with AddExceptionHandler<T>() and activated by app.UseExceptionHandler().', level: 'Medium' },
    { q: 'What is ProblemDetails?', a: 'A standard JSON error format (RFC 9457, content type application/problem+json) with type, title, status, detail and instance, plus extensions such as traceId or errors.', level: 'Easy' },
    { q: 'What is structured logging?', a: 'Logging with message templates and named properties (e.g. "Order {OrderId} placed", id) so the log system stores OrderId as a field that can be searched and aggregated, rather than plain text.', level: 'Medium' },
    { q: 'Why not use string interpolation in log messages?', a: 'Interpolation creates the string even when the level is disabled (wasted work) and loses the structured properties. Message templates are cached and keep parameters as fields.', level: 'Hard' },
    { q: 'How do you add rate limiting in ASP.NET Core?', a: 'builder.Services.AddRateLimiter with fixed window, sliding window, token bucket or concurrency limiters; app.UseRateLimiter(); and [EnableRateLimiting("policy")] or a GlobalLimiter. Rejected requests get 429 (set RejectionStatusCode).', level: 'Medium' },
    { q: 'Name five security headers useful for an API.', a: 'Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy, Referrer-Policy. Also remove Server and X-Powered-By headers.', level: 'Medium' },
    { q: 'How does EF Core protect against SQL injection?', a: 'LINQ queries and FromSql with interpolated strings are converted to parameterized SQL, so user input is sent as parameters, not concatenated into the SQL text. FromSqlRaw with string concatenation is still dangerous.', level: 'Medium' },
    { q: 'Output question: UseCors is placed AFTER UseAuthorization. A browser calls a protected endpoint without a token. What does the browser show?', a: 'A CORS error instead of a clean 401: the authorization middleware short-circuits with 401 before the CORS middleware adds Access-Control-Allow-Origin, so JavaScript cannot read the response.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a "Public" CORS policy that allows GET from any origin and apply it only to ProductsController.GetAll using [EnableCors("Public")].',
      hint: 'AllowAnyOrigin().WithMethods("GET"); endpoint-level attributes override the default.',
      solution: `builder.Services.AddCors(o =>
{
    o.AddPolicy("ReactApp", p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod());
    o.AddPolicy("Public", p => p.AllowAnyOrigin().WithMethods("GET"));
});
app.UseCors();     // no default name -> uses attributes
[HttpGet] [EnableCors("Public")] public async Task<...> GetAll() { ... }
[HttpPost] [EnableCors("ReactApp")] public async Task<...> Create(...) { ... }`,
    },
    {
      task: 'Write a custom middleware that logs method, path, status code and elapsed milliseconds for every request.',
      hint: 'Use Stopwatch around await _next(context) and ILogger<T>.',
      solution: `public class TimingMiddleware(RequestDelegate next, ILogger<TimingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        await next(ctx);
        sw.Stop();
        logger.LogInformation("{Method} {Path} -> {Status} in {Elapsed} ms",
            ctx.Request.Method, ctx.Request.Path, ctx.Response.StatusCode, sw.ElapsedMilliseconds);
    }
}
app.UseMiddleware<TimingMiddleware>();`,
    },
    {
      task: 'Add a DbUpdateException case to the global handler that returns 409 "The record conflicts with existing data" (for example a unique index violation).',
      hint: 'Check exception is DbUpdateException before the default case.',
      solution: `int status = exception switch
{
    AppException app => app.StatusCode,
    DbUpdateException => StatusCodes.Status409Conflict,
    _ => StatusCodes.Status500InternalServerError
};
// Title for 409: "Conflict"; Detail: "The record conflicts with existing data"`,
    },
    {
      task: 'Add a sliding window rate limiter "search" (30 requests per minute, 6 segments) and apply it to GET /api/products/search. Return a Retry-After header.',
      hint: 'AddSlidingWindowLimiter and OnRejected.',
      solution: `builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = 429;
    o.AddSlidingWindowLimiter("search", l => { l.PermitLimit = 30; l.Window = TimeSpan.FromMinutes(1); l.SegmentsPerWindow = 6; });
    o.OnRejected = (ctx, ct) =>
    {
        ctx.HttpContext.Response.Headers.RetryAfter = "60";
        return ValueTask.CompletedTask;
    };
});
[HttpGet("search")] [EnableRateLimiting("search")] public ... Search(...)`,
    },
    {
      task: 'Move the JWT key out of appsettings.json into User Secrets and read it the same way.',
      hint: 'dotnet user-secrets works with the same configuration keys.',
      solution: `cd ProductApi
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "a-very-long-random-development-key-of-64-characters-............"
// Code is unchanged: builder.Configuration["Jwt:Key"]
// Production: environment variable Jwt__Key=...`,
    },
  ],
  quiz: [
    { question: 'Which request does a browser send before a cross-origin PUT with JSON?', options: ['HEAD', 'OPTIONS (preflight)', 'TRACE', 'CONNECT'], answer: 1, explanation: 'Non-simple requests trigger a preflight OPTIONS request.' },
    { question: 'Where should app.UseExceptionHandler() be placed?', options: ['After MapControllers', 'Just before UseAuthorization', 'At the very beginning of the pipeline', 'It does not matter'], answer: 2, explanation: 'It only catches exceptions from middleware registered after it.' },
    { question: 'Which log call is structured logging?', options: ['logger.LogInformation("Order {OrderId} placed", id)', 'logger.LogInformation($"Order {id} placed")', 'Console.WriteLine("Order " + id)', 'Debug.Print(id)'], answer: 0, explanation: 'Message templates keep OrderId as a named property.' },
    { question: 'Rate-limited requests should receive:', options: ['403', '503', '400', '429'], answer: 3, explanation: '429 Too Many Requests (set RejectionStatusCode).' },
    { question: 'Which statement about CORS is TRUE?', options: ['It blocks Postman requests', 'It is enforced by browsers, not by non-browser clients', 'It replaces authentication', 'It encrypts responses'], answer: 1, explanation: 'Only browsers enforce CORS.' },
  ],
};
