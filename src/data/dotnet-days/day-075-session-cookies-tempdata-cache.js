const sessionSimCode = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

var server = new SessionServer();

// Two different browsers -> two different session ids (sent back in a cookie)
string asha = server.StartSession();
string ravi = server.StartSession();

server.AddToCart(asha, new CartItem(1, "Laptop", 45000, 1));
server.AddToCart(asha, new CartItem(2, "Mouse", 500, 2));
server.AddToCart(ravi, new CartItem(3, "Keyboard", 1200, 1));
server.AddToCart(asha, new CartItem(2, "Mouse", 500, 1));    // same product again -> quantity grows

server.ShowCart(asha);
server.ShowCart(ravi);

Console.WriteLine("Raw string stored in session S1 under key 'Cart':");
Console.WriteLine(server.Raw(asha, "Cart"));

// ================= types =================
record CartItem(int ProductId, string Name, int Price, int Qty);

// Simulates the server-side session store (AddDistributedMemoryCache + AddSession)
class SessionServer
{
    private int _next = 1;
    private readonly Dictionary<string, Dictionary<string, string>> _store = new();

    public string StartSession()
    {
        string id = "S" + _next++;
        _store[id] = new Dictionary<string, string>();
        Console.WriteLine($"Set-Cookie: .AspNetCore.Session={id}; path=/; httponly");
        return id;
    }

    // Like HttpContext.Session.GetString + JSON deserialize
    private List<CartItem> GetCart(string sessionId) =>
        _store[sessionId].TryGetValue("Cart", out var json)
            ? JsonSerializer.Deserialize<List<CartItem>>(json)!
            : new List<CartItem>();

    // Like JSON serialize + HttpContext.Session.SetString
    private void SaveCart(string sessionId, List<CartItem> cart) =>
        _store[sessionId]["Cart"] = JsonSerializer.Serialize(cart);

    public void AddToCart(string sessionId, CartItem item)
    {
        var cart = GetCart(sessionId);
        var existing = cart.FirstOrDefault(c => c.ProductId == item.ProductId);
        if (existing is null)
            cart.Add(item);
        else
            cart[cart.IndexOf(existing)] = existing with { Qty = existing.Qty + item.Qty };
        SaveCart(sessionId, cart);
    }

    public void ShowCart(string sessionId)
    {
        var cart = GetCart(sessionId);
        Console.WriteLine($"Cart of {sessionId}:");
        foreach (var c in cart)
            Console.WriteLine($"  {c.Name} x {c.Qty} = {c.Price * c.Qty}");
        Console.WriteLine($"  Total = {cart.Sum(c => c.Price * c.Qty)}");
    }

    public string Raw(string sessionId, string key) => _store[sessionId][key];
}`;

const cacheSimCode = `using System;
using System.Collections.Generic;

// A fake clock lets us "move time" without waiting
var clock = new FakeClock();
var cache = new MiniCache(clock);
var db = new SlowDatabase();

for (int minute = 0; minute <= 6; minute += 2)
{
    clock.Minutes = minute;
    var list = cache.GetOrCreate("students", absoluteMinutes: 5, factory: db.LoadStudents);
    Console.WriteLine($"t={minute} min -> {list.Count} students");
}
Console.WriteLine($"Database was queried {db.Calls} time(s)");

class FakeClock { public int Minutes { get; set; } }

class SlowDatabase
{
    public int Calls { get; private set; }
    public List<string> LoadStudents()
    {
        Calls++;
        Console.WriteLine("   (cache MISS: loading from database)");
        return new List<string> { "Asha", "Ravi", "Meena" };
    }
}

// Works like IMemoryCache.GetOrCreate with AbsoluteExpirationRelativeToNow
class MiniCache
{
    private readonly FakeClock _clock;
    private readonly Dictionary<string, (object Value, int ExpiresAt)> _items = new();

    public MiniCache(FakeClock clock) => _clock = clock;

    public T GetOrCreate<T>(string key, int absoluteMinutes, Func<T> factory)
    {
        if (_items.TryGetValue(key, out var entry) && _clock.Minutes < entry.ExpiresAt)
        {
            Console.WriteLine("   (cache HIT)");
            return (T)entry.Value;
        }
        T value = factory();
        _items[key] = (value!, _clock.Minutes + absoluteMinutes);
        return value;
    }
}`;

const cookieCode = `// File: Controllers/PreferenceController.cs
using Microsoft.AspNetCore.Mvc;

namespace StudentPortal.Controllers;

public class PreferenceController : Controller
{
    private const string ThemeCookie = "Theme";
    private const string NameCookie = "VisitorName";

