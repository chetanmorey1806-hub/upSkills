export default {
  lesson: 'extra-19-lambda-expressions',
  minutes: 20,
  intro: 'Write expression and statement lambdas, use them with LINQ and understand variable capture.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Write a lambda that returns the square of a number:
\`Func<int, int> square = ______;\``,
      example: { title: 'expression lambda', code: 'Func<int, bool> isEven = n => n % 2 == 0;' },
      accept: ['x => x * x', 'n => n * n', 'x => x*x', '(x) => x * x', '(int x) => x * x', 'n => n*n', '(n) => n * n', '(int n) => n * n'],
      acceptRegex: ['^\\(?\\s*(int\\s+)?(\\w+)\\s*\\)?\\s*=>\\s*\\2\\s*\\*\\s*\\2\\s*;?$', '^\\(?\\s*(int\\s+)?(\\w+)\\s*\\)?\\s*=>\\s*Math\\.Pow\\s*\\(\\s*\\2\\s*,\\s*2\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: '`x => x * x`: parameters on the left of `=>`, the result expression on the right. The parameter type is inferred from `Func<int, int>`. (`Math.Pow` returns a double, so it would actually need a cast here.)',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'statement lambda', code: `Func<int, string> grade = m =>
{
    if (m >= 60) return "First";
    return "Second";
};` },
      code: `Func<int, int, int> add = (a, b) => a + b;
Func<string, string> shout = s => s.ToUpper() + "!";
Func<int, string> band = m =>
{
    if (m >= 75) return "Distinction";
    if (m >= 40) return "Pass";
    return "Fail";
};
Console.WriteLine(add(15, 27));
Console.WriteLine(shout("jai hind"));
Console.WriteLine(band(80));
Console.WriteLine(band(39));`,
      expected: `42
JAI HIND!
Distinction
Fail`,
      explain: 'Expression lambdas return their expression; statement lambdas use `{ }` and `return`. 15 + 27 = 42; "jai hind" upper-cased plus "!"; 80 ≥ 75 → Distinction; 39 < 40 → Fail.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Lambdas with LINQ. What does this print?',
      example: { title: 'lambda in Where/Select', code: 'var cheap = items.Where(i => i.Price < 100).Select(i => i.Name);' },
      code: `var salaries = new List<int> { 32000, 58000, 41000, 75000, 26000 };
var raised = salaries.Where(s => s < 50000).Select(s => s + s / 10).ToList();
Console.WriteLine(string.Join(" ", raised));
Console.WriteLine(salaries.Count(s => s > 40000));
Console.WriteLine(salaries.Any(s => s > 80000));`,
      expected: `35200 45100 28600
3
False`,
      explain: 'Salaries below 50000 are 32000, 41000, 26000; each gets +10% (integer division by 10): 35200, 45100, 28600. Three salaries exceed 40000 (58000, 41000, 75000). None exceed 80000.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Variable **capture** (closures). What does this print?',
      example: { title: 'lambda captures the variable, not the value', code: `int x = 1;
Func<int> f = () => x;
x = 5;
Console.WriteLine(f());  // 5` },
      code: `int counter = 0;
Action inc = () => counter++;
inc(); inc(); inc();
Console.WriteLine(counter);

int rate = 10;
Func<int, int> tax = amt => amt * rate / 100;
Console.WriteLine(tax(500));
rate = 18;
Console.WriteLine(tax(500));`,
      expected: `3
50
90`,
      explain: 'Lambdas capture **variables**, not copies of values. `inc` changes the real `counter` (3). `tax` reads `rate` when it runs: 10% of 500 = 50, then after `rate = 18` it gives 90. Forgetting this causes surprising bugs in loops and event handlers.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are valid C# lambdas? Select all that apply.',
      options: ['`() => Console.WriteLine("hi")`', '`x => x > 0`', '`(a, b) => a * b`', '`x, y => x + y`', '`static n => n + 1` (C# 9+)'],
      answers: [0, 1, 2, 4],
      explain: 'Zero parameters need `()`; one parameter can drop the parentheses; two or more parameters **must** be in parentheses, so `x, y => x + y` is invalid. `static` lambdas (no capture allowed) are valid from C# 9.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does the `=>` symbol mean in `n => n % 2 == 0`?',
      options: ['Greater than or equal', 'Lambda operator: "goes to" (parameters on the left, body on the right)', 'Assignment', 'Pointer access'],
      answer: 1,
      explain: '`=>` separates the parameter list from the body. It is not a comparison: `>=` is greater-than-or-equal.',
    },
  ],
};
