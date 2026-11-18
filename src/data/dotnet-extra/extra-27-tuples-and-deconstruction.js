const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `// Value tuples: group values without creating a class
var student = (Name: "Asha", Age: 22, City: "Pune");   // named elements
Console.WriteLine(student);
Console.WriteLine($"{student.Name} is {student.Age}");
Console.WriteLine(student.Item3);                     // ItemN names always work

(string, int) unnamed = ("Ravi", 30);
Console.WriteLine($"{unnamed.Item1} - {unnamed.Item2}");

// Return several values from one method
int[] marks = { 70, 85, 90, 75 };
var result = Stats(marks);
Console.WriteLine($"Min={result.Min}, Max={result.Max}, Avg={result.Avg}");

// Deconstruct straight into variables
var (min, max, avg) = Stats(marks);
Console.WriteLine($"Range = {max - min}, Avg = {avg}");

// Tuple equality compares element by element
Console.WriteLine((1, "a") == (1, "a"));
Console.WriteLine((1, 2) != (1, 3));

// Swap without a temp variable
int a = 5, b = 9;
(a, b) = (b, a);
Console.WriteLine($"a={a}, b={b}");

static (int Min, int Max, int Avg) Stats(int[] values) =>
    (values.Min(), values.Max(), values.Sum() / values.Length);
`;
const ex2 = `// Deconstruct methods let your own classes be split into variables
var emp = new Employee("Meera", "HR", 48000);

var (name, dept, salary) = emp;           // calls Deconstruct(out, out, out)
Console.WriteLine($"{name} | {dept} | {salary}");

var (onlyName, _, _) = emp;               // discards ignore parts you don't need
Console.WriteLine(onlyName);

var (n2, d2) = emp;                       // overload with 2 out parameters
Console.WriteLine($"{n2} works in {d2}");

// Deconstruct also works with positional patterns
string level = emp switch
{
    (_, "HR", > 45000) => "Senior HR",
    (_, "HR", _) => "HR",
    _ => "Other"
};
Console.WriteLine(level);

// KeyValuePair has a built-in Deconstruct
var prices = new SortedDictionary<string, int> { ["Tea"] = 20, ["Coffee"] = 35 };
foreach (var (item, price) in prices)
    Console.WriteLine($"{item}: {price}");

class Employee
{
    public string Name { get; }
    public string Dept { get; }
    public int Salary { get; }

    public Employee(string name, string dept, int salary) { Name = name; Dept = dept; Salary = salary; }

    public void Deconstruct(out string name, out string dept, out int salary)
    {
        name = Name; dept = Dept; salary = Salary;
    }

    public void Deconstruct(out string name, out string dept)
    {
        name = Name; dept = Dept;
    }
}
`;
const ex3 = `// Tuples in collections, as dictionary keys and in LINQ
var results = new List<(string Name, string Subject, int Marks)>
{
    ("Asha", "Maths", 91),
    ("Ravi", "Maths", 67),
    ("Asha", "Science", 84),
    ("Ravi", "Science", 72),
};

foreach (var (name, subject, marks) in results.Where(r => r.Marks >= 70))
    Console.WriteLine($"{name,-5} {subject,-8} {marks}");

// LINQ that projects into a tuple
var totals = results
    .GroupBy(r => r.Name)
    .Select(g => (Name: g.Key, Total: g.Sum(r => r.Marks)))
    .OrderByDescending(t => t.Total);
foreach (var t in totals)
    Console.WriteLine($"{t.Name}: {t.Total}");

// Composite dictionary key: (City, Item)
var rate = new Dictionary<(string City, string Item), int>
{
    [("Pune", "Tea")] = 15,
    [("Delhi", "Tea")] = 20,
    [("Pune", "Coffee")] = 30,
};
Console.WriteLine(rate[("Delhi", "Tea")]);
Console.WriteLine(rate.ContainsKey(("Delhi", "Coffee")));

// The old System.Tuple class (reference type, read-only, Item1..Item8 only)
Tuple<int, string> old = Tuple.Create(1, "legacy");
Console.WriteLine($"{old.Item1} {old.Item2}");
`;
const ex4 = `// Replacing out parameters with a tuple-returning TryXxx method
string[] inputs = { "25", "abc", "-4" };
foreach (var text in inputs)
{
    var (ok, value, error) = ParseAge(text);
    Console.WriteLine(ok ? $"Valid age {value}" : $"'{text}': {error}");
}

// Classic out-parameter style for comparison
if (int.TryParse("40", out int parsed))
    Console.WriteLine($"TryParse gave {parsed}");

// Tuple returned from a calculation: quotient and remainder at once
var (q, r) = Divide(17, 5);
Console.WriteLine($"17 / 5 = {q} remainder {r}");
Console.WriteLine(Math.DivRem(17, 5));     // built-in method that also returns a tuple

static (bool Ok, int Value, string Error) ParseAge(string text)
{
    if (!int.TryParse(text, out int age)) return (false, 0, "not a number");
    if (age < 0) return (false, 0, "age cannot be negative");
    return (true, age, "");
}

static (int Quotient, int Remainder) Divide(int a, int b) => (a / b, a % b);
`;

