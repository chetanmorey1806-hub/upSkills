export default {
  lesson: 'extra-31-json-serialization-system-text-json',
  minutes: 25,
  intro: 'Serialize and deserialize objects with System.Text.Json, control names and casing, and ignore properties.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'Serialize', code: `JsonSerializer.Serialize(new City("Pune", 411001));
// {"Name":"Pune","Pin":411001}` },
      code: `using System.Text.Json;

var s = new Student { Id = 7, Name = "Asha", IsActive = true };
Console.WriteLine(JsonSerializer.Serialize(s));

var opts = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
Console.WriteLine(JsonSerializer.Serialize(s, opts));

class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public bool IsActive { get; set; }
}`,
      expected: `{"Id":7,"Name":"Asha","IsActive":true}
{"id":7,"name":"Asha","isActive":true}`,
      explain: 'By default System.Text.Json keeps the C# property names (PascalCase) and writes compact JSON with lowercase `true`. The camelCase naming policy converts names to `id`, `name`, `isActive` (ASP.NET Core Web APIs use camelCase by default).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Deserializing with different casing. What does this print?',
      example: { title: 'Deserialize<T>', code: 'var p = JsonSerializer.Deserialize<Product>(json);' },
      code: `using System.Text.Json;

string json = """{"name":"Laptop","price":55000}""";
var a = JsonSerializer.Deserialize<Product>(json)!;
Console.WriteLine(a.Name ?? "null");
Console.WriteLine(a.Price);

var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
var b = JsonSerializer.Deserialize<Product>(json, opts)!;
Console.WriteLine(b.Name);
Console.WriteLine(b.Price);

class Product { public string? Name { get; set; } public int Price { get; set; } }`,
      expected: `null
0
Laptop
55000`,
      explain: 'Property matching is **case-sensitive** by default, so `name` does not fill `Name` and the properties keep their defaults (null, 0). With `PropertyNameCaseInsensitive = true` the values are read. (`JsonSerializerDefaults.Web`, used by ASP.NET Core, turns this on.)',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Make the property \`Password\` **never** appear in the JSON output. Write the attribute:
\`______\`
\`public string Password { get; set; }\``,
      example: { title: 'renaming in JSON', code: `[JsonPropertyName("full_name")]
public string FullName { get; set; }` },
      accept: ['[JsonIgnore]', '[JsonIgnore()]', '[System.Text.Json.Serialization.JsonIgnore]'],
      caseSensitive: true,
      explain: '`[JsonIgnore]` (namespace `System.Text.Json.Serialization`) skips the property when serializing and deserializing. Never rely on the client to drop sensitive fields; better still, use a DTO without them.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Attributes control names and nulls. What does this print?',
      example: { title: 'JsonPropertyName', code: '[JsonPropertyName("order_id")] public int Id { get; set; }' },
      code: `using System.Text.Json;
using System.Text.Json.Serialization;

var o = new Order { Id = 101, Customer = "Ravi", Coupon = null, Secret = "x" };
Console.WriteLine(JsonSerializer.Serialize(o));

class Order
{
    [JsonPropertyName("order_id")] public int Id { get; set; }
    public string Customer { get; set; } = "";
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] public string? Coupon { get; set; }
    [JsonIgnore] public string Secret { get; set; } = "";
}`,
      expected: `{"order_id":101,"Customer":"Ravi"}`,
      explain: '`Id` is renamed to `order_id`. `Coupon` is null and marked `WhenWritingNull`, so it is skipped. `Secret` is always ignored. Only two properties remain.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Deserialize the JSON string \`json\` into a \`List<Student>\`:
\`var list = JsonSerializer.______(json);\``,
      example: { title: 'deserialize a single object', code: 'var s = JsonSerializer.Deserialize<Student>(json);' },
      accept: ['Deserialize<List<Student>>'],
      acceptRegex: ['^Deserialize\\s*<\\s*List\\s*<\\s*Student\\s*>\\s*>$'],
      caseSensitive: true,
      explain: 'The target type goes in the generic argument: `Deserialize<List<Student>>(json)` for a JSON array. Using `Deserialize<Student>` on an array throws a `JsonException`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about System.Text.Json are TRUE? Select all that apply.',
      options: ['`WriteIndented = true` produces pretty-printed JSON', 'It is built into .NET (no NuGet package needed in .NET Core 3.0+)', 'By default it serializes private fields', 'Enums are written as numbers unless you add `JsonStringEnumConverter`', 'Reference loops (Order ↔ Customer) are handled automatically without any option'],
      answers: [0, 1, 3],
      explain: 'Pretty printing uses `WriteIndented`. The library ships with .NET. Only **public** properties are serialized by default. Enums become numbers unless you add `JsonStringEnumConverter`. Cycles throw unless you set `ReferenceHandler.IgnoreCycles` (or `Preserve`), a common EF Core navigation-property problem.',
    },
  ],
};
