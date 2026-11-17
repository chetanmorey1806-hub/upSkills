export default {
  id: 'extra-46-localization',
  title: 'Localization (Globalization and Multi-language Apps)',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 46,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Build ASP.NET Core MVC apps and Web APIs that speak the user\'s language: Culture vs UICulture, .resx resource files, IStringLocalizer, IViewLocalizer, localized validation messages, RequestLocalizationMiddleware with query-string, cookie and Accept-Language providers, and culture-aware formatting of dates and numbers.',
  objectives: [
    'Explain globalization, localization, Culture and UICulture with real examples',
    'Create .resx resource files in Visual Studio and read them with IStringLocalizer / IViewLocalizer',
    'Configure RequestLocalizationOptions and understand the provider order (query string, cookie, Accept-Language)',
    'Localize DataAnnotations validation messages and build a language switcher',
    'Format dates, numbers and currency correctly per culture',
  ],
  theory: [
    {
      heading: 'Globalization, localization, Culture and UICulture',
      content: 'Globalization (g11n) is designing the app so it CAN support many languages and regions (no hard-coded text, culture-aware formatting). Localization (l10n) is actually translating it for a specific culture. A culture name has a language and an optional region: "fr" (French), "fr-FR" (French in France), "fr-CA" (French in Canada), "hi-IN" (Hindi in India). .NET has TWO current cultures per thread: CultureInfo.CurrentCulture controls FORMATTING (dates, numbers, currency), CultureInfo.CurrentUICulture controls which TRANSLATED TEXT (resources) is shown.',
      points: [
        'Analogy: UICulture is the language of the menu card; Culture is how prices and dates are written on it.',
        'en-US writes 11/17/2026 and 1,234.50; de-DE writes 17.11.2026 and 1.234,50; en-IN groups as 12,34,567.89.',
        'Resource fallback: fr-CA -> fr -> neutral/default resource. Provide at least the neutral language file.',
        'Store dates in UTC and numbers as numbers in the database; format them only when displaying.',
      ],
    },
    {
      heading: 'Resource files (.resx) and IStringLocalizer',
      content: 'A .resx file is an XML file of name/value pairs. In Visual Studio: right-click the Resources folder > Add > New Item > Resources File. The file name decides which class and culture it belongs to: Resources/Controllers/ProductsController.fr.resx is used by IStringLocalizer<ProductsController> for French. A popular approach is ONE shared file: create an empty class SharedResource and files Resources/SharedResource.resx (default), SharedResource.fr.resx, SharedResource.hi.resx. Register with AddLocalization(o => o.ResourcesPath = "Resources") and inject IStringLocalizer<SharedResource>.',
      syntax: `// Resources/SharedResource.fr.resx  (designer shows a Name / Value grid)
<data name="Welcome" xml:space="preserve"><value>Bienvenue</value></data>
<data name="ProductNotFound" xml:space="preserve"><value>Produit {0} introuvable</value></data>

// usage
public class ProductsController(IStringLocalizer<SharedResource> localizer) : ControllerBase
{
    public IActionResult Get(int id) => NotFound(localizer["ProductNotFound", id].Value);
}`,
      points: [
        'localizer["Key"] returns a LocalizedString; if the key is missing it returns the key itself and ResourceNotFound = true (no exception).',
        'localizer["Key", arg1, arg2] fills {0}, {1} placeholders using string.Format.',
        'IHtmlLocalizer encodes arguments but not the resource text (for resources that contain HTML).',
        'For SharedResource put the class in the project ROOT namespace so the resource names match.',
      ],
    },
    {
      heading: 'RequestLocalizationMiddleware and culture providers',
      content: 'app.UseRequestLocalization(options) decides the culture of EVERY request and sets CurrentCulture/CurrentUICulture. It asks providers in order and uses the first supported culture: 1) QueryStringRequestCultureProvider (?culture=fr-FR&ui-culture=fr-FR), 2) CookieRequestCultureProvider (cookie .AspNetCore.Culture with value c=fr-FR|uic=fr-FR), 3) AcceptLanguageHeaderRequestCultureProvider (browser header Accept-Language: fr-FR,fr;q=0.9,en;q=0.8). If none match, DefaultRequestCulture is used.',
      syntax: `string[] supported = ["en-US", "fr-FR", "hi-IN"];
var locOptions = new RequestLocalizationOptions()
    .SetDefaultCulture(supported[0])
    .AddSupportedCultures(supported)
    .AddSupportedUICultures(supported);
app.UseRequestLocalization(locOptions);   // early in the pipeline, before MapControllers`,
      tip: 'Only cultures listed in SupportedCultures are accepted. This protects you from users sending random culture names.',
    },
    {
      heading: 'Localizing MVC views and validation messages',
      content: 'AddViewLocalization() lets views use @inject IViewLocalizer Localizer and @Localizer["Welcome"]; resources for Views/Home/Index.cshtml live in Resources/Views/Home/Index.fr.resx. AddDataAnnotationsLocalization() translates ErrorMessage values of [Required], [StringLength], [Display(Name = ...)] using the ErrorMessage text as the resource KEY. A language switcher is a small form that writes the culture cookie with CookieRequestCultureProvider.MakeCookieValue and redirects back.',
      syntax: `builder.Services.AddControllersWithViews()
    .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
    .AddDataAnnotationsLocalization(o =>
        o.DataAnnotationLocalizerProvider = (type, factory) => factory.Create(typeof(SharedResource)));

public class RegisterVm
{
    [Required(ErrorMessage = "NameRequired")]
    [Display(Name = "FullName")]
    public string Name { get; set; } = "";
}`,
    },
    {
      heading: 'Culture-aware formatting and common mistakes',
      content: 'ToString("N2"), ToString("d"), string.Format and decimal.Parse all use CurrentCulture. That is great for showing values to users but dangerous for machine data: parsing "10.5" with de-DE gives 105! Use CultureInfo.InvariantCulture for files, logs, JSON, URLs and database scripts. System.Text.Json always uses invariant formatting, so APIs should send numbers/dates in JSON and let the frontend (React Intl / toLocaleString) format them.',
      points: [
        'decimal.Parse("10.5", CultureInfo.InvariantCulture) is safe; decimal.Parse("10.5") depends on the server culture.',
        'Do not show money with "C" format when the currency is fixed (an INR price shown with de-DE "C" becomes Euro!). Store the currency code separately.',
        'Docker images with InvariantGlobalization=true have no culture data; set DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false and install ICU when you need localization.',
        'Right-to-left languages (ar, he) also need dir="rtl" in the HTML layout.',
      ],
    },
  ],
  examples: [
    {
      title: 'Localized MVC site with shared resources, view localization and a language switcher',
      scenario: 'A college website must show its home page and registration form in English, French and Hindi. The user chooses the language from a dropdown that is remembered in a cookie.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller); name LocalizationDemo; .NET 8/10 > Create',
        'Right-click project > Add > New Folder "Resources"; add class SharedResource.cs in the project root (empty class)',
        'Right-click Resources > Add > New Item > Resources File: SharedResource.resx, SharedResource.fr.resx, SharedResource.hi.resx; type the Name/Value rows shown below',
        'Update Program.cs, HomeController, Views/Home/Index.cshtml and add Views/Shared/_LanguageSwitcher.cshtml (included in _Layout with <partial name="_LanguageSwitcher" />)',
        'Press F5, pick "Francais" in the dropdown, and submit the empty registration form to see French validation messages',
      ],
      code: `// SharedResource.cs (root namespace, empty marker class)
namespace LocalizationDemo;
public class SharedResource { }

// Resource rows (Name = Value)
// SharedResource.resx    : Welcome = Welcome to City College | NameRequired = Name is required | FullName = Full name | Register = Register
// SharedResource.fr.resx : Welcome = Bienvenue au City College | NameRequired = Le nom est obligatoire | FullName = Nom complet | Register = S'inscrire
// SharedResource.hi.resx : Welcome = City College mein aapka swagat hai | NameRequired = Naam zaroori hai | FullName = Poora naam | Register = Panjikaran

// Models/RegisterVm.cs
using System.ComponentModel.DataAnnotations;
namespace LocalizationDemo.Models;
public class RegisterVm
{
    [Required(ErrorMessage = "NameRequired")]
    [Display(Name = "FullName")]
    public string Name { get; set; } = "";
}

// Program.cs
using LocalizationDemo;
using Microsoft.AspNetCore.Mvc.Razor;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddLocalization(o => o.ResourcesPath = "Resources");
builder.Services.AddControllersWithViews()
    .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
    .AddDataAnnotationsLocalization(o =>
        o.DataAnnotationLocalizerProvider = (type, factory) => factory.Create(typeof(SharedResource)));

string[] supported = ["en-US", "fr-FR", "hi-IN"];
var locOptions = new RequestLocalizationOptions()
    .SetDefaultCulture(supported[0])
    .AddSupportedCultures(supported)
    .AddSupportedUICultures(supported);

var app = builder.Build();
app.UseRequestLocalization(locOptions);
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
app.Run();

// Controllers/HomeController.cs
using LocalizationDemo.Models;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
namespace LocalizationDemo.Controllers;
public class HomeController : Controller
{
    public IActionResult Index() => View(new RegisterVm());

    [HttpPost]
    public IActionResult Index(RegisterVm vm) => ModelState.IsValid ? RedirectToAction(nameof(Index)) : View(vm);

    [HttpPost]
    public IActionResult SetLanguage(string culture, string returnUrl)
    {
        Response.Cookies.Append(
            CookieRequestCultureProvider.DefaultCookieName,
            CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
            new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1), IsEssential = true });
        return LocalRedirect(returnUrl);
    }
}

@* Views/Shared/_LanguageSwitcher.cshtml *@
@using Microsoft.AspNetCore.Localization
@{
    var current = Context.Features.Get<IRequestCultureFeature>()!.RequestCulture.UICulture.Name;
    var returnUrl = string.IsNullOrEmpty(Context.Request.Path) ? "~/" : "~" + Context.Request.Path.Value;
}
<form asp-controller="Home" asp-action="SetLanguage" asp-route-returnUrl="@returnUrl" method="post">
    <select name="culture" onchange="this.form.submit()">
        <option value="en-US" selected="@(current == "en-US")">English</option>
        <option value="fr-FR" selected="@(current == "fr-FR")">Francais</option>
        <option value="hi-IN" selected="@(current == "hi-IN")">Hindi</option>
    </select>
</form>

@* Views/Home/Index.cshtml *@
@model LocalizationDemo.Models.RegisterVm
@using Microsoft.Extensions.Localization
@inject IStringLocalizer<LocalizationDemo.SharedResource> L
<h1>@L["Welcome"]</h1>
<p>@DateTime.Today.ToString("D")</p>
<form asp-action="Index" method="post">
    <label asp-for="Name"></label>
    <input asp-for="Name" />
    <span asp-validation-for="Name" class="text-danger"></span>
    <button type="submit">@L["Register"]</button>
</form>`,
      result: `First visit (browser Accept-Language: en-US):
  Welcome to City College
  Tuesday, November 17, 2026
  Full name [        ]  [Register]

After choosing "Francais" (cookie .AspNetCore.Culture = c=fr-FR|uic=fr-FR):
  Bienvenue au City College
  mardi 17 novembre 2026
  Nom complet [        ]  [S'inscrire]
  Submit empty form -> "Le nom est obligatoire"

https://localhost:7123/?culture=hi-IN&ui-culture=hi-IN
  City College mein aapka swagat hai
  Poora naam ... -> "Naam zaroori hai"`,
      explanation: 'RequestLocalizationMiddleware reads the cookie (written by SetLanguage) and sets both cultures for the request. IStringLocalizer<SharedResource> looks up SharedResource.fr.resx (fr-FR falls back to fr). The [Required] ErrorMessage "NameRequired" and [Display] name "FullName" are used as KEYS thanks to AddDataAnnotationsLocalization. DateTime.Today.ToString("D") is formatted by CurrentCulture, so the date text depends on the day you run it. The query string overrides the cookie because its provider runs first.',
    },
    {
      title: 'Localized Web API error messages using Accept-Language',
      scenario: 'A mobile app sends Accept-Language. The Product API must return its error messages in the same language.',
      steps: [
        'File > New > Project > ASP.NET Core Web API; name LocalizedApi; Use controllers ticked > Create',
        'Add SharedResource.cs and Resources/SharedResource.resx + SharedResource.fr.resx with the rows ProductNotFound and PriceInvalid',
        'Replace Program.cs and add Controllers/ProductsController.cs',
        'Press F5; in Postman add header Accept-Language: fr-FR and call GET /api/products/99',
      ],
      code: `// Resource rows
// SharedResource.resx    : ProductNotFound = Product {0} was not found. | PriceInvalid = Price must be between {0} and {1}.
// SharedResource.fr.resx : ProductNotFound = Le produit {0} est introuvable. | PriceInvalid = Le prix doit etre compris entre {0} et {1}.

// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddLocalization(o => o.ResourcesPath = "Resources");
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseRequestLocalization(o =>
{
    string[] cultures = ["en-US", "fr-FR"];
    o.SetDefaultCulture("en-US").AddSupportedCultures(cultures).AddSupportedUICultures(cultures);
    o.ApplyCurrentCultureToResponseHeaders = true;   // adds Content-Language header
});
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapControllers();
app.Run();

// Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
namespace LocalizedApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IStringLocalizer<SharedResource> localizer) : ControllerBase
{
    [HttpGet("{id:int}")]
    public IActionResult Get(int id) =>
        id == 1 ? Ok(new { id = 1, name = "Pen", price = 10.5m })
                : NotFound(new { message = localizer["ProductNotFound", id].Value });

    [HttpPost]
    public IActionResult Create(ProductDto dto)
    {
        if (dto.Price < 1 || dto.Price > 100000)
            return BadRequest(new { message = localizer["PriceInvalid", 1, 100000].Value });
        return Created($"/api/products/{2}", dto);
    }
}
public record ProductDto(string Name, decimal Price);`,
      result: `GET /api/products/99          (no Accept-Language)
404  Content-Language: en-US
{"message":"Product 99 was not found."}

GET /api/products/99          Accept-Language: fr-FR,fr;q=0.9
404  Content-Language: fr-FR
{"message":"Le produit 99 est introuvable."}

GET /api/products/99?culture=fr-FR      (query string also works)
{"message":"Le produit 99 est introuvable."}

POST /api/products   Accept-Language: fr-FR   {"name":"Pen","price":0}
400 {"message":"Le prix doit etre compris entre 1 et 100000."}

GET /api/products/1           Accept-Language: fr-FR
200 {"id":1,"name":"Pen","price":10.5}`,
      explanation: 'The localizer chooses the resource file from CurrentUICulture, which the middleware set from the Accept-Language header. Placeholders {0} and {1} are filled from the extra indexer arguments. Notice the JSON price stays 10.5 in French: System.Text.Json always uses invariant formatting, which is exactly what API clients need.',
    },
    {
      title: 'Console simulation: resource lookup with culture fallback',
      scenario: 'Understand what IStringLocalizer does when a translation is missing: it walks fr-CA -> fr -> default and finally returns the key name.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ResourceFallbackDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

// "" = default (neutral) .resx, "fr" = .fr.resx, "fr-CA" = .fr-CA.resx ...
var resources = new Dictionary<string, Dictionary<string, string>>
{
    [""] = new() { ["Welcome"] = "Welcome", ["ProductNotFound"] = "Product {0} was not found", ["Save"] = "Save" },
    ["fr"] = new() { ["Welcome"] = "Bienvenue", ["ProductNotFound"] = "Produit {0} introuvable" },
    ["fr-CA"] = new() { ["Welcome"] = "Bienvenue chez nous" },
    ["hi"] = new() { ["Welcome"] = "Swagat hai" }
};

string Localize(string culture, string key, params object[] args)
{
    string current = culture;
    while (true)
    {
        if (resources.TryGetValue(current, out var table) && table.TryGetValue(key, out var text))
            return string.Format(text, args) + "  [from " + (current == "" ? "default" : current) + "]";
        if (current == "")
            return key + "  [missing, key returned]";
        current = current.Contains('-') ? current.Substring(0, current.IndexOf('-')) : "";
    }
}

Console.WriteLine("fr-CA Welcome         -> " + Localize("fr-CA", "Welcome"));
Console.WriteLine("fr-CA ProductNotFound -> " + Localize("fr-CA", "ProductNotFound", 99));
Console.WriteLine("fr-CA Save            -> " + Localize("fr-CA", "Save"));
Console.WriteLine("hi-IN Welcome         -> " + Localize("hi-IN", "Welcome"));
Console.WriteLine("de-DE ProductNotFound -> " + Localize("de-DE", "ProductNotFound", 5));
Console.WriteLine("fr    Logout          -> " + Localize("fr", "Logout"));`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

// "" = default (neutral) .resx, "fr" = .fr.resx, "fr-CA" = .fr-CA.resx ...
var resources = new Dictionary<string, Dictionary<string, string>>
{
    [""] = new() { ["Welcome"] = "Welcome", ["ProductNotFound"] = "Product {0} was not found", ["Save"] = "Save" },
    ["fr"] = new() { ["Welcome"] = "Bienvenue", ["ProductNotFound"] = "Produit {0} introuvable" },
    ["fr-CA"] = new() { ["Welcome"] = "Bienvenue chez nous" },
    ["hi"] = new() { ["Welcome"] = "Swagat hai" }
};

string Localize(string culture, string key, params object[] args)
{
    string current = culture;
    while (true)
    {
        if (resources.TryGetValue(current, out var table) && table.TryGetValue(key, out var text))
            return string.Format(text, args) + "  [from " + (current == "" ? "default" : current) + "]";
        if (current == "")
            return key + "  [missing, key returned]";
        current = current.Contains('-') ? current.Substring(0, current.IndexOf('-')) : "";
    }
}

Console.WriteLine("fr-CA Welcome         -> " + Localize("fr-CA", "Welcome"));
Console.WriteLine("fr-CA ProductNotFound -> " + Localize("fr-CA", "ProductNotFound", 99));
Console.WriteLine("fr-CA Save            -> " + Localize("fr-CA", "Save"));
Console.WriteLine("hi-IN Welcome         -> " + Localize("hi-IN", "Welcome"));
Console.WriteLine("de-DE ProductNotFound -> " + Localize("de-DE", "ProductNotFound", 5));
Console.WriteLine("fr    Logout          -> " + Localize("fr", "Logout"));
`,
        },
        stdin: '',
      },
      result: `fr-CA Welcome         -> Bienvenue chez nous  [from fr-CA]
fr-CA ProductNotFound -> Produit 99 introuvable  [from fr]
fr-CA Save            -> Save  [from default]
hi-IN Welcome         -> Swagat hai  [from hi]
de-DE ProductNotFound -> Product 5 was not found  [from default]
fr    Logout          -> Logout  [missing, key returned]`,
      explanation: 'Each lookup starts at the specific culture and moves to its parent ("fr-CA" -> "fr" -> ""). fr-CA only overrides Welcome; the other keys come from fr or the default file. There is no German file, so de-DE uses the default. A key missing everywhere returns the key name itself - exactly what IStringLocalizer does (LocalizedString.ResourceNotFound is true), so the page never crashes.',
    },
    {
      title: 'Console simulation: picking the request culture (query, cookie, Accept-Language)',
      scenario: 'Reproduce the provider order used by RequestLocalizationMiddleware, including q-values in Accept-Language.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it CultureProviderDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Globalization;
using System.Linq;

string[] supported = { "en-US", "fr-FR", "de-DE", "hi-IN" };

string Resolve(string? query, string? cookie, string? acceptLanguage)
{
    if (query is not null && supported.Contains(query))
        return query + " (query string)";

    if (cookie is not null)
    {
        string c = cookie.Split('|')[0].Substring(2);      // "c=hi-IN|uic=hi-IN" -> "hi-IN"
        if (supported.Contains(c)) return c + " (cookie)";
    }

    if (acceptLanguage is not null)
    {
        var languages = acceptLanguage.Split(',')
            .Select(part =>
            {
                string[] bits = part.Split(';');
                double q = bits.Length > 1
                    ? double.Parse(bits[1].Trim().Substring(2), CultureInfo.InvariantCulture)
                    : 1.0;
                return (Lang: bits[0].Trim(), Q: q);
            })
            .OrderByDescending(x => x.Q);
        foreach (var l in languages)
            if (supported.Contains(l.Lang)) return l.Lang + " (Accept-Language, q=" + l.Q.ToString(CultureInfo.InvariantCulture) + ")";
    }
    return "en-US (default)";
}

Console.WriteLine("1: " + Resolve("fr-FR", null, "de-DE"));
Console.WriteLine("2: " + Resolve(null, "c=hi-IN|uic=hi-IN", "de-DE"));
Console.WriteLine("3: " + Resolve(null, null, "es-ES,de-DE;q=0.9,en-US;q=0.8"));
Console.WriteLine("4: " + Resolve(null, null, "ja-JP"));
Console.WriteLine("5: " + Resolve("xx-YY", null, null));`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Globalization;
using System.Linq;

string[] supported = { "en-US", "fr-FR", "de-DE", "hi-IN" };

string Resolve(string? query, string? cookie, string? acceptLanguage)
{
    if (query is not null && supported.Contains(query))
        return query + " (query string)";

    if (cookie is not null)
    {
        string c = cookie.Split('|')[0].Substring(2);      // "c=hi-IN|uic=hi-IN" -> "hi-IN"
        if (supported.Contains(c)) return c + " (cookie)";
    }

    if (acceptLanguage is not null)
    {
        var languages = acceptLanguage.Split(',')
            .Select(part =>
            {
                string[] bits = part.Split(';');
                double q = bits.Length > 1
                    ? double.Parse(bits[1].Trim().Substring(2), CultureInfo.InvariantCulture)
                    : 1.0;
                return (Lang: bits[0].Trim(), Q: q);
            })
            .OrderByDescending(x => x.Q);
        foreach (var l in languages)
            if (supported.Contains(l.Lang)) return l.Lang + " (Accept-Language, q=" + l.Q.ToString(CultureInfo.InvariantCulture) + ")";
    }
    return "en-US (default)";
}

Console.WriteLine("1: " + Resolve("fr-FR", null, "de-DE"));
Console.WriteLine("2: " + Resolve(null, "c=hi-IN|uic=hi-IN", "de-DE"));
Console.WriteLine("3: " + Resolve(null, null, "es-ES,de-DE;q=0.9,en-US;q=0.8"));
Console.WriteLine("4: " + Resolve(null, null, "ja-JP"));
Console.WriteLine("5: " + Resolve("xx-YY", null, null));
`,
        },
        stdin: '',
      },
      result: `1: fr-FR (query string)
2: hi-IN (cookie)
3: de-DE (Accept-Language, q=0.9)
4: en-US (default)
5: en-US (default)`,
      explanation: 'Case 1: the query string wins even though Accept-Language says German. Case 2: no query, so the cookie value after "c=" is used. Case 3: es-ES has the highest quality (1.0) but is not supported, so the next best, de-DE (0.9), is chosen. Cases 4 and 5: nothing supported, so DefaultRequestCulture is used - unsupported values are ignored, never trusted.',
    },
    {
      title: 'Console simulation: formatting dates and numbers per culture',
      scenario: 'Show how the same DateTime and decimal look in different cultures, and why invariant culture is needed for machine data.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it CultureFormatDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 (needs ICU culture data, available by default on Windows 10+, macOS and normal Linux installs)',
      ],
      code: `using System;
using System.Globalization;

var date = new DateTime(2026, 11, 17);
decimal amount = 1234567.891m;

foreach (var name in new[] { "en-US", "fr-FR", "de-DE", "es-ES" })
{
    var c = new CultureInfo(name);
    Console.WriteLine(name + " date  : " + date.ToString("dddd, dd MMMM yyyy", c));
}
foreach (var name in new[] { "en-US", "de-DE", "en-IN" })
{
    var c = new CultureInfo(name);
    Console.WriteLine(name + " number: " + amount.ToString("N2", c));
}

decimal parsedDe = decimal.Parse("10,5", new CultureInfo("de-DE"));
decimal parsedInv = decimal.Parse("10.5", CultureInfo.InvariantCulture);
Console.WriteLine("de-DE parse of 10,5 = " + parsedDe.ToString(CultureInfo.InvariantCulture));
Console.WriteLine("invariant parse of 10.5 = " + parsedInv.ToString(CultureInfo.InvariantCulture));`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Globalization;

