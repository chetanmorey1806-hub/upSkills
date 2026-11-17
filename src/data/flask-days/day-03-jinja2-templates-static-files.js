export default {
  id: "day-03-jinja2-templates-static-files",
  title: "Jinja2 Templates, Template Inheritance, Static Files",
  module: "Module 1: Flask Basics",
  day: 3,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Move HTML out of Python into Jinja2 templates, pass data with render_template, use variables, filters, loops and conditions, reuse a base layout with template inheritance and include, and serve CSS, JS and images from the static folder.",
  objectives: [
    "Render HTML files from the templates folder with render_template and pass context variables",
    "Use Jinja2 syntax: {{ }}, {% %}, {# #}, filters, for loops, if conditions and loop variables",
    "Build a base.html layout and extend it with {% extends %} and {% block %}",
    "Reuse pieces with {% include %} and macros",
    "Serve static files with url_for('static', filename=...) and understand autoescaping",
  ],
  theory: [
    {
      heading: "Why Templates? render_template",
      content: "Writing HTML inside Python strings becomes messy very fast. A template is an HTML file with placeholders. Flask uses the Jinja2 engine: you write templates/index.html, then in the view call render_template('index.html', name='Asha'). Jinja2 fills the placeholders with your data and returns the final HTML. Analogy: a wedding invitation card printed with blanks - the template - and the printer fills in each guest's name - rendering. This separates logic (Python) from presentation (HTML), so designers and developers can work independently.",
      syntax: "from flask import render_template\n\n@app.route('/')\ndef home():\n    return render_template('index.html', name='Asha', marks=[80, 92])",
      points: [
        "Flask looks for templates in a folder named templates next to your app module",
        "Keyword arguments become template variables (the context)",
        "Inside templates you also get request, session, g, url_for and get_flashed_messages automatically",
        "Common mistake: folder named 'template' or 'Templates' - it must be exactly 'templates' (TemplateNotFound error)",
      ],
    },
    {
      heading: "Jinja2 Syntax: Expressions, Statements, Comments, Filters",
      content: "Jinja2 has three delimiters. {{ ... }} prints an expression. {% ... %} runs a statement such as for, if, set, block, extends. {# ... #} is a comment that is not sent to the browser. Filters transform a value with the pipe symbol: {{ name|upper }}. You can chain filters and give arguments: {{ price|round(2) }}, {{ items|join(', ') }}, {{ bio|default('No bio') }}. Inside a for loop the special loop variable gives loop.index (1-based), loop.index0, loop.first, loop.last and loop.length. A for loop can have an {% else %} block that runs when the list is empty.",
      points: [
        "Common filters: upper, lower, title, capitalize, length, default, join, round, truncate, replace, safe, striptags, format",
        "Tests: {% if n is even %}, {% if user is defined %}, {% if x is none %}",
        "Set a variable: {% set total = marks|sum %}",
        "Whitespace control: {%- ... -%} removes surrounding blank lines",
      ],
    },
    {
      heading: "Template Inheritance: base.html, extends and block",
      content: "Every page of a site shares the same header, navbar and footer. Instead of copying them, create base.html with named holes called blocks. Child templates start with {% extends 'base.html' %} and fill only the blocks they need. Analogy: a school answer sheet has a printed header (school name, roll number) and empty boxes; each student fills only the boxes. {{ super() }} keeps the parent's block content and adds to it. {% include '_navbar.html' %} pastes a small partial file - good for navbar, footer or a product card. Macros ({% macro %}) are like functions in templates that you call with arguments.",
      syntax: "{# child.html #}\n{% extends 'base.html' %}\n{% block title %}Home{% endblock %}\n{% block content %}\n  <h1>Welcome</h1>\n{% endblock %}",
      points: [
        "{% extends %} must be the FIRST tag in the child template",
        "Content outside blocks in a child template is ignored",
        "Use multiple blocks: title, extra_css, content, scripts",
        "Partials are often named with a leading underscore: _navbar.html, _footer.html",
      ],
    },
    {
      heading: "Static Files: CSS, JavaScript, Images",
      content: "Files that never change per request (CSS, JS, images, fonts) live in the static folder. Flask automatically adds a route /static/<path:filename> with the endpoint name 'static'. Always link them with url_for('static', filename='css/style.css') so the path works even if the app is mounted under a prefix. In production, Nginx or a CDN usually serves static files directly for speed.",
      syntax: "<link rel=\"stylesheet\" href=\"{{ url_for('static', filename='css/style.css') }}\">\n<img src=\"{{ url_for('static', filename='img/logo.png') }}\" alt=\"Logo\">",
      points: [
        "Folder must be named static (or set Flask(__name__, static_folder='assets'))",
        "Browser caching: if CSS changes do not show, press Ctrl+F5 (hard refresh)",
        "User-uploaded files are NOT static files; store them in a separate uploads folder",
      ],
    },
    {
      heading: "Autoescaping and Security (XSS)",
      content: "If a user types <script>alert('hacked')</script> as a comment and you print it, the browser would run that script - this attack is called Cross-Site Scripting (XSS). Flask enables Jinja2 autoescaping for .html templates, so {{ comment }} prints &lt;script&gt; as harmless text. Only use the |safe filter or Markup() for HTML you fully trust (for example HTML you generated yourself). Never mark user input as safe.",
      points: [
        "Autoescape is ON for .html, .htm, .xml, .xhtml templates and for render_template_string",
        "|safe disables escaping for one value - dangerous with user data",
        "Escaping converts < > & ' \" into HTML entities",
      ],
      tip: "Interview line: 'Jinja2 autoescaping protects against XSS by converting special HTML characters into entities before inserting variables.'",
    },
  ],
  examples: [
    {
      title: "Base layout with inheritance, navbar include and static CSS",
      scenario: "Build a 3-page college site (Home, Courses, About) that shares one layout, one navbar and one stylesheet.",
      steps: [
        "Create the project tree shown below in VS Code (Explorer > New Folder / New File) or PyCharm (right-click project > New > Directory / HTML File)",
        "PyCharm Professional: Settings > Languages & Frameworks > Template Languages > set Template language to Jinja2 for syntax highlighting; VS Code: install the 'Jinja' or 'Better Jinja' extension",
        "Paste each file's content",
        "Run flask --app app run --debug and open http://127.0.0.1:5000",
        "Click the navbar links; the active link is highlighted using request.endpoint",
      ],
      code: `# Project tree
college_site/
├── app.py
├── static/
│   ├── css/
│   │   └── style.css
│   └── img/
│       └── logo.png
└── templates/
    ├── base.html
    ├── _navbar.html
    ├── index.html
    ├── courses.html
    └── about.html

# ---- app.py ----
from flask import Flask, render_template

app = Flask(__name__)

COURSES = [
    {"name": "Python Full Stack", "fee": 45000, "seats": 12},
    {"name": "Data Analytics", "fee": 38000, "seats": 0},
    {"name": "Flask APIs", "fee": 15000, "seats": 5},
]


@app.route("/")
def index():
    return render_template("index.html", college="City College", year=2026)


@app.route("/courses")
def courses():
    return render_template("courses.html", courses=COURSES)


@app.route("/about")
def about():
    return render_template("about.html")


# ---- templates/base.html ----
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}City College{% endblock %}</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
  {% block extra_css %}{% endblock %}
</head>
<body>
  {% include "_navbar.html" %}
  <main class="container">
    {% block content %}{% endblock %}
  </main>
  <footer>&copy; 2026 City College</footer>
</body>
</html>

# ---- templates/_navbar.html ----
<nav>
  <img src="{{ url_for('static', filename='img/logo.png') }}" alt="logo" height="32">
  <a href="{{ url_for('index') }}" class="{{ 'active' if request.endpoint == 'index' }}">Home</a>
  <a href="{{ url_for('courses') }}" class="{{ 'active' if request.endpoint == 'courses' }}">Courses</a>
  <a href="{{ url_for('about') }}" class="{{ 'active' if request.endpoint == 'about' }}">About</a>
</nav>

# ---- templates/index.html ----
{% extends "base.html" %}
{% block title %}Home | {{ super() }}{% endblock %}
{% block content %}
  <h1>Welcome to {{ college }}</h1>
  <p>Admissions for {{ year }} are open.</p>
{% endblock %}

# ---- templates/about.html ----
{% extends "base.html" %}
{% block title %}About | {{ super() }}{% endblock %}
{% block content %}
  <h1>About Us</h1>
  <p>We teach practical, job-ready skills.</p>
{% endblock %}

# ---- static/css/style.css ----
body { font-family: Arial, sans-serif; margin: 0; }
nav { background: #1e3a8a; padding: 12px; display: flex; gap: 16px; align-items: center; }
nav a { color: #fff; text-decoration: none; }
nav a.active { border-bottom: 2px solid #facc15; }
.container { max-width: 900px; margin: 24px auto; padding: 0 16px; }
footer { text-align: center; padding: 16px; color: #666; }`,
      result: `/        -> Navbar (Home underlined) + 'Welcome to City College' + 'Admissions for 2026 are open.' + footer
           Browser tab title: 'Home | City College'
/about   -> Same navbar and footer, 'About Us' content, tab title 'About | City College'
/static/css/style.css is loaded on every page (check DevTools > Network: 200)`,
      explanation: "base.html defines the skeleton and blocks; each child only fills blocks. {{ super() }} reuses the parent title. request.endpoint is available in every template and is used to highlight the active link. url_for('static', ...) builds /static/... paths.",
    },
    {
      title: "Loops, conditions, filters and loop variables",
      scenario: "The Courses page must list courses in a table, show 'Full' for zero seats, format fees and handle an empty list.",
      steps: [
        "Inside the college_site project create templates/courses.html",
        "Paste the code below (the view was added in the previous example)",
        "Refresh /courses in the browser",
        "Temporarily pass courses=[] in the view to see the {% else %} branch",
      ],
      code: `{# templates/courses.html #}
{% extends "base.html" %}
{% block title %}Courses | {{ super() }}{% endblock %}
{% block content %}
  <h1>Our Courses ({{ courses|length }})</h1>
  <table border="1" cellpadding="6">
    <tr><th>#</th><th>Course</th><th>Fee</th><th>Status</th></tr>
    {% for c in courses %}
      <tr class="{{ 'first' if loop.first }}">
        <td>{{ loop.index }}</td>
        <td>{{ c.name|upper }}</td>
        <td>Rs. {{ "{:,}".format(c.fee) }}</td>
        <td>
          {% if c.seats == 0 %}
            <strong>Full</strong>
          {% elif c.seats < 10 %}
            Only {{ c.seats }} seats left
          {% else %}
            Available
          {% endif %}
        </td>
      </tr>
    {% else %}
      <tr><td colspan="4">No courses yet.</td></tr>
    {% endfor %}
  </table>
  {% set total = courses|sum(attribute='fee') %}
  <p>Total of all fees: Rs. {{ total }}</p>
  <p>{{ "Python is great for web and data"|truncate(20) }}</p>
  {# This comment never reaches the browser #}
{% endblock %}`,
      result: `Our Courses (3)
#  Course              Fee          Status
1  PYTHON FULL STACK   Rs. 45,000   Available
2  DATA ANALYTICS      Rs. 38,000   Full
3  FLASK APIS          Rs. 15,000   Only 5 seats left
Total of all fees: Rs. 98000
Python is great...

With courses=[] -> 'Our Courses (0)' and the row 'No courses yet.'`,
      explanation: "c.name works for dict keys as well as attributes. loop.index counts from 1. sum(attribute='fee') adds a field across a list. truncate(20) shortens text and adds '...'. The for-else branch runs only for an empty list. Row 1 shows 'Available' because 12 seats is not less than 10.",
    },
    {
      title: "Macros and render_template_string for a reusable card",
      scenario: "You need the same Bootstrap-like card for products in many pages; write it once as a macro.",
      steps: [
        "Create templates/_macros.html and templates/products.html",
        "Add the /products route to app.py",
        "Run flask --app app run --debug and open /products",
      ],
      code: `{# templates/_macros.html #}
{% macro card(title, price, in_stock=True) %}
  <div class="card">
    <h3>{{ title }}</h3>
    <p>Price: Rs. {{ price }}</p>
    {% if not in_stock %}<p class="out">Out of stock</p>{% endif %}
  </div>
{% endmacro %}

{# templates/products.html #}
{% extends "base.html" %}
{% from "_macros.html" import card %}
{% block content %}
  {% for p in products %}
    {{ card(p.name, p.price, p.stock > 0) }}
  {% endfor %}
{% endblock %}

# ---- add to app.py ----
@app.route("/products")
def products():
    items = [
        {"name": "Keyboard", "price": 999, "stock": 4},
        {"name": "Mouse", "price": 499, "stock": 0},
    ]
    return render_template("products.html", products=items)`,
      result: `/products shows two cards:
Keyboard  - Price: Rs. 999
Mouse     - Price: Rs. 499 - Out of stock`,
      explanation: "A macro is a template function with parameters and defaults. {% from ... import card %} brings it into another template. This keeps markup DRY (Don't Repeat Yourself).",
    },
    {
      title: "Pure Python demo: why autoescaping matters",
      scenario: "See what happens to a malicious comment with and without escaping (the same thing Jinja2 does for you).",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `@@FD03@@`,
      python: { files: { "main.py": `@@FD03@@` } },
      result: `<html><title>Safe</title><body>&lt;script&gt;alert(&#x27;hacked&#x27;)&lt;/script&gt;</body></html>
<html><title>Unsafe</title><body><script>alert('hacked')</script></body></html>`,
      explanation: "html.escape turns < > and quotes into entities, so the browser shows the text instead of running it. Jinja2 autoescaping does this for every {{ variable }} in .html templates; |safe turns it off, which is why you must never use |safe on user input.",
    },
  ],
  interview: [
    { q: "What is Jinja2?", a: "A fast, designer-friendly template engine for Python used by Flask. It supports variables, filters, control structures, inheritance, macros and autoescaping.", level: "Easy" },
    { q: "Difference between {{ }}, {% %} and {# #}?", a: "{{ }} outputs an expression, {% %} executes statements (for, if, extends, block, set, macro), {# #} is a comment that is not rendered.", level: "Easy" },
    { q: "What is template inheritance?", a: "A base template defines the common layout with named blocks; child templates use {% extends 'base.html' %} and override only the blocks they need. It removes duplicated HTML.", level: "Easy" },
    { q: "Difference between {% include %} and {% extends %}?", a: "extends makes the current template a child of a layout (one parent, must be first tag). include inserts another template's content at that point (many allowed), like a partial.", level: "Medium" },
    { q: "What does {{ super() }} do?", a: "Inside a block, it renders the parent template's content for that block, so you can add to it instead of replacing it.", level: "Medium" },
    { q: "How do you link a CSS file in Flask?", a: "Put it in static/css and use href=\"{{ url_for('static', filename='css/style.css') }}\".", level: "Easy" },
    { q: "What is autoescaping and how do you disable it?", a: "Automatic conversion of HTML special characters to entities in {{ }} output to prevent XSS. Disable for one value with |safe or Markup(), or for a region with {% autoescape false %}. Only do this for trusted content.", level: "Medium" },
    { q: "Which variables are available in every Flask template without passing them?", a: "config, request, session, g, url_for() and get_flashed_messages(). You can add more with @app.context_processor.", level: "Hard" },
    { q: "What is the output of {{ 'flask'|upper|length }}?", a: "5 - upper gives 'FLASK' and length gives 5.", level: "Easy" },
    { q: "What error do you get if the templates folder is misnamed?", a: "jinja2.exceptions.TemplateNotFound: index.html.", level: "Easy" },
    { q: "What is a context processor?", a: "A function decorated with @app.context_processor that returns a dict; its keys are injected into every template, e.g. current year or site name.", level: "Hard" },
    { q: "What are loop.index and loop.index0?", a: "Inside a Jinja2 for loop, loop.index is the 1-based iteration count and loop.index0 is 0-based. loop.first and loop.last are booleans.", level: "Easy" },
  ],
  practice: [
    {
      task: "Create a /students page that shows a list of student names in an <ol>; show 'No students' if the list is empty.",
      hint: "Use for ... else ... endfor.",
      solution: `# app.py
@app.route("/students")
def students():
    return render_template("students.html", students=["Asha", "Ravi", "Meena"])

{# templates/students.html #}
{% extends "base.html" %}
{% block content %}
<ol>
  {% for s in students %}
    <li>{{ s }}</li>
  {% else %}
    <li>No students</li>
  {% endfor %}
</ol>
{% endblock %}`,
    },
    {
      task: "Show a result card: marks >= 40 shows 'Pass' in green, otherwise 'Fail' in red. Pass name and marks from the view.",
      hint: "Use an inline if inside class attribute.",
      solution: `{# templates/result.html #}
{% extends "base.html" %}
{% block content %}
<h2>{{ name|title }}</h2>
<p class="{{ 'green' if marks >= 40 else 'red' }}">
  {{ 'Pass' if marks >= 40 else 'Fail' }} ({{ marks }}/100)
</p>
{% endblock %}

# app.py
@app.route("/result/<name>/<int:marks>")
def result(name, marks):
    return render_template("result.html", name=name, marks=marks)`,
    },
    {
      task: "Add a context processor that makes current_year available in all templates and use it in the footer.",
      hint: "@app.context_processor returning a dict.",
      solution: `from datetime import date

@app.context_processor
def inject_year():
    return {"current_year": date.today().year}

{# base.html footer #}
<footer>&copy; {{ current_year }} City College</footer>`,
    },
    {
      task: "Add a static/js/app.js file that logs 'Page loaded' and include it from base.html in a scripts block.",
      hint: "Use url_for('static', filename='js/app.js').",
      solution: `// static/js/app.js
console.log("Page loaded");

{# base.html, before </body> #}
{% block scripts %}
  <script src="{{ url_for('static', filename='js/app.js') }}"></script>
{% endblock %}`,
    },
  ],
  quiz: [
    {
      question: "Which tag must come first in a child template?",
      options: ["{% block %}", "{% include %}", "{% extends %}", "{% import %}"],
      answer: 2,
      explanation: "extends must be the first tag so Jinja2 knows the parent layout.",
    },
    {
      question: "Where does Flask look for templates by default?",
      options: ["templates/", "views/", "static/", "html/"],
      answer: 0,
      explanation: "The default template folder is 'templates' next to the app module.",
    },
    {
      question: "What does {{ comment }} do if comment contains <b>Hi</b>?",
      options: ["Shows Hi in bold", "Raises an error", "Removes the text", "Shows the tags as text because of autoescaping"],
      answer: 3,
      explanation: "Autoescaping converts < and > to entities.",
    },
    {
      question: "How do you build the URL for static/img/logo.png?",
      options: ["url_for('img', file='logo.png')", "url_for('static', filename='img/logo.png')", "static('img/logo.png')", "/img/logo.png"],
      answer: 1,
      explanation: "The static endpoint takes a filename argument relative to the static folder.",
    },
    {
      question: "Inside {% for %}, what is loop.index on the first iteration?",
      options: ["0", "None", "1", "-1"],
      answer: 2,
      explanation: "loop.index is 1-based; loop.index0 is 0-based.",
    },
  ],
};
