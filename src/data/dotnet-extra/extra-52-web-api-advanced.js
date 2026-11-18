export default {
  id: 'extra-52-web-api-advanced',
  title: 'Web API Advanced: Versioning, Rate Limiting, Caching, Filters and Content Negotiation',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 52,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: 'Production features every public ASP.NET Core Web API needs: API versioning (URL segment, query string, header) with Asp.Versioning and Swagger per version, built-in rate limiting (fixed window, sliding window, token bucket, concurrency, per-user partitions), HTTP caching with ETag / 304 Not Modified, MVC filters (authorization, resource, action, result) and content negotiation with JSON, XML and a custom CSV formatter.',
  objectives: [
    'Version an API without breaking existing clients and document every version in Swagger',
    'Protect endpoints with the built-in rate limiter and return 429 with Retry-After',
    'Implement conditional GET with ETag and If-None-Match to save bandwidth',
    'Write custom authorization, action and result filters and register them globally or per endpoint',
    'Return JSON, XML or CSV based on the Accept header and return 406 for unsupported formats',
  ],
  theory: [
    {
      heading: 'API versioning',
      content: 'Once mobile apps and partners use your API, you cannot change response shapes freely. Versioning lets v1 clients keep working while v2 adds breaking changes. The Asp.Versioning.Mvc package (successor of Microsoft.AspNetCore.Mvc.Versioning) reads the requested version from a URL segment (/api/v2/products), a query string (?api-version=2.0), a header (X-Api-Version: 2.0) or the media type. Mark old versions Deprecated = true and ReportApiVersions adds api-supported-versions and api-deprecated-versions response headers.',
      syntax: `builder.Services.AddApiVersioning(o =>
{
    o.DefaultApiVersion = new ApiVersion(1, 0);
    o.AssumeDefaultVersionWhenUnspecified = true;
    o.ReportApiVersions = true;
    o.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new QueryStringApiVersionReader("api-version"),
        new HeaderApiVersionReader("X-Api-Version"));
}).AddMvc().AddApiExplorer(o => { o.GroupNameFormat = "'v'VVV"; o.SubstituteApiVersionInUrl = true; });`,
      points: [
        'Version only when you BREAK the contract (rename/remove fields, change types). Adding optional fields is not breaking.',
        'URL segment versioning is the easiest to see and test; header versioning keeps URLs clean.',
        'Publish a deprecation timeline and remove old versions only after clients migrate.',
      ],
    },
    {
      heading: 'Rate limiting (.NET 7+)',
      content: 'Rate limiting protects your API from abuse, accidental loops and unfair usage. Microsoft.AspNetCore.RateLimiting is built in: AddRateLimiter registers policies, app.UseRateLimiter() enforces them, and [EnableRateLimiting("policy")] / .RequireRateLimiting("policy") applies them. Algorithms: Fixed window (N requests per window), Sliding window (window split into segments, smoother), Token bucket (bursts allowed, tokens refill at a steady rate), Concurrency (max N requests running at the same time). Partitioned limiters give each user, API key or IP its own counter.',
      syntax: `builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("fixed", x => { x.PermitLimit = 5; x.Window = TimeSpan.FromSeconds(10); });
    o.AddTokenBucketLimiter("burst", x =>
    {
        x.TokenLimit = 10; x.TokensPerPeriod = 2;
        x.ReplenishmentPeriod = TimeSpan.FromSeconds(1); x.QueueLimit = 0;
    });
});
app.UseRateLimiter();`,
      tip: 'Behind a load balancer each server has its own in-memory counters; for strict global limits use a gateway (Azure API Management, YARP) or a Redis-based limiter.',
    },
    {
      heading: 'HTTP caching for APIs: Cache-Control and ETag',
      content: 'Besides output caching (see Extra 45), APIs use HTTP validation caching. The server returns an ETag (a version fingerprint such as a hash or rowversion) with the resource. Next time the client sends If-None-Match: "<etag>"; if nothing changed the server answers 304 Not Modified with an empty body, saving bandwidth. For updates, If-Match: "<etag>" + 412 Precondition Failed gives optimistic concurrency over HTTP. Cache-Control: max-age tells clients how long they may reuse a response without asking.',
      points: [
        '200 + ETag on first GET; 304 when If-None-Match matches; 412 when If-Match does not match on PUT.',
        'Never cache personal data publicly: use Cache-Control: private or no-store.',
        'Output caching = server stores the response; ETag/304 = client stores it and the server only validates.',
      ],
    },
    {
      heading: 'Filters in Web API',
      content: 'Filters run code around controller actions inside the MVC pipeline, in this order: Authorization filters -> Resource filters -> (model binding) -> Action filters -> action -> Exception filters (on error) -> Result filters -> result execution. Implement IAsyncAuthorizationFilter, IAsyncResourceFilter, IAsyncActionFilter, IAsyncResultFilter or IExceptionFilter. Register globally (options.Filters.Add<T>()), on a controller/action with an attribute, or with [ServiceFilter(typeof(T))]/[TypeFilter(typeof(T))] when the filter needs DI. Minimal APIs use endpoint filters instead.',
      syntax: `public class TimingFilter(ILogger<TimingFilter> logger) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext ctx, ActionExecutionDelegate next)
    {
        var sw = Stopwatch.StartNew();
        var executed = await next();                 // run the action
        sw.Stop();
        ctx.HttpContext.Response.Headers["X-Elapsed-Ms"] = sw.ElapsedMilliseconds.ToString();
        logger.LogInformation("{Action} took {Ms} ms", ctx.ActionDescriptor.DisplayName, sw.ElapsedMilliseconds);
    }
}`,
      tip: 'Setting context.Result in an authorization, resource or action filter SHORT-CIRCUITS the pipeline: the action never runs.',
    },
    {
      heading: 'Content negotiation',
      content: 'The client says which format it wants with the Accept header (application/json, application/xml, text/csv; quality values like q=0.9 rank preferences). ASP.NET Core picks the first output formatter that can write the type and matches the Accept header. JSON is built in; add XML with AddXmlSerializerFormatters(); write a custom TextOutputFormatter for CSV, vCard, etc. Set ReturnHttpNotAcceptable = true to return 406 Not Acceptable instead of silently falling back to JSON. The request body format is chosen from Content-Type by input formatters.',
      syntax: `builder.Services.AddControllers(o =>
{
    o.RespectBrowserAcceptHeader = true;     // browsers send text/html,...; honour it
    o.ReturnHttpNotAcceptable = true;        // 406 when no formatter matches
    o.OutputFormatters.Add(new CsvOutputFormatter());
}).AddXmlSerializerFormatters();`,
    },
  ],
  examples: [
    {
      title: 'Versioned Product API with Swagger per version and rate limiting',
      scenario: 'v1 returns a plain list (deprecated). v2 returns a paged object with prices. Anonymous users may call the API 5 times per 10 seconds; logged-in users get 100 requests per minute each.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API; name VersionedApi; .NET 8/10; Use controllers ticked > Create',
        'Package Manager Console: Install-Package Asp.Versioning.Mvc; Install-Package Asp.Versioning.Mvc.ApiExplorer (Swashbuckle.AspNetCore is already in the template for .NET 8; on .NET 9/10 run Install-Package Swashbuckle.AspNetCore)',
        'Add Controllers/V1/ProductsController.cs and Controllers/V2/ProductsController.cs, replace Program.cs',
        'Press F5; the Swagger UI shows a "Select a definition" dropdown with v1 and v2',
        'In a terminal run the curl loop shown in the result to trigger 429',
      ],
      code: `// Controllers/V1/ProductsController.cs
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
namespace VersionedApi.Controllers.V1;

[ApiController]
[ApiVersion("1.0", Deprecated = true)]
[Route("api/v{version:apiVersion}/products")]
[Route("api/products")]                         // allows ?api-version= and header versioning
[EnableRateLimiting("per-user")]
public class ProductsController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new[] { new { id = 1, name = "Pen" }, new { id = 2, name = "Book" } });
}

// Controllers/V2/ProductsController.cs
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
namespace VersionedApi.Controllers.V2;

[ApiController]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/products")]
[Route("api/products")]
[EnableRateLimiting("per-user")]
public class ProductsController : ControllerBase
{
    private static readonly List<ProductV2> Data =
        [new(1, "Pen", 10m), new(2, "Book", 250m), new(3, "Bag", 799m)];

    [HttpGet]
    public IActionResult Get(int page = 1, int pageSize = 2) => Ok(new
    {
        page, pageSize, total = Data.Count,
        items = Data.Skip((page - 1) * pageSize).Take(pageSize)
    });

    [HttpGet("{id:int}")]
    [DisableRateLimiting]
    public IActionResult GetById(int id) =>
        Data.FirstOrDefault(p => p.Id == id) is { } p ? Ok(p) : NotFound();
}
public record ProductV2(int Id, string Name, decimal Price);

// Program.cs
using System.Threading.RateLimiting;
using Asp.Versioning;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

builder.Services.AddApiVersioning(o =>
{
    o.DefaultApiVersion = new ApiVersion(1, 0);
    o.AssumeDefaultVersionWhenUnspecified = true;
    o.ReportApiVersions = true;
    o.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new QueryStringApiVersionReader("api-version"),
        new HeaderApiVersionReader("X-Api-Version"));
})
.AddMvc()
.AddApiExplorer(o =>
{
    o.GroupNameFormat = "'v'VVV";          // v1, v2
    o.SubstituteApiVersionInUrl = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new() { Title = "Shop API", Version = "v1", Description = "Deprecated" });
    o.SwaggerDoc("v2", new() { Title = "Shop API", Version = "v2" });
});

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("per-user", ctx =>
    {
        var user = ctx.User.Identity?.IsAuthenticated == true ? ctx.User.Identity.Name : null;
        return user is not null
            ? RateLimitPartition.GetTokenBucketLimiter("user:" + user, _ => new TokenBucketRateLimiterOptions
              {
                  TokenLimit = 100, TokensPerPeriod = 100,
                  ReplenishmentPeriod = TimeSpan.FromMinutes(1), QueueLimit = 0
              })
            : RateLimitPartition.GetFixedWindowLimiter(
                "ip:" + (ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown"),
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromSeconds(10), QueueLimit = 0 });
    });
    o.OnRejected = async (context, ct) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { title = "Too many requests", status = 429 }, ct);
    };
});

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(o =>
    {
        o.SwaggerEndpoint("/swagger/v2/swagger.json", "v2");
        o.SwaggerEndpoint("/swagger/v1/swagger.json", "v1 (deprecated)");
    });
}
app.UseHttpsRedirection();
app.UseRateLimiter();
app.MapControllers();
app.Run();`,
      result: `GET /api/v1/products
200  api-supported-versions: 2.0   api-deprecated-versions: 1.0
[{"id":1,"name":"Pen"},{"id":2,"name":"Book"}]

GET /api/v2/products?page=1
200 {"page":1,"pageSize":2,"total":3,"items":[{"id":1,"name":"Pen","price":10},{"id":2,"name":"Book","price":250}]}

GET /api/products?api-version=2.0         -> same as v2
GET /api/products   X-Api-Version: 2.0    -> same as v2
GET /api/products                         -> v1 (default version assumed)
GET /api/v3/products                      -> 400 {"title":"Unsupported API version","detail":"... '3' ..."}

PowerShell: 1..7 | % { (Invoke-WebRequest https://localhost:7001/api/v2/products -SkipHttpErrorCheck).StatusCode }
200 200 200 200 200 429 429
429 response headers: Retry-After: 8   body: {"title":"Too many requests","status":429}`,
      explanation: 'The two controllers have the same name in different namespaces and declare different [ApiVersion] values; the versioning middleware routes each request by the version found in the URL, query or header, and falls back to 1.0 when none is given. GroupNameFormat creates Swagger groups v1 and v2 that match the SwaggerDoc names. The "per-user" policy partitions callers: anonymous IPs get a fixed window of 5 per 10 s, authenticated users get their own token bucket. Retry-After shows the seconds left in the window, so the exact number varies.',
    },
    {
      title: 'Filters, ETag/304 caching and content negotiation (JSON, XML, CSV)',
      scenario: 'Partners call the catalog with an API key. Every response carries X-Elapsed-Ms. Clients can ask for JSON, XML or CSV, and repeated GETs return 304 when nothing changed.',
      steps: [
        'Create (or reuse) an ASP.NET Core Web API project named CatalogApi',
        'Add folder Filters with ApiKeyAuthFilter.cs, TimingFilter.cs and ApiVersionHeaderResultFilter.cs',
        'Add Formatters/CsvOutputFormatter.cs and Controllers/CatalogController.cs; replace Program.cs; add "ApiKey": "partner-123" to appsettings.json',
        'Press F5; in Postman add header X-Api-Key: partner-123 and try Accept: application/json, application/xml, text/csv and application/pdf',
        'Copy the ETag of a GET and send it back in If-None-Match to receive 304',
      ],
      code: `// Models/ProductDto.cs  (class with parameterless ctor so XmlSerializer can use it)
namespace CatalogApi.Models;
public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Version { get; set; }
}

// Filters/ApiKeyAuthFilter.cs  (authorization filter - runs first)
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
namespace CatalogApi.Filters;
public class ApiKeyAuthFilter(IConfiguration config) : IAsyncAuthorizationFilter
{
    public Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var key = context.HttpContext.Request.Headers["X-Api-Key"].FirstOrDefault();
        if (key != config["ApiKey"])
            context.Result = new UnauthorizedObjectResult(new { message = "Missing or invalid X-Api-Key" });  // short-circuit
        return Task.CompletedTask;
    }
}

// Filters/TimingFilter.cs  (action filter - global)
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc.Filters;
namespace CatalogApi.Filters;
public class TimingFilter(ILogger<TimingFilter> logger) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var sw = Stopwatch.StartNew();
        await next();
        sw.Stop();
        context.HttpContext.Response.Headers["X-Elapsed-Ms"] = sw.ElapsedMilliseconds.ToString();
        logger.LogInformation("{Action} executed in {Ms} ms", context.ActionDescriptor.DisplayName, sw.ElapsedMilliseconds);
    }
}

// Filters/ApiVersionHeaderResultFilter.cs  (result filter)
using Microsoft.AspNetCore.Mvc.Filters;
namespace CatalogApi.Filters;
public class ApiVersionHeaderResultFilter : IResultFilter
{
    public void OnResultExecuting(ResultExecutingContext context) =>
        context.HttpContext.Response.Headers["X-Catalog-Version"] = "2026.11";
    public void OnResultExecuted(ResultExecutedContext context) { }
}

// Formatters/CsvOutputFormatter.cs
using System.Globalization;
using System.Text;
using CatalogApi.Models;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Net.Http.Headers;
namespace CatalogApi.Formatters;
public class CsvOutputFormatter : TextOutputFormatter
{
    public CsvOutputFormatter()
    {
        SupportedMediaTypes.Add(MediaTypeHeaderValue.Parse("text/csv"));
        SupportedEncodings.Add(Encoding.UTF8);
    }

    protected override bool CanWriteType(Type? type) =>
        type == typeof(ProductDto) || typeof(IEnumerable<ProductDto>).IsAssignableFrom(type);

    public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding encoding)
    {
        var items = context.Object as IEnumerable<ProductDto> ?? new[] { (ProductDto)context.Object! };
        var sb = new StringBuilder();
        sb.AppendLine("Id,Name,Price");
        foreach (var p in items)            // (real code should quote names containing commas)
            sb.AppendLine(p.Id + "," + p.Name + "," + p.Price.ToString(CultureInfo.InvariantCulture));
        await context.HttpContext.Response.WriteAsync(sb.ToString(), encoding);
    }
}

// Controllers/CatalogController.cs
using CatalogApi.Filters;
using CatalogApi.Models;
using Microsoft.AspNetCore.Mvc;
namespace CatalogApi.Controllers;

[ApiController]
[Route("api/catalog")]
[TypeFilter(typeof(ApiKeyAuthFilter))]              // needs DI (IConfiguration)
[ServiceFilter(typeof(ApiVersionHeaderResultFilter))]
public class CatalogController : ControllerBase
{
    private static readonly List<ProductDto> Products =
    [
        new() { Id = 1, Name = "Pen", Price = 10.5m, Version = 1 },
        new() { Id = 2, Name = "Book", Price = 250m, Version = 1 }
    ];

    [HttpGet]
    [Produces("application/json", "application/xml", "text/csv")]
    public ActionResult<IEnumerable<ProductDto>> GetAll() => Products;

    [HttpGet("{id:int}")]
    public IActionResult Get(int id)
    {
        var p = Products.FirstOrDefault(x => x.Id == id);
        if (p is null) return NotFound();
        string etag = "\\"p" + p.Id + "-v" + p.Version + "\\"";
        if (Request.Headers.IfNoneMatch.ToString() == etag)
            return StatusCode(StatusCodes.Status304NotModified);   // client copy is current
        Response.Headers.ETag = etag;
        Response.Headers.CacheControl = "private, max-age=60";
        return Ok(p);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, ProductDto dto)
    {
        var p = Products.FirstOrDefault(x => x.Id == id);
        if (p is null) return NotFound();
        string etag = "\\"p" + p.Id + "-v" + p.Version + "\\"";
        if (Request.Headers.IfMatch.Count > 0 && Request.Headers.IfMatch.ToString() != etag)
            return StatusCode(StatusCodes.Status412PreconditionFailed);
        p.Name = dto.Name; p.Price = dto.Price; p.Version++;
        Response.Headers.ETag = "\\"p" + p.Id + "-v" + p.Version + "\\"";
        return Ok(p);
    }
}

// Program.cs
using CatalogApi.Filters;
using CatalogApi.Formatters;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<ApiVersionHeaderResultFilter>();
builder.Services.AddControllers(o =>
{
    o.RespectBrowserAcceptHeader = true;
    o.ReturnHttpNotAcceptable = true;
    o.OutputFormatters.Add(new CsvOutputFormatter());
    o.Filters.Add<TimingFilter>();                // global action filter
})
.AddXmlSerializerFormatters();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapControllers();
app.Run();`,
      result: `GET /api/catalog            (no X-Api-Key)
401 {"message":"Missing or invalid X-Api-Key"}          (action never ran)

GET /api/catalog   X-Api-Key: partner-123   Accept: application/json
200  X-Elapsed-Ms: 0  X-Catalog-Version: 2026.11
[{"id":1,"name":"Pen","price":10.5,"version":1},{"id":2,"name":"Book","price":250,"version":1}]

Accept: application/xml
<ArrayOfProductDto xmlns:i="..." xmlns="..."><ProductDto><Id>1</Id><Name>Pen</Name><Price>10.5</Price><Version>1</Version></ProductDto>...</ArrayOfProductDto>

Accept: text/csv
Id,Name,Price
1,Pen,10.5
2,Book,250

Accept: application/pdf      -> 406 Not Acceptable

GET /api/catalog/1                       -> 200  ETag: "p1-v1"  Cache-Control: private, max-age=60
GET /api/catalog/1  If-None-Match: "p1-v1" -> 304 Not Modified (empty body)
PUT /api/catalog/1  If-Match: "p1-v1"  {"name":"Gel Pen","price":12}  -> 200  ETag: "p1-v2"
PUT /api/catalog/1  If-Match: "p1-v1"  ...                             -> 412 Precondition Failed`,
      explanation: 'The authorization filter runs before model binding and sets context.Result, which stops the pipeline - a missing key never reaches the action. TimingFilter is global and adds a header after next() returns. TypeFilter creates the filter with DI each time; ServiceFilter resolves it from the container (so it must be registered). Formatter selection follows the Accept header; ReturnHttpNotAcceptable turns "no matching formatter" into 406. The ETag is a version fingerprint: matching If-None-Match returns 304 without a body, a stale If-Match on PUT returns 412. In the C# code the ETag is written as "\\"p1-v1\\"" - the quotes are part of the ETag value. X-Elapsed-Ms values vary.',
    },
    {
      title: 'Console simulation: fixed window vs token bucket rate limiting',
      scenario: 'Eight requests arrive at seconds 0,0,0,0,1,3,10,10. Compare a fixed window (3 per 10 s) with a token bucket (3 tokens, +1 token every 2 s).',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RateLimitDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;

int[] times = { 0, 0, 0, 0, 1, 3, 10, 10 };
var fixedWindow = new FixedWindow(limit: 3, windowSeconds: 10);
var bucket = new TokenBucket(capacity: 3, refillEverySeconds: 2);
int fixedOk = 0, bucketOk = 0;

foreach (int t in times)
{
    bool a = fixedWindow.TryAcquire(t);
    bool b = bucket.TryAcquire(t);
    if (a) fixedOk++;
    if (b) bucketOk++;
    Console.WriteLine("t=" + t.ToString().PadLeft(2) + "  fixed: " + (a ? "200" : "429") + "  token: " + (b ? "200" : "429"));
}
Console.WriteLine("Allowed: fixed " + fixedOk + ", token bucket " + bucketOk);

class FixedWindow(int limit, int windowSeconds)
{
    private int _windowStart = -1, _count;
    public bool TryAcquire(int now)
    {
        int start = now / windowSeconds * windowSeconds;   // 0-9 -> 0, 10-19 -> 10
        if (start != _windowStart) { _windowStart = start; _count = 0; }
        if (_count >= limit) return false;
        _count++;
        return true;
    }
}

class TokenBucket(int capacity, int refillEverySeconds)
{
    private int _tokens = capacity, _lastRefill;
    public bool TryAcquire(int now)
    {
        int periods = (now - _lastRefill) / refillEverySeconds;
        if (periods > 0)
        {
            _tokens = Math.Min(capacity, _tokens + periods);
            _lastRefill += periods * refillEverySeconds;
        }
        if (_tokens == 0) return false;
        _tokens--;
        return true;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;

int[] times = { 0, 0, 0, 0, 1, 3, 10, 10 };
var fixedWindow = new FixedWindow(limit: 3, windowSeconds: 10);
var bucket = new TokenBucket(capacity: 3, refillEverySeconds: 2);
int fixedOk = 0, bucketOk = 0;

foreach (int t in times)
{
    bool a = fixedWindow.TryAcquire(t);
    bool b = bucket.TryAcquire(t);
    if (a) fixedOk++;
    if (b) bucketOk++;
    Console.WriteLine("t=" + t.ToString().PadLeft(2) + "  fixed: " + (a ? "200" : "429") + "  token: " + (b ? "200" : "429"));
}
Console.WriteLine("Allowed: fixed " + fixedOk + ", token bucket " + bucketOk);

class FixedWindow(int limit, int windowSeconds)
{
    private int _windowStart = -1, _count;
    public bool TryAcquire(int now)
    {
        int start = now / windowSeconds * windowSeconds;   // 0-9 -> 0, 10-19 -> 10
        if (start != _windowStart) { _windowStart = start; _count = 0; }
        if (_count >= limit) return false;
        _count++;
        return true;
    }
}

class TokenBucket(int capacity, int refillEverySeconds)
{
    private int _tokens = capacity, _lastRefill;
    public bool TryAcquire(int now)
    {
        int periods = (now - _lastRefill) / refillEverySeconds;
        if (periods > 0)
        {
            _tokens = Math.Min(capacity, _tokens + periods);
            _lastRefill += periods * refillEverySeconds;
        }
        if (_tokens == 0) return false;
        _tokens--;
        return true;
    }
}
`,
        },
        stdin: '',
      },
      result: `t= 0  fixed: 200  token: 200
t= 0  fixed: 200  token: 200
t= 0  fixed: 200  token: 200
t= 0  fixed: 429  token: 429
t= 1  fixed: 429  token: 429
t= 3  fixed: 429  token: 200
t=10  fixed: 200  token: 200
t=10  fixed: 200  token: 200
Allowed: fixed 5, token bucket 6`,
      explanation: 'Both allow the burst of 3 at t=0 and reject the 4th. The fixed window stays closed until second 10, so t=1 and t=3 are rejected. The token bucket refills: at t=3, (3 - 0) / 2 = 1 period has passed, so one token is back and the request succeeds (lastRefill moves to 2). At t=10, (10 - 2) / 2 = 4 periods, capped at capacity 3. Token buckets give smoother, fairer limits; fixed windows are simpler but allow bursts at window edges.',
    },
    {
      title: 'Console simulation: picking a formatter from the Accept header',
      scenario: 'Reproduce content negotiation: JSON, XML and CSV formatters, q-values, wildcards, and 406 when nothing matches.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ContentNegotiationDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Globalization;
using System.Linq;
using System.Text.Json;

var product = new { id = 1, name = "Pen", price = 10 };
string[] formatters = { "application/json", "application/xml", "text/csv" };   // registration order

string Negotiate(string accept)
{
    if (string.IsNullOrWhiteSpace(accept)) return Write("application/json");
    var wanted = accept.Split(',')
        .Select(part =>
        {
            var bits = part.Split(';');
            double q = bits.Length > 1 ? double.Parse(bits[1].Trim().Substring(2), CultureInfo.InvariantCulture) : 1.0;
            return (Type: bits[0].Trim(), Q: q);
        })
        .OrderByDescending(x => x.Q);
    foreach (var w in wanted)
    {
        if (w.Type == "*/*") return Write(formatters[0]);
        if (formatters.Contains(w.Type)) return Write(w.Type);
    }
    return "406 Not Acceptable";
}

string Write(string type) => "200 " + type + " | " + type switch
{
    "application/json" => JsonSerializer.Serialize(product),
    "application/xml" => "<Product><Id>1</Id><Name>Pen</Name><Price>10</Price></Product>",
    _ => "Id,Name,Price / 1,Pen,10"
};

Console.WriteLine("(no Accept)        -> " + Negotiate(""));
Console.WriteLine("application/xml    -> " + Negotiate("application/xml"));
Console.WriteLine("text/csv           -> " + Negotiate("text/csv"));
Console.WriteLine("browser header     -> " + Negotiate("text/html,application/xml;q=0.9,*/*;q=0.8"));
Console.WriteLine("csv;q=0.5,json     -> " + Negotiate("text/csv;q=0.5,application/json"));
Console.WriteLine("application/pdf    -> " + Negotiate("application/pdf"));`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Globalization;
using System.Linq;
using System.Text.Json;

var product = new { id = 1, name = "Pen", price = 10 };
string[] formatters = { "application/json", "application/xml", "text/csv" };   // registration order

string Negotiate(string accept)
{
    if (string.IsNullOrWhiteSpace(accept)) return Write("application/json");
    var wanted = accept.Split(',')
        .Select(part =>
        {
            var bits = part.Split(';');
            double q = bits.Length > 1 ? double.Parse(bits[1].Trim().Substring(2), CultureInfo.InvariantCulture) : 1.0;
            return (Type: bits[0].Trim(), Q: q);
        })
        .OrderByDescending(x => x.Q);
    foreach (var w in wanted)
    {
        if (w.Type == "*/*") return Write(formatters[0]);
        if (formatters.Contains(w.Type)) return Write(w.Type);
    }
    return "406 Not Acceptable";
}

string Write(string type) => "200 " + type + " | " + type switch
{
    "application/json" => JsonSerializer.Serialize(product),
    "application/xml" => "<Product><Id>1</Id><Name>Pen</Name><Price>10</Price></Product>",
    _ => "Id,Name,Price / 1,Pen,10"
};

Console.WriteLine("(no Accept)        -> " + Negotiate(""));
Console.WriteLine("application/xml    -> " + Negotiate("application/xml"));
Console.WriteLine("text/csv           -> " + Negotiate("text/csv"));
Console.WriteLine("browser header     -> " + Negotiate("text/html,application/xml;q=0.9,*/*;q=0.8"));
Console.WriteLine("csv;q=0.5,json     -> " + Negotiate("text/csv;q=0.5,application/json"));
Console.WriteLine("application/pdf    -> " + Negotiate("application/pdf"));
`,
        },
        stdin: '',
      },
      result: `(no Accept)        -> 200 application/json | {"id":1,"name":"Pen","price":10}
application/xml    -> 200 application/xml | <Product><Id>1</Id><Name>Pen</Name><Price>10</Price></Product>
text/csv           -> 200 text/csv | Id,Name,Price / 1,Pen,10
browser header     -> 200 application/xml | <Product><Id>1</Id><Name>Pen</Name><Price>10</Price></Product>
csv;q=0.5,json     -> 200 application/json | {"id":1,"name":"Pen","price":10}
application/pdf    -> 406 Not Acceptable`,
      explanation: 'Media types are ranked by q (default 1.0). The browser header prefers text/html (no formatter), then application/xml (0.9) which matches, so XML wins before the */* wildcard (0.8) is reached. In "text/csv;q=0.5,application/json", JSON has the higher quality 1.0. application/pdf matches nothing, so with ReturnHttpNotAcceptable = true the API answers 406. The switch expression is evaluated before concatenation because it is the right operand of +.',
    },
    {
      title: 'Console simulation: resolving the requested API version',
      scenario: 'Mimic ApiVersionReader.Combine: look for the version in the URL segment, then the query string, then the X-Api-Version header, and fall back to the default 1.0.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ApiVersionDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var none = new Dictionary<string, string>();
var v2Header = new Dictionary<string, string> { ["X-Api-Version"] = "2.0" };

Console.WriteLine("/api/v1/products                -> " + Handle("/api/v1/products", none));
Console.WriteLine("/api/v2/products                -> " + Handle("/api/v2/products", none));
Console.WriteLine("/api/products?api-version=2.0   -> " + Handle("/api/products?api-version=2.0", none));
Console.WriteLine("/api/products + header 2.0      -> " + Handle("/api/products", v2Header));
Console.WriteLine("/api/products                   -> " + Handle("/api/products", none));
Console.WriteLine("/api/v3/products                -> " + Handle("/api/v3/products", none));

static string Handle(string url, Dictionary<string, string> headers)
{
    string? version = null;
    string how = "default";
    string[] segments = url.Split('?')[0].Split('/', StringSplitOptions.RemoveEmptyEntries);

    if (segments.Length > 1 && segments[1].StartsWith("v"))
    {
        version = segments[1].Substring(1);
        how = "url";
    }
    else if (url.Contains("api-version="))
    {
        version = url.Substring(url.IndexOf("api-version=") + "api-version=".Length);
        how = "query";
    }
    else if (headers.TryGetValue("X-Api-Version", out var h))
    {
        version = h;
        how = "header";
    }

    version ??= "1.0";
    if (!version.Contains('.')) version += ".0";

    return version switch
    {
        "1.0" => "200 V1 via " + how + " (api-deprecated-versions: 1.0)",
        "2.0" => "200 V2 via " + how,
        _ => "400 Unsupported API version " + version
    };
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var none = new Dictionary<string, string>();
var v2Header = new Dictionary<string, string> { ["X-Api-Version"] = "2.0" };

Console.WriteLine("/api/v1/products                -> " + Handle("/api/v1/products", none));
Console.WriteLine("/api/v2/products                -> " + Handle("/api/v2/products", none));
Console.WriteLine("/api/products?api-version=2.0   -> " + Handle("/api/products?api-version=2.0", none));
Console.WriteLine("/api/products + header 2.0      -> " + Handle("/api/products", v2Header));
Console.WriteLine("/api/products                   -> " + Handle("/api/products", none));
Console.WriteLine("/api/v3/products                -> " + Handle("/api/v3/products", none));

static string Handle(string url, Dictionary<string, string> headers)
{
    string? version = null;
    string how = "default";
    string[] segments = url.Split('?')[0].Split('/', StringSplitOptions.RemoveEmptyEntries);

    if (segments.Length > 1 && segments[1].StartsWith("v"))
    {
        version = segments[1].Substring(1);
        how = "url";
    }
    else if (url.Contains("api-version="))
    {
        version = url.Substring(url.IndexOf("api-version=") + "api-version=".Length);
        how = "query";
    }
    else if (headers.TryGetValue("X-Api-Version", out var h))
    {
        version = h;
        how = "header";
    }

    version ??= "1.0";
    if (!version.Contains('.')) version += ".0";

    return version switch
    {
        "1.0" => "200 V1 via " + how + " (api-deprecated-versions: 1.0)",
        "2.0" => "200 V2 via " + how,
        _ => "400 Unsupported API version " + version
    };
}
`,
        },
        stdin: '',
      },
      result: `/api/v1/products                -> 200 V1 via url (api-deprecated-versions: 1.0)
/api/v2/products                -> 200 V2 via url
/api/products?api-version=2.0   -> 200 V2 via query
/api/products + header 2.0      -> 200 V2 via header
/api/products                   -> 200 V1 via default (api-deprecated-versions: 1.0)
/api/v3/products                -> 400 Unsupported API version 3.0`,
      explanation: 'URL segment "v1" becomes "1" and is normalised to "1.0". When the URL has no version segment, the query string and then the header are checked. With nothing specified, AssumeDefaultVersionWhenUnspecified gives 1.0, and ReportApiVersions tells the client that 1.0 is deprecated. Version 3.0 has no controller, so the real library returns 400 with error code UnsupportedApiVersion.',
    },
  ],
  interview: [
    { q: 'What are the common API versioning strategies?', a: 'URL segment (/api/v2/...), query string (?api-version=2.0), custom header (X-Api-Version), and media type (Accept: application/json;v=2). Asp.Versioning supports all and can combine them.', level: 'Easy' },
    { q: 'When should you create a new API version?', a: 'Only for breaking changes: removing/renaming fields, changing types or semantics, changing required inputs. Additive optional changes do not need a new version.', level: 'Medium' },
    { q: 'What does ReportApiVersions do?', a: 'Adds api-supported-versions and api-deprecated-versions response headers so clients can discover versions and deprecations.', level: 'Easy' },
    { q: 'Compare fixed window, sliding window, token bucket and concurrency limiters.', a: 'Fixed: N per fixed window (bursty at edges). Sliding: window divided into segments, smoother. Token bucket: allows bursts up to capacity, refills at steady rate. Concurrency: limits simultaneous in-flight requests, not rate.', level: 'Medium' },
    { q: 'How do you rate limit per user instead of globally?', a: 'Use a partitioned limiter: AddPolicy with RateLimitPartition.GetFixedWindowLimiter(partitionKey, ...) where the key is the user id, API key or IP.', level: 'Medium' },
    { q: 'What status code and header should a rate-limited response have?', a: '429 Too Many Requests with a Retry-After header indicating when the client may retry.', level: 'Easy' },
    { q: 'What is an ETag and how does 304 work?', a: 'An ETag is an identifier of a resource version. The client sends If-None-Match with the ETag; if unchanged the server returns 304 Not Modified with no body, and the client uses its cached copy.', level: 'Medium' },
    { q: 'What is the order of MVC filters?', a: 'Authorization -> Resource -> model binding -> Action -> action method -> (Exception on error) -> Result -> result execution; resource filters also wrap everything after them.', level: 'Medium' },
    { q: 'ServiceFilter vs TypeFilter?', a: 'ServiceFilter resolves the filter from DI (it must be registered). TypeFilter creates it with ActivatorUtilities, injecting constructor dependencies without registering the filter itself, and can pass extra arguments.', level: 'Hard' },
    { q: 'How does content negotiation choose a formatter?', a: 'It ranks the Accept header media types by quality, then finds the first output formatter that supports both the media type and the object type. If none matches it falls back to the first formatter, or returns 406 when ReturnHttpNotAcceptable is true.', level: 'Medium' },
    { q: 'How do you add XML support?', a: 'Call AddXmlSerializerFormatters() (or AddXmlDataContractSerializerFormatters()) on AddControllers(). Types need a parameterless constructor for XmlSerializer.', level: 'Easy' },
    { q: 'How do you short-circuit a request in an action filter?', a: 'Set context.Result (e.g. new BadRequestObjectResult(...)) in OnActionExecuting and do not call next(); the action does not run.', level: 'Medium' },
    { q: 'Output question: fixed window 2 per 10 s; requests at t=0,0,9,10. Which succeed?', a: 't=0, t=0 succeed; t=9 is rejected (window 0-9 full); t=10 succeeds (new window).', level: 'Easy' },
  ],
  practice: [
    { task: 'Add a v3 of the products endpoint that returns prices including 18% GST and mark v2 as deprecated.', hint: 'New controller with [ApiVersion("3.0")]; change v2 to [ApiVersion("2.0", Deprecated = true)]; add a SwaggerDoc "v3".', solution: '[ApiVersion("3.0")] [Route("api/v{version:apiVersion}/products")] public class ProductsController : ControllerBase { [HttpGet] public IActionResult Get() => Ok(Data.Select(p => new { p.Id, p.Name, priceWithGst = Math.Round(p.Price * 1.18m, 2) })); } o.SwaggerDoc("v3", new() { Title = "Shop API", Version = "v3" });' },
    { task: 'Add a concurrency limiter "reports" that allows only 2 report generations at a time and queues 5 more.', hint: 'AddConcurrencyLimiter with PermitLimit and QueueLimit.', solution: 'o.AddConcurrencyLimiter("reports", x => { x.PermitLimit = 2; x.QueueLimit = 5; x.QueueProcessingOrder = QueueProcessingOrder.OldestFirst; }); [EnableRateLimiting("reports")] on ReportsController.' },
    { task: 'Write an action filter [ValidateId] that returns 400 if any action argument named "id" is <= 0.', hint: 'Derive from ActionFilterAttribute and check context.ActionArguments.', solution: 'public class ValidateIdAttribute : ActionFilterAttribute { public override void OnActionExecuting(ActionExecutingContext c) { if (c.ActionArguments.TryGetValue("id", out var v) && v is int id && id <= 0) c.Result = new BadRequestObjectResult(new { message = "id must be positive" }); } }' },
    { task: 'Support /api/catalog.csv and /api/catalog.xml URLs using the format filter.', hint: '[FormatFilter] plus a {format?} route segment and FormatterMappings.', solution: 'builder.Services.AddControllers(o => { o.FormatterMappings.SetMediaTypeMappingForFormat("csv", "text/csv"); }); [HttpGet("/api/catalog.{format?}")] [FormatFilter] public ActionResult<IEnumerable<ProductDto>> GetAll() => Products;' },
    { task: 'Make GET /api/catalog return an ETag computed from all product versions and support 304.', hint: 'Hash or concatenate Id-Version pairs.', solution: 'var etag = "\\"" + string.Join("-", Products.Select(p => p.Id + "." + p.Version)) + "\\""; if (Request.Headers.IfNoneMatch == etag) return StatusCode(304); Response.Headers.ETag = etag; return Ok(Products);' },
  ],
  quiz: [
    { question: 'Which status code means "slow down, too many requests"?', options: ['400', '403', '429', '503'], answer: 2, explanation: '429 Too Many Requests, usually with Retry-After.' },
    { question: 'Which reader reads the version from ?api-version=2.0?', options: ['QueryStringApiVersionReader', 'UrlSegmentApiVersionReader', 'HeaderApiVersionReader', 'MediaTypeApiVersionReader'], answer: 0, explanation: 'QueryStringApiVersionReader reads the api-version query parameter by default.' },
    { question: 'A client sends If-None-Match with the current ETag. What should the server return?', options: ['200 with the body', '201 Created', '412 Precondition Failed', '304 Not Modified'], answer: 3, explanation: 'The cached copy is still valid.' },
    { question: 'Which filter type runs FIRST in the MVC filter pipeline?', options: ['Action filter', 'Authorization filter', 'Result filter', 'Exception filter'], answer: 1, explanation: 'Authorization filters run before resource, action and result filters.' },
    { question: 'With ReturnHttpNotAcceptable = true and Accept: application/pdf (no PDF formatter), the API returns...', options: ['406 Not Acceptable', 'JSON anyway', '415 Unsupported Media Type', '500 Internal Server Error'], answer: 0, explanation: '406 tells the client the requested format is not available. (415 is for an unsupported request body Content-Type.)' },
  ],
};
