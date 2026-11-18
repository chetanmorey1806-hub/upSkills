const SINGLETON = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

Console.WriteLine("App started");

// 10 threads ask for the instance at the same time
var instances = new AppConfig[10];
Parallel.For(0, 10, i => instances[i] = AppConfig.Instance);
Console.WriteLine($"10 threads, distinct instances: {instances.Distinct().Count()}");
Console.WriteLine($"Constructor ran {AppConfig.CreatedCount} time(s)");

var a = AppConfig.Instance;
var b = AppConfig.Instance;
Console.WriteLine($"Same object? {ReferenceEquals(a, b)}");
Console.WriteLine($"App name: {a.Get("AppName")}");
a.Set("Theme", "Dark");
Console.WriteLine($"Theme via b: {b.Get("Theme")}");
// var c = new AppConfig();   // CS0122: constructor is private

sealed class AppConfig
{
    // Lazy<T> creates the object on first use and is thread-safe by default
    private static readonly Lazy<AppConfig> lazy = new(() => new AppConfig());

    public static AppConfig Instance => lazy.Value;
    public static int CreatedCount { get; private set; }

    private readonly Dictionary<string, string> settings = new() { ["AppName"] = "Student Portal" };

    private AppConfig()                              // private: nobody outside can call new
    {
        CreatedCount++;
        Console.WriteLine("AppConfig created (expensive setup runs once)");
    }

    public string Get(string key) => settings.TryGetValue(key, out var value) ? value : "(not set)";
    public void Set(string key, string value) => settings[key] = value;
}`;

const FACTORY = `using System;

string[] requests = { "upi", "CARD", "cash", "crypto" };
foreach (string type in requests)
{
    try
    {
        IPayment payment = PaymentFactory.Create(type);   // caller never writes new UpiPayment()
        Console.WriteLine(payment.Pay(1500));
    }
    catch (ArgumentException ex)
    {
        Console.WriteLine($"Error: {ex.Message}");
    }
}

interface IPayment
{
    string Pay(int amount);
}

class UpiPayment : IPayment
{
    public string Pay(int amount) => $"Paid {amount} via UPI (no fee)";
}

class CardPayment : IPayment
{
    public string Pay(int amount) => $"Paid {amount + amount * 2 / 100} via Card (2% fee)";
}

class CashPayment : IPayment
{
    public string Pay(int amount) => $"Collect {amount} in cash on delivery";
}

static class PaymentFactory
{
    // The ONLY place that knows the concrete classes
    public static IPayment Create(string type) => type.ToLowerInvariant() switch
    {
        "upi" => new UpiPayment(),
        "card" => new CardPayment(),
        "cash" => new CashPayment(),
        _ => throw new ArgumentException($"Unknown payment type '{type}'"),
    };
}`;

const REPOSITORY = `using System;
using System.Collections.Generic;
using System.Linq;

IRepository<Student> repo = new InMemoryRepository<Student>();
var service = new StudentService(repo);

service.Register("Asha", 88);
service.Register("Ravi", 45);
service.Register("Neha", 92);
service.PrintAll();

repo.Update(new Student { Id = 2, Name = "Ravi", Marks = 58 });
repo.Delete(1);
Console.WriteLine("After update and delete:");
service.PrintAll();
Console.WriteLine($"GetById(3): {repo.GetById(3)?.Name}");
Console.WriteLine($"GetById(1): {repo.GetById(1)?.Name ?? "null"}");

interface IEntity
{
    int Id { get; set; }
}

class Student : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

// The abstraction the business layer depends on
interface IRepository<T> where T : class, IEntity
{
    IEnumerable<T> GetAll();
    T? GetById(int id);
    void Add(T entity);
    void Update(T entity);
    void Delete(int id);
}

// One implementation (in a real app: EfRepository<T> using DbContext)
class InMemoryRepository<T> : IRepository<T> where T : class, IEntity
{
    private readonly List<T> items = new();
    private int nextId = 1;

    public IEnumerable<T> GetAll() => items;
    public T? GetById(int id) => items.FirstOrDefault(x => x.Id == id);

    public void Add(T entity)
    {
        entity.Id = nextId++;
        items.Add(entity);
    }

    public void Update(T entity)
    {
        int index = items.FindIndex(x => x.Id == entity.Id);
        if (index >= 0) items[index] = entity;
    }

    public void Delete(int id) => items.RemoveAll(x => x.Id == id);
}

