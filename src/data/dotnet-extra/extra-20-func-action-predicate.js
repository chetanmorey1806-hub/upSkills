const BASICS = `using System;

// Func<inputs..., TResult> -> returns a value (last type argument = return type)
Func<int, int, int> add = (a, b) => a + b;
Func<string, int> length = s => s.Length;
Func<int> dice = () => 6;

// Action<inputs...> -> returns void
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");
Action<string, int> repeat = (text, times) =>
{
    for (int i = 0; i < times; i++) Console.Write(text);
    Console.WriteLine();
};
Action sayHi = () => Console.WriteLine("Hi!");

// Predicate<T> -> takes one T, returns bool
Predicate<int> isEven = n => n % 2 == 0;

Console.WriteLine(add(4, 6));
Console.WriteLine(length("Dotnet"));
Console.WriteLine(dice());
log("Application started");
repeat("*-", 4);
sayHi();
Console.WriteLine(isEven(10));
Console.WriteLine(isEven(7));`;

const LISTS = `using System;
using System.Collections.Generic;

var marks = new List<int> { 55, 92, 38, 76, 41, 88 };
Predicate<int> passed = m => m >= 40;
Predicate<int> distinction = m => m >= 75;

Console.WriteLine("Passed: " + string.Join(", ", marks.FindAll(passed)));
Console.WriteLine("First distinction: " + marks.Find(distinction));
Console.WriteLine("Index of first fail: " + marks.FindIndex(m => !passed(m)));
Console.WriteLine("Anyone above 90? " + marks.Exists(m => m > 90));
Console.WriteLine("All passed? " + marks.TrueForAll(passed));

int removed = marks.RemoveAll(m => !passed(m));
Console.WriteLine($"Removed {removed} failing mark(s)");

Action<int> show = m => Console.Write($"[{m}]");
marks.ForEach(show);
Console.WriteLine();`;

const CALC = `using System;
using System.Collections.Generic;

var operations = new Dictionary<string, Func<int, int, int>>
{
    ["+"] = (a, b) => a + b,
    ["-"] = (a, b) => a - b,
    ["*"] = (a, b) => a * b,
    ["/"] = (a, b) => b == 0 ? 0 : a / b,
};

string[] inputs = { "12 + 8", "20 / 4", "7 * 6", "9 % 2", "15 - 20" };
foreach (string line in inputs)
{
    string[] parts = line.Split(' ');
    int x = int.Parse(parts[0]);
    string op = parts[1];
    int y = int.Parse(parts[2]);

    if (operations.TryGetValue(op, out Func<int, int, int>? fn))
        Console.WriteLine($"{line} = {fn(x, y)}");
    else
        Console.WriteLine($"{line} -> unknown operator '{op}'");
}`;

const RETRY = `using System;

int attempts = 0;
string result = Helper.Retry(
    work: () =>
    {
        attempts++;
        Console.WriteLine($"Attempt {attempts}");
        if (attempts < 3) throw new InvalidOperationException("Server busy");
        return "Data loaded";
    },
    maxTries: 5,
    onError: msg => Console.WriteLine($"  failed: {msg}"));
Console.WriteLine(result);

Func<string, string> trim = s => s.Trim();
Func<string, string> upper = s => s.ToUpperInvariant();
Func<string, string> pipeline = s => upper(trim(s));
Console.WriteLine($"[{pipeline("  hello world  ")}]");

static class Helper
{
    // Func<T> = the work to do, Action<string> = what to do on each failure
    public static T Retry<T>(Func<T> work, int maxTries, Action<string> onError)
    {
        for (int i = 1; ; i++)
        {
            try
            {
                return work();
            }
            catch (Exception ex) when (i < maxTries)
            {
                onError(ex.Message);
            }
        }
    }
}`;

