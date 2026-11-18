const miniRunnerCode = `using System;
using System.Collections.Generic;

var calc = new Calculator();
int passed = 0, failed = 0;

// ---- the tests (Arrange - Act - Assert) ----
Test("Add_TwoPositiveNumbers_ReturnsSum", () => AssertEqual(5, calc.Add(2, 3)));
Test("Add_NegativeAndPositive_ReturnsSum", () => AssertEqual(-1, calc.Add(-4, 3)));
Test("Divide_ByZero_ThrowsDivideByZeroException",
     () => AssertThrows<DivideByZeroException>(() => calc.Divide(10, 0)));
Test("GradeFor_90_ReturnsA", () => AssertEqual("A", calc.GradeFor(90)));
Test("GradeFor_74_ReturnsC", () => AssertEqual("C", calc.GradeFor(74)));
Test("GradeFor_101_ThrowsArgumentOutOfRange",
     () => AssertThrows<ArgumentOutOfRangeException>(() => calc.GradeFor(101)));
Test("Percentage_45Of60_Returns75", () => AssertEqual(75, calc.Percentage(45, 60)));

Console.WriteLine();
Console.WriteLine($"Passed: {passed}, Failed: {failed}, Total: {passed + failed}");

// ---- a tiny "test framework" (xUnit/NUnit do this for us) ----
void Test(string name, Action body)
{
    try
    {
        body();
        passed++;
        Console.WriteLine($"PASS  {name}");
    }
    catch (Exception ex)
    {
        failed++;
        Console.WriteLine($"FAIL  {name} -> {ex.Message}");
    }
}

void AssertEqual<T>(T expected, T actual)
{
    if (!EqualityComparer<T>.Default.Equals(expected, actual))
        throw new Exception($"Expected {expected} but was {actual}");
}

void AssertThrows<TEx>(Action action) where TEx : Exception
{
    try { action(); }
    catch (TEx) { return; }
    throw new Exception($"Expected {typeof(TEx).Name} but nothing was thrown");
}

// ---- the code under test ----
class Calculator
{
    public int Add(int a, int b) => a + b;

    public int Divide(int a, int b)
    {
        if (b == 0) throw new DivideByZeroException("Cannot divide by zero");
        return a / b;
    }

    public string GradeFor(int marks)
    {
        if (marks < 0 || marks > 100) throw new ArgumentOutOfRangeException(nameof(marks));
        if (marks >= 90) return "A";
        if (marks >= 75) return "B";
        if (marks >= 50) return "C";
        return "F";
    }

    // BUG: integer division 45 / 60 = 0
    public int Percentage(int obtained, int total) => obtained / total * 100;
}
`;

const fakesCode = `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

// ---- Arrange: hand-written test doubles ----
var repo = new FakeStudentRepository();
repo.Seed(new Student("Asha", "asha@demo.com", 80));
var email = new SpyEmailService();
var service = new StudentService(repo, email);

// ---- Act ----
Console.WriteLine(service.Register("Ravi", "ravi@demo.com", 70));
Console.WriteLine(service.Register("Ravi Again", "asha@demo.com", 50));
Console.WriteLine(service.Register("", "x@demo.com", 10));

// ---- Assert / inspect what the spy recorded ----
Console.WriteLine($"Emails sent: {email.Sent.Count}");
foreach (var m in email.Sent) Console.WriteLine($"  {m}");
Console.WriteLine($"Students in repo: {repo.GetAll().Count}");
Console.WriteLine($"Average marks: {service.AverageMarks().ToString("0.00", CultureInfo.InvariantCulture)}");
Console.WriteLine(email.Sent.Count == 1 ? "PASS  welcome mail sent exactly once" : "FAIL  mail count");

// ===== production code =====
public record Student(string Name, string Email, int Marks);

public interface IStudentRepository
{
    bool ExistsByEmail(string email);
    int Add(Student s);
    List<Student> GetAll();
}

public interface IEmailService
{
    void Send(string to, string subject, string body);
}

public class StudentService
{
    private readonly IStudentRepository _repo;
    private readonly IEmailService _email;

    public StudentService(IStudentRepository repo, IEmailService email)
    {
        _repo = repo;
        _email = email;
    }

    public string Register(string name, string email, int marks)
    {
        if (string.IsNullOrWhiteSpace(name)) return "Error: name required";
        if (_repo.ExistsByEmail(email)) return "Error: email already registered";
        int id = _repo.Add(new Student(name, email, marks));
        _email.Send(email, "Welcome", $"Hi {name}, your id is {id}");
        return $"Registered {name} with id {id}";
    }

    public double AverageMarks()
    {
        var all = _repo.GetAll();
        return all.Count == 0 ? 0 : all.Average(s => s.Marks);
    }
}

// ===== test doubles =====
public class FakeStudentRepository : IStudentRepository     // FAKE: works, but in memory
{
    private readonly List<Student> _data = new();
    public void Seed(Student s) => _data.Add(s);
    public bool ExistsByEmail(string email) => _data.Any(s => s.Email == email);
    public int Add(Student s) { _data.Add(s); return _data.Count; }
    public List<Student> GetAll() => _data;
}

public class SpyEmailService : IEmailService                 // SPY: records calls
{
    public List<string> Sent { get; } = new();
    public void Send(string to, string subject, string body) => Sent.Add($"To {to}: {subject} - {body}");
}
`;

