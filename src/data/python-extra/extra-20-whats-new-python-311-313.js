export default {
  id: "extra-20-whats-new-python-311-313",
  title: "What's New in Python 3.11, 3.12 and 3.13",
  module: "Module 4: Packaging & Ecosystem",
  extraNo: 20,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Stay current for interviews and real projects. Python 3.11 brought a big speed-up (Faster CPython), exception groups with except*, add_note, tomllib, Self and much better error locations. Python 3.12 added the new type parameter syntax and type statement, @override, f-string freedom (PEP 701), itertools.batched and immortal objects. Python 3.13 added a new interactive REPL, an experimental free-threaded (no-GIL) build and an experimental JIT.",
  objectives: [
    "Explain the Faster CPython work and what makes 3.11+ faster",
    "Use ExceptionGroup, except* and exception notes",
    "Use tomllib, typing.Self, @override and the 3.12 generic syntax",
    "Read the improved error messages with precise locations and suggestions",
    "Describe the free-threaded build (PEP 703), the JIT and the new REPL in 3.13 and their status",
  ],
  theory: [
    {
      heading: "Python Release Cycle and Faster CPython (3.11)",
      content: `Since 3.9, a new Python version is released every **October**, each supported for about 5 years (2 years of bug fixes, then security fixes). Companies usually stay one or two versions behind the newest release, so knowing what changed in 3.11-3.13 is valuable in interviews and when upgrading projects.

Python 3.11 was on average **about 25% faster** than 3.10 (1.1x-1.6x depending on the workload) thanks to the Faster CPython project: a **specializing adaptive interpreter** (PEP 659) that rewrites hot bytecode into type-specialised versions (e.g. a fast path for adding two ints), cheaper and lazily created frame objects, faster function calls (Python-to-Python calls no longer use the C stack), 'zero-cost' exceptions (try blocks cost nothing when no exception is raised) and faster startup.`,
      points: [
        "Upgrading Python is often the cheapest performance win for an app",
        "No code change needed - same Python code runs faster",
        "3.12 and 3.13 continued with smaller gains and groundwork for a JIT",
      ],
    },
    {
      heading: "Exception Groups, except* and Notes (3.11)",
      content: `Sometimes several errors happen at once - for example, concurrent tasks in \`asyncio.TaskGroup\` (also new in 3.11) or validating many form fields. PEP 654 added **ExceptionGroup(message, [exc1, exc2, ...])** to raise them together, and the **except*** syntax to handle each type separately. Each \`except*\` clause receives a (sub)group of matching exceptions; several except* clauses can run for one group, and unhandled ones are re-raised.

PEP 678 added **exc.add_note('extra context')**: notes are stored in \`__notes__\` and shown at the end of the traceback - useful for adding context such as which row or file failed without wrapping the exception.`,
      syntax: `try:
    raise ExceptionGroup("validation failed", [ValueError("bad age"), TypeError("name must be str")])
except* ValueError as eg:
    print("value errors:", eg.exceptions)
except* TypeError as eg:
    print("type errors:", eg.exceptions)
`,
    },
    {
      heading: "Better Error Messages",
      content: "Error messages improved in every release. **3.10** added suggestions ('Did you mean: length?') and clearer SyntaxErrors (e.g. unclosed brackets pointing to the opening bracket). **3.11** added **fine-grained locations**: tracebacks underline the exact sub-expression that failed with `~~~^^^`, so in `order['customer']['address']['city']` you see which lookup hit None. **3.12** suggests missing imports ('Did you forget to import sys?') and `self.` for instance attributes. **3.13** colours tracebacks in the terminal and warns when your script name shadows a standard-library module (e.g. a file called random.py).",
      tip: "Interview tip: if asked 'how do you debug quickly', mention reading the full traceback from the bottom up, the precise ^^^ markers in 3.11+, and the suggestions in NameError/AttributeError messages.",
    },
    {
      heading: "Standard Library and Typing Additions",
      content: `**3.11**: \`tomllib\` (read TOML), \`typing.Self\` (return type of methods returning their own class), \`LiteralString\`, \`TypedDict\` \`Required\`/\`NotRequired\`, variadic generics (\`TypeVarTuple\`, PEP 646), \`asyncio.TaskGroup\` and \`asyncio.timeout()\`, \`datetime.fromisoformat\` accepting most ISO formats, \`enum.StrEnum\`.

**3.12**: PEP 695 type parameter syntax (\`def f[T](x: T) -> T\`, \`class Box[T]\`, \`type Alias = ...\`), \`@typing.override\` (PEP 698) to mark methods that override a parent method, \`itertools.batched\`, \`Path.walk()\`, PEP 701 f-strings (reuse quotes, nesting, comments), per-interpreter GIL (PEP 684, C-API level), immortal objects (PEP 683), \`sys.monitoring\` for faster debuggers/profilers, and removal of the old \`distutils\` module.

**3.13**: \`copy.replace()\`, \`warnings.deprecated\` decorator (PEP 702), \`typing.TypeIs\`, \`ReadOnly\` TypedDict items, type parameter defaults (PEP 696), removal of 19 legacy 'dead battery' modules (cgi, telnetlib, crypt, ...), and iOS/Android as supported platforms.`,
    },
    {
      heading: "Free-threaded Build and the JIT (3.13)",
      content: `The **Global Interpreter Lock (GIL)** lets only one thread run Python bytecode at a time, so CPU-heavy threads do not use multiple cores (multiprocessing is the usual workaround). PEP 703 introduced an **experimental free-threaded build** of CPython 3.13 (\`python3.13t\`) where the GIL can be disabled, allowing true parallel threads. It is a separate build (selected in the installer or with a build flag), single-thread code runs somewhat slower, and C extensions must be updated to support it. In Python 3.14 the free-threaded build became officially supported (PEP 779) but is still not the default.

Python 3.13 also includes an **experimental JIT compiler** (PEP 744, 'copy-and-patch'), disabled by default and enabled only when CPython is built with \`--enable-experimental-jit\`. Performance gains were small at first; it lays the foundation for future speed-ups.`,
      points: [
        "Check at runtime: sys._is_gil_enabled() (3.13+)",
        "Run with GIL disabled: PYTHON_GIL=0 or -X gil=0 on a free-threaded build",
        "Most production code still uses the standard GIL build today",
      ],
    },
    {
      heading: "The New Interactive REPL and Upgrade Tips (3.13)",
      content: `3.13's default interactive shell (based on PyPy's) supports **multi-line editing** with history of whole blocks, **colour** prompts and tracebacks, paste mode (F3), help browsing (F1), and commands like \`exit\` and \`quit\` without parentheses.

Upgrading a project: read the 'What's New' document for removed and deprecated features, run tests with \`-W error::DeprecationWarning\` to surface deprecations, check that all dependencies publish wheels for the new version, test in CI against several versions (a matrix of 3.11, 3.12, 3.13), and update \`requires-python\` and type checker targets. Tools like pyupgrade and ruff (UP rules) can automatically modernise syntax.`,
    },
  ],
  examples: [
    {
      title: "Exception Groups, except* and add_note",
      scenario: "A signup form validator collects all errors at once instead of stopping at the first, then handles each error type separately.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `def validate(user):
    errors = []
    if not isinstance(user.get("name"), str):
        errors.append(TypeError("name must be text"))
    if not 18 <= user.get("age", 0) <= 100:
        errors.append(ValueError(f"age {user.get('age')} out of range"))
    if "@" not in user.get("email", ""):
        e = ValueError("invalid email")
        e.add_note(f"got: {user.get('email')!r}")
        errors.append(e)
    if errors:
        raise ExceptionGroup("signup validation failed", errors)
    return "ok"

print(validate({"name": "Asha", "age": 25, "email": "asha@x.in"}))

try:
    validate({"name": 123, "age": 15, "email": "ravi.example.com"})
except* ValueError as eg:
    print(f"{len(eg.exceptions)} value error(s):")
    for e in eg.exceptions:
        print("  -", e, *getattr(e, "__notes__", []))
except* TypeError as eg:
    print("type error(s):", [str(e) for e in eg.exceptions])

group = ExceptionGroup("batch", [KeyError("a"), ValueError("b"), KeyError("c")])
match_, rest = group.split(KeyError)
print("split ->", [repr(e) for e in match_.exceptions], [repr(e) for e in rest.exceptions])
`,
      python: {
        files: {
          "main.py": `def validate(user):
    errors = []
    if not isinstance(user.get("name"), str):
        errors.append(TypeError("name must be text"))
    if not 18 <= user.get("age", 0) <= 100:
        errors.append(ValueError(f"age {user.get('age')} out of range"))
    if "@" not in user.get("email", ""):
        e = ValueError("invalid email")
        e.add_note(f"got: {user.get('email')!r}")
        errors.append(e)
    if errors:
        raise ExceptionGroup("signup validation failed", errors)
    return "ok"

print(validate({"name": "Asha", "age": 25, "email": "asha@x.in"}))

try:
    validate({"name": 123, "age": 15, "email": "ravi.example.com"})
except* ValueError as eg:
    print(f"{len(eg.exceptions)} value error(s):")
    for e in eg.exceptions:
        print("  -", e, *getattr(e, "__notes__", []))
except* TypeError as eg:
    print("type error(s):", [str(e) for e in eg.exceptions])

group = ExceptionGroup("batch", [KeyError("a"), ValueError("b"), KeyError("c")])
match_, rest = group.split(KeyError)
print("split ->", [repr(e) for e in match_.exceptions], [repr(e) for e in rest.exceptions])
`,
        },
      },
      result: `ok
2 value error(s):
  - age 15 out of range
  - invalid email got: 'ravi.example.com'
type error(s): ['name must be text']
split -> ["KeyError('a')", "KeyError('c')"] ["ValueError('b')"]`,
      explanation: "All validation errors are raised together in one ExceptionGroup. Both except* clauses run: one receives the sub-group of ValueErrors, the other the TypeErrors. add_note attaches context stored in __notes__ (printed here next to the message, and shown in tracebacks). split() divides a group by exception type.",
    },
    {
      title: "Precise Error Locations and Suggestions",
      scenario: "A developer debugs a crash in nested dictionary access and a typo in a variable name. Python 3.11+ tracebacks point to the exact failing part.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import os
import traceback

def city_of(order):
    return order["customer"]["address"]["city"].upper()

try:
    city_of({"customer": {"address": None}})
except TypeError:
    print(traceback.format_exc().replace(os.getcwd() + os.sep, ""))

total_amount = 450
try:
    print(total_amont)
except NameError:
    print(traceback.format_exc().splitlines()[-1])

class Cart:
    def __init__(self):
        self.items = []
try:
    Cart().itmes
except AttributeError:
    print(traceback.format_exc().splitlines()[-1])
`,
      python: {
        files: {
          "main.py": `import os
import traceback

def city_of(order):
    return order["customer"]["address"]["city"].upper()

try:
    city_of({"customer": {"address": None}})
except TypeError:
    print(traceback.format_exc().replace(os.getcwd() + os.sep, ""))

total_amount = 450
try:
    print(total_amont)
except NameError:
    print(traceback.format_exc().splitlines()[-1])

class Cart:
    def __init__(self):
        self.items = []
try:
    Cart().itmes
except AttributeError:
    print(traceback.format_exc().splitlines()[-1])
`,
        },
      },
      result: `Traceback (most recent call last):
  File "main.py", line 8, in <module>
    city_of({"customer": {"address": None}})
  File "main.py", line 5, in city_of
    return order["customer"]["address"]["city"].upper()
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^
TypeError: 'NoneType' object is not subscriptable

NameError: name 'total_amont' is not defined. Did you mean: 'total_amount'?
AttributeError: 'Cart' object has no attribute 'itmes'. Did you mean: 'items'?`,
      explanation: "The ~~~~^^^^ markers (3.11+) show that indexing ['city'] failed because ['address'] returned None. NameError and AttributeError messages include 'Did you mean' suggestions when a similar name exists. (Shown output is from Python 3.12; 3.13 adds colours.)",
    },
    {
      title: "Self, @override, tomllib and the 3.12 Generic Syntax",
      scenario: "A query-builder library uses fluent methods returning Self, marks overridden methods with @override, reads settings from TOML and defines generic helpers with the new syntax.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import tomllib
from typing import Self, override

class Query:
    def __init__(self) -> None:
        self.parts: list[str] = []
    def where(self, cond: str) -> Self:
        self.parts.append(f"WHERE {cond}")
        return self
    def limit(self, n: int) -> Self:
        self.parts.append(f"LIMIT {n}")
        return self
    def sql(self) -> str:
        return "SELECT * FROM users " + " ".join(self.parts)

class AuditedQuery(Query):
    @override
    def sql(self) -> str:
        return "/* audited */ " + super().sql()

print(AuditedQuery().where("age > 18").limit(10).sql())
print(getattr(AuditedQuery.sql, "__override__", False))

cfg = tomllib.loads('[db]\\nhost = "localhost"\\nport = 5432\\npool = [5, 20]')
print(cfg["db"]["host"], cfg["db"]["port"], cfg["db"]["pool"])

type Matrix[T] = list[list[T]]

def first_row[T](m: Matrix[T]) -> list[T]:
    return m[0]

print(first_row([[1, 2], [3, 4]]), Matrix.__name__, first_row.__type_params__)
`,
      python: {
        files: {
          "main.py": `import tomllib
from typing import Self, override

class Query:
    def __init__(self) -> None:
        self.parts: list[str] = []
    def where(self, cond: str) -> Self:
        self.parts.append(f"WHERE {cond}")
        return self
    def limit(self, n: int) -> Self:
        self.parts.append(f"LIMIT {n}")
        return self
    def sql(self) -> str:
        return "SELECT * FROM users " + " ".join(self.parts)

class AuditedQuery(Query):
    @override
    def sql(self) -> str:
        return "/* audited */ " + super().sql()

print(AuditedQuery().where("age > 18").limit(10).sql())
print(getattr(AuditedQuery.sql, "__override__", False))

cfg = tomllib.loads('[db]\\nhost = "localhost"\\nport = 5432\\npool = [5, 20]')
print(cfg["db"]["host"], cfg["db"]["port"], cfg["db"]["pool"])

type Matrix[T] = list[list[T]]

def first_row[T](m: Matrix[T]) -> list[T]:
    return m[0]

print(first_row([[1, 2], [3, 4]]), Matrix.__name__, first_row.__type_params__)
`,
        },
      },
      result: `/* audited */ SELECT * FROM users WHERE age > 18 LIMIT 10
True
localhost 5432 [5, 20]
[1, 2] Matrix (T,)`,
      explanation: "Self (3.11) means 'an instance of the current class', so AuditedQuery().where(...) is typed as AuditedQuery, not Query. @override (3.12) lets type checkers error if the parent method is renamed. tomllib (3.11) reads TOML. The type statement and [T] syntax (3.12) define generic aliases and functions without TypeVar.",
    },
    {
      title: "Small 3.12 Conveniences: batched, Path.walk and f-strings",
      scenario: "A data job sends records in batches, scans a folder tree, and builds log messages with nested quotes - all with 3.12 features.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from itertools import batched
from pathlib import Path
import shutil

ids = list(range(1, 11))
for batch in batched(ids, 4):
    print("insert", batch)

root = Path("walk_demo")
(root / "logs" / "2025").mkdir(parents=True, exist_ok=True)
(root / "logs" / "app.log").write_text("x")
(root / "logs" / "2025" / "jan.log").write_text("y")
for dirpath, dirnames, filenames in root.walk():
    dirnames.sort()
    print(dirpath.as_posix(), sorted(filenames))
shutil.rmtree(root)

user = {"name": "Asha", "roles": ["admin", "dev"]}
print(f"User {user["name"]} has roles: {", ".join(user["roles"])}")
print(f"{f"{f"{3.14159:.2f}"}"}")
print(f"{
    user["name"].upper()  # comments and line breaks allowed in 3.12
}")
`,
      python: {
        files: {
          "main.py": `from itertools import batched
from pathlib import Path
import shutil

ids = list(range(1, 11))
for batch in batched(ids, 4):
    print("insert", batch)

root = Path("walk_demo")
(root / "logs" / "2025").mkdir(parents=True, exist_ok=True)
(root / "logs" / "app.log").write_text("x")
(root / "logs" / "2025" / "jan.log").write_text("y")
for dirpath, dirnames, filenames in root.walk():
    dirnames.sort()
    print(dirpath.as_posix(), sorted(filenames))
shutil.rmtree(root)

user = {"name": "Asha", "roles": ["admin", "dev"]}
print(f"User {user["name"]} has roles: {", ".join(user["roles"])}")
print(f"{f"{f"{3.14159:.2f}"}"}")
print(f"{
    user["name"].upper()  # comments and line breaks allowed in 3.12
}")
`,
        },
      },
      result: `insert (1, 2, 3, 4)
insert (5, 6, 7, 8)
insert (9, 10)
walk_demo []
walk_demo/logs ['app.log']
walk_demo/logs/2025 ['jan.log']
User Asha has roles: admin, dev
3.14
ASHA`,
      explanation: "itertools.batched (3.12) yields tuples of up to n items. Path.walk (3.12) is the pathlib version of os.walk. PEP 701 (3.12) lets f-strings reuse the same quote type inside braces, nest f-strings and contain multi-line expressions with comments - all SyntaxErrors in 3.11.",
    },
    {
      title: "Checking Version Features and the GIL at Runtime",
      scenario: "A library supports several Python versions and must check which features exist, including whether it runs on a free-threaded build.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys
import sysconfig

v = sys.version_info
print(f"Running Python {v.major}.{v.minor}")

features = {
    "tomllib (3.11)": v >= (3, 11),
    "ExceptionGroup (3.11)": "ExceptionGroup" in vars(__import__("builtins")),
    "type statement (3.12)": v >= (3, 12),
    "itertools.batched (3.12)": hasattr(__import__("itertools"), "batched"),
    "copy.replace (3.13)": hasattr(__import__("copy"), "replace"),
    "sys._is_gil_enabled (3.13)": hasattr(sys, "_is_gil_enabled"),
}
for name, ok in features.items():
    print(f"  {name:<28} {'yes' if ok else 'no'}")

free_threaded_build = bool(sysconfig.get_config_var("Py_GIL_DISABLED"))
gil_enabled = sys._is_gil_enabled() if hasattr(sys, "_is_gil_enabled") else True
print("free-threaded build:", free_threaded_build, "| GIL enabled:", gil_enabled)

try:
    import tomllib
except ModuleNotFoundError:
    import tomli as tomllib
print("TOML parser module:", tomllib.__name__)
`,
      python: {
        files: {
          "main.py": `import sys
import sysconfig

v = sys.version_info
print(f"Running Python {v.major}.{v.minor}")

features = {
    "tomllib (3.11)": v >= (3, 11),
    "ExceptionGroup (3.11)": "ExceptionGroup" in vars(__import__("builtins")),
    "type statement (3.12)": v >= (3, 12),
    "itertools.batched (3.12)": hasattr(__import__("itertools"), "batched"),
    "copy.replace (3.13)": hasattr(__import__("copy"), "replace"),
    "sys._is_gil_enabled (3.13)": hasattr(sys, "_is_gil_enabled"),
}
for name, ok in features.items():
    print(f"  {name:<28} {'yes' if ok else 'no'}")

free_threaded_build = bool(sysconfig.get_config_var("Py_GIL_DISABLED"))
gil_enabled = sys._is_gil_enabled() if hasattr(sys, "_is_gil_enabled") else True
print("free-threaded build:", free_threaded_build, "| GIL enabled:", gil_enabled)

try:
    import tomllib
except ModuleNotFoundError:
    import tomli as tomllib
print("TOML parser module:", tomllib.__name__)
`,
        },
      },
      result: `Running Python 3.12
  tomllib (3.11)               yes
  ExceptionGroup (3.11)        yes
  type statement (3.12)        yes
  itertools.batched (3.12)     yes
  copy.replace (3.13)          no
  sys._is_gil_enabled (3.13)   no
free-threaded build: False | GIL enabled: True
TOML parser module: tomllib`,
      explanation: "Libraries use sys.version_info and hasattr checks to enable features conditionally, and the try/except import pattern to fall back to the tomli backport on 3.10. Py_GIL_DISABLED is set only on free-threaded builds; sys._is_gil_enabled() exists from 3.13. The output shown is from a standard Python 3.12 build - on 3.13 the last two feature rows say yes.",
    },
  ],
  interview: [
    {
      q: "Why was Python 3.11 significantly faster?",
      a: "The Faster CPython project: a specializing adaptive interpreter (PEP 659) that replaces generic bytecode with type-specialised versions at runtime, lazily created and cheaper frames, inlined Python-to-Python calls, zero-cost exception handling and faster startup. On average about 25% faster than 3.10 with no code changes.",
      level: "Medium",
    },
    {
      q: "What is an ExceptionGroup and when is it used?",
      a: "A built-in (3.11, PEP 654) exception that wraps multiple exceptions raised together - e.g. failures from concurrent tasks in asyncio.TaskGroup, or multiple validation errors. Handle it with except*, or inspect .exceptions, .split() and .subgroup().",
      level: "Medium",
    },
    {
      q: "How does except* differ from except?",
      a: "except matches the whole exception once and only one clause runs. except* matches the exceptions inside an ExceptionGroup: each clause receives the sub-group of matching exceptions, multiple clauses can run for the same group, and unmatched exceptions are re-raised in a new group. You cannot mix except and except* in one try.",
      level: "Hard",
    },
    {
      q: "What is exception add_note?",
      a: "BaseException.add_note(str) (3.11, PEP 678) attaches extra text to an exception, stored in __notes__ and printed after the message in tracebacks. Useful to add context (which file/row/user) while re-raising the original exception.",
      level: "Medium",
    },
    {
      q: "What is typing.Self?",
      a: "Introduced in 3.11 (PEP 673), Self annotates methods that return an instance of their own class (fluent builders, classmethod constructors, copy methods). Unlike annotating with the class name, it stays correct for subclasses.",
      level: "Medium",
    },
    {
      q: "What changed with f-strings in Python 3.12?",
      a: "PEP 701 formalised f-strings in the PEG grammar: you can reuse the enclosing quote type inside expressions, use backslashes and comments, write multi-line expressions, and nest f-strings arbitrarily. Error messages for f-strings also became precise.",
      level: "Medium",
    },
    {
      q: "Explain the 3.12 type parameter syntax.",
      a: "PEP 695 adds `def func[T](x: T) -> T`, `class Box[T]:`, bounds `[T: Base]`, constraints `[T: (int, str)]`, `[*Ts]` and `[**P]`, plus the `type Name[T] = ...` statement for lazily evaluated type aliases. It removes the need to declare TypeVar objects and scopes type params correctly.",
      level: "Hard",
    },
    {
      q: "What is the GIL and what changed in 3.13?",
      a: "The Global Interpreter Lock lets only one thread execute Python bytecode at a time, preventing true CPU parallelism with threads. 3.13 ships an experimental free-threaded build (PEP 703, python3.13t) where the GIL can be disabled; it requires compatible C extensions and has some single-thread overhead. In 3.14 the free-threaded build moved to officially supported status, but the default build still has the GIL.",
      level: "Hard",
    },
    {
      q: "Does Python 3.13 have a JIT?",
      a: "It includes an experimental copy-and-patch JIT (PEP 744) that is off by default and must be enabled at build time (--enable-experimental-jit). Early speed-ups were modest; it is groundwork for future optimisations.",
      level: "Hard",
    },
    {
      q: "What are immortal objects (3.12)?",
      a: "PEP 683 made certain objects such as None, True, False, small integers and some interned strings immortal: their reference count is fixed and never changes, so they are never deallocated. This reduces memory writes and is important for per-interpreter GIL and free-threading.",
      level: "Hard",
    },
    {
      q: "What improvements to error messages came in 3.10-3.13?",
      a: "3.10: 'Did you mean' suggestions and better SyntaxErrors. 3.11: fine-grained ~~~^^^ locations in tracebacks. 3.12: suggestions for missing imports and missing self., better messages for common syntax mistakes. 3.13: coloured tracebacks and warnings when a local file shadows a stdlib module.",
      level: "Easy",
    },
    {
      q: "How would you upgrade a production app from Python 3.10 to 3.12?",
      a: "Read What's New for removals (e.g. distutils gone in 3.12), check every dependency supports 3.12 and has wheels, run the test suite under 3.12 in CI with deprecation warnings as errors, fix issues, update Docker base images and requires-python, deploy to staging, monitor performance and errors, then roll out. Keep a CI matrix if you support several versions.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write `process_files(names)` that tries to 'process' each file name (raise ValueError for names without '.csv' and FileNotFoundError for names starting with 'missing'). Collect all errors and raise an ExceptionGroup. Handle it with two except* clauses.",
      hint: "Append exceptions to a list inside the loop and raise ExceptionGroup at the end if the list is not empty.",
      solution: `def process_files(names):
    errors = []
    for n in names:
        try:
            if not n.endswith(".csv"):
                raise ValueError(f"{n}: not a CSV")
            if n.startswith("missing"):
                raise FileNotFoundError(f"{n}: not found")
            print("processed", n)
        except (ValueError, FileNotFoundError) as e:
            errors.append(e)
    if errors:
        raise ExceptionGroup("some files failed", errors)

try:
    process_files(["sales.csv", "notes.txt", "missing.csv", "stock.csv"])
except* ValueError as eg:
    print("Format problems:", [str(e) for e in eg.exceptions])
except* FileNotFoundError as eg:
    print("Missing files:", [str(e) for e in eg.exceptions])
`,
    },
    {
      task: "Re-raise an exception with context: parse a list of strings to int; when one fails, add a note with its index and value using add_note, then re-raise. Catch it outside and print the message and notes.",
      hint: "except ValueError as e: e.add_note(...); raise",
      solution: `def parse_all(values):
    result = []
    for i, v in enumerate(values):
        try:
            result.append(int(v))
        except ValueError as e:
            e.add_note(f"while parsing item #{i}: {v!r}")
            raise
    return result

try:
    parse_all(["10", "20", "3O", "40"])
except ValueError as e:
    print("Error:", e)
    print("Notes:", e.__notes__)
`,
    },
    {
      task: "Create a `Config` class with a classmethod `from_toml(text) -> Self` that uses tomllib, and a method `with_debug(flag) -> Self` that returns a modified copy. Use the 3.12 f-string feature to print values.",
      hint: "Use copy.copy(self) inside with_debug and cls(**data['app']) in from_toml.",
      solution: `import copy
import tomllib
from typing import Self

class Config:
    def __init__(self, name: str, debug: bool = False) -> None:
        self.name = name
        self.debug = debug

    @classmethod
    def from_toml(cls, text: str) -> Self:
        return cls(**tomllib.loads(text)["app"])

    def with_debug(self, flag: bool) -> Self:
        new = copy.copy(self)
        new.debug = flag
        return new

cfg = Config.from_toml('[app]\\nname = "shop"\\ndebug = false')
dev = cfg.with_debug(True)
info = {"name": cfg.name}
print(f"{info["name"]}: prod debug={cfg.debug}, dev debug={dev.debug}")
`,
    },
    {
      task: "Write a script that prints which of these features are available in the running interpreter: match-case (3.10), tomllib (3.11), itertools.batched (3.12), copy.replace (3.13), free-threading support (3.13t).",
      hint: "Compare sys.version_info and use hasattr / importlib.util.find_spec.",
      solution: `import sys
import importlib.util
import itertools
import copy
import sysconfig

checks = [
    ("match-case", sys.version_info >= (3, 10)),
    ("tomllib", importlib.util.find_spec("tomllib") is not None),
    ("itertools.batched", hasattr(itertools, "batched")),
    ("copy.replace", hasattr(copy, "replace")),
    ("free-threaded build", bool(sysconfig.get_config_var("Py_GIL_DISABLED"))),
]
for name, ok in checks:
    print(f"{name:<20} {'available' if ok else 'not available'}")
`,
    },
  ],
  quiz: [
    {
      question: "Which syntax handles exceptions inside an ExceptionGroup by type?",
      options: [
        "except+",
        "except*",
        "except[]",
        "catch group",
      ],
      answer: 1,
      explanation: "except* (PEP 654, Python 3.11) matches exceptions inside a group.",
    },
    {
      question: "Which module was added in 3.11 to read TOML files?",
      options: [
        "toml",
        "tomli",
        "tomllib",
        "configparser",
      ],
      answer: 2,
      explanation: "tomllib is the standard-library TOML reader since 3.11.",
    },
    {
      question: "What does typing.Self annotate?",
      options: [
        "The module",
        "A method returning an instance of its own class",
        "Static methods only",
        "The metaclass",
      ],
      answer: 1,
      explanation: "Self refers to the type of the current instance, correct for subclasses too.",
    },
    {
      question: "Which Python version introduced `def f[T](x: T) -> T` syntax?",
      options: [
        "3.10",
        "3.11",
        "3.12",
        "3.13",
      ],
      answer: 2,
      explanation: "PEP 695 type parameter syntax arrived in 3.12.",
    },
    {
      question: "In Python 3.13, the free-threaded build is...",
      options: [
        "The default build",
        "An experimental separate build where the GIL can be disabled",
        "Removed",
        "Only for Windows",
      ],
      answer: 1,
      explanation: "PEP 703's free-threaded CPython is an optional experimental build in 3.13.",
    },
    {
      question: "Roughly how much faster was 3.11 than 3.10 on average?",
      options: [
        "2%",
        "About 25%",
        "10x",
        "No change",
      ],
      answer: 1,
      explanation: "The Faster CPython work gave about a 1.25x average speed-up.",
    },
  ],
};
