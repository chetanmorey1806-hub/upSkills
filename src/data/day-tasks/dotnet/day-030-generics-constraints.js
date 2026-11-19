export default {
  lesson: 'day-030-generics-constraints',
  minutes: 18,
  intro: 'Practise generic methods and classes (type parameters like T), default(T) and generic constraints with where.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'A generic Swap method: what does this print?',
      example: { title: 'generic method', code: 'static void PrintTwice<T>(T value)\n{\n    Console.WriteLine(value);\n    Console.WriteLine(value);\n}' },
      code: `int a = 1, b = 2;
Swap(ref a, ref b);
string x = "left", y = "right";
Swap<string>(ref x, ref y);
Console.WriteLine($"{a} {b}");
Console.WriteLine($"{x} {y}");

static void Swap<T>(ref T first, ref T second)
{
    T temp = first;
    first = second;
    second = temp;
}`,
      expected: `2 1
right left`,
      explain: 'One generic method works for any type: the compiler **infers** `T = int` from the arguments, or you can write it explicitly (`Swap<string>`). `ref` makes the swap visible to the caller.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A generic class and `default(T)`: what does this print?',
      example: { title: 'generic class', code: 'class Box<T>\n{\n    public T Item;\n}\nvar b = new Box<int> { Item = 5 };' },
      code: `var marks = new Box<int>();
var name = new Box<string>();
var flag = new Box<bool>();
Console.WriteLine(marks.Item);
Console.WriteLine(name.Item == null);
Console.WriteLine(flag.Item);
marks.Item = 88;
Console.WriteLine(marks.Describe());

class Box<T>
{
    public T Item = default(T);
    public string Describe() => $"Box<{typeof(T).Name}> holds {Item}";
}`,
      expected: `0
True
False
Box<Int32> holds 88`,
      explain: '`default(T)` is 0 for numbers, false for bool and null for reference types like string. `typeof(T).Name` gives the .NET type name: `int` is `Int32`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the constraint so `T` can only be a **reference type** (a class):\n`class Repository<T> ________ { }`',
      example: { title: 'constraint syntax', code: 'class Calculator<T> where T : struct { }' },
      accept: ['where T : class', 'where T: class', 'where T :class'],
      acceptRegex: ['^where\\s+T\\s*:\\s*class\\??$'],
      caseSensitive: true,
      explain: '`where T : class` restricts T to reference types; `where T : struct` to non-nullable value types; `where T : new()` requires a public parameterless constructor; `where T : IComparable<T>` requires an interface.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Constraint `IComparable<T>` lets you compare T values. What does this print?',
      example: { title: 'CompareTo', code: '5.CompareTo(3)   // > 0 (5 is bigger)\n"a".CompareTo("b") // < 0' },
      code: `Console.WriteLine(Max(12, 45));
Console.WriteLine(Max("Mango", "Apple"));
Console.WriteLine(Max(2.5, -1.0));

static T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) >= 0 ? a : b;
}`,
      expected: `45
Mango
2.5`,
      explain: 'Without the constraint, the compiler would not let you call `CompareTo` on an unknown T. With `where T : IComparable<T>`, int, string and double all work. Strings compare alphabetically, so "Mango" > "Apple".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are benefits of generics? (choose all that apply)',
      options: [
        'Type safety: errors are caught at compile time',
        'No boxing for value types like List<int>',
        'Code reuse: one class/method for many types',
        'Generics let a variable change its type at runtime',
        'No casting needed when reading items',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Generics give reusable, type-safe code without casts or boxing. They do **not** make types dynamic: `List<int>` can only ever hold ints. (That is what `dynamic` / `object` would do, with all their risks.)',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'With `class Factory<T> where T : new()`, which line is now allowed inside the class?',
      options: ['T item = new T();', 'T item = null;', 'T item = T.Create();', 'int x = T.Length;'],
      answer: 0,
      explain: 'The `new()` constraint guarantees T has a public parameterless constructor, so `new T()` compiles. `null` would need `where T : class`, and you cannot call arbitrary members on T without a matching constraint.',
    },
  ],
};
