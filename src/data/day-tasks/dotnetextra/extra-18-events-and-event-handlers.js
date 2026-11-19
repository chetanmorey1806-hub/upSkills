export default {
  lesson: 'extra-18-events-and-event-handlers',
  minutes: 25,
  intro: 'Publish and subscribe to events with EventHandler<T>, raise them safely and pass custom EventArgs.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Declare a public event \`StockLow\` using the standard generic handler with \`StockEventArgs\`:
\`public ______ StockLow;\``,
      example: { title: 'event without data', code: 'public event EventHandler? Saved;' },
      accept: ['event EventHandler<StockEventArgs>', 'event EventHandler<StockEventArgs>?'],
      acceptRegex: ['^event\\s+EventHandler\\s*<\\s*StockEventArgs\\s*>\\s*\\??$'],
      caseSensitive: true,
      explain: '`event EventHandler<TEventArgs>` is the standard pattern: handlers receive `(object? sender, TEventArgs e)`. The `event` keyword stops outside code from raising the event or wiping out other subscribers.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What does the `event` keyword add on top of a public delegate field?',
      options: ['Nothing, it is only documentation', 'Outside classes can only `+=` / `-=`; they cannot invoke it or assign it with `=`', 'It makes handlers run asynchronously', 'It allows only one subscriber'],
      answer: 1,
      explain: 'With a plain delegate field anyone could write `shop.StockLow = null;` (removing every subscriber) or raise it. An event exposes only add/remove from outside; only the owner class can raise it.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print?',
      example: { title: 'raising an event safely', code: 'Saved?.Invoke(this, EventArgs.Empty);' },
      code: `var store = new Store();
store.StockLow += (s, e) => Console.WriteLine($"Reorder {e.Item} (left {e.Left})");
store.StockLow += (s, e) => Console.WriteLine($"Alert manager: {e.Item}");
store.Sell("Pen", 3);
store.Sell("Pen", 4);
store.Sell("Pen", 1);

class StockEventArgs : EventArgs
{
    public string Item = "";
    public int Left;
}
class Store
{
    private int _pens = 10;
    public event EventHandler<StockEventArgs>? StockLow;
    public void Sell(string item, int qty)
    {
        _pens -= qty;
        Console.WriteLine($"Sold {qty}, stock {_pens}");
        if (_pens < 5) StockLow?.Invoke(this, new StockEventArgs { Item = item, Left = _pens });
    }
}`,
      expected: `Sold 3, stock 7
Sold 4, stock 3
Reorder Pen (left 3)
Alert manager: Pen
Sold 1, stock 2
Reorder Pen (left 2)
Alert manager: Pen`,
      explain: 'Stock goes 10 → 7 (no event) → 3 (event fires) → 2 (event fires again). Each time both subscribers run in the order they subscribed. `?.Invoke` avoids a crash when nobody has subscribed.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inside the publisher, raise the \`Completed\` event (type \`EventHandler\`) safely, even if there are no subscribers:
\`______;\``,
      example: { title: 'raising a generic event', code: 'PriceChanged?.Invoke(this, new PriceEventArgs(newPrice));' },
      accept: ['Completed?.Invoke(this, EventArgs.Empty)', 'Completed?.Invoke(this, EventArgs.Empty);', 'Completed?.Invoke(this, new EventArgs())', 'Completed?.Invoke(this, new EventArgs());'],
      caseSensitive: true,
      explain: '`Completed?.Invoke(this, EventArgs.Empty)` raises the event only if there is at least one subscriber. `this` is the sender, and `EventArgs.Empty` is used when there is no extra data. Writing `Completed(this, ...)` throws when nobody subscribed.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are good event practices? Select all that apply.',
      options: ['Custom data classes derive from `EventArgs` and end with "EventArgs"', 'Unsubscribe (`-=`) long-lived publishers\' events when a subscriber is disposed', 'Raise events with `?.Invoke` to avoid null errors', 'Use `=` to subscribe so only one handler is kept', 'Name the raising method `OnStockLow` (protected virtual)'],
      answers: [0, 1, 2, 4],
      explain: 'Follow the .NET conventions: `XxxEventArgs : EventArgs`, `protected virtual void OnXxx(...)` to raise, and `?.Invoke`. Forgetting `-=` keeps subscribers alive (a memory leak). Outside code cannot use `=` on an event at all.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Unsubscribing. What does this print?',
      example: { title: 'named handler so it can be removed', code: `btn.Click += OnClick;
btn.Click -= OnClick;   // works because it is the same method` },
      code: `var timer = new Ticker();
timer.Tick += Log;
timer.Fire(1);
timer.Tick -= Log;
timer.Fire(2);
timer.Tick += (s, n) => Console.WriteLine($"lambda {n}");
timer.Fire(3);

static void Log(object? s, int n) => Console.WriteLine($"log {n}");

class Ticker
{
    public event EventHandler<int>? Tick;
    public void Fire(int n) { Console.WriteLine($"fire {n}"); Tick?.Invoke(this, n); }
}`,
      expected: `fire 1
log 1
fire 2
fire 3
lambda 3`,
      explain: 'After `-= Log` there are no subscribers, so firing 2 prints only "fire 2". A new lambda handles 3. Note: an anonymous lambda can only be removed if you keep it in a variable, so prefer named methods when you need to unsubscribe.',
    },
  ],
};
