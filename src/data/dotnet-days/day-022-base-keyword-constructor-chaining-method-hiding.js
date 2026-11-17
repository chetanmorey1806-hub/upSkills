const baseCtorCode = `// Day 22 - Example 1: Calling the parent constructor with base(...)
var e = new Employee("Anita", 29, 101, 50000);
Console.WriteLine($"{e.Name}, {e.Age}, Id {e.EmployeeId}, Salary {e.Salary}");
Console.WriteLine("---");
var i = new Intern("Rohit", 21);
Console.WriteLine($"{i.Name}, {i.Age}, Id {i.EmployeeId}, Salary {i.Salary}");

class Person
{
    public string Name { get; }
    public int Age { get; }

    // Person has NO parameterless constructor
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
        Console.WriteLine($"Person constructor: {Name}");
    }
}

class Employee : Person
{
    public int EmployeeId { get; }
    public int Salary { get; }

    // pass name and age UP to Person; keep id and salary here
    public Employee(string name, int age, int employeeId, int salary) : base(name, age)
    {
        EmployeeId = employeeId;
        Salary = salary;
        Console.WriteLine($"Employee constructor: {EmployeeId}");
    }

    // without ": base(...)" this would be error CS7036:
    // There is no argument given that corresponds to the required parameter 'name' of 'Person.Person(string, int)'
}

class Intern : Employee
{
    // fixed values can be passed to the parent too
    public Intern(string name, int age) : base(name, age, 900, 15000)
    {
        Console.WriteLine("Intern constructor");
    }
}`;

const chainingCode = `// Day 22 - Example 2: Full constructor chaining - this(...) + base(...) + field initializers
var m1 = new Manager("Rahul");
Console.WriteLine("---");
var m2 = new Manager("Sana", 8);
Console.WriteLine("---");
Console.WriteLine($"{m1.Name} team {m1.TeamSize}; {m2.Name} team {m2.TeamSize}");

class Employee
{
    private int employeeMarker = Log.Write("Employee field initializer");
    public string Name { get; }

    public Employee(string name)
    {
        Name = name;
        Console.WriteLine("Employee(name) body");
    }
}

class Manager : Employee
{
    private int managerMarker = Log.Write("Manager field initializer");
    public int TeamSize { get; }

    public Manager(string name) : this(name, 3)        // same class
    {
        Console.WriteLine("Manager(name) body");
    }

    public Manager(string name, int teamSize) : base(name)   // parent class
    {
        TeamSize = teamSize;
        Console.WriteLine("Manager(name, teamSize) body");
    }
}

static class Log
{
    public static int Write(string message)
    {
        Console.WriteLine(message);
        return 0;
    }
}`;

const hidingCode = `// Day 22 - Example 3: Method hiding (new) vs method overriding (override)
Parent p = new Parent();
Child c = new Child();
Parent pc = new Child();      // parent reference, child object

Console.WriteLine("== Greet (hidden with new) ==");
p.Greet();
c.Greet();
pc.Greet();

Console.WriteLine("== Show (overridden) ==");
p.Show();
c.Show();
pc.Show();

class Parent
{
    public void Greet() => Console.WriteLine("Parent.Greet");
    public virtual void Show() => Console.WriteLine("Parent.Show");
}

class Child : Parent
{
    public new void Greet() => Console.WriteLine("Child.Greet (hides)");
    public override void Show() => Console.WriteLine("Child.Show (overrides)");
}`;

