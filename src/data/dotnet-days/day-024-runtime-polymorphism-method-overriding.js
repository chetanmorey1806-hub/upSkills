const animalCode = `Animal[] zoo =
{
    new Dog("Tommy"),
    new Cat("Kitty"),
    new Cow("Gauri"),
    new Animal("Nemo")
};

// One loop, one method call, four different behaviours.
foreach (Animal a in zoo)
{
    a.Speak();
}

class Animal
{
    public string Name { get; }

    public Animal(string name)
    {
        Name = name;
    }

    // virtual = "child classes MAY replace this"
    public virtual string Sound() => "...";

    // Non-virtual method that calls a virtual one
    public void Speak()
    {
        Console.WriteLine($"{Name} the {GetType().Name} says {Sound()}");
    }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }
    public override string Sound() => "Woof Woof";
}

class Cat : Animal
{
    public Cat(string name) : base(name) { }
    public override string Sound() => "Meow";
}

class Cow : Animal
{
    public Cow(string name) : base(name) { }
    public override string Sound() => "Moo";
}
`;

const overrideVsNewCode = `Console.WriteLine("--- Parent p1 = new Parent() ---");
Parent p1 = new Parent();
p1.Show();
p1.Greet();

Console.WriteLine("--- Parent p2 = new Child() ---");
Parent p2 = new Child();
p2.Show();     // override: looks at the OBJECT  -> Child.Show
p2.Greet();    // new:      looks at the VARIABLE -> Parent.Greet

Console.WriteLine("--- Child c = new Child() ---");
Child c = new Child();
c.Show();
c.Greet();

class Parent
{
    public virtual void Show() => Console.WriteLine("Parent.Show");
    public void Greet() => Console.WriteLine("Parent.Greet");
}

class Child : Parent
{
    public override void Show() => Console.WriteLine("Child.Show (override)");
    public new void Greet() => Console.WriteLine("Child.Greet (new = hiding)");
}
`;

const paymentCode = `List<Payment> payments = new List<Payment>
{
    new CashPayment(500),
    new UpiPayment(1200, "ravi@okaxis"),
    new CardPayment(2500, "4111222233334444")
};

int total = 0;
foreach (Payment p in payments)
{
    p.Pay();               // runtime decides which Pay() runs
    total += p.Amount;
}
Console.WriteLine($"Total collected: Rs.{total}");

class Payment
{
    public int Amount { get; }

    public Payment(int amount)
    {
        Amount = amount;
    }

    public virtual void Pay()
    {
        Console.WriteLine($"Processing payment of Rs.{Amount}");
    }
}

class CashPayment : Payment
{
    public CashPayment(int amount) : base(amount) { }

    public override void Pay()
    {
        base.Pay();   // reuse the common part from the parent
        Console.WriteLine("  -> Cash collected at counter. Receipt printed.");
    }
}

class UpiPayment : Payment
{
    private readonly string _upiId;

    public UpiPayment(int amount, string upiId) : base(amount)
    {
        _upiId = upiId;
    }

    public override void Pay()
    {
        base.Pay();
        Console.WriteLine($"  -> UPI collect request sent to {_upiId}.");
    }
}

class CardPayment : Payment
{
    private readonly string _cardNumber;

    public CardPayment(int amount, string cardNumber) : base(amount)
    {
        _cardNumber = cardNumber;
    }

    public override void Pay()
    {
        base.Pay();
        int fee = Amount * 2 / 100;   // 2% gateway fee
        string last4 = _cardNumber.Substring(_cardNumber.Length - 4);
        Console.WriteLine($"  -> Card ending {last4} charged. Fee: Rs.{fee}");
    }
}
`;

