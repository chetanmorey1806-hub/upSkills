export default {
  id: "day-01-introduction-to-fastapi",
  title: "Introduction to FastAPI: ASGI, Uvicorn and Your First API",
  module: "Module 1: FastAPI Basics",
  day: 1,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn what FastAPI is, why companies choose it for modern Python backends, how ASGI and Uvicorn work, and build and test your first API using the automatic Swagger UI (/docs) and ReDoc (/redoc) documentation.",
  objectives: [
    "Explain what FastAPI is and why it is popular for REST APIs and ML model serving",
    "Understand WSGI vs ASGI and the role of Uvicorn and Starlette",
    "Install FastAPI in a virtual environment and run an app with fastapi dev or uvicorn",
    "Write GET and POST path operations that return JSON",
    "Test endpoints from Swagger UI, ReDoc, the browser and curl",
  ],
  theory: [
    {
      heading: "What is FastAPI and why is it popular?",
      content: "FastAPI is a modern, high-performance Python web framework for building APIs. It was created by Sebastián Ramírez in 2018 and is now one of the most starred Python frameworks on GitHub. It is built on two libraries: **Starlette** (the web/ASGI toolkit that handles requests, routing and responses) and **Pydantic** (data validation using Python type hints).\n\nThe big idea: you write normal Python functions with type hints, and FastAPI uses those hints to validate incoming data, convert types, serialize responses to JSON and generate interactive documentation automatically. Less code, fewer bugs.\n\nCompanies like Microsoft, Uber and Netflix use FastAPI, and in India it is very common in startups and in AI/ML teams that need to serve machine learning models as APIs.",
      points: [
        "Fast to run: performance comparable to Node.js and Go frameworks because it is async (ASGI)",
        "Fast to code: type hints give validation, editor autocomplete and docs for free",
        "Automatic interactive docs at /docs (Swagger UI) and /redoc (ReDoc)",
        "Based on open standards: OpenAPI (formerly Swagger) and JSON Schema",
        "First-class support for async/await, dependency injection and OAuth2/JWT security",
      ],
      tip: "Interview line: 'FastAPI = Starlette for the web parts + Pydantic for the data parts + automatic OpenAPI docs.'",
    },
    {
      heading: "WSGI vs ASGI",
      content: "A Python web server needs a standard way to talk to your framework. **WSGI** (Web Server Gateway Interface) is the older standard used by Flask and classic Django. It is synchronous: one worker handles one request at a time, and while it waits for the database, that worker is blocked.\n\n**ASGI** (Asynchronous Server Gateway Interface) is the modern successor. It supports async code, so while one request waits for a database or external API, the same worker can serve other requests. ASGI also supports WebSockets and long-lived connections. FastAPI is an ASGI framework.",
      points: [
        "WSGI servers: Gunicorn, uWSGI, Waitress (Flask, Django)",
        "ASGI servers: Uvicorn, Hypercorn, Daphne (FastAPI, Starlette, Django Channels)",
        "ASGI = better for I/O-heavy work: many DB calls, HTTP calls to other services, WebSockets",
        "CPU-heavy work (image processing, big calculations) is not made faster by async",
      ],
    },
    {
      heading: "Uvicorn: the server that runs your app",
      content: "FastAPI itself is only a framework; it does not listen on a network port. **Uvicorn** is a lightning-fast ASGI server that receives HTTP requests and passes them to your FastAPI app object.\n\nSince FastAPI 0.111, installing `fastapi[standard]` also installs the `fastapi` CLI. `fastapi dev main.py` starts Uvicorn in development mode with auto-reload, and `fastapi run main.py` starts it in production mode. You can still run Uvicorn directly with `uvicorn main:app --reload`, where `main` is the file name (main.py) and `app` is the variable holding the FastAPI object.",
      syntax: "pip install \"fastapi[standard]\"\n\nfastapi dev main.py              # dev mode, auto reload, port 8000\nfastapi run main.py              # production mode\nuvicorn main:app --reload        # classic way\nuvicorn main:app --host 0.0.0.0 --port 8080",
      tip: "Use --reload only in development. In production run multiple workers, e.g. fastapi run main.py --workers 4.",
    },
    {
      heading: "Installing FastAPI step by step",
      content: "Always use a virtual environment so each project has its own package versions. On Windows activate with `.venv\\Scripts\\activate`; on Linux/macOS use `source .venv/bin/activate`. Then install FastAPI with the standard extras (Uvicorn, the fastapi CLI, httpx, python-multipart, email-validator, Jinja2).\n\nSave versions with `pip freeze > requirements.txt` so teammates and servers can install the same versions using `pip install -r requirements.txt`.",
      points: [
        "python -m venv .venv",
        "Activate the virtual environment",
        "pip install \"fastapi[standard]\" (quotes needed in zsh/PowerShell because of the square brackets)",
        "Create main.py and run fastapi dev main.py",
        "Open http://127.0.0.1:8000/docs",
      ],
    },
    {
      heading: "Anatomy of a FastAPI application",
      content: "A minimal app has three parts: import FastAPI, create an instance `app = FastAPI()`, and declare **path operations** using decorators like `@app.get(\"/\")`. In FastAPI vocabulary: the **path** is the URL part like `/items`, the **operation** is the HTTP method (GET, POST, PUT, PATCH, DELETE), and the decorated function is the **path operation function**.\n\nWhatever you return (dict, list, str, int, Pydantic model) is automatically converted to JSON. Functions can be `def` or `async def`; FastAPI handles both correctly.",
      syntax: "from fastapi import FastAPI\n\napp = FastAPI(title=\"My API\", version=\"1.0.0\")\n\n@app.get(\"/\")\ndef root():\n    return {\"message\": \"Hello World\"}",
      points: [
        "GET = read data, POST = create, PUT = replace, PATCH = partial update, DELETE = remove",
        "Order matters: routes are matched top to bottom",
        "title, description and version in FastAPI() appear in the docs page",
      ],
    },
    {
      heading: "Automatic docs: Swagger UI, ReDoc and OpenAPI",
      content: "FastAPI generates an **OpenAPI schema** (a JSON description of all your endpoints, parameters and models) at `/openapi.json`. Two UIs read this schema:\n\n**Swagger UI** at `/docs` is interactive: click an endpoint, press 'Try it out', fill parameters, press 'Execute' and see the curl command, request URL, response body, status code and headers.\n\n**ReDoc** at `/redoc` is a clean, read-only three-panel documentation page, good for sharing with frontend developers or clients.\n\nBecause the docs come from your code, they never go out of date. Frontend (React/Angular) and mobile teams can even generate client code from openapi.json.",
      points: [
        "/docs - Swagger UI (interactive testing)",
        "/redoc - ReDoc (readable reference docs)",
        "/openapi.json - raw schema",
        "Disable in production if needed: FastAPI(docs_url=None, redoc_url=None)",
      ],
      tip: "Add docstrings and the summary/description/tags parameters on decorators - they show up in Swagger and impress reviewers in interviews and assignments.",
    },
  ],
  examples: [
    {
      title: "Hello World API",
      scenario: "Create your first FastAPI project and see JSON in the browser.",
      steps: [
        "mkdir hello_api && cd hello_api",
        "python -m venv .venv and activate it",
        "pip install \"fastapi[standard]\"",
        "Create main.py with the code below",
        "Run: fastapi dev main.py (or uvicorn main:app --reload)",
        "Open http://127.0.0.1:8000/ in the browser",
      ],
      code: `from fastapi import FastAPI

app = FastAPI(title="Hello API", version="1.0.0")


@app.get("/")
def read_root():
    return {"message": "Hello World", "framework": "FastAPI"}


@app.get("/health")
def health_check():
    return {"status": "ok"}`,
      result: "Terminal: INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)\nBrowser at /: {\"message\":\"Hello World\",\"framework\":\"FastAPI\"}\nBrowser at /health: {\"status\":\"ok\"}",
      explanation: "app is the ASGI application object. @app.get(\"/\") registers read_root for GET requests to /. The returned dict is converted to JSON with Content-Type application/json automatically. The /health endpoint is a common pattern used by load balancers and Docker to check that the service is alive.",
    },
    {
      title: "Explore Swagger UI and ReDoc",
      scenario: "Test the API without writing any frontend or using Postman.",
      steps: [
        "Keep the server from Example 1 running",
        "Open http://127.0.0.1:8000/docs",
        "Click GET /health, then 'Try it out', then 'Execute'",
        "Look at the Curl box, Request URL, Response body and Response code",
        "Open http://127.0.0.1:8000/redoc and http://127.0.0.1:8000/openapi.json",
      ],
      code: `from fastapi import FastAPI

app = FastAPI(
    title="Student Portal API",
    description="APIs for the UpSkillr student portal",
    version="0.1.0",
)


@app.get("/courses", tags=["Courses"], summary="List all courses")
def list_courses():
    """Return every course offered this semester."""
    return [
        {"id": 1, "name": "Python"},
        {"id": 2, "name": "FastAPI"},
    ]`,
      result: "Swagger shows a 'Courses' section with GET /courses 'List all courses' and the docstring as description. Execute shows Response code 200 and the JSON list. ReDoc shows the same endpoint in a three-panel layout. /openapi.json shows {\"openapi\":\"3.1.0\",\"info\":{\"title\":\"Student Portal API\",...}}",
      explanation: "tags groups endpoints in the docs, summary sets the one-line title, and the docstring becomes the description. FastAPI 0.100+ generates OpenAPI 3.1 schema. Everything you see in the docs is generated from the code itself.",
    },
    {
      title: "Multiple HTTP methods on an in-memory list",
      scenario: "Build a tiny notes API with GET and POST using a Python list as a fake database.",
      steps: [
        "Create main.py with the code",
        "fastapi dev main.py",
        "In /docs, run POST /notes with body {\"text\": \"Learn FastAPI\"}",
        "Run GET /notes to see the stored note",
      ],
      code: `from fastapi import FastAPI

app = FastAPI()

notes: list[dict] = []


@app.get("/notes")
def get_notes():
    return {"count": len(notes), "notes": notes}


@app.post("/notes")
def add_note(note: dict):
    note["id"] = len(notes) + 1
    notes.append(note)
    return note`,
      result: "POST /notes with {\"text\": \"Learn FastAPI\"} returns {\"text\":\"Learn FastAPI\",\"id\":1}\nGET /notes returns {\"count\":1,\"notes\":[{\"text\":\"Learn FastAPI\",\"id\":1}]}",
      explanation: "A parameter typed as dict is read from the JSON request body. The list lives in memory, so restarting the server clears it. On Day 3 we replace dict with a Pydantic model for real validation, and on Day 6 we store data in a database.",
    },
    {
      title: "Calling the API with curl and Python",
      scenario: "Backend developers must test APIs from the terminal and from scripts too.",
      steps: [
        "Keep the notes API from Example 3 running",
        "Open a second terminal",
        "Run the curl commands below",
        "Run the Python client with python client.py (httpx is installed with fastapi[standard])",
      ],
      code: `# Terminal (Linux/macOS/Git Bash)
curl http://127.0.0.1:8000/notes
curl -X POST http://127.0.0.1:8000/notes \\
     -H "Content-Type: application/json" \\
     -d '{"text": "Revise ASGI"}'

# client.py
import httpx

r = httpx.post("http://127.0.0.1:8000/notes", json={"text": "From Python"})
print(r.status_code, r.json())
print(httpx.get("http://127.0.0.1:8000/notes").json())`,
      result: "curl GET: {\"count\":0,\"notes\":[]}\ncurl POST: {\"text\":\"Revise ASGI\",\"id\":1}\npython client.py prints: 200 {'text': 'From Python', 'id': 2} and then the full list with 2 notes",
      explanation: "-X sets the method, -H sets a header and -d sends the body. httpx (or requests) is how other Python services call your API. Note the default status for POST is 200; on Day 4 we change it to 201 Created.",
    },
    {
      title: "Sync vs async path functions",
      scenario: "See that FastAPI accepts both def and async def endpoints.",
      steps: [
        "Create main.py with the code",
        "fastapi dev main.py",
        "Open /sync and /async in the browser",
      ],
      code: `import asyncio
import time

from fastapi import FastAPI

app = FastAPI()


@app.get("/sync")
def sync_endpoint():
    time.sleep(1)          # blocking call -> FastAPI runs def in a threadpool
    return {"type": "sync"}


@app.get("/async")
async def async_endpoint():
    await asyncio.sleep(1)  # non-blocking wait
    return {"type": "async"}`,
      result: "/sync returns {\"type\":\"sync\"} after about 1 second\n/async returns {\"type\":\"async\"} after about 1 second",
      explanation: "Both work. A normal def is run in a thread pool so blocking code does not freeze the server. An async def runs on the event loop, so inside it you must only use awaitable (non-blocking) libraries. Never call time.sleep or blocking DB drivers inside async def. Day 9 covers this in depth.",
    },
  ],
  interview: [
    { q: "What is FastAPI?", a: "FastAPI is a modern, high-performance Python web framework for building APIs, based on standard Python type hints. It is built on Starlette (ASGI web toolkit) and Pydantic (data validation). It provides automatic request validation, serialization, dependency injection and interactive OpenAPI docs at /docs and /redoc.", level: "Easy" },
    { q: "Why is FastAPI fast?", a: "Two meanings: (1) runtime speed - it runs on ASGI servers like Uvicorn with an async event loop (uvloop, httptools), so it handles many concurrent I/O-bound requests efficiently; Pydantic v2 validation is written in Rust (pydantic-core). (2) development speed - type hints give validation, editor autocomplete and docs automatically, reducing code and bugs.", level: "Easy" },
    { q: "What is the difference between WSGI and ASGI?", a: "WSGI is a synchronous interface: one request per worker thread at a time, no native async or WebSockets. ASGI is its asynchronous successor: supports async/await, concurrent handling of many requests per worker, WebSockets, HTTP/2 and long-lived connections. Flask/Django use WSGI by default; FastAPI uses ASGI.", level: "Medium" },
    { q: "What is Uvicorn and why do we need it?", a: "Uvicorn is an ASGI web server. FastAPI is just the application; it needs a server that opens a socket, parses HTTP and calls the ASGI app. Command: `uvicorn main:app --reload` where main is the module and app is the FastAPI instance. In production you can run several workers (fastapi run --workers 4, or Gunicorn with Uvicorn workers).", level: "Easy" },
    { q: "What is Starlette's role in FastAPI?", a: "FastAPI is a subclass of Starlette's application. Starlette provides routing, requests/responses, middleware, WebSockets, background tasks, static files, TestClient and more. FastAPI adds type-hint-based validation, dependency injection and OpenAPI generation on top.", level: "Medium" },
    { q: "What is OpenAPI and how does FastAPI use it?", a: "OpenAPI (formerly Swagger specification) is a standard JSON/YAML format to describe REST APIs: paths, parameters, request bodies, responses and security. FastAPI generates it automatically from your path operations and Pydantic models at /openapi.json. Swagger UI (/docs) and ReDoc (/redoc) render it. Tools can generate client SDKs from it.", level: "Medium" },
    { q: "Difference between /docs and /redoc?", a: "/docs serves Swagger UI, an interactive page where you can 'Try it out' and execute requests. /redoc serves ReDoc, a read-only, well-formatted documentation page. Both use the same /openapi.json. They can be renamed or disabled with docs_url and redoc_url parameters.", level: "Easy" },
    { q: "What does uvicorn main:app --reload mean?", a: "main = Python module main.py, app = the variable in that module holding FastAPI(), --reload = restart the server automatically when code changes (development only, it watches files and is slower).", level: "Easy" },
    { q: "Should a path function be def or async def?", a: "Use async def if inside you only await non-blocking libraries (httpx.AsyncClient, async DB drivers, asyncio.sleep). Use plain def if you call blocking libraries (requests, standard SQLAlchemy Session, time.sleep); FastAPI runs def functions in a threadpool so they do not block the event loop. The worst mistake is blocking code inside async def, which freezes all requests.", level: "Hard" },
    { q: "What can a path operation function return?", a: "dict, list, str, int, float, bool, None, Pydantic models, dataclasses, ORM objects (with response_model and from_attributes), or a Response object (JSONResponse, HTMLResponse, RedirectResponse, FileResponse, StreamingResponse). FastAPI uses jsonable_encoder to convert data to JSON-compatible types (datetime -> ISO string, etc.).", level: "Medium" },
    { q: "When would you choose FastAPI over Flask or Django?", a: "FastAPI: pure JSON APIs, microservices, ML model serving, high concurrency, need for automatic validation and docs. Flask: small apps or server-rendered pages with simple needs and a huge extension ecosystem. Django: full-stack apps needing admin panel, ORM, auth, forms out of the box (Django REST Framework for APIs).", level: "Medium" },
  ],
  practice: [
    {
      task: "Create an API with GET / returning {\"app\": \"Library API\"} and GET /about returning your name and city. Run it and view both in the browser and Swagger.",
      hint: "Two functions, each with its own @app.get decorator.",
      solution: `from fastapi import FastAPI

app = FastAPI(title="Library API")


@app.get("/")
def home():
    return {"app": "Library API"}


@app.get("/about")
def about():
    return {"name": "Ravi Kumar", "city": "Pune"}

# Run: fastapi dev main.py  ->  open /, /about and /docs`,
    },
    {
      task: "Change the documentation URLs: Swagger should be at /swagger and ReDoc should be disabled. Add a description and version 2.0.0.",
      hint: "Pass docs_url, redoc_url, description and version to FastAPI().",
      solution: `from fastapi import FastAPI

app = FastAPI(
    title="Library API",
    description="Manage books and members",
    version="2.0.0",
    docs_url="/swagger",
    redoc_url=None,
)


@app.get("/")
def home():
    return {"ok": True}

# /swagger -> Swagger UI, /docs -> 404, /redoc -> 404`,
    },
    {
      task: "Build an in-memory 'cities' API: GET /cities returns the list, POST /cities accepts {\"name\": \"Nagpur\"} and appends it, returning the full list.",
      hint: "Use a module-level list and a dict body parameter.",
      solution: `from fastapi import FastAPI

app = FastAPI()
cities: list[str] = ["Mumbai", "Delhi"]


@app.get("/cities")
def get_cities():
    return cities


@app.post("/cities")
def add_city(body: dict):
    cities.append(body["name"])
    return cities`,
    },
    {
      task: "Add tags and summaries so that Swagger shows two groups, 'Public' (GET /) and 'Admin' (GET /stats returning {\"users\": 120}).",
      hint: "Use tags=[...] and summary=... in the decorator.",
      solution: `from fastapi import FastAPI

app = FastAPI()


@app.get("/", tags=["Public"], summary="Welcome message")
def home():
    return {"message": "Welcome"}


@app.get("/stats", tags=["Admin"], summary="Site statistics")
def stats():
    """Only for admin dashboards."""
    return {"users": 120}`,
    },
  ],
  quiz: [
    { question: "FastAPI is built on top of which two libraries?", options: ["Flask and Marshmallow", "Starlette and Pydantic", "Django and DRF", "Tornado and attrs"], answer: 1, explanation: "Starlette provides the ASGI web layer; Pydantic provides data validation." },
    { question: "In the command uvicorn main:app --reload, what is 'app'?", options: ["The folder name", "The FastAPI instance variable inside main.py", "The HTTP method", "The port number"], answer: 1, explanation: "Format is module:variable. app = FastAPI() in main.py." },
    { question: "Which URL shows interactive Swagger UI by default?", options: ["/swagger", "/redoc", "/docs", "/api"], answer: 2, explanation: "/docs is Swagger UI, /redoc is ReDoc, /openapi.json is the raw schema." },
    { question: "Which server interface does FastAPI use?", options: ["WSGI", "CGI", "ASGI", "FastCGI"], answer: 2, explanation: "FastAPI is an ASGI framework and runs on ASGI servers like Uvicorn." },
    { question: "What does pip install \"fastapi[standard]\" add compared to plain fastapi?", options: ["Django ORM", "Uvicorn, the fastapi CLI and other common extras", "Only Pydantic v1", "Nothing extra"], answer: 1, explanation: "The standard extra includes uvicorn[standard], fastapi-cli, httpx, python-multipart, jinja2 and email-validator." },
    { question: "What happens if you use time.sleep(5) inside an async def endpoint?", options: ["Only that request waits; others continue", "The event loop is blocked, so other requests also wait", "FastAPI raises an error", "It is automatically converted to asyncio.sleep"], answer: 1, explanation: "Blocking calls inside async def block the event loop. Use await asyncio.sleep or a plain def function." },
  ],
};
