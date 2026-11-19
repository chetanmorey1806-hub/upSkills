export default {
  lesson: 'day-025-abstraction-abstract-classes-methods',
  minutes: 16,
  intro: 'Practise abstraction with abstract classes and abstract methods: what they can contain and how child classes must complete them.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens with `var s = new Shape();` when `Shape` is declared `abstract class Shape`?',
      options: ['It creates an empty Shape', 'Compile error: cannot create an instance of an abstract class', 'Runtime exception', 'It creates a child object automatically'],
      answer: 1,
      explain: 'An abstract class is incomplete by design, so it **cannot be instantiated**. You create objects of concrete child classes (`new Circle(2)`) and can still hold them in a `Shape` variable.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Declare an **abstract method** `Area` in the abstract class `Shape` that returns a `double` and takes no parameters (no body!). Write the full line.',
      example: { title: 'abstract method', code: 'public abstract void Pay(decimal amount);' },
      accept: ['public abstract double Area();'],
      acceptRegex: ['^(public|protected)\\s+abstract\\s+double\\s+Area\\s*\\(\\s*\\)\\s*;$'],
      caseSensitive: true,
      explain: 'An abstract method has **no body**, just a semicolon. Every non-abstract child **must** override it (`public override double Area() => ...`). Abstract methods are implicitly virtual.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Abstract class with an abstract method and a normal method: what does this print?',
      example: { title: 'template method idea', code: 'abstract class Report\n{\n    public void Print() { Console.WriteLine(Title()); }\n    protected abstract string Title();\n}' },
      code: `Shape[] shapes = { new Rectangle(4, 5), new Square(3) };
foreach (Shape s in shapes)
    s.Describe();

abstract class Shape
{
    public abstract int Area();
    public void Describe() => Console.WriteLine(GetType().Name + " area = " + Area());
}
class Rectangle : Shape
{
    int l, b;
    public Rectangle(int l, int b) { this.l = l; this.b = b; }
    public override int Area() => l * b;
}
class Square : Shape
{
    int side;
    public Square(int side) { this.side = side; }
    public override int Area() => side * side;
}`,
      expected: `Rectangle area = 20
Square area = 9`,
      explain: '`Describe` is a normal (concrete) method written once in the abstract class; it calls the abstract `Area()`, which runs the child\'s override. `GetType().Name` returns the real class name of the object.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'What can an **abstract class** contain? (choose all that apply)',
      options: ['Abstract methods', 'Normal methods with a body', 'Fields', 'Constructors', 'Nothing but abstract methods'],
      answers: [0, 1, 2, 3],
      explain: 'An abstract class is a normal class that cannot be instantiated: it may have fields, constructors (called by children through `base`), concrete methods, properties and abstract members. It does not have to contain any abstract method at all.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Constructor order with an abstract parent: what does this print?',
      example: { title: 'abstract classes have constructors', code: 'abstract class Vehicle\n{\n    protected Vehicle(string no) { Number = no; }\n}' },
      code: `Employee e = new Intern("Rohit", 15000);
Console.WriteLine(e.Name + ": " + e.MonthlyPay);

abstract class Employee
{
    public string Name;
    protected Employee(string name)
    {
        Name = name;
        Console.WriteLine("Employee created");
    }
    public abstract int MonthlyPay { get; }
}
class Intern : Employee
{
    int stipend;
    public Intern(string name, int stipend) : base(name)
    {
        this.stipend = stipend;
        Console.WriteLine("Intern created");
    }
    public override int MonthlyPay => stipend + 2000;
}`,
      expected: `Employee created
Intern created
Rohit: 17000`,
      explain: 'Even though Employee cannot be instantiated directly, its constructor runs first when an Intern is created. Properties can also be abstract: Intern overrides `MonthlyPay` (15000 + 2000).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A class inherits from an abstract class but does **not** override one of its abstract methods. What must be true?',
      options: ['Nothing, it compiles', 'The child class itself must be declared abstract, otherwise it is a compile error', 'The method returns null', 'It throws NotImplementedException at runtime'],
      answer: 1,
      explain: 'A concrete class must implement **all** inherited abstract members. If it leaves any out, it must itself be marked `abstract` and leave the job to its own children.',
    },
  ],
};
