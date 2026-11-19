export default {
  lesson: 'day-010-nested-loops-break-continue',
  minutes: 18,
  intro: 'Practise nested loops (patterns and tables) and controlling loops with break and continue.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Star pattern with nested loops: what does this print?',
      example: { title: 'rows and columns', code: 'for (int r = 1; r <= 2; r++)\n{\n    for (int c = 1; c <= 3; c++) Console.Write("#");\n    Console.WriteLine();\n}\n// ###\n// ###' },
      code: `for (int i = 1; i <= 4; i++)
{
    for (int j = 1; j <= i; j++)
    {
        Console.Write("*");
    }
    Console.WriteLine();
}`,
      expected: `*
**
***
****`,
      explain: 'The outer loop controls the **rows**, the inner loop the **columns**. The inner loop runs `i` times, so row 1 has one star, row 4 has four. `Console.WriteLine()` after the inner loop ends each row.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`continue` skips the rest of one iteration. What does this print?',
      example: { title: 'skip odd numbers', code: 'for (int i = 1; i <= 5; i++)\n{\n    if (i % 2 != 0) continue;\n    Console.Write(i + " ");\n}\n// 2 4' },
      code: `for (int i = 1; i <= 10; i++)
{
    if (i % 3 == 0) continue;
    if (i > 8) break;
    Console.Write(i + " ");
}`,
      expected: '1 2 4 5 7 8',
      explain: '`continue` skips 3, 6 and 9 and jumps to the next iteration. When i = 10, `i > 8` is true and `break` ends the loop. (9 was already skipped by continue.)',
    },
    {
      type: 'output',
      mins: 3,
      q: '`break` inside a nested loop: what does this print?',
      example: { title: 'break leaves only the innermost loop', code: 'for (int a = 1; a <= 2; a++)\n    for (int b = 1; b <= 5; b++)\n    {\n        if (b == 2) break;\n        Console.WriteLine($"{a},{b}");\n    }\n// 1,1\n// 2,1' },
      code: `for (int i = 1; i <= 3; i++)
{
    for (int j = 1; j <= 3; j++)
    {
        if (j == i) break;
        Console.Write($"{i}{j} ");
    }
}`,
      expected: '21 31 32',
      explain: '`break` exits only the **inner** loop. For i = 1 it breaks immediately (j = 1). For i = 2 it prints 21 then breaks at j = 2. For i = 3 it prints 31, 32 then breaks at j = 3.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'You are searching an array for roll number 42. Once found, you want to **stop the loop immediately**. Which statement do you write after printing "Found"? (with the semicolon)',
      example: { title: 'skip vs stop', text: 'continue; → skip to the next iteration\n?????; → leave the loop completely' },
      accept: ['break;', 'break'],
      caseSensitive: true,
      explain: '`break;` leaves the nearest enclosing loop (or switch). `continue;` would only skip the current item and keep searching, wasting time.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'An outer loop runs 5 times and an inner loop runs 4 times for each outer iteration. How many times does the inner body run in total?',
      options: ['9', '20', '5', '4'],
      answer: 1,
      explain: 'The inner loop restarts for every outer iteration: 5 × 4 = **20**. This is why nested loops over large data (n × n) become slow.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Multiplication grid: what does this print?',
      example: { title: 'tab-free formatting', code: 'Console.Write(5 * 2 + " ");' },
      code: `for (int r = 1; r <= 3; r++)
{
    for (int c = 1; c <= 3; c++)
    {
        Console.Write(r * c + " ");
    }
    Console.WriteLine();
}`,
      expected: `1 2 3
2 4 6
3 6 9`,
      explain: 'Each row r prints r×1, r×2, r×3. Note `r * c + " "`: multiplication runs first, then the number is joined with a space (string concatenation).',
    },
  ],
};
