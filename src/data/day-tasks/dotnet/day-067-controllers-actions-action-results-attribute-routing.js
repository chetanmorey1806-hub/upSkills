export default {
  lesson: 'day-067-controllers-actions-action-results-attribute-routing',
  minutes: 30,
  intro: 'Write controller actions that return the right IActionResult (View, Json, Ok, NotFound, RedirectToAction) and map URLs with attribute routing.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'After saving a form in `Create` (POST), which result follows the **Post-Redirect-Get** pattern?',
      options: ['return View();', 'return RedirectToAction("Index");', 'return Json(student);', 'return Content("Saved");'],
      answer: 1,
      explain: '`RedirectToAction` sends a **302** so the browser loads Index with a GET. If you return a View directly after a POST, pressing F5 re-submits the form and creates a duplicate record.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which return types can an MVC action use? (choose all that apply)',
      options: ['IActionResult', 'ActionResult<Student>', 'Task<IActionResult>', 'string', 'void only'],
      answers: [0, 1, 2, 3],
      explain: '`IActionResult` lets one action return different results (View, NotFound...). `ActionResult<T>` adds a typed body for APIs. `Task<...>` is for async actions. Returning a plain `string` works too (sent as text). An action CAN be void, but "void only" is wrong - it is rarely what you want.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute so this controller\'s base URL becomes `/api/students` automatically from the class name:\n```\n[______]\npublic class StudentsController : Controller { }\n```',
      example: { title: 'a fixed route on an action', code: '[Route("reports/monthly")]\npublic IActionResult Monthly() => View();' },
      accept: ['Route("api/[controller]")'],
      acceptRegex: ['^Route\\(\\s*"/?api/\\[controller\\]/?"\\s*\\)$'],
      explain: 'The `[controller]` token is replaced with the class name minus "Controller", so the route stays correct if you rename the class. Hard-coding "api/students" also works but can drift out of sync.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Which **status code** does each request get? Type one per line:\n1. `GET /students/details/2`\n2. `GET /students/details/7`\n3. `GET /students/details/abc`',
      example: { title: 'a route constraint', code: '[HttpGet("orders/{id:int}")]  // "abc" does not match → no action found' },
      code: `[Route("students")]
public class StudentsController : Controller
{
    private static readonly Dictionary<int, string> Data = new() { [1] = "Asha", [2] = "Ravi" };

    [HttpGet("details/{id:int}")]
    public IActionResult Details(int id)
    {
        if (!Data.ContainsKey(id)) return NotFound();
        return Ok(Data[id]);
    }
}`,
      expected: `200
404
404`,
      explain: 'Id 2 exists → `Ok` (200). Id 7 is a valid int but missing → `NotFound()` (404). "abc" fails the `:int` **route constraint**, so no action matches at all and routing returns 404 before your code runs.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Two actions are both named `Edit`. How does MVC know which one handles the form submit?',
      options: ['It picks the first method in the file', 'The POST one is marked [HttpPost] (and the GET one shows the form)', 'You must give them different names', 'By the number of views in the folder'],
      answer: 1,
      explain: 'Action selection uses the route **and** the HTTP verb. `[HttpGet] Edit(int id)` shows the form, `[HttpPost] Edit(Student s)` saves it. Without the attributes the request is ambiguous and throws `AmbiguousMatchException`.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same controller idea in Express.** Build the "products" controller:\n- `GET /products/:id` (id must be digits) → `200` `{ id, name }` or `404` `{ "error": "Not found" }`; a non-numeric id like `/products/abc` → `404` too\n- `GET /products/search?name=pen` → `200` array of products whose name contains the text (case-insensitive)\n- `GET /old-products` → redirect (`302`) to `/products/search?name=`',
      example: { title: 'redirect in Express', code: 'res.redirect("/login"); // 302 by default' },
      starter: 'const express = require("express");\nconst app = express();\n\nconst products = [{ id: 1, name: "Blue Pen" }, { id: 2, name: "Notebook" }, { id: 3, name: "Red Pen" }];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\nconst products = [{ id: 1, name: "Blue Pen" }, { id: 2, name: "Notebook" }, { id: 3, name: "Red Pen" }];\n\napp.get("/products/search", (req, res) => {\n  const q = String(req.query.name || "").toLowerCase();\n  res.json(products.filter((p) => p.name.toLowerCase().includes(q)));\n});\n\napp.get("/products/:id", (req, res) => {\n  if (!/^\\d+$/.test(req.params.id)) return res.status(404).json({ error: "Not found" });\n  const p = products.find((x) => x.id === Number(req.params.id));\n  if (!p) return res.status(404).json({ error: "Not found" });\n  res.json(p);\n});\n\napp.get("/old-products", (req, res) => res.redirect("/products/search?name="));\n\napp.listen(3000);\n',
      tests: [
        { name: 'GET one → 200', steps: [{ method: 'GET', url: '/products/2', expect: { status: 200, json: { id: 2, name: 'Notebook' } } }] },
        { name: 'GET missing → 404', steps: [{ method: 'GET', url: '/products/9', expect: { status: 404, json: { error: 'Not found' } } }] },
        { name: 'GET non-numeric → 404', steps: [{ method: 'GET', url: '/products/abc', expect: { status: 404 } }] },
        { name: 'search pen → 2 items', steps: [{ method: 'GET', url: '/products/search?name=PEN', expect: { status: 200, length: 2 } }] },
        { name: 'redirect → 302', steps: [{ method: 'GET', url: '/old-products', expect: { status: 302 } }] },
      ],
      explain: 'Route order matters in Express: `/products/search` must be declared before `/products/:id`, otherwise "search" is treated as an id. In ASP.NET Core attribute routing the `{id:int}` constraint solves the same problem, and `RedirectToAction` produces the 302.',
    },
  ],
};
