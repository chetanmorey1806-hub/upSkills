export default {
  id: "day-11-react-frontend-django-rest-api",
  title: "Connecting React Frontend to Django REST API (CORS, fetch/axios, JWT login)",
  module: "Module 3: Full Stack",
  day: 11,
  level: "Advanced",
  duration: "3.5 hours",
  summary: "Connect a React (Vite) single-page app to the Django REST API. Fix CORS with django-cors-headers, call the API with fetch and axios, implement JWT login with access/refresh tokens, protected routes, automatic token refresh with axios interceptors, and CRUD screens with error handling.",
  objectives: [
    "Explain the Same-Origin Policy, CORS and preflight OPTIONS requests",
    "Configure django-cors-headers correctly for development and production",
    "Fetch and send JSON with fetch() and axios, and display loading, error and empty states",
    "Implement JWT login, logout, protected routes and auto refresh with axios interceptors",
    "Build a React books CRUD page against the DRF API including validation errors and pagination",
  ],
  theory: [
    {
      heading: "Full Stack Architecture: Two Servers, One App",
      content: "In a modern full stack project the frontend and backend are separate applications. React (built with Vite) runs on http://localhost:5173 during development and serves HTML/JS/CSS. Django + DRF runs on http://127.0.0.1:8000 and only returns JSON. The browser downloads the React app, then React calls the API with fetch/axios and renders the JSON. Think of a restaurant: React is the dining hall with waiters and menus; DRF is the kitchen. They communicate only through order slips (HTTP + JSON).",
      syntax: `Browser
  │  GET http://localhost:5173  -> React app (index.html + JS bundle)
  │
  │  fetch("http://127.0.0.1:8000/api/books/", {headers: {Authorization: "Bearer <jwt>"}})
  ▼
Django + DRF (port 8000) -> JSON -> MySQL / SQLite`,
      points: [
        "Frontend: React 18, Vite, React Router, axios",
        "Backend: Django 5, DRF 3.15, SimpleJWT, django-cors-headers, django-filter",
        "Contract between them: the REST API documented in Swagger (Day 10)",
      ],
    },
    {
      heading: "Same-Origin Policy and CORS",
      content: "An origin is scheme + host + port. http://localhost:5173 and http://127.0.0.1:8000 are different origins. For security, browsers block JavaScript from reading responses from another origin unless the server says it is allowed. This is the Same-Origin Policy. CORS (Cross-Origin Resource Sharing) is how the server gives permission using response headers such as Access-Control-Allow-Origin. For 'non-simple' requests (JSON body, Authorization header, PUT/PATCH/DELETE) the browser first sends a preflight OPTIONS request asking 'may I?'. Only if the answer allows it does the real request go out. CORS errors appear only in browsers — Postman and curl ignore CORS, which is why 'it works in Postman' but not in React.",
      points: [
        "Error text: 'blocked by CORS policy: No Access-Control-Allow-Origin header is present'",
        "Fix on the SERVER (Django), not in React",
        "Preflight = OPTIONS request with Access-Control-Request-Method/Headers",
        "Never use CORS_ALLOW_ALL_ORIGINS = True in production",
      ],
    },
    {
      heading: "django-cors-headers Setup",
      content: "Install the package, add it to INSTALLED_APPS and put CorsMiddleware as high as possible in MIDDLEWARE — before CommonMiddleware — so it can add headers even to responses produced by other middleware. List the frontend origins in CORS_ALLOWED_ORIGINS. If you use cookies (session auth or httpOnly refresh cookie) also set CORS_ALLOW_CREDENTIALS = True and CSRF_TRUSTED_ORIGINS.",
      syntax: `pip install django-cors-headers

INSTALLED_APPS += ["corsheaders"]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",      # must be near the top
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# CORS_ALLOWED_ORIGIN_REGEXES = [r"^https://.*\\.example\\.com$"]
# CORS_ALLOW_CREDENTIALS = True`,
    },
    {
      heading: "fetch vs axios",
      content: "fetch is built into the browser: no install, returns a Promise, but you must call response.json() yourself, set Content-Type manually, and it does NOT reject on 4xx/5xx — you must check response.ok. axios is a library: automatic JSON, rejects on non-2xx with error.response, base URL and default headers via axios.create(), and interceptors to attach tokens or refresh them automatically. Most React + DRF projects use axios.",
      syntax: `// fetch
const res = await fetch("http://127.0.0.1:8000/api/books/", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
  body: JSON.stringify({ title: "Clean Code", price: "450" }),
});
if (!res.ok) throw await res.json();
const data = await res.json();

// axios
const { data } = await api.post("/books/", { title: "Clean Code", price: "450" });`,
    },
    {
      heading: "JWT Login Flow in a React App",
      content: "1) The login form POSTs username/password to /api/auth/token/. 2) Store the access and refresh tokens (memory + localStorage for this course; httpOnly cookies are more secure). 3) An axios request interceptor adds Authorization: Bearer <access> to every call. 4) When the API returns 401 because the access token expired, a response interceptor calls /api/auth/token/refresh/ once, saves the new tokens and retries the original request. 5) If refresh also fails, log the user out and redirect to /login. 6) Protected routes check if a user is logged in before rendering.",
      points: [
        "Keep the API base URL in .env: VITE_API_URL=http://127.0.0.1:8000/api",
        "Never store passwords in the browser; only tokens",
        "localStorage is readable by any JS on the page — prevent XSS (React escapes output by default; avoid dangerouslySetInnerHTML)",
        "Show DRF validation errors next to form fields: error.response.data.title[0]",
      ],
      tip: "In production you can avoid CORS completely by serving React and Django under the same domain (e.g. Nginx: / -> React build, /api/ -> Gunicorn).",
    },
  ],
  examples: [
    {
      title: "Enable CORS in Django and Prove It with a Preflight",
      scenario: "React on localhost:5173 gets 'blocked by CORS policy' when calling the API. Fix the backend and verify with curl, simulating the browser's preflight.",
      steps: [
        "Activate the venv in the library_api project",
        "pip install django-cors-headers and update requirements.txt",
        "Edit INSTALLED_APPS, MIDDLEWARE and add CORS_ALLOWED_ORIGINS in config/settings.py",
        "Restart python manage.py runserver",
        "Send the preflight with curl and check the Access-Control-* headers",
      ],
      code: `pip install django-cors-headers     # django-cors-headers==4.6.0
pip freeze > requirements.txt

# config/settings.py
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "drf_spectacular",
    "accounts",
    "books",
    "orders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Simulate the browser preflight
curl -i -X OPTIONS http://127.0.0.1:8000/api/books/ \\
  -H "Origin: http://localhost:5173" \\
  -H "Access-Control-Request-Method: POST" \\
  -H "Access-Control-Request-Headers: authorization, content-type"

# From a NOT allowed origin
curl -i -X OPTIONS http://127.0.0.1:8000/api/books/ \\
  -H "Origin: http://evil.example.com" \\
  -H "Access-Control-Request-Method: POST"`,
      result: `Allowed origin -> HTTP/1.1 200 OK
access-control-allow-origin: http://localhost:5173
access-control-allow-headers: accept, authorization, content-type, user-agent, x-csrftoken, x-requested-with
access-control-allow-methods: DELETE, GET, OPTIONS, PATCH, POST, PUT
access-control-max-age: 86400

Not allowed origin -> HTTP/1.1 200 OK
(no access-control-allow-origin header -> the browser blocks the real request)`,
      explanation: "The server still answers, but without Access-Control-Allow-Origin the BROWSER refuses to let JavaScript read the response. That is why CORS protects users, not servers. Placing CorsMiddleware first guarantees headers are added even to 401/404/500 responses.",
    },
    {
      title: "React + Vite Project: axios Client with JWT Interceptors",
      scenario: "Create the React app, an axios instance that adds the access token, and a response interceptor that refreshes the token once on 401 and retries.",
      steps: [
        "Install Node.js 20 LTS. In VS Code terminal (outside the Django folder) run the npm commands below",
        "Create .env with VITE_API_URL",
        "Create src/api/client.js and src/api/auth.js",
        "Run npm run dev and open http://localhost:5173",
        "PyCharm Professional also supports React: open the frontend folder and use the npm run configuration",
      ],
      code: `npm create vite@latest library-frontend -- --template react
cd library-frontend
npm install
npm install axios react-router-dom
npm run dev

# Project tree
library-frontend/
├── .env
├── index.html
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── api/
    │   ├── client.js
    │   └── auth.js
    ├── context/
    │   └── AuthContext.jsx
    ├── components/
    │   └── ProtectedRoute.jsx
    └── pages/
        ├── LoginPage.jsx
        └── BooksPage.jsx

# .env
VITE_API_URL=http://127.0.0.1:8000/api


// src/api/client.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const tokenStore = {
  get access() { return localStorage.getItem("access"); },
  get refresh() { return localStorage.getItem("refresh"); },
  save({ access, refresh }) {
    if (access) localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
  },
  clear() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },
};

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && tokenStore.refresh) {
      original._retry = true;
      try {
        refreshPromise ??= axios.post(\`\${API_URL}/auth/token/refresh/\`, {
          refresh: tokenStore.refresh,
        });
        const { data } = await refreshPromise;
        tokenStore.save(data);                       // new access (+ rotated refresh)
        original.headers.Authorization = \`Bearer \${data.access}\`;
        return api(original);                        // retry original request
      } catch (refreshError) {
        tokenStore.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  }
);

export default api;


// src/api/auth.js
import api, { tokenStore } from "./client";

export async function login(username, password) {
  const { data } = await api.post("/auth/token/", { username, password });
  tokenStore.save(data);
  const me = await api.get("/auth/me/");
  return me.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout/", { refresh: tokenStore.refresh });
  } finally {
    tokenStore.clear();
  }
}`,
      result: `VITE v5.4.x  ready in 312 ms
  ➜  Local:   http://localhost:5173/

Network tab after the access token expires:
  GET  /api/books/                  401  (token_not_valid)
  POST /api/auth/token/refresh/     200  {"access": "...", "refresh": "..."}
  GET  /api/books/                  200  (retried automatically)`,
      explanation: "The request interceptor adds the Bearer header to every call. The response interceptor catches 401, refreshes once (_retry flag prevents infinite loops), saves the rotated tokens and replays the original request; the user never notices. refreshPromise makes parallel requests share one refresh call, which matters when ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION are on.",
    },
    {
      title: "Auth Context, Login Page and Protected Route",
      scenario: "Build the login screen that shows DRF errors, keep the logged-in user in React context, and protect the Books page.",
      steps: [
        "Create src/context/AuthContext.jsx",
        "Create src/components/ProtectedRoute.jsx and src/pages/LoginPage.jsx",
        "Set up routes in src/App.jsx and wrap with AuthProvider in src/main.jsx",
        "Log in with a wrong password, then the correct one",
      ],
      code: `// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api, { tokenStore } from "../api/client";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!tokenStore.access) { setChecking(false); return; }
    api.get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  const login = async (username, password) => setUser(await authApi.login(username, password));
  const logout = async () => { await authApi.logout(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <p>Checking session...</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}


// src/pages/LoginPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate(location.state?.from?.pathname || "/books", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Network error - is Django running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 320, margin: "40px auto" }}>
      <h2>Library Login</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <input name="username" placeholder="Username" value={form.username} onChange={onChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
      <button disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
    </form>
  );
}


// src/App.jsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import BooksPage from "./pages/BooksPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/books" />} />
      </Routes>
    </BrowserRouter>
  );
}


// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider><App /></AuthProvider>
  </React.StrictMode>
);`,
      result: `Open http://localhost:5173/books (not logged in) -> redirected to /login

Wrong password -> red message under the title:
  No active account found with the given credentials

Correct password -> Network tab:
  POST http://127.0.0.1:8000/api/auth/token/   200 {"refresh": "...", "access": "..."}
  GET  http://127.0.0.1:8000/api/auth/me/      200 {"id": 2, "username": "asha", ...}
-> redirected to /books`,
      explanation: "The DRF error message ('detail') is shown directly to the user. On page reload, AuthProvider restores the session by calling /auth/me/ with the stored token. ProtectedRoute remembers where the user was going (state.from) and sends them back after login.",
    },
    {
      title: "Books CRUD Page: List, Search, Paginate, Create, Delete",
      scenario: "Show the paginated book list with search, a form to add a book with per-field DRF validation errors, and a delete button.",
      steps: [
        "Create src/pages/BooksPage.jsx",
        "Make sure the backend BookViewSet has SearchFilter and PageNumberPagination (Day 8)",
        "Log in, search 'python', go to page 2, add a book with a negative price, then a valid one",
        "Delete a book as a non-staff user and see the 403 message",
      ],
      code: `// src/pages/BooksPage.jsx
import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const EMPTY = { title: "", price: "", author_id: "" };

export default function BooksPage() {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const loadBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/v2/books/", { params: { page, search } });
      setBooks(data.results);
      setCount(data.count);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Could not load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, [page, search]);

  const createBook = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await api.post("/v2/books/", { ...form, author_id: Number(form.author_id) });
      setForm(EMPTY);
      setMessage("Book added");
      loadBooks();
    } catch (err) {
      if (err.response?.status === 400) setErrors(err.response.data);   // DRF field errors
      else setMessage(err.response?.data?.detail || "Error");
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await api.delete(\`/v2/books/\${id}/\`);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setMessage(err.response?.data?.detail || "Delete failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / 10));

  return (
    <div style={{ maxWidth: 760, margin: "20px auto" }}>
      <header>
        Hello {user.username} <button onClick={logout}>Logout</button>
      </header>
      {message && <p>{message}</p>}

      <input placeholder="Search..." value={search}
             onChange={(e) => { setPage(1); setSearch(e.target.value); }} />

      {loading ? <p>Loading...</p> : books.length === 0 ? <p>No books found.</p> : (
        <table>
          <thead><tr><th>Title</th><th>Author</th><th>Price</th><th></th></tr></thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td><td>{b.author?.name}</td><td>₹{b.price}</td>
                <td><button onClick={() => deleteBook(b.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
      <span> Page {page} of {totalPages} </span>
      <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>

      <h3>Add Book</h3>
      <form onSubmit={createBook}>
        {["title", "price", "author_id"].map((field) => (
          <div key={field}>
            <input name={field} placeholder={field} value={form[field]}
                   onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            {errors[field] && <small style={{ color: "crimson" }}>{errors[field][0]}</small>}
          </div>
        ))}
        {errors.non_field_errors && <p style={{ color: "crimson" }}>{errors.non_field_errors[0]}</p>}
        <button>Save</button>
      </form>
    </div>
  );
}`,
      result: `Request: GET /api/v2/books/?page=1&search=python
Response 200: {"count": 2, "next": null, "previous": null,
               "results": [{"id": 2, "title": "Fluent Python 2E", "author": {"id": 2, "name": "Luciano Ramalho", ...}, "price": "950.00", ...}, ...]}
Screen:  Fluent Python 2E | Luciano Ramalho | ₹950.00 | [Delete]
         Python Crash Course | Eric Matthes | ₹599.00 | [Delete]
         [Prev] Page 1 of 1 [Next]

Add with price -5 -> POST 400 {"price": ["Price must be greater than zero."]}
Screen: red text under the price input: Price must be greater than zero.

Delete as asha (not staff) -> DELETE 403
Screen: You do not have permission to perform this action.`,
      explanation: "axios params builds the query string. Because DRF returns errors as {field: [messages]}, the form can show each message next to its input with errors[field][0]. 400 = validation, 401 = handled by the interceptor, 403 = show the detail message. The page size 10 must match the backend pagination setting (or read it from the response).",
    },
    {
      title: "Pure Python Demo: CORS Decision Logic",
      scenario: "Simulate what django-cors-headers and the browser decide for different origins and preflight requests.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `from urllib.parse import urlsplit

CORS_ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}
ALLOWED_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
ALLOWED_HEADERS = {"accept", "authorization", "content-type", "x-csrftoken"}


def origin_of(url):
    p = urlsplit(url)
    return f"{p.scheme}://{p.netloc}"


def server_preflight(origin, method, headers):
    response = {}
    if origin in CORS_ALLOWED_ORIGINS:
        response["Access-Control-Allow-Origin"] = origin
        response["Access-Control-Allow-Methods"] = ", ".join(sorted(ALLOWED_METHODS))
        response["Access-Control-Allow-Headers"] = ", ".join(sorted(ALLOWED_HEADERS))
    return response


def browser_allows(page_url, api_url, method, headers):
    origin = origin_of(page_url)
    if origin == origin_of(api_url):
        return "same-origin: allowed"
    resp = server_preflight(origin, method, headers)
    if resp.get("Access-Control-Allow-Origin") != origin:
        return "BLOCKED by CORS policy"
    if method not in resp["Access-Control-Allow-Methods"]:
        return "BLOCKED: method not allowed"
    if not set(headers) <= ALLOWED_HEADERS:
        return "BLOCKED: header not allowed"
    return "cross-origin: allowed"


API = "http://127.0.0.1:8000/api/books/"
tests = [
    ("http://127.0.0.1:8000/admin/", "GET", []),
    ("http://localhost:5173/books", "POST", ["authorization", "content-type"]),
    ("http://localhost:3000/", "GET", []),
    ("http://localhost:5173/books", "DELETE", ["x-api-secret"]),
]
for page, method, hdrs in tests:
    print(f"{origin_of(page):24} {method:6} -> {browser_allows(page, API, method, hdrs)}")`,
      python: {
        files: {
          "main.py": `from urllib.parse import urlsplit

CORS_ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}
ALLOWED_METHODS = {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
ALLOWED_HEADERS = {"accept", "authorization", "content-type", "x-csrftoken"}


def origin_of(url):
    p = urlsplit(url)
    return f"{p.scheme}://{p.netloc}"


def server_preflight(origin, method, headers):
    response = {}
    if origin in CORS_ALLOWED_ORIGINS:
        response["Access-Control-Allow-Origin"] = origin
        response["Access-Control-Allow-Methods"] = ", ".join(sorted(ALLOWED_METHODS))
        response["Access-Control-Allow-Headers"] = ", ".join(sorted(ALLOWED_HEADERS))
    return response


def browser_allows(page_url, api_url, method, headers):
    origin = origin_of(page_url)
    if origin == origin_of(api_url):
        return "same-origin: allowed"
    resp = server_preflight(origin, method, headers)
    if resp.get("Access-Control-Allow-Origin") != origin:
        return "BLOCKED by CORS policy"
    if method not in resp["Access-Control-Allow-Methods"]:
        return "BLOCKED: method not allowed"
    if not set(headers) <= ALLOWED_HEADERS:
        return "BLOCKED: header not allowed"
    return "cross-origin: allowed"


API = "http://127.0.0.1:8000/api/books/"
tests = [
    ("http://127.0.0.1:8000/admin/", "GET", []),
    ("http://localhost:5173/books", "POST", ["authorization", "content-type"]),
    ("http://localhost:3000/", "GET", []),
    ("http://localhost:5173/books", "DELETE", ["x-api-secret"]),
]
for page, method, hdrs in tests:
    print(f"{origin_of(page):24} {method:6} -> {browser_allows(page, API, method, hdrs)}")
`,
        },
      },
      result: `http://127.0.0.1:8000    GET    -> same-origin: allowed
http://localhost:5173    POST   -> cross-origin: allowed
http://localhost:3000    GET    -> BLOCKED by CORS policy
http://localhost:5173    DELETE -> BLOCKED: header not allowed`,
      explanation: "The origin is scheme + host + port, so localhost:3000 (Create React App default) is a different origin from localhost:5173 and must be added to CORS_ALLOWED_ORIGINS. Custom headers must also be allowed (CORS_ALLOW_HEADERS) or the preflight fails.",
    },
  ],
  interview: [
    { q: "What is CORS and why do we need it in a React + Django project?", a: "Cross-Origin Resource Sharing is a browser mechanism that lets a server allow web pages from other origins to read its responses via Access-Control-* headers. React (localhost:5173) and Django (127.0.0.1:8000) are different origins, so Django must send CORS headers or the browser blocks the responses.", level: "Easy" },
    { q: "What is a preflight request?", a: "An automatic OPTIONS request the browser sends before a non-simple cross-origin request (custom headers like Authorization, JSON content type, PUT/PATCH/DELETE) to ask the server which origins, methods and headers are allowed.", level: "Medium" },
    { q: "Why does the API work in Postman but fail in React with a CORS error?", a: "CORS is enforced only by browsers. Postman and curl do not apply the Same-Origin Policy, so they ignore missing CORS headers.", level: "Easy" },
    { q: "Where must CorsMiddleware be placed?", a: "As high as possible in MIDDLEWARE, at least before CommonMiddleware and any middleware that can return responses, so CORS headers are added to every response, including errors.", level: "Medium" },
    { q: "Difference between CORS_ALLOWED_ORIGINS and CORS_ALLOW_ALL_ORIGINS?", a: "CORS_ALLOWED_ORIGINS whitelists specific origins. CORS_ALLOW_ALL_ORIGINS=True allows any website to call your API from a browser — acceptable only for fully public APIs, dangerous with credentials.", level: "Medium" },
    { q: "fetch vs axios?", a: "fetch is built in but needs manual JSON parsing and does not reject on HTTP errors (check response.ok). axios parses JSON automatically, rejects on non-2xx, supports base URLs, timeouts and interceptors.", level: "Easy" },
    { q: "How do you send the JWT from React to DRF?", a: "Add the header Authorization: Bearer <access_token> to each request, typically via an axios request interceptor.", level: "Easy" },
    { q: "How do you handle access token expiry in React?", a: "Use an axios response interceptor: on 401, call the refresh endpoint with the refresh token, store the new tokens, and retry the original request once; if refresh fails, log out.", level: "Medium" },
    { q: "localStorage vs httpOnly cookies for tokens?", a: "localStorage is simple but readable by any JavaScript, so XSS can steal tokens. httpOnly cookies cannot be read by JS (safer against XSS) but are sent automatically, so CSRF protection and CORS_ALLOW_CREDENTIALS are needed.", level: "Hard" },
    { q: "How do you show DRF validation errors in a React form?", a: "On a 400 response, err.response.data is an object of field -> list of messages; store it in state and display errors[field][0] under each input, and non_field_errors at the top.", level: "Medium" },
    { q: "How can you avoid CORS in production?", a: "Serve frontend and API from the same origin, e.g. Nginx serves the React build at / and proxies /api/ to Gunicorn. In development, Vite's server.proxy can also forward /api to Django.", level: "Hard" },
    { q: "What is an origin?", a: "The combination of scheme, host and port, e.g. http://localhost:5173. Any difference (http vs https, localhost vs 127.0.0.1, port) makes it a different origin.", level: "Easy" },
  ],
  practice: [
    {
      task: "Write a fetch() function that loads /api/books/ with a token and throws a readable error for non-2xx responses.",
      hint: "Check res.ok and read res.json() for detail.",
      solution: `export async function getBooks(token) {
  const res = await fetch("http://127.0.0.1:8000/api/books/", {
    headers: { Authorization: "Bearer " + token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed: " + res.status);
  return data;
}`,
    },
    {
      task: "Configure Vite to proxy /api to Django so no CORS settings are needed in development.",
      hint: "server.proxy in vite.config.js; then use baseURL '/api'.",
      solution: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
});
// .env -> VITE_API_URL=/api`,
    },
    {
      task: "Add a Register page that calls POST /api/auth/register/ and logs the user in with returned tokens.",
      hint: "tokenStore.save(data) then setUser(data.user).",
      solution: `const onSubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await api.post("/auth/register/", form);
    tokenStore.save(data);
    navigate("/books");
  } catch (err) {
    setErrors(err.response?.data || {});
  }
};`,
    },
    {
      task: "Show an Edit button that PATCHes only the price of a book and updates the row without reloading the list.",
      hint: "api.patch then map over books replacing the updated item.",
      solution: `const updatePrice = async (id, price) => {
  const { data } = await api.patch("/v2/books/" + id + "/", { price });
  setBooks((prev) => prev.map((b) => (b.id === id ? data : b)));
};`,
    },
    {
      task: "Production settings: allow only https://library.example.com and enable cookies.",
      hint: "CORS_ALLOWED_ORIGINS, CORS_ALLOW_CREDENTIALS, CSRF_TRUSTED_ORIGINS.",
      solution: `CORS_ALLOWED_ORIGINS = ["https://library.example.com"]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["https://library.example.com"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True`,
    },
  ],
  quiz: [
    { question: "Which package adds CORS headers in Django?", options: ["django-cors-headers", "djangorestframework", "django-filter", "drf-spectacular"], answer: 0, explanation: "Install django-cors-headers and add corsheaders + CorsMiddleware." },
    { question: "Which HTTP method is used for a CORS preflight?", options: ["HEAD", "GET", "OPTIONS", "TRACE"], answer: 2, explanation: "Browsers send OPTIONS with Access-Control-Request-* headers." },
    { question: "Are http://localhost:5173 and http://127.0.0.1:5173 the same origin?", options: ["Yes, they point to the same machine", "Yes, ports are equal", "Only in Chrome", "No, the hosts differ"], answer: 3, explanation: "Origin compares the host string exactly; both must be listed." },
    { question: "Which axios feature lets you attach the JWT to every request?", options: ["axios.all", "request interceptor", "axios.CancelToken", "transformResponse"], answer: 1, explanation: "api.interceptors.request.use(config => ...) adds the Authorization header." },
    { question: "fetch() rejects its Promise when the server returns 404:", options: ["False — it resolves; check response.ok", "True", "Only for JSON responses", "Only in production builds"], answer: 0, explanation: "fetch rejects only on network failures, not HTTP error codes." },
  ],
};
