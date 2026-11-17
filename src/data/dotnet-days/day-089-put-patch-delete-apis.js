export default {
  id: 'day-089-put-patch-delete-apis',
  title: 'PUT, PATCH, DELETE APIs, Route Parameters',
  module: 'ASP.NET Core Web API',
  day: 89,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Complete the Student CRUD API from Day 88. Add PUT (full replace), PATCH (partial update with JSON Patch and with a simple partial DTO) and DELETE (with 204 No Content), and master route parameters: templates, constraints, optional and default values, multiple parameters and nested routes. Test every method in Swagger and Postman.`,
  objectives: [
    'Implement PUT to fully replace a resource and return 204 No Content or 200 OK',
    'Implement PATCH with JSON Patch documents (op, path, value) and with a nullable partial-update model',
    'Implement DELETE and choose between 204, 404 and 409 responses',
    'Use route parameters with constraints such as {id:int}, {id:min(1)}, optional {page?} and default values',
    'Test the complete CRUD API in Swagger and Postman with sample JSON',
  ],
  theory: [
    {
      heading: 'PUT - replace the whole resource',
      content: `PUT /api/students/5 sends the COMPLETE new version of student 5. Every property that is missing in the body is reset to its default value, so the client must send all fields. PUT is idempotent: sending the same request 10 times leaves the server in the same state as sending it once. The id comes from the route; if the body also contains an id, it must match the route id, otherwise return 400 Bad Request.`,
      points: [
        '204 No Content - updated, nothing to return (most common convention)',
        '200 OK - updated and the updated object is returned in the body',
        '404 Not Found - no student with that id',
        '400 Bad Request - route id and body id do not match, or the body is invalid',
      ],
      syntax: `[HttpPut("{id:int}")]
public async Task<IActionResult> Update(int id, Student input)
{
    if (id != input.Id) return BadRequest("Id mismatch");
    var student = await _db.Students.FindAsync(id);
    if (student is null) return NotFound();
    student.Name = input.Name;  student.Email = input.Email;
    student.Course = input.Course; student.Marks = input.Marks;
    await _db.SaveChangesAsync();
    return NoContent();
}`,
    },
    {
      heading: 'PATCH - change only some fields',
      content: `PATCH sends only the changes. There are two popular styles. (1) JSON Patch (RFC 6902, media type application/json-patch+json): the body is an ARRAY of operations such as { "op": "replace", "path": "/marks", "value": 95 }. Operations are add, remove, replace, move, copy and test. (2) Merge-style partial model: the body is a normal JSON object with only the fields to change, bound to a class whose properties are all nullable; null means "do not change".`,
      points: [
        'JSON Patch needs the package Microsoft.AspNetCore.Mvc.NewtonsoftJson (.NET 8) or Microsoft.AspNetCore.JsonPatch.SystemTextJson (.NET 10)',
        'Always validate the patched object (TryValidateModel) before saving',
        'Partial DTO style is simpler for beginners and for React forms',
        'PATCH is not guaranteed to be idempotent (for example an "add" to an array)',
      ],
      syntax: `[
  { "op": "replace", "path": "/marks",  "value": 95 },
  { "op": "replace", "path": "/course", "value": "Azure" }
]`,
    },
    {
      heading: 'DELETE - remove a resource',
      content: `DELETE /api/students/5 removes student 5. Return 204 No Content on success and 404 Not Found when the id does not exist. Some teams return 204 even when the item was already gone, because DELETE is idempotent (the end state "student 5 does not exist" is the same). If the row is still referenced by other rows (foreign key), SQL Server throws an error - catch DbUpdateException and return 409 Conflict. Many real systems use a soft delete (IsDeleted = true) instead of really deleting.`,
      syntax: `[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    var student = await _db.Students.FindAsync(id);
    if (student is null) return NotFound();
    _db.Students.Remove(student);
    await _db.SaveChangesAsync();
    return NoContent();
}

// EF Core 7+: one SQL statement, no SELECT first
int rows = await _db.Students.Where(s => s.Id == id).ExecuteDeleteAsync();
return rows == 0 ? NotFound() : NoContent();`,
    },
    {
      heading: 'Route parameters, templates and constraints',
      content: `A route template contains literal segments (api, students) and parameters in braces ({id}). The value from the URL is bound to the action parameter with the same name. Constraints restrict which values match; if a constraint fails, the route does not match and the client gets 404 (not 400). Constraints are for routing, not for validation of business rules.`,
      points: [
        '{id:int} - only integers; {id:int:min(1)} - integers of 1 or more',
        '{name:alpha} - letters only; {code:length(3)} - exactly 3 characters; {code:regex(^[A-Z]{{3}}$)}',
        '{id:guid}, {date:datetime}, {active:bool}, {price:decimal}',
        '{page?} - optional parameter; {page=1} - default value',
        'api/courses/{courseId:int}/students/{studentId:int} - multiple parameters (nested resource)',
        '{**path} - catch-all parameter that captures the rest of the URL',
      ],
    },
    {
      heading: 'Choosing status codes for the full CRUD API',
      content: `A consistent API is easier to use from React, mobile apps and Postman. This table is what we use in this course for the Student resource.`,
      syntax: `GET    /api/students        200 (array, may be empty)
GET    /api/students/5      200 | 404
POST   /api/students        201 + Location | 400 | 409
PUT    /api/students/5      204 | 400 | 404
PATCH  /api/students/5      200 (updated object) | 400 | 404
DELETE /api/students/5      204 | 404 | 409`,
      tip: 'PUT vs PATCH in one line: PUT = "here is the whole new student", PATCH = "change just these fields".',
    },
    {
      heading: 'Concurrency: two users editing the same row',
      content: `If two clients load student 5 and both send PUT, the second one silently overwrites the first ("last write wins"). To detect this, add a rowversion column: [Timestamp] public byte[] RowVersion { get; set; }. EF Core adds WHERE RowVersion = @old to the UPDATE; if no row is updated it throws DbUpdateConcurrencyException, which you can turn into 409 Conflict (or 412 Precondition Failed when you use ETag / If-Match headers).`,
    },
  ],
  examples: [
    {
      title: 'Complete CRUD StudentsController (GET, POST, PUT, PATCH, DELETE)',
      scenario: 'Extend the Day 88 StudentApi so that it supports every CRUD operation against SQL Server.',
      steps: [
        'Open the StudentApi solution from Day 88 in Visual Studio',
        'Tools > NuGet Package Manager > Package Manager Console',
        'Run: Install-Package Microsoft.AspNetCore.Mvc.NewtonsoftJson   (needed for JSON Patch on .NET 8/9)',
        'Add Models/StudentPatchDto.cs and replace Controllers/StudentsController.cs with the code',
        'In Program.cs change AddControllers() to AddControllers().AddNewtonsoftJson()',
        'Press Ctrl+F5 - Swagger opens at https://localhost:7001/swagger',
      ],
      code: `// Program.cs (only the changed part)
builder.Services.AddControllers()
    .AddNewtonsoftJson();   // enables JsonPatchDocument<T> binding

// Models/StudentPatchDto.cs  - merge-style partial update (all nullable)
namespace StudentApi.Models;

public class StudentPatchDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Course { get; set; }
    public int? Marks { get; set; }
}

