export default {
  lesson: 'extra-44-exception-handling-logging-health-checks',
  minutes: 25,
  intro: 'Handle errors globally, write structured logs with ILogger and log levels, and expose health check endpoints.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: `\`appsettings.json\` sets \`"Logging": { "LogLevel": { "Default": "Warning" } }\`. Which messages are written? Write them one per line in the order they appear.`,
      example: { title: 'log level order', code: 'Trace < Debug < Information < Warning < Error < Critical' },
      code: `_logger.LogDebug("Loading cart {CartId}", 12);
_logger.LogInformation("User {User} logged in", "asha");
_logger.LogWarning("Stock low for {Sku}", "PEN-01");
_logger.LogError("Payment failed for order {OrderId}", 501);
_logger.LogCritical("Database unreachable");`,
      expected: `Stock low for PEN-01
Payment failed for order 501
Database unreachable`,
      explain: 'The minimum level is Warning, so only Warning, Error and Critical are written. Placeholders like `{Sku}` are filled with the arguments and also stored as structured properties that tools like Seq or Application Insights can filter on.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Log an error **with the exception object** (so the stack trace is kept) inside a catch block:
\`catch (Exception ex) { _logger.LogError(______, "Order {Id} failed", id); }\``,
      example: { title: 'structured message', code: '_logger.LogInformation("Order {Id} placed by {User}", order.Id, user);' },
      accept: ['ex'],
      caseSensitive: true,
      explain: 'The overload `LogError(Exception, string, params object[])` takes the exception **first**. Writing `$"Order {id} failed: {ex.Message}"` loses the stack trace and the structured properties.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which line adds a **global** handler that catches unhandled exceptions in production and returns a safe error response?',
      options: ['`app.UseDeveloperExceptionPage();` in production', '`app.UseExceptionHandler("/error");` (or with `AddProblemDetails()`)', 'A try/catch in every controller action', '`app.UseHttpsRedirection();`'],
      answer: 1,
      explain: '`UseExceptionHandler` catches exceptions from later middleware, logs them and re-executes a safe error path or writes ProblemDetails. The developer exception page shows stack traces and must only run in Development. Repeating try/catch in every action is noisy and easy to forget.',
    },
    {
      type: 'output',
      mins: 4,
      q: `A custom exception middleware is registered first. A request hits an action that throws \`KeyNotFoundException("Order 77 not found")\`. What **status code** and **JSON body** does the client get? (status on line 1, compact JSON on line 2)`,
      example: { title: 'middleware wraps the pipeline', code: `try { await next(context); }
catch (Exception ex) { /* map and write the response */ }` },
      code: `app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = ex switch
        {
            KeyNotFoundException => 404,
            ArgumentException => 400,
            _ => 500
        };
        await context.Response.WriteAsJsonAsync(new { error = ex.Message, status = context.Response.StatusCode });
    }
});`,
      expected: `404
{"error":"Order 77 not found","status":404}`,
      explain: 'The exception bubbles up to the middleware, the switch maps `KeyNotFoundException` to 404, and `WriteAsJsonAsync` serializes the anonymous object with camelCase web defaults (`error`, `status`). Unknown exceptions would become 500 without leaking details.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Expose the registered health checks at \`/health\`:
\`builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();\`
\`app.______("/health");\``,
      example: { title: 'custom check', code: `builder.Services.AddHealthChecks()
    .AddCheck("disk", () => HealthCheckResult.Healthy());` },
      accept: ['MapHealthChecks'],
      caseSensitive: true,
      explain: '`MapHealthChecks("/health")` runs all checks and returns 200 with "Healthy" (or 503 "Unhealthy"). Load balancers, Kubernetes probes and uptime monitors call this URL.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are good logging practices? Select all that apply.',
      options: ['Use message templates with placeholders instead of string interpolation', 'Log passwords and full card numbers to help debugging', 'Inject `ILogger<T>` so the category is the class name', 'Use Information/Warning/Error levels appropriately', 'Log every loop iteration at Information level in production'],
      answers: [0, 2, 3],
      explain: 'Templates keep logs structured and cheap, `ILogger<T>` gives a useful category, and correct levels let you filter noise. Never log secrets or personal data, and keep high-volume detail at Debug/Trace.',
    },
  ],
};
