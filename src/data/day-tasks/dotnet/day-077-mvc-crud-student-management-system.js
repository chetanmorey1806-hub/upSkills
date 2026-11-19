export default {
  lesson: 'day-077-mvc-crud-student-management-system',
  minutes: 38,
  intro: 'Put MVC together in a complete Student Management CRUD: list, details, create, edit and delete with validation, anti-forgery tokens and Post-Redirect-Get.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why does the Delete feature use a **GET** action that shows a confirmation page and a separate **POST** `DeleteConfirmed` action?',
      options: [
        'Because Razor cannot render delete buttons',
        'A GET must never change data: links, crawlers and prefetching could delete records; the POST with an anti-forgery token performs the delete',
        'POST is faster than GET',
        'Because EF Core needs two queries',
      ],
      answer: 1,
      explain: 'GET requests must be **safe**. If `/Students/Delete/5` deleted immediately, a search engine bot or a malicious `<img src>` could delete data. Confirm with GET, delete with a POST protected by `[ValidateAntiForgeryToken]`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute that checks the hidden `__RequestVerificationToken` on the POST Edit action:\n```\n[HttpPost]\n[______]\npublic IActionResult Edit(int id, Student student) { ... }\n```',
      example: { title: 'applying it to all POSTs', code: 'builder.Services.AddControllersWithViews(o =>\n    o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));' },
      accept: ['ValidateAntiForgeryToken'],
      acceptRegex: ['^ValidateAntiForgeryToken(\\(\\))?$'],
      caseSensitive: true,
      explain: 'The form tag helper puts a token in a hidden field and a cookie; `[ValidateAntiForgeryToken]` rejects posts where they do not match (400). This blocks **CSRF** attacks from other websites.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The user submits the Create form twice: first with an **empty Name**, then with `Name = "Meera"`. What does each POST return? Type one result per line as `View` or `Redirect:<action>`.',
      example: { title: 'reading the action', code: 'if (!ModelState.IsValid) return View(model);  →  View' },
      code: `[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Create(Student student)   // Name has [Required]
{
    if (!ModelState.IsValid)
        return View(student);

    _service.Add(student);
    TempData["Msg"] = "Student added";
    return RedirectToAction(nameof(Index));
}`,
      expected: `View
Redirect:Index`,
      explain: 'Invalid data → redisplay the same form with errors and the values the user typed (`View(student)`). Valid data → save, set a TempData message and redirect (Post-Redirect-Get), so F5 does not create a duplicate.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which belong in a well-structured Student CRUD? (choose all that apply)',
      options: [
        'A Student model with Data Annotations',
        'An IStudentService injected into StudentsController',
        'SQL queries written directly inside Index.cshtml',
        'Return NotFound() from Details/Edit/Delete when the id does not exist',
        'A shared _ValidationScriptsPartial on Create/Edit for client-side validation',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Keep layers separate: model (rules), service (data access), controller (flow), view (display). Views must never query the database. Always handle missing ids with 404 instead of crashing on null.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 7,
      q: '**The database side of the Index page.** The `Students` table is given. Write a query that lists `Id`, `Name`, `City` and `Marks` of students with **Marks >= 60**, ordered by `Marks` **descending** (top scorers first) - this is what the list page shows.',
      example: { title: 'filter + sort in T-SQL', code: 'SELECT Name, Price FROM Products\nWHERE Price < 500\nORDER BY Price DESC;' },
      setup: `CREATE TABLE Students (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL,
  City NVARCHAR(30),
  Marks INT
);
INSERT INTO Students (Name, City, Marks) VALUES
('Asha', 'Pune', 88), ('Ravi', 'Nagpur', 54), ('Meera', 'Mumbai', 91),
('Kiran', 'Pune', 60), ('Sana', 'Delhi', 47);`,
      starter: '-- TODO: students with Marks >= 60, highest first\nSELECT * FROM Students;\n',
      solution: 'SELECT Id, Name, City, Marks\nFROM Students\nWHERE Marks >= 60\nORDER BY Marks DESC;\n',
      ordered: true,
      explain: 'In the app this is `_db.Students.Where(s => s.Marks >= 60).OrderByDescending(s => s.Marks)`; EF Core generates almost exactly this SQL. `>=` includes Kiran with 60 - using `>` is the classic off-by-one mistake.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 12,
      q: '**The same CRUD flow in Express (JSON instead of views).**\n- `GET /students` → all students\n- `POST /students` with `{ name, city }` → `400` `{ "errors": { "name": "Name is required" } }` when name is empty, else `201` with `{ id, name, city }` (ids continue from 3)\n- `PUT /students/:id` → update name and city, `200` with the student; `404` `{ "error": "Not found" }` if missing\n- `DELETE /students/:id` → `204`; `404` if missing',
      example: { title: 'finding an index', code: 'const i = list.findIndex((x) => x.id === Number(req.params.id));\nif (i === -1) return res.status(404).json({ error: "Not found" });' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst students = [{ id: 1, name: "Asha", city: "Pune" }, { id: 2, name: "Ravi", city: "Nagpur" }];\n\n// TODO: CRUD routes\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst students = [{ id: 1, name: "Asha", city: "Pune" }, { id: 2, name: "Ravi", city: "Nagpur" }];\nlet nextId = 3;\n\napp.get("/students", (req, res) => res.json(students));\n\napp.post("/students", (req, res) => {\n  const name = (req.body.name || "").trim();\n  if (!name) return res.status(400).json({ errors: { name: "Name is required" } });\n  const s = { id: nextId++, name, city: req.body.city };\n  students.push(s);\n  res.status(201).json(s);\n});\n\napp.put("/students/:id", (req, res) => {\n  const s = students.find((x) => x.id === Number(req.params.id));\n  if (!s) return res.status(404).json({ error: "Not found" });\n  s.name = req.body.name;\n  s.city = req.body.city;\n  res.json(s);\n});\n\napp.delete("/students/:id", (req, res) => {\n  const i = students.findIndex((x) => x.id === Number(req.params.id));\n  if (i === -1) return res.status(404).json({ error: "Not found" });\n  students.splice(i, 1);\n  res.status(204).end();\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'create invalid → 400', steps: [{ method: 'POST', url: '/students', body: { name: ' ', city: 'Pune' }, expect: { status: 400, json: { errors: { name: 'Name is required' } } } }] },
        { name: 'create → 201, list has 3', steps: [{ method: 'POST', url: '/students', body: { name: 'Meera', city: 'Mumbai' }, expect: { status: 201, json: { id: 3, name: 'Meera', city: 'Mumbai' } } }, { method: 'GET', url: '/students', expect: { status: 200, length: 3 } }] },
        { name: 'edit → 200 / 404', steps: [{ method: 'PUT', url: '/students/2', body: { name: 'Ravi K', city: 'Pune' }, expect: { status: 200, json: { id: 2, name: 'Ravi K', city: 'Pune' } } }, { method: 'PUT', url: '/students/99', body: { name: 'X', city: 'Y' }, expect: { status: 404 } }] },
        { name: 'delete → 204, list has 1', steps: [{ method: 'DELETE', url: '/students/1', expect: { status: 204 } }, { method: 'GET', url: '/students', expect: { length: 1 } }, { method: 'DELETE', url: '/students/1', expect: { status: 404 } }] },
      ],
      explain: 'The CRUD flow is the same in every framework: validate → save → return the right status; look up by id and return 404 when missing. In MVC the "return" is a view or redirect; in an API it is JSON plus a status code.',
    },
  ],
};
