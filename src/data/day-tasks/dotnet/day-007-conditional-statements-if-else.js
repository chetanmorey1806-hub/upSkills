export default {
  lesson: 'day-007-conditional-statements-if-else',
  minutes: 16,
  intro: 'Practise if, else, else-if ladders and nested if statements with real decisions (grades, discounts, eligibility).',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Grade calculator: what does this print?',
      example: { title: 'an else-if ladder', code: 'int temp = 32;\nif (temp > 35) Console.WriteLine("Hot");\nelse if (temp > 25) Console.WriteLine("Warm");\nelse Console.WriteLine("Cool");\n// Warm' },
      code: `int[] marks = { 92, 75, 58, 30 };
foreach (int m in marks)
{
    if (m >= 90) Console.WriteLine("A");
    else if (m >= 70) Console.WriteLine("B");
    else if (m >= 35) Console.WriteLine("C");
    else Console.WriteLine("Fail");
}`,
      expected: `A
B
C
Fail`,
      explain: 'An else-if ladder checks conditions **top to bottom** and stops at the first true one. 92 matches the first branch; 75 fails `>= 90` but matches `>= 70`, and so on.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Why does this code always print "C" for 95 marks?\n```\nif (m >= 35) Console.WriteLine("C");\nelse if (m >= 70) Console.WriteLine("B");\nelse if (m >= 90) Console.WriteLine("A");\n```',
      options: [
        'Because else-if is not allowed after if',
        'Because the first true condition wins; check the biggest range first',
        'Because 95 is not an int',
        'It prints A, B and C',
      ],
      answer: 1,
      explain: 'Only **one** branch of an if/else-if chain runs: the first one whose condition is true. 95 >= 35 is already true, so "C" prints. Order range checks from the most specific (highest) to the most general.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the condition that checks whether `n` is **even**:\n`if (________)`\n(write only the condition)',
      example: { title: 'divisible by 5', code: 'if (n % 5 == 0)\n    Console.WriteLine("Multiple of 5");' },
      accept: ['n % 2 == 0', '(n % 2 == 0)', 'n%2==0'],
      acceptRegex: ['^\\(?\\s*n\\s*%\\s*2\\s*==\\s*0\\s*\\)?$', '^\\(?\\s*0\\s*==\\s*n\\s*%\\s*2\\s*\\)?$'],
      explain: '`n % 2` is the remainder after dividing by 2. Even numbers leave remainder 0. Remember `==` compares, while a single `=` assigns (and does not compile inside `if` for ints).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Nested if: a bank loan check. What does this print?',
      example: { title: 'nested if', code: 'if (isMember)\n{\n    if (amount > 1000) Console.WriteLine("10% off");\n    else Console.WriteLine("5% off");\n}' },
      code: `int age = 24;
int salary = 18000;
bool hasPan = true;
if (age >= 21)
{
    if (salary >= 25000 && hasPan)
        Console.WriteLine("Loan approved");
    else
        Console.WriteLine("Need guarantor");
}
else
{
    Console.WriteLine("Too young");
}
Console.WriteLine("Check complete");`,
      expected: `Need guarantor
Check complete`,
      explain: 'Age 24 passes the outer `if`. Inside, `salary >= 25000` is false, so the whole `&&` is false and the inner `else` runs. The last line is outside every `if`, so it always prints.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens with `int x = 5; if (x = 10) { ... }` in C#?',
      options: ['It is true and runs the block', 'It is false', 'Compile error: cannot implicitly convert int to bool', 'x becomes 10 and the block is skipped'],
      answer: 2,
      explain: 'C# requires a **bool** condition. `x = 10` is an assignment of type int, so it does not compile, which protects you from the classic C bug. Use `x == 10` to compare.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'A movie ticket is free for children under 5 OR seniors aged 60 and above. Which conditions are **correct**? (choose all that apply)',
      options: ['age < 5 || age >= 60', 'age < 5 && age >= 60', '!(age >= 5 && age < 60)', 'age <= 5 || age > 60'],
      answers: [0, 2],
      explain: '"Under 5 or 60+" is `age < 5 || age >= 60`. Option 3 is the same thing written as "NOT between 5 and 59" (De Morgan). `&&` can never be true for both, and option 4 has wrong boundaries (5 and 60 are misclassified).',
    },
  ],
};
