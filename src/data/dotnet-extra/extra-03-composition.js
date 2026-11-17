const carEngine = `using System;

class Engine
{
    public int HorsePower { get; }
    public bool IsRunning { get; private set; }

    public Engine(int hp)
    {
        HorsePower = hp;
        Console.WriteLine($"Engine ({hp} HP) built");
    }

    public void Start() { IsRunning = true; Console.WriteLine("Engine started"); }
    public void Stop() { IsRunning = false; Console.WriteLine("Engine stopped"); }
}

class Car
{
    public string Model { get; }
    private readonly Engine _engine;   // composition: the Car creates and owns its Engine

    public Car(string model, int hp)
    {
        Model = model;
        _engine = new Engine(hp);       // the part is created INSIDE the whole
        Console.WriteLine($"Car {model} assembled");
    }

    public void Drive()
    {
        _engine.Start();
        Console.WriteLine($"{Model} is moving with {_engine.HorsePower} HP");
        _engine.Stop();
    }
}

class Program
{
    static void Main()
    {
        var car = new Car("Nexon", 120);
        car.Drive();

        car = null!;   // nobody references the car any more
        Console.WriteLine("Car scrapped - its engine goes with it");
    }
}
`;

const houseRooms = `using System;
using System.Collections.Generic;

class Room
{
    public string Name { get; }
    public int Area { get; }

    internal Room(string name, int area) { Name = name; Area = area; }
}

class House
{
    private readonly List<Room> _rooms = new List<Room>();
    public string Owner { get; }
    public IReadOnlyList<Room> Rooms => _rooms;      // read-only view for the outside world

    public House(string owner) { Owner = owner; }

    // The House builds its own rooms - callers pass only data, never a Room object
    public void AddRoom(string name, int area) => _rooms.Add(new Room(name, area));

    public int TotalArea()
    {
        int total = 0;
        foreach (var r in _rooms) total += r.Area;
        return total;
    }
}

class Program
{
    static void Main()
    {
        var house = new House("Priya");
        house.AddRoom("Hall", 220);
        house.AddRoom("Kitchen", 90);
        house.AddRoom("Bedroom", 150);

        foreach (var r in house.Rooms)
            Console.WriteLine($"{r.Name,-8} {r.Area} sq ft");

        Console.WriteLine($"Total: {house.TotalArea()} sq ft, rooms: {house.Rooms.Count}");
    }
}
`;

const orderLines = `using System;
using System.Collections.Generic;

class Customer
{
    public string Name { get; }
    public Customer(string name) { Name = name; }
}

class OrderLine
{
    public string Product { get; }
    public int Qty { get; }
    public int Price { get; }
    public OrderLine(string product, int qty, int price) { Product = product; Qty = qty; Price = price; }
    public int Total => Qty * Price;
}

class Order
{
    public int Id { get; }
    public Customer Customer { get; }                  // aggregation: passed in from outside
    private readonly List<OrderLine> _lines = new();   // composition: created inside

    public Order(int id, Customer customer) { Id = id; Customer = customer; }

    public void AddLine(string product, int qty, int price)
        => _lines.Add(new OrderLine(product, qty, price));

    public int GrandTotal()
    {
        int sum = 0;
        foreach (var l in _lines) sum += l.Total;
        return sum;
    }

    public int LineCount => _lines.Count;
}

class Program
{
    static void Main()
    {
        var ravi = new Customer("Ravi");
        var order = new Order(101, ravi);
        order.AddLine("Keyboard", 2, 750);
        order.AddLine("Mouse", 3, 400);

        Console.WriteLine($"Order {order.Id} for {order.Customer.Name}");
        Console.WriteLine($"Lines: {order.LineCount}, Grand total: {order.GrandTotal()}");

        order = null!;   // order cancelled and deleted
        Console.WriteLine($"Customer {ravi.Name} still exists; the order lines are gone with the order");
    }
}
`;

