const BOX = `using System;

var intBox = new Box<int>(42);
var textBox = new Box<string>("Hello Generics");
Console.WriteLine(intBox.Describe());
Console.WriteLine(textBox.Describe());

intBox.Value = intBox.Value + 8;          // no cast needed, Value is an int
Console.WriteLine($"New int value: {intBox.Value}");
// intBox.Value = "oops";                 // CS0029: compile-time error -> type safety!

class Box<T>
{
    public T Value { get; set; }

    public Box(T value) => Value = value;

    public string Describe() => $"Box<{typeof(T).Name}> holds {Value}";
}`;

const STACK = `using System;

var books = new MyStack<string>();
books.Push("C# Basics");
books.Push("ASP.NET Core");
books.Push("EF Core");
Console.WriteLine($"Count: {books.Count}");
Console.WriteLine($"Peek: {books.Peek()}");
Console.WriteLine($"Pop: {books.Pop()}");
Console.WriteLine($"Pop: {books.Pop()}");
Console.WriteLine($"Count: {books.Count}");

var marks = new MyStack<int>(2);
marks.Push(90);
marks.Push(75);
marks.Push(60);                            // array is full -> resize
Console.WriteLine($"Marks count: {marks.Count}, top: {marks.Peek()}");

try
{
    var empty = new MyStack<double>();
    empty.Pop();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}

class MyStack<T>
{
    private T[] items;
    public int Count { get; private set; }

    public MyStack(int capacity = 4) => items = new T[capacity];

    public void Push(T item)
    {
        if (Count == items.Length)
        {
            Array.Resize(ref items, items.Length * 2);
            Console.WriteLine($"(resized to {items.Length})");
        }
        items[Count++] = item;
    }

    public T Pop()
    {
        if (Count == 0) throw new InvalidOperationException("Stack is empty");
        T item = items[--Count];
        items[Count] = default!;              // release the reference
        return item;
    }

    public T Peek() =>
        Count == 0 ? throw new InvalidOperationException("Stack is empty") : items[Count - 1];
}`;

const REPO = `using System;
using System.Collections.Generic;

var students = new Repository<Student>();
students.Add(new Student { Id = 1, Name = "Asha" });
students.Add(new Student { Id = 2, Name = "Ravi" });

Student blank = students.CreateNew();     // new T() works because of the new() constraint
blank.Id = 3;
blank.Name = "Neha";
students.Add(blank);

Console.WriteLine($"Total: {students.Count}");
Console.WriteLine($"Find 2: {students.GetById(2)?.Name}");
Console.WriteLine($"Find 9: {students.GetById(9)?.Name ?? "not found"}");
// var bad = new Repository<string>();    // CS0311: string does not implement IEntity

interface IEntity
{
    int Id { get; set; }
}

class Student : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

class Repository<T> where T : class, IEntity, new()
{
    private readonly List<T> items = new();

    public int Count => items.Count;

    public void Add(T item) => items.Add(item);

    public T CreateNew() => new T();                              // needs new()

    public T? GetById(int id) => items.Find(x => x.Id == id);     // x.Id needs IEntity
}`;

const PAIR = `using System;

var p1 = new Pair<string, int>("Asha", 91);
var p2 = new Pair<int, bool>(101, true);
Console.WriteLine(p1);
Console.WriteLine(p2);
Console.WriteLine(p1.Swap());

new Tracker<int>();
new Tracker<int>();
new Tracker<string>();
Console.WriteLine($"Tracker<int>.Created = {Tracker<int>.Created}");
Console.WriteLine($"Tracker<string>.Created = {Tracker<string>.Created}");
Console.WriteLine($"Tracker<double>.Created = {Tracker<double>.Created}");

class Pair<TFirst, TSecond>
{
    public TFirst First { get; }
    public TSecond Second { get; }

    public Pair(TFirst first, TSecond second)
    {
        First = first;
        Second = second;
    }

    public Pair<TSecond, TFirst> Swap() => new(Second, First);

    public override string ToString() => $"({First}, {Second})";
}

class Tracker<T>
{
    public static int Created;          // one copy PER closed type: Tracker<int>, Tracker<string> ...
    public Tracker() => Created++;
}`;

