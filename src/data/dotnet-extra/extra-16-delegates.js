const BASIC = `using System;

MathOp op = Add;                                   // method group conversion
Console.WriteLine($"Add: {op(10, 5)}");

op = Subtract;
Console.WriteLine($"Subtract: {op.Invoke(10, 5)}"); // Invoke is the same as op(...)

op = new MathOp(Calculator.Multiply);             // old explicit syntax, static method
Console.WriteLine($"Multiply: {op(10, 5)}");

var calc = new Calculator(3);
op = calc.Scale;                                  // instance method: delegate remembers the object
Console.WriteLine($"Scale: {op(10, 5)}");
Console.WriteLine($"Target method: {op.Method.Name}");

static int Add(int a, int b) => a + b;
static int Subtract(int a, int b) => a - b;

delegate int MathOp(int a, int b);                // the delegate TYPE (method signature)

class Calculator
{
    private readonly int factor;
    public Calculator(int factor) => this.factor = factor;

    public static int Multiply(int a, int b) => a * b;
    public int Scale(int a, int b) => (a + b) * factor;
}`;

const CALLBACK = `using System;
using System.Collections.Generic;

int[] marks = { 45, 82, 67, 30, 91 };

Report.Print("Passed", marks, IsPass);                                   // named method
Report.Print("Distinction", marks, m => m >= 75);                        // lambda
Report.Print("Even marks", marks, delegate (int m) { return m % 2 == 0; }); // anonymous method

static bool IsPass(int m) => m >= 40;

delegate bool MarkFilter(int mark);

static class Report
{
    public static void Print(string title, int[] data, MarkFilter filter)
    {
        var picked = new List<int>();
        foreach (int m in data)
            if (filter(m)) picked.Add(m);          // calls back into the caller's logic
        Console.WriteLine($"{title}: {string.Join(", ", picked)}");
    }
}`;

const PROGRESS = `using System;

var downloader = new FileDownloader();
downloader.Download("report.pdf");        // no callback attached -> nothing printed for progress

downloader.OnProgress = ShowProgress;
downloader.Download("video.mp4");

static void ShowProgress(string file, int percent) =>
    Console.WriteLine($"  {file}: {percent}%");

delegate void ProgressCallback(string file, int percent);

class FileDownloader
{
    public ProgressCallback? OnProgress;   // a delegate field (may be null)

    public void Download(string file)
    {
        Console.WriteLine($"Downloading {file}");
        for (int p = 0; p <= 100; p += 50)
            OnProgress?.Invoke(file, p);     // null-safe call
        Console.WriteLine($"Done {file}");
    }
}`;

const SORT = `using System;

var emps = new[]
{
    new Employee("Ravi", 52000),
    new Employee("Asha", 61000),
    new Employee("Neha", 45000),
};

Sorter.Sort(emps, (a, b) => a.Salary.CompareTo(b.Salary));
Console.WriteLine("By salary: " + string.Join(", ", Array.ConvertAll(emps, e => e.Name)));

Sorter.Sort(emps, (a, b) => string.CompareOrdinal(a.Name, b.Name));
Console.WriteLine("By name: " + string.Join(", ", Array.ConvertAll(emps, e => e.Name)));

Sorter.Sort(emps, (a, b) => b.Salary.CompareTo(a.Salary));
Console.WriteLine("Highest paid first: " + string.Join(", ", Array.ConvertAll(emps, e => e.Name)));

delegate int Compare<T>(T first, T second);      // a GENERIC delegate type

record Employee(string Name, int Salary);

static class Sorter
{
    // Bubble sort that does not know HOW to compare – the caller decides
    public static void Sort<T>(T[] arr, Compare<T> cmp)
    {
        for (int i = 0; i < arr.Length - 1; i++)
            for (int j = 0; j < arr.Length - 1 - i; j++)
                if (cmp(arr[j], arr[j + 1]) > 0)
                    (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
    }
}`;

