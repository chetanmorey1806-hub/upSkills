export default {
  id: 'extra-12-anonymous-types',
  title: 'Anonymous Types',
  module: 'Extra: OOP Concepts',
  extraNo: 12,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: `Anonymous types let you create a small, read-only object on the fly with "new { Name = ..., Age = ... }" without writing a class first. They are used everywhere in LINQ projections, grouping results and quick data shaping. In this lesson you learn how the compiler generates the hidden class, how equality, ToString() and "with" expressions work, and where anonymous types should NOT be used.`,
  objectives: [
    'Create anonymous types using new { } and projection initializers',
    'Explain what the compiler generates (read-only properties, Equals, GetHashCode, ToString)',
    'Use anonymous types in LINQ Select and GroupBy to shape data',
    'Copy an anonymous object with a with-expression (C# 10+)',
    'Know the limitations: method scope only, no methods, cannot be returned with a clear type',
  ],
  theory: [
    {
      heading: 'What is an anonymous type?',
      content: `An anonymous type is a class WITHOUT a name that the C# compiler creates for you. You write "new { ... }" with a list of property names and values, and the compiler generates a sealed class with read-only properties. Because the class has no name you can only store the object in a variable declared with "var".

Real-world analogy: a sticky note. When you just need to jot down "Name: Asha, Marks: 88" for a few minutes you do not print a full official form (a class) — you grab a sticky note. When the meeting (the method) ends, you throw it away.`,
      syntax: `var student = new { Name = "Asha", Age = 21, Marks = 88 };
Console.WriteLine(student.Name);   // Asha
// student.Name = "Ravi";          // CS0200: property is read-only`,
      points: [
        'The type is created at compile time, not at run time',
        'All properties are public and read-only (get only / init)',
        'You must use var (or object / dynamic) because the type has no name you can type',
        'Property types are inferred from the values (Age = 21 gives int)',
      ],
    },
    {
      heading: 'What the compiler generates for you',
      content: `For "new { Name = "Pen", Price = 10 }" the compiler emits something like an internal sealed class named <>f__AnonymousType0<TName, TPrice> with:
1. A constructor taking all values.
2. Read-only properties Name and Price.
3. An override of Equals() that compares every property value (value equality).
4. An override of GetHashCode() built from all property values.
5. An override of ToString() that prints "{ Name = Pen, Price = 10 }".

Two anonymous object creations in the SAME assembly that have the same property names, in the same order, with the same types, share the SAME generated class.`,
      points: [
        'Equals() compares values, but == still compares references (no operator overload)',
        'Property order matters: new { A = 1, B = 2 } and new { B = 2, A = 1 } are different types',
        'ToString() is very handy for quick debugging output',
      ],
    },
    {
      heading: 'Projection initializers (property name inference)',
      content: `If you use a variable or another property without writing "Name =", the compiler takes the property name from the expression. This is called a projection initializer and is used a lot in LINQ.`,
      syntax: `string city = "Pune";
int pin = 411001;
var address = new { city, pin };          // properties: city, pin
var emp = new { e.Name, e.Salary };       // properties: Name, Salary (copied from e)`,
      tip: `If two inferred names collide (for example new { a.Name, b.Name }) you get a compile error — give one of them an explicit name: new { a.Name, OtherName = b.Name }.`,
    },
    {
      heading: 'Anonymous types with LINQ',
      content: `The main reason anonymous types were added to C# 3.0 was LINQ. When you query a list you often want only SOME columns, or computed columns, and creating a new named class for every query would be boring. Select(e => new { e.Name, Tax = e.Salary / 10 }) gives you exactly the shape you need. GroupBy summaries like new { Dept = g.Key, Count = g.Count() } are another very common use. In EF Core, a Select into an anonymous type is translated into SQL that fetches only those columns.`,
      syntax: `var report = employees
    .Where(e => e.Salary > 30000)
    .Select(e => new { e.Name, Bonus = e.Salary / 10 });`,
    },
    {
      heading: 'Non-destructive mutation with "with" (C# 10+)',
      content: `Anonymous objects are immutable, but since C# 10 you can create a modified COPY using a with-expression, exactly like records. The original object stays unchanged.`,
      syntax: `var p1 = new { Name = "Pen", Price = 10 };
var p2 = p1 with { Price = 12 };   // { Name = Pen, Price = 12 }`,
    },
    {
      heading: 'Limitations and when to use something else',
      content: `Anonymous types are meant for local, short-lived data inside one method.
- You cannot write the type name, so you cannot use it as a method return type or parameter type (except as object or dynamic, which loses type safety).
- They cannot have methods, events or extra logic — only properties.
- They cannot implement interfaces.
- They are internal, so returning them to other assemblies and reading them requires reflection or dynamic.

If data must leave the method, use a tuple (string Name, int Marks), a record, or a normal class.`,
      points: [
        'Inside a method / LINQ query: anonymous type is perfect',
        'Returning from a method: use a tuple or a record',
        'Public API or serialization contract: use a named class / record / DTO',
        'Exception: ASP.NET Core happily serializes anonymous objects, e.g. return Ok(new { message = "Saved", id = 5 });',
      ],
    },
  ],
  examples: [
    {
      title: 'Creating and printing an anonymous object',
      scenario: 'Store a student quickly without creating a Student class, print it, and make a modified copy with a with-expression.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it AnonymousDemo, choose .NET 8 or .NET 10',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 to run without debugging',
      ],
      code: `using System;

var student = new { Name = "Asha", Age = 21, Marks = 88 };

Console.WriteLine(student.Name);
Console.WriteLine(student.Age);
Console.WriteLine(student);              // compiler-generated ToString()

var updated = student with { Marks = 95 };
Console.WriteLine(updated);
Console.WriteLine(student.Marks);        // original is unchanged

// student.Marks = 100;                  // CS0200: read-only property
Console.WriteLine(student.GetType().Name.StartsWith("<>f__AnonymousType"));`,
      csharp: {
        files: {
          'Program.cs': `using System;

var student = new { Name = "Asha", Age = 21, Marks = 88 };

Console.WriteLine(student.Name);
Console.WriteLine(student.Age);
Console.WriteLine(student);              // compiler-generated ToString()

var updated = student with { Marks = 95 };
Console.WriteLine(updated);
Console.WriteLine(student.Marks);        // original is unchanged

// student.Marks = 100;                  // CS0200: read-only property
Console.WriteLine(student.GetType().Name.StartsWith("<>f__AnonymousType"));`,
        },
        stdin: '',
      },
      result: `Asha
21
{ Name = Asha, Age = 21, Marks = 88 }
{ Name = Asha, Age = 21, Marks = 95 }
88
True`,
      explanation: `The compiler generated a hidden class with three read-only properties. ToString() prints all properties in the "{ Name = value, ... }" format. The with-expression created a NEW object, so student.Marks is still 88. The real type name starts with <>f__AnonymousType, which you can never type in your own code.`,
    },
    {
      title: 'Equality rules and projection initializers',
      scenario: 'Compare anonymous objects to understand value equality, reference equality and when two objects share the same generated type.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it AnonymousEquality',
        'Replace Program.cs with the code',
        'Put a breakpoint (F9) on the first Console.WriteLine and press F5; hover over a, b and c to see their types',
        'Press Ctrl+F5 to see the output',
      ],
      code: `using System;

var a = new { Id = 1, Name = "Pen" };
var b = new { Id = 1, Name = "Pen" };
var c = new { Name = "Pen", Id = 1 };   // same values, different ORDER

Console.WriteLine(a.Equals(b));                  // value comparison
Console.WriteLine(a == b);                       // reference comparison
Console.WriteLine(a.GetHashCode() == b.GetHashCode());
Console.WriteLine(a.GetType() == b.GetType());   // same generated class
Console.WriteLine(a.GetType() == c.GetType());   // different class
Console.WriteLine(a.Equals(c));

string city = "Pune";
int pin = 411001;
var address = new { city, pin };                 // projection initializer
Console.WriteLine(address);`,
      csharp: {
        files: {
          'Program.cs': `using System;

var a = new { Id = 1, Name = "Pen" };
var b = new { Id = 1, Name = "Pen" };
var c = new { Name = "Pen", Id = 1 };   // same values, different ORDER

Console.WriteLine(a.Equals(b));                  // value comparison
Console.WriteLine(a == b);                       // reference comparison
Console.WriteLine(a.GetHashCode() == b.GetHashCode());
Console.WriteLine(a.GetType() == b.GetType());   // same generated class
Console.WriteLine(a.GetType() == c.GetType());   // different class
Console.WriteLine(a.Equals(c));

string city = "Pune";
int pin = 411001;
var address = new { city, pin };                 // projection initializer
Console.WriteLine(address);`,
        },
        stdin: '',
      },
      result: `True
False
True
True
False
False
{ city = Pune, pin = 411001 }`,
      explanation: `Equals() is overridden to compare every property, so a.Equals(b) is True, and equal objects always have equal hash codes. The == operator is NOT overloaded, so it compares references: a and b are two different objects, so False. a and b share one generated type because names, order and types match. c lists the properties in a different order, so it is a different type and Equals returns False. In the last part the property names city and pin were inferred from the variable names.`,
    },
    {
      title: 'LINQ projection and grouping with anonymous types',
      scenario: 'An HR team wants a department summary: number of employees and total salary per department, highest total first.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it DepartmentSummary',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

var employees = new List<Employee>
{
    new("Ravi",  "IT",    50000),
    new("Meena", "HR",    40000),
    new("Kiran", "IT",    60000),
    new("Sara",  "HR",    45000),
    new("John",  "Sales", 30000),
};

// 1) Projection: only the columns we need + a computed column
var bonusList = employees.Select(e => new { e.Name, Bonus = e.Salary / 10 });
foreach (var b in bonusList.Take(2))
    Console.WriteLine($"{b.Name} gets bonus {b.Bonus}");

// 2) Grouping: one anonymous object per department
var summary = employees
    .GroupBy(e => e.Dept)
    .Select(g => new { Dept = g.Key, Count = g.Count(), Total = g.Sum(e => e.Salary) })
    .OrderByDescending(x => x.Total);

foreach (var s in summary)
    Console.WriteLine($"{s.Dept}: {s.Count} employee(s), total {s.Total}");

record Employee(string Name, string Dept, int Salary);`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

var employees = new List<Employee>
{
    new("Ravi",  "IT",    50000),
    new("Meena", "HR",    40000),
    new("Kiran", "IT",    60000),
    new("Sara",  "HR",    45000),
    new("John",  "Sales", 30000),
};

// 1) Projection: only the columns we need + a computed column
var bonusList = employees.Select(e => new { e.Name, Bonus = e.Salary / 10 });
foreach (var b in bonusList.Take(2))
    Console.WriteLine($"{b.Name} gets bonus {b.Bonus}");

// 2) Grouping: one anonymous object per department
var summary = employees
    .GroupBy(e => e.Dept)
    .Select(g => new { Dept = g.Key, Count = g.Count(), Total = g.Sum(e => e.Salary) })
    .OrderByDescending(x => x.Total);

foreach (var s in summary)
    Console.WriteLine($"{s.Dept}: {s.Count} employee(s), total {s.Total}");

record Employee(string Name, string Dept, int Salary);`,
        },
        stdin: '',
      },
      result: `Ravi gets bonus 5000
Meena gets bonus 4000
IT: 2 employee(s), total 110000
HR: 2 employee(s), total 85000
Sales: 1 employee(s), total 30000`,
      explanation: `Select creates an anonymous object with Name (inferred) and a computed Bonus. GroupBy builds groups IT (50000 + 60000 = 110000), HR (40000 + 45000 = 85000) and Sales (30000). Each group is projected into { Dept, Count, Total } and sorted by Total descending. No extra DTO class was needed because the data never leaves this method.`,
    },
    {
      title: 'Returning data: anonymous type vs tuple vs record',
      scenario: 'You need a "top student" result OUTSIDE the method. Anonymous types cannot be returned with a real type, so compare the alternatives.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ReturnShapes',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Linq;

var marks = new[] { ("Asha", 88), ("Ravi", 45), ("Meena", 95) };

// Works, but the caller only sees "object"
object anon = GetTopAsObject(marks);
Console.WriteLine(anon);

// Better: a named tuple
var (name, score) = GetTopAsTuple(marks);
Console.WriteLine($"Tuple -> {name}: {score}");

// Best for public APIs: a record
TopStudent top = GetTopAsRecord(marks);
Console.WriteLine($"Record -> {top}");

static object GetTopAsObject((string Name, int Marks)[] list)
{
    var best = list.OrderByDescending(x => x.Marks).First();
    return new { best.Name, best.Marks };
}

static (string Name, int Marks) GetTopAsTuple((string Name, int Marks)[] list)
    => list.OrderByDescending(x => x.Marks).First();

static TopStudent GetTopAsRecord((string Name, int Marks)[] list)
{
    var best = list.OrderByDescending(x => x.Marks).First();
    return new TopStudent(best.Name, best.Marks);
}

record TopStudent(string Name, int Marks);`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Linq;

var marks = new[] { ("Asha", 88), ("Ravi", 45), ("Meena", 95) };

// Works, but the caller only sees "object"
object anon = GetTopAsObject(marks);
Console.WriteLine(anon);

// Better: a named tuple
var (name, score) = GetTopAsTuple(marks);
Console.WriteLine($"Tuple -> {name}: {score}");

// Best for public APIs: a record
TopStudent top = GetTopAsRecord(marks);
Console.WriteLine($"Record -> {top}");

static object GetTopAsObject((string Name, int Marks)[] list)
{
    var best = list.OrderByDescending(x => x.Marks).First();
    return new { best.Name, best.Marks };
}

static (string Name, int Marks) GetTopAsTuple((string Name, int Marks)[] list)
    => list.OrderByDescending(x => x.Marks).First();

static TopStudent GetTopAsRecord((string Name, int Marks)[] list)
{
    var best = list.OrderByDescending(x => x.Marks).First();
    return new TopStudent(best.Name, best.Marks);
}

record TopStudent(string Name, int Marks);`,
        },
        stdin: '',
      },
      result: `{ Name = Meena, Marks = 95 }
Tuple -> Meena: 95
Record -> TopStudent { Name = Meena, Marks = 95 }`,
      explanation: `The anonymous object could only be returned as object, so the caller cannot write anon.Name without casting tricks or dynamic. The tuple keeps names and types, and the record gives a real reusable type with its own ToString(). Rule: anonymous types for local shaping, tuples for small private results, records/classes for anything public.`,
    },
  ],
  interview: [
    { q: 'What is an anonymous type in C#?', a: 'A compiler-generated, unnamed, sealed class with public read-only properties, created with new { Prop = value }. It is mainly used to hold temporary data inside a method, especially in LINQ projections.', level: 'Easy' },
    { q: 'Why must you use var with anonymous types?', a: 'Because the generated class has no name you can write in source code (its real name is something like <>f__AnonymousType0`2). var lets the compiler infer it. You could also use object or dynamic but then you lose compile-time property access.', level: 'Easy' },
    { q: 'Are anonymous type properties mutable?', a: 'No. They are read-only. Assigning student.Name = "X" gives error CS0200. From C# 10 you can create a modified copy with a with-expression.', level: 'Easy' },
    { q: 'Output? var a = new { X = 1 }; var b = new { X = 1 }; Console.WriteLine(a.Equals(b)); Console.WriteLine(a == b);', a: 'True then False. Equals is overridden for value equality; == is not overloaded so it compares references and the two objects are different instances.', level: 'Medium' },
    { q: 'When do two anonymous objects share the same type?', a: 'When they are in the same assembly and have the same property names, in the same order, with the same property types. new { A = 1, B = "x" } and new { B = "x", A = 1 } are different types.', level: 'Medium' },
    { q: 'What is a projection initializer?', a: 'Writing new { e.Name, city } without explicit names. The compiler infers property names from the member or variable names (Name and city).', level: 'Medium' },
    { q: 'Can an anonymous type have methods or implement an interface?', a: 'No. Only read-only properties (plus the generated Equals, GetHashCode and ToString). For behaviour you need a class, struct or record.', level: 'Easy' },
    { q: 'Can you return an anonymous type from a method?', a: 'Only as object or dynamic, which loses static typing. The recommended approach is to return a tuple, a record or a DTO class instead.', level: 'Medium' },
    { q: 'Output? var p = new { Name = "Pen", Price = 10 }; Console.WriteLine(p);', a: '{ Name = Pen, Price = 10 }', level: 'Easy' },
    { q: 'Anonymous types vs tuples – differences?', a: 'Anonymous types are reference types (classes), read-only, have property names stored in metadata, and cannot be used as return types. ValueTuples are structs, mutable fields, names exist only at compile time, and they can be used as return and parameter types and deconstructed.', level: 'Hard' },
    { q: 'How are anonymous types used in EF Core?', a: 'context.Students.Select(s => new { s.Name, s.Email }) makes EF Core generate SELECT Name, Email only, reducing data transfer. The result is materialized into anonymous objects.', level: 'Medium' },
    { q: 'How does ASP.NET Core return anonymous objects in APIs?', a: 'return Ok(new { message = "Created", id = 7 }); System.Text.Json serializes the public properties, producing {"message":"Created","id":7}. Fine for quick responses, but DTOs are better for documented contracts (Swagger).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an anonymous product with Name, Price and Stock. Print it, then create a copy with Stock reduced by 1 and print both.',
      hint: 'Use var p = new { ... } and p with { Stock = p.Stock - 1 }.',
      solution: `var p = new { Name = "Mouse", Price = 500, Stock = 10 };
var sold = p with { Stock = p.Stock - 1 };
Console.WriteLine(p);     // { Name = Mouse, Price = 500, Stock = 10 }
Console.WriteLine(sold);  // { Name = Mouse, Price = 500, Stock = 9 }`,
    },
    {
      task: 'Given an int array of marks, use LINQ to produce anonymous objects { Marks, Result } where Result is "Pass" (>= 40) or "Fail" and print them.',
      hint: 'Select(m => new { Marks = m, Result = m >= 40 ? "Pass" : "Fail" })',
      solution: `int[] marks = { 35, 78, 40 };
foreach (var r in marks.Select(m => new { Marks = m, Result = m >= 40 ? "Pass" : "Fail" }))
    Console.WriteLine(r);
// { Marks = 35, Result = Fail }
// { Marks = 78, Result = Pass }
// { Marks = 40, Result = Pass }`,
    },
    {
      task: 'Group a list of words by their length and print { Length, Words } with the words joined by commas.',
      hint: 'GroupBy(w => w.Length).Select(g => new { Length = g.Key, Words = string.Join(",", g) })',
      solution: `var words = new[] { "cat", "dog", "lion", "bear", "ox" };
var groups = words.GroupBy(w => w.Length)
                  .Select(g => new { Length = g.Key, Words = string.Join(",", g) });
foreach (var g in groups) Console.WriteLine(g);
// { Length = 3, Words = cat,dog }
// { Length = 4, Words = lion,bear }
// { Length = 2, Words = ox }`,
    },
    {
      task: 'Prove that property order changes the anonymous type: create two objects with the same properties in different order and print whether their types are equal.',
      hint: 'Compare x.GetType() == y.GetType().',
      solution: `var x = new { A = 1, B = 2 };
var y = new { B = 2, A = 1 };
Console.WriteLine(x.GetType() == y.GetType()); // False`,
    },
    {
      task: 'Rewrite a method that returns an anonymous object as object so that it returns a named tuple instead, and use deconstruction at the call site.',
      hint: 'static (string Name, int Age) GetUser() => ("Asha", 21);',
      solution: `static (string Name, int Age) GetUser() => ("Asha", 21);
var (name, age) = GetUser();
Console.WriteLine($"{name} is {age}"); // Asha is 21`,
    },
  ],
  quiz: [
    {
      question: 'Which keyword must normally be used to declare a variable holding an anonymous type with full property access?',
      options: ['dynamic', 'var', 'object', 'anon'],
      answer: 1,
      explanation: 'var lets the compiler infer the unnamed type so you get IntelliSense and compile-time checking.',
    },
    {
      question: 'What does Console.WriteLine(new { A = 1 } == new { A = 1 }); print?',
      options: ['True', 'Compile error', 'False', 'Runtime exception'],
      answer: 2,
      explanation: '== is not overloaded for anonymous types, so it compares references of two different objects: False.',
    },
    {
      question: 'Which of these is TRUE about anonymous type properties?',
      options: ['They are read-only', 'They are public fields', 'They can be changed with a setter', 'They are private'],
      answer: 0,
      explanation: 'The compiler generates public read-only properties. Use with to make a modified copy.',
    },
    {
      question: 'new { A = 1, B = 2 } and new { B = 2, A = 1 } are...',
      options: ['the same type', 'not allowed', 'equal with ==', 'different types'],
      answer: 3,
      explanation: 'Property order is part of the anonymous type identity, so they are different generated classes.',
    },
    {
      question: 'What is the best choice to return a small two-value result from a private method?',
      options: ['An anonymous type returned as object', 'A named tuple like (string Name, int Marks)', 'dynamic', 'A static field'],
      answer: 1,
      explanation: 'Named tuples keep names and types and can be deconstructed; anonymous types cannot be used as return types.',
    },
  ],
};
