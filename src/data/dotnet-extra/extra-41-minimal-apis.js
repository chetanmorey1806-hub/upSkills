export default {
  id: 'extra-41-minimal-apis',
  title: 'Minimal APIs',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 41,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Build lightweight HTTP APIs in ASP.NET Core without controllers: MapGet/MapPost/MapPut/MapDelete, route groups, parameter binding, TypedResults, endpoint filters, validation, OpenAPI and EF Core integration.',
  objectives: [
    'Create a Minimal API project in Visual Studio and understand the top-level Program.cs',
    'Map CRUD endpoints with MapGet, MapPost, MapPut, MapDelete and organise them with MapGroup',
    'Use parameter binding (route, query, body, services, [AsParameters]) and TypedResults',
    'Add endpoint filters for validation and logging, and expose OpenAPI/Swagger documentation',
    'Decide when to use Minimal APIs versus controller-based APIs',
  ],
  theory: [
    {
      heading: 'What is a Minimal API?',
      content: 'A Minimal API is an ASP.NET Core HTTP API written with lambda or method handlers mapped directly on the WebApplication object, instead of controller classes. It was introduced in .NET 6 and has grown in every release (route groups and TypedResults in .NET 7, form binding and AOT in .NET 8, built-in OpenAPI document generation in .NET 9, built-in validation in .NET 10). It uses the same Kestrel server, middleware pipeline, DI container, routing, authentication and authorization as MVC; only the way endpoints are declared is different. Analogy: a controller API is a full restaurant with departments; a Minimal API is a food truck - the same kitchen quality, less building.',
      syntax: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/hello", () => "Hello World");
app.MapGet("/hello/{name}", (string name) => $"Hello {name}");

app.Run();`,
      points: [
        'Template in Visual Studio: "ASP.NET Core Web API" and UNTICK "Use controllers" (or dotnet new webapi -n MyApi).',
        'Each MapXxx call returns a RouteHandlerBuilder so you can chain .WithName(), .WithTags(), .RequireAuthorization(), .AddEndpointFilter().',
        'Handlers can be lambdas, local functions, or static methods of a class (better for big projects).',
        'Minimal APIs start faster and use less memory; they are the recommended style for Native AOT.',
      ],
    },
    {
      heading: 'HTTP verbs and parameter binding',
      content: 'Use MapGet, MapPost, MapPut, MapPatch, MapDelete (or MapMethods for custom verbs). Parameters of the handler are bound automatically: simple types whose name matches a route segment come from the route; other simple types come from the query string; complex types (classes/records) come from the JSON body; registered services come from DI; HttpContext, HttpRequest, CancellationToken and ClaimsPrincipal are special types filled by the framework. You can be explicit with [FromRoute], [FromQuery], [FromBody], [FromHeader], [FromServices], [FromForm] and group many parameters into one object with [AsParameters].',
      syntax: `app.MapGet("/products/{id:int}", (int id) => ...);                 // route
app.MapGet("/products", (string? search, int page = 1) => ...);      // query ?search=pen&page=2
app.MapPost("/products", (CreateProductDto dto, AppDbContext db) => ...); // body + DI
app.MapGet("/me", (ClaimsPrincipal user) => user.Identity?.Name);
app.MapGet("/list", ([AsParameters] PagingQuery q) => ...);           // record PagingQuery(int Page, int Size)`,
      points: [
        'Route constraints work the same as MVC: {id:int}, {slug:alpha}, {code:length(3)}.',
        'Only ONE parameter can come from the body.',
        'Optional query parameters use nullable types or default values.',
        'IFormFile parameters bind from multipart form-data (call .DisableAntiforgery() for pure APIs in .NET 8+).',
      ],
    },
    {
      heading: 'Results and TypedResults',
      content: 'A handler can return a plain object (serialized as JSON with 200 OK), a string (text/plain), or an IResult. Results.Ok(), Results.NotFound(), Results.Created(), Results.NoContent(), Results.BadRequest(), Results.ValidationProblem(), Results.Problem() build responses. TypedResults returns the concrete type (Ok<T>, NotFound...), which lets OpenAPI discover response types automatically and makes handlers unit-testable. When a handler can return several kinds of results, declare the return type as Results<Ok<Product>, NotFound>.',
      syntax: `static async Task<Results<Ok<Product>, NotFound>> GetById(int id, AppDbContext db) =>
    await db.Products.FindAsync(id) is Product p
        ? TypedResults.Ok(p)
        : TypedResults.NotFound();`,
      tip: 'Prefer TypedResults for public APIs: Swagger shows the correct 200 and 404 schemas without extra .Produces<T>() calls.',
    },
    {
      heading: 'Route groups and organising endpoints',
      content: 'MapGroup("/api/products") creates a RouteGroupBuilder: every endpoint mapped on it gets the prefix and every convention added to the group (tags, authorization, filters, rate limiting) is applied to all children. Put each feature in an extension method (MapProductEndpoints) in its own file so Program.cs stays small.',
      syntax: `public static class ProductEndpoints
{
    public static RouteGroupBuilder MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/products").WithTags("Products");
        group.MapGet("/", GetAll);
        group.MapGet("/{id:int}", GetById);
        group.MapPost("/", Create).RequireAuthorization();
        return group;
    }
}
// Program.cs
app.MapProductEndpoints();`,
    },
    {
      heading: 'Endpoint filters, validation and OpenAPI',
      content: 'Endpoint filters (IEndpointFilter or AddEndpointFilter lambda) run before and after a handler, like MVC action filters. They receive EndpointFilterInvocationContext with the bound arguments, so they are perfect for validation, logging or timing. In .NET 10 you can call builder.Services.AddValidation() to validate DataAnnotations on Minimal API parameters automatically; on .NET 8 you write a small filter. OpenAPI: .NET 9+ uses builder.Services.AddOpenApi() + app.MapOpenApi() (document at /openapi/v1.json); add Swashbuckle.AspNetCore or Scalar for a UI. On .NET 8 use AddEndpointsApiExplorer() + AddSwaggerGen() + UseSwagger()/UseSwaggerUI().',
      syntax: `group.MapPost("/", Create)
     .AddEndpointFilter(async (ctx, next) =>
     {
         var dto = ctx.GetArgument<CreateProductDto>(0);
         if (string.IsNullOrWhiteSpace(dto.Name))
             return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                 { ["Name"] = ["Name is required"] });
         return await next(ctx);
     });`,
      points: [
        'Filters run in the order added; code before await next() runs before the handler.',
        '.WithName("GetProduct") gives the endpoint a name usable by CreatedAtRoute / LinkGenerator.',
        '.WithSummary() / .WithDescription() / .Produces<T>(201) enrich the OpenAPI document.',
      ],
    },
    {
      heading: 'Minimal APIs vs Controllers',
      content: 'Both are fully supported. Choose Minimal APIs for microservices, small/medium APIs, high-performance or AOT scenarios, and vertical-slice architecture. Choose controllers when the team already uses MVC conventions, when you need features that only exist for controllers (e.g. built-in model binding of complex forms with IModelBinder, OData, action filters ecosystem, ApiController automatic 400 responses on .NET 8), or when you have very large APIs organised by controller classes. You can mix both in one project: builder.Services.AddControllers(); app.MapControllers(); alongside MapGet calls.',
      points: [
        'Minimal: less ceremony, faster start-up, TypedResults, route groups, endpoint filters.',
        'Controllers: [ApiController] conventions, action filters, model state, familiar structure.',
        'Same middleware, auth, DI, logging and EF Core in both.',
      ],
    },
  ],
  examples: [
    {
      title: 'Hello Minimal API with route and query parameters',
      scenario: 'Create the smallest possible API and see how parameters bind from the route and the query string.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Empty > Next',
        'Name it HelloMinimal, Framework .NET 8.0 (LTS) or .NET 10.0 (LTS) > Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5; the browser opens https://localhost:7xxx',
        'Browse to /greet/Asha?times=2 and /add?a=5&b=7',
      ],
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Minimal API is running");

// route parameter + optional query parameter
app.MapGet("/greet/{name}", (string name, int times = 1) =>
    string.Join(" ", Enumerable.Repeat($"Hello {name}!", times)));

// both from query string
app.MapGet("/add", (int a, int b) => new { a, b, sum = a + b });

app.Run();`,
      result: `GET /greet/Asha?times=2  ->  200 OK  text/plain
Hello Asha! Hello Asha!

GET /add?a=5&b=7  ->  200 OK  application/json
{"a":5,"b":7,"sum":12}

GET /add?a=5  ->  400 Bad Request (required parameter "int b" was not provided)`,
      explanation: 'name matches the {name} route segment so it binds from the route; times is not in the route so it binds from the query and uses its default 1 when absent. Anonymous objects are serialized as camelCase JSON. Missing a required non-nullable query parameter returns 400 automatically.',
    },
    {
      title: 'Full CRUD Product API with EF Core, route group and TypedResults',
      scenario: 'Build a Product API backed by SQL Server using Minimal APIs, organised with a route group in its own file.',
      steps: [
        'File > New > Project > ASP.NET Core Web API > Next; name ProductMinimalApi',
        'On Additional information UNTICK "Use controllers", keep "Enable OpenAPI support" ticked > Create',
        'Tools > NuGet Package Manager > Package Manager Console: Install-Package Microsoft.EntityFrameworkCore.SqlServer; Install-Package Microsoft.EntityFrameworkCore.Tools',
        'Add folders Data, Models, Endpoints and the files below; update appsettings.json',
        'In Package Manager Console: Add-Migration InitialCreate then Update-Database',
        'Press F5 and test with Swagger (/swagger) or the .http file',
      ],
      code: `// Models/Product.cs
namespace ProductMinimalApi.Models;
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}
public record CreateProductDto(string Name, decimal Price, int Stock);

// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using ProductMinimalApi.Models;
namespace ProductMinimalApi.Data;
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnModelCreating(ModelBuilder mb) =>
        mb.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
}