export default {
  id: 'extra-16-delegates',
  title: 'Delegates',
  module: 'Extra: OOP Concepts',
  extraNo: 16,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `A delegate is a type-safe reference to a method — a variable that stores "which method to call". Delegates let you pass behaviour as a parameter (callbacks), choose a method at runtime, and they are the foundation of events, lambdas, LINQ, Func/Action and async callbacks. This lesson covers declaring, instantiating and invoking delegates, static vs instance targets, callbacks, anonymous methods, generic delegates and null-safe invocation.`,
  objectives: [
    'Declare a delegate type and point it to static and instance methods',
    'Invoke delegates with () and Invoke, and safely with ?.Invoke',
    'Pass a delegate into a method as a callback',
    'Use anonymous methods, lambdas and generic delegates',
    'Explain how delegates relate to events, Func/Action and LINQ',
  ],
  theory: [
    {
      heading: 'What is a delegate?',
      content: `A delegate is a class type (it derives from System.MulticastDelegate) whose objects hold a reference to one or more methods with a specific signature. Think of it as a "function pointer" that is type-safe: the compiler checks that the method's parameters and return type match.

Real-world analogy: a TV remote. The remote (delegate) does not know how the TV works internally; it just knows the "button signature". You can pair it with any compatible TV (method) and press the button (invoke) later.`,
      syntax: `// 1. Declare the delegate type (usually at namespace level)
delegate int MathOp(int a, int b);

// 2. Create an instance pointing to a compatible method
MathOp op = Add;                 // or new MathOp(Add)

// 3. Invoke it
int result = op(10, 5);          // or op.Invoke(10, 5)`,
      points: [
        'Declaring a delegate = declaring a new TYPE that describes a method signature',
        'Any method (static or instance) with the same parameter types and return type can be assigned',
        'Method names do not need to match; only the signature matters',
        'Delegates are reference types and are immutable',
      ],
    },
    {
      heading: 'Static vs instance methods as targets',
      content: `When a delegate points to a static method, its Target property is null. When it points to an instance method (calc.Scale), the delegate stores BOTH the object (Target) and the method (Method). Calling the delegate later uses that same object, so it can read the object's fields. This is also why a delegate can keep an object alive (the garbage collector sees the reference).`,
      syntax: `var calc = new Calculator(3);
MathOp op = calc.Scale;
Console.WriteLine(op.Target == calc);   // True
Console.WriteLine(op.Method.Name);      // Scale`,
    },
    {
      heading: 'Callbacks – passing methods as parameters',
      content: `The biggest use of delegates: a method receives a delegate parameter and calls it when needed. The method provides the "framework" (looping, sorting, downloading) and the caller provides the "decision" (which marks to keep, how to compare, what to do on progress). This makes code reusable and is exactly how List.Sort(Comparison<T>), List.FindAll(Predicate<T>) and LINQ's Where(Func<T,bool>) work.`,
      syntax: `static void Print(int[] data, MarkFilter filter)
{
    foreach (int m in data)
        if (filter(m)) Console.WriteLine(m);
}

Print(marks, m => m >= 75);`,
    },
    {
      heading: 'Ways to create a delegate instance',
      content: `C# has evolved several syntaxes that all create the same kind of delegate object:`,
      points: [
        'C# 1: new MathOp(Add)',
        'C# 2: method group conversion — MathOp op = Add;',
        'C# 2: anonymous method — MathOp op = delegate (int a, int b) { return a + b; };',
        'C# 3+: lambda expression — MathOp op = (a, b) => a + b;',
        'C# 10+: lambdas and method groups have a "natural type", so var f = (int a, int b) => a + b; becomes Func<int,int,int>',
      ],
      tip: `Prefer lambdas for short inline logic and named methods for logic that is reused or long. Anonymous methods (delegate keyword) are rarely written today but you will see them in old code.`,
    },
    {
      heading: 'Null delegates, generic delegates and built-in delegates',
      content: `A delegate variable with no method is null; calling it throws NullReferenceException. Use handler?.Invoke(args) to call it only if it is not null.

Delegates can be generic: delegate int Compare<T>(T a, T b); The .NET library already defines generic delegates for almost every need — Func<...> (returns a value), Action<...> (returns void), Predicate<T> (returns bool), Comparison<T>, Converter<TIn,TOut>, EventHandler<TEventArgs> — so in modern code you rarely declare your own (see the Func, Action and Predicate lesson). Custom delegates are still useful for self-documenting names and ref/out parameters.`,
      syntax: `ProgressCallback? callback = null;
callback?.Invoke("file.txt", 50);    // safe: does nothing when null`,
    },
  ],
  examples: [
    {
      title: 'Declare, assign and invoke a delegate',
      scenario: 'One MathOp delegate variable is pointed at different methods (local, static, instance) at runtime — like a calculator whose operation button is reprogrammed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DelegateBasics',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on op = calc.Scale; press F5 and use F11 to step INTO the delegate call',
        'Press Ctrl+F5 for the normal run',
      ],
      code: BASIC,
      csharp: { files: { 'Program.cs': BASIC }, stdin: '' },
      result: `Add: 15
Subtract: 5
Multiply: 50
Scale: 45
Target method: Scale`,
      explanation: `MathOp describes any method taking two ints and returning an int. Add (10+5=15), Subtract (10-5=5) and Calculator.Multiply (10*5=50) all match. calc.Scale is an instance method: the delegate remembers calc with factor 3, so (10+5)*3 = 45. op.Method.Name returns the name of the target method.`,
    },
    {
      title: 'Callback – filter student marks',
      scenario: 'A Report.Print method loops over marks but lets the caller decide which marks to include, using a named method, a lambda and an anonymous method.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DelegateCallback',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: CALLBACK,
      csharp: { files: { 'Program.cs': CALLBACK }, stdin: '' },
      result: `Passed: 45, 82, 67, 91
Distinction: 82, 91
Even marks: 82, 30`,
      explanation: `Report.Print does not contain any filtering rule; it calls filter(m) for each mark. IsPass keeps marks >= 40 (30 is dropped). The lambda keeps >= 75. The anonymous method keeps even numbers (82 and 30). Three different behaviours, one reusable method.`,
    },
    {
      title: 'Delegate field with null-safe invocation – download progress',
      scenario: 'A FileDownloader reports progress through an optional delegate. If nobody attached a callback, it must not crash.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DelegateProgress',
        'Replace Program.cs with the code',
        'Change OnProgress?.Invoke to OnProgress(file, p) and run to see the NullReferenceException, then undo',
        'Press Ctrl+F5',
      ],
      code: PROGRESS,
      csharp: { files: { 'Program.cs': PROGRESS }, stdin: '' },
      result: `Downloading report.pdf
Done report.pdf
Downloading video.mp4
  video.mp4: 0%
  video.mp4: 50%
  video.mp4: 100%
Done video.mp4`,
      explanation: `For report.pdf OnProgress is null, so ?.Invoke skips the call and only the start/done lines print. After assigning ShowProgress, the loop (p = 0, 50, 100) calls it three times. This "optional callback" style is the idea behind events (next lessons), which add protection so outsiders cannot overwrite or invoke the delegate.`,
    },
    {
      title: 'Generic delegate – one sort method, many orderings',
      scenario: 'Sort employees by salary, by name and by salary descending using a single bubble-sort method that receives the comparison rule as a generic delegate.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DelegateSort',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: SORT,
      csharp: { files: { 'Program.cs': SORT }, stdin: '' },
      result: `By salary: Neha, Ravi, Asha
By name: Asha, Neha, Ravi
Highest paid first: Asha, Ravi, Neha`,
      explanation: `Compare<T> returns a negative, zero or positive number (the usual CompareTo contract). Sorter.Sort swaps neighbours whenever cmp returns > 0. Salaries 45000 < 52000 < 61000 give Neha, Ravi, Asha; ordinal name order gives Asha, Neha, Ravi; reversing the comparison (b vs a) gives highest first. The .NET built-in equivalent is Array.Sort(arr, Comparison<T>).`,
    },
  ],
  interview: [
    { q: 'What is a delegate in C#?', a: 'A type-safe reference type that holds a reference to one or more methods with a matching signature. It lets you store, pass and invoke methods like data.', level: 'Easy' },
    { q: 'How is a delegate different from a C++ function pointer?', a: 'Delegates are type-safe (signature checked at compile time), object-oriented (can hold the target object for instance methods), can be multicast (several methods) and are managed by the CLR/GC.', level: 'Medium' },
    { q: 'What are the steps to use a delegate?', a: '1) Declare the delegate type, 2) create an instance pointing to a compatible method, 3) invoke it with del(args) or del.Invoke(args).', level: 'Easy' },
    { q: 'What base class do all delegates derive from?', a: 'System.MulticastDelegate, which derives from System.Delegate. You cannot derive from them yourself; the compiler generates the class from the delegate declaration.', level: 'Medium' },
    { q: 'What do the Target and Method properties of a delegate contain?', a: 'Method is the MethodInfo of the method to call; Target is the object instance for instance methods, or null for static methods.', level: 'Medium' },
    { q: 'What happens if you invoke a null delegate?', a: 'A NullReferenceException is thrown. Use del?.Invoke(args) to call it only when it is not null.', level: 'Easy' },
    { q: 'What is a callback?', a: 'A method passed to another method (via a delegate) to be called later, e.g. a progress callback, a comparison for sorting or a filter for searching.', level: 'Easy' },
    { q: 'What is an anonymous method?', a: 'An unnamed inline method created with the delegate keyword: MathOp op = delegate (int a, int b) { return a + b; }; Lambdas (C# 3) replaced them in most code.', level: 'Easy' },
    { q: 'Output? delegate int D(int x); D d = x => x * 2; d = x => x + 100; Console.WriteLine(d(5));', a: '105. Using = replaces the previous method, so only x + 100 runs.', level: 'Medium' },
    { q: 'Output? Func<int,int> f = null; Console.WriteLine(f?.Invoke(3) ?? -1);', a: '-1. f is null so ?.Invoke returns null (int?), and ?? supplies -1.', level: 'Medium' },
    { q: 'Can a delegate point to a method with a different parameter name?', a: 'Yes. Only parameter types, ref/out modifiers and return type must be compatible; names do not matter. Variance also allows a method returning a more derived type or taking a less derived parameter.', level: 'Hard' },
    { q: 'Where are delegates used in .NET?', a: 'Events, LINQ (Func), List.Sort/FindAll, Task.Run(Action), ASP.NET Core middleware (RequestDelegate), minimal API handlers, DI factories, and callbacks for timers/threads.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Declare delegate string Formatter(string name). Write three methods: Upper, Lower and Greeting ("Hello, name"). Store them in an array of Formatter and call each on "Asha".',
      hint: 'An array of delegates is just Formatter[] list = { Upper, Lower, Greeting };',
      solution: `Formatter[] list = { Upper, Lower, Greeting };
foreach (var f in list) Console.WriteLine(f("Asha"));
// ASHA / asha / Hello, Asha

static string Upper(string n) => n.ToUpperInvariant();
static string Lower(string n) => n.ToLowerInvariant();
static string Greeting(string n) => $"Hello, {n}";

delegate string Formatter(string name);`,
    },
    {
      task: 'Write a method Calculate(int a, int b, MathOp op) and call it with add, multiply and power (Math.Pow cast to int) using lambdas.',
      hint: 'delegate int MathOp(int a, int b);',
      solution: `Console.WriteLine(Calculate(4, 3, (a, b) => a + b));            // 7
Console.WriteLine(Calculate(4, 3, (a, b) => a * b));            // 12
Console.WriteLine(Calculate(4, 3, (a, b) => (int)Math.Pow(a, b))); // 64

static int Calculate(int a, int b, MathOp op) => op(a, b);
delegate int MathOp(int a, int b);`,
    },
    {
      task: 'Create a Timer-like class Countdown with a delegate field OnTick (int secondsLeft) and OnFinish (no parameters). Run from 3 to 1, then call OnFinish.',
      hint: 'Use two custom delegate types or Action<int>/Action; call them with ?.Invoke.',
      solution: `var c = new Countdown();
c.OnTick = s => Console.WriteLine($"{s}...");
c.OnFinish = () => Console.WriteLine("Go!");
c.Start(3);   // 3... 2... 1... Go!

class Countdown
{
    public Action<int>? OnTick;
    public Action? OnFinish;
    public void Start(int from)
    {
        for (int s = from; s >= 1; s--) OnTick?.Invoke(s);
        OnFinish?.Invoke();
    }
}`,
    },
    {
      task: 'Use a delegate to choose a tax rule at runtime: GST (18%), Exempt (0%) and Luxury (28%). Ask the user for a rule name and amount, then print the tax.',
      hint: 'Use a switch expression that returns the delegate.',
      solution: `string rule = Console.ReadLine() ?? "GST";
int amount = int.Parse(Console.ReadLine() ?? "0");
TaxRule tax = rule switch
{
    "Exempt" => a => 0,
    "Luxury" => a => a * 28 / 100,
    _ => a => a * 18 / 100,
};
Console.WriteLine($"Tax: {tax(amount)}");   // GST, 1000 -> Tax: 180

delegate int TaxRule(int amount);`,
    },
  ],
  quiz: [
    {
      question: 'Which declaration creates a delegate TYPE?',
      options: ['delegate int MathOp(int a, int b);', 'MathOp op = Add;', 'op(2, 3);', 'event MathOp Changed;'],
      answer: 0,
      explanation: 'The delegate keyword followed by a signature declares a new delegate type.',
    },
    {
      question: 'For a delegate pointing to a STATIC method, what is its Target property?',
      options: ['The class Type', 'null', 'The method name', 'An empty object'],
      answer: 1,
      explanation: 'Static methods have no instance, so Target is null.',
    },
    {
      question: 'How do you safely call a delegate that might be null?',
      options: ['del!()', 'del.Call()', 'del?.Invoke()', 'if (del) del()'],
      answer: 2,
      explanation: 'The null-conditional operator skips the call when del is null.',
    },
    {
      question: 'D d = x => x * 2; d = x => x + 1; What does d(10) return?',
      options: ['20', '21', '22', '11'],
      answer: 3,
      explanation: 'Assignment with = replaces the delegate; only x + 1 runs.',
    },
    {
      question: 'Which feature is built directly on top of delegates?',
      options: ['Properties', 'Events', 'Indexers', 'Namespaces'],
      answer: 1,
      explanation: 'An event is a protected wrapper around a delegate field.',
    },
  ],
};
