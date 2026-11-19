export default {
  lesson: 'extra-22-design-patterns',
  minutes: 25,
  intro: 'Identify and apply common design patterns (Singleton, Factory, Strategy, Observer, Builder) in C#.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'You need exactly **one** shared `AppConfig` object for the whole application. Which pattern fits?',
      options: ['Factory', 'Singleton', 'Observer', 'Decorator'],
      answer: 1,
      explain: 'Singleton guarantees a single instance with global access. In ASP.NET Core you usually get the same effect with `AddSingleton<AppConfig>()` instead of a hand-written static instance.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Thread-safe lazy Singleton. Complete the field initializer:
\`private static readonly Lazy<Logger> _instance = ______;\``,
      example: { title: 'Lazy<T> usage', code: 'private static readonly Lazy<Cache> _c = new Lazy<Cache>(() => new Cache());' },
      accept: ['new Lazy<Logger>(() => new Logger())', 'new Lazy<Logger>(() => new Logger());', 'new(() => new Logger())', 'new(() => new Logger());'],
      acceptRegex: ['^new\\s*(Lazy\\s*<\\s*Logger\\s*>)?\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*new\\s+Logger\\s*\\(\\s*\\)\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: '`Lazy<T>` runs the factory lambda only on first access and is thread-safe by default. The constructor of `Logger` is `private`, so only this class can call `new Logger()`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Singleton in action. What does this print?',
      example: { title: 'private constructor', code: `public sealed class Logger
{
    private Logger() { }
    public static Logger Instance => _instance.Value;
}` },
      code: `var a = Counter.Instance;
var b = Counter.Instance;
a.Hit(); b.Hit(); a.Hit();
Console.WriteLine(b.Hits);
Console.WriteLine(ReferenceEquals(a, b));
Console.WriteLine(Counter.Created);

public sealed class Counter
{
    private static readonly Lazy<Counter> _i = new(() => new Counter());
    public static int Created;
    public static Counter Instance => _i.Value;
    public int Hits { get; private set; }
    private Counter() { Created++; }
    public void Hit() => Hits++;
}`,
      expected: `3
True
1`,
      explain: 'Both variables refer to the **same** object, so three hits are counted on it and `ReferenceEquals` is True. The private constructor ran only once.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Factory pattern. What does this print?',
      example: { title: 'factory method', code: 'IPayment p = PaymentFactory.Create("upi");' },
      code: `foreach (var mode in new[] { "upi", "card", "cod" })
{
    IPayment p = PaymentFactory.Create(mode);
    Console.WriteLine(p.Pay(500));
}

interface IPayment { string Pay(int amt); }
class Upi : IPayment { public string Pay(int a) => $"UPI paid {a}"; }
class Card : IPayment { public string Pay(int a) => $"Card paid {a + a * 2 / 100}"; }
class Cod : IPayment { public string Pay(int a) => $"Collect {a + 40} on delivery"; }
static class PaymentFactory
{
    public static IPayment Create(string mode) => mode switch
    {
        "upi" => new Upi(),
        "card" => new Card(),
        _ => new Cod(),
    };
}`,
      expected: `UPI paid 500
Card paid 510
Collect 540 on delivery`,
      explain: 'The caller asks the factory for an `IPayment` and never uses `new Upi()` directly. Card adds a 2% fee (500 + 10 = 510), COD adds ₹40. To add a new payment mode you only change the factory.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match pattern to use case. Which pairs are CORRECT? Select all that apply.',
      options: ['Observer → notify many subscribers when an order status changes (C# events)', 'Strategy → choose a shipping-cost algorithm at runtime', 'Builder → construct a complex object step by step (e.g. `WebApplication.CreateBuilder`)', 'Singleton → create a new object per HTTP request', 'Decorator → add logging around a repository without changing it'],
      answers: [0, 1, 2, 4],
      explain: 'Observer = events, Strategy = swappable algorithms behind an interface, Builder = step-by-step construction, Decorator = wrapping an object to add behaviour. A new object per request is a **scoped** lifetime, not a singleton.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which C# feature is the built-in implementation of the **Observer** pattern?',
      options: ['Generics', 'Events and delegates', 'Extension methods', 'Records'],
      answer: 1,
      explain: 'A publisher exposes an `event`; observers subscribe with `+=` and get notified when it is raised. `IObservable<T>`/`IObserver<T>` exist too, but everyday code uses events.',
    },
  ],
};
