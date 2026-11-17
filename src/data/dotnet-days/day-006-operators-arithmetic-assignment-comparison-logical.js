const arithmeticCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

int a = 17;
int b = 5;

Console.WriteLine("===== SIMPLE CALCULATOR =====");
Console.WriteLine($"{a} + {b} = {a + b}");
Console.WriteLine($"{a} - {b} = {a - b}");
Console.WriteLine($"{a} * {b} = {a * b}");
Console.WriteLine($"{a} / {b} = {a / b}      (integer division)");
Console.WriteLine($"{a} % {b} = {a % b}      (remainder)");
Console.WriteLine($"{a} / {b} = {(double)a / b}    (real division)");
Console.WriteLine($"-{a} % {b} = {-a % b}    (sign follows the left operand)");`;

const assignmentCode = `int x = 10;
Console.WriteLine("x = 10   -> " + x);
x += 5;      // x = x + 5
Console.WriteLine("x += 5   -> " + x);
x -= 3;      // x = x - 3
Console.WriteLine("x -= 3   -> " + x);
x *= 2;      // x = x * 2
Console.WriteLine("x *= 2   -> " + x);
x /= 5;      // x = x / 5
Console.WriteLine("x /= 5   -> " + x);
x %= 3;      // x = x % 3
Console.WriteLine("x %= 3   -> " + x);

// Increment and decrement
int n = 5;
int post = n++;    // use n (5), THEN increase it
Console.WriteLine($"post = n++ -> post = {post}, n = {n}");
int pre = ++n;     // increase n first (7), THEN use it
Console.WriteLine($"pre = ++n  -> pre = {pre}, n = {n}");
n--;
Console.WriteLine($"n--        -> n = {n}");

// += also works on strings
string message = "Hello";
message += ", Student";
Console.WriteLine(message);`;

const logicalCode = `int age = 20;
int marks = 72;
bool hasIdCard = true;

// Comparison operators always give a bool
Console.WriteLine("age >= 18      : " + (age >= 18));
Console.WriteLine("marks == 100   : " + (marks == 100));
Console.WriteLine("marks != 100   : " + (marks != 100));
Console.WriteLine("marks < 35     : " + (marks < 35));

// Logical operators combine bools
Console.WriteLine("age >= 18 && hasIdCard : " + (age >= 18 && hasIdCard));
Console.WriteLine("marks < 35 || !hasIdCard : " + (marks < 35 || !hasIdCard));
Console.WriteLine("!(age < 18)    : " + !(age < 18));
Console.WriteLine("true ^ true    : " + (true ^ true));

// Short-circuit: && skips the right side when the left side is false
bool isMember = false;
int count = 0;
bool r1 = isMember && (++count > 0);
Console.WriteLine($"&& -> result {r1}, count = {count}");
bool r2 = isMember & (++count > 0);
Console.WriteLine($"&  -> result {r2}, count = {count}");`;

const calculatorCode = `using System.Globalization;

Console.Write("Enter first number: ");
int first = int.Parse(Console.ReadLine()!);
Console.Write("Enter second number: ");
int second = int.Parse(Console.ReadLine()!);

int sum = first + second;
int difference = first - second;
int product = first * second;
int quotient = first / second;
int remainder = first % second;
double exact = (double)first / second;

Console.WriteLine();
Console.WriteLine("Addition       : " + sum);
Console.WriteLine("Subtraction    : " + difference);
Console.WriteLine("Multiplication : " + product);
Console.WriteLine("Division       : " + quotient + " remainder " + remainder);
Console.WriteLine("Exact division : " + exact.ToString("0.00", CultureInfo.InvariantCulture));
Console.WriteLine("Is first bigger? " + (first > second));
Console.WriteLine("Both even? " + (first % 2 == 0 && second % 2 == 0));`;

const precedenceCode = `Console.WriteLine(2 + 3 * 4);         // * before +
Console.WriteLine((2 + 3) * 4);       // brackets first
Console.WriteLine(10 - 4 - 3);        // left to right
Console.WriteLine(20 / 4 * 2);        // left to right: (20 / 4) * 2
Console.WriteLine(10 % 3 * 2);        // (10 % 3) * 2
Console.WriteLine(5 > 3 && 2 > 4 || 1 == 1);   // && before ||