const payslipCode = `// Day 22 - Example 4: base.Method() to reuse parent logic, and hiding a field
var m = new Manager { Name = "Sana", Basic = 80000, Allowance = 15000 };
m.PrintPayslip();
Console.WriteLine("---");

Employee asEmployee = m;      // same object, parent-type reference
asEmployee.PrintPayslip();
Console.WriteLine("---");

Console.WriteLine($"m.Role = {m.Role}, asEmployee.Role = {asEmployee.Role}");

class Employee
{
    public string Name = "";
    public int Basic;
    public string Role = "Employee";

    public void PrintPayslip()
    {
        Console.WriteLine($"Payslip: {Name}");
        Console.WriteLine($"Basic: {Basic}");
    }
}

class Manager : Employee
{
    public int Allowance;
    public new string Role = "Manager";       // hides Employee.Role (two fields now exist)

    public new void PrintPayslip()            // hides Employee.PrintPayslip
    {
        base.PrintPayslip();                  // reuse the parent version first
        Console.WriteLine($"Allowance: {Allowance}");
        Console.WriteLine($"Total: {Basic + Allowance}");
    }
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App',
  `Name it ${name}, choose .NET 8 or .NET 10, click Create`,
  'Replace Program.cs with the code',
  'Press Ctrl+F5 to run without debugging',
];

export default {
  id: 'day-022-base-keyword-constructor-chaining-method-hiding',
  title: 'base Keyword, Constructor Chaining and Method Hiding',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 22,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `Parent and child classes must cooperate. Today you learn the base keyword to call a parent constructor (base(...)) and parent members (base.Method()), full constructor chaining with this(...) and base(...) including the exact order of field initializers and constructor bodies, and method hiding with the new modifier - and why hiding behaves completely differently from overriding when a parent reference points to a child object. These are favourite output-prediction interview questions.`,
  objectives: [
    'Pass data from a child constructor to a parent constructor with base(...)',
    'Call a parent version of a method from the child with base.Method()',
    'Trace constructor chaining across this(...) and base(...) including field initializers',
    'Hide a parent member with new and explain warning CS0108',
    'Predict output of hiding vs overriding with parent and child references',
  ],
  theory: [
    {
      heading: 'The base Keyword',
      content: `base refers to the **parent (base) class part of the current object**. It is to the parent what this is to the current class.

Real-world analogy: a son runs the family shop. When a customer asks for the old recipe, he says "let me do it the way **my father** does" (base.MakeSweet()), and then adds his own decoration. When the son opens a new branch, he first takes his **father's blessing and family name** (base(...) constructor call) before adding his own details.

Two uses:
1. **base(...)** in a constructor header - call a specific parent constructor and pass arguments to it.
2. **base.Member** inside a method - access the parent's version of a method, property or field, usually when the child has overridden or hidden it.

Rules:
- base cannot be used in a static method (no current object) - CS1511.
- base refers only to the immediate parent; base.base.Method() is not allowed.
- A constructor header can contain either base(...) or this(...), not both.`,
      syntax: `class Employee : Person
{
    public Employee(string name, int age, int id) : base(name, age)   // 1. parent constructor
    {
        Id = id;
    }

    public new void Introduce()
    {
        base.Introduce();                       // 2. parent version of the method
        Console.WriteLine($"My employee id is {Id}");
    }
}`,
    },
    {
      heading: 'Calling Parent Constructors with base(...)',
      content: `Every child constructor **always** calls a parent constructor first - there is no way to skip it, because the parent part of the object must be initialised before the child part.

- If you write nothing, C# inserts : base() - a call to the parent's **parameterless** constructor.
- If the parent has **no** parameterless constructor (only Person(string name, int age)), the child **must** call base(name, age) explicitly, otherwise error **CS7036**.
- You can pass child parameters, constants or expressions: : base(name, age, 900, 15000) or : base(name.Trim(), 0).

Why not set Name in the child? Because Name may have only a getter or a private setter in the parent; only the parent's constructor may set it. base(...) respects the parent's encapsulation.`,
      points: [
        'Implicit: public Employee() { } is compiled as public Employee() : base() { }',
        'Explicit: public Employee(string n, int a) : base(n, a) { }',
        'The parent constructor runs completely before the child constructor body starts',
        'Arguments to base(...) cannot use this or instance members of the child (they are not ready yet); static members and parameters are fine',
      ],
    },
    {
      heading: 'Constructor Chaining: this(...) and base(...) Together',
      content: `**Constructor chaining** = one constructor calling another before its own body runs.
- this(...) -> another constructor of the **same** class (Day 18).
- base(...) -> a constructor of the **parent** class.

