const configSimCode = `using System;
using System.Collections.Generic;

// Each "provider" is just a list of key/value pairs. Nested JSON becomes "Section:Key".
var appsettings = new Dictionary<string, string>
{
    ["AppSettings:SiteName"] = "Student Portal",
    ["AppSettings:PageSize"] = "10",
    ["AppSettings:ShowErrors"] = "false",
    ["ConnectionStrings:StudentDb"] = "Server=PROD-SQL;Database=StudentDB",
};
var development = new Dictionary<string, string>
{
    ["AppSettings:PageSize"] = "5",
    ["AppSettings:ShowErrors"] = "true",
    ["ConnectionStrings:StudentDb"] = "Server=localhost;Database=StudentDB_Dev",
};
var production = new Dictionary<string, string>
{
    ["AppSettings:PageSize"] = "25",
};
// Environment variables use a double underscore instead of a colon
var environmentVariables = new Dictionary<string, string>
{
    ["AppSettings__SiteName"] = "Student Portal (Azure)",
};

foreach (var env in new[] { "Development", "Production" })
{
    Console.WriteLine($"=== ASPNETCORE_ENVIRONMENT = {env} ===");
    var config = new Dictionary<string, string>();

    // Same order as WebApplication.CreateBuilder: later providers OVERRIDE earlier ones
    Apply(config, appsettings, "appsettings.json");
    Apply(config, env == "Development" ? development : production, $"appsettings.{env}.json");
    var envVars = new Dictionary<string, string>();
    foreach (var kv in environmentVariables)
        envVars[kv.Key.Replace("__", ":")] = kv.Value;
    Apply(config, envVars, "environment variables");

    Console.WriteLine($"SiteName   = {config["AppSettings:SiteName"]}");
    Console.WriteLine($"PageSize   = {config["AppSettings:PageSize"]}");
    Console.WriteLine($"ShowErrors = {config["AppSettings:ShowErrors"]}");
    Console.WriteLine($"Database   = {config["ConnectionStrings:StudentDb"]}");
    Console.WriteLine();
}

static void Apply(Dictionary<string, string> target, Dictionary<string, string> source, string name)
{
    foreach (var kv in source)
        target[kv.Key] = kv.Value;           // same key -> value is replaced
    Console.WriteLine($"  + loaded {name} ({source.Count} key(s))");
}`;

const loggerSimCode = `using System;

var logger = new MiniLogger("StudentController", LogLevel.Information);

Console.WriteLine("--- Minimum level: Information (typical Development) ---");
WriteSampleLogs(logger);

Console.WriteLine("--- Minimum level: Warning (typical Production) ---");
logger.MinLevel = LogLevel.Warning;
WriteSampleLogs(logger);

Console.WriteLine("--- Minimum level: Trace (debugging a problem) ---");
logger.MinLevel = LogLevel.Trace;
logger.Log(LogLevel.Trace, "Entering {Method}", "Index");
logger.Log(LogLevel.Debug, "Query returned {Rows} rows in {Ms} ms", 3, 12);

static void WriteSampleLogs(MiniLogger log)
{
    log.Log(LogLevel.Trace, "Entering {Method}", "Index");
    log.Log(LogLevel.Debug, "Query returned {Rows} rows in {Ms} ms", 3, 12);
    log.Log(LogLevel.Information, "Listed {Count} students", 3);
    log.Log(LogLevel.Warning, "Student {Id} not found", 99);
    log.Log(LogLevel.Error, "Could not save student {Name}", "Ravi");
    log.Log(LogLevel.Critical, "Database {Db} is offline", "StudentDB");
}

// Same order and numbers as Microsoft.Extensions.Logging.LogLevel
enum LogLevel { Trace = 0, Debug = 1, Information = 2, Warning = 3, Error = 4, Critical = 5, None = 6 }

class MiniLogger
{
    public string Category { get; }
    public LogLevel MinLevel { get; set; }

    public MiniLogger(string category, LogLevel minLevel)
    {
        Category = category;
        MinLevel = minLevel;
    }

    // "Message template": placeholders are filled in order with the arguments
    public void Log(LogLevel level, string template, params object[] args)
    {
        if (level < MinLevel) return;           // FILTERED OUT - nothing is written

        string message = template;
        foreach (var arg in args)
        {
            int start = message.IndexOf('{');
            int end = message.IndexOf('}', start);
            message = message.Substring(0, start) + arg + message.Substring(end + 1);
        }
        Console.WriteLine($"{ShortName(level)}: {Category}: {message}");
    }

    private static string ShortName(LogLevel level) => level switch
    {
        LogLevel.Trace => "trce",
        LogLevel.Debug => "dbug",
        LogLevel.Information => "info",
        LogLevel.Warning => "warn",
        LogLevel.Error => "fail",
        LogLevel.Critical => "crit",
        _ => "none",
    };
}`;

