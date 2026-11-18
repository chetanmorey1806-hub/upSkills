export default {
  id: 'day-06-security-checklist-for-mern',
  title: 'Security Checklist for MERN: Helmet, CORS, Rate Limiting, NoSQL Injection, XSS, CSRF, Secrets and OWASP Top 10',
  module: 'Module 2: Auth & Security',
  day: 6,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    "Harden a full MERN app layer by layer: secure HTTP headers with helmet, a strict CORS allowlist, rate limiting on login, sanitising input against NoSQL injection, preventing XSS in React, protecting cookie-based auth from CSRF, and keeping secrets out of Git. Finish with the OWASP Top 10 mapped to concrete MERN fixes.",
  objectives: [
    'Add helmet, a strict CORS allowlist and rate limiting to an Express 5 API and explain what each one blocks',
    'Explain NoSQL injection with a real login example and fix it with schema validation and sanitising',
    'Prevent XSS in React (no dangerouslySetInnerHTML without DOMPurify) and with a Content Security Policy',
    'Protect cookie-based authentication from CSRF using SameSite cookies and a CSRF token',
    'Manage secrets safely (.env, platform secrets, rotation) and map the OWASP Top 10 to a MERN checklist',
  ],
  theory: [
    {
      heading: 'Think in layers: defence in depth',
      content:
        "Security is not one package you install. It is **many small locks**, each covering a different door. If one lock fails, the next one still stops the attacker. This idea is called **defence in depth**.\n\nAnalogy: a bank does not rely only on the front door. It has a guard, CCTV, a locked vault, and a time-lock on the vault. Your MERN app is the same:\n\n1. **Browser layer**: secure headers (helmet), Content Security Policy, React's automatic escaping\n2. **Network layer**: HTTPS everywhere, strict CORS, rate limiting\n3. **Input layer**: validate every request body, query and param with a schema (Zod), strip MongoDB operators\n4. **Auth layer**: hashed passwords, short-lived access tokens, httpOnly + Secure + SameSite cookies, CSRF protection (covered with Day 4 and 5)\n5. **Data layer**: least-privilege database user, IP access list on Atlas, encrypted backups\n6. **Operations layer**: secrets in environment variables, `npm audit`, logging and alerts\n\nA typical production `app.js` order is: `helmet()` → `cors()` → rate limiter → `express.json({ limit })` → sanitiser → routes → 404 → error handler.",
      syntax: `// server/src/app.js (Express 5) - security middleware order
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();
app.set('trust proxy', 1);                 // behind Render/Nginx: real client IP for rate limiting
app.use(helmet());                         // secure headers
app.use(cors({ origin: process.env.CLIENT_URL.split(','), credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use(express.json({ limit: '10kb' }));  // reject huge bodies
app.use(cookieParser());
app.use(sanitizeMongo);                    // our own middleware, see examples
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);                     // never leak stack traces in production`,
      tip: "Order matters. If the rate limiter is mounted AFTER the routes, it never runs for those routes. Mount security middleware first.",
    },
    {
      heading: 'Helmet and CORS: the browser-facing locks',
      content:
        "**helmet** sets about a dozen HTTP response headers that tell the browser to behave safely:\n\n- `Content-Security-Policy`: which scripts, styles, images and APIs the page may load (the strongest XSS defence)\n- `Strict-Transport-Security` (HSTS): always use HTTPS for this domain\n- `X-Content-Type-Options: nosniff`: do not guess file types (stops a .jpg being run as script)\n- `X-Frame-Options` / `frame-ancestors`: do not allow our page in an iframe (stops clickjacking)\n- `Referrer-Policy`: do not leak full URLs to other sites\n- It also removes `X-Powered-By: Express` so attackers do not learn your stack for free.\n\n**CORS** (Cross-Origin Resource Sharing) is a browser rule: a page on `https://shop.in` may only read responses from `https://api.shop.in` if the API says so with `Access-Control-Allow-Origin`. Important facts:\n\n- CORS is **enforced by the browser, not the server**. Postman and curl ignore it. So CORS is not authentication.\n- With cookies you need `credentials: true` on the server AND `withCredentials: true` (axios) or `credentials: 'include'` (fetch) on the client, and the origin must be an **exact origin, never `*`**.\n- Use an **allowlist** from an environment variable: `CLIENT_URL=https://shop.in,https://admin.shop.in`.\n- Reflecting any origin (`origin: true`) together with `credentials: true` is a serious bug: any website can then call your API with the user's cookies.",
      points: [
        'helmet = secure response headers in one line',
        'CORS controls which websites can READ your API responses in a browser',
        'credentials: true + wildcard origin is not allowed by browsers, and reflecting every origin is dangerous',
        'Preflight (OPTIONS) requests happen for JSON bodies, custom headers and methods like PUT/DELETE',
      ],
    },
    {
      heading: 'Rate limiting and brute-force protection',
      content:
        "Without limits, an attacker can try 10,000 passwords per minute on `/api/auth/login`, or flood your OTP endpoint and burn your SMS budget. **Rate limiting** counts requests per key (usually IP, or IP + email) inside a time window and returns **429 Too Many Requests** when the limit is crossed.\n\nGood practice:\n\n- A **global** limit (for example 300 requests / 15 minutes per IP) for the whole API\n- A **strict** limit for login, register, forgot-password and OTP (for example 5 attempts / 15 minutes)\n- Send the `Retry-After` header and the standard `RateLimit` headers so the React app can show \"Try again in 10 minutes\"\n- When you run more than one server instance, store counters in **Redis** (`rate-limit-redis`), otherwise each instance has its own count\n- Behind a proxy (Render, Railway, Nginx, Cloudflare) set `app.set('trust proxy', 1)` so `req.ip` is the real client IP, not the proxy's\n\nAccount lockout (lock after N failed logins) is another layer, but it can be abused to lock real users out, so prefer slowing down plus CAPTCHA after a few failures.",
      syntax: `import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':' + (req.body?.email || ''),
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/login', loginLimiter, login);`,
    },
    {
      heading: 'NoSQL injection and input validation',
      content:
        "SQL injection has a MongoDB cousin. Look at this login code:\n\n`const user = await User.findOne({ email: req.body.email, password: req.body.password });`\n\nIf the attacker sends `{ \"email\": \"admin@shop.in\", \"password\": { \"$ne\": null } }`, the query becomes \"password is not equal to null\", which matches the admin. They are logged in without the password. The same trick works with `$gt`, `$regex` and `$where`.\n\nFixes (use all of them):\n\n1. **Validate types with a schema** (Zod): `password: z.string().min(8)` rejects an object immediately. This is the most important fix.\n2. **Never put raw request objects into queries.** Pick fields: `User.findOne({ email: String(email) })`.\n3. **Strip keys starting with `$` or containing `.`** from `req.body` and `req.params` with a small sanitiser. Note: the old `express-mongo-sanitize` package tries to reassign `req.query`, which is a read-only getter in Express 5, so write your own or sanitise only body/params.\n4. Mongoose's `strictQuery` option and `sanitizeFilter: true` (`mongoose.set('sanitizeFilter', true)`) wrap suspicious filter objects in `$eq`.\n5. Never use `$where` or build queries with string concatenation; escape user text before using it in `$regex` (or use a text/Atlas Search index).\n6. Compare passwords with `bcrypt.compare`, never inside the query.",
      tip: "Interviewers love this question: \"Is MongoDB safe from injection because it has no SQL?\" No. Operator injection ($ne, $gt, $regex) is real. Schema validation is the main defence.",
    },
    {
      heading: 'XSS in React and Content Security Policy',
      content:
        "**Cross-Site Scripting (XSS)** means the attacker gets their JavaScript to run on your page, usually by saving it in data (a product review, a username) that other users later see. Once their script runs, it can read anything the page can read, including tokens stored in `localStorage`.\n\nWhat React already does: `{review.text}` in JSX is **escaped automatically**. `<script>` inside the text is shown as text, not executed.\n\nWhere React apps still get XSS:\n\n- `dangerouslySetInnerHTML={{ __html: userHtml }}` with unsanitised HTML. If you must render rich text (a blog editor), clean it with **DOMPurify** first.\n- **URLs**: `<a href={user.website}>` where the website is `javascript:alert(1)`. Validate that URLs start with `https://` (Zod `z.string().url()` plus a protocol check).\n- Injecting into `<script>` tags in server-rendered HTML, or using `eval`/`new Function` with user input.\n- Third-party scripts loaded from untrusted CDNs.\n\nSecond line of defence: a **Content Security Policy** header (via helmet) such as `script-src 'self'` means even if a script tag is injected, the browser refuses to run inline or foreign scripts. Third line: keep the refresh token in an **httpOnly cookie**, which JavaScript cannot read at all.",
      syntax: `import DOMPurify from 'dompurify';

function ReviewBody({ html }) {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return <div className="prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}

const safeUrl = (u) => (/^https?:\\/\\//i.test(u) ? u : '#');
<a href={safeUrl(user.website)} rel="noopener noreferrer" target="_blank">Website</a>`,
    },
    {
      heading: 'CSRF with cookies, secrets management',
      content:
        "**CSRF (Cross-Site Request Forgery)**: if your auth uses cookies, the browser attaches them automatically to every request to your API, even when the request is started by `evil.com` (for example an auto-submitted form). The attacker cannot read the response, but they can make the action happen (transfer money, change email).\n\nDefences for a MERN app:\n\n1. **SameSite cookies**: `sameSite: 'lax'` (or `'strict'`) stops the browser from sending the cookie on cross-site POSTs. If your frontend and API are on different sites (e.g. `myapp.vercel.app` and `myapi.onrender.com`) you are forced to use `sameSite: 'none'; secure: true`, and then you MUST add a CSRF token. Best fix: put both on one site, e.g. `app.shop.in` and `api.shop.in`.\n2. **Double-submit CSRF token**: server sets a random `csrfToken` cookie (readable by JS); React copies it into an `X-CSRF-Token` header; server checks header === cookie. `evil.com` cannot read your cookie, so it cannot set the header.\n3. **Check `Origin`** on state-changing requests against your allowlist.\n4. Never change state with GET.\n\nIf you send the access token in an `Authorization: Bearer` header from memory (not a cookie), CSRF does not apply to those requests; only the refresh endpoint that reads the cookie needs protection.\n\n**Secrets management**:\n\n- `.env` is for local development only and must be in `.gitignore`. Commit a `.env.example` with empty values.\n- In production, put secrets in the platform's environment settings (Render, Railway, Vercel, GitHub Actions secrets).\n- Anything with `VITE_` prefix is **bundled into the public JavaScript**. Never put API secrets (Razorpay key secret, JWT secret, Cloudinary secret) in the React app.\n- If a secret was ever pushed to Git, **rotate it**; deleting the commit is not enough.\n- Use different secrets per environment and long random JWT secrets (`node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"`).",
    },
    {
      heading: 'OWASP Top 10 mapped to MERN fixes',
      content:
        "The **OWASP Top 10** (2021 edition, still the common interview reference) is a list of the most critical web risks. Here is a quick MERN mapping:\n\n1. **A01 Broken Access Control**: missing ownership checks (`order.user !== req.user.id`), admin routes without role checks → `authorize('admin')` and ownership checks (Day 5).\n2. **A02 Cryptographic Failures**: plain-text passwords, HTTP instead of HTTPS → bcrypt (cost 10-12), HTTPS + HSTS, encrypt sensitive fields.\n3. **A03 Injection**: NoSQL operator injection, command injection → Zod validation, sanitiser, never `eval`.\n4. **A04 Insecure Design**: no rate limit on OTP, predictable reset tokens → threat modelling, random tokens with expiry.\n5. **A05 Security Misconfiguration**: stack traces in responses, `cors({ origin: true, credentials: true })`, default Mongo with no auth → helmet, strict CORS, generic error messages in production.\n6. **A06 Vulnerable Components**: old packages → `npm audit`, Dependabot, update regularly.\n7. **A07 Identification & Authentication Failures**: no brute-force protection, long-lived tokens → rate limiting, short access tokens, refresh rotation.\n8. **A08 Software & Data Integrity Failures**: unverified webhooks, untrusted CI scripts → verify Razorpay webhook signatures (Day 10), lock files, pinned actions.\n9. **A09 Logging & Monitoring Failures**: no logs of failed logins → structured logs (pino), alerts, never log passwords or tokens.\n10. **A10 SSRF**: server fetches any URL the user gives (\"import image from URL\") → allowlist hosts, block internal IPs.\n\n(OWASP is preparing a newer edition; the categories above are what most interviewers still ask about.)",
      tip: "Keep a SECURITY.md checklist in your project repo and tick it before every deploy. Mentioning this in an interview shows maturity.",
    },
  ],
  examples: [
    {
      title: 'Secure headers and a hidden stack (helmet idea, built by hand)',
      scenario: "Your API currently reveals 'X-Powered-By: Express' and returns error stack traces. You want helmet-style headers and safe error messages.",
      steps: [
        'Disable the X-Powered-By header with app.disable()',
        'Write a small middleware that sets the most important security headers (in real projects: app.use(helmet()))',
        'Add a route that throws an error',
        'Write an error handler that logs the real error but returns a generic message',
        'Run the API Lab requests and look at the response headers and body',
      ],
      code: `// Real project: npm i helmet  ->  app.use(helmet());
// Below we set a few of the same headers by hand so you can see them.
const express = require('express');
const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/orders/broken', (req, res) => {
  throw new Error('Cannot read properties of undefined (reading "total") at orderController.js:42');
});

app.use((err, req, res, next) => {
  console.error(err);                      // full details go to logs only
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      api: {
        code: `const express = require('express');
const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/orders/broken', (req, res) => {
  throw new Error('Cannot read properties of undefined (reading "total") at orderController.js:42');
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/health' },
          { method: 'GET', url: '/api/orders/broken' },
        ],
      },
      result: "GET /api/health → 200 {\"status\":\"ok\"}\nGET /api/orders/broken → 500 {\"message\":\"Something went wrong. Please try again.\"}",
      explanation:
        "Open the Headers tab in the API Lab: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options and Referrer-Policy are present and X-Powered-By is gone. The broken route throws; Express 5 forwards the error to the 4-argument handler, which logs the real message on the server but only returns a friendly sentence. Leaking file names and line numbers (A05 Security Misconfiguration) helps attackers. In production simply use app.use(helmet()), which sets these and more with tested defaults.",
    },
    {
      title: 'Strict CORS allowlist with credentials',
      scenario: 'The React app runs on https://shop.in and the admin panel on https://admin.shop.in. Only these two origins may call the API with cookies.',
      steps: [
        'Read the allowed origins from an environment variable (here a constant)',
        'For each request, compare the Origin header with the allowlist',
        'Only for allowed origins, send Access-Control-Allow-Origin with the EXACT origin and Allow-Credentials: true',
        'Answer OPTIONS preflight requests with 204',
        'Test from an allowed origin, a blocked origin and a preflight',
      ],
      code: `// Real project (npm i cors):
// const allowed = process.env.CLIENT_URL.split(',');
// app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowed.includes(origin)), credentials: true }));
//
// React side (axios):
// export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });

const express = require('express');
const app = express();
const ALLOWED = ['https://shop.in', 'https://admin.shop.in'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin',
    });
    if (req.method === 'OPTIONS') {
      res.set({
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-CSRF-Token',
      });
      return res.sendStatus(204);
    }
  }
  next();
});

