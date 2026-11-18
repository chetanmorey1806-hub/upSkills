const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `// yield return builds an iterator: values are produced one at a time, on demand
foreach (var n in GetNumbers(3))
    Console.WriteLine($"Got {n}");

Console.WriteLine("---");
var lazy = GetNumbers(2);           // nothing runs yet (deferred execution)
Console.WriteLine("Iterator created");
int first = lazy.First();           // runs only until the first yield
Console.WriteLine($"First = {first}");

static IEnumerable<int> GetNumbers(int count)
{
    Console.WriteLine("Start");
    for (int i = 1; i <= count; i++)
    {
        Console.WriteLine($"Yielding {i}");
        yield return i * 10;
    }
    Console.WriteLine("End");
}
`;
const ex2 = `using System.Collections;

// Infinite sequence + Take, yield break, and a custom collection with foreach support
Console.WriteLine(string.Join(", ", Fibonacci().Take(8)));

Console.WriteLine(string.Join(", ", ReadUntilBlank(new[] { "Asha", "Ravi", "", "Meera" })));

var batch = new Classroom("10A");
batch.Add("Asha");
batch.Add("Ravi");
batch.Add("Kiran");
foreach (var student in batch)
    Console.WriteLine(student);
Console.WriteLine($"Count via LINQ: {batch.Count()}");

static IEnumerable<long> Fibonacci()
{
    long a = 0, b = 1;
    while (true)                 // safe: the caller decides how many to take
    {
        yield return a;
        (a, b) = (b, a + b);
    }
}

static IEnumerable<string> ReadUntilBlank(IEnumerable<string> lines)
{
    foreach (var line in lines)
    {
        if (line.Length == 0) yield break;   // stop the sequence early
        yield return line.ToUpper();
    }
}

class Classroom : IEnumerable<string>
{
    private readonly List<string> _students = new();
    public string Name { get; }
    public Classroom(string name) => Name = name;
    public void Add(string student) => _students.Add(student);

    public IEnumerator<string> GetEnumerator()
    {
        for (int i = 0; i < _students.Count; i++)
            yield return $"{Name}-{i + 1}: {_students[i]}";
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
`;
const ex3 = `using System.Runtime.CompilerServices;

// Async streams: IAsyncEnumerable<T> + await foreach (C# 8+)
await foreach (var r in ReadSensorAsync(3))
    Console.WriteLine($"Reading {r.Id}: {r.Value} C");

// Cancelling an async stream
using var cts = new CancellationTokenSource();
try
{
    await foreach (var r in ReadSensorAsync(10).WithCancellation(cts.Token))
    {
        Console.WriteLine($"Live reading {r.Id}");
        if (r.Id == 2) cts.Cancel();        // stop after the second reading
    }
}
catch (OperationCanceledException)
{
    Console.WriteLine("Stream cancelled");
}

static async IAsyncEnumerable<(int Id, int Value)> ReadSensorAsync(
    int count, [EnumeratorCancellation] CancellationToken token = default)
{
    for (int i = 1; i <= count; i++)
    {
        await Task.Delay(200, token);        // simulate waiting for a device / network
        yield return (i, 20 + i * 2);
    }
}
`;
const ex4 = `// Paging through an API with an async stream: the caller sees one flat sequence
int total = 0;
await foreach (var product in GetAllProductsAsync())
{
    total++;
    Console.WriteLine($"{total}. {product}");
}
Console.WriteLine($"Done: {total} products");

static async IAsyncEnumerable<string> GetAllProductsAsync()
{
    int page = 1;
    while (true)
    {
        var items = await FetchPageAsync(page);
        Console.WriteLine($"[fetched page {page}: {items.Length} items]");
        if (items.Length == 0) yield break;
        foreach (var item in items) yield return item;
        page++;
    }
}

// Fake "server": 2 items per page, 5 items in total
static async Task<string[]> FetchPageAsync(int page)
{
    await Task.Delay(100);
    string[] all = { "Pen", "Book", "Bag", "Lamp", "Desk" };
    return all.Skip((page - 1) * 2).Take(2).ToArray();
}
`;

