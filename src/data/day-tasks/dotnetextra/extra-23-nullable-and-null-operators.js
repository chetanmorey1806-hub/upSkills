export default {
  lesson: 'extra-23-nullable-and-null-operators',
  minutes: 20,
  intro: 'Handle missing values safely with nullable types and the ?., ??, ??= and ! operators.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Declare a nullable integer \`bonus\` that starts with no value:
\`______ bonus = null;\``,
      example: { title: 'nullable value type', code: 'DateTime? joinedOn = null;' },
      accept: ['int?', 'Nullable<int>', 'System.Nullable<int>'],
      caseSensitive: true,
      explain: '`int?` (short for `Nullable<int>`) lets a value type hold `null`. A plain `int` can never be null, so `int bonus = null;` is a compile error.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'null-coalescing', code: `string? city = null;
Console.WriteLine(city ?? "Unknown");   // Unknown` },
      code: `int? marks = null;
Console.WriteLine(marks.HasValue);
Console.WriteLine(marks ?? 0);
Console.WriteLine(marks.GetValueOrDefault(35));
marks = 72;
Console.WriteLine(marks.Value + 3);
Console.WriteLine(marks ?? 0);`,
      expected: `False
0
35
75
72`,
      explain: 'While null, `HasValue` is False, `?? 0` gives 0 and `GetValueOrDefault(35)` gives 35. After `marks = 72`, `.Value` returns 72 (+3 = 75) and `??` returns the real value 72.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Null-conditional operator `?.`. What does this print?',
      example: { title: 'safe navigation', code: `int? len = name?.Length;   // null if name is null` },
      code: `Customer? c1 = new Customer { Name = "Asha", Address = new Address { City = "Nagpur" } };
Customer? c2 = new Customer { Name = "Ravi" };
Customer? c3 = null;

Console.WriteLine(c1?.Address?.City ?? "N/A");
Console.WriteLine(c2?.Address?.City ?? "N/A");
Console.WriteLine(c3?.Name ?? "Guest");
Console.WriteLine(c3?.Name?.Length == null);

class Address { public string? City { get; set; } }
class Customer { public string? Name { get; set; } public Address? Address { get; set; } }`,
      expected: `Nagpur
N/A
Guest
True`,
      explain: '`?.` stops and returns null as soon as the left side is null, instead of throwing NullReferenceException. Ravi has no address → null → "N/A". `c3` is null → "Guest", and the whole chain `c3?.Name?.Length` is null.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Assign a new list to \`_cache\` **only if it is currently null** (one operator):
\`_cache ______ new List<string>();\``,
      example: { title: 'null-coalescing assignment', code: 'name ??= "Guest";   // set only when name is null' },
      accept: ['??='],
      explain: '`a ??= b` assigns `b` only when `a` is null; it is short for `if (a == null) a = b;`. Plain `=` would overwrite an existing list every time.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'With `<Nullable>enable</Nullable>` (nullable reference types) on, which statements are TRUE? Select all that apply.',
      options: ['`string s = null;` produces a compiler **warning**', '`string? s = null;` is fine', 'The null-forgiving operator `s!` tells the compiler "trust me, this is not null"', 'Nullable reference types change the runtime type of `string`', '`s!` checks for null at runtime and throws'],
      answers: [0, 1, 2],
      explain: 'Nullable reference types are a compile-time analysis: `string` means "should not be null", `string?` means "may be null". `!` only silences the warning; it adds no runtime check, so a real null still crashes later.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`int? a = null; int b = a;` What happens?',
      options: ['b becomes 0', 'Compile error: cannot implicitly convert int? to int', 'b becomes null', 'Runtime exception'],
      answer: 1,
      explain: 'Converting `int?` to `int` could lose the null, so it needs an explicit choice: `a ?? 0`, `a.GetValueOrDefault()` or `(int)a` / `a.Value` (which throw if a is null).',
    },
  ],
};
