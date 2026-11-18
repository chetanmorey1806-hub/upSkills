export default {
  id: 'day-15-middleware-redirects-rewrites',
  title: 'Middleware, Redirects and Rewrites',
  module: 'Module 3: Full-stack Next.js',
  day: 15,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Middleware runs before a request reaches a page or API route, so it can redirect, rewrite, set headers and cookies. Learn middleware.js and the matcher, NextResponse.redirect / rewrite / next, protecting routes with Auth.js, A/B testing and i18n with rewrites, and the static redirects() / rewrites() / headers() options in next.config.js.',
  objectives: [
    'Explain where middleware runs in the request lifecycle and its runtime limits',
    'Write middleware.js with a matcher config and return NextResponse.next / redirect / rewrite',
    'Read and set cookies and headers in middleware (auth checks, A/B buckets, locale)',
    'Protect route groups with Auth.js middleware while keeping server-side checks',
    'Configure permanent/temporary redirects, rewrites and security headers in next.config.js',
  ],
  theory: [
    {
      heading: 'What is middleware and where does it run?',
      content:
        '**Middleware** is a single function in `middleware.js` at the project root (or inside `src/`). It runs **before** routing for every matching request - before the cache, before the page or Route Handler.\n\nAnalogy: middleware is the security desk at an office building entrance. Before you reach any floor (page), the desk can: let you through (`next`), send you to another building (`redirect`, the URL in the browser changes), quietly guide you to a different room while your visitor badge still says the original room (`rewrite`, URL stays the same), or stamp your badge (set headers/cookies).\n\nRequest lifecycle (simplified):\n1. `headers` from next.config.js\n2. `redirects` from next.config.js\n3. **Middleware** (rewrites, redirects, headers, cookies)\n4. `beforeFiles` rewrites, then filesystem routes (pages, public files), then `afterFiles`/`fallback` rewrites\n5. The page / Route Handler renders\n\nMiddleware historically runs on the **Edge runtime** (fast, close to the user, but limited Web APIs: no `fs`, no native Node modules, small bundle). Next.js 15.2+ added an experimental Node.js runtime for middleware; still keep it **light** - no heavy database queries. (Note: Next.js 16 renames middleware.js to proxy.js; the concepts are identical.)',
      tip: 'Middleware runs on EVERY matching request, including prefetches and images if your matcher includes them. A slow middleware slows the whole site, so always use a matcher.',
    },
    {
      heading: 'Writing middleware: NextResponse and the matcher',
      content:
        'Middleware receives a `NextRequest` (a Web Request with extras: `request.nextUrl` - a parsed URL you can clone and modify, and `request.cookies`). It returns:\n- `NextResponse.next()` - continue as normal (optionally with modified headers)\n- `NextResponse.redirect(new URL(\'/login\', request.url))` - 307 redirect (pass `308` for permanent)\n- `NextResponse.rewrite(new URL(\'/maintenance\', request.url))` - serve another route, URL unchanged\n- `Response.json({ error }, { status: 401 })` - respond directly (e.g. for APIs)\n\nThe **matcher** in `export const config` decides which paths run the middleware. It supports path patterns (`/dashboard/:path*`) and regex. A common matcher excludes static files and images.',
      syntax:
        "// middleware.js\nimport { NextResponse } from 'next/server';\n\nexport function middleware(request) {\n  const { pathname } = request.nextUrl;\n  if (pathname === '/old-blog') {\n    return NextResponse.redirect(new URL('/blog', request.url));\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  // run on everything except API, Next internals and files with an extension\n  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\\\..*).*)'],\n};",
      points: [
        'Only ONE middleware.js per project - branch inside it for different paths',
        'Matcher values must be constants (statically analyzable)',
        ':path* matches zero or more segments, :path+ one or more',
      ],
    },
    {
      heading: 'Redirect vs rewrite',
      content:
        '- **Redirect**: the server answers with 307/308 (or 301/302) and a `Location` header. The browser makes a **new request** and the **address bar changes**. Use when content moved, for login redirects, http to https, old URLs to new.\n- **Rewrite**: the server internally serves a different path. The **address bar stays the same**. Use for A/B testing, multi-tenant subdomains (`acme.app.com` → `/sites/acme`), proxying to another backend, localized content, maintenance pages.\n\nStatus codes: **307/308** keep the HTTP method and body (POST stays POST); 301/302 may change POST to GET in browsers. Next.js uses 307 (temporary) and 308 (permanent) by default.\n\nSEO: permanent redirects (308) pass ranking to the new URL; use them when a URL moved for good.',
    },
    {
      heading: 'Cookies and headers in middleware; auth protection',
      content:
        'Read: `request.cookies.get(\'theme\')?.value`, `request.headers.get(\'accept-language\')`.\nWrite on the response: `const res = NextResponse.next(); res.cookies.set(\'bucket\', \'b\', { maxAge: 60 * 60 * 24 * 30 }); res.headers.set(\'x-bucket\', \'b\'); return res;`\n\nTo pass data to Server Components, set **request** headers: `NextResponse.next({ request: { headers: newHeaders } })`, then read with `headers()` from `next/headers`.\n\n**Auth.js middleware**: export `auth` as middleware and use `req.auth` (the session) to decide. With the JWT strategy, the session is decoded from the cookie without a DB call - fast enough for middleware. Middleware gives quick redirects for whole sections, but you must **still check** in pages and actions (defense in depth). In 2025 a vulnerability (CVE-2025-29927) let attackers skip middleware via a crafted header in self-hosted older versions - a real example of why middleware must not be the only check.',
      syntax:
        "// middleware.js with Auth.js v5\nimport { auth } from '@/auth';\nimport { NextResponse } from 'next/server';\n\nexport default auth((req) => {\n  const isLoggedIn = !!req.auth;\n  const { pathname } = req.nextUrl;\n  if (pathname.startsWith('/dashboard') && !isLoggedIn) {\n    const url = new URL('/login', req.url);\n    url.searchParams.set('callbackUrl', pathname);\n    return NextResponse.redirect(url);\n  }\n  if (pathname.startsWith('/admin') && req.auth?.user?.role !== 'admin') {\n    return NextResponse.rewrite(new URL('/403', req.url));\n  }\n});\n\nexport const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };",
    },
    {
      heading: 'Static redirects, rewrites and headers in next.config.js',
      content:
        'For rules that **do not depend on cookies or logic**, use `next.config.js` - faster and simpler than middleware:\n- `async redirects()` → array of `{ source, destination, permanent }` (permanent: true = 308)\n- `async rewrites()` → array of `{ source, destination }` (can point to external URLs = proxy, e.g. avoid CORS to a legacy API)\n- `async headers()` → array of `{ source, headers: [{ key, value }] }` - great for security headers (X-Frame-Options, Content-Security-Policy, Referrer-Policy)\n\nYou can also use `has` / `missing` conditions on headers, cookies, query or host.\n\nFor thousands of redirects (e.g. an old CMS migration), store them in a JSON/edge config and look them up in middleware instead of a giant config file.\n\nInside Server Components and Server Actions, use `redirect()` / `permanentRedirect()` from `next/navigation`; in Client Components use `useRouter().push()`.',
      syntax:
        "// next.config.js\nmodule.exports = {\n  async redirects() {\n    return [\n      { source: '/docs/v1/:slug', destination: '/docs/:slug', permanent: true },\n      { source: '/twitter', destination: 'https://x.com/ourbrand', permanent: false },\n    ];\n  },\n  async rewrites() {\n    return [\n      { source: '/api/legacy/:path*', destination: 'https://legacy.example.com/:path*' },\n    ];\n  },\n  async headers() {\n    return [\n      {\n        source: '/(.*)',\n        headers: [\n          { key: 'X-Frame-Options', value: 'DENY' },\n          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n        ],\n      },\n    ];\n  },\n};",
      tip: 'Coming next (Day 16): fetching and caching data on the client with SWR and TanStack Query.',
    },
  ],
  examples: [
    {
      title: 'Auth guard middleware with callbackUrl',
      scenario: 'Visitors without a session cookie who open /dashboard/* must be redirected to /login?callbackUrl=<original path>; logged-in users visiting /login go to /dashboard.',
      steps: [
        'Create middleware.js at the project root',
        'Read the session cookie (or req.auth with Auth.js)',
        'Redirect unauthenticated /dashboard requests to /login with callbackUrl',
        'Redirect authenticated /login requests to /dashboard',
        'Restrict execution with matcher: ["/dashboard/:path*", "/login"]',
        'In the playground SIMULATION type URLs and toggle the cookie to see the middleware decision',
      ],
      code:
        "// middleware.js (cookie-based example, works without Auth.js too)\nimport { NextResponse } from 'next/server';\n\nexport function middleware(request) {\n  const { pathname, search } = request.nextUrl;\n  const hasSession = request.cookies.has('authjs.session-token');\n\n  if (pathname.startsWith('/dashboard') && !hasSession) {\n    const loginUrl = new URL('/login', request.url);\n    loginUrl.searchParams.set('callbackUrl', pathname + search);\n    return NextResponse.redirect(loginUrl);\n  }\n\n  if (pathname === '/login' && hasSession) {\n    return NextResponse.redirect(new URL('/dashboard', request.url));\n  }\n\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ['/dashboard/:path*', '/login'],\n};",
      playground: {
        jsx: "// SIMULATION: a plain JS function with the same logic as middleware.js.\n// It returns { type: 'next' | 'redirect', url } instead of a real NextResponse.\nconst matcher = [/^\\/dashboard(\\/.*)?$/, /^\\/login$/];\n\nfunction middleware(urlString, cookies) {\n  const url = new URL(urlString, 'https://app.example.com');\n  const { pathname, search } = url;\n  if (!matcher.some((re) => re.test(pathname))) return { type: 'skipped (matcher)' };\n  const hasSession = 'authjs.session-token' in cookies;\n  if (pathname.startsWith('/dashboard') && !hasSession) {\n    const login = new URL('/login', url);\n    login.searchParams.set('callbackUrl', pathname + search);\n    return { type: 'redirect 307', url: login.pathname + login.search };\n  }\n  if (pathname === '/login' && hasSession) return { type: 'redirect 307', url: '/dashboard' };\n  return { type: 'next' };\n}\n\nfunction App() {\n  const [path, setPath] = React.useState('/dashboard/orders?page=2');\n  const [loggedIn, setLoggedIn] = React.useState(false);\n  const cookies = loggedIn ? { 'authjs.session-token': 'abc' } : {};\n  const res = middleware(path, cookies);\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <input value={path} onChange={(e) => setPath(e.target.value)} style={{ width: 260 }} />\n      <label style={{ marginLeft: 8 }}><input type=\"checkbox\" checked={loggedIn} onChange={(e) => setLoggedIn(e.target.checked)} /> session cookie</label>\n      <p>Middleware result: <b>{res.type}</b> {res.url && <code>{'-> ' + res.url}</code>}</p>\n      <p style={{ fontSize: 12 }}>Try: /dashboard, /login, /about, /dashboard/settings</p>\n    </div>\n  );\n}",
      },
      result: 'For /dashboard/orders?page=2 without a cookie the result is "redirect 307 -> /login?callbackUrl=%2Fdashboard%2Forders%3Fpage%3D2". With the cookie it is "next". /about is "skipped (matcher)".',
      explanation:
        'request.nextUrl gives pathname and search. new URL("/login", request.url) builds an absolute URL (required by redirect). searchParams.set encodes the callback. The matcher keeps the middleware off unrelated pages. Remember the dashboard layout must still verify the session.',
    },
    {
      title: 'A/B testing with a sticky cookie and rewrite',
      scenario: 'Half of the visitors should see /home-b while the URL stays "/". A user must always get the same variant.',
      steps: [
        'Create pages app/home-a/page.js and app/home-b/page.js (or variants under app/(experiments))',
        'In middleware, read the "bucket" cookie; if missing, pick a or b randomly',
        'Rewrite "/" to "/home-" + bucket',
        'Set the cookie on the response so the user stays in the same bucket',
        'In the SIMULATION click "New visitor" several times and "Reload" to see stickiness',
      ],
      code:
        "// middleware.js\nimport { NextResponse } from 'next/server';\n\nexport function middleware(request) {\n  let bucket = request.cookies.get('bucket')?.value;\n  if (bucket !== 'a' && bucket !== 'b') {\n    bucket = Math.random() < 0.5 ? 'a' : 'b';\n  }\n  const res = NextResponse.rewrite(new URL('/home-' + bucket, request.url)); // URL stays '/'\n  res.cookies.set('bucket', bucket, { maxAge: 60 * 60 * 24 * 30, path: '/' });\n  return res;\n}\n\nexport const config = { matcher: '/' };",
      playground: {
        jsx: "// SIMULATION of rewrite + sticky cookie: the address bar stays '/', the rendered page differs.\nfunction HomeA() { return <div style={{ background: '#dbeafe', padding: 12 }}><h3>Variant A</h3><button>Buy now</button></div>; }\nfunction HomeB() { return <div style={{ background: '#dcfce7', padding: 12 }}><h3>Variant B</h3><button>Start free trial</button></div>; }\n\nfunction middleware(cookies) {\n  let bucket = cookies.bucket;\n  if (bucket !== 'a' && bucket !== 'b') bucket = Math.random() < 0.5 ? 'a' : 'b';\n  return { rewriteTo: '/home-' + bucket, setCookie: { bucket } };\n}\n\nfunction App() {\n  const [cookies, setCookies] = React.useState({});\n  const [result, setResult] = React.useState(null);\n  const [stats, setStats] = React.useState({ a: 0, b: 0 });\n  function request(jar) {\n    const r = middleware(jar);\n    const merged = { ...jar, ...r.setCookie };\n    setCookies(merged);\n    setResult(r);\n    return merged;\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <button onClick={() => { const c = request({}); setStats((s) => ({ ...s, [c.bucket]: s[c.bucket] + 1 })); }}>New visitor</button>{' '}\n      <button onClick={() => request(cookies)} disabled={!cookies.bucket}>Reload (same visitor)</button>\n      <p>Address bar: <code>https://shop.example.com/</code> | cookie bucket={cookies.bucket || '-'} | served: {result ? result.rewriteTo : '-'}</p>\n      {result && (result.rewriteTo === '/home-a' ? <HomeA /> : <HomeB />)}\n      <p style={{ fontSize: 12 }}>New visitors so far: A={stats.a} B={stats.b}</p>\n    </div>\n  );\n}",
      },
      result: 'Each "New visitor" lands randomly in A or B (roughly 50/50 over many clicks). "Reload" always shows the same variant because the cookie is reused. The address bar text never changes.',
      explanation:
        'rewrite serves another route internally, so analytics and SEO see "/" while the content differs. Setting the cookie on the response makes the choice sticky for 30 days.',
    },
    {
      title: 'Locale detection: redirect to /en or /hi',
      scenario: 'A bilingual site uses /en/... and /hi/... routes (app/[lang]/...). Requests without a locale should be redirected based on the Accept-Language header or a saved NEXT_LOCALE cookie.',
      steps: [
        'Create the app/[lang]/page.js route structure',
        'In middleware, skip paths that already start with a supported locale',
        'Pick the locale from the NEXT_LOCALE cookie, else from Accept-Language, else default "en"',
        'Redirect to "/" + locale + pathname',
        'In the SIMULATION change the Accept-Language header and path',
      ],
      code:
        "// middleware.js\nimport { NextResponse } from 'next/server';\n\nconst locales = ['en', 'hi'];\nconst defaultLocale = 'en';\n\nfunction getLocale(request) {\n  const saved = request.cookies.get('NEXT_LOCALE')?.value;\n  if (locales.includes(saved)) return saved;\n  const header = request.headers.get('accept-language') ?? '';\n  // e.g. \"hi-IN,hi;q=0.9,en;q=0.8\" -> ['hi', 'hi', 'en']\n  const preferred = header.split(',').map((part) => part.split(';')[0].trim().slice(0, 2));\n  return preferred.find((l) => locales.includes(l)) ?? defaultLocale;\n}\n\nexport function middleware(request) {\n  const { pathname } = request.nextUrl;\n  const hasLocale = locales.some((l) => pathname === '/' + l || pathname.startsWith('/' + l + '/'));\n  if (hasLocale) return NextResponse.next();\n\n  const locale = getLocale(request);\n  request.nextUrl.pathname = '/' + locale + pathname;\n  return NextResponse.redirect(request.nextUrl);\n}\n\nexport const config = {\n  matcher: ['/((?!api|_next|.*\\\\..*).*)'],\n};",
      playground: {
        jsx: "// SIMULATION of the locale middleware logic (same functions, no Next.js runtime).\nconst locales = ['en', 'hi'];\nfunction getLocale(cookies, acceptLanguage) {\n  if (locales.includes(cookies.NEXT_LOCALE)) return cookies.NEXT_LOCALE;\n  const preferred = acceptLanguage.split(',').map((p) => p.split(';')[0].trim().slice(0, 2));\n  return preferred.find((l) => locales.includes(l)) || 'en';\n}\nfunction middleware(pathname, cookies, acceptLanguage) {\n  const hasLocale = locales.some((l) => pathname === '/' + l || pathname.startsWith('/' + l + '/'));\n  if (hasLocale) return 'next() - already localized';\n  return 'redirect 307 -> /' + getLocale(cookies, acceptLanguage) + (pathname === '/' ? '' : pathname);\n}\n\nfunction App() {\n  const [path, setPath] = React.useState('/products');\n  const [lang, setLang] = React.useState('hi-IN,hi;q=0.9,en;q=0.8');\n  const [cookie, setCookie] = React.useState('');\n  return (\n    <div style={{ fontFamily: 'sans-serif', display: 'grid', gap: 6, maxWidth: 420 }}>\n      <label>Path <input value={path} onChange={(e) => setPath(e.target.value)} /></label>\n      <label>Accept-Language <input value={lang} onChange={(e) => setLang(e.target.value)} style={{ width: 240 }} /></label>\n      <label>NEXT_LOCALE cookie\n        <select value={cookie} onChange={(e) => setCookie(e.target.value)}>\n          <option value=\"\">(none)</option><option value=\"en\">en</option><option value=\"hi\">hi</option>\n        </select>\n      </label>\n      <p><b>{middleware(path, cookie ? { NEXT_LOCALE: cookie } : {}, lang)}</b></p>\n    </div>\n  );\n}",
      },
      result: 'Path /products with header "hi-IN,..." gives "redirect 307 -> /hi/products". Setting the cookie to en gives "/en/products". Path /hi/about gives "next() - already localized".',
      explanation:
        'Middleware is perfect for this because it must run before any page and depends on request headers/cookies. The cookie lets a user override the browser language with a language switcher.',
    },
    {
      title: 'Static redirects and security headers in next.config.js',
      scenario: 'The blog moved from /articles/:slug to /blog/:slug, the company Twitter link changed, and every page needs security headers.',
      steps: [
        'Open next.config.js (or next.config.mjs)',
        'Add async redirects() with a permanent rule using a :slug parameter',
        'Add async headers() for all routes',
        'Restart next dev (config changes need a restart)',
        'Check with curl -I http://localhost:3000/articles/hello : expect 308 and Location: /blog/hello',
        'In the SIMULATION test which rule matches a given path',
      ],
      code:
        "// next.config.mjs\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  async redirects() {\n    return [\n      { source: '/articles/:slug', destination: '/blog/:slug', permanent: true },   // 308\n      { source: '/twitter', destination: 'https://x.com/ourbrand', permanent: false }, // 307\n      {\n        source: '/beta/:path*',\n        missing: [{ type: 'cookie', key: 'beta_access' }],\n        destination: '/waitlist',\n        permanent: false,\n      },\n    ];\n  },\n  async headers() {\n    return [\n      {\n        source: '/:path*',\n        headers: [\n          { key: 'X-Frame-Options', value: 'DENY' },\n          { key: 'X-Content-Type-Options', value: 'nosniff' },\n          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n          { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },\n        ],\n      },\n    ];\n  },\n};\nexport default nextConfig;",
      playground: {
        jsx: "// SIMULATION: match a path against redirect rules with :param and :path* like Next.js does.\nconst rules = [\n  { source: '/articles/:slug', destination: '/blog/:slug', permanent: true },\n  { source: '/twitter', destination: 'https://x.com/ourbrand', permanent: false },\n  { source: '/beta/:path*', destination: '/waitlist', permanent: false, missingCookie: 'beta_access' },\n];\n\nfunction toRegex(source) {\n  const names = [];\n  const pattern = source.replace(/:(\\w+)(\\*)?/g, (_, name, star) => { names.push(name); return star ? '(.*)' : '([^/]+)'; });\n  return { re: new RegExp('^' + pattern + '$'), names };\n}\n\nfunction applyRedirects(path, cookies) {\n  for (const r of rules) {\n    const { re, names } = toRegex(r.source);\n    const m = path.match(re);\n    if (!m) continue;\n    if (r.missingCookie && cookies[r.missingCookie]) continue;\n    let dest = r.destination;\n    names.forEach((n, i) => { dest = dest.replace(':' + n, m[i + 1]); });\n    return (r.permanent ? '308' : '307') + ' Location: ' + dest;\n  }\n  return '200 (no redirect) + security headers';\n}\n\nfunction App() {\n  const [path, setPath] = React.useState('/articles/hello-next');\n  const [beta, setBeta] = React.useState(false);\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <input value={path} onChange={(e) => setPath(e.target.value)} />\n      <label style={{ marginLeft: 8 }}><input type=\"checkbox\" checked={beta} onChange={(e) => setBeta(e.target.checked)} /> beta_access cookie</label>\n      <p><code>{applyRedirects(path, beta ? { beta_access: '1' } : {})}</code></p>\n      <p style={{ fontSize: 12 }}>Try /twitter, /beta/new-ui, /blog/x</p>\n    </div>\n  );\n}",
      },
      result: '/articles/hello-next gives "308 Location: /blog/hello-next". /beta/new-ui gives "307 Location: /waitlist" unless the beta cookie is ticked. /blog/x gives 200.',
      explanation:
        'Config redirects are evaluated before middleware and the filesystem, are cached at the edge, and need no code. Use middleware only when the decision needs logic (auth, random buckets, lookups).',
    },
  ],
  interview: [
    { q: 'What is middleware in Next.js?', a: 'A function exported from middleware.js at the project root that runs before a request is routed/rendered. It can rewrite, redirect, modify request/response headers and cookies, or respond directly. It is commonly used for auth redirects, i18n, A/B tests and bot protection.', level: 'Easy' },
    { q: 'What is the difference between a redirect and a rewrite?', a: 'A redirect sends a 3xx response with a Location header; the browser requests the new URL and the address bar changes. A rewrite serves content from a different path or host internally; the browser URL stays the same.', level: 'Easy' },
    { q: 'What is the matcher config and why is it important?', a: 'export const config = { matcher } limits which paths invoke middleware. Without it middleware runs on every request including static assets and images, adding latency and cost. Matchers support path patterns like /dashboard/:path* and regex with negative lookahead to exclude _next/static etc.', level: 'Medium' },
    { q: 'Which runtime does middleware use and what limitations follow?', a: 'Traditionally the Edge runtime: Web APIs only (fetch, Request, Response, crypto, URL), no fs or native Node modules, limited bundle size and execution time. Next.js 15.2+ can opt into a Node.js runtime experimentally. Keep middleware light either way.', level: 'Medium' },
    { q: '307 vs 308 vs 301 vs 302?', a: '301 and 308 are permanent; 302 and 307 are temporary. 307/308 guarantee the method and body are preserved (POST stays POST); 301/302 historically allow browsers to change POST to GET. Next.js uses 307/308 for redirect() and config redirects.', level: 'Medium' },
    { q: 'Why should you not rely only on middleware for authorization?', a: 'Matchers can miss routes, Server Actions/Route Handlers are separate endpoints, and bugs like CVE-2025-29927 (bypass via the x-middleware-subrequest header) show middleware can be skipped. Always verify the session and permissions where data is read or mutated (defense in depth).', level: 'Hard' },
    { q: 'How do you pass data from middleware to a Server Component?', a: 'Clone and modify the request headers and return NextResponse.next({ request: { headers: newHeaders } }). The Server Component reads them with (await headers()).get("x-my-header"). Cookies set on the response are for the browser.', level: 'Hard' },
    { q: 'When should you use next.config.js redirects instead of middleware?', a: 'For static, rule-based redirects that do not depend on runtime logic (moved pages, vanity URLs). They are simpler, run earlier, and are cached. Use middleware when the decision depends on cookies, auth state, randomization or lookups.', level: 'Medium' },
    { q: 'How do you implement A/B testing without changing the URL?', a: 'In middleware, assign a bucket (from an existing cookie or randomly), rewrite the request to the variant route (e.g. /home-b), and set the bucket cookie on the response so the user consistently sees the same variant.', level: 'Medium' },
    { q: 'How many middleware files can a Next.js app have?', a: 'One - middleware.js (or .ts) at the root or in src/. To handle different paths, branch inside the function or compose helper functions.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write middleware that puts the whole site into maintenance mode (rewrite to /maintenance) when the env variable MAINTENANCE_MODE is "true", except for /maintenance itself and static files.',
      hint: 'process.env is available; rewrite keeps the URL.',
      solution:
        "// middleware.js\nimport { NextResponse } from 'next/server';\n\nexport function middleware(request) {\n  if (process.env.MAINTENANCE_MODE === 'true' && request.nextUrl.pathname !== '/maintenance') {\n    return NextResponse.rewrite(new URL('/maintenance', request.url));\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],\n};",
    },
    {
      task: 'Add a request ID header (x-request-id) to every page request and show it in a Server Component footer.',
      hint: 'crypto.randomUUID(); NextResponse.next({ request: { headers } }); headers() in the component.',
      solution:
        "// middleware.js\nimport { NextResponse } from 'next/server';\n\nexport function middleware(request) {\n  const requestHeaders = new Headers(request.headers);\n  const id = crypto.randomUUID();\n  requestHeaders.set('x-request-id', id);\n  const res = NextResponse.next({ request: { headers: requestHeaders } });\n  res.headers.set('x-request-id', id); // also visible to the browser\n  return res;\n}\nexport const config = { matcher: ['/((?!_next|.*\\\\..*).*)'] };\n\n// components/Footer.js (Server Component)\nimport { headers } from 'next/headers';\nexport default async function Footer() {\n  const id = (await headers()).get('x-request-id');\n  return <footer>Request ID: {id}</footer>;\n}",
    },
    {
      task: 'Protect every /api/admin/* route in middleware: respond with 401 JSON if there is no "token" cookie.',
      hint: 'Return Response.json(...) directly from middleware.',
      solution:
        "// middleware.js\nimport { NextResponse } from 'next/server';\n\nexport function middleware(request) {\n  if (!request.cookies.get('token')) {\n    return Response.json({ error: 'Unauthorized' }, { status: 401 });\n  }\n  return NextResponse.next();\n}\n\nexport const config = { matcher: '/api/admin/:path*' };\n// The route handlers must still verify the token's validity and role.",
    },
    {
      task: 'In next.config.js add: a permanent redirect from /shop/:id to /products/:id, a rewrite of /docs/:path* to https://docs.example.com/:path*, and a Cache-Control header for /fonts/:file.',
      hint: 'redirects(), rewrites(), headers() all return arrays.',
      solution:
        "module.exports = {\n  async redirects() {\n    return [{ source: '/shop/:id', destination: '/products/:id', permanent: true }];\n  },\n  async rewrites() {\n    return [{ source: '/docs/:path*', destination: 'https://docs.example.com/:path*' }];\n  },\n  async headers() {\n    return [{\n      source: '/fonts/:file',\n      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],\n    }];\n  },\n};",
    },
    {
      task: 'Rewrite subdomains to tenant folders: acme.myapp.com/about should render app/sites/[tenant]/about with tenant = acme.',
      hint: 'request.headers.get("host"); rewrite to /sites/<sub><pathname>.',
      solution:
        "// middleware.js\nimport { NextResponse } from 'next/server';\n\nconst ROOT = 'myapp.com';\n\nexport function middleware(request) {\n  const host = request.headers.get('host') ?? '';\n  const sub = host.endsWith('.' + ROOT) ? host.slice(0, -(ROOT.length + 1)) : null;\n  if (!sub || sub === 'www') return NextResponse.next();\n  const url = request.nextUrl.clone();\n  url.pathname = '/sites/' + sub + url.pathname;\n  return NextResponse.rewrite(url);   // browser still shows acme.myapp.com/about\n}\n\nexport const config = { matcher: ['/((?!api|_next|.*\\\\..*).*)'] };",
    },
  ],
  quiz: [
    { question: 'Where must middleware.js be placed?', options: ['In app/', 'In the project root (or src/)', 'In public/', 'In app/api/'], answer: 1, explanation: 'Only one middleware file at the root (or src/) is supported.' },
    { question: 'Which response keeps the browser URL unchanged while serving a different route?', options: ['NextResponse.redirect', 'NextResponse.next', 'Response.error', 'NextResponse.rewrite'], answer: 3, explanation: 'A rewrite proxies internally; the address bar does not change.' },
    { question: 'In next.config.js, permanent: true produces which status code?', options: ['308', '307', '302', '200'], answer: 0, explanation: 'Next.js uses 308 for permanent and 307 for temporary redirects.' },
    { question: 'What is the main purpose of the matcher config?', options: ['To add CSS', 'To choose the runtime', 'To limit which paths run the middleware', 'To define API routes'], answer: 2, explanation: 'The matcher filters requests so middleware runs only where needed.' },
    { question: 'Which is the BEST practice for authorization?', options: ['Check only in middleware', 'Check only in Client Components', 'Hide the button', 'Check in middleware for redirects AND verify in pages/actions/handlers'], answer: 3, explanation: 'Defense in depth: middleware is not a complete security boundary.' },
  ],
};
