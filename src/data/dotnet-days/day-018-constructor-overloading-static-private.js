const overloadCode = `// Day 18 - Example 1: Constructor overloading - many ways to create an Employee
Employee e1 = new Employee();
Employee e2 = new Employee(101, "Anita");
Employee e3 = new Employee(102, "Rahul", "IT");
Employee e4 = new Employee(103, "Farhan", "Sales", 52000);

Console.WriteLine("--- Employee list ---");
e1.Show();
e2.Show();
e3.Show();
e4.Show();

class Employee
{
    public int Id { get; }
    public string Name { get; }
    public string Department { get; }
    public int Salary { get; }

    // 1. no parameters
    public Employee()
    {
        Id = 0;
        Name = "Not Assigned";
        Department = "Trainee";
        Salary = 15000;
        Console.WriteLine("Constructor 1: no parameters");
    }

    // 2. id + name
    public Employee(int id, string name)
    {
        Id = id;
        Name = name;
        Department = "General";
        Salary = 25000;
        Console.WriteLine("Constructor 2: id, name");
    }

    // 3. id + name + department
    public Employee(int id, string name, string department)
    {
        Id = id;
        Name = name;
        Department = department;
        Salary = 30000;
        Console.WriteLine("Constructor 3: id, name, department");
    }

    // 4. all details
    public Employee(int id, string name, string department, int salary)
    {
        Id = id;
        Name = name;
        Department = department;
        Salary = salary;
        Console.WriteLine("Constructor 4: all details");
    }

    public void Show() => Console.WriteLine($"{Id} | {Name} | {Department} | {Salary}");
}`;

const chainCode = `// Day 18 - Example 2: Constructor chaining with this(...) - no duplicate code
var a = new Employee(201, "Kiran");
Console.WriteLine("---");
var b = new Employee(202, "Meera", "HR", 48000);
Console.WriteLine("---");
a.Show();
b.Show();

class Employee
{
    public int Id { get; }
    public string Name { get; }
    public string Department { get; }
    public int Salary { get; }

    // calls the 3-parameter constructor first
    public Employee(int id, string name) : this(id, name, "General")
    {
        Console.WriteLine("Body of (id, name)");
    }

    // calls the 4-parameter (master) constructor first
    public Employee(int id, string name, string department) : this(id, name, department, 25000)
    {
        Console.WriteLine("Body of (id, name, department)");
    }

    // master constructor: the ONLY place that assigns fields
    public Employee(int id, string name, string department, int salary)
    {
        Id = id;
        Name = name;
        Department = department;
        Salary = salary;
        Console.WriteLine("Body of master constructor (4 params)");
    }

    public void Show() => Console.WriteLine($"{Id} | {Name} | {Department} | {Salary}");
}`;

const staticCtorCode = `// Day 18 - Example 3: Static constructor runs ONCE, before the class is first used
Console.WriteLine("Program started");
Console.WriteLine($"Company: {Employee.CompanyName}");

var e1 = new Employee("Asha");
var e2 = new Employee("Ravi");
var e3 = new Employee("Imran");

Console.WriteLine($"Total employees: {Employee.Count}");

class Employee
{
    public static string CompanyName = "";
    public static int Count;
    public string Name;

    // static constructor: no access modifier, no parameters, called by the CLR
    static Employee()
    {
        CompanyName = "TechSoft Pvt Ltd";
        Console.WriteLine("Static constructor: runs only once");
    }

    // instance constructor: runs for every new object
    public Employee(string name)
    {
        Name = name;
        Count++;
        Console.WriteLine($"Instance constructor: {Name} is employee #{Count}");
    }
}`;

