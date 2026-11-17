const protectCode = `// Day 20 - Example 1: Bank balance protection - public field vs encapsulated class
var bad = new UnsafeAccount();
bad.Balance = -50000;                       // anyone can write anything!
Console.WriteLine($"Unsafe balance: {bad.Balance}");

var acc = new SafeAccount("Nikhil", 10000);
acc.Deposit(5000);
acc.Withdraw(20000);
acc.Withdraw(4000);
acc.Deposit(-100);
Console.WriteLine($"Final balance of {acc.Holder}: {acc.Balance}");

// acc.Balance = 1000000;   // error CS0200: Property 'Balance' cannot be assigned to - it is read only
// acc.balance = 1000000;   // error CS0122: 'balance' is inaccessible due to its protection level

class UnsafeAccount
{
    public int Balance;                     // no protection at all
}

class SafeAccount
{
    private int balance;                    // data is hidden
    public string Holder { get; }
    public int Balance => balance;          // read-only window to the data

    public SafeAccount(string holder, int openingBalance)
    {
        Holder = holder;
        balance = openingBalance;
    }

    public void Deposit(int amount)         // controlled way in
    {
        if (amount <= 0)
        {
            Console.WriteLine($"Rejected: deposit amount must be positive ({amount})");
            return;
        }
        balance += amount;
        Console.WriteLine($"Deposited {amount}. Balance: {balance}");
    }

    public void Withdraw(int amount)        // controlled way out
    {
        if (amount > balance)
        {
            Console.WriteLine($"Rejected: insufficient funds to withdraw {amount} (balance {balance})");
            return;
        }
        balance -= amount;
        Console.WriteLine($"Withdrew {amount}. Balance: {balance}");
    }
}`;

const propertyCode = `// Day 20 - Example 2: Properties with validation (get / set / private set / computed)
var emp = new Employee();
emp.Name = "  Anita ";
emp.Age = 28;
emp.Salary = 45000;
Console.WriteLine($"{emp.Name}, {emp.Age}, {emp.Salary}, annual {emp.AnnualSalary}");

try
{
    emp.Age = 15;
}
catch (ArgumentException ex)
{
    Console.WriteLine("Error: " + ex.Message);
}

try
{
    emp.Name = "   ";
}
catch (ArgumentException ex)
{
    Console.WriteLine("Error: " + ex.Message);
}

emp.GiveRaise(10);
Console.WriteLine($"After raise: {emp.Name}, {emp.Age}, {emp.Salary}, Id {emp.EmployeeId}");
// emp.EmployeeId = 5;      // error CS0272: the set accessor is inaccessible
// emp.AnnualSalary = 1;    // error CS0200: read only

class Employee
{
    private static int nextId = 1;
    private string name = "";
    private int age = 18;
    private int salary;

    public int EmployeeId { get; private set; } = nextId++;   // readable outside, writable only inside

    public string Name
    {
        get => name;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Name cannot be empty");
            name = value.Trim();
        }
    }

    public int Age
    {
        get => age;
        set
        {
            if (value < 18 || value > 60)
                throw new ArgumentException("Age must be between 18 and 60");
            age = value;
        }
    }

    public int Salary
    {
        get => salary;
        set => salary = value < 0 ? 0 : value;
    }

    public int AnnualSalary => salary * 12;      // computed, read-only

    public void GiveRaise(int percent) => salary += salary * percent / 100;
}`;

const modifiersCode = `// Day 20 - Example 3: All access modifiers in one program
var acc = new SavingsAccount("Pooja", 20000);
acc.ShowSummary();                       // public method
acc.AddInterest();                       // public method in the child class
Console.WriteLine($"Holder (public): {acc.Holder}");
Console.WriteLine($"Branch (internal): {acc.BranchCode}");
Console.WriteLine($"Ifsc (protected internal): {acc.IfscPrefix}");

// Console.WriteLine(acc.pin);        // CS0122: private - only inside Account
// Console.WriteLine(acc.balance);    // CS0122: protected - only inside Account and its children
// Console.WriteLine(acc.riskScore);  // CS0122: private protected - children in the SAME assembly only

class Account
{
    public string Holder;                          // everyone
    private int pin = 4321;                        // only this class
    protected int balance;                         // this class + derived classes
    internal string BranchCode = "PUN-001";        // any code in this project (assembly)
    protected internal string IfscPrefix = "DEMO"; // this project OR derived classes anywhere
    private protected int riskScore = 2;           // derived classes in this project only

    public Account(string holder, int openingBalance)
    {
        Holder = holder;
        balance = openingBalance;
    }

    public void ShowSummary() =>
        Console.WriteLine($"Holder {Holder}, balance {balance}, pin ends with {pin % 10}");
}

class SavingsAccount : Account
{
    public SavingsAccount(string holder, int openingBalance) : base(holder, openingBalance) { }

    public void AddInterest()
    {
        balance += balance * 5 / 100;           // protected: allowed in the child
        // pin = 1111;                           // CS0122: private is NOT visible even to children
        Console.WriteLine($"Interest added. New balance: {balance}, risk score: {riskScore}");
    }
}`;