// Endpoints/ProductEndpoints.cs
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using ProductMinimalApi.Data;
using ProductMinimalApi.Models;
namespace ProductMinimalApi.Endpoints;
public static class ProductEndpoints
{
    public static RouteGroupBuilder MapProductEndpoints(this IEndpointRouteBuilder routes)
    {
        var g = routes.MapGroup("/api/products").WithTags("Products");
        g.MapGet("/", GetAll);
        g.MapGet("/{id:int}", GetById).WithName("GetProductById");
        g.MapPost("/", Create);
        g.MapPut("/{id:int}", Update);
        g.MapDelete("/{id:int}", Delete);
        return g;
    }

    static async Task<Ok<List<Product>>> GetAll(AppDbContext db) =>
        TypedResults.Ok(await db.Products.AsNoTracking().OrderBy(p => p.Id).ToListAsync());

    static async Task<Results<Ok<Product>, NotFound>> GetById(int id, AppDbContext db) =>
        await db.Products.FindAsync(id) is Product p ? TypedResults.Ok(p) : TypedResults.NotFound();

    static async Task<CreatedAtRoute<Product>> Create(CreateProductDto dto, AppDbContext db)
    {
        var p = new Product { Name = dto.Name, Price = dto.Price, Stock = dto.Stock };
        db.Products.Add(p);
        await db.SaveChangesAsync();
        return TypedResults.CreatedAtRoute(p, "GetProductById", new { id = p.Id });
    }

