const BASICS = `using System;

Func<int, int> square = x => x * x;                       // expression lambda, one parameter
Func<int, int, int> add = (a, b) => a + b;                // two parameters need ()
Func<string> greet = () => "Hello from a lambda";         // no parameters
Func<int, string> grade = marks =>                        // statement lambda (block body)
{
    if (marks >= 75) return "Distinction";
    if (marks >= 40) return "Pass";
    return "Fail";
};
Action<string> print = msg => Console.WriteLine($">> {msg}");

Console.WriteLine(square(7));
Console.WriteLine(add(15, 27));
Console.WriteLine(greet());
Console.WriteLine(grade(82));
Console.WriteLine(grade(39));
print("Statement lambdas can have many lines");

var triple = (int n) => n * 3;                            // C# 10: natural type Func<int, int>
Console.WriteLine(triple(5));

var greetUser = (string name = "Guest") => $"Hi {name}";   // C# 12: default parameter value
Console.WriteLine(greetUser());`;

const LINQ = `using System;
using System.Collections.Generic;
using System.Linq;

var students = new List<Student>
{
    new("Asha", 88, "CSE"),
    new("Ravi", 45, "ECE"),
    new("Neha", 92, "CSE"),
    new("Kiran", 67, "ECE"),
    new("Zoya", 38, "CSE"),
};

var toppers = students.Where(s => s.Marks >= 80).Select(s => s.Name);
Console.WriteLine("Toppers: " + string.Join(", ", toppers));

var ranking = students.OrderByDescending(s => s.Marks).Select(s => $"{s.Name}({s.Marks})");
Console.WriteLine("Ranking: " + string.Join(" > ", ranking));

Console.WriteLine($"Any fail? {students.Any(s => s.Marks < 40)}");
Console.WriteLine($"Average: {students.Average(s => s.Marks)}");

foreach (var g in students.GroupBy(s => s.Dept))
    Console.WriteLine($"{g.Key}: {g.Count()} students, best {g.Max(s => s.Marks)}");

record Student(string Name, int Marks, string Dept);`;

const CLOSURE = `using System;
using System.Collections.Generic;
using System.Linq;

var counterA = MakeCounter();
var counterB = MakeCounter();
Console.WriteLine(counterA());
Console.WriteLine(counterA());
Console.WriteLine(counterA());
Console.WriteLine(counterB());                 // B has its OWN captured count

int bonus = 10;
Func<int, int> addBonus = m => m + bonus;     // captures the variable, not the value
Console.WriteLine(addBonus(50));
bonus = 20;
Console.WriteLine(addBonus(50));

var shared = new List<Func<int>>();
var copied = new List<Func<int>>();
for (int i = 1; i <= 3; i++)
{
    int copy = i;                              // new variable each iteration
    shared.Add(() => i);                       // ONE i for the whole for-loop
    copied.Add(() => copy);
}
Console.WriteLine("for-loop variable: " + string.Join(", ", shared.Select(f => f())));
Console.WriteLine("copied variable:   " + string.Join(", ", copied.Select(f => f())));

Func<int> MakeCounter()
{
    int count = 0;                             // lives on as long as the lambda lives
    return () => ++count;
}`;

const HIGHER = `using System;

var doubleIt = MultiplyBy(2);                     // a lambda that remembers factor = 2
var addTen = (int x) => x + 10;
var doubleThenAdd = Compose(doubleIt, addTen);
var addThenDouble = Compose(addTen, doubleIt);
Console.WriteLine(doubleThenAdd(5));
Console.WriteLine(addThenDouble(5));

Func<int, int, int> keepFirst = static (a, _) => a;   // static lambda + discard parameter
Console.WriteLine(keepFirst(7, 99));

int[] prices = { 100, 250, 400 };
int[] discounted = Array.ConvertAll(prices, p => p - p / 10);   // 10% off
Console.WriteLine(string.Join(", ", discounted));

Func<int, int> MultiplyBy(int factor) => x => x * factor;          // returns a lambda
Func<int, int> Compose(Func<int, int> f, Func<int, int> g) => x => g(f(x));`;