const historyCode = `// Day 20 - Example 4: Protecting a collection - read-only transaction history
var acc = new BankAccount(5001, "Ravi");
acc.Deposit(10000);
acc.Withdraw(2500);
acc.Withdraw(9000);

Console.WriteLine($"Statement for {acc.AccountNo} - {acc.Holder}:");
foreach (string entry in acc.Transactions)
    Console.WriteLine("  " + entry);
Console.WriteLine($"Balance: {acc.Balance}, Entries: {acc.Transactions.Count}");

// acc.Transactions.Add("Deposit 1000000");   // error CS1061: IReadOnlyList<string> has no Add method

class BankAccount
{
    private readonly List<string> transactions = new List<string>();

    public int AccountNo { get; }
    public string Holder { get; }
    public int Balance { get; private set; }
    public IReadOnlyList<string> Transactions => transactions.AsReadOnly();

    public BankAccount(int accountNo, string holder)
    {
        AccountNo = accountNo;
        Holder = holder;
    }

    public void Deposit(int amount)
    {
        Balance += amount;
        transactions.Add($"Deposit {amount} -> {Balance}");
    }

    public void Withdraw(int amount)
    {
        if (amount > Balance)
        {
            transactions.Add($"FAILED Withdraw {amount} (balance {Balance})");
            return;
        }
        Balance -= amount;
        transactions.Add($"Withdraw {amount} -> {Balance}");
    }
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App',
  `Name it ${name}, choose .NET 8 or .NET 10, click Create`,
  'Replace Program.cs with the code',
  'Press Ctrl+F5 to run without debugging',
];

export default {
  id: 'day-020-encapsulation-access-modifiers',
  title: 'Encapsulation and Access Modifiers',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 20,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Encapsulation is the first pillar of OOP: keep data private and allow changes only through controlled members that enforce the rules. Today you learn why public fields are dangerous, how private fields + properties + methods protect a bank balance, property forms (get/set, private set, computed, init), all six C# access modifiers (public, private, protected, internal, protected internal, private protected) with their default values, and how to expose a collection without letting callers modify it.`,
  objectives: [
    'Explain encapsulation with real-world analogies and why public fields break it',
    'Protect a bank balance with a private field, a read-only property and validating methods',
    'Write properties with validation, private set and computed values',
    'Describe all six access modifiers and the default accessibility of classes and members',
    'Expose internal collections safely using IReadOnlyList',
  ],
  theory: [
    {
      heading: 'What is Encapsulation?',
      content: `**Encapsulation** means **wrapping data (fields) and the code that works on that data (methods/properties) into one unit (a class)**, and **hiding the data** so that it can only be changed through **controlled, validated members**.

Real-world analogy 1 - **ATM machine**: you cannot open the ATM and take cash from the box directly. You must use the controlled interface: insert card, enter PIN, choose amount. The machine checks your PIN and balance before giving money. The cash box is private; the keypad is public.

Real-world analogy 2 - **medicine capsule**: the medicine (data) is wrapped inside a capsule shell (class). You swallow the capsule; you do not handle the powder directly.

Real-world analogy 3 - **car**: you control speed using the accelerator and brake (public methods). You cannot directly change the fuel injection timing (private data).

Two parts of encapsulation:
1. **Data hiding** - fields are private.
2. **Controlled access** - public properties/methods that validate (no negative deposit, no overdraft, age 18-60).

Benefits: data is always valid, rules live in one place, internal code can change without breaking callers, easier debugging and security.`,
    },
    {
      heading: 'Implementing Encapsulation: private fields, properties and methods',
      content: `Steps:
1. Make the field **private** (private int balance;).
2. Provide a **property** to read it (often read-only: public int Balance => balance;).
3. Provide **methods** that change it with validation (Deposit, Withdraw).

Property forms you will use daily:
- **Full property** with backing field and validation in set.
- **Auto-property** public string Name { get; set; } - compiler creates the hidden field (no validation).
- **private set** - public int Balance { get; private set; } - outside can read, only the class can write.
- **get-only** - public int Id { get; } - set only in the constructor.
- **init** - public string Code { get; init; } - can be set in an object initializer, then never again.
- **Computed** - public int AnnualSalary => Salary * 12; - no storage, calculated on read.

In a property setter, the keyword **value** holds the new value being assigned.`,
      syntax: `private int age;
public int Age
{
    get { return age; }
    set
    {
        if (value < 18 || value > 60)
            throw new ArgumentException("Age must be between 18 and 60");
        age = value;
    }
}

public int Balance { get; private set; }     // read outside, write inside
public string Code { get; init; } = "";       // set once at creation
public int AnnualSalary => Salary * 12;       // computed`,
      tip: `Prefer properties over public fields even when there is no validation today: changing a field to a property later is a breaking change for compiled callers, and frameworks (data binding, JSON, EF Core, model validation) work with properties.`,
    },
    {
      heading: 'Access Modifiers in C#',
      content: `Access modifiers decide **who can see a type or member**. C# has six:

| Modifier | Accessible from |
| --- | --- |
| public | anywhere (any class, any project referencing it) |
| private | only inside the same class (or struct) |
| protected | the same class + derived (child) classes, in any project |
| internal | any code in the same assembly (the same project/DLL) |
| protected internal | same assembly OR derived classes in other assemblies (union) |
| private protected | derived classes that are ALSO in the same assembly (intersection), C# 7.2+ |

Real-world analogy - a **house**:
- public = the street name board (everyone sees it)
- private = your personal diary (only you)
- protected = family jewellery (you and your children)
- internal = society clubhouse (everyone living in the same society/project)
- protected internal = society members OR your children even if they live elsewhere
- private protected = only your children who also live in the same society

An **assembly** is the compiled output of a project (.dll or .exe). Two projects in one solution are two assemblies.`,
      points: [
        'Default for class members (fields, methods, properties) is private',
        'Default for top-level classes, structs, interfaces and enums is internal',
        'Top-level types can only be public or internal (C# 11 also added file for source-generator scenarios)',
        'Interface members are public by default; enum members are always public',
        'Nested types default to private',
        'A member cannot be more accessible than its type in a signature (public method returning an internal class gives CS0050)',
      ],
    },
    {
      heading: 'Choosing the Right Access Level',
      content: `Golden rule: **start as private and open up only when needed** ("principle of least privilege").

- **private**: fields, helper methods, internal state (balance, pin, transaction list).
- **public**: the "contract" other code needs (Deposit, Withdraw, Balance getter).
- **protected**: things child classes must use or customise (Day 21-24 - for example a base balance that SavingsAccount adds interest to).
- **internal**: helpers shared inside one project but hidden from other projects (a repository class used only inside the data layer).
- **protected internal / private protected**: rare; library authors use them.

Encapsulation vs abstraction (frequent interview question):
- **Encapsulation** = HOW we hide - private data + controlled access. Implementation level.
- **Abstraction** = WHAT we show - only essential features, hiding complexity (abstract classes/interfaces, Day 25-26). Design level.
An ATM screen shows "Withdraw" (abstraction); the locked cash box and PIN check protect the money (encapsulation).`,
    },
    {
      heading: 'Protecting Collections and Common Mistakes',
      content: `A private List<string> field exposed through a public List<string> property is **not encapsulated**: the caller can still call .Add(), .Clear() or .Remove() and bypass all your rules.

Better options:
- Expose **IReadOnlyList<T>** or **IReadOnlyCollection<T>** / **IEnumerable<T>**.
- Return **list.AsReadOnly()** (a wrapper whose Add throws, and which cannot be cast back to List<T>).
- Return a copy (list.ToList()) when the caller may need its own list.

Other common mistakes:
- Public setters on everything (public int Balance { get; set; }) - looks like encapsulation but is the same as a public field.
- Validation in the UI only - always validate in the class too.
- Throwing away invalid input silently - prefer throwing ArgumentException or returning false with a message so the caller knows.
- Making fields protected "just in case" - children can then break your rules; prefer private fields with protected methods.`,
      syntax: `private readonly List<string> transactions = new();
public IReadOnlyList<string> Transactions => transactions.AsReadOnly();`,
    },
  ],
  examples: [
    {
      title: 'Bank Balance Protection',
      scenario: `With a public field, any code can set a balance to -50000. The encapsulated SafeAccount hides the balance, exposes it read-only and allows changes only through Deposit and Withdraw, which enforce the bank's rules.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it BankBalanceProtection, click Create',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Uncomment acc.Balance = 1000000; and press Ctrl+Shift+B - read error CS0200 in the Error List, then comment it again',
      ],
      code: protectCode,
      csharp: { files: { 'Program.cs': protectCode }, stdin: '' },
      result: `Unsafe balance: -50000
Deposited 5000. Balance: 15000
Rejected: insufficient funds to withdraw 20000 (balance 15000)
Withdrew 4000. Balance: 11000
Rejected: deposit amount must be positive (-100)
Final balance of Nikhil: 11000`,
      explanation: `UnsafeAccount accepts the impossible value -50000. SafeAccount starts at 10000; +5000 = 15000; withdrawing 20000 is rejected because it is more than 15000; withdrawing 4000 leaves 11000; the negative deposit is rejected. The balance can never become invalid because the only way to change it goes through the checks.`,
    },
    {
      title: 'Employee Properties with Validation',
      scenario: `HR software must never store an empty name or an age outside 18-60, and the employee Id must be generated by the system. Properties validate in their setters; invalid values throw ArgumentException and the old valid value stays.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it EmployeeProperties, click Create',
        'Replace Program.cs with the code',
        'Put a breakpoint (F9) inside the Age setter, press F5 and watch "value" in the Locals window when emp.Age = 15 runs',
        'Run with Ctrl+F5 for the full output',
      ],
      code: propertyCode,
      csharp: { files: { 'Program.cs': propertyCode }, stdin: '' },
      result: `Anita, 28, 45000, annual 540000
Error: Age must be between 18 and 60
Error: Name cannot be empty
After raise: Anita, 28, 49500, Id 1`,
      explanation: `The Name setter trims "  Anita " to "Anita". 45000 * 12 = 540000. Setting Age to 15 throws before age is changed, so age stays 28; the blank name throws too, so Name stays "Anita". GiveRaise(10) adds 45000 * 10 / 100 = 4500 -> 49500. EmployeeId was set once from the static counter (1) and has a private setter.`,
    },
    {
      title: 'All Six Access Modifiers in One Program',
      scenario: `An Account class marks each member with a different access modifier. A SavingsAccount child class and the top-level program try to use them, showing what is visible from where. (base(...) passes values to the parent constructor - covered in detail on Day 22.)`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it AccessModifiersDemo, click Create',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Uncomment each CS0122 line one at a time and build (Ctrl+Shift+B) to see which members are blocked',
        'Optional: add a Class Library project to the solution, move Account into it and reference it - internal members then disappear from the console project, while protected internal ones remain visible to derived classes',
      ],
      code: modifiersCode,
      csharp: { files: { 'Program.cs': modifiersCode }, stdin: '' },
      result: `Holder Pooja, balance 20000, pin ends with 1
Interest added. New balance: 21000, risk score: 2
Holder (public): Pooja
Branch (internal): PUN-001
Ifsc (protected internal): DEMO`,
      explanation: `ShowSummary is inside Account, so it may read the private pin (4321 % 10 = 1). The child class can use protected balance (20000 + 5% = 21000) and private protected riskScore, but not private pin. The top-level program is in the same assembly, so internal and protected internal members are visible, but private, protected and private protected members are not.`,
    },
    {
      title: 'Read-Only Transaction History',
      scenario: `A bank statement must show every transaction, but no outside code may add fake entries. The class keeps a private List and exposes it as IReadOnlyList via AsReadOnly().`,
      steps: steps('TransactionHistory'),
      code: historyCode,
      csharp: { files: { 'Program.cs': historyCode }, stdin: '' },
      result: `Statement for 5001 - Ravi:
  Deposit 10000 -> 10000
  Withdraw 2500 -> 7500
  FAILED Withdraw 9000 (balance 7500)
Balance: 7500, Entries: 3`,
      explanation: `Only Deposit and Withdraw add to the private list. 10000 - 2500 = 7500; the 9000 withdrawal fails and is logged as FAILED. Callers can loop over and count Transactions, but IReadOnlyList<string> has no Add method, so fake entries are impossible.`,
    },
  ],
  interview: [
    { q: `What is encapsulation?`, a: `Bundling data and the methods that operate on it inside a class and hiding the data (private fields) so it can be accessed or changed only through controlled members (properties/methods) that enforce rules. Example: a private balance changed only via Deposit/Withdraw.`, level: 'Easy' },
    { q: `How do you achieve encapsulation in C#?`, a: `Declare fields private, expose them through properties (with validation in set, private set, get-only or init as needed) and provide public methods for operations. Expose collections as read-only interfaces.`, level: 'Easy' },
    { q: `Name all access modifiers in C#.`, a: `public, private, protected, internal, protected internal and private protected (six). C# 11 also has the file modifier for types visible only in one source file.`, level: 'Easy' },
    { q: `What is the default access modifier of a class and of class members?`, a: `A top-level class (also struct, interface, enum) is internal by default. Members of a class or struct are private by default. Interface members are public by default; nested types are private.`, level: 'Medium' },
    { q: `Difference between protected internal and private protected?`, a: `protected internal = protected OR internal: accessible anywhere in the same assembly, plus in derived classes in other assemblies. private protected = protected AND internal: accessible only in derived classes that are in the same assembly.`, level: 'Hard' },
    { q: `What is the difference between encapsulation and abstraction?`, a: `Encapsulation hides the internal data and protects it (private fields + controlled access) - it is about implementation. Abstraction hides complexity and shows only the essential features to the user (abstract classes, interfaces) - it is about design. ATM: the Withdraw button is abstraction; the locked cash box and PIN check are encapsulation.`, level: 'Medium' },
    { q: `Why use properties instead of public fields?`, a: `Properties allow validation, read-only or write-only access (private set, init, get-only), computed values, change notification and logging, all without changing the caller's syntax. Changing a field to a property later breaks binary compatibility, and frameworks such as data binding, serializers and EF Core work with properties.`, level: 'Medium' },
    { q: `Is public int Balance { get; set; } encapsulated?`, a: `Technically it is a property, but it provides no protection: anyone can set any value. Real encapsulation needs restricted setters (private set) and validating methods, or validation inside the setter.`, level: 'Medium' },
    { q: `If a class exposes public List<string> Items { get; } is the list protected?`, a: `No. The reference cannot be replaced, but callers can still call Items.Add/Clear/Remove. Expose IReadOnlyList<string> (e.g., list.AsReadOnly()) or IEnumerable<string> instead.`, level: 'Hard' },
    { q: `Can private members be accessed outside the class in any way?`, a: `Not by normal code (CS0122). Nested classes can access private members of their containing class, and reflection (BindingFlags.NonPublic) can read them at runtime - so private is a design protection, not a security boundary.`, level: 'Hard' },
    { q: `Can a derived class access private members of its base class?`, a: `No. Private members are inherited (they exist inside the object) but are not accessible in the child. Use protected members or call public/protected methods of the base class.`, level: 'Easy' },
    { q: `What is the output? class A { private int x = 5; public int X => x; public void Set(int v) { if (v > 0) x = v; } }  var a = new A(); a.Set(-3); a.Set(8); a.Set(0); Console.WriteLine(a.X);`, a: `8 - only Set(8) passes the v > 0 check; -3 and 0 are ignored, so x goes 5 -> 8.`, level: 'Medium' },
  ],
  practice: [
    { task: `Create a Student class with a private marks field and a Marks property that only accepts 0-100 (otherwise print "Invalid marks" and keep the old value). Try 85, 120 and -5.`, hint: `In the setter: if (value < 0 || value > 100) { Console.WriteLine("Invalid marks"); return; }`, solution: `var s = new Student();
s.Marks = 85;
s.Marks = 120;
s.Marks = -5;
Console.WriteLine($"Marks: {s.Marks}");

class Student
{
    private int marks;
    public int Marks
    {
        get => marks;
        set
        {
            if (value < 0 || value > 100) { Console.WriteLine("Invalid marks"); return; }
            marks = value;
        }
    }
}
// Output:
// Invalid marks
// Invalid marks
// Marks: 85` },
    { task: `Build an encapsulated ATM class: private balance and pin; Withdraw(pin, amount) succeeds only with the correct pin and enough balance and returns true/false. Test wrong pin, too much and a valid withdrawal.`, hint: `public bool Withdraw(int enteredPin, int amount)`, solution: `var atm = new Atm(1234, 5000);
Console.WriteLine(atm.Withdraw(1111, 500));
Console.WriteLine(atm.Withdraw(1234, 9000));
Console.WriteLine(atm.Withdraw(1234, 2000));
Console.WriteLine($"Balance: {atm.Balance}");

class Atm
{
    private readonly int pin;
    private int balance;
    public int Balance => balance;
    public Atm(int pin, int balance) { this.pin = pin; this.balance = balance; }
    public bool Withdraw(int enteredPin, int amount)
    {
        if (enteredPin != pin || amount > balance) return false;
        balance -= amount;
        return true;
    }
}
// Output:
// False
// False
// True
// Balance: 3000` },
    { task: `Create a Product class with an init-only Code, a Price property that rejects negative values with ArgumentException, and a computed PriceWithGst (18% using integer maths).`, hint: `public int PriceWithGst => Price + Price * 18 / 100;`, solution: `var p = new Product { Code = "P100", Price = 500 };
Console.WriteLine($"{p.Code}: {p.Price} -> {p.PriceWithGst}");
try { p.Price = -1; } catch (ArgumentException ex) { Console.WriteLine(ex.Message); }
// p.Code = "X";   // error CS8852: init-only property

class Product
{
    private int price;
    public string Code { get; init; } = "";
    public int Price
    {
        get => price;
        set => price = value >= 0 ? value : throw new ArgumentException("Price cannot be negative");
    }
    public int PriceWithGst => Price + Price * 18 / 100;
}
// Output:
// P100: 500 -> 590
// Price cannot be negative` },
    { task: `Write a table (in comments) showing for each access modifier whether a member is visible in (a) the same class, (b) a derived class in the same project, (c) a non-derived class in the same project, (d) a derived class in another project.`, hint: `Think of protected internal as OR and private protected as AND.`, solution: `// Modifier            same class | derived same proj | other class same proj | derived other proj
// public                 yes     |       yes         |         yes           |       yes
// private                yes     |       no          |         no            |       no
// protected              yes     |       yes         |         no            |       yes
// internal               yes     |       yes         |         yes           |       no
// protected internal     yes     |       yes         |         yes           |       yes
// private protected      yes     |       yes         |         no            |       no` },
    { task: `Create a ShoppingCart class with a private List<string> of items, AddItem(name) that ignores duplicates, and a read-only Items property. Add "Pen", "Book", "Pen" and print the items and count.`, hint: `if (!items.Contains(name)) items.Add(name);`, solution: `var cart = new ShoppingCart();
cart.AddItem("Pen");
cart.AddItem("Book");
cart.AddItem("Pen");
Console.WriteLine(string.Join(", ", cart.Items));
Console.WriteLine($"Count: {cart.Items.Count}");

class ShoppingCart
{
    private readonly List<string> items = new();
    public IReadOnlyList<string> Items => items.AsReadOnly();
    public void AddItem(string name)
    {
        if (!items.Contains(name)) items.Add(name);
    }
}
// Output:
// Pen, Book
// Count: 2` },
  ],
  quiz: [
    { question: `What is the default access modifier of a field declared without any modifier inside a class?`, options: [`public`, `internal`, `protected`, `private`], answer: 3, explanation: `Class members are private by default.` },
    { question: `Which modifier allows access in the same class and in derived classes, but not in unrelated classes?`, options: [`protected`, `internal`, `public`, `private`], answer: 0, explanation: `protected members are visible to the declaring class and its derived classes.` },
    { question: `public int Balance { get; private set; } means:`, options: [`Nobody can read Balance`, `Anyone can read Balance, only the class can change it`, `Only derived classes can change it`, `Balance can be set once in an object initializer`], answer: 1, explanation: `The getter is public; the setter is private to the class.` },
    { question: `What is the default accessibility of a top-level class with no modifier?`, options: [`private`, `public`, `internal`, `protected`], answer: 2, explanation: `Top-level types default to internal - visible in the same assembly only.` },
    { question: `Which best describes encapsulation?`, options: [`One class deriving from another`, `Many forms of one method`, `Showing only essential features through interfaces`, `Hiding data and allowing access only through controlled members`], answer: 3, explanation: `Encapsulation = data hiding + controlled access via properties and methods.` },
  ],
};
