export default {
  id: "day-04-response-models-status-codes-errors",
  title: "Response Models, Status Codes and Error Handling",
  module: "Module 2: Building APIs",
  day: 4,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Control exactly what your API sends back: filter output with response_model, set correct HTTP status codes, raise HTTPException for 404/400/409 errors, write custom exception handlers, and return a consistent error format like professional APIs.",
  objectives: [
    "Use response_model and return type annotations to filter and document responses",
    "Separate input and output schemas so secrets like passwords never leak",
    "Choose correct HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409, 422, 500)",
    "Raise HTTPException with detail and headers",
    "Register custom exception handlers and override the default validation error format",
  ],
  theory: [
    {
      heading: "Why response models?",
      content: "Your database object may contain fields the client must never see: hashed_password, internal flags, cost price. A **response model** declares the output shape. FastAPI then validates the returned data, **filters out** fields not in the model, converts types to JSON and documents the response in Swagger.\n\nYou can declare it in two ways: `@app.get(..., response_model=UserOut)` or a return type annotation `def get_user() -> UserOut:`. If both are present, response_model wins. Use response_model when the function returns a dict or ORM object that is not literally the declared type.",
      syntax: "class UserIn(BaseModel):\n    username: str\n    password: str\n\nclass UserOut(BaseModel):\n    id: int\n    username: str\n\n@app.post(\"/users\", response_model=UserOut, status_code=201)\ndef create_user(user: UserIn):\n    return {\"id\": 1, **user.model_dump()}   # password filtered out",
      tip: "Golden rule: never use the same model for input and output when the input contains secrets.",
    },
    {
      heading: "Response model options",
      content: "`response_model_exclude_unset=True` skips fields that were never set (only defaults). `response_model_exclude_none=True` drops null values. `response_model_include` / `response_model_exclude` take sets of field names for quick filtering, but separate models are cleaner. For lists use `response_model=list[UserOut]`. To return ORM objects (Day 6), set `model_config = ConfigDict(from_attributes=True)` on the output model.",
      points: [
        "response_model=list[ItemOut] for collections",
        "response_model=None to disable output validation (e.g. returning a Response)",
        "Union types: response_model=Cat | Dog",
        "Inheritance pattern: UserBase -> UserCreate(+password), UserOut(+id)",
      ],
    },
    {
      heading: "HTTP status codes every backend developer must know",
      content: "Status codes tell the client what happened without reading the body. Set the success code with `status_code=` in the decorator, preferably using constants from `fastapi.status` for readability.\n\n**2xx success**: 200 OK (GET/PUT), 201 Created (POST that creates), 204 No Content (DELETE, no body).\n**4xx client errors**: 400 Bad Request (business rule failed), 401 Unauthorized (not logged in / bad token), 403 Forbidden (logged in but not allowed), 404 Not Found, 405 Method Not Allowed, 409 Conflict (duplicate email), 422 Unprocessable Entity (validation), 429 Too Many Requests.\n**5xx server errors**: 500 Internal Server Error (bug), 502/503 (upstream down, maintenance).",
      syntax: "from fastapi import status\n\n@app.post(\"/items\", status_code=status.HTTP_201_CREATED)\n@app.delete(\"/items/{id}\", status_code=status.HTTP_204_NO_CONTENT)",
      tip: "401 vs 403 is the most asked status code question. 401 = who are you? 403 = I know you, but you cannot do this.",
    },
    {
      heading: "HTTPException",
      content: "To stop processing and return an error, `raise HTTPException(status_code=404, detail=\"Student not found\")`. Raise (not return) it - it works even from deep helper functions and dependencies. The response body is `{\"detail\": \"Student not found\"}`. detail can be any JSON-serializable value (string, dict, list). You can also add headers, e.g. `headers={\"WWW-Authenticate\": \"Bearer\"}` for 401.",
      syntax: "from fastapi import HTTPException, status\n\nif student is None:\n    raise HTTPException(\n        status_code=status.HTTP_404_NOT_FOUND,\n        detail=f\"Student {student_id} not found\",\n    )",
    },
    {
      heading: "Custom exceptions and exception handlers",
      content: "For cleaner code, define your own exception classes (e.g. `InsufficientBalance`) and register a handler with `@app.exception_handler(MyError)`. The handler receives the request and the exception and returns a Response (usually JSONResponse). This keeps business logic free of HTTP details.\n\nYou can also override built-in handlers: `RequestValidationError` (to change the 422 format) and `StarletteHTTPException` (to change all HTTP errors). A catch-all handler for `Exception` lets you log unexpected errors and return a safe 500 message without leaking stack traces.",
      syntax: "from fastapi import Request\nfrom fastapi.responses import JSONResponse\n\nclass InsufficientBalance(Exception):\n    def __init__(self, needed: float):\n        self.needed = needed\n\n@app.exception_handler(InsufficientBalance)\nasync def balance_handler(request: Request, exc: InsufficientBalance):\n    return JSONResponse(status_code=400, content={\"error\": \"INSUFFICIENT_BALANCE\", \"needed\": exc.needed})",
    },
    {
      heading: "Consistent error format and other responses",
      content: "Large teams agree on one error shape, for example `{\"success\": false, \"error\": {\"code\": \"NOT_FOUND\", \"message\": \"...\"}}`, so frontend code can handle all errors the same way. Custom handlers make this possible.\n\nBesides JSON you can return `HTMLResponse`, `PlainTextResponse`, `RedirectResponse`, `FileResponse` and `StreamingResponse`. Use `responses={404: {\"description\": \"Not found\"}}` in the decorator to document extra status codes in Swagger.",
      points: [
        "Never expose stack traces or SQL errors to clients",
        "Log the full error on the server (logging module) with a request id",
        "Document error responses so frontend developers know what to expect",
      ],
    },
  ],
  examples: [
    {
      title: "Hide the password with a response model",
      scenario: "User registration returns the created user but must never return the password.",
      steps: [
        "pip install \"fastapi[standard]\"",
        "Save main.py and run fastapi dev main.py",
        "POST /users in Swagger and look at the 'Responses' schema and the actual body",
      ],
      code: `from fastapi import FastAPI, status
from pydantic import BaseModel, EmailStr

app = FastAPI()


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool = True


fake_db: list[dict] = []


@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    record = user.model_dump()
    record["id"] = len(fake_db) + 1
    record["hashed_password"] = "fakehash_" + user.password
    fake_db.append(record)
    return record


@app.get("/users", response_model=list[UserOut])
def list_users():
    return fake_db`,
      result: "POST /users {\"username\":\"asha\",\"email\":\"asha@gmail.com\",\"password\":\"secret123\"} -> 201 Created\n{\"username\":\"asha\",\"email\":\"asha@gmail.com\",\"id\":1,\"is_active\":true}\n(password and hashed_password are not in the response)",
      explanation: "The function returns a dict containing hashed_password, but response_model=UserOut filters the output to only username, email, id and is_active. Inheritance from UserBase avoids repeating common fields. status_code=201 is the correct code for creation.",
    },
    {
      title: "Full CRUD with proper status codes and HTTPException",
      scenario: "Task API returning 404 for unknown ids, 409 for duplicate titles and 204 on delete.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "Create a task, create the same title again, get id 99, delete id 1",
        "Use curl -i to see status lines",
      ],
      code: `from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI()


class TaskIn(BaseModel):
    title: str
    done: bool = False


class TaskOut(TaskIn):
    id: int


tasks: dict[int, dict] = {}
next_id = 1


def get_or_404(task_id: int) -> dict:
    task = tasks.get(task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Task {task_id} not found")
    return task


@app.post("/tasks", response_model=TaskOut, status_code=201)
def create_task(task: TaskIn):
    global next_id
    if any(t["title"] == task.title for t in tasks.values()):
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Task with this title exists")
    tasks[next_id] = {"id": next_id, **task.model_dump()}
    next_id += 1
    return tasks[next_id - 1]


@app.get("/tasks/{task_id}", response_model=TaskOut, responses={404: {"description": "Task not found"}})
def read_task(task_id: int):
    return get_or_404(task_id)


@app.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task: TaskIn):
    get_or_404(task_id)
    tasks[task_id] = {"id": task_id, **task.model_dump()}
    return tasks[task_id]


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int):
    get_or_404(task_id)
    del tasks[task_id]`,
      result: "POST {\"title\":\"Revise SQL\"} -> 201 {\"title\":\"Revise SQL\",\"done\":false,\"id\":1}\nSame POST again -> 409 {\"detail\":\"Task with this title exists\"}\nGET /tasks/99 -> 404 {\"detail\":\"Task 99 not found\"}\ncurl -i -X DELETE http://127.0.0.1:8000/tasks/1 -> HTTP/1.1 204 No Content (empty body)",
      explanation: "get_or_404 raises HTTPException from a helper; the exception travels up and FastAPI converts it into a response. 204 responses must not have a body, so the delete function returns nothing. responses={404: ...} documents the error in Swagger.",
    },
    {
      title: "Custom exception class with a handler",
      scenario: "A wallet service raises a domain error InsufficientBalance; the handler converts it to a 400 JSON error.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "POST /wallet/withdraw?amount=500 then ?amount=5000",
      ],
      code: `from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()
wallet = {"balance": 1000.0}


class InsufficientBalance(Exception):
    def __init__(self, balance: float, requested: float):
        self.balance = balance
        self.requested = requested


@app.exception_handler(InsufficientBalance)
async def insufficient_balance_handler(request: Request, exc: InsufficientBalance):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": "INSUFFICIENT_BALANCE",
                "message": f"Balance {exc.balance} is less than {exc.requested}",
                "path": request.url.path,
            },
        },
    )


def withdraw_money(amount: float) -> float:   # pure business logic, no HTTP
    if amount > wallet["balance"]:
        raise InsufficientBalance(wallet["balance"], amount)
    wallet["balance"] -= amount
    return wallet["balance"]


@app.post("/wallet/withdraw")
def withdraw(amount: float):
    return {"success": True, "balance": withdraw_money(amount)}`,
      result: "?amount=500 -> 200 {\"success\":true,\"balance\":500.0}\n?amount=5000 -> 400 {\"success\":false,\"error\":{\"code\":\"INSUFFICIENT_BALANCE\",\"message\":\"Balance 500.0 is less than 5000.0\",\"path\":\"/wallet/withdraw\"}}",
      explanation: "The business function knows nothing about HTTP; it raises a domain exception. The registered handler maps it to an HTTP response. This separation makes the logic easy to unit test and reuse (CLI, Celery tasks, etc.).",
    },
    {
      title: "Override the 422 validation format and add a catch-all 500 handler",
      scenario: "The frontend team wants simple field -> message errors, and unexpected crashes must not leak details.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "POST /register with {\"age\": \"abc\"}",
        "GET /crash to trigger a bug (run with fastapi run main.py; in dev mode the debug traceback may also print in the terminal)",
      ],
      code: `import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logger = logging.getLogger("api")
app = FastAPI()


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    errors = {}
    for err in exc.errors():
        field = ".".join(str(p) for p in err["loc"][1:])
        errors[field] = err["msg"]
    return JSONResponse(status_code=422, content={"success": False, "errors": errors})


@app.exception_handler(Exception)
async def unhandled_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"success": False, "message": "Something went wrong"})


class Register(BaseModel):
    name: str
    age: int


@app.post("/register")
def register(data: Register):
    return {"success": True}


@app.get("/crash")
def crash():
    return 1 / 0`,
      result: "POST /register {\"age\":\"abc\"} -> 422 {\"success\":false,\"errors\":{\"name\":\"Field required\",\"age\":\"Input should be a valid integer, unable to parse string as an integer\"}}\nGET /crash -> 500 {\"success\":false,\"message\":\"Something went wrong\"} and the traceback is logged in the terminal",
      explanation: "exc.errors() gives the list of Pydantic errors; loc[0] is 'body' so we skip it. The Exception handler is a safety net: clients get a generic message while developers see the full traceback in logs.",
    },
  ],
  interview: [
    { q: "What is response_model and why use it?", a: "It declares the output schema of an endpoint. FastAPI validates and filters the returned data to that schema, serializes it to JSON and documents it in OpenAPI. Main benefits: security (hide password/internal fields), consistent contracts and documentation.", level: "Easy" },
    { q: "response_model vs return type annotation?", a: "Both declare the output model. Return annotation (-> UserOut) is cleaner and helps editors/mypy. Use response_model when you return something of a different type (dict, ORM object) or want to filter a richer object; if both are given, response_model takes priority.", level: "Medium" },
    { q: "Difference between 401 and 403?", a: "401 Unauthorized means authentication failed or missing - the server does not know who you are (send WWW-Authenticate header). 403 Forbidden means you are authenticated but lack permission (e.g. a normal user calling an admin endpoint).", level: "Easy" },
    { q: "Which status code for creating a resource, and for a delete?", a: "201 Created for POST that creates (optionally with a Location header). DELETE usually returns 204 No Content (no body) or 200 with a message/deleted object.", level: "Easy" },
    { q: "Difference between 400 and 422 in FastAPI?", a: "422 is returned automatically when request data fails schema validation (wrong type, missing field). 400 is typically raised by you for business rule violations on well-formed data (e.g. coupon expired). Some teams also use 409 Conflict for duplicates.", level: "Medium" },
    { q: "Why raise HTTPException instead of returning it?", a: "Raising stops execution immediately, even from nested helper functions or dependencies, and FastAPI's exception handler converts it to a response. Returning would only work at the top level and would be treated as normal data.", level: "Medium" },
    { q: "How do you create a global error handler in FastAPI?", a: "Use @app.exception_handler(ExceptionClass) or app.add_exception_handler(). The handler is async def handler(request, exc) and returns a Response, e.g. JSONResponse. You can handle custom exceptions, RequestValidationError, StarletteHTTPException or Exception (catch-all).", level: "Medium" },
    { q: "How do you customize the 422 validation error response?", a: "Register a handler for fastapi.exceptions.RequestValidationError and build your own JSON from exc.errors() (list of dicts with loc, msg, type, input). Return JSONResponse(status_code=422, content=...).", level: "Hard" },
    { q: "What does response_model_exclude_unset do?", a: "It omits fields from the response that were not explicitly set on the returned object, i.e. fields that only have their default values. Useful when the DB stores sparse data and you do not want to send lots of defaults.", level: "Medium" },
    { q: "How do you document multiple possible responses in Swagger?", a: "Use the responses parameter: @app.get('/x', responses={404: {'description': 'Not found', 'model': ErrorModel}, 409: {...}}). Swagger then lists these codes and their schemas.", level: "Medium" },
    { q: "How would you design a consistent error response for a large API?", a: "Define an ErrorResponse model, e.g. {success: false, error: {code, message, details, request_id}}. Create domain exceptions (NotFound, Conflict, PermissionDenied) with a base AppError carrying status and code, register one handler for AppError plus handlers for RequestValidationError, HTTPException and Exception. Log server-side with request ids; never leak stack traces. Document with responses=.", level: "Hard" },
  ],
  practice: [
    {
      task: "Create ProductIn (name, price, cost_price) and ProductOut (id, name, price) models. POST /products returns 201 and must not expose cost_price.",
      hint: "response_model=ProductOut, status_code=201.",
      solution: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()
products: list[dict] = []


class ProductIn(BaseModel):
    name: str
    price: float = Field(gt=0)
    cost_price: float = Field(gt=0)


class ProductOut(BaseModel):
    id: int
    name: str
    price: float


@app.post("/products", response_model=ProductOut, status_code=201)
def create_product(p: ProductIn):
    data = p.model_dump() | {"id": len(products) + 1}
    products.append(data)
    return data`,
    },
    {
      task: "Add GET /products/{id} that raises 404 with detail {\"code\": \"PRODUCT_NOT_FOUND\", \"id\": id} when not found.",
      hint: "detail can be a dict.",
      solution: `from fastapi import HTTPException


@app.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int):
    for p in products:
        if p["id"] == product_id:
            return p
    raise HTTPException(
        status_code=404,
        detail={"code": "PRODUCT_NOT_FOUND", "id": product_id},
    )`,
    },
    {
      task: "Create a base AppError(Exception) with status_code and code attributes, and subclasses NotFoundError (404) and ConflictError (409). Register ONE handler for AppError that returns {\"success\": false, \"code\": ..., \"message\": ...}.",
      hint: "Handlers also catch subclasses of the registered exception.",
      solution: `from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()


class AppError(Exception):
    status_code = 400
    code = "BAD_REQUEST"

    def __init__(self, message: str):
        self.message = message


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"


class ConflictError(AppError):
    status_code = 409
    code = "CONFLICT"


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "code": exc.code, "message": exc.message},
    )


