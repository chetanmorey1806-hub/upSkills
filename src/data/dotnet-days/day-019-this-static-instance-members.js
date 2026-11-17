const thisConflictCode = `// Day 19 - Example 1: Why we need the this keyword
var a1 = new WithoutThis(1001, "Nikhil");
a1.Show();

var a2 = new WithThis(1002, "Pooja");
a2.Show();

class WithoutThis
{
    public int accountNo;
    public string holder = "Unknown";

    public WithoutThis(int accountNo, string holder)
    {
        accountNo = accountNo;   // parameter assigned to itself! (warning CS1717)
        holder = holder;         // the field is never touched
    }

    public void Show() => Console.WriteLine($"Without this: {accountNo} - {holder}");
}

class WithThis
{
    public int accountNo;
    public string holder = "Unknown";

    public WithThis(int accountNo, string holder)
    {
        this.accountNo = accountNo;   // this.accountNo = field, accountNo = parameter
        this.holder = holder;
    }

    public void Show() => Console.WriteLine($"With this: {this.accountNo} - {this.holder}");
}`;

const bankCode = `// Day 19 - Example 2: Bank account - static (shared) vs instance (per object) members
var a = new BankAccount("Nikhil", 10000);
var b = new BankAccount("Pooja", 25000);

a.Deposit(5000);
b.Withdraw(3000);

a.Show();
b.Show();

Console.WriteLine($"Bank: {BankAccount.BankName}, Accounts: {BankAccount.TotalAccounts}, Rate: {BankAccount.InterestRate}%");

BankAccount.InterestRate = 5;     // change ONCE, affects every account
Console.WriteLine($"Interest for {a.Holder}: {a.YearlyInterest()}");
Console.WriteLine($"Interest for {b.Holder}: {b.YearlyInterest()}");

class BankAccount
{
    // static: one copy for the whole class
    public static string BankName = "City Demo Bank";
    public static int InterestRate = 4;
    public static int TotalAccounts;
    private static int nextNumber = 1001;

    // instance: every object has its own copy
    public int AccountNo { get; }
    public string Holder { get; }
    public int Balance { get; private set; }

    public BankAccount(string holder, int balance)
    {
        AccountNo = nextNumber++;   // instance member reads + updates a static one
        Holder = holder;
        Balance = balance;
        TotalAccounts++;
    }

    public void Deposit(int amount)
    {
        Balance += amount;
        Console.WriteLine($"{Holder} deposited {amount}. Balance: {Balance}");
    }

    public void Withdraw(int amount)
    {
        Balance -= amount;
        Console.WriteLine($"{Holder} withdrew {amount}. Balance: {Balance}");
    }

    public int YearlyInterest() => Balance * InterestRate / 100;

    public void Show() => Console.WriteLine($"{AccountNo} | {Holder} | {Balance}");
}`;

const fluentCode = `// Day 19 - Example 3: Passing "this" to another class and returning "this" (method chaining)
var acc = new BankAccount("Ravi");

acc.Deposit(2000).Deposit(3000).Withdraw(1000);   // possible because each method returns this

Console.WriteLine($"Final balance: {acc.Balance}");

class BankAccount
{
    public string Holder { get; }
    public int Balance { get; private set; }

    public BankAccount(string holder)
    {
        this.Holder = holder;
    }

    public BankAccount Deposit(int amount)
    {
        this.Balance += amount;
        SmsNotifier.Send(this, $"Credited {amount}");   // pass the CURRENT object
        return this;                                     // return the CURRENT object
    }

    public BankAccount Withdraw(int amount)
    {
        Balance -= amount;
        SmsNotifier.Send(this, $"Debited {amount}");
        return this;
    }
}

static class SmsNotifier
{
    public static void Send(BankAccount account, string message) =>
        Console.WriteLine($"SMS to {account.Holder}: {message}, balance {account.Balance}");
}`;

