const usingOrder = `using System;

class DbConnectionDemo : IDisposable
{
    private readonly string _name;
    private bool _disposed;

    public DbConnectionDemo(string name)
    {
        _name = name;
        Console.WriteLine($"Open {_name}");
    }

    public void Query(string sql)
    {
        if (_disposed) throw new ObjectDisposedException(_name);
        Console.WriteLine($"{_name} runs: {sql}");
    }

    public void Dispose()
    {
        if (_disposed) return;      // safe to call twice
        _disposed = true;
        Console.WriteLine($"Close {_name}");
    }
}

class Program
{
    static void Main()
    {
        using (var con = new DbConnectionDemo("StudentDB"))
        {
            con.Query("SELECT * FROM Students");
        }   // Dispose() is called here automatically

        Console.WriteLine("--- using declaration ---");
        RunReport();
        Console.WriteLine("Report done");
    }

    static void RunReport()
    {
        using var a = new DbConnectionDemo("SalesDB");
        using var b = new DbConnectionDemo("HrDB");
        a.Query("SELECT 1");
        b.Query("SELECT 2");
        Console.WriteLine("Leaving RunReport");
    }   // b is disposed first, then a (reverse order)
}
`;

const usingException = `using System;

class Printer : IDisposable
{
    public Printer() => Console.WriteLine("Printer: connected");

    public void Print(string doc)
    {
        if (doc.Length == 0) throw new InvalidOperationException("Empty document");
        Console.WriteLine($"Printer: printing {doc}");
    }

    public void Dispose() => Console.WriteLine("Printer: disconnected");
}

class Program
{
    static void Main()
    {
        try
        {
            using var p = new Printer();
            p.Print("Invoice-1");
            p.Print("");            // throws
            p.Print("Invoice-2");   // never reached
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"Caught: {ex.Message}");
        }

        Console.WriteLine("--- what using compiles to ---");
        Printer q = new Printer();
        try
        {
            q.Print("Salary-Slip");
        }
        finally
        {
            q?.Dispose();
        }
    }
}
`;

const disposePattern = `using System;
using System.Runtime.CompilerServices;

class NativeBuffer : IDisposable
{
    private IntPtr _handle;          // pretend this is unmanaged memory
    private bool _disposed;
    private readonly string _name;

    public NativeBuffer(string name)
    {
        _name = name;
        _handle = new IntPtr(1234);
        Console.WriteLine($"{_name}: allocated");
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);   // cleanup done, finalizer not needed
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;
        if (disposing)
            Console.WriteLine($"{_name}: freeing managed resources");
        _handle = IntPtr.Zero;
        Console.WriteLine($"{_name}: freeing unmanaged handle");
        _disposed = true;
    }

    ~NativeBuffer()
    {
        Console.WriteLine($"{_name}: finalizer running (Dispose was forgotten!)");
        Dispose(false);
    }
}

class Program
{
    [MethodImpl(MethodImplOptions.NoInlining)]
    static void Forget()
    {
        var leak = new NativeBuffer("B2");   // no using, no Dispose()
    }

    static void Main()
    {
        using (var b1 = new NativeBuffer("B1"))
        {
            Console.WriteLine("B1: in use");
        }

        Forget();
        GC.Collect();
        GC.WaitForPendingFinalizers();
        Console.WriteLine("Done");
    }
}
`;

const stringIo = `using System;
using System.IO;

class Program
{
    static void Main()
    {
        string text;
        using (var writer = new StringWriter())
        {
            writer.WriteLine("Roll,Name");
            writer.WriteLine("1,Asha");
            writer.WriteLine("2,Ravi");
            text = writer.ToString();
        }

        using var reader = new StringReader(text);
        string? line;
        int count = 0;
        while ((line = reader.ReadLine()) != null)
        {
            count++;
            Console.WriteLine($"{count}: {line}");
        }
        Console.WriteLine($"Lines read: {count}");
    }
}
`;

