const ex1 = `using System;

int[] ages = { 25, -5, 150, 18 };

foreach (int age in ages)
{
    try
    {
        ValidateAge(age);
        Console.WriteLine($"Age {age} accepted");
    }
    catch (InvalidAgeException ex)
    {
        Console.WriteLine($"Rejected: {ex.Message} (value: {ex.Age})");
    }
}

static void ValidateAge(int age)
{
    if (age < 0 || age > 120)
        throw new InvalidAgeException(age);
}

// Custom exception: name ends with "Exception" and derives from Exception
public class InvalidAgeException : Exception
{
    public int Age { get; }

    public InvalidAgeException() : base("Invalid age") { }
    public InvalidAgeException(string message) : base(message) { }
    public InvalidAgeException(string message, Exception inner) : base(message, inner) { }

    public InvalidAgeException(int age) : base("Age must be between 0 and 120")
    {
        Age = age;
    }
}`;

const ex2 = `using System;

int[] codes = { 404, 500, 401, 200 };

foreach (int code in codes)
{
    try
    {
        CallApi(code);
    }
    catch (HttpError ex) when (ex.StatusCode == 404)
    {
        Console.WriteLine($"{ex.StatusCode}: Resource not found - show friendly page");
    }
    catch (HttpError ex) when (ex.StatusCode >= 500)
    {
        Console.WriteLine($"{ex.StatusCode}: Server error - retry later");
    }
    catch (HttpError ex)
    {
        Console.WriteLine($"{ex.StatusCode}: Other error - {ex.Message}");
    }
}

static void CallApi(int code)
{
    if (code != 200)
        throw new HttpError(code, "Request failed");
    Console.WriteLine("200: OK");
}

public class HttpError : Exception
{
    public int StatusCode { get; }

    public HttpError(int statusCode, string message) : base(message)
    {
        StatusCode = statusCode;
    }
}`;

const ex3 = `using System;

try
{
    Process();
}
catch (Exception ex) when (Log(ex))      // filter runs, logs, returns false
{
    Console.WriteLine("Never printed - Log returns false");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine("Handled: " + ex.Message);
}

static void Process()
{
    try
    {
        Console.WriteLine("1. Processing order");
        throw new InvalidOperationException("Stock not available");
    }
    finally
    {
        Console.WriteLine("3. Process finally");
    }
}

static bool Log(Exception ex)
{
    Console.WriteLine("2. LOG: " + ex.GetType().Name + " - " + ex.Message);
    return false;   // false = "I only looked at it, I do not handle it"
}`;

const ex4 = `using System;

var acc = new BankAccount("ACC-101", 5000);

TryRun(() => acc.Withdraw(1000));
TryRun(() => acc.Withdraw(7000));
acc.Lock();
TryRun(() => acc.Withdraw(500));

static void TryRun(Action action)
{
    try
    {
        action();
    }
    catch (InsufficientFundsException ex)          // most specific first
    {
        Console.WriteLine($"{ex.Message} Requested {ex.Requested}, available {ex.Available}");
    }
    catch (BankException ex)                       // any other bank error
    {
        Console.WriteLine($"Bank error on {ex.AccountNo}: {ex.Message}");
    }
}

// Base exception for the whole banking module
public class BankException : Exception
{
    public string AccountNo { get; }
    public BankException(string accountNo, string message) : base(message)
    {
        AccountNo = accountNo;
    }
}

public class InsufficientFundsException : BankException
{
    public decimal Requested { get; }
    public decimal Available { get; }

    public InsufficientFundsException(string accountNo, decimal requested, decimal available)
        : base(accountNo, "Insufficient funds.")
    {
        Requested = requested;
        Available = available;
    }
}

public class AccountLockedException : BankException
{
    public AccountLockedException(string accountNo) : base(accountNo, "Account is locked.") { }
}

public class BankAccount
{
    private bool _locked;
    public string AccountNo { get; }
    public decimal Balance { get; private set; }

    public BankAccount(string accountNo, decimal balance)
    {
        AccountNo = accountNo;
        Balance = balance;
    }

    public void Lock() => _locked = true;

    public void Withdraw(decimal amount)
    {
        if (_locked) throw new AccountLockedException(AccountNo);
        if (amount > Balance) throw new InsufficientFundsException(AccountNo, amount, Balance);
        Balance -= amount;
        Console.WriteLine($"Withdrew {amount}, balance {Balance}");
    }
}`;