export default {
  id: 'extra-14-generic-classes',
  title: 'Generic Classes',
  module: 'Extra: OOP Concepts',
  extraNo: 14,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `A generic class is a class written once with a type placeholder (T) and reused for many data types: Box<int>, Box<string>, Repository<Student>. Generics give type safety at compile time, remove casting and boxing, and let you write reusable containers and repositories. This lesson covers declaring generic classes, multiple type parameters, constraints (where T : ...), default(T), static members per closed type and generic inheritance.`,
  objectives: [
    'Declare and use generic classes with one or more type parameters',
    'Explain why generics are better than object (type safety, no casting, no boxing)',
    'Apply constraints: class, struct, new(), base class, interface, notnull',
    'Build a reusable generic stack and a generic repository',
    'Understand open vs closed generic types and static fields per closed type',
  ],
  theory: [
    {
      heading: 'What is a generic class and why do we need it?',
      content: `Without generics you would write IntStack, StringStack, StudentStack... or one ObjectStack that stores everything as object. The object version compiles for any data but you must cast when reading, mistakes appear only at runtime (InvalidCastException) and value types like int get boxed (copied to the heap), which is slow.

A generic class takes a TYPE PARAMETER in angle brackets. The compiler checks every use, so Box<int> can only hold ints.

Real-world analogy: a lunch box design. The factory makes ONE design of box (the generic class). You decide what goes in when you buy it: a rice box, a fruit box, a sandwich box (the closed types). A fruit box will not accept rice — that is type safety.`,
      syntax: `class Box<T>              // T = type parameter (placeholder)
{
    public T Value { get; set; }
}

Box<int> a = new Box<int>();      // T is replaced by int  (closed type)
Box<string> b = new();            // T is replaced by string`,
      points: [
        'Type safety: wrong types are compile-time errors, not runtime crashes',
        'No casting when reading values',
        'No boxing/unboxing for value types (better performance)',
        'Code reuse: one class works for any type',
        'List<T>, Dictionary<TKey,TValue>, Queue<T>, Nullable<T>, Task<T> are all generic classes',
      ],
    },
    {
      heading: 'Type parameters, naming and multiple parameters',
      content: `By convention a single type parameter is called T. When there are several, give them descriptive names starting with T: TKey, TValue, TFirst, TSecond, TEntity, TResult. A generic class can use its type parameters in fields, properties, method parameters, return types and even other generic types (List<T>, Pair<TSecond, TFirst>).

Open type vs closed type: Box<T> is an open (unbound) generic type — you cannot create objects of it. Box<int> is a closed (constructed) type — every type parameter has a real type, so you can new it. typeof(Box<>) gives the open type; typeof(Box<int>) the closed one.`,
      syntax: `class Pair<TKey, TValue>
{
    public TKey Key { get; }
    public TValue Value { get; }
    public Pair(TKey key, TValue value) { Key = key; Value = value; }
}

var p = new Pair<string, int>("Marks", 91);`,
    },
    {
      heading: 'Constraints – where T : ...',
      content: `By default T can be ANY type, so inside the class you can only use members that every type has (ToString, Equals, GetHashCode). Constraints restrict T and in return unlock more operations.`,
      syntax: `class Repo<T> where T : class, IEntity, new() { }
class Calc<T> where T : struct { }
class Sorter<T> where T : IComparable<T> { }
class Manager<TEmp> where TEmp : Employee { }
class Cache<TKey, TValue> where TKey : notnull { }`,
      points: [
        'where T : class — T must be a reference type (string, Student, interfaces...)',
        'where T : struct — T must be a non-nullable value type (int, DateTime, custom structs)',
        'where T : new() — T must have a public parameterless constructor, so you can write new T(); must come LAST',
        'where T : BaseClass — T must be that class or derive from it; you can use base members',
        'where T : IInterface — T must implement the interface; you can call interface members',
        'where T : notnull — T must be a non-nullable type (used by Dictionary keys)',
        'where T : unmanaged — value type with no references inside (advanced, used with pointers/spans)',
        'Multiple type parameters each get their own where clause',
      ],
      tip: `Breaking a constraint is a compile-time error such as CS0311 ("no implicit reference conversion") or CS0310 ("must be a non-abstract type with a public parameterless constructor").`,
    },
    {
      heading: 'default(T) and working with unknown types',
      content: `Inside a generic class you do not know whether T is a value type or reference type, so you cannot write "return null" (int cannot be null) or "return 0" (string is not a number). Use default or default(T): it gives null for reference types, 0 for numbers, false for bool, and an all-zero struct for structs.

Comparing two T values with == is not allowed for an unconstrained T. Use EqualityComparer<T>.Default.Equals(a, b), or constrain T to IEquatable<T> / IComparable<T>.`,
      syntax: `public T GetOrDefault(int index) =>
    index < items.Count ? items[index] : default!;

bool same = EqualityComparer<T>.Default.Equals(a, b);`,
    },
    {
      heading: 'Static members, inheritance and generic interfaces',
      content: `Static fields belong to each CLOSED type separately: Tracker<int>.Created and Tracker<string>.Created are two different variables. The static constructor also runs once per closed type.

Inheritance options:
1. Non-generic child of a closed generic parent: class StudentRepo : Repository<Student>
2. Generic child of generic parent: class CachedRepo<T> : Repository<T> where T : class, IEntity, new()  (repeat the constraints!)
3. Generic class implementing a generic interface: class InMemoryRepo<T> : IRepository<T>

Generic interfaces like IEnumerable<T>, IComparable<T> and IRepository<T> are the most common way generics are used in ASP.NET Core and EF Core (DbSet<TEntity> is a generic class).`,
      syntax: `class StudentRepository : Repository<Student>
{
    public Student? FindByName(string name) => ...;
}

class AuditRepository<T> : Repository<T> where T : class, IEntity, new() { }`,
      tip: `A derived generic class must repeat (or strengthen) the base class constraints, otherwise you get error CS0314/CS0311.`,
    },
  ],
  examples: [
    {
      title: 'Box<T> – the simplest generic class',
      scenario: 'Create one Box class that can safely hold an int, a string or any other type, and show that the compiler blocks wrong types.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericBox',
        'Replace Program.cs with the code',
        'Uncomment the "oops" line to see the CS0029 compile error, then comment it again',
        'Press Ctrl+F5',
      ],
      code: BOX,
      csharp: { files: { 'Program.cs': BOX }, stdin: '' },
      result: `Box<Int32> holds 42
Box<String> holds Hello Generics
New int value: 50`,
      explanation: `Box<int> and Box<string> are two closed types created from one class. typeof(T).Name returns the CLR name (Int32, String). Because Value is strongly typed as int inside Box<int>, we can add 8 without casting, and assigning a string is a compile-time error instead of a runtime crash.`,
    },
    {
      title: 'Generic stack with automatic resizing',
      scenario: 'Build a reusable LIFO stack (like a pile of books) that works for strings, ints and doubles, grows automatically and throws a clear error when empty.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericStack',
        'Replace Program.cs with the code',
        'Put a breakpoint (F9) on Array.Resize and press F5 to watch the array grow; use F10 to step',
        'Press Ctrl+F5 for the normal run',
      ],
      code: STACK,
      csharp: { files: { 'Program.cs': STACK }, stdin: '' },
      result: `Count: 3
Peek: EF Core
Pop: EF Core
Pop: ASP.NET Core
Count: 1
(resized to 4)
Marks count: 3, top: 60
Error: Stack is empty`,
      explanation: `MyStack<T> stores items in a T[] array. Push places the item at index Count and increments it; Pop decrements first and returns that item (last in, first out). The int stack starts with capacity 2, so the third Push doubles the array to 4 and prints the resize message before the "Marks count" line. default! clears the popped slot (null for strings, 0 for ints) so the garbage collector can free objects.`,
    },
    {
      title: 'Generic repository with constraints',
      scenario: 'A Repository<T> that can store any entity with an Id, create blank entities and search by Id. Constraints make x.Id and new T() legal.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericRepository',
        'Replace Program.cs with the code',
        'Uncomment the Repository<string> line to see error CS0311, then comment it again',
        'Press Ctrl+F5',
      ],
      code: REPO,
      csharp: { files: { 'Program.cs': REPO }, stdin: '' },
      result: `Total: 3
Find 2: Ravi
Find 9: not found`,
      explanation: `where T : class, IEntity, new() means: T must be a reference type, must have an Id property and must have a public parameterless constructor. Because of IEntity the lambda x => x.Id == id compiles; because of new() CreateNew can call new T(). List.Find returns null when nothing matches, so ?.Name gives null and ?? prints "not found". This is the same idea as the Repository pattern used with EF Core.`,
    },
    {
      title: 'Multiple type parameters and static fields per closed type',
      scenario: 'A Pair<TFirst, TSecond> that can swap its values into a new Pair<TSecond, TFirst>, plus a Tracker<T> that counts objects separately for each type argument.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GenericPair',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: PAIR,
      csharp: { files: { 'Program.cs': PAIR }, stdin: '' },
      result: `(Asha, 91)
(101, True)
(91, Asha)
Tracker<int>.Created = 2
Tracker<string>.Created = 1
Tracker<double>.Created = 0`,
      explanation: `Swap returns Pair<int, string> because the type parameters are reversed in the return type; target-typed new(Second, First) infers it. bool prints as True. Tracker<int>, Tracker<string> and Tracker<double> are three different classes at runtime, each with its own static Created field — two ints were created, one string and no doubles.`,
    },
  ],
  interview: [
    { q: 'What is a generic class?', a: 'A class declared with one or more type parameters (class Box<T>) so the same code works with many types while keeping compile-time type safety. List<T> and Dictionary<TKey,TValue> are examples.', level: 'Easy' },
    { q: 'What are the advantages of generics over using object?', a: 'Type safety at compile time, no explicit casts, no boxing/unboxing for value types (better performance), and code reuse. With object, errors appear only at runtime as InvalidCastException.', level: 'Easy' },
    { q: 'What is the difference between an open and a closed generic type?', a: 'An open type still has unassigned type parameters (List<T>, typeof(List<>)) and cannot be instantiated. A closed (constructed) type has all type arguments supplied (List<int>) and can be instantiated.', level: 'Medium' },
    { q: 'List the generic constraints available in C#.', a: 'where T : class, struct, new(), notnull, unmanaged, a base class name, an interface name, another type parameter (where T : U), plus class? and default in special cases. new() must be the last constraint.', level: 'Medium' },
    { q: 'Why do we need the new() constraint?', a: 'Without it the compiler does not know whether T has a public parameterless constructor, so new T() is not allowed. new() guarantees it (abstract classes and types without a parameterless constructor are rejected).', level: 'Medium' },
    { q: 'What does default(T) return?', a: 'null for reference types and nullable types, 0 for numeric types, false for bool, \'\\0\' for char, and a struct with all fields zeroed for structs.', level: 'Easy' },
    { q: 'Can you use == to compare two values of type T inside a generic class?', a: 'Not for an unconstrained T (error CS0019). Use EqualityComparer<T>.Default.Equals(a, b), a.Equals(b), or constrain T (for example to IEquatable<T> or class for reference comparison). In .NET 7+ you can also constrain to IEqualityOperators.', level: 'Hard' },
    { q: 'Are static fields shared between Box<int> and Box<string>?', a: 'No. Each closed generic type has its own copy of static fields and its own static constructor run. Box<int>.Count and Box<string>.Count are separate.', level: 'Hard' },
    { q: 'Output? class C<T> { public static int N; } C<int>.N = 5; C<string>.N = 7; Console.WriteLine(C<int>.N + C<string>.N);', a: '12. They are two different static fields (5 + 7).', level: 'Medium' },
    { q: 'Output? var b = new Box<int>(); Console.WriteLine(b.Value); where Box<T> has public T Value { get; set; } and no constructor.', a: '0 — the property is never assigned, so it holds default(int).', level: 'Easy' },
    { q: 'Can a non-generic class inherit from a generic class?', a: 'Yes, if it closes the type parameter: class StudentRepository : Repository<Student>. A generic child can also pass its own parameter: class CachedRepo<T> : Repository<T>, repeating the base constraints.', level: 'Medium' },
    { q: 'Give real examples of generic classes in ASP.NET Core / EF Core.', a: 'DbSet<TEntity>, ILogger<T>, IOptions<T>, ActionResult<T>, Task<T>, List<T>, IRepository<T> in the repository pattern.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a generic class Result<T> with properties Success (bool), Data (T?) and Error (string). Add static methods Ok(T data) and Fail(string error). Use it for Result<int> and Result<string>.',
      hint: 'Static factory methods inside a generic class can use T directly.',
      solution: `var r1 = Result<int>.Ok(42);
var r2 = Result<string>.Fail("User not found");
Console.WriteLine($"{r1.Success} {r1.Data}");   // True 42
Console.WriteLine($"{r2.Success} {r2.Error}");  // False User not found

class Result<T>
{
    public bool Success { get; private init; }
    public T? Data { get; private init; }
    public string Error { get; private init; } = "";
    public static Result<T> Ok(T data) => new() { Success = true, Data = data };
    public static Result<T> Fail(string error) => new() { Success = false, Error = error };
}`,
    },
    {
      task: 'Write a generic Queue-like class MyQueue<T> with Enqueue, Dequeue and Count using a List<T>. Test with student names.',
      hint: 'Enqueue = Add at end, Dequeue = read index 0 then RemoveAt(0).',
      solution: `var q = new MyQueue<string>();
q.Enqueue("Asha"); q.Enqueue("Ravi");
Console.WriteLine(q.Dequeue()); // Asha
Console.WriteLine(q.Count);     // 1

class MyQueue<T>
{
    private readonly List<T> items = new();
    public int Count => items.Count;
    public void Enqueue(T item) => items.Add(item);
    public T Dequeue()
    {
        if (items.Count == 0) throw new InvalidOperationException("Queue empty");
        T first = items[0];
        items.RemoveAt(0);
        return first;
    }
}`,
    },
    {
      task: 'Create a class MinMax<T> where T : IComparable<T> that keeps track of the smallest and largest value added. Test with ints and strings.',
      hint: 'Use CompareTo; the first added value becomes both Min and Max.',
      solution: `var m = new MinMax<int>();
foreach (var x in new[] { 40, 12, 99, 57 }) m.Add(x);
Console.WriteLine($"{m.Min} {m.Max}");   // 12 99

class MinMax<T> where T : IComparable<T>
{
    private bool hasValue;
    public T? Min { get; private set; }
    public T? Max { get; private set; }
    public void Add(T value)
    {
        if (!hasValue) { Min = Max = value; hasValue = true; return; }
        if (value.CompareTo(Min!) < 0) Min = value;
        if (value.CompareTo(Max!) > 0) Max = value;
    }
}`,
    },
    {
      task: 'Make an abstract class Employee with Name and a derived Manager. Create EmployeeList<T> where T : Employee that prints all names. Try EmployeeList<string> and note the error.',
      hint: 'A base-class constraint lets you use item.Name inside the generic class.',
      solution: `var list = new EmployeeList<Manager>();
list.Add(new Manager { Name = "Kiran" });
list.PrintAll();                         // Kiran
// var bad = new EmployeeList<string>(); // CS0311

abstract class Employee { public string Name { get; set; } = ""; }
class Manager : Employee { }
class EmployeeList<T> where T : Employee
{
    private readonly List<T> items = new();
    public void Add(T e) => items.Add(e);
    public void PrintAll() { foreach (var e in items) Console.WriteLine(e.Name); }
}`,
    },
  ],
  quiz: [
    {
      question: 'What is the main benefit of List<int> over ArrayList?',
      options: ['It can store any type', 'Type safety and no boxing of ints', 'It is always sorted', 'It is thread-safe'],
      answer: 1,
      explanation: 'List<int> only accepts ints (compile-time check) and stores them without boxing.',
    },
    {
      question: 'Which constraint allows you to write new T() inside a generic class?',
      options: ['where T : class', 'where T : struct', 'where T : notnull', 'where T : new()'],
      answer: 3,
      explanation: 'new() guarantees a public parameterless constructor.',
    },
    {
      question: 'What does default(T) return when T is string?',
      options: ['null', '"" (empty string)', '0', 'It does not compile'],
      answer: 0,
      explanation: 'string is a reference type, so its default value is null.',
    },
    {
      question: 'class C<T> { public static int Count; } — how many Count variables exist after using C<int> and C<string>?',
      options: ['1', '0', '2', 'Depends on the number of objects'],
      answer: 2,
      explanation: 'Each closed generic type has its own static fields.',
    },
    {
      question: 'Which of these is an OPEN generic type?',
      options: ['List<int>', 'typeof(Dictionary<,>)', 'Box<string>', 'Pair<int, bool>'],
      answer: 1,
      explanation: 'Dictionary<,> has no type arguments supplied, so it is open (unbound) and cannot be instantiated.',
    },
  ],
};
