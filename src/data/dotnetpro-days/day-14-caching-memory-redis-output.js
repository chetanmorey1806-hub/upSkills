const memoryCacheCode = `// ===== Program.cs (ASP.NET Core Web API) =====
builder.Services.AddMemoryCache();                 // registers IMemoryCache (singleton)
builder.Services.AddScoped<ProductService>();

// ===== Services/ProductService.cs : cache-aside with IMemoryCache =====
using Microsoft.Extensions.Caching.Memory;

public class ProductService(AppDbContext db, IMemoryCache cache, ILogger<ProductService> logger)
{
    private static string Key(int id) => $"product:{id}";

    public async Task<ProductDto?> GetAsync(int id)
    {
        // 1. Look in the cache
        if (cache.TryGetValue(Key(id), out ProductDto? cached))
        {
            logger.LogInformation("Cache HIT {Key}", Key(id));
            return cached;
        }

        // 2. Miss -> load from the database
        logger.LogInformation("Cache MISS {Key}", Key(id));
        var product = await db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.Name, p.Price))
            .FirstOrDefaultAsync();

        // 3. Store it with expiration rules
        if (product is not null)
        {
            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10))   // removed after 10 min no matter what
                .SetSlidingExpiration(TimeSpan.FromMinutes(2))     // ...or after 2 min without reads
                .SetPriority(CacheItemPriority.Normal)
                .RegisterPostEvictionCallback((key, value, reason, state) =>
                    logger.LogInformation("Evicted {Key} because {Reason}", key, reason));
            cache.Set(Key(id), product, options);
        }
        return product;
    }

    // Shorter version for lists
    public Task<List<ProductDto>?> GetCategoryAsync(string category) =>
        cache.GetOrCreateAsync($"category:{category}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return db.Products.Where(p => p.Category == category)
                     .Select(p => new ProductDto(p.Id, p.Name, p.Price)).ToListAsync();
        });

    public async Task UpdatePriceAsync(int id, decimal price)
    {
        await db.Products.Where(p => p.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, price));
        cache.Remove(Key(id));                         // invalidate: next read loads the new price
    }
}

public record ProductDto(int Id, string Name, decimal Price);

// ===== Endpoints =====
app.MapGet("/api/products/{id:int}", async (int id, ProductService svc) =>
    await svc.GetAsync(id) is { } p ? Results.Ok(p) : Results.NotFound());

app.MapPut("/api/products/{id:int}/price", async (int id, decimal price, ProductService svc) =>
{
    await svc.UpdatePriceAsync(id, price);
    return Results.NoContent();
});`;

const redisCode = `# ===== 1. Run Redis locally with Docker =====
docker run -d --name redis -p 6379:6379 redis:7
docker exec -it redis redis-cli ping            # PONG

# ===== 2. NuGet =====
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis

// ===== 3. appsettings.json =====
{
  "ConnectionStrings": { "Redis": "localhost:6379" }
}

// ===== 4. Program.cs =====
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "shop:";                // prefix for every key in Redis
});

// ===== 5. Services/DashboardService.cs : IDistributedCache + JSON =====
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

public class DashboardService(IDistributedCache cache, AppDbContext db)
{
    public async Task<SalesSummary> GetTodaySummaryAsync(CancellationToken ct = default)
    {
        string key = $"sales-summary:{DateTime.UtcNow:yyyyMMdd}";

        string? json = await cache.GetStringAsync(key, ct);
        if (json is not null)
            return JsonSerializer.Deserialize<SalesSummary>(json)!;          // HIT

        var summary = new SalesSummary(                                       // MISS: heavy query
            Orders: await db.Orders.CountAsync(o => o.CreatedAt >= DateTime.UtcNow.Date, ct),
            Revenue: await db.Orders.Where(o => o.CreatedAt >= DateTime.UtcNow.Date)
                                    .SumAsync(o => o.Total, ct));

        await cache.SetStringAsync(key, JsonSerializer.Serialize(summary),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            }, ct);
        return summary;
    }

    public Task InvalidateAsync() =>
        cache.RemoveAsync($"sales-summary:{DateTime.UtcNow:yyyyMMdd}");
}

public record SalesSummary(int Orders, decimal Revenue);

# ===== 6. Look inside Redis =====
docker exec -it redis redis-cli
127.0.0.1:6379> KEYS shop:*
1) "shop:sales-summary:20261120"
127.0.0.1:6379> TTL shop:sales-summary:20261120
(integer) 287
127.0.0.1:6379> HGET shop:sales-summary:20261120 data
"{\\"Orders\\":42,\\"Revenue\\":185400.00}"

// ===== 7. Direct StackExchange.Redis for counters, sets, pub/sub =====
// dotnet add package StackExchange.Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")!));

app.MapPost("/api/products/{id:int}/view", async (int id, IConnectionMultiplexer redis) =>
{
    IDatabase rdb = redis.GetDatabase();
    long views = await rdb.StringIncrementAsync($"views:product:{id}");   // atomic INCR
    return Results.Ok(new { id, views });
});`;

