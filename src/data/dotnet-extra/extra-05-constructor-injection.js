const orderNotifier = `using System;

interface INotifier
{
    void Notify(string message);
}

class EmailNotifier : INotifier
{
    public void Notify(string message) => Console.WriteLine($"[Email] {message}");
}

class SmsNotifier : INotifier
{
    public void Notify(string message) => Console.WriteLine($"[SMS] {message}");
}

class OrderService
{
    private readonly INotifier _notifier;

    // Constructor Injection: the dependency is handed in from outside
    public OrderService(INotifier notifier)
    {
        _notifier = notifier ?? throw new ArgumentNullException(nameof(notifier));
    }

    public void PlaceOrder(int orderId, string customer)
    {
        Console.WriteLine($"Order {orderId} saved for {customer}");
        _notifier.Notify($"Hi {customer}, order {orderId} confirmed");
    }
}

class Program
{
    static void Main()
    {
        var emailShop = new OrderService(new EmailNotifier());
        emailShop.PlaceOrder(1, "Asha");

        var smsShop = new OrderService(new SmsNotifier());
        smsShop.PlaceOrder(2, "Ravi");

        try
        {
            var broken = new OrderService(null!);
        }
        catch (ArgumentNullException ex)
        {
            Console.WriteLine($"Error: {ex.ParamName} is required");
        }
    }
}
`;

const salaryTest = `using System;
using System.Collections.Generic;

interface ITaxRule { int TaxFor(int salary); }
interface IAppLogger { void Log(string msg); }

class OldRegime : ITaxRule { public int TaxFor(int salary) => salary * 10 / 100; }
class NewRegime : ITaxRule { public int TaxFor(int salary) => salary > 50000 ? (salary - 50000) * 20 / 100 : 0; }

class ConsoleLogger : IAppLogger { public void Log(string msg) => Console.WriteLine($"LOG: {msg}"); }

class MemoryLogger : IAppLogger            // a fake used in tests
{
    public List<string> Lines { get; } = new();
    public void Log(string msg) => Lines.Add(msg);
}

class SalaryService
{
    private readonly ITaxRule _tax;
    private readonly IAppLogger _log;

    public SalaryService(ITaxRule tax, IAppLogger log)   // two injected dependencies
    {
        _tax = tax;
        _log = log;
    }

    public int NetSalary(string name, int gross)
    {
        int net = gross - _tax.TaxFor(gross);
        _log.Log($"{name}: gross {gross}, net {net}");
        return net;
    }
}

class Program
{
    static void Main()
    {
        var real = new SalaryService(new OldRegime(), new ConsoleLogger());
        real.NetSalary("Kiran", 60000);

        var memory = new MemoryLogger();
        var test = new SalaryService(new NewRegime(), memory);
        int net = test.NetSalary("Divya", 80000);
        Console.WriteLine($"Test check: net == 74000 ? {net == 74000}");
        Console.WriteLine($"Logged lines: {memory.Lines.Count} -> {memory.Lines[0]}");
    }
}
`;

const compositionRoot = `using System;
using System.Collections.Generic;

interface IStudentRepository
{
    void Add(string name);
    IReadOnlyList<string> GetAll();
}

class InMemoryStudentRepository : IStudentRepository
{
    private readonly List<string> _data = new();
    public void Add(string name) => _data.Add(name);
    public IReadOnlyList<string> GetAll() => _data;
}

class StudentService
{
    private readonly IStudentRepository _repo;
    public StudentService(IStudentRepository repo) { _repo = repo; }

    public string Register(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "Rejected: empty name";
        _repo.Add(name.Trim());
        return $"Registered {name.Trim()}";
    }

    public int Count => _repo.GetAll().Count;
}

class StudentController
{
    private readonly StudentService _service;
    public StudentController(StudentService service) { _service = service; }

    public void Post(string name) => Console.WriteLine(_service.Register(name));
    public void Get() => Console.WriteLine($"Total students: {_service.Count}");
}

class Program
{
    static void Main()
    {
        // Composition Root: the ONLY place that knows the concrete classes
        IStudentRepository repo = new InMemoryStudentRepository();
        var service = new StudentService(repo);
        var controller = new StudentController(service);

        controller.Post("  Asha ");
        controller.Post("");
        controller.Post("Ravi");
        controller.Get();
    }
}
`;