// Controllers/StudentsController.cs
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApi.Data;
using StudentApi.Models;

namespace StudentApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StudentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>> GetAll() =>
        await _db.Students.AsNoTracking().OrderBy(s => s.Id).ToListAsync();

    [HttpGet("{id:int:min(1)}")]
    public async Task<ActionResult<Student>> GetById(int id)
    {
        var s = await _db.Students.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return s is null ? NotFound(new { message = $"Student {id} not found" }) : s;
    }

    [HttpPost]
    public async Task<ActionResult<Student>> Create(Student student)
    {
        student.Id = 0;
        student.CreatedAt = DateTime.UtcNow;
        _db.Students.Add(student);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
    }

    // PUT api/students/2  - full replace
    [HttpPut("{id:int:min(1)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, Student input)
    {
        if (input.Id != 0 && input.Id != id)
            return BadRequest(new { message = "Route id and body id do not match" });

        var student = await _db.Students.FindAsync(id);
        if (student is null)
            return NotFound(new { message = $"Student {id} not found" });

        student.Name = input.Name;
        student.Email = input.Email;
        student.Course = input.Course;
        student.Marks = input.Marks;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH api/students/2  - JSON Patch document
    [HttpPatch("{id:int:min(1)}")]
    [Consumes("application/json-patch+json")]
    public async Task<ActionResult<Student>> Patch(int id, [FromBody] JsonPatchDocument<Student> patch)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null)
            return NotFound(new { message = $"Student {id} not found" });

        patch.ApplyTo(student, ModelState);         // invalid paths go into ModelState
        if (student.Id != id)
            ModelState.AddModelError("id", "Id cannot be changed");
        if (!ModelState.IsValid || !TryValidateModel(student))
            return ValidationProblem(ModelState);

        await _db.SaveChangesAsync();
        return Ok(student);
    }

    // PATCH api/students/2/partial  - simple merge-style partial update
    [HttpPatch("{id:int:min(1)}/partial")]
    [Consumes("application/json")]
    public async Task<ActionResult<Student>> PatchPartial(int id, StudentPatchDto dto)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null) return NotFound();

        if (dto.Name is not null)   student.Name = dto.Name;
        if (dto.Email is not null)  student.Email = dto.Email;
        if (dto.Course is not null) student.Course = dto.Course;
        if (dto.Marks.HasValue)     student.Marks = dto.Marks.Value;

        await _db.SaveChangesAsync();
        return Ok(student);
    }

    // DELETE api/students/2
    [HttpDelete("{id:int:min(1)}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        var student = await _db.Students.FindAsync(id);
        if (student is null)
            return NotFound(new { message = $"Student {id} not found" });

        try
        {
            _db.Students.Remove(student);
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Student is referenced by other records" });
        }
        return NoContent();
    }
}`,
      result: `Swagger now lists 7 operations under "Students":
