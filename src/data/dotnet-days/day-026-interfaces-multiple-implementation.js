const notificationCode = `List<INotification> channels = new List<INotification>
{
    new EmailNotification("ravi@example.com"),
    new SmsNotification("9876543210"),
    new WhatsAppNotification("9123456780")
};

NotificationService service = new NotificationService(channels);
service.NotifyAll("Your order #1045 has been shipped");
Console.WriteLine($"Messages sent: {service.SentCount}");

// INotification n = new INotification();
// error CS0144: Cannot create an instance of the abstract type or interface 'INotification'

// The contract: WHAT every notification must be able to do
interface INotification
{
    string Channel { get; }
    void Send(string message);
}

class EmailNotification : INotification
{
    private readonly string _email;

    public EmailNotification(string email)
    {
        _email = email;
    }

    public string Channel => "Email";

    public void Send(string message)
    {
        Console.WriteLine($"[Email] To: {_email} | Subject: Order Update | Body: {message}");
    }
}

class SmsNotification : INotification
{
    private readonly string _mobile;

    public SmsNotification(string mobile)
    {
        _mobile = mobile;
    }

    public string Channel => "SMS";

    public void Send(string message)
    {
        Console.WriteLine($"[SMS] To: +91-{_mobile} | Text: {message}");
    }
}

class WhatsAppNotification : INotification
{
    private readonly string _number;

    public WhatsAppNotification(string number)
    {
        _number = number;
    }

    public string Channel => "WhatsApp";

    public void Send(string message)
    {
        Console.WriteLine($"[WhatsApp] To: {_number} | Message: {message}");
    }
}

// Depends only on the interface, not on Email/SMS/WhatsApp classes
class NotificationService
{
    private readonly List<INotification> _channels;

    public int SentCount { get; private set; }

    public NotificationService(List<INotification> channels)
    {
        _channels = channels;
    }

    public void NotifyAll(string message)
    {
        foreach (INotification channel in _channels)
        {
            channel.Send(message);
            SentCount++;
        }
    }
}
`;

const multipleCode = `SmartPhone phone = new SmartPhone("Pixel");
phone.Call("9876543210");
phone.TakePhoto();
phone.PlaySong("Vande Mataram");

// The same object seen through different interfaces
ICamera camera = phone;
camera.TakePhoto();
// camera.Call("123");   // error CS1061: ICamera does not contain a definition for 'Call'

IMusicPlayer player = phone;
player.PlaySong("Jai Ho");

object device1 = phone;
object device2 = new FeaturePhone("Nokia");
Console.WriteLine($"Pixel has camera? {device1 is ICamera}");
Console.WriteLine($"Nokia has camera? {device2 is ICamera}");
Console.WriteLine($"Nokia can call? {device2 is IPhone}");

interface IPhone
{
    void Call(string number);
}

interface ICamera
{
    void TakePhoto();
}

interface IMusicPlayer
{
    void PlaySong(string song);
}

// One class, many interfaces (C# has no multiple CLASS inheritance)
class SmartPhone : IPhone, ICamera, IMusicPlayer
{
    private readonly string _model;
    private int _photos;

    public SmartPhone(string model)
    {
        _model = model;
    }

    public void Call(string number) => Console.WriteLine($"{_model}: Calling {number}...");

    public void TakePhoto()
    {
        _photos++;
        Console.WriteLine($"{_model}: Photo #{_photos} saved");
    }

    public void PlaySong(string song) => Console.WriteLine($"{_model}: Playing '{song}'");
}

class FeaturePhone : IPhone
{
    private readonly string _model;

    public FeaturePhone(string model)
    {
        _model = model;
    }

    public void Call(string number) => Console.WriteLine($"{_model}: Calling {number}...");
}
`;

