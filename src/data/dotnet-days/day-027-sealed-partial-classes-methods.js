const sealedClassCode = `GstCalculator gst = new GstCalculator();
Console.WriteLine($"GST on Rs.1000 at 18%: Rs.{gst.Calculate(1000, 18)}");
Console.WriteLine($"GST on Rs.2500 at 5%: Rs.{gst.Calculate(2500, 5)}");

// Checking with reflection which types are sealed
Console.WriteLine($"GstCalculator sealed? {typeof(GstCalculator).IsSealed}");
Console.WriteLine($"string sealed? {typeof(string).IsSealed}");
Console.WriteLine($"object sealed? {typeof(object).IsSealed}");
Console.WriteLine($"Math sealed? {typeof(Math).IsSealed}, abstract? {typeof(Math).IsAbstract}");

// class MyGst : GstCalculator { }
// error CS0509: 'MyGst': cannot derive from sealed type 'GstCalculator'

// class MyString : string { }
// error CS0509: cannot derive from sealed type 'string'

// A sealed class: final, nobody can inherit and change the tax rules
sealed class GstCalculator
{
    public int Calculate(int amount, int ratePercent)
    {
        return amount * ratePercent / 100;
    }
}
`;

const sealedMethodCode = `Employee[] staff =
{
    new Employee("Asha", 30000),
    new Manager("Vikram", 60000),
    new SeniorManager("Meera", 90000)
};

Console.WriteLine("--- Through Employee references ---");
foreach (Employee e in staff)
{
    Console.WriteLine($"{e.Name} ({e.GetType().Name}) Bonus: {e.Bonus()}");
}

Console.WriteLine("--- Through a SeniorManager variable ---");
SeniorManager sm = new SeniorManager("Meera", 90000);
Console.WriteLine($"{sm.Name} Bonus: {sm.Bonus()}");

class Employee
{
    public string Name { get; }
    public int Salary { get; }

    public Employee(string name, int salary)
    {
        Name = name;
        Salary = salary;
    }

    public virtual int Bonus() => Salary * 10 / 100;
}

class Manager : Employee
{
    public Manager(string name, int salary) : base(name, salary) { }

    // sealed override: the overriding chain STOPS here
    public sealed override int Bonus() => Salary * 20 / 100;
}

class SeniorManager : Manager
{
    public SeniorManager(string name, int salary) : base(name, salary) { }

    // public override int Bonus() => Salary * 30 / 100;
    // error CS0239: cannot override inherited member 'Manager.Bonus()' because it is sealed

    // Hiding with new is allowed, but it is NOT polymorphic
    public new int Bonus() => Salary * 30 / 100;
}
`;

const partialProgram = `Employee emp = new Employee(1001, "Ravi Kumar", "Developer", 50000);

emp.ShowProfile();      // defined in Employee.Personal.cs
emp.ShowSalarySlip();   // defined in Employee.Payroll.cs
`;

const partialPersonal = `// Employee.Personal.cs  -> personal details part
public partial class Employee
{
    public int Id { get; }
    public string Name { get; }
    public string Designation { get; }

    public Employee(int id, string name, string designation, int basic)
    {
        Id = id;
        Name = name;
        Designation = designation;
        Basic = basic;            // property declared in the OTHER file
    }

    public void ShowProfile()
    {
        Console.WriteLine("--- Profile ---");
        Console.WriteLine($"Id: {Id}");
        Console.WriteLine($"Name: {Name}");
        Console.WriteLine($"Designation: {Designation}");
    }
}
`;

const partialPayroll = `// Employee.Payroll.cs  -> salary part
public partial class Employee
{
    public int Basic { get; }

    public int Hra => Basic * 40 / 100;          // 40% of basic
    public int Pf => Basic * 12 / 100;           // 12% of basic
    public int NetSalary => Basic + Hra - Pf;

    public void ShowSalarySlip()
    {
        Console.WriteLine("--- Salary Slip ---");
        Console.WriteLine($"Basic: {Basic}");
        Console.WriteLine($"HRA: {Hra}");
        Console.WriteLine($"PF: {Pf}");
        Console.WriteLine($"Net: {NetSalary}");
        Console.WriteLine($"(Employee {Name})");   // uses property from the other file
    }
}
`;

const partialCombined = `// ===== Program.cs =====
${partialProgram}
// ===== Employee.Personal.cs =====
${partialPersonal}
// ===== Employee.Payroll.cs =====
${partialPayroll}`;

