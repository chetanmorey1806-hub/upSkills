export default {
  lesson: 'extra-21-solid-principles',
  minutes: 25,
  intro: 'Recognise violations of the five SOLID principles in C# code and pick the refactoring that fixes them.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: '`class Invoice` calculates the total, saves itself to SQL Server **and** emails a PDF. Which principle is broken?',
      options: ['Single Responsibility Principle', 'Liskov Substitution Principle', 'Interface Segregation Principle', 'None, this is good cohesion'],
      answer: 0,
      explain: 'SRP: a class should have only one reason to change. Here tax rules, the database and the email format all change the same class. Split it into `Invoice` (calculation), `InvoiceRepository` (saving) and `InvoiceMailer` (emailing).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A `DiscountCalculator` has a growing `switch (customerType)` that must be edited for every new customer type. Which refactoring follows the **Open/Closed Principle**?',
      options: ['Add more `case` labels', 'Create an `IDiscountRule` interface and one class per customer type; add new types as new classes', 'Make the method static', 'Move the switch into the controller'],
      answer: 1,
      explain: 'Open for extension, closed for modification: new behaviour is added by writing a **new class** implementing `IDiscountRule`, without touching existing tested code. Editing the switch every time is exactly what OCP avoids.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'An OCP-style design using an interface. What does this print?',
      example: { title: 'strategy per type', code: `interface IShape { double Area(); }
class Square : IShape { ... }` },
      code: `var rules = new List<IDiscount> { new Student(), new Senior(), new Regular() };
foreach (var r in rules) Console.WriteLine($"{r.GetType().Name}: {r.Apply(1000)}");

interface IDiscount { int Apply(int amount); }
class Student : IDiscount { public int Apply(int a) => a - a * 15 / 100; }
class Senior : IDiscount { public int Apply(int a) => a - a * 25 / 100; }
class Regular : IDiscount { public int Apply(int a) => a; }`,
      expected: `Student: 850
Senior: 750
Regular: 1000`,
      explain: 'Each rule is its own class. Adding a "Staff" discount means adding one more class, not editing the others. 1000 − 150 = 850, 1000 − 250 = 750, Regular unchanged. `GetType().Name` prints the class name.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`class Ostrich : Bird` overrides `Fly()` to `throw new NotSupportedException()`. Code that loops over `List<Bird>` and calls `Fly()` crashes. Which principle is violated?',
      options: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Dependency Inversion'],
      answer: 2,
      explain: 'LSP: a derived class must be usable wherever its base class is expected without breaking behaviour. An ostrich cannot honour the `Fly` contract, so the hierarchy is wrong; split it into `Bird` and `IFlyingBird` instead.',
    },
    {
      type: 'multi',
      mins: 2,
      q: '`interface IWorker { void Work(); void Eat(); void Sleep(); }` is implemented by `Robot`, which throws in `Eat()` and `Sleep()`. Which fixes follow the **Interface Segregation Principle**? Select all that apply.',
      options: ['Split into `IWorkable`, `IFeedable`, `ISleepable`', 'Let `Robot` implement only `IWorkable`', 'Keep `IWorker` and leave the methods empty in Robot', 'Add a `bool CanEat` flag to the interface', '`Human` implements all three small interfaces'],
      answers: [0, 1, 4],
      explain: 'ISP: no client should be forced to depend on methods it does not use. Small, focused interfaces let `Robot` implement only `IWorkable` while `Human` implements all three. Empty or throwing methods and flags only hide the problem.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Apply the **Dependency Inversion Principle**: the high-level \`OrderService\` should depend on an abstraction, not on \`SqlOrderRepository\`. Complete the constructor parameter:
\`public OrderService(______ repo) { _repo = repo; }\``,
      example: { title: 'depending on an abstraction', code: 'public PaymentService(IPaymentGateway gateway) { _gateway = gateway; }' },
      accept: ['IOrderRepository'],
      acceptRegex: ['^IOrder\\w*$'],
      caseSensitive: true,
      explain: 'DIP: high-level modules and low-level modules both depend on abstractions (`IOrderRepository`). The concrete SQL class is chosen in `Program.cs` through DI, so tests can pass a fake repository.',
    },
  ],
};
