const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below (System.Text.Json is built into .NET - no NuGet package needed)',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `using System.Text.Json;

// Serialize = C# object -> JSON text, Deserialize = JSON text -> C# object
var s = new Student { Id = 1, Name = "Asha", Marks = 88, Subjects = new List<string> { "Maths", "Science" } };

string compact = JsonSerializer.Serialize(s);
Console.WriteLine(compact);

var pretty = new JsonSerializerOptions
{
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
Console.WriteLine(JsonSerializer.Serialize(s, pretty));

// Deserializing camelCase JSON: names are case-SENSITIVE by default
string input = """{"id":2,"name":"Ravi","marks":76,"subjects":["English"]}""";

var r1 = JsonSerializer.Deserialize<Student>(input)!;
Console.WriteLine($"Default options: Id={r1.Id}, Name='{r1.Name}'");

var caseInsensitive = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
var r2 = JsonSerializer.Deserialize<Student>(input, caseInsensitive)!;
Console.WriteLine($"Case-insensitive: Id={r2.Id}, Name='{r2.Name}', Subjects={r2.Subjects.Count}");

class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public List<string> Subjects { get; set; } = new();
}
`;
const ex2 = `using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

// Controlling the JSON shape with attributes and options
var p = new Product
{
    Id = 7,
    Name = "Laptop",
    Price = 55000.5m,
    Category = Category.Electronics,
    InternalCode = "X-1",
    Discount = null
};

Console.WriteLine(JsonSerializer.Serialize(p));

var options = new JsonSerializerOptions
{
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,   // skip null values
    Converters = { new JsonStringEnumConverter() }                  // enums as text
};
Console.WriteLine(JsonSerializer.Serialize(p, options));

// Reading back: the attribute name product_name maps to Name
string json = """{"Id":9,"product_name":"Mouse","Price":499.99,"Category":"Accessories"}""";
var back = JsonSerializer.Deserialize<Product>(json, options)!;
Console.WriteLine($"{back.Name} | {back.Category} | {back.Price.ToString(CultureInfo.InvariantCulture)} | InternalCode='{back.InternalCode}'");

enum Category { Electronics, Accessories }

class Product
{
    public int Id { get; set; }

    [JsonPropertyName("product_name")]
    public string Name { get; set; } = "";

    public decimal Price { get; set; }
    public Category Category { get; set; }

    [JsonIgnore]
    public string InternalCode { get; set; } = "";

    public decimal? Discount { get; set; }
}
`;
const ex3 = `using System.Text.Json;
using System.Text.Json.Nodes;

// 1) Lists of records with the Web defaults (camelCase + case-insensitive, like ASP.NET Core)
string json = """
[
  {"name":"Asha","marks":88},
  {"name":"Ravi","marks":45},
  {"name":"Meera","marks":92}
]
""";
var web = new JsonSerializerOptions(JsonSerializerDefaults.Web);
List<StudentDto> list = JsonSerializer.Deserialize<List<StudentDto>>(json, web)!;
foreach (var s in list.Where(x => x.Marks >= 50))
    Console.WriteLine($"{s.Name}: {s.Marks}");
Console.WriteLine(JsonSerializer.Serialize(list[0], web));

// 2) JsonNode: read/modify JSON without creating classes
var node = JsonNode.Parse("""{"order":{"id":101,"items":[{"sku":"A1","qty":2},{"sku":"B7","qty":1}]}}""")!;
Console.WriteLine($"Order id: {node["order"]!["id"]!.GetValue<int>()}");
foreach (var item in node["order"]!["items"]!.AsArray())
    Console.WriteLine($"{item!["sku"]!.GetValue<string>()} x {item["qty"]!.GetValue<int>()}");
node["order"]!["status"] = "Packed";                 // add a new property
Console.WriteLine(node.ToJsonString());

