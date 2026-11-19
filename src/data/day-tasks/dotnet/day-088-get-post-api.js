export default {
  lesson: 'day-088-get-post-api',
  minutes: 32,
  intro: 'Build GET and POST endpoints: read query/route values, accept a JSON request body with [FromBody] and return 201 Created with a Location header.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In an `[ApiController]`, where does a **complex type** parameter like `Create(StudentDto dto)` get its value from by default?',
      options: ['The query string', 'The request body (JSON)', 'The route', 'Cookies'],
      answer: 1,
      explain: '`[ApiController]` infers `[FromBody]` for complex types and `[FromRoute]`/`[FromQuery]` for simple types. Only **one** parameter can come from the body.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the return statement so POST answers **201 Created** with a `Location` header pointing to `GetById` for the new student:\n`return ______(nameof(GetById), new { id = student.Id }, student);`',
      example: { title: 'other result helpers', code: 'return Ok(list);          // 200\nreturn NotFound();        // 404\nreturn BadRequest(errors); // 400' },
      accept: ['CreatedAtAction'],
      caseSensitive: true,
      explain: '`CreatedAtAction(actionName, routeValues, body)` builds the URL of the new resource (e.g. `/api/students/7`) into the `Location` header and sends the created object in the body.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The client sends `POST /api/students` with body `{"name":"Meera","city":"Mumbai"}`. The list already has 2 students. Type the **status code** (line 1), the **Location** header (line 2) and the **JSON body** (line 3, no spaces).',
      example: { title: 'what CreatedAtAction sends', code: 'HTTP/1.1 201 Created\nLocation: /api/orders/15\n{"id":15,...}' },
      code: `[HttpGet("{id}")]
public ActionResult<Student> GetById(int id) { ... }

[HttpPost]
public ActionResult<Student> Create(StudentDto dto)
{
    var s = new Student { Id = _students.Count + 1, Name = dto.Name, City = dto.City };
    _students.Add(s);
    return CreatedAtAction(nameof(GetById), new { id = s.Id }, s);
}
// [Route("api/students")] on the controller`,
      expected: `201
/api/students/3
{"id":3,"name":"Meera","city":"Mumbai"}`,
      explain: 'The new id is 2 + 1 = 3. `CreatedAtAction` returns **201**, the Location of the new resource (built from the GetById route) and the created object serialized in camelCase. (The real header contains the full URL, e.g. https://localhost:7001/api/students/3.)',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about GET and POST are TRUE? (choose all that apply)',
      options: [
        'GET requests should not have side effects (they only read)',
        'POST /api/students should return 201 for a new student',
        'Filters for a list such as ?city=Pune are sent in the query string and bound with [FromQuery]',
        'Passwords should be sent in GET query strings so they are logged',
        'Sending a POST body without Content-Type: application/json returns 415 Unsupported Media Type',
      ],
      answers: [0, 1, 2, 4],
      explain: 'GET reads (filters go in the query), POST creates (data in the body). Query strings appear in logs and browser history, so secrets never go there. Wrong/missing Content-Type → 415.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same GET/POST API in Express.**\n- `GET /api/students` → all students; with `?city=Pune` only students of that city (case-insensitive)\n- `GET /api/students/:id` → one student or `404`\n- `POST /api/students` with `{ name, city }` → `201`, the new student `{ id, name, city }` (ids continue at 3) and a `Location` header `/api/students/<id>`',
      example: { title: 'setting a header', code: 'res.set("Location", "/api/orders/" + order.id).status(201).json(order);' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst students = [{ id: 1, name: "Asha", city: "Pune" }, { id: 2, name: "Ravi", city: "Nagpur" }];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst students = [{ id: 1, name: "Asha", city: "Pune" }, { id: 2, name: "Ravi", city: "Nagpur" }];\nlet nextId = 3;\n\napp.get("/api/students", (req, res) => {\n  const city = req.query.city;\n  res.json(city ? students.filter((s) => s.city.toLowerCase() === String(city).toLowerCase()) : students);\n});\n\napp.get("/api/students/:id", (req, res) => {\n  const s = students.find((x) => x.id === Number(req.params.id));\n  if (!s) return res.status(404).json({ error: "Not found" });\n  res.json(s);\n});\n\napp.post("/api/students", (req, res) => {\n  const s = { id: nextId++, name: req.body.name, city: req.body.city };\n  students.push(s);\n  res.set("Location", "/api/students/" + s.id).status(201).json(s);\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'GET all', steps: [{ method: 'GET', url: '/api/students', expect: { status: 200, length: 2 } }] },
        { name: 'GET filtered by city', steps: [{ method: 'GET', url: '/api/students?city=pune', expect: { status: 200, json: [{ id: 1, name: 'Asha', city: 'Pune' }] } }] },
        { name: 'GET missing → 404', steps: [{ method: 'GET', url: '/api/students/5', expect: { status: 404 } }] },
        { name: 'POST → 201 then readable', steps: [{ method: 'POST', url: '/api/students', body: { name: 'Meera', city: 'Mumbai' }, expect: { status: 201, json: { id: 3, name: 'Meera', city: 'Mumbai' } } }, { method: 'GET', url: '/api/students/3', expect: { status: 200, json: { name: 'Meera' } } }] },
      ],
      explain: 'Query parameters filter a collection, the body carries the new data, and 201 + Location tells the client where the new resource lives - exactly what `[FromQuery]`, `[FromBody]` and `CreatedAtAction` do in ASP.NET Core.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the parameter attribute so `?city=Pune` binds to `city`:\n`public IActionResult GetAll([______] string? city) { ... }`',
      example: { title: 'a route value', code: 'public IActionResult Get([FromRoute] int id)' },
      accept: ['FromQuery'],
      caseSensitive: true,
      explain: '`[FromQuery]` reads the query string. With `[ApiController]` simple types are inferred from the route/query anyway, but writing the attribute documents your intent and is required for complex filter objects.',
    },
  ],
};
