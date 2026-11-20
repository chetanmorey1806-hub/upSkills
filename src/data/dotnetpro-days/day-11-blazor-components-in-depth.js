const bindingRazor = `@* ===== Components/Pages/StudentSearch.razor ===== *@
@page "/students/search"
@rendermode InteractiveServer

<h3>Student search</h3>

@* 1. @bind updates the field on "change" (when the input loses focus / Enter) *@
<label>Batch name (updates on change):</label>
<input class="form-control" @bind="batchName" />
<p>Batch: @batchName</p>

@* 2. @bind:event="oninput" updates on EVERY key press -> live search *@
<label>Search (updates while typing):</label>
<input class="form-control" @bind="searchText" @bind:event="oninput" @bind:after="OnSearchChanged" />

@* 3. Other input types *@
<label><input type="checkbox" @bind="onlyPlaced" /> Only placed students</label>

<select class="form-select" @bind="selectedCity">
    <option value="">All cities</option>
    <option value="Pune">Pune</option>
    <option value="Chennai">Chennai</option>
</select>

<input type="date" @bind="joinedAfter" @bind:format="yyyy-MM-dd" />

<p>@searchCount searches so far. Showing @Filtered().Count() of @students.Count</p>
<ul>
    @foreach (var s in Filtered())
    {
        <li @key="s.Id">@s.Name (@s.City) @(s.Placed ? "- placed" : "")</li>
    }
</ul>

@code {
    private string batchName = "Batch-A";
    private string searchText = "";
    private bool onlyPlaced;
    private string selectedCity = "";
    private DateOnly joinedAfter = new(2025, 1, 1);
    private int searchCount;

    private record Student(int Id, string Name, string City, bool Placed, DateOnly Joined);

    private List<Student> students = new()
    {
        new(1, "Asha Patil", "Pune", true, new(2025, 6, 1)),
        new(2, "Ravi Kumar", "Chennai", false, new(2025, 7, 15)),
        new(3, "Neha Shah", "Pune", false, new(2024, 12, 20)),
        new(4, "Arjun Iyer", "Chennai", true, new(2025, 3, 10))
    };

    // @bind:after runs AFTER the field has been updated (.NET 7+)
    private void OnSearchChanged() => searchCount++;

    private IEnumerable<Student> Filtered() => students
        .Where(s => s.Name.Contains(searchText, StringComparison.OrdinalIgnoreCase))
        .Where(s => !onlyPlaced || s.Placed)
        .Where(s => selectedCity == "" || s.City == selectedCity)
        .Where(s => s.Joined >= joinedAfter);
}`;

const productCardRazor = `@* ===== Components/Shared/ProductCard.razor (child) ===== *@
<div class="card p-2 mb-2">
    <h5>@Product.Name</h5>
    <p>Rs @Product.Price</p>
    @if (ShowDiscount)
    {
        <span class="badge bg-success">10% off</span>
    }
    <button class="btn btn-primary btn-sm" @onclick="AddClicked" disabled="@(Product.Stock == 0)">
        @(Product.Stock == 0 ? "Out of stock" : "Add to cart")
    </button>
</div>

@code {
    [Parameter, EditorRequired] public Product Product { get; set; } = default!;
    [Parameter] public bool ShowDiscount { get; set; }

    // Child -> parent communication
    [Parameter] public EventCallback<Product> OnAddToCart { get; set; }

    private async Task AddClicked() => await OnAddToCart.InvokeAsync(Product);
}

@* ===== Components/Shared/QuantityPicker.razor (two-way binding with a child) ===== *@
<button @onclick="() => Change(-1)">-</button>
<span class="mx-2">@Value</span>
<button @onclick="() => Change(1)">+</button>

@code {
    [Parameter] public int Value { get; set; }
    [Parameter] public EventCallback<int> ValueChanged { get; set; }   // name MUST be <Param>Changed

    private async Task Change(int delta)
    {
        int newValue = Math.Max(1, Value + delta);
        await ValueChanged.InvokeAsync(newValue);   // never assign the parameter directly
    }
}

@* ===== Components/Pages/Shop.razor (parent) ===== *@
@page "/shop"
@rendermode InteractiveServer

<h3>Shop (cart: @cart.Count items, Rs @cart.Sum(p => p.Price * quantity))</h3>

<QuantityPicker @bind-Value="quantity" />

@foreach (var p in products)
{
    <ProductCard Product="p" ShowDiscount="@(p.Price > 1000)" OnAddToCart="AddToCart" />
}

@code {
    private int quantity = 1;
    private List<Product> cart = new();
    private List<Product> products = new()
    {
        new("Earphones", 799, 10),
        new("Smart Watch", 2499, 5),
        new("Power Bank", 1199, 0)
    };

    private void AddToCart(Product p) => cart.Add(p);   // parent re-renders automatically
}

// ===== Models/Product.cs =====
public record Product(string Name, int Price, int Stock);`;

