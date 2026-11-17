const NOTIFY = `using System;

Notify notify = SendEmail;
notify += SendSms;                       // add a second method
notify += SendWhatsApp;                  // and a third
Console.WriteLine($"Handlers: {notify.GetInvocationList().Length}");
notify("Order #101 shipped");            // ONE call runs all three, in order

Console.WriteLine("--- after removing SMS ---");
notify -= SendSms;
notify("Order #101 delivered");

static void SendEmail(string msg) => Console.WriteLine($"Email: {msg}");
static void SendSms(string msg) => Console.WriteLine($"SMS: {msg}");
static void SendWhatsApp(string msg) => Console.WriteLine($"WhatsApp: {msg}");

delegate void Notify(string message);`;

const RETURNS = `using System;

Calc calc = Ops.Add;
calc += Ops.Multiply;
calc += Ops.Subtract;

int result = calc(6, 3);                 // all three run, only the LAST result is kept
Console.WriteLine($"Result from multicast call: {result}");

Console.WriteLine("Collecting every result:");
foreach (Calc c in calc.GetInvocationList())
{
    int r = c(6, 3);
    Console.WriteLine($"{c.Method.Name} -> {r}");
}

delegate int Calc(int a, int b);

static class Ops
{
    public static int Add(int a, int b) { Console.WriteLine("Add called"); return a + b; }
    public static int Multiply(int a, int b) { Console.WriteLine("Multiply called"); return a * b; }
    public static int Subtract(int a, int b) { Console.WriteLine("Subtract called"); return a - b; }
}`;

const EXCEPTION = `using System;

Action<string> pipeline = Steps.Log;
pipeline += Steps.Validate;
pipeline += Steps.Save;

Console.WriteLine("Normal invoke:");
try
{
    pipeline("bad");
}
catch (Exception ex)
{
    Console.WriteLine($"Stopped: {ex.Message}");
}

Console.WriteLine("Safe invoke:");
foreach (Action<string> step in pipeline.GetInvocationList())
{
    try
    {
        step("bad");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Skipped {step.Method.Name}: {ex.Message}");
    }
}

static class Steps
{
    public static void Log(string data) => Console.WriteLine($"Log: {data}");

    public static void Validate(string data)
    {
        if (data == "bad") throw new ArgumentException("Invalid data");
        Console.WriteLine("Valid");
    }

    public static void Save(string data) => Console.WriteLine($"Saved: {data}");
}`;

const PITFALLS = `using System;

Action greet = () => Console.WriteLine("Hello");
greet += () => Console.WriteLine("Namaste");
greet -= () => Console.WriteLine("Hello");   // does NOT remove anything: a new lambda is a different delegate
greet();
Console.WriteLine($"Count: {greet.GetInvocationList().Length}");

Action tick = Counter.Tick;
tick += Counter.Tick;                         // the same method can be added many times
tick += Counter.Tick;
tick -= Counter.Tick;                         // removes only ONE (the last) occurrence
tick();
Console.WriteLine($"Ticks: {Counter.Value}");

Action? single = Counter.Tick;
single -= Counter.Tick;                       // removing the last method gives null
Console.WriteLine(single == null ? "Delegate is null after removing the last handler" : "Not null");

static class Counter
{
    public static int Value;
    public static void Tick() => Value++;
}`;

