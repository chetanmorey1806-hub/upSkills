export default {
  id: "extra-06-functools",
  title: "functools: partial, lru_cache, reduce, wraps, singledispatch, total_ordering",
  module: "Module 2: Standard Library Power Tools",
  extraNo: 6,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "functools contains higher-order tools that work with functions: pre-fill arguments with partial, memoize results with lru_cache and cache, fold sequences with reduce, write correct decorators with wraps, create type-based overloads with singledispatch, and generate comparison methods with total_ordering. Also covers cached_property and cmp_to_key.",
  objectives: [
    "Create specialised functions with partial",
    "Speed up repeated or recursive calls with lru_cache / cache and inspect cache_info",
    "Fold a sequence into one value with reduce",
    "Write decorators that keep metadata using wraps",
    "Dispatch on argument type with singledispatch and generate comparisons with total_ordering",
  ],
  theory: [
    {
      heading: "partial: Pre-filling Arguments",
      content: `\`functools.partial(func, *args, **kwargs)\` returns a new callable with some arguments already fixed. When you call it, the stored arguments are combined with the new ones. It is cleaner than writing a small wrapper function or lambda, and it can be inspected (\`.func\`, \`.args\`, \`.keywords\`) and pickled.

Common uses: callbacks that need extra data, setting a default base (\`int\` with base=2), and configuring functions passed to map or a thread pool.`,
      syntax: `from functools import partial
def power(base, exp):
    return base ** exp
square = partial(power, exp=2)
cube = partial(power, exp=3)
square(5), cube(2)          # (25, 8)
parse_binary = partial(int, base=2)
parse_binary("1010")        # 10
`,
    },
    {
      heading: "lru_cache and cache: Memoization",
      content: `Memoization stores the result of a function call so that calling it again with the same arguments returns the stored result instantly. \`@lru_cache(maxsize=128)\` keeps up to maxsize results and discards the **Least Recently Used** when full. \`@cache\` (3.9+) is the same as \`lru_cache(maxsize=None)\` - unlimited and slightly faster.

Rules: arguments must be **hashable** (no lists or dicts), the function should be **pure** (same input always gives the same output, no side effects), and memory grows with distinct arguments. Use \`func.cache_info()\` to see hits/misses and \`func.cache_clear()\` to reset.`,
      points: [
        "Turns exponential naive recursive Fibonacci into linear time",
        "`f(1)` and `f(1.0)` share a cache entry unless `typed=True`",
        "Do not cache functions that read time, random numbers or external data that changes",
        "On methods, the cache keeps `self` alive - prefer caching module-level functions or use cached_property",
      ],
    },
    {
      heading: "reduce: Folding a Sequence",
      content: `\`reduce(func, iterable, initial)\` applies a two-argument function cumulatively: \`reduce(f, [a, b, c])\` = \`f(f(a, b), c)\`. It was a built-in in Python 2 and moved to functools in Python 3 because explicit loops or built-ins like \`sum\`, \`max\`, \`math.prod\`, \`any\`, \`all\` and \`''.join\` are usually clearer.

Always provide an \`initial\` value when the iterable might be empty - otherwise reduce raises TypeError.`,
      syntax: `from functools import reduce
import operator
reduce(operator.mul, [1, 2, 3, 4])    # 24
reduce(lambda acc, x: acc + x, [], 0) # 0 (initial avoids error)
`,
    },
    {
      heading: "wraps: Writing Proper Decorators",
      content: `A decorator replaces a function with a wrapper. Without help, the wrapper's \`__name__\`, \`__doc__\`, \`__module__\`, \`__qualname__\` and annotations hide the original's. This breaks debugging, logging, documentation tools and frameworks like Flask (which use function names for routes).

\`@functools.wraps(func)\` applied to the wrapper copies this metadata and also sets \`wrapper.__wrapped__ = func\`, so you can reach the original function.`,
      syntax: `from functools import wraps
def log_calls(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print("Calling", func.__name__)
        return func(*args, **kwargs)
    return wrapper
`,
      tip: "Always use @wraps in every decorator you write. Interviewers often ask what happens without it.",
    },
    {
      heading: "singledispatch: Overloading by Type",
      content: "Python does not support function overloading by signature. `@singledispatch` gives a form of it: you write a generic base function, then register implementations for specific types with `@func.register`. The implementation is chosen from the type of the **first argument**, following the class hierarchy (MRO). Type hints on the first parameter can be used for registration. For methods inside a class, use `@singledispatchmethod`.",
      syntax: `from functools import singledispatch
@singledispatch
def to_json(obj):
    raise TypeError(f"Unsupported: {type(obj).__name__}")

@to_json.register
def _(obj: int):
    return str(obj)
`,
    },
    {
      heading: "total_ordering, cached_property and cmp_to_key",
      content: `\`@total_ordering\` is a class decorator: you define \`__eq__\` and ONE of \`__lt__\`, \`__le__\`, \`__gt__\`, \`__ge__\`, and it fills in the remaining comparison methods. Great for value objects like Version or Money.

\`@cached_property\` turns a method into a property that is computed once per instance and then stored in the instance \`__dict__\`. Use it for expensive derived values.

\`cmp_to_key(func)\` converts an old-style comparison function (returning negative/zero/positive) into a key function for \`sorted\`, \`min\`, \`max\`.`,
      points: [
        "total_ordering methods are slightly slower than hand-written ones",
        "cached_property needs an instance `__dict__` (does not work with __slots__ alone)",
        "Delete the attribute (`del obj.prop`) to force a cached_property to recompute",
      ],
    },
  ],
  examples: [
    {
      title: "Specialised Functions with partial",
      scenario: "A billing service needs GST calculators for different tax slabs and a logger that always uses the same prefix.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import partial

def price_with_tax(amount, rate):
    return round(amount * (1 + rate / 100), 2)

gst5 = partial(price_with_tax, rate=5)
gst18 = partial(price_with_tax, rate=18)
print(gst5(1000), gst18(1000))
print(list(map(gst18, [100, 250, 499])))

def log(level, module, msg):
    print(f"[{level}] {module}: {msg}")

payment_error = partial(log, "ERROR", "payments")
payment_error("Card declined")
payment_error("Timeout")

from_binary = partial(int, base=2)
print(from_binary("1101"), from_binary("11111111"))
print(gst18.func.__name__, gst18.args, gst18.keywords)
`,
      python: {
        files: {
          "main.py": `from functools import partial

def price_with_tax(amount, rate):
    return round(amount * (1 + rate / 100), 2)

gst5 = partial(price_with_tax, rate=5)
gst18 = partial(price_with_tax, rate=18)
print(gst5(1000), gst18(1000))
print(list(map(gst18, [100, 250, 499])))

def log(level, module, msg):
    print(f"[{level}] {module}: {msg}")

payment_error = partial(log, "ERROR", "payments")
payment_error("Card declined")
payment_error("Timeout")

from_binary = partial(int, base=2)
print(from_binary("1101"), from_binary("11111111"))
print(gst18.func.__name__, gst18.args, gst18.keywords)
`,
        },
      },
      result: `1050.0 1180.0
[118.0, 295.0, 588.82]
[ERROR] payments: Card declined
[ERROR] payments: Timeout
13 255
price_with_tax () {'rate': 18}`,
      explanation: "partial fixes the rate, so gst5/gst18 behave like one-argument functions that work directly with map. Positional arguments can be fixed too (level and module). Partial objects remember func, args and keywords.",
    },
    {
      title: "Memoizing Recursive and Expensive Calls",
      scenario: "Compare naive recursive Fibonacci with a cached version and simulate an expensive currency-rate lookup.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import lru_cache, cache
import time

calls = 0
def fib_slow(n):
    global calls
    calls += 1
    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)

fib_slow(25)
print("Naive calls for fib(25):", calls)

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("fib(100) =", fib(100))
print(fib.cache_info())

@lru_cache(maxsize=2)
def get_rate(currency):
    print(f"  fetching {currency}...")
    time.sleep(0.01)
    return {"USD": 83.2, "EUR": 90.1, "GBP": 105.4}[currency]

for c in ["USD", "USD", "EUR", "GBP", "USD"]:
    print(c, get_rate(c))
print(get_rate.cache_info())
get_rate.cache_clear()
print(get_rate.cache_info())
`,
      python: {
        files: {
          "main.py": `from functools import lru_cache, cache
import time

calls = 0
def fib_slow(n):
    global calls
    calls += 1
    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)

fib_slow(25)
print("Naive calls for fib(25):", calls)

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print("fib(100) =", fib(100))
print(fib.cache_info())

@lru_cache(maxsize=2)
def get_rate(currency):
    print(f"  fetching {currency}...")
    time.sleep(0.01)
    return {"USD": 83.2, "EUR": 90.1, "GBP": 105.4}[currency]

for c in ["USD", "USD", "EUR", "GBP", "USD"]:
    print(c, get_rate(c))
print(get_rate.cache_info())
get_rate.cache_clear()
print(get_rate.cache_info())
`,
        },
      },
      result: `Naive calls for fib(25): 242785
fib(100) = 354224848179261915075
CacheInfo(hits=98, misses=101, maxsize=None, currsize=101)
  fetching USD...
USD 83.2
USD 83.2
  fetching EUR...
EUR 90.1
  fetching GBP...
GBP 105.4
  fetching USD...
USD 83.2
CacheInfo(hits=1, misses=4, maxsize=2, currsize=2)
CacheInfo(hits=0, misses=0, maxsize=2, currsize=0)`,
      explanation: "Naive recursion repeats work and makes 242785 calls. With @cache each n is computed once (101 misses). lru_cache(maxsize=2) evicts the least recently used: after EUR and GBP are cached, USD was evicted and is fetched again.",
    },
    {
      title: "reduce, and Its Simpler Alternatives",
      scenario: "Combine a list of numbers, merge dictionaries of permissions and compose a text-processing pipeline.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import reduce
import operator
import math

nums = [3, 7, 2, 9, 4]
print(reduce(operator.add, nums), sum(nums))
print(reduce(operator.mul, nums), math.prod(nums))
print(reduce(lambda a, b: a if a > b else b, nums), max(nums))
print(reduce(operator.add, [], 0))

roles = [{"read": True}, {"write": True}, {"delete": False, "read": False}]
print(reduce(lambda acc, d: {**acc, **d}, roles, {}))

def compose(*funcs):
    return reduce(lambda f, g: lambda x: g(f(x)), funcs)

clean = compose(str.strip, str.lower, lambda s: s.replace(" ", "_"))
print(clean("  Hello World Report  "))

try:
    reduce(operator.add, [])
except TypeError as e:
    print("Error:", e)
`,
      python: {
        files: {
          "main.py": `from functools import reduce
import operator
import math

nums = [3, 7, 2, 9, 4]
print(reduce(operator.add, nums), sum(nums))
print(reduce(operator.mul, nums), math.prod(nums))
print(reduce(lambda a, b: a if a > b else b, nums), max(nums))
print(reduce(operator.add, [], 0))

roles = [{"read": True}, {"write": True}, {"delete": False, "read": False}]
print(reduce(lambda acc, d: {**acc, **d}, roles, {}))

def compose(*funcs):
    return reduce(lambda f, g: lambda x: g(f(x)), funcs)

clean = compose(str.strip, str.lower, lambda s: s.replace(" ", "_"))
print(clean("  Hello World Report  "))

try:
    reduce(operator.add, [])
except TypeError as e:
    print("Error:", e)
`,
        },
      },
      result: `25 25
1512 1512
9 9
0
{'read': False, 'write': True, 'delete': False}
hello_world_report
Error: reduce() of empty iterable with no initial value`,
      explanation: "reduce folds left to right. For sums, products and max, the built-ins are clearer. reduce is useful for merging dicts or composing functions. Without an initial value, an empty list raises TypeError.",
    },
    {
      title: "A Timing Decorator with and without wraps",
      scenario: "A developer writes a decorator to measure execution time, and checks that the function name and docstring survive.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import time
from functools import wraps

def timer_bad(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        ms = (time.perf_counter() - start) * 1000
        print(f"{func.__name__} took {ms:.0f} ms" if ms > 50 else f"{func.__name__} was fast")
        return result
    return wrapper

@timer_bad
def report_a():
    "Generate report A."

@timer
def report_b(n):
    "Generate report B."
    return sum(range(n))

print(report_a.__name__, report_a.__doc__)
print(report_b.__name__, report_b.__doc__)
print(report_b(1000))
print(report_b.__wrapped__(10))
`,
      python: {
        files: {
          "main.py": `import time
from functools import wraps

def timer_bad(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        ms = (time.perf_counter() - start) * 1000
        print(f"{func.__name__} took {ms:.0f} ms" if ms > 50 else f"{func.__name__} was fast")
        return result
    return wrapper

@timer_bad
def report_a():
    "Generate report A."

@timer
def report_b(n):
    "Generate report B."
    return sum(range(n))

print(report_a.__name__, report_a.__doc__)
print(report_b.__name__, report_b.__doc__)
print(report_b(1000))
print(report_b.__wrapped__(10))
`,
        },
      },
      result: `wrapper None
report_b Generate report B.
report_b was fast
499500
45`,
      explanation: "Without wraps, the decorated function is reported as 'wrapper' with no docstring. With wraps the metadata is copied, and __wrapped__ gives access to the original undecorated function (which does not print a timing line).",
    },
    {
      title: "singledispatch Formatter and total_ordering Version Class",
      scenario: "An export tool formats different data types differently, and a release tool compares version numbers.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import singledispatch, total_ordering, cached_property, cmp_to_key
from datetime import date
from decimal import Decimal

@singledispatch
def fmt(value):
    return str(value)

@fmt.register
def _(value: float):
    return f"{value:,.2f}"

@fmt.register
def _(value: date):
    return value.strftime("%d-%b-%Y")

@fmt.register(list)
@fmt.register(tuple)
def _(value):
    return " | ".join(fmt(v) for v in value)

print(fmt(42), fmt(1234567.891), fmt(date(2025, 1, 26)), fmt(Decimal("9.5")))
print(fmt([1.5, date(2024, 8, 15), "ok", (2, 3.0)]))

@total_ordering
class Version:
    def __init__(self, text):
        self.parts = tuple(int(p) for p in text.split("."))
    def __eq__(self, other):
        return self.parts == other.parts
    def __lt__(self, other):
        return self.parts < other.parts
    def __repr__(self):
        return "v" + ".".join(map(str, self.parts))
    @cached_property
    def is_major(self):
        print("  (computing is_major)")
        return self.parts[1:] == (0, 0)

a, b = Version("1.10.0"), Version("1.9.3")
print(a > b, a >= b, a <= b, a != b)
print(sorted([Version("2.0.0"), a, b]))
print(Version("2.0.0").is_major)
v = Version("3.0.0")
print(v.is_major, v.is_major)

def by_len_then_alpha(x, y):
    return (len(x) - len(y)) or (x > y) - (x < y)
print(sorted(["pear", "fig", "apple", "kiwi"], key=cmp_to_key(by_len_then_alpha)))
`,
      python: {
        files: {
          "main.py": `from functools import singledispatch, total_ordering, cached_property, cmp_to_key
from datetime import date
from decimal import Decimal

@singledispatch
def fmt(value):
    return str(value)

@fmt.register
def _(value: float):
    return f"{value:,.2f}"

@fmt.register
def _(value: date):
    return value.strftime("%d-%b-%Y")

@fmt.register(list)
@fmt.register(tuple)
def _(value):
    return " | ".join(fmt(v) for v in value)

print(fmt(42), fmt(1234567.891), fmt(date(2025, 1, 26)), fmt(Decimal("9.5")))
print(fmt([1.5, date(2024, 8, 15), "ok", (2, 3.0)]))

@total_ordering
class Version:
    def __init__(self, text):
        self.parts = tuple(int(p) for p in text.split("."))
    def __eq__(self, other):
        return self.parts == other.parts
    def __lt__(self, other):
        return self.parts < other.parts
    def __repr__(self):
        return "v" + ".".join(map(str, self.parts))
    @cached_property
    def is_major(self):
        print("  (computing is_major)")
        return self.parts[1:] == (0, 0)

a, b = Version("1.10.0"), Version("1.9.3")
print(a > b, a >= b, a <= b, a != b)
print(sorted([Version("2.0.0"), a, b]))
print(Version("2.0.0").is_major)
v = Version("3.0.0")
print(v.is_major, v.is_major)

def by_len_then_alpha(x, y):
    return (len(x) - len(y)) or (x > y) - (x < y)
print(sorted(["pear", "fig", "apple", "kiwi"], key=cmp_to_key(by_len_then_alpha)))
`,
        },
      },
      result: `42 1,234,567.89 26-Jan-2025 9.5
1.50 | 15-Aug-2024 | ok | 2 | 3.00
True True False True
[v1.9.3, v1.10.0, v2.0.0]
  (computing is_major)
True
  (computing is_major)
True True
['fig', 'kiwi', 'pear', 'apple']`,
      explanation: "singledispatch selects fmt by the type of the first argument; int and Decimal fall back to the base version. total_ordering derived >, >= and <= from __eq__ and __lt__ (tuple comparison makes 1.10 > 1.9). cached_property computes once per instance. cmp_to_key adapts an old-style comparator.",
    },
  ],
  interview: [
    {
      q: "What does functools.partial do?",
      a: "It creates a new callable with some positional or keyword arguments of an existing function pre-filled. Example: `square = partial(pow, exp=2)` gives a function where `square(7)` returns 49, and `partial(int, base=2)` parses binary strings. It is useful for callbacks, map, and configuring functions.",
      level: "Easy",
    },
    {
      q: "What is memoization and how do you do it in Python?",
      a: "Memoization caches function results for given arguments so repeated calls return instantly. Use `@functools.lru_cache(maxsize=N)` or `@functools.cache` (unbounded, 3.9+). Arguments must be hashable and the function should be pure.",
      level: "Easy",
    },
    {
      q: "Difference between lru_cache and cache?",
      a: "`cache` is `lru_cache(maxsize=None)`: unlimited size, no eviction, slightly faster. `lru_cache(maxsize=128)` limits memory by evicting the least recently used entry when full. Both expose cache_info() and cache_clear().",
      level: "Medium",
    },
    {
      q: "Why can't you use lru_cache on a function that takes a list?",
      a: "The cache stores arguments as dictionary keys, which must be hashable. Lists and dicts are mutable and unhashable, so calling raises `TypeError: unhashable type: 'list'`. Convert to a tuple or frozenset first.",
      level: "Medium",
    },
    {
      q: "What are the risks of using lru_cache on instance methods?",
      a: "The cache holds a reference to `self` as part of the key, so instances are never garbage collected while cached (memory leak), and the cache is shared across all instances. Prefer `cached_property` for per-instance values, or cache a module-level function.",
      level: "Hard",
    },
    {
      q: "Why was reduce moved out of built-ins in Python 3?",
      a: "Guido van Rossum felt reduce made code harder to read than an explicit loop, and most uses are covered by sum, max, min, any, all, math.prod and str.join. It remains available in functools for cases like merging or function composition.",
      level: "Medium",
    },
    {
      q: "What does @wraps do and why is it important?",
      a: "`functools.wraps(func)` copies `__name__`, `__qualname__`, `__doc__`, `__module__`, `__annotations__` and `__dict__` from the original function to the wrapper, and sets `__wrapped__`. Without it, debugging, logging, help(), documentation tools and frameworks that rely on function names (e.g. Flask endpoints) break.",
      level: "Medium",
    },
    {
      q: "Does Python support function overloading? What is singledispatch?",
      a: "Not by signature - a later def with the same name replaces the earlier one. `functools.singledispatch` provides single-dispatch generic functions: a base function plus registered implementations chosen by the type of the first argument, respecting inheritance. `singledispatchmethod` does the same for methods.",
      level: "Hard",
    },
    {
      q: "What is total_ordering?",
      a: "A class decorator that, given `__eq__` and one ordering method (`__lt__`, `__le__`, `__gt__` or `__ge__`), automatically adds the others. It reduces boilerplate for comparable value objects, with a small performance cost.",
      level: "Medium",
    },
    {
      q: "Difference between @property and @cached_property?",
      a: "@property runs the getter every time it is accessed. @cached_property runs it once per instance and stores the result in the instance `__dict__`; later accesses read the stored value. Use cached_property for expensive values that do not change; `del obj.attr` resets it.",
      level: "Medium",
    },
    {
      q: "How does cmp_to_key work?",
      a: "It wraps a comparison function `cmp(a, b)` returning negative, zero or positive into a key class whose instances compare using that function. This lets old Python 2 style comparators work with `sorted(key=...)`, `min` and `max`.",
      level: "Hard",
    },
    {
      q: "When should you NOT use caching?",
      a: "When results depend on changing external state (database, time, random, files), when the function has side effects that must happen every call, when arguments are rarely repeated (cache only wastes memory), or when arguments are unhashable or huge.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Use partial to create `send_sms` and `send_email` from a general `notify(channel, to, msg)` function, and call each once.",
      hint: "send_sms = partial(notify, 'SMS')",
      solution: `from functools import partial

def notify(channel, to, msg):
    print(f"[{channel}] to {to}: {msg}")

send_sms = partial(notify, "SMS")
send_email = partial(notify, "EMAIL")
send_sms("9876543210", "OTP is 4821")
send_email("asha@example.com", "Welcome!")
`,
    },
    {
      task: "Count the number of ways to climb n stairs taking 1 or 2 steps at a time using recursion with @cache. Print ways(10), ways(50) and cache_info().",
      hint: "ways(n) = ways(n-1) + ways(n-2), with ways(0) = ways(1) = 1",
      solution: `from functools import cache

@cache
def ways(n):
    if n <= 1:
        return 1
    return ways(n - 1) + ways(n - 2)

print(ways(10))
print(ways(50))
print(ways.cache_info())
`,
    },
    {
      task: "Using reduce, find the longest word in a list, and flatten [[1, 2], [3], [4, 5]] into one list (give an initial value).",
      hint: "reduce(lambda a, b: a if len(a) >= len(b) else b, words) and reduce(lambda acc, x: acc + x, lists, [])",
      solution: `from functools import reduce

words = ["python", "is", "awesome", "fun"]
print(reduce(lambda a, b: a if len(a) >= len(b) else b, words))
lists = [[1, 2], [3], [4, 5]]
print(reduce(lambda acc, x: acc + x, lists, []))
`,
    },
    {
      task: "Write a `retry(times)` decorator factory using @wraps that retries a function when it raises an exception, printing each attempt. Test it with a function that fails twice and then succeeds.",
      hint: "Three levels: retry(times) -> decorator(func) -> wrapper(*args, **kwargs). Use a counter in a list or nonlocal to simulate failures.",
      solution: `from functools import wraps

def retry(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    print(f"Attempt {attempt} failed: {e}")
            raise RuntimeError(f"{func.__name__} failed after {times} attempts")
        return wrapper
    return decorator

state = {"calls": 0}

@retry(times=3)
def flaky_api():
    "Calls an unreliable API."
    state["calls"] += 1
    if state["calls"] < 3:
        raise ConnectionError("timeout")
    return "OK"

print(flaky_api())
print(flaky_api.__name__, "-", flaky_api.__doc__)
`,
    },
    {
      task: "Create a `Money` class with amount and currency, decorated with @total_ordering, that compares by amount (only same currency allowed, else raise ValueError). Sort a list of Money objects.",
      hint: "Define __eq__ and __lt__; check currency in a helper.",
      solution: `from functools import total_ordering

@total_ordering
class Money:
    def __init__(self, amount, currency="INR"):
        self.amount = amount
        self.currency = currency

    def _check(self, other):
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")

    def __eq__(self, other):
        self._check(other)
        return self.amount == other.amount

    def __lt__(self, other):
        self._check(other)
        return self.amount < other.amount

    def __repr__(self):
        return f"{self.currency} {self.amount}"

items = [Money(500), Money(120), Money(999)]
print(sorted(items))
print(Money(100) >= Money(100), Money(50) > Money(70))
try:
    Money(1, "USD") < Money(1)
except ValueError as e:
    print("Error:", e)
`,
    },
  ],
  quiz: [
    {
      question: "What is `partial(int, base=16)('ff')`?",
      options: [
        "'ff'",
        "255",
        "15",
        "ValueError",
      ],
      answer: 1,
      explanation: "partial fixes base=16, so it calls int('ff', base=16) = 255.",
    },
    {
      question: "@functools.cache is equivalent to...",
      options: [
        "lru_cache(maxsize=128)",
        "lru_cache(maxsize=None)",
        "lru_cache(maxsize=0)",
        "cached_property",
      ],
      answer: 1,
      explanation: "cache is an unbounded lru_cache.",
    },
    {
      question: "What happens when a function decorated with lru_cache is called with a list argument?",
      options: [
        "The list is converted to a tuple",
        "TypeError: unhashable type",
        "Result is not cached but returned",
        "It works normally",
      ],
      answer: 1,
      explanation: "Cache keys must be hashable; lists are not.",
    },
    {
      question: "reduce(lambda a, b: a * b, [2, 3, 4]) returns...",
      options: [
        "9",
        "24",
        "[2, 6, 24]",
        "234",
      ],
      answer: 1,
      explanation: "((2*3)*4) = 24.",
    },
    {
      question: "Without @wraps, a decorated function's __name__ is usually...",
      options: [
        "the original name",
        "the wrapper function's name",
        "None",
        "'decorator'",
      ],
      answer: 1,
      explanation: "The decorator returns the wrapper, so its metadata replaces the original's.",
    },
    {
      question: "singledispatch chooses the implementation based on...",
      options: [
        "the number of arguments",
        "the type of the first argument",
        "the return type",
        "the types of all arguments",
      ],
      answer: 1,
      explanation: "It is single dispatch: only the first argument's type is used.",
    },
  ],
};
