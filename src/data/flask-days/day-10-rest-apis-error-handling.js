export default {
  id: "day-10-rest-apis-error-handling",
  title: "Building REST APIs with Flask (jsonify, request.json), Error Handling",
  module: "Module 3: APIs & Deployment",
  day: 10,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Design and build a RESTful JSON API with Flask 3 and Flask-SQLAlchemy: resource URLs, HTTP verbs, status codes, jsonify and request.get_json, input validation, pagination, consistent JSON error handling, class-based MethodView, CORS and testing with curl, Postman and pytest.",
  objectives: [
    "Explain REST principles: resources, HTTP verbs, statelessness, status codes and JSON representations",
    "Return JSON with jsonify / dicts and read request bodies with request.get_json()",
    "Build a full CRUD API (GET list/detail, POST, PUT/PATCH, DELETE) backed by Flask-SQLAlchemy",
    "Validate input and return consistent JSON errors with errorhandler, HTTPException and a custom APIError",
    "Test APIs with curl, Postman / Thunder Client and the Flask test client",
  ],
  theory: [
    {
      heading: "What is a REST API?",
      content: "An API (Application Programming Interface) lets programs talk to each other. A web API returns data (usually JSON) instead of HTML, so a React app, a mobile app or another server can use it. REST (Representational State Transfer) is a style for designing such APIs around resources (nouns) identified by URLs, manipulated with standard HTTP methods (verbs). Analogy: a restaurant menu (the API) - you do not enter the kitchen; you order by item name (URL) and action (GET to see, POST to order, DELETE to cancel), and the waiter brings a standard plate (JSON).",
      points: [
        "Resources are nouns, plural: /api/tasks, /api/tasks/5 (not /getTasks or /deleteTask?id=5)",
        "Stateless: every request carries all info needed (e.g. auth token); the server keeps no client session",
        "Representations: JSON with Content-Type: application/json",
        "Version your API: /api/v1/tasks",
      ],
    },
    {
      heading: "HTTP Methods and Status Codes for CRUD",
      content: "Each operation maps to a method and a meaningful status code. Clients rely on these codes, so do not return 200 with {'error': ...}.",
      points: [
        "GET /api/tasks -> 200 list; GET /api/tasks/5 -> 200 object or 404",
        "POST /api/tasks -> 201 Created + Location header + created object; 400/422 on invalid data",
        "PUT /api/tasks/5 -> replace whole object (200); PATCH -> partial update (200)",
        "DELETE /api/tasks/5 -> 204 No Content (empty body)",
        "401 Unauthorized (not logged in), 403 Forbidden (no permission), 405 Method Not Allowed, 409 Conflict (duplicate), 415 Unsupported Media Type, 500 Internal Server Error",
        "Idempotent: GET, PUT, DELETE give the same result when repeated; POST does not",
      ],
    },
    {
      heading: "jsonify, Returning dicts, and Reading JSON",
      content: "Return a dict or list from a view and Flask converts it to JSON automatically. jsonify(...) does the same and is handy when you build the response explicitly or pass keyword arguments. Add a status code with a tuple: return jsonify(task), 201. To read the request body use request.get_json(): it parses JSON when Content-Type is application/json. request.json is a shortcut; in Flask 3 it raises 415 Unsupported Media Type if the content type is wrong and 400 if JSON is malformed. request.get_json(silent=True) returns None instead of raising, so you can send your own error message.",
      syntax: "@app.post('/api/tasks')\ndef create_task():\n    data = request.get_json(silent=True) or {}\n    if 'title' not in data:\n        return {'error': 'title is required'}, 400\n    ...\n    return task.to_dict(), 201",
      points: [
        "Models are not JSON serialisable - add a to_dict() method (or use marshmallow / pydantic)",
        "Datetimes: convert with .isoformat()",
        "app.json.sort_keys = False keeps your key order in responses",
        "Never trust client input: validate types, lengths and required fields",
      ],
    },
    {
      heading: "Error Handling that Returns JSON",
      content: "By default Flask returns HTML error pages - bad for API clients. Register handlers that return JSON. @app.errorhandler(404) handles one code; @app.errorhandler(HTTPException) handles all Werkzeug HTTP errors (400, 404, 405, 415 ...) in one place; a custom exception class APIError(status, message) lets you raise errors from anywhere: raise APIError(409, 'Title already exists'). Catch unexpected errors with @app.errorhandler(Exception): log the traceback and return a generic 500 message, never the stack trace.",
      syntax: "from werkzeug.exceptions import HTTPException\n\n@app.errorhandler(HTTPException)\ndef handle_http(e):\n    return {'error': e.name, 'message': e.description, 'status': e.code}, e.code",
      tip: "Interview line: 'We return consistent JSON error bodies with correct status codes using errorhandler for HTTPException and custom exception classes, and never leak stack traces to clients.'",
    },
    {
      heading: "MethodView, CORS and API Tools",
      content: "For clean CRUD code you can use class-based views: flask.views.MethodView with get, post, put, patch, delete methods, registered with app.add_url_rule. When a frontend on another origin (e.g. React at localhost:5173) calls your API, the browser blocks it unless the server sends CORS headers - install Flask-Cors and call CORS(app, resources={r'/api/*': {'origins': '*'}}). For testing: curl in the terminal, Postman or the VS Code 'Thunder Client' / PyCharm 'HTTP Client' (.http files), and the Flask test client in pytest. For bigger APIs consider Flask-Smorest or APIFlask (OpenAPI docs) and token auth (Flask-JWT-Extended).",
      points: [
        "MethodView: one class per resource, one method per verb",
        "CORS is enforced by browsers only; curl/Postman ignore it",
        "PyCharm: create requests.http and click the green arrow next to each request",
      ],
    },
  ],
  examples: [
    {
      title: "Task API: full CRUD with Flask-SQLAlchemy, validation and JSON errors",
      scenario: "Build the backend for a mobile to-do app: list (with pagination and filter), get, create, update, delete tasks.",
      steps: [
        "Create task_api folder and open it in VS Code (select .venv) or PyCharm",
        "pip install Flask Flask-SQLAlchemy Flask-Cors and pip freeze > requirements.txt",
        "Create app.py with the code below",
        "Run flask --app app init-db then flask --app app run --debug",
        "Test with the curl commands (or Thunder Client in VS Code / requests.http in PyCharm - next example)",
      ],
      code: `# Project tree
task_api/
├── app.py
├── requests.http
├── requirements.txt
└── tests/
    └── test_api.py

# ---- requirements.txt ----
Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-Cors==5.0.0

# ---- app.py ----
from datetime import datetime, timezone
from flask import Flask, request, jsonify, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from werkzeug.exceptions import HTTPException


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tasks.db"
app.json.sort_keys = False
db.init_app(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ---------- model ----------
class Task(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), unique=True)
    done: Mapped[bool] = mapped_column(default=False)
    priority: Mapped[int] = mapped_column(default=3)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "done": self.done,
            "priority": self.priority,
            "created_at": self.created_at.isoformat(),
            "url": url_for("get_task", task_id=self.id, _external=True),
        }


# ---------- errors ----------
class APIError(Exception):
    def __init__(self, status, message, details=None):
        super().__init__(message)
        self.status, self.message, self.details = status, message, details


@app.errorhandler(APIError)
def handle_api_error(e):
    body = {"error": e.message, "status": e.status}
    if e.details:
        body["details"] = e.details
    return jsonify(body), e.status


@app.errorhandler(HTTPException)
def handle_http_error(e):
    return jsonify(error=e.name, message=e.description, status=e.code), e.code


@app.errorhandler(Exception)
def handle_unexpected(e):
    app.logger.exception("Unhandled error")
    return jsonify(error="Internal Server Error", status=500), 500


# ---------- validation ----------
def validate_task(data, partial=False):
    if not isinstance(data, dict):
        raise APIError(400, "Request body must be a JSON object")
    errors = {}
    if not partial or "title" in data:
        title = data.get("title")
        if not isinstance(title, str) or not title.strip():
            errors["title"] = "title is required and must be a non-empty string"
        elif len(title) > 120:
            errors["title"] = "title must be at most 120 characters"
    if "done" in data and not isinstance(data["done"], bool):
        errors["done"] = "done must be true or false"
    if "priority" in data and data["priority"] not in (1, 2, 3, 4, 5):
        errors["priority"] = "priority must be an integer 1-5"
    if errors:
        raise APIError(422, "Validation failed", errors)
    return data


# ---------- routes ----------
@app.get("/api/v1/tasks")
def list_tasks():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 50)
    stmt = db.select(Task).order_by(Task.id)
    done = request.args.get("done")
    if done in ("true", "false"):
        stmt = stmt.filter_by(done=(done == "true"))
    p = db.paginate(stmt, page=page, per_page=per_page, error_out=False)
    return {
        "items": [t.to_dict() for t in p.items],
        "page": p.page, "pages": p.pages, "total": p.total,
    }


@app.get("/api/v1/tasks/<int:task_id>")
def get_task(task_id):
    task = db.session.get(Task, task_id)
    if task is None:
        raise APIError(404, f"Task {task_id} not found")
    return task.to_dict()


@app.post("/api/v1/tasks")
def create_task():
    data = validate_task(request.get_json(silent=True))
    if db.session.scalar(db.select(Task).filter_by(title=data["title"].strip())):
        raise APIError(409, "A task with this title already exists")
    task = Task(title=data["title"].strip(), done=data.get("done", False),
                priority=data.get("priority", 3))
    db.session.add(task)
    db.session.commit()
    resp = jsonify(task.to_dict())
    resp.status_code = 201
    resp.headers["Location"] = url_for("get_task", task_id=task.id)
    return resp


@app.route("/api/v1/tasks/<int:task_id>", methods=["PUT", "PATCH"])
def update_task(task_id):
    task = db.get_or_404(Task, task_id)
    data = validate_task(request.get_json(silent=True), partial=(request.method == "PATCH"))
    if "title" in data:
        task.title = data["title"].strip()
    if "done" in data:
        task.done = data["done"]
    if "priority" in data:
        task.priority = data["priority"]
    db.session.commit()
    return task.to_dict()


@app.delete("/api/v1/tasks/<int:task_id>")
def delete_task(task_id):
    task = db.get_or_404(Task, task_id)
    db.session.delete(task)
    db.session.commit()
    return "", 204


@app.cli.command("init-db")
def init_db():
    db.create_all()
    print("Tables created")


# ---- Terminal (curl) ----
curl -X POST http://127.0.0.1:5000/api/v1/tasks -H "Content-Type: application/json" -d '{"title": "Learn REST", "priority": 1}'
curl http://127.0.0.1:5000/api/v1/tasks
curl -X PATCH http://127.0.0.1:5000/api/v1/tasks/1 -H "Content-Type: application/json" -d '{"done": true}'
curl -X POST http://127.0.0.1:5000/api/v1/tasks -H "Content-Type: application/json" -d '{"title": "", "priority": 9}'
curl -i -X DELETE http://127.0.0.1:5000/api/v1/tasks/1
curl http://127.0.0.1:5000/api/v1/tasks/1
curl -X PUT http://127.0.0.1:5000/api/v1/nothing`,
      result: `POST   -> 201 {"id": 1, "title": "Learn REST", "done": false, "priority": 1, "created_at": "2026-11-17T09:30:12.512345", "url": "http://127.0.0.1:5000/api/v1/tasks/1"}
          Location: /api/v1/tasks/1
GET    -> 200 {"items": [{"id": 1, "title": "Learn REST", ...}], "page": 1, "pages": 1, "total": 1}
PATCH  -> 200 {"id": 1, "title": "Learn REST", "done": true, "priority": 1, ...}
POST invalid -> 422 {"error": "Validation failed", "status": 422,
                     "details": {"title": "title is required and must be a non-empty string",
                                 "priority": "priority must be an integer 1-5"}}
DELETE -> HTTP/1.1 204 NO CONTENT  (empty body)
GET deleted -> 404 {"error": "Task 1 not found", "status": 404}
Unknown URL -> 404 {"error": "Not Found", "message": "The requested URL was not found on the server. ...", "status": 404}`,
      explanation: "Every response is JSON with a meaningful status. get_json(silent=True) lets us produce our own 400/422 messages. APIError carries a status and details; the HTTPException handler converts Werkzeug errors (including get_or_404 and 405) into JSON; the Exception handler hides internals for 500s. app.json.sort_keys = False keeps the field order of to_dict().",
    },
    {
      title: "Testing the API in VS Code (Thunder Client) and PyCharm (HTTP Client), plus pytest",
      scenario: "QA wants a repeatable way to call each endpoint and an automated test suite.",
      steps: [
        "PyCharm (Professional, or the HTTP Client plugin): create requests.http, click the green Run arrow next to each request",
        "VS Code: install the 'REST Client' extension to run the same requests.http file (click 'Send Request'), or install 'Thunder Client' and create the requests in its UI",
        "Postman: New > HTTP request > POST http://127.0.0.1:5000/api/v1/tasks > Body > raw > JSON",
        "pip install pytest, create tests/test_api.py and run python -m pytest -q",
      ],
      code: `### ---- requests.http ----
### Create a task
POST http://127.0.0.1:5000/api/v1/tasks
Content-Type: application/json

{"title": "Write tests", "priority": 2}

### List tasks (only open ones)
GET http://127.0.0.1:5000/api/v1/tasks?done=false&page=1&per_page=5

### Mark as done
PATCH http://127.0.0.1:5000/api/v1/tasks/1
Content-Type: application/json

{"done": true}

### Delete
DELETE http://127.0.0.1:5000/api/v1/tasks/1


# ---- tests/test_api.py ----
import pytest
from app import app as flask_app, db


@pytest.fixture
def client():
    flask_app.config.update(TESTING=True, SQLALCHEMY_DATABASE_URI="sqlite:///:memory:")
    with flask_app.app_context():
        db.create_all()
        yield flask_app.test_client()
        db.drop_all()


def test_create_and_get(client):
    r = client.post("/api/v1/tasks", json={"title": "Test task"})
    assert r.status_code == 201
    task_id = r.get_json()["id"]
    r = client.get(f"/api/v1/tasks/{task_id}")
    assert r.get_json()["title"] == "Test task"


def test_validation_error(client):
    r = client.post("/api/v1/tasks", json={"priority": 10})
    assert r.status_code == 422
    assert "title" in r.get_json()["details"]


def test_duplicate_title(client):
    client.post("/api/v1/tasks", json={"title": "Same"})
    r = client.post("/api/v1/tasks", json={"title": "Same"})
    assert r.status_code == 409


def test_delete_then_404(client):
    task_id = client.post("/api/v1/tasks", json={"title": "Temp"}).get_json()["id"]
    assert client.delete(f"/api/v1/tasks/{task_id}").status_code == 204
    assert client.get(f"/api/v1/tasks/{task_id}").status_code == 404


def test_method_not_allowed_is_json(client):
    r = client.put("/api/v1/tasks")
    assert r.status_code == 405
    assert r.get_json()["error"] == "Method Not Allowed"`,
      result: `$ python -m pytest -q
.....                                                        [100%]
5 passed in 0.41s`,
      explanation: "client.post(..., json=...) sets the body and Content-Type for you. The .http file documents the API and runs in both IDEs. Tests cover success, validation, conflict, delete and JSON error format.",
    },
    {
      title: "Same resource with a class-based MethodView",
      scenario: "Refactor the routes into one class per URL to keep CRUD code organised.",
      steps: [
        "Create api_views.py next to app.py (or put it in app.py)",
        "Register the views with add_url_rule as shown",
        "Remove the old function routes and run flask --app app routes",
      ],
      code: `from flask.views import MethodView


class TaskListAPI(MethodView):
    def get(self):
        tasks = db.session.execute(db.select(Task).order_by(Task.id)).scalars()
        return [t.to_dict() for t in tasks]

    def post(self):
        data = validate_task(request.get_json(silent=True))
        task = Task(title=data["title"].strip())
        db.session.add(task)
        db.session.commit()
        return task.to_dict(), 201


class TaskAPI(MethodView):
    def get(self, task_id):
        return db.get_or_404(Task, task_id).to_dict()

    def patch(self, task_id):
        task = db.get_or_404(Task, task_id)
        data = validate_task(request.get_json(silent=True), partial=True)
        for key in ("title", "done", "priority"):
            if key in data:
                setattr(task, key, data[key])
        db.session.commit()
        return task.to_dict()

    def delete(self, task_id):
        db.session.delete(db.get_or_404(Task, task_id))
        db.session.commit()
        return "", 204


app.add_url_rule("/api/v2/tasks", view_func=TaskListAPI.as_view("task_list_v2"))
app.add_url_rule("/api/v2/tasks/<int:task_id>", view_func=TaskAPI.as_view("task_v2"))`,
      result: `$ flask --app app routes | grep v2
task_list_v2  GET, POST              /api/v2/tasks
task_v2       DELETE, GET, PATCH     /api/v2/tasks/<int:task_id>`,
      explanation: "MethodView dispatches by HTTP method to the class method with the same name, and only the defined methods are allowed (others give 405). as_view() turns the class into a view function with an endpoint name.",
    },
    {
      title: "Pure Python demo: request -> status code -> JSON response",
      scenario: "Simulate an API dispatcher to practise choosing the right status code for each situation.",
      steps: [
        "Open VS Code / PyCharm",
        "Create main.py and paste the code",
        "Run with python main.py",
      ],
      code: `@@FD10@@`,
      python: { files: { "main.py": `@@FD10@@` } },
      result: `GET /api/tasks 200 {"tasks": [{"id": 1, "title": "Learn Flask", "done": false}]}
POST /api/tasks 201 {"id": 2, "title": "Build API", "done": false}
POST /api/tasks 400 {"error": "title is required"}
DELETE /api/tasks/9 404 {"error": "task not found"}
DELETE /api/tasks/1 204 null
GET /api/tasks 200 {"tasks": [{"id": 2, "title": "Build API", "done": false}]}`,
      explanation: "json.loads is what request.get_json does; json.dumps is what jsonify does (note Python False becomes false and None becomes null). Each branch returns the conventional status: 201 for create, 400 for bad input, 404 for missing, 204 for delete.",
    },
  ],
  interview: [
    { q: "What is REST?", a: "An architectural style for web services where resources are identified by URLs and manipulated with standard HTTP methods; it is stateless, uses representations like JSON and meaningful status codes.", level: "Easy" },
    { q: "Difference between jsonify and returning a dict?", a: "Both produce a JSON response. Returning a dict is converted by Flask automatically; jsonify builds a Response explicitly (useful to set headers/status or for keyword args). For lists, Flask 2.2+ also auto-converts.", level: "Easy" },
    { q: "Difference between request.json, request.get_json() and get_json(silent=True)?", a: "request.json and get_json() parse JSON and raise errors (415 for wrong Content-Type in Flask 3, 400 for invalid JSON). get_json(silent=True) returns None instead of raising so you can return a custom error; force=True ignores the Content-Type.", level: "Medium" },
    { q: "Difference between PUT and PATCH?", a: "PUT replaces the entire resource with the sent representation; PATCH applies a partial update. Both are typically idempotent in practice, PUT by definition.", level: "Medium" },
    { q: "Which status codes do you return for create, delete, validation error and duplicate?", a: "201 Created (with Location header), 204 No Content, 400 or 422 Unprocessable Entity, 409 Conflict.", level: "Medium" },
    { q: "What does idempotent mean?", a: "Repeating the same request gives the same server state: GET, PUT, DELETE, HEAD are idempotent; POST is not (it creates a new resource each time).", level: "Medium" },
    { q: "How do you return JSON for all HTTP errors in Flask?", a: "Register @app.errorhandler(HTTPException) and return {'error': e.name, 'message': e.description}, e.code. Add handlers for custom exceptions and a generic Exception handler for 500.", level: "Medium" },
    { q: "Why is a SQLAlchemy model not directly JSON serialisable?", a: "It is a Python object with internal state; json only knows dict, list, str, int, float, bool and None. Convert with a to_dict() method or a serializer library (marshmallow, pydantic).", level: "Easy" },
    { q: "What is CORS and how do you enable it in Flask?", a: "Cross-Origin Resource Sharing: browsers block JS requests to a different origin unless the server sends Access-Control-Allow-Origin headers. Use Flask-Cors: CORS(app, resources={r'/api/*': {'origins': 'https://myfrontend.com'}}).", level: "Medium" },
    { q: "What is MethodView?", a: "A class-based view where each HTTP method is a class method (get, post, ...); register with add_url_rule(view_func=MyView.as_view('name')). It keeps resource code organised.", level: "Medium" },
    { q: "How do you paginate an API response?", a: "Accept page and per_page query params (cap per_page), use db.paginate, and return items plus metadata like page, pages, total (and optionally next/prev links).", level: "Easy" },
    { q: "How would you secure a Flask API?", a: "Use HTTPS, token-based auth (JWT with Flask-JWT-Extended or API keys), validate all input, rate limiting (Flask-Limiter), restrict CORS origins, return generic 500 errors and log details server-side.", level: "Hard" },
  ],
  practice: [
    {
      task: "Add GET /api/v1/tasks/stats returning total, done and pending counts.",
      hint: "db.func.count with where(Task.done == True).",
      solution: `@app.get("/api/v1/tasks/stats")
def task_stats():
    total = db.session.scalar(db.select(db.func.count(Task.id)))
    done = db.session.scalar(db.select(db.func.count(Task.id)).where(Task.done.is_(True)))
    return {"total": total, "done": done, "pending": total - done}`,
    },
    {
      task: "Add a search parameter ?q= to the list endpoint that filters titles case-insensitively.",
      hint: "stmt.where(Task.title.ilike(f'%{q}%'))",
      solution: `q = request.args.get("q", "").strip()
if q:
    stmt = stmt.where(Task.title.ilike(f"%{q}%"))`,
    },
    {
      task: "Protect POST/PATCH/DELETE with a simple API key sent in the X-API-Key header (401 if missing/wrong).",
      hint: "A decorator that compares request.headers.get('X-API-Key') with app.config['API_KEY'].",
      solution: `from functools import wraps


def require_api_key(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if request.headers.get("X-API-Key") != app.config.get("API_KEY"):
            raise APIError(401, "Invalid or missing API key")
        return view(*args, **kwargs)
    return wrapped


@app.post("/api/v1/tasks")
@require_api_key
def create_task():
    ...`,
    },
    {
      task: "Write a pytest test that sending plain text (not JSON) to POST /api/v1/tasks returns 400.",
      hint: "client.post(url, data='hello', content_type='text/plain'); our validator raises 400 because get_json(silent=True) returns None.",
      solution: `def test_non_json_body(client):
    r = client.post("/api/v1/tasks", data="hello", content_type="text/plain")
    assert r.status_code == 400
    assert r.get_json()["error"] == "Request body must be a JSON object"`,
    },
  ],
  quiz: [
    {
      question: "Correct status code for a successful DELETE with no body?",
      options: ["200", "201", "204", "404"],
      answer: 2,
      explanation: "204 No Content.",
    },
    {
      question: "Which reads JSON and returns None (no exception) if parsing fails?",
      options: ["request.form", "request.get_json(silent=True)", "request.json", "request.args"],
      answer: 1,
      explanation: "silent=True suppresses parsing errors.",
    },
    {
      question: "Which URL follows REST naming best?",
      options: ["/api/tasks/5", "/api/getTask?id=5", "/api/task_delete/5", "/api/doTasks"],
      answer: 0,
      explanation: "Plural noun + id; the HTTP method gives the action.",
    },
    {
      question: "Which handler catches 404, 405 and 415 errors in one place?",
      options: ["@app.route('/error')", "@app.before_request", "@app.errorhandler(Exception) only", "@app.errorhandler(HTTPException)"],
      answer: 3,
      explanation: "All Werkzeug HTTP errors inherit HTTPException.",
    },
    {
      question: "Which method is NOT idempotent?",
      options: ["GET", "PUT", "POST", "DELETE"],
      answer: 2,
      explanation: "Each POST typically creates a new resource.",
    },
  ],
};
