const basicCode = `// Day 13 - Example 1: Hello World, Add and Subtract methods
class Program
{
    static void Main()
    {
        SayHello();                       // call a void method

        int sum = Add(25, 17);            // 25 and 17 are arguments
        Console.WriteLine($"25 + 17 = {sum}");

        int diff = Subtract(25, 17);
        Console.WriteLine($"25 - 17 = {diff}");

        Console.WriteLine($"Add(Subtract(50, 20), 5) = {Add(Subtract(50, 20), 5)}");
        PrintLine();
    }

    // void method: does a job, returns nothing
    static void SayHello()
    {
        Console.WriteLine("Hello World!");
    }

    // a and b are parameters; int is the return type
    static int Add(int a, int b)
    {
        return a + b;
    }

    static int Subtract(int a, int b)
    {
        int result = a - b;
        return result;
    }

    static void PrintLine()
    {
        Console.WriteLine("--------------------");
    }
}
`;

const inputCode = `// Day 13 - Example 2: Add two numbers entered by the user using methods
int first = ReadNumber("Enter first number: ");
int second = ReadNumber("Enter second number: ");

Console.WriteLine();
Console.WriteLine($"Sum        = {Add(first, second)}");
Console.WriteLine($"Difference = {Subtract(first, second)}");
Console.WriteLine($"Larger     = {Larger(first, second)}");

// Local functions in a top-level program (they act like static methods)
static int ReadNumber(string prompt)
{
    Console.Write(prompt);
    string? text = Console.ReadLine();
    return int.TryParse(text, out int value) ? value : 0;
}

static int Add(int a, int b) => a + b;          // expression-bodied method
static int Subtract(int a, int b) => a - b;

static int Larger(int a, int b)
{
    if (a > b)
        return a;          // return exits the method immediately
    return b;
}
`;

const returnTypesCode = `// Day 13 - Example 3: Different return types - bool, string, double
using System.Globalization;

int[] numbers = { 7, 10, -4, 0 };
foreach (int n in numbers)
{
    Console.WriteLine($"{n} is {(IsEven(n) ? "Even" : "Odd")}");
}

Console.WriteLine($"Grade for 82: {GetGrade(82)}");
Console.WriteLine($"Grade for 47: {GetGrade(47)}");
Console.WriteLine($"Grade for 30: {GetGrade(30)}");

double avg = Average(78, 85, 90);
Console.WriteLine("Average: " + avg.ToString("0.00", CultureInfo.InvariantCulture));

PrintReport("Asha", 82);

static bool IsEven(int number)
{
    return number % 2 == 0;
}

static string GetGrade(int marks)
{
    if (marks >= 75) return "A";
    if (marks >= 60) return "B";
    if (marks >= 35) return "C";
    return "Fail";
}

static double Average(int a, int b, int c)
{
    return (a + b + c) / 3.0;
}

static void PrintReport(string name, int marks)
{
    if (marks < 0)
    {
        Console.WriteLine("Invalid marks");
        return;             // early exit from a void method
    }
    Console.WriteLine($"{name}: {marks} marks, Grade {GetGrade(marks)}, {(IsEven(marks) ? "even" : "odd")} score");
}
`;

const refOutCode = `// Day 13 - Example 4: Pass by value, ref, out and in
int x = 10;
DoubleByValue(x);
Console.WriteLine($"After DoubleByValue : x = {x}");

DoubleByRef(ref x);
Console.WriteLine($"After DoubleByRef   : x = {x}");

int p = 5, q = 9;
Swap(ref p, ref q);
Console.WriteLine($"After Swap          : p = {p}, q = {q}");

Calculate(17, 5, out int quotient, out int remainder);
Console.WriteLine($"17 / 5              : quotient = {quotient}, remainder = {remainder}");

bool ok = TryDivide(10, 0, out int answer);
Console.WriteLine($"TryDivide(10, 0)    : ok = {ok}, answer = {answer}");

Console.WriteLine($"Area (in)           : {Area(in q)}");

static void DoubleByValue(int n)
{
    n = n * 2;                        // changes only the local copy
}

static void DoubleByRef(ref int n)
{
    n = n * 2;                        // changes the caller's variable
}

static void Swap(ref int a, ref int b)
{
    int temp = a;
    a = b;
    b = temp;
}

static void Calculate(int a, int b, out int quo, out int rem)
{
    quo = a / b;                      // out parameters MUST be assigned
    rem = a % b;
}

static bool TryDivide(int a, int b, out int result)
{
    if (b == 0)
    {
        result = 0;
        return false;
    }
    result = a / b;
    return true;
}

static int Area(in int side)
{
    // side = 10;                     // error: in parameters are read-only
    return side * side;
}
`;

