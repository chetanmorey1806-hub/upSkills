const bankProperty = `using System;

class BankAccount
{
    private int _balance;          // backing field
    private string _holder = "";

    public string Holder
    {
        get { return _holder; }
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Holder name is required");
            _holder = value.Trim();
        }
    }

    public int Balance
    {
        get => _balance;
        private set => _balance = value;   // only this class can change it
    }

    public void Deposit(int amount)
    {
        if (amount <= 0)
        {
            Console.WriteLine("Rejected deposit (must be positive)");
            return;
        }
        Balance += amount;   // uses the private setter
    }
}

class Program
{
    static void Main()
    {
        var acc = new BankAccount();
        acc.Holder = "  Sneha  ";
        acc.Deposit(1500);
        acc.Deposit(-200);
        acc.Deposit(500);
        Console.WriteLine($"[{acc.Holder}] balance = {acc.Balance}");

        try
        {
            acc.Holder = "";
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
        Console.WriteLine($"Holder unchanged: {acc.Holder}");

        // acc.Balance = 1000000;   // error CS0272: the set accessor is inaccessible
    }
}
`;

const rectangle = `using System;

class Rectangle
{
    private int _width;
    private int _height;

    public int Width
    {
        get => _width;
        set => _width = value < 0 ? 0 : value;
    }

    public int Height
    {
        get => _height;
        set => _height = value < 0 ? 0 : value;
    }

    public int Area => Width * Height;                 // read-only computed property
    public int Perimeter => 2 * (Width + Height);
    public bool IsSquare => Width == Height;
}

class Program
{
    static void Main()
    {
        var r = new Rectangle { Width = 8, Height = 5 };
        Console.WriteLine($"Area={r.Area}, Perimeter={r.Perimeter}, Square={r.IsSquare}");

        r.Height = -3;
        Console.WriteLine($"Height after -3: {r.Height}, Area={r.Area}");

        r.Height = 8;
        Console.WriteLine($"Square now? {r.IsSquare}");
    }
}
`;

const initRequired = `using System;

class Employee
{
    public required int Id { get; init; }          // must be set, only during creation
    public required string Name { get; init; }
    public string Department { get; init; } = "General";
    public int Salary { get; set; }                 // normal read-write
}

class Program
{
    static void Main()
    {
        var e = new Employee { Id = 101, Name = "Arjun", Salary = 45000 };
        Console.WriteLine($"{e.Id} {e.Name} {e.Department} {e.Salary}");

        e.Salary = 50000;            // OK: set accessor
        // e.Name = "Raj";           // error CS8852: init-only property
        // var x = new Employee();   // error CS9035: required member 'Id' must be set

        var moved = new Employee { Id = e.Id, Name = e.Name, Department = "Finance", Salary = e.Salary };
        Console.WriteLine($"{moved.Id} {moved.Name} {moved.Department} {moved.Salary}");
    }
}
`;

const productProps = `using System;

class Product
{
    private int _price;
    private string? _code;

    public string Name { get; }
    public int ChangeCount { get; private set; }

    public Product(string name, int price) { Name = name; _price = price; }

    public int Price
    {
        get => _price;
        set
        {
            if (value == _price) return;                      // ignore "no change"
            Console.WriteLine($"{Name}: price {_price} -> {value}");
            _price = value;
            ChangeCount++;
        }
    }

    // Lazy getter: computed only the first time it is read
    public string Code
    {
        get
        {
            if (_code == null)
            {
                Console.WriteLine("(generating code)");
                _code = Name.ToUpperInvariant().Substring(0, 3) + "-" + Name.Length;
            }
            return _code;
        }
    }
}

class Program
{
    static void Main()
    {
        var p = new Product("Laptop", 55000);
        p.Price = 52000;
        p.Price = 52000;
        p.Price = 49999;
        Console.WriteLine($"Changes: {p.ChangeCount}");
        Console.WriteLine(p.Code);
        Console.WriteLine(p.Code);
    }
}
`;