export default {
  id: 'extra-28-iterators-yield-and-async-streams',
  title: 'Iterators, yield return and Async Streams',
  module: 'Extra: Advanced C#',
  extraNo: 28,
  level: 'Intermediate to Advanced',
  duration: '2 hours',
  summary: `An iterator produces a sequence one item at a time, only when the caller asks for the next item. Learn how foreach works with IEnumerable/IEnumerator, how yield return and yield break build iterators with lazy (deferred) execution, how to make your own collections foreach-able, and how C# 8 async streams (IAsyncEnumerable<T> with await foreach) stream data from databases, files and APIs without loading everything into memory.`,
  objectives: [
    'Explain IEnumerable<T>, IEnumerator<T> and how foreach uses them',
    'Write iterator methods with yield return and yield break and trace their lazy execution',
    'Create infinite sequences and custom collections that support foreach and LINQ',
    'Write and consume async streams with IAsyncEnumerable<T> and await foreach',
    'Cancel an async stream with CancellationToken and [EnumeratorCancellation]',
  ],
  theory: [
    {
      heading: 'How foreach really works: IEnumerable and IEnumerator',
      content: `foreach works on any type that has a **GetEnumerator()** method. Usually that means implementing **IEnumerable<T>**.

- **IEnumerable<T>**: "I can give you an enumerator" - one method GetEnumerator().
- **IEnumerator<T>**: the cursor - **MoveNext()** moves to the next item and returns false at the end, **Current** returns the current item, **Dispose()** cleans up.

The compiler turns foreach into roughly this code:`,
      syntax: `using (IEnumerator<int> e = numbers.GetEnumerator())
{
    while (e.MoveNext())
    {
        int n = e.Current;
        Console.WriteLine(n);
    }
}`,
      points: [
        'Arrays, List<T>, Dictionary, string and all LINQ results are IEnumerable<T>',
        'Writing an enumerator class by hand is long - yield return does it for you',
      ],
    },
    {
      heading: 'yield return and yield break',
      content: `A method whose return type is IEnumerable<T> (or IEnumerator<T>) and contains **yield return** is an **iterator**. The compiler converts it into a hidden state-machine class.

- **yield return value;** gives one item to the caller and **pauses** the method at that point. The next MoveNext() continues right after it.
- **yield break;** ends the sequence early (like return for iterators).

Analogy: a tea stall that prepares one cup each time a customer asks, instead of preparing 100 cups in the morning.`,
      syntax: `static IEnumerable<int> Evens(int max)
{
    for (int i = 0; i <= max; i += 2)
        yield return i;
}

static IEnumerable<string> UntilBlank(IEnumerable<string> lines)
{
    foreach (var line in lines)
    {
        if (line == "") yield break;
        yield return line;
    }
}`,
      tip: `Rules: you cannot use yield inside a try block that has a catch, and iterator methods cannot have ref/out parameters. Since C# 13 they can contain unsafe code and ref locals between yields.`,
    },
    {
      heading: 'Lazy (deferred) execution',
      content: `Calling an iterator method runs **none** of its code. The code runs only when someone enumerates the result (foreach, ToList(), First(), Count() ...). This is the same deferred execution you saw in LINQ - LINQ operators like Where and Select are themselves written with yield return.

Consequences:
- **Memory**: items are produced one by one, so you can process a huge file line by line (File.ReadLines is an iterator) or even an **infinite** sequence with Take(n).
- **Early stop**: First() stops after one item - the rest of the method never runs.
- **Repeated work**: enumerating the same iterator twice runs the code twice. Call ToList() once if you need the results many times.
- **Exceptions are delayed**: argument checks inside an iterator only run on the first MoveNext(). Put validation in a normal wrapper method if you need it immediately.`,
    },
    {
      heading: 'Custom collections with yield',
      content: `To make your own class work with foreach and LINQ, implement IEnumerable<T> and write GetEnumerator() with yield return. You also need the non-generic IEnumerable.GetEnumerator() (add using System.Collections) which simply calls the generic one.

This keeps the internal List private while still letting callers loop over the items - good encapsulation.`,
      syntax: `class Classroom : IEnumerable<string>
{
    private readonly List<string> _students = new();
    public IEnumerator<string> GetEnumerator()
    {
        foreach (var s in _students) yield return s;
    }
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}`,
    },
    {
      heading: 'Async streams: IAsyncEnumerable<T> and await foreach (C# 8)',
      content: `A normal iterator cannot await. When each item comes from slow I/O (database rows, API pages, sensor readings, file lines) you want to **await** between items without blocking a thread. Use an **async iterator**:
- return type **IAsyncEnumerable<T>**
- method marked **async**, contains **await** and **yield return**
- consumer uses **await foreach**

EF Core supports it directly: await foreach (var s in db.Students.AsAsyncEnumerable()). ASP.NET Core controllers can return IAsyncEnumerable<T> and the JSON is streamed to the client.

**Cancellation**: add a CancellationToken parameter marked **[EnumeratorCancellation]** (namespace System.Runtime.CompilerServices). The caller passes a token with .WithCancellation(token).`,
      syntax: `static async IAsyncEnumerable<string> ReadLinesAsync(string path,
    [EnumeratorCancellation] CancellationToken ct = default)
{
    using var reader = new StreamReader(path);
    string? line;
    while ((line = await reader.ReadLineAsync(ct)) != null)
        yield return line;
}

await foreach (var line in ReadLinesAsync("log.txt").WithCancellation(cts.Token))
    Console.WriteLine(line);`,
    },
  ],
  examples: [
    {
      title: 'Tracing yield return and deferred execution',
      scenario: 'Print messages inside an iterator to see exactly when its code runs, and how First() stops it early.',
      steps: steps('YieldTrace'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `Start
Yielding 1
Got 10
Yielding 2
Got 20
Yielding 3
Got 30
End
---
Iterator created
Start
Yielding 1
First = 10`,
      explanation: `The iterator and the foreach take turns: each yield return pauses the method and the loop body prints "Got". "End" is printed when MoveNext is called after the last item. For the second part, GetNumbers(2) prints nothing - the code has not started yet. First() calls MoveNext once, receives 10 and disposes the iterator, so "Yielding 2" and "End" never run.`,
    },
    {
      title: 'Infinite sequences, yield break and a custom foreach-able collection',
      scenario: 'Generate Fibonacci numbers lazily, stop reading input at the first blank line, and make a Classroom class work with foreach and LINQ.',
      steps: steps('IteratorCollections'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `0, 1, 1, 2, 3, 5, 8, 13
ASHA, RAVI
10A-1: Asha
10A-2: Ravi
10A-3: Kiran
Count via LINQ: 3`,
      explanation: `Fibonacci() has while (true) but is safe because Take(8) stops asking after 8 items. ReadUntilBlank hits the empty string and executes yield break, so "Meera" is never returned. Classroom implements IEnumerable<string> with a yield-based GetEnumerator, so it works with foreach and with LINQ's Count().`,
    },
    {
      title: 'Async stream with await foreach and cancellation',
      scenario: 'A temperature sensor sends a reading every 200 ms. Read three values, then read a live stream and cancel it after the second value.',
      steps: steps('AsyncStreams'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Reading 1: 22 C
Reading 2: 24 C
Reading 3: 26 C
Live reading 1
Live reading 2
Stream cancelled`,
      explanation: `Each item is produced after await Task.Delay(200), so the readings appear one by one about 200 ms apart without blocking a thread. WithCancellation passes the token into the iterator through the [EnumeratorCancellation] parameter. After reading 2 we call Cancel(); the next Task.Delay sees the cancelled token and throws TaskCanceledException (a subclass of OperationCanceledException), which ends the await foreach and is caught.`,
    },
    {
      title: 'Streaming paged API results as one sequence',
      scenario: 'A product API returns 2 items per page. Hide the paging inside an async iterator so the caller simply loops over all products.',
      steps: steps('PagedAsyncStream'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `[fetched page 1: 2 items]
1. Pen
2. Book
[fetched page 2: 2 items]
3. Bag
4. Lamp
[fetched page 3: 1 items]
5. Desk
[fetched page 4: 0 items]
Done: 5 products`,
      explanation: `The next page is fetched only after the caller has processed every item of the current page - that is lazy streaming. Page 3 has only "Desk"; page 4 is empty, so the iterator executes yield break and the await foreach ends. The caller never sees page numbers at all.`,
    },
  ],
  interview: [
    { q: 'What is an iterator in C#?', a: 'A method, property getter or operator that uses yield return / yield break and returns IEnumerable<T>, IEnumerator<T> or IAsyncEnumerable<T>. The compiler generates a state machine that produces items on demand.', level: 'Easy' },
    { q: 'Difference between IEnumerable<T> and IEnumerator<T>?', a: 'IEnumerable<T> is a sequence that can create enumerators (GetEnumerator). IEnumerator<T> is the cursor with MoveNext(), Current and Dispose() that walks through the sequence once.', level: 'Easy' },
    { q: 'What does yield break do?', a: 'It ends the iteration; MoveNext() returns false. Code after yield break in that path does not run.', level: 'Easy' },
    { q: 'What is deferred execution?', a: 'The iterator body (or LINQ query) does not run when called; it runs when the result is enumerated, and it runs again for every new enumeration.', level: 'Medium' },
    { q: 'Output? IEnumerable<int> F() { Console.Write("A"); yield return 1; } var x = F(); Console.Write("B"); foreach (var i in x) Console.Write(i);', a: 'B A 1 printed as "BA1". Calling F() does not run the body; the foreach starts it.', level: 'Medium' },
    { q: 'Why might argument validation in an iterator be a problem?', a: 'The check runs only when enumeration starts, not when the method is called, so the exception appears later in unexpected code. Use a non-iterator wrapper method that validates and then calls a private iterator (or a local function).', level: 'Hard' },
    { q: 'What is IAsyncEnumerable<T>?', a: 'The async version of IEnumerable<T> (C# 8 / .NET Core 3.0). Its enumerator has MoveNextAsync() returning ValueTask<bool>, so items can be awaited one by one with await foreach.', level: 'Medium' },
    { q: 'How do you cancel an async stream?', a: 'Add a CancellationToken parameter marked [EnumeratorCancellation] to the async iterator and pass a token either directly or via .WithCancellation(token) at the await foreach site.', level: 'Hard' },
    { q: 'Can you use yield inside try/catch?', a: 'yield return is not allowed inside a try block that has a catch clause, or inside catch/finally blocks. It is allowed inside try with only a finally.', level: 'Hard' },
    { q: 'When should you call ToList() on an iterator result?', a: 'When you will enumerate it more than once, need Count/index access, or need the data to be fixed at a point in time (for example before the DbContext is disposed).', level: 'Medium' },
    { q: 'How can an ASP.NET Core API stream results?', a: 'Return IAsyncEnumerable<T> from the action (for example db.Products.AsAsyncEnumerable()). System.Text.Json writes the array as items arrive instead of buffering the whole list.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write an iterator Range(int start, int end, int step) that yields start, start+step, ... up to end. Print Range(1, 20, 4).',
      hint: 'for (int i = start; i <= end; i += step) yield return i;',
      solution: `Console.WriteLine(string.Join(" ", Range(1, 20, 4)));   // 1 5 9 13 17

static IEnumerable<int> Range(int start, int end, int step)
{
    for (int i = start; i <= end; i += step)
        yield return i;
}`,
    },
    {
      task: 'Write an infinite iterator Primes() and print the first 10 prime numbers using Take.',
      hint: 'Loop n = 2, 3, 4 ... and yield n when no divisor from 2 to sqrt(n) divides it.',
      solution: `Console.WriteLine(string.Join(", ", Primes().Take(10)));
// 2, 3, 5, 7, 11, 13, 17, 19, 23, 29

static IEnumerable<int> Primes()
{
    for (int n = 2; ; n++)
    {
        bool prime = true;
        for (int d = 2; d * d <= n; d++)
            if (n % d == 0) { prime = false; break; }
        if (prime) yield return n;
    }
}`,
    },
    {
      task: 'Create a Playlist class that stores song names and implements IEnumerable<string> so that foreach prints "Track 1: name".',
      hint: 'Use yield return inside GetEnumerator and implement the non-generic version too (using System.Collections).',
      solution: `using System.Collections;
var p = new Playlist { "Song A", "Song B" };
foreach (var s in p) Console.WriteLine(s);

class Playlist : IEnumerable<string>
{
    private readonly List<string> _songs = new();
    public void Add(string s) => _songs.Add(s);
    public IEnumerator<string> GetEnumerator()
    {
        for (int i = 0; i < _songs.Count; i++) yield return $"Track {i + 1}: {_songs[i]}";
    }
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}`,
    },
    {
      task: 'Write an async iterator CountdownAsync(int from) that waits 500 ms between numbers and prints a countdown with await foreach, then "Go!".',
      hint: 'static async IAsyncEnumerable<int> with await Task.Delay(500) before each yield.',
      solution: `await foreach (var n in CountdownAsync(3))
    Console.WriteLine(n);
Console.WriteLine("Go!");

static async IAsyncEnumerable<int> CountdownAsync(int from)
{
    for (int i = from; i >= 1; i--)
    {
        await Task.Delay(500);
        yield return i;
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'When does the body of an iterator method start running?',
      options: ['When the method is called', 'When the first MoveNext() is called (enumeration starts)', 'When the program starts', 'Only when ToList() is called'],
      answer: 1,
      explanation: 'Iterators use deferred execution; calling the method only creates the state machine.',
    },
    {
      question: 'Which statement ends an iterator early?',
      options: ['return null;', 'break yield;', 'yield break;', 'yield return default;'],
      answer: 2,
      explanation: 'yield break stops the sequence; MoveNext then returns false.',
    },
    {
      question: 'Which return type is used for an async iterator?',
      options: ['Task<IEnumerable<T>>', 'IEnumerable<Task<T>>', 'ValueTask<T>', 'IAsyncEnumerable<T>'],
      answer: 3,
      explanation: 'Async iterators return IAsyncEnumerable<T> and are consumed with await foreach.',
    },
    {
      question: 'Fibonacci() contains while (true) { yield return ...; }. What does Fibonacci().Take(5).ToList() do?',
      options: ['Returns 5 numbers', 'Runs forever', 'Throws StackOverflowException', 'Does not compile'],
      answer: 0,
      explanation: 'Take stops requesting items after 5, so the infinite loop is never fully executed.',
    },
    {
      question: 'Which attribute lets WithCancellation(token) pass its token into an async iterator?',
      options: ['[CallerMemberName]', '[EnumeratorCancellation]', '[AsyncStateMachine]', '[Cancelable]'],
      answer: 1,
      explanation: '[EnumeratorCancellation] on a CancellationToken parameter receives the token supplied by WithCancellation.',
    },
  ],
};
