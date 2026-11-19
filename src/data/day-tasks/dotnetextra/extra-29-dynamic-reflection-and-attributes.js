export default {
  lesson: 'extra-29-dynamic-reflection-and-attributes',
  minutes: 25,
  intro: 'Inspect types at runtime with reflection, create and read custom attributes, and know when `dynamic` is resolved.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'When are member calls on a `dynamic` variable checked?',
      options: ['At compile time, like `var`', 'At runtime; a missing member throws `RuntimeBinderException`', 'Never; they are ignored', 'Only in Debug builds'],
      answer: 1,
      explain: '`var` is statically typed (the compiler infers the type). `dynamic` skips compile-time checks and binds members at runtime, so typos compile fine and fail only when the line runs.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'dynamic changes type at runtime', code: `dynamic d = 10;
d = "ten";   // allowed` },
      code: `dynamic d = 7;
Console.WriteLine(d.GetType().Name);
d = d + 2.5;
Console.WriteLine(d);
Console.WriteLine(d.GetType().Name);
d = "Pune";
Console.WriteLine(d.Length);
Console.WriteLine(d.ToUpper());`,
      expected: `Int32
9.5
Double
4
PUNE`,
      explain: 'The runtime type decides everything: 7 is `Int32`; 7 + 2.5 is a `Double` 9.5. After assigning a string, `.Length` and `.ToUpper()` are bound at runtime to string members.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Declare a custom attribute class \`AuditAttribute\` (header only):
\`public class AuditAttribute : ______\``,
      example: { title: 'restricting where it can be used', code: `[AttributeUsage(AttributeTargets.Method)]
public class LogAttribute : Attribute { }` },
      accept: ['Attribute', 'System.Attribute'],
      caseSensitive: true,
      explain: 'Every custom attribute derives from `System.Attribute`. By convention its name ends with "Attribute", but you can apply it without the suffix: `[Audit]`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Reading attributes with reflection. What does this print?',
      example: { title: 'GetCustomAttribute', code: 'var a = typeof(Order).GetCustomAttribute<TableAttribute>();' },
      code: `using System.Reflection;

foreach (var t in new[] { typeof(Student), typeof(Course) })
{
    var a = t.GetCustomAttribute<TableAttribute>();
    Console.WriteLine(a == null ? $"{t.Name}: no table" : $"{t.Name} -> {a.Name}");
}
Console.WriteLine(typeof(Student).GetProperty("Marks")!.PropertyType.Name);
Console.WriteLine(typeof(Course).IsClass);

[AttributeUsage(AttributeTargets.Class)]
class TableAttribute : Attribute
{
    public string Name { get; }
    public TableAttribute(string name) { Name = name; }
}

[Table("tbl_students")]
class Student { public int Marks { get; set; } }
class Course { }`,
      expected: `Student -> tbl_students
Course: no table
Int32
True`,
      explain: '`[Table("tbl_students")]` stores metadata on the class; `GetCustomAttribute<T>()` reads it back (null when missing). Reflection also reveals member details like the property type `Int32`. This is how EF Core and ASP.NET read `[Table]`, `[Required]`, `[HttpGet]`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which tasks use **reflection**? Select all that apply.',
      options: ['`typeof(Order).GetProperties()`', '`Activator.CreateInstance(type)`', '`method.Invoke(obj, args)`', '`list.Add(5)`', '`Assembly.GetExecutingAssembly().GetTypes()`'],
      answers: [0, 1, 2, 4],
      explain: 'Reading members, creating objects from a `Type`, invoking a `MethodInfo` and listing an assembly\'s types are reflection APIs (namespace `System.Reflection`). `list.Add(5)` is a normal compiled call.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the main downside of heavy reflection in a hot path (e.g. per request)?',
      options: ['It cannot read private members', 'It is much slower than direct calls and loses compile-time safety', 'It only works in .NET Framework', 'It changes the class permanently'],
      answer: 1,
      explain: 'Reflection looks members up by name at runtime: slower and errors appear only at runtime. Cache `PropertyInfo`/`MethodInfo` objects or use source generators/compiled expressions when performance matters.',
    },
  ],
};
