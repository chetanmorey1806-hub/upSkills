const ex1 = `using System;
using System.Threading.Tasks;

Console.WriteLine("1. Start making breakfast");

Task<string> teaTask = MakeTeaAsync();          // starts the work, does not wait
Console.WriteLine("3. While tea is brewing, toast bread");

string tea = await teaTask;                     // now wait for the result
Console.WriteLine("5. " + tea);

int total = await AddAsync(10, 20);
Console.WriteLine("6. Sum from Task<int>: " + total);

static async Task<string> MakeTeaAsync()
{
    Console.WriteLine("2. Boiling water...");
    await Task.Delay(500);                      // non-blocking wait
    Console.WriteLine("4. Water boiled");
    return "Tea is ready";
}

static async Task<int> AddAsync(int a, int b)
{
    await Task.Delay(100);
    return a + b;
}`;

const ex2 = `using System;
using System.IO;
using System.Threading.Tasks;

string path = "marks.txt";

await File.WriteAllLinesAsync(path, new[] { "Asha,85", "Ravi,72", "Meena,91" });
Console.WriteLine("File written asynchronously");

string[] lines = await File.ReadAllLinesAsync(path);
Console.WriteLine("Lines: " + lines.Length);

int total = await SumMarksAsync(path);
Console.WriteLine("Total marks: " + total);

File.Delete(path);

static async Task<int> SumMarksAsync(string path)
{
    int total = 0;
    using var reader = new StreamReader(path);
    string? line;
    while ((line = await reader.ReadLineAsync()) != null)   // thread is free while the disk works
    {
        string[] parts = line.Split(',');
        total += int.Parse(parts[1]);
        Console.WriteLine("Read " + parts[0]);
    }
    return total;
}`;

const ex3 = `using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

string[] files = { "classA.txt", "classB.txt", "classC.txt" };
await File.WriteAllTextAsync(files[0], "85 72 91");
await File.WriteAllTextAsync(files[1], "60 40");
await File.WriteAllTextAsync(files[2], "99 88 77 66");

var sw = Stopwatch.StartNew();

// Start all three reads at once, then wait for all of them
Task<int>[] tasks = files.Select(f => SumFileAsync(f)).ToArray();
int[] sums = await Task.WhenAll(tasks);

sw.Stop();

for (int i = 0; i < files.Length; i++)
    Console.WriteLine($"{files[i]}: total {sums[i]}");
Console.WriteLine("Grand total: " + sums.Sum());
Console.WriteLine("Finished in under 2 seconds (sequential needs 3): " + (sw.ElapsedMilliseconds < 2000));

foreach (string f in files)
    File.Delete(f);

static async Task<int> SumFileAsync(string path)
{
    string text = await File.ReadAllTextAsync(path);
    await Task.Delay(1000);             // simulate a slow disk / network share
    return text.Split(' ').Select(int.Parse).Sum();
}`;

const ex4 = `using System;
using System.Threading;
using System.Threading.Tasks;

// 1. User cancels after part 3
using var cts = new CancellationTokenSource();
try
{
    await DownloadAsync(cts.Token, part =>
    {
        if (part == 3)
        {
            Console.WriteLine("User clicked Cancel");
            cts.Cancel();
        }
    });
}
catch (OperationCanceledException ex)
{
    Console.WriteLine("Cancelled: " + ex.GetType().Name);
}

// 2. Timeout: cancel automatically after 200 ms
using var timeout = new CancellationTokenSource(TimeSpan.FromMilliseconds(200));
try
{
    await Task.Delay(5000, timeout.Token);
    Console.WriteLine("Finished slow work");
}
catch (OperationCanceledException)
{
    Console.WriteLine("Slow work timed out after 200 ms");
}
Console.WriteLine("IsCancellationRequested: " + timeout.IsCancellationRequested);

static async Task DownloadAsync(CancellationToken token, Action<int> onPartDone)
{
    for (int i = 1; i <= 5; i++)
    {
        token.ThrowIfCancellationRequested();
        Console.WriteLine($"Downloading part {i}/5");
        onPartDone(i);
        await Task.Delay(100, token);   // throws TaskCanceledException if cancelled
    }
    Console.WriteLine("Download complete");
}`;

