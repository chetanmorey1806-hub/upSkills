export default {
  lesson: 'extra-45-response-output-memory-caching',
  minutes: 25,
  intro: 'Speed up apps with IMemoryCache, output caching and response caching headers, and choose sensible expirations.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Where is data stored with `IMemoryCache`?',
      options: ['In the browser', 'In the RAM of the current web server process', 'In SQL Server', 'In a Redis server shared by all instances'],
      answer: 1,
      explain: '`IMemoryCache` keeps objects in the server process memory: very fast, but lost on restart and not shared between multiple servers. For a web farm use a distributed cache (`IDistributedCache` with Redis/SQL).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (`GetOrCreate` runs the factory only when the key is missing)',
      example: { title: 'cache-aside', code: `var list = cache.GetOrCreate("cities", e => LoadCitiesFromDb());` },
      code: `using Microsoft.Extensions.Caching.Memory;

var cache = new MemoryCache(new MemoryCacheOptions());
int dbCalls = 0;

int GetPrice(string sku) => cache.GetOrCreate(sku, entry =>
{
    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
    dbCalls++;
    return sku.Length * 100;
});

Console.WriteLine(GetPrice("PEN"));
Console.WriteLine(GetPrice("PEN"));
Console.WriteLine(GetPrice("BOTTLE"));
cache.Remove("PEN");
Console.WriteLine(GetPrice("PEN"));
Console.WriteLine(dbCalls);`,
      expected: `300
300
600
300
3`,
      explain: 'First "PEN" call misses → factory runs (1). Second is a cache hit. "BOTTLE" misses (2): 6 × 100 = 600. After `Remove("PEN")` the next call misses again (3). The returned values are the same; only the number of "database" calls changes.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about cache expiration are TRUE? Select all that apply.',
      options: ['Absolute expiration removes the entry at a fixed time no matter how often it is used', 'Sliding expiration resets the timer each time the entry is accessed', 'A sliding-only entry that is read constantly may never expire', 'Expired entries are always removed at the exact millisecond', 'Combining sliding with an absolute limit avoids stale data living forever'],
      answers: [0, 1, 2, 4],
      explain: 'Absolute = hard deadline; sliding = idle timeout. A busy key with only sliding expiration can live forever with stale data, so combine both. Expired entries are evicted lazily (on access or periodic scans), not at an exact instant.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Cache the output of this minimal API endpoint (after \`AddOutputCache()\` and \`UseOutputCache()\`):
\`app.MapGet("/categories", GetCategories).______();\``,
      example: { title: 'with a policy', code: `builder.Services.AddOutputCache(o => o.AddPolicy("Short", b => b.Expire(TimeSpan.FromSeconds(30))));
app.MapGet("/menu", GetMenu).CacheOutput("Short");` },
      accept: ['CacheOutput'],
      caseSensitive: true,
      explain: '`.CacheOutput()` stores the full response on the server and serves it to later requests without running the handler (default 60 s). On controllers you use the `[OutputCache]` attribute.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Which `Cache-Control` response header does this action produce? (write the header value only)',
      example: { title: 'response caching attribute', code: '[ResponseCache(Duration = 60)]  →  Cache-Control: public,max-age=60' },
      code: `[HttpGet]
[ResponseCache(Duration = 300, Location = ResponseCacheLocation.Client)]
public IActionResult GetStates() => Ok(_states);`,
      expected: `private,max-age=300`,
      explain: '`[ResponseCache]` only sets HTTP headers telling browsers/proxies how to cache. `Location = Client` means only the browser may cache it, which is written as `private`, plus `max-age=300` seconds. `Any` would produce `public`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which data is the **worst** candidate for caching for 10 minutes?',
      options: ['List of Indian states', 'Product categories for the menu', 'A user\'s live wallet balance during payment', 'Exchange-rate table refreshed hourly'],
      answer: 2,
      explain: 'Cache data that is read often and changes rarely. A wallet balance during payment must always be current; stale values would cause wrong payments. States and categories almost never change.',
    },
  ],
};
