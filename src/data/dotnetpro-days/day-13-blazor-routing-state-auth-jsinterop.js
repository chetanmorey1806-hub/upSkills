const routingRazor = `@* ===== Components/Pages/ProductDetails.razor ===== *@
@page "/products/{Id:int}"
@page "/products/{Id:int}/{Slug}"
@rendermode InteractiveServer
@inject NavigationManager Nav

<h3>Product @Id @(Slug is null ? "" : $"({Slug})")</h3>
<p>Opened from: @(From ?? "direct link") | Current URL: @Nav.Uri</p>

<button class="btn btn-secondary" @onclick='() => Nav.NavigateTo($"/products/{Id + 1}?from=details")'>Next product</button>
<button class="btn btn-link" @onclick="BackToList">Back to list</button>

@code {
    [Parameter] public int Id { get; set; }              // from {Id:int}
    [Parameter] public string? Slug { get; set; }        // from the second route, optional

    [SupplyParameterFromQuery(Name = "from")]
    public string? From { get; set; }                    // from ?from=...

    private void BackToList() => Nav.NavigateTo("/products?page=1");
}

@* ===== Components/Pages/Docs.razor : catch-all route ===== *@
@page "/docs/{*PagePath}"
<p>Showing document: @PagePath</p>
@code { [Parameter] public string? PagePath { get; set; } }

@* ===== Components/Layout/NavMenu.razor : NavLink adds "active" automatically ===== *@
<NavLink class="nav-link" href="" Match="NavLinkMatch.All">Home</NavLink>
<NavLink class="nav-link" href="products">Products</NavLink>
<NavLink class="nav-link" href="admin/orders">Admin</NavLink>

@* ===== Components/Routes.razor (.NET 8+) ===== *@
<Router AppAssembly="typeof(Program).Assembly">
    <Found Context="routeData">
        <AuthorizeRouteView RouteData="routeData" DefaultLayout="typeof(Layout.MainLayout)">
            <NotAuthorized><RedirectToLogin /></NotAuthorized>
        </AuthorizeRouteView>
        <FocusOnNavigate RouteData="routeData" Selector="h1" />
    </Found>
</Router>

// Route constraints: {id:int} {price:decimal} {date:datetime} {active:bool} {id:guid} {code:long}
// NavigationManager: Nav.Uri, Nav.BaseUri, Nav.NavigateTo(url, forceLoad: true),
// Nav.GetUriWithQueryParameter("page", 2), Nav.LocationChanged event`;

const layoutRazor = `@* ===== Components/Layout/MainLayout.razor ===== *@
@inherits LayoutComponentBase

<div class="page">
    <div class="sidebar"><NavMenu /></div>
    <main>
        <div class="top-row px-4">
            <CartBadge />
            <AuthorizeView>
                <Authorized>Hello, @context.User.Identity?.Name! <a href="logout">Logout</a></Authorized>
                <NotAuthorized><a href="login">Login</a></NotAuthorized>
            </AuthorizeView>
        </div>
        <CascadingValue Value="theme" IsFixed="true">
            <article class="content px-4">
                @Body            @* the current page is rendered here *@
            </article>
        </CascadingValue>
    </main>
</div>

@code {
    private AppTheme theme = new("dark", "Rs");
}

@* ===== Components/Layout/AdminLayout.razor (nested layout) ===== *@
@inherits LayoutComponentBase
@layout MainLayout

<div class="alert alert-warning">Admin area - all actions are logged</div>
@Body

@* ===== Components/Pages/Admin/_Imports.razor : every page in this folder uses AdminLayout ===== *@
@layout AdminLayout
@attribute [Authorize(Roles = "Admin")]

@* ===== Components/Pages/Admin/Orders.razor ===== *@
@page "/admin/orders"
<h3>All orders</h3>
<p>Theme from cascading value: @Theme?.Name, currency @Theme?.Currency</p>

@code {
    [CascadingParameter] public AppTheme? Theme { get; set; }
}

// ===== Models/AppTheme.cs =====
public record AppTheme(string Name, string Currency);`;

const stateRazor = `// ===== Services/CartState.cs =====
public class CartState
{
    private readonly List<CartItem> items = new();
    public IReadOnlyList<CartItem> Items => items;
    public int Count => items.Sum(i => i.Qty);
    public decimal Total => items.Sum(i => i.Qty * i.Price);

    public event Action? OnChange;            // components subscribe to re-render

    public void Add(string name, decimal price)
    {
        var existing = items.FirstOrDefault(i => i.Name == name);
        if (existing is null) items.Add(new CartItem { Name = name, Price = price, Qty = 1 });
        else existing.Qty++;
        OnChange?.Invoke();
    }

    public void Remove(string name)
    {
        items.RemoveAll(i => i.Name == name);
        OnChange?.Invoke();
    }
}

public class CartItem
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Qty { get; set; }
}

// ===== Program.cs =====
builder.Services.AddScoped<CartState>();          // one cart per user (per circuit / per browser tab in WASM)
// AddSingleton would share ONE cart between ALL users on Blazor Server - a serious bug
// AddTransient would give every component its own empty cart

@* ===== Components/Shared/CartBadge.razor ===== *@
@implements IDisposable
@inject CartState Cart

<a href="cart" class="btn btn-outline-primary">Cart (@Cart.Count)</a>

@code {
    protected override void OnInitialized() => Cart.OnChange += Refresh;
    private void Refresh() => InvokeAsync(StateHasChanged);
    public void Dispose() => Cart.OnChange -= Refresh;    // avoid memory leaks
}

@* ===== Components/Pages/Catalog.razor ===== *@
@page "/catalog"
@rendermode InteractiveServer
@inject CartState Cart

<button @onclick='() => Cart.Add("Earphones", 799)'>Add Earphones</button>
<button @onclick='() => Cart.Add("Phone Cover", 249)'>Add Phone Cover</button>

@* Tip: the layout (and CartBadge) must be interactive too for the badge to update -
   use global interactivity (<Routes @rendermode="InteractiveServer" />) for apps with shared state *@`;

