const defaultObjectCode = `Student s1 = new Student(1, "Asha");
Student s2 = new Student(1, "Asha");   // same data, different object
Student s3 = s1;                       // same reference

Console.WriteLine($"s1.ToString()        : {s1.ToString()}");
Console.WriteLine($"s1.GetType().Name    : {s1.GetType().Name}");
Console.WriteLine($"s1 == s2             : {s1 == s2}");
Console.WriteLine($"s1.Equals(s2)        : {s1.Equals(s2)}");
Console.WriteLine($"s1 == s3             : {s1 == s3}");
Console.WriteLine($"ReferenceEquals(s1,s3): {object.ReferenceEquals(s1, s3)}");

s3.Name = "Asha K";                    // s3 and s1 are the same object
Console.WriteLine($"s1.Name after change : {s1.Name}");

// Strings are special: Equals and == compare the TEXT
string a = "hello";
string b = new string(new[] { 'h', 'e', 'l', 'l', 'o' });
Console.WriteLine($"a == b (strings)     : {a == b}");
Console.WriteLine($"same reference?      : {object.ReferenceEquals(a, b)}");

// A class WITHOUT any overrides of System.Object methods
class Student
{
    public int Id;
    public string Name;

    public Student(int id, string name)
    {
        Id = id;
        Name = name;
    }
}
`;

const productCode = `Product p1 = new Product(101, "Keyboard", 1500);
Product p2 = new Product(101, "Keyboard", 1500);
Product p3 = new Product(102, "Mouse", 700);

Console.WriteLine(p1);                                    // calls ToString()
Console.WriteLine($"p1.Equals(p2): {p1.Equals(p2)}");
Console.WriteLine($"p1 == p2: {p1 == p2}");               // still reference comparison
Console.WriteLine($"p1.Equals(p3): {p1.Equals(p3)}");
Console.WriteLine($"p1.Equals(null): {p1.Equals(null)}");
Console.WriteLine($"Same hash code p1/p2: {p1.GetHashCode() == p2.GetHashCode()}");

HashSet<Product> unique = new HashSet<Product> { p1, p2, p3 };
Console.WriteLine($"Unique products in HashSet: {unique.Count}");

List<Product> cart = new List<Product> { p1, p3 };
Product searchItem = new Product(102, "Mouse", 700);
Console.WriteLine($"Cart contains Mouse copy: {cart.Contains(searchItem)}");

class Product
{
    public int Id { get; }
    public string Name { get; }
    public int Price { get; }

    public Product(int id, string name, int price)
    {
        Id = id;
        Name = name;
        Price = price;
    }

    // 1. Human-readable text instead of the class name
    public override string ToString() => $"Product[{Id}] {Name} - Rs.{Price}";

    // 2. Value equality: same Id, Name and Price = equal
    public override bool Equals(object? obj)
    {
        if (obj is not Product other)      // null or another type -> false
        {
            return false;
        }
        return Id == other.Id && Name == other.Name && Price == other.Price;
    }

    // 3. Equal objects MUST return equal hash codes
    public override int GetHashCode() => HashCode.Combine(Id, Name, Price);
}
`;

const isAsCode = `object?[] things = { new Dog("Tommy"), new Cat("Kitty"), "Just a string", 25, null };

foreach (object? item in things)
{
    // 1. is  -> true/false type check
    Console.Write(item is Animal ? "Animal | " : "Other  | ");

    // 2. as  -> converted reference, or null if not possible (never throws)
    Dog? dog = item as Dog;
    Console.Write(dog != null ? $"Dog named {dog.Name} | " : "not a Dog | ");

    // 3. is with pattern matching -> check AND convert in one step
    if (item is int number)
        Console.WriteLine($"int doubled = {number * 2}");
    else if (item is string text)
        Console.WriteLine($"string length = {text.Length}");
    else if (item is null)
        Console.WriteLine("null value");
    else
        Console.WriteLine($"type = {item.GetType().Name}");
}

// Direct cast vs as
object pet = new Cat("Kitty");
try
{
    Dog d = (Dog)pet;                   // wrong type -> exception
    Console.WriteLine(d.Name);
}
catch (InvalidCastException)
{
    Console.WriteLine("(Dog)cat threw InvalidCastException");
}
Dog? maybeDog = pet as Dog;
Console.WriteLine($"cat as Dog is null? {maybeDog == null}");

class Animal
{
    public string Name { get; }
    public Animal(string name) { Name = name; }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }
}

class Cat : Animal
{
    public Cat(string name) : base(name) { }
}
`;