const renderFragmentRazor = `@* ===== Components/Shared/InfoCard.razor ===== *@
<div class="card mb-3">
    <div class="card-header fw-bold">@Title</div>
    <div class="card-body">
        @ChildContent           @* whatever the parent puts between the tags *@
    </div>
    @if (Footer is not null)
    {
        <div class="card-footer">@Footer</div>
    }
</div>

@code {
    [Parameter] public string Title { get; set; } = "";
    [Parameter] public RenderFragment? ChildContent { get; set; }   // name ChildContent is special
    [Parameter] public RenderFragment? Footer { get; set; }
}

@* ===== Components/Shared/DataList.razor (templated, generic) ===== *@
@typeparam TItem

@if (Items is null || !Items.Any())
{
    <p class="text-muted">@EmptyText</p>
}
else
{
    <ul class="list-group">
        @foreach (var item in Items)
        {
            <li class="list-group-item">@ItemTemplate(item)</li>
        }
    </ul>
}

@code {
    [Parameter, EditorRequired] public IEnumerable<TItem>? Items { get; set; }
    [Parameter, EditorRequired] public RenderFragment<TItem> ItemTemplate { get; set; } = default!;
    [Parameter] public string EmptyText { get; set; } = "Nothing to show";
}

@* ===== Usage: Components/Pages/Placements.razor ===== *@
@page "/placements"

<InfoCard Title="Placement drive - Infosys">
    <ChildContent>
        <p>Date: 12 Dec, Venue: Seminar Hall 2</p>
        <p>Eligibility: 60% throughout, no active backlogs</p>
    </ChildContent>
    <Footer>
        <a href="/apply">Apply now</a>
    </Footer>
</InfoCard>

<DataList Items="selected" Context="student">
    <ItemTemplate>
        <b>@student.Name</b> - @student.Company (Rs @student.Package LPA)
    </ItemTemplate>
</DataList>

<DataList Items="new List<string>()" EmptyText="No pending offers" ItemTemplate="@(s => @<span>@s</span>)" />

@code {
    private record Placed(string Name, string Company, double Package);
    private List<Placed> selected = new()
    {
        new("Asha", "Infosys", 6.5),
        new("Ravi", "TCS", 7.0)
    };
}`;

const lifecycleRazor = `@* ===== Components/Pages/OrderDetails.razor ===== *@
@page "/orders/{OrderId:int}"
@rendermode InteractiveServer
@implements IDisposable
@inject IJSRuntime JS
@inject ILogger<OrderDetails> Logger

<h3>Order #@OrderId</h3>

@if (order is null)
{
    <p>Loading...</p>
}
else
{
    <p>@order.Customer - @order.Status</p>
    <p>Last refreshed: @lastRefresh.ToString("HH:mm:ss")</p>
    <input @ref="noteBox" class="form-control" placeholder="Add a delivery note" />
}

<a href="/orders/@(OrderId + 1)">Next order</a>

@code {
    [Parameter] public int OrderId { get; set; }

    private OrderVm? order;
    private ElementReference noteBox;
    private DateTime lastRefresh;
    private Timer? timer;

    private record OrderVm(int Id, string Customer, string Status);

    // 1. Runs ONCE when the component is created (twice if prerendering is on)
    protected override void OnInitialized()
    {
        Logger.LogInformation("OnInitialized");
        // Refresh every 30 seconds. The timer callback runs on a thread-pool thread,
        // so use InvokeAsync(StateHasChanged) to get back onto the renderer's context.
        timer = new Timer(async _ =>
        {
            lastRefresh = DateTime.Now;
            await InvokeAsync(StateHasChanged);
        }, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));
    }

    // 2. Runs after OnInitialized AND every time the parent/route passes new parameters
    //    (/orders/5 -> /orders/6 reuses the same component instance!)
    protected override async Task OnParametersSetAsync()
    {
        Logger.LogInformation("OnParametersSetAsync for {OrderId}", OrderId);
        order = null;                              // show "Loading..." for the new id
        await Task.Delay(500);                     // pretend to call the API
        order = new OrderVm(OrderId, OrderId % 2 == 0 ? "Ravi" : "Asha", "Shipped");
        lastRefresh = DateTime.Now;
    }

    // 3. Runs after every render; the DOM exists now -> safe for JS interop / element refs
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (firstRender)
        {
            Logger.LogInformation("First render done");
        }
        if (order is not null)
        {
            await noteBox.FocusAsync();             // built-in helper for ElementReference
        }
    }

    // Optional: skip re-rendering when nothing visible changed
    protected override bool ShouldRender() => true;

    public void Dispose() => timer?.Dispose();     // always clean up timers / event handlers
}`;

