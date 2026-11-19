export default {
  lesson: 'day-013-methods-parameters-return-types',
  minutes: 18,
  intro: 'Practise writing and calling methods: parameters, return types, pass by value vs ref/out, and params.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the method header. The method receives two marks and gives back their **average as a double**:\n`static ______ Average(int a, int b)`\n(write only the return type)',
      example: { title: 'return types', code: 'static bool IsEven(int n) { return n % 2 == 0; }\nstatic void Greet() { Console.WriteLine("Hi"); }  // returns nothing' },
      accept: ['double'],
      caseSensitive: true,
      explain: 'The return type comes before the method name. A method that returns nothing uses `void`. Using `int` here would lose the .5 of an average like 72.5.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      example: { title: 'calling a method that returns', code: 'static int Square(int n) => n * n;\nConsole.WriteLine(Square(4) + 1); // 17' },
      code: `static int Add(int a, int b)
{
    return a + b;
}
static string Grade(int marks)
{
    if (marks >= 60) return "First Class";
    return "Pass";
}
static void Main()
{
    int total = Add(45, 30);
    Console.WriteLine(total);
    Console.WriteLine(Grade(total));
    Console.WriteLine(Grade(Add(20, 25)));
}`,
      expected: `75
First Class
Pass`,
      explain: '`Add(45, 30)` returns 75, which is ≥ 60 → "First Class". `Grade(Add(20, 25))` first evaluates the inner call (45), then passes 45 to `Grade` → "Pass". `return` ends the method immediately.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Pass by value vs `ref`: what does this print?',
      example: { title: 'ref keyword', code: 'static void Bonus(ref int salary) { salary += 1000; }\nint s = 5000;\nBonus(ref s);\nConsole.WriteLine(s); // 6000' },
      code: `static void Double1(int x)
{
    x = x * 2;
}
static void Double2(ref int x)
{
    x = x * 2;
}
static void Main()
{
    int a = 10;
    Double1(a);
    Console.WriteLine(a);
    Double2(ref a);
    Console.WriteLine(a);
}`,
      expected: `10
20`,
      explain: 'By default, value types are passed **by value**: the method gets a copy, so `Double1` changes only its copy. With `ref`, the method works on the caller\'s variable itself, so `Double2` changes `a` to 20. `ref` must be written at both the declaration and the call.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the main difference between `ref` and `out` parameters?',
      options: [
        '`out` variables must be initialised before the call; `ref` must be assigned inside the method',
        '`ref` variables must be initialised before the call; an `out` parameter must be assigned inside the method before it returns',
        'There is no difference',
        '`out` can only be used with strings',
      ],
      answer: 1,
      explain: '`ref` = "read and modify an existing value" (must be initialised first). `out` = "the method will produce this value" (need not be initialised, but the method **must** assign it). `int.TryParse(s, out int n)` is the classic `out` example. `in` passes read-only by reference.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`params` lets you pass any number of arguments. What does this print?',
      example: { title: 'params', code: 'static int Count(params string[] items) => items.Length;\nConsole.WriteLine(Count("a", "b")); // 2' },
      code: `static int Sum(params int[] nums)
{
    int s = 0;
    foreach (int n in nums) s += n;
    return s;
}
static void Main()
{
    Console.WriteLine(Sum(1, 2, 3));
    Console.WriteLine(Sum());
    Console.WriteLine(Sum(new int[] { 10, 20 }));
}`,
      expected: `6
0
30`,
      explain: 'With `params int[] nums` the compiler packs the arguments into an array: 3 numbers → 6, no arguments → an **empty** array → 0, and you can also pass an existing array. `params` must be the last parameter.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which method declarations are **valid** C#? (choose all that apply)',
      options: [
        'static void Print(string msg) { Console.WriteLine(msg); }',
        'static int Max(int a, int b) => a > b ? a : b;',
        'static int Half(int n) { int h = n / 2; }',
        'static bool Check(out int x) { x = 5; return true; }',
        'static void Log(params string[] lines, int level) { }',
      ],
      answers: [0, 1, 3],
      explain: 'Option 3 does not compile: a non-void method must **return** a value on every path. Option 5 is invalid because `params` must be the **last** parameter. Expression-bodied methods (`=>`) and `out` parameters that are assigned are fine.',
    },
  ],
};
