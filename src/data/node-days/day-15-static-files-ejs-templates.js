export default {
  id: 'day-15-static-files-ejs-templates',
  title: 'Serving Static Files and Template Engines (EJS)',
  module: 'Module 2: Express.js',
  day: 15,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Not every Express app is a JSON API. Today you serve CSS, images and JavaScript with express.static and render dynamic HTML pages on the server with the EJS template engine – the classic server-side rendering (SSR) approach.',
  objectives: [
    'Serve a public folder with express.static, including virtual prefixes and cache options',
    'Configure a view engine with app.set("view engine", "ejs") and app.set("views", ...)',
    'Use EJS tags <%= %>, <%- %>, <% %> for output, raw HTML, loops and conditions',
    'Reuse layouts with partials (include) and share data via res.locals',
    'Handle HTML forms with express.urlencoded and the Post/Redirect/Get pattern',
  ],
  theory: [
    {
      heading: 'Static files with express.static',
      content: `**Static files** are files sent to the browser exactly as they are on disk: CSS, client-side JS, images, fonts, PDFs, favicon. Express ships the built-in middleware \`express.static(root, options)\` which works like a **shop window**: whatever you place in the folder is visible to everyone at a matching URL.

\`app.use(express.static('public'))\` means: for each request, look for a file inside \`public/\` with the same path. \`public/css/style.css\` → \`http://localhost:3000/css/style.css\` (the folder name \`public\` is NOT part of the URL). If no file exists, it calls \`next()\` and your routes run.

Useful details:
- Use an **absolute path**: \`express.static(path.join(__dirname, 'public'))\` – relative paths depend on the folder you start node from.
- **Virtual prefix**: \`app.use('/static', express.static('assets'))\` → \`/static/logo.png\`.
- **Multiple folders**: call it several times; the first folder containing the file wins.
- **Options**: \`maxAge: '1d'\` (browser caching), \`index: 'index.html'\` (default file for a folder), \`dotfiles: 'ignore'\` (default in Express 5 – \`.env\` style files are not served), \`extensions: ['html']\`.
- \`index.html\` inside the folder is served automatically for \`/\`.`,
      syntax: `const path = require('path');
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));`,
      tip: 'Never point express.static at your project root – you would publish server.js, package.json and maybe .env. Use a dedicated public/ folder.',
    },
    {
      heading: 'What is a template engine? (the wedding-card analogy)',
      content: `A wedding-card printer has one **design** (template) with blanks: "Dear ______, you are invited ...". For each guest the printer fills in the name. A **template engine** does the same for HTML: a \`.ejs\` file is HTML with placeholders; Express fills them with data and sends finished HTML. This is **Server-Side Rendering (SSR)**.

Popular engines for Express: **EJS** (plain HTML + JS – easiest), **Pug** (indentation based), **Handlebars** (logic-less \`{{ }}\`). We use EJS because you already know HTML and JS.

Setup:
1. \`npm install ejs\` (no need to require it – Express loads it)
2. \`app.set('view engine', 'ejs')\`
3. \`app.set('views', path.join(__dirname, 'views'))\` (default is \`./views\`)
4. \`res.render('index', { title: 'Home', courses })\` → renders \`views/index.ejs\`.`,
    },
    {
      heading: 'EJS syntax',
      content: `- \`<%= value %>\` – output the value **HTML-escaped** (safe: \`<script>\` becomes \`&lt;script&gt;\`). Use this for user data.
- \`<%- value %>\` – output **raw/unescaped** HTML. Use only for trusted HTML, mainly \`<%- include('partials/header') %>\`.
- \`<% code %>\` – run JS without output: \`if\`, \`for\`, \`forEach\`, variable declarations.
- \`<%# comment %>\` – a comment that is not sent to the browser.
- \`<%- include('partials/header', { title }) %>\` – insert another template (partial).

Every variable passed to \`res.render\` plus everything in \`res.locals\` and \`app.locals\` is available in the template.`,
      syntax: `<h1><%= title %></h1>
<% if (courses.length === 0) { %>
  <p>No courses yet</p>
<% } else { %>
  <ul>
    <% courses.forEach(c => { %>
      <li><%= c.title %> – ₹<%= c.fee %></li>
    <% }) %>
  </ul>
<% } %>`,
      tip: 'Using <%- %> with user input is an XSS (cross-site scripting) hole. Default to <%= %>.',
    },
    {
      heading: 'Partials, layouts, res.locals and app.locals',
      content: `**Partials** are reusable pieces (header, navbar, footer) kept in \`views/partials/\`. Each page includes them, so changing the navbar changes every page.

**app.locals** – data available in ALL templates for the app's lifetime (site name, year, helper functions).
**res.locals** – data for ONE request, usually set by middleware (the logged-in user, flash messages, current path for active nav links).

\`\`\`
views/
├── partials/
│   ├── header.ejs
│   └── footer.ejs
├── index.ejs
└── course.ejs
public/
├── css/style.css
└── js/app.js
\`\`\``,
    },
    {
      heading: 'Forms: urlencoded bodies and Post/Redirect/Get',
      content: `HTML forms send \`application/x-www-form-urlencoded\` bodies (\`title=Node&fee=4999\`). Parse them with \`app.use(express.urlencoded({ extended: true }))\`. All values arrive as **strings**.

After a successful POST, do not render a page directly – **redirect** (\`res.redirect('/courses')\`). This is the **PRG pattern** (Post → Redirect → Get): refreshing the page then repeats the harmless GET instead of re-submitting the form (no duplicate orders!).

**SSR vs SPA + API:** EJS apps send full HTML pages (great for SEO, simple admin panels, emails). React/Vue SPAs fetch JSON from an API (Day 16) and render in the browser. Many companies use both: an API for the app and EJS for emails/admin pages.`,
      tip: 'Coming next (Day 16): a complete REST CRUD API returning JSON.',
    },
  ],
  examples: [
    {
      title: 'Serving a public folder (run locally)',
      scenario: 'Serve an HTML page, a CSS file and an image with zero routes.',
      steps: [
        'mkdir static-demo && cd static-demo && npm init -y && npm i express',
        'Create public/index.html, public/css/style.css and put any logo.png in public/images',
        'Create app.js with the code below and run node app.js',
        'Open http://localhost:3000/ → index.html is served automatically',
        'Open http://localhost:3000/css/style.css and http://localhost:3000/static/logo.png',
      ],
      code: `// app.js
const express = require('express');
const path = require('path');
const app = express();

// 1. main public folder, cached by the browser for 1 day
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// 2. virtual prefix: public/images/logo.png -> /static/logo.png
app.use('/static', express.static(path.join(__dirname, 'public', 'images')));

// 3. routes run only if no file matched
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('Server running on port 3000'));

<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Static Demo</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <h1>Hello from a static file</h1>
  <img src="/static/logo.png" alt="Logo" width="120">
</body>
</html>`,
      result: `GET / → 200 (public/index.html, Content-Type: text/html)
GET /css/style.css → 200 Content-Type: text/css; charset=utf-8, Cache-Control: public, max-age=86400
GET /static/logo.png → 200 image/png
GET /api/health → 200 {"status":"ok"}`,
      explanation: 'express.static checks the folder first; when a file exists it streams it with the right Content-Type and caching headers and the routes are never reached. The URL never contains "public".',
    },
    {
      title: 'EJS page with partials, loops, conditions and a form (run locally)',
      scenario: 'A course catalogue rendered on the server: list courses, show "Full" for courses without seats, add new courses via a form.',
      steps: [
        'npm i express ejs',
        'Create views/partials/header.ejs, views/partials/footer.ejs and views/index.ejs as below',
        'Create public/css/style.css',
        'Create app.js, run node app.js, open http://localhost:3000',
        'Submit the form: the browser is redirected back to / and shows the new course',
        'Try a title like <script>alert(1)</script> – it is displayed as text, not executed',
      ],
      code: `// app.js
const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));   // parse HTML form bodies

app.use((req, res, next) => {          // data for every template
  res.locals.siteName = 'DayWise Academy';
  next();
});

const courses = [
  { id: 1, title: 'Node.js', fee: 4999, seats: 12 },
  { id: 2, title: 'Express', fee: 3999, seats: 0 },
];

app.get('/', (req, res) => {
  res.render('index', { title: 'Courses', courses });
});

app.post('/courses', (req, res) => {
  const { title, fee } = req.body;          // strings from the form
  if (title) courses.push({ id: courses.length + 1, title, fee: Number(fee) || 0, seats: 20 });
  res.redirect('/');                        // Post/Redirect/Get
});

app.listen(3000, () => console.log('Server running on port 3000'));

<!-- views/partials/header.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= title %> | <%= siteName %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header><h1><%= siteName %></h1></header>

<!-- views/partials/footer.ejs -->
  <footer>&copy; <%= siteName %></footer>
</body>
</html>

<!-- views/index.ejs -->
<%- include('partials/header') %>
<main>
  <h2><%= title %> (<%= courses.length %>)</h2>
  <ul>
    <% courses.forEach(course => { %>
      <li>
        <%= course.title %> – ₹<%= course.fee %>
        <% if (course.seats > 0) { %>
          <span class="ok"><%= course.seats %> seats left</span>
        <% } else { %>
          <span class="full">Full</span>
        <% } %>
      </li>
    <% }) %>
  </ul>
  <form action="/courses" method="POST">
    <input name="title" placeholder="Course title" required>
    <input name="fee" type="number" placeholder="Fee">
    <button>Add course</button>
  </form>
</main>
<%- include('partials/footer') %>

/* public/css/style.css */
body { font-family: sans-serif; }
.full { color: red; }
.ok { color: green; }`,
      result: `GET / → 200 HTML: <title>Courses | DayWise Academy</title> ... <h2>Courses (2)</h2> ... "Node.js – ₹4999 12 seats left", "Express – ₹3999 Full"
POST /courses (title=<script>x</script>&fee=100) → 302 Location: /
GET / → the new item is rendered escaped: &lt;script&gt;x&lt;/script&gt; – ₹100
(verified with Express 5.3 + EJS 3)`,
      explanation: 'res.render merges { title, courses } with res.locals (siteName) and passes them to index.ejs. include() pulls in the partials, which also see those variables. <%= %> escaped the script tag, preventing XSS.',
    },
    {
      title: 'Server-side rendering without a template engine (API Lab)',
      scenario: 'Understand what res.render really does by building HTML strings yourself, including escaping and res.locals.',
      steps: [
        'Write an escapeHtml helper (what <%= %> does for you)',
        'Write a render(page, data) function that wraps content in a layout (what partials do for you)',
        'Use a middleware to set res.locals.siteName',
        'Send the HTML with res.send – Express sets Content-Type text/html',
        'Request the list page, a detail page and a missing page',
      ],
      code: `function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function layout(siteName, title, body) {
  return '<html><head><title>' + escapeHtml(title) + ' | ' + siteName + '</title></head>'
    + '<body><h1>' + siteName + '</h1>' + body + '</body></html>';
}`,
      api: {
        code: `const express = require('express');
const app = express();

const courses = [
  { id: 1, title: 'Node.js', fee: 4999 },
  { id: 2, title: 'Learn <HTML> & CSS', fee: 1999 },
];

// what EJS <%= %> does: escape special characters
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// what a layout + partials do
function layout(siteName, title, body) {
  return '<html><head><title>' + escapeHtml(title) + ' | ' + siteName + '</title></head>'
    + '<body><h1>' + siteName + '</h1>' + body + '</body></html>';
}

// res.locals: data available to every "view" of this request
app.use((req, res, next) => {
  res.locals.siteName = 'DayWise Academy';
  next();
});

app.get('/courses', (req, res) => {
  const items = courses
    .map(c => '<li><a href="/courses/' + c.id + '">' + escapeHtml(c.title) + '</a></li>')
    .join('');
  res.send(layout(res.locals.siteName, 'Courses', '<ul>' + items + '</ul>'));
});

app.get('/courses/:id', (req, res) => {
  const c = courses.find(x => x.id === Number(req.params.id));
  if (!c) return res.status(404).send(layout(res.locals.siteName, 'Not found', '<p>Course not found</p>'));
  res.send(layout(res.locals.siteName, c.title, '<h2>' + escapeHtml(c.title) + '</h2><p>Fee: ' + c.fee + '</p>'));
});

app.listen(3000, () => console.log('Server running on port 3000'));`,
        requests: [
          { method: 'GET', url: '/courses' },
          { method: 'GET', url: '/courses/2' },
          { method: 'GET', url: '/courses/9' },
        ],
      },
      result: `GET /courses → 200 <html><head><title>Courses | DayWise Academy</title></head><body><h1>DayWise Academy</h1><ul><li><a href="/courses/1">Node.js</a></li><li><a href="/courses/2">Learn &lt;HTML&gt; &amp; CSS</a></li></ul></body></html>
GET /courses/2 → 200 <html><head><title>Learn &lt;HTML&gt; &amp; CSS | DayWise Academy</title></head><body><h1>DayWise Academy</h1><h2>Learn &lt;HTML&gt; &amp; CSS</h2><p>Fee: 1999</p></body></html>
GET /courses/9 → 404 <html><head><title>Not found | DayWise Academy</title></head><body><h1>DayWise Academy</h1><p>Course not found</p></body></html>`,
      explanation: 'A template engine automates exactly this: merge data into an HTML skeleton and escape user values. Doing it by hand quickly becomes unreadable – which is why EJS exists. (The API Lab has no file system, so res.render/express.static run only in real Node.)',
    },
    {
      title: 'Detail pages, 404 view and app.locals helpers (run locally)',
      scenario: 'Add /courses/:id detail pages, a custom 404 page and a currency helper available in all views.',
      steps: [
        'Add app.locals.formatINR helper in app.js',
        'Create views/course.ejs and views/404.ejs',
        'Render course.ejs for a known id, otherwise res.status(404).render("404")',
        'Register the 404 page as the last middleware',
      ],
      code: `// app.js (additions)
app.locals.formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
app.locals.year = 2026;

app.get('/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).render('404', { title: 'Not found' });
  res.render('course', { title: course.title, course });
});

app.use((req, res) => res.status(404).render('404', { title: 'Not found' }));

<!-- views/course.ejs -->
<%- include('partials/header') %>
<h2><%= course.title %></h2>
<p>Fee: <%= formatINR(course.fee) %></p>
<p><%= course.seats > 0 ? course.seats + ' seats available' : 'Batch full' %></p>
<a href="/">← Back</a>
<%- include('partials/footer') %>

<!-- views/404.ejs -->
<%- include('partials/header') %>
<h2>404 – Page not found</h2>
<p>Sorry, we could not find that page.</p>
<%- include('partials/footer') %>`,
      result: `GET /courses/1 → 200 page with "Node.js" and "Fee: ₹4,999.00"
GET /courses/99 → 404 page "404 – Page not found"`,
      explanation: 'app.locals values (formatINR, year) exist in every template without passing them each time. res.status(404).render(...) sends a proper 404 status with a friendly HTML page.',
    },
  ],
  interview: [
    { q: 'What does express.static do?', a: 'It is built-in middleware that serves files from a directory. For each request it looks for a matching file; if found it streams it with the correct Content-Type and caching headers, otherwise it calls next().', level: 'Easy' },
    { q: 'If public/css/main.css exists and you use app.use(express.static("public")), what is the URL?', a: '/css/main.css – the root folder name is not part of the URL unless you mount it with a prefix like app.use("/public", express.static("public")).', level: 'Easy' },
    { q: 'What is a template engine and why use one?', a: 'A library that combines templates (HTML with placeholders) with data to produce HTML on the server. It enables server-side rendering, layouts/partials, loops and conditions without string concatenation.', level: 'Easy' },
    { q: 'Difference between <%= %> and <%- %> in EJS?', a: '<%= %> HTML-escapes the output (safe for user data); <%- %> outputs raw unescaped HTML (used for include() or trusted HTML). Using <%- %> with user input causes XSS.', level: 'Medium' },
    { q: 'How do you configure EJS in Express?', a: 'npm install ejs, then app.set("view engine", "ejs") and optionally app.set("views", path.join(__dirname, "views")); render with res.render("viewName", data).', level: 'Easy' },
    { q: 'Difference between app.locals and res.locals?', a: 'app.locals persists for the whole application lifetime and is visible in all views; res.locals is scoped to a single request (e.g. current user set by middleware). Both are merged into the data available to res.render.', level: 'Medium' },
    { q: 'What is the Post/Redirect/Get pattern?', a: 'After processing a form POST, the server responds with a redirect (302/303) to a GET page instead of rendering. Refreshing the browser then repeats the GET, preventing duplicate form submissions.', level: 'Medium' },
    { q: 'Why use path.join(__dirname, "public") instead of "public"?', a: 'Relative paths are resolved against the process working directory, which changes depending on where node is started. __dirname is the folder of the current file, so the path is always correct.', level: 'Medium' },
    { q: 'SSR with EJS vs SPA with React – when to choose which?', a: 'SSR (EJS) gives fast first paint, simple SEO and fewer moving parts – good for content sites, admin panels, emails. SPAs give rich interactivity and are paired with a JSON API. Frameworks like Next.js combine both.', level: 'Medium' },
    { q: 'How can you improve static file performance?', a: 'Set maxAge/immutable caching with fingerprinted filenames, enable compression, serve from a CDN or reverse proxy (Nginx) in production, and avoid serving large folders through Node when possible.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Serve a folder "assets" under the URL prefix /files with a 7-day cache.',
      hint: 'app.use(prefix, express.static(dir, { maxAge })).',
      solution: `app.use('/files', express.static(path.join(__dirname, 'assets'), { maxAge: '7d' }));`,
    },
    {
      task: 'Create an EJS page views/students.ejs that shows a table of students (name, marks) and highlights marks < 40 in red.',
      hint: 'Use forEach and a conditional class.',
      solution: `// route
app.get('/students', (req, res) => {
  res.render('students', { students: [{ name: 'Asha', marks: 91 }, { name: 'Ravi', marks: 35 }] });
});

<!-- views/students.ejs -->
<table>
  <tr><th>Name</th><th>Marks</th></tr>
  <% students.forEach(s => { %>
    <tr>
      <td><%= s.name %></td>
      <td style="color: <%= s.marks < 40 ? 'red' : 'inherit' %>"><%= s.marks %></td>
    </tr>
  <% }) %>
</table>`,
    },
    {
      task: 'Add a navbar partial that highlights the current page using res.locals.currentPath.',
      hint: 'Middleware sets res.locals.currentPath = req.path.',
      solution: `app.use((req, res, next) => { res.locals.currentPath = req.path; next(); });

<!-- views/partials/nav.ejs -->
<nav>
  <a href="/" class="<%= currentPath === '/' ? 'active' : '' %>">Home</a>
  <a href="/courses" class="<%= currentPath === '/courses' ? 'active' : '' %>">Courses</a>
</nav>`,
    },
    {
      task: 'Build a contact form: GET /contact shows the form, POST /contact validates name and email and either re-renders with errors or redirects to /thank-you.',
      hint: 'express.urlencoded + render with an errors array.',
      solution: `app.use(express.urlencoded({ extended: true }));
app.get('/contact', (req, res) => res.render('contact', { errors: [], values: {} }));
app.post('/contact', (req, res) => {
  const { name = '', email = '' } = req.body;
  const errors = [];
  if (!name.trim()) errors.push('Name is required');
  if (!email.includes('@')) errors.push('Valid email is required');
  if (errors.length) return res.status(400).render('contact', { errors, values: { name, email } });
  res.redirect('/thank-you');
});
app.get('/thank-you', (req, res) => res.send('Thanks! We will reply soon.'));

<!-- views/contact.ejs -->
<% if (errors.length) { %><ul class="errors"><% errors.forEach(e => { %><li><%= e %></li><% }) %></ul><% } %>
<form method="POST" action="/contact">
  <input name="name" value="<%= values.name || '' %>">
  <input name="email" value="<%= values.email || '' %>">
  <button>Send</button>
</form>`,
    },
    {
      task: 'Explain and fix: a page shows the raw text "<b>Bold</b>" instead of bold text, but the HTML comes from your own trusted CMS.',
      hint: 'Which EJS tag outputs raw HTML?',
      solution: `<!-- <%= %> escapes HTML, so the tags are shown as text. For TRUSTED, sanitised HTML only: -->
<div class="article"><%- article.htmlBody %></div>
<!-- Never do this with user input; sanitise first (e.g. with the sanitize-html package). -->`,
    },
  ],
  quiz: [
    { question: 'Which EJS tag escapes HTML?', options: ['<%- %>', '<% %>', '<%= %>', '<%# %>'], answer: 2, explanation: '<%= %> escapes; <%- %> is raw.' },
    { question: 'app.use(express.static("public")) and the file public/img/a.png. Which URL works?', options: ['/public/img/a.png', '/img/a.png', '/static/img/a.png', '/a.png'], answer: 1, explanation: 'The folder name is not part of the URL.' },
    { question: 'Which method renders views/home.ejs?', options: ['res.render("home", data)', 'res.send("home.ejs")', 'res.view("home")', 'res.sendFile("home")'], answer: 0, explanation: 'res.render uses the configured view engine and views folder.' },
    { question: 'Which middleware parses HTML form submissions?', options: ['express.json()', 'express.static()', 'express.text()', 'express.urlencoded()'], answer: 3, explanation: 'Forms send application/x-www-form-urlencoded data.' },
    { question: 'Data that should be available only during one request in all views belongs in…', options: ['app.locals', 'res.locals', 'process.env', 'global'], answer: 1, explanation: 'res.locals is request-scoped.' },
  ],
};