const lifecycleSimCode = `using System;

var card = new StudentCard();

Console.WriteLine("== first render, Name=Asha ==");
card.SetParameters("Asha");

Console.WriteLine("== parent re-renders with the same Name ==");
card.SetParameters("Asha");

Console.WriteLine("== parent passes Name=Ravi ==");
card.SetParameters("Ravi");

Console.WriteLine("== user clicks Like ==");
card.OnLikeClicked();

// A tiny imitation of ComponentBase's lifecycle for a child with one [Parameter]
class StudentCard
{
    public string Name { get; private set; } = "";   // [Parameter] public string Name
    private bool initialized;
    private bool firstRender = true;
    private int likes;
    private string greeting = "";

    public void SetParameters(string name)
    {
        // Blazor skips a child whose primitive parameters did not change
        if (initialized && name == Name)
        {
            Console.WriteLine("Parameters unchanged -> child not re-rendered");
            return;
        }
        Name = name;
        if (!initialized)
        {
            initialized = true;
            OnInitialized();
        }
        OnParametersSet();
        StateHasChanged();
    }

    void OnInitialized() => Console.WriteLine("OnInitialized (runs once)");

    void OnParametersSet()
    {
        greeting = $"Hello {Name}";
        Console.WriteLine($"OnParametersSet -> {greeting}");
    }

    public void OnLikeClicked()
    {
        likes++;
        Console.WriteLine($"Like handler -> likes = {likes}");
        StateHasChanged();   // Blazor does this for you after an event handler
    }

    void StateHasChanged()
    {
        Console.WriteLine($"Render: <div>{greeting} | Likes: {likes}</div>");
        OnAfterRender(firstRender);
        firstRender = false;
    }

    void OnAfterRender(bool first) => Console.WriteLine($"OnAfterRender(firstRender: {first})");
}
`;