const partialMethodProgram = `Order order = new Order(101);
order.AddItem("Laptop", 55000);
order.AddItem("Mouse", 700);
Console.WriteLine($"Total: Rs.{order.Total}");
Console.WriteLine($"Discount: {order.DiscountPercent()}%");
`;

const partialMethodGenerated = `// Order.Generated.cs  -> imagine a tool generated this file
public partial class Order
{
    public int Id { get; }
    public int Total { get; private set; }

    public Order(int id)
    {
        Id = id;
        OnCreated();
    }

    public void AddItem(string name, int price)
    {
        OnItemAdding(name);            // no implementation anywhere -> call is removed
        Total += price;
        Console.WriteLine($"Added {name} (Rs.{price})");
        OnItemAdded(name, Total);
    }

    // Classic partial methods: void, implicitly private, implementation optional
    partial void OnCreated();
    partial void OnItemAdding(string name);
    partial void OnItemAdded(string name, int total);

    // Extended partial method (C# 9+): has access modifier + return type,
    // so an implementation is REQUIRED
    public partial int DiscountPercent();
}
`;

const partialMethodCustom = `// Order.Custom.cs  -> the developer's hand-written part
public partial class Order
{
    partial void OnCreated()
    {
        Console.WriteLine($"Order #{Id} created");
    }

    partial void OnItemAdded(string name, int total)
    {
        Console.WriteLine($"  Hook: running total = Rs.{total}");
    }

    public partial int DiscountPercent()
    {
        return Total > 50000 ? 10 : 0;
    }
}
`;

const partialMethodCombined = `// ===== Program.cs =====
${partialMethodProgram}
// ===== Order.Generated.cs =====
${partialMethodGenerated}
// ===== Order.Custom.cs =====
${partialMethodCustom}`;

const consoleSteps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8.0 (LTS) or .NET 10.0 (LTS), click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging',
  'Uncomment the commented class/override lines one at a time to see errors CS0509 / CS0239 in View > Error List, then comment them again',
];

