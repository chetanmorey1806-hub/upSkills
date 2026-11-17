const studentAuto = `using System;

class Student
{
    public int RollNo { get; set; }
    public string Name { get; set; } = "Unknown";   // property initializer (default value)
    public int Marks { get; set; }
    public string City { get; set; } = "Pune";
}

class Program
{
    static void Main()
    {
        var s1 = new Student { RollNo = 1, Name = "Asha", Marks = 88 };
        var s2 = new Student { RollNo = 2, Marks = 72, City = "Nagpur" };
        var s3 = new Student();

        Print(s1);
        Print(s2);
        Print(s3);
    }

    static void Print(Student s) =>
        Console.WriteLine($"{s.RollNo} | {s.Name} | {s.Marks} | {s.City}");
}
`;

const orderAuto = `using System;

class Order
{
    private static int _next = 1000;

    public int Id { get; }                                    // get-only: set in constructor only
    public string Customer { get; init; } = "";               // init-only
    public string Status { get; private set; } = "Created";   // private setter
    public int Amount { get; set; }                           // read-write

    public Order() { Id = ++_next; }

    public void Ship() => Status = "Shipped";
}

class Program
{
    static void Main()
    {
        var o1 = new Order { Customer = "Ravi", Amount = 1200 };
        var o2 = new Order { Customer = "Meena", Amount = 800 };
        o2.Ship();
        o1.Amount += 300;

        Console.WriteLine($"{o1.Id} {o1.Customer} {o1.Amount} {o1.Status}");
        Console.WriteLine($"{o2.Id} {o2.Customer} {o2.Amount} {o2.Status}");

        // o1.Id = 5;          // error CS0200: property or indexer is read only
        // o1.Status = "X";    // error CS0272: the set accessor is inaccessible
        // o1.Customer = "Z";  // error CS8852: init-only property
    }
}
`;

const backingFields = `using System;
using System.Reflection;

class Customer
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
}

class Program
{
    static void Main()
    {
        var fields = typeof(Customer).GetFields(BindingFlags.Instance | BindingFlags.NonPublic);
        foreach (var f in fields)
            Console.WriteLine($"{f.Name} : {f.FieldType.Name}");

        var props = typeof(Customer).GetProperties();
        Console.WriteLine($"Public properties: {props.Length}");
    }
}
`;

const trainerAuto = `using System;
using System.Collections.Generic;

class Trainer
{
    public string Name { get; set; } = "";
    public List<string> Skills { get; } = new();   // get-only, but the list itself is mutable

    private int _experience;
    public int Experience                           // upgraded to a full property for validation
    {
        get => _experience;
        set => _experience = Math.Clamp(value, 0, 40);
    }
}

class Program
{
    static void Main()
    {
        var t = new Trainer { Name = "Kavya", Experience = 55 };
        t.Skills.Add("C#");
        t.Skills.Add("SQL");
        // t.Skills = new List<string>();   // error CS0200: no setter

        Console.WriteLine($"{t.Name}, {t.Experience} yrs, skills: {string.Join("/", t.Skills)}");

        t.Experience = -2;
        Console.WriteLine($"Experience after -2: {t.Experience}");
    }
}
`;

