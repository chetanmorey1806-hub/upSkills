export default {
  lesson: 'day-095-authorization-roles-claims-policies-identity',
  minutes: 33,
  intro: 'Protect endpoints with [Authorize], roles, claims and named policies, and see where ASP.NET Core Identity fits in.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute so only users in the **Admin** role can call this action:\n`[______]`\n`public IActionResult DeleteStudent(int id) { ... }`',
      example: { title: 'two roles allowed', code: '[Authorize(Roles = "Admin,Teacher")]' },
      accept: ['Authorize(Roles = "Admin")', 'Authorize(Roles="Admin")'],
      acceptRegex: ['^Authorize\\(\\s*Roles\\s*=\\s*"Admin"\\s*\\)$'],
      caseSensitive: true,
      explain: '`Roles = "Admin"` checks the role claim of the authenticated user. A comma-separated list means **any** of those roles. Stacking two `[Authorize(Roles=...)]` attributes means the user needs **both**.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Type the **status code** for each caller, one per line:\n1. No token at all\n2. Token with role `Student`, claim `Department = IT`\n3. Token with role `Teacher`, claim `Department = HR`\n4. Token with role `Teacher`, claim `Department = IT`',
      example: { title: 'reading a policy', code: 'p.RequireRole("Manager").RequireClaim("Region", "West")\n// needs BOTH the role and the claim value' },
      code: `builder.Services.AddAuthorization(o =>
    o.AddPolicy("ITTeachers", p => p
        .RequireRole("Teacher")
        .RequireClaim("Department", "IT")));

[Authorize(Policy = "ITTeachers")]
[HttpPost("api/labs/{id}/grades")]
public IActionResult Grade(int id) => Ok();`,
      expected: `401
403
403
200`,
      explain: 'No token → **401** (not authenticated). A Student fails the role requirement → **403**. A HR Teacher has the role but not the claim value → **403**. Only an IT Teacher satisfies every requirement of the policy → 200.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'A claim is a key-value fact about the user (e.g. email, department, role)',
        'Policies combine requirements and are referenced by name: [Authorize(Policy = "AdultsOnly")]',
        '[AllowAnonymous] on Login lets unauthenticated users call it even if the controller has [Authorize]',
        'ASP.NET Core Identity provides user/role storage, password hashing and sign-in APIs',
        'Hiding the Delete button in React is enough to secure the delete endpoint',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Roles are just a kind of claim; policies give names to rules; Identity handles users, roles and secure password storage. UI hiding is only convenience - the **API** must enforce authorization.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Read the logged-in user\'s id claim inside a controller:\n`var userId = User.______(ClaimTypes.NameIdentifier)?.Value;`',
      example: { title: 'checking a role in code', code: 'if (User.IsInRole("Admin")) { ... }' },
      accept: ['FindFirst'],
      caseSensitive: true,
      explain: '`User` is the `ClaimsPrincipal` built from the token. `FindFirst(type)` returns the first matching claim (or null); `User.FindFirstValue(...)` is a shortcut returning the value directly.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Write the policy check.** `authorize(user, policy)` returns `401`, `403` or `200`:\n- `user` is `null` → `401`\n- `policy.roles` (array, optional): the user\'s `roles` must contain **at least one** of them\n- `policy.claims` (object, optional): for each key the user\'s `claims[key]` must equal the value\n- otherwise `200`',
      example: { title: 'checking "any of"', code: 'const ok = required.some((r) => user.roles.includes(r));' },
      starter: 'function authorize(user, policy) {\n  // TODO\n}\n',
      solution: 'function authorize(user, policy) {\n  if (!user) return 401;\n  if (policy.roles && !policy.roles.some((r) => (user.roles || []).includes(r))) return 403;\n  for (const [k, v] of Object.entries(policy.claims || {})) {\n    if ((user.claims || {})[k] !== v) return 403;\n  }\n  return 200;\n}\n',
      tests: [
        { call: 'authorize(null, { roles: ["Admin"] })', expect: 401 },
        { call: 'authorize({ roles: ["Student"], claims: { Department: "IT" } }, { roles: ["Teacher"], claims: { Department: "IT" } })', expect: 403 },
        { call: 'authorize({ roles: ["Teacher"], claims: { Department: "HR" } }, { roles: ["Teacher"], claims: { Department: "IT" } })', expect: 403 },
        { call: 'authorize({ roles: ["Teacher", "Admin"], claims: { Department: "IT" } }, { roles: ["Admin", "Principal"], claims: { Department: "IT" } })', expect: 200 },
        { call: 'authorize({ roles: [], claims: {} }, {})', expect: 200, msg: 'An empty policy only requires a logged-in user' },
      ],
      explain: 'This is what the authorization middleware evaluates for `[Authorize(Policy = ...)]`: authentication first (401), then every requirement (403). Plain `[Authorize]` is the empty policy: "any authenticated user".',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 9,
      q: '**Role-based authorization in Express.** Users are identified by the header `X-User` (a stand-in for a validated token): `asha` is `Admin`, `ravi` is `Student`.\n- write a middleware factory `requireRole(role)` → `401` `{ "error": "Unauthorized" }` if the user is unknown/missing, `403` `{ "error": "Forbidden" }` if the role differs\n- `GET /api/students` → any logged-in user → `200` array\n- `DELETE /api/students/:id` → Admin only → `204`',
      example: { title: 'a middleware factory', code: 'const requirePlan = (plan) => (req, res, next) =>\n  req.user.plan === plan ? next() : res.status(403).json({ error: "Upgrade" });' },
      starter: 'const express = require("express");\nconst app = express();\n\nconst users = { asha: { name: "asha", role: "Admin" }, ravi: { name: "ravi", role: "Student" } };\nconst students = [{ id: 1, name: "Meera" }, { id: 2, name: "Kiran" }];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\nconst users = { asha: { name: "asha", role: "Admin" }, ravi: { name: "ravi", role: "Student" } };\nlet students = [{ id: 1, name: "Meera" }, { id: 2, name: "Kiran" }];\n\nfunction requireAuth(req, res, next) {\n  const u = users[req.headers["x-user"]];\n  if (!u) return res.status(401).json({ error: "Unauthorized" });\n  req.user = u;\n  next();\n}\nconst requireRole = (role) => (req, res, next) => {\n  const u = users[req.headers["x-user"]];\n  if (!u) return res.status(401).json({ error: "Unauthorized" });\n  if (u.role !== role) return res.status(403).json({ error: "Forbidden" });\n  req.user = u;\n  next();\n};\n\napp.get("/api/students", requireAuth, (req, res) => res.json(students));\napp.delete("/api/students/:id", requireRole("Admin"), (req, res) => {\n  students = students.filter((s) => s.id !== Number(req.params.id));\n  res.status(204).end();\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'anonymous list → 401', steps: [{ method: 'GET', url: '/api/students', expect: { status: 401 } }] },
        { name: 'student list → 200', steps: [{ method: 'GET', url: '/api/students', headers: { 'X-User': 'ravi' }, expect: { status: 200, length: 2 } }] },
        { name: 'student delete → 403', steps: [{ method: 'DELETE', url: '/api/students/1', headers: { 'X-User': 'ravi' }, expect: { status: 403, json: { error: 'Forbidden' } } }] },
        { name: 'admin delete → 204', steps: [{ method: 'DELETE', url: '/api/students/1', headers: { 'X-User': 'asha' }, expect: { status: 204 } }, { method: 'GET', url: '/api/students', headers: { 'X-User': 'asha' }, expect: { length: 1 } }] },
        { name: 'anonymous delete → 401', steps: [{ method: 'DELETE', url: '/api/students/1', expect: { status: 401 } }] },
      ],
      explain: '`requireRole("Admin")` is the Express version of `[Authorize(Roles = "Admin")]`: identify the user first (401), then check permissions (403). Keeping the check in reusable middleware avoids forgetting it in one route.',
    },
  ],
};
