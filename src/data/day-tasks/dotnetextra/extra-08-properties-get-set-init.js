export default {
  lesson: 'extra-08-properties-get-set-init',
  minutes: 20,
  intro: 'Write full properties with validation, read-only and init-only accessors.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Inside a property `set` accessor, which keyword holds the value being assigned?',
      options: ['`input`', '`value`', '`this`', '`newValue`'],
      answer: 1,
      explain: 'The implicit parameter of a setter is always named `value`. For `s.Age = 20;` the setter runs with `value == 20`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A property with validation. What does this program print?',
      example: { title: 'validating setter', code: `public int Qty
{
    get => _qty;
    set => _qty = value < 0 ? 0 : value;
}` },
      code: `var s = new Student();
s.Marks = 85;
Console.WriteLine(s.Marks);
s.Marks = 120;
Console.WriteLine(s.Marks);
s.Marks = -5;
Console.WriteLine(s.Marks);
Console.WriteLine(s.Grade);

class Student
{
    private int _marks;
    public int Marks
    {
        get => _marks;
        set
        {
            if (value > 100) _marks = 100;
            else if (value < 0) _marks = 0;
            else _marks = value;
        }
    }
    public string Grade => _marks >= 40 ? "Pass" : "Fail";
}`,
      expected: `85
100
0
Fail`,
      explain: '85 is valid. 120 is clamped to 100, −5 is clamped to 0. `Grade` is a computed read-only property: with 0 marks it returns "Fail". The setter is the single place that protects the field.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Make \`RollNo\` settable **only in an object initializer** (and never changed afterwards):
\`public int RollNo { get; ______; }\``,
      example: { title: 'init-only property', code: `public string Code { get; init; }
var c = new Course { Code = "CS101" };   // allowed
// c.Code = "X";                          // compile error` },
      accept: ['init'],
      caseSensitive: true,
      explain: 'An `init` accessor allows assignment in the constructor or object initializer only. After construction the property is read-only, which makes immutable objects easy. `private set` would still allow changes inside the class.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`public class Account { public decimal Balance { get; private set; } }` — which line compiles **outside** the class?',
      options: ['`acc.Balance = 500;`', '`var b = acc.Balance;`', '`acc.Balance += 100;`', '`new Account { Balance = 10 };`'],
      answer: 1,
      explain: 'The getter is public, so reading works. The setter is private, so any assignment from outside (including `+=` and object initializers) is a compile error. Only methods inside `Account` (e.g. `Deposit`) can change the balance.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Computed property. What does this print?',
      example: { title: 'expression-bodied getter', code: 'public int Area => Width * Height;' },
      code: `var p = new Product { Price = 250, Qty = 4 };
Console.WriteLine(p.Total);
p.Qty = 3;
Console.WriteLine(p.Total);
Console.WriteLine(p.Label);

class Product
{
    public int Price { get; set; }
    public int Qty { get; set; }
    public int Total => Price * Qty;
    public string Label => $"{Qty} x {Price} = {Total}";
}`,
      expected: `1000
750
3 x 250 = 750`,
      explain: '`Total` has no backing field; it is recalculated on every read: 250 × 4 = 1000, then 250 × 3 = 750. `Label` uses the other properties, so it also shows the current values.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which property declarations are **valid** C#? Select all that apply.',
      options: ['`public int A { get; }`', '`public int B { set; }` (auto-property)', '`public int C { get; init; }`', '`public int D { get; private set; }`', '`public int E { private get; private set; }`'],
      answers: [0, 2, 3],
      explain: 'Get-only, get/init and get/private set are all valid. An auto-property cannot have only a `set` accessor. You also cannot put access modifiers on **both** accessors; one must use the property\'s own accessibility.',
    },
  ],
};
