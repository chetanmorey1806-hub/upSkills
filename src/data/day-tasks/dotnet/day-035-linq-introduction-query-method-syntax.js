export default {
  lesson: 'day-035-linq-introduction-query-method-syntax',
  minutes: 18,
  intro: 'Practise the basics of LINQ: query syntax vs method syntax, lambda expressions and deferred execution.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Query syntax: what does this print?',
      example: { title: 'query syntax shape', code: 'var result = from n in numbers\n             where n > 10\n             select n * 2;' },
      code: `int[] marks = { 45, 78, 92, 33, 67, 88 };
var passed = from m in marks
             where m >= 60
             orderby m descending
             select m;
foreach (var m in passed)
    Console.Write(m + " ");`,
      expected: '92 88 78 67',
      explain: 'A query starts with `from` (range variable), filters with `where`, sorts with `orderby … descending` and ends with `select`. Only marks ≥ 60 remain, sorted from highest to lowest.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Rewrite this query in **method syntax** (fill in the right-hand side):\n`var cheap = from p in prices where p < 500 select p;`\n`var cheap = ______________________;`',
      example: { title: 'method syntax with a lambda', code: 'var evens = numbers.Where(n => n % 2 == 0);' },
      accept: ['prices.Where(p => p < 500)', 'prices.Where(p => p < 500).Select(p => p)'],
      acceptRegex: ['^prices\\s*\\.\\s*Where\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*<\\s*500\\s*\\)(\\s*\\.\\s*Select\\s*\\(\\s*(\\w+)\\s*=>\\s*\\4\\s*\\))?\\s*;?$'],
      caseSensitive: true,
      explain: 'Query syntax is translated by the compiler into method calls: `where` → `.Where(lambda)`. A `select p` that returns the item unchanged can be omitted. `p => p < 500` is a lambda: input on the left, expression on the right.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Method syntax with Select: what does this print?',
      example: { title: 'Select transforms each item', code: 'var upper = names.Select(n => n.ToUpper());' },
      code: `var names = new List<string> { "asha", "ravi", "meena", "om" };
var result = names
    .Where(n => n.Length > 2)
    .Select(n => char.ToUpper(n[0]) + n.Substring(1) + "(" + n.Length + ")");
Console.WriteLine(string.Join(", ", result));`,
      expected: 'Asha(4), Ravi(4), Meena(5)',
      explain: '`Where` removes "om" (length 2). `Select` builds a new string for each remaining name: capitalised first letter plus the length. Methods are chained left to right, each working on the previous result.',
    },
    {
      type: 'output',
      mins: 3,
      q: '**Deferred execution**: what does this print?',
      example: { title: 'a query is a recipe, not a result', code: 'var q = list.Where(x => x > 5);   // nothing runs yet\nforeach (var x in q) …            // runs now\nvar snapshot = q.ToList();        // runs immediately and stores the result' },
      code: `var orders = new List<int> { 100, 250, 400 };
var big = orders.Where(o => o > 200);
var bigNow = orders.Where(o => o > 200).ToList();
orders.Add(900);
Console.WriteLine(big.Count());
Console.WriteLine(bigNow.Count);`,
      expected: `3
2`,
      explain: 'A LINQ query is executed only when you enumerate it. `big` runs after 900 was added, so it finds 250, 400, 900 → 3. `ToList()` executes **immediately** and stores a snapshot, so `bigNow` still has 2 items.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which namespace provides the LINQ extension methods like `Where`, `Select` and `OrderBy`?',
      options: ['System.Collections', 'System.Linq', 'System.Data', 'System.Query'],
      answer: 1,
      explain: 'LINQ to Objects lives in **System.Linq** (extension methods on `IEnumerable<T>`). Without `using System.Linq;` (or implicit usings), `list.Where(...)` does not compile.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about LINQ are TRUE? (choose all that apply)',
      options: [
        'LINQ works on arrays, lists and any IEnumerable<T>',
        'Query syntax and method syntax can produce the same result',
        'LINQ modifies the original list when you call Where',
        'Some operators like Count(), Sum() and ToList() execute the query immediately',
        'LINQ can also query databases through Entity Framework Core',
      ],
      answers: [0, 1, 3, 4],
      explain: 'LINQ operators return **new sequences**; they never change the source collection. Aggregates and `ToList`/`ToArray` force immediate execution. The same LINQ style is used with EF Core to generate SQL.',
    },
  ],
};