const xunitCode = `// ===== Create the projects (Developer PowerShell or terminal) =====
// dotnet new sln -n SchoolApp
// dotnet new classlib -n School.Core
// dotnet new xunit -n School.Core.Tests
// dotnet sln add School.Core School.Core.Tests
// dotnet add School.Core.Tests reference School.Core
// (Visual Studio: right-click solution > Add > New Project > "xUnit Test Project")

// ===== School.Core/Calculator.cs =====
namespace School.Core;

public class Calculator
{
    public int Add(int a, int b) => a + b;

    public int Divide(int a, int b)
    {
        if (b == 0) throw new DivideByZeroException("Cannot divide by zero");
        return a / b;
    }

    public string GradeFor(int marks)
    {
        if (marks < 0 || marks > 100) throw new ArgumentOutOfRangeException(nameof(marks));
        return marks >= 90 ? "A" : marks >= 75 ? "B" : marks >= 50 ? "C" : "F";
    }

    public int Percentage(int obtained, int total) => obtained * 100 / total;   // bug fixed
}

// ===== School.Core.Tests/CalculatorTests.cs =====
using School.Core;
using Xunit;

public class CalculatorTests
{
    private readonly Calculator _calc;

    // xUnit creates a NEW instance of the class for every test -> constructor = setup
    public CalculatorTests() => _calc = new Calculator();

    [Fact]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        // Arrange
        int a = 2, b = 3;
        // Act
        int result = _calc.Add(a, b);
        // Assert
        Assert.Equal(5, result);
    }

    [Theory]
    [InlineData(95, "A")]
    [InlineData(90, "A")]
    [InlineData(75, "B")]
    [InlineData(74, "C")]
    [InlineData(49, "F")]
    public void GradeFor_ReturnsExpectedGrade(int marks, string expected)
    {
        Assert.Equal(expected, _calc.GradeFor(marks));
    }

    [Theory]
    [MemberData(nameof(PercentageData))]
    public void Percentage_ReturnsWholeNumber(int obtained, int total, int expected) =>
        Assert.Equal(expected, _calc.Percentage(obtained, total));

    public static IEnumerable<object[]> PercentageData => new List<object[]>
    {
        new object[] { 45, 60, 75 },
        new object[] { 50, 50, 100 },
        new object[] { 0, 80, 0 }
    };

    [Fact]
    public void Divide_ByZero_Throws()
    {
        var ex = Assert.Throws<DivideByZeroException>(() => _calc.Divide(10, 0));
        Assert.Equal("Cannot divide by zero", ex.Message);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void GradeFor_OutOfRange_Throws(int marks) =>
        Assert.Throws<ArgumentOutOfRangeException>(() => _calc.GradeFor(marks));

    [Fact(Skip = "Demo of a skipped test")]
    public void NotReadyYet() { }
}

// Other useful asserts:
// Assert.True(x); Assert.False(x); Assert.Null(x); Assert.NotNull(x);
// Assert.Contains("Asha", names); Assert.Empty(list); Assert.Single(list);
// Assert.InRange(value, 1, 10); Assert.IsType<OkObjectResult>(result);
// await Assert.ThrowsAsync<InvalidOperationException>(() => service.SaveAsync(dto));`;

const nunitCode = `// ===== Create an NUnit project =====
// dotnet new nunit -n School.Core.NUnitTests
// dotnet add School.Core.NUnitTests reference School.Core
// (Visual Studio: Add > New Project > "NUnit Test Project")

// ===== School.Core.NUnitTests/CalculatorTests.cs =====
using NUnit.Framework;
using School.Core;

[TestFixture]
public class CalculatorTests
{
    private Calculator _calc = null!;

    [OneTimeSetUp]  public void BeforeAll() => TestContext.Progress.WriteLine("Starting calculator tests");
    [SetUp]         public void BeforeEach() => _calc = new Calculator();   // runs before EVERY test
    [TearDown]      public void AfterEach() { /* clean up files, connections ... */ }

    [Test]
    public void Add_TwoPositiveNumbers_ReturnsSum()
    {
        int result = _calc.Add(2, 3);
        Assert.That(result, Is.EqualTo(5));         // constraint model
    }

    [TestCase(95, "A")]
    [TestCase(75, "B")]
    [TestCase(74, "C")]
    [TestCase(10, "F")]
    public void GradeFor_ReturnsExpectedGrade(int marks, string expected) =>
        Assert.That(_calc.GradeFor(marks), Is.EqualTo(expected));

    [TestCase(45, 60, ExpectedResult = 75)]
    [TestCase(50, 50, ExpectedResult = 100)]
    public int Percentage_Works(int obtained, int total) => _calc.Percentage(obtained, total);

    [Test]
    public void Divide_ByZero_Throws()
    {
        var ex = Assert.Throws<DivideByZeroException>(() => _calc.Divide(10, 0));
        Assert.That(ex!.Message, Does.Contain("zero"));
    }

    [Test, Ignore("Demo of an ignored test")]
    public void NotReadyYet() { }
}

// xUnit vs NUnit cheat sheet
// [Fact]                   <-> [Test]
// [Theory] + [InlineData]  <-> [TestCase]
// constructor / IDisposable <-> [SetUp] / [TearDown]
// IClassFixture<T>         <-> [OneTimeSetUp] / [OneTimeTearDown]
// Assert.Equal(e, a)       <-> Assert.That(a, Is.EqualTo(e))
// Skip = "..."             <-> [Ignore("...")]`;

