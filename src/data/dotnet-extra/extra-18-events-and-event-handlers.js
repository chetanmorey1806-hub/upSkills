const BANK = `using System;

var account = new BankAccount("Asha", 5000);
account.BalanceLow += HandleLowBalance;                                         // named handler
account.BalanceLow += (sender, e) => Console.WriteLine($"  [SMS] Balance is {e.Balance}"); // lambda handler

account.Withdraw(2000);
account.Withdraw(2500);
account.Withdraw(1000);

static void HandleLowBalance(object? sender, LowBalanceEventArgs e)
{
    var acc = (BankAccount)sender!;
    Console.WriteLine($"  [Email] {acc.Owner}: balance {e.Balance} is below {e.Limit}");
}

// 1. Event data
class LowBalanceEventArgs : EventArgs
{
    public int Balance { get; }
    public int Limit { get; }
    public LowBalanceEventArgs(int balance, int limit)
    {
        Balance = balance;
        Limit = limit;
    }
}

// 2. Publisher
class BankAccount
{
    private const int MinBalance = 1000;
    public string Owner { get; }
    public int Balance { get; private set; }

    public event EventHandler<LowBalanceEventArgs>? BalanceLow;   // the event

    public BankAccount(string owner, int balance)
    {
        Owner = owner;
        Balance = balance;
    }

    public void Withdraw(int amount)
    {
        if (amount > Balance)
        {
            Console.WriteLine($"Withdraw {amount}: insufficient funds");
            return;
        }
        Balance -= amount;
        Console.WriteLine($"Withdraw {amount}: balance {Balance}");
        if (Balance < MinBalance)
            OnBalanceLow(new LowBalanceEventArgs(Balance, MinBalance));
    }

    // 3. Standard "raise" method
    protected virtual void OnBalanceLow(LowBalanceEventArgs e) => BalanceLow?.Invoke(this, e);
}`;

const BUTTON = `using System;

var button = new Button("Save");
var logger = new ClickLogger();
button.Click += logger.OnClick;
button.Click += (s, e) => Console.WriteLine("Saving data...");

button.PerformClick();

button.Click -= logger.OnClick;            // unsubscribe
Console.WriteLine("-- logger unsubscribed --");
button.PerformClick();
Console.WriteLine($"Logger saw {logger.Count} click(s)");

// button.Click(button, EventArgs.Empty);  // CS0070: outside the class an event can only be used with += or -=
// button.Click = null;                    // CS0070 as well

class Button
{
    public string Text { get; }
    public event EventHandler? Click;       // non-generic EventHandler: (object? sender, EventArgs e)

    public Button(string text) => Text = text;

    public void PerformClick() => Click?.Invoke(this, EventArgs.Empty);
}

class ClickLogger
{
    public int Count { get; private set; }

    public void OnClick(object? sender, EventArgs e)
    {
        Count++;
        var b = (Button)sender!;
        Console.WriteLine($"Logger: '{b.Text}' clicked (#{Count})");
    }
}`;

const ORDER = `using System;
using System.Collections.Generic;

var orders = new OrderService();
var email = new EmailService();
var inventory = new InventoryService();

orders.OrderPlaced += email.OnOrderPlaced;
orders.OrderPlaced += inventory.OnOrderPlaced;

orders.PlaceOrder(101, "Laptop", 2);
orders.PlaceOrder(102, "Mouse", 5);

class OrderEventArgs : EventArgs
{
    public int OrderId { get; init; }
    public string Product { get; init; } = "";
    public int Quantity { get; init; }
}

class OrderService                                   // publisher: knows nothing about email or stock
{
    public event EventHandler<OrderEventArgs>? OrderPlaced;

    public void PlaceOrder(int id, string product, int qty)
    {
        Console.WriteLine($"Order {id} placed: {qty} x {product}");
        OnOrderPlaced(new OrderEventArgs { OrderId = id, Product = product, Quantity = qty });
    }

    protected virtual void OnOrderPlaced(OrderEventArgs e) => OrderPlaced?.Invoke(this, e);
}

class EmailService                                   // subscriber 1
{
    public void OnOrderPlaced(object? sender, OrderEventArgs e) =>
        Console.WriteLine($"  Email: confirmation for order {e.OrderId}");
}

class InventoryService                               // subscriber 2
{
    private readonly Dictionary<string, int> stock = new() { ["Laptop"] = 10, ["Mouse"] = 50 };

    public void OnOrderPlaced(object? sender, OrderEventArgs e)
    {
        stock[e.Product] -= e.Quantity;
        Console.WriteLine($"  Inventory: {e.Product} left = {stock[e.Product]}");
    }
}`;

