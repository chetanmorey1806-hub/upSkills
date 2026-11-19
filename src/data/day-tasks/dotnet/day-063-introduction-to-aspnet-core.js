export default {
  lesson: 'day-063-introduction-to-aspnet-core',
  minutes: 25,
  intro: 'Understand what ASP.NET Core is, how a request flows from Kestrel through the middleware pipeline, and how the CLR runs your compiled app.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is **Kestrel** in an ASP.NET Core application?',
      options: ['The ORM that talks to SQL Server', 'The cross-platform web server built into ASP.NET Core that listens for HTTP requests', 'The Razor view engine', 'A Visual Studio extension for debugging'],
      answer: 1,
      explain: 'Kestrel is the default, cross-platform **web server** inside every ASP.NET Core app. It accepts HTTP connections and hands each request to the middleware pipeline. In production it often sits behind IIS, Nginx or Azure as a reverse proxy.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about ASP.NET Core are TRUE? (choose all that apply)',
      options: [
        'It runs on Windows, Linux and macOS',
        'It has built-in dependency injection',
        'It only runs inside IIS on Windows',
        'Your C# code is compiled to IL, which the CLR JIT-compiles to machine code at run time',
        'It is the same thing as the old ASP.NET Web Forms',
      ],
      answers: [0, 1, 3],
      explain: 'ASP.NET Core is a cross-platform, open-source rewrite with DI, configuration and logging built in. It can be hosted in IIS but does not require it (Kestrel is self-hosted). C# → IL (in the .dll) → JIT → native code by the CLR. Web Forms belongs to the old .NET Framework.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the first line of a minimal `Program.cs` that creates the builder:\n`var builder = ______;`\n`var app = builder.Build();`',
      example: { title: 'the end of Program.cs', code: 'app.MapGet("/", () => "Hello");\napp.Run();' },
      accept: ['WebApplication.CreateBuilder(args)', 'WebApplication.CreateBuilder(args);'],
      caseSensitive: true,
      explain: '`WebApplication.CreateBuilder(args)` sets up configuration (appsettings.json, environment variables, command line), logging, DI and Kestrel. `builder.Build()` creates the app on which you configure middleware, and `app.Run()` starts listening.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A request to `/` passes through this pipeline. What is written to the **console**, in order?',
      example: { title: 'one middleware wrapping the next', code: 'app.Use(async (ctx, next) => {\n    Console.WriteLine("before");\n    await next();          // the rest of the pipeline runs here\n    Console.WriteLine("after");\n});' },
      code: `app.Use(async (ctx, next) => {
    Console.WriteLine("Logger in");
    await next();
    Console.WriteLine("Logger out");
});
app.Use(async (ctx, next) => {
    Console.WriteLine("Auth in");
    await next();
    Console.WriteLine("Auth out");
});
app.Run(async ctx => {
    Console.WriteLine("Endpoint");
    await ctx.Response.WriteAsync("Hello");
});`,
      expected: `Logger in
Auth in
Endpoint
Auth out
Logger out`,
      explain: 'Middleware runs in the order it is added. Code **before** `await next()` runs on the way in, code **after** runs on the way out, so the pipeline behaves like nested boxes. `app.Run` is terminal: it never calls a next delegate.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A middleware forgets to call `await next()` and does not write a response. What happens to the request?',
      options: ['It still reaches the controller', 'The pipeline is short-circuited: later middleware and the endpoint never run', 'ASP.NET Core calls next() automatically', 'The app crashes at startup'],
      answer: 1,
      explain: 'Not calling `next()` **short-circuits** the pipeline. That is useful on purpose (e.g. returning 401 or a cached response) but a bug when forgotten: the client gets an empty 200 response.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**The same pipeline idea in JavaScript.** Write `runPipeline(middlewares, log)`. Each middleware is a function `(log, next)`; call the first one with a `next` that runs the second, and so on; the last `next` does nothing. Return the `log` array.\n\nExample middleware: `(log, next) => { log.push("A in"); next(); log.push("A out"); }`',
      example: { title: 'calling a function by index', code: 'function step(i) {\n  if (i === list.length) return;\n  list[i](() => step(i + 1));\n}' },
      starter: 'function runPipeline(middlewares, log) {\n  // TODO\n  return log;\n}\n',
      solution: 'function runPipeline(middlewares, log) {\n  function run(i) {\n    if (i >= middlewares.length) return;\n    middlewares[i](log, () => run(i + 1));\n  }\n  run(0);\n  return log;\n}\n',
      tests: [
        { call: 'runPipeline([(l, n) => { l.push("A in"); n(); l.push("A out"); }, (l, n) => { l.push("B in"); n(); l.push("B out"); }, (l) => l.push("End")], [])', expect: ['A in', 'B in', 'End', 'B out', 'A out'], msg: 'Middleware must nest: A in, B in, End, B out, A out' },
        { call: 'runPipeline([(l, n) => { l.push("Auth fail"); }, (l) => l.push("End")], [])', expect: ['Auth fail'], msg: 'A middleware that does not call next() must short-circuit' },
      ],
      explain: 'This is exactly how ASP.NET Core builds its `RequestDelegate` chain: each middleware receives the next delegate and decides whether and when to call it. That is why order matters and why skipping `next()` stops the request.',
    },
  ],
};
