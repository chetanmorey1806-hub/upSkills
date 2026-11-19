export default {
  lesson: 'day-015-recursion-scope-var-dynamic',
  minutes: 18,
  intro: 'Practise recursion (base case + recursive call), variable scope (fields vs locals) and the difference between var and dynamic.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this recursive program print?',
      example: { title: 'factorial', code: 'static int Fact(int n)\n{\n    if (n <= 1) return 1;     // base case\n    return n * Fact(n - 1);   // recursive call\n}\n// Fact(4) = 4 * 3 * 2 * 1 = 24' },
      code: `static int Fact(int n)
{
    if (n <= 1) return 1;
    return n * Fact(n - 1);
}
static int SumDigits(int n)
{
    if (n == 0) return 0;
    return n % 10 + SumDigits(n / 10);
}
static void Main()
{
    Console.WriteLine(Fact(5));
    Console.WriteLine(SumDigits(4821));
}`,
      expected: `120
15`,
      explain: '5! = 5 × 4 × 3 × 2 × 1 = 120. `SumDigits` adds the last digit and recurses on the rest: 1 + 2 + 8 + 4 = 15. Each recursive call works on a smaller problem until the **base case** stops it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Tracing recursion: the print happens **after** the recursive call. What does this print?',
      example: { title: 'print before vs after the call', code: 'static void Down(int n)\n{\n    if (n == 0) return;\n    Console.Write(n + " ");\n    Down(n - 1);\n}\n// Down(3) → 3 2 1' },
      code: `static void Up(int n)
{
    if (n == 0) return;
    Up(n - 1);
    Console.Write(n + " ");
}
static void Main()
{
    Up(4);
}`,
      expected: '1 2 3 4',
      explain: '`Up(4)` calls `Up(3)` … down to `Up(0)`, which returns. Only then do the waiting calls continue and print, from the deepest (1) back up to 4. Code after the recursive call runs while the calls **unwind**.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens if a recursive method has **no base case**, e.g. `static int F(int n) => n + F(n - 1);`?',
      options: ['It returns 0', 'It loops forever without error', 'It crashes with StackOverflowException', 'Compile error'],
      answer: 2,
      explain: 'Every call adds a frame to the **call stack**. Without a base case the calls never stop, the stack fills up and the process crashes with **StackOverflowException** (which cannot even be caught).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Scope: a field vs a local variable with the same name. What does this print?',
      example: { title: 'block scope', code: 'if (true)\n{\n    int x = 5;\n}\n// Console.WriteLine(x);  // error: x does not exist here' },
      code: `class Program
{
    static int count = 10;

    static void Test()
    {
        int count = 3;
        count++;
        Console.WriteLine(count);
        Program.count++;
    }

    static void Main()
    {
        Test();
        Test();
        Console.WriteLine(count);
    }
}`,
      expected: `4
4
12`,
      explain: 'Inside `Test`, the **local** `count` hides the field and is created fresh (3) on every call, so it prints 4 twice. `Program.count++` updates the **field**, which keeps its value between calls: 10 → 11 → 12.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which code compiles but fails at **runtime**?',
      options: [
        'var x = 10; x = "ten";',
        'dynamic d = 10; d = "ten"; Console.WriteLine(d.Length);',
        'dynamic d = 10; Console.WriteLine(d.Length);',
        'var s = "hi"; Console.WriteLine(s.Length);',
      ],
      answer: 2,
      explain: '`var` is **statically typed** (type inferred at compile time), so option 1 is a compile error. `dynamic` skips compile-time checks: option 2 works (d is a string at that moment, Length 4), but option 3 throws `RuntimeBinderException` because an int has no `Length`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the base case of this Fibonacci method (`Fib(0)` = 0, `Fib(1)` = 1):\n```\nstatic int Fib(int n)\n{\n    if (________) return n;\n    return Fib(n - 1) + Fib(n - 2);\n}\n```',
      example: { title: 'base case for power', code: 'static int Pow(int b, int e)\n{\n    if (e == 0) return 1;\n    return b * Pow(b, e - 1);\n}' },
      accept: ['n <= 1', 'n < 2'],
      acceptRegex: ['^\\(?\\s*n\\s*(<=\\s*1|<\\s*2)\\s*\\)?$', '^\\(?\\s*n\\s*==\\s*0\\s*\\|\\|\\s*n\\s*==\\s*1\\s*\\)?$', '^\\(?\\s*n\\s*==\\s*1\\s*\\|\\|\\s*n\\s*==\\s*0\\s*\\)?$'],
      explain: 'Both 0 and 1 must stop the recursion, and returning `n` gives exactly Fib(0) = 0 and Fib(1) = 1. Checking only `n == 1` makes `Fib(2)` call `Fib(0)` → `Fib(-1)` … and overflow the stack.',
    },
  ],
};
