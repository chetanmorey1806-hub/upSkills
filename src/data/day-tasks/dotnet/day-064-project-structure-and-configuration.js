export default {
  lesson: 'day-064-project-structure-and-configuration',
  minutes: 25,
  intro: 'Find your way around an ASP.NET Core project: Program.cs, appsettings.json, launchSettings.json and the environment-specific settings files.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which file decides the URLs/ports and the `ASPNETCORE_ENVIRONMENT` value used when you press **F5 / dotnet run** on your machine?',
      options: ['appsettings.json', 'Properties/launchSettings.json', 'Program.cs', 'the .csproj file'],
      answer: 1,
      explain: '`Properties/launchSettings.json` holds local **launch profiles** (applicationUrl, environment variables). It is used only on the developer machine - it is not deployed to the server, where the environment is set by the host.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the files to their purpose. Which statements are TRUE? (choose all that apply)',
      options: [
        'The .csproj lists the target framework and NuGet package references',
        'appsettings.Development.json overrides values from appsettings.json when the environment is Development',
        'wwwroot holds static files such as CSS, JS and images',
        'Program.cs is generated at build time and should not be edited',
        'launchSettings.json is the place for production connection strings',
      ],
      answers: [0, 1, 2],
      explain: 'The .csproj defines framework + packages, wwwroot serves static files, and appsettings.{Environment}.json is layered on top of appsettings.json. Program.cs is YOUR startup code (services + middleware). Production secrets belong in the host\'s environment variables / Key Vault, never in launchSettings.json.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'appsettings.json contains `"AppName": "UpSkillr"`. Complete the line in Program.cs that reads it:\n`var name = builder.Configuration[______];`',
      example: { title: 'reading a nested key', code: 'var level = builder.Configuration["Logging:LogLevel:Default"];' },
      accept: ['"AppName"'],
      caseSensitive: false,
      explain: 'The configuration indexer takes the key as a string. Nested sections are joined with a **colon** (`"Section:Key"`). Keys are case-insensitive in .NET configuration.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The app runs with `ASPNETCORE_ENVIRONMENT=Development`. What does the endpoint return for `/info`? (Type the exact text.)',
      example: { title: 'later sources win', code: 'appsettings.json            → "Theme": "Light"\nappsettings.Development.json → "Theme": "Dark"\nResult in Development        → Dark' },
      code: `// appsettings.json
{ "Site": { "Title": "UpSkillr", "PageSize": 10 }, "Support": "help@upskillr.in" }

// appsettings.Development.json
{ "Site": { "PageSize": 3 } }

// Program.cs
app.MapGet("/info", (IConfiguration cfg) =>
    $"{cfg["Site:Title"]}|{cfg["Site:PageSize"]}|{cfg["Support"]}|{app.Environment.EnvironmentName}");`,
      expected: 'UpSkillr|3|help@upskillr.in|Development',
      explain: 'Configuration files are **merged key by key**: the Development file overrides only `Site:PageSize`; `Site:Title` and `Support` still come from appsettings.json. A common mistake is thinking the environment file replaces the whole `Site` section.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which code runs the developer exception page **only** in Development?',
      options: ['if (app.Environment.IsDevelopment()) app.UseDeveloperExceptionPage();', 'app.UseDeveloperExceptionPage("Development");', 'builder.Services.AddDeveloperPage();', '#if DEVELOPMENT app.UseDeveloperExceptionPage(); #endif'],
      answer: 0,
      explain: '`app.Environment.IsDevelopment()` reads `ASPNETCORE_ENVIRONMENT` at run time. Showing stack traces in Production would leak internal details to attackers, so production uses `UseExceptionHandler("/Error")` instead.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Configuration layering in JavaScript.** Write `mergeConfig(base, override)` that returns a NEW object where values from `override` win, and nested objects are merged **key by key** (like appsettings.json + appsettings.Development.json). Do not change the inputs.',
      example: { title: 'checking for a plain object', code: 'const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);' },
      starter: 'function mergeConfig(base, override) {\n  // TODO\n}\n',
      solution: 'function mergeConfig(base, override) {\n  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);\n  const out = { ...base };\n  for (const [k, v] of Object.entries(override)) {\n    out[k] = isObj(v) && isObj(base[k]) ? mergeConfig(base[k], v) : v;\n  }\n  return out;\n}\n',
      tests: [
        { call: 'mergeConfig({ Site: { Title: "UpSkillr", PageSize: 10 }, Support: "help@upskillr.in" }, { Site: { PageSize: 3 } })', expect: { Site: { Title: 'UpSkillr', PageSize: 3 }, Support: 'help@upskillr.in' }, msg: 'Only Site.PageSize must change; Site.Title must survive' },
        { call: 'mergeConfig({ A: 1 }, { B: { C: 2 } })', expect: { A: 1, B: { C: 2 } }, msg: 'New keys from override must be added' },
        { call: '(() => { const b = { S: { X: 1 } }; mergeConfig(b, { S: { X: 2 } }); return b.S.X; })()', expect: 1, msg: 'The base object must not be modified' },
      ],
      explain: 'This is what the .NET configuration system does with its providers (JSON files, environment variables, command line): each later source overrides individual keys, not whole sections.',
    },
  ],
};
