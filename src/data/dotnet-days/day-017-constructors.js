export default {
  id: 'day-017-constructors',
  title: 'Constructors: Default and Parameterized Constructors',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 17,
  level: 'Beginner',
  duration: '2 hours',
  summary: `A constructor is the special method that runs automatically when an object is born. Learn the rules of constructors, the compiler-generated default constructor, explicit parameterless constructors, parameterized constructors, the order in which fields and constructors run, validation inside constructors and the modern C# 12 primary constructor and required members. Build an Employee class that is always created in a valid state.`,
  objectives: [
    'Explain what a constructor is and list its rules',
    'Differentiate the implicit (compiler-generated) default constructor from an explicit parameterless constructor',
    'Write parameterized constructors to initialise objects in one line',
    'Trace the execution order: field initializers first, then the constructor body',
    'Use constructors to validate data, and recognise primary constructors and required properties',
  ],
  theory: [
    {
      heading: 'What is a Constructor?',
      content: `A **constructor** is a special member of a class that is **called automatically when an object is created with new**. Its job is to **initialise** the new object - give its fields and properties their starting values.

Real-world analogy: when you buy a **new mobile phone** and switch it on for the first time, a setup wizard runs automatically: language, Wi-Fi, account. You do not call it yourself; it runs once, at the moment the phone "is born". That wizard is the constructor.

Another analogy: a **hospital birth registration** - the moment a baby is born, name, date of birth and weight are recorded. An Employee object, similarly, should get its Id, Name and Salary the moment it is created.

Diagram in words for: var e = new Employee(101, "Anita");
1. new allocates memory on the heap, all fields = default (0 / null).
2. Field initializers run (e.g. Salary = 15000).
3. The constructor body runs with id = 101, name = "Anita".
4. The reference of the ready object is stored in e.`,
      syntax: `class Employee
{
    public int Id;
    public string Name;

    // constructor: same name as class, NO return type (not even void)
    public Employee(int id, string name)
    {
        Id = id;
        Name = name;
    }
}

Employee e = new Employee(101, "Anita");   // constructor runs here`,
    },
    {
      heading: 'Rules of Constructors',
      points: [
        'The name must be exactly the same as the class name',
        'It has no return type, not even void (adding void turns it into a method with the class name, which is compile error CS0542)',
        'It is called automatically by new; you cannot call it like a normal method (e.Employee() is invalid)',
        'It runs only once per object',
        'A class can have many constructors with different parameter lists (constructor overloading - Day 18)',
        'Constructors are not inherited, and cannot be virtual, abstract or override',
        'Usually public; can also be private, protected or internal (private constructor - Day 18)',
        'Can contain any code: validation, logging, calling methods - but keep it light (no heavy database calls)',
      ],
      content: `Types of constructors in C# (interview list): **Default (parameterless)**, **Parameterized**, **Copy**, **Static** and **Private**. Today: default and parameterized. Day 18: overloading, copy, static and private.`,
    },
    {
      heading: 'Default Constructor (Implicit and Explicit)',
      content: `A **default constructor** takes **no parameters**.

**Implicit default constructor**: if you write NO constructor at all, the C# compiler silently adds a public parameterless constructor that does nothing except let the fields keep their default values (0, null, false). That is why new Student() worked on Day 16.

**Explicit parameterless constructor**: you write public Employee() { ... } yourself to give meaningful starting values (Name = "Not Assigned", Salary = 15000).

**Very important rule**: as soon as you write ANY constructor (for example a parameterized one), the compiler **stops** generating the implicit default constructor. Then new Employee() gives error **CS7036** ("There is no argument given that corresponds to the required parameter..."). If you still need it, write the parameterless constructor yourself.`,
      syntax: `class Department { public string? Name; }   // compiler adds: public Department() { }

class Employee
{
    public string Name;
    public Employee() { Name = "Not Assigned"; }   // explicit default constructor
}`,
      tip: `EF Core, JSON deserializers and model binding often need a parameterless constructor (or a constructor whose parameter names match the properties). Remember this when you reach Module 7 and 8.`,
    },
    {
      heading: 'Parameterized Constructor',
      content: `A **parameterized constructor** accepts arguments, so the caller must supply the important data at creation time. This guarantees that an object is **never half-filled**: you cannot forget to give an Employee an Id.

Compare:
- Without constructor: 5 lines (new, then 4 assignments) and you may forget one.
- With constructor: 1 line, and the compiler forces you to pass every argument.

A constructor is also the best place to **validate** input. If the data is bad, throw an exception (ArgumentException) and the object is never created. This is the principle "an object should always be in a valid state".`,
      syntax: `public Employee(int id, string name, int salary)
{
    if (string.IsNullOrWhiteSpace(name))
        throw new ArgumentException("Name is required");
    Id = id;
    Name = name;
    Salary = salary;
}`,
    },
    {
      heading: 'Order of Initialization',
      content: `When new runs, C# executes things in a fixed order (single class, no inheritance yet):
1. Memory is allocated and every field is set to its default value (0/null/false).
2. **Field initializers** run, in the order they are written in the class (private int A = 10;).
3. The **constructor body** runs.
4. If the caller used an **object initializer** { Name = "X" }, those property assignments run **after** the constructor.

So: defaults -> field initializers -> constructor -> object initializer. Interviewers love output questions on this order. With inheritance (Day 21-22) the parent constructor also comes into the picture.`,
    },
    {
      heading: 'Constructor vs Method, Primary Constructors and required',
      content: `**Constructor vs method**:
- Name: constructor = class name; method = any name.
- Return type: constructor has none; method must have one (or void).
- Call: constructor is called automatically by new, once; a method is called explicitly, any number of times.
- Inheritance: constructors are not inherited; public methods are.

**Primary constructor (C# 12, .NET 8+)**: parameters written right after the class name: class Employee(int id, string name) { ... }. The parameters are available in the whole class body - commonly used to initialise properties or for dependency injection in ASP.NET Core services.

**required members (C# 11)**: public required string Name { get; init; } forces the caller to set the property in the object initializer; forgetting it is a compile error (CS9035). It gives constructor-like safety with initializer syntax.`,
      syntax: `class Employee(int id, string name)          // primary constructor
{
    public int Id { get; } = id;
    public string Name { get; } = name;
}

class Person
{
    public required string FirstName { get; init; }
}
var p = new Person { FirstName = "Amit" };    // OK
// var q = new Person();                     // error CS9035`,
    },
  ],
  examples: [
    {
      title: 'Implicit vs Explicit Default Constructor',
      scenario: `A new employee joins before HR assigns an Id; the system creates the record with safe default values. We compare a class with an explicit parameterless constructor and a class where the compiler supplies one.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DefaultConstructorDemo, click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `Employee e1 = new Employee();      // calls our explicit default constructor
e1.Show();
Console.WriteLine("---");

Department d = new Department();   // calls the compiler-generated constructor
Console.WriteLine($"Department: {d.Name ?? "null"}, Floor: {d.Floor}");

class Employee
{
    public int Id;
    public string Name;
    public string Department;
    public int Salary;

    public Employee()                  // explicit default (parameterless) constructor
    {
        Console.WriteLine("Default constructor called");
        Id = 0;
        Name = "Not Assigned";
        Department = "Trainee";
        Salary = 15000;
    }

    public void Show() => Console.WriteLine($"{Id} | {Name} | {Department} | {Salary}");
}

class Department                       // no constructor written
{                                      // compiler adds: public Department() { }
    public string? Name;
    public int Floor;
}`,
      csharp: {
        files: {
          'Program.cs': `Employee e1 = new Employee();      // calls our explicit default constructor
e1.Show();
Console.WriteLine("---");

Department d = new Department();   // calls the compiler-generated constructor
Console.WriteLine($"Department: {d.Name ?? "null"}, Floor: {d.Floor}");

class Employee
{
    public int Id;
    public string Name;
    public string Department;
    public int Salary;

    public Employee()                  // explicit default (parameterless) constructor
    {
        Console.WriteLine("Default constructor called");
        Id = 0;
        Name = "Not Assigned";
        Department = "Trainee";
        Salary = 15000;
    }

    public void Show() => Console.WriteLine($"{Id} | {Name} | {Department} | {Salary}");
}

class Department                       // no constructor written
{                                      // compiler adds: public Department() { }
    public string? Name;
    public int Floor;
}`,
        },
        stdin: '',
      },
      result: `Default constructor called
0 | Not Assigned | Trainee | 15000
---
Department: null, Floor: 0`,
      explanation: `new Employee() runs our constructor, which prints a message and sets meaningful starting values. Department has no constructor, so the compiler generated an empty public one; its fields keep their default values null and 0.`,
    },
    {
      title: 'Employee Parameterized Constructor',
      scenario: `HR creates employees with all details in one line. The constructor forces Id, Name, Department and Salary to be supplied, and the properties are read-only from outside, so nobody can accidentally change an Id later.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it EmployeeConstructor, click Create',
        'Replace Program.cs with the code',
        'Place a breakpoint (F9) on "Id = id;" and press F5; press F11 on a new Employee(...) line to step into the constructor',
        'Stop with Shift+F5 and run with Ctrl+F5',
      ],
      code: `Employee e1 = new Employee(101, "Anita", "HR", 45000);
Employee e2 = new Employee(102, "Rahul", "IT", 60000);
Employee e3 = new Employee(103, "Farhan", "Sales", 38000);

e1.Show();
e2.Show();
e3.Show();
Console.WriteLine($"Annual salary of {e2.Name}: {e2.AnnualSalary()}");
e3.GiveRaise(2000);
e3.Show();

class Employee
{
    public int Id { get; }                   // read-only: set only in constructor
    public string Name { get; }
    public string Department { get; }
    public int Salary { get; private set; }  // changed only by class methods

    public Employee(int id, string name, string department, int salary)
    {
        Id = id;
        Name = name;
        Department = department;
        Salary = salary;
        Console.WriteLine($"Employee {Id} created");
    }

    public void Show() => Console.WriteLine($"{Id} | {Name} | {Department} | {Salary}");
    public int AnnualSalary() => Salary * 12;
    public void GiveRaise(int amount) => Salary += amount;
}`,
      csharp: {
        files: {
          'Program.cs': `Employee e1 = new Employee(101, "Anita", "HR", 45000);
Employee e2 = new Employee(102, "Rahul", "IT", 60000);
Employee e3 = new Employee(103, "Farhan", "Sales", 38000);

e1.Show();
e2.Show();
e3.Show();
Console.WriteLine($"Annual salary of {e2.Name}: {e2.AnnualSalary()}");
e3.GiveRaise(2000);
e3.Show();

class Employee
{
    public int Id { get; }                   // read-only: set only in constructor
    public string Name { get; }
    public string Department { get; }
    public int Salary { get; private set; }  // changed only by class methods

    public Employee(int id, string name, string department, int salary)
    {
        Id = id;
        Name = name;
        Department = department;
        Salary = salary;
        Console.WriteLine($"Employee {Id} created");
    }

    public void Show() => Console.WriteLine($"{Id} | {Name} | {Department} | {Salary}");
    public int AnnualSalary() => Salary * 12;
    public void GiveRaise(int amount) => Salary += amount;
}`,
        },
        stdin: '',
      },
      result: `Employee 101 created
Employee 102 created
Employee 103 created
101 | Anita | HR | 45000
102 | Rahul | IT | 60000
103 | Farhan | Sales | 38000
Annual salary of Rahul: 720000
103 | Farhan | Sales | 40000`,
      explanation: `Each new Employee(...) calls the constructor once, which is why "Employee N created" appears three times before any Show(). Get-only properties (Id, Name, Department) can be assigned only inside the constructor. 60000 * 12 = 720000. GiveRaise adds 2000 to Farhan: 38000 + 2000 = 40000. Writing new Employee() here would be error CS7036 because no parameterless constructor exists any more.`,
    },
    {
      title: 'Validation Inside the Constructor',
      scenario: `The company rule: every employee must have a name and a salary of at least 10000. If the constructor finds bad data it throws an exception, so an invalid Employee object can never exist.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ConstructorValidation, click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `TryCreate(1, "Sita", 30000);
TryCreate(2, "", 25000);
TryCreate(3, "Vikram", 5000);

static void TryCreate(int id, string name, int salary)
{
    try
    {
        Employee e = new Employee(id, name, salary);
        Console.WriteLine($"Created: {e.Id} {e.Name} {e.Salary}");
    }
    catch (ArgumentException ex)
    {
        Console.WriteLine($"Employee {id} rejected: {ex.Message}");
    }
}

class Employee
{
    public int Id { get; }
    public string Name { get; }
    public int Salary { get; }

    public Employee(int id, string name, int salary)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required");
        if (salary < 10000)
            throw new ArgumentException("Salary must be at least 10000");

        Id = id;
        Name = name;
        Salary = salary;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `TryCreate(1, "Sita", 30000);
TryCreate(2, "", 25000);
TryCreate(3, "Vikram", 5000);

static void TryCreate(int id, string name, int salary)
{
    try
    {
        Employee e = new Employee(id, name, salary);
        Console.WriteLine($"Created: {e.Id} {e.Name} {e.Salary}");
    }
    catch (ArgumentException ex)
    {
        Console.WriteLine($"Employee {id} rejected: {ex.Message}");
    }
}

class Employee
{
    public int Id { get; }
    public string Name { get; }
    public int Salary { get; }

    public Employee(int id, string name, int salary)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required");
        if (salary < 10000)
            throw new ArgumentException("Salary must be at least 10000");

        Id = id;
        Name = name;
        Salary = salary;
    }
}`,
        },
        stdin: '',
      },
      result: `Created: 1 Sita 30000
Employee 2 rejected: Name is required
Employee 3 rejected: Salary must be at least 10000`,
      explanation: `The first call passes both checks. The second has an empty name, so the constructor throws before assigning anything; the catch block prints the message and no object is stored. The third fails the salary rule. Exception handling is covered in depth on Day 31; for now remember: a constructor that throws means the object is never created.`,
    },
    {
      title: 'Order of Execution: Field Initializers, Constructor, Object Initializer',
      scenario: `A classic output-based interview question: in which order do field initializers, the constructor body and an object initializer run?`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it InitOrderDemo, click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and compare the output with your prediction',
      ],
      code: `Console.WriteLine("Creating object...");
Order o = new Order { Note = "Urgent" };
Console.WriteLine($"Object ready, Note = {o.Note}");

class Order
{
    private int A = Log("field A", 10);
    private int B = Log("field B", 20);

    private string _note = "";
    public string Note
    {
        get => _note;
        set { Console.WriteLine($"Object initializer sets Note = {value}"); _note = value; }
    }

    public Order()
    {
        Console.WriteLine($"Constructor body runs, A = {A}, B = {B}");
    }

    private static int Log(string name, int value)
    {
        Console.WriteLine($"Initializing {name}");
        return value;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `Console.WriteLine("Creating object...");
