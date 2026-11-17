const finalizerDemo = `using System;
using System.Runtime.CompilerServices;

class FileTracker
{
    private readonly string _name;

    public FileTracker(string name)
    {
        _name = name;
        Console.WriteLine($"Constructor: {_name} opened");
    }

    ~FileTracker()   // destructor = finalizer
    {
        Console.WriteLine($"Destructor: {_name} cleaned up by GC");
    }
}

class Program
{
    [MethodImpl(MethodImplOptions.NoInlining)]
    static void UseTracker()
    {
        var t = new FileTracker("report.txt");
        Console.WriteLine("Working with the tracker...");
    }   // t goes out of scope here, the object becomes unreachable

    static void Main()
    {
        UseTracker();
        Console.WriteLine("Back in Main, object is now garbage");

        GC.Collect();                    // force a collection (demo only!)
        GC.WaitForPendingFinalizers();   // wait until the finalizer thread has finished

        Console.WriteLine("End of Main");
    }
}
`;

const generationsDemo = `using System;

class Program
{
    static void Main()
    {
        var data = new byte[1000];
        Console.WriteLine($"After new: generation {GC.GetGeneration(data)}");

        GC.Collect();
        Console.WriteLine($"After 1st GC: generation {GC.GetGeneration(data)}");

        GC.Collect();
        Console.WriteLine($"After 2nd GC: generation {GC.GetGeneration(data)}");

        GC.Collect();
        Console.WriteLine($"After 3rd GC: generation {GC.GetGeneration(data)}");

        var big = new byte[100_000];   // 85,000 bytes or more -> Large Object Heap
        Console.WriteLine($"Large array generation: {GC.GetGeneration(big)}");
        Console.WriteLine($"Max generation: {GC.MaxGeneration}");

        GC.KeepAlive(data);
        GC.KeepAlive(big);
    }
}
`;

const counterDemo = `using System;
using System.Runtime.CompilerServices;

class Visitor
{
    public static int Created;
    public static int Finalized;

    public Visitor() { Created++; }
    ~Visitor() { Finalized++; }
}

class Program
{
    [MethodImpl(MethodImplOptions.NoInlining)]
    static void CreateVisitors(int count)
    {
        for (int i = 0; i < count; i++)
        {
            var v = new Visitor();   // each object is garbage right after this line
        }
    }

    static void Main()
    {
        CreateVisitors(1000);
        Console.WriteLine($"Created: {Visitor.Created}");
        Console.WriteLine($"Finalized before GC: {Visitor.Finalized}");

        GC.Collect();
        GC.WaitForPendingFinalizers();

        Console.WriteLine($"Finalized after GC: {Visitor.Finalized}");
    }
}
`;

const reachabilityDemo = `using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

class Photo
{
    public string Name { get; }
    public Photo(string name) { Name = name; }
    ~Photo() { Console.WriteLine($"Collected: {Name}"); }
}

class Program
{
    static readonly List<Photo> Cache = new();   // a static root keeps objects alive

    [MethodImpl(MethodImplOptions.NoInlining)]
    static void Load()
    {
        Cache.Add(new Photo("cached.jpg"));       // reachable from a static field
        var temp = new Photo("temp.jpg");         // reachable only from this local
        Console.WriteLine($"Loaded {temp.Name}");
    }

    static void Main()
    {
        Load();
        GC.Collect();
        GC.WaitForPendingFinalizers();
        Console.WriteLine($"Still in cache: {Cache[0].Name}");
    }
}
`;

