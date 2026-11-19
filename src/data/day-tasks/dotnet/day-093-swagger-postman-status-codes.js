export default {
  lesson: 'day-093-swagger-postman-status-codes',
  minutes: 28,
  intro: 'Document and try your API with Swagger/OpenAPI, test it with Postman collections and assertions, and return the right HTTP status codes.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the service registration that generates the OpenAPI document for Swagger UI (Swashbuckle):\n```\nbuilder.Services.AddEndpointsApiExplorer();\nbuilder.Services.______;\n```',
      example: { title: 'the middleware part', code: 'if (app.Environment.IsDevelopment()) {\n    app.UseSwagger();\n    app.UseSwaggerUI();\n}' },
      accept: ['AddSwaggerGen()', 'AddSwaggerGen();'],
      caseSensitive: true,
      explain: '`AddSwaggerGen()` builds the OpenAPI (swagger.json) description from your controllers; `UseSwagger()` serves it and `UseSwaggerUI()` serves the interactive page at /swagger.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `[ProducesResponseType(StatusCodes.Status404NotFound)]` on an action do?',
      options: ['It forces the action to return 404', 'It documents in Swagger/OpenAPI that the action can return 404', 'It catches NotFound exceptions', 'It changes the route'],
      answer: 1,
      explain: '`ProducesResponseType` is **documentation**: Swagger shows every possible response so frontend developers know what to handle. It does not change behaviour.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Match each situation to its status code. Type the codes one per line in order:\n1. Login with a wrong password\n2. Logged-in student calls an admin-only endpoint\n3. Registering an email that already exists\n4. POST body with an invalid age\n5. Unhandled exception in the server\n6. Product created',
      example: { title: 'three you know', code: 'OK → 200   Not found → 404   Deleted (no body) → 204' },
      code: 'Choose from: 200 201 204 400 401 403 404 409 500',
      expected: `401
403
409
400
500
201`,
      explain: '401 = not authenticated, 403 = authenticated but not allowed, 409 Conflict = clashes with the current state (duplicate), 400 = invalid input, 500 = server bug, 201 = created. Using 200 for everything forces clients to parse bodies to find errors.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are useful Postman features for API testing? (choose all that apply)',
      options: [
        'Collections to group requests (e.g. Students API)',
        'Environments with variables like {{baseUrl}} and {{token}}',
        'Tests tab scripts: pm.test("201", () => pm.response.to.have.status(201))',
        'Saving the JWT from a login response into a variable with pm.environment.set',
        'Postman compiles your C# code',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Collections + environments + test scripts turn Postman into an automated API test suite (also runnable in CI with Newman). It only sends HTTP requests - it never compiles your code.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: '**Write Postman-style assertions.** `checkResponse(res, expected)` gets `res = { status, body }` and `expected = { status, keys }` (keys the body must contain). Return an array of failure messages (empty array = all passed):\n- `"Expected status X but got Y"`\n- `"Missing key: k"` for each missing key',
      example: { title: 'a Postman test script', code: 'pm.test("has id", () => pm.expect(pm.response.json()).to.have.property("id"));' },
      starter: 'function checkResponse(res, expected) {\n  const failures = [];\n  // TODO\n  return failures;\n}\n',
      solution: 'function checkResponse(res, expected) {\n  const failures = [];\n  if (res.status !== expected.status) failures.push("Expected status " + expected.status + " but got " + res.status);\n  for (const k of expected.keys || []) {\n    if (!res.body || !(k in res.body)) failures.push("Missing key: " + k);\n  }\n  return failures;\n}\n',
      tests: [
        { call: 'checkResponse({ status: 201, body: { id: 3, name: "Pen" } }, { status: 201, keys: ["id", "name"] })', expect: [] },
        { call: 'checkResponse({ status: 200, body: { name: "Pen" } }, { status: 201, keys: ["id", "name"] })', expect: ['Expected status 201 but got 200', 'Missing key: id'] },
        { call: 'checkResponse({ status: 404, body: null }, { status: 404, keys: [] })', expect: [] },
      ],
      explain: 'Automated checks on **status + response shape** catch regressions every time the API changes - the same assertions Postman tests (and later xUnit integration tests) perform.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 9,
      q: '**Correct status codes in Express.** `POST /api/register` with `{ email, password }`:\n- missing email or password shorter than 8 → `400` `{ "error": "Invalid input" }`\n- email already registered (`asha@mail.com` exists) → `409` `{ "error": "Email already registered" }`\n- otherwise → `201` `{ "email": ... }`\n\n`POST /api/login` with `{ email, password }`: correct → `200` `{ "message": "Welcome" }`, wrong → `401` `{ "error": "Invalid credentials" }`.',
      example: { title: 'conflict response', code: 'return res.status(409).json({ error: "Username taken" });' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = [{ email: "asha@mail.com", password: "Asha@1234" }];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = [{ email: "asha@mail.com", password: "Asha@1234" }];\n\napp.post("/api/register", (req, res) => {\n  const { email, password } = req.body;\n  if (!email || !password || password.length < 8) return res.status(400).json({ error: "Invalid input" });\n  if (users.some((u) => u.email === email)) return res.status(409).json({ error: "Email already registered" });\n  users.push({ email, password });\n  res.status(201).json({ email });\n});\n\napp.post("/api/login", (req, res) => {\n  const { email, password } = req.body;\n  const u = users.find((x) => x.email === email && x.password === password);\n  if (!u) return res.status(401).json({ error: "Invalid credentials" });\n  res.json({ message: "Welcome" });\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'register invalid → 400', steps: [{ method: 'POST', url: '/api/register', body: { email: 'ravi@mail.com', password: '123' }, expect: { status: 400, json: { error: 'Invalid input' } } }] },
        { name: 'register duplicate → 409', steps: [{ method: 'POST', url: '/api/register', body: { email: 'asha@mail.com', password: 'Another@123' }, expect: { status: 409, json: { error: 'Email already registered' } } }] },
        { name: 'register → 201 then login → 200', steps: [{ method: 'POST', url: '/api/register', body: { email: 'ravi@mail.com', password: 'Ravi@1234' }, expect: { status: 201, json: { email: 'ravi@mail.com' } } }, { method: 'POST', url: '/api/login', body: { email: 'ravi@mail.com', password: 'Ravi@1234' }, expect: { status: 200, json: { message: 'Welcome' } } }] },
        { name: 'wrong password → 401', steps: [{ method: 'POST', url: '/api/login', body: { email: 'asha@mail.com', password: 'wrong' }, expect: { status: 401 } }] },
      ],
      explain: 'Each failure gets its own precise code so the client can react: show field errors (400), suggest "forgot password?" (409), or ask to log in again (401). Swagger documents them with `[ProducesResponseType]`.',
    },
  ],
};