export default {
  id: 'extra-27-tuples-and-deconstruction',
  title: 'Tuples and Deconstruction in C#',
  module: 'Extra: Advanced C#',
  extraNo: 27,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Tuples let you group a few values together without writing a class, and deconstruction lets you split an object or tuple back into separate variables. Learn value tuples with named elements, returning multiple values from methods, tuple equality, swapping, custom Deconstruct methods, discards, tuples in LINQ and as dictionary keys, and how ValueTuple differs from the old System.Tuple.`,
  objectives: [
    'Create named and unnamed value tuples and access their elements',
    'Return several values from a method instead of using out parameters',
    'Deconstruct tuples, records, KeyValuePair and your own classes (Deconstruct method)',
    'Use discards (_), tuple equality and tuple swapping',
    'Use tuples in LINQ projections and as composite dictionary keys',
  ],
  theory: [
    {
      heading: 'What is a tuple?',
      content: `A **tuple** is a lightweight group of values: (string Name, int Age). It is perfect when you need to pass or return **two or three related values** but a full class would be overkill.

Analogy: a sealed envelope that contains a ticket, an ID card and a receipt - you hand it over as one thing and the receiver takes the items out.

C# 7 introduced **value tuples** (System.ValueTuple):
- They are **structs** (value types) - cheap, no heap allocation.
- Elements can have **names**: (Name: "Asha", Age: 22). Without names you use Item1, Item2 ...
- Elements are **mutable fields**.
- ToString prints (Asha, 22).`,
      syntax: `var t1 = ("Asha", 22);                    // Item1, Item2
var t2 = (Name: "Asha", Age: 22);         // named elements
(string Name, int Age) t3 = ("Ravi", 30); // named by the type
string city = "Pune";
var t4 = (city, Pin: 411001);             // t4.city inferred name (C# 7.1)`,
      points: [
        'Element names exist only at compile time; at run time the fields are Item1, Item2 ...',
        'A tuple can have any number of elements; above 7 the 8th is stored in a nested Rest tuple',
        'Use a record or class instead when the data has meaning across many methods or layers',
      ],
    },
    {
      heading: 'Returning multiple values from a method',
      content: `Before tuples you had three choices: out parameters, a custom class, or an array of object. Tuples are usually the cleanest for private/internal helpers:

static (int Min, int Max, int Avg) Stats(int[] values) => (values.Min(), values.Max(), values.Sum() / values.Length);

The caller can keep the tuple (result.Min) or **deconstruct** it straight away: var (min, max, avg) = Stats(marks);

A popular pattern is a "Try" method that returns (bool Ok, T Value, string Error) instead of using out parameters, which also works in async methods (out parameters are not allowed in async methods).`,
      syntax: `static (bool Ok, int Value) TryDivide(int a, int b) =>
    b == 0 ? (false, 0) : (true, a / b);

var (ok, value) = TryDivide(10, 2);`,
    },
    {
      heading: 'Deconstruction and discards',
      content: `**Deconstruction** splits a value into variables:
- var (a, b) = tuple;            - new variables with inferred types
- (string n, int age) = tuple;   - explicit types
- (x, y) = (y, x);               - assign to existing variables (swap!)

The **discard** _ ignores values you do not need: var (name, _, salary) = employee;

Any type can be deconstructed if it has a **Deconstruct method** with out parameters (instance or extension method). Records generate one automatically for positional properties; KeyValuePair<TKey, TValue> and DictionaryEntry already have one, so foreach (var (key, value) in dictionary) works.`,
      syntax: `public void Deconstruct(out string name, out string dept)
{
    name = Name;
    dept = Dept;
}

var (n, d) = employee;          // calls Deconstruct
foreach (var (k, v) in dict) { } // KeyValuePair.Deconstruct`,
    },
    {
      heading: 'Tuple equality, tuples in collections and LINQ',
      content: `- **== and !=** compare tuples element by element (C# 7.3): (1, "a") == (1, "a") is true. Names do not matter, only positions.
- Value tuples implement Equals and GetHashCode, so they work as **Dictionary keys** and in **HashSet** - great for composite keys like (City, Item).
- In **LINQ**, Select(x => (x.Name, Total: x.Marks)) projects into a tuple instead of an anonymous type. Unlike anonymous types, tuples can be returned from methods.`,
      syntax: `var rate = new Dictionary<(string City, string Item), int>();
rate[("Pune", "Tea")] = 15;

var top = students
    .Select(s => (s.Name, s.Marks))
    .OrderByDescending(t => t.Marks)
    .First();`,
    },
    {
      heading: 'ValueTuple vs System.Tuple vs anonymous types',
      content: `| Feature | ValueTuple (a, b) | System.Tuple | Anonymous type |
|---|---|---|---|
| Kind | struct | class | class |
| Mutable | yes (fields) | no (read-only properties) | no |
| Element names | yes (compile-time) | only Item1..Item7, Rest | yes |
| Return from a method | yes | yes | no (only as object/dynamic) |
| Deconstruction | yes | yes | no |

Prefer **ValueTuple** in new code. System.Tuple (Tuple.Create(...)) is mainly seen in older code.

When a tuple starts appearing in many places, give it a real name: **record** Student(string Name, int Marks).`,
    },
  ],
  examples: [
    {
      title: 'Named tuples, returning multiple values and swapping',
      scenario: 'Store a student in a tuple, compute min/max/average marks with one method call, compare tuples and swap two numbers.',
      steps: steps('TupleBasics'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `(Asha, 22, Pune)
Asha is 22
Pune
Ravi - 30
Min=70, Max=90, Avg=80
Range = 20, Avg = 80
True
True
a=9, b=5`,
      explanation: `ToString of a tuple prints its values in brackets. Named elements and Item1..ItemN both work. Stats returns three values: min 70, max 90 and integer average 320 / 4 = 80. The second call deconstructs the result directly into three variables. Tuple == compares each element. (a, b) = (b, a) builds a temporary tuple (9, 5) and deconstructs it back, swapping the values.`,
    },
    {
      title: 'Custom Deconstruct methods, discards and positional patterns',
      scenario: 'Split an Employee object into variables, ignore unneeded parts, use a positional pattern, and deconstruct dictionary entries.',
      steps: steps('Deconstruction'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Meera | HR | 48000
Meera
Meera works in HR
Senior HR
Coffee: 35
Tea: 20`,
      explanation: `var (name, dept, salary) = emp calls the 3-parameter Deconstruct. The discards skip dept and salary. var (n2, d2) chooses the 2-parameter overload. The switch uses a positional pattern (_, "HR", > 45000), which also calls Deconstruct: Meera is in HR with 48000, so "Senior HR". SortedDictionary keeps keys in sorted order and its KeyValuePair entries are deconstructed in the foreach.`,
    },
    {
      title: 'Tuples in lists, LINQ and as dictionary keys',
      scenario: 'Store subject results as tuples, filter and group them with LINQ, and look up tea prices by a (City, Item) composite key.',
      steps: steps('TuplesInCollections'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Asha  Maths    91
Asha  Science  84
Ravi  Science  72
Asha: 175
Ravi: 139
20
False
1 legacy`,
      explanation: `{name,-5} left-aligns the name in 5 characters. Only marks of 70 or more are printed (Ravi's 67 is skipped). GroupBy + Select creates (Name, Total) tuples: Asha 91 + 84 = 175, Ravi 67 + 72 = 139. Value tuples have value equality, so ("Delhi", "Tea") finds the entry and ("Delhi", "Coffee") does not exist. Tuple.Create builds an old-style System.Tuple.`,
    },
    {
      title: 'Tuple-returning Try methods instead of out parameters',
      scenario: 'Validate age input and return success, value and error message together; compare with int.TryParse and Math.DivRem.',
      steps: steps('TupleTryPattern'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Valid age 25
'abc': not a number
'-4': age cannot be negative
TryParse gave 40
17 / 5 = 3 remainder 2
(3, 2)`,
      explanation: `ParseAge returns (Ok, Value, Error); the caller deconstructs it and decides what to print. int.TryParse shows the older out-parameter style. Divide returns quotient and remainder at once (17 / 5 = 3, 17 % 5 = 2). Math.DivRem(int, int) in .NET 6+ also returns a tuple, which prints as (3, 2).`,
    },
  ],
  interview: [
    { q: 'What is a value tuple?', a: 'A System.ValueTuple struct that groups several values, e.g. (string Name, int Age). It is a value type with mutable public fields, optional element names and built-in equality.', level: 'Easy' },
    { q: 'Difference between ValueTuple and System.Tuple?', a: 'ValueTuple is a struct with mutable fields and supports named elements and C# tuple syntax. System.Tuple is a reference type (class) with read-only Item1..Item7 properties and no element names.', level: 'Medium' },
    { q: 'Do tuple element names exist at run time?', a: 'No. They are compile-time sugar stored in attributes for method signatures. At run time the fields are Item1, Item2, ... so reflection and serializers (System.Text.Json) see Item1.. or nothing useful.', level: 'Hard' },
    { q: 'Output? var t = (A: 1, B: 2); var u = (X: 1, Y: 2); Console.WriteLine(t == u);', a: 'True. Tuple equality compares by position, names are ignored.', level: 'Medium' },
    { q: 'What is deconstruction?', a: 'Splitting a tuple or object into separate variables: var (a, b) = value; It works for tuples and any type that has a Deconstruct(out ...) method (instance or extension), including records and KeyValuePair.', level: 'Easy' },
    { q: 'How do you make your own class deconstructable?', a: 'Add a public void Deconstruct(out T1 x, out T2 y, ...) method (or an extension method). Overloads with different parameter counts are allowed.', level: 'Easy' },
    { q: 'What is a discard?', a: 'The underscore _ used to ignore a value: var (name, _) = person; out _; or as a catch-all pattern in switch expressions.', level: 'Easy' },
    { q: 'How do you swap two variables using tuples?', a: '(a, b) = (b, a); The right side creates a tuple with the current values, which is then deconstructed into a and b.', level: 'Easy' },
    { q: 'Why can tuples replace out parameters in async methods?', a: 'Async methods cannot have ref or out parameters. Returning Task<(bool Ok, T Value)> gives the same information.', level: 'Medium' },
    { q: 'When should you use a record instead of a tuple?', a: 'When the data crosses layers or public APIs, is used in many places, needs validation/behaviour or must serialize with meaningful names. Tuples are best for short-lived local or private data.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a method GetNameParts(string fullName) that returns (string First, string Last) and print both parts for "Asha Sharma".',
      hint: 'Split on space; return (parts[0], parts[^1]).',
      solution: `var (first, last) = GetNameParts("Asha Sharma");
Console.WriteLine($"First: {first}, Last: {last}");

static (string First, string Last) GetNameParts(string fullName)
{
    var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    return (parts[0], parts[^1]);
}`,
    },
    {
      task: 'Given int[] nums = { 4, 9, 2, 7 }, write one method that returns the count of even numbers and the count of odd numbers as a tuple.',
      hint: 'Use Count(n => n % 2 == 0).',
      solution: `int[] nums = { 4, 9, 2, 7 };
var (even, odd) = EvenOdd(nums);
Console.WriteLine($"Even={even}, Odd={odd}");   // Even=2, Odd=2

static (int Even, int Odd) EvenOdd(int[] a) =>
    (a.Count(n => n % 2 == 0), a.Count(n => n % 2 != 0));`,
    },
    {
      task: 'Add a Deconstruct method to a Product class (Name, Price, Stock) and print only Name and Stock using a discard.',
      hint: 'public void Deconstruct(out string name, out int price, out int stock)',
      solution: `var (name, _, stock) = new Product("Pen", 10, 500);
Console.WriteLine($"{name}: {stock} in stock");

class Product
{
    public string Name; public int Price; public int Stock;
    public Product(string n, int p, int s) { Name = n; Price = p; Stock = s; }
    public void Deconstruct(out string name, out int price, out int stock)
    { name = Name; price = Price; stock = Stock; }
}`,
    },
    {
      task: 'Store attendance as Dictionary<(string Student, DateOnly Day), bool>. Mark Asha present on two days and absent on one, then print how many days Asha was present.',
      hint: 'Use Count over dict entries filtering key.Student == "Asha" and value == true.',
      solution: `var att = new Dictionary<(string Student, DateOnly Day), bool>
{
    [("Asha", new DateOnly(2026, 11, 16))] = true,
    [("Asha", new DateOnly(2026, 11, 17))] = true,
    [("Asha", new DateOnly(2026, 11, 18))] = false,
};
int present = att.Count(e => e.Key.Student == "Asha" && e.Value);
Console.WriteLine($"Asha present: {present} days");   // 2`,
    },
  ],
  quiz: [
    {
      question: 'What type does var t = (1, "a"); create?',
      options: ['System.Tuple<int, string>', 'An anonymous type', 'ValueTuple<int, string>', 'object[]'],
      answer: 2,
      explanation: 'Tuple literal syntax creates a System.ValueTuple struct.',
    },
    {
      question: 'Which method must a class have to support var (a, b) = obj; ?',
      options: ['Deconstruct(out ..., out ...)', 'Split()', 'ToTuple()', 'GetEnumerator()'],
      answer: 0,
      explanation: 'The compiler calls a matching Deconstruct method with out parameters.',
    },
    {
      question: 'int a = 1, b = 2; (a, b) = (b, a); What are a and b now?',
      options: ['1 and 2', '2 and 2', '1 and 1', '2 and 1'],
      answer: 3,
      explanation: 'The tuple (2, 1) is created first and then deconstructed into a and b.',
    },
    {
      question: 'What does the _ do in var (name, _) = person; ?',
      options: ['Creates a variable named _', 'Discards the second value', 'Throws if the value is null', 'Copies the whole object'],
      answer: 1,
      explanation: '_ is a discard: the value is ignored and no variable is created.',
    },
    {
      question: 'Why do value tuples work well as Dictionary keys?',
      options: ['They are reference types', 'They are always immutable', 'They implement value-based Equals and GetHashCode', 'Dictionaries convert keys to strings'],
      answer: 2,
      explanation: 'ValueTuple compares and hashes its elements, so two tuples with the same values find the same entry.',
    },
  ],
};
