export default {
  id: 'day-107-jwt-login-protected-routes',
  title: 'JWT Login, Token Handling, Protected Routes and Role-Based UI',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 107,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Connect the React app to the JWT-secured ASP.NET Core API from Days 94-95: log in and receive a token, decode its claims (name, role, exp), attach it to every axios request with an interceptor, protect routes with a ProtectedRoute component, show or hide UI by role, and handle 401 (logout) and 403 (forbidden) responses.',
  objectives: [
    'Describe the end-to-end JWT flow between React and ASP.NET Core',
    'Decode a JWT in the browser to read claims and expiry (and know it is NOT verification)',
    'Attach Authorization: Bearer <token> with an axios request interceptor and handle 401 globally',
    'Build ProtectedRoute and role-based routes with <Navigate> and <Outlet>',
    'Show role-based UI (Admin vs User) and explain secure token storage options',
  ],
  theory: [
    {
      heading: 'The JWT flow between React and the .NET API',
      content:
        '1. The user submits email + password to **POST /api/auth/login**.\n2. The API checks the password (Identity, Day 110) and returns a signed **JWT** with claims (sub, name, email, role, exp).\n3. React stores the token (AuthContext from Day 106 + storage).\n4. Every protected request sends `Authorization: Bearer <token>`.\n5. The API\'s JwtBearer middleware validates the signature, issuer, audience and expiry, builds `User` and `[Authorize]` / `[Authorize(Roles = "Admin")]` decide: **200**, **401** (no/invalid/expired token) or **403** (valid token, wrong role).\n6. When the token expires or the user logs out, React clears it and redirects to /login.',
      syntax: `// API side (Day 94-95)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true, ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true, ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        RoleClaimType = ClaimTypes.Role
    });
app.UseCors("ReactApp");
app.UseAuthentication();
app.UseAuthorization();`,
    },
    {
      heading: 'Reading the token in React (decode, not verify)',
      content:
        'A JWT is `header.payload.signature`, each part **Base64Url** encoded. The payload is readable by anyone, so React can decode it (with the `jwt-decode` package or atob) to get the user name, roles and `exp` (seconds since 1970). React **cannot verify** the signature (it does not have the secret key) and does not need to: the **API** verifies every request. Never put secrets in a JWT.',
      syntax: `npm install jwt-decode

import { jwtDecode } from "jwt-decode";
const claims = jwtDecode(token);
// { sub: "1", name: "Priya", email: "...", role: "Admin", exp: 1767225600, iss: "StudentApi", aud: "StudentApp" }
const isExpired = claims.exp * 1000 < Date.now();`,
      points: [
        'Role claim name: ASP.NET Core writes ClaimTypes.Role as a long URI "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" unless you add a short "role" claim yourself',
        'One role → string, several roles → array; normalise with [].concat(claims.role ?? [])',
      ],
    },
    {
      heading: 'Sending the token: axios interceptors',
      content:
        'Do not add the header by hand in every call. A **request interceptor** reads the current token and sets the header. A **response interceptor** catches **401** globally: the token is missing/expired, so log out and go to /login. **403** means the user is logged in but lacks the role; show an "Access denied" message instead of logging out.',
      syntax: `api.interceptors.request.use(config => {
  const token = getToken();                       // from storage / auth store
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401) {
    clearSession();
    window.location.href = "/login?expired=1";
  }
  return Promise.reject(error);
});`,
      tip: 'Refresh tokens (Day 111) let the interceptor silently get a new access token on 401 and retry the original request once.',
    },
    {
      heading: 'Protected routes and role-based routes',
      content:
        'A **ProtectedRoute** is a layout route: if the user is not authenticated it renders `<Navigate to="/login" state={{ from: location }} replace />`, otherwise `<Outlet />`. Add an optional `roles` prop to also check roles and redirect to /forbidden. After login, navigate back to `location.state.from` so the user lands where they wanted to go.',
      syntax: `<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<ProtectedRoute />}>                     {/* any logged-in user */}
    <Route path="/dashboard" element={<Dashboard />} />
    <Route element={<ProtectedRoute roles={["Admin"]} />}>  {/* Admin only */}
      <Route path="/admin" element={<AdminPanel />} />
    </Route>
  </Route>
  <Route path="/forbidden" element={<Forbidden />} />
</Routes>`,
      points: [
        'Route protection in React is only UX: hiding a page does not secure data',
        'The real security is [Authorize] on the API; a hacker calling the API without a valid token gets 401/403',
      ],
    },
    {
      heading: 'Role-based UI and storing tokens safely',
      content:
        'Use the roles from the token to hide buttons and menu items a user cannot use: `{hasRole("Admin") && <button>Delete</button>}`. Again, the API must still enforce `[Authorize(Roles = "Admin")]` on DELETE.\n\nWhere to keep the token:',
      points: [
        'Memory (React state/context): safest from XSS, lost on refresh',
        'localStorage: survives refresh, simple, but readable by any injected script (XSS) - keep tokens short-lived and sanitize output',
        'sessionStorage: like localStorage but cleared when the tab closes',
        'HttpOnly Secure SameSite cookie set by the API: JavaScript cannot read it (best against XSS), needs CSRF protection and CORS AllowCredentials',
        'Common training/production compromise: short-lived access token in memory/localStorage + refresh token in an HttpOnly cookie',
      ],
    },
  ],
  examples: [
    {
      title: 'Login and admin panel with protected routes',
      scenario: 'The day\'s practical: a Login page, a Dashboard for any logged-in user, an Admin Panel only for the Admin role, a Forbidden page and automatic redirect back after login.',
      steps: [
        'Run the JWT API from Days 94-95 and confirm in Swagger that POST /api/auth/login returns a token',
        'npm install jwt-decode (axios and react-router-dom are already installed)',
        'Create src/auth/tokenStorage.js, src/api/axiosClient.js (with interceptors), src/context/AuthContext.jsx',
        'Create src/routes/ProtectedRoute.jsx and pages Login, Dashboard, AdminPanel, Forbidden',
        'Declare the routes in App.jsx, run npm run dev and try /admin as a User and as an Admin',
      ],
      code: `// ===== src/auth/tokenStorage.js =====
const KEY = "token";
export const getToken = () => localStorage.getItem(KEY);
export const setToken = t => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);

// ===== src/api/axiosClient.js =====
import axios from "axios";
import { getToken, clearToken } from "../auth/tokenStorage";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 10000 });

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !err.config.url.endsWith("/auth/login")) {
      clearToken();
      window.location.assign("/login?expired=1");
    }
    return Promise.reject(err);
  }
);
export default api;

// ===== src/context/AuthContext.jsx =====
import { createContext, useContext, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axiosClient";
import { getToken, setToken, clearToken } from "../auth/tokenStorage";

const ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const AuthContext = createContext(null);

function readUser(token) {
  if (!token) return null;
  try {
    const c = jwtDecode(token);
    if (c.exp * 1000 < Date.now()) { clearToken(); return null; }   // expired
    return { id: c.sub, name: c.name, email: c.email, roles: [].concat(c[ROLE] ?? c.role ?? []) };
  } catch { clearToken(); return null; }
}

export function AuthProvider({ children }) {
  const [token, setTok] = useState(getToken);
  const user = useMemo(() => readUser(token), [token]);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });   // throws on 401
    setToken(data.token);
    setTok(data.token);
  }
  function logout() { clearToken(); setTok(null); }
  const hasRole = role => !!user?.roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);

// ===== src/routes/ProtectedRoute.jsx =====
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.some(r => user.roles.includes(r))) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}

// ===== src/pages/Login.jsx =====
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.status === 401 ? "Invalid email or password" : "Login failed");
    }
  }
  return (
    <form onSubmit={handleSubmit} className="card p-4 mx-auto mt-5" style={{ maxWidth: 380 }}>
      <h3>Sign in</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <input className="form-control mb-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input className="form-control mb-3" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button className="btn btn-primary w-100">Login</button>
    </form>
  );
}

// ===== src/App.jsx =====
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/forbidden" element={<Forbidden />} />
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route element={<ProtectedRoute roles={["Admin"]} />}>
      <Route path="/admin" element={<AdminPanel />} />
    </Route>
  </Route>
  <Route path="*" element={<Navigate to="/dashboard" replace />} />
</Routes>`,
      playground: {
        jsx: `// Full JWT flow simulated in one file: fake .NET auth API, real-looking JWT (base64url),
// decode + expiry check, axios-like interceptor, ProtectedRoute, role-based UI.
const { useState, useMemo, createContext, useContext } = React;

// ---------- fake API ----------
const b64 = obj => btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");
function makeJwt(user, minutes) {
  const now = Math.floor(Date.now() / 1000);
  return b64({ alg: "HS256", typ: "JWT" }) + "." + b64({ sub: String(user.id), name: user.name, email: user.email, role: user.roles, iss: "StudentApi", aud: "StudentApp", exp: now + minutes * 60 }) + ".fake-signature";
}
const USERS = [
  { id: 1, name: "Priya", email: "admin@test.com", password: "Admin@123", roles: ["Admin", "User"] },
  { id: 2, name: "Rohan", email: "user@test.com", password: "User@123", roles: ["User"] },
];
function decode(token) {
  const p = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(p));
}
// The "server": validates Bearer token and roles like [Authorize(Roles = "Admin")]
function server(method, url, headers, body) {
  if (url === "/auth/login") {
    const u = USERS.find(x => x.email === body.email && x.password === body.password);
    return u ? { status: 200, data: { token: makeJwt(u, body.shortLived ? 0.15 : 60) } } : { status: 401, data: { message: "Invalid email or password" } };
  }
  const auth = headers.Authorization || "";
  if (!auth.startsWith("Bearer ")) return { status: 401, data: "" };
  const claims = decode(auth.slice(7));
  if (claims.exp * 1000 < Date.now()) return { status: 401, data: "", headers: { "www-authenticate": "Bearer error=\\"invalid_token\\", error_description=\\"The token expired\\"" } };
  if (url === "/students") return { status: 200, data: ["Asha Patil", "Ravi Kumar"] };
  if (url === "/admin/users") {
    if (!claims.role.includes("Admin")) return { status: 403, data: "" };
    return { status: 200, data: USERS.map(u => u.email + " [" + u.roles.join(",") + "]") };
  }
  return { status: 404, data: "" };
}

// ---------- token storage + axios-like client with interceptors ----------
let memoryToken = null;
const requestLog = [];
let onUnauthorized = () => {};
async function request(method, url, body) {
  const headers = {};
  if (memoryToken) headers.Authorization = "Bearer " + memoryToken;          // request interceptor
  requestLog.unshift(method + " /api" + url + (headers.Authorization ? "  Authorization: Bearer " + memoryToken.slice(0, 18) + "..." : "  (no token)"));
  await new Promise(r => setTimeout(r, 300));
  const res = server(method, url, headers, body);
  requestLog[0] += "  -> " + res.status;
  if (res.status >= 400) {
    if (res.status === 401 && url !== "/auth/login") onUnauthorized();     // response interceptor
    throw Object.assign(new Error("Request failed with status code " + res.status), { response: res });
  }
  return res;
}
const api = { get: url => request("GET", url), post: (url, b) => request("POST", url, b) };

// ---------- AuthContext ----------
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [token, setTok] = useState(null);
  const user = useMemo(() => {
    if (!token) return null;
    const c = decode(token);
    return { id: c.sub, name: c.name, roles: [].concat(c.role), exp: c.exp };
  }, [token]);
  async function login(email, password, shortLived) {
    const { data } = await api.post("/auth/login", { email, password, shortLived });
    memoryToken = data.token; setTok(data.token);
  }
  function logout() { memoryToken = null; setTok(null); }
  onUnauthorized = logout;
  const hasRole = r => !!user && user.roles.includes(r);
  return <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, hasRole }}>{children}</AuthContext.Provider>;
}
const useAuth = () => useContext(AuthContext);

// ---------- tiny router + ProtectedRoute ----------
const RouterCtx = createContext(null);
function Navigate({ to, state }) {
  const { navigate } = useContext(RouterCtx);
  React.useEffect(() => { navigate(to, state); }, []);
  return null;
}
function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth();
  const { path } = useContext(RouterCtx);
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: path }} />;
  if (roles && !roles.some(r => user.roles.includes(r))) return <Navigate to="/forbidden" />;
  return children;
}

// ---------- pages ----------
function Login() {
  const { login } = useAuth();
  const { navigate, state } = useContext(RouterCtx);
  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("User@123");
  const [short, setShort] = useState(false);
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault(); setError("");
    try { await login(email, password, short); navigate((state && state.from) || "/dashboard"); }
    catch (err) { setError(err.response && err.response.status === 401 ? "Invalid email or password" : "Login failed"); }
  }
  return <form onSubmit={submit}>
    <h3>Sign in</h3>
    {state && state.from && <p style={{ color: "#b45309" }}>Please log in to open {state.from}</p>}
    <select onChange={e => { const [em, pw] = e.target.value.split("|"); setEmail(em); setPassword(pw); }}>
      <option value="user@test.com|User@123">Rohan (User)</option>
      <option value="admin@test.com|Admin@123">Priya (Admin)</option>
      <option value="admin@test.com|wrong">Wrong password</option>
    </select>{" "}
    <label><input type="checkbox" checked={short} onChange={e => setShort(e.target.checked)} /> token expires in 9 s</label>{" "}
    <button>Login</button>
    {error && <p style={{ color: "crimson" }}>{error}</p>}
  </form>;
}
function Dashboard() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const call = async url => {
    setMsg(""); setData(null);
    try { setData((await api.get(url)).data); }
    catch (e) { setMsg(e.response.status === 403 ? "403 Forbidden: you are logged in but not an Admin" : e.response.status + " " + e.message); }
  };
  return <div>
    <h3>Dashboard</h3>
    <p>Hello {user.name}. Roles: {user.roles.join(", ")}. Token expires {new Date(user.exp * 1000).toLocaleTimeString()}.</p>
    <button onClick={() => call("/students")}>GET /api/students [Authorize]</button>{" "}
    <button onClick={() => call("/admin/users")}>GET /api/admin/users [Authorize(Roles="Admin")]</button>
    {hasRole("Admin") && <p style={{ background: "#e7f1ff", padding: 6 }}>Admin-only UI: you can see the Delete buttons.</p>}
    {data && <pre>{JSON.stringify(data, null, 1)}</pre>}
    {msg && <p style={{ color: "crimson" }}>{msg}</p>}
  </div>;
}
const AdminPanel = () => <div><h3>Admin Panel</h3><p>Manage users, roles and courses.</p></div>;
const Forbidden = () => <div><h3>403 - Access denied</h3><p>Your role cannot open this page.</p></div>;

function Shell() {
  const [loc, setLoc] = useState({ path: "/dashboard", state: null });
  const navigate = (path, state) => setLoc({ path, state: state || null });
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const [, force] = useState(0);
  const link = (to, label) => <a href={to} onClick={e => { e.preventDefault(); navigate(to); }} style={{ color: "#fff", marginRight: 12 }}>{label}</a>;
  let page;
  if (loc.path === "/login") page = <Login />;
  else if (loc.path === "/forbidden") page = <Forbidden />;
  else if (loc.path === "/admin") page = <ProtectedRoute roles={["Admin"]}><AdminPanel /></ProtectedRoute>;
  else page = <ProtectedRoute><Dashboard /></ProtectedRoute>;
  return <RouterCtx.Provider value={{ path: loc.path, state: loc.state, navigate }}>
    <nav style={{ background: "#212529", padding: 10, color: "#fff" }}>
      {link("/dashboard", "Dashboard")}
      {(!isAuthenticated || hasRole("Admin")) && link("/admin", "Admin Panel")}
      {isAuthenticated ? <span style={{ float: "right" }}>{user.name} <button onClick={() => { logout(); navigate("/login"); }}>Logout</button></span> : link("/login", "Login")}
    </nav>
    <code style={{ display: "block", background: "#eee", padding: 4 }}>localhost:5173{loc.path}</code>
    <main style={{ padding: 12 }}>{page}</main>
    <details open style={{ padding: 12 }}><summary>Request log <button onClick={() => force(x => x + 1)}>refresh</button></summary>
      <pre style={{ fontSize: 11, background: "#222", color: "#7CFC00", padding: 6, whiteSpace: "pre-wrap" }}>{requestLog.slice(0, 6).join("\\n")}</pre></details>
  </RouterCtx.Provider>;
}

function App() {
  return <AuthProvider><div style={{ fontFamily: "Segoe UI, sans-serif" }}><Shell /></div></AuthProvider>;
}`,
      },
      result: 'Opening the app redirects from /dashboard to /login ("Please log in to open /dashboard"). Logging in as Rohan (User) returns to the Dashboard; GET /api/students shows the two names, GET /api/admin/users shows "403 Forbidden: you are logged in but not an Admin", and the Admin Panel menu item is hidden. Logging in as Priya shows the Admin-only box, the Admin Panel link and the user list. With "token expires in 9 s", calling an API after 9 seconds gives 401 and the app logs out to /login. The request log shows each call with its Bearer header and status.',
      explanation:
        'The fake server behaves like JwtBearer + [Authorize]: no/expired token → 401, wrong role → 403. The client adds the Authorization header in one place (interceptor) and handles 401 globally by logging out. ProtectedRoute redirects to /login and remembers "from" so the user returns after login. Hiding the Admin link is only convenience; the 403 from the server is the real protection.',
    },
    {
      title: 'Role-based buttons with a <RequireRole> helper component',
      scenario: 'In the student table only Admins see Edit/Delete; Users see a read-only list. The API still protects DELETE with [Authorize(Roles = "Admin")].',
      steps: [
        'Add [Authorize(Roles = "Admin")] to the DELETE action in StudentsController',
        'Create src/components/RequireRole.jsx',
        'Wrap admin-only buttons with <RequireRole role="Admin">',
        'Log in as a User and confirm the buttons disappear; call DELETE from Postman with the User token and see 403',
      ],
      code: `// API
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id) => await _service.DeleteAsync(id) ? NoContent() : NotFound();
}

// src/components/RequireRole.jsx
import { useAuth } from "../context/AuthContext";
export default function RequireRole({ role, children, fallback = null }) {
  const { hasRole } = useAuth();
  return hasRole(role) ? children : fallback;
}

// usage in StudentTable.jsx
<td>
  <RequireRole role="Admin" fallback={<span className="text-muted">read only</span>}>
    <button className="btn btn-sm btn-warning me-1" onClick={() => edit(s.id)}>Edit</button>
    <button className="btn btn-sm btn-danger" onClick={() => remove(s.id)}>Delete</button>
  </RequireRole>
</td>`,
      playground: {
        jsx: `const { useState, createContext, useContext } = React;

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
function RequireRole({ role, children, fallback = null }) {
  const { hasRole } = useAuth();
  return hasRole(role) ? children : fallback;
}

function StudentTable() {
  const [rows, setRows] = useState([{ id: 1, name: "Asha Patil" }, { id: 2, name: "Ravi Kumar" }, { id: 3, name: "Meena Shah" }]);
  return (
    <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", marginTop: 10 }}>
      <thead><tr><th>Id</th><th>Name</th><th>Actions</th></tr></thead>
      <tbody>{rows.map(s => (
        <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>
          <RequireRole role="Admin" fallback={<span style={{ color: "#888" }}>read only</span>}>
            <button onClick={() => alert("Edit " + s.name)}>Edit</button>{" "}
            <button onClick={() => setRows(rows.filter(r => r.id !== s.id))}>Delete</button>
          </RequireRole>
        </td></tr>
      ))}</tbody>
    </table>
  );
}

function App() {
  const [roles, setRoles] = useState(["User"]);
  const hasRole = r => roles.includes(r);
  return (
    <AuthContext.Provider value={{ roles, hasRole }}>
      <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
        Logged in as:{" "}
        <select value={roles.join(",")} onChange={e => setRoles(e.target.value.split(","))}>
          <option value="User">Rohan (User)</option>
          <option value="Admin,User">Priya (Admin, User)</option>
        </select>
        <RequireRole role="Admin"><button style={{ marginLeft: 10 }}>+ Add student</button></RequireRole>
        <StudentTable />
      </div>
    </AuthContext.Provider>
  );
}`,
      },
      result: 'As Rohan (User) every Actions cell says "read only" and there is no "+ Add student" button. Switching to Priya (Admin, User) shows "+ Add student" plus Edit and Delete buttons in every row; Delete removes the row.',
      explanation:
        'RequireRole centralises the role check so pages stay clean. It decides what to render, not what is allowed: the API\'s [Authorize(Roles = "Admin")] would still return 403 to a User who calls DELETE directly.',
    },
    {
      title: 'Decode a JWT and check expiry',
      scenario: 'Paste any JWT from Swagger and see its header, claims, roles and whether it is expired, the same way the AuthContext does.',
      steps: [
        'Log in through Swagger (POST /api/auth/login) and copy the token',
        'In React use jwtDecode(token) from the jwt-decode package',
        'Compare claims.exp * 1000 with Date.now()',
        'Remember: decoding is not verifying - only the API can verify the signature',
      ],
      code: `import { jwtDecode } from "jwt-decode";

const ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function getUserFromToken(token) {
  const c = jwtDecode(token);
  return {
    id: c.sub,
    name: c.name ?? c.unique_name,
    roles: [].concat(c[ROLE] ?? c.role ?? []),
    expiresAt: new Date(c.exp * 1000),
    isExpired: c.exp * 1000 < Date.now(),
  };
}`,
      playground: {
        jsx: `const { useState } = React;

function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return JSON.parse(atob(s));
}
const enc = o => btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\\+/g, "-").replace(/\\//g, "_");
const ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const sample = enc({ alg: "HS256", typ: "JWT" }) + "." +
  enc({ sub: "1", name: "Priya", email: "admin@test.com", [ROLE]: ["Admin", "User"], iss: "StudentApi", aud: "StudentApp", exp: 1767225600 }) + ".signature";

function App() {
  const [token, setToken] = useState(sample);
  let view;
  try {
    const [h, p] = token.split(".");
    const header = b64urlDecode(h), claims = b64urlDecode(p);
    const roles = [].concat(claims[ROLE] || claims.role || []);
    const expired = claims.exp * 1000 < Date.now();
    view = (
      <div>
        <p><b>Header:</b> {JSON.stringify(header)}</p>
        <p><b>Name:</b> {claims.name} | <b>Roles:</b> {roles.join(", ")}</p>
        <p><b>exp:</b> {claims.exp} = {new Date(claims.exp * 1000).toISOString()} -{" "}
          <span style={{ color: expired ? "crimson" : "green" }}>{expired ? "EXPIRED (API would return 401)" : "valid time"}</span></p>
        <pre style={{ background: "#f4f4f4", padding: 6, fontSize: 12 }}>{JSON.stringify(claims, null, 2)}</pre>
      </div>
    );
  } catch (e) {
    view = <p style={{ color: "crimson" }}>Not a valid JWT: {e.message}</p>;
  }
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <textarea style={{ width: "100%", height: 80, fontSize: 11 }} value={token} onChange={e => setToken(e.target.value.trim())} />
      {view}
    </div>
  );
}`,
      },
      result: 'The sample token shows Header {"alg":"HS256","typ":"JWT"}, Name: Priya | Roles: Admin, User, and exp 1767225600 = 2026-01-01T00:00:00.000Z in red "EXPIRED (API would return 401)" (today is after that date), followed by the full claims JSON. Pasting garbage shows "Not a valid JWT: ...".',
      explanation:
        'The payload is just Base64Url JSON, which is why tokens must never contain passwords or secrets. The long role claim name is what ASP.NET Core writes for ClaimTypes.Role, so the code supports both forms.',
    },
  ],
  interview: [
    { q: 'Describe the JWT login flow in a React + ASP.NET Core app.', a: 'React posts credentials to /api/auth/login; the API validates them and returns a signed JWT; React stores it and sends Authorization: Bearer <token> on later requests; JwtBearer middleware validates it and [Authorize] allows or denies (401/403).', level: 'Medium' },
    { q: 'Can React verify a JWT signature?', a: 'No, it does not have the signing key (and must not). React only decodes the payload for display/expiry; the API verifies every request.', level: 'Medium' },
    { q: '401 vs 403 in the React app?', a: '401: not authenticated (missing/expired token) → log out and redirect to /login. 403: authenticated but lacks permission → show Access denied, keep the session.', level: 'Easy' },
    { q: 'How do you attach the token to every request?', a: 'An axios request interceptor that reads the token and sets config.headers.Authorization = "Bearer " + token.', level: 'Easy' },
    { q: 'How does a ProtectedRoute work?', a: 'It is a route element that checks auth state: if not logged in it returns <Navigate to="/login" state={{ from: location }} replace />, if the role is wrong it redirects to /forbidden, else it renders <Outlet /> (or children).', level: 'Medium' },
    { q: 'Is hiding admin buttons in React enough security?', a: 'No. Anyone can call the API with Postman. The API must enforce [Authorize(Roles = "Admin")] or policies; the UI only improves experience.', level: 'Easy' },
    { q: 'localStorage vs HttpOnly cookie for tokens?', a: 'localStorage is simple and survives refresh but is readable by injected scripts (XSS). HttpOnly cookies cannot be read by JS, but need SameSite/CSRF protection and CORS with credentials.', level: 'Hard' },
    { q: 'How do you redirect the user back to the page they wanted after login?', a: 'ProtectedRoute passes state={{ from: location }} to Navigate; Login reads location.state.from.pathname and calls navigate(from, { replace: true }) after success.', level: 'Medium' },
    { q: 'Why might roles be missing after decoding an ASP.NET Core token?', a: 'ClaimTypes.Role is serialised as the long URI claim name; read c["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] or add a short "role" claim. Also a single role is a string, several are an array.', level: 'Hard' },
    { q: 'How do you handle token expiry proactively?', a: 'Decode exp on load and log out if expired, set a timer to log out/refresh before exp, and use a refresh token flow in the 401 interceptor.', level: 'Hard' },
    { q: 'What CORS setting is needed if the token is in a cookie?', a: 'WithOrigins("http://localhost:5173").AllowCredentials() on the API (no AllowAnyOrigin) and withCredentials: true in axios.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a Logout button to the Navbar that clears the token and goes to /login.',
      hint: 'useAuth().logout + useNavigate.',
      solution: `const { logout, user } = useAuth();
const navigate = useNavigate();
<button onClick={() => { logout(); navigate("/login", { replace: true }); }}>Logout {user?.name}</button>`,
    },
    {
      task: 'Show "Your session expired" on the login page when the URL has ?expired=1.',
      hint: 'useSearchParams.',
      solution: `const [params] = useSearchParams();
{params.get("expired") && <div className="alert alert-warning">Your session expired. Please log in again.</div>}`,
    },
    {
      task: 'Automatically log out when the token expires even if the user does nothing.',
      hint: 'setTimeout until exp in an effect.',
      solution: `useEffect(() => {
  if (!user) return;
  const ms = user.expiresAt.getTime() - Date.now();
  const t = setTimeout(logout, Math.max(0, ms));
  return () => clearTimeout(t);
}, [user]);`,
    },
    {
      task: 'Protect /reports for roles Admin OR Manager.',
      hint: 'roles prop with two values; ProtectedRoute uses some().',
      solution: `<Route element={<ProtectedRoute roles={["Admin", "Manager"]} />}>
  <Route path="/reports" element={<Reports />} />
</Route>`,
    },
  ],
  quiz: [
    { question: 'Which header carries the JWT to the API?', options: ['Cookie: jwt=...', 'X-Token: ...', 'Authorization: Bearer <token>', 'Content-Type: jwt'], answer: 2, explanation: 'JwtBearer reads the Authorization header with the Bearer scheme.' },
    { question: 'The API returns 403 to a logged-in user. What should React do?', options: ['Show "Access denied" and keep the user logged in', 'Delete the token', 'Retry forever', 'Reload the page'], answer: 0, explanation: '403 means authenticated but not authorized.' },
    { question: 'What does decoding a JWT in the browser give you?', options: ['Proof that the token is valid', 'The signing key', 'The user password', 'The readable claims such as name, role and exp'], answer: 3, explanation: 'Decoding only reads the Base64Url payload.' },
    { question: 'ProtectedRoute should render what for an unauthenticated user?', options: ['<Outlet />', '<Navigate to="/login" ... />', 'null forever', 'An alert()'], answer: 1, explanation: 'Redirect to login, remembering where the user came from.' },
    { question: 'Which storage is NOT readable by JavaScript?', options: ['localStorage', 'sessionStorage', 'HttpOnly cookie', 'React state'], answer: 2, explanation: 'HttpOnly cookies are hidden from JS, which protects against XSS theft.' },
  ],
};
