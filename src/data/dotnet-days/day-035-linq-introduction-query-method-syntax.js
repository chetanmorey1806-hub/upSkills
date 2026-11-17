const ex1 = `using System;
using System.Collections.Generic;
using System.Linq;

int[] marks = { 45, 92, 67, 30, 88, 75 };

// 1. Without LINQ: loop + if + temporary list
var manual = new List<int>();
foreach (int m in marks)
{
    if (m >= 60)
        manual.Add(m);
}
Console.WriteLine("Loop:   " + string.Join(", ", manual));

// 2. LINQ query syntax (looks like SQL)
var q = from m in marks
        where m >= 60
        select m;
Console.WriteLine("Query:  " + string.Join(", ", q));

// 3. LINQ method syntax (extension methods + lambda)
var mth = marks.Where(m => m >= 60);
Console.WriteLine("Method: " + string.Join(", ", mth));`;

const ex2 = `using System;
using System.Collections.Generic;
using System.Linq;

var students = new List<Student>
{
    new("Asha", 85, "CS"),
    new("Ravi", 58, "IT"),
    new("Meena", 92, "CS"),
    new("John", 40, "IT"),
    new("Priya", 76, "CS"),
};

// Query syntax: filter + sort + select
var toppers = from s in students
              where s.Marks >= 75
              orderby s.Marks descending
              select s;

Console.WriteLine("Students with 75+ marks:");
foreach (var s in toppers)
    Console.WriteLine($"  {s.Name} - {s.Marks}");

// Method syntax: two conditions + projection to a string
var csNames = students
    .Where(s => s.Branch == "CS" && s.Marks > 80)
    .Select(s => s.Name.ToUpperInvariant());
Console.WriteLine("CS above 80: " + string.Join(", ", csNames));

// Failed students (below 50)
var failed = from s in students where s.Marks < 50 select s.Name;
Console.WriteLine("Failed: " + string.Join(", ", failed));

record Student(string Name, int Marks, string Branch);`;

const ex3 = `using System;
using System.Collections.Generic;
using System.Linq;

var numbers = new List<int> { 1, 2, 3 };

var query = numbers.Where(n => n > 1);       // only DEFINED here, not run
numbers.Add(4);
Console.WriteLine("Deferred: " + string.Join(", ", query));

var snapshot = numbers.Where(n => n > 1).ToList();   // runs NOW
numbers.Add(5);
Console.WriteLine("Query again: " + string.Join(", ", query));
Console.WriteLine("Snapshot: " + string.Join(", ", snapshot));

// Watch when the lambda actually runs
var traced = numbers.Where(n =>
{
    Console.WriteLine($"  checking {n}");
    return n % 2 == 0;
});
Console.WriteLine("Query created, nothing checked yet");
foreach (int n in traced)
    Console.WriteLine($"  got {n}");`;

const ex4 = `using System;
using System.Linq;

string[] names = { "Asha", "Ravi", "Meena", "Arjun", "Kiran" };

// let creates a temporary variable inside a query
var aNames = from n in names
             let upper = n.ToUpperInvariant()
             where upper.StartsWith("A")
             select $"{n} ({n.Length})";
Console.WriteLine("Starts with A: " + string.Join(", ", aNames));

// Mixing syntaxes: query syntax in brackets, then a method
int longNames = (from n in names where n.Length > 4 select n).Count();
Console.WriteLine("Names longer than 4 letters: " + longNames);

// A string is IEnumerable<char>, so LINQ works on it too
int vowels = "programming".Count(c => "aeiou".Contains(c));
Console.WriteLine("Vowels in programming: " + vowels);

// Same query in both syntaxes gives the same result
var q1 = from n in names orderby n select n;
var q2 = names.OrderBy(n => n);
Console.WriteLine("Sorted: " + string.Join(", ", q1));
Console.WriteLine("Same result: " + q1.SequenceEqual(q2));`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below (using System.Linq is also included by implicit usings)',
  'Press Ctrl+F5 to run. Set a breakpoint (F9) on the foreach line and step with F11 to see the lambda run only when the loop asks for items',
];