// + with strings: left to right
Console.WriteLine("Sum: " + 2 + 3);
Console.WriteLine("Sum: " + (2 + 3));
Console.WriteLine(2 + 3 + " is the sum");

int i = 3;
int result = i++ + ++i;     // 3 + 5
Console.WriteLine($"i++ + ++i = {result}, i = {i}");`;

export default {
  id: 'day-006-operators-arithmetic-assignment-comparison-logical',
  title: 'Operators: Arithmetic, Assignment, Comparison, Logical',
  module: 'Module 1: C# Programming Fundamentals',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Learn the operators that do the work in every C# program: arithmetic (+ - * / %), assignment and compound assignment (= += -= *= /= %=), increment/decrement (++ --), comparison (== != > < >= <=) and logical (&& || ! ^), plus operator precedence and short-circuit evaluation. Practical: a simple calculator.`,
  objectives: [
    'Use arithmetic operators and explain integer division and the remainder operator %',
    'Use compound assignment and pre/post increment and decrement correctly',
    'Write conditions with comparison operators that return bool',
    'Combine conditions with &&, ||, ! and explain short-circuit evaluation',
    'Predict results using operator precedence and associativity',
  ],
  theory: [
    {
      heading: 'What is an operator?',
      content: `An operator is a symbol that performs an action on one, two or three values called operands. In a + b, + is the operator and a and b are the operands. Unary operators take one operand (-x, !flag, count++), binary operators take two (a * b), and the conditional operator ?: takes three (Day 8). The result of an operator is a new value that can be printed, stored or used in another expression.`,
      points: [
        'Arithmetic: +  -  *  /  %',
        'Assignment: =  +=  -=  *=  /=  %=  ??=',
        'Increment/decrement: ++  --',
        'Comparison (relational): ==  !=  >  <  >=  <=',
        'Logical: &&  ||  !  ^ (and the non-short-circuit & |)',
        'Others you will meet later: ?: (Day 8), ?? and ?. (null handling), is/as (Day 28), bitwise << >> ~',
      ],
    },
    {
      heading: 'Arithmetic operators',
      content: `The arithmetic operators work like school maths, with two important rules. 1) If both operands are integers, / does INTEGER division and throws away the fraction: 17 / 5 is 3. Make one operand a double to get 3.4. 2) % gives the remainder of the division: 17 % 5 is 2. The remainder is the key to many programs - even/odd (n % 2), last digit (n % 10), divisibility (n % 3 == 0).`,
      syntax: `int a = 17, b = 5;
a + b      // 22
a - b      // 12
a * b      // 85
a / b      // 3   (int / int)
a % b      // 2
(double)a / b   // 3.4
-17 % 5    // -2  (sign of the left operand)`,
      points: [
        'Integer division by zero throws DivideByZeroException; double division by zero gives Infinity (or NaN for 0.0 / 0)',
        'The result type is the "bigger" of the two operand types: int + double -> double, int + long -> long',
        'byte + byte gives int, so byte c = a + b; needs a cast',
        '+ also joins strings: "Total: " + 50 gives "Total: 50"',
      ],
    },
    {
      heading: 'Assignment, compound assignment, increment and decrement',
      content: `= stores the value on the right into the variable on the left. Compound operators are shortcuts: x += 5 means x = x + 5. ++ adds 1 and -- subtracts 1. The position matters when the expression is used in a bigger statement: post-increment (n++) returns the OLD value and then increases n; pre-increment (++n) increases first and returns the NEW value.`,
      syntax: `int x = 10;
x += 5;   // 15
x -= 3;   // 12
x *= 2;   // 24
x /= 5;   // 4
x %= 3;   // 1

int n = 5;
int a = n++;   // a = 5, n = 6
int b = ++n;   // b = 7, n = 7`,
      points: [
        '= is assignment, == is comparison - mixing them up is a classic bug (C# catches if (x = 5) as a compile error for int)',
        'Compound operators include an implicit cast: byte b = 10; b += 5; compiles, but b = b + 5; does not',
        'On its own line, n++; and ++n; do the same thing',
      ],
    },
    {
      heading: 'Comparison operators',
      content: `Comparison operators compare two values and always return a bool (True or False). They are used in if conditions and loops. For strings, == compares the text (case-sensitive), so "abc" == "ABC" is False.`,
      syntax: `int marks = 72;
marks == 72   // True  (equal to)
marks != 72   // False (not equal to)
marks > 35    // True
marks < 35    // False
marks >= 72   // True
marks <= 50   // False`,
      points: [
        'Use string.Equals(a, b, StringComparison.OrdinalIgnoreCase) for case-insensitive string comparison',
        'Do not compare double results with == (0.1 + 0.2 == 0.3 is False); use Math.Abs(a - b) < 0.0001',
        '< and > do not work on strings in C#; use string.Compare',
      ],
    },
    {
      heading: 'Logical operators and short-circuit evaluation',
      content: `Logical operators combine bool values. && (AND) is true only if BOTH sides are true. || (OR) is true if AT LEAST ONE side is true. ! (NOT) reverses a bool. ^ (XOR) is true when the sides are different. && and || are short-circuit operators: if the left side already decides the answer, the right side is not evaluated at all. This makes checks like (name != null && name.Length > 0) safe.`,
      syntax: `bool canVote = age >= 18 && hasIdCard;
bool discount = isStudent || isSenior;
bool notPassed = !(marks >= 35);
// AND truth table: T&&T=T  T&&F=F  F&&T=F  F&&F=F
// OR  truth table: T||T=T  T||F=T  F||T=T  F||F=F`,
      points: [
        '& and | on bools evaluate BOTH sides always (no short-circuit)',
        'Put the cheap or null-check condition on the left of &&',
        'Real-world analogy: a cinema lets you in if (hasTicket && age >= 18); a shop gives a discount if (isMember || billAmount > 5000)',
      ],
    },
    {
      heading: 'Operator precedence and associativity',
      content: `When an expression has several operators, precedence decides which runs first, just like BODMAS in maths. Operators with the same precedence run left to right (except assignment, which runs right to left: a = b = 5). When in doubt, add brackets - they make the code clearer and cost nothing.`,
      points: [
        '1. Brackets ( )  and postfix x++ x--',
        '2. Unary: + - ! ++x --x (type)cast',
        '3. Multiplicative: * / %',
        '4. Additive: + -',
        '5. Relational: < > <= >= ; then equality: == !=',
        '6. Logical AND && ; then logical OR ||',
        '7. Conditional ?: ; then assignment = += -= ...',
      ],
      tip: 'Use the Immediate Window (Debug > Windows > Immediate, or Ctrl+Alt+I) while debugging to test expressions like 20 / 4 * 2 quickly.',
    },
  ],
  examples: [
    {
      title: 'Simple calculator with arithmetic operators',
      scenario: 'Show every arithmetic operator on 17 and 5, including the difference between integer and real division.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OperatorsDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: arithmeticCode,
      csharp: { files: { 'Program.cs': arithmeticCode }, stdin: '' },
      result: `===== SIMPLE CALCULATOR =====
17 + 5 = 22
17 - 5 = 12
17 * 5 = 85
17 / 5 = 3      (integer division)
17 % 5 = 2      (remainder)
17 / 5 = 3.4    (real division)
-17 % 5 = -2    (sign follows the left operand)`,
      explanation: `17 / 5 with two ints gives 3 (5 goes into 17 three times) and 17 % 5 gives the remainder 2, because 3 x 5 + 2 = 17. Casting a to double first makes the division real: 3.4. For a negative left operand, C# keeps the sign: -17 % 5 = -2 (since -3 x 5 + -2 = -17). This is why an odd-number check should be n % 2 != 0, not n % 2 == 1.`,
    },
    {
      title: 'Assignment, compound assignment and ++ / --',
      scenario: 'Track how a variable changes after each compound assignment, and see the difference between n++ and ++n.',
      steps: [
        'File > New > Project > Console App, name it AssignmentDemo',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on int post = n++; press F5, then F10 line by line and watch n and post in the Locals window',
        'Press Ctrl+F5 to run without debugging',
      ],
      code: assignmentCode,
      csharp: { files: { 'Program.cs': assignmentCode }, stdin: '' },
      result: `x = 10   -> 10
x += 5   -> 15
x -= 3   -> 12
x *= 2   -> 24
x /= 5   -> 4
x %= 3   -> 1
post = n++ -> post = 5, n = 6
pre = ++n  -> pre = 7, n = 7
n--        -> n = 6
Hello, Student`,
      explanation: `10 + 5 = 15, 15 - 3 = 12, 12 x 2 = 24, 24 / 5 = 4 (integer division), 4 % 3 = 1. post = n++ copies the old value 5 into post and then makes n 6. pre = ++n first makes n 7 and then copies 7 into pre. n-- reduces n to 6. += on a string appends text.`,
    },
    {
      title: 'Comparison and logical operators with short-circuit',
      scenario: 'Check voting eligibility and exam conditions, then prove that && skips its right side when the left side is false.',
      steps: [
        'File > New > Project > Console App, name it LogicalDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change isMember to true and run again: both lines now increase count',
      ],
      code: logicalCode,
      csharp: { files: { 'Program.cs': logicalCode }, stdin: '' },
      result: `age >= 18      : True
marks == 100   : False
marks != 100   : True
marks < 35     : False
age >= 18 && hasIdCard : True
marks < 35 || !hasIdCard : False
!(age < 18)    : True
true ^ true    : False
&& -> result False, count = 0
&  -> result False, count = 1`,
      explanation: `Every comparison produces a bool. 20 >= 18 and hasIdCard are both true, so && gives True. marks < 35 is False and !hasIdCard is False, so || gives False. XOR of two equal values is False. With isMember = false, && already knows the answer is False, so ++count is never executed (count stays 0). The single & evaluates both sides, so count becomes 1 even though the result is still False.`,
    },
    {
      title: 'Simple calculator with user input',
      scenario: 'Read two numbers from the keyboard and print the result of every operation, plus two comparisons.',
      steps: [
        'File > New > Project > Console App, name it SimpleCalculator',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and enter 20 and 6',
        'Run again with 7 and 0 - integer division by zero throws DivideByZeroException (you will handle it with if on Day 7 and try/catch on Day 31)',
      ],
      code: calculatorCode,
      csharp: { files: { 'Program.cs': calculatorCode }, stdin: '20\n6\n' },
      result: `Enter first number: Enter second number: 
Addition       : 26
Subtraction    : 14
Multiplication : 120
Division       : 3 remainder 2
Exact division : 3.33
Is first bigger? True
Both even? True`,
      explanation: `20 + 6 = 26, 20 - 6 = 14, 20 x 6 = 120. 20 / 6 is 3 with remainder 2 (3 x 6 + 2 = 20). Casting to double gives 3.333..., formatted with "0.00" to 3.33. 20 > 6 is True, and both numbers have remainder 0 when divided by 2, so the && condition is True. Console.WriteLine() with no arguments prints an empty line, which ends the "Enter second number: " line.`,
    },
    {
      title: 'Operator precedence puzzles',
      scenario: 'Predict the output of tricky expressions before running them - a favourite in interviews.',
      steps: [
        'File > New > Project > Console App, name it PrecedenceDemo',
        'Replace Program.cs with the code',
        'Write down your predicted output on paper first',
        'Press Ctrl+F5 and compare',
      ],
      code: precedenceCode,
      csharp: { files: { 'Program.cs': precedenceCode }, stdin: '' },
      result: `14
20
3
10
2
True
Sum: 23
Sum: 5
5 is the sum
i++ + ++i = 8, i = 5`,
      explanation: `3 * 4 runs before + (14); brackets force 5 * 4 (20). Same-precedence operators run left to right: (10 - 4) - 3 = 3, (20 / 4) * 2 = 10, (10 % 3) * 2 = 2. && runs before ||: (True && False) || True = True. "Sum: " + 2 becomes the string "Sum: 2", then + 3 appends "3". With brackets 2 + 3 is added first. In 2 + 3 + " is the sum" the numbers are added first because evaluation is left to right. i++ gives 3 (i becomes 4), then ++i makes i 5 and gives 5: 3 + 5 = 8. Avoid writing code like the last line in real projects.`,
    },
  ],
  interview: [
    { q: 'What is the output of Console.WriteLine(7 / 2); and Console.WriteLine(7 % 2);?', a: '3 and 1. Both operands are int, so / is integer division; % gives the remainder.', level: 'Easy' },
    { q: 'What is the difference between i++ and ++i?', a: 'Both add 1 to i. i++ (post-increment) returns the value BEFORE incrementing; ++i (pre-increment) returns the value AFTER incrementing. int i = 5; int a = i++; gives a = 5; int b = ++i; then gives b = 7.', level: 'Easy' },
    { q: 'What is the difference between && and &?', a: '&& is the conditional (short-circuit) AND: it skips the right operand if the left is false. & on bools always evaluates both sides (and on integers it is bitwise AND).', level: 'Medium' },
    { q: 'What is the difference between = and ==?', a: '= assigns a value to a variable; == compares two values and returns bool.', level: 'Easy' },
    { q: 'What does -7 % 3 return in C#?', a: '-1. The result of % has the sign of the left operand (dividend).', level: 'Medium' },
    { q: 'What is printed: Console.WriteLine("A" + 1 + 2); Console.WriteLine(1 + 2 + "A");', a: '"A12" and "3A". Evaluation is left to right; once a string is involved, + concatenates.', level: 'Medium' },
    { q: 'What happens with int x = 10 / 0; and double y = 10.0 / 0;?', a: 'int x = 10 / 0; with constants is a compile error (CS0020); with variables it throws DivideByZeroException at run time. 10.0 / 0 gives double.PositiveInfinity (prints ∞ on .NET Core 3.0+) without an exception.', level: 'Hard' },
    { q: 'Why does byte a = 1, b = 2; byte c = a + b; not compile, but c += a; does?', a: 'Arithmetic on byte is promoted to int, so a + b is an int and needs an explicit cast. Compound assignment includes an implicit cast back to the variable type.', level: 'Hard' },
    { q: 'What is the value of x after: int x = 5; x += x++ * 2;', a: '15. x += expr means x = x + expr; the left x is read first (5), then x++ yields 5 (x temporarily 6), 5 * 2 = 10, so x = 5 + 10 = 15 overwrites the increment.', level: 'Hard' },
    { q: 'What is short-circuit evaluation and why is it useful?', a: 'With && and ||, the right operand is evaluated only if needed. It avoids unnecessary work and prevents errors, e.g. if (s != null && s.Length > 0) never calls Length on null.', level: 'Medium' },
    { q: 'Which has higher precedence: && or ||?', a: '&&. So a || b && c means a || (b && c). Use brackets to make intent clear.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Even or odd: read a number and print True if it is even, using only the % and == operators (no if yet).',
      hint: 'bool isEven = n % 2 == 0;',
      solution: `Console.Write("Enter a number: ");
int n = int.Parse(Console.ReadLine()!);
bool isEven = n % 2 == 0;
Console.WriteLine("Is even? " + isEven);   // 14 -> Is even? True, 9 -> Is even? False`,
    },
    {
      task: 'Reverse a 3-digit number using / and % only. Example: 472 -> 274.',
      hint: 'Last digit = n % 10, middle = (n / 10) % 10, first = n / 100.',
      solution: `int n = 472;
int last = n % 10;            // 2
int middle = (n / 10) % 10;   // 7
int first = n / 100;          // 4
int reversed = last * 100 + middle * 10 + first;
Console.WriteLine(reversed);  // 274`,
    },
    {
      task: 'Convert total seconds 3725 into hours, minutes and seconds.',
      hint: 'hours = s / 3600; minutes = (s % 3600) / 60; seconds = s % 60.',
      solution: `int total = 3725;
int hours = total / 3600;            // 1
int minutes = (total % 3600) / 60;   // 2
int seconds = total % 60;            // 5
Console.WriteLine($"{hours}h {minutes}m {seconds}s");   // 1h 2m 5s`,
    },
    {
      task: 'Leap-year check with logical operators: a year is a leap year if it is divisible by 4 and not by 100, or divisible by 400. Print the result for 2024, 1900 and 2000.',
      hint: '(y % 4 == 0 && y % 100 != 0) || y % 400 == 0',
      solution: `int y1 = 2024, y2 = 1900, y3 = 2000;
Console.WriteLine((y1 % 4 == 0 && y1 % 100 != 0) || y1 % 400 == 0);   // True
Console.WriteLine((y2 % 4 == 0 && y2 % 100 != 0) || y2 % 400 == 0);   // False
Console.WriteLine((y3 % 4 == 0 && y3 % 100 != 0) || y3 % 400 == 0);   // True`,
    },
    {
      task: 'Simple interest calculator: principal 50000, rate 7.5 percent, time 3 years. SI = P * R * T / 100. Print SI and total amount using decimal.',
      hint: 'decimal p = 50000m, r = 7.5m; int t = 3;',
      solution: `using System.Globalization;

decimal p = 50000m, r = 7.5m;
int t = 3;
decimal si = p * r * t / 100;
Console.WriteLine("Interest = " + si.ToString("0.00", CultureInfo.InvariantCulture));        // Interest = 11250.00
Console.WriteLine("Amount = " + (p + si).ToString("0.00", CultureInfo.InvariantCulture));    // Amount = 61250.00`,
    },
  ],
  quiz: [
    { question: 'What is the value of 17 % 5?', options: ['3', '3.4', '2', '5'], answer: 2, explanation: '17 = 3 x 5 + 2, so the remainder is 2.' },
    { question: 'After int n = 5; int a = n++;, what are a and n?', options: ['a = 5, n = 6', 'a = 6, n = 6', 'a = 5, n = 5', 'a = 6, n = 5'], answer: 0, explanation: 'Post-increment returns the old value (5) and then increases n to 6.' },
    { question: 'What does Console.WriteLine("Total: " + 4 + 6); print?', options: ['Total: 10', 'Total: 46', 'Compile error', 'Total: 4 6'], answer: 1, explanation: 'Left to right: "Total: " + 4 is a string, then "6" is appended.' },
    { question: 'Which expression is true when age is 20 and hasTicket is false?', options: ['age >= 18 && hasTicket', '!(age >= 18)', 'age < 18 || hasTicket', 'age >= 18 || hasTicket'], answer: 3, explanation: 'With ||, one true side (age >= 18) is enough.' },
    { question: 'What is the result of 2 + 3 * 4 - 6 / 2?', options: ['7', '11', '14', '17'], answer: 1, explanation: '3 * 4 = 12 and 6 / 2 = 3 first, then 2 + 12 - 3 = 11.' },
  ],
};
