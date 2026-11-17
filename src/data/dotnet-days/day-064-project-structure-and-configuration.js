export default {
  id: "day-064-project-structure-and-configuration",
  title: "Project Structure, Program.cs, appsettings.json, Launch Settings and Environments",
  module: "Module 6: ASP.NET Core & .NET Web Development",
  day: 64,
  level: "Beginner",
  duration: "2 hours",
  summary:
    "Walk through every folder and file of an ASP.NET Core MVC project: the .csproj, Program.cs, appsettings.json and appsettings.Development.json, Properties/launchSettings.json, wwwroot, Controllers, Models and Views. Learn how configuration values are read and how the Development, Staging and Production environments change the app's behaviour.",
  objectives: [
    "Identify the purpose of each folder and file in an ASP.NET Core MVC project",
    "Read Program.cs line by line: services section vs middleware section",
    "Store and read settings from appsettings.json using IConfiguration and the Options pattern",
    "Understand launchSettings.json profiles, application URLs and ASPNETCORE_ENVIRONMENT",
    "Use IWebHostEnvironment (IsDevelopment, IsProduction, IsEnvironment) to change behaviour per environment",
  ],
  theory: [
    {
      heading: "Folder structure of an MVC project",
      content:
        "When you create 'ASP.NET Core Web App (Model-View-Controller)' named StudentPortal, Visual Studio generates the structure below. Solution Explorer also shows 'Connected Services' and 'Dependencies' (Frameworks: Microsoft.AspNetCore.App and Microsoft.NETCore.App, plus NuGet Packages).",
      syntax: `StudentPortal/
├── StudentPortal.csproj         project file: SDK, target framework, NuGet packages
├── Program.cs                   entry point: services + middleware pipeline
├── appsettings.json             configuration for all environments
├── appsettings.Development.json overrides used only in Development
├── Properties/
│   └── launchSettings.json      local run profiles (URLs, environment) – not deployed
├── wwwroot/                     static files served as-is: css/, js/, lib/ (bootstrap, jquery), favicon.ico
├── Controllers/
│   └── HomeController.cs        classes that handle requests
├── Models/
│   └── ErrorViewModel.cs        data/business classes
└── Views/
    ├── _ViewImports.cshtml      common @using and @addTagHelper for all views
    ├── _ViewStart.cshtml        sets Layout = "_Layout" for every view
    ├── Home/ Index.cshtml, Privacy.cshtml
    └── Shared/ _Layout.cshtml, _Layout.cshtml.css, Error.cshtml, _ValidationScriptsPartial.cshtml`,
      points: [
        "wwwroot is the web root: only files here can be requested directly (e.g. /css/site.css)",
        "Controllers, Models, Views folders are conventions – MVC finds views by folder name",
        "bin/ and obj/ are build outputs (hidden by default; never commit them to Git)",
        "Razor Pages projects have a Pages/ folder instead of Controllers/ and Views/",
      ],
    },
    {
      heading: "The .csproj file",
      content:
        "The SDK-style project file is small. Sdk=\"Microsoft.NET.Sdk.Web\" brings in the web build targets and references the ASP.NET Core shared framework automatically. TargetFramework selects the .NET version. Nullable and ImplicitUsings enable modern C# features (global usings such as System, System.Linq, Microsoft.AspNetCore.Builder and Microsoft.Extensions.DependencyInjection). NuGet packages appear as PackageReference elements. In Visual Studio double-click the project name to edit it.",
      syntax: `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <!-- added later, e.g. Day 78 -->
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0" />
  </ItemGroup>
</Project>`,
    },
    {
      heading: "Program.cs: two sections",
      content:
        "Program.cs has two parts separated by builder.Build(). Before Build: register services into the dependency injection container (builder.Services.AddXxx). After Build: configure the HTTP request pipeline (app.UseXxx middleware) and map endpoints (app.MapXxx). Finally app.Run() starts Kestrel. builder.Configuration, builder.Environment and builder.Logging are also available before Build; app.Configuration and app.Environment after it.",
      syntax: `var builder = WebApplication.CreateBuilder(args);
// ---------- SERVICES (DI container) ----------
builder.Services.AddControllersWithViews();
builder.Services.Configure<CollegeSettings>(builder.Configuration.GetSection("College"));

var app = builder.Build();
// ---------- PIPELINE (middleware) ----------
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();                       // Strict-Transport-Security header
}
app.UseHttpsRedirection();               // http -> https
app.UseStaticFiles();                    // serve wwwroot (MapStaticAssets in .NET 9+)
app.UseRouting();
app.UseAuthorization();
app.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
app.Run();`,
    },
    {
      heading: "appsettings.json and IConfiguration",
      content:
        "appsettings.json stores settings as JSON: logging levels, connection strings, API keys (non-secret), feature flags and your own sections. Values are read through IConfiguration using keys with ':' as separator for nesting (\"College:Name\"). GetConnectionString(\"Default\") is a shortcut for \"ConnectionStrings:Default\". Configuration sources are layered and the LAST source wins: appsettings.json -> appsettings.{Environment}.json -> User Secrets (Development only) -> Environment variables -> Command-line arguments. Environment variables use a double underscore for nesting: College__Name.",
      syntax: `// read anywhere IConfiguration is injected
string name = config["College:Name"];
int max = config.GetValue<int>("College:MaxStudents");
string cs = config.GetConnectionString("Default");

// Options pattern: bind a section to a class
builder.Services.Configure<CollegeSettings>(builder.Configuration.GetSection("College"));
// inject IOptions<CollegeSettings> and use options.Value.Name`,
      points: [
        "Never store real passwords in appsettings.json committed to Git; use User Secrets (right-click project > Manage User Secrets) or environment variables",
        "appsettings.json changes are reloaded automatically (reloadOnChange) for IOptionsSnapshot / IOptionsMonitor",
        "Day 74 covers configuration and logging in more depth",
      ],
    },
    {
      heading: "launchSettings.json and profiles",
      content:
        "Properties/launchSettings.json is used ONLY on your development machine by Visual Studio and dotnet run. Each profile defines how to start the app: commandName (Project = Kestrel, IISExpress = IIS Express), applicationUrl (the ports), launchBrowser, launchUrl and environmentVariables such as ASPNETCORE_ENVIRONMENT. Choose a profile from the green Run button drop-down in Visual Studio (http, https, IIS Express) or with dotnet run --launch-profile https.",
      syntax: `{
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:5094",
      "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Development" }
    },
    "https": {
      "commandName": "Project",
      "launchBrowser": true,
      "applicationUrl": "https://localhost:7086;http://localhost:5094",
      "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Development" }
    }
  }
}`,
    },
    {
      heading: "Environments: Development, Staging, Production",
      content:
        "ASP.NET Core reads the ASPNETCORE_ENVIRONMENT (or DOTNET_ENVIRONMENT) variable. If it is not set, the environment is Production. The environment decides which appsettings.{Environment}.json is loaded and lets code behave differently: in Development you see the detailed Developer Exception Page; in Production users see a friendly /Home/Error page and HSTS is enabled. Check it with app.Environment.IsDevelopment(), IsStaging(), IsProduction() or IsEnvironment(\"QA\"); in views use the <environment include=\"Development\"> tag helper.",
      points: [
        "Set in Visual Studio: Project > Properties > Debug > Open debug launch profiles UI > Environment variables",
        "Set in a terminal (Windows PowerShell): $env:ASPNETCORE_ENVIRONMENT=\"Staging\"; dotnet run",
        "Set in Linux/macOS: ASPNETCORE_ENVIRONMENT=Staging dotnet run",
        "dotnet run --environment Staging also works (.NET 6+)",
        "Default when nothing is set (e.g. on a server): Production",
      ],
    },
  ],
  examples: [
    {
      title: "Read custom settings from appsettings.json in a controller",
      scenario: "The college name, academic year and maximum number of students should come from configuration, not be hard-coded.",
      steps: [
        "Open the StudentPortal MVC project (File > Open > Project/Solution, or create it with File > New > Project > ASP.NET Core Web App (Model-View-Controller))",
        "Open appsettings.json and add the College section and ConnectionStrings shown below",
        "Right-click Controllers > Add > Controller > MVC Controller - Empty > name it ConfigController",
        "Paste the controller code; it injects IConfiguration through the constructor",
        "Press Ctrl+F5 and browse to /Config",
        "CLI alternative: dotnet new mvc -n StudentPortal, add the files in VS Code, dotnet run",
      ],
      code: `// appsettings.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "Default": "Server=(localdb)\\\\MSSQLLocalDB;Database=StudentDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "College": {
    "Name": "City Engineering College",
    "AcademicYear": "2026-27",
    "MaxStudents": 120
  }
}

// Controllers/ConfigController.cs
using Microsoft.AspNetCore.Mvc;

namespace StudentPortal.Controllers;

public class ConfigController : Controller
{
    private readonly IConfiguration _config;

    public ConfigController(IConfiguration config)
    {
        _config = config;
    }

    public IActionResult Index()
    {
        string name = _config["College:Name"] ?? "Unknown";
        string year = _config["College:AcademicYear"] ?? "";
        int max = _config.GetValue<int>("College:MaxStudents");
        string? cs = _config.GetConnectionString("Default");

        return Content($"College: {name}\\nYear: {year}\\nMax students: {max}\\nHas connection string: {cs != null}");
    }
}`,
      result: `Browser https://localhost:7086/Config shows (plain text):
College: City Engineering College
Year: 2026-27
Max students: 120
Has connection string: True`,
      explanation:
        "IConfiguration is registered automatically by WebApplication.CreateBuilder, so any controller can receive it in its constructor (dependency injection). Nested keys use ':' and GetValue<int> converts the string to int. Content() returns text/plain. In JSON a backslash must be escaped, so (localdb)\\MSSQLLocalDB is written with a double backslash.",
    },
    {
      title: "Options pattern: bind a section to a strongly typed class",
      scenario: "Instead of magic strings, bind the College section to a CollegeSettings class and show it in a view.",
      steps: [
        "Right-click Models > Add > Class > CollegeSettings.cs and paste the class",
        "In Program.cs add builder.Services.Configure<CollegeSettings>(...) BEFORE builder.Build()",
        "Add HomeController.About action (code below) and right-click inside the action > Add View > Razor View > name About, template Empty",
        "Paste the view code, then press Ctrl+F5 and open /Home/About",
      ],
      code: `// Models/CollegeSettings.cs
namespace StudentPortal.Models;

public class CollegeSettings
{
    public string Name { get; set; } = "";
    public string AcademicYear { get; set; } = "";
    public int MaxStudents { get; set; }
}

// Program.cs (add before var app = builder.Build();)
using StudentPortal.Models;
builder.Services.Configure<CollegeSettings>(builder.Configuration.GetSection("College"));

// Controllers/HomeController.cs (add)
using Microsoft.Extensions.Options;
using StudentPortal.Models;

public class HomeController : Controller
{
    private readonly CollegeSettings _college;

    public HomeController(IOptions<CollegeSettings> options)
    {
        _college = options.Value;
    }

    public IActionResult About()
    {
        return View(_college);
    }
}

@* Views/Home/About.cshtml *@
@model StudentPortal.Models.CollegeSettings
@{
    ViewData["Title"] = "About";
}
<h2>@Model.Name</h2>
<p>Academic year: <strong>@Model.AcademicYear</strong></p>
<p>Seats available: @Model.MaxStudents</p>`,
      result: `Browser /Home/About (inside the site layout with navbar):
City Engineering College          (h2 heading)
Academic year: 2026-27
Seats available: 120
The browser tab title is "About - StudentPortal".`,
      explanation:
        "Configure<T> binds the JSON section to the class (property names must match keys, case-insensitive). IOptions<T> is injected and .Value gives the object. Strongly typed settings give IntelliSense and compile-time checking. The view uses @model to receive the object (more on Day 68-69).",
    },
    {
      title: "Behave differently per environment",
      scenario: "Show a yellow 'DEVELOPMENT MODE' banner only in Development, and use a different college name in Staging.",
      steps: [
        "Add appsettings.Staging.json to the project root (right-click project > Add > New Item > App Settings File)",
        "Add a custom middleware/endpoint in Program.cs that prints the environment (code below)",
        "Add the <environment> tag helper block to Views/Shared/_Layout.cshtml just after <body>",
        "Run with the default profile (Development) and browse /env",
        "Change the environment: Project > Properties > Debug > Open debug launch profiles UI > set ASPNETCORE_ENVIRONMENT = Staging, run again",
        "CLI alternative: dotnet run --environment Staging   (or set the environment variable before dotnet run)",
      ],
      code: `// appsettings.Staging.json
{
  "College": {
    "Name": "City Engineering College (STAGING)"
  }
}

// Program.cs (after var app = builder.Build();)
app.MapGet("/env", (IWebHostEnvironment env, IConfiguration config) =>
    $"Environment: {env.EnvironmentName}\\n" +
    $"IsDevelopment: {env.IsDevelopment()}\\n" +
    $"Content root: {env.ContentRootPath}\\n" +
    $"College: {config["College:Name"]}");

@* Views/Shared/_Layout.cshtml – inside <body> *@
<environment include="Development">
    <div class="alert alert-warning text-center mb-0">DEVELOPMENT MODE</div>
</environment>
<environment exclude="Development">
    <!-- nothing shown in Staging / Production -->
</environment>`,
      result: `Development profile, /env:
Environment: Development
IsDevelopment: True
Content root: C:\\Projects\\StudentPortal\\
College: City Engineering College
(every MVC page shows a yellow "DEVELOPMENT MODE" bar at the top)

Staging profile, /env:
Environment: Staging
IsDevelopment: False
Content root: C:\\Projects\\StudentPortal\\
College: City Engineering College (STAGING)
(no yellow bar)`,
      explanation:
        "appsettings.Staging.json is loaded after appsettings.json, so its College:Name overrides the base value while MaxStudents and AcademicYear still come from appsettings.json. MapGet endpoints and controllers can live in the same app. The environment tag helper renders its content only for the matching environment.",
    },
    {
      title: "Console simulation: configuration layering (last source wins)",
      scenario: "Understand how ASP.NET Core merges appsettings.json, appsettings.Development.json, environment variables and command-line args.",
      steps: [
        "File > New > Project > Console App, name ConfigLayers",
        "Replace Program.cs with the code and press Ctrl+F5",
      ],
      code: `using System;
using System.Collections.Generic;

var appsettings = new Dictionary<string, string>
{
    ["College:Name"] = "City College",
    ["College:MaxStudents"] = "120",
    ["Logging:Default"] = "Information"
};
var devSettings = new Dictionary<string, string>
{
    ["Logging:Default"] = "Debug"
};
var envVariables = new Dictionary<string, string>
{
    // College__MaxStudents=60 in the OS becomes College:MaxStudents
    ["College__MaxStudents".Replace("__", ":")] = "60"
};
var commandLine = new Dictionary<string, string>
{
    ["College:Name"] = "Command Line College"
};

var sources = new[] { appsettings, devSettings, envVariables, commandLine };
var final = new Dictionary<string, string>();

foreach (var source in sources)
    foreach (var pair in source)
        final[pair.Key] = pair.Value;      // later source overwrites

string[] keys = { "College:Name", "College:MaxStudents", "Logging:Default" };
foreach (var key in keys)
    Console.WriteLine($"{key} = {final[key]}");`,
      csharp: {
        files: {
          "Program.cs": `using System;
using System.Collections.Generic;

var appsettings = new Dictionary<string, string>
{
    ["College:Name"] = "City College",
    ["College:MaxStudents"] = "120",
    ["Logging:Default"] = "Information"
};
var devSettings = new Dictionary<string, string>
{
    ["Logging:Default"] = "Debug"
};
var envVariables = new Dictionary<string, string>
{
    // College__MaxStudents=60 in the OS becomes College:MaxStudents
    ["College__MaxStudents".Replace("__", ":")] = "60"
};
var commandLine = new Dictionary<string, string>
{
    ["College:Name"] = "Command Line College"
};

var sources = new[] { appsettings, devSettings, envVariables, commandLine };
var final = new Dictionary<string, string>();

foreach (var source in sources)
    foreach (var pair in source)
        final[pair.Key] = pair.Value;      // later source overwrites

string[] keys = { "College:Name", "College:MaxStudents", "Logging:Default" };
foreach (var key in keys)
    Console.WriteLine($"{key} = {final[key]}");
`,
        },
        stdin: "",
      },
      result: `College:Name = Command Line College
College:MaxStudents = 60
Logging:Default = Debug`,
      explanation:
        "Each source is applied in order and a later source overwrites keys from earlier ones. That is why a server can override appsettings.json with an environment variable (College__MaxStudents) without editing files, and a command-line argument beats everything. We print keys in a fixed order instead of relying on dictionary order.",
    },
  ],
  interview: [
    { q: "What is the purpose of the wwwroot folder?", a: "It is the web root that holds static files (CSS, JS, images, libraries). Only files under wwwroot are served directly by the static files middleware, e.g. /css/site.css.", level: "Easy" },
    { q: "What are the two main sections of Program.cs?", a: "Service registration on builder.Services (dependency injection container) before builder.Build(), and the middleware pipeline/endpoint mapping on app after Build, ending with app.Run().", level: "Easy" },
    { q: "Is launchSettings.json used in production?", a: "No. It is only used by Visual Studio and dotnet run on the developer machine. It is not published; on servers the environment and URLs come from environment variables, web.config or hosting settings.", level: "Medium" },
    { q: "What is the default environment if ASPNETCORE_ENVIRONMENT is not set?", a: "Production.", level: "Easy" },
    { q: "In what order are configuration sources applied by default?", a: "appsettings.json, appsettings.{Environment}.json, User Secrets (Development only), environment variables, then command-line arguments. Later sources override earlier ones.", level: "Medium" },
    { q: "How do you represent a nested key College:Name as an environment variable?", a: "Use a double underscore: College__Name, because ':' is not allowed in environment variable names on all platforms.", level: "Medium" },
    { q: "What is the Options pattern?", a: "Binding a configuration section to a strongly typed class with services.Configure<T>(section) and injecting IOptions<T>, IOptionsSnapshot<T> (per request, reloads) or IOptionsMonitor<T> (singleton, change notifications).", level: "Medium" },
    { q: "What is _ViewStart.cshtml and _ViewImports.cshtml?", a: "_ViewStart runs before every view in its folder and below, usually setting Layout = \"_Layout\". _ViewImports holds shared @using directives and @addTagHelper so every view gets them.", level: "Medium" },
    { q: "Why should secrets not be stored in appsettings.json?", a: "The file is committed to source control and deployed in plain text. Use User Secrets in development and environment variables / Azure Key Vault in production.", level: "Easy" },
    { q: "What does Sdk=\"Microsoft.NET.Sdk.Web\" do in the csproj?", a: "It imports web-specific build/publish targets, references the Microsoft.AspNetCore.App shared framework and adds web implicit usings, so no separate package for ASP.NET Core is needed.", level: "Hard" },
    { q: "If appsettings.json has \"MaxStudents\": 120 and appsettings.Development.json has \"MaxStudents\": 50, what does config.GetValue<int>(\"College:MaxStudents\") return in Development and in Production?", a: "50 in Development (the environment file overrides) and 120 in Production (the Development file is not loaded).", level: "Medium" },
  ],
  practice: [
    {
      task: "Add a 'Features' section to appsettings.json with \"EnableRegistration\": true and show a 'Register' link on the Home page only when it is true.",
      hint: "Inject IConfiguration into HomeController, put the bool in ViewBag, use @if in the view.",
      solution: `// appsettings.json
"Features": { "EnableRegistration": true }

// HomeController.Index
public IActionResult Index()
{
    ViewBag.CanRegister = _config.GetValue<bool>("Features:EnableRegistration");
    return View();
}

@* Index.cshtml *@
@if (ViewBag.CanRegister == true)
{
    <a class="btn btn-primary" href="/Student/Register">Register</a>
}`,
    },
    {
      task: "Create a new launch profile named 'Staging' that runs on http://localhost:5200 with ASPNETCORE_ENVIRONMENT=Staging.",
      hint: "Edit Properties/launchSettings.json and add a profile; choose it from the Run drop-down.",
      solution: `"Staging": {
  "commandName": "Project",
  "launchBrowser": true,
  "applicationUrl": "http://localhost:5200",
  "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Staging" }
}
// dotnet run --launch-profile Staging`,
    },
    {
      task: "Write down for each of these files whether it is deployed to the server: Program.cs (compiled), appsettings.json, appsettings.Development.json, launchSettings.json, wwwroot/css/site.css, Views/*.cshtml.",
      hint: "Run dotnet publish -c Release -o publish and look in the publish folder.",
      solution: `Program.cs -> compiled into StudentPortal.dll (deployed)
appsettings.json -> deployed
appsettings.Development.json -> deployed too, but only loaded if environment is Development
launchSettings.json -> NOT deployed
wwwroot/css/site.css -> deployed under publish/wwwroot
Views/*.cshtml -> compiled into the app dll (Razor compilation), not copied as files`,
    },
    {
      task: "Show the environment name in the footer of every page.",
      hint: "Inject IWebHostEnvironment into the layout with @inject.",
      solution: `@* Views/Shared/_Layout.cshtml *@
@inject Microsoft.AspNetCore.Hosting.IWebHostEnvironment Env
<footer class="border-top footer text-muted">
    <div class="container">&copy; 2026 - StudentPortal - Environment: @Env.EnvironmentName</div>
</footer>`,
    },
    {
      task: "Store the connection string with User Secrets instead of appsettings.json.",
      hint: "Right-click project > Manage User Secrets, or dotnet user-secrets.",
      solution: `dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Default" "Server=.;Database=StudentDB;Trusted_Connection=True;TrustServerCertificate=True"
// In code nothing changes: builder.Configuration.GetConnectionString("Default")`,
    },
  ],
  quiz: [
    { question: "Which file holds the Visual Studio run profiles and application URLs?", options: ["appsettings.json", "Program.cs", "Properties/launchSettings.json", "web.config"], answer: 2, explanation: "launchSettings.json defines profiles used only for local development." },
    { question: "Which configuration source wins by default if the same key is defined in all of them?", options: ["appsettings.json", "Command-line arguments", "appsettings.Development.json", "Environment variables"], answer: 1, explanation: "Command-line arguments are added last, so they override all others." },
    { question: "Which method reads \"ConnectionStrings:Default\"?", options: ["config.GetConnectionString(\"Default\")", "config.GetSection(\"Default\")", "config.Connection(\"Default\")", "config.GetValue<string>(\"Default\")"], answer: 0, explanation: "GetConnectionString(name) is a shortcut for the ConnectionStrings section." },
    { question: "Which folder contains static files like site.css?", options: ["Views", "Models", "Properties", "wwwroot"], answer: 3, explanation: "wwwroot is the web root for static files." },
    { question: "What does app.Environment.IsDevelopment() check?", options: ["Whether a debugger is attached", "Whether ASPNETCORE_ENVIRONMENT equals Development", "Whether the app runs on localhost", "Whether Visual Studio is installed"], answer: 1, explanation: "It compares the environment name (from ASPNETCORE_ENVIRONMENT) with 'Development'." },
  ],
};