const outputCacheCode = `// ===== OUTPUT CACHING (.NET 7+) : the SERVER stores the whole response =====
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(b => b.Expire(TimeSpan.FromSeconds(30)));         // default for [OutputCache]
    options.AddPolicy("Products", b => b
        .Expire(TimeSpan.FromMinutes(5))
        .SetVaryByQuery("category", "page")                                 // separate copy per query value
        .Tag("products"));                                                  // tag for invalidation
});
// Multiple servers? store output cache in Redis:
// dotnet add package Microsoft.AspNetCore.OutputCaching.StackExchangeRedis
// builder.Services.AddStackExchangeRedisOutputCache(o => o.Configuration = "localhost:6379");

var app = builder.Build();
app.UseOutputCache();          // after UseCors / UseRouting, before endpoints

app.MapGet("/api/products", async (string? category, int page, AppDbContext db) =>
{
    await Task.Delay(800);     // pretend this is slow
    return await db.Products.Where(p => category == null || p.Category == category)
                   .Skip((page - 1) * 20).Take(20).ToListAsync();
}).CacheOutput("Products");

app.MapPost("/api/products", async (Product p, AppDbContext db, IOutputCacheStore store, CancellationToken ct) =>
{
    db.Products.Add(p);
    await db.SaveChangesAsync(ct);
    await store.EvictByTagAsync("products", ct);       // invalidate all cached product lists
    return Results.Created($"/api/products/{p.Id}", p);
});

// Controllers: [OutputCache(PolicyName = "Products")] on the action

// ===== RESPONSE CACHING : the CLIENT / proxy caches, based on HTTP headers =====
builder.Services.AddResponseCaching();
app.UseResponseCaching();

[HttpGet("api/states")]
[ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "country" })]
public IActionResult GetStates(string country) => Ok(stateList);
// Sends: Cache-Control: public,max-age=3600  -> browser reuses it for 1 hour

[HttpGet("api/me")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]   // never cache personal data
public IActionResult Me() => Ok(currentUser);`;

const hybridCode = `// ===== HybridCache (.NET 9+) : L1 memory + L2 distributed + stampede protection =====
// dotnet add package Microsoft.Extensions.Caching.Hybrid
builder.Services.AddStackExchangeRedisCache(o => o.Configuration = "localhost:6379");   // optional L2
builder.Services.AddHybridCache(options =>
{
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(10),          // L2 (Redis) lifetime
        LocalCacheExpiration = TimeSpan.FromMinutes(2)  // L1 (in-process memory) lifetime
    };
});

public class CourseService(HybridCache cache, AppDbContext db)
{
    public async Task<CourseDto?> GetCourseAsync(int id, CancellationToken ct = default) =>
        await cache.GetOrCreateAsync(
            $"course:{id}",
            async token => await db.Courses.Where(c => c.Id == id)
                                   .Select(c => new CourseDto(c.Id, c.Title, c.Fee))
                                   .FirstOrDefaultAsync(token),
            tags: ["courses"],
            cancellationToken: ct);

    public async Task UpdateFeeAsync(int id, decimal fee, CancellationToken ct = default)
    {
        await db.Courses.Where(c => c.Id == id).ExecuteUpdateAsync(s => s.SetProperty(c => c.Fee, fee), ct);
        await cache.RemoveAsync($"course:{id}", ct);       // removes from L1 and L2
        // or: await cache.RemoveByTagAsync("courses", ct);
    }
}

public record CourseDto(int Id, string Title, decimal Fee);

// Why HybridCache?
// - 1000 users request "course:7" at the same second after it expired:
//   IMemoryCache.GetOrCreateAsync may run the DB query many times (cache stampede);
//   HybridCache runs the factory ONCE and all callers await the same result.
// - Handles serialization for the Redis layer for you.`;