app.get('/api/cart', (req, res) => {
  res.json({ items: 2, allowOrigin: res.get('Access-Control-Allow-Origin') || 'none' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
      api: {
        code: `const express = require('express');
const app = express();
const ALLOWED = ['https://shop.in', 'https://admin.shop.in'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin',
    });
    if (req.method === 'OPTIONS') {
      res.set({
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-CSRF-Token',
      });
      return res.sendStatus(204);
    }
  }
  next();
});

app.get('/api/cart', (req, res) => {
  res.json({ items: 2, allowOrigin: res.get('Access-Control-Allow-Origin') || 'none' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/api/cart', headers: { Origin: 'https://shop.in' } },
          { method: 'GET', url: '/api/cart', headers: { Origin: 'https://evil.example' } },
          { method: 'OPTIONS', url: '/api/cart', headers: { Origin: 'https://admin.shop.in', 'Access-Control-Request-Method': 'DELETE' } },
        ],
      },
      result: "GET /api/cart → 200 {\"items\":2,\"allowOrigin\":\"https://shop.in\"}\nGET /api/cart → 200 {\"items\":2,\"allowOrigin\":\"none\"}\nOPTIONS /api/cart → 204",
      explanation:
        "For https://shop.in the server echoes that exact origin plus Allow-Credentials, so the browser lets React read the response. For evil.example no CORS headers are sent: the server still answers (CORS is not a firewall), but the browser hides the response from the evil page, and SameSite cookies stop the cookie from being attached. The preflight OPTIONS from the admin origin gets 204 with the allowed methods and headers. 'Vary: Origin' tells CDNs not to cache one origin's answer for another.",
    },
    {
      title: 'Rate limiting the login endpoint (429 Too Many Requests)',
      scenario: 'Attackers are trying thousands of passwords on /api/auth/login. Allow 3 attempts per IP + email, then return 429.',
      steps: [
        'Create an in-memory Map of counters (production: express-rate-limit with a Redis store)',
        'Build the key from req.ip and the email in the body',
        'Increment the counter and set RateLimit headers',
        'Return 429 with Retry-After when the limit is exceeded',
        'Send four login attempts in the API Lab',
      ],
      code: `// Production version
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from './redis.js';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':' + String(req.body?.email || '').toLowerCase(),
  store: new RedisStore({ sendCommand: (...args) => redis.sendCommand(args) }),
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
});

// React: show a friendly message
// if (err.response?.status === 429) toast.error(err.response.data.message);`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

const LIMIT = 3;
const hits = new Map(); // key -> count (real app: Redis with a 15 min expiry)

function loginLimiter(req, res, next) {
  const key = req.ip + ':' + String(req.body?.email || '').toLowerCase();
  const count = (hits.get(key) || 0) + 1;
  hits.set(key, count);
  res.set('RateLimit-Limit', String(LIMIT));
  res.set('RateLimit-Remaining', String(Math.max(LIMIT - count, 0)));
  if (count > LIMIT) {
    res.set('Retry-After', '900');
    return res.status(429).json({ message: 'Too many login attempts. Try again in 15 minutes.' });
  }
  next();
}

app.post('/api/auth/login', loginLimiter, (req, res) => {
  // pretend every password is wrong
  res.status(401).json({ message: 'Invalid email or password' });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/auth/login', body: { email: 'riya@shop.in', password: 'guess1' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'riya@shop.in', password: 'guess2' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'riya@shop.in', password: 'guess3' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'riya@shop.in', password: 'guess4' } },
        ],
      },
      result: "POST /api/auth/login → 401 {\"message\":\"Invalid email or password\"}\nPOST /api/auth/login → 401 {\"message\":\"Invalid email or password\"}\nPOST /api/auth/login → 401 {\"message\":\"Invalid email or password\"}\nPOST /api/auth/login → 429 {\"message\":\"Too many login attempts. Try again in 15 minutes.\"}",
      explanation:
        "The first three attempts reach the login handler (401 each, RateLimit-Remaining goes 2, 1, 0 in the headers). The fourth is stopped by the limiter with 429 and Retry-After: 900 seconds before bcrypt or the database is even touched, which also protects your CPU. Note the error message is the same for wrong email and wrong password, so attackers cannot discover which emails are registered. In production use express-rate-limit with a Redis store so all server instances share one counter.",
    },
    {
      title: 'Blocking NoSQL injection: sanitiser + Zod-style type check',
      scenario: "An attacker sends {\"password\": {\"$ne\": null}} to the login API. Show the attack and two layers of defence.",
      steps: [
        'Write a recursive function that removes keys starting with $ or containing a dot',
        'Apply it to req.body (Express 5 req.query is read-only, so sanitise a copy if you need it)',
        'Also check that email and password are strings (Zod does this in the real project)',
        'Send a normal login and two attack payloads',
        'Compare the responses',
      ],
      code: `// server/src/middleware/sanitize.js (Express 5 safe)
export function stripMongoOperators(value) {
  if (Array.isArray(value)) return value.map(stripMongoOperators);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
        .map(([k, v]) => [k, stripMongoOperators(v)]),
    );
  }
  return value;
}
export const sanitizeMongo = (req, res, next) => {
  if (req.body) req.body = stripMongoOperators(req.body);
  if (req.params) req.params = stripMongoOperators(req.params);
  next();
};

// server/src/validators/auth.js (shared Zod schema)
import { z } from 'zod';
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});

// controller
const { email, password } = loginSchema.parse(req.body);
const user = await User.findOne({ email }).select('+password');
if (!user || !(await bcrypt.compare(password, user.password))) {
  return res.status(401).json({ message: 'Invalid email or password' });
}`,
      api: {
        code: `const express = require('express');
const app = express();
app.use(express.json());

function stripMongoOperators(value) {
  if (Array.isArray(value)) return value.map(stripMongoOperators);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
        .map(([k, v]) => [k, stripMongoOperators(v)])
    );
  }
  return value;
}
app.use((req, res, next) => {
  if (req.body) req.body = stripMongoOperators(req.body);
  next();
});

// fake users collection; real code uses bcrypt.compare
const users = [{ email: 'admin@shop.in', password: 'S3cret!pass', role: 'admin' }];

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'email and password must be strings', received: req.body });
  }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ message: 'Logged in', role: user.role });
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'POST', url: '/api/auth/login', body: { email: 'admin@shop.in', password: 'S3cret!pass' } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'admin@shop.in', password: { $ne: null } } },
          { method: 'POST', url: '/api/auth/login', body: { email: { $gt: '' }, password: 'x' } },
        ],
      },
      result: "POST /api/auth/login → 200 {\"message\":\"Logged in\",\"role\":\"admin\"}\nPOST /api/auth/login → 400 {\"message\":\"email and password must be strings\",\"received\":{\"email\":\"admin@shop.in\",\"password\":{}}}\nPOST /api/auth/login → 400 {\"message\":\"email and password must be strings\",\"received\":{\"email\":{},\"password\":\"x\"}}",
      explanation:
        "The honest login succeeds. In the attack payloads the sanitiser removes the $ne / $gt keys, leaving an empty object, and the type check then rejects the request with 400. Without these layers, User.findOne({ email, password: { $ne: null } }) would match the admin. Real projects use a Zod schema (z.string()) which rejects objects in one step, never compare passwords inside the query (use bcrypt.compare), and can also enable mongoose.set('sanitizeFilter', true).",
    },
    {
      title: 'CSRF protection with the double-submit cookie (server + React)',
      scenario: "Your refresh token is in a cookie and the frontend and API are on different sites, so you need sameSite: 'none'. Add a CSRF token check to state-changing requests.",
      steps: [
        'On login, set a random csrfToken cookie that JavaScript CAN read (not httpOnly)',
        'In React, an axios interceptor copies the cookie value into the X-CSRF-Token header',
        'On the server, a middleware compares header and cookie for POST/PUT/PATCH/DELETE',
        'Skip the check for GET/HEAD/OPTIONS',
        'Test: a request without the header fails with 403',
      ],
      code: `// ===== server/src/middleware/csrf.js =====
import crypto from 'node:crypto';

export function issueCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrfToken', token, {
    httpOnly: false,            // React must read it
    secure: true,
    sameSite: 'none',           // cross-site deployment
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}

export function verifyCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const header = req.get('x-csrf-token');
  const cookie = req.cookies?.csrfToken;
  if (!header || !cookie || header.length !== cookie.length ||
      !crypto.timingSafeEqual(Buffer.from(header), Buffer.from(cookie))) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  next();
}

// app.js
app.use(cookieParser());
app.use('/api', verifyCsrf, routes);

// in the login controller, after setting the refresh cookie:
issueCsrfCookie(res);

// ===== client/src/api/client.js =====
import axios from 'axios';

const readCookie = (name) =>
  document.cookie.split('; ').find((c) => c.startsWith(name + '='))?.split('=')[1];

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = readCookie('csrfToken');
  if (token) config.headers['X-CSRF-Token'] = token;
  return config;
});`,
      explanation:
        "evil.com can make the browser SEND your cookies, but it cannot READ them (same-origin policy), so it cannot copy the token into the X-CSRF-Token header. The server only accepts state-changing requests where header and cookie match. crypto.timingSafeEqual avoids timing attacks. Note: document.cookie can only read the csrfToken cookie if it is set for a domain the frontend can see; when the API is on a totally different site, return the token in the login JSON response instead and keep it in memory. The simplest robust setup is same-site domains (app.shop.in + api.shop.in) with sameSite: 'lax' cookies.",
    },
  ],
  interview: [
    {
      q: 'What does helmet do in an Express app?',
      a: "helmet is middleware that sets secure HTTP response headers: Content-Security-Policy, Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, X-Frame-Options/frame-ancestors (clickjacking), Referrer-Policy, Cross-Origin-* policies, and it removes X-Powered-By. It reduces the browser attack surface with one line: app.use(helmet()). It does not validate input or replace authentication.",
      level: 'Easy',
    },
    {
      q: 'Is CORS a security feature that protects your API from attackers?',
      a: "Not exactly. CORS is a browser mechanism that relaxes the same-origin policy: it decides which websites' JavaScript may READ responses from your API. Tools like curl and Postman ignore it, and the server still processes the request. So CORS is not authentication or a firewall. It does matter for credentials: a wrong config like reflecting every origin with credentials: true lets any site read authenticated responses of a logged-in user.",
      level: 'Medium',
    },
    {
      q: 'Why can you not use Access-Control-Allow-Origin: * with cookies?',
      a: "Browsers reject credentialed responses (cookies, Authorization) when Allow-Origin is '*'. You must return the exact requesting origin plus Access-Control-Allow-Credentials: true, and the client must use withCredentials: true / credentials: 'include'. Use an allowlist, and add Vary: Origin so caches do not mix responses.",
      level: 'Medium',
    },
    {
      q: 'Explain NoSQL injection with an example and how you prevent it.',
      a: "If the login code does User.findOne({ email: req.body.email, password: req.body.password }) and the attacker sends password: { \"$ne\": null }, the filter matches any user with a password, bypassing authentication. Prevent it by validating types with a schema (Zod: z.string()), picking fields instead of passing raw objects, stripping keys that start with $ or contain dots, enabling mongoose sanitizeFilter, never using $where, escaping user input used in $regex, and comparing passwords with bcrypt.compare instead of in the query.",
      level: 'Medium',
    },
    {
      q: 'React escapes output automatically. How can a React app still have XSS?',
      a: "Through dangerouslySetInnerHTML with unsanitised HTML, user-controlled URLs like javascript:alert(1) in href or src, server-side rendered data injected into script tags, eval/new Function, and compromised third-party scripts. Fixes: DOMPurify before dangerouslySetInnerHTML, validate URL protocols, a strict Content-Security-Policy, and keep tokens in httpOnly cookies so a successful XSS cannot steal them directly.",
      level: 'Medium',
    },
    {
      q: 'What is CSRF and when does a MERN app need CSRF protection?',
      a: "CSRF tricks a logged-in user's browser into sending an authenticated request to your API from another site, because the browser attaches cookies automatically. It matters when authentication is cookie-based. SameSite=Lax/Strict cookies block most cases. If you need SameSite=None (frontend and API on different sites), add a CSRF token (double-submit cookie or synchronizer token) and check the Origin header. Requests authenticated only by an Authorization header kept in memory are not vulnerable to CSRF.",
      level: 'Hard',
    },
    {
      q: 'Where should JWTs be stored in the browser: localStorage or cookies?',
      a: "A common secure pattern: short-lived access token kept in memory (React state/context) and sent in the Authorization header; long-lived refresh token in an httpOnly, Secure, SameSite cookie scoped to the refresh path. localStorage is readable by any script, so XSS can steal tokens. httpOnly cookies cannot be read by JS but bring CSRF concerns, which SameSite and CSRF tokens address. There is no perfect option; you trade XSS risk vs CSRF risk and mitigate both.",
      level: 'Hard',
    },
    {
      q: 'Why do you need app.set("trust proxy", 1) on Render or behind Nginx?',
      a: "Behind a reverse proxy, the TCP connection comes from the proxy, so req.ip would be the proxy IP and every user would share one rate-limit counter. trust proxy tells Express to read the client IP from X-Forwarded-For (trusting one hop). Also needed so req.secure/req.protocol are correct and Secure cookies work. Do not set it to true blindly; trusting too many hops lets clients spoof X-Forwarded-For.",
      level: 'Hard',
    },
    {
      q: 'A developer committed the .env file with the JWT secret and MongoDB password to GitHub. What do you do?',
      a: "Treat the secrets as leaked: rotate them immediately (new JWT secret, which logs everyone out; change the Atlas user password; rotate Cloudinary/Razorpay keys). Update them in the hosting platform settings. Then remove the file from history (git filter-repo or BFG) and add .env to .gitignore, commit a .env.example, and enable GitHub secret scanning/push protection. Deleting the file in a new commit alone is not enough because history and forks keep it.",
      level: 'Medium',
    },
    {
      q: 'Why is it dangerous to put a secret in a VITE_ environment variable?',
      a: "Vite replaces import.meta.env.VITE_* at build time, so the values are embedded in the public JS bundle that anyone can download and read. Only public values (API base URL, Razorpay key_id, Cloudinary cloud name) belong there. Secrets like JWT secret, Razorpay key_secret or Cloudinary API secret must stay on the server.",
      level: 'Easy',
    },
    {
      q: 'Name the OWASP Top 10 categories and one MERN example for three of them.',
      a: "A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable and Outdated Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures, A09 Security Logging and Monitoring Failures, A10 SSRF. Examples: A01 - a user can GET /api/orders/:id of another user because there is no ownership check; A03 - $ne operator injection in login; A08 - accepting a Razorpay webhook without verifying the HMAC signature.",
      level: 'Medium',
    },
    {
      q: 'How do you limit the impact if your MongoDB credentials leak?',
      a: "Least privilege: the app's Atlas user has readWrite only on its own database, not atlasAdmin. Restrict Atlas network access to your server's IPs (or use private endpoints/VPC peering). Use separate users and clusters per environment. Enable backups and audit logs, keep secrets in the platform's secret store, and rotate passwords regularly.",
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write a production-ready security setup for app.js in Express 5: helmet, CORS allowlist from CLIENT_URL (comma separated), global rate limit, 10kb JSON limit, cookie-parser, a Mongo sanitiser, 404 and an error handler that hides stack traces when NODE_ENV is production.',
      hint: 'Mount security middleware before routes. Express 5 forwards async errors automatically.',
      solution: `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';