// Business logic: knows nothing about how data is stored
class StudentService
{
    private readonly IRepository<Student> repo;
    public StudentService(IRepository<Student> repo) => this.repo = repo;

    public void Register(string name, int marks) => repo.Add(new Student { Name = name, Marks = marks });

    public void PrintAll()
    {
        foreach (var s in repo.GetAll().OrderBy(s => s.Id))
            Console.WriteLine($"  {s.Id}. {s.Name} - {s.Marks} ({(s.Marks >= 50 ? "Pass" : "Fail")})");
    }
}`;

const STRATEGY = `using System;

var cart = new ShoppingCart(2000);
cart.Checkout();                                  // default strategy
cart.SetShipping(new ExpressShipping());
cart.Checkout();
cart.SetShipping(new FreeAboveShipping(1500));
cart.Checkout();

var small = new ShoppingCart(800);
small.SetShipping(new FreeAboveShipping(1500));
small.Checkout();

// Strategy interface: one family of interchangeable algorithms
interface IShippingStrategy
{
    string Name { get; }
    int Cost(int orderTotal);
}

class StandardShipping : IShippingStrategy
{
    public string Name => "Standard";
    public int Cost(int orderTotal) => 50;
}

class ExpressShipping : IShippingStrategy
{
    public string Name => "Express";
    public int Cost(int orderTotal) => 150 + orderTotal / 100;
}

class FreeAboveShipping : IShippingStrategy
{
    private readonly int limit;
    public FreeAboveShipping(int limit) => this.limit = limit;
    public string Name => $"Free above {limit}";
    public int Cost(int orderTotal) => orderTotal >= limit ? 0 : 99;
}

// Context: uses a strategy but does not know which one
class ShoppingCart
{
    private readonly int total;
    private IShippingStrategy shipping = new StandardShipping();

    public ShoppingCart(int total) => this.total = total;

    public void SetShipping(IShippingStrategy strategy) => shipping = strategy;

    public void Checkout()
    {
        int fee = shipping.Cost(total);
        Console.WriteLine($"{shipping.Name}: items {total} + shipping {fee} = {total + fee}");
    }
}`;

export default {
  id: 'extra-22-design-patterns',
  title: 'Design Patterns – Singleton, Factory, Repository, Strategy',
  module: 'Extra: OOP Concepts',
  extraNo: 22,
  level: 'Advanced',
  duration: '3 hours',
  summary: `Design patterns are proven, named solutions to problems that appear again and again in object-oriented design. This lesson covers the four patterns every .NET developer meets in interviews and real projects: Singleton (exactly one instance — implemented thread-safely with Lazy<T>), Factory (centralise object creation), Repository (hide data access behind an interface) and Strategy (swap algorithms at runtime). Each comes with a real-world analogy, runnable console code and its ASP.NET Core equivalent.`,
  objectives: [
    'Explain what design patterns are and the three GoF categories',
    'Implement a thread-safe Singleton with Lazy<T> and compare it with DI singletons',
    'Use a Factory to create objects by type name without exposing concrete classes',
    'Build a generic Repository and a service that depends only on its interface',
    'Apply the Strategy pattern to choose an algorithm at runtime',
  ],
  theory: [
    {
      heading: 'What are design patterns?',
      content: `A design pattern is a reusable template for solving a common design problem — not finished code, but a proven way of arranging classes and interfaces. The famous "Gang of Four" (GoF) book (1994) described 23 patterns in three groups:
• Creational — how objects are created (Singleton, Factory Method, Abstract Factory, Builder, Prototype)
• Structural — how classes are combined (Adapter, Decorator, Facade, Proxy, Composite...)
• Behavioral — how objects communicate (Strategy, Observer, Command, Iterator, Template Method...)

Repository is not a GoF pattern; it comes from Domain-Driven Design / Martin Fowler's enterprise patterns, and is extremely common in ASP.NET Core projects.

Analogy: building architects reuse ideas like "staircase", "balcony", "open kitchen". Each house is different, but the named idea saves time and everyone understands it. Patterns give developers the same shared vocabulary.`,
      tip: `Patterns build on SOLID: Factory and Strategy support Open/Closed, Repository and Strategy rely on Dependency Inversion.`,
    },
    {
      heading: 'Singleton – exactly one instance',
      content: `Intent: ensure a class has only ONE instance and provide a global access point to it. Used for configuration, logging, caches, connection managers.

Analogy: a country has one Prime Minister at a time. Everyone who asks "who is the PM?" gets the same person.