const settingsCode = `// File: appsettings.json   (base settings - used in EVERY environment)
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "StudentDb": "Server=PROD-SQL;Database=StudentDB;User Id=app_user;Password=SET-IN-SECRETS;TrustServerCertificate=True"
  },
  "PortalSettings": {
    "SiteName": "City College Student Portal",
    "PageSize": 25,
    "ShowDetailedErrors": false,
    "SupportEmail": "support@citycollege.edu"
  }
}

// File: appsettings.Development.json   (overrides ONLY what is different on a developer PC)
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  },
  "ConnectionStrings": {
    "StudentDb": "Server=(localdb)\\\\MSSQLLocalDB;Database=StudentDB_Dev;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "PortalSettings": {
    "PageSize": 5,
    "ShowDetailedErrors": true
  }
}

// File: appsettings.Production.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}

// File: Properties/launchSettings.json   (only used by Visual Studio / dotnet run on your PC)
{
  "profiles": {
    "https": {
      "commandName": "Project",
      "launchBrowser": true,
      "applicationUrl": "https://localhost:7086;http://localhost:5086",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "https-production": {
      "commandName": "Project",
      "launchBrowser": true,
      "applicationUrl": "https://localhost:7086;http://localhost:5086",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Production"
      }
    }
  }
}

// File: Models/PortalSettings.cs   (strongly typed settings class for the Options pattern)
using System.ComponentModel.DataAnnotations;

namespace StudentPortal.Models;

public class PortalSettings
{
    public const string SectionName = "PortalSettings";

    [Required] public string SiteName { get; set; } = "";
    [Range(1, 100)] public int PageSize { get; set; } = 10;
    public bool ShowDetailedErrors { get; set; }
    [EmailAddress] public string SupportEmail { get; set; } = "";
}

// File: Program.cs
using StudentPortal.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// Bind the "PortalSettings" section to the class, validate it, fail at startup if invalid
builder.Services.AddOptions<PortalSettings>()
    .Bind(builder.Configuration.GetSection(PortalSettings.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

var app = builder.Build();

// Environment-specific pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");
app.Run();

// File: Controllers/SettingsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using StudentPortal.Models;

namespace StudentPortal.Controllers;

public class SettingsController : Controller
{
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;
    private readonly PortalSettings _settings;

    public SettingsController(IConfiguration config, IWebHostEnvironment env,
                              IOptionsSnapshot<PortalSettings> options)
    {
        _config = config;
        _env = env;
        _settings = options.Value;            // re-read on every request if the file changes
    }

    public IActionResult Index()
    {
        // 3 ways to read configuration
        string? site1 = _config["PortalSettings:SiteName"];                     // indexer, string
        int size = _config.GetValue<int>("PortalSettings:PageSize");             // typed value
        string? cs = _config.GetConnectionString("StudentDb");                   // ConnectionStrings section

        ViewBag.Environment = _env.EnvironmentName;
        ViewBag.Site = site1;
        ViewBag.PageSize = size;
        ViewBag.Database = cs?.Split(';')[1];      // show only "Database=..." - never show passwords!
        return View(_settings);
    }
}

// File: Views/Settings/Index.cshtml
@model StudentPortal.Models.PortalSettings
<h2>@Model.SiteName</h2>
<table class="table w-auto">
    <tr><th>Environment</th><td>@ViewBag.Environment</td></tr>
    <tr><th>Page size</th><td>@Model.PageSize (IConfiguration says @ViewBag.PageSize)</td></tr>
    <tr><th>Detailed errors</th><td>@Model.ShowDetailedErrors</td></tr>
    <tr><th>Database</th><td>@ViewBag.Database</td></tr>
    <tr><th>Support</th><td>@Model.SupportEmail</td></tr>
</table>

<environment include="Development">
    <div class="alert alert-warning">DEVELOPMENT MODE - test data only</div>
</environment>
<environment exclude="Development">
    <p class="text-muted">Live system</p>
</environment>`;

