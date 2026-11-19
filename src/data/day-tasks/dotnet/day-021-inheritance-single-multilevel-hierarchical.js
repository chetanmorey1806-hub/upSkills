export default {
  lesson: 'day-021-inheritance-single-multilevel-hierarchical',
  minutes: 16,
  intro: 'Practise inheritance in C#: single, multilevel and hierarchical inheritance, what is inherited and the order in which constructors run.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the class header so `Employee` **inherits** from `Person`:\n`class Employee ______`',
      example: { title: 'inheritance syntax', code: 'class Car : Vehicle\n{\n}' },
      accept: [': Person', ':Person'],
      caseSensitive: true,
      explain: 'C# uses a colon: `class Employee : Person`. Java uses `extends`, which does not exist in C#. Employee now gets all accessible members of Person (Name, Age, methods…).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Multilevel inheritance and constructor order: what does this print?',
      example: { title: 'parent constructor runs first', code: 'class A { public A() { Console.WriteLine("A"); } }\nclass B : A { public B() { Console.WriteLine("B"); } }\nnew B();  // A, then B' },
      code: `var m = new Manager();
m.Name = "Sunita";
m.Salary = 90000;
m.TeamSize = 6;
Console.WriteLine($"{m.Name} {m.Salary} {m.TeamSize}");

class Person
{
    public string Name;
    public Person() { Console.WriteLine("Person"); }
}
class Employee : Person
{
    public int Salary;
    public Employee() { Console.WriteLine("Employee"); }
}
class Manager : Employee
{
    public int TeamSize;
    public Manager() { Console.WriteLine("Manager"); }
}`,
      expected: `Person
Employee
Manager
Sunita 90000 6`,
      explain: 'Creating a `Manager` runs the constructors from the **top of the hierarchy down**: Person → Employee → Manager, because a child is built on top of a fully-initialised parent. Manager also inherits `Name` and `Salary`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which line does **not** compile in C#?',
      options: [
        'class Developer : Employee { }',
        'class Developer : Employee, Person { }   // two base classes',
        'class Developer : Employee, IComparable { }',
        'class Tester : Employee { }',
      ],
      answer: 1,
      explain: 'C# supports only **single class inheritance**: one base class. A class can additionally implement any number of **interfaces** (option 3). Two classes deriving from the same parent (options 1 and 4) is hierarchical inheritance and is fine.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Class `Child : Parent`. Which members of `Parent` can code **inside Child** use directly? (choose all that apply)',
      options: ['public members', 'protected members', 'private members', 'internal members (same project)', 'constructors as normal methods'],
      answers: [0, 1, 3],
      explain: 'Child can use public, protected and internal (same assembly) members. **private** members exist inside the object but are not accessible from the child. Constructors are not inherited; the child calls them through `base(...)`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Hierarchical inheritance: two classes share one parent. What does this print?',
      example: { title: 'shared parent method', code: 'class Animal { public void Eat() => Console.WriteLine("Eating"); }\nclass Dog : Animal { }\nnew Dog().Eat();  // Eating' },
      code: `var d = new Developer { Name = "Arjun" };
var t = new Tester { Name = "Neha" };
d.Login();
d.WriteCode();
t.Login();
t.TestApp();

class Employee
{
    public string Name;
    public void Login() => Console.WriteLine(Name + " logged in");
}
class Developer : Employee
{
    public void WriteCode() => Console.WriteLine(Name + " writes C#");
}
class Tester : Employee
{
    public void TestApp() => Console.WriteLine(Name + " tests the app");
}`,
      expected: `Arjun logged in
Arjun writes C#
Neha logged in
Neha tests the app`,
      explain: '`Login` is written once in `Employee` and reused by both children (code reuse). Each child adds its own method. A Tester cannot call `WriteCode`, because siblings do not share members.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Every class in C# ultimately inherits from which class?',
      options: ['System.Base', 'System.Object', 'System.Class', 'It depends on the namespace'],
      answer: 1,
      explain: 'All types derive from **System.Object** (`object`), which is why every object has `ToString()`, `Equals()`, `GetHashCode()` and `GetType()`.',
    },
  ],
};