const aspnetDi = `// ===== Models/Student.cs =====
namespace StudentApi.Models;
public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

// ===== Repositories/IStudentRepository.cs =====
using StudentApi.Models;
namespace StudentApi.Repositories;
public interface IStudentRepository
{
    IEnumerable<Student> GetAll();
    Student Add(Student s);
}

// ===== Repositories/InMemoryStudentRepository.cs =====
using StudentApi.Models;
namespace StudentApi.Repositories;
public class InMemoryStudentRepository : IStudentRepository
{
    private readonly List<Student> _students = new() { new Student { Id = 1, Name = "Asha" } };
    public IEnumerable<Student> GetAll() => _students;
    public Student Add(Student s)
    {
        s.Id = _students.Count + 1;
        _students.Add(s);
        return s;
    }
}

// ===== Controllers/StudentsController.cs =====
using Microsoft.AspNetCore.Mvc;
using StudentApi.Models;
using StudentApi.Repositories;
namespace StudentApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentRepository _repo;
    private readonly ILogger<StudentsController> _logger;

    // The DI container calls this constructor and supplies both dependencies
    public StudentsController(IStudentRepository repo, ILogger<StudentsController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("Fetching all students");
        return Ok(_repo.GetAll());
    }

    [HttpPost]
    public IActionResult Post(Student s) => Created($"/api/students/{s.Id}", _repo.Add(s));
}

// ===== Program.cs =====
using StudentApi.Repositories;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register: "whenever someone asks for IStudentRepository, give them InMemoryStudentRepository"
builder.Services.AddSingleton<IStudentRepository, InMemoryStudentRepository>();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.MapControllers();
app.Run();

// ===== C# 12 primary constructor version of the controller (same behaviour) =====
// public class StudentsController(IStudentRepository repo) : ControllerBase
// {
//     [HttpGet] public IActionResult Get() => Ok(repo.GetAll());
// }`;

