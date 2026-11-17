const factorialCode = `// Day 15 - Example 1: Factorial using recursion and using a loop
for (int n = 0; n <= 5; n++)
{
    Console.WriteLine($"{n}! = {Factorial(n)}");
}
Console.WriteLine($"10! = {Factorial(10)}");
Console.WriteLine($"20! = {Factorial(20)}");
Console.WriteLine($"Loop 10! = {FactorialLoop(10)}");

// Recursive: the method calls itself with a smaller problem
static long Factorial(int n)
{
    if (n <= 1)                 // base case - stops the recursion
        return 1;
    return n * Factorial(n - 1); // recursive case
}

// Iterative version for comparison
static long FactorialLoop(int n)
{
    long result = 1;
    for (int i = 2; i <= n; i++)
        result *= i;
    return result;
}
`;

const fibCode = `// Day 15 - Example 2: Fibonacci series - recursion, loop and memoization
class Program
{
    static int callCount = 0;                  // class-level field shared by all methods
    static long[] memo = new long[100];

    static void Main()
    {
        Console.Write("Recursive (10 terms): ");
        for (int i = 0; i < 10; i++)
        {
            Console.Write(Fib(i) + " ");
        }
        Console.WriteLine();

        Console.Write("Loop (15 terms)     : ");
        PrintSeries(15);

        callCount = 0;
        int f20 = Fib(20);
        Console.WriteLine($"Fib(20) = {f20}, recursive calls = {callCount}");

        Console.WriteLine($"FibMemo(50) = {FibMemo(50)}");
    }

    static int Fib(int n)
    {
        callCount++;
        if (n <= 1) return n;                  // base cases: Fib(0) = 0, Fib(1) = 1
        return Fib(n - 1) + Fib(n - 2);        // two recursive calls
    }

    static void PrintSeries(int terms)
    {
        long a = 0, b = 1;
        for (int i = 0; i < terms; i++)
        {
            Console.Write(a + " ");
            long next = a + b;
            a = b;
            b = next;
        }
        Console.WriteLine();
    }

    // Memoization: remember results that were already calculated
    static long FibMemo(int n)
    {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        memo[n] = FibMemo(n - 1) + FibMemo(n - 2);
        return memo[n];
    }
}
`;

const traceCode = `// Day 15 - Example 3: Tracing recursion and more recursive methods
int fact = FactTrace(4, 0);
Console.WriteLine($"Result = {fact}");
Console.WriteLine($"SumDigits(1234) = {SumDigits(1234)}");
Console.WriteLine($"Power(2, 10)    = {Power(2, 10)}");
Console.WriteLine($"Reverse(Hello)  = {Reverse("Hello")}");
Console.Write("CountDown(3)    : ");
CountDown(3);

static int FactTrace(int n, int depth)
{
    string indent = new string(' ', depth * 2);
    Console.WriteLine($"{indent}Fact({n}) called");
    if (n <= 1)
    {
        Console.WriteLine($"{indent}Fact({n}) returns 1");
        return 1;
    }
    int result = n * FactTrace(n - 1, depth + 1);
    Console.WriteLine($"{indent}Fact({n}) returns {result}");
    return result;
}

static int SumDigits(int n)
{
    if (n == 0) return 0;
    return n % 10 + SumDigits(n / 10);
}

static long Power(int b, int e)
{
    if (e == 0) return 1;
    return b * Power(b, e - 1);
}

static string Reverse(string s)
{
    if (s.Length <= 1) return s;
    return Reverse(s.Substring(1)) + s[0];
}

static void CountDown(int n)
{
    if (n == 0)
    {
        Console.WriteLine("Go!");
        return;
    }
    Console.Write(n + " ");
    CountDown(n - 1);
}
`;