const staticRulesCode = `// Day 19 - Example 4: Static methods, static class and instance vs static counters
Console.WriteLine(Calculator.Add(10, 20));        // static method: no object needed
Console.WriteLine(Calculator.Square(7));

var c = new Counter();
c.Increment();
c.Increment();

var d = new Counter();
d.Increment();

Console.WriteLine($"c.InstanceCount = {c.InstanceCount}");
Console.WriteLine($"d.InstanceCount = {d.InstanceCount}");
Console.WriteLine($"Counter.SharedCount = {Counter.SharedCount}");

Counter.ResetShared();
Console.WriteLine($"After reset: {Counter.SharedCount}, c still has {c.InstanceCount}");

// var calc = new Calculator();   // error CS0712: Cannot create an instance of the static class
// Console.WriteLine(c.SharedCount); // error CS0176: access it with the type name instead

static class Calculator
{
    public static int Add(int a, int b) => a + b;
    public static int Square(int n) => n * n;
}

class Counter
{
    public int InstanceCount;          // separate for each object
    public static int SharedCount;     // one for all objects

    public void Increment()            // instance method: can use BOTH
    {
        InstanceCount++;
        SharedCount++;
    }

    public static void ResetShared()   // static method: only static members
    {
        SharedCount = 0;
        // InstanceCount = 0;          // error CS0120: an object reference is required
        // this.InstanceCount = 0;     // error CS0026: this is not valid in a static member
    }
}`;

const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App',
  `Name it ${name}, choose .NET 8 or .NET 10, click Create`,
  'Replace Program.cs with the code',
  'Press Ctrl+F5 to run without debugging',
];

