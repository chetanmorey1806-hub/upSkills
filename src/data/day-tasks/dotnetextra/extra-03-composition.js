export default {
  lesson: 'extra-03-composition',
  minutes: 20,
  intro: 'Build strong "part-of" relationships where the owner creates its parts and controls their lifetime.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the key feature of **composition**?',
      options: ['Parts are shared between many owners', 'The owner creates its parts and the parts cannot exist without the owner', 'A class inherits from two base classes', 'Parts are always static'],
      answer: 1,
      explain: 'In composition the owner (e.g. `Car`) creates its parts (`Engine`) itself, usually in the constructor, and nobody else holds them. When the owner goes away, its parts go with it. Shared parts mean aggregation.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the constructor so every \`Car\` builds its **own** engine (composition):
\`public Car() { _engine = ______; }\``,
      example: { title: 'owner creates the part', code: `class House
{
    private readonly Room _hall;
    public House() { _hall = new Room("Hall"); }
}` },
      accept: ['new Engine()', 'new Engine();', 'new()', 'new();'],
      caseSensitive: true,
      explain: 'The owner creates the part with `new Engine()` (or target-typed `new()`). Because the engine is private and created inside, no other object can reach it, and its lifetime is tied to the car.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'parts created in the constructor', code: `public Order() { Lines = new List<Line>(); }` },
      code: `var h = new House("Hall", "Kitchen");

class Room { public string Name; public Room(string n) { Name = n; Console.WriteLine($"Built {n}"); } }
class House
{
    private readonly List<Room> _rooms = new();
    public House(params string[] names)
    {
        Console.WriteLine("House start");
        foreach (var n in names) _rooms.Add(new Room(n));
        Console.WriteLine($"House has {_rooms.Count} rooms");
    }
}`,
      expected: `House start
Built Hall
Built Kitchen
House has 2 rooms`,
      explain: 'The house constructor runs first, prints "House start", then creates each `Room` itself (each room constructor prints "Built …"), and finally reports 2 rooms. The rooms are created by and stored only inside the house: composition.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which design choices help enforce **composition**? Select all that apply.',
      options: ['Make the part field `private`', 'Create the part inside the owner', 'Accept the part as a constructor parameter from outside', 'Return the internal `List<T>` directly so callers can add parts', 'Expose parts as `IReadOnlyList<T>`'],
      answers: [0, 1, 4],
      explain: 'Private fields, creating parts inside the owner and exposing only a read-only view keep the parts owned. Receiving the part from outside (that is aggregation/injection) or handing out the mutable internal list lets other code share or change the parts.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'An invoice owns its lines. What does this print?',
      example: { title: 'owner exposes only behaviour', code: 'public void AddLine(string item, int qty, int price) => _lines.Add(new Line(item, qty, price));' },
      code: `var inv = new Invoice();
inv.Add(2, 150);
inv.Add(3, 40);
inv.Add(1, 999);
Console.WriteLine(inv.Count);
Console.WriteLine(inv.Total);

class Line { public int Qty, Price; public Line(int q, int p) { Qty = q; Price = p; } }
class Invoice
{
    private readonly List<Line> _lines = new();
    public void Add(int qty, int price) => _lines.Add(new Line(qty, price));
    public int Total => _lines.Sum(l => l.Qty * l.Price);
    public int Count => _lines.Count;
}`,
      expected: `3
1419`,
      explain: 'Three lines are created inside the invoice. Total = 2×150 + 3×40 + 1×999 = 300 + 120 + 999 = **1419**. Callers never see a `Line` object: they only call `Add`, which keeps the lines fully owned by the invoice.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which statement about composition vs inheritance is the usual guideline?',
      options: ['Always prefer inheritance because it reuses more code', 'Prefer composition ("has-a") over inheritance when the relationship is not truly "is-a"', 'Composition is only possible with interfaces', 'Composition cannot be used with private fields'],
      answer: 1,
      explain: '"Favour composition over inheritance": a `Car` **has an** `Engine`, it is not an engine. Composition keeps classes loosely coupled and lets you swap parts, while deep inheritance chains become fragile.',
    },
  ],
};
