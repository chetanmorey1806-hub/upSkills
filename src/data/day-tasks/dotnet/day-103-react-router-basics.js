export default {
  lesson: 'day-103-react-router-basics',
  minutes: 30,
  intro: 'Add client-side routing with React Router: BrowserRouter, Routes, Route, Link, a 404 route and redirects with Navigate.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the route that shows the `Students` component at `/students`:\n`<Route path="/students" ______={<Students />} />`',
      example: { title: 'the home route', code: '<Route path="/" element={<Home />} />' },
      accept: ['element'],
      caseSensitive: true,
      explain: 'In React Router v6 each `<Route>` takes `path` and `element` (a JSX element, not a component reference). All routes live inside `<Routes>`, which renders the best match.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why use `<Link to="/courses">` instead of `<a href="/courses">` inside a React Router app?',
      options: [
        'Link is styled automatically',
        'Link changes the URL with the History API without reloading the page, so state is kept and no new HTML is downloaded',
        '<a> tags are not allowed in JSX',
        'Link makes the page load from the server faster',
      ],
      answer: 1,
      explain: 'A plain `<a>` makes the browser request a new page: the whole SPA restarts and all state is lost. `Link` renders an `<a>` but intercepts the click and updates the route in place.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Which component renders for each URL? Type the component name, one per line:\n1. `/`\n2. `/courses`\n3. `/admin`\n4. `/contact-us`',
      example: { title: 'a catch-all route', code: '<Route path="*" element={<NotFound />} />' },
      code: `<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/courses" element={<Courses />} />
  <Route path="/admin" element={<Navigate to="/login" replace />} />
  <Route path="/login" element={<Login />} />
  <Route path="*" element={<NotFound />} />
</Routes>`,
      expected: `Home
Courses
Login
NotFound`,
      explain: '`/admin` renders `<Navigate>`, which immediately redirects to `/login` (`replace` swaps the history entry, so Back does not loop). `path="*"` matches anything not matched by other routes - the 404 page.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'The whole app (or the part using routes) must be wrapped in <BrowserRouter>',
        'npm install react-router-dom adds React Router to a Vite project',
        'Route order inside <Routes> decides the winner in v6 (first match wins)',
        'The server (IIS / Azure) must return index.html for unknown paths so deep links like /courses work after refresh',
        'NavLink can style the active link',
      ],
      answers: [0, 1, 3, 4],
      explain: 'v6 ranks routes by **specificity**, not order. Because routing happens in the browser, a refresh on /courses asks the server for /courses - configure a fallback to index.html (e.g. `app.MapFallbackToFile("index.html")` in ASP.NET Core).',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 10,
      q: '**Build a tiny router** (React Router cannot load in this sandbox, so build the same idea with state). `App` keeps `path` state (start `"/"`).\n- `Link({ to, navigate, children })` renders `<a href={to}>` and on click calls `preventDefault()` and `navigate(to)`\n- routes: `/` → `<h1>Home</h1>`, `/students` → `<h1>Students</h1>`, `/courses` → `<h1>Courses</h1>`, anything else → `<h1>404 Not Found</h1>`\n- render a `<nav>` with links to `/`, `/students`, `/courses`, `/xyz` and the page inside `<main>`\n\n(The grader clicks Students.)',
      example: { title: 'what the real thing looks like', code: '<BrowserRouter>\n  <nav><Link to="/">Home</Link></nav>\n  <Routes>\n    <Route path="/" element={<Home />} />\n    <Route path="*" element={<NotFound />} />\n  </Routes>\n</BrowserRouter>' },
      starter: 'const { useState } = React;\n\nfunction Link({ to, navigate, children }) {\n  // TODO\n  return <a href={to}>{children}</a>;\n}\n\nfunction App() {\n  // TODO\n  return <main><h1>Home</h1></main>;\n}\n',
      solution: 'const { useState } = React;\n\nfunction Link({ to, navigate, children }) {\n  return <a href={to} onClick={(e) => { e.preventDefault(); navigate(to); }}>{children}</a>;\n}\n\nfunction App() {\n  const [path, setPath] = useState("/");\n  const routes = { "/": <h1>Home</h1>, "/students": <h1>Students</h1>, "/courses": <h1>Courses</h1> };\n  return (\n    <div>\n      <nav>\n        <Link to="/" navigate={setPath}>Home</Link>\n        <Link to="/students" navigate={setPath}>Students</Link>\n        <Link to="/courses" navigate={setPath}>Courses</Link>\n        <Link to="/xyz" navigate={setPath}>Broken</Link>\n      </nav>\n      <main>{routes[path] || <h1>404 Not Found</h1>}</main>\n    </div>\n  );\n}\n',
      actions: [{ click: 'nav a[href="/students"]' }],
      checks: [
        { sel: 'nav a', count: 4, msg: 'Render 4 links in the nav' },
        { sel: 'main h1', textEq: 'Students', msg: 'Clicking Students must show the Students page without reloading' },
      ],
      explain: 'This is what `Routes` + `Link` do internally: the current location lives in state, Link prevents the browser navigation, and the router renders the matching element or the `*` fallback.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 8,
      q: '**Redirect with Navigate.** Using the same tiny-router idea, write a `Navigate({ to, navigate })` component that calls `navigate(to)` in a `useEffect` and renders nothing. Routes: `/` → `<h1>Home</h1>`, `/login` → `<h1>Login</h1>`, `/admin` → `<Navigate to="/login" ... />` (the user is not logged in). Show the current path in `<p id="path">`.\n\n(The grader clicks the Admin link.)',
      example: { title: 'the real component', code: 'if (!user) return <Navigate to="/login" replace />;' },
      starter: 'const { useState, useEffect } = React;\n\nfunction Navigate({ to, navigate }) {\n  // TODO\n  return null;\n}\n\nfunction App() {\n  const [path, setPath] = useState("/");\n  const go = (to) => (e) => { e.preventDefault(); setPath(to); };\n  const routes = {\n    "/": <h1>Home</h1>,\n    "/login": <h1>Login</h1>,\n    "/admin": <h1>Admin</h1>, // TODO: redirect to /login instead\n  };\n  return (\n    <div>\n      <nav><a href="/" onClick={go("/")}>Home</a> <a href="/admin" onClick={go("/admin")}>Admin</a></nav>\n      <main>{routes[path]}</main>\n      <p id="path">{path}</p>\n    </div>\n  );\n}\n',
      solution: 'const { useState, useEffect } = React;\n\nfunction Navigate({ to, navigate }) {\n  useEffect(() => { navigate(to); }, [to]);\n  return null;\n}\n\nfunction App() {\n  const [path, setPath] = useState("/");\n  const go = (to) => (e) => { e.preventDefault(); setPath(to); };\n  const routes = {\n    "/": <h1>Home</h1>,\n    "/login": <h1>Login</h1>,\n    "/admin": <Navigate to="/login" navigate={setPath} />,\n  };\n  return (\n    <div>\n      <nav><a href="/" onClick={go("/")}>Home</a> <a href="/admin" onClick={go("/admin")}>Admin</a></nav>\n      <main>{routes[path]}</main>\n      <p id="path">{path}</p>\n    </div>\n  );\n}\n',
      actions: [{ click: 'nav a[href="/admin"]' }, { wait: 150 }],
      checks: [
        { sel: 'main h1', textEq: 'Login', msg: 'Opening /admin must redirect to the Login page' },
        { sel: '#path', textEq: '/login', msg: 'The current path must become /login' },
      ],
      explain: '`<Navigate>` is just a component that changes the location after rendering. It is the building block of **protected routes**: if there is no user, render `<Navigate to="/login" />` instead of the page.',
    },
  ],
};
