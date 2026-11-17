const calculatorCode = `using System.Globalization;

Calculator calc = new Calculator();

Console.WriteLine("Add(10, 20)        = " + calc.Add(10, 20));
Console.WriteLine("Add(10, 20, 30)    = " + calc.Add(10, 20, 30));
Console.WriteLine("Add(2.5, 1.25)     = " + calc.Add(2.5, 1.25).ToString("0.00", CultureInfo.InvariantCulture));
Console.WriteLine("Add(Hello, World)  = " + calc.Add("Hello", "World"));
Console.WriteLine("Add(1, 2, 3, 4, 5) = " + calc.Add(1, 2, 3, 4, 5));

// One method name "Add", five different signatures.
// The compiler decides which one to call by looking at the arguments.
class Calculator
{
    // 1) two ints
    public int Add(int a, int b) => a + b;

    // 2) three ints (different NUMBER of parameters)
    public int Add(int a, int b, int c) => a + b + c;

    // 3) two doubles (different TYPE of parameters)
    public double Add(double a, double b) => a + b;

    // 4) two strings (joins them with a space)
    public string Add(string a, string b) => a + " " + b;

    // 5) any number of ints (params array)
    public int Add(params int[] numbers)
    {
        int sum = 0;
        foreach (int n in numbers)
        {
            sum += n;
        }
        return sum;
    }
}
`;

const resolutionCode = `using System.Globalization;

Printer p = new Printer();

byte b = 10;
short s = 20;
long big = 5000000000;
float f = 1.5f;
char c = 'A';

p.Show(b);       // byte  -> best match int
p.Show(s);       // short -> best match int
p.Show(100);     // int   -> exact match
p.Show(big);     // long  -> exact match
p.Show(f);       // float -> double (no float overload)
p.Show(c);       // char  -> int (char is a 16-bit number!)
p.Show("Hi");    // string -> only object fits
p.Show(true);    // bool   -> only object fits

class Printer
{
    public void Show(int x)    => Console.WriteLine("Show(int)    -> " + x);
    public void Show(long x)   => Console.WriteLine("Show(long)   -> " + x);
    public void Show(double x) => Console.WriteLine("Show(double) -> " + x.ToString(CultureInfo.InvariantCulture));
    public void Show(object x) => Console.WriteLine("Show(object) -> " + x);
}
`;

const paymentCode = `PaymentProcessor counter = new PaymentProcessor();

counter.Pay(500);                                // Cash
counter.Pay(1200, "ravi@okaxis");                // UPI
counter.Pay(2500, "4111222233334444", 123);      // Card
counter.Pay(amount: 800, upiId: "neha@ybl");     // UPI with named arguments

// Same action "Pay", different inputs => different behaviour.
// This is compile-time polymorphism: decided while compiling.
class PaymentProcessor
{
    // Cash: only the amount is needed
    public void Pay(int amount)
    {
        Console.WriteLine($"Cash payment of Rs.{amount} received at counter.");
    }

    // UPI: amount + UPI ID
    public void Pay(int amount, string upiId)
    {
        Console.WriteLine($"UPI payment of Rs.{amount} sent from {upiId}.");
    }

    // Card: amount + card number + CVV
    public void Pay(int amount, string cardNumber, int cvv)
    {
        string last4 = cardNumber.Substring(cardNumber.Length - 4);
        Console.WriteLine($"Card payment of Rs.{amount} charged to card ending {last4}.");
    }
}
`;

const operatorCode = `Distance d1 = new Distance(2, 750);
Distance d2 = new Distance(1, 400);
Distance total = d1 + d2;          // calls our operator +

Console.WriteLine($"d1 = {d1}");
Console.WriteLine($"d2 = {d2}");
Console.WriteLine($"d1 + d2 = {total}");
Console.WriteLine($"d1 > d2 ? {d1 > d2}");
Console.WriteLine($"d1 < d2 ? {d1 < d2}");

class Distance
{
    public int Km { get; }
    public int M { get; }

    public Distance(int km, int m)
    {
        // normalise: 1150 m becomes 1 km 150 m
        Km = km + m / 1000;
        M = m % 1000;
    }

    public int TotalMeters() => Km * 1000 + M;

    // Operator overloading = compile-time polymorphism for operators
    public static Distance operator +(Distance a, Distance b)
        => new Distance(a.Km + b.Km, a.M + b.M);

    // Comparison operators must be overloaded in pairs (> with <)
    public static bool operator >(Distance a, Distance b) => a.TotalMeters() > b.TotalMeters();
    public static bool operator <(Distance a, Distance b) => a.TotalMeters() < b.TotalMeters();

    public override string ToString() => $"{Km} km {M} m";
}
`;

