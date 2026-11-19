export default {
  lesson: 'day-104-nested-routes-outlet-params',
  minutes: 32,
  intro: 'Build layouts with nested routes and <Outlet />, read URL parameters with useParams and navigate in code with useNavigate.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'In the `DashboardLayout` component, complete the element where the matched **child** route is rendered:\n```\nfunction DashboardLayout() {\n  return (\n    <div className="layout">\n      <Sidebar />\n      <main><______ /></main>\n    </div>\n  );\n}\n```',
      example: { title: 'the nested routes', code: '<Route path="/dashboard" element={<DashboardLayout />}>\n  <Route index element={<Overview />} />\n  <Route path="students" element={<Students />} />\n</Route>' },
      accept: ['Outlet'],
      caseSensitive: true,
      explain: '`<Outlet />` is the placeholder for the child route, like `@RenderBody()` in a Razor layout. The sidebar stays mounted while only the outlet content changes.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The URL is `/students/42/marks`. What does the component print? (Type the rendered text.)',
      example: { title: 'reading a param', code: '// route: /orders/:orderId\nconst { orderId } = useParams(); // "15" for /orders/15' },
      code: `// <Route path="/students/:id/:tab" element={<StudentPage />} />
function StudentPage() {
  const { id, tab } = useParams();
  const next = id + 1;
  return <p>{tab} of student {id}, next {next}, typeof {typeof id}</p>;
}`,
      expected: 'marks of student 42, next 421, typeof string',
      explain: 'URL params are **always strings**. `"42" + 1` concatenates to "421". Convert with `Number(id)` before maths or before comparing with numeric ids from your API (`s.id === Number(id)`).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'After saving a new student successfully, how do you go to `/students` from inside the submit handler?',
      options: ['window.location = "/students"', 'const navigate = useNavigate(); ... navigate("/students");', 'return <Link to="/students" />;', 'history.back()'],
      answer: 1,
      explain: '`useNavigate()` returns a function for **programmatic navigation** (after submit, after login). Setting `window.location` reloads the whole SPA; returning a Link from a handler does nothing.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**How params are matched.** Write `matchPath(pattern, url)` that returns an object of params when the URL matches, else `null`. Segments starting with `:` are params; others must match exactly; segment counts must be equal.\n\n`matchPath("/students/:id/:tab", "/students/42/marks")` → `{ id: "42", tab: "marks" }`',
      example: { title: 'splitting both paths', code: 'const a = pattern.split("/").filter(Boolean);\nconst b = url.split("/").filter(Boolean);' },
      starter: 'function matchPath(pattern, url) {\n  // TODO\n}\n',
      solution: 'function matchPath(pattern, url) {\n  const a = pattern.split("/").filter(Boolean);\n  const b = url.split("/").filter(Boolean);\n  if (a.length !== b.length) return null;\n  const params = {};\n  for (let i = 0; i < a.length; i++) {\n    if (a[i].startsWith(":")) params[a[i].slice(1)] = b[i];\n    else if (a[i] !== b[i]) return null;\n  }\n  return params;\n}\n',
      tests: [
        { call: 'matchPath("/students/:id/:tab", "/students/42/marks")', expect: { id: '42', tab: 'marks' } },
        { call: 'matchPath("/students/:id", "/courses/5")', expect: null },
        { call: 'matchPath("/students/:id", "/students/5/edit")', expect: null },
        { call: 'matchPath("/about", "/about")', expect: {} },
      ],
      explain: 'This is the core of route matching: static segments must be equal, dynamic `:segments` capture values (as strings), and the result is exactly what `useParams()` returns.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 10,
      q: '**Master-detail with a param.** Using a tiny router in state (`path` starts at `/students`): `/students` shows a `<ul id="list">` of links `<a href="/students/1">Asha</a>` etc.; `/students/:id` shows `<div id="detail">` with `<h2>` name and `<p>` city of that student (find by `Number(id)`), plus a `<button id="back">` that navigates back to `/students`.\n\n(The grader clicks Ravi.)',
      example: { title: 'getting the id from the path', code: 'const m = path.match(/^\\/students\\/(\\d+)$/);\nconst id = m ? Number(m[1]) : null;' },
      starter: 'const { useState } = React;\nconst students = [\n  { id: 1, name: "Asha", city: "Pune" },\n  { id: 2, name: "Ravi", city: "Nagpur" },\n  { id: 3, name: "Meera", city: "Mumbai" },\n];\n\nfunction App() {\n  const [path, setPath] = useState("/students");\n  // TODO: list page and detail page\n  return <div></div>;\n}\n',
      solution: 'const { useState } = React;\nconst students = [\n  { id: 1, name: "Asha", city: "Pune" },\n  { id: 2, name: "Ravi", city: "Nagpur" },\n  { id: 3, name: "Meera", city: "Mumbai" },\n];\n\nfunction App() {\n  const [path, setPath] = useState("/students");\n  const go = (to) => (e) => { if (e) e.preventDefault(); setPath(to); };\n  const m = path.match(/^\\/students\\/(\\d+)$/);\n  if (m) {\n    const s = students.find((x) => x.id === Number(m[1]));\n    return (\n      <div id="detail">\n        <h2>{s ? s.name : "Not found"}</h2>\n        {s && <p>{s.city}</p>}\n        <button id="back" onClick={go("/students")}>Back</button>\n      </div>\n    );\n  }\n  return (\n    <ul id="list">\n      {students.map((s) => (\n        <li key={s.id}><a href={"/students/" + s.id} onClick={go("/students/" + s.id)}>{s.name}</a></li>\n      ))}\n    </ul>\n  );\n}\n',
      actions: [{ click: '#list a[href="/students/2"]' }],
      checks: [
        { sel: '#detail h2', textEq: 'Ravi', msg: 'Clicking Ravi must show his detail page with <h2>Ravi</h2>' },
        { sel: '#detail p', textEq: 'Nagpur', msg: 'The detail page must show the city Nagpur' },
        { sel: '#back', min: 1, msg: 'Add a #back button' },
      ],
      explain: 'This is the typical list → `/students/:id` → details flow. In React Router you would write `<Route path="/students/:id" element={<StudentDetail />} />` and read `useParams().id`, then load `/api/students/{id}`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about nested routes are TRUE? (choose all that apply)',
      options: [
        'A child route path like "students" is relative to its parent ("/dashboard/students")',
        'An index route renders at the parent path itself (e.g. /dashboard)',
        'The parent element must render <Outlet /> or children will not appear',
        'Nested routes require a separate BrowserRouter for each level',
        'useNavigate(-1) style calls (navigate(-1)) go back in history',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Nested routes share a layout through `<Outlet />`, child paths are relative and `index` marks the default child. One `BrowserRouter` at the top is enough. `navigate(-1)` acts like the browser Back button.',
    },
  ],
};
