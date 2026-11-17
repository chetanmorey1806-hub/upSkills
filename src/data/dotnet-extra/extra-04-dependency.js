const passengerTaxi = `using System;

class Taxi
{
    public string Number { get; }
    public Taxi(string number) { Number = number; }
    public int Fare(int km) => 50 + km * 12;
}

class Passenger
{
    public string Name { get; }
    public Passenger(string name) { Name = name; }

    // Dependency: Taxi is only a METHOD PARAMETER, not a field
    public void Travel(Taxi taxi, int km)
    {
        Console.WriteLine($"{Name} took taxi {taxi.Number} for {km} km, fare = {taxi.Fare(km)}");
    }
}

class Program
{
    static void Main()
    {
        var meena = new Passenger("Meena");
        meena.Travel(new Taxi("MH12-1111"), 10);
        meena.Travel(new Taxi("MH12-2222"), 4);
        Console.WriteLine("Meena does not keep any taxi after the ride");
    }
}
`;

const invoiceTax = `using System;

class TaxCalculator
{
    public int Gst(int amount) => amount * 18 / 100;
}

class InvoiceService
{
    public int FinalAmount(int amount, int discount)
    {
        var calc = new TaxCalculator();                       // dependency through a local variable
        int afterDiscount = Math.Max(0, amount - discount);   // dependency on the static Math class
        return afterDiscount + calc.Gst(afterDiscount);
    }
}

class Program
{
    static void Main()
    {
        var service = new InvoiceService();
        Console.WriteLine(service.FinalAmount(1000, 100));
        Console.WriteLine(service.FinalAmount(500, 800));
        Console.WriteLine(service.FinalAmount(2500, 0));
    }
}
`;

const otpSenders = `using System;

interface IMessageSender
{
    string Send(string to, string text);
}

class EmailSender : IMessageSender
{
    public string Send(string to, string text) => $"EMAIL to {to}: {text}";
}

class SmsSender : IMessageSender
{
    public string Send(string to, string text) => $"SMS to {to}: {text}";
}

class OtpService
{
    // Depends on the ABSTRACTION, and only for the duration of this call
    public void SendOtp(IMessageSender sender, string to, int otp)
    {
        Console.WriteLine(sender.Send(to, $"Your OTP is {otp}"));
    }
}

class Program
{
    static void Main()
    {
        var otp = new OtpService();
        otp.SendOtp(new EmailSender(), "asha@mail.com", 4821);
        otp.SendOtp(new SmsSender(), "98765-43210", 1907);
    }
}
`;

const chefKnife = `using System;

class Kitchen
{
    public string Name { get; }
    public Kitchen(string name) { Name = name; }
}

class Knife
{
    public string Cut(string item) => $"{item} sliced";
}

class Chef
{
    private readonly Kitchen _kitchen;             // association: kept as a field
    public Chef(Kitchen kitchen) { _kitchen = kitchen; }

    public void Prepare(Knife knife, string item)  // dependency: only a parameter
    {
        Console.WriteLine($"[{_kitchen.Name}] {knife.Cut(item)}");
    }
}

class Program
{
    static void Main()
    {
        var chef = new Chef(new Kitchen("Main Kitchen"));
        chef.Prepare(new Knife(), "Onion");
        chef.Prepare(new Knife(), "Tomato");
    }
}
`;

