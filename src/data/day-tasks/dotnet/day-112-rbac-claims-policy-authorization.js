export default {
  lesson: 'day-112-rbac-claims-policy-authorization',
  minutes: 35,
  intro: 'Design role-based access control, add custom claims to tokens, write policies with custom requirements and handlers, and do resource-based checks (owner or admin).',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'In a custom `AuthorizationHandler<MinimumAgeRequirement>`, complete the line that marks the requirement as **met**:\n```\nif (age >= requirement.MinimumAge)\n    ______;\nreturn Task.CompletedTask;\n```',
      example: { title: 'registering the handler', code: 'builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();' },
      accept: ['context.Succeed(requirement)', 'context.Succeed(requirement);'],
      caseSensitive: true,
      explain: 'Handlers call `context.Succeed(requirement)` when satisfied. Doing nothing means "not satisfied" (another handler may still succeed); `context.Fail()` vetoes the requirement no matter what other handlers say.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Policy `CanEditMarks` = role **Teacher OR Admin** AND claim `Verified = true`. Type the status code for each user calling an endpoint with `[Authorize(Policy = "CanEditMarks")]`, one per line:\n1. Admin, Verified=true\n2. Teacher, Verified=false\n3. Student, Verified=true\n4. Teacher, Verified=true',
      example: { title: 'RequireRole with several roles', code: 'p.RequireRole("Teacher", "Admin") // any one of them' },
      code: `o.AddPolicy("CanEditMarks", p => p
    .RequireRole("Teacher", "Admin")
    .RequireClaim("Verified", "true"));`,
      expected: `200
403
403
200`,
      explain: '`RequireRole` with several roles means **any** of them; chained requirements must **all** pass. A Teacher who is not verified, or a verified Student, gets 403.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Roles are coarse groups (Admin, Teacher); claims are facts (Department=IT, EmployeeId=42)',
        'Custom claims can be added to the JWT when it is created at login',
        'Resource-based authorization (e.g. "only the owner may edit this order") needs the resource, so it uses IAuthorizationService.AuthorizeAsync(User, order, "OwnerPolicy") in the action',
        'Policies can only check roles',
        'Keeping authorization rules in named policies avoids repeating role strings in many controllers',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Policies can check roles, claims, custom requirements and resources. Resource-based checks happen inside the action after loading the entity, because attributes run before the data is known.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Resource-based authorization.** Write `canEditOrder(user, order)`:\n- `Admin` role → true\n- `Manager` role → true only if `user.claims.region === order.region`\n- otherwise → true only if `order.ownerId === user.id`\n\n`user = { id, roles: [...], claims: { region } }`',
      example: { title: 'an owner check', code: 'const isOwner = doc.authorId === user.id;' },
      starter: 'function canEditOrder(user, order) {\n  // TODO\n}\n',
      solution: 'function canEditOrder(user, order) {\n  if (user.roles.includes("Admin")) return true;\n  if (user.roles.includes("Manager") && user.claims && user.claims.region === order.region) return true;\n  return order.ownerId === user.id;\n}\n',
      tests: [
        { call: 'canEditOrder({ id: 1, roles: ["Admin"], claims: {} }, { ownerId: 9, region: "West" })', expect: true },
        { call: 'canEditOrder({ id: 2, roles: ["Manager"], claims: { region: "West" } }, { ownerId: 9, region: "West" })', expect: true },
        { call: 'canEditOrder({ id: 2, roles: ["Manager"], claims: { region: "North" } }, { ownerId: 9, region: "West" })', expect: false },
        { call: 'canEditOrder({ id: 9, roles: ["Customer"], claims: {} }, { ownerId: 9, region: "West" })', expect: true },
        { call: 'canEditOrder({ id: 5, roles: ["Customer"], claims: {} }, { ownerId: 9, region: "West" })', expect: false },
      ],
      explain: 'This is the body of an `AuthorizationHandler<OperationRequirement, Order>`. Checking ownership prevents **IDOR** bugs, where any logged-in user can edit `/api/orders/9` just by changing the id.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**Owner-or-admin in Express.** The user comes from header `X-User` (`asha` = Admin id 1, `ravi` = Customer id 2, `meera` = Customer id 3).\n- `PUT /api/orders/:id` with `{ address }`: unknown user → `401`; order missing → `404`; not owner and not Admin → `403` `{ "error": "Forbidden" }`; else update and return `200` with the order\n\nOrder 10 belongs to ravi, order 11 to meera.',
      example: { title: 'check after loading the resource', code: 'const doc = docs.find(...);\nif (!doc) return res.status(404).end();\nif (doc.ownerId !== req.user.id) return res.status(403).end();' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = { asha: { id: 1, role: "Admin" }, ravi: { id: 2, role: "Customer" }, meera: { id: 3, role: "Customer" } };\nconst orders = [{ id: 10, ownerId: 2, address: "Nagpur" }, { id: 11, ownerId: 3, address: "Mumbai" }];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = { asha: { id: 1, role: "Admin" }, ravi: { id: 2, role: "Customer" }, meera: { id: 3, role: "Customer" } };\nconst orders = [{ id: 10, ownerId: 2, address: "Nagpur" }, { id: 11, ownerId: 3, address: "Mumbai" }];\n\napp.put("/api/orders/:id", (req, res) => {\n  const user = users[req.headers["x-user"]];\n  if (!user) return res.status(401).json({ error: "Unauthorized" });\n  const order = orders.find((o) => o.id === Number(req.params.id));\n  if (!order) return res.status(404).json({ error: "Not found" });\n  if (user.role !== "Admin" && order.ownerId !== user.id) return res.status(403).json({ error: "Forbidden" });\n  order.address = req.body.address;\n  res.json(order);\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'owner edits → 200', steps: [{ method: 'PUT', url: '/api/orders/10', headers: { 'X-User': 'ravi' }, body: { address: 'Pune' }, expect: { status: 200, json: { id: 10, address: 'Pune' } } }] },
        { name: 'other customer → 403', steps: [{ method: 'PUT', url: '/api/orders/11', headers: { 'X-User': 'ravi' }, body: { address: 'Hack' }, expect: { status: 403, json: { error: 'Forbidden' } } }] },
        { name: 'admin edits any → 200', steps: [{ method: 'PUT', url: '/api/orders/11', headers: { 'X-User': 'asha' }, body: { address: 'Thane' }, expect: { status: 200, json: { address: 'Thane' } } }] },
        { name: 'missing order → 404', steps: [{ method: 'PUT', url: '/api/orders/99', headers: { 'X-User': 'asha' }, body: { address: 'X' }, expect: { status: 404 } }] },
        { name: 'anonymous → 401', steps: [{ method: 'PUT', url: '/api/orders/10', body: { address: 'X' }, expect: { status: 401 } }] },
      ],
      explain: 'Order of checks: authenticate (401) → load (404) → authorize against the resource (403). Skipping the ownership check is one of the most common real-world API vulnerabilities (OWASP API #1: Broken Object Level Authorization).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Where are custom claims like `Department` usually put so `RequireClaim("Department", "IT")` can see them in an API?',
      options: ['In appsettings.json', 'In the JWT created at login (new Claim("Department", user.Department))', 'In a cookie read by React', 'In the URL'],
      answer: 1,
      explain: 'The login endpoint adds claims from the database to the token. On every request `AddJwtBearer` turns them into `User.Claims`, which policies check. Changing a user\'s claims takes effect when they get a new token.',
    },
  ],
};
