const data = `var employees = new List<Employee>
{
    new(1, "Asha",  "IT",    65000, 5),
    new(2, "Ravi",  "HR",    42000, 3),
    new(3, "Meena", "IT",    80000, 8),
    new(4, "John",  "Sales", 38000, 2),
    new(5, "Priya", "HR",    52000, 6),
    new(6, "Kiran", "IT",    65000, 3),
    new(7, "Sara",  "Sales", 47000, 4),
};`;

const rec = `record Employee(int Id, string Name, string Dept, int Salary, int Experience);`;

const head = `using System;
using System.Collections.Generic;
using System.Linq;

`;

const ex1 = `${head}${data}

// Where with two conditions
var itHigh = employees.Where(e => e.Dept == "IT" && e.Salary > 60000);
Console.WriteLine("IT employees earning above 60000:");
foreach (var e in itHigh)
    Console.WriteLine($"  {e.Name} ({e.Dept}) {e.Salary}");

// Chained Where calls = AND
var seniorNonIt = employees
    .Where(e => e.Experience >= 5)
    .Where(e => e.Dept != "IT");
Console.WriteLine("Non-IT with 5+ years: " + string.Join(", ", seniorNonIt.Select(e => e.Name)));

// Where with index: every second employee (index 0, 2, 4, 6)
var everyOther = employees.Where((e, index) => index % 2 == 0).Select(e => e.Name);
Console.WriteLine("Even positions: " + string.Join(", ", everyOther));

// Query syntax with OR
var hrOrSales = from e in employees
                where e.Dept == "HR" || e.Dept == "Sales"
                select e.Name;
Console.WriteLine("HR or Sales: " + string.Join(", ", hrOrSales));

${rec}`;

const ex2 = `${head}${data}

// Select to an anonymous type
var payslips = employees.Select(e => new
{
    e.Name,
    Annual = e.Salary * 12,
    Bonus = e.Salary / 10
});
foreach (var p in payslips.Take(3))
    Console.WriteLine($"{p.Name}: annual {p.Annual}, bonus {p.Bonus}");

Console.WriteLine(payslips.First());   // anonymous types have a readable ToString

// Select with index
var numbered = employees.Select((e, i) => $"{i + 1}. {e.Name}").Take(3);
Console.WriteLine(string.Join(" | ", numbered));

// Select a single property
List<string> depts = employees.Select(e => e.Dept).Distinct().ToList();
Console.WriteLine("Departments: " + string.Join(", ", depts));

// SelectMany flattens a sequence of sequences
string[] sentences = { "LINQ is fun", "C# rocks" };
var words = sentences.SelectMany(s => s.Split(' '));
Console.WriteLine("Words: " + string.Join("|", words));

${rec}`;

const ex3 = `${head}${data}

// Sort by department, then highest salary first, then by name
var sorted = employees
    .OrderBy(e => e.Dept)
    .ThenByDescending(e => e.Salary)
    .ThenBy(e => e.Name);

foreach (var e in sorted)
    Console.WriteLine($"{e.Dept} | {e.Salary} | {e.Name}");

// Query syntax: several keys separated by commas
var byExperience = from e in employees
                   orderby e.Experience descending, e.Name
                   select e.Name;
Console.WriteLine("By experience: " + string.Join(", ", byExperience));

// Top 3 earners (OrderByDescending + Take)
var top3 = employees.OrderByDescending(e => e.Salary).Take(3).Select(e => e.Name);
Console.WriteLine("Top 3 salaries: " + string.Join(", ", top3));

${rec}`;

const ex4 = `${head}${data}

// GroupBy: keys appear in the order they are first found
var byDept = employees.GroupBy(e => e.Dept);
foreach (var g in byDept)
{
    Console.WriteLine($"{g.Key} ({g.Count()}): {string.Join(", ", g.Select(e => e.Name))}");
}

// Group + aggregate per group into a summary
var summary = employees
    .GroupBy(e => e.Dept)
    .Select(g => new { Dept = g.Key, Total = g.Sum(e => e.Salary), Max = g.Max(e => e.Salary) })
    .OrderByDescending(x => x.Total);
foreach (var s in summary)
    Console.WriteLine($"{s.Dept}: total {s.Total}, highest {s.Max}");

// Query syntax: group ... by ... into
var seniority = from e in employees
                group e by e.Experience >= 5 into g
                select new { Senior = g.Key, Count = g.Count() };
foreach (var s in seniority)
    Console.WriteLine($"Senior: {s.Senior}, count {s.Count}");

${rec}`;

