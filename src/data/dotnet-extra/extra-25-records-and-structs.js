const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `// record = reference type with VALUE-based equality, ToString, with-expressions
var s1 = new Student("Asha", 88);
var s2 = new Student("Asha", 88);

Console.WriteLine(s1);                       // compiler-generated ToString
Console.WriteLine(s1 == s2);                 // compares the data
Console.WriteLine(ReferenceEquals(s1, s2));  // still two different objects

// Non-destructive mutation: copy s1 and change only Marks
var s3 = s1 with { Marks = 95 };
Console.WriteLine(s3);
Console.WriteLine(s1.Marks);                 // original is unchanged

// Positional records get a Deconstruct method
var (name, marks) = s3;
Console.WriteLine($"{name} scored {marks}");

// A normal class compares references, and ToString prints the type name
var c1 = new StudentClass("Asha", 88);
var c2 = new StudentClass("Asha", 88);
Console.WriteLine(c1 == c2);
Console.WriteLine(c1);

record Student(string Name, int Marks);

class StudentClass
{
    public string Name { get; }
    public int Marks { get; }
    public StudentClass(string name, int marks) { Name = name; Marks = marks; }
}
`;
const ex2 = `// struct = value type (copied), class = reference type (shared)
PointStruct p1 = new PointStruct(1, 2);
PointStruct p2 = p1;          // full copy of the data
p2.X = 100;
Console.WriteLine($"p1.X = {p1.X}, p2.X = {p2.X}");

PointClass c1 = new PointClass(1, 2);
PointClass c2 = c1;           // copy of the reference only
c2.X = 100;
Console.WriteLine($"c1.X = {c1.X}, c2.X = {c2.X}");

MoveStruct(p1);
Console.WriteLine($"After MoveStruct: {p1.X}");
MoveClass(c1);
Console.WriteLine($"After MoveClass: {c1.X}");

PointStruct d = default;      // all fields zero
Console.WriteLine($"default struct: ({d.X}, {d.Y})");
Console.WriteLine(p1.Equals(new PointStruct(1, 2)));   // structs compare field values

static void MoveStruct(PointStruct p) => p.X += 5;     // changes the copy only
static void MoveClass(PointClass p) => p.X += 5;       // changes the shared object

struct PointStruct
{
    public int X;
    public int Y;
    public PointStruct(int x, int y) { X = x; Y = y; }
}

class PointClass
{
    public int X;
    public int Y;
    public PointClass(int x, int y) { X = x; Y = y; }
}
`;
const ex3 = `// record struct, readonly record struct and record inheritance
var m1 = new Money(150, "INR");
var m2 = m1 with { Amount = 200 };
Console.WriteLine(m1);
Console.WriteLine(m2);
Console.WriteLine(m1 == new Money(150, "INR"));
Console.WriteLine(m1.Add(m2));

// Positional record struct (not readonly): properties can be changed
var pos = new GridPos(1, 2);
pos.Row = 10;
Console.WriteLine(pos);

// Records support inheritance (record classes only)
Person p = new Employee("Ravi", "IT");
Console.WriteLine(p);
Console.WriteLine(p == new Person("Ravi"));          // different runtime types
Console.WriteLine(p == new Employee("Ravi", "IT"));

readonly record struct Money(decimal Amount, string Currency)
{
    public Money Add(Money other) => this with { Amount = Amount + other.Amount };
}

record struct GridPos(int Row, int Col);

record Person(string Name);
record Employee(string Name, string Dept) : Person(Name);
`;
const ex4 = `// Records are perfect DTOs: value equality makes Distinct, HashSet and Contains work by data
var cart = new List<Product>
{
    new("Pen", 10),
    new("Book", 50),
    new("Pen", 10),     // same data as the first item
};

var unique = cart.Distinct().ToList();
Console.WriteLine($"Total: {cart.Count}, Unique: {unique.Count}");
foreach (var item in unique)
    Console.WriteLine(item);

var set = new HashSet<Product>(cart);
Console.WriteLine($"HashSet count: {set.Count}");
Console.WriteLine(set.Contains(new Product("Book", 50)));

// Records with extra members and validation
var order = new Order(101, "Asha", 3);
Console.WriteLine(order.Summary);
try
{
    var bad = new Order(102, "Ravi", 0);
}
catch (ArgumentException ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}

record Product(string Name, int Price);

record Order(int Id, string Customer, int Qty)
{
    public int Qty { get; } = Qty > 0 ? Qty : throw new ArgumentException("Qty must be positive");
    public string Summary => $"Order {Id} for {Customer}: {Qty} item(s)";
}
`;

