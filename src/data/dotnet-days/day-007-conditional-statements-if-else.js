const passFailCode = `const int PassMarks = 35;

Console.Write("Enter student name: ");
string name = Console.ReadLine() ?? "";
Console.Write("Enter marks (0-100): ");
int marks = int.Parse(Console.ReadLine()!);

if (marks >= PassMarks)
{
    Console.WriteLine($"{name} has PASSED with {marks} marks.");
}
else
{
    Console.WriteLine($"{name} has FAILED with {marks} marks.");
    Console.WriteLine($"Needs {PassMarks - marks} more marks to pass.");
}

Console.WriteLine("Result processed.");`;

const gradeCode = `Console.Write("Enter marks (0-100): ");
int marks = int.Parse(Console.ReadLine()!);

string grade;
string remark;

if (marks < 0 || marks > 100)
{
    grade = "Invalid";
    remark = "Marks must be between 0 and 100";
}
else if (marks >= 90)
{
    grade = "A+";
    remark = "Outstanding";
}
else if (marks >= 80)
{
    grade = "A";
    remark = "Excellent";
}
else if (marks >= 70)
{
    grade = "B";
    remark = "Very good";
}
else if (marks >= 60)
{
    grade = "C";
    remark = "Good";
}
else if (marks >= 35)
{
    grade = "D";
    remark = "Pass";
}
else
{
    grade = "F";
    remark = "Fail";
}

Console.WriteLine("Grade : " + grade);
Console.WriteLine("Remark: " + remark);`;

const nestedCode = `int attendance = 82;   // percent
bool feesPaid = true;
int marks = 64;

if (attendance >= 75)
{
    Console.WriteLine("Attendance OK");

    if (feesPaid)
    {
        Console.WriteLine("Fees paid - hall ticket issued");

        if (marks >= 60)
        {
            Console.WriteLine("Eligible for first class certificate");
        }
        else
        {
            Console.WriteLine("Eligible for pass certificate");
        }
    }
    else
    {
        Console.WriteLine("Please pay the fees first");
    }
}
else
{
    Console.WriteLine("Not eligible: attendance below 75%");
}`;

const practicalCode = `// 1. Largest of three numbers
int a = 45, b = 78, c = 62;
int largest;
if (a >= b && a >= c)
    largest = a;
else if (b >= c)
    largest = b;
else
    largest = c;
Console.WriteLine($"Largest of {a}, {b}, {c} is {largest}");

// 2. Positive, negative or zero
int n = -7;
if (n > 0)
    Console.WriteLine($"{n} is positive");
else if (n < 0)
    Console.WriteLine($"{n} is negative");
else
    Console.WriteLine($"{n} is zero");

// 3. Even or odd
if (n % 2 == 0)
    Console.WriteLine($"{n} is even");
else
    Console.WriteLine($"{n} is odd (n % 2 = {n % 2})");

// 4. Leap year
int year = 1900;
if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)
    Console.WriteLine($"{year} is a leap year");
else
    Console.WriteLine($"{year} is not a leap year");`;

const loginCode = `const string CorrectUser = "admin";
const string CorrectPassword = "Pass@123";

Console.Write("Username: ");
string? user = Console.ReadLine();
Console.Write("Password: ");
string? password = Console.ReadLine();

if (user == CorrectUser)
{
    if (password == CorrectPassword)
    {
        Console.WriteLine("Login successful. Welcome, admin!");
    }
    else
    {
        Console.WriteLine("Wrong password. Please try again.");
    }
}
else
{
    Console.WriteLine("Unknown user.");
}`;