const ex5 = `using System;
using System.Threading;
using System.Threading.Tasks;

// 1. A classic Thread
Thread worker = new Thread(() =>
{
    for (int i = 1; i <= 3; i++)
        Console.WriteLine($"Worker thread step {i}");
});
worker.Start();
worker.Join();                       // block until the thread finishes
Console.WriteLine("Main thread continues after Join");

// 2. Four tasks update one counter - lock prevents lost updates
int counter = 0;
object gate = new object();
Task[] tasks = new Task[4];
for (int t = 0; t < 4; t++)
{
    tasks[t] = Task.Run(() =>
    {
        for (int i = 0; i < 10000; i++)
        {
            lock (gate)
            {
                counter++;
            }
        }
    });
}
await Task.WhenAll(tasks);
Console.WriteLine("Counter with lock: " + counter);

// 3. Interlocked: atomic increment without lock
int atomic = 0;
Parallel.For(0, 40000, _ => Interlocked.Increment(ref atomic));
Console.WriteLine("Counter with Interlocked: " + atomic);

// 4. Task.Run moves CPU work to the thread pool and returns Task<T>
int result = await Task.Run(() => SumTo(100));
Console.WriteLine("Task.Run result: " + result);

static int SumTo(int n)
{
    int s = 0;
    for (int i = 1; i <= n; i++) s += i;
    return s;
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8 or .NET 10 (LTS), click Create`,
  'Replace all code in Program.cs with the code below (top-level statements may use await directly - the compiler generates an async Main)',
  'Press Ctrl+F5 to run. While debugging (F5) open Debug > Windows > Tasks and Debug > Windows > Threads to watch tasks and threads',
];

