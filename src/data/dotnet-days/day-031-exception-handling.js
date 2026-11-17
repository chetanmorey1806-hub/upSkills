const ex1 = `using System;

int[] divisors = { 5, 0, 2 };
int total = 100;

foreach (int d in divisors)
{
    try
    {
        Console.WriteLine($"Trying {total} / {d}");
        int result = total / d;            // throws when d is 0
        Console.WriteLine("Result: " + result);
    }
    catch (DivideByZeroException ex)
    {
        Console.WriteLine("Error: " + ex.Message);
    }
    finally
    {
        Console.WriteLine("Finally block runs");
    }
}
Console.WriteLine("Program continues normally");`;

const ex2 = `using System;

string?[] inputs = { "20", "abc", "0", "99999999999", null };

foreach (string? input in inputs)
{
    try
    {
        int number = int.Parse(input!);
        int answer = 100 / number;
        Console.WriteLine($"{input} -> 100 / {number} = {answer}");
    }
    catch (FormatException)
    {
        Console.WriteLine($"{input} -> not a valid number");
    }
    catch (OverflowException)
    {
        Console.WriteLine($"{input} -> too large for int");
    }
    catch (DivideByZeroException)
    {
        Console.WriteLine($"{input} -> cannot divide by zero");
    }
    catch (Exception ex)   // general catch must be LAST
    {
        Console.WriteLine("Unexpected: " + ex.GetType().Name);
    }
}`;

const ex3 = `using System;

try
{
    Console.WriteLine(Withdraw(5000, 1500));
    Console.WriteLine(Withdraw(5000, -10));      // throws, next line is skipped
    Console.WriteLine("This line never runs");
}
catch (ArgumentException ex)   // also catches ArgumentOutOfRangeException (child class)
{
    Console.WriteLine($"{ex.GetType().Name}: {ex.Message}");
}

try
{
    Console.WriteLine(Withdraw(1000, 2500));
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Caught: " + ex.Message);
}

static int Withdraw(int balance, int amount)
{
    if (amount <= 0)
        throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be positive");
    if (amount > balance)
        throw new InvalidOperationException("Insufficient balance");
    return balance - amount;
}`;

const ex4 = `using System;

try
{
    ProcessOrder();
}
catch (Exception ex)
{
    Console.WriteLine("4. Main caught: " + ex.GetType().Name);
    Console.WriteLine("   Message: " + ex.Message);
    Console.WriteLine("   Inner: " + ex.InnerException?.Message);
}
finally
{
    Console.WriteLine("5. Main finally");
}

static void ProcessOrder()
{
    try
    {
        Console.WriteLine("1. Reading stock");
        int[] stock = { 10, 20 };
        Console.WriteLine(stock[5]);           // IndexOutOfRangeException
    }
    catch (IndexOutOfRangeException ex)
    {
        Console.WriteLine("2. Logged: " + ex.Message);
        // wrap the low-level error in a meaningful one, keep the original as InnerException
        throw new ApplicationException("Order processing failed", ex);
    }
    finally
    {
        Console.WriteLine("3. Cleanup in ProcessOrder");
    }
}`;

const ex5 = `using System;

string[] inputs = { "50", "x", "0" };

foreach (string s in inputs)
{
    // Expected problems (bad input) are checked with if/TryParse - no exception needed
    if (!int.TryParse(s, out int n))
    {
        Console.WriteLine($"'{s}' is not a number");
        continue;
    }
    if (n == 0)
    {
        Console.WriteLine("Cannot divide by zero");
        continue;
    }
    Console.WriteLine($"1000 / {n} = {1000 / n}");
}

// Floating point division by zero does NOT throw
double d = 10.0 / 0;
Console.WriteLine("Double 10.0 / 0 is infinity? " + double.IsInfinity(d));`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below',
  'Press Ctrl+F5 to run. Then press F5 (debug): Visual Studio breaks on thrown exceptions you did not catch; use Debug > Windows > Exception Settings to break on every thrown exception',
];