export default {
  id: 'extra-25-records-and-structs',
  title: 'Records and Structs in C#',
  module: 'Extra: Advanced C#',
  extraNo: 25,
  level: 'Intermediate',
  duration: '2 hours',
  summary: `Records give you data objects with value-based equality, a readable ToString, deconstruction and non-destructive copies (with) in one line. Structs are value types that are copied on assignment. Learn record class, record struct, readonly struct, readonly record struct, and how to choose between class, struct and record for DTOs, money values, points and API models.`,
  objectives: [
    'Declare positional records and use with-expressions, value equality and deconstruction',
    'Explain value-type (struct) copy semantics versus reference-type (class) sharing',
    'Use record struct and readonly record struct for small immutable values',
    'Use record inheritance and understand EqualityContract',
    'Choose correctly between class, struct and record in real projects',
  ],
  theory: [
    {
      heading: 'What is a record?',
      content: `A **record** (C# 9) is a class (or struct) designed to hold **data**. The compiler writes the boring code for you:
- **Value equality**: two records are equal when all their properties are equal (== and Equals compare data, not memory address).
- **ToString()**: prints Student { Name = Asha, Marks = 88 }.
- **Deconstruct**: var (name, marks) = student;
- **with-expression**: makes a copy with some properties changed.
- **init-only properties**: positional properties can be set only while creating the object.

Analogy: two printed copies of the same mark sheet are "equal" even though they are two different sheets of paper. A record compares the content of the sheet; a normal class compares which sheet of paper you are holding.`,
      syntax: `// positional record (one line!)
public record Student(string Name, int Marks);

// record with normal property syntax
public record Customer
{
    public required string Name { get; init; }
    public string City { get; init; } = "Pune";
}

var s1 = new Student("Asha", 88);
var s2 = s1 with { Marks = 95 };   // copy + change`,
      points: [
        'record and record class mean the same thing: a reference type',
        'Positional properties are { get; init; } for record class and readonly record struct',
        'Records are ideal for DTOs, API request/response models, events and configuration objects',
      ],
    },
    {
      heading: 'Structs: value types',
      content: `A **struct** is a **value type**. A variable of a struct type contains the data itself, not a reference. So:
- Assignment **copies** all fields (p2 = p1 makes an independent copy).
- Passing a struct to a method passes a copy (unless you use ref/in/out).
- A struct can never be null (except Nullable<T> like int?), and default(T) sets all fields to zero.
- Struct locals usually live on the stack or inline inside other objects - fewer heap allocations, less GC work.

Built-in structs you already use: int, double, decimal, bool, char, DateTime, TimeSpan, Guid.

Use a struct for **small** (about 16 bytes or less), **immutable**, value-like data: Point, Money, Color, Range. For anything big or with identity (Student, Order), use a class.`,
      syntax: `public struct Point
{
    public int X { get; set; }
    public int Y { get; set; }
    public Point(int x, int y) { X = x; Y = y; }
}

public readonly struct Temperature      // all fields must be readonly
{
    public double Celsius { get; }
    public Temperature(double c) => Celsius = c;
}`,
      tip: `Mutable structs cause surprising bugs (you change a copy, not the original). Prefer readonly struct.`,
    },
    {
      heading: 'record struct and readonly record struct (C# 10)',
      content: `C# 10 combines both ideas:
- **record struct**: a value type that also gets generated ToString, ==, Deconstruct and with. Its positional properties are **mutable** (get; set;).
- **readonly record struct**: same, but immutable (get; init;). This is the best choice for small value objects like Money, Coordinates or a Range.

Equality for structs is always value-based, but the generated record struct equality is faster than ValueType.Equals (which uses reflection for some structs).`,
      syntax: `public readonly record struct Money(decimal Amount, string Currency);
public record struct GridPos(int Row, int Col);

var m = new Money(100, "INR");
var m2 = m with { Amount = 250 };`,
    },
    {
      heading: 'Record inheritance, EqualityContract and customization',
      content: `Record **classes** can inherit from other records (not from classes, and classes cannot inherit from records). Record structs cannot inherit.

Each record has a hidden **EqualityContract** property returning its runtime type. Two records are equal only if they have the **same runtime type** and equal values. So a Person("Ravi") is not equal to an Employee("Ravi", "IT").

You can add methods, extra properties and validation to records, override ToString, or write your own Equals(T other) to change equality. Mark a record **sealed** if it should not be inherited.`,
      syntax: `public abstract record Shape(string Name);
public record Circle(double Radius) : Shape("Circle");
public sealed record Square(double Side) : Shape("Square");

public record Order(int Id, int Qty)
{
    public int Qty { get; } = Qty > 0 ? Qty : throw new ArgumentException("Qty must be positive");
}`,
    },
    {
      heading: 'class vs struct vs record - how to choose',
      content: `| Need | Use |
|---|---|
| Object with identity and behaviour (BankAccount, DbContext, Service) | class |
| Data that is compared by value, passed around, rarely changed (DTO, API model, event, message) | record (class) |
| Tiny immutable value, created in large numbers (Money, Point, Range) | readonly record struct / readonly struct |
| EF Core entity that is tracked and updated | class (records work, but value equality can confuse change tracking) |

Rules of thumb:
- Records are immutable by default - great for thread safety and for caching keys.
- with-expressions make a **shallow** copy: a List inside a record is shared between the original and the copy.
- Large structs are expensive to copy - keep them small or pass with **in**.`,
    },
    {
      heading: 'Records in ASP.NET Core and APIs',
      content: `Records are now the common way to write Web API DTOs:

public record CreateStudentRequest(string Name, string Email, int CourseId);
public record StudentResponse(int Id, string Name, string Course);

System.Text.Json can serialize and deserialize positional records (it uses the constructor). Model validation attributes can be placed on positional parameters with the property: target, e.g. [property: Required]. Records also work well as keys for dictionaries and caches because of their value equality and generated GetHashCode.`,
      syntax: `app.MapPost("/students", (CreateStudentRequest req) =>
    Results.Created($"/students/1", new StudentResponse(1, req.Name, "NET")));

public record CreateStudentRequest([property: Required] string Name, string Email, int CourseId);`,
    },
  ],
  examples: [
    {
      title: 'Record basics: equality, ToString, with and deconstruction',
      scenario: 'Compare two student objects created separately - once as a record and once as a normal class - and make a modified copy without changing the original.',
      steps: steps('RecordBasics'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `Student { Name = Asha, Marks = 88 }
True
False
Student { Name = Asha, Marks = 95 }
88
Asha scored 95
False
StudentClass`,
      explanation: `s1 and s2 are two different objects in memory (ReferenceEquals is False) but the record == compares data, so it prints True. with creates a NEW record s3; s1 still has 88 marks. The positional record gets a Deconstruct method, so var (name, marks) works. The class version compares references (False) and its default ToString prints only the type name.`,
    },
    {
      title: 'Struct copy semantics vs class reference semantics',
      scenario: 'Show why changing a copied struct does not affect the original, while two class variables share one object.',
      steps: steps('StructVsClass'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `p1.X = 1, p2.X = 100
c1.X = 100, c2.X = 100
After MoveStruct: 1
After MoveClass: 105
default struct: (0, 0)
True`,
      explanation: `p2 = p1 copies the struct, so changing p2 leaves p1 at 1. c2 = c1 copies only the reference: both variables point to the same object, so both show 100. MoveStruct receives a copy (p1 stays 1); MoveClass receives the reference and changes the shared object (100 + 5 = 105). default(PointStruct) has all fields zero. ValueType.Equals compares the field values, so it is True.`,
    },
    {
      title: 'record struct, readonly record struct and record inheritance',
      scenario: 'Model Money as an immutable value, a grid position as a mutable record struct, and an Employee record that inherits from Person.',
      steps: steps('RecordStructs'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Money { Amount = 150, Currency = INR }
Money { Amount = 200, Currency = INR }
True
Money { Amount = 350, Currency = INR }
GridPos { Row = 10, Col = 2 }
Employee { Name = Ravi, Dept = IT }
False
True`,
      explanation: `Money is a readonly record struct: you cannot write m1.Amount = 5, but with creates a modified copy. Add returns this with { Amount = 150 + 200 }. GridPos is a non-readonly record struct, so pos.Row = 10 is allowed. The Person variable holds an Employee; ToString prints the runtime type with all properties. Comparing with a Person("Ravi") is False because the EqualityContract (runtime type) differs; comparing with an equal Employee is True.`,
    },
    {
      title: 'Records as DTOs: Distinct, HashSet and validation',
      scenario: 'Remove duplicate products from a cart using value equality and validate a record property during construction.',
      steps: steps('RecordDto'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Total: 3, Unique: 2
Product { Name = Pen, Price = 10 }
Product { Name = Book, Price = 50 }
HashSet count: 2
True
Order 101 for Asha: 3 item(s)
Error: Qty must be positive`,
      explanation: `Distinct and HashSet use Equals/GetHashCode. Records generate both from the property values, so the two "Pen, 10" items are treated as duplicates (with a class you would get 3). Contains finds a newly created Book record because the data is equal. Order redeclares the positional Qty property and validates it, so Qty = 0 throws an ArgumentException.`,
    },
  ],
  interview: [
    { q: 'What is a record in C#?', a: 'A record is a type (class by default, or struct) intended for data. The compiler generates value-based Equals/GetHashCode/==, a readable ToString, a Deconstruct method for positional records, a copy constructor and support for with-expressions.', level: 'Easy' },
    { q: 'Difference between class and record?', a: 'Both are reference types (record class). A class uses reference equality by default; a record uses value equality. Records also generate ToString, Deconstruct and with support and are immutable by default (init-only positional properties).', level: 'Easy' },
    { q: 'Difference between struct and class?', a: 'A struct is a value type: assignment and parameter passing copy the data, it cannot be null, has no inheritance (only interfaces), and usually avoids heap allocations. A class is a reference type: variables hold a reference to a shared heap object, supports inheritance and can be null.', level: 'Easy' },
    { q: 'What does the with expression do?', a: 'It creates a new instance that is a shallow copy of the original with the listed properties changed: var s2 = s1 with { Marks = 95 }; The original is not modified. It works for records, record structs, normal structs and anonymous types.', level: 'Medium' },
    { q: 'Output? record P(int X); var a = new P(1); var b = new P(1); Console.WriteLine(a == b); Console.WriteLine(ReferenceEquals(a, b));', a: 'True then False. The records have equal values, but they are two separate objects.', level: 'Easy' },
    { q: 'Output? struct S { public int V; } S a = new S { V = 1 }; S b = a; b.V = 5; Console.WriteLine(a.V);', a: '1. b is a copy of a; changing b does not affect a.', level: 'Easy' },
    { q: 'What is the difference between record struct and readonly record struct?', a: 'record struct positional properties are mutable (get; set;). readonly record struct properties are init-only and the whole struct is immutable, which avoids defensive copies and accidental changes.', level: 'Medium' },
    { q: 'What is EqualityContract?', a: 'A protected virtual property generated in record classes that returns the runtime Type. Equals checks it, so records of different derived types are never equal even if the shared properties match.', level: 'Hard' },
    { q: 'Is a with-expression a deep copy?', a: 'No. It is a shallow copy. Reference-type members such as a List<string> are shared between the original and the copy, so modifying the list through one affects the other.', level: 'Medium' },
    { q: 'When should you avoid structs?', a: 'When the data is large (copying is expensive), needs to be mutable and shared, needs inheritance, or is frequently boxed (stored as object or a non-generic interface). Mutable structs are a common source of bugs.', level: 'Medium' },
    { q: 'Can a record inherit from a class?', a: 'No. A record class can inherit only from another record (or object), and a normal class cannot inherit from a record. Record structs cannot inherit at all, but they can implement interfaces.', level: 'Medium' },
    { q: 'Should EF Core entities be records?', a: 'Usually no. Entities have identity and are mutated and tracked; value-based equality and immutability conflict with change tracking. Use classes for entities and records for DTOs.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a positional record Book(string Title, string Author, int Price). Create two equal books and print ==, then create a discounted copy with Price reduced by 10 percent using with.',
      hint: 'var cheap = b1 with { Price = b1.Price * 90 / 100 };',
      solution: `var b1 = new Book("C# Basics", "Asha", 500);
var b2 = new Book("C# Basics", "Asha", 500);
Console.WriteLine(b1 == b2);                       // True
var cheap = b1 with { Price = b1.Price * 90 / 100 };
Console.WriteLine(cheap);                          // Book { Title = C# Basics, Author = Asha, Price = 450 }

record Book(string Title, string Author, int Price);`,
    },
    {
      task: 'Write a readonly struct Distance with a Km property and an Add method that returns a new Distance. Show that adding does not change the original.',
      hint: 'readonly struct members cannot change fields; return new Distance(Km + other.Km).',
      solution: `var d1 = new Distance(5);
var d2 = d1.Add(new Distance(3));
Console.WriteLine($"{d1.Km} {d2.Km}");   // 5 8

readonly struct Distance
{
    public int Km { get; }
    public Distance(int km) => Km = km;
    public Distance Add(Distance other) => new Distance(Km + other.Km);
}`,
    },
    {
      task: 'Create records CreateEmployeeRequest(string Name, string Dept, int Salary) and EmployeeResponse(int Id, string Name, string Dept). Write a method that maps a request to a response with an auto-incremented Id.',
      hint: 'Use a static int counter and return new EmployeeResponse(++nextId, req.Name, req.Dept).',
      solution: `int nextId = 0;
EmployeeResponse Map(CreateEmployeeRequest req) => new(++nextId, req.Name, req.Dept);

Console.WriteLine(Map(new("Asha", "IT", 50000)));   // EmployeeResponse { Id = 1, Name = Asha, Dept = IT }
Console.WriteLine(Map(new("Ravi", "HR", 40000)));   // EmployeeResponse { Id = 2, Name = Ravi, Dept = HR }

record CreateEmployeeRequest(string Name, string Dept, int Salary);
record EmployeeResponse(int Id, string Name, string Dept);`,
    },
    {
      task: 'Prove that with is a shallow copy: create record Team(string Name, List<string> Members), copy it with a new Name, add a member through the copy and print the original member count.',
      hint: 'Both records share the same List instance.',
      solution: `var t1 = new Team("A", new List<string> { "Asha" });
var t2 = t1 with { Name = "B" };
t2.Members.Add("Ravi");
Console.WriteLine(t1.Members.Count);   // 2 - same list!

record Team(string Name, List<string> Members);`,
    },
    {
      task: 'Create an abstract record Shape and records Circle(double R) and Rect(double W, double H) with an Area() method. Print the areas of a list of shapes rounded to 2 decimals using InvariantCulture.',
      hint: 'public abstract double Area(); in the base record; override in each derived record.',
      solution: `using System.Globalization;
var shapes = new List<Shape> { new Circle(1), new Rect(2, 3) };
foreach (var s in shapes)
    Console.WriteLine($"{s.GetType().Name}: {s.Area().ToString("0.00", CultureInfo.InvariantCulture)}");
// Circle: 3.14
// Rect: 6.00

abstract record Shape { public abstract double Area(); }
record Circle(double R) : Shape { public override double Area() => Math.PI * R * R; }
record Rect(double W, double H) : Shape { public override double Area() => W * H; }`,
    },
  ],
  quiz: [
    {
      question: 'What does == compare for two record class instances?',
      options: ['Their memory addresses', 'Their runtime type and property values', 'Only their hash codes', 'Only the first property'],
      answer: 1,
      explanation: 'Records generate value-based equality: same runtime type (EqualityContract) and equal property values.',
    },
    {
      question: 'Which declaration creates an immutable value type with generated ToString and equality?',
      options: ['record Money(decimal A);', 'class Money { }', 'struct Money { public decimal A; }', 'readonly record struct Money(decimal A);'],
      answer: 3,
      explanation: 'readonly record struct is a value type, immutable, and gets the record-generated members.',
    },
    {
      question: 'struct P { public int X; } P a = new P { X = 1 }; P b = a; b.X = 9; What is a.X?',
      options: ['1', '9', '0', 'Compile error'],
      answer: 0,
      explanation: 'Assigning a struct copies it, so b is independent of a.',
    },
    {
      question: 'What does var s2 = s1 with { Marks = 90 }; do?',
      options: ['Changes s1.Marks to 90', 'Creates a deep copy of s1 including nested lists', 'Creates a new shallow copy of s1 with Marks set to 90', 'Throws because records are immutable'],
      answer: 2,
      explanation: 'with makes a shallow copy and applies the listed property changes; the original is untouched.',
    },
    {
      question: 'Which type is the best choice for an ASP.NET Core API request DTO?',
      options: ['A mutable struct', 'A record', 'A static class', 'An enum'],
      answer: 1,
      explanation: 'Records are concise, immutable by default, support value equality and serialize well with System.Text.Json.',
    },
  ],
};
