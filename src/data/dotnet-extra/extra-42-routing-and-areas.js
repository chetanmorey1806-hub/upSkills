export default {
  id: 'extra-42-routing-and-areas',
  title: 'Conventional vs Attribute Routing and Areas',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 42,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Understand how ASP.NET Core MVC maps URLs to controller actions using conventional route templates and attribute routes, how route constraints, defaults, tokens and link generation work, and how Areas split a large app (Admin, Customer) into independent sections.',
  objectives: [
    'Configure conventional routes with MapControllerRoute, defaults, optional segments and constraints',
    'Apply attribute routing with [Route], [HttpGet("{id:int}")], tokens [controller]/[action] and route names',
    'Know the precedence rules when both routing styles exist',
    'Create an Admin Area in Visual Studio and route to it with MapAreaControllerRoute and asp-area',
    'Generate links correctly with Url.Action, asp-* tag helpers and CreatedAtAction',
  ],
  theory: [
    {
      heading: 'Endpoint routing in ASP.NET Core',
      content: 'Routing matches an incoming URL (path + HTTP method) to an endpoint and extracts route values such as controller, action and id. In ASP.NET Core 3+ routing is "endpoint routing": UseRouting() selects the endpoint, middleware such as UseAuthorization() can inspect it, and the endpoint executes at the end. In .NET 6+ WebApplication calls UseRouting/UseEndpoints for you, so you just call app.MapControllerRoute(...) or app.MapControllers(). Routing works in two directions: URL -> action (matching) and action -> URL (link generation).',
      points: [
        'Route values: controller, action, area, id, and any custom {placeholder}.',
        'Route template pieces: literal text, {parameter}, {parameter?} optional, {parameter=default}, {*catchall}, {id:int} constraint.',
        'Link generation uses the same templates in reverse so URLs are never hard-coded.',
      ],
    },
    {
      heading: 'Conventional routing',
      content: 'Conventional routes are defined centrally in Program.cs and apply to every controller that does NOT use attribute routing. The default MVC template registers {controller=Home}/{action=Index}/{id?}. Routes are evaluated in the order they are added, so put the most specific routes first. Conventional routing is common for MVC websites with many similar pages.',
      syntax: `app.MapControllerRoute(
    name: "blog",
    pattern: "blog/{year:int:min(2000)}/{slug}",
    defaults: new { controller = "Blog", action = "Post" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");`,
      points: [
        '/ -> HomeController.Index (both defaults used).',
        '/Students/Details/5 -> StudentsController.Details(int id = 5).',
        '/blog/2025/hello-world -> BlogController.Post(int year, string slug).',
        'Constraints: int, bool, guid, datetime, decimal, alpha, minlength(3), length(3,10), min(1), range(1,100), regex(...), required.',
        'Constraints are for disambiguation, NOT for input validation - invalid values give 404, not a helpful 400.',
      ],
    },
    {
      heading: 'Attribute routing',
      content: 'Attribute routes are placed directly on controllers and actions with [Route] and the HTTP verb attributes [HttpGet], [HttpPost], [HttpPut], [HttpPatch], [HttpDelete]. Web APIs with [ApiController] MUST use attribute routing. A controller-level [Route("api/[controller]")] is combined with action-level templates. Tokens [controller], [action] and [area] are replaced with the names. A template starting with / or ~/ is NOT combined with the controller prefix.',
      syntax: `[ApiController]
[Route("api/[controller]")]                 // api/products
public class ProductsController : ControllerBase
{
    [HttpGet]                               // GET api/products
    public IActionResult GetAll() => Ok();

    [HttpGet("{id:int}", Name = "GetProduct")] // GET api/products/5
    public IActionResult Get(int id) => Ok(id);

    [HttpGet("~/api/catalog/top")]          // GET api/catalog/top (ignores prefix)
    public IActionResult Top() => Ok();
}`,
      points: [
        'Multiple routes per action are allowed: [Route("")][Route("home")].',
        'Order property: [HttpGet("{slug}", Order = 2)] to break ties; lower runs first.',
        'Attribute routes are matched by precedence (literal segments beat parameters beat catch-all), not by order of declaration.',
        'A controller with any attribute route is not reachable via conventional routes.',
      ],
    },
    {
      heading: 'Conventional vs Attribute: when to use which',
      content: 'Conventional routing keeps URL design in one place and suits classic MVC sites where URLs follow /Controller/Action/Id. Attribute routing gives precise, REST-friendly URLs (api/orders/{orderId}/items/{itemId}) and lives next to the code it maps, so it is the standard for Web APIs. Many real apps mix both: MVC pages use the default conventional route, API controllers use attributes.',
      points: [
        'Conventional: central, less repetition, good for CRUD pages.',
        'Attribute: explicit per action, required for [ApiController], supports verbs and nested resources easily.',
        'Both support constraints, defaults, names and link generation.',
      ],
    },
    {
      heading: 'Areas',
      content: 'An Area is a feature folder inside an MVC app with its own Controllers, Views and Models, e.g. Areas/Admin and Areas/Customer. Areas let different teams own sections and allow two controllers with the same name (Admin/HomeController and HomeController). A controller belongs to an area via [Area("Admin")]. Add a route that includes {area} BEFORE the default route. Views are searched in /Areas/{area}/Views/{controller}/{action}.cshtml, then /Areas/{area}/Views/Shared, then /Views/Shared. Each area needs its own _ViewStart.cshtml and _ViewImports.cshtml (copy them) so layouts and tag helpers work.',
      syntax: `// Visual Studio: right-click project > Add > New Scaffolded Item > MVC Area > name "Admin"
// (VS 2022 17.x: Add > Area...)  It creates Areas/Admin/Controllers, Models, Views, Data

app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Dashboard}/{action=Index}/{id?}");

// or a dedicated route for one area
app.MapAreaControllerRoute(
    name: "admin",
    areaName: "Admin",
    pattern: "Admin/{controller=Dashboard}/{action=Index}/{id?}");`,
      tip: 'In views, links into an area need asp-area="Admin"; links out of an area back to the root need asp-area="" or the current area value is reused ("ambient value").',
    },
    {
      heading: 'Link generation',
      content: 'Never hard-code URLs. Use the anchor tag helper (asp-area, asp-controller, asp-action, asp-route-id), Url.Action(), Url.RouteUrl("RouteName"), RedirectToAction(), and in APIs CreatedAtAction(nameof(Get), new { id }, dto) or CreatedAtRoute("GetProduct", ...). If you later change a route template, every link updates automatically.',
      syntax: `<a asp-area="Admin" asp-controller="Users" asp-action="Edit" asp-route-id="7">Edit</a>
<!-- renders: <a href="/Admin/Users/Edit/7">Edit</a> -->

var url = Url.Action("Details", "Students", new { id = 5 });  // "/Students/Details/5"
return RedirectToAction("Index", "Dashboard", new { area = "Admin" });`,
    },
  ],
  examples: [
    {
      title: 'Conventional routes with defaults and a constrained custom route',
      scenario: 'An MVC site with the default route plus a friendly blog URL /blog/2025/my-first-post.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > Next',
        'Name it RoutingDemo, Framework .NET 8.0 or .NET 10.0 > Create',
        'Add Controllers/BlogController.cs and Controllers/StudentsController.cs',
        'Edit Program.cs so the blog route is mapped before the default route',
        'Press F5 and browse to /, /Students/Details/5, /blog/2025/my-first-post and /blog/1999/x',
      ],
      code: `// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllersWithViews();
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseStaticFiles();          // .NET 9+: app.MapStaticAssets();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "blog",
    pattern: "blog/{year:int:min(2000)}/{slug:minlength(3)}",
    defaults: new { controller = "Blog", action = "Post" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();

// Controllers/BlogController.cs
using Microsoft.AspNetCore.Mvc;
public class BlogController : Controller
{
    public IActionResult Post(int year, string slug) =>
        Content($"Blog post '{slug}' from {year}");
}

// Controllers/StudentsController.cs
using Microsoft.AspNetCore.Mvc;
public class StudentsController : Controller
{
    public IActionResult Index() => Content("All students");
    public IActionResult Details(int id) =>
        Content($"Student #{id}. Link back: {Url.Action("Index", "Students")}");
}`,
      result: `/                         -> HomeController.Index (default view)
/Students                 -> All students
/Students/Details/5       -> Student #5. Link back: /Students
/blog/2025/my-first-post  -> Blog post 'my-first-post' from 2025
/blog/1999/x              -> 404 Not Found (min(2000) and minlength(3) fail, and no default-route action "1999" on BlogController)`,
      explanation: 'The blog route is tried first; when its constraints fail, the default route is tried and fails too (controller "blog", action "1999" does not exist), so the result is 404. Url.Action generates /Students because Index is the default action and is omitted.',
    },
    {
      title: 'Attribute routing for a nested REST API',
      scenario: 'Orders and their items: /api/orders/{orderId}/items/{itemId} with route names and CreatedAtRoute.',
      steps: [
        'File > New > Project > ASP.NET Core Web API (Use controllers ticked) > name OrdersApi > Create',
        'Add Controllers/OrderItemsController.cs with the code below',
        'Press F5 and open Swagger at /swagger',
        'Try GET /api/orders/10/items, GET /api/orders/10/items/2, POST /api/orders/10/items',
      ],
      code: `using Microsoft.AspNetCore.Mvc;

namespace OrdersApi.Controllers;

public record OrderItem(int Id, int OrderId, string Product, int Qty);
public record CreateItemDto(string Product, int Qty);

[ApiController]
[Route("api/orders/{orderId:int}/items")]
public class OrderItemsController : ControllerBase
{
    private static readonly List<OrderItem> Items =
    [
        new(1, 10, "Keyboard", 1),
        new(2, 10, "Mouse", 2),
        new(3, 11, "Monitor", 1),
    ];

    [HttpGet]
    public ActionResult<IEnumerable<OrderItem>> GetAll(int orderId) =>
        Ok(Items.Where(i => i.OrderId == orderId));

    [HttpGet("{itemId:int}", Name = "GetOrderItem")]
    public ActionResult<OrderItem> Get(int orderId, int itemId)
    {
        var item = Items.FirstOrDefault(i => i.OrderId == orderId && i.Id == itemId);
        return item is null ? NotFound() : item;
    }

    [HttpPost]
    public ActionResult<OrderItem> Create(int orderId, CreateItemDto dto)
    {
        var item = new OrderItem(Items.Max(i => i.Id) + 1, orderId, dto.Product, dto.Qty);
        Items.Add(item);
        return CreatedAtRoute("GetOrderItem", new { orderId, itemId = item.Id }, item);
    }

    [HttpDelete("{itemId:int}")]
    public IActionResult Delete(int orderId, int itemId) =>
        Items.RemoveAll(i => i.OrderId == orderId && i.Id == itemId) > 0 ? NoContent() : NotFound();

    // absolute route: ignores the controller prefix
    [HttpGet("~/api/items/count")]
    public int Count() => Items.Count;
}`,
      result: `GET /api/orders/10/items
200 [{"id":1,"orderId":10,"product":"Keyboard","qty":1},{"id":2,"orderId":10,"product":"Mouse","qty":2}]

GET /api/orders/10/items/2
200 {"id":2,"orderId":10,"product":"Mouse","qty":2}

POST /api/orders/10/items  {"product":"Webcam","qty":1}
201 Created  Location: https://localhost:7xxx/api/orders/10/items/4
{"id":4,"orderId":10,"product":"Webcam","qty":1}

GET /api/items/count -> 200  4
GET /api/orders/abc/items -> 404 (int constraint fails)`,
      explanation: 'The controller template contains {orderId:int}, so every action receives orderId. Route names allow CreatedAtRoute to generate the Location header. A template starting with ~/ ignores the controller prefix.',
    },
    {
      title: 'Admin Area with its own controller, view and links',
      scenario: 'Separate the administration pages into Areas/Admin while keeping a normal HomeController.',
      steps: [
        'Open the RoutingDemo MVC project',
        'Right-click the project > Add > New Scaffolded Item > MVC Area > Add > Area name: Admin',
        'Visual Studio creates Areas/Admin/{Controllers,Data,Models,Views}',
        'Copy Views/_ViewStart.cshtml and Views/_ViewImports.cshtml into Areas/Admin/Views',
        'Add Areas/Admin/Controllers/DashboardController.cs and Areas/Admin/Views/Dashboard/Index.cshtml',
        'Add the area route to Program.cs BEFORE the default route; press F5 and open /Admin',
      ],
      code: `// Program.cs (add before the "default" route)
app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Dashboard}/{action=Index}/{id?}");

// Areas/Admin/Controllers/DashboardController.cs
using Microsoft.AspNetCore.Mvc;
namespace RoutingDemo.Areas.Admin.Controllers;

[Area("Admin")]
public class DashboardController : Controller
{
    public IActionResult Index()
    {
        ViewData["Users"] = 42;
        return View();      // Areas/Admin/Views/Dashboard/Index.cshtml
    }
}

// Areas/Admin/Views/Dashboard/Index.cshtml
@{
    ViewData["Title"] = "Admin Dashboard";
}
<h2>Admin Dashboard</h2>
<p>Registered users: @ViewData["Users"]</p>
<a asp-area="" asp-controller="Home" asp-action="Index">Back to site</a>

// Views/Shared/_Layout.cshtml (nav link into the area)
<a class="nav-link" asp-area="Admin" asp-controller="Dashboard" asp-action="Index">Admin</a>
<!-- renders href="/Admin" because Dashboard and Index are defaults -->

// Secure the whole area (optional)
// [Area("Admin"), Authorize(Roles = "Admin")] on each admin controller,
// or builder.Services.AddControllersWithViews(o =>
//     o.Conventions.Add(new AreaAuthorizationConvention("Admin", "AdminPolicy")));  // custom convention`,
      result: `/Admin                   -> Admin Dashboard, "Registered users: 42"
/Admin/Dashboard/Index   -> same page
Nav link renders         -> <a class="nav-link" href="/Admin">Admin</a>
"Back to site" renders   -> <a href="/">Back to site</a>`,
      explanation: '{area:exists} only matches area names that exist on some controller, so /Students still goes to the default route. Without asp-area="" in the back link, the ambient area value "Admin" would be reused and the link would point to /Admin/Home.',
    },
    {
      title: 'Console simulation: matching a conventional route template with defaults',
      scenario: 'See how {controller=Home}/{action=Index}/{id?} turns URLs into route values.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RouteTemplateDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `string[] template = { "controller=Home", "action=Index", "id?" };

string Match(string url)
{
    var segs = url.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
    if (segs.Length > template.Length) return "no match";
    var values = new List<string>();
    for (int i = 0; i < template.Length; i++)
    {
        string t = template[i];
        string name = t.Split('=')[0].TrimEnd('?');
        if (i < segs.Length) values.Add(name + "=" + segs[i]);
        else if (t.Contains('=')) values.Add(name + "=" + t.Split('=')[1]);
        // optional parameter (id?) with no value is simply omitted
    }
    return string.Join(", ", values);
}

foreach (var url in new[] { "/", "/Students", "/Students/Details/5", "/Admin/Users/Edit/7" })
    Console.WriteLine(url.PadRight(22) + "-> " + Match(url));`,
      csharp: {
        files: {
          'Program.cs': `string[] template = { "controller=Home", "action=Index", "id?" };

string Match(string url)
{
    var segs = url.Trim('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
    if (segs.Length > template.Length) return "no match";
    var values = new List<string>();
    for (int i = 0; i < template.Length; i++)
    {
        string t = template[i];
        string name = t.Split('=')[0].TrimEnd('?');
        if (i < segs.Length) values.Add(name + "=" + segs[i]);
        else if (t.Contains('=')) values.Add(name + "=" + t.Split('=')[1]);
        // optional parameter (id?) with no value is simply omitted
    }
    return string.Join(", ", values);
}

foreach (var url in new[] { "/", "/Students", "/Students/Details/5", "/Admin/Users/Edit/7" })
    Console.WriteLine(url.PadRight(22) + "-> " + Match(url));
`,
        },
        stdin: '',
      },
      result: `/                     -> controller=Home, action=Index
/Students             -> controller=Students, action=Index
/Students/Details/5   -> controller=Students, action=Details, id=5
/Admin/Users/Edit/7   -> no match`,
      explanation: 'Missing segments take their default values; the optional id is omitted when absent. A 4-segment URL has more segments than the template, so it does not match - which is why areas need their own {area}/... route.',
    },
  ],
  interview: [
    { q: 'What is the difference between conventional and attribute routing?', a: 'Conventional routes are templates defined centrally in Program.cs (MapControllerRoute) and apply to all controllers by naming convention. Attribute routes are defined on controllers/actions with [Route]/[HttpGet] and give each action an explicit URL. APIs with [ApiController] require attribute routing.', level: 'Easy' },
    { q: 'What does {id?} mean in a route template?', a: 'An optional route parameter; the URL matches with or without that segment.', level: 'Easy' },
    { q: 'Are conventional routes order-dependent?', a: 'Yes, they are evaluated in the order added, so specific routes must come before the generic default route. Attribute routes are ordered by precedence (literal > parameter > catch-all) and the Order property.', level: 'Medium' },
    { q: 'What happens if a route constraint fails?', a: 'That route does not match; if no other route matches, the result is 404. Constraints should not be used for validation.', level: 'Medium' },
    { q: 'What are route tokens?', a: '[controller], [action] and [area] placeholders in attribute routes that are replaced by the controller name (without "Controller"), action name and area name.', level: 'Easy' },
    { q: 'What is an Area and why use it?', a: 'A folder-based feature section (Areas/Admin) with its own controllers and views, used to organise large apps and allow duplicate controller names. Controllers are marked [Area("Admin")] and a route with {area:exists} is added.', level: 'Easy' },
    { q: 'What is an ambient route value?', a: 'A value from the current request (like area or controller) that link generation reuses if you do not specify it. That is why links out of an area need asp-area="".', level: 'Hard' },
    { q: 'How do you make an attribute route ignore the controller-level prefix?', a: 'Start the action template with / or ~/ e.g. [HttpGet("~/api/items/count")].', level: 'Medium' },
    { q: 'How do you return 201 with a Location header in a controller?', a: 'return CreatedAtAction(nameof(Get), new { id = x.Id }, x); or CreatedAtRoute("RouteName", values, x).', level: 'Easy' },
    { q: 'Output question: route "{controller=Home}/{action=Index}/{id?}". Which action does "/Products" call?', a: 'ProductsController.Index (action default Index, id not supplied).', level: 'Easy' },
    { q: 'Can one action have multiple routes?', a: 'Yes, stack several [Route]/[HttpGet] attributes, e.g. [HttpGet("")] and [HttpGet("list")].', level: 'Medium' },
  ],
  practice: [
    { task: 'Add a conventional route /products/{category}/{page:int?} mapped to ProductsController.ByCategory.', hint: 'defaults: new { controller = "Products", action = "ByCategory" }.', solution: 'app.MapControllerRoute("productsByCat", "products/{category:alpha}/{page:int?}", new { controller = "Products", action = "ByCategory" }); public IActionResult ByCategory(string category, int page = 1) => Content($"{category} page {page}");' },
    { task: 'Create a Web API StudentsController using [Route("api/v1/[controller]")] with GET all, GET by id (named route), POST returning CreatedAtRoute.', hint: 'Name = "GetStudent".', solution: '[HttpGet("{id:int}", Name = "GetStudent")] public ActionResult<Student> Get(int id) ...; [HttpPost] public IActionResult Post(Student s) { ...; return CreatedAtRoute("GetStudent", new { id = s.Id }, s); }' },
    { task: 'Create a Customer area with OrdersController and a view; add nav links to both Admin and Customer areas.', hint: 'Copy _ViewImports.cshtml so tag helpers work inside the area.', solution: 'Areas/Customer/Controllers/OrdersController.cs with [Area("Customer")]; view Areas/Customer/Views/Orders/Index.cshtml; link <a asp-area="Customer" asp-controller="Orders" asp-action="Index">My Orders</a>.' },
    { task: 'Protect every controller in the Admin area with the Admin role.', hint: 'Use a base controller.', solution: '[Area("Admin")] [Authorize(Roles = "Admin")] public abstract class AdminBaseController : Controller { } and make all admin controllers inherit it.' },
  ],
  quiz: [
    { question: 'Which call registers a conventional route?', options: ['app.MapControllers()', 'app.MapControllerRoute(...)', '[Route("...")]', 'app.UseEndpoints()'], answer: 1, explanation: 'MapControllerRoute registers a named conventional route template.' },
    { question: 'Which routing style is required by [ApiController]?', options: ['Conventional routing', 'Area routing', 'Attribute routing', 'Razor Pages routing'], answer: 2, explanation: '[ApiController] makes attribute routing mandatory.' },
    { question: 'In [Route("api/[controller]")] on OrdersController, what is the prefix?', options: ['api/orders', 'api/[controller]', 'api/OrdersController', 'orders'], answer: 0, explanation: 'The token is replaced by the controller name without the Controller suffix (case kept: api/Orders, matching is case-insensitive).' },
    { question: 'What does {area:exists} do in a route pattern?', options: ['Creates the area folder', 'Requires authentication', 'Matches only area names that exist in the app', 'Makes the area optional'], answer: 2, explanation: 'The exists constraint matches only known areas.' },
    { question: 'A link inside the Admin area must go to the root HomeController. What should you add?', options: ['asp-area="Admin"', 'asp-area=""', 'asp-route-id="0"', 'Nothing'], answer: 1, explanation: 'An empty area clears the ambient Admin value.' },
  ],
};
