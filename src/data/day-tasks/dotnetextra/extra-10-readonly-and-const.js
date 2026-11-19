export default {
  lesson: 'extra-10-readonly-and-const',
  minutes: 20,
  intro: 'Choose between const (compile-time constant) and readonly (set once at runtime) for fixed values.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which value can be declared as `const` in C#?',
      options: ['`DateTime.Now`', '`new List<int>()`', '`3.14159`', '`Guid.NewGuid()`'],
      answer: 2,
      explain: '`const` values must be known at **compile time**: numeric literals, strings, bools, chars, enums or null. Values computed at runtime (`DateTime.Now`, `new ...`, method calls) need `readonly` or `static readonly`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['A `const` field is implicitly static', 'A `readonly` field can be assigned in the constructor', 'A `readonly` field can be assigned in any method', '`readonly` values can differ for each object', 'You write `static const` to share a constant'],
      answers: [0, 1, 3],
      explain: '`const` is automatically static (writing `static const` is an error). `readonly` fields are set at declaration or in a constructor, so each object can get its own value. Assigning a readonly field in a normal method is a compile error.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Declare a field that is fixed per object but set in the constructor:
\`private ______ string _accountNo;\``,
      example: { title: 'readonly set in constructor', code: `private readonly DateTime _created;
public Order() { _created = DateTime.Now; }` },
      accept: ['readonly'],
      caseSensitive: true,
      explain: 'Each account has a different number, known only when the object is created, so it must be `readonly`. `const` would require the same compile-time value for every object.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'const in an expression', code: `const int Days = 7;
Console.WriteLine(Days * 2);  // 14` },
      code: `var a = new Ticket(500);
var b = new Ticket(1200);
Console.WriteLine(a.WithGst());
Console.WriteLine(b.WithGst());
Console.WriteLine(Ticket.GstPercent);

class Ticket
{
    public const int GstPercent = 12;
    private readonly int _fare;
    public Ticket(int fare) { _fare = fare; }
    public int WithGst() => _fare + _fare * GstPercent / 100;
}`,
      expected: `560
1344
12`,
      explain: '500 + 500×12/100 = 500 + 60 = 560. 1200 + 144 = 1344. Each ticket has its own readonly fare, while the const `GstPercent` is shared and accessed through the class name `Ticket.GstPercent`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`private readonly List<string> _names = new();` Which line compiles inside a normal method?',
      options: ['`_names = new List<string>();`', '`_names.Add("Asha");`', '`_names = null;`', 'None of them'],
      answer: 1,
      explain: '`readonly` protects the **reference**, not the object. You cannot point `_names` at a new list, but you can still modify the existing list with `Add`. Use `IReadOnlyList` or `ImmutableList` for an unchangeable collection.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `A shared value computed at startup (not a compile-time literal). Complete the modifiers:
\`public ______ TimeSpan SessionTimeout = TimeSpan.FromMinutes(20);\``,
      example: { title: 'shared runtime constant', code: 'public static readonly DateTime StartedAt = DateTime.Now;' },
      accept: ['static readonly', 'readonly static'],
      caseSensitive: true,
      explain: '`TimeSpan.FromMinutes(20)` is a method call, so it cannot be `const`. `static readonly` gives one shared, never-reassigned value initialised at runtime.',
    },
  ],
};