export default {
  id: 'extra-17-multicast-delegates',
  title: 'Multicast Delegates',
  module: 'Extra: OOP Concepts',
  extraNo: 17,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `A multicast delegate holds a LIST of methods and calls all of them, in order, with one invocation. You build it with + / += and remove methods with - / -=. This lesson explains the invocation list, the order of execution, what happens to return values (only the last one survives), how one exception stops the chain, how to call each handler safely with GetInvocationList, and common removal pitfalls with lambdas.`,
  objectives: [
    'Combine and remove methods with +=, -=, Delegate.Combine and Delegate.Remove',
    'Predict the execution order and the returned value of a multicast call',
    'Use GetInvocationList to collect every result and isolate exceptions',
    'Avoid pitfalls: removing lambdas, duplicate handlers and null after removal',
  ],
  theory: [
    {
      heading: 'What is a multicast delegate?',
      content: `Every delegate in .NET derives from System.MulticastDelegate, so every delegate can hold more than one method. The list of methods is called the invocation list. When you call the delegate, each method runs one after another in the order they were added, all receiving the same arguments.

Real-world analogy: a WhatsApp broadcast list. You type one message (one call) and it is delivered to every contact on the list (every method), in the order they were added. You can add or remove contacts at any time.`,
      syntax: `Notify n = SendEmail;
n += SendSms;          // same as n = (Notify)Delegate.Combine(n, new Notify(SendSms));
n += SendWhatsApp;
n("Hi");               // SendEmail, SendSms, SendWhatsApp
n -= SendSms;          // same as Delegate.Remove`,
      points: [
        '+= adds a method to the end of the list',
        '-= removes the LAST matching occurrence of a method',
        'Delegates are immutable: += creates a NEW delegate object and assigns it back',
        'Order of execution = order of addition (it is guaranteed)',
      ],
    },
    {
      heading: 'Return values in a multicast call',
      content: `Multicast delegates are usually void (Action, EventHandler). If the delegate returns a value, every method still runs, but the caller only receives the return value of the LAST method in the list. All earlier results are thrown away.

If you need all the results, loop through GetInvocationList(), cast each item to your delegate type and call it individually.`,
      syntax: `foreach (Calc c in calc.GetInvocationList())
{
    int r = c(6, 3);   // individual result
}`,
      tip: `ref/out parameters are shared along the chain: each method sees the value left by the previous one. This is rarely a good idea; prefer void delegates for multicast scenarios.`,
    },
    {
      heading: 'Exceptions in the chain',
      content: `Methods in the invocation list are called synchronously one by one. If one method throws, the exception propagates to the caller immediately and the REMAINING methods are NOT called. In a notification system this means one failing SMS gateway would block the WhatsApp message.

To make each handler independent, iterate GetInvocationList() and wrap each call in try/catch. ASP.NET Core and many libraries do exactly this when they raise events to many subscribers.`,
    },
    {
      heading: 'Removal rules and pitfalls',
      content: `Removal compares delegates by target object AND method. A method group like Counter.Tick creates equal delegates every time, so -= Counter.Tick works. Two lambdas with the same body are DIFFERENT methods generated by the compiler, so -= () => ... removes nothing. Store the lambda in a variable if you need to remove it later.

Removing a method that is not in the list does nothing (no exception). Removing the last remaining method makes the delegate null, so always use ?.Invoke.`,
      points: [
        'Keep a reference: Action h = () => ...; x += h; ... x -= h;',
        'Duplicates are allowed: adding a method twice makes it run twice',
        'Removing a missing method is silently ignored',
        'After removing everything the variable is null',
      ],
    },
    {
      heading: 'Multicast delegates and events',
      content: `Events (next lesson) are built on multicast delegates. button.Click += handler simply adds handler to a private multicast delegate. The event keyword restricts outsiders to += and -= only, so they cannot replace the whole list with = or invoke it. Everything you learn here — order, last return value, exceptions stopping the chain — also applies to events.`,
    },
  ],
  examples: [
    {
      title: 'One call, many notifications',
      scenario: 'An order-shipped message must go to Email, SMS and WhatsApp. Later the customer turns SMS off.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MulticastNotify',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on notify("Order #101 shipped"); press F5 and step with F11 to watch each method run in turn',
        'Press Ctrl+F5 for the normal run',
      ],
      code: NOTIFY,
      csharp: { files: { 'Program.cs': NOTIFY }, stdin: '' },
      result: `Handlers: 3
Email: Order #101 shipped
SMS: Order #101 shipped
WhatsApp: Order #101 shipped
--- after removing SMS ---
Email: Order #101 delivered
WhatsApp: Order #101 delivered`,
      explanation: `The invocation list holds SendEmail, SendSms, SendWhatsApp in the order they were added. One call notify(...) runs all three. -= SendSms creates a new delegate without SendSms, so the second call only reaches Email and WhatsApp.`,
    },
    {
      title: 'Return values – only the last one survives',
      scenario: 'Three calculator methods are chained in a delegate that returns int. Find out which result the caller gets, then collect all results.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MulticastReturn',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: RETURNS,
      csharp: { files: { 'Program.cs': RETURNS }, stdin: '' },
      result: `Add called
Multiply called
Subtract called
Result from multicast call: 3
Collecting every result:
Add called
Add -> 9
Multiply called
Multiply -> 18
Subtract called
Subtract -> 3`,
      explanation: `calc(6, 3) runs Add (9), Multiply (18) and Subtract (3), printing "called" for each, but the caller receives only 3 — the result of the last method. GetInvocationList returns a Delegate[] with three single-method delegates; calling each one separately gives every result (each call prints its "called" line first, then the loop prints the result).`,
    },
    {
      title: 'One exception stops the chain – safe invocation',
      scenario: 'A processing pipeline Log → Validate → Save. Validate throws for bad data. Compare a normal call with a per-handler try/catch.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MulticastExceptions',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: EXCEPTION,
      csharp: { files: { 'Program.cs': EXCEPTION }, stdin: '' },
      result: `Normal invoke:
Log: bad
Stopped: Invalid data
Safe invoke:
Log: bad
Skipped Validate: Invalid data
Saved: bad`,
      explanation: `In the normal call Log runs, Validate throws ArgumentException and Save never runs — the exception jumps straight to the catch block. In the safe loop each handler has its own try/catch, so the failure of Validate is reported and Save still runs.`,
    },
    {
      title: 'Removal pitfalls: lambdas, duplicates and null',
      scenario: 'See why removing a lambda fails, how duplicate handlers behave, and why a delegate becomes null after its last method is removed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it MulticastPitfalls',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: PITFALLS,
      csharp: { files: { 'Program.cs': PITFALLS }, stdin: '' },
      result: `Hello
Namaste
Count: 2
Ticks: 2
Delegate is null after removing the last handler`,
      explanation: `The lambda in the -= line is a brand-new compiler-generated method, so it does not match the "Hello" lambda and nothing is removed — both lines still print and the count is 2. Counter.Tick was added three times and removed once, so the call ticks twice. Removing the only method from single leaves null.`,
    },
  ],
  interview: [
    { q: 'What is a multicast delegate?', a: 'A delegate whose invocation list contains more than one method. Invoking it calls every method in order with the same arguments.', level: 'Easy' },
    { q: 'How do you add and remove methods?', a: 'With += and -= (or + and -), which call Delegate.Combine and Delegate.Remove internally and return a new delegate instance.', level: 'Easy' },
    { q: 'In which order are methods executed?', a: 'In the order they were added to the invocation list. The order is guaranteed and execution is synchronous on the calling thread.', level: 'Easy' },
    { q: 'What value is returned when a multicast delegate with a return type is invoked?', a: 'The return value of the LAST method in the invocation list; earlier results are discarded.', level: 'Medium' },
    { q: 'How can you get the return value of every method?', a: 'Iterate delegate.GetInvocationList(), cast each Delegate to the specific type and invoke them one by one.', level: 'Medium' },
    { q: 'What happens if a method in the chain throws an exception?', a: 'The exception propagates to the caller and the remaining methods are not executed. Use GetInvocationList with try/catch per handler to isolate failures.', level: 'Medium' },
    { q: 'Why does d -= () => Console.WriteLine("x"); not remove a previously added identical lambda?', a: 'Each lambda expression compiles to a separate method (or a separate delegate instance with a different target), so the delegates are not equal. Keep the lambda in a variable and remove that variable.', level: 'Hard' },
    { q: 'Output? Action a = () => Console.Write("1"); a += () => Console.Write("2"); a += a; a();', a: '1212. a += a appends the current list (1,2) to itself, giving 1,2,1,2.', level: 'Hard' },
    { q: 'Output? Func<int> f = () => 1; f += () => 2; f += () => 3; Console.WriteLine(f());', a: '3. All three run but only the last result is returned.', level: 'Medium' },
    { q: 'What happens when you remove a method that is not in the list?', a: 'Nothing; Delegate.Remove returns the original delegate unchanged and no exception is thrown.', level: 'Easy' },
    { q: 'What is the value of a delegate after removing its only method?', a: 'null. Calling it directly would throw NullReferenceException, so use ?.Invoke.', level: 'Medium' },
    { q: 'Are multicast delegates thread-safe?', a: 'Delegates are immutable, so reading/invoking a snapshot is safe. But += on a field is a read-modify-write and can lose updates under races; field-like events use Interlocked.CompareExchange internally to make add/remove thread-safe.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create Action<int> handlers that print the square, the cube and "even/odd" for a number. Combine them and call once with 4.',
      hint: 'Start with one lambda and add the others with +=.',
      solution: `Action<int> h = n => Console.WriteLine($"Square: {n * n}");
h += n => Console.WriteLine($"Cube: {n * n * n}");
h += n => Console.WriteLine(n % 2 == 0 ? "Even" : "Odd");
h(4);   // Square: 16 / Cube: 64 / Even`,
    },
    {
      task: 'Build a logging system: Action<string> log with ConsoleLog, FileLog (just prints "[file] ...") and DbLog. Remove DbLog at runtime and log again.',
      hint: 'Use static methods so -= works.',
      solution: `Action<string> log = ConsoleLog;
log += FileLog;
log += DbLog;
log("Started");
log -= DbLog;
log("Running");

static void ConsoleLog(string m) => Console.WriteLine($"[console] {m}");
static void FileLog(string m) => Console.WriteLine($"[file] {m}");
static void DbLog(string m) => Console.WriteLine($"[db] {m}");`,
    },
    {
      task: 'Create Func<int, int> chain of three discount rules (10%, flat 50, 5%) and print the result of each rule using GetInvocationList for price 1000.',
      hint: 'Cast each item: foreach (Func<int,int> f in chain.GetInvocationList()).',
      solution: `Func<int, int> chain = p => p * 10 / 100;
chain += p => 50;
chain += p => p * 5 / 100;
foreach (Func<int, int> f in chain.GetInvocationList())
    Console.WriteLine(f(1000));   // 100, 50, 50
Console.WriteLine(chain(1000));   // 50 (last result only)`,
    },
    {
      task: 'Write a SafeInvoke(Action<string> handlers, string msg) helper that runs every handler, catches exceptions, and prints how many succeeded and failed.',
      hint: 'Count inside the try and catch blocks.',
      solution: `static void SafeInvoke(Action<string>? handlers, string msg)
{
    if (handlers == null) return;
    int ok = 0, failed = 0;
    foreach (Action<string> h in handlers.GetInvocationList())
    {
        try { h(msg); ok++; }
        catch (Exception ex) { failed++; Console.WriteLine($"Failed: {ex.Message}"); }
    }
    Console.WriteLine($"Succeeded: {ok}, Failed: {failed}");
}`,
    },
  ],
  quiz: [
    {
      question: 'Func<int> f = () => 10; f += () => 20; What does f() return?',
      options: ['10', '30', '20', 'An array {10, 20}'],
      answer: 2,
      explanation: 'Both run but only the last method\'s return value is returned.',
    },
    {
      question: 'What happens to the remaining handlers when the second of four handlers throws?',
      options: ['They still run', 'They do not run; the exception goes to the caller', 'They run on another thread', 'The exception is swallowed'],
      answer: 1,
      explanation: 'Invocation is sequential; an unhandled exception stops the chain.',
    },
    {
      question: 'Which method returns the individual delegates of a multicast delegate?',
      options: ['GetInvocationList()', 'GetMethods()', 'Split()', 'ToArray()'],
      answer: 0,
      explanation: 'GetInvocationList returns Delegate[] with one entry per method.',
    },
    {
      question: 'A method is added three times and removed once with -=. How many times does it run?',
      options: ['0', '1', '3', '2'],
      answer: 3,
      explanation: '-= removes only one (the last) occurrence.',
    },
    {
      question: 'What is the base class that allows every delegate to hold multiple methods?',
      options: ['System.Object', 'System.Action', 'System.MulticastDelegate', 'System.EventArgs'],
      answer: 2,
      explanation: 'All delegate types derive from System.MulticastDelegate.',
    },
  ],
};
