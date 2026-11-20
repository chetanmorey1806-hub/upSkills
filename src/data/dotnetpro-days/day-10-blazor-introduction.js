const counterRazor = `@* ===== Components/Pages/Counter.razor ===== *@
@page "/counter"
@rendermode InteractiveServer

<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<p role="status">Current count: @currentCount</p>

<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount = 0;

    private void IncrementCount()
    {
        currentCount++;   // Blazor re-renders the component automatically after the event
    }
}`;

const programServer = `// ===== Program.cs (Blazor Web App, interactivity = Server) =====
using SchoolPortal.Components;

var builder = WebApplication.CreateBuilder(args);

// Razor components + the interactive Server render mode (SignalR circuit)
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAntiforgery();
app.MapStaticAssets();          // .NET 9+; on .NET 8 use app.UseStaticFiles();

app.MapRazorComponents<App>()   // App.razor is the root component
    .AddInteractiveServerRenderMode();

app.Run();

// ===== Create it =====
// Visual Studio: File > New > Project > "Blazor Web App" > Name: SchoolPortal
//   Framework: .NET 8 or later, Interactive render mode: Server, Interactivity location: Per page/component
// CLI: dotnet new blazor -n SchoolPortal --interactivity Server
//      cd SchoolPortal ; dotnet watch`;

const productListRazor = `@* ===== Components/Pages/Products.razor ===== *@
@page "/products"

<PageTitle>Products</PageTitle>

<h3>Today's offers (@products.Count items)</h3>

@if (products.Count == 0)
{
    <p>No products yet.</p>
}
else
{
    <table class="table">
        <thead>
            <tr><th>#</th><th>Name</th><th>Price (Rs)</th><th>Stock</th></tr>
        </thead>
        <tbody>
            @foreach (var (p, index) in products.Select((p, i) => (p, i + 1)))
            {
                <tr class="@(p.Stock == 0 ? "table-danger" : "")">
                    <td>@index</td>
                    <td>@p.Name</td>
                    <td>@p.Price</td>
                    <td>@(p.Stock == 0 ? "Out of stock" : p.Stock.ToString())</td>
                </tr>
            }
        </tbody>
    </table>
    <p>Total stock value: Rs @TotalValue()</p>
}

@code {
    private List<Product> products = new()
    {
        new Product("Notebook", 40, 120),
        new Product("Pen Drive 32GB", 350, 0),
        new Product("Water Bottle", 199, 15)
    };

    private int TotalValue() => products.Sum(p => p.Price * p.Stock);

    private record Product(string Name, int Price, int Stock);
}`;

const renderModesCode = `// ===== Program.cs for the "Auto" template =====
// dotnet new blazor -n ShopApp --interactivity Auto
// This creates TWO projects: ShopApp (server) and ShopApp.Client (WebAssembly)
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(ShopApp.Client._Imports).Assembly);

@* ===== Choosing a render mode per page / component ===== *@

@* 1. Static SSR (no @rendermode): HTML is built on the server, no interactivity *@
@page "/about"
<h3>About us</h3>

@* 2. Interactive Server: events travel over a SignalR (WebSocket) circuit *@
@page "/live-orders"
@rendermode InteractiveServer

@* 3. Interactive WebAssembly: the .NET runtime + DLLs run inside the browser
      (the component must live in the .Client project) *@
@page "/calculator"
@rendermode InteractiveWebAssembly

@* 4. Interactive Auto: Server on the first visit, WebAssembly once the files are cached *@
@page "/cart"
@rendermode InteractiveAuto

@* 5. Turn off prerendering for one component *@
@rendermode @(new InteractiveServerRenderMode(prerender: false))

@* 6. Apply a mode to a component instance from the parent *@
<Counter @rendermode="InteractiveServer" />

@* 7. Whole app interactive: set it on Routes and HeadOutlet in App.razor *@
<HeadOutlet @rendermode="InteractiveServer" />
<Routes @rendermode="InteractiveServer" />`;

