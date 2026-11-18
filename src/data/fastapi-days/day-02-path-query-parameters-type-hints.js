export default {
  id: "day-02-path-query-parameters-type-hints",
  title: "Path Parameters, Query Parameters and Type Hints",
  module: "Module 1: FastAPI Basics",
  day: 2,
  level: "Beginner",
  duration: "3 hours",
  summary: "Use Python type hints to read path parameters (/students/7) and query parameters (?page=2&limit=10), get automatic conversion and validation, restrict values with Enum, and add rules with Path() and Query() using Annotated.",
  objectives: [
    "Revise the Python type hints FastAPI relies on (int, str, float, bool, list, Optional, unions)",
    "Declare path parameters and understand automatic type conversion and 422 errors",
    "Declare required, optional and default query parameters, including lists",
    "Restrict values using Enum and Literal",
    "Add validation and metadata with Annotated, Path() and Query()",
  ],
  theory: [
    {
      heading: "Type hints: the heart of FastAPI",
      content: "Type hints tell readers and tools what type a variable or parameter should have: `def greet(name: str, age: int) -> str`. Plain Python does NOT enforce them at runtime. FastAPI (through Pydantic) DOES use them at runtime to parse, convert and validate request data.\n\nModern Python 3.10+ syntax lets you write `list[int]`, `dict[str, float]` and `str | None` instead of importing List, Dict and Optional from typing. Python 3.9+ supports `Annotated[type, metadata]`, which FastAPI uses to attach extra rules to a parameter.",
      points: [
        "int, float, str, bool - basic scalar types",
        "list[str], set[int], dict[str, int] - collections",
        "str | None = None - optional value (same as Optional[str])",
        "Literal[\"asc\", \"desc\"] - only specific values allowed",
        "Annotated[int, Query(gt=0)] - type plus extra metadata",
      ],
    },
    {
      heading: "Path parameters",
      content: "Path parameters are variable parts of the URL path, written with curly braces: `@app.get(\"/students/{student_id}\")`. The function must have a parameter with the same name. If you annotate it as `int`, FastAPI converts the string \"7\" to the integer 7. If conversion fails (e.g. /students/abc), FastAPI returns **422 Unprocessable Entity** with a clear JSON error, and your function is never called.\n\nPath parameters are always required, because a URL without them would be a different path. They are used to identify a specific resource: a student, an order, a product.",
      syntax: "@app.get(\"/students/{student_id}\")\ndef get_student(student_id: int):\n    return {\"student_id\": student_id}",
      tip: "Route order matters. Put fixed paths like /users/me ABOVE /users/{user_id}, otherwise 'me' will be treated as a user_id and fail int validation.",
    },
    {
      heading: "Query parameters",
      content: "Any function parameter that is NOT in the path (and is a simple type) becomes a **query parameter**, read from the part of the URL after `?`. Example: `/products?category=mobile&page=2&in_stock=true`.\n\nIf a query parameter has no default, it is required. If it has a default (`page: int = 1`), it is optional. Use `str | None = None` for optional values that may be absent. Bool query params accept true/false, 1/0, yes/no, on/off.",
      syntax: "@app.get(\"/products\")\ndef list_products(category: str, page: int = 1, in_stock: bool = False, q: str | None = None):\n    ...",
      points: [
        "Required: no default value -> missing returns 422 'Field required'",
        "Optional with default: page: int = 1",
        "Truly optional: q: str | None = None",
        "Use query params for filtering, sorting, searching and pagination",
      ],
    },
    {
      heading: "Enum and Literal for fixed choices",
      content: "When a parameter can only take a few values (e.g. a course level or sort order), use a `str` Enum or `Literal`. FastAPI validates the value and Swagger shows a dropdown with the allowed choices. Inheriting from both `str` and `Enum` (or using `StrEnum` in Python 3.11+) makes the values JSON-friendly strings.",
      syntax: "from enum import Enum\n\nclass Level(str, Enum):\n    beginner = \"beginner\"\n    advanced = \"advanced\"\n\n@app.get(\"/courses/{level}\")\ndef by_level(level: Level):\n    return {\"level\": level.value}",
    },
    {
      heading: "Validation with Annotated, Query() and Path()",
      content: "To add rules like minimum length or ranges, wrap the type in `Annotated` and add `Query()` or `Path()`. This is the recommended style since FastAPI 0.95.\n\nString rules: `min_length`, `max_length`, `pattern` (regex). Number rules: `gt` (greater than), `ge` (greater or equal), `lt`, `le`. Metadata: `title`, `description`, `alias`, `deprecated`, `examples`. To accept a list from the query string (`?tag=a&tag=b`), use `list[str]` with `Query()`.",
      syntax: "from typing import Annotated\nfrom fastapi import Query, Path\n\ndef search(\n    q: Annotated[str | None, Query(min_length=3, max_length=50)] = None,\n    limit: Annotated[int, Query(ge=1, le=100)] = 10,\n): ...\n\ndef get_item(item_id: Annotated[int, Path(gt=0)]): ...",
      points: [
        "pattern=\"^[A-Z]{3}$\" for regex (older name 'regex' is deprecated)",
        "alias=\"item-query\" when the URL name is not a valid Python name",
        "deprecated=True marks a parameter as deprecated in docs",
        "list[str] query needs Query(), otherwise FastAPI would expect it in the body",
      ],
    },
    {
      heading: "How FastAPI decides where a parameter comes from",
      content: "FastAPI uses simple rules: (1) if the name appears in the path string, it is a path parameter; (2) if it is a singular type (int, float, str, bool, Enum, etc.), it is a query parameter; (3) if it is a Pydantic model, it is read from the request body (Day 3). You can override with explicit markers: Path(), Query(), Body(), Header(), Cookie(), Form(), File().\n\nThe 422 error body always has a `detail` list with `type`, `loc` (where: path/query/body + name), `msg` and `input`, which is very helpful for frontend developers.",
      tip: "When debugging a 422, read the loc field first: [\"query\", \"limit\"] tells you exactly which parameter failed.",
    },
  ],
  examples: [
    {
      title: "Path parameter with type conversion",
      scenario: "Fetch a student by numeric ID from an in-memory dictionary.",
      steps: [
        "pip install \"fastapi[standard]\" (if not already)",
        "Save the code as main.py",
        "fastapi dev main.py",
        "Open /students/1, /students/5 and /students/abc in the browser",
      ],
      code: `from fastapi import FastAPI

app = FastAPI()

students = {
    1: {"name": "Asha", "course": "Python"},
    2: {"name": "Rahul", "course": "FastAPI"},
}


@app.get("/students/me")
def current_student():
    return {"name": "Logged-in student"}


@app.get("/students/{student_id}")
def get_student(student_id: int):
    if student_id not in students:
        return {"error": "Student not found"}
    return {"id": student_id, **students[student_id]}`,
      result: "/students/1 -> {\"id\":1,\"name\":\"Asha\",\"course\":\"Python\"}\n/students/5 -> {\"error\":\"Student not found\"}\n/students/me -> {\"name\":\"Logged-in student\"}\n/students/abc -> 422: {\"detail\":[{\"type\":\"int_parsing\",\"loc\":[\"path\",\"student_id\"],\"msg\":\"Input should be a valid integer, unable to parse string as an integer\",\"input\":\"abc\"}]}",
      explanation: "student_id arrives as text in the URL, and FastAPI converts it to int. /students/me is declared first so it is not captured by {student_id}. Returning an error dict with status 200 is not ideal; on Day 4 we use HTTPException to return a proper 404.",
    },
    {
      title: "Query parameters for filtering and pagination",
      scenario: "A product listing page needs category filter, search text and pagination.",
      steps: [
        "Save main.py",
        "fastapi dev main.py",
        "Try /products, /products?category=mobile, /products?skip=1&limit=1, /products?in_stock=true",
      ],
      code: `from fastapi import FastAPI

app = FastAPI()

PRODUCTS = [
    {"name": "Redmi Note", "category": "mobile", "price": 14999, "in_stock": True},
    {"name": "Boat Earbuds", "category": "audio", "price": 1299, "in_stock": False},
    {"name": "iPhone 15", "category": "mobile", "price": 69900, "in_stock": True},
]


@app.get("/products")
def list_products(
    category: str | None = None,
    in_stock: bool = False,
    skip: int = 0,
    limit: int = 10,
):
    items = PRODUCTS
    if category:
        items = [p for p in items if p["category"] == category]
    if in_stock:
        items = [p for p in items if p["in_stock"]]
    return {"total": len(items), "items": items[skip: skip + limit]}`,
      result: "/products?category=mobile -> total 2 (Redmi Note, iPhone 15)\n/products?in_stock=true -> total 2\n/products?skip=1&limit=1 -> {\"total\":3,\"items\":[{\"name\":\"Boat Earbuds\",...}]}\n/products?limit=ten -> 422 int_parsing on [\"query\",\"limit\"]",
      explanation: "None of these names appear in the path, so they are query parameters. All have defaults, so all are optional. skip/limit is the most common pagination style asked in interviews (also called offset/limit).",
    },
    {
      title: "Enum path parameter with dropdown in Swagger",
      scenario: "Course levels are fixed: beginner, intermediate, advanced.",
      steps: [
        "Save main.py",
        "fastapi dev main.py",
        "Open /docs, expand GET /courses/{level} and see the dropdown",
        "Try /courses/expert in the browser",
      ],
      code: `from enum import Enum

from fastapi import FastAPI

app = FastAPI()


class Level(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


COURSES = {
    "beginner": ["Python Basics", "SQL Basics"],
    "intermediate": ["FastAPI", "Django"],
    "advanced": ["System Design", "Microservices"],
}


@app.get("/courses/{level}")
def courses_by_level(level: Level):
    if level is Level.advanced:
        note = "Needs 6 months experience"
    else:
        note = "Open for all"
    return {"level": level, "courses": COURSES[level.value], "note": note}`,
      result: "/courses/intermediate -> {\"level\":\"intermediate\",\"courses\":[\"FastAPI\",\"Django\"],\"note\":\"Open for all\"}\n/courses/expert -> 422 with msg \"Input should be 'beginner', 'intermediate' or 'advanced'\"",
      explanation: "The parameter is converted to a Level enum member, so you can compare with is. Swagger shows only valid values. Returning the enum member gives its string value in JSON.",
    },
    {
      title: "Annotated validation with Query and Path",
      scenario: "A search API must enforce rules: search text 3-50 characters, limit 1-50, order_id positive, and multiple tags.",
      steps: [
        "Save main.py",
        "fastapi dev main.py",
        "Try /search?q=py, /search?q=python&limit=100, /search?q=python&tag=web&tag=api",
        "Try /orders/0 and /orders/15",
      ],
      code: `from typing import Annotated, Literal

from fastapi import FastAPI, Path, Query

app = FastAPI()


@app.get("/search")
def search(
    q: Annotated[str, Query(min_length=3, max_length=50, description="Search text")],
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    sort: Literal["asc", "desc"] = "asc",
    tag: Annotated[list[str], Query()] = [],
):
    return {"q": q, "limit": limit, "sort": sort, "tags": tag}


@app.get("/orders/{order_id}")
def get_order(order_id: Annotated[int, Path(gt=0, title="Order ID")]):
    return {"order_id": order_id, "status": "shipped"}`,
      result: "/search?q=py -> 422 string_too_short \"String should have at least 3 characters\"\n/search?q=python&limit=100 -> 422 less_than_equal \"Input should be less than or equal to 50\"\n/search?q=python&tag=web&tag=api -> {\"q\":\"python\",\"limit\":10,\"sort\":\"asc\",\"tags\":[\"web\",\"api\"]}\n/orders/0 -> 422 greater_than; /orders/15 -> {\"order_id\":15,\"status\":\"shipped\"}",
      explanation: "q has no default, so it is required and must be 3-50 chars. Literal restricts sort. A list query param repeats the key in the URL. Using a mutable default [] is safe here because FastAPI creates a fresh value per request.",
    },
    {
      title: "Type hints in plain Python (runs offline)",
      scenario: "Understand that plain Python does not enforce type hints - that is why FastAPI/Pydantic exist.",
      steps: [
        "Run the code below with python main.py (no install needed)",
        "Observe that wrong types are accepted by plain Python",
      ],
      code: `from typing import Annotated, get_type_hints


def get_student(student_id: int, active: bool = True) -> dict:
    return {"id": student_id, "active": active}


# Python does NOT check types at runtime:
print(get_student("abc"))

# But tools can read the hints - this is what FastAPI does
print(get_type_hints(get_student))

Limit = Annotated[int, "must be between 1 and 100"]


def page(limit: Limit = 10) -> int:
    return limit


print(get_type_hints(page, include_extras=True))`,
      python: {
        files: {
          "main.py": `from typing import Annotated, get_type_hints


def get_student(student_id: int, active: bool = True) -> dict:
    return {"id": student_id, "active": active}


# Python does NOT check types at runtime:
print(get_student("abc"))

# But tools can read the hints - this is what FastAPI does
print(get_type_hints(get_student))

Limit = Annotated[int, "must be between 1 and 100"]


def page(limit: Limit = 10) -> int:
    return limit


print(get_type_hints(page, include_extras=True))
`,
        },
      },
      result: "{'id': 'abc', 'active': True}\n{'student_id': <class 'int'>, 'active': <class 'bool'>, 'return': <class 'dict'>}\n{'limit': typing.Annotated[int, 'must be between 1 and 100'], 'return': <class 'int'>}",
      explanation: "Plain Python happily accepts 'abc' for an int. FastAPI inspects the function signature with the same introspection tools, then uses Pydantic to convert and validate the incoming values before calling your function.",
    },
  ],
  interview: [
    { q: "What is the difference between path and query parameters?", a: "Path parameters are part of the URL path (/users/{id}) and identify a specific resource; they are always required. Query parameters come after ? (/users?role=admin&page=2) and are used for filtering, sorting, searching and pagination; they can be optional with defaults.", level: "Easy" },
    { q: "How does FastAPI know whether a function parameter is a path, query or body parameter?", a: "If the name is in the path template, it is a path parameter. If it is a singular type (int, str, bool, float, Enum...), it is a query parameter. If it is a Pydantic model, it is the request body. You can override with Path(), Query(), Body(), Header(), Cookie(), Form(), File().", level: "Medium" },
    { q: "What status code does FastAPI return when validation fails?", a: "422 Unprocessable Entity, with a JSON body {\"detail\": [{\"type\", \"loc\", \"msg\", \"input\", ...}]}. loc tells where the error occurred, e.g. [\"query\", \"limit\"].", level: "Easy" },
    { q: "How do you make a query parameter optional?", a: "Give it a default value: `page: int = 1`, or allow None: `q: str | None = None`. A parameter without a default is required. With Annotated: `q: Annotated[str | None, Query(max_length=50)] = None`.", level: "Easy" },
    { q: "Why does route order matter? Give an example.", a: "Routes are matched in the order they are declared. If /users/{user_id} (int) is declared before /users/me, a request to /users/me matches the first route and fails with 422 because 'me' is not an int. Declare fixed paths before parameterized ones.", level: "Medium" },
    { q: "What is Annotated and why is it recommended?", a: "typing.Annotated[T, metadata] attaches extra information to a type without changing it. FastAPI reads Query/Path/Depends from the metadata. Benefits: the default value stays a normal Python default, the function remains callable normally (e.g. in tests), and you can reuse type aliases like `PageSize = Annotated[int, Query(ge=1, le=100)]`.", level: "Medium" },
    { q: "How do you accept multiple values for a query parameter?", a: "Declare a list with Query: `tag: Annotated[list[str], Query()] = []`. The URL is ?tag=a&tag=b. Without Query(), FastAPI would interpret a list type as a request body.", level: "Medium" },
    { q: "How do you restrict a path parameter to a fixed set of values?", a: "Use a str Enum (class Level(str, Enum)) or Literal['a','b']. FastAPI validates the value, returns 422 for others, and Swagger shows a dropdown.", level: "Easy" },
    { q: "What validation options do Query and Path support?", a: "Strings: min_length, max_length, pattern. Numbers: gt, ge, lt, le, multiple_of. Metadata: title, description, alias, examples, deprecated, include_in_schema. Path parameters are always required.", level: "Medium" },
    { q: "Do Python type hints enforce types at runtime?", a: "No. The interpreter ignores them at runtime; they are for readers, IDEs and static checkers like mypy. FastAPI and Pydantic read them via introspection and perform the validation and conversion themselves.", level: "Easy" },
    { q: "How would you design pagination for a list endpoint?", a: "Common approach: skip (offset) and limit query parameters with validation, e.g. limit: Annotated[int, Query(ge=1, le=100)] = 20. Return items plus metadata like total, page or next cursor. For very large tables, cursor/keyset pagination (WHERE id > last_id LIMIT n) is faster than OFFSET.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create GET /employees/{emp_id} where emp_id must be an integer greater than 1000. Return {\"emp_id\": ..., \"department\": \"IT\"}.",
      hint: "Use Annotated[int, Path(gt=1000)].",
      solution: `from typing import Annotated

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/employees/{emp_id}")
def get_employee(emp_id: Annotated[int, Path(gt=1000)]):
    return {"emp_id": emp_id, "department": "IT"}

# /employees/1001 -> OK, /employees/999 -> 422`,
    },
    {
      task: "Create GET /movies with optional query params genre (str), min_rating (float 0-10, default 0) and year (int | None). Filter an in-memory list.",
      hint: "Combine defaults with Query(ge=0, le=10).",
      solution: `from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()

MOVIES = [
    {"title": "3 Idiots", "genre": "comedy", "rating": 8.4, "year": 2009},
    {"title": "Dangal", "genre": "sports", "rating": 8.3, "year": 2016},
    {"title": "RRR", "genre": "action", "rating": 7.8, "year": 2022},
]


@app.get("/movies")
def movies(
    genre: str | None = None,
    min_rating: Annotated[float, Query(ge=0, le=10)] = 0,
    year: int | None = None,
):
    result = [m for m in MOVIES if m["rating"] >= min_rating]
    if genre:
        result = [m for m in result if m["genre"] == genre]
    if year is not None:
        result = [m for m in result if m["year"] == year]
    return result`,
    },
    {
      task: "Create GET /files/{file_path:path} that returns the full path even when it contains slashes, e.g. /files/home/docs/report.pdf.",
      hint: "Starlette supports the :path converter inside the path template.",
      solution: `from fastapi import FastAPI

app = FastAPI()


@app.get("/files/{file_path:path}")
def read_file(file_path: str):
    return {"file_path": file_path}

# /files/home/docs/report.pdf -> {"file_path": "home/docs/report.pdf"}`,
    },
    {
      task: "Create GET /pincode/{code} where code must be exactly 6 digits (Indian PIN code) and an optional query param format restricted to 'short' or 'full'.",
      hint: "Use Path(pattern=...) and Literal.",
      solution: `from typing import Annotated, Literal

from fastapi import FastAPI, Path

app = FastAPI()


@app.get("/pincode/{code}")
def pincode(
    code: Annotated[str, Path(pattern=r"^[1-9][0-9]{5}$")],
    format: Literal["short", "full"] = "short",
):
    if format == "full":
        return {"code": code, "state": "Maharashtra", "district": "Pune"}
    return {"code": code}`,
    },
    {
      task: "Create a reusable type alias PageSize = Annotated[int, Query(ge=1, le=100)] and use it in two endpoints: /users and /orders, both with skip and limit.",
      hint: "Define the alias once at module level and use limit: PageSize = 20.",
      solution: `from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()

PageSize = Annotated[int, Query(ge=1, le=100)]
Offset = Annotated[int, Query(ge=0)]


@app.get("/users")
def users(skip: Offset = 0, limit: PageSize = 20):
    return {"resource": "users", "skip": skip, "limit": limit}


@app.get("/orders")
def orders(skip: Offset = 0, limit: PageSize = 20):
    return {"resource": "orders", "skip": skip, "limit": limit}`,
    },
  ],
  quiz: [
    { question: "For @app.get(\"/items/{item_id}\") def f(item_id: int, q: str | None = None), what is q?", options: ["Path parameter", "Required query parameter", "Optional query parameter", "Request body"], answer: 2, explanation: "q is not in the path, is a simple type and has a default of None, so it is an optional query parameter." },
    { question: "What does GET /items/abc return when item_id is declared as int?", options: ["200 with item_id 'abc'", "404 Not Found", "422 Unprocessable Entity", "500 Internal Server Error"], answer: 2, explanation: "Conversion to int fails, so FastAPI returns a 422 validation error without calling your function." },
    { question: "Which declaration accepts ?tag=a&tag=b as a list?", options: ["tag: list[str] = []", "tag: Annotated[list[str], Query()] = []", "tag: str = 'a,b'", "tag: dict = {}"], answer: 1, explanation: "List query parameters must be declared explicitly with Query(), otherwise FastAPI treats a list as body." },
    { question: "Which Query option means 'greater than or equal to'?", options: ["gt", "ge", "gte", "min"], answer: 1, explanation: "ge = greater or equal, gt = strictly greater, le/lt for upper bounds." },
    { question: "/users/me returns 422 'unable to parse string as an integer'. Most likely cause?", options: ["Database is down", "/users/{user_id} is declared before /users/me", "Missing CORS", "Wrong Uvicorn port"], answer: 1, explanation: "The parameterized route matched first. Declare /users/me above /users/{user_id}." },
    { question: "What is the modern way to write an optional string in Python 3.10+?", options: ["str?", "Optional(str)", "str | None", "None[str]"], answer: 2, explanation: "PEP 604 union syntax str | None is equivalent to Optional[str]." },
  ],
};
