const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `using System.Globalization;

// Type patterns, declaration patterns and when guards
object?[] items = { 42, "hello", 3.5, null, true, new[] { 1, 2, 3 }, 7 };

foreach (var item in items)
    Console.WriteLine(Describe(item));

// Classic "is" with a declaration pattern
object data = "pattern";
if (data is string text && text.Length > 5)
    Console.WriteLine($"Long text: {text.ToUpper()}");

static string Describe(object? o) => o switch
{
    null => "null value",
    int i when i > 40 => $"big int {i}",
    int i => $"small int {i}",
    string s => $"string of length {s.Length}",
    double d => $"double {d.ToString(CultureInfo.InvariantCulture)}",
    bool b => $"bool {b}",
    int[] arr => $"int array with {arr.Length} items",
    _ => "something else"
};
`;

const ex2 = `// Relational (<, >=) and logical (and, or, not) patterns
int[] allMarks = { 95, 78, 61, 40, 20, 105 };
foreach (var m in allMarks)
    Console.WriteLine($"{m} -> {Grade(m)}");

char[] chars = { 'a', 'Z', '7', '#' };
foreach (var c in chars)
    Console.WriteLine($"'{c}' is {Kind(c)}");

int? age = null;
if (age is not null) Console.WriteLine("Age known");
else Console.WriteLine("Age unknown");

static string Grade(int marks) => marks switch
{
    < 0 or > 100 => "Invalid",
    >= 90 => "A+",
    >= 75 => "A",
    >= 60 => "B",
    >= 35 => "C",
    _ => "Fail"
};

static string Kind(char c) => c switch
{
    >= 'a' and <= 'z' => "lowercase letter",
    >= 'A' and <= 'Z' => "uppercase letter",
    >= '0' and <= '9' => "digit",
    _ => "symbol"
};
`;

const ex3 = `// Property, positional and tuple patterns
var orders = new List<Order>
{
    new("Asha", 300, "Delhi", true),
    new("Ravi", 750, "Delhi", false),
    new("Meera", 200, "Pune", false),
    new("John", 150, "Chennai", false),
};
foreach (var o in orders)
    Console.WriteLine($"{o.Customer}: shipping {Shipping(o)}");

Point[] points = { new(0, 0), new(5, 0), new(0, -3), new(2, 3), new(-2, 3), new(-1, -1), new(4, -2) };
foreach (var p in points)
    Console.WriteLine($"({p.X},{p.Y}) {Quadrant(p)}");

Console.WriteLine(Winner("rock", "scissors"));
Console.WriteLine(Winner("rock", "paper"));
Console.WriteLine(Winner("paper", "paper"));

static int Shipping(Order o) => o switch
{
    { IsPrime: true } => 0,                 // property pattern
    { Amount: >= 500 } => 0,                // property + relational
    { City: "Mumbai" or "Pune" } => 40,
    _ => 80
};

static string Quadrant(Point p) => p switch
{
    (0, 0) => "Origin",                     // positional pattern (uses Deconstruct)
    (var x, 0) => $"On X axis at {x}",
    (0, _) => "On Y axis",
    ( > 0, > 0) => "Quadrant 1",
    ( < 0, > 0) => "Quadrant 2",
    ( < 0, < 0) => "Quadrant 3",
    _ => "Quadrant 4"
};

static string Winner(string a, string b) => (a, b) switch   // tuple pattern
{
    var (x, y) when x == y => "Draw",
    ("rock", "scissors") or ("paper", "rock") or ("scissors", "paper") => "Player 1 wins",
    _ => "Player 2 wins"
};

record Order(string Customer, int Amount, string City, bool IsPrime);
record Point(int X, int Y);
`;

const ex4 = `// List patterns (C# 11+): [], [x], [first, .., last], slices
int[][] inputs =
{
    new int[] { },
    new[] { 7 },
    new[] { 1, 2, 3 },
    new[] { 5, 6, 0 },
    new[] { 4, 8, 9 },
};
foreach (var arr in inputs)
    Console.WriteLine($"[{string.Join(",", arr)}] -> {Describe(arr)}");

int[] data = { 10, 20, 30, 40 };
if (data is [_, .. var middle, _])
    Console.WriteLine($"Middle: {string.Join(",", middle)}");

// Parse simple commands with list patterns on string[]
string[] command = "add 5 7".Split(' ');
string reply = command switch
{
    ["add", var a, var b] => $"Sum = {int.Parse(a) + int.Parse(b)}",
    ["hello"] => "Hi!",
    _ => "Unknown command"
};
Console.WriteLine(reply);

static string Describe(int[] a) => a switch
{
    [] => "empty",
    [var only] => $"one item: {only}",
    [1, ..] => "starts with 1",
    [.., 0] => "ends with 0",
    [var first, .., var last] => $"first {first}, last {last}"
};
`;

