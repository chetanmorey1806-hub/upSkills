export default {
  lesson: 'day-018-constructor-overloading-static-private',
  minutes: 18,
  intro: 'Practise constructor overloading, chaining with this(...), static constructors (one-time setup) and private constructors (singleton / helper classes).',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Constructor chaining with `this(...)`: what does this print?',
      example: { title: 'this(...) calls another constructor first', code: 'public Box() : this(1) { }\npublic Box(int size) { Size = size; }' },
      code: `var e = new Employee("Kiran");
Console.WriteLine(e.Name + " in " + e.Dept);

class Employee
{
    public string Name;
    public string Dept;

    public Employee(string name) : this(name, "General")
    {
        Console.WriteLine("1-arg");
    }

    public Employee(string name, string dept)
    {
        Name = name;
        Dept = dept;
        Console.WriteLine("2-arg");
    }
}`,
      expected: `2-arg
1-arg
Kiran in General`,
      explain: '`: this(name, "General")` runs the **other constructor first**, then the body of the 1-arg constructor. Chaining keeps the initialisation code in one place instead of copying it into every overload.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Static constructor: what does this print?',
      example: { title: 'static constructor', code: 'class Config\n{\n    public static string Env;\n    static Config() { Env = "Prod"; }   // runs once\n}' },
      code: `Console.WriteLine("Start");
var a = new Company();
var b = new Company();
Console.WriteLine(Company.Name);

class Company
{
    public static string Name;

    static Company()
    {
        Console.WriteLine("Static ctor");
        Name = "TCS";
    }

    public Company()
    {
        Console.WriteLine("Instance ctor");
    }
}`,
      expected: `Start
Static ctor
Instance ctor
Instance ctor
TCS`,
      explain: 'A static constructor runs **exactly once**, automatically, just before the class is first used (here: the first `new`). It cannot have parameters or access modifiers. Instance constructors run for every object.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why would a class have a **private constructor**, e.g. `private AppConfig() { }`?',
      options: [
        'To make the class faster',
        'To stop other code from creating objects with new, e.g. for a Singleton or a class with only static helpers',
        'To allow inheritance only',
        'Private constructors are not allowed in C#',
      ],
      answer: 1,
      explain: 'Code outside the class cannot call `new AppConfig()`. The class controls creation itself, e.g. `public static AppConfig Instance { get; } = new AppConfig();` (Singleton). Utility classes are usually marked `static` instead.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **static constructors** are TRUE? (choose all that apply)',
      options: [
        'They cannot take parameters',
        'They cannot have an access modifier like public',
        'They run once per object',
        'A class can have at most one static constructor',
        'You call them yourself with Company.Company()',
      ],
      answers: [0, 1, 3],
      explain: 'A static constructor is written `static ClassName() { }`: no parameters, no access modifier, only one per class. The CLR calls it automatically once per type (not per object), so you never call it yourself.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the chaining so `new Product("Pen")` calls the 2-parameter constructor with price **10**:\n`public Product(string name) : ____________ { }`',
      example: { title: 'chaining syntax', code: 'public Order() : this("Guest", 1) { }' },
      accept: ['this(name, 10)', 'this(name, 10m)', 'this(name,10)'],
      acceptRegex: ['^this\\s*\\(\\s*name\\s*,\\s*10[mM]?\\s*\\)$'],
      caseSensitive: true,
      explain: 'The initializer `: this(...)` goes after the parameter list and before the body. It passes `name` through and supplies the default price. Using `base(...)` instead would call the **parent** class constructor (a later topic).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Copy constructor vs reference copy: what does this print?',
      example: { title: 'a copy constructor', code: 'public Point(Point other)\n{\n    X = other.X;\n    Y = other.Y;\n}' },
      code: `var original = new Marks(60);
var sameRef = original;
var copy = new Marks(original);
sameRef.Maths = 75;
copy.Maths = 99;
Console.WriteLine(original.Maths);
Console.WriteLine(copy.Maths);

class Marks
{
    public int Maths;
    public Marks(int m) { Maths = m; }
    public Marks(Marks other) { Maths = other.Maths; }
}`,
      expected: `75
99`,
      explain: '`sameRef = original` shares one object, so changing `sameRef` changes `original` to 75. The **copy constructor** creates a separate object, so changing `copy` does not affect the original.',
    },
  ],
};
