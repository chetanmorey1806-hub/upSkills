export default {
  id: "day-063-introduction-to-aspnet-core",
  title: "Introduction to ASP.NET Core, .NET Architecture, CLR, Middleware and Kestrel",
  module: "Module 6: ASP.NET Core & .NET Web Development",
  day: 63,
  level: "Beginner",
  duration: "2 hours",
  summary:
    "Start web development with ASP.NET Core. Learn what ASP.NET Core is, how a web request travels from the browser through Kestrel and the middleware pipeline to your code, how the CLR runs it, and create your first ASP.NET Core project in Visual Studio and with the dotnet CLI.",
  objectives: [
    "Explain what ASP.NET Core is and why it replaced classic ASP.NET (System.Web)",
    "Describe the .NET architecture layers: SDK, runtime (CLR), base class library and ASP.NET Core shared framework",
    "Understand Kestrel, the built-in cross-platform web server, and how IIS/Nginx act as reverse proxies",
    "Understand the middleware pipeline (Use, Run, Map) and the order in which middleware executes",
    "Create, run and explore a new ASP.NET Core project using Visual Studio and the dotnet CLI",
  ],
  theory: [
    {
      heading: "What is ASP.NET Core?",
      content:
        "ASP.NET Core is Microsoft's free, open-source, cross-platform framework for building web applications, Web APIs, real-time apps (SignalR) and microservices with C#. It runs on Windows, Linux and macOS, is very fast (one of the fastest frameworks in TechEmpower benchmarks) and is shipped as part of modern .NET (.NET 8, .NET 9, .NET 10). The old 'ASP.NET' (Web Forms, MVC 5) ran only on Windows inside IIS and depended on the huge System.Web.dll. ASP.NET Core was rewritten from scratch: modular, dependency-injection everywhere, its own web server (Kestrel) and a configurable request pipeline.",
      points: [
        "Cross-platform: develop on Windows/Mac/Linux, host on IIS, Linux + Nginx, Docker, Azure App Service",
        "One framework for MVC (controllers + views), Razor Pages, Web API, Minimal APIs, Blazor and SignalR",
        "Built-in Dependency Injection, Configuration, Logging and Middleware",
        "High performance and open source on GitHub (dotnet/aspnetcore)",
        "Side-by-side versions: each app can target its own .NET version",
      ],
      tip: "Real-world analogy: ASP.NET Core is like a restaurant kitchen. Kestrel is the waiter who takes the order (HTTP request), middleware are the stations the order passes through (security check, logging, routing), and your controller is the chef who cooks the response.",
    },
    {
      heading: ".NET Architecture and the CLR (revision)",
      content:
        "Your C# code is compiled by the Roslyn compiler into IL (Intermediate Language) inside a .dll. When the app starts, the CLR (Common Language Runtime) loads that dll, the JIT compiler converts IL into native machine code, and the CLR manages memory (Garbage Collector), type safety, exceptions and threads. An ASP.NET Core app is just a .NET console program that starts a web server: the project uses the Microsoft.NET.Sdk.Web SDK and references the Microsoft.AspNetCore.App shared framework, which contains Kestrel, routing, MVC, Razor and more.",
      syntax: `Layers of an ASP.NET Core app
---------------------------------------------
 Your code (Program.cs, Controllers, Views)
 ASP.NET Core shared framework  (Microsoft.AspNetCore.App)
 Base Class Library             (Microsoft.NETCore.App: System.*, LINQ, IO ...)
 CLR  (JIT, Garbage Collector, Type system, Threads)
 Operating System (Windows / Linux / macOS)`,
      points: [
        "SDK = tools to build (dotnet build, dotnet new, compilers); Runtime = what is needed to run",
        "csproj: <Project Sdk=\"Microsoft.NET.Sdk.Web\"> tells MSBuild this is a web project",
        "dotnet run builds the project and starts Kestrel; the app is a normal process (dotnet MyApp.dll)",
      ],
    },
    {
      heading: "Kestrel – the built-in web server",
      content:
        "Kestrel is a cross-platform, high-performance HTTP server that is included in every ASP.NET Core app. It listens on a port (for example http://localhost:5000 and https://localhost:5001, or random ports like 7123 created by the template), reads raw HTTP bytes, builds an HttpContext object (Request + Response) and hands it to your middleware pipeline. In production Kestrel can face the internet directly, or sit behind a reverse proxy such as IIS (using the ASP.NET Core Module), Nginx or Apache which handles things like SSL offloading, load balancing and static file caching.",
      syntax: `Browser  --HTTP-->  [IIS / Nginx reverse proxy (optional)]  -->  Kestrel  -->  Middleware pipeline  -->  Endpoint (controller / page)
Browser  <--HTML/JSON--------------------------------------------- Kestrel  <--  Middleware pipeline  <--  Endpoint`,
      points: [
        "IIS in-process hosting: the app runs inside the IIS worker process (w3wp.exe) using IIS HTTP Server instead of Kestrel",
        "IIS out-of-process hosting: IIS forwards requests to Kestrel",
        "IIS Express is used by Visual Studio only for local development (optional profile)",
        "Ports are configured in Properties/launchSettings.json (development) or ASPNETCORE_URLS / appsettings.json Kestrel section",
      ],
    },
    {
      heading: "Middleware and the Request Pipeline",
      content:
        "Middleware is a piece of code that handles an HTTP request and either produces a response or passes the request to the next middleware. All middleware together form the request pipeline. Each middleware can run code BEFORE calling next() and AFTER next() returns, so the request goes in through every middleware and the response comes back out in reverse order (like Russian dolls). Order matters: for example UseAuthentication must come before UseAuthorization, and UseStaticFiles near the top can return CSS/JS files without running MVC.",
      syntax: `app.Use(async (context, next) =>     // can call the next middleware
{
    // code before
    await next(context);
    // code after (response is on its way back)
});

app.Map("/admin", adminApp => { ... });   // branch the pipeline by path

app.Run(async context =>              // terminal: never calls next
{
    await context.Response.WriteAsync("Hello");
});`,
      points: [
        "Use = add middleware that may call next; Run = terminal middleware; Map = branch by URL path",
        "Built-in middleware: UseHttpsRedirection, UseStaticFiles, UseRouting, UseAuthentication, UseAuthorization, UseExceptionHandler, UseSession",
        "Endpoints (MapControllerRoute, MapGet, MapRazorPages) are the end of the pipeline",
        "Middleware added after a terminal middleware (Run) never executes",
      ],
      tip: "Day 73 goes deeper into custom middleware classes. Today just remember: in through each middleware, out in reverse.",
    },
    {
      heading: "Hosting model: WebApplication builder (Program.cs)",
      content:
        "Since .NET 6 an ASP.NET Core app starts from a small Program.cs that uses top-level statements. WebApplication.CreateBuilder(args) creates a builder that loads configuration (appsettings.json, environment variables, command-line), sets up logging and gives you builder.Services to register services (dependency injection). builder.Build() creates the WebApplication; you then add middleware with app.UseXxx(), map endpoints, and call app.Run() which starts Kestrel and blocks until the app stops.",
      syntax: `var builder = WebApplication.CreateBuilder(args);   // 1. configure host + services
builder.Services.AddControllersWithViews();          // 2. register services (DI)

var app = builder.Build();                           // 3. build the app

app.UseStaticFiles();                                // 4. middleware pipeline
app.UseRouting();
app.MapGet("/", () => "Hello ASP.NET Core!");         // 5. endpoints

app.Run();                                           // 6. start Kestrel`,
    },
    {
      heading: "Project templates you can create",
      content:
        "Visual Studio and the dotnet CLI include several web templates. In this module we mainly use 'ASP.NET Core Web App (Model-View-Controller)' (dotnet new mvc). Module 8 uses 'ASP.NET Core Web API' (dotnet new webapi).",
      points: [
        "ASP.NET Core Empty — dotnet new web — only Program.cs with MapGet('/')",
        "ASP.NET Core Web App (Razor Pages) — dotnet new webapp (or razor)",
        "ASP.NET Core Web App (Model-View-Controller) — dotnet new mvc",
        "ASP.NET Core Web API — dotnet new webapi",
        "Blazor Web App — dotnet new blazor",
        "Check installed SDKs with dotnet --list-sdks and templates with dotnet new list",
      ],
    },
  ],
  examples: [
    {
      title: "Create your first ASP.NET Core project (Empty template)",
      scenario: "Create the smallest possible web app and see 'Hello World' in the browser, served by Kestrel.",
      steps: [
        "Open Visual Studio 2022/2026 and choose File > New > Project",
        "Search for 'ASP.NET Core Empty', select it (C#) and click Next",
        "Project name: HelloWeb, Location: C:\\Projects, click Next",
        "Framework: .NET 10.0 (Long Term Support) (or .NET 8.0), keep 'Configure for HTTPS' ticked, click Create",
        "Open Program.cs and replace it with the code below",
        "Press Ctrl+F5 (Start Without Debugging). Accept the 'trust the ASP.NET Core SSL certificate' prompt the first time",
        "CLI alternative: dotnet new web -n HelloWeb  then  cd HelloWeb  then  dotnet run",
      ],
      code: `// Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World from ASP.NET Core!");
app.MapGet("/about", () => "This app is served by Kestrel.");
app.MapGet("/hello/{name}", (string name) => $"Hello {name}, welcome to Day 63!");

app.Run();

// HelloWeb.csproj (generated)
// <Project Sdk="Microsoft.NET.Sdk.Web">
//   <PropertyGroup>
//     <TargetFramework>net10.0</TargetFramework>
//     <Nullable>enable</Nullable>
//     <ImplicitUsings>enable</ImplicitUsings>
//   </PropertyGroup>
// </Project>`,
      result: `Console window (Kestrel log):
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7086
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5094
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development

Browser https://localhost:7086/            -> Hello World from ASP.NET Core!
Browser https://localhost:7086/about       -> This app is served by Kestrel.
Browser https://localhost:7086/hello/Riya  -> Hello Riya, welcome to Day 63!
(port numbers are random per project; see launchSettings.json)`,
      explanation:
        "The Empty template has no controllers or views. MapGet maps a URL to a lambda (a Minimal API endpoint) and the returned string is written as text/plain. {name} is a route parameter bound to the lambda parameter. The console shows Kestrel's log: which URLs it is listening on and the hosting environment.",
    },
    {
      title: "Create an ASP.NET Core MVC project in Visual Studio and with the CLI",
      scenario: "Create the StudentPortal MVC project that we will keep extending for the rest of Module 6.",
      steps: [
        "File > New > Project",
        "Search 'mvc', select 'ASP.NET Core Web App (Model-View-Controller)' (C#) and click Next",
        "Project name: StudentPortal, Solution name: StudentPortal, click Next",
        "Framework: .NET 10.0 (LTS) or .NET 8.0; Authentication type: None; Configure for HTTPS: ticked; click Create",
        "Look at Solution Explorer: Connected Services, Dependencies, Properties (launchSettings.json), wwwroot, Controllers, Models, Views, appsettings.json, Program.cs",
        "Press F5 (run with debugging) or Ctrl+F5; the browser opens the Home page",
        "CLI alternative: dotnet new mvc -n StudentPortal  then  cd StudentPortal  then  dotnet run  (or dotnet watch for hot reload)",
      ],
      code: `// Program.cs generated by the MVC template (.NET 8/9/10)
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();            // .NET 9+  (in .NET 8 the template uses app.UseStaticFiles())

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();`,
      result: `The browser opens https://localhost:7xxx/ and shows the default page:
 - Top navbar: "StudentPortal   Home   Privacy" (Bootstrap 5)
 - Heading "Welcome"
 - Text "Learn about building Web apps with ASP.NET Core."
 - Footer "© 2026 - StudentPortal - Privacy"
Clicking Privacy goes to /Home/Privacy and shows "Privacy Policy".`,
      explanation:
        "AddControllersWithViews registers MVC services. The default route {controller=Home}/{action=Index}/{id?} means '/' runs HomeController.Index() which returns Views/Home/Index.cshtml inside the shared layout Views/Shared/_Layout.cshtml. We study each of these files on Day 64 and Day 66.",
    },
    {
      title: "See the middleware pipeline order in a real web app",
      scenario: "Add three Use middleware and one Run middleware to the Empty project and watch the order of execution in the browser output and console.",
      steps: [
        "Open the HelloWeb project from Example 1",
        "Replace Program.cs with the code below",
        "Press Ctrl+F5 and open the root URL in the browser",
        "Watch the Visual Studio console window for the log lines",
        "CLI alternative: dotnet run, then curl https://localhost:7086/ -k",
      ],
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    Console.WriteLine("1. Logging middleware - request in: " + context.Request.Path);
    await next(context);
    Console.WriteLine("1. Logging middleware - response out: " + context.Response.StatusCode);
});

app.Use(async (context, next) =>
{
    Console.WriteLine("2. Timer middleware - start");
    var watch = System.Diagnostics.Stopwatch.StartNew();
    await next(context);
    watch.Stop();
    Console.WriteLine("2. Timer middleware - end");
});

app.Use(async (context, next) =>
{
    if (context.Request.Query.ContainsKey("block"))
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Blocked by middleware 3");
        return;                       // short-circuit: next is NOT called
    }
    await next(context);
});

