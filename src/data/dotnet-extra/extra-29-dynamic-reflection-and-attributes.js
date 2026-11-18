const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `using System.Dynamic;
using Microsoft.CSharp.RuntimeBinder;

// dynamic: type checking moves from compile time to run time
dynamic x = 10;
Console.WriteLine(x + 5);
Console.WriteLine(x.GetType().Name);

x = "Hello";                      // the same variable can now hold a string
Console.WriteLine(x.ToUpper());
Console.WriteLine(x.Length);
Console.WriteLine(x.GetType().Name);

try
{
    x.Fly();                       // compiles fine, fails at run time
}
catch (RuntimeBinderException ex)
{
    Console.WriteLine($"Runtime error: {ex.Message}");
}

// var is decided at compile time and can never change type
var y = 10;
// y = "Hello";                    // compile error CS0029 - uncomment to see it

// ExpandoObject: add members at run time (like a JavaScript object)
dynamic person = new ExpandoObject();
person.Name = "Asha";
person.Age = 22;
person.Greet = (Func<string>)(() => $"Hi, I am {person.Name}");
Console.WriteLine($"{person.Name} is {person.Age}");
Console.WriteLine(person.Greet());

var bag = (IDictionary<string, object?>)person;
Console.WriteLine(string.Join(", ", bag.Keys));
Console.WriteLine(y);
`;
const ex2 = `using System.Reflection;

// Reflection: read type information (metadata) and use it at run time
Type t = typeof(Student);
Console.WriteLine($"Class: {t.Name}, Namespace: {t.Namespace ?? "(global)"}");

foreach (PropertyInfo p in t.GetProperties().OrderBy(p => p.Name))
    Console.WriteLine($"Property: {p.Name} ({p.PropertyType.Name})");

foreach (MethodInfo m in t.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                          .Where(m => !m.IsSpecialName))
    Console.WriteLine($"Method: {m.Name} returns {m.ReturnType.Name}");

// Create an object and set properties by NAME (strings) - how model binders and ORMs work
object obj = Activator.CreateInstance(t)!;
t.GetProperty("Name")!.SetValue(obj, "Ravi");
t.GetProperty("Marks")!.SetValue(obj, 72);
object? grade = t.GetMethod("Grade")!.Invoke(obj, null);
Console.WriteLine($"{t.GetProperty("Name")!.GetValue(obj)} -> {grade}");

// Private members can be found with BindingFlags.NonPublic
MethodInfo? secret = t.GetMethod("Secret", BindingFlags.NonPublic | BindingFlags.Instance);
Console.WriteLine($"Private method found: {secret != null}");
Console.WriteLine(secret!.Invoke(obj, null));

class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public string Grade() => Marks >= 60 ? "Pass" : "Fail";
    private string Secret() => "hidden value";
}
`;
const ex3 = `using System.Reflection;

// Custom attributes = metadata tags; reflection reads them to build a mini validator
var products = new[]
{
    new Product { Name = "", Price = 5000, Stock = 10 },
    new Product { Name = "Pen", Price = 10, Stock = 50 },
    new Product { Name = "Bag", Price = 0, Stock = 150 },
};

var info = typeof(Product).GetCustomAttribute<InfoAttribute>();
Console.WriteLine($"Entity: {info?.Text}");

for (int i = 0; i < products.Length; i++)
{
    var errors = Validator.Validate(products[i]);
    Console.WriteLine(errors.Count == 0
        ? $"Product {i + 1}: valid"
        : $"Product {i + 1}: {string.Join("; ", errors)}");
}

[AttributeUsage(AttributeTargets.Property)]
class NotEmptyAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
class BetweenAttribute : Attribute
{
    public int Min { get; }
    public int Max { get; }
    public BetweenAttribute(int min, int max) { Min = min; Max = max; }
}

[AttributeUsage(AttributeTargets.Class)]
class InfoAttribute : Attribute
{
    public string Text { get; }
    public InfoAttribute(string text) => Text = text;
}

[Info("Product master table")]
class Product
{
    [NotEmpty] public string Name { get; set; } = "";
    [Between(1, 1000)] public int Price { get; set; }
    [Between(0, 100)] public int Stock { get; set; }
}

static class Validator
{
    public static List<string> Validate(object model)
    {
        var errors = new List<string>();
        foreach (var prop in model.GetType().GetProperties().OrderBy(p => p.Name))
        {
            object? value = prop.GetValue(model);
            if (prop.GetCustomAttribute<NotEmptyAttribute>() != null && string.IsNullOrWhiteSpace(value as string))
                errors.Add($"{prop.Name} is required");

            var range = prop.GetCustomAttribute<BetweenAttribute>();
            if (range != null && value is int n && (n < range.Min || n > range.Max))
                errors.Add($"{prop.Name} must be between {range.Min} and {range.Max}");
        }
        return errors;
    }
}
`;
const ex4 = `using System.Reflection;

// Plugin-style discovery: find every class that implements an interface and run it
var types = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => typeof(IReport).IsAssignableFrom(t) && t.IsClass && !t.IsAbstract)
    .OrderBy(t => t.Name);

foreach (var type in types)
{
    var report = (IReport)Activator.CreateInstance(type)!;
    Console.WriteLine($"{type.Name}: {report.Generate()}");
}

// Built-in attributes in action: [Obsolete] is visible through reflection too
var old = typeof(LegacyReport).GetCustomAttribute<ObsoleteAttribute>();
Console.WriteLine($"LegacyReport obsolete? {old != null} - {old?.Message}");

interface IReport { string Generate(); }

class SalesReport : IReport { public string Generate() => "Total sales 1200"; }
class StockReport : IReport { public string Generate() => "Items in stock 85"; }

[Obsolete("Use SalesReport instead")]
class LegacyReport : IReport { public string Generate() => "Old format"; }
`;