const ex5 = `using System;

string[] inputs = { "21", "abc", "-3" };

foreach (string input in inputs)
{
    try
    {
        int age = ReadAge(input);
        Console.WriteLine($"Registered with age {age}");
    }
    catch (InvalidAgeException ex) when (ex.InnerException != null)
    {
        Console.WriteLine($"'{input}': {ex.Message} | cause: {ex.InnerException?.GetType().Name}");
    }
    catch (InvalidAgeException ex)
    {
        Console.WriteLine($"'{input}': {ex.Message}");
    }
}

static int ReadAge(string text)
{
    int age;
    try
    {
        age = int.Parse(text);
    }
    catch (FormatException fe)
    {
        // wrap the technical error in a business error, keep the original
        throw new InvalidAgeException("Age must be a number", fe);
    }

    if (age < 0)
        throw new InvalidAgeException("Age cannot be negative");
    return age;
}

public class InvalidAgeException : Exception
{
    public InvalidAgeException(string message) : base(message) { }
    public InvalidAgeException(string message, Exception inner) : base(message, inner) { }
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below (custom exception classes go at the bottom, after the top-level statements)',
  'Press Ctrl+F5 to run. To move a class to its own file: right-click the class name > Quick Actions (Ctrl+.) > Move type to InvalidAgeException.cs',
];

export default {
  id: 'day-032-custom-exceptions-exception-filters',
  title: 'Custom Exceptions and Exception Filters',
  module: 'Module 3: Advanced C# Programming',
  day: 32,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Built-in exceptions such as ArgumentException do not describe business rules like "age must be between 0 and 120". Learn to create your own exception classes, add extra properties, build an exception hierarchy, wrap errors with InnerException, and use exception filters (catch ... when) to catch an exception only when a condition is true. Practical: InvalidAgeException.',
  objectives: [
    'Create a custom exception class that derives from Exception with the standard constructors',
    'Add custom properties (Age, StatusCode, AccountNo) to carry extra error data',
    'Design a small exception hierarchy and catch at the right level',
    'Use exception filters with catch (...) when (condition)',
    'Wrap low-level exceptions in meaningful custom exceptions using InnerException',
  ],
  theory: [
    {
      heading: 'Why custom exceptions?',
      content: 'Built-in exceptions describe technical problems (null value, bad format, index out of range). Real applications also have business rule violations: a student age of -5, a withdrawal larger than the balance, a locked account. A custom exception gives the error a clear name, so the code that catches it knows exactly what went wrong and can react differently (show a message, retry, log only).',
      points: [
        'Readable: catch (InvalidAgeException) says more than catch (Exception)',
        'Can carry extra data: the invalid value, the account number, an error code',
        'Callers can catch a whole family of errors through a base class (BankException)',
        'Use built-in exceptions when they fit (ArgumentNullException, InvalidOperationException) - do not reinvent them',
      ],
      tip: 'Analogy: a hospital does not just write "patient is sick"; it writes a specific diagnosis so the right doctor can treat it. A custom exception is a specific diagnosis.',
    },
    {
      heading: 'Creating a custom exception class',
      content: 'A custom exception is an ordinary class that inherits from System.Exception. By convention its name ends with "Exception". Provide the three standard constructors (no arguments, message, message + inner exception) and pass the values to the base class with : base(...). Add read-only properties for extra data. In old .NET Framework code you also see [Serializable] and a protected serialization constructor; in .NET 8+ that serialization constructor is obsolete and not needed.',
      syntax: `public class InvalidAgeException : Exception
{
    public int Age { get; }

    public InvalidAgeException() : base("Invalid age") { }
    public InvalidAgeException(string message) : base(message) { }
    public InvalidAgeException(string message, Exception inner)
        : base(message, inner) { }

    public InvalidAgeException(int age)
        : base($"Age {age} is not valid") { Age = age; }
}

