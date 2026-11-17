export default {
  id: "day-33-dataclasses-enums",
  title: "Dataclasses and Enums",
  module: "Module 5: Object-Oriented Programming",
  day: 33,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Write data-holding classes with almost no boilerplate using @dataclass, and replace magic strings and numbers with readable, safe named constants using Enum.",
  objectives: [
    "Create dataclasses and know which methods they generate automatically",
    "Use default values, field(default_factory=...), __post_init__, frozen and order options",
    "Convert dataclasses to dicts with asdict() and copy them with replace()",
    "Define Enum, IntEnum, StrEnum and use auto(), .name and .value",
    "Use enums in match-case and in dataclass fields",
  ],
  theory: [
    {
      heading: "Why Dataclasses?",
      content: "Many classes exist only to hold data (a Student, a Product, an Order). Writing __init__, __repr__ and __eq__ for every such class is boring and error-prone. The @dataclass decorator (from the dataclasses module, Python 3.7+) reads the type-annotated class attributes and generates these methods for you. Analogy: instead of filling a form by hand every time, you print a ready-made template.",
      syntax: `from dataclasses import dataclass

@dataclass
class Student:
    name: str
    marks: int = 0     # default value

s = Student("Asha", 90)
print(s)               # Student(name='Asha', marks=90)
`,
      points: [
        "Generated automatically: __init__, __repr__, __eq__",
        "Type hints are REQUIRED to make a field (but not enforced at runtime)",
        "Fields without defaults must come before fields with defaults",
      ],
    },
    {
      heading: "field(), default_factory and __post_init__",
      content: "Mutable defaults like [] or {} are not allowed directly (ValueError) because all objects would share the same list. Use field(default_factory=list). field() also lets you hide a field from repr (repr=False) or from __init__ (init=False). __post_init__ runs right after the generated __init__ and is used for validation or calculated fields.",
      syntax: `from dataclasses import dataclass, field

@dataclass
class Order:
    id: int
    items: list = field(default_factory=list)
    total: float = field(init=False, default=0.0)

    def __post_init__(self):
        if self.id <= 0:
            raise ValueError("id must be positive")
`,
    },
    {
      heading: "Dataclass Options: frozen, order, slots",
      content: "@dataclass accepts options. frozen=True makes objects immutable (assigning raises FrozenInstanceError) and hashable - good for dictionary keys and settings. order=True generates <, <=, >, >= comparing fields in order like tuples, so objects can be sorted. slots=True (3.10+) uses __slots__ to save memory. kw_only=True forces keyword arguments.",
      points: [
        "asdict(obj) converts to a dict (great for JSON)",
        "astuple(obj) converts to a tuple",
        "replace(obj, field=new) returns a modified copy (useful with frozen)",
        "fields(cls) lists field info",
      ],
    },
    {
      heading: "What is an Enum?",
      content: "An Enum (enumeration) is a set of named constants. Instead of writing status = 2 or status = 'shiped' (typo!), you write Status.SHIPPED. Enums make code readable, prevent invalid values, and editors can auto-complete them. Each member has a .name (the identifier) and a .value.",
      syntax: `from enum import Enum, auto

class Status(Enum):
    PENDING = 1
    SHIPPED = 2
    DELIVERED = auto()    # next value automatically (3)

print(Status.SHIPPED.name, Status.SHIPPED.value)   # SHIPPED 2
print(Status(2))                                    # Status.SHIPPED
print(Status["PENDING"])                            # Status.PENDING
`,
      points: [
        "Members are singletons: compare with is or ==",
        "Iterate: for s in Status",
        "Status(99) raises ValueError",
        "Enum members cannot be reassigned",
      ],
    },
    {
      heading: "IntEnum, StrEnum, Flag and unique",
      content: "A plain Enum member is NOT equal to its value (Status.SHIPPED == 2 is False). IntEnum members behave like ints and StrEnum (3.11+) members behave like strings, which helps with databases and JSON. Flag lets you combine members with | (like file permissions). The @unique decorator raises an error if two members share a value (otherwise the second becomes an alias).",
      tip: "Use Enums for fixed choices: order status, user roles, payment modes, days of week. Django's models.TextChoices is built on the same idea.",
    },
    {
      heading: "Common Mistakes",
      content: "Using a mutable default in a dataclass, putting a non-default field after a default field, expecting type hints to be validated, and comparing a plain Enum member directly with its raw value.",
      points: [
        "items: list = [] -> ValueError: mutable default",
        "name: str = 'x' then age: int -> TypeError: non-default argument follows default argument",
        "Dataclass does not check types: Student(name=5) works",
        "Use Status(value) to convert raw data into an Enum",
      ],
    },
  ],
  examples: [
    {
      title: "Dataclass Basics vs Normal Class",
      scenario: "Compare a hand-written Product class with the dataclass version.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from dataclasses import dataclass, asdict, astuple, replace

class ProductOld:
    def __init__(self, name, price, qty=1):
        self.name, self.price, self.qty = name, price, qty
    # no __repr__ or __eq__ -> ugly print, == compares identity

@dataclass
class Product:
    name: str
    price: float
    qty: int = 1

    def total(self):
        return self.price * self.qty

p1 = Product("Pen", 10.5, 4)
p2 = Product("Pen", 10.5, 4)
print(p1)
print(p1 == p2, ProductOld("Pen", 10.5) == ProductOld("Pen", 10.5))
print(p1.total())
print(asdict(p1))
print(astuple(p1))
p3 = replace(p1, qty=10)
print(p3, p1.qty)
`,
      python: {
        files: {
          "main.py": `from dataclasses import dataclass, asdict, astuple, replace

class ProductOld:
    def __init__(self, name, price, qty=1):
        self.name, self.price, self.qty = name, price, qty
    # no __repr__ or __eq__ -> ugly print, == compares identity

@dataclass
class Product:
    name: str
    price: float
    qty: int = 1

    def total(self):
        return self.price * self.qty

p1 = Product("Pen", 10.5, 4)
p2 = Product("Pen", 10.5, 4)
print(p1)
print(p1 == p2, ProductOld("Pen", 10.5) == ProductOld("Pen", 10.5))
print(p1.total())
print(asdict(p1))
print(astuple(p1))
p3 = replace(p1, qty=10)
print(p3, p1.qty)
`,
        },
      },
      result: `Product(name='Pen', price=10.5, qty=4)
True False
42.0
{'name': 'Pen', 'price': 10.5, 'qty': 4}
('Pen', 10.5, 4)
Product(name='Pen', price=10.5, qty=10) 4`,
      explanation: "@dataclass generated __init__, __repr__ and __eq__ from the annotated fields. Two dataclass objects with the same field values are equal, while the old class compares identity. asdict/astuple convert the object, and replace() creates a modified copy without changing the original.",
    },
    {
      title: "default_factory, __post_init__, frozen and order",
      scenario: "A library system needs members with their own book lists, validated IDs, immutable config, and sortable records.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from dataclasses import dataclass, field, FrozenInstanceError

@dataclass
class Member:
    member_id: int
    name: str
    books: list = field(default_factory=list)
    email: str = field(default="", repr=False)

    def __post_init__(self):
        if self.member_id <= 0:
            raise ValueError("member_id must be positive")
        self.name = self.name.title()

m1 = Member(1, "asha rao")
m2 = Member(2, "ravi kumar")
m1.books.append("Python 101")
print(m1)
print(m2)

try:
    Member(0, "x")
except ValueError as e:
    print("Error:", e)

@dataclass(frozen=True)
class Config:
    host: str = "localhost"
    port: int = 8000

cfg = Config()
try:
    cfg.port = 9000
except FrozenInstanceError as e:
    print("Frozen:", e)
print({cfg: "dev"}[Config()])

@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int

versions = [Version(1, 10, 0), Version(1, 2, 5), Version(0, 9, 9)]
print(sorted(versions)[0], max(versions))
`,
      python: {
        files: {
          "main.py": `from dataclasses import dataclass, field, FrozenInstanceError

@dataclass
class Member:
    member_id: int
    name: str
    books: list = field(default_factory=list)
    email: str = field(default="", repr=False)

    def __post_init__(self):
        if self.member_id <= 0:
            raise ValueError("member_id must be positive")
        self.name = self.name.title()

m1 = Member(1, "asha rao")
m2 = Member(2, "ravi kumar")
m1.books.append("Python 101")
print(m1)
print(m2)

try:
    Member(0, "x")
except ValueError as e:
    print("Error:", e)

@dataclass(frozen=True)
class Config:
    host: str = "localhost"
    port: int = 8000

cfg = Config()
try:
    cfg.port = 9000
except FrozenInstanceError as e:
    print("Frozen:", e)
print({cfg: "dev"}[Config()])

@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int

versions = [Version(1, 10, 0), Version(1, 2, 5), Version(0, 9, 9)]
print(sorted(versions)[0], max(versions))
`,
        },
      },
      result: `Member(member_id=1, name='Asha Rao', books=['Python 101'])
Member(member_id=2, name='Ravi Kumar', books=[])
Error: member_id must be positive
Frozen: cannot assign to field 'port'
dev
Version(major=0, minor=9, patch=9) Version(major=1, minor=10, patch=0)`,
      explanation: "default_factory=list gives each member a separate list (m2.books stays empty). repr=False hides email. __post_init__ validates and formats the name. frozen=True blocks assignment and makes Config hashable, so it can be a dict key. order=True compares fields like tuples (major, then minor, then patch).",
    },
    {
      title: "Enum Basics: Order Status",
      scenario: "An online store tracks order status safely instead of using raw strings.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from enum import Enum, auto

class Status(Enum):
    PENDING = auto()
    PAID = auto()
    SHIPPED = auto()
    DELIVERED = auto()
    CANCELLED = auto()

order_status = Status.PAID
print(order_status)
print(order_status.name, order_status.value)
print(Status(3))
print(Status["DELIVERED"])
print([s.name for s in Status])
print(order_status is Status.PAID, order_status == 2)

def next_step(status):
    match status:
        case Status.PENDING:
            return "Waiting for payment"
        case Status.PAID:
            return "Pack the items"
        case Status.SHIPPED:
            return "Out for delivery"
        case _:
            return "No action"

for s in (Status.PENDING, Status.PAID, Status.CANCELLED):
    print(f"{s.name:<10} -> {next_step(s)}")

try:
    Status(99)
except ValueError as e:
    print(e)
`,
      python: {
        files: {
          "main.py": `from enum import Enum, auto

class Status(Enum):
    PENDING = auto()
    PAID = auto()
    SHIPPED = auto()
    DELIVERED = auto()
    CANCELLED = auto()

order_status = Status.PAID
print(order_status)
print(order_status.name, order_status.value)
print(Status(3))
print(Status["DELIVERED"])
print([s.name for s in Status])
print(order_status is Status.PAID, order_status == 2)

def next_step(status):
    match status:
        case Status.PENDING:
            return "Waiting for payment"
        case Status.PAID:
            return "Pack the items"
        case Status.SHIPPED:
            return "Out for delivery"
        case _:
            return "No action"

for s in (Status.PENDING, Status.PAID, Status.CANCELLED):
    print(f"{s.name:<10} -> {next_step(s)}")

try:
    Status(99)
except ValueError as e:
    print(e)
`,
        },
      },
      result: `Status.PAID
PAID 2
Status.SHIPPED
Status.DELIVERED
['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
True False
PENDING    -> Waiting for payment
PAID       -> Pack the items
CANCELLED  -> No action
99 is not a valid Status`,
      explanation: "auto() numbers members 1, 2, 3... .name and .value give the label and number. Status(3) looks up by value, Status['DELIVERED'] by name. A plain Enum is not equal to its raw value, so order_status == 2 is False. Enums work neatly in match-case. Invalid values raise ValueError.",
    },
    {
      title: "IntEnum, StrEnum, Flag and Enum in a Dataclass",
      scenario: "A user-management module stores roles as strings for JSON, priorities as ints, and permissions as combinable flags.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from dataclasses import dataclass, field, asdict
from enum import IntEnum, StrEnum, Flag, auto
import json

class Priority(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

class Role(StrEnum):
    ADMIN = auto()      # value becomes 'admin'
    EDITOR = auto()
    VIEWER = auto()

class Perm(Flag):
    READ = auto()
    WRITE = auto()
    DELETE = auto()

print(Priority.HIGH > Priority.LOW, Priority.MEDIUM == 2, Priority.HIGH + 1)
print(Role.ADMIN, Role.ADMIN == "admin", Role("viewer").name)

editor_perm = Perm.READ | Perm.WRITE
print(Perm.WRITE in editor_perm, Perm.DELETE in editor_perm)

@dataclass
class User:
    name: str
    role: Role = Role.VIEWER
    tags: list = field(default_factory=list)

u = User("asha", Role.EDITOR, ["python"])
print(u)
print(json.dumps(asdict(u)))
`,
      python: {
        files: {
          "main.py": `from dataclasses import dataclass, field, asdict
from enum import IntEnum, StrEnum, Flag, auto
import json

class Priority(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

class Role(StrEnum):
    ADMIN = auto()      # value becomes 'admin'
    EDITOR = auto()
    VIEWER = auto()

class Perm(Flag):
    READ = auto()
    WRITE = auto()
    DELETE = auto()

print(Priority.HIGH > Priority.LOW, Priority.MEDIUM == 2, Priority.HIGH + 1)
print(Role.ADMIN, Role.ADMIN == "admin", Role("viewer").name)

editor_perm = Perm.READ | Perm.WRITE
print(Perm.WRITE in editor_perm, Perm.DELETE in editor_perm)

@dataclass
class User:
    name: str
    role: Role = Role.VIEWER
    tags: list = field(default_factory=list)

u = User("asha", Role.EDITOR, ["python"])
print(u)
print(json.dumps(asdict(u)))
`,
        },
      },
      result: `True True 4
admin True VIEWER
True False
User(name='asha', role=<Role.EDITOR: 'editor'>, tags=['python'])
{"name": "asha", "role": "editor", "tags": ["python"]}`,
      explanation: "IntEnum members act like ints, so they compare and add with numbers. StrEnum with auto() uses the lowercase member name as the value and compares equal to strings, which makes json.dumps work directly. Flag members combine with | and are tested with in. An Enum works perfectly as a dataclass field type.",
    },
  ],
  interview: [
    {
      q: "What is a dataclass?",
      a: "A class decorated with @dataclass (dataclasses module, Python 3.7+). Python automatically generates __init__, __repr__ and __eq__ from annotated class attributes, reducing boilerplate for data-holding classes.",
      level: "Easy",
    },
    {
      q: "Why use field(default_factory=list) instead of = []?",
      a: "A [] default would be shared by all instances, so dataclasses reject it with ValueError. default_factory calls list() for each new object, giving each its own list.",
      level: "Medium",
    },
    {
      q: "What does frozen=True do?",
      a: "Makes instances immutable: assigning to a field raises FrozenInstanceError. It also generates __hash__, so instances can be used as dict keys or set members.",
      level: "Medium",
    },
    {
      q: "What is __post_init__ used for?",
      a: "It runs right after the auto-generated __init__. Use it for validation, normalising values, or computing derived fields.",
      level: "Medium",
    },
    {
      q: "Does a dataclass enforce type hints?",
      a: "No. Type hints are only used to detect fields. Student(name=123) works. Use a library like pydantic or manual checks in __post_init__ for runtime validation.",
      level: "Medium",
    },
    {
      q: "What is an Enum and why use it?",
      a: "A set of named constant members (enum module). It replaces magic numbers/strings, improves readability, prevents invalid values and gives .name/.value for each member.",
      level: "Easy",
    },
    {
      q: "Difference between Enum and IntEnum?",
      a: "Plain Enum members are not equal to their values (Color.RED == 1 is False). IntEnum members are subclasses of int, so they compare and compute like integers.",
      level: "Medium",
    },
    {
      q: `What is the output?
from enum import Enum
class C(Enum):
    A = 1
    B = 1
print(C.B, C.B is C.A)`,
      a: "C.A True - B is an alias for A because they share the same value. Use @unique to forbid duplicates.",
      level: "Hard",
    },
    {
      q: `What is the output?
from dataclasses import dataclass
@dataclass
class P:
    x: int
    y: int = 0
print(P(1) == P(1, 0), P(1))`,
      a: "True P(x=1, y=0) - __eq__ compares field values and __repr__ shows all fields.",
      level: "Easy",
    },
    {
      q: "Dataclass vs namedtuple?",
      a: "namedtuple is immutable and tuple-based (indexable, light). Dataclass is a normal class: mutable by default, supports methods, defaults, default_factory, __post_init__, ordering options and inheritance more naturally.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Create a dataclass Book(title, author, price=0.0, tags=list). Make two books and print them.",
      hint: "Use field(default_factory=list).",
      solution: `from dataclasses import dataclass, field
@dataclass
class Book:
    title: str
    author: str
    price: float = 0.0
    tags: list = field(default_factory=list)
print(Book("Clean Code", "Robert Martin", 499.0, ["coding"]))
`,
    },
    {
      task: "Make a dataclass Rectangle with width and height and a computed area field set in __post_init__.",
      hint: "area: float = field(init=False)",
      solution: `from dataclasses import dataclass, field
@dataclass
class Rectangle:
    w: float
    h: float
    area: float = field(init=False)
    def __post_init__(self):
        self.area = self.w * self.h
print(Rectangle(3, 4))   # Rectangle(w=3, h=4, area=12)
`,
    },
    {
      task: "Create an Enum Weekday (MON..SUN) and a function is_weekend(day).",
      hint: "Compare with a set of members.",
      solution: `from enum import Enum
class Weekday(Enum):
    MON = 1; TUE = 2; WED = 3; THU = 4; FRI = 5; SAT = 6; SUN = 7
def is_weekend(d):
    return d in {Weekday.SAT, Weekday.SUN}
print(is_weekend(Weekday.SUN), is_weekend(Weekday(2)))   # True False
`,
    },
    {
      task: "Sort a list of Employee dataclasses by salary using order=True (salary as the first field).",
      hint: "Field order decides comparison order.",
      solution: `from dataclasses import dataclass
@dataclass(order=True)
class Emp:
    salary: int
    name: str
emps = [Emp(50000, "A"), Emp(30000, "B"), Emp(70000, "C")]
print([e.name for e in sorted(emps)])   # ['B', 'A', 'C']
`,
    },
    {
      task: "Convert a list of dataclass objects into JSON text.",
      hint: "json.dumps([asdict(o) for o in items])",
      solution: `import json
from dataclasses import dataclass, asdict
@dataclass
class Item:
    name: str
    qty: int
print(json.dumps([asdict(i) for i in [Item("a", 1), Item("b", 2)]]))
`,
    },
  ],
  quiz: [
    {
      question: "Which methods does @dataclass generate by default?",
      options: [
        "__init__, __repr__, __eq__",
        "__init__ only",
        "__str__ and __hash__",
        "__lt__ and __gt__",
      ],
      answer: 0,
      explanation: "By default: __init__, __repr__ and __eq__.",
    },
    {
      question: "How do you give each dataclass instance its own empty list?",
      options: [
        "items: list = []",
        "items: list = list",
        "items: list = field(default_factory=list)",
        "items = None",
      ],
      answer: 2,
      explanation: "default_factory creates a new list per instance.",
    },
    {
      question: "Assigning to a field of a frozen dataclass raises:",
      options: [
        "AttributeError only",
        "TypeError",
        "ValueError",
        "FrozenInstanceError",
      ],
      answer: 3,
      explanation: "dataclasses.FrozenInstanceError (a subclass of AttributeError).",
    },
    {
      question: "For class Color(Enum): RED = 1, what is Color(1)?",
      options: [
        "1",
        "Color.RED",
        "'RED'",
        "Error",
      ],
      answer: 1,
      explanation: "Calling the Enum with a value looks up the member.",
    },
    {
      question: "Which enum type compares equal to plain strings?",
      options: [
        "Flag",
        "IntEnum",
        "StrEnum",
        "Enum",
      ],
      answer: 2,
      explanation: "StrEnum members are str subclasses.",
    },
  ],
};