app.Run(async context =>
{
    Console.WriteLine("4. Terminal middleware - writing response");
    await context.Response.WriteAsync("Hello from the end of the pipeline!");
});

app.Run();`,
      result: `Browser /            -> Hello from the end of the pipeline!
Console:
1. Logging middleware - request in: /
2. Timer middleware - start
4. Terminal middleware - writing response
2. Timer middleware - end
1. Logging middleware - response out: 200

Browser /?block=1    -> Blocked by middleware 3   (status 403)
Console:
1. Logging middleware - request in: /
2. Timer middleware - start
2. Timer middleware - end
1. Logging middleware - response out: 403
(The browser may also request /favicon.ico, which prints a second set of lines.)`,
      explanation:
        "Requests go down the pipeline 1 -> 2 -> 3 -> 4 and the response comes back 4 -> 2 -> 1. Middleware 3 short-circuits when ?block is present, so the terminal middleware never runs. The two app.Run calls are different: app.Run(async context => ...) adds terminal middleware, while the final app.Run() starts the server.",
    },
    {
      title: "Console simulation of the middleware pipeline",
      scenario: "Understand how 'next' works by building a tiny pipeline with delegates in a plain console app (no web server needed).",
      steps: [
        "File > New > Project > Console App, name it PipelineDemo, .NET 10",
        "Replace Program.cs with the code",
        "Press Ctrl+F5",
      ],
      code: `using System;
