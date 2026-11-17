const starCode = `// Day 10 - Example 1: Star patterns with nested loops
int rows = 5;

Console.WriteLine("Right triangle:");
for (int i = 1; i <= rows; i++)          // outer loop = rows
{
    for (int j = 1; j <= i; j++)         // inner loop = stars in this row
    {
        Console.Write("*");
    }
    Console.WriteLine();                 // move to next line after each row
}

Console.WriteLine("Inverted triangle:");
for (int i = rows; i >= 1; i--)
{
    for (int j = 1; j <= i; j++)
    {
        Console.Write("*");
    }
    Console.WriteLine();
}
`;

const pyramidCode = `// Day 10 - Example 2: Pyramid pattern (spaces + stars)
int rows = 4;

for (int i = 1; i <= rows; i++)
{
    // 1) print leading spaces: rows - i
    for (int s = 1; s <= rows - i; s++)
    {
        Console.Write(" ");
    }
    // 2) print stars: 2 * i - 1
    for (int k = 1; k <= 2 * i - 1; k++)
    {
        Console.Write("*");
    }
    Console.WriteLine();
}
`;

const numberCode = `// Day 10 - Example 3: Number patterns
int rows = 4;

Console.WriteLine("Pattern A (print j):");
for (int i = 1; i <= rows; i++)
{
    for (int j = 1; j <= i; j++) Console.Write(j);
    Console.WriteLine();
}

Console.WriteLine("Pattern B (print i):");
for (int i = 1; i <= rows; i++)
{
    for (int j = 1; j <= i; j++) Console.Write(i);
    Console.WriteLine();
}

Console.WriteLine("Floyd's triangle:");
int number = 1;
for (int i = 1; i <= rows; i++)
{
    for (int j = 1; j <= i; j++)
    {
        Console.Write(number);
        if (j < i) Console.Write(" ");   // space between numbers, not after the last one
        number++;
    }
    Console.WriteLine();
}
`;

const breakContinueCode = `// Day 10 - Example 4: break and continue
// continue -> skip the rest of THIS iteration
string line = "";
for (int i = 1; i <= 10; i++)
{
    if (i % 3 == 0) continue;     // skip 3, 6, 9
    line += i + " ";
}
Console.WriteLine("Skipping multiples of 3: " + line.Trim());

// break -> leave the loop completely
for (int n = 50; n <= 100; n++)
{
    if (n % 7 == 0)
    {
        Console.WriteLine($"First multiple of 7 from 50: {n}");
        break;
    }
}

// break inside a nested loop exits ONLY the inner loop
for (int i = 1; i <= 3; i++)
{
    for (int j = 1; j <= 3; j++)
    {
        if (j == 2) break;
        Console.WriteLine($"i={i}, j={j}");
    }
}

// while (true) + break = controlled infinite loop
int k = 0, total = 0;
while (true)
{
    k++;
    total += k;
    if (total > 20) break;
}
Console.WriteLine($"Stopped at k={k}, total={total}");
`;

const primeCode = `// Day 10 - Example 5: Prime numbers from 2 to 30 (nested loop + break + flag)
string primes = "";
int count = 0;

for (int n = 2; n <= 30; n++)
{
    bool isPrime = true;

    for (int d = 2; d * d <= n; d++)   // test divisors up to the square root
    {
        if (n % d == 0)
        {
            isPrime = false;
            break;                     // one divisor is enough - stop checking
        }
    }

    if (isPrime)
    {
        primes += n + " ";
        count++;
    }
}

Console.WriteLine("Prime numbers between 1 and 30:");
Console.WriteLine(primes.Trim());
Console.WriteLine($"Total primes: {count}");
`;

const gridCode = `// Day 10 - Example 6: Multiplication grid with aligned columns
for (int i = 1; i <= 5; i++)
{
    for (int j = 1; j <= 5; j++)
    {
        Console.Write($"{i * j,4}");   // ,4 = right-align in 4 characters
    }
    Console.WriteLine();
}
`;