Ingredients: (1) a private constructor so nobody can call new, (2) a private static field holding the instance, (3) a public static Instance property. The class is usually sealed.

Thread safety: the naive version "if (instance == null) instance = new X();" can create two objects when two threads check at the same time. Options: lock with double-check, static readonly field initialiser, or the recommended modern way — Lazy<T>, which is lazy (created on first use) AND thread-safe by default (LazyThreadSafetyMode.ExecutionAndPublication).`,
      syntax: `public sealed class AppConfig
{
    private static readonly Lazy<AppConfig> lazy = new(() => new AppConfig());
    public static AppConfig Instance => lazy.Value;
    private AppConfig() { }
}`,
      points: [
        'Pros: one shared object, lazy creation, controlled access',
        'Cons: hidden global state, hard to unit test/mock, can become a "god object"',
        'In ASP.NET Core prefer builder.Services.AddSingleton<IConfigService, ConfigService>() — the DI container guarantees one instance and you can still inject interfaces and mocks',
      ],
    },
    {
      heading: 'Factory – centralise object creation',
      content: `Intent: create objects without the caller knowing the concrete class. The caller asks the factory for "upi" and receives an IPayment. If a new payment type is added, only the factory changes; the hundreds of callers do not.

Analogy: a pizza counter. You order "Margherita"; the kitchen (factory) decides how to make it. You never enter the kitchen.

Variants: Simple Factory (a static Create method with a switch — shown here), Factory Method (a virtual CreateX method that subclasses override), Abstract Factory (a factory interface that creates families of related objects, e.g. light-theme vs dark-theme controls). In ASP.NET Core, IHttpClientFactory and ILoggerFactory are factories, and DI registrations like AddScoped<IPayment>(sp => ...) are factory delegates.`,
      syntax: `public static IPayment Create(string type) => type switch
{
    "upi"  => new UpiPayment(),
    "card" => new CardPayment(),
    _      => throw new ArgumentException("Unknown type")
};`,
    },
    {
      heading: 'Repository – a collection-like wrapper around data access',
      content: `Intent: separate business logic from data access. The repository exposes collection-like methods (GetAll, GetById, Add, Update, Delete) through an interface; the implementation may use EF Core, Dapper, a web API or an in-memory list. Services and controllers depend on IRepository<T>, never on DbContext directly.

Analogy: a library counter. You ask the librarian for book #42; you do not care whether it comes from shelf A, the store room or another branch.

Benefits: business code is testable with an in-memory/fake repository, data access code is in one place, you can switch storage technology. Generic repositories (IRepository<T>) remove duplicate CRUD code; specific repositories (IStudentRepository : IRepository<Student>) add queries like GetToppers(). The Unit of Work pattern groups several repository changes into one SaveChanges transaction.`,
      syntax: `public interface IRepository<T> where T : class, IEntity
{
    IEnumerable<T> GetAll();
    T? GetById(int id);
    void Add(T entity);
    void Update(T entity);
    void Delete(int id);
}

