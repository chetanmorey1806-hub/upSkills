export default {
  lesson: 'day-029-collections',
  minutes: 18,
  intro: 'Practise the main C# collections: ArrayList vs List<T>, Dictionary, HashSet, Queue and Stack, and which one fits which problem.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'List<T> operations: what does this print?',
      example: { title: 'List basics', code: 'var cities = new List<string> { "Pune" };\ncities.Add("Goa");\nConsole.WriteLine(cities.Count);  // 2' },
      code: `var courses = new List<string> { "C#", "SQL", "HTML" };
courses.Add("React");
courses.Insert(1, "LINQ");
courses.Remove("HTML");
Console.WriteLine(courses.Count);
Console.WriteLine(courses[1]);
Console.WriteLine(string.Join(", ", courses));
Console.WriteLine(courses.Contains("html"));`,
      expected: `4
LINQ
C#, LINQ, SQL, React
False`,
      explain: '`Insert(1, ...)` puts LINQ at index 1 and shifts the rest. `Remove("HTML")` deletes the first match. `Contains` is **case-sensitive** for strings, so "html" is not found.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Dictionary<int, string>: roll number → name. What does this print?',
      example: { title: 'safe lookup', code: 'if (dict.TryGetValue(5, out var name))\n    Console.WriteLine(name);\nelse\n    Console.WriteLine("Not found");' },
      code: `var students = new Dictionary<int, string>();
students.Add(101, "Asha");
students.Add(102, "Ravi");
students[103] = "Meena";
students[102] = "Ravi Kumar";
Console.WriteLine(students.Count);
Console.WriteLine(students[102]);
Console.WriteLine(students.ContainsKey(104));
if (students.TryGetValue(104, out string name))
    Console.WriteLine(name);
else
    Console.WriteLine("Roll 104 not found");`,
      expected: `3
Ravi Kumar
False
Roll 104 not found`,
      explain: 'The indexer `dict[key] = value` adds a new key **or replaces** an existing value (102 is updated, not duplicated). `Add` with an existing key would throw ArgumentException. `TryGetValue` avoids KeyNotFoundException for missing keys.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'HashSet, Queue and Stack: what does this print?',
      example: { title: 'FIFO vs LIFO', code: 'Queue: Enqueue A, B → Dequeue gives A (first in, first out)\nStack: Push A, B → Pop gives B (last in, first out)' },
      code: `var tags = new HashSet<string> { "csharp", "dotnet" };
Console.WriteLine(tags.Add("sql"));
Console.WriteLine(tags.Add("csharp"));
Console.WriteLine(tags.Count);

var counter = new Queue<string>();
counter.Enqueue("Token1");
counter.Enqueue("Token2");
counter.Enqueue("Token3");
Console.WriteLine(counter.Dequeue());

var undo = new Stack<string>();
undo.Push("type A");
undo.Push("bold");
undo.Push("delete");
Console.WriteLine(undo.Pop());
Console.WriteLine(undo.Peek());`,
      expected: `True
False
3
Token1
delete
bold`,
      explain: '`HashSet.Add` returns **false** for a duplicate, so the count stays 3. A **Queue** is FIFO (ticket counter: first token served first). A **Stack** is LIFO (undo: last action undone first). `Peek` reads the top without removing it.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is `List<int>` preferred over the old `ArrayList` in modern C#?',
      options: [
        'ArrayList cannot grow',
        'List<int> is type-safe (only ints allowed, checked at compile time) and avoids boxing',
        'ArrayList is faster',
        'List<int> can store any type',
      ],
      answer: 1,
      explain: '`ArrayList` stores `object`, so you can add mixed types by mistake, you need casts when reading, and every int is **boxed**. `List<T>` is generic: type-safe, no casts, no boxing.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the problem with the right collection. Which pairs are good choices? (choose all that apply)',
      options: [
        'Look up a product by its code quickly → Dictionary<string, Product>',
        'Store unique email addresses → HashSet<string>',
        'Browser back button history → Queue<string>',
        'Print jobs processed in arrival order → Queue<Job>',
        'Ordered list of marks that can contain duplicates → List<int>',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Back-button history is **last-in-first-out**, so it needs a `Stack`, not a Queue. Dictionary gives fast key lookup, HashSet rejects duplicates, Queue keeps arrival order, and List keeps order with duplicates.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Create an empty dictionary named `stock` that maps a product name (`string`) to its quantity (`int`). Write the full statement.',
      example: { title: 'creating generic collections', code: 'var names = new List<string>();\nvar ids = new HashSet<int>();' },
      accept: ['var stock = new Dictionary<string, int>();', 'Dictionary<string, int> stock = new Dictionary<string, int>();', 'Dictionary<string, int> stock = new();'],
      acceptRegex: ['^(var|Dictionary\\s*<\\s*string\\s*,\\s*int\\s*>)\\s+stock\\s*=\\s*new\\s+Dictionary\\s*<\\s*string\\s*,\\s*int\\s*>\\s*\\(\\s*\\)\\s*;?$', '^Dictionary\\s*<\\s*string\\s*,\\s*int\\s*>\\s+stock\\s*=\\s*new\\s*\\(\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: 'The type arguments are `<TKey, TValue>`: here `<string, int>`. Keys must be unique; values can repeat. Writing `<int, string>` reverses the meaning.',
    },
  ],
};
