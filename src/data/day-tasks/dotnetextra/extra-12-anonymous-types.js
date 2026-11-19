export default {
  lesson: 'extra-12-anonymous-types',
  minutes: 20,
  intro: 'Create anonymous types with `new { }`, use them in LINQ projections and know their limits.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Create an anonymous object with \`Name = "Asha"\` and \`Marks = 91\`:
\`var s = ______;\``,
      example: { title: 'anonymous object', code: 'var city = new { Name = "Pune", Pin = 411001 };' },
      accept: ['new { Name = "Asha", Marks = 91 }', 'new { Name = "Asha", Marks = 91 };'],
      acceptRegex: ['^new\\s*\\{\\s*Name\\s*=\\s*"Asha"\\s*,\\s*Marks\\s*=\\s*91\\s*\\}\\s*;?$', '^new\\s*\\{\\s*Marks\\s*=\\s*91\\s*,\\s*Name\\s*=\\s*"Asha"\\s*\\}\\s*;?$'],
      caseSensitive: true,
      explain: '`new { Prop = value, ... }` with no type name creates an anonymous type. It must be stored in a `var` because the compiler-generated type has no name you can write.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'ToString of an anonymous object', code: `var p = new { X = 1, Y = 2 };
Console.WriteLine(p);   // { X = 1, Y = 2 }` },
      code: `var a = new { Name = "Ravi", Age = 21 };
var b = new { Name = "Ravi", Age = 21 };
Console.WriteLine(a);
Console.WriteLine(a.Equals(b));
Console.WriteLine(a.GetType() == b.GetType());
Console.WriteLine(a.Name.Length + a.Age);`,
      expected: `{ Name = Ravi, Age = 21 }
True
True
25`,
      explain: 'Anonymous types override `ToString()` as `{ Name = Ravi, Age = 21 }` and `Equals()` to compare **property values**, so `a.Equals(b)` is True. Same property names, types and order reuse the same compiler-generated type. "Ravi".Length (4) + 21 = 25.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about anonymous types are TRUE? Select all that apply.',
      options: ['Their properties are read-only', 'They can contain methods', 'They are reference types (classes)', 'They can be returned from a public method as their own type name', 'They are mostly used for LINQ projections (`select new { ... }`)'],
      answers: [0, 2, 4],
      explain: 'Anonymous types are immutable classes with only read-only properties and no methods. Because the type has no name, you cannot declare it as a return type (you would have to use `object` or `dynamic`). For data you return or pass around, use a record or a class.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Projection inference. What does this print?',
      example: { title: 'property names inferred from variables', code: `string city = "Delhi"; int pin = 110001;
var x = new { city, pin };   // properties: city, pin` },
      code: `var products = new[]
{
    new { Name = "Pen", Price = 20 },
    new { Name = "Bag", Price = 650 },
    new { Name = "Book", Price = 180 },
};
var costly = products.Where(p => p.Price > 100)
                     .Select(p => new { p.Name, WithTax = p.Price + p.Price / 10 });
foreach (var c in costly) Console.WriteLine(c);`,
      expected: `{ Name = Bag, WithTax = 715 }
{ Name = Book, WithTax = 198 }`,
      explain: 'Only Bag (650) and Book (180) cost more than 100. `p.Name` creates a property named `Name` automatically (projection initializer). 650 + 65 = 715 and 180 + 18 = 198. Each item prints with the anonymous type\'s `ToString()`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`var s = new { Name = "Asha" }; s.Name = "Meera";` What happens?',
      options: ['Name becomes "Meera"', 'Compile error: the property is read-only', 'Runtime exception', 'A new property is added'],
      answer: 1,
      explain: 'Anonymous type properties only have getters. To "change" a value create a new object (`s = new { Name = "Meera" };`), or use the `with` expression: `s with { Name = "Meera" }` (C# 10+).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You need to send a summary object from a repository method to a controller. What is the best choice?',
      options: ['Return an anonymous type as `object`', 'Define a small `record` (e.g. `record SalesSummary(string Region, decimal Total)`) and return it', 'Return `dynamic` everywhere', 'Return a `Tuple<object, object>`'],
      answer: 1,
      explain: 'Anonymous types are great inside one method. Once data crosses method boundaries you lose type safety with `object`/`dynamic`. A named record keeps names, compile-time checks and IntelliSense.',
    },
  ],
};
