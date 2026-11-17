const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `// Nullable value types: int?, bool?, DateTime? ...
int? age = null;                       // int? is short for Nullable<int>
Console.WriteLine(age.HasValue);           // is there a value?
Console.WriteLine(age.GetValueOrDefault()); // 0 when null

age = 25;
Console.WriteLine(age.HasValue);
Console.WriteLine(age.Value);              // safe now: HasValue is true

int? bonus = null;
int total = (bonus ?? 0) + 100;            // use 0 when bonus is null
Console.WriteLine(total);

bool? isActive = null;                     // three states: true, false, null
Console.WriteLine(isActive == true ? "Active" : "Not active / unknown");

// A null value prints as an empty string inside interpolation
Console.WriteLine($"Age is {age}, bonus is '{bonus}'");

// int normal = age;      // ERROR: cannot convert int? to int implicitly
int normal = (int)age;    // explicit cast works because age has a value
Console.WriteLine(normal * 2);
`;

const ex2 = `// Null-conditional operators ?. and ?[] with ??
var s1 = new Student
{
    Name = "Asha",
    Address = new Address { City = "Pune" },
    Marks = new List<int> { 80, 90 }
};
var s2 = new Student { Name = "Ravi" };   // no Address, no Marks
Student? s3 = null;                        // no student at all

Console.WriteLine(s1.Address?.City ?? "Unknown");
Console.WriteLine(s2.Address?.City ?? "Unknown");
Console.WriteLine(s3?.Name ?? "No student");

Console.WriteLine(s1.Marks?.Count ?? 0);
Console.WriteLine(s2.Marks?.Count ?? 0);

Console.WriteLine(s1.Marks?[1]);          // ?[] = null-conditional indexer
Console.WriteLine(s2.Marks?[0] ?? -1);

// Call a method only if the object exists
s3?.PrintCard();                           // does nothing, no exception
s1.PrintCard();

class Address
{
    public string? City { get; set; }
}

class Student
{
    public string Name { get; set; } = "";
    public Address? Address { get; set; }
    public List<int>? Marks { get; set; }

    public void PrintCard() => Console.WriteLine($"[Card] {Name} from {Address?.City ?? "N/A"}");
}
`;

const ex3 = `// Null-coalescing assignment ??= and chained ??
List<string>? log = null;
log ??= new List<string>();               // assigned because log was null
log.Add("Started");
log ??= new List<string> { "Never used" }; // ignored: log is not null
log.Add("Running");
Console.WriteLine(log.Count);
Console.WriteLine(string.Join(", ", log));

string? city = null;
city ??= "Mumbai";
city ??= "Delhi";
Console.WriteLine(city);

// ?? only checks null, NOT empty/whitespace strings
string? input = "  ";
string name1 = input ?? "Guest";
string name2 = string.IsNullOrWhiteSpace(input) ? "Guest" : input;
Console.WriteLine($"[{name1}] [{name2}]");

// Lifted operators: arithmetic with a null gives null
int? x = null;
int? y = 5;
Console.WriteLine(x + y);                 // prints an empty line
Console.WriteLine((x + y) is null);
Console.WriteLine(x ?? y ?? 0);           // first non-null value
`;

const ex4 = `// Safe parsing that returns int? instead of throwing
string?[] inputs = { "42", "abc", null, "7" };
int sum = 0;

foreach (var text in inputs)
{
    int? value = ParseOrNull(text);
    string shown = value.HasValue ? value.Value.ToString() : "invalid";
    Console.WriteLine($"{text ?? "(null)"} -> {shown}");
    sum += value ?? 0;
}
Console.WriteLine($"Sum = {sum}");

// Throw expression with ??: fail fast when a required value is missing
string? connection = null;
try
{
    string cs = connection ?? throw new InvalidOperationException("Connection string missing");
    Console.WriteLine(cs);
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Error: " + ex.Message);
}

static int? ParseOrNull(string? text) =>
    int.TryParse(text, out int n) ? n : null;
`;

