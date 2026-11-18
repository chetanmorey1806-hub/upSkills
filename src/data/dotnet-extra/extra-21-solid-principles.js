const SRP = `using System;

Console.WriteLine("BAD: one class does everything");
var bad = new BadInvoiceService();
bad.Process("Asha", 1200);

Console.WriteLine();
Console.WriteLine("GOOD: one reason to change per class");
var calculator = new InvoiceCalculator();
var printer = new InvoicePrinter();
var mailer = new EmailSender();
int total = calculator.Total(1200);
printer.Print("Asha", total);
mailer.Send("Asha", $"Your invoice total is {total}");

// ---------- BAD: tax rules, formatting and e-mail in ONE class ----------
class BadInvoiceService
{
    public void Process(string customer, int amount)
    {
        int total = amount + amount * 18 / 100;                 // reason 1: tax rule changes
        Console.WriteLine($"Invoice for {customer}: {total}");  // reason 2: layout changes
        Console.WriteLine($"Email sent to {customer}");         // reason 3: email provider changes
    }
}

// ---------- GOOD: each class has a single responsibility ----------
class InvoiceCalculator
{
    public int Total(int amount) => amount + amount * 18 / 100;
}

class InvoicePrinter
{
    public void Print(string customer, int total) => Console.WriteLine($"Invoice for {customer}: {total}");
}

class EmailSender
{
    public void Send(string to, string body) => Console.WriteLine($"Email to {to}: {body}");
}`;

const OCP = `using System;
using System.Collections.Generic;

Console.WriteLine("BAD:");
var badCalc = new BadDiscountCalculator();
Console.WriteLine($"Regular: {badCalc.GetDiscount("Regular", 1000)}");
Console.WriteLine($"Premium: {badCalc.GetDiscount("Premium", 1000)}");
Console.WriteLine($"Student: {badCalc.GetDiscount("Student", 1000)}  <- forgot to edit the switch!");

Console.WriteLine("GOOD:");
var discounts = new List<ICustomerDiscount> { new RegularDiscount(), new PremiumDiscount(), new StudentDiscount() };
foreach (var d in discounts)
    Console.WriteLine($"{d.Name}: {d.Apply(1000)}");

// ---------- BAD: every new customer type means editing this tested class ----------
class BadDiscountCalculator
{
    public int GetDiscount(string type, int amount)
    {
        switch (type)
        {
            case "Regular": return amount * 5 / 100;
            case "Premium": return amount * 15 / 100;
            default: return 0;
        }
    }
}

// ---------- GOOD: open for extension, closed for modification ----------
interface ICustomerDiscount
{
    string Name { get; }
    int Apply(int amount);
}

class RegularDiscount : ICustomerDiscount
{
    public string Name => "Regular";
    public int Apply(int amount) => amount * 5 / 100;
}

class PremiumDiscount : ICustomerDiscount
{
    public string Name => "Premium";
    public int Apply(int amount) => amount * 15 / 100;
}

class StudentDiscount : ICustomerDiscount      // NEW type added without touching existing classes
{
    public string Name => "Student";
    public int Apply(int amount) => amount * 20 / 100;
}`;

const LSP = `using System;

Console.WriteLine("BAD:");
BadRectangle r = new BadSquare();      // code written for rectangles receives a square
r.Width = 5;
r.Height = 10;
Console.WriteLine($"Expected area 50, got {r.Area()}");

Console.WriteLine("GOOD:");
Shape[] shapes = { new Rectangle(5, 10), new Square(5) };
foreach (Shape s in shapes)
    Console.WriteLine($"{s.GetType().Name} area = {s.Area()}");

// ---------- BAD: Square changes the behaviour callers expect from Rectangle ----------
class BadRectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }
    public int Area() => Width * Height;
}

class BadSquare : BadRectangle
{
    public override int Width
    {
        get => base.Width;
        set { base.Width = value; base.Height = value; }
    }
    public override int Height
    {
        get => base.Height;
        set { base.Width = value; base.Height = value; }
    }
}

// ---------- GOOD: both are Shapes; neither breaks the other's contract ----------
abstract class Shape
{
    public abstract int Area();
}

class Rectangle : Shape
{
    private readonly int width, height;
    public Rectangle(int width, int height) { this.width = width; this.height = height; }
    public override int Area() => width * height;
}

class Square : Shape
{
    private readonly int side;
    public Square(int side) => this.side = side;
    public override int Area() => side * side;
}`;

