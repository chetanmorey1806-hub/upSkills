export default {
  lesson: 'day-01-introduction-to-flask',
  minutes: 25,
  intro: 'Check how the web, WSGI and Flask fit together, predict what a first Flask app returns, and write the plain-Python logic a framework does for you.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Flask is called a **micro-framework**. Which two libraries does Flask itself build on?',
      options: ['Django ORM and Jinja2', 'Werkzeug (WSGI toolkit) and Jinja2 (templates)', 'SQLAlchemy and WTForms', 'Gunicorn and Nginx'],
      answer: 1,
      explain: 'Flask = **Werkzeug** (request/response objects, routing, dev server) + **Jinja2** (template engine) + a small core. "Micro" means it does not force an ORM, forms library or admin on you: you add Flask-SQLAlchemy, Flask-WTF etc. only when you need them. Gunicorn/Nginx are servers that run the app, not parts of Flask.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about HTTP are TRUE? (choose all that apply)',
      options: [
        'The browser (client) sends a request; the server sends back a response',
        'A response has a status code such as 200, 404 or 500',
        'GET is normally used to submit a form that creates data',
        '4xx codes mean the client made a mistake (e.g. 404 Not Found)',
        'A request always has a body, even for GET',
      ],
      answers: [0, 1, 3],
      explain: 'Client sends **request** (method, path, headers, optional body) → server returns **response** (status code, headers, body). 2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error. GET is for **reading**; creating data uses POST. GET requests normally have no body.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that creates the Flask application object:\n\n```\nfrom flask import Flask\napp = Flask(______)\n```',
      accept: ['__name__'],
      caseSensitive: true,
      explain: '`Flask(__name__)` tells Flask the import name of the current module, so it can find the `templates/` and `static/` folders next to your file. Writing `Flask("__name__")` (a string) or `Flask(name)` is a common mistake.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why must `debug=True` (or `flask run --debug`) **never** be used on a live production server?',
      options: [
        'It makes the app slower by 10x',
        'The interactive debugger lets anyone who sees an error page run Python code on your server',
        'It disables all routes except /',
        'It only works on Windows',
      ],
      answer: 1,
      explain: 'Debug mode gives auto-reload and the **Werkzeug interactive debugger**. That debugger can execute Python code from the browser, so on a public server it is a remote-code-execution hole. Use it only on your laptop; in production use Gunicorn/Waitress with debug off.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Flask has a built-in **test client** that sends fake requests without starting a server. What does this program print?',
      code: `from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return 'Namaste, UpSkillr!'

client = app.test_client()
r = client.get('/')
print(r.status_code)
print(r.get_data(as_text=True))
print(client.get('/about').status_code)`,
      expected: '200\nNamaste, UpSkillr!\n404',
      explain: 'A view that returns a string becomes a response with status **200** and that string as the body. There is no route for `/about`, so Flask answers **404 Not Found** automatically.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'A web framework maps a URL path to a function. Write `handle(path)` that uses the dict `ROUTES` (already given in the starter) and returns a tuple `(status, body)`:\n- if the path is in `ROUTES`, return `(200, <the function\'s return value>)`\n- otherwise return `(404, \'Not Found\')`',
      example: { title: 'looking up a function in a dict and calling it', code: "ACTIONS = {'hi': lambda: 'Hello'}\nfn = ACTIONS.get('hi')\nif fn:\n    print(fn())   # Hello" },
      starter: `def home():
    return 'Home page'

def about():
    return 'About UpSkillr'

ROUTES = {'/': home, '/about': about}

def handle(path):
    # TODO: return (200, body) or (404, 'Not Found')
    pass
`,
      solution: `def home():
    return 'Home page'

def about():
    return 'About UpSkillr'

ROUTES = {'/': home, '/about': about}

def handle(path):
    view = ROUTES.get(path)
    if view is None:
        return (404, 'Not Found')
    return (200, view())
`,
      tests: [
        { call: "handle('/')", expect: [200, 'Home page'] },
        { call: "handle('/about')", expect: [200, 'About UpSkillr'] },
        { call: "handle('/contact')", expect: [404, 'Not Found'] },
      ],
      explain: 'This is exactly what `@app.route` builds for you: a table from URL rule to view function. Flask looks up the path, **calls** the view and turns its return value into a 200 response; if nothing matches it returns 404. A common mistake is returning the function itself (`view`) instead of calling it (`view()`).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write `status_class(code)` that returns the category of an HTTP status code:\n- 200-299 → `\'Success\'`\n- 300-399 → `\'Redirect\'`\n- 400-499 → `\'Client Error\'`\n- 500-599 → `\'Server Error\'`\n- anything else → `\'Unknown\'`',
      example: { title: 'checking a range', code: "marks = 72\nif 60 <= marks <= 100:\n    print('First class')" },
      starter: `def status_class(code):
    # TODO
    return ''
`,
      solution: `def status_class(code):
    if 200 <= code <= 299:
        return 'Success'
    if 300 <= code <= 399:
        return 'Redirect'
    if 400 <= code <= 499:
        return 'Client Error'
    if 500 <= code <= 599:
        return 'Server Error'
    return 'Unknown'
`,
      tests: [
        { call: 'status_class(200)', expect: 'Success' },
        { call: 'status_class(201)', expect: 'Success' },
        { call: 'status_class(302)', expect: 'Redirect' },
        { call: 'status_class(404)', expect: 'Client Error' },
        { call: 'status_class(500)', expect: 'Server Error' },
        { call: 'status_class(99)', expect: 'Unknown' },
      ],
      explain: 'Status codes are grouped by their first digit. Knowing the groups helps you debug fast: a **4xx** means the request was wrong (bad URL, missing login), a **5xx** means your server code crashed. Watch the boundaries: 299 is still success, 300 is a redirect.',
    },
  ],
};
