export default {
  lesson: 'day-074-configuration-environments-logging',
  minutes: 30,
  intro: 'Bind configuration sections to classes with the Options pattern, switch behaviour per environment and write useful logs with ILogger and log levels.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'The same key `ConnectionStrings:Default` is set in appsettings.json AND as an **environment variable** on the server. Which value does the app use (default host setup)?',
      options: ['appsettings.json', 'The environment variable', 'Whichever is shorter', 'The app throws a duplicate-key error'],
      answer: 1,
      explain: 'Default provider order: appsettings.json → appsettings.{Env}.json → user secrets (Development) → **environment variables** → command line. Later providers win, which is how servers override settings without editing files.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'appsettings.json has a section `"Smtp": { "Host": "...", "Port": 587 }` bound with `builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));`. Complete the constructor parameter type that injects it:\n`public EmailService(______ options) { _smtp = options.Value; }`',
      example: { title: 'options that reload', code: 'public ReportService(IOptionsSnapshot<ReportSettings> opts) { ... }' },
      accept: ['IOptions<SmtpSettings>', 'IOptionsSnapshot<SmtpSettings>', 'IOptionsMonitor<SmtpSettings>'],
      acceptRegex: ['^IOptions(Snapshot|Monitor)?<\\s*SmtpSettings\\s*>$'],
      caseSensitive: true,
      explain: 'The **Options pattern** gives a strongly typed settings class instead of magic strings like `cfg["Smtp:Port"]`. `IOptions<T>` reads once; `IOptionsSnapshot<T>` re-reads per request; `IOptionsMonitor<T>` notifies on change (`.CurrentValue`).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The minimum log level is configured as `"Default": "Warning"`. Which messages are written? Type them one per line in order.',
      example: { title: 'the level order', code: 'Trace < Debug < Information < Warning < Error < Critical' },
      code: `// appsettings.json
"Logging": { "LogLevel": { "Default": "Warning" } }

_logger.LogDebug("Loading students");
_logger.LogInformation("Found {Count} students", 42);
_logger.LogWarning("Slow query {Ms} ms", 1200);
_logger.LogError("Payment failed for order {Id}", 7);
_logger.LogCritical("Database unreachable");`,
      expected: `Slow query 1200 ms
Payment failed for order 7
Database unreachable`,
      explain: 'Only messages at the minimum level **or higher** are written: Warning, Error, Critical. The `{Count}`/`{Ms}` placeholders are **structured logging** - the value is filled in and also stored as a named property for searching.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are good logging practices? (choose all that apply)',
      options: [
        'Use message templates: _logger.LogInformation("Order {Id} placed", id)',
        'Log passwords and full card numbers to help debugging',
        'Use LogError with the exception object: _logger.LogError(ex, "Save failed")',
        'Use a lower level such as Debug for noisy details and keep Production at Information/Warning',
        'Use Console.WriteLine instead of ILogger in controllers',
      ],
      answers: [0, 2, 3],
      explain: 'Templates keep logs searchable, passing `ex` records the stack trace, and levels control noise per environment. Never log secrets or personal data, and prefer `ILogger<T>` (it goes to every configured provider: console, file, Application Insights...).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Where should a developer keep the SQL password while working locally, so it is never committed to Git?',
      options: ['appsettings.json', 'Program.cs as a constant', 'User Secrets (dotnet user-secrets set ...)', 'launchSettings.json'],
      answer: 2,
      explain: '**User Secrets** are stored in your user profile, outside the project folder, and loaded automatically in Development. In production use environment variables or Azure Key Vault.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Write a mini logger.** `createLogger(minLevel)` returns `{ log(level, template, ...args), lines }`. Levels in order: `Trace, Debug, Information, Warning, Error, Critical`. `log` ignores messages below `minLevel`; otherwise it replaces each `{Placeholder}` in the template with the next argument (in order) and pushes `"[Level] message"` to `lines`.',
      example: { title: 'replacing placeholders in order', code: 'let i = 0;\n"Hi {Name}, {Age}".replace(/\\{\\w+\\}/g, () => args[i++]);' },
      starter: 'function createLogger(minLevel) {\n  const lines = [];\n  // TODO\n  return { log() {}, lines };\n}\n',
      solution: 'function createLogger(minLevel) {\n  const levels = ["Trace", "Debug", "Information", "Warning", "Error", "Critical"];\n  const lines = [];\n  function log(level, template, ...args) {\n    if (levels.indexOf(level) < levels.indexOf(minLevel)) return;\n    let i = 0;\n    const msg = template.replace(/\\{\\w+\\}/g, () => String(args[i++]));\n    lines.push("[" + level + "] " + msg);\n  }\n  return { log, lines };\n}\n',
      tests: [
        { call: '(() => { const l = createLogger("Warning"); l.log("Information", "Found {Count}", 3); l.log("Warning", "Slow query {Ms} ms", 1200); l.log("Error", "Order {Id} failed for {User}", 7, "asha"); return l.lines; })()', expect: ['[Warning] Slow query 1200 ms', '[Error] Order 7 failed for asha'], msg: 'Only Warning and above must be logged, with placeholders filled in order' },
        { call: '(() => { const l = createLogger("Trace"); l.log("Debug", "Start"); return l.lines; })()', expect: ['[Debug] Start'], msg: 'With minLevel Trace everything is logged' },
      ],
      explain: 'This mirrors `ILogger`: a configurable minimum level filters cheaply before formatting, and message templates fill named holes in order. In .NET the names also become structured properties you can query in Seq or Application Insights.',
    },
  ],
};