const paramsCode = `// Day 13 - Example 5: params arrays, arrays as parameters and returning arrays
int total1 = Sum(10, 20);
int total2 = Sum(1, 2, 3, 4, 5);
int total3 = Sum();
Console.WriteLine($"Sum(10, 20)        = {total1}");
Console.WriteLine($"Sum(1, 2, 3, 4, 5) = {total2}");
Console.WriteLine($"Sum()              = {total3}");

int[] marks = { 45, 72, 38, 90 };
Console.WriteLine($"Highest mark       = {Highest(marks)}");

AddBonus(marks, 5);                         // arrays are reference types
Console.WriteLine($"After bonus        = {string.Join(", ", marks)}");

int[] squares = GetSquares(4);
Console.WriteLine($"Squares            = {string.Join(" ", squares)}");

static int Sum(params int[] values)
{
    int total = 0;
    foreach (int v in values) total += v;
    return total;
}

static int Highest(int[] arr)
{
    int max = arr[0];
    for (int i = 1; i < arr.Length; i++)
        if (arr[i] > max) max = arr[i];
    return max;
}

static void AddBonus(int[] arr, int bonus)
{
    for (int i = 0; i < arr.Length; i++)
        arr[i] += bonus;                    // changes the caller's array
}

static int[] GetSquares(int n)
{
    int[] result = new int[n];
    for (int i = 0; i < n; i++)
        result[i] = (i + 1) * (i + 1);
    return result;
}
`;