using System.Collections.Generic;

// A request handler takes a 'path' and returns nothing
var middlewares = new List<Func<Action<string>, Action<string>>>();

void Use(Func<Action<string>, Action<string>> m) => middlewares.Add(m);

Use(next => path =>
{
    Console.WriteLine("Logger IN  " + path);
    next(path);
    Console.WriteLine("Logger OUT " + path);
});

Use(next => path =>
{
    if (path == "/secret")
    {
        Console.WriteLine("Auth: 401 Unauthorized (short-circuit)");
        return;
    }
    Console.WriteLine("Auth: OK");
    next(path);
});

Action<string> endpoint = path => Console.WriteLine("Endpoint: response for " + path);

// Build: wrap from the last middleware to the first
Action<string> pipeline = endpoint;
for (int i = middlewares.Count - 1; i >= 0; i--)
{
    pipeline = middlewares[i](pipeline);
}

pipeline("/home");
Console.WriteLine("---");
pipeline("/secret");`,
      csharp: {
        files: {
          "Program.cs": `using System;
using System.Collections.Generic;

// A request handler takes a 'path' and returns nothing
var middlewares = new List<Func<Action<string>, Action<string>>>();

void Use(Func<Action<string>, Action<string>> m) => middlewares.Add(m);

Use(next => path =>
{
    Console.WriteLine("Logger IN  " + path);
    next(path);
    Console.WriteLine("Logger OUT " + path);
});