    public IActionResult Index()
    {
        // READ cookies sent by the browser (null if missing)
        ViewBag.Theme = Request.Cookies[ThemeCookie] ?? "light";
        ViewBag.Name = Request.Cookies[NameCookie];
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Save(string name, string theme, bool remember)
    {
        var options = new CookieOptions
        {
            HttpOnly = true,                         // JavaScript cannot read it (XSS protection)
            Secure = true,                           // only sent over HTTPS
            SameSite = SameSiteMode.Lax,             // basic CSRF protection
            IsEssential = true,                      // allowed even without cookie consent
        };
        if (remember)
            options.Expires = DateTimeOffset.UtcNow.AddDays(30);   // persistent cookie
        // no Expires -> session cookie, deleted when the browser closes

        // WRITE cookies: added to the response as Set-Cookie headers
        Response.Cookies.Append(NameCookie, name, options);
        Response.Cookies.Append(ThemeCookie, theme, options);

        TempData["Message"] = "Preferences saved";
        return RedirectToAction(nameof(Index));
    }

    public IActionResult Forget()
    {
        // DELETE cookies: sends an already-expired cookie
        Response.Cookies.Delete(NameCookie);
        Response.Cookies.Delete(ThemeCookie);
        return RedirectToAction(nameof(Index));
    }
}

// File: Views/Preference/Index.cshtml
@{
    ViewData["Title"] = "Preferences";
    string theme = (string)ViewBag.Theme;
}
<div class="@(theme == "dark" ? "bg-dark text-white" : "bg-light") p-4 rounded">
    @if (TempData["Message"] is string msg)
    {
        <div class="alert alert-success">@msg</div>
    }
    <h2>Welcome @(ViewBag.Name ?? "guest")!</h2>
    <p>Current theme: <b>@theme</b></p>

    <form asp-action="Save" method="post" class="row g-2">
        <div class="col-md-4"><input name="name" class="form-control" placeholder="Your name" value="@ViewBag.Name" /></div>
        <div class="col-md-3">
            <select name="theme" class="form-select">
                <option value="light">Light</option>
                <option value="dark" selected="@(theme == "dark")">Dark</option>
            </select>
        </div>
        <div class="col-md-3 form-check pt-2">
            <input type="checkbox" name="remember" value="true" class="form-check-input" id="remember" />
            <label for="remember" class="form-check-label">Remember for 30 days</label>
        </div>
        <div class="col-md-2"><button class="btn btn-primary">Save</button></div>
    </form>
    <a asp-action="Forget" class="mt-2 d-inline-block">Forget me</a>
</div>`;

const cartCode = `// File: Models/Product.cs
namespace ShopDemo.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

// File: Models/CartItem.cs
namespace ShopDemo.Models;

public class CartItem
{
    public int ProductId { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Total => Price * Quantity;
}

// File: Extensions/SessionExtensions.cs  (store any object as JSON in session)
using System.Text.Json;

namespace ShopDemo.Extensions;

public static class SessionExtensions
{
    public static void SetObject<T>(this ISession session, string key, T value)
        => session.SetString(key, JsonSerializer.Serialize(value));

    public static T? GetObject<T>(this ISession session, string key)
    {
        string? json = session.GetString(key);
        return json == null ? default : JsonSerializer.Deserialize<T>(json);
    }
}

// File: Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// 1) Session needs a cache to store its data (in-memory for one server; Redis/SQL for many servers)
builder.Services.AddDistributedMemoryCache();

// 2) Register session services
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20);   // session expires after 20 min of inactivity
    options.Cookie.Name = ".ShopDemo.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.UseSession();   // 3) AFTER UseRouting, BEFORE the endpoints

app.MapControllerRoute(name: "default", pattern: "{controller=Cart}/{action=Products}/{id?}");
app.Run();

// File: Controllers/CartController.cs
using Microsoft.AspNetCore.Mvc;
using ShopDemo.Extensions;
using ShopDemo.Models;

namespace ShopDemo.Controllers;

public class CartController : Controller
{
    private const string CartKey = "Cart";

    // In a real app products come from the database (Module 7)
    private static readonly List<Product> Products = new()
    {
        new Product { Id = 1, Name = "Laptop", Price = 45000m },
        new Product { Id = 2, Name = "Mouse", Price = 500m },
        new Product { Id = 3, Name = "Keyboard", Price = 1200m },
    };

    private List<CartItem> GetCart() => HttpContext.Session.GetObject<List<CartItem>>(CartKey) ?? new List<CartItem>();
    private void SaveCart(List<CartItem> cart)
    {
        HttpContext.Session.SetObject(CartKey, cart);
        HttpContext.Session.SetInt32("CartCount", cart.Sum(c => c.Quantity));   // for the navbar badge
    }

    public IActionResult Products() => View(Products);

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Add(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);
        if (product == null) return NotFound();

        var cart = GetCart();
        var item = cart.FirstOrDefault(c => c.ProductId == id);
        if (item == null)
            cart.Add(new CartItem { ProductId = id, Name = product.Name, Price = product.Price, Quantity = 1 });
        else
            item.Quantity++;

        SaveCart(cart);
        TempData["Message"] = $"{product.Name} added to cart";
        return RedirectToAction(nameof(Products));
    }

