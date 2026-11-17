const singleCode = `// Day 21 - Example 1: Single inheritance - Person -> Employee
Employee e = new Employee();
e.Name = "Anita";          // inherited from Person
e.Age = 29;                // inherited from Person
e.EmployeeId = 101;        // Employee's own member
e.Salary = 50000;

e.Introduce();             // inherited method
e.Work();                  // Employee's own method
e.ShowSalary();

Person p = new Person();
p.Name = "Ravi";
p.Age = 45;
p.Introduce();
// p.Work();               // error CS1061: Person does not contain a definition for 'Work'

class Person                         // base / parent class
{
    public string Name = "";
    public int Age;

    public void Introduce() => Console.WriteLine($"Hi, I am {Name}, {Age} years old");
}

class Employee : Person              // derived / child class: Employee IS-A Person
{
    public int EmployeeId;
    public int Salary;

    public void Work() => Console.WriteLine($"{Name} (Emp {EmployeeId}) is working");
    public void ShowSalary() => Console.WriteLine($"Salary of {Name}: {Salary}");
}`;

const multilevelCode = `// Day 21 - Example 2: Multilevel inheritance - Person -> Employee -> Manager
Manager m = new Manager { Name = "Rahul", EmployeeId = 101, TeamSize = 5 };
Console.WriteLine("---");
m.Introduce();     // from Person (grandparent)
m.Work();          // from Employee (parent)
m.Manage();        // from Manager (itself)

class Person
{
    public string Name = "";
    public Person() => Console.WriteLine("Person constructor");
    public void Introduce() => Console.WriteLine($"Hi, I am {Name}");
}

class Employee : Person
{
    public int EmployeeId;
    public Employee() => Console.WriteLine("Employee constructor");
    public void Work() => Console.WriteLine($"{Name} works as employee {EmployeeId}");
}

class Manager : Employee
{
    public int TeamSize;
    public Manager() => Console.WriteLine("Manager constructor");
    public void Manage() => Console.WriteLine($"{Name} manages a team of {TeamSize}");
}`;

const hierarchicalCode = `// Day 21 - Example 3: Hierarchical inheritance - one parent, many children
var dev = new Developer { Name = "Kiran", BaseSalary = 60000, Language = "C#" };
var qa = new Tester { Name = "Meera", BaseSalary = 45000, Tool = "Selenium" };

dev.ShowBasic();
dev.WriteCode();
qa.ShowBasic();
qa.TestApp();

Console.WriteLine($"Developer bonus: {dev.Bonus()}");
Console.WriteLine($"Tester bonus: {qa.Bonus()}");

Employee[] team = { dev, qa };       // a parent-type array can hold any child
foreach (Employee member in team)
{
    Console.WriteLine($"{member.Name} -> {member.GetType().Name}, is Developer: {member is Developer}");
}

class Employee
{
    public string Name = "";
    public int BaseSalary;
    public void ShowBasic() => Console.WriteLine($"{Name} earns {BaseSalary}");
    public int Bonus() => BaseSalary * 10 / 100;
}

class Developer : Employee
{
    public string Language = "";
    public void WriteCode() => Console.WriteLine($"{Name} writes code in {Language}");
}

class Tester : Employee
{
    public string Tool = "";
    public void TestApp() => Console.WriteLine($"{Name} tests the app using {Tool}");
}`;

