export default {
  lesson: 'day-009-loops-for-while-do-while',
  minutes: 16,
  intro: 'Practise for, while and do-while loops: counting, summing, and knowing when the condition is checked.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this for loop print?',
      example: { title: 'counting down', code: 'for (int i = 3; i >= 1; i--)\n    Console.Write(i + " ");\n// 3 2 1' },
      code: `int sum = 0;
for (int i = 1; i <= 10; i += 3)
{
    Console.Write(i + " ");
    sum += i;
}
Console.WriteLine();
Console.WriteLine("Sum = " + sum);`,
      expected: `1 4 7 10
Sum = 22`,
      explain: 'The step is `i += 3`, so i takes 1, 4, 7, 10 and then 13 fails `i <= 10`. 1 + 4 + 7 + 10 = 22.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'do-while vs while: what does this print?',
      example: { title: 'do-while runs at least once', code: 'int n = 0;\ndo { Console.WriteLine("Hi"); } while (n > 0);\n// prints Hi once' },
      code: `int a = 10;
while (a < 5)
{
    Console.WriteLine("while: " + a);
    a++;
}
int b = 10;
do
{
    Console.WriteLine("do: " + b);
    b++;
} while (b < 5);`,
      expected: 'do: 10',
      explain: '`while` checks the condition **before** the body, so with a = 10 it never runs. `do-while` checks **after** the body, so it always runs at least once. Use do-while for menus and "ask until valid" input.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the loop header so it prints the 7 times table from 7 × 1 to 7 × 10:\n```\nfor (__________)\n    Console.WriteLine($"7 x {i} = {7 * i}");\n```\n(write only what goes inside the parentheses)',
      example: { title: 'for header parts', code: 'for (int k = 0; k < 5; k++)   // init; condition; update' },
      accept: ['int i = 1; i <= 10; i++', 'int i = 1; i < 11; i++', 'int i = 1; i <= 10; ++i', 'int i = 1; i < 11; ++i', 'var i = 1; i <= 10; i++'],
      acceptRegex: ['^(int|var)\\s+i\\s*=\\s*1\\s*;\\s*i\\s*(<=\\s*10|<\\s*11)\\s*;\\s*(i\\+\\+|\\+\\+i|i\\s*\\+=\\s*1)$'],
      explain: 'A for header has three parts: **initialisation** (`int i = 1`), **condition** (`i <= 10`) and **update** (`i++`). Starting at 0 or using `< 10` are the typical off-by-one mistakes.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A while loop that works on digits: what does this print?',
      example: { title: 'last digit', code: 'int n = 1234;\nConsole.WriteLine(n % 10);  // 4\nConsole.WriteLine(n / 10);  // 123' },
      code: `int num = 4096;
int reversed = 0;
int digits = 0;
while (num > 0)
{
    reversed = reversed * 10 + num % 10;
    num /= 10;
    digits++;
}
Console.WriteLine(reversed);
Console.WriteLine(digits);`,
      expected: `6904
4`,
      explain: '`num % 10` takes the last digit and `num /= 10` removes it (integer division). Digits come out as 6, 9, 0, 4 so reversed = 6904, and the loop ran 4 times.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'How many times does `Console.WriteLine("Hi")` run?\n`for (int i = 0; i < 10; i += 2) Console.WriteLine("Hi");`',
      options: ['10', '5', '6', '4'],
      answer: 1,
      explain: 'i takes the values 0, 2, 4, 6, 8 → **5** times. At i = 10 the condition `i < 10` is false.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which loops are **infinite** (never stop on their own)? (choose all that apply)',
      options: ['for (;;) { }', 'while (true) { }', 'for (int i = 0; i < 5; i--) { }  (until overflow, practically infinite)', 'int i = 0; while (i < 5) { i++; }', 'do { } while (false);'],
      answers: [0, 1, 2],
      explain: '`for (;;)` and `while (true)` have no stopping condition (use `break` inside). Decrementing i while checking `i < 5` keeps the condition true. The `i++` loop stops after 5 runs and `do…while(false)` runs exactly once.',
    },
  ],
};
