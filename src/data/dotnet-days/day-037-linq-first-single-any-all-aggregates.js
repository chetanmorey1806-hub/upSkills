const data = `var students = new List<Student>
{
    new(1, "Asha",  85, "Pune"),
    new(2, "Ravi",  42, "Mumbai"),
    new(3, "Meena", 92, "Pune"),
    new(4, "John",  30, "Delhi"),
    new(5, "Priya", 76, "Mumbai"),
};`;

const rec = `record Student(int Roll, string Name, int Marks, string City);`;

const head = `using System;
using System.Collections.Generic;
using System.Linq;

`;

const ex1 = `${head}${data}

Student firstPune = students.First(s => s.City == "Pune");
Console.WriteLine("First from Pune: " + firstPune.Name);

Student? chennai = students.FirstOrDefault(s => s.City == "Chennai");
Console.WriteLine("First from Chennai: " + (chennai?.Name ?? "none"));

Console.WriteLine("Last above 70: " + students.Last(s => s.Marks > 70).Name);

int[] empty = { };
Console.WriteLine("FirstOrDefault on empty int[]: " + empty.FirstOrDefault());
Console.WriteLine("With custom default: " + empty.FirstOrDefault(-1));

try
{
    Student found = students.First(s => s.Marks > 100);
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("First error: " + ex.Message);
}

${rec}`;

const ex2 = `${head}${data}

Student s3 = students.Single(s => s.Roll == 3);
Console.WriteLine("Roll 3: " + s3.Name);

Student? s9 = students.SingleOrDefault(s => s.Roll == 9);
Console.WriteLine("Roll 9: " + (s9 == null ? "not found" : s9.Name));

try
{
    Student m = students.Single(s => s.City == "Mumbai");      // 2 matches
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Single error: " + ex.Message);
}

try
{
    Student? p = students.SingleOrDefault(s => s.City == "Pune"); // 2 matches
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("SingleOrDefault error: " + ex.Message);
}

try
{
    Student x = students.Single(s => s.Roll == 99);            // 0 matches
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Single (none) error: " + ex.Message);
}

${rec}`;

const ex3 = `${head}${data}

Console.WriteLine("Any failed (< 35)? " + students.Any(s => s.Marks < 35));
Console.WriteLine("All passed? " + students.All(s => s.Marks >= 35));
Console.WriteLine("All have a name? " + students.All(s => s.Name.Length > 0));
Console.WriteLine("Any students at all? " + students.Any());
Console.WriteLine("Total students: " + students.Count());
Console.WriteLine("Distinction (75+): " + students.Count(s => s.Marks >= 75));
Console.WriteLine("Any from Delhi? " + students.Select(s => s.City).Contains("Delhi"));

var empty = new List<Student>();
Console.WriteLine("All on empty list: " + empty.All(s => s.Marks > 90));
Console.WriteLine("Any on empty list: " + empty.Any());

${rec}`;

const ex4 = `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

${data}

int total = students.Sum(s => s.Marks);
double average = students.Average(s => s.Marks);
int highest = students.Max(s => s.Marks);
int lowest = students.Min(s => s.Marks);

Console.WriteLine("Total marks: " + total);
Console.WriteLine("Average: " + average.ToString("0.00", CultureInfo.InvariantCulture));
Console.WriteLine("Highest: " + highest + ", Lowest: " + lowest);

// MaxBy / MinBy (.NET 6+) return the whole object, not just the number
Student topper = students.MaxBy(s => s.Marks)!;
Student weakest = students.MinBy(s => s.Marks)!;
Console.WriteLine($"Topper: {topper.Name}, needs help: {weakest.Name}");

double puneAvg = students.Where(s => s.City == "Pune").Average(s => s.Marks);
Console.WriteLine("Pune average: " + puneAvg.ToString("0.00", CultureInfo.InvariantCulture));

// Sum / Average on a plain number array
int[] scores = { 10, 20, 25 };
Console.WriteLine($"Sum {scores.Sum()}, Avg {scores.Average().ToString("0.00", CultureInfo.InvariantCulture)}");

// Average on an empty sequence throws; Sum returns 0
var none = new List<int>();
Console.WriteLine("Sum of empty: " + none.Sum());
try { none.Average(); }
catch (InvalidOperationException ex) { Console.WriteLine("Average of empty: " + ex.Message); }

${rec}`;

