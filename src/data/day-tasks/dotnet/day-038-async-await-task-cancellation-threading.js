export default {
  lesson: 'day-038-async-await-task-cancellation-threading',
  minutes: 20,
  intro: 'Practise asynchronous programming in C#: async/await, Task and Task<T>, Task.WhenAll, CancellationToken and basic thread safety.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the method header of an asynchronous method that returns an `int` result:\n`static ________ GetMarksAsync()`\n(write the return type)',
      example: { title: 'async return types', code: 'static async Task SaveAsync() { … }          // no result\nstatic async Task<string> LoadAsync() { … }   // returns a string' },
      accept: ['async Task<int>'],
      acceptRegex: ['^async\\s+Task\\s*<\\s*int\\s*>$'],
      caseSensitive: true,
      explain: 'An async method that produces an int returns `Task<int>` and is marked `async`; inside you write `return 90;` and the caller gets the number with `await`. Use `Task` for no result and avoid `async void` (except event handlers).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'How control flows through async and await: what does this print?',
      example: { title: 'start now, await later', code: 'Task<string> t = DownloadAsync();   // starts running\nDoOtherWork();\nstring data = await t;              // waits only here' },
      code: `Console.WriteLine("1. Start");
Task<int> marksTask = GetMarksAsync();
Console.WriteLine("3. Doing other work");
int marks = await marksTask;
Console.WriteLine("5. Marks = " + marks);

static async Task<int> GetMarksAsync()
{
    Console.WriteLine("2. Fetching marks");
    await Task.Delay(500);
    Console.WriteLine("4. Fetched");
    return 92;
}`,
      expected: `1. Start
2. Fetching marks
3. Doing other work
4. Fetched
5. Marks = 92`,
      explain: 'An async method runs **synchronously until its first await** (line 2). At `await Task.Delay` it returns an unfinished Task to the caller, which continues (line 3). `await marksTask` then waits; after the delay the method resumes (line 4) and returns 92.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Running tasks concurrently with `Task.WhenAll`: what does this print?',
      example: { title: 'WhenAll', code: 'int[] results = await Task.WhenAll(t1, t2);   // results in the same order as the tasks' },
      code: `var t1 = CountAsync("Pune", 300, 120);
var t2 = CountAsync("Delhi", 100, 250);
var t3 = CountAsync("Goa", 200, 40);
int[] counts = await Task.WhenAll(t1, t2, t3);
Console.WriteLine(string.Join(", ", counts));
Console.WriteLine("Total: " + counts.Sum());

static async Task<int> CountAsync(string city, int delayMs, int students)
{
    await Task.Delay(delayMs);
    return students;
}`,
      expected: `120, 250, 40
Total: 410`,
      explain: 'All three tasks run at the same time (total wait ≈ 300 ms, not 600 ms). `Task.WhenAll` returns the results in the **order of the tasks passed in**, not the order they finished. 120 + 250 + 40 = 410.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A long download receives a `CancellationToken` and the user clicks **Cancel** (`cts.Cancel()`). What normally happens inside `await Task.Delay(5000, token)` or `token.ThrowIfCancellationRequested()`?',
      options: [
        'Nothing; tokens are only for logging',
        'An OperationCanceledException (TaskCanceledException) is thrown, which the caller can catch',
        'The whole process exits',
        'The method silently returns null',
      ],
      answer: 1,
      explain: 'Cancellation is **cooperative**: the method checks the token, and cancellation surfaces as `OperationCanceledException`. Catch it to show "Cancelled". `new CancellationTokenSource(TimeSpan.FromSeconds(3))` gives an automatic timeout.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Two threads each run `count++` 1000 times on a shared `int count`. The result is sometimes less than 2000. What is the correct fix?',
      options: [
        'Make count a long',
        'Use `lock (sync) { count++; }` or `Interlocked.Increment(ref count)`',
        'Add Thread.Sleep(1)',
        'Use async void',
      ],
      answer: 1,
      explain: '`count++` is read-modify-write, so two threads can overwrite each other (a **race condition**). `lock` lets only one thread in at a time, and `Interlocked.Increment` does the increment atomically.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about async/await are TRUE? (choose all that apply)',
      options: [
        '`await` can only be used inside a method marked async (or top-level statements)',
        'async/await is mainly for I/O-bound work (files, web APIs, databases) so threads are not blocked while waiting',
        '`.Result` and `.Wait()` are recommended because they are faster than await',
        '`Task.Run` moves CPU-bound work to a thread-pool thread',
        'Adding async to a method automatically makes its loops run in parallel',
      ],
      answers: [0, 1, 3],
      explain: '`.Result`/`.Wait()` **block** the thread and can cause deadlocks; prefer `await`. `async` does not parallelise anything by itself: it only allows the method to await. `Task.Run` is the tool for CPU-heavy work.',
    },
  ],
};
