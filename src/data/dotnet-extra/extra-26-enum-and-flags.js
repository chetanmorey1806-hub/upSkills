const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `// Enum basics: named constants backed by int (0, 1, 2 ... unless you set values)
OrderStatus s = OrderStatus.Shipped;
Console.WriteLine(s);                       // name
Console.WriteLine((int)s);                  // underlying value
Console.WriteLine((int)OrderStatus.Delivered);
Console.WriteLine((OrderStatus)1);          // int -> enum
Console.WriteLine((OrderStatus)7);          // no name for 7, prints the number

Console.WriteLine(string.Join(", ", Enum.GetNames<OrderStatus>()));
foreach (OrderStatus v in Enum.GetValues<OrderStatus>())
    Console.WriteLine($"{v} = {(int)v}");

Console.WriteLine(OrderStatus.Pending < OrderStatus.Shipped);   // enums compare by value
Console.WriteLine((byte)Size.Large);                             // Small=1, Medium=2, Large=3
Console.WriteLine(Enum.GetUnderlyingType(typeof(Size)).Name);   // the backing type

enum OrderStatus
{
    Pending,          // 0
    Confirmed,        // 1
    Shipped = 5,
    Delivered,        // 6 (previous + 1)
    Cancelled = 10
}

enum Size : byte { Small = 1, Medium, Large }
`;
const ex2 = `// Parsing user input safely and using enums in switch expressions
string[] inputs = { "Shipped", "delivered", "Unknown", "1", "42" };
foreach (var text in inputs)
{
    if (Enum.TryParse<OrderStatus>(text, true, out var status))
        Console.WriteLine($"'{text}' -> {status} (defined: {Enum.IsDefined(status)})");
    else
        Console.WriteLine($"'{text}' -> invalid");
}

foreach (var st in new[] { OrderStatus.Pending, OrderStatus.Delivered, OrderStatus.Cancelled })
    Console.WriteLine($"{st}: {Message(st)}");

OrderStatus parsed = Enum.Parse<OrderStatus>("Confirmed");
Console.WriteLine(parsed.ToString().ToUpper());

static string Message(OrderStatus s) => s switch
{
    OrderStatus.Pending => "Waiting for payment",
    OrderStatus.Confirmed => "Packing your items",
    OrderStatus.Shipped => "On the way",
    OrderStatus.Delivered => "Delivered. Enjoy!",
    _ => "Order closed"
};

enum OrderStatus { Pending, Confirmed, Shipped = 5, Delivered, Cancelled = 10 }
`;
const ex3 = `// [Flags]: each value is a separate bit, so one variable can hold many options
var p = Permission.Read | Permission.Write;
Console.WriteLine(p);                                  // Read, Write
Console.WriteLine((int)p);                             // 1 + 2
Console.WriteLine(p.HasFlag(Permission.Write));
Console.WriteLine((p & Permission.Delete) != 0);       // bitwise check

p |= Permission.Delete;                                // add a flag
Console.WriteLine(p);                                  // 7 = Admin
p &= ~Permission.Write;                                // remove a flag
Console.WriteLine(p);
p ^= Permission.Read;                                  // toggle a flag
Console.WriteLine(p);

Console.WriteLine(Permission.None);
Console.WriteLine((Permission)8);
Console.WriteLine(Enum.Parse<Permission>("Read, Delete") == (Permission.Read | Permission.Delete));

[Flags]
enum Permission
{
    None = 0,
    Read = 1,        // 0001
    Write = 2,       // 0010
    Delete = 4,      // 0100
    Admin = Read | Write | Delete   // 0111
}
`;
const ex4 = `// Real-world: working days with [Flags] + an extension method for display text
WorkDays office = WorkDays.Monday | WorkDays.Tuesday | WorkDays.Wednesday | WorkDays.Thursday | WorkDays.Friday;
WorkDays shop = WorkDays.Weekend | WorkDays.Friday;

Console.WriteLine($"Office: {office}");
Console.WriteLine($"Shop: {shop}");
Console.WriteLine($"Office open Saturday? {office.HasFlag(WorkDays.Saturday)}");
Console.WriteLine($"Both open on: {office & shop}");
Console.WriteLine($"Office days count: {office.CountDays()}");
Console.WriteLine(OrderStatus.OutForDelivery.ToLabel());

[Flags]
enum WorkDays
{
    None = 0,
    Monday = 1, Tuesday = 2, Wednesday = 4, Thursday = 8, Friday = 16,
    Saturday = 32, Sunday = 64,
    Weekdays = Monday | Tuesday | Wednesday | Thursday | Friday,
    Weekend = Saturday | Sunday
}

enum OrderStatus { Placed, OutForDelivery, Delivered }

static class EnumExtensions
{
    public static int CountDays(this WorkDays days)
    {
        int count = 0;
        foreach (WorkDays d in Enum.GetValues<WorkDays>())
            if (d is not (WorkDays.None or WorkDays.Weekdays or WorkDays.Weekend) && days.HasFlag(d))
                count++;
        return count;
    }

    public static string ToLabel(this OrderStatus s) => s switch
    {
        OrderStatus.OutForDelivery => "Out for delivery",
        _ => s.ToString()
    };
}
`;

