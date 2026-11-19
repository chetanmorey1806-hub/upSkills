export default {
  lesson: 'day-117-publishing-iis-azure-app-service',
  minutes: 28,
  intro: 'Publish an ASP.NET Core app in Release mode, host it on IIS or Azure App Service, and configure the environment and connection strings on the server.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the command that builds an optimised **Release** version into the `./publish` folder:\n`dotnet publish -c ______ -o ./publish`',
      example: { title: 'running the published app', code: 'cd publish\ndotnet StudentApi.dll' },
      accept: ['Release'],
      explain: '`-c Release` turns on compiler optimisations and excludes debug-only behaviour. The output folder contains your DLLs, dependencies, appsettings files and wwwroot - that is what you copy to IIS or deploy to Azure.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Hosting on a Windows server with **IIS**: what must be installed so IIS can run an ASP.NET Core app?',
      options: ['The full Visual Studio IDE', 'The .NET Hosting Bundle (runtime + ASP.NET Core Module)', 'SQL Server Management Studio', 'Node.js'],
      answer: 1,
      explain: 'The **Hosting Bundle** installs the .NET runtime and the ASP.NET Core Module (ANCM), which lets IIS forward requests to your app (in-process or to Kestrel). The app pool should use "No Managed Code".',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The published app runs on Azure App Service with these settings. What does `/config` return? (Type the exact text.)',
      example: { title: 'double underscore = colon', code: 'App setting  Logging__LogLevel__Default = Warning\n→ configuration key "Logging:LogLevel:Default"' },
      code: `// appsettings.json (published)
{ "ConnectionStrings": { "Default": "Server=.;Database=College;Trusted_Connection=True" },
  "Features": { "ShowBeta": true } }

// Azure App Service → Configuration (environment variables)
ASPNETCORE_ENVIRONMENT        = Production
ConnectionStrings__Default    = Server=tcp:college.database.windows.net;Database=College;...
Features__ShowBeta            = false

app.MapGet("/config", (IConfiguration c, IWebHostEnvironment env) =>
    $"{env.EnvironmentName}|{c.GetConnectionString("Default")!.Split(';')[0]}|{c["Features:ShowBeta"]}");`,
      expected: 'Production|Server=tcp:college.database.windows.net|false',
      explain: 'Environment variables override appsettings.json, and `__` (double underscore) maps to the `:` separator. That is how the server gets the Azure SQL connection string without changing the published files - and why secrets never need to be in the repo.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about deployment are TRUE? (choose all that apply)',
      options: [
        'ASPNETCORE_ENVIRONMENT should be Production on the live server (default when not set)',
        'Connection strings for production should come from App Service settings or Key Vault, not appsettings.json in Git',
        'Migrations must be applied to the production database (script or bundle) before the new code needs them',
        'You publish in Debug mode to get better error pages for users',
        'Azure App Service can deploy straight from GitHub Actions or Visual Studio "Publish"',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Production = Release build, Production environment, secrets from the platform, and the database schema updated as part of the release. Debug builds are slower and developer error pages leak information.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'When the environment variable is **not set at all**, which environment name does ASP.NET Core use?\n`app.Environment.EnvironmentName == "______"`',
      example: { title: 'setting it in PowerShell', code: '$env:ASPNETCORE_ENVIRONMENT = "Staging"' },
      accept: ['Production'],
      caseSensitive: true,
      explain: 'The default is **Production** - a safe default, because a forgotten setting never exposes development features. Locally, launchSettings.json sets Development for you.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'After deploying, the site shows **HTTP Error 500.30 - ASP.NET Core app failed to start**. What is the best first step?',
      options: [
        'Reinstall Windows',
        'Check the logs (stdout log in web.config / App Service Log stream / Event Viewer) for the startup exception, e.g. a missing connection string',
        'Switch to Debug mode in production permanently',
        'Delete wwwroot',
      ],
      answer: 1,
      explain: '500.30 means the process crashed during startup - usually a configuration problem (missing setting, wrong connection string, missing runtime). The startup exception in the logs tells you exactly what failed.',
    },
  ],
};