function stripMongoOperators(v) {
  if (Array.isArray(v)) return v.map(stripMongoOperators);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v)
      .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
      .map(([k, val]) => [k, stripMongoOperators(val)]));
  }
  return v;
}

const app = express();
const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => (!origin || allowed.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'))),
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.body) req.body = stripMongoOperators(req.body);
  next();
});

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  req.log?.error(err) ?? console.error(err);
  res.status(status).json({
    message: status < 500 ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

export default app;`,
    },
    {
      task: 'Create a reusable validate(schema) middleware with Zod that validates req.body and req.params, replaces them with the parsed values, and returns 400 with field errors. Use it on POST /api/products.',
      hint: 'Use schema.safeParse and error.flatten().fieldErrors. Do not assign to req.query in Express 5; store parsed query on req.validatedQuery instead.',
      solution: `import { z } from 'zod';

export const validate = ({ body, params, query }) => (req, res, next) => {
  const errors = {};
  if (body) {
    const r = body.safeParse(req.body);
    if (r.success) req.body = r.data; else errors.body = r.error.flatten().fieldErrors;
  }
  if (params) {
    const r = params.safeParse(req.params);
    if (r.success) req.params = r.data; else errors.params = r.error.flatten().fieldErrors;
  }
  if (query) {
    const r = query.safeParse(req.query);
    if (r.success) req.validatedQuery = r.data; else errors.query = r.error.flatten().fieldErrors;
  }
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
  next();
};

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  price: z.number().positive(),
  category: z.enum(['phones', 'laptops', 'accessories']),
  website: z.string().url().refine((u) => u.startsWith('https://'), 'Must be https').optional(),
});

