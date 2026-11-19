export default {
  lesson: 'extra-24-pattern-matching',
  minutes: 25,
  intro: 'Use type, relational, property and logical patterns with `is` and switch expressions.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Test the type and capture a variable in one step:
\`if (payment ______ upi) Console.WriteLine(upi.VpaId);\`
(check that \`payment\` is a \`UpiPayment\`)`,
      example: { title: 'type pattern', code: 'if (shape is Circle c) Console.WriteLine(c.Radius);' },
      accept: ['is UpiPayment'],
      caseSensitive: true,
      explain: '`x is Type name` checks the type and, if it matches, assigns the cast value to a new variable. It replaces the old `as` + null check combination.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Switch expression with relational patterns. What does this print?',
      example: { title: 'relational patterns', code: `string size = qty switch
{
    < 10 => "small",
    >= 10 and < 100 => "medium",
    _ => "bulk"
};` },
      code: `foreach (var m in new[] { 95, 74, 60, 41, 12 })
    Console.WriteLine(Grade(m));

static string Grade(int marks) => marks switch
{
    >= 90 => "A+",
    >= 75 => "A",
    >= 60 and < 75 => "B",
    >= 40 => "C",
    _ => "Fail",
};`,
      expected: `A+
B
B
C
Fail`,
      explain: 'Arms are tested **top to bottom** and the first match wins. 95 → A+; 74 is not ≥ 75, but matches 60–74 → B; 60 → B; 41 → C; 12 → `_` (discard) → Fail.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Type and property patterns. What does this print?',
      example: { title: 'property pattern', code: 'if (order is { Status: "Paid", Amount: > 1000 }) { ... }' },
      code: `object[] items = { 42, "hello", 3.5, null, new Order(2500, "Paid"), new Order(300, "Pending") };
foreach (var i in items) Console.WriteLine(Describe(i));

static string Describe(object? o) => o switch
{
    null => "nothing",
    int n when n > 40 => $"big int {n}",
    int n => $"int {n}",
    string s => $"text of {s.Length}",
    Order { Status: "Paid", Amount: > 1000 } => "big paid order",
    Order { Status: "Paid" } => "paid order",
    Order o2 => $"order {o2.Status}",
    _ => "other",
};

record Order(int Amount, string Status);`,
      expected: `big int 42
text of 5
other
nothing
big paid order
order Pending`,
      explain: '42 matches the `when` guard. "hello" has length 5. 3.5 is a double, which no arm handles, so `_` → "other". `null` matches the null pattern. The paid order of 2500 matches the property pattern with `Amount: > 1000`; the pending order falls to `Order o2`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are valid C# patterns? Select all that apply.',
      options: ['`x is not null`', '`x is > 0 and < 10`', '`x is "A" or "B"`', '`x is between 1 and 5`', '`point is (0, 0)` (positional, on a tuple or deconstructable type)'],
      answers: [0, 1, 2, 4],
      explain: '`not`, `and`, `or` combinators, relational patterns, constant patterns and positional patterns are all real C# 9+ syntax. There is no `between` keyword; write `>= 1 and <= 5`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the switch arm that matches **any other value** (the default case) in a switch expression:
\`______ => "Unknown",\``,
      example: { title: 'switch expression ending', code: `var day = n switch { 1 => "Mon", 2 => "Tue", _ => "?" };` },
      accept: ['_'],
      explain: 'The discard pattern `_` matches anything and acts like `default:`. Without a catch-all the compiler warns that the switch is not exhaustive and a `SwitchExpressionException` can be thrown at runtime.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Tuple (positional) patterns. What does this print?',
      example: { title: 'switching on a tuple', code: `var r = (a, b) switch { (true, true) => "both", (true, _) => "first", _ => "none" };` },
      code: `Console.WriteLine(Fare("AC", 30));
Console.WriteLine(Fare("AC", 70));
Console.WriteLine(Fare("Sleeper", 10));
Console.WriteLine(Fare("General", 65));

static int Fare(string cls, int age) => (cls, age) switch
{
    ("AC", >= 60) => 900,
    ("AC", _) => 1500,
    ("Sleeper", < 12) => 250,
    ("Sleeper", _) => 500,
    (_, >= 60) => 100,
    _ => 150,
};`,
      expected: `1500
900
250
100`,
      explain: 'The tuple `(cls, age)` is matched by position. AC & 30 → 1500; AC & 70 → senior AC 900; Sleeper & 10 → child 250; General & 65 → `(_, >= 60)` → 100.',
    },
  ],
};
