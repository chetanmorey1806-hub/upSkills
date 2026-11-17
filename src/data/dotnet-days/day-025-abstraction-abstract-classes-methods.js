const paymentCode = `List<Payment> payments = new List<Payment>
{
    new UpiPayment(1500, "asha@okicici"),
    new CardPayment(4000, "5555666677778888"),
    new CashPayment(750),
    new CashPayment(5000)
};

int total = 0;
foreach (Payment p in payments)
{
    bool ok = p.Pay();          // same call for every payment type
    if (ok)
    {
        total += p.Amount;
    }
    Console.WriteLine();
}
Console.WriteLine($"Total received: Rs.{total}");

// Payment p0 = new Payment(100);
// error CS0144: Cannot create an instance of the abstract type or interface 'Payment'

abstract class Payment
{
    private static int _nextId = 1;

    public int PaymentId { get; }
    public int Amount { get; }

    // An abstract class CAN have a constructor (called by child classes)
    protected Payment(int amount)
    {
        PaymentId = _nextId++;
        Amount = amount;
    }

    // Abstract members: no body, every child MUST implement them
    public abstract string Mode { get; }
    protected abstract bool Process();

    // Concrete method: the common flow, written once
    public bool Pay()
    {
        Console.WriteLine($"[#{PaymentId}] {Mode} payment of Rs.{Amount} started");
        bool ok = Process();
        PrintReceipt(ok);
        return ok;
    }

    private void PrintReceipt(bool ok)
    {
        string status = ok ? "SUCCESS" : "FAILED";
        Console.WriteLine($"[#{PaymentId}] Receipt: {Mode} | Rs.{Amount} | {status}");
    }
}

class UpiPayment : Payment
{
    private readonly string _upiId;

    public UpiPayment(int amount, string upiId) : base(amount)
    {
        _upiId = upiId;
    }

    public override string Mode => "UPI";

    protected override bool Process()
    {
        Console.WriteLine($"  Collect request sent to {_upiId}");
        return true;
    }
}

class CardPayment : Payment
{
    private readonly string _cardNumber;

    public CardPayment(int amount, string cardNumber) : base(amount)
    {
        _cardNumber = cardNumber;
    }

    public override string Mode => "Card";

    protected override bool Process()
    {
        int fee = Amount * 2 / 100;                       // 2% gateway fee
        string last4 = _cardNumber.Substring(_cardNumber.Length - 4);
        Console.WriteLine($"  Card ending {last4} charged Rs.{Amount + fee} (fee Rs.{fee})");
        return true;
    }
}

class CashPayment : Payment
{
    public CashPayment(int amount) : base(amount) { }

    public override string Mode => "Cash";

    protected override bool Process()
    {
        if (Amount > 2000)
        {
            Console.WriteLine("  Cash above Rs.2000 not allowed");
            return false;
        }
        Console.WriteLine("  Cash collected at counter");
        return true;
    }
}
`;

const shapeCode = `Shape[] shapes =
{
    new Rectangle(4, 5),
    new Square(6),
    new RightTriangle(6, 8)
};

int totalArea = 0;
Shape largest = shapes[0];

foreach (Shape s in shapes)
{
    s.Describe();
    totalArea += s.Area();
    if (s.Area() > largest.Area())
    {
        largest = s;
    }
}

Console.WriteLine($"Total area: {totalArea}");
Console.WriteLine($"Largest shape: {largest.Name} ({largest.Area()})");

abstract class Shape
{
    public string Name { get; }

    protected Shape(string name)
    {
        Name = name;
    }

    public abstract int Area();
    public abstract int Perimeter();

    // Concrete method that uses the abstract ones
    public void Describe()
    {
        Console.WriteLine($"{Name,-10} Area = {Area(),3}  Perimeter = {Perimeter(),3}");
    }
}

class Rectangle : Shape
{
    private readonly int _length;
    private readonly int _width;

    public Rectangle(int length, int width) : base("Rectangle")
    {
        _length = length;
        _width = width;
    }

    public override int Area() => _length * _width;
    public override int Perimeter() => 2 * (_length + _width);
}

class Square : Shape
{
    private readonly int _side;

    public Square(int side) : base("Square")
    {
        _side = side;
    }

    public override int Area() => _side * _side;
    public override int Perimeter() => 4 * _side;
}

class RightTriangle : Shape
{
    private readonly int _base;
    private readonly int _height;

    public RightTriangle(int b, int h) : base("Triangle")
    {
        _base = b;
        _height = h;
    }

    public override int Area() => _base * _height / 2;

    public override int Perimeter()
    {
        int hypotenuse = (int)Math.Sqrt(_base * _base + _height * _height);
        return _base + _height + hypotenuse;
    }
}
`;

