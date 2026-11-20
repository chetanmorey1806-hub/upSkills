export default {
  lesson: 'day-13-blazor-routing-state-auth-jsinterop',
  minutes: 25,
  intro: 'Practise Blazor routing, layouts, service lifetimes for shared state, AuthorizeView with JWT and JavaScript interop.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `The page must open for \`/orders/25\` but show "Not found" for \`/orders/abc\`. Complete the directive:
\`@page "______"\``,
      example: { title: 'other constraints', code: '@page "/students/{Id:guid}"\n@page "/reports/{Date:datetime}"' },
      accept: ['/orders/{Id:int}', '/orders/{id:int}', '/orders/{OrderId:int}'],
      acceptRegex: ['^/orders/\\{[A-Za-z]\\w*:int\\}$'],
      explain: 'The :int route constraint makes the route match only integer segments, so /orders/abc never reaches the component. The name inside the braces must match a [Parameter] property (case-insensitive), e.g. [Parameter] public int Id { get; set; }.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In a **Blazor Server** shop, a `CartState` service must give each customer their own cart that lives while they browse. Which registration is correct?',
      options: [
        'builder.Services.AddSingleton<CartState>();',
        'builder.Services.AddScoped<CartState>();',
        'builder.Services.AddTransient<CartState>();',
        'A static CartState field in MainLayout'
      ],
      answer: 1,
      explain: 'In Blazor Server a scoped service lives for the user\'s circuit (one browser tab), so every customer gets one cart shared by all their components. A singleton (or static field) is shared by ALL users on the server - a serious data leak. Transient gives each component its own empty cart.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'This console program imitates a scoped state service with an OnChange event and two components that subscribe to it. Write the exact output.',
      example: { title: 'tip', text: 'Event handlers run in the order they were subscribed. After Dispose() removes a handler, that component no longer reacts.' },
      code: `using System;

var notes = new NotificationService();
var bell = new Bell(notes);
var page = new InboxPage(notes);
notes.Add("Fee due");
notes.Add("Exam on Monday");
page.Dispose();
notes.MarkAllRead();
notes.Add("Result declared");

class NotificationService
{
    public int Unread { get; private set; }
    public event Action? OnChange;
    public void Add(string msg) { Unread++; Console.WriteLine($"New: {msg}"); OnChange?.Invoke(); }
    public void MarkAllRead() { Unread = 0; Console.WriteLine("All read"); OnChange?.Invoke(); }
}

class Bell
{
    public Bell(NotificationService s) => s.OnChange += () => Console.WriteLine($"  Bell ({s.Unread})");
}

class InboxPage : IDisposable
{
    private readonly NotificationService s;
    public InboxPage(NotificationService s) { this.s = s; s.OnChange += Refresh; }
    void Refresh() => Console.WriteLine($"  Inbox shows {s.Unread} unread");
    public void Dispose() => s.OnChange -= Refresh;
}`,
      expected: `New: Fee due
Bell (1)
Inbox shows 1 unread
New: Exam on Monday
Bell (2)
Inbox shows 2 unread
All read
Bell (0)
New: Result declared
Bell (1)`,
      explain: 'Both subscribers react to the first two changes (Bell first because it subscribed first). After page.Dispose() only the Bell remains, so "All read" and the last message update only the bell. Forgetting to unsubscribe in Dispose keeps dead components alive - the classic Blazor memory leak. (Leading spaces are ignored when your answer is checked.)',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Your Blazor WebAssembly app uses a JWT from the Web API. Which statements are TRUE? Select all that apply.',
      options: [
        '<AuthorizeView Roles="Admin"> only hides UI; the API must still check [Authorize] on every endpoint',
        'A custom AuthenticationStateProvider should call NotifyAuthenticationStateChanged after login and logout',
        'The JWT payload is encrypted, so it is safe to put the database password in it',
        'A DelegatingHandler can add "Authorization: Bearer <token>" to every HttpClient request',
        'Storing the token in localStorage means any XSS script on the page could read it'
      ],
      answers: [0, 1, 3, 4],
      explain: 'Blazor checks control what is shown; real security is on the server. NotifyAuthenticationStateChanged makes AuthorizeView re-render. A DelegatingHandler attaches the token centrally. The JWT payload is only Base64Url encoded - anyone can read it - so never put secrets in it, and localStorage is readable by injected scripts.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Ask the user "Delete invoice INV-1024?" with the browser\'s built-in confirm dialog and get true/false back in C#. Complete the call:
\`bool sure = await JS.______<bool>("confirm", "Delete invoice INV-1024?");\``,
      example: { title: 'no return value needed', code: 'await JS.InvokeVoidAsync("alert", "Saved!");' },
      accept: ['InvokeAsync'],
      caseSensitive: true,
      explain: 'IJSRuntime.InvokeAsync<T> calls a JavaScript function (resolved from window) and deserializes its result into T. InvokeVoidAsync is for functions whose result you do not need. Call JS only after the component has rendered interactively (not during prerendering).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Every page inside the `Components/Pages/Admin` folder must use `AdminLayout`. What is the simplest way?',
      options: [
        'Copy the admin banner markup into every admin page',
        'Add @layout AdminLayout to Components/Pages/Admin/_Imports.razor',
        'Change DefaultLayout in Routes.razor to AdminLayout',
        'Inherit every page from AdminLayout with @inherits'
      ],
      answer: 1,
      explain: 'Directives in a folder\'s _Imports.razor apply to every component in that folder and below, so one @layout line sets the layout for all admin pages. Changing DefaultLayout would affect the whole site, and pages inherit ComponentBase, not the layout.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A component in the layout needs the current theme object provided by `<CascadingValue Value="theme">` higher up. Which property declaration receives it?',
      options: [
        '[Parameter] public AppTheme? Theme { get; set; }',
        '[Inject] public AppTheme? Theme { get; set; }',
        '[CascadingParameter] public AppTheme? Theme { get; set; }',
        '[SupplyParameterFromQuery] public AppTheme? Theme { get; set; }'
      ],
      answer: 2,
      explain: '[CascadingParameter] receives values from a CascadingValue ancestor by type (or by Name) without passing them through every level. [Inject] is for DI services and [SupplyParameterFromQuery] reads the query string.',
    },
  ],
};
