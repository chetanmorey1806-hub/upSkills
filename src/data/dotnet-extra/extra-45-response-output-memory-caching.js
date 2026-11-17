export default {
  id: 'extra-45-response-output-memory-caching',
  title: 'Response, Output and Memory Caching',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 45,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Speed up ASP.NET Core apps by not doing the same work twice: in-memory caching with IMemoryCache, distributed caching (Redis) and HybridCache, HTTP response caching with Cache-Control headers, and server-side output caching with policies, vary-by rules and tag-based eviction.',
  objectives: [
    'Explain the three cache layers: client/proxy (response caching), server output (output caching) and data (memory/distributed caching)',
    'Cache database results with IMemoryCache using absolute and sliding expiration and invalidate on writes',
    'Configure output caching policies with SetVaryByQuery, Tag and EvictByTagAsync',
    'Use [ResponseCache] / Cache-Control headers and know when caching is dangerous (personal data, authenticated responses)',
    'Know when to choose IDistributedCache (Redis) or HybridCache in a multi-server deployment',
  ],
  theory: [
    {
      heading: 'Why cache and where?',
      content: 'Caching means storing the result of expensive work (a SQL query, an external API call, a rendered page) so the next request can reuse it. A cache hit is fast; a cache miss does the real work and saves the result. Analogy: a canteen cooks a big pot of rice in the morning (cache) instead of cooking one plate for each student (database call). There are three main layers in ASP.NET Core.',
      points: [
        'Response caching: the server sends Cache-Control headers; the BROWSER or a proxy/CDN keeps the response. The request may never reach your server.',
        'Output caching (.NET 7+): the SERVER stores the whole HTTP response and replays it; you control it fully and can evict it.',
        'Data caching: IMemoryCache (inside one server process), IDistributedCache (Redis/SQL Server, shared by many servers), HybridCache (.NET 9+, both combined).',
        'Golden rule: "There are only two hard things in computer science: cache invalidation and naming things." Always plan HOW the cache gets refreshed.',
      ],
    },
    {
      heading: 'IMemoryCache',
      content: 'Register with builder.Services.AddMemoryCache() and inject IMemoryCache. Use TryGetValue/Set or the convenient GetOrCreateAsync. Each entry can have an absolute expiration (dies after a fixed time), a sliding expiration (dies if not used for some time), a priority and a size. Remove(key) deletes an entry when the underlying data changes.',
      syntax: `var products = await cache.GetOrCreateAsync("products:all", async entry =>
{
    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
    entry.SlidingExpiration = TimeSpan.FromMinutes(1);
    return await db.Products.AsNoTracking().ToListAsync();
});

cache.Remove("products:all");   // after insert/update/delete`,
      points: [
        'Memory cache lives in the web server RAM: it is lost on restart and NOT shared between two servers.',
        'Combine sliding with an absolute limit, otherwise a popular entry may never refresh.',
        'If you set SizeLimit in AddMemoryCache, every entry MUST set entry.Size.',
        'Cache DTOs/read-only lists, not tracked EF entities or DbContext objects.',
      ],
    },
    {
      heading: 'Distributed cache and HybridCache',
      content: 'When the API runs on several servers (load balancer, Kubernetes), each memory cache is different. IDistributedCache stores byte[] in a shared store such as Redis (package Microsoft.Extensions.Caching.StackExchangeRedis). HybridCache (package Microsoft.Extensions.Caching.Hybrid, .NET 9+) gives one API that uses memory first (L1) and Redis second (L2), serializes for you, and protects against "cache stampede" (many requests rebuilding the same entry at the same time).',
      syntax: `builder.Services.AddStackExchangeRedisCache(o => o.Configuration = "localhost:6379");
builder.Services.AddHybridCache();   // uses Redis automatically as L2 if registered

var dto = await hybridCache.GetOrCreateAsync($"product:{id}",
    async ct => await LoadProductAsync(id, ct),
    tags: ["products"], cancellationToken: ct);
await hybridCache.RemoveByTagAsync("products");`,
    },
    {
      heading: 'Response caching (HTTP headers)',
      content: 'The [ResponseCache] attribute sets the Cache-Control header, e.g. Cache-Control: public,max-age=60. The browser then reuses the response for 60 seconds. AddResponseCaching() + UseResponseCaching() also adds a small server cache that respects these headers (needed for VaryByQueryKeys). Because the client decides, you cannot force a browser to forget the cached copy - use it for public, rarely changing data (country lists, product images).',
      syntax: `[HttpGet("countries")]
[ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
public IActionResult Countries() => Ok(new[] { "India", "Nepal", "Japan" });

[HttpGet("me")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public IActionResult Me() => Ok(User.Identity!.Name);`,
      tip: 'Never cache personal or authenticated responses as "public": a shared proxy could give User A\'s data to User B.',
    },
    {
      heading: 'Output caching (.NET 7+)',
      content: 'Output caching stores complete responses on the server. Add builder.Services.AddOutputCache() and app.UseOutputCache(), then mark endpoints with [OutputCache] or .CacheOutput(). Policies define the duration, what makes a different cache entry (SetVaryByQuery, SetVaryByHeader, SetVaryByRouteValue) and tags. When data changes, IOutputCacheStore.EvictByTagAsync("products") removes all tagged entries. By default only GET/HEAD 200 responses without Set-Cookie and without an authenticated user are cached. Built-in resource locking means only one request rebuilds an expired entry.',
      syntax: `builder.Services.AddOutputCache(o =>
{
    o.AddBasePolicy(b => b.Expire(TimeSpan.FromSeconds(30)));
    o.AddPolicy("Products", b => b.Expire(TimeSpan.FromMinutes(2))
                                  .SetVaryByQuery("page", "pageSize")
                                  .Tag("products"));
});
app.UseOutputCache();
app.MapGet("/api/products", GetProducts).CacheOutput("Products");`,
      points: [
        'Response caching = client decides; Output caching = server decides and can evict.',
        'For multi-server setups use AddStackExchangeRedisOutputCache (.NET 8+) so all servers share the output cache.',
        'Middleware order: UseCors and UseAuthentication/UseAuthorization before UseOutputCache when you rely on them.',
      ],
    },
  ],
  examples: [
    {
      title: 'Product API with IMemoryCache and cache invalidation',
      scenario: 'GET /api/products is called thousands of times a minute but products change rarely. Cache the list for 5 minutes and clear it whenever a product is added.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API; name CacheDemoApi; .NET 8/10; Use controllers ticked > Create',
        'Package Manager Console: Install-Package Microsoft.EntityFrameworkCore.SqlServer and Install-Package Microsoft.EntityFrameworkCore.Tools',
        'Add Models/Product.cs, Data/AppDbContext.cs, Services/ProductService.cs, Controllers/ProductsController.cs',
        'Add the connection string to appsettings.json; run Add-Migration Init and Update-Database',
        'Press F5; call GET /api/products twice in Swagger and watch the console: only the first call logs "Cache MISS"',
      ],
      code: `// Models/Product.cs
namespace CacheDemoApi.Models;
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}
public record ProductDto(int Id, string Name, decimal Price);
public record CreateProductDto(string Name, decimal Price);

// Data/AppDbContext.cs
using CacheDemoApi.Models;
using Microsoft.EntityFrameworkCore;
namespace CacheDemoApi.Data;
public class AppDbContext(DbContextOptions<AppDbContext> o) : DbContext(o)
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
        mb.Entity<Product>().HasData(new Product { Id = 1, Name = "Pen", Price = 10 },
                                     new Product { Id = 2, Name = "Book", Price = 250 });
    }
}

// Services/ProductService.cs
using CacheDemoApi.Data;
using CacheDemoApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
namespace CacheDemoApi.Services;

public class ProductService(AppDbContext db, IMemoryCache cache, ILogger<ProductService> logger)
{
    private const string AllKey = "products:all";

    public async Task<List<ProductDto>> GetAllAsync()
    {
        var list = await cache.GetOrCreateAsync(AllKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            entry.SlidingExpiration = TimeSpan.FromMinutes(1);
            entry.Size = 1;
            logger.LogInformation("Cache MISS - loading products from SQL Server");
            return await db.Products.AsNoTracking()
                .OrderBy(p => p.Id)
                .Select(p => new ProductDto(p.Id, p.Name, p.Price))
                .ToListAsync();
        });
        return list!;
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var p = new Product { Name = dto.Name, Price = dto.Price };
        db.Products.Add(p);
        await db.SaveChangesAsync();
        cache.Remove(AllKey);                       // invalidate
        logger.LogInformation("Cache cleared after creating product {Id}", p.Id);
        return new ProductDto(p.Id, p.Name, p.Price);
    }
}

// Controllers/ProductsController.cs
using CacheDemoApi.Models;
using CacheDemoApi.Services;
using Microsoft.AspNetCore.Mvc;
namespace CacheDemoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(ProductService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetAll() => await service.GetAllAsync();

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
    {
        var created = await service.CreateAsync(dto);
        return Created($"/api/products/{created.Id}", created);
    }
}

// Program.cs
using CacheDemoApi.Data;
using CacheDemoApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddMemoryCache(o => o.SizeLimit = 1024);
builder.Services.AddScoped<ProductService>();

var app = builder.Build();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.MapControllers();
app.Run();`,
      result: `GET /api/products   (1st call, 42 ms)
[{"id":1,"name":"Pen","price":10},{"id":2,"name":"Book","price":250}]
console: info: CacheDemoApi.Services.ProductService[0] Cache MISS - loading products from SQL Server

GET /api/products   (2nd call, 1 ms) -> same JSON, no SQL query, no "Cache MISS" log

POST /api/products  {"name":"Bag","price":799}
201 Created  Location: /api/products/3
{"id":3,"name":"Bag","price":799}
console: info: ... Cache cleared after creating product 3

GET /api/products   -> Cache MISS again, now returns 3 products`,
      explanation: 'GetOrCreateAsync runs the factory only when the key is missing. The entry dies 5 minutes after creation (absolute) or after 1 minute without reads (sliding), whichever comes first. Because SizeLimit is set, entry.Size is mandatory. The POST removes the key so the next GET reloads fresh data. Timings are examples and will differ.',
    },
    {
      title: 'Console simulation: cache hits, misses and expiration with a fake clock',
      scenario: 'Trace exactly when the database is called by a GetOrCreate cache with a 60-second absolute expiration.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MemoryCacheDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var clock = new FakeClock();
var cache = new SimpleCache(clock);
int dbCalls = 0;

string LoadProducts()
{
    dbCalls++;
    return "Pen,Book (db call #" + dbCalls + ")";
}

Console.WriteLine("t=0  " + cache.GetOrCreate("products", 60, LoadProducts));
clock.Now = 30;
Console.WriteLine("t=30 " + cache.GetOrCreate("products", 60, LoadProducts));
clock.Now = 61;
Console.WriteLine("t=61 " + cache.GetOrCreate("products", 60, LoadProducts));
cache.Remove("products");
Console.WriteLine("after Remove " + cache.GetOrCreate("products", 60, LoadProducts));
Console.WriteLine("Total DB calls: " + dbCalls);

class FakeClock
{
    public int Now { get; set; }   // seconds
}

class SimpleCache(FakeClock clock)
{
    private readonly Dictionary<string, (string Value, int ExpiresAt)> _items = new();

    public string GetOrCreate(string key, int ttlSeconds, Func<string> factory)
    {
        if (_items.TryGetValue(key, out var item) && clock.Now < item.ExpiresAt)
            return "HIT  -> " + item.Value;

        string value = factory();
        _items[key] = (value, clock.Now + ttlSeconds);
        return "MISS -> " + value;
    }

    public void Remove(string key) => _items.Remove(key);
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var clock = new FakeClock();
var cache = new SimpleCache(clock);
int dbCalls = 0;

string LoadProducts()
{
    dbCalls++;
    return "Pen,Book (db call #" + dbCalls + ")";
}

Console.WriteLine("t=0  " + cache.GetOrCreate("products", 60, LoadProducts));
clock.Now = 30;
Console.WriteLine("t=30 " + cache.GetOrCreate("products", 60, LoadProducts));
clock.Now = 61;
Console.WriteLine("t=61 " + cache.GetOrCreate("products", 60, LoadProducts));
cache.Remove("products");
Console.WriteLine("after Remove " + cache.GetOrCreate("products", 60, LoadProducts));
Console.WriteLine("Total DB calls: " + dbCalls);

class FakeClock
{
    public int Now { get; set; }   // seconds
}

class SimpleCache(FakeClock clock)
{
    private readonly Dictionary<string, (string Value, int ExpiresAt)> _items = new();

    public string GetOrCreate(string key, int ttlSeconds, Func<string> factory)
    {
        if (_items.TryGetValue(key, out var item) && clock.Now < item.ExpiresAt)
            return "HIT  -> " + item.Value;

        string value = factory();
        _items[key] = (value, clock.Now + ttlSeconds);
        return "MISS -> " + value;
    }

    public void Remove(string key) => _items.Remove(key);
}
`,
        },
        stdin: '',
      },
      result: `t=0  MISS -> Pen,Book (db call #1)
t=30 HIT  -> Pen,Book (db call #1)
t=61 MISS -> Pen,Book (db call #2)
after Remove MISS -> Pen,Book (db call #3)
Total DB calls: 3`,
      explanation: 'At t=0 the key is missing, so the factory runs and the entry expires at 60. At t=30 30 < 60, so the cached value (still "call #1") is returned without touching the database. At t=61 the entry is expired, the factory runs again and the new expiry is 121. Remove simulates invalidation after an insert, forcing a third load. A fake clock makes the demo deterministic - real code uses TimeProvider.',
    },
    {
      title: 'Output caching with policies, vary-by-query and tag eviction (plus [ResponseCache])',
      scenario: 'Cache paged product lists on the server for 2 minutes per page, evict them when a product is created, and let browsers cache the static country list for one hour.',
      steps: [
        'Open CacheDemoApi; no extra NuGet package is needed (output caching is part of ASP.NET Core 7+)',
        'Update Program.cs with AddOutputCache, AddResponseCaching and the middleware calls',
        'Add Controllers/CatalogController.cs',
        'Press F5; call GET /api/catalog?page=1 twice and compare the Age response header; then POST and call again',
        'Press F12 in the browser > Network tab on /api/catalog/countries to see Cache-Control: public,max-age=3600',
      ],
      code: `// Program.cs (relevant part)
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddResponseCaching();
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(b => b.Expire(TimeSpan.FromSeconds(30)));
    options.AddPolicy("Products", b => b
        .Expire(TimeSpan.FromMinutes(2))
        .SetVaryByQuery("page", "pageSize")
        .Tag("products"));
});

var app = builder.Build();
app.UseHttpsRedirection();
app.UseCors();
app.UseResponseCaching();
app.UseOutputCache();
app.MapControllers();
app.Run();

// Controllers/CatalogController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
namespace CacheDemoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    private static readonly List<string> Items = ["Pen", "Book", "Bag", "Lamp", "Mug"];

    [HttpGet]
    [OutputCache(PolicyName = "Products")]
    public IActionResult Get(int page = 1, int pageSize = 2) => Ok(new
    {
        page,
        generatedAt = DateTime.UtcNow.ToString("HH:mm:ss"),
        items = Items.Skip((page - 1) * pageSize).Take(pageSize)
    });

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] string name, IOutputCacheStore store, CancellationToken ct)
    {
        Items.Add(name);
        await store.EvictByTagAsync("products", ct);   // all pages are stale now
        return Ok(Items.Count);
    }

    [HttpGet("countries")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
    public IActionResult Countries() => Ok(new[] { "India", "Nepal", "Japan" });

    [HttpGet("my-orders")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult MyOrders() => Ok(new[] { "ORD-1", "ORD-2" });
}`,
      result: `GET /api/catalog?page=1          (10:00:00)
{"page":1,"generatedAt":"10:00:00","items":["Pen","Book"]}

GET /api/catalog?page=1          (10:00:20) -> same body, generatedAt still "10:00:00", header Age: 20
GET /api/catalog?page=2          -> new entry {"page":2,"generatedAt":"10:00:25","items":["Bag","Lamp"]}

POST /api/catalog   "Watch"      -> 200  6   (EvictByTagAsync removes both cached pages)
GET /api/catalog?page=1          -> {"page":1,"generatedAt":"10:00:40",...}  freshly generated

GET /api/catalog/countries
Cache-Control: public,max-age=3600
GET /api/catalog/my-orders
Cache-Control: no-store,no-cache`,
      explanation: 'The "Products" policy keys the cache by path + page + pageSize, so page=1 and page=2 are separate entries, and tags every entry with "products". EvictByTagAsync after a write removes all pages at once. generatedAt proves when the action really ran (your times will differ). [ResponseCache] only writes headers: the browser caches countries for an hour, and the personal my-orders response is marked no-store.',
    },
    {
      title: 'Console simulation: output cache keys and tag eviction',
      scenario: 'Show how SetVaryByQuery("page") ignores other query parameters and how EvictByTag clears every tagged entry.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OutputCacheDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var cache = new Dictionary<string, string>();
var tags = new Dictionary<string, List<string>>();
int renders = 0;

string Get(string path, string page, string sort)
{
    string key = path + "|page=" + page;          // VaryByQuery("page"): sort is NOT part of the key
    if (cache.TryGetValue(key, out var cached)) return "CACHE  " + cached;

    renders++;
    string body = "products page " + page + " (render #" + renders + ", sort=" + sort + ")";
    cache[key] = body;
    if (!tags.ContainsKey("products")) tags["products"] = new List<string>();
    tags["products"].Add(key);
    return "SERVER " + body;
}

void EvictByTag(string tag)
{
    if (!tags.TryGetValue(tag, out var keys)) return;
    foreach (var k in keys) cache.Remove(k);
    Console.WriteLine("Evicted " + keys.Count + " entries tagged '" + tag + "'");
    keys.Clear();
}

Console.WriteLine("GET ?page=1&sort=name  -> " + Get("/products", "1", "name"));
Console.WriteLine("GET ?page=1&sort=price -> " + Get("/products", "1", "price"));
Console.WriteLine("GET ?page=2&sort=name  -> " + Get("/products", "2", "name"));
Console.WriteLine("POST /products");
EvictByTag("products");
Console.WriteLine("GET ?page=1&sort=price -> " + Get("/products", "1", "price"));`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var cache = new Dictionary<string, string>();
var tags = new Dictionary<string, List<string>>();
int renders = 0;

string Get(string path, string page, string sort)
{
    string key = path + "|page=" + page;          // VaryByQuery("page"): sort is NOT part of the key
    if (cache.TryGetValue(key, out var cached)) return "CACHE  " + cached;

    renders++;
    string body = "products page " + page + " (render #" + renders + ", sort=" + sort + ")";
    cache[key] = body;
    if (!tags.ContainsKey("products")) tags["products"] = new List<string>();
    tags["products"].Add(key);
    return "SERVER " + body;
}

void EvictByTag(string tag)
{
    if (!tags.TryGetValue(tag, out var keys)) return;
    foreach (var k in keys) cache.Remove(k);
    Console.WriteLine("Evicted " + keys.Count + " entries tagged '" + tag + "'");
    keys.Clear();
}

Console.WriteLine("GET ?page=1&sort=name  -> " + Get("/products", "1", "name"));
Console.WriteLine("GET ?page=1&sort=price -> " + Get("/products", "1", "price"));
Console.WriteLine("GET ?page=2&sort=name  -> " + Get("/products", "2", "name"));
Console.WriteLine("POST /products");
EvictByTag("products");
Console.WriteLine("GET ?page=1&sort=price -> " + Get("/products", "1", "price"));
`,
        },
        stdin: '',
      },
      result: `GET ?page=1&sort=name  -> SERVER products page 1 (render #1, sort=name)
GET ?page=1&sort=price -> CACHE  products page 1 (render #1, sort=name)
GET ?page=2&sort=name  -> SERVER products page 2 (render #2, sort=name)
POST /products
Evicted 2 entries tagged 'products'
GET ?page=1&sort=price -> SERVER products page 1 (render #3, sort=price)`,
      explanation: 'The second request has a different sort but the same key "/products|page=1", so it gets the cached body that was rendered with sort=name - a real bug you would create if you forgot to add "sort" to SetVaryByQuery. Lesson: vary by EVERY parameter that changes the output. EvictByTag removes both page entries, so the next request renders again (#3).',
    },
  ],
  interview: [
    { q: 'What is the difference between response caching and output caching?', a: 'Response caching sets HTTP Cache-Control headers so browsers/proxies cache the response; the server cannot evict it. Output caching (.NET 7+) stores responses on the server, supports policies, vary-by rules, tags, eviction and resource locking.', level: 'Medium' },
    { q: 'IMemoryCache vs IDistributedCache?', a: 'IMemoryCache stores objects in the process memory of one server (fast, lost on restart, not shared). IDistributedCache stores byte[] in an external store (Redis, SQL Server) shared by all servers and survives app restarts.', level: 'Easy' },
    { q: 'Absolute vs sliding expiration?', a: 'Absolute removes the entry at a fixed time after creation. Sliding removes it if it has not been accessed for the given period; each access extends it. Combine them so hot entries still refresh eventually.', level: 'Easy' },
    { q: 'What is HybridCache?', a: 'A .NET 9+ library (Microsoft.Extensions.Caching.Hybrid) providing a two-level cache (in-memory L1 + distributed L2), automatic serialization, tags and stampede protection through GetOrCreateAsync.', level: 'Medium' },
    { q: 'What is a cache stampede and how is it prevented?', a: 'When a popular entry expires, many concurrent requests all miss and hit the database together. Output caching and HybridCache use locking so only one request rebuilds the value while others wait.', level: 'Hard' },
    { q: 'Which requests does output caching cache by default?', a: 'Only GET and HEAD requests returning 200 OK, without authenticated users and without responses that set cookies.', level: 'Medium' },
    { q: 'How do you invalidate output cache entries after data changes?', a: 'Tag entries in the policy (.Tag("products")) and call IOutputCacheStore.EvictByTagAsync("products", ct) after a create/update/delete.', level: 'Medium' },
    { q: 'What happens if you set SizeLimit on the memory cache but forget entry.Size?', a: 'Adding the entry throws InvalidOperationException because every entry must declare a size when a limit is configured.', level: 'Hard' },
    { q: 'Why must you be careful with Cache-Control: public on authenticated endpoints?', a: 'Shared caches (proxies/CDNs) may store one user\'s private response and serve it to another user. Use private or no-store for personal data.', level: 'Medium' },
    { q: 'Output question: cache with TTL 60 s created at t=0. Requests at t=59 and t=60 - hit or miss?', a: 't=59 is a hit; t=60 is a miss (expired when now >= expiresAt).', level: 'Easy' },
  ],
  practice: [
    { task: 'Cache GET /api/products/{id} in IMemoryCache with key "product:{id}" for 10 minutes and remove it in PUT and DELETE.', hint: 'Use string interpolation for the key; call cache.Remove in both write methods.', solution: 'var p = await cache.GetOrCreateAsync($"product:{id}", e => { e.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10); return db.Products.FindAsync(id).AsTask(); }); ... in Update/Delete: cache.Remove($"product:{id}"); cache.Remove("products:all");' },
    { task: 'Switch the ProductService to IDistributedCache with Redis running in Docker.', hint: 'docker run -d -p 6379:6379 redis; package Microsoft.Extensions.Caching.StackExchangeRedis.', solution: 'builder.Services.AddStackExchangeRedisCache(o => o.Configuration = "localhost:6379"); var json = await cache.GetStringAsync(key); if (json is null) { var list = await LoadAsync(); await cache.SetStringAsync(key, JsonSerializer.Serialize(list), new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) }); return list; } return JsonSerializer.Deserialize<List<ProductDto>>(json)!;' },
    { task: 'Add a Minimal API endpoint /api/time cached for 10 seconds with output caching and verify it with two quick requests.', hint: '.CacheOutput(p => p.Expire(...)).', solution: 'app.MapGet("/api/time", () => DateTime.UtcNow.ToString("HH:mm:ss")).CacheOutput(p => p.Expire(TimeSpan.FromSeconds(10))); two requests within 10 s return the same time.' },
    { task: 'Create an output cache policy "ByCategory" that varies by the route value {category} and tags entries "catalog".', hint: 'SetVaryByRouteValue.', solution: 'o.AddPolicy("ByCategory", b => b.Expire(TimeSpan.FromMinutes(5)).SetVaryByRouteValue("category").Tag("catalog")); [HttpGet("{category}")][OutputCache(PolicyName = "ByCategory")]' },
    { task: 'Use HybridCache (.NET 9+) for GET /api/products with tag "products" and remove by tag on POST.', hint: 'Install-Package Microsoft.Extensions.Caching.Hybrid.', solution: 'builder.Services.AddHybridCache(); var list = await hybrid.GetOrCreateAsync("products:all", async ct => await db.Products.AsNoTracking().ToListAsync(ct), tags: ["products"], cancellationToken: ct); after POST: await hybrid.RemoveByTagAsync("products", ct);' },
  ],
  quiz: [
    { question: 'Which service caches data inside ONE server\'s process memory?', options: ['IDistributedCache', 'IOutputCacheStore', 'IMemoryCache', 'IResponseCachingPolicyProvider'], answer: 2, explanation: 'IMemoryCache lives in the process; it is not shared between servers.' },
    { question: 'Which attribute sets Cache-Control headers for browsers?', options: ['[ResponseCache]', '[OutputCache]', '[MemoryCache]', '[Cacheable]'], answer: 0, explanation: '[ResponseCache] controls HTTP caching headers.' },
    { question: 'How do you remove all output-cached product pages after an insert?', options: ['cache.Clear()', 'Restart the app', 'Set Duration = 0', 'IOutputCacheStore.EvictByTagAsync("products")'], answer: 3, explanation: 'Tag-based eviction removes every entry with that tag.' },
    { question: 'An output cache policy uses SetVaryByQuery("page"). Requests ?page=1&sort=a and ?page=1&sort=b return...', options: ['The same cached response', 'Two different cached responses', 'Always a 400 error', 'Never cached'], answer: 0, explanation: 'Only page is part of the key, so sort is ignored.' },
    { question: 'Which cache is shared by all servers behind a load balancer?', options: ['IMemoryCache', 'Redis via IDistributedCache', 'Browser cache', 'Static fields'], answer: 1, explanation: 'A distributed store such as Redis is reachable from every server.' },
  ],
};