const vsSteps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8.0 (LTS) or .NET 10.0 (LTS), keep "Do not use top-level statements" unchecked, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 (Start Without Debugging) to run and see the output',
  'Optional: put a breakpoint (F9) on a call line, press F5 and use F11 (Step Into) to see which overload runs',
];

export default {
  id: 'day-023-polymorphism-method-overloading',
  title: 'Polymorphism: Compile-Time Polymorphism and Method Overloading',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 23,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Polymorphism means "one name, many forms". Today you learn the two kinds of polymorphism in C#, then master the compile-time kind: method overloading, how the compiler picks the best overload, constructor overloading and operator overloading. You build a Calculator with many Add methods and a payment counter where one Pay method works for Cash, UPI and Card.`,
  objectives: [
    'Explain polymorphism with real-world analogies and list its two types in C#',
    'Write overloaded methods that differ by number, type or order of parameters',
    'Predict which overload the compiler chooses (exact match, implicit conversion, params, ambiguity)',
    'Overload operators such as + and > for your own classes',
    'Build a Calculator class and a Payment counter using method overloading',
  ],
  theory: [
    {
      heading: 'What is Polymorphism?',
      content: `**Polymorphism** comes from Greek: *poly* = many, *morph* = forms. In programming it means **one name (method or operator) behaves differently depending on the situation**.

Real-world analogies:
- **A person with many roles**: Ravi is a son at home, an employee at office and a customer at a shop. Same person, different behaviour depending on where he is.
- **The + key on a calculator vs in a chat app**: 2 + 3 gives 5, but "Good" + "Morning" gives "GoodMorning". The same symbol does different work for numbers and text. C# does exactly this with the + operator.
- **A payment counter**: you say "I want to pay". If you hand over cash, the cashier counts notes; if you show a UPI QR, they wait for the UPI confirmation; if you give a card, they swipe it. The action name is the same ("pay") but the work depends on what you bring.

Polymorphism makes code **easy to read** (one meaningful name instead of AddTwoInts, AddThreeInts, AddDoubles...) and **easy to extend**.`,
      points: [
        'Polymorphism is one of the four pillars of OOP (Encapsulation, Inheritance, Polymorphism, Abstraction)',
        'Same name + different behaviour = polymorphism',
        'In C# it appears as method overloading, operator overloading, constructor overloading and method overriding',
      ],
    },
    {
      heading: 'Two Types of Polymorphism in C#',
      content: `| | Compile-Time (Static) | Runtime (Dynamic) |
|---|---|---|
| Also called | Early binding, static binding | Late binding, dynamic binding |
| How | Method overloading, operator overloading, constructor overloading | Method overriding with virtual / override (and interfaces, abstract methods) |
| Who decides which method runs | **Compiler**, by looking at the argument types | **CLR at runtime**, by looking at the real object type |
| Needs inheritance? | No, works inside a single class | Yes (base class / interface) |
| Speed | Slightly faster (already decided) | Tiny cost of a virtual call lookup |
| Covered on | Today (Day 23) | Day 24 |

Analogy: Compile-time polymorphism is like a **train ticket with seat number printed** (decided before the journey). Runtime polymorphism is like a **cab app** that decides the driver only when you actually book.`,
    },
    {
      heading: 'Method Overloading and Its Rules',
      content: `**Method overloading** = two or more methods in the same class (or class hierarchy) with the **same name** but a **different parameter list** (signature).

A method **signature** = method name + number of parameters + type of each parameter + order of parameters + parameter modifiers (ref/out/in).

Valid ways to overload:
1. Different **number** of parameters: Add(int a, int b) and Add(int a, int b, int c)
2. Different **types**: Add(int a, int b) and Add(double a, double b)
3. Different **order** of types: Print(string name, int age) and Print(int age, string name)
4. Different **modifier**: Update(int x) and Update(ref int x) (but ref vs out alone is NOT allowed)

NOT valid (compile error CS0111 "already defines a member"):
- Only the **return type** differs: int GetValue() and double GetValue()
- Only the **parameter names** differ: Add(int a, int b) and Add(int x, int y)
- Only params / optional differs in a way that gives the same signature`,
      syntax: `class Calculator
{
    public int Add(int a, int b) => a + b;                 // 2 ints
    public int Add(int a, int b, int c) => a + b + c;      // 3 ints
    public double Add(double a, double b) => a + b;        // 2 doubles
    public string Add(string a, string b) => a + " " + b;  // 2 strings

    // ERROR CS0111: only return type differs
    // public double Add(int a, int b) => a + b;
}`,
      tip: 'Use overloading when the methods do the SAME logical job on different inputs. If the jobs are different, give them different names (CalculateTax vs CalculateDiscount).',
    },
    {
      heading: 'How the Compiler Chooses an Overload (Overload Resolution)',
      content: `When you call calc.Add(x, y), the compiler:
1. Collects all methods named Add that are accessible.
2. Keeps only the **applicable** ones (the arguments can be passed, directly or by an implicit conversion).
3. Picks the **best match**:
   - an **exact type match** wins over a conversion,
   - a **closer conversion** wins (byte → int is better than byte → long, because int can still widen to long),
   - a normal method wins over a **params** method in its expanded form,
   - value types prefer numeric conversions over boxing to object.
4. If two candidates are equally good, you get **CS0121: The call is ambiguous**.

Common surprises:
- A **char** argument picks the int overload (char is a 16-bit number, 'A' = 65).
- A **float** argument picks the double overload if there is no float overload.
- Integer literal 10 is int; 10L is long; 10.0 is double; 10.0f is float; 10m is decimal.
- Passing **null** to Show(string) and Show(int?)... both accept null → ambiguous.`,
      points: [
        'Overload resolution happens at COMPILE time, so it uses the declared (static) type of the argument, not the runtime value',
        'Implicit numeric widening: byte → short → int → long → float → double (and int → decimal)',
        'Named arguments can help choose an overload and improve readability: Pay(amount: 800, upiId: "x@ybl")',
      ],
    },
    {
      heading: 'Constructor Overloading and Overloading with Optional / params Parameters',
      content: `**Constructor overloading** (Day 18) is also compile-time polymorphism: new Employee(), new Employee("Asha"), new Employee("Asha", 30000) call different constructors.

**Optional parameters** (Day 14) can sometimes replace overloads:
- Pay(int amount, string mode = "Cash") is one method that works like two.
- Rule: if an overload WITHOUT optional parameters matches exactly, it is preferred over one that needs default values filled in.

**params** lets a method accept any number of arguments: Add(params int[] numbers). If a normal overload with exactly matching parameters exists (Add(int, int, int)), the compiler prefers it over the params version.

Choose:
- **Overloads** when the types differ or the logic differs per input.
- **Optional parameters** when only some values have sensible defaults.
- **params** when the count of the same type of values is unknown.`,
      syntax: `class Employee
{
    public string Name { get; }
    public int Salary { get; }

    public Employee() : this("Unknown", 0) { }
    public Employee(string name) : this(name, 15000) { }
    public Employee(string name, int salary) { Name = name; Salary = salary; }
}`,
    },
    {
      heading: 'Operator Overloading',
      content: `C# lets your own classes and structs define what operators like +, -, ==, <, > mean. This is **operator overloading**, another form of compile-time polymorphism. The built-in types already do it: + adds ints, concatenates strings and combines delegates.

Rules:
- Must be **public static** and use the keyword **operator**.
- At least one parameter must be the containing type.
- Some operators must be overloaded **in pairs**: == with !=, < with >, <= with >=.
- If you overload ==, also override Equals and GetHashCode (Day 28).
- You cannot overload =, &&, ||, ?:, new, typeof, sizeof, is, as. (Compound operators like += automatically use your +.)

Use it only when the meaning is obvious (Money + Money, Distance + Distance, Vector * number). Do not make + do something surprising.`,
      syntax: `public static Distance operator +(Distance a, Distance b)
    => new Distance(a.Km + b.Km, a.M + b.M);`,
      tip: 'Remember for interviews: overloading = same name, different signature, same class, decided at compile time. Overriding = same signature, parent-child classes, decided at runtime.',
    },
  ],
  examples: [
    {
      title: 'Calculator with Overloaded Add Methods',
      scenario: 'The syllabus task: a Calculator class where Add works for two ints, three ints, doubles, strings and any number of ints.',
      steps: vsSteps('CalculatorOverloading'),
      code: calculatorCode,
      csharp: { files: { 'Program.cs': calculatorCode }, stdin: '' },
      result: `Add(10, 20)        = 30
Add(10, 20, 30)    = 60
Add(2.5, 1.25)     = 3.75
Add(Hello, World)  = Hello World
Add(1, 2, 3, 4, 5) = 15`,
      explanation: `Add(10, 20) has two int arguments: both Add(int, int) and Add(double, double) and Add(params int[]) are applicable, but the exact int match wins → 30. Add(10, 20, 30) exactly matches the 3-int version (a normal method beats the params version) → 60. Add(2.5, 1.25) has double literals so Add(double, double) runs → 3.75 (formatted with InvariantCulture so the decimal point is always a dot). Add("Hello", "World") uses the string overload → "Hello World". Five ints match only the params int[] version → 15.`,
    },
    {
      title: 'Which Overload Wins? (Overload Resolution Demo)',
      scenario: 'Understand the rules the compiler follows when the argument type does not exactly match any overload.',
      steps: vsSteps('OverloadResolution'),
      code: resolutionCode,
      csharp: { files: { 'Program.cs': resolutionCode }, stdin: '' },
      result: `Show(int)    -> 10
Show(int)    -> 20
Show(int)    -> 100
Show(long)   -> 5000000000
Show(double) -> 1.5
Show(int)    -> 65
Show(object) -> Hi
Show(object) -> True`,
      explanation: `byte and short have no own overload; int, long, double and object all accept them, and int is the "closest" widening conversion, so Show(int) runs. 5000000000 does not fit in int, so big is long and Show(long) runs. float widens to double. char 'A' is the number 65 and char → int is the best conversion, a classic interview trap. string and bool cannot convert to any number type, so only Show(object) is applicable (bool is boxed and prints True).`,
    },
    {
      title: 'Payment Counter: One Pay Method for Cash, UPI and Card',
      scenario: 'A shop billing counter accepts Cash (amount only), UPI (amount + UPI ID) and Card (amount + card number + CVV). We overload Pay for each case.',
      steps: vsSteps('PaymentOverloading'),
      code: paymentCode,
      csharp: { files: { 'Program.cs': paymentCode }, stdin: '' },
      result: `Cash payment of Rs.500 received at counter.
UPI payment of Rs.1200 sent from ravi@okaxis.
Card payment of Rs.2500 charged to card ending 4444.
UPI payment of Rs.800 sent from neha@ybl.`,
      explanation: `The compiler counts and types the arguments: (int) → Cash, (int, string) → UPI, (int, string, int) → Card. Substring(cardNumber.Length - 4) takes the last 4 characters "4444" so we never print the full card number. The last call uses named arguments; parameter names must match the UPI overload (amount, upiId), so it calls the UPI version. Tomorrow you will see the runtime version of this design, where CashPayment, UpiPayment and CardPayment are separate classes.`,
    },
    {
      title: 'Operator Overloading: Adding Two Distances',
      scenario: 'A delivery app stores distances as km + m. We want to write d1 + d2 and d1 > d2 naturally.',
      steps: vsSteps('OperatorOverloading'),
      code: operatorCode,
      csharp: { files: { 'Program.cs': operatorCode }, stdin: '' },
      result: `d1 = 2 km 750 m
d2 = 1 km 400 m
d1 + d2 = 4 km 150 m
d1 > d2 ? True
d1 < d2 ? False`,
      explanation: `d1 + d2 calls operator + which creates new Distance(2 + 1, 750 + 400) = Distance(3, 1150). The constructor normalises: Km = 3 + 1150 / 1000 = 3 + 1 = 4 and M = 1150 % 1000 = 150. For comparison, d1 is 2750 m and d2 is 1400 m, so d1 > d2 is True and d1 < d2 is False. ToString is overridden so the interpolated string prints "4 km 150 m" instead of the class name.`,
    },
  ],
  interview: [
    {
      q: 'What is polymorphism? Explain with a real-world example.',
      a: `Polymorphism means "one name, many forms": the same method or operator behaves differently depending on the input or the object. Example: a person behaves as a son at home and an employee at office; in C#, the + operator adds numbers but joins strings. It improves readability and extensibility.`,
      level: 'Easy',
    },
    {
      q: 'What are the types of polymorphism in C#?',
      a: `1) Compile-time (static/early binding): method overloading, operator overloading, constructor overloading; decided by the compiler. 2) Runtime (dynamic/late binding): method overriding using virtual/override, abstract methods and interfaces; decided by the CLR based on the actual object type.`,
      level: 'Easy',
    },
    {
      q: 'What is method overloading? What are the rules?',
      a: `Defining multiple methods with the same name but different parameter lists in the same class. Parameters must differ in number, type, order or ref/out/in modifier. Return type alone or parameter names alone cannot distinguish overloads (error CS0111).`,
      level: 'Easy',
    },
    {
      q: 'Can we overload methods only by return type? Why not?',
      a: `No. A call like calc.GetValue(); may ignore the return value, so the compiler would not know which method to call. The return type is not part of the method signature used for overloading.`,
      level: 'Easy',
    },
    {
      q: `Output? class P { public void M(int x) => Console.WriteLine("int"); public void M(long x) => Console.WriteLine("long"); }  new P().M('A');`,
      a: `It prints "int". char has implicit conversions to both int and long, but int is the better (closer) conversion because int can itself convert to long. 'A' is passed as 65.`,
      level: 'Medium',
    },
    {
      q: `Output? void Show(double d) => Console.WriteLine("double"); void Show(object o) => Console.WriteLine("object"); Show(5);`,
      a: `"double". int → double is an implicit numeric conversion, which is preferred over boxing int to object.`,
      level: 'Medium',
    },
    {
      q: 'What is the difference between method overloading and method overriding?',
      a: `Overloading: same name, different signatures, usually same class, compile-time, no keyword needed, return type can differ. Overriding: same name AND same signature, in a derived class, requires virtual/abstract in the base and override in the child, resolved at runtime based on the object type.`,
      level: 'Medium',
    },
    {
      q: 'When does a method call become ambiguous (CS0121)?',
      a: `When two or more overloads are equally good for the given arguments. Example: M(int a, double b) and M(double a, int b) called as M(1, 2): each needs one conversion, neither is better, so the call is ambiguous. Passing null to M(string) and M(int?) is another example. Fix by casting the argument or using a more specific overload.`,
      level: 'Hard',
    },
    {
      q: 'If both Add(int a, int b, int c) and Add(params int[] nums) exist, which is called by Add(1, 2, 3)?',
      a: `Add(int, int, int). A method applicable in its normal form is preferred over a params method that must be used in its expanded form. Add(1, 2, 3, 4) would call the params version.`,
      level: 'Medium',
    },
    {
      q: 'What is operator overloading? Which operators cannot be overloaded?',
      a: `Giving custom meaning to operators for your types using public static ReturnType operator +(T a, T b). Comparison operators must be overloaded in pairs (== with !=, < with >, <= with >=). Operators that cannot be overloaded include =, &&, ||, ?:, ??, new, typeof, sizeof, is, as, and member access (.).`,
      level: 'Medium',
    },
    {
      q: 'Is constructor overloading a form of polymorphism?',
      a: `Yes, it is compile-time polymorphism. Multiple constructors with different parameter lists let you create objects in different ways; the compiler selects the constructor from the arguments given to new.`,
      level: 'Easy',
    },
    {
      q: 'Can overloading happen across base and derived classes?',
      a: `Yes. If Parent has Print(int) and Child adds Print(string), a Child object has both overloads. One gotcha: when calling on a Child variable, C# first looks for applicable methods declared in Child; if Child has Print(double) and you call child.Print(5), Print(double) from Child is chosen even though Parent has an exact Print(int).`,
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create an AreaCalculator class with overloaded Area methods: Area(int side) for a square, Area(int length, int breadth) for a rectangle, and Area(double radius) for a circle. Print the results for side 5, 4x6 and radius 2.',
      hint: 'Use Math.PI for the circle and format the double with ToString("0.00", CultureInfo.InvariantCulture). Call Area(2.0) (not Area(2)) so the double overload is chosen.',
      solution: `using System.Globalization;

AreaCalculator a = new AreaCalculator();
Console.WriteLine("Square   = " + a.Area(5));
Console.WriteLine("Rectangle= " + a.Area(4, 6));
Console.WriteLine("Circle   = " + a.Area(2.0).ToString("0.00", CultureInfo.InvariantCulture));

class AreaCalculator
{
    public int Area(int side) => side * side;
    public int Area(int length, int breadth) => length * breadth;
    public double Area(double radius) => Math.PI * radius * radius;
}
// Square   = 25
// Rectangle= 24
// Circle   = 12.57`,
    },
    {
      task: 'Write a Logger class with overloaded Log methods: Log(string message), Log(string message, int level), Log(Exception ex). Each should print a different format.',
      hint: 'Exception has a Message property. Use new Exception("Disk full") to test.',
      solution: `Logger log = new Logger();
log.Log("App started");
log.Log("Low memory", 2);
log.Log(new Exception("Disk full"));

class Logger
{
    public void Log(string message) => Console.WriteLine($"INFO: {message}");
    public void Log(string message, int level) => Console.WriteLine($"LEVEL {level}: {message}");
    public void Log(Exception ex) => Console.WriteLine($"ERROR: {ex.Message}");
}`,
    },
    {
      task: 'Create a Money class (Rupees as int) and overload +, -, == and != operators. Also override Equals and GetHashCode. Test with 500 + 250 and 500 == 500.',
      hint: '== and != must be defined together. Equals(object? obj) should compare the Rupees value.',
      solution: `Money a = new Money(500);
Money b = new Money(250);
Console.WriteLine((a + b).Rupees);              // 750
Console.WriteLine((a - b).Rupees);              // 250
Console.WriteLine(a == new Money(500));         // True
Console.WriteLine(a != b);                      // True

class Money
{
    public int Rupees { get; }
    public Money(int rupees) => Rupees = rupees;
    public static Money operator +(Money x, Money y) => new Money(x.Rupees + y.Rupees);
    public static Money operator -(Money x, Money y) => new Money(x.Rupees - y.Rupees);
    public static bool operator ==(Money x, Money y) => x.Rupees == y.Rupees;
    public static bool operator !=(Money x, Money y) => !(x == y);
    public override bool Equals(object? obj) => obj is Money m && m.Rupees == Rupees;
    public override int GetHashCode() => Rupees.GetHashCode();
}`,
    },
    {
      task: 'Extend the PaymentProcessor so Pay(int amount, string upiId, string note) also exists. Then try adding Pay(int amount, string cardNumber) next to the UPI overload. What happens and why?',
      hint: 'Think about the signature: (int, string) is already used by the UPI method.',
      solution: `Adding Pay(int amount, string upiId, string note) is fine: (int, string, string) is a new signature.
Adding Pay(int amount, string cardNumber) gives error CS0111 because (int, string) already exists; parameter names do not count.
Fix: give it a different name (PayByCard) or a different type, e.g. Pay(int amount, CardDetails card).`,
    },
    {
      task: 'Create a Student class with three overloaded constructors (no args, name only, name + marks) and a Display method. Chain them using this(...).',
      hint: 'The most complete constructor does the work; the others call it with default values.',
      solution: `Student s1 = new Student();
Student s2 = new Student("Asha");
Student s3 = new Student("Rahul", 88);
s1.Display(); s2.Display(); s3.Display();

class Student
{
    public string Name { get; }
    public int Marks { get; }
    public Student() : this("New Student", 0) { }
    public Student(string name) : this(name, 0) { }
    public Student(string name, int marks) { Name = name; Marks = marks; }
    public void Display() => Console.WriteLine($"{Name} - {Marks}");
}
// New Student - 0
// Asha - 0
// Rahul - 88`,
    },
  ],
  quiz: [
    {
      question: 'Method overloading is an example of which type of polymorphism?',
      options: ['Runtime polymorphism', 'Compile-time polymorphism', 'Dynamic binding', 'Late binding'],
      answer: 1,
      explanation: 'The compiler decides which overload to call from the argument types, so it is compile-time (static, early-binding) polymorphism.',
    },
    {
      question: 'Which pair of methods is a VALID overload?',
      options: [
        'int Sum(int a, int b) and double Sum(int a, int b)',
        'void Print(int x) and void Print(int y)',
        'void Save(string name, int age) and void Save(int age, string name)',
        'void Run() and int Run()',
      ],
      answer: 2,
      explanation: 'Changing the order of parameter types creates a new signature. Return type or parameter names alone cannot distinguish overloads.',
    },
    {
      question: `Given M(int x) and M(double x), what does M('B') call?`,
      options: ['M(int x)', 'M(double x)', 'Compile error: ambiguous', 'Runtime error'],
      answer: 0,
      explanation: 'char converts implicitly to both, but char → int is the better conversion. The value passed is 66.',
    },
    {
      question: 'Which keyword combination is required to overload an operator?',
      options: ['public virtual operator', 'public override operator', 'private static operator', 'public static ... operator'],
      answer: 3,
      explanation: 'Operator overloads must be declared public static with the operator keyword, e.g. public static Distance operator +(Distance a, Distance b).',
    },
    {
      question: 'With Add(int, int, int) and Add(params int[]) defined, what does Add(1, 2, 3) call?',
      options: ['The params version', 'Add(int, int, int)', 'Compile error: ambiguous', 'Both, one after another'],
      answer: 1,
      explanation: 'A method applicable in its normal form is preferred over a params method in its expanded form.',
    },
  ],
};
