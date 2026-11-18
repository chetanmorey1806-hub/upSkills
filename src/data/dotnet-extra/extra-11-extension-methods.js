const stringExt = `using System;

static class StringExtensions
{
    public static int WordCount(this string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return 0;
        return text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
    }

    public static bool IsPalindrome(this string text)
    {
        string clean = text.Replace(" ", "").ToLowerInvariant();
        for (int i = 0, j = clean.Length - 1; i < j; i++, j--)
            if (clean[i] != clean[j]) return false;
        return true;
    }

    public static string Mask(this string text, int visible = 4)
    {
        if (text.Length <= visible) return text;
        return new string('*', text.Length - visible) + text.Substring(text.Length - visible);
    }
}

class Program
{
    static void Main()
    {
        string line = "  C# extension   methods are cool ";
        Console.WriteLine(line.WordCount());
        Console.WriteLine("Nurses run".IsPalindrome());
        Console.WriteLine("Hello".IsPalindrome());
        Console.WriteLine("9876543210".Mask());
        Console.WriteLine("1234567812345678".Mask(6));
        Console.WriteLine(StringExtensions.WordCount("called as static"));
    }
}
`;

const genericExt = `using System;
using System.Collections.Generic;

static class NumberExtensions
{
    public static bool IsEven(this int n) => n % 2 == 0;
    public static int Percent(this int part, int total) => total == 0 ? 0 : part * 100 / total;
}

static class CollectionExtensions
{
    public static IEnumerable<T> EveryOther<T>(this IEnumerable<T> source)
    {
        bool take = true;
        foreach (var item in source)
        {
            if (take) yield return item;
            take = !take;
        }
    }

    public static string JoinWith<T>(this IEnumerable<T> source, string separator)
        => string.Join(separator, source);
}

class Program
{
    static void Main()
    {
        Console.WriteLine(10.IsEven());
        Console.WriteLine(7.IsEven());
        Console.WriteLine(45.Percent(60));

        var marks = new List<int> { 91, 45, 78, 66, 30 };
        Console.WriteLine(marks.EveryOther().JoinWith(" - "));
        Console.WriteLine(new[] { "Mon", "Tue", "Wed", "Thu" }.EveryOther().JoinWith(","));
    }
}
`;

const sealedExt = `using System;

sealed class Employee                     // sealed: cannot be inherited
{
    public string Name { get; }
    public int Salary { get; }
    public Employee(string name, int salary) { Name = name; Salary = salary; }

    public string Describe() => $"Employee {Name}";            // instance method
}

static class EmployeeExtensions
{
    public static string Describe(this Employee e) => "EXTENSION";   // never chosen: instance wins
    public static int AnnualSalary(this Employee e) => e.Salary * 12;
    public static string Band(this Employee? e) =>
        e is null ? "No employee" : (e.Salary >= 50000 ? "Senior" : "Junior");
}

class Program
{
    static void Main()
    {
        var e = new Employee("Farhan", 42000);
        Console.WriteLine(e.Describe());
        Console.WriteLine(e.AnnualSalary());
        Console.WriteLine(e.Band());

        Employee? nobody = null;
        Console.WriteLine(nobody.Band());     // no NullReferenceException: it is a static call
    }
}
`;

const linqExt = `using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        var prices = new List<int> { 1200, 450, 3000, 799, 150 };

        // extension-method syntax
        var a = prices.Where(p => p > 500).OrderBy(p => p);

        // what the compiler really calls: static methods of System.Linq.Enumerable
        var b = Enumerable.OrderBy(Enumerable.Where(prices, p => p > 500), p => p);

        Console.WriteLine(string.Join(", ", a));
        Console.WriteLine(string.Join(", ", b));
        Console.WriteLine(prices.Sum());
    }
}
`;

const csharp14 = `// C# 14 (.NET 10) extension members - new syntax, NOT available on .NET 8
public static class StringExtensions
{
    extension(string text)                        // the receiver is declared once
    {
        public int WordCount() =>                 // extension method
            text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;

        public bool IsBlank => string.IsNullOrWhiteSpace(text);   // extension PROPERTY (new!)
    }

    extension(string)                             // static extension members
    {
        public static string Dash => "-";
    }
}

// usage
// "hello world".WordCount()   -> 2
// "   ".IsBlank               -> True
// string.Dash                 -> "-"`;

