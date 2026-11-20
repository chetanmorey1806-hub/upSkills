export default {
  lesson: 'day-10-blazor-introduction',
  minutes: 20,
  intro: 'Check that you can pick the right Blazor hosting model and render mode, read Razor syntax and know the Blazor Web App project structure.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A field-sales app for a pharma company must keep working on tablets with **no internet** in villages and sync later. Which Blazor model fits best?',
      options: ['Blazor Server', 'Blazor WebAssembly (as a PWA)', 'Static SSR only', 'Razor Pages'],
      answer: 1,
      explain: 'Blazor WebAssembly downloads the .NET runtime and your DLLs to the browser, so the UI keeps running offline (installable as a PWA) and syncs with a Web API later. Blazor Server needs a live SignalR connection for every click, and Static SSR needs the server for every page.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `A new page in a .NET 8 Blazor Web App shows a button, but clicking it does nothing. Complete the directive that makes the page interactive **on the server**:
\`@rendermode ______\``,
      example: { title: 'other render modes', code: '@rendermode InteractiveWebAssembly\n@rendermode InteractiveAuto' },
      accept: ['InteractiveServer', 'RenderMode.InteractiveServer', '@rendermode InteractiveServer'],
      explain: 'Pages are Static SSR by default in the Blazor Web App template, so @onclick handlers are not connected. `@rendermode InteractiveServer` runs the component over a SignalR circuit. Program.cs must also have AddInteractiveServerComponents() and AddInteractiveServerRenderMode().',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about **Blazor Server** (Interactive Server) are TRUE? Select all that apply.',
      options: [
        'UI events travel to the server over a SignalR (WebSocket) connection',
        'The server keeps state (a circuit) in memory for every connected user',
        'The full .NET runtime is downloaded to the browser',
        'The first load is fast because only a small script is downloaded',
        'It keeps working when the network connection is lost',
      ],
      answers: [0, 1, 3],
      explain: 'Blazor Server runs components on the server: events go over SignalR, the server holds a circuit per user, and the browser only downloads blazor.web.js, so it starts fast. Downloading the runtime is WebAssembly, and Server stops working when the connection drops (it shows a reconnect message).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In the Blazor Web App template, which file contains the `<Router>` that maps URLs to components with `@page`?',
      options: ['Program.cs', 'Components/Routes.razor', 'Components/_Imports.razor', 'wwwroot/index.html'],
      answer: 1,
      explain: 'Routes.razor contains <Router AppAssembly=...> with <RouteView> and the default layout. App.razor renders <Routes />. _Imports.razor only holds shared @using directives.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'This console program imitates how Blazor renders a component and sends only the differences (the diff) to the browser. Write the exact output.',
      example: { title: 'how to trace it', text: 'Keep a note of the previous list. For each position: no previous item = INSERT, different text = UPDATE. If nothing changed in a render, the program prints NO CHANGES.' },
      code: `using System;
using System.Collections.Generic;

List<string> previous = new();
var counter = new CounterComponent();
Render();
counter.Increment(); counter.Increment();
Render();
Render();
counter.Increment();
Render();

void Render()
{
    var current = counter.BuildRenderTree();
    int changes = 0;
    for (int i = 0; i < current.Count; i++)
    {
        if (i >= previous.Count) { Console.WriteLine($"INSERT {current[i]}"); changes++; }
        else if (previous[i] != current[i]) { Console.WriteLine($"UPDATE {current[i]}"); changes++; }
    }
    if (changes == 0) Console.WriteLine("NO CHANGES");
    previous = current;
}

class CounterComponent
{
    private int count;
    public void Increment() => count += 5;
    public List<string> BuildRenderTree() => new() { "<h1>Likes</h1>", $"<p>{count}</p>" };
}`,
      expected: `INSERT <h1>Likes</h1>
INSERT <p>0</p>
UPDATE <p>10</p>
NO CHANGES
UPDATE <p>15</p>`,
      explain: 'The first render inserts both elements. Two increments (+5 each) happen before the second render, so only one UPDATE to 10 is sent - the heading did not change. Rendering again without changes produces no diff. The last increment makes 15. Real Blazor works the same way: it renders after an event handler and patches only what changed.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A page uses `@rendermode InteractiveAuto`. What happens on the user\'s **first** visit?',
      options: [
        'It waits until the WebAssembly files are downloaded before becoming interactive',
        'It runs as Interactive Server immediately while the WebAssembly files download in the background',
        'It is Static SSR forever',
        'It throws an error unless the browser supports WebAssembly'
      ],
      answer: 1,
      explain: 'Auto gives a fast start with Server interactivity on the first visit and switches to WebAssembly on later visits once the runtime is cached. That is why Auto components must live in the .Client project.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inside a component, show the total of \`price\` multiplied by \`qty\`. Razor needs an explicit expression here. Complete the markup:
\`<p>Total: Rs ______</p>\``,
      example: { title: 'implicit vs explicit', code: '<p>@studentName</p>          implicit expression\n<p>@(marks * 100 / total)</p>  explicit expression' },
      accept: ['@(price * qty)', '@(qty * price)', '@(price*qty)', '@(qty*price)'],
      explain: 'An implicit expression like @price stops at the space or operator, so "@price * qty" would print the price followed by the text "* qty". Wrap anything with operators in @( ... ).',
    },
  ],
};
