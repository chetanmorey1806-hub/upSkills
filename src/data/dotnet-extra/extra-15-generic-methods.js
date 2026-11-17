const SWAP = `using System;

int a = 10, b = 20;
Utils.Swap(ref a, ref b);                 // T inferred as int
Console.WriteLine($"a={a}, b={b}");

string x = "Left", y = "Right";
Utils.Swap<string>(ref x, ref y);         // T written explicitly
Console.WriteLine($"x={x}, y={y}");

Utils.ShowType(5);
Utils.ShowType("hi");
Utils.ShowType('A');
Utils.ShowType(true);

static class Utils
{
    public static void Swap<T>(ref T first, ref T second)
    {
        T temp = first;
        first = second;
        second = temp;
    }

    public static void ShowType<T>(T value) =>
        Console.WriteLine($"{value} is {typeof(T).Name}");
}`;

const MAX = `using System;

Console.WriteLine(MathHelper.Max(7, 12));
Console.WriteLine(MathHelper.Max("apple", "mango"));
Console.WriteLine(MathHelper.Largest(new[] { 45, 89, 12, 77 }));
Console.WriteLine(MathHelper.Largest(new[] { "Ravi", "Asha", "Zoya", "Neha" }));
Console.WriteLine(MathHelper.Largest(new[]
{
    new Student("Asha", 81),
    new Student("Ravi", 93),
    new Student("Neha", 88),
}));

static class MathHelper
{
    // T must know how to compare itself with another T
    public static T Max<T>(T a, T b) where T : IComparable<T> =>
        a.CompareTo(b) >= 0 ? a : b;

    public static T Largest<T>(T[] items) where T : IComparable<T>
    {
        if (items.Length == 0) throw new ArgumentException("Empty array");
        T best = items[0];
        foreach (T item in items)
            if (item.CompareTo(best) > 0) best = item;
        return best;
    }
}

record Student(string Name, int Marks) : IComparable<Student>
{
    public int CompareTo(Student? other) => Marks.CompareTo(other?.Marks ?? 0);
}`;

const MAP = `using System;
using System.Collections.Generic;

var marks = new List<int> { 35, 72, 90, 48 };

List<string> grades = ListHelper.Map(marks, m => m >= 50 ? "Pass" : "Fail");   // TIn=int, TOut=string
Console.WriteLine(string.Join(", ", grades));

List<int> high = ListHelper.Filter(marks, m => m > 60);
Console.WriteLine(string.Join(", ", high));

var names = new List<string> { "asha", "ravi" };
var upper = ListHelper.Map<string, string>(names, n => n.ToUpperInvariant());
Console.WriteLine(string.Join(" | ", upper));

Console.WriteLine(ListHelper.FirstOrFallback(new List<string>(), "none"));
Console.WriteLine(ListHelper.FirstOrFallback(marks, -1));
Console.WriteLine($"[{ListHelper.DefaultOf<int>()}] [{ListHelper.DefaultOf<string>()}] [{ListHelper.DefaultOf<bool>()}]");

static class ListHelper
{
    public static List<TOut> Map<TIn, TOut>(List<TIn> source, Func<TIn, TOut> convert)
    {
        var result = new List<TOut>();
        foreach (TIn item in source)
            result.Add(convert(item));
        return result;
    }

    public static List<T> Filter<T>(List<T> source, Func<T, bool> keep)
    {
        var result = new List<T>();
        foreach (T item in source)
            if (keep(item)) result.Add(item);
        return result;
    }

    public static T FirstOrFallback<T>(List<T> source, T fallback) =>
        source.Count > 0 ? source[0] : fallback;

    public static T? DefaultOf<T>() => default;
}`;

const OVERLOAD = `using System;

Printer.Show(10);          // exact non-generic match wins
Printer.Show("text");      // only the generic version fits
Printer.Show<int>(10);     // explicitly asked for the generic version
Printer.Show(10L);         // long -> generic with T = long

Logger log = Maker.CreateAndInit<Logger>(l => l.Name = "FileLogger");
Console.WriteLine($"Created logger: {log.Name}");

static class Printer
{
    public static void Show(int value) => Console.WriteLine($"Non-generic int: {value}");
    public static void Show<T>(T value) => Console.WriteLine($"Generic<{typeof(T).Name}>: {value}");
}

static class Maker
{
    public static T CreateAndInit<T>(Action<T> init) where T : new()
    {
        var obj = new T();
        init(obj);
        return obj;
    }
}

class Logger
{
    public string Name { get; set; } = "Default";
}`;