export default {
  id: 'day-010-nested-loops-break-continue',
  title: 'Nested Loops, break and continue',
  module: 'Module 1: C# Programming Fundamentals',
  day: 10,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Put one loop inside another to print star and number patterns, multiplication grids and prime numbers. Learn how break leaves a loop early and how continue skips a single iteration.`,
  objectives: [
    'Explain how a nested loop executes (inner loop completes fully for each outer iteration)',
    'Print star, pyramid and number patterns by relating rows (i) and columns (j)',
    'Use break to exit a loop early and continue to skip an iteration',
    'Find prime numbers using a nested loop, a bool flag and break',
  ],
  theory: [
    {
      heading: 'What is a nested loop?',
      content: `A nested loop is a loop written inside another loop. For EVERY single iteration of the outer loop, the inner loop runs completely from start to end. Analogy: a clock - the minute hand (inner loop) goes round 60 times for every 1 step of the hour hand (outer loop). If the outer loop runs 4 times and the inner loop runs 5 times, the inner body runs 4 x 5 = 20 times. In patterns, the outer loop controls ROWS (lines) and the inner loop controls COLUMNS (what is printed on each line).`,
      syntax: `for (int i = 1; i <= rows; i++)        // rows
{
    for (int j = 1; j <= cols; j++)    // columns
    {
        Console.Write(...);           // same line
    }
    Console.WriteLine();               // new line after each row
}`,
    },
    {
      heading: 'How to solve any pattern program',
      content: `Step 1: count the rows - that is the outer loop. Step 2: for row i, write down how many items are printed (1, 2, 3 ... means j <= i; 5, 4, 3 ... means j <= rows - i + 1 or a reversed outer loop). Step 3: decide WHAT is printed - a star, j (column number), i (row number) or a running counter. Step 4: for centred shapes (pyramids) print rows - i spaces first, then 2 * i - 1 stars. Always use Console.Write inside the inner loop and Console.WriteLine after it.`,
      points: [
        'Right triangle: j from 1 to i',
        'Inverted triangle: outer i from rows down to 1, j from 1 to i',
        'Pyramid: spaces = rows - i, stars = 2 * i - 1',
        "Floyd's triangle: keep a counter outside both loops and increase it on each print",
      ],
      tip: 'Draw the pattern on paper and write the row number and count next to each line before coding.',
    },
    {
      heading: 'The break statement',
      content: `break immediately exits the nearest enclosing loop (or switch). Code after break inside the loop is skipped and execution continues with the first statement after the loop. Use it when you have found what you were searching for (first multiple of 7, first divisor) - there is no need to keep looping. IMPORTANT: inside nested loops, break leaves only the INNER loop; the outer loop continues with its next iteration.`,
      syntax: `for (int n = 1; n <= 100; n++)
{
    if (condition) break;   // jump out of this loop
}`,
    },
    {
      heading: 'The continue statement',
      content: `continue skips the remaining statements of the CURRENT iteration and jumps to the next one. In a for loop the update (i++) still runs. In a while loop, be careful: if the update is written after continue, it will be skipped and you get an infinite loop. Use continue to filter out values you do not want to process (skip even numbers, skip absent students, skip multiples of 3).`,
      syntax: `for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0) continue;   // skip even numbers
    Console.WriteLine(i);       // only odd numbers reach here
}`,
      tip: 'In a while loop, put the update BEFORE continue: while (i < 10) { i++; if (i % 2 == 0) continue; ... }',
    },
    {
      heading: 'Exiting several loops and the bool flag pattern',
      content: `C# has no labelled break like Java. To leave both loops you can: (1) use a bool flag - set found = true, break the inner loop and check if (found) break; in the outer loop; (2) move the loops into a method and use return; (3) use goto label (legal but avoided in clean code). The flag pattern is also used for "check all, decide once" problems such as prime numbers: assume isPrime = true, and set it false when a divisor is found.`,
      points: [
        'Flag: bool found = false; ... if (found) break;',
        'return exits the whole method, so it ends all loops at once',
        'Prime check only needs divisors up to the square root: d * d <= n',
      ],
    },
    {
      heading: 'Performance of nested loops',
      content: `Two nested loops over n items do about n x n steps (O(n squared)). For n = 1,000 that is 1,000,000 steps - fine. For n = 1,000,000 it is far too slow. Breaking early (as in the prime check) and limiting the inner range (d * d <= n) are simple ways to make nested loops faster. You can measure time using System.Diagnostics.Stopwatch.`,
    },
  ],
  examples: [
    {
      title: 'Right and inverted star triangles',
      scenario: 'Print the two most common star patterns asked in interviews and lab exams.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StarPatterns',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: starCode,
      csharp: { files: { 'Program.cs': starCode }, stdin: '' },
      result: `Right triangle:
*
**
***
****
*****
Inverted triangle:
*****
****
***
**
*`,
      explanation: `In the first pattern row i prints i stars because the inner loop runs j = 1..i. In the second the outer loop counts down from 5, so the rows get shorter. Console.Write keeps stars on the same line; Console.WriteLine() after the inner loop ends the row.`,
    },
    {
      title: 'Pyramid pattern',
      scenario: 'Print a centred pyramid of 4 rows - spaces first, then stars.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PyramidPattern',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: pyramidCode,
      csharp: { files: { 'Program.cs': pyramidCode }, stdin: '' },
      result: `   *
  ***
 *****
*******`,
      explanation: `Row 1: 3 spaces + 1 star. Row 2: 2 spaces + 3 stars. Row 3: 1 space + 5 stars. Row 4: 0 spaces + 7 stars. So spaces = rows - i and stars = 2 * i - 1. Two inner loops run one after another inside the same outer loop.`,
    },
    {
      title: "Number patterns and Floyd's triangle",
      scenario: 'Print three number patterns: column numbers, row numbers and a continuous counter.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it NumberPatterns',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: numberCode,
      csharp: { files: { 'Program.cs': numberCode }, stdin: '' },
      result: `Pattern A (print j):
1
12
123
1234
Pattern B (print i):
1
22
333
4444
Floyd's triangle:
1
2 3
4 5 6
7 8 9 10`,
      explanation: `The loops are identical; only WHAT is printed changes. Printing j gives 1, 12, 123. Printing i repeats the row number. For Floyd's triangle the counter number is declared outside both loops so it keeps growing across rows (1 to 10). The if (j < i) check avoids a trailing space at the end of each row.`,
    },
    {
      title: 'break and continue in action',
      scenario: 'Skip multiples of 3, find the first multiple of 7 from 50, see that break only exits the inner loop, and stop an infinite loop safely.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it BreakContinue',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on if (j == 2) break; press F5 and step with F10 to watch i and j',
        'Press Ctrl+F5 to see the full output',
      ],
      code: breakContinueCode,
      csharp: { files: { 'Program.cs': breakContinueCode }, stdin: '' },
      result: `Skipping multiples of 3: 1 2 4 5 7 8 10
First multiple of 7 from 50: 56
i=1, j=1
i=2, j=1
i=3, j=1
Stopped at k=6, total=21`,
      explanation: `continue skips 3, 6 and 9. The search loop stops at 56 (7 x 8) - numbers 57..100 are never checked. In the nested loop, when j == 2 the inner loop ends but the outer loop still runs for i = 2 and 3. In the while (true) loop the totals are 1, 3, 6, 10, 15, 21; 21 > 20 so break runs when k = 6.`,
    },
    {
      title: 'Prime numbers from 1 to 30',
      scenario: 'Student practical program: find all prime numbers in a range using nested loops.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PrimeNumbers',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: primeCode,
      csharp: { files: { 'Program.cs': primeCode }, stdin: '' },
      result: `Prime numbers between 1 and 30:
2 3 5 7 11 13 17 19 23 29
Total primes: 10`,
      explanation: `For each n, we assume it is prime and try divisors from 2 while d * d <= n. If any divisor divides n exactly, the flag becomes false and break stops the inner loop early. For n = 2 and 3 the inner loop does not run at all (2 * 2 > 3), so they stay prime. Numbers are joined into a string and Trim() removes the last space.`,
    },
    {
      title: 'Multiplication grid (1 to 5)',
      scenario: 'Print a 5 x 5 multiplication table as a neat grid using alignment in string interpolation.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MultiplicationGrid',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: gridCode,
      csharp: { files: { 'Program.cs': gridCode }, stdin: '' },
      result: `   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20
   5  10  15  20  25`,
      explanation: `{i * j,4} right-aligns each value in a 4-character column, so single and double digit numbers line up. The inner body runs 5 x 5 = 25 times in total.`,
    },
  ],
  interview: [
    { q: 'What is the difference between break and continue?', a: 'break exits the loop completely; continue skips the rest of the current iteration and moves to the next iteration.', level: 'Easy' },
    { q: 'In nested loops, which loop does break exit?', a: 'Only the innermost loop that contains it. The outer loop continues with its next iteration.', level: 'Easy' },
    { q: 'How can you exit both inner and outer loops at once in C#?', a: 'Use a bool flag checked in the outer loop, put the loops in a method and use return, or use goto to a label after the loops. C# has no labelled break.', level: 'Medium' },
    { q: 'What is the output? for (int i = 1; i <= 5; i++) { if (i == 3) continue; Console.Write(i); }', a: '1245 - 3 is skipped.', level: 'Easy' },
    { q: 'What is the output? for (int i = 1; i <= 5; i++) { if (i == 3) break; Console.Write(i); }', a: '12 - the loop stops when i is 3.', level: 'Easy' },
    { q: 'What is the output? for (int i = 1; i <= 3; i++) for (int j = 1; j <= i; j++) Console.Write(j);', a: '112123 - row 1 prints 1, row 2 prints 12, row 3 prints 123, all on one line because there is no WriteLine.', level: 'Medium' },
    { q: 'What is the output? int c = 0; for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) if (i == j) c++; Console.Write(c);', a: '3 - only (0,0), (1,1) and (2,2) match.', level: 'Medium' },
    { q: 'How many times does the inner body run if the outer loop runs 4 times and the inner loop runs 5 times?', a: '20 times (4 x 5). Nested loops multiply.', level: 'Easy' },
    { q: 'Why can continue inside a while loop cause an infinite loop?', a: 'If the update statement (i++) is after continue, it is skipped whenever continue runs, so the condition never changes. In a for loop the update in the header always runs.', level: 'Medium' },
    { q: 'Why does a prime check only test divisors while d * d <= n?', a: 'If n has a divisor bigger than its square root, the matching partner divisor is smaller than the square root and would already have been found. This reduces work from n steps to about sqrt(n).', level: 'Hard' },
    { q: 'What is the time complexity of two nested loops each running n times?', a: 'O(n squared). Doubling n makes it about four times slower.', level: 'Medium' },
    { q: 'What is printed? int i = 0; while (i < 5) { i++; if (i % 2 == 0) continue; Console.Write(i); }', a: '135 - even values are skipped. The update i++ is before continue so there is no infinite loop.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Student practical program: Prime number check. Read a number and print whether it is Prime or Not Prime (1 and 0 are not prime).',
      hint: 'bool isPrime = n > 1; loop d from 2 while d * d <= n; if n % d == 0 set false and break.',
      solution: `Console.Write("Enter a number: ");
int n = int.Parse(Console.ReadLine() ?? "0");
bool isPrime = n > 1;
for (int d = 2; d * d <= n; d++)
{
    if (n % d == 0)
    {
        isPrime = false;
        break;
    }
}
Console.WriteLine(isPrime ? $"{n} is Prime" : $"{n} is Not Prime");
// 29 -> 29 is Prime ; 21 -> 21 is Not Prime`,
    },
    {
      task: 'Print an inverted number triangle for 5 rows: 12345 / 1234 / 123 / 12 / 1.',
      hint: 'Outer loop i from 5 down to 1, inner loop j from 1 to i printing j.',
      solution: `for (int i = 5; i >= 1; i--)
{
    for (int j = 1; j <= i; j++) Console.Write(j);
    Console.WriteLine();
}`,
    },
    {
      task: 'Print a diamond of stars with 3 rows in the top half (pyramid followed by an inverted pyramid without repeating the middle row).',
      hint: 'Reuse the pyramid loop for i = 1..3, then another loop for i = 2 down to 1.',
      solution: `int n = 3;
for (int i = 1; i <= n; i++)
{
    for (int s = 1; s <= n - i; s++) Console.Write(" ");
    for (int k = 1; k <= 2 * i - 1; k++) Console.Write("*");
    Console.WriteLine();
}
for (int i = n - 1; i >= 1; i--)
{
    for (int s = 1; s <= n - i; s++) Console.Write(" ");
    for (int k = 1; k <= 2 * i - 1; k++) Console.Write("*");
    Console.WriteLine();
}
/* Output:
  *
 ***
*****
 ***
  *   */`,
    },
    {
      task: 'Print all numbers from 1 to 50 that are NOT divisible by 2 or 5, using continue.',
      hint: 'if (i % 2 == 0 || i % 5 == 0) continue;',
      solution: `for (int i = 1; i <= 50; i++)
{
    if (i % 2 == 0 || i % 5 == 0) continue;
    Console.Write(i + " ");
}
// 1 3 7 9 11 13 17 19 21 23 27 29 31 33 37 39 41 43 47 49`,
    },
    {
      task: 'Print all prime numbers between two numbers entered by the user (e.g. 10 and 40).',
      hint: 'Outer loop over the range, inner loop for divisors, flag + break.',
      solution: `Console.Write("Start: ");
int start = int.Parse(Console.ReadLine() ?? "0");
Console.Write("End: ");
int end = int.Parse(Console.ReadLine() ?? "0");
for (int n = Math.Max(2, start); n <= end; n++)
{
    bool prime = true;
    for (int d = 2; d * d <= n; d++)
    {
        if (n % d == 0) { prime = false; break; }
    }
    if (prime) Console.Write(n + " ");
}
// 10 and 40 -> 11 13 17 19 23 29 31 37`,
    },
  ],
  quiz: [
    {
      question: 'Outer loop runs 3 times, inner loop runs 4 times. How many times does the inner body execute?',
      options: ['7', '4', '12', '3'],
      answer: 2,
      explanation: 'Nested loops multiply: 3 x 4 = 12.',
    },
    {
      question: 'What does continue do inside a for loop?',
      options: ['Skips the rest of the current iteration and goes to the next one', 'Exits the loop', 'Restarts the loop from the first value', 'Exits the program'],
      answer: 0,
      explanation: 'continue jumps to the update part (i++) and the next condition check.',
    },
    {
      question: 'For a pyramid with 5 rows, how many stars are printed in row 3?',
      options: ['3', '6', '4', '5'],
      answer: 3,
      explanation: 'stars = 2 * i - 1 = 2 * 3 - 1 = 5.',
    },
    {
      question: 'What is printed? for (int i = 1; i <= 3; i++) { for (int j = 1; j <= 3; j++) { if (j == 2) break; Console.Write(j); } }',
      options: ['123', '111', '1', '112233'],
      answer: 1,
      explanation: 'The inner loop prints 1 then breaks at j = 2. The outer loop still runs 3 times, so 1 is printed three times.',
    },
    {
      question: 'Which keyword can jump out of BOTH nested loops directly when they are inside a method?',
      options: ['continue', 'break', 'return', 'exit'],
      answer: 2,
      explanation: 'return leaves the whole method, so all loops inside it end. break only exits the innermost loop.',
    },
  ],
};
