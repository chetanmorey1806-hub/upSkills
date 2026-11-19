export default {
  lesson: 'day-091-di-service-layer-repository',
  minutes: 32,
  intro: 'Structure a Web API in layers: thin controllers, a service layer for business rules and a repository for data access, wired together with dependency injection.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where should the rule "a student can enrol in at most 3 courses" be implemented?',
      options: ['In the controller action', 'In the service layer (e.g. EnrollmentService)', 'In the Razor view', 'In appsettings.json'],
      answer: 1,
      explain: 'Business rules belong in the **service** layer: they are reusable (API, background jobs) and testable without HTTP. Controllers only translate HTTP ↔ service calls; repositories only load/save data.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Register the repository so a new instance is used per HTTP request (same lifetime as the DbContext):\n`builder.Services.______<IStudentRepository, StudentRepository>();`',
      example: { title: 'registering the service too', code: 'builder.Services.AddScoped<IStudentService, StudentService>();' },
      accept: ['AddScoped'],
      caseSensitive: true,
      explain: 'Repositories use the scoped DbContext, so they must be **Scoped** (or Transient) - never Singleton, which would capture one DbContext forever.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'The controller calls `_service.Enroll(1, 40)`. Student 1 already has courses `[10, 20, 30]`. What does the client get? Type the **status** (line 1) and the **body text** (line 2).',
      example: { title: 'mapping a service result to HTTP', code: 'var ok = _service.Approve(id);\nreturn ok ? NoContent() : BadRequest("Cannot approve");' },
      code: `public class EnrollmentService : IEnrollmentService
{
    private readonly IEnrollmentRepository _repo;
    public EnrollmentService(IEnrollmentRepository repo) => _repo = repo;

    public string? Enroll(int studentId, int courseId)
    {
        var current = _repo.GetCourseIds(studentId);
        if (current.Contains(courseId)) return "Already enrolled";
        if (current.Count >= 3) return "Maximum 3 courses allowed";
        _repo.Add(studentId, courseId);
        return null;   // null = success
    }
}

[HttpPost("{studentId}/courses/{courseId}")]
public IActionResult Enroll(int studentId, int courseId)
{
    var error = _service.Enroll(studentId, courseId);
    return error is null ? NoContent() : BadRequest(error);
}`,
      expected: `400
Maximum 3 courses allowed`,
      explain: 'Course 40 is not a duplicate, but the student already has 3 courses, so the service returns the rule message and the controller maps it to **400**. The controller contains no rule itself - it only translates the result.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'What are the benefits of the repository + service layers? (choose all that apply)',
      options: [
        'Services can be unit-tested with a fake repository (no database)',
        'Controllers stay thin and readable',
        'Data access code is in one place, so changing a query does not touch controllers',
        'It removes the need for a database',
        'Swapping the implementation (e.g. a cached repository) only changes the DI registration',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Layers depend on **interfaces**, so tests and alternative implementations plug in through DI. You still need a database - the repository just hides how it is accessed.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 9,
      q: '**Service with an injected repository.** Write `class EnrollmentService` whose constructor takes `repo` (with `getCourseIds(studentId)` → array and `add(studentId, courseId)`). Method `enroll(studentId, courseId)` returns:\n- `"Already enrolled"` if the course is in the list\n- `"Maximum 3 courses allowed"` if the student has 3 or more courses\n- otherwise calls `repo.add(...)` and returns `null`',
      example: { title: 'constructor injection in JS', code: 'class ReportService {\n  constructor(repo) { this.repo = repo; }\n  total() { return this.repo.all().length; }\n}' },
      starter: 'class EnrollmentService {\n  constructor(repo) {\n    // TODO\n  }\n  enroll(studentId, courseId) {\n    // TODO\n  }\n}\n',
      solution: 'class EnrollmentService {\n  constructor(repo) {\n    this.repo = repo;\n  }\n  enroll(studentId, courseId) {\n    const current = this.repo.getCourseIds(studentId);\n    if (current.includes(courseId)) return "Already enrolled";\n    if (current.length >= 3) return "Maximum 3 courses allowed";\n    this.repo.add(studentId, courseId);\n    return null;\n  }\n}\n',
      tests: [
        { call: '(() => { const added = []; const repo = { getCourseIds: () => [10, 20], add: (s, c) => added.push([s, c]) }; const r = new EnrollmentService(repo).enroll(1, 30); return [r, added]; })()', expect: [null, [[1, 30]]], msg: 'A valid enrolment must call repo.add and return null' },
        { call: 'new EnrollmentService({ getCourseIds: () => [10, 20, 30], add: () => {} }).enroll(1, 40)', expect: 'Maximum 3 courses allowed' },
        { call: '(() => { let called = false; const repo = { getCourseIds: () => [10], add: () => { called = true; } }; return [new EnrollmentService(repo).enroll(1, 10), called]; })()', expect: ['Already enrolled', false], msg: 'A duplicate must not call repo.add' },
      ],
      explain: 'The tests pass **fake repositories** - exactly how you unit-test a C# service with a mock `IEnrollmentRepository`. Because the service never creates its own repository, it is easy to test.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which constructor shows correct dependency injection in `StudentsController`?',
      options: [
        'public StudentsController() { _service = new StudentService(new StudentRepository(new AppDbContext())); }',
        'public StudentsController(IStudentService service) { _service = service; }',
        'public StudentsController(StudentService service, AppDbContext db, StudentRepository repo) { ... }',
        'public static IStudentService Service = new StudentService();',
      ],
      answer: 1,
      explain: 'The controller asks only for the **abstraction it uses**; the container builds the whole chain (service → repository → DbContext). Using `new` hard-codes dependencies and makes testing impossible.',
    },
  ],
};