export default {
  id: 'day-007-conditional-statements-if-else',
  title: 'Conditional Statements: if, else, else-if, nested if',
  module: 'Module 1: C# Programming Fundamentals',
  day: 7,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Make programs take decisions. Learn the if statement, if-else, the else-if ladder and nested if, how to write conditions with comparison and logical operators, why braces matter, and the common mistakes beginners make. Practical: student pass/fail and grade programs, largest of three, positive/negative/zero, even/odd and a login check.`,
  objectives: [
    'Write if, if-else and else-if ladder statements with correct conditions',
    'Use nested if statements for decisions that depend on earlier decisions',
    'Combine conditions with &&, || and ! inside if',
    'Order else-if conditions correctly and avoid common mistakes (stray semicolon, missing braces, = vs ==)',
    'Build practical decision programs: pass/fail, grade, largest of three, even/odd, leap year',
  ],
  theory: [
    {
      heading: 'Why do we need conditional statements?',
      content: `So far every program ran each line from top to bottom. Real programs must choose: show "Pass" or "Fail", allow or deny a login, apply a discount or not. A conditional statement checks a condition - an expression that gives a bool - and runs a block of code only when it is true. Real-world analogy: "IF it is raining, take an umbrella, ELSE wear sunglasses."`,
      points: [
        'The condition must be a bool expression: if (marks >= 35), if (isActive), if (name == "Ravi")',
        'C# does not treat numbers as true/false: if (count) is an error (CS0029); write if (count != 0)',
        'Decision statements in C#: if, if-else, else-if ladder, nested if, switch (Day 8) and the conditional operator ?: (Day 8)',
      ],
    },
    {
      heading: 'The if and if-else statements',
      content: `if runs its block only when the condition is true; otherwise the block is skipped and execution continues after it. if-else gives two paths: exactly ONE of the two blocks always runs.`,
      syntax: `if (condition)
{
    // runs when condition is true
}

if (condition)
{
    // true path
}
else
{
    // false path
}`,
      points: [
        'Braces are optional for a single statement, but ALWAYS using them avoids bugs when you add a second line later',
        'else has no condition and must follow an if',
        'Format the code with Ctrl+K, Ctrl+D so indentation shows the structure',
      ],
      tip: 'A semicolon right after the condition - if (marks >= 35); - ends the if with an empty statement, so the block below ALWAYS runs. Visual Studio shows warning CS0642: Possible mistaken empty statement.',
    },
    {
      heading: 'The else-if ladder',
      content: `When there are more than two possibilities (grades A, B, C, D, F), chain conditions with else if. C# checks them from top to bottom and runs the FIRST block whose condition is true; the rest are skipped. The final else (optional) catches everything that matched nothing.`,
      syntax: `if (marks >= 90)       grade = "A+";
else if (marks >= 80)  grade = "A";
else if (marks >= 70)  grade = "B";
else if (marks >= 35)  grade = "Pass";
else                   grade = "F";`,
      points: [
        'ORDER MATTERS: check the most restrictive condition first. If marks >= 35 were first, 95 marks would get "Pass"',
        'Because earlier conditions already failed, else if (marks >= 80) does not need && marks < 90',
        'Validate input first (marks < 0 || marks > 100) at the top of the ladder',
        'If every branch assigns a variable, the compiler knows it is definitely assigned after the ladder',
      ],
    },
    {
      heading: 'Nested if',
      content: `An if inside another if is a nested if. Use it when a second decision only makes sense after the first one is true. Example: check the username first; only if it is correct, check the password. Analogy: at an airport you show your ticket at the entrance; only after that are you allowed to the security check.`,
      syntax: `if (attendance >= 75)
{
    if (feesPaid)
        Console.WriteLine("Hall ticket issued");
    else
        Console.WriteLine("Pay fees first");
}
else
{
    Console.WriteLine("Not eligible");
}`,
      points: [
        'An else always belongs to the NEAREST unmatched if ("dangling else") - use braces to make the pairing obvious',
        'Deep nesting (more than 3 levels) is hard to read; combine conditions with && or use early checks instead',
        'Nested if vs &&: if (a) { if (b) {...} } is the same as if (a && b) {...} when there is no else for the outer if',
      ],
    },
    {
      heading: 'Writing good conditions',
      content: `Conditions are built with comparison operators (== != > < >= <=) and logical operators (&& || !). Store complex conditions in well-named bool variables to make the if read like English.`,
      syntax: `bool isAdult = age >= 18;
bool hasValidId = idType == "Aadhaar" || idType == "Passport";
if (isAdult && hasValidId)
{
    Console.WriteLine("Account can be opened");
}`,
      points: [
        'Range check: if (marks >= 0 && marks <= 100)',
        'Outside range: if (marks < 0 || marks > 100)',
        'Even/odd: if (n % 2 == 0) - do not use n % 2 == 1, because -7 % 2 is -1',
        'Strings: == compares content case-sensitively; use string.Equals(a, b, StringComparison.OrdinalIgnoreCase) to ignore case',
        'Use if (flag) instead of if (flag == true), and if (!flag) instead of if (flag == false)',
      ],
    },
    {
      heading: 'Debugging decisions in Visual Studio',
      content: `When a program takes the wrong branch, put a breakpoint (F9) on the if line, press F5, then hover over each variable or select the whole condition and hover - Visual Studio shows whether it is true or false. Press F10 to see which block runs next.`,
      points: [
        'F9 toggles a breakpoint, F5 starts debugging, F10 steps over, F11 steps into a method, Shift+F5 stops',
        'Right-click a breakpoint > Conditions to stop only when, for example, marks < 35',
        'The Watch window (Debug > Windows > Watch) can evaluate any condition, e.g. marks >= 35 && feesPaid',
      ],
    },
  ],
  examples: [
    {
      title: 'Student pass/fail program',
      scenario: 'Read a student name and marks. Print PASSED when marks are at least 35, otherwise print FAILED and how many more marks were needed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PassFail > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5, type Kavya (Enter) and 28 (Enter)',
        'Run again with 72: the if block runs instead of the else block',
      ],
      code: passFailCode,
      csharp: { files: { 'Program.cs': passFailCode }, stdin: 'Kavya\n28\n' },
      result: `Enter student name: Enter marks (0-100): Kavya has FAILED with 28 marks.
Needs 7 more marks to pass.
Result processed.`,
      explanation: `28 >= 35 is false, so the if block is skipped and the else block runs: it prints the FAILED line and 35 - 28 = 7. "Result processed." is outside both blocks, so it always runs. With 72 the output would be "Kavya has PASSED with 72 marks." followed by "Result processed.". Using a constant PassMarks avoids repeating the magic number 35.`,
    },
    {
      title: 'Grade calculation with an else-if ladder',
      scenario: 'Convert marks into a grade and remark, rejecting values outside 0-100.',
      steps: [
        'File > New > Project > Console App, name it GradeCalculator',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and enter 82',
        'Try 95, 35, 10 and 150 to test every branch',
      ],
      code: gradeCode,
      csharp: { files: { 'Program.cs': gradeCode }, stdin: '82\n' },
      result: `Enter marks (0-100): Grade : A
Remark: Excellent`,
      explanation: `82 is inside 0-100, so the first condition is false. 82 >= 90 is false, 82 >= 80 is true: grade A is chosen and all the remaining else-if blocks are skipped. Because every branch assigns both grade and remark, the compiler allows them to be printed after the ladder. 150 would give "Invalid".`,
    },
    {
      title: 'Nested if: exam eligibility',
      scenario: 'A student may write the exam only with at least 75% attendance AND paid fees; the certificate type then depends on the marks.',
      steps: [
        'File > New > Project > Console App, name it ExamEligibility',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change feesPaid to false, then attendance to 60, and run each time to follow different paths',
        'Set a breakpoint on if (attendance >= 75) and step with F10 to watch the path',
      ],
      code: nestedCode,
      csharp: { files: { 'Program.cs': nestedCode }, stdin: '' },
      result: `Attendance OK
Fees paid - hall ticket issued
Eligible for first class certificate`,
      explanation: `82 >= 75 is true, so the outer block runs and prints "Attendance OK". Inside, feesPaid is true, so the second if runs. Inside that, 64 >= 60 is true, giving the first class message. If attendance were 60, only "Not eligible: attendance below 75%" would print - the inner checks would never be evaluated.`,
    },
    {
      title: 'Practical programs: largest of three, positive/negative/zero, even/odd, leap year',
      scenario: 'Four classic decision programs that appear in every C# lab exam.',
      steps: [
        'File > New > Project > Console App, name it DecisionPrograms',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change the values (for example a = 90, n = 0, year = 2024) and run again',
      ],
      code: practicalCode,
      csharp: { files: { 'Program.cs': practicalCode }, stdin: '' },
      result: `Largest of 45, 78, 62 is 78
-7 is negative
-7 is odd (n % 2 = -1)
1900 is not a leap year`,
      explanation: `45 is not >= 78, so the first condition fails; 78 >= 62 is true, so largest = 78. -7 is not > 0 but is < 0, so it is negative. -7 % 2 is -1 (the sign follows the left operand), which is why the even test n % 2 == 0 is the safe one. 1900 is divisible by 4 but also by 100 and not by 400, so it is not a leap year.`,
    },
    {
      title: 'Login check with nested if and string comparison',
      scenario: 'Check the username first and, only when it is correct, check the password.',
      steps: [
        'File > New > Project > Console App, name it LoginCheck',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and type admin (Enter) and Pass@124 (Enter)',
        'Run again with the correct password Pass@123, and once with the username Admin (capital A) to see that == is case-sensitive',
      ],
      code: loginCode,
      csharp: { files: { 'Program.cs': loginCode }, stdin: 'admin\nPass@124\n' },
      result: `Username: Password: Wrong password. Please try again.`,
      explanation: `The username "admin" matches, so the inner if runs. "Pass@124" is not equal to "Pass@123", so the inner else prints the wrong-password message. Typing "Admin" would print "Unknown user." because string == is case-sensitive. (Real applications never store plain-text passwords - you will hash them in Module 10.)`,
    },
  ],
  interview: [
    { q: 'What types of conditional statements are available in C#?', a: 'if, if-else, else-if ladder, nested if, switch statement, switch expression and the conditional (ternary) operator ?:.', level: 'Easy' },
    { q: 'Can you write if (1) { } in C# like in C?', a: 'No. The condition must be bool; int is not implicitly converted to bool, so you get error CS0029. Write if (x != 0).', level: 'Easy' },
    { q: 'What is the output? int x = 5; if (x > 10); Console.WriteLine("Big");', a: '"Big" is printed. The semicolon after the condition is an empty statement that forms the if body, so the WriteLine always runs (warning CS0642).', level: 'Medium' },
    { q: 'What is the output? int m = 95; if (m >= 35) Console.WriteLine("Pass"); else if (m >= 90) Console.WriteLine("Distinction");', a: '"Pass" only. The first true condition wins and the rest of the ladder is skipped - the conditions are in the wrong order.', level: 'Medium' },
    { q: 'What is a dangling else and how does C# resolve it?', a: 'In if (a) if (b) X(); else Y(); it is unclear which if the else belongs to. C# attaches else to the nearest unmatched if (the inner one). Braces remove the ambiguity.', level: 'Medium' },
    { q: 'When would you use nested if instead of &&?', a: 'When the outer and inner conditions need different else messages/actions (e.g. "Unknown user" vs "Wrong password"), or when the inner condition is only valid after the outer one is true.', level: 'Medium' },
    { q: 'Why is if (n % 2 == 1) a bad odd-number check?', a: 'For negative odd numbers n % 2 is -1, so the check fails. Use n % 2 != 0.', level: 'Hard' },
    { q: 'What is the output? bool flag = false; if (flag = true) Console.WriteLine("Yes"); else Console.WriteLine("No");', a: '"Yes". flag = true is an assignment whose value is true, and because it is a bool it compiles (with warning CS0665). This is why comparing bools with == true is discouraged.', level: 'Hard' },
    { q: 'Is the else block mandatory?', a: 'No. if can stand alone. else and else-if are optional.', level: 'Easy' },
    { q: 'What is the output? int a = 10, b = 20; if (a > 5 && b < 15) Console.WriteLine("A"); else if (a > 5 || b < 15) Console.WriteLine("B"); else Console.WriteLine("C");', a: '"B". a > 5 is true but b < 15 is false, so && fails; || needs just one true side, so the second branch runs.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Even or odd: read a number and print whether it is even or odd.',
      hint: 'if (n % 2 == 0)',
      solution: `Console.Write("Enter a number: ");
int n = int.Parse(Console.ReadLine()!);
if (n % 2 == 0)
    Console.WriteLine($"{n} is even");
else
    Console.WriteLine($"{n} is odd");
// 14 -> 14 is even, -3 -> -3 is odd`,
    },
    {
      task: 'Largest of three numbers read from the keyboard.',
      hint: 'Assume the first is the largest, then compare with the second and third.',
      solution: `int a = int.Parse(Console.ReadLine()!);
int b = int.Parse(Console.ReadLine()!);
int c = int.Parse(Console.ReadLine()!);
int max = a;
if (b > max) max = b;
if (c > max) max = c;
Console.WriteLine("Largest = " + max);   // 12, 40, 33 -> Largest = 40`,
    },
    {
      task: 'Positive, negative or zero: read a number and print which one it is.',
      hint: 'else-if ladder with > 0, < 0 and a final else.',
      solution: `int n = int.Parse(Console.ReadLine()!);
if (n > 0) Console.WriteLine("Positive");
else if (n < 0) Console.WriteLine("Negative");
else Console.WriteLine("Zero");
// 0 -> Zero`,
    },
    {
      task: 'Electricity bill: first 100 units at 5 per unit, next 100 units at 7, above 200 units at 10. Calculate the bill for 250 units.',
      hint: 'else-if on units; for 250: 100*5 + 100*7 + 50*10.',
      solution: `int units = 250;
int bill;
if (units <= 100)
    bill = units * 5;
else if (units <= 200)
    bill = 100 * 5 + (units - 100) * 7;
else
    bill = 100 * 5 + 100 * 7 + (units - 200) * 10;
Console.WriteLine("Bill = " + bill);   // Bill = 1700`,
    },
    {
      task: 'Vowel or consonant: read one character and print whether it is a vowel, a consonant or not a letter.',
      hint: 'char.ToLower(ch) then compare with a, e, i, o, u; use char.IsLetter for the check.',
      solution: `char ch = Console.ReadLine()![0];
char lower = char.ToLower(ch);
if (!char.IsLetter(ch))
    Console.WriteLine("Not a letter");
else if (lower == 'a' || lower == 'e' || lower == 'i' || lower == 'o' || lower == 'u')
    Console.WriteLine("Vowel");
else
    Console.WriteLine("Consonant");
// E -> Vowel, k -> Consonant, 7 -> Not a letter`,
    },
    {
      task: 'Nested if: a bank gives a loan if age is 21-60; then, if salary >= 25000 the loan is approved, otherwise "Salary too low". Test with age 30 and salary 18000.',
      hint: 'Outer if checks age range, inner if checks salary.',
      solution: `int age = 30;
int salary = 18000;
if (age >= 21 && age <= 60)
{
    if (salary >= 25000)
        Console.WriteLine("Loan approved");
    else
        Console.WriteLine("Salary too low");
}
else
{
    Console.WriteLine("Age not eligible");
}
// Salary too low`,
    },
  ],
  quiz: [
    { question: 'What is printed? int marks = 40; if (marks >= 35) Console.WriteLine("Pass"); else Console.WriteLine("Fail");', options: ['Fail', 'Pass', 'Pass and Fail', 'Nothing'], answer: 1, explanation: '40 >= 35 is true, so only the if block runs.' },
    { question: 'In an else-if ladder, how many blocks run at most?', options: ['All true ones', 'Two', 'Exactly one, always', 'At most one'], answer: 3, explanation: 'Only the first true branch runs; if nothing is true and there is no else, none runs.' },
    { question: 'Which condition correctly checks that marks are between 0 and 100 inclusive?', options: ['marks >= 0 && marks <= 100', 'marks >= 0 || marks <= 100', '0 <= marks <= 100', 'marks > 0 && marks < 100'], answer: 0, explanation: 'Both limits must hold, so use && with >= and <=. 0 <= marks <= 100 does not compile in C#.' },
    { question: 'What is printed? int x = 3; if (x > 5); { Console.WriteLine("Hi"); }', options: ['Nothing', 'Compile error', 'Hi', 'Hi twice'], answer: 2, explanation: 'The ; ends the if; the block after it is a normal block that always runs.' },
    { question: 'An else belongs to which if?', options: ['The nearest unmatched if before it', 'The first if in the method', 'The outermost if', 'Any if - the compiler chooses randomly'], answer: 0, explanation: 'C# pairs else with the closest preceding if that has no else.' },
  ],
};
