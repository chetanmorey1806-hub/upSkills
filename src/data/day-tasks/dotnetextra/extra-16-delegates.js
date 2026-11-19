export default {
  lesson: 'extra-16-delegates',
  minutes: 20,
  intro: 'Declare delegate types, point them at methods and pass behaviour into other methods.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is a **delegate** in C#?',
      options: ['A class that inherits from two classes', 'A type-safe reference to a method with a specific signature', 'A thread that runs in the background', 'A keyword to call the base class constructor'],
      answer: 1,
      explain: 'A delegate type describes a method signature (parameters + return type). A delegate variable can hold any method matching it and invoke it later, which lets you pass behaviour around like data.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Declare a delegate type \`DiscountRule\` that takes a \`decimal\` amount and returns a \`decimal\`:
\`public ______;\``,
      example: { title: 'delegate declaration', code: 'public delegate bool Validator(string input);' },
      accept: ['delegate decimal DiscountRule(decimal amount)'],
      acceptRegex: ['^delegate\\s+decimal\\s+DiscountRule\\s*\\(\\s*decimal\\s+\\w+\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: 'The syntax is `delegate ReturnType Name(parameters)`. Any method with the same parameter and return types, like `decimal Festival(decimal a)`, can be assigned to it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'assign and invoke', code: `Operation op = Add;
Console.WriteLine(op(2, 3));  // 5` },
      code: `Calc op = Add;
Console.WriteLine(op(10, 4));
op = Multiply;
Console.WriteLine(op(10, 4));
op = (a, b) => a - b;
Console.WriteLine(op.Invoke(10, 4));
Console.WriteLine(Apply(7, 3, Add));

static int Add(int a, int b) => a + b;
static int Multiply(int a, int b) => a * b;
static int Apply(int a, int b, Calc f) => f(a, b) * 2;

delegate int Calc(int a, int b);`,
      expected: `14
40
6
20`,
      explain: 'The same delegate variable points first to `Add` (14), then `Multiply` (40), then a lambda (10 − 4 = 6). `op(...)` and `op.Invoke(...)` are identical. `Apply` receives `Add` as a parameter: (7 + 3) × 2 = 20.',
    },
    {
      type: 'multi',
      mins: 2,
      q: '`delegate bool Check(int n);` Which methods can be assigned to a `Check` variable? Select all that apply.',
      options: ['`static bool IsEven(int x) => x % 2 == 0;`', '`static bool IsAdult(int age) => age >= 18;`', '`static int Square(int x) => x * x;`', '`static bool IsLong(string s) => s.Length > 5;`', '`n => n > 100` (lambda)'],
      answers: [0, 1, 4],
      explain: 'Only the signature matters, not the names: one `int` parameter and a `bool` result. `Square` returns `int` and `IsLong` takes a `string`, so they do not match.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Passing a delegate to filter data. What does this print?',
      example: { title: 'behaviour as a parameter', code: 'static List<int> Filter(List<int> xs, Check rule) { ... if (rule(x)) ... }' },
      code: `var fees = new List<int> { 1200, 450, 3000, 800, 2500 };
Print(Filter(fees, IsHigh));
Print(Filter(fees, n => n < 1000));

static bool IsHigh(int n) => n >= 2500;
static List<int> Filter(List<int> xs, Rule rule)
{
    var result = new List<int>();
    foreach (var x in xs) if (rule(x)) result.Add(x);
    return result;
}
static void Print(List<int> xs) => Console.WriteLine(string.Join(",", xs));

delegate bool Rule(int n);`,
      expected: `3000,2500
450,800`,
      explain: '`Filter` does not know the rule; the caller passes it. `IsHigh` keeps 3000 and 2500 (order preserved). The lambda keeps values under 1000: 450 and 800. `string.Join(",", ...)` prints them without spaces.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`Calc op = null; op(1, 2);` What happens?',
      options: ['Returns 0', 'NullReferenceException at runtime', 'Compile error', 'Nothing happens'],
      answer: 1,
      explain: 'Invoking a null delegate throws `NullReferenceException`. Use `op?.Invoke(1, 2)` to call it only when it is set.',
    },
  ],
};
