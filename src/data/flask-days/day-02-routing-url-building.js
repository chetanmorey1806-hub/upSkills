export default {
  id: "day-02-routing-url-building",
  title: "Routing, URL Variables, HTTP Methods, url_for, redirect",
  module: "Module 1: Flask Basics",
  day: 2,
  level: "Beginner",
  duration: "2 hours",
  summary: "Map URLs to Python functions with @app.route, capture values from the URL with converters, handle GET and POST, build URLs safely with url_for and send users elsewhere with redirect and abort.",
  objectives: [
    "Create static and dynamic routes with URL variables and converters (string, int, float, path, uuid)",
    "Handle different HTTP methods in one view and use the shortcut decorators @app.get / @app.post",
    "Read query string values with request.args",
    "Build URLs with url_for instead of hard-coding them",
    "Use redirect, abort and status codes correctly (301/302/303, 404, 405)",
  ],
  theory: [
    {
      heading: "What is Routing?",
      content: "Routing is the mapping between a URL and the Python function that handles it. Think of a building reception desk: a visitor says 'room 204' and the receptionist sends them to the right room. In Flask the @app.route decorator registers a rule (like '/about') with an endpoint (by default the function name) and a view function. Werkzeug stores these rules in app.url_map and matches every incoming request against them. You can print app.url_map to see all routes, or run flask --app app routes.",
      syntax: "@app.route('/about')\ndef about():\n    return 'About page'",
      points: [
        "Rule: the URL pattern, e.g. '/products/<int:id>'",
        "Endpoint: the name of the route, default = function name ('about')",
        "View function: the Python function that returns the response",
        "Trailing slash: '/projects/' acts like a folder (visiting /projects redirects to /projects/); '/about' without slash gives 404 for /about/",
      ],
    },
    {
      heading: "URL Variables and Converters",
      content: "Parts of a URL can be variables wrapped in angle brackets: /user/<username>. Flask passes them to the view as keyword arguments. A converter type checks and converts the value: <int:post_id> only matches digits and gives you an int, so /post/abc returns 404 automatically. This saves you from writing validation code.",
      syntax: "@app.route('/post/<int:post_id>')\ndef show_post(post_id):\n    return f'Post {post_id}'",
      points: [
        "string (default): any text without a slash",
        "int: positive integers; float: positive floats like 4.5",
        "path: like string but also accepts slashes (files/docs/a.pdf)",
        "uuid: UUID strings, converted to uuid.UUID",
        "A view can have multiple routes stacked on top, and defaults={'page': 1} for optional values",
      ],
    },
    {
      heading: "HTTP Methods and the request Object",
      content: "By default a route only answers GET (and HEAD/OPTIONS). To accept form submissions add methods=['GET', 'POST']. Inside the view, request.method tells you which one arrived. Flask 2+ also gives shortcuts: @app.get('/login') and @app.post('/login'). If a method is not allowed Flask returns 405 Method Not Allowed. The request object (from flask import request) is a 'context local': it always refers to the current request even though it looks global. request.args holds the query string (?q=python&page=2), request.form holds POST form fields, request.json holds a JSON body, request.headers and request.cookies are also available.",
      points: [
        "GET: read data, parameters in URL, safe to repeat and bookmark",
        "POST: send data in the body, changes state on the server",
        "request.args.get('page', 1, type=int) - safe read with default and type conversion",
        "Never read request.args['q'] directly if it may be missing: it raises a 400 Bad Request",
      ],
    },
    {
      heading: "url_for: Build URLs from Endpoint Names",
      content: "url_for('endpoint', **values) generates the URL for a view. If you later change '/user/<name>' to '/members/<name>', every url_for('profile', name='asha') updates automatically - hard-coded links would break. Extra arguments that are not part of the rule become query string parameters. url_for also escapes special characters and, with _external=True, returns a full absolute URL (useful in emails). url_for needs an application/request context: inside views it just works; in the shell use app.test_request_context().",
      syntax: "url_for('profile', name='asha')            # '/user/asha'\nurl_for('search', q='flask', page=2)       # '/search?q=flask&page=2'\nurl_for('static', filename='css/site.css') # '/static/css/site.css'",
      tip: "Interview line: 'url_for reverses a URL from the endpoint name, so URLs are not hard-coded and stay correct when routes change.'",
    },
    {
      heading: "redirect, abort and Status Codes",
      content: "redirect(url) returns a 302 response that tells the browser to go to another URL. Always combine it with url_for: redirect(url_for('dashboard')). After a successful POST we redirect to a GET page; this is the Post/Redirect/Get (PRG) pattern and it stops the 'resubmit form?' popup on refresh. abort(404) immediately stops the view and returns an error response; you can customise it with @app.errorhandler(404).",
      points: [
        "301 Moved Permanently (redirect(url, code=301)) - search engines update their links",
        "302 Found (default) - temporary redirect",
        "303 See Other - recommended after POST",
        "abort(403) forbidden, abort(404) not found, abort(400) bad request",
        "Common mistake: return url_for('home') returns the text '/' - you must wrap it in redirect()",
      ],
    },
  ],
  examples: [
    {
      title: "Dynamic routes with converters",
      scenario: "An online shop needs pages for users, products by numeric id, price filters and file downloads.",
      steps: [
        "Open your project folder in VS Code or PyCharm and activate the .venv",
        "Create app.py with the code below",
        "Run flask --app app run --debug",
        "Run flask --app app routes in a second terminal to list all routes",
        "Try each URL from the result in the browser",
      ],
      code: `# app.py
from flask import Flask

app = Flask(__name__)


@app.route("/")
def index():
    return "Shop home"


@app.route("/user/<username>")
def profile(username):
    return f"Hello, {username.title()}!"


@app.route("/product/<int:product_id>")
def product(product_id):
    # product_id is already an int
    return f"Product #{product_id}, next product is #{product_id + 1}"


@app.route("/price/<float:amount>")
def price(amount):
    return f"With 18% GST: {amount * 1.18:.2f}"


@app.route("/files/<path:filepath>")
def files(filepath):
    return f"You asked for file: {filepath}"


@app.route("/blog/", defaults={"page": 1})
@app.route("/blog/page/<int:page>")
def blog(page):
    return f"Blog page {page}"`,
      result: `/user/asha              -> Hello, Asha!
/product/7              -> Product #7, next product is #8
/product/abc            -> 404 Not Found (int converter did not match)
/price/100.0            -> With 18% GST: 118.00
/files/docs/2026/a.pdf  -> You asked for file: docs/2026/a.pdf
/blog/                  -> Blog page 1
/blog/page/3            -> Blog page 3

$ flask --app app routes
Endpoint  Methods  Rule
--------  -------  -----------------------
blog      GET      /blog/
blog      GET      /blog/page/<int:page>
files     GET      /files/<path:filepath>
index     GET      /
price     GET      /price/<float:amount>
product   GET      /product/<int:product_id>
profile   GET      /user/<username>
static    GET      /static/<path:filename>`,
      explanation: "Converters both validate and convert. Two @app.route lines on one view give an optional parameter using defaults. The static endpoint is added automatically by Flask.",
    },
    {
      title: "GET and POST in one view, query strings with request.args",
      scenario: "A login page shows a form on GET and checks credentials on POST. A search page reads ?q= and ?page=.",
      steps: [
        "Open app.py in VS Code / PyCharm",
        "Add the code below",
        "Run flask --app app run --debug",
        "Open /login, submit the form; open /search?q=flask&page=2",
        "Optional: test POST with curl -X POST -d 'username=admin&password=123' http://127.0.0.1:5000/login",
      ],
      code: `# app.py
from flask import Flask, request

app = Flask(__name__)

LOGIN_FORM = """
<form method="post">
  <input name="username" placeholder="Username">
  <input name="password" type="password" placeholder="Password">
  <button>Login</button>
</form>
"""


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        if username == "admin" and password == "123":
            return f"<h2>Welcome {username}</h2>"
        return "<p>Invalid credentials</p>" + LOGIN_FORM, 401
    return LOGIN_FORM


@app.get("/search")
def search():
    q = request.args.get("q", "")
    page = request.args.get("page", 1, type=int)
    return f"Searching for '{q}' on page {page}"


@app.post("/subscribe")
def subscribe():
    email = request.form.get("email")
    return f"Subscribed {email}", 201`,
      result: `GET  /login                       -> shows the login form
POST /login (admin / 123)          -> Welcome admin
POST /login (wrong password)       -> Invalid credentials + form (401)
GET  /search?q=flask&page=2        -> Searching for 'flask' on page 2
GET  /search                       -> Searching for '' on page 1
GET  /subscribe                    -> 405 Method Not Allowed`,
      explanation: "methods=['GET','POST'] lets one view do both jobs; request.method decides the branch. request.args.get with type=int converts safely and falls back to the default when conversion fails. @app.post only accepts POST, so a GET returns 405.",
    },
    {
      title: "url_for, redirect (PRG pattern) and abort",
      scenario: "After adding a note the user should land on the notes list; a missing note should show 404; the old URL /old-notes should permanently move.",
      steps: [
        "Create app.py with the code below in VS Code or PyCharm",
        "Run flask --app app run --debug",
        "Open /notes, use the form to add a note and watch the address bar change back to /notes",
        "Open /notes/99 to see the custom 404 and /old-notes to see the 301 redirect",
        "Open a Python console (PyCharm: Tools > Python Console) and try the url_for test at the bottom",
      ],
      code: `# app.py
from flask import Flask, request, redirect, url_for, abort

app = Flask(__name__)
notes = {1: "Learn routing", 2: "Practice url_for"}


@app.route("/notes")
def note_list():
    items = "".join(
        f'<li><a href="{url_for("note_detail", note_id=i)}">{text}</a></li>'
        for i, text in notes.items()
    )
    form = f'<form method="post" action="{url_for("add_note")}">' \\
           '<input name="text"><button>Add</button></form>'
    return f"<ul>{items}</ul>{form}"


@app.route("/notes/<int:note_id>")
def note_detail(note_id):
    if note_id not in notes:
        abort(404)
    return f"<h3>{notes[note_id]}</h3><a href='{url_for('note_list')}'>Back</a>"


@app.post("/notes/add")
def add_note():
    text = request.form.get("text", "").strip()
    if not text:
        abort(400)
    new_id = max(notes) + 1
    notes[new_id] = text
    # Post/Redirect/Get
    return redirect(url_for("note_list"), code=303)


@app.route("/old-notes")
def old_notes():
    return redirect(url_for("note_list"), code=301)


@app.errorhandler(404)
def page_not_found(e):
    return "<h3>Note not found</h3>", 404


# ---- Try url_for outside a request ----
# >>> from app import app
# >>> from flask import url_for
# >>> with app.test_request_context():
# ...     print(url_for("note_detail", note_id=5))
# ...     print(url_for("note_list", sort="asc"))
# ...     print(url_for("note_list", _external=True))`,
      result: `/notes            -> list of 2 linked notes + Add form
POST /notes/add   -> 303 See Other, browser goes to /notes (now 3 notes)
/notes/99         -> Note not found (404)
/old-notes        -> 301 Moved Permanently -> /notes

Console:
/notes/5
/notes?sort=asc
http://localhost/notes`,
      explanation: "url_for builds every link from endpoint names; unknown keyword arguments become query parameters. redirect after POST prevents duplicate submissions on refresh. abort stops the view immediately and triggers the matching error handler.",
    },
    {
      title: "Pure Python demo: how a router matches URLs",
      scenario: "Understand what Werkzeug does internally when it matches /post/7 to a view and converts 7 to an int.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `routes = []


def route(rule):
    def decorator(func):
        routes.append((rule.strip("/").split("/"), func))
        return func
    return decorator


def match(rule_parts, path_parts):
    if len(rule_parts) != len(path_parts):
        return None
    kwargs = {}
    for rule, value in zip(rule_parts, path_parts):
        if rule.startswith("<int:"):
            if not value.isdigit():
                return None
            kwargs[rule[5:-1]] = int(value)
        elif rule.startswith("<"):
            kwargs[rule[1:-1]] = value
        elif rule != value:
            return None
    return kwargs


@route("/")
def index():
    return "Home page"


@route("/user/<name>")
def profile(name):
    return f"Profile of {name}"


@route("/post/<int:post_id>")
def show_post(post_id):
    return f"Post {post_id}, next is {post_id + 1}"


def dispatch(path):
    parts = path.strip("/").split("/")
    for rule_parts, func in routes:
        kwargs = match(rule_parts, parts)
        if kwargs is not None:
            return func(**kwargs)
    return "404 Not Found"


for url in ["/", "/user/asha", "/post/7", "/post/abc"]:
    print(url, "=>", dispatch(url))`,
      python: { files: { "main.py": `routes = []


def route(rule):
    def decorator(func):
        routes.append((rule.strip("/").split("/"), func))
        return func
    return decorator


def match(rule_parts, path_parts):
    if len(rule_parts) != len(path_parts):
        return None
    kwargs = {}
    for rule, value in zip(rule_parts, path_parts):
        if rule.startswith("<int:"):
            if not value.isdigit():
                return None
            kwargs[rule[5:-1]] = int(value)
        elif rule.startswith("<"):
            kwargs[rule[1:-1]] = value
        elif rule != value:
            return None
    return kwargs


@route("/")
def index():
    return "Home page"


@route("/user/<name>")
def profile(name):
    return f"Profile of {name}"


@route("/post/<int:post_id>")
def show_post(post_id):
    return f"Post {post_id}, next is {post_id + 1}"


def dispatch(path):
    parts = path.strip("/").split("/")
    for rule_parts, func in routes:
        kwargs = match(rule_parts, parts)
        if kwargs is not None:
            return func(**kwargs)
    return "404 Not Found"


for url in ["/", "/user/asha", "/post/7", "/post/abc"]:
    print(url, "=>", dispatch(url))` } },
      result: `/ => Home page
/user/asha => Profile of asha
/post/7 => Post 7, next is 8
/post/abc => 404 Not Found`,
      explanation: "The decorator stores (rule, function) pairs, just like app.url_map. For each request the router compares segments, converts <int:...> values, and calls the view with keyword arguments. If nothing matches, the result is 404 - exactly Flask's behaviour.",
    },
  ],
  interview: [
    { q: "What is an endpoint in Flask?", a: "The unique name of a route used by url_for. By default it is the view function's name; you can set it with @app.route('/x', endpoint='name'). In blueprints it is prefixed: 'auth.login'.", level: "Easy" },
    { q: "Name the built-in URL converters.", a: "string (default, no slashes), int, float, path (allows slashes), uuid. You can also create custom converters by subclassing werkzeug.routing.BaseConverter.", level: "Easy" },
    { q: "Why use url_for instead of hard-coded URLs?", a: "URLs are generated from endpoint names, so changing a rule does not break links; it handles escaping, query strings, static files and absolute URLs (_external=True).", level: "Easy" },
    { q: "What happens if you send a POST to a route that only allows GET?", a: "Flask returns 405 Method Not Allowed with an Allow header listing valid methods.", level: "Easy" },
    { q: "Difference between request.args, request.form and request.json?", a: "request.args = query string parameters (URL ?a=1), request.form = form fields from a POST body (form-encoded/multipart), request.json / get_json() = parsed JSON body.", level: "Medium" },
    { q: "What is the Post/Redirect/Get pattern?", a: "After handling a POST successfully, return a redirect to a GET page. Refreshing the page then repeats only the harmless GET, not the form submission.", level: "Medium" },
    { q: "What is the output: return url_for('home') inside a view?", a: "It returns the URL text such as '/' as the page body with status 200 - it does NOT redirect. You need return redirect(url_for('home')).", level: "Medium" },
    { q: "Difference between 301 and 302 redirects?", a: "301 is permanent (browsers and search engines cache it and update links); 302 is temporary. 303 is preferred after POST because it forces a GET.", level: "Medium" },
    { q: "How does the trailing slash behave in Flask routes?", a: "A rule ending with '/' (like '/projects/') redirects '/projects' to '/projects/'. A rule without it ('/about') returns 404 for '/about/'. This keeps URLs unique for SEO.", level: "Hard" },
    { q: "Why does request work like a global variable even with many users?", a: "request is a context local (a proxy backed by contextvars). Each request is handled in its own context, so request always points to the current request object of that worker.", level: "Hard" },
    { q: "How do you list all routes of an app?", a: "Run 'flask --app app routes' or print app.url_map.", level: "Easy" },
  ],
  practice: [
    {
      task: "Create /square/<int:n> that returns the square of n, and /greet/<name> that returns 'Hi <name>'.",
      hint: "Use the int converter so n arrives as an int.",
      solution: `@app.route("/square/<int:n>")
def square(n):
    return f"{n} squared is {n * n}"


@app.route("/greet/<name>")
def greet(name):
    return f"Hi {name}"`,
    },
    {
      task: "Create /calc?a=5&b=3&op=add that supports add, sub, mul and returns 400 for unknown op.",
      hint: "request.args.get('a', type=int) and abort(400).",
      solution: `from flask import request, abort

@app.get("/calc")
def calc():
    a = request.args.get("a", 0, type=int)
    b = request.args.get("b", 0, type=int)
    op = request.args.get("op", "add")
    ops = {"add": a + b, "sub": a - b, "mul": a * b}
    if op not in ops:
        abort(400)
    return {"a": a, "b": b, "op": op, "result": ops[op]}`,
    },
    {
      task: "Make /admin redirect to /login using url_for, and /login show 'Please log in'.",
      hint: "return redirect(url_for('login'))",
      solution: `from flask import redirect, url_for

@app.route("/login")
def login():
    return "Please log in"


@app.route("/admin")
def admin():
    return redirect(url_for("login"))`,
    },
    {
      task: "Write a feedback form: GET shows the form, POST reads 'message' and redirects to /thanks.",
      hint: "methods=['GET','POST'] + PRG pattern.",
      solution: `@app.route("/feedback", methods=["GET", "POST"])
def feedback():
    if request.method == "POST":
        print("Feedback:", request.form.get("message"))
        return redirect(url_for("thanks"), code=303)
    return '<form method="post"><textarea name="message"></textarea><button>Send</button></form>'


@app.route("/thanks")
def thanks():
    return "Thanks for your feedback!"`,
    },
  ],
  quiz: [
    {
      question: "Which URL matches @app.route('/item/<int:id>')?",
      options: ["/item/abc", "/item/-5", "/item/42", "/item/4.5"],
      answer: 2,
      explanation: "The int converter matches non-negative whole numbers only.",
    },
    {
      question: "What does url_for('search', q='flask') return if the rule is '/search'?",
      options: ["/search/flask", "/search?q=flask", "search?flask", "An error"],
      answer: 1,
      explanation: "Extra arguments not in the rule become query string parameters.",
    },
    {
      question: "Which is the correct way to send the user to the home page?",
      options: ["return redirect(url_for('home'))", "return url_for('home')", "return redirect('home()')", "abort('home')"],
      answer: 0,
      explanation: "redirect creates a 302 response; url_for builds the URL from the endpoint.",
    },
    {
      question: "How do you read ?page=3 as an integer with default 1?",
      options: ["request.form['page']", "int(request.page)", "request.json.get('page')", "request.args.get('page', 1, type=int)"],
      answer: 3,
      explanation: "request.args holds the query string; type=int converts safely.",
    },
    {
      question: "What status does Flask return for a GET to a POST-only route?",
      options: ["404", "400", "405", "500"],
      answer: 2,
      explanation: "405 Method Not Allowed.",
    },
  ],
};
