export default {
  id: 'day-104-nested-routes-outlet-params',
  title: 'Nested Routes, Outlet, useNavigate and useParams',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 104,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Build an Admin Dashboard with a shared layout using nested routes and <Outlet>, index routes, dynamic segments like /admin/students/:id read with useParams, and programmatic navigation with useNavigate after saving or deleting a record through the .NET Web API.',
  objectives: [
    'Create layout routes with nested <Route> children and render them with <Outlet>',
    'Use index routes and relative paths inside a parent route',
    'Read dynamic URL segments with useParams and load one record from GET /api/students/{id}',
    'Navigate in code with useNavigate (after save, cancel, back) and pass state between pages',
    'Organise pages for an admin area: list, details, create and edit',
  ],
  theory: [
    {
      heading: 'Nested routes and layout routes',
      content:
        'Admin areas share a frame: a sidebar, a top bar and a content area. Instead of repeating that frame in every page, create a **layout route**: a parent `<Route>` whose element is the layout component, with child `<Route>`s inside it. Child paths are **relative** to the parent (`students` under `/admin` means `/admin/students`).',
      syntax: `<Routes>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<DashboardHome />} />          {/* /admin */}
    <Route path="students" element={<StudentList />} /> {/* /admin/students */}
    <Route path="students/new" element={<StudentForm />} />
    <Route path="students/:id" element={<StudentDetails />} />
    <Route path="students/:id/edit" element={<StudentForm />} />
  </Route>
</Routes>`,
      points: [
        'Parent path "/admin" is absolute; child paths without "/" are relative',
        'A parent can have its own layout while children replace only the content area',
        'You can nest several levels (admin > students > :id > tabs)',
      ],
    },
    {
      heading: '<Outlet>: where the child appears',
      content:
        'The layout component decides **where** the matched child route is rendered by placing `<Outlet />`. Think of it like `@RenderBody()` in an MVC _Layout.cshtml (Day 68). When the URL changes from /admin/students to /admin/students/3, the layout (sidebar) stays mounted and only the Outlet content changes.',
      syntax: `import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="d-flex">
      <aside><NavLink to="/admin" end>Dashboard</NavLink><NavLink to="students">Students</NavLink></aside>
      <main className="flex-grow-1"><Outlet /></main>
    </div>
  );
}`,
      tip: 'Pass data to children with <Outlet context={value} /> and read it with useOutletContext().',
    },
    {
      heading: 'Index routes',
      content:
        'An **index route** (`<Route index element={...} />`) has no path; it renders in the parent\'s Outlet when the URL is exactly the parent path. Use it for the dashboard home (/admin) or a "select an item" message.',
    },
    {
      heading: 'Dynamic segments and useParams',
      content:
        'A segment starting with `:` is a **parameter**: `students/:id` matches /admin/students/7 and gives `{ id: "7" }` from `useParams()`. Parameters are always **strings**; convert with Number(id) when needed. This mirrors the API route `[HttpGet("{id:int}")]`, so the details page calls `GET /api/students/7`. Put `id` in the useEffect dependency array, because the same component instance is reused when you move from /students/7 to /students/8.',
      syntax: `const { id } = useParams();
useEffect(() => {
  fetch(API + "/students/" + id).then(r => r.json()).then(setStudent);
}, [id]);`,
    },
    {
      heading: 'useNavigate: navigation from code',
      content:
        '`useNavigate()` returns a `navigate` function for moves that are not link clicks: after a successful POST go to the list, after delete go back, on Cancel go back one step.\n\n- `navigate("/admin/students")` absolute\n- `navigate("..")` up one level (relative)\n- `navigate(-1)` browser Back\n- `navigate("/login", { replace: true })` no history entry\n- `navigate("/admin/students", { state: { message: "Saved" } })` pass data; read it with `useLocation().state`',
      tip: 'Do not call navigate during rendering; call it in event handlers or effects. To redirect during render use <Navigate />.',
    },
  ],
  examples: [
    {
      title: 'Admin dashboard with layout, index route and student details',
      scenario: 'The day\'s practical: /admin shows a dashboard with a sidebar; /admin/students lists students; clicking a name opens /admin/students/:id inside the same layout; Edit and Back use useNavigate.',
      steps: [
        'Create src/layouts/AdminLayout.jsx with a sidebar and <Outlet />',
        'Create src/pages/admin/DashboardHome.jsx, StudentList.jsx, StudentDetails.jsx',
        'Declare the nested routes in App.jsx',
        'Run npm run dev and open http://localhost:5173/admin',
        'Click a student, then use the Back button; note the sidebar never re-mounts',
      ],
      code: `// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import StudentList from "./pages/admin/StudentList";
import StudentDetails from "./pages/admin/StudentDetails";
import StudentForm from "./pages/admin/StudentForm";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="students/:id/edit" element={<StudentForm />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// src/layouts/AdminLayout.jsx
import { NavLink, Outlet } from "react-router-dom";
export default function AdminLayout() {
  const cls = ({ isActive }) => "list-group-item list-group-item-action" + (isActive ? " active" : "");
  return (
    <div className="container-fluid">
      <div className="row">
        <aside className="col-md-2 list-group p-0">
          <NavLink to="/admin" end className={cls}>Dashboard</NavLink>
          <NavLink to="/admin/students" className={cls}>Students</NavLink>
        </aside>
        <main className="col-md-10 p-3"><Outlet /></main>
      </div>
    </div>
  );
}

// src/pages/admin/StudentDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

export default function StudentDetails() {
  const { id } = useParams();                // "3"
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setStudent(null); setError("");
    fetch(API + "/students/" + id)
      .then(r => { if (r.status === 404) throw new Error("Student " + id + " not found"); return r.json(); })
      .then(setStudent)
      .catch(e => setError(e.message));
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!student) return <p>Loading...</p>;
  return (
    <div className="card p-3">
      <h4>{student.fullName}</h4>
      <p>{student.email} | {student.course} | {student.marks}</p>
      <div>
        <button className="btn btn-secondary me-2" onClick={() => navigate(-1)}>Back</button>
        <Link className="btn btn-primary" to="edit">Edit</Link>
      </div>
    </div>
  );
}`,
      playground: {
        jsx: `// Mini router with nested routes, Outlet, useParams and useNavigate
// (same API names as react-router-dom, which cannot be imported in the playground)
const { useState, useEffect, useContext, createContext } = React;

const Nav = createContext(null);
const OutletCtx = createContext(null);
const ParamsCtx = createContext({});

function matchPath(pattern, path) {
  const p = pattern.split("/").filter(Boolean), u = path.split("/").filter(Boolean);
  if (p.length !== u.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = u[i];
    else if (p[i] !== u[i]) return null;
  }
  return params;
}

// routes: [{ path, element, children: [{ index | path, element }] }]
function renderRoutes(routes, path) {
  for (const r of routes) {
    if (r.children) {
      for (const c of r.children) {
        const full = c.index ? r.path : r.path + "/" + c.path;
        const params = matchPath(full, path);
        if (params) return (
          <ParamsCtx.Provider value={params}>
            <OutletCtx.Provider value={c.element}>{r.element}</OutletCtx.Provider>
          </ParamsCtx.Provider>
        );
      }
    } else if (r.path === "*" || matchPath(r.path, path)) return r.element;
  }
  return null;
}

const Outlet = () => useContext(OutletCtx);
const useParams = () => useContext(ParamsCtx);
function useNavigate() {
  const { go, back } = useContext(Nav);
  return to => (to === -1 ? back() : go(to));
}
function Link({ to, children, style }) {
  const navigate = useNavigate();
  return <a href={to} style={style} onClick={e => { e.preventDefault(); navigate(to); }}>{children}</a>;
}
function NavLink({ to, end, children }) {
  const { path } = useContext(Nav);
  const active = end ? path === to : path.startsWith(to);
  return <Link to={to} style={{ display: "block", padding: "8px 12px", color: "#fff", textDecoration: "none", background: active ? "#0d6efd" : "transparent" }}>{children}</Link>;
}

// ---------- fake .NET API ----------
const STUDENTS = [
  { id: 1, fullName: "Asha Patil", email: "asha@test.com", course: "C#", marks: 87 },
  { id: 2, fullName: "Ravi Kumar", email: "ravi@test.com", course: "React", marks: 35 },
  { id: 3, fullName: "Meena Shah", email: "meena@test.com", course: "SQL Server", marks: 72 },
];
const api = {
  getAll: () => new Promise(r => setTimeout(() => r(STUDENTS), 300)),
  getById: id => new Promise((r, j) => setTimeout(() => {
    const s = STUDENTS.find(x => x.id === Number(id));
    s ? r(s) : j(new Error("404: Student " + id + " not found"));
  }, 300)),
};

// ---------- pages (identical to real react-router-dom code) ----------
function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: 260 }}>
      <aside style={{ width: 150, background: "#212529" }}>
        <div style={{ color: "#ffc107", padding: 12, fontWeight: 700 }}>Admin</div>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/students">Students</NavLink>
      </aside>
      <main style={{ flex: 1, padding: 16 }}><Outlet /></main>
    </div>
  );
}
const DashboardHome = () => <div><h3>Dashboard</h3><p>Total students: {STUDENTS.length}</p><p>Average marks: {Math.round(STUDENTS.reduce((a, s) => a + s.marks, 0) / STUDENTS.length)}</p></div>;

function StudentList() {
  const [list, setList] = useState(null);
  useEffect(() => { api.getAll().then(setList); }, []);
  if (!list) return <p>Loading...</p>;
  return <div><h3>Students</h3><ul>{list.map(s => <li key={s.id}><Link to={"/admin/students/" + s.id}>{s.fullName}</Link></li>)}</ul>
    <Link to="/admin/students/99">Open a missing student (99)</Link></div>;
}

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let ignore = false;
    setStudent(null); setError("");
    api.getById(id).then(s => !ignore && setStudent(s)).catch(e => !ignore && setError(e.message));
    return () => { ignore = true; };
  }, [id]);
  if (error) return <div><p style={{ color: "crimson" }}>{error}</p><button onClick={() => navigate(-1)}>Back</button></div>;
  if (!student) return <p>Loading student {id}...</p>;
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: 12 }}>
      <h3>{student.fullName}</h3>
      <p>useParams() = {JSON.stringify({ id })}</p>
      <p>{student.email} | {student.course} | Marks {student.marks}</p>
      <button onClick={() => navigate(-1)}>Back</button>{" "}
      {student.id < STUDENTS.length && <button onClick={() => navigate("/admin/students/" + (student.id + 1))}>Next student</button>}
    </div>
  );
}

const routes = [
  { path: "/admin", element: <AdminLayout />, children: [
    { index: true, element: <DashboardHome /> },
    { path: "students", element: <StudentList /> },
    { path: "students/:id", element: <StudentDetails /> },
  ] },
  { path: "*", element: <h3 style={{ padding: 16 }}>404</h3> },
];

function App() {
  const [stack, setStack] = useState(["/admin"]);
  const path = stack[stack.length - 1];
  const go = to => setStack(s => [...s, to]);
  const back = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
  return (
    <Nav.Provider value={{ path, go, back }}>
      <div style={{ fontFamily: "Segoe UI, sans-serif" }}>
        <code style={{ display: "block", background: "#eee", padding: 6 }}>localhost:5173{path}</code>
        {renderRoutes(routes, path)}
      </div>
    </Nav.Provider>
  );
}`,
      },
      result: 'URL bar "localhost:5173/admin", a dark sidebar (Dashboard highlighted) and "Dashboard / Total students: 3 / Average marks: 65". Students lists three links; clicking Meena Shah shows "Loading student 3..." then her card with useParams() = {"id":"3"}. Back returns to the list. The link for 99 shows "404: Student 99 not found".',
      explanation:
        'AdminLayout renders once and keeps the sidebar; the matched child (index, list or details) is injected through <Outlet />. The :id segment becomes { id: "3" } (a string). StudentDetails depends on [id], so "Next student" re-fetches even though the same component stays mounted.',
    },
    {
      title: 'Create and Edit pages that navigate after saving',
      scenario: 'One StudentForm component serves /admin/students/new (POST) and /admin/students/:id/edit (PUT). After saving it navigates to the list and passes a flash message in navigation state.',
      steps: [
        'Create src/pages/admin/StudentForm.jsx',
        'If useParams() has an id, load the student and use PUT; otherwise POST',
        'After success call navigate("/admin/students", { state: { message } })',
        'In StudentList read useLocation().state?.message and show an alert',
      ],
      code: `// API endpoints used (Day 89)
// GET  /api/students/{id}   -> 200 StudentResponseDto | 404
// POST /api/students        -> 201 Created
// PUT  /api/students/{id}   -> 204 No Content | 404

// src/pages/admin/StudentForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;
const empty = { fullName: "", email: "", course: "C#", marks: 0 };

export default function StudentForm() {
  const { id } = useParams();            // undefined on /new
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!isEdit) return;
    fetch(API + "/students/" + id).then(r => r.json()).then(setForm);
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(API + "/students" + (isEdit ? "/" + id : ""), {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, marks: Number(form.marks) }),
    });
    if (!res.ok) return alert("Save failed: " + res.status);
    navigate("/admin/students", { state: { message: isEdit ? "Student updated" : "Student created" } });
  }

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form onSubmit={handleSubmit}>
      <h3>{isEdit ? "Edit student #" + id : "New student"}</h3>
      <input name="fullName" value={form.fullName} onChange={change} className="form-control mb-2" />
      <input name="email" value={form.email} onChange={change} className="form-control mb-2" />
      <input name="marks" type="number" value={form.marks} onChange={change} className="form-control mb-2" />
      <button className="btn btn-success me-2">Save</button>
      <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
    </form>
  );
}

// in StudentList.jsx
import { useLocation } from "react-router-dom";
const { state } = useLocation();
{state?.message && <div className="alert alert-success">{state.message}</div>}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

// Fake API
let db = [
  { id: 1, fullName: "Asha Patil", course: "C#", marks: 87 },
  { id: 2, fullName: "Ravi Kumar", course: "React", marks: 35 },
];
const delay = v => new Promise(r => setTimeout(() => r(v), 300));
const api = {
  list: () => delay(db.map(s => ({ ...s }))),
  get: id => delay({ ...db.find(s => s.id === Number(id)) }),
  create: dto => { const s = { ...dto, id: Math.max(0, ...db.map(x => x.id)) + 1 }; db = [...db, s]; return delay({ status: 201 }); },
  update: (id, dto) => { db = db.map(s => (s.id === Number(id) ? { ...dto, id: Number(id) } : s)); return delay({ status: 204 }); },
};

// Simplified navigation: location = { path, params, state }
function StudentList({ location, navigate }) {
  const [list, setList] = useState(null);
  useEffect(() => { api.list().then(setList); }, []);
  return (
    <div>
      {location.state?.message && <p style={{ background: "#d1e7dd", padding: 8 }}>{location.state.message}</p>}
      <h3>Students <button onClick={() => navigate({ path: "/admin/students/new" })}>+ New</button></h3>
      {!list ? <p>Loading...</p> : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
          <tbody>{list.map(s => (
            <tr key={s.id}><td>{s.id}</td><td>{s.fullName}</td><td>{s.course}</td><td>{s.marks}</td>
              <td><button onClick={() => navigate({ path: "/admin/students/" + s.id + "/edit", params: { id: String(s.id) } })}>Edit</button></td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function StudentForm({ params, navigate }) {
  const id = params.id;
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ fullName: "", course: "C#", marks: 0 });
  const [loading, setLoading] = useState(isEdit);
  useEffect(() => { if (isEdit) api.get(id).then(s => { setForm(s); setLoading(false); }); }, [id, isEdit]);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    const dto = { fullName: form.fullName, course: form.course, marks: Number(form.marks) };
    if (isEdit) await api.update(id, dto); else await api.create(dto);
    navigate({ path: "/admin/students", state: { message: isEdit ? "Student updated (204 No Content)" : "Student created (201 Created)" } });
  }
  if (loading) return <p>Loading student {id}...</p>;
  return (
    <form onSubmit={submit}>
      <h3>{isEdit ? "Edit student #" + id : "New student"}</h3>
      <input name="fullName" value={form.fullName} onChange={change} placeholder="Full name" required /><br />
      <select name="course" value={form.course} onChange={change}><option>C#</option><option>React</option><option>SQL Server</option></select><br />
      <input name="marks" type="number" value={form.marks} onChange={change} /><br />
      <button>Save</button> <button type="button" onClick={() => navigate(-1)}>Cancel</button>
    </form>
  );
}

function App() {
  const [history, setHistory] = useState([{ path: "/admin/students", params: {} }]);
  const location = history[history.length - 1];
  const navigate = to => setHistory(h => (to === -1 ? (h.length > 1 ? h.slice(0, -1) : h) : [...h, { params: {}, ...to }]));
  const page = location.path === "/admin/students"
    ? <StudentList key={history.length} location={location} navigate={navigate} />
    : <StudentForm key={history.length} params={location.params} navigate={navigate} />;
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <code style={{ display: "block", background: "#eee", padding: 6, marginBottom: 10 }}>localhost:5173{location.path}</code>
      {page}
    </div>
  );
}`,
      },
      result: 'The list shows Asha Patil and Ravi Kumar. Edit on Ravi changes the URL to /admin/students/2/edit and fills the form; changing marks to 55 and Save returns to the list with a green "Student updated (204 No Content)" and 55 in the table. + New, filling a name and Save adds student 3 with "Student created (201 Created)". Cancel goes back without saving.',
      explanation:
        'One form component checks whether an id param exists to choose PUT or POST. After the API call succeeds, navigate moves to the list and passes state; the list reads it from location.state (useLocation in real code). The flash message disappears on the next navigation because the state belongs to that history entry only.',
    },
    {
      title: 'Second-level nesting: student tabs with Outlet context and two params',
      scenario: 'The student details page has tabs (Profile, Marks) as nested routes /admin/students/:id/profile and /admin/students/:id/marks. The parent loads the student once and shares it with the tabs through <Outlet context>. The marks tab also reads a second param :term.',
      steps: [
        'Make students/:id a layout route (StudentShell) with its own <Outlet />',
        'Add child routes: index -> Navigate to "profile", "profile", "marks/:term"',
        'Load the student in StudentShell and pass it with <Outlet context={{ student }} />',
        'In the tabs use useOutletContext() and useParams() (child sees both :id and :term)',
      ],
      code: `// App.jsx (inside the /admin layout route)
<Route path="students/:id" element={<StudentShell />}>
  <Route index element={<Navigate to="profile" replace />} />
  <Route path="profile" element={<ProfileTab />} />
  <Route path="marks/:term" element={<MarksTab />} />
</Route>

// src/pages/admin/StudentShell.jsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import api from "../../api/axiosClient";

export default function StudentShell() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  useEffect(() => { api.get("/students/" + id).then(r => setStudent(r.data)); }, [id]);
  if (!student) return <p>Loading...</p>;
  const tab = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
  return (
    <>
      <h3>{student.fullName}</h3>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><NavLink to="profile" className={tab}>Profile</NavLink></li>
        <li className="nav-item"><NavLink to="marks/term1" className={tab}>Term 1</NavLink></li>
        <li className="nav-item"><NavLink to="marks/term2" className={tab}>Term 2</NavLink></li>
      </ul>
      <Outlet context={{ student }} />
    </>
  );
}

// src/pages/admin/MarksTab.jsx
import { useOutletContext, useParams } from "react-router-dom";
export default function MarksTab() {
  const { student } = useOutletContext();
  const { id, term } = useParams();              // params of all parent routes are visible
  // GET /api/students/{id}/marks?term=term1  (API: [HttpGet("{id:int}/marks")] with [FromQuery] string term)
  return <p>Marks of {student.fullName} (id {id}) for {term}</p>;
}`,
      playground: {
        jsx: `const { useState, useEffect, createContext, useContext } = React;

const OutletCtx = createContext(null);
const useOutletContext = () => useContext(OutletCtx);

const STUDENTS = { 1: { id: 1, fullName: "Asha Patil", email: "asha@test.com", course: "C#" }, 2: { id: 2, fullName: "Ravi Kumar", email: "ravi@test.com", course: "React" } };
const MARKS = { 1: { term1: { "C#": 82, SQL: 75 }, term2: { "C#": 91, SQL: 80 } }, 2: { term1: { React: 30, JS: 41 }, term2: { React: 55, JS: 60 } } };
let loads = 0;
const fakeGetStudent = id => new Promise(r => { loads++; setTimeout(() => r(STUDENTS[id]), 400); });

// URL: /admin/students/:id/<tab>  where tab = "profile" | "marks/term1" | "marks/term2"
function StudentShell({ id, tab, go }) {
  const [student, setStudent] = useState(null);
  useEffect(() => { setStudent(null); fakeGetStudent(id).then(setStudent); }, [id]);   // depends on id only, not tab
  if (!student) return <p>Loading student {id}...</p>;
  const tabs = [["profile", "Profile"], ["marks/term1", "Term 1"], ["marks/term2", "Term 2"]];
  const term = tab.startsWith("marks/") ? tab.split("/")[1] : null;
  return (
    <div>
      <h3 style={{ margin: "8px 0" }}>{student.fullName} <small style={{ color: "#888", fontSize: 12 }}>(API loads so far: {loads})</small></h3>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #ccc", marginBottom: 10 }}>
        {tabs.map(([t, label]) => (
          <button key={t} onClick={() => go(id, t)} style={{ border: "1px solid #ccc", borderBottom: "none", background: tab === t ? "#fff" : "#eee", fontWeight: tab === t ? 700 : 400, padding: "6px 12px", cursor: "pointer" }}>{label}</button>
        ))}
      </div>
      <OutletCtx.Provider value={{ student }}>
        {term ? <MarksTab id={id} term={term} /> : <ProfileTab />}
      </OutletCtx.Provider>
    </div>
  );
}
function ProfileTab() {
  const { student } = useOutletContext();
  return <p>Email: {student.email} | Course: {student.course}</p>;
}
function MarksTab({ id, term }) {
  const { student } = useOutletContext();
  const m = MARKS[id][term];
  return <div><p>useParams() = {JSON.stringify({ id: String(id), term })}</p>
    <ul>{Object.entries(m).map(([sub, v]) => <li key={sub}>{sub}: {v}</li>)}</ul>
    <p>Total for {student.fullName}: {Object.values(m).reduce((a, b) => a + b, 0)}</p></div>;
}

function App() {
  const [loc, setLoc] = useState({ id: 1, tab: "profile" });
  const go = (id, tab) => setLoc({ id, tab });
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <code style={{ display: "block", background: "#eee", padding: 6 }}>localhost:5173/admin/students/{loc.id}/{loc.tab}</code>
      <p>Open: <button onClick={() => go(1, "profile")}>Student 1</button> <button onClick={() => go(2, "profile")}>Student 2</button></p>
      <StudentShell id={loc.id} tab={loc.tab} go={go} />
    </div>
  );
}`,
      },
      result: 'URL /admin/students/1/profile: "Asha Patil (API loads so far: 1)" with tabs Profile, Term 1, Term 2 and "Email: asha@test.com | Course: C#". Clicking Term 2 changes the URL to /admin/students/1/marks/term2 and shows useParams() = {"id":"1","term":"term2"}, C#: 91, SQL: 80, Total 171, while the load counter stays at 1. Clicking Student 2 loads again (counter 2) and shows Ravi Kumar.',
      explanation:
        'The shell loads the student once per id; switching tabs only changes the child route, so no new API call happens. The tabs read the shared student through Outlet context (useOutletContext) instead of fetching it again, and a child route sees the params of all its parent routes (id and term). The playground passes id/term as props where real code uses useParams().',
    },
  ],
  interview: [
    { q: 'What is a nested route?', a: 'A <Route> declared inside another <Route>. The child path is relative to the parent and the child renders inside the parent element\'s <Outlet>.', level: 'Easy' },
    { q: 'What does <Outlet /> do?', a: 'It is the placeholder in a parent/layout component where the matched child route\'s element is rendered, similar to @RenderBody() in an MVC layout.', level: 'Easy' },
    { q: 'What is an index route?', a: 'A child route with the index prop and no path. It renders in the parent Outlet when the URL exactly equals the parent path, e.g. the dashboard home at /admin.', level: 'Medium' },
    { q: 'What type does useParams return for :id?', a: 'Always strings (or undefined). Convert with Number(id) when comparing with numeric ids.', level: 'Medium' },
    { q: 'Why must id be in the useEffect dependency array in a details page?', a: 'Moving from /students/1 to /students/2 reuses the same component instance; without [id] the effect would not re-run and the old student would stay on screen.', level: 'Hard' },
    { q: 'useNavigate vs <Navigate>?', a: 'useNavigate returns a function for event handlers/effects (after save, cancel). <Navigate> is a component that redirects during render (e.g. not logged in).', level: 'Medium' },
    { q: 'What does navigate(-1) do?', a: 'Same as the browser Back button: goes one entry back in history.', level: 'Easy' },
    { q: 'How do you pass data while navigating without the URL?', a: 'navigate(path, { state: {...} }) and read it with useLocation().state. It is lost on a new tab/bookmark, so use params or query strings for data that must survive.', level: 'Medium' },
    { q: 'How can a layout share data with its child routes?', a: 'Use <Outlet context={value} /> in the layout and useOutletContext() in the child, or a React Context.', level: 'Hard' },
    { q: 'How does a React route like /admin/students/:id relate to the .NET API?', a: 'The React route is the page URL; inside it the component calls the API route GET /api/students/{id} ([HttpGet("{id:int}")]) with the same id.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a Courses section to the admin layout with /admin/courses and /admin/courses/:courseId.',
      hint: 'Two more child routes and one more NavLink.',
      solution: `<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<DashboardHome />} />
  <Route path="courses" element={<CourseList />} />
  <Route path="courses/:courseId" element={<CourseDetails />} />
</Route>
// CourseDetails: const { courseId } = useParams();`,
    },
    {
      task: 'After a successful DELETE /api/students/{id} on the details page, go back to the list.',
      hint: 'await fetch with method DELETE, then navigate.',
      solution: `async function remove() {
  if (!confirm("Delete this student?")) return;
  const res = await fetch(API + "/students/" + id, { method: "DELETE" });
  if (res.status === 204) navigate("/admin/students", { state: { message: "Deleted" } });
}`,
    },
    {
      task: 'Pass the logged-in admin name from AdminLayout to children with Outlet context.',
      hint: 'useOutletContext in the child.',
      solution: `// AdminLayout
<Outlet context={{ adminName: "Priya" }} />
// DashboardHome
const { adminName } = useOutletContext();
return <h3>Welcome {adminName}</h3>;`,
    },
    {
      task: 'Show "Select a student" in an index route under /admin/students while the list stays on the left (master-detail).',
      hint: 'Make students a layout route with its own Outlet.',
      solution: `<Route path="students" element={<StudentsLayout />}>   {/* list + <Outlet /> */}
  <Route index element={<p>Select a student</p>} />
  <Route path=":id" element={<StudentDetails />} />
</Route>`,
    },
  ],
  quiz: [
    { question: 'Where does a child route render?', options: ['At the top of the page', 'In the parent element\'s <Outlet />', 'In a new tab', 'Inside <BrowserRouter> only'], answer: 1, explanation: 'Outlet marks the child position.' },
    { question: 'For path "students/:id" and URL /admin/students/5, useParams() returns...', options: ['{ id: "5" }', '{ id: 5 }', '"5"', '{ students: 5 }'], answer: 0, explanation: 'Params are an object of strings.' },
    { question: 'Which route renders at exactly /admin inside the admin layout?', options: ['path="*"', 'path="/"', 'The index route', 'path="admin/*"'], answer: 2, explanation: 'An index route renders at the parent path.' },
    { question: 'Which call goes back one page?', options: ['navigate("..", -1)', 'navigate("back")', 'useBack()', 'navigate(-1)'], answer: 3, explanation: 'navigate(-1) moves back in history.' },
    { question: 'Where should you call navigate() after saving?', options: ['Directly in the component body during render', 'In the submit handler after the API call succeeds', 'In the CSS', 'In main.jsx'], answer: 1, explanation: 'Navigate in handlers/effects, never during render.' },
  ],
};
