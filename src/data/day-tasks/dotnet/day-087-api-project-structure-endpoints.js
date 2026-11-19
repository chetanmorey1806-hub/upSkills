export default {
  lesson: 'day-087-api-project-structure-endpoints',
  minutes: 30,
  intro: 'Organise a Web API project (Controllers, Models, DTOs, Services, Data) and map endpoints with [HttpGet], [HttpPost], route templates and constraints.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the base class every API controller should inherit from:\n`public class ProductsController : ______`',
      example: { title: 'an MVC controller for comparison', code: 'public class HomeController : Controller' },
      accept: ['ControllerBase'],
      caseSensitive: true,
      explain: '`ControllerBase` gives API helpers (`Ok`, `NotFound`, `CreatedAtAction`, `BadRequest`) without the view features of `Controller`.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Which action handles each request? Type the method name, or `404` when nothing matches, one per line:\n1. `GET /api/products`\n2. `GET /api/products/5`\n3. `GET /api/products/category/books`\n4. `POST /api/products`\n5. `GET /api/products/abc`',
      example: { title: 'combining routes', code: '[Route("api/orders")] + [HttpGet("{id:int}")]  →  GET /api/orders/12' },
      code: `[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    [HttpGet]                         public IActionResult GetAll() => Ok();
    [HttpGet("{id:int}")]             public IActionResult GetById(int id) => Ok();
    [HttpGet("category/{name}")]      public IActionResult ByCategory(string name) => Ok();
    [HttpPost]                        public IActionResult Create(ProductDto dto) => Ok();
}`,
      expected: `GetAll
GetById
ByCategory
Create
404`,
      explain: 'The controller route and the action template are combined. `{id:int}` only matches digits, so `/api/products/abc` matches nothing → 404. The same URL with different verbs (GET vs POST) maps to different actions.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'In a clean API project, which folder/class responsibilities are correct? (choose all that apply)',
      options: [
        'Controllers: receive HTTP requests and return results - thin, no SQL',
        'Services: business rules (e.g. discount, fee calculation)',
        'Data: the DbContext and migrations',
        'DTOs: the shapes of request and response bodies',
        'wwwroot: C# business logic',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Separating concerns keeps controllers small and logic testable. wwwroot is only for static files (images, a built React app) - never code.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute so this action handles `DELETE /api/products/5`:\n```\n[______]\npublic IActionResult Delete(int id) { ... }\n```',
      example: { title: 'an update endpoint', code: '[HttpPut("{id}")]\npublic IActionResult Update(int id, ProductDto dto) { ... }' },
      accept: ['HttpDelete("{id}")', 'HttpDelete("{id:int}")'],
      acceptRegex: ['^HttpDelete\\(\\s*"\\{id(:int)?\\}"\\s*\\)$'],
      caseSensitive: true,
      explain: 'The verb attribute plus the template `{id}` adds `/5` after the controller route. Forgetting the template makes the action match only `DELETE /api/products` (no id).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In .NET 6+ Program.cs, which pair of lines enables attribute-routed API controllers?',
      options: ['builder.Services.AddControllers(); ... app.MapControllers();', 'builder.Services.AddRazorPages(); ... app.MapRazorPages();', 'app.UseStaticFiles(); ... app.UseRouting();', 'builder.Services.AddMvc(); ... app.MapDefaultControllerRoute();'],
      answer: 0,
      explain: '`AddControllers()` registers controller services (without views); `MapControllers()` maps all attribute routes. APIs do not need a conventional route.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same endpoint table in Express.** Implement exactly these endpoints:\n- `GET /api/products` → all products\n- `GET /api/products/:id` (digits only) → one product or `404`\n- `GET /api/products/category/:name` → products of that category (case-insensitive)\n- `POST /api/products` → `201` with `{ id: 4, ...body }`\n- `GET /api/products/abc` → `404` (non-numeric id)',
      example: { title: 'a digits-only route in Express 5', code: 'app.get("/api/orders/:id", (req, res) => {\n  if (!/^\\d+$/.test(req.params.id)) return res.status(404).end();\n  ...\n});' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst products = [\n  { id: 1, name: "C# Book", category: "Books" },\n  { id: 2, name: "Mouse", category: "Electronics" },\n  { id: 3, name: "SQL Book", category: "Books" },\n];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst products = [\n  { id: 1, name: "C# Book", category: "Books" },\n  { id: 2, name: "Mouse", category: "Electronics" },\n  { id: 3, name: "SQL Book", category: "Books" },\n];\n\napp.get("/api/products", (req, res) => res.json(products));\n\napp.get("/api/products/category/:name", (req, res) => {\n  const n = req.params.name.toLowerCase();\n  res.json(products.filter((p) => p.category.toLowerCase() === n));\n});\n\napp.get("/api/products/:id", (req, res) => {\n  if (!/^\\d+$/.test(req.params.id)) return res.status(404).json({ error: "Not found" });\n  const p = products.find((x) => x.id === Number(req.params.id));\n  if (!p) return res.status(404).json({ error: "Not found" });\n  res.json(p);\n});\n\napp.post("/api/products", (req, res) => {\n  const p = { id: products.length + 1, ...req.body };\n  products.push(p);\n  res.status(201).json(p);\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'GET all', steps: [{ method: 'GET', url: '/api/products', expect: { status: 200, length: 3 } }] },
        { name: 'GET by id', steps: [{ method: 'GET', url: '/api/products/2', expect: { status: 200, json: { name: 'Mouse' } } }] },
        { name: 'GET by category', steps: [{ method: 'GET', url: '/api/products/category/books', expect: { status: 200, length: 2 } }] },
        { name: 'POST → 201', steps: [{ method: 'POST', url: '/api/products', body: { name: 'Pen', category: 'Stationery' }, expect: { status: 201, json: { id: 4, name: 'Pen' } } }] },
        { name: 'non-numeric id → 404', steps: [{ method: 'GET', url: '/api/products/abc', expect: { status: 404 } }] },
      ],
      explain: 'An endpoint table (verb + URL + result) is the contract between backend and frontend. The digits check plays the role of the `{id:int}` route constraint so that text segments never reach the id lookup.',
    },
  ],
};
