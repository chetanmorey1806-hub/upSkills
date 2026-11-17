const menuCode = `Console.WriteLine("===== MENU-DRIVEN CALCULATOR =====");
Console.Write("Enter first number: ");
int a = int.Parse(Console.ReadLine()!);
Console.Write("Enter second number: ");
int b = int.Parse(Console.ReadLine()!);

Console.WriteLine("1. Add  2. Subtract  3. Multiply  4. Divide  5. Remainder");
Console.Write("Enter your choice: ");
int choice = int.Parse(Console.ReadLine()!);

switch (choice)
{
    case 1:
        Console.WriteLine($"{a} + {b} = {a + b}");
        break;
    case 2:
        Console.WriteLine($"{a} - {b} = {a - b}");
        break;
    case 3:
        Console.WriteLine($"{a} * {b} = {a * b}");
        break;
    case 4:
        if (b == 0)
            Console.WriteLine("Cannot divide by zero");
        else
            Console.WriteLine($"{a} / {b} = {a / b}");
        break;
    case 5:
        if (b == 0)
            Console.WriteLine("Cannot divide by zero");
        else
            Console.WriteLine($"{a} % {b} = {a % b}");
        break;
    default:
        Console.WriteLine("Invalid choice. Please select 1 to 5.");
        break;
}`;

const dayCode = `int dayNumber = 6;
string dayName;

switch (dayNumber)
{
    case 1: dayName = "Monday"; break;
    case 2: dayName = "Tuesday"; break;
    case 3: dayName = "Wednesday"; break;
    case 4: dayName = "Thursday"; break;
    case 5: dayName = "Friday"; break;
    case 6: dayName = "Saturday"; break;
    case 7: dayName = "Sunday"; break;
    default: dayName = "Invalid day"; break;
}
Console.WriteLine($"Day {dayNumber} is {dayName}");

// Several case labels can share one block
switch (dayNumber)
{
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
        Console.WriteLine("Working day");
        break;
    case 6:
    case 7:
        Console.WriteLine("Weekend - holiday!");
        break;
    default:
        Console.WriteLine("Unknown");
        break;
}

// switch on a string
string command = "START";
switch (command.ToLower())
{
    case "start":
        Console.WriteLine("Engine started");
        break;
    case "stop":
        Console.WriteLine("Engine stopped");
        break;
    default:
        Console.WriteLine("Unknown command");
        break;
}`;

const switchExprCode = `Console.WriteLine($"95 -> {GetGrade(95)}");
Console.WriteLine($"78 -> {GetGrade(78)}");
Console.WriteLine($"35 -> {GetGrade(35)}");
Console.WriteLine($"20 -> {GetGrade(20)}");
Console.WriteLine($"120 -> {GetGrade(120)}");

// switch expression on a string
string light = "Yellow";
string action = light switch
{
    "Red" => "Stop",
    "Yellow" => "Get ready",
    "Green" => "Go",
    _ => "Signal not working"
};
Console.WriteLine($"{light} light: {action}");

// switch expression on a tuple: ticket price by age and day
int age = 15;
bool isWeekend = true;
int price = (age, isWeekend) switch
{
    (< 12, _) => 100,
    (>= 60, _) => 120,
    (_, true) => 250,
    (_, false) => 200
};
Console.WriteLine($"Ticket price (age {age}, weekend {isWeekend}): {price}");

// A local function that returns a switch expression (methods are covered on Day 13)
static string GetGrade(int marks) => marks switch
{
    < 0 or > 100 => "Invalid",
    >= 90 => "A+",
    >= 75 => "A",
    >= 60 => "B",
    >= 35 => "C",
    _ => "F"
};`;

const ternaryCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

// condition ? valueIfTrue : valueIfFalse
int marks = 48;
string result = marks >= 35 ? "Pass" : "Fail";
Console.WriteLine("Result: " + result);

int a = 25, b = 40;
int max = a > b ? a : b;
Console.WriteLine("Max: " + max);

// Nested conditional operator (keep it short!)
int n = 0;
string sign = n > 0 ? "Positive" : n < 0 ? "Negative" : "Zero";
Console.WriteLine($"{n} is {sign}");

// Inside string interpolation the ?: must be in brackets
int items = 1;
Console.WriteLine($"You have {items} item{(items == 1 ? "" : "s")} in your cart");
items = 3;
Console.WriteLine($"You have {items} item{(items == 1 ? "" : "s")} in your cart");