export default {
  id: 'extra-04-dependency',
  title: 'Dependency (Uses-a Relationship)',
  module: 'Extra: OOP Concepts',
  extraNo: 4,
  level: 'Intermediate',
  duration: '1 hour',
  summary: `Dependency is the weakest relationship between classes: one class uses another only temporarily - as a method parameter, a local variable, a return type or a static call - and does not keep a reference to it. A passenger uses a taxi for one ride; a chef uses a knife while cooking. Learn how to spot dependencies, how they are drawn in UML (dashed arrow), the difference between tight and loose dependencies, and why depending on interfaces is the first step towards Dependency Injection.`,
  objectives: [
    'Define dependency (uses-a) and distinguish it from association, aggregation and composition',
    'Identify the four ways a dependency appears in C# code',
    'Explain tight vs loose dependency and why "new" inside a method creates tight coupling',
    'Depend on interfaces to make code flexible and testable',
  ],
  theory: [
    {
      heading: 'What is Dependency?',
      content: `A **dependency** exists when **class A uses class B to do its job, but does not keep B**. It is a short-lived **"uses-a"** relationship.

**Real-world analogy:** You take an auto-rickshaw or taxi to the office. You **use** it for the ride, pay, and walk away. You do not own it and you do not remember it afterwards. Tomorrow you may use a different taxi. If taxis change their fare rule, your trip cost changes - you **depend** on them.

In code: if class B changes (method renamed, parameters changed), class A may have to change too. That is why we say "A depends on B".`,
      points: [
        'Dependency = uses-a, temporary',
        'No field/property stores the other object',
        'Weakest of all class relationships',
        'UML: dashed line with an open arrow from the user to the used class (A - - -> B)',
      ],
    },
    {
      heading: 'Four ways a dependency appears in C#',
      content: `1. **Method parameter** - void Travel(Taxi taxi)
2. **Local variable** created inside a method - var calc = new TaxCalculator();
3. **Return type** - Report Build() { return new Report(); }
4. **Static member call** - Math.Max(...), File.ReadAllText(...), DateTime.Now

If instead the object is stored in a **field or property** and used across many method calls, it is an **association** (or aggregation/composition), not a plain dependency.`,
      syntax: `class Passenger
{
    public void Travel(Taxi taxi, int km)        // parameter dependency
    {
        var receipt = new Receipt();              // local variable dependency
        Console.WriteLine(Math.Max(km, 1));       // static dependency
    }
}`,
    },
    {
      heading: 'Dependency vs Association vs Aggregation vs Composition',
      content: `Order the relationships from weakest to strongest:

| Relationship | How long A holds B | Code shape | Example |
|---|---|---|---|
| Dependency | during one method call | parameter / local / static | Passenger uses Taxi |
| Association | as long as A lives (field) | field holding a reference | Chef works in Kitchen |
| Aggregation | field, whole-part, shared parts | field + parts created outside | Team has Players |
| Composition | field, whole owns parts | field + parts created inside | House has Rooms |

A quick test: **"Is B stored in a field of A?"** No -> dependency. Yes -> one of the other three.`,
    },
    {
      heading: 'Tight vs Loose Dependency',
      content: `**Tight dependency:** A creates a concrete B with **new** inside its method, or calls a concrete static class. You cannot replace B without editing A, and you cannot unit-test A without B. Example: new TaxCalculator() inside InvoiceService.

**Loose dependency:** A receives B from outside, typed as an **interface** (IMessageSender). Any implementation (Email, SMS, WhatsApp, a fake for tests) can be passed in. A does not care which one.

This is the idea behind the **Dependency Inversion Principle (the D in SOLID)**: high-level classes should depend on abstractions, not on concrete classes. Passing the dependency in is called **Dependency Injection** - by method parameter (method injection), by property, or most commonly by **constructor injection** (next topic).`,
      points: [
        '"new is glue" - every new of a concrete class glues the two classes together',
        'Static calls (DateTime.Now, File.*) are hidden dependencies that make testing hard',
        'Depend on interfaces, pass implementations in',
      ],
      tip: 'Value-like helpers (string, List<T>, Math) are fine to depend on directly. Worry about dependencies on things that change or touch the outside world: database, email, files, clock, payment gateway.',
    },
    {
      heading: 'Why dependencies matter in real projects',
      content: `In an ASP.NET Core application, a controller depends on a service, the service depends on a repository, and the repository depends on a DbContext. If each class created the next with **new**, you would have a rigid chain that is impossible to test or reconfigure.

Good habits:
- Keep the **number** of dependencies per class small (more than 4-5 usually means the class does too much).
- Make dependencies **visible** (parameters/constructor), not hidden inside methods.
- Point dependencies **towards stable abstractions** (interfaces) rather than volatile details.
- Avoid **circular dependencies** (A needs B and B needs A) - they are a design smell and the DI container will throw an exception for them.`,
    },
  ],
  examples: [
    {
      title: 'Passenger uses a Taxi (parameter dependency)',
      scenario: 'A ride-booking app: a passenger takes different taxis for different rides and keeps none of them.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it DependencyDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
      ],
      code: passengerTaxi,
      csharp: { files: { 'Program.cs': passengerTaxi }, stdin: '' },
      result: `Meena took taxi MH12-1111 for 10 km, fare = 170
Meena took taxi MH12-2222 for 4 km, fare = 98
Meena does not keep any taxi after the ride`,
      explanation: `Fare = 50 + km x 12: 50 + 120 = 170 and 50 + 48 = 98. Passenger has no Taxi field - the Taxi is received as a parameter, used once and forgotten. That is a pure dependency. If Taxi.Fare changed its signature, Passenger.Travel would need to change, which is exactly what "Passenger depends on Taxi" means.`,
    },
    {
      title: 'Hidden, tight dependencies: local new and static calls',
      scenario: 'An invoice service computes the final amount with GST at 18 percent after a discount.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it InvoiceDependency',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Right-click TaxCalculator > Find All References (Shift+F12) to see every place that depends on it',
      ],
      code: invoiceTax,
      csharp: { files: { 'Program.cs': invoiceTax }, stdin: '' },
      result: `1062
0
2950`,
      explanation: `1000 - 100 = 900, GST = 900 x 18 / 100 = 162, total 1062. 500 - 800 is negative, Math.Max(0, -300) gives 0, GST of 0 is 0. 2500 - 0 = 2500, GST = 450, total 2950. The dependency on TaxCalculator is hidden inside the method: callers cannot see it or replace it (for example with a different tax rate for exports). That is a tight dependency.`,
    },
    {
      title: 'Loose dependency on an interface: OTP via Email or SMS',
      scenario: 'A login system sends one-time passwords. Today by email and SMS, tomorrow maybe by WhatsApp - without changing OtpService.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OtpDependency',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Add a WhatsAppSender class that implements IMessageSender and call SendOtp with it - OtpService needs no change',
      ],
      code: otpSenders,
      csharp: { files: { 'Program.cs': otpSenders }, stdin: '' },
      result: `EMAIL to asha@mail.com: Your OTP is 4821
SMS to 98765-43210: Your OTP is 1907`,
      explanation: `OtpService depends only on the IMessageSender interface. The concrete sender is chosen by the caller and passed in (method injection). Each call uses a different implementation, and OtpService never mentions EmailSender or SmsSender - loose coupling.`,
    },
    {
      title: 'Association and dependency side by side: Chef, Kitchen and Knife',
      scenario: 'A restaurant chef always works in the same kitchen (kept) but picks up any knife for a task (used temporarily).',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ChefRelations',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: chefKnife,
      csharp: { files: { 'Program.cs': chefKnife }, stdin: '' },
      result: `[Main Kitchen] Onion sliced
[Main Kitchen] Tomato sliced`,
      explanation: `The Kitchen is stored in the _kitchen field and used by every call - association. The Knife arrives as a parameter and is not stored - dependency. Two different Knife objects are used for the two calls and both become garbage right after.`,
    },
  ],
  interview: [
    { q: 'What is a dependency relationship in OOP?', a: 'A temporary uses-a relationship: one class uses another inside a method (parameter, local variable, return type or static call) without storing it in a field.', level: 'Easy' },
    { q: 'How is dependency drawn in UML?', a: 'A dashed line with an open arrowhead pointing from the dependent class (user) to the class it uses.', level: 'Easy' },
    { q: 'What is the difference between dependency and association?', a: 'In association the object is kept in a field and used across the lifetime of the owner. In dependency it is used only during a method call and not kept.', level: 'Easy' },
    { q: 'List the ways a dependency can appear in C# code.', a: 'Method parameter, local variable created with new, method return type, call to a static member (Math, File, DateTime.Now), and also catching/throwing a specific exception type or using a type in a generic argument.', level: 'Medium' },
    { q: 'What is tight coupling? Give an example.', a: 'When a class depends on a concrete implementation it creates itself, e.g. var mailer = new SmtpMailer(); inside OrderService. You cannot swap or mock SmtpMailer without editing OrderService.', level: 'Medium' },
    { q: 'How do you make a dependency loose?', a: 'Depend on an interface or abstract class and receive the implementation from outside (method, property or constructor injection) instead of creating it with new.', level: 'Medium' },
    { q: 'Why is DateTime.Now considered a hidden dependency?', a: 'The method silently depends on the system clock, so its result changes every run and tests cannot control it. Injecting a clock (TimeProvider in .NET 8+) makes it testable.', level: 'Hard' },
    { q: 'What is the Dependency Inversion Principle?', a: 'High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.', level: 'Medium' },
    { q: 'Is dependency the same as Dependency Injection?', a: 'No. Dependency is the relationship (A uses B). Dependency Injection is a technique for supplying B to A from outside instead of A creating B.', level: 'Medium' },
    { q: 'What is a circular dependency and why is it bad?', a: 'A depends on B and B depends on A (directly or through a chain). It makes code hard to change and test, and ASP.NET Core DI throws an InvalidOperationException when it detects a circular dependency between registered services.', level: 'Hard' },
    { q: 'Output? class T { public int F(int k) => 50 + k * 12; } ... Console.WriteLine(new T().F(0) + new T().F(1));', a: '112. F(0) = 50 and F(1) = 62; 50 + 62 = 112. Both T objects are used temporarily - a dependency.', level: 'Easy' },
    { q: 'Order the relationships from weakest to strongest.', a: 'Dependency < Association < Aggregation < Composition. (Inheritance is a different kind - is-a - and is the strongest coupling of all.)', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a Student class with a method Pay(FeeCounter counter, int amount) that prints "Paid 5000 at Counter 2". FeeCounter has a Number property. Do not store the counter in Student.',
      hint: 'Use the counter only inside Pay.',
      solution: `class FeeCounter { public int Number { get; } public FeeCounter(int n) { Number = n; } }

class Student
{
    public void Pay(FeeCounter counter, int amount) =>
        Console.WriteLine($"Paid {amount} at Counter {counter.Number}");
}

new Student().Pay(new FeeCounter(2), 5000);   // Paid 5000 at Counter 2`,
    },
    {
      task: 'Refactor a ReportService that does var printer = new PdfPrinter(); inside Print() so it depends on an IPrinter interface passed as a method parameter. Add PdfPrinter and ExcelPrinter.',
      hint: 'Define interface IPrinter { string Print(string title); }',
      solution: `interface IPrinter { string Print(string title); }
class PdfPrinter : IPrinter { public string Print(string t) => $"{t}.pdf"; }
class ExcelPrinter : IPrinter { public string Print(string t) => $"{t}.xlsx"; }

class ReportService
{
    public void Print(IPrinter printer, string title) => Console.WriteLine(printer.Print(title));
}

var r = new ReportService();
r.Print(new PdfPrinter(), "Sales");    // Sales.pdf
r.Print(new ExcelPrinter(), "Sales");  // Sales.xlsx`,
    },
    {
      task: 'Identify the relationship (dependency, association, aggregation, composition) for: (a) Doctor uses Stethoscope in Examine(); (b) Hospital creates Wards; (c) Hospital keeps a list of Doctors hired from outside; (d) Patient has a reference to their family Doctor.',
      hint: 'Ask: is it stored in a field? Who creates it? Does it survive the whole?',
      solution: `(a) Dependency - only used inside the method.
(b) Composition - wards are created by and die with the hospital.
(c) Aggregation - doctors are created outside and survive if the hospital closes.
(d) Association - a stored reference, but no whole-part meaning.`,
    },
    {
      task: 'Write a Greeter.Greet(IClock clock, string name) that returns "Good Morning, X" if hour < 12 else "Good Evening, X". Create a FixedClock for testing so the output is predictable.',
      hint: 'interface IClock { int Hour { get; } }',
      solution: `interface IClock { int Hour { get; } }
class FixedClock : IClock { public int Hour { get; } public FixedClock(int h) { Hour = h; } }

class Greeter
{
    public string Greet(IClock clock, string name) =>
        clock.Hour < 12 ? $"Good Morning, {name}" : $"Good Evening, {name}";
}

var g = new Greeter();
Console.WriteLine(g.Greet(new FixedClock(9), "Asha"));   // Good Morning, Asha
Console.WriteLine(g.Greet(new FixedClock(19), "Asha"));  // Good Evening, Asha`,
    },
  ],
  quiz: [
    {
      question: 'Which code shape represents a pure dependency of A on B?',
      options: ['A has a private field of type B', 'A inherits from B', 'A has a method with a parameter of type B and does not store it', 'A creates a list of B in its constructor and keeps it'],
      answer: 2,
      explanation: 'A dependency is temporary: B is used inside a method call and not kept in a field.',
    },
    {
      question: 'In UML, a dependency is drawn as:',
      options: ['A dashed line with an open arrow', 'A solid line with a filled diamond', 'A solid line with a hollow triangle', 'A solid line with a hollow diamond'],
      answer: 0,
      explanation: 'Dashed arrow = dependency. Diamonds are aggregation/composition, hollow triangle is inheritance.',
    },
    {
      question: 'Which of these creates a TIGHT dependency?',
      options: ['A parameter of type INotifier', 'var sender = new SmtpEmailSender(); inside a method', 'A constructor parameter of type IRepository', 'A generic type parameter T'],
      answer: 1,
      explanation: 'Creating a concrete class with new inside the method glues the two classes together.',
    },
    {
      question: 'Which principle says high-level classes should depend on abstractions?',
      options: ['Single Responsibility', 'Liskov Substitution', 'Open/Closed', 'Dependency Inversion'],
      answer: 3,
      explanation: 'The D in SOLID - Dependency Inversion Principle.',
    },
    {
      question: 'Arrange from weakest to strongest relationship:',
      options: ['Composition, Aggregation, Association, Dependency', 'Dependency, Association, Aggregation, Composition', 'Association, Dependency, Composition, Aggregation', 'Aggregation, Dependency, Composition, Association'],
      answer: 1,
      explanation: 'Dependency (temporary) < Association (kept) < Aggregation (whole-part, independent) < Composition (whole owns parts).',
    },
  ],
};
