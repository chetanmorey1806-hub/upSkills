export default {
  lesson: 'day-33-dataclasses-enums',
  minutes: 30,
  intro: 'Model data with @dataclass (defaults, default_factory, __post_init__, frozen, order) and fixed choices with Enum.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `from dataclasses import dataclass, asdict
from enum import Enum

@dataclass(order=True)
class Item:
    price: int
    name: str = "item"

class Status(Enum):
    PENDING = 1
    SHIPPED = 2

a = Item(50, "pen")
print(a)
print(a == Item(50, "pen"), Item(30) < a)
print(asdict(a))
print(Status.SHIPPED.name, Status.SHIPPED.value, Status(1))`,
      expected: "Item(price=50, name='pen')\nTrue True\n{'price': 50, 'name': 'pen'}\nSHIPPED 2 Status.PENDING",
      explain: '`@dataclass` generates `__init__`, `__repr__` and `__eq__` from the annotated fields; `order=True` adds `<`, `>` comparing fields in order (price first). `asdict()` converts to a dict. An enum member has `.name` and `.value`, and `Status(1)` looks a member up by value.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Inside a dataclass, how do you give each object its **own** empty list as a default?',
      options: ['tags: list = []', 'tags: list = field(default_factory=list)', 'tags: list = None only', 'tags = list'],
      answer: 1,
      explain: '`field(default_factory=list)` calls `list()` for every new object. Writing `= []` is rejected by dataclasses with a ValueError (mutable default), because a single list would be shared by all objects.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Create a dataclass `Product` with fields `name: str`, `price: float`, `qty: int = 1` and `tags: list` (default: a new empty list). Add:\n- `__post_init__` that raises `ValueError` if `price < 0`\n- a method `total()` → price × qty',
      example: { title: 'dataclass with validation', code: 'from dataclasses import dataclass\n\n@dataclass\nclass Marks:\n    subject: str\n    score: int\n\n    def __post_init__(self):\n        if not 0 <= self.score <= 100:\n            raise ValueError("score must be 0-100")' },
      starter: `from dataclasses import dataclass, field

class Product:
    pass  # TODO
`,
      solution: `from dataclasses import dataclass, field

@dataclass
class Product:
    name: str
    price: float
    qty: int = 1
    tags: list = field(default_factory=list)

    def __post_init__(self):
        if self.price < 0:
            raise ValueError("price cannot be negative")

    def total(self):
        return self.price * self.qty
`,
      tests: [
        { call: 'repr(Product("Pen", 10, 3))', expect: "Product(name='Pen', price=10, qty=3, tags=[])" },
        { call: 'Product("Pen", 12.5, 2).total() == 25', expect: true, msg: 'Product("Pen", 12.5, 2).total() should be 25' },
        { call: '(lambda a, b: (a.tags.append("sale"), b.tags)[1])(Product("A", 1), Product("B", 2))', expect: [], msg: 'each product needs its own tags list' },
        { call: `exec("try:\\n    Product('Bad', -5)\\n    _r = 'no error'\\nexcept ValueError:\\n    _r = 'ValueError'") or _r`, expect: 'ValueError', msg: 'a negative price must raise ValueError in __post_init__' },
      ],
      explain: 'Fields without defaults must come before fields with defaults. `__post_init__` runs right after the generated `__init__`, the right place for validation. `default_factory=list` gives each object a fresh list.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Create an Enum `OrderStatus` with members `PENDING`, `PACKED`, `SHIPPED`, `DELIVERED` (values via `auto()`, in this order). Write `next_status(status)` that returns the next member, and `DELIVERED` stays `DELIVERED`.',
      example: { title: 'Enum with auto()', code: 'from enum import Enum, auto\n\nclass Size(Enum):\n    S = auto()   # 1\n    M = auto()   # 2\n\nprint(list(Size))   # members in definition order' },
      starter: `from enum import Enum, auto

class OrderStatus:
    pass  # TODO

def next_status(status):
    pass  # TODO
`,
      solution: `from enum import Enum, auto

class OrderStatus(Enum):
    PENDING = auto()
    PACKED = auto()
    SHIPPED = auto()
    DELIVERED = auto()

def next_status(status):
    members = list(OrderStatus)
    i = members.index(status)
    return members[min(i + 1, len(members) - 1)]
`,
      tests: [
        { call: '[s.name for s in OrderStatus]', expect: ['PENDING', 'PACKED', 'SHIPPED', 'DELIVERED'] },
        { call: 'OrderStatus.PENDING.value', expect: 1 },
        { call: 'next_status(OrderStatus.PENDING) is OrderStatus.PACKED', expect: true },
        { call: 'next_status(OrderStatus.DELIVERED) is OrderStatus.DELIVERED', expect: true },
      ],
      explain: 'Enums replace "magic strings" like "shiped" (typo!) with fixed members. `auto()` numbers them 1, 2, 3... and `list(OrderStatus)` keeps definition order. Compare members with `is` or `==`, not with their raw values.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Create a **frozen** dataclass `Location(city: str, pincode: str)`. Then write `move(loc, new_city)` that returns a **new** Location with the city changed (use `dataclasses.replace`), leaving the original untouched.',
      example: { title: 'frozen + replace', code: 'from dataclasses import dataclass, replace\n\n@dataclass(frozen=True)\nclass Point:\n    x: int\n    y: int\n\np2 = replace(Point(1, 2), y=5)   # Point(x=1, y=5)' },
      starter: `from dataclasses import dataclass, replace

class Location:
    pass  # TODO

def move(loc, new_city):
    loc.city = new_city   # TODO: not allowed on a frozen dataclass
    return loc
`,
      solution: `from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Location:
    city: str
    pincode: str

def move(loc, new_city):
    return replace(loc, city=new_city)
`,
      tests: [
        { call: '(lambda a: (lambda b: [a.city, b.city, b.pincode])(move(a, "Mumbai")))(Location("Pune", "411001"))', expect: ['Pune', 'Mumbai', '411001'] },
        { call: `exec("try:\\n    Location('Pune', '411001').city = 'Goa'\\n    _r = 'changed'\\nexcept Exception as e:\\n    _r = type(e).__name__") or _r`, expect: 'FrozenInstanceError', msg: 'Location must be frozen (assignment must raise FrozenInstanceError)' },
        { call: 'len({Location("Pune", "1"), Location("Pune", "1")})', expect: 1, msg: 'frozen dataclasses are hashable and equal ones collapse in a set' },
      ],
      explain: '`frozen=True` blocks attribute assignment (FrozenInstanceError) and makes objects hashable, so they can be dict keys or set items. `replace()` creates a modified copy, the standard way to "change" immutable data.',
    },
  ],
};