const employeeCode = `Employee[] staff =
{
    new FullTimeEmployee("Ravi", 30000, 12000),
    new ContractEmployee("Neha", 160, 250)
};

Console.WriteLine("--- Payroll ---");
int total = 0;
foreach (Employee e in staff)
{
    e.PrintPaySlip();
    total += e.MonthlyPay();
}
Console.WriteLine($"Total payroll: Rs.{total}");

abstract class Employee
{
    public string Name { get; }

    protected Employee(string name)
    {
        Name = name;
        Console.WriteLine($"Employee() ran for {name}");
    }

    public abstract string Role { get; }     // abstract property
    public abstract int MonthlyPay();        // abstract method

    public void PrintPaySlip()               // concrete method
    {
        Console.WriteLine($"{Name} ({Role}): Rs.{MonthlyPay()}");
    }
}

class FullTimeEmployee : Employee
{
    private readonly int _basic;
    private readonly int _hra;

    public FullTimeEmployee(string name, int basic, int hra) : base(name)
    {
        _basic = basic;
        _hra = hra;
        Console.WriteLine($"FullTimeEmployee() ran for {name}");
    }

    public override string Role => "Full-Time";
    public override int MonthlyPay() => _basic + _hra;
}

class ContractEmployee : Employee
{
    private readonly int _hours;
    private readonly int _ratePerHour;

    public ContractEmployee(string name, int hours, int ratePerHour) : base(name)
    {
        _hours = hours;
        _ratePerHour = ratePerHour;
        Console.WriteLine($"ContractEmployee() ran for {name}");
    }

    public override string Role => "Contract";
    public override int MonthlyPay() => _hours * _ratePerHour;
}
`;

const atmCode = `Atm atm = new Atm(5000, 1234);

atm.Withdraw(1234, 2000);   // correct PIN, enough balance
atm.Withdraw(1111, 500);    // wrong PIN
atm.Withdraw(1234, 4000);   // not enough balance

Console.WriteLine($"Balance left: Rs.{atm.Balance}");

// The user of Atm sees only Withdraw() and Balance.
// VerifyPin, HasBalance, Debit and Dispense are hidden (private).
class Atm
{
    private int _balance;
    private readonly int _pin;

    public Atm(int balance, int pin)
    {
        _balance = balance;
        _pin = pin;
    }

    public int Balance => _balance;

    public void Withdraw(int pin, int amount)
    {
        Console.WriteLine($"Request: withdraw Rs.{amount}");
        if (!VerifyPin(pin))
        {
            Console.WriteLine("  Wrong PIN. Please try again.");
            return;
        }
        if (!HasBalance(amount))
        {
            Console.WriteLine("  Insufficient balance.");
            return;
        }
        Debit(amount);
        Dispense(amount);
    }

    private bool VerifyPin(int pin) => pin == _pin;
    private bool HasBalance(int amount) => amount <= _balance;
    private void Debit(int amount) => _balance -= amount;

    private void Dispense(int amount)
    {
        int notes = amount / 500;
        Console.WriteLine($"  Dispensed {notes} x Rs.500 notes");
    }
}
`;

const vsSteps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8.0 (LTS) or .NET 10.0 (LTS), click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging',
  'Optional: try writing new Payment(100) or new Shape("x") to see compiler error CS0144 in the Error List (View > Error List)',
];