export default {
  id: 'extra-08-properties-get-set-init',
  title: 'Properties: get, set and init Accessors',
  module: 'Extra: OOP Concepts',
  extraNo: 8,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: `Properties are the C# way to expose an object's data safely. They look like fields from the outside (acc.Balance) but are really a pair of methods - a get accessor to read and a set (or init) accessor to write - so the class can validate, compute, log or protect values. Learn full properties with backing fields, read-only and write-only properties, computed and expression-bodied properties, access modifiers on accessors (private set), init-only setters and required members (C# 11), and the C# 14 field keyword.`,
  objectives: [
    'Write full properties with a private backing field and validation in the setter',
    'Use the value keyword and expression-bodied get/set accessors',
    'Create read-only, computed and private-set properties to protect state',
    'Use init accessors and required members to build immutable objects with object initializers',
    'Explain why public fields should be replaced by properties',
  ],
  theory: [
    {
      heading: 'Why properties instead of public fields?',
      content: `A **public field** (public int Balance;) lets anyone write anything - a negative balance, an empty name. A **property** keeps the data in a **private field** and controls access through **accessors**.

**Real-world analogy:** A bank counter. You cannot walk into the vault and change your balance (the private field). You talk to the cashier (the property): **get** = "show me my balance", **set** = "deposit this" - and the cashier checks the request before touching the vault. Some counters only allow viewing (read-only property).

Benefits:
- **Validation** (reject negative ages, empty names)
- **Encapsulation** - change the internal storage later without breaking callers
- **Computed values** (Area from Width and Height)
- **Different access levels** for reading and writing (public get, private set)
- Data binding, serialization (System.Text.Json), EF Core and Razor all work with **properties**, not fields.`,
    },
    {
      heading: 'Full property: backing field, get, set and value',
      content: `A full property has a **private backing field** plus **get** and **set** accessors. Inside set, the special keyword **value** holds the value being assigned.

- get must **return** a value of the property type.
- set receives **value** and usually stores it in the field.
- Either accessor can use **expression-bodied** syntax with =>.
- Naming convention: field _camelCase (or camelCase), property PascalCase.`,
      syntax: `private int _age;               // backing field

public int Age                  // property
{
    get { return _age; }
    set
    {
        if (value < 0 || value > 120)
            throw new ArgumentOutOfRangeException(nameof(value), "Age must be 0-120");
        _age = value;
    }
}

// expression-bodied accessors
public string Name
{
    get => _name;
    set => _name = value.Trim();
}`,
      tip: 'In Visual Studio type propfull then press Tab twice to generate a full property with a backing field.',
    },
    {
      heading: 'Read-only, write-only, computed and private set',
      content: `- **Read-only property**: only a get. Value set in the constructor or computed: public int Area => Width * Height;
- **Write-only property**: only a set (rare - e.g. a Password that is hashed and never read back).
- **Computed property**: no backing field at all; calculated every time it is read (Area, FullName, IsAdult).
- **Asymmetric access**: public int Balance { get; private set; } - everyone can read, only the class can write. You can also use protected set or internal set.

Rule: the accessor modifier must be **more restrictive** than the property itself, and only **one** of the two accessors can have a modifier.`,
      syntax: `public string FullName => $"{FirstName} {LastName}";   // computed, read-only
public bool IsAdult => Age >= 18;
public int Balance { get; private set; }                // asymmetric access`,
    },
    {
      heading: 'init accessor and required members',
      content: `**init** (C# 9) is like set, but the property can be assigned **only during object creation**: in a constructor or an **object initializer** { Id = 1 }. After that it is read-only. This makes **immutable** objects easy without long constructors.

**required** (C# 11 / .NET 7) forces callers to set the property in the object initializer - otherwise a compile-time error CS9035.

**with expressions**: records (and structs) can make a modified copy: var b = a with { Name = "New" }; - it uses init accessors.`,
      syntax: `public class Employee
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public string Department { get; init; } = "General";   // default value
}

var e = new Employee { Id = 1, Name = "Arjun" };   // OK
// e.Name = "Raj";   // CS8852: init-only property can only be assigned in an object initializer`,
      points: [
        'set  -> assign any time',
        'init -> assign only while the object is being created',
        'no setter -> assign only in the constructor (or never, if computed)',
      ],
    },
    {
      heading: 'More property features (lazy getters, field keyword, interfaces)',
      content: `- **Lazy getter**: compute an expensive value only when first requested and cache it in the field (see the Product example).
- **Change detection** in setters: compare value with the current field and skip work if nothing changed - the basis of INotifyPropertyChanged in WPF/MAUI.
- **Properties in interfaces**: interface IShape { int Area { get; } } - implementers must provide a getter.
- **Static properties**: public static int Count { get; private set; }
- **Indexers** are a special property with parameters: public string this[int i] { get ... set ... }
- **C# 14 field keyword** (.NET 10): inside an accessor, field refers to the compiler-generated backing field, so you can add validation without declaring the field yourself: public string Name { get; set => field = value.Trim(); }. It is not available in .NET 8 / C# 12, so the examples here use explicit backing fields.

Properties should be **cheap** and **side-effect free** when read. If reading does heavy work (database call), use a method like GetReport() instead.`,
    },
  ],
  examples: [
    {
      title: 'BankAccount: validation in set and a private setter',
      scenario: 'Protect a bank account: the holder name cannot be empty and the balance can only change through Deposit().',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it PropertiesDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Uncomment the acc.Balance line and build (Ctrl+Shift+B) to see error CS0272',
      ],
      code: bankProperty,
      csharp: { files: { 'Program.cs': bankProperty }, stdin: '' },
      result: `Rejected deposit (must be positive)
[Sneha] balance = 2000
Error: Holder name is required
Holder unchanged: Sneha`,
      explanation: `The Holder setter trims "  Sneha  " to "Sneha". Deposits: 1500 accepted, -200 rejected, 500 accepted, so the balance is 2000. Assigning "" fails validation and throws before the field is changed, so the holder stays "Sneha". Balance has a public getter but a private setter: Deposit can use it, Main cannot.`,
    },
    {
      title: 'Rectangle: computed read-only properties',
      scenario: 'A drawing app where width and height can never be negative and Area, Perimeter and IsSquare are always up to date.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RectangleProperties',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: rectangle,
      csharp: { files: { 'Program.cs': rectangle }, stdin: '' },
      result: `Area=40, Perimeter=26, Square=False
Height after -3: 0, Area=0
Square now? True`,
      explanation: `8 x 5 = 40 and 2 x (8 + 5) = 26. The Height setter turns -3 into 0, so the area becomes 0. Area, Perimeter and IsSquare have no backing fields - they are recalculated each time they are read, so they can never be out of date. After Height = 8, width and height are equal and IsSquare is True.`,
    },
    {
      title: 'init and required: immutable Employee records',
      scenario: 'An HR system where Id and Name must be given when the employee is created and can never change afterwards; salary can change.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (target .NET 8 or later)',
        'Name it InitProperties',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Uncomment e.Name = "Raj"; and press Ctrl+Shift+B to see CS8852 in the Error List',
      ],
      code: initRequired,
      csharp: { files: { 'Program.cs': initRequired }, stdin: '' },
      result: `101 Arjun General 45000
101 Arjun Finance 50000`,
      explanation: `Department was not set in the first initializer, so its default "General" is used. Salary has a normal set and is changed to 50000. Id and Name are init-only, so a "transfer" creates a new Employee object with Department = "Finance" instead of changing the existing one. The required keyword makes forgetting Id or Name a compile-time error.`,
    },
    {
      title: 'Change detection and a lazy getter',
      scenario: 'A product catalog logs real price changes only, and generates a product code the first time it is needed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SmartProperties',
        'Replace Program.cs with the code',
        'Press F9 inside the Code getter and run with F5 - the breakpoint is hit only once',
        'Press Ctrl+F5 to see the output',
      ],
      code: productProps,
      csharp: { files: { 'Program.cs': productProps }, stdin: '' },
      result: `Laptop: price 55000 -> 52000
Laptop: price 52000 -> 49999
Changes: 2
(generating code)
LAP-6
LAP-6`,
      explanation: `The second assignment of 52000 is ignored because the value did not change, so only 2 changes are counted. Code is generated on first read: "LAPTOP".Substring(0, 3) = "LAP" plus "-" plus the length 6. The second read returns the cached value without printing "(generating code)" again.`,
    },
  ],
  interview: [
    { q: 'What is a property in C#?', a: 'A class member that provides controlled access to a value through get and set (or init) accessors. It looks like a field to callers but runs code like a method.', level: 'Easy' },
    { q: 'What is the difference between a field and a property?', a: 'A field is a variable that stores data directly. A property is a pair of accessor methods that usually wrap a private field and can add validation, computation and different access levels.', level: 'Easy' },
    { q: 'What is the value keyword?', a: 'An implicit parameter inside a set or init accessor that holds the value being assigned.', level: 'Easy' },
    { q: 'How do you make a property read-only to the outside but writable inside the class?', a: 'Use an access modifier on the setter: public int Balance { get; private set; }.', level: 'Easy' },
    { q: 'What is an init accessor?', a: 'An accessor (C# 9) that allows assignment only during object construction - in a constructor or object initializer - making the property immutable afterwards.', level: 'Medium' },
    { q: 'What does the required modifier do?', a: 'C# 11: it forces callers to set that property in the object initializer (or via a constructor marked [SetsRequiredMembers]); otherwise compile error CS9035.', level: 'Medium' },
    { q: 'Can both get and set have access modifiers?', a: 'No. Only one accessor may have a modifier, and it must be more restrictive than the property\'s own accessibility.', level: 'Medium' },
    { q: 'What is a computed property?', a: 'A property without a backing field whose getter calculates the value from other members each time, e.g. public int Area => Width * Height;', level: 'Easy' },
    { q: 'Can properties be declared in an interface?', a: 'Yes, e.g. interface IShape { int Area { get; } }. Implementing classes must provide the accessors.', level: 'Medium' },
    { q: 'Can you pass a property as a ref or out argument?', a: 'No. A property is a pair of methods, not a storage location, so it cannot be passed by ref/out (error CS0206). Copy it to a local variable first.', level: 'Hard' },
    { q: 'What is the C# 14 field keyword?', a: 'Inside a property accessor, field refers to the compiler-generated backing field, letting you add logic (e.g. set => field = value.Trim();) without declaring the field. Available from C# 14 / .NET 10.', level: 'Hard' },
    { q: 'Output? class P { int _x; public int X { get => _x; set => _x = value < 0 ? 0 : value; } } var p = new P(); p.X = -5; p.X += 3; Console.Write(p.X);', a: 'It prints 3. -5 is stored as 0, then p.X += 3 reads 0 and sets 3.', level: 'Medium' },
    { q: 'Why should property getters be fast and side-effect free?', a: 'Callers (and the debugger, data binding, serializers) read properties often and expect field-like behaviour. Expensive or state-changing work belongs in a method.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a Student class with a Marks property (0-100). If a value outside the range is assigned, throw ArgumentOutOfRangeException. Add a read-only computed property Grade: A (>= 80), B (>= 60), C (>= 40), else F.',
      hint: 'Use a backing field _marks and a switch expression for Grade.',
      solution: `class Student
{
    private int _marks;
    public int Marks
    {
        get => _marks;
        set
        {
            if (value < 0 || value > 100) throw new ArgumentOutOfRangeException(nameof(value));
            _marks = value;
        }
    }
    public string Grade => _marks switch { >= 80 => "A", >= 60 => "B", >= 40 => "C", _ => "F" };
}

var s = new Student { Marks = 72 };
Console.WriteLine(s.Grade);   // B`,
    },
    {
      task: 'Create a Person class with FirstName and LastName (set) and a computed FullName. Also add an Age property with a private setter and a method HaveBirthday() that increments it.',
      hint: 'public int Age { get; private set; }',
      solution: `class Person
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string FullName => $"{FirstName} {LastName}";
    public int Age { get; private set; }
    public void HaveBirthday() => Age++;
}

var p = new Person { FirstName = "Ravi", LastName = "Kumar" };
p.HaveBirthday(); p.HaveBirthday();
Console.WriteLine($"{p.FullName} {p.Age}");   // Ravi Kumar 2`,
    },
    {
      task: 'Create a Book class where ISBN and Title are required and init-only, and Price can change. Show that changing Title is a compile error (in a comment) and print the book.',
      hint: 'public required string Isbn { get; init; }',
      solution: `class Book
{
    public required string Isbn { get; init; }
    public required string Title { get; init; }
    public int Price { get; set; }
}

var b = new Book { Isbn = "978-1", Title = "C# Basics", Price = 499 };
b.Price = 399;
// b.Title = "X";   // CS8852
Console.WriteLine($"{b.Isbn} {b.Title} {b.Price}");   // 978-1 C# Basics 399`,
    },
    {
      task: 'Create a Temperature class that stores Celsius and exposes Fahrenheit as a property with both get and set (set converts back to Celsius). Use integers: F = C * 9 / 5 + 32.',
      hint: 'set => _celsius = (value - 32) * 5 / 9;',
      solution: `class Temperature
{
    private int _celsius;
    public int Celsius { get => _celsius; set => _celsius = value; }
    public int Fahrenheit
    {
        get => _celsius * 9 / 5 + 32;
        set => _celsius = (value - 32) * 5 / 9;
    }
}

var t = new Temperature { Celsius = 100 };
Console.WriteLine(t.Fahrenheit);   // 212
t.Fahrenheit = 50;
Console.WriteLine(t.Celsius);      // 10`,
    },
  ],
  quiz: [
    {
      question: 'Inside a set accessor, which keyword refers to the value being assigned?',
      options: ['this', 'input', 'value', 'set'],
      answer: 2,
      explanation: 'value is the implicit parameter of set and init accessors.',
    },
    {
      question: 'Which declaration lets everyone read Balance but only the class change it?',
      options: ['public int Balance { get; private set; }', 'private int Balance { get; set; }', 'public int Balance { private get; set; }', 'public readonly int Balance { get; set; }'],
      answer: 0,
      explanation: 'A private setter restricts writing to the class while the getter stays public.',
    },
    {
      question: 'When can an init-only property be assigned?',
      options: ['Any time', 'Only inside static methods', 'Never', 'Only during object creation (constructor or object initializer)'],
      answer: 3,
      explanation: 'init allows assignment only while the object is being initialized.',
    },
    {
      question: 'What happens if you omit a required property in an object initializer?',
      options: ['It gets its default value silently', 'Compile-time error', 'Runtime NullReferenceException', 'A warning only'],
      answer: 1,
      explanation: 'Missing required members cause compile error CS9035.',
    },
    {
      question: 'public int Area => Width * Height; is an example of:',
      options: ['A write-only property', 'An auto-implemented property with a backing field', 'A computed read-only property', 'A static field'],
      answer: 2,
      explanation: 'An expression-bodied property with only a getter that computes its value on every read.',
    },
  ],
};
