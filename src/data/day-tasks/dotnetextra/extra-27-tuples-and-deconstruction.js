export default {
  lesson: 'extra-27-tuples-and-deconstruction',
  minutes: 20,
  intro: 'Return multiple values with value tuples, name their elements and deconstruct tuples and objects.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Complete the return type so the method returns a named tuple with \`int Min\` and \`int Max\`:
\`static ______ Range(int[] xs) => (xs.Min(), xs.Max());\``,
      example: { title: 'named tuple return type', code: 'static (string Name, int Age) GetUser() => ("Asha", 21);' },
      accept: ['(int Min, int Max)', '(int Min,int Max)'],
      acceptRegex: ['^\\(\\s*int\\s+Min\\s*,\\s*int\\s+Max\\s*\\)$'],
      caseSensitive: true,
      explain: 'A value-tuple type is written in parentheses with optional element names: `(int Min, int Max)`. Callers can then use `r.Min` and `r.Max` instead of `Item1`/`Item2`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'tuple ToString', code: `var t = (1, "a");
Console.WriteLine(t);   // (1, a)` },
      code: `var r = Stats(new[] { 40, 75, 90, 55 });
Console.WriteLine(r);
Console.WriteLine(r.Avg);
Console.WriteLine(r.Item1);
var (total, avg) = r;
Console.WriteLine(total - avg);

static (int Total, int Avg) Stats(int[] marks) => (marks.Sum(), marks.Sum() / marks.Length);`,
      expected: `(260, 65)
65
260
195`,
      explain: 'Sum = 260, average = 260 / 4 = 65. A tuple prints as `(260, 65)`. Names are aliases: `r.Item1` still works and equals `r.Total`. Deconstruction `var (total, avg) = r;` gives two variables: 260 − 65 = 195.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Swapping and discards. What does this print?',
      example: { title: 'swap without temp', code: '(a, b) = (b, a);' },
      code: `int a = 5, b = 8;
(a, b) = (b, a);
Console.WriteLine($"{a} {b}");

var (name, _, city) = ("Ravi", 22, "Indore");
Console.WriteLine($"{name} from {city}");

var t1 = (Id: 1, Name: "Pen");
var t2 = (1, "Pen");
Console.WriteLine(t1 == t2);`,
      expected: `8 5
Ravi from Indore
True`,
      explain: 'Tuple assignment swaps the values without a temp variable. `_` discards the age. Tuples compare element by element (names do not matter), so `(1, "Pen") == (1, "Pen")` is True.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Add the method that lets \`var (name, marks) = student;\` work on a class \`Student\`:
\`public void ______(out string name, out int marks) { name = Name; marks = Marks; }\``,
      example: { title: 'deconstructing a custom type', code: `public void Deconstruct(out int x, out int y) { x = X; y = Y; }
var (x, y) = point;` },
      accept: ['Deconstruct'],
      caseSensitive: true,
      explain: 'The compiler looks for a method named exactly `Deconstruct` with `out` parameters. Positional records generate it automatically.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE about `(int, string)` value tuples? Select all that apply.',
      options: ['They are value types (`System.ValueTuple`)', 'Their elements are mutable fields', 'Element names exist at runtime and can be read with reflection', 'They are a good way to return 2-3 related values from a private method', 'They are the best choice for public API models with many fields'],
      answers: [0, 1, 3],
      explain: 'Value tuples are mutable structs. Element names are compile-time only (at runtime they are Item1, Item2...). They are ideal for small internal results; for public models with many fields a record or class is clearer.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Iterating a dictionary with deconstruction. What does this print?',
      example: { title: 'deconstruct KeyValuePair', code: 'foreach (var (key, value) in dict) { ... }' },
      code: `var stock = new List<(string Item, int Qty)> { ("Rice", 50), ("Dal", 8), ("Oil", 3) };
foreach (var (item, qty) in stock)
    if (qty < 10) Console.WriteLine($"{item}: reorder");
var low = stock.Where(s => s.Qty < 10).Select(s => s.Item);
Console.WriteLine(string.Join("+", low));
Console.WriteLine(stock.Sum(s => s.Qty));`,
      expected: `Dal: reorder
Oil: reorder
Dal+Oil
61`,
      explain: 'Each tuple is deconstructed into `item` and `qty` in the loop. Dal (8) and Oil (3) are below 10. Named elements work in LINQ (`s.Qty`, `s.Item`). Total = 50 + 8 + 3 = 61.',
    },
  ],
};