export default {
  id: 'extra-06-destructor-and-garbage-collection',
  title: 'Destructor (Finalizer) and Garbage Collection',
  module: 'Extra: OOP Concepts',
  extraNo: 6,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `In C# you never free memory yourself - the Garbage Collector (GC) finds objects that are no longer reachable and reclaims their memory. A destructor (correctly called a finalizer, written ~ClassName()) is a last-chance cleanup method the GC may run before reclaiming an object. Learn how the managed heap, roots, generations 0/1/2 and the Large Object Heap work, when finalizers run (and why you cannot rely on them), and why IDisposable is the right tool for deterministic cleanup.`,
  objectives: [
    'Explain how the .NET garbage collector decides an object is garbage (reachability from roots)',
    'Describe generations 0, 1, 2 and the Large Object Heap',
    'Write a finalizer with ~ClassName() and understand its rules and costs',
    'Use GC.Collect, GC.WaitForPendingFinalizers, GC.GetGeneration and GC.SuppressFinalize correctly (and know when not to)',
    'Explain why finalizers are not a replacement for Dispose()',
  ],
  theory: [
    {
      heading: 'Memory management in .NET: the managed heap',
      content: `Every object you create with **new** lives on the **managed heap**. Local value-type variables live on the stack (or inside the object that contains them). In C/C++ you must call free/delete; in C# the **Garbage Collector** does it for you.

**Real-world analogy:** A housekeeping team in an office. You never throw away your own papers; the cleaners come periodically and remove everything that nobody is using any more (no name tag, not on anyone's desk). They come when the bins fill up, not exactly when you leave a paper.

Benefits: no memory leaks from forgetting to free, no "use after free" crashes, fast allocation (just move a pointer).`,
      points: [
        'Allocation: new -> object placed on the managed heap',
        'Collection: GC runs automatically when generation 0 fills up, when memory is low, or when GC.Collect() is called',
        'Timing is non-deterministic - you do not know exactly when an object will be collected',
      ],
    },
    {
      heading: 'How the GC finds garbage: roots and reachability',
      content: `The GC starts from **roots** and marks every object it can reach:

- local variables and parameters of methods currently running
- **static fields**
- CPU registers, GC handles, objects waiting for finalization

Any object **not reachable** from a root is garbage. The GC then **compacts** the heap (moves live objects together) and updates references.

Important consequences:
- Setting a variable to null is rarely needed - when the method ends, its locals are no longer roots.
- An object referenced from a **static** collection lives until you remove it - the most common "memory leak" in .NET.
- Event subscriptions (publisher.Event += subscriber.Handler) keep the subscriber alive as long as the publisher lives.`,
    },
    {
      heading: 'Generations 0, 1, 2 and the Large Object Heap',
      content: `The GC is **generational**, based on the observation that most objects die young:

| Generation | Holds | Collected |
|---|---|---|
| **Gen 0** | newly created objects | very often, very fast |
| **Gen 1** | objects that survived one GC (buffer) | less often |
| **Gen 2** | long-lived objects (caches, singletons, statics) | rarely (full GC) |
| **LOH** | objects of **85,000 bytes or more** (big arrays) | with gen 2 |

When an object survives a collection it is **promoted** to the next generation. GC.GetGeneration(obj) tells you its current generation and GC.MaxGeneration is 2. GC.Collect() with no arguments performs a full, blocking collection of all generations.`,
      tip: 'Do not call GC.Collect() in production code. The GC tunes itself; forcing collections usually makes performance worse. It is fine in demos and some tests.',
    },
    {
      heading: 'Destructor (Finalizer) syntax and rules',
      content: `A **destructor** in C# is written like a constructor with a tilde (~). Its real name in .NET is a **finalizer** (the compiler turns it into an override of Object.Finalize()).

Rules:
- Allowed only in **classes** (including record classes) - **structs cannot have finalizers**.
- **No parameters, no access modifier, no return type**, cannot be overloaded or called directly.
- Only **one** per class. It automatically calls the base class finalizer.
- Runs on a separate **finalizer thread**, at an unknown time after the object becomes unreachable.
- In **.NET Core / .NET 5+** finalizers are **not** run when the process exits.

Costs: objects with finalizers survive at least one extra GC (they are put in a finalization queue and promoted), so they are slower and use memory longer.`,
      syntax: `class FileTracker
{
    ~FileTracker()
    {
        // release UNMANAGED resources only (handles, native memory)
    }
}

// The compiler generates roughly:
// protected override void Finalize()
// {
//     try { /* your code */ }
//     finally { base.Finalize(); }
// }`,
    },
    {
      heading: 'When to use a finalizer - and when to use Dispose instead',
      content: `**Almost never write a finalizer.** Use one only if your class **directly owns an unmanaged resource** (an IntPtr handle, native memory). Even then, prefer wrapping the handle in a **SafeHandle**, which has its own finalizer.

For everything else - files, database connections, network streams - the class should implement **IDisposable** and callers should use a **using** statement. That cleanup happens **immediately and deterministically**.

When a class has both, Dispose() should call **GC.SuppressFinalize(this)** so the GC does not run the now-pointless finalizer (see the next topic: IDisposable and Dispose()).

| | Finalizer (~Class) | Dispose() |
|---|---|---|
| Who calls it | the GC (finalizer thread) | your code / using |
| When | unknown, maybe never | exactly when you decide |
| Cleans | unmanaged resources only | managed and unmanaged |
| Cost | slows down GC | none |`,
      points: [
        'Never access other managed objects in a finalizer - they may already be finalized',
        'Never throw exceptions from a finalizer - it crashes the process',
        'GC.WaitForPendingFinalizers() blocks until the finalizer queue is empty',
      ],
    },
  ],
  examples: [
    {
      title: 'Watching a finalizer run',
      scenario: 'A class that prints a message from its constructor and destructor so you can see when the GC finalizes it.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it GcDemo and click Create',
        'Replace Program.cs with the code below',
        'Set the configuration to Release in the toolbar (Debug builds may keep objects alive longer while debugging)',
        'Press Ctrl+F5',
      ],
      code: finalizerDemo,
      csharp: { files: { 'Program.cs': finalizerDemo }, stdin: '' },
      result: `Constructor: report.txt opened
Working with the tracker...
Back in Main, object is now garbage
Destructor: report.txt cleaned up by GC
End of Main`,
      explanation: `The object is created inside UseTracker. NoInlining makes sure that method really ends, so its local t is no longer a root. GC.Collect() finds the object unreachable; because it has a finalizer it is placed on the finalization queue, and WaitForPendingFinalizers() blocks Main until the finalizer thread prints the Destructor line. Without these two GC calls the destructor line would most likely never print, because .NET does not run finalizers at process exit. With a debugger attached (F5) the JIT may extend lifetimes, so the timing can differ.`,
    },
    {
      title: 'Generations: promotion and the Large Object Heap',
      scenario: 'Observe how a surviving object moves from generation 0 to 1 to 2, and where a big array is allocated.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GcGenerations',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Optional: open Debug > Windows > Show Diagnostic Tools (Ctrl+Alt+F2) while running with F5 to see GC events',
      ],
      code: generationsDemo,
      csharp: { files: { 'Program.cs': generationsDemo }, stdin: '' },
      result: `After new: generation 0
After 1st GC: generation 1
After 2nd GC: generation 2
After 3rd GC: generation 2
Large array generation: 2
Max generation: 2`,
      explanation: `data is still used later (KeepAlive), so it survives every collection and is promoted 0 -> 1 -> 2. Generation 2 is the maximum, so a third GC leaves it at 2. The 100,000-byte array is over the 85,000-byte threshold and goes straight to the Large Object Heap, which is logically part of generation 2. (Under unusual GC configuration settings these numbers could differ.)`,
    },
    {
      title: 'Counting finalized objects',
      scenario: 'Create 1000 short-lived objects, then force a collection and count how many finalizers ran.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GcCounter',
        'Replace Program.cs with the code',
        'Select Release configuration and press Ctrl+F5',
      ],
      code: counterDemo,
      csharp: { files: { 'Program.cs': counterDemo }, stdin: '' },
      result: `Created: 1000
Finalized before GC: 0
Finalized after GC: 1000`,
      explanation: `1000 tiny objects (about 24 KB) do not fill generation 0, so normally no GC has happened yet and no finalizer has run - "Finalized before GC: 0". After the forced full collection all 1000 unreachable Visitor objects are queued, and WaitForPendingFinalizers waits until all their finalizers finish. In a real app the "before" number could be non-zero if a GC happened to occur earlier - this is exactly why finalizer timing is called non-deterministic.`,
    },
    {
      title: 'Roots keep objects alive: static cache vs local variable',
      scenario: 'An image viewer caches one photo in a static list and uses another only temporarily. Only the temporary one is collected.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it GcRoots',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: reachabilityDemo,
      csharp: { files: { 'Program.cs': reachabilityDemo }, stdin: '' },
      result: `Loaded temp.jpg
Collected: temp.jpg
Still in cache: cached.jpg`,
      explanation: `After Load() returns, temp.jpg is referenced by nothing, so the GC finalizes and collects it. cached.jpg is referenced by the static Cache list - a static field is a GC root - so it survives every collection. This is how "memory leaks" happen in .NET: objects stay reachable from statics, caches or event handlers longer than you intended.`,
    },
  ],
  interview: [
    { q: 'What is garbage collection in .NET?', a: 'An automatic memory manager in the CLR that finds objects that are no longer reachable from any root and reclaims their memory, then compacts the heap.', level: 'Easy' },
    { q: 'What is a destructor in C#?', a: 'A method declared as ~ClassName() with no parameters or modifiers. It is compiled into an override of Object.Finalize and is called by the GC before the object\'s memory is reclaimed. It is properly called a finalizer.', level: 'Easy' },
    { q: 'Can you call a destructor explicitly or overload it?', a: 'No. A class can have only one destructor, it takes no parameters, has no access modifier and only the GC can call it.', level: 'Easy' },
    { q: 'Can a struct have a destructor?', a: 'No. Finalizers are only allowed in classes.', level: 'Medium' },
    { q: 'What are GC generations?', a: 'Gen 0 holds new objects and is collected often; survivors are promoted to Gen 1 and then Gen 2, which holds long-lived objects and is collected rarely. Large objects (85,000 bytes or more) go to the Large Object Heap, collected with Gen 2.', level: 'Medium' },
    { q: 'What are GC roots?', a: 'Starting points for reachability: local variables and parameters of running methods, static fields, CPU registers, GC handles and the finalization queue.', level: 'Medium' },
    { q: 'Why are finalizers expensive?', a: 'Objects with finalizers are tracked in a finalization queue, survive at least one extra collection (they get promoted) and need the finalizer thread to run, so memory is freed later and GC does more work.', level: 'Hard' },
    { q: 'What is the difference between Finalize and Dispose?', a: 'Finalize is called by the GC at a non-deterministic time and should only release unmanaged resources. Dispose is called by your code (or using) immediately, can release managed and unmanaged resources, and usually calls GC.SuppressFinalize.', level: 'Medium' },
    { q: 'What does GC.SuppressFinalize(this) do?', a: 'It tells the GC not to call the object\'s finalizer because cleanup has already been done in Dispose, so the object can be collected faster.', level: 'Medium' },
    { q: 'Should you call GC.Collect() in production code?', a: 'Almost never. The GC is self-tuning; forcing collections pauses all threads and promotes objects unnecessarily. It is acceptable in tests, benchmarks or very special scenarios.', level: 'Medium' },
    { q: 'Are finalizers guaranteed to run in .NET 8?', a: 'No. In .NET Core and .NET 5+ finalizers are not run on process exit, and objects that stay reachable are never finalized. Never put essential logic (saving data) in a finalizer.', level: 'Hard' },
    { q: 'Can you have a memory leak in .NET?', a: 'Yes, a logical leak: objects kept reachable unintentionally, for example in static collections, caches without eviction, or event handlers that are never unsubscribed. Unmanaged memory not released is also a leak.', level: 'Hard' },
    { q: 'Output? var a = new byte[10]; GC.Collect(); Console.Write(GC.GetGeneration(a)); GC.Collect(); Console.Write(GC.GetGeneration(a)); GC.KeepAlive(a);', a: 'It prints "12". The array survives the first GC and is promoted from gen 0 to gen 1, then to gen 2 after the second collection.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a class Session with a constructor printing "Session started" and a destructor printing "Session finalized". Create it in a separate method and force a GC so the destructor message appears before "Program ends".',
      hint: 'Use [MethodImpl(MethodImplOptions.NoInlining)], GC.Collect() and GC.WaitForPendingFinalizers().',
      solution: `class Session
{
    public Session() => Console.WriteLine("Session started");
    ~Session() => Console.WriteLine("Session finalized");
}

[MethodImpl(MethodImplOptions.NoInlining)]
static void Open() { var s = new Session(); }

Open();
GC.Collect();
GC.WaitForPendingFinalizers();
Console.WriteLine("Program ends");`,
    },
    {
      task: 'Print the generation of a string array after creation and after two forced collections. Then allocate an int[30000] and print its generation. Explain each number.',
      hint: 'int is 4 bytes, so 30000 ints = 120,000 bytes, which is over the LOH threshold.',
      solution: `var names = new string[] { "A", "B" };
Console.WriteLine(GC.GetGeneration(names));   // 0
GC.Collect(); GC.Collect();
Console.WriteLine(GC.GetGeneration(names));   // 2 (promoted twice)
var big = new int[30000];
Console.WriteLine(GC.GetGeneration(big));     // 2 (Large Object Heap)
GC.KeepAlive(names);`,
    },
    {
      task: 'Demonstrate a logical memory leak: subscribe 3 Listener objects to a static event and show that they are NOT collected after a forced GC. Then unsubscribe them and show they are collected.',
      hint: 'Give Listener a finalizer that increments a static counter.',
      solution: `class Publisher { public static event Action? Tick; }
class Listener
{
    public static int Collected;
    public void Subscribe() => Publisher.Tick += OnTick;
    public void Unsubscribe() => Publisher.Tick -= OnTick;
    void OnTick() { }
    ~Listener() => Collected++;
}

// Create and subscribe 3 listeners in a NoInlining method, keep them in a list for unsubscribing later.
// After GC.Collect(): Collected == 0 (the static event references them).
// After calling Unsubscribe on each, clearing the list and GC.Collect() + WaitForPendingFinalizers(): Collected == 3.`,
    },
    {
      task: 'Explain in 4-5 lines why the following class is a bad idea: class Order { ~Order() { SaveToDatabase(); } }',
      hint: 'Think about timing, guarantees and threads.',
      solution: `1. The finalizer runs at an unknown time, maybe minutes later or never (not at process exit in .NET 5+).
2. It runs on the finalizer thread, so exceptions there crash the process.
3. Other managed objects (like the DbContext) may already be finalized.
4. Every Order now costs an extra GC cycle.
Save explicitly (or in Dispose) instead.`,
    },
  ],
  quiz: [
    {
      question: 'How is a destructor declared in C#?',
      options: ['public void Destroy()', '~ClassName()', 'protected Finalize()', 'delete ClassName()'],
      answer: 1,
      explanation: 'A destructor uses the tilde syntax ~ClassName() with no modifiers or parameters.',
    },
    {
      question: 'Objects of what size are allocated on the Large Object Heap?',
      options: ['1 KB or more', '64 KB or more', '1 MB or more', '85,000 bytes or more'],
      answer: 3,
      explanation: 'The LOH threshold is 85,000 bytes.',
    },
    {
      question: 'Which of these keeps an object alive (is a GC root)?',
      options: ['A static field referencing it', 'A local variable of a method that has already returned', 'A comment mentioning it', 'An object that only references itself'],
      answer: 0,
      explanation: 'Static fields are roots for the whole life of the application.',
    },
    {
      question: 'What does GC.WaitForPendingFinalizers() do?',
      options: ['Starts a garbage collection', 'Prevents finalizers from running', 'Blocks until the finalizer queue has been processed', 'Deletes all objects with finalizers immediately'],
      answer: 2,
      explanation: 'It waits for the finalizer thread to run the queued finalizers; it does not start a GC itself.',
    },
    {
      question: 'Which is the correct way to release a database connection at a known point in time?',
      options: ['Write a destructor', 'Set the variable to null', 'Call GC.Collect()', 'Call Dispose() or use a using statement'],
      answer: 3,
      explanation: 'Dispose/using gives deterministic cleanup; finalizers and GC timing are non-deterministic.',
    },
  ],
};
