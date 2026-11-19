export default {
  lesson: 'day-111-password-hashing-jwt-refresh-tokens',
  minutes: 38,
  intro: 'Store passwords as salted slow hashes, validate password strength, issue short-lived JWT access tokens and rotate refresh tokens safely.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Why are passwords stored with a **salted, slow** hash (PBKDF2/bcrypt) instead of plain SHA-256 or encryption?',
      options: [
        'It makes login faster',
        'Hashes cannot be reversed; a unique salt defeats precomputed rainbow tables and slowness makes brute force expensive',
        'So admins can decrypt them when users forget',
        'SHA-256 is not available in .NET',
      ],
      answer: 1,
      explain: 'A hash is one-way; the **salt** makes identical passwords produce different hashes; a deliberately **slow** algorithm (many iterations) limits guessing speed if the database leaks. Encryption is reversible, so it is the wrong tool for passwords.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this code print? (`PasswordHasher` uses a random salt per hash.)',
      example: { title: 'verifying a password', code: 'var r = hasher.VerifyHashedPassword(user, storedHash, typedPassword);\n// PasswordVerificationResult.Success or Failed' },
      code: `var hasher = new PasswordHasher<AppUser>();
var user = new AppUser();

string h1 = hasher.HashPassword(user, "Asha@1234");
string h2 = hasher.HashPassword(user, "Asha@1234");

Console.WriteLine(h1 == h2);
Console.WriteLine(hasher.VerifyHashedPassword(user, h1, "Asha@1234"));
Console.WriteLine(hasher.VerifyHashedPassword(user, h2, "asha@1234"));`,
      expected: `False
Success
Failed`,
      explain: 'Different salts → two different hashes for the same password, so you can never compare hashes directly - always use `VerifyHashedPassword`, which re-hashes with the stored salt. Passwords are case-sensitive. C# prints booleans as `True`/`False`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the JWT creation line that sets a **15-minute** lifetime:\n```\nvar token = new JwtSecurityToken(\n    issuer: "upskillr-api",\n    audience: "upskillr-react",\n    claims: claims,\n    expires: ______,\n    signingCredentials: creds);\n```',
      example: { title: 'refresh token lifetime', code: 'ExpiresAt = DateTime.UtcNow.AddDays(7)' },
      accept: ['DateTime.UtcNow.AddMinutes(15)'],
      acceptRegex: ['^DateTime(Offset)?\\.UtcNow\\.AddMinutes\\(\\s*15\\s*\\)$'],
      caseSensitive: true,
      explain: 'Always use **UtcNow** for token times (servers in different time zones). Short access tokens limit the damage of a stolen token; the refresh token (days) is what keeps the user logged in.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which refresh-token practices are correct? (choose all that apply)',
      options: [
        'Generate refresh tokens with a cryptographically secure random generator (RandomNumberGenerator)',
        'Store them hashed in the database with an expiry and a revoked flag',
        'Rotate: each refresh issues a NEW refresh token and revokes the old one',
        'Put the refresh token inside the JWT payload',
        'If a revoked refresh token is used again, treat it as theft and revoke the whole token family',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Refresh tokens are long-lived secrets, so they are random, stored server-side (hashed), short enough and **rotated**. Reuse of an old one signals that it was stolen. The JWT payload is readable by anyone - never put secrets there.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 10,
      q: '**Refresh token rotation.** Write `createTokenStore()` returning `{ issue(userId, now), refresh(token, now) }`:\n- `issue` creates `{ token: "rt" + n, userId, expires: now + 7 days in ms, revoked: false }` (n = 1, 2, 3...) and returns the token string\n- `refresh(token, now)`: unknown → `{ error: "invalid" }`; revoked → revoke **all** tokens of that user and return `{ error: "reused" }`; expired (`now >= expires`) → `{ error: "expired" }`; otherwise revoke it and return `{ token: <new token>, userId }`',
      example: { title: 'days to milliseconds', code: 'const WEEK = 7 * 24 * 60 * 60 * 1000;' },
      starter: 'function createTokenStore() {\n  // TODO\n}\n',
      solution: 'function createTokenStore() {\n  const WEEK = 7 * 24 * 60 * 60 * 1000;\n  const tokens = new Map();\n  let n = 0;\n  function issue(userId, now) {\n    const token = "rt" + ++n;\n    tokens.set(token, { token, userId, expires: now + WEEK, revoked: false });\n    return token;\n  }\n  function refresh(token, now) {\n    const t = tokens.get(token);\n    if (!t) return { error: "invalid" };\n    if (t.revoked) {\n      for (const x of tokens.values()) if (x.userId === t.userId) x.revoked = true;\n      return { error: "reused" };\n    }\n    if (now >= t.expires) return { error: "expired" };\n    t.revoked = true;\n    return { token: issue(t.userId, now), userId: t.userId };\n  }\n  return { issue, refresh };\n}\n',
      tests: [
        { call: '(() => { const s = createTokenStore(); const t = s.issue(7, 0); return s.refresh(t, 1000); })()', expect: { token: 'rt2', userId: 7 }, msg: 'A valid refresh returns a new token for the same user' },
        { call: '(() => { const s = createTokenStore(); return s.refresh("nope", 0); })()', expect: { error: 'invalid' } },
        { call: '(() => { const s = createTokenStore(); const t = s.issue(7, 0); return s.refresh(t, 8 * 24 * 3600 * 1000); })()', expect: { error: 'expired' } },
        { call: '(() => { const s = createTokenStore(); const t1 = s.issue(7, 0); const r = s.refresh(t1, 1); const reuse = s.refresh(t1, 2); const after = s.refresh(r.token, 3); return [reuse, after]; })()', expect: [{ error: 'reused' }, { error: 'reused' }], msg: 'Reusing an old token must revoke the whole family, so the new token stops working too' },
      ],
      explain: 'This is the server side of `POST /api/auth/refresh`. Rotation + reuse detection means a stolen refresh token works at most once, and the attack is noticed as soon as the real user (or the thief) uses the old one.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 9,
      q: '**The refresh endpoint in Express.** Tokens are kept in memory. `POST /api/auth/login` (`asha` / `Asha@1234`) → `200` `{ accessToken: "at-asha-<n>", refreshToken: "rt-<n>" }`. `POST /api/auth/refresh` with `{ refreshToken }`:\n- unknown or already used → `401` `{ "error": "Invalid refresh token" }`\n- valid → mark it used and return `200` with a NEW pair\n\n(`n` is a counter starting at 1 that increases with every pair issued.)',
      example: { title: 'a Set of used tokens', code: 'const used = new Set();\nif (used.has(t)) return res.status(401).json({ error: "..." });\nused.add(t);' },
      starter: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\n// TODO\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\napp.use(express.json());\n\nlet n = 0;\nconst active = new Map();\nfunction issue(user) {\n  n++;\n  const pair = { accessToken: "at-" + user + "-" + n, refreshToken: "rt-" + n };\n  active.set(pair.refreshToken, user);\n  return pair;\n}\n\napp.post("/api/auth/login", (req, res) => {\n  const { username, password } = req.body;\n  if (username !== "asha" || password !== "Asha@1234") return res.status(401).json({ error: "Invalid login attempt" });\n  res.json(issue("asha"));\n});\n\napp.post("/api/auth/refresh", (req, res) => {\n  const user = active.get(req.body.refreshToken);\n  if (!user) return res.status(401).json({ error: "Invalid refresh token" });\n  active.delete(req.body.refreshToken);\n  res.json(issue(user));\n});\n\napp.listen(3000);\n',
      tests: [
        { name: 'login → pair 1', steps: [{ method: 'POST', url: '/api/auth/login', body: { username: 'asha', password: 'Asha@1234' }, expect: { status: 200, json: { accessToken: 'at-asha-1', refreshToken: 'rt-1' } } }] },
        { name: 'refresh rotates', steps: [{ method: 'POST', url: '/api/auth/login', body: { username: 'asha', password: 'Asha@1234' } }, { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-1' }, expect: { status: 200, json: { accessToken: 'at-asha-2', refreshToken: 'rt-2' } } }] },
        { name: 'old token cannot be reused', steps: [{ method: 'POST', url: '/api/auth/login', body: { username: 'asha', password: 'Asha@1234' } }, { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-1' } }, { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-1' }, expect: { status: 401, json: { error: 'Invalid refresh token' } } }] },
        { name: 'unknown token → 401', steps: [{ method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-99' }, expect: { status: 401 } }] },
      ],
      explain: 'The React app calls this endpoint when an API call returns 401 because the access token expired, then retries with the new access token. A used refresh token must never work twice.',
    },
  ],
};