// 10% discount on bills above 5000
decimal bill = 6200m;
decimal discount = bill > 5000 ? bill * 0.10m : 0;
Console.WriteLine($"Bill: {bill}, Discount: {discount}, Pay: {bill - discount}");`;

export default {
  id: 'day-008-switch-switch-expressions-conditional-operator',
  title: 'switch, switch expressions, Conditional Operator',
  module: 'Module 1: C# Programming Fundamentals',
  day: 8,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Learn the cleaner alternatives to long if-else ladders: the switch statement (case, break, default, multiple labels, string cases), the modern switch expression with patterns (relational, logical, tuple, discard _), and the conditional operator ?: for one-line decisions. Practical: a menu-driven calculator.`,
  objectives: [
    'Write switch statements with case, break, default and grouped case labels',
    'Explain the "no fall-through" rule and use goto case when needed',
    'Write switch expressions with constant, relational (<, >=), logical (and, or, not), tuple and discard patterns',
    'Use the conditional operator ?: for simple two-way decisions and know when not to use it',
    'Build a menu-driven calculator using switch',
  ],
  theory: [
    {
      heading: 'The switch statement',
      content: `A switch statement compares ONE value against a list of possible values (cases) and runs the matching block. It is easier to read than a long else-if ladder when you are checking the same variable for equality. Analogy: a lift panel - you press one floor number and the lift goes to exactly that floor; if the number does not exist, nothing (default) happens.`,
      syntax: `switch (expression)
{
    case value1:
        // statements
        break;
    case value2:
        // statements
        break;
    default:
        // when no case matches
        break;
}`,
      points: [
        'The expression can be an integer type, char, string, bool, enum - and, since C# 7, any type when you use patterns',
        'Case values must be constants (literals or const) and must be unique',
        'default is optional and can be placed anywhere, but by convention it is last',
        'Each case section must end with break, return, throw, continue or goto - otherwise error CS0163: Control cannot fall through from one case label to another',
      ],
    },
    {
      heading: 'Grouped case labels, string cases and goto case',
      content: `C# does not allow one case to "fall through" into the next by accident (a common bug in C/C++). If several values need the same code, stack the labels with no statements between them. If you really want to continue into another case, write goto case explicitly.`,
      syntax: `switch (month)
{
    case 12:
    case 1:
    case 2:
        Console.WriteLine("Winter");
        break;
    case 3: case 4: case 5:
        Console.WriteLine("Summer");
        break;
}

switch (plan)
{
    case "Gold":
        Console.WriteLine("Free delivery");
        goto case "Silver";          // explicit jump
    case "Silver":
        Console.WriteLine("10% off");
        break;
}`,
      points: [
        'String cases are case-sensitive: normalise first with .ToLower() or .ToUpper()',
        'A case with a when guard: case int n when n > 100: ... (pattern-based switch statement)',
        'Visual Studio tip: type switch, press Tab twice; for an enum variable it generates all cases automatically',
      ],
    },
    {
      heading: 'switch expressions (C# 8+)',
      content: `A switch expression is a compact form that RETURNS a value. You write the variable, the switch keyword, and a list of pattern => result arms separated by commas. The discard _ matches anything and acts like default. Because it is an expression, you can assign it, return it or print it directly.`,
      syntax: `string dayType = dayNumber switch
{
    1 or 2 or 3 or 4 or 5 => "Working day",
    6 or 7 => "Weekend",
    _ => "Invalid"
};`,
      points: [
        'No case, no break, no colons: just pattern => value,',
        'Arms are tested from top to bottom; the first match wins',
        'If no arm matches at run time, SwitchExpressionException is thrown - so always add _ (the compiler warns CS8509 when values are not covered)',
        'The statement ends with a semicolon after the closing brace',
      ],
    },
    {
      heading: 'Patterns in switch: relational, logical and tuple',
      content: `Since C# 9 you can match ranges with relational patterns (<, <=, >, >=) and combine patterns with and, or, not. Tuple patterns let you decide on two or more values at once - perfect for rules like "ticket price depends on age AND weekend".`,
      syntax: `string grade = marks switch
{
    < 0 or > 100 => "Invalid",
    >= 90 => "A+",
    >= 75 and < 90 => "A",
    >= 35 => "Pass",
    _ => "Fail"
};

int price = (age, isWeekend) switch
{
    (< 12, _) => 100,      // child, any day
    (_, true) => 250,      // weekend
    _ => 200
};`,
      points: [
        'not null, not 0, is >= 18 and the like also work with the is operator: if (age is >= 18 and <= 60)',
        'The compiler reports error CS8510 when an arm can never be reached because an earlier arm already covers it',
        'Patterns can also match types (Day 28 / Extra: Pattern Matching)',
      ],
    },
    {
      heading: 'The conditional (ternary) operator ?:',
      content: `condition ? valueIfTrue : valueIfFalse is the only operator with three operands. It chooses one of two VALUES, so it is ideal for short assignments that would otherwise need a 4-line if-else. Both result values must be of compatible types.`,
      syntax: `string result = marks >= 35 ? "Pass" : "Fail";
int max = a > b ? a : b;
string sign = n > 0 ? "Positive" : n < 0 ? "Negative" : "Zero";
Console.WriteLine($"{count} item{(count == 1 ? "" : "s")}");`,
      points: [
        'Inside an interpolated string wrap ?: in brackets, because : starts a format specifier',
        'Nested ternaries quickly become unreadable - use a switch expression or if-else instead',
        'It returns a value; it cannot run statements like Console.WriteLine in each branch on its own line',
      ],
    },
    {
      heading: 'Choosing between if, switch and ?:',
      content: `All three make decisions; pick the one that makes the code easiest to read.`,
      points: [
        'if / else-if: different variables or complex conditions (age >= 18 && hasId), or when you need to run several statements',
        'switch statement: one variable compared against many fixed values, each running some statements (menus)',
        'switch expression: one or more values mapped to a RESULT (grade from marks, price from category)',
        '?: : a single two-way choice of a value',
      ],
      tip: 'Visual Studio can convert for you: put the cursor on a switch statement, press Ctrl+. (Quick Actions) and choose "Convert switch statement to expression".',
    },
  ],
  examples: [
    {
      title: 'Menu-driven calculator with switch',
      scenario: 'Read two numbers, show a menu of five operations and perform the one the user selects.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MenuCalculator > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and enter 15, 4 and choice 3',
        'Run again with choice 9 to see the default branch, and with 15, 0, 4 to see the divide-by-zero check',
      ],
      code: menuCode,
      csharp: { files: { 'Program.cs': menuCode }, stdin: '15\n4\n3\n' },
      result: `===== MENU-DRIVEN CALCULATOR =====
Enter first number: Enter second number: 1. Add  2. Subtract  3. Multiply  4. Divide  5. Remainder
Enter your choice: 15 * 4 = 60`,
      explanation: `choice is 3, so switch jumps straight to case 3, prints 15 * 4 = 60 and break leaves the switch. No other case is checked or executed. Cases 4 and 5 guard against division by zero with an if inside the case. Any number other than 1-5 goes to default. On Day 9 you will wrap this switch in a do-while loop so the menu repeats until the user chooses Exit.`,
    },
    {
      title: 'Day of the week: grouped cases and string switch',
      scenario: 'Convert a day number to its name, decide working day or weekend with grouped case labels, and handle a text command case-insensitively.',
      steps: [
        'File > New > Project > Console App, name it SwitchDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Delete one break; and read error CS0163 in the Error List, then undo with Ctrl+Z',
      ],
      code: dayCode,
      csharp: { files: { 'Program.cs': dayCode }, stdin: '' },
      result: `Day 6 is Saturday
Weekend - holiday!
Engine started`,
      explanation: `dayNumber 6 matches case 6, so dayName becomes "Saturday" (every path assigns dayName, so it can be printed). In the second switch, case 6 and case 7 share one block, printing the weekend message. "START".ToLower() is "start", which matches the first string case and prints "Engine started" - without ToLower() it would hit default.`,
    },
    {
      title: 'switch expressions with relational and tuple patterns',
      scenario: 'Turn marks into grades, a traffic light colour into an action, and age + weekend into a cinema ticket price.',
      steps: [
        'File > New > Project > Console App, name it SwitchExpressionDemo',
        'Replace Program.cs with the code (the GetGrade local function sits at the end of the file)',
        'Press Ctrl+F5',
        'Change age to 8 and to 65 and isWeekend to false, and predict each price before running',
      ],
      code: switchExprCode,
      csharp: { files: { 'Program.cs': switchExprCode }, stdin: '' },
      result: `95 -> A+
78 -> A
35 -> C
20 -> F
120 -> Invalid
Yellow light: Get ready
Ticket price (age 15, weekend True): 250`,
      explanation: `Arms are checked top to bottom: 95 is >= 90 (A+); 78 fails >= 90 but passes >= 75 (A); 35 reaches >= 35 (C); 20 matches nothing until the discard _ (F); 120 matches the first arm > 100 (Invalid). "Yellow" matches its constant arm. For the tuple (15, true): 15 is not < 12 and not >= 60, so the first two arms fail; (_, true) matches, giving 250. A bool prints as True.`,
    },
    {
      title: 'Conditional operator ?: in everyday code',
      scenario: 'Pass/fail result, maximum of two numbers, sign of a number, plural words and a discount rule - each in one line.',
      steps: [
        'File > New > Project > Console App, name it TernaryDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Put the cursor on one ?: line, press Ctrl+. and see the Quick Action to convert it to if-else',
      ],
      code: ternaryCode,
      csharp: { files: { 'Program.cs': ternaryCode }, stdin: '' },
      result: `Result: Pass
Max: 40
0 is Zero
You have 1 item in your cart
You have 3 items in your cart
Bill: 6200, Discount: 620.00, Pay: 5580.00`,
      explanation: `48 >= 35 is true, so "Pass". 25 > 40 is false, so max = b = 40. For n = 0 both n > 0 and n < 0 are false, so the nested ternary returns "Zero". The plural trick adds "s" only when items is not 1. 6200 > 5000, so discount = 6200 x 0.10 = 620.00 (decimal multiplication keeps two decimal places from 0.10) and the amount to pay is 5580.00.`,
    },
  ],
  interview: [
    { q: 'What is the difference between a switch statement and a switch expression?', a: 'A switch statement executes statements in case blocks and needs break; it does not produce a value. A switch expression (C# 8) evaluates to a value using pattern => result arms, uses _ instead of default and is more concise.', level: 'Easy' },
    { q: 'Does C# allow fall-through between cases?', a: 'Not implicitly. A non-empty case section must end with break, return, throw, continue or goto (error CS0163). Empty case labels can be stacked, and goto case X jumps explicitly.', level: 'Medium' },
    { q: 'Which types can be used in a switch statement?', a: 'Traditionally integral types, char, string, bool and enums. Since C# 7 pattern matching allows any type, with type patterns and when guards.', level: 'Medium' },
    { q: 'What happens if no arm of a switch expression matches?', a: 'A System.Runtime.CompilerServices.SwitchExpressionException is thrown at run time. The compiler warns (CS8509) when the arms are not exhaustive; add a discard _ arm.', level: 'Hard' },
    { q: 'What is the output? int x = 2; switch (x) { case 1: Console.Write("One"); break; case 2: case 3: Console.Write("Two or Three"); break; default: Console.Write("Other"); break; }', a: '"Two or Three" - case 2 has no statements and shares the block with case 3.', level: 'Easy' },
    { q: 'What is the output? int marks = 75; string g = marks switch { >= 90 => "A", >= 70 => "B", >= 50 => "C", _ => "F" }; Console.WriteLine(g);', a: '"B". 75 fails >= 90, then matches >= 70, which is the first match.', level: 'Medium' },
    { q: 'What is the conditional operator and its syntax?', a: 'The ternary operator condition ? a : b returns a when the condition is true, otherwise b. Example: string r = marks >= 35 ? "Pass" : "Fail";', level: 'Easy' },
    { q: 'What is the output? int a = 5, b = 10; Console.WriteLine(a > b ? "A" : b > 8 ? "B" : "C");', a: '"B". a > b is false, so the second ternary runs; b > 8 is true.', level: 'Medium' },
    { q: 'Can the default label appear in the middle of a switch?', a: 'Yes. Its position does not change behaviour; it runs only when no case matches. Convention is to put it last.', level: 'Medium' },
    { q: 'Why must ?: be wrapped in brackets inside an interpolated string?', a: 'Inside {} a colon starts the format specifier ({value:0.00}), so {x ? "a" : "b"} would be parsed wrongly; {(x ? "a" : "b")} works.', level: 'Hard' },
    { q: 'When would you prefer if-else over switch?', a: 'When conditions involve different variables or complex boolean logic, or ranges in older C# versions. switch is best for comparing one value against many constants or patterns.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Vowel or consonant using switch: read a letter and print Vowel for a, e, i, o, u (any case) and Consonant otherwise.',
      hint: 'switch (char.ToLower(ch)) with stacked case labels.',
      solution: `char ch = Console.ReadLine()![0];
switch (char.ToLower(ch))
{
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
        Console.WriteLine("Vowel");
        break;
    default:
        Console.WriteLine("Consonant");
        break;
}
// U -> Vowel, m -> Consonant`,
    },
    {
      task: 'Month number to number of days (ignore leap years) using a switch expression with or patterns.',
      hint: '2 => 28, 4 or 6 or 9 or 11 => 30, >= 1 and <= 12 => 31.',
      solution: `int month = 9;
int days = month switch
{
    2 => 28,
    4 or 6 or 9 or 11 => 30,
    >= 1 and <= 12 => 31,
    _ => 0
};
Console.WriteLine($"Month {month} has {days} days");   // Month 9 has 30 days`,
    },
    {
      task: 'Even/odd and largest of two with the conditional operator in a single line each.',
      hint: 'n % 2 == 0 ? "Even" : "Odd"',
      solution: `int n = 17, a = 8, b = 3;
Console.WriteLine(n % 2 == 0 ? "Even" : "Odd");    // Odd
Console.WriteLine(a > b ? a : b);                  // 8`,
    },
    {
      task: 'Shop menu: 1 = Tea (15), 2 = Coffee (25), 3 = Juice (40). Read the item number and quantity and print the bill, or "Invalid item".',
      hint: 'Use a switch expression to get the price, with _ => 0, then check price == 0.',
      solution: `int item = int.Parse(Console.ReadLine()!);
int qty = int.Parse(Console.ReadLine()!);
int price = item switch
{
    1 => 15,
    2 => 25,
    3 => 40,
    _ => 0
};
Console.WriteLine(price == 0 ? "Invalid item" : $"Bill = {price * qty}");
// item 2, qty 3 -> Bill = 75`,
    },
    {
      task: 'Menu-driven calculator with operator symbols: read two numbers and an operator (+, -, *, /) as a string and use a switch statement on the string.',
      hint: 'switch (op) { case "+": ... }',
      solution: `double x = double.Parse(Console.ReadLine()!);
double y = double.Parse(Console.ReadLine()!);
string op = Console.ReadLine()!;
switch (op)
{
    case "+": Console.WriteLine(x + y); break;
    case "-": Console.WriteLine(x - y); break;
    case "*": Console.WriteLine(x * y); break;
    case "/":
        Console.WriteLine(y == 0 ? "Cannot divide by zero" : (x / y).ToString());
        break;
    default: Console.WriteLine("Unknown operator"); break;
}
// 9, 3, * -> 27`,
    },
  ],
  quiz: [
    { question: 'Which keyword ends a case section in a switch statement?', options: ['continue', 'exit', 'stop', 'break'], answer: 3, explanation: 'break leaves the switch; without it (or return/throw/goto) you get CS0163.' },
    { question: 'In a switch expression, what does _ mean?', options: ['A syntax error', 'Matches any value (like default)', 'Matches only null', 'Matches only zero'], answer: 1, explanation: 'The discard pattern _ matches everything and is used as the final catch-all arm.' },
    { question: 'What is printed? int n = 7; Console.WriteLine(n % 2 == 0 ? "Even" : "Odd");', options: ['Odd', 'Even', 'True', '1'], answer: 0, explanation: '7 % 2 is 1, so the condition is false and "Odd" is returned.' },
    { question: 'What is printed? string s = "B"; switch (s) { case "A": Console.Write(1); break; case "B": Console.Write(2); break; default: Console.Write(0); break; }', options: ['1', '0', '2', '20'], answer: 2, explanation: 'Only the matching case "B" runs and break exits the switch.' },
    { question: 'Which is a valid switch expression arm for marks from 60 to 74?', options: ['case 60..74:', '>= 60 and < 75 => "B",', '60 - 74 => "B";', 'when 60 to 74 => "B"'], answer: 1, explanation: 'Relational patterns combined with and, followed by => and a comma.' },
  ],
};
