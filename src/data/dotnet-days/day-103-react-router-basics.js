export default {
  id: 'day-103-react-router-basics',
  title: 'React Router: BrowserRouter, Routes, Route, Link and Navigate',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 103,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Turn the single-page React app into a multi-page application with React Router v6/v7: install react-router-dom, wrap the app in BrowserRouter, declare Routes and Route elements, navigate with Link and NavLink, redirect with Navigate, add a 404 page and configure the .NET host so deep links work after a refresh.',
  objectives: [
    'Explain client-side routing and why a SPA needs a router',
    'Configure BrowserRouter, Routes and Route with path and element',
    'Navigate with Link / NavLink instead of <a href> and highlight the active menu item',
    'Redirect with <Navigate> and handle unknown URLs with a path="*" 404 route',
    'Make refresh on /students work when the React build is hosted by ASP.NET Core (MapFallbackToFile)',
  ],
  theory: [
    {
      heading: 'Client-side routing in a SPA',
      content:
        'A Single Page Application loads **one** index.html. When the user clicks a menu item we do not want a full page reload from the server; we want React to swap components and update the address bar. A **router** does exactly that: it reads the URL (`/students`, `/about`), picks the matching component and uses the browser **History API** (`pushState`) to change the URL without reloading.\n\nBenefits: instant page changes, state (logged-in user, cart) survives navigation, the Back/Forward buttons and bookmarks still work.',
      points: [
        'Server-side routing (MVC, Day 66): every URL is a new HTTP request that returns HTML',
        'Client-side routing (React Router): URLs are handled in the browser; only data comes from the Web API as JSON',
        'Package: npm install react-router-dom (v6.4+ / v7, same component API)',
      ],
    },
    {
      heading: 'BrowserRouter, Routes and Route',
      content:
        '`<BrowserRouter>` wraps the whole app (usually in main.jsx) and listens to URL changes. Inside, `<Routes>` looks at the current URL and renders the **best matching** `<Route>`. Each Route has a `path` and an `element` (the JSX to render). Matching is by ranking, not order, so `/students/new` beats `/students/:id`.',
      syntax: `// main.jsx
import { BrowserRouter } from "react-router-dom";
createRoot(document.getElementById("root")).render(
  <BrowserRouter><App /></BrowserRouter>
);

// App.jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/students" element={<StudentList />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />
</Routes>`,
      tip: 'Components that are NOT inside <Routes> (Navbar, Footer) render on every page, which is how you build a common layout.',
    },
    {
      heading: 'Link and NavLink',
      content:
        'Never use `<a href="/students">` for internal pages: it makes the browser request the page from the server and React restarts (all state lost). Use `<Link to="/students">` which renders an `<a>` but intercepts the click and calls `navigate`.\n\n`<NavLink>` is a Link that knows whether it is **active**. It adds `class="active"` automatically, or you can pass a function to `className` / `style` that receives `{ isActive }`. Use `end` on the home link so "/" is not active on every page.',
      syntax: `<nav>
  <NavLink to="/" end>Home</NavLink>
  <NavLink to="/students" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Students</NavLink>
</nav>`,
    },
    {
      heading: 'Navigate, 404 page and query strings',
      content:
        '`<Navigate to="/students" replace />` redirects while rendering, for example from an old URL or from `/` to a default page. `replace` replaces the history entry so Back does not bounce. The route `path="*"` matches anything not matched by the others: your **404 page**.\n\nQuery strings (`/students?search=asha&page=2`) are read with `useSearchParams()`, which works like useState for the URL; we pass them straight to the Day 97 API.',
      syntax: `<Route path="/home" element={<Navigate to="/" replace />} />
<Route path="*" element={<NotFound />} />

const [params, setParams] = useSearchParams();
const search = params.get("search") ?? "";
setParams({ search: "asha", page: "1" });`,
    },
    {
      heading: 'Refreshing a deep link: hosting the build with ASP.NET Core',
      content:
        'In development Vite serves index.html for every URL, so refreshing `/students` works. In production, if the React build (`dist`) is copied to the API\'s **wwwroot**, a refresh on `/students` asks Kestrel for `/students`, which does not exist, so you get 404. Fix: serve static files and **fall back to index.html** for any non-API route. React Router then reads the URL and shows the right page.',
      syntax: `// Program.cs (API that also hosts the React build in wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();                    // /api/... still goes to controllers
app.MapFallbackToFile("index.html");     // everything else -> React`,
      tip: 'On IIS use the URL Rewrite module, on Netlify a _redirects file, on Azure Static Web Apps navigationFallback. Same idea: send unknown paths to index.html.',
    },
  ],
  examples: [
    {
      title: 'Multi-page Student Portal with React Router',
      scenario: 'The day\'s practical: a portal with Home, Students, About and a 404 page, a Navbar with active links and a redirect from /home to /.',
      steps: [
        'In the React project run: npm install react-router-dom',
        'Wrap <App /> in <BrowserRouter> in src/main.jsx',
        'Create src/pages/Home.jsx, Students.jsx, About.jsx, NotFound.jsx and src/components/Navbar.jsx',
        'Declare the routes in App.jsx and run npm run dev',
        'Click the links (no page reload in the Network tab), then type /xyz in the address bar to see the 404 page',
      ],
      code: `// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active fw-bold" : "");

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand bg-dark navbar-dark px-3">
      <span className="navbar-brand">Student Portal</span>
      <div className="navbar-nav">
        <NavLink to="/" end className={linkClass}>Home</NavLink>
        <NavLink to="/students" className={linkClass}>Students</NavLink>
        <NavLink to="/about" className={linkClass}>About</NavLink>
      </div>
    </nav>
  );
}

// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="p-4">
      <h2>404 - Page not found</h2>
      <Link to="/">Go back home</Link>
    </div>
  );
}

// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Students from "./pages/Students";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/students" element={<Students />} />
          <Route path="/about" element={<About />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}`,
      playground: {
        jsx: `// The playground cannot import react-router-dom, so this is a tiny router
// built with plain React that has the SAME API names: Router, Routes, Route, Link, NavLink, Navigate.
const { useState, useContext, createContext, useEffect } = React;

const RouterCtx = createContext(null);

function Router({ children }) {
  const [path, setPath] = useState("/");
  const [history, setHistory] = useState(["/"]);
  const navigate = (to, opts = {}) => {
    setPath(to);
    setHistory(h => (opts.replace ? [...h.slice(0, -1), to] : [...h, to]));
  };
  const back = () => setHistory(h => {
    if (h.length < 2) return h;
    const nh = h.slice(0, -1);
    setPath(nh[nh.length - 1]);
    return nh;
  });
  return <RouterCtx.Provider value={{ path, navigate, back, history }}>{children}</RouterCtx.Provider>;
}

function Routes({ children }) {
  const { path } = useContext(RouterCtx);
  const routes = React.Children.toArray(children);
  const match = routes.find(r => r.props.path === path) || routes.find(r => r.props.path === "*");
  return match ? match.props.element : null;
}
function Route() { return null; }

function Link({ to, children, style }) {
  const { navigate } = useContext(RouterCtx);
  return <a href={to} style={style} onClick={e => { e.preventDefault(); navigate(to); }}>{children}</a>;
}
function NavLink({ to, end, children }) {
  const { path } = useContext(RouterCtx);
  const isActive = end ? path === to : path === to || path.startsWith(to + "/");
  return <Link to={to} style={{ color: isActive ? "#ffc107" : "#fff", fontWeight: isActive ? 700 : 400, marginRight: 14, textDecoration: "none" }}>{children}</Link>;
}
function Navigate({ to, replace }) {
  const { navigate } = useContext(RouterCtx);
  useEffect(() => { navigate(to, { replace }); }, []);
  return null;
}

// ---------- the app (same code you write with react-router-dom) ----------
const Home = () => <div><h2>Welcome to the Student Portal</h2><p>Use the menu to move between pages without reloading.</p></div>;
const Students = () => (
  <div><h2>Students</h2>
    <ul>{["Asha Patil", "Ravi Kumar", "Meena Shah"].map(n => <li key={n}>{n}</li>)}</ul>
  </div>
);
const About = () => <div><h2>About</h2><p>React + ASP.NET Core Web API course project.</p></div>;
const NotFound = () => <div><h2>404 - Page not found</h2><Link to="/">Go back home</Link></div>;

function AddressBar() {
  const { path, navigate, back, history } = useContext(RouterCtx);
  const [typed, setTyped] = useState(path);
  useEffect(() => setTyped(path), [path]);
  return (
    <div style={{ display: "flex", gap: 6, padding: 8, background: "#eee" }}>
      <button onClick={back} disabled={history.length < 2}>Back</button>
      <input style={{ flex: 1 }} value={"http://localhost:5173" + typed} onChange={e => setTyped(e.target.value.replace("http://localhost:5173", ""))} onKeyDown={e => e.key === "Enter" && navigate(typed)} />
      <button onClick={() => navigate(typed)}>Go</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
        <AddressBar />
        <nav style={{ background: "#212529", padding: 10 }}>
          <strong style={{ color: "#fff", marginRight: 20 }}>Student Portal</strong>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            <Route path="/about" element={<About />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}`,
      },
      result: 'A fake address bar, a dark navbar (Home highlighted in yellow) and the Home page. Clicking Students changes the address to http://localhost:5173/students, highlights Students and shows the list without reloading. Typing /xyz and Go shows "404 - Page not found". Typing /home redirects to / (Home).',
      explanation:
        'The playground cannot install npm packages, so it ships a 40-line router that mimics react-router-dom: a context holds the current path, Routes picks the Route whose path matches (or "*"), Link prevents the default <a> reload and calls navigate, NavLink compares its "to" with the path. In the real project you import these components from react-router-dom instead and the code in App is identical.',
    },
    {
      title: 'Search page that keeps filters in the URL (useSearchParams + .NET API)',
      scenario: 'Students page reads ?search= and ?page= from the URL so the filtered page can be bookmarked and shared, and calls GET /api/students?search=&page=&pageSize= (Day 97).',
      steps: [
        'Open src/pages/Students.jsx',
        'Replace local search state with useSearchParams',
        'Put the params in the useEffect dependency array so the API is called when the URL changes',
        'Search "as", go to page 2, copy the URL into a new tab: the same results appear',
      ],
      code: `// API (Day 97) returns { items, totalCount, page, pageSize }
[HttpGet]
public async Task<ActionResult<PagedResult<StudentResponseDto>>> GetAll(
    [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 5)
{
    var q = _db.Students.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(search)) q = q.Where(s => s.FullName.Contains(search));
    var total = await q.CountAsync();
    var items = await q.OrderBy(s => s.Id).Skip((page - 1) * pageSize).Take(pageSize)
        .Select(s => new StudentResponseDto(s.Id, s.FullName, s.Email, s.Course, s.Marks)).ToListAsync();
    return new PagedResult<StudentResponseDto>(items, total, page, pageSize);
}

// src/pages/Students.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function Students() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);
  const [data, setData] = useState({ items: [], totalCount: 0 });

  useEffect(() => {
    const c = new AbortController();
    fetch(import.meta.env.VITE_API_URL + "/students?search=" + encodeURIComponent(search) + "&page=" + page + "&pageSize=5", { signal: c.signal })
      .then(r => r.json()).then(setData).catch(() => {});
    return () => c.abort();
  }, [search, page]);

  const totalPages = Math.max(1, Math.ceil(data.totalCount / 5));
  return (
    <>
      <input value={search} onChange={e => setParams({ search: e.target.value, page: "1" })} placeholder="Search" />
      <ul>{data.items.map(s => <li key={s.id}><Link to={"/students/" + s.id}>{s.fullName}</Link></li>)}</ul>
      <button disabled={page <= 1} onClick={() => setParams({ search, page: String(page - 1) })}>Prev</button>
      <span> Page {page} of {totalPages} </span>
      <button disabled={page >= totalPages} onClick={() => setParams({ search, page: String(page + 1) })}>Next</button>
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

// Simulated URL query string + simulated GET /api/students?search=&page=&pageSize=5
const ALL = ["Asha Patil", "Ravi Kumar", "Meena Shah", "Aslam Khan", "John Dsouza", "Asif Ali", "Kavya Rao", "Nasir Shaikh", "Pooja Jain", "Rasika More", "Vikas Rane", "Sana Mirza"]
  .map((n, i) => ({ id: i + 1, fullName: n }));
function fakeGetStudents(search, page, pageSize) {
  return new Promise(res => setTimeout(() => {
    const filtered = ALL.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()));
    res({ items: filtered.slice((page - 1) * pageSize, page * pageSize), totalCount: filtered.length, page, pageSize });
  }, 300));
}

// A minimal useSearchParams replacement that stores the query in state
function useSearchParams() {
  const [qs, setQs] = useState("search=&page=1");
  const params = new URLSearchParams(qs);
  const setParams = obj => setQs(new URLSearchParams(obj).toString());
  return [params, setParams];
}

function App() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const page = Number(params.get("page") ?? 1);
  const [data, setData] = useState({ items: [], totalCount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fakeGetStudents(search, page, 5).then(d => { if (!ignore) { setData(d); setLoading(false); } });
    return () => { ignore = true; };
  }, [search, page]);

  const totalPages = Math.max(1, Math.ceil(data.totalCount / 5));
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <code style={{ display: "block", background: "#eee", padding: 6 }}>http://localhost:5173/students?{params.toString()}</code>
      <input style={{ margin: "10px 0" }} value={search} onChange={e => setParams({ search: e.target.value, page: "1" })} placeholder="Search students" />
      {loading ? <p>Loading...</p> : (
        <ul>{data.items.map(s => <li key={s.id}>#{s.id} {s.fullName}</li>)}</ul>
      )}
      <button disabled={page <= 1} onClick={() => setParams({ search, page: String(page - 1) })}>Prev</button>
      <span> Page {page} of {totalPages} ({data.totalCount} students) </span>
      <button disabled={page >= totalPages} onClick={() => setParams({ search, page: String(page + 1) })}>Next</button>
    </div>
  );
}`,
      },
      result: 'The URL box shows ?search=&page=1 and students #1 to #5 with "Page 1 of 3 (12 students)". Next shows #6 to #10 and the URL changes to page=2. Typing "as" resets to page 1 and shows Asha Patil, Aslam Khan, Asif Ali, Nasir Shaikh, Rasika More ("Page 1 of 1 (5 students)").',
      explanation:
        'The URL is the state: search and page are read from the query string, not from useState. Changing them with setParams changes the URL, which re-renders, and the effect (dependencies [search, page]) calls the API again. Because the URL holds everything, the page can be bookmarked.',
    },
    {
      title: 'Host the React build inside the ASP.NET Core API (deep-link refresh)',
      scenario: 'Deploy React and the API as one site; make refreshing http://localhost:5000/students load the React app instead of 404.',
      steps: [
        'In the React folder run npm run build (creates dist/)',
        'Copy the contents of dist/ into the API project\'s wwwroot folder',
        'Add UseDefaultFiles, UseStaticFiles and MapFallbackToFile to Program.cs',
        'Run the API (Ctrl+F5), open /students and press F5: the React page appears',
      ],
      code: `// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseDefaultFiles();      // "/" -> wwwroot/index.html
app.UseStaticFiles();       // /assets/index-abc123.js, css, images
app.UseAuthorization();
app.MapControllers();       // /api/students -> StudentsController
app.MapFallbackToFile("index.html");   // /students, /about, /xyz -> React Router decides

app.Run();

// Same origin = no CORS needed. In .env.production set:
// VITE_API_URL=/api`,
      playground: {
        jsx: `// Visualises how Kestrel decides what to return for each URL
const { useState } = React;
const wwwroot = ["/index.html", "/assets/index-abc123.js", "/assets/index-def456.css", "/favicon.svg"];

function resolve(url, fallback) {
  if (url === "/") return "200 wwwroot/index.html (UseDefaultFiles)";
  if (wwwroot.includes(url)) return "200 static file " + url + " (UseStaticFiles)";
  if (url.startsWith("/api/")) return "200 JSON from StudentsController (MapControllers)";
  return fallback ? "200 wwwroot/index.html -> React Router renders " + url : "404 Not Found";
}

function App() {
  const [fallback, setFallback] = useState(true);
  const urls = ["/", "/assets/index-abc123.js", "/api/students", "/students", "/students/3/edit", "/xyz"];
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <label><input type="checkbox" checked={fallback} onChange={e => setFallback(e.target.checked)} /> app.MapFallbackToFile("index.html")</label>
      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", marginTop: 10 }}>
        <thead><tr><th>Browser refresh on</th><th>Server response</th></tr></thead>
        <tbody>{urls.map(u => {
          const r = resolve(u, fallback);
          return <tr key={u}><td><code>{u}</code></td><td style={{ color: r.startsWith("404") ? "crimson" : "green" }}>{r}</td></tr>;
        })}</tbody>
      </table>
    </div>
  );
}`,
      },
      result: 'With the fallback ticked every row is green; /students and /students/3/edit show "200 wwwroot/index.html -> React Router renders ...". Untick it and /students, /students/3/edit and /xyz turn red "404 Not Found" while /, the JS file and /api/students still work.',
      explanation:
        'Static files and controllers are matched first; MapFallbackToFile only handles leftovers, so API routes keep working. The 404 for unknown pages is then shown by the React route path="*", not by the server.',
    },
  ],
  interview: [
    { q: 'What is client-side routing?', a: 'The browser-side app maps URLs to components and changes the URL with the History API (pushState) without requesting a new HTML page from the server.', level: 'Easy' },
    { q: 'Why use Link instead of <a href>?', a: 'An <a href> triggers a full page load, restarting React and losing state. Link prevents the default and navigates inside the SPA.', level: 'Easy' },
    { q: 'What is the difference between Link and NavLink?', a: 'NavLink knows whether its route is active and can apply an active class/style (className={({isActive}) => ...}). Link has no active state.', level: 'Easy' },
    { q: 'What does the end prop on NavLink do?', a: 'It makes the link active only on an exact match, so the Home link "/" is not active on /students.', level: 'Medium' },
    { q: 'How do you create a 404 page?', a: 'Add <Route path="*" element={<NotFound />} /> as a catch-all; it matches any URL no other route matches.', level: 'Easy' },
    { q: 'When do you use <Navigate>?', a: 'To redirect while rendering: old URLs, default child pages, or sending unauthenticated users to /login. Use replace to avoid adding a history entry.', level: 'Medium' },
    { q: 'BrowserRouter vs HashRouter?', a: 'BrowserRouter uses clean URLs (/students) and needs the server to fall back to index.html. HashRouter uses /#/students and works on any static host without server config but looks worse and is bad for SEO.', level: 'Medium' },
    { q: 'Why does refreshing /students give 404 in production and how do you fix it?', a: 'The server looks for a real /students file. Configure a fallback to index.html: app.MapFallbackToFile("index.html") in ASP.NET Core, URL Rewrite on IIS, _redirects on Netlify.', level: 'Hard' },
    { q: 'How do you read query string values in React Router?', a: 'useSearchParams() returns [params, setParams]; params.get("search") reads a value, setParams({...}) updates the URL.', level: 'Medium' },
    { q: 'Does the order of <Route> elements matter in v6+?', a: 'No. Routes ranks routes by specificity, so /students/new beats /students/:id regardless of order (v5 Switch was order-based).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a Contact page at /contact and a menu link for it.',
      hint: 'One new Route and one NavLink.',
      solution: `<NavLink to="/contact" className={linkClass}>Contact</NavLink>
<Route path="/contact" element={<Contact />} />`,
    },
    {
      task: 'Redirect "/" to "/dashboard" automatically.',
      hint: 'Navigate with replace.',
      solution: `<Route path="/" element={<Navigate to="/dashboard" replace />} />
<Route path="/dashboard" element={<Dashboard />} />`,
    },
    {
      task: 'Style the active NavLink with Bootstrap classes "active fw-bold text-warning".',
      hint: 'className accepts a function.',
      solution: `<NavLink to="/students" className={({ isActive }) => "nav-link" + (isActive ? " active fw-bold text-warning" : "")}>Students</NavLink>`,
    },
    {
      task: 'Make the 404 page show the wrong URL the user typed.',
      hint: 'useLocation().pathname.',
      solution: `import { useLocation, Link } from "react-router-dom";
export default function NotFound() {
  const { pathname } = useLocation();
  return <><h2>404</h2><p>No page at {pathname}</p><Link to="/">Home</Link></>;
}`,
    },
  ],
  quiz: [
    { question: 'Which component must wrap the app to enable routing with clean URLs?', options: ['Routes', 'BrowserRouter', 'Outlet', 'Link'], answer: 1, explanation: 'BrowserRouter provides the routing context using the History API.' },
    { question: 'Which route path catches all unknown URLs?', options: ['/', '/404', 'null', '*'], answer: 3, explanation: 'path="*" is the catch-all route.' },
    { question: 'What does <Navigate to="/" replace /> do?', options: ['Redirects and replaces the current history entry', 'Reloads the page', 'Opens a new tab', 'Calls the API'], answer: 0, explanation: 'replace avoids a back-button loop.' },
    { question: 'Which ASP.NET Core call lets refresh on /students load the React app?', options: ['app.UseRouting()', 'app.MapControllers()', 'app.MapFallbackToFile("index.html")', 'app.UseCors()'], answer: 2, explanation: 'Unmatched non-file routes fall back to index.html.' },
    { question: 'Which hook reads ?search=asha from the URL?', options: ['useParams', 'useSearchParams', 'useNavigate', 'useState'], answer: 1, explanation: 'useSearchParams handles the query string; useParams handles :id segments.' },
  ],
};
