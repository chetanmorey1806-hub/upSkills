export default {
  lesson: 'day-13-filters-listeners',
  minutes: 25,
  intro: 'Write and order filters that run before and after servlets, and pick the right listener for application and session events.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line inside `doFilter` that passes the request on to the next filter (or to the servlet):\n`chain.____(request, response);`',
      example: { title: 'a filter skeleton', code: '@WebFilter("/*")\npublic class LogFilter implements Filter {\n  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)\n      throws IOException, ServletException {\n    // before\n    // pass on\n    // after\n  }\n}' },
      accept: ['doFilter', 'doFilter(request, response)', 'doFilter(request, response);'],
      caseSensitive: true,
      explain: '`chain.doFilter(request, response)` continues the chain. Code written **before** it runs on the way in, code **after** it runs on the way out (after the servlet). Forgetting this call means the servlet never runs and the user sees a blank page.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Two filters are declared in web.xml in this order: **LogFilter**, then **AuthFilter** (both mapped to `/*`). The user is logged in and requests `/students`. What is printed?',
      example: { title: 'the chain is like nested calls', text: 'Filter A → Filter B → Servlet, and then back out: B finishes, then A finishes.' },
      code: `// LogFilter
System.out.println("Log before");
chain.doFilter(req, res);
System.out.println("Log after");

// AuthFilter
System.out.println("Auth before");
chain.doFilter(req, res);
System.out.println("Auth after");

// StudentServlet
System.out.println("Servlet");`,
      expected: 'Log before\nAuth before\nServlet\nAuth after\nLog after',
      explain: 'Filters wrap each other like layers of an onion: the first filter in `<filter-mapping>` order runs first on the way in and **last** on the way out. (With only `@WebFilter` annotations the order is not guaranteed, so use web.xml when order matters.)',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Same setup, but now the user is **not** logged in, so AuthFilter redirects instead of continuing. What is printed?',
      example: { title: 'blocking a request', code: 'if (session == null) {\n  response.sendRedirect("login.jsp");\n  return; // do NOT call chain.doFilter\n}' },
      code: `// LogFilter
System.out.println("Log before");
chain.doFilter(req, res);
System.out.println("Log after");

// AuthFilter
HttpSession s = ((HttpServletRequest) req).getSession(false);
if (s == null || s.getAttribute("user") == null) {
    System.out.println("Auth: blocked");
    ((HttpServletResponse) res).sendRedirect("login.jsp");
    return;
}
chain.doFilter(req, res);

// StudentServlet
System.out.println("Servlet");`,
      expected: 'Log before\nAuth: blocked\nLog after',
      explain: 'AuthFilter returns **without** calling `chain.doFilter`, so the servlet never runs. Control goes back to LogFilter, which still prints "Log after". This is exactly how a login filter protects every page with one piece of code.',
    },
    {
      type: 'code',
      lang: 'express',
      mins: 8,
      q: '**The same idea in JavaScript (Express middleware = Servlet Filter).** Add a filter-like middleware so that:\n- every URL starting with `/admin` requires the header `x-token: secret123`; otherwise respond **401** with `{ "error": "Login required" }` and do NOT call the route\n- `/public` stays open to everyone\n- with the right token, `/admin/report` returns the normal JSON',
      example: { title: 'middleware shape', code: 'app.use("/shop", (req, res, next) => {\n  if (req.headers["x-shop-open"] !== "yes") {\n    return res.status(403).json({ error: "Closed" });\n  }\n  next(); // like chain.doFilter(req, res)\n});' },
      starter: 'const express = require("express");\nconst app = express();\n\n// TODO: auth middleware for /admin\n\napp.get("/public", (req, res) => res.json({ page: "public" }));\napp.get("/admin/report", (req, res) => res.json({ report: "ok" }));\n\napp.listen(3000);\n',
      solution: 'const express = require("express");\nconst app = express();\n\napp.use("/admin", (req, res, next) => {\n  if (req.headers["x-token"] !== "secret123") {\n    return res.status(401).json({ error: "Login required" });\n  }\n  next();\n});\n\napp.get("/public", (req, res) => res.json({ page: "public" }));\napp.get("/admin/report", (req, res) => res.json({ report: "ok" }));\n\napp.listen(3000);\n',
      tests: [
        { name: 'No token → 401', steps: [{ method: 'GET', url: '/admin/report', expect: { status: 401, json: { error: 'Login required' } } }] },
        { name: 'Wrong token → 401', steps: [{ method: 'GET', url: '/admin/report', headers: { 'x-token': 'abc' }, expect: { status: 401 } }] },
        { name: 'Right token → 200', steps: [{ method: 'GET', url: '/admin/report', headers: { 'x-token': 'secret123' }, expect: { status: 200, json: { report: 'ok' } } }] },
        { name: '/public is open', steps: [{ method: 'GET', url: '/public', expect: { status: 200, json: { page: 'public' } } }] },
      ],
      explain: '`next()` is Express\'s `chain.doFilter()`, and returning early without calling it blocks the request, just like a Java filter that does not continue the chain. Mounting with `app.use("/admin", ...)` is the same as mapping a filter to `/admin/*`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match listeners to events. Which pairs are CORRECT? (choose all that apply)',
      options: [
        'ServletContextListener → the application starts or stops (contextInitialized / contextDestroyed)',
        'HttpSessionListener → a session is created or destroyed (count online users)',
        'ServletRequestListener → each request starts and ends',
        'HttpSessionListener → the application starts',
        'ServletContextListener → a user logs in',
      ],
      answers: [0, 1, 2],
      explain: 'ServletContextListener is ideal for creating the connection pool on startup and closing it on shutdown. HttpSessionListener fires on session create/destroy, which is how "users online" counters work. Attribute listeners (e.g. HttpSessionAttributeListener) react to setAttribute/removeAttribute.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which job is best done in a **Filter** rather than in each servlet?',
      options: [
        'Calculating one student\'s fees',
        'Setting request.setCharacterEncoding("UTF-8") and checking login for every page',
        'Rendering the HTML table of students',
        'Creating the students table',
      ],
      answer: 1,
      explain: 'Filters handle **cross-cutting** work that applies to many URLs: encoding, login checks, logging, timing, compression. Page-specific logic stays in the servlet and HTML in the JSP.',
    },
  ],
};