export default {
  id: 'extra-26-enum-and-flags',
  title: 'Enum and [Flags] in C#',
  module: 'Extra: Advanced C#',
  extraNo: 26,
  level: 'Beginner to Intermediate',
  duration: '1.5 hours',
  summary: `An enum gives readable names to a fixed set of related numbers: order status, days, roles, payment modes. Learn how enum values are assigned, how to convert between enum, int and string, how to parse user input safely with TryParse and IsDefined, how to use enums in switch expressions, and how [Flags] enums store several options in one value using bitwise operators.`,
  objectives: [
    'Declare enums with default and explicit values and a custom underlying type',
    'Convert between enum, int and string with casts, ToString, Parse and TryParse',
    'Validate values with Enum.IsDefined and loop over GetValues / GetNames',
    'Create [Flags] enums and combine, test, add, remove and toggle flags with | & ^ ~',
    'Use enums with switch expressions and extension methods in real code',
  ],
  theory: [
    {
      heading: 'What is an enum?',
      content: `An **enum** (enumeration) is a value type that defines a set of **named constants**. Instead of remembering that status 2 means "Shipped", you write OrderStatus.Shipped.

Analogy: a lift panel. The buttons say "G, 1, 2, 3" - people read names, but the lift controller works with numbers internally.

Benefits:
- Readable code and fewer magic numbers
- The compiler checks the names (a typo is a compile error)
- IntelliSense shows every allowed value
- Works perfectly with switch statements and switch expressions`,
      syntax: `enum OrderStatus
{
    Pending,        // 0
    Confirmed,      // 1
    Shipped = 5,    // explicit value
    Delivered,      // 6 = previous + 1
    Cancelled = 10
}

OrderStatus s = OrderStatus.Pending;`,
      points: [
        'By default the first member is 0 and each next member is previous + 1',
        'The default underlying type is int; you can choose byte, short, long etc.: enum Size : byte { ... }',
        'default(OrderStatus) is always 0 - so define a meaningful zero member (None/Unknown/Pending)',
      ],
    },
    {
      heading: 'Converting: enum <-> int <-> string',
      content: `- **enum to int**: (int)OrderStatus.Shipped gives 5
- **int to enum**: (OrderStatus)1 gives Confirmed. Any int is allowed, even 7 which has no name - it just prints 7.
- **enum to string**: status.ToString() or string interpolation gives "Shipped"
- **string to enum**: Enum.Parse<OrderStatus>("Shipped") (throws on bad input) or Enum.TryParse<OrderStatus>(text, ignoreCase: true, out var st) (returns false).

Important: TryParse also accepts numbers like "42" and returns true even if 42 is not a defined member. Always combine it with **Enum.IsDefined** when the value comes from users or APIs.`,
      syntax: `int code = (int)OrderStatus.Delivered;                   // 6
OrderStatus fromInt = (OrderStatus)1;                    // Confirmed
string name = OrderStatus.Cancelled.ToString();          // "Cancelled"
bool ok = Enum.TryParse<OrderStatus>("shipped", true, out var st);
bool valid = ok && Enum.IsDefined(st);`,
    },
    {
      heading: 'Looping over members and using enums in switch',
      content: `- **Enum.GetValues<T>()** returns all values (sorted by numeric value).
- **Enum.GetNames<T>()** returns all names as strings - handy to fill a dropdown.
- **Enum.GetUnderlyingType(typeof(T))** tells you the backing integer type.

Switch expressions on enums are very readable. Always include a discard arm (_) because an enum variable can hold an undefined number.

In ASP.NET Core, enums are often shown in dropdowns with Html.GetEnumSelectList<T>(), stored in SQL Server as int columns by EF Core, and sent in JSON as numbers (or as strings with JsonStringEnumConverter).`,
      syntax: `foreach (var v in Enum.GetValues<OrderStatus>())
    Console.WriteLine($"{v} = {(int)v}");

string msg = status switch
{
    OrderStatus.Pending => "Waiting",
    OrderStatus.Shipped => "On the way",
    _ => "Other"
};`,
    },
    {
      heading: '[Flags] enums: many options in one value',
      content: `Sometimes a value can have **several** options at the same time: a user can Read AND Write; a shop opens Friday AND Saturday. A **[Flags]** enum uses powers of two (1, 2, 4, 8, 16 ...) so each member is a separate **bit**:

| Member | Value | Binary |
|---|---|---|
| Read | 1 | 0001 |
| Write | 2 | 0010 |
| Delete | 4 | 0100 |
| Admin = Read, Write, Delete | 7 | 0111 |

Bitwise operators:
- **|** (OR) combines: Read | Write
- **&** (AND) tests: (p & Write) != 0, or the easier **p.HasFlag(Write)**
- **|=** adds a flag, **&= ~X** removes a flag, **^=** toggles a flag

The [Flags] attribute makes ToString print "Read, Write" instead of 3.`,
      syntax: `[Flags]
enum Permission { None = 0, Read = 1, Write = 2, Delete = 4, Admin = Read | Write | Delete }

var p = Permission.Read | Permission.Write;
if (p.HasFlag(Permission.Write)) { /* allowed */ }
p |= Permission.Delete;    // add
p &= ~Permission.Write;    // remove`,
      tip: `Always give a [Flags] enum a None = 0 member and use powers of two. You can also write values as 1 << 0, 1 << 1, 1 << 2 ... to make the bits obvious.`,
    },
    {
      heading: 'Best practices',
      content: `- Use singular names for normal enums (OrderStatus) and plural names for flags (Permissions, WorkDays).
- Do not use enums for values that change often (product categories from a database) - use a lookup table instead.
- Never rely on the numeric values in business logic except when stored (database, API). If you store them, never renumber existing members - add new ones at the end with new numbers.
- Add an extension method (ToLabel/ToDisplayName) or the [Display(Name = "...")] attribute when you need friendly text with spaces.
- Validate enum input from APIs ([EnumDataType(typeof(OrderStatus))] or Enum.IsDefined).`,
    },
  ],
  examples: [
    {
      title: 'Enum basics: values, casts and listing members',
      scenario: 'An online shop tracks order status. Print names, numbers, convert ints back to statuses and list all members.',
      steps: steps('EnumBasics'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `Shipped
5
6
Confirmed
7
Pending, Confirmed, Shipped, Delivered, Cancelled
Pending = 0
Confirmed = 1
Shipped = 5
Delivered = 6
Cancelled = 10
True
3
Byte`,
      explanation: `Pending and Confirmed get 0 and 1 automatically, Shipped is set to 5 so Delivered continues at 6. (OrderStatus)7 is allowed even though no member has the value 7, so ToString just prints 7. GetNames/GetValues are ordered by value. Enums compare by their numbers (0 < 5). The Size enum is byte-backed, so Large = 3 and the underlying type name is Byte.`,
    },
    {
      title: 'Parsing user input and switch expressions',
      scenario: 'A support portal receives status text from users. Parse it safely, reject unknown values and show a customer-friendly message.',
      steps: steps('EnumParsing'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `'Shipped' -> Shipped (defined: True)
'delivered' -> Delivered (defined: True)
'Unknown' -> invalid
'1' -> Confirmed (defined: True)
'42' -> 42 (defined: False)
Pending: Waiting for payment
Delivered: Delivered. Enjoy!
Cancelled: Order closed
CONFIRMED`,
      explanation: `ignoreCase = true lets "delivered" match Delivered. "Unknown" fails. Numeric strings are accepted by TryParse: "1" maps to Confirmed, and "42" also succeeds but IsDefined returns False - this is why you should always check IsDefined. Cancelled has no specific arm, so the discard arm _ returns "Order closed".`,
    },
    {
      title: '[Flags] permissions with bitwise operators',
      scenario: 'Store a user\'s permissions in one value; add, remove, toggle and test individual permissions.',
      steps: steps('FlagsDemo'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Read, Write
3
True
False
Admin
Read, Delete
Delete
None
8
True`,
      explanation: `Read | Write = 1 + 2 = 3, printed as "Read, Write" thanks to [Flags]. Adding Delete gives 7, which exactly equals Admin, so ToString prints Admin. Removing Write (7 & ~2 = 5) prints "Read, Delete". Toggling Read with ^ turns bit 1 off, leaving Delete (4). 8 has no matching bit, so it prints the number. Enum.Parse understands the comma-separated flag format.`,
    },
    {
      title: 'Working days with Flags and enum extension methods',
      scenario: 'Compare the opening days of an office and a shop, count the days, and show friendly labels for an enum.',
      steps: steps('WorkDaysFlags'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Office: Weekdays
Shop: Friday, Weekend
Office open Saturday? False
Both open on: Friday
Office days count: 5
Out for delivery`,
      explanation: `Monday..Friday = 1+2+4+8+16 = 31, which exactly matches the composite member Weekdays, so ToString prints it. The shop value 16 + 32 + 64 is printed using the largest matching members: Weekend (96) plus Friday (16), listed from the smallest value. office & shop keeps only the common bit (Friday). CountDays skips the None and composite members and counts single days that are set. ToLabel is an extension method that returns friendly text.`,
    },
  ],
  interview: [
    { q: 'What is an enum and what is its default underlying type?', a: 'An enum is a value type that defines named integral constants. The default underlying type is int; you can choose byte, sbyte, short, ushort, int, uint, long or ulong.', level: 'Easy' },
    { q: 'What value does the first enum member get if none is specified?', a: '0, and each following member gets the previous value + 1 unless you assign values explicitly.', level: 'Easy' },
    { q: 'Output? enum E { A, B = 5, C } Console.WriteLine((int)E.C);', a: '6. C follows B (5) so it gets 5 + 1.', level: 'Easy' },
    { q: 'Output? enum E { A, B } Console.WriteLine((E)9);', a: '9. Casting any integer to an enum is allowed; there is no name for 9 so ToString prints the number.', level: 'Medium' },
    { q: 'Difference between Enum.Parse and Enum.TryParse?', a: 'Parse throws an ArgumentException for invalid text; TryParse returns false and sets the out value to default. Both accept numbers, so combine with Enum.IsDefined for validation.', level: 'Medium' },
    { q: 'What does the [Flags] attribute do?', a: 'It indicates the enum is a bit field. ToString and Parse then handle combinations (e.g. "Read, Write"). The values must still be powers of two; the attribute itself does not assign them.', level: 'Medium' },
    { q: 'How do you check, add and remove a flag?', a: 'Check: (value & Flag) != 0 or value.HasFlag(Flag). Add: value |= Flag. Remove: value &= ~Flag. Toggle: value ^= Flag.', level: 'Medium' },
    { q: 'Why should a [Flags] enum have None = 0?', a: 'Because default(T) is 0 and it represents "no flags". Also HasFlag(0) is always true, so a named None makes intent clear and avoids mistakes.', level: 'Medium' },
    { q: 'Output? [Flags] enum P { None = 0, R = 1, W = 2 } Console.WriteLine(P.R | P.W);', a: 'R, W', level: 'Easy' },
    { q: 'How are enums stored by EF Core and serialized by System.Text.Json?', a: 'EF Core stores them as int columns by default (HasConversion<string>() stores names). System.Text.Json writes the number by default; add JsonStringEnumConverter to write and read names.', level: 'Hard' },
    { q: 'Why is changing existing enum numbers dangerous?', a: 'Stored data (database rows, JSON, other services) contains the numbers. Renumbering silently changes the meaning of existing data. Only add new members with new values.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create enum PaymentMode { Cash, Card, Upi, NetBanking }. Ask the user to type a mode and print the processing fee: Cash 0, Card 2 percent, Upi 0, NetBanking 10 rupees (amount = 1000).',
      hint: 'Use Enum.TryParse with ignoreCase and a switch expression returning the fee.',
      solution: `Console.Write("Mode: ");
string? text = Console.ReadLine();
int amount = 1000;
if (Enum.TryParse<PaymentMode>(text, true, out var mode) && Enum.IsDefined(mode))
{
    int fee = mode switch
    {
        PaymentMode.Card => amount * 2 / 100,
        PaymentMode.NetBanking => 10,
        _ => 0
    };
    Console.WriteLine($"{mode} fee: {fee}");
}
else Console.WriteLine("Invalid mode");

enum PaymentMode { Cash, Card, Upi, NetBanking }`,
    },
    {
      task: 'Print a dropdown-style list of all values of enum Department { IT = 10, HR = 20, Sales = 30 } as "10 - IT".',
      hint: 'foreach over Enum.GetValues<Department>() and cast to int.',
      solution: `foreach (var d in Enum.GetValues<Department>())
    Console.WriteLine($"{(int)d} - {d}");

enum Department { IT = 10, HR = 20, Sales = 30 }`,
    },
    {
      task: 'Create a [Flags] enum Topping { None = 0, Cheese = 1, Onion = 2, Olive = 4, Paneer = 8 }. Build a pizza with Cheese and Paneer, add Onion, remove Cheese and print the final toppings and the price (base 200 + 30 per topping).',
      hint: 'Count set bits by looping through the single-bit members and using HasFlag.',
      solution: `var pizza = Topping.Cheese | Topping.Paneer;
pizza |= Topping.Onion;
pizza &= ~Topping.Cheese;
int count = Enum.GetValues<Topping>().Count(t => t != Topping.None && pizza.HasFlag(t));
Console.WriteLine($"{pizza}: {200 + count * 30}");   // Onion, Paneer: 260

[Flags] enum Topping { None = 0, Cheese = 1, Onion = 2, Olive = 4, Paneer = 8 }`,
    },
    {
      task: 'Write an extension method ToDisplay() for enum LeaveType { CasualLeave, SickLeave, EarnedLeave } that inserts a space before each capital letter (CasualLeave -> Casual Leave).',
      hint: 'Loop over the characters of ToString() and add a space before an upper-case letter that is not the first.',
      solution: `Console.WriteLine(LeaveType.SickLeave.ToDisplay());   // Sick Leave

enum LeaveType { CasualLeave, SickLeave, EarnedLeave }

static class LeaveExtensions
{
    public static string ToDisplay(this LeaveType t)
    {
        var sb = new System.Text.StringBuilder();
        foreach (char c in t.ToString())
        {
            if (char.IsUpper(c) && sb.Length > 0) sb.Append(' ');
            sb.Append(c);
        }
        return sb.ToString();
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'enum Level { Low, Medium = 4, High } - what is (int)Level.High?',
      options: ['2', '3', '5', '6'],
      answer: 2,
      explanation: 'High follows Medium (4), so it is 5.',
    },
    {
      question: 'Which method returns false instead of throwing for invalid input?',
      options: ['Enum.TryParse', 'Enum.Parse', 'Convert.ToInt32', '(OrderStatus)text'],
      answer: 0,
      explanation: 'TryParse returns a bool and uses an out parameter for the result.',
    },
    {
      question: 'Which values should the members of a [Flags] enum normally have?',
      options: ['1, 2, 3, 4', '0, 10, 20, 30', 'Random unique numbers', '0, 1, 2, 4, 8'],
      answer: 3,
      explanation: 'Powers of two (plus None = 0) so each member occupies its own bit.',
    },
    {
      question: 'How do you remove the Write flag from variable p?',
      options: ['p |= Permission.Write', 'p &= ~Permission.Write', 'p ^= ~Permission.Write', 'p -= Permission.Write'],
      answer: 1,
      explanation: '~Write has every bit set except Write; AND-ing clears only that bit.',
    },
    {
      question: 'Enum.TryParse<OrderStatus>("99", out var s) where 99 is not a member returns...',
      options: ['false', 'throws ArgumentException', 'true, and s is 99', 'true, and s is the first member'],
      answer: 2,
      explanation: 'Numeric strings are accepted even when undefined; check Enum.IsDefined(s) as well.',
    },
  ],
};
