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
('Priya Sharma', 'priya@gmail.com', 'Java', 79),
('Kiran Joshi', 'kiran@yahoo.com', 'Python', 58);`;

export default {
  lesson: 'day-20-student-management-project',
  minutes: 30,
  intro: 'Revise the whole Advanced Java course through the Student Management System: search, reports, validation, filters and redirects.',
  tasks: [
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'The **search box** finds students whose **name or email contains** the typed text. Write the query for the keyword `sh`, returning `id`, `name`, `email`, sorted by `name`.',
      example: { title: 'contains search', code: "SELECT * FROM books WHERE title LIKE '%java%' OR author LIKE '%java%';" },
      setup: STUDENTS,
      starter: '-- SELECT id, name, email FROM students WHERE ...\n',
      solution: "SELECT id, name, email FROM students WHERE name LIKE '%sh%' OR email LIKE '%sh%' ORDER BY name;",
      ordered: true,
      explain: "`LIKE '%sh%'` means \"contains sh\" (Asha, Priya Sharma, Kiran Joshi). In the DAO this is `WHERE name LIKE ? OR email LIKE ?` with `ps.setString(1, \"%\" + keyword + \"%\")`: the % signs go in the **value**, not around the `?`.",
    },
    {
      type: 'code',
      lang: 'mysql',
      mins: 4,
      q: 'The dashboard shows a report: for each `course`, the number of students (`total`) and the average marks (`avg_marks`, rounded to 1 decimal), courses A→Z.',
      example: { title: 'group report', code: 'SELECT city, COUNT(*) AS customers, ROUND(AVG(amount), 1) AS avg_amount\nFROM orders GROUP BY city ORDER BY city;' },
      setup: STUDENTS,
      starter: '-- SELECT course, ... FROM students GROUP BY ...\n',
      solution: 'SELECT course, COUNT(*) AS total, ROUND(AVG(marks), 1) AS avg_marks FROM students GROUP BY course ORDER BY course;',
      ordered: true,
      explain: 'GROUP BY makes one row per course; COUNT and AVG work inside each group. The DAO maps each row to a small `CourseStats` object, the controller puts the list in the request and the JSP prints it with `c:forEach`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The controller validates a submitted student before saving. The form sent: name = `"  Asha "`, email = `"asha.gmail.com"`, marks = `"105"`. What is printed?',
      example: { title: 'collecting errors', code: 'Map<String, String> errors = new LinkedHashMap<>();\nif (city == null || city.isBlank()) errors.put("city", "City is required");' },
      code: `Map<String, String> errors = new LinkedHashMap<>();
if (name == null || name.trim().isEmpty()) errors.put("name", "Name is required");
if (email == null || !email.contains("@")) errors.put("email", "Invalid email");
int m = Integer.parseInt(marks);
if (m < 0 || m > 100) errors.put("marks", "Marks must be 0-100");

System.out.println("Errors: " + errors.size());
for (Map.Entry<String, String> e : errors.entrySet()) {
    System.out.println(e.getKey() + ": " + e.getValue());
}`,
      expected: 'Errors: 2\nemail: Invalid email\nmarks: Marks must be 0-100',
      explain: '"  Asha " is not empty after `trim()`, so the name is valid. The email has no @ and 105 is above 100. `LinkedHashMap` keeps insertion order, so the errors print in form order. The controller then forwards back to the form with `errors` (and the typed values) as request attributes.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Every page under `/students` must require login. Where is the cleanest place for that check?',
      options: ['In every JSP with a scriptlet', 'In an AuthFilter mapped to /students/*', 'In the StudentDao', 'In a ServletContextListener'],
      answer: 1,
      explain: 'A **Filter** runs before every matching request, so one class protects all pages (including ones added later). The DAO should only talk to the database, and listeners react to events, not to individual requests.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'After the "Add Student" POST succeeds, complete the line that follows the Post/Redirect/Get pattern:\n`response.____(request.getContextPath() + "/students?action=list");`',
      example: { title: 'forward (for showing the form again with errors)', code: 'request.getRequestDispatcher("/WEB-INF/views/student-form.jsp").forward(request, response);' },
      accept: ['sendRedirect'],
      caseSensitive: true,
      explain: '`sendRedirect` makes the browser load the list with a fresh GET, so refresh does not insert the student again. Prefix with `getContextPath()` so the URL works whatever name the app is deployed under.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Interview revision: which statements are TRUE? (choose all that apply)',
      options: [
        'One servlet instance handles many requests on multiple threads',
        'PreparedStatement prevents SQL injection',
        'A connection pool such as HikariCP reuses database connections',
        'sendRedirect keeps request attributes',
        'ServletContext is shared by the whole application, HttpSession by one user',
        'A JSP is translated into a servlet',
      ],
      answers: [0, 1, 2, 4, 5],
      explain: 'sendRedirect starts a **new request**, so request attributes are lost; use forward to keep them or the session to carry data across the redirect. The other five statements are classic interview answers you should be able to explain with an example.',
    },
  ],
};