export default {
  id: 'extra-07-idisposable-and-using',
  title: 'IDisposable, Dispose() and the using Statement',
  module: 'Extra: OOP Concepts',
  extraNo: 7,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `The garbage collector frees memory, but not files, database connections, sockets or native handles - those must be released as soon as you are done. IDisposable is the standard .NET contract for that: a single Dispose() method. The using statement and the C# 8 using declaration call Dispose() automatically, even when an exception is thrown. Learn how to consume disposable objects correctly, how to implement IDisposable in your own classes, the full Dispose pattern with a finalizer, and IAsyncDisposable with await using.`,
  objectives: [
    'Explain why some objects need deterministic cleanup beyond garbage collection',
    'Use the using statement and using declaration correctly, including disposal order',
    'Implement IDisposable in a class, including idempotent Dispose and ObjectDisposedException',
    'Write the full Dispose pattern with Dispose(bool) and GC.SuppressFinalize',
    'Recognise common disposable types (FileStream, StreamWriter, SqlConnection, HttpClient) and IAsyncDisposable',
  ],
  theory: [
    {
      heading: 'Why IDisposable? Managed vs unmanaged resources',
      content: `The GC only knows about **memory**. Many objects also hold **resources outside .NET's control**: an open file handle, a database connection from the pool, a network socket, a window handle, a lock on a file. If you wait for the GC, these may stay open for minutes - other users get "file in use" errors and connection pools run dry.

**Real-world analogy:** A library book. The library will eventually find it and take it back (like the GC), but the right thing is to **return it as soon as you finish** so the next person can use it. Dispose() is "returning the book". The using statement is a librarian who takes the book from your hands automatically when you leave the reading room - even if you leave in a hurry (an exception).`,
      points: [
        'IDisposable has exactly one method: void Dispose()',
        'Dispose = release resources NOW (deterministic)',
        'After Dispose the object should not be used again',
      ],
    },
    {
      heading: 'The using statement and the using declaration',
      content: `**using statement** (block form): Dispose() is called when the block ends.

**using declaration** (C# 8+): no braces; Dispose() is called at the end of the enclosing scope (usually the method). Multiple using declarations are disposed in **reverse order** of declaration (last created, first disposed).

The compiler turns using into a **try/finally**, so Dispose() runs **even when an exception is thrown** or you return early.`,
      syntax: `// using statement
using (var writer = new StreamWriter("log.txt"))
{
    writer.WriteLine("Hello");
}   // writer.Dispose() here

// using declaration (C# 8+)
using var reader = new StreamReader("log.txt");
Console.WriteLine(reader.ReadToEnd());
// reader.Dispose() at the end of the method

// What the compiler generates for the block form:
var w = new StreamWriter("log.txt");
try { w.WriteLine("Hello"); }
finally { w?.Dispose(); }`,
      tip: 'Do not dispose objects you did not create (for example a DbContext injected by ASP.NET Core). The owner - the DI container - disposes them at the end of the request.',
    },
    {
      heading: 'Implementing IDisposable in your own class',
      content: `If your class **owns** a disposable field (a StreamWriter, a SqlConnection, a Timer), your class must be disposable too, and its Dispose must dispose that field.

Good Dispose implementation rules:
1. **Idempotent** - calling Dispose twice must not throw (use a _disposed flag).
2. After disposal, other public methods should throw **ObjectDisposedException**.
3. Dispose should **not throw** exceptions itself.
4. If the class is **sealed** and has no unmanaged resources, a simple Dispose() is enough - no finalizer.`,
      syntax: `public sealed class Logger : IDisposable
{
    private readonly StreamWriter _writer = new("app.log");
    private bool _disposed;

    public void Log(string m)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);   // .NET 7+
        _writer.WriteLine(m);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _writer.Dispose();
        _disposed = true;
    }
}`,
    },
    {
      heading: 'The full Dispose pattern (Dispose(bool) + finalizer)',
      content: `When a non-sealed class **directly holds unmanaged resources**, Microsoft recommends the full pattern:

- public void **Dispose()** calls **Dispose(true)** then **GC.SuppressFinalize(this)**.
- protected virtual void **Dispose(bool disposing)**: if disposing is true, release **managed** resources (other IDisposables); always release **unmanaged** resources; set the flag.
- A **finalizer** ~Class() calls **Dispose(false)** as a safety net in case the user forgot to dispose. With false, we must not touch other managed objects (they may already be finalized).
- Derived classes override Dispose(bool) and call base.Dispose(disposing).

Today most unmanaged handles are wrapped in **SafeHandle**, so most classes only need the simple form without a finalizer.`,
    },
    {
      heading: 'Common disposable types and IAsyncDisposable',
      content: `Always use using with: **FileStream, StreamReader, StreamWriter, BinaryReader/Writer, SqlConnection, SqlCommand, SqlDataReader, DbContext (when you create it yourself), Process, Timer, CancellationTokenSource, MemoryStream** (harmless but good habit).

**HttpClient** is disposable, but do **not** create and dispose one per request - that exhausts sockets. Reuse one instance or use IHttpClientFactory.

**IAsyncDisposable** (C# 8 / .NET Core 3+) has ValueTask DisposeAsync() for resources whose cleanup involves I/O (flushing a stream, closing a network connection). Consume it with **await using**:

await using var stream = File.OpenWrite("data.bin");
await stream.WriteAsync(bytes);

In Visual Studio, the code analyzer rule **CA2000** warns when a disposable object is not disposed.`,
      points: [
        'Rule: if a type implements IDisposable and you created it, you dispose it',
        'using works with any type that implements IDisposable (or a ref struct with Dispose())',
        'await using works with IAsyncDisposable',
      ],
    },
  ],
  examples: [
    {
      title: 'using statement vs using declaration (and disposal order)',
      scenario: 'A data-access helper opens connections. We want them closed as soon as the work is done, in the correct order.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it UsingDemo and click Create',
        'Replace Program.cs with the code below',
        'Press F9 on the closing brace of RunReport, press F5 and then F10 to watch Close HrDB print before Close SalesDB',
        'Press Ctrl+F5 to run normally',
      ],
      code: usingOrder,
      csharp: { files: { 'Program.cs': usingOrder }, stdin: '' },
      result: `Open StudentDB
StudentDB runs: SELECT * FROM Students
Close StudentDB
--- using declaration ---
Open SalesDB
Open HrDB
SalesDB runs: SELECT 1
HrDB runs: SELECT 2
Leaving RunReport
Close HrDB
Close SalesDB
Report done`,
      explanation: `The block form disposes StudentDB right at the closing brace, before the next line runs. The using declarations in RunReport keep both connections open until the method ends; then they are disposed in reverse order - HrDB (declared last) first, SalesDB second - just like nested try/finally blocks unwinding. "Report done" prints only after both are closed.`,
    },
    {
      title: 'Dispose runs even when an exception is thrown',
      scenario: 'A print job fails half-way. The printer connection must still be released.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it UsingException',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: usingException,
      csharp: { files: { 'Program.cs': usingException }, stdin: '' },
      result: `Printer: connected
Printer: printing Invoice-1
Printer: disconnected
Caught: Empty document
--- what using compiles to ---
Printer: connected
Printer: printing Salary-Slip
Printer: disconnected`,
      explanation: `Print("") throws. Before control reaches the catch block, the hidden finally generated by using var p runs and prints "disconnected". So "disconnected" appears before "Caught". Invoice-2 is never printed. The second half shows the equivalent hand-written try/finally - this is exactly what the compiler generates for a using.`,
    },
    {
      title: 'The full Dispose pattern with a safety-net finalizer',
      scenario: 'A class wrapping a native buffer. B1 is used correctly with using; B2 is forgotten and only the finalizer saves us.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DisposePattern',
        'Replace Program.cs with the code',
        'Choose Release configuration and press Ctrl+F5',
      ],
      code: disposePattern,
      csharp: { files: { 'Program.cs': disposePattern }, stdin: '' },
      result: `B1: allocated
B1: in use
B1: freeing managed resources
B1: freeing unmanaged handle
B2: allocated
B2: finalizer running (Dispose was forgotten!)
B2: freeing unmanaged handle
Done`,
      explanation: `B1 is disposed by using: Dispose(true) frees managed and unmanaged parts, then GC.SuppressFinalize removes it from the finalization queue, so its finalizer never runs. B2 is never disposed; once Forget() returns it is unreachable, and the forced GC runs its finalizer, which calls Dispose(false) - only the unmanaged handle is released, because managed objects must not be touched from a finalizer. The finalizer is a safety net, not the plan.`,
    },
    {
      title: 'Built-in disposables: StringWriter and StringReader',
      scenario: 'Build CSV text in memory and read it back line by line, disposing both the writer and the reader.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DisposableReaders',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Swap StringWriter/StringReader for StreamWriter/StreamReader with a file path to do the same with a real file',
      ],
      code: stringIo,
      csharp: { files: { 'Program.cs': stringIo }, stdin: '' },
      result: `1: Roll,Name
2: 1,Asha
3: 2,Ravi
Lines read: 3`,
      explanation: `StringWriter and StringReader are TextWriter/TextReader subclasses, which implement IDisposable - exactly like StreamWriter and StreamReader for files. The text ends with a newline, so after the third line ReadLine() returns null and the loop stops; no empty fourth line is read. The writer is disposed at its closing brace, the reader at the end of Main.`,
    },
  ],
  interview: [
    { q: 'What is IDisposable?', a: 'An interface in the System namespace with a single method, void Dispose(), used to release unmanaged or expensive resources deterministically.', level: 'Easy' },
    { q: 'What does the using statement do?', a: 'It calls Dispose() on the object automatically when the block (or scope, for a using declaration) ends, by generating a try/finally, so cleanup happens even if an exception is thrown.', level: 'Easy' },
    { q: 'What is the difference between a using statement and a using declaration?', a: 'The statement has a block and disposes at its closing brace. The declaration (using var x = ...; C# 8+) has no braces and disposes at the end of the enclosing scope.', level: 'Easy' },
    { q: 'In what order are multiple using declarations disposed?', a: 'In reverse order of declaration: the last one declared is disposed first.', level: 'Medium' },
    { q: 'What is the difference between Dispose and Finalize?', a: 'Dispose is called explicitly by code (deterministic) and can release both managed and unmanaged resources. Finalize is called by the GC at an unknown time and should release only unmanaged resources as a safety net.', level: 'Medium' },
    { q: 'Why call GC.SuppressFinalize(this) in Dispose?', a: 'Cleanup is already done, so the finalizer is unnecessary. Suppressing it lets the GC reclaim the object in one cycle instead of putting it on the finalization queue.', level: 'Medium' },
    { q: 'What is the purpose of the bool disposing parameter in Dispose(bool)?', a: 'true means it was called from Dispose(), so managed resources can be disposed too. false means it was called from the finalizer, where other managed objects may already be finalized and must not be touched; only unmanaged resources are released.', level: 'Hard' },
    { q: 'Should Dispose be safe to call multiple times?', a: 'Yes. It must be idempotent - use a _disposed flag and return early on subsequent calls.', level: 'Medium' },
    { q: 'What exception should a disposed object throw when used?', a: 'ObjectDisposedException. In .NET 7+ you can use ObjectDisposedException.ThrowIf(_disposed, this).', level: 'Medium' },
    { q: 'Should you wrap HttpClient in a using block for every request?', a: 'No. Disposing HttpClient per request can exhaust sockets (TIME_WAIT). Reuse a single instance or use IHttpClientFactory in ASP.NET Core.', level: 'Hard' },
    { q: 'What is IAsyncDisposable?', a: 'An interface with ValueTask DisposeAsync() for asynchronous cleanup. It is consumed with await using.', level: 'Medium' },
    { q: 'Should you dispose a DbContext that was injected into your controller?', a: 'No. The DI container created it (scoped) and will dispose it at the end of the request. You only dispose objects you create yourself.', level: 'Hard' },
    { q: 'Output? class D : IDisposable { string n; public D(string n) { this.n = n; } public void Dispose() => Console.Write(n); } ... { using var a = new D("A"); using var b = new D("B"); Console.Write("X"); }', a: 'It prints "XBA". X is written in the scope, then b and a are disposed in reverse order.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a class Timer2 : IDisposable that prints "Timer started" in the constructor and "Timer stopped" in Dispose. Use it in a using block that prints "Working".',
      hint: 'Output should be: Timer started, Working, Timer stopped.',
      solution: `class Timer2 : IDisposable
{
    public Timer2() => Console.WriteLine("Timer started");
    public void Dispose() => Console.WriteLine("Timer stopped");
}

using (new Timer2())
{
    Console.WriteLine("Working");
}`,
    },
    {
      task: 'Write a file logger that owns a StreamWriter. Implement IDisposable so that disposing the logger disposes the writer. Make Dispose idempotent and make Log throw ObjectDisposedException after disposal.',
      hint: 'Keep a private bool _disposed flag.',
      solution: `sealed class FileLogger : IDisposable
{
    private readonly StreamWriter _w;
    private bool _disposed;
    public FileLogger(string path) { _w = new StreamWriter(path, append: true); }

    public void Log(string msg)
    {
        if (_disposed) throw new ObjectDisposedException(nameof(FileLogger));
        _w.WriteLine(msg);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _w.Dispose();
        _disposed = true;
    }
}

using (var log = new FileLogger("app.log")) { log.Log("Started"); }`,
    },
    {
      task: 'Save three student records to students.txt with StreamWriter and read them back with StreamReader, using a using declaration for each.',
      hint: 'Put the writing code in its own block or method so the file is closed before reading.',
      solution: `void Save()
{
    using var w = new StreamWriter("students.txt");
    w.WriteLine("1,Asha,88");
    w.WriteLine("2,Ravi,72");
    w.WriteLine("3,Meena,91");
}   // file flushed and closed here

Save();
using var r = new StreamReader("students.txt");
string? line;
while ((line = r.ReadLine()) != null) Console.WriteLine(line);`,
    },
    {
      task: 'Write an AsyncResource class implementing IAsyncDisposable whose DisposeAsync waits 100 ms and prints "Async cleanup done". Use it with await using.',
      hint: 'public async ValueTask DisposeAsync() { await Task.Delay(100); ... }',
      solution: `class AsyncResource : IAsyncDisposable
{
    public async ValueTask DisposeAsync()
    {
        await Task.Delay(100);
        Console.WriteLine("Async cleanup done");
    }
}

await using (var res = new AsyncResource())
{
    Console.WriteLine("Using resource");
}
// Using resource
// Async cleanup done`,
    },
  ],
  quiz: [
    {
      question: 'How many methods does the IDisposable interface declare?',
      options: ['One: Dispose()', 'Two: Dispose() and Finalize()', 'Three: Open(), Close(), Dispose()', 'None, it is a marker interface'],
      answer: 0,
      explanation: 'IDisposable has a single method: void Dispose().',
    },
    {
      question: 'What does the compiler generate for a using statement?',
      options: ['A while loop', 'A try/catch that swallows exceptions', 'A try/finally that calls Dispose()', 'A call to GC.Collect()'],
      answer: 2,
      explanation: 'using becomes try { ... } finally { obj?.Dispose(); }.',
    },
    {
      question: 'Two using declarations: using var a = ...; using var b = ...; Which is disposed first at the end of the method?',
      options: ['a', 'Both at the same time', 'Neither, the GC disposes them', 'b'],
      answer: 3,
      explanation: 'Disposal happens in reverse order of declaration.',
    },
    {
      question: 'In Dispose(bool disposing), what should happen when disposing is false?',
      options: ['Dispose all managed and unmanaged resources', 'Release only unmanaged resources', 'Throw an exception', 'Call GC.SuppressFinalize'],
      answer: 1,
      explanation: 'false means it is called from the finalizer, so managed objects must not be touched.',
    },
    {
      question: 'Which keyword pair is used with IAsyncDisposable?',
      options: ['async using', 'using async', 'await using', 'dispose await'],
      answer: 2,
      explanation: 'await using var x = ...; calls DisposeAsync() and awaits it.',
    },
  ],
};