export default {
  id: 'day-025-abstraction-abstract-classes-methods',
  title: 'Abstraction: Abstract Classes and Abstract Methods',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 25,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Abstraction means showing only WHAT an object does and hiding HOW it does it. Learn the abstract keyword, abstract classes, abstract methods and abstract properties, why an abstract class cannot be instantiated, how it can still have constructors, fields and normal methods, and how abstract members force every child to give its own implementation. Build a Payment system (UPI, Card, Cash), a Shapes calculator, an Employee payroll and an ATM that hides its internal steps.`,
  objectives: [
    'Explain abstraction with real-world examples and how it differs from encapsulation',
    'Create abstract classes with abstract methods, abstract properties and concrete methods',
    'Implement abstract members in child classes using override',
    'Know the rules: no instances, constructors allowed, child must implement all abstract members or be abstract itself',
    'Design a Payment system where a common flow is written once and each payment type supplies its own logic',
  ],
  theory: [
    {
      heading: 'What is Abstraction?',
      content: `**Abstraction** is the OOP principle of **showing only the essential features** of an object and **hiding the internal details**. The user knows **what** an object can do, not **how** it does it.

Real-world analogies:
- **Car**: you use the steering, accelerator and brake. You do not need to know how fuel injection, gear ratios or ABS work inside.
- **ATM**: you insert a card, enter a PIN and choose an amount. PIN verification, bank server calls, balance updates and note counting are hidden.
- **TV remote**: you press "Volume +". The infra-red signal codes are hidden from you.
- **Food delivery app**: you tap "Place Order". Restaurant assignment, rider allocation and payment settlement happen behind the scenes.

In C#, abstraction is achieved in two main ways:
1. **Abstract classes** (today) – a partially complete base class.
2. **Interfaces** (Day 26) – a pure contract.

Even a normal class with **private** helper methods and a small **public** surface is a form of abstraction (see the ATM example).`,
      points: [
        'Abstraction = hide complexity, show only what is needed',
        'Focus on WHAT an object does, not HOW',
        'Achieved with abstract classes and interfaces',
        'Makes code easier to use, change and extend',
      ],
    },
    {
      heading: 'Abstract Class',
      content: `An **abstract class** is a class marked with the **abstract** keyword. It represents a **general idea** (Payment, Shape, Employee, Vehicle) that is incomplete on its own.

Rules:
- You **cannot create an object** of an abstract class: new Payment() gives compiler error **CS0144**.
- It **can** contain fields, properties, constructors, static members, normal (concrete) methods, virtual methods **and** abstract methods.
- It is meant to be **inherited**. A variable of the abstract type can hold any child object: Payment p = new UpiPayment(...).
- An abstract class **can have constructors**. They run when a child object is created (via base(...)). Make them **protected** because only children call them.
- An abstract class is not required to have any abstract method, but usually it does.

Analogy: "Vehicle" is abstract. Nobody buys "a vehicle"; they buy a Car, Bike or Bus. But every vehicle has a registration number and can Start().`,
      syntax: `abstract class Payment
{
    public int Amount { get; }                 // field / property
    protected Payment(int amount)              // constructor
    {
        Amount = amount;
    }
    public abstract void Process();           // abstract: no body
    public void PrintReceipt()                // concrete: has body
    {
        Console.WriteLine($"Paid Rs.{Amount}");
    }
}`,
      tip: 'If a class name is a general category (Shape, Account, Employee, Notification) and creating a plain object of it makes no sense, make it abstract.',
    },
    {
      heading: 'Abstract Methods and Abstract Properties',
      content: `An **abstract method** has only a **signature** and ends with a semicolon. It has **no body**. It says: "every child MUST provide this".

- It can only be declared **inside an abstract class**.
- It is **implicitly virtual**; children implement it using **override**.
- It cannot be **private** (children could not see it), and cannot be **static** or **sealed** in a class.
- A non-abstract child must override **all** abstract members, otherwise error **CS0534** ("does not implement inherited abstract member").
- If the child is also abstract, it may leave some abstract members for its own children.

**Abstract properties** work the same way: public abstract string Mode { get; } and the child writes public override string Mode => "UPI";

Difference between **abstract** and **virtual**:
- virtual method: has a default body; child **may** override.
- abstract method: has no body; child **must** override.`,
      syntax: `public abstract int Area();                // abstract method
public abstract string Role { get; }        // abstract property

// in child class
public override int Area() => _side * _side;
public override string Role => "Contract";`,
      points: [
        'abstract method = no body + must override',
        'virtual method = has body + may override',
        'Only abstract classes can contain abstract members',
        'CS0534 if a concrete child forgets to implement one',
      ],
    },
    {
      heading: 'Template Method: Common Flow + Child-Specific Steps',
      content: `The most useful pattern with abstract classes: the base class writes the **common algorithm once** in a concrete method and calls **abstract steps** that each child fills in. This is the **Template Method** design pattern.

In the Payment example:
1. Pay() (concrete) prints "payment started", calls Process(), prints a receipt.
2. Process() (abstract, protected) is different for UPI, Card and Cash.

Benefits:
- No duplicate code for receipts, logging, IDs.
- Adding NetBanking tomorrow = one new class with Mode and Process(); nothing else changes (Open/Closed Principle).
- The caller works only with the abstract type: foreach (Payment p in payments) p.Pay();

Real-world analogy: a **recipe card for tea**. Boil water, add tea leaves, add milk and sugar, strain and serve are fixed. "Add flavour" is the abstract step: masala chai adds spices, ginger tea adds ginger, lemon tea adds lemon.`,
    },
    {
      heading: 'Constructor Order and Partial Implementation',
      content: `When you write new FullTimeEmployee("Ravi", ...):
1. The **abstract base constructor** Employee(name) runs first.
2. Then the **child constructor** body runs.

So constructors of abstract classes are not wasted: they initialise the common data (Name, Id, Amount).

**Abstract child of an abstract class**: a class can inherit an abstract class and implement only some members, as long as it is also marked abstract.

abstract class Vehicle { public abstract void Start(); public abstract int Wheels(); }
abstract class TwoWheeler : Vehicle { public override int Wheels() => 2; }   // still abstract
class Bike : TwoWheeler { public override void Start() => Console.WriteLine("Kick start"); }

Important: **abstract** and **sealed** cannot be used together on a class (a sealed class cannot be inherited, an abstract class must be). Static classes are compiled as abstract + sealed internally, which is why you cannot create or inherit them.`,
      tip: 'Avoid calling abstract or virtual methods from the base constructor: the child constructor has not run yet, so child fields are still default values (0 or null).',
    },
    {
      heading: 'Abstraction vs Encapsulation',
      content: `Students often mix these two:

| | Abstraction | Encapsulation |
|---|---|---|
| Idea | Hide **complexity**, show essentials | Hide **data**, protect it |
| Question answered | WHAT does it do? | HOW is the data kept safe? |
| Level | Design level | Implementation level |
| C# tools | abstract classes, interfaces | private fields, properties, access modifiers |
| Example | ATM shows Withdraw() only | balance is private, changed only through Withdraw() |

They work together: the ATM class **abstracts** the withdrawal process behind one public method and **encapsulates** the balance in a private field.`,
    },
  ],
  examples: [
    {
      title: 'Payment System with an Abstract Payment Class',
      scenario: 'The syllabus task. Payment is abstract with a common Pay() flow; UPI, Card and Cash implement the abstract Mode property and Process() method. Cash above Rs.2000 is rejected.',
      steps: vsSteps('PaymentAbstraction'),
      code: paymentCode,
      csharp: { files: { 'Program.cs': paymentCode }, stdin: '' },
      result: `[#1] UPI payment of Rs.1500 started
  Collect request sent to asha@okicici
[#1] Receipt: UPI | Rs.1500 | SUCCESS

[#2] Card payment of Rs.4000 started
  Card ending 8888 charged Rs.4080 (fee Rs.80)
[#2] Receipt: Card | Rs.4000 | SUCCESS

[#3] Cash payment of Rs.750 started
  Cash collected at counter
[#3] Receipt: Cash | Rs.750 | SUCCESS

[#4] Cash payment of Rs.5000 started
  Cash above Rs.2000 not allowed
[#4] Receipt: Cash | Rs.5000 | FAILED

Total received: Rs.6250`,
      explanation: `Each child constructor calls base(amount), so the protected Payment constructor gives IDs 1, 2, 3, 4 using the static counter. Pay() is written only once in the abstract class; inside it, Mode and Process() are abstract, so the runtime calls the child version. Card fee = 4000 * 2 / 100 = 80, charged 4080. The last cash payment (5000) fails, so total = 1500 + 4000 + 750 = 6250. Trying new Payment(100) does not compile (CS0144).`,
    },
    {
      title: 'Shapes: Abstract Area() and Perimeter()',
      scenario: 'Every shape has an area and a perimeter, but each calculates them differently. A concrete Describe() method in the abstract class prints them in one format.',
      steps: vsSteps('ShapesAbstraction'),
      code: shapeCode,
      csharp: { files: { 'Program.cs': shapeCode }, stdin: '' },
      result: `Rectangle  Area =  20  Perimeter =  18
Square     Area =  36  Perimeter =  24
Triangle   Area =  24  Perimeter =  24
Total area: 80
Largest shape: Square (36)`,
      explanation: `Rectangle 4x5: area 20, perimeter 2*(4+5)=18. Square 6: area 36, perimeter 24. Right triangle 6,8: area 6*8/2 = 24, hypotenuse = sqrt(36+64) = 10, perimeter 6+8+10 = 24. {Name,-10} left-aligns the name in 10 characters and {Area(),3} right-aligns in 3. Total = 20+36+24 = 80 and the largest area is the Square.`,
    },
    {
      title: 'Employee Payroll: Abstract Property, Constructor Order',
      scenario: 'Employee is abstract with an abstract Role property and an abstract MonthlyPay(). The constructors print messages so you can see the base constructor runs first.',
      steps: vsSteps('EmployeePayroll'),
      code: employeeCode,
      csharp: { files: { 'Program.cs': employeeCode }, stdin: '' },
      result: `Employee() ran for Ravi
FullTimeEmployee() ran for Ravi
Employee() ran for Neha
ContractEmployee() ran for Neha
--- Payroll ---
Ravi (Full-Time): Rs.42000
Neha (Contract): Rs.40000
Total payroll: Rs.82000`,
      explanation: `The array initializer creates both objects first, so all constructor messages appear before "--- Payroll ---". For each object the abstract base constructor runs before the child constructor. Full-time pay = 30000 + 12000 = 42000; contract pay = 160 * 250 = 40000; total = 82000.`,
    },
    {
      title: 'Abstraction Without abstract: The ATM',
      scenario: 'Abstraction is also about a small public surface. The ATM exposes only Withdraw() and Balance; PIN checks, debit and note dispensing are private.',
      steps: vsSteps('AtmAbstraction'),
      code: atmCode,
      csharp: { files: { 'Program.cs': atmCode }, stdin: '' },
      result: `Request: withdraw Rs.2000
  Dispensed 4 x Rs.500 notes
Request: withdraw Rs.500
  Wrong PIN. Please try again.
Request: withdraw Rs.4000
  Insufficient balance.
Balance left: Rs.3000`,
      explanation: `First request: PIN 1234 is correct and 2000 <= 5000, so the balance becomes 3000 and 2000/500 = 4 notes are dispensed. Second: PIN 1111 is wrong, method returns early. Third: 4000 > 3000, insufficient. The caller never calls VerifyPin or Debit directly; they are hidden implementation details.`,
    },
  ],
  interview: [
    { q: 'What is abstraction in C#?', a: 'Abstraction is showing only the essential features of an object and hiding the implementation details. In C# it is achieved with abstract classes and interfaces (and by keeping helper members private). Example: an ATM exposes Withdraw() while PIN checks and bank calls are hidden.', level: 'Easy' },
    { q: 'What is an abstract class?', a: 'A class declared with the abstract keyword that cannot be instantiated. It can contain abstract members (no body) and concrete members (fields, constructors, properties, normal and virtual methods). It is used as a base class for related child classes.', level: 'Easy' },
    { q: 'Can we create an object of an abstract class?', a: 'No. new Payment() gives error CS0144. But you can declare a variable of the abstract type and assign a child object: Payment p = new UpiPayment(500, "x@upi");', level: 'Easy' },
    { q: 'Can an abstract class have a constructor? Why?', a: 'Yes. It runs when a child object is created (through base(...)) and initialises common data like Id or Name. It is usually declared protected because only derived classes can call it.', level: 'Medium' },
    { q: 'What is the difference between an abstract method and a virtual method?', a: 'An abstract method has no body and every non-abstract child MUST override it. A virtual method has a default body and a child MAY override it. Abstract methods can exist only in abstract classes; virtual methods can exist in any non-sealed class.', level: 'Medium' },
    { q: 'Can an abstract method be private or static?', a: 'No. A private abstract method could never be overridden (error CS0621) and a static method cannot be abstract in a class (CS0112). Abstract members are usually public or protected. (Interfaces since C# 11 support static abstract members, which is a different feature.)', level: 'Medium' },
    { q: 'Is it mandatory for an abstract class to have abstract methods?', a: 'No. An abstract class can have zero abstract methods; it is abstract simply to prevent direct instantiation. However, if a class has even one abstract method, the class must be declared abstract (error CS0513 otherwise).', level: 'Easy' },
    { q: 'What happens if a child class does not implement all abstract methods?', a: 'Compilation fails with CS0534 ("does not implement inherited abstract member"), unless the child class is also declared abstract, in which case its own children must implement the remaining members.', level: 'Medium' },
    { q: 'Can a class be both abstract and sealed?', a: 'No (error CS0418). abstract means "must be inherited" and sealed means "cannot be inherited". Internally, a static class is emitted as abstract sealed, but you cannot write both keywords yourself.', level: 'Medium' },
    { q: 'Difference between abstraction and encapsulation?', a: 'Abstraction hides complexity at the design level (what the object does) using abstract classes/interfaces. Encapsulation hides and protects data at the implementation level using private fields and properties. Example: ATM exposes Withdraw() (abstraction) while balance is a private field (encapsulation).', level: 'Medium' },
    { q: 'What is the output?\nabstract class A { public A() { Console.Write("A "); Show(); } public abstract void Show(); }\nclass B : A { int x = 5; public B() { x = 10; Console.Write("B "); } public override void Show() => Console.Write(x + " "); }\nnew B();', a: 'Output: A 5 B. Field initialiser x = 5 runs before the base constructor in C#, then A() prints "A " and calls the overridden Show() which prints 5 (the B constructor body has not yet set 10), then B() prints "B ". This is why calling virtual/abstract methods from constructors is risky.', level: 'Hard' },
    { q: 'When would you choose an abstract class?', a: 'When related classes share common code and state (fields, constructors, helper methods) and also have some steps that differ. Example: Payment with common receipt logic and different Process() per payment type (Template Method pattern). If you only need a contract with no shared code, or need multiple inheritance, use an interface.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an abstract class Vehicle with property RegNo, an abstract method Start() and a concrete method ShowRegNo(). Create Car, Bike and Bus that implement Start() differently. Store them in a Vehicle[] and call both methods in a loop.',
      hint: 'protected Vehicle(string regNo) constructor; children call : base(regNo).',
      solution: `Vehicle[] list = { new Car("MH12AB1234"), new Bike("KA05XY9876"), new Bus("DL01C5555") };
foreach (Vehicle v in list) { v.ShowRegNo(); v.Start(); }

abstract class Vehicle
{
    public string RegNo { get; }
    protected Vehicle(string regNo) { RegNo = regNo; }
    public abstract void Start();
    public void ShowRegNo() => Console.WriteLine($"Reg No: {RegNo}");
}
class Car : Vehicle { public Car(string r) : base(r) { } public override void Start() => Console.WriteLine("Car: push button start"); }
class Bike : Vehicle { public Bike(string r) : base(r) { } public override void Start() => Console.WriteLine("Bike: kick start"); }
class Bus : Vehicle { public Bus(string r) : base(r) { } public override void Start() => Console.WriteLine("Bus: key start, air brakes ready"); }`,
    },
    {
      task: 'Add a NetBankingPayment class to the Payment system example. It should print "Redirecting to <bank> login" and succeed. Do not change any existing class.',
      hint: 'Override Mode and Process(); take the bank name in the constructor.',
      solution: `class NetBankingPayment : Payment
{
    private readonly string _bank;
    public NetBankingPayment(int amount, string bank) : base(amount) { _bank = bank; }
    public override string Mode => "NetBanking";
    protected override bool Process()
    {
        Console.WriteLine($"  Redirecting to {_bank} login");
        return true;
    }
}
// Usage: payments.Add(new NetBankingPayment(2500, "SBI"));`,
    },
    {
      task: 'Create an abstract class BankAccount with AccountNo, Balance, a concrete Deposit(int) and an abstract int InterestRate property. SavingsAccount has 4% and FixedDeposit has 7%. Add a concrete method YearlyInterest() that returns Balance * InterestRate / 100.',
      hint: 'Make Balance { get; protected set; } so only the class family can change it.',
      solution: `BankAccount[] accounts = { new SavingsAccount("SB-01", 10000), new FixedDeposit("FD-01", 50000) };
foreach (BankAccount a in accounts)
    Console.WriteLine($"{a.AccountNo}: interest Rs.{a.YearlyInterest()}");
// SB-01: interest Rs.400
// FD-01: interest Rs.3500

abstract class BankAccount
{
    public string AccountNo { get; }
    public int Balance { get; protected set; }
    protected BankAccount(string no, int opening) { AccountNo = no; Balance = opening; }
    public void Deposit(int amount) => Balance += amount;
    public abstract int InterestRate { get; }
    public int YearlyInterest() => Balance * InterestRate / 100;
}
class SavingsAccount : BankAccount { public SavingsAccount(string n, int b) : base(n, b) { } public override int InterestRate => 4; }
class FixedDeposit : BankAccount { public FixedDeposit(string n, int b) : base(n, b) { } public override int InterestRate => 7; }`,
    },
    {
      task: 'Create abstract class Vehicle (abstract Wheels() and Start()), abstract class TwoWheeler : Vehicle that implements only Wheels() returning 2, and a concrete Scooter : TwoWheeler that implements Start(). Print wheels and start message.',
      hint: 'TwoWheeler must be abstract because it does not implement Start().',
      solution: `Vehicle s = new Scooter();
Console.WriteLine($"Wheels: {s.Wheels()}");
s.Start();
// Wheels: 2
// Scooter: self start

abstract class Vehicle { public abstract int Wheels(); public abstract void Start(); }
abstract class TwoWheeler : Vehicle { public override int Wheels() => 2; }
class Scooter : TwoWheeler { public override void Start() => Console.WriteLine("Scooter: self start"); }`,
    },
    {
      task: 'Write an abstract class Report with a concrete Generate() that prints a header, calls abstract PrintBody() and prints a footer "--- End ---". Create SalesReport and AttendanceReport.',
      hint: 'This is the Template Method pattern; make PrintBody protected abstract.',
      solution: `Report[] reports = { new SalesReport(), new AttendanceReport() };
foreach (Report r in reports) r.Generate();

abstract class Report
{
    public abstract string Title { get; }
    protected abstract void PrintBody();
    public void Generate()
    {
        Console.WriteLine($"=== {Title} ===");
        PrintBody();
        Console.WriteLine("--- End ---");
    }
}
class SalesReport : Report
{
    public override string Title => "Sales Report";
    protected override void PrintBody() => Console.WriteLine("Total sales: Rs.125000");
}
class AttendanceReport : Report
{
    public override string Title => "Attendance Report";
    protected override void PrintBody() => Console.WriteLine("Present: 42 / 45");
}`,
    },
  ],
  quiz: [
    {
      question: 'Which statement about abstract classes is TRUE?',
      options: ['They cannot have constructors', 'They can contain both abstract and concrete methods', 'They must contain at least one abstract method', 'They can be instantiated with new'],
      answer: 1,
      explanation: 'An abstract class can mix abstract members with fields, constructors and concrete methods. It cannot be instantiated and is not required to have abstract methods.',
    },
    {
      question: 'What does a concrete child class have to do with an inherited abstract method?',
      options: ['Nothing, it is optional', 'Hide it with new', 'Override it, otherwise error CS0534', 'Call it with base'],
      answer: 2,
      explanation: 'A non-abstract child must override every inherited abstract member. Calling base.Method() on an abstract method is not allowed because it has no body.',
    },
    {
      question: 'Which declaration is valid inside an abstract class?',
      options: ['public abstract void Show() { }', 'private abstract void Show();', 'public static abstract void Show();', 'public abstract void Show();'],
      answer: 3,
      explanation: 'An abstract method has no body and ends with a semicolon. It cannot have a body, cannot be private and cannot be static in a class.',
    },
    {
      question: 'Payment p = new UpiPayment(500, "a@upi"); p.Pay(); Pay() is a concrete method in abstract Payment that calls abstract Process(). Which Process() runs?',
      options: ['UpiPayment.Process()', 'Payment.Process()', 'Compile error', 'Nothing runs'],
      answer: 0,
      explanation: 'Abstract methods are implicitly virtual, so the call inside Pay() is dispatched to the runtime object, UpiPayment.',
    },
    {
      question: 'Which pair of modifiers can NOT be applied together on a class you write?',
      options: ['public abstract', 'abstract partial', 'abstract sealed', 'internal abstract'],
      answer: 2,
      explanation: 'abstract requires inheritance and sealed forbids it, so they conflict (CS0418).',
    },
  ],
};
