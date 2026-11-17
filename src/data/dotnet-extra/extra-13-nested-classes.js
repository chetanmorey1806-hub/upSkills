export default {
  id: 'extra-13-nested-classes',
  title: 'Nested Classes',
  module: 'Extra: OOP Concepts',
  extraNo: 13,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `A nested class is a class declared inside another class. It is used to hide helper types, to group types that only make sense together (Car.Engine, LinkedList.Node, Pizza.Builder) and to give a helper class access to the private members of its outer class. This lesson covers access rules, private vs public nested classes, static access, the Builder idea and when NOT to nest.`,
  objectives: [
    'Declare nested classes and create their objects from inside and outside the outer class',
    'Explain the access rules between outer and nested classes',
    'Use private nested classes to hide implementation details',
    'Build a fluent Builder as a nested class that calls a private constructor',
  ],
  theory: [
    {
      heading: 'What is a nested class?',
      content: `A nested (inner) class is a type declared inside the body of another class or struct. The outer class is called the containing type. The full name of a nested class includes the outer name: Car.Engine.

Real-world analogy: a car has an engine. The engine is designed only for that car model, so the factory keeps its blueprint inside the car's blueprint. Outside people see "Car.Engine", and some internal parts of the engine can be completely hidden from them.`,
      syntax: `public class Car
{
    public class Engine { }        // nested type
}

var e = new Car.Engine();          // use OuterName.NestedName from outside`,
    },
    {
      heading: 'Access rules',
      content: `1. A nested class can access ALL members of the outer class, including private ones — but it needs an instance of the outer class to reach instance members (there is no hidden "outer this" like in Java inner classes).
2. The outer class can only access the public/internal members of the nested class; private members of the nested class stay private.
3. Nested types are private by default (top-level types are internal by default). You can mark them public, internal, protected, private, protected internal or private protected.`,
      points: [
        'Default accessibility of a nested class = private',
        'Nested class can read outer private fields: outerObj.secret',
        'Nested class can call outer private constructors (used by Builders and Singletons)',
        'Outer static members can be used directly by the nested class',
      ],
    },
    {
      heading: 'Private nested classes – hiding implementation',
      content: `If a helper type is only needed by one class, make it a PRIVATE nested class. Nobody outside can create or even see it, so you can change it freely later. Typical examples: the Node of a linked list, a Transaction record inside a BankAccount, an internal enumerator. This is encapsulation applied to types, not just fields.`,
      tip: `A private nested type cannot appear in a public member signature (for example a public method returning it) — you get error CS0050/CS0051 (inconsistent accessibility).`,
    },
    {
      heading: 'Static members, generics and multiple levels',
      content: `A nested class can itself be static, abstract, sealed or generic, and it can contain its own nested types. A nested class inside a generic outer class can use the outer type parameter T: class MyList<T> { private class Node { public T Value; } }. Nested classes are not "static" by default, but because there is no implicit link to an outer instance, a non-static nested class in C# behaves like a Java "static nested class".`,
      syntax: `class Outer
{
    private static int counter = 0;
    public static class Helper
    {
        public static int Next() => ++counter;   // uses outer private static field
    }
}
Console.WriteLine(Outer.Helper.Next());  // 1`,
    },
    {
      heading: 'Builder pattern with a nested class',
      content: `Making the outer constructor private and exposing a public nested Builder class forces everyone to build objects step by step through the builder. The builder is allowed to call the private constructor because it is nested. Methods return "this" so you can chain calls (fluent interface).`,
    },
    {
      heading: 'When to nest and when not to',
      content: `Nest when the inner type is meaningless without the outer type, is an implementation detail, or needs private access. Do NOT nest types that are widely used on their own, because Outer.Inner names become long and nested public types are harder to discover. Microsoft guidelines: avoid publicly exposed nested types except for things like enumerators or builders that are tightly coupled to the outer type.`,
      points: ['Good: LinkedList<T>.Node, Dictionary<TKey,TValue>.Enumerator, Pizza.Builder', 'Bad: putting all DTOs of a project inside one giant class'],
    },
  ],
  examples: [
    {
      title: 'Car and Engine – nested class reading private outer data',
      scenario: 'A Car owns an Engine. The Engine must print the car model, which is a private field of Car.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it NestedCar',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;

var car = new Car("Swift");
car.Start();

var spare = new Car.Engine(1200);   // public nested class used from outside
Console.WriteLine(spare.Describe());

class Car
{
    private readonly string model;      // private to Car
    private readonly Engine engine;

    public Car(string model)
    {
        this.model = model;
        engine = new Engine(1197);
    }

    public void Start()
    {
        Console.WriteLine($"{model} starting...");
        engine.Ignite(this);
    }

    public class Engine
    {
        private readonly int cc;
        public Engine(int cc) => this.cc = cc;

        // The nested class can read Car's PRIVATE field 'model'
        public void Ignite(Car car) => Console.WriteLine($"Engine {cc}cc ignited for {car.model}");

        public string Describe() => $"Spare engine of {cc}cc";
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;

var car = new Car("Swift");
car.Start();

var spare = new Car.Engine(1200);   // public nested class used from outside
Console.WriteLine(spare.Describe());

class Car
{
    private readonly string model;      // private to Car
    private readonly Engine engine;

    public Car(string model)
    {
        this.model = model;
        engine = new Engine(1197);
    }

    public void Start()
    {
        Console.WriteLine($"{model} starting...");
        engine.Ignite(this);
    }

    public class Engine
    {
        private readonly int cc;
        public Engine(int cc) => this.cc = cc;

        // The nested class can read Car's PRIVATE field 'model'
        public void Ignite(Car car) => Console.WriteLine($"Engine {cc}cc ignited for {car.model}");

        public string Describe() => $"Spare engine of {cc}cc";
    }
}`,
        },
        stdin: '',
      },
      result: `Swift starting...
Engine 1197cc ignited for Swift
Spare engine of 1200cc`,
      explanation: `Engine is declared inside Car, so it may read car.model even though model is private. Notice it needs a Car reference (passed as this) — C# nested classes have no automatic link to an outer object. From outside we create the engine with the qualified name Car.Engine.`,
    },
    {
      title: 'Private nested class – BankAccount transaction history',
      scenario: 'A bank account keeps a history of transactions. The Transaction type is an internal detail and must not be visible outside BankAccount.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it NestedBank',
        'Replace Program.cs with the code',
        'Try typing new BankAccount.Transaction(...) in Main – IntelliSense will not show it (it is private)',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var acc = new BankAccount("Asha");
acc.Deposit(5000);
acc.Withdraw(1500);
acc.Deposit(700);
acc.PrintStatement();
// var t = new BankAccount.Transaction("X", 1, 1);  // CS0122: inaccessible due to its protection level

class BankAccount
{
    private readonly string owner;
    private int balance;
    private readonly List<Transaction> history = new();

    public BankAccount(string owner) => this.owner = owner;

    public void Deposit(int amount)
    {
        balance += amount;
        history.Add(new Transaction("Deposit", amount, balance));
    }

    public void Withdraw(int amount)
    {
        balance -= amount;
        history.Add(new Transaction("Withdraw", amount, balance));
    }

    public void PrintStatement()
    {
        Console.WriteLine($"Statement for {owner}");
        foreach (var t in history)
            Console.WriteLine(t);
        Console.WriteLine($"Closing balance: {balance}");
    }

    private class Transaction            // hidden helper type
    {
        public string Type { get; }
        public int Amount { get; }
        public int BalanceAfter { get; }

        public Transaction(string type, int amount, int balanceAfter)
        {
            Type = type;
            Amount = amount;
            BalanceAfter = balanceAfter;
        }

        public override string ToString() => $"{Type}: {Amount} (balance {BalanceAfter})";
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var acc = new BankAccount("Asha");
acc.Deposit(5000);
acc.Withdraw(1500);
acc.Deposit(700);
acc.PrintStatement();
// var t = new BankAccount.Transaction("X", 1, 1);  // CS0122: inaccessible due to its protection level

class BankAccount
{
    private readonly string owner;
    private int balance;
    private readonly List<Transaction> history = new();

    public BankAccount(string owner) => this.owner = owner;

    public void Deposit(int amount)
    {
        balance += amount;
        history.Add(new Transaction("Deposit", amount, balance));
    }

    public void Withdraw(int amount)
    {
        balance -= amount;
        history.Add(new Transaction("Withdraw", amount, balance));
    }

    public void PrintStatement()
    {
        Console.WriteLine($"Statement for {owner}");
        foreach (var t in history)
            Console.WriteLine(t);
        Console.WriteLine($"Closing balance: {balance}");
    }

    private class Transaction            // hidden helper type
    {
        public string Type { get; }
        public int Amount { get; }
        public int BalanceAfter { get; }

        public Transaction(string type, int amount, int balanceAfter)
        {
            Type = type;
            Amount = amount;
            BalanceAfter = balanceAfter;
        }

        public override string ToString() => $"{Type}: {Amount} (balance {BalanceAfter})";
    }
}`,
        },
        stdin: '',
      },
      result: `Statement for Asha
Deposit: 5000 (balance 5000)
Withdraw: 1500 (balance 3500)
Deposit: 700 (balance 4200)
Closing balance: 4200`,
      explanation: `Transaction is private, so only BankAccount can create and use it. The balance goes 0 + 5000 = 5000, 5000 - 1500 = 3500, 3500 + 700 = 4200. The private field history may use the private nested type because the field itself is private (a public property of type List<Transaction> would be a compile error).`,
    },
    {
      title: 'Fluent Builder as a nested class',
      scenario: 'A pizza shop wants pizzas created only through a step-by-step builder. The Pizza constructor is private; Pizza.Builder is the only way to create one, and every pizza gets an order number from a private static counter.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it PizzaBuilder',
        'Replace Program.cs with the code',
        'Try new Pizza(...) in Program.cs – you will get CS0122 because the constructor is private',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var p1 = new Pizza.Builder()
    .Size("Large")
    .AddTopping("Cheese")
    .AddTopping("Olives")
    .Build();

var p2 = new Pizza.Builder()
    .AddTopping("Paneer")
    .Build();

Console.WriteLine(p1);
Console.WriteLine(p2);
Console.WriteLine($"Pizzas made: {Pizza.Builder.TotalMade}");

class Pizza
{
    private static int made = 0;          // private static outer field
    private readonly int number;
    private readonly string size;
    private readonly List<string> toppings;

    private Pizza(string size, List<string> toppings)   // only Builder can call this
    {
        number = ++made;
        this.size = size;
        this.toppings = toppings;
    }

    public override string ToString() =>
        $"Pizza #{number}: {size} with {string.Join(", ", toppings)}";

    public class Builder
    {
        private string size = "Medium";
        private readonly List<string> toppings = new();

        public static int TotalMade => made;   // reads outer private static

        public Builder Size(string s) { size = s; return this; }
        public Builder AddTopping(string t) { toppings.Add(t); return this; }
        public Pizza Build() => new Pizza(size, toppings);
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var p1 = new Pizza.Builder()
    .Size("Large")
    .AddTopping("Cheese")
    .AddTopping("Olives")
    .Build();

var p2 = new Pizza.Builder()
    .AddTopping("Paneer")
    .Build();

Console.WriteLine(p1);
Console.WriteLine(p2);
Console.WriteLine($"Pizzas made: {Pizza.Builder.TotalMade}");

class Pizza
{
    private static int made = 0;          // private static outer field
    private readonly int number;
    private readonly string size;
    private readonly List<string> toppings;

    private Pizza(string size, List<string> toppings)   // only Builder can call this
    {
        number = ++made;
        this.size = size;
        this.toppings = toppings;
    }

    public override string ToString() =>
        $"Pizza #{number}: {size} with {string.Join(", ", toppings)}";

    public class Builder
    {
        private string size = "Medium";
        private readonly List<string> toppings = new();

        public static int TotalMade => made;   // reads outer private static

        public Builder Size(string s) { size = s; return this; }
        public Builder AddTopping(string t) { toppings.Add(t); return this; }
        public Pizza Build() => new Pizza(size, toppings);
    }
}`,
        },
        stdin: '',
      },
      result: `Pizza #1: Large with Cheese, Olives
Pizza #2: Medium with Paneer
Pizzas made: 2`,
      explanation: `Each builder method returns this, which allows the chained calls. Build() calls the PRIVATE Pizza constructor — allowed only because Builder is nested inside Pizza. The second builder never called Size(), so the default "Medium" is used. TotalMade reads the outer private static field made directly.`,
    },
    {
      title: 'Generic outer class with a private Node – simple linked list',
      scenario: 'Build a tiny singly linked list. The Node type uses the outer type parameter T and is completely hidden.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it NestedLinkedList',
        'Replace Program.cs with the code',
        'Press F5 with a breakpoint (F9) inside Add and step with F10 to watch the nodes get linked',
      ],
      code: `using System;

var list = new SimpleList<string>();
list.Add("C#");
list.Add("SQL");
list.Add("React");
list.Print();
Console.WriteLine($"Count = {list.Count}");

class SimpleList<T>
{
    private Node? head;
    private Node? tail;
    public int Count { get; private set; }

    public void Add(T value)
    {
        var node = new Node(value);
        if (head == null) head = tail = node;
        else { tail!.Next = node; tail = node; }
        Count++;
    }

    public void Print()
    {
        for (var n = head; n != null; n = n.Next)
            Console.Write(n.Value + (n.Next != null ? " -> " : ""));
        Console.WriteLine();
    }

    private class Node                 // uses outer T
    {
        public T Value { get; }
        public Node? Next { get; set; }
        public Node(T value) => Value = value;
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;

var list = new SimpleList<string>();
list.Add("C#");
list.Add("SQL");
list.Add("React");
list.Print();
Console.WriteLine($"Count = {list.Count}");

class SimpleList<T>
{
    private Node? head;
    private Node? tail;
    public int Count { get; private set; }

    public void Add(T value)
    {
        var node = new Node(value);
        if (head == null) head = tail = node;
        else { tail!.Next = node; tail = node; }
        Count++;
    }

    public void Print()
    {
        for (var n = head; n != null; n = n.Next)
            Console.Write(n.Value + (n.Next != null ? " -> " : ""));
        Console.WriteLine();
    }

    private class Node                 // uses outer T
    {
        public T Value { get; }
        public Node? Next { get; set; }
        public Node(T value) => Value = value;
    }
}`,
        },
        stdin: '',
      },
      result: `C# -> SQL -> React
Count = 3`,
      explanation: `Node is a private nested class that can use the outer type parameter T without redeclaring it (its full type is SimpleList<T>.Node). The list links head -> SQL -> React by updating tail.Next. Callers only see Add, Print and Count — the node structure is fully encapsulated.`,
    },
  ],
  interview: [
    { q: 'What is a nested class?', a: 'A class declared inside another class or struct. It is referenced from outside as Outer.Nested and is a member of the outer type.', level: 'Easy' },
    { q: 'What is the default access modifier of a nested class?', a: 'private. (A top-level class defaults to internal.)', level: 'Easy' },
    { q: 'Can a nested class access private members of the outer class?', a: 'Yes, all of them, including private fields, methods and constructors. For instance members it needs a reference to an outer object.', level: 'Medium' },
    { q: 'Can the outer class access private members of the nested class?', a: 'No. Accessibility of nested members is respected by the outer class; it can only use public, internal (and protected internal) members of the nested class.', level: 'Medium' },
    { q: 'Does a C# nested class have an implicit reference to the outer instance like Java inner classes?', a: 'No. C# has no "inner class" concept with an implicit outer this. You must pass the outer object explicitly (e.g. through the constructor).', level: 'Hard' },
    { q: 'How do you create an object of a public nested class from Main?', a: 'var e = new Car.Engine(1200); – use the outer class name as a qualifier.', level: 'Easy' },
    { q: 'Give real .NET examples of nested types.', a: 'List<T>.Enumerator, Dictionary<TKey,TValue>.KeyCollection, Environment.SpecialFolder (nested enum), and many Builder classes.', level: 'Medium' },
    { q: 'Why make a nested class private?', a: 'To hide an implementation detail (like a linked list Node) so it cannot be used or depended on from outside, allowing changes without breaking callers.', level: 'Medium' },
    { q: 'What error occurs if a public method returns a private nested type?', a: 'CS0050 (inconsistent accessibility: return type is less accessible than method). Public members cannot expose less accessible types.', level: 'Hard' },
    { q: 'How does a nested Builder help with the Builder pattern?', a: 'The outer class makes its constructor private; the nested Builder can still call it because nested types can access private members. So objects can only be created through the builder.', level: 'Medium' },
    { q: 'Can nested classes be inherited?', a: 'Yes. A nested class can inherit from other classes, and other classes can inherit from a nested class if it is accessible, e.g. class Turbo : Car.Engine.', level: 'Medium' },
    { q: 'Output? class A { static int x = 5; public class B { public int Get() => x * 2; } } Console.WriteLine(new A.B().Get());', a: '10. The nested class B reads the private static field x of A directly.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a University class with a public nested Department class. Create two departments from Main and print their names.',
      hint: 'var d = new University.Department("CSE");',
      solution: `var d1 = new University.Department("CSE");
var d2 = new University.Department("ECE");
Console.WriteLine(d1.Name + ", " + d2.Name);   // CSE, ECE

class University
{
    public class Department
    {
        public string Name { get; }
        public Department(string name) => Name = name;
    }
}`,
    },
    {
      task: 'Create a Library class that stores books using a private nested Book class. Expose AddBook(title, author) and PrintBooks() only.',
      hint: 'Keep List<Book> as a private field; Book overrides ToString().',
      solution: `var lib = new Library();
lib.AddBook("Clean Code", "Robert Martin");
lib.AddBook("C# in Depth", "Jon Skeet");
lib.PrintBooks();

class Library
{
    private readonly List<Book> books = new();
    public void AddBook(string t, string a) => books.Add(new Book(t, a));
    public void PrintBooks() { foreach (var b in books) Console.WriteLine(b); }
    private class Book
    {
        private readonly string title, author;
        public Book(string t, string a) { title = t; author = a; }
        public override string ToString() => $"{title} by {author}";
    }
}
// Clean Code by Robert Martin
// C# in Depth by Jon Skeet`,
    },
    {
      task: 'Write a User class with a private constructor and a nested UserBuilder with WithName, WithEmail and Build methods.',
      hint: 'Return this from each With... method.',
      solution: `var u = new User.UserBuilder().WithName("Ravi").WithEmail("ravi@mail.com").Build();
Console.WriteLine(u);  // Ravi <ravi@mail.com>

class User
{
    private readonly string name, email;
    private User(string n, string e) { name = n; email = e; }
    public override string ToString() => $"{name} <{email}>";
    public class UserBuilder
    {
        private string name = "", email = "";
        public UserBuilder WithName(string n) { name = n; return this; }
        public UserBuilder WithEmail(string e) { email = e; return this; }
        public User Build() => new User(name, email);
    }
}`,
    },
    {
      task: 'Create an Order class with a private static int counter and a nested public static class IdGenerator with Next() that returns "ORD-1", "ORD-2"...',
      hint: 'The nested static class can increment the outer private static field.',
      solution: `Console.WriteLine(Order.IdGenerator.Next()); // ORD-1
Console.WriteLine(Order.IdGenerator.Next()); // ORD-2

class Order
{
    private static int counter;
    public static class IdGenerator
    {
        public static string Next() => $"ORD-{++counter}";
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'What is the default accessibility of a class declared inside another class?',
      options: ['public', 'internal', 'protected', 'private'],
      answer: 3,
      explanation: 'Nested types default to private; top-level types default to internal.',
    },
    {
      question: 'Can a nested class read a private field of its outer class?',
      options: ['Yes', 'No', 'Only if the field is static', 'Only through reflection'],
      answer: 0,
      explanation: 'Nested types have access to all members of the containing type (instance members still need an object reference).',
    },
    {
      question: 'How do you instantiate public nested class Engine inside Car from Main?',
      options: ['new Engine()', 'new Car.Engine()', 'Car.new Engine()', 'new Car().Engine()'],
      answer: 1,
      explanation: 'Use the qualified name OuterType.NestedType.',
    },
    {
      question: 'Why is a nested Builder able to call the outer class private constructor?',
      options: ['Because it is static', 'Because it inherits the outer class', 'Because nested types can access private members of their containing type', 'It cannot'],
      answer: 2,
      explanation: 'Being a member of the outer class gives the nested type access to its private members.',
    },
    {
      question: 'Which is a GOOD use of a private nested class?',
      options: ['Shared DTOs used by all controllers', 'A Node type inside a custom linked list', 'The Program class', 'A public API model'],
      answer: 1,
      explanation: 'Node is an implementation detail of the list and should be hidden.',
    },
  ],
};
