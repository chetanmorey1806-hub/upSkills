export default {
  lesson: 'extra-14-generic-classes',
  minutes: 25,
  intro: 'Write type-safe reusable classes with type parameters, constraints and default(T).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main benefit of `List<int>` over the old non-generic `ArrayList`?',
      options: ['It can store any type mixed together', 'Type safety at compile time and no boxing of value types', 'It is always sorted', 'It uses less code to declare'],
      answer: 1,
      explain: 'Generics give compile-time type checks (you cannot add a string to `List<int>`) and store value types without boxing them into `object`, which is faster. `ArrayList` stores everything as `object`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Declare a generic class \`Box\` with one type parameter \`T\`:
\`public class ______\``,
      example: { title: 'two type parameters', code: 'public class Pair<TKey, TValue> { public TKey Key; public TValue Value; }' },
      accept: ['Box<T>'],
      acceptRegex: ['^Box\\s*<\\s*T\\s*>\\s*\\{?$'],
      caseSensitive: true,
      explain: 'The type parameter list goes in angle brackets after the class name: `Box<T>`. Inside the class `T` can be used as a field, property, parameter or return type.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'default(T)', code: `default(int)    → 0
default(string) → null
default(bool)   → false` },
      code: `var a = new Box<int>();
var b = new Box<string>();
var c = new Box<double>(2.5);
Console.WriteLine(a.Value);
Console.WriteLine(b.Value == null);
Console.WriteLine(c.Value * 2);
Console.WriteLine(a.TypeName());

class Box<T>
{
    public T? Value { get; }
    public Box() { Value = default; }
    public Box(T v) { Value = v; }
    public string TypeName() => typeof(T).Name;
}`,
      expected: `0
True
5
Int32`,
      explain: '`default` for `int` is 0 and for `string` is null. 2.5 × 2 = 5.0, which C# prints as **5** (no ".0"). `typeof(T).Name` gives the CLR type name `Int32`, not the C# alias `int`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which generic constraints are valid C#? Select all that apply.',
      options: ['`where T : class`', '`where T : struct`', '`where T : new()`', '`where T : IComparable<T>`', '`where T : int`'],
      answers: [0, 1, 2, 3],
      explain: '`class` (reference type), `struct` (value type), `new()` (public parameterless constructor) and an interface are all valid. `int` is a sealed struct, so it cannot be a constraint; use `struct` or a specific interface instead.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `A repository must only accept entity classes that implement \`IEntity\` and can be created with \`new T()\`. Complete the constraint:
\`public class Repository<T> where T : ______\``,
      example: { title: 'combining constraints', code: 'public class Cache<T> where T : class, new()' },
      accept: ['IEntity, new()', 'class, IEntity, new()'],
      acceptRegex: ['^(class\\s*,\\s*)?IEntity\\s*,\\s*new\\s*\\(\\s*\\)$'],
      caseSensitive: true,
      explain: 'Constraints are comma-separated and `new()` must come **last**. With `IEntity` the class can use `entity.Id`, and with `new()` it can write `new T()`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A generic class with a constraint. What does this print?',
      example: { title: 'using an interface member through T', code: 'public T Bigger(T a, T b) => a.CompareTo(b) >= 0 ? a : b;  // needs where T : IComparable<T>' },
      code: `var marks = new TopTracker<int>();
foreach (var m in new[] { 45, 88, 67, 92, 30 }) marks.Add(m);
Console.WriteLine(marks.Best);
Console.WriteLine(marks.Count);

var names = new TopTracker<string>();
names.Add("Ravi"); names.Add("Asha"); names.Add("Zoya"); names.Add("Meera");
Console.WriteLine(names.Best);

class TopTracker<T> where T : IComparable<T>
{
    public T? Best { get; private set; }
    public int Count { get; private set; }
    public void Add(T item)
    {
        if (Count == 0 || item.CompareTo(Best!) > 0) Best = item;
        Count++;
    }
}`,
      expected: `92
5
Zoya`,
      explain: 'The constraint `IComparable<T>` lets the class call `CompareTo`. For ints the biggest is 92 out of 5 items; for strings comparison is alphabetical, so "Zoya" is the largest. One class works for both types.',
    },
  ],
};