const cacheSimCode = `using System;
using System.Collections.Generic;

var clock = new FakeClock();
var cache = new SimpleCache(clock);
var db = new ProductDb();

Get(1);                      // miss -> DB
Get(1);                      // hit
clock.Advance(30); Get(1);   // still fresh (TTL 60 s)
clock.Advance(31); Get(1);   // 61 s after it was cached -> expired -> DB again
Get(2);
Update(2, "Smart Watch v2"); // write -> invalidate the cache key
Get(2);                      // miss -> loads the NEW value
Get(2);                      // hit
Console.WriteLine($"Total DB calls: {db.Calls}, cache hits: {cache.Hits}");

// ----- cache-aside: read -----
string Get(int id)
{
    string key = $"product:{id}";
    if (cache.TryGet(key, out string? value))
    {
        Console.WriteLine($"t={clock.Now,3}s GET {id} -> HIT  {value}");
        return value!;
    }
    value = db.Load(id);
    cache.Set(key, value, ttlSeconds: 60);
    Console.WriteLine($"t={clock.Now,3}s GET {id} -> MISS {value} (DB call #{db.Calls})");
    return value;
}

// ----- cache-aside: write = update DB, then remove the key -----
void Update(int id, string newName)
{
    db.Save(id, newName);
    cache.Remove($"product:{id}");
    Console.WriteLine($"t={clock.Now,3}s UPDATE {id} -> {newName}, cache key removed");
}

class FakeClock
{
    public int Now { get; private set; }               // seconds
    public void Advance(int seconds) => Now += seconds;
}

class SimpleCache(FakeClock clock)
{
    private readonly Dictionary<string, (string Value, int ExpiresAt)> store = new();
    public int Hits { get; private set; }

    public bool TryGet(string key, out string? value)
    {
        if (store.TryGetValue(key, out var entry) && clock.Now < entry.ExpiresAt)
        {
            Hits++;
            value = entry.Value;
            return true;
        }
        store.Remove(key);                              // expired or missing
        value = null;
        return false;
    }

    public void Set(string key, string value, int ttlSeconds) =>
        store[key] = (value, clock.Now + ttlSeconds);

    public void Remove(string key) => store.Remove(key);
}

class ProductDb
{
    private readonly Dictionary<int, string> rows = new() { [1] = "Earphones", [2] = "Smart Watch" };
    public int Calls { get; private set; }
    public string Load(int id) { Calls++; return rows[id]; }
    public void Save(int id, string name) => rows[id] = name;
}
`;