const employeeCode = `Employee[] staff =
{
    new Employee("Asha", 30000),
    new Manager("Vikram", 60000),
    new Director("Meera", 100000)
};

foreach (Employee e in staff)
{
    Console.WriteLine(e);   // WriteLine calls the overridden ToString()
}

class Employee
{
    public string Name { get; }
    public int Salary { get; }

    public Employee(string name, int salary)
    {
        Name = name;
        Salary = salary;
    }

    // 10% bonus for everyone
    public virtual int Bonus() => Salary * 10 / 100;

    // Overriding a method of System.Object
    public override string ToString()
        => $"{GetType().Name,-9}| {Name,-7}| Salary: {Salary,6} | Bonus: {Bonus(),6}";
}

class Manager : Employee
{
    public Manager(string name, int salary) : base(name, salary) { }

    // Employee bonus + 5000 fixed
    public override int Bonus() => base.Bonus() + 5000;
}

class Director : Manager
{
    public Director(string name, int salary) : base(name, salary) { }

    // Double the Manager bonus (multilevel overriding)
    public override int Bonus() => base.Bonus() * 2;
}
`;

const vsSteps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 8.0 (LTS) or .NET 10.0 (LTS), click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging',
  'To watch runtime dispatch: press F9 on the call line inside the loop, press F5, then F11 (Step Into) each time; the debugger jumps into a different class each iteration',
];