var date = new DateTime(2026, 11, 17);
decimal amount = 1234567.891m;

foreach (var name in new[] { "en-US", "fr-FR", "de-DE", "es-ES" })
{
    var c = new CultureInfo(name);
    Console.WriteLine(name + " date  : " + date.ToString("dddd, dd MMMM yyyy", c));
}
foreach (var name in new[] { "en-US", "de-DE", "en-IN" })
{
    var c = new CultureInfo(name);
    Console.WriteLine(name + " number: " + amount.ToString("N2", c));
}

decimal parsedDe = decimal.Parse("10,5", new CultureInfo("de-DE"));
decimal parsedInv = decimal.Parse("10.5", CultureInfo.InvariantCulture);
Console.WriteLine("de-DE parse of 10,5 = " + parsedDe.ToString(CultureInfo.InvariantCulture));
Console.WriteLine("invariant parse of 10.5 = " + parsedInv.ToString(CultureInfo.InvariantCulture));
`,
        },
        stdin: '',
      },
      result: `en-US date  : Tuesday, 17 November 2026
fr-FR date  : mardi, 17 novembre 2026
de-DE date  : Dienstag, 17 November 2026
es-ES date  : martes, 17 noviembre 2026
en-US number: 1,234,567.89
de-DE number: 1.234.567,89
en-IN number: 12,34,567.89
de-DE parse of 10,5 = 10.5
invariant parse of 10.5 = 10.5`,
      explanation: 'The custom pattern "dddd, dd MMMM yyyy" keeps the order fixed, while the day and month NAMES come from the culture. "N2" uses each culture\'s group and decimal separators; en-IN uses Indian grouping (lakh/crore: 12,34,567). German writes 10,5 for ten and a half, so parsing must use the matching culture. Printing with InvariantCulture keeps the output identical on every machine.',
    },
  ],
  interview: [
    { q: 'What is the difference between globalization and localization?', a: 'Globalization is preparing the app to support multiple cultures (externalized strings, culture-aware formatting). Localization is providing the translated resources and settings for a specific culture.', level: 'Easy' },
    { q: 'CurrentCulture vs CurrentUICulture?', a: 'CurrentCulture controls formatting/parsing of dates, numbers and currency. CurrentUICulture controls which resource (translated text) is loaded.', level: 'Easy' },
    { q: 'What does IStringLocalizer return for a missing key?', a: 'A LocalizedString whose Value is the key name itself with ResourceNotFound = true; it does not throw.', level: 'Medium' },
    { q: 'List the default request culture providers in order.', a: 'QueryStringRequestCultureProvider, CookieRequestCultureProvider, AcceptLanguageHeaderRequestCultureProvider. The first one that returns a supported culture wins; otherwise DefaultRequestCulture.', level: 'Medium' },
    { q: 'How is the culture cookie formatted?', a: 'Name .AspNetCore.Culture, value c=fr-FR|uic=fr-FR. Create it with CookieRequestCultureProvider.MakeCookieValue(new RequestCulture("fr-FR")).', level: 'Medium' },
    { q: 'How do you localize DataAnnotations error messages?', a: 'Call AddDataAnnotationsLocalization() and use the ErrorMessage text as the resource key; optionally point all of them to a SharedResource through DataAnnotationLocalizerProvider.', level: 'Medium' },
    { q: 'What is resource fallback?', a: 'If a key is not found in the specific culture (fr-CA), .NET looks in the parent culture (fr) and then in the neutral/default resource file.', level: 'Easy' },
    { q: 'Why should APIs avoid culture-specific number formatting in JSON?', a: 'JSON numbers must use "." as decimal separator. System.Text.Json is culture-invariant; clients format values for display themselves.', level: 'Medium' },
    { q: 'What can go wrong with decimal.Parse(input) on a server?', a: 'It uses the server/thread culture, so "10.5" may be parsed as 105 or throw under de-DE. Use an explicit culture or InvariantCulture.', level: 'Hard' },
    { q: 'Where must UseRequestLocalization be placed?', a: 'Early in the pipeline, before any middleware or endpoint that reads the culture (before MapControllers / MVC, and before static pages that render text).', level: 'Medium' },
    { q: 'Output question: new DateTime(2026,11,17).ToString("dd.MM.yyyy", CultureInfo.InvariantCulture)?', a: '17.11.2026 - a custom pattern with literal dots gives the same output in every culture.', level: 'Easy' },
  ],
  practice: [
    { task: 'Add Marathi (mr-IN) support to the MVC demo with SharedResource.mr.resx and a new dropdown option.', hint: 'Add "mr-IN" to the supported cultures array as well.', solution: 'string[] supported = ["en-US", "fr-FR", "hi-IN", "mr-IN"]; add SharedResource.mr.resx with Welcome, NameRequired, FullName, Register rows; add <option value="mr-IN">Marathi</option>.' },
    { task: 'Localize the [StringLength(50, ErrorMessage = "NameTooLong")] message which needs the max length in the text.', hint: 'Resource value can contain {0} (display name) and {1} (max length).', solution: 'SharedResource.resx: NameTooLong = {0} cannot be longer than {1} characters. fr: {0} ne peut pas depasser {1} caracteres. The framework passes the display name and maximum length automatically.' },
    { task: 'Write an endpoint GET /api/culture that returns the current culture, UI culture and today formatted with "D".', hint: 'Use IRequestCultureFeature or CultureInfo.CurrentCulture.', solution: 'app.MapGet("/api/culture", () => new { culture = CultureInfo.CurrentCulture.Name, uiCulture = CultureInfo.CurrentUICulture.Name, today = DateTime.Today.ToString("D") });' },
    { task: 'Store products with translations in SQL Server: ProductTranslation(ProductId, Culture, Name). Return the name in the request culture with fallback to English.', hint: 'Query the specific culture first, then "en".', solution: 'var culture = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName; var name = await db.ProductTranslations.Where(t => t.ProductId == id && (t.Culture == culture || t.Culture == "en")).OrderBy(t => t.Culture == culture ? 0 : 1).Select(t => t.Name).FirstOrDefaultAsync();' },
    { task: 'Make the React frontend send the chosen language to the API on every axios request.', hint: 'Use an axios interceptor that sets Accept-Language.', solution: 'api.interceptors.request.use(cfg => { cfg.headers["Accept-Language"] = localStorage.getItem("lang") || "en-US"; return cfg; });' },
  ],
  quiz: [
    { question: 'Which property decides which .resx translation is loaded?', options: ['CultureInfo.CurrentCulture', 'CultureInfo.CurrentUICulture', 'CultureInfo.InvariantCulture', 'Thread.Name'], answer: 1, explanation: 'UI culture chooses resources; culture chooses formatting.' },
    { question: 'The request has ?culture=fr-FR and Accept-Language: de-DE. Both are supported. Which culture is used?', options: ['de-DE', 'en-US', 'fr-FR', 'Both'], answer: 2, explanation: 'The query string provider runs before the Accept-Language provider.' },
    { question: 'What does localizer["Unknown"] return when the key is missing?', options: ['null', 'An exception', 'An empty string', '"Unknown" with ResourceNotFound = true'], answer: 3, explanation: 'The key itself is returned, so the UI never breaks.' },
    { question: 'Which file holds French strings for IStringLocalizer<SharedResource> with ResourcesPath = "Resources"?', options: ['Resources/SharedResource.fr.resx', 'Resources/fr/SharedResource.json', 'wwwroot/fr.resx', 'appsettings.fr.json'], answer: 0, explanation: 'Resource files are named after the type plus culture: SharedResource.fr.resx.' },
    { question: '1234567.891m.ToString("N2", new CultureInfo("de-DE")) gives...', options: ['1,234,567.89', '1.234.567,89', '12,34,567.89', '1234567,89'], answer: 1, explanation: 'German uses "." for grouping and "," for decimals.' },
  ],
};