export default {
  id: 'day-035-linq-introduction-query-method-syntax',
  title: 'LINQ Introduction, Query Syntax, Method Syntax',
  module: 'Module 3: Advanced C# Programming',
  day: 35,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'LINQ (Language Integrated Query) lets you filter, sort and transform any collection with short, readable expressions instead of loops. Learn what LINQ is, IEnumerable<T>, the two styles (query syntax and method syntax with lambdas), the let keyword, deferred execution vs immediate execution (ToList, Count), and how LINQ connects to EF Core later. Practical: filter students by marks.',
  objectives: [
    'Explain what LINQ is and which data sources it works with',
    'Write queries in query syntax (from, where, orderby, select, let)',
    'Write the same queries in method syntax with lambda expressions',
    'Understand deferred execution and force immediate execution with ToList/ToArray/Count',
    'Filter a list of students by marks using both syntaxes',
  ],
  theory: [
    {
      heading: 'What is LINQ?',
      content: 'LINQ (Language Integrated Query, C# 3.0 / .NET 3.5) adds query capabilities directly into C#. Instead of writing a loop, an if and a temporary list every time, you describe WHAT you want ("students with marks >= 60, sorted by name") and LINQ does the looping. The same syntax works on arrays, List<T>, Dictionary, XML (LINQ to XML) and databases (LINQ to Entities in EF Core - Day 84), where the query is translated to SQL.',
      points: [
        'Namespace: System.Linq (part of the implicit usings in .NET 6+)',
        'Works on anything that implements IEnumerable<T> (LINQ to Objects) or IQueryable<T> (EF Core)',
        'Benefits: less code, readable, type-safe (compile-time checked), IntelliSense support',
        'Each LINQ method returns a new sequence - the original collection is never changed',
      ],
      tip: 'Analogy: without LINQ you walk through the library shelf by shelf yourself. With LINQ you give the librarian a request slip ("all C# books after 2020, sorted by title") and get the result.',
    },
    {
      heading: 'IEnumerable<T> and lambda expressions',
      content: 'IEnumerable<T> is the interface that means "you can foreach over me". Arrays, List<T>, HashSet<T>, Dictionary<K,V>, strings (IEnumerable<char>) all implement it. LINQ methods like Where and Select are extension methods on IEnumerable<T>, so they appear on every collection. Most of them take a lambda expression: a short inline function written as parameter => expression.',
      syntax: `x => x * 2                 // input x, returns x * 2
s => s.Marks >= 60         // returns bool (a condition, used by Where)
(a, b) => a + b            // two parameters
n => { Console.WriteLine(n); return n > 0; }   // block body`,
      points: [
        'The lambda passed to Where is a Func<T, bool> (a predicate)',
        'The lambda passed to Select is a Func<T, TResult> (a projection)',
      ],
    },
    {
      heading: 'Query syntax',
      content: 'Query syntax looks like SQL but starts with from and ends with select (or group). The compiler translates it into method calls, so it is only a different way of writing the same thing. It is especially readable for joins, grouping and let.',
      syntax: `var result = from s in students          // range variable s
             where s.Marks >= 60          // filter
             orderby s.Name               // sort (ascending by default)
             select s.Name;               // what to return

// let: store an intermediate value
var q = from s in students
        let percent = s.Marks * 100 / 120
        where percent > 50
        select new { s.Name, percent };`,
      points: [
        'Keywords: from, in, where, select, orderby, ascending, descending, group, by, into, join, on, equals, let',
        'There is no query keyword for Count, Sum, First, Take etc. - call those methods on the query',
      ],
    },
    {
      heading: 'Method syntax (fluent syntax)',
      content: 'Method syntax calls extension methods one after another (method chaining) with lambdas. Every query syntax expression can be written in method syntax, but not the other way round: Count, Sum, First, Take, Skip, Distinct, Any and many more exist only as methods. Method syntax is the most common style in real projects and in EF Core code.',
      syntax: `var result = students
    .Where(s => s.Marks >= 60)
    .OrderBy(s => s.Name)
    .Select(s => s.Name);

int count = students.Count(s => s.Marks >= 60);`,
      tip: 'Format long chains with one method per line, each starting with a dot - Ctrl+K, Ctrl+D in Visual Studio formats the document.',
    },
    {
      heading: 'Deferred vs immediate execution',
      content: 'A LINQ query such as Where or Select is not executed when it is defined. It is only a recipe. It runs when you enumerate it (foreach, string.Join, ToList) - and it runs again every time you enumerate it, seeing the current contents of the source. Methods that return a single value or a new collection execute immediately: ToList, ToArray, ToDictionary, Count, Sum, First, Any, Max.',
      points: [
        'Deferred: Where, Select, OrderBy, GroupBy, Take, Skip, Distinct',
        'Immediate: ToList, ToArray, Count, Sum, Average, Min, Max, First, Single, Any, All',
        'Call ToList() when you need a snapshot or want to avoid running an expensive query twice',
        'In EF Core, deferred execution means the SQL is sent to the database only when you call ToList / First / Count',
      ],
    },
    {
      heading: 'Query syntax vs method syntax - which to use?',
      content: 'Both compile to the same code and have the same performance. Use whichever is clearer. Many teams use method syntax by default and query syntax for complex joins or when let makes the query easier to read. You can also mix them: wrap a query expression in brackets and call a method on it.',
      syntax: `int n = (from s in students where s.Marks > 80 select s).Count();`,
    },
  ],
  examples: [
    {
      title: 'Same filter three ways: loop, query syntax, method syntax',
      scenario: 'Find all marks of 60 and above. Compare the classic loop with the two LINQ styles.',
      steps: steps('LinqIntro'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `Loop:   92, 67, 88, 75
Query:  92, 67, 88, 75
Method: 92, 67, 88, 75`,
      explanation: 'All three return the marks >= 60 in their original order. The loop needs 6 lines and a temporary list; the LINQ versions describe the filter in one expression. The query syntax is translated by the compiler into marks.Where(m => m >= 60) - exactly the method syntax version.',
    },
    {
      title: 'Filter students by marks (practical)',
      scenario: 'From a list of Student records, show the toppers sorted by marks, CS students above 80 in capital letters, and the failed students.',
      steps: steps('FilterStudents'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Students with 75+ marks:
  Meena - 92
  Asha - 85
  Priya - 76
CS above 80: ASHA, MEENA
Failed: John`,
      explanation: 'The query syntax filters marks >= 75 (Asha 85, Meena 92, Priya 76) and orderby ... descending sorts them highest first. The method syntax combines two conditions with && and uses Select to turn each Student into an upper-case name. The last query uses Select to return only the Name string; only John (40) is below 50.',
    },
    {
      title: 'Deferred execution in action',
      scenario: 'Prove that a LINQ query runs only when it is enumerated and sees later changes to the list, while ToList takes a snapshot.',
      steps: steps('DeferredExecution'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Deferred: 2, 3, 4
Query again: 2, 3, 4, 5
Snapshot: 2, 3, 4
Query created, nothing checked yet
  checking 1
  checking 2
  got 2
  checking 3
  checking 4
  got 4
  checking 5`,
      explanation: '4 was added after the query was defined but still appears, because the query runs when string.Join enumerates it. ToList ran immediately, so the snapshot does not contain 5, while the query (run again) does. The traced query prints nothing when created; during foreach, Where checks one item at a time and hands each match to the loop immediately (streaming), which is why "checking" and "got" lines are interleaved.',
    },
    {
      title: 'let, mixing syntaxes, LINQ on strings',
      scenario: 'Use let for a temporary value, count with a query in brackets, count vowels in a string, and check that both syntaxes return the same sequence.',
      steps: steps('LinqSyntaxMix'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Starts with A: Asha (4), Arjun (5)
Names longer than 4 letters: 3
Vowels in programming: 3
Sorted: Arjun, Asha, Kiran, Meena, Ravi
Same result: True`,
      explanation: 'let stores the upper-case name so it can be used in where. Meena, Arjun and Kiran have 5 letters (> 4). "programming" contains o, a and i: 3 vowels - a string is a sequence of chars so Count with a lambda works. orderby n and OrderBy(n => n) sort alphabetically (Arjun before Asha because r < s), and SequenceEqual confirms both results are identical.',
    },
  ],
  interview: [
    { q: 'What is LINQ?', a: 'Language Integrated Query: a set of C# language features and .NET extension methods that let you query collections, databases, XML and more with a uniform, type-safe syntax.', level: 'Easy' },
    { q: 'What are the two LINQ syntaxes?', a: 'Query syntax (from ... where ... select, SQL-like) and method syntax (chained extension methods with lambdas, e.g. list.Where(x => ...).Select(...)). The compiler converts query syntax into method syntax.', level: 'Easy' },
    { q: 'Which namespace is required for LINQ?', a: 'System.Linq. In .NET 6+ console and web projects it is included by implicit global usings.', level: 'Easy' },
    { q: 'What is deferred execution?', a: 'A LINQ query is not executed when defined but when it is enumerated (foreach, ToList, etc.). It re-executes every time it is enumerated and reflects the current data.', level: 'Medium' },
    { q: 'Name operators that cause immediate execution.', a: 'ToList, ToArray, ToDictionary, Count, Sum, Average, Min, Max, First, FirstOrDefault, Single, Any, All, Contains.', level: 'Medium' },
    { q: 'Can every query be written in query syntax?', a: 'No. Operators such as Count, Sum, Take, Skip, Distinct, First have no query keyword; you must call them as methods (you can wrap the query in brackets and call them).', level: 'Medium' },
    { q: 'What is a lambda expression?', a: 'An anonymous inline function written as (parameters) => expression or => { statements }. LINQ methods accept lambdas as Func delegates, e.g. s => s.Marks > 60.', level: 'Easy' },
    { q: 'What is the difference between IEnumerable<T> and IQueryable<T>?', a: 'IEnumerable<T> queries run in memory with compiled delegates (LINQ to Objects). IQueryable<T> builds an expression tree that a provider (EF Core) translates into another language such as SQL and runs on the database server.', level: 'Hard' },
    { q: 'What is the output? var list = new List<int>{1,2}; var q = list.Select(x => x * 10); list.Add(3); Console.Write(string.Join(",", q));', a: '10,20,30. Deferred execution: the query runs at string.Join, after 3 was added.', level: 'Medium' },
    { q: 'What is the output? var list = new List<int>{1,2}; var q = list.Select(x => x * 10).ToList(); list.Add(3); Console.Write(q.Count);', a: '2. ToList executed the query immediately, before 3 was added.', level: 'Medium' },
    { q: 'What does the let keyword do in query syntax?', a: 'It introduces a new range variable holding an intermediate calculated value that can be used in later clauses (where, orderby, select).', level: 'Medium' },
    { q: 'Does LINQ modify the original collection?', a: 'No. Standard query operators return new sequences; the source collection is unchanged (unless your lambda itself has side effects).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Given int[] nums = { 5, 12, 8, 21, 3, 16 }, print the even numbers using query syntax and the numbers greater than 10 using method syntax.',
      hint: 'where n % 2 == 0 / nums.Where(n => n > 10).',
      solution: `using System;
using System.Linq;

int[] nums = { 5, 12, 8, 21, 3, 16 };
var even = from n in nums where n % 2 == 0 select n;
var big = nums.Where(n => n > 10);
Console.WriteLine("Even: " + string.Join(", ", even));   // Even: 12, 8, 16
Console.WriteLine("> 10: " + string.Join(", ", big));    // > 10: 12, 21, 16`,
    },
    {
      task: 'Create a list of students (Name, Marks). Print the names of students with marks between 60 and 80 (inclusive), sorted by name.',
      hint: 'where s.Marks >= 60 && s.Marks <= 80 orderby s.Name select s.Name.',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

var students = new List<(string Name, int Marks)>
{
    ("Ravi", 72), ("Asha", 85), ("John", 60), ("Meena", 79), ("Sara", 45),
};
var mid = from s in students
          where s.Marks >= 60 && s.Marks <= 80
          orderby s.Name
          select s.Name;
Console.WriteLine(string.Join(", ", mid));   // John, Meena, Ravi`,
    },
    {
      task: 'Rewrite this query in method syntax: from s in students where s.Branch == "IT" orderby s.Marks descending select s.Name',
      hint: 'Where, OrderByDescending, Select.',
      solution: `var result = students
    .Where(s => s.Branch == "IT")
    .OrderByDescending(s => s.Marks)
    .Select(s => s.Name);`,
    },
    {
      task: 'Given string[] words = { "apple", "Banana", "cherry", "avocado", "Apricot" }, print words that start with "a" (ignore case), converted to upper case.',
      hint: 'w.StartsWith("a", StringComparison.OrdinalIgnoreCase).',
      solution: `using System;
using System.Linq;

string[] words = { "apple", "Banana", "cherry", "avocado", "Apricot" };
var result = words
    .Where(w => w.StartsWith("a", StringComparison.OrdinalIgnoreCase))
    .Select(w => w.ToUpperInvariant());
Console.WriteLine(string.Join(", ", result));   // APPLE, AVOCADO, APRICOT`,
    },
    {
      task: 'Demonstrate deferred execution: define a query of names longer than 3 letters, add a new name to the list, then print the query. Then repeat with ToList() and explain the difference.',
      hint: 'Print before and after adding with and without ToList.',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

var names = new List<string> { "Al", "Asha", "Ravi" };
var lazy = names.Where(n => n.Length > 3);
var snap = names.Where(n => n.Length > 3).ToList();
names.Add("Meena");
Console.WriteLine("Deferred: " + string.Join(", ", lazy));  // Asha, Ravi, Meena
Console.WriteLine("ToList:   " + string.Join(", ", snap));  // Asha, Ravi`,
    },
  ],
  quiz: [
    { question: 'What does LINQ stand for?', options: ['Linked Integrated Query', 'Language Integrated Query', 'List Iteration Query', 'Language Internal Queue'], answer: 1, explanation: 'LINQ = Language Integrated Query.' },
    { question: 'Which keyword must a LINQ query syntax expression start with?', options: ['select', 'where', 'from', 'query'], answer: 2, explanation: 'Query expressions start with from and end with select or group.' },
    { question: 'Which call executes a query immediately?', options: ['Where', 'Select', 'OrderBy', 'ToList'], answer: 3, explanation: 'ToList enumerates the query and stores the results; Where/Select/OrderBy are deferred.' },
    { question: 'What is the method syntax for: from n in nums where n > 5 select n?', options: ['nums.Where(n => n > 5)', 'nums.Select(n > 5)', 'nums.Filter(n => n > 5)', 'nums.Find(n > 5)'], answer: 0, explanation: 'The where clause becomes Where with a lambda; select n (identity) needs no Select call.' },
    { question: 'Which interface must a collection implement to use LINQ to Objects?', options: ['IDisposable', 'IComparable', 'ICloneable', 'IEnumerable<T>'], answer: 3, explanation: 'LINQ to Objects operators are extension methods on IEnumerable<T>.' },
  ],
};
