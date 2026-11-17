const ex1 = `using System;

int a = 5, b = 10;
Swap(ref a, ref b);
Console.WriteLine($"a={a}, b={b}");

string x = "Left", y = "Right";
Swap(ref x, ref y);
Console.WriteLine($"x={x}, y={y}");

PrintAll(new int[] { 1, 2, 3 });
PrintAll(new string[] { "C#", "SQL" });

Console.WriteLine(GetDefault<int>());
Console.WriteLine(GetDefault<bool>());
Console.WriteLine(GetDefault<string>() == null);

// One method works for every type T - the compiler fills in T
static void Swap<T>(ref T first, ref T second)
{
    T temp = first;
    first = second;
    second = temp;
}

static void PrintAll<T>(T[] items)
{
    Console.WriteLine($"{typeof(T).Name}[]: {string.Join(" ", items)}");
}

static T? GetDefault<T>() => default;   // 0 for int, false for bool, null for classes`;

const ex2 = `using System;

Box<int> intBox = new Box<int>(42);
Box<string> strBox = new Box<string>("Hello");
Console.WriteLine(intBox.Describe());
Console.WriteLine(strBox.Describe());

Pair<string, int> p = new Pair<string, int>("Asha", 88);
Console.WriteLine($"{p.Key} scored {p.Value}");

var colors = new SimpleList<string>();
colors.Add("Red");
colors.Add("Green");
colors.Add("Blue");
Console.WriteLine("Count: " + colors.Count);
Console.WriteLine("Capacity: " + colors.Capacity);
Console.WriteLine("Item 1: " + colors.Get(1));

class Box<T>
{
    public T Content { get; }
    public Box(T content) { Content = content; }
    public string Describe() => $"Box<{typeof(T).Name}> holds {Content}";
}

class Pair<TKey, TValue>
{
    public TKey Key { get; }
    public TValue Value { get; }
    public Pair(TKey key, TValue value) { Key = key; Value = value; }
}

// A tiny version of List<T> to show how generic collections work inside
class SimpleList<T>
{
    private T[] _items = new T[2];
    private int _count;

    public int Count => _count;
    public int Capacity => _items.Length;

    public void Add(T item)
    {
        if (_count == _items.Length)
            Array.Resize(ref _items, _items.Length * 2);   // grow when full
        _items[_count++] = item;
    }

    public T Get(int index)
    {
        if (index < 0 || index >= _count)
            throw new ArgumentOutOfRangeException(nameof(index));
        return _items[index];
    }
}`;

const ex3 = `using System;

Console.WriteLine("Max int: " + Max(10, 25));
Console.WriteLine("Max string: " + Max("apple", "mango"));

Student s1 = new Student { Name = "Asha", Marks = 88 };
Student s2 = new Student { Name = "Ravi", Marks = 92 };
Console.WriteLine("Topper: " + Max(s1, s2).Name);

Logger logger = Create<Logger>();
logger.Log("Created with new() constraint");

Console.WriteLine(Kind(42));
Console.WriteLine(Kind(true));
// Kind("text");  // compile error: string is not a struct

// T must know how to compare itself
static T Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;

// T must have a public parameterless constructor
static T Create<T>() where T : new() => new T();

// T must be a value type
static string Kind<T>(T value) where T : struct
    => $"{value} is a value type ({typeof(T).Name})";

class Student : IComparable<Student>
{
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public int CompareTo(Student? other) => other is null ? 1 : Marks.CompareTo(other.Marks);
}

class Logger
{
    public void Log(string msg) => Console.WriteLine("[LOG] " + msg);
}`;

