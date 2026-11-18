export default {
  id: 'day-24-security-helmet-cors-rate-limiting-validation',
  title: 'Security: helmet, CORS, Rate Limiting, Input Validation (zod / express-validator) and Environment Variables',
  module: 'Module 4: Authentication & Security',
  day: 24,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'An API on the internet is attacked within minutes. Today you add the standard defence layers to an Express 5 app: secure HTTP headers with helmet, a strict CORS policy, rate limiting against brute force, schema validation of every input with zod or express-validator, body size limits, safe error messages and secrets in environment variables.',
  objectives: [
    'Explain the OWASP Top 10 risks most relevant to Node APIs (injection, broken auth, misconfiguration)',
    'Add helmet and understand the headers it sets',
    'Configure CORS correctly (allowed origins, credentials, preflight) and know what CORS does NOT protect',
    'Rate limit login and API routes with express-rate-limit and read the RateLimit headers',
    'Validate and sanitise input with zod (and express-validator) and keep secrets in .env files',
  ],
  theory: [
    {
      heading: 'Defence in depth: think like a castle',
      content:
        'A castle is not protected by one wall: it has a moat, walls, guards at the gate, locked rooms and a vault. API security works the same way - many small layers, so when one fails the others still protect you.\n\nThe layers of a typical Express API (in middleware order):\n1. **HTTPS** (handled by the host / reverse proxy) - nobody can read or change traffic.\n2. **helmet** - safe HTTP response headers.\n3. **CORS** - which browser origins may call the API.\n4. **Rate limiting** - how many requests per IP/user per time window.\n5. **Body limits** - `express.json({ limit: "10kb" })`.\n6. **Authentication & authorization** (Days 22-23).\n7. **Input validation** - every body, param and query checked against a schema.\n8. **Safe data access** - parameterised SQL, no raw `req.body` in Mongo queries.\n9. **Error handling** - generic messages, no stack traces in production.\n10. **Secrets** in environment variables, dependencies kept up to date (`npm audit`).',
      points: [
        'OWASP API Top 10 highlights: broken object-level authorization, broken authentication, excessive data exposure, lack of rate limiting, injection, security misconfiguration',
        'Never trust the client: front-end validation is UX, back-end validation is security',
      ],
    },
    {
      heading: 'helmet: secure headers in one line',
      content:
        '`npm install helmet` then `app.use(helmet())`. Helmet sets about a dozen response headers that tell browsers to be stricter:\n- `Content-Security-Policy` - which scripts/styles/images may load (strong XSS defence for pages you serve).\n- `Strict-Transport-Security` - always use HTTPS for this domain (HSTS).\n- `X-Content-Type-Options: nosniff` - do not guess content types.\n- `X-Frame-Options: SAMEORIGIN` / `frame-ancestors` - blocks clickjacking in iframes.\n- `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.\n- It removes `X-Powered-By: Express`, which advertises your framework to attackers (`app.disable("x-powered-by")` does the same without helmet).\n\nYou can configure parts: `helmet({ contentSecurityPolicy: { directives: { "img-src": ["\'self\'", "https://res.cloudinary.com"] } } })`.',
      tip: 'For a pure JSON API helmet is cheap insurance; for an app that also serves HTML (EJS, React build) the Content-Security-Policy is one of the best XSS defences you have.',
    },
    {
      heading: 'CORS: who may call you from a browser',
      content:
        'Browsers enforce the **Same-Origin Policy**: JavaScript on `https://myshop.com` cannot read responses from `https://api.myshop.com` (different origin = scheme + host + port) unless the API sends `Access-Control-Allow-Origin` saying it is allowed. That opt-in mechanism is **CORS**.\n\nFor "non-simple" requests (PUT/DELETE, JSON content type, Authorization header) the browser first sends a **preflight** `OPTIONS` request asking permission; the `cors` middleware answers it with 204 and the allowed methods/headers.\n\nRules:\n- Use an explicit list of origins, not `*`, for anything with cookies or auth. `origin: "*"` with `credentials: true` is not allowed by browsers.\n- CORS is **not** an authentication mechanism. curl, Postman and servers ignore it completely; it only protects users\' browsers from other websites reading your API with their cookies.',
      syntax: `const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'https://myshop.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,          // allow cookies / Authorization from these origins
}));`,
    },
    {
      heading: 'Rate limiting against brute force and abuse',
      content:
        'Without limits an attacker can try 10,000 passwords per minute, scrape your whole catalogue, or simply overload the server. `express-rate-limit` counts requests per key (IP by default) in a time window and answers **429 Too Many Requests** when the limit is exceeded, with standard `RateLimit` and `Retry-After` headers.\n\nTypical setup:\n- A global limiter for `/api` (e.g. 100 requests / 15 min per IP).\n- A strict limiter for `/api/auth/login`, `/register`, `/forgot-password` (e.g. 5 / 15 min).\n- Behind a proxy (Render, Railway, Nginx, Heroku) set `app.set("trust proxy", 1)` so `req.ip` is the real client IP and not the proxy\'s.\n- With several server instances use a shared store (`rate-limit-redis`) so the count is global.',
      syntax: `const { rateLimit } = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  limit: 5,                    // 5 requests per window per IP (v7+: "limit", older: "max")
  standardHeaders: 'draft-8',  // RateLimit + RateLimit-Policy headers
  legacyHeaders: false,        // no X-RateLimit-* headers
  message: { error: 'Too many login attempts, try again later' },
});
app.post('/api/auth/login', loginLimiter, loginHandler);`,
    },
    {
      heading: 'Input validation with zod or express-validator',
      content:
        'Every value from `req.body`, `req.params`, `req.query` and headers is attacker-controlled. Validation means checking **type, format, length, range and allowed fields**, and responding `400` with clear messages.\n\n**zod** (`npm install zod`): define a schema once, `safeParse` it, get typed, cleaned data (trimmed, lower-cased, coerced numbers). `.strict()` rejects unknown keys - this stops **mass assignment** (a user sending `"role":"admin"` during registration).\n\n**express-validator** (`npm install express-validator`): chain validators as middleware: `body("email").isEmail().normalizeEmail()`, then `validationResult(req)` in the handler.\n\nBoth are fine; zod is popular because the same schema can be shared with a React front end and gives TypeScript types.\n\nRemember Express 5: `req.query` is read-only, so store validated data on a new property (`req.validated`) instead of overwriting `req.query`.',
      syntax: `const { z } = require('zod');
const schema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(8),
}).strict();
const result = schema.safeParse(req.body ?? {});
if (!result.success) return res.status(400).json({ errors: result.error.issues });`,
      tip: 'Validation is not the same as escaping. Still use parameterised SQL queries, String()-cast Mongo filter values, and escape output in HTML templates (EJS <%= %> escapes; <%- %> does not).',
    },
    {
      heading: 'Secrets, environment variables and safe errors',
      content:
        'Secrets (DB passwords, JWT secrets, API keys) must never be in source code or Git. Put them in a `.env` file that is listed in `.gitignore`, and commit a `.env.example` with empty values so teammates know which variables exist.\n\nNode 22 can load env files **without any package**: `node --env-file=.env server.js` (or `process.loadEnvFile()`); the `dotenv` package does the same for older setups. In production, set variables in the hosting dashboard (Render, Railway, AWS).\n\n**Fail fast**: validate env vars at startup (with zod) and crash with a clear message if `JWT_SECRET` is missing instead of running insecurely.\n\n**Error messages**: in production return `{ error: "Internal Server Error" }` for 500s and log the details server-side. Stack traces reveal file paths, library versions and logic to attackers. Express\'s default error page prints the stack when `NODE_ENV` is not `production`.',
      syntax: `# .env (never commit)
PORT=3000
JWT_SECRET=paste-a-48-byte-random-string-here
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/shop

# run (Node 20.6+)
node --env-file=.env server.js`,
    },
  ],
  examples: [
    {
      title: 'A hardened Express 5 server: helmet, CORS, rate limit, zod, body limit, safe errors',
      scenario: 'Put all security layers into a real server and observe each one with curl.',
      steps: [
        'npm init -y && npm install express helmet cors express-rate-limit zod',
        'Create server.js with the code below and run node server.js',
        'curl -i http://localhost:3000/api/health and look at the security headers',
        'Send an allowed and a disallowed Origin and a preflight OPTIONS request',
        'Register with invalid data, valid data, and try mass-assigning "role"',
        'Call /api/auth/login 4 times quickly and send a 20 KB JSON body',
      ],
      code: `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const { z } = require('zod');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://myshop.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again in 15 minutes' },
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must have at least 2 characters'),
  email: z.email('Invalid email').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.coerce.number().int().min(13).optional(),
}).strict();

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  req.validated = result.data;
  next();
};

app.post('/api/auth/register', validate(registerSchema), (req, res) => {
  const { password, ...user } = req.validated; // next step: bcrypt.hash(password, 12) and save
  res.status(201).json({ user });
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  res.status(401).json({ error: 'Invalid email or password' });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// central error handler: never leak stack traces to clients
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'Internal Server Error' : err.message });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `$ curl -i http://localhost:3000/api/health
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin
Access-Control-Allow-Credentials: true
{"status":"ok"}

Origin: http://localhost:5173 → Access-Control-Allow-Origin: http://localhost:5173
Origin: https://evil.com     → no Access-Control-Allow-Origin header (browser blocks the response)
OPTIONS preflight (PUT)      → 204 No Content, Access-Control-Allow-Methods: GET,POST,PUT,DELETE

POST /api/auth/register {"name":"A","email":"nope","password":"123","role":"admin"} → 400 {"errors":[{"field":"name","message":"Name must have at least 2 characters"},{"field":"email","message":"Invalid email"},{"field":"password","message":"Password must be at least 8 characters"},{"field":"","message":"Unrecognized key: \\"role\\""}]}
POST /api/auth/register {"name":"  Asha ","email":"Asha@Mail.com","password":"Secret@123","age":"21"} → 201 {"user":{"name":"Asha","email":"asha@mail.com","age":21}}

POST /api/auth/login #1 → 401  RateLimit: "3-in-15min"; r=2; t=900
POST /api/auth/login #2 → 401  RateLimit: "3-in-15min"; r=1; t=900
POST /api/auth/login #3 → 401  RateLimit: "3-in-15min"; r=0; t=900
POST /api/auth/login #4 → 429  Retry-After: 900  {"error":"Too many login attempts, try again in 15 minutes"}

POST /api/auth/register with a 20 KB body → 413 {"error":"request entity too large"}`,
      explanation:
        'helmet added the security headers and there is no X-Powered-By. CORS only echoes Access-Control-Allow-Origin for whitelisted origins. zod trimmed the name, lower-cased the email, coerced "21" to 21 and .strict() rejected the extra "role" key (mass assignment). The limiter counted down r=2,1,0 then returned 429 with Retry-After. The body parser rejected the oversized body and our error handler turned it into clean JSON instead of an HTML stack trace.',
    },
    {
      title: 'API Lab simulation: hand-written security middleware',
      scenario: 'Understand what helmet, cors, express-rate-limit and a validator do internally by writing tiny versions with plain Express (the API Lab cannot load those packages).',
      steps: [
        'Paste the code into the API Lab',
        'Send the requests in order and watch validation errors, the 429 after 3 login attempts and the CORS preflight',
        'Compare each mini middleware with the real package in the previous example',
      ],
      code: `// mini rate limiter: counts requests per IP (real package also resets per time window)
const hits = {};
const miniLimiter = (limit) => (req, res, next) => {
  hits[req.ip] = (hits[req.ip] || 0) + 1;
  if (hits[req.ip] > limit) return res.status(429).json({ error: 'Too many requests' });
  next();
};`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

// 1. mini "helmet": a few security headers
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'no-referrer');
  next();
});

// 2. mini "cors": whitelist + preflight
const ALLOWED = ['http://localhost:5173'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 3. mini rate limiter (the real package resets the count every windowMs)
const hits = {};
const limiter = (limit) => (req, res, next) => {
  const key = req.ip + ' ' + req.path; // per client + route
  hits[key] = (hits[key] || 0) + 1;
  if (hits[key] > limit) return res.status(429).json({ error: 'Too many requests, try again later' });
  next();
};

// 4. mini validator with a whitelist of fields (stops mass assignment)
function validateRegister(req, res, next) {
  const body = req.body ?? {};
  const errors = [];
  const allowed = ['name', 'email', 'password'];
  for (const key of Object.keys(body)) if (!allowed.includes(key)) errors.push(key + ' is not allowed');
  if (typeof body.name !== 'string' || body.name.trim().length < 2) errors.push('name must have at least 2 characters');
  if (typeof body.email !== 'string' || !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(body.email)) errors.push('email is invalid');
  if (typeof body.password !== 'string' || body.password.length < 8) errors.push('password must be at least 8 characters');
  if (errors.length) return res.status(400).json({ errors });
  req.validated = { name: body.name.trim(), email: body.email.toLowerCase() };
  next();
}

app.post('/api/auth/register', validateRegister, (req, res) => res.status(201).json({ user: req.validated }));
app.post('/api/auth/login', limiter(3), (req, res) => res.status(401).json({ error: 'Invalid email or password' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/auth/register', body: { name: 'A', email: 'nope', password: '123', role: 'admin' } },
          { method: 'POST', url: '/api/auth/register', body: { name: ' Asha ', email: 'Asha@Mail.com', password: 'Secret@123' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'x@y.com', password: 'guess1' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'x@y.com', password: 'guess2' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'x@y.com', password: 'guess3' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'x@y.com', password: 'guess4' } },
          { method: 'OPTIONS', url: '/api/health', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'PUT' } },
        ],
      },
      result: "POST /api/auth/register → 400 {\"errors\":[\"role is not allowed\",\"name must have at least 2 characters\",\"email is invalid\",\"password must be at least 8 characters\"]}\nPOST /api/auth/register → 201 {\"user\":{\"name\":\"Asha\",\"email\":\"asha@mail.com\"}}\nPOST /api/auth/login → 401 {\"error\":\"Invalid email or password\"}\nPOST /api/auth/login → 401 {\"error\":\"Invalid email or password\"}\nPOST /api/auth/login → 401 {\"error\":\"Invalid email or password\"}\nPOST /api/auth/login → 429 {\"error\":\"Too many requests, try again later\"}\nOPTIONS /api/health → 204",
      explanation:
        'Each mini middleware shows the core idea of its package: headers on every response, an origin whitelist plus a 204 answer to preflights, a counter that turns into 429, and a whitelist validator that rejects unknown fields like "role". The real packages add time windows, standard headers, many edge cases and years of security review - use them in production.',
    },
    {
      title: 'Validation with express-validator',
      scenario: 'Some teams prefer express-validator chains. Validate a product creation route and an :id param.',
      steps: [
        'npm install express express-validator',
        'Write validation chains for body fields and the route param',
        'Add a reusable handleValidation middleware that returns 400',
        'Use matchedData(req) to read only validated fields',
      ],
      code: `const express = require('express');
const { body, param, validationResult, matchedData } = require('express-validator');

const app = express();
app.use(express.json());

const handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array().map(e => ({ field: e.path, message: e.msg })) });
  }
  next();
};