const loggingWebCode = `// File: Controllers/StudentController.cs
using Microsoft.AspNetCore.Mvc;
using StudentPortal.Models;
using StudentPortal.Services;

namespace StudentPortal.Controllers;

public class StudentController : Controller
{
    private readonly IStudentService _service;
    private readonly ILogger<StudentController> _logger;   // category = full class name

    public StudentController(IStudentService service, ILogger<StudentController> logger)
    {
        _service = service;
        _logger = logger;
    }

    public IActionResult Index()
    {
        _logger.LogDebug("Index() called at {Time}", DateTime.UtcNow);
        var students = _service.GetAll();
        _logger.LogInformation("Listed {Count} students", students.Count);
        return View(students);
    }

    public IActionResult Details(int id)
    {
        var student = _service.GetById(id);
        if (student == null)
        {
            _logger.LogWarning("Student {StudentId} not found", id);
            return NotFound();
        }
        return View(student);
    }

    [HttpPost, ValidateAntiForgeryToken]
    public IActionResult Create(Student student)
    {
        try
        {
            _service.Add(student);
            _logger.LogInformation("Created student {StudentId} {Name}", student.Id, student.Name);
            return RedirectToAction(nameof(Index));
        }
        catch (Exception ex)
        {
            // pass the exception FIRST so the stack trace is logged
            _logger.LogError(ex, "Failed to create student {Name}", student.Name);
            ModelState.AddModelError("", "Could not save the student. Please try again.");
            return View(student);
        }
    }
}

// File: appsettings.Development.json  (Logging section)
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Warning",
      "StudentPortal.Controllers.StudentController": "Trace"
    },
    "Console": {
      "FormatterName": "simple",
      "FormatterOptions": { "TimestampFormat": "HH:mm:ss ", "SingleLine": true }
    }
  }
}

// File: Program.cs (optional: configure providers in code)
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();          // Visual Studio Output window
// Windows only: builder.Logging.AddEventLog();
// Files / databases: use Serilog (NuGet: Serilog.AspNetCore) - see Extra 44`;