export default {
  id: 'extra-23-nullable-and-null-operators',
  title: 'Nullable Value Types, Null-Conditional (?.) and Null-Coalescing (??, ??=) Operators',
  module: 'Extra: Advanced C#',
  extraNo: 23,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `NullReferenceException is the most common bug in C# applications. Learn how C# represents "no value" for value types (int?, bool?, DateTime?), how nullable reference types (string?) warn you at compile time, and how the operators ?., ?[], ??, ??= and ! let you write short, safe code instead of long if (x != null) chains.`,
  objectives: [
    'Declare and use nullable value types (int?, Nullable<T>) with HasValue, Value and GetValueOrDefault',
    'Understand nullable reference types (string?) and the compiler null-state warnings',
    'Use ?. and ?[] to safely access members of objects that may be null',
    'Use ?? and ??= to supply default values and lazily initialise variables',
    'Avoid NullReferenceException in real code such as reading optional database or JSON fields',
  ],
  theory: [
    {
      heading: 'Why null is a problem',
      content: `A **reference type** variable (string, class objects, List<T>) can hold **null**, meaning "points to no object". If you call a member on null, the program crashes with **NullReferenceException** (the famous "Object reference not set to an instance of an object").

A **value type** (int, double, bool, DateTime, struct) can NOT be null normally: an int always has a number (default 0). But in real life many values are optional:
- A student's middle-exam marks that are **not yet entered**
- A DateTime **DeliveredOn** for an order that is not delivered yet
- A nullable INT column in SQL Server

Using 0 or -1 as "no value" is confusing (is 0 a real mark or missing?). C# solves this with **nullable value types**.

Analogy: a form field. An int is a box that always has a number written in it. An int? is a box that may be **empty**.`,
      points: [
        'Reference types: null allowed by default (string, arrays, classes)',
        'Value types: null not allowed unless you add ? (int?, bool?, DateTime?)',
        'NullReferenceException = you used . on a null reference',
      ],
    },
    {
      heading: 'Nullable value types: int?, Nullable<T>',
      content: `**int?** is just a shortcut for the struct **Nullable<int>**. It wraps a value plus a flag that says whether a value exists.

Important members:
- **HasValue** - true if it contains a value
- **Value** - the value; throws InvalidOperationException if HasValue is false
- **GetValueOrDefault()** / **GetValueOrDefault(x)** - value, or default(T) / x when empty

Conversions: int -> int? is **implicit** (always safe). int? -> int needs an **explicit cast** (it throws if null) or better, **??**.

**Lifted operators**: arithmetic and comparisons work on nullable values. If any operand is null, + - * / give **null**; comparisons like < and > give **false**; == null works as expected.

**bool?** has three states (true, false, null). Write if (flag == true) because if (flag) does not compile for bool?.`,
      syntax: `int? marks = null;            // Nullable<int>
DateTime? deliveredOn = null;
if (marks.HasValue) Console.WriteLine(marks.Value);
int safe = marks.GetValueOrDefault();     // 0
int safe2 = marks ?? -1;                  // -1
int? sum = marks + 10;                    // null (lifted operator)`,
      tip: `In EF Core, a nullable column (INT NULL) maps to int? in your entity. A NOT NULL column maps to int.`,
    },
    {
      heading: 'Nullable reference types (string?) and the ! operator',
      content: `Since C# 8 (enabled by default in new .NET projects via **<Nullable>enable</Nullable>** in the .csproj) the compiler tracks whether reference variables may be null:
- **string** means "should never be null"
- **string?** means "may be null"

These are **compile-time warnings only** (CS8600, CS8602, CS8618 ...). At runtime string and string? are the same type. The compiler performs **null-state analysis**: after if (name != null) it knows name is not null inside the block.

The **null-forgiving operator !** (postfix) tells the compiler "trust me, this is not null": name!.Length. It removes the warning but does NOT add any runtime check - if you are wrong you still get a NullReferenceException. Use it rarely.`,
      syntax: `string? middleName = null;     // may be null - no warning
string firstName = "Asha";      // must not be null
// Console.WriteLine(middleName.Length);  // warning CS8602: possible null
if (middleName != null)
    Console.WriteLine(middleName.Length); // fine: compiler knows it is not null
var dbName = config["Db"]!;     // ! = I promise this is not null`,
      points: [
        'Properties that are not initialised in the constructor give warning CS8618; fix with = "" , required, or make them nullable',
        'ArgumentNullException.ThrowIfNull(arg) is a quick runtime guard for method parameters',
      ],
    },
    {
      heading: 'Null-conditional operators ?. and ?[]',
      content: `**a?.B** means: if a is null, the whole expression is null; otherwise access a.B. It **short-circuits**: the rest of the chain is not evaluated.

**a?[i]** is the same for indexers (arrays, lists, dictionaries).

If the member returns a value type, the result becomes nullable: list?.Count is **int?**.

Typical uses:
- Deep navigation: order?.Customer?.Address?.City
- Calling a method only if the object exists: logger?.Log("x");
- Raising events safely: PriceChanged?.Invoke(this, e);`,
      syntax: `string? city = student?.Address?.City;   // null if any part is null
int? count = student?.Marks?.Count;      // int? because Count is int
int? first = numbers?[0];                // null-conditional indexer
handler?.Invoke(this, EventArgs.Empty);  // safe event/delegate call`,
      tip: `Without ?. you would write: if (student != null && student.Address != null) city = student.Address.City; - ?. does exactly this in one line.`,
    },
    {
      heading: 'Null-coalescing ?? and null-coalescing assignment ??=',
      content: `**a ?? b** returns a if a is not null, otherwise b. It is the perfect partner of ?. to give a default.

**a ??= b** assigns b to a **only if a is null** (C# 8). Great for lazy initialisation.

Chaining: a ?? b ?? c returns the first non-null value (evaluated left to right; ?? is right-associative).

**Throw expression**: value ?? throw new ArgumentNullException(nameof(value)) - fail fast with a clear message.

Note: ?? checks only **null**. An empty string "" or "  " is not null, so use string.IsNullOrWhiteSpace for text input.`,
      syntax: `string display = user?.Name ?? "Guest";
int marks = enteredMarks ?? 0;
cache ??= new Dictionary<int, string>();     // create only once
string cs = connStr ?? throw new InvalidOperationException("Missing");`,
      points: [
        '?? has lower precedence than + and -, so write (bonus ?? 0) + 100 with brackets',
        'is null / is not null are the recommended null checks (they cannot be overloaded by == operators)',
      ],
    },
    {
      heading: 'Best practices',
      content: `- Keep **<Nullable>enable</Nullable>** on and fix the warnings - they find real bugs before runtime.
- Initialise collections to empty (= new()) instead of null so callers can loop without checks.
- Use **?.** for optional navigation, **??** for defaults, **??=** for lazy creation.
- Prefer **TryParse** returning a nullable or bool over exceptions for invalid input.
- Validate method arguments at the boundary: ArgumentNullException.ThrowIfNull(customer);
- Do not overuse **!** - each ! is a place where you might still get a NullReferenceException.`,
    },
  ],
  examples: [
    {
      title: 'Nullable value types: int? and bool?',
      scenario: 'A student record where age and bonus marks are optional. Show HasValue, Value, GetValueOrDefault, ?? and how null prints.',
      steps: steps('NullableDemo'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `False
0
True
25
100
Not active / unknown
Age is 25, bonus is ''
50`,
      explanation: `age starts as null, so HasValue is False and GetValueOrDefault() returns default(int) = 0. After age = 25, Value is 25. bonus is null so (bonus ?? 0) + 100 = 100. isActive == true is false for null, so the else text prints. A null nullable prints as an empty string inside interpolation ('' ). The explicit cast (int)age works because age now has the value 25, so 25 * 2 = 50.`,
    },
    {
      title: 'Safe navigation with ?. and ?[]',
      scenario: 'Some students have an address and marks, some do not, and one student variable is null. Print city and mark counts without any NullReferenceException.',
      steps: steps('NullConditionalDemo'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Pune
Unknown
No student
2
0
90
-1
[Card] Asha from Pune`,
      explanation: `s1.Address?.City is "Pune". s2.Address is null so ?. returns null and ?? gives "Unknown". s3 is null, so s3?.Name is null and "No student" prints. s1.Marks?.Count is 2; s2.Marks is null so ?? 0 gives 0. s1.Marks?[1] is the second element 90; s2.Marks?[0] is null so -1 prints. s3?.PrintCard() is skipped completely, only s1 prints its card.`,
    },
    {
      title: 'Lazy initialisation with ??= and lifted operators',
      scenario: 'Create a log list only when needed, choose the first available city, and see how arithmetic with null behaves.',
      steps: steps('CoalesceAssignDemo'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `2
Started, Running
Mumbai
[  ] [Guest]

True
5`,
      explanation: `The first ??= creates the list because log is null; the second ??= is ignored because log already exists, so the list contains Started and Running (count 2). city gets "Mumbai" and the later ??= "Delhi" is ignored. input is "  " (not null) so input ?? "Guest" keeps the two spaces, while IsNullOrWhiteSpace gives "Guest". x + y is null because x is null; Console.WriteLine(null int?) prints an empty line. (x + y) is null is True. x ?? y ?? 0 returns the first non-null value, 5.`,
    },
    {
      title: 'TryParse returning int? and throw expressions',
      scenario: 'Read a list of text inputs (some invalid, one null), convert them safely and add the valid numbers. Then fail fast when a required setting is missing.',
      steps: steps('SafeParseDemo'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `42 -> 42
abc -> invalid
(null) -> invalid
7 -> 7
Sum = 49
Error: Connection string missing`,
      explanation: `ParseOrNull returns the number when int.TryParse succeeds, otherwise null (int.TryParse(null) simply returns false). value ?? 0 adds 0 for invalid items, so Sum = 42 + 7 = 49. connection is null, so the right side of ?? runs and throws InvalidOperationException, which is caught and its message printed.`,
    },
  ],
  interview: [
    { q: `What is a nullable value type?`, a: `A value type wrapped in Nullable<T> (written T?) so it can also hold null, e.g. int?, DateTime?. It has HasValue, Value and GetValueOrDefault(). It is used for optional values such as nullable database columns.`, level: 'Easy' },
    { q: `What is the difference between int? and string? ?`, a: `int? is a different runtime type, Nullable<int>, a struct with a HasValue flag. string? is only a compile-time annotation for nullable reference types; at runtime it is the same System.String, and the compiler only produces warnings.`, level: 'Medium' },
    { q: `What happens when you read .Value of an int? that is null?`, a: `It throws InvalidOperationException ("Nullable object must have a value"). Check HasValue first or use GetValueOrDefault() / ??.`, level: 'Easy' },
    { q: `Explain ?. with an example.`, a: `The null-conditional operator returns null instead of throwing when the left side is null and stops evaluating the rest of the chain. customer?.Address?.City is null if customer or Address is null. With value-type members the result becomes nullable: list?.Count is int?.`, level: 'Easy' },
    { q: `What is the difference between ?? and ??= ?`, a: `a ?? b is an expression that returns a if it is not null, else b; a is not changed. a ??= b is an assignment that stores b into a only when a is null, then returns a.`, level: 'Easy' },
    { q: `Output? int? a = null; int? b = 10; Console.WriteLine(a + b == null);`, a: `True. Lifted arithmetic with a null operand returns null, so a + b is null, and null == null is true.`, level: 'Medium' },
    { q: `Output? int? a = null; Console.WriteLine(a > 5); Console.WriteLine(a <= 5);`, a: `False and False. Lifted comparison operators (<, >, <=, >=) return false when any operand is null, so both comparisons are false.`, level: 'Hard' },
    { q: `What does the null-forgiving operator ! do?`, a: `It suppresses nullable warnings for an expression (name!.Length). It has no runtime effect - if the value is actually null you still get a NullReferenceException.`, level: 'Medium' },
    { q: `Why is "x is null" preferred over "x == null"?`, a: `== can be overloaded by a class, so x == null may run custom code. The is null pattern always performs a pure reference null check and also works on generics and nullable types.`, level: 'Medium' },
    { q: `Output? string s = ""; Console.WriteLine(s ?? "default");`, a: `An empty line. ?? only reacts to null; "" is not null, so s is returned. Use string.IsNullOrEmpty for empty checks.`, level: 'Easy' },
    { q: `How do you safely raise an event in C#?`, a: `MyEvent?.Invoke(this, args); - ?. reads the delegate once and only invokes it if at least one handler is subscribed, which is also thread-safe compared with a separate null check.`, level: 'Medium' },
    { q: `How do nullable types map to EF Core / SQL Server?`, a: `A non-nullable property (int, DateTime) becomes a NOT NULL column; int?/DateTime? become NULL-able columns. With nullable reference types enabled, string becomes NVARCHAR NOT NULL and string? becomes NVARCHAR NULL.`, level: 'Medium' },
  ],
  practice: [
    {
      task: 'A product discount percentage is optional (int?). Write a method FinalPrice(int price, int? discount) that applies the discount only if it has a value. Print the final price for discount 10 and for null.',
      hint: 'Use discount ?? 0 or discount.HasValue.',
      solution: `static int FinalPrice(int price, int? discount) => price - price * (discount ?? 0) / 100;
Console.WriteLine(FinalPrice(1000, 10));   // 900
Console.WriteLine(FinalPrice(1000, null)); // 1000`,
    },
    {
      task: 'Given Employee with an optional Manager (Employee?) and Manager has a Name, print the manager name of each employee or "No manager".',
      hint: 'emp.Manager?.Name ?? "No manager"',
      solution: `var boss = new Employee { Name = "Meera" };
var emps = new[] { new Employee { Name = "Ravi", Manager = boss }, boss };
foreach (var e in emps)
    Console.WriteLine($"{e.Name}: {e.Manager?.Name ?? "No manager"}");
// Ravi: Meera
// Meera: No manager
class Employee { public string Name { get; set; } = ""; public Employee? Manager { get; set; } }`,
    },
    {
      task: 'Read a number from the console. If the input is empty or invalid, use 18 as the default age. Use int? and ??.',
      hint: 'Console.ReadLine() returns string?. Combine int.TryParse with a conditional expression.',
      solution: `string? text = Console.ReadLine();
int? parsed = int.TryParse(text, out var n) ? n : null;
int age = parsed ?? 18;
Console.WriteLine($"Age: {age}");`,
    },
    {
      task: 'Write a SettingsCache class with a private Dictionary<string,string>? field that is created only on first use using ??=. Add Set and Get (Get returns "not set" when missing).',
      hint: '_items ??= new(); and _items?.GetValueOrDefault(key) ?? "not set"',
      solution: `var cache = new SettingsCache();
Console.WriteLine(cache.Get("Theme")); // not set
cache.Set("Theme", "Dark");
Console.WriteLine(cache.Get("Theme")); // Dark
class SettingsCache
{
    private Dictionary<string, string>? _items;
    public void Set(string key, string value) { _items ??= new(); _items[key] = value; }
    public string Get(string key) => _items?.GetValueOrDefault(key) ?? "not set";
}`,
    },
    {
      task: 'Write an average method for int?[] marks that ignores null (absent) entries and returns null when no marks exist.',
      hint: 'Loop and count only items with HasValue, or use LINQ: marks.Where(m => m.HasValue).',
      solution: `static double? Average(int?[] marks)
{
    var present = marks.Where(m => m.HasValue).Select(m => m!.Value).ToList();
    return present.Count == 0 ? null : present.Average();
}
Console.WriteLine(Average(new int?[] { 80, null, 60 })); // 70
Console.WriteLine(Average(new int?[] { null }) is null); // True`,
    },
  ],
  quiz: [
    { question: `What is int? short for?`, options: [`int[]`, `Nullable<int>`, `Optional<int>`, `object`], answer: 1, explanation: `int? is syntactic sugar for the generic struct Nullable<int>.` },
    { question: `What does customer?.Name return when customer is null?`, options: [`An empty string`, `It throws NullReferenceException`, `null`, `"customer"`], answer: 2, explanation: `?. short-circuits and the expression evaluates to null.` },
    { question: `int? a = null; int b = a ?? 7; What is b?`, options: [`7`, `0`, `null`, `Compile error`], answer: 0, explanation: `?? returns the right operand because a is null.` },
    { question: `After string? s = null; s ??= "A"; s ??= "B"; what is s?`, options: [`"B"`, `null`, `"AB"`, `"A"`], answer: 3, explanation: `The first ??= assigns "A"; the second is ignored because s is no longer null.` },
    { question: `What does the null-forgiving operator (name!) do at runtime?`, options: [`Throws if name is null`, `Nothing - it only removes compiler warnings`, `Converts null to ""`, `Creates a new object`], answer: 1, explanation: `! is purely a compile-time hint; there is no runtime check.` },
  ],
};
