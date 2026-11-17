export default {
  id: 'day-016-intro-to-oops-class-object',
  title: 'Introduction to OOPs: Class, Object, Fields and Properties',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 16,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Start the most important module of the course. Learn what Object-Oriented Programming is, why companies use it, the four pillars, and how to write your first class with fields, properties and methods. Build a Student class, create many Student objects and see how objects live in memory.`,
  objectives: [
    'Explain OOP, its four pillars and how it differs from procedural programming',
    'Differentiate a class (blueprint) from an object (instance) using real-world analogies',
    'Declare fields, methods and properties (full, auto-implemented, read-only, computed)',
    'Create objects with new and object initializers and understand reference semantics',
    'Build a Student class and manage several Student objects',
  ],
  theory: [
    {
      heading: 'What is Object-Oriented Programming (OOP)?',
      content: `Until now (Module 1) we wrote **procedural** code: variables plus methods that work on them. That is fine for small programs, but in a real application (a bank, a hospital, a college ERP) you have thousands of related pieces of data and logic. Keeping them as loose variables becomes a mess.

**Object-Oriented Programming** organises code around **objects** - things from the real world that have **data** (what they know) and **behaviour** (what they can do).

Real-world analogy: a **Car**.
- Data (state): Color = Red, Brand = Honda, Speed = 60
- Behaviour (methods): Start(), Accelerate(), Brake()

In C# we put the data and the behaviour together in one unit called a **class**. C# is a fully object-oriented language: even Main lives inside a class (with top-level statements, the compiler creates that class for you).`,
      points: [
        'Procedural: data and functions are separate; data is passed around everywhere',
        'OOP: data and the functions that use it are bundled together inside objects',
        'OOP makes code reusable, easier to maintain, easier to test and closer to the real world',
        'Used by every .NET technology you will learn later: ASP.NET Core controllers, EF Core entities, Web API DTOs are all classes',
      ],
    },
    {
      heading: 'The Four Pillars of OOP',
      content: `Every OOP interview starts here. Learn these four words and a one-line meaning for each. We cover each one in detail in the coming days.`,
      points: [
        'Encapsulation (Day 20): wrap data and methods together and hide the internal details. Analogy: a medicine capsule hides the powder inside.',
        'Inheritance (Day 21-22): a child class reuses the members of a parent class. Analogy: a child inherits features from parents.',
        'Polymorphism (Day 23-24): one name, many forms. Analogy: one person is a son at home, an employee at office, a customer in a shop.',
        'Abstraction (Day 25-26): show only what is necessary and hide the complexity. Analogy: you drive a car with a steering wheel and pedals without knowing how the engine works.',
      ],
      tip: `Short answer for interviews: "OOP is a programming style based on classes and objects. Its four pillars are Encapsulation, Inheritance, Polymorphism and Abstraction."`,
    },
    {
      heading: 'Class vs Object',
      content: `A **class** is a **blueprint** or template. It describes what data and behaviour objects will have, but it does not hold real data by itself.

An **object** is a real **instance** created from the class using the **new** keyword. Each object has its own copy of the data.

Analogy: the **architect's house plan** is the class. The **actual houses** built from that plan are objects. One plan, many houses; each house can have a different paint colour (different data) but the same structure.

Another analogy: the **cookie cutter** is the class, each **cookie** is an object.

Diagram in words - what happens in memory for: Student s1 = new Student();
1. new Student() allocates a new object on the **heap** with all fields set to default values (0, null, false).
2. The variable s1 lives on the **stack** (inside the method) and stores only the **reference** (address) of that heap object.
3. STACK [ s1 : ref -> 0x1A ]   ----points to---->   HEAP [ 0x1A : RollNo=0, Name=null, Marks=0 ]

Because a class is a **reference type**, copying the variable (Student s2 = s1;) copies only the arrow, not the object. Both variables then point to the same house.`,
      syntax: `// Declaring a class (blueprint)
class Student
{
    // fields, properties, methods, constructors go here
}

// Creating objects (instances)
Student s1 = new Student();      // classic
var s2 = new Student();          // var infers Student
Student s3 = new();              // target-typed new (C# 9+)`,
      points: [
        'Class = logical entity, no memory for data until you create objects',
        'Object = physical entity in memory (heap), created with new',
        'One class can create any number of objects',
        'Class names use PascalCase: Student, BankAccount, OrderItem',
      ],
    },
    {
      heading: 'Members of a Class: Fields and Methods',
      content: `A class can contain **members**: fields, properties, methods, constructors, events, indexers and nested types. Today we focus on fields, properties and methods.

**Field** = a variable declared directly inside a class. It stores the state of the object. If you do not assign a value, a field automatically gets its **default value**: 0 for numbers, false for bool, null for reference types such as string, '\\0' for char.

**Method** = a function inside the class that describes behaviour. Methods can read and change the fields of the same object.

You access members with the **dot operator**: s1.Name, s1.Display().

Naming convention: private fields use _camelCase (_marks), public members use PascalCase (Name, Display).`,
      syntax: `class Student
{
    public int RollNo;            // field
    public string Name = "";      // field with initial value
    private int _marks;           // private field (hidden)

    public void Display()         // method
    {
        Console.WriteLine($"{RollNo} - {Name}");
    }
}`,
      tip: `Local variables inside a method MUST be assigned before use, but fields do not need to be - the runtime zeroes them automatically.`,
    },
    {
      heading: 'Properties: get and set',
      content: `Public fields are dangerous: anyone can write s.Marks = -500. A **property** looks like a field from outside but works like a pair of methods inside: a **get accessor** (read) and a **set accessor** (write). Inside set, the keyword **value** holds the new value being assigned.

Analogy: a **bank cashier window**. You cannot walk into the vault (private field), you ask the cashier (property), and the cashier checks the rules before giving or taking money.

Kinds of properties:
- **Full property** with a private backing field - put validation in set.
- **Auto-implemented property** { get; set; } - the compiler creates a hidden backing field for you.
- **Read-only property** { get; } or with private set - can be read from outside but not changed.
- **Init-only property** { get; init; } - can be set only during object creation (object initializer).
- **Computed (expression-bodied) property** => - value is calculated every time, no storage.`,
      syntax: `class Student
{
    private int _marks;                          // backing field

    public int Marks                             // full property
    {
        get { return _marks; }
        set { if (value >= 0 && value <= 100) _marks = value; }
    }

    public string Name { get; set; } = "";       // auto property with default
    public int RollNo { get; init; }             // init-only
    public string City { get; private set; } = "Pune"; // read-only outside
    public bool IsPassed => Marks >= 40;         // computed, read-only
}`,
      points: [
        'Rule of thumb in real projects: fields are private, data is exposed through properties',
        'Properties are used by data binding, JSON serialization, EF Core and model validation - fields are not',
        'A property without set is read-only; a property without get (set only) is rare and usually a design smell',
      ],
    },
    {
      heading: 'Creating Objects: new, Object Initializer and Reference Semantics',
      content: `There are several ways to create and fill an object:
1. **new + assignments**: Student s = new Student(); s.Name = "Asha";
2. **Object initializer**: Student s = new Student { Name = "Asha", Marks = 88 }; - shorter, and the only way to set init-only properties outside the class.
3. **Target-typed new**: Student s = new() { Name = "Asha" };

**Reference semantics** (very common interview trap):
- Student b = a; does NOT create a new student. a and b point to the same heap object, so a change through b is visible through a.
- a == b for classes compares **references** (same object?), not the data, unless the class overrides ==.
- ReferenceEquals(a, b) always tells you if two variables point to the same object.
- Setting a = null; removes only that arrow. When no variable points to an object, the **Garbage Collector (GC)** frees it later automatically.`,
      tip: `Value types (int, double, struct) are copied completely on assignment; reference types (class, string, array) copy only the reference. Remember Day 5!`,
    },
  ],
  examples: [
    {
      title: 'Student Class and Objects',
      scenario: `A college wants to store roll number, name and marks for each student, print the details and check if the student passed (marks >= 40). We design one Student class and create two Student objects.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StudentClassDemo, choose .NET 10 (or .NET 8), click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 to run without debugging',
      ],
      code: `// Object 1
Student s1 = new Student();
s1.RollNo = 101;
s1.Name = "Asha";
s1.Marks = 88;

// Object 2 - same blueprint, different data
Student s2 = new Student();
s2.RollNo = 102;
s2.Name = "Ravi";
s2.Marks = 35;

s1.Display();
s2.Display();
Console.WriteLine($"Is {s1.Name} passed? {s1.IsPassed()}");
Console.WriteLine($"Is {s2.Name} passed? {s2.IsPassed()}");

// The class (blueprint) - must come after top-level statements
class Student
{
    // Fields (data / state)
    public int RollNo;
    public string Name = "";
    public int Marks;

    // Methods (behaviour)
    public void Display()
    {
        Console.WriteLine($"Roll: {RollNo}, Name: {Name}, Marks: {Marks}");
    }

    public bool IsPassed()
    {
        return Marks >= 40;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `// Object 1
Student s1 = new Student();
s1.RollNo = 101;
s1.Name = "Asha";
s1.Marks = 88;

// Object 2 - same blueprint, different data
Student s2 = new Student();
s2.RollNo = 102;
s2.Name = "Ravi";
s2.Marks = 35;

s1.Display();
s2.Display();
Console.WriteLine($"Is {s1.Name} passed? {s1.IsPassed()}");
Console.WriteLine($"Is {s2.Name} passed? {s2.IsPassed()}");

// The class (blueprint) - must come after top-level statements
class Student
{
    // Fields (data / state)
    public int RollNo;
    public string Name = "";
    public int Marks;

    // Methods (behaviour)
    public void Display()
    {
        Console.WriteLine($"Roll: {RollNo}, Name: {Name}, Marks: {Marks}");
    }

    public bool IsPassed()
    {
        return Marks >= 40;
    }
}`,
        },
        stdin: '',
      },
      result: `Roll: 101, Name: Asha, Marks: 88
Roll: 102, Name: Ravi, Marks: 35
Is Asha passed? True
Is Ravi passed? False`,
      explanation: `Student is the blueprint; s1 and s2 are two separate objects on the heap, each with its own RollNo, Name and Marks. Display() and IsPassed() use the fields of the object they are called on: s1.Display() prints Asha's data, s2.Display() prints Ravi's. Ravi has 35 marks, so 35 >= 40 is false. In a top-level-statements Program.cs, class declarations must be written after the statements.`,
    },
    {
      title: 'Properties with Validation (Protecting Marks)',
      scenario: `Public fields allowed anyone to store marks = 150. We replace the field with a full property that accepts only 0-100, an auto-property for Name and a computed Grade property.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StudentProperties, click Create',
        'Replace Program.cs with the code',
        'Put a breakpoint (F9) on the line "if (value >= 0 && value <= 100)" and press F5, then use F10 to watch value change',
        'Press Shift+F5 to stop, then Ctrl+F5 to run normally',
      ],
      code: `Student s = new Student { Name = "Meena" };   // object initializer
s.Marks = 92;
Console.WriteLine($"{s.Name} scored {s.Marks}");

s.Marks = 150;                  // invalid - rejected by set
Console.WriteLine($"After invalid set: {s.Marks}");

s.Marks = -5;                   // invalid - rejected by set
Console.WriteLine($"After negative set: {s.Marks}");

Console.WriteLine($"Grade: {s.Grade}");
s.Marks = 76;
Console.WriteLine($"New marks {s.Marks}, Grade: {s.Grade}");

class Student
{
    private int _marks;                       // backing field (hidden)

    public string Name { get; set; } = "";    // auto-implemented property

    public int Marks                          // full property
    {
        get { return _marks; }
        set
        {
            if (value >= 0 && value <= 100)
                _marks = value;
            else
                Console.WriteLine($"Invalid marks {value} ignored");
        }
    }

    // computed, read-only property (no storage)
    public string Grade => _marks >= 90 ? "A" : _marks >= 75 ? "B" : _marks >= 40 ? "C" : "F";
}`,
      csharp: {
        files: {
          'Program.cs': `Student s = new Student { Name = "Meena" };   // object initializer
s.Marks = 92;
Console.WriteLine($"{s.Name} scored {s.Marks}");

s.Marks = 150;                  // invalid - rejected by set
Console.WriteLine($"After invalid set: {s.Marks}");

s.Marks = -5;                   // invalid - rejected by set
Console.WriteLine($"After negative set: {s.Marks}");

Console.WriteLine($"Grade: {s.Grade}");
s.Marks = 76;
Console.WriteLine($"New marks {s.Marks}, Grade: {s.Grade}");

class Student
{
    private int _marks;                       // backing field (hidden)

    public string Name { get; set; } = "";    // auto-implemented property

    public int Marks                          // full property
    {
        get { return _marks; }
        set
        {
            if (value >= 0 && value <= 100)
                _marks = value;
            else
                Console.WriteLine($"Invalid marks {value} ignored");
        }
    }

    // computed, read-only property (no storage)
    public string Grade => _marks >= 90 ? "A" : _marks >= 75 ? "B" : _marks >= 40 ? "C" : "F";
}`,
        },
        stdin: '',
      },
      result: `Meena scored 92
Invalid marks 150 ignored
After invalid set: 92
Invalid marks -5 ignored
After negative set: 92
Grade: A
New marks 76, Grade: B`,
      explanation: `s.Marks = 92 calls the set accessor with value = 92, which is valid, so _marks becomes 92. For 150 and -5 the set accessor prints a message and does not touch _marks, so it stays 92. Grade is computed every time it is read: 92 gives "A"; after setting 76 it gives "B" (76 >= 75). The outside code cannot reach _marks directly - this is the first taste of encapsulation.`,
    },
    {
      title: 'Default Values and Reference Semantics',
      scenario: `An interviewer asks: "If I write Student b = a; and change b.Name, what happens to a?" We prove the answer with code and also show the default values of fields.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ReferenceDemo, click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `Student a = new Student();
Console.WriteLine($"Defaults -> RollNo: {a.RollNo}, Name: {a.Name ?? "null"}, IsActive: {a.IsActive}");

a.RollNo = 1;
a.Name = "Kiran";

Student b = a;              // copies the REFERENCE, not the object
b.Name = "Kiran Kumar";     // change through b

Console.WriteLine($"a.Name = {a.Name}");
Console.WriteLine($"Same object? {ReferenceEquals(a, b)}");

Student c = new Student { RollNo = 1, Name = "Kiran Kumar" };
Console.WriteLine($"a and c same object? {ReferenceEquals(a, c)}");
Console.WriteLine($"a == c ? {a == c}");
Console.WriteLine($"Same data? {a.RollNo == c.RollNo && a.Name == c.Name}");

class Student
{
    public int RollNo;
    public string? Name;     // nullable reference, default null
    public bool IsActive;    // default false
}`,
      csharp: {
        files: {
          'Program.cs': `Student a = new Student();
Console.WriteLine($"Defaults -> RollNo: {a.RollNo}, Name: {a.Name ?? "null"}, IsActive: {a.IsActive}");

a.RollNo = 1;
a.Name = "Kiran";

Student b = a;              // copies the REFERENCE, not the object
b.Name = "Kiran Kumar";     // change through b

Console.WriteLine($"a.Name = {a.Name}");
Console.WriteLine($"Same object? {ReferenceEquals(a, b)}");

Student c = new Student { RollNo = 1, Name = "Kiran Kumar" };
Console.WriteLine($"a and c same object? {ReferenceEquals(a, c)}");
Console.WriteLine($"a == c ? {a == c}");
Console.WriteLine($"Same data? {a.RollNo == c.RollNo && a.Name == c.Name}");

class Student
{
    public int RollNo;
    public string? Name;     // nullable reference, default null
    public bool IsActive;    // default false
}`,
        },
        stdin: '',
      },
      result: `Defaults -> RollNo: 0, Name: null, IsActive: False
a.Name = Kiran Kumar
Same object? True
a and c same object? False
a == c ? False
Same data? True`,
      explanation: `A new object gets default field values: 0, null and false. Student b = a; copies only the reference, so a and b point to the same heap object (diagram: a --> [Kiran] <-- b). Changing b.Name therefore changes what a sees. c is a different object with the same data; for classes == compares references, so a == c is False even though the data matches. Comparing the fields shows the data is the same. (Day 28 shows how to override Equals for value comparison.)`,
    },
    {
      title: 'Managing Many Students with a List',
      scenario: `Store a class of three students using object initializers, print a report line for each using a method and a computed property, and calculate the class average.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StudentReport, click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `List<Student> students = new List<Student>
{
    new Student { RollNo = 1, Name = "Asha", Marks = 88 },
    new Student { RollNo = 2, Name = "Ravi", Marks = 35 },
    new Student { RollNo = 3, Name = "Neha", Marks = 72 }
};

int total = 0;
foreach (Student s in students)
{
    Console.WriteLine(s.GetReport());
    total += s.Marks;
}

Console.WriteLine($"Total students: {students.Count}");
Console.WriteLine($"Total marks: {total}");
Console.WriteLine($"Class average: {total / students.Count}");

class Student
{
    public int RollNo { get; init; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }

    public string Result => Marks >= 40 ? "PASS" : "FAIL";

    public string GetReport()
    {
        return $"{RollNo}. {Name} - {Marks} - {Result}";
    }
}`,
      csharp: {
        files: {
          'Program.cs': `List<Student> students = new List<Student>
{
    new Student { RollNo = 1, Name = "Asha", Marks = 88 },
    new Student { RollNo = 2, Name = "Ravi", Marks = 35 },
    new Student { RollNo = 3, Name = "Neha", Marks = 72 }
};

int total = 0;
foreach (Student s in students)
{
    Console.WriteLine(s.GetReport());
    total += s.Marks;
}

Console.WriteLine($"Total students: {students.Count}");
Console.WriteLine($"Total marks: {total}");
Console.WriteLine($"Class average: {total / students.Count}");

class Student
{
    public int RollNo { get; init; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }

    public string Result => Marks >= 40 ? "PASS" : "FAIL";

    public string GetReport()
    {
        return $"{RollNo}. {Name} - {Marks} - {Result}";
    }
}`,
        },
        stdin: '',
      },
      result: `1. Asha - 88 - PASS
2. Ravi - 35 - FAIL
3. Neha - 72 - PASS
Total students: 3
Total marks: 195
Class average: 65`,
      explanation: `Each new Student { ... } inside the collection initializer creates a separate object. RollNo is init-only, so it can be set here but not later (s.RollNo = 9; would be a compile error). 88 + 35 + 72 = 195 and 195 / 3 = 65 (integer division). Result is a computed property, recalculated from Marks every time it is read.`,
    },
  ],
  interview: [
    { q: `What is OOP? Name its four pillars.`, a: `Object-Oriented Programming is a programming style in which code is organised around objects that combine data (fields/properties) and behaviour (methods). The four pillars are Encapsulation, Inheritance, Polymorphism and Abstraction.`, level: 'Easy' },
    { q: `What is the difference between a class and an object?`, a: `A class is a blueprint or template that defines fields, properties and methods; it is a logical entity. An object is an instance of a class created with new; it occupies memory on the heap and holds actual values. One class can produce many objects. Analogy: house plan (class) vs houses (objects).`, level: 'Easy' },
    { q: `Where are objects stored in memory?`, a: `Class objects (reference types) are allocated on the managed heap. The variable that refers to the object stores only a reference; if it is a local variable it lives on the stack. The Garbage Collector frees heap objects when no references point to them.`, level: 'Medium' },
    { q: `What is the difference between a field and a property?`, a: `A field is a variable declared in a class that directly stores data. A property exposes data through get/set accessors, which are actually methods, so you can add validation, make it read-only, compute it, or raise notifications. Best practice: keep fields private and expose public properties. Frameworks such as EF Core, JSON serializers and model binding work with properties.`, level: 'Easy' },
    { q: `What is an auto-implemented property?`, a: `A property written as public string Name { get; set; } without a body. The compiler generates a hidden private backing field and simple get/set accessors. Use it when no extra logic is needed. You can give it a default: { get; set; } = "";`, level: 'Easy' },
    { q: `What is the difference between { get; private set; } and { get; init; }?`, a: `private set allows the value to be changed any time, but only from code inside the class. init allows the value to be set only during object creation (constructor or object initializer) from anywhere, and afterwards it is immutable for everyone.`, level: 'Medium' },
    { q: `What is the keyword value in a property?`, a: `value is an implicit parameter available inside a set (or init) accessor. It holds the value that the caller is assigning. For s.Marks = 92, value is 92.`, level: 'Easy' },
    { q: `What are the default values of fields that are not initialised?`, a: `Numeric types get 0, bool gets false, char gets '\\0', reference types (string, arrays, class types) get null, and structs get all their fields set to defaults. Local variables do not get defaults; they must be assigned before use.`, level: 'Easy' },
    { q: `Output? var a = new Student { Name = "A" }; var b = a; b.Name = "B"; Console.WriteLine(a.Name);`, a: `It prints B. Student is a class (reference type), so b = a copies the reference. Both variables point to the same object, and changing b.Name is visible through a.`, level: 'Medium' },
    { q: `Output? var x = new Student { Id = 1 }; var y = new Student { Id = 1 }; Console.WriteLine(x == y);`, a: `False. For a class that does not override == or Equals, the comparison checks whether both references point to the same object. x and y are two different objects even though their data is identical. A record type would print True because records use value equality.`, level: 'Medium' },
    { q: `Can we create an object without the new keyword?`, a: `For normal classes you need new (or target-typed new(), or a factory method that calls new internally). Exceptions/variations: string literals ("abc") and array initializers create objects implicitly, reflection (Activator.CreateInstance) and deserialization also create objects. Value types such as int can be used without new.`, level: 'Medium' },
    { q: `Why is OOP preferred in enterprise .NET applications?`, a: `It models business entities naturally (Customer, Order, Invoice), reduces duplicate code through inheritance and composition, protects data through encapsulation, makes code extensible through polymorphism and interfaces, and supports patterns like Dependency Injection and Repository used throughout ASP.NET Core.`, level: 'Medium' },
  ],
  practice: [
    { task: `Create a Car class with fields Brand, Model, Year and a method ShowInfo(). Create two Car objects and display them.`, hint: `Declare the class after the top-level statements; use car1.Brand = "Honda" etc.`, solution: `Car c1 = new Car { Brand = "Honda", Model = "City", Year = 2023 };
Car c2 = new Car { Brand = "Tata", Model = "Nexon", Year = 2024 };
c1.ShowInfo();
c2.ShowInfo();

class Car
{
    public string Brand = "";
    public string Model = "";
    public int Year;
    public void ShowInfo() => Console.WriteLine($"{Brand} {Model} ({Year})");
}
// Output:
// Honda City (2023)
// Tata Nexon (2024)` },
    { task: `Create a Product class with a Price property that rejects negative values, and a read-only computed property PriceWithGst (18 percent, integer arithmetic).`, hint: `Use a private backing field _price and check value >= 0 in set. PriceWithGst => _price + _price * 18 / 100;`, solution: `Product p = new Product { Name = "Mouse" };
p.Price = 500;
p.Price = -20;
Console.WriteLine($"{p.Name}: {p.Price}, with GST: {p.PriceWithGst}");

class Product
{
    private int _price;
    public string Name { get; set; } = "";
    public int Price
    {
        get => _price;
        set { if (value >= 0) _price = value; else Console.WriteLine("Price cannot be negative"); }
    }
    public int PriceWithGst => _price + _price * 18 / 100;
}
// Output:
// Price cannot be negative
// Mouse: 500, with GST: 590` },
    { task: `Create a Rectangle class with Length and Width auto-properties and methods Area() and Perimeter(). Create a rectangle 5 x 3 and print both values.`, hint: `Area = Length * Width, Perimeter = 2 * (Length + Width).`, solution: `var r = new Rectangle { Length = 5, Width = 3 };
Console.WriteLine($"Area: {r.Area()}, Perimeter: {r.Perimeter()}");

class Rectangle
{
    public int Length { get; set; }
    public int Width { get; set; }
    public int Area() => Length * Width;
    public int Perimeter() => 2 * (Length + Width);
}
// Output: Area: 15, Perimeter: 16` },
    { task: `Write a Student class with RollNo (init-only), Name and Marks. Store 4 students in a List and print the topper.`, hint: `Loop through the list and keep the student with the highest Marks in a variable.`, solution: `var list = new List<Student>
{
    new Student { RollNo = 1, Name = "Asha", Marks = 81 },
    new Student { RollNo = 2, Name = "Ravi", Marks = 93 },
    new Student { RollNo = 3, Name = "Neha", Marks = 77 },
    new Student { RollNo = 4, Name = "Arun", Marks = 88 }
};
Student top = list[0];
foreach (var s in list)
    if (s.Marks > top.Marks) top = s;
Console.WriteLine($"Topper: {top.Name} ({top.Marks})");

class Student
{
    public int RollNo { get; init; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}
// Output: Topper: Ravi (93)` },
    { task: `Prove reference semantics: create a Book object, assign it to a second variable, change the Title through the second variable, and print the Title through the first.`, hint: `Use ReferenceEquals to print whether both variables point to the same object.`, solution: `Book b1 = new Book { Title = "C# Basics" };
Book b2 = b1;
b2.Title = "C# Advanced";
Console.WriteLine(b1.Title);
Console.WriteLine(ReferenceEquals(b1, b2));

class Book { public string Title { get; set; } = ""; }
// Output:
// C# Advanced
// True` },
  ],
  quiz: [
    { question: `Which statement about a class is correct?`, options: [`A class is an instance of an object`, `A class is a blueprint from which objects are created`, `A class is always stored on the stack`, `A class cannot contain methods`], answer: 1, explanation: `A class is the blueprint/template; objects are the instances created from it with new.` },
    { question: `What is the default value of an uninitialised string field in a class?`, options: [`null`, `"" (empty string)`, `"null"`, `Compile error`], answer: 0, explanation: `string is a reference type, so the field defaults to null. Only local variables must be assigned before use.` },
    { question: `Inside a set accessor, which keyword holds the incoming value?`, options: [`this`, `input`, `set`, `value`], answer: 3, explanation: `value is the implicit parameter of set and init accessors.` },
    { question: `var a = new Box { W = 5 }; var b = a; b.W = 9; What is a.W? (Box is a class)`, options: [`5`, `0`, `9`, `Compile error`], answer: 2, explanation: `b = a copies the reference; both point to the same object, so a.W is 9.` },
    { question: `Which property can be assigned only in an object initializer or constructor?`, options: [`{ get; set; }`, `{ get; init; }`, `{ get; private set; }`, `A computed property using =>`], answer: 1, explanation: `init-only setters allow assignment only during object creation; afterwards the property is immutable.` },
  ],
};
