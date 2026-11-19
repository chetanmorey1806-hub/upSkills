export default {
  lesson: 'day-023-polymorphism-method-overloading',
  minutes: 16,
  intro: 'Practise compile-time polymorphism: overloaded methods in a class, how the compiler chooses an overload, and operator overloading.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is method overloading called **compile-time** polymorphism?',
      options: [
        'Because the method runs while compiling',
        'Because the compiler decides which overload to call from the argument types, before the program runs',
        'Because it needs the virtual keyword',
        'Because it only works with static methods',
      ],
      answer: 1,
      explain: 'The C# compiler performs **overload resolution**: it looks at the number and types of arguments and binds the call to one method in the IL. Nothing is decided at runtime (unlike overriding).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'One `Pay` method name for different payment modes. What does this print?',
      example: { title: 'overloads in a class', code: 'class Printer\n{\n    public void Print(int n) => Console.WriteLine("Number " + n);\n    public void Print(string s) => Console.WriteLine("Text " + s);\n}' },
      code: `var counter = new PaymentCounter();
counter.Pay(500);
counter.Pay("ravi@upi", 1200);
counter.Pay("4111-1111", 2500, 3);

class PaymentCounter
{
    public void Pay(int cash)
        => Console.WriteLine($"Cash: {cash}");

    public void Pay(string upiId, int amount)
        => Console.WriteLine($"UPI {upiId}: {amount}");

    public void Pay(string card, int amount, int emiMonths)
        => Console.WriteLine($"Card EMI: {amount / emiMonths} x {emiMonths}");
}`,
      expected: `Cash: 500
UPI ravi@upi: 1200
Card EMI: 833 x 3`,
      explain: 'The number of arguments selects the overload. In the 3-argument version `2500 / 3` is **integer division** → 833.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Which overload wins? (implicit conversions) What does this print?',
      example: { title: 'best match', code: 'void F(long x) …\nvoid F(double x) …\nF(5);  // int → long is a better conversion than int → double, so F(long)' },
      code: `var c = new Calc();
c.Add(2, 3);
c.Add(2.5, 1);
c.Add(2, 3, 4);
c.Add("2", "3");

class Calc
{
    public void Add(int a, int b) => Console.WriteLine("int: " + (a + b));
    public void Add(double a, double b) => Console.WriteLine("double: " + (a + b));
    public void Add(int a, int b, int c) => Console.WriteLine("3 ints: " + (a + b + c));
    public void Add(string a, string b) => Console.WriteLine("string: " + (a + b));
}`,
      expected: `int: 5
double: 3.5
3 ints: 9
string: 23`,
      explain: '`Add(2.5, 1)` has a double, so only the (double, double) overload fits (1 is converted to 1.0). For strings `+` means **concatenation**, so "2" + "3" = "23".',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the operator overload header so two `Distance` objects can be added with `d1 + d2`:\n`public ______ Distance operator +(Distance a, Distance b)`\n(write the missing keyword)',
      example: { title: 'operator overloading', code: 'public static Money operator -(Money a, Money b)\n    => new Money(a.Amount - b.Amount);' },
      accept: ['static'],
      caseSensitive: true,
      explain: 'Operator overloads must be `public static` and at least one parameter must be the containing type. They are another form of compile-time polymorphism: `+` behaves differently for int, string and Distance.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Operator overloading in action: what does this print?',
      example: { title: 'using an overloaded operator', code: 'var total = price1 + price2;   // calls operator +' },
      code: `var d1 = new Distance(5, 80);
var d2 = new Distance(3, 50);
var d3 = d1 + d2;
Console.WriteLine($"{d3.Km} km {d3.M} m");

class Distance
{
    public int Km, M;
    public Distance(int km, int m) { Km = km; M = m; }

    public static Distance operator +(Distance a, Distance b)
    {
        int totalM = (a.Km + b.Km) * 1000 + a.M + b.M;
        return new Distance(totalM / 1000, totalM % 1000);
    }
}`,
      expected: '8 km 130 m',
      explain: '(5 + 3) × 1000 + 80 + 50 = 8130 metres. `/ 1000` gives 8 km and `% 1000` gives 130 m. The `+` operator now "knows" how to add Distance objects.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which pairs are valid overloads of `void Book(string name, int seats)` in the same class? (choose all that apply)',
      options: ['void Book(int seats, string name)', 'int Book(string name, int seats)', 'void Book(string name)', 'void Book(string passenger, int count)', 'void Book(string name, int seats, bool ac)'],
      answers: [0, 2, 4],
      explain: 'A different **order of types**, a different **number** of parameters, or different types make valid overloads. Changing only the return type (option 2) or only the parameter names (option 4) gives a duplicate-member compile error.',
    },
  ],
};