const boxingCode = `using System.Collections;

// 1. Boxing: value type -> object (copy goes to the heap)
int x = 10;
object boxed = x;
x = 20;
Console.WriteLine($"x = {x}, boxed = {boxed}");
Console.WriteLine($"Type inside the box: {boxed.GetType().Name}");

// 2. Unboxing: object -> value type (explicit cast to the EXACT type)
int y = (int)boxed;
Console.WriteLine($"y = {y}");

try
{
    long wrong = (long)boxed;          // box contains Int32, not Int64
    Console.WriteLine(wrong);
}
catch (InvalidCastException)
{
    Console.WriteLine("Unboxing int as long -> InvalidCastException");
}
long correct = (long)(int)boxed;       // unbox to int first, then convert
Console.WriteLine($"Correct way: (long)(int)boxed = {correct}");

// 3. Boxing a struct makes an independent copy
Point p = new Point { X = 1, Y = 2 };
object boxedPoint = p;
p.X = 100;
Console.WriteLine($"p.X = {p.X}, boxed copy X = {((Point)boxedPoint).X}");

// 4. Non-generic ArrayList boxes every int; List<int> does not
ArrayList oldList = new ArrayList();
for (int i = 1; i <= 5; i++)
{
    oldList.Add(i);                    // boxing
}
int sum1 = 0;
foreach (object item in oldList)
{
    sum1 += (int)item;                 // unboxing
}
Console.WriteLine($"ArrayList sum = {sum1} (5 boxings + 5 unboxings)");

List<int> newList = new List<int> { 1, 2, 3, 4, 5 };
int sum2 = 0;
foreach (int n in newList)
{
    sum2 += n;                         // no boxing at all
}
Console.WriteLine($"List<int> sum = {sum2} (no boxing)");

struct Point
{
    public int X;
    public int Y;
}
`;

const vsSteps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8.0 (LTS) or .NET 10.0 (LTS), click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging',
  'Debug tip: press F9 on a line, run with F5, hover over a variable or open Debug > Windows > Locals to see its value and runtime type',
];