GET /api/students, POST /api/students, GET /api/students/{id},
PUT /api/students/{id}, PATCH /api/students/{id}, DELETE /api/students/{id},
PATCH /api/students/{id}/partial`,
      explanation: `FindAsync returns a TRACKED entity, so after changing its properties a plain SaveChangesAsync generates an UPDATE for only the changed columns. The min(1) constraint makes /api/students/0 and /api/students/-3 return 404 because no route matches. ApplyTo(student, ModelState) records errors (for example a wrong path like /mark) in ModelState instead of throwing, and ValidationProblem turns them into a standard 400 response. On .NET 10 you can use the package Microsoft.AspNetCore.JsonPatch.SystemTextJson instead of NewtonsoftJson; the controller code is the same except the namespace Microsoft.AspNetCore.JsonPatch.SystemTextJson.`,
    },
    {
      title: 'Test PUT, PATCH and DELETE in Swagger and Postman',
      scenario: 'Run every new endpoint with sample JSON and check the status codes.',
      steps: [
        'Press Ctrl+F5 to run StudentApi',
        'Swagger: expand PUT /api/students/{id} > Try it out > id = 2 > paste body 1 > Execute',
        'Swagger: expand PATCH /api/students/{id} > Try it out > id = 2 > paste body 2 > Execute',
        'Postman: New > HTTP Request > PATCH https://localhost:7001/api/students/2/partial > Body > raw > JSON > paste body 3 > Send',
        'Postman: DELETE https://localhost:7001/api/students/2 > Send, then Send again',
        'Postman: GET https://localhost:7001/api/students/abc > Send (constraint test)',
      ],
      code: `### Body 1 - PUT https://localhost:7001/api/students/2