export default {
  id: 'extra-24-pattern-matching',
  title: 'Pattern Matching in C#',
  module: 'Extra: Advanced C#',
  extraNo: 24,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `Pattern matching lets you test the shape of data (its type, its property values, its range or its elements) and extract parts of it in one readable expression. Learn type, constant, relational, logical, property, positional, tuple, var, discard and list patterns, and use them with is and switch expressions to replace long if-else chains.`,
  objectives: [
    'Use the is operator with type/declaration patterns and when guards',
    'Write switch expressions with relational (<, >=) and logical (and, or, not) patterns',
    'Match object properties, positional records and tuples',
    'Use list patterns and slice patterns on arrays and lists (C# 11+)',
    'Choose pattern matching over casting and nested if statements in real code',
  ],
  theory: [
    {
      heading: 'What is pattern matching?',
      content: `A **pattern** is a description of what a value should look like. C# checks the value against the pattern and, if it matches, can also **extract** data into new variables.

Analogy: airport security. One officer checks "is this a bag?" (type), another checks "is it heavier than 23 kg?" (relational), another checks "is the owner a premium flyer?" (property). Pattern matching does all of these checks in one expression.

Patterns are used in three places:
- **is** expressions: if (obj is string s)
- **switch statements**: case int n when n > 0:
- **switch expressions** (C# 8+): value switch { pattern => result, ... }`,
      points: [
        'Replaces casting + null checks: if (o is Student s) is safer than (Student)o',
        'The compiler warns when a switch expression is not exhaustive (some input not handled)',
        'Patterns are evaluated top to bottom - put specific cases before general ones',
      ],
    },
    {
      heading: 'Type, declaration, constant, var and discard patterns',
      content: `- **Type pattern**: o is string - true when o is a non-null string.
- **Declaration pattern**: o is string s - also creates variable s of type string.
- **Constant pattern**: x is 0, status is "Active", o is null.
- **var pattern**: var x - always matches and captures the value (useful in tuples or with when).
- **Discard pattern**: _ - matches anything; used as the default arm of a switch expression.
- **when guard**: adds an extra boolean condition to a case.`,
      syntax: `if (shape is Circle c) Console.WriteLine(c.Radius);
if (input is null) return;
string text = o switch
{
    int n when n < 0 => "negative int",
    int n            => $"int {n}",
    string s         => $"text {s}",
    null             => "nothing",
    _                => "other"
};`,
    },
    {
      heading: 'Relational and logical patterns (C# 9)',
      content: `**Relational patterns** compare with constants: < 18, >= 60, <= 'z'.
**Logical patterns** combine patterns: **and**, **or**, **not**.

These make ranges very readable: marks switch { >= 90 => "A+", >= 75 => "A", ... }.

**not null** is the idiomatic null check: if (customer is not null).`,
      syntax: `string category = age switch
{
    < 0 or > 120 => "Invalid",
    < 13 => "Child",
    >= 13 and < 20 => "Teen",
    _ => "Adult"
};
if (ch is >= 'a' and <= 'z') Console.WriteLine("lower case");
if (obj is not string) Console.WriteLine("not text");`,
      tip: `Order matters: in the grade example >= 75 is reached only if >= 90 failed, so it really means 75..89.`,
    },
    {
      heading: 'Property, positional and tuple patterns',
      content: `**Property pattern** { Prop: pattern } checks properties (it also checks for non-null). They can be nested, and since C# 10 you can write extended property patterns like { Address.City: "Pune" }.

**Positional pattern** (a, b) uses a type's **Deconstruct** method - records generate it automatically.

**Tuple pattern** switches on several values at once: (a, b) switch { ("rock", "scissors") => ... }. Great for state machines and rule tables.`,
      syntax: `decimal discount = customer switch
{
    { IsPremium: true, Orders: > 10 } => 0.20m,
    { IsPremium: true } => 0.10m,
    { Address.City: "Pune" } => 0.05m,
    _ => 0m
};
string light = (color, blinking) switch
{
    ("Red", false) => "Stop",
    ("Yellow", _) => "Slow down",
    ("Green", false) => "Go",
    _ => "Check signal"
};`,
    },
    {
      heading: 'List and slice patterns (C# 11)',
      content: `List patterns match arrays, lists and any type with Length/Count plus an indexer:
- **[]** empty
- **[x]** exactly one element captured as x
- **[1, 2, 3]** exact elements
- **[first, ..]** starts with something; **..** is a **slice** of zero or more elements
- **[.., last]** ends with something
- **[_, .. var middle, _]** captures the middle elements as a new array

They are very handy for parsing command-line arguments or split strings: ["add", var a, var b].`,
      syntax: `string r = numbers switch
{
    [] => "empty",
    [var x] => $"single {x}",
    [var first, .., var last] => $"{first}..{last}"
};
if (args is ["--port", var port]) Console.WriteLine(port);`,
    },
    {
      heading: 'switch statement vs switch expression',
      content: `The **switch statement** executes statements (case ...: break;). The **switch expression** produces a value, uses =>, has no break, and ends with a semicolon after the closing brace.

If no arm matches a switch expression at runtime, it throws **SwitchExpressionException**, so always add a discard arm _ (or make it exhaustive). The compiler gives warning CS8509 when not all inputs are handled and error CS8510 when an arm can never be reached.

Use pattern matching in ASP.NET Core too, e.g. mapping exceptions to status codes: ex switch { NotFoundException => 404, ValidationException => 400, _ => 500 }.`,
    },
  ],
  examples: [
    {
      title: 'Type patterns with is and switch',
      scenario: 'An object array contains different types. Describe each item without any manual casting.',
      steps: steps('TypePatterns'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `big int 42
string of length 5
double 3.5
null value
bool True
int array with 3 items
small int 7
Long text: PATTERN`,
      explanation: `Each arm is tested from top to bottom. 42 matches int with the guard i > 40; 7 fails the guard and falls to the next int arm. "hello" has length 5. 3.5 is printed with InvariantCulture so the decimal point is always a dot. null matches the null constant pattern. The final if uses a declaration pattern: data is a string of length 7 (> 5) so text is upper-cased.`,
    },
    {
      title: 'Grades and character types with relational and logical patterns',
      scenario: 'Convert marks to grades and classify characters using ranges instead of long if-else chains.',
      steps: steps('RelationalPatterns'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `95 -> A+
78 -> A
61 -> B
40 -> C
20 -> Fail
105 -> Invalid
'a' is lowercase letter
'Z' is uppercase letter
'7' is digit
'#' is symbol
Age unknown`,
      explanation: `105 matches the first arm (> 100) so it is Invalid even though it is also >= 90 - order matters. 78 is not >= 90 but is >= 75 so A. 20 is not >= 35 so the discard arm gives Fail. Characters are compared by their code values, so 'a'..'z', 'A'..'Z' and '0'..'9' ranges work. age is null so "is not null" is false.`,
    },
    {
      title: 'Property, positional and tuple patterns',
      scenario: 'Compute shipping charges from order properties, find a point quadrant using a record, and decide rock-paper-scissors winners with a tuple switch.',
      steps: steps('ShapePatterns'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Asha: shipping 0
Ravi: shipping 0
Meera: shipping 40
John: shipping 80
(0,0) Origin
(5,0) On X axis at 5
(0,-3) On Y axis
(2,3) Quadrant 1
(-2,3) Quadrant 2
(-1,-1) Quadrant 3
(4,-2) Quadrant 4
Player 1 wins
Player 2 wins
Draw`,
      explanation: `Asha is a Prime member (0). Ravi is not Prime but his amount 750 >= 500 (0). Meera lives in Pune (40). John matches nothing so the default 80 applies. Records generate Deconstruct, so (var x, 0) captures X when Y is 0. (4,-2) does not match any earlier arm, so the discard gives Quadrant 4. In Winner the first arm uses var (x, y) with a when guard to detect a draw.`,
    },
    {
      title: 'List patterns and slices',
      scenario: 'Describe arrays by their shape, extract the middle elements, and parse a small text command.',
      steps: steps('ListPatterns'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `[] -> empty
[7] -> one item: 7
[1,2,3] -> starts with 1
[5,6,0] -> ends with 0
[4,8,9] -> first 4, last 9
Middle: 20,30
Sum = 12`,
      explanation: `[] matches the empty array, [var only] a one-element array. [1,2,3] matches [1, ..] before reaching the later arms. [5,6,0] ends with 0. [4,8,9] falls to [var first, .., var last]. The slice .. var middle captures elements between the first and last (20,30). "add 5 7".Split(' ') gives ["add","5","7"] which matches ["add", var a, var b], so 5 + 7 = 12.`,
    },
  ],
  interview: [
    { q: `What is pattern matching in C#?`, a: `A feature that tests whether a value has a certain shape (type, constant, range, property values, positions, list elements) and optionally extracts parts into variables. It is used with is, switch statements and switch expressions.`, level: 'Easy' },
    { q: `Difference between "o is string" and "o as string"?`, a: `is returns a bool (and with a declaration pattern also gives a typed variable). as returns the converted reference or null and only works with reference/nullable types. The pattern "o is string s" is the modern replacement for as + null check.`, level: 'Easy' },
    { q: `What is a switch expression and how does it differ from a switch statement?`, a: `A switch expression returns a value: x switch { pattern => value, _ => default }. It has no case/break, arms are expressions, and an unmatched input throws SwitchExpressionException. A switch statement executes blocks of statements.`, level: 'Medium' },
    { q: `What is a when clause?`, a: `A guard that adds a boolean condition to a pattern: case int n when n > 100. The arm matches only if the pattern matches and the condition is true.`, level: 'Easy' },
    { q: `Output? object o = 5; Console.WriteLine(o is int n && n > 3 ? "yes" : "no");`, a: `yes. o holds a boxed int 5, the declaration pattern assigns n = 5, and 5 > 3 is true.`, level: 'Easy' },
    { q: `Output? int x = 95; Console.WriteLine(x switch { > 50 => "big", > 90 => "huge", _ => "small" });`, a: `big. Arms are tested in order and > 50 matches first. (The compiler would actually report the > 90 arm as unreachable - error CS8510 - so in practice you must order arms from most specific to least specific.)`, level: 'Hard' },
    { q: `What is a property pattern?`, a: `A pattern of the form { Property: pattern, ... } that matches when the object is not null and each listed property matches its sub-pattern. Example: order is { Status: "Paid", Amount: > 1000 }.`, level: 'Medium' },
    { q: `How does a positional pattern work?`, a: `It calls the type's Deconstruct method (records and tuples have it built in) and matches each output against a sub-pattern: point is (0, 0).`, level: 'Medium' },
    { q: `What are list patterns?`, a: `C# 11 patterns that match sequences by elements: [], [1, 2], [first, ..], [.., last], [_, .. var rest]. They work on arrays, List<T>, spans and any countable indexable type.`, level: 'Medium' },
    { q: `What does "is not null" do and why prefer it?`, a: `It checks that a reference is not null without calling any overloaded != operator. It is clear, works with generics and is the recommended style.`, level: 'Easy' },
    { q: `Give a real ASP.NET Core use of pattern matching.`, a: `Mapping exceptions to HTTP status codes in global exception handling: var status = ex switch { KeyNotFoundException => 404, ArgumentException => 400, UnauthorizedAccessException => 401, _ => 500 };`, level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a method TicketPrice(int age) using a switch expression: under 5 free, 5-12 = 100, 13-59 = 200, 60+ = 120, negative = throw ArgumentOutOfRangeException.',
      hint: 'Use < 0 => throw ..., < 5 => 0, <= 12 => 100 ...',
      solution: `static int TicketPrice(int age) => age switch
{
    < 0 => throw new ArgumentOutOfRangeException(nameof(age)),
    < 5 => 0,
    <= 12 => 100,
    < 60 => 200,
    _ => 120
};
Console.WriteLine(TicketPrice(30)); // 200`,
    },
    {
      task: 'Create records Circle(double R), Rectangle(double W, double H), Square(double S). Write Area(object shape) using type patterns. Print areas using InvariantCulture with 2 decimals.',
      hint: 'shape switch { Circle c => Math.PI * c.R * c.R, ... }',
      solution: `using System.Globalization;
object[] shapes = { new Circle(1), new Rectangle(2, 3), new Square(4) };
foreach (var s in shapes)
    Console.WriteLine(Area(s).ToString("0.00", CultureInfo.InvariantCulture)); // 3.14 6.00 16.00
static double Area(object shape) => shape switch
{
    Circle c => Math.PI * c.R * c.R,
    Rectangle { W: var w, H: var h } => w * h,
    Square(var side) => side * side,
    _ => 0
};
record Circle(double R); record Rectangle(double W, double H); record Square(double S);`,
    },
    {
      task: 'Traffic light: given (string color, bool emergency) return the action using a tuple switch. Emergency always means "Give way".',
      hint: '(_, true) => "Give way" must be the first arm.',
      solution: `static string Action(string color, bool emergency) => (color, emergency) switch
{
    (_, true) => "Give way",
    ("Red", _) => "Stop",
    ("Yellow", _) => "Slow down",
    ("Green", _) => "Go",
    _ => "Unknown"
};
Console.WriteLine(Action("Green", true));  // Give way
Console.WriteLine(Action("Red", false));   // Stop`,
    },
    {
      task: 'Write a mini calculator that reads a line like "mul 4 5" and uses list patterns to support add, sub, mul and div (with a guard against division by zero).',
      hint: '["div", var a, "0"] => "Cannot divide by zero" before the general div arm.',
      solution: `string[] p = (Console.ReadLine() ?? "").Split(' ');
string output = p switch
{
    ["add", var a, var b] => (int.Parse(a) + int.Parse(b)).ToString(),
    ["sub", var a, var b] => (int.Parse(a) - int.Parse(b)).ToString(),
    ["mul", var a, var b] => (int.Parse(a) * int.Parse(b)).ToString(),
    ["div", _, "0"] => "Cannot divide by zero",
    ["div", var a, var b] => (int.Parse(a) / int.Parse(b)).ToString(),
    _ => "Usage: add|sub|mul|div a b"
};
Console.WriteLine(output);`,
    },
    {
      task: 'Given a list of Employee records (Name, Dept, Salary, YearsOfService), compute the bonus with a property pattern: IT with > 5 years = 20%, any dept with salary < 30000 = 15%, otherwise 10%.',
      hint: '{ Dept: "IT", YearsOfService: > 5 } => salary * 20 / 100',
      solution: `static int Bonus(Employee e) => e switch
{
    { Dept: "IT", YearsOfService: > 5 } => e.Salary * 20 / 100,
    { Salary: < 30000 } => e.Salary * 15 / 100,
    _ => e.Salary * 10 / 100
};
Console.WriteLine(Bonus(new Employee("Ravi", "IT", 50000, 7)));  // 10000
Console.WriteLine(Bonus(new Employee("Asha", "HR", 25000, 2)));  // 3750
record Employee(string Name, string Dept, int Salary, int YearsOfService);`,
    },
  ],
  quiz: [
    { question: `Which keyword combines two patterns so that both must match?`, options: [`&&`, `and`, `with`, `when`], answer: 1, explanation: `Inside patterns use and / or / not. && is used in normal boolean expressions and in when guards.` },
    { question: `What happens if no arm of a switch expression matches?`, options: [`It returns null`, `It returns default(T)`, `SwitchExpressionException is thrown`, `Nothing - execution continues`], answer: 2, explanation: `An unmatched switch expression throws at runtime, which is why a discard arm _ is recommended.` },
    { question: `Which pattern matches an array whose last element is 0?`, options: [`[0, ..]`, `[.., 0]`, `{ Last: 0 }`, `(.., 0)`], answer: 1, explanation: `.. is the slice pattern; [.., 0] means anything followed by 0 at the end.` },
    { question: `What does "if (o is Student s)" do?`, options: [`Creates a new Student`, `Throws if o is not a Student`, `Converts any object to Student`, `Checks the type and assigns s only if o is a non-null Student`], answer: 3, explanation: `It is a declaration pattern: s is definitely assigned only when the test succeeds.` },
    { question: `Which pattern uses a type's Deconstruct method?`, options: [`Positional pattern`, `Property pattern`, `Relational pattern`, `Constant pattern`], answer: 0, explanation: `Positional patterns like (0, var y) deconstruct the value into its parts.` },
  ],
};
