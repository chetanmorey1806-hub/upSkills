export default {
  lesson: 'day-017-constructors',
  minutes: 15,
  intro: 'Practise default and parameterized constructors: how they are written, when they run and how they initialise objects.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about constructors are TRUE? (choose all that apply)',
      options: [
        'A constructor has the same name as the class',
        'A constructor has no return type, not even void',
        'A constructor runs automatically when an object is created with new',
        'A constructor must be called manually after new',
        'A class can have only one constructor',
      ],
      answers: [0, 1, 2],
      explain: 'Constructors share the class name, have **no return type** and run automatically during `new`. A class can have many constructors (overloading, next lesson). Writing `public void Student()` makes it a normal method, not a constructor.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the **parameterized constructor** header of class `Product` that takes a `string name` and a `decimal price`:\n`________(string name, decimal price)`',
      example: { title: 'constructor of class Car', code: 'public Car(string model)\n{\n    Model = model;\n}' },
      accept: ['public Product'],
      acceptRegex: ['^(public|internal)?\\s*Product$'],
      caseSensitive: true,
      explain: 'A constructor is `access-modifier ClassName(parameters)`. There is no return type. It is usually `public` so other code can create objects.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Constructors run when objects are created. What does this print?',
      example: { title: 'constructor output', code: 'class A\n{\n    public A() { Console.WriteLine("A created"); }\n}\nvar a = new A();   // A created' },
      code: `var a = new Student();
var b = new Student("Ravi", "SQL");
Console.WriteLine(a.Name + " - " + a.Course);
Console.WriteLine(b.Name + " - " + b.Course);

class Student
{
    public string Name;
    public string Course;

    public Student()
    {
        Name = "Unknown";
        Course = "C#";
        Console.WriteLine("Default constructor");
    }

    public Student(string name, string course)
    {
        Name = name;
        Course = course;
        Console.WriteLine("Parameterized constructor");
    }
}`,
      expected: `Default constructor
Parameterized constructor
Unknown - C#
Ravi - SQL`,
      explain: 'Each `new` runs the constructor whose parameters match the arguments. `new Student()` uses the default one (sets Unknown / C#), `new Student("Ravi", "SQL")` uses the parameterized one.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A class has **only** this constructor: `public Employee(int id) { Id = id; }`. What happens with `var e = new Employee();`?',
      options: [
        'It works; C# always adds a default constructor',
        'Compile error: there is no constructor that takes 0 arguments',
        'e.Id is set to 0 automatically',
        'Runtime NullReferenceException',
      ],
      answer: 1,
      explain: 'The compiler adds a parameterless default constructor **only if you write no constructor at all**. As soon as you write any constructor, you must add `public Employee() { }` yourself if you still need it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Constructor with validation and a computed field. What does this print?',
      example: { title: 'setting fields in a constructor', code: 'public Circle(double r)\n{\n    Radius = r;\n    Area = 3.14 * r * r;\n}' },
      code: `var x = new Account("Asha", 2000);
var y = new Account("Ravi", 100);
y.Balance += 250;
Console.WriteLine($"{x.Holder}: {x.Balance}");
Console.WriteLine($"{y.Holder}: {y.Balance}");

class Account
{
    public string Holder;
    public int Balance;

    public Account(string holder, int opening)
    {
        Holder = holder;
        Balance = opening < 500 ? 500 : opening;
    }
}`,
      expected: `Asha: 2000
Ravi: 750`,
      explain: 'The constructor enforces a minimum opening balance of 500. Ravi\'s 100 becomes 500, then `+= 250` makes 750. Putting rules in the constructor guarantees every object starts in a valid state.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Create a `Student` object using the parameterized constructor `Student(string name, int age)` for **"Meena"**, age **20**, stored in a variable `s`. Write the full statement.',
      example: { title: 'creating an object', code: 'var car = new Car("Nexon", 2024);' },
      accept: ['var s = new Student("Meena", 20);', 'Student s = new Student("Meena", 20);', 'Student s = new("Meena", 20);'],
      acceptRegex: ['^(var|Student)\\s+s\\s*=\\s*new\\s+Student\\s*\\(\\s*"Meena"\\s*,\\s*20\\s*\\)\\s*;?$', '^Student\\s+s\\s*=\\s*new\\s*\\(\\s*"Meena"\\s*,\\s*20\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: '`new Student("Meena", 20)` picks the constructor with (string, int). Since C# 9 you can also write the target-typed form `Student s = new("Meena", 20);`. Argument order must match the parameters.',
    },
  ],
};
