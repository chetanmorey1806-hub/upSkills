export default {
  id: "day-07-pydantic-v2-validation-settings",
  title: "Data Validation and Settings with Pydantic v2",
  module: "Module 2: Data & Apps",
  day: 7,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Learn how Pydantic v2 turns Python type hints into fast runtime validation: define models, use Field constraints, write custom validators, serialize to dict/JSON, and load app settings safely from environment variables with pydantic-settings.",
  objectives: [
    "Explain why runtime data validation is needed even when you use type hints",
    "Create Pydantic v2 models with BaseModel, Field constraints and nested models",
    "Write field_validator and model_validator functions for custom business rules",
    "Serialize models with model_dump() and model_dump_json() and parse with model_validate()",
    "Load typed configuration from environment variables and .env files using pydantic-settings",
    "Compare Pydantic with plain dataclasses and know when each one fits",
  ],
  theory: [
    {
      heading: "Why Data Validation Matters",
      content: "Python type hints like `age: int` are only hints. Python itself never checks them at runtime, so `age = \"twenty\"` happily runs. In real projects data arrives from outside: JSON from an API request, rows from a CSV file, values from environment variables, form input from a user. All of it is untrusted and often comes as strings.\n\nIf you do not validate, bad data travels deep into your code and fails much later with a confusing error, or worse, gets saved in the database. **Pydantic** reads your type hints and checks (and converts) data at runtime when an object is created. If the data is wrong you get one clear `ValidationError` listing every problem.\n\nPydantic v2 (released 2023) has its core written in Rust (`pydantic-core`), which makes it 5 to 50 times faster than v1. It is used by FastAPI, LangChain, the OpenAI SDK and many other libraries, so it is a very common interview topic.",
      points: [
        "Install: pip install pydantic (current major version is 2.x)",
        "Validation = checking data is correct; parsing/coercion = converting it to the right type",
        "One ValidationError collects ALL field errors, not just the first one",
      ],
      tip: "Validate at the boundary of your system (API input, file input, config) and then trust the typed objects inside your code.",
    },
    {
      heading: "BaseModel Basics and Type Coercion",
      content: "You create a model by subclassing `BaseModel` and declaring fields with type hints. A field without a default is required. A field with a default is optional. By default Pydantic runs in **lax mode**: it converts compatible values, for example the string `\"25\"` becomes the int `25` and `\"true\"` becomes `True`. Values that cannot be converted raise an error.\n\nIf you want no conversion at all, use strict mode with `model_config = ConfigDict(strict=True)` or a type like `StrictInt`.",
      syntax: `from pydantic import BaseModel, ValidationError

class Student(BaseModel):
    name: str
    age: int
    email: str | None = None      # optional field
    skills: list[str] = []        # safe: Pydantic copies defaults

s = Student(name="Asha", age="21")   # "21" is coerced to 21
print(s.age + 1)                     # 22

try:
    Student(name="Ravi", age="twenty")
except ValidationError as e:
    print(e.error_count(), e.errors()[0]["type"])   # 1 int_parsing
`,
      points: [
        "Mutable defaults like [] are safe in Pydantic models (each instance gets its own copy)",
        "Models are mutable by default; use ConfigDict(frozen=True) to make them immutable and hashable",
        "Use model_config = ConfigDict(extra=\"forbid\") to reject unknown fields",
      ],
    },
    {
      heading: "Field Constraints and Special Types",
      content: "`Field()` adds rules and metadata to a field: minimum/maximum numbers, string length, regex patterns, default values, aliases and descriptions. Pydantic also ships useful ready-made types such as `EmailStr` (needs `pip install pydantic[email]`), `HttpUrl`, `PositiveInt`, and `SecretStr` (hides passwords when printed).",
      syntax: `from pydantic import BaseModel, Field, EmailStr, HttpUrl, SecretStr

class Product(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    price: float = Field(gt=0, description="Price in INR")
    stock: int = Field(default=0, ge=0)
    sku: str = Field(pattern=r"^[A-Z]{3}-\\d{4}$")
    website: HttpUrl | None = None

class User(BaseModel):
    email: EmailStr
    password: SecretStr          # prints as '**********'
`,
      points: [
        "gt / ge / lt / le = greater than, greater or equal, less than, less or equal",
        "min_length / max_length work on strings and lists",
        "Field(alias=\"userName\") lets JSON use camelCase while Python uses snake_case",
        "Annotated[int, Field(gt=0)] is the reusable way to attach constraints to a type",
      ],
    },
    {
      heading: "Custom Validators: field_validator and model_validator",
      content: "When built-in constraints are not enough, write your own rules. In v2 the decorators are `@field_validator` (for one or more fields) and `@model_validator` (for rules that compare several fields). They replace v1's `@validator` and `@root_validator`.\n\nA validator receives the value, checks it, and must **return** the (possibly cleaned) value. To reject it, raise `ValueError` with a clear message; Pydantic wraps it into a `ValidationError`. `mode=\"after\"` (default) runs after type conversion; `mode=\"before\"` runs on the raw input.",
      syntax: `from pydantic import BaseModel, field_validator, model_validator

class Signup(BaseModel):
    username: str
    password: str
    confirm_password: str

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.isalnum():
            raise ValueError("username must be letters and digits only")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self
`,
      tip: "Always return the value from a field_validator. Forgetting the return sets the field to None - a classic bug.",
    },
    {
      heading: "Nested Models and Serialization",
      content: "A field can itself be a model, or a list of models, so you can validate deeply nested JSON in one call. Pydantic v2 renamed the main methods - interviewers often check that you know the new names:",
      points: [
        "Model.model_validate(dict) - build a model from a dict (v1: parse_obj)",
        "Model.model_validate_json(json_string) - parse and validate JSON directly (v1: parse_raw)",
        "obj.model_dump() - convert to a dict (v1: dict())",
        "obj.model_dump_json(indent=2) - convert to a JSON string (v1: json())",
        "obj.model_copy(update={...}) - copy with changes (v1: copy())",
        "Model.model_json_schema() - generate JSON Schema (v1: schema())",
        "model_dump(exclude={\"password\"}), include=..., exclude_none=True, by_alias=True control the output",
      ],
      syntax: `class Address(BaseModel):
    city: str
    pincode: str = Field(pattern=r"^\\d{6}$")

class Customer(BaseModel):
    name: str
    addresses: list[Address]

data = '{"name": "Meena", "addresses": [{"city": "Pune", "pincode": "411001"}]}'
c = Customer.model_validate_json(data)
print(c.addresses[0].city)       # Pune
print(c.model_dump())            # plain nested dict
`,
    },
    {
      heading: "Settings Management with pydantic-settings",
      content: "Apps need configuration: database URL, secret keys, debug flag, API keys. The 12-factor app rule says keep config in **environment variables**, not in code. In v2, settings live in a separate package: `pip install pydantic-settings`.\n\nYou subclass `BaseSettings`. Each field is read from an environment variable with the same name (case-insensitive by default), converted to the right type and validated. You can also read a `.env` file during development. Values passed directly win over env vars, env vars win over `.env`, and `.env` wins over defaults.",
      syntax: `# config.py
from functools import lru_cache
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

    database_url: str = "sqlite:///dev.db"
    debug: bool = False
    secret_key: SecretStr
    allowed_hosts: list[str] = ["localhost"]   # JSON in env: '["a.com","b.com"]'

@lru_cache
def get_settings() -> Settings:
    return Settings()

# .env
# APP_SECRET_KEY=super-secret
# APP_DEBUG=true
`,
      tip: "Add .env to .gitignore and commit a .env.example with dummy values instead. Never commit real secrets.",
    },
    {
      heading: "Pydantic vs dataclasses vs TypedDict",
      content: "Python's standard library has `@dataclass`, which generates `__init__`, `__repr__` and `__eq__` for you, but it does **not** validate types. You can add manual checks in `__post_init__`. `TypedDict` only helps static type checkers like mypy. Pydantic validates and converts at runtime.",
      points: [
        "dataclass: fast, zero dependencies, good for internal data you already trust",
        "TypedDict: just type hints for dicts, no runtime checks at all",
        "Pydantic BaseModel: runtime validation, coercion, JSON parsing/serialization, JSON Schema",
        "pydantic.dataclasses.dataclass: dataclass syntax with Pydantic validation",
        "FastAPI uses Pydantic models for request bodies and responses automatically",
      ],
    },
  ],
  examples: [
    {
      title: "Validating an API Order Payload",
      scenario: "An e-commerce backend receives order JSON from a mobile app. We must reject bad quantities and wrong pincodes before saving.",
      steps: [
        "Create a virtual environment: python -m venv .venv and activate it",
        "Install Pydantic: pip install pydantic",
        "Create order_model.py and paste the code",
        "Run: python order_model.py",
        "Try changing the bad payload values and watch the error list change",
      ],
      code: `from pydantic import BaseModel, Field, ValidationError

class Item(BaseModel):
    sku: str
    qty: int = Field(gt=0, le=10)
    price: float = Field(gt=0)

class Order(BaseModel):
    order_id: int
    pincode: str = Field(pattern=r"^\\d{6}$")
    items: list[Item] = Field(min_length=1)

    @property
    def total(self) -> float:
        return sum(i.qty * i.price for i in self.items)

good = {"order_id": "101", "pincode": "560001",
        "items": [{"sku": "PEN", "qty": "2", "price": 25.0}]}
order = Order.model_validate(good)
print(order.order_id, type(order.order_id).__name__, order.total)

bad = {"order_id": 102, "pincode": "56A001",
       "items": [{"sku": "BOOK", "qty": 0, "price": -5}]}
try:
    Order.model_validate(bad)
except ValidationError as e:
    print(e.error_count(), "errors")
    for err in e.errors():
        print(err["loc"], "->", err["msg"])
`,
      result: `101 int 50.0
3 errors
('pincode',) -> String should match pattern '^\\d{6}$'
('items', 0, 'qty') -> Input should be greater than 0
('items', 0, 'price') -> Input should be greater than 0`,
      explanation: "In the good payload the strings \"101\" and \"2\" are coerced to ints. In the bad payload Pydantic does not stop at the first problem: it reports all three errors with a `loc` tuple that shows the exact path, even inside the nested list (`items -> 0 -> qty`). FastAPI returns exactly this structure as a 422 response.",
    },
    {
      title: "Custom Validators for a Signup Form",
      scenario: "A signup form must normalise usernames and make sure both password fields match.",
      steps: [
        "Install Pydantic with pip install pydantic",
        "Create signup.py with the code below",
        "Run: python signup.py",
        "Observe that the username is cleaned and the mismatch error is reported",
      ],
      code: `from pydantic import BaseModel, ValidationError, field_validator, model_validator

class Signup(BaseModel):
    username: str
    password: str
    confirm_password: str

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) < 3:
            raise ValueError("username too short")
        return v

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if len(v) < 8 or v.isalpha():
            raise ValueError("password needs 8+ chars and a digit/symbol")
        return v

    @model_validator(mode="after")
    def check_match(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self

ok = Signup(username="  RahulK ", password="secret123", confirm_password="secret123")
print(ok.username)

try:
    Signup(username="RahulK", password="secret123", confirm_password="secret124")
except ValidationError as e:
    print(e.errors()[0]["msg"])
`,
      result: `rahulk
Value error, passwords do not match`,
      explanation: "The field validator strips spaces and lowercases the username before storing it. The model validator runs after all fields are valid, so it can compare two fields. Pydantic prefixes messages from ValueError with \"Value error, \".",
    },
    {
      title: "Loading App Settings from Environment Variables",
      scenario: "A Flask/FastAPI project must read its database URL, debug flag and secret key from the environment so the same code runs on a laptop and on a server.",
      steps: [
        "Install: pip install pydantic-settings",
        "Create config.py with the Settings class",
        "Create a .env file next to it containing: APP_SECRET_KEY=dev-secret and APP_DEBUG=true",
        "Add .env to .gitignore",
        "Run: python config.py, then run again with: APP_DEBUG=false python config.py (Linux/macOS) to see the env var override the .env file",
      ],
      code: `from functools import lru_cache
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

    database_url: str = "sqlite:///dev.db"
    debug: bool = False
    secret_key: SecretStr
    max_upload_mb: int = 5

@lru_cache
def get_settings() -> Settings:
    return Settings()

if __name__ == "__main__":
    s = get_settings()
    print(s.debug, s.database_url, s.max_upload_mb)
    print(s.secret_key)
    print(len(s.secret_key.get_secret_value()))
`,
      result: `True sqlite:///dev.db 5
**********
10`,
      explanation: "APP_DEBUG=true from .env is converted to the bool True. database_url and max_upload_mb fall back to defaults. SecretStr hides the value when printed or logged; you call get_secret_value() only where the real secret is needed. If APP_SECRET_KEY is missing everywhere, Settings() raises a ValidationError at startup - failing fast is good. lru_cache makes sure the settings are read only once.",
    },
    {
      title: "Plain dataclass Validation with __post_init__ (stdlib only)",
      scenario: "In a small script you cannot install packages, but you still want basic checks. We validate an Employee dataclass by hand and see how much work Pydantic saves.",
      steps: [
        "Create main.py with the code below (no pip install needed)",
        "Run: python main.py",
        "Compare: Pydantic would coerce '45000' automatically and collect all errors at once",
      ],
      code: `from dataclasses import dataclass, field, asdict

@dataclass
class Employee:
    name: str
    salary: float
    dept: str = "IT"
    skills: list[str] = field(default_factory=list)

    def __post_init__(self):
        errors = []
        if not isinstance(self.name, str) or len(self.name.strip()) < 2:
            errors.append("name: must be at least 2 characters")
        if isinstance(self.salary, str):
            try:
                self.salary = float(self.salary)
            except ValueError:
                errors.append("salary: not a number")
        if isinstance(self.salary, (int, float)) and self.salary <= 0:
            errors.append("salary: must be positive")
        if self.dept not in {"IT", "HR", "Sales"}:
            errors.append(f"dept: unknown department {self.dept!r}")
        if errors:
            raise ValueError("; ".join(errors))

e = Employee("Priya", "45000")
print(e)
print(asdict(e)["salary"])

for bad in [("A", -10, "IT"), ("Kiran", "abc", "Ops")]:
    try:
        Employee(*bad)
    except ValueError as err:
        print("Invalid:", err)
`,
      python: {
        files: {
          "main.py": `from dataclasses import dataclass, field, asdict

@dataclass
class Employee:
    name: str
    salary: float
    dept: str = "IT"
    skills: list[str] = field(default_factory=list)

    def __post_init__(self):
        errors = []
        if not isinstance(self.name, str) or len(self.name.strip()) < 2:
            errors.append("name: must be at least 2 characters")
        if isinstance(self.salary, str):
            try:
                self.salary = float(self.salary)
            except ValueError:
                errors.append("salary: not a number")
        if isinstance(self.salary, (int, float)) and self.salary <= 0:
            errors.append("salary: must be positive")
        if self.dept not in {"IT", "HR", "Sales"}:
            errors.append(f"dept: unknown department {self.dept!r}")
        if errors:
            raise ValueError("; ".join(errors))

e = Employee("Priya", "45000")
print(e)
print(asdict(e)["salary"])

for bad in [("A", -10, "IT"), ("Kiran", "abc", "Ops")]:
    try:
        Employee(*bad)
    except ValueError as err:
        print("Invalid:", err)
`,
        },
      },
      result: `Employee(name='Priya', salary=45000.0, dept='IT', skills=[])
45000.0
Invalid: name: must be at least 2 characters; salary: must be positive
Invalid: salary: not a number; dept: unknown department 'Ops'`,
      explanation: "A dataclass does not check types, so we wrote every check and conversion by hand in __post_init__, which runs right after the generated __init__. We also needed field(default_factory=list) because a plain [] default is not allowed in dataclasses. Pydantic gives all of this (coercion, constraints, error collection) with a few Field() declarations.",
    },
  ],
  interview: [
    {
      q: "What is Pydantic and why is it used?",
      a: "Pydantic is a data validation library that uses Python type hints to validate and convert data at runtime. It is used to validate untrusted input (API requests, JSON, config, CSV), to serialize objects to dict/JSON, and to generate JSON Schema. FastAPI builds its request/response handling on it.",
      level: "Easy",
    },
    {
      q: "Python already has type hints. Why do we need Pydantic?",
      a: "Type hints are not enforced by the Python interpreter; they are only used by editors and static checkers like mypy. At runtime `age: int` can still hold a string. Pydantic reads those hints and actually checks and coerces values when a model is created, raising ValidationError for bad data.",
      level: "Easy",
    },
    {
      q: "What changed in Pydantic v2 compared to v1?",
      a: "The core was rewritten in Rust (pydantic-core), making it much faster. Method names changed: `parse_obj` -> `model_validate`, `dict()` -> `model_dump()`, `json()` -> `model_dump_json()`, `copy()` -> `model_copy()`, `schema()` -> `model_json_schema()`. `@validator`/`@root_validator` became `@field_validator`/`@model_validator`. `class Config` became `model_config = ConfigDict(...)`. BaseSettings moved to the separate `pydantic-settings` package. Strict mode was added.",
      level: "Medium",
    },
    {
      q: "What is the difference between lax mode and strict mode?",
      a: "Lax mode (default) coerces compatible input: \"5\" becomes 5, \"true\" becomes True. Strict mode rejects any value whose type does not already match, so \"5\" for an int field is an error. Enable it per model with `ConfigDict(strict=True)`, per field with `Field(strict=True)`, or by using types like `StrictInt`.",
      level: "Medium",
    },
    {
      q: "What is the difference between field_validator and model_validator?",
      a: "`@field_validator(\"name\")` validates one (or a few listed) fields independently and receives that value. `@model_validator(mode=\"after\")` runs on the whole model after field validation, so it can enforce rules across fields, such as start_date < end_date or password == confirm_password. `mode=\"before\"` versions receive raw input before type conversion.",
      level: "Medium",
    },
    {
      q: "How do you convert a Pydantic model to a dict and JSON, and back?",
      a: "`obj.model_dump()` returns a dict; `obj.model_dump_json()` returns a JSON string. To go back use `Model.model_validate(some_dict)` or `Model.model_validate_json(json_string)`. Options like `exclude`, `include`, `exclude_none` and `by_alias` control output.",
      level: "Easy",
    },
    {
      q: "How would you manage configuration and secrets in a Python app using Pydantic?",
      a: "Use `pydantic-settings`: subclass `BaseSettings`, declare typed fields, and set `model_config = SettingsConfigDict(env_file=\".env\", env_prefix=\"APP_\")`. Values come from env vars (and .env in development), are validated at startup, and secrets use `SecretStr` so they are not printed in logs. Wrap creation in a cached `get_settings()` function. Keep .env out of git and use real env vars or a secrets manager in production.",
      level: "Medium",
    },
    {
      q: "What does SecretStr do?",
      a: "It stores a sensitive string but shows `**********` in repr, str and logs. You must call `.get_secret_value()` to read the real value. This prevents passwords and API keys from leaking into logs or error pages by accident.",
      level: "Easy",
    },
    {
      q: "How do you reject unknown fields in a request body?",
      a: "Set `model_config = ConfigDict(extra=\"forbid\")`. By default extra fields are ignored. `extra=\"allow\"` keeps them on the model. Forbidding is useful for strict APIs where a typo like `emial` should be reported instead of silently ignored.",
      level: "Medium",
    },
    {
      q: "Compare Pydantic BaseModel with a standard dataclass.",
      a: "A dataclass auto-generates __init__/__repr__/__eq__ but performs no type validation or conversion, has no JSON parsing, and needs default_factory for mutable defaults. BaseModel validates, coerces, collects all errors, serializes to JSON and produces JSON Schema, at a small performance cost. Use dataclasses for trusted internal data and Pydantic at system boundaries. `pydantic.dataclasses.dataclass` combines both.",
      level: "Medium",
    },
    {
      q: "A field_validator sets the field to None unexpectedly. What is the likely bug?",
      a: "The validator function forgot to `return v`. A Python function without return gives None, and Pydantic stores whatever the validator returns. Every field validator must return the final value.",
      level: "Hard",
    },
    {
      q: "How does FastAPI use Pydantic, and what happens when validation fails?",
      a: "When you declare a parameter typed as a BaseModel, FastAPI reads the JSON body and calls model validation. On failure it automatically returns HTTP 422 Unprocessable Entity with the list of errors (loc, msg, type). `response_model` uses Pydantic to filter and serialize the output, and the models also generate the OpenAPI docs at /docs.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Create a Pydantic model `Book` with title (2-100 chars), author (str), price (float > 0), pages (int >= 1) and tags (list of str, default empty). Validate a dict where price is the string \"499\" and print the model_dump().",
      hint: "Use Field(min_length=2, max_length=100) and Field(gt=0). Lax mode converts \"499\" for you.",
      solution: `from pydantic import BaseModel, Field

class Book(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    author: str
    price: float = Field(gt=0)
    pages: int = Field(ge=1)
    tags: list[str] = []

b = Book.model_validate({"title": "Python Basics", "author": "Anil",
                         "price": "499", "pages": 320})
print(b.model_dump())
# {'title': 'Python Basics', 'author': 'Anil', 'price': 499.0, 'pages': 320, 'tags': []}
`,
    },
    {
      task: "Write a model `LeaveRequest` with employee_id, start_date and end_date (datetime.date). Add a model_validator that rejects requests where end_date is before start_date, and a computed property `days` giving the number of leave days (inclusive).",
      hint: "Pydantic parses \"2026-01-10\" into date automatically. Use @model_validator(mode=\"after\").",
      solution: `from datetime import date
from pydantic import BaseModel, ValidationError, model_validator

class LeaveRequest(BaseModel):
    employee_id: int
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self

    @property
    def days(self) -> int:
        return (self.end_date - self.start_date).days + 1

r = LeaveRequest(employee_id=7, start_date="2026-01-10", end_date="2026-01-12")
print(r.days)   # 3

try:
    LeaveRequest(employee_id=7, start_date="2026-01-12", end_date="2026-01-10")
except ValidationError as e:
    print(e.errors()[0]["msg"])
`,
    },
    {
      task: "Create a `Settings` class with pydantic-settings that reads APP_DATABASE_URL (required), APP_DEBUG (bool, default False) and APP_ALLOWED_HOSTS (list[str]). Show what happens when APP_DATABASE_URL is missing.",
      hint: "Use SettingsConfigDict(env_prefix=\"APP_\"). List values are given as JSON in env vars.",
      solution: `# pip install pydantic-settings
from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env")
    database_url: str
    debug: bool = False
    allowed_hosts: list[str] = ["localhost"]

try:
    s = Settings()
    print(s)
except ValidationError as e:
    print("Config error:", e.errors()[0]["loc"], e.errors()[0]["msg"])

# Run:
#   python settings.py                 -> Config error: ('database_url',) Field required
#   export APP_DATABASE_URL=postgresql://u:p@localhost/shop
#   export APP_ALLOWED_HOSTS='["shop.in","api.shop.in"]'
#   python settings.py                 -> prints the loaded settings
`,
    },
    {
      task: "Using only the standard library, write a dataclass `Marks` with student (str) and scores (list[int]). In __post_init__ reject any score outside 0-100 and compute an `average` attribute rounded to 2 decimals.",
      hint: "Use field(default_factory=list) and field(init=False) for average.",
      solution: `from dataclasses import dataclass, field

@dataclass
class Marks:
    student: str
    scores: list[int] = field(default_factory=list)
    average: float = field(init=False, default=0.0)

    def __post_init__(self):
        bad = [s for s in self.scores if not 0 <= s <= 100]
        if bad:
            raise ValueError(f"invalid scores: {bad}")
        if self.scores:
            self.average = round(sum(self.scores) / len(self.scores), 2)

print(Marks("Neha", [80, 91, 77]))
# Marks(student='Neha', scores=[80, 91, 77], average=82.67)
try:
    Marks("Raj", [50, 120])
except ValueError as e:
    print(e)   # invalid scores: [120]
`,
    },
  ],
  quiz: [
    {
      question: "In Pydantic v2, which method converts a model instance into a Python dict?",
      options: ["dict()", "to_dict()", "model_dump()", "serialize()"],
      answer: 2,
      explanation: "v2 uses model_dump(); dict() is the deprecated v1 name.",
    },
    {
      question: "What happens with `age: int` when the input is \"30\" in default (lax) mode?",
      options: ["ValidationError", "It is stored as the string \"30\"", "It is converted to the int 30", "It becomes None"],
      answer: 2,
      explanation: "Lax mode coerces numeric strings to int.",
    },
    {
      question: "Which package provides BaseSettings in Pydantic v2?",
      options: ["pydantic", "pydantic-settings", "python-dotenv", "pydantic-core"],
      answer: 1,
      explanation: "BaseSettings moved to the separate pydantic-settings package in v2.",
    },
    {
      question: "Which decorator should you use to check that end_date is after start_date?",
      options: ["@field_validator(\"end_date\") only", "@model_validator(mode=\"after\")", "@property", "@root"],
      answer: 1,
      explanation: "Cross-field rules belong in a model validator that sees the whole validated model.",
    },
    {
      question: "How do you make a model reject fields it does not declare?",
      options: ["ConfigDict(strict=True)", "ConfigDict(frozen=True)", "ConfigDict(extra=\"forbid\")", "Field(required=True)"],
      answer: 2,
      explanation: "extra=\"forbid\" raises an error for unknown fields; the default is to ignore them.",
    },
    {
      question: "What does a standard library @dataclass do with a value of the wrong type?",
      options: ["Raises TypeError", "Converts it automatically", "Nothing - it stores the value as given", "Raises ValidationError"],
      answer: 2,
      explanation: "Dataclasses do not check types at runtime; you must validate manually in __post_init__.",
    },
  ],
};
