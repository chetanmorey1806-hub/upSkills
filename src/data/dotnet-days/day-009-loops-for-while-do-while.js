const tableCode = `// Day 9 - Example 1: Multiplication table using a for loop
int number = 7;

Console.WriteLine($"Multiplication Table of {number}");
Console.WriteLine("----------------------");

for (int i = 1; i <= 10; i++)
{
    Console.WriteLine($"{number} x {i} = {number * i}");
}

Console.WriteLine("----------------------");
Console.WriteLine("Done!");
`;

const reverseCode = `// Day 9 - Example 2: while loop - reverse a number, count and add its digits
int number = 12345;
int original = number;
int reversed = 0;
int sum = 0;
int digits = 0;

while (number > 0)
{
    int digit = number % 10;          // last digit
    reversed = reversed * 10 + digit; // push digit into reversed
    sum += digit;
    digits++;
    number /= 10;                     // remove last digit
}

Console.WriteLine($"Original number : {original}");
Console.WriteLine($"Reversed number : {reversed}");
Console.WriteLine($"Number of digits: {digits}");
Console.WriteLine($"Sum of digits   : {sum}");
`;

const menuCode = `// Day 9 - Example 3: do-while menu (runs at least once)
int choice;

do
{
    Console.WriteLine("=== MENU ===");
    Console.WriteLine("1. Greet  2. Table of 2  3. Exit");
    Console.Write("Enter choice: ");
    choice = int.Parse(Console.ReadLine() ?? "3");

    if (choice == 1)
    {
        Console.WriteLine("Hello, Student!");
    }
    else if (choice == 2)
    {
        for (int i = 1; i <= 3; i++)
        {
            Console.WriteLine($"2 x {i} = {2 * i}");
        }
    }
} while (choice != 3);

Console.WriteLine("Goodbye!");
`;

const factorialCode = `// Day 9 - Example 4: for loop with accumulators (sum and factorial)
int n = 5;
int sum = 0;
long factorial = 1;   // long because factorials grow very fast

for (int i = 1; i <= n; i++)
{
    sum += i;
    factorial *= i;
    Console.WriteLine($"i = {i}: sum = {sum}, factorial = {factorial}");
}

Console.WriteLine($"Sum of 1 to {n} = {sum}");
Console.WriteLine($"{n}! = {factorial}");
`;

const palindromeCode = `// Day 9 - Example 5: Palindrome number check + countdown with while
int[] tests = { 121, 1234, 4554 };

for (int t = 0; t < tests.Length; t++)
{
    int num = tests[t];
    int temp = num;
    int rev = 0;

    while (temp > 0)
    {
        rev = rev * 10 + temp % 10;
        temp /= 10;
    }

    if (rev == num)
        Console.WriteLine($"{num} is a Palindrome number");
    else
        Console.WriteLine($"{num} is NOT a Palindrome (reverse = {rev})");
}

int count = 3;
while (count > 0)
{
    Console.WriteLine($"Countdown: {count}");
    count--;
}
Console.WriteLine("Lift off!");
`;