const ex5 = `${head}${data}

Print("IT sorted by name", Search(employees, "IT", null, "name"));
Print("Salary >= 50000", Search(employees, null, 50000, "salary"));
Print("Sales >= 40000", Search(employees, "Sales", 40000, "name"));

// Build the query step by step - only the filters that were requested
static IEnumerable<Employee> Search(IEnumerable<Employee> source, string? dept, int? minSalary, string sortBy)
{
    var query = source;
    if (dept != null)
        query = query.Where(e => e.Dept == dept);
    if (minSalary != null)
        query = query.Where(e => e.Salary >= minSalary);

    query = sortBy == "name"
        ? query.OrderBy(e => e.Name)
        : query.OrderByDescending(e => e.Salary);
    return query;
}

static void Print(string title, IEnumerable<Employee> list)
{
    Console.WriteLine(title + ": " + string.Join(", ", list.Select(e => $"{e.Name}({e.Salary})")));
}

${rec}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below (the Employee record is declared at the bottom)',
  'Press Ctrl+F5 to run. While debugging (F5), hover over a query variable and expand Results View to see the items',
];

export default {
  id: 'day-036-linq-where-select-orderby-groupby',
  title: 'LINQ: Where, Select, OrderBy, ThenBy, GroupBy',
  module: 'Module 3: Advanced C# Programming',
  day: 36,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'The most used LINQ operators in detail: Where for filtering, Select/SelectMany for projection (including anonymous types), OrderBy/OrderByDescending with ThenBy/ThenByDescending for multi-level sorting, Take/Distinct, and GroupBy for grouping with per-group aggregates - in both query and method syntax. Practical: employee filtering and a dynamic search method.',
  objectives: [
    'Filter data with Where using multiple conditions and the index overload',
    'Project data with Select into new shapes and anonymous types; flatten with SelectMany',
    'Sort on several keys with OrderBy, ThenBy and their Descending versions',
    'Group data with GroupBy and calculate totals per group',
    'Compose queries dynamically for an employee search screen',
  ],
  theory: [
    {
      heading: 'Where - filtering',
      content: 'Where keeps only the elements for which the predicate (a lambda returning bool) is true. The order of the elements is unchanged. Combine conditions with && and ||, or chain several Where calls (chaining means AND). An overload also gives the index of each element: Where((item, index) => ...).',
      syntax: `employees.Where(e => e.Dept == "IT" && e.Salary > 60000)
employees.Where(e => e.Experience >= 5).Where(e => e.Dept != "IT")
employees.Where((e, i) => i % 2 == 0)

// query syntax
from e in employees where e.Salary > 50000 select e`,
      tip: 'Analogy: Where is a sieve - only the items that match fall through, in the same order they went in.',
    },
    {
      heading: 'Select and SelectMany - projection',
      content: 'Select transforms each element into something else: one property, a calculation, a string, a new object or an anonymous type. The number of elements stays the same. Anonymous types (new { e.Name, Annual = e.Salary * 12 }) are handy for results you only need locally; their property names are inferred from the expression. SelectMany projects each element to a collection and flattens all those collections into one sequence.',
      syntax: `employees.Select(e => e.Name)                                 // IEnumerable<string>
employees.Select(e => new { e.Name, Annual = e.Salary * 12 })   // anonymous type
employees.Select((e, i) => $"{i + 1}. {e.Name}")              // with index
orders.SelectMany(o => o.Items)                               // flatten lists

// query syntax
from e in employees select new { e.Name, e.Dept }`,
      points: [
        'Anonymous types are read-only and have value-based Equals and a readable ToString',
        'Use a named class/record (DTO) instead when the result leaves the method (Day 90)',
        'Distinct() removes duplicates; Take(n)/Skip(n) take or skip items',
      ],
    },
    {
      heading: 'OrderBy, OrderByDescending, ThenBy, ThenByDescending',
      content: 'OrderBy sorts ascending by a key; OrderByDescending sorts descending. To sort by a second key when the first key is equal, chain ThenBy or ThenByDescending - do NOT call OrderBy twice, because a second OrderBy re-sorts the whole sequence and discards the first order. LINQ sorting is stable: items with equal keys keep their original relative order.',
      syntax: `employees.OrderBy(e => e.Dept)
         .ThenByDescending(e => e.Salary)
         .ThenBy(e => e.Name);