export default {
  id: 'extra-29-dynamic-reflection-and-attributes',
  title: 'Dynamic, Reflection and Attributes',
  module: 'Extra: Advanced C#',
  extraNo: 29,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: `Three features that let code look at or work with types at run time. dynamic skips compile-time type checks and resolves members while the program runs. Reflection reads metadata (classes, properties, methods, attributes) and can create objects and call methods by name. Attributes attach extra information to code that frameworks such as ASP.NET Core, EF Core and xUnit read with reflection. You will build a small attribute-driven validator and a plugin loader.`,
  objectives: [
    'Compare var, object and dynamic and use ExpandoObject',
    'Inspect a type with System.Reflection: properties, methods, private members',
    'Create objects, set properties and invoke methods by name at run time',
    'Use built-in attributes and write custom attributes with AttributeUsage',
    'Read custom attributes with reflection to build validation and plugin discovery',
  ],
  theory: [
    {
      heading: 'var vs object vs dynamic',
      content: `| | var | object | dynamic |
|---|---|---|---|
| Type decided | compile time (inferred) | compile time (object) | run time |
| Can change type later | no | yes (any value boxed/stored) | yes |
| Member access | checked by compiler | needs a cast first | resolved at run time - no IntelliSense |
| Wrong member | compile error | compile error | RuntimeBinderException at run time |

**dynamic** is useful for COM interop (Excel/Office automation), working with dynamic languages, JSON or ExpandoObject-style data, and some ViewBag code in ASP.NET MVC (ViewBag is dynamic). It is slower and less safe, so use it rarely.`,
      syntax: `var a = 10;        // int forever
object b = 10;     // must cast: (int)b + 5
dynamic c = 10;    // c + 5 works, c = "text" also works
c.AnyMethod();     // compiles, may fail at run time`,
    },
    {
      heading: 'ExpandoObject and DynamicObject',
      content: `**ExpandoObject** (System.Dynamic) is an object whose members can be added and removed at run time, like a JavaScript object. Internally it is an IDictionary<string, object?>, so you can also loop through its members.

**DynamicObject** is a base class for your own dynamic types: override TryGetMember / TrySetMember / TryInvokeMember to decide what happens when someone calls a member that does not exist at compile time.`,
      syntax: `dynamic p = new ExpandoObject();
p.Name = "Asha";
p.Age = 22;
var dict = (IDictionary<string, object?>)p;
dict["City"] = "Pune";
Console.WriteLine(p.City);   // Pune`,
    },
    {
      heading: 'Reflection: reading type metadata',
      content: `Every .NET assembly contains **metadata** describing its types. **Reflection** (namespace System.Reflection) reads it at run time.

Getting a Type object:
- typeof(Student) - when you know the type at compile time
- obj.GetType() - the runtime type of an object
- Type.GetType("MyApp.Student") - from a string name

Useful members of Type: Name, FullName, Namespace, BaseType, IsClass, IsInterface, GetProperties(), GetMethods(), GetFields(), GetConstructors(), GetProperty("Name"), GetMethod("Grade"), GetCustomAttributes().

**BindingFlags** control what is returned: Public, NonPublic, Instance, Static, DeclaredOnly. Without flags you get only public members.`,
      syntax: `Type t = typeof(Student);
foreach (PropertyInfo p in t.GetProperties())
    Console.WriteLine($"{p.Name}: {p.PropertyType.Name}");

MethodInfo? m = t.GetMethod("Secret", BindingFlags.NonPublic | BindingFlags.Instance);`,
      tip: `GetProperties() does not promise any particular order. If order matters, sort the results (e.g. OrderBy(p => p.Name)).`,
    },
    {
      heading: 'Reflection: creating objects and invoking members',
      content: `- **Activator.CreateInstance(type)** creates an object (calls the parameterless constructor).
- **PropertyInfo.SetValue(obj, value)** / **GetValue(obj)** read and write properties by name.
- **MethodInfo.Invoke(obj, args)** calls a method.
- **Assembly.GetExecutingAssembly().GetTypes()** lists all types - used for plugin discovery and auto-registration in DI containers.

This is how frameworks work: ASP.NET Core model binding sets properties from form/JSON values, EF Core materializes entities, AutoMapper copies properties, xUnit finds [Fact] methods, and DI creates controllers.

**Downsides**: slower than direct calls, no compile-time safety, can break encapsulation (private members), and code can be trimmed away in Native AOT apps. Cache Type/PropertyInfo objects and prefer generics, interfaces or source generators when possible.`,
    },
    {
      heading: 'Attributes: metadata you attach to code',
      content: `An **attribute** is a class deriving from System.Attribute that you place in square brackets above a class, method, property, parameter etc. It does nothing by itself - some code (compiler, framework, your own reflection code) **reads** it and changes behaviour.

Built-in examples:
- [Obsolete("Use X")] - compiler warning when used
- [Serializable], [Flags], [Conditional("DEBUG")]
- ASP.NET Core: [HttpGet], [Route], [Authorize], [ApiController], [FromBody]
- Data annotations: [Required], [StringLength(50)], [Range(1, 100)], [Key], [Table("Students")]
- System.Text.Json: [JsonPropertyName], [JsonIgnore]
- xUnit: [Fact], [Theory], [InlineData]

**Custom attribute**: a class ending with "Attribute" (the suffix can be skipped when using it), with **[AttributeUsage]** saying where it can be applied. Constructor parameters become positional arguments; public properties become named arguments.`,
      syntax: `[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class BetweenAttribute : Attribute
{
    public int Min { get; }
    public int Max { get; }
    public string? Message { get; set; }        // named argument
    public BetweenAttribute(int min, int max) { Min = min; Max = max; }
}

[Between(1, 1000, Message = "Invalid price")]
public int Price { get; set; }

var attr = prop.GetCustomAttribute<BetweenAttribute>();`,
    },
  ],
  examples: [
    {
      title: 'dynamic and ExpandoObject',
      scenario: 'See how one dynamic variable can hold an int and then a string, what happens when a member does not exist, and how to build an object at run time.',
      steps: steps('DynamicDemo'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `15
Int32
HELLO
5
String
Runtime error: 'string' does not contain a definition for 'Fly'
Asha is 22
Hi, I am Asha
Name, Age, Greet
10`,
      explanation: `x + 5 is resolved at run time as int addition. After x = "Hello", ToUpper and Length are resolved against string. x.Fly() compiles because the compiler does not check dynamic members; the runtime binder throws RuntimeBinderException. The ExpandoObject gets three members at run time (two values and a delegate); casting it to IDictionary shows the member names in the order they were added. y is a normal var int.`,
    },
    {
      title: 'Reflection: inspect a class and call members by name',
      scenario: 'List the properties and methods of a Student class, create one, fill it by property name and invoke a public and a private method - the way ORMs and model binders work.',
      steps: steps('ReflectionDemo'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `Class: Student, Namespace: (global)
Property: Id (Int32)
Property: Marks (Int32)
Property: Name (String)
Method: Grade returns String
Ravi -> Pass
Private method found: True
hidden value`,
      explanation: `Student is declared without a namespace in Program.cs, so Namespace is null and ?? prints "(global)". Properties are sorted by name to get a stable order. DeclaredOnly hides inherited methods like ToString, and IsSpecialName removes property accessors (get_Name, set_Name), leaving only Grade. Activator creates an object; SetValue fills it; Invoke runs Grade with Marks 72 -> Pass. NonPublic | Instance finds the private Secret method, which can even be invoked.`,
    },
    {
      title: 'Custom attributes + reflection = a mini validation framework',
      scenario: 'Mark Product properties with [NotEmpty] and [Between(min, max)], then write a Validator that reads those attributes - just like ASP.NET Core data annotations.',
      steps: steps('CustomAttributes'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Entity: Product master table
Product 1: Name is required; Price must be between 1 and 1000
Product 2: valid
Product 3: Price must be between 1 and 1000; Stock must be between 0 and 100`,
      explanation: `GetCustomAttribute<InfoAttribute>() reads the class-level attribute text. The Validator loops through every property (sorted Name, Price, Stock), reads its attributes and checks the value. Product 1 has an empty name and price 5000; product 3 has price 0 and stock 150. The Product class itself contains no validation code - the rules live in attributes, which is exactly how [Required] and [Range] work in ASP.NET Core.`,
    },
    {
      title: 'Plugin discovery with Assembly scanning',
      scenario: 'Automatically find and run every report class that implements IReport, without registering them by hand, and read the [Obsolete] attribute.',
      steps: steps('PluginDiscovery'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `LegacyReport: Old format
SalesReport: Total sales 1200
StockReport: Items in stock 85
LegacyReport obsolete? True - Use SalesReport instead`,
      explanation: `GetTypes() returns every type in the assembly; the Where keeps concrete classes that implement IReport and OrderBy makes the order stable. Activator.CreateInstance creates each one and the interface call runs its Generate method. Adding a new report class requires no other code change - the same idea is used by DI auto-registration (Scrutor) and by test runners. typeof(LegacyReport) causes a compiler warning (CS0618) because the class is [Obsolete]; reflection reads the message.`,
    },
  ],
  interview: [
    { q: 'Difference between var and dynamic?', a: 'var is statically typed: the compiler infers the type once and checks all member access. dynamic bypasses compile-time checking; members are resolved at run time by the DLR and errors become RuntimeBinderException.', level: 'Easy' },
    { q: 'Difference between object and dynamic?', a: 'Both can hold any value. With object you must cast before using members (compile-time checked after the cast). With dynamic you can call members directly; the binding happens at run time.', level: 'Medium' },
    { q: 'What is the DLR?', a: 'The Dynamic Language Runtime: a layer on top of the CLR that performs runtime binding and caching of call sites for dynamic operations (used by C# dynamic, IronPython, COM interop).', level: 'Hard' },
    { q: 'What is reflection?', a: 'The ability to inspect metadata of assemblies and types at run time (System.Reflection) and to create instances, read/write fields and properties and invoke methods dynamically.', level: 'Easy' },
    { q: 'Give real uses of reflection in .NET frameworks.', a: 'ASP.NET Core model binding and controller discovery, EF Core entity mapping, System.Text.Json (reflection-based mode), AutoMapper, xUnit test discovery, DI containers scanning assemblies, attribute-based validation.', level: 'Medium' },
    { q: 'What are BindingFlags?', a: 'An enum that filters reflection lookups: Public, NonPublic, Instance, Static, DeclaredOnly, IgnoreCase etc. To find private instance members use BindingFlags.NonPublic | BindingFlags.Instance.', level: 'Medium' },
    { q: 'What are the drawbacks of reflection?', a: 'Slower than direct calls, no compile-time safety (typos in names fail at run time), breaks encapsulation, and is problematic for trimming/Native AOT. Mitigate by caching metadata, compiled expressions or source generators.', level: 'Medium' },
    { q: 'What is an attribute?', a: 'A class derived from System.Attribute used to add declarative metadata to code elements. It has no effect until code (compiler, runtime, framework or your reflection code) reads it.', level: 'Easy' },
    { q: 'What does AttributeUsage specify?', a: 'Valid targets (class, method, property ...), whether the attribute can be applied multiple times (AllowMultiple) and whether it is inherited by derived classes (Inherited).', level: 'Medium' },
    { q: 'Why can you write [Required] instead of [RequiredAttribute]?', a: 'By convention attribute class names end with Attribute, and the compiler lets you omit the suffix when applying them.', level: 'Easy' },
    { q: 'Output? dynamic d = 5; d = d + "5"; Console.WriteLine(d);', a: '55. At run time int + string is resolved as string concatenation.', level: 'Medium' },
    { q: 'How would you find all classes implementing an interface?', a: 'Assembly.GetTypes().Where(t => typeof(IMyInterface).IsAssignableFrom(t) && t.IsClass && !t.IsAbstract).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a method PrintObject(object obj) that uses reflection to print every public property as "Name = Value" for any object. Test it with an Employee and a Product.',
      hint: 'obj.GetType().GetProperties() then p.GetValue(obj).',
      solution: `PrintObject(new Employee { Id = 1, Name = "Asha" });

static void PrintObject(object obj)
{
    Console.WriteLine(obj.GetType().Name);
    foreach (var p in obj.GetType().GetProperties().OrderBy(p => p.Name))
        Console.WriteLine($"  {p.Name} = {p.GetValue(obj)}");
}

class Employee { public int Id { get; set; } public string Name { get; set; } = ""; }`,
    },
    {
      task: 'Create a custom [MaxLength(n)] attribute and extend the validator from Example 3 so that Name must be at most 10 characters.',
      hint: 'AttributeUsage(AttributeTargets.Property); check (value as string)?.Length > n.',
      solution: `[AttributeUsage(AttributeTargets.Property)]
class MaxLenAttribute : Attribute
{
    public int Length { get; }
    public MaxLenAttribute(int length) => Length = length;
}

// inside Validate:
var max = prop.GetCustomAttribute<MaxLenAttribute>();
if (max != null && value is string s && s.Length > max.Length)
    errors.Add($"{prop.Name} must be at most {max.Length} characters");`,
    },
    {
      task: 'Write a simple object copier Copy<T>(T source) where T : new() that creates a new T and copies all readable+writable properties with reflection.',
      hint: 'Filter properties with CanRead && CanWrite; use SetValue(target, GetValue(source)).',
      solution: `static T Copy<T>(T source) where T : new()
{
    var target = new T();
    foreach (var p in typeof(T).GetProperties().Where(p => p.CanRead && p.CanWrite))
        p.SetValue(target, p.GetValue(source));
    return target;
}`,
    },
    {
      task: 'Use an ExpandoObject to build a "settings" object from a string array like "Theme=Dark", "FontSize=14" and print every key and value.',
      hint: 'Cast the expando to IDictionary<string, object?> and add entries after splitting on "=".',
      solution: `using System.Dynamic;
string[] lines = { "Theme=Dark", "FontSize=14" };
dynamic settings = new ExpandoObject();
var dict = (IDictionary<string, object?>)settings;
foreach (var line in lines)
{
    var parts = line.Split('=');
    dict[parts[0]] = parts[1];
}
Console.WriteLine(settings.Theme);           // Dark
foreach (var kv in dict) Console.WriteLine($"{kv.Key}: {kv.Value}");`,
    },
  ],
  quiz: [
    {
      question: 'dynamic d = "abc"; d.Foo(); - when is the error reported?',
      options: ['At compile time', 'At run time as RuntimeBinderException', 'Never - it returns null', 'When the project is published'],
      answer: 1,
      explanation: 'Members on dynamic are bound at run time; a missing member throws RuntimeBinderException.',
    },
    {
      question: 'Which call creates an object from a Type at run time?',
      options: ['Activator.CreateInstance(type)', 'type.New()', 'new type()', 'Type.Create(type)'],
      answer: 0,
      explanation: 'Activator.CreateInstance invokes a constructor (parameterless by default).',
    },
    {
      question: 'To get private instance methods with reflection you pass...',
      options: ['BindingFlags.Public', 'BindingFlags.Static', 'BindingFlags.Private', 'BindingFlags.NonPublic | BindingFlags.Instance'],
      answer: 3,
      explanation: 'There is no Private flag; NonPublic plus Instance (or Static) is required.',
    },
    {
      question: 'What does an attribute do by itself?',
      options: ['Executes code before the method', 'Changes the method signature', 'Nothing - it is metadata until something reads it', 'Makes the member private'],
      answer: 2,
      explanation: 'Attributes are passive metadata; the compiler, framework or reflection code gives them meaning.',
    },
    {
      question: 'Which attribute controls where a custom attribute may be applied?',
      options: ['[Target]', '[AttributeUsage]', '[Obsolete]', '[Conditional]'],
      answer: 1,
      explanation: 'AttributeUsage sets the valid targets, AllowMultiple and Inherited.',
    },
  ],
};