export default {
  id: 'extra-20-func-action-predicate',
  title: 'Func, Action and Predicate',
  module: 'Extra: OOP Concepts',
  extraNo: 20,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Func, Action and Predicate are ready-made generic delegate types in the System namespace, so you almost never need to declare your own delegate. Func returns a value, Action returns nothing, and Predicate<T> returns a bool for one input. This lesson explains their signatures, how they are used by List<T> and LINQ, storing them in collections (a calculator dispatch table), and passing them into methods for retry logic and pipelines.`,
  objectives: [
    'Choose correctly between Func, Action and Predicate',
    'Read signatures such as Func<int, string, bool> (last type = return type)',
    'Use Predicate with List.Find, FindAll, Exists, RemoveAll and TrueForAll; Action with ForEach',
    'Store delegates in a Dictionary to replace long switch statements',
    'Write methods that accept Func/Action parameters (higher-order methods)',
  ],
  theory: [
    {
      heading: 'Built-in generic delegates',
      content: `Before .NET 3.5 you had to declare a delegate for every signature (delegate int MathOp(int a, int b);). The framework now ships generic delegates that cover almost every case:

Real-world analogy: ready-made power plugs. Instead of designing a custom plug for every appliance (custom delegate), the house has standard sockets — 2-pin (Action), 3-pin with earth (Func) and a switch (Predicate, on/off). Any appliance with the right plug fits.`,
      points: [
        'Action — no parameters, returns void',
        'Action<T1..T16> — up to 16 parameters, returns void',
        'Func<TResult> — no parameters, returns TResult',
        'Func<T1..T16, TResult> — up to 16 parameters; the LAST type argument is always the return type',
        'Predicate<T> — one parameter, returns bool (same shape as Func<T, bool>)',
        'Other built-ins: Comparison<T>, Converter<TIn,TOut>, EventHandler<TEventArgs>',
      ],
    },
    {
      heading: 'Func – when you need a result',
      content: `Use Func whenever the code you pass must calculate and return something: a converted value, a total, a key to sort by. LINQ uses Func everywhere: Where(Func<T,bool>), Select(Func<T,TResult>), OrderBy(Func<T,TKey>), Sum(Func<T,int>).`,
      syntax: `Func<int> getYear = () => 2026;                // no input, returns int
Func<int, int> square = x => x * x;              // int -> int
Func<int, int, int> add = (a, b) => a + b;       // int, int -> int
Func<string, bool> isLong = s => s.Length > 5;   // string -> bool`,
      tip: `Read Func<int, string, bool> as "takes an int and a string, returns a bool".`,
    },
    {
      heading: 'Action – when you only need to do something',
      content: `Use Action when the delegate performs a side effect — printing, logging, saving, sending — and returns nothing. List<T>.ForEach(Action<T>), Task.Run(Action), Parallel.For and many callbacks such as onError or onProgress use Action.`,
      syntax: `Action beep = () => Console.WriteLine("Beep");
Action<string> log = m => Console.WriteLine(m);
Action<string, int> repeat = (t, n) => { for (int i = 0; i < n; i++) Console.Write(t); };`,
    },
    {
      heading: 'Predicate – a yes/no test',
      content: `Predicate<T> represents a condition on a single item. It is mainly used by List<T> and Array methods that were created before LINQ: Find, FindAll, FindIndex, FindLast, Exists, TrueForAll, RemoveAll, Array.Find. LINQ uses Func<T,bool> instead, so a Predicate variable cannot be passed directly to Where (the types are different even though the shape is the same) — but a lambda works for both.`,
      syntax: `Predicate<int> passed = m => m >= 40;
List<int> ok = marks.FindAll(passed);
bool any = marks.Exists(m => m > 90);
// marks.Where(passed);              // error: Predicate<int> is not Func<int,bool>
marks.Where(m => passed(m));         // fine`,
    },
    {
      heading: 'Func/Action as parameters and in collections',
      content: `Passing Func and Action to methods lets you write reusable "frameworks": a Retry method that receives the work (Func<T>) and an error callback (Action<string>), a Measure method, a validation pipeline. Storing delegates in a Dictionary<string, Func<...>> replaces long switch statements — adding a new operator means adding one entry. ASP.NET Core uses the same idea: app.MapGet("/", () => "Hello") takes a delegate, and services.AddSingleton(sp => new MyService()) takes a Func<IServiceProvider, T> factory.`,
      points: [
        'Prefer Func/Action over custom delegates for internal code',
        'Use a custom delegate when you need a meaningful name, ref/out/in parameters or more than 16 parameters',
        'Func/Action with the same shape are NOT convertible to each other or to custom delegates without a lambda wrapper',
      ],
    },
  ],
  examples: [
    {
      title: 'Func, Action and Predicate side by side',
      scenario: 'Create one variable of each kind and call it, to learn how the type arguments map to parameters and return values.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it FuncActionPredicate',
        'Replace Program.cs with the code',
        'Hover over Func<int, int, int> and press F12 to see its definition in System',
        'Press Ctrl+F5',
      ],
      code: BASICS,
      csharp: { files: { 'Program.cs': BASICS }, stdin: '' },
      result: `10
6
6
[LOG] Application started
*-*-*-*-
Hi!
True
False`,
      explanation: `add returns 4 + 6 = 10; length("Dotnet") = 6; dice always returns 6. log and sayHi are Actions that only print. repeat prints "*-" four times on one line and then ends the line. isEven(10) is True and isEven(7) is False.`,
    },
    {
      title: 'Predicate and Action with List<T> methods',
      scenario: 'Analyse a list of marks using the List<T> methods that take Predicate<T> and Action<T>.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PredicateList',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: LISTS,
      csharp: { files: { 'Program.cs': LISTS }, stdin: '' },
      result: `Passed: 55, 92, 76, 41, 88
First distinction: 92
Index of first fail: 2
Anyone above 90? True
All passed? False
Removed 1 failing mark(s)
[55][92][76][41][88]`,
      explanation: `FindAll returns every mark >= 40 (38 is excluded). Find returns the first match for >= 75, which is 92 (55 is too low). The first failing mark 38 is at index 2. Exists finds 92 > 90. TrueForAll is False because of 38. RemoveAll deletes 38 and returns 1. ForEach runs the Action for each remaining mark.`,
    },
    {
      title: 'Calculator dispatch table with Dictionary<string, Func>',
      scenario: 'Instead of a switch on the operator, keep each operation as a Func in a dictionary and look it up at runtime.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it FuncCalculator',
        'Replace Program.cs with the code',
        'Add ["%"] = (a, b) => a % b to the dictionary and run again – no other code changes needed',
        'Press Ctrl+F5',
      ],
      code: CALC,
      csharp: { files: { 'Program.cs': CALC }, stdin: '' },
      result: `12 + 8 = 20
20 / 4 = 5
7 * 6 = 42
9 % 2 -> unknown operator '%'
15 - 20 = -5`,
      explanation: `Each input is split into number, operator and number. TryGetValue finds the Func for the operator and calls it. "%" is not in the dictionary, so the else branch prints an error. Only key lookups are used, so dictionary ordering does not matter.`,
    },
    {
      title: 'Retry helper and function pipeline',
      scenario: 'A generic Retry method receives the work as Func<T> and an error callback as Action<string>. Then chain two Func<string,string> into a text-cleaning pipeline.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it FuncRetry',
        'Replace Program.cs with the code',
        'Change maxTries to 2 and run again – the exception is no longer caught on the 2nd failure',
        'Press Ctrl+F5',
      ],
      code: RETRY,
      csharp: { files: { 'Program.cs': RETRY }, stdin: '' },
      result: `Attempt 1
  failed: Server busy
Attempt 2
  failed: Server busy
Attempt 3
Data loaded
[HELLO WORLD]`,
      explanation: `The work lambda fails on attempts 1 and 2 (attempts < 3) and succeeds on attempt 3. The exception filter when (i < maxTries) catches failures while retries remain and calls onError. With maxTries = 2 the second failure would not match the filter and the exception would crash the program. The pipeline first trims the spaces and then upper-cases: [HELLO WORLD].`,
    },
  ],
  interview: [
    { q: 'What is the difference between Func, Action and Predicate?', a: 'Func returns a value (last type argument is the return type), Action returns void, Predicate<T> takes exactly one T and returns bool.', level: 'Easy' },
    { q: 'In Func<int, string, bool>, what is the return type?', a: 'bool. The last type argument of Func is always the return type; int and string are parameters.', level: 'Easy' },
    { q: 'How many parameters can Func and Action have?', a: 'Up to 16 input parameters (Func<T1,...,T16,TResult>, Action<T1,...,T16>).', level: 'Easy' },
    { q: 'Is Predicate<T> the same as Func<T, bool>?', a: 'Same shape but different types. A Predicate<int> variable cannot be passed where Func<int,bool> is expected (e.g. LINQ Where) without wrapping: list.Where(x => pred(x)) or new Func<int,bool>(pred).', level: 'Medium' },
    { q: 'Which List<T> methods take a Predicate<T>?', a: 'Find, FindAll, FindIndex, FindLast, FindLastIndex, Exists, TrueForAll and RemoveAll. Array.Find/FindAll/Exists also use Predicate<T>.', level: 'Medium' },
    { q: 'When would you still declare a custom delegate?', a: 'When you need ref/out/in parameters, more than 16 parameters, or a descriptive name that documents intent (e.g. in a public API or for events in older code).', level: 'Medium' },
    { q: 'Output? Func<int, int> f = x => x + 1; Func<int, int> g = x => x * 2; Console.WriteLine(g(f(3)));', a: '8. f(3) = 4, g(4) = 8.', level: 'Easy' },
    { q: 'Output? Action<int> a = n => Console.Write(n); a += n => Console.Write(n * 10); a(2);', a: '220. Both actions run: first prints 2, second prints 20.', level: 'Medium' },
    { q: 'Output? var list = new List<int> { 3, 8, 12, 5 }; Console.WriteLine(list.Find(x => x > 6) + list.FindIndex(x => x > 6));', a: '9. Find returns 8 (first > 6) and FindIndex returns 1; 8 + 1 = 9.', level: 'Medium' },
    { q: 'What does List.Find return when nothing matches?', a: 'default(T): 0 for int, null for reference types. That is why Find on List<int> cannot distinguish "not found" from a real 0 — use FindIndex (returns -1) or Exists.', level: 'Hard' },
    { q: 'Where does ASP.NET Core use Func and Action?', a: 'Minimal APIs (MapGet takes a Delegate), DI factories (AddScoped(sp => ...) is Func<IServiceProvider,T>), options configuration (services.Configure<T>(Action<T>)), middleware app.Use(Func<HttpContext, RequestDelegate, Task>).', level: 'Hard' },
    { q: 'Why use a Dictionary<string, Func<...>> instead of a switch?', a: 'Adding behaviour becomes adding data (one entry) instead of editing a growing switch, which follows the Open/Closed principle and allows registering operations at runtime.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create Func<int, int, int> max, Action<string> shout (prints upper case with "!") and Predicate<string> isEmail (contains "@"). Test each with two inputs.',
      hint: 'Math.Max, ToUpperInvariant, Contains.',
      solution: `Func<int, int, int> max = (a, b) => Math.Max(a, b);
Action<string> shout = s => Console.WriteLine(s.ToUpperInvariant() + "!");
Predicate<string> isEmail = s => s.Contains('@');
Console.WriteLine(max(4, 9));                    // 9
shout("hello");                                   // HELLO!
Console.WriteLine(isEmail("asha@mail.com"));     // True
Console.WriteLine(isEmail("asha.mail.com"));     // False`,
    },
    {
      task: 'Write a method ApplyToAll(int[] data, Func<int,int> rule) that returns a new array. Use it to add 5 grace marks, then to cap marks at 100.',
      hint: 'Loop and store rule(data[i]) in a new array.',
      solution: `static int[] ApplyToAll(int[] data, Func<int, int> rule)
{
    var result = new int[data.Length];
    for (int i = 0; i < data.Length; i++) result[i] = rule(data[i]);
    return result;
}

int[] marks = { 35, 97, 60 };
var grace = ApplyToAll(marks, m => m + 5);          // 40, 102, 65
var capped = ApplyToAll(grace, m => Math.Min(m, 100)); // 40, 100, 65
Console.WriteLine(string.Join(", ", capped));`,
    },
    {
      task: 'Make a validation list: List<(string Message, Predicate<string> Rule)> for a password (length >= 8, contains a digit, contains an upper-case letter). Print every failed rule for "secret1".',
      hint: 'Use char.IsDigit and char.IsUpper with Any or a loop.',
      solution: `var rules = new List<(string Message, Predicate<string> Rule)>
{
    ("At least 8 characters", p => p.Length >= 8),
    ("Must contain a digit", p => p.Any(char.IsDigit)),
    ("Must contain an upper-case letter", p => p.Any(char.IsUpper)),
};
foreach (var (message, rule) in rules)
    if (!rule("secret1")) Console.WriteLine(message);
// At least 8 characters
// Must contain an upper-case letter`,
    },
    {
      task: 'Write Measure(string name, Action work) that prints "name started" and "name finished" around the work, and use it for two different tasks.',
      hint: 'Call work() between the two prints.',
      solution: `static void Measure(string name, Action work)
{
    Console.WriteLine($"{name} started");
    work();
    Console.WriteLine($"{name} finished");
}

Measure("Backup", () => Console.WriteLine("Copying files..."));
Measure("Email", () => Console.WriteLine("Sending 3 emails..."));`,
    },
  ],
  quiz: [
    {
      question: 'Which delegate type fits a method void Save(string data)?',
      options: ['Func<string>', 'Action<string>', 'Predicate<string>', 'Func<string, void>'],
      answer: 1,
      explanation: 'Action is for methods returning void; Func<string, void> is not valid C#.',
    },
    {
      question: 'Func<double, int, string> represents a method that...',
      options: ['takes double, int and returns string', 'takes string and returns double, int', 'takes double and returns int, string', 'returns void'],
      answer: 0,
      explanation: 'The last type argument is the return type.',
    },
    {
      question: 'Which List<T> method takes a Predicate<T> and returns the number of removed items?',
      options: ['Remove', 'FindAll', 'Clear', 'RemoveAll'],
      answer: 3,
      explanation: 'RemoveAll(Predicate<T>) removes all matches and returns the count.',
    },
    {
      question: 'Predicate<int> p = x => x > 0; Which line compiles?',
      options: ['list.Where(p)', 'Func<int,bool> f = p;', 'list.FindAll(p)', 'Action<int> a = p;'],
      answer: 2,
      explanation: 'FindAll expects a Predicate<int>. Predicate and Func are different types, so the other lines do not compile.',
    },
    {
      question: 'var list = new List<int> { 4, 7, 10 }; What is list.Find(x => x > 20)?',
      options: ['null', '-1', 'An exception', '0'],
      answer: 3,
      explanation: 'Find returns default(T) when nothing matches; default(int) is 0.',
    },
  ],
};
