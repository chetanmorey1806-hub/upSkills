const overloadCode = `// Day 14 - Example 1: Method overloading - one name, many signatures
using System.Globalization;

class Program
{
    static void Main()
    {
        Console.WriteLine("Add(10, 20)         = " + Add(10, 20));
        Console.WriteLine("Add(10, 20, 30)     = " + Add(10, 20, 30));
        double d = Add(2.5, 3.75);
        Console.WriteLine("Add(2.5, 3.75)      = " + d.ToString(CultureInfo.InvariantCulture));
        Console.WriteLine("Add(Dot, Net)       = " + Add("Dot", "Net"));
        int[] values = { 1, 2, 3 };
        Console.WriteLine("Add(int[] {1,2,3})  = " + Add(values));
    }

    // 1) different number of parameters
    static int Add(int a, int b)
    {
        return a + b;
    }

    static int Add(int a, int b, int c)
    {
        return a + b + c;
    }

    // 2) different parameter types
    static double Add(double a, double b)
    {
        return a + b;
    }

    static string Add(string a, string b)
    {
        return a + b;
    }

    static int Add(int[] numbers)
    {
        int total = 0;
        foreach (int v in numbers) total += v;
        return total;
    }

    // NOT allowed - differs only by return type (error CS0111):
    // static long Add(int a, int b) { return a + b; }
}
`;

const largestCode = `// Day 14 - Example 2: Largest of two/three numbers and positive/negative/zero (overloaded)
class Program
{
    static void Main()
    {
        Console.WriteLine($"Largest(12, 45)     = {Largest(12, 45)}");
        Console.WriteLine($"Largest(12, 45, 30) = {Largest(12, 45, 30)}");
        Console.WriteLine($"Largest(-5, -2, -9) = {Largest(-5, -2, -9)}");
        Console.WriteLine($"Largest(7, 7, 3)    = {Largest(7, 7, 3)}");

        int[] tests = { 15, -8, 0 };
        foreach (int n in tests)
        {
            Console.WriteLine($"{n} is {CheckSign(n)}");
        }
        Console.WriteLine($"-0.5 is {CheckSign(-0.5)}");
    }

    static int Largest(int a, int b)
    {
        return a > b ? a : b;
    }

    static int Largest(int a, int b, int c)
    {
        int max = a;
        if (b > max) max = b;
        if (c > max) max = c;
        return max;
    }

    static string CheckSign(int n)
    {
        if (n > 0)
            return "Positive";
        else if (n < 0)
            return "Negative";
        else
            return "Zero";
    }

    static string CheckSign(double n) => n > 0 ? "Positive" : n < 0 ? "Negative" : "Zero";
}
`;

const optionalCode = `// Day 14 - Example 3: Optional parameters and named arguments
PrintBill("Notebook", 60);                                   // uses both defaults
PrintBill("Pen", 10, 5);                                     // quantity given
PrintBill("Bag", 800, 2, 10);                                // all values given
PrintBill("Bottle", 250, discountPercent: 20);               // skip quantity using a name
PrintBill(quantity: 3, item: "Marker", price: 25);           // any order when all are named

static void PrintBill(string item, int price, int quantity = 1, int discountPercent = 0)
{
    int total = price * quantity;
    int discount = total * discountPercent / 100;
    int pay = total - discount;
    Console.WriteLine($"{item}: {quantity} x {price}, discount {discountPercent}% => {pay}");
}
`;

const calcCode = `// Day 14 - Example 4: Menu-driven calculator using methods
using System.Globalization;

int choice;
do
{
    ShowMenu();
    choice = ReadInt("Choice: ");

    if (choice >= 1 && choice <= 4)
    {
        int a = ReadInt("a: ");
        int b = ReadInt("b: ");
        Console.WriteLine(Calculate(choice, a, b));
    }
    else if (choice != 5)
    {
        Console.WriteLine("Invalid choice");
    }
} while (choice != 5);

Console.WriteLine("Thank you!");

static void ShowMenu() => Console.WriteLine("1.Add 2.Subtract 3.Multiply 4.Divide 5.Exit");

static int ReadInt(string prompt)
{
    Console.Write(prompt);
    return int.TryParse(Console.ReadLine(), out int value) ? value : 0;
}

static int Add(int a, int b) => a + b;
static int Subtract(int a, int b) => a - b;
static int Multiply(int a, int b) => a * b;
static double Divide(int a, int b) => (double)a / b;

static string Calculate(int choice, int a, int b)
{
    switch (choice)
    {
        case 1: return $"{a} + {b} = {Add(a, b)}";
        case 2: return $"{a} - {b} = {Subtract(a, b)}";
        case 3: return $"{a} x {b} = {Multiply(a, b)}";
        default:
            if (b == 0) return "Cannot divide by zero";
            string q = Divide(a, b).ToString("0.00", CultureInfo.InvariantCulture);
            return $"{a} / {b} = {q}";
    }
}
`;

