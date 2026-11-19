export default {
  lesson: 'extra-26-enum-and-flags',
  minutes: 20,
  intro: 'Use enums for named constants, convert them to/from numbers and strings, and combine options with [Flags].',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'enum values', code: `enum Size { Small, Medium, Large }   // 0, 1, 2
Console.WriteLine((int)Size.Large);   // 2` },
      code: `var s = OrderStatus.Shipped;
Console.WriteLine(s);
Console.WriteLine((int)s);
Console.WriteLine((OrderStatus)1);
Console.WriteLine((int)OrderStatus.Cancelled);
Console.WriteLine(s > OrderStatus.Placed);

enum OrderStatus { Placed, Packed, Shipped, Delivered = 10, Cancelled }`,
      expected: `Shipped
2
Packed
11
True`,
      explain: 'Enum members start at 0 and count up: Placed 0, Packed 1, Shipped 2. `Delivered = 10` resets the counter, so `Cancelled` is 11. Printing an enum shows its **name**; casting to int shows the number. Enums compare by their numeric values.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Convert the string \`"Delivered"\` to an \`OrderStatus\` (generic method, .NET Core+):
\`var st = ______("Delivered");\``,
      example: { title: 'safe parsing', code: 'if (Enum.TryParse<OrderStatus>(input, out var st)) { ... }' },
      accept: ['Enum.Parse<OrderStatus>', 'System.Enum.Parse<OrderStatus>'],
      caseSensitive: true,
      explain: '`Enum.Parse<T>(string)` converts a name to the enum value and throws if it does not exist. For user input prefer `Enum.TryParse<T>(text, out var value)`, which returns false instead of throwing.',
    },
    {
      type: 'output',
      mins: 4,
      q: '[Flags] enums combine options with bitwise OR. What does this print?',
      example: { title: 'flags use powers of two', code: `[Flags] enum Days { None = 0, Mon = 1, Tue = 2, Wed = 4 }
var d = Days.Mon | Days.Wed;   // value 5` },
      code: `var p = Permission.Read | Permission.Write;
Console.WriteLine(p);
Console.WriteLine((int)p);
Console.WriteLine(p.HasFlag(Permission.Write));
Console.WriteLine(p.HasFlag(Permission.Delete));
p |= Permission.Delete;
p &= ~Permission.Write;
Console.WriteLine(p);

[Flags]
enum Permission { None = 0, Read = 1, Write = 2, Delete = 4 }`,
      expected: `Read, Write
3
True
False
Read, Delete`,
      explain: 'With `[Flags]`, `ToString()` lists the set flags: "Read, Write" (1 | 2 = 3). `HasFlag` tests one bit. `|=` adds Delete (7), and `&= ~Write` clears the Write bit, leaving Read and Delete (5).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why must [Flags] members use values like 1, 2, 4, 8 instead of 1, 2, 3, 4?',
      options: ['Because enums cannot store 3', 'Each flag needs its own bit so combinations do not overlap (3 would be the same as 1 | 2)', 'It is only a naming convention', 'Because C# enums are signed'],
      answer: 1,
      explain: 'Flags are combined with bitwise OR. If `Delete = 3`, then `Read | Write` (3) would be indistinguishable from `Delete`. Powers of two (or `1 << n`) give every option a separate bit.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about enums are TRUE? Select all that apply.',
      options: ['The default underlying type is `int`', 'You can choose another type, e.g. `enum Level : byte`', '`(OrderStatus)99` compiles even if 99 is not a defined member', 'Enum members can have methods inside the enum body', '`Enum.GetValues<OrderStatus>()` returns all members'],
      answers: [0, 1, 2, 4],
      explain: 'Enums are `int` by default but can use other integral types. Casting any number compiles (use `Enum.IsDefined` to validate). C# enums cannot contain methods; add behaviour with extension methods instead.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Add the Write permission to an existing variable \`perms\` (bitwise, one operator):
\`perms ______ Permission.Write;\``,
      example: { title: 'removing a flag', code: 'perms &= ~Permission.Delete;' },
      accept: ['|='],
      explain: '`|=` sets the bit for Write while keeping the others. `=` would replace all permissions, and `+=` breaks if Write is already set (it would add 2 again and change other bits).',
    },
  ],
};
