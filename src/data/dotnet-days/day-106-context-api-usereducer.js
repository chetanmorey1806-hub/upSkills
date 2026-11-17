export default {
  id: 'day-106-context-api-usereducer',
  title: 'Context API, useContext, useReducer and State Management',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 106,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Solve prop drilling with the Context API, manage complex state transitions with useReducer, and combine both into a global AuthContext (user, token, status) with login/logout actions that call the .NET login API and persist the session in localStorage.',
  objectives: [
    'Explain prop drilling and when global state is needed',
    'Create a context with createContext, provide it with a Provider and read it with useContext',
    'Write a reducer with action types and dispatch actions with useReducer',
    'Build an AuthProvider + useAuth custom hook for global authentication state',
    'Compare Context + useReducer with Redux Toolkit and Zustand and know when to choose each',
  ],
  theory: [
    {
      heading: 'Prop drilling: the problem',
      content:
        'The logged-in user is needed in the Navbar ("Hi Priya"), the Sidebar (show Admin menu?), the Profile page and the API layer (token). Passing it as props from App through every intermediate component that does not even use it is called **prop drilling**. It makes components noisy and hard to move.\n\n**Context** lets a parent make a value available to **every** descendant, however deep, without passing props through each level.',
      points: [
        'Good for global, rarely changing data: auth user, theme, language, cart',
        'Not a replacement for all local state; keep form state inside the form',
        'Every consumer re-renders when the context value changes, so keep contexts focused (AuthContext, ThemeContext...)',
      ],
    },
    {
      heading: 'createContext, Provider and useContext',
      content:
        'Three steps: **create** the context object, **provide** a value high in the tree, **consume** it anywhere below with `useContext`. If a component is not inside the Provider, it gets the default value passed to createContext.',
      syntax: `// 1. create
const ThemeContext = createContext("light");

// 2. provide
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>

// 3. consume (any depth)
const theme = useContext(ThemeContext);`,
      tip: 'In React 19 you can write <ThemeContext value={theme}> without .Provider; .Provider still works in 18 and 19.',
    },
    {
      heading: 'useReducer: predictable state transitions',
      content:
        'When state has several related fields that change together (user, token, loading, error) and many ways to change it (LOGIN_START, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT), many `useState` calls get messy. `useReducer` centralises all transitions in one **pure function** `reducer(state, action) => newState`. Components only **dispatch** actions describing what happened.',
      syntax: `function reducer(state, action) {
  switch (action.type) {
    case "increment": return { ...state, count: state.count + 1 };
    case "reset":     return { ...state, count: 0 };
    default: throw new Error("Unknown action " + action.type);
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: "increment" });`,
      points: [
        'The reducer must be pure: no API calls, no localStorage, no mutation; return a new object',
        'Async work (calling the API) happens in the component or provider, which then dispatches the result',
        'Reducers are easy to unit test (input state + action → output state), like a C# switch expression',
      ],
    },
    {
      heading: 'Context + useReducer = global store',
      content:
        'Put `useReducer` inside a Provider component and share `state` plus helper functions (`login`, `logout`) through context. Expose a **custom hook** `useAuth()` so components never import the context object directly and get a clear error if used outside the provider.',
      syntax: `const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const login = async (email, password) => { ... dispatch({ type: "LOGIN_SUCCESS", payload }) };
  const logout = () => dispatch({ type: "LOGOUT" });
  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}`,
    },
    {
      heading: 'Persisting state and choosing a state library',
      content:
        'Context lives in memory, so a browser refresh resets it. Save the session to `localStorage` in an effect and read it in the reducer\'s **lazy initializer** (third argument of useReducer). Day 107 discusses where to store JWTs safely.\n\nWhen to use what:',
      points: [
        'useState: local UI state of one component',
        'Context + useReducer: a few global concerns in small/medium apps (this course)',
        'Redux Toolkit: large apps, many developers, devtools time-travel, RTK Query caching',
        'Zustand: tiny global store with minimal boilerplate',
        'TanStack Query (React Query): server state (API data caching, refetch); pairs well with any of the above',
      ],
      syntax: `const [state, dispatch] = useReducer(authReducer, null, () => {
  const saved = localStorage.getItem("auth");
  return saved ? { ...JSON.parse(saved), status: "authenticated" } : initialState;
});`,
    },
  ],
  examples: [
    {
      title: 'ThemeContext: remove prop drilling',
      scenario: 'Toggle a light/dark theme in the header and let a deeply nested card read it without props.',
      steps: [
        'Create src/context/ThemeContext.jsx',
        'Wrap App with <ThemeProvider> in main.jsx',
        'Call useTheme() inside any component that needs the theme',
        'Click the toggle and see every consumer update',
      ],
      code: `// src/context/ThemeContext.jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// src/components/Header.jsx
const { theme, toggle } = useTheme();
<button onClick={toggle}>Switch to {theme === "light" ? "dark" : "light"}</button>

// src/components/StudentCard.jsx (4 levels deep, no props needed)
const { theme } = useTheme();
<div className={theme === "dark" ? "bg-dark text-white" : "bg-light"}>...</div>`,
      playground: {
        jsx: `const { createContext, useContext, useState } = React;

const ThemeContext = createContext(null);
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}
const useTheme = () => useContext(ThemeContext);

function Header() {
  const { theme, toggle } = useTheme();
  return <header style={{ padding: 10, borderBottom: "1px solid #888" }}>
    <strong>Student Portal</strong> <button onClick={toggle}>Switch to {theme === "light" ? "dark" : "light"}</button>
  </header>;
}
// Page -> Section -> StudentCard: none of them pass theme as a prop
const Page = () => <Section />;
const Section = () => <div style={{ display: "flex", gap: 10, padding: 10 }}><StudentCard name="Asha Patil" /><StudentCard name="Ravi Kumar" /></div>;
function StudentCard({ name }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return <div style={{ padding: 12, borderRadius: 8, background: dark ? "#343a40" : "#f8f9fa", color: dark ? "#fff" : "#000", border: "1px solid #ccc" }}>
    {name}<br /><small>theme from context: {theme}</small>
  </div>;
}

function Shell() {
  const { theme } = useTheme();
  return <div style={{ fontFamily: "Segoe UI, sans-serif", background: theme === "dark" ? "#212529" : "#fff", color: theme === "dark" ? "#eee" : "#000", minHeight: 160 }}>
    <Header /><Page />
  </div>;
}

function App() {
  return <ThemeProvider><Shell /></ThemeProvider>;
}`,
      },
      result: 'A header with "Switch to dark" and two light cards saying "theme from context: light". Clicking the button turns the page and both cards dark and the button says "Switch to light".',
      explanation:
        'Page and Section never receive or forward theme. StudentCard and Header read it directly with useTheme(). When the provider\'s state changes, every consumer re-renders.',
    },
    {
      title: 'useReducer: shopping cart reducer',
      scenario: 'Model add, remove, change quantity and clear for a course cart with one reducer function.',
      steps: [
        'Create src/reducers/cartReducer.js with the reducer and action types',
        'Use useReducer in the Cart page',
        'Dispatch actions from buttons',
        'Notice the reducer never mutates state: it always returns new arrays/objects',
      ],
      code: `// src/reducers/cartReducer.js
export const initialCart = { items: [] };

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing)
        return { items: state.items.map(i => i.id === existing.id ? { ...i, qty: i.qty + 1 } : i) };
      return { items: [...state.items, { ...action.product, qty: 1 }] };
    }
    case "REMOVE":
      return { items: state.items.filter(i => i.id !== action.id) };
    case "SET_QTY":
      return { items: state.items.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i) };
    case "CLEAR":
      return initialCart;
    default:
      throw new Error("Unknown action: " + action.type);
  }
}

// Cart.jsx
const [cart, dispatch] = useReducer(cartReducer, initialCart);
dispatch({ type: "ADD", product });
dispatch({ type: "SET_QTY", id: 2, qty: 3 });`,
      playground: {
        jsx: `const { useReducer } = React;

const initialCart = { items: [] };
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(i => i.id === action.product.id);
      if (existing) return { items: state.items.map(i => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i)) };
      return { items: [...state.items, { ...action.product, qty: 1 }] };
    }
    case "REMOVE": return { items: state.items.filter(i => i.id !== action.id) };
    case "SET_QTY": return { items: state.items.map(i => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i)) };
    case "CLEAR": return initialCart;
    default: throw new Error("Unknown action: " + action.type);
  }
}

const products = [
  { id: 1, name: "C# Fundamentals", price: 1999 },
  { id: 2, name: "ASP.NET Core Web API", price: 2999 },
  { id: 3, name: "React with .NET", price: 2499 },
];

function App() {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <h3>Courses</h3>
      {products.map(p => <div key={p.id}>{p.name} - Rs {p.price} <button onClick={() => dispatch({ type: "ADD", product: p })}>Add</button></div>)}
      <h3>Cart ({cart.items.length} items)</h3>
      {cart.items.map(i => (
        <div key={i.id}>
          {i.name} x <input type="number" value={i.qty} style={{ width: 50 }} onChange={e => dispatch({ type: "SET_QTY", id: i.id, qty: Number(e.target.value) })} />
          = Rs {i.price * i.qty} <button onClick={() => dispatch({ type: "REMOVE", id: i.id })}>Remove</button>
        </div>
      ))}
      <p><strong>Total: Rs {total}</strong></p>
      <button onClick={() => dispatch({ type: "CLEAR" })} disabled={!cart.items.length}>Clear cart</button>
    </div>
  );
}`,
      },
      result: 'Click Add on "C# Fundamentals" twice and on "React with .NET" once: Cart (2 items), "C# Fundamentals x 2 = Rs 3998", "React with .NET x 1 = Rs 2499", Total: Rs 6497. Remove and Clear cart update the total.',
      explanation:
        'Every change is described by an action object. The reducer is the only place that knows how state changes, which makes behaviour easy to follow and test. Adding the same product twice increases qty instead of adding a duplicate row.',
    },
    {
      title: 'Global authentication state: AuthProvider + useAuth',
      scenario: 'The day\'s practical: an AuthContext that calls POST /api/auth/login (Day 94), stores user + token with useReducer, persists to localStorage and exposes login/logout to the whole app.',
      steps: [
        'Make sure the API from Day 94 has POST /api/auth/login returning { token, expiresAt, user: { id, name, email, roles } }',
        'Create src/context/AuthContext.jsx with authReducer, AuthProvider and useAuth',
        'Wrap the app: <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>',
        'Use const { user, login, logout, status } = useAuth() in Navbar and Login page',
        'Log in, refresh the browser: you stay logged in (localStorage)',
      ],
      code: `// ===== API (Day 94) Controllers/AuthController.cs =====
[HttpPost("login")]
[AllowAnonymous]
public async Task<ActionResult<LoginResponse>> Login(LoginRequest req)
{
    var user = await _users.FindByEmailAsync(req.Email);
    if (user is null || !await _users.CheckPasswordAsync(user, req.Password))
        return Unauthorized(new { message = "Invalid email or password" });
    var roles = await _users.GetRolesAsync(user);
    var (token, expires) = _tokenService.Create(user, roles);
    return new LoginResponse(token, expires, new UserDto(user.Id, user.FullName, user.Email!, roles));
}

// ===== React: src/context/AuthContext.jsx =====
import { createContext, useContext, useEffect, useReducer } from "react";
import api from "../api/axiosClient";

const AuthContext = createContext(null);
const initialState = { user: null, token: null, status: "idle", error: null };

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_START":   return { ...state, status: "loading", error: null };
    case "LOGIN_SUCCESS": return { user: action.payload.user, token: action.payload.token, status: "authenticated", error: null };
    case "LOGIN_FAILURE": return { ...initialState, status: "error", error: action.error };
    case "LOGOUT":        return initialState;
    default: return state;
  }
}

function init() {
  try {
    const saved = JSON.parse(localStorage.getItem("auth"));
    return saved?.token ? { ...initialState, ...saved, status: "authenticated" } : initialState;
  } catch { return initialState; }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, null, init);

  useEffect(() => {          // persist on every change
    if (state.token) localStorage.setItem("auth", JSON.stringify({ user: state.user, token: state.token }));
    else localStorage.removeItem("auth");
  }, [state.user, state.token]);

  async function login(email, password) {
    dispatch({ type: "LOGIN_START" });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      dispatch({ type: "LOGIN_SUCCESS", payload: data });
      return true;
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", error: err.response?.data?.message ?? "Login failed" });
      return false;
    }
  }
  const logout = () => dispatch({ type: "LOGOUT" });

  const value = { ...state, isAuthenticated: state.status === "authenticated", login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ===== src/main.jsx =====
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>

// ===== src/components/Navbar.jsx =====
const { user, isAuthenticated, logout } = useAuth();
{isAuthenticated ? <>Hi {user.name} <button onClick={logout}>Logout</button></> : <Link to="/login">Login</Link>}`,
      playground: {
        jsx: `const { createContext, useContext, useEffect, useReducer, useState } = React;

// ---- Fake POST /api/auth/login ----
const USERS = [
  { email: "admin@test.com", password: "Admin@123", user: { id: 1, name: "Priya Admin", email: "admin@test.com", roles: ["Admin"] } },
  { email: "user@test.com", password: "User@123", user: { id: 2, name: "Rohan User", email: "user@test.com", roles: ["User"] } },
];
function fakeLogin(email, password) {
  return new Promise((resolve, reject) => setTimeout(() => {
    const u = USERS.find(x => x.email === email && x.password === password);
    if (!u) reject({ response: { status: 401, data: { message: "Invalid email or password" } } });
    else resolve({ data: { token: "eyJhbGciOiJIUzI1NiJ9.fake." + u.user.id, expiresAt: "2026-12-31T00:00:00Z", user: u.user } });
  }, 700));
}

// ---- AuthContext (same as src/context/AuthContext.jsx) ----
const AuthContext = createContext(null);
const initialState = { user: null, token: null, status: "idle", error: null };
function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_START": return { ...state, status: "loading", error: null };
    case "LOGIN_SUCCESS": return { user: action.payload.user, token: action.payload.token, status: "authenticated", error: null };
    case "LOGIN_FAILURE": return { ...initialState, status: "error", error: action.error };
    case "LOGOUT": return initialState;
    default: return state;
  }
}
function init() {
  try {
    const saved = JSON.parse(localStorage.getItem("demo-auth"));
    return saved && saved.token ? { ...initialState, ...saved, status: "authenticated" } : initialState;
  } catch (e) { return initialState; }
}
function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, null, init);
  useEffect(() => {
    try {
      if (state.token) localStorage.setItem("demo-auth", JSON.stringify({ user: state.user, token: state.token }));
      else localStorage.removeItem("demo-auth");
    } catch (e) {}
  }, [state.user, state.token]);
  async function login(email, password) {
    dispatch({ type: "LOGIN_START" });
    try { const { data } = await fakeLogin(email, password); dispatch({ type: "LOGIN_SUCCESS", payload: data }); }
    catch (err) { dispatch({ type: "LOGIN_FAILURE", error: (err.response && err.response.data.message) || "Login failed" }); }
  }
  const logout = () => dispatch({ type: "LOGOUT" });
  return <AuthContext.Provider value={{ ...state, isAuthenticated: state.status === "authenticated", login, logout }}>{children}</AuthContext.Provider>;
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ---- components that use the global state ----
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  return <nav style={{ background: "#0d6efd", color: "#fff", padding: 10, display: "flex", justifyContent: "space-between" }}>
    <strong>Student Portal</strong>
    {isAuthenticated ? <span>Hi {user.name} ({user.roles.join(", ")}) <button onClick={logout}>Logout</button></span> : <span>Not logged in</span>}
  </nav>;
}
function LoginForm() {
  const { login, status, error } = useAuth();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("Admin@123");
  return <form onSubmit={e => { e.preventDefault(); login(email, password); }} style={{ padding: 16 }}>
    <input value={email} onChange={e => setEmail(e.target.value)} /> <input type="password" value={password} onChange={e => setPassword(e.target.value)} />{" "}
    <button disabled={status === "loading"}>{status === "loading" ? "Signing in..." : "Login"}</button>
    {error && <p style={{ color: "crimson" }}>{error}</p>}
    <p style={{ fontSize: 12, color: "#666" }}>Try admin@test.com / Admin@123, user@test.com / User@123, or a wrong password.</p>
  </form>;
}
function StateViewer() {
  const { user, token, status, error } = useAuth();
  return <pre style={{ background: "#f4f4f4", margin: 16, padding: 8, fontSize: 12 }}>{JSON.stringify({ status, error, token, user }, null, 2)}</pre>;
}
function Home() {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated ? <p style={{ padding: 16 }}>Welcome back, {user.name}. Refresh the preview: you stay logged in.</p> : <LoginForm />;
}

function App() {
  return <AuthProvider><div style={{ fontFamily: "Segoe UI, sans-serif" }}><Navbar /><Home /><StateViewer /></div></AuthProvider>;
}`,
      },
      result: 'Navbar shows "Not logged in" and the state viewer shows status "idle". Clicking Login shows "Signing in..." (status "loading") then the navbar reads "Hi Priya Admin (Admin)" with a Logout button and the viewer shows the token and user. A wrong password shows "Invalid email or password" with status "error". Logout returns to idle.',
      explanation:
        'The reducer is the only place where auth state changes; login() does the async API call and dispatches LOGIN_START / SUCCESS / FAILURE. Navbar, Home and StateViewer read the same state through useAuth() without any props. The lazy initializer restores the session from localStorage on refresh (wrapped in try/catch in case storage is blocked).',
    },
  ],
  interview: [
    { q: 'What is prop drilling?', a: 'Passing props through several intermediate components that do not use them, just to reach a deep child. Context removes the need.', level: 'Easy' },
    { q: 'What are the three steps of using Context?', a: 'createContext(default), wrap the tree with <Context.Provider value={...}>, read with useContext(Context) in any descendant.', level: 'Easy' },
    { q: 'What does useContext return when there is no Provider above?', a: 'The default value passed to createContext. That is why useAuth throws when it gets null: it catches the mistake early.', level: 'Medium' },
    { q: 'What is a reducer?', a: 'A pure function (state, action) => newState that describes how state changes in response to an action. No side effects, no mutation.', level: 'Easy' },
    { q: 'When would you prefer useReducer over useState?', a: 'When state has several related fields, the next state depends on the previous in complex ways, or many actions change it (auth flow, cart, multi-step form).', level: 'Medium' },
    { q: 'Why can\'t you call the API inside the reducer?', a: 'Reducers must be pure and synchronous; React may call them twice in StrictMode. Do the async call in the provider/component and dispatch the result.', level: 'Medium' },
    { q: 'What is the lazy initializer of useReducer?', a: 'The third argument init: useReducer(reducer, arg, init) computes the initial state once, e.g. reading localStorage only on mount.', level: 'Hard' },
    { q: 'What is a performance pitfall of Context?', a: 'All consumers re-render when the value changes. Creating a new object every render or putting unrelated data in one context causes extra renders; split contexts or memoize the value with useMemo.', level: 'Hard' },
    { q: 'Context vs Redux Toolkit?', a: 'Context + useReducer is built-in and fine for a few global concerns. Redux Toolkit adds a single store, middleware, devtools, RTK Query and better performance for large, frequently changing global state.', level: 'Medium' },
    { q: 'Why expose a custom hook like useAuth?', a: 'It hides the context object, gives one import, can validate that a provider exists and can add derived values (isAuthenticated, hasRole).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a counterReducer with increment, decrement (not below 0) and reset, and use it in a component.',
      hint: 'Math.max(0, ...).',
      solution: `function counterReducer(state, action) {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: Math.max(0, state.count - 1) };
    case "reset": return { count: 0 };
    default: return state;
  }
}
const [s, dispatch] = useReducer(counterReducer, { count: 0 });
<button onClick={() => dispatch({ type: "inc" })}>{s.count}</button>`,
    },
    {
      task: 'Add a hasRole(role) helper to the AuthContext value.',
      hint: 'Use state.user?.roles.',
      solution: `const hasRole = role => !!state.user?.roles?.includes(role);
const value = { ...state, isAuthenticated: state.status === "authenticated", login, logout, hasRole };
// usage
const { hasRole } = useAuth();
{hasRole("Admin") && <Link to="/admin">Admin panel</Link>}`,
    },
    {
      task: 'Create a LanguageContext ("en" | "hi") with a toggle and use it in a footer.',
      hint: 'Same pattern as ThemeContext.',
      solution: `const LanguageContext = createContext(null);
function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  return <LanguageContext.Provider value={{ lang, toggle: () => setLang(l => l === "en" ? "hi" : "en") }}>{children}</LanguageContext.Provider>;
}
function Footer() {
  const { lang, toggle } = useContext(LanguageContext);
  return <footer>{lang === "en" ? "Welcome" : "Swagat hai"} <button onClick={toggle}>Switch</button></footer>;
}`,
    },
    {
      task: 'Move the cart reducer into a CartContext so the Navbar can show the item count.',
      hint: 'useReducer inside CartProvider; expose cart and dispatch.',
      solution: `const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);
  return <CartContext.Provider value={{ cart, dispatch }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
// Navbar
const { cart } = useCart();
<span>Cart ({cart.items.reduce((n, i) => n + i.qty, 0)})</span>`,
    },
  ],
  quiz: [
    { question: 'Which hook reads a context value?', options: ['useReducer', 'useEffect', 'useContext', 'useRef'], answer: 2, explanation: 'useContext(MyContext) returns the nearest Provider value.' },
    { question: 'What does useReducer return?', options: ['[state, dispatch]', '[state, setState]', 'state only', '{ state, reducer }'], answer: 0, explanation: 'dispatch sends actions to the reducer.' },
    { question: 'Which of these is allowed inside a reducer?', options: ['Calling axios.post', 'Writing to localStorage', 'Mutating state.items.push', 'Returning a new object built from state and action'], answer: 3, explanation: 'Reducers must be pure and return new state.' },
    { question: 'Where should AuthProvider be placed?', options: ['Inside each page', 'High in the tree, wrapping all components that need auth', 'Inside the reducer', 'In index.html'], answer: 1, explanation: 'Only descendants of the Provider can read it.' },
    { question: 'Why does state reset after a browser refresh without extra code?', options: ['React state lives in memory only', 'Context is buggy', 'The API deletes it', 'Vite clears it on purpose'], answer: 0, explanation: 'Persist to storage and rehydrate with a lazy initializer.' },
  ],
};