const ex5 = `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

${data}

Console.WriteLine("=== Student Result Analysis ===");
foreach (var s in students)
    Console.WriteLine($"{s.Roll}. {s.Name}: {s.Marks} ({Grade(s.Marks)})");

int passed = students.Count(s => s.Marks >= 35);
Console.WriteLine($"Passed: {passed}/{students.Count}");
Console.WriteLine("Pass percentage: " + (passed * 100 / students.Count) + "%");
Console.WriteLine("Class average: " + students.Average(s => s.Marks).ToString("0.00", CultureInfo.InvariantCulture));

var topper = students.OrderByDescending(s => s.Marks).First();
Console.WriteLine($"Topper: {topper.Name} ({topper.Marks})");

bool anyFail = students.Any(s => s.Marks < 35);
string failedNames = string.Join(", ", students.Where(s => s.Marks < 35).Select(s => s.Name));
Console.WriteLine(anyFail ? "Failed: " + failedNames : "Everyone passed");

Console.WriteLine("--- City-wise ---");
foreach (var g in students.GroupBy(s => s.City).OrderBy(x => x.Key))
{
    string avg = g.Average(s => s.Marks).ToString("0.00", CultureInfo.InvariantCulture);
    Console.WriteLine($"{g.Key}: {g.Count()} student(s), avg {avg}, best {g.Max(s => s.Marks)}");
}

static string Grade(int marks) =>
    marks >= 85 ? "A" :
    marks >= 60 ? "B" :
    marks >= 35 ? "C" : "F";

${rec}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below',
  'Press Ctrl+F5 to run. Press F5 instead to see Visual Studio stop on the InvalidOperationException lines if you remove the try/catch',
];

export default {
  id: 'day-037-linq-first-single-any-all-aggregates',
  title: 'LINQ: First, FirstOrDefault, Single, Any, All, Count, Sum, Average',
  module: 'Module 3: Advanced C# Programming',
  day: 37,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Element operators pick one item (First, FirstOrDefault, Last, Single, SingleOrDefault), quantifiers answer yes/no questions (Any, All, Contains), and aggregate operators calculate one value (Count, Sum, Average, Min, Max, MaxBy, MinBy). Learn when each one throws, what the OrDefault versions return, and use them together in a complete student result analysis.',
  objectives: [
    'Choose correctly between First, FirstOrDefault, Single and SingleOrDefault',
    'Know which operators throw InvalidOperationException and when',
    'Answer yes/no questions with Any, All and Contains (including empty-sequence behaviour)',
    'Calculate Count, Sum, Average, Min, Max and use MaxBy/MinBy to get whole objects',
    'Build a student result analysis report with LINQ',
  ],
  theory: [
    {
      heading: 'Element operators: First, FirstOrDefault, Last',
      content: 'First returns the first element (optionally the first that matches a condition). If nothing is found it throws InvalidOperationException. FirstOrDefault returns default(T) instead: null for classes/records, 0 for int, false for bool. Since .NET 6 you can pass your own default value: FirstOrDefault(-1). Last and LastOrDefault work the same from the end. All of them execute immediately.',
      syntax: `Student s  = students.First(s => s.City == "Pune");          // throws if none
Student? x = students.FirstOrDefault(s => s.City == "Goa");   // null if none
int n      = numbers.FirstOrDefault(n => n > 100, -1);        // -1 if none
Student l  = students.Last(s => s.Marks > 70);`,
      tip: 'Use First when "not found" is a bug; use FirstOrDefault + null check when "not found" is a normal situation (searching by user input).',
    },
    {
      heading: 'Single and SingleOrDefault',
      content: 'Single asserts that EXACTLY one element matches. It throws if there are zero matches ("Sequence contains no matching element") or more than one ("Sequence contains more than one matching element"). SingleOrDefault returns default for zero matches but still throws for more than one. Use them for lookups by a unique key (Id, roll number, email) where duplicates would mean corrupt data.',
      points: [
        'First: 0 -> throw, 1 -> item, many -> first item',
        'FirstOrDefault: 0 -> default, 1 -> item, many -> first item',
        'Single: 0 -> throw, 1 -> item, many -> throw',
        'SingleOrDefault: 0 -> default, 1 -> item, many -> throw',
        'Single must check the whole sequence to make sure there is no second match; First stops at the first match, so it is faster',
        'In EF Core, Find(id) or FirstOrDefaultAsync(x => x.Id == id) are typical for lookups by primary key',
      ],
    },
    {
      heading: 'Quantifiers: Any, All, Contains',
      content: 'Any() returns true if the sequence has at least one element; Any(predicate) returns true if at least one element matches. All(predicate) returns true if every element matches. Contains(value) checks if a value is present. They stop as soon as the answer is known (short-circuit). Beware the empty-sequence rule: All on an empty sequence returns true (there is no element that breaks the rule), Any returns false.',
      syntax: `bool hasFailures = students.Any(s => s.Marks < 35);
