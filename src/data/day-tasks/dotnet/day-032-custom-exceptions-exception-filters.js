export default {
  lesson: 'day-032-custom-exceptions-exception-filters',
  minutes: 18,
  intro: 'Practise writing custom exception classes, throwing them, catching them with exception filters (when), and wrapping exceptions with InnerException.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the class header so `InvalidAgeException` is a proper custom exception:\n`public class InvalidAgeException ____________`',
      example: { title: 'custom exception', code: 'public class InsufficientBalanceException : Exception\n{\n    public InsufficientBalanceException(string message) : base(message) { }\n}' },
      accept: [': Exception', ':Exception', ': ApplicationException', ': ArgumentException'],
      caseSensitive: true,
      explain: 'A custom exception **inherits from `Exception`** (or a more specific exception class). By convention its name ends with "Exception", and it passes the message to the base constructor with `: base(message)`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Throwing and catching a custom exception: what does this print?',
      example: { title: 'throw your own exception', code: 'if (balance < amount)\n    throw new InsufficientBalanceException($"Need {amount - balance} more");' },
      code: `int[] ages = { 25, 15, 70 };
foreach (int age in ages)
{
    try
    {
        Register(age);
        Console.WriteLine("Registered " + age);
    }
    catch (InvalidAgeException ex)
    {
        Console.WriteLine("Error: " + ex.Message);
    }
}

static void Register(int age)
{
    if (age < 18 || age > 60)
        throw new InvalidAgeException($"Age {age} is not between 18 and 60");
}

class InvalidAgeException : Exception
{
    public InvalidAgeException(string message) : base(message) { }
}`,
      expected: `Registered 25
Error: Age 15 is not between 18 and 60
Error: Age 70 is not between 18 and 60`,
      explain: 'The message passed through `base(message)` is available as `ex.Message`. A specific exception type lets callers catch exactly this business error without catching everything else.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Exception filters with `when`: what does this print?',
      example: { title: 'catch only when a condition is true', code: 'catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)\n{\n    Console.WriteLine("Page not found");\n}' },
      code: `int[] codes = { 404, 500, 401 };
foreach (int code in codes)
{
    try
    {
        throw new ApiException(code);
    }
    catch (ApiException ex) when (ex.Code == 404)
    {
        Console.WriteLine("Not found");
    }
    catch (ApiException ex) when (ex.Code >= 500)
    {
        Console.WriteLine("Server error, retry");
    }
    catch (ApiException ex)
    {
        Console.WriteLine("Other error " + ex.Code);
    }
}

class ApiException : Exception
{
    public int Code { get; }
    public ApiException(int code) : base("API error " + code) { Code = code; }
}`,
      expected: `Not found
Server error, retry
Other error 401`,
      explain: 'A `when` filter adds a condition: the catch is used only if the type matches **and** the filter is true. Otherwise the next catch is tried. Filters run before the stack unwinds, which keeps debugging information intact.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A filter that **logs and returns false**: what does this print?',
      example: { title: 'logging filter', code: 'catch (Exception ex) when (Log(ex)) { }   // Log returns false → never enters' },
      code: `try
{
    throw new InvalidOperationException("Stock is empty");
}
catch (Exception ex) when (Log(ex))
{
    Console.WriteLine("First catch");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Handled: " + ex.Message);
}

static bool Log(Exception ex)
{
    Console.WriteLine("LOG: " + ex.Message);
    return false;
}`,
      expected: `LOG: Stock is empty
Handled: Stock is empty`,
      explain: 'The filter calls `Log`, which prints and returns **false**, so the first catch is skipped and the next matching catch handles the exception. This is a common trick to log every exception without catching it.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You catch a `FormatException` while reading an age and throw `new InvalidAgeException("Bad age", ex)`. Where can the caller find the original FormatException?',
      options: ['ex.Message', 'ex.InnerException', 'ex.StackTrace', 'It is lost'],
      answer: 1,
      explain: 'Passing the original exception to the constructor (`: base(message, inner)`) stores it in **InnerException**. Wrapping keeps the low-level cause while giving callers a meaningful business-level exception.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Good practices for custom exceptions: which are TRUE? (choose all that apply)',
      options: [
        'End the class name with "Exception"',
        'Provide constructors that accept a message (and optionally an inner exception)',
        'Create a custom exception for every possible error, even when a built-in one like ArgumentNullException fits',
        'Build a hierarchy, e.g. BankException → InsufficientBalanceException, so callers can catch a whole family',
        'Inherit from System.Object instead of Exception',
      ],
      answers: [0, 1, 3],
      explain: 'Reuse built-in exceptions when they describe the problem; create custom ones for **domain** errors. A base domain exception lets callers catch all related errors at once. Only classes deriving from `Exception` can be thrown.',
    },
  ],
};