const createProductRules = [
  body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 100 }).escape(),
  body('price').isFloat({ gt: 0 }).withMessage('price must be > 0').toFloat(),
  body('category').isIn(['Phones', 'Laptops', 'Accessories']).withMessage('invalid category'),
  body('tags').optional().isArray({ max: 5 }),
];

app.post('/api/products', createProductRules, handleValidation, (req, res) => {
  const data = matchedData(req);      // only fields that had validators -> no mass assignment
  res.status(201).json({ id: 1, ...data });
});

app.get('/api/products/:id', param('id').isInt({ min: 1 }).toInt(), handleValidation, (req, res) => {
  res.json({ id: matchedData(req).id });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      result: `POST /api/products {"name":"","price":-5,"category":"Food"} → 400 {"errors":[{"field":"name","message":"name is required"},{"field":"price","message":"price must be > 0"},{"field":"category","message":"invalid category"}]}
POST /api/products {"name":"Pixel 8","price":"599","category":"Phones","isAdmin":true} → 201 {"id":1,"name":"Pixel 8","price":599,"category":"Phones"}
GET /api/products/abc → 400 {"errors":[{"field":"id","message":"Invalid value"}]}`,
      explanation:
        'Validators also sanitise: trim(), escape(), toFloat(), toInt(). matchedData() returns only validated fields, so the unexpected isAdmin is silently dropped. Because Express 5 makes req.query read-only, prefer matchedData() over reading sanitised values back from req.query.',
    },
    {
      title: 'Environment variables done right (Node 22 --env-file + zod)',
      scenario: 'Load secrets from .env in development, from the host dashboard in production, and refuse to start if something is missing.',
      steps: [
        'Create .env and add it to .gitignore; create .env.example without values',
        'Create config.js that validates process.env with zod',
        'Import config everywhere instead of reading process.env directly',
        'Start with node --env-file=.env server.js (Node 20.6+), or in package.json "dev": "node --watch --env-file=.env server.js"',
      ],
      code: `// .gitignore
node_modules
.env

// .env.example (committed)
PORT=
NODE_ENV=
JWT_SECRET=
MONGODB_URI=
CORS_ORIGINS=

// config.js
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  MONGODB_URI: z.string().startsWith('mongodb'),
  CORS_ORIGINS: z.string().default('http://localhost:5173').transform(s => s.split(',')),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) console.error(' -', issue.path.join('.'), issue.message);
  process.exit(1);   // fail fast: never run with a missing secret
}
module.exports = parsed.data;

// server.js
const config = require('./config');
app.use(cors({ origin: config.CORS_ORIGINS, credentials: true }));
app.listen(config.PORT, () => console.log('Server running on port ' + config.PORT));`,
      result: `$ node server.js          (no .env loaded)
Invalid environment variables:
 - JWT_SECRET Invalid input: expected string, received undefined
 - MONGODB_URI Invalid input: expected string, received undefined
(process exits with code 1)

$ node --env-file=.env server.js
Server running on port 3000`,
      explanation:
        'Centralising configuration means one place validates types (PORT becomes a number, CORS_ORIGINS an array) and the app crashes immediately with a readable message instead of failing later with "secretOrPrivateKey must have a value". .env.example documents the required variables without leaking values.',
    },
  ],
  interview: [
    { q: 'What does helmet do?', a: 'It is a collection of middleware that sets security-related HTTP response headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options: nosniff, X-Frame-Options, Referrer-Policy, Cross-Origin-* policies, and removes X-Powered-By. It reduces XSS, clickjacking, MIME sniffing and information leakage risks.', level: 'Easy' },
    { q: 'What is CORS and does it protect my API from Postman/curl?', a: 'Cross-Origin Resource Sharing is a browser mechanism that lets a server opt in to allowing JS from other origins to read its responses (Access-Control-Allow-Origin etc.). It does not protect against non-browser clients at all; it protects users from malicious websites using their browser and cookies. Real access control is authentication/authorization.', level: 'Medium' },
    { q: 'What is a preflight request?', a: 'An automatic OPTIONS request the browser sends before a non-simple cross-origin request (methods like PUT/DELETE, custom headers like Authorization, JSON content type) to ask which methods/headers/origins are allowed. The server must answer with the CORS headers (usually 204) before the real request is sent.', level: 'Medium' },
    { q: 'Why can\'t you use Access-Control-Allow-Origin: * with credentials?', a: 'The CORS spec forbids it because any site could then make authenticated requests with the user\'s cookies and read the responses. With credentials you must echo a specific allowed origin and send Access-Control-Allow-Credentials: true.', level: 'Hard' },
    { q: 'How does express-rate-limit work and what is important behind a proxy?', a: 'It counts requests per key (default req.ip) in a time window and returns 429 with RateLimit/Retry-After headers when exceeded. Behind a reverse proxy/load balancer you must set app.set("trust proxy", 1) so req.ip comes from X-Forwarded-For; otherwise all users share the proxy IP. Multiple instances need a shared store such as Redis.', level: 'Medium' },
    { q: 'What is mass assignment and how do you prevent it?', a: 'When an API copies the whole request body into a model (User.create(req.body)), an attacker can set fields they should not, like role:"admin" or isVerified:true. Prevent with schemas that whitelist fields (zod .strict()/pick, express-validator matchedData) and by building the object explicitly.', level: 'Medium' },
    { q: 'Client-side validation vs server-side validation?', a: 'Client-side validation improves UX (instant feedback) but can be bypassed trivially. Server-side validation is mandatory for security and data integrity. Libraries like zod let you share one schema between both.', level: 'Easy' },
    { q: 'How do you prevent NoSQL and SQL injection in Node?', a: 'SQL: always use parameterised queries/placeholders (mysql2 "?" values, ORM methods), never string concatenation; whitelist identifiers like sort columns. NoSQL: validate types, cast to String/Number, do not pass req.body/query objects directly into filters, use mongoose sanitizeFilter or express-mongo-sanitize to strip $ operators.', level: 'Hard' },
    { q: 'How should secrets be managed in a Node app?', a: 'Keep them out of code and Git: .env locally (ignored), .env.example committed, platform environment variables or a secrets manager (AWS Secrets Manager, Vault, Doppler) in production. Validate them at startup and rotate them if leaked. Node 20.6+ supports node --env-file=.env natively.', level: 'Easy' },
    { q: 'Why should production APIs not return stack traces?', a: 'Stack traces leak file paths, library versions, SQL, and internal logic that help attackers. Log full errors server-side (with request ids) and return generic messages for 500 errors. Set NODE_ENV=production so Express\'s default handler hides stacks.', level: 'Easy' },
    { q: 'Name three things you would check in a Node.js security review.', a: 'Examples: npm audit / outdated dependencies; authentication and authorization on every route (including object-level ownership); input validation and injection; rate limiting; helmet/CORS config; secrets handling; error handling; file upload restrictions; HTTPS and cookie flags (httpOnly, Secure, SameSite); logging without sensitive data.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a reusable validate({ body, params, query }) middleware factory using zod that validates all three parts and stores results in req.validated (Express 5 safe).',
      hint: 'Loop over the provided schemas; collect issues with their location.',
      solution: `const validate = (schemas) => (req, res, next) => {
  const errors = [];
  req.validated = {};
  for (const part of ['body', 'params', 'query']) {
    if (!schemas[part]) continue;
    const r = schemas[part].safeParse(req[part] ?? {});
    if (r.success) req.validated[part] = r.data;
    else errors.push(...r.error.issues.map(i => ({ in: part, field: i.path.join('.'), message: i.message })));
  }
  if (errors.length) return res.status(400).json({ errors });
  next();
};

const idParams = z.object({ id: z.coerce.number().int().positive() });
const listQuery = z.object({ page: z.coerce.number().int().min(1).default(1) });
app.get('/api/users/:id/orders', validate({ params: idParams, query: listQuery }), (req, res) => {
  res.json(req.validated);   // { params: { id: 5 }, query: { page: 1 } }
});`,
    },
    {
      task: 'Configure CORS with a dynamic origin function that reads allowed origins from process.env.CORS_ORIGINS (comma separated) and also allows requests with no Origin (server-to-server, curl).',
      hint: 'cors({ origin: (origin, callback) => ... }).',
      solution: `const allowed = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(null, false);   // no CORS headers -> browser blocks
  },
  credentials: true,
}));`,
    },
    {
      task: 'Set up two limiters: a general one for all /api routes (100 per 15 min) and a strict one for /api/auth/* (5 per 15 min, counting only failed attempts). Make it work behind Render\'s proxy.',
      hint: 'skipSuccessfulRequests: true; app.set("trust proxy", 1).',
      solution: `const { rateLimit } = require('express-rate-limit');
app.set('trust proxy', 1);

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,     // only failed (status >= 400) requests count
  message: { error: 'Too many attempts, please try again later' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);`,
    },
    {
      task: 'Write a production-ready error handler that logs the full error with a request id but returns only safe information to the client.',
      hint: 'Generate the id with crypto.randomUUID() in an early middleware.',
      solution: `const { randomUUID } = require('crypto');
app.use((req, res, next) => { req.id = randomUUID(); res.set('X-Request-Id', req.id); next(); });

// ... routes ...

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error(JSON.stringify({ level: 'error', requestId: req.id, path: req.path, message: err.message, stack: err.stack }));
  res.status(status).json({
    error: status >= 500 ? 'Internal Server Error' : err.message,
    requestId: req.id,            // user can quote it to support
  });
});`,
    },
    {
      task: 'Prevent NoSQL operator injection: write a middleware that rejects any request whose body contains keys starting with "$" or containing "." at any depth.',
      hint: 'Recursive function over objects and arrays.',
      solution: `function hasDangerousKeys(value) {
  if (Array.isArray(value)) return value.some(hasDangerousKeys);
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([k, v]) => k.startsWith('$') || k.includes('.') || hasDangerousKeys(v));
  }
  return false;
}
app.use((req, res, next) => {
  if (hasDangerousKeys(req.body)) return res.status(400).json({ error: 'Invalid characters in input' });
  next();
});
// Mongoose alternative: mongoose.set('sanitizeFilter', true);`,
    },
  ],
  quiz: [
    { question: 'Which status code does express-rate-limit send when the limit is exceeded?', options: ['403', '429', '503', '401'], answer: 1, explanation: '429 Too Many Requests, with a Retry-After header.' },
    { question: 'CORS is enforced by...', options: ['The browser', 'The database', 'Express automatically', 'curl and Postman'], answer: 0, explanation: 'Only browsers enforce CORS; other clients ignore it.' },
    { question: 'What does zod .strict() on an object schema do?', options: ['Makes all fields required', 'Converts strings to numbers', 'Rejects keys that are not defined in the schema', 'Encrypts the body'], answer: 2, explanation: 'Unknown keys cause an "Unrecognized key" issue - a defence against mass assignment.' },
    { question: 'Your API runs behind a load balancer and every user gets rate-limited together. What is the most likely fix?', options: ['Increase the limit to 1,000,000', 'Remove helmet', 'Use bcrypt', 'app.set("trust proxy", 1) so req.ip is the real client IP'], answer: 3, explanation: 'Without trust proxy all requests appear to come from the proxy IP.' },
    { question: 'Where should a JWT secret live?', options: ['Hard-coded in server.js', 'In an environment variable / secrets manager, never in Git', 'In the React bundle', 'In the JWT payload'], answer: 1, explanation: 'Secrets belong in env vars (.env locally, ignored by Git) or a secrets manager.' },
  ],
};