export default {
  id: 'day-024-runtime-polymorphism-method-overriding',
  title: 'Runtime Polymorphism: Method Overriding with virtual and override',
  module: 'Module 2: OOPs – Complete Object-Oriented Programming',
  day: 24,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Runtime polymorphism lets a parent-type variable call the correct child method at runtime. Learn virtual and override, how dynamic dispatch works, calling the parent with base, override vs new (hiding), overriding ToString, multilevel overriding and the rules the compiler enforces. Build the classic Animal sound program and a Payment system where Cash, UPI and Card each Pay in their own way.`,
  objectives: [
    'Explain runtime polymorphism (late binding) and how it differs from compile-time polymorphism',
    'Use virtual in a base class and override in derived classes',
    'Store different child objects in one parent-type array or List and process them in a loop',
    'Call the parent implementation with base.Method() and override ToString()',
    'Differentiate override from new (method hiding) and predict the output',
  ],
  theory: [
    {
      heading: 'What is Runtime Polymorphism?',
      content: `**Runtime polymorphism** means the method that runs is decided **while the program is running**, based on the **actual object** in memory, not on the variable type written in code. It is also called **dynamic binding**, **late binding** or **dynamic dispatch**.

Real-world analogies:
- **Driving test**: the examiner says "Start the vehicle". A car driver turns the key, a bike rider kicks or presses self-start, an EV driver presses a button. The instruction is the same; what happens depends on the vehicle actually present.
- **School bell**: when the bell rings, each student does "go to next class", but each student goes to a different room depending on their own timetable.
- **Pay button**: an e-commerce checkout has one "Pay" button. Whether it opens UPI, card OTP or Cash-on-Delivery is decided at runtime from the method the customer selected.

In C# you need three things:
1. **Inheritance** (Parent and Child classes)
2. A **virtual** (or abstract) method in the Parent
3. An **override** of that method in the Child, called through a **Parent-type reference**`,
      syntax: `Animal a = new Dog();   // variable type: Animal, object type: Dog
a.Sound();              // runs Dog.Sound() because Sound is virtual and Dog overrides it`,
    },
    {
      heading: 'virtual and override Keywords',
      content: `- **virtual** (in the base class): "this method has a default implementation, but derived classes are allowed to replace it".
- **override** (in the derived class): "I am replacing the inherited virtual / abstract / override method".

Rules:
- The overriding method must have the **same name, same parameters and same return type** (C# 9+ allows a more specific return type for overrides, called covariant returns).
- The **access modifier must be the same** (public stays public, protected stays protected).
- You cannot override a method that is not virtual, abstract or override (error CS0506).
- **static** methods cannot be virtual or overridden (they belong to the class, not an object).
- **private** methods cannot be virtual.
- Properties and indexers can also be virtual and overridden.
- An override is itself virtual, so a grandchild can override again (multilevel overriding), unless it is marked **sealed override** (Day 27).`,
      syntax: `class Animal
{
    public virtual string Sound() => "...";
}
class Dog : Animal
{
    public override string Sound() => "Woof";
}`,
    },
    {
      heading: 'How Dynamic Dispatch Works (Behind the Scenes)',
      content: `Every class that has virtual methods gets a **method table** (often called a **v-table**). It is a list of "which code to run" for each virtual method.

- Animal's table: Sound → Animal.Sound
- Dog's table: Sound → **Dog.Sound** (the override replaces the slot)
- Cat's table: Sound → **Cat.Sound**

Every object carries a pointer to its own class's table. When you call a.Sound() on a virtual method, the CLR follows the object's pointer to its table and calls whatever is in the Sound slot. That is why the variable type does not matter, only the object type.

Non-virtual methods are bound at compile time from the variable type, which is exactly why **new** (hiding) behaves differently from **override**.

**Upcasting** (Child → Parent) is implicit and safe: Animal a = new Dog(); Downcasting (Parent → Child) needs a cast and can fail: Dog d = (Dog)a; (more on is/as on Day 28).`,
      points: [
        'Variable (declared) type decides WHAT you are allowed to call (compile-time check)',
        'Object (runtime) type decides WHICH override actually runs',
        'A non-virtual method in the base that calls a virtual method still dispatches to the child override (Template Method pattern)',
      ],
    },
    {
      heading: 'Calling the Parent Version with base',
      content: `Inside an override you can call the parent's implementation with **base.MethodName()**. This is useful when the child wants to **extend** the parent behaviour instead of completely replacing it.

Example: every payment first logs "Processing payment of Rs.X" (common logic in Payment.Pay), then each child adds its own steps. Without base.Pay() you would copy-paste the common code into every child.

In multilevel inheritance, base refers to the **immediate** parent. In Director : Manager : Employee, base.Bonus() inside Director calls Manager.Bonus(), which may itself call Employee.Bonus().`,
      syntax: `public override void Pay()
{
    base.Pay();                                  // parent part first
    Console.WriteLine("Cash collected at counter"); // child part
}`,
    },
    {
      heading: 'override vs new (Method Hiding)',
      content: `On Day 22 you met **method hiding** with the new keyword. Compare it with overriding:

| | override | new (hiding) |
|---|---|---|
| Base method must be | virtual / abstract / override | Any (usually non-virtual) |
| Parent p = new Child(); p.M() runs | **Child.M** | **Parent.M** |
| Child c = new Child(); c.M() runs | Child.M | Child.M |
| Binding | Runtime (object type) | Compile time (variable type) |
| Polymorphism? | Yes | No, it just hides the name |

If you write the same method in a child **without** override or new, the compiler warns **CS0114/CS0108** ("hides inherited member") and treats it as new.

Rule of thumb: use **override** for real polymorphism. Use **new** only when you cannot change the base class (e.g. a library) and really need a different member with the same name.`,
    },
    {
      heading: 'Overriding Object Methods and Best Practices',
      content: `Every class inherits from **System.Object**, which has virtual methods **ToString()**, **Equals()** and **GetHashCode()**. The most common override in real projects is **ToString()** so that Console.WriteLine(obj), string interpolation and the debugger show useful text instead of the class name (details on Day 28).

Best practices:
- Keep the **same meaning** in the override (Liskov Substitution Principle): a CardPayment.Pay must still "pay".
- Call **base.Method()** when the parent does important common work (logging, validation).
- Do not call virtual methods from a **constructor**: the child override runs before the child constructor body has initialised its fields.
- Prefer a **List<Parent>** / **Parent[]** plus a loop instead of long if-else or switch chains on the type. Adding a new child class (e.g. WalletPayment) then needs **no change** in the loop (Open/Closed Principle).`,
      tip: 'Interview one-liner: "Overloading is decided by the compiler using argument types; overriding is decided by the CLR using the object type."',
    },
  ],
  examples: [
    {
      title: 'Animal Sound Program (Classic Runtime Polymorphism)',
      scenario: 'The syllabus task: Dog, Cat and Cow inherit from Animal and override Sound. One loop over an Animal[] array makes each animal speak correctly.',
      steps: vsSteps('AnimalSound'),
      code: animalCode,
      csharp: { files: { 'Program.cs': animalCode }, stdin: '' },
      result: `Tommy the Dog says Woof Woof
Kitty the Cat says Meow
Gauri the Cow says Moo
Nemo the Animal says ...`,
      explanation: `The array type is Animal[], but each element points to a different object. Speak() is defined only once in Animal and is not virtual, yet inside it the call Sound() is virtual, so the CLR looks at the real object: Dog → "Woof Woof", Cat → "Meow", Cow → "Moo". The plain Animal object uses the base version "...". GetType().Name also returns the runtime class name (Dog, Cat, Cow, Animal).`,
    },
    {
      title: 'override vs new: Predict the Output',
      scenario: 'A very common interview question. The same Child class has one overridden method and one hidden method.',
      steps: vsSteps('OverrideVsNew'),
      code: overrideVsNewCode,
      csharp: { files: { 'Program.cs': overrideVsNewCode }, stdin: '' },
      result: `--- Parent p1 = new Parent() ---
Parent.Show
Parent.Greet
--- Parent p2 = new Child() ---
Child.Show (override)
Parent.Greet
--- Child c = new Child() ---
Child.Show (override)
Child.Greet (new = hiding)`,
      explanation: `p1 is a real Parent, so both Parent methods run. p2 is a Parent variable holding a Child object: Show is virtual and overridden, so the object type wins → Child.Show; Greet is non-virtual and only hidden with new, so the variable type wins → Parent.Greet. c is a Child variable, so both calls see the Child versions.`,
    },
    {
      title: 'Payment System: Cash, UPI and Card Override Pay()',
      scenario: 'Yesterday we used overloading for payments. Now each payment type is its own class and overrides Pay(), reusing common logic with base.Pay().',
      steps: vsSteps('PaymentOverriding'),
      code: paymentCode,
      csharp: { files: { 'Program.cs': paymentCode }, stdin: '' },
      result: `Processing payment of Rs.500
  -> Cash collected at counter. Receipt printed.
Processing payment of Rs.1200
  -> UPI collect request sent to ravi@okaxis.
Processing payment of Rs.2500
  -> Card ending 4444 charged. Fee: Rs.50
Total collected: Rs.4200`,
      explanation: `The List holds Payment references. For each item, p.Pay() runs the override of the real object. Each override first calls base.Pay() (prints "Processing payment of Rs.X") and then adds its own line. Card fee = 2500 * 2 / 100 = 50 (integer arithmetic). Total = 500 + 1200 + 2500 = 4200. To add WalletPayment tomorrow, you write one new class; the loop does not change.`,
    },
    {
      title: 'Multilevel Overriding and ToString() Override',
      scenario: 'An HR app calculates bonus: Employee 10%, Manager gets Employee bonus + 5000, Director gets double the Manager bonus.',
      steps: vsSteps('EmployeeBonus'),
      code: employeeCode,
      csharp: { files: { 'Program.cs': employeeCode }, stdin: '' },
      result: `Employee | Asha   | Salary:  30000 | Bonus:   3000
Manager  | Vikram | Salary:  60000 | Bonus:  11000
Director | Meera  | Salary: 100000 | Bonus:  30000`,
      explanation: `Console.WriteLine(e) calls e.ToString(), which we overrode in Employee. Inside ToString, Bonus() is virtual, so each object uses its own Bonus. Asha: 30000 * 10 / 100 = 3000. Vikram (Manager): base (Employee) bonus 6000 + 5000 = 11000. Meera (Director): base.Bonus() is Manager.Bonus = 10000 + 5000 = 15000, doubled = 30000. Format items like {Name,-7} left-align in 7 characters and {Salary,6} right-align in 6 characters, so the columns line up.`,
    },
  ],
  interview: [
    {
      q: 'What is runtime polymorphism in C#?',
      a: `Calling a method through a base-class (or interface) reference where the actual method executed is decided at runtime by the object's real type. It is achieved with virtual/abstract methods in the base and override in the derived class. Also called late binding or dynamic dispatch.`,
      level: 'Easy',
    },
    {
      q: 'What is the purpose of the virtual keyword?',
      a: `It marks a base-class method, property, indexer or event as overridable. Without virtual (or abstract), a derived class cannot override it; it can only hide it with new.`,
      level: 'Easy',
    },
    {
      q: 'Difference between override and new?',
      a: `override replaces a virtual method in the v-table, so a base reference to a child object calls the child version (runtime binding). new hides the base member; the version called depends on the variable type (compile-time binding). Parent p = new Child(); p.M() calls Child.M with override but Parent.M with new.`,
      level: 'Medium',
    },
    {
      q: `Output? class A { public virtual void M() => Console.Write("A"); } class B : A { public override void M() => Console.Write("B"); } class C : B { public new void M() => Console.Write("C"); }  A x = new C(); x.M();`,
      a: `Prints "B". The v-table slot for M in C still points to B's override because C only hides M with new. Through an A reference, the virtual call finds B.M.`,
      level: 'Hard',
    },
    {
      q: 'Can we override a static method or a private method?',
      a: `No. Static methods belong to the type, not to an object, so there is no object type to dispatch on; they cannot be virtual. Private methods are not visible to derived classes, so they cannot be virtual or overridden either.`,
      level: 'Medium',
    },
    {
      q: 'Can we change the access modifier or return type while overriding?',
      a: `The access modifier must stay the same (one special case: protected internal from another assembly becomes protected). The parameters must be identical. Since C# 9, the return type may be a more derived type (covariant return types), e.g. base returns Animal, override returns Dog.`,
      level: 'Medium',
    },
    {
      q: 'What does base.Method() do inside an override?',
      a: `It calls the immediate parent class's implementation of the method, bypassing virtual dispatch for that one call. It is used to extend the parent behaviour (common logging or validation) rather than replace it completely.`,
      level: 'Easy',
    },
    {
      q: 'What happens if a derived class defines a method with the same signature as a virtual base method but without override or new?',
      a: `It compiles with warning CS0114 ("hides inherited member; to make the current member override that implementation, add the override keyword"). It behaves like new, so it does NOT take part in polymorphism.`,
      level: 'Medium',
    },
    {
      q: 'Why is it dangerous to call a virtual method from a base class constructor?',
      a: `In C# the most-derived override runs even during base construction. At that point the derived constructor body has not executed, so fields it sets are still default (null/0). The override may then throw NullReferenceException or use wrong values.`,
      level: 'Hard',
    },
    {
      q: 'What is a v-table?',
      a: `A per-type method table that the CLR uses for virtual calls. Each virtual method has a slot pointing to the implementation; an override replaces the slot in the derived type's table. Each object has a pointer to its type's table, so a virtual call is resolved by looking up the slot at runtime.`,
      level: 'Hard',
    },
    {
      q: 'Give a real-time example of runtime polymorphism in a project.',
      a: `A payment module: abstract/base Payment with virtual Pay(); CashPayment, UpiPayment, CardPayment override it. The checkout service holds a Payment reference chosen by the user and calls Pay() without knowing the concrete type. Adding WalletPayment needs no change in checkout code (Open/Closed Principle). ASP.NET Core uses the same idea with ControllerBase, middleware and overridable filter methods.`,
      level: 'Medium',
    },
    {
      q: 'Can properties be overridden?',
      a: `Yes. Declare public virtual string Description { get; } in the base and public override string Description => "..."; in the child. Abstract properties must be overridden.`,
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create a Shape base class with a virtual method Draw(). Create Circle, Rectangle and Triangle that override Draw(). Store them in a List<Shape> and call Draw() in a foreach loop.',
      hint: 'Base Draw prints "Drawing a shape"; each child prints its own message.',
      solution: `List<Shape> shapes = new() { new Circle(), new Rectangle(), new Triangle() };
foreach (Shape s in shapes) s.Draw();

class Shape { public virtual void Draw() => Console.WriteLine("Drawing a shape"); }
class Circle : Shape { public override void Draw() => Console.WriteLine("Drawing a circle (O)"); }
class Rectangle : Shape { public override void Draw() => Console.WriteLine("Drawing a rectangle [ ]"); }
class Triangle : Shape { public override void Draw() => Console.WriteLine("Drawing a triangle (^)"); }`,
    },
    {
      task: 'Add a WalletPayment class (Paytm/PhonePe wallet) to the payment example that overrides Pay() and prints the wallet balance after payment. Do not change the foreach loop.',
      hint: 'Pass the starting wallet balance in the constructor; call base.Pay() first.',
      solution: `class WalletPayment : Payment
{
    private int _balance;
    public WalletPayment(int amount, int balance) : base(amount) { _balance = balance; }
    public override void Pay()
    {
        base.Pay();
        _balance -= Amount;
        Console.WriteLine($"  -> Paid from wallet. Remaining balance: Rs.{_balance}");
    }
}
// Add new WalletPayment(300, 1000) to the list -> prints Remaining balance: Rs.700`,
    },
    {
      task: 'Create a Vehicle class with virtual int MaxSpeed() and virtual string ToString(). Create Bike (100), Car (180) and Truck (80). Print all vehicles using Console.WriteLine(vehicle).',
      hint: 'Override ToString() once in Vehicle using GetType().Name and MaxSpeed().',
      solution: `Vehicle[] list = { new Bike(), new Car(), new Truck() };
foreach (var v in list) Console.WriteLine(v);

class Vehicle
{
    public virtual int MaxSpeed() => 0;
    public override string ToString() => $"{GetType().Name}: {MaxSpeed()} km/h";
}
class Bike : Vehicle { public override int MaxSpeed() => 100; }
class Car : Vehicle { public override int MaxSpeed() => 180; }
class Truck : Vehicle { public override int MaxSpeed() => 80; }
// Bike: 100 km/h
// Car: 180 km/h
// Truck: 80 km/h`,
    },
    {
      task: 'Predict the output without running, then verify: class X { public virtual string Name() => "X"; public string Hello() => "Hello from " + Name(); } class Y : X { public override string Name() => "Y"; }  Console.WriteLine(new Y().Hello());',
      hint: 'Hello is not virtual, but Name() inside it is.',
      solution: `Output: Hello from Y
Hello() is inherited from X, but the call to Name() inside it is virtual, so it dispatches to Y.Name().`,
    },
    {
      task: 'Build a NotificationSender base class with virtual Send(string msg). Create EmailSender and SmsSender overrides. SmsSender should cut messages longer than 20 characters and add "...".',
      hint: 'Use msg.Length > 20 ? msg.Substring(0, 20) + "..." : msg',
      solution: `NotificationSender[] senders = { new EmailSender(), new SmsSender() };
foreach (var s in senders) s.Send("Your order has been shipped today");

class NotificationSender { public virtual void Send(string msg) => Console.WriteLine(msg); }
class EmailSender : NotificationSender
{
    public override void Send(string msg) => Console.WriteLine($"[Email] {msg}");
}
class SmsSender : NotificationSender
{
    public override void Send(string msg)
    {
        string text = msg.Length > 20 ? msg.Substring(0, 20) + "..." : msg;
        Console.WriteLine($"[SMS] {text}");
    }
}
// [Email] Your order has been shipped today
// [SMS] Your order has been ...`,
    },
  ],
  quiz: [
    {
      question: 'Which keyword in the BASE class allows a method to be overridden?',
      options: ['override', 'new', 'virtual', 'sealed'],
      answer: 2,
      explanation: 'virtual (or abstract) in the base class makes the method overridable; override is used in the derived class.',
    },
    {
      question: 'Parent p = new Child(); p.Show(); Show is virtual in Parent and overridden in Child. What runs?',
      options: ['Child.Show', 'Parent.Show', 'Both', 'Compile error'],
      answer: 0,
      explanation: 'For virtual methods, the runtime object type (Child) decides which implementation runs.',
    },
    {
      question: 'Parent p = new Child(); p.Greet(); Greet is non-virtual in Parent and declared with new in Child. What runs?',
      options: ['Child.Greet', 'Both', 'Runtime error', 'Parent.Greet'],
      answer: 3,
      explanation: 'Method hiding is resolved at compile time from the variable type, which is Parent.',
    },
    {
      question: 'Which statement about overriding is TRUE?',
      options: [
        'Static methods can be overridden',
        'The overriding method must have the same parameters as the base method',
        'A private method can be virtual',
        'override can change public to private',
      ],
      answer: 1,
      explanation: 'Overrides need an identical parameter list and the same accessibility. Static and private methods cannot be virtual.',
    },
    {
      question: 'Runtime polymorphism is also known as:',
      options: ['Early binding', 'Static binding', 'Late (dynamic) binding', 'Method overloading'],
      answer: 2,
      explanation: 'The method is bound late, at runtime, based on the object type: dynamic dispatch.',
    },
  ],
};
