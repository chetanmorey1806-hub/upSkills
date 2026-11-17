export default {
  id: "day-36-context-managers",
  title: "Context Managers (with, __enter__/__exit__, contextlib)",
  module: "Module 6: Advanced Python",
  day: 36,
  level: "Advanced",
  duration: "2 hours",
  summary: "Learn how the with statement guarantees setup and cleanup of resources, build your own context managers with __enter__/__exit__ and @contextmanager, and use helpers from contextlib like suppress and ExitStack.",
  objectives: [
    "Explain why context managers are needed for resources like files, locks and database connections",
    "Describe exactly what the with statement does step by step",
    "Write class-based context managers using __enter__ and __exit__",
    "Handle and optionally suppress exceptions inside __exit__",
    "Write generator-based context managers with contextlib.contextmanager and use suppress, redirect_stdout and ExitStack",
  ],
  theory: [
    {
      heading: "The Problem: Forgetting to Clean Up",
      content: "Many resources must be released after use: files must be closed, database connections returned, locks released, temporary settings restored. If an error happens in the middle, the cleanup line may never run. Using try/finally fixes it, but it is long. A context manager packages setup and cleanup together. Analogy: a hotel key card - you get the room when you check in (enter), and the room is cleaned and released when you check out (exit), even if you leave in a hurry.",
      syntax: `# Without with
f = open("data.txt", "w")
try:
    f.write("hello")
finally:
    f.close()

# With a context manager
with open("data.txt", "w") as f:
    f.write("hello")       # file closes automatically
`,
    },
    {
      heading: "How the with Statement Works",
      content: "with EXPR as VAR: does the following. 1) Evaluates EXPR to get the context manager object. 2) Calls its __enter__() and assigns the return value to VAR. 3) Runs the block. 4) Always calls __exit__(exc_type, exc_value, traceback) - with None values if there was no error, or the exception details if there was one. 5) If __exit__ returns True, the exception is suppressed; otherwise it continues to propagate.",
      points: [
        "__enter__ return value is what you get after as",
        "__exit__ runs even on exceptions, return or break",
        "Multiple managers: with open('a') as a, open('b') as b:",
        "Python 3.10+ allows parentheses around multiple managers",
      ],
    },
    {
      heading: "Class-Based Context Managers",
      content: "Write a class with __enter__ and __exit__. Use it when you need state or reusable objects, such as a database connection class or a timer.",
      syntax: `class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.start
        return False          # do not suppress errors
`,
      tip: "Return False (or None) from __exit__ unless you really want to hide the error. Silently swallowing exceptions makes bugs hard to find.",
    },
    {
      heading: "contextlib.contextmanager",
      content: "For simple cases, write a generator function and decorate it with @contextmanager. Code before yield is the setup (__enter__), the yielded value is bound to as, and code after yield is the cleanup (__exit__). Wrap yield in try/finally so cleanup runs even when the block raises an error.",
      syntax: `from contextlib import contextmanager

@contextmanager
def opened(path):
    f = open(path)
    try:
        yield f            # value for 'as'
    finally:
        f.close()          # always runs
`,
    },
    {
      heading: "Other contextlib Helpers",
      content: "contextlib has ready-made managers. suppress(*exceptions) ignores listed exceptions. redirect_stdout(file) temporarily sends print output elsewhere. closing(obj) calls obj.close() at the end. nullcontext() is a do-nothing manager for optional cases. ExitStack manages a dynamic number of context managers, e.g. opening a list of files.",
      points: [
        "with suppress(FileNotFoundError): os.remove('tmp.txt')",
        "with redirect_stdout(buffer): print('captured')",
        "threading.Lock, decimal.localcontext, unittest.mock.patch and sqlite3 connections are context managers too",
      ],
    },
    {
      heading: "Real-World Uses and Common Mistakes",
      content: "Context managers are used for files, database transactions (commit or rollback), locks in multithreading, temporary directory changes, timing code blocks, and mocking in tests. Common mistakes: using the file object after the with block (it is closed), forgetting try/finally around yield in @contextmanager, and returning True from __exit__ by accident.",
      points: [
        "f.read() after with -> ValueError: I/O operation on closed file",
        "sqlite3 connection as context manager commits or rolls back, but does NOT close",
      ],
    },
  ],
  examples: [
    {
      title: "with vs try/finally for Files",
      scenario: "Write and read a file safely, and prove the file is closed afterwards even after an error.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `with open("notes.txt", "w") as f:
    f.write("line 1\\nline 2\\n")
    print("inside with, closed?", f.closed)
print("after with, closed?", f.closed)

with open("notes.txt") as f:
    print(f.read().splitlines())

try:
    with open("notes.txt") as f:
        first = f.readline()
        raise ValueError("something went wrong")
except ValueError as e:
    print("Error:", e, "| file closed?", f.closed)

try:
    f.read()
except ValueError as e:
    print("Using closed file:", e)

with open("a.txt", "w") as a, open("b.txt", "w") as b:
    a.write("A"); b.write("B")
print(open("a.txt").read() + open("b.txt").read())
`,
      python: {
        files: {
          "main.py": `with open("notes.txt", "w") as f:
    f.write("line 1\\nline 2\\n")
    print("inside with, closed?", f.closed)
print("after with, closed?", f.closed)

with open("notes.txt") as f:
    print(f.read().splitlines())

try:
    with open("notes.txt") as f:
        first = f.readline()
        raise ValueError("something went wrong")
except ValueError as e:
    print("Error:", e, "| file closed?", f.closed)

try:
    f.read()
except ValueError as e:
    print("Using closed file:", e)

with open("a.txt", "w") as a, open("b.txt", "w") as b:
    a.write("A"); b.write("B")
print(open("a.txt").read() + open("b.txt").read())
`,
        },
      },
      result: `inside with, closed? False
after with, closed? True
['line 1', 'line 2']
Error: something went wrong | file closed? True
Using closed file: I/O operation on closed file.
AB`,
      explanation: "The file is open inside the block and closed automatically afterwards. Even when ValueError is raised in the block, __exit__ closes the file before the exception reaches except. Reading a closed file raises ValueError. Two managers can be opened in a single with line.",
    },
    {
      title: "Class-Based Context Manager: Tracing __enter__ and __exit__",
      scenario: "Build a manager that shows the exact order of __enter__ and __exit__ calls and what __exit__ receives.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Trace:
    def __init__(self, name, suppress=False):
        self.name = name
        self.suppress = suppress

    def __enter__(self):
        print(f"[{self.name}] __enter__")
        return f"resource-{self.name}"

    def __exit__(self, exc_type, exc_value, tb):
        print(f"[{self.name}] __exit__ type={exc_type.__name__ if exc_type else None} value={exc_value}")
        return self.suppress           # True hides the exception

with Trace("A") as res:
    print("  working with", res)

try:
    with Trace("B") as res:
        print("  about to fail")
        1 / 0
        print("  never printed")
except ZeroDivisionError:
    print("  caught outside: ZeroDivisionError")

with Trace("C", suppress=True):
    int("abc")
print("program continues after C")
`,
      python: {
        files: {
          "main.py": `class Trace:
    def __init__(self, name, suppress=False):
        self.name = name
        self.suppress = suppress

    def __enter__(self):
        print(f"[{self.name}] __enter__")
        return f"resource-{self.name}"

    def __exit__(self, exc_type, exc_value, tb):
        print(f"[{self.name}] __exit__ type={exc_type.__name__ if exc_type else None} value={exc_value}")
        return self.suppress           # True hides the exception

with Trace("A") as res:
    print("  working with", res)

try:
    with Trace("B") as res:
        print("  about to fail")
        1 / 0
        print("  never printed")
except ZeroDivisionError:
    print("  caught outside: ZeroDivisionError")

with Trace("C", suppress=True):
    int("abc")
print("program continues after C")
`,
        },
      },
      result: `[A] __enter__
  working with resource-A
[A] __exit__ type=None value=None
[B] __enter__
  about to fail
[B] __exit__ type=ZeroDivisionError value=division by zero
  caught outside: ZeroDivisionError
[C] __enter__
[C] __exit__ type=ValueError value=invalid literal for int() with base 10: 'abc'
program continues after C`,
      explanation: "__enter__'s return value is bound to res. On normal exit, __exit__ receives None values. In B the ZeroDivisionError is passed to __exit__, which returns False, so it propagates to the outer except. In C, __exit__ returns True, so the ValueError is suppressed and the program continues.",
    },
    {
      title: "@contextmanager: Temporary Settings and Database Transaction",
      scenario: "Temporarily change a setting and run a database transaction that commits on success and rolls back on error.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from contextlib import contextmanager
import sqlite3

settings = {"debug": False}

@contextmanager
def temp_setting(key, value):
    old = settings[key]
    settings[key] = value
    try:
        yield settings
    finally:
        settings[key] = old

with temp_setting("debug", True) as s:
    print("inside:", s)
print("outside:", settings)

@contextmanager
def transaction(conn):
    cur = conn.cursor()
    try:
        yield cur
        conn.commit()
        print("COMMIT")
    except Exception as e:
        conn.rollback()
        print("ROLLBACK because:", e)

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE acc(name TEXT, bal INT)")
conn.execute("INSERT INTO acc VALUES ('asha', 1000), ('ravi', 500)")
conn.commit()

with transaction(conn) as cur:
    cur.execute("UPDATE acc SET bal = bal - 200 WHERE name='asha'")
    cur.execute("UPDATE acc SET bal = bal + 200 WHERE name='ravi'")

with transaction(conn) as cur:
    cur.execute("UPDATE acc SET bal = bal - 5000 WHERE name='asha'")
    raise ValueError("insufficient balance")

print(conn.execute("SELECT * FROM acc").fetchall())
conn.close()
`,
      python: {
        files: {
          "main.py": `from contextlib import contextmanager
import sqlite3

settings = {"debug": False}

@contextmanager
def temp_setting(key, value):
    old = settings[key]
    settings[key] = value
    try:
        yield settings
    finally:
        settings[key] = old

with temp_setting("debug", True) as s:
    print("inside:", s)
print("outside:", settings)

@contextmanager
def transaction(conn):
    cur = conn.cursor()
    try:
        yield cur
        conn.commit()
        print("COMMIT")
    except Exception as e:
        conn.rollback()
        print("ROLLBACK because:", e)

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE acc(name TEXT, bal INT)")
conn.execute("INSERT INTO acc VALUES ('asha', 1000), ('ravi', 500)")
conn.commit()

with transaction(conn) as cur:
    cur.execute("UPDATE acc SET bal = bal - 200 WHERE name='asha'")
    cur.execute("UPDATE acc SET bal = bal + 200 WHERE name='ravi'")

with transaction(conn) as cur:
    cur.execute("UPDATE acc SET bal = bal - 5000 WHERE name='asha'")
    raise ValueError("insufficient balance")

print(conn.execute("SELECT * FROM acc").fetchall())
conn.close()
`,
        },
      },
      result: `inside: {'debug': True}
outside: {'debug': False}
COMMIT
ROLLBACK because: insufficient balance
[('asha', 800), ('ravi', 700)]`,
      explanation: "Code before yield is setup and code after yield is cleanup; try/finally guarantees the setting is restored. In the transaction manager, a successful block commits. In the second block an error is raised, so we roll back - the -5000 update is undone and the balances stay 800 and 700. Because the except block does not re-raise, the error is handled inside the manager.",
    },
    {
      title: "contextlib Helpers: suppress, redirect_stdout, ExitStack",
      scenario: "Delete an optional temp file without errors, capture printed output, and open a dynamic list of files.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import os, io
from contextlib import suppress, redirect_stdout, ExitStack

with suppress(FileNotFoundError):
    os.remove("does_not_exist.tmp")
print("no crash with suppress")

buffer = io.StringIO()
with redirect_stdout(buffer):
    print("this goes into the buffer")
    print("so does this")
print("captured:", buffer.getvalue().splitlines())

names = ["f1.txt", "f2.txt", "f3.txt"]
with ExitStack() as stack:
    files = [stack.enter_context(open(n, "w")) for n in names]
    for i, fh in enumerate(files, 1):
        fh.write(f"file number {i}")
    print("all open:", all(not fh.closed for fh in files))
print("all closed:", all(fh.closed for fh in files))
print([open(n).read() for n in names])
`,
      python: {
        files: {
          "main.py": `import os, io
from contextlib import suppress, redirect_stdout, ExitStack

with suppress(FileNotFoundError):
    os.remove("does_not_exist.tmp")
print("no crash with suppress")

buffer = io.StringIO()
with redirect_stdout(buffer):
    print("this goes into the buffer")
    print("so does this")
print("captured:", buffer.getvalue().splitlines())

names = ["f1.txt", "f2.txt", "f3.txt"]
with ExitStack() as stack:
    files = [stack.enter_context(open(n, "w")) for n in names]
    for i, fh in enumerate(files, 1):
        fh.write(f"file number {i}")
    print("all open:", all(not fh.closed for fh in files))
print("all closed:", all(fh.closed for fh in files))
print([open(n).read() for n in names])
`,
        },
      },
      result: `no crash with suppress
captured: ['this goes into the buffer', 'so does this']
all open: True
all closed: True
['file number 1', 'file number 2', 'file number 3']`,
      explanation: "suppress ignores FileNotFoundError, replacing a try/except/pass. redirect_stdout sends print output into a StringIO buffer temporarily. ExitStack lets us enter any number of context managers and closes them all together when the with block ends.",
    },
  ],
  interview: [
    {
      q: "What is a context manager?",
      a: "An object that defines __enter__ and __exit__ to set up and clean up a resource around a block of code used with the with statement.",
      level: "Easy",
    },
    {
      q: "What does __exit__ receive and what does its return value mean?",
      a: "exc_type, exc_value and traceback (all None if no exception). Returning a truthy value suppresses the exception; returning False/None lets it propagate.",
      level: "Medium",
    },
    {
      q: "What is the advantage of with over try/finally?",
      a: "Cleaner, reusable code that guarantees cleanup; the setup and teardown logic is written once inside the manager instead of in every caller.",
      level: "Easy",
    },
    {
      q: "How does @contextmanager work?",
      a: "It turns a generator function into a context manager: code before yield runs on enter, the yielded value is bound to as, and code after yield runs on exit. Exceptions from the block are re-raised at the yield point.",
      level: "Medium",
    },
    {
      q: "Why put yield inside try/finally in @contextmanager?",
      a: "If the with block raises, the exception is thrown into the generator at the yield. Without finally, the cleanup code after yield would be skipped.",
      level: "Hard",
    },
    {
      q: "Name built-in objects that are context managers.",
      a: "File objects, threading.Lock/RLock, sqlite3 connections, decimal.localcontext, tempfile.TemporaryDirectory, zipfile.ZipFile, unittest.mock.patch, contextlib.suppress.",
      level: "Easy",
    },
    {
      q: "What is ExitStack?",
      a: "A context manager from contextlib that can enter a variable number of other context managers or callbacks and exits all of them in reverse order.",
      level: "Hard",
    },
    {
      q: `What is the output?
class C:
    def __enter__(self): return 5
    def __exit__(self, *a): print('bye')
with C() as x:
    print(x)`,
      a: "5 then bye - x is the return value of __enter__, and __exit__ runs after the block.",
      level: "Easy",
    },
    {
      q: `What is the output?
class C:
    def __enter__(self): return self
    def __exit__(self, *a): return True
with C():
    raise KeyError('k')
print('ok')`,
      a: "ok - __exit__ returns True, so the KeyError is suppressed.",
      level: "Medium",
    },
    {
      q: "Does with sqlite3.connect(...) as conn close the connection?",
      a: "No. sqlite3 connection's context manager commits on success or rolls back on error, but does not close. Call conn.close() or use contextlib.closing.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Write a class-based context manager ChangeDir that changes the working directory and restores it afterwards.",
      hint: "Save os.getcwd() in __enter__, os.chdir back in __exit__.",
      solution: `import os
class ChangeDir:
    def __init__(self, path): self.path = path
    def __enter__(self):
        self.old = os.getcwd()
        os.chdir(self.path)
    def __exit__(self, *exc):
        os.chdir(self.old)
os.makedirs("sub", exist_ok=True)
with ChangeDir("sub"):
    print(os.path.basename(os.getcwd()))   # sub
`,
    },
    {
      task: "Write a @contextmanager tag(name) that prints <name> before and </name> after the block.",
      hint: "print before and after yield.",
      solution: `from contextlib import contextmanager
@contextmanager
def tag(name):
    print(f"<{name}>")
    try:
        yield
    finally:
        print(f"</{name}>")
with tag("h1"):
    print("Title")
`,
    },
    {
      task: "Create a Timer context manager that stores elapsed time in .elapsed.",
      hint: "time.perf_counter in __enter__ and __exit__.",
      solution: `import time
class Timer:
    def __enter__(self):
        self.t = time.perf_counter(); return self
    def __exit__(self, *exc):
        self.elapsed = time.perf_counter() - self.t
with Timer() as t:
    sum(range(10**6))
print(t.elapsed > 0)   # True
`,
    },
    {
      task: "Use suppress to convert a list of strings to ints, skipping invalid ones.",
      hint: "with suppress(ValueError): inside the loop.",
      solution: `from contextlib import suppress
nums = []
for s in ["1", "x", "3"]:
    with suppress(ValueError):
        nums.append(int(s))
print(nums)   # [1, 3]
`,
    },
    {
      task: "Capture the output of a printing function into a string using redirect_stdout.",
      hint: "Use io.StringIO.",
      solution: `import io
from contextlib import redirect_stdout
def report(): print("Total: 100")
buf = io.StringIO()
with redirect_stdout(buf):
    report()
print(repr(buf.getvalue()))   # 'Total: 100\\n'
`,
    },
  ],
  quiz: [
    {
      question: "Which two methods make a class a context manager?",
      options: [
        "__init__ and __del__",
        "__open__ and __close__",
        "__enter__ and __exit__",
        "__start__ and __stop__",
      ],
      answer: 2,
      explanation: "The with protocol uses __enter__ and __exit__.",
    },
    {
      question: "What value is bound to the variable after 'as'?",
      options: [
        "The return value of __enter__",
        "The context manager object always",
        "None",
        "The return value of __exit__",
      ],
      answer: 0,
      explanation: "with X() as v: v = X().__enter__().",
    },
    {
      question: "If __exit__ returns True when an exception occurred:",
      options: [
        "The program crashes",
        "The exception is suppressed",
        "The block is re-run",
        "__enter__ is called again",
      ],
      answer: 1,
      explanation: "A truthy return suppresses the exception.",
    },
    {
      question: "In a @contextmanager generator, cleanup code should be placed:",
      options: [
        "Before yield",
        "In __init__",
        "In a separate function",
        "After yield inside finally",
      ],
      answer: 3,
      explanation: "finally guarantees cleanup even if the block raises.",
    },
    {
      question: "Which helper ignores specified exceptions?",
      options: [
        "contextlib.ignore",
        "contextlib.suppress",
        "contextlib.closing",
        "contextlib.nullcontext",
      ],
      answer: 1,
      explanation: "suppress(*exceptions) silently ignores them.",
    },
  ],
};