// routes/products.js
router.post('/', protect, authorize('admin'), validate({ body: productSchema }), createProduct);`,
    },
    {
      task: 'Build a React component <SafeRichText html={...} /> that renders blog HTML safely, plus a helper safeHref(url) used for user profile links. Show how you would test that <img src=x onerror=alert(1)> is cleaned.',
      hint: 'npm i dompurify. Allow only http/https URLs.',
      solution: `// client/src/components/SafeRichText.jsx
import DOMPurify from 'dompurify';

export function SafeRichText({ html }) {
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'iframe', 'form'],
    FORBID_ATTR: ['style'],
  });
  return <div className="prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function safeHref(url) {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol) ? u.href : '#';
  } catch {
    return '#';
  }
}

// client/src/components/SafeRichText.test.jsx (Vitest + RTL)
import { render } from '@testing-library/react';
import { SafeRichText, safeHref } from './SafeRichText';

test('removes event handler attributes', () => {
  const { container } = render(<SafeRichText html={'<p>Hi</p><img src=x onerror=alert(1)>'} />);
  expect(container.innerHTML).toContain('<p>Hi</p>');
  expect(container.innerHTML).not.toContain('onerror');
});

test('blocks javascript: urls', () => {
  expect(safeHref('javascript:alert(1)')).toBe('#');
  expect(safeHref('https://riya.dev')).toBe('https://riya.dev/');
});`,
    },
    {
      task: 'Write a strict login limiter AND a "forgot password" limiter keyed by email, and show the React code that displays the Retry-After time when the API returns 429.',
      hint: 'express-rate-limit keyGenerator; read err.response.headers["retry-after"] in axios.',
      solution: `// server/src/middleware/limiters.js
