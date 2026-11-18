export default {
  id: "day-03-request-body-pydantic-validation",
  title: "Request Body with Pydantic v2 Models and Validation",
  module: "Module 1: FastAPI Basics",
  day: 3,
  level: "Beginner",
  duration: "3.5 hours",
  summary: "Accept JSON request bodies using Pydantic v2 BaseModel classes, add rules with Field(), write custom field_validator and model_validator functions, nest models, and combine body, path and query parameters in one endpoint.",
  objectives: [
    "Explain what a request body is and why we validate it",
    "Create Pydantic v2 models with required, optional and default fields",
    "Use Field() constraints and special types like EmailStr",
    "Write @field_validator and @model_validator for custom business rules",
    "Use nested models, lists of models, model_dump() and model_config",
  ],
  theory: [
    {
      heading: "What is a request body?",
      content: "A request body is the data the client sends to the server, usually as JSON, in POST, PUT and PATCH requests. Example: a registration form sends {\"name\": \"Asha\", \"email\": \"asha@gmail.com\", \"age\": 21}.\n\nYou must never trust client data. Without validation, a missing field causes KeyError, a string age causes TypeError, and bad data reaches your database. FastAPI solves this with **Pydantic models**: declare the shape of the data once, and every request is parsed, converted and validated before your function runs. Invalid data gets a 422 response automatically.",
      tip: "GET requests should not have a body. Use query parameters for GET and a body for POST/PUT/PATCH.",
    },
    {
      heading: "Pydantic v2 BaseModel basics",
      content: "Create a class that inherits from `pydantic.BaseModel` and declare fields with type hints. A field without a default is required; a field with a default is optional. When you use the model as a parameter type, FastAPI reads it from the JSON body.\n\nPydantic v2 (2023+) has a core written in Rust and is 5-50x faster than v1. Important v2 method names: `model_dump()` (was .dict()), `model_dump_json()` (was .json()), `model_validate()` (was parse_obj), `model_config = ConfigDict(...)` (was class Config).",
      syntax: "from pydantic import BaseModel\n\nclass StudentCreate(BaseModel):\n    name: str\n    email: str\n    age: int\n    city: str = \"Pune\"\n    phone: str | None = None\n\n@app.post(\"/students\")\ndef create(student: StudentCreate):\n    return student",
      points: [
        "Lax mode conversion: \"21\" -> 21 for int fields, \"true\" -> True for bool",
        "student.name - attribute access with editor autocomplete",
        "student.model_dump() -> plain dict; model_dump(exclude_unset=True) for PATCH",
        "Extra unknown fields are ignored by default; use model_config = ConfigDict(extra='forbid') to reject them",
      ],
    },
    {
      heading: "Field() constraints and special types",
      content: "`Field()` adds validation rules and documentation to a model field, similar to Query() for query parameters. It works with `Annotated` too. Pydantic also offers ready-made types: `EmailStr` (needs email-validator, included in fastapi[standard]), `HttpUrl`, `PositiveInt`, `conint`, `date`, `datetime`, `UUID`, `Decimal`.",
      syntax: "from pydantic import BaseModel, Field, EmailStr\n\nclass Product(BaseModel):\n    name: str = Field(min_length=2, max_length=100)\n    price: float = Field(gt=0, description=\"Price in INR\")\n    stock: int = Field(default=0, ge=0)\n    sku: str = Field(pattern=r\"^SKU-\\d{4}$\")\n    seller_email: EmailStr",
      points: [
        "Numbers: gt, ge, lt, le, multiple_of",
        "Strings: min_length, max_length, pattern",
        "Lists: min_length, max_length (number of items)",
        "Docs: title, description, examples=[...]",
        "default_factory=list for mutable defaults",
      ],
    },
    {
      heading: "Custom validators: field_validator and model_validator",
      content: "Built-in constraints cannot express every business rule. Pydantic v2 provides decorators:\n\n`@field_validator(\"field_name\")` - validate or transform a single field. It is a classmethod that receives the value and must return the (possibly modified) value or raise `ValueError`.\n\n`@model_validator(mode=\"after\")` - validate rules that involve multiple fields (e.g. password == confirm_password, end_date > start_date). It receives the model instance (self) and must return self.\n\nA ValueError raised inside a validator becomes a 422 response with your message.",
      syntax: "from pydantic import field_validator, model_validator\n\nclass Signup(BaseModel):\n    username: str\n    password: str\n    confirm_password: str\n\n    @field_validator(\"username\")\n    @classmethod\n    def no_spaces(cls, v: str) -> str:\n        if \" \" in v:\n            raise ValueError(\"username must not contain spaces\")\n        return v.lower()\n\n    @model_validator(mode=\"after\")\n    def passwords_match(self):\n        if self.password != self.confirm_password:\n            raise ValueError(\"passwords do not match\")\n        return self",
      tip: "In v1 it was @validator and @root_validator. Interviewers often ask about this migration.",
    },
    {
      heading: "Nested models and lists",
      content: "A field can itself be a Pydantic model, or a list of models. FastAPI validates the whole tree and shows the full schema in Swagger. This matches real JSON like an order containing an address and a list of items.",
      syntax: "class Address(BaseModel):\n    city: str\n    pincode: str\n\nclass Item(BaseModel):\n    product_id: int\n    qty: int = Field(ge=1)\n\nclass Order(BaseModel):\n    customer: str\n    address: Address\n    items: list[Item] = Field(min_length=1)",
    },
    {
      heading: "Mixing body, path and query parameters",
      content: "One endpoint can use all three: FastAPI reads the path parameter from the URL, simple types from the query string and the Pydantic model from the body. If you need a single simple value in the body (not a model), use `Body()`. With multiple model parameters, FastAPI expects a JSON object keyed by parameter names. `Body(embed=True)` wraps a single model under its name.\n\nFor documentation, add example data with `model_config = ConfigDict(json_schema_extra={\"examples\": [...]})` or `Field(examples=[...])` - Swagger pre-fills 'Try it out' with it.",
      points: [
        "PUT /students/{id}?notify=true with JSON body -> path + query + body",
        "importance: Annotated[int, Body()] -> a single value read from the body",
        "Two models user: User, item: Item -> body {\"user\": {...}, \"item\": {...}}",
      ],
    },
  ],
  examples: [
    {
      title: "Create a student with a Pydantic model",
      scenario: "A registration endpoint must reject invalid data automatically.",
      steps: [
        "pip install \"fastapi[standard]\" (includes email-validator for EmailStr)",
        "Save as main.py and run fastapi dev main.py",
        "In /docs open POST /students and click Try it out",
        "Send a valid body, then send age \"twenty\" and a bad email",
      ],
      code: `from fastapi import FastAPI
from pydantic import BaseModel, EmailStr, Field

app = FastAPI()


class StudentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    age: int = Field(ge=16, le=60)
    course: str = "Python"
    phone: str | None = None


students: list[dict] = []


@app.post("/students")
def create_student(student: StudentCreate):
    data = student.model_dump()
    data["id"] = len(students) + 1
    students.append(data)
    return data`,
      result: "Body {\"name\":\"Asha\",\"email\":\"asha@gmail.com\",\"age\":\"21\"} -> 200 {\"name\":\"Asha\",\"email\":\"asha@gmail.com\",\"age\":21,\"course\":\"Python\",\"phone\":null,\"id\":1}\nBody with age \"twenty\" and email \"asha\" -> 422 with two errors: loc [\"body\",\"email\"] \"value is not a valid email address...\" and loc [\"body\",\"age\"] \"Input should be a valid integer...\"",
      explanation: "The string \"21\" was converted to int 21 (lax mode). Defaults filled course and phone. All errors are reported together, each with loc pointing to the exact body field, which helps frontend teams show messages next to form inputs.",
    },
    {
      title: "Custom validators for signup",
      scenario: "Username must be lowercase without spaces, passwords must match and be strong.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "POST /signup with mismatched passwords, then with valid data",
      ],
      code: `from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator, model_validator

app = FastAPI()


class Signup(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=8)
    confirm_password: str

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        if " " in v:
            raise ValueError("username must not contain spaces")
        return v.lower()

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if not any(ch.isdigit() for ch in v):
            raise ValueError("password must contain at least one digit")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self


@app.post("/signup")
def signup(data: Signup):
    return {"message": f"Welcome {data.username}"}`,
      result: "{\"username\":\"Ravi\",\"password\":\"secret123\",\"confirm_password\":\"secret999\"} -> 422 msg \"Value error, passwords do not match\"\n{\"username\":\"Ravi K\",...} -> 422 \"Value error, username must not contain spaces\"\n{\"username\":\"Ravi\",\"password\":\"secret123\",\"confirm_password\":\"secret123\"} -> {\"message\":\"Welcome ravi\"}",
      explanation: "field_validator runs per field after type validation and can transform data (lowercase). model_validator(mode='after') sees the whole validated object, perfect for cross-field rules. Never return the password in responses - Day 4 response models solve that.",
    },
    {
      title: "Nested order model",
      scenario: "An e-commerce checkout sends customer, address and a list of items.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "Check the schema section at the bottom of /docs",
        "POST /orders with the example body (it is pre-filled)",
      ],
      code: `from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI()


class Address(BaseModel):
    line1: str
    city: str
    pincode: str = Field(pattern=r"^[1-9][0-9]{5}$")


class OrderItem(BaseModel):
    product: str
    price: float = Field(gt=0)
    qty: int = Field(default=1, ge=1, le=10)


class Order(BaseModel):
    customer: str
    address: Address
    items: list[OrderItem] = Field(min_length=1)

    model_config = ConfigDict(json_schema_extra={
        "examples": [{
            "customer": "Neha",
            "address": {"line1": "12 MG Road", "city": "Bengaluru", "pincode": "560001"},
            "items": [{"product": "Keyboard", "price": 799, "qty": 2}],
        }]
    })


@app.post("/orders")
def place_order(order: Order):
    total = sum(i.price * i.qty for i in order.items)
    return {"customer": order.customer, "city": order.address.city, "total": total}`,
      result: "Example body -> {\"customer\":\"Neha\",\"city\":\"Bengaluru\",\"total\":1598.0}\nitems: [] -> 422 \"List should have at least 1 item after validation, not 0\"\npincode \"0123\" -> 422 loc [\"body\",\"address\",\"pincode\"] string_pattern_mismatch",
      explanation: "Nested models are validated recursively and errors show the full path in loc. json_schema_extra examples appear in Swagger, making the API easier to try. Attribute access (order.address.city) gives autocomplete.",
    },
    {
      title: "Path + query + body together, and partial update",
      scenario: "Update a student: id in path, notify flag in query, changes in body. Support PATCH with only some fields.",
      steps: [
        "Save main.py and run fastapi dev main.py",
        "PUT /students/1?notify=true with a full body",
        "PATCH /students/1 with {\"city\": \"Nashik\"} only",
      ],
      code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

db = {1: {"name": "Asha", "city": "Pune", "course": "Python"}}


class StudentIn(BaseModel):
    name: str
    city: str
    course: str


class StudentPatch(BaseModel):
    name: str | None = None
    city: str | None = None
    course: str | None = None


@app.put("/students/{student_id}")
def replace_student(student_id: int, student: StudentIn, notify: bool = False):
    db[student_id] = student.model_dump()
    return {"id": student_id, "notified": notify, **db[student_id]}


@app.patch("/students/{student_id}")
def update_student(student_id: int, changes: StudentPatch):
    updates = changes.model_dump(exclude_unset=True)
    db[student_id].update(updates)
    return {"id": student_id, "changed": list(updates), **db[student_id]}`,
      result: "PUT /students/1?notify=true {\"name\":\"Asha\",\"city\":\"Mumbai\",\"course\":\"FastAPI\"} -> {\"id\":1,\"notified\":true,\"name\":\"Asha\",\"city\":\"Mumbai\",\"course\":\"FastAPI\"}\nPATCH /students/1 {\"city\":\"Nashik\"} -> {\"id\":1,\"changed\":[\"city\"],\"name\":\"Asha\",\"city\":\"Nashik\",\"course\":\"FastAPI\"}",
      explanation: "FastAPI detects each parameter's source automatically. For PATCH, exclude_unset=True returns only the fields the client actually sent, so other fields are not overwritten with None. This is a very common interview question.",
    },
    {
      title: "Pydantic outside FastAPI vs a plain dataclass (offline)",
      scenario: "See the difference between a dataclass (no validation) and what Pydantic does. Runs with the standard library only.",
      steps: [
        "Run python main.py (no install needed)",
        "Compare the output with the Pydantic behaviour described in the result",
      ],
      code: `from dataclasses import dataclass, asdict


@dataclass
class Student:
    name: str
    age: int


s = Student(name="Asha", age="twenty")   # no error!
print(s)
print(asdict(s))


# Manual validation is what you would have to write without Pydantic
def validate(data: dict) -> Student:
    errors = []
    if not isinstance(data.get("name"), str):
        errors.append("name must be a string")
    try:
        age = int(data.get("age"))
    except (TypeError, ValueError):
        errors.append("age must be an integer")
        age = None
    if errors:
        raise ValueError(errors)
    return Student(data["name"], age)


print(validate({"name": "Ravi", "age": "21"}))
try:
    validate({"name": 5, "age": "x"})
except ValueError as e:
    print("Errors:", e)`,
      python: {
        files: {
          "main.py": `from dataclasses import dataclass, asdict


@dataclass
class Student:
    name: str
    age: int


s = Student(name="Asha", age="twenty")   # no error!
print(s)
print(asdict(s))


# Manual validation is what you would have to write without Pydantic
def validate(data: dict) -> Student:
    errors = []
    if not isinstance(data.get("name"), str):
        errors.append("name must be a string")
    try:
        age = int(data.get("age"))
    except (TypeError, ValueError):
        errors.append("age must be an integer")
        age = None
    if errors:
        raise ValueError(errors)
    return Student(data["name"], age)


print(validate({"name": "Ravi", "age": "21"}))
try:
    validate({"name": 5, "age": "x"})
except ValueError as e:
    print("Errors:", e)
`,
        },
      },
      result: "Student(name='Asha', age='twenty')\n{'name': 'Asha', 'age': 'twenty'}\nStudent(name='Ravi', age=21)\nErrors: ['name must be a string', 'age must be an integer']\n(With Pydantic, Student(name='Asha', age='twenty') would raise ValidationError automatically.)",
      explanation: "Dataclasses only store data; they do not validate. Writing manual checks for every field is long and error-prone. Pydantic generates all of this from type hints, and FastAPI turns the errors into a 422 response.",
    },
  ],
  interview: [
    { q: "What is Pydantic and why does FastAPI use it?", a: "Pydantic is a data validation and parsing library based on type hints. FastAPI uses it to validate request bodies (and parameters), convert types, serialize responses and generate JSON Schema for OpenAPI docs. Pydantic v2 has a Rust core (pydantic-core) and is much faster than v1.", level: "Easy" },
    { q: "How do you declare a request body in FastAPI?", a: "Create a class inheriting from pydantic.BaseModel with typed fields, and use it as the type of a path function parameter: def create(item: Item). FastAPI reads the JSON body, validates it and passes an Item instance.", level: "Easy" },
    { q: "List key differences between Pydantic v1 and v2.", a: "v2: Rust core, much faster; .dict() -> model_dump(); .json() -> model_dump_json(); parse_obj -> model_validate(); class Config -> model_config = ConfigDict(...); orm_mode -> from_attributes=True; @validator -> @field_validator; @root_validator -> @model_validator; regex -> pattern in Field; strict mode available.", level: "Medium" },
    { q: "Difference between field_validator and model_validator?", a: "field_validator validates/transforms one field (or a few listed fields) and receives the value. model_validator validates the whole model; mode='after' receives the constructed instance (good for cross-field rules like password confirmation), mode='before' receives the raw input (good for reshaping input data).", level: "Medium" },
    { q: "What does model_dump(exclude_unset=True) do and when do you use it?", a: "It returns only the fields that were explicitly provided in the input, ignoring defaults. Used in PATCH (partial update) endpoints so that missing fields are not overwritten with default or None values.", level: "Medium" },
    { q: "How do you forbid extra fields in a request body?", a: "Set model_config = ConfigDict(extra='forbid'). Then unknown keys cause a 422 'Extra inputs are not permitted'. Default is 'ignore'; 'allow' keeps them.", level: "Medium" },
    { q: "What is the difference between Field() and Query()?", a: "Field() configures fields inside a Pydantic model (body data). Query() configures function parameters read from the query string. Both support similar constraints (gt, ge, min_length, pattern, description, examples).", level: "Easy" },
    { q: "What is lax vs strict mode in Pydantic v2?", a: "Lax (default) converts compatible input: '21' -> 21, 'true' -> True. Strict mode (Field(strict=True) or ConfigDict(strict=True), or StrictInt) rejects input of the wrong type without conversion. Strict is useful for financial or security-sensitive data.", level: "Hard" },
    { q: "How are nested JSON objects validated?", a: "Declare a field whose type is another BaseModel or list[Model]. Pydantic validates recursively, and errors include the full path, e.g. loc ['body', 'items', 0, 'qty'].", level: "Easy" },
    { q: "How do you read a single primitive value from the body?", a: "Use Body(): importance: Annotated[int, Body()]. Otherwise a simple type would be treated as a query parameter. Body(embed=True) on a model expects {\"item\": {...}} instead of {...}.", level: "Medium" },
    { q: "Why separate models like StudentCreate, StudentUpdate and StudentOut?", a: "Each operation needs different fields: create needs password and required fields, update makes everything optional, output must hide secrets like password and include server-generated fields like id and created_at. Separate schemas keep validation precise and prevent data leaks. Inheritance from a StudentBase avoids repetition.", level: "Hard" },
    { q: "What is a mutable default problem and how does Pydantic handle it?", a: "In normal Python functions/classes, a list default is shared between calls. Pydantic copies defaults per instance, so tags: list[str] = [] is safe, but the clearer style is Field(default_factory=list).", level: "Hard" },
  ],
  practice: [
    {
      task: "Create a Book model: title (2-200 chars), author (required), price (> 0), pages (int >= 1, default 100), isbn (exactly 13 digits). Add POST /books returning the book plus an id.",
      hint: "Use Field with min_length, gt, ge and pattern.",
      solution: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()
books: list[dict] = []


class Book(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    author: str
    price: float = Field(gt=0)
    pages: int = Field(default=100, ge=1)
    isbn: str = Field(pattern=r"^[0-9]{13}$")


@app.post("/books")
def add_book(book: Book):
    data = book.model_dump() | {"id": len(books) + 1}
    books.append(data)
    return data`,
    },
    {
      task: "Create a LeaveRequest model with start_date and end_date (date), and reason. Reject if end_date is before start_date or the leave is longer than 30 days.",
      hint: "Use model_validator(mode='after') and date subtraction (.days).",
      solution: `from datetime import date

from fastapi import FastAPI
from pydantic import BaseModel, model_validator

app = FastAPI()


class LeaveRequest(BaseModel):
    start_date: date
    end_date: date
    reason: str

    @model_validator(mode="after")
    def check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be after start_date")
        if (self.end_date - self.start_date).days > 30:
            raise ValueError("leave cannot exceed 30 days")
        return self


@app.post("/leaves")
def apply_leave(leave: LeaveRequest):
    days = (leave.end_date - leave.start_date).days + 1
    return {"status": "submitted", "days": days}`,
    },
    {
      task: "Write a field_validator that converts a phone number like '+91 98765-43210' to '9876543210' and rejects if it is not 10 digits starting with 6-9.",
      hint: "Keep only digits, strip a leading 91 if length is 12.",
      solution: `from fastapi import FastAPI
from pydantic import BaseModel, field_validator

app = FastAPI()


class Contact(BaseModel):
    name: str
    phone: str

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        digits = "".join(ch for ch in v if ch.isdigit())
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if len(digits) != 10 or digits[0] not in "6789":
            raise ValueError("invalid Indian mobile number")
        return digits


@app.post("/contacts")
def add_contact(c: Contact):
    return c`,
    },
    {
      task: "Create an Invoice model with a nested Customer (name, gstin optional) and a list of LineItem (description, qty >= 1, rate > 0). POST /invoices returns subtotal, gst (18%) and total.",
      hint: "Sum qty * rate over items, round to 2 decimals.",
      solution: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Customer(BaseModel):
    name: str
    gstin: str | None = None


class LineItem(BaseModel):
    description: str
    qty: int = Field(ge=1)
    rate: float = Field(gt=0)


class Invoice(BaseModel):
    customer: Customer
    items: list[LineItem] = Field(min_length=1)


@app.post("/invoices")
def create_invoice(inv: Invoice):
    subtotal = sum(i.qty * i.rate for i in inv.items)
    gst = round(subtotal * 0.18, 2)
    return {"customer": inv.customer.name, "subtotal": subtotal,
            "gst": gst, "total": round(subtotal + gst, 2)}`,
    },
  ],
  quiz: [
    { question: "In Pydantic v2, which method converts a model to a dict?", options: [".dict()", ".to_dict()", ".model_dump()", ".as_dict()"], answer: 2, explanation: ".dict() is the v1 name (deprecated in v2). Use model_dump()." },
    { question: "What does FastAPI return when a body field fails a Field(gt=0) rule?", options: ["400", "404", "422", "500"], answer: 2, explanation: "All request validation errors return 422 Unprocessable Entity." },
    { question: "Which decorator validates a rule that compares two fields?", options: ["@field_validator", "@model_validator(mode='after')", "@validator_root", "@app.validator"], answer: 1, explanation: "Cross-field rules need the whole model, so use model_validator(mode='after')." },
    { question: "How do you make extra unknown JSON keys raise an error?", options: ["Field(extra=False)", "model_config = ConfigDict(extra='forbid')", "strict=True on each field", "It is the default behaviour"], answer: 1, explanation: "Default is to ignore extras; extra='forbid' rejects them." },
    { question: "For PATCH, which call returns only the fields the client sent?", options: ["model_dump()", "model_dump(exclude_none=False)", "model_dump(exclude_unset=True)", "model_json()"], answer: 2, explanation: "exclude_unset drops fields that were not provided in the input." },
    { question: "A field_validator must...", options: ["Return None", "Return the (possibly modified) value or raise ValueError", "Print the error", "Be an async function"], answer: 1, explanation: "Validators return the value to store or raise ValueError/AssertionError which becomes a validation error." },
  ],
};