const ex4 = `using System;
using System.Collections.Generic;
using System.Linq;

IRepository<Student> students = new InMemoryRepository<Student>();
students.Add(new Student { Id = 1, Name = "Asha", Marks = 88 });
students.Add(new Student { Id = 2, Name = "Ravi", Marks = 45 });
students.Add(new Student { Id = 3, Name = "Meena", Marks = 72 });

IRepository<Product> products = new InMemoryRepository<Product>();
products.Add(new Product { Id = 10, Title = "Laptop", Price = 55000 });
products.Add(new Product { Id = 11, Title = "Mouse", Price = 500 });

Console.WriteLine("Students: " + students.GetAll().Count());
Console.WriteLine("Get 2: " + students.GetById(2)?.Name);

students.Update(new Student { Id = 2, Name = "Ravi", Marks = 55 });
Console.WriteLine("Ravi new marks: " + students.GetById(2)?.Marks);

bool deleted = students.Delete(3);
Console.WriteLine("Deleted 3: " + deleted);
Console.WriteLine("Get 3 is null: " + (students.GetById(3) == null));

foreach (Student s in students.GetAll())
    Console.WriteLine($"  {s.Id} {s.Name} {s.Marks}");

foreach (Product p in products.GetAll())
    Console.WriteLine($"  {p.Id} {p.Title} {p.Price}");

try
{
    students.Add(new Student { Id = 1, Name = "Copy" });
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Error: " + ex.Message);
}

// ---------- Generic repository ----------
interface IEntity
{
    int Id { get; set; }
}

interface IRepository<T> where T : class, IEntity
{
    void Add(T item);
    T? GetById(int id);
    IEnumerable<T> GetAll();
    void Update(T item);
    bool Delete(int id);
}

class InMemoryRepository<T> : IRepository<T> where T : class, IEntity
{
    private readonly Dictionary<int, T> _store = new Dictionary<int, T>();

    public void Add(T item)
    {
        if (_store.ContainsKey(item.Id))
            throw new InvalidOperationException($"{typeof(T).Name} with Id {item.Id} already exists");
        _store[item.Id] = item;
    }

    public T? GetById(int id) => _store.TryGetValue(id, out T? item) ? item : null;

    // sort by Id so the output order is always the same
    public IEnumerable<T> GetAll() => _store.Values.OrderBy(x => x.Id);

    public void Update(T item)
    {
        if (!_store.ContainsKey(item.Id))
            throw new KeyNotFoundException($"Id {item.Id} not found");
        _store[item.Id] = item;
    }

    public bool Delete(int id) => _store.Remove(id);
}

class Student : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

class Product : IEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public int Price { get; set; }
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below',
  'Press Ctrl+F5 to run (use F5 + F11 to step into the generic method and watch T)',
];

export default {
  id: 'day-030-generics-constraints',
  title: 'Generics, Generic Collections, Constraints',
  module: 'Module 3: Advanced C# Programming',
  day: 30,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Generics let you write a class or method once and reuse it safely for any type, without casting or boxing. Learn generic methods, generic classes, how generic collections are built, the where constraints, and build a reusable generic repository.',
  objectives: [
    'Explain the problem generics solve (type safety, no casting, no boxing, reuse)',
    'Write generic methods and generic classes with one or more type parameters',
    'Apply constraints: class, struct, new(), notnull, base class and interface',
    'Build a generic repository IRepository<T> used by Student and Product',
  ],
  theory: [
    {
      heading: 'What are generics and why do we need them?',
      content: 'Without generics you have two bad choices: write the same code again for every type (IntStack, StringStack, StudentStack) or use object, which loses type safety and needs casting/boxing. Generics give you a type parameter (usually T) that is a placeholder. When you use the code you supply the real type: List<int>, List<Student>. The compiler checks types and the runtime creates efficient code for each type.',
      points: [
        'Type safety: errors at compile time, not runtime',
        'Performance: no boxing/unboxing for value types',
        'Reusability: one implementation for many types',
        'Readability: List<Student> tells you exactly what is inside',
      ],
      tip: 'Analogy: a generic class is like a lunch box design. The box is the same; you decide at use time whether it carries rice (Box<Rice>) or fruit (Box<Fruit>).',
    },
    {
      heading: 'Generic methods',
      content: 'A generic method declares its type parameter after the name: void Swap<T>(ref T a, ref T b). You can call it as Swap<int>(ref x, ref y) or simply Swap(ref x, ref y) because the compiler infers T from the arguments (type inference). default(T) (or just default) gives the default value of T: 0 for numbers, false for bool, null for reference types. typeof(T) gives the real type at runtime.',
      syntax: `static T FirstOrFallback<T>(List<T> items, T fallback)
{
    return items.Count > 0 ? items[0] : fallback;
}
int n = FirstOrFallback(new List<int>(), -1);   // T inferred as int`,
    },
    {
      heading: 'Generic classes and interfaces',
      content: 'A class can take one or more type parameters: class Box<T>, class Pair<TKey, TValue>. Inside the class, T is used like a normal type for fields, properties, parameters and return values. Interfaces can be generic too: IRepository<T>, IComparable<T>, IEnumerable<T>. Every generic collection you used yesterday (List<T>, Dictionary<TKey,TValue>, HashSet<T>, Queue<T>, Stack<T>) is just a generic class written by Microsoft.',
      syntax: `class Pair<TKey, TValue>
{
    public TKey Key { get; }
    public TValue Value { get; }
    public Pair(TKey key, TValue value) { Key = key; Value = value; }
}
var p = new Pair<string, int>("Asha", 88);`,
    },
    {
      heading: 'Generic constraints (where)',
      content: 'By default T can be anything, so inside the code you can only use members every object has (ToString, Equals). A constraint limits which types are allowed and, in exchange, lets you use more members. Constraints are written with where after the signature. Multiple constraints are separated by commas, and new() must be last.',
      syntax: `where T : class              // reference type only
where T : struct             // non-nullable value type only
where T : new()              // must have public parameterless constructor
where T : notnull            // non-nullable type
where T : Person             // must be Person or derived from it
where T : IComparable<T>     // must implement the interface
where T : class, IEntity, new()   // combined
class Repo<TEntity, TKey> where TEntity : class where TKey : struct { }`,
      points: [
        'Constraint violations are compile-time errors, e.g. Kind("text") when T : struct',
        'IComparable<T> constraint lets you call CompareTo, needed for Max/Sort',
        'new() constraint lets you write new T() (factories)',
      ],
    },
    {
      heading: 'Generic collections recap and generic repository pattern',
      content: 'The Repository pattern hides how data is stored (memory, file, database) behind an interface with Add, GetById, GetAll, Update and Delete. Writing it as IRepository<T> where T : class, IEntity means one implementation works for Student, Product, Employee and any future entity that has an Id. In Module 7 and 8 you will build the same pattern on top of Entity Framework Core and inject it into ASP.NET Core controllers.',
      points: [
        'IEntity interface guarantees every T has an Id property',
        'Dictionary<int, T> inside gives fast lookup by Id',
        'Controllers/services depend on IRepository<T>, not on the concrete class (Dependency Inversion)',
      ],
    },
    {
      heading: 'Covariance and contravariance (awareness)',
      content: 'Some generic interfaces allow conversions between related types. IEnumerable<out T> is covariant: an IEnumerable<string> can be used where IEnumerable<object> is expected, because you only read from it. Action<in T> is contravariant: an Action<object> can be used where Action<string> is expected. List<T> itself is NOT variant: List<string> cannot be assigned to List<object>.',
      tip: 'Remember: out = output only (covariant), in = input only (contravariant).',
    },
  ],
  examples: [
    {
      title: 'Generic methods: Swap, PrintAll and default(T)',
      scenario: 'Write one Swap method that works for int and string, and see what default gives for different types.',
      steps: steps('GenericMethods'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `a=10, b=5
x=Right, y=Left
Int32[]: 1 2 3
String[]: C# SQL
0
False
True`,
      explanation: 'The compiler inferred T as int, then string, for Swap. typeof(T).Name prints the CLR type name (Int32, String). default for int is 0, for bool is False and for string (a reference type) is null, so the comparison prints True.',
    },
    {
      title: 'Generic classes: Box<T>, Pair<TKey,TValue> and our own SimpleList<T>',
      scenario: 'Create reusable containers and see how a List<T> grows internally.',
      steps: steps('GenericClasses'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Box<Int32> holds 42
Box<String> holds Hello
Asha scored 88
Count: 3
Capacity: 4
Item 1: Green`,
      explanation: 'SimpleList starts with an array of 2. The third Add finds the array full and Array.Resize doubles it to 4, which is exactly how List<T> grows. Get checks the index range and throws ArgumentOutOfRangeException for bad indexes, just like the real List.',
    },
    {
      title: 'Constraints: IComparable<T>, new() and struct',
      scenario: 'Write a Max method for any comparable type, a factory using new T(), and a method limited to value types.',
      steps: steps('GenericConstraints'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Max int: 25
Max string: mango
Topper: Ravi
[LOG] Created with new() constraint
42 is a value type (Int32)
True is a value type (Boolean)`,
      explanation: 'Because of where T : IComparable<T>, the method can call a.CompareTo(b). Student implements IComparable<Student> by comparing Marks, so Ravi (92) wins. Create<Logger>() works because Logger has a parameterless constructor. Kind accepts only value types; passing a string is a compile error.',
    },
    {
      title: 'Generic repository for Student and Product',
      scenario: 'Build IRepository<T> with CRUD methods once and reuse it for two different entities.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#), name it GenericRepositoryDemo',
        'Replace Program.cs with the code below (in a real project put each interface/class in its own file: Right-click project > Add > Class)',
        'Press Ctrl+F5 to run',
        'Set a breakpoint (F9) inside InMemoryRepository<T>.Add and press F5; hover T to see Student and then Product',
      ],
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Students: 3
Get 2: Ravi
Ravi new marks: 55
Deleted 3: True
Get 3 is null: True
  1 Asha 88
  2 Ravi 55
  10 Laptop 55000
  11 Mouse 500
Error: Student with Id 1 already exists`,
      explanation: 'One class InMemoryRepository<T> serves both Student and Product. The constraint where T : class, IEntity guarantees item.Id exists and that null can be returned from GetById. GetAll sorts by Id so the order is predictable. Adding a duplicate Id throws InvalidOperationException whose message uses typeof(T).Name.',
    },
  ],
  interview: [
    { q: 'What are generics in C#?', a: 'Generics allow classes, interfaces, methods and delegates to be defined with type parameters (like T) so the same code works with any type while staying type-safe and avoiding boxing.', level: 'Easy' },
    { q: 'What are the advantages of generics over object?', a: 'Compile-time type checking, no explicit casting, no boxing/unboxing for value types (better performance) and code reuse.', level: 'Easy' },
    { q: 'List the generic constraints available in C#.', a: 'where T : class, struct, new(), notnull, unmanaged, a base class name, an interface name, another type parameter (where T : U), and class? / default for nullable contexts.', level: 'Medium' },
    { q: 'Why must new() be the last constraint?', a: 'It is a language rule: the constructor constraint must appear after all other constraints in the where clause, e.g. where T : class, IEntity, new().', level: 'Medium' },
    { q: 'What does default(T) return?', a: 'The default value of T: 0 for numeric types, false for bool, null for reference types and nullable types, and a zero-filled struct for other value types.', level: 'Easy' },
    { q: 'Can you write T a, b; return a + b; in a generic method?', a: 'Not with an unconstrained T, because the compiler does not know T supports +. In .NET 7+ you can constrain to INumber<T> (generic math) to use operators.', level: 'Hard' },
    { q: 'What is the output? static T Pick<T>(T a, T b) => b; Console.WriteLine(Pick(3, 7) + Pick("x", "y"));', a: '7y. Pick(3,7) returns 7 (int), Pick("x","y") returns "y"; int + string concatenates to "7y".', level: 'Medium' },
    { q: 'What is the difference between List<object> and List<T>?', a: 'List<object> accepts any type and needs casting on read, with boxing for value types. List<T> is fixed to one type chosen by the caller and is type-safe.', level: 'Easy' },
    { q: 'What is the Repository pattern and why make it generic?', a: 'It is an abstraction over data access with methods like Add, GetById, GetAll, Update, Delete. A generic IRepository<T> avoids writing the same CRUD code for every entity; entity-specific repositories can extend it for special queries.', level: 'Medium' },
    { q: 'Can List<string> be assigned to List<object>?', a: 'No, List<T> is invariant. But IEnumerable<string> can be assigned to IEnumerable<object> because IEnumerable<out T> is covariant.', level: 'Hard' },
    { q: 'Are generics resolved at compile time or runtime in .NET?', a: 'Both. The compiler checks types at compile time and IL contains the generic definition. At runtime the JIT creates specialized code: one shared version for reference types and a separate version per value type.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a generic method PrintArray<T>(T[] arr) that prints each item on its own line with its index. Call it with int[] and string[].',
      hint: 'Use a for loop and Console.WriteLine($"[{i}] {arr[i]}").',
      solution: `using System;

PrintArray(new[] { 10, 20 });
PrintArray(new[] { "A", "B" });

static void PrintArray<T>(T[] arr)
{
    for (int i = 0; i < arr.Length; i++)
        Console.WriteLine($"[{i}] {arr[i]}");
}
// [0] 10
// [1] 20
// [0] A
// [1] B`,
    },
    {
      task: 'Create a generic class Stack2<T> with Push, Pop and Count using a List<T> internally. Pop on empty should throw InvalidOperationException.',
      hint: 'Pop: read the last item, RemoveAt(Count - 1), return it.',
      solution: `using System;
using System.Collections.Generic;

var s = new Stack2<int>();
s.Push(1); s.Push(2);
Console.WriteLine(s.Pop());    // 2
Console.WriteLine(s.Count);    // 1

class Stack2<T>
{
    private readonly List<T> _items = new List<T>();
    public int Count => _items.Count;
    public void Push(T item) => _items.Add(item);
    public T Pop()
    {
        if (_items.Count == 0) throw new InvalidOperationException("Stack is empty");
        T last = _items[_items.Count - 1];
        _items.RemoveAt(_items.Count - 1);
        return last;
    }
}`,
    },
    {
      task: 'Write a generic method Min<T>(List<T> items) where T : IComparable<T> that returns the smallest item. Test with {5, 2, 9} and {"pear", "apple"}.',
      hint: 'Start with items[0] and compare each item using CompareTo.',
      solution: `using System;
using System.Collections.Generic;

Console.WriteLine(Min(new List<int> { 5, 2, 9 }));            // 2
Console.WriteLine(Min(new List<string> { "pear", "apple" }));  // apple

static T Min<T>(List<T> items) where T : IComparable<T>
{
    T min = items[0];
    foreach (T item in items)
        if (item.CompareTo(min) < 0) min = item;
    return min;
}`,
    },
    {
      task: 'Extend the generic repository from Example 4 with an Employee entity (Id, Name, Department) and a method Find(Func<T, bool> predicate) that returns matching items.',
      hint: 'Add IEnumerable<T> Find(Func<T,bool> predicate) to the interface and implement it with _store.Values.Where(predicate).OrderBy(x => x.Id).',
      solution: `// In IRepository<T>:
IEnumerable<T> Find(Func<T, bool> predicate);

// In InMemoryRepository<T>:
public IEnumerable<T> Find(Func<T, bool> predicate)
    => _store.Values.Where(predicate).OrderBy(x => x.Id);

class Employee : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Department { get; set; } = "";
}

// Usage:
IRepository<Employee> emps = new InMemoryRepository<Employee>();
emps.Add(new Employee { Id = 1, Name = "Asha", Department = "IT" });
emps.Add(new Employee { Id = 2, Name = "Ravi", Department = "HR" });
foreach (var e in emps.Find(e => e.Department == "IT"))
    Console.WriteLine(e.Name);   // Asha`,
    },
  ],
  quiz: [
    { question: 'Which keyword introduces a generic constraint?', options: ['where', 'when', 'constraint', 'require'], answer: 0, explanation: 'Constraints are written with where T : ... after the method or class signature.' },
    { question: 'Which constraint allows writing new T() inside a generic method?', options: ['where T : class', 'where T : struct', 'where T : notnull', 'where T : new()'], answer: 3, explanation: 'The new() constraint requires a public parameterless constructor so new T() is allowed.' },
    { question: 'What does default(T) return when T is string?', options: ['""', '0', 'null', 'It does not compile'], answer: 2, explanation: 'string is a reference type, and the default for reference types is null.' },
    { question: 'What is the main performance benefit of List<int> over ArrayList?', options: ['It sorts faster', 'It avoids boxing and unboxing', 'It uses less code', 'It is thread-safe'], answer: 1, explanation: 'List<int> stores ints directly; ArrayList boxes them into objects.' },
    { question: 'Given static T Max<T>(T a, T b) where T : IComparable<T>, which call does NOT compile?', options: ['Max(1, 2)', 'Max("a", "b")', 'Max(new object(), new object())', 'Max(2.5, 1.5)'], answer: 2, explanation: 'object does not implement IComparable<object>, so it violates the constraint.' },
  ],
};