export default {
  id: 'day-013-methods-parameters-return-types',
  title: 'Methods, Parameters and Return Types',
  module: 'Module 1: C# Programming Fundamentals',
  day: 13,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Split programs into small reusable methods. Learn method syntax, void vs return types, parameters vs arguments, pass by value, ref, out, in and params, expression-bodied methods and local functions. Practical programs: Hello World method, add two numbers, addition/subtraction methods and even/odd check.`,
  objectives: [
    'Define and call static methods with parameters and return values',
    'Choose the right return type (void, int, bool, string, double, arrays)',
    'Explain pass by value vs pass by reference using ref, out and in',
    'Use params arrays, expression-bodied methods and local functions in top-level programs',
    'Write addition, subtraction and even/odd programs using methods',
  ],
  theory: [
    {
      heading: 'What is a method and why use it?',
      content: `A method is a named block of code that performs one task and can be called (executed) many times. Main itself is a method - the entry point of the program. Methods follow the DRY principle (Don't Repeat Yourself): write the logic once and call it wherever needed. Benefits: reusability, readability (a good name like CalculateTax explains the code), easy testing and easier debugging. Real-world analogy: a method is like a coffee machine - you give inputs (coffee powder, water = parameters), press the button (call), and get an output (coffee = return value). You do not need to know how it works inside.`,
      points: [
        'A method is defined once and called many times',
        'Each method should do ONE job (single responsibility)',
        'Method names use PascalCase and usually start with a verb: Add, PrintReport, IsEven, GetGrade',
        'In Visual Studio, F12 goes to a method definition and Shift+F12 finds all references',
      ],
    },
    {
      heading: 'Method syntax',
      content: `A method declaration has: an access modifier (public, private - default is private inside a class), optional static (call it without creating an object; required to call it directly from static Main), a return type (void if nothing is returned), a name, and a parameter list in brackets. The body in { } contains the statements. A method with a non-void return type MUST return a value on every path, otherwise you get error CS0161 "not all code paths return a value". The return statement ends the method immediately.`,
      syntax: `[access] [static] returnType MethodName(type param1, type param2)
{
    // statements
    return value;      // only if returnType is not void
}

static int Add(int a, int b)
{
    return a + b;
}

int total = Add(5, 3);   // calling the method -> 8`,
      tip: 'Type "svm" + Tab Tab in Visual Studio for static void Main. Select code and press Ctrl+R, Ctrl+M (Extract Method) to move it into a new method automatically.',
    },
    {
      heading: 'Parameters, arguments and return types',
      content: `Parameters are the variables listed in the method definition (int a, int b). Arguments are the actual values passed during the call (Add(5, 3)). The number, order and types of arguments must match the parameters. The return type is the type of the value the method sends back: void (nothing), int, double, bool (for questions like IsEven, IsPrime), string, arrays, or any class. A void method can still use return; (without a value) to exit early. The value returned can be stored in a variable, printed directly or passed into another method: Add(Subtract(50, 20), 5).`,
      syntax: `static bool IsEven(int n) => n % 2 == 0;        // returns bool
static string Greet(string name) => "Hi " + name; // returns string
static void Print(string msg) { Console.WriteLine(msg); }  // returns nothing

bool even = IsEven(8);      // true
Print(Greet("Asha"));       // Hi Asha`,
    },
    {
      heading: 'Pass by value vs ref, out and in',
      content: `By default C# passes arguments BY VALUE: the method gets a COPY, so changing the parameter inside the method does not change the caller's variable. With ref the method receives a reference to the caller's variable, so changes are visible outside; the variable must be initialized before the call and ref must be written in both the definition and the call. out is like ref but used to RETURN extra values: the variable does not need to be initialized before the call, but the method MUST assign it before returning (int.TryParse uses out). in passes by reference but read-only (useful for large structs). Note: for reference types like arrays, the copy is a copy of the reference - so the method CAN change the array's elements.`,
      syntax: `static void Swap(ref int a, ref int b) { int t = a; a = b; b = t; }
Swap(ref x, ref y);

static void Divide(int a, int b, out int q, out int r) { q = a / b; r = a % b; }
Divide(17, 5, out int q, out int r);   // q = 3, r = 2

static int Square(in int n) => n * n;  // n cannot be changed inside`,
      points: [
        'value (default): copy - caller not affected',
        'ref: must be initialized before call; method may read and change it',
        'out: need not be initialized; method must assign it',
        'in: read-only reference',
      ],
    },
    {
      heading: 'params, expression-bodied methods and local functions',
      content: `params lets a method accept a variable number of arguments as an array: Sum(1, 2), Sum(1, 2, 3, 4) or even Sum(). It must be the LAST parameter and only one params is allowed. Expression-bodied methods use => for one-line methods: static int Add(int a, int b) => a + b; In a top-level program (no class Program written), methods declared after the statements are LOCAL FUNCTIONS of the hidden Main method; mark them static when they do not use outer variables. In a class Program with Main, methods are declared inside the class next to Main.`,
      syntax: `static int Sum(params int[] nums)
{
    int t = 0;
    foreach (int n in nums) t += n;
    return t;
}
Sum(1, 2, 3);   // 6

static double Square(double x) => x * x;   // expression-bodied`,
      tip: 'Top-level statements must come BEFORE the local function declarations in Program.cs.',
    },
    {
      heading: 'How a method call works (call stack)',
      content: `When a method is called, .NET creates a new stack frame holding its parameters and local variables. Control jumps to the method, runs it, and when return is reached (or the closing brace) the frame is removed and control goes back to the line after the call, carrying the return value. Local variables inside one method are not visible in another method. In Visual Studio press F11 (Step Into) on a method call to enter it, Shift+F11 (Step Out) to finish it, and open Debug > Windows > Call Stack to see which method called which.`,
      points: [
        'F10 Step Over: run the whole method call as one step',
        'F11 Step Into: go inside the called method',
        'Shift+F11 Step Out: finish the current method and return to the caller',
        'Call Stack window: shows the chain Main -> Add -> ...',
      ],
    },
  ],
  examples: [
    {
      title: 'Hello World, Add and Subtract methods',
      scenario: 'Student practical programs: print Hello World from a method and write addition and subtraction methods in a classic class Program with Main.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MethodBasics and tick "Do not use top-level statements" (or just replace the code)',
        'Replace Program.cs with the code',
        'Put the cursor on the Add(25, 17) line, press F9, then F5 and use F11 to step into Add',
        'Press Ctrl+F5 to run without debugging',
      ],
      code: basicCode,
      csharp: { files: { 'Program.cs': basicCode }, stdin: '' },
      result: `Hello World!
25 + 17 = 42
25 - 17 = 8
Add(Subtract(50, 20), 5) = 35
--------------------`,
      explanation: `Main calls SayHello first, which prints Hello World!. Add(25, 17) copies 25 into a and 17 into b and returns 42, which is stored in sum. Subtract returns 8. In the nested call the inner method runs first: Subtract(50, 20) = 30, then Add(30, 5) = 35. The methods are static so Main (also static) can call them without creating an object.`,
    },
    {
      title: 'Add two numbers entered by the user',
      scenario: 'Student practical program: read two numbers safely and show sum, difference and the larger number - using local functions in a top-level program.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it AddTwoNumbers',
        'Replace Program.cs with the code',
        'Press Ctrl+F5, type 25 and press Enter, then type 40 and press Enter',
      ],
      code: inputCode,
      csharp: { files: { 'Program.cs': inputCode }, stdin: '25\n40\n' },
      result: `Enter first number: Enter second number:
Sum        = 65
Difference = -15
Larger     = 40`,
      explanation: `ReadNumber is reused for both inputs - the prompt text is passed as an argument. int.TryParse returns false for invalid text (then 0 is used) instead of crashing like int.Parse. Add and Subtract are expression-bodied (=>). Larger returns as soon as a > b is true; otherwise execution continues to return b. (In the online runner the typed input is not echoed, so both prompts appear on one line; in a real console you see 25 and 40 after the prompts. The empty Console.WriteLine() ends that line.)`,
    },
    {
      title: 'Return types: even/odd, grade and average',
      scenario: 'Student practical program: check even/odd with a bool method, and return a grade (string) and an average (double).',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ReturnTypesDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: returnTypesCode,
      csharp: { files: { 'Program.cs': returnTypesCode }, stdin: '' },
      result: `7 is Odd
10 is Even
-4 is Even
0 is Even
Grade for 82: A
Grade for 47: C
Grade for 30: Fail
Average: 84.33
Asha: 82 marks, Grade A, even score`,
      explanation: `IsEven returns the bool result of n % 2 == 0 directly - no if needed. -4 % 2 is 0, so -4 is even (for odd negatives % gives -1, which is why we compare with 0, not with 1). GetGrade uses several returns; the first true condition wins. Average divides by 3.0 so the result is double: 253 / 3.0 = 84.333... printed as 84.33. PrintReport is void and shows an early return for invalid input.`,
    },
    {
      title: 'Pass by value, ref, out and in',
      scenario: 'See which method calls change the caller\'s variables, swap two numbers and return two results at once.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RefOutDemo',
        'Replace Program.cs with the code',
        'Press F9 on DoubleByValue(x); press F5, then F11 and watch n and x in the Locals/Autos window',
        'Press Ctrl+F5 for the output',
      ],
      code: refOutCode,
      csharp: { files: { 'Program.cs': refOutCode }, stdin: '' },
      result: `After DoubleByValue : x = 10
After DoubleByRef   : x = 20
After Swap          : p = 9, q = 5
17 / 5              : quotient = 3, remainder = 2
TryDivide(10, 0)    : ok = False, answer = 0
Area (in)           : 25`,
      explanation: `DoubleByValue doubles a copy, so x stays 10. DoubleByRef works on x itself: 10 * 2 = 20. Swap needs ref - without it only copies would be swapped. Calculate returns two values through out parameters: 17 / 5 = 3 and 17 % 5 = 2. TryDivide follows the same pattern as int.TryParse: a bool for success plus an out result. After the swap q is 5, so Area(in q) = 5 * 5 = 25.`,
    },
    {
      title: 'params, arrays as parameters and returning arrays',
      scenario: 'Write a Sum method that accepts any number of values, find the highest mark, add a bonus to every mark and return a new array.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ParamsArrayMethods',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: paramsCode,
      csharp: { files: { 'Program.cs': paramsCode }, stdin: '' },
      result: `Sum(10, 20)        = 30
Sum(1, 2, 3, 4, 5) = 15
Sum()              = 0
Highest mark       = 90
After bonus        = 50, 77, 43, 95
Squares            = 1 4 9 16`,
      explanation: `With params the compiler builds the array for you: Sum() receives an empty array and returns 0. AddBonus receives a copy of the REFERENCE to the same array, so changing arr[i] changes marks in the caller (45+5, 72+5, 38+5, 90+5). GetSquares creates a new array inside the method and returns it: (0+1)^2 ... (3+1)^2 = 1 4 9 16.`,
    },
  ],
  interview: [
    { q: 'What is a method? Why do we use methods?', a: 'A named, reusable block of code that performs a task. Methods avoid code duplication, improve readability, make testing and debugging easier and allow splitting a big program into small pieces.', level: 'Easy' },
    { q: 'Difference between parameters and arguments?', a: 'Parameters are the variables in the method definition; arguments are the actual values passed at the call. In Add(int a, int b) a and b are parameters; in Add(2, 3) 2 and 3 are arguments.', level: 'Easy' },
    { q: 'What is the difference between ref and out?', a: 'Both pass by reference. ref requires the variable to be initialized before the call and the method may or may not change it. out does not require initialization, but the method must assign it before returning. out is used to return extra values (TryParse).', level: 'Medium' },
    { q: 'What is the output? static void Change(int n) { n = 100; } int x = 5; Change(x); Console.WriteLine(x);', a: '5 - int is passed by value, so only the copy n changes.', level: 'Easy' },
    { q: 'What is the output? static void Change(int[] a) { a[0] = 100; } int[] arr = { 1, 2 }; Change(arr); Console.WriteLine(arr[0]);', a: '100 - the reference is copied, but both point to the same array, so the element change is visible.', level: 'Medium' },
    { q: 'What is the output? static void Reset(int[] a) { a = new int[] { 9 }; } int[] arr = { 1, 2 }; Reset(arr); Console.WriteLine(arr[0]);', a: '1 - the method points its own copy of the reference to a new array; the caller\'s variable still points to the old array. With ref int[] a it would print 9.', level: 'Hard' },
    { q: 'What is the params keyword? What are its rules?', a: 'It lets a method accept a variable number of arguments as an array. It must be the last parameter, only one params parameter is allowed, and you can pass individual values, an array, or nothing.', level: 'Medium' },
    { q: 'What does error CS0161 "not all code paths return a value" mean?', a: 'A non-void method has at least one path (e.g. an if without else) that reaches the end without a return statement. Add a return on every path.', level: 'Easy' },
    { q: 'Can a method return more than one value?', a: 'Directly only one, but you can use out parameters, return a tuple (int, int), an array, or an object/record containing several values.', level: 'Medium' },
    { q: 'What is an expression-bodied method?', a: 'A one-line method written with =>: static int Square(int x) => x * x; It is shorthand for a method body with a single return (or a single statement for void).', level: 'Easy' },
    { q: 'Why must methods called from Main be static (in class Program)?', a: 'Main is static, so it has no object instance. It can only call other static members directly; instance methods need an object: new Program().Method().', level: 'Medium' },
    { q: 'What is a local function?', a: 'A method declared inside another method. In top-level programs, methods written after the statements are local functions of the generated Main. Marking them static prevents capturing outer variables.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Student practical program: Hello World using a method. Write a method PrintWelcome(string name) that prints "Hello World!" and then "Welcome, <name>". Call it for two students.',
      hint: 'A void method with one string parameter.',
      solution: `PrintWelcome("Asha");
PrintWelcome("Ravi");

static void PrintWelcome(string name)
{
    Console.WriteLine("Hello World!");
    Console.WriteLine($"Welcome, {name}");
}
// Output:
// Hello World!
// Welcome, Asha
// Hello World!
// Welcome, Ravi`,
    },
    {
      task: 'Student practical program: Add two numbers. Read two integers from the user and print their sum using a method int Add(int a, int b).',
      hint: 'Use int.Parse(Console.ReadLine()) or TryParse, then call Add.',
      solution: `Console.Write("First number: ");
int a = int.Parse(Console.ReadLine() ?? "0");
Console.Write("Second number: ");
int b = int.Parse(Console.ReadLine() ?? "0");
Console.WriteLine($"Sum = {Add(a, b)}");

static int Add(int x, int y) => x + y;
// Input 12 and 30 -> Sum = 42`,
    },
    {
      task: 'Student practical program: Even or Odd. Write bool IsEven(int n) and print "<n> is Even" or "<n> is Odd" for a number read from the user.',
      hint: 'return n % 2 == 0;',
      solution: `Console.Write("Enter a number: ");
int n = int.Parse(Console.ReadLine() ?? "0");
Console.WriteLine(IsEven(n) ? $"{n} is Even" : $"{n} is Odd");

static bool IsEven(int n)
{
    return n % 2 == 0;
}
// 14 -> 14 is Even, 9 -> 9 is Odd`,
    },
    {
      task: 'Write methods Add, Subtract, Multiply and Divide (double) and print the results for 20 and 8.',
      hint: 'Divide should return double: (double)a / b.',
      solution: `int a = 20, b = 8;
Console.WriteLine($"Add = {Add(a, b)}");           // 28
Console.WriteLine($"Subtract = {Subtract(a, b)}"); // 12
Console.WriteLine($"Multiply = {Multiply(a, b)}"); // 160
Console.WriteLine($"Divide = {Divide(a, b)}");     // 2.5

static int Add(int x, int y) => x + y;
static int Subtract(int x, int y) => x - y;
static int Multiply(int x, int y) => x * y;
static double Divide(int x, int y) => (double)x / y;`,
    },
    {
      task: 'Write a method that returns both the minimum and maximum of an int array using out parameters. Test with { 8, 3, 15, 6 }.',
      hint: 'static void MinMax(int[] arr, out int min, out int max)',
      solution: `int[] data = { 8, 3, 15, 6 };
MinMax(data, out int min, out int max);
Console.WriteLine($"Min = {min}, Max = {max}");   // Min = 3, Max = 15

static void MinMax(int[] arr, out int min, out int max)
{
    min = arr[0];
    max = arr[0];
    foreach (int v in arr)
    {
        if (v < min) min = v;
        if (v > max) max = v;
    }
}`,
    },
    {
      task: 'Write double Average(params int[] marks) and print the average of 70, 80, 95 with 2 decimals.',
      hint: 'Sum in a loop, divide by (double)marks.Length; format with ToString("0.00", CultureInfo.InvariantCulture).',
      solution: `using System.Globalization;

double avg = Average(70, 80, 95);
Console.WriteLine(avg.ToString("0.00", CultureInfo.InvariantCulture));   // 81.67

static double Average(params int[] marks)
{
    int total = 0;
    foreach (int m in marks) total += m;
    return (double)total / marks.Length;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which return type is used for a method that returns nothing?',
      options: ['null', 'empty', 'void', 'none'],
      answer: 2,
      explanation: 'void means the method does not return a value.',
    },
    {
      question: 'Which keyword requires the method to assign the parameter before it returns?',
      options: ['out', 'ref', 'in', 'params'],
      answer: 0,
      explanation: 'out parameters must be assigned inside the method; the caller does not need to initialize them.',
    },
    {
      question: 'static int F(int a, int b) => a * b - a; What does F(4, 3) return?',
      options: ['12', '7', '9', '8'],
      answer: 3,
      explanation: '4 * 3 - 4 = 12 - 4 = 8.',
    },
    {
      question: 'Where must a params parameter be placed?',
      options: ['First in the list', 'Last in the list', 'Anywhere', 'It must be the only parameter'],
      answer: 1,
      explanation: 'params must be the last parameter and a method can have only one.',
    },
    {
      question: 'int x = 1; Inc(ref x); Inc(ref x); where static void Inc(ref int n) { n++; }. What is x?',
      options: ['1', '2', '3', 'Compile error'],
      answer: 2,
      explanation: 'ref passes the variable itself, so each call adds 1: 1 -> 2 -> 3.',
    },
  ],
};