export default {
  id: 'day-031-exception-handling',
  title: 'Exception Handling: try, catch, finally, throw',
  module: 'Module 3: Advanced C# Programming',
  day: 31,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Runtime errors (exceptions) crash a program unless they are handled. Learn the exception class hierarchy, try/catch/finally, multiple catch blocks, the throw keyword, rethrowing and wrapping with InnerException, and when to use TryParse instead of exceptions. Practical: division by zero.',
  objectives: [
    'Explain what an exception is and what happens when it is not handled',
    'Use try, catch, finally and multiple catch blocks in the correct order',
    'Raise exceptions with throw and rethrow correctly with throw;',
    'Read Message, StackTrace and InnerException of an exception',
    'Prefer validation/TryParse for expected errors',
  ],
  theory: [
    {
      heading: 'Errors vs exceptions',
      content: 'Compile-time errors (syntax, wrong types) stop the build, so the program never runs. Exceptions are runtime errors: the code compiles but something goes wrong while it runs, such as dividing an int by zero, parsing "abc" as a number, reading a missing file or using a null object. If an exception is not handled, the program terminates and prints "Unhandled exception" with a stack trace.',
      points: [
        'DivideByZeroException - integer / 0',
        'FormatException - int.Parse("abc")',
        'OverflowException - value too big for the type (int.Parse("99999999999"))',
        'NullReferenceException - using a member of a null reference',
        'IndexOutOfRangeException / ArgumentOutOfRangeException - bad index on array / List',
        'InvalidCastException, FileNotFoundException, KeyNotFoundException, InvalidOperationException',
      ],
      tip: 'Analogy: a seat belt (try/catch) does not stop accidents, it stops the accident from killing the program.',
    },
    {
      heading: 'Exception class hierarchy',
      content: 'Every exception is an object that derives from System.Exception. Important properties: Message (description), StackTrace (where it happened), InnerException (the original cause), Source, and GetType().Name. Because of inheritance, catch (ArgumentException) also catches ArgumentNullException and ArgumentOutOfRangeException, and catch (Exception) catches everything.',
      syntax: `System.Exception
 ├─ SystemException
 │   ├─ ArithmeticException ─ DivideByZeroException, OverflowException
 │   ├─ FormatException
 │   ├─ NullReferenceException
 │   ├─ IndexOutOfRangeException
 │   ├─ InvalidCastException
 │   ├─ InvalidOperationException
 │   ├─ ArgumentException ─ ArgumentNullException, ArgumentOutOfRangeException
 │   └─ IOException ─ FileNotFoundException, DirectoryNotFoundException
 └─ ApplicationException (older base for app exceptions)`,
    },
    {
      heading: 'try, catch and finally',
      content: 'Put risky code in try. When an exception occurs, the rest of the try block is skipped and control jumps to the first matching catch. finally always runs: after try completes, after a catch handles the error, and even when a return or an unhandled exception leaves the method. Use finally to release resources (close files, connections). A try must have at least one catch or a finally.',
      syntax: `try
{
    // code that may fail
}
catch (DivideByZeroException ex)   // most specific first
{
    Console.WriteLine(ex.Message);
}
catch (Exception ex)               // most general last
{
    Console.WriteLine("Unexpected: " + ex.Message);
}
finally
{
    // always runs - cleanup
}`,
      points: [
        'Order catch blocks from specific to general; putting catch (Exception) first causes compile error CS0160',
        'catch without a variable: catch (FormatException) { ... }',
        'Integer division by zero throws; double division gives Infinity or NaN',
      ],
    },
    {
      heading: 'The throw keyword',
      content: 'Use throw to raise an exception yourself when a method receives invalid data or cannot complete its job, e.g. throw new ArgumentOutOfRangeException(nameof(amount), "Amount must be positive"). Since C# 7 throw can also be used as an expression: _name = name ?? throw new ArgumentNullException(nameof(name)). .NET 6+ adds helpers like ArgumentNullException.ThrowIfNull(x).',
      syntax: `if (age < 0) throw new ArgumentException("Age cannot be negative", nameof(age));
string city = input ?? throw new ArgumentNullException(nameof(input));
ArgumentNullException.ThrowIfNull(student);`,
    },
    {
      heading: 'Rethrowing: throw; vs throw ex; vs wrapping',
      content: 'Inside a catch you sometimes want to log the error and let it continue up. Use throw; (no variable) which keeps the original stack trace. throw ex; resets the stack trace to the current line, so you lose where the error really happened. To add context, wrap it: throw new ApplicationException("Order failed", ex); the original becomes InnerException.',
      tip: 'Interview favourite: always prefer throw; over throw ex; when rethrowing.',
    },
    {
      heading: 'Best practices',
      content: 'Exceptions are for exceptional situations, not for normal control flow. They are slower than if checks.',
      points: [
        'Validate expected problems with if and TryParse instead of catching exceptions',
        'Catch only exceptions you can handle; do not swallow errors with an empty catch {}',
        'Catch specific types; catch (Exception) only at the top level (Main, global handler) to log',
        'Release resources in finally or with using statements',
        'Never show StackTrace to end users; log it instead',
        'In ASP.NET Core a global exception handler middleware (Day 73, Day 96) does the top-level catching',
      ],
    },
  ],
  examples: [
    {
      title: 'Division by zero with try / catch / finally',
      scenario: 'Divide 100 by several numbers; one of them is 0. The program must not crash and must show that finally always runs.',
      steps: steps('DivisionByZero'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `Trying 100 / 5
Result: 20
Finally block runs
Trying 100 / 0
Error: Attempted to divide by zero.
Finally block runs
Trying 100 / 2
Result: 50
Finally block runs
Program continues normally`,
      explanation: 'For d = 0 the line int result = total / d throws DivideByZeroException, so "Result:" is skipped and the catch prints the message. finally runs in all three iterations. Because the exception was handled, the loop continues and the last line prints. Remove the try/catch and run again: the program stops with "Unhandled exception. System.DivideByZeroException".',
    },
    {
      title: 'Multiple catch blocks for different errors',
      scenario: 'Parse several user inputs and divide 100 by each, giving a clear message for each kind of failure.',
      steps: steps('MultipleCatch'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `20 -> 100 / 20 = 5
abc -> not a valid number
0 -> cannot divide by zero
99999999999 -> too large for int
Unexpected: ArgumentNullException`,
      explanation: 'Each exception type goes to its own catch. int.Parse(null) throws ArgumentNullException, which has no specific catch, so the general catch (Exception) handles it. The general catch must be last, otherwise the specific ones would be unreachable (compile error CS0160).',
    },
    {
      title: 'throw: validating a bank withdrawal',
      scenario: 'A Withdraw method must refuse negative amounts and amounts larger than the balance.',
      steps: steps('ThrowDemo'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `3500
ArgumentOutOfRangeException: Amount must be positive (Parameter 'amount')
Caught: Insufficient balance`,
      explanation: 'The first call succeeds (5000 - 1500 = 3500). The second throws ArgumentOutOfRangeException; .NET appends " (Parameter \'amount\')" to the message because we passed the parameter name. catch (ArgumentException) catches it because ArgumentOutOfRangeException inherits from ArgumentException. "This line never runs" is skipped. The third call throws InvalidOperationException, handled by the second try.',
    },
    {
      title: 'Wrapping, InnerException and the order of finally blocks',
      scenario: 'A low-level IndexOutOfRangeException is logged, wrapped in a business exception and handled in Main. Watch the exact order of execution.',
      steps: steps('RethrowDemo'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `1. Reading stock
2. Logged: Index was outside the bounds of the array.
3. Cleanup in ProcessOrder
4. Main caught: ApplicationException
   Message: Order processing failed
   Inner: Index was outside the bounds of the array.
5. Main finally`,
      explanation: 'The inner catch logs and throws a new ApplicationException. Before control leaves ProcessOrder, its finally runs (step 3). Then Main catches the new exception (step 4), reads the original through InnerException, and finally Main\'s finally runs (step 5). If you only wanted to log and pass the same exception on, you would write throw; to keep the stack trace.',
    },
    {
      title: 'Avoid exceptions for expected input: TryParse',
      scenario: 'A safe calculator that never throws for bad input, plus the surprising behaviour of double division by zero.',
      steps: steps('SafeDivision'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `1000 / 50 = 20
'x' is not a number
Cannot divide by zero
Double 10.0 / 0 is infinity? True`,
      explanation: 'int.TryParse returns false instead of throwing FormatException, and an if check prevents DivideByZeroException. This is faster and cleaner than try/catch for user input. Floating point division by zero follows IEEE rules and returns Infinity, so it does not throw.',
    },
  ],
  interview: [
    { q: 'What is an exception?', a: 'An object representing a runtime error that interrupts normal program flow. All exceptions derive from System.Exception.', level: 'Easy' },
    { q: 'Does finally always execute?', a: 'Yes, whether the try completes, an exception is caught, or control leaves by return/break/continue. Exceptions: the process is killed (Environment.FailFast, power loss) or a StackOverflowException occurs.', level: 'Medium' },
    { q: 'Difference between throw and throw ex?', a: 'throw; rethrows the current exception and preserves the original stack trace. throw ex; resets the stack trace to the current line, hiding where the error originally happened.', level: 'Medium' },
    { q: 'Can we have multiple catch blocks? In what order?', a: 'Yes. Order them from most specific to most general. If a general type (Exception) comes before a derived one, the compiler gives error CS0160 because the later block is unreachable.', level: 'Easy' },
    { q: 'Can a try block exist without catch?', a: 'Yes, try/finally is valid. It ensures cleanup while letting the exception propagate to the caller.', level: 'Easy' },
    { q: 'What is the output? int a = 10, b = 0; try { Console.Write(a / b); } catch { Console.Write("E"); } finally { Console.Write("F"); }', a: 'EF. The division throws, the catch writes E, finally writes F.', level: 'Easy' },
    { q: 'What is the output? double x = 5.0 / 0; Console.WriteLine(double.IsInfinity(x));', a: 'True. Floating point division by zero does not throw; it returns PositiveInfinity.', level: 'Medium' },
    { q: 'What is the output? static int F() { try { return 1; } finally { Console.Write("F"); } } Console.Write(F());', a: 'F1. The return value 1 is stored, finally runs and writes F, then the method returns and 1 is written.', level: 'Hard' },
    { q: 'What is InnerException used for?', a: 'When you catch a low-level exception and throw a higher-level one, you pass the original as InnerException so the root cause is not lost in logs.', level: 'Medium' },
    { q: 'Why should you avoid using exceptions for control flow?', a: 'Throwing is expensive (stack trace capture) and makes code harder to read. Use validation, TryParse, TryGetValue, null checks for expected situations.', level: 'Medium' },
    { q: 'What is wrong with catch (Exception) { }?', a: 'It swallows every error silently, including bugs, so problems are hidden and hard to debug. At minimum log the exception, and catch only what you can handle.', level: 'Medium' },
    { q: 'Difference between ArgumentException, ArgumentNullException and ArgumentOutOfRangeException?', a: 'ArgumentException is the base for invalid arguments. ArgumentNullException is for null arguments, ArgumentOutOfRangeException for values outside the allowed range. Both derive from ArgumentException.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create an array of 3 ints and try to print index 5. Catch IndexOutOfRangeException, print its message and print "Done" in finally.',
      hint: 'Accessing arr[5] on a 3-element array throws.',
      solution: `using System;

int[] arr = { 1, 2, 3 };
try
{
    Console.WriteLine(arr[5]);
}
catch (IndexOutOfRangeException ex)
{
    Console.WriteLine(ex.Message);   // Index was outside the bounds of the array.
}
finally
{
    Console.WriteLine("Done");
}`,
    },
    {
      task: 'Write a method int SafeDivide(int a, int b) that throws ArgumentException("Divisor cannot be zero") when b is 0. Call it with (10, 2) and (10, 0) and handle the error.',
      hint: 'Check b == 0 before dividing and use throw new ArgumentException(...).',
      solution: `using System;

try
{
    Console.WriteLine(SafeDivide(10, 2));   // 5
    Console.WriteLine(SafeDivide(10, 0));
}
catch (ArgumentException ex)
{
    Console.WriteLine("Error: " + ex.Message);   // Error: Divisor cannot be zero
}

static int SafeDivide(int a, int b)
{
    if (b == 0) throw new ArgumentException("Divisor cannot be zero");
    return a / b;
}`,
    },
    {
      task: 'Read two numbers from the user with Console.ReadLine and print the quotient. Handle FormatException, DivideByZeroException and OverflowException with different messages.',
      hint: 'Use int.Parse inside try and three catch blocks.',
      solution: `using System;

try
{
    Console.Write("First number: ");
    int a = int.Parse(Console.ReadLine()!);
    Console.Write("Second number: ");
    int b = int.Parse(Console.ReadLine()!);
    Console.WriteLine($"Result = {a / b}");
}
catch (FormatException) { Console.WriteLine("Please enter whole numbers only."); }
catch (DivideByZeroException) { Console.WriteLine("Second number cannot be zero."); }
catch (OverflowException) { Console.WriteLine("Number is too large."); }`,
    },
    {
      task: 'Show the difference between throw; and throw ex; by printing ex.StackTrace in Main for both versions.',
      hint: 'Create Level1() that calls Level2() which throws. In Level1 catch and rethrow. Compare which method names appear in the StackTrace.',
      solution: `using System;

try { Level1(); }
catch (Exception ex) { Console.WriteLine(ex.StackTrace); }

static void Level1()
{
    try { Level2(); }
    catch (Exception ex)
    {
        throw;        // StackTrace shows Level2 AND Level1
        // throw ex;  // StackTrace would start at Level1 only - Level2 is lost
    }
}

static void Level2() => throw new InvalidOperationException("Failure in Level2");`,
    },
  ],
  quiz: [
    { question: 'Which block always runs whether or not an exception occurs?', options: ['catch', 'finally', 'throw', 'else'], answer: 1, explanation: 'finally runs in every case and is used for cleanup.' },
    { question: 'What does int.Parse("abc") throw?', options: ['FormatException', 'OverflowException', 'InvalidCastException', 'ArgumentNullException'], answer: 0, explanation: '"abc" is not in a valid number format, so FormatException is thrown.' },
    { question: 'What does 10 / 0 (both int) do at runtime?', options: ['Returns 0', 'Returns Infinity', 'Returns NaN', 'Throws DivideByZeroException'], answer: 3, explanation: 'Integer division by zero throws DivideByZeroException. Only floating-point division returns Infinity.' },
    { question: 'Which statement rethrows and preserves the original stack trace?', options: ['throw ex;', 'throw new Exception(ex.Message);', 'throw;', 'return ex;'], answer: 2, explanation: 'throw; with no operand preserves the original stack trace.' },
    { question: 'Which is the base class of all exceptions in .NET?', options: ['System.Error', 'System.Object.Exception', 'System.ApplicationException', 'System.Exception'], answer: 3, explanation: 'All exceptions derive from System.Exception.' },
  ],
};
