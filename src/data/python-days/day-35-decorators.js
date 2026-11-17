export default {
  id: "day-35-decorators",
  title: "Decorators (function decorators, decorators with arguments, functools.wraps)",
  module: "Module 6: Advanced Python",
  day: 35,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Learn how decorators wrap functions to add behaviour such as logging, timing, caching and access control without changing the original code, including decorators that take arguments and the role of functools.wraps.",
  objectives: [
    "Explain first-class functions and closures, the building blocks of decorators",
    "Write a basic decorator and apply it with the @ syntax",
    "Handle any arguments with *args/**kwargs and preserve metadata with functools.wraps",
    "Create decorators with arguments (three-level nesting) and stack multiple decorators",
    "Use built-in decorators like @lru_cache, @property, @staticmethod and @classmethod",
  ],
  theory: [
    {
      heading: "Functions are First-Class Objects",
      content: "In Python, functions are objects. You can store them in variables, pass them to other functions, and return them from functions. A function defined inside another function can remember variables of the outer function even after the outer function has finished - this is called a closure. Decorators are built on these two ideas.",
      syntax: `def make_multiplier(n):
    def multiply(x):
        return x * n          # remembers n (closure)
    return multiply

double = make_multiplier(2)
print(double(5))              # 10
`,
    },
    {
      heading: "What is a Decorator?",
      content: "A decorator is a function that takes a function, adds some behaviour around it, and returns a new function. Analogy: a gift wrapper - the gift (original function) stays the same, but the wrapper adds something extra outside. The @decorator line above a function is just shortcut syntax for func = decorator(func).",
      syntax: `def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before")
        result = func(*args, **kwargs)
        print("After")
        return result
    return wrapper

@my_decorator            # same as: greet = my_decorator(greet)
def greet(name):
    print("Hello", name)
`,
      points: [
        "Always accept *args, **kwargs in wrapper so any function can be decorated",
        "Always return the result of func, otherwise the decorated function returns None",
        "Decoration happens once, at definition time; wrapper runs on every call",
      ],
    },
    {
      heading: "functools.wraps",
      content: "After decoration, the name greet actually points to wrapper. So greet.__name__ becomes 'wrapper' and the docstring is lost. This breaks debugging, logging and tools like Flask routing. Applying @functools.wraps(func) to the wrapper copies the name, docstring and other metadata from the original function.",
      syntax: `from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
`,
      tip: "Make @wraps(func) a habit in every decorator you write.",
    },
    {
      heading: "Decorators with Arguments",
      content: "Sometimes you want to configure the decorator, e.g. @repeat(3) or @retry(times=5). Then you need one more level: a function that takes the arguments and returns the actual decorator. So @repeat(3) first calls repeat(3), which returns a decorator, which is then applied to the function.",
      syntax: `def repeat(times):              # level 1: arguments
    def decorator(func):         # level 2: function
        @wraps(func)
        def wrapper(*args, **kwargs):   # level 3: call
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator
`,
    },
    {
      heading: "Stacking Decorators and Class-Based Decorators",
      content: "You can apply several decorators to one function. They are applied bottom-up (the one closest to def wraps first) but run top-down when called. A class with __call__ can also act as a decorator, which is handy when you need to keep state such as a call count.",
      syntax: `@bold        # applied second, runs first
@italic      # applied first
def text(): return "hi"
# same as: text = bold(italic(text))
`,
    },
    {
      heading: "Real-World Uses and Built-in Decorators",
      content: "Decorators are everywhere in frameworks: Flask @app.route, Django @login_required, pytest @pytest.fixture, DRF @api_view. Common custom decorators: logging, timing, retry, caching, authentication, input validation. Built-in ones include @property, @staticmethod, @classmethod, @functools.lru_cache / @cache and @dataclass.",
      points: [
        "@lru_cache(maxsize=None) memoizes results of pure functions",
        "Decorators should not change what the function does, only add around it",
        "Common mistake: writing @decorator() for a decorator that takes no arguments (or the reverse)",
      ],
    },
  ],
  examples: [
    {
      title: "Your First Decorator and What @ Really Does",
      scenario: "Add logging around functions without editing their bodies.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with {args} {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@log_call
def add(a, b):
    return a + b

@log_call
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

add(3, 4)
greet("Asha", greeting="Hi")

def square(x):
    return x * x
square = log_call(square)        # same thing without @
square(5)
print(add.__name__)              # metadata lost!
`,
      python: {
        files: {
          "main.py": `def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with {args} {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@log_call
def add(a, b):
    return a + b

@log_call
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

add(3, 4)
greet("Asha", greeting="Hi")

def square(x):
    return x * x
square = log_call(square)        # same thing without @
square(5)
print(add.__name__)              # metadata lost!
`,
        },
      },
      result: `Calling add with (3, 4) {}
add returned 7
Calling greet with ('Asha',) {'greeting': 'Hi'}
greet returned Hi, Asha!
Calling square with (5,) {}
square returned 25
wrapper`,
      explanation: "log_call receives the function and returns wrapper. wrapper uses *args/**kwargs so it works for any signature and returns the original result. Writing square = log_call(square) is exactly what @ does. Note that add.__name__ is now 'wrapper' - we fix this next with functools.wraps.",
    },
    {
      title: "functools.wraps and a Timing Decorator",
      scenario: "Measure how long functions take while keeping their real name and docstring.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.1f}s")
        return result
    return wrapper

@timer
def slow_report(n):
    """Generate a fake report."""
    time.sleep(0.2)
    return f"report with {n} rows"

print(slow_report(50))
print(slow_report.__name__)
print(slow_report.__doc__)
print(slow_report.__wrapped__.__name__)
`,
      python: {
        files: {
          "main.py": `import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.1f}s")
        return result
    return wrapper

@timer
def slow_report(n):
    """Generate a fake report."""
    time.sleep(0.2)
    return f"report with {n} rows"

print(slow_report(50))
print(slow_report.__name__)
print(slow_report.__doc__)
print(slow_report.__wrapped__.__name__)
`,
        },
      },
      result: `slow_report took 0.2s
report with 50 rows
slow_report
Generate a fake report.
slow_report`,
      explanation: "@wraps(func) copies __name__, __doc__ and adds __wrapped__ (the original function). Without it, the name would be 'wrapper' and the docstring None. The function sleeps 0.2 s, so the timer prints about 0.2s.",
    },
    {
      title: "Decorators with Arguments: repeat and retry",
      scenario: "Run a function several times, and retry a flaky network call up to N times.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import wraps

def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator

def retry(attempts=3, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(1, attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    print(f"  attempt {i} failed: {e}")
            raise RuntimeError(f"{func.__name__} failed after {attempts} attempts")
        return wrapper
    return decorator

@repeat(3)
def roll():
    return "ok"

print(roll())

calls = {"n": 0}

@retry(attempts=4, exceptions=(ConnectionError,))
def fetch_data():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("server busy")
    return "data received"

print(fetch_data())

@retry(attempts=2)
def always_fails():
    raise ValueError("bad input")

try:
    always_fails()
except RuntimeError as e:
    print(e)
`,
      python: {
        files: {
          "main.py": `from functools import wraps

def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator

def retry(attempts=3, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for i in range(1, attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    print(f"  attempt {i} failed: {e}")
            raise RuntimeError(f"{func.__name__} failed after {attempts} attempts")
        return wrapper
    return decorator

@repeat(3)
def roll():
    return "ok"

print(roll())

calls = {"n": 0}

@retry(attempts=4, exceptions=(ConnectionError,))
def fetch_data():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("server busy")
    return "data received"

print(fetch_data())

@retry(attempts=2)
def always_fails():
    raise ValueError("bad input")

try:
    always_fails()
except RuntimeError as e:
    print(e)
`,
        },
      },
      result: `['ok', 'ok', 'ok']
  attempt 1 failed: server busy
  attempt 2 failed: server busy
data received
  attempt 1 failed: bad input
  attempt 2 failed: bad input
always_fails failed after 2 attempts`,
      explanation: "repeat(3) returns the real decorator, which wraps roll. retry() is configurable: fetch_data fails twice with ConnectionError, then succeeds on the 3rd attempt. always_fails fails on both attempts, so the wrapper raises RuntimeError. Note @retry(attempts=2) still needs parentheses because retry is a decorator factory.",
    },
    {
      title: "Stacking, Access Control, Class Decorator and lru_cache",
      scenario: "A web-style app checks login before running a view, counts calls, and caches expensive results.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import wraps, lru_cache

def bold(func):
    @wraps(func)
    def wrapper(*a, **k):
        return "<b>" + func(*a, **k) + "</b>"
    return wrapper

def italic(func):
    @wraps(func)
    def wrapper(*a, **k):
        return "<i>" + func(*a, **k) + "</i>"
    return wrapper

@bold
@italic
def title():
    return "Python"

print(title())

def login_required(func):
    @wraps(func)
    def wrapper(user, *args, **kwargs):
        if not user.get("logged_in"):
            return "403 Forbidden: please log in"
        return func(user, *args, **kwargs)
    return wrapper

@login_required
def dashboard(user):
    return f"Welcome {user['name']}"

print(dashboard({"name": "Asha", "logged_in": True}))
print(dashboard({"name": "Guest"}))

class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.func(*args, **kwargs)

@CountCalls
def ping():
    return "pong"

ping(); ping(); ping()
print("ping called", ping.count, "times")

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
print(fib.cache_info())
`,
      python: {
        files: {
          "main.py": `from functools import wraps, lru_cache

def bold(func):
    @wraps(func)
    def wrapper(*a, **k):
        return "<b>" + func(*a, **k) + "</b>"
    return wrapper

def italic(func):
    @wraps(func)
    def wrapper(*a, **k):
        return "<i>" + func(*a, **k) + "</i>"
    return wrapper

@bold
@italic
def title():
    return "Python"

print(title())

def login_required(func):
    @wraps(func)
    def wrapper(user, *args, **kwargs):
        if not user.get("logged_in"):
            return "403 Forbidden: please log in"
        return func(user, *args, **kwargs)
    return wrapper

@login_required
def dashboard(user):
    return f"Welcome {user['name']}"

print(dashboard({"name": "Asha", "logged_in": True}))
print(dashboard({"name": "Guest"}))

class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.func(*args, **kwargs)

@CountCalls
def ping():
    return "pong"

ping(); ping(); ping()
print("ping called", ping.count, "times")

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
print(fib.cache_info())
`,
        },
      },
      result: `<b><i>Python</i></b>
Welcome Asha
403 Forbidden: please log in
ping called 3 times
23416728348467685
CacheInfo(hits=78, misses=81, maxsize=None, currsize=81)`,
      explanation: "Stacked decorators apply bottom-up (italic first, then bold), so bold's tags end up outermost. login_required checks the user before calling the view, just like Django's decorator. CountCalls is a class-based decorator that keeps state in self.count. lru_cache remembers previous results, so fib(80) needs only 81 real calls (misses) instead of billions.",
    },
  ],
  interview: [
    {
      q: "What is a decorator in Python?",
      a: "A callable that takes a function and returns a new function (usually a wrapper) that adds behaviour before/after the original, without modifying its source. @dec above def f is shorthand for f = dec(f).",
      level: "Easy",
    },
    {
      q: "What is a closure?",
      a: "An inner function that remembers variables from its enclosing function's scope even after the outer function has returned. Decorators rely on closures to remember func.",
      level: "Medium",
    },
    {
      q: "Why use functools.wraps?",
      a: "Without it, the decorated function's __name__, __doc__ and other metadata are replaced by the wrapper's. wraps copies them and adds __wrapped__, which helps debugging, documentation and frameworks.",
      level: "Medium",
    },
    {
      q: "How do you write a decorator that takes arguments?",
      a: "Use three levels: an outer function that receives the arguments and returns a decorator, which receives func and returns the wrapper.",
      level: "Medium",
    },
    {
      q: "In what order are stacked decorators applied?",
      a: "Bottom-up at definition: @a @b def f -> f = a(b(f)). When called, a's wrapper runs first (outermost).",
      level: "Medium",
    },
    {
      q: `What is the output?
def d(f):
    def w():
        return f() * 2
    return w
@d
def g(): return 5
print(g())`,
      a: "10 - g is replaced by w, which returns 5 * 2.",
      level: "Easy",
    },
    {
      q: `What is the output?
def d(f):
    print('decorating')
    return f
@d
def g(): pass
print('end')`,
      a: "decorating then end - decoration happens at definition time, not when g is called.",
      level: "Medium",
    },
    {
      q: "What happens if the wrapper does not return func's result?",
      a: "The decorated function always returns None, which is a common bug.",
      level: "Easy",
    },
    {
      q: "Name some built-in or framework decorators.",
      a: "@property, @staticmethod, @classmethod, @functools.lru_cache, @functools.cache, @dataclass, @contextmanager, Flask @app.route, Django @login_required, DRF @api_view, pytest @pytest.fixture.",
      level: "Easy",
    },
    {
      q: "Can a class be used as a decorator? Can a decorator be applied to a class?",
      a: "Yes to both. A class with __call__ can decorate functions (and keep state). A function can take a class and return a modified class, like @dataclass or @total_ordering.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write a decorator uppercase that converts the returned string to uppercase.",
      hint: "Call func, then .upper() on the result.",
      solution: `from functools import wraps
def uppercase(func):
    @wraps(func)
    def wrapper(*a, **k):
        return func(*a, **k).upper()
    return wrapper
@uppercase
def hello(n): return f"hello {n}"
print(hello("asha"))   # HELLO ASHA
`,
    },
    {
      task: "Write a decorator validate_positive that raises ValueError if any numeric argument is negative.",
      hint: "Loop through args.",
      solution: `from functools import wraps
def validate_positive(func):
    @wraps(func)
    def wrapper(*args):
        if any(a < 0 for a in args):
            raise ValueError("negative not allowed")
        return func(*args)
    return wrapper
@validate_positive
def area(w, h): return w * h
print(area(3, 4))
`,
    },
    {
      task: "Write @debug that prints the function name, arguments and return value.",
      hint: "Use f-strings with args and kwargs.",
      solution: `from functools import wraps
def debug(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        r = func(*args, **kwargs)
        print(f"{func.__name__}{args}{kwargs} -> {r!r}")
        return r
    return wrapper
@debug
def mul(a, b=2): return a * b
mul(4, b=3)   # mul(4,){'b': 3} -> 12
`,
    },
    {
      task: "Write a decorator factory prefix(text) that adds text before the returned string.",
      hint: "Three levels of functions.",
      solution: `from functools import wraps
def prefix(text):
    def deco(func):
        @wraps(func)
        def wrapper(*a, **k):
            return text + func(*a, **k)
        return wrapper
    return deco
@prefix(">> ")
def msg(): return "Saved"
print(msg())   # >> Saved
`,
    },
    {
      task: "Implement a simple memoize decorator using a dict (without lru_cache).",
      hint: "Use args as the dict key.",
      solution: `from functools import wraps
def memoize(func):
    cache = {}
    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    return wrapper
@memoize
def fib(n): return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(50))   # 12586269025
`,
    },
  ],
  quiz: [
    {
      question: "@dec above def f(): ... is equivalent to:",
      options: [
        "f = dec",
        "dec(f)()",
        "f = dec(f)",
        "f = f(dec)",
      ],
      answer: 2,
      explanation: "The decorator is called with the function and its return value replaces the name.",
    },
    {
      question: "What does functools.wraps preserve?",
      options: [
        "Execution speed",
        "The function's name, docstring and other metadata",
        "Global variables",
        "The return value",
      ],
      answer: 1,
      explanation: "wraps copies __name__, __doc__, __module__, etc.",
    },
    {
      question: "How many nested function levels does a decorator WITH arguments typically need?",
      options: [
        "1",
        "2",
        "4",
        "3",
      ],
      answer: 3,
      explanation: "Arguments -> decorator -> wrapper.",
    },
    {
      question: "For @a then @b on the next line above def f, the result is:",
      options: [
        "a(b(f))",
        "b(a(f))",
        "a(f) and b(f) separately",
        "Error",
      ],
      answer: 0,
      explanation: "Decorators are applied bottom-up.",
    },
    {
      question: "When is the decorator function itself executed?",
      options: [
        "Every time f is called",
        "When the function is defined",
        "Only at program exit",
        "Never",
      ],
      answer: 1,
      explanation: "Decoration happens once at definition time; the wrapper runs on every call.",
    },
  ],
};
