export default {
  id: 'extra-43-view-components-and-tag-helpers',
  title: 'View Components and Custom Tag Helpers',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 43,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Build reusable UI pieces in ASP.NET Core MVC/Razor Pages: View Components (mini-controllers with their own logic and view, e.g. a shopping-cart badge or category menu) and custom Tag Helpers (server-side classes that turn HTML-like tags such as <email> or <alert type="success"> into real markup).',
  objectives: [
    'Explain the difference between partial views, view components and tag helpers',
    'Create a View Component with InvokeAsync, DI, parameters and a Default.cshtml view',
    'Invoke view components with @await Component.InvokeAsync and the <vc:...> tag helper syntax',
    'Write custom Tag Helpers by deriving from TagHelper, using HtmlTargetElement, attributes and TagHelperOutput',
    'Register tag helpers with @addTagHelper in _ViewImports.cshtml',
  ],
  theory: [
    {
      heading: 'Reusable UI options in Razor',
      content: 'Razor gives three ways to reuse UI. A partial view (_ProductCard.cshtml) is just markup rendered with a model you pass in; it has no logic of its own. A View Component is a class + view that can run its own logic (query the database, read the cart from session) and render a small piece of UI - think of it as a mini controller for one widget. A Tag Helper is a C# class that participates in rendering an HTML element, so designers write <email address="a@b.com"> and the server outputs <a href="mailto:a@b.com">a@b.com</a>. Analogy: partial view = photocopy of a form; view component = a small kiosk with its own staff; tag helper = a smart stamp that converts a short code into full markup.',
      points: [
        'Partial view: no own data access, model passed by the parent.',
        'View component: own logic + DI + async, called from layout/views, NOT reachable by URL.',
        'Tag helper: enhances or creates HTML elements; built-in ones include asp-for, asp-action, environment, cache, partial.',
      ],
    },
    {
      heading: 'Creating a View Component',
      content: 'A view component is a class whose name ends with ViewComponent (or has [ViewComponent]) and usually derives from ViewComponent. It exposes ONE method: InvokeAsync (returning Task<IViewComponentResult>) or Invoke. Constructor injection works like controllers. It returns View(model), Content("text") or new HtmlContentViewComponentResult(...). The default view is searched in: /Views/{Controller}/Components/{Name}/Default.cshtml, /Views/Shared/Components/{Name}/Default.cshtml (and /Pages/Shared/Components/{Name}/Default.cshtml for Razor Pages). {Name} is the class name without the ViewComponent suffix.',
      syntax: `public class CartSummaryViewComponent(ICartService cart) : ViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync(bool showTotal = true)
    {
        var summary = await cart.GetSummaryAsync(HttpContext.Session.Id);
        ViewData["ShowTotal"] = showTotal;
        return View(summary);           // Views/Shared/Components/CartSummary/Default.cshtml
    }
}`,
      points: [
        'View components do not take part in model binding; you pass arguments explicitly.',
        'They have access to HttpContext, User, ViewData, ViewContext, Url.',
        'You can return a named view: return View("Compact", model) -> Compact.cshtml.',
      ],
    },
    {
      heading: 'Invoking a View Component',
      content: 'From any view or layout call @await Component.InvokeAsync("CartSummary", new { showTotal = false }). Since ASP.NET Core 1.1 you can also use tag-helper syntax <vc:cart-summary show-total="false"></vc:cart-summary>; the class name and parameters are written in kebab-case and the assembly must be registered with @addTagHelper *, YourAssemblyName in _ViewImports.cshtml. From a controller you can return ViewComponent("CartSummary", new { showTotal = true }) - handy for AJAX refresh of a widget.',
      syntax: `@* _Layout.cshtml *@
@await Component.InvokeAsync("CategoryMenu", new { maxItems = 5 })

<vc:cart-summary show-total="true"></vc:cart-summary>

// Controller action used by AJAX to re-render just the widget
public IActionResult CartWidget() => ViewComponent("CartSummary", new { showTotal = true });`,
    },
    {
      heading: 'Creating a custom Tag Helper',
      content: 'Derive from TagHelper and override Process (or ProcessAsync). By convention, EmailTagHelper targets <email>. Public properties become attributes in kebab-case (MailTo -> mail-to). In Process you modify TagHelperOutput: TagName (change or set null to remove the wrapper), Attributes.SetAttribute(), Content.SetContent()/SetHtmlContent(), PreContent/PostContent, TagMode, or SuppressOutput(). Use [HtmlTargetElement("button", Attributes = "confirm")] to target existing elements that have a specific attribute. Use ProcessAsync with output.GetChildContentAsync() to read the inner HTML.',
      syntax: `[HtmlTargetElement("email", TagStructure = TagStructure.WithoutEndTag)]
public class EmailTagHelper : TagHelper
{
    public string Address { get; set; } = "";
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "a";
        output.TagMode = TagMode.StartTagAndEndTag;
        output.Attributes.SetAttribute("href", "mailto:" + Address);
        output.Content.SetContent(Address);      // HTML-encoded automatically
    }
}`,
      tip: 'SetContent encodes text (safe against XSS); SetHtmlContent writes raw HTML - only use it with trusted strings.',
    },
    {
      heading: 'Registering tag helpers and order of execution',
      content: '_ViewImports.cshtml controls which tag helpers are active: @addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers registers the built-ins, @addTagHelper *, MyWebApp registers all tag helpers in your project assembly (use the ASSEMBLY name, not the namespace). @removeTagHelper removes one, and the ! prefix opts a single element out (<!span>). When several tag helpers target the same element, the Order property decides who runs first (lower first). Tag helpers can also access ViewContext with [ViewContext][HtmlAttributeNotBound] public ViewContext ViewContext { get; set; } = default!;',
      syntax: `@* Views/_ViewImports.cshtml *@
@using MyWebApp
@using MyWebApp.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@addTagHelper *, MyWebApp`,
    },
    {
      heading: 'When to use which',
      content: 'Use a partial view when the parent already has the data. Use a view component when the widget needs its own data or logic and appears on many pages (menus, cart badge, "recent posts", login status). Use a tag helper when you want cleaner markup or to enforce consistent HTML across the app (alerts, badges, pagers, active nav links, confirm buttons). View components are testable (call InvokeAsync and inspect the result); tag helpers are testable by constructing TagHelperContext/TagHelperOutput.',
      points: [
        'Avoid Html.Action from old MVC 5 - view components replaced child actions.',
        'Keep database work in services injected into the view component, not in the .cshtml.',
        'Tag helpers run on the server; the browser receives plain HTML.',
      ],
    },
  ],
  examples: [
    {
      title: 'Category menu View Component with DI and parameters',
      scenario: 'An e-shop shows a category menu on every page. The data comes from a service; the layout should not know how.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > name ShopUi > Create',
        'Add folder Services with ICategoryService and CategoryService; register it in Program.cs',
        'Add folder ViewComponents and class CategoryMenuViewComponent.cs',
        'Create folder Views/Shared/Components/CategoryMenu and add Default.cshtml (Add > View > Razor View - Empty)',
        'Edit Views/Shared/_Layout.cshtml to invoke the component; press F5',
      ],
      code: `// Services/CategoryService.cs
namespace ShopUi.Services;
public record Category(int Id, string Name, int ProductCount);
public interface ICategoryService { Task<List<Category>> GetTopAsync(int max); }
public class CategoryService : ICategoryService
{
    private readonly List<Category> _data =
    [
        new(1, "Laptops", 12), new(2, "Phones", 30), new(3, "Cameras", 5),
        new(4, "Audio", 18), new(5, "Gaming", 9), new(6, "Printers", 2),
    ];
    public Task<List<Category>> GetTopAsync(int max) =>
        Task.FromResult(_data.OrderByDescending(c => c.ProductCount).Take(max).ToList());
}

// Program.cs (add before builder.Build())
builder.Services.AddScoped<ICategoryService, CategoryService>();

// ViewComponents/CategoryMenuViewComponent.cs
using Microsoft.AspNetCore.Mvc;
using ShopUi.Services;
namespace ShopUi.ViewComponents;
public class CategoryMenuViewComponent(ICategoryService service) : ViewComponent
{
    public async Task<IViewComponentResult> InvokeAsync(int maxItems = 5)
    {
        var categories = await service.GetTopAsync(maxItems);
        var current = HttpContext.Request.Query["category"].ToString();
        ViewData["Current"] = current;
        return View(categories);
    }
}

@* Views/Shared/Components/CategoryMenu/Default.cshtml *@
@model List<ShopUi.Services.Category>
<ul class="list-group">
@foreach (var c in Model)
{
    var active = ViewData["Current"]?.ToString() == c.Name ? "active" : "";
    <li class="list-group-item d-flex justify-content-between @active">
        <a asp-controller="Products" asp-action="Index" asp-route-category="@c.Name">@c.Name</a>
        <span class="badge bg-primary rounded-pill">@c.ProductCount</span>
    </li>
}
</ul>

@* Views/Shared/_Layout.cshtml (inside the main container) *@
<div class="row">
    <aside class="col-md-3">
        @await Component.InvokeAsync("CategoryMenu", new { maxItems = 3 })
        @* same thing with tag-helper syntax (needs @addTagHelper *, ShopUi): *@
        @* <vc:category-menu max-items="3"></vc:category-menu> *@
    </aside>
    <main class="col-md-9">@RenderBody()</main>
</div>`,
      result: `Rendered HTML (left column on every page):
<ul class="list-group">
  <li class="list-group-item ..."><a href="/Products?category=Phones">Phones</a> <span class="badge ...">30</span></li>
  <li class="list-group-item ..."><a href="/Products?category=Audio">Audio</a> <span class="badge ...">18</span></li>
  <li class="list-group-item ..."><a href="/Products?category=Laptops">Laptops</a> <span class="badge ...">12</span></li>
</ul>
On /Products?category=Audio the Audio item also has the "active" class.`,
      explanation: 'The layout only says "show the category menu with 3 items". The view component gets the service from DI, reads the query string from HttpContext and renders its own Default.cshtml. Changing the data source never touches the layout.',
    },
    {
      title: 'Custom Tag Helpers: <email>, <alert> and a confirm attribute',
      scenario: 'Give the team short, consistent markup for email links, Bootstrap alerts and delete confirmations.',
      steps: [
        'In the ShopUi project add folder TagHelpers',
        'Add EmailTagHelper.cs, AlertTagHelper.cs and ConfirmTagHelper.cs with the code below',
        'Open Views/_ViewImports.cshtml and add: @addTagHelper *, ShopUi',
        'Use the tags in Views/Home/Index.cshtml; press F5 and View Page Source (Ctrl+U in the browser)',
      ],
      code: `// TagHelpers/EmailTagHelper.cs
using Microsoft.AspNetCore.Razor.TagHelpers;
namespace ShopUi.TagHelpers;
[HtmlTargetElement("email", TagStructure = TagStructure.WithoutEndTag)]
public class EmailTagHelper : TagHelper
{
    public string Address { get; set; } = "";
    public string? Subject { get; set; }
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "a";
        output.TagMode = TagMode.StartTagAndEndTag;
        var href = "mailto:" + Address + (Subject is null ? "" : "?subject=" + Uri.EscapeDataString(Subject));
        output.Attributes.SetAttribute("href", href);
        output.Content.SetContent(Address);
    }
}

// TagHelpers/AlertTagHelper.cs
using Microsoft.AspNetCore.Razor.TagHelpers;
namespace ShopUi.TagHelpers;
public class AlertTagHelper : TagHelper          // targets <alert>
{
    public string Type { get; set; } = "info";   // attribute: type
    public bool Dismissible { get; set; }        // attribute: dismissible
    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        var inner = (await output.GetChildContentAsync()).GetContent();
        output.TagName = "div";
        output.Attributes.SetAttribute("class", $"alert alert-{Type}" + (Dismissible ? " alert-dismissible fade show" : ""));
        output.Attributes.SetAttribute("role", "alert");
        output.Content.SetHtmlContent(inner);
        if (Dismissible)
            output.PostContent.SetHtmlContent("<button type=\\"button\\" class=\\"btn-close\\" data-bs-dismiss=\\"alert\\"></button>");
    }
}

// TagHelpers/ConfirmTagHelper.cs - adds onclick to any <button confirm="...">
using Microsoft.AspNetCore.Razor.TagHelpers;
namespace ShopUi.TagHelpers;
[HtmlTargetElement("button", Attributes = "confirm")]
[HtmlTargetElement("a", Attributes = "confirm")]
public class ConfirmTagHelper : TagHelper
{
    public string Confirm { get; set; } = "Are you sure?";
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        var msg = Confirm.Replace("'", "\\\\'");
        output.Attributes.SetAttribute("onclick", $"return confirm('{msg}');");
    }
}

@* Views/_ViewImports.cshtml *@
@using ShopUi
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
@addTagHelper *, ShopUi

@* Views/Home/Index.cshtml *@
<p>Contact: <email address="support@shop.com" subject="Order help" /></p>
<alert type="success" dismissible="true"><strong>Saved!</strong> Product updated.</alert>
<form method="post" asp-controller="Products" asp-action="Delete" asp-route-id="5">
    <button class="btn btn-danger" confirm="Delete product 5?">Delete</button>
</form>`,
      result: `<p>Contact: <a href="mailto:support@shop.com?subject=Order%20help">support@shop.com</a></p>
<div class="alert alert-success alert-dismissible fade show" role="alert"><strong>Saved!</strong> Product updated.<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>
<form method="post" action="/Products/Delete/5">
    <button class="btn btn-danger" onclick="return confirm('Delete product 5?');">Delete</button>
    <input name="__RequestVerificationToken" type="hidden" value="..." />
</form>`,
      explanation: 'EmailTagHelper replaces the element; AlertTagHelper reads its child content and wraps it; ConfirmTagHelper only adds an attribute to existing <button>/<a> elements that have confirm. The confirm attribute itself is removed from output because it is bound to a property. The form tag helper adds the antiforgery token automatically.',
    },
    {
      title: 'Refreshing a View Component with AJAX (cart badge)',
      scenario: 'After "Add to cart" the navbar badge should update without reloading the page.',
      steps: [
        'In ShopUi add CartSummaryViewComponent and its Default.cshtml',
        'Enable session: builder.Services.AddDistributedMemoryCache(); builder.Services.AddSession(); app.UseSession();',
        'Add CartController with Add and Widget actions',
        'Place <div id="cart-badge"> in _Layout.cshtml and add the JavaScript; press F5',
      ],
      code: `// ViewComponents/CartSummaryViewComponent.cs
using Microsoft.AspNetCore.Mvc;
namespace ShopUi.ViewComponents;
public class CartSummaryViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        int count = HttpContext.Session.GetInt32("CartCount") ?? 0;
        return View(count);
    }
}

@* Views/Shared/Components/CartSummary/Default.cshtml *@
@model int
<a class="btn btn-outline-primary" asp-controller="Cart" asp-action="Index">
    Cart <span class="badge bg-danger">@Model</span>
</a>

// Controllers/CartController.cs
using Microsoft.AspNetCore.Mvc;
public class CartController : Controller
{
    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Add(int productId)
    {
        int count = (HttpContext.Session.GetInt32("CartCount") ?? 0) + 1;
        HttpContext.Session.SetInt32("CartCount", count);
        return ViewComponent("CartSummary");      // returns only the widget HTML
    }
    public IActionResult Index() => View();
}

@* _Layout.cshtml navbar *@
<div id="cart-badge"><vc:cart-summary></vc:cart-summary></div>

@* Product list button *@
<form id="addForm" asp-controller="Cart" asp-action="Add" method="post">
    <input type="hidden" name="productId" value="5" />
    <button type="submit" class="btn btn-success">Add to cart</button>
</form>
<script>
document.getElementById('addForm').addEventListener('submit', async e => {
    e.preventDefault();
    const res = await fetch(e.target.action, { method: 'POST', body: new FormData(e.target) });
    document.getElementById('cart-badge').innerHTML = await res.text();
});
</script>`,
      result: `Page load:        Cart [0]
Click "Add to cart" -> POST /Cart/Add returns:
<a class="btn btn-outline-primary" href="/Cart">Cart <span class="badge bg-danger">1</span></a>
Badge now shows Cart [1]; clicking again shows Cart [2] - no full page reload.`,
      explanation: 'Returning ViewComponent("CartSummary") from a controller renders exactly the same markup the layout uses, so the AJAX response can replace the badge. FormData includes the hidden antiforgery token generated by the form tag helper, satisfying [ValidateAntiForgeryToken].',
    },
    {
      title: 'Console simulation: what a tag helper does to an element',
      scenario: 'Model TagHelperOutput in plain C# to understand TagName, attributes and content changes.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it TagHelperSim',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `var alert = new Element("alert", new() { ["type"] = "warning" }, "Low stock!");
Console.WriteLine("Before: " + alert);
AlertHelper(alert);
Console.WriteLine("After:  " + alert);

var email = new Element("email", new() { ["address"] = "hr@abc.com" }, "");
EmailHelper(email);
Console.WriteLine("Email:  " + email);

static void AlertHelper(Element e)
{
    string type = e.Attributes["type"];
    e.Attributes.Remove("type");             // bound attribute is not rendered
    e.TagName = "div";
    e.Attributes["class"] = "alert alert-" + type;
    e.Attributes["role"] = "alert";
}

static void EmailHelper(Element e)
{
    string address = e.Attributes["address"];
    e.Attributes.Remove("address");
    e.TagName = "a";
    e.Attributes["href"] = "mailto:" + address;
    e.Content = address;
}

class Element(string tag, Dictionary<string, string> attrs, string content)
{
    public string TagName { get; set; } = tag;
    public Dictionary<string, string> Attributes { get; } = attrs;
    public string Content { get; set; } = content;
    public override string ToString()
    {
        var a = string.Concat(Attributes.Select(kv => " " + kv.Key + "=\\"" + kv.Value + "\\""));
        return "<" + TagName + a + ">" + Content + "</" + TagName + ">";
    }
}`,
      csharp: {
        files: {
          'Program.cs': `var alert = new Element("alert", new() { ["type"] = "warning" }, "Low stock!");
Console.WriteLine("Before: " + alert);
AlertHelper(alert);
Console.WriteLine("After:  " + alert);

var email = new Element("email", new() { ["address"] = "hr@abc.com" }, "");
EmailHelper(email);
Console.WriteLine("Email:  " + email);

static void AlertHelper(Element e)
{
    string type = e.Attributes["type"];
    e.Attributes.Remove("type");             // bound attribute is not rendered
    e.TagName = "div";
    e.Attributes["class"] = "alert alert-" + type;
    e.Attributes["role"] = "alert";
}

static void EmailHelper(Element e)
{
    string address = e.Attributes["address"];
    e.Attributes.Remove("address");
    e.TagName = "a";
    e.Attributes["href"] = "mailto:" + address;
    e.Content = address;
}

class Element(string tag, Dictionary<string, string> attrs, string content)
{
    public string TagName { get; set; } = tag;
    public Dictionary<string, string> Attributes { get; } = attrs;
    public string Content { get; set; } = content;
    public override string ToString()
    {
        var a = string.Concat(Attributes.Select(kv => " " + kv.Key + "=\\"" + kv.Value + "\\""));
        return "<" + TagName + a + ">" + Content + "</" + TagName + ">";
    }
}
`,
        },
        stdin: '',
      },
      result: `Before: <alert type="warning">Low stock!</alert>
After:  <div class="alert alert-warning" role="alert">Low stock!</div>
Email:  <a href="mailto:hr@abc.com">hr@abc.com</a>`,
      explanation: 'A real tag helper receives the element as TagHelperOutput, removes the attributes bound to its properties, may rename the tag and add attributes/content. The browser only ever sees the final HTML. (In this demo each removed attribute slot is reused by the next added one, so the printed order is deterministic; real Razor keeps an ordered TagHelperAttributeList.)',
    },
  ],
  interview: [
    { q: 'What is a View Component?', a: 'A reusable UI unit made of a class (deriving from ViewComponent, with Invoke/InvokeAsync) and a Razor view. It can run logic and use DI, and is rendered from views/layouts - like a mini controller for a widget. It is not reachable directly by URL.', level: 'Easy' },
    { q: 'How is a View Component different from a partial view?', a: 'A partial view only renders markup with data the parent passes. A view component has its own logic, DI services and async data access, so the parent does not need to supply the data.', level: 'Easy' },
    { q: 'Where does ASP.NET Core look for a view component view?', a: '/Views/{Controller}/Components/{Name}/{ViewName}.cshtml, then /Views/Shared/Components/{Name}/{ViewName}.cshtml (and /Pages/Shared/Components/... for Razor Pages). The default view name is Default.', level: 'Medium' },
    { q: 'Show two ways to invoke a view component.', a: '@await Component.InvokeAsync("CartSummary", new { showTotal = true }) and <vc:cart-summary show-total="true"></vc:cart-summary> (requires @addTagHelper for the assembly).', level: 'Easy' },
    { q: 'What replaced Html.Action / child actions from ASP.NET MVC 5?', a: 'View components.', level: 'Easy' },
    { q: 'What is a Tag Helper?', a: 'A server-side C# class that participates in rendering HTML elements in Razor, targeting elements by name/attributes and changing the TagHelperOutput (tag name, attributes, content).', level: 'Easy' },
    { q: 'How are tag helper property names mapped to attributes?', a: 'PascalCase properties become kebab-case attributes: MaxItems -> max-items. Override with [HtmlAttributeName("...")].', level: 'Medium' },
    { q: 'Difference between Content.SetContent and SetHtmlContent?', a: 'SetContent HTML-encodes the string (safe); SetHtmlContent writes raw HTML without encoding (use only with trusted content).', level: 'Medium' },
    { q: 'How do you register tag helpers from your project?', a: 'In _ViewImports.cshtml: @addTagHelper *, MyAssemblyName (the assembly name, not the namespace).', level: 'Easy' },
    { q: 'How can a controller return just the HTML of a view component?', a: 'return ViewComponent("Name", new { args }); - useful for AJAX partial refresh.', level: 'Medium' },
    { q: 'How do you read the inner content of a tag in a tag helper?', a: 'Override ProcessAsync and call (await output.GetChildContentAsync()).GetContent().', level: 'Hard' },
    { q: 'How do you remove an element completely from output?', a: 'Call output.SuppressOutput() (e.g. a tag helper that hides content for non-admin users).', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a LoginStatus view component that shows "Hello, {name} | Logout" for signed-in users and "Login | Register" otherwise.', hint: 'Use User.Identity?.IsAuthenticated inside InvokeAsync.', solution: 'public class LoginStatusViewComponent : ViewComponent { public IViewComponentResult Invoke() => View(User.Identity?.IsAuthenticated == true ? "LoggedIn" : "Default", User.Identity?.Name); } with LoggedIn.cshtml and Default.cshtml in Views/Shared/Components/LoginStatus/.' },
    { task: 'Write a <badge count="5" color="danger"> tag helper that renders <span class="badge bg-danger">5</span> and nothing when count is 0.', hint: 'SuppressOutput when Count == 0.', solution: 'public class BadgeTagHelper : TagHelper { public int Count { get; set; } public string Color { get; set; } = "primary"; public override void Process(TagHelperContext c, TagHelperOutput o) { if (Count == 0) { o.SuppressOutput(); return; } o.TagName = "span"; o.Attributes.SetAttribute("class", $"badge bg-{Color}"); o.Content.SetContent(Count.ToString()); } }' },
    { task: 'Create an "active-nav" tag helper: <a asp-controller="Home" asp-action="Index" active-nav> adds class "active" when it matches the current route.', hint: 'Inject ViewContext with [ViewContext][HtmlAttributeNotBound].', solution: '[HtmlTargetElement("a", Attributes = "active-nav")] public class ActiveNavTagHelper : TagHelper { [ViewContext, HtmlAttributeNotBound] public ViewContext ViewContext { get; set; } = default!; [HtmlAttributeName("asp-controller")] public string? Controller { get; set; } public override void Process(TagHelperContext c, TagHelperOutput o) { o.Attributes.RemoveAll("active-nav"); if (string.Equals(ViewContext.RouteData.Values["controller"]?.ToString(), Controller, StringComparison.OrdinalIgnoreCase)) o.AddClass("active", System.Text.Encodings.Web.HtmlEncoder.Default); } } The built-in anchor tag helper still generates the href.' },
    { task: 'Build a RecentProducts view component that takes count and shows the newest products from EF Core.', hint: 'Inject AppDbContext; use AsNoTracking and OrderByDescending(p => p.CreatedOn).', solution: 'public class RecentProductsViewComponent(AppDbContext db) : ViewComponent { public async Task<IViewComponentResult> InvokeAsync(int count = 4) => View(await db.Products.AsNoTracking().OrderByDescending(p => p.CreatedOn).Take(count).ToListAsync()); }' },
  ],
  quiz: [
    { question: 'What is the default view name for a view component?', options: ['Index.cshtml', 'Default.cshtml', '_Component.cshtml', 'Invoke.cshtml'], answer: 1, explanation: 'View() without a name looks for Default.cshtml.' },
    { question: 'Which method does a view component implement?', options: ['Execute', 'Render', 'InvokeAsync or Invoke', 'OnGet'], answer: 2, explanation: 'View components expose Invoke or InvokeAsync.' },
    { question: 'Which class do custom tag helpers derive from?', options: ['TagHelper', 'ViewComponent', 'Controller', 'HtmlHelper'], answer: 0, explanation: 'Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.' },
    { question: 'A property named MaxItems on a tag helper maps to which attribute?', options: ['MaxItems', 'maxItems', 'max_items', 'max-items'], answer: 3, explanation: 'Properties are mapped to kebab-case attributes.' },
    { question: 'Where do you put @addTagHelper *, MyApp so all views can use your tag helpers?', options: ['Program.cs', 'appsettings.json', '_ViewImports.cshtml', '_Layout.cshtml'], answer: 2, explanation: '_ViewImports.cshtml applies directives to all views in its folder and below.' },
  ],
};