bool allPassed   = students.All(s => s.Marks >= 35);
bool hasDelhi    = cities.Contains("Delhi");
bool notEmpty    = students.Any();      // better than Count() > 0`,
      tip: 'Use Any() instead of Count() > 0: Any stops at the first element, Count may need to walk the whole sequence (or run COUNT(*) in the database).',
    },
    {
      heading: 'Count, Sum, Average, Min, Max',
      content: 'Aggregate operators turn a sequence into a single value and execute immediately. Count() counts elements (Count(predicate) counts matches; LongCount for huge data). Sum, Average, Min and Max take an optional selector lambda. Average of ints returns double. On an empty sequence Sum returns 0 and Count returns 0, but Average, Min and Max on non-nullable numbers throw InvalidOperationException ("Sequence contains no elements").',
      syntax: `int total     = students.Sum(s => s.Marks);
double avg    = students.Average(s => s.Marks);
int max       = students.Max(s => s.Marks);
int count     = students.Count(s => s.Marks >= 75);

// List<T> also has a Count PROPERTY (no brackets) - faster, no LINQ needed
int size = students.Count;`,
      points: [
        'Print averages with ToString("0.00", CultureInfo.InvariantCulture) so the output is the same on every PC',
        'Integer division: total / count gives an int; Average gives a double',
        'Aggregate((a, b) => ...) is the general version for custom accumulations',
      ],
    },
    {
      heading: 'MaxBy and MinBy (.NET 6+)',
      content: 'Max(s => s.Marks) returns the highest NUMBER (92), not the student. To get the student with the highest marks use MaxBy(s => s.Marks) (or the older pattern OrderByDescending(...).First()). MaxBy/MinBy return the first element with the max/min key, or null for an empty sequence of reference types.',
      syntax: `int bestMarks   = students.Max(s => s.Marks);     // 92
Student best    = students.MaxBy(s => s.Marks)!;  // Meena object
Student oldWay  = students.OrderByDescending(s => s.Marks).First();`,
    },
    {
      heading: 'Choosing the right operator - quick guide',
      content: 'Ask yourself what you want back: one item, a yes/no answer, or a number. Then decide what should happen when nothing matches.',
      points: [
        'One item, must exist -> First / Single',
        'One item, may not exist -> FirstOrDefault / SingleOrDefault + null check',
        'Is there any...? -> Any(predicate)',
        'Do all...? -> All(predicate)',
        'How many? -> Count(predicate)',
        'Total / mean / range -> Sum / Average / Min / Max',
        'Which object has the biggest...? -> MaxBy / MinBy',
      ],
    },
  ],
  examples: [
    {
      title: 'First, FirstOrDefault and Last',
      scenario: 'Find the first student from Pune, try to find someone from Chennai, get the last student above 70, and see the behaviour on an empty array and when nothing matches.',
      steps: steps('LinqFirst'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `First from Pune: Asha
First from Chennai: none
Last above 70: Priya
FirstOrDefault on empty int[]: 0
With custom default: -1
First error: Sequence contains no matching element`,
      explanation: 'Asha and Meena are from Pune; First returns Asha. No one is from Chennai, so FirstOrDefault returns null and ?? prints "none". Students above 70 are Asha, Meena, Priya; Last returns Priya. For an empty int[] the default is 0, or -1 with the .NET 6+ overload. First with no match throws InvalidOperationException.',
    },
    {
      title: 'Single and SingleOrDefault for unique lookups',
      scenario: 'Look up students by roll number (unique) and see what happens when the condition matches 0 or 2 students.',
      steps: steps('LinqSingle'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Roll 3: Meena
Roll 9: not found
Single error: Sequence contains more than one matching element
SingleOrDefault error: Sequence contains more than one matching element
Single (none) error: Sequence contains no matching element`,
      explanation: 'Roll 3 matches exactly one student. Roll 9 matches none, so SingleOrDefault returns null. Mumbai (Ravi, Priya) and Pune (Asha, Meena) each have two students, so both Single and SingleOrDefault throw - the OrDefault version only protects against "zero", not against "more than one". Single with zero matches also throws.',
    },
    {
      title: 'Any, All, Count and Contains',
      scenario: 'Answer the class teacher\'s yes/no questions and counts, including the surprising empty-list behaviour.',
      steps: steps('LinqAnyAll'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Any failed (< 35)? True
All passed? False
All have a name? True
Any students at all? True
Total students: 5
Distinction (75+): 3
Any from Delhi? True
All on empty list: True
Any on empty list: False`,
      explanation: 'John has 30 marks, so Any(< 35) is True and All(>= 35) is False. Students with 75+ are Asha (85), Meena (92) and Priya (76) - Count gives 3. Contains works on the projected city names. All on an empty list returns True because no element violates the condition (vacuous truth), while Any returns False.',
    },
    {
      title: 'Sum, Average, Min, Max, MaxBy, MinBy',
      scenario: 'Calculate class statistics: total, average, highest and lowest marks, the topper and weakest student, the Pune average, and the empty-sequence behaviour.',
      steps: steps('LinqAggregates'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Total marks: 325
Average: 65.00
Highest: 92, Lowest: 30
Topper: Meena, needs help: John
Pune average: 88.50
Sum 55, Avg 18.33
Sum of empty: 0
Average of empty: Sequence contains no elements`,
      explanation: '85 + 42 + 92 + 30 + 76 = 325 and 325 / 5 = 65. Max/Min return numbers; MaxBy/MinBy return the Student objects (Meena, John). Pune: (85 + 92) / 2 = 88.5, printed as 88.50 with the invariant format. 10 + 20 + 25 = 55 and 55 / 3 = 18.333..., formatted to 18.33. Sum of an empty list is 0, but Average of an empty list throws.',
    },
    {
      title: 'Complete student result analysis (practical)',
      scenario: 'Print every student with a grade, the pass count and percentage, class average, topper, failed students and a city-wise summary.',
      steps: steps('StudentResultAnalysis'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `=== Student Result Analysis ===
1. Asha: 85 (A)
2. Ravi: 42 (C)
3. Meena: 92 (A)
4. John: 30 (F)
5. Priya: 76 (B)
Passed: 4/5
Pass percentage: 80%
Class average: 65.00
Topper: Meena (92)
Failed: John
--- City-wise ---
Delhi: 1 student(s), avg 30.00, best 30
Mumbai: 2 student(s), avg 59.00, best 76
Pune: 2 student(s), avg 88.50, best 92`,
      explanation: 'Grade uses a chained conditional expression. Count(predicate) gives 4 passed students; 4 * 100 / 5 = 80 (integer maths, multiply first). students.Count without brackets is the List property. OrderByDescending(...).First() is the classic way to get the topper. Any decides which message to print. Groups are sorted by city name; Mumbai average = (42 + 76) / 2 = 59.',
    },
  ],
  interview: [
    { q: 'Difference between First and FirstOrDefault?', a: 'Both return the first matching element. If there is no match, First throws InvalidOperationException while FirstOrDefault returns default(T) (null for reference types, 0 for int).', level: 'Easy' },
    { q: 'Difference between First and Single?', a: 'First returns the first match and ignores others. Single requires exactly one match and throws if there are zero or more than one. Single must scan the whole sequence, so First is faster.', level: 'Medium' },
    { q: 'Does SingleOrDefault throw any exception?', a: 'Yes - when more than one element matches it throws InvalidOperationException. It returns default only when there are zero matches.', level: 'Medium' },
    { q: 'What does All return on an empty sequence?', a: 'true, because there is no element that fails the condition. Any returns false on an empty sequence.', level: 'Hard' },
    { q: 'Why prefer Any() over Count() > 0?', a: 'Any stops after the first element (or first match); Count may enumerate everything. With EF Core, Any becomes EXISTS which is cheaper than COUNT(*).', level: 'Medium' },
    { q: 'What does Average return for an int sequence?', a: 'A double. On an empty sequence of non-nullable numbers it throws InvalidOperationException.', level: 'Easy' },
    { q: 'What is the difference between Max and MaxBy?', a: 'Max(selector) returns the maximum key value (e.g. 92). MaxBy(selector), added in .NET 6, returns the element that has the maximum key (e.g. the Student object).', level: 'Medium' },
    { q: 'What is the difference between list.Count and list.Count()?', a: 'Count (property) is stored in List<T> and returns instantly. Count() is the LINQ extension method; it is optimized for ICollection but can also take a predicate and works on any IEnumerable.', level: 'Medium' },
    { q: 'What is the output? int[] a = { }; Console.Write(a.Sum() + "," + a.FirstOrDefault());', a: '0,0. Sum of empty is 0 and FirstOrDefault returns default(int) = 0.', level: 'Easy' },
    { q: 'What is the output? new[] { 2, 4, 6 }.All(x => x % 2 == 0) + " " + new[] { 2, 4, 6 }.Any(x => x > 5)', a: 'True True', level: 'Easy' },
    { q: 'What is the output? new[] { 5, 5 }.Single(x => x == 5)', a: 'It throws InvalidOperationException: Sequence contains more than one matching element.', level: 'Medium' },
    { q: 'Are aggregate operators deferred?', a: 'No. Count, Sum, Average, Min, Max, First, Single, Any and All execute immediately and return a value.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Given int[] marks = { 56, 78, 91, 34, 67 }, print the first mark above 80, the first mark above 95 (or -1 if none), and the count of marks below 40.',
      hint: 'First, FirstOrDefault(predicate, -1), Count(predicate).',
      solution: `using System;
using System.Linq;

int[] marks = { 56, 78, 91, 34, 67 };
Console.WriteLine(marks.First(m => m > 80));               // 91
Console.WriteLine(marks.FirstOrDefault(m => m > 95, -1));  // -1
Console.WriteLine(marks.Count(m => m < 40));               // 1`,
    },
    {
      task: 'Write FindStudent(int roll) that uses SingleOrDefault and prints "Not found" when the result is null. Test with an existing and a missing roll number.',
      hint: 'Student? s = students.SingleOrDefault(x => x.Roll == roll);',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

var students = new List<Student> { new(1, "Asha"), new(2, "Ravi") };
FindStudent(students, 2);
FindStudent(students, 7);

static void FindStudent(List<Student> list, int roll)
{
    Student? s = list.SingleOrDefault(x => x.Roll == roll);
    Console.WriteLine(s == null ? "Not found" : "Found " + s.Name);
}
record Student(int Roll, string Name);
// Found Ravi
// Not found`,
    },
    {
      task: 'For a list of products (Name, Price, Stock) print: is any product out of stock, are all prices above 100, total stock value (Price * Stock) and the most expensive product name.',
      hint: 'Any, All, Sum(p => p.Price * p.Stock), MaxBy.',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

var products = new List<Product>
{
    new("Mouse", 500, 10), new("Cable", 150, 0), new("Monitor", 9000, 3),
};
Console.WriteLine("Out of stock? " + products.Any(p => p.Stock == 0));    // True
Console.WriteLine("All above 100? " + products.All(p => p.Price > 100));  // True
Console.WriteLine("Stock value: " + products.Sum(p => p.Price * p.Stock)); // 32000
Console.WriteLine("Costliest: " + products.MaxBy(p => p.Price)!.Name);    // Monitor
record Product(string Name, int Price, int Stock);`,
    },
    {
      task: 'Using the students list from the examples, print the average marks of students who passed (>= 35) with two decimals, and the name of the student with the lowest marks among those who passed.',
      hint: 'Filter with Where first, then Average and MinBy.',
      solution: `var passed = students.Where(s => s.Marks >= 35);
Console.WriteLine(passed.Average(s => s.Marks).ToString("0.00", CultureInfo.InvariantCulture)); // 73.75
Console.WriteLine(passed.MinBy(s => s.Marks)!.Name);   // Ravi`,
    },
    {
      task: 'Check whether a list of user names contains duplicates using LINQ (two ways).',
      hint: 'Compare Count() with Distinct().Count(), or GroupBy and Any(g => g.Count() > 1).',
      solution: `using System;
using System.Linq;

string[] users = { "asha", "ravi", "meena", "ravi" };
bool dup1 = users.Distinct().Count() != users.Length;
bool dup2 = users.GroupBy(u => u).Any(g => g.Count() > 1);
Console.WriteLine($"{dup1} {dup2}");   // True True`,
    },
  ],
  quiz: [
    { question: 'Which operator returns null (for a class type) when no element matches?', options: ['First', 'Single', 'FirstOrDefault', 'Last'], answer: 2, explanation: 'FirstOrDefault returns default(T), which is null for reference types.' },
    { question: 'Single(predicate) throws when...', options: ['zero or more than one element matches', 'exactly one element matches', 'the list has more than one element in total', 'never'], answer: 0, explanation: 'Single requires exactly one match.' },
    { question: 'What does new List<int>().All(x => x > 10) return?', options: ['false', 'It throws', 'null', 'true'], answer: 3, explanation: 'All on an empty sequence returns true.' },
    { question: 'What does students.Max(s => s.Marks) return?', options: ['The Student with the highest marks', 'The highest marks value', 'The index of the topper', 'A sorted list'], answer: 1, explanation: 'Max returns the key value; MaxBy returns the element.' },
    { question: 'Which call on an EMPTY List<int> throws InvalidOperationException?', options: ['Sum()', 'Count()', 'Average()', 'Any()'], answer: 2, explanation: 'Average (and Min/Max) of an empty non-nullable sequence throws; Sum and Count return 0.' },
  ],
};
