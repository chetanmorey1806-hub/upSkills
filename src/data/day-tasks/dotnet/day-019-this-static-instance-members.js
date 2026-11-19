export default {
  lesson: 'day-019-this-static-instance-members',
  minutes: 16,
  intro: 'Practise the this keyword, static vs instance members, shared counters and method chaining with return this.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'The constructor parameter has the same name as the field. Complete the line that copies the parameter into the field:\n```\nclass Student\n{\n    private string name;\n    public Student(string name)\n    {\n        ______________\n    }\n}\n```',
      example: { title: 'this refers to the current object', code: 'public Car(string model)\n{\n    this.model = model;\n}' },
      accept: ['this.name = name;', 'this.name = name'],
      acceptRegex: ['^this\\.name\\s*=\\s*name\\s*;?$'],
      caseSensitive: true,
      explain: '`this.name` is the **field** of the current object; plain `name` is the parameter. Writing `name = name;` just assigns the parameter to itself and the field stays null (the compiler warns about it).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Static (shared) vs instance (per-object) members: what does this print?',
      example: { title: 'one static field for the whole class', code: 'class Visitor\n{\n    public static int Total;\n    public Visitor() { Total++; }\n}' },
      code: `var a1 = new Account("Asha");
var a2 = new Account("Ravi");
var a3 = new Account("Meena");
Console.WriteLine(a1.Id);
Console.WriteLine(a3.Id);
Console.WriteLine(Account.Count);
Console.WriteLine(Account.Bank);

class Account
{
    public static int Count;
    public static string Bank = "SBI";
    public int Id;
    public string Holder;

    public Account(string holder)
    {
        Count++;
        Id = Count;
        Holder = holder;
    }
}`,
      expected: `1
3
3
SBI`,
      explain: '`Count` is **static**: one copy shared by all accounts, so it reaches 3. `Id` is an **instance** field: each object stores its own copy of the counter value at creation time (1, 2, 3). Static members are accessed through the class name: `Account.Count`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Inside a `static` method, why is `Console.WriteLine(this.Name);` a compile error?',
      options: [
        'Because Console cannot be used in static methods',
        'Because a static method belongs to the class, not to an object, so there is no `this` (current object)',
        'Because Name must be private',
        'It is not an error',
      ],
      answer: 1,
      explain: 'A static method is called on the class (`Helper.Calc()`), so there is no current instance and `this` does not exist. A static method can use instance members only through an object reference passed to it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Method chaining by returning `this`: what does this print?',
      example: { title: 'return this', code: 'public Builder Add(int x)\n{\n    total += x;\n    return this;   // the same object, so calls can be chained\n}' },
      code: `var cart = new Cart();
cart.Add(250).Add(100).Discount(50).Add(20);
Console.WriteLine(cart.Total);

class Cart
{
    public int Total;

    public Cart Add(int price)
    {
        this.Total += price;
        return this;
    }

    public Cart Discount(int amount)
    {
        Total -= amount;
        return this;
    }
}`,
      expected: '320',
      explain: 'Each method returns `this` (the same Cart object), so the next call in the chain works on the same object: 250 + 100 - 50 + 20 = 320. This style is called a **fluent interface** (StringBuilder and LINQ use it).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `static` are TRUE? (choose all that apply)',
      options: [
        'A static class cannot be instantiated with new',
        'A static class can contain only static members',
        'Math.Max and Console.WriteLine are static methods',
        'Every object gets its own copy of a static field',
        'An instance method can read static fields',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Static classes (like `Math`, `Console`) only hold static members and cannot be created. A static field exists **once per class**, not per object. Instance methods can freely use static members; the reverse needs an object.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Static utility method: what does this print?',
      example: { title: 'calling a static method', code: 'static class Tax\n{\n    public static double Gst(double amt) => amt * 0.18;\n}\nConsole.WriteLine(Tax.Gst(100)); // 18' },
      code: `Console.WriteLine(Converter.ToFahrenheit(100));
Console.WriteLine(Converter.ToFahrenheit(37));
Console.WriteLine(Converter.Calls);

static class Converter
{
    public static int Calls;

    public static double ToFahrenheit(double c)
    {
        Calls++;
        return c * 9 / 5 + 32;
    }
}`,
      expected: `212
98.6
2`,
      explain: 'Static methods are called on the class name, no object needed. 100 °C = 212 °F (printed without .0), 37 °C = 98.6 °F. The static `Calls` field remembers the count across calls.',
    },
  ],
};