export default {
  id: 'day-074-configuration-environments-logging',
  title: 'Configuration, appsettings.json, Environments and Logging',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 74,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `A real application runs in several places: your laptop (Development), a test server (Staging) and the live server (Production). Each needs different connection strings, page sizes, error pages and log levels – without changing code. Today you learn the ASP.NET Core configuration system (providers, override order, IConfiguration, the Options pattern, User Secrets, environment variables), how environments are selected, and how to write useful logs with ILogger, log levels and message templates.`,
  objectives: [
    'Explain configuration providers and the override order (appsettings.json, appsettings.{Environment}.json, User Secrets, environment variables, command line)',
    'Read settings with IConfiguration (indexer, GetValue, GetSection, GetConnectionString) and bind them to classes with IOptions, IOptionsSnapshot and IOptionsMonitor',
    'Switch between Development, Staging and Production using ASPNETCORE_ENVIRONMENT and launchSettings.json, and branch code/markup per environment',
    'Write logs with ILogger<T> at the right level, configure minimum levels per category, and use structured message templates',
    'Keep secrets out of source control with User Secrets and environment variables',
  ],
  theory: [
    {
      heading: 'The configuration system and providers',
      content: `In ASP.NET Core, configuration is a big **key/value dictionary** built from several **providers**. \`WebApplication.CreateBuilder(args)\` adds these providers automatically, in this order:

1. **appsettings.json** – base settings for all environments
2. **appsettings.{Environment}.json** – e.g. appsettings.Development.json
3. **User Secrets** – only in Development (secrets.json stored outside the project folder)
4. **Environment variables** – e.g. set on the server or in Azure App Service
5. **Command-line arguments** – e.g. \`dotnet run --PortalSettings:PageSize=50\`

**Later providers override earlier ones** when the same key exists. That is how one appsettings.json + small override files give different values per environment.

Nested JSON is flattened with a **colon**: \`{ "PortalSettings": { "PageSize": 25 } }\` becomes the key \`PortalSettings:PageSize\`. In environment variables the colon is written as a **double underscore** (\`PortalSettings__PageSize=25\`) because some operating systems do not allow ":" in variable names. Arrays use indexes: \`AllowedRoles:0\`, \`AllowedRoles:1\`.

Real-world analogy: a **school uniform rule book**. The general rule book (appsettings.json) says "blue shirt"; the winter circular (environment file) says "add a sweater"; the principal's announcement today (environment variable / command line) says "sports dress". The **latest, most specific** instruction wins.`,
      points: [
        'Keys are case-insensitive: PageSize and pagesize are the same key',
        'appsettings files are reloaded automatically when changed (reloadOnChange: true)',
        'Set appsettings*.json "Copy to Output Directory" is handled by the SDK automatically for web projects',
      ],
    },
    {
      heading: 'Reading configuration: IConfiguration and the Options pattern',
      content: `**IConfiguration** is registered in DI automatically. Inject it and read values:

| Code | Returns |
|---|---|
| \`_config["PortalSettings:SiteName"]\` | string or null |
| \`_config.GetValue<int>("PortalSettings:PageSize", 10)\` | converted value, with default |
| \`_config.GetSection("PortalSettings")\` | a sub-section (IConfigurationSection) |
| \`_config.GetConnectionString("StudentDb")\` | shortcut for \`ConnectionStrings:StudentDb\` |
| \`_config.GetSection("PortalSettings").Get<PortalSettings>()\` | binds the section to an object |

**Options pattern** (recommended for groups of settings): create a plain class whose property names match the JSON, register it with \`builder.Services.Configure<PortalSettings>(builder.Configuration.GetSection("PortalSettings"))\` or \`AddOptions<T>().Bind(...).ValidateDataAnnotations().ValidateOnStart()\`, then inject one of:

| Interface | Lifetime | Sees file changes? | Use in |
|---|---|---|---|
| \`IOptions<T>\` | Singleton | No (read once) | anywhere, settings that never change |
| \`IOptionsSnapshot<T>\` | Scoped | Yes, per request | controllers, scoped services |
| \`IOptionsMonitor<T>\` | Singleton | Yes, live + OnChange event | singletons, background services |

Benefits: strong typing, IntelliSense, validation at startup, no magic strings scattered in the code.`,
    },
    {
      heading: 'Environments: Development, Staging, Production',
      content: `The current environment comes from the **ASPNETCORE_ENVIRONMENT** environment variable (or DOTNET_ENVIRONMENT). If it is not set, the default is **Production** – a safe default.

**Where it is set**
- On your PC: **Properties/launchSettings.json** profiles (Visual Studio: *Project > Properties > Debug > General > Open debug launch profiles UI*, or the run-button dropdown to choose a profile). This file is NOT deployed.
- CLI: \`dotnet run --environment Production\` or \`dotnet run --launch-profile https-production\`
- Windows: \`setx ASPNETCORE_ENVIRONMENT Staging\` (new terminal needed); PowerShell session: \`$env:ASPNETCORE_ENVIRONMENT="Staging"\`
- IIS: \`<environmentVariable>\` in web.config; Azure App Service: *Configuration > Application settings*.

**Using it in code**
- \`app.Environment.IsDevelopment()\`, \`IsStaging()\`, \`IsProduction()\`, \`IsEnvironment("QA")\`
- inject \`IWebHostEnvironment\` (EnvironmentName, ContentRootPath, WebRootPath)
- in Razor: \`<environment include="Development">...</environment>\` and \`exclude="Development"\`

Typical differences: Development → developer exception page, LocalDB, Debug logs, unminified JS. Production → friendly error page, HSTS, real SQL Server, Warning logs, minified bundles, secrets from environment variables / Azure Key Vault.`,
    },
    {
      heading: 'Secrets: never commit passwords',
      content: `appsettings.json is committed to Git, so it must **not** contain real passwords, API keys or JWT signing keys.

**Development → User Secrets**
- Visual Studio: right-click the project > **Manage User Secrets** – opens secrets.json (stored in %APPDATA%/Microsoft/UserSecrets/<id>/ on Windows, ~/.microsoft/usersecrets/<id>/ on Linux/macOS).
- CLI: \`dotnet user-secrets init\` then \`dotnet user-secrets set "ConnectionStrings:StudentDb" "Server=...;Password=..."\` and \`dotnet user-secrets list\`.
- The values override appsettings.json automatically in Development (same key names).

**Production → environment variables / Azure App Service settings / Azure Key Vault.** Example: \`ConnectionStrings__StudentDb=Server=...\`.

User Secrets are **not encrypted** – they just live outside the project folder so they never reach Git.`,
      tip: 'Add a placeholder like "SET-IN-SECRETS" in appsettings.json so other developers know which keys they must provide.',
    },
    {
      heading: 'Logging with ILogger',
      content: `ASP.NET Core has a built-in logging API (\`Microsoft.Extensions.Logging\`). Inject **\`ILogger<T>\`** – T becomes the **category** (usually the class name) – and call:

| Method | Level (number) | When to use |
|---|---|---|
| \`LogTrace\` | Trace (0) | very detailed, step-by-step; may contain sensitive data – never in production |
| \`LogDebug\` | Debug (1) | developer diagnostics |
| \`LogInformation\` | Information (2) | normal flow: "Student 5 created" |
| \`LogWarning\` | Warning (3) | unexpected but handled: "Student 99 not found", slow query |
| \`LogError\` | Error (4) | operation failed: exception while saving |
| \`LogCritical\` | Critical (5) | app-wide failure: database down, disk full |
| — | None (6) | turn logging off for a category |

**Filtering**: the \`Logging:LogLevel\` section sets the **minimum** level per category. Messages below the minimum are skipped (cheap). The most specific category prefix wins: \`"Microsoft.AspNetCore": "Warning"\` hides framework info logs while \`"Default": "Information"\` applies to your code.

**Providers** (where logs go): Console, Debug (VS Output window), EventSource, EventLog (Windows). Default template: Console + Debug + EventSource (+ EventLog on Windows). For files/databases/Seq use **Serilog** or NLog.

**Structured logging – message templates**: write \`_logger.LogInformation("Created student {StudentId} {Name}", id, name)\`, NOT string interpolation \`$"Created {id}"\`. The placeholders are stored as named properties (StudentId=5) that you can search and filter in tools like Seq, Elastic or Application Insights, and formatting is skipped when the level is disabled.

**Exceptions**: pass the exception as the **first** argument: \`_logger.LogError(ex, "Failed to save {Name}", name)\`.`,
      syntax: `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}`,
    },
  ],
  examples: [
    {
      title: 'Simulate configuration layering (console)',
      scenario: 'Before touching ASP.NET Core, see exactly how appsettings.json, appsettings.{Environment}.json and environment variables are merged and which value wins.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it ConfigLayering > Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Add a "ConnectionStrings:StudentDb" entry to environmentVariables (as ConnectionStrings__StudentDb) and predict the new output',
      ],
      code: configSimCode,
      csharp: { files: { 'Program.cs': configSimCode }, stdin: '' },
      result: `=== ASPNETCORE_ENVIRONMENT = Development ===
  + loaded appsettings.json (4 key(s))
  + loaded appsettings.Development.json (3 key(s))
  + loaded environment variables (1 key(s))
SiteName   = Student Portal (Azure)
PageSize   = 5
ShowErrors = true
Database   = Server=localhost;Database=StudentDB_Dev

=== ASPNETCORE_ENVIRONMENT = Production ===
  + loaded appsettings.json (4 key(s))
  + loaded appsettings.Production.json (1 key(s))
  + loaded environment variables (1 key(s))
SiteName   = Student Portal (Azure)
PageSize   = 25
ShowErrors = false
Database   = Server=PROD-SQL;Database=StudentDB
`,
      explanation: `Each provider is applied on top of the previous one; a key that appears again simply replaces the old value. In Development the Development file changes PageSize, ShowErrors and the database; in Production only PageSize changes and the other values stay from appsettings.json. The environment variable AppSettings__SiteName is converted to AppSettings:SiteName and overrides the site name in BOTH environments because environment variables are loaded later. The real ConfigurationBuilder does exactly this.`,
    },
    {
      title: 'Development and production settings with the Options pattern',
      scenario: 'The Student Portal shows 5 students per page with detailed errors on the developer PC, but 25 per page with a friendly error page on the live server, using LocalDB in development and the real SQL Server in production.',
      steps: [
        'Open the StudentPortal MVC project',
        'In Solution Explorer expand appsettings.json (click the arrow) to see appsettings.Development.json; right-click the project > Add > New Item > App Settings File > name it appsettings.Production.json',
        'Paste the three JSON files. Add Models/PortalSettings.cs',
        'Update Program.cs with AddOptions<PortalSettings>()...ValidateOnStart()',
        'Add Controllers/SettingsController.cs and Views/Settings/Index.cshtml (right-click the Index action > Add View)',
        'Open Properties/launchSettings.json and add the "https-production" profile',
        'Run with the "https" profile (Ctrl+F5) and open /Settings',
        'Pick "https-production" in the green Run button dropdown, run again and compare. (CLI: dotnet run --launch-profile https-production)',
        'Change PageSize in appsettings.json to 0, run: the app stops with an OptionsValidationException',
      ],
      code: settingsCode,
      result: `Profile "https" (Development) - /Settings:
City College Student Portal
Environment     Development
Page size       5 (IConfiguration says 5)
Detailed errors True
Database        Database=StudentDB_Dev
Support         support@citycollege.edu
[yellow box] DEVELOPMENT MODE - test data only

Profile "https-production" (Production) - /Settings:
Environment     Production
Page size       25 (IConfiguration says 25)
Detailed errors False
Database        Database=StudentDB
Live system

With "PageSize": 0 the app fails at startup:
Microsoft.Extensions.Options.OptionsValidationException: DataAnnotation validation failed for 'PortalSettings' members: 'PageSize' with the error: 'The field PageSize must be between 1 and 100.'`,
      explanation: `appsettings.json holds the production-ready defaults and the Development file overrides only the differences. The PortalSettings class gives typed access and DataAnnotations validation; ValidateOnStart makes a wrong config fail immediately at startup instead of in the middle of a user request. IOptionsSnapshot re-reads the file per request, so editing appsettings.json while the app runs changes the page after a refresh. The environment Tag Helper shows the warning banner only in Development. Note how we never display the full connection string.`,
    },
    {
      title: 'Logging in a controller with levels and message templates',
      scenario: 'Support staff need to know when students are created, when someone asks for a non-existent student, and the full error when saving fails.',
      steps: [
        'Open Controllers/StudentController.cs and inject ILogger<StudentController> in the constructor',
        'Add the LogDebug / LogInformation / LogWarning / LogError calls as shown',
        'Update the Logging section of appsettings.Development.json',
        'Press F5, open /Student, /Student/Details/99 and create a student',
        'Watch the console window (or View > Output > "ASP.NET Core Web Server")',
        'Change "Default" to "Warning" in appsettings.Development.json, save (no restart needed) and refresh /Student – the info lines disappear',
      ],
      code: loggingWebCode,
      result: `Console (SingleLine simple formatter; times will differ):
10:15:02 dbug: StudentPortal.Controllers.StudentController[0] Index() called at 11/17/2026 04:45:02
10:15:02 info: StudentPortal.Controllers.StudentController[0] Listed 3 students
10:15:09 warn: StudentPortal.Controllers.StudentController[0] Student 99 not found
10:15:20 info: StudentPortal.Controllers.StudentController[0] Created student 4 Kiran Rao

If saving throws:
10:16:01 fail: StudentPortal.Controllers.StudentController[0] Failed to create student Kiran Rao System.InvalidOperationException: ...stack trace...

After setting "Default": "Warning" (category rule for StudentController removed): only the warn/fail lines appear.`,
      explanation: `The category is the full class name, so you can raise or lower the level for one controller only. The [0] is the EventId (0 when not provided). Templates like {StudentId} keep the values as structured properties; the console provider just renders them as text. LogError(ex, ...) logs the whole exception including its stack trace. Logging configuration is reloaded when the JSON file changes, which is very handy on a live server.`,
    },
    {
      title: 'How log level filtering works (console)',
      scenario: 'Build a tiny logger with the same LogLevel numbers and template formatting as ILogger to see which messages pass the minimum level.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it LogLevelDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Change the first minimum level to LogLevel.None and predict the output',
      ],
      code: loggerSimCode,
      csharp: { files: { 'Program.cs': loggerSimCode }, stdin: '' },
      result: `--- Minimum level: Information (typical Development) ---
info: StudentController: Listed 3 students
warn: StudentController: Student 99 not found
fail: StudentController: Could not save student Ravi
crit: StudentController: Database StudentDB is offline
--- Minimum level: Warning (typical Production) ---
warn: StudentController: Student 99 not found
fail: StudentController: Could not save student Ravi
crit: StudentController: Database StudentDB is offline
--- Minimum level: Trace (debugging a problem) ---
trce: StudentController: Entering Index
dbug: StudentController: Query returned 3 rows in 12 ms`,
      explanation: `LogLevel is an enum where a higher number means more serious. "if (level < MinLevel) return;" drops everything below the minimum, which is what the "LogLevel" configuration does for each category. The short names trce/dbug/info/warn/fail/crit are the same ones printed by the real console logger. Each {Placeholder} is replaced by the next argument in order – the names in the template do not need to match variable names, only the ORDER matters.`,
    },
  ],
  interview: [
    { q: 'In which order are configuration providers loaded by WebApplication.CreateBuilder?', a: 'appsettings.json, appsettings.{Environment}.json, User Secrets (Development only), environment variables, command-line arguments. Later providers override earlier ones.', level: 'Medium' },
    { q: 'How do you represent a nested key in an environment variable?', a: 'Use double underscore instead of colon, e.g. ConnectionStrings__StudentDb or PortalSettings__PageSize.', level: 'Easy' },
    { q: 'What is the default environment if ASPNETCORE_ENVIRONMENT is not set?', a: 'Production.', level: 'Easy' },
    { q: 'Difference between IOptions, IOptionsSnapshot and IOptionsMonitor?', a: 'IOptions is singleton and read once. IOptionsSnapshot is scoped and recomputed per request (sees file changes). IOptionsMonitor is singleton, always returns the current value and supports OnChange notifications.', level: 'Hard' },
    { q: 'Is launchSettings.json used on the production server?', a: 'No. It is only used by Visual Studio / dotnet run on the developer machine. On a server the environment is set by real environment variables, web.config or hosting settings.', level: 'Medium' },
    { q: 'Where should you store a database password during development?', a: 'In User Secrets (right-click project > Manage User Secrets or dotnet user-secrets set), never in appsettings.json committed to Git.', level: 'Easy' },
    { q: 'What does GetConnectionString("StudentDb") read?', a: 'The key ConnectionStrings:StudentDb.', level: 'Easy' },
    { q: 'List the log levels from lowest to highest.', a: 'Trace, Debug, Information, Warning, Error, Critical (and None to disable).', level: 'Easy' },
    { q: 'Output question: Default level is Warning. Which of LogDebug, LogInformation, LogWarning, LogError are written?', a: 'Only LogWarning and LogError.', level: 'Medium' },
    { q: 'Why use message templates instead of string interpolation in logs?', a: 'Templates keep named properties for structured logging (searchable/filterable) and avoid string formatting cost when the level is disabled. Interpolation produces a flat string.', level: 'Medium' },
    { q: 'How do you show HTML only in Development in a Razor view?', a: 'Use the environment tag helper: <environment include="Development">...</environment>, or inject IWebHostEnvironment and check IsDevelopment().', level: 'Easy' },
    { q: 'How can you validate configuration at startup?', a: 'AddOptions<T>().Bind(section).ValidateDataAnnotations().ValidateOnStart() (or .Validate(lambda)). Invalid settings throw OptionsValidationException when the app starts.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add an "EmailSettings" section (SmtpHost, Port, FromAddress) to appsettings.json, bind it to an EmailSettings class with the Options pattern and display the values on /Settings/Email.',
      hint: 'builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings")); inject IOptions<EmailSettings>.',
      solution: `// appsettings.json
"EmailSettings": { "SmtpHost": "smtp.citycollege.edu", "Port": 587, "FromAddress": "noreply@citycollege.edu" }
// Models/EmailSettings.cs
public class EmailSettings { public string SmtpHost { get; set; } = ""; public int Port { get; set; } public string FromAddress { get; set; } = ""; }
// Program.cs
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
// SettingsController
public IActionResult Email([FromServices] IOptions<EmailSettings> opt)
    => Content($"{opt.Value.SmtpHost}:{opt.Value.Port} from {opt.Value.FromAddress}");`,
    },
    {
      task: 'Create a Staging environment: add appsettings.Staging.json with PageSize 15 and a launch profile "https-staging". Show "STAGING" in the layout only in that environment.',
      hint: 'Use <environment include="Staging"> in _Layout.cshtml.',
      solution: `// appsettings.Staging.json
{ "PortalSettings": { "PageSize": 15 } }
// launchSettings.json profile
"https-staging": { "commandName": "Project", "applicationUrl": "https://localhost:7086", "environmentVariables": { "ASPNETCORE_ENVIRONMENT": "Staging" } }
// _Layout.cshtml
<environment include="Staging"><div class="bg-info text-center">STAGING</div></environment>`,
    },
    {
      task: 'Move the connection string password into User Secrets and verify it overrides appsettings.json.',
      hint: 'Right-click project > Manage User Secrets, or dotnet user-secrets set.',
      solution: `cd StudentPortal
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:StudentDb" "Server=localhost;Database=StudentDB_Dev;User Id=sa;Password=MyDevPass#1;TrustServerCertificate=True"
dotnet user-secrets list
// Run in Development: GetConnectionString("StudentDb") now returns the secret value.`,
    },
    {
      task: 'Configure logging so that your app logs Debug and above, but Microsoft.* logs only Warning and above, and EF Core SQL commands are shown at Information.',
      hint: 'Most specific category wins.',
      solution: `"Logging": {
  "LogLevel": {
    "Default": "Debug",
    "Microsoft": "Warning",
    "Microsoft.EntityFrameworkCore.Database.Command": "Information"
  }
}`,
    },
    {
      task: 'Write a startup log line in Program.cs that prints the environment name and site name after the app is built.',
      hint: 'app.Logger is available after builder.Build().',
      solution: `var app = builder.Build();
app.Logger.LogInformation("Starting {Site} in {Env} environment",
    app.Configuration["PortalSettings:SiteName"], app.Environment.EnvironmentName);`,
    },
  ],
  quiz: [
    {
      question: 'appsettings.json has PageSize 25, appsettings.Development.json has PageSize 5 and the environment variable PortalSettings__PageSize=50 is set. In Development, what is PageSize?',
      options: ['25', '5', '50', 'An exception is thrown'],
      answer: 2,
      explanation: 'Environment variables are loaded after the JSON files, so they override both.',
    },
    {
      question: 'Which interface should a controller use to see appsettings.json changes on the next request?',
      options: ['IOptionsSnapshot<T>', 'IOptions<T>', 'IConfigurationBuilder', 'IHostEnvironment'],
      answer: 0,
      explanation: 'IOptionsSnapshot is scoped and recomputed for every request.',
    },
    {
      question: 'Which environment variable selects the ASP.NET Core environment?',
      options: ['DOTNET_MODE', 'APP_ENV', 'ASPNETCORE_URLS', 'ASPNETCORE_ENVIRONMENT'],
      answer: 3,
      explanation: 'ASPNETCORE_ENVIRONMENT (or DOTNET_ENVIRONMENT) sets IWebHostEnvironment.EnvironmentName.',
    },
    {
      question: 'Minimum level is Information. Which call is NOT written?',
      options: ['LogWarning', 'LogDebug', 'LogError', 'LogInformation'],
      answer: 1,
      explanation: 'Debug (1) is lower than Information (2), so it is filtered out.',
    },
    {
      question: 'What is the correct way to log an exception?',
      options: ['_logger.LogError("Error: " + ex)', '_logger.LogError($"{ex.Message}")', '_logger.LogError(ex, "Failed to save {Name}", name)', 'Console.WriteLine(ex)'],
      answer: 2,
      explanation: 'Passing the exception object first records the full exception and stack trace, and the template keeps structured data.',
    },
  ],
};