const folderCode = `SchoolPortal/
|-- Properties/launchSettings.json      URLs and profiles (http/https)
|-- wwwroot/                            static files: app.css, bootstrap, favicon
|-- Components/
|   |-- App.razor                       root HTML document (<html>, <head>, <Routes />, blazor.web.js)
|   |-- Routes.razor                    <Router> - finds the @page component for the URL
|   |-- _Imports.razor                  @using lines shared by all components in the folder
|   |-- Layout/
|   |   |-- MainLayout.razor            common page frame (sidebar + @Body)
|   |   |-- NavMenu.razor               left menu with NavLink
|   |-- Pages/
|       |-- Home.razor                  @page "/"
|       |-- Counter.razor               @page "/counter"
|       |-- Weather.razor               @page "/weather" (streaming rendering demo)
|       |-- Error.razor
|-- appsettings.json
|-- Program.cs

@* ===== _Imports.razor ===== *@
@using System.Net.Http
@using System.Net.Http.Json
@using Microsoft.AspNetCore.Components.Forms
@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.Web
@using static Microsoft.AspNetCore.Components.Web.RenderMode
@using Microsoft.JSInterop
@using SchoolPortal
@using SchoolPortal.Components

@* ===== Code-behind option: Counter.razor.cs ===== *@
// partial class with the same name as the .razor file
namespace SchoolPortal.Components.Pages;

public partial class Counter
{
    private int currentCount;
    private void IncrementCount() => currentCount++;
}`;

const renderSimCode = `using System;
using System.Collections.Generic;

// A .razor file is compiled into a C# class. Each render builds a "render tree";
// Blazor compares it with the previous tree and sends only the changes (the diff) to the browser.
List<string> previous = new();
var counter = new CounterComponent();

Console.WriteLine("-- first render --");
Render();

Console.WriteLine("-- user clicks once --");
counter.IncrementCount();
Render();

Console.WriteLine("-- user clicks twice, one render --");
counter.IncrementCount();
counter.IncrementCount();
Render();

void Render()
{
    List<string> current = counter.BuildRenderTree();
    for (int i = 0; i < current.Count; i++)
    {
        if (i >= previous.Count) Console.WriteLine($"INSERT {current[i]}");
        else if (previous[i] != current[i]) Console.WriteLine($"UPDATE {current[i]}");
    }
    previous = current;
}

// What Counter.razor roughly becomes after compilation
class CounterComponent
{
    private int currentCount = 0;                 // from @code { ... }
    public void IncrementCount() => currentCount++;

    public List<string> BuildRenderTree() => new()
    {
        "<h1>Counter</h1>",
        $"<p>Current count: {currentCount}</p>",
        "<button>Click me</button>"
    };
}
`;

