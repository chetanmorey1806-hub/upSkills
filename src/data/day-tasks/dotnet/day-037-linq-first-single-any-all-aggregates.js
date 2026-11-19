export default {
  lesson: 'day-037-linq-first-single-any-all-aggregates',
  minutes: 18,
  intro: 'Practise LINQ element operators (First, FirstOrDefault, Single), quantifiers (Any, All) and aggregates (Count, Sum, Average, Min, Max).',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Aggregates on a list of marks: what does this print?',
      example: { title: 'aggregate methods', code: 'int[] n = { 2, 4, 6 };\nn.Sum()      // 12\nn.Average()  // 4\nn.Max()      // 6' },
      code: `int[] marks = { 60, 75, 90, 45, 80 };
Console.WriteLine(marks.Count());
Console.WriteLine(marks.Count(m => m >= 75));
Console.WriteLine(marks.Sum());
Console.WriteLine(marks.Average());
Console.WriteLine(marks.Min() + " to " + marks.Max());`,
      expected: `5
3
350
70
45 to 90`,
      explain: '`Count(predicate)` counts only matching items (75, 90, 80). `Average()` on ints returns a **double**: 350 / 5 = 70, printed as `70`. Min and Max give 45 and 90.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'First vs FirstOrDefault: what does this print?',
      example: { title: 'safe first element', code: 'var p = products.FirstOrDefault(x => x.Price > 1000);\nif (p == null) Console.WriteLine("None");' },
      code: `var cities = new List<string> { "Pune", "Patna", "Delhi", "Pune" };
Console.WriteLine(cities.First());
Console.WriteLine(cities.First(c => c.StartsWith("P") && c != "Pune"));
string city = cities.FirstOrDefault(c => c.StartsWith("M"));
Console.WriteLine(city == null ? "No M city" : city);
int[] empty = { };
Console.WriteLine(empty.FirstOrDefault());
Console.WriteLine(cities.Last());`,
      expected: `Pune
Patna
No M city
0
Pune`,
      explain: '`First` returns the first match. `FirstOrDefault` returns the **default value** when nothing matches: null for string, 0 for int. Calling `First(c => c.StartsWith("M"))` instead would throw InvalidOperationException.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`var s = students.Single(x => x.City == "Pune");` and **two** students are from Pune. What happens?',
      options: ['It returns the first Pune student', 'It returns null', 'It throws InvalidOperationException (sequence contains more than one matching element)', 'It returns both'],
      answer: 2,
      explain: '`Single` asserts there is **exactly one** match: zero or more than one throws. `SingleOrDefault` returns default for zero matches but still throws for more than one. Use Single for unique keys like an ID.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Any and All: what does this print?',
      example: { title: 'quantifiers return bool', code: 'list.Any()                 // is there at least one item?\nlist.All(x => x > 0)       // do all items match?' },
      code: `var fees = new List<int> { 1200, 800, 1500, 950 };
Console.WriteLine(fees.Any(f => f > 1400));
Console.WriteLine(fees.All(f => f >= 1000));
Console.WriteLine(fees.Any());
var none = new List<int>();
Console.WriteLine(none.Any());
Console.WriteLine(none.All(f => f > 1000000));`,
      expected: `True
False
True
False
True`,
      explain: '1500 > 1400 so Any is True; 800 < 1000 so All is False. On an empty list `Any()` is False, but `All(...)` is **True** (no item breaks the rule; "vacuous truth"). Remember this edge case!',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Given `List<Product> products` (each with a `decimal Price`), write the expression that returns the **average price** of products whose `Category` is "Books". (`products.____`)',
      example: { title: 'aggregate with a selector', code: 'orders.Where(o => o.City == "Pune").Sum(o => o.Amount)' },
      accept: ['products.Where(p => p.Category == "Books").Average(p => p.Price)'],
      acceptRegex: ['^products\\s*\\.\\s*Where\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*\\.\\s*Category\\s*==\\s*"Books"\\s*\\)\\s*\\.\\s*(Average\\s*\\(\\s*(\\w+)\\s*=>\\s*\\3\\s*\\.\\s*Price\\s*\\)|Select\\s*\\(\\s*(\\w+)\\s*=>\\s*\\4\\s*\\.\\s*Price\\s*\\)\\s*\\.\\s*Average\\s*\\(\\s*\\))\\s*;?$'],
      caseSensitive: true,
      explain: 'Filter with `Where`, then pass a selector to `Average(p => p.Price)` (or `Select` the prices first). Note: `Average` on an **empty** sequence of non-nullable numbers throws InvalidOperationException, so check `Any()` first when the category might be empty.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which calls **throw an exception** when the sequence is empty? (choose all that apply)',
      options: ['First()', 'FirstOrDefault()', 'Single()', 'Max() on an int[]', 'Count()', 'Sum() on an int[]'],
      answers: [0, 2, 3],
      explain: '`First`, `Single` and `Max`/`Min`/`Average` on empty non-nullable sequences throw InvalidOperationException. `FirstOrDefault` returns default, `Count` returns 0 and `Sum` returns 0.',
    },
  ],
};
