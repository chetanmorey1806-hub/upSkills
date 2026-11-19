export default {
  lesson: 'day-086-rest-api-introduction',
  minutes: 30,
  intro: 'Learn the REST principles (resources, URIs, HTTP verbs, statelessness, JSON representations) and how a Web API differs from an MVC app.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which URL design follows REST conventions for "get the marks of student 7"?',
      options: ['GET /getStudentMarks?id=7', 'GET /api/students/7/marks', 'POST /api/students/marks/get/7', 'GET /api/student_marks_fetch/7'],
      answer: 1,
      explain: 'REST URLs name **resources** (plural nouns, nested for ownership); the **HTTP verb** says the action. Verbs in the URL (`getStudentMarks`) are RPC style, not REST.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are REST architectural constraints? (choose all that apply)',
      options: ['Client-server separation', 'Stateless: each request carries everything needed (e.g. the JWT)', 'Uniform interface (resources + standard methods)', 'Cacheable responses', 'The server must keep a session for each client'],
      answers: [0, 1, 2, 3],
      explain: 'REST is stateless: the server keeps no per-client session between requests, so any server instance can handle any request (easy scaling). That is why APIs send a token on every request instead of using server sessions.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main difference between an ASP.NET Core **Web API** controller and an **MVC** controller?',
      options: [
        'Web API controllers return data (usually JSON) and inherit ControllerBase; MVC controllers return HTML views and inherit Controller',
        'Web API controllers cannot use routing',
        'MVC controllers cannot return JSON',
        'Web API only works with XML',
      ],
      answer: 0,
      explain: '`ControllerBase` has everything for APIs (Ok, NotFound, CreatedAtAction...) without view support; `Controller` adds `View()`, ViewBag etc. Web APIs are consumed by React, mobile apps and other services.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute that enables API behaviours (automatic 400 for invalid models, binding source inference, ProblemDetails):\n```\n[______]\n[Route("api/[controller]")]\npublic class StudentsController : ControllerBase { }\n```',
      example: { title: 'the attribute pair you see on every API controller', code: '[ApiController]\n[Route("api/[controller]")]' },
      accept: ['ApiController'],
      caseSensitive: true,
      explain: '`[ApiController]` requires attribute routing and makes the API return **400 ValidationProblemDetails** automatically when `ModelState` is invalid, so you do not write `if (!ModelState.IsValid)` in every action.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What is the **JSON** body returned by `GET /api/courses/2`? (ASP.NET Core uses camelCase property names by default. Type it without spaces.)',
      example: { title: 'C# object → JSON', code: 'new { Id = 1, IsActive = true }  →  {"id":1,"isActive":true}' },
      code: `public record CourseDto(int Id, string Title, int DurationDays);

[HttpGet("{id}")]
public ActionResult<CourseDto> Get(int id)
{
    var courses = new List<CourseDto> {
        new(1, "C# Basics", 30),
        new(2, "ASP.NET Core", 45)
    };
    var c = courses.FirstOrDefault(x => x.Id == id);
    if (c is null) return NotFound();
    return c;
}`,
      expected: '{"id":2,"title":"ASP.NET Core","durationDays":45}',
      explain: 'System.Text.Json serializes the record with **camelCase** names (`DurationDays` → `durationDays`). Returning `c` from `ActionResult<CourseDto>` becomes a 200 with that body; a missing id gives 404.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same REST resource in Express.** Build a read-only `courses` resource:\n- `GET /api/courses` → `200` with all courses\n- `GET /api/courses/:id` → `200` with one course, or `404` `{ "error": "Course not found" }`\n- `GET /api/courses/:id/students` → `200` with the array of student names of that course (`404` if the course is missing)',
      example: { title: 'a nested resource route', code: 'app.get("/api/orders/:id/items", (req, res) => { ... });' },
      starter: 'const express = require("express");\nconst app = express();\n\nconst courses = [\n  { id: 1, title: "C# Basics", students: ["Asha", "Ravi"] },\n  { id: 2, title: "ASP.NET Core", students: ["Meera"] },\n];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\nconst courses = [\n  { id: 1, title: "C# Basics", students: ["Asha", "Ravi"] },\n  { id: 2, title: "ASP.NET Core", students: ["Meera"] },\n];\nconst find = (id) => courses.find((c) => c.id === Number(id));\n\napp.get("/api/courses", (req, res) => res.json(courses));\n\napp.get("/api/courses/:id", (req, res) => {\n  const c = find(req.params.id);\n  if (!c) return res.status(404).json({ error: "Course not found" });\n  res.json(c);\n});\n\napp.get("/api/courses/:id/students", (req, res) => {\n  const c = find(req.params.id);\n  if (!c) return res.status(404).json({ error: "Course not found" });\n  res.json(c.students);\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'list → 200', steps: [{ method: 'GET', url: '/api/courses', expect: { status: 200, length: 2 } }] },
        { name: 'one → 200', steps: [{ method: 'GET', url: '/api/courses/2', expect: { status: 200, json: { id: 2, title: 'ASP.NET Core' } } }] },
        { name: 'missing → 404', steps: [{ method: 'GET', url: '/api/courses/7', expect: { status: 404, json: { error: 'Course not found' } } }] },
        { name: 'nested students', steps: [{ method: 'GET', url: '/api/courses/1/students', expect: { status: 200, json: ['Asha', 'Ravi'] } }, { method: 'GET', url: '/api/courses/9/students', expect: { status: 404 } }] },
      ],
      explain: 'Resources are nouns with stable URLs, nested resources express ownership, and status codes tell the client what happened - the same design you will build with `[HttpGet("{id}/students")]` in ASP.NET Core.',
    },
  ],
};