export default {
  id: 'extra-09-auto-implemented-properties',
  title: 'Auto-Implemented Properties',
  module: 'Extra: OOP Concepts',
  extraNo: 9,
  level: 'Beginner',
  duration: '1 hour',
  summary: `Most properties just store and return a value. Auto-implemented properties (public string Name { get; set; }) let the compiler create the private backing field for you, so model classes, DTOs and EF Core entities stay short and clean. Learn the syntax, property initializers (default values), get-only, private-set and init-only auto properties, what the compiler actually generates, and when you must switch back to a full property.`,
  objectives: [
    'Declare auto-implemented properties and give them default values',
    'Use get-only, private set and init variations to control who can change data',
    'Explain the compiler-generated backing field and how it differs from a public field',
    'Decide when to convert an auto property into a full property (validation, logic)',
  ],
  theory: [
    {
      heading: 'What is an auto-implemented property?',
      content: `An **auto-implemented property** (auto property) is a property where you write only the accessors and the **compiler generates the hidden backing field** and the simple get/set code.

**Real-world analogy:** Locker rooms at a gym. You do not build your own locker; you just say "I want one" and the gym gives you a numbered locker with a key (get and set). You never see how the lockers are built - the compiler is the gym staff that sets up the storage for you.

Full property (6+ lines):
private string _name;
public string Name { get { return _name; } set { _name = value; } }

Auto property (1 line):
public string Name { get; set; }

Both behave **exactly the same** from the outside.`,
      syntax: `public class Student
{
    public int RollNo { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}`,
      tip: 'In Visual Studio type prop and press Tab twice to generate an auto property. propg generates one with a private setter.',
    },
    {
      heading: 'Property initializers (default values)',
      content: `Since C# 6 you can give an auto property a **default value** right where it is declared, with = value; at the end. The initializer runs **before the constructor body**, when the object is created.

Without an initializer, the property gets the **default of its type**: 0 for numbers, false for bool, null for reference types (string, List).

With nullable reference types enabled (the default in new .NET projects), a non-nullable string property without an initializer gives warning **CS8618**. Fix it with = ""; , = string.Empty; , by setting it in the constructor, by marking it required, or by declaring it string?.`,
      syntax: `public string Country { get; set; } = "India";
public List<string> Tags { get; set; } = new();
public DateTime CreatedOn { get; set; } = DateTime.UtcNow;   // evaluated for each new object
public bool IsActive { get; set; } = true;`,
    },
    {
      heading: 'Variations: get-only, private set, init',
      content: `| Declaration | Who can assign | When |
|---|---|---|
| { get; set; } | anyone | any time |
| { get; private set; } | only the class | any time |
| { get; protected set; } | the class and derived classes | any time |
| { get; init; } | anyone | only during object creation |
| { get; } | only the constructor (or initializer) | only during construction |
| required ... { get; init; } | caller must assign | in the object initializer |

A **get-only** auto property is truly read-only: its hidden backing field is marked **readonly**. An **auto property cannot have only a set** - a write-only property needs a full property.`,
      points: [
        'Get-only auto property = immutable value set in constructor',
        'Private set = state the class changes through its own methods (Status, Balance)',
        'init = immutable after creation, but set with an object initializer',
      ],
    },
    {
      heading: 'What the compiler generates',
      content: `For public string Name { get; set; } the compiler creates:

- a private field named **<Name>k__BackingField** (the angle brackets make it an illegal C# name, so you cannot clash with it or access it in code)
- a method **get_Name()** that returns the field
- a method **set_Name(string value)** that assigns it

So an auto property is **not** the same as a public field:
- Changing a public field into a property later is a **breaking change** for compiled callers (binary incompatible); starting with an auto property avoids that.
- Properties work with **data binding, serialization, EF Core mapping, model binding and interfaces**; fields do not (or not by default).
- Fields can be passed by ref; properties cannot.`,
    },
    {
      heading: 'When to switch to a full property',
      content: `Auto properties have **no logic**. As soon as you need any of these, use a full property (backing field + accessors) or, in C# 14 / .NET 10, the **field** keyword:

- **Validation** (age between 0 and 120, non-empty name)
- **Transformation** (trim, uppercase, clamp)
- **Notifications** (raise PropertyChanged, log a change)
- **Lazy loading** or caching

Auto properties are perfect for **DTOs, view models, EF Core entities, configuration classes (Options pattern) and records**, where data is mostly carried around.

Note: a get-only **collection** property (public List<string> Skills { get; } = new();) stops callers from replacing the list, but they can still Add/Remove items. For real read-only exposure use IReadOnlyList<T>.`,
      syntax: `// C# 14 (.NET 10): validation without declaring the backing field
public string Name
{
    get;
    set => field = string.IsNullOrWhiteSpace(value) ? "Unknown" : value.Trim();
}`,
    },
  ],
  examples: [
    {
      title: 'Student model with auto properties and default values',
      scenario: 'A school app needs a simple Student model. Missing values should fall back to sensible defaults.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it AutoPropertiesDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
      ],
      code: studentAuto,
      csharp: { files: { 'Program.cs': studentAuto }, stdin: '' },
      result: `1 | Asha | 88 | Pune
2 | Unknown | 72 | Nagpur
0 | Unknown | 0 | Pune`,
      explanation: `Property initializers run for every new object first, then the object initializer overrides the properties you set. s2 sets no Name, so "Unknown" remains, but its City is overridden with "Nagpur". s3 sets nothing: RollNo and Marks are int with default 0, Name and City keep their initializer values.`,
    },
    {
      title: 'get-only, init and private set auto properties',
      scenario: 'An order system: the Id is generated automatically, the customer is fixed at creation, the status changes only through Ship(), and the amount is freely editable.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OrderAutoProps',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Uncomment each commented line one at a time and press Ctrl+Shift+B to see the compiler errors',
      ],
      code: orderAuto,
      csharp: { files: { 'Program.cs': orderAuto }, stdin: '' },
      result: `1001 Ravi 1500 Created
1002 Meena 800 Shipped`,
      explanation: `++_next increments the static counter before using it, so the first order gets 1001 and the second 1002 (Id is assigned in the constructor, which a get-only auto property allows). o1.Amount += 300 gives 1500. Only o2 was shipped. The commented lines show the three different protections: get-only (CS0200), private set (CS0272) and init (CS8852).`,
    },
    {
      title: 'Seeing the hidden backing fields with reflection',
      scenario: 'Prove that the compiler really generates private fields for auto properties.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it BackingFieldPeek',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Optional: open the compiled DLL in ILSpy (or Visual Studio Go To Definition with decompilation enabled) to see get_Name/set_Name',
      ],
      code: backingFields,
      csharp: { files: { 'Program.cs': backingFields }, stdin: '' },
      result: `<Name>k__BackingField : String
<Age>k__BackingField : Int32
Public properties: 2`,
      explanation: `GetFields with NonPublic | Instance returns the private compiler-generated fields. Their names <Name>k__BackingField and <Age>k__BackingField contain angle brackets, which are illegal in C# identifiers, so your code can never refer to them directly. FieldType.Name gives the CLR type names String and Int32. (Reflection does not formally guarantee field order, but it is the declaration order in practice.)`,
    },
    {
      title: 'Get-only collection property and upgrading to a full property',
      scenario: 'A training institute stores trainers. Skills can be added but the list cannot be replaced; experience must stay between 0 and 40 years.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it TrainerProps',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: trainerAuto,
      csharp: { files: { 'Program.cs': trainerAuto }, stdin: '' },
      result: `Kavya, 40 yrs, skills: C#/SQL
Experience after -2: 0`,
      explanation: `Skills is a get-only auto property initialised with a new list: you can Add to it but not assign a new list. Experience needed validation, so it was turned into a full property: Math.Clamp(55, 0, 40) gives 40 and Math.Clamp(-2, 0, 40) gives 0. Name stays a simple auto property because it needs no logic.`,
    },
  ],
  interview: [
    { q: 'What is an auto-implemented property?', a: 'A property declared with just accessors, like public int Age { get; set; }, for which the compiler automatically creates a private backing field and the get/set logic.', level: 'Easy' },
    { q: 'How do you give an auto property a default value?', a: 'With a property initializer: public string City { get; set; } = "Pune"; (C# 6+). It runs before the constructor body.', level: 'Easy' },
    { q: 'What is the default value of an auto property without an initializer?', a: 'The default of its type: 0 for numeric types, false for bool, null for reference types, default(T) for structs.', level: 'Easy' },
    { q: 'What is the name of the compiler-generated backing field?', a: 'Something like <Name>k__BackingField. It uses characters that are illegal in C#, so you cannot access it by name in code.', level: 'Medium' },
    { q: 'Can an auto property have only a set accessor?', a: 'No. Auto properties must have a get accessor. A write-only property requires a full property.', level: 'Medium' },
    { q: 'Where can a get-only auto property be assigned?', a: 'Only in its initializer or in a constructor of the class. Its backing field is readonly.', level: 'Medium' },
    { q: 'Is public int Age { get; set; } the same as public int Age;?', a: 'Functionally similar for reading and writing, but not the same: the property is compiled to methods, works with data binding/serialization/EF Core/interfaces, can later get logic without breaking callers, and cannot be passed by ref.', level: 'Medium' },
    { q: 'Why does a non-nullable string auto property produce warning CS8618?', a: 'With nullable reference types enabled, the property would start as null when the constructor finishes. Fix it with an initializer, constructor assignment, required, or by making it string?.', level: 'Medium' },
    { q: 'When should you replace an auto property with a full property?', a: 'When you need logic in an accessor: validation, trimming, clamping, change notifications, lazy loading or logging.', level: 'Easy' },
    { q: 'Does a get-only List<T> auto property make the list read-only?', a: 'No. It only prevents assigning a new list. Callers can still Add, Remove and Clear. Expose IReadOnlyList<T> or ReadOnlyCollection<T> for true read-only access.', level: 'Hard' },
    { q: 'Output? class C { public int X { get; } = 5; public C() { X = 10; } } Console.Write(new C().X);', a: 'It prints 10. The initializer sets 5 first, then the constructor body assigns 10, which is allowed for a get-only auto property.', level: 'Hard' },
    { q: 'What is the C# 14 field keyword and how does it relate to auto properties?', a: 'It lets you keep the compiler-generated backing field but add logic to one accessor, e.g. public string Name { get; set => field = value.Trim(); }, so you do not have to convert to a full property.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create an Employee class with auto properties Id, Name, Department (default "IT") and Salary. Create three employees with object initializers and print them.',
      hint: 'public string Department { get; set; } = "IT";',
      solution: `class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Department { get; set; } = "IT";
    public int Salary { get; set; }
}

var list = new[]
{
    new Employee { Id = 1, Name = "Arjun", Salary = 40000 },
    new Employee { Id = 2, Name = "Neha", Department = "HR", Salary = 38000 },
    new Employee { Id = 3, Name = "Sam", Salary = 52000 },
};
foreach (var e in list) Console.WriteLine($"{e.Id} {e.Name} {e.Department} {e.Salary}");`,
    },
    {
      task: 'Create a Ticket class with a get-only auto property TicketNo generated from a static counter starting at 1, a Passenger (init) and a Status with private set that becomes "Cancelled" when Cancel() is called.',
      hint: 'Assign TicketNo in the constructor.',
      solution: `class Ticket
{
    private static int _counter;
    public int TicketNo { get; }
    public string Passenger { get; init; } = "";
    public string Status { get; private set; } = "Booked";
    public Ticket() { TicketNo = ++_counter; }
    public void Cancel() => Status = "Cancelled";
}

var t1 = new Ticket { Passenger = "Asha" };
var t2 = new Ticket { Passenger = "Ravi" };
t2.Cancel();
Console.WriteLine($"{t1.TicketNo} {t1.Status}, {t2.TicketNo} {t2.Status}");   // 1 Booked, 2 Cancelled`,
    },
    {
      task: 'Convert this auto property to a full property so that the name is always stored in upper case: public string Code { get; set; } = "";',
      hint: 'Use a private backing field and ToUpperInvariant() in set.',
      solution: `private string _code = "";
public string Code
{
    get => _code;
    set => _code = value.ToUpperInvariant();
}
// obj.Code = "abc12"; Console.WriteLine(obj.Code);   // ABC12`,
    },
    {
      task: 'Write a CourseDto class with auto properties suitable for a Web API: Id (int), Title (required string), Fees (int), Tags (List<string> initialised empty). Explain why these are auto properties.',
      hint: 'DTOs only carry data, no logic.',
      solution: `public class CourseDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public int Fees { get; set; }
    public List<string> Tags { get; set; } = new();
}
// DTOs only carry data between client and server. System.Text.Json and model binding
// work with public properties, and no validation logic is needed inside the accessors
// (validation is done with data annotations or FluentValidation), so auto properties fit perfectly.`,
    },
  ],
  quiz: [
    {
      question: 'Who creates the backing field of an auto-implemented property?',
      options: ['The programmer', 'The compiler', 'The garbage collector', 'The CLR at run time from reflection'],
      answer: 1,
      explanation: 'The C# compiler generates a private backing field automatically.',
    },
    {
      question: 'Which declaration gives the property Country a default value?',
      options: ['public string Country { get; set; } = "India";', 'public string Country { get; set = "India"; }', 'public string Country = "India" { get; set; }', 'public default string Country { get; set; }'],
      answer: 0,
      explanation: 'Property initializer syntax: = value; after the accessor list.',
    },
    {
      question: 'Which auto property can only be assigned inside the constructor?',
      options: ['{ get; set; }', '{ get; init; }', '{ get; private set; }', '{ get; }'],
      answer: 3,
      explanation: 'A get-only auto property has a readonly backing field, assignable only in the initializer or constructor.',
    },
    {
      question: 'Which of these is NOT possible with an auto-implemented property?',
      options: ['A private setter', 'An init accessor', 'Only a set accessor (write-only)', 'A default value'],
      answer: 2,
      explanation: 'Auto properties must have a get accessor.',
    },
    {
      question: 'For public List<string> Skills { get; } = new(); which statement compiles?',
      options: ['obj.Skills.Add("C#");', 'obj.Skills = new List<string>();', 'obj.Skills = null;', 'None of them'],
      answer: 0,
      explanation: 'The list reference cannot be replaced, but the list itself is mutable.',
    },
  ],
};