// ASP.NET Core
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));`,
      tip: `EF Core's DbSet<T> is already a repository and DbContext a unit of work. Many teams still add a repository layer for testability and to keep EF details out of controllers — know both opinions for interviews.`,
    },
    {
      heading: 'Strategy – interchangeable algorithms',
      content: `Intent: define a family of algorithms, put each one in its own class behind a common interface, and let the client choose or swap them at runtime. The "context" class (ShoppingCart) holds a reference to the strategy interface and delegates the work to it.

Analogy: Google Maps route options — car, bike, walk, public transport. Same start and end, different algorithm; you can switch with one tap.

Strategy replaces long if/else or switch blocks that choose a calculation, which makes it a direct application of the Open/Closed principle. In C# a simple strategy can also be a Func<int, int> delegate. In ASP.NET Core you can register several strategies (IEnumerable<IShippingStrategy>) or use keyed services (.NET 8+: AddKeyedScoped<IShippingStrategy, ExpressShipping>("express")).`,
      points: [
        'Strategy interface: IShippingStrategy',
        'Concrete strategies: StandardShipping, ExpressShipping, FreeAboveShipping',
        'Context: ShoppingCart, which calls shipping.Cost(total)',
        'Strategy vs Factory: Factory decides WHICH object to create; Strategy is about HOW a task is performed. They are often combined (a factory returns the right strategy).',
      ],
    },
  ],
  examples: [
    {
      title: 'Singleton with Lazy<T> – thread-safe app configuration',
      scenario: 'The Student Portal needs one shared configuration object. Ten threads request it at the same moment; the expensive constructor must run only once.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SingletonDemo',
        'Replace Program.cs with the code',
        'Uncomment new AppConfig() to see error CS0122 (private constructor), then comment it again',
        'Press Ctrl+F5',
      ],
      code: SINGLETON,
      csharp: { files: { 'Program.cs': SINGLETON }, stdin: '' },
      result: `App started
AppConfig created (expensive setup runs once)
10 threads, distinct instances: 1
Constructor ran 1 time(s)
Same object? True
App name: Student Portal
Theme via b: Dark`,
      explanation: `Nothing is created at startup ("App started" prints first). The first thread that reads lazy.Value runs the constructor; Lazy<T> blocks the other threads until it finishes and gives all of them the same object, so Distinct() finds 1 instance and CreatedCount is 1. a and b are the same reference, so a setting saved through a is visible through b. The private constructor makes new AppConfig() a compile error.`,
    },
    {
      title: 'Factory – creating payment objects by name',
      scenario: 'A checkout page receives the payment type as text ("upi", "CARD", "cash"). A PaymentFactory turns the text into the right IPayment object.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it FactoryDemo',
        'Replace Program.cs with the code',
        'Add a WalletPayment class and one line in the factory – no change is needed in the calling loop',
        'Press Ctrl+F5',
      ],
      code: FACTORY,
      csharp: { files: { 'Program.cs': FACTORY }, stdin: '' },
      result: `Paid 1500 via UPI (no fee)
Paid 1530 via Card (2% fee)
Collect 1500 in cash on delivery
Error: Unknown payment type 'crypto'`,
      explanation: `The loop only knows IPayment. ToLowerInvariant makes "CARD" match "card". The card fee is 1500 * 2 / 100 = 30, so 1530 is charged. "crypto" reaches the discard arm and the factory throws ArgumentException, which the caller catches. All knowledge of concrete classes lives inside PaymentFactory.`,
    },
    {
      title: 'Repository – generic CRUD behind an interface',
      scenario: 'A StudentService registers and lists students. It uses IRepository<Student>, so the in-memory implementation could later be replaced by an EF Core one without touching the service.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RepositoryDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'In a Web API you would register builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>)); and inject IRepository<Student> into the controller',
      ],
      code: REPOSITORY,
      csharp: { files: { 'Program.cs': REPOSITORY }, stdin: '' },
      result: `  1. Asha - 88 (Pass)
  2. Ravi - 45 (Fail)
  3. Neha - 92 (Pass)
After update and delete:
  2. Ravi - 58 (Pass)
  3. Neha - 92 (Pass)
GetById(3): Neha
GetById(1): null`,
      explanation: `Add assigns Ids 1, 2, 3. Update replaces the student with Id 2 (marks 45 → 58, now Pass) and Delete removes Id 1. GetById uses FirstOrDefault, so the missing Id 1 returns null and ?? prints "null". StudentService never sees List<T> — only the IRepository<Student> abstraction (Dependency Inversion).`,
    },
    {
      title: 'Strategy – switchable shipping cost calculation',
      scenario: 'A shopping cart can use Standard, Express or "free above a limit" shipping. The cart code never changes when a new shipping rule is added.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StrategyDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: STRATEGY,
      csharp: { files: { 'Program.cs': STRATEGY }, stdin: '' },
      result: `Standard: items 2000 + shipping 50 = 2050
Express: items 2000 + shipping 170 = 2170
Free above 1500: items 2000 + shipping 0 = 2000
Free above 1500: items 800 + shipping 99 = 899`,
      explanation: `The cart starts with StandardShipping (flat 50). Express costs 150 + 2000/100 = 170. FreeAboveShipping(1500) gives 0 for 2000 but 99 for an 800 order. ShoppingCart only calls shipping.Cost(total); swapping the object changes the algorithm at runtime.`,
    },
  ],
  interview: [
    { q: 'What is a design pattern?', a: 'A reusable, named solution to a common software design problem. It describes how to arrange classes and objects; it is a template, not ready-made code.', level: 'Easy' },
    { q: 'What are the three categories of GoF design patterns?', a: 'Creational (Singleton, Factory Method, Abstract Factory, Builder, Prototype), Structural (Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight) and Behavioral (Strategy, Observer, Command, Iterator, State, Template Method, etc.).', level: 'Easy' },
    { q: 'How do you implement a thread-safe Singleton in C#?', a: 'Sealed class, private constructor, and private static readonly Lazy<T> lazy = new(() => new T()); public static T Instance => lazy.Value;. Lazy<T> is thread-safe by default. Alternatives: static readonly field initialiser or double-checked locking with lock.', level: 'Medium' },
    { q: 'Why is the simple "if (instance == null) instance = new Singleton();" not thread-safe?', a: 'Two threads can both see null before either assigns, so both create an instance. You need lock, Lazy<T> or a static initialiser to guarantee one instance.', level: 'Medium' },
    { q: 'Singleton pattern vs AddSingleton in ASP.NET Core?', a: 'The pattern enforces one instance inside the class (private constructor, static access), which makes testing hard. AddSingleton lets the DI container manage one instance per application while the class stays a normal class behind an interface, injectable and mockable. Prefer DI in ASP.NET Core.', level: 'Hard' },
    { q: 'Static class vs Singleton?', a: 'A Singleton is an object: it can implement interfaces, be passed as a parameter, be lazily created and inherit from a base class. A static class cannot be instantiated, cannot implement interfaces and is initialised by the runtime.', level: 'Medium' },
    { q: 'What is the Factory pattern and why use it?', a: 'It moves object creation into a dedicated method/class so callers depend on an interface (IPayment) instead of concrete classes. Adding a new type changes only the factory, and creation logic (configuration, validation) is in one place.', level: 'Easy' },
    { q: 'Simple Factory vs Factory Method vs Abstract Factory?', a: 'Simple Factory: one method with a switch that returns objects. Factory Method: a base class declares an abstract/virtual Create method and subclasses decide the concrete type. Abstract Factory: an interface with several Create methods that produce a family of related objects.', level: 'Hard' },
    { q: 'What is the Repository pattern?', a: 'A layer that encapsulates data access behind an interface with collection-like methods (GetAll, GetById, Add, Update, Delete), so business logic does not depend on EF Core/SQL and can be unit-tested with a fake repository.', level: 'Easy' },
    { q: 'Generic repository vs specific repository?', a: 'A generic IRepository<T> provides common CRUD for every entity without duplication. A specific repository (IStudentRepository) adds entity-specific queries like GetToppers(). Often the specific one inherits the generic one.', level: 'Medium' },
    { q: 'Is a repository needed when using EF Core?', a: 'DbSet<T> already acts as a repository and DbContext as a unit of work, so some teams skip it. Others keep it to hide EF details, centralise queries and make services easy to unit test. Both are acceptable if applied consistently.', level: 'Hard' },
    { q: 'What is the Strategy pattern?', a: 'A behavioral pattern that defines a family of algorithms, encapsulates each in its own class behind a common interface, and lets the context swap them at runtime (e.g. shipping cost, discount, sorting, payment).', level: 'Easy' },
    { q: 'Strategy vs Factory?', a: 'Factory is creational: it decides which object to create. Strategy is behavioral: it defines interchangeable algorithms used by a context. They are often combined — a factory returns the correct strategy for a given input.', level: 'Medium' },
    { q: 'Output? In the Strategy example, new ShoppingCart(1500) with FreeAboveShipping(1500) — what is printed by Checkout?', a: 'Free above 1500: items 1500 + shipping 0 = 1500, because the condition is orderTotal >= limit.', level: 'Medium' },
    { q: 'Which SOLID principles do these patterns support?', a: 'Factory and Strategy support Open/Closed (add new classes without editing callers); Repository and Strategy rely on Dependency Inversion (depend on interfaces); each pattern class has a single responsibility (SRP).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a thread-safe Logger singleton with Lazy<T> that keeps a List<string> of messages. Log 3 messages from different places and print the count through a second reference.',
      hint: 'Private constructor, static Lazy<Logger>, public Log(string) and Count.',
      solution: `Logger.Instance.Log("Start");
Logger.Instance.Log("Login");
var again = Logger.Instance;
again.Log("Logout");
Console.WriteLine(again.Count);   // 3

sealed class Logger
{
    private static readonly Lazy<Logger> lazy = new(() => new Logger());
    public static Logger Instance => lazy.Value;
    private readonly List<string> messages = new();
    private Logger() { }
    public void Log(string m) => messages.Add(m);
    public int Count => messages.Count;
}`,
    },
    {
      task: 'Write a NotificationFactory that returns INotification (Email, SMS, WhatsApp) for a channel string, and send "Welcome" through each channel read from an array.',
      hint: 'Use a switch expression and throw for unknown channels.',
      solution: `foreach (var ch in new[] { "email", "sms", "whatsapp" })
    NotificationFactory.Create(ch).Send("Welcome");

interface INotification { void Send(string msg); }
class EmailNotification : INotification { public void Send(string m) => Console.WriteLine($"Email: {m}"); }
class SmsNotification : INotification { public void Send(string m) => Console.WriteLine($"SMS: {m}"); }
class WhatsAppNotification : INotification { public void Send(string m) => Console.WriteLine($"WhatsApp: {m}"); }
static class NotificationFactory
{
    public static INotification Create(string ch) => ch switch
    {
        "email" => new EmailNotification(),
        "sms" => new SmsNotification(),
        "whatsapp" => new WhatsAppNotification(),
        _ => throw new ArgumentException($"Unknown channel {ch}")
    };
}`,
    },
    {
      task: 'Extend the repository example with IStudentRepository : IRepository<Student> that adds GetToppers(int minMarks). Implement it by inheriting InMemoryRepository<Student>.',
      hint: 'class StudentRepository : InMemoryRepository<Student>, IStudentRepository',
      solution: `interface IStudentRepository : IRepository<Student>
{
    IEnumerable<Student> GetToppers(int minMarks);
}

class StudentRepository : InMemoryRepository<Student>, IStudentRepository
{
    public IEnumerable<Student> GetToppers(int minMarks) =>
        GetAll().Where(s => s.Marks >= minMarks).OrderByDescending(s => s.Marks);
}`,
    },
    {
      task: 'Implement a discount Strategy: IDiscountStrategy with NoDiscount, FestivalDiscount (20%) and CouponDiscount (flat 100). A Billing class prints the final amount for 1000 with each strategy.',
      hint: 'Pass the strategy into Billing\'s constructor or a SetStrategy method.',
      solution: `foreach (IDiscountStrategy s in new IDiscountStrategy[] { new NoDiscount(), new FestivalDiscount(), new CouponDiscount() })
    Console.WriteLine($"{s.GetType().Name}: {new Billing(s).Final(1000)}");
// NoDiscount: 1000 / FestivalDiscount: 800 / CouponDiscount: 900

interface IDiscountStrategy { int Discount(int amount); }
class NoDiscount : IDiscountStrategy { public int Discount(int a) => 0; }
class FestivalDiscount : IDiscountStrategy { public int Discount(int a) => a * 20 / 100; }
class CouponDiscount : IDiscountStrategy { public int Discount(int a) => 100; }
class Billing
{
    private readonly IDiscountStrategy strategy;
    public Billing(IDiscountStrategy strategy) => this.strategy = strategy;
    public int Final(int amount) => amount - strategy.Discount(amount);
}`,
    },
  ],
  quiz: [
    {
      question: 'Which is the recommended thread-safe lazy Singleton implementation in modern C#?',
      options: ['A public constructor with a static counter', 'private static readonly Lazy<T> with a private constructor', 'A static field set in every method', 'A public static field assigned in Main'],
      answer: 1,
      explanation: 'Lazy<T> creates the instance on first access and is thread-safe by default.',
    },
    {
      question: 'Which pattern centralises "new UpiPayment() / new CardPayment()" decisions in one place?',
      options: ['Strategy', 'Repository', 'Singleton', 'Factory'],
      answer: 3,
      explanation: 'A factory hides the concrete classes and decides which one to create.',
    },
    {
      question: 'A controller depends on IRepository<Student> instead of DbContext. What is the main benefit?',
      options: ['Faster SQL queries', 'Business code can be tested with a fake repository and is independent of the data access technology', 'No need for a database', 'Automatic caching'],
      answer: 1,
      explanation: 'The repository abstraction decouples business logic from data access (Dependency Inversion).',
    },
    {
      question: 'Choosing between Car, Bike or Walk route calculations at runtime is an example of...',
      options: ['Strategy', 'Singleton', 'Factory', 'Repository'],
      answer: 0,
      explanation: 'Strategy encapsulates interchangeable algorithms behind one interface.',
    },
    {
      question: 'In ASP.NET Core, what is usually preferred over a hand-written Singleton class?',
      options: ['A static class', 'Global variables', 'builder.Services.AddSingleton<IService, Service>()', 'A new object per request'],
      answer: 2,
      explanation: 'The DI container manages the single instance while keeping the class testable behind an interface.',
    },
  ],
};
