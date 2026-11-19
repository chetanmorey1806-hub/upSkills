export default {
  lesson: 'day-089-put-patch-delete-apis',
  minutes: 32,
  intro: 'Update resources with PUT (full replace) and PATCH (partial change), delete them with DELETE, and read ids from route parameters with the correct status codes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'The client wants to change **only** the phone number of employee 4. Which request fits REST semantics best?',
      options: ['PUT /api/employees/4 with only { "phone": "98..." }', 'PATCH /api/employees/4 with { "phone": "98..." }', 'POST /api/employees/4/phone/update', 'DELETE then POST the employee again'],
      answer: 1,
      explain: '**PATCH** = partial update. **PUT** replaces the whole resource, so a PUT with only the phone would (correctly implemented) clear the other fields.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Type the **status code** of each request, one per line:\n1. `PUT /api/employees/1` with body `{"id":1,"name":"Asha P","salary":60000}`\n2. `PUT /api/employees/2` with body `{"id":3,"name":"X","salary":1}`\n3. `DELETE /api/employees/9`\n4. `DELETE /api/employees/1`',
      example: { title: 'common update rules', code: 'id in URL ≠ id in body → 400\nnot found              → 404\nupdated / deleted      → 204' },
      code: `[HttpPut("{id}")]
public IActionResult Update(int id, Employee e)
{
    if (id != e.Id) return BadRequest();
    var existing = _repo.Find(id);
    if (existing is null) return NotFound();
    existing.Name = e.Name; existing.Salary = e.Salary;
    return NoContent();
}

[HttpDelete("{id}")]
public IActionResult Delete(int id)
{
    var existing = _repo.Find(id);
    if (existing is null) return NotFound();
    _repo.Remove(existing);
    return NoContent();
}
// employees with ids 1, 2 and 3 exist`,
      expected: `204
400
404
204`,
      explain: 'Request 2 has id 2 in the URL but 3 in the body → 400 Bad Request (a guard against updating the wrong record). 9 does not exist → 404. Successful updates and deletes return **204 No Content**.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute for the partial-update endpoint `PATCH /api/employees/{id}`:\n`[______]`',
      example: { title: 'the full-update endpoint', code: '[HttpPut("{id}")]' },
      accept: ['HttpPatch("{id}")', 'HttpPatch("{id:int}")'],
      acceptRegex: ['^HttpPatch\\(\\s*"\\{id(:int)?\\}"\\s*\\)$'],
      caseSensitive: true,
      explain: '`[HttpPatch]` plus the `{id}` template. The body is often a small DTO with nullable properties, or a `JsonPatchDocument<T>` (RFC 6902 operations like `{ "op": "replace", "path": "/phone", "value": "..." }`).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'PUT is idempotent: sending the same PUT twice gives the same result',
        'DELETE of an id that does not exist should return 404 (or 204 if you treat it as idempotent success - but be consistent)',
        'A successful DELETE commonly returns 204 No Content',
        'Route parameters like {id} are bound to the action parameter with the same name',
        'PATCH must always send the whole object',
      ],
      answers: [0, 1, 2, 3],
      explain: 'PUT and DELETE are idempotent; PATCH sends only changes. `{id}` binds by name to `int id`. Document your choice for deleting missing ids and keep it consistent across the API.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 12,
      q: '**The same update/delete API in Express.**\n- `PUT /api/employees/:id` → `400` `{ "error": "Id mismatch" }` if `body.id` differs from the URL id; `404` if missing; otherwise replace `name` and `salary` and return `204`\n- `PATCH /api/employees/:id` → change only the fields present in the body (`name`, `salary`), return `200` with the employee; `404` if missing\n- `DELETE /api/employees/:id` → `204` or `404`\n- `GET /api/employees/:id` → `200` or `404` (for checking)',
      example: { title: 'only update sent fields', code: 'if (req.body.city !== undefined) item.city = req.body.city;' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst employees = [{ id: 1, name: "Asha", salary: 55000 }, { id: 2, name: "Ravi", salary: 48000 }];\nconst find = (id) => employees.find((e) => e.id === Number(id));\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst employees = [{ id: 1, name: "Asha", salary: 55000 }, { id: 2, name: "Ravi", salary: 48000 }];\nconst find = (id) => employees.find((e) => e.id === Number(id));\n\napp.get("/api/employees/:id", (req, res) => {\n  const e = find(req.params.id);\n  if (!e) return res.status(404).json({ error: "Not found" });\n  res.json(e);\n});\n\napp.put("/api/employees/:id", (req, res) => {\n  if (Number(req.body.id) !== Number(req.params.id)) return res.status(400).json({ error: "Id mismatch" });\n  const e = find(req.params.id);\n  if (!e) return res.status(404).json({ error: "Not found" });\n  e.name = req.body.name;\n  e.salary = req.body.salary;\n  res.status(204).end();\n});\n\napp.patch("/api/employees/:id", (req, res) => {\n  const e = find(req.params.id);\n  if (!e) return res.status(404).json({ error: "Not found" });\n  if (req.body.name !== undefined) e.name = req.body.name;\n  if (req.body.salary !== undefined) e.salary = req.body.salary;\n  res.json(e);\n});\n\napp.delete("/api/employees/:id", (req, res) => {\n  const i = employees.findIndex((e) => e.id === Number(req.params.id));\n  if (i === -1) return res.status(404).json({ error: "Not found" });\n  employees.splice(i, 1);\n  res.status(204).end();\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'PUT → 204 and saved', steps: [{ method: 'PUT', url: '/api/employees/1', body: { id: 1, name: 'Asha P', salary: 60000 }, expect: { status: 204 } }, { method: 'GET', url: '/api/employees/1', expect: { json: { name: 'Asha P', salary: 60000 } } }] },
        { name: 'PUT id mismatch → 400', steps: [{ method: 'PUT', url: '/api/employees/2', body: { id: 3, name: 'X', salary: 1 }, expect: { status: 400, json: { error: 'Id mismatch' } } }] },
        { name: 'PUT missing → 404', steps: [{ method: 'PUT', url: '/api/employees/9', body: { id: 9, name: 'X', salary: 1 }, expect: { status: 404 } }] },
        { name: 'PATCH only salary', steps: [{ method: 'PATCH', url: '/api/employees/2', body: { salary: 50000 }, expect: { status: 200, json: { id: 2, name: 'Ravi', salary: 50000 } } }] },
        { name: 'DELETE → 204 then 404', steps: [{ method: 'DELETE', url: '/api/employees/2', expect: { status: 204 } }, { method: 'GET', url: '/api/employees/2', expect: { status: 404 } }, { method: 'DELETE', url: '/api/employees/2', expect: { status: 404 } }] },
      ],
      explain: 'Same rules as the C# controller: validate the id, look the item up (404), then change and return 204 (PUT/DELETE) or the updated item (PATCH). Checking `!== undefined` (not truthiness) lets PATCH set a value to 0 or "".',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the return statement for a successful DELETE that sends **no body**:\n`return ______;`',
      example: { title: 'success with a body', code: 'return Ok(updatedEmployee);' },
      accept: ['NoContent()', 'NoContent();'],
      caseSensitive: true,
      explain: '`NoContent()` → **204**. The client already knows what it deleted, so no body is needed. Returning `Ok()` (200 with empty body) also works but 204 states the intent clearly.',
    },
  ],
};