export default {
  id: 'extra-05-constructor-injection',
  title: 'Constructor Injection (Dependency Injection through Constructors)',
  module: 'Extra: OOP Concepts',
  extraNo: 5,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Constructor Injection is the most common form of Dependency Injection: a class declares everything it needs as constructor parameters (usually interfaces) and stores them in private readonly fields. Someone else - your Main method or the ASP.NET Core DI container - creates the real objects and passes them in. Learn the pattern step by step with console programs, see how it enables swapping implementations and writing fake objects for unit tests, and how ASP.NET Core does the wiring automatically.`,
  objectives: [
    'Explain Inversion of Control and Dependency Injection in simple words',
    'Implement constructor injection with interfaces and private readonly fields',
    'Wire an object graph manually in a Composition Root',
    'Use fakes to test a class that receives its dependencies through the constructor',
    'Register services in ASP.NET Core and let the container inject them',
  ],
  theory: [
    {
      heading: 'The problem: classes that create their own dependencies',
      content: `Imagine an OrderService that does **var mailer = new SmtpEmailSender();** inside PlaceOrder. Problems:

- To send SMS instead, you must **edit** OrderService.
- To **unit test** PlaceOrder, real emails are sent.
- The class **hides** what it needs; you only find out by reading every line.

**Real-world analogy:** A restaurant chef who grows his own vegetables, makes his own gas cylinder and builds his own stove before cooking. A real chef simply **receives** ingredients and equipment from suppliers and focuses on cooking. If a supplier changes, the chef does not change.`,
    },
    {
      heading: 'What is Constructor Injection?',
      content: `**Dependency Injection (DI)** = giving an object the things it needs from the outside instead of letting it create them. **Constructor Injection** = doing that through the **constructor**:

1. Declare each dependency as a **constructor parameter**, typed as an **interface**.
2. Store it in a **private readonly field** (it never changes after construction).
3. Optionally **guard against null** with ?? throw new ArgumentNullException(nameof(x)).
4. Use the field in your methods.

This is also called **Inversion of Control (IoC)**: control of creating dependencies is moved (inverted) from the class to its caller.`,
      syntax: `public class OrderService
{
    private readonly INotifier _notifier;

    public OrderService(INotifier notifier)
    {
        _notifier = notifier ?? throw new ArgumentNullException(nameof(notifier));
    }
}`,
      points: [
        'Dependencies are explicit - read the constructor and you know what the class needs',
        'The object is always fully initialised (cannot forget to set something)',
        'readonly fields make the dependency immutable',
      ],
    },
    {
      heading: 'Constructor vs Property vs Method Injection',
      content: `| Type | How | Use when |
|---|---|---|
| **Constructor injection** | parameters of the constructor | the dependency is **required** (most cases) |
| **Property (setter) injection** | public settable property | the dependency is **optional** and has a sensible default |
| **Method injection** | parameter of one method | the dependency changes **per call** (e.g. a CancellationToken, an IFormatProvider) |

Constructor injection is the default choice and the only one built into the ASP.NET Core container for services.`,
    },
    {
      heading: 'Composition Root and DI containers',
      content: `Somebody still has to call **new**. That place is the **Composition Root** - in a console app, the top of Main; in ASP.NET Core, Program.cs. It is the only place that knows the concrete classes.

Manual wiring (Pure DI):
var repo = new InMemoryStudentRepository();
var service = new StudentService(repo);
var controller = new StudentController(service);

For big apps a **DI container** builds the graph for you. ASP.NET Core has one built in (Microsoft.Extensions.DependencyInjection):

- builder.Services.**AddTransient**<IFoo, Foo>() - new object every time it is requested
- builder.Services.**AddScoped**<IFoo, Foo>() - one object per HTTP request
- builder.Services.**AddSingleton**<IFoo, Foo>() - one object for the whole application

When a controller is needed, the container looks at its constructor, resolves each parameter (recursively) and calls it.`,
      tip: 'In a console app you can use the same container: dotnet add package Microsoft.Extensions.DependencyInjection, then new ServiceCollection().AddSingleton<...>().BuildServiceProvider().',
    },
    {
      heading: 'Testing with fakes, and common mistakes',
      content: `Because the class only knows the interface, a test can pass a **fake** (hand-written class) or a **mock** (Moq library) and check the behaviour without a database, email server or network.

Common mistakes:
- **Too many constructor parameters** (6, 7, 8...) - the class has too many responsibilities; split it.
- **Service Locator**: injecting IServiceProvider and calling GetService everywhere hides dependencies - avoid.
- **Captive dependency**: a Singleton that receives a Scoped service (e.g. DbContext) keeps it alive forever - the container throws in Development.
- Doing **heavy work in the constructor** (DB calls) - constructors should only store dependencies.
- **C# 12 primary constructors**: class OrderService(INotifier notifier) is a shorter syntax for the same idea; the parameter is captured, but it is not readonly, so many teams still assign it to a readonly field.`,
    },
  ],
  examples: [
    {
      title: 'OrderService with an injected INotifier',
      scenario: 'An online shop sends order confirmations. One branch uses email, another SMS - same OrderService code.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it ConstructorInjectionDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
      ],
      code: orderNotifier,
      csharp: { files: { 'Program.cs': orderNotifier }, stdin: '' },
      result: `Order 1 saved for Asha
[Email] Hi Asha, order 1 confirmed
Order 2 saved for Ravi
[SMS] Hi Ravi, order 2 confirmed
Error: notifier is required`,
      explanation: `OrderService never says new EmailNotifier() - it receives an INotifier in its constructor. Main decides which implementation to inject. Passing null triggers the guard clause: nameof(notifier) gives the string "notifier", which becomes the exception's ParamName. The compiler only warns that the variable broken is unused.`,
    },
    {
      title: 'Two dependencies and a fake logger for testing',
      scenario: 'A payroll service supports old and new tax regimes. In tests we replace the console logger with an in-memory one and assert the result.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PayrollDI',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: salaryTest,
      csharp: { files: { 'Program.cs': salaryTest }, stdin: '' },
      result: `LOG: Kiran: gross 60000, net 54000
Test check: net == 74000 ? True
Logged lines: 1 -> Divya: gross 80000, net 74000`,
      explanation: `Old regime: 60000 x 10 / 100 = 6000 tax, net 54000, logged to the console. New regime: (80000 - 50000) x 20 / 100 = 6000 tax, net 74000. The MemoryLogger collects messages in a list instead of printing, so a test can check exactly what was logged. SalaryService did not change at all - only the injected objects did.`,
    },
    {
      title: 'Manual Composition Root: Controller -> Service -> Repository',
      scenario: 'A student registration flow layered like a real Web API, wired by hand at the top of Main.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it CompositionRootDemo',
        'Replace Program.cs with the code',
        'Press F9 on the line var controller = ..., run with F5 and press F11 to step into the constructors',
        'Press Ctrl+F5 to see the output',
      ],
      code: compositionRoot,
      csharp: { files: { 'Program.cs': compositionRoot }, stdin: '' },
      result: `Registered Asha
Rejected: empty name
Registered Ravi
Total students: 2`,
      explanation: `Each class receives the next layer through its constructor. "  Asha " is trimmed to "Asha" before saving. The empty string fails IsNullOrWhiteSpace and is rejected, so only 2 names are stored. Main is the Composition Root - replacing InMemoryStudentRepository with a SqlStudentRepository would be a one-line change there.`,
    },
    {
      title: 'ASP.NET Core: the container injects the repository and logger',
      scenario: 'The same idea in a real Web API. You register services in Program.cs and ASP.NET Core calls the controller constructor for every request.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API, name it StudentApi, tick "Use controllers", click Create',
        'Add folders Models, Repositories and add the classes shown',
        'Add StudentsController in the Controllers folder',
        'Add builder.Services.AddSingleton<IStudentRepository, InMemoryStudentRepository>(); in Program.cs',
        'Press F5, open Swagger, run GET /api/students, then POST /api/students with body { "name": "Ravi" }',
      ],
      code: aspnetDi,
      result: `GET /api/students -> 200 OK
[ { "id": 1, "name": "Asha" } ]

POST /api/students  body: { "name": "Ravi" } -> 201 Created
{ "id": 2, "name": "Ravi" }

Console log: info: StudentApi.Controllers.StudentsController[0] Fetching all students`,
      explanation: `The controller declares IStudentRepository and ILogger<StudentsController> in its constructor. ILogger is registered by the framework; IStudentRepository is registered by us. Singleton is used here only because the data lives in memory - with EF Core you would use AddScoped so each request gets its own DbContext. If you forget the registration, the request fails with "Unable to resolve service for type IStudentRepository".`,
    },
  ],
  interview: [
    { q: 'What is Dependency Injection?', a: 'A technique where an object receives the objects it depends on from outside instead of creating them itself. It reduces coupling and makes code testable.', level: 'Easy' },
    { q: 'What is constructor injection?', a: 'Supplying a class\'s required dependencies as constructor parameters, usually typed as interfaces, and storing them in private readonly fields.', level: 'Easy' },
    { q: 'Why is constructor injection preferred over property injection?', a: 'The object cannot be created without its dependencies, so it is always valid; dependencies are visible in one place; fields can be readonly. Property injection is only for optional dependencies.', level: 'Medium' },
    { q: 'What is Inversion of Control?', a: 'A principle where the control of creating and wiring objects is moved from the class itself to an external party (a framework or container). DI is one way to achieve IoC.', level: 'Medium' },
    { q: 'What is a Composition Root?', a: 'The single place near the application entry point (Main or Program.cs) where the object graph is composed and concrete classes are chosen.', level: 'Medium' },
    { q: 'Explain AddTransient, AddScoped and AddSingleton.', a: 'Transient: a new instance every time it is requested. Scoped: one instance per scope (per HTTP request in ASP.NET Core). Singleton: one instance for the lifetime of the application.', level: 'Medium' },
    { q: 'What is a captive dependency?', a: 'A longer-lived service holding a shorter-lived one, e.g. a Singleton with a Scoped DbContext injected. The scoped object is captured forever, causing bugs and threading issues. ASP.NET Core validates scopes in Development and throws.', level: 'Hard' },
    { q: 'Why is the Service Locator pattern considered an anti-pattern compared to constructor injection?', a: 'It hides dependencies inside method bodies (provider.GetService<T>()), so you cannot see what a class needs, and missing registrations fail only at run time deep in the code.', level: 'Hard' },
    { q: 'What happens if a controller asks for an interface that is not registered?', a: 'The request fails with InvalidOperationException: Unable to resolve service for type ... while attempting to activate the controller.', level: 'Medium' },
    { q: 'How does constructor injection help unit testing?', a: 'The test can pass fake or mock implementations (for example with Moq) so the class is tested in isolation without databases, network or email.', level: 'Easy' },
    { q: 'Output? class S { readonly INotifier n; public S(INotifier n) { this.n = n ?? throw new ArgumentNullException(nameof(n)); } } try { new S(null!); } catch (ArgumentNullException e) { Console.Write(e.ParamName); }', a: 'It prints "n". nameof(n) is the string "n" and becomes ParamName.', level: 'Medium' },
    { q: 'A class has 9 constructor parameters. What does that tell you?', a: 'It is a code smell called constructor over-injection - the class probably violates the Single Responsibility Principle. Split it into smaller classes or introduce a facade service.', level: 'Hard' },
    { q: 'What is a C# 12 primary constructor and how does it relate to DI?', a: 'A constructor declared on the class header: class OrderService(INotifier notifier). The parameter is available in the whole class body, giving shorter DI code. The captured parameter is not readonly, so some teams assign it to a readonly field.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create IPaymentGateway with Pay(int amount) returning a string, and UpiGateway / CardGateway implementations. Write a CheckoutService that receives IPaymentGateway in its constructor and prints the result of Pay.',
      hint: 'Store the gateway in a private readonly field.',
      solution: `interface IPaymentGateway { string Pay(int amount); }
class UpiGateway : IPaymentGateway { public string Pay(int a) => $"Paid {a} via UPI"; }
class CardGateway : IPaymentGateway { public string Pay(int a) => $"Paid {a} via Card"; }

class CheckoutService
{
    private readonly IPaymentGateway _gateway;
    public CheckoutService(IPaymentGateway gateway) { _gateway = gateway; }
    public void Checkout(int amount) => Console.WriteLine(_gateway.Pay(amount));
}

new CheckoutService(new UpiGateway()).Checkout(499);    // Paid 499 via UPI
new CheckoutService(new CardGateway()).Checkout(1299);  // Paid 1299 via Card`,
    },
    {
      task: 'Refactor: class ReportGenerator { public string Create() { var repo = new SqlSalesRepository(); return "Total: " + repo.TotalSales(); } } so that the repository is constructor-injected through ISalesRepository. Write a FakeSalesRepository returning 1000 and print the report.',
      hint: 'Extract an interface with TotalSales().',
      solution: `interface ISalesRepository { int TotalSales(); }
class FakeSalesRepository : ISalesRepository { public int TotalSales() => 1000; }

class ReportGenerator
{
    private readonly ISalesRepository _repo;
    public ReportGenerator(ISalesRepository repo) { _repo = repo; }
    public string Create() => "Total: " + _repo.TotalSales();
}

Console.WriteLine(new ReportGenerator(new FakeSalesRepository()).Create());   // Total: 1000`,
    },
    {
      task: 'Add a null guard to a constructor-injected dependency and prove it throws ArgumentNullException with the correct parameter name.',
      hint: 'Use ?? throw new ArgumentNullException(nameof(param)).',
      solution: `class Mailer
{
    private readonly INotifier _n;
    public Mailer(INotifier notifier) { _n = notifier ?? throw new ArgumentNullException(nameof(notifier)); }
}

try { new Mailer(null!); }
catch (ArgumentNullException ex) { Console.WriteLine(ex.ParamName); }   // notifier`,
    },
    {
      task: 'In an ASP.NET Core Web API, register IEmployeeService/EmployeeService as Scoped and inject it into EmployeesController. Return the list from GET /api/employees.',
      hint: 'builder.Services.AddScoped<IEmployeeService, EmployeeService>();',
      solution: `public interface IEmployeeService { IEnumerable<string> GetAll(); }
public class EmployeeService : IEmployeeService { public IEnumerable<string> GetAll() => new[] { "Arjun", "Neha" }; }

[ApiController, Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _svc;
    public EmployeesController(IEmployeeService svc) { _svc = svc; }
    [HttpGet] public IActionResult Get() => Ok(_svc.GetAll());
}

// Program.cs
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
// GET /api/employees -> ["Arjun","Neha"]`,
    },
  ],
  quiz: [
    {
      question: 'In constructor injection, dependencies are usually stored in:',
      options: ['public static fields', 'local variables', 'private readonly fields', 'global variables'],
      answer: 2,
      explanation: 'private readonly fields keep the dependency hidden and unchangeable after construction.',
    },
    {
      question: 'Which ASP.NET Core lifetime creates one instance per HTTP request?',
      options: ['Scoped', 'Transient', 'Singleton', 'Static'],
      answer: 0,
      explanation: 'Scoped services live for one request scope. DbContext is registered as Scoped by AddDbContext.',
    },
    {
      question: 'Where should concrete classes be chosen and wired together?',
      options: ['Inside every service method', 'In the Composition Root (Main / Program.cs)', 'Inside the interfaces', 'In the database'],
      answer: 1,
      explanation: 'Only the Composition Root knows concrete types; everything else depends on abstractions.',
    },
    {
      question: 'Which is the main benefit of injecting an interface instead of creating a concrete class with new?',
      options: ['Code runs faster', 'Less memory is used', 'No constructor is needed', 'Implementations can be swapped and faked for tests'],
      answer: 3,
      explanation: 'Loose coupling: callers or tests decide which implementation is used.',
    },
    {
      question: 'Which kind of injection is best for a dependency that changes on every call, like a CancellationToken?',
      options: ['Constructor injection', 'Property injection', 'Method injection', 'Static injection'],
      answer: 2,
      explanation: 'Per-call values are passed as method parameters (method injection).',
    },
  ],
};