export default {
  id: 'day-009-loops-for-while-do-while',
  title: 'Loops: for, while, do-while',
  module: 'Module 1: C# Programming Fundamentals',
  day: 9,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Learn how to repeat work in C# using the for, while and do-while loops. You will print multiplication tables, reverse numbers, build a menu that repeats, and learn how to debug loops step by step in Visual Studio.`,
  objectives: [
    'Explain why loops are needed and identify the three parts of a loop (start, condition, update)',
    'Write for, while and do-while loops and choose the right one for a problem',
    'Use loops with accumulators (sum, count, factorial) and digit extraction (% 10 and / 10)',
    'Avoid infinite loops and off-by-one errors and debug loops with F9, F10 and the Locals window',
  ],
  theory: [
    {
      heading: 'What is a loop and why do we need it?',
      content: `A loop repeats a block of code again and again while a condition is true. Without loops, printing the table of 7 would need 10 separate Console.WriteLine statements; with a loop it needs 3 lines. Real-world analogy: a teacher taking attendance calls roll numbers 1, 2, 3 ... until the last student - the same action is repeated with a changing value. Every loop has three parts: (1) initialization - where the counter starts, (2) condition - checked before (or after) each round, (3) update - changes the counter so the loop eventually stops. Each round of a loop is called an iteration.`,
      points: [
        'Initialization: int i = 1',
        'Condition: i <= 10 (loop continues while this is true)',
        'Update: i++ (without it the loop never ends)',
        'Body: the statements inside { } that are repeated',
      ],
    },
    {
      heading: 'The for loop',
      content: `Use a for loop when you KNOW how many times to repeat (10 rows of a table, 5 students, 1 to N). All three parts are written in one line, so it is easy to read. The loop variable declared inside for (int i ...) exists only inside the loop - using i after the loop gives error CS0103. The update can be anything: i++, i--, i += 2, i *= 2.`,
      syntax: `for (initialization; condition; update)
{
    // body
}

for (int i = 1; i <= 10; i++)      // 1 to 10
for (int i = 10; i >= 1; i--)      // 10 down to 1
for (int i = 0; i <= 20; i += 5)   // 0, 5, 10, 15, 20`,
      tip: 'Type "for" and press Tab twice in Visual Studio to insert a ready-made for loop snippet. "forr" gives a reverse for loop.',
    },
    {
      heading: 'The while loop',
      content: `A while loop checks the condition FIRST and runs the body only if it is true. Use it when you do NOT know the number of iterations in advance - for example "keep dividing the number by 10 until it becomes 0" or "keep reading input until the user types 0". If the condition is false at the start, the body runs zero times.`,
      syntax: `while (condition)
{
    // body
    // update something so the condition becomes false one day
}`,
      points: [
        'Entry-controlled loop: condition is checked before entering',
        'May execute 0 times',
        'Perfect for digit problems: while (number > 0) { digit = number % 10; number /= 10; }',
      ],
    },
    {
      heading: 'The do-while loop',
      content: `A do-while loop runs the body FIRST and checks the condition AFTER. So the body always runs at least once. This is ideal for menus ("show the menu, read the choice, repeat until Exit") and input validation ("ask for age, repeat while the age is invalid"). Do not forget the semicolon after while (...);`,
      syntax: `do
{
    // body runs at least once
} while (condition);   // <-- semicolon required`,
      tip: 'Remember: while = "look before you leap", do-while = "leap first, then look".',
    },
    {
      heading: 'Choosing a loop, infinite loops and common mistakes',
      content: `for: known count. while: unknown count, may be zero. do-while: unknown count, at least once. An infinite loop never stops because the condition never becomes false - e.g. forgetting i++ in a while loop, or writing for (;;) / while (true) without a break. Infinite loops are sometimes intentional (game loops, servers) but must have an exit using break. An off-by-one error happens when the loop runs one time too many or too few (using < instead of <=). There is also a foreach loop that visits every item of a collection - you will use it with arrays on Day 11.`,
      points: [
        'while (true) { ... if (done) break; } is a common controlled infinite loop',
        'i <= 10 runs 10 times starting at 1; i < 10 runs only 9 times',
        'A semicolon right after for(...); or while(...); creates an empty loop body - a classic bug',
        'Press Ctrl+C in the console window to stop a runaway program',
      ],
    },
    {
      heading: 'Debugging loops in Visual Studio',
      content: `Loops are where beginners make most logic mistakes, so learn to watch them run. Click in the left margin (or press F9) on a line inside the loop to set a breakpoint. Press F5 to start debugging; execution pauses at the breakpoint. Press F10 to step over one line at a time, F11 to step into a method. Open Debug > Windows > Locals to see i, sum, number change on each iteration. Right-click a breakpoint > Conditions to stop only when, for example, i == 7. Press Shift+F5 to stop debugging.`,
      tip: 'Hover the mouse over a variable while paused to see its current value (a DataTip).',
    },
  ],
  examples: [
    {
      title: 'Multiplication table of a number (for loop)',
      scenario: 'A primary school teacher wants a program that prints the multiplication table of 7 from 1 to 10.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#) > Next',
        'Name it LoopsDemo, choose .NET 8.0 or .NET 10.0, click Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 to run without debugging',
      ],
      code: tableCode,
      csharp: { files: { 'Program.cs': tableCode }, stdin: '' },
      result: `Multiplication Table of 7
----------------------
7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
----------------------
Done!`,
      explanation: `i starts at 1. Before every round C# checks i <= 10. The body prints one line, then i++ runs. When i becomes 11 the condition is false and the loop ends, so exactly 10 lines are printed. Change number to any value (or read it with int.Parse(Console.ReadLine())) to print any table.`,
    },
    {
      title: 'Reverse a number and add its digits (while loop)',
      scenario: 'A banking app needs to process the digits of an account number one by one. We reverse 12345 and also count and add its digits.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ReverseNumber',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on the line int digit = number % 10; and press F5, then F10 to watch the variables in the Locals window',
        'Press Ctrl+F5 to see the final output',
      ],
      code: reverseCode,
      csharp: { files: { 'Program.cs': reverseCode }, stdin: '' },
      result: `Original number : 12345
Reversed number : 54321
Number of digits: 5
Sum of digits   : 15`,
      explanation: `Trace table: number=12345 -> digit 5, reversed 5; number=1234 -> digit 4, reversed 54; number=123 -> digit 3, reversed 543; number=12 -> digit 2, reversed 5432; number=1 -> digit 1, reversed 54321; number=0 -> loop stops. % 10 gives the last digit and / 10 (integer division) removes it. We do not know how many digits there are in advance, so while is the natural choice.`,
    },
    {
      title: 'Menu that repeats until Exit (do-while loop)',
      scenario: 'A console menu must be shown at least once and repeat until the user chooses 3 (Exit). Input used: 1, 2, 3.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MenuDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and type 1, Enter, 2, Enter, 3, Enter',
      ],
      code: menuCode,
      csharp: { files: { 'Program.cs': menuCode }, stdin: '1\n2\n3\n' },
      result: `=== MENU ===
1. Greet  2. Table of 2  3. Exit
Enter choice: Hello, Student!
=== MENU ===
1. Greet  2. Table of 2  3. Exit
Enter choice: 2 x 1 = 2
2 x 2 = 4
2 x 3 = 6
=== MENU ===
1. Greet  2. Table of 2  3. Exit
Enter choice: Goodbye!`,
      explanation: `The menu is printed before any condition is checked - that is the do-while guarantee. After each choice the condition choice != 3 is tested; when the user enters 3 the loop ends and "Goodbye!" is printed. (In the online runner the typed input is not echoed, so output continues on the same line as "Enter choice: ". In a real console you will also see the number you typed.) Notice the for loop nested inside the do-while - loops can be combined freely.`,
    },
    {
      title: 'Sum of 1..N and factorial (for loop with accumulators)',
      scenario: 'Show how a running total (accumulator) changes on every iteration while calculating 1+2+...+5 and 5!.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it Accumulators',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: factorialCode,
      csharp: { files: { 'Program.cs': factorialCode }, stdin: '' },
      result: `i = 1: sum = 1, factorial = 1
i = 2: sum = 3, factorial = 2
i = 3: sum = 6, factorial = 6
i = 4: sum = 10, factorial = 24
i = 5: sum = 15, factorial = 120
Sum of 1 to 5 = 15
5! = 120`,
      explanation: `An accumulator is a variable declared BEFORE the loop and updated INSIDE it. A sum starts at 0 (adding 0 changes nothing) and a product starts at 1 (multiplying by 1 changes nothing). If factorial started at 0 the answer would always be 0. long is used because 21! overflows even long; int overflows after 12!.`,
    },
    {
      title: 'Palindrome number check and countdown',
      scenario: 'Check whether 121, 1234 and 4554 read the same backwards, then print a rocket countdown.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PalindromeNumber',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: palindromeCode,
      csharp: { files: { 'Program.cs': palindromeCode }, stdin: '' },
      result: `121 is a Palindrome number
1234 is NOT a Palindrome (reverse = 4321)
4554 is a Palindrome number
Countdown: 3
Countdown: 2
Countdown: 1
Lift off!`,
      explanation: `A number is a palindrome when it equals its reverse. We copy num into temp because the while loop destroys temp (it becomes 0); we still need the original num for the comparison. The for loop walks over the small array by index (tests.Length is 3). The countdown shows a while loop that counts DOWN using count--.`,
    },
  ],
  interview: [
    { q: 'What is the difference between while and do-while?', a: 'while checks the condition before the body (entry-controlled) and may run 0 times. do-while checks after the body (exit-controlled) and always runs at least once. do-while ends with a semicolon.', level: 'Easy' },
    { q: 'When would you choose a for loop over a while loop?', a: 'Use for when the number of iterations is known (1 to N, every array index). Use while when it depends on a condition that changes unpredictably (until the number becomes 0, until the user enters 0).', level: 'Easy' },
    { q: 'What is the output? for (int i = 0; i < 5; i += 2) Console.Write(i);', a: '024 - i takes the values 0, 2, 4; at 6 the condition is false.', level: 'Easy' },
    { q: 'What is the output? int x = 5; do { Console.Write(x); x++; } while (x < 5);', a: '5 - the body runs once before the condition (6 < 5) is checked and found false.', level: 'Easy' },
    { q: 'What is the output? int i = 0; while (i < 3) Console.Write(++i);', a: '123 - pre-increment increases i before printing: 1, 2, 3. Then i is 3 and the loop stops.', level: 'Medium' },
    { q: 'What is the output? int sum = 0; for (int i = 1; i <= 4; i++) sum += i * i; Console.WriteLine(sum);', a: '30 (1 + 4 + 9 + 16).', level: 'Medium' },
    { q: 'What is the output? for (int i = 10; i > 0; i /= 2) Console.Write(i + " ");', a: '"10 5 2 1 " - integer division: 10, 5, 2, 1, then 0 stops the loop.', level: 'Medium' },
    { q: 'How many times does this loop run? for (int i = 0, j = 10; i < j; i++, j--) { }', a: '5 times: (0,10) (1,9) (2,8) (3,7) (4,6). At (5,5) the condition i < j is false. A for loop can declare and update several variables separated by commas.', level: 'Medium' },
    { q: 'What is an infinite loop? Give two ways to write one deliberately.', a: 'A loop whose condition never becomes false. for (;;) { } and while (true) { }. Use break (or return) inside to exit when needed, e.g. in game loops or servers.', level: 'Easy' },
    { q: 'Why does using i after for (int i = 0; i < 5; i++) { } cause an error?', a: 'i is declared in the for statement, so its scope is only the loop. Outside it the compiler reports CS0103: The name i does not exist in the current context. Declare i before the loop if you need it afterwards.', level: 'Medium' },
    { q: 'What is an off-by-one error?', a: 'A loop that runs one time too many or too few, usually from using < instead of <= or starting at 0 instead of 1. E.g. for (int i = 1; i < 10; i++) prints only 9 lines of a table.', level: 'Easy' },
    { q: 'How do you debug a loop in Visual Studio?', a: 'Set a breakpoint with F9 inside the loop, start with F5, step with F10, watch variables in Locals/Watch windows, and use a conditional breakpoint (right-click > Conditions, e.g. i == 7) to stop only on a specific iteration.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Student practical program: Multiplication table. Read a number from the user and print its table from 1 to 10.',
      hint: 'int n = int.Parse(Console.ReadLine()); then for (int i = 1; i <= 10; i++).',
      solution: `Console.Write("Enter a number: ");
int n = int.Parse(Console.ReadLine() ?? "0");
for (int i = 1; i <= 10; i++)
{
    Console.WriteLine($"{n} x {i} = {n * i}");
}
// Input 5 -> 5 x 1 = 5 ... 5 x 10 = 50`,
    },
    {
      task: 'Student practical program: Reverse a number. Read an integer (e.g. 9081) and print its reverse (1809).',
      hint: 'Use while (num > 0) with digit = num % 10, rev = rev * 10 + digit, num /= 10.',
      solution: `Console.Write("Enter a number: ");
int num = int.Parse(Console.ReadLine() ?? "0");
int rev = 0;
while (num > 0)
{
    int digit = num % 10;
    rev = rev * 10 + digit;
    num /= 10;
}
Console.WriteLine($"Reverse = {rev}");
// Input 9081 -> Reverse = 1809`,
    },
    {
      task: 'Student practical program: Palindrome number. Check whether the entered number is a palindrome (121 -> Palindrome, 123 -> Not Palindrome).',
      hint: 'Keep a copy of the original number, reverse the copy, then compare.',
      solution: `Console.Write("Enter a number: ");
int num = int.Parse(Console.ReadLine() ?? "0");
int temp = num, rev = 0;
while (temp > 0)
{
    rev = rev * 10 + temp % 10;
    temp /= 10;
}
Console.WriteLine(rev == num ? $"{num} is a Palindrome" : $"{num} is Not a Palindrome");`,
    },
    {
      task: 'Student practical program: Factorial using a loop. Read N and print N! (5 -> 120). Use long.',
      hint: 'Start long fact = 1; multiply by i from 1 to N.',
      solution: `Console.Write("Enter N: ");
int n = int.Parse(Console.ReadLine() ?? "0");
long fact = 1;
for (int i = 1; i <= n; i++)
{
    fact *= i;
}
Console.WriteLine($"{n}! = {fact}");
// Input 5 -> 5! = 120 ; Input 0 -> 0! = 1`,
    },
    {
      task: 'Print the sum of all even numbers from 1 to 100 using a for loop with step 2.',
      hint: 'Start at 2 and use i += 2. Expected answer: 2550.',
      solution: `int sum = 0;
for (int i = 2; i <= 100; i += 2)
{
    sum += i;
}
Console.WriteLine($"Sum of even numbers 1-100 = {sum}");
// Output: Sum of even numbers 1-100 = 2550`,
    },
    {
      task: 'Input validation with do-while: keep asking for an age until the user enters a value between 1 and 120.',
      hint: 'Read inside do { } and repeat while (age < 1 || age > 120).',
      solution: `int age;
do
{
    Console.Write("Enter age (1-120): ");
    age = int.Parse(Console.ReadLine() ?? "0");
    if (age < 1 || age > 120) Console.WriteLine("Invalid age, try again.");
} while (age < 1 || age > 120);
Console.WriteLine($"Age accepted: {age}");`,
    },
  ],
  quiz: [
    {
      question: 'Which loop is guaranteed to execute its body at least once?',
      options: ['for', 'do-while', 'while', 'None of them'],
      answer: 1,
      explanation: 'do-while checks the condition after the body, so the body always runs once.',
    },
    {
      question: 'What does this print? int i = 1; while (i < 4) { Console.Write(i); i++; }',
      options: ['1234', '012', '123', 'Infinite loop'],
      answer: 2,
      explanation: 'i = 1, 2, 3 are printed; when i becomes 4 the condition 4 < 4 is false.',
    },
    {
      question: 'What is missing in this code that makes it loop forever? int n = 5; while (n > 0) { Console.WriteLine(n); }',
      options: ['An update such as n--', 'A semicolon after while', 'The keyword do', 'A break before Console.WriteLine'],
      answer: 0,
      explanation: 'n never changes, so n > 0 stays true. Adding n-- makes the loop stop.',
    },
    {
      question: 'For n = 4, what is the value of fact after: long fact = 1; for (int i = 1; i <= n; i++) fact *= i;',
      options: ['10', '4', '16', '24'],
      answer: 3,
      explanation: '1 x 2 x 3 x 4 = 24.',
    },
    {
      question: 'Which Visual Studio key sets or removes a breakpoint on the current line?',
      options: ['F5', 'F9', 'F10', 'Ctrl+F5'],
      answer: 1,
      explanation: 'F9 toggles a breakpoint. F5 starts debugging, F10 steps over, Ctrl+F5 runs without debugging.',
    },
  ],
};
