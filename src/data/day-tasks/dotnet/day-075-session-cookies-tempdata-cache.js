export default {
  lesson: 'day-075-session-cookies-tempdata-cache',
  minutes: 30,
  intro: 'Keep state between requests with cookies, session and TempData, and speed up repeated reads with IMemoryCache and expiry times.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where is **session** data stored in ASP.NET Core by default?',
      options: ['Entirely in the browser cookie', 'On the server (in IDistributedCache / memory); the browser only keeps a session id cookie', 'In appsettings.json', 'In the URL'],
      answer: 1,
      explain: 'The browser holds only the `.AspNetCore.Session` **id** cookie; the values live on the server. That is why session needs `AddDistributedMemoryCache()` (or Redis/SQL Server in a web farm) plus `AddSession()` and `app.UseSession()`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that stores the user name "Asha" in session under the key `"User"`:\n`HttpContext.Session.______("User", "Asha");`',
      example: { title: 'reading an int back', code: 'int? visits = HttpContext.Session.GetInt32("Visits");' },
      accept: ['SetString'],
      caseSensitive: true,
      explain: 'Session stores bytes; the helpers `SetString`/`GetString` and `SetInt32`/`GetInt32` handle the conversion. For objects, serialize to JSON first.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which cookie options improve security? (choose all that apply)',
      options: ['HttpOnly = true (JavaScript cannot read the cookie)', 'Secure = true (sent only over HTTPS)', 'SameSite = Strict or Lax (limits cross-site sending, helps against CSRF)', 'Storing the plain password in the cookie', 'Expires = 100 years from now for login cookies'],
      answers: [0, 1, 2],
      explain: '`HttpOnly` blocks theft via XSS, `Secure` blocks sniffing on HTTP, `SameSite` limits CSRF. Never store secrets in cookies, and keep auth cookie lifetimes short.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The same browser calls `/visit` three times. What does the **third** call return?',
      example: { title: 'a default for a missing value', code: 'int count = HttpContext.Session.GetInt32("Count") ?? 0;' },
      code: `app.MapGet("/visit", (HttpContext ctx) =>
{
    int visits = (ctx.Session.GetInt32("Visits") ?? 0) + 1;
    ctx.Session.SetInt32("Visits", visits);
    return visits == 1 ? "Welcome!" : $"Visit number {visits}";
});`,
      expected: 'Visit number 3',
      explain: 'Session keeps a value per browser between requests: 1 → "Welcome!", 2 → "Visit number 2", 3 → "Visit number 3". A different browser (or a cleared cookie) starts again at 1.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'With `_cache.Set("courses", list, TimeSpan.FromMinutes(5))`, what happens on a request **6 minutes** later?',
      options: ['The cached list is returned', '_cache.TryGetValue returns false, so the code loads from the database and caches again', 'The app throws CacheExpiredException', 'The cache extends automatically'],
      answer: 1,
      explain: 'An **absolute expiration** removes the entry after 5 minutes. The usual pattern is `GetOrCreate` / `TryGetValue`: on a miss, load from the DB and store again. (A sliding expiration would extend on each access instead.)',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 10,
      q: '**Write IMemoryCache.GetOrCreate.** `createCache(now)` (where `now()` returns the current time in ms) returns `{ getOrCreate(key, ttlMs, factory) }`. If the key exists and is not expired, return the cached value; otherwise call `factory()`, store it with expiry `now() + ttlMs` and return it.',
      example: { title: 'storing value + expiry', code: 'store.set(key, { value, expires: now() + ttlMs });' },
      starter: 'function createCache(now) {\n  // TODO\n}\n',
      solution: 'function createCache(now) {\n  const store = new Map();\n  return {\n    getOrCreate(key, ttlMs, factory) {\n      const e = store.get(key);\n      if (e && now() < e.expires) return e.value;\n      const value = factory();\n      store.set(key, { value, expires: now() + ttlMs });\n      return value;\n    },\n  };\n}\n',
      tests: [
        { call: '(() => { let t = 0, calls = 0; const c = createCache(() => t); const load = () => ++calls; const a = c.getOrCreate("courses", 5000, load); t = 3000; const b = c.getOrCreate("courses", 5000, load); return [a, b, calls]; })()', expect: [1, 1, 1], msg: 'Within the TTL the factory must not be called again' },
        { call: '(() => { let t = 0, calls = 0; const c = createCache(() => t); const load = () => ++calls; c.getOrCreate("courses", 5000, load); t = 6000; const b = c.getOrCreate("courses", 5000, load); return [b, calls]; })()', expect: [2, 2], msg: 'After the TTL the factory must run again' },
        { call: '(() => { const c = createCache(() => 0); c.getOrCreate("a", 100, () => "A"); return c.getOrCreate("b", 100, () => "B"); })()', expect: 'B', msg: 'Different keys must be cached separately' },
      ],
      explain: 'This is the cache-aside pattern behind `IMemoryCache.GetOrCreate`: check, on miss load + store with an expiry. The expiry keeps data from getting too stale - choose it based on how often the data changes.',
    },
  ],
};