export default {
  id: 'day-038-async-await-task-cancellation-threading',
  title: 'Async, Await, Task, Task<T>, CancellationToken, Threading Basics',
  module: 'Module 3: Advanced C# Programming',
  day: 38,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Slow operations (files, databases, web APIs) should not block your program. Learn processes vs threads, the thread pool, Task and Task<T>, the async and await keywords and how control flows through them, async file reading, running work concurrently with Task.WhenAll, cancelling with CancellationToken, and threading basics: Thread, Join, Task.Run, race conditions, lock and Interlocked. Practical: asynchronous file reading.',
  objectives: [
    'Explain synchronous vs asynchronous code and process vs thread vs thread pool',
    'Write async methods returning Task and Task<T> and consume them with await',
    'Read and write files asynchronously with File.*Async and StreamReader.ReadLineAsync',
    'Run independent operations concurrently with Task.WhenAll',
    'Cancel long-running work with CancellationTokenSource and CancellationToken',
    'Create threads, avoid race conditions with lock / Interlocked, and use Task.Run for CPU work',
  ],
  theory: [
    {
      heading: 'Synchronous vs asynchronous',
      content: 'Synchronous code does one thing at a time and waits for each step to finish. If a step is slow (reading a big file, calling an API, querying SQL Server) the thread just sits there, blocked. Asynchronous code starts the slow operation, frees the thread to do other work, and continues when the result is ready. In a desktop app this keeps the UI responsive; in ASP.NET Core it lets one server handle thousands of requests with a few threads.',
      tip: 'Analogy: a synchronous waiter takes your order, stands in the kitchen until the food is ready, then serves the next table. An asynchronous waiter gives the order to the kitchen, serves other tables, and comes back when the kitchen rings the bell. Same waiter, many more customers.',
      points: [
        'I/O-bound work (disk, network, database) -> use async/await, no extra thread needed while waiting',
        'CPU-bound work (heavy calculation, image processing) -> use Task.Run / Parallel to use other cores',
      ],
    },
    {
      heading: 'Process, thread, thread pool',
      content: 'A process is a running program with its own memory (your .exe). A thread is a path of execution inside a process; every process starts with one main thread and can create more. All threads of a process share its memory, which is powerful but dangerous (race conditions). Creating threads is expensive, so .NET keeps a thread pool of reusable worker threads; Task.Run and most async continuations use it.',
      syntax: `var t = new Thread(() => Console.WriteLine("Hi from thread"));
t.Start();          // begins running in parallel
t.Join();           // wait for it to finish
Thread.Sleep(500);  // BLOCKS the current thread (avoid in async code)`,
    },
    {
      heading: 'Task and Task<T>',
      content: 'A Task represents an operation that will complete in the future - like a receipt or token number you get at a food counter. Task means "work with no result" (like void); Task<T> means "work that will produce a T". You can check its Status, wait for it with await, combine many tasks with Task.WhenAll (wait for all) or Task.WhenAny (wait for the first). Task.Delay(ms) is the asynchronous version of Thread.Sleep.',
      syntax: `Task t1 = Task.Delay(1000);                    // completes after 1 second
Task<int> t2 = Task.Run(() => 6 * 7);          // CPU work on the thread pool
int answer = await t2;                         // 42

Task<int>[] all = { GetAsync(1), GetAsync(2) };
int[] results = await Task.WhenAll(all);       // results in the same order
Task<int> first = await Task.WhenAny(all);     // whichever finishes first`,
      points: [
        'Avoid .Result and .Wait() - they block the thread and can deadlock in UI/older ASP.NET apps',
        'Exceptions thrown inside a task are re-thrown when you await it',
      ],
    },
    {
      heading: 'async and await',
      content: 'Mark a method with async to be allowed to use await inside it. Its return type is Task, Task<T> (or ValueTask), and by convention its name ends with Async. When execution reaches await on an unfinished task, the method returns to its caller immediately (handing back an incomplete Task) and the rest of the method runs later when the awaited operation completes. Code before the first await runs synchronously on the caller\'s thread.',
      syntax: `static async Task<string> ReadNameAsync(string path)
{
    Console.WriteLine("before await");             // runs immediately
    string text = await File.ReadAllTextAsync(path);
    Console.WriteLine("after await");              // runs when the file is read
    return text.Trim();                            // wrapped into Task<string>
}

string name = await ReadNameAsync("name.txt");`,
      points: [
        'async void only for event handlers - exceptions cannot be caught by the caller',
        'Async is "contagious": a method that awaits should itself be async, all the way up to Main or the controller action',
        'Top-level statements and async Task Main(string[] args) allow await in console apps',
        'Start independent tasks first, then await them, to run them concurrently',
      ],
    },
    {
      heading: 'Asynchronous file reading',
      content: 'Almost every IO API has an async twin: File.ReadAllTextAsync, File.ReadAllLinesAsync, File.WriteAllTextAsync, File.AppendAllTextAsync, StreamReader.ReadLineAsync / ReadToEndAsync, StreamWriter.WriteLineAsync, FileStream.ReadAsync. In ASP.NET Core and EF Core you will use the same pattern: await _context.Students.ToListAsync(), await httpClient.GetStringAsync(url).',
      syntax: `string all = await File.ReadAllTextAsync("data.txt");

using var reader = new StreamReader("data.txt");
string? line;
while ((line = await reader.ReadLineAsync()) != null)
{
    Console.WriteLine(line);
}

// .NET 7+: lazy async line reading
await foreach (string l in File.ReadLinesAsync("data.txt")) { }`,
    },
    {
      heading: 'CancellationToken',
      content: 'Long operations should be cancellable (the user clicks Cancel, the browser closes the request, a timeout expires). The caller creates a CancellationTokenSource and passes its Token to the async method. Calling cts.Cancel() (or CancelAfter / a constructor timeout) sets the token. The method checks token.ThrowIfCancellationRequested() or passes the token on to .NET APIs like Task.Delay, ReadAllTextAsync and EF Core\'s ToListAsync, which throw OperationCanceledException (or its child TaskCanceledException).',
      syntax: `using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(5));       // automatic timeout

try
{
    await ProcessAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Cancelled");
}

static async Task ProcessAsync(CancellationToken token)
{
    token.ThrowIfCancellationRequested();
    await Task.Delay(1000, token);
}`,
      tip: 'In ASP.NET Core add a CancellationToken parameter to an action method - the framework cancels it automatically when the client disconnects.',
    },
    {
      heading: 'Threading basics: race conditions, lock, Interlocked',
      content: 'When several threads change the same variable, operations like counter++ (read, add, write) can interleave and lose updates - a race condition. Protect shared data with lock (only one thread at a time may enter the block) or use Interlocked for simple atomic operations. Prefer immutable data, local variables and thread-safe collections (ConcurrentDictionary, ConcurrentQueue) where possible.',
      syntax: `private readonly object _gate = new();
lock (_gate) { _balance += amount; }

Interlocked.Increment(ref _count);

Parallel.For(0, 100, i => Process(i));    // data parallelism (CPU-bound)`,
      points: [
        'Never await inside a lock block (compile error) - use SemaphoreSlim.WaitAsync for async code',
        'Thread.Sleep blocks a thread; await Task.Delay does not',
        'Console output order from parallel threads is not guaranteed - use Join/await before printing results',
      ],
    },
  ],
  examples: [
    {
      title: 'How control flows through async and await',
      scenario: 'Make tea asynchronously: start the task, do other work while the water boils, then await the result. Also return a number from Task<int>.',
      steps: steps('AsyncBasics'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `1. Start making breakfast
2. Boiling water...
3. While tea is brewing, toast bread
4. Water boiled
5. Tea is ready
6. Sum from Task<int>: 30`,
      explanation: 'Calling MakeTeaAsync runs it synchronously until its first await, so "2" prints before control returns. At await Task.Delay(500) the method hands back an unfinished Task<string> and Main prints "3". await teaTask pauses Main until the delay ends; then MakeTeaAsync continues ("4") and returns its string ("5"). AddAsync returns Task<int>; await unwraps it to the int 30.',
    },
    {
      title: 'Asynchronous file reading (practical)',
      scenario: 'Write a marks file asynchronously, read all lines asynchronously, and sum the marks with an async method that reads line by line with ReadLineAsync.',
      steps: steps('AsyncFileReading'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `File written asynchronously
Lines: 3
Read Asha
Read Ravi
Read Meena
Total marks: 248`,
      explanation: 'WriteAllLinesAsync and ReadAllLinesAsync are the async versions of the File helpers. SumMarksAsync returns Task<int>; each await reader.ReadLineAsync() releases the thread while the disk is read and returns null at the end of the file. 85 + 72 + 91 = 248. The using declaration closes the reader when the method finishes.',
    },
    {
      title: 'Reading several files concurrently with Task.WhenAll',
      scenario: 'Three class mark files must be summed. Each read takes about 1 second (simulated). Start all three at once so the total time is about 1 second instead of 3.',
      steps: steps('WhenAllFiles'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `classA.txt: total 248
classB.txt: total 100
classC.txt: total 330
Grand total: 678
Finished in under 2 seconds (sequential needs 3): True`,
      explanation: 'Select calls SumFileAsync for each file, which starts all three tasks immediately; ToArray stores them. Task.WhenAll waits until all finish and returns the results in the same order as the tasks (not in completion order), so the output is deterministic. Sums: 85+72+91 = 248, 60+40 = 100, 99+88+77+66 = 330. The three 1-second delays overlap, so the elapsed time is about 1 second. If you awaited each call inside a loop instead, it would take about 3 seconds.',
    },
    {
      title: 'CancellationToken: user cancel and timeout',
      scenario: 'A 5-part download is cancelled by the user after part 3. A second slow operation is cancelled automatically by a 200 ms timeout.',
      steps: steps('CancellationDemo'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Downloading part 1/5
Downloading part 2/5
Downloading part 3/5
User clicked Cancel
Cancelled: TaskCanceledException
Slow work timed out after 200 ms
IsCancellationRequested: True`,
      explanation: 'After part 3 the callback calls cts.Cancel(). The next await Task.Delay(100, token) sees the cancelled token and throws TaskCanceledException, which derives from OperationCanceledException, so the catch handles it and "Download complete" never prints. The second CancellationTokenSource cancels itself after 200 ms, so the 5-second Task.Delay is interrupted early.',
    },
    {
      title: 'Threading basics: Thread, Join, lock, Interlocked, Task.Run',
      scenario: 'Run work on a separate thread, then let four tasks increment a shared counter safely, and offload a calculation with Task.Run.',
      steps: steps('ThreadingBasics'),
      code: ex5,
      csharp: { files: { 'Program.cs': ex5 }, stdin: '' },
      result: `Worker thread step 1
Worker thread step 2
Worker thread step 3
Main thread continues after Join
Counter with lock: 40000
Counter with Interlocked: 40000
Task.Run result: 5050`,
      explanation: 'Join blocks the main thread until the worker finishes, so its three lines always come first. Four tasks each add 10000; because counter++ is inside lock, no update is lost and the result is exactly 40000 (remove the lock and you will often get a smaller, random number). Interlocked.Increment performs the same safe increment without a lock. Task.Run runs SumTo(100) on the thread pool and await returns 5050.',
    },
  ],
  interview: [
    { q: 'What is the difference between synchronous and asynchronous programming?', a: 'Synchronous code blocks the thread until each operation finishes. Asynchronous code starts an operation and frees the thread while waiting, continuing when the result is ready - improving responsiveness and scalability.', level: 'Easy' },
    { q: 'What do async and await do?', a: 'async enables await in a method and makes the compiler build a state machine. await asynchronously waits for a task: if it is not complete, the method returns to its caller and resumes later when the task completes, without blocking the thread.', level: 'Easy' },
    { q: 'Difference between Task and Task<T>?', a: 'Task represents an asynchronous operation with no return value. Task<T> represents one that produces a value of type T, obtained with await.', level: 'Easy' },
    { q: 'Difference between Thread and Task?', a: 'A Thread is an OS-level execution path you create and manage yourself. A Task is a higher-level abstraction of a unit of work that usually runs on the thread pool (or needs no thread at all for I/O), supports results, continuations, cancellation and composition (WhenAll).', level: 'Medium' },
    { q: 'Why should you avoid .Result and .Wait()?', a: 'They block the calling thread (wasting it) and can cause deadlocks in environments with a synchronization context (WinForms, WPF, classic ASP.NET). They also wrap exceptions in AggregateException.', level: 'Medium' },
    { q: 'Why avoid async void?', a: 'The caller cannot await it or catch its exceptions; an exception crashes the process. Use async Task, and async void only for event handlers.', level: 'Medium' },
    { q: 'Thread.Sleep vs Task.Delay?', a: 'Thread.Sleep blocks the current thread. await Task.Delay schedules the continuation after a timer without blocking any thread.', level: 'Easy' },
    { q: 'How do you cancel an async operation?', a: 'Create a CancellationTokenSource, pass its Token to the method and to the APIs it calls; call Cancel() or CancelAfter(). The operation throws OperationCanceledException, which the caller catches.', level: 'Medium' },
    { q: 'What is a race condition and how do you prevent it?', a: 'When multiple threads access shared data and at least one writes, the result depends on timing and updates can be lost. Prevent it with lock, Interlocked, thread-safe collections or by avoiding shared mutable state.', level: 'Medium' },
    { q: 'What does Task.WhenAll return, and in which order?', a: 'A task that completes when all tasks complete. For Task<T>[] it returns T[] in the same order as the input tasks, regardless of completion order. If any task fails, awaiting it throws the first exception.', level: 'Medium' },
    { q: 'Does async/await create a new thread?', a: 'Not by itself. For I/O-bound work no thread is used while waiting. The continuation runs on a thread-pool thread (or the captured context). Task.Run explicitly uses a pool thread for CPU work.', level: 'Hard' },
    { q: 'What is the output? static async Task<int> F() { Console.Write("A"); await Task.Delay(10); Console.Write("B"); return 1; } var t = F(); Console.Write("C"); Console.Write(await t);', a: 'ACB1. F runs synchronously until the first await (A), returns to the caller (C), then resumes (B) and the awaited result 1 is printed.', level: 'Hard' },
    { q: 'Can you use await inside a lock statement?', a: 'No, it is a compile error, because the continuation could run on a different thread than the one that holds the lock. Use SemaphoreSlim with WaitAsync instead.', level: 'Hard' },
    { q: 'Why is async important in ASP.NET Core?', a: 'While a request awaits the database or an external API, its thread returns to the pool and serves other requests, so the server handles many more concurrent requests with the same number of threads.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write an async method GetGreetingAsync(string name) that waits 300 ms with Task.Delay and returns "Hello, <name>". Await it for two names and print the results.',
      hint: 'static async Task<string> GetGreetingAsync(string name) { await Task.Delay(300); return ...; }',
      solution: `using System;
using System.Threading.Tasks;

Console.WriteLine(await GetGreetingAsync("Asha"));
Console.WriteLine(await GetGreetingAsync("Ravi"));

static async Task<string> GetGreetingAsync(string name)
{
    await Task.Delay(300);
    return "Hello, " + name;
}
// Hello, Asha
// Hello, Ravi`,
    },
    {
      task: 'Asynchronously write a log file with three lines using StreamWriter.WriteLineAsync, then read it back with File.ReadAllTextAsync and print it.',
      hint: 'await using var writer = new StreamWriter("app.log"); await writer.WriteLineAsync(...).',
      solution: `using System;
using System.IO;
using System.Threading.Tasks;

await using (var w = new StreamWriter("app.log"))
{
    await w.WriteLineAsync("Start");
    await w.WriteLineAsync("Processing");
    await w.WriteLineAsync("End");
}
Console.Write(await File.ReadAllTextAsync("app.log"));
File.Delete("app.log");`,
    },
    {
      task: 'Simulate fetching 3 students from an API (each takes 500 ms) first sequentially and then with Task.WhenAll. Print the names and compare the elapsed time (sequential about 1500 ms, concurrent about 500 ms).',
      hint: 'Use Stopwatch. For the concurrent version create the tasks first, then await Task.WhenAll.',
      solution: `using System;
using System.Diagnostics;
using System.Threading.Tasks;

var sw = Stopwatch.StartNew();
foreach (int id in new[] { 1, 2, 3 })
    Console.WriteLine(await FetchAsync(id));
Console.WriteLine("Sequential ms (approx 1500): " + sw.ElapsedMilliseconds);

sw.Restart();
string[] names = await Task.WhenAll(FetchAsync(1), FetchAsync(2), FetchAsync(3));
Console.WriteLine(string.Join(", ", names));
Console.WriteLine("Concurrent ms (approx 500): " + sw.ElapsedMilliseconds);

static async Task<string> FetchAsync(int id)
{
    await Task.Delay(500);
    return "Student" + id;
}`,
    },
    {
      task: 'Write a CountdownAsync(int from, CancellationToken token) that prints a number every 200 ms. Cancel it with CancelAfter(700) and print "Stopped" when cancelled.',
      hint: 'Pass the token to Task.Delay and catch OperationCanceledException. The exact last number may vary slightly with timing.',
      solution: `using System;
using System.Threading;
using System.Threading.Tasks;

using var cts = new CancellationTokenSource();
cts.CancelAfter(700);
try { await CountdownAsync(10, cts.Token); }
catch (OperationCanceledException) { Console.WriteLine("Stopped"); }

static async Task CountdownAsync(int from, CancellationToken token)
{
    for (int i = from; i > 0; i--)
    {
        Console.WriteLine(i);
        await Task.Delay(200, token);
    }
}
// Typically prints 10, 9, 8, 7 and then Stopped`,
    },
    {
      task: 'Create a BankAccount with Deposit(int amount) used by 5 tasks, each depositing 1 rupee 1000 times. Make it thread-safe so the final balance is always 5000.',
      hint: 'Use a private readonly object for lock inside Deposit.',
      solution: `using System;
using System.Linq;
using System.Threading.Tasks;

var acc = new BankAccount();
var tasks = Enumerable.Range(0, 5)
    .Select(_ => Task.Run(() => { for (int i = 0; i < 1000; i++) acc.Deposit(1); }))
    .ToArray();
await Task.WhenAll(tasks);
Console.WriteLine("Balance: " + acc.Balance);   // Balance: 5000

class BankAccount
{
    private readonly object _gate = new();
    public int Balance { get; private set; }
    public void Deposit(int amount)
    {
        lock (_gate) { Balance += amount; }
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which return type should an async method that returns an int have?', options: ['int', 'async int', 'void', 'Task<int>'], answer: 3, explanation: 'An async method returning a value uses Task<T> (or ValueTask<T>).' },
    { question: 'What happens when execution reaches await on an unfinished task?', options: ['The thread is blocked until the task finishes', 'The method returns to its caller and resumes later', 'The program terminates', 'A new process is created'], answer: 1, explanation: 'await yields control to the caller without blocking; the rest of the method runs when the task completes.' },
    { question: 'Which is the non-blocking way to wait 1 second in async code?', options: ['await Task.Delay(1000)', 'Thread.Sleep(1000)', 'Task.Delay(1000).Wait()', 'Thread.Join(1000)'], answer: 0, explanation: 'Task.Delay with await does not block a thread.' },
    { question: 'Which exception is thrown when a cancelled CancellationToken is observed?', options: ['TimeoutException', 'ThreadAbortException', 'OperationCanceledException (or TaskCanceledException)', 'InvalidOperationException'], answer: 2, explanation: 'Cancellation is signalled with OperationCanceledException; TaskCanceledException derives from it.' },
    { question: 'What prevents two threads from incrementing a shared counter at the same time?', options: ['async', 'lock', 'volatile string', 'Task.Delay'], answer: 1, explanation: 'lock allows only one thread at a time into the protected block (Interlocked.Increment also works).' },
  ],
};
