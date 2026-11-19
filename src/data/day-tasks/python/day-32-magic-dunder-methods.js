export default {
  lesson: 'day-32-magic-dunder-methods',
  minutes: 35,
  intro: 'Make your classes feel built-in with __str__/__repr__, container methods, operator overloading and comparisons.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: '__str__ vs __repr__. What is printed?',
      code: `class Product:
    def __init__(self, name, price):
        self.name, self.price = name, price
    def __str__(self):
        return f"{self.name} - Rs.{self.price}"
    def __repr__(self):
        return f"Product({self.name!r}, {self.price})"

p = Product("Pen", 10)
print(p)
print([p])
print(f"{p!r}")`,
      expected: "Pen - Rs.10\n[Product('Pen', 10)]\nProduct('Pen', 10)",
      explain: '`print(obj)` and `str()` use `__str__` (friendly text for users). Containers like lists show their items with `__repr__` (unambiguous text for developers, ideally valid code). `!r` in an f-string forces repr.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Operator overloading. Create `Vector(x, y)` with:\n- `__add__` → `Vector(x1 + x2, y1 + y2)`\n- `__mul__` → multiply by a number: `Vector(3, 4) * 2` → `Vector(6, 8)`\n- `__eq__` → equal when x and y are equal\n- `__repr__` → `"Vector(3, 4)"`',
      example: { title: '__add__ returns a new object', code: 'class Money:\n    def __init__(self, amt):\n        self.amt = amt\n    def __add__(self, other):\n        return Money(self.amt + other.amt)' },
      starter: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    # TODO: __add__, __mul__, __eq__, __repr__
`,
      solution: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)

    def __eq__(self, other):
        return isinstance(other, Vector) and self.x == other.x and self.y == other.y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
`,
      tests: [
        { call: 'repr(Vector(1, 2) + Vector(3, 4))', expect: 'Vector(4, 6)' },
        { call: 'repr(Vector(3, 4) * 2)', expect: 'Vector(6, 8)' },
        { call: 'Vector(1, 2) == Vector(1, 2)', expect: true },
        { call: 'Vector(1, 2) == Vector(2, 1)', expect: false },
      ],
      explain: '`a + b` calls `a.__add__(b)`; return a **new** Vector instead of changing self. Without `__eq__`, `==` compares identity, so two equal-looking vectors would be "different".',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Container-like class. Create `Cart` that stores items in a list and supports:\n- `add(item)`\n- `len(cart)` → number of items (`__len__`)\n- `cart[0]` → first item (`__getitem__`)\n- `"pen" in cart` (`__contains__`)\n- `for item in cart:` (`__iter__`)',
      example: { title: 'delegating to an inner list', code: 'class Playlist:\n    def __init__(self):\n        self.songs = []\n    def __len__(self):\n        return len(self.songs)' },
      starter: `class Cart:
    def __init__(self):
        self.items = []

    def add(self, item):
        self.items.append(item)
    # TODO: __len__, __getitem__, __contains__, __iter__
`,
      solution: `class Cart:
    def __init__(self):
        self.items = []

    def add(self, item):
        self.items.append(item)

    def __len__(self):
        return len(self.items)

    def __getitem__(self, i):
        return self.items[i]

    def __contains__(self, item):
        return item in self.items

    def __iter__(self):
        return iter(self.items)
`,
      tests: [
        { call: '(lambda c: (c.add("pen"), c.add("book"), [len(c), c[0], c[-1], "pen" in c, "bag" in c, [x.upper() for x in c]])[2])(Cart())', expect: [2, 'pen', 'book', true, false, ['PEN', 'BOOK']] },
        { call: 'len(Cart())', expect: 0 },
      ],
      explain: 'Python’s built-ins call these dunders for you: `len(c)` → `c.__len__()`, `c[0]` → `c.__getitem__(0)`, `in` → `__contains__`, `for` → `__iter__`. Delegating to the inner list keeps each method one line.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Comparisons with `functools.total_ordering`. Create `Student(name, marks)` with `__eq__` and `__lt__` based on **marks** only, and decorate the class with `@total_ordering` so `>`, `<=`, `>=` work too. Also add `__hash__` consistent with `__eq__` (hash of marks) so students can go in a set.',
      example: { title: 'total_ordering', code: 'from functools import total_ordering\n\n@total_ordering\nclass Money:\n    def __init__(self, v): self.v = v\n    def __eq__(self, o): return self.v == o.v\n    def __lt__(self, o): return self.v < o.v' },
      starter: `from functools import total_ordering

class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
    # TODO
`,
      solution: `from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def __eq__(self, other):
        return self.marks == other.marks

    def __lt__(self, other):
        return self.marks < other.marks

    def __hash__(self):
        return hash(self.marks)
`,
      tests: [
        { call: 'Student("Asha", 91) > Student("Ravi", 78)', expect: true },
        { call: 'Student("Asha", 80) <= Student("Ravi", 80)', expect: true },
        { call: '[s.name for s in sorted([Student("A", 70), Student("B", 95), Student("C", 60)])]', expect: ['C', 'A', 'B'] },
        { call: 'len({Student("A", 70), Student("B", 70)})', expect: 1, msg: 'equal students must have the same hash (set keeps one)' },
      ],
      explain: '`@total_ordering` fills in the missing comparison methods from `__eq__` and one of `__lt__`/`__gt__`. Defining `__eq__` sets `__hash__` to None (unhashable) unless you define it; equal objects **must** have equal hashes.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Who normally calls a magic method like `__len__`?',
      options: [
        'You call obj.__len__() directly in normal code',
        'Python calls it for you when you use len(obj)',
        'It is called only once when the class is created',
        'The garbage collector',
      ],
      answer: 1,
      explain: 'Dunder methods are hooks: Python calls them when you use the related syntax or built-in (`len()`, `+`, `==`, `print`, `in`...). Calling `obj.__len__()` directly works but is not idiomatic.',
    },
  ],
};
