export default {
  id: "day-08-middleware-cors-background-files-routers",
  title: "Middleware, CORS, Background Tasks, File Uploads and APIRouter",
  module: "Module 3: Security & Advanced",
  day: 8,
  level: "Advanced",
  duration: "4 hours",
  summary: "Add production features to your API: write middleware for logging and timing, configure CORS so your React frontend can call the API, run work after the response with BackgroundTasks, accept file uploads with UploadFile, and organise a growing codebase into a clean multi-file project with APIRouter and lifespan events.",
  objectives: [
    "Write HTTP middleware and explain the request/response pipeline",
    "Configure CORSMiddleware correctly and explain why browsers need CORS",
    "Use BackgroundTasks for emails/logs and know when to use Celery instead",
    "Accept single and multiple file uploads plus form fields, with validation",
    "Structure a project with APIRouter, prefixes, tags and a lifespan handler",
  ],
  theory: [
    {
      heading: "What is middleware?",
      content: "Middleware is code that runs for **every request** before it reaches your route, and for every response before it goes back to the client. Think of airport security: every passenger passes through it, regardless of the flight.\n\nIn FastAPI write it with `@app.middleware(\"http\")`. The function receives `request` and `call_next`; you can run code before `await call_next(request)` (e.g. read headers, start a timer) and after it (e.g. add response headers, log status). Middleware added later wraps earlier ones, so the last added runs first on the way in.",
      syntax: "@app.middleware(\"http\")\nasync def add_process_time(request: Request, call_next):\n    start = time.perf_counter()\n    response = await call_next(request)\n    response.headers[\"X-Process-Time\"] = f\"{time.perf_counter() - start:.4f}\"\n    return response",
      points: [
        "Uses: logging, timing, request ids, security headers, simple rate limiting",
        "Built-in: CORSMiddleware, GZipMiddleware, TrustedHostMiddleware, HTTPSRedirectMiddleware",
        "Middleware vs dependency: middleware applies to everything (even 404s and static files); dependencies are per route/router and can inject values",
      ],
    },
    {
      heading: "CORS (Cross-Origin Resource Sharing)",
      content: "An **origin** = protocol + domain + port. `http://localhost:5173` (React/Vite) and `http://localhost:8000` (FastAPI) are different origins. For security, browsers block JavaScript from reading responses from a different origin unless the server explicitly allows it with CORS headers like `Access-Control-Allow-Origin`.\n\nFor non-simple requests (e.g. JSON POST with Authorization header), the browser first sends a **preflight** OPTIONS request. CORSMiddleware answers these automatically.\n\nCORS is enforced only by browsers. curl, Postman and server-to-server calls ignore it, which is why 'it works in Postman but not in React' is a classic CORS symptom.",
      syntax: "from fastapi.middleware.cors import CORSMiddleware\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"http://localhost:5173\", \"https://myapp.com\"],\n    allow_credentials=True,\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)",
      tip: "allow_origins=[\"*\"] cannot be combined with allow_credentials=True for cookies. List exact origins in production.",
    },
    {
      heading: "Background tasks",
      content: "Some work should not make the user wait: sending a welcome email, writing an audit log, generating a thumbnail. Add a `BackgroundTasks` parameter and call `background_tasks.add_task(func, *args)`. FastAPI sends the response first, then runs the task in the same process.\n\nBackgroundTasks is perfect for small, quick jobs. For heavy or critical jobs (video processing, bulk emails, retries, scheduling) use a task queue like **Celery** or **RQ** with Redis/RabbitMQ, or ARQ for async, because background tasks are lost if the server restarts and they consume the web server's resources.",
      syntax: "from fastapi import BackgroundTasks\n\n@app.post(\"/signup\")\ndef signup(email: str, background_tasks: BackgroundTasks):\n    background_tasks.add_task(send_welcome_email, email)\n    return {\"message\": \"Account created\"}",
    },
    {
      heading: "File uploads with UploadFile and Form",
      content: "File uploads use `multipart/form-data`, so they need `python-multipart` (included in fastapi[standard]). Declare `file: UploadFile`. UploadFile gives you `filename`, `content_type`, `size` and a spooled file object (kept in memory up to a limit, then on disk) with async methods `await file.read()`, `await file.write()`, `await file.seek()`.\n\nYou cannot mix JSON body and files in one request; send extra data as `Form()` fields. For many files use `files: list[UploadFile]`. Always validate type and size, and never trust the client's filename (generate your own, e.g. with uuid4) to avoid path traversal attacks.",
      syntax: "from fastapi import File, Form, UploadFile\n\n@app.post(\"/upload\")\nasync def upload(file: UploadFile, title: Annotated[str, Form()]):\n    content = await file.read()\n    return {\"name\": file.filename, \"size\": len(content), \"title\": title}",
      points: [
        "bytes = File() reads the whole file into memory - only for small files",
        "UploadFile streams to disk after a threshold - better for big files",
        "Serve uploaded files with app.mount(\"/media\", StaticFiles(directory=\"uploads\"))",
        "Production: store files in S3/Cloudinary/Azure Blob, keep only the URL in the DB",
      ],
    },
    {
      heading: "Structuring big apps with APIRouter",
      content: "One main.py with 50 endpoints becomes unreadable. `APIRouter` works like a mini FastAPI app (similar to Flask Blueprints). Create one router per feature (users, tasks, auth), set a `prefix`, `tags` and shared `dependencies`, then register it with `app.include_router(router)`.",
      syntax: "app/\n├── main.py            # create app, middleware, include routers\n├── core/config.py     # settings (pydantic-settings)\n├── db.py              # engine, SessionLocal, get_db\n├── models/            # SQLAlchemy models\n├── schemas/           # Pydantic schemas\n├── routers/\n│   ├── auth.py\n│   ├── users.py\n│   └── tasks.py\n└── services/          # business logic",
      points: [
        "router = APIRouter(prefix=\"/tasks\", tags=[\"Tasks\"])",
        "app.include_router(tasks.router, prefix=\"/api/v1\") for API versioning",
        "Routers can include other routers",
        "Run with: fastapi dev app/main.py or uvicorn app.main:app --reload",
      ],
    },
    {
      heading: "Lifespan: startup and shutdown logic",
      content: "Some resources should be created once when the app starts and closed when it stops: DB connection pools, ML models, Redis clients, HTTP clients. Use the `lifespan` parameter with an async context manager. Code before `yield` runs at startup, code after `yield` at shutdown. The older `@app.on_event(\"startup\")` style is deprecated.",
      syntax: "from contextlib import asynccontextmanager\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    app.state.model = load_ml_model()\n    yield\n    app.state.model = None\n\napp = FastAPI(lifespan=lifespan)",
    },
  ],
  examples: [
    {
      title: "Logging and timing middleware with request IDs",
      scenario: "Operations team wants every request logged with method, path, status, time taken and a unique request id.",
      steps: [
        "pip install \"fastapi[standard]\"",
        "Save main.py and run fastapi dev main.py",
        "curl -i http://127.0.0.1:8000/hello and look at the response headers and the terminal",
      ],
      code: `import logging
import time
import uuid

from fastapi import FastAPI, Request

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("api")

app = FastAPI()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-ms"] = f"{duration_ms:.2f}"
    logger.info("%s %s %s -> %s in %.2fms", request_id, request.method,
                request.url.path, response.status_code, duration_ms)
    return response


@app.get("/hello")
async def hello():
    return {"msg": "hi"}`,
      result: "HTTP/1.1 200 OK\ncontent-type: application/json\nx-request-id: 3f2a9c1e\nx-process-time-ms: 0.41\n\n{\"msg\":\"hi\"}\nTerminal: 2026-11-18 10:20:01,123 INFO 3f2a9c1e GET /hello -> 200 in 0.41ms",
      explanation: "Code before call_next runs on the way in, code after runs on the way out. The request id helps trace a single request across logs and microservices. Middleware also logs 404s, because it wraps the whole app.",
    },
    {
      title: "CORS for a React (Vite) frontend",
      scenario: "A React app on http://localhost:5173 calls the FastAPI backend on port 8000 and gets a CORS error.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "In the React app run: fetch('http://localhost:8000/api/courses').then(r => r.json()).then(console.log)",
        "Without middleware the browser console shows a CORS error; add the middleware and retry",
      ],
      code: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",      # Vite dev server
    "http://localhost:3000",      # Create React App / Next.js
    "https://upskillr.example.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/api/courses")
def courses():
    return [{"id": 1, "name": "FastAPI"}]`,
      result: "Before: browser console -> Access to fetch at 'http://localhost:8000/api/courses' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.\nAfter: console logs [{id: 1, name: 'FastAPI'}] and the response has header access-control-allow-origin: http://localhost:5173",
      explanation: "The browser compares the page origin with the API origin and only exposes the response if the server's CORS headers allow it. Preflight OPTIONS requests for Authorization headers are answered by the middleware automatically. Postman never had this problem because CORS is a browser rule.",
    },
    {
      title: "Background task: send welcome email after signup",
      scenario: "Signup must respond instantly; the slow email sending happens after the response.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "POST /signup?email=asha@gmail.com in Swagger",
        "Notice the instant response, then the log lines appear 3 seconds later",
      ],
      code: `import time
from datetime import datetime

from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def send_welcome_email(email: str):
    time.sleep(3)   # simulate slow SMTP call
    print(f"Email sent to {email}")


def write_audit_log(message: str):
    with open("audit.log", "a") as f:
        f.write(f"{datetime.now().isoformat()} {message}\\n")


@app.post("/signup", status_code=201)
def signup(email: str, background_tasks: BackgroundTasks):
    # ... save user to DB here ...
    background_tasks.add_task(send_welcome_email, email)
    background_tasks.add_task(write_audit_log, f"new signup {email}")
    return {"message": "Account created, check your inbox"}`,
      result: "Response (immediately): 201 {\"message\":\"Account created, check your inbox\"}\nAfter ~3 s terminal: Email sent to asha@gmail.com\naudit.log: 2026-11-18T10:25:00.123456 new signup asha@gmail.com",
      explanation: "Tasks run in order after the response is sent. Plain def tasks run in a threadpool so time.sleep does not block the event loop. If the task must survive a crash or needs retries, use Celery/RQ instead.",
    },
    {
      title: "Upload a profile photo with validation",
      scenario: "Students upload a JPG/PNG up to 2 MB along with a caption; the file is saved with a safe unique name and served back.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "In /docs, POST /students/1/photo, choose an image file and enter a caption",
        "Open the returned url in the browser",
        "curl: curl -F \"file=@photo.jpg\" -F \"caption=Me\" http://127.0.0.1:8000/students/1/photo",
      ],
      code: `import uuid
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, Form, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png"}
MAX_SIZE = 2 * 1024 * 1024  # 2 MB

app = FastAPI()
app.mount("/media", StaticFiles(directory=UPLOAD_DIR), name="media")


@app.post("/students/{student_id}/photo", status_code=201)
async def upload_photo(student_id: int, file: UploadFile, caption: Annotated[str, Form()] = ""):
    if file.content_type not in ALLOWED:
        raise HTTPException(415, "Only JPG and PNG images are allowed")
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(413, "File too large (max 2 MB)")
    name = f"{student_id}_{uuid.uuid4().hex}{ALLOWED[file.content_type]}"
    (UPLOAD_DIR / name).write_bytes(data)
    return {"original_name": file.filename, "size_kb": round(len(data) / 1024, 1),
            "caption": caption, "url": f"/media/{name}"}


@app.post("/documents")
async def upload_many(files: list[UploadFile]):
    return [{"name": f.filename, "type": f.content_type} for f in files]`,
      result: "201 {\"original_name\":\"photo.jpg\",\"size_kb\":184.3,\"caption\":\"Me\",\"url\":\"/media/1_5f1c9e...e2.jpg\"}\nOpening http://127.0.0.1:8000/media/1_5f1c9e...e2.jpg shows the image\nUploading a PDF -> 415 {\"detail\":\"Only JPG and PNG images are allowed\"}\nUploading a 5 MB image -> 413 {\"detail\":\"File too large (max 2 MB)\"}",
      explanation: "UploadFile + Form fields make the endpoint multipart/form-data; Swagger shows a file picker. The generated uuid filename prevents overwriting and path traversal (e.g. '../../main.py'). content_type comes from the client, so for strict security also check the file's magic bytes (e.g. with Pillow). StaticFiles serves the folder.",
    },
    {
      title: "Multi-file project with APIRouter and lifespan",
      scenario: "Refactor a growing API into routers with versioned prefixes.",
      steps: [
        "Create the folder structure below (each folder gets an empty __init__.py)",
        "From the project root run: fastapi dev app/main.py",
        "Open /docs - endpoints are grouped by tags under /api/v1",
      ],
      code: `# app/routers/users.py
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
def list_users():
    return [{"id": 1, "name": "Asha"}]


@router.get("/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "Asha"}

# app/routers/tasks.py
from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/")
def list_tasks():
    return [{"id": 1, "title": "Revise JWT"}]

# app/main.py
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import tasks, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Startup: connect DB pool, load config")
    yield
    print("Shutdown: close connections")


app = FastAPI(title="UpSkillr API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                   allow_methods=["*"], allow_headers=["*"])

app.include_router(users.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}`,
      result: "Terminal: Startup: connect DB pool, load config\n/docs shows groups 'Users' (GET /api/v1/users/, GET /api/v1/users/{user_id}) and 'Tasks' (GET /api/v1/tasks/)\nGET /api/v1/tasks/ -> [{\"id\":1,\"title\":\"Revise JWT\"}]\nCTRL+C -> Shutdown: close connections",
      explanation: "Each router owns one feature. Prefixes combine: /api/v1 + /users + /{user_id}. Versioning with /api/v1 lets you introduce /api/v2 without breaking old mobile apps. lifespan replaces the deprecated on_event handlers.",
    },
  ],
  interview: [
    { q: "What is middleware in FastAPI?", a: "A function or class that wraps the entire application, running for every request before route handling and for every response afterwards. Created with @app.middleware('http') (receives request and call_next) or app.add_middleware(MiddlewareClass, ...). Used for logging, timing, CORS, GZip, security headers, request ids.", level: "Easy" },
    { q: "Middleware vs dependency: when to use which?", a: "Middleware: cross-cutting concerns for all requests (logging, CORS, compression), cannot easily inject values into endpoints, also runs for 404s and static files. Dependencies: per-route or per-router logic that can inject values (DB session, current user), appear in OpenAPI and are easy to override in tests. Auth is usually a dependency, not middleware.", level: "Medium" },
    { q: "What is CORS and why do we need it?", a: "Cross-Origin Resource Sharing is a browser security mechanism. Browsers block JS from reading responses from a different origin (scheme+host+port) unless the server sends Access-Control-Allow-* headers. A React app on localhost:5173 calling FastAPI on localhost:8000 needs CORSMiddleware with that origin allowed.", level: "Easy" },
    { q: "What is a preflight request?", a: "An automatic OPTIONS request the browser sends before a non-simple cross-origin request (e.g. methods like PUT/DELETE, JSON content type, Authorization header). The server must respond with allowed origin, methods and headers; only then does the browser send the real request.", level: "Medium" },
    { q: "Why does an API work in Postman but fail in the browser?", a: "Most often CORS: Postman is not a browser and does not enforce the same-origin policy. Fix by configuring CORSMiddleware with the frontend's exact origin, methods and headers.", level: "Easy" },
    { q: "BackgroundTasks vs Celery?", a: "BackgroundTasks run in the same process after the response; simple, no infrastructure, but tasks are lost on crash/restart, no retries, scheduling or monitoring, and they consume web server resources. Celery/RQ use a broker (Redis/RabbitMQ) and separate workers: reliable, retries, scaling, scheduling (beat). Use BackgroundTasks for small jobs like a notification email or log, Celery for heavy/critical jobs.", level: "Medium" },
    { q: "UploadFile vs bytes = File()?", a: "bytes reads the whole file into memory at once - fine for tiny files. UploadFile uses a SpooledTemporaryFile (memory then disk), exposes filename, content_type, size and async read/write/seek methods, and is better for large files. Both require python-multipart.", level: "Medium" },
    { q: "How do you secure file uploads?", a: "Validate content type and also magic bytes, limit size, generate your own filenames (uuid) instead of using client names to prevent path traversal, store outside the code directory or in object storage (S3), scan for malware if needed, and serve with correct Content-Type and Content-Disposition.", level: "Hard" },
    { q: "What is APIRouter and why use it?", a: "APIRouter groups related path operations into modules, like Flask Blueprints. Supports prefix, tags, dependencies, responses. Registered with app.include_router(). Benefits: modular code, team ownership per feature, shared auth dependencies per router, API versioning via prefixes.", level: "Easy" },
    { q: "What is the lifespan event and what replaced on_event?", a: "lifespan is an async context manager passed to FastAPI(lifespan=...). Code before yield runs at startup (connect DB pool, load ML model, create httpx client), after yield at shutdown (close resources). It replaces @app.on_event('startup'/'shutdown'), which is deprecated.", level: "Medium" },
    { q: "In what order do multiple middlewares execute?", a: "Each added middleware wraps the existing stack, so the last one added is the outermost: it runs first on the request and last on the response. Order matters, e.g. CORSMiddleware is usually added last so it also handles errors produced by inner middlewares.", level: "Hard" },
  ],
  practice: [
    {
      task: "Write middleware that blocks requests whose User-Agent header contains 'BadBot' with a 403 JSON response, and adds X-Frame-Options: DENY to all other responses.",
      hint: "Return a JSONResponse directly from middleware without calling call_next.",
      solution: `from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


@app.middleware("http")
async def security(request: Request, call_next):
    if "BadBot" in request.headers.get("user-agent", ""):
        return JSONResponse(status_code=403, content={"detail": "Bots not allowed"})
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    return response`,
    },
    {
      task: "Create POST /reports that returns {\"status\": \"queued\"} immediately and generates a CSV report file reports/<uuid>.csv in the background.",
      hint: "Use csv.writer inside a function added with background_tasks.add_task.",
      solution: `import csv
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI

app = FastAPI()
Path("reports").mkdir(exist_ok=True)


def build_report(report_id: str):
    rows = [("student", "marks"), ("Asha", 91), ("Ravi", 78)]
    with open(f"reports/{report_id}.csv", "w", newline="") as f:
        csv.writer(f).writerows(rows)


@app.post("/reports", status_code=202)
def create_report(background_tasks: BackgroundTasks):
    report_id = uuid.uuid4().hex
    background_tasks.add_task(build_report, report_id)
    return {"status": "queued", "report_id": report_id}`,
    },
    {
      task: "Create POST /resume that accepts a PDF file (max 1 MB) plus form fields name and email, saves it as resumes/<email>.pdf and returns its size.",
      hint: "content_type == 'application/pdf'; Form() for the text fields.",
      solution: `from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, Form, HTTPException, UploadFile

app = FastAPI()
Path("resumes").mkdir(exist_ok=True)


@app.post("/resume", status_code=201)
async def upload_resume(
    file: UploadFile,
    name: Annotated[str, Form()],
    email: Annotated[str, Form()],
):
    if file.content_type != "application/pdf":
        raise HTTPException(415, "PDF only")
    data = await file.read()
    if len(data) > 1024 * 1024:
        raise HTTPException(413, "Max 1 MB")
    safe = email.replace("@", "_at_").replace("/", "")
    Path("resumes", f"{safe}.pdf").write_bytes(data)
    return {"name": name, "size_bytes": len(data)}`,
    },
    {
      task: "Split an app into routers: auth.py (POST /auth/login), courses.py (GET /courses, GET /courses/{id}) and include them in main.py under /api/v1. Courses router must require an X-Token header via a router-level dependency.",
      hint: "APIRouter(prefix=..., tags=..., dependencies=[Depends(verify_token)]).",
      solution: `# app/deps.py
from typing import Annotated
from fastapi import Header, HTTPException


def verify_token(x_token: Annotated[str, Header()]):
    if x_token != "letmein":
        raise HTTPException(401, "Invalid token")

# app/routers/auth.py
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login():
    return {"token": "letmein"}

# app/routers/courses.py
from fastapi import APIRouter, Depends
from app.deps import verify_token

router = APIRouter(prefix="/courses", tags=["Courses"], dependencies=[Depends(verify_token)])


@router.get("/")
def list_courses():
    return [{"id": 1, "name": "FastAPI"}]


@router.get("/{course_id}")
def get_course(course_id: int):
    return {"id": course_id, "name": "FastAPI"}

# app/main.py
from fastapi import FastAPI
from app.routers import auth, courses

app = FastAPI()
app.include_router(auth.router, prefix="/api/v1")
app.include_router(courses.router, prefix="/api/v1")`,
    },
  ],
  quiz: [
    { question: "Which origins are different from http://localhost:5173?", options: ["http://localhost:5173/about", "http://localhost:8000", "Both are the same origin", "None"], answer: 1, explanation: "A different port means a different origin; the path does not matter." },
    { question: "Where do BackgroundTasks run?", options: ["In a separate Celery worker", "In the same process after the response is sent", "In the browser", "Before the endpoint"], answer: 1, explanation: "They run in the web process after sending the response." },
    { question: "Which package is required for UploadFile and Form?", options: ["aiofiles", "python-multipart", "requests", "pillow"], answer: 1, explanation: "Multipart form parsing needs python-multipart (included in fastapi[standard])." },
    { question: "What is the modern way to run code at startup and shutdown?", options: ["@app.on_event('startup')", "lifespan async context manager", "__init__.py", "Middleware"], answer: 1, explanation: "lifespan replaced the deprecated on_event handlers." },
    { question: "app.include_router(users.router, prefix=\"/api/v1\") with router prefix \"/users\" and route \"/{id}\" gives which path?", options: ["/users/{id}", "/api/v1/{id}", "/api/v1/users/{id}", "/users/api/v1/{id}"], answer: 2, explanation: "Prefixes are concatenated: include prefix + router prefix + route path." },
    { question: "Inside @app.middleware(\"http\"), what does await call_next(request) do?", options: ["Skips the route", "Passes the request to the next layer/route and returns its response", "Restarts the server", "Calls the next middleware only on errors"], answer: 1, explanation: "call_next forwards the request down the stack and returns the response." },
  ],
};