const multiFileSteps = (name, files) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8.0 (LTS) or .NET 10.0 (LTS), click Create`,
  `In Solution Explorer right-click the project > Add > Class... and add ${files} (delete the generated class body in each)`,
  'Paste each part of the code below into its own file; replace Program.cs with the Program.cs part',
  'Press Ctrl+F5 to run; Visual Studio compiles all parts into ONE class',
];

export default {
  id: 'day-027-sealed-partial-classes-methods',
  title: 'Sealed Classes, Sealed Methods, Partial Classes and Partial Methods',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 27,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Learn how to STOP inheritance with sealed classes, how to stop further overriding with sealed override methods, and how to SPLIT one class across several files with partial classes and partial methods. See why string is sealed, how Visual Studio uses partial classes for designer and generated code, and build an Employee class split into personal and payroll files.`,
  objectives: [
    'Create sealed classes and explain why classes like string are sealed',
    'Use sealed override to stop further overriding in a multilevel hierarchy',
    'Split a class across multiple files using partial classes and know the rules',
    'Declare and implement partial methods (classic void and C# 9 extended forms)',
    'Recognise where .NET itself uses sealed and partial (string, generated code, Razor, EF scaffolding)',
  ],
  theory: [
    {
      heading: 'Sealed Class',
      content: `A **sealed class** is a class that **cannot be inherited**. Writing class B : A where A is sealed gives error **CS0509**.

Real-world analogies:
- **Sealed envelope / sealed exam paper**: the contents are final; nobody may open and modify them.
- **Government tax rules (GST calculator)**: the formula is fixed; you should not create a "MyGst" child class that changes it.
- **Final recipe of a famous brand**: you can buy and use the product but you cannot make a modified version under the same name.

Why seal a class?
1. **Security and correctness**: prevent others from changing important behaviour (string, password hashing, tax calculation).
2. **Design intent**: the class was not designed for inheritance.
3. **Performance**: the JIT can call methods of sealed classes directly (devirtualisation), a small speed gain.

A sealed class **can** still inherit from another class and implement interfaces; it just cannot be a parent. You can of course create objects of it.

Built-in sealed classes: **string (System.String)**, many attribute classes, **static classes** (compiled as abstract + sealed). Records and classes in modern .NET libraries are often sealed by default.`,
      syntax: `sealed class GstCalculator
{
    public int Calculate(int amount, int rate) => amount * rate / 100;
}

// class MyGst : GstCalculator { }   // CS0509: cannot derive from sealed type`,
      tip: 'Many teams seal classes by default and unseal only when inheritance is really needed. It keeps designs simpler.',
    },
    {
      heading: 'Sealed Methods (sealed override)',
      content: `A method can be sealed only when it is **overriding** a virtual (or abstract) method. You write **sealed override**. It means: "I override my parent's method, but **my children cannot override it again**".

Employee (virtual Bonus) → Manager (sealed override Bonus) → SeniorManager (cannot override Bonus, error **CS0239**).

Rules:
- sealed must be combined with override. A plain sealed void Show() is an error (CS0238), because a non-virtual method is already "final".
- The child can still **hide** the method with **new**, but hiding is not polymorphic: an Employee reference to a SeniorManager object still calls Manager's sealed version.
- Sealed properties work the same way: public sealed override string Role => "Manager";

Analogy: a family recipe is passed down; the grandmother's version (virtual) was changed by the mother (override). The mother says "this is final now" (sealed) so the next generation must use her version.`,
      syntax: `class Employee { public virtual int Bonus() => Salary * 10 / 100; }
class Manager : Employee { public sealed override int Bonus() => Salary * 20 / 100; }
class SeniorManager : Manager
{
    // public override int Bonus() ...   // CS0239
}`,
    },
    {
      heading: 'Partial Classes',
      content: `A **partial class** is one class whose code is **split across two or more files** (or two blocks in the same file) using the **partial** keyword. At compile time, all parts are **merged into one class**.

Real-world analogy: a **book written by several authors**, each writing different chapters in separate files. The printer binds them into ONE book. Or a **house blueprint** where the electrician's drawing and the plumber's drawing are separate sheets of the same house.

Where it is used:
- **Windows Forms / WPF**: Form1.cs (your code) + Form1.Designer.cs (generated by the designer).
- **EF Core scaffolding** and **source generators** produce partial classes so you can add your code in another file without it being overwritten.
- **Large classes in teams**: e.g. Employee.Personal.cs and Employee.Payroll.cs edited by different developers.
- **Razor components** (.razor + .razor.cs code-behind).

Rules:
- **Every** part must use the **partial** keyword.
- All parts must be in the **same assembly (project)** and the **same namespace**, with the same class name.
- Access modifiers must not conflict (one part public and another internal is an error). If one part is **abstract** or **sealed**, the whole class is.
- If parts list different base interfaces, the class implements all of them. Only one base class may be specified (or all parts must agree).
- Members from one part are visible in all other parts (private fields too).`,
      syntax: `// Employee.Personal.cs
public partial class Employee { public string Name { get; set; } }

// Employee.Payroll.cs
public partial class Employee { public int Basic { get; set; } }`,
      points: [
        'partial on every part',
        'Same name, namespace and project',
        'Compiler merges parts into a single class',
        'partial also works for structs, interfaces and records',
      ],
    },
    {
      heading: 'Partial Methods',
      content: `A **partial method** is declared in one part of a partial class and **optionally implemented** in another part. It is a lightweight **hook**: generated code says "if you want, run your code here".

**Classic partial method** (since C# 3):
- Must return **void**, no access modifier (implicitly **private**), no out parameters.
- The implementation is **optional**. If nobody implements it, the compiler **removes the declaration and all calls** to it, so there is zero cost.

**Extended partial method** (C# 9+):
- Has an explicit access modifier (public, private, ...) and may return a value or have out parameters.
- Then an implementation is **mandatory** (error CS8795 if missing).
- Used by source generators (e.g. the Regex source generator: [GeneratedRegex] public static partial Regex EmailRegex();).

C# 13/14 also allow **partial properties** and (C# 14) **partial constructors and events**, mainly for source generators.

Analogy: an event planner's checklist with optional slots: "Welcome speech by chief guest (optional)". If no chief guest is invited, that slot is simply removed from the program.`,
      syntax: `partial class Order
{
    partial void OnCreated();                 // declaration (optional implementation)
    public partial int DiscountPercent();     // extended: implementation required
}

partial class Order
{
    partial void OnCreated() => Console.WriteLine("Created");
    public partial int DiscountPercent() => 10;
}`,
    },
    {
      heading: 'Sealed vs Static vs Abstract vs Partial (Quick Comparison)',
      content: `| Keyword | Can create object? | Can inherit from it? | Main purpose |
|---|---|---|---|
| (normal class) | Yes | Yes | General use |
| abstract | No | Yes (must) | Base with incomplete members |
| sealed | Yes | No | Final class, stop inheritance |
| static | No | No | Only static members (Math, Console) |
| partial | Same as normal | Same as normal | Split one class across files |

Notes:
- partial is about **source code organisation**; it does not change behaviour at runtime.
- sealed and partial can be combined: public sealed partial class Employee.
- abstract and sealed cannot be combined (CS0418).
- A **private constructor** (Day 18) also prevents inheritance from outside, but a sealed class says the intent clearly.`,
    },
  ],
  examples: [
    {
      title: 'Sealed Class: GST Calculator',
      scenario: 'Tax calculation must not be altered by child classes, so GstCalculator is sealed. Reflection (typeof(...).IsSealed) shows which built-in types are sealed.',
      steps: consoleSteps('SealedClassDemo'),
      code: sealedClassCode,
      csharp: { files: { 'Program.cs': sealedClassCode }, stdin: '' },
      result: `GST on Rs.1000 at 18%: Rs.180
GST on Rs.2500 at 5%: Rs.125
GstCalculator sealed? True
string sealed? True
object sealed? False
Math sealed? True, abstract? True`,
      explanation: `1000 * 18 / 100 = 180 and 2500 * 5 / 100 = 125. A sealed class works normally for creating objects and calling methods. string is sealed in .NET, object is obviously not (every class derives from it). Math is a static class, and static classes are compiled as abstract + sealed, so both checks return True.`,
    },
    {
      title: 'Sealed Method: Stop Overriding in a Multilevel Hierarchy',
      scenario: 'Manager seals its Bonus() override. SeniorManager cannot override it again; it can only hide it with new, which is NOT polymorphic.',
      steps: consoleSteps('SealedMethodDemo'),
      code: sealedMethodCode,
      csharp: { files: { 'Program.cs': sealedMethodCode }, stdin: '' },
      result: `--- Through Employee references ---
Asha (Employee) Bonus: 3000
Vikram (Manager) Bonus: 12000
Meera (SeniorManager) Bonus: 18000
--- Through a SeniorManager variable ---
Meera Bonus: 27000`,
      explanation: `Asha: 30000 * 10 / 100 = 3000. Vikram: 60000 * 20 / 100 = 12000. Meera through an Employee reference: Bonus is virtual, the most-derived OVERRIDE is Manager's sealed one, so 90000 * 20 / 100 = 18000. SeniorManager's new Bonus() is only chosen when the variable type is SeniorManager: 90000 * 30 / 100 = 27000.`,
    },
    {
      title: 'Employee Partial Class Across Three Files',
      scenario: 'The syllabus task. The Employee class is split into Employee.Personal.cs (identity) and Employee.Payroll.cs (salary). The constructor in one file sets a property declared in the other.',
      steps: multiFileSteps('EmployeePartial', 'Employee.Personal.cs and Employee.Payroll.cs'),
      code: partialCombined,
      csharp: { files: { 'Program.cs': partialProgram, 'Employee.Personal.cs': partialPersonal, 'Employee.Payroll.cs': partialPayroll }, stdin: '' },
      result: `--- Profile ---
Id: 1001
Name: Ravi Kumar
Designation: Developer
--- Salary Slip ---
Basic: 50000
HRA: 20000
PF: 6000
Net: 64000
(Employee Ravi Kumar)`,
      explanation: `The compiler merges both partial parts into one Employee class, so the constructor (Personal file) can assign Basic (Payroll file) and ShowSalarySlip (Payroll file) can read Name (Personal file). HRA = 50000 * 40 / 100 = 20000, PF = 50000 * 12 / 100 = 6000, Net = 50000 + 20000 - 6000 = 64000.`,
    },
    {
      title: 'Partial Methods: Optional Hooks and Extended Partial Methods',
      scenario: 'Order.Generated.cs plays the role of tool-generated code with hooks. Order.Custom.cs implements only the hooks it needs; OnItemAdding is never implemented, so its call disappears.',
      steps: multiFileSteps('PartialMethodsDemo', 'Order.Generated.cs and Order.Custom.cs'),
      code: partialMethodCombined,
      csharp: { files: { 'Program.cs': partialMethodProgram, 'Order.Generated.cs': partialMethodGenerated, 'Order.Custom.cs': partialMethodCustom }, stdin: '' },
      result: `Order #101 created
Added Laptop (Rs.55000)
  Hook: running total = Rs.55000
Added Mouse (Rs.700)
  Hook: running total = Rs.55700
Total: Rs.55700
Discount: 10%`,
      explanation: `The constructor calls OnCreated(), implemented in the custom file, so "Order #101 created" prints. OnItemAdding has no implementation, so the compiler removes that call. OnItemAdded prints the running total 55000 then 55000 + 700 = 55700. DiscountPercent() is an extended partial method (public, returns int), so it must be implemented; Total 55700 > 50000 gives 10.`,
    },
  ],
  interview: [
    { q: 'What is a sealed class?', a: 'A class declared with the sealed keyword that cannot be inherited (CS0509 if you try). You can still create objects of it, and it can itself inherit a class and implement interfaces.', level: 'Easy' },
    { q: 'Why is System.String sealed?', a: 'For security, reliability and performance. String is immutable and used everywhere (keys, file paths, security checks). If someone could inherit and override its behaviour, immutability and correctness guarantees would break. Sealing also lets the runtime optimise string operations.', level: 'Medium' },
    { q: 'What is a sealed method? Can we write sealed on a normal method?', a: 'A sealed method is an override that cannot be overridden further: public sealed override int Bonus(). sealed can only be used together with override; on a non-virtual method it is an error (CS0238) because such a method cannot be overridden anyway.', level: 'Medium' },
    { q: 'Can a sealed class have virtual methods?', a: 'It can override inherited virtual methods, but declaring a NEW virtual member in a sealed class is an error (CS0549), since no child can ever override it.', level: 'Hard' },
    { q: 'Difference between sealed class and static class?', a: 'You can create objects of a sealed class and it can have instance members; it only blocks inheritance. A static class cannot be instantiated or inherited and contains only static members. Internally a static class is abstract + sealed.', level: 'Medium' },
    { q: 'Can an abstract class be sealed?', a: 'No, CS0418. Abstract requires inheritance to be useful and sealed forbids inheritance.', level: 'Easy' },
    { q: 'What is a partial class and where is it used?', a: 'A class whose definition is split across multiple files or blocks using partial; the compiler merges them into one type. Used for designer/generated code (WinForms Form1.Designer.cs, EF Core scaffolding, source generators, Razor code-behind) and to organise large classes in teams.', level: 'Easy' },
    { q: 'Rules for partial classes?', a: 'Every part must have the partial keyword; all parts must be in the same assembly and namespace with the same name; access modifiers must not conflict; if any part is abstract or sealed the whole class is; base class must be the same if specified; interfaces from all parts are combined.', level: 'Medium' },
    { q: 'Can partial classes be in different projects (assemblies)?', a: 'No. All parts are merged at compile time by one compilation, so they must be in the same project. A part in another project would create a different, unrelated class.', level: 'Medium' },
    { q: 'What is a partial method? What happens if it is not implemented?', a: 'A method declared in one part of a partial class and optionally implemented in another. Classic partial methods must return void and are implicitly private. If no implementation exists, the compiler removes the declaration and every call to it, so there is no runtime cost.', level: 'Medium' },
    { q: 'What changed for partial methods in C# 9?', a: 'Extended partial methods may have access modifiers, non-void return types and out parameters. When any of these is used, an implementation becomes mandatory (CS8795). Source generators use this heavily, e.g. [GeneratedRegex] public static partial Regex MyRegex();', level: 'Hard' },
    { q: 'What is the output?\nclass A { public virtual string M() => "A"; }\nclass B : A { public sealed override string M() => "B"; }\nclass C : B { public new string M() => "C"; }\nA x = new C(); B y = new C(); C z = new C();\nConsole.WriteLine(x.M() + y.M() + z.M());', a: 'Output: BBC. Through A and B references, virtual dispatch finds the last override, which is B\'s sealed version. Only the C-typed variable sees the hiding method C.M().', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a sealed class PasswordHasher with a method Mask(string pwd) that returns stars of the same length. Try to inherit it and note the error code.',
      hint: 'new string(\'*\', pwd.Length). Error CS0509.',
      solution: `PasswordHasher h = new PasswordHasher();
Console.WriteLine(h.Mask("secret12"));   // ********

// class MyHasher : PasswordHasher { }   // CS0509

sealed class PasswordHasher
{
    public string Mask(string pwd) => new string('*', pwd.Length);
}`,
    },
    {
      task: 'Create Vehicle (virtual MaxSpeed() returns 100), Car : Vehicle (sealed override returns 180) and SportsCar : Car. Try to override MaxSpeed in SportsCar; then use new instead and print results through a Vehicle reference and a SportsCar reference.',
      hint: 'Vehicle reference -> 180, SportsCar reference -> your new value.',
      solution: `Vehicle v = new SportsCar();
SportsCar s = new SportsCar();
Console.WriteLine(v.MaxSpeed());   // 180
Console.WriteLine(s.MaxSpeed());   // 300

class Vehicle { public virtual int MaxSpeed() => 100; }
class Car : Vehicle { public sealed override int MaxSpeed() => 180; }
class SportsCar : Car
{
    // public override int MaxSpeed() => 300;   // CS0239
    public new int MaxSpeed() => 300;
}`,
    },
    {
      task: 'Split a Student class into Student.Info.cs (Id, Name, constructor) and Student.Marks.cs (int[] Marks, Total(), Average()). Print a report from Program.cs.',
      hint: 'Both files: public partial class Student. Use integer average Total() / Marks.Length.',
      solution: `// Program.cs
Student s = new Student(1, "Asha", new[] { 80, 90, 70 });
Console.WriteLine($"{s.Name}: Total {s.Total()}, Average {s.Average()}");
// Asha: Total 240, Average 80

// Student.Info.cs
public partial class Student
{
    public int Id { get; }
    public string Name { get; }
    public Student(int id, string name, int[] marks) { Id = id; Name = name; Marks = marks; }
}

// Student.Marks.cs
public partial class Student
{
    public int[] Marks { get; }
    public int Total() => Marks.Sum();
    public int Average() => Total() / Marks.Length;
}`,
    },
    {
      task: 'Add a partial method partial void OnValidate(string name, int price) to the Order example. Implement it in Order.Custom.cs to print a warning when price is 0. Call it at the start of AddItem.',
      hint: 'Declare in Order.Generated.cs, implement in Order.Custom.cs. Remove the implementation and observe it still compiles.',
      solution: `// Order.Generated.cs (inside the partial class)
partial void OnValidate(string name, int price);
// first line of AddItem:
// OnValidate(name, price);

// Order.Custom.cs (inside the partial class)
partial void OnValidate(string name, int price)
{
    if (price == 0)
        Console.WriteLine($"  Warning: {name} has price 0");
}`,
    },
    {
      task: 'Write a sealed partial class Invoice split across two files: one part with InvoiceNo and Amount, the other with Gst() (18%) and Print(). Verify with typeof(Invoice).IsSealed.',
      hint: 'sealed needs to be written on at least one part; it applies to the whole class.',
      solution: `Invoice inv = new Invoice { InvoiceNo = "INV-7", Amount = 2000 };
inv.Print();                                   // INV-7: 2000 + GST 360 = 2360
Console.WriteLine(typeof(Invoice).IsSealed);   // True

public sealed partial class Invoice
{
    public string InvoiceNo { get; set; } = "";
    public int Amount { get; set; }
}

public partial class Invoice
{
    public int Gst() => Amount * 18 / 100;
    public void Print() => Console.WriteLine($"{InvoiceNo}: {Amount} + GST {Gst()} = {Amount + Gst()}");
}`,
    },
  ],
  quiz: [
    {
      question: 'What happens when you write class B : A and A is sealed?',
      options: ['B inherits only public members', 'Compile error CS0509', 'Runtime exception', 'A warning only'],
      answer: 1,
      explanation: 'A sealed class cannot be used as a base class; the compiler reports CS0509.',
    },
    {
      question: 'The sealed keyword on a method must be combined with...',
      options: ['virtual', 'static', 'new', 'override'],
      answer: 3,
      explanation: 'Only an overriding method can be sealed: public sealed override void M().',
    },
    {
      question: 'Which is NOT a rule of partial classes?',
      options: ['All parts must be in the same project', 'All parts must use the partial keyword', 'Each part must be in a different namespace', 'Parts are merged into one class at compile time'],
      answer: 2,
      explanation: 'All parts must be in the SAME namespace; otherwise they would be different classes.',
    },
    {
      question: 'A classic partial method (partial void OnCreated();) is never implemented. What happens?',
      options: ['The compiler removes the declaration and all calls to it', 'Compile error', 'It throws NotImplementedException', 'It runs an empty body at runtime'],
      answer: 0,
      explanation: 'Unimplemented classic partial methods are removed completely, including their call sites.',
    },
    {
      question: 'Which built-in type is sealed?',
      options: ['System.Object', 'System.String', 'System.Exception', 'System.IO.Stream'],
      answer: 1,
      explanation: 'String is sealed. Object, Exception and Stream are designed to be inherited.',
    },
  ],
};
