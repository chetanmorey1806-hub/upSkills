export default {
  lesson: 'day-11-blazor-components-in-depth',
  minutes: 25,
  intro: 'Practise data binding, parent-child communication with [Parameter] and EventCallback, RenderFragment and the order of lifecycle methods.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `A live product search must filter the list on **every key press**, not only when the textbox loses focus. Complete the binding:
\`<input @bind="searchText" ______ />\``,
      example: { title: 'binding to another event', code: '<input @bind="name" @bind:event="onchange" />   (the default)' },
      accept: ['@bind:event="oninput"', "@bind:event='oninput'", '@bind:event=oninput'],
      explain: '@bind updates the field on the change event by default (blur or Enter). @bind:event="oninput" updates it on every keystroke, so the filtered list re-renders while the user types.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A `ProductCard` child component has an "Add to cart" button. The parent `Shop` page must update the cart total when it is clicked. What should the child declare?',
      options: [
        '[Parameter] public bool Added { get; set; } and set it to true',
        '[Parameter] public EventCallback<Product> OnAddToCart { get; set; } and call InvokeAsync',
        'A static event on the Shop class',
        '[CascadingParameter] public Shop Parent { get; set; }'
      ],
      answer: 1,
      explain: 'Data flows down with [Parameter], events flow up with EventCallback. Calling `await OnAddToCart.InvokeAsync(Product)` runs the parent method and automatically re-renders the parent. Changing a parameter inside the child is wrong because the parent overwrites it on its next render.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `A \`QuantityPicker\` child has \`[Parameter] public int Value { get; set; }\`. For the parent to write \`<QuantityPicker @bind-Value="qty" />\`, the child also needs this parameter. Complete it:
\`[Parameter] public EventCallback<int> ______ { get; set; }\``,
      example: { title: 'naming rule', text: 'For a parameter called Rating, two-way binding needs a callback called RatingChanged.' },
      accept: ['ValueChanged'],
      caseSensitive: true,
      explain: '@bind-Value expands to Value="qty" plus ValueChanged="(v) => qty = v". The callback name must be the parameter name + "Changed", and the child must call ValueChanged.InvokeAsync(newValue) instead of assigning Value itself.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which of these are correct uses of lifecycle methods? Select all that apply.',
      options: [
        'Load the order for /orders/{Id} in OnParametersSetAsync so it reloads when only the Id changes',
        'Call JavaScript or focus an input inside OnAfterRenderAsync when firstRender is true',
        'Call StateHasChanged() unconditionally inside OnAfterRender to keep the UI fresh',
        'Dispose a timer in Dispose() by implementing IDisposable',
        'Read [Parameter] values in the component constructor'
      ],
      answers: [0, 1, 3],
      explain: 'Route-dependent data belongs in OnParametersSet{Async} because the same instance is reused when only the parameter changes. The DOM exists only after rendering, so JS/focus goes in OnAfterRender. Cleanup goes in Dispose. Calling StateHasChanged every time in OnAfterRender causes an endless render loop, and parameters are not set yet in the constructor.',
    },
    {
      type: 'output',
      mins: 6,
      q: 'This console program imitates the lifecycle of a child component with one string parameter. Write the exact output.',
      example: { title: 'rules used by the imitation', text: '- OnInitialized runs only once\n- If the parameter value did not change, the child is skipped\n- Every render is followed by OnAfterRender; firstRender is True only the first time (C# prints True/False)' },
      code: `using System;

var card = new ProfileCard();
card.SetParameters("Om");
card.SetParameters("Om");
card.Click();
card.SetParameters("Kiran");

class ProfileCard
{
    private string name = "";
    private bool initialized, firstRender = true;
    private int clicks;

    public void SetParameters(string newName)
    {
        if (initialized && newName == name) { Console.WriteLine("skip"); return; }
        name = newName;
        if (!initialized) { initialized = true; Console.WriteLine("OnInitialized"); }
        Console.WriteLine($"OnParametersSet {name}");
        Render();
    }

    public void Click() { clicks++; Console.WriteLine("Click"); Render(); }

    void Render()
    {
        Console.WriteLine($"Render {name} {clicks}");
        Console.WriteLine($"OnAfterRender {firstRender}");
        firstRender = false;
    }
}`,
      expected: `OnInitialized
OnParametersSet Om
Render Om 0
OnAfterRender True
skip
Click
Render Om 1
OnAfterRender False
OnParametersSet Kiran
Render Kiran 1
OnAfterRender False`,
      explain: 'First call: OnInitialized, OnParametersSet, render, OnAfterRender(True). Same value again: Blazor skips children whose primitive parameters did not change. A click does not run OnParametersSet - only a render. A new value runs OnParametersSet again but not OnInitialized, and firstRender stays False. The clicks counter is kept because the instance is reused.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'An `InfoCard` component is used like `<InfoCard Title="Notice"><p>Exam on Monday</p></InfoCard>`. Which parameter receives the `<p>` element?',
      options: [
        '[Parameter] public string? Body { get; set; }',
        '[Parameter] public RenderFragment? ChildContent { get; set; }',
        '[Parameter] public MarkupString Content { get; set; }',
        '[CascadingParameter] public RenderFragment? Inner { get; set; }'
      ],
      answer: 1,
      explain: 'Content between a component\'s tags is passed to a RenderFragment parameter with the special name ChildContent, and rendered with @ChildContent. Other names (Header, Footer) are used as explicit child elements like <Footer>...</Footer>.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A `System.Threading.Timer` callback in a Blazor Server component updates a field every 30 seconds, but the UI does not change (or throws "The current thread is not associated with the Dispatcher"). What is the fix?',
      options: [
        'Call base.OnInitialized() in the callback',
        'Call await InvokeAsync(StateHasChanged) in the callback',
        'Make the field static',
        'Add @rendermode InteractiveAuto'
      ],
      answer: 1,
      explain: 'Blazor only re-renders automatically after events, EventCallbacks and lifecycle methods. A timer callback runs outside that flow on a thread-pool thread, so it must ask for a render with InvokeAsync(StateHasChanged), which switches to the renderer\'s synchronization context.',
    },
  ],
};
