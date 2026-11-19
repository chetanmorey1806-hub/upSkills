export default {
  lesson: 'day-031-exception-handling',
  minutes: 18,
  intro: 'Practise try, catch, finally and throw: handling runtime errors, catching specific exceptions in the right order, and validating input.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'try / catch / finally with a division by zero. What does this print?',
      example: { title: 'basic structure', code: 'try\n{\n    // risky code\n}\ncatch (FormatException ex)\n{\n    Console.WriteLine(ex.Message);\n}\nfinally\n{\n    // always runs\n}' },
      code: `int total = 500, people = 0;
try
{
    Console.WriteLine("Splitting bill");
    int share = total / people;
    Console.WriteLine("Share: " + share);
}
catch (DivideByZeroException)
{
    Console.WriteLine("Cannot split among 0 people");
}
finally
{
    Console.WriteLine("Done");
}
Console.WriteLine("Program continues");`,
      expected: `Splitting bill
Cannot split among 0 people
Done
Program continues`,
      explain: 'When the exception is thrown, the rest of the `try` block is **skipped** ("Share" never prints) and control jumps to the matching `catch`. `finally` always runs. Because the error was handled, the program continues normally.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Multiple catch blocks: which one runs? What does this print?',
      example: { title: 'specific first, general last', code: 'catch (FormatException) { … }\ncatch (OverflowException) { … }\ncatch (Exception) { … }   // catches anything else' },
      code: `string[] inputs = { "25", "abc", "99999999999", null };
foreach (string input in inputs)
{
    try
    {
        int age = int.Parse(input);
        Console.WriteLine("Age " + age);
    }
    catch (FormatException)
    {
        Console.WriteLine("Not a number");
    }
    catch (OverflowException)
    {
        Console.WriteLine("Too big");
    }
    catch (Exception ex)
    {
        Console.WriteLine("Other: " + ex.GetType().Name);
    }
}`,
      expected: `Age 25
Not a number
Too big
Other: ArgumentNullException`,
      explain: 'Only the **first matching** catch runs. "abc" → FormatException, a number larger than int.MaxValue → OverflowException, and `int.Parse(null)` throws ArgumentNullException, which falls to the general `catch (Exception)`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why does this fail to compile?\n```\ncatch (Exception ex) { ... }\ncatch (FormatException ex) { ... }\n```',
      options: [
        'You cannot have two catch blocks',
        'The second catch is unreachable: Exception already catches FormatException, so general catches must come last',
        'FormatException does not exist',
        'Both blocks use the name ex',
      ],
      answer: 1,
      explain: 'Catch blocks are checked top to bottom. `Exception` is the base of all exceptions, so a more specific catch after it could never run; the compiler reports error CS0160. Order: **most specific first**.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In `Withdraw(decimal amount)`, complete the line that rejects a negative amount by **throwing** an `ArgumentException` with the message "Amount must be positive":\n`if (amount <= 0) ____________________`',
      example: { title: 'throwing an exception', code: 'if (age < 0)\n    throw new ArgumentOutOfRangeException(nameof(age), "Age cannot be negative");' },
      accept: ['throw new ArgumentException("Amount must be positive");'],
      acceptRegex: ['^throw\\s+new\\s+ArgumentException\\s*\\(\\s*"Amount must be positive"\\s*(,\\s*(nameof\\s*\\(\\s*amount\\s*\\)|"amount")\\s*)?\\)\\s*;?$'],
      caseSensitive: true,
      explain: '`throw new SomeException("message")` creates and throws an exception object; the caller can catch it. Validate input early ("fail fast") instead of letting bad data cause errors later.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`finally` even runs when the try block **returns**. What does this print?',
      example: { title: 'finally for cleanup', code: 'try { return ReadData(); }\nfinally { connection.Close(); }   // still runs' },
      code: `Console.WriteLine(GetDiscount(true));
Console.WriteLine(GetDiscount(false));

static int GetDiscount(bool member)
{
    try
    {
        if (member) return 20;
        return 5;
    }
    finally
    {
        Console.WriteLine("Discount checked");
    }
}`,
      expected: `Discount checked
20
Discount checked
5`,
      explain: 'The `return` value is decided, then `finally` runs **before** the method actually returns, so "Discount checked" prints before each number. That is why `finally` is used for cleanup (closing files, connections).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about exception handling are TRUE? (choose all that apply)',
      options: [
        'A try block must be followed by at least one catch or a finally',
        'Inside a catch, `throw;` re-throws and keeps the original stack trace',
        '`throw ex;` is the best way to re-throw because it keeps the stack trace',
        'Exceptions should be used for normal control flow, e.g. checking if input is numeric',
        'ex.Message contains a description of the error',
      ],
      answers: [0, 1, 4],
      explain: '`throw;` preserves the stack trace while `throw ex;` resets it (bad for debugging). Exceptions are expensive and meant for unexpected situations; for expected cases like user input use `TryParse`.',
    },
  ],
};