const stateSimCode = `using System;
using System.Collections.Generic;
using System.Linq;

var cart = new CartState();            // AddScoped<CartState>() = one instance per user
var badge = new CartBadge(cart);       // lives in the layout header
var summary = new CartSummary(cart);   // lives on the cart page

cart.Add("Earphones", 799);
cart.Add("Phone Cover", 249);
cart.Add("Earphones", 799);
cart.Remove("Phone Cover");

summary.Dispose();                     // user navigated away from the cart page
cart.Add("Charger", 599);

class CartState
{
    private readonly Dictionary<string, (int Qty, int Price)> items = new();
    public event Action? OnChange;
    public int Count => items.Values.Sum(i => i.Qty);
    public int Total => items.Values.Sum(i => i.Qty * i.Price);

    public void Add(string name, int price)
    {
        items[name] = items.TryGetValue(name, out var i) ? (i.Qty + 1, price) : (1, price);
        Console.WriteLine($"Add {name}");
        OnChange?.Invoke();
    }

    public void Remove(string name)
    {
        if (items.Remove(name))
        {
            Console.WriteLine($"Remove {name}");
            OnChange?.Invoke();
        }
    }
}

class CartBadge
{
    public CartBadge(CartState cart) =>
        cart.OnChange += () => Console.WriteLine($"  [Badge] Cart ({cart.Count})");
}

class CartSummary : IDisposable
{
    private readonly CartState cart;
    public CartSummary(CartState cart)
    {
        this.cart = cart;
        cart.OnChange += Render;
    }
    private void Render() => Console.WriteLine($"  [Summary] {cart.Count} items, Rs {cart.Total}");
    public void Dispose()
    {
        cart.OnChange -= Render;
        Console.WriteLine("Summary disposed (unsubscribed)");
    }
}
`;

const authCode = `// ===== Web API side (from the JWT day): POST /api/auth/login returns { "token": "eyJ..." }
// The token contains claims: name, role, exp. Signed with the API's secret key.

// ===== Blazor WebAssembly (.Client) : Auth/JwtAuthStateProvider.cs =====
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.JSInterop;

public class JwtAuthStateProvider(IJSRuntime js) : AuthenticationStateProvider
{
    private static readonly AuthenticationState Anonymous = new(new ClaimsPrincipal(new ClaimsIdentity()));

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        var token = await js.InvokeAsync<string?>("localStorage.getItem", "authToken");
        if (string.IsNullOrEmpty(token)) return Anonymous;

        var claims = ParseClaims(token);
        var exp = claims.FirstOrDefault(c => c.Type == "exp")?.Value;
        if (exp is not null && DateTimeOffset.FromUnixTimeSeconds(long.Parse(exp)) <= DateTimeOffset.UtcNow)
            return Anonymous;                                   // expired token = logged out

        return new AuthenticationState(new ClaimsPrincipal(new ClaimsIdentity(claims, "jwt", "name", "role")));
    }

    public async Task LoginAsync(string token)
    {
        await js.InvokeVoidAsync("localStorage.setItem", "authToken", token);
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());   // AuthorizeView re-renders
    }

    public async Task LogoutAsync()
    {
        await js.InvokeVoidAsync("localStorage.removeItem", "authToken");
        NotifyAuthenticationStateChanged(Task.FromResult(Anonymous));
    }

    private static List<Claim> ParseClaims(string jwt)
    {
        string payload = jwt.Split('.')[1].Replace('-', '+').Replace('_', '/');
        payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=');
        var values = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(Convert.FromBase64String(payload))!;
        return values.Select(kv => new Claim(kv.Key, kv.Value.ToString())).ToList();
    }
}

// ===== Auth/BearerTokenHandler.cs : adds "Authorization: Bearer <token>" to every API call =====
public class BearerTokenHandler(IJSRuntime js) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        var token = await js.InvokeAsync<string?>("localStorage.getItem", "authToken");
        if (!string.IsNullOrEmpty(token))
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        return await base.SendAsync(request, ct);
    }
}

// ===== Program.cs (.Client / standalone WASM) =====
// dotnet add package Microsoft.AspNetCore.Components.WebAssembly.Authentication  (for AddAuthorizationCore helpers)
builder.Services.AddAuthorizationCore();
builder.Services.AddCascadingAuthenticationState();          // .NET 8+: replaces <CascadingAuthenticationState>
builder.Services.AddScoped<JwtAuthStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(sp => sp.GetRequiredService<JwtAuthStateProvider>());
builder.Services.AddTransient<BearerTokenHandler>();
builder.Services.AddHttpClient("api", c => c.BaseAddress = new Uri("https://localhost:7200/"))
       .AddHttpMessageHandler<BearerTokenHandler>();

@* ===== Pages/Login.razor ===== *@
@page "/login"
@inject IHttpClientFactory Factory
@inject JwtAuthStateProvider Auth
@inject NavigationManager Nav

<EditForm Model="model" OnValidSubmit="LoginAsync">
    <InputText @bind-Value="model.Email" placeholder="Email" />
    <InputText type="password" @bind-Value="model.Password" placeholder="Password" />
    <button type="submit">Login</button>
</EditForm>
<p class="text-danger">@error</p>

@code {
    private LoginModel model = new();
    private string? error;
    private record TokenResponse(string Token);
    public class LoginModel { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }

    private async Task LoginAsync()
    {
        var http = Factory.CreateClient("api");
        var response = await http.PostAsJsonAsync("api/auth/login", model);
        if (!response.IsSuccessStatusCode) { error = "Invalid email or password"; return; }
        var result = await response.Content.ReadFromJsonAsync<TokenResponse>();
        await Auth.LoginAsync(result!.Token);
        Nav.NavigateTo("/");
    }
}

@* ===== Using it in pages ===== *@
@page "/reports"
@attribute [Authorize(Roles = "Admin")]           @* whole page protected *@

<AuthorizeView Roles="Admin">
    <Authorized><button>Delete all logs</button></Authorized>
    <NotAuthorized><p>Only admins can see this button.</p></NotAuthorized>
</AuthorizeView>

<AuthorizeView>
    <Authorizing>Checking login...</Authorizing>
    <Authorized>Welcome @context.User.Identity?.Name</Authorized>
</AuthorizeView>`;

