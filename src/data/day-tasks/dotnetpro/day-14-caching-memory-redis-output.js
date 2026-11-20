export default {
  lesson: 'day-14-caching-memory-redis-output',
  minutes: 25,
  intro: 'Practise the cache-aside pattern, expiration, Redis distributed caching, output caching and invalidation decisions.',
  tasks: [
    {
      type: 'output',
      mins: 6,
      q: 'Trace this cache-aside program (TTL = 45 seconds, `now` is a fake clock in seconds). Write the exact output.',
      example: { title: 'how an entry expires', text: 'An entry stored at t=10 with TTL 45 has ExpiresAt = 55. It is a HIT only while now < 55.' },
      code: `using System;
using System.Collections.Generic;

var cache = new Dictionary<string, (string Value, int ExpiresAt)>();
var db = new Dictionary<int, string> { [7] = "Python Course" };
int now = 0, dbCalls = 0, hits = 0;

Get(7);
now += 20; Get(7);
now += 30; Get(7);
db[7] = "Python Course (2026)";
cache.Remove("course:7");
Get(7);
now += 44; Get(7);
Console.WriteLine($"DB calls={dbCalls}, hits={hits}");

void Get(int id)
{
    string key = $"course:{id}";
    if (cache.TryGetValue(key, out var e) && now < e.ExpiresAt)
    {
        hits++;
        Console.WriteLine($"{now}: HIT {e.Value}");
        return;
    }
    dbCalls++;
    cache[key] = (db[id], now + 45);
    Console.WriteLine($"{now}: MISS {db[id]}");
}`,
      expected: `0: MISS Python Course
20: HIT Python Course
50: MISS Python Course
50: MISS Python Course (2026)
94: HIT Python Course (2026)
DB calls=3, hits=2`,
      explain: 'Stored at 0, expires at 45: t=20 is a hit, t=50 is expired so the DB is called again (new expiry 95). The update removes the key, so the next read is a miss that returns the NEW name instead of stale data. At t=94, 94 < 95, so it is a hit. Without cache.Remove the 4th line would have been a HIT with the old name.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Your API runs on **3 servers** behind a load balancer. After updating a price on server A, users on servers B and C still see the old price for 10 minutes. Which cache causes this?',
      options: ['Redis via IDistributedCache', 'IMemoryCache (one copy per server)', 'Output cache stored in Redis', 'The browser cache with no-store'],
      answer: 1,
      explain: 'IMemoryCache lives inside each process. Removing the key on server A does not touch the copies on B and C. A shared distributed cache (Redis) or HybridCache with tag/pub-sub invalidation keeps all servers consistent.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Register Redis as the IDistributedCache implementation in Program.cs. Complete the method name:
\`builder.Services.______(o => { o.Configuration = "localhost:6379"; o.InstanceName = "shop:"; });\``,
      example: { title: 'package', code: 'dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis' },
      accept: ['AddStackExchangeRedisCache'],
      caseSensitive: true,
      explain: 'AddStackExchangeRedisCache (package Microsoft.Extensions.Caching.StackExchangeRedis) registers IDistributedCache backed by Redis. InstanceName prefixes every key so several apps can share one Redis server.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'An entry has **SlidingExpiration = 5 minutes** and **AbsoluteExpirationRelativeToNow = 30 minutes**. It is read every minute. When is it removed?',
      options: ['After 5 minutes', 'After 30 minutes', 'After 35 minutes', 'Never, because it is read regularly'],
      answer: 1,
      explain: 'Each read resets the sliding window, so the sliding rule never triggers, but the absolute limit removes the entry 30 minutes after it was created. Always combine sliding expiration with an absolute limit so hot items cannot stay stale forever.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about **output caching** vs **response caching** are TRUE? Select all that apply.',
      options: [
        'Output caching stores the response on the server and can skip running the endpoint',
        'Output cache entries can be removed with IOutputCacheStore.EvictByTagAsync',
        'Response caching sets Cache-Control headers so browsers/proxies may keep the response',
        'With response caching the server can recall a copy already stored in a user\'s browser',
        'By default output caching does not cache authenticated requests'
      ],
      answers: [0, 1, 2, 4],
      explain: 'Output caching is server-controlled (tags, eviction, Redis storage) and by default skips authenticated requests and responses that set cookies. Response caching is header-based: once a browser keeps a response for max-age seconds, the server cannot take it back.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A viral course page\'s cache entry expires and 2,000 requests arrive in the same second, all running the same SQL query. What is this called, and which .NET 9 feature prevents it?',
      options: [
        'Cache poisoning - fixed by ResponseCache(NoStore = true)',
        'Cache stampede - HybridCache runs the factory once per key and other callers await it',
        'Cache warming - fixed by AddMemoryCache',
        'Cache eviction - fixed by CacheItemPriority.NeverRemove'
      ],
      answer: 1,
      explain: 'Many concurrent misses on one hot key are a cache stampede (thundering herd). HybridCache.GetOrCreateAsync coordinates callers so only one runs the expensive factory. Other mitigations: jittered expiry and background refresh.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Use Redis to count product page views safely across many servers (an atomic INCR). Complete the StackExchange.Redis call:
\`long views = await redis.GetDatabase().______($"views:product:{id}");\``,
      example: { title: 'other IDatabase methods', code: 'await db.StringSetAsync("key", "value", TimeSpan.FromMinutes(5));\nawait db.KeyExpireAsync("key", TimeSpan.FromMinutes(10));' },
      accept: ['StringIncrementAsync'],
      caseSensitive: true,
      explain: 'StringIncrementAsync maps to the Redis INCR command, which is atomic on the Redis server, so concurrent requests from many app servers never lose an update. Reading, adding 1 in C# and writing back would lose counts under load.',
    },
  ],
};
