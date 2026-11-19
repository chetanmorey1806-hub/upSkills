export default {
  lesson: 'extra-25-records-and-structs',
  minutes: 25,
  intro: 'Compare classes, records and structs: value equality, immutability, `with` expressions and copy semantics.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Declare a positional record \`Student\` with \`string Name\` and \`int Marks\` (one line):
\`public ______;\``,
      example: { title: 'positional record', code: 'public record City(string Name, int Pin);' },
      accept: ['record Student(string Name, int Marks)', 'record class Student(string Name, int Marks)'],
      acceptRegex: ['^record\\s+(class\\s+)?Student\\s*\\(\\s*string\\s+Name\\s*,\\s*int\\s+Marks\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: 'A positional record generates init-only properties, a constructor, `Deconstruct`, value-based `Equals` and a readable `ToString` from that single line.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Class vs record equality. What does this print?',
      example: { title: 'record ToString', code: `var c = new City("Pune", 411001);
Console.WriteLine(c);   // City { Name = Pune, Pin = 411001 }` },
      code: `var r1 = new StudentRec("Asha", 90);
var r2 = new StudentRec("Asha", 90);
var c1 = new StudentCls("Asha", 90);
var c2 = new StudentCls("Asha", 90);
Console.WriteLine(r1 == r2);
Console.WriteLine(c1 == c2);
Console.WriteLine(r1);

record StudentRec(string Name, int Marks);
class StudentCls
{
    public string Name; public int Marks;
    public StudentCls(string n, int m) { Name = n; Marks = m; }
}`,
      expected: `True
False
StudentRec { Name = Asha, Marks = 90 }`,
      explain: 'Records compare by **value**: same Name and Marks → equal. Classes compare by **reference**: two `new` objects are different even with the same data. Records also get a generated `ToString()` in the form `Type { Prop = value, ... }`.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`with` expressions create modified copies. What does this print?',
      example: { title: 'non-destructive mutation', code: 'var updated = order with { Status = "Shipped" };' },
      code: `var p1 = new Product("Mouse", 499);
var p2 = p1 with { Price = 449 };
Console.WriteLine(p1.Price);
Console.WriteLine(p2.Price);
Console.WriteLine(p1 == p2);
Console.WriteLine(p1 == (p2 with { Price = 499 }));

record Product(string Name, int Price);`,
      expected: `499
449
False
True`,
      explain: '`with` copies the record and changes only the listed properties; the original `p1` keeps 499. `p1` and `p2` differ in Price, so they are not equal. Copying `p2` back to 499 gives the same values as `p1`, so they are equal.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Struct (value type) vs class (reference type) copying. What does this print?',
      example: { title: 'struct assignment copies', code: `Point a = new Point(1, 2);
Point b = a;   // b is a separate copy` },
      code: `var s1 = new PointS { X = 1 };
var s2 = s1;
s2.X = 99;

var c1 = new PointC { X = 1 };
var c2 = c1;
c2.X = 99;

Console.WriteLine(s1.X);
Console.WriteLine(c1.X);

struct PointS { public int X; }
class PointC { public int X; }`,
      expected: `1
99`,
      explain: 'Assigning a **struct** copies the whole value, so changing `s2` does not affect `s1`. Assigning a **class** variable copies the reference, so `c1` and `c2` point to the same object and both see 99.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['`record` is a reference type by default (record class)', '`record struct` is a value type with value equality', 'Structs support inheritance from other structs', 'Small immutable data like a `Money` amount is a good fit for a `readonly struct` or record', 'Records cannot have methods'],
      answers: [0, 1, 3],
      explain: '`record` = `record class` (reference type), `record struct` = value type; both get value equality. Structs cannot inherit from other structs (only implement interfaces). Records are normal types and can contain methods.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which is the best fit for an API **DTO** that is created once and then only read?',
      options: ['A mutable class with public fields', 'A `record` (immutable, value equality, concise)', 'A large mutable struct', 'An anonymous type'],
      answer: 1,
      explain: 'DTOs are plain data that should not change after creation. A record gives init-only properties, value equality and a short declaration. Large structs are copied on every assignment, and anonymous types cannot be returned with a name.',
    },
  ],
};
