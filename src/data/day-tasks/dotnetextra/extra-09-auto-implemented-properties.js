export default {
  lesson: 'extra-09-auto-implemented-properties',
  minutes: 20,
  intro: 'Use auto-implemented properties with initializers, default values and restricted setters.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'For `public string Name { get; set; }`, what does the compiler generate?',
      options: ['Nothing; the property cannot store data', 'A hidden private backing field plus get/set accessors', 'A public field named Name', 'A static field shared by all objects'],
      answer: 1,
      explain: 'An auto-property is shorthand: the compiler creates a hidden private field and the accessors that read and write it. You write less code but keep the flexibility of a property (you can add logic later without breaking callers).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Default values of auto-properties. What does this print?',
      example: { title: 'defaults', code: `int → 0, bool → False, string → null (prints empty), decimal → 0` },
      code: `var e = new Employee();
Console.WriteLine(e.Id);
Console.WriteLine(e.IsActive);
Console.WriteLine(e.City);
Console.WriteLine(e.Name == null);

class Employee
{
    public int Id { get; set; }
    public bool IsActive { get; set; }
    public string City { get; set; } = "Pune";
    public string? Name { get; set; }
}`,
      expected: `0
False
Pune
True`,
      explain: 'Without an initializer, value types get their default (`0`, `false`) and reference types are `null`. `City` has the initializer `= "Pune"`. Note that C# prints `bool` as **False** with a capital F.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Give the auto-property a default value of 18 (% GST):
\`public int GstPercent { get; set; } ______\``,
      example: { title: 'property initializer', code: 'public string Country { get; set; } = "India";' },
      accept: ['= 18;', '=18;'],
      acceptRegex: ['^=\\s*18\\s*;$'],
      caseSensitive: true,
      explain: 'A property initializer goes **after** the closing brace and needs a semicolon: `{ get; set; } = 18;`. Forgetting the `;` is the most common compile error here.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Object initializer vs initializer values. What does this print?',
      example: { title: 'object initializer overrides', code: 'var c = new Config { Retries = 5 };  // replaces the default' },
      code: `var a = new Order();
var b = new Order { Status = "Shipped", Qty = 2 };
Console.WriteLine($"{a.Status} {a.Qty}");
Console.WriteLine($"{b.Status} {b.Qty}");
b.Qty++;
Console.WriteLine(b.Qty);

class Order
{
    public string Status { get; set; } = "New";
    public int Qty { get; set; } = 1;
}`,
      expected: `New 1
Shipped 2
3`,
      explain: 'Property initializers run first when the object is created; the object initializer then overwrites the chosen properties. `a` keeps the defaults, `b` gets "Shipped" and 2, and `b.Qty++` makes it 3.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Create a get-only auto-property \`CreatedOn\` of type \`DateTime\` that is set to the current time when the object is created:
\`public DateTime CreatedOn ______\``,
      example: { title: 'get-only with initializer', code: 'public Guid Id { get; } = Guid.NewGuid();' },
      accept: ['{ get; } = DateTime.Now;', '{ get; } = DateTime.UtcNow;'],
      acceptRegex: ['^\\{\\s*get\\s*;\\s*\\}\\s*=\\s*DateTime\\.(Utc)?Now\\s*;$'],
      caseSensitive: true,
      explain: '`{ get; } = DateTime.Now;` declares a read-only auto-property whose value is fixed at construction. It can still be assigned in a constructor, but not from outside or later.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'When must you switch from an auto-property to a **full property with a backing field**?',
      options: ['When the property is public', 'When you need logic in the getter/setter, like validation or raising a change event', 'When the type is string', 'Never; auto-properties support validation with attributes only'],
      answer: 1,
      explain: 'Auto-properties have no place for code. To validate (`if (value < 0) throw ...`) or notify (`OnPropertyChanged`) you write a full property with your own private field. (C# 13/14 adds the `field` keyword, but the idea is the same.)',
    },
  ],
};