const privateCtorCode = `// Day 18 - Example 4: Private constructor - Singleton and utility class
Console.WriteLine("Start");
AppConfig c1 = AppConfig.Instance;
AppConfig c2 = AppConfig.Instance;

Console.WriteLine($"App: {c1.AppName}, Version: {c1.Version}");
Console.WriteLine($"Same object? {ReferenceEquals(c1, c2)}");
Console.WriteLine($"Objects created: {AppConfig.CreatedCount}");

// AppConfig c3 = new AppConfig();   // error CS0122: 'AppConfig.AppConfig()' is inaccessible due to its protection level
// TaxHelper t = new TaxHelper();    // error CS0122 as well

Console.WriteLine($"Tax on 50000: {TaxHelper.CalculateTax(50000)}");

sealed class AppConfig
{
    private static AppConfig? _instance;
    public static int CreatedCount { get; private set; }

    public string AppName { get; }
    public int Version { get; }

    private AppConfig()                 // nobody outside can call new AppConfig()
    {
        AppName = "HR Portal";
        Version = 3;
        CreatedCount++;
        Console.WriteLine("AppConfig object created");
    }

    public static AppConfig Instance     // the only door to get the object
    {
        get
        {
            if (_instance == null)
                _instance = new AppConfig();
            return _instance;
        }
    }
}

class TaxHelper
{
    private TaxHelper() { }              // stop people creating useless objects
    public static int CalculateTax(int salary) => salary * 10 / 100;
}`;