export default {
  id: 'day-019-this-static-instance-members',
  title: 'this Keyword, static Keyword and Instance Members',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 19,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Some data belongs to each object (your account balance) and some data is shared by everyone (the bank's interest rate). Today you learn the difference between instance members and static members, how memory is shared, the rules of static methods and static classes, and every use of the this keyword: resolving name conflicts, passing the current object, returning this for method chaining and calling another constructor. We build a BankAccount class that uses both kinds of members.`,
  objectives: [
    'Differentiate instance members from static members and decide which to use',
    'Use this to resolve conflicts between fields and parameters',
    'Pass and return the current object with this (method chaining)',
    'State the rules of static methods and static classes (CS0120, CS0026, CS0712, CS0176)',
    'Build a BankAccount class with shared bank data and per-account data',
  ],
  theory: [
    {
      heading: 'Instance Members',
      content: `An **instance member** (field, property, method) belongs to **one particular object**. Every object created with new gets its **own copy** of the instance fields. You access them through an object reference: acc.Balance, acc.Deposit(500).

Real-world analogy: in a classroom, **every student has their own notebook**. Writing in Asha's notebook does not change Ravi's notebook. Notebooks are instance data.

Bank analogy: every account has its own **AccountNo, Holder and Balance**. If Nikhil deposits 5000, Pooja's balance does not change.

Instance methods can use instance members AND static members, because they always run "on" an object.`,
      syntax: `class BankAccount
{
    public string Holder;     // instance field
    public int Balance;       // instance field
    public void Deposit(int amount) { Balance += amount; }   // instance method
}

var a = new BankAccount();  a.Balance = 100;
var b = new BankAccount();  b.Balance = 900;   // a.Balance is still 100`,
    },
    {
      heading: 'Static Members',
      content: `A **static member** belongs to the **class itself**, not to any object. There is **only one copy**, shared by all objects, and it exists even if no object is created. You access it through the **class name**: BankAccount.InterestRate, Math.Sqrt(16), Console.WriteLine().

Real-world analogy: the classroom has **one whiteboard**. Everyone sees the same board; if the teacher changes it, every student sees the change. The whiteboard is static data.

Bank analogy: **bank name, interest rate and total number of accounts** are the same for everyone. Change the rate once and it applies to all accounts.

Memory picture:
- Instance fields live inside each object on the heap (one per object).
- Static fields are stored once per type (in the type's static storage), created when the type is first used.

Typical static members: counters (TotalAccounts), configuration (BankName), shared constants, helper/utility methods (Calculator.Add), factory methods, and Main itself.`,
      syntax: `class BankAccount
{
    public static string BankName = "City Demo Bank";
    public static int TotalAccounts;
    public static int CalculateFee(int amount) => amount / 100;
}

Console.WriteLine(BankAccount.BankName);        // via class name
int fee = BankAccount.CalculateFee(5000);       // no object needed`,
    },
    {
      heading: 'Rules of Static Methods and Static Classes',
      points: [
        'A static method can directly use ONLY static members. Using an instance field gives CS0120 "An object reference is required"',
        'this cannot be used in a static method (CS0026) because there is no current object',
        'A static method CAN use instance members through an object it receives or creates: static void Print(BankAccount a) => Console.WriteLine(a.Balance);',
        'An instance method can use both instance and static members',
        'In C#, static members must be accessed with the type name; obj.StaticMember gives CS0176 (unlike Java)',
        'static class: cannot be instantiated (CS0712), cannot be inherited, contains only static members, can have a static constructor but no instance constructor',
        'Examples of static classes in .NET: Math, Console, File, Convert, Enumerable (LINQ)',
        'Static fields are shared across threads too: in web apps, writable static data needs locking or should be avoided',
      ],
      content: `Ask one question to choose: **"Does this data or behaviour depend on a particular object?"** Yes -> instance. No (same for all, or pure calculation) -> static.`,
      tip: `const fields are implicitly static (BankAccount.MinBalance). static readonly is used when the value is decided at runtime (for example read from configuration) but must never change afterwards.`,
    },
    {
      heading: 'The this Keyword',
      content: `this is a **reference to the current object** - the object on which the method or constructor is running. When you call a.Deposit(500), inside Deposit this means a; when you call b.Deposit(500), this means b.

Real-world analogy: the word **"myself"**. When Nikhil says "send the SMS to myself", it means Nikhil; when Pooja says the same sentence, it means Pooja. Same word, different person depending on who says it.

Uses of this:
1. **Resolve name conflicts** between a field and a parameter: this.holder = holder;
2. **Pass the current object** to another method: SmsNotifier.Send(this, "Credited");
3. **Return the current object** to allow method chaining: return this; -> acc.Deposit(100).Withdraw(50);
4. **Call another constructor of the same class**: public Account(string h) : this(h, 0) { } (Day 18).
5. **Declare an indexer**: public int this[int index] { get { ... } }
6. **Declare an extension method**: static int WordCount(this string s) (Extra topic).

this is **read-only** in a class (you cannot write this = new BankAccount()) and is **not available in static members**.`,
      syntax: `class BankAccount
{
    private string holder;
    public BankAccount(string holder) { this.holder = holder; }        // 1. name conflict
    public BankAccount Deposit(int amt) { /*...*/ return this; }       // 3. chaining
    public void Notify() => SmsNotifier.Send(this, "Hi");              // 2. pass itself
}`,
    },
    {
      heading: 'Putting it Together: Choosing Static or Instance in a Bank',
      content: `Design of a BankAccount class:

| Member | Static or Instance | Why |
| --- | --- | --- |
| BankName | static | same for every account |
| InterestRate | static | one rate policy for all |
| TotalAccounts | static | counts all objects |
| nextNumber (auto account no.) | private static | shared generator |
| AccountNo, Holder, Balance | instance | different for each customer |
| Deposit, Withdraw, Show | instance | work on one account's balance |
| CalculateFee(amount) | static | pure calculation, no account needed |

Common mistakes:
- Making Balance static -> every customer would share ONE balance (a disaster).
- Making everything static "because it is easier" -> you lose OOP: you cannot have two accounts.
- Forgetting this in a constructor where parameter names equal field names -> fields stay at default values (Example 1).`,
    },
  ],
  examples: [
    {
      title: 'Name Conflict: With and Without this',
      scenario: `A developer names constructor parameters the same as fields. Without this, the parameter is assigned to itself and the object is never initialised - a classic interview bug.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ThisKeywordDemo, click Create',
        'Replace Program.cs with the code',
        'Notice the green squiggle and warning CS1717 in the Error List (View > Error List)',
        'Press Ctrl+F5',
      ],
      code: thisConflictCode,
      csharp: { files: { 'Program.cs': thisConflictCode }, stdin: '' },
      result: `Without this: 0 - Unknown
With this: 1002 - Pooja`,
      explanation: `Inside the constructor a parameter hides the field with the same name, so accountNo = accountNo just copies the parameter into itself. The fields keep their defaults (0 and the initializer "Unknown"). With this.accountNo the left side clearly means the field of the current object.`,
    },
    {
      title: 'Bank Account Class: Static vs Instance Members',
      scenario: `A bank keeps a shared name, interest rate and account counter, while every customer has their own account number and balance. Changing the interest rate once affects all accounts.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it BankAccountApp, click Create',
        'Replace Program.cs with the code',
        'Set a breakpoint (F9) on BankAccount.InterestRate = 5; press F5 and hover over a and b - expand them to see instance data; static members appear under "Static members" in the Locals/Watch window',
        'Press F5 to continue, or stop and run with Ctrl+F5',
      ],
      code: bankCode,
      csharp: { files: { 'Program.cs': bankCode }, stdin: '' },
      result: `Nikhil deposited 5000. Balance: 15000
Pooja withdrew 3000. Balance: 22000
1001 | Nikhil | 15000
1002 | Pooja | 22000
Bank: City Demo Bank, Accounts: 2, Rate: 4%
Interest for Nikhil: 750
Interest for Pooja: 1100`,
      explanation: `nextNumber is static, so the first object gets 1001 and the second 1002 (nextNumber++ uses then increments the shared value). TotalAccounts is shared, so it becomes 2. Balances are instance data and change independently. After the static rate becomes 5: 15000 * 5 / 100 = 750 and 22000 * 5 / 100 = 1100.`,
    },
    {
      title: 'Passing and Returning this (SMS Alerts and Method Chaining)',
      scenario: `Every transaction sends an SMS alert. The account passes itself (this) to the notifier, and each method returns this so transactions can be chained in one line.`,
      steps: steps('ThisChainingDemo'),
      code: fluentCode,
      csharp: { files: { 'Program.cs': fluentCode }, stdin: '' },
      result: `SMS to Ravi: Credited 2000, balance 2000
SMS to Ravi: Credited 3000, balance 5000
SMS to Ravi: Debited 1000, balance 4000
Final balance: 4000`,
      explanation: `Deposit(2000) updates Ravi's balance, passes the current object to SmsNotifier.Send, and returns the same object, so .Deposit(3000) is called on it next, then .Withdraw(1000). The notifier reads Holder and Balance from the object it received. This "fluent" style is used by StringBuilder.Append and ASP.NET Core builder APIs.`,
    },
    {
      title: 'Static Methods, Static Class and Shared vs Per-Object Counters',
      scenario: `A static Calculator class is used without objects, and a Counter class shows that an instance counter is separate per object while a static counter is shared. Commented lines show the compile errors you get when you break the rules.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StaticRulesDemo, click Create',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Uncomment one error line at a time and press Ctrl+Shift+B to build; read the error code in the Error List, then comment it again',
      ],
      code: staticRulesCode,
      csharp: { files: { 'Program.cs': staticRulesCode }, stdin: '' },
      result: `30
49
c.InstanceCount = 2
d.InstanceCount = 1
Counter.SharedCount = 3
After reset: 0, c still has 2`,
      explanation: `c.Increment() runs twice and d.Increment() once. Each object counts its own calls (2 and 1), while SharedCount is one variable for the class and receives all three increments. ResetShared is static, so it can reset SharedCount but cannot touch InstanceCount; c keeps 2.`,
    },
  ],
  interview: [
    { q: `What is the difference between static and instance members?`, a: `Instance members belong to an object: each object has its own copy and you access them via the object (acc.Balance). Static members belong to the class: there is one shared copy, it exists without any object, and you access it via the class name (BankAccount.InterestRate).`, level: 'Easy' },
    { q: `What is the this keyword?`, a: `A read-only reference to the current object on which an instance method, property or constructor is running. It is used to resolve field/parameter name conflicts, pass or return the current object, call another constructor with this(...), and declare indexers and extension methods.`, level: 'Easy' },
    { q: `Can we use this inside a static method? Why?`, a: `No - error CS0026. A static method is called on the class, not on an object, so there is no current object for this to refer to.`, level: 'Easy' },
    { q: `Can a static method access instance fields?`, a: `Not directly (error CS0120 "An object reference is required for the non-static field"). It can access them through an object reference that it receives as a parameter or creates itself.`, level: 'Medium' },
    { q: `Can an instance method access static members?`, a: `Yes. Instance methods can freely read and write static fields and call static methods, because static members are always available.`, level: 'Easy' },
    { q: `What is a static class? Give .NET examples.`, a: `A class declared with static that cannot be instantiated or inherited and contains only static members (a static constructor is allowed). It is meant for utility methods. Examples: Math, Console, File, Convert, Path, Enumerable.`, level: 'Easy' },
    { q: `Can you access a static member using an object reference in C#?`, a: `No. obj.StaticField gives error CS0176 "Member cannot be accessed with an instance reference; qualify it with a type name instead". (Java allows it with a warning; C# does not.)`, level: 'Medium' },
    { q: `Predict the output: class C { public static int s; public int i; public C() { s++; i++; } }  new C(); new C(); var x = new C(); Console.WriteLine($"{C.s} {x.i}");`, a: `3 1 - s is shared and incremented by all three constructors; i belongs to each object and is 1 in every object.`, level: 'Medium' },
    { q: `What happens if parameter names match field names and you do not use this?`, a: `The parameter hides the field inside the method, so name = name assigns the parameter to itself (warning CS1717) and the field keeps its default value. Use this.name = name, or name fields differently (_name).`, level: 'Medium' },
    { q: `What is method chaining and how does this enable it?`, a: `Calling several methods in one expression: acc.Deposit(100).Withdraw(50). Each method returns this (the current object), so the next method is called on the same object. Used by StringBuilder and builder/fluent APIs such as WebApplication.CreateBuilder().`, level: 'Medium' },
    { q: `When should a member be static? Any risks?`, a: `When the data or behaviour is the same for all objects or does not depend on object state: counters, shared configuration, constants, pure helper methods, factory methods. Risks: static mutable state is shared by all users and threads (in a web app, by all requests), so it can cause race conditions and is hard to unit test.`, level: 'Hard' },
    { q: `Difference between const, static readonly and static fields?`, a: `const: compile-time constant, implicitly static, value baked into calling code, only primitive/string types. static readonly: one shared value set at declaration or in the static constructor, can be computed at runtime, cannot change afterwards. Plain static field: shared and can be changed any time.`, level: 'Hard' },
  ],
  practice: [
    { task: `Create a Student class with instance fields Name and Marks and a static field CollegeName. Create two students, print them, change CollegeName once and print again.`, hint: `Access CollegeName using Student.CollegeName.`, solution: `var s1 = new Student("Asha", 88);
var s2 = new Student("Ravi", 74);
s1.Show(); s2.Show();
Student.CollegeName = "City Science College";
s1.Show(); s2.Show();

class Student
{
    public static string CollegeName = "City Engineering College";
    public string Name;
    public int Marks;
    public Student(string name, int marks) { this.Name = name; this.Marks = marks; }
    public void Show() => Console.WriteLine($"{Name} ({Marks}) - {CollegeName}");
}
// Output:
// Asha (88) - City Engineering College
// Ravi (74) - City Engineering College
// Asha (88) - City Science College
// Ravi (74) - City Science College` },
    { task: `Add a static counter to a Product class that generates auto-increment product codes P1, P2, P3 and shows the total number of products.`, hint: `private static int next = 1; Code = "P" + next++;`, solution: `var a = new Product("Pen");
var b = new Product("Book");
var c = new Product("Bag");
Console.WriteLine($"{a.Code} {a.Name}, {b.Code} {b.Name}, {c.Code} {c.Name}");
Console.WriteLine($"Total: {Product.Total}");

class Product
{
    private static int next = 1;
    public static int Total { get; private set; }
    public string Code { get; }
    public string Name { get; }
    public Product(string name) { Code = "P" + next++; Name = name; Total++; }
}
// Output:
// P1 Pen, P2 Book, P3 Bag
// Total: 3` },
    { task: `Create a static class TemperatureConverter with CelsiusToFahrenheit and FahrenheitToCelsius (integer maths). Convert 100 C and 212 F.`, hint: `F = C * 9 / 5 + 32; C = (F - 32) * 5 / 9`, solution: `Console.WriteLine(TemperatureConverter.CelsiusToFahrenheit(100));
Console.WriteLine(TemperatureConverter.FahrenheitToCelsius(212));

static class TemperatureConverter
{
    public static int CelsiusToFahrenheit(int c) => c * 9 / 5 + 32;
    public static int FahrenheitToCelsius(int f) => (f - 32) * 5 / 9;
}
// Output:
// 212
// 100` },
    { task: `Build a fluent Order class whose AddItem(name, price) returns this, and a Total property. Add three items in one chained statement.`, hint: `public Order AddItem(string name, int price) { Total += price; Console.WriteLine(...); return this; }`, solution: `var order = new Order();
order.AddItem("Pizza", 300).AddItem("Coke", 60).AddItem("Fries", 120);
Console.WriteLine($"Total: {order.Total}");

class Order
{
    public int Total { get; private set; }
    public Order AddItem(string name, int price)
    {
        this.Total += price;
        Console.WriteLine($"Added {name} ({price})");
        return this;
    }
}
// Output:
// Added Pizza (300)
// Added Coke (60)
// Added Fries (120)
// Total: 480` },
    { task: `Write a static method BankAccount.Transfer(BankAccount from, BankAccount to, int amount) that moves money between two accounts and prints both balances.`, hint: `A static method can change instance data through the object references it receives.`, solution: `var x = new BankAccount("Nikhil", 5000);
var y = new BankAccount("Pooja", 1000);
BankAccount.Transfer(x, y, 1500);

class BankAccount
{
    public string Holder { get; }
    public int Balance { get; private set; }
    public BankAccount(string holder, int balance) { Holder = holder; Balance = balance; }
    public static void Transfer(BankAccount from, BankAccount to, int amount)
    {
        from.Balance -= amount;
        to.Balance += amount;
        Console.WriteLine($"{from.Holder}: {from.Balance}, {to.Holder}: {to.Balance}");
    }
}
// Output:
// Nikhil: 3500, Pooja: 2500` },
  ],
  quiz: [
    { question: `How many copies of a static field exist if you create 10 objects?`, options: [`10`, `11`, `1`, `0 until accessed through an object`], answer: 2, explanation: `A static field belongs to the class; there is one shared copy regardless of the number of objects.` },
    { question: `Which error do you get when a static method uses an instance field directly?`, options: [`CS0120 - an object reference is required`, `CS0122 - inaccessible`, `CS7036 - missing argument`, `No error`], answer: 0, explanation: `Static methods have no current object, so instance fields need an explicit object reference.` },
    { question: `Inside public void Deposit(int amount) called as acc2.Deposit(100), what does this refer to?`, options: [`The BankAccount class`, `The amount parameter`, `The first object ever created`, `acc2`], answer: 3, explanation: `this is the object on which the instance method was called.` },
    { question: `Which statement about a static class is TRUE?`, options: [`It can be inherited`, `It cannot be instantiated and contains only static members`, `It must have a public constructor`, `It can have instance fields`], answer: 1, explanation: `Static classes are sealed, cannot be created with new and only allow static members.` },
    { question: `Why does a fluent method like Deposit(...) return this?`, options: [`To make it static`, `To copy the object`, `To allow calling another method on the same object in one expression`, `To hide the parameter`], answer: 2, explanation: `Returning the current object lets you chain calls: acc.Deposit(100).Withdraw(50).` },
  ],
};