export default {
  id: 'extra-11-extension-methods',
  title: 'Extension Methods',
  module: 'Extra: OOP Concepts',
  extraNo: 11,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Extension methods let you "add" new methods to an existing type - string, int, List<T>, even sealed classes or interfaces you do not own - without changing its source code and without inheritance. They are static methods in a static class whose first parameter has the this modifier, yet you call them like instance methods: "hello".WordCount(). All of LINQ is built this way. Learn the rules, how the compiler resolves them, generic and interface extensions, null handling, best practices, and the new C# 14 extension members.`,
  objectives: [
    'Write extension methods using a static class and the this modifier',
    'Call extension methods with instance syntax and know what the compiler generates',
    'Extend sealed classes, primitive types, interfaces and generic collections',
    'Explain resolution rules: instance methods win, namespaces must be imported',
    'Recognise LINQ as a set of extension methods and follow best practices',
  ],
  theory: [
    {
      heading: 'What is an extension method?',
      content: `An **extension method** is a **static method** that can be **called as if it were an instance method** of another type.

**Real-world analogy:** A phone cover with a built-in card holder or a pop-socket. You cannot open your phone and redesign it (you do not own the source code, or it is sealed), but you can **attach** an accessory that adds a new feature. Everyone using that phone with the accessory gets the new ability - and the phone itself is unchanged.

Without extensions: StringHelper.WordCount(text)
With extensions: text.WordCount()

The second reads more naturally, shows up in **IntelliSense** after the dot, and can be **chained**.`,
    },
    {
      heading: 'Syntax and rules',
      content: `Three rules:
1. Put it in a **non-generic, non-nested static class**.
2. Make the method **static**.
3. Mark the **first parameter** with **this** - its type is the type being extended (the receiver).

Further parameters are normal parameters (optional parameters are allowed). To use the extension, its **namespace must be imported** with a using directive (or be the same namespace / a global using).`,
      syntax: `namespace MyApp.Extensions;

public static class StringExtensions
{
    public static int WordCount(this string text, char separator = ' ')
    {
        return text.Split(separator, StringSplitOptions.RemoveEmptyEntries).Length;
    }
}

// usage in another file
using MyApp.Extensions;
int n = "learn csharp today".WordCount();   // 3`,
      points: [
        'The class name does not matter to callers (convention: <Type>Extensions)',
        'You can still call it as a normal static method: StringExtensions.WordCount(text)',
        'Extension methods can be generic: public static T Second<T>(this IEnumerable<T> s)',
      ],
    },
    {
      heading: 'How the compiler resolves extension methods',
      content: `When you write obj.Method(), the compiler:

1. Looks for an **instance method** named Method on the type (and its base types). If one fits, it is used - **instance methods always win** over extensions with the same signature.
2. Otherwise searches the **static classes in imported namespaces** for an extension whose first parameter type matches.
3. Rewrites the call: obj.Method(x) becomes **ExtensionClass.Method(obj, x)**.

Consequences:
- Extensions **cannot override** existing methods.
- Extensions can access only **public** (or internal, same assembly) members of the type - **no private fields**. They do not break encapsulation.
- Because it is a static call, calling an extension on a **null** reference does **not** throw by itself - the method receives null. Good extensions validate: ArgumentNullException.ThrowIfNull(text).
- If two imported classes provide the same extension, the call is **ambiguous** (CS0121).`,
    },
    {
      heading: 'Extending interfaces, generics and sealed types - LINQ',
      content: `Extension methods are most powerful on **interfaces**: write one method for IEnumerable<T> and every List, array, HashSet, Dictionary, query result gets it.

That is exactly what **LINQ** is: System.Linq.Enumerable is a static class full of extension methods on IEnumerable<T> - Where, Select, OrderBy, First, Sum, Count, Any... The using System.Linq; directive (implicit in modern projects) brings them in.

You can also extend:
- **sealed classes** (string, your own sealed Employee) - inheritance is impossible but extension works
- **structs and primitives** (int, DateTime, decimal)
- **enums** (Status.Active.ToDisplayName())
- **framework types** - ASP.NET Core uses extensions everywhere: builder.Services.AddControllers(), app.UseHttpsRedirection(), services.AddDbContext<T>(). Your own registrations can follow the same pattern: services.AddStudentModule().`,
      syntax: `public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddStudentModule(this IServiceCollection services)
    {
        services.AddScoped<IStudentRepository, StudentRepository>();
        services.AddScoped<IStudentService, StudentService>();
        return services;   // return the receiver to allow chaining
    }
}

// Program.cs
builder.Services.AddStudentModule();`,
    },
    {
      heading: 'Best practices and C# 14 extension members',
      content: `Do:
- Group extensions by the type they extend (StringExtensions, DateTimeExtensions) in a dedicated namespace.
- Keep them **small, pure and obviously related** to the type.
- **Validate** the receiver for null when needed.
- **Return the receiver** (or a new value) for fluent chaining.

Avoid:
- Extending **object** (pollutes IntelliSense for every type).
- Using extensions to hide **business logic** that belongs in a service class.
- Names that may later clash with methods added to the type itself (your extension would silently stop being called).

**C# 14 (.NET 10)** adds **extension members** with a new extension(Type receiver) { ... } block that also supports **extension properties** and **static extension members**. The classic this-parameter syntax still works and is what you should use on .NET 8.`,
      syntax: csharp14,
      tip: 'Visual Studio shows extension methods in IntelliSense with a small down-arrow icon and the text (extension) in the tooltip.',
    },
  ],
  examples: [
    {
      title: 'String extensions: WordCount, IsPalindrome, Mask',
      scenario: 'A utilities library for a banking app: count words in feedback, check palindromes in a quiz module and mask phone/card numbers on screen.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it ExtensionMethodsDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Type line. in the editor and notice WordCount in IntelliSense with the (extension) label',
      ],
      code: stringExt,
      csharp: { files: { 'Program.cs': stringExt }, stdin: '' },
      result: `5
True
False
******3210
**********345678
3`,
      explanation: `Splitting on spaces with RemoveEmptyEntries ignores the extra spaces, leaving C#, extension, methods, are, cool = 5 words. "Nurses run" becomes "nursesrun", which reads the same backwards. Mask() keeps the last 4 characters of the 10-digit number and replaces 6 with stars; Mask(6) on 16 characters gives 10 stars plus "345678". The last line proves an extension is just a static method: StringExtensions.WordCount("called as static") returns 3.`,
    },
    {
      title: 'Extending int and generic IEnumerable<T>',
      scenario: 'Helper methods for a marks-processing module: even checks, percentages and picking every other item from any collection.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericExtensions',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: genericExt,
      csharp: { files: { 'Program.cs': genericExt }, stdin: '' },
      result: `True
False
75
91 - 78 - 30
Mon,Wed`,
      explanation: `Extensions work on literals: 10.IsEven() is True, 7.IsEven() is False. 45 x 100 / 60 = 4500 / 60 = 75 (integer division). EveryOther<T> extends IEnumerable<T>, so it works for both a List<int> and a string array: it yields items at positions 0, 2, 4 - 91, 78, 30 and Mon, Wed. JoinWith is chained on the result just like LINQ methods.`,
    },
    {
      title: 'Extending a sealed class; instance methods win; null receivers',
      scenario: 'An HR library ships a sealed Employee class you cannot inherit from or edit. You need annual salary and salary band helpers.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it SealedExtensions',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Hover over e.Describe() - the tooltip shows the instance method, not the extension',
      ],
      code: sealedExt,
      csharp: { files: { 'Program.cs': sealedExt }, stdin: '' },
      result: `Employee Farhan
504000
Junior
No employee`,
      explanation: `Employee has an instance method Describe(), so the extension with the same signature is ignored - instance methods always win. AnnualSalary gives 42000 x 12 = 504000. 42000 is below 50000, so Band is Junior. nobody.Band() is compiled to EmployeeExtensions.Band(null), so there is no NullReferenceException; the method handles null itself.`,
    },
    {
      title: 'LINQ is extension methods',
      scenario: 'Filter and sort product prices with LINQ, then write the same query as plain static calls to see what the compiler does.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it LinqIsExtensions',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Right-click Where and choose Go To Definition (F12) - it opens System.Linq.Enumerable with public static ... Where<TSource>(this IEnumerable<TSource> source, ...)',
      ],
      code: linqExt,
      csharp: { files: { 'Program.cs': linqExt }, stdin: '' },
      result: `799, 1200, 3000
799, 1200, 3000
5599`,
      explanation: `Prices greater than 500 are 1200, 3000 and 799; sorted ascending they are 799, 1200, 3000. Both lines are identical because prices.Where(...).OrderBy(...) is just compiler sugar for Enumerable.OrderBy(Enumerable.Where(prices, ...), ...). Sum is also an extension: 1200 + 450 + 3000 + 799 + 150 = 5599.`,
    },
  ],
  interview: [
    { q: 'What is an extension method?', a: 'A static method in a static class whose first parameter is marked with this, allowing it to be called as if it were an instance method of that parameter\'s type, without modifying or inheriting from the type.', level: 'Easy' },
    { q: 'What are the rules for declaring an extension method?', a: 'It must be static, inside a non-generic, non-nested static class, and its first parameter must have the this modifier. Its namespace must be imported to use it.', level: 'Easy' },
    { q: 'Can an extension method access private members of the extended type?', a: 'No. It is just a static method outside the type, so it can access only public (or internal from the same assembly) members.', level: 'Medium' },
    { q: 'What happens if a type has an instance method with the same signature as an extension method?', a: 'The instance method is always chosen. The extension is never called with instance syntax (it can still be called as a static method).', level: 'Medium' },
    { q: 'Can you call an extension method on a null reference?', a: 'Yes, it compiles to a static call that receives null, so no NullReferenceException is thrown automatically. The method should check for null itself if needed.', level: 'Hard' },
    { q: 'Can extension methods be used to extend sealed classes and interfaces?', a: 'Yes. That is one of their main uses: string is sealed, and LINQ extends the IEnumerable<T> interface.', level: 'Easy' },
    { q: 'How is LINQ related to extension methods?', a: 'LINQ method syntax (Where, Select, OrderBy, Sum...) is implemented as extension methods in System.Linq.Enumerable on IEnumerable<T> (and Queryable on IQueryable<T>).', level: 'Medium' },
    { q: 'Can extension methods override existing methods or be virtual?', a: 'No. They are static, so they cannot be virtual, override or be overridden; they are bound at compile time based on the static type.', level: 'Medium' },
    { q: 'Can you create extension properties?', a: 'Not with the classic this syntax. C# 14 (.NET 10) introduces extension members (extension(Type t) { ... } blocks) that support extension properties and static extension members.', level: 'Hard' },
    { q: 'Why does an extension method sometimes "not appear" in IntelliSense?', a: 'Its namespace is not imported with using, the receiver type does not match (for example extension on IEnumerable<int> but calling on List<string>), or the class is not static/public.', level: 'Medium' },
    { q: 'Output? static class X { public static int Twice(this int n) => n * 2; } Console.Write(5.Twice().Twice());', a: 'It prints 20. 5.Twice() = 10 and 10.Twice() = 20 - extensions can be chained.', level: 'Easy' },
    { q: 'Give examples of extension methods in ASP.NET Core.', a: 'builder.Services.AddControllers(), AddDbContext<T>(), AddScoped via ServiceCollectionServiceExtensions, app.UseRouting(), app.MapGet(), app.UseSwagger() - all are extension methods on IServiceCollection, IApplicationBuilder or IEndpointRouteBuilder.', level: 'Medium' },
    { q: 'What are good naming and organisation practices for extension methods?', a: 'Put them in static classes named after the extended type (StringExtensions), in a dedicated namespace, keep them small and closely related to the type, and avoid extending object.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a string extension method ToTitleCase() that capitalises the first letter of each word: "learn c sharp" -> "Learn C Sharp".',
      hint: 'Split on spaces, uppercase the first char of each word, join again.',
      solution: `static class StringExt
{
    public static string ToTitleCase(this string s)
    {
        var words = s.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        for (int i = 0; i < words.Length; i++)
            words[i] = char.ToUpperInvariant(words[i][0]) + words[i].Substring(1).ToLowerInvariant();
        return string.Join(" ", words);
    }
}

Console.WriteLine("learn c sharp".ToTitleCase());   // Learn C Sharp`,
    },
    {
      task: 'Write an int extension IsPrime() and print all primes between 1 and 20 using it.',
      hint: 'A number below 2 is not prime; check divisors up to the square root.',
      solution: `static class IntExt
{
    public static bool IsPrime(this int n)
    {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++)
            if (n % d == 0) return false;
        return true;
    }
}

for (int i = 1; i <= 20; i++)
    if (i.IsPrime()) Console.Write(i + " ");
// 2 3 5 7 11 13 17 19`,
    },
    {
      task: 'Write a generic extension Average2<T>(this IEnumerable<T> items, Func<T, int> selector) that returns the integer average of a selected value. Use it to get the average marks of a list of students.',
      hint: 'Loop, sum the selector values, count the items, return sum / count (0 if empty).',
      solution: `static class EnumerableExt
{
    public static int Average2<T>(this IEnumerable<T> items, Func<T, int> selector)
    {
        int sum = 0, count = 0;
        foreach (var it in items) { sum += selector(it); count++; }
        return count == 0 ? 0 : sum / count;
    }
}

record Student(string Name, int Marks);

var students = new List<Student> { new("Asha", 80), new("Ravi", 70), new("Meena", 93) };
Console.WriteLine(students.Average2(s => s.Marks));   // 81`,
    },
    {
      task: 'Create an enum OrderStatus { Pending, Shipped, Delivered } and an extension ToDisplay() that returns "Waiting for dispatch", "On the way" and "Delivered to customer".',
      hint: 'Use a switch expression on the enum.',
      solution: `enum OrderStatus { Pending, Shipped, Delivered }

static class OrderStatusExt
{
    public static string ToDisplay(this OrderStatus s) => s switch
    {
        OrderStatus.Pending => "Waiting for dispatch",
        OrderStatus.Shipped => "On the way",
        OrderStatus.Delivered => "Delivered to customer",
        _ => "Unknown"
    };
}

Console.WriteLine(OrderStatus.Shipped.ToDisplay());   // On the way`,
    },
  ],
  quiz: [
    {
      question: 'Which modifier marks the first parameter of an extension method?',
      options: ['ref', 'this', 'base', 'static'],
      answer: 1,
      explanation: 'The this modifier on the first parameter identifies the type being extended.',
    },
    {
      question: 'Where must an extension method be declared?',
      options: ['In a non-generic, non-nested static class', 'Inside the class being extended', 'In any class with a constructor', 'In an interface'],
      answer: 0,
      explanation: 'Extension methods must be static methods of a top-level, non-generic static class.',
    },
    {
      question: 'A class has an instance method Print() and an extension method Print(this MyClass c) is also in scope. What does obj.Print() call?',
      options: ['The extension method', 'It is a compile error (ambiguous)', 'Both methods', 'The instance method'],
      answer: 3,
      explanation: 'Instance methods always take priority over extension methods.',
    },
    {
      question: 'What does the compiler turn "abc".WordCount() into?',
      options: ['new string("abc").WordCount()', 'string.WordCount("abc")', 'StringExtensions.WordCount("abc")', 'base.WordCount("abc")'],
      answer: 2,
      explanation: 'An extension call is rewritten as a call to the static method with the receiver as the first argument.',
    },
    {
      question: 'Which statement about extension methods is TRUE?',
      options: ['They can read private fields of the extended type', 'They can be used to extend sealed classes like string', 'They can override virtual methods', 'They work without importing their namespace'],
      answer: 1,
      explanation: 'Extensions are ideal for sealed types; they cannot access private members or override, and their namespace must be imported.',
    },
  ],
};