const jsInteropCode = `// ===== wwwroot/js/helpers.js (JavaScript module) =====
export function showToast(message) {
    const div = document.createElement('div');
    div.className = 'toast-msg';
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

export function copyText(text) {
    return navigator.clipboard.writeText(text).then(() => true, () => false);
}

export function watchOnline(dotNetRef) {
    // call a C# method from JavaScript
    window.addEventListener('online',  () => dotNetRef.invokeMethodAsync('SetOnline', true));
    window.addEventListener('offline', () => dotNetRef.invokeMethodAsync('SetOnline', false));
}

@* ===== Components/Pages/Invoice.razor ===== *@
@page "/invoice/{No:int}"
@rendermode InteractiveServer
@implements IAsyncDisposable
@inject IJSRuntime JS

<h3>Invoice INV-@No</h3>
<p>Status: @(online ? "Online" : "Offline - changes will sync later")</p>
<button class="btn btn-primary" @onclick="CopyLink">Copy link</button>
<button class="btn btn-danger" @onclick="Cancel">Cancel invoice</button>
<button class="btn btn-secondary" @onclick='() => JS.InvokeVoidAsync("print")'>Print</button>

@code {
    [Parameter] public int No { get; set; }
    private IJSObjectReference? module;
    private DotNetObjectReference<Invoice>? selfRef;
    private bool online = true;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;                               // JS is not available during prerender
        module = await JS.InvokeAsync<IJSObjectReference>("import", "./js/helpers.js");
        selfRef = DotNetObjectReference.Create(this);
        await module.InvokeVoidAsync("watchOnline", selfRef);
    }

    private async Task CopyLink()
    {
        bool ok = await module!.InvokeAsync<bool>("copyText", $"https://shop.example.in/invoice/{No}");
        await module.InvokeVoidAsync("showToast", ok ? "Link copied" : "Copy failed");
    }

    private async Task Cancel()
    {
        bool sure = await JS.InvokeAsync<bool>("confirm", $"Cancel invoice INV-{No}?");   // built-in browser function
        if (sure) await module!.InvokeVoidAsync("showToast", "Invoice cancelled");
    }

    [JSInvokable]                                              // callable from JavaScript
    public void SetOnline(bool value)
    {
        online = value;
        StateHasChanged();
    }

    public async ValueTask DisposeAsync()
    {
        selfRef?.Dispose();
        if (module is not null)
        {
            try { await module.DisposeAsync(); }
            catch (JSDisconnectedException) { }                 // circuit already gone (Blazor Server)
        }
    }
}`;