emails = {"asha@gmail.com"}


@app.post("/register")
def register(email: str):
    if email in emails:
        raise ConflictError("Email already registered")
    emails.add(email)
    return {"success": True}


@app.get("/orders/{order_id}")
def get_order(order_id: int):
    raise NotFoundError(f"Order {order_id} not found")`,
    },
    {
      task: "Return a 401 with header WWW-Authenticate: Bearer from GET /profile when the query param token is missing or not equal to 'abc123'.",
      hint: "HTTPException supports a headers argument.",
      solution: `from fastapi import FastAPI, HTTPException, status

app = FastAPI()


@app.get("/profile")
def profile(token: str | None = None):
    if token != "abc123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"username": "asha"}`,
    },
  ],
  quiz: [
    { question: "Which status code should a successful POST that creates a resource return?", options: ["200", "201", "204", "202"], answer: 1, explanation: "201 Created indicates a new resource was created." },
    { question: "A logged-in normal user calls an admin-only endpoint. Correct status?", options: ["401", "403", "404", "422"], answer: 1, explanation: "The user is authenticated but not authorized: 403 Forbidden." },
    { question: "What does response_model do with extra fields in the returned dict?", options: ["Raises 500", "Includes them", "Filters them out", "Renames them"], answer: 2, explanation: "Only fields declared in the response model are sent." },
    { question: "Which exception class do you handle to customize 422 errors?", options: ["HTTPException", "ValidationError from json", "RequestValidationError", "ValueError"], answer: 2, explanation: "fastapi.exceptions.RequestValidationError is raised for invalid requests." },
    { question: "What body should a 204 No Content response have?", options: ["{}", "null", "No body", "{\"detail\": \"ok\"}"], answer: 2, explanation: "204 responses must not include a body." },
    { question: "HTTPException(status_code=404, detail=\"Not found\") produces which JSON?", options: ["{\"error\": \"Not found\"}", "{\"detail\": \"Not found\"}", "{\"message\": \"Not found\"}", "\"Not found\""], answer: 1, explanation: "The default handler wraps detail in {\"detail\": ...}." },
  ],
};