const moqCode = `// ===== Install Moq in the test project =====
// dotnet add School.Core.Tests package Moq
// (or Package Manager Console: Install-Package Moq -ProjectName School.Core.Tests)

// ===== School.Core/StudentService.cs (async version used by the API) =====
namespace School.Core;

public record Student(int Id, string Name, string Email, int Marks);

public interface IStudentRepository
{
    Task<bool> ExistsByEmailAsync(string email);
    Task<int> AddAsync(Student s);
    Task<Student?> GetByIdAsync(int id);
    Task<List<Student>> GetAllAsync();
}

public interface IEmailService
{
    Task SendAsync(string to, string subject, string body);
}

public class StudentService
{
    private readonly IStudentRepository _repo;
    private readonly IEmailService _email;
    public StudentService(IStudentRepository repo, IEmailService email) { _repo = repo; _email = email; }

    public async Task<string> RegisterAsync(string name, string email, int marks)
    {
        if (string.IsNullOrWhiteSpace(name)) return "Error: name required";
        if (await _repo.ExistsByEmailAsync(email)) return "Error: email already registered";
        int id = await _repo.AddAsync(new Student(0, name, email, marks));
        await _email.SendAsync(email, "Welcome", $"Hi {name}, your id is {id}");
        return $"Registered {name} with id {id}";
    }

    public async Task<double> AverageMarksAsync()
    {
        var all = await _repo.GetAllAsync();
        return all.Count == 0 ? 0 : all.Average(s => s.Marks);
    }

    public async Task<string> GetNameAsync(int id) =>
        (await _repo.GetByIdAsync(id))?.Name ?? throw new KeyNotFoundException($"Student {id} not found");
}

// ===== School.Core.Tests/StudentServiceTests.cs =====
using Moq;
using School.Core;
using Xunit;

public class StudentServiceTests
{
    private readonly Mock<IStudentRepository> _repo = new();
    private readonly Mock<IEmailService> _email = new();
    private readonly StudentService _sut;                       // sut = system under test

    public StudentServiceTests() => _sut = new StudentService(_repo.Object, _email.Object);

    [Fact]
    public async Task Register_NewStudent_SavesAndSendsWelcomeMail()
    {
        // Arrange
        _repo.Setup(r => r.ExistsByEmailAsync("ravi@demo.com")).ReturnsAsync(false);
        _repo.Setup(r => r.AddAsync(It.IsAny<Student>())).ReturnsAsync(7);

        // Act
        string result = await _sut.RegisterAsync("Ravi", "ravi@demo.com", 70);

        // Assert
        Assert.Equal("Registered Ravi with id 7", result);
        _repo.Verify(r => r.AddAsync(It.Is<Student>(s => s.Name == "Ravi" && s.Marks == 70)), Times.Once);
        _email.Verify(e => e.SendAsync("ravi@demo.com", "Welcome", It.Is<string>(b => b.Contains("id is 7"))),
                      Times.Once);
    }

    [Fact]
    public async Task Register_DuplicateEmail_DoesNotSaveOrSendMail()
    {
        _repo.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>())).ReturnsAsync(true);

        string result = await _sut.RegisterAsync("Ravi", "asha@demo.com", 50);

        Assert.Equal("Error: email already registered", result);
        _repo.Verify(r => r.AddAsync(It.IsAny<Student>()), Times.Never);
        _email.Verify(e => e.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task AverageMarks_ReturnsAverage()
    {
        _repo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Student>
        {
            new(1, "Asha", "a@d.com", 80),
            new(2, "Ravi", "r@d.com", 70)
        });

        double avg = await _sut.AverageMarksAsync();

        Assert.Equal(75, avg);
    }

    [Fact]
    public async Task GetName_UnknownId_ThrowsKeyNotFound()
    {
        _repo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Student?)null);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.GetNameAsync(99));
    }

    [Fact]
    public async Task Register_EmailServiceDown_PropagatesException()
    {
        _repo.Setup(r => r.ExistsByEmailAsync(It.IsAny<string>())).ReturnsAsync(false);
        _repo.Setup(r => r.AddAsync(It.IsAny<Student>())).ReturnsAsync(1);
        _email.Setup(e => e.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
              .ThrowsAsync(new InvalidOperationException("SMTP down"));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _sut.RegisterAsync("Sita", "sita@demo.com", 90));
        Assert.Equal("SMTP down", ex.Message);
    }

    [Fact]
    public async Task Register_CapturesSavedStudent_WithCallback()
    {
        Student? saved = null;
        _repo.Setup(r => r.AddAsync(It.IsAny<Student>()))
             .Callback<Student>(s => saved = s)
             .ReturnsAsync(3);

        await _sut.RegisterAsync("Kiran", "kiran@demo.com", 66);

        Assert.NotNull(saved);
        Assert.Equal("kiran@demo.com", saved!.Email);
    }
}

// ===== Testing a controller with a mocked service =====
// var service = new Mock<IStudentService>();
// service.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(new StudentDto(1, "Asha"));
// var controller = new StudentsController(service.Object);
// var result = await controller.Get(1);
// var ok = Assert.IsType<OkObjectResult>(result.Result);
// Assert.Equal("Asha", ((StudentDto)ok.Value!).Name);`;