const copyCtorCode = `// Day 18 - Example 5: Copy constructor vs copying a reference
var original = new Employee(301, "Divya", 40000);
var copy = new Employee(original);      // copy constructor: a NEW object
copy.Salary = 45000;

Console.WriteLine($"Original: {original.Name} {original.Salary}");
Console.WriteLine($"Copy: {copy.Name} {copy.Salary}");

var sameRef = original;                 // NOT a copy: same object, two names
sameRef.Salary = 99999;
Console.WriteLine($"Original after sameRef change: {original.Salary}");

class Employee
{
    public int Id { get; }
    public string Name { get; }
    public int Salary { get; set; }

    public Employee(int id, string name, int salary)
    {
        Id = id;
        Name = name;
        Salary = salary;
    }

    // copy constructor: takes an object of the same class
    public Employee(Employee other)
    {
        Id = other.Id;
        Name = other.Name;
        Salary = other.Salary;
    }
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App',
  `Name it ${name}, choose .NET 8 or .NET 10, click Create`,
  'Replace Program.cs with the code',
  'Press Ctrl+F5 to run without debugging',
];

export default {
  id: 'day-018-constructor-overloading-static-private',
  title: 'Constructor Overloading, Static Constructor and Private Constructor',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 18,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Real applications create the same kind of object in different ways. Today you learn constructor overloading (many constructors in one class), constructor chaining with this(...) to avoid duplicate code, the copy constructor, the static constructor that runs only once per class, and the private constructor that stops outsiders from using new (the basis of the Singleton pattern). We create multiple employee objects in different ways and trace exactly which constructor runs and when.`,
  objectives: [
    'Write several overloaded constructors and predict which one new will call',
    'Remove duplicate initialisation code using constructor chaining with this(...)',
    'Explain when and how many times a static constructor runs, and its rules',
    'Use a private constructor to build a Singleton and a utility class',
    'Write a copy constructor and explain how it differs from copying a reference',
  ],
  theory: [
    {
      heading: 'Constructor Overloading',
      content: `**Constructor overloading** means a class has **more than one constructor**, each with a **different parameter list** (different number, type or order of parameters). The compiler picks the right one by looking at the arguments you pass to new. It is method overloading (Day 14) applied to constructors.

Real-world analogy: opening a **bank account**. You can open it with only your name (zero balance), with name + opening deposit, or with name + deposit + nominee. Same "account" is created, but the form you fill is different. Each form is one constructor.

Another analogy: ordering **tea** at a stall: "one tea" (default sugar and milk), "one tea, less sugar", "one tea, less sugar, no milk". The stall owner (compiler) knows what to make from how many details you gave.

Why overload?
- Callers that know little can still create a valid object (sensible defaults are filled in).
- Callers that know everything can set it in one line.
- The object is never half-initialised.`,
      syntax: `class Employee
{
    public Employee() { ... }                                   // 0 params
    public Employee(int id, string name) { ... }                 // 2 params
    public Employee(int id, string name, string dept) { ... }    // 3 params
}

new Employee();                    // calls the 0-param version
new Employee(101, "Anita");        // calls the 2-param version
new Employee(102, "Rahul", "IT");  // calls the 3-param version`,
      points: [
        'Overloads must differ in the number, type or order of parameters (the "signature")',
        'Parameter names alone do not make a different signature: (int id) and (int code) clash - error CS0111',
        'Constructors have no return type, so "differ by return type" is not even possible',
        'Optional parameters can reduce the number of overloads, but overloads are clearer when the logic is different',
      ],
    },
    {
      heading: 'Constructor Chaining with this(...) and the Copy Constructor',
      content: `When you have 3-4 overloaded constructors, you often copy the same assignment lines into each. That is duplicate code: if a rule changes (for example "Name must be trimmed") you must fix it in four places.

**Constructor chaining** solves this. One "master" constructor does the real work, and the others call it with this(...) placed **after the parameter list and before the body**. The called constructor runs **first**, then the body of the calling constructor.

Execution order for new Employee(201, "Kiran") in Example 2:
1. (id, name) is selected, but it says : this(id, name, "General") so that runs first.
2. (id, name, department) says : this(..., 25000) so the master runs first.
3. Master body runs, then the 3-param body, then the 2-param body.

**Copy constructor**: a constructor that takes an object of the **same class** and copies its values into the new object. C# does not generate one automatically (C++ does); you write it yourself. Use it when you want an independent duplicate. Remember: var b = a; does NOT copy an object; it copies the reference, so both variables point to the same object.`,
      syntax: `public Employee(int id, string name) : this(id, name, "General") { }
public Employee(int id, string name, string dept) : this(id, name, dept, 25000) { }
public Employee(int id, string name, string dept, int salary) { /* real work */ }

// copy constructor
public Employee(Employee other) : this(other.Id, other.Name, other.Department, other.Salary) { }`,
      tip: `this(...) calls a constructor of the SAME class; base(...) calls a constructor of the PARENT class (Day 22). A constructor can use only one of them, and it must be in the constructor header, never inside the body.`,
    },
    {
      heading: 'Static Constructor',
      content: `A **static constructor** initialises the **static data of a class** (data shared by all objects - Day 19 goes deeper). It is written with the static keyword and **runs only once**, automatically, **before the class is used for the first time** - that is, just before the first object is created or the first static member is accessed.

Real-world analogy: a **school** sets up its building, name board and principal **once** when it opens. After that, students (objects) join every year. The one-time setup is the static constructor; admitting each student is the instance constructor.

Another analogy: a **restaurant** switches on gas, lights and loads the menu once in the morning (static constructor). Each customer order (instance constructor) happens many times.

Typical uses: load configuration once, set a company name, create a shared logger, fill a lookup table, read a connection string.`,
      syntax: `class Employee
{
    public static string CompanyName;
    static Employee()                // no access modifier, no parameters
    {
        CompanyName = "TechSoft Pvt Ltd";
    }
}`,
      points: [
        'Declared with static, the class name, and NO access modifier (public static Employee() is error CS0515)',
        'Cannot have parameters, so it cannot be overloaded - only one per class',
        'Cannot be called directly; the CLR calls it automatically, exactly once per type (per AppDomain/process)',
        'Runs before the first instance constructor and before the first static member access',
        'Can access only static members (there is no object yet, so no this)',
        'A class can have both a static constructor and a parameterless instance constructor - they do not clash',
        'If it throws, the type becomes unusable and every later use throws TypeInitializationException',
      ],
    },
    {
      heading: 'Private Constructor',
      content: `A **private constructor** can be called **only from inside the class itself**. Code outside cannot write new ClassName() - it gets error **CS0122** ("inaccessible due to its protection level").

Real-world analogy: a country has **only one Prime Minister** at a time. You cannot "create" a new PM yourself; you get the existing one through the official office. The class with a private constructor controls how many objects exist and hands them out through a static property.

Uses of a private constructor:
1. **Singleton pattern** - guarantee only ONE object exists (app settings, logger, cache). The class keeps one static instance and exposes it through a static Instance property.
2. **Utility / helper classes** that contain only static methods (like Math). A private constructor stops people creating pointless objects. (Today we would usually write a static class instead, which does this automatically.)
3. **Factory methods** - object creation only through a static method such as Employee.CreateIntern("Asha"), so the class can validate or cache.
4. **Prevent inheritance from outside** - a child class must call a parent constructor; if the only constructor is private, no outside class can inherit (nested classes still can).`,
      syntax: `sealed class AppConfig
{
    private static AppConfig? _instance;
    private AppConfig() { }                        // outsiders cannot use new
    public static AppConfig Instance => _instance ??= new AppConfig();
}`,
      tip: `The simple Singleton shown today is not thread-safe. In real ASP.NET Core apps you register a service as Singleton in dependency injection (Day 72) or use Lazy<T> - both are thread-safe.`,
    },
    {
      heading: 'Static Class vs Private Constructor vs Normal Class',
      content: `Quick comparison for interviews:

- **Normal class**: public constructor, many objects, instance + static members.
- **Class with private constructor**: object creation controlled from inside; can still have instance members and one or many objects (Singleton = exactly one); can be a parent of nested classes.
- **Static class**: static class Helper { } - cannot be instantiated at all, cannot be inherited (it is sealed and abstract internally), can contain ONLY static members, and cannot have instance constructors (a static constructor is allowed).

Rule of thumb: only static helper methods? use a **static class**. Need exactly one object that may implement an interface? use a **Singleton** (private constructor). Normal business entity (Employee, Student)? **public constructors**, often overloaded.`,
      points: [
        'Instance constructor: runs every time new is used',
        'Static constructor: runs once per type, automatically',
        'Private constructor: runs only when the class itself calls new',
        'Copy constructor: creates a new object from an existing one of the same class',
      ],
    },
  ],
  examples: [
    {
      title: 'Multiple Employee Objects with Overloaded Constructors',
      scenario: `HR creates employees in four different ways: a placeholder record, a record with only Id and Name, one with the department, and one with full details. Each new line chooses a different constructor based on the arguments.`,
      steps: steps('ConstructorOverloading'),
      code: overloadCode,
      csharp: { files: { 'Program.cs': overloadCode }, stdin: '' },
      result: `Constructor 1: no parameters
Constructor 2: id, name
Constructor 3: id, name, department
Constructor 4: all details
--- Employee list ---
0 | Not Assigned | Trainee | 15000
101 | Anita | General | 25000
102 | Rahul | IT | 30000
103 | Farhan | Sales | 52000`,
      explanation: `The compiler matches the argument list: no arguments -> constructor 1, (int, string) -> constructor 2, (int, string, string) -> constructor 3, (int, string, string, int) -> constructor 4. Each prints its message the moment the object is created, so all four messages appear before the list. Notice the duplicated assignment lines - Example 2 removes them.`,
    },
    {
      title: 'Constructor Chaining with this(...)',
      scenario: `The same Employee class, but now every constructor forwards to one master constructor. We print a line in every body to see the exact execution order.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ConstructorChaining, click Create',
        'Replace Program.cs with the code',
        'Put a breakpoint (F9) on the first line, press F5, then press F11 repeatedly to step into each constructor and watch the order',
        'Stop with Shift+F5 and run with Ctrl+F5 to see the full output',
      ],
      code: chainCode,
      csharp: { files: { 'Program.cs': chainCode }, stdin: '' },
      result: `Body of master constructor (4 params)
Body of (id, name, department)
Body of (id, name)
---
Body of master constructor (4 params)
---
201 | Kiran | General | 25000
202 | Meera | HR | 48000`,
      explanation: `new Employee(201, "Kiran") selects the 2-param constructor, but its : this(...) call runs first, which itself first runs the master. So bodies execute from the innermost (master) outwards. For b, the master constructor is called directly, so only one line prints. Assignments now live in ONE place.`,
    },
    {
      title: 'Static Constructor - One-Time Company Setup',
      scenario: `Every employee belongs to the same company. The company name is loaded once by a static constructor, and a static counter counts how many employee objects are created.`,
      steps: steps('StaticConstructorDemo'),
      code: staticCtorCode,
      csharp: { files: { 'Program.cs': staticCtorCode }, stdin: '' },
      result: `Program started
Static constructor: runs only once
Company: TechSoft Pvt Ltd
Instance constructor: Asha is employee #1
Instance constructor: Ravi is employee #2
Instance constructor: Imran is employee #3
Total employees: 3`,
      explanation: `"Program started" prints first because the class has not been touched yet. Building the second message reads Employee.CompanyName - the first use of the class - so the CLR runs the static constructor before the value is read; that is why its message appears BEFORE "Company: ...". Creating three objects runs the instance constructor three times, but the static constructor never runs again.`,
    },
    {
      title: 'Private Constructor - Singleton AppConfig and TaxHelper',
      scenario: `An HR portal must have exactly one configuration object, and a tax helper class that only has static methods. Both use a private constructor so nobody outside can call new.`,
      steps: steps('PrivateConstructorDemo'),
      code: privateCtorCode,
      csharp: { files: { 'Program.cs': privateCtorCode }, stdin: '' },
      result: `Start
AppConfig object created
App: HR Portal, Version: 3
Same object? True
Objects created: 1
Tax on 50000: 5000`,
      explanation: `The first AppConfig.Instance finds _instance null and calls the private constructor (allowed, because the call is inside the class). The second call returns the stored object, so the constructor message prints only once, ReferenceEquals is True and CreatedCount is 1. Uncommenting either new line gives CS0122. 50000 * 10 / 100 = 5000.`,
    },
    {
      title: 'Copy Constructor vs Reference Copy',
      scenario: `HR wants to prepare a revised salary proposal for Divya without touching her real record. A copy constructor gives an independent object; a plain assignment does not.`,
      steps: steps('CopyConstructorDemo'),
      code: copyCtorCode,
      csharp: { files: { 'Program.cs': copyCtorCode }, stdin: '' },
      result: `Original: Divya 40000
Copy: Divya 45000
Original after sameRef change: 99999`,
      explanation: `new Employee(original) creates a second object on the heap, so changing copy.Salary leaves original at 40000. var sameRef = original copies only the reference (both variables point to the same object), so setting sameRef.Salary changes original too.`,
    },
  ],
  interview: [
    { q: `What is constructor overloading?`, a: `Defining more than one constructor in the same class with different parameter lists (number, type or order). The compiler chooses which one to call based on the arguments passed to new. It lets callers create objects in different valid ways.`, level: 'Easy' },
    { q: `Can two constructors differ only by parameter names, for example Employee(int id) and Employee(int code)?`, a: `No. Parameter names are not part of the signature. Both have the signature (int), so the compiler reports CS0111 "Type already defines a member with the same parameter types".`, level: 'Easy' },
    { q: `What is constructor chaining? In which order do the bodies run?`, a: `Calling one constructor from another using : this(...) (same class) or : base(...) (parent class) in the constructor header. The called constructor runs first, then the body of the calling one. In a chain A -> B -> C, the body of C runs first, then B, then A.`, level: 'Medium' },
    { q: `What is a static constructor and when is it called?`, a: `A constructor marked static that initialises static members. The CLR calls it automatically exactly once per type, just before the first instance is created or the first static member is accessed. You can never call it yourself.`, level: 'Easy' },
    { q: `List the rules of a static constructor.`, a: `No access modifier, no parameters (so no overloading - only one per class), cannot be called explicitly, runs once, can access only static members, and a class may have it together with a parameterless instance constructor. Static classes can also have one.`, level: 'Medium' },
    { q: `What happens if a static constructor throws an exception?`, a: `The CLR wraps it in a TypeInitializationException, and the type remains unusable for the life of the process: every later attempt to use that class throws TypeInitializationException again. That is why static constructors should be simple and safe.`, level: 'Hard' },
    { q: `Predict the output: class A { static A() { Console.Write("S "); } public A() { Console.Write("I "); } }  then  new A(); new A();`, a: `S I I  - the static constructor runs once before the first object; the instance constructor runs once per object.`, level: 'Medium' },
    { q: `What is a private constructor? Give its uses.`, a: `A constructor that can only be called from inside its own class. Uses: Singleton pattern (only one object), utility classes with only static members, factory methods that control creation, and preventing outside classes from inheriting (a derived class must be able to call a base constructor).`, level: 'Easy' },
    { q: `Can a class with only a private constructor be inherited?`, a: `Not by an outside class - the derived constructor must call a base constructor and the private one is inaccessible (error CS0122). A nested class declared inside it CAN inherit from it, because nested classes can access private members of the containing class.`, level: 'Hard' },
    { q: `Difference between a static class and a class with a private constructor?`, a: `A static class cannot be instantiated at all, cannot be inherited and may contain only static members. A class with a private constructor can still create objects from inside (e.g., one Singleton instance), can have instance members, can implement interfaces and can be inherited by nested classes.`, level: 'Medium' },
    { q: `Does C# provide a copy constructor automatically? How is it different from b = a?`, a: `No, you must write it yourself (records generate a protected copy constructor used by with-expressions, but classes do not). A copy constructor creates a new, independent object. b = a only copies the reference, so both variables point to the same object and a change through one is visible through the other.`, level: 'Medium' },
    { q: `How do you implement a simple Singleton and is it thread-safe?`, a: `Make the constructor private, keep a private static field for the single instance and expose it via a public static property that creates it if null. The simple null-check version is NOT thread-safe; use private static readonly Lazy<T> or a static readonly field initialiser, or register the service as AddSingleton in ASP.NET Core DI.`, level: 'Hard' },
  ],
  practice: [
    { task: `Create a Product class with three overloaded constructors: (), (name), (name, price). Defaults: name "Unknown", price 0. Create three objects and print them.`, hint: `Chain the shorter constructors to the full one with this(...).`, solution: `var p1 = new Product();
var p2 = new Product("Pen");
var p3 = new Product("Bag", 799);
p1.Show(); p2.Show(); p3.Show();

class Product
{
    public string Name { get; }
    public int Price { get; }
    public Product() : this("Unknown") { }
    public Product(string name) : this(name, 0) { }
    public Product(string name, int price) { Name = name; Price = price; }
    public void Show() => Console.WriteLine($"{Name} - {Price}");
}
// Output:
// Unknown - 0
// Pen - 0
// Bag - 799` },
    { task: `Create a Student class with a static constructor that sets a static CollegeName and prints "College loaded". Create 3 students and show that the message prints only once.`, hint: `static Student() { CollegeName = "..."; Console.WriteLine("College loaded"); }`, solution: `new Student("Asha"); new Student("Ravi"); new Student("Neha");

class Student
{
    public static string CollegeName = "";
    public string Name;
    static Student()
    {
        CollegeName = "City Engineering College";
        Console.WriteLine("College loaded");
    }
    public Student(string name)
    {
        Name = name;
        Console.WriteLine($"{Name} joined {CollegeName}");
    }
}
// Output:
// College loaded
// Asha joined City Engineering College
// Ravi joined City Engineering College
// Neha joined City Engineering College` },
    { task: `Build a Singleton Logger class with a private constructor, a static Instance property and a Log(string) method that prints the message with a running line number. Call Logger.Instance.Log three times.`, hint: `Keep the line counter as an instance field - there is only one instance anyway.`, solution: `Logger.Instance.Log("App started");
Logger.Instance.Log("User logged in");
Logger.Instance.Log("App closed");

sealed class Logger
{
    private static Logger? _instance;
    private int line;
    private Logger() { }
    public static Logger Instance => _instance ??= new Logger();
    public void Log(string msg) => Console.WriteLine($"[{++line}] {msg}");
}
// Output:
// [1] App started
// [2] User logged in
// [3] App closed` },
    { task: `Write a copy constructor for a Student class (Name, Marks). Copy a student, change the copy's marks, and print both to prove they are independent.`, hint: `public Student(Student other) { Name = other.Name; Marks = other.Marks; }`, solution: `var s1 = new Student("Kavya", 80);
var s2 = new Student(s1);
s2.Marks = 95;
Console.WriteLine($"{s1.Name}: {s1.Marks}");
Console.WriteLine($"{s2.Name}: {s2.Marks}");

class Student
{
    public string Name { get; }
    public int Marks { get; set; }
    public Student(string name, int marks) { Name = name; Marks = marks; }
    public Student(Student other) { Name = other.Name; Marks = other.Marks; }
}
// Output:
// Kavya: 80
// Kavya: 95` },
    { task: `Create an Employee class with a private constructor and two static factory methods: CreateIntern(name) (salary 15000) and CreatePermanent(name, salary). Print both employees.`, hint: `public static Employee CreateIntern(string name) => new Employee(name, "Intern", 15000);`, solution: `var a = Employee.CreateIntern("Asha");
var b = Employee.CreatePermanent("Ravi", 55000);
a.Show(); b.Show();

class Employee
{
    public string Name { get; }
    public string Type { get; }
    public int Salary { get; }
    private Employee(string name, string type, int salary) { Name = name; Type = type; Salary = salary; }
    public static Employee CreateIntern(string name) => new Employee(name, "Intern", 15000);
    public static Employee CreatePermanent(string name, int salary) => new Employee(name, "Permanent", salary);
    public void Show() => Console.WriteLine($"{Name} | {Type} | {Salary}");
}
// Output:
// Asha | Intern | 15000
// Ravi | Permanent | 55000` },
  ],
  quiz: [
    { question: `How many times does a static constructor run during the life of a program?`, options: [`Once for every object`, `Exactly once per type`, `Every time a static member is accessed`, `Never, unless called manually`], answer: 1, explanation: `The CLR runs the static constructor once per type, before the first use.` },
    { question: `Which declaration of a static constructor is valid?`, options: [`public static Employee() { }`, `static Employee(int id) { }`, `static void Employee() { }`, `static Employee() { }`], answer: 3, explanation: `Static constructors have no access modifier, no parameters and no return type.` },
    { question: `What does a private constructor prevent?`, options: [`Creating objects with new from outside the class`, `Having static members`, `Having methods`, `Using the class in the same file`], answer: 0, explanation: `Outside code gets CS0122 when it calls new on a class whose constructor is private.` },
    { question: `In "public Employee(int id) : this(id, "General") { body }", what runs first?`, options: [`body`, `Field assignments of the caller`, `The constructor Employee(int, string)`, `The static constructor every time`], answer: 2, explanation: `The constructor named by this(...) runs first; then the body of the calling constructor.` },
    { question: `var b = a; where a is an Employee object. What is b?`, options: [`A deep copy of a`, `A reference to the same object as a`, `A copy made by the copy constructor`, `null`], answer: 1, explanation: `Assigning a reference type copies the reference only; both variables point to one object.` },
  ],
};
