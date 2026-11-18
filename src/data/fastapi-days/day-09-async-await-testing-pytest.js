export default {
  id: "day-09-async-await-testing-pytest",
  title: "Async/Await in FastAPI and Testing with TestClient + pytest",
  module: "Module 3: Security & Advanced",
  day: 9,
  level: "Advanced",
  duration: "4 hours",
  summary: "Understand concurrency, the event loop and when to use async def vs def in FastAPI, call external APIs concurrently with httpx.AsyncClient and asyncio.gather, and write automated tests with TestClient, pytest fixtures, dependency overrides and a separate test database.",
  objectives: [
    "Explain concurrency vs parallelism, the event loop and I/O-bound vs CPU-bound work",
    "Choose correctly between async def and def and avoid blocking the event loop",
    "Use httpx.AsyncClient and asyncio.gather for concurrent external calls",
    "Write tests with TestClient and pytest, including auth and validation cases",
    "Use fixtures, dependency_overrides and an in-memory SQLite DB for isolated tests",
  ],
  theory: [
    {
      heading: "Concurrency, parallelism and the event loop",
      content: "**Concurrency** means dealing with many tasks at once by switching between them while they wait. **Parallelism** means literally doing many things at the same moment on multiple CPU cores.\n\nAnalogy: a single chef (one thread) puts rice to boil, and while waiting chops vegetables, then stirs dal. That is concurrency. Four chefs cooking at the same time is parallelism.\n\nPython's `asyncio` uses an **event loop**: a single thread that runs coroutines. When a coroutine hits `await` on I/O (network, DB, file), it pauses and the loop runs another coroutine. This is ideal for web APIs, which spend most of their time waiting for databases and other services (**I/O-bound**). For **CPU-bound** work (image processing, ML training, heavy loops), async does not help; use multiple processes or a task queue.",
      points: [
        "async def defines a coroutine function; calling it returns a coroutine object",
        "await pauses the current coroutine until the awaited operation completes",
        "asyncio.gather runs several awaitables concurrently and collects results",
        "Uvicorn runs your FastAPI app on an event loop (uvloop when installed)",
      ],
    },
    {
      heading: "async def vs def in FastAPI",
      content: "FastAPI supports both, and handles them differently:\n\n`async def` endpoints run **directly on the event loop**. They are fastest when everything inside is awaitable (httpx.AsyncClient, asyncpg, SQLAlchemy AsyncSession, aiofiles, asyncio.sleep). If you call a blocking function inside (requests.get, time.sleep, sync DB session), the **whole server freezes** for all users during that call.\n\n`def` endpoints run in an **external threadpool** (AnyIO, default 40 threads), so blocking calls are safe and do not stop the event loop.\n\nRule of thumb: if the library you use supports `await`, use async def. If not, or you are unsure, use def. The same applies to dependencies.",
      tip: "If you must call blocking code from async def, use `await run_in_threadpool(func, *args)` from fastapi.concurrency (or asyncio.to_thread).",
    },
    {
      heading: "Concurrent calls with httpx.AsyncClient",
      content: "Backend services often call other APIs: payment gateway, SMS provider, weather API, other microservices. With `httpx.AsyncClient` you can make these calls without blocking, and with `asyncio.gather` you can run several at once so the total time is about the slowest call instead of the sum.\n\nCreate one AsyncClient per app (in lifespan) and reuse it - it keeps a connection pool. Always set timeouts.",
      syntax: "async with httpx.AsyncClient(timeout=5) as client:\n    r1, r2 = await asyncio.gather(\n        client.get(\"https://api.one.com/data\"),\n        client.get(\"https://api.two.com/data\"),\n    )",
    },
    {
      heading: "Async database access (overview)",
      content: "SQLAlchemy 2.0 supports async with `create_async_engine` and `AsyncSession`, using async drivers: `sqlite+aiosqlite:///./app.db`, `postgresql+asyncpg://...`. Every DB call is awaited: `await session.execute(select(User))`, `await session.commit()`. Lazy loading does not work in async mode, so use `selectinload` for relationships.\n\nIs async DB always faster? Not necessarily. For typical CRUD apps, sync SQLAlchemy in def endpoints is simple and performs well. Async shines with very high concurrency and many slow I/O calls.",
      syntax: "engine = create_async_engine(\"sqlite+aiosqlite:///./app.db\")\nSessionLocal = async_sessionmaker(engine, expire_on_commit=False)\n\nasync def get_db():\n    async with SessionLocal() as session:\n        yield session",
    },
    {
      heading: "Testing with TestClient and pytest",
      content: "Automated tests catch bugs before users do and are expected in every job assignment. FastAPI's `TestClient` (built on httpx) calls your app directly in memory - no server needed. Use it with **pytest**: functions starting with `test_` in files named `test_*.py`, with plain `assert` statements.\n\nWhat to test: status codes, response JSON, validation errors (422), auth failures (401/403), not-found cases (404), and business rules. Run with `pytest -v`; measure coverage with `pytest --cov=app` (pytest-cov).",
      syntax: "from fastapi.testclient import TestClient\nfrom main import app\n\nclient = TestClient(app)\n\ndef test_root():\n    response = client.get(\"/\")\n    assert response.status_code == 200\n    assert response.json() == {\"message\": \"Hello\"}",
      points: [
        "pip install pytest (httpx comes with fastapi[standard])",
        "Use `with TestClient(app) as client:` to also run lifespan startup/shutdown",
        "client.post(url, json=...), data=... for forms, files=... for uploads, headers=... for tokens",
      ],
    },
    {
      heading: "Fixtures, test databases and async tests",
      content: "**Fixtures** are reusable setup functions declared with `@pytest.fixture`; tests receive them as parameters. Put shared fixtures in `conftest.py`. A fixture with yield gives setup and teardown, like FastAPI yield dependencies.\n\nNever test against your real database. Override `get_db` with a session bound to an **in-memory SQLite** database (using StaticPool so all connections share the same memory DB), create tables before each test, and drop them after. For async tests use `pytest-anyio` / `pytest-asyncio` with `httpx.AsyncClient(transport=ASGITransport(app=app), base_url=\"http://test\")`.",
      tip: "Interview line: 'I override get_db with an in-memory SQLite session and get_current_user with a fake user using dependency_overrides, so each test is fast and isolated.'",
    },
  ],
  examples: [
    {
      title: "Sequential vs concurrent with asyncio (offline)",
      scenario: "Prove that concurrent awaiting is faster for I/O waits. Runs with the standard library only.",
      steps: [
        "Save as main.py and run python main.py",
        "Compare the two timings",
      ],
      code: `import asyncio
import time


async def fetch(service: str, delay: float) -> str:
    await asyncio.sleep(delay)          # pretend this is a network call
    return f"{service} done in {delay}s"


async def sequential():
    start = time.perf_counter()
    a = await fetch("payments", 1)
    b = await fetch("inventory", 1)
    c = await fetch("shipping", 1)
    print([a, b, c], f"sequential: {time.perf_counter() - start:.1f}s")


async def concurrent():
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch("payments", 1),
        fetch("inventory", 1),
        fetch("shipping", 1),
    )
    print(results, f"concurrent: {time.perf_counter() - start:.1f}s")


asyncio.run(sequential())
asyncio.run(concurrent())`,
      python: {
        files: {
          "main.py": `import asyncio
import time


async def fetch(service: str, delay: float) -> str:
    await asyncio.sleep(delay)          # pretend this is a network call
    return f"{service} done in {delay}s"


async def sequential():
    start = time.perf_counter()
    a = await fetch("payments", 1)
    b = await fetch("inventory", 1)
    c = await fetch("shipping", 1)
    print([a, b, c], f"sequential: {time.perf_counter() - start:.1f}s")


async def concurrent():
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch("payments", 1),
        fetch("inventory", 1),
        fetch("shipping", 1),
    )
    print(results, f"concurrent: {time.perf_counter() - start:.1f}s")


asyncio.run(sequential())
asyncio.run(concurrent())
`,
        },
      },
      result: "['payments done in 1s', 'inventory done in 1s', 'shipping done in 1s'] sequential: 3.0s\n['payments done in 1s', 'inventory done in 1s', 'shipping done in 1s'] concurrent: 1.0s",
      explanation: "Each await asyncio.sleep(1) yields control to the event loop. With gather, all three waits overlap on a single thread, so the total time is about 1 second. This is exactly what FastAPI does when many requests wait for I/O at the same time.",
    },
    {
      title: "Async endpoint calling external APIs concurrently",
      scenario: "A dashboard endpoint aggregates data from two external services in parallel, using a shared AsyncClient created in lifespan.",
      steps: [
        "pip install \"fastapi[standard]\" (includes httpx)",
        "Save main.py and run fastapi dev main.py",
        "Open /dashboard/1 and check the elapsed time in the response",
      ],
      code: `import asyncio
import time
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.concurrency import run_in_threadpool


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(timeout=10)
    yield
    await app.state.http.aclose()


app = FastAPI(lifespan=lifespan)
BASE = "https://jsonplaceholder.typicode.com"


def legacy_report(user_id: int) -> dict:      # blocking library code
    time.sleep(0.5)
    return {"score": 87}


@app.get("/dashboard/{user_id}")
async def dashboard(user_id: int, request: Request):
    client: httpx.AsyncClient = request.app.state.http
    start = time.perf_counter()
    try:
        user_r, posts_r = await asyncio.gather(
            client.get(f"{BASE}/users/{user_id}"),
            client.get(f"{BASE}/posts", params={"userId": user_id}),
        )
    except httpx.HTTPError:
        raise HTTPException(502, "Upstream service unavailable")
    report = await run_in_threadpool(legacy_report, user_id)  # safe for blocking code
    return {
        "name": user_r.json().get("name"),
        "posts": len(posts_r.json()),
        "report": report,
        "elapsed_s": round(time.perf_counter() - start, 2),
    }`,
      result: "GET /dashboard/1 -> {\"name\":\"Leanne Graham\",\"posts\":10,\"report\":{\"score\":87},\"elapsed_s\":0.83}\n(If the external API is unreachable -> 502 {\"detail\":\"Upstream service unavailable\"})",
      explanation: "Both HTTP calls run concurrently. The AsyncClient is created once and reused (connection pooling) and closed at shutdown. The blocking legacy function is moved to a thread with run_in_threadpool so the event loop keeps serving other requests. 502 is the correct code when an upstream dependency fails.",
    },
    {
      title: "First tests with TestClient and pytest",
      scenario: "Test a small items API: success, validation error and not-found cases.",
      steps: [
        "pip install \"fastapi[standard]\" pytest",
        "Create main.py and test_main.py in the same folder",
        "Run pytest -v",
      ],
      code: `# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()
ITEMS: dict[int, dict] = {1: {"id": 1, "name": "Pen", "price": 10.0}}


class ItemIn(BaseModel):
    name: str = Field(min_length=2)
    price: float = Field(gt=0)


@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id not in ITEMS:
        raise HTTPException(404, "Item not found")
    return ITEMS[item_id]


@app.post("/items", status_code=201)
def create_item(item: ItemIn):
    new_id = max(ITEMS) + 1
    ITEMS[new_id] = {"id": new_id, **item.model_dump()}
    return ITEMS[new_id]


# test_main.py
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_existing_item():
    r = client.get("/items/1")
    assert r.status_code == 200
    assert r.json()["name"] == "Pen"


def test_get_missing_item():
    r = client.get("/items/999")
    assert r.status_code == 404
    assert r.json() == {"detail": "Item not found"}


def test_create_item():
    r = client.post("/items", json={"name": "Notebook", "price": 45})
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Notebook" and body["id"] > 1


def test_create_item_invalid_price():
    r = client.post("/items", json={"name": "Bag", "price": -5})
    assert r.status_code == 422
    assert r.json()["detail"][0]["loc"] == ["body", "price"]`,
      result: "$ pytest -v\ntest_main.py::test_get_existing_item PASSED\ntest_main.py::test_get_missing_item PASSED\ntest_main.py::test_create_item PASSED\ntest_main.py::test_create_item_invalid_price PASSED\n==================== 4 passed in 0.35s ====================",
      explanation: "TestClient sends requests directly to the ASGI app in memory. Each test checks one behaviour, including error paths. Tests for 422 verify that validation rules really exist. Note: these tests share the in-memory ITEMS dict; the next example shows proper isolation.",
    },
    {
      title: "Isolated DB tests with fixtures and dependency_overrides",
      scenario: "Test the Day 6 Student CRUD API against an in-memory SQLite database that is reset for every test, and fake the logged-in user.",
      steps: [
        "Use the Day 6 project (database.py with get_db, models.py, main.py)",
        "Create tests/conftest.py and tests/test_students.py",
        "pip install pytest pytest-cov",
        "Run pytest -v --cov=. from the project root",
      ],
      code: `# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

engine = create_engine(
    "sqlite://",                                  # in-memory database
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,                         # share one connection
)
TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


# tests/test_students.py
def create(client, email="asha@gmail.com"):
    return client.post("/students", json={"name": "Asha", "email": email, "city": "Pune"})


def test_create_and_read(client):
    r = create(client)
    assert r.status_code == 201
    sid = r.json()["id"]
    assert client.get(f"/students/{sid}").json()["email"] == "asha@gmail.com"


def test_duplicate_email_returns_409(client):
    create(client)
    assert create(client).status_code == 409


def test_patch_only_changes_sent_fields(client):
    sid = create(client).json()["id"]
    r = client.patch(f"/students/{sid}", json={"city": "Mumbai"})
    assert r.json()["city"] == "Mumbai" and r.json()["name"] == "Asha"


def test_delete(client):
    sid = create(client).json()["id"]
    assert client.delete(f"/students/{sid}").status_code == 204
    assert client.get(f"/students/{sid}").status_code == 404`,
      result: "$ pytest -v --cov=.\ntests/test_students.py::test_create_and_read PASSED\ntests/test_students.py::test_duplicate_email_returns_409 PASSED\ntests/test_students.py::test_patch_only_changes_sent_fields PASSED\ntests/test_students.py::test_delete PASSED\n---------- coverage ----------\nmain.py  52  3  94%\n==================== 4 passed in 0.61s ====================",
      explanation: "The client fixture creates fresh tables, overrides get_db, yields a TestClient (with lifespan), and cleans up afterwards, so tests never affect each other or your real school.db. StaticPool is required for in-memory SQLite because every new connection would otherwise get an empty database. The same pattern overrides get_current_user for protected routes.",
    },
  ],
  interview: [
    { q: "Difference between concurrency and parallelism?", a: "Concurrency is managing multiple tasks by interleaving them (switching while waiting), possible on one thread. Parallelism is executing multiple tasks simultaneously on multiple cores. asyncio gives concurrency; multiprocessing gives parallelism. Python threads give concurrency, limited for CPU work by the GIL (free-threaded 3.13+ builds are experimental).", level: "Medium" },
    { q: "When should a FastAPI endpoint be async def?", a: "When everything inside it uses awaitable, non-blocking libraries (httpx.AsyncClient, asyncpg, AsyncSession, aiofiles). If the code uses blocking libraries (requests, sync SQLAlchemy, time.sleep, heavy CPU), use def so FastAPI runs it in the threadpool.", level: "Medium" },
    { q: "What happens if you call requests.get() inside an async def endpoint?", a: "It blocks the event loop thread for the duration of the call. No other request can progress meanwhile, so throughput collapses under load. Fix: use httpx.AsyncClient with await, make the endpoint def, or wrap with await run_in_threadpool(...).", level: "Hard" },
    { q: "What is asyncio.gather?", a: "A function that runs multiple awaitables concurrently and returns their results in order. If one raises, by default the exception propagates (return_exceptions=True collects exceptions instead). In 3.11+ asyncio.TaskGroup is a structured alternative.", level: "Medium" },
    { q: "Does async make CPU-heavy endpoints faster?", a: "No. Async helps only when tasks wait on I/O. CPU-bound work blocks the loop. Offload it to a process pool (ProcessPoolExecutor), a background worker (Celery), or scale with multiple Uvicorn workers.", level: "Medium" },
    { q: "How does TestClient work?", a: "TestClient (Starlette, based on httpx) calls the ASGI app directly in-process, without opening a network port. It has the requests-like API: get/post/put/delete with json, data, files, headers, params. Use it as a context manager to trigger lifespan events.", level: "Easy" },
    { q: "How do you test endpoints that need a database?", a: "Override get_db via app.dependency_overrides with a session bound to a test database (in-memory SQLite with StaticPool, or a dedicated Postgres test DB/container). Create tables in a fixture before each test and drop them or roll back a transaction after, so tests are isolated and repeatable.", level: "Medium" },
    { q: "How do you test protected endpoints?", a: "Either perform the real login in the test (POST /token, then send Authorization: Bearer header) to test the full flow, or override get_current_user with a function returning a fake user for faster unit-style tests. Also test the 401 and 403 cases.", level: "Medium" },
    { q: "What are pytest fixtures and conftest.py?", a: "Fixtures are functions decorated with @pytest.fixture that provide setup data/objects to tests by parameter name; yield fixtures provide teardown. Scope can be function, module, session. conftest.py holds fixtures shared across test files in that directory, automatically discovered.", level: "Easy" },
    { q: "How do you write async tests for FastAPI?", a: "Mark tests with @pytest.mark.anyio (or pytest-asyncio) and use httpx.AsyncClient(transport=ASGITransport(app=app), base_url='http://test'), then await client.get(...). Needed when tests themselves must await things like async DB sessions.", level: "Hard" },
    { q: "What should you test in an API?", a: "Happy paths (status + body), validation errors (422), not found (404), conflicts (409), auth (401/403), edge cases (empty lists, pagination limits), business rules, and that secrets are never returned. Aim for meaningful coverage of critical paths rather than 100% numbers.", level: "Easy" },
  ],
  practice: [
    {
      task: "Write an async endpoint GET /weather-and-news that concurrently awaits two fake async functions (get_weather 1s, get_news 2s) and returns both plus the elapsed time (should be about 2s).",
      hint: "asyncio.gather and time.perf_counter.",
      solution: `import asyncio
import time

from fastapi import FastAPI

app = FastAPI()


async def get_weather():
    await asyncio.sleep(1)
    return {"city": "Pune", "temp": 29}


async def get_news():
    await asyncio.sleep(2)
    return ["Sensex up", "Monsoon update"]


@app.get("/weather-and-news")
async def weather_and_news():
    start = time.perf_counter()
    weather, news = await asyncio.gather(get_weather(), get_news())
    return {"weather": weather, "news": news,
            "elapsed": round(time.perf_counter() - start, 1)}   # about 2.0`,
    },
    {
      task: "Write tests for the Day 7 login API: successful login returns a token, wrong password gives 401, and /users/me works with the token and fails without it.",
      hint: "client.post('/token', data={...}) sends form data.",
      solution: `from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_token(username="asha", password="secret123"):
    return client.post("/token", data={"username": username, "password": password})


def test_login_success():
    r = get_token()
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"


def test_login_wrong_password():
    assert get_token(password="nope").status_code == 401


def test_me_with_token():
    token = get_token().json()["access_token"]
    r = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200 and r.json()["username"] == "asha"


def test_me_without_token():
    assert client.get("/users/me").status_code == 401`,
    },
    {
      task: "Use pytest.mark.parametrize to test that POST /items rejects several invalid bodies with 422: missing name, name of 1 char, price 0, price as text.",
      hint: "@pytest.mark.parametrize('body', [...])",
      solution: `import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


@pytest.mark.parametrize("body", [
    {"price": 10},
    {"name": "A", "price": 10},
    {"name": "Pen", "price": 0},
    {"name": "Pen", "price": "ten"},
])
def test_invalid_items(body):
    r = client.post("/items", json=body)
    assert r.status_code == 422`,
    },
    {
      task: "Write an async test using httpx.AsyncClient with ASGITransport for GET /items/1.",
      hint: "pip install anyio (comes with FastAPI) and mark with @pytest.mark.anyio; add an anyio_backend fixture returning 'asyncio'.",
      solution: `import pytest
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_get_item_async():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        r = await ac.get("/items/1")
    assert r.status_code == 200
    assert r.json()["name"] == "Pen"`,
    },
  ],
  quiz: [
    { question: "How does FastAPI run a plain def endpoint?", options: ["On the event loop", "In a threadpool", "In a separate process", "It is not allowed"], answer: 1, explanation: "def endpoints run in an AnyIO threadpool so blocking code does not block the loop." },
    { question: "Which is safe inside an async def endpoint?", options: ["time.sleep(2)", "requests.get(url)", "await httpx.AsyncClient().get(url)", "A sync SQLAlchemy session query"], answer: 2, explanation: "Only awaitable non-blocking calls should be used inside async def." },
    { question: "Three awaited 1-second I/O calls with asyncio.gather take about...", options: ["3 seconds", "1 second", "0 seconds", "6 seconds"], answer: 1, explanation: "They overlap, so total is about the longest single call." },
    { question: "Why use StaticPool for in-memory SQLite tests?", options: ["It is faster to write", "So all sessions share the same in-memory database connection", "It enables foreign keys", "It is required by pytest"], answer: 1, explanation: "Each new connection to sqlite:// creates a separate empty DB; StaticPool reuses one." },
    { question: "How do you trigger lifespan startup code in tests?", options: ["Call app.startup()", "Use with TestClient(app) as client:", "Import main twice", "It cannot be tested"], answer: 1, explanation: "Using TestClient as a context manager runs lifespan." },
    { question: "In pytest, shared fixtures for many test files usually live in...", options: ["settings.py", "conftest.py", "__main__.py", "pytest.json"], answer: 1, explanation: "pytest auto-discovers fixtures in conftest.py." },
  ],
};
