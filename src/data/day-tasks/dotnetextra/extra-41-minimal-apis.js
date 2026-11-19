export default {
  lesson: 'extra-41-minimal-apis',
  minutes: 25,
  intro: 'Build lightweight HTTP endpoints with MapGet/MapPost, route parameters, Results helpers and route groups.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Map an endpoint that answers **GET /students/{id}**:
\`app.______("/students/{id:int}", (int id) => ...);\``,
      example: { title: 'POST endpoint', code: 'app.MapPost("/students", (Student s) => Results.Created($"/students/{s.Id}", s));' },
      accept: ['MapGet'],
      caseSensitive: true,
      explain: '`MapGet`, `MapPost`, `MapPut`, `MapDelete` (and `MapPatch`) register a handler for that HTTP method and route. `{id:int}` binds the route value to the `int id` parameter and only matches numbers.',
    },
    {
      type: 'output',
      mins: 4,
      q: `The minimal API below is running. The client sends these requests in order. Write the **status code** of each response, one per line:
1. \`GET /products/2\`
2. \`GET /products/9\`
3. \`POST /products\` with body \`{"id":3,"name":"Bag","price":650}\`
4. \`GET /products/abc\``,
      example: { title: 'Results helpers', code: `Results.Ok(x)        // 200
Results.NotFound()   // 404
Results.Created(...) // 201` },
      code: `var app = WebApplication.Create(args);
var products = new List<Product> { new(1, "Pen", 20), new(2, "Notebook", 60) };

app.MapGet("/products/{id:int}", (int id) =>
{
    var p = products.FirstOrDefault(x => x.Id == id);
    return p is null ? Results.NotFound() : Results.Ok(p);
});

app.MapPost("/products", (Product p) =>
{
    products.Add(p);
    return Results.Created($"/products/{p.Id}", p);
});

app.Run();

record Product(int Id, string Name, int Price);`,
      expected: `200
404
201
404`,
      explain: 'Product 2 exists → 200 OK. Product 9 does not → 404. The POST adds the product and returns `Results.Created` → 201 with a Location header. `/products/abc` does not satisfy the `{id:int}` constraint, so **no endpoint matches** and routing returns 404 (not 400).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What JSON body does `GET /products/1` return for the API above? (exact, compact)',
      example: { title: 'Web defaults', text: 'Minimal APIs serialize with `JsonSerializerDefaults.Web`: property names become **camelCase**.' },
      code: `record Product(int Id, string Name, int Price);
// products contains new(1, "Pen", 20)
// GET /products/1  →  Results.Ok(p)`,
      expected: `{"id":1,"name":"Pen","price":20}`,
      explain: 'ASP.NET Core uses System.Text.Json with web defaults: camelCase names, compact output. So `Id`, `Name`, `Price` become `id`, `name`, `price`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Group all \`/api/orders\` endpoints so the prefix is written once:
\`var orders = app.______("/api/orders");\`
\`orders.MapGet("/", GetAll);\``,
      example: { title: 'group with shared settings', code: `var admin = app.MapGroup("/admin").RequireAuthorization("AdminOnly");
admin.MapGet("/users", ListUsers);` },
      accept: ['MapGroup'],
      caseSensitive: true,
      explain: '`MapGroup(prefix)` returns a `RouteGroupBuilder`; endpoints added to it share the prefix and any conventions like `RequireAuthorization()` or `WithTags()`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'In a minimal API handler `(int id, Product body, IProductService svc, HttpContext ctx) => ...`, where do the values come from? Select all CORRECT statements.',
      options: ['`id` from the route (or query string)', '`body` from the JSON request body', '`svc` from the dependency injection container', '`ctx` must be passed by the client', 'All four come from the query string'],
      answers: [0, 1, 2],
      explain: 'Minimal APIs infer binding sources: simple types from route/query, complex types from the JSON body, registered services from DI, and special types like `HttpContext` or `CancellationToken` are provided by the framework.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When would you choose **controllers** over minimal APIs?',
      options: ['Never; controllers are removed in .NET 8', 'For large APIs that rely on filters, model binding conventions, or the MVC structure many teams know', 'Only for APIs that return HTML', 'When you need dependency injection'],
      answer: 1,
      explain: 'Both are fully supported. Minimal APIs are concise and fast for small/medium services; controllers organise big APIs with filters, attributes and conventions. DI works in both.',
    },
  ],
};
