export default {
  lesson: 'extra-15-generic-methods',
  minutes: 20,
  intro: 'Write generic methods with type inference and constraints that work for many types.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Complete the generic method signature that swaps two variables of any type:
\`public static void ______(ref T a, ref T b)\``,
      example: { title: 'generic method declaration', code: 'public static T First<T>(List<T> items) => items[0];' },
      accept: ['Swap<T>'],
      acceptRegex: ['^Swap\\s*<\\s*T\\s*>$'],
      caseSensitive: true,
      explain: 'The type parameter list `<T>` comes right after the method name. Without it, `T` is an unknown type and the method does not compile.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'type inference', code: `Print(5);        // T inferred as int
Print("hi");     // T inferred as string` },
      code: `int x = 3, y = 9;
Swap(ref x, ref y);
Console.WriteLine($"{x} {y}");

string p = "Pune", q = "Goa";
Swap(ref p, ref q);
Console.WriteLine($"{p} {q}");
Console.WriteLine(Describe(4.5));
Console.WriteLine(Describe('A'));

static void Swap<T>(ref T a, ref T b) { T t = a; a = b; b = t; }
static string Describe<T>(T v) => $"{v} is {typeof(T).Name}";`,
      expected: `9 3
Goa Pune
4.5 is Double
A is Char`,
      explain: 'The compiler **infers** `T` from the arguments: int, string, double, char. `Swap` exchanges the values through `ref`. `typeof(T).Name` prints the CLR names `Double` and `Char`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`static T Max<T>(T a, T b) => a > b ? a : b;` does not compile. Why?',
      options: ['Generic methods cannot return T', 'The `>` operator is not known for an unconstrained T; add `where T : IComparable<T>` and use `CompareTo`', 'Ternary operators are not allowed in generic methods', 'T must be declared as `object`'],
      answer: 1,
      explain: 'For an unconstrained `T` the compiler only knows `object` members. With `where T : IComparable<T>` you can write `a.CompareTo(b) > 0 ? a : b`. (In .NET 7+ generic math interfaces like `INumber<T>` also allow operators.)',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Generic method with a constraint. What does this print?',
      example: { title: 'generic Max', code: 'static T Max<T>(T a, T b) where T : IComparable<T> => a.CompareTo(b) >= 0 ? a : b;' },
      code: `Console.WriteLine(MaxOf(new[] { 12, 7, 45, 3 }));
Console.WriteLine(MaxOf(new[] { "mango", "apple", "banana" }));
Console.WriteLine(CountIf(new[] { 5, 10, 15, 20 }, n => n > 8));

static T MaxOf<T>(T[] items) where T : IComparable<T>
{
    T best = items[0];
    foreach (var i in items) if (i.CompareTo(best) > 0) best = i;
    return best;
}
static int CountIf<T>(IEnumerable<T> items, Func<T, bool> test)
{
    int c = 0;
    foreach (var i in items) if (test(i)) c++;
    return c;
}`,
      expected: `45
mango
3`,
      explain: 'The largest int is 45; the alphabetically last string is "mango". `CountIf` counts 10, 15 and 20 (greater than 8) → 3. Generic methods + a delegate parameter is how LINQ\'s `Count(predicate)` works.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Call the generic method **explicitly** with \`T\` = \`decimal\`:
\`var price = Parse______("199.50");\``,
      example: { title: 'explicit type argument', code: 'var list = CreateList<string>();  // T cannot be inferred from no arguments' },
      accept: ['<decimal>', '<Decimal>', '<System.Decimal>'],
      caseSensitive: true,
      explain: 'When `T` cannot be inferred from arguments (here the argument is always a string), write the type argument yourself: `Parse<decimal>("199.50")`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are generic methods from the .NET base library? Select all that apply.',
      options: ['`Array.Empty<T>()`', '`Enumerable.Where<TSource>(...)`', '`Console.WriteLine(string)`', '`JsonSerializer.Deserialize<T>(json)`', '`Math.Max(int, int)`'],
      answers: [0, 1, 3],
      explain: '`Array.Empty<T>`, LINQ `Where<TSource>` and `JsonSerializer.Deserialize<T>` all take type parameters. `Console.WriteLine(string)` and `Math.Max(int, int)` are ordinary overloads with fixed types.',
    },
  ],
};