const rulesCode = `// Day 21 - Example 4: What is (and is not) inherited + one class, many interfaces
var e = new Employee();
e.SetName("Asha");
e.ShowDetails();

Console.WriteLine(e.ToString());                    // ToString inherited from System.Object
Console.WriteLine(e.GetType().BaseType!.Name);      // parent of Employee
Console.WriteLine(typeof(Person).BaseType!.Name);   // parent of Person

var phone = new SmartPhone();
phone.Call("98765");
phone.TakePhoto();
phone.PlayMusic();

class Person
{
    private string aadhaar = "XXXX-XXXX-1234";   // private: exists in the object but child cannot touch it
    protected string name = "";                   // protected: child can use it

    public void SetName(string n) => name = n;
    public string LastFour() => aadhaar.Substring(aadhaar.Length - 4);
}

class Employee : Person
{
    public void ShowDetails()
    {
        // Console.WriteLine(aadhaar);          // error CS0122: inaccessible due to its protection level
        Console.WriteLine($"Employee {name}, ID ends with {LastFour()}");
    }
}

// class Hybrid : Person, Employee { }       // error CS1721: cannot have multiple base classes

class Phone
{
    public void Call(string number) => Console.WriteLine($"Calling {number}");
}

interface ICamera { void TakePhoto(); }
interface IMusicPlayer { void PlayMusic(); }

class SmartPhone : Phone, ICamera, IMusicPlayer   // ONE base class + MANY interfaces
{
    public void TakePhoto() => Console.WriteLine("Photo clicked");
    public void PlayMusic() => Console.WriteLine("Playing music");
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App',
  `Name it ${name}, choose .NET 8 or .NET 10, click Create`,
  'Replace Program.cs with the code',
  'Press Ctrl+F5 to run without debugging',
];

export default {
  id: 'day-021-inheritance-single-multilevel-hierarchical',
  title: 'Inheritance: Single, Multilevel and Hierarchical',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 21,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Inheritance lets a new class reuse and extend an existing class: an Employee IS-A Person, so it automatically gets Name, Age and Introduce() and adds its own EmployeeId and Salary. Today you learn base and derived classes, the : syntax, the IS-A relationship, single, multilevel and hierarchical inheritance, why C# does not allow multiple class inheritance (and how interfaces solve it), what is and is not inherited, constructor execution order and System.Object as the root of every class.`,
  objectives: [
    'Explain inheritance, base/derived classes and the IS-A relationship with analogies',
    'Implement single (Person -> Employee), multilevel (Person -> Employee -> Manager) and hierarchical (Employee -> Developer, Tester) inheritance',
    'Predict constructor execution order in an inheritance chain',
    'State what is inherited (and accessible) and what is not: private members, constructors, static members',
    'Explain why C# has no multiple class inheritance and how interfaces provide it',
  ],
  theory: [
    {
      heading: 'What is Inheritance?',
      content: `**Inheritance** is the OOP feature by which one class (the **derived / child / sub class**) **acquires the members of another class** (the **base / parent / super class**) and can **add new members** or change behaviour. It gives **code reuse** and models an **IS-A** relationship.

Real-world analogy 1 - **family**: a child inherits surname, eye colour and house from parents, and also has their own skills and hobbies.

Real-world analogy 2 - **company staff**: every Employee IS-A Person (has a name, age, can introduce themselves) and additionally has an employee id and salary. A Manager IS-A Employee and additionally manages a team.

Real-world analogy 3 - **vehicles**: Car and Bike are both Vehicles; they share number plate, Start() and Stop(), but a Car has 4 doors and a Bike has a kick-start.

The **IS-A test**: if "Child IS-A Parent" sounds correct in English, inheritance may fit. "Car is a Vehicle" - yes. "Car is an Engine" - no; a car HAS-A engine (composition, Extra topic), so do not inherit.

Benefits: reuse code instead of copy-paste, one place to fix common logic, natural modelling, and it is the foundation of polymorphism (Day 23-24).`,
      syntax: `class Person                 // base class
{
    public string Name = "";
    public void Introduce() { ... }
}

class Employee : Person      // ':' means "inherits from"
{
    public int Salary;       // new member
}`,
    },
    {
      heading: 'Types of Inheritance',
      content: `**1. Single inheritance** - one child, one parent.
Person -> Employee

**2. Multilevel inheritance** - a chain: a child becomes the parent of another class.
Person -> Employee -> Manager (Manager gets members of Employee AND Person)

**3. Hierarchical inheritance** - one parent, many children.
Employee -> Developer, Employee -> Tester, Employee -> HrExecutive

**4. Multiple inheritance** - one child, many parents (class C : A, B). **NOT supported for classes in C#.** It is achieved through **interfaces**: class SmartPhone : Phone, ICamera, IMusicPlayer.

**5. Hybrid inheritance** - a mix of the above types. Possible only when the "multiple" part uses interfaces.

Diagram in words:
- Single:       Person
                  |
               Employee
- Multilevel:   Person -> Employee -> Manager
- Hierarchical:         Employee
                       /        \\
                 Developer     Tester`,
      points: [
        'C# supports: single, multilevel, hierarchical (with classes)',
        'C# does NOT support multiple class inheritance - error CS1721',
        'A class can implement any number of interfaces, plus inherit from at most one class',
        'Every class ultimately inherits from System.Object (object), even if you write no ":"',
      ],
    },
    {
      heading: 'Why No Multiple Class Inheritance? (The Diamond Problem)',
      content: `Suppose classes B and C both inherit from A and both override a method Print(). If class D could inherit from B and C, then d.Print() would be ambiguous - which version should run? Also, would D contain one copy of A's fields or two? This is the **diamond problem**.

C# (like Java) avoids it by allowing **only one base class**. Interfaces only declare a contract (or provide default implementations that must be resolved explicitly), so a class can implement many interfaces safely.

Analogy: a child can have only one biological surname from the family tree (one base class), but can hold many certificates and licences - driving licence, swimming certificate, coding certificate (many interfaces).`,
    },
    {
      heading: 'What Gets Inherited?',
      points: [
        'Public, protected and internal fields, properties, methods and events are inherited and usable in the child',
        'Private members ARE part of the child object (memory) but are NOT accessible in the child code (CS0122) - use them via public/protected methods of the parent',
        'Constructors are NOT inherited - a child must define its own; the parent constructor is always called first (Day 22: base keyword)',
        'Static members are not inherited per object but can be accessed through the child class name (Manager.CompanyName works if Person declares it)',
        'Members of System.Object (ToString, Equals, GetHashCode, GetType) are inherited by every class',
        'A sealed class cannot be inherited (Day 27): string is sealed',
        'A child cannot be more accessible than its parent: public class Employee : InternalPerson gives error CS0060',
      ],
      content: `Object creation: when you create a child object there is **one single object** in memory that contains the fields of all levels (Person fields + Employee fields + Manager fields). It is not "a parent object inside a child object".`,
    },
    {
      heading: 'Constructor Execution Order and Parent References',
      content: `When new Manager() runs in a Person -> Employee -> Manager chain, constructors execute **from the top (base) to the bottom (derived)**: Person, then Employee, then Manager. A house is built foundation first, then the walls, then the roof. Each child constructor implicitly calls the parent's parameterless constructor first (Day 22 shows how to call a parameterized one with base(...)).

**Parent reference, child object**: because a Developer IS-A Employee, you can store a Developer in an Employee variable: Employee x = new Developer();. Through x you can use only the Employee members (the compiler checks the reference type), but the object is still a Developer at runtime - x.GetType().Name prints "Developer". The is operator checks the runtime type. This is the basis of runtime polymorphism (Day 24).

The reverse is not allowed without a cast: Developer d = new Employee(); is a compile error (CS0266) because not every Employee is a Developer.`,
      syntax: `Employee x = new Developer();     // OK: upcasting (implicit)
Console.WriteLine(x is Developer); // True
// x.WriteCode();                  // error: Employee reference does not know WriteCode
if (x is Developer d) d.WriteCode();  // downcast safely with pattern matching`,
      tip: `Prefer shallow hierarchies (2-3 levels). Deep chains are hard to understand and change. "Favour composition over inheritance" when the relationship is HAS-A or when you only want to reuse a little code.`,
    },
  ],
  examples: [
    {
      title: 'Single Inheritance: Person -> Employee',
      scenario: `A company app already has a Person class. Instead of copying Name, Age and Introduce() into Employee, Employee inherits them and adds EmployeeId, Salary, Work() and ShowSalary().`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SingleInheritance, click Create',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Type e. in the editor and see IntelliSense list both Person members (Name, Age, Introduce) and Employee members',
        'Optional: right-click the project > View > View Class Diagram (requires the Class Designer component) to see the arrow from Employee to Person',
      ],
      code: singleCode,
      csharp: { files: { 'Program.cs': singleCode }, stdin: '' },
      result: `Hi, I am Anita, 29 years old
Anita (Emp 101) is working
Salary of Anita: 50000
Hi, I am Ravi, 45 years old`,
      explanation: `The Employee object has Name and Age even though Employee never declared them - they come from Person - and Introduce() works on it. Work() can use Name directly because it is a public member of the parent. A plain Person does not have Work(), so p.Work() would be a compile error: inheritance flows from parent to child only.`,
    },
    {
      title: 'Multilevel Inheritance and Constructor Order: Person -> Employee -> Manager',
      scenario: `A Manager is an Employee, and an Employee is a Person. Each class prints a message in its constructor so we can see the order in which they run when a single Manager object is created.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MultilevelInheritance, click Create',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on the first line, press F5 and press F11 to step into the constructors - notice Visual Studio jumps to Person first',
        'Run with Ctrl+F5 for the full output',
      ],
      code: multilevelCode,
      csharp: { files: { 'Program.cs': multilevelCode }, stdin: '' },
      result: `Person constructor
Employee constructor
Manager constructor
---
Hi, I am Rahul
Rahul works as employee 101
Rahul manages a team of 5`,
      explanation: `new Manager runs base constructors first: Person, then Employee, then Manager - top to bottom. The object initializer { Name = ..., EmployeeId = ..., TeamSize = ... } runs AFTER all constructors. One Manager object can use methods from all three levels.`,
    },
    {
      title: 'Hierarchical Inheritance: Employee -> Developer and Tester',
      scenario: `A software company has developers and testers. Both share Name, BaseSalary, ShowBasic() and Bonus() from Employee, but each has its own skills. A single Employee[] array stores both kinds.`,
      steps: steps('HierarchicalInheritance'),
      code: hierarchicalCode,
      csharp: { files: { 'Program.cs': hierarchicalCode }, stdin: '' },
      result: `Kiran earns 60000
Kiran writes code in C#
Meera earns 45000
Meera tests the app using Selenium
Developer bonus: 6000
Tester bonus: 4500
Kiran -> Developer, is Developer: True
Meera -> Tester, is Developer: False`,
      explanation: `Bonus() is written once in Employee and reused by both children: 60000 * 10 / 100 = 6000 and 45000 * 10 / 100 = 4500. The Employee[] array can hold both because each IS-A Employee. GetType() reports the real runtime class, and is Developer is True only for Kiran. Developer and Tester are siblings - neither inherits from the other.`,
    },
    {
      title: 'What is Inherited + One Base Class and Many Interfaces',
      scenario: `An Employee inherits a protected name but cannot read the parent's private Aadhaar number directly - it must use the parent's public LastFour() method. Every class also inherits from System.Object. Finally, a SmartPhone inherits from one class (Phone) and implements two interfaces, which is how C# achieves multiple inheritance.`,
      steps: steps('InheritanceRules'),
      code: rulesCode,
      csharp: { files: { 'Program.cs': rulesCode }, stdin: '' },
      result: `Employee Asha, ID ends with 1234
Employee
Person
Object
Calling 98765
Photo clicked
Playing music`,
      explanation: `name is protected, so Employee uses it directly; aadhaar is private, so Employee goes through LastFour(), which returns "1234". ToString() was never written, so the version inherited from System.Object prints the type name (Employee - there is no namespace in this top-level program). Employee's base type is Person, and Person's base type is Object. SmartPhone gets Call() from Phone and fulfils both interface contracts.`,
    },
  ],
  interview: [
    { q: `What is inheritance? What are its advantages?`, a: `A mechanism where a derived class acquires the members of a base class and can add or change behaviour. Advantages: code reuse, less duplication, easier maintenance (fix in one place), natural IS-A modelling, and it enables polymorphism.`, level: 'Easy' },
    { q: `What types of inheritance does C# support?`, a: `With classes: single, multilevel and hierarchical. Multiple (and therefore hybrid) inheritance is supported only through interfaces - a class can inherit one class and implement many interfaces.`, level: 'Easy' },
    { q: `Why does C# not support multiple inheritance of classes?`, a: `To avoid the diamond problem: if two parents provide the same member, the child would not know which one to use, and shared grandparent state would be duplicated or ambiguous. Single class inheritance + multiple interfaces keeps it simple and unambiguous.`, level: 'Medium' },
    { q: `Are private members inherited?`, a: `They are part of the derived object in memory but are not accessible from the derived class's code (CS0122). The child can use them only indirectly through public/protected members of the parent.`, level: 'Medium' },
    { q: `Are constructors inherited?`, a: `No. Each class declares its own constructors. However, the base class constructor is always called first when a derived object is created - implicitly the parameterless one, or explicitly via base(...).`, level: 'Easy' },
    { q: `In which order are constructors called in Person -> Employee -> Manager when you create a Manager?`, a: `Person constructor, then Employee constructor, then Manager constructor (base to derived). Destructors/finalizers run in the reverse order.`, level: 'Easy' },
    { q: `What is the base class of all classes in .NET?`, a: `System.Object (alias object). If you do not specify a base class, the class implicitly inherits from object, so every class has ToString, Equals, GetHashCode and GetType.`, level: 'Easy' },
    { q: `What is the difference between IS-A and HAS-A relationships?`, a: `IS-A is inheritance: Manager is an Employee (class Manager : Employee). HAS-A is composition/aggregation: a Car has an Engine (a field of type Engine). Use inheritance only when the IS-A statement is always true.`, level: 'Medium' },
    { q: `Can a parent reference hold a child object? Can a child reference hold a parent object?`, a: `Yes: Employee e = new Developer(); (upcasting, implicit). Through e you can call only Employee members, but GetType() is Developer. No: Developer d = new Employee(); is a compile error CS0266; even with an explicit cast it throws InvalidCastException at runtime.`, level: 'Medium' },
    { q: `Predict the output: class A { public A() { Console.Write("A"); } } class B : A { public B() { Console.Write("B"); } } class C : B { public C() { Console.Write("C"); } }  new C(); new B();`, a: `ABCAB - for new C() the constructors run A, B, C; for new B() they run A, B.`, level: 'Medium' },
    { q: `How can you prevent a class from being inherited?`, a: `Mark it sealed (sealed class PaymentGateway). Other ways: make all constructors private (outside classes cannot call a base constructor) or make it a static class. string is a sealed class.`, level: 'Medium' },
    { q: `What problems can deep inheritance hierarchies cause? What is the alternative?`, a: `Tight coupling (a change in a base class ripples to all children - "fragile base class"), hard-to-follow code, and children inheriting members they do not need. Prefer shallow hierarchies, interfaces and composition ("favour composition over inheritance").`, level: 'Hard' },
  ],
  practice: [
    { task: `Create Vehicle (Number, Start()) and Car : Vehicle (Seats, OpenSunroof()). Create a car and call all methods.`, hint: `class Car : Vehicle { ... }`, solution: `var car = new Car { Number = "MH12AB1234", Seats = 5 };
car.Start();
car.OpenSunroof();

class Vehicle
{
    public string Number = "";
    public void Start() => Console.WriteLine($"{Number} started");
}
class Car : Vehicle
{
    public int Seats;
    public void OpenSunroof() => Console.WriteLine($"Sunroof opened in {Number} ({Seats} seats)");
}
// Output:
// MH12AB1234 started
// Sunroof opened in MH12AB1234 (5 seats)` },
    { task: `Build multilevel inheritance Animal -> Dog -> Puppy. Each has one method (Eat, Bark, Play). Call all three on a Puppy object.`, hint: `Puppy inherits Bark from Dog and Eat from Animal.`, solution: `var p = new Puppy();
p.Eat(); p.Bark(); p.Play();

class Animal { public void Eat() => Console.WriteLine("Eating..."); }
class Dog : Animal { public void Bark() => Console.WriteLine("Barking..."); }
class Puppy : Dog { public void Play() => Console.WriteLine("Playing..."); }
// Output:
// Eating...
// Barking...
// Playing...` },
    { task: `Create hierarchical inheritance Shape -> Rectangle, Square with a common Name field and a Describe() method in Shape; each child has its own Area() (integer). Print name and area for both.`, hint: `Rectangle has Length and Width; Square has Side.`, solution: `var r = new Rectangle { Name = "Rectangle", Length = 10, Width = 4 };
var s = new Square { Name = "Square", Side = 6 };
r.Describe(); Console.WriteLine($"Area: {r.Area()}");
s.Describe(); Console.WriteLine($"Area: {s.Area()}");

class Shape
{
    public string Name = "";
    public void Describe() => Console.WriteLine($"This is a {Name}");
}
class Rectangle : Shape { public int Length, Width; public int Area() => Length * Width; }
class Square : Shape { public int Side; public int Area() => Side * Side; }
// Output:
// This is a Rectangle
// Area: 40
// This is a Square
// Area: 36` },
    { task: `Add constructors that print messages to College -> Department -> Student (multilevel) and predict the output of new Student() before running it.`, hint: `Base constructors run first.`, solution: `new Student();

class College { public College() => Console.WriteLine("College ready"); }
class Department : College { public Department() => Console.WriteLine("Department ready"); }
class Student : Department { public Student() => Console.WriteLine("Student admitted"); }
// Output:
// College ready
// Department ready
// Student admitted` },
    { task: `Create Person -> Student and Person -> Teacher. Store both in a Person[] array and print each object's real type using GetType().Name.`, hint: `Person[] people = { new Student { Name = "Asha" }, new Teacher { Name = "Mr. Rao" } };`, solution: `Person[] people = { new Student { Name = "Asha" }, new Teacher { Name = "Mr. Rao" } };
foreach (var p in people)
    Console.WriteLine($"{p.Name} is a {p.GetType().Name}");

class Person { public string Name = ""; }
class Student : Person { }
class Teacher : Person { }
// Output:
// Asha is a Student
// Mr. Rao is a Teacher` },
  ],
  quiz: [
    { question: `Which symbol is used for inheritance in C#?`, options: [`extends`, `->`, `:`, `inherits`], answer: 2, explanation: `class Employee : Person means Employee inherits from Person.` },
    { question: `Which inheritance type is NOT supported with classes in C#?`, options: [`Multiple`, `Single`, `Multilevel`, `Hierarchical`], answer: 0, explanation: `A class can have only one base class; multiple inheritance is achieved with interfaces.` },
    { question: `For Person -> Employee -> Manager, which constructor runs first when new Manager() is called?`, options: [`Manager`, `Employee`, `They run in random order`, `Person`], answer: 3, explanation: `Constructors execute from the topmost base class down to the derived class.` },
    { question: `Developer and Tester both inherit from Employee. This is:`, options: [`Multilevel inheritance`, `Hierarchical inheritance`, `Multiple inheritance`, `Hybrid inheritance`], answer: 1, explanation: `One parent with several children is hierarchical inheritance.` },
    { question: `Employee x = new Developer(); What does x.GetType().Name return?`, options: [`Employee`, `Object`, `Developer`, `Compile error`], answer: 2, explanation: `GetType() returns the runtime type of the object, not the type of the variable.` },
  ],
};