    public IActionResult Index()
    {
        var cart = GetCart();
        ViewBag.GrandTotal = cart.Sum(c => c.Total);
        return View(cart);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Remove(int id)
    {
        var cart = GetCart();
        cart.RemoveAll(c => c.ProductId == id);
        SaveCart(cart);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Clear()
    {
        HttpContext.Session.Remove(CartKey);
        HttpContext.Session.Remove("CartCount");
        // HttpContext.Session.Clear();  // would remove EVERYTHING from this user's session
        return RedirectToAction(nameof(Index));
    }
}

// File: Views/Cart/Products.cshtml
@model List<ShopDemo.Models.Product>
@{ ViewData["Title"] = "Products"; }
@if (TempData["Message"] != null)
{
    <div class="alert alert-success">@TempData["Message"]</div>
}
<h2>Products</h2>
<div class="row">
@foreach (var p in Model)
{
    <div class="col-md-4">
        <div class="card mb-3"><div class="card-body">
            <h5>@p.Name</h5>
            <p>Rs. @p.Price.ToString("0.00")</p>
            <form asp-action="Add" asp-route-id="@p.Id" method="post">
                <button class="btn btn-primary">Add to cart</button>
            </form>
        </div></div>
    </div>
}
</div>

// File: Views/Cart/Index.cshtml
@model List<ShopDemo.Models.CartItem>
@{ ViewData["Title"] = "My Cart"; }
<h2>My Cart</h2>
@if (!Model.Any())
{
    <p>Your cart is empty. <a asp-action="Products">Continue shopping</a></p>
}
else
{
    <table class="table">
        <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr>
        @foreach (var item in Model)
        {
            <tr>
                <td>@item.Name</td><td>@item.Price.ToString("0.00")</td><td>@item.Quantity</td><td>@item.Total.ToString("0.00")</td>
                <td><form asp-action="Remove" asp-route-id="@item.ProductId" method="post"><button class="btn btn-sm btn-danger">Remove</button></form></td>
            </tr>
        }
        <tr><th colspan="3">Grand total</th><th>@(((decimal)ViewBag.GrandTotal).ToString("0.00"))</th><th></th></tr>
    </table>
    <form asp-action="Clear" method="post"><button class="btn btn-outline-secondary">Clear cart</button></form>
}

// File: Views/Shared/_Layout.cshtml (navbar badge - add inside the navbar)
@using Microsoft.AspNetCore.Http
<a class="nav-link" asp-controller="Cart" asp-action="Index">
    Cart <span class="badge bg-danger">@(Context.Session.GetInt32("CartCount") ?? 0)</span>
</a>`;

const tempDataCode = `// File: Controllers/StudentController.cs (Post-Redirect-Get with TempData)
[HttpPost, ValidateAntiForgeryToken]
public IActionResult Create(Student student)
{
    if (!ModelState.IsValid) return View(student);
    _service.Add(student);

    TempData["Success"] = $"Student {student.Name} was added";   // survives ONE redirect
    TempData["NewId"] = student.Id;                               // simple types only (string, int, bool...)
    return RedirectToAction(nameof(Index));
}

public IActionResult Index()
{
    // Peek: read WITHOUT marking for deletion
    object? peeked = TempData.Peek("NewId");

    return View(_service.GetAll());
}

// File: Views/Student/Index.cshtml
@if (TempData["Success"] is string msg)        // reading marks "Success" for deletion
{
    <div class="alert alert-success alert-dismissible">@msg</div>
}
@{
    var newId = TempData["NewId"];             // read -> marked for deletion
    TempData.Keep("NewId");                    // ...but Keep says "keep it for one more request"
}
<p>Highlight row: @newId</p>

// File: Program.cs - optional: store TempData in Session instead of a cookie
builder.Services.AddControllersWithViews().AddSessionStateTempDataProvider();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();
// ... app.UseSession();`;

const memoryCacheCode = `// File: Services/CachedStudentService.cs
using Microsoft.Extensions.Caching.Memory;
using StudentPortal.Models;

namespace StudentPortal.Services;

public class CachedStudentService
{
    private const string CacheKey = "students:all";
    private readonly IMemoryCache _cache;
    private readonly IStudentService _inner;           // the "slow" service (database later)
    private readonly ILogger<CachedStudentService> _logger;

    public CachedStudentService(IMemoryCache cache, IStudentService inner, ILogger<CachedStudentService> logger)
    {
        _cache = cache; _inner = inner; _logger = logger;
    }

    public List<Student> GetAll()
    {
        // GetOrCreate: return cached value, or run the factory and cache the result
        return _cache.GetOrCreate(CacheKey, entry =>
        {
            _logger.LogInformation("Cache MISS - loading students from the data source");
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);  // max age
            entry.SlidingExpiration = TimeSpan.FromMinutes(2);                // removed if unused for 2 min
            entry.Priority = CacheItemPriority.Normal;
            return _inner.GetAll();
        })!;
    }

    public void Add(Student s)
    {
        _inner.Add(s);
        _cache.Remove(CacheKey);         // INVALIDATE: data changed, next read reloads
        _logger.LogInformation("Cache cleared after adding {Name}", s.Name);
    }
}

// File: Program.cs
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IStudentService, InMemoryStudentService>();
builder.Services.AddScoped<CachedStudentService>();

// File: Controllers/StudentController.cs (use the cached service)
public class StudentController : Controller
{
    private readonly CachedStudentService _students;
    public StudentController(CachedStudentService students) => _students = students;

    public IActionResult Index() => View(_students.GetAll());
}

// Alternative: TryGetValue / Set
if (!_cache.TryGetValue(CacheKey, out List<Student>? students))
{
    students = _inner.GetAll();
    _cache.Set(CacheKey, students, TimeSpan.FromMinutes(5));
}`;

export default {
  id: 'day-075-session-cookies-tempdata-cache',
  title: 'Session Management, Cookies, TempData and Cache Basics',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 75,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `HTTP is stateless – the server forgets you after every request. Today you learn the tools ASP.NET Core gives to remember things: cookies (stored in the browser), session (stored on the server, linked by a cookie), TempData (data that survives exactly one redirect) and in-memory caching (sharing expensive data between all users). You will build a complete shopping cart stored in session, a theme/name preference with cookies, flash messages with TempData and a cached student list.`,
  objectives: [
    'Explain why HTTP is stateless and compare cookies, session, TempData, query string and cache',
    'Create, read and delete cookies with CookieOptions (Expires, HttpOnly, Secure, SameSite)',
    'Configure session (AddDistributedMemoryCache, AddSession, UseSession) and store strings, integers and JSON objects',
    'Use TempData for Post-Redirect-Get messages, including Peek and Keep',
    'Cache data with IMemoryCache using absolute and sliding expiration, and invalidate it when data changes',
  ],
  theory: [
    {
      heading: 'HTTP is stateless – ways to keep state',
      content: `Each HTTP request is independent: when you add a laptop to the cart and then open the cart page, the server receives two unrelated requests. To "remember" the user we need **state management**.

| Technique | Stored where | Lifetime | Shared by | Size | Good for |
|---|---|---|---|---|---|
| **Cookie** | browser | until expiry or browser close | one user | ~4 KB per cookie | preferences, "remember me", auth ticket |
| **Session** | server (cache), id in cookie | idle timeout (default 20 min) | one user | server memory | shopping cart, wizard steps |
| **TempData** | cookie (default) or session | until it is read (one redirect) | one user | small | success/error flash messages |
| **Query string / route** | URL | one request | anyone with the link | ~2 KB | page number, search term, id |
| **Hidden field** | HTML form | one post | one user | small | id while editing |
| **Cache** | server memory | expiration policy | ALL users | server memory | product list, lookups |
| **Database** | server | permanent | all | big | orders, accounts |

Real-world analogy: a **cloakroom at a wedding**. You hand over your bag (data) and receive a **token number** (session cookie). The bag stays at the counter (server); you only carry the small token. Each time you come back you show the token and get your bag. If you do not come back for a long time (idle timeout) the bag is cleared.`,
    },
    {
      heading: 'Cookies',
      content: `A cookie is a small name=value text the **server asks the browser to store** (\`Set-Cookie\` response header). The browser then sends it back automatically on every request to the same site (\`Cookie\` request header).

- **Write**: \`Response.Cookies.Append("Theme", "dark", options);\`
- **Read**: \`string? theme = Request.Cookies["Theme"];\` (null if not present)
- **Delete**: \`Response.Cookies.Delete("Theme");\` (sends an expired cookie)

**CookieOptions**
| Option | Meaning |
|---|---|
| \`Expires\` / \`MaxAge\` | persistent cookie until that time; without it → *session cookie*, deleted when the browser closes |
| \`HttpOnly = true\` | JavaScript (document.cookie) cannot read it – protects against XSS stealing |
| \`Secure = true\` | sent only over HTTPS |
| \`SameSite = Lax/Strict/None\` | controls sending on cross-site requests (CSRF protection); None requires Secure |
| \`Path\`, \`Domain\` | which URLs receive the cookie |
| \`IsEssential = true\` | allowed even if the user did not accept non-essential cookies (GDPR consent feature) |

**Security rules**: never store passwords, card numbers or roles in a plain cookie – the user can read and edit it (F12 > Application > Cookies). Store only an id or harmless preferences, or use the Data Protection API / authentication cookies, which are encrypted.`,
    },
    {
      heading: 'Session state',
      content: `Session keeps data **on the server** per user. The browser only holds a random session id in a cookie (default name \`.AspNetCore.Session\`).

**Setup (3 steps)**
1. \`builder.Services.AddDistributedMemoryCache();\` – where session data is stored (in-memory; for multiple servers use Redis or SQL Server distributed cache).
2. \`builder.Services.AddSession(o => { o.IdleTimeout = TimeSpan.FromMinutes(20); o.Cookie.HttpOnly = true; o.Cookie.IsEssential = true; });\`
3. \`app.UseSession();\` – after \`UseRouting\` and before \`MapControllerRoute\`. Without it you get *"Session has not been configured for this application or request"*.

**Using it** (\`HttpContext.Session\`, type \`ISession\`)
- \`SetString(key, value)\` / \`GetString(key)\`
- \`SetInt32(key, number)\` / \`GetInt32(key)\` (returns int?)
- \`Remove(key)\`, \`Clear()\`, \`Id\`
- Objects: serialize to JSON with an extension method \`SetObject<T>\` / \`GetObject<T>\` (session only stores byte arrays).

**Things to know**
- Session data is lost when the app restarts if you use the in-memory cache.
- The session cookie is not persistent – closing the browser starts a new session.
- Keep session data small; do not store huge lists or DbContext objects.
- In views use \`Context.Session\`; in controllers \`HttpContext.Session\`.`,
    },
    {
      heading: 'TempData: data for the next request',
      content: `**TempData** (\`ITempDataDictionary\`) stores data until it is **read**, which makes it perfect for the **Post-Redirect-Get** pattern: an action saves, sets \`TempData["Success"] = "Saved"\`, and redirects; the next page shows the message once. Refreshing the page does not show it again.

| Method | Effect |
|---|---|
| \`TempData["key"] = value\` | store (string, int, bool, Guid... simple types; serialize objects to JSON yourself) |
| \`var x = TempData["key"]\` | read **and mark for deletion** at the end of the request |
| \`TempData.Peek("key")\` | read **without** marking for deletion |
| \`TempData.Keep("key")\` / \`Keep()\` | un-mark a value that was read, keep it for one more request |

**Providers**: by default TempData is stored in an encrypted **cookie** (CookieTempDataProvider). Call \`.AddSessionStateTempDataProvider()\` to keep it in session instead.

**ViewData/ViewBag vs TempData**: ViewData and ViewBag live only for the **current** request (controller → view). TempData survives a **redirect**.`,
    },
    {
      heading: 'Cache basics: IMemoryCache',
      content: `Session is per user; a **cache** is **shared by all users** and keeps the result of expensive work (database queries, API calls) in server memory.

**Setup**: \`builder.Services.AddMemoryCache();\` then inject \`IMemoryCache\`.

| API | Use |
|---|---|
| \`_cache.GetOrCreate(key, entry => { ...; return value; })\` | read or create in one call (also \`GetOrCreateAsync\`) |
| \`_cache.TryGetValue(key, out T value)\` | check if present |
| \`_cache.Set(key, value, TimeSpan)\` | store |
| \`_cache.Remove(key)\` | invalidate after data changes |

**Expiration**
- **Absolute** (\`AbsoluteExpirationRelativeToNow\`): removed after a fixed time, no matter what. Guarantees freshness.
- **Sliding** (\`SlidingExpiration\`): removed if not accessed for that time; every access extends it. Combine with absolute so popular items are still refreshed.
- **Priority / Size**: decide which items are removed first under memory pressure.

**Other caches** (more in Extra 45): \`IDistributedCache\` (Redis / SQL Server – shared by many servers), **Response caching** (\`[ResponseCache(Duration = 60)]\` + \`UseResponseCaching()\` – HTTP cache headers), **Output caching** (.NET 7+, \`AddOutputCache()\` / \`[OutputCache]\` – caches the whole response on the server).

Golden rule: **cache invalidation** – whenever you insert/update/delete, remove or refresh the cached item, otherwise users see stale data.`,
      tip: 'Do not cache per-user secrets in IMemoryCache with a shared key; include the user id in the key (e.g. "cart:42") or use session.',
    },
  ],
  examples: [
    {
      title: 'Remember a visitor name and theme with cookies',
      scenario: 'The portal greets returning visitors by name and remembers a light/dark theme. If "Remember" is ticked the cookie lasts 30 days, otherwise it is deleted when the browser closes.',
      steps: [
        'Open the StudentPortal MVC project',
        'Right-click Controllers > Add > Controller > MVC Controller - Empty > PreferenceController.cs; paste the code',
        'Right-click the Index action > Add View > Razor View - Empty > Index.cshtml; paste the markup',
        'Press Ctrl+F5 and open /Preference',
        'Enter a name, choose Dark, tick Remember and Save',
        'Press F12 > Application tab (Chrome/Edge) > Cookies > https://localhost:<port> to see VisitorName and Theme with their Expires, HttpOnly, Secure and SameSite columns',
        'Close and reopen the browser: with Remember the name is still there; click "Forget me" to delete',
      ],
      code: cookieCode,
      result: `First visit:  "Welcome guest!"  Current theme: light
After saving "Asha", Dark, Remember:
  Response headers:
    Set-Cookie: VisitorName=Asha; expires=Thu, 17 Dec 2026 ...; path=/; secure; samesite=lax; httponly
    Set-Cookie: Theme=dark; expires=Thu, 17 Dec 2026 ...; path=/; secure; samesite=lax; httponly
  Page (after redirect): green "Preferences saved", dark box, "Welcome Asha!"  Current theme: dark
After "Forget me": "Welcome guest!" again and the cookies are gone from F12 > Application > Cookies.`,
      explanation: `Response.Cookies.Append only adds Set-Cookie headers; the browser stores them and returns them on the NEXT request, so we redirect to Index before reading them. HttpOnly + Secure + SameSite are safe defaults. Because the user can edit cookies, we only store harmless values. Razor encodes @ViewBag.Name automatically, so a malicious cookie value cannot inject HTML.`,
    },
    {
      title: 'Shopping cart stored in session (complete MVC app)',
      scenario: 'An online shop lists products; clicking "Add to cart" stores the item in the user\'s session. The cart page shows quantities and totals, items can be removed, and the navbar shows a badge with the item count.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > name it ShopDemo > Create',
        'Add Models/Product.cs and Models/CartItem.cs (right-click Models > Add > Class)',
        'Add a folder Extensions and the SessionExtensions.cs class',
        'Edit Program.cs: AddDistributedMemoryCache, AddSession, UseSession, and change the default route to Cart/Products',
        'Add Controllers/CartController.cs (MVC Controller - Empty)',
        'Create Views/Cart/Products.cshtml and Views/Cart/Index.cshtml (right-click each action > Add View)',
        'Add the cart badge link inside the navbar <ul> in Views/Shared/_Layout.cshtml',
        'Press Ctrl+F5, add Laptop once and Mouse twice, open the Cart page',
        'Open a different browser (or InPrivate window): its cart is empty – each browser has its own session',
      ],
      code: cartCode,
      result: `Products page after clicking "Add to cart" on Mouse: green alert "Mouse added to cart", navbar "Cart 3"
Cart page:
Product   Price     Qty  Total
Laptop    45000.00  1    45000.00
Mouse     500.00    2    1000.00
Grand total              46000.00

F12 > Application > Cookies shows .ShopDemo.Session = CfDJ8... (encrypted id, no expiry date = session cookie)
InPrivate window: "Your cart is empty."
After 20 minutes without requests (IdleTimeout) or an app restart the cart is empty again.`,
      explanation: `ISession can only store strings, ints and bytes, so the cart list is serialized to JSON by the SetObject/GetObject extension methods. Every action reads the cart, changes it and saves it back. CartCount is stored separately as an int so the layout can show the badge cheaply via Context.Session.GetInt32. The data lives on the server; the browser only has the encrypted session id. For a real shop with logged-in users, you would save the cart to the database so it survives restarts and works on other devices.`,
    },
    {
      title: 'How session keeps each user\'s cart separate (console simulation)',
      scenario: 'Simulate the server-side session store: two browsers get different session ids, each cart is stored as a JSON string under the key "Cart".',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it SessionSimulator',
        'Replace Program.cs with the code below (System.Text.Json is built into .NET, no NuGet needed)',
        'Press Ctrl+F5',
        'Add a fifth AddToCart call for ravi and predict both totals',
      ],
      code: sessionSimCode,
      csharp: { files: { 'Program.cs': sessionSimCode }, stdin: '' },
      result: `Set-Cookie: .AspNetCore.Session=S1; path=/; httponly
Set-Cookie: .AspNetCore.Session=S2; path=/; httponly
Cart of S1:
  Laptop x 1 = 45000
  Mouse x 3 = 1500
  Total = 46500
Cart of S2:
  Keyboard x 1 = 1200
  Total = 1200
Raw string stored in session S1 under key 'Cart':
[{"ProductId":1,"Name":"Laptop","Price":45000,"Qty":1},{"ProductId":2,"Name":"Mouse","Price":500,"Qty":3}]`,
      explanation: `The store is a dictionary of session id -> (key -> string), just like the real distributed cache behind ISession. Each AddToCart reads the JSON, deserializes it into a list, updates it and serializes it back – exactly what our SessionExtensions do. The record "with" expression creates a copy with the new quantity (Mouse 2 + 1 = 3). Asha (S1) and Ravi (S2) never see each other's data because the lookup always starts with their own session id.`,
    },
    {
      title: 'TempData flash messages with Peek and Keep',
      scenario: 'After adding a student, show "Student Kiran was added" once on the list page and highlight the new row; the message must disappear on refresh.',
      steps: [
        'Open StudentController in StudentPortal and update the POST Create and Index actions',
        'Add the TempData markup at the top of Views/Student/Index.cshtml',
        'Press Ctrl+F5, add a student, observe the message, then press F5 in the browser',
        'Optional: switch to the session TempData provider using the Program.cs lines and repeat',
      ],
      code: tempDataCode,
      result: `After POST /Student/Create -> 302 redirect -> GET /Student:
  [green] Student Kiran Rao was added
  Highlight row: 4
Browser refresh (F5):
  no green message (Success was read and deleted)
  Highlight row: 4   (NewId was kept with Keep)
If you delete the TempData.Keep("NewId") line and repeat, the refresh shows:
  Highlight row:      (NewId was read without Keep, so it was deleted)`,
      explanation: `Reading TempData["Success"] marks it for deletion at the end of the request, so it shows only once. TempData.Peek reads without marking, and TempData.Keep un-marks a value that was read, so NewId survives one more request. With the default cookie provider the data travels in an encrypted cookie named .AspNetCore.Mvc.CookieTempDataProvider.`,
    },
    {
      title: 'Cache the student list with IMemoryCache',
      scenario: 'The student list is requested hundreds of times a minute but changes rarely. Cache it for 5 minutes (absolute) and clear the cache when a student is added.',
      steps: [
        'Add Services/CachedStudentService.cs to StudentPortal',
        'Register AddMemoryCache and CachedStudentService in Program.cs',
        'Inject CachedStudentService into StudentController',
        'Press F5, open /Student several times and watch the console: only the first request logs "Cache MISS"',
        'Add a student and open /Student again: one more MISS because the cache was invalidated',
      ],
      code: memoryCacheCode,
      result: `GET /Student  -> info: StudentPortal.Services.CachedStudentService[0] Cache MISS - loading students from the data source
GET /Student  -> (no log - served from cache)
GET /Student  -> (no log - served from cache)
POST /Student/Create -> info: ... Cache cleared after adding Kiran Rao
GET /Student  -> info: ... Cache MISS - loading students from the data source`,
      explanation: `GetOrCreate runs the factory only when the key is missing or expired. Absolute expiration guarantees the data is at most 5 minutes old; sliding expiration removes it early if nobody asks for 2 minutes. The Add method removes the key so the next read reloads fresh data. IMemoryCache is a singleton, shared by all users and cleared when the app restarts.`,
    },
    {
      title: 'Absolute expiration with a fake clock (console)',
      scenario: 'Prove how absolute expiration works by moving a fake clock 0, 2, 4 and 6 minutes with a 5-minute cache.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it CacheExpiryDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Change absoluteMinutes to 3 and predict how many database calls happen',
      ],
      code: cacheSimCode,
      csharp: { files: { 'Program.cs': cacheSimCode }, stdin: '' },
      result: `   (cache MISS: loading from database)
t=0 min -> 3 students
   (cache HIT)
t=2 min -> 3 students
   (cache HIT)
t=4 min -> 3 students
   (cache MISS: loading from database)
t=6 min -> 3 students
Database was queried 2 time(s)`,
      explanation: `At t=0 the cache is empty, so the factory runs and the entry expires at minute 5. At t=2 and t=4 the time is before 5, so the cached list is returned. At t=6 the entry has expired, the database is queried again and a new expiry (minute 11) is set. With absoluteMinutes = 3: MISS at 0 (expires 3), HIT at 2, MISS at 4 (expires 7), HIT at 6 – also 2 calls.`,
    },
  ],
  interview: [
    { q: 'Why do we need state management in web applications?', a: 'HTTP is stateless; every request is independent. To remember a user, cart or preference across requests we use cookies, session, TempData, query strings, cache or a database.', level: 'Easy' },
    { q: 'Difference between a cookie and session?', a: 'A cookie stores data in the browser (small, visible/editable by user, sent with every request). Session stores data on the server; the browser only keeps a session id cookie. Session is safer for larger or sensitive data.', level: 'Easy' },
    { q: 'What is a persistent cookie vs a session cookie?', a: 'A persistent cookie has Expires/MaxAge and survives browser restarts until that date. A session cookie has no expiry and is deleted when the browser closes.', level: 'Easy' },
    { q: 'What do HttpOnly, Secure and SameSite do?', a: 'HttpOnly blocks JavaScript access (XSS protection), Secure sends the cookie only over HTTPS, SameSite limits sending on cross-site requests (CSRF protection).', level: 'Medium' },
    { q: 'What are the three steps to enable session in ASP.NET Core?', a: 'AddDistributedMemoryCache (or another IDistributedCache), AddSession(options), and app.UseSession() in the pipeline before endpoints.', level: 'Easy' },
    { q: 'How do you store an object in session?', a: 'Serialize it to JSON (System.Text.Json) and store with SetString; read with GetString and deserialize. Usually wrapped in SetObject/GetObject extension methods.', level: 'Medium' },
    { q: 'Why might session data disappear?', a: 'Idle timeout expired, browser closed (session cookie lost), app restarted with in-memory cache, or a load-balanced server without a shared distributed cache.', level: 'Medium' },
    { q: 'Difference between ViewData/ViewBag and TempData?', a: 'ViewData/ViewBag live only for the current request (controller to view). TempData survives until it is read, typically across one redirect.', level: 'Easy' },
    { q: 'What is the difference between TempData.Peek and TempData.Keep?', a: 'Peek reads a value without marking it for deletion. Keep is called after a normal read to un-mark the value so it survives one more request.', level: 'Medium' },
    { q: 'Absolute vs sliding expiration?', a: 'Absolute removes the item after a fixed time regardless of use. Sliding removes it if not accessed within the interval; each access extends it. They are often combined.', level: 'Medium' },
    { q: 'When should you use IDistributedCache instead of IMemoryCache?', a: 'When the app runs on multiple servers/containers (web farm) so all instances share the cache, or when cached data must survive an app restart (Redis, SQL Server).', level: 'Hard' },
    { q: 'Output question: TempData["A"] = 1 then redirect. Page 1 reads TempData["A"]. Page 2 (refresh) reads TempData["A"]. What does page 2 get?', a: 'null – the value was read on page 1 and deleted at the end of that request (unless Keep was called).', level: 'Medium' },
    { q: 'What error appears if you use HttpContext.Session without UseSession?', a: 'InvalidOperationException: Session has not been configured for this application or request.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Count how many pages a user has visited in the current session and show it in the footer of _Layout.cshtml.',
      hint: 'Use a small inline middleware or a base controller to increment SetInt32("Visits").',
      solution: `// Program.cs after app.UseSession();
app.Use(async (ctx, next) =>
{
    int visits = (ctx.Session.GetInt32("Visits") ?? 0) + 1;
    ctx.Session.SetInt32("Visits", visits);
    await next(ctx);
});
// _Layout.cshtml
<footer>Pages visited this session: @(Context.Session.GetInt32("Visits") ?? 0)</footer>`,
    },
    {
      task: 'Add an "Update quantity" form to the cart page (number input + Update button) that changes the quantity of an item; quantity 0 removes it.',
      hint: 'POST Update(int id, int quantity); find the item in the session cart.',
      solution: `[HttpPost, ValidateAntiForgeryToken]
public IActionResult Update(int id, int quantity)
{
    var cart = GetCart();
    var item = cart.FirstOrDefault(c => c.ProductId == id);
    if (item != null)
    {
        if (quantity <= 0) cart.Remove(item);
        else item.Quantity = quantity;
    }
    SaveCart(cart);
    return RedirectToAction(nameof(Index));
}`,
    },
    {
      task: 'Create a "LastVisited" cookie that stores the last student id viewed on Details; show "Last viewed student: X" on the Index page.',
      hint: 'Write the cookie in Details, read it in Index.',
      solution: `// Details
Response.Cookies.Append("LastVisited", id.ToString(), new CookieOptions { Expires = DateTimeOffset.UtcNow.AddDays(7), HttpOnly = true });
// Index
ViewBag.LastVisited = Request.Cookies["LastVisited"];
// Index.cshtml
@if (ViewBag.LastVisited != null) { <p>Last viewed student: @ViewBag.LastVisited</p> }`,
    },
    {
      task: 'Cache a list of courses with GetOrCreateAsync for 10 minutes and log a message when the cache is filled.',
      hint: 'await _cache.GetOrCreateAsync("courses", async entry => { ... })',
      solution: `public async Task<List<Course>> GetCoursesAsync()
{
    return (await _cache.GetOrCreateAsync("courses", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
        _logger.LogInformation("Loading courses into cache");
        return await _repository.GetCoursesAsync();
    }))!;
}`,
    },
    {
      task: 'Build a 3-step registration wizard (Personal > Course > Confirm) that keeps the data in session between steps and clears it after Confirm.',
      hint: 'Store a RegistrationDraft object with SetObject; each step POST updates it and redirects to the next step.',
      solution: `public class RegistrationDraft { public string? Name { get; set; } public string? Email { get; set; } public string? Course { get; set; } }

[HttpPost] public IActionResult Step1(string name, string email)
{ var d = HttpContext.Session.GetObject<RegistrationDraft>("Draft") ?? new(); d.Name = name; d.Email = email;
  HttpContext.Session.SetObject("Draft", d); return RedirectToAction("Step2"); }
[HttpPost] public IActionResult Step2(string course)
{ var d = HttpContext.Session.GetObject<RegistrationDraft>("Draft")!; d.Course = course;
  HttpContext.Session.SetObject("Draft", d); return RedirectToAction("Confirm"); }
[HttpPost] public IActionResult ConfirmPost()
{ var d = HttpContext.Session.GetObject<RegistrationDraft>("Draft")!; /* save d */ HttpContext.Session.Remove("Draft");
  TempData["Success"] = $"Registered {d.Name}"; return RedirectToAction("Index", "Home"); }`,
    },
  ],
  quiz: [
    {
      question: 'Where is session data stored in ASP.NET Core?',
      options: ['In the browser localStorage', 'On the server (IDistributedCache); the browser keeps only the session id cookie', 'In the URL', 'In appsettings.json'],
      answer: 1,
      explanation: 'Session data lives in a server-side distributed cache; the .AspNetCore.Session cookie only identifies it.',
    },
    {
      question: 'Which CookieOptions property prevents JavaScript from reading a cookie?',
      options: ['Secure', 'SameSite', 'IsEssential', 'HttpOnly'],
      answer: 3,
      explanation: 'HttpOnly cookies are not available to document.cookie, which protects them from XSS.',
    },
    {
      question: 'Which method reads a TempData value WITHOUT marking it for deletion?',
      options: ['TempData.Peek("key")', 'TempData["key"]', 'TempData.Remove("key")', 'TempData.Clear()'],
      answer: 0,
      explanation: 'Peek returns the value and leaves it for the next request.',
    },
    {
      question: 'A cache entry has SlidingExpiration = 2 minutes and is accessed every minute. AbsoluteExpiration is 10 minutes. When is it removed?',
      options: ['After 2 minutes', 'Never', 'After 10 minutes', 'After 12 minutes'],
      answer: 2,
      explanation: 'Sliding expiration keeps extending, but absolute expiration caps the lifetime at 10 minutes.',
    },
    {
      question: 'Where must app.UseSession() be placed?',
      options: ['After app.Run()', 'Before the endpoints are mapped/executed (after UseRouting)', 'In appsettings.json', 'Inside a controller'],
      answer: 1,
      explanation: 'Session middleware must run before the controller endpoints that use HttpContext.Session.',
    },
  ],
};