const ACCESSORS = `using System;

var sensor = new TemperatureSensor();
EventHandler<int> display = (s, t) => Console.WriteLine($"Display: {t} C");

sensor.TemperatureChanged += display;
sensor.TemperatureChanged += (s, t) => { if (t > 40) Console.WriteLine("Alarm: too hot!"); };

sensor.Read(35);
sensor.Read(42);

sensor.TemperatureChanged -= display;     // works because we kept the variable
sensor.Read(45);

class TemperatureSensor
{
    private EventHandler<int>? handlers;  // private backing delegate

    public event EventHandler<int> TemperatureChanged
    {
        add
        {
            Console.WriteLine("(subscriber added)");
            handlers += value;
        }
        remove
        {
            Console.WriteLine("(subscriber removed)");
            handlers -= value;
        }
    }

    public void Read(int temp) => handlers?.Invoke(this, temp);
}`;

export default {
  id: 'extra-18-events-and-event-handlers',
  title: 'Events and Event Handlers',
  module: 'Extra: OOP Concepts',
  extraNo: 18,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `An event lets an object (the publisher) notify other objects (subscribers) that something happened — a button was clicked, an order was placed, a balance went low — without knowing who they are. Events are built on multicast delegates but are protected: outsiders can only subscribe (+=) or unsubscribe (-=). This lesson covers the event keyword, EventHandler and EventHandler<TEventArgs>, custom EventArgs, the OnXxx raise pattern, unsubscribing, and custom add/remove accessors.`,
  objectives: [
    'Declare events with EventHandler and EventHandler<TEventArgs>',
    'Create custom EventArgs classes to pass event data',
    'Raise events safely with the protected virtual OnXxx pattern and ?.Invoke',
    'Subscribe and unsubscribe handlers and explain why events are safer than public delegates',
    'Write custom add/remove event accessors',
  ],
  theory: [
    {
      heading: 'Publisher – subscriber model',
      content: `The publisher (sender) owns the event and decides WHEN to raise it. Subscribers attach handler methods and decide WHAT to do. The publisher does not reference subscriber classes, so you can add an SMS service later without touching BankAccount — loose coupling (this is the Observer design pattern).

Real-world analogy: a YouTube channel. The channel (publisher) uploads a video (raises the event). Subscribers get notified and each reacts differently — one watches, one shares, one ignores. The channel does not know or care who the subscribers are, and viewers can subscribe or unsubscribe at any time. Viewers cannot upload a video on the channel's behalf.`,
      points: [
        'Publisher: declares the event and raises it',
        'Subscriber: provides a handler method with the matching signature',
        'Event: the notification point (a protected multicast delegate)',
        'EventArgs: the data sent with the notification',
      ],
    },
    {
      heading: 'Declaring an event and the .NET event pattern',
      content: `The standard .NET pattern uses the built-in delegate types:
• EventHandler — void (object? sender, EventArgs e), when there is no extra data
• EventHandler<TEventArgs> — void (object? sender, TEventArgs e), with custom data

sender is the object that raised the event (usually this) and e carries the data. Custom data classes traditionally derive from EventArgs and end with "EventArgs". Use EventArgs.Empty when there is no data.`,
      syntax: `public class LowBalanceEventArgs : EventArgs
{
    public int Balance { get; init; }
}

public class BankAccount
{
    public event EventHandler<LowBalanceEventArgs>? BalanceLow;

    protected virtual void OnBalanceLow(LowBalanceEventArgs e)
        => BalanceLow?.Invoke(this, e);
}`,
      tip: `Name events with verbs: Click, Changed, OrderPlaced, BalanceLow (past tense or "-ing" for before-events like Closing). Name the raise method OnEventName and make it protected virtual so derived classes can override it.`,
    },
    {
      heading: 'Subscribing, handling and unsubscribing',
      content: `Subscribe with += and a method group, lambda or anonymous method whose signature matches. Unsubscribe with -= and THE SAME method (method group or a stored lambda variable). Handlers run in subscription order, synchronously, on the thread that raised the event.

Memory leak warning: a publisher holds references to all subscriber objects through the delegate. If a long-lived publisher (static service) keeps short-lived subscribers (pages, forms), they are never garbage collected unless they unsubscribe — so unsubscribe in Dispose/cleanup code.`,
      syntax: `account.BalanceLow += HandleLowBalance;            // method
account.BalanceLow += (s, e) => Console.WriteLine(e.Balance); // lambda
account.BalanceLow -= HandleLowBalance;            // unsubscribe`,
    },
    {
      heading: 'Event vs public delegate field',
      content: `A public delegate field would also let you call multiple methods, but anyone could: (1) overwrite all handlers with =, (2) set it to null, (3) invoke it from outside and fake a notification. The event keyword makes the compiler generate a private delegate plus public add/remove methods. Outside the class only += and -= are allowed (error CS0070 otherwise). Inside the class you can still invoke it.`,
      points: [
        'Event = encapsulated delegate',
        'Outside: only += and -=',
        'Inside: invoke, assign, check null',
        'Events can be declared in interfaces; a delegate field cannot',
        'Field-like events make add/remove thread-safe automatically',
      ],
    },
    {
      heading: 'Custom event accessors',
      content: `Just like properties have get/set, events can have explicit add/remove accessors. You then store the handlers yourself (in a private delegate, a list, or EventHandlerList). Use this to log subscriptions, validate them, forward them to another object, or save memory when a class has many rarely-used events (Windows Forms does this). With custom accessors you must invoke the backing delegate, not the event name.`,
      syntax: `private EventHandler<int>? handlers;
public event EventHandler<int> TemperatureChanged
{
    add    { handlers += value; }
    remove { handlers -= value; }
}`,
    },
  ],
  examples: [
    {
      title: 'Bank account low-balance event with custom EventArgs',
      scenario: 'When a withdrawal makes the balance drop below 1000, the account raises BalanceLow. Email and SMS handlers react independently.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it BankEvents',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) inside OnBalanceLow and press F5; press F11 to step into each handler',
        'Press Ctrl+F5 for the normal run',
      ],
      code: BANK,
      csharp: { files: { 'Program.cs': BANK }, stdin: '' },
      result: `Withdraw 2000: balance 3000
Withdraw 2500: balance 500
  [Email] Asha: balance 500 is below 1000
  [SMS] Balance is 500
Withdraw 1000: insufficient funds`,
      explanation: `5000 - 2000 = 3000 is above the limit, so no event. 3000 - 2500 = 500 is below 1000, so OnBalanceLow raises the event with sender = the account and e = (500, 1000). Both handlers run in subscription order. The last withdrawal of 1000 is more than the balance 500, so it is rejected and nothing is raised.`,
    },
    {
      title: 'Button Click with EventHandler and unsubscribing',
      scenario: 'Simulate a UI button. A logger and a save action subscribe to Click; then the logger unsubscribes. Also see what the compiler forbids from outside.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ButtonEvents',
        'Replace Program.cs with the code',
        'Uncomment the button.Click(...) line to see error CS0070, then comment it again',
        'Press Ctrl+F5',
      ],
      code: BUTTON,
      csharp: { files: { 'Program.cs': BUTTON }, stdin: '' },
      result: `Logger: 'Save' clicked (#1)
Saving data...
-- logger unsubscribed --
Saving data...
Logger saw 1 click(s)`,
      explanation: `The first click runs both handlers in order. logger.OnClick is an instance method group, so -= logger.OnClick finds and removes it (same target object and method). The second click only runs the lambda. Count stays 1. From outside, Click can only appear on the left of += or -=.`,
    },
    {
      title: 'Order placed – one publisher, many subscribers',
      scenario: 'OrderService raises OrderPlaced. EmailService sends confirmation and InventoryService reduces stock, without OrderService knowing either class.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OrderEvents',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: ORDER,
      csharp: { files: { 'Program.cs': ORDER }, stdin: '' },
      result: `Order 101 placed: 2 x Laptop
  Email: confirmation for order 101
  Inventory: Laptop left = 8
Order 102 placed: 5 x Mouse
  Email: confirmation for order 102
  Inventory: Mouse left = 45`,
      explanation: `OrderEventArgs carries the order data using init-only properties. For order 101 laptops go 10 → 8; for order 102 mice go 50 → 45. Adding a new subscriber (say an SMS service) needs only one more += line — OrderService stays unchanged (Open/Closed principle).`,
    },
    {
      title: 'Custom add/remove accessors',
      scenario: 'A temperature sensor logs every subscribe/unsubscribe. A display handler is removed later while the alarm handler keeps working.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it EventAccessors',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: ACCESSORS,
      csharp: { files: { 'Program.cs': ACCESSORS }, stdin: '' },
      result: `(subscriber added)
(subscriber added)
Display: 35 C
Display: 42 C
Alarm: too hot!
(subscriber removed)
Alarm: too hot!`,
      explanation: `Each += calls the add accessor (prints a line) and each -= calls remove. Read(35) only displays; Read(42) displays and triggers the alarm (42 > 40). Because display was stored in a variable, -= display removes it, so Read(45) only fires the alarm. EventHandler<int> works because TEventArgs has no EventArgs constraint in modern .NET.`,
    },
  ],
  interview: [
    { q: 'What is an event in C#?', a: 'A member that lets a class notify subscribers when something happens. It is an encapsulated multicast delegate: outsiders can only add (+=) or remove (-=) handlers.', level: 'Easy' },
    { q: 'What is the difference between a delegate and an event?', a: 'A delegate is a type (method reference). An event is a class member of a delegate type with restricted access: outside code cannot invoke it, assign it with = or set it to null. Events implement the publisher-subscriber pattern safely.', level: 'Medium' },
    { q: 'What is the standard signature of an event handler?', a: 'void Handler(object? sender, EventArgs e) or with a custom TEventArgs. sender is the publisher, e contains event data.', level: 'Easy' },
    { q: 'What is EventHandler<TEventArgs>?', a: 'A built-in generic delegate: delegate void EventHandler<TEventArgs>(object? sender, TEventArgs e). It removes the need to declare custom delegate types for events.', level: 'Easy' },
    { q: 'Why do we use the protected virtual OnXxx method pattern?', a: 'It centralises raising the event (null check, creating args) and lets derived classes override it to add behaviour or suppress the event without subscribing to themselves.', level: 'Medium' },
    { q: 'Why use ?.Invoke when raising an event?', a: 'If no handler is subscribed the event is null; ?.Invoke avoids NullReferenceException and also reads the delegate once, avoiding a race where the last subscriber unsubscribes between the null check and the call.', level: 'Medium' },
    { q: 'What error do you get if you try to raise an event from outside its class?', a: 'CS0070: The event can only appear on the left hand side of += or -= (except when used from within the type).', level: 'Medium' },
    { q: 'How can events cause memory leaks?', a: 'The publisher\'s delegate references subscriber objects. If a long-lived publisher outlives subscribers that never unsubscribe, those subscribers cannot be garbage collected. Unsubscribe in Dispose or use weak event patterns.', level: 'Hard' },
    { q: 'Can an interface contain events?', a: 'Yes, e.g. interface INotifyPropertyChanged { event PropertyChangedEventHandler? PropertyChanged; }. Implementing classes must declare the event.', level: 'Medium' },
    { q: 'What are event accessors?', a: 'Custom add and remove blocks for an event (like get/set for properties) that control how handlers are stored, e.g. for logging, validation or using EventHandlerList.', level: 'Hard' },
    { q: 'Output? A Button raises Click; handlers h1 (prints "A") and h2 (prints "B") are added, then h1 is added again, then h1 is removed once. What prints on click?', a: 'AB. The list was h1, h2, h1; -= removes the last h1, leaving h1, h2.', level: 'Hard' },
    { q: 'Are event handlers run asynchronously?', a: 'No. Raising an event calls handlers synchronously, one after another on the same thread. An exception in one handler stops the remaining handlers unless you handle it.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Student class with a Marks property. Raise a MarksChanged event (EventHandler<MarksChangedEventArgs> with OldMarks and NewMarks) whenever the value actually changes.',
      hint: 'Compare old and new values in the setter before raising.',
      solution: `var s = new Student();
s.MarksChanged += (o, e) => Console.WriteLine($"{e.OldMarks} -> {e.NewMarks}");
s.Marks = 70;   // 0 -> 70
s.Marks = 70;   // no event
s.Marks = 85;   // 70 -> 85

class MarksChangedEventArgs : EventArgs { public int OldMarks { get; init; } public int NewMarks { get; init; } }
class Student
{
    private int marks;
    public event EventHandler<MarksChangedEventArgs>? MarksChanged;
    public int Marks
    {
        get => marks;
        set
        {
            if (value == marks) return;
            int old = marks;
            marks = value;
            MarksChanged?.Invoke(this, new MarksChangedEventArgs { OldMarks = old, NewMarks = value });
        }
    }
}`,
    },
    {
      task: 'Build an Alarm clock class with a Ring event (EventHandler). Subscribe a "Wake up!" handler and a "Turn on lights" handler, ring, then unsubscribe the lights handler and ring again.',
      hint: 'Store the lights handler in a variable so you can remove it.',
      solution: `var alarm = new Alarm();
EventHandler lights = (s, e) => Console.WriteLine("Turn on lights");
alarm.Ring += (s, e) => Console.WriteLine("Wake up!");
alarm.Ring += lights;
alarm.Trigger();
alarm.Ring -= lights;
alarm.Trigger();

class Alarm
{
    public event EventHandler? Ring;
    public void Trigger() => Ring?.Invoke(this, EventArgs.Empty);
}`,
    },
    {
      task: 'Create a Stock class (Symbol, Price). Raise PriceChanged when the price changes by more than 5%. Subscribe a handler that prints "BUY" if price dropped and "SELL" if it rose.',
      hint: 'Use integer math: Math.Abs(newPrice - oldPrice) * 100 > oldPrice * 5.',
      solution: `var st = new Stock("TCS", 1000);
st.PriceChanged += (s, e) => Console.WriteLine(e.NewPrice < e.OldPrice ? "BUY" : "SELL");
st.Price = 1030;  // 3% -> no event
st.Price = 1100;  // ~6.8% -> SELL
st.Price = 1000;  // ~9% -> BUY

class PriceEventArgs : EventArgs { public int OldPrice { get; init; } public int NewPrice { get; init; } }
class Stock
{
    private int price;
    public string Symbol { get; }
    public event EventHandler<PriceEventArgs>? PriceChanged;
    public Stock(string symbol, int price) { Symbol = symbol; this.price = price; }
    public int Price
    {
        get => price;
        set
        {
            int old = price; price = value;
            if (Math.Abs(value - old) * 100 > old * 5)
                PriceChanged?.Invoke(this, new PriceEventArgs { OldPrice = old, NewPrice = value });
        }
    }
}`,
    },
    {
      task: 'Create a FileWatcherSimulator with events FileCreated and FileDeleted (EventHandler<string>). Simulate 3 actions and count events in a subscriber class.',
      hint: 'EventHandler<string> works because TEventArgs has no constraint.',
      solution: `var w = new FileWatcherSimulator();
var counter = new EventCounter();
w.FileCreated += counter.OnAny;
w.FileDeleted += counter.OnAny;
w.Create("a.txt"); w.Create("b.txt"); w.Delete("a.txt");
Console.WriteLine(counter.Total);   // 3

class FileWatcherSimulator
{
    public event EventHandler<string>? FileCreated;
    public event EventHandler<string>? FileDeleted;
    public void Create(string f) => FileCreated?.Invoke(this, f);
    public void Delete(string f) => FileDeleted?.Invoke(this, f);
}
class EventCounter
{
    public int Total { get; private set; }
    public void OnAny(object? s, string file) { Total++; Console.WriteLine($"Event for {file}"); }
}`,
    },
  ],
  quiz: [
    {
      question: 'What can code OUTSIDE the declaring class do with an event?',
      options: ['Invoke it', 'Assign it with =', 'Only += and -=', 'Set it to null'],
      answer: 2,
      explanation: 'The event keyword restricts external access to subscribing and unsubscribing.',
    },
    {
      question: 'In void Handler(object? sender, EventArgs e), what is sender?',
      options: ['The object that raised the event', 'The subscriber', 'The event data', 'The current thread'],
      answer: 0,
      explanation: 'By convention the publisher passes this as sender.',
    },
    {
      question: 'Which is the recommended way to raise an event named Changed?',
      options: ['Changed()', 'Changed.Invoke(null, null)', 'if (Changed) Changed(this)', 'Changed?.Invoke(this, EventArgs.Empty)'],
      answer: 3,
      explanation: 'The null-conditional call avoids NullReferenceException when there are no subscribers.',
    },
    {
      question: 'What should a custom event data class traditionally derive from?',
      options: ['EventHandler', 'EventArgs', 'Delegate', 'Exception'],
      answer: 1,
      explanation: 'Custom event data classes derive from System.EventArgs by convention.',
    },
    {
      question: 'Why can forgetting to unsubscribe cause a memory leak?',
      options: ['Events allocate threads', 'The publisher keeps a reference to the subscriber', 'Handlers are static', 'EventArgs are never freed'],
      answer: 1,
      explanation: 'The delegate inside the publisher references the subscriber object, keeping it alive.',
    },
  ],
};