export default {
  id: 'day-028-object-class-is-as-boxing-unboxing',
  title: 'Object Class, ToString(), Equals(), GetHashCode(), is, as, Boxing and Unboxing',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 28,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Every type in .NET ultimately derives from System.Object. Learn its members (ToString, Equals, GetHashCode, GetType, ReferenceEquals, MemberwiseClone), reference vs value equality, how to override ToString/Equals/GetHashCode correctly for object comparison, the is and as operators with pattern matching, and what boxing and unboxing are and why they cost performance. Finishes Module 2 with the Object comparison program.`,
  objectives: [
    'List the methods of System.Object and explain the default behaviour of each',
    'Differentiate reference equality from value equality (==, Equals, ReferenceEquals)',
    'Override ToString(), Equals() and GetHashCode() correctly and use objects in HashSet/List',
    'Use is, as, casting and pattern matching safely',
    'Explain boxing and unboxing, their cost and how generics avoid them',
  ],
  theory: [
    {
      heading: 'System.Object: The Root of All Types',
      content: `In C#, **every** type (classes, structs, enums, arrays, string, int, your own classes) directly or indirectly derives from **System.Object** (alias **object**). Even if you write class Student { }, the compiler treats it as class Student : object { }.

Analogy: **object is the common ancestor** in a huge family tree. Every member of the family inherits a few basic traits from that ancestor, such as having a name (ToString) and being identifiable (GetHashCode).

Members of System.Object:
| Member | Default behaviour |
|---|---|
| ToString() (virtual) | Returns the full type name, e.g. "Student" or "MyApp.Student" |
| Equals(object) (virtual) | Classes: reference equality. Structs: field-by-field comparison |
| GetHashCode() (virtual) | A number used by Dictionary/HashSet buckets |
| GetType() | Returns the runtime Type (cannot be overridden) |
| static ReferenceEquals(a, b) | True only if both refer to the same object |
| static Equals(a, b) | Null-safe call to a.Equals(b) |
| protected MemberwiseClone() | Shallow copy of the object |
| protected Finalize() | Called by the garbage collector (destructor syntax ~ClassName) |

Because everything is an object, an object variable or object[] array can hold **anything**: object o = 5; object s = "hi"; object st = new Student(...).`,
    },
    {
      heading: 'ToString(): Readable Text for Your Objects',
      content: `Console.WriteLine(obj) and string interpolation call **obj.ToString()** automatically. The default for a class just prints the type name (for example "Student", or "MyApp.Student" when the class is inside a namespace), which is useless for users and logs.

Override it to return meaningful text:

public override string ToString() => $"Product[{Id}] {Name} - Rs.{Price}";

Real-world analogy: a **name badge**. Without a badge, a visitor is just "Person". With a badge, you instantly know "Ravi Kumar, Developer, Badge 1001".

Built-in types already override it: 25.ToString() is "25", true.ToString() is "True", DateTime and decimal format according to culture.`,
      tip: 'Visual Studio shows ToString() output in the debugger tooltip and Locals window, so overriding it makes debugging much easier too.',
    },
    {
      heading: 'Equality: ==, Equals() and ReferenceEquals()',
      content: `Two kinds of equality:
- **Reference equality**: do both variables point to the **same object** in memory? (Same house.)
- **Value equality**: do both objects contain the **same data**? (Two houses built from the same blueprint with the same furniture.)

Default behaviour for **classes**:
- a == b → reference equality (unless the class overloads operator ==)
- a.Equals(b) → reference equality (unless overridden)
- object.ReferenceEquals(a, b) → always reference equality

Special cases:
- **string** overrides Equals and overloads ==, so they compare **text**.
- **structs** (int, DateTime, your own struct) use value equality in Equals by default.
- **records** (C# 9) generate value-based Equals, GetHashCode, ToString and == automatically.

So two Student objects with the same Id and Name are **not equal** by default. To treat them as equal, override Equals (and GetHashCode).`,
      points: [
        'Class default: compare references',
        'Struct default: compare field values',
        'string: compares characters',
        'record: compiler generates value equality',
      ],
    },
    {
      heading: 'Overriding Equals() and GetHashCode() Correctly',
      content: `Rules for a correct **Equals** override:
1. Return **false** for null or a different type (use obj is not Product other).
2. Compare the fields that define identity (Id, Name, Price).
3. It must be reflexive (a equals a), symmetric (a equals b ⇔ b equals a) and transitive.

**GetHashCode contract**: if a.Equals(b) is true, then a.GetHashCode() **must equal** b.GetHashCode(). (Equal hash codes do NOT guarantee equality; collisions are allowed.)

Why? **HashSet** and **Dictionary** first use GetHashCode to find a bucket, then Equals inside that bucket. If you override Equals but not GetHashCode, equal objects land in different buckets and duplicates appear. The compiler warns: **CS0659** "overrides Equals but does not override GetHashCode".

Easiest correct implementation: **HashCode.Combine(Id, Name, Price)**.

Notes:
- Hash codes of strings and HashCode.Combine are **randomised per process** in .NET Core, so never store them in a database or print them as fixed values.
- Prefer immutable fields (get-only properties) for equality; changing a field after adding the object to a HashSet makes it "lost".
- Optionally also implement IEquatable<Product> and overload == and != for consistency.`,
      syntax: `public override bool Equals(object? obj)
    => obj is Product other && Id == other.Id && Name == other.Name;

public override int GetHashCode() => HashCode.Combine(Id, Name);`,
    },
    {
      heading: 'Type Checking and Conversion: is, as and Casting',
      content: `When you have an object (or base class) reference, you often need to know or use its real type.

- **is** operator: returns true/false. if (item is Animal) ...
- **is with pattern** (C# 7+): checks and converts in one step: if (item is int number) { use number }. Also is null, is not null, is not Product other.
- **as** operator: tries to convert; returns the converted reference or **null**; **never throws**. Works only with reference types and nullable value types (not int).
- **Direct cast (Type)obj**: converts or throws **InvalidCastException** if the type is wrong.

Analogy: a security guard at a building:
- is = "Do you have an employee badge?" (yes/no)
- as = "If you have a badge, come in as an employee; otherwise I note you as nobody (null)"
- cast = "You MUST be an employee; if not, alarm! (exception)"

Which to use? Prefer **pattern matching (is Type name)**; use as + null check in older code; use a direct cast only when you are sure.`,
      syntax: `if (obj is Dog d) Console.WriteLine(d.Name);   // pattern matching
Dog? dog = obj as Dog;                          // null if not a Dog
Dog sure = (Dog)obj;                            // throws if not a Dog`,
    },
    {
      heading: 'Boxing and Unboxing',
      content: `**Boxing**: converting a **value type** (int, double, bool, struct) to **object** (or to an interface it implements). The runtime allocates a **box on the heap** and **copies** the value into it. It is implicit:
int x = 10; object o = x;   // boxing

**Unboxing**: extracting the value type back from the object. It is explicit and must use the **exact** type that was boxed:
int y = (int)o;    // unboxing OK
long z = (long)o;  // InvalidCastException (box contains Int32)

Analogy: **sending a gift by courier**. Boxing = packing the item into a parcel (extra work, extra material). Unboxing = opening the parcel; you must expect the right item, otherwise there is a mismatch. And the item in the parcel is a **copy**: changing your original afterwards does not change what is in the parcel.

Why care?
- Each boxing is a **heap allocation** + copy; each unboxing is a type check + copy. In loops with millions of items this adds memory pressure and garbage collection.
- Old non-generic collections (**ArrayList**, Hashtable) store object, so every int is boxed.
- **Generics** (List<int>, Dictionary<int,string>) store values directly: **no boxing**. This is a main reason to always use generic collections (Day 29–30).

Other hidden boxing: calling an interface method on a struct through the interface type, passing a value type to a parameter of type object (e.g. older string.Format overloads).`,
      points: [
        'Boxing: value type → object, implicit, heap allocation',
        'Unboxing: object → value type, explicit, exact type required',
        'Box holds a copy, not a link to the original',
        'Avoid with generics (List<T> instead of ArrayList)',
      ],
    },
  ],
  examples: [
    {
      title: 'Default Object Behaviour: ToString, ==, Equals, ReferenceEquals',
      scenario: 'A plain Student class with no overrides. Two objects with the same data are compared, then a third variable pointing to the same object is used.',
      steps: vsSteps('ObjectDefaults'),
      code: defaultObjectCode,
      csharp: { files: { 'Program.cs': defaultObjectCode }, stdin: '' },
      result: `s1.ToString()        : Student
s1.GetType().Name    : Student
s1 == s2             : False
s1.Equals(s2)        : False
s1 == s3             : True
ReferenceEquals(s1,s3): True
s1.Name after change : Asha K
a == b (strings)     : True
same reference?      : False`,
      explanation: `The default ToString() returns the type name; with top-level statements the class is in the global namespace, so it prints just "Student" (inside namespace MyApp it would print "MyApp.Student"). s1 and s2 hold the same data but are two different objects, so == and Equals (both reference-based for classes) give False. s3 = s1 copies the reference, so they are the same object and changing s3.Name changes s1.Name. Strings compare text with ==, so a == b is True even though b was built separately and is a different object (ReferenceEquals False).`,
    },
    {
      title: 'Object Comparison: Overriding ToString, Equals and GetHashCode',
      scenario: 'The syllabus task. Product overrides all three methods so two products with the same data are treated as equal by Equals, HashSet and List.Contains.',
      steps: vsSteps('ObjectComparison'),
      code: productCode,
      csharp: { files: { 'Program.cs': productCode }, stdin: '' },
      result: `Product[101] Keyboard - Rs.1500
p1.Equals(p2): True
p1 == p2: False
p1.Equals(p3): False
p1.Equals(null): False
Same hash code p1/p2: True
Unique products in HashSet: 2
Cart contains Mouse copy: True`,
      explanation: `Console.WriteLine(p1) uses the overridden ToString(). Equals compares Id, Name and Price, so p1 and p2 are equal, but == was not overloaded, so it still compares references (False). Equals(null) safely returns false thanks to the "is not Product" pattern. HashCode.Combine gives the same hash for equal values (the actual numbers change every run, so only the comparison is printed). The HashSet keeps p1 and p3 and rejects p2 as a duplicate, so Count = 2. List.Contains uses Equals, so a new Mouse object with the same data is found.`,
    },
    {
      title: 'is, as, Pattern Matching and InvalidCastException',
      scenario: 'An object?[] array holds a Dog, a Cat, a string, an int and null. Each item is examined with is, as and pattern matching; then a wrong direct cast is caught.',
      steps: vsSteps('IsAsDemo'),
      code: isAsCode,
      csharp: { files: { 'Program.cs': isAsCode }, stdin: '' },
      result: `Animal | Dog named Tommy | type = Dog
Animal | not a Dog | type = Cat
Other  | not a Dog | string length = 13
Other  | not a Dog | int doubled = 50
Other  | not a Dog | null value
(Dog)cat threw InvalidCastException
cat as Dog is null? True`,
      explanation: `Dog and Cat derive from Animal, so "is Animal" is true for them only. "as Dog" returns the Dog for Tommy and null for everything else, without exceptions. Pattern matching: 25 is int → 50; "Just a string" has 13 characters; null matches "is null"; Dog and Cat fall to GetType().Name. Note "is" returns false for null, so null prints "Other". Finally the direct cast (Dog)pet on a Cat throws InvalidCastException, while "pet as Dog" quietly gives null.`,
    },
    {
      title: 'Boxing and Unboxing in Action',
      scenario: 'See that a boxed value is a copy, that unboxing needs the exact type, that boxing a struct copies it, and how ArrayList boxes while List<int> does not.',
      steps: vsSteps('BoxingDemo'),
      code: boxingCode,
      csharp: { files: { 'Program.cs': boxingCode }, stdin: '' },
      result: `x = 20, boxed = 10
Type inside the box: Int32
y = 10
Unboxing int as long -> InvalidCastException
Correct way: (long)(int)boxed = 10
p.X = 100, boxed copy X = 1
ArrayList sum = 15 (5 boxings + 5 unboxings)
List<int> sum = 15 (no boxing)`,
      explanation: `object boxed = x copies 10 into a new heap object, so changing x to 20 later does not affect it. GetType() on the box reports Int32. Unboxing to long fails because the box holds an Int32; unbox to int first, then widen to long. Boxing the Point struct copies it, so p.X = 100 changes only the original. ArrayList stores object, so each Add boxes and each (int)item unboxes; List<int> stores ints directly. Both sums are 1+2+3+4+5 = 15. ArrayList needs using System.Collections; (not part of implicit usings).`,
    },
  ],
  interview: [
    { q: 'What is System.Object? Name its methods.', a: 'The ultimate base class of every .NET type. Public: ToString(), Equals(object), GetHashCode(), GetType(), static Equals(a,b), static ReferenceEquals(a,b). Protected: MemberwiseClone() and Finalize(). ToString, Equals and GetHashCode are virtual.', level: 'Easy' },
    { q: 'What does ToString() return by default for a class?', a: 'The fully qualified type name, e.g. "MyApp.Student" (just "Student" if the class has no namespace). Override it to return meaningful text; Console.WriteLine and interpolation call it automatically.', level: 'Easy' },
    { q: 'Difference between == and Equals() in C#?', a: 'For classes, both compare references by default. Equals is a virtual method and can be overridden for value equality; == is an operator that must be overloaded separately and is resolved at compile time based on the variable types. For string, both compare text. For value types, Equals compares values and == is defined for built-in types.', level: 'Medium' },
    { q: 'Why must GetHashCode be overridden when Equals is overridden?', a: 'Hash-based collections (HashSet, Dictionary) use GetHashCode to find the bucket and Equals to confirm. The contract says equal objects must have equal hash codes. Without overriding, two equal objects get different hash codes and the collection treats them as different (duplicates, failed lookups). The compiler warns CS0659.', level: 'Medium' },
    { q: 'Can two different objects have the same hash code?', a: 'Yes, that is a collision and is allowed. Equal hash codes do not imply equality; Equals is still checked. Only the reverse is required: equal objects must have equal hash codes.', level: 'Medium' },
    { q: 'Difference between is and as?', a: 'is returns a bool (true if the object is compatible with the type) and with patterns can also declare a converted variable (obj is Dog d). as performs the conversion and returns null on failure instead of throwing; it works only with reference types and nullable value types.', level: 'Easy' },
    { q: 'Difference between a direct cast and as?', a: 'A direct cast (Dog)obj throws InvalidCastException if the type is wrong and works with value types (unboxing). as returns null on failure, never throws, and cannot be used with non-nullable value types like int.', level: 'Easy' },
    { q: 'What is boxing and unboxing?', a: 'Boxing converts a value type to object (or an interface), allocating a heap object and copying the value; it is implicit. Unboxing extracts the value back with an explicit cast to the exact original type; otherwise InvalidCastException is thrown.', level: 'Easy' },
    { q: 'Why is boxing bad for performance and how do you avoid it?', a: 'Each boxing allocates on the heap and copies data, increasing garbage collection; unboxing adds type checks and copies. Avoid it by using generic collections (List<int> instead of ArrayList), generic methods, and by not passing value types as object unnecessarily.', level: 'Medium' },
    { q: 'What is the output?\nint i = 5; object o = i; i++; Console.WriteLine($"{i} {o}");', a: 'Output: 6 5. Boxing copies the value 5 into the box; incrementing i afterwards does not affect the boxed copy.', level: 'Medium' },
    { q: 'What is the output?\nobject o = 10; long l = (long)o;', a: 'It throws InvalidCastException at runtime. A boxed Int32 can only be unboxed to int (or int?). Correct: long l = (long)(int)o;', level: 'Hard' },
    { q: 'What is the output?\nstring a = "hi"; object b = new string("hi".ToCharArray());\nConsole.WriteLine(a == b); Console.WriteLine(a.Equals(b));', a: 'False then True. With one operand typed object, == becomes reference comparison (object ==), and they are different objects (the compiler also warns CS0253). a.Equals(b) calls string.Equals which compares text, so True.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a BankAccount class (AccountNo, Holder, Balance). Override ToString() to print "AccountNo - Holder - Balance" and Equals/GetHashCode so two accounts with the same AccountNo are equal. Test with a List<BankAccount>.Contains().',
      hint: 'Equality should use only AccountNo: HashCode.Combine(AccountNo) or AccountNo.GetHashCode().',
      solution: `BankAccount a1 = new BankAccount("SB100", "Ravi", 5000);
BankAccount a2 = new BankAccount("SB100", "Ravi", 9000);
Console.WriteLine(a1);                 // SB100 - Ravi - 5000
Console.WriteLine(a1.Equals(a2));      // True (same account number)
List<BankAccount> list = new List<BankAccount> { a1 };
Console.WriteLine(list.Contains(a2));  // True

class BankAccount
{
    public string AccountNo { get; }
    public string Holder { get; }
    public int Balance { get; }
    public BankAccount(string no, string holder, int balance) { AccountNo = no; Holder = holder; Balance = balance; }
    public override string ToString() => $"{AccountNo} - {Holder} - {Balance}";
    public override bool Equals(object? obj) => obj is BankAccount other && AccountNo == other.AccountNo;
    public override int GetHashCode() => AccountNo.GetHashCode();
}`,
    },
    {
      task: 'Write a method Describe(object o) that uses a switch with type patterns to return "Integer: n", "Text: s (length)", "Decimal number", "Student: name" or "Unknown". Call it with several values.',
      hint: 'switch expression: o switch { int n => ..., string s => ..., null => ..., _ => ... }.',
      solution: `Console.WriteLine(Describe(42));          // Integer: 42
Console.WriteLine(Describe("Hello"));     // Text: Hello (5)
Console.WriteLine(Describe(9.5m));        // Decimal number
Console.WriteLine(Describe(null));        // Nothing
Console.WriteLine(Describe(true));        // Unknown

static string Describe(object? o) => o switch
{
    int n => $"Integer: {n}",
    string s => $"Text: {s} ({s.Length})",
    decimal => "Decimal number",
    null => "Nothing",
    _ => "Unknown"
};`,
    },
    {
      task: 'Given object[] data = { 10, "20", 30, "abc", 40 }; compute the sum of all ints and of all strings that can be parsed as ints. Use is patterns and int.TryParse.',
      hint: 'if (item is int n) sum += n; else if (item is string s && int.TryParse(s, out int v)) sum += v;',
      solution: `object[] data = { 10, "20", 30, "abc", 40 };
int sum = 0;
foreach (object item in data)
{
    if (item is int n) sum += n;                                       // unboxing via pattern
    else if (item is string s && int.TryParse(s, out int v)) sum += v;
}
Console.WriteLine(sum);   // 100`,
    },
    {
      task: 'Measure the difference between ArrayList and List<int>: add 1 to 1,000,000 numbers in each and time it with System.Diagnostics.Stopwatch. Print the elapsed milliseconds (values vary by machine).',
      hint: 'Stopwatch sw = Stopwatch.StartNew(); ... sw.ElapsedMilliseconds. Add using System.Collections; and using System.Diagnostics;',
      solution: `using System.Collections;
using System.Diagnostics;

Stopwatch sw = Stopwatch.StartNew();
ArrayList al = new ArrayList();
for (int i = 0; i < 1_000_000; i++) al.Add(i);          // boxing
long s1 = 0; foreach (object o in al) s1 += (int)o;     // unboxing
Console.WriteLine($"ArrayList: {sw.ElapsedMilliseconds} ms");

sw.Restart();
List<int> list = new List<int>();
for (int i = 0; i < 1_000_000; i++) list.Add(i);
long s2 = 0; foreach (int n in list) s2 += n;
Console.WriteLine($"List<int>: {sw.ElapsedMilliseconds} ms");
// List<int> is usually several times faster (exact numbers vary).`,
    },
    {
      task: 'Rewrite the Product class as a record: public record Product(int Id, string Name, int Price); and check that ToString, Equals, == and GetHashCode now work by value without writing any override.',
      hint: 'Records generate value-based equality and a ToString like "Product { Id = 101, Name = Keyboard, Price = 1500 }".',
      solution: `Product p1 = new Product(101, "Keyboard", 1500);
Product p2 = new Product(101, "Keyboard", 1500);
Console.WriteLine(p1);           // Product { Id = 101, Name = Keyboard, Price = 1500 }
Console.WriteLine(p1 == p2);     // True
Console.WriteLine(p1.Equals(p2));// True
Console.WriteLine(p1.GetHashCode() == p2.GetHashCode()); // True

public record Product(int Id, string Name, int Price);`,
    },
  ],
  quiz: [
    {
      question: 'Which method of System.Object can NOT be overridden?',
      options: ['ToString()', 'Equals(object)', 'GetHashCode()', 'GetType()'],
      answer: 3,
      explanation: 'GetType() is not virtual; it always returns the runtime type. The other three are virtual.',
    },
    {
      question: 'For two different objects of a class with no overrides and identical data, a.Equals(b) returns...',
      options: ['False', 'True', 'It depends on the data', 'Compile error'],
      answer: 0,
      explanation: 'The default Equals for classes compares references, and they are different objects.',
    },
    {
      question: 'What does obj as Dog return if obj is a Cat?',
      options: ['A Dog with default values', 'InvalidCastException', 'null', 'The Cat object'],
      answer: 2,
      explanation: 'as never throws; it returns null when the conversion is not possible.',
    },
    {
      question: 'int i = 7; object o = i; i = 9; Console.WriteLine(o); prints...',
      options: ['9', '7', '0', 'System.Int32'],
      answer: 1,
      explanation: 'Boxing copies the value 7 into the box; later changes to i do not affect it.',
    },
    {
      question: 'If you override Equals() but not GetHashCode(), what is the main problem?',
      options: ['Code will not compile', 'ToString() stops working', 'Hash-based collections like HashSet and Dictionary may treat equal objects as different', 'Boxing happens on every call'],
      answer: 2,
      explanation: 'Equal objects must have equal hash codes, otherwise HashSet/Dictionary put them in different buckets. The compiler only warns (CS0659).',
    },
  ],
};