Exact order when you create a derived object (very common interview question):
1. **Derived field initializers** run (in the constructor that calls base, not in one that calls this).
2. **Base field initializers** run.
3. **Base constructor body** runs.
4. **Derived constructor body** runs.
5. If the derived constructor was reached through this(...), the calling constructor's body runs last.

Yes - field initializers run **derived first**, then base, but constructor **bodies** run **base first**, then derived. Example 2 proves it.

Analogy: building a two-floor house. Materials for both floors are delivered first (field initializers: the top floor's truck arrives first, then the ground floor's), but construction happens ground floor first, then the top floor.`,
      syntax: `class Manager : Employee
{
    public Manager(string name) : this(name, 3) { }                 // -> same class
    public Manager(string name, int team) : base(name) { ... }      // -> parent class
}`,
    },
    {
      heading: 'Method Hiding with the new Modifier',
      content: `**Method hiding** (also called **shadowing**) happens when a child declares a member with the **same name and signature** as a parent member that is **not virtual** (or when the child simply chooses not to override). The child's member **hides** the parent's member.

If you do it without any keyword, the compiler gives **warning CS0108**: "'Child.Greet()' hides inherited member 'Parent.Greet()'. Use the new keyword if hiding was intended." Writing **new** tells the compiler (and readers) that hiding is deliberate and removes the warning. The new modifier does not change behaviour; it only states intent.

The key rule: with hiding, **the REFERENCE (variable) type decides** which method runs - at **compile time**.
- Child c = new Child(); c.Greet() -> Child version
- Parent pc = new Child(); pc.Greet() -> **Parent** version (the variable type is Parent)

With **overriding** (virtual + override, Day 24), **the OBJECT type decides** - at **runtime**: pc.Show() -> Child version.

Analogy: hiding is like putting a **sticker over a label** on a jar. If you look at the jar from the child's side, you see the sticker; from the parent's side, you still see the original label. Overriding is **replacing the contents** of the jar: whoever opens it gets the new contents.

You can also hide fields and properties (public new string Role) - the object then contains BOTH fields, and the reference type decides which one you read.`,
      syntax: `class Parent { public void Greet() { ... } }
class Child : Parent { public new void Greet() { ... } }     // hiding

