export default {
  lesson: 'day-036-linq-where-select-orderby-groupby',
  minutes: 20,
  intro: 'Practise the core LINQ operators: Where, Select (with anonymous types), OrderBy/ThenBy and GroupBy.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'OrderBy + ThenBy: what does this print?',
      example: { title: 'sorting by two keys', code: 'people.OrderBy(p => p.City).ThenByDescending(p => p.Age)' },
      code: `var students = new List<(string Name, string City, int Marks)>
{
    ("Asha", "Pune", 82),
    ("Ravi", "Delhi", 75),
    ("Meena", "Pune", 91),
    ("Kiran", "Delhi", 88),
    ("Om", "Agra", 60)
};
var sorted = students
    .OrderBy(s => s.City)
    .ThenByDescending(s => s.Marks)
    .Select(s => s.Name);
Console.WriteLine(string.Join(" ", sorted));`,
      expected: 'Om Kiran Ravi Meena Asha',
      explain: 'Cities are sorted A→Z (Agra, Delhi, Pune). **Within** the same city, `ThenByDescending` sorts by marks high → low: Kiran (88) before Ravi (75), Meena (91) before Asha (82). Calling `OrderBy` twice would discard the first sort.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'GroupBy with Count and Sum: what does this print?',
      example: { title: 'grouping', code: 'var byDept = emps.GroupBy(e => e.Dept);\nforeach (var g in byDept)\n    Console.WriteLine($"{g.Key}: {g.Count()}");' },
      code: `var sales = new List<(string Region, int Amount)>
{
    ("North", 500), ("South", 300), ("North", 200),
    ("East", 700), ("South", 100), ("North", 100)
};
var report = sales
    .GroupBy(s => s.Region)
    .Select(g => new { Region = g.Key, Orders = g.Count(), Total = g.Sum(x => x.Amount) })
    .OrderByDescending(r => r.Total);
foreach (var r in report)
    Console.WriteLine($"{r.Region}: {r.Orders} orders, {r.Total}");`,
      expected: `North: 3 orders, 800
East: 1 orders, 700
South: 2 orders, 400`,
      explain: '`GroupBy` creates one group per key; `g.Key` is the region and the group itself is the list of its sales. North = 500 + 200 + 100 = 800, South = 400, East = 700. The anonymous type `new { … }` holds the summary, then it is sorted by Total descending.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'From a `List<Employee> emps`, write the method-syntax expression that returns the **names** of employees whose `Salary` is more than 50000. (`emps.____`)',
      example: { title: 'filter then project', code: 'products.Where(p => p.Stock == 0).Select(p => p.Title)' },
      accept: ['emps.Where(e => e.Salary > 50000).Select(e => e.Name)'],
      acceptRegex: ['^emps\\s*\\.\\s*Where\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*\\.\\s*Salary\\s*>\\s*50000\\s*\\)\\s*\\.\\s*Select\\s*\\(\\s*(\\w+)\\s*=>\\s*\\2\\s*\\.\\s*Name\\s*\\)\\s*(\\.\\s*ToList\\s*\\(\\s*\\))?\\s*;?$'],
      caseSensitive: true,
      explain: 'Filter first with `Where`, then project with `Select`. Doing `Select` first would leave only strings, so `Salary` would no longer be available for the filter.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Select with index and Where on strings: what does this print?',
      example: { title: 'Select overload with index', code: 'list.Select((item, i) => $"{i + 1}. {item}")' },
      code: `string[] fruits = { "mango", "apple", "banana", "kiwi", "guava" };
var list = fruits
    .Where(f => f.Contains('a'))
    .OrderBy(f => f.Length)
    .ThenBy(f => f)
    .Select((f, i) => $"{i + 1}.{f}");
foreach (var item in list)
    Console.WriteLine(item);`,
      expected: `1.apple
2.guava
3.mango
4.banana`,
      explain: '"kiwi" has no \'a\', so it is removed. Sorting by length gives the 5-letter words first; `ThenBy(f => f)` orders them alphabetically (apple, guava, mango), then banana (6). The index in `Select((f, i) => …)` is the position in the **sorted** sequence.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the type of each item produced by `orders.GroupBy(o => o.City)`?',
      options: ['string', 'List<Order>', 'IGrouping<string, Order> (a Key plus the orders in that group)', 'Dictionary<string, Order>'],
      answer: 2,
      explain: 'Each group is an `IGrouping<TKey, TElement>`: it has a `.Key` property and can be enumerated to get its elements. Use `ToDictionary` or `ToLookup` if you need a dictionary-like structure.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these LINQ calls are **valid** and do what the comment says? (choose all that apply)',
      options: [
        'nums.OrderByDescending(n => n)   // largest first',
        'people.OrderBy(p => p.Age).ThenBy(p => p.Name)   // by age, then name',
        'people.ThenBy(p => p.Name)   // sort by name',
        'words.Select(w => w.Length)   // lengths of the words',
        'nums.Where(n => n > 5).OrderBy(n => n)   // filtered numbers, ascending',
      ],
      answers: [0, 1, 3, 4],
      explain: '`ThenBy` only exists on an already ordered sequence (`IOrderedEnumerable`), so it must follow `OrderBy`/`OrderByDescending`. The other calls are valid and match their comments.',
    },
  ],
};
