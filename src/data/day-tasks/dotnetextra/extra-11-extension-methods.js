export default {
  lesson: 'extra-11-extension-methods',
  minutes: 20,
  intro: 'Add new methods to existing types with static extension methods and call them like instance methods.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which rules must an extension method follow? Select all that apply.',
      options: ['It is declared in a **static** class', 'The method itself is **static**', 'The first parameter has the `this` modifier', 'The class must inherit from the type being extended', 'It can access private fields of the extended type'],
      answers: [0, 1, 2],
      explain: 'Extension methods live in a non-generic static class, are static, and mark the extended type with `this` on the first parameter. They do not inherit anything and can only use the **public** members of the type.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the signature so you can write \`"hello world".WordCount()\`:
\`public static int WordCount(______ s)\``,
      example: { title: 'extension on int', code: 'public static bool IsEven(this int n) => n % 2 == 0;' },
      accept: ['this string', 'this String', 'this System.String', 'this string?'],
      caseSensitive: true,
      explain: 'The `this` modifier before the first parameter tells the compiler which type is being extended. Without `this` it is just a normal static method called as `StringExt.WordCount(s)`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'calling an extension', code: `int n = 7;
Console.WriteLine(n.IsEven());   // False` },
      code: `Console.WriteLine("Learn C# in Pune".WordCount());
Console.WriteLine(12500.ToRupees());
Console.WriteLine(7.IsEven());
Console.WriteLine(StrExt.WordCount("a b"));

static class StrExt
{
    public static int WordCount(this string s) =>
        s.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
    public static string ToRupees(this int amount) => "Rs. " + amount;
    public static bool IsEven(this int n) => n % 2 == 0;
}`,
      expected: `4
Rs. 12500
False
2`,
      explain: '"Learn C# in Pune" has 4 words. `12500.ToRupees()` concatenates "Rs. " + 12500. 7 is odd, so `False`. An extension method is still a static method, so `StrExt.WordCount("a b")` also works and returns 2.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A class `Invoice` has an instance method `Print()` and an extension method `Print(this Invoice i)` also exists. What does `inv.Print()` call?',
      options: ['The extension method', 'The instance method', 'Compile error: ambiguous call', 'Both, in order'],
      answer: 1,
      explain: 'Instance methods always win. The compiler looks for extension methods only when no applicable instance method is found, so an extension can never override a class\'s own method.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Extension method on a collection. What does this print?',
      example: { title: 'extending IEnumerable', code: 'public static int Total(this IEnumerable<int> xs) => xs.Sum();' },
      code: `var marks = new List<int> { 35, 72, 40, 18, 90 };
Console.WriteLine(marks.CountPassed(40));
Console.WriteLine(marks.CountPassed(70));
Console.WriteLine(new int[0].CountPassed(10));

static class MarksExt
{
    public static int CountPassed(this IEnumerable<int> xs, int cutoff)
    {
        int c = 0;
        foreach (var x in xs) if (x >= cutoff) c++;
        return c;
    }
}`,
      expected: `3
2
0`,
      explain: 'Marks ≥ 40: 72, 40, 90 → 3. Marks ≥ 70: 72, 90 → 2. An empty array gives 0. Because the method extends `IEnumerable<int>`, it works on lists **and** arrays: this is exactly how LINQ methods like `Where` are built.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Your extension methods are in `namespace Shop.Helpers`. In another file the call `name.ToSlug()` does not compile. Most likely fix?',
      options: ['Make the method `public virtual`', 'Add `using Shop.Helpers;` at the top of the file', 'Inherit from `string`', 'Mark the class `sealed`'],
      answer: 1,
      explain: 'Extension methods are only visible when their namespace is imported with `using`. That is also why `using System.Linq;` is needed for `Where`/`Select`. `string` is sealed, so you could not inherit from it anyway.',
    },
  ],
};