    static async Task<Results<NoContent, NotFound>> Update(int id, CreateProductDto dto, AppDbContext db)
    {
        var p = await db.Products.FindAsync(id);
        if (p is null) return TypedResults.NotFound();
        p.Name = dto.Name; p.Price = dto.Price; p.Stock = dto.Stock;
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    static async Task<Results<NoContent, NotFound>> Delete(int id, AppDbContext db)
    {
        var rows = await db.Products.Where(p => p.Id == id).ExecuteDeleteAsync();
        return rows == 0 ? TypedResults.NotFound() : TypedResults.NoContent();
    }
}

// Program.cs
using Microsoft.EntityFrameworkCore;
using ProductMinimalApi.Data;
using ProductMinimalApi.Endpoints;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();          // Install-Package Swashbuckle.AspNetCore

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.MapProductEndpoints();
app.Run();

// appsettings.json
{
  "ConnectionStrings": {
    "Default": "Server=(localdb)\\\\MSSQLLocalDB;Database=ProductMinimalDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*"
}

// ProductMinimalApi.http
POST https://localhost:7001/api/products
Content-Type: application/json

{ "name": "Pen", "price": 25.50, "stock": 100 }`,
      result: `POST /api/products  {"name":"Pen","price":25.50,"stock":100}
-> 201 Created
   Location: https://localhost:7001/api/products/1
   {"id":1,"name":"Pen","price":25.50,"stock":100}

GET /api/products/1   -> 200 OK  {"id":1,"name":"Pen","price":25.50,"stock":100}
GET /api/products/99  -> 404 Not Found
PUT /api/products/1 {"name":"Blue Pen","price":30,"stock":90} -> 204 No Content
DELETE /api/products/1 -> 204 No Content`,
      explanation: 'MapGroup gives every endpoint the /api/products prefix and the Products tag in Swagger. TypedResults with Results<Ok<Product>, NotFound> documents both 200 and 404. CreatedAtRoute uses the endpoint name to build the Location header. ExecuteDeleteAsync deletes in one SQL statement without loading the entity first.',
    },
    {
      title: 'Endpoint filter for validation and timing',
      scenario: 'Reject invalid products with a 400 ValidationProblem and log how long every endpoint in a group takes.',
      steps: [
        'Open the ProductMinimalApi project from the previous example',
        'Add Filters/ValidationFilter.cs with the code below',
        'Change the group in ProductEndpoints to add the timing filter and the validation filter on POST/PUT',
        'Press F5, POST {"name":"","price":-5,"stock":1} in Swagger and watch the Output window (Debug)',
      ],
      code: `// Filters/ValidationFilter.cs
using ProductMinimalApi.Models;
namespace ProductMinimalApi.Filters;
public class ProductValidationFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        var dto = ctx.Arguments.OfType<CreateProductDto>().FirstOrDefault();
        if (dto is null) return TypedResults.BadRequest("Body missing");

        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(dto.Name)) errors["Name"] = ["Name is required."];
        if (dto.Price <= 0) errors["Price"] = ["Price must be greater than 0."];
        if (dto.Stock < 0) errors["Stock"] = ["Stock cannot be negative."];

