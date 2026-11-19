export default {
  lesson: 'extra-07-idisposable-and-using',
  minutes: 20,
  intro: 'Release resources deterministically with IDisposable, using statements and using declarations.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does a `using (var x = new Resource()) { ... }` block guarantee?',
      options: ['The object is garbage collected immediately', '`x.Dispose()` is called when the block ends, even if an exception is thrown', 'The object can only be used once', 'The object is thread-safe'],
      answer: 1,
      explain: '`using` compiles to `try { ... } finally { x?.Dispose(); }`, so `Dispose` always runs when the block is left, including on exceptions. It does not free memory; the GC still does that later.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'using block', code: `using (var r = new Res("A"))
{
    Console.WriteLine("work");
}   // Dispose runs here` },
      code: `using (var a = new Res("A"))
using (var b = new Res("B"))
{
    Console.WriteLine("Working");
}
Console.WriteLine("Done");

class Res : IDisposable
{
    private readonly string _n;
    public Res(string n) { _n = n; Console.WriteLine($"Open {n}"); }
    public void Dispose() => Console.WriteLine($"Close {_n}");
}`,
      expected: `Open A
Open B
Working
Close B
Close A
Done`,
      explain: 'Resources are opened in order A, B and disposed in **reverse** order (B, then A), like nested try/finally blocks. Both are closed before "Done" is printed.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A **using declaration** (C# 8) inside a method. What does this print?',
      example: { title: 'using declaration', code: `void Save()
{
    using var file = new StreamWriter("a.txt");
    file.WriteLine("hi");
}   // disposed at the end of the method` },
      code: `Run();
Console.WriteLine("After Run");

static void Run()
{
    using var conn = new Res("DB");
    Console.WriteLine("Query 1");
    Console.WriteLine("Query 2");
}

class Res : IDisposable
{
    private readonly string _n;
    public Res(string n) { _n = n; Console.WriteLine($"Open {n}"); }
    public void Dispose() => Console.WriteLine($"Close {_n}");
}`,
      expected: `Open DB
Query 1
Query 2
Close DB
After Run`,
      explain: 'A `using var` declaration disposes the object at the end of the **enclosing scope**, here the end of `Run()`. So both queries run first, then "Close DB", and only then the caller prints "After Run".',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the class header so \`ReportFile\` can be used in a \`using\` statement:
\`public class ReportFile : ______\``,
      example: { title: 'async version', code: 'public class Uploader : IAsyncDisposable { public ValueTask DisposeAsync() { ... } }' },
      accept: ['IDisposable', 'System.IDisposable'],
      caseSensitive: true,
      explain: 'Only types implementing `IDisposable` (with a `void Dispose()` method) can be used with `using`. For async cleanup there is `IAsyncDisposable` with `await using`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'An exception is thrown inside the block. What does this print?',
      example: { title: 'using = try/finally', code: `var r = new Res("X");
try { /* work */ } finally { r.Dispose(); }` },
      code: `try
{
    using var r = new Res("File");
    Console.WriteLine("Writing");
    throw new Exception("disk full");
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}

class Res : IDisposable
{
    private readonly string _n;
    public Res(string n) { _n = n; }
    public void Dispose() => Console.WriteLine($"Close {_n}");
}`,
      expected: `Writing
Close File
Error: disk full`,
      explain: 'When the exception leaves the `try` block, the hidden `finally` of the using declaration runs first ("Close File"), and only then does the `catch` handle the exception. That is why `using` is the safe way to close files and connections.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these types should you wrap in `using`? Select all that apply.',
      options: ['`SqlConnection`', '`StreamReader`', '`List<int>`', '`HttpResponseMessage`', '`string`'],
      answers: [0, 1, 3],
      explain: 'Connections, streams/readers and HTTP response messages hold OS or network resources and implement `IDisposable`. `List<int>` and `string` are pure managed memory; the GC handles them and they do not implement `IDisposable`.',
    },
  ],
};
