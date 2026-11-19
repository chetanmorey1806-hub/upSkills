export default {
  lesson: 'day-073-middleware-custom-middleware-exception-handling',
  minutes: 32,
  intro: 'Order the built-in middleware correctly, write your own middleware class and handle exceptions globally so users never see a stack trace.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where should `app.UseExceptionHandler("/Error")` be placed in Program.cs?',
      options: ['At the very end, after MapControllers', 'Early in the pipeline, before the middleware whose exceptions it should catch', 'Inside each controller', 'It does not matter'],
      answer: 1,
      explain: 'Middleware only catches exceptions thrown by components **after** it (inside its `next()`). That is why the exception handler is registered first, followed by HTTPS redirection, static files, routing, authentication, authorization and endpoints.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Your class `RequestTimingMiddleware` has `InvokeAsync(HttpContext context)`. Complete the line that adds it to the pipeline:\n`app.______;`',
      example: { title: 'an extension method wrapper', code: 'public static IApplicationBuilder UseRequestTiming(this IApplicationBuilder app)\n    => app.UseMiddleware<RequestTimingMiddleware>();' },
      accept: ['UseMiddleware<RequestTimingMiddleware>()'],
      acceptRegex: ['^UseMiddleware<\\s*RequestTimingMiddleware\\s*>\\(\\s*\\)\\s*;?$', '^UseRequestTiming\\(\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: '`UseMiddleware<T>()` creates the middleware once, passing the `RequestDelegate next` (and singleton services) to its constructor; scoped services go into `InvokeAsync` parameters. Many teams wrap it in a `UseXyz()` extension method.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'A request hits `/fail`. The endpoint throws. What does the client receive? Type the **status code** on line 1 and the **body** on line 2.',
      example: { title: 'catching around next()', code: 'try { await next(context); }\ncatch (Exception ex) { /* log + write an error response */ }' },
      code: `public class ErrorMiddleware
{
    private readonly RequestDelegate _next;
    public ErrorMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        try { await _next(context); }
        catch (KeyNotFoundException) {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsync("Not found");
        }
        catch (Exception) {
            context.Response.StatusCode = 500;
            await context.Response.WriteAsync("Something went wrong");
        }
    }
}

app.UseMiddleware<ErrorMiddleware>();
app.MapGet("/fail", () => { throw new InvalidOperationException("DB down"); });`,
      expected: `500
Something went wrong`,
      explain: '`InvalidOperationException` is not a `KeyNotFoundException`, so the general `catch (Exception)` runs → 500 with a friendly message. Note the internal message "DB down" is **not** sent to the client; log it instead.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'app.Use(...) can call next; app.Run(...) is terminal',
        'UseAuthentication must come before UseAuthorization',
        'A custom middleware class needs an Invoke or InvokeAsync method taking HttpContext',
        'Middleware can only run before the controller, never after',
        'Writing to the response after next() has already started sending it can throw',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Middleware runs both before and after `next()` (that is how timing/logging works). Authentication first identifies the user, then authorization decides access. Once the response has started (headers sent) you can no longer change status or headers.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `app.UseDeveloperExceptionPage()` show, and when should you use it?',
      options: ['A friendly error page; use it in Production', 'The full exception with stack trace; only in Development', 'A 404 page; always', 'Nothing - it only logs'],
      answer: 1,
      explain: 'The developer page reveals stack traces, source lines and request details - great for debugging but a security risk in production. (In .NET 6+ it is enabled automatically in Development.)',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same middleware ideas in Express.**\n1. A custom middleware that counts **every** request in a variable `requests`; `GET /api/stats` returns `{ "requests": <count> }` (the stats call itself is counted).\n2. `GET /api/students/:id` → `200` `{ id, name }` for ids 1-2; for other ids **throw** an error with `status = 404` and message `"Student not found"`.\n3. `GET /api/crash` → throws a normal `Error("DB down")`.\n4. A global error-handling middleware `(err, req, res, next)` that returns `err.status || 500` and JSON `{ "error": <message> }`, but for 500 errors the message must be `"Something went wrong"`.',
      example: { title: 'an error with a status', code: 'const err = new Error("Forbidden");\nerr.status = 403;\nthrow err;' },
      starter: 'const express = require("express");\nconst app = express();\n\nconst students = { 1: "Asha", 2: "Ravi" };\n\n// TODO: counting middleware, routes, error handler\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\nconst students = { 1: "Asha", 2: "Ravi" };\n\nlet requests = 0;\napp.use((req, res, next) => {\n  requests++;\n  next();\n});\n\napp.get("/api/stats", (req, res) => res.json({ requests }));\n\napp.get("/api/students/:id", (req, res) => {\n  const id = Number(req.params.id);\n  if (!students[id]) {\n    const err = new Error("Student not found");\n    err.status = 404;\n    throw err;\n  }\n  res.json({ id, name: students[id] });\n});\n\napp.get("/api/crash", () => {\n  throw new Error("DB down");\n});\n\napp.use((err, req, res, next) => {\n  const status = err.status || 500;\n  res.status(status).json({ error: status === 500 ? "Something went wrong" : err.message });\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'GET existing → 200', steps: [{ method: 'GET', url: '/api/students/1', expect: { status: 200, json: { id: 1, name: 'Asha' } } }] },
        { name: 'middleware counts requests', steps: [{ method: 'GET', url: '/api/students/2' }, { method: 'GET', url: '/api/students/9' }, { method: 'GET', url: '/api/stats', expect: { status: 200, json: { requests: 3 } } }] },
        { name: 'missing → 404 via error handler', steps: [{ method: 'GET', url: '/api/students/5', expect: { status: 404, json: { error: 'Student not found' } } }] },
        { name: 'crash → 500 with safe message', steps: [{ method: 'GET', url: '/api/crash', expect: { status: 500, json: { error: 'Something went wrong' } } }] },
      ],
      explain: 'An Express error handler (4 parameters, registered **last**) plays the role of ASP.NET Core\'s exception middleware: one place turns exceptions into consistent JSON. Never leak internal messages such as "DB down" for 500 errors.',
    },
  ],
};