import rateLimit from 'express-rate-limit';

const base = { standardHeaders: 'draft-7', legacyHeaders: false };

export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.ip + ':' + String(req.body?.email || '').toLowerCase(),
  message: { message: 'Too many login attempts. Try again later.' },
});

export const forgotPasswordLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => 'forgot:' + String(req.body?.email || req.ip).toLowerCase(),
  message: { message: 'Too many reset requests. Check your inbox or try again in an hour.' },
});

// routes/auth.js
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

// client/src/pages/Login.jsx (inside onSubmit)
try {
  await login(values);
} catch (err) {
  if (err.response?.status === 429) {
    const secs = Number(err.response.headers['retry-after'] || 900);
    setError('Too many attempts. Try again in ' + Math.ceil(secs / 60) + ' minutes.');
  } else {
    setError(err.response?.data?.message || 'Login failed');
  }
}`,
    },
    {
      task: 'Write a SECURITY.md checklist for your MERN project covering at least 12 items across headers, CORS, auth, input, data, secrets, dependencies and monitoring.',
      hint: 'Make each line a checkable item you can verify before deploy.',
      solution: `# Security checklist (tick before every release)

## Transport & headers
- [ ] HTTPS only, HSTS enabled (helmet)
- [ ] helmet() with a Content-Security-Policy that allows only our domains, Cloudinary and Razorpay
- [ ] X-Powered-By removed

