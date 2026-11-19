export default {
  lesson: 'day-020-encapsulation-access-modifiers',
  minutes: 16,
  intro: 'Practise encapsulation: hiding data with private fields, exposing it safely through properties and methods, and the six access modifiers.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'If you write a field inside a class **without** an access modifier (e.g. `int balance;`), what is its accessibility?',
      options: ['public', 'private', 'internal', 'protected'],
      answer: 1,
      explain: 'Class members are **private** by default. Top-level classes without a modifier are **internal** (visible in the same assembly/project). Writing the modifier explicitly is good practice.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Match the access modifiers. Which statements are TRUE? (choose all that apply)',
      options: [
        'private: only inside the same class',
        'protected: the same class and derived (child) classes',
        'internal: anywhere in the same assembly (project)',
        'public: only inside the same namespace',
        'protected internal: same assembly OR derived classes',
        'private protected: derived classes in the same assembly only',
      ],
      answers: [0, 1, 2, 4, 5],
      explain: '`public` means accessible from **everywhere**, including other projects, not just the same namespace. The other five definitions are correct: namespaces do not control access at all in C#.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'An encapsulated bank account. What does this print?',
      example: { title: 'state changes only through methods', code: 'public void Deposit(decimal amt)\n{\n    if (amt <= 0) return;   // reject bad input\n    balance += amt;\n}' },
      code: `var acc = new BankAccount();
acc.Deposit(5000);
acc.Deposit(-200);
Console.WriteLine(acc.Withdraw(7000));
Console.WriteLine(acc.Withdraw(1500));
Console.WriteLine(acc.Balance);

class BankAccount
{
    private int balance;
    public int Balance => balance;

    public void Deposit(int amount)
    {
        if (amount > 0) balance += amount;
    }

    public string Withdraw(int amount)
    {
        if (amount > balance) return "Insufficient funds";
        balance -= amount;
        return "Withdrawn " + amount;
    }
}`,
      expected: `Insufficient funds
Withdrawn 1500
3500`,
      explain: 'The `balance` field is private, so the only way to change it is through `Deposit`/`Withdraw`, which reject a negative deposit and an overdraft. `Balance => balance` is a **read-only** property: outside code can read it but not set it.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write an auto-property `Salary` of type `decimal` that anyone can **read**, but only code inside the class can **change**.',
      example: { title: 'restricting the setter', code: 'public string Status { get; private set; }' },
      accept: ['public decimal Salary { get; private set; }'],
      acceptRegex: ['^public\\s+decimal\\s+Salary\\s*\\{\\s*get\\s*;\\s*private\\s+set\\s*;\\s*\\}\\s*;?$'],
      caseSensitive: true,
      explain: 'Accessors can have their own, more restrictive modifier. `private set` lets the class update the value (e.g. in `GiveRaise()`), while outside code gets a compile error if it tries `emp.Salary = 0;`. `{ get; init; }` is another option when the value is set only at creation.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main goal of **encapsulation**?',
      options: [
        'To make all fields public for easy access',
        'To bundle data with the methods that use it and hide the internal state, so it can only be changed in controlled, valid ways',
        'To inherit code from a parent class',
        'To run code faster',
      ],
      answer: 1,
      explain: 'Encapsulation = **data hiding + controlled access**. Private fields plus public properties/methods let the class enforce rules (no negative balance, marks 0-100). Inheritance is a different OOP pillar.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Properties that clean and validate data: what does this print?',
      example: { title: 'setter that normalises data', code: 'public string Email\n{\n    get => email;\n    set => email = value.Trim().ToLower();\n}' },
      code: `var e = new Employee();
e.Name = "  priya  ";
e.Age = 17;
e.Age = 25;
Console.WriteLine($"[{e.Name}] {e.Age}");

class Employee
{
    private string name = "";
    private int age = 18;

    public string Name
    {
        get => name;
        set => name = value.Trim().ToUpper();
    }

    public int Age
    {
        get => age;
        set { if (value >= 18 && value <= 60) age = value; }
    }
}`,
      expected: '[PRIYA] 25',
      explain: 'The `Name` setter cleans the input (trim + uppercase) before storing it. The `Age` setter silently ignores 17 (outside 18-60) and accepts 25. Callers never touch the fields directly.',
    },
  ],
};