export default {
  id: 'extra-19-lambda-expressions',
  title: 'Lambda Expressions',
  module: 'Extra: OOP Concepts',
  extraNo: 19,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `A lambda expression is a short, unnamed function written with the => ("goes to") operator: x => x * x. Lambdas are the modern way to create delegates and are used everywhere in C#: LINQ, events, Func/Action, ASP.NET Core minimal APIs and configuration. This lesson covers expression vs statement lambdas, parameters and type inference, natural types, closures (captured variables) and the loop pitfall, static lambdas, discards and higher-order functions.`,
  objectives: [
    'Write expression lambdas and statement lambdas with 0, 1 or many parameters',
    'Assign lambdas to Func, Action, Predicate and custom delegates',
    'Use lambdas with LINQ (Where, Select, OrderBy, GroupBy, Any, Average)',
    'Explain closures and predict output when variables are captured',
    'Write functions that take and return lambdas (higher-order functions)',
  ],
  theory: [
    {
      heading: 'What is a lambda expression?',
      content: `A lambda is an anonymous method written in compact form: parameters on the left of =>, body on the right. The compiler converts it into a delegate (or an expression tree, used by EF Core). Lambdas replaced anonymous methods (delegate { ... }) introduced in C# 2.

Real-world analogy: a sticky note instruction. Instead of writing a full formal procedure document (a named method with a class, name, access modifier), you write a quick note "x → double it" and hand it to whoever needs it.`,
      syntax: `(parameters) => expression          // expression lambda
(parameters) => { statements; }     // statement lambda

x => x * 2                // one parameter: () optional
(a, b) => a + b           // two parameters
() => "hi"                // no parameters
(int a, int b) => a + b   // explicit types`,
    },
    {
      heading: 'Expression lambdas vs statement lambdas',
      content: `An expression lambda has a single expression as its body; its value is returned automatically. A statement lambda has a block { } with any number of statements and must use return if the delegate returns a value. Use expression lambdas for short calculations and conditions; use statement lambdas for if/else, loops or multiple steps.

Only expression lambdas can become expression trees (Expression<Func<T,bool>>), which is why EF Core Where(...) filters must be expression lambdas — EF translates them to SQL.`,
      points: [
        'Expression lambda: s => s.Marks > 50',
        'Statement lambda: s => { var ok = s.Marks > 50; return ok; }',
        'Action lambdas (void) can be either form',
        'Lambda parameters are type-inferred from the target delegate type',
      ],
    },
    {
      heading: 'Type inference and natural type',
      content: `When a lambda is assigned to Func<int,int>, the compiler infers x is int. Before C# 10, var f = x => x * 2; was an error because there was no target type. Since C# 10 a lambda with explicitly typed parameters has a "natural type": var f = (int x) => x * 2; becomes Func<int,int>. C# 10 also allows an explicit return type ((int x) => (long)x), and C# 12 allows default parameter values and params arrays in lambdas.`,
      syntax: `Func<int, int> f1 = x => x * 2;      // target-typed
var f2 = (int x) => x * 2;           // natural type Func<int, int>
var f3 = (string n = "Guest") => n;  // C# 12 default value`,
    },
    {
      heading: 'Closures – capturing outer variables',
      content: `A lambda can use local variables and parameters from the method where it is written. The lambda captures the VARIABLE itself (by reference), not a copy of its current value. If the variable changes later, the lambda sees the new value. A captured variable lives as long as the lambda lives, even after the method returns — the compiler moves it into a hidden class (a "closure").

Classic pitfall: a for loop has ONE loop variable for all iterations. Lambdas created inside the loop that capture i all see its final value. Copy it into a local inside the loop (int copy = i;). foreach creates a fresh variable each iteration (since C# 5), so foreach is safe.`,
      tip: `Use the static modifier (static x => x * 2, C# 9) to guarantee a lambda captures nothing — the compiler gives an error if it accidentally uses an outer variable, and no closure object is allocated.`,
    },
    {
      heading: 'Discards, static lambdas and higher-order functions',
      content: `Discard parameters (_, _) => 0 (C# 9) show that a parameter is intentionally unused, common in event handlers: button.Click += (_, _) => Save();

A higher-order function either takes a function as a parameter (Where, Compose) or returns one (MultiplyBy). This lets you build behaviour from small pieces — the basis of LINQ, middleware pipelines and the Strategy pattern.`,
      syntax: `Func<int, int> MultiplyBy(int factor) => x => x * factor;
var triple = MultiplyBy(3);
Console.WriteLine(triple(4));   // 12`,
    },
  ],
  examples: [
    {
      title: 'Expression and statement lambdas',
      scenario: 'Write small calculations, a grading rule and a printer as lambdas, and try C# 10/12 lambda features.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it LambdaBasics',
        'Replace Program.cs with the code',
        'Hover over var triple – IntelliSense shows Func<int, int>',
        'Press Ctrl+F5',
      ],
      code: BASICS,
      csharp: { files: { 'Program.cs': BASICS }, stdin: '' },
      result: `49
42
Hello from a lambda
Distinction
Fail
>> Statement lambdas can have many lines
15
Hi Guest`,
      explanation: `square(7) = 49, add(15, 27) = 42. grade is a statement lambda: 82 >= 75 gives Distinction and 39 falls through to Fail. print is an Action, so it returns nothing. triple has a natural type because its parameter is typed; triple(5) = 15. greetUser uses the C# 12 default value "Guest".`,
    },
    {
      title: 'Lambdas with LINQ – student analysis',
      scenario: 'Use lambdas inside LINQ to find toppers, build a ranking, check for failures, compute the average and group by department.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it LambdaLinq',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: LINQ,
      csharp: { files: { 'Program.cs': LINQ }, stdin: '' },
      result: `Toppers: Asha, Neha
Ranking: Neha(92) > Asha(88) > Kiran(67) > Ravi(45) > Zoya(38)
Any fail? True
Average: 66
CSE: 3 students, best 92
ECE: 2 students, best 67`,
      explanation: `Each LINQ method receives a lambda: Where keeps marks >= 80, OrderByDescending sorts by marks, Any checks for marks < 40 (Zoya has 38). Average = (88+45+92+67+38) / 5 = 330 / 5 = 66 (a double that prints as 66). GroupBy keeps groups in the order their keys first appear: CSE then ECE.`,
    },
    {
      title: 'Closures and the for-loop pitfall',
      scenario: 'Create independent counters with closures, see that a lambda reads the latest value of a captured variable, and compare capturing a for-loop variable vs a copy.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it LambdaClosures',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: CLOSURE,
      csharp: { files: { 'Program.cs': CLOSURE }, stdin: '' },
      result: `1
2
3
1
60
70
for-loop variable: 4, 4, 4
copied variable:   1, 2, 3`,
      explanation: `Each call to MakeCounter creates a new count variable captured by its own lambda, so counterA counts 1, 2, 3 while counterB starts again at 1. addBonus captured bonus by reference: 50 + 10 = 60, then after bonus = 20 it gives 70. In the for loop there is only one i; after the loop ends i is 4, so all "shared" lambdas return 4. The copy variable is new in every iteration, giving 1, 2, 3.`,
    },
    {
      title: 'Higher-order functions, static lambdas and discards',
      scenario: 'Build functions that return lambdas and combine two functions; apply a discount to an array with Array.ConvertAll.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it LambdaHigherOrder',
        'Replace Program.cs with the code',
        'Try changing keepFirst to static (a, _) => addTen(a) and read the compile error (CS8820: a static lambda cannot capture addTen)',
        'Press Ctrl+F5',
      ],
      code: HIGHER,
      csharp: { files: { 'Program.cs': HIGHER }, stdin: '' },
      result: `20
30
7
90, 225, 360`,
      explanation: `MultiplyBy(2) returns x => x * 2 with factor captured. Compose(f, g) returns x => g(f(x)): doubleThenAdd(5) = 5*2 + 10 = 20 and addThenDouble(5) = (5+10)*2 = 30 — order matters. keepFirst is a static lambda that ignores its second parameter (a discard name), returning 7. The discount lambda computes p - p/10: 100→90, 250→225, 400→360.`,
    },
  ],
  interview: [
    { q: 'What is a lambda expression?', a: 'An anonymous function written with the => operator, e.g. x => x * 2. It can be converted to a delegate type (Func, Action, custom) or to an expression tree.', level: 'Easy' },
    { q: 'What is the difference between an expression lambda and a statement lambda?', a: 'An expression lambda has a single expression body whose value is returned implicitly. A statement lambda has a { } block with statements and needs an explicit return for non-void delegates. Only expression lambdas can be converted to expression trees.', level: 'Easy' },
    { q: 'Lambda vs anonymous method?', a: 'Both create unnamed delegates. Lambdas are shorter, support type inference, expression bodies and expression trees. Anonymous methods (delegate(int x){...}) can omit the parameter list entirely, which lambdas cannot.', level: 'Medium' },
    { q: 'What is a closure?', a: 'A lambda together with the outer variables it captures. Captured variables are stored in a compiler-generated class so they live as long as the lambda, and the lambda sees changes made to them.', level: 'Medium' },
    { q: 'Output? int x = 5; Func<int> f = () => x * 2; x = 10; Console.WriteLine(f());', a: '20. The lambda captures the variable x, not its value at creation time.', level: 'Medium' },
    { q: 'Output? var list = new List<Action>(); for (int i = 0; i < 3; i++) list.Add(() => Console.Write(i)); foreach (var a in list) a();', a: '333. All lambdas share the single for-loop variable i, which is 3 after the loop. Copy it into a local inside the loop to get 012.', level: 'Hard' },
    { q: 'Does the same pitfall happen with foreach?', a: 'No, since C# 5 the foreach iteration variable is a new variable in each iteration, so each lambda captures its own value.', level: 'Medium' },
    { q: 'What is a static lambda?', a: 'A lambda marked static (C# 9) that cannot capture locals, parameters or this. It avoids accidental captures and closure allocations.', level: 'Medium' },
    { q: 'What is the natural type of a lambda?', a: 'Since C# 10 the compiler can infer a delegate type for a lambda with explicitly typed parameters: var f = (int x) => x > 0; is Func<int, bool>. var f = x => x > 0; is still an error.', level: 'Hard' },
    { q: 'Why must EF Core Where clauses be expression lambdas?', a: 'Where on IQueryable takes Expression<Func<T,bool>>. Only expression lambdas can become expression trees that EF Core translates into SQL; statement lambdas cannot.', level: 'Hard' },
    { q: 'Output? Func<int, Func<int, int>> adder = a => b => a + b; Console.WriteLine(adder(3)(4));', a: '7. adder(3) returns b => 3 + b, which is then called with 4 (currying).', level: 'Medium' },
    { q: 'What are lambda discard parameters?', a: 'Using _ for unused parameters, e.g. (_, _) => Save() for an event handler (C# 9). With two or more underscores they are true discards.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write lambdas: isEven (Func<int,bool>), fullName (Func<string,string,string>) and printLine (Action<int>) that prints a line of n dashes. Test them.',
      hint: 'new string(\'-\', n) creates n dashes.',
      solution: `Func<int, bool> isEven = n => n % 2 == 0;
Func<string, string, string> fullName = (f, l) => $"{f} {l}";
Action<int> printLine = n => Console.WriteLine(new string('-', n));
Console.WriteLine(isEven(8));               // True
Console.WriteLine(fullName("Asha", "Rao"));  // Asha Rao
printLine(10);                               // ----------`,
    },
    {
      task: 'Given a List<Employee>(Name, Dept, Salary), use lambdas with LINQ to print: employees earning more than 50000, the total salary per department, and the name of the highest paid employee.',
      hint: 'Where, GroupBy + Sum, OrderByDescending + First.',
      solution: `var emps = new List<Employee> { new("Ravi", "IT", 60000), new("Asha", "HR", 45000), new("Kiran", "IT", 52000) };
foreach (var e in emps.Where(e => e.Salary > 50000)) Console.WriteLine(e.Name);   // Ravi, Kiran
foreach (var g in emps.GroupBy(e => e.Dept)) Console.WriteLine($"{g.Key}: {g.Sum(e => e.Salary)}"); // IT: 112000, HR: 45000
Console.WriteLine(emps.OrderByDescending(e => e.Salary).First().Name);         // Ravi

record Employee(string Name, string Dept, int Salary);`,
    },
    {
      task: 'Write a function MakeMultiplier(int n) that returns a Func<int,int>. Create times5 and times10 and print them for 3.',
      hint: 'Return x => x * n; n is captured.',
      solution: `Func<int, int> MakeMultiplier(int n) => x => x * n;
var times5 = MakeMultiplier(5);
var times10 = MakeMultiplier(10);
Console.WriteLine(times5(3));   // 15
Console.WriteLine(times10(3));  // 30`,
    },
    {
      task: 'Fix the bug: a loop creates 5 Action lambdas that should print 1..5 but all print 6. Show the broken and fixed versions.',
      hint: 'Copy the loop variable into a new local variable inside the loop, or use foreach over Enumerable.Range.',
      solution: `var broken = new List<Action>();
for (int i = 1; i <= 5; i++) broken.Add(() => Console.Write(i + " "));
broken.ForEach(a => a());   // 6 6 6 6 6
Console.WriteLine();

var fixedList = new List<Action>();
for (int i = 1; i <= 5; i++) { int n = i; fixedList.Add(() => Console.Write(n + " ")); }
fixedList.ForEach(a => a());   // 1 2 3 4 5`,
    },
  ],
  quiz: [
    {
      question: 'Which is a valid statement lambda for Func<int, int>?',
      options: ['x => { return x * 2; }', 'x => return x * 2;', '{ x => x * 2 }', 'x -> x * 2'],
      answer: 0,
      explanation: 'A statement lambda uses a block with an explicit return.',
    },
    {
      question: 'int y = 1; Func<int> f = () => y + 1; y = 5; What does f() return?',
      options: ['2', '1', '5', '6'],
      answer: 3,
      explanation: 'The lambda captures the variable y, which is 5 when f runs: 5 + 1 = 6.',
    },
    {
      question: 'What does var f = x => x * 2; give?',
      options: ['Func<int,int>', 'Func<object,object>', 'A compile error: cannot infer the delegate type', 'Action<int>'],
      answer: 2,
      explanation: 'Without typed parameters there is no natural type. Use (int x) => x * 2 or a target type.',
    },
    {
      question: 'What does the static modifier on a lambda do?',
      options: ['Makes it run once', 'Prevents it from capturing outer variables or this', 'Makes it faster to compile', 'Stores it in a static field'],
      answer: 1,
      explanation: 'A static lambda cannot capture state; the compiler reports an error if it tries.',
    },
    {
      question: 'Compose(f, g) returns x => g(f(x)). With f = x => x + 1 and g = x => x * 3, what is Compose(f, g)(2)?',
      options: ['7', '9', '6', '8'],
      answer: 1,
      explanation: 'f(2) = 3, then g(3) = 9.',
    },
  ],
};