// 3) JsonDocument: fast read-only access
using JsonDocument doc = JsonDocument.Parse(json);
Console.WriteLine($"Array length: {doc.RootElement.GetArrayLength()}");
Console.WriteLine(doc.RootElement[2].GetProperty("name").GetString());

record StudentDto(string Name, int Marks);
`;
const ex4 = `using System.Text.Json;

// Save objects to a JSON file and load them back (async, with streams)
var students = new List<Student>
{
    new(1, "Asha", 88),
    new(2, "Ravi", 76),
};

string path = "students.json";
var options = new JsonSerializerOptions { WriteIndented = true };

await using (FileStream write = File.Create(path))
{
    await JsonSerializer.SerializeAsync(write, students, options);
}
Console.WriteLine($"Saved {students.Count} students to {path}");

await using (FileStream read = File.OpenRead(path))
{
    var loaded = await JsonSerializer.DeserializeAsync<List<Student>>(read);
    Console.WriteLine($"Loaded: {string.Join(", ", loaded!.Select(s => s.Name))}");
}

// Handling bad JSON
try
{
    JsonSerializer.Deserialize<Student>("{ \\"Id\\": \\"abc\\" }");
}
catch (JsonException)
{
    Console.WriteLine("Invalid JSON: Id must be a number");
}

File.Delete(path);