export default {
  id: 'extra-15-generic-methods',
  title: 'Generic Methods',
  module: 'Extra: OOP Concepts',
  extraNo: 15,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `A generic method has its own type parameter list, Swap<T>(ref T a, ref T b), so one method works for any type while staying type-safe. The method can live in a normal (non-generic) class. This lesson covers declaring generic methods, type inference, constraints on methods, multiple type parameters with Func, default(T), and how overload resolution chooses between generic and non-generic methods.`,
  objectives: [
    'Declare and call generic methods with explicit and inferred type arguments',
    'Apply constraints such as IComparable<T> and new() on methods',
    'Write generic helper methods that take Func delegates (Map, Filter)',
    'Predict which overload is chosen when generic and non-generic methods compete',
  ],
  theory: [
    {
      heading: 'What is a generic method?',
      content: `A generic method declares type parameters right after its name. The type parameter is available in the parameter list, return type and body. The containing class does NOT need to be generic — utility classes like Array, Enumerable and Math helpers are full of generic methods (Array.Resize<T>, Enumerable.Where<TSource>, Array.Empty<T>).

Real-world analogy: a courier "swap" service. It can exchange two parcels of any kind — documents, phones, books — as long as both parcels are the same kind. The service (method) is written once; the parcel type is decided per call.`,
      syntax: `static void Swap<T>(ref T a, ref T b)
{
    T temp = a; a = b; b = temp;
}

Swap<int>(ref x, ref y);   // explicit type argument
Swap(ref x, ref y);        // type inference (most common)`,
    },
    {
      heading: 'Type inference',
      content: `The compiler usually infers T from the arguments, so you rarely write <int>. Inference uses ONLY the arguments, never the return type. If a type parameter appears only in the return type (T Create<T>()) you must write it explicitly: Create<Student>().

Inference fails when arguments disagree (Max(5, "x")) or when you pass null/lambda without enough information. In those cases specify the type arguments explicitly.`,
      points: [
        'Max(3, 7) → T = int',
        'Max(3, 7L) → T = long (int converts to long)',
        'DefaultOf<string>() → must be explicit, no arguments to infer from',
        'Map(marks, m => m.ToString()) → TIn = int from the list, TOut = string from the lambda body',
      ],
    },
    {
      heading: 'Constraints on generic methods',
      content: `Methods accept the same constraints as classes, written after the parameter list and before the body: where T : IComparable<T>, class, struct, new(), base class, interface, notnull. A constraint unlocks the members you need — for example CompareTo for finding a maximum, or new T() for a factory method.`,
      syntax: `public static T Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;

public static T Create<T>() where T : new() => new T();`,
      tip: `If the containing class is generic too, give the method a DIFFERENT parameter name (class Repo<T> { void Map<TOut>() }) — reusing T causes warning CS0693 and confusion.`,
    },
    {
      heading: 'Multiple type parameters and delegates',
      content: `A method can have several type parameters, for example Map<TIn, TOut>(List<TIn> source, Func<TIn, TOut> convert). Combining generics with Func/Action/Predicate is how LINQ is built: Select<TSource, TResult>, Where<TSource>, OrderBy<TSource, TKey>. Writing your own Map/Filter is the best way to understand LINQ.`,
      syntax: `public static List<TOut> Map<TIn, TOut>(List<TIn> source, Func<TIn, TOut> convert) { ... }`,
    },
    {
      heading: 'Overload resolution and default values',
      content: `If both Show(int) and Show<T>(T) exist, calling Show(10) picks the NON-generic method because it is an exact match and C# prefers non-generic over generic when both are equally good. Show("text") can only use the generic version. Show<int>(10) forces the generic one.

default inside a generic method returns null, 0, false etc. depending on T. Returning T? from an unconstrained method means "maybe default" — for value types T? is still T (not Nullable<T>) unless T is constrained to struct.`,
      points: [
        'Non-generic exact match beats generic',
        'Explicit type arguments force the generic method',
        'Generic methods cannot be overloaded only by constraints',
        'Generic methods can be virtual, abstract, static, extension methods and async',
      ],
    },
  ],
  examples: [
    {
      title: 'Generic Swap and type inference',
      scenario: 'Write one Swap method that exchanges two variables of any type, and a ShowType method that prints which T the compiler inferred.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericMethods',
        'Replace Program.cs with the code',
        'Hover over Utils.Swap in the first call – the tooltip shows Swap<int>',
        'Press Ctrl+F5',
      ],
      code: SWAP,
      csharp: { files: { 'Program.cs': SWAP }, stdin: '' },
      result: `a=20, b=10
x=Right, y=Left
5 is Int32
hi is String
A is Char
True is Boolean`,
      explanation: `Swap<T> uses ref parameters so the caller's variables really change. In the first call T is inferred as int from the arguments; in the second it is given explicitly. ShowType prints the CLR type name of T: int → Int32, string → String, char → Char, bool → Boolean (and true prints as True).`,
    },
    {
      title: 'Max and Largest with IComparable<T>',
      scenario: 'Find the larger of two values and the largest item of an array for ints, strings and a custom Student type (compared by marks).',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericMax',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: MAX,
      csharp: { files: { 'Program.cs': MAX }, stdin: '' },
      result: `12
mango
89
Zoya
Student { Name = Ravi, Marks = 93 }`,
      explanation: `The constraint where T : IComparable<T> lets the method call CompareTo. int and string already implement it ("mango" sorts after "apple", "Zoya" after the other names). Student implements IComparable<Student> by comparing Marks, so Ravi (93) wins. A record's built-in ToString prints Student { Name = Ravi, Marks = 93 }.`,
    },
    {
      title: 'Map and Filter – building mini LINQ with generics',
      scenario: 'Convert a list of marks into Pass/Fail strings, filter high marks, upper-case names, and use default(T) safely.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MiniLinq',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: MAP,
      csharp: { files: { 'Program.cs': MAP }, stdin: '' },
      result: `Fail, Pass, Pass, Fail
72, 90
ASHA | RAVI
none
35
[0] [] [False]`,
      explanation: `Map<TIn, TOut> infers TIn = int from the list and TOut = string from the lambda result. Filter keeps marks above 60 (72, 90). FirstOrFallback returns the fallback "none" for an empty list and 35 (the first mark) otherwise. DefaultOf<T>() must be called with explicit type arguments because there are no parameters to infer from: default(int) = 0, default(string) = null (prints as empty), default(bool) = False.`,
    },
    {
      title: 'Generic vs non-generic overloads and a generic factory',
      scenario: 'See which method C# chooses when both Show(int) and Show<T>(T) exist, and create objects of any type with a new() constraint.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericOverloads',
        'Replace Program.cs with the code',
        'Press F12 on each Printer.Show call to see which overload it navigates to',
        'Press Ctrl+F5',
      ],
      code: OVERLOAD,
      csharp: { files: { 'Program.cs': OVERLOAD }, stdin: '' },
      result: `Non-generic int: 10
Generic<String>: text
Generic<Int32>: 10
Generic<Int64>: 10
Created logger: FileLogger`,
      explanation: `Show(10) matches both methods equally well, so the non-generic one wins (tie-break rule). "text" only fits the generic one. Show<int>(10) explicitly selects the generic method. 10L is a long: Show(int) is not applicable (no implicit long → int conversion), so Show<long> is used. CreateAndInit<T> needs new() to call new T() and then runs the Action to initialise the object.`,
    },
  ],
  interview: [
    { q: 'What is a generic method?', a: 'A method with its own type parameters, e.g. T Max<T>(T a, T b). It can be declared in a generic or non-generic class and works with any type that satisfies its constraints.', level: 'Easy' },
    { q: 'Can a non-generic class contain generic methods?', a: 'Yes. For example static class Utils { public static void Swap<T>(ref T a, ref T b) }. System.Array and System.Linq.Enumerable are non-generic classes full of generic methods.', level: 'Easy' },
    { q: 'What is type inference in generic methods?', a: 'The compiler figures out the type arguments from the method arguments, so Swap(ref a, ref b) is enough instead of Swap<int>(ref a, ref b).', level: 'Easy' },
    { q: 'When does type inference fail?', a: 'When the type parameter is used only in the return type (Create<T>()), when arguments conflict, or when arguments carry no type information (null, some lambdas). Then you specify the type arguments explicitly.', level: 'Medium' },
    { q: 'Why does Max<T>(T a, T b) need where T : IComparable<T>?', a: 'Without the constraint T could be any type and the compiler cannot allow a.CompareTo(b) or a > b. The constraint guarantees CompareTo exists.', level: 'Medium' },
    { q: 'Output? static void M(int x) => Console.Write("A"); static void M<T>(T x) => Console.Write("B"); M(5); M("5"); M<int>(5);', a: 'ABB. M(5) chooses the non-generic exact match, M("5") only fits the generic one, M<int>(5) explicitly calls the generic one.', level: 'Hard' },
    { q: 'Output? static T First<T>(T[] arr) => arr.Length > 0 ? arr[0] : default!; Console.WriteLine(First(new int[0]));', a: '0 — the array is empty so default(int) is returned.', level: 'Medium' },
    { q: 'What is warning CS0693?', a: 'A method type parameter has the same name as the containing class type parameter (class Box<T> { void M<T>() }). The inner T hides the outer one; rename it (TOut, TOther).', level: 'Hard' },
    { q: 'Can generic methods be extension methods?', a: 'Yes. LINQ is built from generic extension methods such as public static IEnumerable<TSource> Where<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate).', level: 'Medium' },
    { q: 'Generic method vs generic class – when do you use which?', a: 'Use a generic class when the type must be remembered across members/state (List<T> stores items of T). Use a generic method when only one operation needs to be type-flexible (Swap, Max, Map).', level: 'Medium' },
    { q: 'Can you overload methods only by different constraints?', a: 'No. M<T>(T x) where T : class and M<T>(T x) where T : struct have the same signature; constraints are not part of the signature (CS0111).', level: 'Hard' },
    { q: 'Output? Console.WriteLine(Equals<int>(3, 3)); with static bool Equals<T>(T a, T b) => EqualityComparer<T>.Default.Equals(a, b);', a: 'True. EqualityComparer<T>.Default is the safe way to compare T values inside generic code.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a generic method PrintArray<T>(T[] items) that prints all items on one line separated by " - ". Test with int[], string[] and char[].',
      hint: 'string.Join works with any IEnumerable<T>.',
      solution: `static void PrintArray<T>(T[] items) => Console.WriteLine(string.Join(" - ", items));

PrintArray(new[] { 1, 2, 3 });        // 1 - 2 - 3
PrintArray(new[] { "C#", "SQL" });    // C# - SQL
PrintArray(new[] { 'a', 'b' });       // a - b`,
    },
    {
      task: 'Write CountIf<T>(List<T> list, Predicate<T> condition) that returns how many items match. Count marks above 50 and names starting with "A".',
      hint: 'Loop and increment a counter when condition(item) is true.',
      solution: `static int CountIf<T>(List<T> list, Predicate<T> condition)
{
    int count = 0;
    foreach (var item in list) if (condition(item)) count++;
    return count;
}

Console.WriteLine(CountIf(new List<int> { 40, 55, 90 }, m => m > 50));                     // 2
Console.WriteLine(CountIf(new List<string> { "Asha", "Ravi", "Anil" }, n => n.StartsWith("A"))); // 2`,
    },
    {
      task: 'Write a generic method AreEqual<T>(T a, T b) that returns true if both are equal, using EqualityComparer<T>.Default. Test with ints, strings and null strings.',
      hint: 'You cannot use == on unconstrained T.',
      solution: `static bool AreEqual<T>(T a, T b) => EqualityComparer<T>.Default.Equals(a, b);

Console.WriteLine(AreEqual(5, 5));            // True
Console.WriteLine(AreEqual("C#", "c#"));      // False
Console.WriteLine(AreEqual<string?>(null, null)); // True`,
    },
    {
      task: 'Write T[] Fill<T>(int size) where T : new() that returns an array with size new objects. Use it to create 3 Student objects and print their default Name "New Student".',
      hint: 'Loop and assign new T() to each index.',
      solution: `static T[] Fill<T>(int size) where T : new()
{
    var arr = new T[size];
    for (int i = 0; i < size; i++) arr[i] = new T();
    return arr;
}

foreach (var s in Fill<Student>(3)) Console.WriteLine(s.Name);  // New Student x3

class Student { public string Name { get; set; } = "New Student"; }`,
    },
  ],
  quiz: [
    {
      question: 'Which call requires explicit type arguments?',
      options: ['Swap(ref a, ref b)', 'Max(3, 9)', 'Create<Student>() where Create<T>() has no parameters', 'Largest(new[] { 1, 2 })'],
      answer: 2,
      explanation: 'Type inference uses only arguments; with no parameters T cannot be inferred.',
    },
    {
      question: 'Both Show(int x) and Show<T>(T x) exist. Which runs for Show(5)?',
      options: ['Show(int)', 'Show<int>', 'Compile error: ambiguous', 'Show<object>'],
      answer: 0,
      explanation: 'When both are equally good, the non-generic method is preferred.',
    },
    {
      question: 'What constraint lets you call a.CompareTo(b) on T?',
      options: ['where T : class', 'where T : new()', 'where T : notnull', 'where T : IComparable<T>'],
      answer: 3,
      explanation: 'IComparable<T> declares CompareTo(T other).',
    },
    {
      question: 'What is printed by Console.WriteLine($"[{DefaultOf<string>()}]") where DefaultOf<T>() => default?',
      options: ['[null]', '[]', '[0]', 'Compile error'],
      answer: 1,
      explanation: 'default(string) is null, and null in an interpolated string prints as empty.',
    },
    {
      question: 'Which LINQ method signature is a generic method with TWO type parameters?',
      options: ['Where<TSource>', 'Count<TSource>', 'Select<TSource, TResult>', 'Any<TSource>'],
      answer: 2,
      explanation: 'Select converts each TSource into a TResult.',
    },
  ],
};