const scopeCode = `// Day 15 - Example 4: Scope - class-level (global-like) fields vs local variables
class Program
{
    static int counter = 0;                       // field: visible to every method in the class
    static string appName = "Student Portal";

    static void Main()
    {
        Console.WriteLine($"App: {appName}");
        Increment();
        Increment();
        Increment();
        Console.WriteLine($"counter after 3 calls = {counter}");

        ShowShadowing();

        int total = 0;                            // local to Main
        for (int i = 1; i <= 3; i++)              // i exists only inside the loop
        {
            int square = i * i;                   // block scope: only inside { }
            total += square;
        }
        // Console.WriteLine(i);                  // error CS0103: i does not exist here
        // Console.WriteLine(square);             // error CS0103
        Console.WriteLine($"total of squares = {total}");

        if (total > 10)
        {
            string message = "Big total";
            Console.WriteLine(message);
        }
        // message is not visible here
    }

    static void Increment()
    {
        counter++;                                // changes the shared field
        int temp = counter * 10;                  // local: created fresh on every call
        Console.WriteLine($"Increment: counter = {counter}, temp = {temp}");
    }

    static void ShowShadowing()
    {
        int counter = 100;                        // local variable hides the field
        Console.WriteLine($"local counter = {counter}");
        Console.WriteLine($"field counter = {Program.counter}");
    }
}
`;

const varDynamicCode = `// Day 15 - Example 5: var (compile-time typing) vs dynamic (runtime typing)
var count = 10;
var price = 99.5;
var name = "Asha";
var marks = new[] { 80, 90, 75 };
Console.WriteLine($"count -> {count.GetType().Name}");
Console.WriteLine($"price -> {price.GetType().Name}");
Console.WriteLine($"name  -> {name.GetType().Name}");
Console.WriteLine($"marks -> {marks.GetType().Name}");
// count = "ten";          // error CS0029: var fixed the type as int

dynamic d = 10;
Console.WriteLine($"d = {d} ({d.GetType().Name})");
d = "Hello";               // allowed: type can change at runtime
Console.WriteLine($"d = {d} ({d.GetType().Name}), Length = {d.Length}");
d = true;
Console.WriteLine($"d = {d} ({d.GetType().Name})");

dynamic x = 5;
dynamic y = "5";
dynamic a = 5;
dynamic b = 7;
Console.WriteLine($"x + y = {x + y}");
Console.WriteLine($"a + b = {a + b}");

try
{
    d = "Hello";
    d.Fly();               // compiles, but fails at runtime
}
catch (Microsoft.CSharp.RuntimeBinder.RuntimeBinderException)
{
    Console.WriteLine("Runtime error: string has no method Fly()");
}
`;