record Student(int Id, string Name, int Marks);
`;

export default {
  id: 'extra-31-json-serialization-system-text-json',
  title: 'JSON Serialization and Deserialization (System.Text.Json)',
  module: 'Extra: Advanced C#',
  extraNo: 31,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `JSON is the language of Web APIs, configuration files and front-end apps like React. System.Text.Json converts C# objects to JSON (serialization) and JSON back to objects (deserialization). Learn JsonSerializer with options (indentation, camelCase, case-insensitive names, null handling, enums as strings), attributes ([JsonPropertyName], [JsonIgnore]), records and collections, the JsonNode and JsonDocument DOM APIs, async file streams, error handling and how ASP.NET Core uses all of it.`,
  objectives: [
    'Serialize and deserialize objects, lists and records with JsonSerializer',
    'Configure JsonSerializerOptions: WriteIndented, naming policy, case-insensitivity, ignore conditions, converters',
    'Shape JSON with [JsonPropertyName], [JsonIgnore] and JsonStringEnumConverter',
    'Read and modify JSON without classes using JsonNode and JsonDocument',
    'Save/load JSON files asynchronously and handle JsonException',
  ],
  theory: [
    {
      heading: 'What is JSON and what is serialization?',
      content: `**JSON** (JavaScript Object Notation) is a text format for data: objects { "name": "Asha" }, arrays [1, 2, 3], strings, numbers, true/false and null.

- **Serialization** = converting a C# object into JSON text (to send in an HTTP response, save to a file, put in a queue).
- **Deserialization** = converting JSON text back into a C# object.

Analogy: packing furniture into a flat box for shipping (serialize) and assembling it again at home (deserialize).

.NET includes **System.Text.Json** (namespace System.Text.Json) - fast, low-memory and the default in ASP.NET Core. The older **Newtonsoft.Json** (Json.NET) NuGet package is still common in legacy projects.`,
      syntax: `using System.Text.Json;

string json = JsonSerializer.Serialize(student);
Student? s = JsonSerializer.Deserialize<Student>(json);`,
      points: [
        'Only public properties (with public getters) are serialized by default; fields need IncludeFields = true or [JsonInclude]',
        'Deserialization needs a public parameterless constructor and setters, OR a constructor whose parameter names match the JSON properties (records!)',
        'Deserialize returns null for the JSON literal null, so the result type is nullable',
      ],
    },
    {
      heading: 'JsonSerializerOptions',
      content: `Options control the JSON shape. Create the options object **once** and reuse it (it caches metadata internally - creating it per call is slow).

| Option | Effect |
|---|---|
| WriteIndented = true | pretty-printed JSON with new lines and indentation |
| PropertyNamingPolicy = JsonNamingPolicy.CamelCase | Name -> "name" (also SnakeCaseLower, KebabCaseLower in .NET 8+) |
| PropertyNameCaseInsensitive = true | "NAME", "name" and "Name" all match when reading |
| DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull | skip null properties |
| Converters = { new JsonStringEnumConverter() } | enums as text instead of numbers |
| ReferenceHandler = ReferenceHandler.IgnoreCycles | avoid errors on circular references (EF navigation properties) |
| NumberHandling = JsonNumberHandling.AllowReadingFromString | accept "25" for an int |

**JsonSerializerDefaults.Web** = camelCase + case-insensitive + numbers from strings - the same settings ASP.NET Core uses.`,
      syntax: `private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
{
    WriteIndented = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    Converters = { new JsonStringEnumConverter() }
};`,
      tip: `By default System.Text.Json is case-SENSITIVE when reading. JSON from JavaScript is camelCase, so plain Deserialize<T>(json) silently leaves properties empty. Use the Web defaults or PropertyNameCaseInsensitive.`,
    },
    {
      heading: 'Attributes that customize serialization',
      content: `Namespace **System.Text.Json.Serialization**:
- **[JsonPropertyName("product_name")]** - use a different JSON name
- **[JsonIgnore]** - never serialize this property (passwords, internal codes). Use Condition = JsonIgnoreCondition.WhenWritingNull for per-property null skipping.
- **[JsonInclude]** - include a non-public property or a public field
- **[JsonRequired]** (.NET 7+) - deserialization fails if the property is missing
- **[JsonPropertyOrder(1)]** - control output order
- **[JsonConverter(typeof(JsonStringEnumConverter))]** - converter for one property or type
- **[JsonConstructor]** - choose which constructor to use when deserializing`,
      syntax: `public class Product
{
    [JsonPropertyName("product_name")]
    public string Name { get; set; } = "";

    [JsonIgnore]
    public string InternalCode { get; set; } = "";

    [JsonRequired]
    public decimal Price { get; set; }
}`,
    },
    {
      heading: 'Working without classes: JsonNode and JsonDocument',
      content: `Sometimes the JSON shape is unknown or you only need one value.

- **JsonDocument** (System.Text.Json) - fast, **read-only** DOM. Use RootElement, GetProperty("name"), GetString(), GetInt32(), EnumerateArray(), TryGetProperty. It is IDisposable (uses pooled memory) - always use using.
- **JsonNode** (System.Text.Json.Nodes) - **mutable** DOM. Index with node["order"]["id"], read with GetValue<int>(), add/change properties, then ToJsonString(). JsonObject and JsonArray let you build JSON in code.
- **Utf8JsonReader / Utf8JsonWriter** - the lowest-level, fastest forward-only APIs.`,
      syntax: `using JsonDocument doc = JsonDocument.Parse(json);
string name = doc.RootElement.GetProperty("name").GetString()!;

var node = JsonNode.Parse(json)!;
node["status"] = "Packed";
var obj = new JsonObject { ["id"] = 1, ["tags"] = new JsonArray("a", "b") };`,
    },
    {
      heading: 'Files, streams, errors and ASP.NET Core',
      content: `- **SerializeAsync(stream, value)** / **DeserializeAsync<T>(stream)** work directly with FileStream or HTTP streams without building a big string first.
- Invalid JSON or a wrong type (e.g. "abc" for an int) throws **JsonException** - catch it and return a friendly error (ASP.NET Core returns 400 Bad Request automatically).
- **HttpClient** extensions (System.Net.Http.Json): GetFromJsonAsync<T>(url), PostAsJsonAsync(url, obj), ReadFromJsonAsync<T>().
- In ASP.NET Core you rarely call JsonSerializer yourself: controllers serialize return values and deserialize [FromBody] parameters. Configure globally:
  builder.Services.AddControllers().AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
- **Source generation** ([JsonSerializable(typeof(Student))] on a JsonSerializerContext) removes reflection at run time - faster startup and required for Native AOT.`,
      syntax: `await using var fs = File.Create("students.json");
await JsonSerializer.SerializeAsync(fs, students, options);

var client = new HttpClient();
var list = await client.GetFromJsonAsync<List<Student>>("https://localhost:5001/api/students");`,
    },
  ],
  examples: [
    {
      title: 'Serialize, pretty-print and deserialize a Student',
      scenario: 'Convert a Student object to compact and indented camelCase JSON, then read camelCase JSON that came from a React front end.',
      steps: steps('JsonBasics'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `{"Id":1,"Name":"Asha","Marks":88,"Subjects":["Maths","Science"]}
{
  "id": 1,
  "name": "Asha",
  "marks": 88,
  "subjects": [
    "Maths",
    "Science"
  ]
}
Default options: Id=0, Name=''
Case-insensitive: Id=2, Name='Ravi', Subjects=1`,
      explanation: `By default property names are written exactly as in C# (PascalCase) on one line. WriteIndented adds new lines and 2-space indentation, and the camelCase policy changes Id to id. When reading, the default is case-sensitive: "id" does not match Id, so no property is set and the defaults (0 and "") remain - with no error! With PropertyNameCaseInsensitive the values are filled correctly. The JSON input is a C# 11 raw string literal ("""...""") so the quotes need no escaping.`,
    },
    {
      title: 'Attributes, null handling and enums as strings',
      scenario: 'A product API must use the JSON name product_name, hide the internal code, skip null discounts and send the category as text.',
      steps: steps('JsonAttributes'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `{"Id":7,"product_name":"Laptop","Price":55000.5,"Category":0,"Discount":null}
{"Id":7,"product_name":"Laptop","Price":55000.5,"Category":"Electronics"}
Mouse | Accessories | 499.99 | InternalCode=''`,
      explanation: `[JsonPropertyName] renames Name, and [JsonIgnore] removes InternalCode in both outputs. Without options the enum is written as its number (0) and the null Discount is written as null. With WhenWritingNull the Discount disappears, and JsonStringEnumConverter writes "Electronics". When reading back, "product_name" maps to Name, the converter turns "Accessories" into the enum, and InternalCode keeps its default because it is ignored. JSON numbers are always written with a dot, independent of culture.`,
    },
    {
      title: 'Lists of records, JsonNode and JsonDocument',
      scenario: 'Read a JSON array of students into records, filter it, then read and modify an order JSON without creating classes.',
      steps: steps('JsonDom'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `Asha: 88
Meera: 92
{"name":"Asha","marks":88}
Order id: 101
A1 x 2
B7 x 1
{"order":{"id":101,"items":[{"sku":"A1","qty":2},{"sku":"B7","qty":1}],"status":"Packed"}}
Array length: 3
Meera`,
      explanation: `JsonSerializerDefaults.Web matches "name" to the record constructor parameter Name (case-insensitive) and writes camelCase back. JsonNode lets us walk the tree with indexers, read typed values with GetValue<T>, and add a new "status" property; ToJsonString prints compact JSON. JsonDocument is read-only: GetArrayLength counts the students and [2] is the third element (Meera).`,
    },
    {
      title: 'Save and load a JSON file with streams + handle bad JSON',
      scenario: 'Persist a student list to students.json asynchronously, load it back, and catch an error when a value has the wrong type.',
      steps: steps('JsonFiles'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `Saved 2 students to students.json
Loaded: Asha, Ravi
Invalid JSON: Id must be a number`,
      explanation: `SerializeAsync writes directly into the FileStream; DeserializeAsync reads from the stream and uses the record constructor. await using disposes (closes) each stream before the next step. The last JSON has "abc" for an int property, so System.Text.Json throws JsonException, which we catch. The file is deleted at the end (it is created in the bin folder next to the exe).`,
    },
  ],
  interview: [
    { q: 'What is serialization and deserialization?', a: 'Serialization converts an object to a storable/transferable format such as JSON; deserialization rebuilds the object from that format.', level: 'Easy' },
    { q: 'System.Text.Json vs Newtonsoft.Json?', a: 'System.Text.Json is built into .NET, faster and allocates less, is strict by default (case-sensitive, no comments/trailing commas) and supports source generation/AOT. Newtonsoft is a NuGet package with more features and flexibility (e.g. more lenient parsing, JObject) and is common in older code.', level: 'Medium' },
    { q: 'Why did Deserialize<Student>(json) leave all properties empty?', a: 'Most likely the JSON uses camelCase and the default reader is case-sensitive, so no names matched. Use PropertyNameCaseInsensitive = true or JsonSerializerDefaults.Web.', level: 'Medium' },
    { q: 'How do you hide a property from JSON output?', a: 'Mark it with [JsonIgnore], or use a DTO that does not contain it (best for sensitive data like passwords).', level: 'Easy' },
    { q: 'How do you serialize enums as strings?', a: 'Add JsonStringEnumConverter to options.Converters (or [JsonConverter(typeof(JsonStringEnumConverter))] on the enum/property). In ASP.NET Core add it in AddJsonOptions.', level: 'Easy' },
    { q: 'What does JsonSerializerDefaults.Web set?', a: 'camelCase naming policy, case-insensitive property matching and AllowReadingFromString number handling - the defaults used by ASP.NET Core.', level: 'Medium' },
    { q: 'Difference between JsonDocument and JsonNode?', a: 'JsonDocument is a read-only, pooled-memory DOM (must be disposed). JsonNode/JsonObject/JsonArray form a mutable DOM that can be edited and written back.', level: 'Medium' },
    { q: 'How do you avoid "A possible object cycle was detected"?', a: 'Return DTOs instead of EF entities with two-way navigations, or set ReferenceHandler = ReferenceHandler.IgnoreCycles (or Preserve) in the options.', level: 'Hard' },
    { q: 'Why should JsonSerializerOptions be reused?', a: 'Each options instance builds and caches type metadata. Creating new options for every call repeats that work and hurts performance.', level: 'Hard' },
    { q: 'Can System.Text.Json deserialize records and immutable types?', a: 'Yes. It uses a public constructor whose parameter names match the JSON properties (case-insensitively), or the one marked [JsonConstructor]. init-only setters are also supported.', level: 'Medium' },
    { q: 'What exception is thrown for invalid JSON?', a: 'JsonException (for syntax errors and for values that cannot be converted to the target type). ArgumentNullException if the input string itself is null.', level: 'Easy' },
    { q: 'What is JSON source generation?', a: 'A compile-time generator: you declare a partial class deriving from JsonSerializerContext with [JsonSerializable(typeof(T))]. It generates serialization code, removing runtime reflection - faster startup, trimming and Native AOT friendly.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a class Employee (Id, Name, Department, Salary). Serialize a list of 3 employees to indented camelCase JSON and print it.',
      hint: 'new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true }',
      solution: `using System.Text.Json;
var list = new List<Employee>
{
    new() { Id = 1, Name = "Asha", Department = "IT", Salary = 85000 },
    new() { Id = 2, Name = "Ravi", Department = "HR", Salary = 52000 },
    new() { Id = 3, Name = "Meera", Department = "IT", Salary = 61000 },
};
var opt = new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true };
Console.WriteLine(JsonSerializer.Serialize(list, opt));

class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Department { get; set; } = "";
    public int Salary { get; set; }
}`,
    },
    {
      task: 'Read this JSON and print the total salary of the IT department: [{"name":"Asha","dept":"IT","salary":85000},{"name":"Ravi","dept":"HR","salary":52000},{"name":"Meera","dept":"IT","salary":61000}]',
      hint: 'Deserialize into List<Emp> with record Emp(string Name, string Dept, int Salary) and Web defaults, then Where + Sum.',
      solution: `using System.Text.Json;
string json = """[{"name":"Asha","dept":"IT","salary":85000},{"name":"Ravi","dept":"HR","salary":52000},{"name":"Meera","dept":"IT","salary":61000}]""";
var emps = JsonSerializer.Deserialize<List<Emp>>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
Console.WriteLine(emps.Where(e => e.Dept == "IT").Sum(e => e.Salary));   // 146000

record Emp(string Name, string Dept, int Salary);`,
    },
    {
      task: 'Build this JSON in code with JsonObject/JsonArray and print it: {"course":".NET","students":["Asha","Ravi"],"active":true}',
      hint: 'using System.Text.Json.Nodes; new JsonObject { ["course"] = ".NET", ... }',
      solution: `using System.Text.Json.Nodes;
var obj = new JsonObject
{
    ["course"] = ".NET",
    ["students"] = new JsonArray("Asha", "Ravi"),
    ["active"] = true
};
Console.WriteLine(obj.ToJsonString());`,
    },
    {
      task: 'Write a small settings manager: load settings.json into an AppSettings class if the file exists, otherwise create it with defaults (Theme = "Light", FontSize = 14). Change FontSize and save it back.',
      hint: 'File.Exists, File.ReadAllText + Deserialize, then File.WriteAllText + Serialize with WriteIndented.',
      solution: `using System.Text.Json;
const string path = "settings.json";
var opt = new JsonSerializerOptions { WriteIndented = true };
AppSettings settings = File.Exists(path)
    ? JsonSerializer.Deserialize<AppSettings>(File.ReadAllText(path))!
    : new AppSettings();
settings.FontSize += 2;
File.WriteAllText(path, JsonSerializer.Serialize(settings, opt));
Console.WriteLine($"Theme={settings.Theme}, FontSize={settings.FontSize}");

class AppSettings
{
    public string Theme { get; set; } = "Light";
    public int FontSize { get; set; } = 14;
}`,
    },
  ],
  quiz: [
    {
      question: 'Which method converts a C# object into a JSON string?',
      options: ['JsonSerializer.Deserialize', 'JsonSerializer.Serialize', 'JsonDocument.Parse', 'JsonNode.Parse'],
      answer: 1,
      explanation: 'Serialize writes JSON; Deserialize reads JSON into an object.',
    },
    {
      question: 'JSON {"name":"Asha"} is deserialized into class Student { public string Name { get; set; } } with default options. What is Name?',
      options: ['"Asha"', 'An exception is thrown', 'The default value - the names differ in case', '"name"'],
      answer: 2,
      explanation: 'Default reading is case-sensitive, so "name" does not match Name and is silently skipped.',
    },
    {
      question: 'Which attribute stops a property from being written to JSON?',
      options: ['[JsonIgnore]', '[NonSerialized]', '[JsonRequired]', '[JsonInclude]'],
      answer: 0,
      explanation: '[JsonIgnore] excludes the property from serialization and deserialization.',
    },
    {
      question: 'Which API lets you change a property inside parsed JSON without a C# class?',
      options: ['JsonDocument', 'Utf8JsonReader', 'JsonSerializerOptions', 'JsonNode'],
      answer: 3,
      explanation: 'JsonNode is the mutable DOM; JsonDocument is read-only.',
    },
    {
      question: 'What does JsonStringEnumConverter do?',
      options: ['Converts strings to upper case', 'Writes and reads enums using their names instead of numbers', 'Encrypts enum values', 'Removes enums from the JSON'],
      answer: 1,
      explanation: 'With the converter, Category.Electronics becomes "Electronics" in JSON and is parsed back from text.',
    },
  ],
};