        return errors.Count > 0 ? TypedResults.ValidationProblem(errors) : await next(ctx);
    }
}

// in ProductEndpoints.MapProductEndpoints
var g = routes.MapGroup("/api/products").WithTags("Products")
    .AddEndpointFilter(async (ctx, next) =>
    {
        var logger = ctx.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>()
                        .CreateLogger("Timing");
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var result = await next(ctx);
        logger.LogInformation("{Method} {Path} took {Ms} ms",
            ctx.HttpContext.Request.Method, ctx.HttpContext.Request.Path, sw.ElapsedMilliseconds);
        return result;
    });
g.MapPost("/", Create).AddEndpointFilter<ProductValidationFilter>();
g.MapPut("/{id:int}", Update).AddEndpointFilter<ProductValidationFilter>();

// .NET 10 alternative: put [Required], [Range] on the DTO and call
// builder.Services.AddValidation();   // automatic 400 for Minimal APIs`,
      result: `POST /api/products {"name":"","price":-5,"stock":1}
-> 400 Bad Request  application/problem+json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["Name is required."],
    "Price": ["Price must be greater than 0."]
  }
}
Output window: info: Timing[0] POST /api/products took 3 ms  (time varies)`,
      explanation: 'The group-level filter wraps every endpoint (timing); the per-endpoint filter runs only for POST/PUT. Returning a result from a filter without calling next short-circuits the handler, so the database is never touched for invalid input.',
    },
    {
      title: 'Console simulation: how a Minimal API router maps verbs and routes',
      scenario: 'Understand the idea behind MapGet/MapPost by building a tiny in-memory router in a console app.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MiniRouterDemo, Framework .NET 8 or .NET 10',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `var routes = new List<(string Method, string Template, Func<Dictionary<string, string>, string> Handler)>();
void MapGet(string t, Func<Dictionary<string, string>, string> h) => routes.Add(("GET", t, h));
void MapPost(string t, Func<Dictionary<string, string>, string> h) => routes.Add(("POST", t, h));

var products = new List<string> { "Pen", "Book" };
MapGet("/products", _ => "200 OK [" + string.Join(",", products) + "]");
MapGet("/products/{id}", p =>
{
    int id = int.Parse(p["id"]);
    return id >= 1 && id <= products.Count ? "200 OK " + products[id - 1] : "404 Not Found";
});
MapPost("/products/{name}", p => { products.Add(p["name"]); return "201 Created /products/" + products.Count; });

string Dispatch(string method, string path)
{
    var parts = path.Trim('/').Split('/');
    foreach (var r in routes)
    {
        if (r.Method != method) continue;
        var tp = r.Template.Trim('/').Split('/');
        if (tp.Length != parts.Length) continue;
        var values = new Dictionary<string, string>();
        bool match = true;
        for (int i = 0; i < tp.Length; i++)
        {
            if (tp[i].StartsWith("{")) values[tp[i].Trim('{', '}')] = parts[i];
            else if (tp[i] != parts[i]) { match = false; break; }
        }
        if (match) return r.Handler(values);
    }
    return "404 Not Found (no route)";
}

Console.WriteLine("GET /products      -> " + Dispatch("GET", "/products"));
Console.WriteLine("GET /products/2    -> " + Dispatch("GET", "/products/2"));
Console.WriteLine("POST /products/Bag -> " + Dispatch("POST", "/products/Bag"));
Console.WriteLine("GET /products/3    -> " + Dispatch("GET", "/products/3"));
Console.WriteLine("GET /products/9    -> " + Dispatch("GET", "/products/9"));
Console.WriteLine("DELETE /products/1 -> " + Dispatch("DELETE", "/products/1"));`,
      csharp: {
        files: {
          'Program.cs': `var routes = new List<(string Method, string Template, Func<Dictionary<string, string>, string> Handler)>();
void MapGet(string t, Func<Dictionary<string, string>, string> h) => routes.Add(("GET", t, h));
void MapPost(string t, Func<Dictionary<string, string>, string> h) => routes.Add(("POST", t, h));

var products = new List<string> { "Pen", "Book" };
MapGet("/products", _ => "200 OK [" + string.Join(",", products) + "]");
MapGet("/products/{id}", p =>
{
    int id = int.Parse(p["id"]);
    return id >= 1 && id <= products.Count ? "200 OK " + products[id - 1] : "404 Not Found";
});
MapPost("/products/{name}", p => { products.Add(p["name"]); return "201 Created /products/" + products.Count; });

string Dispatch(string method, string path)
{
    var parts = path.Trim('/').Split('/');
    foreach (var r in routes)
    {
        if (r.Method != method) continue;
        var tp = r.Template.Trim('/').Split('/');
        if (tp.Length != parts.Length) continue;
        var values = new Dictionary<string, string>();
        bool match = true;
        for (int i = 0; i < tp.Length; i++)
        {
            if (tp[i].StartsWith("{")) values[tp[i].Trim('{', '}')] = parts[i];
            else if (tp[i] != parts[i]) { match = false; break; }
        }
        if (match) return r.Handler(values);
    }
    return "404 Not Found (no route)";
}

Console.WriteLine("GET /products      -> " + Dispatch("GET", "/products"));
Console.WriteLine("GET /products/2    -> " + Dispatch("GET", "/products/2"));
Console.WriteLine("POST /products/Bag -> " + Dispatch("POST", "/products/Bag"));
Console.WriteLine("GET /products/3    -> " + Dispatch("GET", "/products/3"));
Console.WriteLine("GET /products/9    -> " + Dispatch("GET", "/products/9"));
Console.WriteLine("DELETE /products/1 -> " + Dispatch("DELETE", "/products/1"));
`,
        },
        stdin: '',
      },
      result: `GET /products      -> 200 OK [Pen,Book]
GET /products/2    -> 200 OK Book
POST /products/Bag -> 201 Created /products/3
GET /products/3    -> 200 OK Bag
GET /products/9    -> 404 Not Found
DELETE /products/1 -> 404 Not Found (no route)`,
      explanation: 'Each MapXxx call stores (verb, template, handler). Dispatch picks the first route whose verb and segments match, extracting {id}/{name} into a dictionary - exactly what ASP.NET Core routing does (with a far smarter matcher). No DELETE route exists, so the last request falls through. Real ASP.NET Core returns 405 Method Not Allowed in that case.',
    },
  ],
  interview: [
    { q: 'What is a Minimal API?', a: 'An ASP.NET Core style where endpoints are mapped directly with app.MapGet/MapPost/etc. using lambdas or methods instead of controller classes. It shares the same hosting, middleware, DI and routing infrastructure.', level: 'Easy' },
    { q: 'How does a Minimal API decide where a parameter comes from?', a: 'Route values if the name matches a route parameter; query string for other simple types; JSON body for complex types; DI for registered services; special types (HttpContext, CancellationToken, ClaimsPrincipal) from the framework. Attributes like [FromQuery], [FromHeader], [FromBody], [FromServices] override the inference.', level: 'Medium' },
    { q: 'What is the difference between Results and TypedResults?', a: 'Results.Ok() returns IResult (type erased). TypedResults.Ok() returns Ok<T>, a concrete type. Concrete types let OpenAPI infer response metadata and allow unit tests to assert on the result type and value.', level: 'Medium' },
    { q: 'What is MapGroup used for?', a: 'It creates a route group with a common prefix; conventions added to the group (tags, authorization, filters, CORS, rate limiting) apply to all its endpoints. It keeps related endpoints organised.', level: 'Easy' },
    { q: 'How do you add validation to Minimal APIs on .NET 8?', a: 'Write an endpoint filter (IEndpointFilter) that inspects arguments and returns TypedResults.ValidationProblem, or use a library such as FluentValidation. On .NET 10 you can call builder.Services.AddValidation() to validate DataAnnotations automatically.', level: 'Medium' },
    { q: 'Can one project contain both controllers and Minimal APIs?', a: 'Yes. Register AddControllers() and call MapControllers() alongside MapGet/MapPost calls.', level: 'Easy' },
    { q: 'What does [AsParameters] do?', a: 'It lets you bind several handler parameters from one class/record: each property is bound as if it were a separate parameter (route, query, header, services).', level: 'Medium' },
    { q: 'How do you secure a Minimal API endpoint?', a: 'Call .RequireAuthorization() (optionally with a policy) on the endpoint or group, after adding AddAuthentication/AddAuthorization. .AllowAnonymous() opts out.', level: 'Easy' },
    { q: 'Why are Minimal APIs recommended for Native AOT?', a: 'They use source-generated request delegates (RequestDelegateGenerator) and avoid reflection-heavy MVC infrastructure, so they can be trimmed and compiled ahead of time.', level: 'Hard' },
    { q: 'Output question: app.MapGet("/sum", (int a, int b = 10) => a + b); What does GET /sum?a=5 return?', a: '200 OK with body 15 (b uses its default value 10; int result is serialized as JSON).', level: 'Medium' },
    { q: 'How do you return 201 with a Location header?', a: 'TypedResults.Created("/api/products/5", product) or TypedResults.CreatedAtRoute(product, "RouteName", new { id = 5 }).', level: 'Easy' },
  ],
  practice: [
    { task: 'Create a Minimal API for Students (Id, Name, Marks) with an in-memory List and all five CRUD endpoints in a route group /api/students.', hint: 'Register a singleton List<Student> or a StudentStore class; use TypedResults.', solution: 'builder.Services.AddSingleton<List<Student>>(); var g = app.MapGroup("/api/students"); g.MapGet("/", (List<Student> s) => s); g.MapGet("/{id:int}", (int id, List<Student> s) => s.FirstOrDefault(x => x.Id == id) is { } st ? Results.Ok(st) : Results.NotFound()); g.MapPost("/", (Student st, List<Student> s) => { st.Id = s.Count + 1; s.Add(st); return Results.Created($"/api/students/{st.Id}", st); }); plus MapPut and MapDelete similarly.' },
    { task: 'Add a search endpoint GET /api/students/search?name=a&minMarks=60 using [AsParameters].', hint: 'record StudentQuery(string? Name, int MinMarks = 0).', solution: 'g.MapGet("/search", ([AsParameters] StudentQuery q, List<Student> s) => s.Where(x => (q.Name == null || x.Name.Contains(q.Name, StringComparison.OrdinalIgnoreCase)) && x.Marks >= q.MinMarks));' },
    { task: 'Write an endpoint filter that rejects requests without header X-Api-Key = "secret".', hint: 'ctx.HttpContext.Request.Headers["X-Api-Key"].', solution: 'g.AddEndpointFilter(async (ctx, next) => ctx.HttpContext.Request.Headers["X-Api-Key"] == "secret" ? await next(ctx) : TypedResults.Unauthorized());' },
    { task: 'Convert the Product API to use EF Core InMemory provider for quick testing.', hint: 'Install Microsoft.EntityFrameworkCore.InMemory.', solution: 'builder.Services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("Products")); no migrations needed.' },
    { task: 'Add a file upload endpoint POST /api/files that saves an IFormFile to wwwroot/uploads.', hint: 'Use .DisableAntiforgery() on .NET 8+.', solution: 'app.MapPost("/api/files", async (IFormFile file, IWebHostEnvironment env) => { var path = Path.Combine(env.WebRootPath, "uploads", Path.GetRandomFileName() + Path.GetExtension(file.FileName)); Directory.CreateDirectory(Path.GetDirectoryName(path)!); await using var fs = File.Create(path); await file.CopyToAsync(fs); return Results.Ok(new { file.FileName, file.Length }); }).DisableAntiforgery();' },
  ],
  quiz: [
    { question: 'Which method maps an HTTP DELETE endpoint in a Minimal API?', options: ['app.Delete()', 'app.MapDelete()', 'app.UseDelete()', 'app.AddDelete()'], answer: 1, explanation: 'MapGet/MapPost/MapPut/MapPatch/MapDelete map endpoints.' },
    { question: 'In app.MapPost("/p", (Product p, AppDbContext db) => ...), where does db come from?', options: ['Query string', 'Request body', 'Route', 'Dependency injection container'], answer: 3, explanation: 'Registered services are resolved from DI automatically.' },
    { question: 'What does MapGroup("/api/orders") return?', options: ['RouteGroupBuilder', 'IResult', 'WebApplication', 'ControllerBase'], answer: 0, explanation: 'A RouteGroupBuilder on which you map child endpoints and add conventions.' },
    { question: 'Why use TypedResults.Ok(x) instead of Results.Ok(x)?', options: ['It is faster to type', 'It returns a concrete type for OpenAPI metadata and unit testing', 'It disables JSON serialization', 'It is required for GET requests'], answer: 1, explanation: 'Concrete result types carry response metadata and are testable.' },
    { question: 'How many parameters of a Minimal API handler can bind from the JSON body?', options: ['Unlimited', 'Two', 'One', 'Zero; body is not supported'], answer: 2, explanation: 'Only one parameter can come from the body.' },
  ],
};