const documentPages = `using System;
using System.Collections.Generic;

class Page
{
    public string Text { get; set; }
    public Page(string text) { Text = text; }
}

class Document
{
    public string Title { get; }
    private readonly List<Page> _pages = new();

    public Document(string title) { Title = title; }

    public void AddPage(string text) => _pages.Add(new Page(text));

    public void EditPage(int index, string text) => _pages[index].Text = text;

    // Copying a composite object means copying its parts too (deep copy)
    public Document Copy(string newTitle)
    {
        var copy = new Document(newTitle);
        foreach (var p in _pages) copy.AddPage(p.Text);
        return copy;
    }

    public void Print() =>
        Console.WriteLine($"{Title}: {string.Join(" | ", _pages.ConvertAll(p => p.Text))}");
}

class Program
{
    static void Main()
    {
        var original = new Document("Resume");
        original.AddPage("Profile");
        original.AddPage("Skills");

        var copy = original.Copy("Resume-v2");
        copy.EditPage(1, "Skills + C#");

        original.Print();
        copy.Print();
    }
}
`;

export default {
  id: 'extra-03-composition',
  title: 'Composition (Strong Has-a, Whole Owns the Parts)',
  module: 'Extra: OOP Concepts',
  extraNo: 3,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Composition is the strongest form of the has-a relationship: the whole creates its parts, owns them exclusively and the parts die with the whole. A Car has an Engine, a House has Rooms, an Order has OrderLines. Learn how to recognise composition, how it is drawn in UML (filled diamond), how to code it in C#, how it differs from aggregation, and why "favour composition over inheritance" is one of the most quoted design rules.`,
  objectives: [
    'Define composition as a strong whole-part relationship with a shared lifetime',
    'Implement composition in C# by creating parts inside the whole and hiding them',
    'Compare association, aggregation and composition with real examples',
    'Explain "favour composition over inheritance" and when to apply it',
    'Map composition to database design (cascade delete) and deep copying',
  ],
  theory: [
    {
      heading: 'What is Composition?',
      content: `**Composition** is a **"part-of"** relationship in which the **whole owns its parts completely**:

- The whole **creates** the parts (usually in its constructor or its own methods).
- The parts are **not shared** with any other whole.
- When the whole is destroyed, the parts are **destroyed with it** - they have no meaning on their own.

**Real-world analogy:** A human body and its heart. The heart is created as part of the body, belongs to only that body and does not live on independently. Another analogy: a building and its floors - demolish the building and the floors go too.

Compare this with a **Department and Employees** (aggregation): close the department and the employees still exist. That difference in **lifetime** is the whole story.`,
      points: [
        'Composition = strong has-a = "is part of"',
        'Whole creates the part, part cannot exist alone',
        'Part belongs to exactly one whole at a time',
        'Lifetime of the part is bound to the lifetime of the whole',
      ],
    },
    {
      heading: 'Composition in UML and in C# code',
      content: `In UML, composition is drawn as a solid line with a **filled (black) diamond** on the side of the whole: Car ◆—— Engine. Aggregation uses a hollow diamond ◇.

C# has **no "composition" keyword**. You express it through design:

1. Keep the part in a **private (readonly) field**.
2. **Create** the part inside the whole (constructor or a factory method like AddRoom(name, area)).
3. **Do not hand out** the part for others to keep, or hand out only a read-only view (IReadOnlyList).
4. Optionally make the part's constructor **internal** or make the part a **nested private class** so outside code cannot build one.

Because .NET has a garbage collector, "destroyed with the whole" means: when nothing references the whole any more, nothing references its parts either, so the GC collects them together.`,
      syntax: `class Car
{
    private readonly Engine _engine;          // owned part
    public Car(int hp)
    {
        _engine = new Engine(hp);             // created by the whole
    }
}`,
      tip: 'Memory trick: the filled diamond is "full" - the whole is full of parts it owns.',
    },
    {
      heading: 'Association vs Aggregation vs Composition',
      content: `All three are "has-a / uses-a" links between objects. They differ in **ownership** and **lifetime**:

| | Association | Aggregation | Composition |
|---|---|---|---|
| Meaning | knows / uses | has (weak) | is part of (strong) |
| Who creates the other? | either | outside code | the whole |
| Can the part be shared? | yes | yes | no |
| Part survives the whole? | yes | yes | no |
| UML | plain line | hollow diamond | filled diamond |
| Example | Teacher - Student | Team - Player | House - Room |

A single class often uses more than one: an **Order** is composed of **OrderLines** (they die with the order) but only aggregates/associates a **Customer** (the customer lives on).`,
    },
    {
      heading: 'Favour Composition over Inheritance',
      content: `Inheritance says **"is-a"** (a Manager is an Employee). Composition says **"has-a"** (a Car has an Engine). The famous design advice from the Gang of Four book is: **prefer composition** when you only want to reuse behaviour.

Why?
- Inheritance is fixed at compile time; composed parts can be swapped (a car can get a new engine type).
- Deep inheritance trees are fragile - changing a base class can break all children.
- C# allows only **one base class**, but a class can contain many parts.
- Composition keeps classes small and focused (Single Responsibility).

Rule of thumb: if the sentence "X is a Y" sounds wrong (a Car **is an** Engine?), use composition.`,
      points: [
        'Bad: class Car : Engine (a car is not an engine)',
        'Good: class Car { private readonly Engine _engine; }',
        'Composition + interfaces gives flexible, testable designs',
      ],
    },
    {
      heading: 'Protecting the parts, copying and databases',
      content: `Since the whole owns its parts, it must **guard** them:

- Expose collections as **IReadOnlyList<T>** and add methods like AddRoom/RemoveRoom so the whole controls changes.
- When you **copy** a composite object, copy the parts as well (**deep copy**). Otherwise two wholes would share one part, which breaks composition.
- If a part holds an unmanaged resource (file, connection), the whole should implement **IDisposable** and dispose its parts.

**In SQL Server / EF Core:** composition maps to a **required foreign key with ON DELETE CASCADE** - delete an Order and its OrderLines are deleted too. EF Core **owned types** (OwnsOne / OwnsMany) are the purest form of composition: an Address owned by a Customer has no table identity of its own.`,
      tip: 'Interview line: "Aggregation is ON DELETE SET NULL, composition is ON DELETE CASCADE."',
    },
  ],
  examples: [
    {
      title: 'Car composes an Engine',
      scenario: 'A vehicle simulation where every car is built with its own engine. The engine is never shared and is scrapped with the car.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#)',
        'Name it CompositionDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run without debugging',
      ],
      code: carEngine,
      csharp: { files: { 'Program.cs': carEngine }, stdin: '' },
      result: `Engine (120 HP) built
Car Nexon assembled
Engine started
Nexon is moving with 120 HP
Engine stopped
Car scrapped - its engine goes with it`,
      explanation: `The Car constructor itself calls new Engine(hp), so "Engine (120 HP) built" prints before "Car Nexon assembled" (the engine is built while the car's constructor is still running). Nobody outside the Car has a reference to the Engine. After car = null both the Car and its Engine become unreachable and the GC can reclaim them together - shared lifetime, the signature of composition.`,
    },
    {
      title: 'House builds and owns its Rooms',
      scenario: 'A real-estate app where rooms only exist as part of a house. Callers give only the room name and area; the House creates the Room objects.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it HouseComposition',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Try writing house.Rooms.Add(...) in Main - it does not compile because IReadOnlyList has no Add method',
      ],
      code: houseRooms,
      csharp: { files: { 'Program.cs': houseRooms }, stdin: '' },
      result: `Hall     220 sq ft
Kitchen  90 sq ft
Bedroom  150 sq ft
Total: 460 sq ft, rooms: 3`,
      explanation: `{r.Name,-8} left-aligns the name in 8 characters, so "Hall" gets 4 trailing spaces and "Kitchen"/"Bedroom" get 1, followed by the literal space in the format string. 220 + 90 + 150 = 460. The House exposes IReadOnlyList<Room>, so outside code can read rooms but cannot add or remove them directly - the whole stays in control of its parts.`,
    },
    {
      title: 'Order: composition (lines) and aggregation (customer) together',
      scenario: 'An e-commerce order. Deleting the order deletes its lines, but the customer account must survive.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it OrderComposition',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: orderLines,
      csharp: { files: { 'Program.cs': orderLines }, stdin: '' },
      result: `Order 101 for Ravi
Lines: 2, Grand total: 2700
Customer Ravi still exists; the order lines are gone with the order`,
      explanation: `Keyboard: 2 x 750 = 1500, Mouse: 3 x 400 = 1200, total 2700. The OrderLine objects are created inside AddLine and live only in the private _lines list (composition). The Customer was created in Main and passed in (aggregation). Setting order = null makes the Order and its lines unreachable, but ravi is still referenced by Main.`,
    },
    {
      title: 'Deep copy of a composite: Document and Pages',
      scenario: 'A document editor with "Save As". The new copy must have its own pages so editing the copy never changes the original.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DocumentCopy',
        'Replace Program.cs with the code',
        'Press F9 on copy.EditPage(...), run with F5 and compare original and copy in the Locals window',
        'Press Ctrl+F5 to see the final output',
      ],
      code: documentPages,
      csharp: { files: { 'Program.cs': documentPages }, stdin: '' },
      result: `Resume: Profile | Skills
Resume-v2: Profile | Skills + C#`,
      explanation: `Copy() creates brand-new Page objects with the same text instead of copying references. When page index 1 of the copy is edited, only the copy changes. If Copy() had simply reused the same Page objects (a shallow copy), both documents would print "Skills + C#" and the parts would be shared - which would no longer be composition.`,
    },
  ],
  interview: [
    { q: 'What is composition in OOP?', a: 'A strong whole-part (has-a) relationship where the whole creates and exclusively owns its parts, and the parts cannot exist without the whole. Example: House and Rooms, Car and Engine.', level: 'Easy' },
    { q: 'What is the difference between aggregation and composition?', a: 'Both are whole-part. In aggregation parts are created outside, can be shared and survive the whole (Team-Player). In composition the whole creates the parts, they are not shared and they die with the whole (House-Room).', level: 'Easy' },
    { q: 'How is composition shown in a UML class diagram?', a: 'A solid line with a filled (black) diamond on the side of the whole class. Aggregation uses a hollow diamond.', level: 'Easy' },
    { q: 'How do you implement composition in C#?', a: 'Store the part in a private readonly field, create it inside the whole (constructor or methods such as AddRoom), never accept an existing part from outside and never hand out a reference that others could keep. Optionally make the part class nested/private or give it an internal constructor.', level: 'Medium' },
    { q: 'What does "favour composition over inheritance" mean?', a: 'When you want to reuse behaviour, contain an object that provides it (has-a) instead of inheriting from it (is-a). Composition is more flexible (parts can be swapped), avoids fragile base classes, and works around C# single inheritance.', level: 'Medium' },
    { q: 'Is a Car-Engine relationship composition or aggregation?', a: 'Typically composition in a simple model: the engine is built into the car and scrapped with it. In a garage system where engines are tracked and moved between cars it would be aggregation. The answer depends on the lifetime rule in your domain.', level: 'Medium' },
    { q: 'Output? class A { public B b = new B(); } class B { public B() { Console.Write("B "); } } ... new A(); new A(); Console.Write("done");', a: 'It prints "B B done". Each A creates its own new B in its field initializer, so two B objects are created - one per whole, never shared.', level: 'Medium' },
    { q: 'Why should a composite class return IReadOnlyList<T> instead of List<T>?', a: 'Returning List<T> lets callers add or remove parts directly, bypassing the whole. IReadOnlyList<T> exposes only reading, so all changes go through the whole\'s own methods that can enforce rules.', level: 'Medium' },
    { q: 'What is a deep copy and why does composition need it?', a: 'A deep copy duplicates the object and all of its owned parts. With composition each whole must own its own parts; a shallow copy would make two wholes share the same part objects, so changing one would change the other.', level: 'Hard' },
    { q: 'How does composition map to SQL Server or EF Core?', a: 'As a required foreign key with ON DELETE CASCADE (deleting an Order deletes its OrderLines), or as EF Core owned types (OwnsOne/OwnsMany) where the part has no independent identity.', level: 'Hard' },
    { q: 'In .NET the GC frees memory. What does "parts are destroyed with the whole" mean then?', a: 'It means that once the whole becomes unreachable, its parts are unreachable too (only the whole referenced them), so the GC collects them together. If the parts hold unmanaged resources, the whole should implement IDisposable and dispose its parts.', level: 'Hard' },
    { q: 'Give real-world examples of composition.', a: 'Human-Heart, Building-Floor, Book-Chapter, Invoice-InvoiceLine, Order-OrderLine, Window-TitleBar, University-Department (if departments cannot exist outside the university).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a Laptop class composed of a Battery (capacity in mAh). The Laptop constructor takes the capacity and creates the Battery. Add a method BatteryInfo() that returns "Battery: 5000 mAh".',
      hint: 'Keep the battery in a private readonly field and create it in the constructor.',
      solution: `class Battery { public int Capacity { get; } public Battery(int c) { Capacity = c; } }

class Laptop
{
    private readonly Battery _battery;
    public Laptop(int capacity) { _battery = new Battery(capacity); }
    public string BatteryInfo() => $"Battery: {_battery.Capacity} mAh";
}

Console.WriteLine(new Laptop(5000).BatteryInfo());   // Battery: 5000 mAh`,
    },
    {
      task: 'Create a Book composed of Chapters. AddChapter(title, pages) creates the chapter; TotalPages() returns the sum. Expose chapters as IReadOnlyList.',
      hint: 'Same pattern as House and Room.',
      solution: `class Chapter { public string Title { get; } public int Pages { get; } public Chapter(string t, int p) { Title = t; Pages = p; } }

class Book
{
    private readonly List<Chapter> _chapters = new();
    public IReadOnlyList<Chapter> Chapters => _chapters;
    public void AddChapter(string title, int pages) => _chapters.Add(new Chapter(title, pages));
    public int TotalPages() { int t = 0; foreach (var c in _chapters) t += c.Pages; return t; }
}

var b = new Book(); b.AddChapter("Intro", 12); b.AddChapter("OOP", 30);
Console.WriteLine(b.TotalPages());   // 42`,
    },
    {
      task: 'Refactor this inheritance into composition: class Logger { public void Log(string m) => Console.WriteLine(m); } class ReportService : Logger { public void Run() { Log("Report generated"); } }',
      hint: 'A ReportService is not a Logger; it has a Logger.',
      solution: `class Logger { public void Log(string m) => Console.WriteLine(m); }

class ReportService
{
    private readonly Logger _logger = new Logger();   // composition
    public void Run() => _logger.Log("Report generated");
}

new ReportService().Run();   // Report generated`,
    },
    {
      task: 'Add a Clone() method to an Invoice composed of InvoiceLines (Item, Amount) that performs a deep copy. Prove that changing a line amount in the clone does not change the original.',
      hint: 'Create new InvoiceLine objects in Clone() instead of reusing the existing ones.',
      solution: `class InvoiceLine { public string Item { get; } public int Amount { get; set; } public InvoiceLine(string i, int a) { Item = i; Amount = a; } }

class Invoice
{
    private readonly List<InvoiceLine> _lines = new();
    public void Add(string item, int amount) => _lines.Add(new InvoiceLine(item, amount));
    public void SetAmount(int index, int amount) => _lines[index].Amount = amount;
    public int Total() { int t = 0; foreach (var l in _lines) t += l.Amount; return t; }
    public Invoice Clone()
    {
        var c = new Invoice();
        foreach (var l in _lines) c.Add(l.Item, l.Amount);
        return c;
    }
}

var inv = new Invoice(); inv.Add("Pen", 20); inv.Add("Bag", 500);
var copy = inv.Clone(); copy.SetAmount(1, 450);
Console.WriteLine($"{inv.Total()} {copy.Total()}");   // 520 470`,
    },
  ],
  quiz: [
    {
      question: 'Which statement best describes composition?',
      options: ['Parts are created outside and shared', 'The whole creates and owns parts that die with it', 'Two classes only know each other temporarily', 'A child class inherits from a parent class'],
      answer: 1,
      explanation: 'Composition is the strong whole-part relationship: the whole creates the parts and controls their lifetime.',
    },
    {
      question: 'In UML, composition is drawn with:',
      options: ['A hollow diamond', 'A dashed arrow', 'A hollow triangle', 'A filled diamond'],
      answer: 3,
      explanation: 'Filled diamond = composition, hollow diamond = aggregation, hollow triangle = inheritance, dashed arrow = dependency.',
    },
    {
      question: 'Which pair is the best example of composition?',
      options: ['House and Room', 'Team and Player', 'Teacher and Student', 'Library and Member'],
      answer: 0,
      explanation: 'A room cannot exist without its house. The other pairs have independent lifetimes.',
    },
    {
      question: 'Why does a composite class usually expose its parts as IReadOnlyList<T>?',
      options: ['It is faster than List<T>', 'It is required by the compiler', 'So callers cannot add or remove parts behind the whole\'s back', 'So the parts are deep-copied automatically'],
      answer: 2,
      explanation: 'IReadOnlyList hides Add/Remove, keeping the whole in control of its owned parts.',
    },
    {
      question: 'Which database rule typically represents composition between Order and OrderLine?',
      options: ['ON DELETE SET NULL', 'ON DELETE CASCADE', 'No foreign key at all', 'A UNIQUE constraint on OrderId'],
      answer: 1,
      explanation: 'Deleting the whole (Order) deletes its parts (OrderLines): cascade delete matches the shared lifetime.',
    },
  ],
};