const ISP = `using System;

Console.WriteLine("BAD:");
IBadMachine cheap = new BadBasicPrinter();
cheap.Print("Resume.pdf");
try
{
    cheap.Fax("Resume.pdf");
}
catch (NotSupportedException ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}

Console.WriteLine("GOOD:");
var basic = new BasicPrinter();
var office = new OfficeMachine();
basic.Print("Resume.pdf");
office.Print("Report.pdf");
office.Scan("Aadhaar.jpg");
office.Fax("Contract.pdf");
IPrinter[] printers = { basic, office };
Console.WriteLine($"Printers available: {printers.Length}");

// ---------- BAD: one fat interface forces fake implementations ----------
interface IBadMachine
{
    void Print(string doc);
    void Scan(string doc);
    void Fax(string doc);
}

class BadBasicPrinter : IBadMachine
{
    public void Print(string doc) => Console.WriteLine($"Printing {doc}");
    public void Scan(string doc) => throw new NotSupportedException("Basic printer cannot scan");
    public void Fax(string doc) => throw new NotSupportedException("Basic printer cannot fax");
}

// ---------- GOOD: small, focused interfaces ----------
interface IPrinter { void Print(string doc); }
interface IScanner { void Scan(string doc); }
interface IFax { void Fax(string doc); }

class BasicPrinter : IPrinter
{
    public void Print(string doc) => Console.WriteLine($"Printing {doc}");
}

class OfficeMachine : IPrinter, IScanner, IFax
{
    public void Print(string doc) => Console.WriteLine($"Office printing {doc}");
    public void Scan(string doc) => Console.WriteLine($"Scanning {doc}");
    public void Fax(string doc) => Console.WriteLine($"Faxing {doc}");
}`;

const DIP = `using System;

Console.WriteLine("BAD:");
var badService = new BadOrderService();
badService.PlaceOrder(101);

Console.WriteLine("GOOD:");
var viaEmail = new OrderService(new EmailNotifier());
var viaSms = new OrderService(new SmsNotifier());
var fake = new FakeNotifier();
var forTest = new OrderService(fake);
viaEmail.PlaceOrder(102);
viaSms.PlaceOrder(103);
forTest.PlaceOrder(104);
Console.WriteLine($"Fake notifier recorded: {fake.LastMessage}");

// ---------- BAD: high-level class creates a concrete low-level class ----------
class BadEmailSender
{
    public void Send(string msg) => Console.WriteLine($"Email: {msg}");
}

class BadOrderService
{
    private readonly BadEmailSender sender = new BadEmailSender();   // hard-wired with new
    public void PlaceOrder(int id) => sender.Send($"Order {id} placed");
}

// ---------- GOOD: both depend on an abstraction, injected via constructor ----------
interface INotifier
{
    void Send(string message);
}

class EmailNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"Email: {message}");
}

class SmsNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"SMS: {message}");
}

class FakeNotifier : INotifier                 // used in unit tests
{
    public string LastMessage { get; private set; } = "";
    public void Send(string message) => LastMessage = message;
}

class OrderService
{
    private readonly INotifier notifier;
    public OrderService(INotifier notifier) => this.notifier = notifier;   // constructor injection
    public void PlaceOrder(int id) => notifier.Send($"Order {id} placed");
}`;