// raising it
if (age < 0 || age > 120) throw new InvalidAgeException(age);`,
      points: [
        'Derive from Exception (not from ApplicationException - Microsoft no longer recommends it)',
        'Message is read-only; set it through the base constructor',
        'Make extra properties get-only so the error data cannot be changed after it is thrown',
      ],
    },
    {
      heading: 'Exception hierarchies',
      content: 'For a module with many errors, create one base exception (BankException) and derive specific ones (InsufficientFundsException, AccountLockedException). Callers can catch the specific type when they want special handling, or the base type to handle all banking errors in one place. Catch blocks are still ordered from most specific to most general.',
      syntax: `Exception
 └─ BankException            (AccountNo)
     ├─ InsufficientFundsException (Requested, Available)
     └─ AccountLockedException`,
    },
    {
      heading: 'Exception filters: catch ... when',
      content: 'An exception filter (C# 6+) adds a condition to a catch block: catch (HttpError ex) when (ex.StatusCode == 404). The catch only runs if the type matches AND the condition is true; otherwise the runtime keeps looking at the next catch blocks. This avoids catching, checking with if, and rethrowing.',
      syntax: `try { CallApi(); }
catch (HttpError ex) when (ex.StatusCode == 404) { /* not found */ }
catch (HttpError ex) when (ex.StatusCode >= 500) { /* retry */ }
catch (HttpError ex) { /* everything else */ }`,
      points: [
        'The filter expression must be a bool',
        'Several catch blocks for the same type are allowed when they have filters',
        'If a filter itself throws, that exception is ignored and the filter counts as false',
      ],
    },
    {
      heading: 'Filters run before the stack unwinds (logging trick)',
      content: 'The runtime handles an exception in two passes. Pass 1 searches for a matching catch and evaluates the when filters. Pass 2 runs the finally blocks and then the chosen catch. Because filters run in pass 1, the stack is still intact - debuggers and crash dumps see the original location. A popular trick is catch (Exception ex) when (Log(ex)) where Log writes the error and returns false: the error is logged but not handled, so it continues to the real handler.',
      tip: 'Compare with catch { Log(ex); throw; } - this also works, but the stack has already unwound once and finally blocks have already run.',
    },
    {
      heading: 'Wrapping with InnerException and best practices',
      content: 'When a low-level error (FormatException, SqlException, IOException) happens inside your business code, catch it and throw your custom exception with the original as the inner exception: throw new InvalidAgeException("Age must be a number", fe). The caller sees a meaningful error and the log still shows the root cause through ex.InnerException.',
      points: [
        'Always pass the original exception as inner when wrapping',
        'Do not create a custom exception for every small case - one per meaningful situation',
        'Keep custom exceptions public so callers in other projects can catch them',
        'Put messages that are safe to show users; put technical detail in the inner exception or logs',
        'In ASP.NET Core, a global exception handler (Day 73, Day 96) can map custom exceptions to HTTP status codes (InvalidAgeException -> 400, NotFoundException -> 404)',
      ],
    },
  ],
  examples: [
    {
      title: 'InvalidAgeException - the classic custom exception',
      scenario: 'A registration form must reject ages below 0 or above 120 with a clear, specific error that also remembers the invalid value.',
      steps: steps('InvalidAgeDemo'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `Age 25 accepted