export default {
  id: 'day-114-unit-testing-xunit-nunit-moq',
  title: 'Unit Testing with xUnit, NUnit Basics and Moq',
  module: 'Module 10: Authentication, Security, Testing & Integration',
  day: 114,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Learn why automated tests matter, what makes a good unit test (Arrange-Act-Assert, one behaviour, fast, isolated, repeatable), and write tests with xUnit ([Fact], [Theory], [InlineData], [MemberData]) and NUnit ([Test], [TestCase], [SetUp]). Replace real dependencies with test doubles – fakes, stubs, spies – and with Moq (Setup, Returns, ReturnsAsync, Verify, Times, It.IsAny, Callback). Run tests with Test Explorer and dotnet test.',
  objectives: [
    'Explain unit vs integration vs end-to-end tests and the testing pyramid',
    'Write xUnit tests with Fact, Theory, InlineData, MemberData and Assert.Throws',
    'Write the same tests in NUnit with TestFixture, SetUp, TestCase and Assert.That',
    'Isolate a class from its dependencies with fakes, stubs, spies and Moq mocks',
    'Run tests in Visual Studio Test Explorer and with dotnet test, and read code coverage',
  ],
  theory: [
    {
      heading: 'Why test, and what is a unit test?',
      content:
        'A unit test is a small piece of code that calls one unit (usually one method of one class) and checks the result automatically. Tests catch bugs early, protect you when you refactor ("did I break anything?"), document how code should behave and make code reviews and CI/CD safe. Analogy: a car factory tests each part (brakes, lights) on its own before testing the full car on the road – unit tests are the part tests, integration tests are the assembled car, end-to-end tests are the road test.',
      points: [
        'Testing pyramid: many fast unit tests, fewer integration tests, very few slow UI/E2E tests',
        'Good unit tests are FIRST: Fast, Isolated/Independent, Repeatable, Self-validating, Timely',
        'Test behaviour, not implementation details – tests should not break when you rename a private method',
        'Naming: MethodName_Scenario_ExpectedResult, e.g. Divide_ByZero_Throws',
      ],
    },
    {
      heading: 'Arrange – Act – Assert',
      content:
        'Every test has three parts. Arrange: create the object under test (often called sut) and its inputs or fakes. Act: call the method once. Assert: check the result, the state, or the calls made to dependencies. Keep one logical behaviour per test so a failing test name tells you exactly what is broken. Tests must not depend on each other or on order, the clock, random numbers, files or databases (unless they are integration tests).',
      syntax: `[Fact]
public void Add_TwoPositiveNumbers_ReturnsSum()
{
    var calc = new Calculator();      // Arrange
    int result = calc.Add(2, 3);      // Act
    Assert.Equal(5, result);          // Assert (expected first, actual second)
}`,
    },
    {
      heading: 'xUnit essentials',
      content:
        'xUnit is the most used test framework for modern .NET (the ASP.NET Core team uses it). Create a project with "dotnet new xunit" or the "xUnit Test Project" template, reference the project you want to test, and write public methods with [Fact] (no parameters) or [Theory] (data-driven, with [InlineData], [MemberData] or [ClassData]). xUnit creates a new instance of the test class for EVERY test, so the constructor is the per-test setup and IDisposable.Dispose is the teardown. Share expensive setup with IClassFixture<T>.',
      points: [
        'Assert.Equal, NotEqual, True, False, Null, NotNull, Contains, Empty, Single, InRange, IsType<T>',
        'Assert.Throws<T>(() => ...) and await Assert.ThrowsAsync<T>(() => ...)',
        'Async tests: public async Task MyTest() { ... await ... }',
        'Skip a test: [Fact(Skip = "reason")]',
      ],
      syntax: `[Theory]
[InlineData(90, "A")]
[InlineData(74, "C")]
public void GradeFor_ReturnsExpected(int marks, string expected) =>
    Assert.Equal(expected, new Calculator().GradeFor(marks));`,
    },
    {
      heading: 'NUnit basics and comparison',
      content:
        'NUnit is older and still common in enterprise projects. Classes are marked [TestFixture] (optional in NUnit 3+), tests [Test], data-driven tests [TestCase(...)]. Unlike xUnit, NUnit uses ONE instance of the class for all tests, so [SetUp] runs before each test to reset fields, [TearDown] after each, and [OneTimeSetUp]/[OneTimeTearDown] once per class. Assertions use the constraint model: Assert.That(actual, Is.EqualTo(expected)), Does.Contain, Is.Null, Has.Count.EqualTo(3). MSTest ([TestClass], [TestMethod]) is Microsoft\'s third option.',
      points: [
        '[Test] = [Fact]; [TestCase] = [Theory]+[InlineData]; [SetUp] ~ constructor',
        'TestCase can return a value: [TestCase(2, 3, ExpectedResult = 5)]',
        'All three frameworks run in Visual Studio Test Explorer and with dotnet test',
      ],
    },
    {
      heading: 'Test doubles: dummy, stub, fake, spy, mock',
      content:
        'Real classes depend on databases, e-mail, payment gateways and clocks. In a unit test we replace them with test doubles through the same interface (this is why Dependency Injection and interfaces from Day 72/91 matter). Dummy: passed but never used. Stub: returns canned answers ("ExistsByEmail returns false"). Fake: a working light-weight implementation (in-memory list instead of SQL). Spy: records how it was called. Mock: pre-programmed with expectations and verified afterwards. Libraries like Moq and NSubstitute generate stubs/mocks at runtime so you do not write the classes by hand.',
      tip: 'You cannot easily mock static methods, sealed classes or DateTime.Now. Wrap them behind an interface or use TimeProvider (.NET 8+) so tests can control time.',
    },
    {
      heading: 'Moq in practice',
      content:
        'Create a mock with new Mock<IStudentRepository>() and pass mock.Object to the class under test. Setup(...).Returns(value) / ReturnsAsync(value) defines behaviour; Throws/ThrowsAsync simulates failures; It.IsAny<T>(), It.Is<T>(predicate) match arguments; Callback captures arguments. After acting, Verify(x => x.Method(...), Times.Once / Never / Exactly(n)) checks interactions. Methods without a setup return default values (false, 0, null, empty Task). Use MockBehavior.Strict when every call must be set up.',
      syntax: `var repo = new Mock<IStudentRepository>();
repo.Setup(r => r.ExistsByEmailAsync("ravi@demo.com")).ReturnsAsync(false);
repo.Setup(r => r.AddAsync(It.IsAny<Student>())).ReturnsAsync(7);
var sut = new StudentService(repo.Object, Mock.Of<IEmailService>());
...
repo.Verify(r => r.AddAsync(It.Is<Student>(s => s.Name == "Ravi")), Times.Once);`,
    },
    {
      heading: 'Running tests and code coverage',
      content:
        'In Visual Studio open Test > Test Explorer (Ctrl+E, T), click Run All (Ctrl+R, A), right-click a test to Debug it (set breakpoints with F9). From the command line run "dotnet test" in the solution folder; filter with dotnet test --filter "FullyQualifiedName~Calculator". Code coverage: the xunit template includes coverlet.collector, so run dotnet test --collect:"XPlat Code Coverage" (VS Enterprise also has Analyze Code Coverage). Aim for meaningful coverage of business rules, not 100% for its own sake. Tests run automatically in CI pipelines (Day 118).',
    },
  ],
  examples: [
    {
      title: 'Build a tiny test runner to understand unit tests',
      scenario:
        'Before installing a framework, write a mini test runner in a console app: a Test method that runs a lambda and prints PASS/FAIL, plus AssertEqual and AssertThrows. Seven tests check a Calculator – and one of them finds a real bug.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it MiniTestRunner',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Read the FAIL line, then fix Percentage to "obtained * 100 / total" and run again – all 7 pass',
      ],
      code: miniRunnerCode,
      csharp: { files: { 'Program.cs': miniRunnerCode }, stdin: '' },
      result: `PASS  Add_TwoPositiveNumbers_ReturnsSum
PASS  Add_NegativeAndPositive_ReturnsSum
PASS  Divide_ByZero_ThrowsDivideByZeroException
PASS  GradeFor_90_ReturnsA
PASS  GradeFor_74_ReturnsC
PASS  GradeFor_101_ThrowsArgumentOutOfRange
FAIL  Percentage_45Of60_Returns75 -> Expected 75 but was 0

Passed: 6, Failed: 1, Total: 7`,
      explanation:
        'Each test follows Arrange-Act-Assert inside a lambda. A failed assertion throws, the runner catches it and prints FAIL with the message – exactly what xUnit and NUnit do. The bug: 45 / 60 is integer division = 0, and 0 * 100 = 0. Multiplying first (45 * 100 / 60 = 4500 / 60 = 75) fixes it. Without the test this bug could have reached production unnoticed.',
    },
    {
      title: 'Fakes and spies by hand (what Moq generates for you)',
      scenario:
        'StudentService depends on IStudentRepository and IEmailService. In a test we do not want a real database or real e-mails, so we pass a FakeStudentRepository (in-memory list) and a SpyEmailService (records every mail) and check the results.',
      steps: [
        'File > New > Project > Console App, name it TestDoublesDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Notice that StudentService never knows it is talking to fakes – it only sees the interfaces',
      ],
      code: fakesCode,
      csharp: { files: { 'Program.cs': fakesCode }, stdin: '' },
      result: `Registered Ravi with id 2
Error: email already registered
Error: name required
Emails sent: 1
  To ravi@demo.com: Welcome - Hi Ravi, your id is 2
Students in repo: 2
Average marks: 75.00
PASS  welcome mail sent exactly once`,
      explanation:
        'The fake repository already contains Asha, so Ravi gets id 2 (list count after adding). The duplicate e-mail and empty name return errors BEFORE saving or mailing, so the spy recorded only one mail. Average = (80 + 70) / 2 = 75, formatted with InvariantCulture. Moq creates the same kind of objects at runtime: Setup/Returns is the fake behaviour, Verify(..., Times.Once) is the spy check.',
    },
    {
      title: 'xUnit test project for the Calculator',
      scenario:
        'Create a real solution with a class library (School.Core) and an xUnit test project. Use [Fact], [Theory] with [InlineData] and [MemberData], Assert.Throws and a skipped test.',
      steps: [
        'File > New > Project > Class Library, name it School.Core, solution name SchoolApp',
        'Right-click the solution > Add > New Project > xUnit Test Project, name it School.Core.Tests',
        'Right-click School.Core.Tests > Add > Project Reference > tick School.Core',
        'Add Calculator.cs to School.Core and CalculatorTests.cs to the test project',
        'Open Test > Test Explorer (Ctrl+E, T) and click Run All (Ctrl+R, A)',
        'Or in the terminal: dotnet test',
      ],
      code: xunitCode,
      result: `dotnet test
  Determining projects to restore...
  School.Core -> ...\\School.Core\\bin\\Debug\\net8.0\\School.Core.dll
  School.Core.Tests -> ...\\School.Core.Tests\\bin\\Debug\\net8.0\\School.Core.Tests.dll
[xUnit.net 00:00:00.45]     CalculatorTests.NotReadyYet [SKIP]
  Skipped CalculatorTests.NotReadyYet [1 ms]

Passed!  - Failed: 0, Passed: 12, Skipped: 1, Total: 13, Duration: 25 ms - School.Core.Tests.dll (net8.0)`,
      explanation:
        'Count: 1 Add fact + 5 GradeFor InlineData cases + 3 MemberData cases + 1 Divide fact + 2 out-of-range cases = 12 passing tests, plus 1 skipped = 13. Each InlineData row is reported as a separate test in Test Explorer. Because xUnit creates a new CalculatorTests object per test, the constructor works as per-test setup. Timings and paths will differ on your machine.',
    },
    {
      title: 'The same tests in NUnit',
      scenario:
        'Many companies use NUnit. Write equivalent tests with [TestFixture], [SetUp], [TestCase] (including ExpectedResult) and the Assert.That constraint syntax, then compare with xUnit.',
      steps: [
        'Right-click the solution > Add > New Project > NUnit Test Project, name it School.Core.NUnitTests',
        'Add a project reference to School.Core',
        'Replace UnitTest1.cs with CalculatorTests.cs below',
        'Run All in Test Explorer (Ctrl+R, A) – NUnit and xUnit tests appear side by side',
      ],
      code: nunitCode,
      result: `Test Explorer – School.Core.NUnitTests
  CalculatorTests
    Add_TwoPositiveNumbers_ReturnsSum                    Passed
    Divide_ByZero_Throws                                 Passed
    GradeFor_ReturnsExpectedGrade(95,"A")                Passed
    GradeFor_ReturnsExpectedGrade(75,"B")                Passed
    GradeFor_ReturnsExpectedGrade(74,"C")                Passed
    GradeFor_ReturnsExpectedGrade(10,"F")                Passed
    NotReadyYet                                          Skipped (Demo of an ignored test)
    Percentage_Works(45,60)                              Passed
    Percentage_Works(50,50)                              Passed
Passed: 8, Skipped: 1`,
      explanation:
        'NUnit reuses one CalculatorTests instance, so [SetUp] creates a fresh Calculator before every test to keep tests independent. [TestCase(..., ExpectedResult = 75)] lets the test method simply return the value. Assert.That(actual, Is.EqualTo(expected)) reads like English and gives clear failure messages.',
    },
    {
      title: 'Mocking dependencies with Moq',
      scenario:
        'Test the async StudentService used by the Web API without a database or SMTP server. Moq stubs repository answers, simulates an e-mail failure, captures the saved student with Callback and verifies how many times methods were called.',
      steps: [
        'In School.Core add StudentService.cs (interfaces + service)',
        'Package Manager Console: Install-Package Moq -ProjectName School.Core.Tests (or dotnet add package Moq)',
        'Add StudentServiceTests.cs to the test project',
        'Run All in Test Explorer; then break the service (remove the e-mail call) and watch Register_NewStudent fail at Verify',
      ],
      code: moqCode,
      result: `Passed  StudentServiceTests.Register_NewStudent_SavesAndSendsWelcomeMail
Passed  StudentServiceTests.Register_DuplicateEmail_DoesNotSaveOrSendMail
Passed  StudentServiceTests.AverageMarks_ReturnsAverage
Passed  StudentServiceTests.GetName_UnknownId_ThrowsKeyNotFound
Passed  StudentServiceTests.Register_EmailServiceDown_PropagatesException
Passed  StudentServiceTests.Register_CapturesSavedStudent_WithCallback
Total tests: 6. Passed: 6. Failed: 0.

(after deleting the SendAsync call)
Failed  Register_NewStudent_SavesAndSendsWelcomeMail
  Moq.MockException: Expected invocation on the mock once, but was 0 times:
  e => e.SendAsync("ravi@demo.com", "Welcome", It.Is<string>(b => b.Contains("id is 7")))`,
      explanation:
        'mock.Object is the generated implementation passed into the constructor. ReturnsAsync makes async methods return completed tasks. Times.Never proves the duplicate path did not save or mail. ThrowsAsync simulates a broken SMTP server, and Callback captures the Student argument for detailed assertions. The service needs no change to be testable because it depends on interfaces injected through the constructor.',
    },
  ],
  interview: [
    { q: 'What is a unit test?', a: 'An automated test that checks one small unit of code (usually a method) in isolation from external systems such as databases, files and network, running in milliseconds.', level: 'Easy' },
    { q: 'Explain the AAA pattern.', a: 'Arrange: set up objects and inputs; Act: call the method under test; Assert: verify the outcome. It keeps tests readable and focused on one behaviour.', level: 'Easy' },
    { q: 'Difference between [Fact] and [Theory] in xUnit?', a: '[Fact] is a test with no parameters that always runs the same way. [Theory] is parameterized and runs once for each data row supplied by [InlineData], [MemberData] or [ClassData].', level: 'Easy' },
    { q: 'How does setup differ between xUnit and NUnit?', a: 'xUnit creates a new test-class instance per test, so the constructor is setup and Dispose is teardown; IClassFixture shares context. NUnit uses one instance per fixture with [SetUp]/[TearDown] per test and [OneTimeSetUp]/[OneTimeTearDown] per class.', level: 'Medium' },
    { q: 'What is the difference between a stub and a mock?', a: 'A stub supplies canned answers so the code can run (state verification). A mock also has expectations about how it is called and is verified afterwards (behaviour verification), e.g. Verify(..., Times.Once).', level: 'Medium' },
    { q: 'What is a fake?', a: 'A working but simplified implementation, e.g. an in-memory repository or EF Core InMemory/SQLite database, used instead of the real dependency.', level: 'Easy' },
    { q: 'What does a Moq method return when no Setup was made?', a: 'With the default Loose behaviour it returns default values: 0, false, null, empty enumerables, or a completed Task. With MockBehavior.Strict it throws.', level: 'Medium' },
    { q: 'How do you test that a method throws an exception in xUnit?', a: 'Assert.Throws<TException>(() => sut.Method()) for sync code or await Assert.ThrowsAsync<TException>(() => sut.MethodAsync()) for async code; both return the exception for further checks.', level: 'Easy' },
    { q: 'Why is code that uses DateTime.Now hard to test and how do you fix it?', a: 'The value changes every run so results are not repeatable. Inject TimeProvider (.NET 8+) or an IClock interface and use a fake time in tests (FakeTimeProvider).', level: 'Hard' },
    { q: 'Can Moq mock a non-virtual method of a concrete class?', a: 'No. Moq creates dynamic proxies, so it can only override interface members and virtual/abstract members. Depend on interfaces to keep code testable.', level: 'Hard' },
    { q: 'Output question: in the mini runner, Percentage(45, 60) with obtained / total * 100 returns?', a: '0, because 45 / 60 is integer division (0) and 0 * 100 = 0. obtained * 100 / total returns 75.', level: 'Medium' },
    { q: 'Is 100% code coverage the goal?', a: 'No. Coverage shows what code ran, not that behaviour was asserted correctly. Focus on business rules, edge cases and bugs found; very high coverage of trivial code adds maintenance cost.', level: 'Medium' },
    { q: 'What is TDD?', a: 'Test-Driven Development: Red (write a failing test), Green (write the simplest code to pass), Refactor (clean up while tests stay green).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write xUnit [Theory] tests for an IsPrime(int n) method with InlineData for 1, 2, 3, 4, 17, 21 and 97.',
      hint: 'Use two theories (primes -> True, non-primes -> False) or one theory with an expected bool parameter.',
      solution: `public static class MathUtil
{
    public static bool IsPrime(int n)
    {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;
        return true;
    }
}

public class MathUtilTests
{
    [Theory]
    [InlineData(1, false)]
    [InlineData(2, true)]
    [InlineData(3, true)]
    [InlineData(4, false)]
    [InlineData(17, true)]
    [InlineData(21, false)]
    [InlineData(97, true)]
    public void IsPrime_ReturnsExpected(int n, bool expected) =>
        Assert.Equal(expected, MathUtil.IsPrime(n));
}`,
    },
    {
      task: 'Write a BankAccount class (Deposit, Withdraw, Balance) and NUnit tests: deposit increases balance, withdrawing more than the balance throws InvalidOperationException, negative deposit throws ArgumentException.',
      hint: 'Use [SetUp] to create an account with an opening balance of 1000.',
      solution: `public class BankAccount
{
    public decimal Balance { get; private set; }
    public BankAccount(decimal opening) => Balance = opening;
    public void Deposit(decimal amt) { if (amt <= 0) throw new ArgumentException("Amount must be positive"); Balance += amt; }
    public void Withdraw(decimal amt) { if (amt > Balance) throw new InvalidOperationException("Insufficient funds"); Balance -= amt; }
}

[TestFixture]
public class BankAccountTests
{
    private BankAccount _acc = null!;
    [SetUp] public void Init() => _acc = new BankAccount(1000);

    [Test] public void Deposit_Increases() { _acc.Deposit(500); Assert.That(_acc.Balance, Is.EqualTo(1500)); }
    [Test] public void Withdraw_TooMuch_Throws() => Assert.Throws<InvalidOperationException>(() => _acc.Withdraw(2000));
    [Test] public void Deposit_Negative_Throws() => Assert.Throws<ArgumentException>(() => _acc.Deposit(-5));
}`,
    },
    {
      task: 'Using Moq, test an OrderService.PlaceOrder(productId, qty) that calls IInventory.GetStock(productId) and IPayment.Charge(amount). Verify that Charge is NOT called when stock is insufficient.',
      hint: 'inventory.Setup(i => i.GetStock(1)).Returns(2); then PlaceOrder(1, 5) and payment.Verify(p => p.Charge(It.IsAny<decimal>()), Times.Never).',
      solution: `[Fact]
public void PlaceOrder_NotEnoughStock_DoesNotCharge()
{
    var inventory = new Mock<IInventory>();
    var payment = new Mock<IPayment>();
    inventory.Setup(i => i.GetStock(1)).Returns(2);
    var sut = new OrderService(inventory.Object, payment.Object);

    bool ok = sut.PlaceOrder(1, 5);

    Assert.False(ok);
    payment.Verify(p => p.Charge(It.IsAny<decimal>()), Times.Never);
}`,
    },
    {
      task: 'Make a time-dependent method testable: Greeting() returns "Good morning" before 12:00, otherwise "Good afternoon". Inject TimeProvider and test both cases.',
      hint: 'Install Microsoft.Extensions.TimeProvider.Testing and use FakeTimeProvider.SetUtcNow(...).',
      solution: `public class Greeter
{
    private readonly TimeProvider _time;
    public Greeter(TimeProvider time) => _time = time;
    public string Greeting() => _time.GetUtcNow().Hour < 12 ? "Good morning" : "Good afternoon";
}

[Fact]
public void Greeting_Morning()
{
    var fake = new FakeTimeProvider();
    fake.SetUtcNow(new DateTimeOffset(2026, 1, 1, 9, 0, 0, TimeSpan.Zero));
    Assert.Equal("Good morning", new Greeter(fake).Greeting());
}`,
    },
    {
      task: 'Write a test for a StudentsController.Get(int id) action that returns NotFound when the mocked service returns null.',
      hint: 'Assert.IsType<NotFoundResult>(result.Result) for ActionResult<T>.',
      solution: `[Fact]
public async Task Get_UnknownId_ReturnsNotFound()
{
    var service = new Mock<IStudentService>();
    service.Setup(s => s.GetByIdAsync(42)).ReturnsAsync((StudentDto?)null);
    var controller = new StudentsController(service.Object);

    ActionResult<StudentDto> result = await controller.Get(42);

    Assert.IsType<NotFoundResult>(result.Result);
}`,
    },
  ],
  quiz: [
    {
      question: 'Which xUnit attribute runs one test method several times with different data?',
      options: ['[Fact]', '[Theory] with [InlineData]', '[Test]', '[SetUp]'],
      answer: 1,
      explanation: '[Theory] is parameterized; each [InlineData] row becomes a separate test case.',
    },
    {
      question: 'In NUnit, which attribute runs before EACH test?',
      options: ['[OneTimeSetUp]', '[TestFixture]', '[TestCase]', '[SetUp]'],
      answer: 3,
      explanation: '[SetUp] runs before every test; [OneTimeSetUp] runs once per fixture.',
    },
    {
      question: 'What does mock.Verify(x => x.Send(It.IsAny<string>()), Times.Never) check?',
      options: ['That Send was never called with any string', 'That Send returns null', 'That Send throws', 'That the mock has no setups'],
      answer: 0,
      explanation: 'Verify with Times.Never fails the test if Send was called at all.',
    },
    {
      question: 'Which is NOT a property of a good unit test?',
      options: ['Fast', 'Repeatable', 'Depends on the order of other tests', 'Self-validating'],
      answer: 2,
      explanation: 'Tests must be independent; order-dependence makes failures confusing and flaky.',
    },
    {
      question: 'Which keyboard shortcut runs all tests in Visual Studio Test Explorer?',
      options: ['Ctrl+F5', 'F9', 'Ctrl+K, Ctrl+D', 'Ctrl+R, A'],
      answer: 3,
      explanation: 'Ctrl+R, A runs all tests; Ctrl+E, T opens Test Explorer.',
    },
  ],
};
