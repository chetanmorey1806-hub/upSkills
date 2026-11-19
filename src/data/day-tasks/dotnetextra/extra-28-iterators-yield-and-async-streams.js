export default {
  lesson: 'extra-28-iterators-yield-and-async-streams',
  minutes: 25,
  intro: 'Produce sequences lazily with yield return and consume async streams with IAsyncEnumerable and await foreach.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Complete the line inside the loop so the method produces each even number lazily:
\`static IEnumerable<int> Evens(int max) { for (int i = 0; i <= max; i += 2) ______; }\``,
      example: { title: 'yield return', code: `static IEnumerable<string> Days()
{
    yield return "Mon";
    yield return "Tue";
}` },
      accept: ['yield return i', 'yield return i;'],
      caseSensitive: true,
      explain: '`yield return value;` hands one item to the caller and pauses the method until the next item is requested. A plain `return i;` would not compile in an iterator returning `IEnumerable<int>`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Lazy execution: in what order are lines printed?',
      example: { title: 'iterators are lazy', text: 'Calling an iterator method runs **no** code. Code runs only when `foreach` asks for the next item.' },
      code: `var nums = Numbers();
Console.WriteLine("Start");
foreach (var n in nums)
{
    Console.WriteLine($"Got {n}");
    if (n == 2) break;
}
Console.WriteLine("End");

static IEnumerable<int> Numbers()
{
    Console.WriteLine("Begin");
    yield return 1;
    Console.WriteLine("After 1");
    yield return 2;
    Console.WriteLine("After 2");
    yield return 3;
}`,
      expected: `Start
Begin
Got 1
After 1
Got 2
End`,
      explain: 'Calling `Numbers()` prints nothing; the body starts on the first `MoveNext()` in foreach. Each `yield return` pauses. After "Got 2" the loop breaks, so "After 2" and item 3 are never produced.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`yield break` and infinite sequences. What does this print?',
      example: { title: 'stop early', code: 'if (done) yield break;' },
      code: `Console.WriteLine(string.Join(",", Fib().Take(7)));
Console.WriteLine(string.Join(",", UpTo(4)));

static IEnumerable<int> Fib()
{
    int a = 0, b = 1;
    while (true) { yield return a; (a, b) = (b, a + b); }
}
static IEnumerable<int> UpTo(int n)
{
    for (int i = 1; ; i++)
    {
        if (i > n) yield break;
        yield return i * i;
    }
}`,
      expected: `0,1,1,2,3,5,8
1,4,9,16`,
      explain: '`Fib` is infinite, but `Take(7)` asks for only 7 items, so it is safe thanks to lazy evaluation. `UpTo(4)` yields squares 1, 4, 9, 16 and then `yield break` ends the sequence.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Consume an \`IAsyncEnumerable<Order>\` returned by \`GetOrdersAsync()\`:
\`______ (var o in GetOrdersAsync()) Console.WriteLine(o.Id);\``,
      example: { title: 'async iterator', code: `static async IAsyncEnumerable<int> Ticks()
{
    for (int i = 0; i < 3; i++) { await Task.Delay(100); yield return i; }
}` },
      accept: ['await foreach'],
      caseSensitive: true,
      explain: '`await foreach` asynchronously awaits each next item of an `IAsyncEnumerable<T>` (e.g. rows streamed from EF Core or a paged API). A normal `foreach` cannot iterate an async stream.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'An async stream. What does this print?',
      example: { title: 'await foreach', code: `await foreach (var x in Ticks())
    Console.WriteLine(x);` },
      code: `int total = 0;
await foreach (var page in FetchPages(3))
{
    Console.WriteLine($"page {page.No}: {page.Rows} rows");
    total += page.Rows;
}
Console.WriteLine($"total {total}");

static async IAsyncEnumerable<(int No, int Rows)> FetchPages(int count)
{
    for (int i = 1; i <= count; i++)
    {
        await Task.Delay(10);          // pretend network call
        yield return (i, i == count ? 4 : 10);
    }
}`,
      expected: `page 1: 10 rows
page 2: 10 rows
page 3: 4 rows
total 24`,
      explain: 'Each page is awaited and processed as soon as it arrives instead of loading everything first. The last page has 4 rows: 10 + 10 + 4 = 24. The await keeps the order sequential, so the output is deterministic.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['An iterator method can return `IEnumerable<T>` or `IEnumerator<T>`', 'Iterators run their whole body when the method is called', 'Enumerating the same `IEnumerable` iterator twice runs its code twice', '`async` iterators return `IAsyncEnumerable<T>`', '`yield return` can be used inside a `try` block that has a `catch`'],
      answers: [0, 2, 3],
      explain: 'Iterators are lazy and re-run for every enumeration (call `.ToList()` to cache). Async iterators return `IAsyncEnumerable<T>`. `yield return` is **not** allowed inside a try block with a catch clause (try/finally is fine).',
    },
  ],
};
