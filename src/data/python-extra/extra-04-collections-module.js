export default {
  id: "extra-04-collections-module",
  title: "collections: Counter, defaultdict, deque, namedtuple, OrderedDict, ChainMap",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 4,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "The collections module gives specialised container types that solve common problems with less code and better performance: counting with Counter, grouping with defaultdict, fast queues with deque, lightweight records with namedtuple, ordered operations with OrderedDict and layered lookups with ChainMap.",
  objectives: [
    "Count items and find the most common ones with Counter",
    "Group data without KeyError using defaultdict",
    "Build fast queues, stacks and sliding windows with deque",
    "Create readable immutable records with namedtuple",
    "Use OrderedDict for LRU-style ordering and ChainMap for layered configuration",
  ],
  theory: [
    {
      heading: "Counter: Counting Made Easy",
      content: `\`Counter\` is a dict subclass for counting hashable objects. Pass any iterable and it counts each element: \`Counter("banana")\` gives \`Counter({'a': 3, 'n': 2, 'b': 1})\`. Missing keys return 0 instead of raising KeyError.

Useful methods: \`most_common(n)\` returns the n most frequent items, \`update()\` adds counts, \`subtract()\` removes counts, \`total()\` (3.10+) sums all counts, and \`elements()\` repeats each item by its count. Counters support arithmetic: \`+\` adds, \`-\` subtracts (dropping zero/negative results), \`&\` takes the minimum, \`|\` takes the maximum.`,
      syntax: `from collections import Counter
c = Counter(["pen", "book", "pen"])
c["pen"]            # 2
c["laptop"]         # 0  (no KeyError)
c.most_common(1)    # [('pen', 2)]
`,
    },
    {
      heading: "defaultdict: Dicts with Automatic Defaults",
      content: `\`defaultdict(factory)\` works like a dict, but when you access a missing key it calls \`factory()\` to create a default value, stores it, and returns it. Common factories: \`list\` (grouping), \`int\` (counting), \`set\` (unique grouping), or a lambda for custom defaults.

This removes the \`if key not in d: d[key] = []\` boilerplate. Note: only \`d[key]\` triggers the factory - \`d.get(key)\` and \`key in d\` do not create entries.`,
      syntax: `from collections import defaultdict
by_dept = defaultdict(list)
by_dept["IT"].append("Asha")    # no KeyError, list created automatically
`,
      tip: "Be careful: simply reading `d[missing]` inserts the key. If you only want to check, use `in` or `.get()`.",
    },
    {
      heading: "deque: Double-ended Queue",
      content: `\`deque\` (pronounced 'deck') is a list-like container optimised for adding and removing at **both ends** in O(1) time. A normal list's \`pop(0)\` and \`insert(0, x)\` are O(n) because all other elements shift. Use deque for queues (BFS, task queues), stacks, and sliding windows.

With \`maxlen\`, the deque has a fixed size and automatically discards items from the opposite end when full - perfect for 'last N items' (recent logs, moving averages). \`rotate(n)\` rotates items right (negative n rotates left). Indexing the middle is O(n), so deque is not a replacement for list when you need random access.`,
      points: [
        "append / appendleft - add at right / left",
        "pop / popleft - remove from right / left",
        "extend / extendleft, rotate, clear, maxlen",
        "`collections.deque` is thread-safe for appends and pops from either end",
      ],
    },
    {
      heading: "namedtuple: Tuples with Field Names",
      content: `\`namedtuple('Point', ['x', 'y'])\` creates a tuple subclass whose items can be accessed by name (\`p.x\`) and by index (\`p[0]\`). It is immutable, memory-light (no per-instance \`__dict__\`), and prints nicely. Useful helpers: \`_asdict()\`, \`_replace(**changes)\` (returns a new tuple), \`_fields\`, and \`_make(iterable)\`.

The modern typed alternative is \`typing.NamedTuple\` with class syntax and type hints. For mutable records with more features, use \`@dataclass\`.`,
      syntax: `from collections import namedtuple
Employee = namedtuple("Employee", ["name", "dept", "salary"], defaults=[30000])
e = Employee("Asha", "IT")
e.salary                     # 30000
e._replace(salary=50000)     # new Employee
`,
    },
    {
      heading: "OrderedDict: When Order Operations Matter",
      content: "Since Python 3.7, normal dicts keep insertion order, so OrderedDict is needed less often. It still has extra features: `move_to_end(key, last=True)` moves a key to either end, `popitem(last=False)` removes the FIRST item (FIFO), and equality checks **consider order** (`OrderedDict(a=1, b=2) != OrderedDict(b=2, a=1)`, while normal dicts compare equal). These make it ideal for building an LRU (least recently used) cache.",
    },
    {
      heading: "ChainMap: Layered Lookups",
      content: `\`ChainMap(dict1, dict2, ...)\` groups several dicts into one view. Lookups search each dict in order and return the first hit. Writes and deletes affect **only the first** mapping. Nothing is copied, so changes in the underlying dicts are visible immediately.

Typical use: configuration priority (command-line args > environment > defaults), or variable scopes (local > global > builtins). \`new_child()\` adds a new layer in front, \`parents\` skips the first layer.`,
      syntax: `from collections import ChainMap
defaults = {"debug": False, "port": 8000}
env = {"port": 9000}
cli = {"debug": True}
settings = ChainMap(cli, env, defaults)
settings["port"]    # 9000 (from env)
settings["debug"]   # True (from cli)
`,
    },
  ],
  examples: [
    {
      title: "Word Frequency and Top Products with Counter",
      scenario: "An e-commerce analyst wants the most frequently ordered products and the most common words in customer reviews.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import Counter

orders = ["pen", "book", "pen", "bag", "pen", "book", "lamp"]
c = Counter(orders)
print(c)
print("Top 2:", c.most_common(2))
print("Laptops ordered:", c["laptop"])
print("Total items:", c.total())

c.update(["lamp", "lamp"])
c.subtract({"pen": 1})
print("After update:", c.most_common())

review = "good product good price fast delivery good"
words = Counter(review.split())
print(words.most_common(2))

week1 = Counter(pen=5, book=2)
week2 = Counter(pen=3, bag=4)
print("Sum:", week1 + week2)
print("Diff:", week1 - week2)
print("Min:", week1 & week2)
print(sorted(Counter("aabbbc").elements()))
`,
      python: {
        files: {
          "main.py": `from collections import Counter

orders = ["pen", "book", "pen", "bag", "pen", "book", "lamp"]
c = Counter(orders)
print(c)
print("Top 2:", c.most_common(2))
print("Laptops ordered:", c["laptop"])
print("Total items:", c.total())

c.update(["lamp", "lamp"])
c.subtract({"pen": 1})
print("After update:", c.most_common())

review = "good product good price fast delivery good"
words = Counter(review.split())
print(words.most_common(2))

week1 = Counter(pen=5, book=2)
week2 = Counter(pen=3, bag=4)
print("Sum:", week1 + week2)
print("Diff:", week1 - week2)
print("Min:", week1 & week2)
print(sorted(Counter("aabbbc").elements()))
`,
        },
      },
      result: `Counter({'pen': 3, 'book': 2, 'bag': 1, 'lamp': 1})
Top 2: [('pen', 3), ('book', 2)]
Laptops ordered: 0
Total items: 7
After update: [('lamp', 3), ('pen', 2), ('book', 2), ('bag', 1)]
[('good', 3), ('product', 1)]
Sum: Counter({'pen': 8, 'bag': 4, 'book': 2})
Diff: Counter({'pen': 2, 'book': 2})
Min: Counter({'pen': 3})
['a', 'a', 'b', 'b', 'b', 'c']`,
      explanation: "Counter counts each element. most_common sorts by count (ties keep first-seen order). Missing keys return 0. update/subtract modify counts. Arithmetic combines counters; subtraction drops non-positive counts.",
    },
    {
      title: "Grouping Employees with defaultdict",
      scenario: "HR has a list of employees and wants to group names by department, count by city and collect unique skills per department.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import defaultdict

employees = [
    ("Asha", "IT", "Pune", "python"),
    ("Ravi", "HR", "Mumbai", "excel"),
    ("John", "IT", "Pune", "sql"),
    ("Meena", "IT", "Delhi", "python"),
    ("Kiran", "HR", "Pune", "excel"),
]

by_dept = defaultdict(list)
city_count = defaultdict(int)
skills = defaultdict(set)

for name, dept, city, skill in employees:
    by_dept[dept].append(name)
    city_count[city] += 1
    skills[dept].add(skill)

print(dict(by_dept))
print(dict(city_count))
print({d: sorted(s) for d, s in skills.items()})

print("Finance" in by_dept)
print(by_dept["Finance"])
print("Finance" in by_dept)
`,
      python: {
        files: {
          "main.py": `from collections import defaultdict

employees = [
    ("Asha", "IT", "Pune", "python"),
    ("Ravi", "HR", "Mumbai", "excel"),
    ("John", "IT", "Pune", "sql"),
    ("Meena", "IT", "Delhi", "python"),
    ("Kiran", "HR", "Pune", "excel"),
]

by_dept = defaultdict(list)
city_count = defaultdict(int)
skills = defaultdict(set)

for name, dept, city, skill in employees:
    by_dept[dept].append(name)
    city_count[city] += 1
    skills[dept].add(skill)

print(dict(by_dept))
print(dict(city_count))
print({d: sorted(s) for d, s in skills.items()})

print("Finance" in by_dept)
print(by_dept["Finance"])
print("Finance" in by_dept)
`,
        },
      },
      result: `{'IT': ['Asha', 'John', 'Meena'], 'HR': ['Ravi', 'Kiran']}
{'Pune': 3, 'Mumbai': 1, 'Delhi': 1}
{'IT': ['python', 'sql'], 'HR': ['excel']}
False
[]
True`,
      explanation: "Each defaultdict creates the right empty value on first access: list() for grouping, int() = 0 for counting, set() for unique values. The last three lines show the gotcha: reading a missing key with [] inserts it.",
    },
    {
      title: "Queues and Sliding Windows with deque",
      scenario: "A support system processes tickets first-in-first-out, keeps only the last 3 log lines, and calculates a moving average of response times.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import deque

tickets = deque(["T1", "T2"])
tickets.append("T3")
tickets.appendleft("URGENT")
while tickets:
    print("Processing", tickets.popleft())

recent = deque(maxlen=3)
for line in ["start", "login", "view", "buy", "logout"]:
    recent.append(line)
print("Last 3 logs:", list(recent))

times = [120, 80, 100, 140, 60, 90]
window = deque(maxlen=3)
for t in times:
    window.append(t)
    if len(window) == 3:
        print(f"window={list(window)} avg={sum(window) / 3:.1f}")

d = deque([1, 2, 3, 4, 5])
d.rotate(2)
print("rotate(2):", d)
d.rotate(-3)
print("rotate(-3):", d)
`,
      python: {
        files: {
          "main.py": `from collections import deque

tickets = deque(["T1", "T2"])
tickets.append("T3")
tickets.appendleft("URGENT")
while tickets:
    print("Processing", tickets.popleft())

recent = deque(maxlen=3)
for line in ["start", "login", "view", "buy", "logout"]:
    recent.append(line)
print("Last 3 logs:", list(recent))

times = [120, 80, 100, 140, 60, 90]
window = deque(maxlen=3)
for t in times:
    window.append(t)
    if len(window) == 3:
        print(f"window={list(window)} avg={sum(window) / 3:.1f}")

d = deque([1, 2, 3, 4, 5])
d.rotate(2)
print("rotate(2):", d)
d.rotate(-3)
print("rotate(-3):", d)
`,
        },
      },
      result: `Processing URGENT
Processing T1
Processing T2
Processing T3
Last 3 logs: ['view', 'buy', 'logout']
window=[120, 80, 100] avg=100.0
window=[80, 100, 140] avg=106.7
window=[100, 140, 60] avg=100.0
window=[140, 60, 90] avg=96.7
rotate(2): deque([4, 5, 1, 2, 3])
rotate(-3): deque([2, 3, 4, 5, 1])`,
      explanation: "popleft gives O(1) FIFO processing. maxlen=3 auto-drops the oldest item. A fixed-size deque is a natural sliding window. rotate shifts items around the ends.",
    },
    {
      title: "Records with namedtuple and typing.NamedTuple",
      scenario: "A CSV import should produce readable, immutable records instead of plain tuples.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import namedtuple
from typing import NamedTuple

Product = namedtuple("Product", "sku name price", defaults=[0.0])
rows = [("P1", "Pen", "10.5"), ("P2", "Book", "250")]
products = [Product._make((sku, name, float(price))) for sku, name, price in rows]
for p in products:
    print(p.name, p.price, p[0])

p = products[0]
print(p)
print(p._asdict())
print(p._replace(price=12.0))
print(Product._fields)
print(Product("P3", "Bag"))

class Point(NamedTuple):
    x: float
    y: float = 0.0

    def distance(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

pt = Point(3, 4)
print(pt, pt.distance())
x, y = pt
print(x, y)
try:
    pt.x = 10
except AttributeError as e:
    print("Error:", e)
`,
      python: {
        files: {
          "main.py": `from collections import namedtuple
from typing import NamedTuple

Product = namedtuple("Product", "sku name price", defaults=[0.0])
rows = [("P1", "Pen", "10.5"), ("P2", "Book", "250")]
products = [Product._make((sku, name, float(price))) for sku, name, price in rows]
for p in products:
    print(p.name, p.price, p[0])

p = products[0]
print(p)
print(p._asdict())
print(p._replace(price=12.0))
print(Product._fields)
print(Product("P3", "Bag"))

class Point(NamedTuple):
    x: float
    y: float = 0.0

    def distance(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

pt = Point(3, 4)
print(pt, pt.distance())
x, y = pt
print(x, y)
try:
    pt.x = 10
except AttributeError as e:
    print("Error:", e)
`,
        },
      },
      result: `Pen 10.5 P1
Book 250.0 P2
Product(sku='P1', name='Pen', price=10.5)
{'sku': 'P1', 'name': 'Pen', 'price': 10.5}
Product(sku='P1', name='Pen', price=12.0)
('sku', 'name', 'price')
Product(sku='P3', name='Bag', price=0.0)
Point(x=3, y=4) 5.0
3 4
Error: can't set attribute`,
      explanation: "namedtuple gives named access plus tuple behaviour (indexing, unpacking). `_replace` returns a new record because tuples are immutable. typing.NamedTuple adds type hints, defaults and methods with class syntax.",
    },
    {
      title: "LRU Cache with OrderedDict and Config with ChainMap",
      scenario: "Build a tiny LRU cache that keeps 2 items, and resolve settings from command-line, environment and defaults.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import OrderedDict, ChainMap

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return None
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            old, _ = self.data.popitem(last=False)
            print("evicted", old)

cache = LRUCache(2)
cache.put("a", 1)
cache.put("b", 2)
cache.get("a")
cache.put("c", 3)
print(list(cache.data.items()))

print(OrderedDict(a=1, b=2) == OrderedDict(b=2, a=1), dict(a=1, b=2) == dict(b=2, a=1))

defaults = {"host": "localhost", "port": 8000, "debug": False}
env = {"port": 9000}
cli = {"debug": True}
settings = ChainMap(cli, env, defaults)
print(settings["host"], settings["port"], settings["debug"])
settings["port"] = 7000
print(cli, env)
print(dict(settings))
`,
      python: {
        files: {
          "main.py": `from collections import OrderedDict, ChainMap

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return None
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            old, _ = self.data.popitem(last=False)
            print("evicted", old)

cache = LRUCache(2)
cache.put("a", 1)
cache.put("b", 2)
cache.get("a")
cache.put("c", 3)
print(list(cache.data.items()))

print(OrderedDict(a=1, b=2) == OrderedDict(b=2, a=1), dict(a=1, b=2) == dict(b=2, a=1))

defaults = {"host": "localhost", "port": 8000, "debug": False}
env = {"port": 9000}
cli = {"debug": True}
settings = ChainMap(cli, env, defaults)
print(settings["host"], settings["port"], settings["debug"])
settings["port"] = 7000
print(cli, env)
print(dict(settings))
`,
        },
      },
      result: `evicted b
[('a', 1), ('c', 3)]
False True
localhost 9000 True
{'debug': True, 'port': 7000} {'port': 9000}
{'host': 'localhost', 'port': 7000, 'debug': True}`,
      explanation: "move_to_end marks a key as recently used and popitem(last=False) evicts the oldest. OrderedDict equality considers order. ChainMap searches cli, then env, then defaults; writes go to the first map (cli).",
    },
  ],
  interview: [
    {
      q: "What is Counter and how do you get the top 3 items?",
      a: "Counter is a dict subclass from collections that counts hashable items. `Counter(iterable).most_common(3)` returns a list of (item, count) tuples sorted by count, highest first.",
      level: "Easy",
    },
    {
      q: "What is the difference between dict.get(), dict.setdefault() and defaultdict?",
      a: "`get(key, default)` returns a default without inserting. `setdefault(key, default)` returns the value and inserts the default if missing. `defaultdict(factory)` automatically creates and inserts `factory()` whenever a missing key is accessed with `[]`, making grouping/counting code shortest.",
      level: "Medium",
    },
    {
      q: "Why is deque better than list for a queue?",
      a: "list.pop(0) and list.insert(0, x) are O(n) because all elements shift. deque.popleft() and appendleft() are O(1) because deque is implemented as a doubly-linked list of fixed-size blocks. Use deque for FIFO queues and BFS.",
      level: "Medium",
    },
    {
      q: "What does deque(maxlen=n) do?",
      a: "It creates a bounded deque. When it is full and you append, an item from the opposite end is discarded automatically. It is ideal for keeping the last N items or a sliding window.",
      level: "Easy",
    },
    {
      q: "namedtuple vs dataclass - when to use which?",
      a: "namedtuple is immutable, tuple-compatible (indexing, unpacking), light and hashable - good for small fixed records and return values. dataclass is a normal class: mutable by default (frozen=True optional), supports defaults, default_factory, methods, inheritance, ordering and post-init validation. Prefer dataclass for domain models, namedtuple when tuple behaviour is needed.",
      level: "Medium",
    },
    {
      q: "Do we still need OrderedDict now that dicts keep insertion order?",
      a: "Rarely, but yes for: `move_to_end()`, `popitem(last=False)` for FIFO removal, order-sensitive equality, and clear intent. It is the classic building block for an LRU cache. For plain ordered storage a normal dict is enough.",
      level: "Medium",
    },
    {
      q: "What is ChainMap used for?",
      a: "It groups multiple mappings into a single view that searches them in order. Typical use is layered configuration (CLI > env > defaults) or nested scopes. Writes, updates and deletes only affect the first mapping, and no data is copied.",
      level: "Medium",
    },
    {
      q: "What happens when you subtract Counters with `-`?",
      a: "Counts are subtracted and any result that is zero or negative is removed. If you want to keep negative counts, use the `subtract()` method instead, which modifies in place and keeps them.",
      level: "Hard",
    },
    {
      q: "Does accessing a missing key with defaultdict.get() create it?",
      a: "No. Only `__getitem__` (`d[key]`) calls `__missing__`, which uses the default factory and inserts the key. `get()`, `in` and `pop()` behave like a normal dict.",
      level: "Hard",
    },
    {
      q: "How would you implement an LRU cache?",
      a: "Use an OrderedDict: on get, `move_to_end(key)`; on put, set the value, move it to the end and if size exceeds capacity, `popitem(last=False)` to remove the least recently used. In real code, `functools.lru_cache` already does this for function results.",
      level: "Hard",
    },
    {
      q: "How can you find the most common character in a string in one line?",
      a: "`Counter(text).most_common(1)[0][0]`. most_common(1) returns [(char, count)], so [0][0] picks the character.",
      level: "Easy",
    },
    {
      q: "Is namedtuple hashable and can it be used as a dict key?",
      a: "Yes, if all its fields are hashable, because it is a tuple subclass. That makes it handy as a composite key, e.g. `Point(1, 2)` as a key in a grid dictionary.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Given a sentence, use Counter to print the 3 most common words (case-insensitive) and how many times 'python' appears.",
      hint: "Counter(text.lower().split()).most_common(3)",
      solution: `from collections import Counter

text = "Python is fun and python is powerful and Python is popular"
c = Counter(text.lower().split())
print(c.most_common(3))
print("python:", c["python"])
`,
    },
    {
      task: "Given sales records [('Pune', 500), ('Delhi', 300), ('Pune', 200), ('Mumbai', 700), ('Delhi', 100)], use defaultdict to compute total sales per city and print them sorted by total descending.",
      hint: "totals = defaultdict(int); totals[city] += amount",
      solution: `from collections import defaultdict

sales = [("Pune", 500), ("Delhi", 300), ("Pune", 200), ("Mumbai", 700), ("Delhi", 100)]
totals = defaultdict(int)
for city, amount in sales:
    totals[city] += amount
for city, total in sorted(totals.items(), key=lambda kv: kv[1], reverse=True):
    print(city, total)
`,
    },
    {
      task: "Write `is_palindrome(s)` using a deque: keep removing characters from both ends and compare. Ignore spaces and case. Test with 'Never odd or even' and 'Python'.",
      hint: "d = deque(c for c in s.lower() if c != ' '); while len(d) > 1: compare popleft() with pop().",
      solution: `from collections import deque

def is_palindrome(s):
    d = deque(c for c in s.lower() if c != " ")
    while len(d) > 1:
        if d.popleft() != d.pop():
            return False
    return True

print(is_palindrome("Never odd or even"))
print(is_palindrome("Python"))
`,
    },
    {
      task: "Create a namedtuple `Student(name, marks)`. From a list of students, find the topper using max with a key, and create an updated copy of a student with marks increased by 5 using _replace.",
      hint: "max(students, key=lambda s: s.marks)",
      solution: `from collections import namedtuple

Student = namedtuple("Student", ["name", "marks"])
students = [Student("Asha", 88), Student("Ravi", 92), Student("Meena", 79)]
topper = max(students, key=lambda s: s.marks)
print("Topper:", topper.name, topper.marks)
updated = students[2]._replace(marks=students[2].marks + 5)
print(students[2], "->", updated)
`,
    },
    {
      task: "Use ChainMap to look up a variable name through three scopes: local={'x': 1}, global_={'x': 10, 'y': 20}, builtins={'len': 'builtin len', 'y': 99}. Print the values for x, y and len, then add a new child scope with x=100 and print x again.",
      hint: "scope = ChainMap(local, global_, builtins); scope.new_child({'x': 100})",
      solution: `from collections import ChainMap

local = {"x": 1}
global_ = {"x": 10, "y": 20}
builtins = {"len": "builtin len", "y": 99}
scope = ChainMap(local, global_, builtins)
print(scope["x"], scope["y"], scope["len"])
inner = scope.new_child({"x": 100})
print(inner["x"], inner.parents["x"])
`,
    },
  ],
  quiz: [
    {
      question: "What does Counter('hello')['z'] return?",
      options: [
        "KeyError",
        "None",
        "0",
        "''",
      ],
      answer: 2,
      explanation: "Counter returns 0 for missing keys instead of raising KeyError.",
    },
    {
      question: "Which factory should you pass to defaultdict to group items into lists?",
      options: [
        "list()",
        "list",
        "[]",
        "dict",
      ],
      answer: 1,
      explanation: "You pass the callable `list` itself; defaultdict calls it to create each new empty list.",
    },
    {
      question: "What is the time complexity of deque.popleft()?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)",
      ],
      answer: 0,
      explanation: "deque supports O(1) appends and pops at both ends.",
    },
    {
      question: "d = deque([1, 2, 3], maxlen=3); d.append(4). What is d?",
      options: [
        "deque([1, 2, 3, 4])",
        "deque([2, 3, 4], maxlen=3)",
        "deque([1, 2, 3], maxlen=3)",
        "IndexError",
      ],
      answer: 1,
      explanation: "A full bounded deque drops the item from the opposite end (1).",
    },
    {
      question: "How do you change a field of a namedtuple instance p?",
      options: [
        "p.field = value",
        "p._replace(field=value) returns a new tuple",
        "p.update(field=value)",
        "setattr(p, 'field', value)",
      ],
      answer: 1,
      explanation: "namedtuples are immutable; _replace returns a modified copy.",
    },
    {
      question: "In ChainMap(a, b), where does `cm['k'] = 1` write?",
      options: [
        "a",
        "b",
        "both a and b",
        "a new internal dict",
      ],
      answer: 0,
      explanation: "Writes and deletes always go to the first mapping.",
    },
  ],
};