// query syntax: comma-separated keys
from e in employees
orderby e.Dept, e.Salary descending, e.Name
select e;`,
      tip: 'Strings are sorted with the current culture by default. For culture-independent sorting use OrderBy(e => e.Name, StringComparer.Ordinal).',
    },
    {
      heading: 'GroupBy - grouping',
      content: 'GroupBy splits a sequence into groups that share the same key. The result is a sequence of IGrouping<TKey, TElement>: each group has a Key property and is itself a sequence of its elements, so you can foreach over it or run Count, Sum, Max, Average on it. Groups appear in the order in which their keys are first found in the source.',
      syntax: `var groups = employees.GroupBy(e => e.Dept);
foreach (var g in groups)
{
    Console.WriteLine(g.Key + ": " + g.Count());
    foreach (var e in g) Console.WriteLine("  " + e.Name);
}

// query syntax
from e in employees
group e by e.Dept into g
select new { Dept = g.Key, Total = g.Sum(x => x.Salary) };`,
      points: [
        'The key can be any expression: a property, a bool (e.Salary > 50000), a calculation (e.Age / 10)',
        'Group by several properties with an anonymous key: GroupBy(e => new { e.Dept, e.City })',
        'GroupBy is like GROUP BY in SQL (Day 45); in EF Core it is translated to SQL',
      ],
    },
    {
      heading: 'Building a pipeline and composing queries',
      content: 'Operators can be chained in any order, each working on the output of the previous one. A typical order is Where (filter early to reduce work) -> OrderBy -> Select -> Take. Because queries are deferred, you can build them step by step - add a Where only if the user entered a filter - and execute once at the end. This is exactly how search screens and Web API filtering (Day 97) are built with EF Core.',
      syntax: `IEnumerable<Employee> q = employees;
if (dept != null)      q = q.Where(e => e.Dept == dept);
if (minSalary != null) q = q.Where(e => e.Salary >= minSalary);
q = q.OrderBy(e => e.Name);
var page = q.Skip(0).Take(10).ToList();`,
    },
  ],
  examples: [
    {
      title: 'Employee filtering with Where',
      scenario: 'HR wants several lists: IT staff earning above 60000, non-IT staff with 5+ years, every second employee in the list, and everyone from HR or Sales.',
      steps: steps('EmployeeWhere'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `IT employees earning above 60000:
  Asha (IT) 65000
  Meena (IT) 80000
  Kiran (IT) 65000