export default {
  id: 'extra-21-solid-principles',
  title: 'SOLID Principles – SRP, OCP, LSP, ISP, DIP',
  module: 'Extra: OOP Concepts',
  extraNo: 21,
  level: 'Advanced',
  duration: '3 hours',
  summary: `SOLID is a set of five object-oriented design principles (popularised by Robert C. Martin) that make code easier to change, test and extend: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation and Dependency Inversion. For every principle this lesson shows a runnable BAD example, explains what goes wrong, and then the GOOD refactored version — plus how each principle appears in ASP.NET Core projects.`,
  objectives: [
    'Explain each of the five SOLID principles in simple words with a real-world analogy',
    'Recognise violations (god classes, growing switch statements, NotSupportedException, new inside services)',
    'Refactor bad code into SOLID code using classes, interfaces and constructor injection',
    'Connect SOLID to ASP.NET Core dependency injection, services and repositories',
    'Answer common SOLID interview questions with code examples',
  ],
  theory: [
    {
      heading: 'Why SOLID?',
      content: `Small programs work even if everything is in one class. Real projects (Student Management, E-Commerce) change every week: new payment types, new tax rules, new notification channels. Without design rules, every change touches many files and breaks old features ("rigid" and "fragile" code). SOLID gives five guidelines that keep classes small, focused and loosely connected.`,
      points: [
        'S – Single Responsibility Principle (SRP)',
        'O – Open/Closed Principle (OCP)',
        'L – Liskov Substitution Principle (LSP)',
        'I – Interface Segregation Principle (ISP)',
        'D – Dependency Inversion Principle (DIP)',
      ],
      tip: `SOLID is a guideline, not a law. Apply it where change is likely; do not create ten interfaces for a 50-line console app (over-engineering).`,
    },
    {
      heading: 'S – Single Responsibility Principle',
      content: `"A class should have only one reason to change." Each class should do one job (one responsibility, one actor who asks for changes). A class that calculates tax, formats the invoice and sends the email has three reasons to change — the accountant, the designer and the IT team all edit the same file.

Analogy: in a restaurant the chef cooks, the waiter serves and the cashier bills. If the chef also served and billed, any change in billing rules would disturb cooking.

Signs of violation: class names like Manager/Helper/Utility with many unrelated methods, very long classes, methods that both compute and print or both validate and save to the database.`,
      syntax: `// BAD
class InvoiceService { CalculateTotal(); PrintInvoice(); SendEmail(); }

// GOOD
class InvoiceCalculator { CalculateTotal(); }
class InvoicePrinter    { PrintInvoice(); }
class EmailSender       { SendEmail(); }`,
    },
    {
      heading: 'O – Open/Closed Principle',
      content: `"Software entities should be open for extension but closed for modification." You should be able to add new behaviour (a new discount type, a new payment method) by ADDING new code, not by editing tested code. The usual tool is an interface or abstract class plus polymorphism (or delegates/Strategy pattern).

Analogy: a power strip. To use a new appliance you plug it in — you do not open the wall and rewire the house.

Sign of violation: a switch/if-else chain on a "type" string or enum that keeps growing every time a new type appears.`,
      syntax: `interface ICustomerDiscount { int Apply(int amount); }
class StudentDiscount : ICustomerDiscount { ... }   // new class, old code untouched`,
    },
    {
      heading: 'L – Liskov Substitution Principle',
      content: `"Objects of a derived class must be usable wherever the base class is expected without breaking the program." A child class must keep the promises (contract) of its parent: same meaning of methods, no stronger preconditions, no weaker postconditions, no unexpected exceptions.

Classic violation: Square inherits Rectangle. Code that sets Width = 5 and Height = 10 expects area 50, but the square keeps both sides equal and returns 100. Another: Bird has Fly(), Penguin : Bird throws NotSupportedException in Fly().

Analogy: if a rental company promises "any car", every car they give you must have a steering wheel and brakes that work the usual way. A toy car that looks like a car but cannot be driven breaks the substitution.

Fix: rethink the hierarchy — use a common abstraction (Shape) or separate interfaces (IFlyingBird) so no child has to break a promise.`,
    },
    {
      heading: 'I – Interface Segregation Principle',
      content: `"Clients should not be forced to depend on methods they do not use." Prefer several small, role-based interfaces over one large "fat" interface. If a class must implement methods it cannot support (throwing NotSupportedException or leaving empty bodies), the interface is too big.

Analogy: a TV remote for a basic TV should not have buttons for a DVD player, set-top box and air conditioner that do nothing.

In .NET: IEnumerable<T>, ICollection<T>, IList<T> are layered small interfaces; IReadOnlyList<T> exists so read-only clients do not see Add/Remove.`,
      syntax: `interface IPrinter { void Print(string doc); }
interface IScanner { void Scan(string doc); }
class OfficeMachine : IPrinter, IScanner { ... }   // implements only what it can do`,
    },
    {
      heading: 'D – Dependency Inversion Principle',
      content: `"High-level modules should not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details." The OrderService (business logic) should not create EmailSender with new. It should depend on an INotifier interface, and the concrete class is supplied from outside — usually through the constructor (Dependency Injection).

Analogy: a phone charger uses a standard USB-C port (abstraction). The phone does not care which brand of charger you plug in, and you can swap chargers without opening the phone.

Benefits: swap implementations (Email → SMS) without code changes, use fakes/mocks in unit tests, configure everything in one place. ASP.NET Core's built-in DI container is built around DIP: builder.Services.AddScoped<INotifier, EmailNotifier>();`,
      syntax: `class OrderService
{
    private readonly INotifier notifier;
    public OrderService(INotifier notifier) => this.notifier = notifier;
}

// ASP.NET Core Program.cs
builder.Services.AddScoped<INotifier, EmailNotifier>();`,
      tip: `DIP is the principle; Dependency Injection is a technique to achieve it; an IoC container (ASP.NET Core's IServiceProvider) is a tool that automates the injection.`,
    },
  ],
  examples: [
    {
      title: 'SRP – bad vs good invoice processing',
      scenario: 'An invoice must be calculated with 18% GST, printed and emailed. Compare one class doing all three with three focused classes.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SolidSrp',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: SRP,
      csharp: { files: { 'Program.cs': SRP }, stdin: '' },
      result: `BAD: one class does everything
Invoice for Asha: 1416
Email sent to Asha

GOOD: one reason to change per class
Invoice for Asha: 1416
Email to Asha: Your invoice total is 1416`,
      explanation: `Both versions produce the same total: 1200 + 1200*18/100 = 1200 + 216 = 1416. The difference is design: in the BAD version a change to tax rules, the invoice layout or the e-mail provider all edit BadInvoiceService. In the GOOD version each change touches exactly one small class, and each class can be unit-tested alone.`,
    },
    {
      title: 'OCP – bad switch vs extensible discounts',
      scenario: 'A shop adds a new "Student" customer type with a 20% discount. Compare editing a switch with adding a new class.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SolidOcp',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: OCP,
      csharp: { files: { 'Program.cs': OCP }, stdin: '' },
      result: `BAD:
Regular: 50
Premium: 150
Student: 0  <- forgot to edit the switch!
GOOD:
Regular: 50
Premium: 150
Student: 200`,
      explanation: `For 1000: 5% = 50, 15% = 150, 20% = 200. The BAD calculator silently returns 0 for Student because the developer must remember to modify the switch (and re-test everything). In the GOOD design StudentDiscount is a new class implementing ICustomerDiscount; the loop works with it automatically and no existing class was modified.`,
    },
    {
      title: 'LSP – the Rectangle/Square trap',
      scenario: 'Code written for rectangles receives a square subclass and calculates the wrong area. Then fix the hierarchy.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SolidLsp',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on r.Height = 10; press F5 and watch Width in the Locals window change too',
        'Press Ctrl+F5 for the normal run',
      ],
      code: LSP,
      csharp: { files: { 'Program.cs': LSP }, stdin: '' },
      result: `BAD:
Expected area 50, got 100
GOOD:
Rectangle area = 50
Square area = 25`,
      explanation: `Setting Width = 5 on BadSquare sets both sides to 5; setting Height = 10 then sets both sides to 10, so the area is 10*10 = 100 instead of 50. The subclass broke the parent's promise that Width and Height are independent. In the GOOD version Rectangle and Square are siblings under Shape, each with its own correct Area (5*10 = 50, 5*5 = 25), so any Shape can be substituted safely.`,
    },
    {
      title: 'ISP – fat interface vs small role interfaces',
      scenario: 'A cheap printer is forced to implement Scan and Fax from a big IMachine interface. Split it into IPrinter, IScanner and IFax.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SolidIsp',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: ISP,
      csharp: { files: { 'Program.cs': ISP }, stdin: '' },
      result: `BAD:
Printing Resume.pdf
Error: Basic printer cannot fax
GOOD:
Printing Resume.pdf
Office printing Report.pdf
Scanning Aadhaar.jpg
Faxing Contract.pdf
Printers available: 2`,
      explanation: `In the BAD design, calling Fax compiles fine (the interface promises it) but fails at runtime with NotSupportedException. In the GOOD design BasicPrinter implements only IPrinter, so calling Fax on it is impossible at compile time. OfficeMachine implements all three roles, and both machines can be treated as IPrinter.`,
    },
    {
      title: 'DIP – hard-wired dependency vs constructor injection',
      scenario: 'An order service must notify customers. The BAD version creates an e-mail sender itself; the GOOD version receives any INotifier, including a fake one for tests.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SolidDip',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'In an ASP.NET Core app you would register builder.Services.AddScoped<INotifier, EmailNotifier>(); and let DI create OrderService',
      ],
      code: DIP,
      csharp: { files: { 'Program.cs': DIP }, stdin: '' },
      result: `BAD:
Email: Order 101 placed
GOOD:
Email: Order 102 placed
SMS: Order 103 placed
Fake notifier recorded: Order 104 placed`,
      explanation: `BadOrderService can only ever send e-mail, and a unit test would really send one. OrderService depends only on INotifier: the same class works with EmailNotifier, SmsNotifier or FakeNotifier. The fake prints nothing; it just records the message so a test can assert on it.`,
    },
  ],
  interview: [
    { q: 'What does SOLID stand for?', a: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation and Dependency Inversion — five object-oriented design principles for maintainable code.', level: 'Easy' },
    { q: 'Explain the Single Responsibility Principle with an example.', a: 'A class should have only one reason to change. An InvoiceService that calculates, prints and emails should be split into InvoiceCalculator, InvoicePrinter and EmailSender so tax, layout and email changes are isolated.', level: 'Easy' },
    { q: 'Does SRP mean a class should have only one method?', a: 'No. It means one responsibility (one reason/actor for change). A StudentRepository can have Add, Update, Delete and GetById — all part of the single responsibility "persist students".', level: 'Medium' },
    { q: 'Explain the Open/Closed Principle.', a: 'Classes should be open for extension but closed for modification. Add new behaviour by adding new classes (implementations of an interface, new strategies) instead of editing existing tested code such as a growing switch.', level: 'Easy' },
    { q: 'Which language features help implement OCP in C#?', a: 'Interfaces and abstract classes with polymorphism, virtual/override, delegates (Func/Action), generics, extension methods, and DI registration of new implementations.', level: 'Medium' },
    { q: 'Explain the Liskov Substitution Principle and give a violation.', a: 'Derived types must be substitutable for their base types without changing correct behaviour. Violations: Square : Rectangle changing both sides, Penguin : Bird throwing in Fly(), a ReadOnlyCollection subclass throwing in Add.', level: 'Medium' },
    { q: 'How do you detect an LSP violation in code?', a: 'Subclasses throwing NotSupportedException/NotImplementedException for inherited members, callers checking "if (obj is Square)" before using a base reference, overridden methods that ignore or change the base meaning, stronger input requirements in the child.', level: 'Hard' },
    { q: 'Explain the Interface Segregation Principle.', a: 'Clients should not be forced to depend on methods they do not use. Split fat interfaces (IMachine with Print/Scan/Fax) into small role interfaces (IPrinter, IScanner, IFax) and let classes implement only what they support.', level: 'Easy' },
    { q: 'What is the Dependency Inversion Principle?', a: 'High-level modules and low-level modules should both depend on abstractions, and abstractions should not depend on details. OrderService depends on INotifier, not on EmailSender; the concrete class is supplied from outside.', level: 'Medium' },
    { q: 'What is the difference between DIP, Dependency Injection and IoC container?', a: 'DIP is the design principle (depend on abstractions). DI is a technique to supply dependencies from outside (constructor, property, method injection). An IoC container (ASP.NET Core IServiceProvider, Autofac) automates creating and injecting objects.', level: 'Hard' },
    { q: 'How does ASP.NET Core support SOLID?', a: 'Built-in DI (AddScoped/AddTransient/AddSingleton with interfaces) for DIP; middleware and filters for SRP and OCP; small interfaces like ILogger<T>, IOptions<T>; repository/service layers keep controllers thin (SRP).', level: 'Medium' },
    { q: 'How do SOLID principles help unit testing?', a: 'SRP gives small classes with focused tests; DIP allows injecting fakes/mocks (Moq) instead of real databases or email servers; ISP keeps mocks small; OCP means existing tests stay valid when features are added.', level: 'Medium' },
    { q: 'Can over-applying SOLID be harmful?', a: 'Yes. Creating interfaces and classes for everything in a tiny app adds complexity (over-engineering). Apply SOLID where change is likely and keep KISS/YAGNI in mind.', level: 'Hard' },
    { q: 'Output? In the BadSquare example, r.Height = 10; r.Width = 5; Console.WriteLine(r.Area());', a: '25. The last assignment (Width = 5) sets both sides to 5. The result depends on the order of assignments — a clear sign the subclass breaks Rectangle\'s contract.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'SRP: A StudentService class has methods AddStudent, CalculateGrade, ExportToCsv and SendResultSms. Split it into SOLID classes and write a Main that uses them.',
      hint: 'Think "who asks for changes": data storage, grading rules, file format, SMS provider.',
      solution: `class StudentRepository { public void Add(Student s) { /* save */ } }
class GradeCalculator { public string Grade(int marks) => marks >= 75 ? "A" : marks >= 50 ? "B" : "C"; }
class CsvExporter { public string Export(IEnumerable<Student> list) => string.Join(",", list.Select(s => s.Name)); }
class SmsSender { public void Send(string phone, string text) => Console.WriteLine($"SMS to {phone}: {text}"); }
record Student(string Name, int Marks, string Phone);`,
    },
    {
      task: 'OCP: Replace a switch on shape type ("circle", "square") that computes area with an IShape interface. Add a Triangle without changing existing classes.',
      hint: 'interface IShape { double Area(); }',
      solution: `interface IShape { double Area(); }
class Circle(double r) : IShape { public double Area() => Math.PI * r * r; }
class SquareShape(double s) : IShape { public double Area() => s * s; }
class Triangle(double b, double h) : IShape { public double Area() => 0.5 * b * h; }  // added later

// List<IShape> shapes = [ new Circle(1), new SquareShape(2), new Triangle(3, 4) ];
// foreach (var s in shapes) Console.WriteLine(s.Area());`,
    },
    {
      task: 'LSP: Bird has Fly(). Penguin : Bird throws NotSupportedException. Redesign with Bird (Eat) and an IFlyable interface, and write a loop that makes only flyable birds fly.',
      hint: 'Use "if (bird is IFlyable f) f.Fly();" or keep separate lists.',
      solution: `abstract class Bird { public abstract string Name { get; } public void Eat() => Console.WriteLine($"{Name} eats"); }
interface IFlyable { void Fly(); }
class Sparrow : Bird, IFlyable { public override string Name => "Sparrow"; public void Fly() => Console.WriteLine("Sparrow flies"); }
class Penguin : Bird { public override string Name => "Penguin"; }

foreach (Bird b in new Bird[] { new Sparrow(), new Penguin() })
{
    b.Eat();
    if (b is IFlyable f) f.Fly();
}`,
    },
    {
      task: 'ISP + DIP: Create IReportReader (Read) and IReportWriter (Write). A ReportService depends only on IReportReader via its constructor. Inject a FakeReader that returns "Test data".',
      hint: 'The service never uses Write, so it should not see it.',
      solution: `interface IReportReader { string Read(); }
interface IReportWriter { void Write(string data); }
class FakeReader : IReportReader { public string Read() => "Test data"; }
class ReportService
{
    private readonly IReportReader reader;
    public ReportService(IReportReader reader) => this.reader = reader;
    public void Show() => Console.WriteLine($"Report: {reader.Read()}");
}

// new ReportService(new FakeReader()).Show();   // Report: Test data`,
    },
    {
      task: 'DIP in ASP.NET Core: register IStudentRepository with InMemoryStudentRepository in Program.cs and inject it into a StudentsController.',
      hint: 'builder.Services.AddScoped<IStudentRepository, InMemoryStudentRepository>();',
      solution: `// Program.cs
builder.Services.AddScoped<IStudentRepository, InMemoryStudentRepository>();

// StudentsController.cs
[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentRepository repo;
    public StudentsController(IStudentRepository repo) => this.repo = repo;

    [HttpGet]
    public IActionResult GetAll() => Ok(repo.GetAll());
}`,
    },
  ],
  quiz: [
    {
      question: 'A class calculates salary, saves it to the database and emails the payslip. Which principle does it violate most?',
      options: ['Single Responsibility', 'Liskov Substitution', 'Interface Segregation', 'Open/Closed'],
      answer: 0,
      explanation: 'It has three reasons to change: salary rules, persistence and email.',
    },
    {
      question: 'Adding a new payment type requires editing a switch in PaymentProcessor. Which principle is violated?',
      options: ['Dependency Inversion', 'Liskov Substitution', 'Open/Closed', 'Interface Segregation'],
      answer: 2,
      explanation: 'The class is not closed for modification; new behaviour should be added via new classes.',
    },
    {
      question: 'Penguin : Bird throws NotSupportedException in Fly(). Which principle is violated?',
      options: ['Single Responsibility', 'Liskov Substitution', 'Open/Closed', 'Dependency Inversion'],
      answer: 1,
      explanation: 'A Penguin cannot be substituted where a Bird that can fly is expected.',
    },
    {
      question: 'What is the best fix for an interface IWorker { Work(); Eat(); } that a Robot must implement?',
      options: ['Throw NotImplementedException in Robot.Eat', 'Make Eat virtual', 'Remove the Robot class', 'Split into IWorkable and IEatable'],
      answer: 3,
      explanation: 'Interface Segregation: clients should not depend on methods they do not use.',
    },
    {
      question: 'OrderService has private readonly EmailSender sender = new EmailSender();. Which change applies DIP?',
      options: ['Make EmailSender static', 'Inject an INotifier through the constructor', 'Make the field public', 'Inherit OrderService from EmailSender'],
      answer: 1,
      explanation: 'Depend on an abstraction (INotifier) supplied from outside instead of creating a concrete class.',
    },
  ],
};