export default {
  id: 'day-015-recursion-scope-var-dynamic',
  title: 'Recursion, Scope, Local and Global Concepts, var and dynamic',
  module: 'Module 1: C# Programming Fundamentals',
  day: 15,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Solve problems with methods that call themselves (recursion), understand the base case, the call stack and StackOverflowException, learn where variables live (block, method and class scope - C# has no true global variables) and compare var (compile-time type inference) with dynamic (runtime typing). Practical programs: factorial and Fibonacci series. This day completes Module 1.`,
  objectives: [
    'Write recursive methods with a correct base case and recursive case',
    'Trace recursion on the call stack and compare it with loops',
    'Generate the Fibonacci series recursively, iteratively and with memoization',
    'Explain block, method and class scope, local variables and class-level (global-like) static fields',
    'Differentiate var and dynamic and know when each is appropriate',
  ],
  theory: [
    {
      heading: 'What is recursion?',
      content: `Recursion is when a method calls ITSELF to solve a smaller version of the same problem. Every recursive method needs two parts: (1) a BASE CASE - a simple condition where the answer is known and the method returns WITHOUT calling itself (e.g. 0! = 1 and 1! = 1); (2) a RECURSIVE CASE - the method calls itself with a smaller input that moves towards the base case (n! = n x (n-1)!). Real-world analogy: Russian nesting dolls - open a doll, find a smaller doll inside, and repeat until the smallest doll (base case) which cannot be opened. Another analogy: standing in a queue and asking "how many people are ahead of me?" - each person asks the one in front and adds 1, until the first person says 0.`,
      syntax: `static long Factorial(int n)
{
    if (n <= 1) return 1;          // base case
    return n * Factorial(n - 1);   // recursive case
}
// Factorial(4) = 4 * Factorial(3)
//              = 4 * 3 * Factorial(2)
//              = 4 * 3 * 2 * Factorial(1)
//              = 4 * 3 * 2 * 1 = 24`,
    },
    {
      heading: 'Recursion and the call stack',
      content: `Each method call gets its own stack frame with its own copy of parameters and local variables. In recursion the frames pile up: Factorial(4) waits for Factorial(3), which waits for Factorial(2), and so on. When the base case returns, the frames are removed one by one in reverse order (LIFO - Last In, First Out) and each multiplication is completed on the way back. If the base case is missing or never reached (for example Factorial(-1) with the condition n == 1), the stack keeps growing until .NET throws StackOverflowException - this one cannot be caught with try/catch and the process ends. Very deep recursion (tens of thousands of levels) can overflow even with a correct base case.`,
      points: [
        'Debug > Windows > Call Stack (Ctrl+Alt+C) shows each pending call while you step with F11',
        'Always check the base case first in the method',
        'Make sure every recursive call moves closer to the base case',
        'StackOverflowException terminates the program - it cannot be handled',
      ],
    },
    {
      heading: 'Recursion vs iteration, and the Fibonacci problem',
      content: `Any recursive solution can also be written with a loop. Recursion gives short, elegant code for problems that are naturally recursive (factorial, Fibonacci, tree and folder traversal, Tower of Hanoi, binary search, merge sort). Loops use less memory and are usually faster. The Fibonacci series is 0, 1, 1, 2, 3, 5, 8, 13 ... where each term is the sum of the previous two: Fib(n) = Fib(n-1) + Fib(n-2), with Fib(0) = 0 and Fib(1) = 1. The naive recursive version recalculates the same values again and again (exponential time - Fib(20) makes 21,891 calls). MEMOIZATION fixes this by storing results in an array or dictionary and reusing them, making it linear time.`,
      points: [
        'Recursion: simpler code for self-similar problems, uses stack memory',
        'Iteration: faster and safer for large inputs',
        'Naive recursive Fibonacci: O(2^n); with memoization or a loop: O(n)',
        'Use long for factorials: 13! already exceeds int.MaxValue; 21! exceeds long',
      ],
    },
    {
      heading: 'Scope: block, method and class level',
      content: `Scope is the region of code where a variable can be used. BLOCK scope: a variable declared inside { } of an if, for, while or switch exists only inside that block - the loop counter i of a for loop disappears after the loop. METHOD (local) scope: variables and parameters declared in a method exist only while that method runs and are created fresh on every call; other methods cannot see them. CLASS scope: fields declared in the class (outside any method) are visible to all methods of the class; a static field keeps its value for the whole program run. Using a variable outside its scope gives compile error CS0103 "The name 'x' does not exist in the current context". C# does not allow declaring a local with the same name as another local in an enclosing scope (CS0136), but a local CAN have the same name as a field - it then hides (shadows) the field; use this.field or ClassName.field to reach the field.`,
      syntax: `class Program
{
    static int visits = 0;              // class scope (field)

    static void Main()
    {
        int x = 5;                      // method scope
        if (x > 0)
        {
            int y = x * 2;              // block scope
        }
        // y is not available here (CS0103)
    }
}`,
    },
    {
      heading: 'Local vs "global" variables in C#',
      content: `Many languages have global variables that are visible everywhere. C# has NO true global variables - everything lives inside a type. The closest equivalent is a public static field or property in a static class, e.g. public static class AppSettings { public static string AppName = "Student Portal"; } which can be used anywhere as AppSettings.AppName. Use such "globals" sparingly: any method can change them, which makes bugs hard to find; prefer passing values as parameters or returning results. In top-level programs, variables declared in the top-level statements are LOCAL variables of the generated Main method, not globals - they are not visible inside other classes. A const (const int MaxMarks = 100;) is a compile-time constant and is safe to share because it can never change.`,
      points: [
        'Local variable: declared in a method/block; lives only during that call; must be assigned before use',
        'Field: declared in a class; gets a default value (0, false, null) automatically',
        'static field: one shared copy for the whole class (global-like)',
        'Prefer parameters and return values over shared mutable state',
      ],
    },
    {
      heading: 'var - implicitly typed local variables',
      content: `var lets the COMPILER infer the type from the value on the right side: var count = 10; is exactly the same as int count = 10; after compilation. The type is fixed at compile time - you cannot later assign a string to it (CS0029), and you still get full IntelliSense and type checking. Rules: var can only be used for LOCAL variables (not fields, parameters or return types), it must be initialized in the same statement, and it cannot be initialized with null alone (var x = null; is an error). Use var when the type is obvious from the right side (var list = new List<string>();) or very long, and in foreach loops and LINQ.`,
      syntax: `var age = 21;                     // int
var price = 99.5;                 // double
var name = "Asha";                // string
var students = new List<string>(); // List<string>
// var x;                         // ERROR CS0818: must be initialized
// var y = null;                  // ERROR CS0815: cannot infer type from null`,
      tip: 'In Visual Studio, hover over var to see the inferred type. Right-click > Quick Actions (Ctrl+.) can convert between var and the explicit type.',
    },
    {
      heading: 'dynamic - type checking at runtime',
      content: `dynamic switches off compile-time type checking: the compiler accepts any member access or operation, and the Dynamic Language Runtime (DLR) resolves it WHILE THE PROGRAM RUNS. The actual type can change: dynamic d = 10; d = "Hello"; is allowed. If the member does not exist at runtime you get a RuntimeBinderException instead of a compile error, and there is no IntelliSense. Operators are decided by the runtime types: dynamic 5 + dynamic "5" gives "55". dynamic is useful for COM interop (Excel automation), working with JSON/ExpandoObject or dynamic languages, but it is slower and less safe - avoid it in normal business code. dynamic can be used for fields, parameters and return types; var cannot.`,
      points: [
        'var: type decided at COMPILE time, cannot change, full type safety',
        'dynamic: type decided at RUNTIME, can change, errors appear only when the code runs',
        'object: compile-time type is object; you need a cast to use the real members',
        'Interview line: "var is statically typed, dynamic is dynamically typed."',
      ],
    },
  ],
  examples: [
    {
      title: 'Factorial using recursion',
      scenario: 'Student practical program: calculate the factorial of 0 to 5, 10 and 20 recursively and verify with a loop.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RecursiveFactorial',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on return n * Factorial(n - 1); press F5 and use F11 repeatedly; open Debug > Windows > Call Stack to watch the frames grow and shrink',
        'Press Ctrl+F5 for the final output',
      ],
      code: factorialCode,
      csharp: { files: { 'Program.cs': factorialCode }, stdin: '' },
      result: `0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
10! = 3628800
20! = 2432902008176640000
Loop 10! = 3628800`,
      explanation: `The base case n <= 1 returns 1 for both 0! and 1!. Every other call multiplies n by the factorial of n - 1. The return type is long because 20! = 2,432,902,008,176,640,000 does not fit in int (max about 2.1 billion); 21! would overflow even long. The loop version gives the same answer without using the call stack.`,
    },
    {
      title: 'Fibonacci series: recursion, loop and memoization',
      scenario: 'Student practical program: print the Fibonacci series, then count how many calls the naive recursion makes and fix it with memoization.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it FibonacciSeries',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Try changing Fib(20) to Fib(40) and notice how slow it becomes, while FibMemo(90) is instant',
      ],
      code: fibCode,
      csharp: { files: { 'Program.cs': fibCode }, stdin: '' },
      result: `Recursive (10 terms): 0 1 1 2 3 5 8 13 21 34
Loop (15 terms)     : 0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
Fib(20) = 6765, recursive calls = 21891
FibMemo(50) = 12586269025`,
      explanation: `Each term is the sum of the two before it. Lines 1 and 2 end with a space because every number is printed followed by " ". The naive Fib calls itself twice per call, so Fib(20) makes 21,891 calls although only 21 different values exist. callCount is a static FIELD (class scope), so every call to Fib updates the same counter; it is reset to 0 before measuring. FibMemo stores each answer in memo[] (a default 0 means "not calculated yet"), so each value is calculated only once; Fib(50) needs long because it is larger than int.MaxValue.`,
    },
    {
      title: 'Tracing recursion and more recursive methods',
      scenario: 'Print each call and return to see the call stack in action, then try sum of digits, power, reverse string and countdown recursively.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RecursionTrace',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: traceCode,
      csharp: { files: { 'Program.cs': traceCode }, stdin: '' },
      result: `Fact(4) called
  Fact(3) called
    Fact(2) called
      Fact(1) called
      Fact(1) returns 1
    Fact(2) returns 2
  Fact(3) returns 6
Fact(4) returns 24
Result = 24
SumDigits(1234) = 10
Power(2, 10)    = 1024
Reverse(Hello)  = olleH
CountDown(3)    : 3 2 1 Go!`,
      explanation: `The indentation grows by 2 spaces per depth level. All "called" lines appear first (going down the stack), then the "returns" lines appear in reverse order (coming back up) - this is LIFO. SumDigits: 4 + SumDigits(123) = 4 + 3 + 2 + 1 + 0 = 10. Power multiplies 2 ten times. Reverse moves the first character to the end of the reversed rest: Reverse("ello") + 'H' ... = "olleH". CountDown prints before the recursive call, so the numbers come out in descending order.`,
    },
    {
      title: 'Scope: fields (global-like) vs local variables',
      scenario: 'See which variables are shared between methods, which are created fresh on each call, and how a local can hide a field.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ScopeDemo',
        'Replace Program.cs with the code',
        'Uncomment the line // Console.WriteLine(i); and look at the red squiggle and the Error List (Ctrl+\\, E): CS0103. Comment it again',
        'Press Ctrl+F5',
      ],
      code: scopeCode,
      csharp: { files: { 'Program.cs': scopeCode }, stdin: '' },
      result: `App: Student Portal
Increment: counter = 1, temp = 10
Increment: counter = 2, temp = 20
Increment: counter = 3, temp = 30
counter after 3 calls = 3
local counter = 100
field counter = 3
total of squares = 14
Big total`,
      explanation: `counter is a static field, so all three Increment calls update the same variable (1, 2, 3) and Main sees 3. temp is local - it is created new on each call and disappears afterwards. In ShowShadowing the local counter (100) hides the field; Program.counter still reaches the field (3). i and square exist only inside the for loop: total = 1 + 4 + 9 = 14. message exists only inside the if block.`,
    },
    {
      title: 'var vs dynamic',
      scenario: 'Compare compile-time type inference (var) with runtime typing (dynamic), including a runtime error that the compiler cannot catch.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it VarVsDynamic',
        'Replace Program.cs with the code',
        'Hover over each var to see the inferred type; type "d." and notice that IntelliSense shows nothing for dynamic',
        'Press Ctrl+F5',
      ],
      code: varDynamicCode,
      csharp: { files: { 'Program.cs': varDynamicCode }, stdin: '' },
      result: `count -> Int32
price -> Double
name  -> String
marks -> Int32[]
d = 10 (Int32)
d = Hello (String), Length = 5
d = True (Boolean)
x + y = 55
a + b = 12
Runtime error: string has no method Fly()`,
      explanation: `GetType().Name shows the .NET type names: int = Int32, double = Double, string = String, bool = Boolean. The var variables keep their type forever. The dynamic variable d changes from Int32 to String to Boolean, and d.Length is resolved at runtime. x + y uses the runtime types int + string, so it concatenates to "55", while a + b adds two ints. d.Fly() compiles fine but throws RuntimeBinderException when executed - exactly the kind of error var would have caught at compile time.`,
    },
  ],
  interview: [
    { q: 'What is recursion? What are its two essential parts?', a: 'A method calling itself to solve a smaller instance of the problem. It needs a base case (stops the recursion) and a recursive case (calls itself with input that moves toward the base case).', level: 'Easy' },
    { q: 'What happens if a recursive method has no base case?', a: 'It calls itself forever until the call stack is full and .NET throws StackOverflowException, which cannot be caught - the process terminates.', level: 'Easy' },
    { q: 'What is the output? static int F(int n) => n == 0 ? 0 : n + F(n - 1); Console.WriteLine(F(5));', a: '15 - it adds 5 + 4 + 3 + 2 + 1 + 0.', level: 'Medium' },
    { q: 'What is the output? static void P(int n) { if (n == 0) return; P(n - 1); Console.Write(n); } P(3);', a: '123 - the print happens AFTER the recursive call, so the deepest call (1) prints first while the stack unwinds.', level: 'Medium' },
    { q: 'Why is naive recursive Fibonacci slow? How do you fix it?', a: 'It recalculates the same subproblems many times - O(2^n) calls (Fib(20) makes 21,891 calls). Fix it with memoization (cache results), or use a simple loop: O(n).', level: 'Hard' },
    { q: 'Recursion vs iteration - which is better?', a: 'Iteration is usually faster and uses constant stack space. Recursion is clearer for naturally recursive problems (trees, folder traversal, divide and conquer) but risks stack overflow for deep inputs.', level: 'Medium' },
    { q: 'Does C# have global variables?', a: 'No. Everything must be inside a type. Public static fields/properties of a (static) class act like globals; top-level statement variables are locals of the generated Main.', level: 'Medium' },
    { q: 'What is variable scope? What error do you get when using a variable outside its scope?', a: 'The region of code where a variable is accessible: block, method or class level. Using it outside gives CS0103 "The name does not exist in the current context".', level: 'Easy' },
    { q: 'Difference between var and dynamic?', a: 'var is resolved at compile time - the type is inferred once and fixed, with full IntelliSense and type checking; only for initialized locals. dynamic is resolved at runtime - the type can change, no compile-time checks, errors appear as RuntimeBinderException; can be used for fields, parameters and return types.', level: 'Medium' },
    { q: 'What is the output? dynamic a = 10; dynamic b = "20"; Console.WriteLine(a + b);', a: '1020 - at runtime the types are int and string, so + concatenates.', level: 'Medium' },
    { q: 'Is var x = null; valid? What about var y;?', a: 'Neither. var must be initialized (CS0818) and the compiler cannot infer a type from null alone (CS0815).', level: 'Easy' },
    { q: 'Difference between dynamic and object?', a: 'Both can hold any value. With object the compiler only allows object members, so you must cast to use the real type. With dynamic the compiler allows any member and checks it at runtime.', level: 'Hard' },
    { q: 'What is the default value of a local variable vs a field?', a: 'Local variables have no default - they must be assigned before use (CS0165). Fields get default values automatically: 0 for numbers, false for bool, null for references.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Student practical program: Factorial using recursion. Read N from the user and print N! using a recursive method (5 -> 120).',
      hint: 'Base case n <= 1 returns 1; otherwise return n * Factorial(n - 1). Use long.',
      solution: `Console.Write("Enter N: ");
int n = int.Parse(Console.ReadLine() ?? "0");
Console.WriteLine($"{n}! = {Factorial(n)}");

static long Factorial(int n)
{
    if (n <= 1) return 1;
    return n * Factorial(n - 1);
}
// Input 5 -> 5! = 120`,
    },
    {
      task: 'Student practical program: Fibonacci series. Read the number of terms from the user and print the series (8 -> 0 1 1 2 3 5 8 13).',
      hint: 'A loop with two variables a and b is the most efficient; the recursive Fib(i) also works for small inputs.',
      solution: `Console.Write("How many terms? ");
int terms = int.Parse(Console.ReadLine() ?? "0");
long a = 0, b = 1;
for (int i = 0; i < terms; i++)
{
    Console.Write(a + " ");
    long next = a + b;
    a = b;
    b = next;
}
Console.WriteLine();
// Input 8 -> 0 1 1 2 3 5 8 13

// Recursive alternative:
// for (int i = 0; i < terms; i++) Console.Write(Fib(i) + " ");
// static long Fib(int n) => n <= 1 ? n : Fib(n - 1) + Fib(n - 2);`,
    },
    {
      task: 'Write a recursive method that returns the sum of the first N natural numbers and another that counts the digits of a number. Test with 10 and 98765.',
      hint: 'Sum(n) = n + Sum(n - 1), Sum(0) = 0. CountDigits(n) = 1 + CountDigits(n / 10) while n >= 10.',
      solution: `Console.WriteLine($"Sum(10) = {Sum(10)}");                      // 55
Console.WriteLine($"CountDigits(98765) = {CountDigits(98765)}");  // 5

static int Sum(int n) => n == 0 ? 0 : n + Sum(n - 1);
static int CountDigits(int n) => n < 10 ? 1 : 1 + CountDigits(n / 10);`,
    },
    {
      task: 'Write a recursive method IsPalindrome(string s) that checks the first and last characters and recurses on the middle. Test "racecar" and "dotnet".',
      hint: 'Base case: Length <= 1 is true. If s[0] != s[^1] return false; else recurse on s.Substring(1, s.Length - 2).',
      solution: `Console.WriteLine(IsPalindrome("racecar"));   // True
Console.WriteLine(IsPalindrome("dotnet"));    // False

static bool IsPalindrome(string s)
{
    if (s.Length <= 1) return true;
    if (s[0] != s[s.Length - 1]) return false;
    return IsPalindrome(s.Substring(1, s.Length - 2));
}`,
    },
    {
      task: 'Predict the output, then run it: a static field total and a method Add(int n) that does total += n and also declares a local int temp = n * 2. Call Add(5) and Add(10) and print total.',
      hint: 'Only the field keeps its value between calls.',
      solution: `class Program
{
    static int total = 0;

    static void Main()
    {
        Add(5);
        Add(10);
        Console.WriteLine($"total = {total}");
    }

    static void Add(int n)
    {
        int temp = n * 2;      // local - lost after each call
        total += n;            // field - shared
        Console.WriteLine($"temp = {temp}, total = {total}");
    }
}
// temp = 10, total = 5
// temp = 20, total = 15
// total = 15`,
    },
    {
      task: 'Show the difference between var and dynamic: declare var v = 5 and dynamic d = 5, then try to assign "five" to both. Which line fails and when?',
      hint: 'One fails at compile time, the other is allowed.',
      solution: `var v = 5;
dynamic d = 5;
// v = "five";      // compile-time error CS0029: cannot convert string to int
d = "five";         // allowed - the runtime type is now string
Console.WriteLine(d.ToUpper());   // FIVE
// d.Foo();         // compiles, but RuntimeBinderException at runtime`,
    },
  ],
  quiz: [
    {
      question: 'What is the base case in a recursive method?',
      options: ['The first call made from Main', 'The condition where the method returns without calling itself', 'The recursive call with n - 1', 'The catch block for StackOverflowException'],
      answer: 1,
      explanation: 'The base case stops the recursion by returning a known answer directly.',
    },
    {
      question: 'static int F(int n) => n <= 1 ? 1 : n * F(n - 2); What is F(6)?',
      options: ['720', '15', '48', '36'],
      answer: 2,
      explanation: 'F(6) = 6 * F(4) = 6 * 4 * F(2) = 6 * 4 * 2 * F(0) = 6 * 4 * 2 * 1 = 48.',
    },
    {
      question: 'Which statement about var is TRUE?',
      options: ['The type of a var variable is fixed at compile time', 'var can be used for class fields', 'var x = null; is valid', 'A var variable can hold an int and later a string'],
      answer: 0,
      explanation: 'var is just compile-time type inference; the inferred type never changes and var works only for initialized local variables.',
    },
    {
      question: 'A for loop declares int i inside its parentheses. What happens if you use i after the loop ends?',
      options: ['It holds the last value', 'It is reset to 0', 'A runtime exception', 'Compile error CS0103'],
      answer: 3,
      explanation: 'i has block scope - it exists only inside the loop.',
    },
    {
      question: 'dynamic d = "abc"; d.Fly(); When is the error reported?',
      options: ['At compile time', 'Never', 'At runtime (RuntimeBinderException)', 'When the project is published'],
      answer: 2,
      explanation: 'dynamic member access is resolved at runtime; string has no Fly method, so RuntimeBinderException is thrown when that line executes.',
    },
  ],
};
