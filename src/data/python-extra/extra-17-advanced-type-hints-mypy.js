export default {
  id: "extra-17-advanced-type-hints-mypy",
  title: "Advanced Type Hints: Generics, TypeVar, TypedDict, Literal, Callable and mypy",
  module: "Module 3: Advanced OOP & Internals",
  extraNo: 17,
  level: "Advanced",
  duration: "3 hours",
  summary: "Go beyond basic annotations. Learn Optional and union types with |, collection generics, TypeVar and generic functions/classes (including the Python 3.12 [T] syntax), TypedDict for JSON-like dicts, Literal and Final, Callable and ParamSpec for decorators, overload, TypeGuard, NewType and Annotated, and use mypy to catch bugs before running code.",
  objectives: [
    "Annotate functions with unions (X | None), collections and return types",
    "Write generic functions and classes with TypeVar and the 3.12 type parameter syntax",
    "Describe dictionary shapes with TypedDict and restrict values with Literal",
    "Type callbacks and decorators with Callable and ParamSpec",
    "Run mypy, read its errors and configure it for a project",
  ],
  theory: [
    {
      heading: "Why Type Hints and How Python Treats Them",
      content: `Type hints (PEP 484) document what types a function expects and returns: \`def total(prices: list[float]) -> float:\`. Python itself **does not enforce** them at runtime - they are stored in \`__annotations__\` and ignored by the interpreter. Their power comes from tools: **static type checkers** (mypy, pyright/Pylance) find bugs without running code, IDEs give better autocompletion and refactoring, and libraries like **pydantic**, **FastAPI** and **dataclasses** read annotations to validate data or generate schemas.

Type hints are gradual: you can add them file by file. Unannotated code is treated as \`Any\`, which turns checking off for those values.`,
      syntax: `name: str = "Asha"
scores: list[int] = [90, 85]
lookup: dict[str, float] = {"pen": 10.5}
point: tuple[int, int] = (3, 4)
values: tuple[int, ...] = (1, 2, 3)      # any length
def find(user_id: int) -> str | None: ...
`,
    },
    {
      heading: "Unions, Optional, Any and Built-in Generics",
      content: `Since Python 3.9 you can use built-in collections directly as generics (\`list[int]\`, \`dict[str, int]\`) instead of \`typing.List\`. Since 3.10, \`X | Y\` means 'X or Y' and \`X | None\` is the modern spelling of \`Optional[X]\`. **Optional does not mean the argument is optional** - it means the value may be None.

\`Any\` disables checking for a value (escape hatch). \`object\` accepts anything but only allows operations valid for all objects - safer than Any. For function parameters, prefer abstract types from \`collections.abc\` (\`Iterable[str]\`, \`Sequence[int]\`, \`Mapping[str, Any]\`) so callers can pass lists, tuples or generators; return concrete types.`,
      tip: "Accept the most general type you need (Iterable), return the most specific type you produce (list). This is the 'robustness principle' for type hints.",
    },
    {
      heading: "Generics: TypeVar and the 3.12 Syntax",
      content: `A **generic** function or class works with many types while keeping the relationship between them. \`def first(items: list[T]) -> T\` says: whatever element type goes in, the same type comes out - so \`first([1, 2])\` is \`int\` and \`first(['a'])\` is \`str\`. Before 3.12 you declare \`T = TypeVar('T')\`. TypeVars can be **bounded** (\`TypeVar('N', bound=Number)\` - any subtype of Number) or **constrained** (\`TypeVar('S', str, bytes)\` - exactly one of these).

Python 3.12 (PEP 695) adds a cleaner syntax: \`def first[T](items: list[T]) -> T:\` and \`class Box[T]:\` with no imports, plus \`type\` aliases: \`type Pair[T] = tuple[T, T]\`.`,
      syntax: `from typing import TypeVar, Generic
T = TypeVar("T")                      # pre-3.12 style
class Stack(Generic[T]):
    def push(self, item: T) -> None: ...
    def pop(self) -> T: ...

class Queue[T]:                       # 3.12 style
    def put(self, item: T) -> None: ...

def largest[N: (int, float)](a: N, b: N) -> N: ...   # constrained
type UserId = int                     # type alias (3.12)
`,
    },
    {
      heading: "TypedDict, Literal, Final, NewType and Annotated",
      content: `**TypedDict** describes dictionaries with fixed string keys and per-key types - perfect for JSON payloads. Keys are required by default; use \`total=False\` or \`NotRequired[...]\` for optional keys. At runtime it is still a normal dict.

**Literal** restricts a value to specific constants: \`Literal['asc', 'desc']\`. **Final** marks a name that must not be reassigned. **NewType** creates a distinct type for the checker (\`UserId = NewType('UserId', int)\`) so you cannot mix up user IDs and order IDs, at zero runtime cost. **Annotated[int, 'metadata']** attaches extra metadata used by libraries like pydantic and FastAPI (e.g. \`Annotated[int, Field(gt=0)]\`).`,
      syntax: `from typing import TypedDict, NotRequired, Literal, Final
class UserDTO(TypedDict):
    id: int
    name: str
    email: NotRequired[str]

Sort = Literal["asc", "desc"]
MAX_RETRIES: Final = 3
`,
    },
    {
      heading: "Callable, ParamSpec, overload and TypeGuard",
      content: `\`Callable[[int, str], bool]\` types a function that takes an int and a str and returns bool; \`Callable[..., T]\` accepts any arguments. For decorators that keep the wrapped function's signature, use **ParamSpec** (\`P = ParamSpec('P')\`, then \`Callable[P, R]\`), or in 3.12 \`def deco[**P, R](f: Callable[P, R]) -> Callable[P, R]\`.

\`@overload\` declares several signatures for one function when the return type depends on argument types (e.g. \`parse(str) -> int\`, \`parse(bytes) -> str\`). \`TypeGuard[X]\` (and \`TypeIs\` in 3.13) lets a boolean helper function narrow types for the checker. \`Self\` (3.11) types methods that return their own class, and \`Protocol\` provides structural interfaces.`,
    },
    {
      heading: "Using mypy in Practice",
      content: `Install with \`pip install mypy\` and run \`mypy src/\` (or \`mypy main.py\`). mypy reports errors with file, line, message and an error code in brackets. Useful helpers: \`reveal_type(expr)\` prints the inferred type during checking; \`# type: ignore[code]\` silences one line (use sparingly); \`typing.cast(T, value)\` tells the checker to trust you.

Configure it in pyproject.toml under \`[tool.mypy]\`: \`strict = true\` turns on all strict checks (no untyped defs, no implicit Any...), \`python_version\`, \`ignore_missing_imports\` for libraries without stubs. Install stub packages like \`types-requests\` for third-party libraries. Add mypy to pre-commit hooks and CI so type errors block merges.`,
      syntax: `# pyproject.toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_unused_ignores = true
`,
    },
  ],
  examples: [
    {
      title: "Type Hints Are Not Enforced at Runtime",
      scenario: "A developer assumes type hints will stop wrong values. Let us see what Python actually does, and how annotations are stored.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from typing import get_type_hints

def apply_discount(price: float, percent: int = 10) -> float:
    return price - price * percent / 100

print(apply_discount(500.0))
print(apply_discount(True, 50))
print(apply_discount.__annotations__)
print(get_type_hints(apply_discount))

try:
    apply_discount("500")
except TypeError as e:
    print("Runtime error only because the operation failed:", e)

scores: list[int] = []
scores.append("ninety")
print(scores)
`,
      python: {
        files: {
          "main.py": `from typing import get_type_hints

def apply_discount(price: float, percent: int = 10) -> float:
    return price - price * percent / 100

print(apply_discount(500.0))
print(apply_discount(True, 50))
print(apply_discount.__annotations__)
print(get_type_hints(apply_discount))

try:
    apply_discount("500")
except TypeError as e:
    print("Runtime error only because the operation failed:", e)

scores: list[int] = []
scores.append("ninety")
print(scores)
`,
        },
      },
      result: `450.0
0.5
{'price': <class 'float'>, 'percent': <class 'int'>, 'return': <class 'float'>}
{'price': <class 'float'>, 'percent': <class 'int'>, 'return': <class 'float'>}
Runtime error only because the operation failed: unsupported operand type(s) for /: 'str' and 'int'
['ninety']`,
      explanation: "Python accepted True (a bool) and appended a string to list[int] without complaint - hints are metadata stored in __annotations__. The string call fails only because '500' * 10 / 100 is invalid, not because of the hint. A static checker like mypy would flag these lines before running.",
    },
    {
      title: "Generic Functions and Classes (TypeVar and 3.12 Syntax)",
      scenario: "A utilities module needs type-safe helpers and a generic Stack that works for any element type.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from typing import TypeVar, Generic
from collections.abc import Callable, Iterable, Sequence

T = TypeVar("T")

def first(items: Sequence[T], default: T) -> T:
    return items[0] if items else default

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        return self._items.pop()
    def __len__(self) -> int:
        return len(self._items)

def chunk[E](items: Iterable[E], size: int) -> list[list[E]]:
    out: list[list[E]] = []
    for x in items:
        if not out or len(out[-1]) == size:
            out.append([])
        out[-1].append(x)
    return out

class Box[V]:
    def __init__(self, value: V) -> None:
        self.value = value
    def map[R](self, func: Callable[[V], R]) -> "Box[R]":
        return Box(func(self.value))

type Pair[X] = tuple[X, X]

def largest[N: (int, float)](a: N, b: N) -> N:
    return a if a >= b else b

s = Stack[int]()
s.push(10); s.push(20)
print(first([3, 4], 0), first([], "none"), s.pop(), len(s))
print(chunk(range(7), 3))
print(Box(" asha ").map(str.strip).map(str.title).value)
p: Pair[int] = (1, 2)
print(p, largest(3, 7), largest(2.5, 1.5))
print(Box.__type_params__, Pair.__value__)
`,
      python: {
        files: {
          "main.py": `from typing import TypeVar, Generic
from collections.abc import Callable, Iterable, Sequence

T = TypeVar("T")

def first(items: Sequence[T], default: T) -> T:
    return items[0] if items else default

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
    def pop(self) -> T:
        return self._items.pop()
    def __len__(self) -> int:
        return len(self._items)

def chunk[E](items: Iterable[E], size: int) -> list[list[E]]:
    out: list[list[E]] = []
    for x in items:
        if not out or len(out[-1]) == size:
            out.append([])
        out[-1].append(x)
    return out

class Box[V]:
    def __init__(self, value: V) -> None:
        self.value = value
    def map[R](self, func: Callable[[V], R]) -> "Box[R]":
        return Box(func(self.value))

type Pair[X] = tuple[X, X]

def largest[N: (int, float)](a: N, b: N) -> N:
    return a if a >= b else b

s = Stack[int]()
s.push(10); s.push(20)
print(first([3, 4], 0), first([], "none"), s.pop(), len(s))
print(chunk(range(7), 3))
print(Box(" asha ").map(str.strip).map(str.title).value)
p: Pair[int] = (1, 2)
print(p, largest(3, 7), largest(2.5, 1.5))
print(Box.__type_params__, Pair.__value__)
`,
        },
      },
      result: `3 none 20 1
[[0, 1, 2], [3, 4, 5], [6]]
Asha
(1, 2) 7 2.5
(V,) tuple[X, X]`,
      explanation: "T links input and output types: first(list[int]) returns int. Stack(Generic[T]) is the classic generic class; chunk[E] and Box[V] use the 3.12 syntax with no TypeVar import. `type Pair[X] = ...` creates a lazy generic alias. N: (int, float) is a constrained type parameter. Box.map changes the type from V to R.",
    },
    {
      title: "TypedDict, Literal, Final and NewType for API Data",
      scenario: "A backend handles user JSON and sorting options. Types document exactly which keys and values are allowed.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from typing import TypedDict, NotRequired, Literal, Final, NewType, Annotated, get_type_hints

class Address(TypedDict):
    city: str
    pin: str

class UserDTO(TypedDict):
    id: int
    name: str
    address: Address
    email: NotRequired[str]

SortOrder = Literal["asc", "desc"]
UserId = NewType("UserId", int)
MAX_PAGE_SIZE: Final = 100
Age = Annotated[int, "must be 0-120"]

def list_users(users: list[UserDTO], order: SortOrder = "asc", limit: int = 10) -> list[str]:
    limit = min(limit, MAX_PAGE_SIZE)
    names = sorted((u["name"] for u in users), reverse=(order == "desc"))
    return names[:limit]

def load_user(uid: UserId) -> str:
    return f"loading user {uid}"

users: list[UserDTO] = [
    {"id": 1, "name": "Ravi", "address": {"city": "Pune", "pin": "411001"}},
    {"id": 2, "name": "Asha", "address": {"city": "Delhi", "pin": "110001"}, "email": "a@x.in"},
]
print(list_users(users), list_users(users, "desc", 500))
print(type(users[0]).__name__, sorted(UserDTO.__required_keys__), sorted(UserDTO.__optional_keys__))
uid = UserId(42)
print(load_user(uid), type(uid).__name__)
print(get_type_hints(list_users)["order"])
print("Annotated metadata:", Age.__metadata__)
`,
      python: {
        files: {
          "main.py": `from typing import TypedDict, NotRequired, Literal, Final, NewType, Annotated, get_type_hints

class Address(TypedDict):
    city: str
    pin: str

class UserDTO(TypedDict):
    id: int
    name: str
    address: Address
    email: NotRequired[str]

SortOrder = Literal["asc", "desc"]
UserId = NewType("UserId", int)
MAX_PAGE_SIZE: Final = 100
Age = Annotated[int, "must be 0-120"]

def list_users(users: list[UserDTO], order: SortOrder = "asc", limit: int = 10) -> list[str]:
    limit = min(limit, MAX_PAGE_SIZE)
    names = sorted((u["name"] for u in users), reverse=(order == "desc"))
    return names[:limit]

def load_user(uid: UserId) -> str:
    return f"loading user {uid}"

users: list[UserDTO] = [
    {"id": 1, "name": "Ravi", "address": {"city": "Pune", "pin": "411001"}},
    {"id": 2, "name": "Asha", "address": {"city": "Delhi", "pin": "110001"}, "email": "a@x.in"},
]
print(list_users(users), list_users(users, "desc", 500))
print(type(users[0]).__name__, sorted(UserDTO.__required_keys__), sorted(UserDTO.__optional_keys__))
uid = UserId(42)
print(load_user(uid), type(uid).__name__)
print(get_type_hints(list_users)["order"])
print("Annotated metadata:", Age.__metadata__)
`,
        },
      },
      result: `['Asha', 'Ravi'] ['Ravi', 'Asha']
dict ['address', 'id', 'name'] ['email']
loading user 42 int
typing.Literal['asc', 'desc']
Annotated metadata: ('must be 0-120',)`,
      explanation: "TypedDict values are plain dicts at runtime, but the checker knows each key's type and which keys are optional. Literal limits order to 'asc'/'desc'. NewType makes UserId a distinct type for mypy while staying an int at runtime. Final prevents reassignment of MAX_PAGE_SIZE. Annotated carries metadata that frameworks read.",
    },
    {
      title: "Typing Callbacks and Decorators with Callable and ParamSpec",
      scenario: "A retry decorator should keep the exact signature of the decorated function so IDEs and mypy still check the arguments.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections.abc import Callable
from functools import wraps
from typing import ParamSpec, TypeVar, overload

P = ParamSpec("P")
R = TypeVar("R")

def logged(func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"calling {func.__name__}{args}")
        return func(*args, **kwargs)
    return wrapper

def timed[**Q, T](func: Callable[Q, T]) -> Callable[Q, T]:
    @wraps(func)
    def wrapper(*args: Q.args, **kwargs: Q.kwargs) -> T:
        return func(*args, **kwargs)
    return wrapper

@logged
@timed
def transfer(amount: float, to: str, *, note: str = "") -> bool:
    return amount > 0

def apply_all(values: list[int], op: Callable[[int], int]) -> list[int]:
    return [op(v) for v in values]

@overload
def parse(value: str) -> int: ...
@overload
def parse(value: bytes) -> str: ...
def parse(value: str | bytes) -> int | str:
    return int(value) if isinstance(value, str) else value.decode()

print(transfer(500.0, "Asha", note="rent"))
print(apply_all([1, 2, 3], lambda x: x * 10))
print(parse("42") + 1, parse(b"hi").upper())
print(transfer.__name__, transfer.__annotations__["return"])
`,
      python: {
        files: {
          "main.py": `from collections.abc import Callable
from functools import wraps
from typing import ParamSpec, TypeVar, overload

P = ParamSpec("P")
R = TypeVar("R")

def logged(func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"calling {func.__name__}{args}")
        return func(*args, **kwargs)
    return wrapper

def timed[**Q, T](func: Callable[Q, T]) -> Callable[Q, T]:
    @wraps(func)
    def wrapper(*args: Q.args, **kwargs: Q.kwargs) -> T:
        return func(*args, **kwargs)
    return wrapper

@logged
@timed
def transfer(amount: float, to: str, *, note: str = "") -> bool:
    return amount > 0

def apply_all(values: list[int], op: Callable[[int], int]) -> list[int]:
    return [op(v) for v in values]

@overload
def parse(value: str) -> int: ...
@overload
def parse(value: bytes) -> str: ...
def parse(value: str | bytes) -> int | str:
    return int(value) if isinstance(value, str) else value.decode()

print(transfer(500.0, "Asha", note="rent"))
print(apply_all([1, 2, 3], lambda x: x * 10))
print(parse("42") + 1, parse(b"hi").upper())
print(transfer.__name__, transfer.__annotations__["return"])
`,
        },
      },
      result: `calling transfer(500.0, 'Asha')
True
[10, 20, 30]
43 HI
transfer <class 'bool'>`,
      explanation: "ParamSpec P captures the parameter list of the decorated function and R its return type, so `transfer` keeps its signature (amount: float, to: str, *, note: str). The 3.12 syntax `[**Q, T]` does the same without imports. Callable[[int], int] types a callback. @overload tells the checker that parse(str) returns int and parse(bytes) returns str.",
    },
    {
      title: "Catching Bugs with mypy",
      scenario: "The same file runs partly at runtime, but mypy finds four kinds of bugs in seconds. Save as main.py and run `pip install mypy` then `mypy main.py`.",
      steps: [
        "Create a virtual environment and run: pip install mypy",
        "Save the code below as main.py",
        "Run: mypy main.py",
        "Read each error: file:line, message and [error-code], then fix the code and run mypy again",
      ],
      code: `from typing import Literal, TypedDict


class User(TypedDict):
    id: int
    name: str


def get_discount(tier: Literal["gold", "silver"]) -> float:
    return 0.2 if tier == "gold" else 0.1


def total(prices: list[float]) -> float:
    return sum(prices)


user: User = {"id": 1, "name": "Asha", "age": 30}
get_discount("platinum")
total(["10", "20"])
count: int = "five"
`,
      result: `main.py:17: error: Extra key "age" for TypedDict "User"  [typeddict-unknown-key]
main.py:18: error: Argument 1 to "get_discount" has incompatible type "Literal['platinum']"; expected "Literal['gold', 'silver']"  [arg-type]
main.py:19: error: List item 0 has incompatible type "str"; expected "float"  [list-item]
main.py:19: error: List item 1 has incompatible type "str"; expected "float"  [list-item]
main.py:20: error: Incompatible types in assignment (expression has type "str", variable has type "int")  [assignment]
Found 5 errors in 1 file (checked 1 source file)`,
      explanation: "mypy checks the code without running it. It finds an unknown TypedDict key, a value outside the Literal, strings passed where floats are expected, and a wrong variable type. Python would happily run lines 17, 18 and 20, and only line 19 would crash at runtime. Output shown is from mypy 2.x; wording can vary slightly between versions.",
    },
  ],
  interview: [
    {
      q: "Does Python enforce type hints at runtime?",
      a: "No. Annotations are stored in __annotations__ and ignored by the interpreter. Static checkers (mypy, pyright) and some libraries (pydantic, FastAPI, typeguard/beartype) use them to check or validate.",
      level: "Easy",
    },
    {
      q: "What is the difference between Optional[int] and an optional parameter?",
      a: "Optional[int] (or int | None) means the value can be an int or None. An optional parameter is one with a default value. `def f(x: int | None)` still requires an argument; `def f(x: int = 0)` is optional but not None-able.",
      level: "Medium",
    },
    {
      q: "What is a TypeVar and why use it instead of Any?",
      a: "A TypeVar is a placeholder type that links types across a signature: `def first(xs: list[T]) -> T` preserves the element type. Any loses the information and disables checking, so `first` returning Any would let `first([1]).upper()` pass silently.",
      level: "Medium",
    },
    {
      q: "What is the new generic syntax in Python 3.12?",
      a: "PEP 695 lets you declare type parameters inline: `def f[T](x: T) -> T`, `class Box[T]:`, bounds `[T: Number]`, constraints `[T: (int, str)]`, ParamSpec `[**P]`, TypeVarTuple `[*Ts]`, and the `type Alias[T] = ...` statement. No TypeVar imports are needed and scoping is clearer.",
      level: "Hard",
    },
    {
      q: "When would you use TypedDict instead of a dataclass?",
      a: "When the data really is a dict - JSON from an API, kwargs, or data passed to libraries expecting dicts. TypedDict adds static key/type checking with zero runtime cost. Use a dataclass (or pydantic model) when you want an object with methods, defaults and attribute access, or runtime validation (pydantic).",
      level: "Medium",
    },
    {
      q: "What does Literal do?",
      a: "Restricts a value to specific literal constants: `mode: Literal['r', 'w']`. The checker rejects any other value. It's useful for flags, status strings and modes, and works with overload to vary return types.",
      level: "Easy",
    },
    {
      q: "How do you type a decorator so it preserves the function signature?",
      a: "Use ParamSpec and TypeVar: `def deco(f: Callable[P, R]) -> Callable[P, R]` with `def wrapper(*args: P.args, **kwargs: P.kwargs) -> R`. In 3.12: `def deco[**P, R](f: Callable[P, R]) -> Callable[P, R]`. Plain Callable[..., Any] loses argument checking.",
      level: "Hard",
    },
    {
      q: "What is the difference between a bound and a constrained TypeVar?",
      a: "Bound: `TypeVar('T', bound=Base)` accepts Base or any subclass and preserves the exact subtype. Constrained: `TypeVar('T', int, str)` must be exactly one of the listed types (resolved to that type, not a subclass) and mixing them in one call is an error.",
      level: "Hard",
    },
    {
      q: "What is NewType and how is it different from a type alias?",
      a: "A type alias (`UserId = int` or `type UserId = int`) is just another name - interchangeable with int. NewType('UserId', int) creates a distinct type for the checker: you must wrap with UserId(5), and passing a plain int or an OrderId where UserId is expected is an error. At runtime it's just an int.",
      level: "Medium",
    },
    {
      q: "What does `strict = true` in mypy do?",
      a: "It enables a bundle of strict flags: disallow untyped/incomplete defs and calls, warn on returning Any, no implicit re-exports, strict equality, check untyped defs, etc. It gives the strongest guarantees and is recommended for new projects.",
      level: "Medium",
    },
    {
      q: "Why prefer Iterable/Sequence for parameters?",
      a: "They express only what the function needs (iteration or indexing), so callers can pass lists, tuples, sets, generators or custom classes. list[int] would reject a tuple. Return concrete types so callers know what they get.",
      level: "Medium",
    },
    {
      q: "What is covariance and why is list[int] not a list[float]?",
      a: "A generic is covariant if Box[Sub] can be used as Box[Base]. Mutable containers like list are invariant: if list[int] were accepted as list[float], a function could append 3.5 into your int list. Immutable Sequence[int] is covariant, so it is accepted where Sequence[float] is expected.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write a fully annotated function `average(values: Iterable[float]) -> float | None` that returns None for empty input. Test with a list, a tuple and an empty generator.",
      hint: "Convert to a list first, then check if it is empty.",
      solution: `from collections.abc import Iterable

def average(values: Iterable[float]) -> float | None:
    data = list(values)
    if not data:
        return None
    return sum(data) / len(data)

print(average([10, 20, 30]), average((1.5, 2.5)), average(x for x in []))
`,
    },
    {
      task: "Create a generic `Cache[K, V]` class (3.12 syntax) with get(key) -> V | None and set(key, value). Use it as Cache[str, int].",
      hint: "class Cache[K, V]: def __init__(self) -> None: self._data: dict[K, V] = {}",
      solution: `class Cache[K, V]:
    def __init__(self) -> None:
        self._data: dict[K, V] = {}

    def set(self, key: K, value: V) -> None:
        self._data[key] = value

    def get(self, key: K) -> V | None:
        return self._data.get(key)

c = Cache[str, int]()
c.set("visits", 10)
print(c.get("visits"), c.get("missing"))
`,
    },
    {
      task: "Define a TypedDict `Order` with order_id: int, items: list[str], status: Literal['new', 'paid', 'shipped'] and optional coupon. Write `summarize(order: Order) -> str`.",
      hint: "Use NotRequired[str] for coupon and order.get('coupon').",
      solution: `from typing import TypedDict, Literal, NotRequired

class Order(TypedDict):
    order_id: int
    items: list[str]
    status: Literal["new", "paid", "shipped"]
    coupon: NotRequired[str]

def summarize(order: Order) -> str:
    coupon = order.get("coupon", "none")
    return f"#{order['order_id']}: {len(order['items'])} items, {order['status']}, coupon={coupon}"

print(summarize({"order_id": 7, "items": ["pen", "book"], "status": "paid"}))
print(summarize({"order_id": 8, "items": ["bag"], "status": "new", "coupon": "SAVE10"}))
`,
    },
    {
      task: "Write a typed higher-order function `compose(f, g)` that returns a function computing g(f(x)), using type parameters A, B, C. Use it to compose len and a function that doubles an int.",
      hint: "def compose[A, B, C](f: Callable[[A], B], g: Callable[[B], C]) -> Callable[[A], C]:",
      solution: `from collections.abc import Callable

def compose[A, B, C](f: Callable[[A], B], g: Callable[[B], C]) -> Callable[[A], C]:
    def h(x: A) -> C:
        return g(f(x))
    return h

def double(n: int) -> int:
    return n * 2

length_doubled = compose(len, double)
print(length_doubled("python"))
`,
    },
  ],
  quiz: [
    {
      question: "What happens at runtime when you pass a str to a parameter annotated as int?",
      options: [
        "TypeError immediately",
        "Nothing special; hints are not enforced",
        "The str is converted to int",
        "A warning is printed",
      ],
      answer: 1,
      explanation: "Python ignores annotations at runtime; only static checkers or libraries use them.",
    },
    {
      question: "int | None is equivalent to...",
      options: [
        "Union[int]",
        "Optional[int]",
        "Any",
        "int with default None",
      ],
      answer: 1,
      explanation: "Optional[X] is shorthand for X | None.",
    },
    {
      question: "Which is the Python 3.12 way to declare a generic function?",
      options: [
        "def f<T>(x: T) -> T",
        "def f[T](x: T) -> T",
        "def f(x: T) -> T  # T auto",
        "generic def f(x)",
      ],
      answer: 1,
      explanation: "PEP 695 introduced square-bracket type parameters.",
    },
    {
      question: "TypedDict objects at runtime are...",
      options: [
        "Special immutable objects",
        "Plain dicts",
        "Dataclass instances",
        "Named tuples",
      ],
      answer: 1,
      explanation: "TypedDict only affects static checking; values are normal dicts.",
    },
    {
      question: "Which tool keeps a decorator's parameter types?",
      options: [
        "TypeVar only",
        "ParamSpec",
        "Literal",
        "Final",
      ],
      answer: 1,
      explanation: "ParamSpec captures the full parameter list of the wrapped callable.",
    },
    {
      question: "Why is list[int] not accepted where list[float] is expected?",
      options: [
        "Because int is not a number",
        "Because list is invariant (mutable)",
        "Because mypy has a bug",
        "It is accepted",
      ],
      answer: 1,
      explanation: "Mutable containers are invariant to prevent inserting wrong types.",
    },
  ],
};