export default {
  id: 'day-10-blazor-introduction',
  title: 'Blazor Introduction: Hosting Models, Render Modes, Components and Razor Syntax',
  module: 'Module 3: Blazor',
  day: 10,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Build web UIs in C# instead of JavaScript. Learn what Blazor is, how Blazor Server, Blazor WebAssembly and the .NET 8 render modes (Static SSR, Interactive Server, Interactive WebAssembly, Interactive Auto) work, create a Blazor Web App, and write your first components with Razor syntax and @code blocks.',
  objectives: [
    'Explain what Blazor is and compare the Server, WebAssembly and Auto hosting/render models',
    'Create a Blazor Web App from Visual Studio or the dotnet CLI and understand every folder',
    'Write components with Razor syntax: expressions, @if, @foreach, @onclick and @code',
    'Choose a render mode per page or for the whole app and explain prerendering',
  ],
  theory: [
    {
      heading: 'What is Blazor and why companies use it',
      content:
        'Blazor is Microsoft\'s framework for building interactive web UIs with C# and Razor instead of JavaScript. A Blazor app is made of components: reusable pieces of UI (a button, a product card, a full page) written in .razor files that mix HTML and C#. Companies that already have .NET back-end teams use Blazor for admin panels, internal dashboards, ERP screens and line-of-business apps, because the same developers, the same language and even the same model/validation classes can be shared between the Web API and the UI. Blazor is part of ASP.NET Core, so you get dependency injection, configuration, logging and authentication the same way as in MVC and Web API.',
      points: [
        'Component = a .razor file = a C# class (Counter.razor becomes class Counter : ComponentBase)',
        'Razor syntax = HTML + C# using the @ symbol',
        'Blazor uses a render tree and diffing (like React\'s virtual DOM) to update only the changed parts of the page',
        'Blazor vs React/Angular: one language (C#) end to end, shared DTOs and validation, but a smaller ecosystem of UI libraries',
        'Popular component libraries: MudBlazor, Radzen, Syncfusion, Telerik, Fluent UI Blazor',
      ],
    },
    {
      heading: 'Hosting models: Blazor Server vs Blazor WebAssembly',
      content:
        'Blazor Server: the components run on the server. The browser loads a small script (blazor.web.js) that opens a SignalR (WebSocket) connection called a circuit. When the user clicks a button, the event goes to the server, C# runs there, and only the UI diff comes back. Advantages: very fast first load, full server access (database, files), code never reaches the browser. Disadvantages: every click needs a network round trip, the server keeps memory for every connected user, and the app stops working if the connection drops. Blazor WebAssembly (WASM): the .NET runtime and your DLLs are downloaded and run inside the browser. Advantages: runs offline, no server memory per user, can be hosted as static files (even on GitHub Pages or Azure Static Web Apps). Disadvantages: bigger first download (several MB), code is visible to the user, and it must call a Web API to reach the database.',
      points: [
        'Server: small download, low latency needed, server holds state per user (a circuit)',
        'WebAssembly: large first download, works offline (PWA), needs a Web API for data, never put secrets in it',
        'Blazor Hybrid (MAUI/WPF/WinForms) runs components in a native app with a WebView - just know the name',
        'In .NET 8+ you no longer choose one model for the whole app: you choose a render mode per page/component',
      ],
    },
    {
      heading: '.NET 8+ render modes in the Blazor Web App template',
      content:
        '.NET 8 replaced the old separate templates with one "Blazor Web App" template. Every component is rendered on the server first. Then you decide how interactive it should be with the @rendermode directive. Static Server-Side Rendering (Static SSR) is the default: plain HTML is generated on the server, very fast and SEO-friendly, but buttons do not run C# (forms can still post). Interactive Server, Interactive WebAssembly and Interactive Auto add interactivity. Auto uses Server on the first visit (instant start) while the WebAssembly files download in the background, and uses WebAssembly on later visits. Prerendering is on by default: the component\'s HTML is first rendered on the server so the user sees content immediately, then it becomes interactive. Streaming rendering ([StreamRendering]) lets a static page show a "Loading..." placeholder and then stream the real data in the same response.',
      syntax: `@rendermode InteractiveServer
@rendermode InteractiveWebAssembly
@rendermode InteractiveAuto
@rendermode @(new InteractiveServerRenderMode(prerender: false))
@attribute [StreamRendering]`,
      points: [
        'Program.cs: AddInteractiveServerComponents() / AddInteractiveWebAssemblyComponents() + the matching Add...RenderMode() on MapRazorComponents',
        'WebAssembly and Auto components must live in the .Client project so they can be downloaded to the browser',
        'Interactivity location: "Per page/component" (default) or "Global" (set on <Routes> in App.razor)',
        'Prerendering runs OnInitializedAsync twice (once on the server, once when interactive) - remember this for API calls',
      ],
      tip: 'Interview line: "Static SSR for content pages, Interactive Server for internal apps with fast networks, WebAssembly for offline or heavy client-side UI, Auto when you want fast first load plus client-side speed later."',
    },
    {
      heading: 'Creating a project and the folder structure',
      content:
        'In Visual Studio 2022/2026 choose File > New > Project > Blazor Web App, select the framework (.NET 8 or later), the Interactive render mode (None, Server, WebAssembly or Auto) and the Interactivity location. From the CLI use dotnet new blazor. Use dotnet watch to get hot reload while you edit .razor files. The important files are App.razor (the root HTML document that loads blazor.web.js), Routes.razor (the Router that maps URLs to components with @page), Components/Layout (MainLayout and NavMenu), Components/Pages (routable pages), _Imports.razor (shared @using lines), wwwroot (static files) and Program.cs (services and the pipeline).',
      syntax: `dotnet new blazor -n SchoolPortal                          # Static SSR only
dotnet new blazor -n SchoolPortal --interactivity Server   # Server
dotnet new blazor -n SchoolPortal --interactivity WebAssembly
dotnet new blazor -n SchoolPortal --interactivity Auto --all-interactive
dotnet new blazorwasm -n SchoolWasm                       # standalone WebAssembly app
dotnet watch                                              # run with hot reload`,
      points: [
        'Pages are just components with an @page "/route" directive',
        'File name = component name and must start with a capital letter (Counter.razor -> <Counter />)',
        'Components in a sub-folder need its namespace in _Imports.razor or an @using',
        'Code-behind: put logic in Counter.razor.cs as public partial class Counter',
      ],
    },
    {
      heading: 'Razor syntax inside components',
      content:
        'The @ symbol switches from HTML to C#. @name prints a value (HTML-encoded, so it is safe from XSS). @(expression) is needed for anything with spaces or operators, for example @(price * qty). @if, @else, @foreach, @for, @while and @switch are control blocks. @onclick="MethodName" connects a DOM event to a C# method. The @code { } block holds fields, properties and methods of the component class. Comments use @* ... *@ and are not sent to the browser. Directives at the top configure the component: @page, @rendermode, @using, @inject, @layout, @inherits, @implements, @attribute.',
      syntax: `<p>Hello @studentName, you scored @(marks * 100 / total)%</p>
@if (isAdmin) { <button @onclick="Delete">Delete</button> }
@foreach (var s in students) { <li>@s.Name</li> }
<button @onclick="() => Select(s.Id)">Select</button>
@code { private string studentName = "Asha"; }`,
      points: [
        '@((MarkupString)html) renders raw HTML - only for trusted content',
        'Lambdas pass arguments to handlers: @onclick="() => Remove(item)"',
        'Async handlers are fine: private async Task SaveAsync() { ... }',
        'After an event handler finishes, Blazor re-renders the component automatically',
      ],
    },
  ],
  examples: [
    {
      title: 'Your first Blazor Web App: the Counter component',
      scenario:
        'Create a SchoolPortal Blazor Web App with Interactive Server render mode, run it, and understand how the Counter page works from Program.cs to the @code block.',
      steps: [
        'Visual Studio: File > New > Project > Blazor Web App > Next, name it SchoolPortal',
        'Framework: .NET 8.0 (or later); Interactive render mode: Server; Interactivity location: Per page/component; tick "Include sample pages"',
        'Or CLI: dotnet new blazor -n SchoolPortal --interactivity Server, then cd SchoolPortal and dotnet watch',
        'Open Components/Pages/Counter.razor and Program.cs (code below)',
        'Press Ctrl+F5, click "Counter" in the left menu and press the button three times',
        'Open browser DevTools > Network > WS and click again: you see small SignalR messages, not page reloads',
      ],
      code: `${counterRazor}\n\n${programServer}`,
      result: `Browser at https://localhost:7xxx/counter
Counter
Current count: 0      (first render, prerendered on the server)
[Click me] x3
Current count: 3
DevTools > Network: one WebSocket connection (_blazor?id=...) carrying small binary messages per click`,
      explanation:
        '@page "/counter" registers the route. @rendermode InteractiveServer makes the button work through a SignalR circuit. @currentCount prints the field. @onclick="IncrementCount" wires the click to the C# method; after the method runs Blazor re-renders the component, compares the new render tree with the old one and sends only the changed text to the browser. Without the @rendermode line the page would still show "Current count: 0" (Static SSR) but clicking would do nothing - the most common beginner confusion.',
    },
    {
      title: 'Razor syntax: product list with @if, @foreach and expressions',
      scenario:
        'A shop owner in Pune wants a page showing today\'s products, marking out-of-stock items in red and showing the total stock value.',
      steps: [
        'In SchoolPortal (or any Blazor Web App) right-click Components/Pages > Add > Razor Component, name it Products.razor',
        'Paste the code below',
        'Add a menu link in Components/Layout/NavMenu.razor: <NavLink class="nav-link" href="products">Products</NavLink>',
        'Press Ctrl+F5 and open /products',
      ],
      code: productListRazor,
      result: `Today's offers (3 items)
#  Name            Price (Rs)  Stock
1  Notebook        40          120
2  Pen Drive 32GB  350         Out of stock      (row highlighted red)
3  Water Bottle    199         15
Total stock value: Rs 7785`,
      explanation:
        'This page has no @rendermode, so it is Static SSR - perfect for display-only pages. @products.Count is a simple expression. @(p.Stock == 0 ? ... : ...) needs parentheses because it contains operators. class="@(...)" sets a CSS class conditionally. TotalValue() = 40*120 + 350*0 + 199*15 = 4800 + 0 + 2985 = 7785. The private record Product is declared inside @code, so it is a nested type of the component class.',
    },
    {
      title: 'Render modes: Server, WebAssembly and Auto in one app',
      scenario:
        'An e-commerce app needs a fast static "About" page, a live orders page for staff (Server), a calculator that should work without the server (WebAssembly) and a cart that loads fast and later runs in the browser (Auto).',
      steps: [
        'CLI: dotnet new blazor -n ShopApp --interactivity Auto (creates ShopApp and ShopApp.Client)',
        'Check Program.cs in ShopApp: both AddInteractiveServerComponents and AddInteractiveWebAssemblyComponents are registered',
        'Put WebAssembly/Auto components (calculator, cart) in ShopApp.Client/Pages; Server-only pages can stay in ShopApp/Components/Pages',
        'Add the @rendermode line at the top of each page as shown',
        'Run with Ctrl+F5, open DevTools > Network and compare: /live-orders opens a WebSocket, /calculator downloads dotnet.wasm and DLLs',
      ],
      code: renderModesCode,
      result: `/about          -> plain HTML, no WebSocket, no .wasm download
/live-orders    -> WebSocket _blazor?id=... opened, clicks handled on the server
/calculator     -> downloads _framework/dotnet.*.wasm and ShopApp.Client.*.wasm, then runs in the browser
/cart (1st visit) -> starts on Server immediately, WASM files download in the background
/cart (2nd visit) -> runs on WebAssembly from the browser cache`,
      explanation:
        'Each render mode needs two things: its services in builder.Services and its endpoint option on MapRazorComponents. AddAdditionalAssemblies tells the router about pages that live in the .Client project. InteractiveAuto gives the best of both: fast start (Server) and no server load later (WASM). Turning off prerender is useful when a component uses browser-only things (like localStorage) during initialization.',
    },
    {
      title: 'Folder structure, _Imports.razor and code-behind',
      scenario:
        'A new team member asks "where do I put things?". Walk through the template folders and move the Counter logic into a code-behind file, which many companies require for cleaner code reviews.',
      steps: [
        'Open Solution Explorer and expand Components, Layout and Pages',
        'Open App.razor and find <Routes /> and <script src="_framework/blazor.web.js"></script>',
        'Right-click Pages > Add > Class, name it Counter.razor.cs (Visual Studio nests it under Counter.razor)',
        'Make it public partial class Counter and move the @code contents into it, then delete the @code block',
        'Press Ctrl+F5 - the page works exactly the same',
      ],
      code: folderCode,
      result: `Solution Explorer
  Counter.razor
    Counter.razor.cs   (nested)
/counter still shows "Current count: 0" and the button still increments`,
      explanation:
        'The Razor compiler turns Counter.razor into a partial class named Counter in a namespace that follows the folder (SchoolPortal.Components.Pages). Your .razor.cs file adds the other half of the same partial class. _Imports.razor applies its @using lines to every component in that folder and below, and "@using static ...RenderMode" is why you can write InteractiveServer without a prefix.',
    },
    {
      title: 'Console demo: how Blazor renders and diffs a component',
      scenario:
        'Understand in plain C# what happens behind @onclick: the component class builds a render tree, Blazor compares it with the previous one and patches only what changed. Several state changes inside one event cause only one render.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it RenderTreeDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 and compare the output with the comments',
      ],
      code: renderSimCode,
      csharp: { files: { 'Program.cs': renderSimCode }, stdin: '' },
      result: `-- first render --
INSERT <h1>Counter</h1>
INSERT <p>Current count: 0</p>
INSERT <button>Click me</button>
-- user clicks once --
UPDATE <p>Current count: 1</p>
-- user clicks twice, one render --
UPDATE <p>Current count: 3</p>`,
      explanation:
        'The first render inserts all three elements. After one click only the <p> text differs, so only one UPDATE is sent - the heading and button are untouched. In the third part the count changes twice but we render once, so the browser jumps from 1 to 3. Real Blazor works the same way: it renders once after an event handler completes, which is why changing many fields in one handler is cheap.',
    },
  ],
  interview: [
    { q: 'What is Blazor?', a: 'A .NET framework (part of ASP.NET Core) for building interactive web UIs with C# and Razor components instead of JavaScript. Components can run on the server (over SignalR) or in the browser (WebAssembly).', level: 'Easy' },
    { q: 'What is the difference between Blazor Server and Blazor WebAssembly?', a: 'Server runs components on the server and sends UI diffs over a SignalR circuit: fast first load, direct server access, but needs a constant connection and server memory per user. WebAssembly downloads the .NET runtime and DLLs to the browser: works offline and scales like static files, but has a larger first download, code is visible to users and data must come through a Web API.', level: 'Easy' },
    { q: 'What render modes exist in .NET 8+ Blazor Web Apps?', a: 'Static Server (Static SSR, the default, no interactivity), InteractiveServer, InteractiveWebAssembly and InteractiveAuto. They can be applied per page/component with @rendermode or globally on <Routes> in App.razor.', level: 'Easy' },
    { q: 'How does InteractiveAuto decide where to run?', a: 'On the first visit it uses Interactive Server so the page is interactive immediately, while the WebAssembly bundle downloads in the background. On later visits, when the runtime is cached, it uses WebAssembly. The component must be in the .Client project.', level: 'Medium' },
    { q: 'What is prerendering and what problem can it cause?', a: 'The server renders the component\'s HTML first so content appears quickly and is SEO-friendly; then it becomes interactive. Side effect: OnInitializedAsync runs twice (prerender + interactive), so API calls happen twice and JS interop is not available during prerender. Fix with PersistentComponentState or disable prerender for that component.', level: 'Medium' },
    { q: 'What is a circuit in Blazor Server?', a: 'The server-side session for one browser tab: a SignalR connection plus the component instances and their state kept in server memory. If the connection is lost the client tries to reconnect; if the circuit is gone the state is lost.', level: 'Medium' },
    { q: 'What does a .razor file compile into?', a: 'A partial C# class that inherits ComponentBase. Markup becomes a BuildRenderTree method and @code members become class members. The class name is the file name and the namespace follows the folder.', level: 'Medium' },
    { q: 'Why does my button do nothing in a new Blazor Web App page?', a: 'The page is Static SSR by default. Add @rendermode InteractiveServer (or another interactive mode) and make sure the matching services and AddInteractive...RenderMode() are registered in Program.cs.', level: 'Easy' },
    { q: 'What is the purpose of _Imports.razor?', a: 'It holds @using (and other) directives applied to all components in its folder and sub-folders, so you do not repeat them in every file.', level: 'Easy' },
    { q: 'When would you choose Blazor WebAssembly over Server?', a: 'When the app must work offline (PWA), when you want to host it as static files/CDN, when you have many concurrent users and do not want server memory per user, or when UI interactions must not wait for the network.', level: 'Medium' },
    { q: 'Is it safe to put an API key or connection string in a Blazor WebAssembly app?', a: 'No. All WebAssembly code and configuration is downloaded to the browser and can be decompiled. Keep secrets on the server behind a Web API.', level: 'Medium' },
    { q: 'How does Blazor update the DOM efficiently?', a: 'Each render produces a render tree. Blazor diffs it against the previous tree and applies only the minimal changes to the DOM, similar to React\'s virtual DOM. Rendering happens after event handlers and lifecycle methods, not on every field change.', level: 'Hard' },
    { q: 'What is streaming rendering?', a: 'With [StreamRendering] on a Static SSR page, the server sends the initial HTML (for example a loading message) immediately, keeps the response open while async work finishes, and streams the updated HTML into the same response. It improves perceived speed without full interactivity.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Blazor Web App named CollegeApp with Interactive Server render mode, add a page /greet with a text field bound to a name and a button that shows "Welcome, <name>!".',
      hint: 'Use @rendermode InteractiveServer, a string field, <input @bind="name" /> and a message field set in the click handler.',
      solution: `@page "/greet"
@rendermode InteractiveServer

<h3>Greeting</h3>
<input class="form-control" @bind="name" placeholder="Your name" />
<button class="btn btn-success mt-2" @onclick="Greet">Greet</button>
<p class="mt-2">@message</p>

@code {
    private string name = "";
    private string message = "";

    private void Greet() =>
        message = string.IsNullOrWhiteSpace(name) ? "Please type your name" : $"Welcome, {name}!";
}`,
    },
    {
      task: 'Write a Static SSR page /toppers that lists students with marks, shows only those with marks >= 75 and prints the class average.',
      hint: 'Use LINQ Where and Average inside @code and @foreach in markup. No @rendermode is needed.',
      solution: `@page "/toppers"
<h3>Toppers</h3>
<ul>
    @foreach (var s in students.Where(s => s.Marks >= 75))
    {
        <li>@s.Name - @s.Marks</li>
    }
</ul>
<p>Class average: @students.Average(s => s.Marks).ToString("0.0")</p>

@code {
    private record Student(string Name, int Marks);
    private List<Student> students = new()
    {
        new("Asha", 88), new("Ravi", 64), new("Neha", 91), new("Om", 75)
    };
}`,
    },
    {
      task: 'Move the logic of the /greet page into a code-behind file Greet.razor.cs.',
      hint: 'The class must be public partial class Greet in the same namespace as the folder.',
      solution: `// Components/Pages/Greet.razor.cs
namespace CollegeApp.Components.Pages;

public partial class Greet
{
    private string name = "";
    private string message = "";

    private void OnGreet() =>
        message = string.IsNullOrWhiteSpace(name) ? "Please type your name" : $"Welcome, {name}!";
}
// In Greet.razor remove the @code block and use @onclick="OnGreet"`,
    },
    {
      task: 'Make every page of an existing Blazor Web App interactive (global Server interactivity) without adding @rendermode to each page.',
      hint: 'Set the render mode on HeadOutlet and Routes in App.razor.',
      solution: `@* Components/App.razor *@
<head>
    ...
    <HeadOutlet @rendermode="InteractiveServer" />
</head>
<body>
    <Routes @rendermode="InteractiveServer" />
    <script src="_framework/blazor.web.js"></script>
</body>
@* Program.cs must have AddInteractiveServerComponents() and AddInteractiveServerRenderMode() *@`,
    },
    {
      task: 'Write a comparison table (in your notes) of Static SSR, Interactive Server, Interactive WebAssembly and Interactive Auto with: where code runs, first load, needs connection, best use case.',
      hint: 'Think about where C# executes and what the browser downloads.',
      solution: `Mode            | Code runs        | First load | Needs live connection | Best for
Static SSR      | Server per req   | Fastest    | No                    | Content, SEO pages, simple forms
Interactive Svr | Server (circuit) | Fast       | Yes (SignalR)         | Internal/admin apps, DB-heavy screens
Interactive WASM| Browser          | Slow (MBs) | No (calls Web API)    | Offline, rich client UI, static hosting
Interactive Auto| Server then WASM | Fast       | Only on first visit   | Public apps wanting fast start + client speed`,
    },
  ],
  quiz: [
    {
      question: 'In a new .NET 8 Blazor Web App page without any @rendermode, what happens when the user clicks a button with @onclick?',
      options: ['The C# handler runs on the server through SignalR', 'Nothing - the page is Static SSR and not interactive', 'The handler runs in WebAssembly', 'The page reloads and the handler runs'],
      answer: 1,
      explanation: 'Static SSR is the default. Without an interactive render mode the HTML is rendered once and @onclick handlers are not connected.',
    },
    {
      question: 'Which statement about Blazor Server is TRUE?',
      options: ['The .NET runtime is downloaded to the browser', 'It works fully offline', 'UI events are sent to the server over a SignalR connection', 'It cannot access a database directly'],
      answer: 2,
      explanation: 'Blazor Server keeps components on the server; events and UI diffs travel over a SignalR circuit, and the server can access the database directly.',
    },
    {
      question: 'Where must a component with @rendermode InteractiveWebAssembly be placed in the Auto template?',
      options: ['In the server project Components/Pages folder', 'In wwwroot', 'In the .Client project', 'In App.razor'],
      answer: 2,
      explanation: 'Only code in the .Client project is compiled into the WebAssembly bundle that is downloaded to the browser.',
    },
    {
      question: 'What does <p>@(price * qty)</p> need the parentheses for?',
      options: ['To call a method', 'Because the expression contains an operator, so Razor needs explicit boundaries', 'To make the value HTML-encoded', 'Parentheses are never required in Razor'],
      answer: 1,
      explanation: 'Implicit expressions (@price) stop at spaces and most operators. Use @( ... ) for anything more complex.',
    },
    {
      question: 'Which file contains the <Router> that maps URLs to @page components in the Blazor Web App template?',
      options: ['Routes.razor', 'Program.cs', '_Imports.razor', 'launchSettings.json'],
      answer: 0,
      explanation: 'Routes.razor contains <Router AppAssembly="..."> with <RouteView> and a default layout; App.razor renders <Routes />.',
    },
  ],
};