export default {
  id: 'day-14-caching-memory-redis-output',
  title: 'Caching in ASP.NET Core: IMemoryCache, Redis (IDistributedCache), Output Caching, Response Caching and HybridCache',
  module: 'Module 4: Caching, Background Jobs & Messaging',
  day: 14,
  level: 'Advanced',
  duration: '3.5 hours',
  summary:
    'Make APIs fast and reduce database load with caching. Learn the cache-aside pattern, in-memory caching with IMemoryCache, distributed caching with Redis via AddStackExchangeRedisCache and StackExchange.Redis, absolute and sliding expiration, output caching and response caching, the new HybridCache in .NET 9, and the hardest part: cache invalidation.',
  objectives: [
    'Explain why and where to cache and apply the cache-aside pattern',
    'Use IMemoryCache with absolute/sliding expiration and invalidate entries on updates',
    'Run Redis in Docker and use IDistributedCache with AddStackExchangeRedisCache',
    'Use output caching (with tags) and response caching and explain the difference',
    'Describe HybridCache, cache stampede and common invalidation strategies',
  ],
  theory: [
    {
      heading: 'Why caching? Where can you cache?',
      content:
        'A cache keeps a copy of data in a faster place so you do not have to recompute or re-query it. Reading from memory takes nanoseconds, from Redis about a millisecond, and from SQL Server often 10-500 ms. A product catalogue read 10,000 times a minute but changed twice a day is a perfect cache candidate. Caching happens at many layers: the browser (HTTP Cache-Control headers), a CDN, the server response (output caching), application data (IMemoryCache, Redis) and the database\'s own buffer pool. Cache data that is read often, changes rarely and is expensive to produce. Do NOT cache highly personal or rapidly changing data without care, and never cache something you cannot afford to show slightly stale.',
      points: [
        'Cache hit = found in cache; cache miss = not found, load from the source',
        'Hit ratio = hits / total requests; aim high for hot data',
        'Stale data is the price of caching - choose expiration based on how stale the business can accept',
        'Measure first (logs, Application Insights) - cache the slow, frequently used endpoints',
      ],
    },
    {
      heading: 'Cache-aside pattern and expiration',
      content:
        'Cache-aside (lazy loading) is the most common pattern: on read, check the cache; on a miss, read the database, put the result in the cache with an expiry and return it. On write, update the database and then remove (invalidate) the cache key, so the next read loads fresh data. Expiration options: Absolute expiration removes the item at a fixed time (e.g. 10 minutes after it was added) - guarantees maximum staleness. Sliding expiration removes the item if nobody read it for a period (e.g. 2 minutes) - keeps hot items, drops cold ones; combine it with an absolute limit, otherwise a popular item could live forever. Other patterns: write-through (write to cache and DB together), read-through (the cache library loads for you, like GetOrCreate) and write-behind (write to cache, DB later - risky).',
      syntax: `if (cache.TryGetValue(key, out T? value)) return value;      // 1. hit
value = await LoadFromDbAsync();                            // 2. miss
cache.Set(key, value, TimeSpan.FromMinutes(10));            // 3. store
// on update:
await SaveToDbAsync(); cache.Remove(key);                   // 4. invalidate`,
    },
    {
      heading: 'IMemoryCache: in-process caching',
      content:
        'IMemoryCache (Microsoft.Extensions.Caching.Memory, registered with builder.Services.AddMemoryCache()) stores .NET objects in the web server\'s RAM. It is the fastest option and needs no serialization. Use TryGetValue/Set or GetOrCreate/GetOrCreateAsync. MemoryCacheEntryOptions set AbsoluteExpiration, SlidingExpiration, Priority, Size (with a SizeLimit on the cache) and eviction callbacks. Limitations: every server instance has its own copy (with 3 servers behind a load balancer, invalidating on one server leaves stale data on the other two), the cache is lost on restart/deploy, and it uses your app\'s memory. Perfect for small reference data (states, categories, settings) and single-server apps.',
      points: [
        'Keys are usually strings with a prefix: "product:42", "category:mobiles"',
        'Cached objects are shared by reference - do not modify them after caching (cache DTOs/records)',
        'SetSize + SizeLimit protects you from using too much memory',
        'GetOrCreateAsync does NOT prevent two requests running the factory at the same time (stampede)',
      ],
    },
    {
      heading: 'IDistributedCache and Redis',
      content:
        'A distributed cache lives outside your app, so all servers share one copy and it survives app restarts. Redis is the most popular choice: an in-memory key-value store with strings, hashes, lists, sets, sorted sets, TTL per key and pub/sub. ASP.NET Core exposes the IDistributedCache interface (GetAsync/SetAsync with byte[], or GetStringAsync/SetStringAsync, RemoveAsync, RefreshAsync) and you plug Redis in with the package Microsoft.Extensions.Caching.StackExchangeRedis and builder.Services.AddStackExchangeRedisCache(...). Because the cache is outside the process, objects must be serialized (System.Text.Json). For Redis features beyond get/set (atomic counters, leaderboards, rate limits, distributed locks) use the StackExchange.Redis client directly with a singleton IConnectionMultiplexer. In production use Azure Cache for Redis, AWS ElastiCache or a managed Redis; other IDistributedCache implementations exist for SQL Server and NCache.',
      syntax: `builder.Services.AddStackExchangeRedisCache(o =>
{
    o.Configuration = "localhost:6379";
    o.InstanceName = "shop:";
});
await cache.SetStringAsync(key, json, new DistributedCacheEntryOptions
    { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) });
string? json = await cache.GetStringAsync(key);`,
      points: [
        'ConnectionMultiplexer is expensive to create - register it once as a singleton',
        'Redis is single-threaded per command and very fast; avoid huge values (keep under ~100 KB)',
        'Never use KEYS * in production (blocks Redis) - use SCAN',
        'If Redis is down your app should still work (catch exceptions, fall back to the DB)',
      ],
    },
    {
      heading: 'Output caching vs response caching',
      content:
        'Output caching (.NET 7+, AddOutputCache + UseOutputCache + CacheOutput()/[OutputCache]) stores the complete HTTP response on the SERVER and returns it for later identical requests without running the endpoint at all. You control it fully: expiration, vary by query/header/route, tags and eviction with IOutputCacheStore.EvictByTagAsync, and it can be stored in Redis for multi-server setups. By default it caches only GET/HEAD 200 responses and skips authenticated requests and responses that set cookies. Response caching ([ResponseCache] + AddResponseCaching/UseResponseCaching) is based on HTTP Cache-Control headers: it tells browsers and proxies how long they may keep the response. The server cannot invalidate a copy already stored in a user\'s browser, and the middleware obeys client headers like "Cache-Control: no-cache". Use output caching for server-side speed; use Cache-Control headers for static or public data the browser/CDN can keep.',
      points: [
        'Output cache = server decides and can evict; response cache = HTTP headers, client/proxy decides',
        '[ResponseCache(NoStore = true)] for sensitive data such as account details',
        'Static files, images, JS bundles: long max-age + versioned file names (cache busting)',
      ],
    },
    {
      heading: 'HybridCache (.NET 9) and cache invalidation strategies',
      content:
        'HybridCache (package Microsoft.Extensions.Caching.Hybrid, builder.Services.AddHybridCache()) combines a fast in-process L1 cache with an optional distributed L2 cache (Redis) behind one API: GetOrCreateAsync, SetAsync, RemoveAsync and RemoveByTagAsync. It solves the cache stampede problem: if many requests miss the same key at the same time, only one runs the factory and the others wait for its result. It also handles serialization. Invalidation, "one of the two hard things in computer science", needs a plan: (1) time-based expiry for data that may be slightly stale, (2) explicit removal on write (cache-aside), (3) tags to remove groups (all product lists), (4) versioned keys (products:v7:...) where bumping the version makes old keys unused, and (5) events/pub-sub to tell all servers to drop their L1 copies.',
      tip: 'Interview answer for "how do you avoid stale data?": short TTL as a safety net + remove the key on every write + tags for lists + Redis (shared) instead of per-server memory when you have many instances.',
    },
  ],
  examples: [
    {
      title: 'IMemoryCache with cache-aside in a Web API',
      scenario:
        'An e-commerce API\'s product details endpoint gets thousands of requests per minute and each one hits SQL Server. Cache products in memory for 10 minutes (or 2 minutes idle) and invalidate on price change.',
      steps: [
        'Open your Web API project with EF Core (AppDbContext with Products)',
        'Add builder.Services.AddMemoryCache() and register ProductService in Program.cs',
        'Add Services/ProductService.cs and the two endpoints',
        'Run with F5 and call GET /api/products/1 twice in Swagger/Postman; watch the Output window logs',
        'Call PUT /api/products/1/price?price=899 and then GET again',
      ],
      code: memoryCacheCode,
      result: `GET /api/products/1   -> 200 {"id":1,"name":"Earphones","price":799}  (180 ms)  log: Cache MISS product:1
GET /api/products/1   -> 200 same body                                  (3 ms)    log: Cache HIT product:1
PUT /api/products/1/price?price=899 -> 204 No Content
GET /api/products/1   -> 200 {"id":1,"name":"Earphones","price":899}  log: Evicted product:1 because Removed / Cache MISS product:1
(after 2 minutes without reads) log: Evicted product:1 because Expired`,
      explanation:
        'The first call misses and runs SQL; the second is served from RAM. Combining sliding (2 min) and absolute (10 min) expiration keeps hot data but never longer than 10 minutes. UpdatePriceAsync removes the key immediately after the database update, so users see the new price on the next read. Note: the eviction callback for expiry fires lazily (when the cache is next accessed or scanned), not at the exact second.',
    },
    {
      title: 'Redis distributed cache for a dashboard (Docker + AddStackExchangeRedisCache)',
      scenario:
        'A retail chain runs its API on 3 servers. The sales dashboard summary is an expensive query. Cache it in Redis for 5 minutes so all servers share it, and count product views atomically.',
      steps: [
        'Install Docker Desktop and run: docker run -d --name redis -p 6379:6379 redis:7',
        'In the API project: dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis (and StackExchange.Redis for the counter)',
        'Add the Redis connection string, the Program.cs registration and DashboardService',
        'Run the API, call the summary endpoint twice, then inspect Redis with redis-cli',
        'Restart the API and call again: it is still a cache hit because the data lives in Redis, not in the process',
      ],
      code: redisCode,
      result: `1st GET /api/dashboard/today -> 950 ms (SQL)   {"orders":42,"revenue":185400.00}
2nd GET /api/dashboard/today -> 4 ms  (Redis)
redis-cli> KEYS shop:*  -> "shop:sales-summary:20261120"
redis-cli> TTL ...      -> 287 seconds left
POST /api/products/7/view three times -> {"id":7,"views":1}, {"id":7,"views":2}, {"id":7,"views":3}`,
      explanation:
        'InstanceName "shop:" prefixes every key, so many apps can share one Redis. The Redis IDistributedCache stores entries as a Redis hash (data field plus expiry metadata), which is why HGET is used to read it. Because all three servers read the same key, invalidation in one place works for all. StringIncrementAsync maps to Redis INCR, which is atomic - no lost updates even with many servers.',
    },
    {
      title: 'Output caching with tags vs response caching headers',
      scenario:
        'A product listing endpoint takes 800 ms. Cache the full response on the server per category and page, and clear all cached lists when a new product is added. Also let browsers cache the rarely-changing list of Indian states for an hour.',
      steps: [
        'Add AddOutputCache with a "Products" policy and app.UseOutputCache() in Program.cs',
        'Add .CacheOutput("Products") to the GET endpoint and EvictByTagAsync in the POST endpoint',
        'Add AddResponseCaching/UseResponseCaching and the [ResponseCache] attribute on the states action',
        'Call GET /api/products?category=mobiles&page=1 twice, POST a product, then GET again',
        'Open GET /api/states?country=IN in the browser and look at DevTools > Network > Headers',
      ],
      code: outputCacheCode,
      result: `GET /api/products?category=mobiles&page=1 -> 812 ms
GET /api/products?category=mobiles&page=1 -> 2 ms (served by output cache, endpoint not executed)
GET /api/products?category=laptops&page=1 -> 805 ms (different query value = different cache entry)
POST /api/products -> 201, tag "products" evicted
GET /api/products?category=mobiles&page=1 -> 790 ms (fresh data, cached again)
GET /api/states?country=IN -> response header: Cache-Control: public,max-age=3600`,
      explanation:
        'SetVaryByQuery stores one copy per category/page combination. The tag lets one POST invalidate every product list at once. Response caching only adds Cache-Control headers (and an optional server-side cache that respects client headers); once a browser has the response for an hour you cannot recall it, so use it only for data that is safe to be stale for that long.',
    },
    {
      title: 'HybridCache in .NET 9: one API for memory + Redis with stampede protection',
      scenario:
        'An ed-tech site\'s course page goes viral; when the cache entry for course 7 expires, 1000 requests arrive at once. Use HybridCache so the database runs the query only once and both memory and Redis layers stay in sync.',
      steps: [
        'Target .NET 9 or later, then: dotnet add package Microsoft.Extensions.Caching.Hybrid',
        'Register Redis (optional L2) and AddHybridCache in Program.cs',
        'Add CourseService and inject it into your endpoint',
        'Load-test with a tool like k6 or bombardier and count SQL queries in the logs',
      ],
      code: hybridCode,
      result: `1000 concurrent GET /api/courses/7 right after expiry:
  IMemoryCache.GetOrCreateAsync -> up to hundreds of identical SQL queries
  HybridCache.GetOrCreateAsync  -> 1 SQL query, 999 requests await the same task
PUT /api/courses/7/fee -> RemoveAsync clears L1 on this server and the Redis L2 entry`,
      explanation:
        'HybridCache first checks L1 (memory), then L2 (Redis), and only then runs the factory - once per key per server, no matter how many callers. Tags allow removing groups of entries. If no IDistributedCache is registered it works as a memory-only cache with stampede protection, so you can start simple and add Redis later without changing code.',
    },
    {
      title: 'Console demo: cache-aside with expiration and invalidation',
      scenario:
        'Trace hits, misses, TTL expiry and invalidation with a fake clock so the output is predictable - the same logic IMemoryCache and Redis apply for you.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it CacheAsideDemo (.NET 8+)',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 and match every line with the comments in the code',
      ],
      code: cacheSimCode,
      csharp: { files: { 'Program.cs': cacheSimCode }, stdin: '' },
      result: `t=  0s GET 1 -> MISS Earphones (DB call #1)
t=  0s GET 1 -> HIT  Earphones
t= 30s GET 1 -> HIT  Earphones
t= 61s GET 1 -> MISS Earphones (DB call #2)
t= 61s GET 2 -> MISS Smart Watch (DB call #3)
t= 61s UPDATE 2 -> Smart Watch v2, cache key removed
t= 61s GET 2 -> MISS Smart Watch v2 (DB call #4)
t= 61s GET 2 -> HIT  Smart Watch v2
Total DB calls: 4, cache hits: 3`,
      explanation:
        'Product 1 is cached at t=0 with expiry at t=60. At t=30 it is still fresh, at t=61 it has expired, so the DB is called again. The update removes the key for product 2, so the next read is a miss that returns the new name instead of stale data. {clock.Now,3} right-aligns the number in 3 characters. 8 reads caused only 4 DB calls.',
    },
  ],
  interview: [
    { q: 'What is the cache-aside pattern?', a: 'The application checks the cache first; on a miss it loads from the database, stores the result in the cache with an expiry and returns it. On writes it updates the database and invalidates (removes) the cache entry.', level: 'Easy' },
    { q: 'Absolute vs sliding expiration?', a: 'Absolute removes the entry at a fixed time after creation regardless of use. Sliding removes it if it was not accessed for the given period, and each access extends it. Combine sliding with an absolute limit so hot items do not live forever.', level: 'Easy' },
    { q: 'IMemoryCache vs IDistributedCache?', a: 'IMemoryCache stores objects in the process RAM: fastest, no serialization, but per-server and lost on restart. IDistributedCache (Redis, SQL Server) is shared by all servers and survives restarts, but needs serialization and a network call.', level: 'Easy' },
    { q: 'Why is IMemoryCache a problem behind a load balancer?', a: 'Each server has its own copy. Invalidating on one server leaves stale data on the others, and users get different answers depending on which server they hit. Use Redis or HybridCache with tag/pub-sub invalidation.', level: 'Medium' },
    { q: 'How do you configure Redis cache in ASP.NET Core?', a: 'Install Microsoft.Extensions.Caching.StackExchangeRedis and call builder.Services.AddStackExchangeRedisCache(o => { o.Configuration = "host:6379"; o.InstanceName = "app:"; }); then inject IDistributedCache.', level: 'Easy' },
    { q: 'Output caching vs response caching?', a: 'Output caching stores the response on the server and serves it without executing the endpoint; the server controls expiry and can evict by tag. Response caching sets HTTP Cache-Control headers so browsers/proxies cache; the server cannot recall cached copies and clients can bypass it.', level: 'Medium' },
    { q: 'What is a cache stampede and how do you prevent it?', a: 'When a popular key expires and many concurrent requests all miss and hit the database at the same time. Prevent with a lock/single-flight (HybridCache does this), staggered/jittered expiry, early background refresh, or never-expiring keys refreshed by a background job.', level: 'Hard' },
    { q: 'What is HybridCache?', a: 'A .NET 9 library (Microsoft.Extensions.Caching.Hybrid) combining in-memory L1 and distributed L2 caching behind GetOrCreateAsync, with stampede protection, built-in serialization, and tag-based invalidation.', level: 'Medium' },
    { q: 'How do you invalidate cached lists when one product changes?', a: 'Use tags (output cache EvictByTagAsync, HybridCache RemoveByTagAsync), versioned key prefixes (bump the version), or short expiry for lists plus removing the item key on write.', level: 'Medium' },
    { q: 'Why should ConnectionMultiplexer be a singleton?', a: 'It is designed to be shared and reused; creating it is expensive (connects, handshakes) and creating one per request exhausts connections and hurts performance.', level: 'Medium' },
    { q: 'What data should you NOT cache?', a: 'Highly volatile data needing exact real-time values (account balance during a transfer, stock reservation), per-user sensitive data in shared caches without user-specific keys, and huge objects that waste memory.', level: 'Medium' },
    { q: 'What happens to your API if Redis goes down?', a: 'If not handled, cache calls throw and requests fail. A resilient design catches cache exceptions, logs them and falls back to the database (cache is an optimisation, not the source of truth), with timeouts and possibly a circuit breaker.', level: 'Hard' },
    { q: 'Why might output caching not cache your endpoint?', a: 'By default it caches only GET/HEAD requests with 200 responses, skips authenticated requests and responses that set cookies, and requires UseOutputCache to be in the pipeline with CacheOutput()/[OutputCache] or a base policy.', level: 'Hard' },
    { q: 'What eviction policy does Redis use when memory is full?', a: 'Configured by maxmemory-policy: noeviction (errors), allkeys-lru, volatile-lru, allkeys-lfu, volatile-ttl, etc. For a cache, allkeys-lru or allkeys-lfu is common.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Cache the list of Indian states (from the database) in IMemoryCache for 24 hours using GetOrCreateAsync and expose it at GET /api/states.',
      hint: 'entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24).',
      solution: `app.MapGet("/api/states", async (IMemoryCache cache, AppDbContext db) =>
    await cache.GetOrCreateAsync("states:IN", entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24);
        return db.States.OrderBy(s => s.Name).Select(s => s.Name).ToListAsync();
    }));`,
    },
    {
      task: 'Write a generic extension method GetOrSetAsync<T> for IDistributedCache that serializes with System.Text.Json and takes a factory and a TimeSpan.',
      hint: 'Try GetStringAsync; on null call the factory, serialize and SetStringAsync.',
      solution: `public static class DistributedCacheExtensions
{
    public static async Task<T> GetOrSetAsync<T>(this IDistributedCache cache, string key,
        Func<Task<T>> factory, TimeSpan ttl, CancellationToken ct = default)
    {
        var json = await cache.GetStringAsync(key, ct);
        if (json is not null) return JsonSerializer.Deserialize<T>(json)!;

        T value = await factory();
        await cache.SetStringAsync(key, JsonSerializer.Serialize(value),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl }, ct);
        return value;
    }
}
// usage: var top = await cache.GetOrSetAsync("top-products", () => repo.GetTopAsync(), TimeSpan.FromMinutes(5));`,
    },
    {
      task: 'Add output caching to GET /api/courses (vary by "level" query, 10 minutes, tag "courses") and evict the tag in POST, PUT and DELETE course endpoints.',
      hint: 'AddPolicy("Courses", b => b.Expire(...).SetVaryByQuery("level").Tag("courses")) and IOutputCacheStore.EvictByTagAsync.',
      solution: `builder.Services.AddOutputCache(o => o.AddPolicy("Courses", b => b
    .Expire(TimeSpan.FromMinutes(10)).SetVaryByQuery("level").Tag("courses")));
app.UseOutputCache();

app.MapGet("/api/courses", (string? level, AppDbContext db) =>
    db.Courses.Where(c => level == null || c.Level == level).ToListAsync())
   .CacheOutput("Courses");

app.MapPost("/api/courses", async (Course c, AppDbContext db, IOutputCacheStore store, CancellationToken ct) =>
{
    db.Courses.Add(c); await db.SaveChangesAsync(ct);
    await store.EvictByTagAsync("courses", ct);
    return Results.Created($"/api/courses/{c.Id}", c);
});
// same EvictByTagAsync call in PUT and DELETE`,
    },
    {
      task: 'Implement a simple rate limiter with Redis: allow 5 OTP requests per mobile number per 10 minutes, return 429 after that.',
      hint: 'StringIncrementAsync on key otp:{mobile}; when the result is 1 set KeyExpireAsync to 10 minutes.',
      solution: `app.MapPost("/api/otp/{mobile}", async (string mobile, IConnectionMultiplexer redis) =>
{
    var db = redis.GetDatabase();
    string key = $"otp:{mobile}";
    long count = await db.StringIncrementAsync(key);
    if (count == 1) await db.KeyExpireAsync(key, TimeSpan.FromMinutes(10));
    if (count > 5) return Results.StatusCode(429);
    // send OTP ...
    return Results.Ok(new { sent = true, attempt = count });
});`,
    },
    {
      task: 'In the CacheAsideDemo console program, what are the final totals if the TTL is changed from 60 to 30 seconds?',
      hint: 'At t=30 the entry created at t=0 expires (30 < 30 is false).',
      solution: `t=  0s GET 1 -> MISS Earphones (DB call #1)
t=  0s GET 1 -> HIT  Earphones
t= 30s GET 1 -> MISS Earphones (DB call #2)
t= 61s GET 1 -> MISS Earphones (DB call #3)
t= 61s GET 2 -> MISS Smart Watch (DB call #4)
t= 61s UPDATE 2 -> Smart Watch v2, cache key removed
t= 61s GET 2 -> MISS Smart Watch v2 (DB call #5)
t= 61s GET 2 -> HIT  Smart Watch v2
Total DB calls: 5, cache hits: 2`,
    },
  ],
  quiz: [
    {
      question: 'Your API runs on 4 servers behind a load balancer and must show the same cached data on all of them. Which cache should you use?',
      options: ['IMemoryCache', 'A static Dictionary', 'IDistributedCache backed by Redis', 'Response caching only'],
      answer: 2,
      explanation: 'A distributed cache is shared by all instances; IMemoryCache and static fields are per process.',
    },
    {
      question: 'An item has SlidingExpiration = 2 minutes and AbsoluteExpiration = 10 minutes, and it is read every 30 seconds. When is it removed?',
      options: ['After 2 minutes', 'Never', 'After 10 minutes', 'After 12 minutes'],
      answer: 2,
      explanation: 'Each read extends the sliding window, but the absolute limit removes it 10 minutes after creation.',
    },
    {
      question: 'Which method registers Redis as the IDistributedCache implementation?',
      options: ['AddRedis()', 'AddStackExchangeRedisCache()', 'AddDistributedMemoryCache()', 'AddOutputCache()'],
      answer: 1,
      explanation: 'AddStackExchangeRedisCache comes from Microsoft.Extensions.Caching.StackExchangeRedis. AddDistributedMemoryCache is an in-memory implementation for development/tests.',
    },
    {
      question: 'In cache-aside, what should happen when a product\'s price is updated?',
      options: ['Nothing, the cache updates itself', 'Update the database and remove the cache key', 'Only update the cache', 'Restart the application'],
      answer: 1,
      explanation: 'Writing to the DB and invalidating the key ensures the next read loads fresh data.',
    },
    {
      question: 'What is the main extra benefit of HybridCache.GetOrCreateAsync over IMemoryCache.GetOrCreateAsync?',
      options: ['It encrypts values', 'It never expires entries', 'Stampede protection plus optional L2 distributed caching', 'It works only with SQL Server'],
      answer: 2,
      explanation: 'HybridCache runs the factory once per key for concurrent callers and can use Redis as a second level.',
    },
  ],
};
