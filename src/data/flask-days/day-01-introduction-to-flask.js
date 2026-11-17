export default {
  id: "day-01-introduction-to-flask",
  title: "Introduction to Web Frameworks, Flask vs Django, Installing Flask, First App",
  module: "Module 1: Flask Basics",
  day: 1,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn what a web framework is, how a browser talks to a server, why Flask is called a micro-framework, how it compares with Django, and build and run your first Flask 3 app in VS Code and PyCharm.",
  objectives: [
    "Explain the client-server model, HTTP request and HTTP response in simple words",
    "Define a web framework and WSGI, and say what Flask gives you out of the box",
    "Compare Flask and Django and choose the right one for a project",
    "Create a virtual environment, install Flask 3 and run a Hello World app",
    "Run a Flask app from the terminal, from VS Code and from PyCharm with debug mode on",
  ],
  theory: [
    {
      heading: "How the Web Works: Client, Server, Request, Response",
      content: "When you type a URL in the browser, the browser (the client) sends an HTTP request to a computer on the internet (the server). The server runs some code, builds an HTTP response (usually HTML, sometimes JSON) and sends it back. The browser then shows that HTML. Think of a restaurant: you (the client) give an order (request) to the waiter, the kitchen (server) prepares the food and the waiter brings back your plate (response). A request has a method (GET, POST ...), a path (/about), headers and an optional body. A response has a status code (200 OK, 404 Not Found, 500 Server Error), headers (like Content-Type) and a body.",
      points: [
        "Client: browser, mobile app or Postman that sends requests",
        "Server: the program (our Flask app) that receives requests and returns responses",
        "HTTP methods: GET (read), POST (create/submit), PUT/PATCH (update), DELETE (remove)",
        "Status codes: 2xx success, 3xx redirect, 4xx client error, 5xx server error",
      ],
    },
    {
      heading: "What is a Web Framework? What is WSGI?",
      content: "Writing a web server from scratch means parsing raw HTTP text, matching URLs, reading form data, setting cookies and much more. A web framework is a ready-made toolkit that does this boring work, so you only write the business logic: 'when someone opens /about, return this page'. Python web frameworks follow a standard called WSGI (Web Server Gateway Interface, PEP 3333). WSGI is a simple contract: the server calls a Python function with the request details (environ) and a start_response callback, and the function returns the body. Flask is a WSGI application built on top of Werkzeug (the WSGI toolkit: request, response, routing, dev server) and Jinja2 (the template engine).",
      points: [
        "Framework = reusable code + rules that structure your web app",
        "WSGI = the standard plug between Python web apps and web servers (Gunicorn, uWSGI, Waitress)",
        "Flask core dependencies: Werkzeug, Jinja2, Click (CLI), ItsDangerous (signing), MarkupSafe, Blinker",
        "Newer async standard is ASGI (FastAPI, Django async); Flask 3 is WSGI-first",
      ],
    },
    {
      heading: "Flask: The Micro-Framework",
      content: "Flask was created by Armin Ronacher in 2010 (Pallets project). 'Micro' does not mean small apps only; it means the core is small and you add only what you need through extensions: Flask-SQLAlchemy for databases, Flask-Login for login, Flask-WTF for forms, Flask-Migrate for migrations. Big companies use Flask for APIs, dashboards and ML model serving. Flask 3 needs Python 3.8+ (we use Python 3.12). It gives you routing, request/response objects, templates, sessions, a dev server with debugger, and a CLI command called flask.",
      points: [
        "Lightweight and easy to learn: a full app can be 5 lines",
        "Unopinionated: you choose the folder structure, database and libraries",
        "Huge ecosystem of extensions",
        "Great for REST APIs, microservices, prototypes and ML model APIs",
      ],
      tip: "Interview line: 'Flask is a lightweight WSGI micro web framework in Python, built on Werkzeug and Jinja2, that gives the core of web development and lets you add features through extensions.'",
    },
    {
      heading: "Flask vs Django",
      content: "Django is a 'batteries-included' framework: it ships with ORM, admin panel, authentication, forms, migrations and a fixed project layout. Flask ships with only the essentials. Analogy: Django is a fully furnished flat - move in and live. Flask is an empty flat - you buy only the furniture you want. Choose Django for large, database-heavy apps that need an admin panel fast (e-commerce, CMS). Choose Flask for small-to-medium apps, APIs, microservices, or when you want full control and to learn how the web really works.",
      points: [
        "Architecture: Django uses MVT with a fixed structure; Flask leaves the structure to you",
        "ORM: Django has its own ORM; Flask usually uses SQLAlchemy via Flask-SQLAlchemy",
        "Admin: Django has a built-in admin; Flask needs Flask-Admin",
        "Learning curve: Flask is easier to start; Django has more concepts but more ready features",
        "Templates: Django Template Language vs Jinja2 (very similar syntax)",
      ],
    },
    {
      heading: "Installing Flask and the First App",
      content: "Always install Flask inside a virtual environment (venv) so each project has its own packages. Steps: create a folder, create a venv, activate it, pip install Flask, write app.py, run it. The core of every Flask app is: create the app object with Flask(__name__), attach a function to a URL with @app.route('/'), and return a string (HTML), a dict (auto-converted to JSON) or a response object. __name__ tells Flask where the app lives so it can find the templates and static folders.",
      syntax: "from flask import Flask\n\napp = Flask(__name__)\n\n@app.route('/')\ndef home():\n    return 'Hello, World!'",
      points: [
        "python -m venv .venv  then activate it (Windows: .venv\\Scripts\\activate, Mac/Linux: source .venv/bin/activate)",
        "pip install Flask   then   pip freeze > requirements.txt",
        "Run: flask --app app run --debug  (or simply flask run --debug when the file is app.py)",
        "Default address: http://127.0.0.1:5000",
      ],
    },
    {
      heading: "Debug Mode, the Dev Server and Common Mistakes",
      content: "The --debug flag turns on two things: the auto-reloader (server restarts when you save a file) and the interactive debugger (a detailed error page in the browser). The built-in server is ONLY for development; in production we use Gunicorn (Day 11). Never turn debug on in production, because the debugger allows running code on your server.",
      points: [
        "Mistake: naming your file flask.py - it shadows the real flask package. Use app.py",
        "Mistake: forgetting to activate the venv - 'ModuleNotFoundError: No module named flask'",
        "Mistake: port 5000 busy (macOS AirPlay) - use flask run --port 5001",
        "Mistake: returning None or an int from a view - a view must return a str, dict, list, tuple or Response",
      ],
    },
  ],
  examples: [
    {
      title: "Install Flask 3 and run Hello World",
      scenario: "You are starting your first Flask project called hello_flask and want to see 'Hello, World!' in the browser.",
      steps: [
        "Create a folder hello_flask and open it: VS Code -> File > Open Folder; PyCharm -> File > New Project > choose the folder, select 'Project venv' (Python 3.12) and click Create",
        "VS Code: open the terminal (Ctrl+`), run python -m venv .venv, activate it, then press Ctrl+Shift+P > 'Python: Select Interpreter' > choose .venv",
        "Run pip install Flask in the terminal (PyCharm: use the built-in Terminal tab; the venv is already active)",
        "Create app.py with the code below and save",
        "Run flask --app app run --debug and open http://127.0.0.1:5000 in the browser",
        "Press Ctrl+C in the terminal to stop the server",
      ],
      code: `# Project tree
hello_flask/
├── .venv/
├── app.py
└── requirements.txt

# ---- Terminal commands ----
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS / Linux
source .venv/bin/activate

pip install Flask
pip freeze > requirements.txt
flask --app app run --debug

# ---- requirements.txt (main lines) ----
Flask==3.0.3
Werkzeug==3.0.4
Jinja2==3.1.4

# ---- app.py ----
from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "Hello, World!"`,
      result: `Terminal:
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with stat
 * Debugger is active!

Browser at http://127.0.0.1:5000 shows:
Hello, World!`,
      explanation: "Flask(__name__) creates the WSGI application. @app.route('/') registers the home() function for the URL '/'. Whatever the view returns becomes the response body with status 200 and Content-Type text/html. --debug enables auto-reload and the debugger.",
    },
    {
      title: "Multiple routes returning HTML, JSON and a custom status",
      scenario: "A small college site needs a home page, an about page, a JSON health-check for monitoring and a custom 404 message.",
      steps: [
        "Open the hello_flask project in VS Code or PyCharm",
        "Replace app.py with the code below",
        "Run flask --app app run --debug (PyCharm: or right-click app.py > Run, see next example)",
        "Visit /, /about, /api/health and /missing in the browser",
      ],
      code: `# app.py
from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "<h1>Welcome to City College</h1><p>Admissions open for 2026.</p>"


@app.route("/about")
def about():
    return "<h2>About Us</h2><p>Teaching Python since 2010.</p>"


@app.route("/api/health")
def health():
    # A dict is automatically converted to a JSON response
    return {"status": "ok", "version": "1.0"}


@app.errorhandler(404)
def not_found(error):
    # (body, status code) tuple
    return "<h3>Sorry, this page does not exist.</h3>", 404`,
      result: `/            -> big heading 'Welcome to City College' + paragraph (200 OK)
/about       -> 'About Us' heading + paragraph (200 OK)
/api/health  -> {"status": "ok", "version": "1.0"}  (Content-Type: application/json)
/missing     -> 'Sorry, this page does not exist.' (404 NOT FOUND)`,
      explanation: "A view can return an HTML string, a dict/list (JSON), or a tuple (body, status). @app.errorhandler(404) replaces Flask's default 'Not Found' page with your own.",
    },
    {
      title: "Run with python app.py and set up a PyCharm / VS Code run configuration",
      scenario: "Your teammate prefers clicking a green Run button instead of typing commands.",
      steps: [
        "Add the if __name__ == '__main__' block at the end of app.py",
        "Terminal: python app.py",
        "PyCharm Community: right-click app.py > Run 'app'. PyCharm Professional: Run > Edit Configurations > + > Flask Server, Target = app.py, tick FLASK_DEBUG",
        "VS Code: Run and Debug (Ctrl+Shift+D) > create a launch.json file > choose 'Flask' and accept app.py; press F5 to run with breakpoints",
        "Set a breakpoint in home() and refresh the browser to see the debugger stop there",
      ],
      code: `# app.py
from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    message = "Hello from python app.py"
    return message


if __name__ == "__main__":
    # Only for development!
    app.run(debug=True, port=5000)


# ---- .vscode/launch.json (generated by VS Code) ----
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python Debugger: Flask",
            "type": "debugpy",
            "request": "launch",
            "module": "flask",
            "env": {"FLASK_APP": "app.py", "FLASK_DEBUG": "1"},
            "args": ["run", "--no-debugger", "--no-reload"],
            "jinja": true
        }
    ]
}`,
      result: `$ python app.py
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000

Browser: Hello from python app.py`,
      explanation: "app.run() starts the same development server. The __main__ guard means the server starts only when the file is run directly, not when it is imported (for example by Gunicorn or tests). VS Code passes --no-debugger so its own debugger handles breakpoints.",
    },
    {
      title: "Pure Python demo: what a WSGI app really is",
      scenario: "Before trusting Flask, see the tiny contract Flask implements for you: a function that takes environ and start_response.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py (no Flask needed)",
      ],
      code: `@@FD01@@`,
      python: { files: { "main.py": `@@FD01@@` } },
      result: `GET / -> 200 OK
Body: Hello, Flask learners!
GET /about -> 404 NOT FOUND
Body: Page not found`,
      explanation: "A WSGI server (like Gunicorn) calls app(environ, start_response) for each request. Flask's Flask object is exactly such a callable, but it adds routing, request objects, templates and error handling on top so you never write this by hand.",
    },
  ],
  interview: [
    { q: "What is Flask?", a: "Flask is a lightweight WSGI micro web framework for Python, built on Werkzeug (routing, request/response, dev server) and Jinja2 (templates). It provides the core and lets you add features such as ORM, forms and login via extensions.", level: "Easy" },
    { q: "Why is Flask called a micro-framework?", a: "Because its core is small and unopinionated: it has no built-in ORM, form validation or admin. 'Micro' refers to the core size, not to the size of apps you can build.", level: "Easy" },
    { q: "What is WSGI?", a: "Web Server Gateway Interface (PEP 3333). A standard interface between Python web applications and web servers: the server calls app(environ, start_response) and the app returns an iterable of bytes. Gunicorn, uWSGI and Waitress are WSGI servers.", level: "Medium" },
    { q: "Flask vs Django - when would you choose Flask?", a: "For small-to-medium apps, REST APIs, microservices, ML model serving, or when you want full control over structure and libraries. Choose Django when you need an admin panel, auth and ORM out of the box for a large database-driven site.", level: "Medium" },
    { q: "What does Flask(__name__) do?", a: "It creates the application object. __name__ tells Flask the import name of the module so it can locate resources such as the templates and static folders relative to it.", level: "Easy" },
    { q: "What can a Flask view function return?", a: "A str (HTML), bytes, a dict or list (converted to JSON), a Response object, a generator for streaming, or a tuple like (body, status), (body, headers) or (body, status, headers). Returning None raises an error.", level: "Medium" },
    { q: "What does debug mode do and why must it be off in production?", a: "It enables the auto-reloader and the interactive Werkzeug debugger. The debugger lets anyone who sees the error page run Python code on the server, so it is a serious security risk in production.", level: "Medium" },
    { q: "Is the Flask development server suitable for production?", a: "No. It is single-process, not tuned for performance or security. In production use a WSGI server such as Gunicorn (Linux) or Waitress (Windows), usually behind Nginx.", level: "Easy" },
    { q: "Why should you not name your file flask.py?", a: "Python would import your own file instead of the installed flask package when you write 'from flask import Flask', causing an ImportError or circular import.", level: "Easy" },
    { q: "What are the main dependencies installed with Flask?", a: "Werkzeug, Jinja2, MarkupSafe, ItsDangerous, Click and Blinker.", level: "Hard" },
    { q: "What is the difference between 'flask run' and 'python app.py'?", a: "flask run uses the Flask CLI to find the app (via --app or FLASK_APP / app.py) and start the dev server; python app.py runs the file, which only starts a server if it calls app.run() inside the __main__ guard. The CLI is the recommended way.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create a Flask app with routes /, /contact and /services. Each returns a different HTML heading.",
      hint: "One @app.route per function; return an HTML string.",
      solution: `from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "<h1>Home</h1>"


@app.route("/contact")
def contact():
    return "<h1>Contact: info@example.com</h1>"


@app.route("/services")
def services():
    return "<h1>Services: Web, API, Data</h1>"`,
    },
    {
      task: "Add a /api/info route that returns JSON with your name, course and day number.",
      hint: "Return a Python dict.",
      solution: `@app.route("/api/info")
def info():
    return {"name": "Asha", "course": "Flask", "day": 1}`,
    },
    {
      task: "Make the server run on port 8000 with debug on, both with the CLI and with app.run().",
      hint: "CLI flag --port; app.run(port=...).",
      solution: `# CLI
flask --app app run --debug --port 8000

# or in app.py
if __name__ == "__main__":
    app.run(debug=True, port=8000)`,
    },
    {
      task: "Return a custom 'Server is down for maintenance' page with status 503 from /maintenance.",
      hint: "Return a tuple (body, status).",
      solution: `@app.route("/maintenance")
def maintenance():
    return "<h2>Server is down for maintenance</h2>", 503`,
    },
  ],
  quiz: [
    {
      question: "Which two libraries is Flask mainly built on?",
      options: ["Django and Jinja2", "Werkzeug and Jinja2", "SQLAlchemy and Werkzeug", "Requests and Click"],
      answer: 1,
      explanation: "Werkzeug provides the WSGI toolkit and Jinja2 the template engine.",
    },
    {
      question: "What does a dict returned from a Flask view become?",
      options: ["An HTML table", "A plain text response", "A JSON response", "An error"],
      answer: 2,
      explanation: "Since Flask 1.1, dicts (and lists since 2.2) are converted to JSON automatically with Content-Type application/json.",
    },
    {
      question: "Which command runs app.py with the reloader and debugger?",
      options: ["flask --app app run --debug", "python -m flask debug", "flask start app", "pip run app.py"],
      answer: 0,
      explanation: "flask --app app run --debug starts the dev server in debug mode.",
    },
    {
      question: "Which is TRUE about Flask compared with Django?",
      options: ["Flask has a built-in admin panel", "Flask forces a fixed project structure", "Flask ships with its own ORM", "Flask lets you choose libraries through extensions"],
      answer: 3,
      explanation: "Flask is unopinionated; ORM, admin and auth come from extensions.",
    },
    {
      question: "Why should debug mode be OFF in production?",
      options: ["It makes the CSS fail", "The interactive debugger allows running code on the server", "It disables routing", "It deletes the database"],
      answer: 1,
      explanation: "The Werkzeug debugger is a remote code execution risk if exposed.",
    },
  ],
};