class Parent2 { public virtual void Show() { ... } }
class Child2 : Parent2 { public override void Show() { ... } } // overriding`,
    },
    {
      heading: 'Hiding vs Overriding - Comparison',
      content: `| Point | Method hiding (new) | Method overriding (override) |
| --- | --- | --- |
| Parent method must be | any (normally non-virtual) | virtual, abstract or override |
| Keyword in child | new (optional, removes CS0108) | override (required) |
| Which version runs | decided by reference type | decided by object type |
| Binding | compile time (static) | runtime (dynamic) |
| Parent ref -> child object | parent version | child version |
| Polymorphism? | No - breaks it | Yes - runtime polymorphism |
| Typical use | rare: you do not control the parent, or a parent later adds a member with the same name | normal way to customise behaviour |

Best practice: prefer **virtual/override**. Use new only when you cannot change the parent (third-party library) or to resolve an accidental name clash, and document it. Both styles can call the parent version with base.Method().`,
      tip: `Hiding can surprise colleagues: the same object prints different results depending on the variable type (Example 4). In code reviews, a CS0108 warning usually means the developer forgot virtual/override.`,
    },
  ],
  examples: [
    {
      title: 'Parent-Child Classes with base(...) Constructor Calls',
      scenario: `Person has only a parameterized constructor and read-only properties. Employee must pass name and age up with base(...), and Intern passes fixed id and salary values up to Employee.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it BaseConstructorDemo, click Create',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Remove ": base(name, age)" from the Employee constructor and build (Ctrl+Shift+B) - read error CS7036, then undo with Ctrl+Z',
      ],
      code: baseCtorCode,
      csharp: { files: { 'Program.cs': baseCtorCode }, stdin: '' },
      result: `Person constructor: Anita
Employee constructor: 101
Anita, 29, Id 101, Salary 50000
---
Person constructor: Rohit
Employee constructor: 900
Intern constructor
Rohit, 21, Id 900, Salary 15000`,
      explanation: `base(name, age) forwards the values to Person, whose constructor runs first and sets the read-only Name and Age. For new Intern("Rohit", 21) the chain is Intern -> Employee(name, age, 900, 15000) -> Person(name, age), so the bodies print Person, Employee, Intern.`,
    },
    {
      title: 'Constructor Chaining Order: this(...), base(...) and Field Initializers',
      scenario: `A Manager can be created with only a name (default team size 3) or with a team size. We log every field initializer and constructor body to see the exact order the CLR uses.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ConstructorChainingOrder, click Create',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on var m1 = ...; press F5 and press F11 repeatedly to follow the order',
        'Run with Ctrl+F5 to see the complete output (ignore warnings CS0414 about the unused marker fields)',
      ],
      code: chainingCode,
      csharp: { files: { 'Program.cs': chainingCode }, stdin: '' },
      result: `Manager field initializer
Employee field initializer
Employee(name) body
Manager(name, teamSize) body
Manager(name) body
---
Manager field initializer
Employee field initializer
Employee(name) body
Manager(name, teamSize) body
---
Rahul team 3; Sana team 8`,
      explanation: `new Manager("Rahul") goes to Manager(name), which immediately forwards with this(name, 3); a constructor that calls this(...) does not run field initializers. Manager(name, teamSize) runs the Manager field initializers, then calls base(name): Employee's field initializers run, then Employee's body. Control returns and the bodies complete from the inside out: Manager(name, teamSize), then Manager(name). For m2 the 2-parameter constructor is called directly, so there is no "Manager(name) body" line.`,
    },
    {
      title: 'Method Hiding vs Overriding - Output Prediction',
      scenario: `The classic interview program: three variables (Parent object, Child object, Parent reference to a Child object) call a hidden method and an overridden method.`,
      steps: steps('HidingVsOverriding'),
      code: hidingCode,
      csharp: { files: { 'Program.cs': hidingCode }, stdin: '' },
      result: `== Greet (hidden with new) ==
Parent.Greet
Child.Greet (hides)
Parent.Greet
== Show (overridden) ==
Parent.Show
Child.Show (overrides)
Child.Show (overrides)`,
      explanation: `Greet is hidden: the compiler picks the method from the variable type, so pc (type Parent) calls Parent.Greet even though the object is a Child. Show is virtual and overridden: the runtime looks at the actual object, so pc.Show() runs Child.Show. Only the third line in each group differs - remember "hiding follows the reference, overriding follows the object".`,
    },
    {
      title: 'Manager Payslip: base.Method() and a Hidden Field',
      scenario: `A Manager payslip should print everything an Employee payslip prints plus allowance and total. Instead of copying code, the child calls base.PrintPayslip(). The Role field is hidden to show that the object then holds two Role fields.`,
      steps: steps('ParentChildPayslip'),
      code: payslipCode,
      csharp: { files: { 'Program.cs': payslipCode }, stdin: '' },
      result: `Payslip: Sana
Basic: 80000
Allowance: 15000
Total: 95000
---
Payslip: Sana
Basic: 80000
---
m.Role = Manager, asEmployee.Role = Employee`,
      explanation: `m.PrintPayslip() runs the Manager version, which first calls base.PrintPayslip() (two lines) and then adds its own (80000 + 15000 = 95000). Through the Employee reference, the hidden parent version runs, so allowance and total are missing - a real bug risk with hiding; virtual/override would fix it. The object contains both Role fields, and the reference type decides which one is read.`,
    },
  ],
  interview: [
    { q: `What is the base keyword used for?`, a: `To access the parent class from a derived class: base(...) in a constructor header calls a specific parent constructor, and base.Member calls the parent's version of a method/property/field (useful when the child has overridden or hidden it).`, level: 'Easy' },
    { q: `What is the difference between this and base?`, a: `this refers to the current object/class: this.field, this(...) calls another constructor of the same class. base refers to the parent part: base.Method(), base(...) calls a parent constructor. Neither can be used in static members.`, level: 'Easy' },
    { q: `What happens if the parent class has only a parameterized constructor and the child does not call base(...)?`, a: `Compile error CS7036. The child constructor implicitly tries to call base(), which does not exist. Fix by calling base(args) explicitly or adding a parameterless constructor to the parent.`, level: 'Medium' },
    { q: `Can a constructor call both this(...) and base(...)?`, a: `No, only one initializer is allowed in a constructor header. But the chain can combine them: A(x) : this(x, 0) and A(x, y) : base(x).`, level: 'Medium' },
    { q: `What is the order of field initializers and constructor bodies when creating a derived object?`, a: `Derived field initializers, then base field initializers, then the base constructor body, then the derived constructor body. If the derived constructor was entered through this(...), the calling constructor's body runs last, and that constructor does not run field initializers itself.`, level: 'Hard' },
    { q: `What is method hiding?`, a: `When a derived class declares a member with the same name/signature as an inherited member, the derived member hides the base member. The new modifier marks it as intentional. Which member is used is decided by the compile-time (reference) type.`, level: 'Easy' },
    { q: `What is warning CS0108 and how do you fix it?`, a: `"Member hides inherited member; use the new keyword if hiding was intended." Fix by adding new (if hiding is intended) or, more commonly, by making the parent member virtual and using override in the child.`, level: 'Medium' },
    { q: `Difference between method hiding and method overriding?`, a: `Hiding (new) works on any parent method, is resolved at compile time by the reference type, and does not give polymorphism. Overriding requires virtual/abstract in the parent and override in the child, is resolved at runtime by the object type, and gives runtime polymorphism.`, level: 'Medium' },
    { q: `Predict: class A { public void M() => Console.Write("A"); } class B : A { public new void M() => Console.Write("B"); }  A x = new B(); x.M(); ((B)x).M();`, a: `AB - x has type A, so A.M runs; after casting to B, the hiding method B.M runs.`, level: 'Medium' },
    { q: `Predict: class A { public virtual void M() => Console.Write("A"); } class B : A { public override void M() { base.M(); Console.Write("B"); } }  A x = new B(); x.M();`, a: `AB - override runs because the object is B; inside it base.M() prints A first, then B is printed.`, level: 'Medium' },
    { q: `Can you call a grandparent's method with base.base.Method()?`, a: `No, that syntax is not allowed; base refers only to the immediate parent. The parent can expose a method that calls its own base version if needed.`, level: 'Hard' },
    { q: `Can you use new and override together on the same method? What about new virtual?`, a: `new override is not allowed (CS0113). new virtual is allowed: it hides the parent member and starts a fresh virtual chain that grandchildren can override.`, level: 'Hard' },
  ],
  practice: [
    { task: `Create Vehicle(string number) and Car : Vehicle with constructor Car(string number, int seats) : base(number). Print messages from both constructors.`, hint: `The Vehicle constructor message must appear first.`, solution: `var c = new Car("KA01X9999", 5);

class Vehicle
{
    public string Number { get; }
    public Vehicle(string number) { Number = number; Console.WriteLine($"Vehicle {Number} registered"); }
}
class Car : Vehicle
{
    public int Seats { get; }
    public Car(string number, int seats) : base(number)
    {
        Seats = seats;
        Console.WriteLine($"Car with {Seats} seats ready");
    }
}
// Output:
// Vehicle KA01X9999 registered
// Car with 5 seats ready` },
    { task: `Create Person with Display() printing the name, and Student : Person with a new Display() that calls base.Display() and then prints the roll number.`, hint: `public new void Display() { base.Display(); ... }`, solution: `var s = new Student { Name = "Kavya", RollNo = 42 };
s.Display();

class Person
{
    public string Name = "";
    public void Display() => Console.WriteLine($"Name: {Name}");
}
class Student : Person
{
    public int RollNo;
    public new void Display()
    {
        base.Display();
        Console.WriteLine($"Roll No: {RollNo}");
    }
}
// Output:
// Name: Kavya
// Roll No: 42` },
    { task: `Predict and then verify the output: A has Print() (non-virtual) and Info() (virtual); B hides Print with new and overrides Info. Call both through A a = new B();`, hint: `Hiding follows the reference, overriding follows the object.`, solution: `A a = new B();
a.Print();
a.Info();

class A
{
    public void Print() => Console.WriteLine("A.Print");
    public virtual void Info() => Console.WriteLine("A.Info");
}
class B : A
{
    public new void Print() => Console.WriteLine("B.Print");
    public override void Info() => Console.WriteLine("B.Info");
}
// Output:
// A.Print
// B.Info` },
    { task: `Build Account(int no, int balance) -> SavingsAccount(int no, int balance) : base(no, balance) -> FixedDeposit(int no, int balance, int years) : base(no, balance). Each constructor prints a line. Create a FixedDeposit.`, hint: `Three levels: constructors print in order Account, SavingsAccount, FixedDeposit.`, solution: `var fd = new FixedDeposit(7001, 100000, 3);

class Account
{
    public int No { get; }
    public int Balance { get; }
    public Account(int no, int balance) { No = no; Balance = balance; Console.WriteLine($"Account {No} opened with {Balance}"); }
}
class SavingsAccount : Account
{
    public SavingsAccount(int no, int balance) : base(no, balance) => Console.WriteLine("Savings features enabled");
}
class FixedDeposit : SavingsAccount
{
    public int Years { get; }
    public FixedDeposit(int no, int balance, int years) : base(no, balance)
    {
        Years = years;
        Console.WriteLine($"Locked for {Years} years");
    }
}
// Output:
// Account 7001 opened with 100000
// Savings features enabled
// Locked for 3 years` },
    { task: `Give Product two constructors: Product(string name) : this(name, 100) and Product(string name, int price). Make DiscountProduct : Product call base(name, price) and print the final price after a 10% discount.`, hint: `FinalPrice => Price - Price * 10 / 100`, solution: `var d = new DiscountProduct("Headphones", 2000);
Console.WriteLine($"{d.Name}: {d.Price} -> {d.FinalPrice}");
var p = new Product("Notebook");
Console.WriteLine($"{p.Name}: {p.Price}");

class Product
{
    public string Name { get; }
    public int Price { get; }
    public Product(string name) : this(name, 100) { }
    public Product(string name, int price) { Name = name; Price = price; }
}
class DiscountProduct : Product
{
    public DiscountProduct(string name, int price) : base(name, price) { }
    public int FinalPrice => Price - Price * 10 / 100;
}
// Output:
// Headphones: 2000 -> 1800
// Notebook: 100` },
  ],
  quiz: [
    { question: `Which syntax calls the parent class constructor?`, options: [`public Employee(string n) : this(n) { }`, `public Employee(string n) { base(n); }`, `public Employee(string n) : base(n) { }`, `public Employee(string n) : super(n) { }`], answer: 2, explanation: `base(...) must appear in the constructor header after a colon. super is Java.` },
    { question: `Parent pc = new Child(); Greet() is hidden in Child using new. pc.Greet() runs:`, options: [`Parent.Greet`, `Child.Greet`, `Both`, `Compile error`], answer: 0, explanation: `With hiding, the reference type (Parent) decides which method runs.` },
    { question: `What does the new modifier on a method do?`, options: [`Creates a new object`, `Makes the method virtual`, `Forces overriding`, `Declares intentional hiding and removes warning CS0108`], answer: 3, explanation: `new only states that hiding is intended; behaviour is the same as hiding without it.` },
    { question: `When a derived object is created, which runs first?`, options: [`Base constructor body`, `Derived field initializers`, `Derived constructor body`, `Base field initializers`], answer: 1, explanation: `Derived field initializers run first, then base field initializers, then base body, then derived body.` },
    { question: `Inside an overriding method, how do you run the parent's implementation?`, options: [`this.Method()`, `Parent.Method()`, `base.Method()`, `super.Method()`], answer: 2, explanation: `base.Method() calls the immediate parent's version.` },
  ],
};
