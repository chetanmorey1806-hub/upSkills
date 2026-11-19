export default {
  lesson: 'day-090-dto-automapper',
  minutes: 30,
  intro: 'Separate API contracts from database entities with request and response DTOs, and map between them by hand or with AutoMapper profiles.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why should an API **not** return the EF Core `User` entity directly?',
      options: [
        'Entities cannot be serialized to JSON',
        'It can leak fields like PasswordHash, couples clients to the database schema and can cause cycles through navigation properties',
        'DTOs are faster to query',
        'Returning entities is not allowed by ASP.NET Core',
      ],
      answer: 1,
      explain: 'A **response DTO** exposes only what the client needs; a **request DTO** accepts only what the client may set (preventing over-posting of fields like `IsAdmin`). Navigation cycles (User → Orders → User) also break serialization.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What JSON does `GET /api/users/1` return? (camelCase, no spaces.)',
      example: { title: 'a mapping method', code: 'static ProductDto ToDto(Product p) => new(p.Id, p.Name, p.Price);' },
      code: `public class User {
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
}
public record UserDto(int Id, string FullName, string Email);

[HttpGet("{id}")]
public ActionResult<UserDto> Get(int id)
{
    var u = new User { Id = 1, FirstName = "Asha", LastName = "Patil",
                       Email = "asha@mail.com", PasswordHash = "x9#a..." };
    return new UserDto(u.Id, $"{u.FirstName} {u.LastName}", u.Email);
}`,
      expected: '{"id":1,"fullName":"Asha Patil","email":"asha@mail.com"}',
      explain: 'Only the DTO\'s properties are serialized. `PasswordHash` never leaves the server, and the DTO can shape data (FullName) for the client.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In an AutoMapper `Profile` constructor, complete the line that maps the `Student` entity to `StudentDto`:\n`______;`',
      example: { title: 'mapping both ways', code: 'CreateMap<Course, CourseDto>().ReverseMap();' },
      accept: ['CreateMap<Student, StudentDto>()', 'CreateMap<Student,StudentDto>()'],
      acceptRegex: ['^CreateMap<\\s*Student\\s*,\\s*StudentDto\\s*>\\(\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: '`CreateMap<Source, Destination>()` maps properties with matching names automatically. Then `_mapper.Map<StudentDto>(student)` does the copy. Register profiles with `builder.Services.AddAutoMapper(typeof(Program))`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about DTOs and AutoMapper are TRUE? (choose all that apply)',
      options: [
        'AutoMapper matches properties by name; "Department.Name" can flatten into "DepartmentName" automatically',
        'ForMember(d => d.FullName, o => o.MapFrom(s => s.FirstName + " " + s.LastName)) customises one property',
        'A CreateStudentDto should normally NOT contain the Id (the database generates it)',
        'Using DTOs means you can never use Data Annotations',
        'Manual mapping methods are a valid alternative to AutoMapper',
      ],
      answers: [0, 1, 2, 4],
      explain: 'AutoMapper uses naming conventions (including flattening) and `ForMember` for custom rules. Request DTOs carry validation attributes. Manual mapping is explicit and easy to debug - many teams prefer it for small projects.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: '**Write the mapping by hand.** `toStudentDto(student)` maps an entity `{ id, firstName, lastName, email, passwordHash, department: { name } }` to `{ id, fullName, email, departmentName }` (no other fields).',
      example: { title: 'building a new object', code: 'const toDto = (p) => ({ id: p.id, title: p.name.toUpperCase() });' },
      starter: 'function toStudentDto(student) {\n  // TODO\n}\n',
      solution: 'function toStudentDto(s) {\n  return {\n    id: s.id,\n    fullName: s.firstName + " " + s.lastName,\n    email: s.email,\n    departmentName: s.department.name,\n  };\n}\n',
      tests: [
        { call: 'toStudentDto({ id: 7, firstName: "Ravi", lastName: "Kumar", email: "ravi@mail.com", passwordHash: "secret", department: { id: 2, name: "IT" } })', expect: { id: 7, fullName: 'Ravi Kumar', email: 'ravi@mail.com', departmentName: 'IT' } },
        { call: '"passwordHash" in toStudentDto({ id: 1, firstName: "A", lastName: "B", email: "a@b.c", passwordHash: "x", department: { name: "HR" } })', expect: false, msg: 'The DTO must NOT contain passwordHash' },
      ],
      explain: 'This is what `CreateMap<Student, StudentDto>().ForMember(d => d.FullName, ...)` does: copy safe fields, combine/flatten others and drop secrets. Never spread the whole entity (`{ ...student }`) into a response.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 8,
      q: '**Request + response DTOs in Express.** `POST /api/users` receives `{ firstName, lastName, email, password, isAdmin }`.\n- Ignore `isAdmin` from the client (over-posting): new users are always `isAdmin: false`\n- Store the user with a fake hash `passwordHash: "hashed:" + password`\n- Respond `201` with ONLY `{ id, fullName, email }`\n- `GET /api/users/:id` returns the same response DTO shape',
      example: { title: 'picking fields from the body', code: 'const { title, price } = req.body; // ignore everything else' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = [];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = [];\nconst toDto = (u) => ({ id: u.id, fullName: u.firstName + " " + u.lastName, email: u.email });\n\napp.post("/api/users", (req, res) => {\n  const { firstName, lastName, email, password } = req.body;\n  const user = { id: users.length + 1, firstName, lastName, email, passwordHash: "hashed:" + password, isAdmin: false };\n  users.push(user);\n  res.status(201).json(toDto(user));\n});\n\napp.get("/api/users/:id", (req, res) => {\n  const u = users.find((x) => x.id === Number(req.params.id));\n  if (!u) return res.status(404).json({ error: "Not found" });\n  res.json(toDto(u));\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'POST → 201 response DTO', steps: [{ method: 'POST', url: '/api/users', body: { firstName: 'Asha', lastName: 'Patil', email: 'asha@mail.com', password: 'Pass@123', isAdmin: true }, expect: { status: 201, json: { id: 1, fullName: 'Asha Patil', email: 'asha@mail.com' }, absent: ['password', 'passwordHash', 'isAdmin', 'firstName'] } }] },
        { name: 'GET → same DTO shape', steps: [{ method: 'POST', url: '/api/users', body: { firstName: 'Ravi', lastName: 'K', email: 'r@mail.com', password: 'x' } }, { method: 'GET', url: '/api/users/1', expect: { status: 200, json: { fullName: 'Ravi K' }, absent: ['passwordHash', 'isAdmin'] } }] },
      ],
      explain: 'The request DTO limits what clients can set (no `isAdmin` privilege escalation); the response DTO limits what they can see (no hashes). In C#, `CreateUserDto` and `UserDto` play exactly these roles.',
    },
  ],
};
