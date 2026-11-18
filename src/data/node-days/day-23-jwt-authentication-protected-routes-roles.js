export default {
  id: 'day-23-jwt-authentication-protected-routes-roles',
  title: 'JWT Authentication, Protected Routes and Role-based Authorization',
  module: 'Module 4: Authentication & Security',
  day: 23,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'After a successful login the server issues a signed JSON Web Token. The client sends it in the Authorization header and middleware verifies it on every protected route. Today you build authenticate and authorize(roles) middleware with jsonwebtoken and learn access/refresh tokens and where to store them.',
  objectives: [
    'Explain authentication vs authorization and stateless token auth vs sessions',
    'Describe the three parts of a JWT and why the payload is readable but cannot be changed',
    'Sign and verify tokens with jsonwebtoken (expiresIn, algorithms, error types)',
    'Write authenticate and authorize(...roles) middleware and return correct 401 / 403 codes',
    'Design access + refresh tokens and choose between Authorization header and httpOnly cookies',
  ],
  theory: [
    {
      heading: 'Authentication vs authorization, sessions vs tokens',
      content:
        '**Authentication** answers "Who are you?" (login). **Authorization** answers "What are you allowed to do?" (roles, permissions). A wrong or missing identity is **401 Unauthorized**; a known user without permission is **403 Forbidden**.\n\nHTTP is stateless: each request is independent, so after login the server needs a way to recognise the user on the next request.\n- **Sessions**: the server stores `{ sessionId → userId }` (memory/Redis) and gives the browser a cookie with the session id. Easy to revoke; needs shared storage when you run many servers.\n- **Tokens (JWT)**: the server gives the client a **signed** token that itself contains the user id and role. Any server holding the secret can verify it without a database lookup - perfect for APIs, mobile apps and microservices. Revocation is harder (the token is valid until it expires).\n\n**Analogy:** a session is a cloakroom ticket - the number is meaningless without the cloakroom\'s book. A JWT is a festival wristband with a holographic seal: security reads the info printed on it and checks the seal, no book needed.',
    },
    {
      heading: 'Anatomy of a JWT',
      content:
        'A JWT is three base64url strings joined by dots: `header.payload.signature`.\n- **Header**: `{"alg":"HS256","typ":"JWT"}` - the signing algorithm.\n- **Payload** (claims): `{"sub":"42","role":"admin","iat":1794987742,"exp":1794991342}`. Registered claims: `sub` (subject/user id), `iat` (issued at), `exp` (expiry, seconds since 1970), `iss` (issuer), `aud` (audience).\n- **Signature**: HMAC-SHA256(header + "." + payload, secret).\n\n**Important:** the payload is only *encoded*, not encrypted. Anyone can paste the token into jwt.io and read it. Never put passwords, card numbers or secrets in it. What the signature guarantees is **integrity**: if someone changes `"role":"user"` to `"admin"`, the signature no longer matches and `jwt.verify` throws `invalid signature`.\n\nAlgorithms: **HS256** uses one shared secret (sign + verify) - fine for a single backend. **RS256/ES256** sign with a private key and verify with a public key - used when other services must verify tokens without being able to create them.',
      tip: 'Use a long random secret (at least 32 bytes, e.g. node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))") stored in an environment variable, never in Git.',
    },
    {
      heading: 'jsonwebtoken API',
      content:
        '`npm install jsonwebtoken`\n\n- `jwt.sign(payload, secret, { expiresIn: "15m" })` → token string. `expiresIn` accepts seconds or strings like "15m", "7d".\n- `jwt.verify(token, secret, { algorithms: ["HS256"] })` → decoded payload, or **throws**: `TokenExpiredError` (exp passed), `JsonWebTokenError` (bad signature, malformed), `NotBeforeError`.\n- `jwt.decode(token)` → payload **without** checking the signature. Never use it for authentication.\n\nAlways pass `algorithms` to `verify` so an attacker cannot trick the library into using a different algorithm (the historic "alg: none" and RS/HS confusion attacks).',
      syntax: `const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });`,
    },
    {
      heading: 'Protecting routes with middleware',
      content:
        'The client sends the token on every request in the header:\n`Authorization: Bearer eyJhbGciOi...`\n\nAn **authenticate** middleware:\n1. Reads `req.headers.authorization` and checks it starts with `Bearer `.\n2. Verifies the token. On error → `401`.\n3. Attaches the user info to `req.user` and calls `next()`.\n\nAn **authorize(...roles)** middleware factory runs after it: if `req.user.role` is not in the allowed list → `403`.\n\nApply them per route (`app.get("/admin", authenticate, authorize("admin"), handler)`) or to a whole router (`router.use(authenticate)`). Ownership checks ("users may edit only their own posts") belong in the handler or service: compare `post.authorId` with `req.user.id`.',
      syntax: `const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });

router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteProduct);`,
    },
    {
      heading: 'Access tokens, refresh tokens and storage',
      content:
        'A stolen JWT works until it expires, so **access tokens are short-lived** (5-15 minutes). To avoid logging the user in every 15 minutes we add a **refresh token**: long-lived (7-30 days), random or JWT, **stored in the database** so it can be revoked, and sent only to `POST /api/auth/refresh` which issues a new access token (and usually rotates the refresh token). Logout deletes the refresh token.\n\n**Where should the browser keep tokens?**\n- `localStorage`: easy, but any XSS script can read it.\n- **httpOnly, Secure, SameSite cookie**: JavaScript cannot read it (protects from XSS theft); the browser sends it automatically, so protect against CSRF with SameSite=Strict/Lax and/or CSRF tokens.\n- A common SPA pattern: access token in memory (JS variable), refresh token in an httpOnly cookie scoped to `/api/auth/refresh`.\n\nMobile apps store tokens in secure storage (Keychain / Keystore) and send the Authorization header.',
      points: [
        'Access token: short, stateless, sent with every API call',
        'Refresh token: long, stored server-side (revocable), used only to get new access tokens',
        'Logout everywhere: delete all refresh tokens of the user, or bump a tokenVersion claim',
      ],
    },
  ],
  examples: [
    {
      title: 'Sign, decode and verify a token (and watch it fail)',
      scenario: 'Understand exactly what jsonwebtoken does before using it in Express.',
      steps: [
        'npm init -y && npm install jsonwebtoken',
        'Create jwt-demo.js with the code below',
        'Run node jwt-demo.js (token and timestamps differ every run)',
        'Paste the printed token into https://jwt.io to see the readable payload',
      ],
      code: `const jwt = require('jsonwebtoken');

const SECRET = 'dev-secret-change-me'; // in real apps: process.env.JWT_SECRET

const token = jwt.sign({ sub: '42', role: 'admin' }, SECRET, { expiresIn: '1h' });
console.log('token:', token);

const [header, payload] = token.split('.');
console.log('header :', Buffer.from(header, 'base64url').toString());
console.log('payload:', Buffer.from(payload, 'base64url').toString());

const decoded = jwt.verify(token, SECRET);
console.log('verified:', decoded.sub, decoded.role, 'expires in', decoded.exp - decoded.iat, 'seconds');

try {
  jwt.verify(token, 'wrong-secret');
} catch (err) {
  console.log('wrong secret ->', err.name + ':', err.message);
}

const tampered = token.split('.');
tampered[1] = Buffer.from(JSON.stringify({ sub: '42', role: 'superadmin' })).toString('base64url');
try {
  jwt.verify(tampered.join('.'), SECRET);
} catch (err) {
  console.log('tampered ->', err.name + ':', err.message);
}

const expired = jwt.sign({ sub: '42', exp: Math.floor(Date.now() / 1000) - 10 }, SECRET);
try {
  jwt.verify(expired, SECRET);
} catch (err) {
  console.log('expired ->', err.name + ':', err.message);
}`,
      result: `token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc5NDk4Nzc0MiwiZXhwIjoxNzk0OTkxMzQyfQ.eVp1wcoZLQC16v2z_h6GaItDKW4Ym4ZbmxcV1eEva7I
header : {"alg":"HS256","typ":"JWT"}
payload: {"sub":"42","role":"admin","iat":1794987742,"exp":1794991342}
verified: 42 admin expires in 3600 seconds
wrong secret -> JsonWebTokenError: invalid signature
tampered -> JsonWebTokenError: invalid signature
expired -> TokenExpiredError: jwt expired`,
      explanation:
        'The header and payload are plain base64url - anyone can read them. Changing the payload (role → superadmin) breaks the signature, so verify() throws. The expired token is rejected with a different error class, which lets your API answer "Token expired" so the client knows to refresh.',
    },
    {
      title: 'Login returns a JWT; authenticate + authorize middleware',
      scenario: 'Asha is an admin, Ravi a normal user. Both can see their profile, only admins can list all users.',
      steps: [
        'npm install express bcrypt jsonwebtoken',
        'Create server.js with the code below and run node server.js',
        'POST /api/auth/login with Asha\'s credentials and copy the token',
        'GET /api/profile with header Authorization: Bearer <token>',
        'Try without a header, with a modified token, and /api/admin/users with Ravi\'s token',
      ],
      code: `const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const users = [
  { id: 1, name: 'Asha', email: 'asha@mail.com', role: 'admin', passwordHash: bcrypt.hashSync('Admin@123', 10) },
  { id: 2, name: 'Ravi', email: 'ravi@mail.com', role: 'user', passwordHash: bcrypt.hashSync('User@1234', 10) },
]; // hashSync only at startup for demo data

// ---- middleware ----
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ error: msg });
  }
}

const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden: insufficient role' });

// ---- routes ----
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.find(u => u.email === String(email).toLowerCase());
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ sub: String(user.id), role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ token, expiresIn: 900 });
});

app.get('/api/profile', authenticate, (req, res) => {
  const { passwordHash, ...me } = users.find(u => u.id === req.user.id);
  res.json(me);
});

app.get('/api/admin/users', authenticate, authorize('admin'), (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name, role: u.role })));
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `POST /api/auth/login {"email":"asha@mail.com","password":"Admin@123"} → 200 {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzk0OTg3NzY4LCJleHAiOjE3OTQ5ODg2Njh9.-Z3z-NBpwMPpDHvfqPF8TZGuwKPUg9z1Bu5w7lwJ8wA","expiresIn":900}
POST /api/auth/login {"email":"ravi@mail.com","password":"nope"} → 401 {"error":"Invalid email or password"}
GET /api/profile (no header) → 401 {"error":"Missing or malformed Authorization header"}
GET /api/profile (Bearer <Asha token>) → 200 {"id":1,"name":"Asha","email":"asha@mail.com","role":"admin"}
GET /api/profile (Bearer <Asha token>x) → 401 {"error":"Invalid token"}
GET /api/admin/users (Bearer <Ravi token>) → 403 {"error":"Forbidden: insufficient role"}
GET /api/admin/users (Bearer <Asha token>) → 200 [{"id":1,"name":"Asha","role":"admin"},{"id":2,"name":"Ravi","role":"user"}]`,
      explanation:
        'authenticate turns a valid token into req.user; every later middleware/handler can trust it. authorize("admin") is a factory returning middleware, so you can write authorize("admin", "manager"). Ravi is authenticated (valid token) but not authorized → 403, not 401. The token only stores the id and role - the profile is still read from the data store so it is never stale.',
    },
    {
      title: 'API Lab simulation: protected routes with Bearer tokens',
      scenario: 'The browser simulator cannot load jsonwebtoken, so this version issues fixed demo tokens from an in-memory Map to show the exact HTTP behaviour of authenticate/authorize.',
      steps: [
        'Paste the code into the API Lab',
        'Send the requests in order; the login responses show which token to send',
        'Watch the 401 (no/invalid token) vs 403 (wrong role) responses',
        'Real code: replace the tokens Map with jwt.sign / jwt.verify from the previous example',
      ],
      code: `// Simulator token store - real apps use jwt.sign() / jwt.verify()
const tokens = new Map([['demo-token-asha', { id: 1, role: 'admin' }], ['demo-token-ravi', { id: 2, role: 'user' }]]);`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const users = [
  { id: 1, name: 'Asha', email: 'asha@mail.com', password: 'Admin@123', role: 'admin' },
  { id: 2, name: 'Ravi', email: 'ravi@mail.com', password: 'User@1234', role: 'user' },
];
// Simulator stand-in for JWT: token -> payload. Real code: jwt.sign / jwt.verify
const tokens = new Map();

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const token = 'demo-token-' + user.name.toLowerCase();
  tokens.set(token, { sub: user.id, role: user.role });
  res.json({ token, expiresIn: 900 });
});

function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  const payload = tokens.get(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  req.user = { id: payload.sub, role: payload.role };
  next();
}

const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden: insufficient role' });

app.get('/api/profile', authenticate, (req, res) => {
  const { password, ...me } = users.find(u => u.id === req.user.id);
  res.json(me);
});

app.get('/api/admin/users', authenticate, authorize('admin'), (req, res) => {
  res.json(users.map(u => ({ id: u.id, name: u.name, role: u.role })));
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/auth/login', body: { email: 'asha@mail.com', password: 'Admin@123' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'ravi@mail.com', password: 'User@1234' } },
          { method: 'GET', url: '/api/profile' },
          { method: 'GET', url: '/api/profile', headers: { Authorization: 'Bearer demo-token-ravi' } },
          { method: 'GET', url: '/api/profile', headers: { Authorization: 'Bearer forged-token' } },
          { method: 'GET', url: '/api/admin/users', headers: { Authorization: 'Bearer demo-token-ravi' } },
          { method: 'GET', url: '/api/admin/users', headers: { Authorization: 'Bearer demo-token-asha' } },
        ],
      },
      result: "POST /api/auth/login → 200 {\"token\":\"demo-token-asha\",\"expiresIn\":900}\nPOST /api/auth/login → 200 {\"token\":\"demo-token-ravi\",\"expiresIn\":900}\nGET /api/profile → 401 {\"error\":\"Missing or malformed Authorization header\"}\nGET /api/profile → 200 {\"id\":2,\"name\":\"Ravi\",\"email\":\"ravi@mail.com\",\"role\":\"user\"}\nGET /api/profile → 401 {\"error\":\"Invalid token\"}\nGET /api/admin/users → 403 {\"error\":\"Forbidden: insufficient role\"}\nGET /api/admin/users → 200 [{\"id\":1,\"name\":\"Asha\",\"role\":\"admin\"},{\"id\":2,\"name\":\"Ravi\",\"role\":\"user\"}]",
      explanation:
        'Exactly the same middleware shape as the real version: the only difference is how a token is validated (Map lookup instead of a signature check). Note the order of middleware in the admin route - authenticate must run before authorize because authorize reads req.user.',
    },
    {
      title: 'Access + refresh tokens with httpOnly cookies',
      scenario: 'Keep users logged in for 7 days while access tokens live only 15 minutes, and support real logout.',
      steps: [
        'npm install express jsonwebtoken cookie-parser bcrypt',
        'On login create a short access token and a long refresh token; store the refresh token in a Set (a DB table in production)',
        'Send the refresh token as an httpOnly, secure, sameSite cookie limited to /api/auth',
        'POST /api/auth/refresh verifies the cookie, rotates the refresh token and returns a new access token',
        'POST /api/auth/logout deletes the refresh token and clears the cookie',
      ],
      code: `const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const validRefreshTokens = new Set(); // production: a refresh_tokens table / Redis

const cookieOptions = {
  httpOnly: true,                                  // JS cannot read it (XSS)
  secure: process.env.NODE_ENV === 'production',   // HTTPS only
  sameSite: 'strict',                              // CSRF protection
  path: '/api/auth',                               // only sent to auth routes
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function issueTokens(res, user) {
  const accessToken = jwt.sign({ sub: String(user.id), role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: String(user.id), role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });
  validRefreshTokens.add(refreshToken);
  res.cookie('refreshToken', refreshToken, cookieOptions);
  return accessToken;
}

app.post('/api/auth/login', async (req, res) => {
  const user = await checkCredentials(req.body);  // bcrypt.compare from Day 22
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ accessToken: issueTokens(res, user) });
});

app.post('/api/auth/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token || !validRefreshTokens.has(token)) return res.status(401).json({ error: 'No valid refresh token' });
  try {
    const payload = jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] });
    validRefreshTokens.delete(token);              // rotation: old token can never be reused
    res.json({ accessToken: issueTokens(res, { id: payload.sub, role: payload.role }) });
  } catch {
    validRefreshTokens.delete(token);
    res.status(401).json({ error: 'Refresh token expired' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  validRefreshTokens.delete(req.cookies.refreshToken);
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.sendStatus(204);
});

// Frontend (React) - retry once on 401:
// let res = await fetch('/api/orders', { headers: { Authorization: 'Bearer ' + accessToken } });
// if (res.status === 401) {
//   const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
//   if (r.ok) { accessToken = (await r.json()).accessToken; res = await fetch(...same request...); }
//   else redirectToLogin();
// }`,
      result:
        'Login → 200 {"accessToken":"eyJ..."} plus header Set-Cookie: refreshToken=eyJ...; Path=/api/auth; HttpOnly; SameSite=Strict. After 15 minutes the API answers 401 "Token expired"; the client calls POST /api/auth/refresh (cookie sent automatically) → 200 with a new access token. After logout, refresh → 401 "No valid refresh token".',
      explanation:
        'Two different secrets mean a refresh token can never be used as an access token. Storing refresh tokens server-side makes them revocable (logout, "log out of all devices", stolen phone). Rotation deletes the old refresh token on each use, so a stolen one stops working as soon as the real user refreshes.',
    },
  ],
  interview: [
    { q: 'What is the difference between authentication and authorization? Which status codes go with each?', a: 'Authentication verifies identity (login, token check) → 401 Unauthorized when missing/invalid. Authorization checks permissions of a known identity (roles, ownership) → 403 Forbidden when not allowed.', level: 'Easy' },
    { q: 'What are the three parts of a JWT?', a: 'Header (algorithm and type), payload (claims like sub, role, iat, exp) and signature (e.g. HMAC-SHA256 of header.payload with the secret), each base64url encoded and joined with dots.', level: 'Easy' },
    { q: 'Is the JWT payload encrypted? What should never go in it?', a: 'No, it is only base64url encoded and readable by anyone. The signature protects integrity, not confidentiality. Never put passwords, secrets, or sensitive personal data in it; keep it small (id, role). Use JWE if you need encryption.', level: 'Easy' },
    { q: 'Difference between jwt.verify and jwt.decode?', a: 'verify checks the signature, expiry and options and throws on failure; decode just base64-decodes the payload without any checks. Only verify must be used for authentication.', level: 'Medium' },
    { q: 'JWT vs session-based authentication: pros and cons?', a: 'JWT: stateless, no DB/Redis lookup per request, works across services and mobile clients; but hard to revoke before expiry, bigger than a session id, and claims can be stale. Sessions: easy revocation and small cookie, but need shared server-side storage when scaling horizontally. Many apps combine short JWTs with server-stored refresh tokens.', level: 'Medium' },
    { q: 'How do you log a user out when using JWT?', a: 'The access token cannot be "deleted" server-side, so keep it short-lived; delete the refresh token from the DB and clear the cookie; optionally maintain a denylist (Redis, keyed by jti until exp) or a tokenVersion on the user that is checked on each request and incremented on logout-all.', level: 'Hard' },
    { q: 'What is a refresh token and why use one?', a: 'A long-lived credential stored server-side (revocable) and used only on a refresh endpoint to get new short-lived access tokens. It balances security (short access-token lifetime) with UX (no frequent logins). Rotate it on each use to detect theft.', level: 'Medium' },
    { q: 'Where should a web app store JWTs: localStorage or cookies?', a: 'localStorage is readable by any injected script (XSS). httpOnly + Secure + SameSite cookies are not readable by JS, but are sent automatically, so CSRF must be handled (SameSite, CSRF tokens). A common compromise: access token in memory, refresh token in an httpOnly cookie.', level: 'Hard' },
    { q: 'Why pass { algorithms: ["HS256"] } to jwt.verify?', a: 'To pin the accepted algorithm. Without it, attacks like alg:none or switching RS256 to HS256 (using the public key as HMAC secret) were possible in vulnerable libraries/configs. Pinning is defence in depth.', level: 'Hard' },
    { q: 'HS256 vs RS256?', a: 'HS256 is symmetric: the same secret signs and verifies, so every verifier could also mint tokens. RS256 is asymmetric: a private key signs, a public key (often via a JWKS URL) verifies; ideal for microservices and third-party identity providers (Auth0, Cognito, Google).', level: 'Medium' },
    { q: 'How do you implement role-based authorization in Express?', a: 'After authenticate sets req.user, a middleware factory authorize(...roles) checks roles.includes(req.user.role) and calls next() or responds 403. Apply per route or per router. For finer control use permissions (e.g. "product:delete") and ownership checks in the service layer.', level: 'Medium' },
    { q: 'A user\'s role changed from admin to user but they still have admin access. Why and how to fix?', a: 'Their existing JWT still contains role: admin until it expires. Fixes: short access-token lifetime, load the user/role from DB in authenticate for sensitive routes, or check a tokenVersion/updatedAt claim against the DB to invalidate old tokens.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write an optionalAuth middleware: if a valid token exists set req.user, otherwise continue as a guest (req.user = null) instead of returning 401.',
      hint: 'Same as authenticate, but every failure path calls next().',
      solution: `function optionalAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  req.user = null;
  if (scheme === 'Bearer' && token) {
    try {
      const p = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      req.user = { id: Number(p.sub), role: p.role };
    } catch { /* invalid token -> guest */ }
  }
  next();
}
app.get('/api/products', optionalAuth, (req, res) => {
  res.json({ guest: !req.user, products: req.user ? allProducts : publicProducts });
});`,
    },
    {
      task: 'Protect a whole router: every route in /api/orders needs login, and DELETE /api/orders/:id needs the admin role. Users may only GET their own orders.',
      hint: 'router.use(authenticate) at the top; filter by req.user.id.',
      solution: `const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const mine = req.user.role === 'admin' ? orders : orders.filter(o => o.userId === req.user.id);
  res.json(mine);
});

router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (order.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  res.json(order);
});

router.delete('/:id', authorize('admin'), (req, res) => { /* delete */ res.sendStatus(204); });
app.use('/api/orders', router);`,
    },
    {
      task: 'Add a "logout from all devices" feature using a tokenVersion number on the user that is put into the JWT and compared in authenticate.',
      hint: 'Sign { sub, role, tv: user.tokenVersion }; on logout-all increment user.tokenVersion.',
      solution: `// sign
const token = jwt.sign({ sub: String(user.id), role: user.role, tv: user.tokenVersion }, SECRET, { expiresIn: '15m' });

// authenticate (async: loads the user)
async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Unauthorized' });
  let p;
  try { p = jwt.verify(token, SECRET, { algorithms: ['HS256'] }); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
  const user = await User.findById(p.sub);
  if (!user || user.tokenVersion !== p.tv) return res.status(401).json({ error: 'Session revoked' });
  req.user = user;
  next();
}

app.post('/api/auth/logout-all', authenticate, async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save();
  res.sendStatus(204);
});`,
    },
    {
      task: 'Write a React (or plain fetch) helper apiFetch(url, options) that adds the Bearer token from memory and, on a 401, calls /api/auth/refresh once and retries.',
      hint: 'credentials: "include" so the refresh cookie is sent.',
      solution: `let accessToken = null;
export function setAccessToken(t) { accessToken = t; }

export async function apiFetch(url, options = {}, retried = false) {
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: 'Bearer ' + accessToken },
  });
  if (res.status !== 401 || retried) return res;
  const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
  if (!r.ok) { window.location.href = '/login'; return res; }
  accessToken = (await r.json()).accessToken;
  return apiFetch(url, options, true);
}`,
    },
  ],
  quiz: [
    { question: 'A logged-in user with role "user" calls an admin-only route. What status should the API return?', options: ['401 Unauthorized', '404 Not Found', '403 Forbidden', '400 Bad Request'], answer: 2, explanation: 'Identity is known (authenticated) but permission is missing → 403.' },
    { question: 'Which statement about the JWT payload is TRUE?', options: ['It is encrypted with the secret', 'Anyone can read it, but changing it breaks the signature', 'It can only be read by the server', 'It contains the user password hash'], answer: 1, explanation: 'Base64url is just encoding; the signature provides integrity only.' },
    { question: 'What does jwt.verify do when the token has expired?', options: ['Throws TokenExpiredError', 'Returns null', 'Returns the payload with expired: true', 'Refreshes the token automatically'], answer: 0, explanation: 'verify throws TokenExpiredError (name "TokenExpiredError", message "jwt expired").' },
    { question: 'Where is the access token usually sent from a client to an API?', options: ['In the URL query string', 'In the request body of every GET', 'In a custom X-Password header', 'In the Authorization: Bearer <token> header'], answer: 3, explanation: 'The Bearer scheme in the Authorization header is the standard.' },
    { question: 'Why are access tokens kept short-lived (e.g. 15 minutes)?', options: ['Short tokens are smaller in size', 'JWT libraries require it', 'A stolen token is only useful for a short time because JWTs cannot easily be revoked', 'To force users to type their password often'], answer: 2, explanation: 'Refresh tokens restore UX while keeping the damage window small.' },
  ],
};