Non-IT with 5+ years: Priya
Even positions: Asha, Meena, John, Sara
HR or Sales: Ravi, John, Priya, Sara`,
      explanation: 'Where keeps the original order. Employees with 5+ years are Asha (5), Meena (8) and Priya (6); the second Where removes the IT ones, leaving Priya. The index overload keeps indexes 0, 2, 4, 6 (Asha, Meena, John, Sara). The query syntax uses || for OR.',
    },
    {
      title: 'Select: anonymous types, index, Distinct, SelectMany',
      scenario: 'Create payslip objects with annual salary and bonus, number the employees, list the distinct departments and flatten sentences into words.',
      steps: steps('EmployeeSelect'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Asha: annual 780000, bonus 6500
Ravi: annual 504000, bonus 4200
Meena: annual 960000, bonus 8000
{ Name = Asha, Annual = 780000, Bonus = 6500 }
1. Asha | 2. Ravi | 3. Meena
Departments: IT, HR, Sales
Words: LINQ|is|fun|C#|rocks`,
      explanation: 'Select creates an anonymous object per employee (65000 x 12 = 780000, 65000 / 10 = 6500). The compiler generates ToString for anonymous types, printing { Name = ..., ... }. The index overload numbers items from 0, so we add 1. Distinct keeps the first occurrence of each department in order. SelectMany turns two arrays of words into one flat sequence of 5 words.',
    },
    {
      title: 'Multi-level sorting with OrderBy and ThenBy',
      scenario: 'Show employees grouped visually by department, highest salary first inside a department, and by name when salaries tie. Also sort by experience and find the top 3 earners.',
      steps: steps('EmployeeSort'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `HR | 52000 | Priya
HR | 42000 | Ravi
IT | 80000 | Meena
IT | 65000 | Asha
IT | 65000 | Kiran
Sales | 47000 | Sara
Sales | 38000 | John
By experience: Meena, Priya, Asha, Sara, Kiran, Ravi, John
Top 3 salaries: Meena, Asha, Kiran`,
      explanation: 'Departments sort alphabetically (HR, IT, Sales). Inside IT, ThenByDescending puts 80000 first; Asha and Kiran both earn 65000, so ThenBy(Name) decides: Asha before Kiran. In the query syntax, Kiran and Ravi both have 3 years and are sorted by name. For the top 3, Asha and Kiran tie at 65000 and keep their original order because LINQ sorting is stable.',
    },
    {
      title: 'GroupBy: department-wise lists and totals',
      scenario: 'Print each department with its employee count and names, a salary summary per department sorted by total, and a senior/junior count.',
      steps: steps('EmployeeGroupBy'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `IT (3): Asha, Meena, Kiran
HR (2): Ravi, Priya
Sales (2): John, Sara
IT: total 210000, highest 80000
HR: total 94000, highest 52000
Sales: total 85000, highest 47000
Senior: True, count 3
Senior: False, count 4`,
      explanation: 'Groups appear in first-seen order: IT (Asha is first), HR (Ravi), Sales (John). Each group is a sequence, so Count, Select, Sum and Max work on it. IT total = 65000 + 80000 + 65000 = 210000; HR = 42000 + 52000 = 94000; Sales = 38000 + 47000 = 85000. The bool key groups by Experience >= 5: Asha, Meena, Priya are True (3); the other 4 are False. True comes first because Asha (the first employee) is senior.',
    },
    {
      title: 'Dynamic employee search (composing a query)',
      scenario: 'A search screen has optional filters (department, minimum salary) and a sort option. Only the filters the user filled in should be applied.',
      steps: steps('EmployeeSearch'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `IT sorted by name: Asha(65000), Kiran(65000), Meena(80000)
Salary >= 50000: Meena(80000), Asha(65000), Kiran(65000), Priya(52000)
Sales >= 40000: Sara(47000)`,
      explanation: 'Search starts with the full sequence and adds a Where only when a filter value is given (null means "no filter"). e.Salary >= minSalary compares an int with an int? using lifted operators. The second search has no department filter and sorts by salary descending; Asha and Kiran tie and keep their original order. Nothing executes until Print calls string.Join.',
    },
  ],
  interview: [
    { q: 'What does Where return?', a: 'A deferred IEnumerable<T> containing only the elements for which the predicate returns true, in their original order.', level: 'Easy' },
    { q: 'Difference between Select and SelectMany?', a: 'Select maps each element to exactly one result (a list of lists stays a list of lists). SelectMany maps each element to a collection and flattens all of them into a single sequence.', level: 'Medium' },
    { q: 'Why use ThenBy instead of a second OrderBy?', a: 'ThenBy adds a secondary sort key applied only when earlier keys are equal. A second OrderBy re-sorts the whole sequence by the new key, losing the first ordering (except through stability).', level: 'Medium' },
    { q: 'Is LINQ OrderBy stable?', a: 'Yes. Elements with equal keys keep their original relative order.', level: 'Hard' },
    { q: 'What does GroupBy return?', a: 'IEnumerable<IGrouping<TKey, TElement>>. Each IGrouping has a Key property and enumerates the elements of that group.', level: 'Medium' },
    { q: 'In what order do groups come out of GroupBy?', a: 'In the order in which each key first appears in the source sequence (not sorted). Add OrderBy(g => g.Key) for sorted groups.', level: 'Medium' },
    { q: 'What is an anonymous type?', a: 'A compiler-generated, read-only class created with new { Name = ..., Age = ... }. It is used for temporary projections, mainly in LINQ Select. It has value equality and a generated ToString.', level: 'Easy' },
    { q: 'How do you group by two properties?', a: 'Use an anonymous key: GroupBy(e => new { e.Dept, e.City }). Then g.Key.Dept and g.Key.City are available.', level: 'Medium' },
    { q: 'What is the output? new[] { 3, 1, 2 }.OrderByDescending(x => x).Select(x => x * 2) printed with string.Join(",")', a: '6,4,2', level: 'Easy' },
    { q: 'What is the output? new[] { "bb", "a", "cc", "d" }.GroupBy(s => s.Length).Select(g => g.Key + ":" + g.Count()) joined by space', a: '2:2 1:2. Key 2 is found first ("bb"), then key 1 ("a").', level: 'Medium' },
    { q: 'Write the query syntax for: sort employees by Dept ascending and Salary descending.', a: 'from e in employees orderby e.Dept, e.Salary descending select e', level: 'Easy' },
    { q: 'Why is it better to call Where before OrderBy?', a: 'Filtering first reduces the number of elements that need to be sorted, which is cheaper; the result is the same.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Using the employees list, print the names of employees whose salary is between 40000 and 60000, sorted by salary ascending.',
      hint: 'Where with two conditions, then OrderBy(e => e.Salary).',
      solution: `var mid = employees
    .Where(e => e.Salary >= 40000 && e.Salary <= 60000)
    .OrderBy(e => e.Salary)
    .Select(e => $"{e.Name}({e.Salary})");
Console.WriteLine(string.Join(", ", mid));
// Ravi(42000), Sara(47000), Priya(52000)`,
    },
    {
      task: 'Project each employee into an anonymous object { Name, Grade } where Grade is "A" for salary >= 60000, "B" for >= 45000, else "C". Print all.',
      hint: 'Use a conditional expression inside Select.',
      solution: `var graded = employees.Select(e => new
{
    e.Name,
    Grade = e.Salary >= 60000 ? "A" : e.Salary >= 45000 ? "B" : "C"
});
foreach (var g in graded) Console.WriteLine($"{g.Name}: {g.Grade}");
// Asha: A, Ravi: C, Meena: A, John: C, Priya: B, Kiran: A, Sara: B`,
    },
    {
      task: 'Sort employees by Experience descending, then by Salary descending, then by Name. Print Name-Experience-Salary.',
      hint: 'OrderByDescending, ThenByDescending, ThenBy.',
      solution: `var sorted = employees
    .OrderByDescending(e => e.Experience)
    .ThenByDescending(e => e.Salary)
    .ThenBy(e => e.Name);
foreach (var e in sorted)
    Console.WriteLine($"{e.Name}-{e.Experience}-{e.Salary}");
// Meena-8-80000, Priya-6-52000, Asha-5-65000, Sara-4-47000,
// Kiran-3-65000, Ravi-3-42000, John-2-38000`,
    },
    {
      task: 'Group employees by department and print the department name with the average salary (as an integer) sorted by department name.',
      hint: 'GroupBy, then OrderBy(g => g.Key), then (int)g.Average(...).',
      solution: `foreach (var g in employees.GroupBy(e => e.Dept).OrderBy(x => x.Key))
    Console.WriteLine($"{g.Key}: {(int)g.Average(e => e.Salary)}");
// HR: 47000
// IT: 70000
// Sales: 42500`,
    },
    {
      task: 'Group a list of words by their first letter (upper case) and print each letter with the words, e.g. "A: apple, avocado".',
      hint: 'GroupBy(w => char.ToUpperInvariant(w[0])).',
      solution: `using System;
using System.Linq;

string[] words = { "apple", "banana", "avocado", "blueberry", "cherry" };
foreach (var g in words.GroupBy(w => char.ToUpperInvariant(w[0])))
    Console.WriteLine($"{g.Key}: {string.Join(", ", g)}");
// A: apple, avocado
// B: banana, blueberry
// C: cherry`,
    },
  ],
  quiz: [
    { question: 'Which operator transforms each element into a new shape?', options: ['Where', 'Select', 'GroupBy', 'OrderBy'], answer: 1, explanation: 'Select is the projection operator.' },
    { question: 'How do you add a secondary descending sort key?', options: ['.OrderByDescending() again', '.Reverse()', '.ThenByDescending()', '.SortBy()'], answer: 2, explanation: 'ThenByDescending sorts items that are equal on the previous keys.' },
    { question: 'What property holds the group value in each IGrouping?', options: ['Key', 'Name', 'Value', 'Id'], answer: 0, explanation: 'IGrouping<TKey, TElement>.Key holds the shared key of the group.' },
    { question: 'Which operator flattens a list of lists into one sequence?', options: ['Select', 'Concat only', 'Distinct', 'SelectMany'], answer: 3, explanation: 'SelectMany projects to sequences and flattens them.' },
    { question: 'employees.Where(e => e.Salary > 50000).Where(e => e.Dept == "IT") is equivalent to:', options: ['Salary > 50000 OR Dept == "IT"', 'Salary > 50000 AND Dept == "IT"', 'Only the last Where is applied', 'A compile error'], answer: 1, explanation: 'Chained Where calls combine with AND.' },
  ],
};
