export default {
  id: "day-05-dependency-injection",
  title: "Dependency Injection with Depends",
  module: "Module 2: Building APIs",
  day: 5,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Master FastAPI's dependency injection system: share logic with Depends(), use class-based dependencies, chain sub-dependencies, manage resources with yield dependencies, apply dependencies to routers or the whole app, and override them in tests.",
  objectives: [
    "Explain dependency injection and the problems it solves",
    "Create function and class dependencies and use them with Depends and Annotated",
    "Build sub-dependency chains and understand per-request caching",
    "Write yield dependencies for setup/teardown such as DB sessions",
    "Apply dependencies at path decorator, router and app level, and override them for tests",
  ],
  theory: [
    {
      heading: "What is dependency injection?",
      content: "Dependency Injection (DI) means a function declares what it needs, and the framework provides (injects) it. Instead of every endpoint manually opening a DB connection, reading the token and checking the user, each endpoint simply says 'I need the current user' and FastAPI runs the code that produces it.\n\nAnalogy: in a restaurant you order 'paneer butter masala'; you do not go to the kitchen, buy vegetables and cook. The kitchen (FastAPI) prepares what you declared.\n\nIn FastAPI a dependency is just a callable (function or class). You declare it with `Depends(callable)`. FastAPI calls it for every request, passes it the same kinds of parameters an endpoint can receive (query, path, headers, body, other dependencies), and gives the return value to your endpoint.",
      points: [
        "Reuse shared logic: pagination, auth, DB sessions, permissions, settings",
        "Less duplication and cleaner endpoints",
        "Easy testing: replace a dependency with a fake using dependency_overrides",
        "Dependencies' parameters appear automatically in the OpenAPI docs",
      ],
    },
    {
      heading: "Function dependencies with Depends and Annotated",
      content: "Write a normal function, then add a parameter typed `Annotated[ReturnType, Depends(func)]`. Pass the function itself, do not call it (`Depends(func)` not `Depends(func())`). Creating a type alias with Annotated lets you reuse it everywhere with a short name.",
      syntax: "from typing import Annotated\nfrom fastapi import Depends\n\ndef pagination(skip: int = 0, limit: int = 10) -> dict:\n    return {\"skip\": skip, \"limit\": limit}\n\nPageDep = Annotated[dict, Depends(pagination)]\n\n@app.get(\"/items\")\ndef items(page: PageDep):\n    return page",
      tip: "Dependencies can be def or async def, independent of whether the endpoint is def or async def.",
    },
    {
      heading: "Class-based dependencies",
      content: "Any callable can be a dependency, including classes. FastAPI calls the class like a function, reading its __init__ parameters from the request, and injects the instance. This gives you typed attributes and autocomplete. Shortcut: `Annotated[Pager, Depends()]` - empty Depends() means 'use the annotated class'.\n\nA class instance with `__call__` can also be used to build **parameterized dependencies**, e.g. `RoleChecker([\"admin\"])`.",
      syntax: "class Pager:\n    def __init__(self, skip: int = 0, limit: int = 10):\n        self.skip = skip\n        self.limit = limit\n\n@app.get(\"/users\")\ndef users(pager: Annotated[Pager, Depends()]):\n    return {\"skip\": pager.skip}",
    },
    {
      heading: "Sub-dependencies and caching",
      content: "A dependency can itself depend on other dependencies, forming a tree: `get_current_admin` depends on `get_current_user`, which depends on `get_token`. FastAPI resolves the tree from the bottom up.\n\nWithin a single request, if the same dependency is used multiple times (by the endpoint and by a sub-dependency), FastAPI calls it **only once** and reuses the result. Disable with `Depends(func, use_cache=False)` when you really need a fresh call.",
      points: [
        "get_token -> get_current_user -> require_admin",
        "Each level can raise HTTPException to stop the request",
        "Results are cached per request, not across requests",
      ],
    },
    {
      heading: "Dependencies with yield (setup and teardown)",
      content: "Some resources must be cleaned up after the request: database sessions, files, locks. A dependency that uses `yield` runs code before the endpoint (setup), yields the value to the endpoint, and runs the code after yield when the request is finished (teardown). Wrap with try/finally so cleanup runs even when an error occurs.\n\nThis is exactly how the DB session dependency `get_db()` works on Day 6. Since FastAPI 0.106 the exit code runs before the response is sent; if you catch an exception in a yield dependency you must re-raise it (or raise an HTTPException), otherwise FastAPI cannot return the correct error.",
      syntax: "def get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()",
    },
    {
      heading: "Path, router and global dependencies and dependency_overrides",
      content: "Sometimes you need a dependency to run but do not need its return value (e.g. verify an API key). Use `dependencies=[Depends(verify_key)]` in the decorator, in `APIRouter(dependencies=[...])` for a group of routes, or in `FastAPI(dependencies=[...])` for the entire app.\n\nFor testing, `app.dependency_overrides[real_dep] = fake_dep` replaces a dependency everywhere. Use it to fake the current user or point to a test database. Reset with `app.dependency_overrides.clear()`.",
      syntax: "@app.get(\"/reports\", dependencies=[Depends(verify_api_key)])\ndef reports(): ...\n\napp = FastAPI(dependencies=[Depends(log_request)])\n\napp.dependency_overrides[get_current_user] = lambda: {\"username\": \"test\"}",
      tip: "Interview gold: 'FastAPI DI makes testing easy because I can override get_db and get_current_user without monkeypatching.'",
    },
  ],
  examples: [
    {
      title: "Reusable pagination and search dependency",
      scenario: "Three list endpoints share the same skip, limit and q parameters.",
      steps: [
        "pip install \"fastapi[standard]\"",
        "Save main.py and run fastapi dev main.py",
        "Open /docs and see that both endpoints show skip, limit and q",
        "Try /books?q=py&limit=1",
      ],
      code: `from typing import Annotated

from fastapi import Depends, FastAPI, Query

app = FastAPI()

BOOKS = ["Python Crash Course", "Fluent Python", "FastAPI Guide", "Clean Code"]
AUTHORS = ["Eric Matthes", "Luciano Ramalho", "Robert Martin"]


class CommonParams:
    def __init__(
        self,
        q: str | None = None,
        skip: Annotated[int, Query(ge=0)] = 0,
        limit: Annotated[int, Query(ge=1, le=50)] = 10,
    ):
        self.q = q
        self.skip = skip
        self.limit = limit

    def apply(self, data: list[str]) -> list[str]:
        if self.q:
            data = [d for d in data if self.q.lower() in d.lower()]
        return data[self.skip: self.skip + self.limit]


Common = Annotated[CommonParams, Depends()]


@app.get("/books")
def list_books(params: Common):
    return params.apply(BOOKS)


@app.get("/authors")
def list_authors(params: Common):
    return params.apply(AUTHORS)`,
      result: "/books?q=py -> [\"Python Crash Course\",\"Fluent Python\"]\n/books?q=py&limit=1 -> [\"Python Crash Course\"]\n/authors?skip=1 -> [\"Luciano Ramalho\",\"Robert Martin\"]\n/books?limit=0 -> 422 greater_than_equal on [\"query\",\"limit\"]",
      explanation: "CommonParams.__init__ parameters become query parameters for every endpoint that uses Common. Validation lives in one place, and the class adds a helper method apply(). Depends() with no argument uses the annotated class.",
    },
    {
      title: "Sub-dependencies: API key -> current user -> admin check",
      scenario: "Protect endpoints using a header token, with an extra admin-only check.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "curl -H \"X-Token: user-token\" http://127.0.0.1:8000/me",
        "curl -H \"X-Token: user-token\" http://127.0.0.1:8000/admin/stats",
        "curl -H \"X-Token: admin-token\" http://127.0.0.1:8000/admin/stats",
      ],
      code: `from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()

TOKENS = {
    "user-token": {"username": "ravi", "role": "user"},
    "admin-token": {"username": "neha", "role": "admin"},
}


def get_token(x_token: Annotated[str | None, Header()] = None) -> str:
    if x_token is None:
        raise HTTPException(401, "X-Token header missing")
    return x_token


def get_current_user(token: Annotated[str, Depends(get_token)]) -> dict:
    user = TOKENS.get(token)
    if user is None:
        raise HTTPException(401, "Invalid token")
    return user


CurrentUser = Annotated[dict, Depends(get_current_user)]


def require_admin(user: CurrentUser) -> dict:
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    return user


@app.get("/me")
def me(user: CurrentUser):
    return user


@app.get("/admin/stats")
def stats(admin: Annotated[dict, Depends(require_admin)]):
    return {"requested_by": admin["username"], "total_users": 2}`,
      result: "/me with user-token -> {\"username\":\"ravi\",\"role\":\"user\"}\n/admin/stats with user-token -> 403 {\"detail\":\"Admins only\"}\n/admin/stats with admin-token -> {\"requested_by\":\"neha\",\"total_users\":2}\nNo header -> 401 {\"detail\":\"X-Token header missing\"}",
      explanation: "Header() reads x_token from the X-Token header (underscores are converted to hyphens). The chain get_token -> get_current_user -> require_admin is resolved automatically. Each layer can stop the request with an HTTPException. On Day 7 we replace this fake token with real JWT.",
    },
    {
      title: "Yield dependency with setup and teardown",
      scenario: "Simulate opening and closing a database connection for every request and see the order of execution.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "Open /orders and watch the terminal output",
        "Open /orders/fail and watch the terminal output again",
      ],
      code: `from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException

app = FastAPI()


class FakeConnection:
    def __init__(self):
        print("1. Connection OPENED")

    def query(self, sql: str) -> list[dict]:
        print("2. Running:", sql)
        return [{"id": 1, "amount": 499}]

    def close(self):
        print("4. Connection CLOSED")


def get_conn():
    conn = FakeConnection()
    try:
        yield conn
    except HTTPException:
        print("   rolling back because of an HTTP error")
        raise
    finally:
        conn.close()


DB = Annotated[FakeConnection, Depends(get_conn)]


@app.get("/orders")
def orders(conn: DB):
    rows = conn.query("SELECT * FROM orders")
    print("3. Endpoint finished")
    return rows


@app.get("/orders/fail")
def orders_fail(conn: DB):
    raise HTTPException(404, "No orders")`,
      result: "/orders -> [{\"id\":1,\"amount\":499}]\nTerminal: 1. Connection OPENED / 2. Running: SELECT * FROM orders / 3. Endpoint finished / 4. Connection CLOSED\n/orders/fail -> 404 {\"detail\":\"No orders\"}\nTerminal: 1. Connection OPENED / rolling back because of an HTTP error / 4. Connection CLOSED",
      explanation: "Code before yield runs before the endpoint; finally runs after, even on errors. Catching an exception in a yield dependency is allowed but you must re-raise it, otherwise FastAPI raises an error. This exact pattern manages SQLAlchemy sessions on Day 6.",
    },
    {
      title: "Global dependency, parameterized dependency and overrides",
      scenario: "Every request must carry an API key; some routes require specific roles; tests need to bypass auth.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "curl -H \"X-API-Key: secret\" -H \"X-Role: editor\" http://127.0.0.1:8000/articles",
        "Run the test with pip install pytest and pytest test_main.py -q",
      ],
      code: `# main.py
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException


def verify_api_key(x_api_key: Annotated[str, Header()]):
    if x_api_key != "secret":
        raise HTTPException(401, "Bad API key")


def get_role(x_role: Annotated[str, Header()] = "viewer") -> str:
    return x_role


class RoleChecker:
    def __init__(self, allowed: list[str]):
        self.allowed = allowed

    def __call__(self, role: Annotated[str, Depends(get_role)]) -> str:
        if role not in self.allowed:
            raise HTTPException(403, f"Role {role} not allowed")
        return role


app = FastAPI(dependencies=[Depends(verify_api_key)])   # runs for every route


@app.get("/articles", dependencies=[Depends(RoleChecker(["editor", "admin"]))])
def articles():
    return [{"title": "FastAPI DI explained"}]


# test_main.py
from fastapi.testclient import TestClient
from main import app, verify_api_key, get_role

app.dependency_overrides[verify_api_key] = lambda: None
app.dependency_overrides[get_role] = lambda: "admin"
client = TestClient(app)


def test_articles():
    r = client.get("/articles")
    assert r.status_code == 200`,
      result: "With X-API-Key: secret and X-Role: editor -> [{\"title\":\"FastAPI DI explained\"}]\nWith X-Role: viewer -> 403 {\"detail\":\"Role viewer not allowed\"}\nWithout X-API-Key -> 422 (required header missing)\npytest -> 1 passed",
      explanation: "FastAPI(dependencies=[...]) applies verify_api_key globally. RoleChecker(['editor','admin']) creates a configured instance whose __call__ is the dependency. In tests, dependency_overrides swaps real dependencies for lambdas, so no headers are needed.",
    },
  ],
  interview: [
    { q: "What is dependency injection in FastAPI?", a: "A system where path functions declare what they need using Depends(callable), and FastAPI calls those callables per request, resolving their own parameters (query, headers, other dependencies), and injects the results. Used for DB sessions, auth, pagination, settings and permissions.", level: "Easy" },
    { q: "What can be a dependency?", a: "Any callable: a function (def or async def), a generator function with yield, a class (its __init__ parameters are resolved), or an instance of a class implementing __call__ (useful for parameterized dependencies).", level: "Medium" },
    { q: "Is a dependency called multiple times if used in several places in one request?", a: "No. By default FastAPI caches the dependency result per request, so if get_current_user is used by the endpoint and a sub-dependency, it runs once. Use Depends(dep, use_cache=False) to force multiple calls. Results are not cached across requests.", level: "Medium" },
    { q: "Explain yield dependencies.", a: "A dependency with yield runs code before yield (setup), injects the yielded value, and runs code after yield (teardown) once the request is handled. Typically used with try/finally to close DB sessions, files or connections even on exceptions. If you catch exceptions, re-raise them.", level: "Medium" },
    { q: "How do you apply a dependency to all routes?", a: "Pass dependencies=[Depends(dep)] to FastAPI(...) for the entire app, or to APIRouter(...) / app.include_router(router, dependencies=[...]) for a group of routes. These run but their return value is not injected.", level: "Easy" },
    { q: "How do you override a dependency in tests?", a: "app.dependency_overrides[original_dependency] = fake_dependency. FastAPI uses the fake wherever the original is declared, including sub-dependencies. Clear afterwards with app.dependency_overrides.clear() or in a pytest fixture teardown.", level: "Medium" },
    { q: "What is the difference between Depends(func) and Depends(func())?", a: "Depends(func) passes the callable so FastAPI calls it per request with resolved parameters. Depends(func()) calls it once at import time and passes the result, which is wrong (FastAPI would then try to call the result).", level: "Easy" },
    { q: "How do you create a parameterized dependency such as role checking?", a: "Create a class with __init__ storing configuration (allowed roles) and __call__ containing the dependency logic. Use Depends(RoleChecker(['admin'])). Alternatively a factory function returning an inner function.", level: "Hard" },
    { q: "Why is Annotated preferred for dependencies?", a: "You can define aliases like CurrentUser = Annotated[User, Depends(get_current_user)] once and reuse them, keeping signatures short, consistent and type-checker friendly. The function also stays callable with normal arguments.", level: "Medium" },
    { q: "In what order do sub-dependencies and yield teardown run?", a: "Dependencies are resolved depth-first: inner (sub) dependencies run first, then outer ones, then the endpoint. Teardown code after yield runs in reverse order (last opened, first closed), like nested context managers.", level: "Hard" },
    { q: "Can a dependency read the request body or the Request object?", a: "Yes. A dependency can declare any parameter an endpoint can: Pydantic body models, Request, headers, cookies, path/query params, BackgroundTasks, SecurityScopes, and other dependencies.", level: "Medium" },
  ],
  practice: [
    {
      task: "Create a dependency get_settings() that returns a dict with app_name and gst_rate. Use it in GET /info and GET /price?amount=100 (returns amount with GST).",
      hint: "Use functools.lru_cache so settings are created once.",
      solution: `from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI

app = FastAPI()


@lru_cache
def get_settings() -> dict:
    print("loading settings")
    return {"app_name": "ShopAPI", "gst_rate": 0.18}


Settings = Annotated[dict, Depends(get_settings)]


@app.get("/info")
def info(settings: Settings):
    return {"app": settings["app_name"]}


@app.get("/price")
def price(amount: float, settings: Settings):
    return {"amount": amount, "with_gst": round(amount * (1 + settings["gst_rate"]), 2)}`,
    },
    {
      task: "Write a yield dependency that measures how long the endpoint takes and prints it after the response is produced.",
      hint: "time.perf_counter() before and after yield.",
      solution: `import time

from fastapi import Depends, FastAPI


def timer():
    start = time.perf_counter()
    yield
    print(f"took {(time.perf_counter() - start) * 1000:.1f} ms")


app = FastAPI(dependencies=[Depends(timer)])


@app.get("/slow")
def slow():
    time.sleep(0.3)
    return {"ok": True}`,
    },
    {
      task: "Create get_current_user (reads Authorization header 'Bearer <name>') and a dependency require_premium that allows only names in a PREMIUM set. Protect GET /courses/premium.",
      hint: "Split the header with .split(' ') and validate both parts.",
      solution: `from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException

app = FastAPI()
PREMIUM = {"asha", "rohit"}


def get_current_user(authorization: Annotated[str | None, Header()] = None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token", headers={"WWW-Authenticate": "Bearer"})
    return authorization.split(" ", 1)[1]


def require_premium(user: Annotated[str, Depends(get_current_user)]) -> str:
    if user not in PREMIUM:
        raise HTTPException(403, "Premium plan required")
    return user


@app.get("/courses/premium")
def premium_courses(user: Annotated[str, Depends(require_premium)]):
    return {"user": user, "courses": ["System Design", "DSA Advanced"]}`,
    },
    {
      task: "Write a pytest test that overrides get_current_user from the previous exercise to return 'asha' and checks GET /courses/premium returns 200.",
      hint: "app.dependency_overrides[get_current_user] = lambda: 'asha'",
      solution: `from fastapi.testclient import TestClient

from main import app, get_current_user


def test_premium_access():
    app.dependency_overrides[get_current_user] = lambda: "asha"
    client = TestClient(app)
    r = client.get("/courses/premium")
    assert r.status_code == 200
    assert r.json()["user"] == "asha"
    app.dependency_overrides.clear()


def test_non_premium_forbidden():
    app.dependency_overrides[get_current_user] = lambda: "ravi"
    client = TestClient(app)
    assert client.get("/courses/premium").status_code == 403
    app.dependency_overrides.clear()`,
    },
  ],
  quiz: [
    { question: "Which is the correct way to declare a dependency?", options: ["Depends(get_db())", "Depends(get_db)", "Inject(get_db)", "@depends get_db"], answer: 1, explanation: "Pass the callable itself; FastAPI calls it per request." },
    { question: "A dependency used by both the endpoint and a sub-dependency in the same request runs how many times by default?", options: ["Once", "Twice", "Once per server start", "Depends on def vs async def"], answer: 0, explanation: "Results are cached per request unless use_cache=False." },
    { question: "In a yield dependency, when does the code after yield run?", options: ["Before the endpoint", "After the request is handled", "Only on server shutdown", "Never"], answer: 1, explanation: "It is teardown code that runs after the endpoint finishes." },
    { question: "How do you run a dependency for every route in the app?", options: ["@app.middleware", "FastAPI(dependencies=[Depends(dep)])", "app.global_dep(dep)", "Put it in __init__.py"], answer: 1, explanation: "Global dependencies are passed to the FastAPI constructor." },
    { question: "What is app.dependency_overrides used for?", options: ["Changing route order", "Replacing dependencies, mainly in tests", "Caching responses", "Adding middleware"], answer: 1, explanation: "It maps original dependencies to replacements." },
    { question: "Annotated[Pager, Depends()] with an empty Depends() means...", options: ["No dependency", "Use the Pager class itself as the dependency", "A syntax error", "Inject None"], answer: 1, explanation: "Empty Depends() uses the annotated type as the callable." },
  ],
};