Content-Type: application/json
{
  "id": 2,
  "name": "Ravi Kumar",
  "email": "ravi.kumar@mail.com",
  "course": "React",
  "marks": 84
}

### Body 2 - PATCH https://localhost:7001/api/students/2
Content-Type: application/json-patch+json
[
  { "op": "replace", "path": "/marks", "value": 95 },
  { "op": "replace", "path": "/course", "value": "Azure" }
]

### Body 3 - PATCH https://localhost:7001/api/students/2/partial
Content-Type: application/json
{ "marks": 90 }

### DELETE https://localhost:7001/api/students/2`,
      result: `PUT /api/students/2 -> 204 No Content (empty body)

PATCH /api/students/2 (JSON Patch) -> 200 OK
{ "id": 2, "name": "Ravi Kumar", "email": "ravi.kumar@mail.com", "course": "Azure", "marks": 95, "createdAt": "2026-11-17T00:00:00" }

PATCH /api/students/2/partial { "marks": 90 } -> 200 OK
{ "id": 2, "name": "Ravi Kumar", "email": "ravi.kumar@mail.com", "course": "Azure", "marks": 90, "createdAt": "2026-11-17T00:00:00" }

DELETE /api/students/2 -> 204 No Content
DELETE /api/students/2 again -> 404 Not Found { "message": "Student 2 not found" }
GET /api/students/abc -> 404 Not Found (no route matches because of :int)

PUT /api/students/3 with "id": 2 in the body -> 400 { "message": "Route id and body id do not match" }`,
      explanation: `Notice that the partial PATCH only changed marks; name, email and course stayed as they were. If you sent { "marks": 90 } to PUT instead, name/email/course would become empty strings because PUT replaces the whole object - that is exactly the PUT vs PATCH difference. In Postman, look at the status code at the top right of the response pane.`,
    },
    {
      title: 'Route parameters lab: constraints, optional, default and nested routes',
      scenario: 'Practise every kind of route parameter in a small RoutesDemoController.',
      steps: [
        'Right-click Controllers > Add > Controller > API Controller - Empty > RoutesDemoController.cs',
        'Paste the code and press Ctrl+F5',
        'Call each URL in the result section from the browser or Postman',
      ],
      code: `using Microsoft.AspNetCore.Mvc;

namespace StudentApi.Controllers;

[ApiController]
[Route("api/demo")]
public class RoutesDemoController : ControllerBase
{
    // api/demo/students/7
    [HttpGet("students/{id:int:min(1)}")]
    public IActionResult ById(int id) => Ok(new { route = "by id", id });

    // api/demo/students/asha   (letters only)
    [HttpGet("students/{name:alpha}")]
    public IActionResult ByName(string name) => Ok(new { route = "by name", name });

    // api/demo/page  and  api/demo/page/3
    [HttpGet("page/{page:int=1}")]
    public IActionResult Page(int page) => Ok(new { page });

    // api/demo/report  and  api/demo/report/2026
    [HttpGet("report/{year:int?}")]
    public IActionResult Report(int? year) => Ok(new { year = year ?? 0 });

    // api/demo/courses/10/students/7   - two route parameters
    [HttpGet("courses/{courseId:int}/students/{studentId:int}")]
    public IActionResult Nested(int courseId, int studentId) =>
        Ok(new { courseId, studentId });

    // api/demo/orders/3f2504e0-4f89-11d3-9a0c-0305e82c3301
    [HttpGet("orders/{orderId:guid}")]
    public IActionResult Order(Guid orderId) => Ok(new { orderId });

    // api/demo/files/images/2026/logo.png  (catch-all)
    [HttpGet("files/{**path}")]
    public IActionResult Files(string path) => Ok(new { path });
}`,
      result: `GET /api/demo/students/7        -> 200 { "route": "by id", "id": 7 }
GET /api/demo/students/asha     -> 200 { "route": "by name", "name": "asha" }
GET /api/demo/students/0        -> 404 (min(1) fails, alpha fails)
GET /api/demo/page              -> 200 { "page": 1 }
GET /api/demo/page/3            -> 200 { "page": 3 }
GET /api/demo/report            -> 200 { "year": 0 }
GET /api/demo/report/2026       -> 200 { "year": 2026 }
GET /api/demo/courses/10/students/7 -> 200 { "courseId": 10, "studentId": 7 }
GET /api/demo/orders/3f2504e0-4f89-11d3-9a0c-0305e82c3301 -> 200 { "orderId": "3f2504e0-4f89-11d3-9a0c-0305e82c3301" }
GET /api/demo/orders/123        -> 404 (not a GUID)
GET /api/demo/files/images/2026/logo.png -> 200 { "path": "images/2026/logo.png" }`,
      explanation: `Two templates students/{id:int} and students/{name:alpha} can live side by side because the constraints make them unambiguous. Without constraints ASP.NET Core would throw AmbiguousMatchException ("The request matched multiple endpoints"). Remember: a failed constraint gives 404, while a value that matches the route but breaks a business rule should give 400.`,
    },
    {
      title: 'What PUT, PATCH and DELETE do in SQL Server',
      scenario: 'See the SQL that EF Core sends for each operation (run in the SSMS Lab).',
      steps: [
        'Open SSMS > New Query (Ctrl+N)',
        'Paste the script and press F5',
        'Compare: PUT updates all columns, PATCH updates only the changed column, DELETE removes the row',
      ],
      code: `CREATE DATABASE StudentApiDB;
GO
USE StudentApiDB;
GO
CREATE TABLE Students (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL,
    Course NVARCHAR(50) NOT NULL,
    Marks INT NOT NULL
);
GO
INSERT INTO Students (Name, Email, Course, Marks) VALUES
('Asha', 'asha@mail.com', '.NET', 88),
('Ravi', 'ravi@mail.com', 'React', 76),
('Kiran', 'kiran@mail.com', '.NET', 81);
GO
-- PUT /api/students/2 (all columns)
UPDATE Students SET Name = 'Ravi Kumar', Email = 'ravi.kumar@mail.com', Course = 'React', Marks = 84 WHERE Id = 2;
-- PATCH /api/students/2 (only marks)
UPDATE Students SET Marks = 95 WHERE Id = 2;
-- DELETE /api/students/3
DELETE FROM Students WHERE Id = 3;
GO
SELECT Id, Name, Email, Course, Marks FROM Students ORDER BY Id;`,
      tsql: `CREATE DATABASE StudentApiDB;
GO
USE StudentApiDB;
GO
CREATE TABLE Students (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL,
    Course NVARCHAR(50) NOT NULL,
    Marks INT NOT NULL
);
GO
INSERT INTO Students (Name, Email, Course, Marks) VALUES
('Asha', 'asha@mail.com', '.NET', 88),
('Ravi', 'ravi@mail.com', 'React', 76),
('Kiran', 'kiran@mail.com', '.NET', 81);
GO
UPDATE Students SET Name = 'Ravi Kumar', Email = 'ravi.kumar@mail.com', Course = 'React', Marks = 84 WHERE Id = 2;
UPDATE Students SET Marks = 95 WHERE Id = 2;
DELETE FROM Students WHERE Id = 3;
GO
SELECT Id, Name, Email, Course, Marks FROM Students ORDER BY Id;`,
      result: `(3 rows affected)
(1 row affected)
(1 row affected)
(1 row affected)

+----+------------+---------------------+--------+-------+
| Id | Name       | Email               | Course | Marks |
+----+------------+---------------------+--------+-------+
| 1  | Asha       | asha@mail.com       | .NET   | 88    |
| 2  | Ravi Kumar | ravi.kumar@mail.com | React  | 95    |
+----+------------+---------------------+--------+-------+
2 row(s) returned`,
      explanation: `With change tracking EF Core only puts modified columns in the SET clause, so even a PUT handler that assigns all four properties may send fewer columns if some values did not change. You can see the real SQL in the Visual Studio Output window when logging level for Microsoft.EntityFrameworkCore.Database.Command is Information.`,
    },
  ],
  interview: [
    { q: 'What is the difference between PUT and PATCH?', a: 'PUT replaces the entire resource with the body sent (missing fields become defaults). PATCH applies a partial modification - only the fields or operations sent are changed.', level: 'Easy' },
    { q: 'Which of GET, POST, PUT, PATCH, DELETE are idempotent?', a: 'GET, PUT and DELETE are idempotent (and HEAD/OPTIONS). POST is not. PATCH is not guaranteed to be idempotent, although many PATCH requests happen to be.', level: 'Medium' },
    { q: 'What status code should a successful DELETE return?', a: 'Usually 204 No Content. 200 OK with a body (for example the deleted object) is also acceptable; 202 Accepted if deletion is queued.', level: 'Easy' },
    { q: 'What happens when a route constraint fails, e.g. /api/students/abc with {id:int}?', a: 'The route does not match, so the endpoint is not selected and the client gets 404 Not Found. Constraints are not validation; they only disambiguate routes.', level: 'Medium' },
    { q: 'What is a JSON Patch document?', a: 'A JSON array of operations defined by RFC 6902 with content type application/json-patch+json. Each operation has op (add, remove, replace, move, copy, test), path (JSON pointer such as /marks) and usually value or from.', level: 'Medium' },
    { q: 'Why check that the route id matches the body id in PUT?', a: 'To avoid ambiguity and accidental updates of a different record. The URL identifies the resource; a conflicting body id is a client error, so return 400.', level: 'Easy' },
    { q: 'How do you delete a row in EF Core without loading it first?', a: 'EF Core 7+: await _db.Students.Where(s => s.Id == id).ExecuteDeleteAsync(); it sends one DELETE statement and returns the number of affected rows. Older way: attach a stub entity new Student { Id = id } and Remove it.', level: 'Hard' },
    { q: 'What is a soft delete?', a: 'Instead of removing the row, set a flag such as IsDeleted = true (and DeletedAt). Queries filter out deleted rows, often with an EF Core global query filter HasQueryFilter(s => !s.IsDeleted). It keeps history and avoids foreign key problems.', level: 'Medium' },
    { q: 'How do you return 409 when a DELETE violates a foreign key?', a: 'Wrap SaveChangesAsync in try/catch for DbUpdateException and return Conflict(...). Better: check for dependent rows first with AnyAsync and return 409 with a clear message.', level: 'Medium' },
    { q: 'What is the difference between {page?} and {page=1}?', a: '{page?} makes the parameter optional; the action receives null (int?) or default when it is missing. {page=1} supplies a default value of 1 when the segment is missing.', level: 'Easy' },
    { q: 'How can you prevent lost updates when two users PUT the same record?', a: 'Use optimistic concurrency: a [Timestamp] rowversion column (or ETag with If-Match). EF Core throws DbUpdateConcurrencyException when the row changed; return 409 Conflict or 412 Precondition Failed.', level: 'Hard' },
    { q: 'Output question: student {Name:"Ravi", Course:"React", Marks:76}. Client sends PUT with body { "name": "Ravi", "marks": 90 } and the handler copies all properties. What is Course after the update?', a: 'An empty string (the default from the model initializer string.Empty), because PUT replaced the whole object and course was not sent. With PATCH it would stay "React".', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add PUT /api/students/{id}/marks/{marks:int:range(0,100)} that updates only the marks using route parameters (no body).',
      hint: 'Two route parameters; return 204.',
      solution: `[HttpPut("{id:int}/marks/{marks:int:range(0,100)}")]
public async Task<IActionResult> SetMarks(int id, int marks)
{
    var s = await _db.Students.FindAsync(id);
    if (s is null) return NotFound();
    s.Marks = marks;
    await _db.SaveChangesAsync();
    return NoContent();
}`,
    },
    {
      task: 'Change DELETE to a soft delete: add bool IsDeleted to Student, set it to true instead of removing, and hide deleted students from GET.',
      hint: 'Add a migration and use HasQueryFilter in OnModelCreating.',
      solution: `// Student.cs
public bool IsDeleted { get; set; }

// AppDbContext.OnModelCreating
modelBuilder.Entity<Student>().HasQueryFilter(s => !s.IsDeleted);

// Controller
[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    var s = await _db.Students.FindAsync(id);
    if (s is null) return NotFound();
    s.IsDeleted = true;
    await _db.SaveChangesAsync();
    return NoContent();
}
// PM> Add-Migration AddIsDeleted ; Update-Database`,
    },
    {
      task: 'Rewrite Delete using ExecuteDeleteAsync so that only one SQL statement runs.',
      hint: 'ExecuteDeleteAsync returns the number of rows deleted.',
      solution: `[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    int rows = await _db.Students.Where(s => s.Id == id).ExecuteDeleteAsync();
    return rows == 0 ? NotFound() : NoContent();
}`,
    },
    {
      task: 'Send a JSON Patch with a "test" operation so that marks is replaced only if the current course is ".NET". What happens when the test fails?',
      hint: 'The test op compares the current value; on failure ApplyTo adds an error to ModelState.',
      solution: `[
  { "op": "test", "path": "/course", "value": ".NET" },
  { "op": "replace", "path": "/marks", "value": 99 }
]
// If course is ".NET" -> 200 with marks 99.
// Otherwise -> 400 ValidationProblem: "The current value 'React' at path 'course' is not equal to the test value '.NET'."`,
    },
    {
      task: 'Add a nested route GET /api/courses/{course}/students that returns students of one course, and DELETE /api/courses/{course}/students that removes all of them and returns { deleted: n }.',
      hint: 'Use a separate controller with [Route("api/courses/{course}/students")].',
      solution: `[ApiController]
[Route("api/courses/{course}/students")]
public class CourseStudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public CourseStudentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>> Get(string course) =>
        await _db.Students.AsNoTracking().Where(s => s.Course == course).ToListAsync();

    [HttpDelete]
    public async Task<IActionResult> DeleteAll(string course)
    {
        int n = await _db.Students.Where(s => s.Course == course).ExecuteDeleteAsync();
        return Ok(new { deleted = n });
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which HTTP method should be used to change ONLY the marks of a student?', options: ['PUT', 'POST', 'PATCH', 'GET'], answer: 2, explanation: 'PATCH is for partial updates.' },
    { question: 'GET /api/students/abc is called and the route is "{id:int}". The response is:', options: ['400 Bad Request', '404 Not Found', '500 Internal Server Error', '415 Unsupported Media Type'], answer: 1, explanation: 'The constraint fails, so no endpoint matches and routing returns 404.' },
    { question: 'Content-Type for a JSON Patch document is:', options: ['application/json-patch+json', 'application/patch', 'text/json-patch', 'application/x-www-form-urlencoded'], answer: 0, explanation: 'RFC 6902 defines application/json-patch+json.' },
    { question: 'Which helper returns 204 from an action?', options: ['Ok()', 'Accepted()', 'NoContent()', 'Created()'], answer: 2, explanation: 'NoContent() produces 204 No Content with an empty body.' },
    { question: 'Which statement about PUT is TRUE?', options: ['It is not idempotent', 'It must never have a body', 'It always creates a new id', 'It replaces the whole resource and is idempotent'], answer: 3, explanation: 'PUT sends the full representation and repeating it has the same effect.' },
  ],
};
