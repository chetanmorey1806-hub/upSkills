export default {
  lesson: 'day-04-complete-authentication-access-refresh-tokens',
  minutes: 40,
  intro: 'Practise production authentication: where tokens live, cookie flags, requireAuth middleware, refresh-token rotation with reuse detection and protected routes in React.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the access + refresh token pattern, where should each token be stored in a MERN app?',
      options: [
        'Both in localStorage',
        'Access token in React memory (state/context); refresh token in an httpOnly, Secure, SameSite cookie',
        'Access token in an httpOnly cookie; refresh token in localStorage',
        'Both inside the JWT payload of each other',
      ],
      answer: 1,
      explain: 'The short-lived **access token** lives in memory, so it disappears on reload and is hard to steal. The long-lived **refresh token** is in an **httpOnly** cookie that JavaScript cannot read, so an XSS bug cannot steal it. localStorage is readable by any injected script.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about cookie flags are TRUE? (choose all that apply)',
      options: [
        'httpOnly: JavaScript (document.cookie) cannot read the cookie',
        'Secure: the cookie is only sent over HTTPS',
        'SameSite=Strict or Lax reduces CSRF because the cookie is not sent on most cross-site requests',
        'A cookie with SameSite=None must also be Secure',
        'httpOnly encrypts the cookie value',
      ],
      answers: [0, 1, 2, 3],
      explain: '`httpOnly` hides the cookie from JavaScript, `Secure` restricts it to HTTPS, `SameSite` controls cross-site sending (and `SameSite=None` requires `Secure`). None of these **encrypt** the value – that is why the refresh token must be random or signed, and stored hashed in the database.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that hashes a password with bcrypt using a cost factor of 12:\n`const hash = await bcrypt.________(password, 12);`',
      accept: ['hash'],
      explain: '`bcrypt.hash(plain, saltRounds)` creates a salted, slow hash; `bcrypt.compare(plain, hash)` checks a login. Never store plain passwords or fast hashes like MD5/SHA-256 – they are cracked in seconds with GPUs.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 12,
      q: 'Build register / login / me (API Lab: tokens are simulated with random strings instead of JWTs):\n- `POST /api/auth/register` `{ name, email, password }` → **201** `{ user: { id, name, email } }` (never return the password); duplicate email → **409** `{ error: \'Email already registered\' }`\n- `POST /api/auth/login` → 200 `{ token, user }` for correct credentials, else **401** `{ error: \'Invalid email or password\' }`\n- `requireAuth` middleware: reads `Authorization: Bearer <token>`; missing/unknown → **401** `{ error: \'Not authenticated\' }`\n- `GET /api/auth/me` (protected) → 200 `{ user: { id, name, email } }`',
      example: { title: 'reading a Bearer token', code: "const header = req.get('authorization') || '';\nconst token = header.startsWith('Bearer ') ? header.slice(7) : null;" },
      starter: "const express = require('express');\nconst crypto = require('crypto');\nconst app = express();\napp.use(express.json());\n\nconst users = [];      // { id, name, email, password }\nconst sessions = {};   // token -> userId\n\n// TODO: register, login, requireAuth, me\n\napp.listen(5000);\n",
      solution: "const express = require('express');\nconst crypto = require('crypto');\nconst app = express();\napp.use(express.json());\n\nconst users = [];\nconst sessions = {};\nconst publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });\n\napp.post('/api/auth/register', (req, res) => {\n  const { name, email, password } = req.body || {};\n  if (users.some((u) => u.email === email)) return res.status(409).json({ error: 'Email already registered' });\n  const user = { id: users.length + 1, name, email, password };\n  users.push(user);\n  res.status(201).json({ user: publicUser(user) });\n});\n\napp.post('/api/auth/login', (req, res) => {\n  const { email, password } = req.body || {};\n  const user = users.find((u) => u.email === email && u.password === password);\n  if (!user) return res.status(401).json({ error: 'Invalid email or password' });\n  const token = crypto.randomUUID();\n  sessions[token] = user.id;\n  res.json({ token, user: publicUser(user) });\n});\n\nfunction requireAuth(req, res, next) {\n  const header = req.get('authorization') || '';\n  const token = header.startsWith('Bearer ') ? header.slice(7) : null;\n  const userId = token && sessions[token];\n  if (!userId) return res.status(401).json({ error: 'Not authenticated' });\n  req.user = users.find((u) => u.id === userId);\n  next();\n}\n\napp.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));\n\napp.listen(5000);\n",
      tests: [
        { name: 'register hides the password, duplicate → 409', steps: [
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha', email: 'asha@example.com', password: 'Secret@123' }, expect: { status: 201, json: { user: { name: 'Asha', email: 'asha@example.com' } }, absentIn: { user: ['password'] } } },
          { method: 'POST', url: '/api/auth/register', body: { name: 'Asha 2', email: 'asha@example.com', password: 'x' }, expect: { status: 409, json: { error: 'Email already registered' } } },
        ] },
        { name: 'login + /me with the token', steps: [
          { method: 'POST', url: '/api/auth/register', body: { name: 'Ravi', email: 'ravi@example.com', password: 'Pass@123' }, expect: { status: 201 } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'ravi@example.com', password: 'Pass@123' }, save: 'token', expect: { status: 200, json: { token: '', user: { email: 'ravi@example.com' } } } },
          { method: 'GET', url: '/api/auth/me', auth: true, expect: { status: 200, json: { user: { name: 'Ravi' } }, absentIn: { user: ['password'] } } },
        ] },
        { name: 'wrong password → 401', steps: [
          { method: 'POST', url: '/api/auth/register', body: { name: 'Neha', email: 'neha@example.com', password: 'Right@1' }, expect: { status: 201 } },
          { method: 'POST', url: '/api/auth/login', body: { email: 'neha@example.com', password: 'Wrong' }, expect: { status: 401, json: { error: 'Invalid email or password' } } },
        ] },
        { name: '/me without or with a fake token → 401', steps: [
          { method: 'GET', url: '/api/auth/me', expect: { status: 401, json: { error: 'Not authenticated' } } },
          { method: 'GET', url: '/api/auth/me', headers: { Authorization: 'Bearer fake' }, expect: { status: 401 } },
        ] },
      ],
      explain: 'In the real app the password is stored as a **bcrypt hash** and the token is a signed JWT (`jwt.sign({ sub: user.id }, secret, { expiresIn: \'15m\' })`), verified in `requireAuth` with `jwt.verify`. The rules stay the same: never return the password, 409 for duplicates, the same 401 message for wrong email or password, and 401 for missing tokens.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 10,
      q: '**Refresh-token rotation with reuse detection** (simulated, refresh tokens are sent in the JSON body instead of a cookie). One user exists with the valid refresh token **"rt-1"** (family "f1").\n- `POST /api/auth/refresh` `{ refreshToken }`:\n  - valid and unused → mark it **used**, issue a new one named `rt-2`, `rt-3`, … (counter), respond 200 `{ accessToken, refreshToken }`\n  - a token that was **already used** → **reuse detected**: revoke the whole family (all its tokens become invalid) and respond **401** `{ error: \'Token reuse detected\' }`\n  - unknown token → **401** `{ error: \'Invalid refresh token\' }`',
      example: { title: 'token store', code: "const tokens = { 'rt-1': { family: 'f1', used: false, revoked: false } };\nconst t = tokens[req.body.refreshToken];" },
      starter: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst tokens = { 'rt-1': { family: 'f1', used: false, revoked: false } };\nlet counter = 1;\n\n// TODO: POST /api/auth/refresh\n\napp.listen(5000);\n",
      solution: "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nconst tokens = { 'rt-1': { family: 'f1', used: false, revoked: false } };\nlet counter = 1;\n\napp.post('/api/auth/refresh', (req, res) => {\n  const id = (req.body || {}).refreshToken;\n  const t = tokens[id];\n  if (!t || t.revoked) return res.status(401).json({ error: 'Invalid refresh token' });\n  if (t.used) {\n    Object.values(tokens).forEach((x) => { if (x.family === t.family) x.revoked = true; });\n    return res.status(401).json({ error: 'Token reuse detected' });\n  }\n  t.used = true;\n  counter += 1;\n  const next = 'rt-' + counter;\n  tokens[next] = { family: t.family, used: false, revoked: false };\n  res.json({ accessToken: 'at-' + counter, refreshToken: next });\n});\n\napp.listen(5000);\n",
      tests: [
        { name: 'rotation issues a new refresh token', steps: [
          { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-1' }, expect: { status: 200, json: { accessToken: '', refreshToken: 'rt-2' } } },
          { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-2' }, expect: { status: 200, json: { refreshToken: 'rt-3' } } },
        ] },
        { name: 'reuse revokes the family', steps: [
          { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-1' }, expect: { status: 200, json: { refreshToken: 'rt-2' } } },
          { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-1' }, expect: { status: 401, json: { error: 'Token reuse detected' } } },
          { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'rt-2' }, expect: { status: 401 } },
        ] },
        { name: 'unknown token → 401', steps: [
          { method: 'POST', url: '/api/auth/refresh', body: { refreshToken: 'stolen' }, expect: { status: 401, json: { error: 'Invalid refresh token' } } },
        ] },
      ],
      explain: 'Rotation means every refresh token works **once**. If an old token shows up again, either the user or an attacker has a copy – you cannot tell which, so you revoke the whole **family** and force a new login. In production the token goes in an httpOnly cookie and only its **hash** is stored in MongoDB.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 8,
      q: 'Build a mini **ProtectedRoute** flow without a router:\n- an `AuthContext` that holds `user` and `login()` / `logout()`\n- a `ProtectedRoute` component that renders its `children` only when `user` exists, otherwise `<p className="login-msg">Please log in</p>`\n- App shows a button `#login` (sets user `{ name: \'Asha\' }`) and inside `ProtectedRoute` a `<h2 className="dashboard">Dashboard of Asha</h2>` (use the user\'s name)\n\n(The checker clicks `#login`.)',
      example: { title: 'context provider + consumer', code: "const ThemeContext = React.createContext(null);\nfunction Child() { const theme = React.useContext(ThemeContext); return <p>{theme}</p>; }\n<ThemeContext.Provider value=\"dark\"><Child /></ThemeContext.Provider>" },
      starter: "const { useState, useContext, createContext } = React;\n\nfunction App() {\n  // TODO: AuthContext, ProtectedRoute, login button\n  return <div>TODO</div>;\n}\n",
      solution: "const { useState, useContext, createContext } = React;\nconst AuthContext = createContext(null);\n\nfunction AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const login = () => setUser({ name: 'Asha' });\n  const logout = () => setUser(null);\n  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;\n}\n\nfunction ProtectedRoute({ children }) {\n  const { user } = useContext(AuthContext);\n  if (!user) return <p className=\"login-msg\">Please log in</p>;\n  return children;\n}\n\nfunction Dashboard() {\n  const { user } = useContext(AuthContext);\n  return <h2 className=\"dashboard\">Dashboard of {user.name}</h2>;\n}\n\nfunction LoginButton() {\n  const { login } = useContext(AuthContext);\n  return <button id=\"login\" onClick={login}>Log in</button>;\n}\n\nfunction App() {\n  return (\n    <AuthProvider>\n      <LoginButton />\n      <ProtectedRoute><Dashboard /></ProtectedRoute>\n    </AuthProvider>\n  );\n}\n",
      actions: [{ click: '#login' }],
      checks: [
        { sel: '.dashboard', textEq: 'Dashboard of Asha', msg: 'After login show <h2 className="dashboard">Dashboard of Asha</h2>' },
        { sel: '.login-msg', notExists: true, msg: 'Hide "Please log in" once the user is logged in' },
      ],
      explain: 'In React Router 7 the same idea is `if (!user) return <Navigate to="/login" replace />; return <Outlet />;`. The provider owns the auth state; any component reads it with `useContext`. Remember: hiding a page in React is only UX – the API must still check the token on every request.',
    },
  ],
};
