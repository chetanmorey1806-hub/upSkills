export default {
  id: 'day-24-react-springboot-integration',
  title: 'Full Stack Integration: React Frontend + Spring Boot Backend (CORS, fetch/axios, JWT login)',
  module: 'Module 6: Full Stack',
  day: 24,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: 'Connect a React (Vite) single-page app to a Spring Boot 3 REST API: configure CORS, call the API with fetch and axios, implement JWT login with an axios interceptor, protect React routes, and do full CRUD from the browser.',
  objectives: [
    'Explain how a React SPA and a Spring Boot API communicate over HTTP/JSON',
    'Prepare the backend: CORS in Spring Security, JWT login endpoint, consistent error JSON',
    'Call the API with fetch and with axios (instance, baseURL, interceptors)',
    'Implement login, token storage, logout, protected routes and auto-logout on 401',
    'Build a product CRUD screen and know dev-proxy vs CORS and production deployment options',
  ],
  theory: [
    {
      heading: '1. Full Stack Architecture (diagram in words)',
      content: 'Browser loads the React app from the Vite dev server (http://localhost:5173). React components call the Spring Boot API (http://localhost:8080/api/...) using fetch/axios. Spring Boot validates the JWT, calls the service layer, which uses JPA to read/write MySQL, and returns JSON. React stores the JSON in state and re-renders. Restaurant analogy: React is the waiter taking orders at the table; Spring Boot is the kitchen; MySQL is the store room; JSON is the plate passed through the window.',
      points: [
        'Frontend and backend are separate projects, separately run and deployed',
        'Contract = REST endpoints + JSON shapes (document with Swagger — Day 21)',
        'Two different origins in development → CORS must be configured (Day 19)',
      ],
    },
    {
      heading: '2. Backend Checklist for a Frontend',
      content: 'Before writing React code make the API frontend-friendly.',
      points: [
        'CORS: allow http://localhost:5173 with methods GET/POST/PUT/DELETE/OPTIONS and headers Authorization, Content-Type — inside the SecurityFilterChain via http.cors()',
        'Auth: POST /api/auth/login returns {"token": "..."} ; secured endpoints read Authorization: Bearer',
        'Errors: always JSON {"status":400,"message":"...","errors":{...}} from @RestControllerAdvice so React can show messages',
        'Status codes: 201 create, 204 delete, 400 validation, 401 not logged in, 403 forbidden, 404 not found',
        'Pagination responses with content/totalPages (Day 14)',
      ],
    },
    {
      heading: '3. fetch vs axios',
      content: 'fetch is built into browsers; axios is a small library with conveniences. With fetch you must call res.json() yourself and check res.ok, because fetch does NOT reject on 404/500. axios parses JSON automatically, rejects on non-2xx, supports a baseURL, timeouts and interceptors (code that runs before each request/after each response).',
      syntax: `// fetch
const res = await fetch("http://localhost:8080/api/products", {
  headers: { Authorization: "Bearer " + token }
});
if (!res.ok) throw new Error("HTTP " + res.status);
const data = await res.json();

// axios
const { data } = await api.get("/products");   // api = axios.create({ baseURL })`,
    },
    {
      heading: '4. JWT on the Client Side',
      content: 'After login React stores the token and adds it to every request. Common storage: localStorage (simple, survives refresh, but readable by JavaScript → protect against XSS) or memory + HttpOnly refresh cookie (more secure, more work). An axios REQUEST interceptor adds the header; a RESPONSE interceptor catches 401 and logs the user out.',
      points: [
        'AuthContext (React Context) holds token/user and login/logout functions for the whole app',
        'ProtectedRoute component redirects to /login when there is no token',
        'Decode the payload (sub, roles, exp) for UI decisions only — the SERVER always re-checks permissions',
        'Logout = remove token + redirect; for real revocation use short expiry/refresh tokens',
      ],
      tip: 'Never trust the frontend for security. Hiding a "Delete" button for non-admins is only UX; the backend @PreAuthorize is the real protection.',
    },
    {
      heading: '5. Dev Proxy vs CORS, and Production Deployment',
      content: 'Option A: configure CORS on the backend (what we do). Option B: Vite dev proxy — React calls /api/... on 5173 and Vite forwards to 8080, so the browser sees one origin and no CORS is needed in development. In production you can (1) build React (npm run build) and copy dist/ into Spring Boot src/main/resources/static so both are served from one origin, or (2) host React on Netlify/Vercel/S3 + CDN and the API separately with CORS set to the real domain, or (3) put both behind Nginx.',
      syntax: `// vite.config.js — Option B
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8080" } }
});`,
    },
    {
      heading: '6. Environment Variables in Vite',
      content: 'Do not hard-code the API URL. Vite exposes variables starting with VITE_ from .env files: .env.development → VITE_API_URL=http://localhost:8080/api ; .env.production → VITE_API_URL=https://api.myshop.com/api. Read with import.meta.env.VITE_API_URL. These values are PUBLIC (bundled into JS) — never put secrets there.',
    },
  ],
  examples: [
    {
      title: 'Example 1: Backend Ready for React (CORS + JWT + Product CRUD)',
      scenario: 'Prepare the Spring Boot shop API (from Days 12–19) so a React app on port 5173 can log in and manage products.',
      steps: [
        'Open the backend project in IntelliJ (File > Open > pom.xml > Open as Project) or STS (File > Import > Existing Maven Projects)',
        'Make sure these exist: AppUser + DbUserDetailsService (Day 17), JwtService + JwtAuthFilter (Day 18), SecurityConfig with CORS (Day 19)',
        'Add/verify ProductController with full CRUD and the GlobalExceptionHandler below',
        'Set app.cors.allowed-origins=http://localhost:5173 in application.properties',
        'Run the backend (IntelliJ ▶ / STS Boot Dashboard) — it listens on 8080',
        'Quick check with curl or Postman: POST /api/auth/login then GET /api/products with the token',
      ],
      code: `# ===== application.properties (relevant) =====
spring.datasource.url=jdbc:mysql://localhost:3306/shopdb?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
app.jwt.secret=\${JWT_SECRET:ZGV2LW9ubHktc2VjcmV0LWtleS1mb3Itand0LWRlbW8tMTIzNDU2Nzg5MA==}
app.jwt.expiration-ms=3600000
app.cors.allowed-origins=http://localhost:5173

// ===== entity/Product.java =====
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank(message = "Name is required")
    private String name;
    @NotNull @Positive(message = "Price must be positive")
    private Double price;
    @Min(value = 0, message = "Stock cannot be negative")
    private int stock;
    // constructors, getters, setters
}

// ===== controller/ProductController.java =====
package com.shop.api.controller;

import com.shop.api.entity.Product;
import com.shop.api.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository repo;
    public ProductController(ProductRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Product> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Product one(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Product " + id + " not found"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> create(@Valid @RequestBody Product p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(p));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable Long id, @Valid @RequestBody Product p) {
        Product db = one(id);
        db.setName(p.getName());
        db.setPrice(p.getPrice());
        db.setStock(p.getStock());
        return repo.save(db);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.delete(one(id));
        return ResponseEntity.noContent().build();
    }
}

// ===== exception/GlobalExceptionHandler.java =====
package com.shop.api.exception;

import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of(
            "status", 400, "message", "Validation failed", "errors", errors));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> status(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
            "status", ex.getStatusCode().value(), "message", ex.getReason()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> denied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
            "status", 403, "message", "Only admins can do this"));
    }
}

// ===== Login response now also returns username and roles =====
public record AuthResponse(String token, String username, List<String> roles) {}

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    try {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        UserDetails user = (UserDetails) auth.getPrincipal();
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList();
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(user),
                user.getUsername(), roles));
    } catch (BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("status", 401, "message", "Invalid username or password"));
    }
}`,
      result: `POST http://localhost:8080/api/auth/login {"username":"admin","password":"admin123"}
-> 200 {"token":"eyJhbGciOiJIUzI1NiJ9...","username":"admin","roles":["ROLE_ADMIN"]}

POST /api/products (admin token) {"name":"","price":-5,"stock":1}
-> 400 {"status":400,"message":"Validation failed",
        "errors":{"name":"Name is required","price":"Price must be positive"}}
   (order of the errors map can vary)

OPTIONS /api/products with Origin http://localhost:5173
-> 200 Access-Control-Allow-Origin: http://localhost:5173`,
      explanation: 'The backend now speaks a predictable JSON language: login returns token + roles, validation returns field errors React can show next to inputs, and CORS allows the Vite origin. Method security protects write operations no matter what the UI does.',
    },
    {
      title: 'Example 2: React App — axios Instance, AuthContext, Login and Protected Routes',
      scenario: 'Create the React frontend with a login page that stores the JWT and protects the products page.',
      steps: [
        'Install Node.js LTS (node -v). In a terminal: npm create vite@latest shop-frontend -- --template react',
        'cd shop-frontend && npm install && npm install axios react-router-dom',
        'Open the folder in VS Code or IntelliJ IDEA Ultimate / WebStorm (File > Open). In Eclipse you can use the Wild Web Developer plugin, but VS Code is common for React',
        'Create .env.development with VITE_API_URL',
        'Create src/api.js, src/AuthContext.jsx, src/ProtectedRoute.jsx, src/pages/Login.jsx and update src/main.jsx and src/App.jsx',
        'Run npm run dev and open http://localhost:5173 (backend must be running on 8080)',
      ],
      code: `# ===== shop-frontend/.env.development =====
VITE_API_URL=http://localhost:8080/api

// ===== src/api.js =====
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// REQUEST interceptor: attach JWT to every call
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// RESPONSE interceptor: auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// helper to read a friendly message from our backend error JSON
export function errorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || "Something went wrong";
}

export default api;

// ===== src/AuthContext.jsx =====
import { createContext, useContext, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("token", data.token);
    const u = { username: data.username, roles: data.roles };
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  const isAdmin = !!user && user.roles.includes("ROLE_ADMIN");

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ===== src/ProtectedRoute.jsx =====
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// ===== src/pages/Login.jsx =====
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { errorMessage } from "../api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate("/products");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "60px auto" }}>
      <h2>Shop Login</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <input name="username" placeholder="Username" value={form.username}
             onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password"
             value={form.password} onChange={handleChange} required />
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}

// ===== src/main.jsx =====
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// ===== src/App.jsx =====
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./pages/Login";
import Products from "./pages/Products";

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        <Link to="/products">Products</Link>
        {user ? (
          <>
            <span>Hi, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={
          <ProtectedRoute><Products /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </>
  );
}`,
      result: `npm run dev
  VITE v5.x  ready in 300 ms
  ➜  Local:   http://localhost:5173/

Browser:
1. Open http://localhost:5173/products → redirected to /login (no token)
2. Login with admin / wrong → red text "Invalid username or password"
3. Login with admin / admin123 → navigates to /products, navbar shows "Hi, admin  [Logout]"
4. DevTools > Application > Local Storage: token = eyJhbGciOi..., user = {"username":"admin","roles":["ROLE_ADMIN"]}
5. DevTools > Network > products request header: Authorization: Bearer eyJhbGciOi...`,
      explanation: 'The axios instance centralizes baseURL, timeout and headers. The request interceptor adds the token automatically, so components never handle headers. The response interceptor clears storage and redirects on 401 (expired token). AuthContext shares the logged-in user with every component; ProtectedRoute guards private pages.',
    },
    {
      title: 'Example 3: Product CRUD Page with axios (and the same GET with fetch)',
      scenario: 'Logged-in users see the product list; admins can add, edit and delete. Validation errors from Spring Boot appear under the form.',
      steps: [
        'Create src/pages/Products.jsx with the code below',
        'Log in as admin and add a product; then try an empty name to see backend validation messages',
        'Log in as a normal USER: the list loads, admin buttons are hidden, and a direct POST would still get 403 from the backend',
        'Open DevTools > Network to watch the OPTIONS preflight followed by the real request',
        'If you see "blocked by CORS policy", check app.cors.allowed-origins and http.cors() in SecurityConfig (Day 19)',
      ],
      code: `// ===== src/pages/Products.jsx =====
import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import { useAuth } from "../AuthContext";

const EMPTY = { name: "", price: "", stock: "" };

export default function Products() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function load() {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  useEffect(() => { load(); }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setFieldErrors({});
    const body = { name: form.name, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editId) {
        await api.put("/products/" + editId, body);
        setMessage("Product updated");
      } else {
        await api.post("/products", body);
        setMessage("Product added");
      }
      setForm(EMPTY);
      setEditId(null);
      load();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setFieldErrors(err.response.data.errors);   // {name: "...", price: "..."}
      }
      setMessage(errorMessage(err));
    }
  }

  function startEdit(p) {
    setEditId(p.id);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock) });
  }

  async function remove(id) {
    if (!window.confirm("Delete product " + id + "?")) return;
    try {
      await api.delete("/products/" + id);      // 204 No Content
      setProducts(products.filter((p) => p.id !== id));
      setMessage("Product deleted");
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Products</h2>
      {message && <p><b>{message}</b></p>}

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          {fieldErrors.name && <small style={{ color: "crimson" }}>{fieldErrors.name}</small>}
          <input name="price" type="number" placeholder="Price" value={form.price}
                 onChange={handleChange} />
          {fieldErrors.price && <small style={{ color: "crimson" }}>{fieldErrors.price}</small>}
          <input name="stock" type="number" placeholder="Stock" value={form.stock}
                 onChange={handleChange} />
          <button type="submit">{editId ? "Update" : "Add"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
        </form>
      )}

      <table border="1" cellPadding="6">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Price</th><th>Stock</th>{isAdmin && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => remove(p.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== Same list call using fetch (for comparison) =====
async function loadWithFetch() {
  const res = await fetch(import.meta.env.VITE_API_URL + "/products", {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  });
  if (!res.ok) {                       // fetch does NOT throw on 401/404/500
    throw new Error("HTTP " + res.status);
  }
  return res.json();
}`,
      result: `As admin:
- Table shows: 1 | Keyboard | 1200.00 | 15 | [Edit][Delete]
- Add {name:"Mouse", price:499, stock:30} → "Product added", new row 2 | Mouse | 499.00 | 30
- Add with empty name and price -1 → "Validation failed"; under inputs: "Name is required", "Price must be positive"
- Delete 2 → confirm → "Product deleted"

As user (ROLE_USER):
- Table visible, no form and no Actions column
- Manual POST from DevTools console → 403 {"status":403,"message":"Only admins can do this"}

Network tab for POST /api/products:
OPTIONS /api/products  200 (preflight)
POST    /api/products  201`,
      explanation: 'The UI reacts to backend responses: 201 refreshes the list, 400 shows field errors from the GlobalExceptionHandler, 403 shows the backend message. The browser sends a preflight because of the Authorization header and JSON body — CORS in Spring Security answers it. The fetch version shows why axios is convenient: fetch needs manual res.ok checks and JSON parsing.',
    },
    {
      title: 'Example 4: Serving the React Build from Spring Boot (One JAR Deployment)',
      scenario: 'Deploy frontend and backend as a single application on one origin, so no CORS is needed in production.',
      steps: [
        'In shop-frontend create .env.production with VITE_API_URL=/api (relative URL, same origin)',
        'Run npm run build — Vite creates the dist/ folder',
        'Copy the contents of dist/ into the backend src/main/resources/static/',
        'Add the SpaController below so React Router paths like /products return index.html on refresh',
        'Permit static resources in SecurityFilterChain; rebuild the JAR (mvn clean package) and run java -jar',
        'Open http://localhost:8080 — the React app and the API come from the same server',
      ],
      code: `# ===== shop-frontend/.env.production =====
VITE_API_URL=/api

# ===== Terminal =====
cd shop-frontend
npm run build
# Linux/macOS
cp -r dist/* ../shop-backend/src/main/resources/static/
# Windows PowerShell
# Copy-Item -Recurse dist\\* ..\\shop-backend\\src\\main\\resources\\static\\

// ===== backend: SpaController.java =====
package com.shop.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    // forward React routes (no dot in path, not /api) to index.html
    @GetMapping({"/", "/login", "/products", "/products/**"})
    public String forward() {
        return "forward:/index.html";
    }
}

// ===== SecurityConfig: permit frontend files =====
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/", "/index.html", "/assets/**", "/favicon.ico",
                     "/login", "/products", "/products/**").permitAll()
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/products/**").authenticated()
    .anyRequest().authenticated())

# ===== Build and run =====
cd ../shop-backend
./mvnw clean package -DskipTests
java -jar target/shop-backend-0.0.1-SNAPSHOT.jar`,
      result: `http://localhost:8080/          → React login page (served by Spring Boot)
http://localhost:8080/products  → refresh works (forwarded to index.html), data loads from /api/products
Network tab: requests go to http://localhost:8080/api/... (same origin, no OPTIONS preflight for CORS)`,
      explanation: 'Spring Boot automatically serves files from classpath:/static. The SpaController forwards client-side routes to index.html so browser refresh does not give 404. Because page and API share an origin, CORS is not involved; the security rules allow the static files and still protect /api/**. Option: automate the copy with frontend-maven-plugin.',
    },
  ],
  interview: [
    { q: 'Why do we get a CORS error when React calls Spring Boot in development?', a: 'React runs on http://localhost:5173 and the API on http://localhost:8080 — different ports are different origins. The browser blocks reading the response unless the server returns matching Access-Control-Allow-* headers.', level: 'Easy' },
    { q: 'How do you fix CORS when Spring Security is used?', a: 'Define a CorsConfigurationSource bean with allowed origins/methods/headers and enable it with http.cors(...) in the SecurityFilterChain, so preflight OPTIONS requests are handled before authentication.', level: 'Medium' },
    { q: 'Where do you store the JWT in a React app and what are the risks?', a: 'localStorage/sessionStorage (simple but readable by any injected script, so XSS can steal it) or memory with an HttpOnly, Secure, SameSite refresh cookie (safer against XSS, needs CSRF consideration). Always keep tokens short-lived and sanitize output to prevent XSS.', level: 'Hard' },
    { q: 'What is an axios interceptor?', a: 'A function that runs before every request (e.g. to add the Authorization header) or after every response (e.g. to handle 401 globally). Registered with api.interceptors.request.use / response.use.', level: 'Easy' },
    { q: 'Difference between fetch and axios?', a: 'fetch is built-in, returns a Response you must parse (res.json()) and does not reject on HTTP errors. axios auto-parses JSON, rejects on non-2xx, supports baseURL, timeouts, interceptors and request cancellation.', level: 'Easy' },
    { q: 'How do you protect routes in React?', a: 'Wrap private routes in a ProtectedRoute component that checks the auth state (from context) and renders <Navigate to="/login" /> when the user is not logged in. The backend still enforces real security.', level: 'Medium' },
    { q: 'Why is a preflight request sent for POST with JSON?', a: 'Content-Type: application/json and the Authorization header are not "simple" request headers, so the browser sends OPTIONS first to verify the server allows them.', level: 'Medium' },
    { q: 'How can you avoid CORS entirely?', a: 'Serve frontend and backend from the same origin: use a dev proxy (Vite server.proxy) in development and in production serve the React build from Spring Boot static resources or put both behind one reverse proxy (Nginx).', level: 'Medium' },
    { q: 'How should the backend report validation errors to a frontend?', a: 'Return 400 with a consistent JSON body, e.g. {status, message, errors: {field: message}}, produced by a @RestControllerAdvice handling MethodArgumentNotValidException.', level: 'Easy' },
    { q: 'Why must authorization be enforced on the server even if the UI hides admin buttons?', a: 'Any user can call the API directly with Postman or DevTools. Hiding buttons is only UX; @PreAuthorize/URL rules on the backend are the real security boundary.', level: 'Easy' },
    { q: 'How do you configure different API URLs for dev and prod in Vite?', a: 'Use .env.development and .env.production with VITE_API_URL and read import.meta.env.VITE_API_URL. Only variables prefixed with VITE_ are exposed, and they are public.', level: 'Medium' },
    { q: 'What happens when the JWT expires while the user is on a page?', a: 'The next API call gets 401; the axios response interceptor clears the stored token and redirects to /login (or calls a refresh endpoint to get a new access token and retries).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a "Register" page in React that calls POST /api/auth/register and then redirects to login.',
      hint: 'Same pattern as Login.jsx; handle 409 "Username taken".',
      solution: `import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response && err.response.status === 409 ? "Username already taken" : errorMessage(err));
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Register</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <input placeholder="Username" value={form.username}
             onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password}
             onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button>Create account</button>
    </form>
  );
}
// App.jsx: <Route path="/register" element={<Register />} />`,
    },
    {
      task: 'Add server-side pagination to the products page using GET /api/products/page?page=&size= returning {content, totalPages}.',
      hint: 'Keep page in state; useEffect depends on page.',
      solution: `// Backend
@GetMapping("/page")
public Map<String, Object> page(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "5") int size) {
    Page<Product> p = repo.findAll(PageRequest.of(page, size, Sort.by("id")));
    return Map.of("content", p.getContent(), "totalPages", p.getTotalPages());
}

// React
const [page, setPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
useEffect(() => {
  api.get("/products/page", { params: { page: page, size: 5 } }).then(({ data }) => {
    setProducts(data.content);
    setTotalPages(data.totalPages);
  });
}, [page]);
// buttons
<button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
<span> Page {page + 1} of {totalPages} </span>
<button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</button>`,
    },
    {
      task: 'Configure the Vite dev proxy so the frontend calls /api without CORS in development.',
      hint: 'server.proxy in vite.config.js and VITE_API_URL=/api.',
      solution: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});

# .env.development
VITE_API_URL=/api`,
    },
    {
      task: 'Add a search box that calls GET /api/products/search?keyword= (derived query from Day 13) as the user types, with a 400 ms debounce.',
      hint: 'useEffect with setTimeout and clearTimeout.',
      solution: `const [keyword, setKeyword] = useState("");

useEffect(() => {
  const t = setTimeout(() => {
    const url = keyword ? "/products/search" : "/products";
    api.get(url, { params: keyword ? { keyword: keyword } : {} })
       .then(({ data }) => setProducts(data));
  }, 400);
  return () => clearTimeout(t);
}, [keyword]);

<input placeholder="Search..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />`,
    },
  ],
  quiz: [
    { question: 'Which is a different origin from http://localhost:8080?', options: ['http://localhost:8080/api', 'http://localhost:8080/login', 'http://localhost:5173', 'http://localhost:8080/#/home'], answer: 2, explanation: 'Port differs → different origin.' },
    { question: 'Where is the JWT added in our React app?', options: ['axios request interceptor', 'Vite config', 'index.html meta tag', 'Spring SecurityFilterChain'], answer: 0, explanation: 'The interceptor sets Authorization: Bearer <token>.' },
    { question: 'fetch() rejects its promise when the server returns 404:', options: ['Always', 'Only for JSON', 'Only with axios installed', 'Never — you must check res.ok'], answer: 3, explanation: 'fetch rejects only on network errors.' },
    { question: 'Variables exposed to a Vite app must start with:', options: ['REACT_APP_', 'VITE_', 'SPRING_', 'NODE_'], answer: 1, explanation: 'import.meta.env.VITE_*.' },
    { question: 'Serving the React build from Spring Boot static/ avoids CORS because:', options: ['Spring disables the browser', 'JWT is not needed', 'Page and API share the same origin', 'CORS only applies to GET'], answer: 2, explanation: 'Same-origin requests are not subject to CORS.' },
  ],
};
