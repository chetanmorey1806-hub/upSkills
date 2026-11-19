export default {
  lesson: 'extra-04-dependency',
  minutes: 20,
  intro: 'Spot dependencies (one class temporarily using another) and reduce tight coupling with interfaces.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A class has a **dependency** on another class when it…',
      options: ['Stores the other object in a field forever', 'Uses the other class temporarily, e.g. as a method parameter or local variable', 'Inherits from it', 'Is declared inside it'],
      answer: 1,
      explain: 'Dependency is the weakest relationship: `ReportPrinter.Print(Report r)` only uses the report while the method runs. Nothing is stored. In UML it is a dashed arrow.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which lines show `OrderService` **tightly coupled** to a concrete class? Select all that apply.',
      options: ['`var sms = new SmsSender();` inside `PlaceOrder()`', '`public OrderService(INotifier notifier)`', '`EmailSender.SendStatic(msg);` (static call)', '`private readonly INotifier _notifier;`', '`var db = new SqlConnection("...")` inside the method'],
      answers: [0, 2, 4],
      explain: 'Creating concrete objects with `new` or calling static members hard-wires the class to one implementation, so it cannot be swapped or tested. Depending on the `INotifier` interface (field or constructor parameter) is loose coupling.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'dependency through a parameter', code: 'public void Print(Report r) => Console.WriteLine(r.Title);' },
      code: `var svc = new OrderService();
svc.Place(101, new Sms());
svc.Place(102, new Email());

interface INotifier { string Send(string msg); }
class Sms : INotifier { public string Send(string m) => $"SMS: {m}"; }
class Email : INotifier { public string Send(string m) => $"EMAIL: {m}"; }
class OrderService
{
    public void Place(int id, INotifier n) => Console.WriteLine(n.Send($"Order {id} placed"));
}`,
      expected: `SMS: Order 101 placed
EMAIL: Order 102 placed`,
      explain: '`OrderService` depends only on the `INotifier` interface, passed in as a parameter. Each call uses whichever implementation is given, so the same method sends an SMS first and an email second without changing `OrderService`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Make the method depend on an **abstraction** instead of the concrete \`SmsSender\`:
\`public void Remind(______ sender, string phone)\``,
      example: { title: 'abstraction as parameter type', code: 'public decimal Pay(IPaymentGateway gateway, decimal amount)' },
      accept: ['INotifier', 'IMessageSender', 'ISender', 'INotificationSender', 'ISmsSender'],
      acceptRegex: ['^I[A-Z]\\w*$'],
      caseSensitive: true,
      explain: 'Using an interface type such as `INotifier` means any sender (SMS, WhatsApp, a fake for tests) can be passed. Keeping `SmsSender` as the parameter type is the tight-coupling mistake.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why is tight coupling a problem when writing **unit tests**?',
      options: ['Tests run slower because of interfaces', 'You cannot replace the real dependency (database, SMS gateway) with a fake', 'C# does not allow tests for classes that use `new`', 'Tight coupling makes compile errors'],
      answer: 1,
      explain: 'If `PlaceOrder` does `new SqlConnection(...)` itself, every test hits the real database. With a dependency on an interface you can pass a fake/mock and test the logic alone.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A dependency used only inside a method. What does this print?',
      example: { title: 'local dependency', code: 'var calc = new GstCalculator(); // used and then forgotten' },
      code: `var b = new Billing();
Console.WriteLine(b.Final(1000));
Console.WriteLine(b.Final(250));

class Gst { public int Of(int amount, int pct) => amount * pct / 100; }
class Billing
{
    public int Final(int amount)
    {
        var gst = new Gst();          // dependency, not stored
        return amount + gst.Of(amount, 18);
    }
}`,
      expected: `1180
295`,
      explain: '1000 × 18 / 100 = 180 → 1180. For 250: 250 × 18 = 4500, 4500 / 100 = **45** (integer division) → 295. `Gst` is a dependency: created inside the method, used, then discarded.',
    },
  ],
};
