export default {
  lesson: 'day-065-http-protocol-request-response',
  minutes: 30,
  intro: 'Read and write HTTP: request line, headers and body, the main methods (GET, POST, PUT, PATCH, DELETE) and the status codes every API must return correctly.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A client sends `POST /api/students` and the student is saved successfully. Which status code is the most correct response?',
      options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
      answer: 1,
      explain: '**201 Created** says a new resource was made; it usually comes with a `Location` header pointing to the new item (`/api/students/7`). 200 is fine for reads, 204 for success with no body (e.g. DELETE).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which HTTP methods are **idempotent** (sending the same request 5 times leaves the server in the same state as sending it once)? (choose all that apply)',
      options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH (when it appends to a list)'],
      answers: [0, 2, 3],
      explain: 'GET only reads, PUT replaces with the same data every time, and DELETE of an already deleted item changes nothing more. POST creates a new resource on every call. A PATCH that appends (e.g. "add 1 to stock") is not idempotent.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'The client sends a JSON body. Complete the request header that tells the server the body format:\n`______: application/json`',
      example: { title: 'a header that asks for a format', code: 'Accept: application/json' },
      accept: ['Content-Type'],
      explain: '`Content-Type` describes the body **being sent**; `Accept` says what format the client wants back. ASP.NET Core returns **415 Unsupported Media Type** for a `[FromBody]` parameter when Content-Type is missing or wrong.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Three requests hit this minimal API one after another. Type the **status codes** returned, one per line:\n1. `GET /api/courses/2`\n2. `GET /api/courses/9`\n3. `DELETE /api/courses/2`',
      example: { title: 'Results helpers and their codes', code: 'Results.Ok(x)       // 200\nResults.NotFound()  // 404\nResults.NoContent() // 204' },
      code: `var courses = new List<string> { "C#", "SQL", "React" };

app.MapGet("/api/courses/{id:int}", (int id) =>
    id >= 0 && id < courses.Count ? Results.Ok(courses[id]) : Results.NotFound());

app.MapDelete("/api/courses/{id:int}", (int id) =>
{
    if (id < 0 || id >= courses.Count) return Results.NotFound();
    courses.RemoveAt(id);
    return Results.NoContent();
});`,
      expected: `200
404
204`,
      explain: 'Index 2 exists ("React") → 200. Index 9 does not → 404. The delete succeeds and returns no body → 204 No Content. Returning 200 with an empty body or 500 for a missing item are common mistakes.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A logged-in student (valid token) calls an admin-only endpoint. Which status code fits?',
      options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
      answer: 2,
      explain: '**401** means "who are you?" (no/invalid credentials). **403** means "I know who you are, but you are not allowed". 400 is for invalid input.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same HTTP rules in Express.** Build a tiny course API with correct status codes:\n- `GET /api/courses` → `200` with the array\n- `GET /api/courses/:id` → `200` with the course, or `404` `{ "error": "Not found" }`\n- `POST /api/courses` with `{ title }` → `400` `{ "error": "Title is required" }` when title is missing/empty, else `201` with the new course `{ id, title }` (next id = 3)\n- `DELETE /api/courses/:id` → `204` (no body) or `404`',
      example: { title: 'status + json in one line', code: 'res.status(201).json(newItem);\nres.status(204).end();' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nlet courses = [{ id: 1, title: "C#" }, { id: 2, title: "SQL Server" }];\n\n// TODO: routes\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nlet courses = [{ id: 1, title: "C#" }, { id: 2, title: "SQL Server" }];\nlet nextId = 3;\n\napp.get("/api/courses", (req, res) => res.json(courses));\n\napp.get("/api/courses/:id", (req, res) => {\n  const c = courses.find((x) => x.id === Number(req.params.id));\n  if (!c) return res.status(404).json({ error: "Not found" });\n  res.json(c);\n});\n\napp.post("/api/courses", (req, res) => {\n  const title = (req.body.title || "").trim();\n  if (!title) return res.status(400).json({ error: "Title is required" });\n  const c = { id: nextId++, title };\n  courses.push(c);\n  res.status(201).json(c);\n});\n\napp.delete("/api/courses/:id", (req, res) => {\n  const i = courses.findIndex((x) => x.id === Number(req.params.id));\n  if (i === -1) return res.status(404).json({ error: "Not found" });\n  courses.splice(i, 1);\n  res.status(204).end();\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'GET all → 200', steps: [{ method: 'GET', url: '/api/courses', expect: { status: 200, length: 2 } }] },
        { name: 'GET missing → 404', steps: [{ method: 'GET', url: '/api/courses/42', expect: { status: 404, json: { error: 'Not found' } } }] },
        { name: 'POST without title → 400', steps: [{ method: 'POST', url: '/api/courses', body: { title: '' }, expect: { status: 400, json: { error: 'Title is required' } } }] },
        { name: 'POST → 201 with id 3', steps: [{ method: 'POST', url: '/api/courses', body: { title: 'React' }, expect: { status: 201, json: { id: 3, title: 'React' } } }] },
        { name: 'DELETE → 204, then 404', steps: [{ method: 'DELETE', url: '/api/courses/1', expect: { status: 204 } }, { method: 'GET', url: '/api/courses/1', expect: { status: 404 } }] },
      ],
      explain: 'Status codes are part of the API contract: clients (React, mobile apps) branch on them. 201 for create, 204 for delete without a body, 400 for bad input and 404 for a missing id - exactly what your ASP.NET Core controllers will return with `Created`, `NoContent`, `BadRequest` and `NotFound`.',
    },
  ],
};
