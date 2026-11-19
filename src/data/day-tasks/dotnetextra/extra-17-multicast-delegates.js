export default {
  lesson: 'extra-17-multicast-delegates',
  minutes: 20,
  intro: 'Combine several methods in one delegate with += and -=, and understand invocation order and return values.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Add the method \`SendSms\` to the existing delegate so both methods run:
\`notify ______ SendSms;\``,
      example: { title: 'adding a handler', code: `Action log = WriteFile;
log += WriteConsole;   // now two methods` },
      accept: ['+='],
      explain: '`+=` combines delegates into a multicast delegate (an invocation list). Using `=` would replace the earlier method instead of adding to it, a common bug.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'invocation list', code: `Action a = A;
a += B;
a();   // runs A then B` },
      code: `Action<string> notify = Email;
notify += Sms;
notify += Push;
notify("Order 55 shipped");
notify -= Sms;
notify("Order 56 shipped");

static void Email(string m) => Console.WriteLine($"Email: {m}");
static void Sms(string m) => Console.WriteLine($"SMS: {m}");
static void Push(string m) => Console.WriteLine($"Push: {m}");`,
      expected: `Email: Order 55 shipped
SMS: Order 55 shipped
Push: Order 55 shipped
Email: Order 56 shipped
Push: Order 56 shipped`,
      explain: 'Methods run in the order they were added. After `-= Sms` only Email and Push remain for the second call.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A multicast delegate with a **return value**. What does this print?',
      example: { title: 'returns from multicast', text: 'Every method runs, but the caller only receives the value from the **last** method in the list.' },
      code: `Func<int, int> f = Double;
f += Square;
f += AddTen;
Console.WriteLine(f(5));
Console.WriteLine(f.GetInvocationList().Length);

static int Double(int x) { Console.WriteLine("double"); return x * 2; }
static int Square(int x) { Console.WriteLine("square"); return x * x; }
static int AddTen(int x) { Console.WriteLine("add ten"); return x + 10; }`,
      expected: `double
square
add ten
15
3`,
      explain: 'All three methods run (each gets the original 5). The result returned to the caller is only the **last** one: 5 + 10 = 15. The other results are lost, which is why multicast delegates are normally `void` (Action/events). There are 3 entries in the invocation list.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In a multicast delegate, the second of three methods throws an exception. What happens?',
      options: ['The exception is ignored and all three run', 'The exception propagates to the caller and the third method does not run', 'Only the failing method is removed from the list', 'The first method is rolled back'],
      answer: 1,
      explain: 'Invocation stops at the exception and it bubbles up to the caller, so later handlers are skipped. To run every handler safely, loop over `GetInvocationList()` and wrap each call in try/catch.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Removing a method that was added twice. What does this print?',
      example: { title: '-= removes the last matching entry', code: `a += Log; a += Log;   // Log twice
a -= Log;             // Log once` },
      code: `int count = 0;
Action tick = () => count++;
Action all = tick;
all += tick;
all += tick;
all();
Console.WriteLine(count);
all -= tick;
all();
Console.WriteLine(count);`,
      expected: `3
5`,
      explain: 'The same lambda instance is in the list 3 times, so the first call adds 3. `-=` removes one occurrence (the last one), leaving 2: count becomes 5.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['Delegates are immutable: `+=` creates a new delegate object', 'Removing the last method makes the delegate `null`', 'Multicast delegates run methods in parallel on different threads', '`Delegate.Combine(a, b)` is what `a + b` does', 'Methods run in reverse order of adding'],
      answers: [0, 1, 3],
      explain: 'Delegates are immutable, so `+=` returns a new combined delegate (`Delegate.Combine`). Removing the last method gives `null`, which is why you call `handler?.Invoke()`. Methods run **sequentially, in the order added**, on the same thread.',
    },
  ],
};
