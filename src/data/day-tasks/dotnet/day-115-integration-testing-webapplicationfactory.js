export default {
  lesson: 'day-115-integration-testing-webapplicationfactory',
  minutes: 35,
  intro: 'Test the whole API pipeline (routing, validation, auth, database) in memory with WebApplicationFactory and HttpClient, and replace real services for tests.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the interface so xUnit creates ONE in-memory test server shared by all tests in the class:\n```\npublic class StudentsApiTests : ______\n{\n    private readonly HttpClient _client;\n    public StudentsApiTests(WebApplicationFactory<Program> factory)\n        => _client = factory.CreateClient();\n}\n```',
      example: { title: 'making Program visible to the test project', code: 'public partial class Program { }  // at the end of Program.cs' },
      accept: ['IClassFixture<WebApplicationFactory<Program>>'],
      acceptRegex: ['^IClassFixture<\\s*WebApplicationFactory<\\s*Program\\s*>\\s*>$'],
      caseSensitive: true,
      explain: '`IClassFixture<T>` shares one `WebApplicationFactory<Program>` (an in-memory host of your real app) across the class. `CreateClient()` returns an `HttpClient` that talks to it without opening a network port.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main difference between a unit test and an integration test of an API?',
      options: [
        'Integration tests are written in JavaScript',
        'An integration test sends real HTTP requests through the whole pipeline (middleware, routing, model binding, filters, DB) instead of calling one class with mocks',
        'Unit tests are slower',
        'Integration tests cannot check status codes',
      ],
      answer: 1,
      explain: 'Unit tests prove the logic of one class; integration tests prove the pieces work **together** (e.g. a missing `[Authorize]` or a wrong route would pass unit tests but fail here).',
    },
    {
      type: 'output',
      mins: 5,
      q: 'These requests run in order against a fresh in-memory API (an empty in-memory database, `[ApiController]`, Name is `[Required]`). Type the status code of each, one per line.',
      example: { title: 'reading a response in a test', code: 'var res = await _client.GetAsync("/api/students/1");\nAssert.Equal(HttpStatusCode.NotFound, res.StatusCode);' },
      code: `var r1 = await _client.GetAsync("/api/students/1");
var r2 = await _client.PostAsJsonAsync("/api/students", new { name = "" });
var r3 = await _client.PostAsJsonAsync("/api/students", new { name = "Asha" });
var r4 = await _client.GetAsync("/api/students/1");
var r5 = await _client.DeleteAsync("/api/admin/students/1");   // [Authorize(Roles = "Admin")], no token

foreach (var r in new[] { r1, r2, r3, r4, r5 })
    Console.WriteLine((int)r.StatusCode);`,
      expected: `404
400
201
200
401`,
      explain: 'Empty DB → 404; empty Name fails `[Required]` → automatic 400; valid create → 201 (id 1); now id 1 exists → 200; the admin endpoint without a token → 401. One test exercises routing, validation, persistence and auth together.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which techniques are used with WebApplicationFactory? (choose all that apply)',
      options: [
        'Override ConfigureWebHost to replace the SQL Server DbContext with an in-memory/SQLite one',
        'Replace external services (email, payment) with fakes via services.RemoveAll / AddSingleton',
        'Use UseEnvironment("Testing") to load test settings',
        'Deploy the API to Azure before each test run',
        'Add a fake authentication handler to test [Authorize] endpoints with chosen roles',
      ],
      answers: [0, 1, 2, 4],
      explain: 'A custom `WebApplicationFactory<Program>` swaps infrastructure for test doubles while keeping the real pipeline. Tests must be self-contained and repeatable - no deployment needed.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**Make this API pass the integration tests.** (The grader runs the requests from the previous task against your Express app.)\n- `GET /api/students/:id` → `200` or `404`\n- `POST /api/students` → `400` `{ "errors": { "name": ["Name is required"] } }` when name is empty, else `201` with `{ id, name }` (ids start at 1)\n- `DELETE /api/admin/students/:id` → `401` without `Authorization` header; with header `Bearer admin-token` → `204`',
      example: { title: 'checking a header', code: 'if (req.headers.authorization !== "Bearer admin-token") return res.status(401).end();' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst students = [];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nlet students = [];\nlet nextId = 1;\n\napp.get("/api/students/:id", (req, res) => {\n  const s = students.find((x) => x.id === Number(req.params.id));\n  if (!s) return res.status(404).json({ error: "Not found" });\n  res.json(s);\n});\n\napp.post("/api/students", (req, res) => {\n  const name = (req.body.name || "").trim();\n  if (!name) return res.status(400).json({ errors: { name: ["Name is required"] } });\n  const s = { id: nextId++, name };\n  students.push(s);\n  res.status(201).json(s);\n});\n\napp.delete("/api/admin/students/:id", (req, res) => {\n  if (req.headers.authorization !== "Bearer admin-token") return res.status(401).json({ error: "Unauthorized" });\n  students = students.filter((s) => s.id !== Number(req.params.id));\n  res.status(204).end();\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'full flow', steps: [
          { method: 'GET', url: '/api/students/1', expect: { status: 404 } },
          { method: 'POST', url: '/api/students', body: { name: '' }, expect: { status: 400, json: { errors: { name: ['Name is required'] } } } },
          { method: 'POST', url: '/api/students', body: { name: 'Asha' }, expect: { status: 201, json: { id: 1, name: 'Asha' } } },
          { method: 'GET', url: '/api/students/1', expect: { status: 200, json: { name: 'Asha' } } },
          { method: 'DELETE', url: '/api/admin/students/1', expect: { status: 401 } },
        ] },
        { name: 'admin delete with token', steps: [
          { method: 'POST', url: '/api/students', body: { name: 'Ravi' } },
          { method: 'DELETE', url: '/api/admin/students/1', headers: { Authorization: 'Bearer admin-token' }, expect: { status: 204 } },
          { method: 'GET', url: '/api/students/1', expect: { status: 404 } },
        ] },
      ],
      explain: 'Each test starts a fresh server, sends real HTTP requests and checks status + body - the Express equivalent of `WebApplicationFactory` + `HttpClient`. A test like this immediately shows a missing auth check or a wrong status code.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: '**Assertion helper for API tests.** Write `assertProblem(res)` for a 400 response `{ status, body }`. Return an array of failure messages: `"Expected 400"` if status differs, `"Missing errors"` if `body.errors` is not an object, and `"Empty errors"` if it has no keys. Return `[]` when everything is fine.',
      example: { title: 'checking an object', code: 'const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);' },
      starter: 'function assertProblem(res) {\n  const fails = [];\n  // TODO\n  return fails;\n}\n',
      solution: 'function assertProblem(res) {\n  const fails = [];\n  if (res.status !== 400) fails.push("Expected 400");\n  const e = res.body && res.body.errors;\n  if (e === null || typeof e !== "object" || Array.isArray(e)) fails.push("Missing errors");\n  else if (Object.keys(e).length === 0) fails.push("Empty errors");\n  return fails;\n}\n',
      tests: [
        { call: 'assertProblem({ status: 400, body: { errors: { Name: ["Required"] } } })', expect: [] },
        { call: 'assertProblem({ status: 200, body: {} })', expect: ['Expected 400', 'Missing errors'] },
        { call: 'assertProblem({ status: 400, body: { errors: {} } })', expect: ['Empty errors'] },
      ],
      explain: 'Shared assertion helpers keep integration tests short and consistent. In C# you would read `await res.Content.ReadFromJsonAsync<ValidationProblemDetails>()` and assert on `Errors`.',
    },
  ],
};