const gatewayCode = `IPaymentGateway[] gateways = { new UpiGateway(), new CardGateway(), new NetBankingGateway() };
int[] amounts = { 1200, 5000, 150000 };

for (int i = 0; i < gateways.Length; i++)
{
    // The checkout gets the gateway from outside (constructor injection)
    CheckoutService checkout = new CheckoutService(gateways[i]);
    checkout.PlaceOrder($"ORD-{101 + i}", amounts[i]);
}

interface IPaymentGateway
{
    string Name { get; }
    bool Charge(int amount, string orderId);
}

class UpiGateway : IPaymentGateway
{
    public string Name => "UPI";

    public bool Charge(int amount, string orderId)
    {
        Console.WriteLine($"  UPI: Rs.{amount} debited for {orderId}");
        return true;
    }
}

class CardGateway : IPaymentGateway
{
    public string Name => "Card";

    public bool Charge(int amount, string orderId)
    {
        int fee = amount * 2 / 100;
        Console.WriteLine($"  Card: Rs.{amount + fee} charged (incl. Rs.{fee} fee) for {orderId}");
        return true;
    }
}

class NetBankingGateway : IPaymentGateway
{
    private const int DailyLimit = 100000;

    public string Name => "NetBanking";

    public bool Charge(int amount, string orderId)
    {
        if (amount > DailyLimit)
        {
            Console.WriteLine($"  NetBanking: Rs.{amount} exceeds daily limit of Rs.{DailyLimit}");
            return false;
        }
        Console.WriteLine($"  NetBanking: Rs.{amount} transferred for {orderId}");
        return true;
    }
}

class CheckoutService
{
    private readonly IPaymentGateway _gateway;

    public CheckoutService(IPaymentGateway gateway)
    {
        _gateway = gateway;
    }

    public void PlaceOrder(string orderId, int amount)
    {
        Console.WriteLine($"Order {orderId}: Rs.{amount} via {_gateway.Name}");
        bool ok = _gateway.Charge(amount, orderId);
        Console.WriteLine(ok ? "  Order confirmed" : "  Payment failed, order on hold");
    }
}
`;

const explicitCode = `// ---- Part 1: explicit interface implementation ----
Greeter g = new Greeter();
Console.WriteLine(g.Greet());                       // class's own public method

IEnglishGreeter english = g;
Console.WriteLine(english.Greet());                 // explicit IEnglishGreeter version

IHindiGreeter hindi = g;
Console.WriteLine(hindi.Greet());                   // explicit IHindiGreeter version

Console.WriteLine(((IEnglishGreeter)g).Greet());    // cast inline

// ---- Part 2: default interface method (C# 8+) ----
ILogger logger = new ConsoleLogger();
logger.Log("App started");
logger.LogError("Disk full");          // body comes from the interface
// new ConsoleLogger().LogError("x");  // error CS1061: only visible through ILogger

interface IEnglishGreeter
{
    string Greet();
}

interface IHindiGreeter
{
    string Greet();
}

class Greeter : IEnglishGreeter, IHindiGreeter
{
    // Explicit implementations: no access modifier, prefixed with interface name
    string IEnglishGreeter.Greet() => "Good morning";
    string IHindiGreeter.Greet() => "Suprabhat";

    // Normal public method of the class
    public string Greet() => "Hello (class method)";
}

interface ILogger
{
    void Log(string message);

    // Default implementation: implementing classes get it for free
    void LogError(string message) => Log("ERROR: " + message);
}

class ConsoleLogger : ILogger
{
    public void Log(string message) => Console.WriteLine($"[LOG] {message}");
}
`;

const vsSteps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8.0 (LTS) or .NET 10.0 (LTS), click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging',
  'Tip: in a class that lists an interface, put the cursor on the interface name, press Ctrl+. and choose "Implement interface" to generate all member stubs',
];

