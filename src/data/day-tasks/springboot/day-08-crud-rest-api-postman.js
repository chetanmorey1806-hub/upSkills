export default {
  lesson: 'day-08-crud-rest-api-postman',
  minutes: 28,
  intro: 'Map CRUD to REST, trace an in-memory Student API, write Postman tests and build the same CRUD idea in Express.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which CRUD → REST mappings are correct? (choose all that apply)',
      options: ['Create → POST /api/students', 'Read all → GET /api/students', 'Update → PUT /api/students/{id}', 'Delete → GET /api/students/{id}/delete', 'Read one → GET /api/students/{id}'],
      answers: [0, 1, 2, 4],
      explain: 'Create = POST on the collection, Read = GET, Update = PUT (or PATCH) on one item, Delete = DELETE on one item. Deleting with GET is wrong: GET must be safe, and browsers/crawlers may call it automatically.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The in-memory service starts with an empty list and `nextId = 1`. The controller returns 201 for create, 200 for get/update, 204 for delete and 404 when the id is missing. Type the status code of each request, one per line:\n1. `POST /api/students` (Asha)\n2. `POST /api/students` (Ravi)\n3. `GET /api/students/2`\n4. `DELETE /api/students/1`\n5. `PUT /api/students/1`\n6. `GET /api/students/3`',
      example: { title: 'the service pattern', code: 'public Student findById(Long id) {\n  return map.get(id); // null → controller returns 404\n}' },
      code: `private final Map<Long, Student> store = new HashMap<>();
private long nextId = 1;
public Student save(Student s) { s.setId(nextId++); store.put(s.getId(), s); return s; }
public Optional<Student> find(Long id) { return Optional.ofNullable(store.get(id)); }
public boolean delete(Long id) { return store.remove(id) != null; }`,
      expected: '201\n201\n200\n204\n404\n404',
      explain: 'Asha gets id 1 and Ravi id 2 (both 201). GET 2 exists → 200. DELETE 1 removes Asha → 204. PUT 1 now finds nothing → 404. Id 3 was never created → 404. Ids are not reused after delete.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In Postman you saved `http://localhost:8080` as the environment variable `baseUrl`. How do you write the request URL for the students endpoint using it?',
      example: { title: 'another variable', code: 'Authorization: Bearer {{token}}' },
      accept: ['{{baseUrl}}/api/students'],
      caseSensitive: true,
      explain: 'Postman variables use **double curly braces**: `{{baseUrl}}/api/students`. Switching the environment (local → server) changes every request at once. Variable names are case-sensitive.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the Postman **Tests** script line that checks the POST returned status 201:\n```\npm.test("Created", () => {\n    ???\n});\n```',
      example: { title: 'checking the body', code: 'const body = pm.response.json();\npm.expect(body.name).to.eql("Asha");' },
      accept: ['pm.response.to.have.status(201);', 'pm.response.to.have.status(201)', 'pm.expect(pm.response.code).to.eql(201);', 'pm.expect(pm.response.code).to.eql(201)', 'pm.expect(pm.response.code).to.equal(201);', 'pm.expect(pm.response.code).to.equal(201)'],
      explain: '`pm.response.to.have.status(201)` is the usual assertion. Tests run after each request, so a collection run becomes an automatic regression test of your CRUD API.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the service method so a missing student throws `StudentNotFoundException` instead of returning null:\n```\npublic Student getById(Long id) {\n    return repo.findById(id)\n               ???;\n}\n```',
      example: { title: 'orElse with a default', code: 'repo.findById(id).orElse(null)' },
      accept: ['.orElseThrow(() -> new StudentNotFoundException(id))', '.orElseThrow(() -> new StudentNotFoundException(id));', '.orElseThrow(() -> new StudentNotFoundException("Student not found: " + id))', '.orElseThrow(() -> new StudentNotFoundException("Student not found"))'],
      acceptRegex: ['^\\.orElseThrow\\(\\s*\\(\\)\\s*->\\s*new\\s+StudentNotFoundException\\s*\\(.*\\)\\s*\\)\\s*;?$'],
      explain: '`orElseThrow(supplier)` returns the value or throws the exception you create. The controller (or a global handler on Day 10) turns it into a **404**. Returning `null` pushes NullPointerExceptions into the controller.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same CRUD idea in Express**: build the update part of the Student API.\n- `GET /api/students/:id` → `200` or `404` `{ "error": "Student not found" }`\n- `PUT /api/students/:id` with `{ name, course }` → replace those fields, return `200` with the updated student; `404` if missing\n- `PATCH /api/students/:id` → change **only** the fields sent, return `200`; `404` if missing',
      example: { title: 'merging fields', code: 'Object.assign(student, req.body); // copies only the sent fields' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst students = [\n  { id: 1, name: "Asha", course: "Java" },\n  { id: 2, name: "Ravi", course: "Spring Boot" },\n];\n\n// TODO: GET one, PUT, PATCH\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst students = [\n  { id: 1, name: "Asha", course: "Java" },\n  { id: 2, name: "Ravi", course: "Spring Boot" },\n];\nconst find = (id) => students.find((s) => s.id === Number(id));\n\napp.get("/api/students/:id", (req, res) => {\n  const s = find(req.params.id);\n  if (!s) return res.status(404).json({ error: "Student not found" });\n  res.json(s);\n});\n\napp.put("/api/students/:id", (req, res) => {\n  const s = find(req.params.id);\n  if (!s) return res.status(404).json({ error: "Student not found" });\n  s.name = req.body.name;\n  s.course = req.body.course;\n  res.json(s);\n});\n\napp.patch("/api/students/:id", (req, res) => {\n  const s = find(req.params.id);\n  if (!s) return res.status(404).json({ error: "Student not found" });\n  if (req.body.name !== undefined) s.name = req.body.name;\n  if (req.body.course !== undefined) s.course = req.body.course;\n  res.json(s);\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'GET missing → 404', steps: [{ method: 'GET', url: '/api/students/9', expect: { status: 404, json: { error: 'Student not found' } } }] },
        { name: 'PUT replaces fields', steps: [{ method: 'PUT', url: '/api/students/1', body: { name: 'Asha Patil', course: 'Spring Boot' }, expect: { status: 200, json: { id: 1, name: 'Asha Patil', course: 'Spring Boot' } } }, { method: 'GET', url: '/api/students/1', expect: { json: { name: 'Asha Patil', course: 'Spring Boot' } } }] },
        { name: 'PUT missing → 404', steps: [{ method: 'PUT', url: '/api/students/9', body: { name: 'X', course: 'Y' }, expect: { status: 404 } }] },
        { name: 'PATCH changes only sent fields', steps: [{ method: 'PATCH', url: '/api/students/2', body: { course: 'MySQL' }, expect: { status: 200, json: { id: 2, name: 'Ravi', course: 'MySQL' } } }] },
        { name: 'PATCH missing → 404', steps: [{ method: 'PATCH', url: '/api/students/9', body: { course: 'MySQL' }, expect: { status: 404 } }] },
      ],
      explain: 'PUT replaces the resource, PATCH changes only what was sent - the same rule your Spring `@PutMapping`/`@PatchMapping` methods follow. Always look the item up first and return **404** when it is missing instead of creating it silently.',
    },
  ],
};
