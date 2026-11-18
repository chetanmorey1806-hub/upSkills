export default {
  id: 'day-14-authentication-with-authjs',
  title: 'Authentication with Auth.js (NextAuth v5): OAuth, Credentials, Sessions and Protected Routes',
  module: 'Module 3: Full-stack Next.js',
  day: 14,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Add login to a Next.js app with Auth.js (NextAuth v5). Understand authentication vs authorization, sessions (JWT vs database), configure GitHub/Google OAuth and email-password Credentials providers, read the session in Server Components, Client Components, Server Actions and Route Handlers, protect pages, and add roles with callbacks.',
  objectives: [
    'Explain authentication vs authorization, sessions, cookies and JWT vs database sessions',
    'Install and configure Auth.js v5 with an auth.js file, route handler and AUTH_SECRET',
    'Add OAuth (GitHub/Google) and Credentials (email + bcrypt password) providers',
    'Read the session with auth() on the server and useSession() on the client; sign in and out',
    'Protect pages, Server Actions and API routes, and implement role-based access with callbacks',
  ],
  theory: [
    {
      heading: 'Authentication vs authorization, sessions and cookies',
      content:
        '- **Authentication (AuthN)**: "Who are you?" - proving identity (login with password, Google, magic link).\n- **Authorization (AuthZ)**: "What are you allowed to do?" - e.g. only admins can delete products.\n\nHTTP is stateless, so after login the server gives the browser a **session cookie**. Every later request carries the cookie, and the server knows who you are.\n\nTwo session strategies:\n1. **JWT session** (Auth.js default without a database adapter): user info is stored in an **encrypted** token inside an `httpOnly` cookie. No database lookup per request; scales easily. Harder to revoke instantly.\n2. **Database session** (with an adapter like Prisma): the cookie holds only a random session ID; the session row lives in the database. Easy to revoke ("log out from all devices"), one DB read per request.\n\nAnalogy: a JWT is a festival wristband - the guard checks the band itself. A database session is a coat-check token - the guard looks up the number in the book.',
      tip: 'Cookies used for sessions should be httpOnly (JavaScript cannot read them, protects from XSS), secure (HTTPS only) and sameSite=lax (CSRF protection). Auth.js sets all of these for you.',
    },
    {
      heading: 'Auth.js v5 setup in the App Router',
      content:
        '**Auth.js** (the new name of NextAuth.js; v5 package `next-auth@beta`/`next-auth@5`) handles OAuth flows, cookies, CSRF tokens and sessions.\n\n1. `npm install next-auth@beta`\n2. `npx auth secret` - generates `AUTH_SECRET` in `.env.local` (used to encrypt cookies/JWTs; required in production)\n3. Create `auth.js` in the project root that calls `NextAuth({ providers })` and exports `{ handlers, auth, signIn, signOut }`\n4. Create `app/api/auth/[...nextauth]/route.js` that re-exports `GET` and `POST` from `handlers` - this serves `/api/auth/signin`, `/api/auth/callback/github`, `/api/auth/session` etc.\n\nEnvironment variable names follow a convention: `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are picked up automatically by the GitHub provider.\n\n**One function for everything**: `auth()` returns the session in Server Components, Server Actions, Route Handlers and middleware (Day 15).',
      syntax:
        "// auth.js (project root)\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\n\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [GitHub],          // reads AUTH_GITHUB_ID / AUTH_GITHUB_SECRET from env\n});\n\n// app/api/auth/[...nextauth]/route.js\nimport { handlers } from '@/auth';\nexport const { GET, POST } = handlers;\n\n// .env.local\n// AUTH_SECRET=generated-by-npx-auth-secret\n// AUTH_GITHUB_ID=Iv1.abc123\n// AUTH_GITHUB_SECRET=xyz789",
    },
    {
      heading: 'OAuth providers vs Credentials provider',
      content:
        '**OAuth** (GitHub, Google, Microsoft...): the user is redirected to the provider, logs in there, and comes back to `/api/auth/callback/<provider>` with a code; Auth.js exchanges it for the profile. You never handle passwords. Register an OAuth app on the provider and set the callback URL, e.g. `http://localhost:3000/api/auth/callback/github`.\n\n**Credentials**: your own email + password form. You write `authorize(credentials)` which looks up the user and checks the **bcrypt hash**. Return the user object on success or `null` on failure. Credentials only work with the **JWT** session strategy and you are responsible for password security (hashing, rate limiting, reset flows).\n\n**Adapters** (`@auth/prisma-adapter`) save users, accounts and sessions in your database - needed for database sessions and for linking OAuth accounts to your User table.',
      syntax:
        "import Credentials from 'next-auth/providers/credentials';\nimport bcrypt from 'bcryptjs';\nimport { prisma } from '@/lib/prisma';\n\nCredentials({\n  credentials: { email: {}, password: {} },\n  async authorize(credentials) {\n    const user = await prisma.user.findUnique({ where: { email: String(credentials.email) } });\n    if (!user || !user.passwordHash) return null;\n    const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);\n    return ok ? { id: String(user.id), name: user.name, email: user.email, role: user.role } : null;\n  },\n});",
    },
    {
      heading: 'Reading the session and signing in / out',
      content:
        '**Server side** (preferred): `const session = await auth()` returns `{ user: { name, email, image }, expires }` or `null`.\n\n**Client side**: wrap the app in `<SessionProvider>` (from `next-auth/react`) and use `const { data: session, status } = useSession()` where status is `"loading" | "authenticated" | "unauthenticated"`. Prefer passing the session down from a Server Component when possible.\n\n**Sign in / out**: in a Server Component, use a form with a Server Action that calls `signIn(\'github\')` or `signOut()` from `@/auth`. In Client Components, use `signIn` / `signOut` from `next-auth/react`. Pass `{ redirectTo: \'/dashboard\' }` to choose where to go afterwards.',
      syntax:
        "// components/AuthButtons.js (Server Component)\nimport { auth, signIn, signOut } from '@/auth';\n\nexport default async function AuthButtons() {\n  const session = await auth();\n  if (!session?.user) {\n    return (\n      <form action={async () => { 'use server'; await signIn('github', { redirectTo: '/dashboard' }); }}>\n        <button>Sign in with GitHub</button>\n      </form>\n    );\n  }\n  return (\n    <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>\n      <span>Hi {session.user.name}</span> <button>Sign out</button>\n    </form>\n  );\n}",
    },
    {
      heading: 'Protecting pages, actions and APIs; roles with callbacks',
      content:
        'Protect at **every layer**:\n- **Pages/layouts**: `const session = await auth(); if (!session) redirect(\'/login\')`. Putting this in `app/dashboard/layout.js` protects all dashboard pages.\n- **Server Actions**: check `auth()` at the top of every action - they are public endpoints.\n- **Route Handlers**: return `401` when there is no session, `403` when the role is wrong.\n- **Middleware** (Day 15) can redirect early for whole sections, but must not be your only check.\n\n**Callbacks** customize what goes into the token and session. To add a role:\n1. `jwt({ token, user })` - `user` exists only at sign-in; copy `user.role` into `token.role`.\n2. `session({ session, token })` - copy `token.role` to `session.user.role` so pages can read it.\n\n`pages: { signIn: \'/login\' }` replaces the default sign-in page with your own.',
      syntax:
        "export const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [GitHub, Credentials({ /* ... */ })],\n  session: { strategy: 'jwt' },\n  pages: { signIn: '/login' },\n  callbacks: {\n    jwt({ token, user }) {\n      if (user) token.role = user.role ?? 'user';   // runs at sign-in\n      return token;\n    },\n    session({ session, token }) {\n      session.user.role = token.role;\n      session.user.id = token.sub;\n      return session;\n    },\n  },\n});",
      points: [
        '401 Unauthorized = not logged in; 403 Forbidden = logged in but not allowed',
        'Hiding a button is UX, not security - always check on the server',
        'Never store plain passwords; use bcrypt/argon2 hashes',
      ],
    },
  ],
  examples: [
    {
      title: 'Protected dashboard layout with GitHub login',
      scenario: 'Anyone can see the home page, but /dashboard and its sub-pages require a logged-in user.',
      steps: [
        'Run npm install next-auth@beta and npx auth secret',
        'Create a GitHub OAuth app with callback http://localhost:3000/api/auth/callback/github and put the ID/secret in .env.local',
        'Create auth.js and app/api/auth/[...nextauth]/route.js',
        'Create app/dashboard/layout.js that calls auth() and redirects to /login when there is no session',
        'Create app/login/page.js with a "Sign in with GitHub" Server Action form',
        'In the playground SIMULATION click "Go to dashboard" while logged out, then log in',
      ],
      code:
        "// app/dashboard/layout.js\nimport { redirect } from 'next/navigation';\nimport { auth } from '@/auth';\n\nexport default async function DashboardLayout({ children }) {\n  const session = await auth();\n  if (!session?.user) redirect('/login?callbackUrl=/dashboard');\n  return (\n    <section>\n      <header>Signed in as {session.user.email}</header>\n      {children}\n    </section>\n  );\n}\n\n// app/login/page.js\nimport { signIn } from '@/auth';\n\nexport default async function LoginPage({ searchParams }) {\n  const { callbackUrl = '/dashboard' } = await searchParams;\n  return (\n    <form action={async () => {\n      'use server';\n      await signIn('github', { redirectTo: callbackUrl });\n    }}>\n      <button>Sign in with GitHub</button>\n    </form>\n  );\n}",
      playground: {
        jsx: "// SIMULATION: plain React stands in for auth() + redirect() + a session cookie.\n// 'cookie' is a variable; the guard in DashboardLayout mimics: if (!session) redirect('/login').\nfunction App() {\n  const [cookie, setCookie] = React.useState(null);      // session cookie\n  const [path, setPath] = React.useState('/');\n  const [log, setLog] = React.useState([]);\n  const auth = () => cookie;                               // like await auth()\n  const go = (p) => { setLog((l) => [...l, 'GET ' + p]); setPath(p); };\n  // the guard: runs after each navigation, like the layout calling redirect('/login')\n  React.useEffect(() => {\n    if (path === '/dashboard' && !auth()) go('/login?callbackUrl=/dashboard');\n  }, [path, cookie]);\n\n  let page;\n  if (path === '/dashboard') {\n    const session = auth();\n    if (!session) {\n      page = <p>Redirecting...</p>;\n    } else {\n      page = <div><h2>Dashboard</h2><p>Signed in as {session.user.email}</p></div>;\n    }\n  } else if (path.startsWith('/login')) {\n    page = (\n      <div>\n        <h2>Login</h2>\n        <button onClick={() => {\n          setCookie({ user: { name: 'Asha', email: 'asha@github.dev' } }); // OAuth callback sets cookie\n          setLog((l) => [...l, 'GitHub OAuth -> /api/auth/callback/github (cookie set)']);\n          go('/dashboard');\n        }}>Sign in with GitHub</button>\n      </div>\n    );\n  } else {\n    page = <h2>Home (public)</h2>;\n  }\n\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <nav style={{ display: 'flex', gap: 8 }}>\n        <button onClick={() => go('/')}>Home</button>\n        <button onClick={() => go('/dashboard')}>Go to dashboard</button>\n        {cookie && <button onClick={() => { setCookie(null); go('/'); }}>Sign out</button>}\n      </nav>\n      <p style={{ fontSize: 12 }}>URL: {path} | cookie: {cookie ? 'authjs.session-token=...' : '(none)'}</p>\n      {page}\n      <pre style={{ background: '#f3f4f6', fontSize: 12 }}>{log.join('\\n')}</pre>\n    </div>\n  );\n}",
      },
      result: 'Clicking "Go to dashboard" while logged out redirects to /login?callbackUrl=/dashboard. After "Sign in with GitHub" the dashboard shows "Signed in as asha@github.dev". Sign out removes the cookie.',
      explanation:
        'The layout runs on the server for every dashboard request, so all child pages are protected. auth() decrypts the session cookie; redirect() sends a 307 to the login page. The simulation models the cookie as state.',
    },
    {
      title: 'Email + password login with the Credentials provider and bcrypt',
      scenario: 'Users registered with email/password must log in through a custom form and see "Invalid email or password" on failure.',
      steps: [
        'Add a passwordHash and role column to the User model and npm install bcryptjs',
        'Add a Credentials provider with an authorize() that verifies the hash',
        'Create a login Server Action that calls signIn("credentials", formData) and catches AuthError',
        'Render a form with useActionState to show the error',
        'In the SIMULATION try a wrong password, then asha@example.com / secret123',
      ],
      code:
        "// auth.js\nimport NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nimport bcrypt from 'bcryptjs';\nimport { z } from 'zod';\nimport { prisma } from '@/lib/prisma';\n\nconst LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });\n\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  pages: { signIn: '/login' },\n  providers: [\n    Credentials({\n      credentials: { email: {}, password: {} },\n      async authorize(raw) {\n        const parsed = LoginSchema.safeParse(raw);\n        if (!parsed.success) return null;\n        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });\n        if (!user?.passwordHash) return null;\n        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);\n        return ok ? { id: String(user.id), name: user.name, email: user.email, role: user.role } : null;\n      },\n    }),\n  ],\n});\n\n// app/login/actions.js\n'use server';\nimport { AuthError } from 'next-auth';\nimport { signIn } from '@/auth';\n\nexport async function login(prevState, formData) {\n  try {\n    await signIn('credentials', { email: formData.get('email'), password: formData.get('password'), redirectTo: '/dashboard' });\n  } catch (error) {\n    if (error instanceof AuthError) return { error: 'Invalid email or password' };\n    throw error; // rethrow NEXT_REDIRECT so the redirect works\n  }\n}",
      playground: {
        jsx: "// SIMULATION of the Credentials authorize() flow. Real code uses bcrypt.compare on a stored hash;\n// here a toy hash function stands in for bcrypt so the demo runs in the browser.\nconst toyHash = (s) => 'h$' + Array.from(s).reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1000003, 7);\nconst usersDb = [{ id: '1', name: 'Asha', email: 'asha@example.com', role: 'admin', passwordHash: toyHash('secret123') }];\n\nasync function authorize({ email, password }) {\n  await new Promise((r) => setTimeout(r, 400));\n  const user = usersDb.find((u) => u.email === email);\n  if (!user) return null;\n  return toyHash(password) === user.passwordHash ? { id: user.id, name: user.name, email, role: user.role } : null;\n}\n\nfunction App() {\n  const [session, setSession] = React.useState(null);\n  const [error, setError] = React.useState('');\n  const [pending, setPending] = React.useState(false);\n  async function onSubmit(e) {\n    e.preventDefault();\n    const fd = new FormData(e.currentTarget);\n    setPending(true);\n    const user = await authorize({ email: fd.get('email'), password: fd.get('password') });\n    setPending(false);\n    if (!user) { setError('Invalid email or password'); return; }\n    setError('');\n    setSession({ user, expires: '30 days' });\n  }\n  if (session) return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <p>Welcome {session.user.name} (role: {session.user.role})</p>\n      <pre style={{ fontSize: 12 }}>{JSON.stringify(session, null, 2)}</pre>\n      <button onClick={() => setSession(null)}>Sign out</button>\n    </div>\n  );\n  return (\n    <form onSubmit={onSubmit} style={{ fontFamily: 'sans-serif', display: 'grid', gap: 6, maxWidth: 260 }}>\n      <input name=\"email\" defaultValue=\"asha@example.com\" />\n      <input name=\"password\" type=\"password\" placeholder=\"Password (secret123)\" />\n      <button disabled={pending}>{pending ? 'Checking...' : 'Log in'}</button>\n      {error && <p style={{ color: 'crimson' }}>{error}</p>}\n      <small>Stored hash: {usersDb[0].passwordHash} (never the real password)</small>\n    </form>\n  );\n}",
      },
      result: 'A wrong password shows "Invalid email or password". "secret123" shows the welcome message and a session JSON with name, email and role.',
      explanation:
        'authorize() returns a user object (success) or null (failure). Auth.js then creates the encrypted JWT cookie. The error message is deliberately generic so attackers cannot discover which emails exist. The AuthError catch must rethrow other errors, including the redirect.',
    },
    {
      title: 'Role-based authorization in a Server Action and a Route Handler',
      scenario: 'Only admins may delete products. Regular users get 403; anonymous users get 401.',
      steps: [
        'Add jwt and session callbacks that copy role into session.user.role',
        'Write a requireRole helper that calls auth() and throws or returns the session',
        'Use it at the top of the deleteProduct Server Action',
        'In app/api/products/[id]/route.js return 401/403 JSON responses',
        'In the SIMULATION switch between anonymous, user and admin and click Delete',
      ],
      code:
        "// lib/authz.js\nimport { auth } from '@/auth';\n\nexport async function requireRole(role) {\n  const session = await auth();\n  if (!session?.user) return { ok: false, status: 401, error: 'Not logged in' };\n  if (session.user.role !== role) return { ok: false, status: 403, error: 'Forbidden' };\n  return { ok: true, session };\n}\n\n// app/admin/products/actions.js\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { prisma } from '@/lib/prisma';\nimport { requireRole } from '@/lib/authz';\n\nexport async function deleteProduct(id) {\n  const check = await requireRole('admin');\n  if (!check.ok) return { error: check.error };\n  await prisma.product.delete({ where: { id } });\n  revalidatePath('/admin/products');\n  return { error: null };\n}\n\n// app/api/products/[id]/route.js\nimport { requireRole } from '@/lib/authz';\nimport { prisma } from '@/lib/prisma';\n\nexport async function DELETE(request, { params }) {\n  const check = await requireRole('admin');\n  if (!check.ok) return Response.json({ error: check.error }, { status: check.status });\n  const { id } = await params;\n  await prisma.product.delete({ where: { id: Number(id) } });\n  return new Response(null, { status: 204 });\n}",
      playground: {
        jsx: "// SIMULATION of requireRole + a DELETE handler returning 401 / 403 / 204.\nconst sessions = {\n  anonymous: null,\n  user: { user: { name: 'Ravi', role: 'user' } },\n  admin: { user: { name: 'Asha', role: 'admin' } },\n};\n\nfunction App() {\n  const [who, setWho] = React.useState('anonymous');\n  const [products, setProducts] = React.useState([{ id: 1, name: 'Runner' }, { id: 2, name: 'Backpack' }]);\n  const [log, setLog] = React.useState([]);\n\n  function requireRole(role) {\n    const session = sessions[who];                           // await auth()\n    if (!session) return { ok: false, status: 401, error: 'Not logged in' };\n    if (session.user.role !== role) return { ok: false, status: 403, error: 'Forbidden' };\n    return { ok: true };\n  }\n  function DELETE(id) {\n    const check = requireRole('admin');\n    if (!check.ok) return { status: check.status, body: { error: check.error } };\n    setProducts((ps) => ps.filter((p) => p.id !== id));\n    return { status: 204, body: null };\n  }\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      Acting as: {Object.keys(sessions).map((k) => (\n        <label key={k} style={{ marginRight: 8 }}><input type=\"radio\" checked={who === k} onChange={() => setWho(k)} /> {k}</label>\n      ))}\n      <ul>{products.map((p) => (\n        <li key={p.id}>{p.name} <button onClick={() => {\n          const res = DELETE(p.id);\n          setLog((l) => [...l, 'DELETE /api/products/' + p.id + ' -> ' + res.status + ' ' + (res.body ? JSON.stringify(res.body) : '')]);\n        }}>Delete</button></li>\n      ))}</ul>\n      <pre style={{ fontSize: 12, background: '#f3f4f6' }}>{log.join('\\n')}</pre>\n    </div>\n  );\n}",
      },
      result: 'As anonymous: "DELETE /api/products/1 -> 401 {"error":"Not logged in"}". As user: 403 Forbidden. As admin: 204 and the product disappears.',
      explanation:
        'The role travels from the database (authorize/adapter) into the JWT via the jwt callback and into the session via the session callback. Every mutation checks it on the server, so a user cannot bypass it by calling the endpoint directly.',
    },
  ],
  interview: [
    { q: 'What is the difference between authentication and authorization?', a: 'Authentication verifies who the user is (login). Authorization decides what an authenticated user may do (roles/permissions). 401 relates to missing authentication, 403 to failed authorization.', level: 'Easy' },
    { q: 'What is Auth.js and what changed in v5?', a: 'Auth.js (formerly NextAuth.js) is an authentication library supporting OAuth, email and credentials providers. v5 is App Router-first: a single auth.js config exports handlers, auth, signIn and signOut; auth() works everywhere on the server (components, actions, route handlers, middleware); env vars use the AUTH_ prefix; getServerSession is replaced by auth().', level: 'Medium' },
    { q: 'JWT session vs database session - pros and cons?', a: 'JWT: session data stored encrypted in the cookie, no DB lookup per request, works on edge, but hard to revoke before expiry and size-limited. Database: cookie stores only an ID, session stored in DB, easy revocation and server-side control, but costs a DB query per request and needs an adapter.', level: 'Medium' },
    { q: 'What is AUTH_SECRET used for?', a: 'It is the key used to encrypt/sign the session JWT and other tokens/cookies (CSRF, callback). It must be a long random value, kept secret, and identical across all server instances; it is required in production.', level: 'Medium' },
    { q: 'How does the OAuth login flow work?', a: 'User clicks "Sign in with GitHub" -> redirected to GitHub authorize URL with client_id, scope and state -> user approves -> GitHub redirects to /api/auth/callback/github with a code -> Auth.js exchanges the code for an access token server-to-server, fetches the profile, creates the session cookie and redirects to the app.', level: 'Hard' },
    { q: 'Why does the Credentials provider need extra care?', a: 'You handle passwords yourself: store only slow hashes (bcrypt/argon2), rate-limit login attempts, use generic error messages, provide password reset and email verification. It also only supports JWT sessions in Auth.js.', level: 'Medium' },
    { q: 'How do you add a role to the session in Auth.js?', a: 'Use callbacks: in jwt({ token, user }) copy user.role into token.role when user is present (sign-in), and in session({ session, token }) set session.user.role = token.role. Then auth() returns the role.', level: 'Hard' },
    { q: 'How do you read the session in a Client Component?', a: 'Wrap the tree in <SessionProvider> and call useSession(), which returns { data, status, update }. Alternatively (preferred) read it with auth() in a Server Component and pass needed fields as props.', level: 'Easy' },
    { q: 'Is protecting routes in middleware enough?', a: 'No. Middleware is good for fast redirects, but Server Actions and Route Handlers are separate endpoints and data can be fetched in other ways. Always check auth()/roles close to the data: in pages/layouts, every Server Action and every Route Handler.', level: 'Hard' },
    { q: 'Why should session cookies be httpOnly, secure and sameSite?', a: 'httpOnly prevents JavaScript (and XSS attacks) from reading the cookie; secure sends it only over HTTPS; sameSite=lax prevents most cross-site request forgery by not sending the cookie on cross-site POSTs.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Configure Auth.js with both GitHub and Google providers and a custom /login page that shows two buttons.',
      hint: 'providers: [GitHub, Google], pages: { signIn: "/login" }; one Server Action form per provider.',
      solution:
        "// auth.js\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\nimport Google from 'next-auth/providers/google';\n\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [GitHub, Google],      // AUTH_GITHUB_ID/SECRET, AUTH_GOOGLE_ID/SECRET\n  pages: { signIn: '/login' },\n});\n\n// app/login/page.js\nimport { signIn } from '@/auth';\n\nexport default function Login() {\n  return (\n    <main>\n      <h1>Log in</h1>\n      {['github', 'google'].map((provider) => (\n        <form key={provider} action={async () => { 'use server'; await signIn(provider, { redirectTo: '/dashboard' }); }}>\n          <button>Continue with {provider}</button>\n        </form>\n      ))}\n    </main>\n  );\n}",
    },
    {
      task: 'Write a register Server Action that validates email/password, rejects duplicate emails and stores a bcrypt hash.',
      hint: 'bcrypt.hash(password, 10); prisma.user.create; catch P2002.',
      solution:
        "'use server';\nimport bcrypt from 'bcryptjs';\nimport { z } from 'zod';\nimport { redirect } from 'next/navigation';\nimport { prisma } from '@/lib/prisma';\n\nconst Schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });\n\nexport async function register(prev, formData) {\n  const parsed = Schema.safeParse(Object.fromEntries(formData));\n  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };\n  const { name, email, password } = parsed.data;\n  const exists = await prisma.user.findUnique({ where: { email } });\n  if (exists) return { errors: { email: ['Email already registered'] } };\n  const passwordHash = await bcrypt.hash(password, 10);\n  await prisma.user.create({ data: { name, email, passwordHash, role: 'user' } });\n  redirect('/login?registered=1');\n}",
    },
    {
      task: 'Create a client-side <UserMenu> that shows "Loading...", a Sign in button, or the user\'s avatar and a Sign out button.',
      hint: 'useSession status values; signIn/signOut from next-auth/react; SessionProvider in a client providers file.',
      solution:
        "// app/providers.js\n'use client';\nimport { SessionProvider } from 'next-auth/react';\nexport default function Providers({ children }) { return <SessionProvider>{children}</SessionProvider>; }\n\n// components/UserMenu.js\n'use client';\nimport { useSession, signIn, signOut } from 'next-auth/react';\n\nexport default function UserMenu() {\n  const { data: session, status } = useSession();\n  if (status === 'loading') return <span>Loading...</span>;\n  if (!session) return <button onClick={() => signIn()}>Sign in</button>;\n  return (\n    <div>\n      <img src={session.user.image} alt=\"\" width={28} height={28} style={{ borderRadius: '50%' }} />\n      <span>{session.user.name}</span>\n      <button onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>\n    </div>\n  );\n}\n\n// app/layout.js: wrap {children} with <Providers>",
    },
    {
      task: 'Create an /admin layout that allows only users with role "admin"; others see a 403 message and anonymous users are redirected to login.',
      hint: 'auth() in layout; redirect for no session; render a Forbidden component for wrong role.',
      solution:
        "// app/admin/layout.js\nimport { redirect } from 'next/navigation';\nimport { auth } from '@/auth';\n\nexport default async function AdminLayout({ children }) {\n  const session = await auth();\n  if (!session?.user) redirect('/login?callbackUrl=/admin');\n  if (session.user.role !== 'admin') {\n    return (\n      <main>\n        <h1>403 - Forbidden</h1>\n        <p>You do not have permission to view this page.</p>\n      </main>\n    );\n  }\n  return <section>{children}</section>;\n}\n// Remember: each admin Server Action must also check the role.",
    },
    {
      task: 'Write a GET /api/me Route Handler that returns the current user JSON or 401.',
      hint: 'auth() inside the handler.',
      solution:
        "// app/api/me/route.js\nimport { auth } from '@/auth';\n\nexport async function GET() {\n  const session = await auth();\n  if (!session?.user) {\n    return Response.json({ error: 'Unauthorized' }, { status: 401 });\n  }\n  const { name, email, role } = session.user;\n  return Response.json({ name, email, role });\n}",
    },
  ],
  quiz: [
    { question: 'In Auth.js v5, which function returns the session in a Server Component?', options: ['getSession()', 'useSession()', 'auth()', 'getServerSideProps()'], answer: 2, explanation: 'auth() exported from your auth.js config works on the server everywhere.' },
    { question: 'Which status code means "logged in but not allowed"?', options: ['403', '401', '404', '500'], answer: 0, explanation: '403 Forbidden is for authorization failures; 401 is for missing authentication.' },
    { question: 'Where is the Auth.js route handler placed in the App Router?', options: ['pages/api/auth.js', 'middleware.js', 'app/auth/page.js', 'app/api/auth/[...nextauth]/route.js'], answer: 3, explanation: 'The catch-all route handler re-exports GET and POST from handlers.' },
    { question: 'What should the Credentials authorize() function return when the password is wrong?', options: ['false', 'null', 'An error string', 'The user without password'], answer: 1, explanation: 'Returning null tells Auth.js the credentials are invalid.' },
    { question: 'Which callback runs at sign-in with the user object, letting you copy a role into the token?', options: ['session', 'redirect', 'signIn', 'jwt'], answer: 3, explanation: 'jwt({ token, user }) receives user at sign-in; then session copies it to the session.' },
  ],
};
