export default {
  id: 'extra-04-web-fundamentals-for-mern',
  title: 'Web Fundamentals for MERN Interviews: HTTP, REST, Storage, CORS, JWT, Browser Rendering, HTML/CSS',
  module: 'Interview: Frontend',
  extraNo: 4,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Every MERN interview starts with "how does the web work?" questions: HTTP methods and status codes, REST, cookies vs localStorage, CORS, JWT, what happens when you type a URL, and quick HTML/CSS checks. This topic gives you short revision notes plus 28 interview-ready answers.',
  objectives: [
    'Explain HTTP methods, status codes, headers and statelessness with real API examples',
    'Compare cookies, localStorage and sessionStorage and choose the right one for auth tokens',
    'Explain CORS, preflight requests and how to fix CORS errors in an Express + React app',
    'Describe JWT structure, signing, expiry, refresh tokens and where to store them safely',
    'Walk through "what happens when you type a URL" and the critical rendering path',
    'Answer the most common HTML and CSS screening questions (semantic tags, box model, flex vs grid, specificity)',
  ],
  theory: [
    {
      heading: 'HTTP basics: request, response, methods and status codes',
      content: `HTTP is a **stateless request-response protocol**. The client (browser, React app, Postman) sends a request with a **method**, **URL**, **headers** and optional **body**; the server replies with a **status code**, headers and a body. "Stateless" means the server does not remember previous requests by itself, so we send identity every time (cookie or \`Authorization\` header).

**Methods you must know**
- \`GET\` – read data. Safe and idempotent. No body.
- \`POST\` – create a resource or trigger an action. Not idempotent (two clicks = two orders).
- \`PUT\` – replace the whole resource. Idempotent.
- \`PATCH\` – update some fields. Not guaranteed idempotent.
- \`DELETE\` – remove. Idempotent (second delete returns 404 or 204, but the state is the same).
- \`OPTIONS\` – ask what is allowed (used by CORS preflight). \`HEAD\` – like GET without body.

**Status code families**: 1xx info, **2xx success** (200 OK, 201 Created, 204 No Content), **3xx redirect** (301 permanent, 302/307 temporary, 304 Not Modified), **4xx client error** (400 Bad Request, 401 Unauthorized = not logged in, 403 Forbidden = logged in but not allowed, 404, 409 Conflict, 422 Unprocessable, 429 Too Many Requests), **5xx server error** (500, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout).

**HTTP versions**: HTTP/1.1 (one request at a time per connection, keep-alive), HTTP/2 (multiplexing many requests over one TCP connection, header compression), HTTP/3 (runs on QUIC over UDP, faster connection setup and no TCP head-of-line blocking). HTTPS = HTTP over TLS: encryption + integrity + server identity via certificates.`,
      tip: 'How to answer: give the definition, one status code example from your own project ("my signup API returns 201 with the created user, 409 if the email exists"), and mention idempotency. That shows practical understanding, not memorisation.',
    },
    {
      heading: 'REST API design in one page',
      content: `**REST** (Representational State Transfer) is an architectural style where everything is a **resource** identified by a URL, and you act on it with standard HTTP methods. Key constraints: client-server, **stateless**, cacheable, uniform interface, layered system.

Good REST URLs use **nouns, plural, lowercase**, and nesting for relationships:
- \`GET /api/v1/products\` – list (with \`?page=2&limit=20&sort=-price&category=shoes\`)
- \`GET /api/v1/products/42\` – one product
- \`POST /api/v1/products\` – create (201 + Location header)
- \`PATCH /api/v1/products/42\` – partial update
- \`DELETE /api/v1/products/42\` – delete (204)
- \`GET /api/v1/users/7/orders\` – orders of user 7

Avoid verbs in URLs (\`/getProducts\`, \`/deleteUser\`). Version your API (\`/v1\`). Return consistent JSON errors like \`{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }\`.

**REST vs GraphQL**: REST has many endpoints and fixed response shapes (can over-fetch or under-fetch); GraphQL has one endpoint where the client asks for exactly the fields it needs. REST is simpler to cache with HTTP; GraphQL is great when many different screens need different shapes of data.`,
      points: ['Idempotent: GET, PUT, DELETE, HEAD, OPTIONS', 'Safe (read-only): GET, HEAD, OPTIONS', 'Pagination, filtering, sorting go in query params, not in the path'],
    },
    {
      heading: 'Cookies vs localStorage vs sessionStorage (and where to keep tokens)',
      content: `| | Cookie | localStorage | sessionStorage |
|---|---|---|---|
| Size | ~4 KB per cookie | ~5-10 MB per origin | ~5 MB per origin |
| Sent to server automatically | **Yes**, with every matching request | No | No |
| Expiry | \`Expires\`/\`Max-Age\` or session | Never (until cleared) | When the tab closes |
| Readable by JS | Yes, unless \`HttpOnly\` | Yes | Yes |
| Scope | Domain + path | Origin (protocol+host+port) | Origin **and** the single tab |

**Security flags on cookies**: \`HttpOnly\` (JS cannot read it, protects from XSS stealing), \`Secure\` (HTTPS only), \`SameSite=Strict|Lax|None\` (controls cross-site sending, protects from CSRF; \`None\` requires \`Secure\`).

**Where to store a JWT?** Common interview answer:
- Access token: in **memory** (React state/context) – short-lived (5-15 min).
- Refresh token: in an **HttpOnly, Secure, SameSite cookie** – the browser sends it to \`/auth/refresh\`, JS can never read it.
- localStorage is easy but any XSS script can read it. If you use it, keep tokens short-lived and sanitise all output.

**IndexedDB** is the browser database for large structured data (offline apps). Cookies are for the server, Web Storage is for the client.`,
      tip: 'Do not say "localStorage is insecure, never use it". Say "it is readable by any script on the page, so it is vulnerable to XSS; an HttpOnly cookie is safer for long-lived tokens, but then I must handle CSRF with SameSite and/or a CSRF token". Balanced answers impress interviewers.',
    },
    {
      heading: 'CORS and the Same-Origin Policy',
      content: `An **origin** = protocol + host + port. \`http://localhost:5173\` (Vite React) and \`http://localhost:5000\` (Express) are **different origins** because the port differs.

The **Same-Origin Policy** (a browser rule) stops a page from reading responses from another origin. **CORS** (Cross-Origin Resource Sharing) is the way a server says "I allow this other origin" using response headers:
- \`Access-Control-Allow-Origin: http://localhost:5173\`
- \`Access-Control-Allow-Methods: GET,POST,PUT,DELETE\`
- \`Access-Control-Allow-Headers: Content-Type, Authorization\`
- \`Access-Control-Allow-Credentials: true\` (needed for cookies; then Allow-Origin cannot be \`*\`)

**Preflight**: for "non-simple" requests (methods like PUT/DELETE/PATCH, \`Content-Type: application/json\`, or custom headers like \`Authorization\`), the browser first sends an \`OPTIONS\` request. Only if the server answers with the right headers does it send the real request.

**Fix in Express**: \`app.use(cors({ origin: 'http://localhost:5173', credentials: true }))\` and on the client \`fetch(url, { credentials: 'include' })\` or axios \`withCredentials: true\`. In development you can also use the Vite proxy so the browser sees only one origin.

Important: CORS is enforced **by the browser only**. Postman, curl and server-to-server calls ignore it. CORS is not an authentication mechanism.`,
    },
    {
      heading: 'JWT authentication flow',
      content: `A **JSON Web Token** has three Base64URL parts separated by dots: \`header.payload.signature\`.
- **Header**: algorithm and type, e.g. \`{"alg":"HS256","typ":"JWT"}\`
- **Payload**: claims like \`sub\` (user id), \`role\`, \`iat\` (issued at), \`exp\` (expiry)
- **Signature**: \`HMACSHA256(base64url(header) + "." + base64url(payload), secret)\`

The payload is **encoded, not encrypted**: anyone can decode it, so never put passwords or sensitive data there. The signature only proves it was not **tampered** with.

**Typical MERN flow**
1. \`POST /api/auth/login\` with email + password. Server checks the bcrypt hash.
2. Server signs an access token (15 min) and a refresh token (7 days).
3. Client sends \`Authorization: Bearer <accessToken>\` on every API call; an Express middleware verifies it with \`jwt.verify\`.
4. When it expires (401), the client calls \`/api/auth/refresh\` (refresh token cookie) to get a new access token.
5. Logout = clear cookie and delete/rotate the refresh token in the DB (JWTs cannot be "revoked" without server-side state such as a blocklist or token version).

**Session vs JWT**: session-based auth stores session data on the server (or Redis) and the browser only keeps a session id cookie – easy to revoke. JWT is stateless – easy to scale across servers, but harder to revoke.`,
      tip: 'Say "authentication = who are you (401), authorization = what are you allowed to do (403)". It is asked in almost every interview.',
    },
    {
      heading: 'What happens when you type a URL + browser rendering + HTML/CSS quick notes',
      content: `**URL to pixels (say it in this order)**
1. Browser parses the URL, checks HSTS and its caches.
2. **DNS lookup** (browser cache → OS → router → ISP resolver → root → TLD → authoritative) gives the IP.
3. **TCP handshake** (or QUIC for HTTP/3) and **TLS handshake** for HTTPS.
4. Browser sends the **HTTP request**; the server (maybe via CDN / load balancer / Nginx → Node) returns HTML.
5. **Critical rendering path**: parse HTML → **DOM**; parse CSS → **CSSOM**; combine → **render tree** (only visible nodes); **layout** (reflow: sizes and positions); **paint**; **composite** layers.
6. JS can block parsing: use \`defer\` (runs after parsing, in order) or \`async\` (runs as soon as downloaded, any order). Modules are deferred by default.

**Reflow vs repaint**: changing size/position (width, top, adding nodes) triggers layout + paint (expensive). Changing only colour/visibility triggers repaint. \`transform\` and \`opacity\` can be done on the compositor (cheapest), which is why animations use them.

**HTML quick answers**: semantic tags (\`header\`, \`nav\`, \`main\`, \`article\`, \`section\`, \`footer\`) help SEO and screen readers; \`<!DOCTYPE html>\` triggers standards mode; \`alt\` text for accessibility; \`data-*\` attributes for custom data.

**CSS quick answers**: box model (content + padding + border + margin; \`box-sizing: border-box\` includes padding and border in width); specificity (inline 1000 > id 100 > class/attribute/pseudo-class 10 > element 1; \`!important\` overrides); \`position\` (static, relative, absolute → nearest positioned ancestor, fixed → viewport, sticky); **Flexbox** for one dimension, **Grid** for two dimensions; \`display:none\` removes from layout, \`visibility:hidden\` keeps the space.`,
    },
  ],
  examples: [
    {
      title: 'Decode a JWT and see why "encoded" is not "encrypted"',
      scenario: 'Interviewer: "Can the frontend read the user role from the JWT? Is it safe to put the password in it?" Prove the answer with code.',
      steps: ['Build a fake token from a header and payload with Base64URL', 'Split the token on dots', 'Decode header and payload with atob', 'Click Run and read the console'],
      code: "// Build a demo JWT and decode it (NO signature check: decoding is not verifying!)\nconst toB64Url = (obj) =>\n  btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\\+/g, '-').replace(/\\//g, '_');\n\nfunction fromB64Url(part) {\n  let b64 = part.replace(/-/g, '+').replace(/_/g, '/');\n  while (b64.length % 4) b64 += '=';\n  return JSON.parse(atob(b64));\n}\n\nconst header = { alg: 'HS256', typ: 'JWT' };\nconst payload = { sub: 'u42', name: 'Priya', role: 'student', iat: 1735689600, exp: 1735693200 };\nconst token = toB64Url(header) + '.' + toB64Url(payload) + '.demo-signature';\n\nconsole.log('Token parts:', token.split('.').length);\nconst [h, p, s] = token.split('.');\nconsole.log('Header:', fromB64Url(h));\nconsole.log('Payload:', fromB64Url(p));\nconsole.log('Valid for (minutes):', (fromB64Url(p).exp - fromB64Url(p).iat) / 60);\nconsole.log('Signature:', s);",
      playground: { html: '<h3>Open the console below and click Run</h3>', js: "// Build a demo JWT and decode it (NO signature check: decoding is not verifying!)\nconst toB64Url = (obj) =>\n  btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\\+/g, '-').replace(/\\//g, '_');\n\nfunction fromB64Url(part) {\n  let b64 = part.replace(/-/g, '+').replace(/_/g, '/');\n  while (b64.length % 4) b64 += '=';\n  return JSON.parse(atob(b64));\n}\n\nconst header = { alg: 'HS256', typ: 'JWT' };\nconst payload = { sub: 'u42', name: 'Priya', role: 'student', iat: 1735689600, exp: 1735693200 };\nconst token = toB64Url(header) + '.' + toB64Url(payload) + '.demo-signature';\n\nconsole.log('Token parts:', token.split('.').length);\nconst [h, p, s] = token.split('.');\nconsole.log('Header:', fromB64Url(h));\nconsole.log('Payload:', fromB64Url(p));\nconsole.log('Valid for (minutes):', (fromB64Url(p).exp - fromB64Url(p).iat) / 60);\nconsole.log('Signature:', s);" },
      result: `Token parts: 3
Header: { alg: 'HS256', typ: 'JWT' }
Payload: {
  sub: 'u42',
  name: 'Priya',
  role: 'student',
  iat: 1735689600,
  exp: 1735693200
}
Valid for (minutes): 60
Signature: demo-signature`,
      explanation: 'Any client can decode the header and payload with plain Base64URL decoding; no secret is needed. So the frontend CAN read the role for UI decisions (show/hide admin menu), but the server must still verify the signature with `jwt.verify(token, secret)` before trusting it. Because anyone can read it, never put passwords, OTPs or card data inside a JWT. Base64URL replaces + with -, / with _ and drops = padding so the token is URL-safe.',
    },
    {
      title: 'Parse a Cookie header and build a secure Set-Cookie',
      scenario: 'Explain how cookies travel: the browser sends `Cookie: a=1; b=2`, the server sends `Set-Cookie` with flags. Write both helpers (this is what cookie-parser and res.cookie do for you in Express).',
      steps: ['Split the Cookie header on ;', 'Split each pair on the FIRST = only (values may contain =)', 'URL-decode values', 'Build a Set-Cookie string with Max-Age, HttpOnly, Secure and SameSite'],
      code: "// Parse a Cookie request header and build a secure Set-Cookie header\nfunction parseCookies(header) {\n  return header.split(';').reduce((acc, pair) => {\n    const [key, ...rest] = pair.trim().split('=');\n    if (key) acc[key] = decodeURIComponent(rest.join('='));\n    return acc;\n  }, {});\n}\n\nfunction buildSetCookie(name, value, opts = {}) {\n  const parts = [name + '=' + encodeURIComponent(value)];\n  if (opts.maxAge) parts.push('Max-Age=' + opts.maxAge);\n  parts.push('Path=' + (opts.path || '/'));\n  if (opts.httpOnly) parts.push('HttpOnly');\n  if (opts.secure) parts.push('Secure');\n  if (opts.sameSite) parts.push('SameSite=' + opts.sameSite);\n  return parts.join('; ');\n}\n\nconst incoming = 'theme=dark; cart=%5B1%2C2%5D; token=abc=123';\nconsole.log(parseCookies(incoming));\nconsole.log(buildSetCookie('refreshToken', 'r-9f8e7d', {\n  maxAge: 7 * 24 * 60 * 60, httpOnly: true, secure: true, sameSite: 'Strict',\n}));",
      playground: { html: '<h3>Cookie parser demo (see console)</h3>', js: "// Parse a Cookie request header and build a secure Set-Cookie header\nfunction parseCookies(header) {\n  return header.split(';').reduce((acc, pair) => {\n    const [key, ...rest] = pair.trim().split('=');\n    if (key) acc[key] = decodeURIComponent(rest.join('='));\n    return acc;\n  }, {});\n}\n\nfunction buildSetCookie(name, value, opts = {}) {\n  const parts = [name + '=' + encodeURIComponent(value)];\n  if (opts.maxAge) parts.push('Max-Age=' + opts.maxAge);\n  parts.push('Path=' + (opts.path || '/'));\n  if (opts.httpOnly) parts.push('HttpOnly');\n  if (opts.secure) parts.push('Secure');\n  if (opts.sameSite) parts.push('SameSite=' + opts.sameSite);\n  return parts.join('; ');\n}\n\nconst incoming = 'theme=dark; cart=%5B1%2C2%5D; token=abc=123';\nconsole.log(parseCookies(incoming));\nconsole.log(buildSetCookie('refreshToken', 'r-9f8e7d', {\n  maxAge: 7 * 24 * 60 * 60, httpOnly: true, secure: true, sameSite: 'Strict',\n}));" },
      result: `{ theme: 'dark', cart: '[1,2]', token: 'abc=123' }
refreshToken=r-9f8e7d; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Strict`,
      explanation: 'Notice `token=abc=123`: using `split("=")` naively would cut the value; `[key, ...rest]` and `rest.join("=")` keeps it. The Set-Cookie string is exactly what `res.cookie("refreshToken", value, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 7*24*60*60*1000 })` produces in Express (Express takes maxAge in milliseconds, the header uses seconds).',
    },
    {
      title: 'Predict CORS preflight for different requests',
      scenario: 'React runs on http://localhost:5173, Express on http://localhost:5000. Which requests trigger a preflight OPTIONS call? (A favourite follow-up after "what is CORS?")',
      steps: ['Compare origins with new URL(url).origin', 'Check if the method is GET/HEAD/POST', 'Check every header is CORS-safelisted and Content-Type is a simple type', 'Run and compare with your guesses'],
      code: "// Is this cross-origin request \"simple\", or will the browser send a preflight OPTIONS?\nconst SIMPLE_METHODS = ['GET', 'HEAD', 'POST'];\nconst SIMPLE_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];\nconst SAFE_HEADERS = ['accept', 'accept-language', 'content-language', 'content-type'];\n\nfunction needsPreflight(pageOrigin, url, { method = 'GET', headers = {} } = {}) {\n  if (new URL(url).origin === pageOrigin) return 'same-origin: CORS not involved';\n  if (!SIMPLE_METHODS.includes(method.toUpperCase())) return 'PREFLIGHT (method ' + method + ')';\n  for (const [name, value] of Object.entries(headers)) {\n    const n = name.toLowerCase();\n    if (!SAFE_HEADERS.includes(n)) return 'PREFLIGHT (custom header ' + name + ')';\n    if (n === 'content-type' && !SIMPLE_TYPES.includes(value.split(';')[0])) {\n      return 'PREFLIGHT (content-type ' + value + ')';\n    }\n  }\n  return 'simple request (no preflight)';\n}\n\nconst page = 'http://localhost:5173';\nconsole.log(needsPreflight(page, 'http://localhost:5173/api/users'));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users'));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' } }));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users', { headers: { Authorization: 'Bearer x' } }));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users/7', { method: 'DELETE' }));",
      playground: { html: '<h3>CORS preflight predictor (see console)</h3>', js: "// Is this cross-origin request \"simple\", or will the browser send a preflight OPTIONS?\nconst SIMPLE_METHODS = ['GET', 'HEAD', 'POST'];\nconst SIMPLE_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];\nconst SAFE_HEADERS = ['accept', 'accept-language', 'content-language', 'content-type'];\n\nfunction needsPreflight(pageOrigin, url, { method = 'GET', headers = {} } = {}) {\n  if (new URL(url).origin === pageOrigin) return 'same-origin: CORS not involved';\n  if (!SIMPLE_METHODS.includes(method.toUpperCase())) return 'PREFLIGHT (method ' + method + ')';\n  for (const [name, value] of Object.entries(headers)) {\n    const n = name.toLowerCase();\n    if (!SAFE_HEADERS.includes(n)) return 'PREFLIGHT (custom header ' + name + ')';\n    if (n === 'content-type' && !SIMPLE_TYPES.includes(value.split(';')[0])) {\n      return 'PREFLIGHT (content-type ' + value + ')';\n    }\n  }\n  return 'simple request (no preflight)';\n}\n\nconst page = 'http://localhost:5173';\nconsole.log(needsPreflight(page, 'http://localhost:5173/api/users'));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users'));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' } }));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users', { headers: { Authorization: 'Bearer x' } }));\nconsole.log(needsPreflight(page, 'http://localhost:5000/api/users/7', { method: 'DELETE' }));" },
      result: `same-origin: CORS not involved
simple request (no preflight)
PREFLIGHT (content-type application/json)
PREFLIGHT (custom header Authorization)
PREFLIGHT (method DELETE)`,
      explanation: 'A different PORT means a different origin. A JSON POST is NOT a simple request because `application/json` is not one of the three simple content types, so almost every real MERN API call is preflighted. The Authorization header also forces a preflight. That is why the `cors()` middleware must answer OPTIONS requests and list `Authorization` in allowed headers. (This is a simplified version of the full Fetch spec rules.)',
    },
    {
      title: 'Choose the right status code',
      scenario: 'Interviewers often give situations and ask for the status code. Build a lookup and print the class of each code.',
      steps: ['Create a map of situation → status code', 'Derive the class from the first digit', 'Print a neat table with padEnd'],
      code: "// Pick the right HTTP status code for common API situations\nfunction statusFor(situation) {\n  const map = {\n    'list fetched': 200,\n    'user created': 201,\n    'job accepted for background processing': 202,\n    'user deleted, nothing to return': 204,\n    'missing required field': 400,\n    'no / invalid token': 401,\n    'logged in but not admin': 403,\n    'product id does not exist': 404,\n    'email already registered': 409,\n    'validation failed on fields': 422,\n    'too many login attempts': 429,\n    'unhandled exception in server': 500,\n    'upstream payment API down': 502,\n    'server under maintenance': 503,\n  };\n  return map[situation] ?? 'unknown';\n}\n\nconst classes = { 2: 'Success', 3: 'Redirect', 4: 'Client error', 5: 'Server error' };\nfor (const s of ['user created', 'user deleted, nothing to return', 'no / invalid token',\n  'logged in but not admin', 'email already registered', 'too many login attempts', 'upstream payment API down']) {\n  const code = statusFor(s);\n  console.log(String(code).padEnd(4), classes[String(code)[0]].padEnd(13), s);\n}",
      playground: { html: '<h3>Status code cheat sheet (see console)</h3>', js: "// Pick the right HTTP status code for common API situations\nfunction statusFor(situation) {\n  const map = {\n    'list fetched': 200,\n    'user created': 201,\n    'job accepted for background processing': 202,\n    'user deleted, nothing to return': 204,\n    'missing required field': 400,\n    'no / invalid token': 401,\n    'logged in but not admin': 403,\n    'product id does not exist': 404,\n    'email already registered': 409,\n    'validation failed on fields': 422,\n    'too many login attempts': 429,\n    'unhandled exception in server': 500,\n    'upstream payment API down': 502,\n    'server under maintenance': 503,\n  };\n  return map[situation] ?? 'unknown';\n}\n\nconst classes = { 2: 'Success', 3: 'Redirect', 4: 'Client error', 5: 'Server error' };\nfor (const s of ['user created', 'user deleted, nothing to return', 'no / invalid token',\n  'logged in but not admin', 'email already registered', 'too many login attempts', 'upstream payment API down']) {\n  const code = statusFor(s);\n  console.log(String(code).padEnd(4), classes[String(code)[0]].padEnd(13), s);\n}" },
      result: `201  Success       user created
204  Success       user deleted, nothing to return
401  Client error  no / invalid token
403  Client error  logged in but not admin
409  Client error  email already registered
429  Client error  too many login attempts
502  Server error  upstream payment API down`,
      explanation: 'Remember the pairs interviewers love: 401 vs 403 (identity vs permission), 400 vs 422 (malformed request vs semantically invalid data), 409 (conflict/duplicate), 502 vs 503 vs 504 (bad upstream response, server unavailable, upstream timeout). 204 must not have a body.',
    },
    {
      title: 'URL anatomy and query strings with URL / URLSearchParams',
      scenario: 'You are asked "what is an origin?" and "how do you build query params safely for a search API?"',
      steps: ['Create a URL object', 'Print its parts', 'Read and change search params', 'Build a query string from an object'],
      code: "// Anatomy of a URL + building query strings safely\nconst url = new URL('https://api.shop.in:8443/v1/products?category=shoes&sort=-price&page=2#reviews');\nconsole.log({\n  protocol: url.protocol, host: url.host, hostname: url.hostname, port: url.port,\n  pathname: url.pathname, search: url.search, hash: url.hash, origin: url.origin,\n});\nconsole.log('category =', url.searchParams.get('category'));\nurl.searchParams.set('page', '3');\nurl.searchParams.append('brand', 'Puma & Co');\nconsole.log(url.toString());\nconst params = new URLSearchParams({ q: 'red shoes', limit: 10 });\nconsole.log('/search?' + params);",
      playground: { html: '<h3>URL anatomy (see console)</h3>', js: "// Anatomy of a URL + building query strings safely\nconst url = new URL('https://api.shop.in:8443/v1/products?category=shoes&sort=-price&page=2#reviews');\nconsole.log({\n  protocol: url.protocol, host: url.host, hostname: url.hostname, port: url.port,\n  pathname: url.pathname, search: url.search, hash: url.hash, origin: url.origin,\n});\nconsole.log('category =', url.searchParams.get('category'));\nurl.searchParams.set('page', '3');\nurl.searchParams.append('brand', 'Puma & Co');\nconsole.log(url.toString());\nconst params = new URLSearchParams({ q: 'red shoes', limit: 10 });\nconsole.log('/search?' + params);" },
      result: `{
  protocol: 'https:',
  host: 'api.shop.in:8443',
  hostname: 'api.shop.in',
  port: '8443',
  pathname: '/v1/products',
  search: '?category=shoes&sort=-price&page=2',
  hash: '#reviews',
  origin: 'https://api.shop.in:8443'
}
category = shoes
https://api.shop.in:8443/v1/products?category=shoes&sort=-price&page=3&brand=Puma+%26+Co#reviews
/search?q=red+shoes&limit=10`,
      explanation: '`origin` is protocol + host + port – exactly what CORS and localStorage use for scoping. `URLSearchParams` encodes special characters (& becomes %26, space becomes +) so user input can never break your query string. The hash (#reviews) is never sent to the server.',
    },
  ],
  interview: [
    { q: 'What is HTTP and why is it called stateless?', level: 'Easy', a: `HTTP (HyperText Transfer Protocol) is the application-level request-response protocol of the web. The client sends a method + URL + headers + optional body; the server returns a status code + headers + body.\n\nIt is **stateless** because each request is independent: the server does not automatically remember the previous request. To keep a user "logged in" we send state with every request – a session-id cookie or a JWT in the Authorization header.\n\nWhy it matters: statelessness makes servers easy to scale horizontally (any server behind a load balancer can handle any request).` },
    { q: 'Difference between GET and POST?', level: 'Easy', a: `- **GET** reads data. Parameters go in the URL query string, it has no body, it is safe and idempotent, can be cached, bookmarked and stays in browser history. URLs have practical length limits.\n- **POST** sends data in the body to create a resource or trigger an action. Not idempotent, not cached by default, suitable for large or sensitive data (still use HTTPS – the body is not "encrypted" by POST itself).\n\nExample: \`GET /api/products?category=shoes\` vs \`POST /api/orders\` with a JSON body.` },
    { q: 'Difference between PUT and PATCH?', level: 'Easy', a: `**PUT** replaces the entire resource with the body you send (missing fields are removed/reset). It is idempotent: sending the same PUT twice gives the same result.\n\n**PATCH** applies a partial update (only the fields you send). It is not guaranteed to be idempotent (e.g. a PATCH that says "increment stock by 1").\n\nExample: \`PATCH /api/users/7 { "phone": "98xxxxxx" }\` updates only the phone. In Mongoose, PATCH usually maps to \`findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })\`.` },
    { q: 'What does idempotent mean? Which HTTP methods are idempotent?', level: 'Medium', a: `An operation is **idempotent** if doing it once or many times leaves the server in the same state. GET, HEAD, OPTIONS, PUT and DELETE are idempotent; POST is not, PATCH is not guaranteed.\n\nWhy it matters: networks retry. If a payment POST is retried you may charge twice, so APIs use an **Idempotency-Key** header – the server stores the key and returns the same result for repeats. Note: idempotent is about state, not the response – the second DELETE may return 404 but the resource is still gone.` },
    { q: 'Explain the status codes 200, 201, 204, 301, 302, 304.', level: 'Easy', a: `- **200 OK** – success with a body (GET list).\n- **201 Created** – a new resource was created (POST signup); often with a Location header.\n- **204 No Content** – success, no body (DELETE).\n- **301 Moved Permanently** – permanent redirect; browsers and search engines update the URL (http → https, old slug → new slug).\n- **302 Found** – temporary redirect (after login redirect). 307/308 are the same but keep the method and body.\n- **304 Not Modified** – the cached copy is still valid (response to a conditional request with If-None-Match/ETag or If-Modified-Since).` },
    { q: 'What is the difference between 401 and 403?', level: 'Easy', a: `**401 Unauthorized** really means *unauthenticated*: the server does not know who you are – missing, invalid or expired token. The client should log in or refresh the token.\n\n**403 Forbidden** means the server knows who you are but you are not allowed: a logged-in "student" calling \`DELETE /api/courses/5\` that needs "admin". Logging in again will not help.\n\nIn Express: an \`auth\` middleware returns 401, a \`requireRole('admin')\` middleware returns 403.` },
    { q: 'What are 400, 404, 409, 422, 429 and 500, 502, 503, 504?', level: 'Medium', a: `- **400 Bad Request** – malformed request (invalid JSON, wrong type).\n- **404 Not Found** – resource does not exist.\n- **409 Conflict** – conflicts with current state (email already registered, version conflict).\n- **422 Unprocessable Content** – syntax is fine but validation failed (password too short). Many APIs simply use 400 for this.\n- **429 Too Many Requests** – rate limit hit (send Retry-After).\n- **500 Internal Server Error** – unhandled bug on the server.\n- **502 Bad Gateway** – a proxy (Nginx) got an invalid response from the upstream (Node app crashed).\n- **503 Service Unavailable** – server overloaded or in maintenance.\n- **504 Gateway Timeout** – the upstream did not respond in time.` },
    { q: 'What is REST? What makes an API RESTful?', level: 'Easy', a: `REST is an architectural style for APIs where data is modelled as **resources** identified by URLs and manipulated with standard HTTP methods, with JSON representations.\n\nRESTful characteristics: client-server separation, **stateless** requests, cacheable responses, uniform interface (nouns in URLs, correct methods and status codes), layered system.\n\nExample: \`GET /api/v1/courses\`, \`POST /api/v1/courses\`, \`GET /api/v1/courses/12/lessons\`. Not RESTful: \`POST /api/getAllCourses\`.` },
    { q: 'How do you design pagination, filtering and sorting in a REST API?', level: 'Medium', a: `Use query parameters on the collection endpoint:\n\`GET /api/products?category=shoes&minPrice=500&sort=-price,name&page=2&limit=20&fields=name,price\`\n\nReturn metadata: \`{ data: [...], page: 2, limit: 20, total: 345, totalPages: 18 }\`.\n\nTwo strategies:\n- **Offset pagination** (\`skip = (page-1)*limit\`) – simple, allows jumping to a page, but slow on huge collections and items shift when data changes.\n- **Cursor pagination** (\`?cursor=<lastId>&limit=20\` → \`find({ _id: { $gt: cursor } })\`) – fast and stable, ideal for infinite scroll feeds.\n\nAlways cap \`limit\` on the server (e.g. max 100).` },
    { q: 'REST vs GraphQL – when would you choose each?', level: 'Medium', a: `**REST**: multiple endpoints, fixed response shape, simple HTTP caching, easy to learn – best for most CRUD apps and public APIs.\n\n**GraphQL**: one endpoint (\`POST /graphql\`), client specifies exactly the fields needed (solves over-fetching/under-fetching), strongly typed schema, great when a mobile app and web app need different data shapes or when one screen needs data from many resources.\n\nDownsides of GraphQL: caching is harder, complex queries can be expensive (need depth limits), more setup. For a fresher project, REST with Express is the normal choice.` },
    { q: 'Compare cookies, localStorage and sessionStorage.', level: 'Easy', a: `- **Cookies**: ~4 KB, sent automatically with every request to the matching domain, can expire, can be **HttpOnly** (hidden from JS), **Secure** and **SameSite**. Used for sessions/refresh tokens.\n- **localStorage**: ~5-10 MB per origin, never expires, not sent to the server, readable by any JS on the page. Used for theme, cart for guests, preferences.\n- **sessionStorage**: like localStorage but scoped to one tab and cleared when the tab closes. Used for multi-step form progress.\n\nAPI: \`localStorage.setItem('theme', 'dark')\`, \`getItem\`, \`removeItem\`, \`clear\`. Values are strings, so use \`JSON.stringify\`/\`JSON.parse\` for objects.` },
    { q: 'Where should you store a JWT in a React app? localStorage or cookie?', level: 'Hard', a: `Trade-off answer:\n- **localStorage**: simple, works across tabs, but any XSS (malicious script, compromised npm package) can read and steal the token.\n- **HttpOnly cookie**: JS cannot read it, so XSS cannot steal it, but the browser sends it automatically, so you must protect against **CSRF** (\`SameSite=Lax/Strict\`, CSRF token for state-changing requests).\n\nRecommended pattern: short-lived **access token in memory** (React context) + long-lived **refresh token in an HttpOnly, Secure, SameSite=Strict cookie** limited to \`/api/auth/refresh\`. On page reload the app calls refresh to get a new access token. Also keep a Content-Security-Policy and never use \`dangerouslySetInnerHTML\` with user input.` },
    { q: 'What are the HttpOnly, Secure and SameSite cookie attributes?', level: 'Medium', a: `- **HttpOnly** – cookie is not accessible from \`document.cookie\`; protects it from XSS theft.\n- **Secure** – only sent over HTTPS.\n- **SameSite** – controls whether the cookie is sent on cross-site requests:\n  - \`Strict\`: never on cross-site requests (most secure, but a link from Gmail to your site arrives "logged out").\n  - \`Lax\` (browser default): sent on top-level GET navigations, not on cross-site POST/fetch/iframes. Good CSRF protection.\n  - \`None\`: always sent; requires \`Secure\`. Needed when frontend and API are on different sites.\n\nExpress: \`res.cookie('rt', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7*864e5 })\`.` },
    { q: 'What is CORS? How do you fix "blocked by CORS policy" in a MERN app?', level: 'Medium', a: `The **Same-Origin Policy** stops JS on one origin (protocol+host+port) from reading responses from another origin. **CORS** lets the server opt in by sending headers like \`Access-Control-Allow-Origin\`.\n\nIn MERN, React (localhost:5173) and Express (localhost:5000) are different origins. Fix on the **server**:\n\`\`\`js\nimport cors from 'cors';\napp.use(cors({ origin: ['http://localhost:5173', 'https://myapp.com'], credentials: true }));\n\`\`\`\nFor cookies also use \`fetch(url, { credentials: 'include' })\` (axios: \`withCredentials: true\`) and do not use \`*\` as origin. Alternative in development: Vite \`server.proxy\` so the browser sees one origin. CORS errors cannot be fixed from the frontend code alone, and CORS does not apply to Postman/curl.` },
    { q: 'What is a preflight request?', level: 'Medium', a: `Before a "non-simple" cross-origin request, the browser automatically sends an **OPTIONS** request asking the server whether the real request is allowed. It includes \`Access-Control-Request-Method\` and \`Access-Control-Request-Headers\`.\n\nA request is non-simple if it uses methods other than GET/HEAD/POST, uses \`Content-Type: application/json\` (or any type other than form-urlencoded, multipart/form-data, text/plain), or adds custom headers like \`Authorization\`.\n\nThe server must reply 204/200 with Allow-Origin/Methods/Headers; \`Access-Control-Max-Age\` lets the browser cache the preflight result to reduce extra calls.` },
    { q: 'What is a JWT? Explain its structure.', level: 'Easy', a: `A **JSON Web Token** is a compact, URL-safe token used to carry claims between client and server, mostly for stateless authentication.\n\nStructure: \`xxxxx.yyyyy.zzzzz\` = **header** (alg, typ) . **payload** (claims: sub, role, iat, exp) . **signature**.\nEach of the first two parts is Base64URL-encoded JSON. The signature = HMAC-SHA256(header + "." + payload, secret) (or RSA/ECDSA with a private key for RS256/ES256).\n\n\`\`\`js\nconst token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });\nconst payload = jwt.verify(token, process.env.JWT_SECRET); // throws if tampered/expired\n\`\`\`\nThe payload is readable by anyone – it is signed, not encrypted.` },
    { q: 'How do refresh tokens work? Why not just give a JWT that lasts 30 days?', level: 'Hard', a: `A long-lived access token is dangerous: if stolen, the attacker can use it for 30 days and you cannot easily revoke it because JWTs are stateless.\n\nSo we use two tokens:\n1. **Access token** – short (5-15 min), sent with each API call.\n2. **Refresh token** – long (7-30 days), stored in an HttpOnly cookie and saved (hashed) in the DB.\n\nWhen the API returns 401 (expired), an axios interceptor calls \`POST /auth/refresh\`; the server verifies the refresh token against the DB, issues a new access token and **rotates** the refresh token (old one invalidated). If an old refresh token is reused, that indicates theft → revoke all sessions. Logout deletes the refresh token from DB and clears the cookie.` },
    { q: 'Session-based authentication vs token-based (JWT) authentication?', level: 'Medium', a: `**Session**: after login the server creates a session record (memory/Redis/Mongo via express-session) and sends a session-id cookie. Each request looks up the session. Pros: easy revoke/logout, small cookie. Cons: server state; with many servers you need a shared store (Redis).\n\n**JWT**: server signs a token with user info; it verifies the signature on each request without a DB lookup. Pros: stateless, works across services and mobile apps. Cons: hard to revoke before expiry, larger, payload visible.\n\nMany real apps mix both: JWT access tokens + server-stored refresh tokens.` },
    { q: 'What are XSS and CSRF? How do you prevent them?', level: 'Hard', a: `**XSS (Cross-Site Scripting)**: an attacker injects script into your page (e.g. a comment containing \`<script>\`) that runs in other users\' browsers and can steal tokens from localStorage. Prevention: React escapes JSX output by default; avoid \`dangerouslySetInnerHTML\` (or sanitise with DOMPurify), validate input, set a Content-Security-Policy (helmet), use HttpOnly cookies.\n\n**CSRF (Cross-Site Request Forgery)**: a malicious site makes the victim\'s browser send a request to your site, and the browser attaches cookies automatically. Prevention: \`SameSite=Lax/Strict\` cookies, CSRF tokens for state-changing requests, check Origin header, never change data on GET. Token-in-header (Bearer) auth is not vulnerable to CSRF because the browser does not attach it automatically.` },
    { q: 'What happens when you type a URL in the browser and press Enter?', level: 'Medium', a: `1. URL parsing; browser checks cache/HSTS.\n2. **DNS resolution**: browser cache → OS → resolver → root → TLD (.com) → authoritative server → IP address.\n3. **TCP 3-way handshake** (SYN, SYN-ACK, ACK) and **TLS handshake** for HTTPS (certificate check, key exchange). HTTP/3 uses QUIC over UDP.\n4. **HTTP request** sent; it may hit a CDN, load balancer, Nginx, then the Node/Express server, which may query MongoDB.\n5. **Response** HTML arrives (status, headers, body).\n6. **Rendering**: parse HTML → DOM, CSS → CSSOM, render tree → layout → paint → composite. Scripts/CSS/images are fetched as discovered; JS runs and may fetch more data (React app calls APIs).\n\nTip: adapt the depth to the role – for MERN, mention the React bundle loading and API calls.` },
    { q: 'Explain the critical rendering path. What are reflow and repaint?', level: 'Medium', a: `The **critical rendering path** is the sequence the browser follows to draw the first pixels: HTML → DOM, CSS → CSSOM, DOM + CSSOM → render tree, **layout** (compute geometry), **paint** (fill pixels), **composite** (combine layers on GPU).\n\nCSS is render-blocking; synchronous scripts are parser-blocking.\n\n**Reflow (layout)**: recalculating positions/sizes – triggered by changing width, height, font-size, adding/removing elements, reading \`offsetHeight\` after a write. Expensive.\n**Repaint**: redrawing pixels without changing layout – colour, background, visibility.\nAnimate with \`transform\` and \`opacity\` (compositor only) and batch DOM reads/writes to avoid layout thrashing.` },
    { q: 'Difference between script, script async and script defer?', level: 'Easy', a: `- \`<script src>\` (no attribute): HTML parsing **stops** while the script downloads and executes.\n- \`async\`: downloads in parallel, executes **as soon as it is ready** (pausing parsing), order not guaranteed. Good for independent scripts like analytics.\n- \`defer\`: downloads in parallel, executes **after HTML parsing finishes**, in document order, before DOMContentLoaded. Good for app scripts.\n- \`type="module"\` scripts are deferred by default (Vite builds use this).` },
    { q: 'What are semantic HTML elements and why do they matter?', level: 'Easy', a: `Semantic elements describe the **meaning** of content: \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<aside>\`, \`<footer>\`, \`<button>\`, \`<form>\`, \`<label>\`.\n\nWhy: **accessibility** (screen readers navigate by landmarks, \`<button>\` is keyboard-focusable while a clickable \`<div>\` is not), **SEO** (search engines understand structure), and readable code. In React, prefer \`<button onClick>\` over \`<div onClick>\`, and use \`<label htmlFor>\` with inputs.` },
    { q: 'Explain the CSS box model and box-sizing.', level: 'Easy', a: `Every element is a box: **content** → **padding** → **border** → **margin**.\n\nWith the default \`box-sizing: content-box\`, \`width\` applies only to the content, so \`width: 200px; padding: 20px; border: 5px\` renders 250px wide.\nWith \`box-sizing: border-box\`, width includes padding and border, so it stays 200px – easier layouts, which is why most resets use \`*, *::before, *::after { box-sizing: border-box; }\`.\n\nAlso know: vertical margins of adjacent block elements **collapse** (the larger one wins).` },
    { q: 'How is CSS specificity calculated?', level: 'Medium', a: `Specificity decides which rule wins when several rules target the same element. Think of it as (inline, ids, classes, elements):\n- inline style → 1,0,0,0\n- \`#id\` → 0,1,0,0\n- \`.class\`, \`[attr]\`, \`:hover\` → 0,0,1,0\n- \`div\`, \`::before\` → 0,0,0,1\n\nExample: \`#nav .link\` (0,1,1,0) beats \`.nav .link.active\` (0,0,3,0). If equal, the **later** rule wins. \`!important\` overrides normal declarations (avoid it). \`:where()\` has zero specificity; \`:is()\`/\`:not()\` take the specificity of their most specific argument.` },
    { q: 'Flexbox vs Grid – when to use which?', level: 'Easy', a: `**Flexbox** is one-dimensional (a row OR a column): navbars, aligning items in a card, centering. Key props: \`display:flex; justify-content; align-items; flex-wrap; gap; flex: 1\`.\n\n**Grid** is two-dimensional (rows AND columns): page layouts, dashboards, image galleries. Key props: \`display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap; grid-area\`.\n\nThey work together: Grid for the page skeleton, Flexbox inside each component. Centering a div: \`display:grid; place-items:center\` or \`display:flex; justify-content:center; align-items:center\`.` },
    { q: 'Explain CSS position values: static, relative, absolute, fixed, sticky.', level: 'Medium', a: `- **static** (default) – normal flow; top/left ignored.\n- **relative** – stays in flow, offset from its normal position; also becomes the reference for absolute children.\n- **absolute** – removed from flow, positioned relative to the nearest **positioned** ancestor (non-static), else the initial containing block.\n- **fixed** – removed from flow, relative to the viewport; stays on scroll (sticky headers, chat buttons). A transformed ancestor breaks this.\n- **sticky** – acts relative until a scroll threshold (\`top: 0\`) is reached, then sticks within its parent.\n\n\`z-index\` works only on positioned elements (and flex/grid items) and is scoped to its stacking context.` },
    { q: 'What is the difference between display:none, visibility:hidden and opacity:0?', level: 'Easy', a: `- \`display: none\` – element removed from layout, takes no space, not read by screen readers, no events.\n- \`visibility: hidden\` – invisible but **keeps its space**; no events; hidden from screen readers.\n- \`opacity: 0\` – invisible but keeps space and **still receives clicks** and is still in the accessibility tree.\n\nIn React, conditional rendering (\`{show && <Modal/>}\`) is like display:none but also unmounts the component and resets its state.` },
    { q: 'What are CDN, caching headers (Cache-Control, ETag) and how do they speed up a site?', level: 'Hard', a: `A **CDN** (Cloudflare, CloudFront) stores copies of static files (JS bundles, images) on servers close to users, reducing latency.\n\n**Cache-Control** tells browsers/CDNs how long to cache: \`public, max-age=31536000, immutable\` for hashed Vite files like \`index-a1b2c3.js\`; \`no-cache\` (revalidate every time) for \`index.html\`; \`no-store\` for sensitive API data.\n\n**ETag** is a fingerprint of the response. The browser sends \`If-None-Match: <etag>\`; if unchanged the server returns **304 Not Modified** without a body. Express sends ETags automatically for \`res.send\`.\n\nResult: fewer bytes, faster repeat visits, less load on the Node server.` },
  ],
  practice: [
    {
      task: 'Write a function `isSameOrigin(a, b)` that returns true if two URLs have the same origin. Test with http vs https, different ports and different paths.',
      hint: 'Use new URL(x).origin.',
      solution: `function isSameOrigin(a, b) {
  return new URL(a).origin === new URL(b).origin;
}
console.log(isSameOrigin('http://localhost:5173/a', 'http://localhost:5173/b/c')); // true
console.log(isSameOrigin('http://localhost:5173', 'http://localhost:5000'));       // false (port)
console.log(isSameOrigin('http://site.com', 'https://site.com'));                 // false (protocol)
console.log(isSameOrigin('https://site.com', 'https://api.site.com'));            // false (host)`,
    },
    {
      task: 'Write `isTokenExpired(token)` that decodes a JWT payload (Base64URL) and returns true if `exp` is in the past. Handle malformed tokens by returning true.',
      hint: 'Split on ".", take index 1, replace - and _, pad with =, atob, JSON.parse. exp is in SECONDS, Date.now() is in milliseconds.',
      solution: `function isTokenExpired(token) {
  try {
    let part = token.split('.')[1];
    part = part.replace(/-/g, '+').replace(/_/g, '/');
    while (part.length % 4) part += '=';
    const { exp } = JSON.parse(atob(part));
    if (typeof exp !== 'number') return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
// Usage in React before calling the API:
// if (isTokenExpired(accessToken)) await refreshToken();
// Remember: this only helps the UI. The server must still verify the signature.`,
    },
    {
      task: 'Write an Express CORS setup (without the cors package) that allows only http://localhost:5173 and https://myapp.com, supports cookies, and answers preflight requests.',
      hint: 'Check req.headers.origin against an allow-list; set headers; if method is OPTIONS return 204.',
      solution: `const ALLOWED = ['http://localhost:5173', 'https://myapp.com'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin); // never "*" with credentials
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Same thing with the package:
// app.use(cors({ origin: ALLOWED, credentials: true }));`,
    },
    {
      task: 'Design REST endpoints (method, URL, success status) for a "Course" app: list courses with search and pagination, get one, create, update price, delete, list lessons of a course, enrol the current user in a course.',
      hint: 'Use plural nouns, nesting for relationships, and think about which status code each returns.',
      solution: `GET    /api/v1/courses?search=react&page=1&limit=10   -> 200 { data, page, total }
GET    /api/v1/courses/:courseId                      -> 200 | 404
POST   /api/v1/courses                                -> 201 (+ Location: /api/v1/courses/:id) | 400/422
PATCH  /api/v1/courses/:courseId   { price: 499 }     -> 200 updated course | 404
DELETE /api/v1/courses/:courseId                      -> 204 | 404 | 403 (not admin)
GET    /api/v1/courses/:courseId/lessons              -> 200
POST   /api/v1/courses/:courseId/enrollments          -> 201 | 409 (already enrolled) | 401
GET    /api/v1/users/me/enrollments                   -> 200 (my courses)

Notes: enrolment is modelled as creating an "enrollment" resource instead of a verb URL like /enrollCourse.`,
    },
    {
      task: 'Create a small HTML + CSS card layout: a responsive grid of product cards that shows 1 column on mobile and as many 220px+ columns as fit on larger screens. Each card centres its content with flexbox.',
      hint: 'grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) needs no media query.',
      solution: `<style>
  *, *::before, *::after { box-sizing: border-box; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; padding: 16px; }
  .card { display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          gap: 8px; padding: 16px; border: 1px solid #ddd; border-radius: 12px; min-height: 180px; }
  .card button { padding: 8px 16px; border: 0; border-radius: 8px; background: #2563eb; color: #fff; cursor: pointer; }
</style>
<main class="grid">
  <article class="card"><h3>Shoes</h3><p>Rs 1,999</p><button>Add to cart</button></article>
  <article class="card"><h3>Watch</h3><p>Rs 2,499</p><button>Add to cart</button></article>
  <article class="card"><h3>Bag</h3><p>Rs 899</p><button>Add to cart</button></article>
</main>`,
    },
  ],
  quiz: [
    {
      question: 'A logged-in user with role "student" calls an admin-only endpoint. What status code should the API return?',
      options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '400 Bad Request'],
      answer: 1,
      explanation: 'The user is authenticated (we know who they are) but not authorised for this action, so 403. 401 is for missing/invalid credentials.',
    },
    {
      question: 'Which of these requests from http://localhost:5173 to http://localhost:5000 triggers a CORS preflight?',
      options: ['GET with no custom headers', 'POST with Content-Type: text/plain', 'HEAD request', 'POST with Content-Type: application/json'],
      answer: 3,
      explanation: 'application/json is not a CORS-safelisted content type, so the browser sends an OPTIONS preflight first.',
    },
    {
      question: 'Which storage option is automatically sent to the server with every matching HTTP request?',
      options: ['Cookies', 'localStorage', 'sessionStorage', 'IndexedDB'],
      answer: 0,
      explanation: 'Only cookies travel with requests automatically. Web Storage and IndexedDB stay in the browser unless your code sends them.',
    },
    {
      question: 'What is TRUE about the payload of a JWT?',
      options: ['It is encrypted with the secret key', 'It can only be read by the server', 'It is Base64URL-encoded, so anyone can decode and read it', 'It contains the hashed password by default'],
      answer: 2,
      explanation: 'A standard (JWS) JWT is signed, not encrypted. The signature prevents tampering but the payload is readable by anyone.',
    },
    {
      question: 'Which CSS change is cheapest for animations because it can avoid layout and paint?',
      options: ['Changing width', 'Changing top/left', 'Changing margin', 'Changing transform'],
      answer: 3,
      explanation: 'transform (and opacity) can be handled by the compositor without reflow or repaint, unlike width, top/left or margin which trigger layout.',
    },
  ],
};