export default {
  id: 'day-026-interfaces-multiple-implementation',
  title: 'Interfaces, Multiple Interface Implementation, Interface vs Abstract Class',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 26,
  level: 'Beginner',
  duration: '2 hours',
  summary: `An interface is a contract: it lists WHAT a class must do without saying HOW. Learn to declare and implement interfaces, use interface references for loose coupling, implement multiple interfaces in one class (C#'s answer to multiple inheritance), explicit interface implementation, default interface methods, and the classic interview comparison of interface vs abstract class. Build the INotification (Email, SMS, WhatsApp) example and a payment gateway checkout.`,
  objectives: [
    'Declare an interface and implement it in multiple classes',
    'Program against interface types (INotification, IPaymentGateway) to get loose coupling',
    'Implement multiple interfaces in one class and resolve name clashes with explicit implementation',
    'Understand default interface methods (C# 8+) and interface inheritance',
    'Compare interfaces and abstract classes and choose the right one',
  ],
  theory: [
    {
      heading: 'What is an Interface?',
      content: `An **interface** is a **contract**. It declares a set of members (methods, properties, events, indexers) that a class **promises** to provide. The interface says **what**, the class decides **how**.

Real-world analogies:
- **Electric socket (plug point)**: the socket defines a standard shape and voltage. A fan, phone charger or TV can all plug in, because each one follows the contract. The socket does not care what is inside the device.
- **USB port**: a pen drive, keyboard and mouse are completely different, but all follow the USB contract, so one port works with all of them.
- **Job description**: "A driver must be able to Drive() and Park()". Any person who can do these can be hired; how they do it is their own skill.

In C#:
- Declared with the **interface** keyword; names start with **I** by convention (INotification, IPaymentGateway, IDisposable).
- Members are **public by default** and usually have **no body**.
- An interface **cannot be instantiated** and **cannot have instance fields or constructors**.
- A class implements it with a colon: class EmailNotification : INotification, and must implement **all** members as **public** (otherwise error CS0535).`,
      syntax: `interface INotification
{
    string Channel { get; }          // property
    void Send(string message);       // method
}

class SmsNotification : INotification
{
    public string Channel => "SMS";
    public void Send(string message) => Console.WriteLine($"SMS: {message}");
}`,
      tip: 'In Visual Studio, after typing ": INotification", press Ctrl+. (Quick Actions) and choose "Implement interface" to generate stubs.',
    },
    {
      heading: 'Interface References and Loose Coupling',
      content: `You can declare a **variable of interface type** and store any object that implements it:

INotification n = new WhatsAppNotification("9123456780");
n.Send("Hi");   // calls WhatsAppNotification.Send

This gives **runtime polymorphism** without inheritance. A class such as NotificationService or CheckoutService that depends only on the **interface** is **loosely coupled**:
- To add Telegram tomorrow, write TelegramNotification : INotification. NotificationService does not change.
- In unit tests you can pass a fake implementation.
- This is the foundation of **Dependency Injection** in ASP.NET Core (Day 72), where you register builder.Services.AddScoped<IPaymentGateway, UpiGateway>() and controllers receive the interface in their constructor.

Rule of thumb: **"Program to an interface, not to an implementation."**`,
      points: [
        'Interface variables can hold any implementing object',
        'Callers depend on the contract, not the concrete class',
        'New implementations can be added without changing callers (Open/Closed Principle)',
        'Basis of Dependency Injection, Repository pattern and mocking',
      ],
    },
    {
      heading: 'Multiple Interface Implementation',
      content: `C# does **not** allow a class to inherit from more than one **class** (to avoid the "diamond problem"). But a class **can implement any number of interfaces**:

class SmartPhone : IPhone, ICamera, IMusicPlayer { ... }

You can also inherit one class **and** implement interfaces; the **base class must be written first**:

class Manager : Employee, IPayable, IReportable { ... }

Analogy: a **smartphone** is a phone, a camera, a music player and a GPS device at the same time. Each capability is a separate contract.

Each interface reference sees **only its own members**: ICamera camera = phone; camera.Call(...) does not compile even though the object can call.

**Interface inheritance**: an interface can extend other interfaces: interface ISmartDevice : IPhone, ICamera { void InstallApp(string name); }. A class implementing ISmartDevice must implement all members of all three.`,
      syntax: `class SmartPhone : IPhone, ICamera, IMusicPlayer { /* all members */ }
class Manager : Employee, IPayable, IReportable { }   // class first, then interfaces
interface ISmartDevice : IPhone, ICamera { void InstallApp(string name); }`,
    },
    {
      heading: 'Explicit Interface Implementation',
      content: `If two interfaces have a member with the **same signature** but you want **different behaviour**, or you want to **hide** an interface member from the normal class API, implement it **explicitly**:

string IEnglishGreeter.Greet() => "Good morning";
string IHindiGreeter.Greet() => "Suprabhat";

Rules:
- No access modifier (not even public) is written.
- The member is **only callable through the interface reference** (or a cast): ((IHindiGreeter)g).Greet().
- A class can have its own public Greet() in addition to the explicit ones.

If both interfaces should share one behaviour, a single **public** method satisfies both (implicit implementation).

Real .NET example: List<T> implements ICollection.IsSynchronized explicitly, so you do not see it on a normal List variable.`,
    },
    {
      heading: 'Modern Interface Features (C# 8 to C# 14)',
      content: `Older textbooks say "interfaces contain only declarations". Modern C# relaxed this:
- **Default interface methods (C# 8)**: a member can have a body. Implementing classes get it automatically, and it is accessed **through the interface reference**. Useful for adding a new method to a published interface without breaking existing classes.
- **Static members (C# 8)**: static methods, fields and constants inside interfaces.
- **Access modifiers on members (C# 8)**: private helper methods inside interfaces, protected, etc.
- **Static abstract members (C# 11)**: used for generic math (INumber<T>); advanced topic.

Still NOT allowed: **instance fields**, **constructors**, creating objects with new.

Common .NET interfaces you will meet: **IDisposable** (Dispose, using), **IComparable<T>** (sorting), **IEnumerable<T>** (foreach, LINQ), **IEquatable<T>**, **ILogger<T>**, **IConfiguration**, **IServiceCollection**.`,
      tip: 'Use default interface methods sparingly. For beginners, keep interfaces as pure contracts.',
    },
    {
      heading: 'Interface vs Abstract Class',
      content: `The most-asked OOP interview question:

| Point | Abstract class | Interface |
|---|---|---|
| Keyword | abstract class | interface |
| Inheritance | A class can inherit only ONE | A class can implement MANY |
| Constructors | Yes | No |
| Instance fields / state | Yes | No (only static fields) |
| Member access | Any modifier; private by default | Public by default |
| Method bodies | Abstract + concrete methods | Declarations; default methods since C# 8 |
| Relationship | IS-A (Card payment IS A Payment) | CAN-DO (phone CAN take photos) |
| Structs | Cannot inherit a class | Structs can implement interfaces |
| Adding a new member later | Add concrete method, children unaffected | Breaks implementers unless default method |

**When to use which?**
- **Abstract class**: closely related classes that share **code and state** (Employee with Name, Id, common PrintPaySlip()).
- **Interface**: unrelated classes that share a **capability** (INotification for Email/SMS/WhatsApp, IDisposable for files and DB connections), or when you need multiple inheritance or Dependency Injection.
- **Both together**: interface IPaymentGateway as the contract + abstract class PaymentGatewayBase : IPaymentGateway with shared logging + concrete gateways. This is very common in real projects.`,
    },
  ],
  examples: [
    {
      title: 'INotification: Email, SMS and WhatsApp',
      scenario: 'An e-commerce app must notify customers on several channels. NotificationService depends only on INotification, so new channels can be added without touching it.',
      steps: vsSteps('NotificationInterface'),
      code: notificationCode,
      csharp: { files: { 'Program.cs': notificationCode }, stdin: '' },
      result: `[Email] To: ravi@example.com | Subject: Order Update | Body: Your order #1045 has been shipped
[SMS] To: +91-9876543210 | Text: Your order #1045 has been shipped
[WhatsApp] To: 9123456780 | Message: Your order #1045 has been shipped
Messages sent: 3`,
      explanation: `The List is typed as List<INotification>, so it can hold Email, SMS and WhatsApp objects together. NotifyAll() calls channel.Send(message) and the runtime object decides the format. SentCount increases once per channel, giving 3. To add Telegram, create TelegramNotification : INotification and add it to the list; NotificationService stays unchanged.`,
    },
    {
      title: 'Multiple Interface Implementation: SmartPhone',
      scenario: 'A smartphone is a phone, a camera and a music player. One class implements three interfaces; each interface reference sees only its own members.',
      steps: vsSteps('MultipleInterfaces'),
      code: multipleCode,
      csharp: { files: { 'Program.cs': multipleCode }, stdin: '' },
      result: `Pixel: Calling 9876543210...
Pixel: Photo #1 saved
Pixel: Playing 'Vande Mataram'
Pixel: Photo #2 saved
Pixel: Playing 'Jai Ho'
Pixel has camera? True
Nokia has camera? False
Nokia can call? True`,
      explanation: `phone, camera and player all point to the SAME object, so the second TakePhoto() through the ICamera reference increments the same _photos counter to 2. The is operator checks at runtime whether an object implements an interface: SmartPhone implements ICamera (True), FeaturePhone implements only IPhone (False for camera, True for call).`,
    },
    {
      title: 'Payment Gateway Checkout (Constructor Injection)',
      scenario: 'The syllabus task. CheckoutService receives an IPaymentGateway through its constructor, so the same checkout works with UPI, Card or NetBanking.',
      steps: vsSteps('PaymentGateway'),
      code: gatewayCode,
      csharp: { files: { 'Program.cs': gatewayCode }, stdin: '' },
      result: `Order ORD-101: Rs.1200 via UPI
  UPI: Rs.1200 debited for ORD-101
  Order confirmed
Order ORD-102: Rs.5000 via Card
  Card: Rs.5100 charged (incl. Rs.100 fee) for ORD-102
  Order confirmed
Order ORD-103: Rs.150000 via NetBanking
  NetBanking: Rs.150000 exceeds daily limit of Rs.100000
  Payment failed, order on hold`,
      explanation: `Order IDs are built as "ORD-" + (101 + i): 101, 102, 103. Card fee = 5000 * 2 / 100 = 100, so 5100 is charged. NetBanking rejects 150000 because it is above the 100000 limit, so Charge returns false and the checkout prints the failure line. CheckoutService never mentions UpiGateway or CardGateway: this is exactly how ASP.NET Core injects services.`,
    },
    {
      title: 'Explicit Implementation and Default Interface Methods',
      scenario: 'Two interfaces both declare Greet(). Greeter gives each a different answer with explicit implementation. ILogger shows a default method body inside an interface.',
      steps: vsSteps('ExplicitInterface'),
      code: explicitCode,
      csharp: { files: { 'Program.cs': explicitCode }, stdin: '' },
      result: `Hello (class method)
Good morning
Suprabhat
Good morning
[LOG] App started
[LOG] ERROR: Disk full`,
      explanation: `g.Greet() on a Greeter variable calls the public class method. Through an IEnglishGreeter or IHindiGreeter reference, the explicit implementations run. ConsoleLogger implements only Log(); LogError() comes from the interface's default body, which calls Log("ERROR: " + message). The default method is visible only through the ILogger reference.`,
    },
  ],
  interview: [
    { q: 'What is an interface in C#?', a: 'An interface is a contract that declares members (methods, properties, events, indexers) that implementing classes must provide. It cannot be instantiated, has no constructors or instance fields, and its members are public by default.', level: 'Easy' },
    { q: 'Why does C# support multiple interfaces but not multiple class inheritance?', a: 'Multiple class inheritance causes the diamond problem (two parents with different implementations and state for the same member). Interfaces traditionally carry no state, so a class can implement many of them safely. Name clashes are resolved with explicit implementation.', level: 'Medium' },
    { q: 'Difference between an interface and an abstract class?', a: 'A class can inherit one abstract class but implement many interfaces. Abstract classes can have constructors, instance fields and any access modifiers; interfaces cannot have constructors or instance fields and members are public by default. Abstract class models IS-A with shared code; interface models CAN-DO capabilities. Structs can implement interfaces but cannot inherit classes.', level: 'Medium' },
    { q: 'Can we create an object of an interface?', a: 'No (CS0144). But you can declare an interface variable and assign any implementing object: INotification n = new SmsNotification("98...");', level: 'Easy' },
    { q: 'What happens if a class does not implement all interface members?', a: 'Compilation error CS0535 ("does not implement interface member"), unless the class is abstract and declares the missing members as abstract, or the interface provides a default implementation.', level: 'Easy' },
    { q: 'What is explicit interface implementation and when do you use it?', a: 'Implementing a member with the interface name prefix and no access modifier, e.g. string IHindiGreeter.Greet(). It is callable only through the interface reference. Use it when two interfaces have the same member signature but need different behaviour, or to hide an interface member from the class public API.', level: 'Medium' },
    { q: 'What are default interface methods?', a: 'Since C# 8, an interface member can have a body. Implementing classes inherit that behaviour without writing it, which allows adding new members to an existing interface without breaking implementers. The default member is accessible through the interface type, not the class type, unless the class implements it itself.', level: 'Medium' },
    { q: 'Can an interface inherit from another interface? From a class?', a: 'An interface can inherit one or more interfaces (interface ISmartDevice : IPhone, ICamera). It cannot inherit from a class.', level: 'Easy' },
    { q: 'Order of base class and interfaces in a class declaration?', a: 'The base class must come first, then interfaces: class Manager : Employee, IPayable, IReportable. Writing an interface before the class gives error CS1722.', level: 'Easy' },
    { q: 'What is the output?\ninterface IA { void Show() => Console.Write("IA "); }\nclass C : IA { }\nIA a = new C(); a.Show();\n// new C().Show();', a: 'Output: IA. C gets the default implementation from IA, callable through the IA reference. The commented line would not compile (CS1061) because default members are not inherited into the class API.', level: 'Hard' },
    { q: 'Why are interfaces important in ASP.NET Core?', a: 'Dependency Injection registers interface-to-class mappings (AddScoped<IStudentService, StudentService>()). Controllers depend on interfaces, which gives loose coupling, easy swapping of implementations (e.g. SQL vs in-memory repository) and easy unit testing with mocks (Moq).', level: 'Medium' },
    { q: 'Name some built-in .NET interfaces.', a: 'IDisposable (Dispose and using), IEnumerable<T> (foreach, LINQ), IComparable<T> (sorting), IEquatable<T> (equality), ICollection<T>, IList<T>, IDictionary<TKey,TValue>, ILogger<T>, IConfiguration, IServiceProvider.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Add a TelegramNotification class to the INotification example and send the message on all four channels. NotificationService must not change.',
      hint: 'Implement Channel and Send(); add the new object to the list.',
      solution: `class TelegramNotification : INotification
{
    private readonly string _handle;
    public TelegramNotification(string handle) { _handle = handle; }
    public string Channel => "Telegram";
    public void Send(string message) => Console.WriteLine($"[Telegram] To: @{_handle} | {message}");
}
// channels.Add(new TelegramNotification("ravi_k"));  -> Messages sent: 4`,
    },
    {
      task: 'Create interfaces IPrintable (Print()) and IScannable (Scan()). Create MultiFunctionPrinter that implements both and SimplePrinter that implements only IPrintable. Use the is operator to check capabilities.',
      hint: 'object o = new SimplePrinter(); o is IScannable -> False.',
      solution: `object[] devices = { new MultiFunctionPrinter(), new SimplePrinter() };
foreach (object d in devices)
{
    if (d is IPrintable p) p.Print();
    if (d is IScannable s) s.Scan(); else Console.WriteLine("  (no scanner)");
}

interface IPrintable { void Print(); }
interface IScannable { void Scan(); }
class MultiFunctionPrinter : IPrintable, IScannable
{
    public void Print() => Console.WriteLine("MFP: printing");
    public void Scan() => Console.WriteLine("MFP: scanning");
}
class SimplePrinter : IPrintable
{
    public void Print() => Console.WriteLine("Simple: printing");
}`,
    },
    {
      task: 'Create interface IShape with members int Area() and string Name { get; }. Implement Rectangle and Square. Sort a List<IShape> by area using IComparable or OrderBy and print them.',
      hint: 'shapes.OrderBy(x => x.Area()) needs System.Linq (included by implicit usings).',
      solution: `List<IShape> shapes = new List<IShape> { new Rectangle(5, 4), new Square(3), new Rectangle(2, 3) };
foreach (IShape s in shapes.OrderBy(x => x.Area()))
    Console.WriteLine($"{s.Name}: {s.Area()}");
// Rectangle: 6
// Square: 9
// Rectangle: 20

interface IShape { string Name { get; } int Area(); }
class Rectangle : IShape { int l, w; public Rectangle(int l, int w) { this.l = l; this.w = w; } public string Name => "Rectangle"; public int Area() => l * w; }
class Square : IShape { int a; public Square(int a) { this.a = a; } public string Name => "Square"; public int Area() => a * a; }`,
    },
    {
      task: 'Combine an interface and an abstract class: interface IPaymentGateway { bool Charge(int amount); } + abstract class GatewayBase : IPaymentGateway that logs "Charging Rs.X" and calls abstract DoCharge(int). Create UpiGateway : GatewayBase.',
      hint: 'GatewayBase implements Charge() publicly and declares protected abstract bool DoCharge(int amount).',
      solution: `IPaymentGateway g = new UpiGateway();
Console.WriteLine(g.Charge(999));
// Charging Rs.999
// UPI collect sent
// True

interface IPaymentGateway { bool Charge(int amount); }
abstract class GatewayBase : IPaymentGateway
{
    public bool Charge(int amount)
    {
        Console.WriteLine($"Charging Rs.{amount}");
        return DoCharge(amount);
    }
    protected abstract bool DoCharge(int amount);
}
class UpiGateway : GatewayBase
{
    protected override bool DoCharge(int amount) { Console.WriteLine("UPI collect sent"); return true; }
}`,
    },
    {
      task: 'Write a class that implements IDisposable and use it in a using block. Print messages in the constructor, in a Work() method and in Dispose(), and observe the order.',
      hint: 'using (var r = new Resource()) { r.Work(); } calls Dispose automatically at the closing brace.',
      solution: `using (Resource r = new Resource())
{
    r.Work();
}
Console.WriteLine("After using block");
// Resource opened
// Working...
// Resource disposed
// After using block

class Resource : IDisposable
{
    public Resource() => Console.WriteLine("Resource opened");
    public void Work() => Console.WriteLine("Working...");
    public void Dispose() => Console.WriteLine("Resource disposed");
}`,
    },
  ],
  quiz: [
    {
      question: 'How many interfaces can a C# class implement?',
      options: ['Only one', 'Two at most', 'Any number', 'None if it inherits a class'],
      answer: 2,
      explanation: 'A class can inherit one base class and implement any number of interfaces.',
    },
    {
      question: 'Which of these can an interface NOT contain?',
      options: ['Method declarations', 'Properties', 'Instance fields', 'Events'],
      answer: 2,
      explanation: 'Interfaces cannot have instance fields or constructors. They can declare methods, properties, events and indexers (and static members since C# 8).',
    },
    {
      question: 'An explicitly implemented member string IHindiGreeter.Greet() can be called...',
      options: ['Only through an IHindiGreeter reference or cast', 'Directly on the class variable', 'Only from inside the class', 'Never'],
      answer: 0,
      explanation: 'Explicit implementations are not part of the class public API; they are reached through the interface type.',
    },
    {
      question: 'Which declaration is correct?',
      options: ['class Manager : IPayable, Employee', 'class Manager : Employee, IPayable', 'class Manager implements IPayable', 'interface IPayable : Employee'],
      answer: 1,
      explanation: 'The base class comes first, followed by interfaces. C# has no implements keyword, and interfaces cannot inherit classes.',
    },
    {
      question: 'Which is the best choice for unrelated classes Email, SMS and WhatsApp that all need Send()?',
      options: ['A sealed class', 'A static class', 'A partial class', 'An interface INotification'],
      answer: 3,
      explanation: 'They share a capability, not code or state, so an interface contract is the natural choice and allows loose coupling.',
    },
  ],
};