export default {
  id: 'day-11-blazor-components-in-depth',
  title: 'Blazor Components in Depth: Data Binding, Events, Parameters, RenderFragment and Lifecycle',
  module: 'Module 3: Blazor',
  day: 11,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Master the building blocks of every Blazor screen: one-way and two-way data binding with @bind and bind:event, event handling, passing data down with [Parameter] and events up with EventCallback, templated components with ChildContent and RenderFragment, the component lifecycle methods and when to call StateHasChanged.',
  objectives: [
    'Use @bind, @bind:event, @bind:after and @bind:format on inputs, checkboxes, selects and dates',
    'Handle DOM events with sync/async handlers, lambdas and event arguments',
    'Build parent-child components with [Parameter], EventCallback and @bind-Value',
    'Create reusable layouts with ChildContent, named RenderFragments and RenderFragment<T>',
    'Explain the lifecycle order (SetParametersAsync, OnInitialized{Async}, OnParametersSet{Async}, OnAfterRender{Async}, Dispose) and use StateHasChanged correctly',
  ],
  theory: [
    {
      heading: 'Data binding: one-way and two-way',
      content:
        'One-way binding prints a value: <p>@total</p>. Two-way binding with @bind connects an input to a field: the input shows the field value, and when the user changes the input the field is updated. By default @bind updates on the "change" event (when the textbox loses focus or Enter is pressed). Use @bind:event="oninput" to update on every keystroke - useful for live search. @bind:after="Method" runs a method after the value has been updated (for example to call an API). @bind:format controls the format for dates. @bind:get and @bind:set let you customise both directions. Binding works with text, number, checkbox (bool), select (string or enum) and date (DateTime/DateOnly) inputs.',
      syntax: `<input @bind="name" />                                 // updates on change
<input @bind="search" @bind:event="oninput" />         // updates on every key
<input @bind="search" @bind:after="SearchAsync" />     // run code after update
<input type="date" @bind="dob" @bind:format="yyyy-MM-dd" />
<input value="@name" @onchange="e => name = e.Value?.ToString()" />  // what @bind does internally`,
      points: [
        '@bind only works on fields/properties, not on method calls or read-only expressions',
        'Number inputs: if the user types text that cannot be parsed, Blazor keeps the old value',
        '@bind-Value is the syntax for binding to a CHILD component parameter (Value + ValueChanged)',
        'Use @key="item.Id" in loops so Blazor keeps the right element when items are added, removed or re-ordered',
      ],
    },
    {
      heading: 'Event handling',
      content:
        'Any DOM event can be attached with @on{event}: @onclick, @onchange, @oninput, @onkeydown, @onsubmit, @onmouseover and more. The handler can be a method name, a lambda (to pass arguments) or an async Task method. Blazor gives typed event arguments such as MouseEventArgs, KeyboardEventArgs and ChangeEventArgs. @onclick:preventDefault stops the browser default (for example following a link) and @onclick:stopPropagation stops the event bubbling to parents. After a handler finishes (or after each await in an async handler) Blazor automatically re-renders the component.',
      syntax: `<button @onclick="Save">Save</button>
<button @onclick="() => Delete(item.Id)">Delete</button>
<button @onclick="SaveAsync">Save</button>          // private async Task SaveAsync()
<input @onkeydown="OnKey" />                       // void OnKey(KeyboardEventArgs e) { if (e.Key == "Enter") ... }
<a href="#" @onclick="Open" @onclick:preventDefault>Open</a>`,
      points: [
        'Avoid async void handlers - return Task so Blazor can catch errors and re-render after completion',
        'In loops, copy the loop variable for "for" loops (var index = i;) before using it in a lambda; foreach is safe',
        'Interactive render mode is required for events to work',
      ],
    },
    {
      heading: 'Parameters and EventCallback: talking between components',
      content:
        'Data flows DOWN with parameters: mark a public property with [Parameter] and the parent sets it as an attribute: <ProductCard Product="p" />. [EditorRequired] gives a warning if the parent forgets it. Events flow UP with EventCallback or EventCallback<T>: the child calls await OnAddToCart.InvokeAsync(product) and the parent\'s method runs; EventCallback also re-renders the parent automatically (a plain Action delegate would not). A component should never change its own [Parameter] property, because the parent will overwrite it on its next render. For two-way binding between parent and child use the pattern Value + ValueChanged and write @bind-Value in the parent. [CascadingParameter] receives values from a CascadingValue higher in the tree (covered on Day 13).',
      syntax: `// Child
[Parameter, EditorRequired] public Product Product { get; set; } = default!;
[Parameter] public EventCallback<Product> OnAddToCart { get; set; }
await OnAddToCart.InvokeAsync(Product);

// Parent
<ProductCard Product="p" OnAddToCart="AddToCart" />
<QuantityPicker @bind-Value="quantity" />`,
      points: [
        'Parameters are set by the framework - do not new up components yourself',
        'EventCallback is a struct; check HasDelegate if the parent may not have provided one',
        'Unmatched attributes: [Parameter(CaptureUnmatchedValues = true)] public Dictionary<string, object>? Attrs + @attributes="Attrs"',
      ],
    },
    {
      heading: 'Child content and RenderFragment (templated components)',
      content:
        'A RenderFragment is a piece of UI passed as a parameter. If a component has a RenderFragment parameter named ChildContent, whatever the parent writes between the opening and closing tags goes into it - perfect for cards, modals, tabs and layouts. You can have several named fragments (Header, Body, Footer). RenderFragment<T> is a template that receives a value, used by generic components declared with @typeparam TItem, such as a reusable table or list where the parent decides how each item looks. Inside the template the item is available as "context" or a name you choose with Context="student".',
      syntax: `[Parameter] public RenderFragment? ChildContent { get; set; }
[Parameter] public RenderFragment<TItem> ItemTemplate { get; set; } = default!;

<InfoCard Title="Notice"><p>Exam on Monday</p></InfoCard>
<DataList Items="students" Context="s"><ItemTemplate>@s.Name</ItemTemplate></DataList>`,
      points: [
        'Render it with @ChildContent or @ItemTemplate(item)',
        'Real examples: a Modal with Title/Body/Footer, a Grid<TItem> with column templates, MudBlazor\'s MudTable',
      ],
    },
    {
      heading: 'Component lifecycle methods',
      content:
        'Blazor calls these methods in order. SetParametersAsync receives the parameters. OnInitialized / OnInitializedAsync run once when the component instance is created - load initial data here. OnParametersSet / OnParametersSetAsync run after initialization AND every time the parent passes new parameter values (for example when the route changes from /orders/5 to /orders/6, the same component instance is reused, so only OnParametersSet runs again). The component renders. OnAfterRender / OnAfterRenderAsync(bool firstRender) run after the DOM has been updated - the only safe place for JS interop and ElementReference focus; use firstRender to do one-time setup. ShouldRender() can return false to skip a render. Implement IDisposable or IAsyncDisposable to clean up timers and event subscriptions. If OnInitializedAsync awaits, Blazor renders once before the await completes (show "Loading...") and again after it completes.',
      points: [
        'Order on first load: SetParametersAsync -> OnInitialized -> OnInitializedAsync -> OnParametersSet -> OnParametersSetAsync -> render -> OnAfterRender(firstRender: true)',
        'With prerendering, OnInitialized{Async} runs twice and OnAfterRender is NOT called during prerender',
        'Do not call StateHasChanged inside OnAfterRender without a condition - you will create an infinite render loop',
        'Child components with only primitive parameters (string, int, bool...) that did not change are not re-rendered when the parent renders',
      ],
    },
    {
      heading: 'StateHasChanged and InvokeAsync',
      content:
        'StateHasChanged() tells Blazor "my state changed, please re-render". You do NOT need it after event handlers, EventCallbacks or lifecycle methods - Blazor calls it for you. You DO need it when state changes from outside Blazor\'s knowledge: a System.Threading.Timer callback, an event from a singleton service, a SignalR message, or in the middle of a long async method to show progress. Code running on another thread must call await InvokeAsync(StateHasChanged) so the render happens on the renderer\'s synchronization context; calling StateHasChanged directly from a timer thread in Blazor Server throws "The current thread is not associated with the Dispatcher".',
      syntax: `private async Task ImportAsync()
{
    for (int i = 1; i <= 5; i++)
    {
        progress = i * 20;
        StateHasChanged();          // show 20%, 40% ... while still inside the handler
        await Task.Delay(300);
    }
}
service.OnChange += () => InvokeAsync(StateHasChanged);`,
    },
  ],
  examples: [
    {
      title: 'Data binding: live student search with filters',
      scenario:
        'A training institute in Pune wants a page where the coordinator types a name and instantly sees matching students, and can filter by placed status, city and joining date.',
      steps: [
        'Open the Blazor Web App from Day 10 (Interactive Server)',
        'Right-click Components/Pages > Add > Razor Component > StudentSearch.razor and paste the code',
        'Press Ctrl+F5 and open /students/search',
        'Type "ar" in the search box, tick "Only placed", choose Chennai, then change the batch textbox and press Tab',
      ],
      code: bindingRazor,
      result: `Initially: Showing 3 of 4 (Neha joined 2024-12-20, before 2025-01-01)
  Asha Patil (Pune) - placed / Ravi Kumar (Chennai) / Arjun Iyer (Chennai) - placed
Type "ar" -> live update on each key: Showing 2 of 4 (Ravi Kumar, Arjun Iyer), "2 searches so far"
Tick Only placed -> Showing 1 of 4: Arjun Iyer (Chennai) - placed
Batch textbox: "Batch: ..." changes only after you press Tab or Enter (change event)`,
      explanation:
        'The search input uses @bind:event="oninput", so the field and the list update on every key press, and @bind:after increments the counter after each update. The batch textbox uses plain @bind, so it updates on change. The checkbox binds to a bool, the select to a string and the date input to a DateOnly with an explicit format. Filtered() is re-evaluated on every render, so all filters combine automatically. @key keeps list items stable.',
    },
    {
      title: 'Parent-child components: ProductCard with EventCallback and a QuantityPicker with @bind-Value',
      scenario:
        'An online electronics shop shows product cards. Clicking "Add to cart" in a child card must update the cart total in the parent page. A quantity picker component must support two-way binding.',
      steps: [
        'Create folder Components/Shared and add ProductCard.razor and QuantityPicker.razor',
        'Add "@using YourApp.Components.Shared" to Components/_Imports.razor',
        'Add Models/Product.cs with the record',
        'Add Components/Pages/Shop.razor (parent) and press Ctrl+F5, open /shop',
        'Click + twice, then "Add to cart" on Earphones and Smart Watch',
      ],
      code: productCardRazor,
      result: `Shop (cart: 0 items, Rs 0)
[-] 1 [+]  -> click + twice -> 3
Earphones   Rs 799   [Add to cart]
Smart Watch Rs 2499  10% off [Add to cart]
Power Bank  Rs 1199  10% off [Out of stock] (disabled)
After adding Earphones and Smart Watch with quantity 3:
Shop (cart: 2 items, Rs 9894)`,
      explanation:
        'Product and ShowDiscount flow down as parameters. The child raises OnAddToCart.InvokeAsync(Product); the parent\'s AddToCart runs and, because it came through an EventCallback, the parent re-renders and the heading updates. Total = (799 + 2499) * 3 = 3298 * 3 = 9894. QuantityPicker never sets Value itself; it calls ValueChanged and the parent\'s @bind-Value="quantity" updates the field and passes the new Value back down.',
    },
    {
      title: 'Templated components: InfoCard with ChildContent and a generic DataList<TItem>',
      scenario:
        'The placement cell repeats the same card and list markup on many pages. Build a reusable card with header, body and optional footer, and a generic list where each page decides how an item looks.',
      steps: [
        'Add InfoCard.razor and DataList.razor to Components/Shared',
        'Add Placements.razor to Components/Pages',
        'Press Ctrl+F5 and open /placements (no interactivity needed - this is pure rendering)',
      ],
      code: renderFragmentRazor,
      result: `[Placement drive - Infosys]
  Date: 12 Dec, Venue: Seminar Hall 2
  Eligibility: 60% throughout, no active backlogs
  footer: Apply now
- Asha - Infosys (Rs 6.5 LPA)
- Ravi - TCS (Rs 7 LPA)
No pending offers`,
      explanation:
        'Content between <InfoCard> tags becomes ChildContent; <Footer> fills the named fragment. DataList uses @typeparam TItem, so the compiler infers TItem = Placed from Items. Context="student" renames the template variable (default is "context"). The second DataList receives an empty list, so it shows EmptyText. The lambda syntax @(s => @<span>@s</span>) creates a RenderFragment<string> inline. Note: 7.0 prints as 7 in C#.',
    },
    {
      title: 'Lifecycle in a real page: route parameters, loading state, focus and timers',
      scenario:
        'An order-tracking page must load the order for the id in the URL, reload when the user clicks "Next order", focus a textbox after loading, refresh every 30 seconds and clean up when the user leaves.',
      steps: [
        'Add Components/Pages/OrderDetails.razor with the code below',
        'Press Ctrl+F5 and open /orders/5, then click "Next order"',
        'Watch the Output window (Debug > Windows > Output, "ASP.NET Core Web Server") for the log lines',
      ],
      code: lifecycleRazor,
      result: `/orders/5:
  "Loading..." for half a second, then "Asha - Shipped" and the note box gets focus
  Log: OnInitialized / OnParametersSetAsync for 5 / First render done
Click "Next order" (/orders/6):
  Log: OnParametersSetAsync for 6   (no OnInitialized - same instance reused)
  "Loading..." then "Ravi - Shipped"
Every 30 s: "Last refreshed" time updates without any click`,
      explanation:
        'Data that depends on a route parameter must be loaded in OnParametersSetAsync, not OnInitializedAsync - a classic bug is a page that does not change when only the id in the URL changes. Setting order = null before the await shows "Loading..." because Blazor renders when the async method yields. Element focus needs the DOM, so it is in OnAfterRenderAsync. The timer callback is outside Blazor, so it uses InvokeAsync(StateHasChanged), and Dispose stops the timer to avoid memory leaks.',
    },
    {
      title: 'Console demo: lifecycle order and when a child re-renders',
      scenario:
        'Trace the order of lifecycle calls for a child component with one string parameter: first render, parent re-render with the same value, a new value, and a click inside the child.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it LifecycleDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
      ],
      code: lifecycleSimCode,
      csharp: { files: { 'Program.cs': lifecycleSimCode }, stdin: '' },
      result: `== first render, Name=Asha ==
OnInitialized (runs once)
OnParametersSet -> Hello Asha
Render: <div>Hello Asha | Likes: 0</div>
OnAfterRender(firstRender: True)
== parent re-renders with the same Name ==
Parameters unchanged -> child not re-rendered
== parent passes Name=Ravi ==
OnParametersSet -> Hello Ravi
Render: <div>Hello Ravi | Likes: 0</div>
OnAfterRender(firstRender: False)
== user clicks Like ==
Like handler -> likes = 1
Render: <div>Hello Ravi | Likes: 1</div>
OnAfterRender(firstRender: False)`,
      explanation:
        'OnInitialized runs only once; OnParametersSet runs for every new parameter value. Blazor skips children whose primitive parameters are unchanged, so the second block does nothing. A click inside the child does not call OnParametersSet - it only re-renders. firstRender is True only once (C# prints booleans as True/False).',
    },
  ],
  interview: [
    { q: 'What is the difference between @bind and @bind:event="oninput"?', a: '@bind updates the field on the change event (blur or Enter). Adding @bind:event="oninput" updates the field on every keystroke, which is used for live search or character counters.', level: 'Easy' },
    { q: 'How does a child component send data to its parent?', a: 'Through an [Parameter] EventCallback or EventCallback<T>. The child calls await Callback.InvokeAsync(value); the parent handler runs and the parent re-renders automatically.', level: 'Easy' },
    { q: 'Why use EventCallback instead of Action<T>?', a: 'EventCallback runs the handler on the correct context, supports async handlers and automatically calls StateHasChanged on the component that owns the handler (the parent). With Action<T> the parent will not re-render by itself.', level: 'Medium' },
    { q: 'Why should a component not modify its own [Parameter] property?', a: 'The parent owns the value. On the parent\'s next render it sets parameters again and overwrites the child\'s change, causing lost state and confusing bugs. Copy it to a private field or raise a ValueChanged callback.', level: 'Medium' },
    { q: 'How do you implement two-way binding between a parent and a child component?', a: 'Give the child [Parameter] Value and [Parameter] EventCallback<T> ValueChanged, call ValueChanged.InvokeAsync(newValue) when it changes, and use @bind-Value="field" in the parent.', level: 'Medium' },
    { q: 'What is a RenderFragment and what is ChildContent?', a: 'A RenderFragment is a delegate that renders a piece of UI. A parameter named ChildContent receives the markup between the component\'s tags. RenderFragment<T> is a template receiving a value, used in templated/generic components.', level: 'Easy' },
    { q: 'Explain the Blazor component lifecycle order.', a: 'SetParametersAsync, OnInitialized, OnInitializedAsync, OnParametersSet, OnParametersSetAsync, render (BuildRenderTree), OnAfterRender/OnAfterRenderAsync(firstRender). Later parameter changes repeat OnParametersSet{Async} and render. Dispose/DisposeAsync runs when the component is removed.', level: 'Medium' },
    { q: 'OnInitializedAsync vs OnParametersSetAsync - where should you load data for /products/{Id}?', a: 'OnParametersSetAsync, because navigating from /products/1 to /products/2 reuses the same component instance; OnInitializedAsync will not run again, OnParametersSetAsync will.', level: 'Medium' },
    { q: 'Where can you safely call JavaScript interop or focus an element?', a: 'In OnAfterRender/OnAfterRenderAsync (usually inside if (firstRender)), because the DOM elements exist only after rendering, and JS interop is not available during prerendering.', level: 'Medium' },
    { q: 'When do you need to call StateHasChanged manually?', a: 'When state changes outside Blazor\'s normal flow: timer callbacks, events from services, SignalR messages, or to show progress in the middle of a long-running handler. Not after normal event handlers or lifecycle methods.', level: 'Medium' },
    { q: 'What error do you get when calling StateHasChanged from a timer thread in Blazor Server, and how do you fix it?', a: '"The current thread is not associated with the Dispatcher." Fix with await InvokeAsync(StateHasChanged), which marshals the call onto the renderer\'s synchronization context.', level: 'Hard' },
    { q: 'What does @key do?', a: 'It gives each rendered element/component a stable identity so the diffing algorithm matches items by key instead of position. It prevents wrong state (focus, input values, child state) moving between rows when a list is re-ordered or items are inserted.', level: 'Hard' },
    { q: 'What is ShouldRender used for?', a: 'Overriding ShouldRender() to return false skips re-rendering after events/parameter updates. It is a performance optimisation for heavy components; the first render always happens.', level: 'Hard' },
    { q: 'Why might OnInitializedAsync call an API twice?', a: 'Because of prerendering: it runs once during the server prerender and again when the component becomes interactive. Use PersistentComponentState (or [PersistentState] in .NET 10) or disable prerendering.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a CharacterCounter component: a textarea bound with oninput and a line "120 characters left" (max 150). Show the text in red when fewer than 10 characters are left.',
      hint: '@bind:event="oninput" plus a computed property Remaining => 150 - text.Length.',
      solution: `@rendermode InteractiveServer
<textarea class="form-control" maxlength="150" @bind="text" @bind:event="oninput"></textarea>
<p style="color:@(Remaining < 10 ? "red" : "inherit")">@Remaining characters left</p>

@code {
    private string text = "";
    private int Remaining => 150 - text.Length;
}`,
    },
    {
      task: 'Create a RatingStars child component with [Parameter] int Value and EventCallback<int> ValueChanged showing 5 clickable stars, and use it with @bind-Value from a FeedbackForm parent that shows "You rated 4/5".',
      hint: 'Loop i from 1 to 5, copy i to a local variable before the lambda, and call ValueChanged.InvokeAsync(star).',
      solution: `@* RatingStars.razor *@
@for (int i = 1; i <= 5; i++)
{
    int star = i;
    <span style="cursor:pointer;font-size:24px" @onclick="() => ValueChanged.InvokeAsync(star)">
        @(star <= Value ? "*" : "o")
    </span>
}
@code {
    [Parameter] public int Value { get; set; }
    [Parameter] public EventCallback<int> ValueChanged { get; set; }
}

@* FeedbackForm.razor *@
@page "/feedback"
@rendermode InteractiveServer
<RatingStars @bind-Value="rating" />
<p>You rated @rating/5</p>
@code { private int rating; }`,
    },
    {
      task: 'Write a generic Table<TItem> component with a RenderFragment HeaderTemplate and a RenderFragment<TItem> RowTemplate, and use it to show employees (Name, Department, Salary).',
      hint: '@typeparam TItem, render <thead>@HeaderTemplate</thead> and @RowTemplate(item) inside <tr>.',
      solution: `@* Table.razor *@
@typeparam TItem
<table class="table">
    <thead><tr>@HeaderTemplate</tr></thead>
    <tbody>
        @foreach (var item in Items)
        {
            <tr>@RowTemplate(item)</tr>
        }
    </tbody>
</table>
@code {
    [Parameter, EditorRequired] public IEnumerable<TItem> Items { get; set; } = [];
    [Parameter] public RenderFragment? HeaderTemplate { get; set; }
    [Parameter, EditorRequired] public RenderFragment<TItem> RowTemplate { get; set; } = default!;
}

@* Usage *@
<Table Items="employees" Context="e">
    <HeaderTemplate><th>Name</th><th>Dept</th><th>Salary</th></HeaderTemplate>
    <RowTemplate><td>@e.Name</td><td>@e.Dept</td><td>@e.Salary</td></RowTemplate>
</Table>
@code {
    record Emp(string Name, string Dept, int Salary);
    List<Emp> employees = new() { new("Kiran", "IT", 55000), new("Meena", "HR", 42000) };
}`,
    },
    {
      task: 'Create a CountdownTimer component that counts down from a [Parameter] Seconds value to 0 every second, raises an OnFinished EventCallback, restarts when the parent passes a new Seconds value, and disposes its timer.',
      hint: 'A System.Threading.Timer plus InvokeAsync(StateHasChanged) is the simplest approach. Reset the counter and restart the timer in OnParametersSet.',
      solution: `@implements IDisposable
<p>@remaining s</p>
@code {
    [Parameter] public int Seconds { get; set; }
    [Parameter] public EventCallback OnFinished { get; set; }
    private int remaining;
    private Timer? timer;

    protected override void OnParametersSet()
    {
        remaining = Seconds;
        timer?.Dispose();
        timer = new Timer(async _ =>
        {
            if (remaining <= 0) return;
            remaining--;
            await InvokeAsync(StateHasChanged);
            if (remaining == 0) await InvokeAsync(() => OnFinished.InvokeAsync());
        }, null, 1000, 1000);
    }

    public void Dispose() => timer?.Dispose();
}`,
    },
    {
      task: 'Predict the console output of the LifecycleDemo program if the last two calls are replaced with card.OnLikeClicked(); card.OnLikeClicked(); (two likes, Name stays Asha after the first block).',
      hint: 'Each click runs the handler and one render; firstRender is already false.',
      solution: `== first render, Name=Asha ==
OnInitialized (runs once)
OnParametersSet -> Hello Asha
Render: <div>Hello Asha | Likes: 0</div>
OnAfterRender(firstRender: True)
== parent re-renders with the same Name ==
Parameters unchanged -> child not re-rendered
Like handler -> likes = 1
Render: <div>Hello Asha | Likes: 1</div>
OnAfterRender(firstRender: False)
Like handler -> likes = 2
Render: <div>Hello Asha | Likes: 2</div>
OnAfterRender(firstRender: False)`,
    },
  ],
  quiz: [
    {
      question: 'Which attribute makes a bound textbox update its field on every keystroke?',
      options: ['@bind:format="oninput"', '@bind:event="oninput"', '@bind:after="oninput"', '@oninput:bind'],
      answer: 1,
      explanation: '@bind:event chooses the DOM event used by @bind. The default is onchange.',
    },
    {
      question: 'A page /students/{Id:int} loads data in OnInitializedAsync. The user navigates from /students/1 to /students/2. What happens?',
      options: ['The data for student 2 loads automatically', 'An exception is thrown', 'The page still shows student 1 because OnInitializedAsync does not run again', 'The browser reloads the whole page'],
      answer: 2,
      explanation: 'The same component instance is reused and only OnParametersSet{Async} runs again. Load route-dependent data there.',
    },
    {
      question: 'What is the correct way for a child component to notify its parent that an item was deleted?',
      options: ['Set a [Parameter] bool Deleted = true', 'Call StateHasChanged on the parent', 'Invoke an [Parameter] EventCallback<int> OnDelete', 'Use a static variable'],
      answer: 2,
      explanation: 'EventCallback is the standard child-to-parent mechanism and re-renders the parent automatically.',
    },
    {
      question: 'Where should you call element.FocusAsync() or JS interop for the first time?',
      options: ['OnInitialized', 'OnParametersSet', 'The constructor', 'OnAfterRenderAsync with firstRender == true'],
      answer: 3,
      explanation: 'Elements exist in the DOM only after rendering, so OnAfterRender{Async} is the safe place.',
    },
    {
      question: 'A parameter named ChildContent of type RenderFragment receives:',
      options: ['The markup written between the component\'s opening and closing tags', 'All unmatched HTML attributes', 'The parent\'s layout', 'The route parameters'],
      answer: 0,
      explanation: 'ChildContent is a special name: content nested inside <MyComponent>...</MyComponent> is passed to it.',
    },
  ],
};
