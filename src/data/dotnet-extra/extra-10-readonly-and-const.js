const classroom = `using System;

class Classroom
{
    public const int MaxSeats = 40;          // same for every classroom, fixed at compile time
    public readonly string RoomNo;           // fixed per object, decided at run time
    public readonly int Seats;

    public Classroom(string roomNo, int seats)
    {
        RoomNo = roomNo;                     // readonly fields can be assigned in the constructor
        Seats = seats > MaxSeats ? MaxSeats : seats;
    }

    // public void Rename() { RoomNo = "X"; }   // error CS0191: a readonly field cannot be assigned to
}

class Program
{
    static void Main()
    {
        var a = new Classroom("A-101", 35);
        var b = new Classroom("B-202", 60);

        Console.WriteLine($"Max seats (class-level const): {Classroom.MaxSeats}");
        Console.WriteLine($"{a.RoomNo}: {a.Seats} seats");
        Console.WriteLine($"{b.RoomNo}: {b.Seats} seats");
    }
}
`;

const appConfig = `using System;

static class AppConfig
{
    public const string AppName = "SchoolERP";        // const: literal values only
    public const int Version = 3;
    public const string Title = AppName + " v3";       // a const can be built from other consts

    public static readonly string ConnectionString;    // computed at run time
    public static readonly int[] GradeCutoffs = { 90, 75, 60, 40 };

    static AppConfig()
    {
        string server = "localhost";
        ConnectionString = $"Server={server};Database={AppName}Db;Trusted_Connection=True;";
        Console.WriteLine("Static constructor ran");
    }
}

class Program
{
    static void Main()
    {
        Console.WriteLine(AppConfig.Title);
        Console.WriteLine(AppConfig.ConnectionString);

        AppConfig.GradeCutoffs[3] = 35;      // allowed! readonly protects the reference, not the contents
        Console.WriteLine(string.Join(",", AppConfig.GradeCutoffs));
        // AppConfig.GradeCutoffs = new int[0];   // error CS0198
    }
}
`;

const readonlyStruct = `using System;
using System.Collections.Generic;

readonly struct Money
{
    public readonly int Rupees;
    public Money(int rupees) { Rupees = rupees; }
    public Money Add(int more) => new Money(Rupees + more);   // returns a NEW value
}

class Cart
{
    private readonly List<string> _items = new();     // the reference is fixed, the contents can change

    public void Add(string item) => _items.Add(item);
    public int Count => _items.Count;

    // public void Reset() => _items = new List<string>();   // error CS0191
    public void Reset() => _items.Clear();             // allowed
}

class Program
{
    static void Main()
    {
        var price = new Money(500);
        var total = price.Add(250);
        Console.WriteLine($"price={price.Rupees}, total={total.Rupees}");

        var cart = new Cart();
        cart.Add("Pen");
        cart.Add("Book");
        Console.WriteLine($"Cart items: {cart.Count}");
        cart.Reset();
        Console.WriteLine($"After reset: {cart.Count}");

        const int Days = 7;          // local constant
        Console.WriteLine($"Hours in a week: {Days * 24}");
    }
}
`;

const constPatterns = `using System;

class Grading
{
    public const int Distinction = 75;
    public const int Pass = 40;

    // const values can be used in patterns and case labels
    public static string Grade(int marks) => marks switch
    {
        >= Distinction => "Distinction",
        >= Pass => "Pass",
        _ => "Fail"
    };

    // optional parameter defaults must be compile-time constants
    public static string Describe(int marks, string school = "City School")
        => $"{school}: {marks} -> {Grade(marks)}";
}

class Program
{
    static void Main()
    {
        Console.WriteLine(Grading.Describe(82));
        Console.WriteLine(Grading.Describe(55, "Model School"));
        Console.WriteLine(Grading.Describe(31));
    }
}
`;