Use(next => path =>
{
    if (path == "/secret")
    {
        Console.WriteLine("Auth: 401 Unauthorized (short-circuit)");
        return;
    }
    Console.WriteLine("Auth: OK");
    next(path);
});

Action<string> endpoint = path => Console.WriteLine("Endpoint: response for " + path);

// Build: wrap from the last middleware to the first
Action<string> pipeline = endpoint;
for (int i = middlewares.Count - 1; i >= 0; i--)
{
    pipeline = middlewares[i](pipeline);
}

pipeline("/home");
Console.WriteLine("---");
pipeline("/secret");
`,
        },
        stdin: "",
      },
      result: `Logger IN  /home
Auth: OK
Endpoint: response for /home
Logger OUT /home
---
Logger IN  /secret
Auth: 401 Unauthorized (short-circuit)
Logger OUT /secret`,
      explanation:
        "This is exactly how ASP.NET Core builds its pipeline: each middleware is a function that receives 'next' and returns a new handler. Building from the end backwards nests the handlers, so the first registered middleware runs first and finishes last. The Auth middleware short-circuits for /secret, so the endpoint never runs, but the Logger still prints OUT because control returns to it.",
    },
  ],
  interview: [
    { q: "What is ASP.NET Core?", a: "A free, open-source, cross-platform, high-performance framework from Microsoft for building web apps, Web APIs, real-time apps and microservices on .NET. It supports MVC, Razor Pages, Web API, Minimal APIs, Blazor and SignalR.", level: "Easy" },
    { q: "Difference between ASP.NET (Framework) and ASP.NET Core?", a: "ASP.NET runs only on Windows/IIS, depends on System.Web and the .NET Framework. ASP.NET Core is cross-platform, modular, has built-in DI, its own Kestrel server, a configurable middleware pipeline, side-by-side versioning and much better performance.", level: "Easy" },
    { q: "What is Kestrel?", a: "Kestrel is the default cross-platform web server built into ASP.NET Core. It listens for HTTP requests, creates an HttpContext and passes it to the middleware pipeline. It can be used alone or behind a reverse proxy like IIS, Nginx or Apache.", level: "Easy" },
    { q: "Why use a reverse proxy in front of Kestrel?", a: "A reverse proxy (IIS, Nginx) can handle SSL termination, load balancing, port sharing between apps on the same server, request filtering, compression and static file caching, and adds an extra layer of security.", level: "Medium" },
    { q: "What is middleware?", a: "A component in the request pipeline that receives HttpContext, can do work before and after calling the next component, or can short-circuit by writing the response without calling next.", level: "Easy" },
    { q: "Difference between app.Use, app.Run and app.Map?", a: "Use adds middleware that receives a 'next' delegate and may call it. Run adds terminal middleware that never calls next. Map branches the pipeline for requests that start with a given path.", level: "Medium" },
    { q: "Why does middleware order matter? Give an example.", a: "Middleware runs in the order it is added. UseAuthentication must run before UseAuthorization so the user is known before checking permissions; UseExceptionHandler should be first so it can catch exceptions from all later middleware; UseStaticFiles early returns files without running MVC.", level: "Medium" },
    { q: "What does WebApplication.CreateBuilder(args) do?", a: "It creates a WebApplicationBuilder with default configuration sources (appsettings.json, appsettings.{Environment}.json, user secrets in Development, environment variables, command line), default logging providers, Kestrel as server, and an IServiceCollection for registering services.", level: "Medium" },
    { q: "What is the role of the CLR in an ASP.NET Core app?", a: "The CLR loads the compiled IL assemblies, JIT-compiles them to native code, manages memory with the garbage collector, enforces type safety, handles exceptions and thread pool threads that process requests.", level: "Medium" },
    { q: "What is the difference between in-process and out-of-process hosting in IIS?", a: "In-process: the app runs inside the IIS worker process (w3wp.exe) using IISHttpServer, giving better performance. Out-of-process: IIS (ASP.NET Core Module) forwards requests to a separate Kestrel process.", level: "Hard" },
    {
      q: "Output? app.Use(async (c, n) => { Console.Write(\"A\"); await n(c); Console.Write(\"B\"); }); app.Use(async (c, n) => { Console.Write(\"C\"); await n(c); Console.Write(\"D\"); }); app.Run(async c => Console.Write(\"E\"));",
      a: "For one request it prints ACEDB: in through A and C, the terminal E, then out through D and B.",
      level: "Medium",
    },
    { q: "What happens to middleware registered after app.Run(async context => ...)?", a: "It never executes, because Run is terminal and does not call next.", level: "Easy" },
  ],
  practice: [
    {
      task: "Create an Empty ASP.NET Core project named DayInfo with endpoints '/' returning 'Welcome', '/time' returning the server time and '/square/{n:int}' returning n*n.",
      hint: "Use app.MapGet with lambdas; route constraint {n:int}.",
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/", () => "Welcome");
app.MapGet("/time", () => DateTime.Now.ToString("HH:mm:ss"));
app.MapGet("/square/{n:int}", (int n) => $"Square of {n} is {n * n}");
app.Run();`,
    },
    {
      task: "Add a middleware that adds a response header 'X-Course: DotNet' to every response and logs the request method and path.",
      hint: "Set the header before calling next (headers cannot be changed after the response has started).",
      solution: `app.Use(async (context, next) =>
{
    Console.WriteLine(context.Request.Method + " " + context.Request.Path);
    context.Response.Headers["X-Course"] = "DotNet";
    await next(context);
});`,
    },
    {
      task: "Use app.Map to create a branch '/admin' that returns 'Admin area' while all other URLs return 'Public area'.",
      hint: "app.Map(\"/admin\", branch => branch.Run(...)); then app.Run for everything else.",
      solution: `app.Map("/admin", branch =>
{
    branch.Run(async ctx => await ctx.Response.WriteAsync("Admin area"));
});
app.Run(async ctx => await ctx.Response.WriteAsync("Public area"));`,
    },
    {
      task: "Create the StudentPortal MVC project with the dotnet CLI, run it with hot reload and change the Welcome heading in Views/Home/Index.cshtml.",
      hint: "dotnet new mvc, dotnet watch.",
      solution: `dotnet new mvc -n StudentPortal
cd StudentPortal
dotnet watch
// Edit Views/Home/Index.cshtml: <h1 class="display-4">Welcome to Student Portal</h1>
// Save: the browser refreshes automatically.`,
    },
    {
      task: "Run 'dotnet --info', 'dotnet --list-sdks' and 'dotnet new list' and note the installed SDKs and the short names of the web templates.",
      hint: "Look for web, mvc, webapp, webapi, blazor in the Short Name column.",
      solution: `dotnet --list-sdks     -> e.g. 8.0.4xx, 10.0.1xx
dotnet new list        -> ASP.NET Core Empty (web), ASP.NET Core Web App (Model-View-Controller) (mvc),
                          ASP.NET Core Web App (Razor Pages) (webapp,razor), ASP.NET Core Web API (webapi), Blazor Web App (blazor)`,
    },
  ],
  quiz: [
    { question: "Which is the default web server built into ASP.NET Core?", options: ["IIS", "Apache", "Kestrel", "Tomcat"], answer: 2, explanation: "Kestrel is the cross-platform server included in every ASP.NET Core app." },
    { question: "Which method adds terminal middleware that does not call the next component?", options: ["app.Run", "app.Use", "app.Map", "app.UseRouting"], answer: 0, explanation: "app.Run(handler) is terminal; app.Use receives next." },
    { question: "Which dotnet CLI command creates an ASP.NET Core MVC project?", options: ["dotnet new webapi", "dotnet new mvc", "dotnet new console", "dotnet new razorclass"], answer: 1, explanation: "mvc is the short name for 'ASP.NET Core Web App (Model-View-Controller)'." },
    { question: "Middleware A, B, C are added with Use in that order and each logs before and after next. What is the order of the 'after' logs?", options: ["A, B, C", "B, A, C", "A, C, B", "C, B, A"], answer: 3, explanation: "The response travels back in reverse order: C, B, A." },
    { question: "What does the CLR's JIT compiler do?", options: ["Compiles C# into IL", "Converts IL into native machine code at runtime", "Serves HTTP requests", "Minifies JavaScript"], answer: 1, explanation: "Roslyn compiles C# to IL; JIT turns IL into native code when methods run." },
  ],
};