Rejected: Age must be between 0 and 120 (value: -5)
Rejected: Age must be between 0 and 120 (value: 150)
Age 18 accepted`,
      explanation: 'ValidateAge throws InvalidAgeException for -5 and 150. The catch block reads both the standard Message property and the custom Age property. Ages 25 and 18 pass validation, so "accepted" prints. Notice the class has the three standard constructors plus one extra constructor that takes the age.',
    },
    {
      title: 'Exception filters with when',
      scenario: 'An API client gets different HTTP errors. 404 shows a friendly page, 5xx errors are retried later, anything else is shown as-is - all with the same exception type.',
      steps: steps('ExceptionFilters'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `404: Resource not found - show friendly page
500: Server error - retry later
401: Other error - Request failed
200: OK`,
      explanation: 'All errors are HttpError, but the when filters choose the catch block. 404 matches the first filter, 500 matches the second (>= 500). 401 fails both filters, so it falls to the unfiltered catch. Code 200 does not throw at all. Without filters you would need one catch with an if/else chain inside.',
    },
    {
      title: 'Logging with a filter that returns false',
      scenario: 'Log every exception at the top level without actually handling it there, and see that the filter runs BEFORE the finally block of the failing method.',
      steps: steps('FilterLogging'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `1. Processing order
2. LOG: InvalidOperationException - Stock not available
3. Process finally
Handled: Stock not available`,
      explanation: 'When Process throws, the runtime first searches for a handler and evaluates the filter Log(ex) - so "2. LOG" prints while Process has not yet been left. Log returns false, so the search continues and finds catch (InvalidOperationException). Only then does the second pass unwind the stack: Process\'s finally prints "3", and finally the catch body prints "Handled". A catch (Exception) placed before a more specific catch is allowed here only because it has a filter.',
    },
    {
      title: 'An exception hierarchy for a bank account',
      scenario: 'A BankAccount throws InsufficientFundsException or AccountLockedException; both derive from BankException so callers can handle them specifically or as a group.',
      steps: steps('BankExceptions'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Withdrew 1000, balance 4000
Insufficient funds. Requested 7000, available 4000
Bank error on ACC-101: Account is locked.`,
      explanation: 'The first withdrawal succeeds. The second throws InsufficientFundsException, caught by its own specific catch which reads Requested and Available. After Lock(), the third throws AccountLockedException; there is no specific catch for it, so catch (BankException) handles it through inheritance and reads the AccountNo property from the base class.',
    },
    {
      title: 'Wrapping a FormatException inside InvalidAgeException',
      scenario: 'Age typed by the user may be text. Convert the low-level FormatException into a business error but keep the original as InnerException, and use a filter to show the cause.',
      steps: steps('WrapException'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `Registered with age 21
'abc': Age must be a number | cause: FormatException
'-3': Age cannot be negative`,
      explanation: '"abc" makes int.Parse throw FormatException; ReadAge catches it and throws InvalidAgeException with the FormatException as inner. In Main, the first catch has the filter when (ex.InnerException != null), so it handles this case and prints the cause. "-3" parses fine but is negative, so a plain InvalidAgeException (no inner) is thrown - the filter is false and the second catch handles it.',
    },
  ],
  interview: [
    { q: 'What is a custom exception?', a: 'A user-defined class that derives from System.Exception (directly or indirectly) to represent an application-specific error, such as InvalidAgeException or InsufficientFundsException.', level: 'Easy' },
    { q: 'Which class should a custom exception inherit from?', a: 'System.Exception (or a more specific built-in or custom exception). Deriving from ApplicationException is no longer recommended because it adds no value.', level: 'Easy' },
    { q: 'Which constructors should a custom exception provide?', a: 'The three standard ones: parameterless, (string message) and (string message, Exception innerException), each calling the matching base constructor. Add extra constructors for custom data.', level: 'Medium' },
    { q: 'What is an exception filter?', a: 'A when clause on a catch block: catch (MyException ex) when (condition). The block executes only if the type matches and the condition is true; otherwise the search for a handler continues.', level: 'Easy' },
    { q: 'How is a filter different from catching and using if + throw; inside?', a: 'A filter runs before the stack unwinds, so finally blocks have not yet run and the original stack is preserved for debuggers and dumps. With catch + if + throw;, the exception is caught first (stack unwound to that frame) and then rethrown.', level: 'Hard' },
    { q: 'What happens if the code inside a when filter throws an exception?', a: 'The new exception is swallowed and the filter is treated as false; the runtime continues looking for another matching catch.', level: 'Hard' },
    { q: 'Why add properties to a custom exception?', a: 'To carry structured data about the error (invalid value, account number, status code) so the handler can make decisions or log details without parsing the message text.', level: 'Medium' },
    { q: 'What is the output? try { throw new InvalidAgeException(200); } catch (Exception ex) when (ex is InvalidAgeException) { Console.Write("A"); } catch { Console.Write("B"); }', a: 'A. The type is Exception (matches) and the filter is true because the object is an InvalidAgeException.', level: 'Medium' },
    { q: 'What is the output? try { throw new Exception("x"); } catch (Exception) when (false) { Console.Write("1"); } catch (Exception) { Console.Write("2"); }', a: '2. The first filter is false, so the second catch handles it. (The compiler warns that the filter is always false.)', level: 'Medium' },
    { q: 'How do you preserve the original error when throwing a custom exception?', a: 'Pass it as innerException: throw new OrderException("Order failed", ex). It can be read later through the InnerException property.', level: 'Easy' },
    { q: 'Should every validation failure be a custom exception?', a: 'No. Expected, frequent problems (bad user input in a form) are better handled with validation results or TryParse. Use exceptions for situations where the method cannot do its job; create custom types only when callers need to distinguish them.', level: 'Medium' },
    { q: 'How are custom exceptions used in ASP.NET Core?', a: 'A global exception handler or middleware catches them and maps each type to a response: NotFoundException -> 404, ValidationException -> 400, and so on, returning ProblemDetails JSON.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create InvalidMarksException with a Marks property. Write SetMarks(int m) that throws it when m < 0 or m > 100. Test with 75, 120 and -1.',
      hint: 'Copy the InvalidAgeException pattern. Catch it in a loop and print ex.Message and ex.Marks.',
      solution: `using System;

foreach (int m in new[] { 75, 120, -1 })
{
    try
    {
        SetMarks(m);
        Console.WriteLine($"Marks {m} saved");
    }
    catch (InvalidMarksException ex)
    {
        Console.WriteLine($"{ex.Message}: {ex.Marks}");
    }
}

static void SetMarks(int m)
{
    if (m < 0 || m > 100) throw new InvalidMarksException(m);
}

public class InvalidMarksException : Exception
{
    public int Marks { get; }
    public InvalidMarksException(int marks) : base("Marks must be 0-100") { Marks = marks; }
}
// Output:
// Marks 75 saved
// Marks must be 0-100: 120
// Marks must be 0-100: -1`,
    },
    {
      task: 'Create ProductNotFoundException(int productId). Search an array of product IDs; throw if not found. Catch it and print "Product 9 not found".',
      hint: 'Use Array.IndexOf or a loop; throw when the result is -1.',
      solution: `using System;

int[] ids = { 1, 2, 3 };
try
{
    Find(ids, 2);
    Find(ids, 9);
}
catch (ProductNotFoundException ex)
{
    Console.WriteLine($"Product {ex.ProductId} not found");
}

static void Find(int[] ids, int id)
{
    if (Array.IndexOf(ids, id) == -1) throw new ProductNotFoundException(id);
    Console.WriteLine($"Product {id} found");
}

public class ProductNotFoundException : Exception
{
    public int ProductId { get; }
    public ProductNotFoundException(int id) : base($"Product {id} not found") { ProductId = id; }
}`,
    },
    {
      task: 'Use exception filters to handle a ValidationException(string field) differently for field "Email" and "Phone", with a fallback catch for any other field.',
      hint: 'catch (ValidationException ex) when (ex.Field == "Email") ...',
      solution: `using System;

foreach (string f in new[] { "Email", "Phone", "Name" })
{
    try { throw new ValidationException(f); }
    catch (ValidationException ex) when (ex.Field == "Email") { Console.WriteLine("Please enter a valid email"); }
    catch (ValidationException ex) when (ex.Field == "Phone") { Console.WriteLine("Phone must have 10 digits"); }
    catch (ValidationException ex) { Console.WriteLine($"{ex.Field} is invalid"); }
}

public class ValidationException : Exception
{
    public string Field { get; }
    public ValidationException(string field) : base(field + " is invalid") { Field = field; }
}`,
    },
    {
      task: 'Build an exception hierarchy for a library: LibraryException (base), BookNotAvailableException and MemberLimitExceededException. Throw each and handle both specifically and through the base type.',
      hint: 'Derive the two specific exceptions from LibraryException; order catch blocks from specific to general.',
      solution: `using System;

Action[] actions =
{
    () => throw new BookNotAvailableException("C# in Depth"),
    () => throw new MemberLimitExceededException(3),
};

foreach (var a in actions)
{
    try { a(); }
    catch (BookNotAvailableException ex) { Console.WriteLine("Reserve it: " + ex.Message); }
    catch (LibraryException ex) { Console.WriteLine("Library rule: " + ex.Message); }
}

public class LibraryException : Exception
{
    public LibraryException(string message) : base(message) { }
}
public class BookNotAvailableException : LibraryException
{
    public BookNotAvailableException(string title) : base(title + " is issued") { }
}
public class MemberLimitExceededException : LibraryException
{
    public MemberLimitExceededException(int limit) : base($"Only {limit} books allowed") { }
}
// Output:
// Reserve it: C# in Depth is issued
// Library rule: Only 3 books allowed`,
    },
    {
      task: 'Write a top-level handler catch (Exception ex) when (LogError(ex)) that logs the type and message of every exception and returns false, followed by a real handler.',
      hint: 'LogError prints and returns false, so the next catch still runs.',
      solution: `using System;

try { int[] a = new int[2]; a[3] = 1; }
catch (Exception ex) when (LogError(ex)) { }
catch (IndexOutOfRangeException) { Console.WriteLine("Handled bad index"); }

static bool LogError(Exception ex)
{
    Console.WriteLine($"[LOG] {ex.GetType().Name}: {ex.Message}");
    return false;
}
// Output:
// [LOG] IndexOutOfRangeException: Index was outside the bounds of the array.
// Handled bad index`,
    },
  ],
  quiz: [
    { question: 'Which is the recommended base class for a custom exception?', options: ['System.Object', 'System.Exception', 'System.Error', 'System.ApplicationException only'], answer: 1, explanation: 'Derive from System.Exception (or another exception). ApplicationException is no longer recommended.' },
    { question: 'Which keyword adds a condition to a catch block?', options: ['if', 'where', 'when', 'filter'], answer: 2, explanation: 'catch (Type ex) when (condition) is an exception filter.' },
    { question: 'If a when filter returns false, what happens?', options: ['The program crashes immediately', 'The catch body runs anyway', 'The exception is ignored', 'The runtime keeps searching the next catch blocks'], answer: 3, explanation: 'A false filter means "not this handler"; the search continues to later catch blocks and outer methods.' },
    { question: 'How do you keep the original error when throwing a custom exception?', options: ['Pass it as the innerException constructor argument', 'Use throw ex;', 'Copy its StackTrace into Message', 'Call GC.KeepAlive(ex)'], answer: 0, explanation: 'base(message, inner) stores it in InnerException.' },
    { question: 'catch (BankException) will catch which of these (both derive from BankException)?', options: ['Only BankException objects', 'Neither of them', 'InsufficientFundsException and AccountLockedException', 'Only exceptions with a filter'], answer: 2, explanation: 'A catch for a base type also catches all derived exception types.' },
  ],
};
