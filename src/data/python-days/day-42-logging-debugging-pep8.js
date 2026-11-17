export default {
  id: "day-42-logging-debugging-pep8",
  title: "Logging and Debugging, Python Best Practices (PEP 8)",
  module: "Module 7: Interview Prep & Project",
  day: 42,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Replace print-debugging with the logging module, learn systematic debugging with tracebacks, f-string debugging and pdb/IDE breakpoints, and write clean, professional code that follows PEP 8 and common Python best practices.",
  objectives: [
    "Use logging levels, basicConfig, formats, named loggers, handlers and log files",
    "Read tracebacks and debug using f'{var=}', assert, breakpoint()/pdb and IDE debuggers",
    "Apply PEP 8 naming, layout, import and whitespace rules",
    "Use linters/formatters (black, ruff/flake8, pylint) and write Pythonic code",
  ],
  theory: [
    {
      heading: "Why logging instead of print()?",
      content: "print() is fine for learning, but in real applications you need to know WHEN something happened, WHERE (which module), HOW SERIOUS it was, and you need to send messages to files or monitoring tools and switch them on/off without editing code. The logging module does all of this. Analogy: print() is shouting in a room; logging is writing in a CCTV-style diary with timestamps and severity, which you can review later.",
      points: [
        "DEBUG (10): detailed info for developers",
        "INFO (20): normal events - 'User logged in'",
        "WARNING (30, default level): something unexpected but working",
        "ERROR (40): a feature failed",
        "CRITICAL (50): the application may stop",
      ],
    },
    {
      heading: "Configuring Logging",
      content: "logging.basicConfig() sets the level, format, and destination (console or file) once at program start. Messages below the level are ignored. Format fields include %(asctime)s, %(levelname)s, %(name)s, %(message)s, %(lineno)d, %(funcName)s. In bigger apps, create a logger per module with logging.getLogger(__name__) and attach handlers (StreamHandler for console, FileHandler/RotatingFileHandler for files), each with its own level and formatter.",
      syntax: `import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    filename="app.log",          # omit to log to the console
)
log = logging.getLogger(__name__)
log.info("Server started on port %s", 8000)   # lazy % formatting
`,
      tip: "Pass values as arguments (log.info('x=%s', x)) instead of f-strings; the string is only built if the message is actually logged. Use log.exception() inside except to include the traceback.",
    },
    {
      heading: "Debugging Techniques",
      content: "Debugging is finding why the program behaves differently from what you expect. Steps: 1) Reproduce the bug reliably. 2) Read the traceback from the BOTTOM up: the last line is the error type and message, the lines above show the call path with file and line numbers. 3) Inspect values: f'{variable=}' prints name and value. 4) Use breakpoints: breakpoint() starts pdb (n = next line, s = step into, c = continue, p x = print x, l = list code, q = quit). In VS Code/PyCharm, click left of a line number to set a red breakpoint and press F5 / Shift+F9 (Debug) to step through and watch variables.",
      points: [
        "assert condition, 'message' for internal sanity checks (disabled with python -O)",
        "Rubber duck debugging: explain the code line by line to someone (or a rubber duck)",
        "Binary search the bug: comment out half the code / use git bisect",
        "Write a failing unit test that reproduces the bug before fixing it",
      ],
    },
    {
      heading: "PEP 8: The Python Style Guide",
      content: "PEP 8 is the official style guide for Python code. Consistent style makes code easier to read, review and maintain - code is read far more often than it is written.",
      points: [
        "4 spaces per indentation level, never tabs",
        "Line length: 79 characters (many teams use 88 with black or 100-120)",
        "snake_case for variables, functions and modules; PascalCase for classes; UPPER_CASE for constants",
        "_single_leading_underscore for internal names",
        "2 blank lines around top-level functions/classes, 1 blank line between methods",
        "Imports at the top: standard library, third-party, local - each group separated, one per line, no wildcard imports",
        "Spaces around operators and after commas: x = a + b; no spaces inside brackets",
        "Compare to None with is / is not; use if items: instead of if len(items) > 0:",
      ],
    },
    {
      heading: "Pythonic Best Practices",
      content: "Beyond formatting, write idiomatic code: use enumerate() instead of range(len()), zip() to loop in parallel, with for files, comprehensions for simple transformations, f-strings for formatting, specific exceptions instead of bare except, small functions with docstrings, and no mutable default arguments. Use virtual environments and requirements.txt, keep secrets out of code (environment variables), and add type hints and tests.",
      syntax: `# Not Pythonic
for i in range(len(names)):
    print(i, names[i])

# Pythonic
for i, name in enumerate(names):
    print(i, name)
`,
    },
    {
      heading: "Tools: Formatters and Linters",
      content: "Formatters automatically rewrite code to a standard style: black (pip install black ; black .) and ruff format. Linters find style problems and likely bugs: flake8, pylint, ruff check. isort sorts imports. In VS Code install the Python + Ruff/Black extensions and enable 'Format on Save'; PyCharm has built-in PEP 8 inspections (Code > Reformat Code, Ctrl+Alt+L). Teams run these in pre-commit hooks and CI.",
      tip: "Interview tip: mention that you use black/ruff and type hints with mypy - it shows professional habits.",
    },
  ],
  examples: [
    {
      title: "Logging Levels and basicConfig",
      scenario: "An order service logs events at different severities; only messages at or above the configured level appear.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
    force=True,
)
log = logging.getLogger("orders")

log.debug("Cart contents: %s", ["pen", "book"])   # below INFO -> hidden
log.info("Order %s placed by %s", 101, "asha")
log.warning("Stock low for item %s (only %d left)", "book", 2)
log.error("Payment failed for order %s", 102)
log.critical("Database connection lost!")

log.setLevel(logging.DEBUG)
log.debug("Now debug messages are visible")

print("Level numbers:", logging.DEBUG, logging.INFO, logging.WARNING, logging.ERROR, logging.CRITICAL)
`,
      python: {
        files: {
          "main.py": `import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
    force=True,
)
log = logging.getLogger("orders")

log.debug("Cart contents: %s", ["pen", "book"])   # below INFO -> hidden
log.info("Order %s placed by %s", 101, "asha")
log.warning("Stock low for item %s (only %d left)", "book", 2)
log.error("Payment failed for order %s", 102)
log.critical("Database connection lost!")

log.setLevel(logging.DEBUG)
log.debug("Now debug messages are visible")

print("Level numbers:", logging.DEBUG, logging.INFO, logging.WARNING, logging.ERROR, logging.CRITICAL)
`,
        },
      },
      result: `INFO     | orders | Order 101 placed by asha
WARNING  | orders | Stock low for item book (only 2 left)
ERROR    | orders | Payment failed for order 102
CRITICAL | orders | Database connection lost!
DEBUG    | orders | Now debug messages are visible
Level numbers: 10 20 30 40 50`,
      explanation: "The level is INFO, so the first debug() call is ignored. %-8s pads the level name to 8 characters. Values are passed as arguments, not f-strings. After setLevel(DEBUG) on the 'orders' logger, debug messages appear. (We use stream=sys.stdout so the output shows in the result; by default logging writes to stderr, and force=True resets any earlier configuration.)",
    },
    {
      title: "Handlers: Console + Log File with Different Levels",
      scenario: "Show only warnings on screen but keep a detailed log file for later investigation.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import logging
import sys

logger = logging.getLogger("bank")
logger.setLevel(logging.DEBUG)

console = logging.StreamHandler(sys.stdout)
console.setLevel(logging.WARNING)
console.setFormatter(logging.Formatter("CONSOLE %(levelname)s: %(message)s"))

file_handler = logging.FileHandler("bank.log", mode="w")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter("%(levelname)s|%(funcName)s|%(message)s"))

logger.addHandler(console)
logger.addHandler(file_handler)

def withdraw(balance, amount):
    logger.debug("withdraw called with balance=%s amount=%s", balance, amount)
    if amount > balance:
        logger.warning("Insufficient funds: need %s, have %s", amount, balance)
        return balance
    logger.info("Withdrawal of %s successful", amount)
    return balance - amount

def parse_amount(text):
    try:
        return int(text)
    except ValueError as e:
        logger.error("Invalid amount %r: %s", text, e)
        return 0

bal = withdraw(1000, 300)
bal = withdraw(bal, 5000)
parse_amount("12x")

file_handler.close()
print("--- bank.log ---")
print(open("bank.log").read().strip())
`,
      python: {
        files: {
          "main.py": `import logging
import sys

logger = logging.getLogger("bank")
logger.setLevel(logging.DEBUG)

console = logging.StreamHandler(sys.stdout)
console.setLevel(logging.WARNING)
console.setFormatter(logging.Formatter("CONSOLE %(levelname)s: %(message)s"))

file_handler = logging.FileHandler("bank.log", mode="w")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter("%(levelname)s|%(funcName)s|%(message)s"))

logger.addHandler(console)
logger.addHandler(file_handler)

def withdraw(balance, amount):
    logger.debug("withdraw called with balance=%s amount=%s", balance, amount)
    if amount > balance:
        logger.warning("Insufficient funds: need %s, have %s", amount, balance)
        return balance
    logger.info("Withdrawal of %s successful", amount)
    return balance - amount

def parse_amount(text):
    try:
        return int(text)
    except ValueError as e:
        logger.error("Invalid amount %r: %s", text, e)
        return 0

bal = withdraw(1000, 300)
bal = withdraw(bal, 5000)
parse_amount("12x")

file_handler.close()
print("--- bank.log ---")
print(open("bank.log").read().strip())
`,
        },
      },
      result: `CONSOLE WARNING: Insufficient funds: need 5000, have 700
CONSOLE ERROR: Invalid amount '12x': invalid literal for int() with base 10: '12x'
--- bank.log ---
DEBUG|withdraw|withdraw called with balance=1000 amount=300
INFO|withdraw|Withdrawal of 300 successful
DEBUG|withdraw|withdraw called with balance=700 amount=5000
WARNING|withdraw|Insufficient funds: need 5000, have 700
ERROR|parse_amount|Invalid amount '12x': invalid literal for int() with base 10: '12x'`,
      explanation: "The logger passes every record (DEBUG and above) to both handlers. The console handler shows only WARNING and above, while the file handler records everything, including DEBUG and INFO details with the function name. This is how production apps keep detailed logs without flooding the screen.",
    },
    {
      title: "Debugging a Buggy Function Step by Step",
      scenario: "A teacher's average-marks function returns wrong results. Use f'{var=}' prints and assert to find and fix the bug.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def average_buggy(marks):
    total = 0
    for i in range(1, len(marks)):      # BUG: starts from index 1
        total += marks[i]
    return total / len(marks)

marks = [80, 90, 100]
print("buggy result:", average_buggy(marks), "(expected 90.0)")

def average_debug(marks):
    total = 0
    for i in range(1, len(marks)):
        total += marks[i]
        print(f"  {i=} {marks[i]=} {total=}")
    return total / len(marks)

average_debug(marks)          # shows index 0 (80) is never added

def average(marks):
    """Return the average of a non-empty list of marks."""
    assert marks, "marks list must not be empty"
    return sum(marks) / len(marks)

print("fixed result:", average(marks))
try:
    average([])
except AssertionError as e:
    print("AssertionError:", e)

try:
    {"name": "Asha"}["age"]
except KeyError as e:
    import traceback
    last_line = traceback.format_exc().strip().splitlines()[-1]
    print("Traceback last line ->", last_line)

# In VS Code / PyCharm: put breakpoint() inside average_buggy, run,
# then use n (next), p total (print), c (continue) in pdb.
`,
      python: {
        files: {
          "main.py": `def average_buggy(marks):
    total = 0
    for i in range(1, len(marks)):      # BUG: starts from index 1
        total += marks[i]
    return total / len(marks)

marks = [80, 90, 100]
print("buggy result:", average_buggy(marks), "(expected 90.0)")

def average_debug(marks):
    total = 0
    for i in range(1, len(marks)):
        total += marks[i]
        print(f"  {i=} {marks[i]=} {total=}")
    return total / len(marks)

average_debug(marks)          # shows index 0 (80) is never added

def average(marks):
    """Return the average of a non-empty list of marks."""
    assert marks, "marks list must not be empty"
    return sum(marks) / len(marks)

print("fixed result:", average(marks))
try:
    average([])
except AssertionError as e:
    print("AssertionError:", e)

try:
    {"name": "Asha"}["age"]
except KeyError as e:
    import traceback
    last_line = traceback.format_exc().strip().splitlines()[-1]
    print("Traceback last line ->", last_line)

# In VS Code / PyCharm: put breakpoint() inside average_buggy, run,
# then use n (next), p total (print), c (continue) in pdb.
`,
        },
      },
      result: `buggy result: 63.333333333333336 (expected 90.0)
  i=1 marks[i]=90 total=90
  i=2 marks[i]=100 total=190
fixed result: 90.0
AssertionError: marks list must not be empty
Traceback last line -> KeyError: 'age'`,
      explanation: "The output 63.33 is wrong, so we inspect values. f'{i=}' prints both the expression and its value, revealing the loop starts at index 1 and skips 80. The fix uses sum() which is simpler and correct. assert guards against an empty list. The last line of a traceback always tells you the error type and message - read tracebacks bottom-up.",
    },
    {
      title: "PEP 8 Cleanup: Before and After",
      scenario: "Refactor messy, un-Pythonic code into clean PEP 8 style without changing what it does.",
      steps: [
        "Open VS Code or PyCharm and create main.py",
        "Paste the code and run it with python main.py",
        "Optional: pip install black ruff, then run black main.py and ruff check main.py",
        "In PyCharm use Code > Reformat Code (Ctrl+Alt+L) to see automatic PEP 8 formatting",
      ],
      code: `# ----- BEFORE (works, but hard to read) -----
# import sys,os
# def CalcTotal( Items,Tax = 0.18 ):
#   Total=0
#   for i in range(len(Items)):
#       Total=Total+Items[i]['price']*Items[i]['qty']
#   if Total>1000 : Total=Total-100
#   return Total+Total*Tax
# class shopping_cart: pass

# ----- AFTER (PEP 8 + Pythonic) -----
DISCOUNT_LIMIT = 1000
FLAT_DISCOUNT = 100
DEFAULT_TAX = 0.18


class ShoppingCart:
    """A simple cart that stores items as dicts."""

    def __init__(self):
        self.items = []

    def add_item(self, name, price, qty=1):
        self.items.append({"name": name, "price": price, "qty": qty})

    def calculate_total(self, tax=DEFAULT_TAX):
        """Return the total with discount and tax applied."""
        subtotal = sum(item["price"] * item["qty"] for item in self.items)
        if subtotal > DISCOUNT_LIMIT:
            subtotal -= FLAT_DISCOUNT
        return round(subtotal * (1 + tax), 2)


def main():
    cart = ShoppingCart()
    cart.add_item("Keyboard", 700)
    cart.add_item("Mouse", 250, qty=2)
    for index, item in enumerate(cart.items, start=1):
        print(f"{index}. {item['name']:<10} x{item['qty']}  Rs.{item['price']}")
    print("Total:", cart.calculate_total())


if __name__ == "__main__":
    main()
`,
      python: {
        files: {
          "main.py": `# ----- BEFORE (works, but hard to read) -----
# import sys,os
# def CalcTotal( Items,Tax = 0.18 ):
#   Total=0
#   for i in range(len(Items)):
#       Total=Total+Items[i]['price']*Items[i]['qty']
#   if Total>1000 : Total=Total-100
#   return Total+Total*Tax
# class shopping_cart: pass

# ----- AFTER (PEP 8 + Pythonic) -----
DISCOUNT_LIMIT = 1000
FLAT_DISCOUNT = 100
DEFAULT_TAX = 0.18


class ShoppingCart:
    """A simple cart that stores items as dicts."""

    def __init__(self):
        self.items = []

    def add_item(self, name, price, qty=1):
        self.items.append({"name": name, "price": price, "qty": qty})

    def calculate_total(self, tax=DEFAULT_TAX):
        """Return the total with discount and tax applied."""
        subtotal = sum(item["price"] * item["qty"] for item in self.items)
        if subtotal > DISCOUNT_LIMIT:
            subtotal -= FLAT_DISCOUNT
        return round(subtotal * (1 + tax), 2)


def main():
    cart = ShoppingCart()
    cart.add_item("Keyboard", 700)
    cart.add_item("Mouse", 250, qty=2)
    for index, item in enumerate(cart.items, start=1):
        print(f"{index}. {item['name']:<10} x{item['qty']}  Rs.{item['price']}")
    print("Total:", cart.calculate_total())


if __name__ == "__main__":
    main()
`,
        },
      },
      result: `1. Keyboard   x1  Rs.700
2. Mouse      x2  Rs.250
Total: 1298.0`,
      explanation: "The cleaned code uses UPPER_CASE constants instead of magic numbers, a PascalCase class, snake_case methods, 4-space indentation, spaces around operators, docstrings, two blank lines between top-level definitions, enumerate instead of range(len()), a generator with sum(), and a main() guarded by __name__. Subtotal is 700 + 500 = 1200, minus 100 discount = 1100, plus 18% tax = 1298.0. Run black main.py and ruff check main.py to automate this.",
    },
  ],
  interview: [
    {
      q: "Why use logging instead of print?",
      a: "logging supports severity levels, timestamps, module names, multiple destinations (console, files, remote), can be configured or silenced without code changes, and is thread-safe. print is only for simple console output.",
      level: "Easy",
    },
    {
      q: "What are the logging levels in order?",
      a: "DEBUG (10), INFO (20), WARNING (30), ERROR (40), CRITICAL (50). The default root level is WARNING.",
      level: "Easy",
    },
    {
      q: "What is the difference between a logger, a handler and a formatter?",
      a: "A logger is what code calls (getLogger(name)) and filters by level; handlers send records to destinations (console, file, email) with their own levels; formatters define how each record looks.",
      level: "Medium",
    },
    {
      q: "What does logger.exception() do?",
      a: "Logs a message at ERROR level and automatically appends the current exception traceback; it should be called inside an except block.",
      level: "Medium",
    },
    {
      q: "Why is getLogger(__name__) recommended?",
      a: "It creates one logger per module named after the module path, giving a hierarchy that can be configured centrally and showing where each message came from.",
      level: "Medium",
    },
    {
      q: "How do you debug Python code?",
      a: "Read the traceback, reproduce the bug, print/log values (f'{x=}'), use breakpoint()/pdb or IDE breakpoints to step through code and watch variables, and write a failing test for the bug.",
      level: "Easy",
    },
    {
      q: "Name some pdb commands.",
      a: "n (next line), s (step into), c (continue), p expr (print), l (list source), b (breakpoint), w (where/stack), q (quit).",
      level: "Medium",
    },
    {
      q: "What is PEP 8?",
      a: "Python Enhancement Proposal 8 - the official style guide covering indentation, line length, naming, imports, whitespace and comments.",
      level: "Easy",
    },
    {
      q: "What are PEP 8 naming conventions?",
      a: "snake_case for functions, variables and modules; PascalCase for classes; UPPER_SNAKE_CASE for constants; _leading_underscore for internal; __double_leading for name mangling.",
      level: "Easy",
    },
    {
      q: `What is the output?
import logging
logging.info('hello')
print('done')`,
      a: "Only 'done' - the root logger's default level is WARNING, so the INFO message is not shown.",
      level: "Medium",
    },
    {
      q: "What is the difference between a linter and a formatter?",
      a: "A formatter (black, ruff format) rewrites code layout automatically. A linter (flake8, pylint, ruff check) analyses code and reports style issues and possible bugs without changing it.",
      level: "Medium",
    },
    {
      q: "What does PEP 20 (The Zen of Python) say?",
      a: "Guiding principles like 'Beautiful is better than ugly', 'Explicit is better than implicit', 'Simple is better than complex', 'Readability counts'. View it with import this.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Configure logging to write INFO and above to app.log with timestamp, level and message.",
      hint: "logging.basicConfig(filename=..., level=..., format=...)",
      solution: `import logging
logging.basicConfig(filename="app.log", level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(message)s")
logging.info("App started")
logging.debug("hidden")
print(open("app.log").read())
`,
    },
    {
      task: "Wrap a division in try/except and log the error with traceback using logger.exception.",
      hint: "Call it inside except.",
      solution: `import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.INFO)
log = logging.getLogger("calc")
try:
    1 / 0
except ZeroDivisionError:
    log.exception("Division failed")
`,
    },
    {
      task: "Rewrite this to be PEP 8 compliant: def GetMax(L):\\n  m=L[0]\\n  for i in range(len(L)):\\n    if L[i]>m:m=L[i]\\n  return m",
      hint: "snake_case, 4 spaces, spaces around operators, use iteration directly.",
      solution: `def get_max(values):
    """Return the largest value in a non-empty list."""
    largest = values[0]
    for value in values:
        if value > largest:
            largest = value
    return largest
`,
    },
    {
      task: "Find the bug using f'{var=}' prints: a function counting vowels returns 0 for 'APPLE'.",
      hint: "Check case-sensitivity of the comparison.",
      solution: `def count_vowels(text):
    count = 0
    for ch in text.lower():      # fix: lower() the text
        if ch in "aeiou":
            count += 1
    return count
print(count_vowels("APPLE"))   # 2
`,
    },
    {
      task: "Create two module loggers 'app.db' and 'app.api' and show both messages with their names.",
      hint: "Use %(name)s in the format.",
      solution: `import logging, sys
logging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(name)s: %(message)s")
logging.getLogger("app.db").info("connected")
logging.getLogger("app.api").info("GET /users 200")
`,
    },
  ],
  quiz: [
    {
      question: "What is the default level of the root logger?",
      options: [
        "DEBUG",
        "INFO",
        "WARNING",
        "ERROR",
      ],
      answer: 2,
      explanation: "Without configuration, only WARNING and above are shown.",
    },
    {
      question: "Which logging call includes the traceback automatically?",
      options: [
        "logger.exception()",
        "logger.trace()",
        "logger.debug()",
        "logger.stack()",
      ],
      answer: 0,
      explanation: "exception() logs at ERROR level with traceback info.",
    },
    {
      question: "Which function starts the built-in debugger at that line (3.7+)?",
      options: [
        "debug()",
        "pdb()",
        "stop()",
        "breakpoint()",
      ],
      answer: 3,
      explanation: "breakpoint() calls pdb.set_trace() by default.",
    },
    {
      question: "PEP 8 recommends which naming style for classes?",
      options: [
        "snake_case",
        "PascalCase (CapWords)",
        "UPPER_CASE",
        "camelCase",
      ],
      answer: 1,
      explanation: "Class names use CapWords.",
    },
    {
      question: "How many spaces per indentation level does PEP 8 recommend?",
      options: [
        "2",
        "8",
        "4",
        "A tab",
      ],
      answer: 2,
      explanation: "Use 4 spaces per level.",
    },
  ],
};
