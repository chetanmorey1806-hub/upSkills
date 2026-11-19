export default {
  lesson: 'day-110-authentication-authorization-identity',
  minutes: 35,
  intro: 'Tell authentication from authorization, set up ASP.NET Core Identity with EF Core and implement user registration and login with UserManager and SignInManager.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which pair is correct?',
      options: [
        'Authentication = what you may do; Authorization = who you are',
        'Authentication = who you are (verify identity); Authorization = what you are allowed to do',
        'Both mean the same thing',
        'Authentication happens after authorization',
      ],
      answer: 1,
      explain: '**Authentication** proves identity (login, token validation) → failure is 401. **Authorization** checks permissions (roles, policies) → failure is 403. That is also why `UseAuthentication()` comes before `UseAuthorization()`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the Identity registration so users and roles are stored through EF Core in `AppDbContext`:\n```\nbuilder.Services.AddIdentity<AppUser, IdentityRole>()\n    .______<AppDbContext>()\n    .AddDefaultTokenProviders();\n```',
      example: { title: 'the DbContext base class', code: 'public class AppDbContext : IdentityDbContext<AppUser> { ... }' },
      accept: ['AddEntityFrameworkStores'],
      caseSensitive: true,
      explain: '`AddEntityFrameworkStores<TContext>()` connects Identity\'s UserManager/RoleManager to the AspNetUsers, AspNetRoles... tables created by migrations of an `IdentityDbContext`.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Identity uses these password options. For each password, does `CreateAsync` succeed? Type `ok` or `fail` one per line:\n1. `asha1234`\n2. `Asha@1234`\n3. `Asha@12`\n4. `ASHA@1234`',
      example: { title: 'reading the result', code: 'var result = await _userManager.CreateAsync(user, dto.Password);\nif (!result.Succeeded) return BadRequest(result.Errors);' },
      code: `builder.Services.Configure<IdentityOptions>(o =>
{
    o.Password.RequiredLength = 8;
    o.Password.RequireDigit = true;
    o.Password.RequireUppercase = true;
    o.Password.RequireLowercase = true;
    o.Password.RequireNonAlphanumeric = true;
});`,
      expected: `fail
ok
fail
fail`,
      explain: '"asha1234" has no uppercase and no symbol. "Asha@1234" satisfies everything. "Asha@12" is only 7 characters. "ASHA@1234" has no lowercase letter. `result.Errors` lists every failed rule so the UI can show them.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about ASP.NET Core Identity are TRUE? (choose all that apply)',
      options: [
        'UserManager.CreateAsync(user, password) hashes the password before saving',
        'SignInManager.PasswordSignInAsync / CheckPasswordSignInAsync verifies a password',
        'Identity supports lockout after several failed logins',
        'Passwords are stored in plain text in AspNetUsers so admins can read them',
        'RoleManager creates roles and UserManager.AddToRoleAsync assigns them',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Identity stores only a salted **hash** (PasswordHash column, PBKDF2 by default) and offers lockout, email confirmation and 2FA. For an API you usually check the password with `CheckPasswordSignInAsync` and then issue a JWT.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: '**Write Identity\'s password validator.** `passwordErrors(pw)` returns an array of the failing rules, in this order, using exactly these codes: `"PasswordTooShort"` (< 8), `"PasswordRequiresDigit"`, `"PasswordRequiresUpper"`, `"PasswordRequiresLower"`, `"PasswordRequiresNonAlphanumeric"`. Empty array = valid.',
      example: { title: 'testing a character class', code: '/[0-9]/.test("abc1") // true' },
      starter: 'function passwordErrors(pw) {\n  const errors = [];\n  // TODO\n  return errors;\n}\n',
      solution: 'function passwordErrors(pw) {\n  const errors = [];\n  if (pw.length < 8) errors.push("PasswordTooShort");\n  if (!/[0-9]/.test(pw)) errors.push("PasswordRequiresDigit");\n  if (!/[A-Z]/.test(pw)) errors.push("PasswordRequiresUpper");\n  if (!/[a-z]/.test(pw)) errors.push("PasswordRequiresLower");\n  if (!/[^a-zA-Z0-9]/.test(pw)) errors.push("PasswordRequiresNonAlphanumeric");\n  return errors;\n}\n',
      tests: [
        { call: 'passwordErrors("Asha@1234")', expect: [] },
        { call: 'passwordErrors("asha1234")', expect: ['PasswordRequiresUpper', 'PasswordRequiresNonAlphanumeric'] },
        { call: 'passwordErrors("Asha@12")', expect: ['PasswordTooShort'] },
        { call: 'passwordErrors("ASHA@1234")', expect: ['PasswordRequiresLower'] },
      ],
      explain: 'These are the real Identity error codes (`IdentityError.Code`). Returning **all** failures at once lets the registration page show a checklist instead of one error per attempt.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**The same register/login flow in Express.**\n- `POST /api/account/register` `{ email, password }`: password shorter than 8 → `400` `{ "errors": ["PasswordTooShort"] }`; existing email → `400` `{ "errors": ["DuplicateEmail"] }`; else store the user with `passwordHash: "hash:" + password` and return `201` `{ "email": ... }` (never the hash)\n- `POST /api/account/login`: correct → `200` `{ "message": "Logged in" }`, else `401` `{ "error": "Invalid login attempt" }`',
      example: { title: 'never return secrets', code: 'res.status(201).json({ id: user.id, email: user.email });' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = [{ email: "asha@mail.com", passwordHash: "hash:Asha@1234" }];\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nconst users = [{ email: "asha@mail.com", passwordHash: "hash:Asha@1234" }];\n\napp.post("/api/account/register", (req, res) => {\n  const { email, password } = req.body;\n  if (!password || password.length < 8) return res.status(400).json({ errors: ["PasswordTooShort"] });\n  if (users.some((u) => u.email === email)) return res.status(400).json({ errors: ["DuplicateEmail"] });\n  users.push({ email, passwordHash: "hash:" + password });\n  res.status(201).json({ email });\n});\n\napp.post("/api/account/login", (req, res) => {\n  const { email, password } = req.body;\n  const u = users.find((x) => x.email === email);\n  if (!u || u.passwordHash !== "hash:" + password) return res.status(401).json({ error: "Invalid login attempt" });\n  res.json({ message: "Logged in" });\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'short password → 400', steps: [{ method: 'POST', url: '/api/account/register', body: { email: 'ravi@mail.com', password: 'abc' }, expect: { status: 400, json: { errors: ['PasswordTooShort'] } } }] },
        { name: 'duplicate → 400', steps: [{ method: 'POST', url: '/api/account/register', body: { email: 'asha@mail.com', password: 'Another@123' }, expect: { status: 400, json: { errors: ['DuplicateEmail'] } } }] },
        { name: 'register → login', steps: [{ method: 'POST', url: '/api/account/register', body: { email: 'ravi@mail.com', password: 'Ravi@1234' }, expect: { status: 201, json: { email: 'ravi@mail.com' }, absent: ['passwordHash', 'password'] } }, { method: 'POST', url: '/api/account/login', body: { email: 'ravi@mail.com', password: 'Ravi@1234' }, expect: { status: 200, json: { message: 'Logged in' } } }] },
        { name: 'wrong password → 401', steps: [{ method: 'POST', url: '/api/account/login', body: { email: 'asha@mail.com', password: 'x' }, expect: { status: 401, json: { error: 'Invalid login attempt' } } }] },
      ],
      explain: 'Same shape as an Identity-based AccountController: `CreateAsync` errors → 400 with codes, `CheckPasswordSignInAsync` failure → 401 with a generic message (do not reveal whether the email exists).',
    },
  ],
};