export default {
  id: 'day-13-blazor-routing-state-auth-jsinterop',
  title: 'Blazor Routing, Layouts, DI, State Management, Authentication with JWT and JavaScript Interop',
  module: 'Module 3: Blazor',
  day: 13,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'Turn components into a real application: routes with parameters, constraints and query strings, NavigationManager, layouts and nested layouts, dependency injection in components, sharing state with cascading values and a scoped state service, securing pages with AuthorizeView and a JWT-based AuthenticationStateProvider that talks to your Web API, and calling JavaScript from C# (and back) with IJSRuntime.',
  objectives: [
    'Define routes with @page, parameters, constraints, optional segments, catch-all and query parameters, and navigate with NavigationManager',
    'Create layouts and nested layouts and apply them per page or per folder',
    'Inject services into components and share state with CascadingValue and a scoped state service',
    'Protect pages and UI with [Authorize], AuthorizeView and a JWT AuthenticationStateProvider calling a Web API',
    'Call JavaScript functions and modules with IJSRuntime and call .NET from JavaScript with DotNetObjectReference',
  ],
  theory: [
    {
      heading: 'Routing and NavigationManager',
      content:
        'Any component with @page "/path" is a routable page. The Router in Routes.razor scans the assembly for these components. Route parameters are written in braces and mapped to [Parameter] properties with the same name (case-insensitive): @page "/products/{Id:int}". Constraints (:int, :guid, :bool, :datetime, :decimal, :long) make the route match only valid values - /products/abc then gives "Not found" instead of an exception. A component can have several @page directives (to make a segment optional), and {*path} catches everything after a prefix. Query strings are read with [SupplyParameterFromQuery]. NavigationManager (injected) gives the current Uri, NavigateTo(url) for code navigation (forceLoad: true does a full browser reload, needed after login/logout in some setups) and a LocationChanged event. NavLink renders an <a> that gets the "active" CSS class when its URL matches.',
      syntax: `@page "/products/{Id:int}"
@page "/products/{Id:int}/{Slug}"
@page "/docs/{*PagePath}"
[SupplyParameterFromQuery(Name = "page")] public int? PageNo { get; set; }
@inject NavigationManager Nav
Nav.NavigateTo($"/orders/{id}");
Nav.NavigateTo("/login", forceLoad: true);`,
      points: [
        'Optional parameters can also be written {Slug?}',
        'Route parameter names in the URL must match the [Parameter] property name',
        'NavLinkMatch.All makes "Home" active only on exactly "/"',
        'Navigating between /products/1 and /products/2 reuses the component: load data in OnParametersSetAsync',
      ],
    },
    {
      heading: 'Layouts',
      content:
        'A layout is a component that inherits LayoutComponentBase and renders @Body where the page content should appear. The default layout is set in Routes.razor (DefaultLayout="typeof(Layout.MainLayout)"). A page can choose a different layout with @layout AdminLayout, and putting @layout in a folder\'s _Imports.razor applies it to every page in that folder. Layouts can be nested: AdminLayout itself declares @layout MainLayout and adds an admin banner. Layouts are the natural place for the navigation menu, header (cart badge, user name, logout), footer and cascading values.',
      syntax: `@inherits LayoutComponentBase
<NavMenu />
<main>@Body</main>

@layout AdminLayout          // in a page or a folder's _Imports.razor`,
    },
    {
      heading: 'Dependency injection in components and state management',
      content:
        'Services are registered in Program.cs and injected with @inject Type Name (or [Inject] in code-behind). Lifetimes behave differently in Blazor: in Blazor Server a Scoped service lives for the whole circuit (one user, one browser tab) - not per HTTP request; in WebAssembly Scoped and Singleton both live as long as the browser tab. Never store per-user data in a Singleton on Blazor Server, because all users would share it. For state that many components need you have three options: (1) parameters and EventCallbacks (good for parent/child), (2) CascadingValue - a value provided high in the tree and received anywhere below with [CascadingParameter] (good for theme, current user, settings), (3) a scoped state container service with an OnChange event that components subscribe to (good for a shopping cart or notifications). For data that must survive a page refresh, store it in the database, browser localStorage (via JS interop) or ProtectedLocalStorage/ProtectedSessionStorage (Blazor Server).',
      syntax: `builder.Services.AddScoped<CartState>();
@inject CartState Cart
<CascadingValue Value="theme" IsFixed="true"> ... </CascadingValue>
[CascadingParameter] public AppTheme? Theme { get; set; }
Cart.OnChange += () => InvokeAsync(StateHasChanged);   // unsubscribe in Dispose!`,
      points: [
        'IsFixed="true" tells Blazor the cascading value never changes - better performance',
        'builder.Services.AddCascadingValue(sp => new AppTheme(...)) registers a root-level cascading value (.NET 8+)',
        'Always unsubscribe from service events in Dispose, otherwise the service keeps dead components alive (memory leak)',
        'Larger apps sometimes use Fluxor (Redux pattern) for state management',
      ],
    },
    {
      heading: 'Authentication and authorization in Blazor',
      content:
        'Blazor reads the current user from an AuthenticationStateProvider. Components use it through <AuthorizeView> (show different UI to logged-in users, roles or policies, with Authorized, NotAuthorized and Authorizing templates), the [Authorize] attribute on pages (handled by AuthorizeRouteView in Routes.razor) and [CascadingParameter] Task<AuthenticationState>. In .NET 8+ call builder.Services.AddCascadingAuthenticationState(). For Blazor Server/SSR you normally use ASP.NET Core Identity cookies (the template option "Individual Accounts"). For Blazor WebAssembly talking to a separate Web API the common pattern is JWT: the login page posts credentials to /api/auth/login, stores the returned token (localStorage or memory), a custom AuthenticationStateProvider reads the claims from the token, and a DelegatingHandler adds "Authorization: Bearer <token>" to every API request. Important: hiding a button in Blazor is only UI - the Web API must still check [Authorize] on every endpoint.',
      syntax: `<AuthorizeView Roles="Admin">
    <Authorized>...</Authorized>
    <NotAuthorized>...</NotAuthorized>
</AuthorizeView>
@attribute [Authorize(Policy = "CanEditMarks")]
NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());`,
      points: [
        'Inside AuthorizeView, "context" is the AuthenticationState: @context.User.Identity?.Name',
        'Tokens in localStorage can be read by any XSS script - keep tokens short-lived, use refresh tokens, sanitize output; the BFF pattern (cookies via a server backend) is the most secure option',
        'Microsoft.AspNetCore.Components.WebAssembly.Authentication supports OpenID Connect providers (Microsoft Entra ID, Auth0, Keycloak)',
      ],
    },
    {
      heading: 'JavaScript interop with IJSRuntime',
      content:
        'Blazor cannot do everything in C#: browser APIs (clipboard, geolocation, localStorage, print), charts and existing JS libraries need JavaScript. Inject IJSRuntime and call InvokeVoidAsync("functionName", args) when you do not need a result or InvokeAsync<T>("functionName", args) when you do. Function names are resolved from window (so "alert", "confirm", "localStorage.setItem" work). The modern way is a JS module: import it with InvokeAsync<IJSObjectReference>("import", "./js/file.js") and call its exported functions. To call C# from JavaScript, mark a method [JSInvokable], wrap the component in DotNetObjectReference.Create(this), pass it to JS, and call dotNetRef.invokeMethodAsync("MethodName", args). JS interop only works after the component has rendered interactively - use OnAfterRenderAsync(firstRender), never OnInitialized during prerendering.',
      syntax: `await JS.InvokeVoidAsync("alert", "Saved!");
bool ok = await JS.InvokeAsync<bool>("confirm", "Delete?");
var module = await JS.InvokeAsync<IJSObjectReference>("import", "./js/helpers.js");
await module.InvokeVoidAsync("showToast", "Hello");
[JSInvokable] public void SetOnline(bool value) { ... }`,
      points: [
        'Dispose IJSObjectReference and DotNetObjectReference (IAsyncDisposable) to avoid leaks',
        'Catch JSDisconnectedException in DisposeAsync on Blazor Server',
        'Arguments and results are JSON-serialized - keep them small; ElementReference can be passed to JS to work with a DOM element',
        'In WebAssembly, IJSInProcessRuntime allows synchronous calls',
      ],
    },
  ],
  examples: [
    {
      title: 'Routing: parameters, constraints, query strings and NavigationManager',
      scenario:
        'A product site needs URLs like /products/12, /products/12/boat-earphones and /products/13?from=details, a catch-all documentation route and a menu that highlights the current page.',
      steps: [
        'Add Components/Pages/ProductDetails.razor and Docs.razor from the code',
        'Update NavMenu.razor with the NavLink lines and check Routes.razor',
        'Press Ctrl+F5 and open /products/12, /products/12/boat-earphones, /products/abc and /docs/setup/install',
        'Click "Next product" several times and watch the URL and the "Opened from" text',
      ],
      code: routingRazor,
      result: `/products/12                 -> Product 12 | Opened from: direct link
/products/12/boat-earphones  -> Product 12 (boat-earphones)
Next product                 -> URL /products/13?from=details, "Opened from: details"
/products/abc                -> Not found (the :int constraint does not match)
/docs/setup/install          -> Showing document: setup/install
"Products" menu item has class="nav-link active" while on /products`,
      explanation:
        'Two @page directives make Slug optional. {Id:int} both converts the value and blocks invalid URLs. [SupplyParameterFromQuery] fills From from ?from=details. NavigateTo changes the URL without a full reload (an enhanced/client-side navigation); the same component instance gets new parameters. The catch-all {*PagePath} receives everything after /docs/ including slashes.',
    },
    {
      title: 'Layouts, nested layouts and cascading values',
      scenario:
        'The admin pages of a school ERP need a yellow warning banner on top of the normal site layout, should be restricted to admins, and every page needs the current theme and currency without passing parameters through every level.',
      steps: [
        'Edit Components/Layout/MainLayout.razor as shown (CascadingValue around @Body)',
        'Add Components/Layout/AdminLayout.razor',
        'Create folder Components/Pages/Admin with its own _Imports.razor and Orders.razor',
        'Add Models/AppTheme.cs, press Ctrl+F5 and open / and then /admin/orders (after logging in as Admin)',
      ],
      code: layoutRazor,
      result: `/            -> sidebar + header (Cart badge, Login link) + Home content
/admin/orders (as Admin) -> sidebar + header + yellow banner "Admin area - all actions are logged"
                            All orders
                            Theme from cascading value: dark, currency Rs
/admin/orders (not logged in) -> redirected to the login page by AuthorizeRouteView`,
      explanation:
        'Orders.razor gets AdminLayout from the folder _Imports.razor, and AdminLayout is itself wrapped in MainLayout, so the page is rendered inside both. The CascadingValue in MainLayout provides AppTheme to every descendant; Orders.razor receives it by type with [CascadingParameter] without any parent passing it explicitly. The [Authorize(Roles = "Admin")] attribute in the folder _Imports.razor protects all admin pages at once.',
    },
    {
      title: 'State management: a scoped CartState service shared by components',
      scenario:
        'In an online store, clicking "Add" on the catalog page must update the cart badge in the header immediately, although the two components have no parent-child relationship.',
      steps: [
        'Add Services/CartState.cs and register it with builder.Services.AddScoped<CartState>()',
        'Add Components/Shared/CartBadge.razor and put <CartBadge /> in MainLayout',
        'Use global interactivity (<Routes @rendermode="InteractiveServer" /> in App.razor) so the layout is interactive',
        'Add Catalog.razor, press Ctrl+F5, open /catalog and click the buttons',
        'Open a second browser (or incognito window): it has its own empty cart because the service is scoped per circuit',
      ],
      code: stateRazor,
      result: `Click "Add Earphones" -> header shows Cart (1)
Click "Add Phone Cover" -> Cart (2)
Click "Add Earphones" again -> Cart (3)
Incognito window -> Cart (0)  (separate circuit, separate CartState instance)`,
      explanation:
        'Both components receive the SAME CartState instance because it is scoped to the user\'s circuit. Catalog changes the state; CartState raises OnChange; CartBadge\'s handler calls InvokeAsync(StateHasChanged) and re-renders. CartBadge unsubscribes in Dispose. If the service were a Singleton on Blazor Server, every customer would see everyone else\'s cart items.',
    },
    {
      title: 'Console demo: how a state container notifies subscribed components',
      scenario:
        'See the observer pattern behind the CartState service in plain C#: two "components" subscribe, one unsubscribes when it is disposed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it StateDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
      ],
      code: stateSimCode,
      csharp: { files: { 'Program.cs': stateSimCode }, stdin: '' },
      result: `Add Earphones
  [Badge] Cart (1)
  [Summary] 1 items, Rs 799
Add Phone Cover
  [Badge] Cart (2)
  [Summary] 2 items, Rs 1048
Add Earphones
  [Badge] Cart (3)
  [Summary] 3 items, Rs 1847
Remove Phone Cover
  [Badge] Cart (2)
  [Summary] 2 items, Rs 1598
Summary disposed (unsubscribed)
Add Charger
  [Badge] Cart (3)`,
      explanation:
        'Event handlers run in subscription order: the badge first, then the summary. Totals: 799; 799 + 249 = 1048; 2 x 799 + 249 = 1847; after removing the cover 2 x 799 = 1598. After summary.Dispose() removes its handler, only the badge reacts to "Add Charger" (3 items). Forgetting the -= in Dispose is the classic Blazor memory leak.',
    },
    {
      title: 'JWT authentication with a Web API: AuthenticationStateProvider, AuthorizeView and Bearer tokens',
      scenario:
        'A placement portal (Blazor WebAssembly) logs users in through the existing ASP.NET Core Web API that returns a JWT. Admin-only buttons and pages must be hidden for students, and every API call must send the token.',
      steps: [
        'Make sure the Web API has POST /api/auth/login returning { "token": "..." } with name and role claims, and CORS for the Blazor origin',
        'In the Blazor .Client (or standalone WASM) project install: dotnet add package Microsoft.AspNetCore.Components.WebAssembly.Authentication',
        'Add Auth/JwtAuthStateProvider.cs and Auth/BearerTokenHandler.cs, then the Program.cs registrations',
        'Add Pages/Login.razor; make Routes.razor use AuthorizeRouteView (Example 1)',
        'Run, log in as admin@school.in and then as a student, and compare /reports',
      ],
      code: authCode,
      result: `Not logged in : header "Login" link; /reports -> redirect to /login
Login (admin)  : POST api/auth/login 200 -> token saved in localStorage "authToken"
                 header "Hello, Asha Patil!", /reports shows "Delete all logs"
                 DevTools > Network > api/orders request has "Authorization: Bearer eyJ..."
Login (student): /reports -> "You are not authorized" (role check fails)
Wrong password : 401 from API -> "Invalid email or password"`,
      explanation:
        'The provider turns the token payload into claims, and ClaimsIdentity(claims, "jwt", "name", "role") tells .NET which claim is the name and which is the role, so IsInRole("Admin") and Roles="Admin" work. NotifyAuthenticationStateChanged makes every AuthorizeView re-render after login/logout. The DelegatingHandler attaches the token centrally. Expired tokens are treated as anonymous. Security reminder: the API must still validate the token signature and roles - the Blazor checks only control what is shown.',
    },
    {
      title: 'JavaScript interop: modules, confirm dialogs and calling C# from JS',
      scenario:
        'An invoice page in a billing app must copy a share link to the clipboard, ask for confirmation before cancelling, print, and show "Offline" when the internet connection drops.',
      steps: [
        'Create wwwroot/js/helpers.js with the exported functions',
        'Add Components/Pages/Invoice.razor',
        'Press Ctrl+F5 and open /invoice/1024',
        'Click Copy link, Cancel invoice and Print; then in DevTools > Network choose "Offline" (works best in WebAssembly mode; in Server mode the circuit itself disconnects)',
      ],
      code: jsInteropCode,
      result: `Copy link -> toast "Link copied", clipboard contains https://shop.example.in/invoice/1024
Cancel invoice -> browser dialog "Cancel invoice INV-1024?" -> OK -> toast "Invoice cancelled"
Print -> the browser print dialog opens
Browser goes offline -> JS calls SetOnline(false) -> "Status: Offline - changes will sync later"`,
      explanation:
        'The module is imported once in OnAfterRenderAsync(firstRender) because JS is not available during prerendering. InvokeAsync<bool> returns the JS promise result. "confirm" and "print" are global window functions, so they are called directly. DotNetObjectReference lets JavaScript call the [JSInvokable] SetOnline method; since the call comes from outside Blazor\'s event system, StateHasChanged is needed. DisposeAsync releases both references.',
    },
  ],
  interview: [
    { q: 'How do you define a route with a parameter in Blazor?', a: 'Use @page "/products/{Id:int}" and a [Parameter] public int Id { get; set; } property with the same name. The :int constraint ensures only integers match.', level: 'Easy' },
    { q: 'How do you navigate in code?', a: 'Inject NavigationManager and call Nav.NavigateTo("/path"). Use forceLoad: true to bypass client routing and do a full page load.', level: 'Easy' },
    { q: 'How do you read a query string value like ?page=2?', a: 'Add [SupplyParameterFromQuery] (optionally with Name = "page") to a public property of the routable component, e.g. public int? Page { get; set; }.', level: 'Medium' },
    { q: 'What is a layout and how do you apply one to all pages in a folder?', a: 'A component inheriting LayoutComponentBase that renders @Body. Add @layout MyLayout to the folder\'s _Imports.razor, or set DefaultLayout in Routes.razor for the whole app.', level: 'Easy' },
    { q: 'What does Scoped mean in Blazor Server compared to MVC?', a: 'In MVC a scoped service lives for one HTTP request. In Blazor Server it lives for the whole circuit (one user\'s connection/tab), which can be minutes or hours. In WebAssembly scoped behaves like singleton for that tab.', level: 'Medium' },
    { q: 'Why is storing user data in a Singleton dangerous in Blazor Server?', a: 'All users share one server process, so a singleton is shared by every user - one customer could see another customer\'s cart or data.', level: 'Medium' },
    { q: 'What is CascadingValue and when do you use it?', a: 'A component that provides a value to all descendants, which receive it with [CascadingParameter] without passing it through every level. Used for theme, current user/authentication state, settings, and form EditContext.', level: 'Medium' },
    { q: 'How do you share state between unrelated components?', a: 'Register a state container service (usually Scoped) with properties and an OnChange event. Components inject it, subscribe in OnInitialized with InvokeAsync(StateHasChanged) and unsubscribe in Dispose. Alternatives: Fluxor, or persisting to storage.', level: 'Medium' },
    { q: 'What is AuthenticationStateProvider?', a: 'The service Blazor uses to get the current user (AuthenticationState with a ClaimsPrincipal). Built-in implementations exist for Identity/cookies; you write a custom one for JWT and call NotifyAuthenticationStateChanged when login state changes.', level: 'Medium' },
    { q: 'Is AuthorizeView enough to secure data?', a: 'No. It only hides UI. A user can call the API directly or modify a WASM app. Every Web API endpoint must enforce [Authorize] and role/policy checks.', level: 'Medium' },
    { q: 'Where would you store a JWT in Blazor WebAssembly, and what are the risks?', a: 'Commonly localStorage or sessionStorage (simple, survives reloads) or memory (lost on refresh). Storage is readable by XSS scripts, so use short expiry + refresh tokens and avoid injecting raw HTML. The most secure pattern is BFF: tokens stay on a server, the browser uses an HttpOnly cookie.', level: 'Hard' },
    { q: 'How do you call a JavaScript function from C# and get a result?', a: 'Inject IJSRuntime and call await JS.InvokeAsync<T>("functionName", args); use InvokeVoidAsync when no result is needed. For modules, import with InvokeAsync<IJSObjectReference>("import", path).', level: 'Easy' },
    { q: 'How do you call C# from JavaScript?', a: 'Static: [JSInvokable] static method called with DotNet.invokeMethodAsync("AssemblyName", "Method", args). Instance: create DotNetObjectReference.Create(this), pass it to JS, and call ref.invokeMethodAsync("Method", args) on a [JSInvokable] instance method. Dispose the reference later.', level: 'Hard' },
    { q: 'Why does JS interop throw an error in OnInitializedAsync?', a: 'During prerendering there is no browser connection, so JavaScript calls cannot be made. Move the call to OnAfterRenderAsync(firstRender) or disable prerendering.', level: 'Hard' },
    { q: 'What is JSDisconnectedException?', a: 'Thrown in Blazor Server when you call JS after the circuit/connection is gone, typically in DisposeAsync when the user closed the tab. Catch it and ignore it during cleanup.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a /students page with paging using a query string (?page=2&size=5) and Previous/Next buttons that update the URL with NavigationManager.',
      hint: 'Use [SupplyParameterFromQuery] for page and size, and Nav.GetUriWithQueryParameter("page", n).',
      solution: `@page "/students"
@rendermode InteractiveServer
@inject NavigationManager Nav

@foreach (var s in all.Skip((Page - 1) * Size).Take(Size)) { <div>@s</div> }
<button disabled="@(Page <= 1)" @onclick="() => Go(Page - 1)">Previous</button>
<span>Page @Page</span>
<button disabled="@(Page * Size >= all.Count)" @onclick="() => Go(Page + 1)">Next</button>

@code {
    [SupplyParameterFromQuery(Name = "page")] public int? PageQ { get; set; }
    [SupplyParameterFromQuery(Name = "size")] public int? SizeQ { get; set; }
    int Page => PageQ is > 0 ? PageQ.Value : 1;
    int Size => SizeQ is > 0 ? SizeQ.Value : 5;
    List<string> all = Enumerable.Range(1, 23).Select(i => $"Student {i}").ToList();
    void Go(int p) => Nav.NavigateTo(Nav.GetUriWithQueryParameter("page", p));
}`,
    },
    {
      task: 'Create a NotificationService (scoped) with a list of messages and an OnChange event, a NotificationBell component in the layout that shows the unread count, and a page that adds a message.',
      hint: 'Same pattern as CartState: Add() raises OnChange; the bell subscribes and unsubscribes.',
      solution: `public class NotificationService
{
    public List<string> Messages { get; } = new();
    public int Unread { get; private set; }
    public event Action? OnChange;
    public void Add(string msg) { Messages.Add(msg); Unread++; OnChange?.Invoke(); }
    public void MarkRead() { Unread = 0; OnChange?.Invoke(); }
}
// Program.cs: builder.Services.AddScoped<NotificationService>();

@* NotificationBell.razor *@
@implements IDisposable
@inject NotificationService Notes
<button @onclick="Notes.MarkRead">Bell (@Notes.Unread)</button>
@code {
    protected override void OnInitialized() => Notes.OnChange += Changed;
    void Changed() => InvokeAsync(StateHasChanged);
    public void Dispose() => Notes.OnChange -= Changed;
}

@* Any page *@
<button @onclick='() => Notes.Add("Fee receipt generated")'>Pay fee</button>`,
    },
    {
      task: 'Show "Edit marks" only to users in the Teacher role and the student\'s own name to everyone logged in, using AuthorizeView. Protect the /marks/edit page with [Authorize(Roles = "Teacher")].',
      hint: 'Use AuthorizeView Roles="Teacher" and a separate AuthorizeView for the name.',
      solution: `<AuthorizeView>
    <Authorized>Logged in as @context.User.Identity?.Name</Authorized>
    <NotAuthorized><a href="login">Login</a></NotAuthorized>
</AuthorizeView>
<AuthorizeView Roles="Teacher">
    <a class="btn btn-warning" href="marks/edit">Edit marks</a>
</AuthorizeView>

@* Pages/MarksEdit.razor *@
@page "/marks/edit"
@attribute [Authorize(Roles = "Teacher")]
<h3>Edit marks</h3>`,
    },
    {
      task: 'Save and load a user\'s preferred theme ("light"/"dark") in localStorage with IJSRuntime and apply it on first render.',
      hint: 'Call localStorage.getItem in OnAfterRenderAsync(firstRender) and localStorage.setItem when the user switches.',
      solution: `@inject IJSRuntime JS
<button @onclick="Toggle">Theme: @theme</button>
@code {
    string theme = "light";
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;
        theme = await JS.InvokeAsync<string?>("localStorage.getItem", "theme") ?? "light";
        await JS.InvokeVoidAsync("document.body.setAttribute", "data-theme", theme);
        StateHasChanged();
    }
    async Task Toggle()
    {
        theme = theme == "light" ? "dark" : "light";
        await JS.InvokeVoidAsync("localStorage.setItem", "theme", theme);
        await JS.InvokeVoidAsync("document.body.setAttribute", "data-theme", theme);
    }
}`,
    },
    {
      task: 'In the StateDemo console program, what is printed if summary.Dispose() is removed and the last line adds "Charger" (599)?',
      hint: 'Both subscribers react. Total = 2 x 799 + 599.',
      solution: `...same lines as before up to "Remove Phone Cover" block, then:
Add Charger
  [Badge] Cart (3)
  [Summary] 3 items, Rs 2197`,
    },
  ],
  quiz: [
    {
      question: 'Which directive makes /orders/abc show "Not found" instead of binding a string to an int parameter?',
      options: ['@page "/orders/{Id}"', '@page "/orders/{Id:int}"', '@page "/orders/{*Id}"', '@page "/orders?Id=int"'],
      answer: 1,
      explanation: 'The :int route constraint only matches integer segments.',
    },
    {
      question: 'In Blazor Server, which lifetime gives each user their own shopping cart that lives for the whole session in that tab?',
      options: ['Singleton', 'Transient', 'Scoped', 'Static field'],
      answer: 2,
      explanation: 'Scoped services live for the circuit (one user/tab) in Blazor Server. Singleton is shared by all users.',
    },
    {
      question: 'A component wants a value provided by <CascadingValue Value="theme"> in the layout. Which attribute does it use?',
      options: ['[Parameter]', '[Inject]', '[CascadingParameter]', '[SupplyParameterFromQuery]'],
      answer: 2,
      explanation: '[CascadingParameter] receives cascading values by type (or by Name).',
    },
    {
      question: 'Where should you first call JavaScript through IJSRuntime in a prerendered component?',
      options: ['OnAfterRenderAsync when firstRender is true', 'The constructor', 'OnInitializedAsync', 'SetParametersAsync'],
      answer: 0,
      explanation: 'JS is unavailable during prerender; OnAfterRenderAsync runs only in the interactive browser context.',
    },
    {
      question: 'After a successful login your custom AuthenticationStateProvider must tell AuthorizeView to refresh. Which method does it call?',
      options: ['StateHasChanged()', 'NotifyAuthenticationStateChanged(...)', 'NavigationManager.Refresh()', 'InvokeAsync(Login)'],
      answer: 1,
      explanation: 'NotifyAuthenticationStateChanged raises AuthenticationStateChanged so the cascading authentication state and every AuthorizeView update.',
    },
  ],
};