const resolutionCode = `// Day 14 - Example 5: Which overload does the compiler pick?
using System.Globalization;

class Program
{
    static void Main()
    {
        Show(5);          // int literal
        Show(5L);         // long literal
        Show(5.0);        // double literal
        Show('A');        // char -> int is the closest implicit conversion
        Show(5.5f);       // float -> double
        short s = 7;
        Show(s);          // short -> int is better than short -> long
        Show("5");        // string

        Greet("Asha");                    // overload without optional params wins
        Greet("Ravi", "Good morning");
    }

    static void Show(int x) => Console.WriteLine($"Show(int)    called with {x}");
    static void Show(long x) => Console.WriteLine($"Show(long)   called with {x}");
    static void Show(double x) => Console.WriteLine("Show(double) called with " + x.ToString(CultureInfo.InvariantCulture));
    static void Show(string x) => Console.WriteLine($"Show(string) called with {x}");

    static void Greet(string name) => Console.WriteLine($"Greet(name)          -> Hello {name}");
    static void Greet(string name, string message = "Welcome") => Console.WriteLine($"Greet(name, message) -> {message} {name}");
}
`;

export default {
  id: 'day-014-method-overloading-optional-named-arguments',
  title: 'Method Overloading, Optional Parameters and Named Arguments',
  module: 'Module 1: C# Programming Fundamentals',
  day: 14,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Give several methods the same name with different parameter lists (method overloading), make parameters optional with default values, and pass arguments by name for clear, flexible calls. Build a calculator using methods and the practical programs largest of three numbers and positive/negative/zero.`,
  objectives: [
    'Define overloaded methods that differ by number, type or order of parameters',
    'Explain why return type alone cannot overload a method and how the compiler picks an overload',
    'Declare optional parameters with default values and follow their rules',
    'Call methods with named arguments in any order and mix them with positional arguments',
    'Build a menu-driven calculator from small reusable methods',
  ],
  theory: [
    {
      heading: 'What is method overloading?',
      content: `Method overloading means writing MORE THAN ONE method with the SAME NAME in the same class (or scope), each with a DIFFERENT parameter list. The compiler decides which version to call by looking at the arguments - this is decided at compile time, so overloading is also called compile-time (static) polymorphism (covered in OOP on Day 23). Real-world analogy: a "Pay" counter in a shop accepts cash, card or UPI - same action name, different inputs. .NET itself uses overloading everywhere: Console.WriteLine has overloads for int, string, double, bool, object and more; Math.Max has overloads for int, long, double, decimal...`,
      points: [
        'Same method name, different signature',
        'Signature = method name + number, types, order and modifiers (ref/out/in) of parameters',
        'Improves readability: Add(2, 3) and Add(2.5, 3.5) instead of AddInt and AddDouble',
        'Resolved at compile time',
      ],
    },
    {
      heading: 'Rules of overloading',
      content: `Overloads must differ in at least one of: the NUMBER of parameters, the TYPE of parameters, the ORDER of parameter types, or a ref/out/in modifier. The following do NOT make a valid overload: a different return type only, different parameter names only, or a difference only between ref and out (ref and out count as the same for overloading). Having both Show(int x) and Show(ref int x) is allowed but confusing - avoid it.`,
      syntax: `static int Area(int side) => side * side;                  // 1 parameter
static int Area(int length, int width) => length * width;   // 2 parameters - OK
static double Area(double radius) => 3.14 * radius * radius; // different type - OK
static void Print(int id, string name) { }                   // order int, string
static void Print(string name, int id) { }                   // order string, int - OK

// static double Area(int side) => side;   // ERROR CS0111: only return type differs
// static int Area(int s) => s * s;         // ERROR: only parameter name differs`,
    },
    {
      heading: 'How the compiler chooses an overload',
      content: `The compiler first looks for an EXACT match of the argument types. If none exists, it looks for overloads reachable through implicit conversions and picks the "best" (closest) one: int -> long -> float -> double is the widening order, so Show(5) prefers int, a short argument prefers int over long, a char converts to int (its Unicode code), and a float prefers double. If two overloads are equally good, you get error CS0121 "The call is ambiguous". If no overload fits, you get CS1503 "cannot convert". Narrowing conversions (double -> int) are never done automatically.`,
      points: [
        'Exact match first: Show(5L) -> Show(long)',
        'Then closest implicit conversion: Show(\'A\') -> Show(int) prints 65',
        'Ambiguous call -> compile error CS0121',
        'Hover over a call in Visual Studio to see which overload was chosen; Ctrl+Shift+Space shows all overloads (parameter info)',
      ],
    },
    {
      heading: 'Optional parameters (default values)',
      content: `An optional parameter has a default value in the method definition: int quantity = 1. If the caller does not pass that argument, the default is used. Rules: optional parameters must come AFTER all required parameters; the default must be a compile-time constant (a literal, const, default, or null) - you cannot use DateTime.Now or new List<int>(); params must still be last. Optional parameters reduce the number of overloads you need. Analogy: ordering coffee - if you do not say the sugar quantity, the shop adds 1 spoon by default.`,
      syntax: `static void Order(string item, int qty = 1, bool takeaway = false)
{
    Console.WriteLine($"{qty} x {item}, takeaway: {takeaway}");
}

Order("Coffee");             // 1 x Coffee, takeaway: False
Order("Tea", 2);             // 2 x Tea, takeaway: False
Order("Juice", 3, true);     // 3 x Juice, takeaway: True

// static void Bad(int a = 0, int b) { }   // ERROR CS1737: optional before required`,
    },
    {
      heading: 'Named arguments',
      content: `Named arguments pass a value by writing the parameter name followed by a colon: Order(item: "Tea", qty: 2). Benefits: (1) calls become self-documenting - CreateUser("Asha", isAdmin: true) is clearer than CreateUser("Asha", true); (2) you can skip some optional parameters and set a later one: Order("Tea", takeaway: true); (3) when all arguments are named, the order does not matter. Positional arguments should come before named ones (C# 7.2+ allows a named argument in the middle only if it is in its correct position). The parameter names become part of your public "contract", so renaming a parameter can break callers that use named arguments.`,
      syntax: `Order(item: "Tea", qty: 2);
Order("Tea", takeaway: true);               // skip qty, keep its default
Order(takeaway: true, qty: 4, item: "Cola"); // any order when all are named
// Order(qty: 2, "Tea");                    // ERROR: named argument out of position`,
      tip: 'Use named arguments for bool and number literals whose meaning is not obvious at the call site.',
    },
    {
      heading: 'Overloading vs optional parameters',
      content: `Both let a method be called in different ways. Use OPTIONAL PARAMETERS when the logic is the same and only some values have sensible defaults (PrintBill with quantity = 1). Use OVERLOADING when the parameter TYPES are different or the logic differs per type (Add(int, int) vs Add(string, string)). If an overload without optional parameters and one with optional parameters both match a call, the compiler prefers the one where no defaults have to be filled in. Do not combine them carelessly - it can make calls ambiguous.`,
      points: [
        'Same logic, some defaults -> optional parameters',
        'Different types or behaviour -> overloading',
        'Tie-breaker: the candidate that needs no default values wins',
      ],
    },
  ],
  examples: [
    {
      title: 'Overloaded Add methods',
      scenario: 'Create one Add name that works for two ints, three ints, doubles, strings and an array.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OverloadingDemo',
        'Replace Program.cs with the code',
        'Type "Add(" after the last line and press Ctrl+Shift+Space to see the list of overloads in IntelliSense, then delete it',
        'Press Ctrl+F5',
      ],
      code: overloadCode,
      csharp: { files: { 'Program.cs': overloadCode }, stdin: '' },
      result: `Add(10, 20)         = 30
Add(10, 20, 30)     = 60
Add(2.5, 3.75)      = 6.25
Add(Dot, Net)       = DotNet
Add(int[] {1,2,3})  = 6`,
      explanation: `The compiler matches each call to the overload with the best parameter list: two ints, three ints, two doubles, two strings and one int[]. The string version concatenates instead of adding. The commented-out long Add(int, int) would fail because overloads cannot differ only by return type. IMPORTANT: overloading works for methods of a class. Local functions (methods written after top-level statements) can NOT be overloaded - two local functions with the same name give error CS0128 - so all overloading examples today use class Program with Main.`,
    },
    {
      title: 'Largest of three numbers and positive/negative/zero',
      scenario: 'Student practical programs: find the largest of two or three numbers and classify numbers as positive, negative or zero using overloaded methods.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it LargestAndSign',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: largestCode,
      csharp: { files: { 'Program.cs': largestCode }, stdin: '' },
      result: `Largest(12, 45)     = 45
Largest(12, 45, 30) = 45
Largest(-5, -2, -9) = -2
Largest(7, 7, 3)    = 7
15 is Positive
-8 is Negative
0 is Zero
-0.5 is Negative`,
      explanation: `Largest(int, int, int) starts with max = a and replaces it whenever b or c is bigger - this also works for negative numbers and equal values. CheckSign is overloaded for int and double: -0.5 is a double literal, so the double version (a nested conditional operator) is called. For 0 both comparisons are false, so "Zero" is returned.`,
    },
    {
      title: 'Optional parameters and named arguments: billing',
      scenario: 'A shop billing method has a default quantity of 1 and default discount of 0%. Call it in five different ways.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OptionalNamedDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: optionalCode,
      csharp: { files: { 'Program.cs': optionalCode }, stdin: '' },
      result: `Notebook: 1 x 60, discount 0% => 60
Pen: 5 x 10, discount 0% => 50
Bag: 2 x 800, discount 10% => 1440
Bottle: 1 x 250, discount 20% => 200
Marker: 3 x 25, discount 0% => 75`,
      explanation: `Notebook uses both defaults (quantity 1, discount 0). Bag: 800 x 2 = 1600, 10% of 1600 = 160, pay 1440. Bottle skips quantity by naming discountPercent: 250 - 50 = 200. Marker names all three required arguments, so their order does not matter. Integer arithmetic is used for the discount: total * discountPercent / 100 (multiply first to avoid losing precision).`,
    },
    {
      title: 'Calculator using methods',
      scenario: 'Day practical: a menu-driven calculator where every operation is a separate method and input reading is reused.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MethodCalculator',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and enter: 1, 20, 4, then 3, 6, 7, then 4, 22, 8, then 4, 7, 0, then 5',
      ],
      code: calcCode,
      csharp: { files: { 'Program.cs': calcCode }, stdin: '1\n20\n4\n3\n6\n7\n4\n22\n8\n4\n7\n0\n5\n' },
      result: `1.Add 2.Subtract 3.Multiply 4.Divide 5.Exit
Choice: a: b: 20 + 4 = 24
1.Add 2.Subtract 3.Multiply 4.Divide 5.Exit
Choice: a: b: 6 x 7 = 42
1.Add 2.Subtract 3.Multiply 4.Divide 5.Exit
Choice: a: b: 22 / 8 = 2.75
1.Add 2.Subtract 3.Multiply 4.Divide 5.Exit
Choice: a: b: Cannot divide by zero
1.Add 2.Subtract 3.Multiply 4.Divide 5.Exit
Choice: Thank you!`,
      explanation: `ReadInt is one method reused for the menu choice and both numbers. Calculate returns a string, so the loop only prints it. Divide casts to double before dividing (22 / 8 = 2.75, not 2), and the zero check happens before the call. The do-while shows the menu at least once and stops when 5 is entered. (In the online runner input is not echoed, so prompts appear on one line; in a real console you see what you typed.)`,
    },
    {
      title: 'Overload resolution in action',
      scenario: 'Predict which overload is called for different argument types - a favourite interview question.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OverloadResolution',
        'Replace Program.cs with the code',
        'Before running, write down your predictions; hover each call to see the chosen overload',
        'Press Ctrl+F5',
      ],
      code: resolutionCode,
      csharp: { files: { 'Program.cs': resolutionCode }, stdin: '' },
      result: `Show(int)    called with 5
Show(long)   called with 5
Show(double) called with 5
Show(int)    called with 65
Show(double) called with 5.5
Show(int)    called with 7
Show(string) called with 5
Greet(name)          -> Hello Asha
Greet(name, message) -> Good morning Ravi`,
      explanation: `5 is an int literal, 5L a long, 5.0 a double (printed as 5 by ToString). 'A' has no char overload, and char -> int is the closest implicit conversion, so its code 65 is printed. 5.5f (float) widens to double. short -> int is preferred over short -> long or double. For Greet("Asha") both overloads are applicable, but the one that needs no default value wins.`,
    },
  ],
  interview: [
    { q: 'What is method overloading?', a: 'Defining multiple methods with the same name but different parameter lists (number, type, order or ref/out/in modifiers) in the same class. The compiler chooses the version at compile time based on the arguments.', level: 'Easy' },
    { q: 'Can we overload methods by return type only?', a: 'No. Return type is not part of the signature for overloading; it gives error CS0111 (member already defined).', level: 'Easy' },
    { q: 'Is overloading compile-time or runtime polymorphism?', a: 'Compile-time (static) polymorphism - the call is bound during compilation. Overriding with virtual/override is runtime polymorphism.', level: 'Medium' },
    { q: 'What is the output? static void M(long x) => Console.WriteLine("long"); static void M(double x) => Console.WriteLine("double"); M(10);', a: 'long - int converts implicitly to both, but int -> long is a better (closer) conversion than int -> double.', level: 'Hard' },
    { q: 'What is the output? static void P(int x) => Console.WriteLine("int"); static void P(object x) => Console.WriteLine("object"); P(\'x\');', a: 'int - char converts to int implicitly; that is better than boxing to object.', level: 'Hard' },
    { q: 'What are optional parameters? What are their rules?', a: 'Parameters with default values that the caller can omit. They must come after required parameters, the default must be a compile-time constant (literal, const, null, default), and a params array must still be last.', level: 'Medium' },
    { q: 'What are named arguments and why use them?', a: 'Arguments passed with the parameter name (name: value). They improve readability (especially for bool/number literals), allow any order, and let you skip optional parameters in the middle.', level: 'Easy' },
    { q: 'What is the output? static int F(int a, int b = 2, int c = 3) => a + b * c; Console.WriteLine(F(1, c: 10));', a: '21 - a = 1, b uses its default 2, c = 10: 1 + 2 * 10 = 21.', level: 'Medium' },
    { q: 'Can you overload Main?', a: 'Yes, you can write other methods named Main with different parameters, but only one valid entry-point signature is used to start the program (otherwise configure StartupObject).', level: 'Medium' },
    { q: 'When does an overloaded call become ambiguous?', a: 'When two overloads are equally good for the arguments, e.g. M(int, double) and M(double, int) called with M(1, 1). The compiler gives error CS0121.', level: 'Hard' },
    { q: 'Overloading vs optional parameters - which to choose?', a: 'Optional parameters when the logic is the same and some values have defaults; overloading when parameter types differ or the behaviour differs. Too many of either makes an API confusing.', level: 'Medium' },
    { q: 'Do ref and out create different overloads from each other?', a: 'No. M(ref int x) and M(out int x) cannot coexist (CS0663). But M(int x) and M(ref int x) can.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Student practical program: Largest of three numbers. Read three integers from the user and print the largest using a method int Largest(int a, int b, int c).',
      hint: 'Start with max = a, then compare with b and c.',
      solution: `Console.Write("Enter three numbers: ");
string[] parts = (Console.ReadLine() ?? "0 0 0").Split(' ', StringSplitOptions.RemoveEmptyEntries);
int a = int.Parse(parts[0]), b = int.Parse(parts[1]), c = int.Parse(parts[2]);
Console.WriteLine($"Largest = {Largest(a, b, c)}");

static int Largest(int x, int y, int z)
{
    int max = x;
    if (y > max) max = y;
    if (z > max) max = z;
    return max;
}
// Input: 14 52 37  ->  Largest = 52
// (To also add a 2-parameter Largest overload, put both methods inside a class -
//  local functions in top-level programs cannot be overloaded.)`,
    },
    {
      task: 'Student practical program: Positive, negative or zero. Write string CheckNumber(int n) and test it with a number entered by the user.',
      hint: 'if n > 0 ... else if n < 0 ... else ...',
      solution: `Console.Write("Enter a number: ");
int n = int.Parse(Console.ReadLine() ?? "0");
Console.WriteLine($"{n} is {CheckNumber(n)}");

static string CheckNumber(int n)
{
    if (n > 0) return "Positive";
    if (n < 0) return "Negative";
    return "Zero";
}
// -12 -> -12 is Negative, 0 -> 0 is Zero`,
    },
    {
      task: 'Write overloaded Area methods: Area(int side) for a square, Area(int length, int width) for a rectangle and Area(double radius) for a circle. Print the areas for 4, (5, 3) and 2.0.',
      hint: 'Overloads must be class methods (class Program with Main). Use Math.PI and format with ToString("0.00", CultureInfo.InvariantCulture).',
      solution: `using System.Globalization;

class Program
{
    static void Main()
    {
        Console.WriteLine($"Square    = {Area(4)}");          // 16
        Console.WriteLine($"Rectangle = {Area(5, 3)}");       // 15
        Console.WriteLine("Circle    = " + Area(2.0).ToString("0.00", CultureInfo.InvariantCulture)); // 12.57
    }

    static int Area(int side) => side * side;
    static int Area(int length, int width) => length * width;
    static double Area(double radius) => Math.PI * radius * radius;
}`,
    },
    {
      task: 'Calculator using methods: write Calculate(int a, int b, char op = \'+\') that supports + - * / and returns an int. Call it with and without the op argument.',
      hint: 'Use a switch expression on op; the default parameter makes Calculate(5, 3) add.',
      solution: `Console.WriteLine(Calculate(5, 3));        // 8
Console.WriteLine(Calculate(5, 3, '-'));   // 2
Console.WriteLine(Calculate(5, 3, '*'));   // 15
Console.WriteLine(Calculate(9, 3, op: '/')); // 3

static int Calculate(int a, int b, char op = '+') => op switch
{
    '+' => a + b,
    '-' => a - b,
    '*' => a * b,
    '/' => b != 0 ? a / b : 0,
    _ => 0
};`,
    },
    {
      task: 'Write a method SendMessage(string to, string text = "Hello", bool urgent = false) and call it four ways: only to; to + text; to + urgent (named); all three named in reverse order.',
      hint: 'Print the values inside the method to see which defaults were used.',
      solution: `SendMessage("Asha");
SendMessage("Ravi", "Class at 10");
SendMessage("Meena", urgent: true);
SendMessage(urgent: false, text: "Bye", to: "Kiran");

static void SendMessage(string to, string text = "Hello", bool urgent = false)
{
    Console.WriteLine($"To {to}: {text} (urgent: {urgent})");
}
// To Asha: Hello (urgent: False)
// To Ravi: Class at 10 (urgent: False)
// To Meena: Hello (urgent: True)
// To Kiran: Bye (urgent: False)`,
    },
  ],
  quiz: [
    {
      question: 'Which of these pairs is a VALID overload?',
      options: ['int Sum(int a, int b) and long Sum(int a, int b)', 'void Show(int x) and void Show(int y)', 'void Print(int a) and void Print(string a)', 'void M(ref int x) and void M(out int x)'],
      answer: 2,
      explanation: 'Only the parameter type differs (int vs string) - that is a valid overload. The others differ only by return type, parameter name, or ref vs out.',
    },
    {
      question: 'static int F(int a, int b = 5) => a * b; What does F(3) return?',
      options: ['15', '3', '8', 'Compile error'],
      answer: 0,
      explanation: 'b uses its default value 5: 3 * 5 = 15.',
    },
    {
      question: 'Which declaration causes a compile error?',
      options: ['void A(int x, int y = 0)', 'void B(int x = 0, int y)', 'void C(int x = 1, int y = 2)', 'void D(string s, bool f = false)'],
      answer: 1,
      explanation: 'Optional parameters must come after all required parameters (CS1737).',
    },
    {
      question: 'Overloads Show(int) and Show(double) exist. Which one does Show(\'B\') call?',
      options: ['Show(double)', 'Compile error: ambiguous', 'Runtime error', 'Show(int)'],
      answer: 3,
      explanation: 'char converts implicitly to int, which is a better conversion than to double.',
    },
    {
      question: 'Which call uses a named argument correctly for void Book(string room, int nights = 1, bool breakfast = false)?',
      options: ['Book(breakfast = true, "Deluxe")', 'Book("Deluxe", breakfast: true)', 'Book("Deluxe", true)', 'Book(nights: 2, "Deluxe")'],
      answer: 1,
      explanation: 'Named arguments use name: value. Positional "Deluxe" comes first, nights keeps its default 1.',
    },
  ],
};
