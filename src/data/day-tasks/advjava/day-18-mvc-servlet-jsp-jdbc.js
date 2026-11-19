const STUDENTS = `CREATE TABLE students (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(50)  NOT NULL,
  email  VARCHAR(100) NOT NULL UNIQUE,
  course VARCHAR(50)  NOT NULL,
  marks  INT DEFAULT 0
);
INSERT INTO students (name, email, course, marks) VALUES
('Asha Patil', 'asha@gmail.com', 'Java', 88),
('Rohan Mehta', 'rohan@gmail.com', 'Python', 72),
('Sneha Kulkarni', 'sneha@gmail.com', 'Java', 65),
('Arjun Nair', 'arjun@gmail.com', 'MySQL', 91),
('Priya Sharma', 'priya@gmail.com', 'Java', 79);`;

export default {
  lesson: 'day-18-mvc-servlet-jsp-jdbc',
  minutes: 28,
  intro: 'Connect a Servlet controller, a DAO model and JSP views in the MVC (Model 2) architecture.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In MVC with Servlet + JSP + JDBC, what is the job of the **Controller** (StudentController servlet)?',
      options: [
        'Generate the HTML table',
        'Read the request, call the model/DAO, put results in request attributes and choose the view',
        'Store the data permanently',
        'Hold the JDBC driver class',
      ],
      answer: 1,
      explain: '**Model** = Student bean + StudentDao (data and DB access). **View** = JSP with JSTL (display only). **Controller** = servlet that coordinates: reads parameters, calls the DAO, sets attributes and forwards to the right JSP.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **Model 1 vs Model 2** are TRUE? (choose all that apply)',
      options: [
        'In Model 1 the JSP receives the request and also contains the logic',
        'In Model 2 (MVC) every request goes to a controller servlet first',
        'Model 2 keeps SQL out of JSP pages',
        'Model 1 is preferred for large team projects',
        'Spring MVC follows the Model 2 idea with a front controller',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Model 1 (JSP does everything) is quick for tiny apps but becomes spaghetti. Model 2 separates concerns, so designers edit JSPs and developers edit Java independently, and Spring MVC\'s DispatcherServlet is the same pattern.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the forward so the view is protected from direct browser access:\n`request.getRequestDispatcher("/____/views/student-list.jsp").forward(request, response);`',
      example: { title: 'setting data for the view', code: 'request.setAttribute("students", dao.findAll());' },
      accept: ['WEB-INF'],
      caseSensitive: true,
      explain: 'Views under **WEB-INF** cannot be opened by URL, so users must go through the controller, which always loads fresh data. Opening `student-list.jsp` directly would show an empty table because no attribute was set.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: '**The same idea in JavaScript** (not Java): a front controller picks a view from the `action` parameter. Write `resolveView(action)`:\n- `"list"` or missing (`undefined`/`null`/`""`) → `"/WEB-INF/views/student-list.jsp"`\n- `"new"` or `"edit"` → `"/WEB-INF/views/student-form.jsp"`\n- `"delete"` → `"redirect:students?action=list"` (after deleting, redirect to the list)\n- anything else → `"/WEB-INF/views/error.jsp"`',
      example: { title: 'switch in the Java controller', code: 'String action = req.getParameter("action");\nif (action == null) action = "list";\nswitch (action) {\n  case "list" -> listStudents(req, resp);\n  case "new"  -> showForm(req, resp);\n  default     -> resp.sendError(404);\n}' },
      starter: 'function resolveView(action) {\n  // TODO\n}\n',
      solution: 'function resolveView(action) {\n  if (!action) action = "list";\n  switch (action) {\n    case "list": return "/WEB-INF/views/student-list.jsp";\n    case "new":\n    case "edit": return "/WEB-INF/views/student-form.jsp";\n    case "delete": return "redirect:students?action=list";\n    default: return "/WEB-INF/views/error.jsp";\n  }\n}\n',
      tests: [
        { call: 'resolveView("list")', expect: '/WEB-INF/views/student-list.jsp' },
        { call: 'resolveView(undefined)', expect: '/WEB-INF/views/student-list.jsp', msg: 'A missing action should default to the list' },
        { call: 'resolveView("")', expect: '/WEB-INF/views/student-list.jsp', msg: 'An empty action should default to the list' },
        { call: 'resolveView("edit")', expect: '/WEB-INF/views/student-form.jsp' },
        { call: 'resolveView("new")', expect: '/WEB-INF/views/student-form.jsp' },
        { call: 'resolveView("delete")', expect: 'redirect:students?action=list' },
        { call: 'resolveView("hack")', expect: '/WEB-INF/views/error.jsp' },
      ],
      explain: 'One controller, many actions: the controller decides **which** view, the view only displays. Defaulting a missing action to "list" avoids a NullPointerException in Java\'s `switch`, and redirecting after delete follows Post/Redirect/Get.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The DAO returned these students and the controller set them as `students`. What text does the view produce?\n- Asha Patil 88\n- Rohan Mehta 72\n- Arjun Nair 91',
      example: { title: 'loop + condition in a view', code: '<c:forEach items="${products}" var="p">\n  <c:if test="${p.stock == 0}">${p.name} is out of stock</c:if>\n</c:forEach>' },
      code: `<c:forEach items="\${students}" var="s">
  <p>\${s.name}: <c:choose><c:when test="\${s.marks ge 80}">Distinction</c:when><c:otherwise>Pass</c:otherwise></c:choose></p>
</c:forEach>
<p>Total: \${students.size()}</p>`,
      expected: 'Asha Patil: Distinction\nRohan Mehta: Pass\nArjun Nair: Distinction\nTotal: 3',
      explain: 'The view only formats what the controller gave it: `ge` means ≥, so 88 and 91 are Distinction and 72 is Pass. EL 3+ allows method calls like `students.size()` (or use `${fn:length(students)}`).',
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 3,
      q: 'Write the query used by `StudentDao.findByCourse("Java")`: the `id`, `name` and `marks` of Java students, sorted by **name** A→Z.',
      example: { title: 'the DAO query with a placeholder', code: 'SELECT id, name, marks FROM students WHERE course = ? ORDER BY name' },
      setup: STUDENTS,
      starter: '-- SELECT ... FROM students WHERE course = ...\n',
      solution: "SELECT id, name, marks FROM students WHERE course = 'Java' ORDER BY name;",
      ordered: true,
      explain: 'In Java this runs as a PreparedStatement with `?` and `ps.setString(1, course)`; here you put the value in directly. Each row becomes a `Student` object in the DAO and the list goes to the JSP via the controller.',
    },
  ],
};