## CORS & cookies
- [ ] CORS origin allowlist from CLIENT_URL, credentials: true, no wildcard
- [ ] Refresh cookie: httpOnly, Secure, SameSite=Lax (or None + CSRF token), path=/api/auth/refresh
- [ ] CSRF token checked on POST/PUT/PATCH/DELETE when SameSite=None

## Authentication & authorization
- [ ] bcrypt cost >= 10, passwords never logged or returned (select: false)
- [ ] Access token 15 min, refresh token 7 days with rotation and reuse detection
- [ ] Login / forgot-password / OTP rate limited; generic error messages
- [ ] Every :id route checks ownership or role (no IDOR)

## Input & data
- [ ] Zod validation on every body/params/query; JSON body limit 10kb
- [ ] Mongo operator sanitiser + mongoose sanitizeFilter
- [ ] User HTML sanitised with DOMPurify; URLs restricted to https
- [ ] File uploads: type + size limits, stored on Cloudinary, never executed

## Secrets & infrastructure
- [ ] .env in .gitignore, .env.example committed, secrets only in Render/Vercel/GitHub settings
- [ ] No secrets in VITE_ variables
- [ ] Atlas user has readWrite on app DB only; network access restricted; backups on

## Dependencies & monitoring
- [ ] npm audit --omit=dev clean; Dependabot enabled
- [ ] Webhooks verified with HMAC signatures
- [ ] Structured logs (pino) with request id; alerts on 5xx spikes and failed-login spikes`,
    },
  ],
  quiz: [
    {
      question: 'An attacker sends {"email":"admin@shop.in","password":{"$ne":null}} to a login route that uses User.findOne(req.body). What is this attack called?',
      options: ['Cross-site scripting', 'NoSQL operator injection', 'CSRF', 'Clickjacking'],
      answer: 1,
      explanation: 'MongoDB query operators like $ne inside user input change the meaning of the filter. This is NoSQL injection; schema validation (z.string()) and sanitising stop it.',
    },
    {
      question: 'Which CORS configuration is correct for a React app on https://shop.in that sends cookies to the API?',
      options: [
        "origin: '*', credentials: true",
        'origin: true (reflect any origin), credentials: true',
        "origin: ['https://shop.in'], credentials: true",
        'No CORS at all, cookies work automatically',
      ],
      answer: 2,
      explanation: 'With credentials the exact origin must be returned. A wildcard is rejected by browsers, and reflecting every origin lets any website read authenticated responses.',
    },
    {
      question: 'Why is a Razorpay key_secret in VITE_RAZORPAY_SECRET a security problem?',
      options: [
        'Vite does not support environment variables',
        'It slows down the build',
        'It only works in development',
        'VITE_ variables are embedded in the public JavaScript bundle that anyone can read',
      ],
      answer: 3,
      explanation: 'Everything prefixed with VITE_ is replaced into client code at build time. Secrets must live only on the server.',
    },
    {
      question: 'Which setting most directly protects cookie-based auth from CSRF in modern browsers?',
      options: ["SameSite=Lax or Strict on the auth cookie", 'helmet() default headers', 'express.json({ limit: "10kb" })', 'bcrypt with cost 12'],
      answer: 0,
      explanation: 'SameSite stops the browser from attaching the cookie to cross-site POST requests. If you must use SameSite=None, add a CSRF token.',
    },
    {
      question: 'Your Express API runs on Render behind a proxy and the rate limiter blocks ALL users after a few requests. What is the most likely fix?',
      options: ['Increase the limit to 1,000,000', "app.set('trust proxy', 1)", 'Remove helmet', 'Use sameSite: none cookies'],
      answer: 1,
      explanation: 'Without trust proxy, req.ip is the proxy address for everyone, so all users share one counter. trust proxy makes Express use the client IP from X-Forwarded-For.',
    },
  ],
};