export default {
  id: 'extra-10-readonly-and-const',
  title: 'readonly and const',
  module: 'Extra: OOP Concepts',
  extraNo: 10,
  level: 'Beginner',
  duration: '1 hour',
  summary: `Some values must never change: the number of days in a week, the maximum seats in a classroom, an employee's ID after hiring, the connection string after the app starts. C# gives you two tools: const for compile-time constants that are the same everywhere, and readonly for values decided at run time (in a constructor) that then stay fixed. Learn the rules of each, static readonly, readonly structs and members, why readonly does not make objects immutable, and the classic interview question on const versioning.`,
  objectives: [
    'Declare const fields and local constants and know which types are allowed',
    'Declare readonly instance and static readonly fields and assign them in constructors',
    'Explain the differences between const, readonly and static readonly',
    'Understand that readonly protects the reference, not the object it points to',
    'Use readonly struct and know the const versioning problem across assemblies',
  ],
  theory: [
    {
      heading: 'const - compile-time constants',
      content: `A **const** is a value fixed **at compile time** and can never change.

**Real-world analogy:** The number of days in a week (7) or the boiling point of water at sea level. They are the same for everyone, forever - printed in every textbook.

Rules:
- Must be **initialised in the declaration** with a value the compiler can compute.
- Allowed types: numeric types, bool, char, **string**, enum, and null for reference types. Not DateTime, not arrays, not objects.
- A const field is **implicitly static** - access it with the class name (Classroom.MaxSeats); you cannot write static const.
- The compiler **copies the value** into every place it is used (inlining).
- Can be a **local** constant inside a method: const int Days = 7;
- Can be used where the language requires constants: **case labels, patterns, attribute arguments, optional parameter defaults**.`,
      syntax: `public const double Pi = 3.14159;
public const string AppName = "SchoolERP";
public const string Title = AppName + " v3";   // const expression from other consts

// const DateTime Start = DateTime.Now;          // error: not a compile-time constant`,
    },
    {
      heading: 'readonly - run-time constants',
      content: `A **readonly** field can be assigned **only** in its declaration or in a **constructor** of the same class. After construction it cannot change.

**Real-world analogy:** Your Aadhaar/PAN number or an employee ID. It is not known when the law/company was created (not compile time), it is assigned once when you "are created" (registered), and then it never changes. Different people have different values.

- Can be **any type** (DateTime, List, custom classes).
- Can have a **different value per object** (instance readonly) or one per type (**static readonly**, assigned in a static constructor or initializer).
- Value can come from **run-time computation**: a parameter, a config file, DateTime.UtcNow, Guid.NewGuid().
- Common use: **injected dependencies** - private readonly IStudentRepository _repo;`,
      syntax: `public class Employee
{
    public readonly int Id;
    public readonly DateTime JoinedOn = DateTime.UtcNow;
    public static readonly string Company;

    static Employee() { Company = "Acme"; }
    public Employee(int id) { Id = id; }
}`,
    },
    {
      heading: 'const vs readonly vs static readonly',
      content: `| | const | readonly | static readonly |
|---|---|---|---|
| When value is fixed | compile time | object creation (constructor) | type initialisation (static constructor) |
| Where assigned | declaration only | declaration or instance constructor | declaration or static constructor |
| Static? | implicitly static | per object | one per type |
| Allowed types | primitives, string, enum, null | any | any |
| Value can differ per object | no | yes | no |
| Usable in switch case / attribute | yes | no | no |
| Value copied into callers | yes (inlined) | no (read at run time) | no |

Rule of thumb: use **const** only for values that are truly universal and will never change (math constants, fixed limits defined by nature or a standard). For anything that might change between versions or depends on configuration, use **static readonly**.`,
    },
    {
      heading: 'readonly does not mean immutable',
      content: `readonly protects the **variable** (the reference), not the **object** it points to.

private readonly List<string> _items = new();
- _items = new List<string>(); is an **error** (CS0191).
- _items.Add("Pen"); and _items.Clear(); are **allowed** - the list itself is mutable.

Same for arrays: static readonly int[] Cutoffs = {90, 75}; - you cannot replace the array but you can change Cutoffs[0]. For real immutability use **IReadOnlyList<T>**, **ImmutableArray<T>**/**ImmutableList<T>**, or records with init properties.

**readonly struct** (C# 7.2): all fields must be readonly - the whole value is immutable. **readonly members** (C# 8): a struct method marked readonly promises not to change the struct. Other readonly forms: **ref readonly** returns and **in** parameters pass large structs by reference without allowing changes.`,
      tip: 'A get-only auto property ({ get; }) is the property version of a readonly field - its hidden backing field is readonly.',
    },
    {
      heading: 'The const versioning problem (classic interview question)',
      content: `Because const values are **copied into the calling assembly at compile time**, changing a public const in a library does **not** update programs that were compiled against the old version until they are recompiled.

Example: Library.dll has public const int MaxUsers = 10;. App.exe uses Library.MaxUsers, so the compiler writes 10 directly into App.exe. You update Library.dll to MaxUsers = 50 and deploy only the DLL. App.exe still uses **10**.

With public static readonly int MaxUsers = 10; App.exe reads the field from Library.dll at run time, so it sees **50** immediately.

So: **public const** across assembly boundaries only for values that will never change. Private/internal consts are safe.`,
      points: [
        'const = inlined at compile time (fast, but frozen into callers)',
        'static readonly = looked up at run time (flexible)',
        'Naming: PascalCase for both const and public readonly fields',
      ],
    },
  ],
  examples: [
    {
      title: 'Classroom: const limit and readonly per-object values',
      scenario: 'A school has a rule: no room may have more than 40 seats. Each room has its own number and seat count, fixed when the room is created.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it ReadonlyConstDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Uncomment the Rename method and press Ctrl+Shift+B to see error CS0191',
      ],
      code: classroom,
      csharp: { files: { 'Program.cs': classroom }, stdin: '' },
      result: `Max seats (class-level const): 40
A-101: 35 seats
B-202: 40 seats`,
      explanation: `MaxSeats is a const, so it is accessed with the class name and is the same for all rooms. RoomNo and Seats are readonly: each object gets its own values in the constructor. B-202 asked for 60 seats, which is more than MaxSeats, so the constructor stored 40. After the constructor finishes, no method can change these fields.`,
    },
    {
      title: 'const vs static readonly in an application config class',
      scenario: 'An ERP application stores its name and version as constants and builds its connection string at start-up.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it AppConfigDemo',
        'Replace Program.cs with the code',
        'Press F9 on the first line of Main, run with F5 and press F11 repeatedly to see when the static constructor runs',
        'Press Ctrl+F5 to see the output',
      ],
      code: appConfig,
      csharp: { files: { 'Program.cs': appConfig }, stdin: '' },
      result: `SchoolERP v3
Static constructor ran
Server=localhost;Database=SchoolERPDb;Trusted_Connection=True;
90,75,60,35`,
      explanation: `AppConfig.Title is a const, so the compiler replaced it with the literal "SchoolERP v3" - reading it does not touch the AppConfig type at all, and the static constructor has not run yet. The first access to the static readonly ConnectionString triggers the static constructor, which prints its message and builds the string. Finally, GradeCutoffs is readonly, but only the reference is protected: changing element 3 from 40 to 35 is allowed.`,
    },
    {
      title: 'readonly struct, readonly reference fields and local const',
      scenario: 'A shopping cart uses an immutable Money value type and a readonly list of items.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ReadonlyTypes',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: readonlyStruct,
      csharp: { files: { 'Program.cs': readonlyStruct }, stdin: '' },
      result: `price=500, total=750
Cart items: 2
After reset: 0
Hours in a week: 168`,
      explanation: `Money is a readonly struct: Add cannot modify Rupees, so it returns a new Money(750) and price is still 500. The Cart's _items field is readonly, so it can never point to another list, but Clear() empties the same list - readonly is not immutability. Days is a local const: 7 x 24 = 168, computed by the compiler.`,
    },
    {
      title: 'Where only const works: patterns and default parameters',
      scenario: 'A result-processing module uses named constants for grade boundaries in a switch expression and a constant default school name.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ConstPatterns',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change const int Pass to static readonly int Pass and build - you get error CS0150 (a constant value is expected)',
      ],
      code: constPatterns,
      csharp: { files: { 'Program.cs': constPatterns }, stdin: '' },
      result: `City School: 82 -> Distinction
Model School: 55 -> Pass
City School: 31 -> Fail`,
      explanation: `Relational patterns (>= Distinction) and optional parameter defaults require compile-time constants, so only const works here, not readonly. 82 >= 75 gives Distinction, 55 is >= 40 but < 75 gives Pass, 31 falls through to the discard _ and gives Fail. The first and third calls use the default school "City School".`,
    },
  ],
  interview: [
    { q: 'What is the difference between const and readonly?', a: 'const is a compile-time constant, set only in the declaration, implicitly static, limited to primitive/string/enum types and inlined into callers. readonly is a run-time constant, set in the declaration or constructor, can be per-instance, any type, and read at run time.', level: 'Easy' },
    { q: 'Is a const field static?', a: 'Yes, implicitly. You access it with the type name and cannot add the static keyword (error CS0504).', level: 'Easy' },
    { q: 'Can a const be of type DateTime or an array?', a: 'No. Only types with compile-time literal values: numeric types, bool, char, string, enum, or null for reference types. Use static readonly for DateTime or arrays.', level: 'Medium' },
    { q: 'Where can a readonly field be assigned?', a: 'In its declaration (field initializer) or in any constructor of the same class (static readonly in the static constructor). Nowhere else.', level: 'Easy' },
    { q: 'What is static readonly and when do you use it?', a: 'A single per-type value fixed after type initialisation. Use it for values computed at run time or that might change between versions, e.g. connection strings, shared objects, lookup tables.', level: 'Medium' },
    { q: 'Does readonly make an object immutable?', a: 'No. It only prevents reassigning the field. If the field refers to a mutable object (List, array), the object\'s contents can still change.', level: 'Medium' },
    { q: 'Explain the const versioning problem.', a: 'Const values are copied into the calling assembly at compile time. If a library changes a public const and only the library DLL is redeployed, callers keep using the old value until recompiled. static readonly avoids this.', level: 'Hard' },
    { q: 'Can you use a readonly field in a switch case label?', a: 'No. Case labels and patterns need compile-time constants, so only const (or literals/enums) work.', level: 'Medium' },
    { q: 'What is a readonly struct?', a: 'A struct declared readonly struct (C# 7.2+) whose fields must all be readonly, making the value immutable and letting the compiler avoid defensive copies.', level: 'Hard' },
    { q: 'Can a readonly field be changed using reflection?', a: 'Instance readonly fields can technically be changed with reflection (FieldInfo.SetValue), though it is a bad idea; static readonly fields of an initialised type cannot be reliably changed in modern .NET. const values cannot be changed at all - they are not even read at run time.', level: 'Hard' },
    { q: 'Output? class A { public readonly int X = 1; public A() { X = 2; X = 3; } } Console.Write(new A().X);', a: 'It prints 3. A readonly field may be assigned multiple times inside the constructor; the last assignment wins.', level: 'Medium' },
    { q: 'Why are injected dependencies usually declared private readonly?', a: 'They are set once in the constructor and must not be replaced later; readonly enforces that and documents the intent.', level: 'Easy' },
    { q: 'What is the difference between a readonly field and a get-only auto property?', a: 'Both can be set only during construction. The property has a compiler-generated readonly backing field and is accessed through a getter, so it works with interfaces, serialization and data binding, and can later gain logic.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Circle class with a const double Pi = 3.14 and a readonly int Radius set in the constructor. Add a method Circumference() that returns 2 * Pi * Radius as a string formatted with ToString("0.00", CultureInfo.InvariantCulture). Print it for radius 10.',
      hint: '2 x 3.14 x 10 = 62.80',
      solution: `using System.Globalization;

class Circle
{
    public const double Pi = 3.14;
    public readonly int Radius;
    public Circle(int r) { Radius = r; }
    public string Circumference() => (2 * Pi * Radius).ToString("0.00", CultureInfo.InvariantCulture);
}

Console.WriteLine(new Circle(10).Circumference());   // 62.80`,
    },
    {
      task: 'Create an Employee class with readonly EmployeeId and readonly JoiningYear assigned in the constructor, and a static readonly CompanyName assigned in a static constructor. Try to change EmployeeId in a method and note the error.',
      hint: 'Error CS0191.',
      solution: `class Employee
{
    public readonly int EmployeeId;
    public readonly int JoiningYear;
    public static readonly string CompanyName;

    static Employee() { CompanyName = "TechSoft"; }
    public Employee(int id, int year) { EmployeeId = id; JoiningYear = year; }

    // public void ChangeId(int id) { EmployeeId = id; }   // CS0191
}

var e = new Employee(7, 2024);
Console.WriteLine($"{Employee.CompanyName} {e.EmployeeId} {e.JoiningYear}");   // TechSoft 7 2024`,
    },
    {
      task: 'Use const values in a switch statement: const int Saturday = 6, Sunday = 7. Print "Weekend" for 6 or 7 and "Weekday" for 1-5.',
      hint: 'case Saturday: case Sunday:',
      solution: `const int Saturday = 6, Sunday = 7;
int day = 6;
switch (day)
{
    case Saturday:
    case Sunday:
        Console.WriteLine("Weekend");
        break;
    default:
        Console.WriteLine("Weekday");
        break;
}`,
    },
    {
      task: 'Show that a readonly array can be modified but not reassigned, then fix it by exposing it as IReadOnlyList<int>.',
      hint: 'Keep the array private and expose a read-only view.',
      solution: `class Rules
{
    private static readonly int[] _cutoffs = { 90, 75, 60 };
    public static IReadOnlyList<int> Cutoffs => _cutoffs;
}

// Rules.Cutoffs[0] = 10;   // error CS0200: indexer is read only
Console.WriteLine(string.Join(",", Rules.Cutoffs));   // 90,75,60`,
    },
  ],
  quiz: [
    {
      question: 'Which keyword creates a value that is fixed at compile time?',
      options: ['readonly', 'static', 'const', 'sealed'],
      answer: 2,
      explanation: 'const values are evaluated by the compiler and inlined.',
    },
    {
      question: 'Where can an instance readonly field be assigned?',
      options: ['Only in its declaration or in a constructor', 'Anywhere inside the class', 'Only in static methods', 'Only through a property'],
      answer: 0,
      explanation: 'After the constructor finishes, a readonly field cannot be changed.',
    },
    {
      question: 'Which declaration is INVALID?',
      options: ['const int Max = 10;', 'const string Name = "A";', 'static readonly DateTime Start = DateTime.UtcNow;', 'const DateTime Start = DateTime.Now;'],
      answer: 3,
      explanation: 'DateTime.Now is not a compile-time constant, so it cannot be a const.',
    },
    {
      question: 'private readonly List<int> _nums = new(); Which line compiles inside a normal method?',
      options: ['_nums = new List<int>();', '_nums.Add(5);', '_nums = null;', 'None of them'],
      answer: 1,
      explanation: 'readonly blocks reassignment of the field, not changes to the list contents.',
    },
    {
      question: 'A library changes public const int Limit from 10 to 50 and only the library DLL is redeployed. What does an already-compiled app see?',
      options: ['50', 'A run-time error', '10', '0'],
      answer: 2,
      explanation: 'const values are copied into the calling assembly at compile time, so the app keeps 10 until recompiled.',
    },
  ],
};