Order o = new Order { Note = "Urgent" };
Console.WriteLine($"Object ready, Note = {o.Note}");

class Order
{
    private int A = Log("field A", 10);
    private int B = Log("field B", 20);

    private string _note = "";
    public string Note
    {
        get => _note;
        set { Console.WriteLine($"Object initializer sets Note = {value}"); _note = value; }
    }

    public Order()
    {
        Console.WriteLine($"Constructor body runs, A = {A}, B = {B}");
    }

    private static int Log(string name, int value)
    {
        Console.WriteLine($"Initializing {name}");
        return value;
    }
}`,
        },
        stdin: '',
      },
      result: `Creating object...
Initializing field A
Initializing field B
Constructor body runs, A = 10, B = 20
Object initializer sets Note = Urgent
Object ready, Note = Urgent`,
      explanation: `Field initializers run first, top to bottom (A then B), so the constructor already sees A = 10 and B = 20. The object initializer { Note = "Urgent" } is just property assignments that run after the constructor finishes. Order: defaults -> field initializers -> constructor body -> object initializer.`,
    },
    {
      title: 'Modern C#: Primary Constructor and required Properties',
      scenario: `In .NET 8+ code (and in ASP.NET Core services) you will see primary constructors and required properties. We create an Employee with a primary constructor and a Person whose names are required.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ModernConstructors, choose .NET 8 or later (C# 12+), click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Try writing var x = new Person(); and see error CS9035 in the Error List (Ctrl+\\, E)',
      ],
      code: `var e = new Employee(201, "Divya", 52000);
Console.WriteLine(e.Describe());

var p = new Person { FirstName = "Amit", LastName = "Shah" };
Console.WriteLine(p.FullName);
// var bad = new Person();   // error CS9035: required member 'FirstName' must be set

class Employee(int id, string name, int salary)   // primary constructor
{
    public int Id { get; } = id;
    public string Name { get; } = name;
    public int Salary { get; } = salary;
    public string Describe() => $"{Id}: {Name} earns {Salary}";
}

class Person
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public string FullName => $"{FirstName} {LastName}";
}`,
      csharp: {
        files: {
          'Program.cs': `var e = new Employee(201, "Divya", 52000);
Console.WriteLine(e.Describe());

var p = new Person { FirstName = "Amit", LastName = "Shah" };
Console.WriteLine(p.FullName);
// var bad = new Person();   // error CS9035: required member 'FirstName' must be set

class Employee(int id, string name, int salary)   // primary constructor
{
    public int Id { get; } = id;
    public string Name { get; } = name;
    public int Salary { get; } = salary;
    public string Describe() => $"{Id}: {Name} earns {Salary}";
}

class Person
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public string FullName => $"{FirstName} {LastName}";
}`,
        },
        stdin: '',
      },
      result: `201: Divya earns 52000
Amit Shah`,
      explanation: `The primary constructor parameters id, name and salary are used to initialise the get-only properties. Person has no constructor, but required + init means the compiler forces callers to set both names in the object initializer, so a Person can never exist without them.`,
    },
  ],
  interview: [
    { q: `What is a constructor in C#?`, a: `A special method with the same name as the class and no return type, called automatically when an object is created with new. It initialises the object's fields and properties and runs once per object.`, level: 'Easy' },
    { q: `What are the types of constructors in C#?`, a: `Default (parameterless), parameterized, copy, static and private constructors. (C# 12 also adds primary constructors as a syntax form.)`, level: 'Easy' },
    { q: `What is a default constructor? When does the compiler provide one?`, a: `A constructor with no parameters. The compiler generates a public parameterless constructor only when the class declares no constructor at all. It leaves fields at default values (after running field initializers).`, level: 'Easy' },
    { q: `If a class has only a parameterized constructor, can we write new ClassName()?`, a: `No. Once you declare any constructor, the compiler no longer generates the default one, so new ClassName() gives error CS7036. You must add an explicit parameterless constructor if you need it.`, level: 'Medium' },
    { q: `Can a constructor have a return type? What happens if you write public void Employee() { }?`, a: `No. If you add void, it is no longer a constructor; it becomes an ordinary method named Employee. (The compiler actually reports CS0542 "member names cannot be the same as their enclosing type" for a method with the class name.)`, level: 'Medium' },
    { q: `Can constructors be inherited or overridden?`, a: `No. Constructors are not inherited and cannot be virtual, abstract or override. A child class can call a parent constructor using base(...) (Day 22).`, level: 'Medium' },
    { q: `What is the order of execution when creating an object?`, a: `Memory is allocated and fields zeroed, field initializers run in declaration order, then the constructor body runs, then any object initializer assignments run. With inheritance: derived field initializers, base field initializers, base constructor body, derived constructor body.`, level: 'Hard' },
    { q: `What is the difference between a constructor and a method?`, a: `A constructor has the class name, no return type, is called automatically and only once by new, and is not inherited. A method has any name, a return type or void, is called explicitly any number of times, and public methods are inherited.`, level: 'Easy' },
    { q: `Why validate inside a constructor?`, a: `To guarantee that an object is always in a valid state. If the input is invalid, throwing an exception (ArgumentException, ArgumentNullException) prevents the object from being created at all, so the rest of the code never sees a half-valid object.`, level: 'Medium' },
    { q: `Can we call a constructor explicitly like a method?`, a: `No, e.Employee() is not allowed. Constructors are invoked only through new, through this(...) / base(...) constructor chaining, or indirectly via reflection/Activator.`, level: 'Easy' },
    { q: `What is a primary constructor in C# 12?`, a: `Parameters declared directly after the class name, e.g. class Employee(int id, string name). They are in scope in the whole class body and are typically used to initialise properties or capture injected services. Unlike records, plain class primary constructors do not create public properties automatically.`, level: 'Medium' },
    { q: `What does the required modifier do?`, a: `required on a property or field forces the caller to set it in the object initializer (or through a constructor marked with SetsRequiredMembers). Forgetting it is compile error CS9035. It works well with init accessors to create safe immutable objects without long constructors.`, level: 'Medium' },
  ],
  practice: [
    { task: `Create a BankAccount class with a parameterized constructor (accountNo, holder, openingBalance) and a Show() method. Create two accounts.`, hint: `Use get-only properties AccountNo and Holder and assign them in the constructor.`, solution: `var a1 = new BankAccount(5001, "Nikhil", 2000);
var a2 = new BankAccount(5002, "Pooja", 7500);
a1.Show();
a2.Show();

class BankAccount
{
    public int AccountNo { get; }
    public string Holder { get; }
    public int Balance { get; private set; }

    public BankAccount(int accountNo, string holder, int openingBalance)
    {
        AccountNo = accountNo;
        Holder = holder;
        Balance = openingBalance;
    }
    public void Show() => Console.WriteLine($"{AccountNo} - {Holder} - {Balance}");
}
// Output:
// 5001 - Nikhil - 2000
// 5002 - Pooja - 7500` },
    { task: `Create a Student class with a default constructor that sets Name = "Unknown" and Course = "Not Enrolled". Create an object and print it.`, hint: `public Student() { Name = "Unknown"; Course = "Not Enrolled"; }`, solution: `var s = new Student();
Console.WriteLine($"{s.Name} - {s.Course}");

class Student
{
    public string Name { get; set; }
    public string Course { get; set; }
    public Student()
    {
        Name = "Unknown";
        Course = "Not Enrolled";
    }
}
// Output: Unknown - Not Enrolled` },
    { task: `Create a Circle class whose constructor throws ArgumentException when the radius is 0 or negative. Catch the exception for radius -3 and print the message.`, hint: `if (radius <= 0) throw new ArgumentException("Radius must be positive");`, solution: `try
{
    var c1 = new Circle(2);
    Console.WriteLine($"Diameter: {c1.Diameter}");
    var c2 = new Circle(-3);
}
catch (ArgumentException ex)
{
    Console.WriteLine(ex.Message);
}

class Circle
{
    public int Radius { get; }
    public int Diameter => Radius * 2;
    public Circle(int radius)
    {
        if (radius <= 0) throw new ArgumentException("Radius must be positive");
        Radius = radius;
    }
}
// Output:
// Diameter: 4
// Radius must be positive` },
    { task: `Predict the output, then run it: a class Box with field int W = Print(1); and constructor that prints "ctor" and an object initializer that sets a property H which prints "H set".`, hint: `Order: field initializer, constructor body, object initializer.`, solution: `var b = new Box { H = 5 };

class Box
{
    int W = Print(1);
    int _h;
    public int H { get => _h; set { Console.WriteLine("H set"); _h = value; } }
    public Box() => Console.WriteLine("ctor");
    static int Print(int x) { Console.WriteLine("field init"); return x; }
}
// Output:
// field init
// ctor
// H set` },
    { task: `Rewrite the Employee class (Id, Name, Salary) using a C# 12 primary constructor and add a method YearlyBonus() returning 10 percent of yearly salary (integer).`, hint: `Salary * 12 / 10`, solution: `var e = new Employee(7, "Leena", 40000);
Console.WriteLine($"{e.Name} bonus: {e.YearlyBonus()}");

class Employee(int id, string name, int salary)
{
    public int Id { get; } = id;
    public string Name { get; } = name;
    public int Salary { get; } = salary;
    public int YearlyBonus() => Salary * 12 / 10;
}
// Output: Leena bonus: 48000` },
  ],
  quiz: [
    { question: `Which of these is a valid constructor for class Product?`, options: [`public void Product() { }`, `public Product() { }`, `public int Product() { return 0; }`, `Product public() { }`], answer: 1, explanation: `A constructor has the class name and no return type at all.` },
    { question: `A class declares only public Car(string model). What does new Car() produce?`, options: [`An object with model = null`, `A runtime exception`, `Compile error CS7036`, `An object with model = ""`], answer: 2, explanation: `Declaring any constructor removes the compiler-generated default constructor, so a call without arguments does not compile.` },
    { question: `What runs FIRST when new Order { Note = "X" } executes?`, options: [`The object initializer`, `The constructor body`, `Field initializers`, `The Note getter`], answer: 2, explanation: `Field initializers run before the constructor body, and the object initializer runs last.` },
    { question: `How many times does a constructor run for a single object?`, options: [`Every time a method is called`, `Twice`, `Zero or one, depending on fields`, `Exactly once`], answer: 3, explanation: `The constructor runs once, at the moment the object is created.` },
    { question: `Which feature forces the caller to set a property in an object initializer?`, options: [`required`, `readonly`, `static`, `virtual`], answer: 0, explanation: `required members must be initialised at creation; otherwise compile error CS9035.` },
  ],
};
